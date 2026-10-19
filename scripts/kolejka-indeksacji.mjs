#!/usr/bin/env node
// Dzienna kolejka „Poproś o zindeksowanie" dla Search Console.
//
// Po co (14.10.2026): ~3 200 adresów czeka w GSC na indeksację, głównie
// „Wykryta – obecnie niezindeksowana" i „Google nie zna adresu". Ręczna prośba
// o zindeksowanie działa (24.09: pięć stron sezonowych, 30.09: x-kom WSR i 31163
// — wszystkie w indeksie po kilku dniach), ale ma dzienny limit ok. 10 adresów
// na usługę i NIE ma jej w API: URL Inspection API tylko czyta stan, a Indexing
// API Google dopuszcza wyłącznie oferty pracy i transmisje wideo (inne użycie
// = ryzyko odebrania dostępu). Kliknąć musi więc człowiek albo Cowork
// w przeglądarce Marka. Ten skrypt robi resztę: sprawdza stan w API
// i wybiera adresy, na których prośba da najwięcej.
//
// Kolejność (od najcenniejszych): strona główna i listingi działów → artykuły
// i prezentowniki → strony serii → deale z ostatnich 7 dni → nowości →
// huby zestawów (więcej sklepów z ofertą = wyżej). Pomija adresy zindeksowane,
// strony z noindex w obecnym buildzie i adresy zgłoszone w ciągu 14 dni —
// chyba że Google nie odwiedził adresu od dnia, w którym trafił do kolejki.
// Zgłoszony adres Google skanuje w kilka minut (14.10: 10 z 10 tego samego dnia),
// więc brak wizyty znaczy, że Cowork go nie kliknął (15.10: 9 z 10, 17.10: 6 z 7).
// Taki adres wraca do kolejki następnego dnia i idzie przed nowymi (19.10.2026).
// „Strona zeskanowana, ale niezindeksowana" idzie na koniec — Google już ją
// widział i odrzucił; prośba rzadko to zmienia, lepiej poprawić treść.
//
// HUBY DZIAŁÓW (decyzja Marka 19.10.2026): w poniedziałek pierwsze miejsca
// w kolejce dostają listingi działów, które SĄ w indeksie, ale Google nie
// odwiedził ich od co najmniej 14 dni (19.10: /serie/ i /wycofania/ stały na
// 15.09, 34 dni — czyli w indeksie wisiała wersja sprzed poprawek tytułów z 30.09).
// „Poproś o zindeksowanie" działa też dla strony zaindeksowanej: wymusza nowy
// crawl. Poza poniedziałkiem (albo bez `--dzialy`) huby działów nie wchodzą —
// zwykła reguła pomija każdy PASS, więc nie zjadają miejsc hubom zestawów.
//
// Wymaga GSC_KEY_JSON_B64 i świeżego `npm run build` (czyta dist/sitemap-*.xml
// i meta robots z dist). Limit API: 2 000 sprawdzeń dziennie na usługę —
// domyślnie zużywamy najwyżej 300.
//
// Użycie:
//   node scripts/kolejka-indeksacji.mjs                 # 15 adresów, zapis kolejki
//   node scripts/kolejka-indeksacji.mjs --ile 12 --api 400
//   node scripts/kolejka-indeksacji.mjs --sucho         # bez zapisu kolejki i historii
//   node scripts/kolejka-indeksacji.mjs --dzialy        # huby działów ze starym crawlem także poza poniedziałkiem
//
// Wynik: materialy/indeksacja/kolejka.md (lista na dziś + instrukcja dla
// Coworka) i materialy/indeksacja/historia.json (co i kiedy trafiło do kolejki).

import crypto from 'node:crypto';
import fs from 'node:fs';

const args = process.argv.slice(2);
const opcja = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
// 15 od 19.10.2026: przy 10 adresach Cowork nie trafiał na limit GSC; gdy trafi,
// reszta listy wraca następnego dnia (patrz ponowne zgłoszenia niżej).
const ILE = Number(opcja('ile', 15));
const BUDZET_API = Number(opcja('api', 300));
const sucho = args.includes('--sucho');
const KARENCJA_DNI = 14;
// Listingi działów odświeżane w poniedziałek, gdy crawl ma >= STARY_CRAWL_DNI.
// Osiem adresów, kolejność = waga dla serwisu (decyzja Marka 19.10.2026).
const DZIALY = ['/wycofania/', '/serie/', '/promocje-lego/', '/ekskluzywne/', '/przecieki/', '/prezentowniki/', '/aktualnosci/', '/artykuly/'];
const STARY_CRAWL_DNI = 14;
const MIEJSC_DLA_DZIALOW = 8;
const SITE = 'https://tylkoklocki.pl';
const KATALOG = 'materialy/indeksacja';
const HISTORIA = `${KATALOG}/historia.json`;
const KOLEJKA = `${KATALOG}/kolejka.md`;
// Data polska, nie UTC: runner startuje o 01:57 PL, czyli jeszcze „wczoraj” w UTC,
// a Cowork o 10:24 sprawdza, czy nagłówek kolejki ma dzisiejszą datę (15.10.2026
// pierwsza lista wyszła z datą 14.10 i zostałaby uznana za nieaktualną).
const dzis = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());
// `dzis` to data kalendarzowa PL (YYYY-MM-DD); Date.parse daje północ UTC tej daty,
// więc getUTCDay() oddaje właściwy dzień tygodnia bez przesunięć strefy.
const poniedzialek = new Date(Date.parse(dzis)).getUTCDay() === 1;
const dzialyDzis = poniedzialek || args.includes('--dzialy');

if (!process.env.GSC_KEY_JSON_B64) {
  console.error('Brak GSC_KEY_JSON_B64 — nie sprawdzę stanu w Search Console.');
  process.exit(2);
}
if (!fs.existsSync('dist/sitemap-index.xml')) {
  console.error('Brak dist/ — najpierw `npm run build`.');
  process.exit(2);
}

// ── kandydaci z sitemap ──
const wpisy = [];
for (const plik of fs.readdirSync('dist').filter((f) => /^sitemap-.*\.xml$/.test(f) && f !== 'sitemap-index.xml')) {
  const xml = fs.readFileSync(`dist/${plik}`, 'utf8');
  for (const m of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g))
    wpisy.push({ url: m[1], lastmod: m[2] ?? null, mapa: plik });
}

const feed = JSON.parse(fs.readFileSync('src/data/oferty_feed.json', 'utf8')).sety ?? {};
const sklepow = (nr) => Object.keys(feed[nr]?.oferty ?? {}).filter((s) => s !== 'ceneo').length;
const dniOd = (d) => (d ? (Date.now() - Date.parse(d)) / 864e5 : Infinity);

function klasa(w) {
  const sciezka = w.url.replace(SITE, '');
  if (w.mapa === 'sitemap-inne.xml' || sciezka === '/') return [0, 0];
  if (w.mapa === 'sitemap-artykuly.xml') return [1, 0];
  if (w.mapa === 'sitemap-prezentowniki.xml') return [1, 1];
  if (w.mapa === 'sitemap-serie.xml') return [2, 0];
  if (w.mapa === 'sitemap-deale.xml') return dniOd(w.lastmod) <= 7 ? [3, 0] : [9, 0];
  if (w.mapa === 'sitemap-nowosci.xml') return [4, 0];
  const nr = /\/zestaw\/([^/]+)\//.exec(sciezka)?.[1];
  if (nr) return [5, -sklepow(nr)];
  return [6, 0];
}

function noindex(url) {
  const sciezka = url.replace(SITE, '').replace(/^\//, '');
  const plik = `dist/${sciezka}index.html`;
  if (!fs.existsSync(plik)) return true; // nie ma strony w buildzie — nie zgłaszamy
  const html = fs.readFileSync(plik, 'utf8').slice(0, 20000);
  return /<meta name="robots" content="[^"]*noindex/.test(html);
}

const historia = fs.existsSync(HISTORIA) ? JSON.parse(fs.readFileSync(HISTORIA, 'utf8')) : { _meta: {}, zgloszenia: {} };
const ostatnio = new Map();
for (const [data, lista] of Object.entries(historia.zgloszenia)) for (const u of lista) ostatnio.set(u, data);

// `ponowka` = data, z którą adres stoi w historii w okresie karencji (nie dzisiejsza).
// Wpuszczamy go do przeglądu; o tym, czy wraca, rozstrzyga data ostatniego crawla.
const kandydaci = wpisy
  .map((w) => {
    const d = ostatnio.get(w.url);
    return { ...w, k: klasa(w), ponowka: d && d !== dzis && dniOd(d) < KARENCJA_DNI ? d : null };
  })
  .filter((w) => w.k[0] < 9 && (w.ponowka || !(dniOd(ostatnio.get(w.url)) < KARENCJA_DNI)))
  .sort((a, b) => Boolean(b.ponowka) - Boolean(a.ponowka) || a.k[0] - b.k[0] || a.k[1] - b.k[1] || a.url.localeCompare(b.url));

// ── Search Console: token konta serwisowego ──
const klucz = JSON.parse(Buffer.from(process.env.GSC_KEY_JSON_B64, 'base64').toString());
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const teraz = Math.floor(Date.now() / 1000);
const naglowek = b64({ alg: 'RS256', typ: 'JWT' });
const tresc = b64({ iss: klucz.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: teraz, exp: teraz + 3600 });
const podpis = crypto.createSign('RSA-SHA256').update(`${naglowek}.${tresc}`).sign(klucz.private_key).toString('base64url');
const token = (await (await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${naglowek}.${tresc}.${podpis}` }),
})).json()).access_token;
if (!token) {
  console.error('Search Console nie wydał tokenu — sprawdź klucz konta serwisowego.');
  process.exit(2);
}

async function stan(url) {
  const r = await (await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: 'sc-domain:tylkoklocki.pl' }),
  })).json();
  if (r.error) throw new Error(`${r.error.code} ${r.error.message}`);
  const x = r.inspectionResult?.indexStatusResult ?? {};
  return { verdict: x.verdict, stan: x.coverageState ?? '?', crawl: x.lastCrawlTime ?? null };
}

// ── przegląd w kolejności priorytetu ──
const DO_ZGLOSZENIA = /Discovered|unknown to Google|noindex|Duplicate|Alternate/i; // noindex = stary odczyt, w buildzie już go nie ma
const wybrane = [];
const zeskanowane = [];
const licznik = {};
let wywolan = 0;
let ponowione = 0;
let odswiezane = 0;

// ── huby działów (poniedziałek albo --dzialy): odświeżenie starego crawla ──
// Osobno od `kandydaci`, bo tamta lista wyrzuca PASS i pilnuje karencji; tu
// rozstrzyga wyłącznie wiek crawla — hub zgłoszony tydzień temu i nadal
// nieodwiedzony ma wrócić, hub odwiedzony po zgłoszeniu ma zniknąć.
if (dzialyDzis) {
  const adresy = DZIALY.map((p) => `${SITE}${p}`).filter((u) => !noindex(u));
  const wyniki = await Promise.allSettled(adresy.map((u) => stan(u)));
  wyniki.forEach((r, j) => {
    if (r.status === 'rejected') { console.error(`API (hub działu ${adresy[j]}): ${String(r.reason?.message ?? r.reason).slice(0, 160)}`); return; }
    wywolan += 1;
    const s = r.value;
    licznik[s.stan] = (licznik[s.stan] ?? 0) + 1;
    const wiek = dniOd(s.crawl);
    if (odswiezane >= MIEJSC_DLA_DZIALOW) return;
    if (s.verdict === 'PASS' && wiek < STARY_CRAWL_DNI) return; // świeży crawl — nic do odświeżania
    odswiezane += 1;
    wybrane.push({ url: adresy[j], lastmod: null, mapa: 'dzialy', k: [0, 0], ponowka: null, ...s, odswiezenie: true, wiekCrawla: Number.isFinite(wiek) ? Math.floor(wiek) : null });
  });
}
// Jedno sprawdzenie trwa ok. 7 s, więc pytamy po 5 adresów naraz; kolejność
// priorytetu zostaje, bo partie idą po kolei.
const juz = new Set(wybrane.map((w) => w.url));
const doSprawdzenia = kandydaci.filter((w) => !juz.has(w.url) && !noindex(w.url));
for (let i = 0; i < doSprawdzenia.length && wybrane.length < ILE && wywolan < BUDZET_API; i += 5) {
  const partia = doSprawdzenia.slice(i, Math.min(i + 5, i + BUDZET_API - wywolan));
  const wyniki = await Promise.allSettled(partia.map((w) => stan(w.url)));
  const blad = wyniki.find((r) => r.status === 'rejected');
  if (blad) {
    console.error(`API: ${String(blad.reason?.message ?? blad.reason).slice(0, 160)} — przerywam przegląd.`);
    break;
  }
  wyniki.forEach((r, j) => {
    const s = r.value;
    const w = partia[j];
    wywolan += 1;
    licznik[s.stan] = (licznik[s.stan] ?? 0) + 1;
    if (s.verdict === 'PASS' || wybrane.length >= ILE) return;
    if (w.ponowka) {
      // Google był po zgłoszeniu i nie wziął strony — prośba nic nie zmieni, czeka karencję.
      if (s.crawl && s.crawl.slice(0, 10) >= w.ponowka) return;
      ponowione += 1;
      wybrane.push({ ...w, ...s });
      return;
    }
    if (DO_ZGLOSZENIA.test(s.stan)) wybrane.push({ ...w, ...s });
    else if (/Crawled/i.test(s.stan)) zeskanowane.push({ ...w, ...s });
  });
}
// zeskanowane-niezindeksowane tylko na dopełnienie listy
for (const z of zeskanowane) if (wybrane.length < ILE) wybrane.push(z);

const NAZWY = ['strona główna / listing', 'artykuł / prezentownik', 'seria', 'deal', 'nowości', 'hub zestawu', 'inne'];
console.log(`Sprawdzone w API: ${wywolan} (budżet ${BUDZET_API}). Stany: ${Object.entries(licznik).map(([k, v]) => `${k}: ${v}`).join('; ')}`);
console.log(`Do zgłoszenia dziś: ${wybrane.length} (w tym ponownie, bez wizyty Google od zgłoszenia: ${ponowione}; huby działów do odświeżenia crawla: ${odswiezane})`);
for (const w of wybrane) console.log(`  ${w.url}  — ${w.stan}, ${w.odswiezenie ? 'hub działu, ODŚWIEŻENIE' : NAZWY[w.k[0]] ?? '?'}, ostatni crawl: ${w.crawl?.slice(0, 10) ?? 'nigdy'}`);

if (sucho) process.exit(0);

fs.mkdirSync(KATALOG, { recursive: true });
historia._meta = {
  opis: 'Adresy, które scripts/kolejka-indeksacji.mjs dał do „Poproś o zindeksowanie" w GSC, według dnia. Skrypt nie wybiera ponownie adresu przez 14 dni, chyba że Google go od tego dnia nie odwiedził (wtedy wraca następnego dnia). Plik generowany — nie edytować ręcznie.',
  zaktualizowano: dzis,
};
if (wybrane.length) historia.zgloszenia[dzis] = [...new Set([...(historia.zgloszenia[dzis] ?? []), ...wybrane.map((w) => w.url)])];
fs.writeFileSync(HISTORIA, `${JSON.stringify(historia, null, 1)}\n`);

const md = [
  `# Kolejka „Poproś o zindeksowanie" — ${dzis}`,
  '',
  'Plik generowany przez `scripts/kolejka-indeksacji.mjs` — nie edytować ręcznie.',
  '',
  '## Instrukcja (Cowork albo Marek)',
  '',
  'Search Console → usługa `tylkoklocki.pl` → pole „Sprawdź dowolny URL” na górze. Dla każdego adresu',
  'z listy, po kolei: wklej adres → Enter → poczekaj na wynik → „Poproś o zindeksowanie” → poczekaj',
  'na komunikat „Poproszono o zindeksowanie” (do 2 minut) → następny adres. Gdy GSC pokaże',
  '„Przekroczono limit” — przerwij; reszta wróci jutro. Jeśli wynik mówi „Adres URL jest w Google”,',
  'nie klikaj, idź dalej — WYJĄTEK: adres oznaczony „ODŚWIEŻENIE” zgłaszaj zawsze, także gdy jest',
  'w Google (to hub działu, którego Google nie odwiedził od tygodni; prośba wymusza nowy crawl).',
  'Nic poza tym nie klikaj i niczego nie zmieniaj w ustawieniach.',
  'Na koniec napisz w rozmowie: ile adresów zgłoszonych, na którym przerwał limit.',
  '',
  '## Adresy na dziś',
  '',
  ...wybrane.map((w, i) => `${i + 1}. ${w.url} — ${w.stan}${w.crawl ? `, crawl ${w.crawl.slice(0, 10)}` : ''}${w.odswiezenie ? ` — **ODŚWIEŻENIE** (hub działu, crawl ${w.wiekCrawla ?? '?'} dni temu — zgłoś mimo „jest w Google”)` : ''}${w.ponowka ? ` (ponownie: w kolejce ${w.ponowka}, Google nie odwiedził)` : ''}`),
  ...(wybrane.length ? [] : ['Brak — wszystkie sprawdzone adresy są w indeksie albo zgłoszone w ciągu 14 dni.']),
  '',
  '## Stan sprawdzonych adresów',
  '',
  `Sprawdzone dziś w API: ${wywolan}. Ponownie w kolejce (bez wizyty Google od zgłoszenia): ${ponowione}. Huby działów do odświeżenia crawla${dzialyDzis ? '' : ' (tylko w poniedziałek)'}: ${odswiezane}.`,
  ...Object.entries(licznik).map(([k, v]) => `- ${k}: ${v}`),
  '',
].join('\n');
fs.writeFileSync(KOLEJKA, md);
console.log(`Zapisano ${KOLEJKA} i ${HISTORIA}.`);
