#!/usr/bin/env node
// Wypisuje listę adresów z autorską treścią — do ręcznego zgłaszania w Search
// Console ("Sprawdzenie URL" -> "Poproś o zaindeksowanie", limit ~10 dziennie)
// albo do wklejenia w narzędzie masowego zgłaszania (IndexNow dla Bing/Yandex).
//
// Kolejność: najpierw artykuły i prezentowniki (najmocniejsza treść), potem
// zestawy z kartami opisowymi, największe najpierw — te mają najwięcej tekstu.
//
// Użycie:
//   node scripts/lista-do-indeksacji.mjs            > lista.txt
//   node scripts/lista-do-indeksacji.mjs --csv      > lista.csv
import { readFileSync, readdirSync } from 'node:fs';

const STRONA = 'https://tylkoklocki.pl';
const csv = process.argv.includes('--csv');
const karty = JSON.parse(readFileSync('src/data/karty_setow.json', 'utf8'));

const frontmatter = (sciezka) => {
  const t = readFileSync(sciezka, 'utf8');
  const m = t.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const pole = (n) => m[1].match(new RegExp(`^${n}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '');
  return { kategoria: pole('kategoria'), data: pole('data'), title: pole('title') };
};

const wiersze = [];
for (const [katalog, prefiks] of [
  ['src/pages/artykuly', '/artykuly'],
  ['src/pages/prezentowniki', '/prezentowniki'],
  ['src/pages', ''],
]) {
  for (const plik of readdirSync(katalog).filter((f) => f.endsWith('.md'))) {
    const fm = frontmatter(`${katalog}/${plik}`);
    if (!fm?.kategoria) continue;
    wiersze.push({
      url: `${STRONA}${prefiks}/${plik.replace(/\.md$/, '')}/`,
      typ: fm.kategoria,
      opis: fm.title ?? '',
    });
  }
}

const zestawy = Object.entries(karty)
  .filter(([nr]) => nr !== '_meta')
  .sort((a, b) => (b[1].elementy ?? 0) - (a[1].elementy ?? 0));
for (const [nr, k] of zestawy) {
  wiersze.push({ url: `${STRONA}/zestaw/${nr}/`, typ: `Zestaw ${k.seria}`, opis: `LEGO ${nr} ${k.nazwa}` });
}

if (csv) {
  console.log('url;typ;opis');
  for (const w of wiersze) console.log(`${w.url};${w.typ};"${w.opis.replace(/"/g, "'")}"`);
} else {
  for (const w of wiersze) console.log(w.url);
}
console.error(`Adresów: ${wiersze.length} (treści: ${wiersze.length - zestawy.length}, zestawy: ${zestawy.length})`);
