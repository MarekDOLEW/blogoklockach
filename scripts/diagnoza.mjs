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
// realnego wywołania, albo jawne „nie sprawdzono" — nigdy domysł podany
// w tonie faktu.
//
// Użycie:
//   node scripts/diagnoza.mjs            # czytelny wydruk do wklejenia w raport
//   node scripts/diagnoza.mjs --json     # to samo maszynowo
//   node scripts/diagnoza.mjs --szybko   # bez ŻADNEGO ruchu sieciowego
//
// Kontroler odpala go jako KROK 0 i wkleja wynik na początku raportu. Pozostałe
// runnery jeszcze nie — stan na 14.09.2026, patrz CLAUDE.md.

import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const jakoJson = args.includes('--json');
const szybko = args.includes('--szybko');
const LIMIT_MS = 8000;

const wynik = { czas: new Date().toISOString(), sekcje: {} };

// ── narzędzia ────────────────────────────────────────────────────────────────
// execSync bez `timeout` wisi w nieskończoność. Diagnoza, która wisi, jest
// gorsza od braku diagnozy — runner przez nią nie ruszy dalej.
function bash(cmd, awaryjnie = null, limitMs = LIMIT_MS) {
  try {
    return execSync(cmd, {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: limitMs,
    }).trim();
  } catch {
    return awaryjnie;
  }
}

async function pobierz(url, opcje = {}) {
  const stop = AbortSignal.timeout(LIMIT_MS);
  try {
    const odp = await fetch(url, { ...opcje, signal: stop });
    return { status: odp.status, ok: odp.ok, tresc: await odp.text() };
  } catch (e) {
    return {
      status: null,
      ok: false,
      blad: e.name === 'TimeoutError' ? `brak odpowiedzi w ${LIMIT_MS / 1000} s` : e.message,
    };
  }
}

// Ciało odpowiedzi bywa wielolinijkowe i rozwala listę markdown, w którą ten
// wydruk jest wklejany. Spłaszczamy do jednej linii.
const jednaLinia = (t, n = 120) => (t ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

// OSTATNIA BRAMKA PRZED WYDRUKIEM. Cudze API potrafią oddać nasz sekret
// w treści błędu — sprawdzone 14.09: Performers na zły klucz odpowiada
// „Invalid Static API Key: <klucz>", a że jego klucz jedzie w query stringu,
// to samo wyszłoby w komunikacie błędu sieciowego razem z całym URL-em.
// Dlatego nic nie idzie na wyjście bez przepuszczenia przez tę funkcję, także
// tryb --json. Lepiej wyciąć za dużo niż raz za mało.
const SEKRETY = Object.keys(process.env)
  .filter((k) => /TOKEN|KEY|SECRET|PASSWORD|USERNAME|EMAIL|UUID|_ID$/.test(k))
  .map((k) => process.env[k])
  .filter((v) => typeof v === 'string' && v.length >= 8)
  .sort((a, b) => b.length - a.length);   // najpierw najdłuższe, żeby nie ciąć w środku

function bezSekretow(tekst) {
  let t = String(tekst);
  for (const s of SEKRETY) t = t.split(s).join('***');
  return t;
}

const pisz = (tekst) => console.log(bezSekretow(tekst));

// ── 1. Zmienne środowiska ────────────────────────────────────────────────────
// Wypisujemy WYŁĄCZNIE nazwę i to, czy jest ustawiona. Nigdy wartości, nigdy
// fragmentu, nigdy długości — długość też jest przeciekiem przy krótkich hasłach.
const ZMIENNE = {
  CF_ACCOUNT_ID: 'Cloudflare — konto (raport klików)',
  CF_API_TOKEN: 'Cloudflare — token Analytics Engine',
  CF_R2_TOKEN: 'Cloudflare — token R2 (wgrywanie zdjęć, scripts/r2-obrazy.mjs)',
  GSC_KEY_JSON_B64: 'Search Console — klucz konta serwisowego',
  ADTRACTION_TOKEN: 'Adtraction — Smyk, Egmont',
  PERFORMERS_API_KEY: 'Performers — Media Expert',
  TD_CLIENT_ID: 'Tradedoubler — Publisher API (transakcje)',
  TD_CLIENT_SECRET: 'Tradedoubler — Publisher API (transakcje)',
  TD_USERNAME: 'Tradedoubler — grant password',
  TD_PASSWORD: 'Tradedoubler — grant password',
  TD_TOKEN: 'Tradedoubler — Products API (feed Ceneo)',
  FIRECRAWL_KEY: 'Firecrawl — strony blokujące ruch z chmury',
  RESEND_API_KEY: 'Resend — maile raportów (wyslij-raport.py) i alertów cen (alerty-cen.mjs)',
  GH_PUSH_TOKEN: 'GitHub — push z Routine bez podpiętego repo (opcjonalne, gdy repo jest źródłem sesji)',
};

wynik.sekcje.zmienne = Object.fromEntries(
  Object.entries(ZMIENNE).map(([k, opis]) => [k, { jest: Boolean(process.env[k]), opis }]),
);

// ── 2. Repo ──────────────────────────────────────────────────────────────────
// Po restarcie kontenera znikają node_modules i gałąź robocza — sprawdzamy
// oba, bo „astro: not found" w środku przebiegu kosztuje cały runner.
//
// `git fetch` to ruch sieciowy, więc pod --szybko go NIE robimy. Bez fetcha
// porównanie z origin/main opisuje stan ostatniego pobrania, nie stan zdalny —
// i wydruk musi to mówić wprost, zamiast udawać świeży odczyt.
const fetchZrobiony = szybko ? false : bash('git fetch origin main --quiet', null) !== null;

wynik.sekcje.repo = {
  galaz: bash('git rev-parse --abbrev-ref HEAD'),
  head: bash('git rev-parse --short HEAD'),
  main_zdalny: bash('git rev-parse --short origin/main'),
  main_odswiezony: fetchZrobiony,
  commitow_za_main: Number(bash('git rev-list --count HEAD..origin/main', '0')),
  commitow_przed_main: Number(bash('git rev-list --count origin/main..HEAD', '0')),
  niezacommitowane: (bash('git status --porcelain', '') || '').split('\n').filter(Boolean).length,
  node_modules: existsSync('node_modules'),
  astro: existsSync('node_modules/.bin/astro'),
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

// Zrzut Empiku przychodzi z komputera Marka raz w tygodniu, a pole `data` przy
// zestawie NIE nadaje się na znacznik: sprawdzone 14.09 — Łowca przepisuje je
// codziennie dla wszystkich sklepów, więc Empik wyglądałby na świeży każdego
// dnia. Jedynym śladem zostaje commit importu, a to znaczy zależność od słowa
// w komunikacie. Dlatego zwracamy też temat commita: gdy Łowca zmieni wording
// i grep przestanie trafiać, widać to od razu zamiast cichego „—".
//
// Sprawdzone 14.09 w świeżym klonie: `git clone --depth 1` nie ma historii,
// więc grep nie znajdzie NIC — i wtedy winny jest klon, nie wzorzec. Te dwa
// przypadki muszą być rozróżnione, inaczej runner pójdzie szukać błędu tam,
// gdzie go nie ma.
//
// Kolejność ma znaczenie: repo robocze też bywa płytkie (sprawdzone — 73
// commity i plik .git/shallow), a grep w nim trafia. Więc najpierw szukamy,
// a płytkość jest wyjaśnieniem dopiero wtedy, gdy nie ma wyniku.
const commitEmpiku = bash(
  "git log -1 --format='%ad\t%s' --date=short --grep=empik -i -- src/data/oferty_feed.json src/data/redirects.json",
);
const plytki = bash('git rev-parse --is-shallow-repository') === 'true';
let importEmpiku;
if (commitEmpiku) {
  importEmpiku = { data: commitEmpiku.split('\t')[0], commit: commitEmpiku.split('\t').slice(1).join(' ') };
} else if (plytki) {
  const n = Number(bash('git rev-list --count HEAD', '0'));
  const historia = n === 1 ? '1 commit' : `${n} commity/ów`;
  importEmpiku = { data: null, commit: `nie sprawdzono — klon jest płytki (${historia} w historii), import może być głębiej` };
} else {
  importEmpiku = { data: null, commit: 'NIE ZNALEZIONO commita importu — wzorzec grepa mógł przestać pasować' };
}
wynik.sekcje.dane = {
  oferty_feed_zaktualizowano: oferty._meta?.zaktualizowano ?? null,
  ofert_per_sklep: Object.fromEntries(Object.entries(perSklep).sort((a, b) => b[1] - a[1])),
  import_empiku: importEmpiku,
  rejestr_afiliacji_zaktualizowano: meta('afiliacje_rejestr.json').zaktualizowano ?? null,
};

// ── 4. Dostępy — realne wywołania ────────────────────────────────────────────
// Każda pozycja w tej sekcji MUSI być wynikiem wywołania. Sprawdzenie „czy
// zmienna istnieje" nie należy tutaj — od tego jest sekcja zmiennych.
if (szybko) {
  wynik.sekcje.dostepy = { pominiete: '--szybko: nie sprawdzono żadnego dostępu' };
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
      : { stan: 'błąd', status: o.status, powod: o.blad ?? jednaLinia(o.tresc) };
  } else {
    dostepy.cloudflare = { stan: 'brak zmiennych' };
  }

  // R2 — osobny token (Workers R2 Storage: Edit), bo CF_API_TOKEN ma tylko
  // Analytics: Read i na r2/buckets dostaje „Authentication error". Lista
  // kubełków wystarcza za dowód: bez uprawnienia wywołanie nie przechodzi.
  if (process.env.CF_ACCOUNT_ID && process.env.CF_R2_TOKEN) {
    const o = await pobierz(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/r2/buckets`,
      { headers: { authorization: `Bearer ${process.env.CF_R2_TOKEN}` } },
    );
    let kubelki = null;
    try {
      kubelki = JSON.parse(o.tresc)?.result?.buckets?.map((b) => b.name) ?? null;
    } catch { /* odpowiedź nie jest JSON-em — zostaje sam status */ }
    dostepy.r2 = o.ok && kubelki
      ? { stan: 'ok', kubelki }
      : { stan: 'błąd', status: o.status, powod: o.blad ?? jednaLinia(o.tresc) };
  } else {
    dostepy.r2 = { stan: 'brak zmiennych' };
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
  //
  // NIGDY nie drukujemy tu `e.message`. Node od wersji 20 wkleja do komunikatu
  // JSON.parse początek wejścia („Unexpected token 'T', \"TAJNY_KLUC\"...”), więc
  // sekret wrzucony omyłkowo do złej zmiennej wyciekłby do raportu. Zamiast
  // treści błędu podajemy jego rodzaj.
  if (process.env.GSC_KEY_JSON_B64) {
    let klucz = null;
    try {
      klucz = JSON.parse(Buffer.from(process.env.GSC_KEY_JSON_B64, 'base64').toString('utf8'));
    } catch {
      klucz = null;
    }
    if (!klucz?.private_key || !klucz?.client_email) {
      dostepy.search_console = {
        stan: 'błąd',
        powod: klucz
          ? 'klucz zdekodowany, ale bez pól private_key/client_email'
          : 'GSC_KEY_JSON_B64 nie dekoduje się do JSON-a konta serwisowego',
      };
    } else {
      try {
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
      } catch {
        // Komunikatu nie pokazujemy z tego samego powodu co wyżej.
        dostepy.search_console = { stan: 'błąd', powod: 'podpisanie JWT albo odpowiedź Google nie powiodły się' };
      }
    }
  } else {
    dostepy.search_console = { stan: 'brak zmiennych' };
  }

  // Adtraction — realne pytanie o transakcje z ostatniej doby. Endpoint oddaje
  // tablicę (także pustą), więc odpowiedź potwierdza token, a nie tylko to,
  // że zmienna istnieje.
  if (process.env.ADTRACTION_TOKEN) {
    const dzien = (d) => d.toISOString().slice(0, 19);
    const o = await pobierz('https://api.adtraction.com/v2/affiliate/transactions', {
      method: 'POST',
      headers: { 'X-Token': process.env.ADTRACTION_TOKEN, 'content-type': 'application/json' },
      body: JSON.stringify({
        market: 'PL',
        fromDate: dzien(new Date(Date.now() - 864e5)),
        toDate: dzien(new Date()),
        transactionStatus: 1,
      }),
    });
    dostepy.adtraction = o.ok ? { stan: 'ok' } : { stan: 'błąd', status: o.status, powod: o.blad };
  } else {
    dostepy.adtraction = { stan: 'brak zmiennych' };
  }

  // Performers (HasOffers/TUNE) — UWAGA: oddaje HTTP 200 także przy błędzie.
  // Prawdę mówi dopiero `response.status` (1 = ok, −1 = błąd), więc samo
  // sprawdzenie kodu HTTP pokazywałoby sukces przy martwym kluczu.
  if (process.env.PERFORMERS_API_KEY) {
    const dzis = new Date().toISOString().slice(0, 10);
    const o = await pobierz(
      'https://wld.api.hasoffers.com/Apiv3/json?NetworkId=wld&Target=Affiliate_Report&Method=getStats'
      + `&fields[]=Stat.clicks&data_start=${dzis}&data_end=${dzis}&api_key=${process.env.PERFORMERS_API_KEY}`,
    );
    let odp = null;
    try {
      odp = JSON.parse(o.tresc)?.response ?? null;
    } catch { /* nie JSON — zostaje status */ }
    dostepy.performers = odp?.status === 1
      ? { stan: 'ok' }
      : {
        stan: 'błąd',
        status: o.status,
        powod: jednaLinia(odp?.errors?.map((e) => e.publicMessage).join('; ') || odp?.errorMessage || o.blad || 'API odrzuciło zapytanie'),
      };
  } else {
    dostepy.performers = { stan: 'brak zmiennych' };
  }

  // Produkcja — czy worker w ogóle odpowiada.
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
  pisz(JSON.stringify(wynik, null, 1));
} else {
  const znak = (b) => (b ? '✓' : '✗');
  const r = wynik.sekcje.repo;

  pisz(`## Diagnoza środowiska — ${wynik.czas.slice(0, 16).replace('T', ' ')} UTC\n`);

  pisz('**Repo**');
  const swiezosc = r.main_odswiezony ? '' : ' *(bez `git fetch` — stan ostatniego pobrania)*';
  pisz(`- gałąź \`${r.galaz}\` @ \`${r.head}\`, origin/main @ \`${r.main_zdalny}\`${swiezosc}`);
  const plikow = r.niezacommitowane === 1 ? '1 plik niezacommitowany' : `${r.niezacommitowane} plików niezacommitowanych`;
  pisz(`- ${r.commitow_przed_main} commitów ponad main, ${r.commitow_za_main} do nadrobienia, ${plikow}`);
  pisz(`- node_modules ${znak(r.node_modules)}, astro ${znak(r.astro)}${r.astro ? '' : '  ← `npm ci` przed buildem'}`);

  pisz('\n**Zmienne środowiska**');
  const brakujace = Object.entries(wynik.sekcje.zmienne).filter(([, v]) => !v.jest);
  pisz(`- ustawione: ${Object.values(wynik.sekcje.zmienne).filter((v) => v.jest).length}/${Object.keys(ZMIENNE).length}`);
  if (brakujace.length) {
    for (const [k, v] of brakujace) pisz(`- ✗ \`${k}\` — ${v.opis}`);
  } else {
    pisz('- komplet');
  }

  pisz('\n**Dane**');
  const d = wynik.sekcje.dane;
  pisz(`- oferty_feed zaktualizowane: ${d.oferty_feed_zaktualizowano ?? '—'}`);
  pisz(`- rejestr afiliacji zaktualizowany: ${d.rejestr_afiliacji_zaktualizowano ?? '—'}`);
  pisz(`- import Empiku: ${d.import_empiku.data ? `${d.import_empiku.data} — ` : ''}${d.import_empiku.commit}`);
  pisz(`- oferty: ${Object.entries(d.ofert_per_sklep).map(([s, n]) => `${s} ${n}`).join(', ')}`);

  pisz('\n**Dostępy** *(realne wywołania, nie deklaracje)*');
  if (szybko) {
    pisz('- nie sprawdzono — tryb `--szybko`');
  } else {
    for (const [nazwa, v] of Object.entries(wynik.sekcje.dostepy)) {
      const opis = Object.entries(v)
        .filter(([k, w]) => k !== 'stan' && w !== undefined && w !== null)
        .map(([k, w]) => `${k}: ${w}`).join(', ');
      pisz(`- ${nazwa}: **${v.stan}**${opis ? ` (${opis})` : ''}`);
    }
  }
}
