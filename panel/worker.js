// Worker panelu tylkoklocki.pl (panel.tylkoklocki.pl) — osobny od serwisu
// (src/worker.js): awaria panelu nie dotyka strony.
//
// 1. Każde żądanie przechodzi przez sprawdzenie tokenu Cloudflare Access
//    (nagłówek Cf-Access-Jwt-Assertion, podpis RS256 z certyfikatów zespołu,
//    aud = ACCESS_AUD). Bez skonfigurowanego Access panel nie odpowiada nikomu
//    — zamknięty domyślnie, także gdy ktoś trafi pod adres *.workers.dev.
// 2. /api/wgraj zapisuje pliki do R2 (kubełek serwisu, prywatny prefiks
//    _panel/wplywy/ — trasa /img/ serwisu takich kluczy nie wydaje). Pliki
//    odbiera automat skrzynki tekstów (scripts/panel-wplywy.mjs).
// 3. Reszta to strony z panel/dist (build: node panel/build.mjs).

const PREFIKS = '_panel/wplywy/';
const ROZSZERZENIA = /\.(zip|md|docx|doc|pdf|jpe?g|png|webp)$/i;
const MAX_PLIK = 25 * 1024 * 1024;
const MAX_PLIKOW = 30;

const NAGLOWKI = {
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow',
  'cache-control': 'private, no-store',
};

const odpJson = (dane, status = 200) => new Response(JSON.stringify(dane), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...NAGLOWKI } });
const odpTekst = (t, status) => new Response(t, { status, headers: { 'content-type': 'text/plain; charset=utf-8', ...NAGLOWKI } });

// ── Cloudflare Access ──
let certy = { klucze: null, wazneDo: 0 };
async function kluczeAccess(zespol) {
  if (certy.klucze && Date.now() < certy.wazneDo) return certy.klucze;
  const r = await fetch(`https://${zespol}.cloudflareaccess.com/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error(`certs ${r.status}`);
  const { keys } = await r.json();
  certy = { klucze: keys, wazneDo: Date.now() + 3600e3 };
  return keys;
}

const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));

async function uzytkownik(request, env) {
  if (!env.ACCESS_TEAM || !env.ACCESS_AUD) return { blad: 'Panel czeka na konfigurację Cloudflare Access (ACCESS_TEAM, ACCESS_AUD).', status: 503 };
  const token = request.headers.get('cf-access-jwt-assertion');
  if (!token) return { blad: 'Brak logowania Cloudflare Access.', status: 401 };
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return { blad: 'Zły token.', status: 401 };
  try {
    const naglowek = JSON.parse(new TextDecoder().decode(b64url(h)));
    const dane = JSON.parse(new TextDecoder().decode(b64url(p)));
    const jwk = (await kluczeAccess(env.ACCESS_TEAM)).find((k) => k.kid === naglowek.kid);
    if (!jwk || naglowek.alg !== 'RS256') return { blad: 'Nieznany klucz tokenu.', status: 401 };
    const klucz = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', klucz, b64url(s), new TextEncoder().encode(`${h}.${p}`));
    const aud = Array.isArray(dane.aud) ? dane.aud : [dane.aud];
    if (!ok || !aud.includes(env.ACCESS_AUD) || !(dane.exp * 1000 > Date.now())) return { blad: 'Token nieważny.', status: 401 };
    const email = String(dane.email ?? '').toLowerCase();
    // Druga zapora poza polityką Access: lista adresów w zmiennej DOZWOLENI (jeśli ustawiona)
    const lista = String(env.DOZWOLENI ?? '').toLowerCase().split(',').map((x) => x.trim()).filter(Boolean);
    if (lista.length && !lista.includes(email)) return { blad: 'Ten adres nie ma dostępu do panelu.', status: 403 };
    return { email };
  } catch (e) {
    return { blad: `Nie udało się sprawdzić logowania (${e.message}).`, status: 401 };
  }
}

// ── pliki ──
const bezpiecznaNazwa = (n) => String(n).split(/[\\/]/).pop().normalize('NFC').replace(/[^\p{L}\p{N} ._()–-]+/gu, '_').replace(/^\.+/, '').slice(0, 150) || 'plik';

function nowyId() {
  const t = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
  const los = [...crypto.getRandomValues(new Uint8Array(3))].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${t}-${los}`;
}

async function wgraj(request, env, kto) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return odpJson({ blad: 'Żądanie spoza panelu.' }, 403);
  let form;
  try {
    form = await request.formData();
  } catch {
    return odpJson({ blad: 'To nie jest formularz z plikami.' }, 400);
  }
  const pliki = form.getAll('pliki').filter((f) => typeof f === 'object' && f.size > 0);
  if (!pliki.length) return odpJson({ blad: 'Brak plików.' }, 400);
  if (pliki.length > MAX_PLIKOW) return odpJson({ blad: `Najwyżej ${MAX_PLIKOW} plików naraz.` }, 400);
  for (const f of pliki) {
    if (!ROZSZERZENIA.test(f.name)) return odpJson({ blad: `Plik „${f.name}” ma nieobsługiwany format (dozwolone: zip, md, docx, doc, pdf, jpg, png, webp).` }, 400);
    if (f.size > MAX_PLIK) return odpJson({ blad: `Plik „${f.name}” ma ponad 25 MB.` }, 400);
  }
  const id = nowyId();
  const zapisane = [];
  const uzyte = new Set();
  for (const f of pliki) {
    let nazwa = bezpiecznaNazwa(f.name);
    while (uzyte.has(nazwa)) nazwa = `_${nazwa}`;
    uzyte.add(nazwa);
    const klucz = `${PREFIKS}${id}/pliki/${nazwa}`;
    await env.OBRAZY.put(klucz, f.stream(), { httpMetadata: { contentType: f.type || 'application/octet-stream' } });
    zapisane.push({ nazwa, klucz, rozmiar: f.size, typ: f.type });
  }
  const meta = { id, kiedy: new Date().toISOString(), kto, notka: String(form.get('notka') ?? '').slice(0, 500), pliki: zapisane };
  await env.OBRAZY.put(`${PREFIKS}${id}/meta.json`, JSON.stringify(meta), { httpMetadata: { contentType: 'application/json' } });
  return odpJson({ ok: true, id, pliki: zapisane.length });
}

async function wgrane(env) {
  const ids = [];
  let kursor;
  do {
    const l = await env.OBRAZY.list({ prefix: PREFIKS, delimiter: '/', cursor: kursor });
    ids.push(...l.delimitedPrefixes.map((p) => p.slice(PREFIKS.length, -1)));
    kursor = l.truncated ? l.cursor : undefined;
  } while (kursor);
  const ostatnie = ids.sort().reverse().slice(0, 50);
  const wpisy = await Promise.all(ostatnie.map(async (id) => {
    const [m, w] = await Promise.all([env.OBRAZY.get(`${PREFIKS}${id}/meta.json`), env.OBRAZY.get(`${PREFIKS}${id}/wynik.json`)]);
    if (!m) return null;
    const meta = await m.json();
    const wynik = w ? await w.json() : null;
    return { id, kiedy: meta.kiedy, kto: meta.kto, notka: meta.notka, pliki: meta.pliki.map((p) => ({ nazwa: p.nazwa, rozmiar: p.rozmiar })), stan: wynik?.stan ?? 'czeka', linki: wynik?.linki ?? [], problemy: wynik?.problemy ?? [] };
  }));
  return odpJson({ wpisy: wpisy.filter(Boolean) });
}

export default {
  async fetch(request, env) {
    const kto = await uzytkownik(request, env);
    if (kto.blad) return odpTekst(kto.blad, kto.status);
    const { pathname } = new URL(request.url);

    if (pathname === '/api/ja') return odpJson({ email: kto.email });
    if (pathname === '/api/wgraj') return request.method === 'POST' ? wgraj(request, env, kto.email) : odpJson({ blad: 'Tylko POST.' }, 405);
    if (pathname === '/api/wgrane') return wgrane(env);
    if (pathname.startsWith('/api/')) return odpJson({ blad: 'Nie ma takiej ścieżki.' }, 404);

    const odp = await env.ASSETS.fetch(request);
    const naglowki = new Headers(odp.headers);
    for (const [k, v] of Object.entries(NAGLOWKI)) naglowki.set(k, v);
    return new Response(odp.body, { status: odp.status, headers: naglowki });
  },
};
