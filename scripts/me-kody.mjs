// Kody rabatowe Media Expertu na LEGO → src/data/kody_rabatowe.json (klucz `mediaexpert`).
//
// Feed ME podaje cenę PO kodzie (sprawdzone 10.10.2026: 64 z 64 pozycji akcji),
// a karta produktu w sklepie pokazuje cenę PRZED kodem. Bez podpowiedzi czytelnik
// widzi u nas 999 zł, w sklepie 1123,27 zł i nie wie, skąd różnica. Ten skrypt
// czyta listing „cena z kodem” przez Firecrawl (3 kredyty) i zapisuje dla każdego
// kodu datę końca i ceny zestawów. Tabela cen, pasek ceny, /promocje-lego/ i strona
// główna pokazują kod tylko przy cenie równej cenie z kodem (±1 zł) i tylko do daty
// końca – po niej wpis jest ignorowany, więc stary plik niczego nie psuje.
//
// Wymaga FIRECRAWL_KEY. Użycie:
//   node scripts/me-kody.mjs --sucho   # tylko wypisz
//   node scripts/me-kody.mjs           # zapisz src/data/kody_rabatowe.json
import fs from 'node:fs';

const key = process.env.FIRECRAWL_KEY;
if (!key) { console.error('Brak FIRECRAWL_KEY – nic nie robię.'); process.exit(2); }
const sucho = process.argv.includes('--sucho');
const BAZA = 'https://www.mediaexpert.pl/zabawki/lego/lego/promocje_cena-z-kodem';

async function strona(n) {
  const url = BAZA + (n > 1 ? `?page=${n}` : '');
  const r = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true, maxAge: 0 }),
  });
  if (!r.ok) throw new Error(`Firecrawl ${r.status} dla ${url}`);
  return (await r.json()).data?.markdown ?? '';
}

const pozycje = [];
let liczbaStron = 1;
for (let n = 1; n <= liczbaStron; n++) {
  const md = await strona(n);
  if (n === 1) liczbaStron = Math.min(10, Math.max(1, Number(md.match(/\bz (\d+)\s*\n/)?.[1] ?? 1)));
  for (const blok of md.split('\n### [').slice(1)) {
    const nr = blok.match(/Kod producenta: \| (\d+)/)?.[1];
    const kod = blok.match(/Cena z kodem:(\S+)/)?.[1];
    const grosze = blok.match(/Cena z kodem:\S+\s+(\d+)zł/)?.[1];
    const doDnia = blok.match(/obowiązuje do (\d\d)\.(\d\d)\.(\d{4})/);
    if (nr && kod && grosze && doDnia) pozycje.push({ nr, kod, cena: Number(grosze) / 100, do: `${doDnia[3]}-${doDnia[2]}-${doDnia[1]}` });
  }
}

const kody = new Map();
for (const p of pozycje) {
  if (!kody.has(p.kod)) kody.set(p.kod, { kod: p.kod, do: p.do, zestawy: {} });
  kody.get(p.kod).zestawy[p.nr] = p.cena;
}
const dzis = new Date().toISOString().slice(0, 10);
const wynik = {
  _meta: {
    opis: 'Aktywne kody rabatowe sklepów, które feed produktowy wlicza już w cenę (Media Expert podaje w feedzie cenę PO kodzie). Tabela cen i strony promocji pokazują przy takiej cenie kod i datę końca, żeby czytelnik nie zobaczył w sklepie wyższej kwoty bez wyjaśnienia. Wpis po dacie `do` jest ignorowany. Generuje scripts/me-kody.mjs.',
    zrodlo: `${BAZA} (Firecrawl, ${dzis})`,
    zaktualizowano: dzis,
  },
  mediaexpert: [...kody.values()].sort((a, b) => b.do.localeCompare(a.do)),
};
console.log(`Stron: ${liczbaStron}, pozycji z kodem: ${pozycje.length}`);
for (const k of wynik.mediaexpert) console.log(`  ${k.kod} do ${k.do}: ${Object.keys(k.zestawy).length} zestawów`);
if (!pozycje.length) { console.error('Zero pozycji – układ strony się zmienił? Plik zostaje bez zmian.'); process.exit(1); }
if (!sucho) {
  fs.writeFileSync('src/data/kody_rabatowe.json', JSON.stringify(wynik, null, 1) + '\n');
  console.log('Zapisano src/data/kody_rabatowe.json');
}
