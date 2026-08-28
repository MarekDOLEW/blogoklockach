#!/usr/bin/env node
// Cienki klient Firecrawl API (v2) — dla skryptów i do diagnostyki z konsoli.
//
// Po co przez API, a nie przez serwer MCP: narzędzia MCP są dostępne tylko
// w sesji, w której akurat ktoś je podłączył. Zadanie cykliczne (runner) musi
// móc odpalić zaciąg samo, bez człowieka — a to potrafi wyłącznie zwykły skrypt.
//
// Wymaga FIRECRAWL_KEY w środowisku (klucz z app.firecrawl.dev, prefiks `fc-`).
// Pobieranie curl-em, bo wyjście sieciowe środowiska idzie przez proxy,
// z którego natywny fetch Node'a nie korzysta (ta sama pułapka co w ceneo-feed.mjs).
//
// Użycie z konsoli:
//   node scripts/firecrawl.mjs test
//   node scripts/firecrawl.mjs scrape <url> [--format markdown|html|links] [--wyjscie plik]
//   node scripts/firecrawl.mjs mapa <url> [--szukaj fraza] [--limit 500]
//
// Import w innych skryptach:
//   import { scrape, mapa, ekstrakcja } from './firecrawl.mjs';

import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const API = 'https://api.firecrawl.dev/v2';

function klucz() {
  const k = process.env.FIRECRAWL_KEY;
  if (!k) {
    console.error('Brak FIRECRAWL_KEY w środowisku. Klucz z app.firecrawl.dev → API Keys.');
    process.exit(1);
  }
  return k;
}

// Jedno wywołanie POST. Zwraca sparsowane `data` albo rzuca z treścią błędu.
function wywolaj(sciezka, ciało, { limitCzasu = 180 } = {}) {
  const wynik = execFileSync(
    'curl',
    [
      '-sS', '--max-time', String(limitCzasu), '-w', '\n%{http_code}',
      '-X', 'POST', `${API}${sciezka}`,
      '-H', 'Content-Type: application/json',
      '-H', `Authorization: Bearer ${klucz()}`,
      '--data-binary', '@-',
    ],
    { input: JSON.stringify(ciało), encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  );
  const granica = wynik.lastIndexOf('\n');
  const status = wynik.slice(granica + 1).trim();
  const tresc = wynik.slice(0, granica);
  if (status !== '200') throw new Error(`Firecrawl ${sciezka} → ${status}: ${tresc.slice(0, 300)}`);
  const dane = JSON.parse(tresc);
  if (dane.success === false) throw new Error(`Firecrawl ${sciezka}: ${dane.error}`);
  return dane.data ?? dane;
}

// Pobranie jednej strony. `formaty` wg API v2: 'markdown', 'html', 'links',
// 'rawHtml', 'screenshot' albo obiekt { type: 'json', schema, prompt }.
export function scrape(url, { formaty = ['markdown'], glownaTresc = true, czekaj, dodatkowe = {} } = {}) {
  return wywolaj('/scrape', {
    url,
    formats: formaty,
    onlyMainContent: glownaTresc,
    ...(czekaj ? { waitFor: czekaj } : {}),
    ...dodatkowe,
  });
}

// Ekstrakcja strukturalna — Firecrawl sam wyciąga dane wg schematu JSON Schema.
// Droższe od surowego markdownu, ale odporne na przebudowę HTML sklepu, więc
// nadaje się do zadania cyklicznego, którego nikt nie pilnuje.
export function ekstrakcja(url, schemat, { polecenie, czekaj, dodatkowe = {} } = {}) {
  const dane = scrape(url, {
    formaty: [{ type: 'json', schema: schemat, ...(polecenie ? { prompt: polecenie } : {}) }],
    czekaj,
    dodatkowe,
  });
  return dane.json ?? null;
}

// Lista adresów w obrębie domeny — tanie (nie renderuje stron).
export function mapa(url, { szukaj, limit = 500 } = {}) {
  const dane = wywolaj('/map', { url, ...(szukaj ? { search: szukaj } : {}), limit });
  return dane.links ?? dane;
}

// ── CLI ──
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const polecenieCLI = args[0];
  const opcja = (n) => {
    const i = args.indexOf(`--${n}`);
    return i >= 0 ? args[i + 1] : null;
  };
  const wyjscie = opcja('wyjscie');
  const zapisz = (tresc) => {
    if (wyjscie) {
      writeFileSync(wyjscie, tresc);
      console.log(`Zapisano ${wyjscie} (${tresc.length} znaków).`);
    } else {
      console.log(tresc.slice(0, 4000));
    }
  };

  try {
    if (polecenieCLI === 'test') {
      const d = scrape('https://example.com', { formaty: ['markdown'] });
      console.log('Klucz działa. Próbka:', (d.markdown ?? '').slice(0, 120).replace(/\n/g, ' '));
    } else if (polecenieCLI === 'scrape') {
      const url = args[1];
      if (!url) throw new Error('Podaj adres.');
      const format = opcja('format') ?? 'markdown';
      const d = scrape(url, { formaty: [format] });
      zapisz(typeof d[format] === 'string' ? d[format] : JSON.stringify(d[format] ?? d, null, 1));
    } else if (polecenieCLI === 'mapa') {
      const url = args[1];
      if (!url) throw new Error('Podaj adres.');
      const linki = mapa(url, { szukaj: opcja('szukaj'), limit: Number(opcja('limit') ?? 500) });
      const lista = linki.map((l) => (typeof l === 'string' ? l : l.url));
      console.log(`Znaleziono ${lista.length} adresów.`);
      zapisz(lista.join('\n'));
    } else {
      console.error('Polecenia: test | scrape <url> | mapa <url>');
      process.exit(2);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
