// Raport z Google Search Console przez API (konto serwisowe).
//
// Wymaga zmiennej środowiskowej GSC_KEY_JSON_B64 — klucz JSON konta
// serwisowego zakodowany base64 (ustawiany w środowisku Claude, NIE w repo).
// Konto serwisowe musi być dodane jako użytkownik usługi w Search Console.
//
// Użycie:
//   node scripts/gsc-raport.mjs --test            # sam test połączenia (lista usług)
//   node scripts/gsc-raport.mjs                   # raport 7 dni: frazy + podstrony
//   node scripts/gsc-raport.mjs --dni 28          # inny zakres
//
// Wyjście raportu: JSON na stdout (frazy, strony, sumy) — do użycia przez
// Kontrolera (raport tygodnia) i agenta SEO. Dane GSC mają ~2 dni opóźnienia.

import crypto from 'node:crypto';

const USLUGA = 'sc-domain:tylkoklocki.pl';
const ZAKRES = 'https://www.googleapis.com/auth/webmasters.readonly';

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

async function api(t, sciezka, body) {
  const url = `https://www.googleapis.com/webmasters/v3/${sciezka}`;
  const odp = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${t}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const dane = await odp.json().catch(() => ({}));
  if (!odp.ok) throw new Error(`${sciezka}: ${odp.status} ${JSON.stringify(dane)}`);
  return dane;
}

const k = klucz();
const t = await token(k);

if (process.argv.includes('--test')) {
  const uslugi = await api(t, 'sites');
  const lista = (uslugi.siteEntry ?? []).map((s) => `${s.siteUrl} (${s.permissionLevel})`);
  console.log('POŁĄCZENIE OK. Konto:', k.client_email);
  console.log('Usługi widoczne dla konta:', lista.length ? lista.join(', ') : 'ŻADNA — dodaj konto serwisowe w GSC: Ustawienia -> Użytkownicy i uprawnienia');
  process.exit(lista.some((l) => l.includes('tylkoklocki')) ? 0 : 1);
}

const dni = Number(process.argv[process.argv.indexOf('--dni') + 1]) || 7;
const koniec = new Date(Date.now() - 2 * 86400e3); // GSC ma ~2 dni opóźnienia
const start = new Date(koniec.getTime() - dni * 86400e3);
const fmt = (d) => d.toISOString().slice(0, 10);

const zapytanie = (dimensions) => api(t, `sites/${encodeURIComponent(USLUGA)}/searchAnalytics/query`, {
  startDate: fmt(start), endDate: fmt(koniec), dimensions, rowLimit: 100,
});

const [frazy, strony, total] = await Promise.all([
  zapytanie(['query']), zapytanie(['page']), zapytanie([]),
]);

console.log(JSON.stringify({
  zakres: { od: fmt(start), do: fmt(koniec) },
  suma: total.rows?.[0] ?? { clicks: 0, impressions: 0 },
  frazy: (frazy.rows ?? []).map((r) => ({ fraza: r.keys[0], kliki: r.clicks, wyswietlenia: r.impressions, ctr: +(r.ctr * 100).toFixed(2), pozycja: +r.position.toFixed(1) })),
  strony: (strony.rows ?? []).map((r) => ({ strona: r.keys[0], kliki: r.clicks, wyswietlenia: r.impressions, ctr: +(r.ctr * 100).toFixed(2), pozycja: +r.position.toFixed(1) })),
}, null, 1));
