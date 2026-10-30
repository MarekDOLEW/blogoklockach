#!/usr/bin/env node
// Import tekstów „Zestawy pod lupą” z paczki Coworka do src/pages/deale/.
//
// Cowork oddaje katalog z plikami `<slug>.md` w formacie z briefu
// `redakcja/wzorce/zestawy-pod-lupa.md`: frontmatter (url, set, typ, persona,
// powody, cena_katalogowa, cena_dobra, cena_bardzo_dobra, prog_zakupu,
// tytul_seo, hak, meta_description, opcjonalnie alias_url / canonical /
// wylacz_z_glownej_po), potem H1, znacznik modułu ceny, treść, znacznik tabeli
// i na końcu sekcja „Do weryfikacji (wewnętrzne, nie publikować)”.
//
// Skrypt przepisuje to na frontmatter layoutu Artykul.astro:
//   title      ← H1 (linia `# …` znika z treści – nagłówek renderuje layout)
//   opis       ← hak (zajawka na kafelku)
//   seo_tytul  ← tytul_seo,  seo_opis ← meta_description
//   data       ← data publikacji z DOTYCHCZASOWEGO pliku pod tym adresem
//                (URL i data zostają – to podmiana treści, nie nowy tekst),
//                a gdy pliku nie ma – dzisiejsza
//   zaktualizowano ← dzisiejsza data
//   kategoria: Deal, dzial: Deale, tagi ← persona (AFOL → „Dla AFOL”, RODZIC → „Dla rodzica”)
//   pola progów, set, typ, persona, powody, alias_url, canonical,
//   wylacz_z_glownej_po – bez zmian (czyta je src/lib/pod-lupa.js)
// Pola starego formatu (`pasek_zestaw`, `wazne_do`, `wyroznienie`) nie przechodzą:
// moduł ceny zastępuje pasek, a tekst nie opisuje akcji z terminem.
//
// Sekcja „Do weryfikacji” nie wchodzi do pliku strony – trafia zbiorczo do
// `materialy/zestawy-pod-lupa-weryfikacja-<data>.md` (notatki dla redakcji
// i lista błędów kart do poprawy).
//
// Użycie:
//   node scripts/import-pod-lupa.mjs <katalog-z-paczki> [--sucho]
// Pliki inne niż `*.md` i `_SZABLON-I-ZASADY.md` są pomijane.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const argv = process.argv.slice(2);
const sucho = argv.includes('--sucho');
const katalog = argv.find((a) => !a.startsWith('--'));
if (!katalog) {
  console.error('Użycie: node scripts/import-pod-lupa.mjs <katalog-z-paczki> [--sucho]');
  process.exit(2);
}
const REPO = resolve(new URL('..', import.meta.url).pathname);
const DOCELOWY = join(REPO, 'src/pages/deale');
const dzis = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());

const TAGI = { AFOL: 'Dla AFOL', RODZIC: 'Dla rodzica' };
const POLA_PRZENOSZONE = ['typ', 'set', 'persona', 'powody', 'cena_katalogowa', 'cena_dobra', 'cena_bardzo_dobra', 'prog_zakupu', 'alias_url', 'canonical', 'wylacz_z_glownej_po'];

/** Prosty frontmatter `klucz: wartość` (jedna linia na pole; wartości w cudzysłowie, listy inline). */
function czytajFrontmatter(tekst) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(tekst);
  if (!m) throw new Error('brak frontmattera');
  const pola = {};
  for (const linia of m[1].split(/\r?\n/)) {
    const p = /^([a-z_]+):\s*(.*?)\s*(?:#.*)?$/i.exec(linia);
    if (!p) continue;
    let w = p[2];
    if (/^".*"$/.test(w)) w = JSON.parse(w);
    else if (/^'.*'$/.test(w)) w = w.slice(1, -1);
    pola[p[1]] = w;
  }
  return { pola, tresc: tekst.slice(m[0].length) };
}

const q = (s) => JSON.stringify(String(s));

/** Wartość pola do YAML-a: liczby i listy inline bez zmian, teksty w cudzysłowie. */
// Daty (RRRR-MM-DD) zawsze w cudzysłowie – nieopakowana data staje się w YAML-u
// obiektem Date i porównania tekstowe w src/lib/pod-lupa.js by jej nie poznały.
const yamlWartosc = (w) => (/^-?\d+(\.\d+)?$/.test(String(w)) || /^\[.*\]$/.test(String(w)) ? String(w) : q(w));

function dataIstniejaca(plik) {
  if (!existsSync(plik)) return null;
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(plik, 'utf8'));
  return m ? /^data:\s*["']?(\d{4}-\d{2}-\d{2})/m.exec(m[1])?.[1] ?? null : null;
}

const zrodla = readdirSync(katalog).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort();
if (!zrodla.length) {
  console.error(`W ${katalog} nie ma plików .md`);
  process.exit(2);
}

const weryfikacja = [];
const wynik = [];
for (const nazwa of zrodla) {
  const { pola, tresc } = czytajFrontmatter(readFileSync(join(katalog, nazwa), 'utf8'));
  for (const wymagane of ['url', 'set', 'typ', 'tytul_seo', 'hak', 'meta_description', 'cena_katalogowa', 'prog_zakupu']) {
    if (pola[wymagane] == null || pola[wymagane] === '') throw new Error(`${nazwa}: brak pola ${wymagane}`);
  }
  const slug = String(pola.url).replace(/^\/deale\//, '').replace(/\/+$/, '');
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`${nazwa}: nieprawidłowy url ${pola.url}`);

  let cialo = tresc.replace(/\r\n/g, '\n');
  // sekcja wewnętrzna – do materiałów, nie na stronę
  const sekcja = /\n(?:---\n+)?## Do weryfikacji[^\n]*\n([\s\S]*)$/u.exec(cialo);
  if (sekcja) {
    weryfikacja.push({ slug, set: String(pola.set), notatki: sekcja[1].trim() });
    cialo = cialo.slice(0, sekcja.index);
  }
  // H1 → title
  const h1 = /^\s*# (.+?)\s*$/m.exec(cialo);
  if (!h1) throw new Error(`${nazwa}: brak H1`);
  const title = h1[1].trim();
  cialo = cialo.replace(h1[0], '').replace(/^\n+/, '').replace(/\s+$/, '') + '\n';
  if (!/\[tabela:\s*ceny-setu/u.test(cialo) && !/class="ceny-setu"/.test(cialo)) console.warn(`[uwaga] ${slug}: brak znacznika tabeli cen`);

  const docelowy = join(DOCELOWY, `${slug}.md`);
  const data = dataIstniejaca(docelowy) ?? dzis;
  const tag = TAGI[String(pola.persona ?? '').toUpperCase()];

  const linie = [
    'layout: ../../layouts/Artykul.astro',
    `title: ${q(title)}`,
    `opis: ${q(pola.hak)}`,
    `seo_tytul: ${q(pola.tytul_seo)}`,
    `seo_opis: ${q(pola.meta_description)}`,
    `data: ${q(data)}`,
    ...(data !== dzis ? [`zaktualizowano: ${q(dzis)}`] : []),
    'kategoria: "Deal"',
    'dzial: "Deale"',
    `tagi: [${tag ? q(tag) : ''}]`,
    ...POLA_PRZENOSZONE.filter((p) => pola[p] != null && pola[p] !== '').map((p) => `${p}: ${p === 'set' ? q(pola[p]) : yamlWartosc(pola[p])}`),
  ];
  const plik = `---\n${linie.join('\n')}\n---\n\n${cialo}`;
  wynik.push({ slug, docelowy, plik, nowy: !existsSync(docelowy), data });
}

if (!sucho) {
  mkdirSync(DOCELOWY, { recursive: true });
  for (const w of wynik) writeFileSync(w.docelowy, w.plik);
  if (weryfikacja.length) {
    const sciezka = join(REPO, 'materialy', `zestawy-pod-lupa-weryfikacja-${dzis}.md`);
    const naglowek = `# Zestawy pod lupą – notatki „Do weryfikacji” z paczki Coworka (${dzis})\n\nSekcje wewnętrzne wycięte przez \`scripts/import-pod-lupa.mjs\` z tekstów wgranych do \`src/pages/deale/\`. Nie są publikowane. Uwagi o kartach zestawów to lista do poprawy w \`/zestaw/<nr>/\`.\n\n`;
    const tresc = weryfikacja.map((w) => `## /deale/${w.slug}/ (LEGO ${w.set})\n\n${w.notatki}\n`).join('\n');
    writeFileSync(sciezka, naglowek + tresc);
    console.log(`Notatki „Do weryfikacji”: ${sciezka.replace(REPO + '/', '')}`);
  }
}
for (const w of wynik) console.log(`${sucho ? '[sucho] ' : ''}${w.nowy ? 'nowy   ' : 'podmiana'} ${w.docelowy.replace(REPO + '/', '')} (data ${w.data})`);
console.log(`Razem: ${wynik.length} tekstów${sucho ? ' (nic nie zapisano)' : ''}.`);
