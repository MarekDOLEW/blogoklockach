// Raport z Google Analytics 4 przez API (konto serwisowe).
//
// Używa tej samej zmiennej GSC_KEY_JSON_B64 co gsc-raport.mjs — klucz JSON
// konta serwisowego zakodowany base64 (ustawiany w środowisku Claude, NIE w repo).
// Konto serwisowe musi być dodane w GA4: Administracja -> Zarządzanie dostępem
// do usługi -> dodaj e-mail konta z rolą "Przeglądający".
// W projekcie GCP muszą być włączone: Google Analytics Data API
// oraz Google Analytics Admin API (do --test i autodetekcji usługi).
//
// Użycie:
//   node scripts/ga4-raport.mjs --test              # test: lista usług GA4 widocznych dla konta
//   node scripts/ga4-raport.mjs                     # raport 7 dni (usługa wykrywana automatycznie)
//   node scripts/ga4-raport.mjs --dni 28            # inny zakres
//   node scripts/ga4-raport.mjs --property 123456   # jawny numer usługi GA4
//
// Wyjście raportu: JSON na stdout (użytkownicy, sesje, strony, źródła) — do
// użycia przez Kontrolera (raport tygodnia) i agenta SEO.

import crypto from 'node:crypto';

const ZAKRES = 'https://www.googleapis.com/auth/analytics.readonly';

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

async function api(t, url, body) {
  const odp = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${t}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const dane = await odp.json().catch(() => ({}));
  if (!odp.ok) throw new Error(`${url}: ${odp.status} ${JSON.stringify(dane)}`);
  return dane;
}

// Lista usług GA4 widocznych dla konta serwisowego (Admin API).
async function uslugi(t) {
  const dane = await api(t, 'https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200');
  return (dane.accountSummaries ?? []).flatMap((a) =>
    (a.propertySummaries ?? []).map((p) => ({
      property: p.property, // "properties/123456"
      nazwa: p.displayName,
      konto: a.displayName,
    })));
}

const k = klucz();
const t = await token(k);

if (process.argv.includes('--test')) {
  const lista = await uslugi(t);
  console.log('POŁĄCZENIE OK. Konto:', k.client_email);
  console.log('Usługi GA4 widoczne dla konta:', lista.length
    ? lista.map((p) => `${p.nazwa} (${p.property}, konto: ${p.konto})`).join(', ')
    : 'ŻADNA — dodaj konto serwisowe w GA4: Administracja -> Zarządzanie dostępem do usługi (rola: Przeglądający)');
  process.exit(lista.length ? 0 : 1);
}

let property;
const iProp = process.argv.indexOf('--property');
if (iProp !== -1) {
  property = `properties/${String(process.argv[iProp + 1]).replace(/^properties\//, '')}`;
} else {
  const lista = await uslugi(t);
  if (!lista.length) {
    console.error('Konto serwisowe nie widzi żadnej usługi GA4 — dodaj je w GA4 (Administracja -> Zarządzanie dostępem do usługi) albo podaj --property.');
    process.exit(1);
  }
  property = (lista.find((p) => /tylkoklocki/i.test(p.nazwa)) ?? lista[0]).property;
}

const dni = Number(process.argv[process.argv.indexOf('--dni') + 1]) || 7;
const zapytanie = (obiekt) => api(t, `https://analyticsdata.googleapis.com/v1beta/${property}:runReport`, {
  dateRanges: [{ startDate: `${dni}daysAgo`, endDate: 'today' }],
  limit: 100,
  ...obiekt,
});

const metryki = ['activeUsers', 'sessions', 'screenPageViews', 'averageSessionDuration'].map((m) => ({ name: m }));

const [suma, strony, zrodla] = await Promise.all([
  zapytanie({ metrics: metryki }),
  zapytanie({ metrics: metryki, dimensions: [{ name: 'pagePath' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }] }),
  zapytanie({ metrics: metryki, dimensions: [{ name: 'sessionSourceMedium' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] }),
]);

const wiersz = (r, klucze) => ({
  ...(klucze ? { [klucze]: r.dimensionValues[0].value } : {}),
  uzytkownicy: +r.metricValues[0].value,
  sesje: +r.metricValues[1].value,
  odslony: +r.metricValues[2].value,
  srCzasSesjiSek: +(+r.metricValues[3].value).toFixed(0),
});

console.log(JSON.stringify({
  usluga: property,
  zakres: { ostatnieDni: dni },
  suma: suma.rows?.length ? wiersz(suma.rows[0]) : { uzytkownicy: 0, sesje: 0, odslony: 0, srCzasSesjiSek: 0 },
  strony: (strony.rows ?? []).map((r) => wiersz(r, 'strona')),
  zrodla: (zrodla.rows ?? []).map((r) => wiersz(r, 'zrodlo')),
}, null, 1));
