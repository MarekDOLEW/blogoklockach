#!/usr/bin/env node
// Co widzi środowisko tej sesji — jedno wywołanie zamiast zgadywania.
//
// Powstało 14.09.2026 po dniu, w którym trzy razy postawiłem tezę o dostępach
// bez sprawdzenia: „Kontroler nie ma poświadczeń" (miał — 940 kliknięć),
// „LEGO.com nie ma linków" (miał — worker oddawał 302), „klient TD nie jest
// aktywny" (był — biłem w zmyśloną ścieżkę). Każde z tych zdań kosztowało
// więcej niż ten skrypt.
//
// Zasada: żadnego pola nie wypełniamy z pamięci. Każdy wiersz to albo wynik
// realnego wywołania, albo jawne „nie sprawdzono".
//
// Użycie:
//   node scripts/diagnoza.mjs            # czytelny wydruk do wklejenia w raport
//   node scripts/diagnoza.mjs --json     # to samo maszynowo
//   node scripts/diagnoza.mjs --szybko   # bez wywołań sieciowych (~0,1 s)
//
// Runnery odpalają go w PIERWSZYM kroku i wklejają wynik na początku raportu.

import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const jakoJson = args.includes('--json');
const szybko = args.includes('--szybko');
const LIMIT_MS = 8000;

const wynik = { czas: new Date().toISOString(), sekcje: {} };

// ── narzędzia ────────────────────────────────────────────────────────────────
function bash(cmd, awaryjnie = null) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return awaryjnie;
  }
}

// Każde wywołanie sieciowe dostaje limit czasu — diagnoza, która wisi, jest
// gorsza od braku diagnozy, bo runner przez nią nie ruszy dalej.
async function pobierz(url, opcje = {}) {
  const stop = AbortSignal.timeout(LIMIT_MS);
  try {
    const odp = await fetch(url, { ...opcje, signal: stop });
    return { status: odp.status, ok: odp.ok, tresc: await odp.text() };
  } catch (e) {
    return { status: null, ok: false, blad: e.name === 'TimeoutError' ? `brak odpowiedzi w ${LIMIT_MS / 1000} s` : e.message };
  }
}

// ── 1. Zmienne środowiska ────────────────────────────────────────────────────
// Wypisujemy WYŁĄCZNIE nazwę i to, czy jest ustawiona. Nigdy wartości, nigdy
// fragmentu, nigdy długości — długość też jest przeciekiem przy krótkich hasłach.
const ZMIENNE = {
  CF_ACCOUNT_ID: 'Cloudflare — konto (raport klików)',
  CF_API_TOKEN: 'Cloudflare — token Analytics Engine',
  GSC_KEY_JSON_B64: 'Search Console — klucz konta serwisowego',
  ADTRACTION_TOKEN: 'Adtraction — Smyk, Egmont',
  PERFORMERS_API_KEY: 'Performers — Media Expert',
  TD_CLIENT_ID: 'Tradedoubler — Publisher API (transakcje)',
  TD_CLIENT_SECRET: 'Tradedoubler — Publisher API (transakcje)',
  TD_USERNAME: 'Tradedoubler — grant password',
  TD_PASSWORD: 'Tradedoubler — grant password',
  TD_TOKEN: 'Tradedoubler — Products API (feed Ceneo)',
  FIRECRAWL_KEY: 'Firecrawl — strony blokujące ruch z chmury',
};

wynik.sekcje.zmienne = Object.fromEntries(
  Object.entries(ZMIENNE).map(([k, opis]) => [k, { jest: Boolean(process.env[k]), opis }]),
);

// ── 2. Repo ──────────────────────────────────────────────────────────────────
// Po restarcie kontenera znikają node_modules i gałąź robocza — sprawdzamy
// oba, bo „astro: not found" w środku przebiegu kosztuje cały runner.
const galaz = bash('git rev-parse --abbrev-ref HEAD');
bash('git fetch origin main --quiet');
wynik.sekcje.repo = {
  galaz,
  head: bash('git rev-parse --short HEAD'),
  main_zdalny: bash('git rev-parse --short origin/main'),
  commitow_za_main: Number(bash('git rev-list --count HEAD..origin/main', '0')),
  commitow_przed_main: Number(bash('git rev-list --count origin/main..HEAD', '0')),
  niezacommitowane: (bash('git status --porcelain', '') || '').split('\n').filter(Boolean).length,
  node_modules: existsSync('node_modules'),
  astro: Boolean(bash('ls node_modules/.bin/astro')),
};

// ── 3. Świeżość danych ───────────────────────────────────────────────────────
// Nie „kiedy runner miał się odpalić", tylko co faktycznie leży w plikach.
function meta(plik) {
  try {
    return JSON.parse(readFileSync(`src/data/${plik}`, 'utf8'))._meta ?? {};
  } catch {
    return {};
  }
}

const oferty = (() => {
  try {
    return JSON.parse(readFileSync('src/data/oferty_feed.json', 'utf8'));
  } catch {
    return { sety: {} };
  }
})();

const perSklep = {};
for (const set of Object.values(oferty.sety ?? {})) {
  for (const sklep of Object.keys(set.oferty ?? {})) {
    perSklep[sklep] = (perSklep[sklep] ?? 0) + 1;
  }
}

wynik.sekcje.dane = {
  oferty_feed_zaktualizowano: oferty._meta?.zaktualizowano ?? null,
  ofert_per_sklep: Object.fromEntries(Object.entries(perSklep).sort((a, b) => b[1] - a[1])),
  // Zrzut Empiku przychodzi z komputera Marka przez Cowork, więc jedyny ślad
  // jego wieku to commit importu — plik nie ma własnego znacznika.
  ostatni_import_empiku: bash(
    'git log -1 --format=%ad --date=short --grep="Empik" -i -- src/data/oferty_feed.json src/data/redirects.json',
  ),
  rejestr_afiliacji_zaktualizowano: meta('afiliacje_rejestr.json').zaktualizowano ?? null,
};

// ── 4. Dostępy — realne wywołania ────────────────────────────────────────────
if (szybko) {
  wynik.sekcje.dostepy = { pominiete: '--szybko' };
} else {
  const dostepy = {};

  // Cloudflare Analytics Engine — to samo zapytanie co kliki-raport.mjs
  if (process.env.CF_ACCOUNT_ID && process.env.CF_API_TOKEN) {
    const o = await pobierz(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/analytics_engine/sql`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${process.env.CF_API_TOKEN}` },
        // Analytics Engine próbkuje, więc liczymy SUM(_sample_interval), nie count().
        // Składnia interwału wymaga apostrofów: INTERVAL '7' DAY.
        body: "SELECT SUM(_sample_interval) AS n FROM idz_kliki WHERE timestamp > NOW() - INTERVAL '7' DAY",
      },
    );
    let klikow = null;
    try {
      klikow = JSON.parse(o.tresc)?.data?.[0]?.n ?? null;
    } catch { /* odpowiedź nie jest JSON-em — zostaje sam status */ }
    dostepy.cloudflare = o.ok
      ? { stan: 'ok', klikniec_7dni: klikow === null ? null : Number(klikow) }
      : { stan: 'błąd', status: o.status, powod: o.blad ?? o.tresc?.slice(0, 120) };
  } else {
    dostepy.cloudflare = { stan: 'brak zmiennych' };
  }

  // Tradedoubler — sam token, bez raportu; potwierdza logowanie w 1 wywołaniu.
  // UWAGA: ścieżka to /uaa/oauth/token. Zmyślona ścieżka oddaje 401 „Full
  // authentication is required" pod KAŻDYM adresem, także nieistniejącym —
  // nie jest to dowód na nieaktywnego klienta, tylko na zły adres.
  if (process.env.TD_CLIENT_ID && process.env.TD_USERNAME) {
    const basic = Buffer.from(`${process.env.TD_CLIENT_ID}:${process.env.TD_CLIENT_SECRET}`).toString('base64');
    const o = await pobierz('https://connect.tradedoubler.com/uaa/oauth/token', {
      method: 'POST',
      headers: { authorization: `Basic ${basic}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        username: process.env.TD_USERNAME,
        password: process.env.TD_PASSWORD ?? '',
      }),
    });
    dostepy.tradedoubler = o.ok ? { stan: 'ok' } : { stan: 'błąd', status: o.status, powod: o.blad };
  } else {
    dostepy.tradedoubler = { stan: 'brak zmiennych' };
  }

  // Search Console — pełna ścieżka: klucz konta serwisowego → JWT → token →
  // lista witryn. Sama obecność zmiennej niczego nie dowodzi; klucz bywa
  // odwołany albo konto usunięte z witryny i wtedy runner SEO pada w połowie.
  if (process.env.GSC_KEY_JSON_B64) {
    try {
      const klucz = JSON.parse(Buffer.from(process.env.GSC_KEY_JSON_B64, 'base64').toString('utf8'));
      const b64url = (t) => Buffer.from(t).toString('base64url');
      const teraz = Math.floor(Date.now() / 1000);
      const naglowek = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
      const tresc = b64url(JSON.stringify({
        iss: klucz.client_email,
        scope: 'https://www.googleapis.com/auth/webmasters.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        iat: teraz,
        exp: teraz + 3600,
      }));
      const podpis = crypto.sign('RSA-SHA256', Buffer.from(`${naglowek}.${tresc}`), klucz.private_key);
      const o = await pobierz('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: `${naglowek}.${tresc}.${podpis.toString('base64url')}`,
        }),
      });
      if (!o.ok) {
        dostepy.search_console = { stan: 'błąd', status: o.status, powod: o.blad ?? 'token odrzucony' };
      } else {
        const t = JSON.parse(o.tresc).access_token;
        const w = await pobierz('https://www.googleapis.com/webmasters/v3/sites', {
          headers: { authorization: `Bearer ${t}` },
        });
        const witryny = w.ok ? (JSON.parse(w.tresc).siteEntry ?? []).map((x) => x.siteUrl) : [];
        dostepy.search_console = w.ok
          ? { stan: 'ok', witryny: witryny.join(', ') || 'brak — konto nie ma dostępu do żadnej witryny' }
          : { stan: 'błąd', status: w.status };
      }
    } catch (e) {
      dostepy.search_console = { stan: 'błąd', powod: e.message.slice(0, 120) };
    }
  } else {
    dostepy.search_console = { stan: 'brak zmiennych' };
  }

  // Adtraction i Performers — obecność tokenu, bez pełnego raportu.
  dostepy.adtraction = process.env.ADTRACTION_TOKEN ? { stan: 'token jest, raport w prowizje-raport.mjs' } : { stan: 'brak zmiennych' };
  dostepy.performers = process.env.PERFORMERS_API_KEY ? { stan: 'token jest, raport w prowizje-raport.mjs' } : { stan: 'brak zmiennych' };

  // Produkcja — czy worker w ogóle odpowiada i czy przekierowania żyją.
  const strona = await pobierz('https://tylkoklocki.pl/', { redirect: 'manual' });
  dostepy.produkcja = { stan: strona.ok ? 'ok' : 'błąd', status: strona.status, powod: strona.blad };

  // Firecrawl — jedyna droga do stron, które blokują ruch z centrum danych.
  if (process.env.FIRECRAWL_KEY) {
    const o = await pobierz('https://api.firecrawl.dev/v1/team/credit-usage', {
      headers: { authorization: `Bearer ${process.env.FIRECRAWL_KEY}` },
    });
    let kredyty = null;
    try {
      kredyty = JSON.parse(o.tresc)?.data?.remaining_credits ?? null;
    } catch { /* jw. */ }
    dostepy.firecrawl = o.ok ? { stan: 'ok', kredyty } : { stan: 'błąd', status: o.status, powod: o.blad };
  } else {
    dostepy.firecrawl = { stan: 'brak zmiennych' };
  }

  wynik.sekcje.dostepy = dostepy;
}

// ── wydruk ───────────────────────────────────────────────────────────────────
if (jakoJson) {
  console.log(JSON.stringify(wynik, null, 1));
} else {
  const znak = (b) => (b ? '✓' : '✗');
  const r = wynik.sekcje.repo;

  console.log(`## Diagnoza środowiska — ${wynik.czas.slice(0, 16).replace('T', ' ')} UTC\n`);

  console.log('**Repo**');
  console.log(`- gałąź \`${r.galaz}\` @ \`${r.head}\`, origin/main @ \`${r.main_zdalny}\``);
  const plikow = r.niezacommitowane === 1 ? '1 plik niezacommitowany' : `${r.niezacommitowane} plików niezacommitowanych`;
  console.log(`- ${r.commitow_przed_main} commitów ponad main, ${r.commitow_za_main} do nadrobienia, ${plikow}`);
  console.log(`- node_modules ${znak(r.node_modules)}, astro ${znak(r.astro)}${r.astro ? '' : '  ← `npm ci` przed buildem'}`);

  console.log('\n**Zmienne środowiska**');
  const brakujace = Object.entries(wynik.sekcje.zmienne).filter(([, v]) => !v.jest);
  console.log(`- ustawione: ${Object.values(wynik.sekcje.zmienne).filter((v) => v.jest).length}/${Object.keys(ZMIENNE).length}`);
  if (brakujace.length) {
    for (const [k, v] of brakujace) console.log(`- ✗ \`${k}\` — ${v.opis}`);
  } else {
    console.log('- komplet');
  }

  console.log('\n**Dane**');
  const d = wynik.sekcje.dane;
  console.log(`- oferty_feed zaktualizowane: ${d.oferty_feed_zaktualizowano ?? '—'}`);
  console.log(`- ostatni import Empiku: ${d.ostatni_import_empiku || '—'}`);
  console.log(`- oferty: ${Object.entries(d.ofert_per_sklep).map(([s, n]) => `${s} ${n}`).join(', ')}`);

  if (!szybko) {
    console.log('\n**Dostępy** *(realne wywołania, nie deklaracje)*');
    for (const [nazwa, v] of Object.entries(wynik.sekcje.dostepy)) {
      const opis = Object.entries(v)
        .filter(([k, w]) => k !== 'stan' && w !== undefined && w !== null)
        .map(([k, w]) => `${k}: ${w}`).join(', ');
      console.log(`- ${nazwa}: **${v.stan}**${opis ? ` (${opis})` : ''}`);
    }
  }
}
