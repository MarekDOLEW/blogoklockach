#!/usr/bin/env node
// Przenosi stare wpisy z DZIENNIK.md do materialy/dziennik-archiwum-RRRR-MM.md.
//
// Dziennik jest pierwszą rzeczą, którą czyta każda sesja na starcie. Przy 1970
// liniach znaczy to 14 tys. słów kontekstu, z czego świeże jest kilka procent —
// płacimy za to w każdej sesji, także takiej, która dotyka jednego pliku.
//
// Archiwizacja to NIE kasowanie. Treść nie znika, przenosi się do pliku
// miesięcznego, a w dzienniku zostaje indeks. Reguła „append-only" z CLAUDE.md
// dotyczy nienaruszalności cudzych wpisów i dalej obowiązuje: niczego tu nie
// przepisujemy ani nie skracamy, przenosimy znak w znak.
//
// Dwie rzeczy nie są archiwizowane nigdy:
//   1. sekcja „Ustalenia trwałe" — żyje poza osią czasu,
//   2. wpis ze stanem „w toku" — to rezerwacja zadania; gdyby zniknął z
//      dziennika, druga strona zaczęłaby robotę, która już trwa.
//
// Użycie:
//   node scripts/archiwum-dziennika.mjs --sucho   # pokaż, co by się stało
//   node scripts/archiwum-dziennika.mjs           # wykonaj
//   node scripts/archiwum-dziennika.mjs --dni 30  # inny próg (domyślnie 14)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const sucho = args.includes('--sucho');
// Audyt proponował 30 dni, ale dziennik sięga wstecz ledwie trzy tygodnie —
// przy tym progu nie przeniósłby ani jednego wpisu. Przy obecnym tempie (kilka
// wpisów dziennie) 14 dni zostawia komplet kontekstu do przekazania między
// sesjami i zabiera resztę.
const PROG_DNI = Number(args[args.indexOf('--dni') + 1]) || 14;

const PLIK = 'DZIENNIK.md';
const KATALOG = 'materialy';
const NAGLOWEK_TRWALE = '## Ustalenia trwałe';

// ── parsowanie ───────────────────────────────────────────────────────────────
// Dziennik zawiera blok ``` z szablonem wpisu, w którym jest linia zaczynająca
// się od „## ". Bez śledzenia ogrodzeń kodu parser uznałby ją za wpis i uciął
// preambułę w połowie.
function rozbij(tekst) {
  const linie = tekst.split('\n');
  const granice = [];
  let wOgrodzeniu = false;

  for (let i = 0; i < linie.length; i += 1) {
    if (linie[i].startsWith('```')) wOgrodzeniu = !wOgrodzeniu;
    if (wOgrodzeniu || !linie[i].startsWith('## ')) continue;
    const data = dataZNaglowka(linie[i]);
    if (data) granice.push({ linia: i, data, naglowek: linie[i] });
  }

  const preambula = linie.slice(0, granice.length ? granice[0].linia : linie.length).join('\n');
  const wpisy = granice.map((g, n) => ({
    ...g,
    tresc: linie.slice(g.linia, granice[n + 1]?.linia ?? linie.length).join('\n').replace(/\s+$/, ''),
  }));
  return { preambula, wpisy };
}

// W dzienniku żyją dwa formaty daty: „2026-09-14" i „04.09.2026". Oba są
// prawdziwymi wpisami, więc oba muszą być rozpoznane — inaczej cicho zostałyby
// w bieżącym pliku na zawsze.
function dataZNaglowka(naglowek) {
  const iso = naglowek.match(/^## (\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const pl = naglowek.match(/^## (\d{2})\.(\d{2})\.(\d{4})/);
  if (pl) return `${pl[3]}-${pl[2]}-${pl[1]}`;
  return null;
}

const wToku = (tresc) => /\*\*Stan:\*\*[^\n]*w toku/i.test(tresc);

// ── wykonanie ────────────────────────────────────────────────────────────────
const oryginal = readFileSync(PLIK, 'utf8');
const { preambula, wpisy } = rozbij(oryginal);

const prog = new Date(Date.now() - PROG_DNI * 864e5).toISOString().slice(0, 10);
const zostaja = [];
const doArchiwum = [];

for (const w of wpisy) {
  if (w.data >= prog) { zostaja.push(w); continue; }
  if (wToku(w.tresc)) { zostaja.push({ ...w, zatrzymany: 'stan „w toku"' }); continue; }
  doArchiwum.push(w);
}

if (!doArchiwum.length) {
  console.log(`Nic do archiwizacji: wszystkie ${wpisy.length} wpisów jest nowsze niż ${prog}.`);
  process.exit(0);
}

// grupowanie po miesiącu wpisu, nie po dacie uruchomienia
const miesiace = {};
for (const w of doArchiwum) (miesiace[w.data.slice(0, 7)] ??= []).push(w);

console.log(`Próg: ${prog} (${PROG_DNI} dni). Wpisów w dzienniku: ${wpisy.length}.`);
console.log(`Do archiwum: ${doArchiwum.length}, zostaje: ${zostaja.length}.`);
for (const w of zostaja.filter((x) => x.zatrzymany)) {
  console.log(`  zatrzymany mimo wieku — ${w.zatrzymany}: ${w.naglowek.slice(0, 70)}`);
}
for (const [m, lista] of Object.entries(miesiace).sort()) {
  console.log(`  ${KATALOG}/dziennik-archiwum-${m}.md  ← ${lista.length} wpisów`);
}

if (sucho) {
  console.log('\n--sucho: nic nie zapisano.');
  process.exit(0);
}

if (!existsSync(KATALOG)) mkdirSync(KATALOG, { recursive: true });

for (const [m, lista] of Object.entries(miesiace).sort()) {
  const sciezka = `${KATALOG}/dziennik-archiwum-${m}.md`;
  const istniejacy = existsSync(sciezka) ? readFileSync(sciezka, 'utf8') : '';
  // Idempotencja po nagłówku: powtórne uruchomienie nie zdubluje wpisu, który
  // już leży w archiwum.
  const nowe = lista.filter((w) => !istniejacy.includes(w.naglowek));
  if (!nowe.length) continue;

  const czolo = istniejacy || [
    `# Dziennik — archiwum ${m}`,
    '',
    `Wpisy przeniesione z \`DZIENNIK.md\` po przekroczeniu ${PROG_DNI} dni.`,
    'Treść jest niezmieniona. Bieżące wpisy i ustalenia trwałe: `DZIENNIK.md`.',
    '',
  ].join('\n');

  writeFileSync(sciezka, `${czolo.replace(/\s+$/, '')}\n\n${nowe.map((w) => w.tresc).join('\n\n')}\n`, 'utf8');
}

// ── nowy DZIENNIK.md ─────────────────────────────────────────────────────────
const indeks = [
  '## Archiwum',
  '',
  `Wpisy starsze niż ${PROG_DNI} dni żyją w plikach miesięcznych. Nic nie zostało`,
  'skasowane — jeśli szukasz czegoś sprzed miesiąca, jest tam:',
  '',
  ...Object.keys(miesiace).sort().reverse()
    .map((m) => `- [\`${m}\`](materialy/dziennik-archiwum-${m}.md) — ${miesiace[m].length} wpisów`),
  '',
  'Archiwizuje `node scripts/archiwum-dziennika.mjs`.',
].join('\n');

let czolo = preambula.replace(/\s+$/, '');

// Sekcja ustaleń trwałych powstaje raz i nigdy nie jest archiwizowana.
if (!czolo.includes(NAGLOWEK_TRWALE)) {
  czolo += `\n\n${[
    NAGLOWEK_TRWALE,
    '',
    'Rzeczy, które obowiązują niezależnie od daty. Nie archiwizują się. Wpisuj tu',
    'tylko to, co ma przetrwać miesiąc — jednorazowe ustalenia zostają we wpisach.',
    '',
    '- (pusto — dopisuj, gdy ustalenie przeżyje swój wpis)',
  ].join('\n')}`;
}

// Indeks archiwum wstawiamy raz; przy kolejnych przebiegach podmieniamy w całości.
const bezStaregoIndeksu = czolo.replace(/\n## Archiwum\n[\s\S]*?(?=\n## |$)/, '');

const nowy = `${bezStaregoIndeksu.replace(/\s+$/, '')}\n\n${indeks}\n\n${zostaja.map((w) => w.tresc).join('\n\n')}\n`;
writeFileSync(PLIK, nowy, 'utf8');

const linieBylo = oryginal.split('\n').length;
const linieJest = nowy.split('\n').length;
console.log(`\n${PLIK}: ${linieBylo} → ${linieJest} linii (−${linieBylo - linieJest}).`);
