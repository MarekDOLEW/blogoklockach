// Audyt kontenera Google Tag Manager przez API (konto serwisowe).
//
// Używa tej samej zmiennej GSC_KEY_JSON_B64 co gsc-raport.mjs — klucz JSON
// konta serwisowego zakodowany base64 (ustawiany w środowisku Claude, NIE w repo).
// Konto serwisowe musi być dodane w GTM: Administracja -> Zarządzanie dostępem
// -> dodaj e-mail konta z uprawnieniem "Odczyt" (konto i kontener).
// W projekcie GCP musi być włączone: Tag Manager API.
//
// Użycie:
//   node scripts/gtm-raport.mjs --test    # test: lista kont/kontenerów widocznych dla konta
//   node scripts/gtm-raport.mjs           # audyt: tagi, reguły i zmienne opublikowanej wersji
//
// Wyjście audytu: JSON na stdout — do weryfikacji, czy tagi (GA4, afiliacje)
// są wpięte i opublikowane.

import crypto from 'node:crypto';

const ZAKRES = 'https://www.googleapis.com/auth/tagmanager.readonly';

function klucz() {
  const b64 = process.env.GSC_KEY_JSON_B64;
  if (!b64) {
    console.error('BRAK zmiennej GSC_KEY_JSON_B64 w środowisku.');
    process.exit(2);
  }
  try {
    return JSON.parse(Buffer.from(b64.trim(), 'base64').toString('utf8'));
  } catch (e) {
    console.error('GSC_KEY_JSON_B64 nie dekoduje się do poprawnego JSON:', e.message);
    process.exit(2);
  }
}

function b64url(dane) {
  return Buffer.from(dane).toString('base64url');
}

async function token(k) {
  const teraz = Math.floor(Date.now() / 1000);
  const naglowek = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const tresc = b64url(JSON.stringify({
    iss: k.client_email,
    scope: ZAKRES,
    aud: 'https://oauth2.googleapis.com/token',
    iat: teraz,
    exp: teraz + 3600,
  }));
  const podpis = crypto.sign('RSA-SHA256', Buffer.from(`${naglowek}.${tresc}`), k.private_key);
  const jwt = `${naglowek}.${tresc}.${podpis.toString('base64url')}`;

  const odp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const dane = await odp.json();
  if (!odp.ok) throw new Error(`Token: ${odp.status} ${JSON.stringify(dane)}`);
  return dane.access_token;
}

async function api(t, sciezka) {
  const url = `https://tagmanager.googleapis.com/tagmanager/v2/${sciezka}`;
  const odp = await fetch(url, { headers: { authorization: `Bearer ${t}` } });
  const dane = await odp.json().catch(() => ({}));
  if (!odp.ok) throw new Error(`${sciezka}: ${odp.status} ${JSON.stringify(dane)}`);
  return dane;
}

// Konta i kontenery GTM widoczne dla konta serwisowego.
async function kontenery(t) {
  const konta = (await api(t, 'accounts')).account ?? [];
  const wynik = [];
  for (const a of konta) {
    const kont = (await api(t, `${a.path}/containers`)).container ?? [];
    for (const c of kont) {
      wynik.push({ path: c.path, publicId: c.publicId, nazwa: c.name, konto: a.name });
    }
  }
  return wynik;
}

const k = klucz();
const t = await token(k);

if (process.argv.includes('--test')) {
  const lista = await kontenery(t);
  console.log('POŁĄCZENIE OK. Konto:', k.client_email);
  console.log('Kontenery GTM widoczne dla konta:', lista.length
    ? lista.map((c) => `${c.nazwa} (${c.publicId}, konto: ${c.konto})`).join(', ')
    : 'ŻADEN — dodaj konto serwisowe w GTM: Administracja -> Zarządzanie dostępem (uprawnienie: Odczyt)');
  process.exit(lista.length ? 0 : 1);
}

const lista = await kontenery(t);
if (!lista.length) {
  console.error('Konto serwisowe nie widzi żadnego kontenera GTM — dodaj je w GTM (Administracja -> Zarządzanie dostępem).');
  process.exit(1);
}
const kontener = lista.find((c) => /tylkoklocki/i.test(c.nazwa)) ?? lista[0];

const wersja = await api(t, `${kontener.path}/versions:live`);

console.log(JSON.stringify({
  kontener: { nazwa: kontener.nazwa, publicId: kontener.publicId },
  wersja: { numer: wersja.containerVersionId, nazwa: wersja.name ?? null },
  tagi: (wersja.tag ?? []).map((x) => ({ nazwa: x.name, typ: x.type, wstrzymany: x.paused ?? false })),
  reguly: (wersja.trigger ?? []).map((x) => ({ nazwa: x.name, typ: x.type })),
  zmienne: (wersja.variable ?? []).map((x) => ({ nazwa: x.name, typ: x.type })),
}, null, 1));
