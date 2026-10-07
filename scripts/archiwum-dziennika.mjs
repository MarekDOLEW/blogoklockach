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
// GRANICA PREAMBUŁY JEST JAWNA (znacznik ZNACZNIK poniżej), a nie wywnioskowana
// z położenia pierwszego datowanego nagłówka. Pierwsza wersja tego skryptu robiła
// to drugie i miała dziurę: preambuła dziennika każe sesjom pisać „nowe wpisy na
// górze", więc wpis wstawiony nad sekcjami sprawiał, że przestawały być
// preambułą — i przy kolejnym przebiegu „Ustalenia trwałe" wyjeżdżały do
// archiwum razem z wpisem. Sprawdzone symulacją 14.09.2026: reguła wpisana
// przez człowieka znikała z dziennika bez śladu.
//
// Użycie:
//   node scripts/archiwum-dziennika.mjs --sucho   # pokaż, co by się stało
//   node scripts/archiwum-dziennika.mjs           # wykonaj
//   node scripts/archiwum-dziennika.mjs --dni 30  # inny próg (domyślnie 14)

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';

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
const NAGLOWEK_ARCHIWUM = '## Archiwum';
const ZNACZNIK = '<!-- WPISY PONIŻEJ — wszystko nad tą linią zostaje w dzienniku na zawsze -->';

// Polska odmiana. „3 wpisów" w wygenerowanym tekście czyta się jak usterka.
function wpisyOdmiana(n) {
  if (n === 1) return '1 wpis';
  const d = n % 10;
  const s = n % 100;
  return (d >= 2 && d <= 4 && !(s >= 12 && s <= 14)) ? `${n} wpisy` : `${n} wpisów`;
}

// ── parsowanie ───────────────────────────────────────────────────────────────
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

// Dziennik zawiera blok ``` z szablonem wpisu, w którym jest linia zaczynająca
// się od „## ". Bez śledzenia ogrodzeń kodu parser uznałby ją za wpis.
function rozbij(tekst) {
  const linie = tekst.split('\n');
  const iZnacznik = linie.findIndex((l) => l.trim() === ZNACZNIK);

  const granice = [];
  const nadZnacznikiem = [];
  let wOgrodzeniu = false;
  for (let i = 0; i < linie.length; i += 1) {
    if (linie[i].startsWith('```')) wOgrodzeniu = !wOgrodzeniu;
    if (wOgrodzeniu || !linie[i].startsWith('## ')) continue;
    const data = dataZNaglowka(linie[i]);
    if (!data) continue;
    // Nad znacznikiem nic nie jest wpisem — ale datowany nagłówek w tym miejscu
    // to sygnał, że ktoś pisał według starej reguły „nowe wpisy na górze".
    // Zostaje nietknięty (nic nie ginie), tylko go zgłaszamy.
    if (iZnacznik >= 0 && i < iZnacznik) { nadZnacznikiem.push(linie[i]); continue; }
    granice.push({ linia: i, data, naglowek: linie[i] });
  }

  const konPreambuly = iZnacznik >= 0
    ? iZnacznik + 1
    : (granice.length ? granice[0].linia : linie.length);

  return {
    maZnacznik: iZnacznik >= 0,
    nadZnacznikiem,
    preambula: linie.slice(0, konPreambuly).join('\n'),
    wpisy: granice.map((g, n) => ({
      ...g,
      tresc: linie.slice(g.linia, granice[n + 1]?.linia ?? linie.length).join('\n').replace(/\s+$/, ''),
    })),
  };
}

const wToku = (tresc) => /\*\*Stan:\*\*[^\n]*w toku/i.test(tresc);

// ── wykonanie ────────────────────────────────────────────────────────────────
const oryginal = readFileSync(PLIK, 'utf8');
const { preambula, wpisy, maZnacznik, nadZnacznikiem } = rozbij(oryginal);

// Bramka bezpieczeństwa: gdyby sekcje stałe zawędrowały pod znacznik (np. ktoś
// przeniósł znacznik albo wkleił je w środek wpisów), archiwizacja mogłaby je
// wywieźć. Wtedy nie robimy NIC i mówimy, co poprawić.
const zabladzone = wpisy.filter((w) => w.tresc.includes(NAGLOWEK_TRWALE) || w.tresc.includes(NAGLOWEK_ARCHIWUM));
if (zabladzone.length) {
  console.error('PRZERWANE — sekcja stała znalazła się pod znacznikiem, w obrębie wpisu:');
  for (const w of zabladzone) console.error(`  ${w.naglowek.slice(0, 80)}`);
  console.error(`\nPrzenieś „${NAGLOWEK_TRWALE}" i „${NAGLOWEK_ARCHIWUM}" nad linię znacznika i uruchom ponownie.`);
  console.error('Nic nie zostało zmienione.');
  process.exit(1);
}

if (nadZnacznikiem.length) {
  console.warn('UWAGA — wpisy nad znacznikiem NIE są archiwizowane i zostaną w preambule:');
  for (const n of nadZnacznikiem) console.warn(`  ${n.slice(0, 80)}`);
  console.warn('Przenieś je pod znacznik, jeśli mają podlegać archiwizacji.\n');
}

const prog = new Date(Date.now() - PROG_DNI * 864e5).toISOString().slice(0, 10);
const zostaja = [];
const doArchiwum = [];

for (const w of wpisy) {
  if (w.data >= prog) { zostaja.push(w); continue; }
  if (wToku(w.tresc)) { zostaja.push({ ...w, zatrzymany: 'stan „w toku"' }); continue; }
  doArchiwum.push(w);
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
  console.log(`  ${KATALOG}/dziennik-archiwum-${m}.md  ← ${wpisyOdmiana(lista.length)}`);
}

// Brak wpisów do przeniesienia nie zwalnia z dopisania znacznika — bez niego
// następny przebieg dalej byłby narażony na dziurę opisaną w nagłówku.
if (!doArchiwum.length && maZnacznik) {
  console.log('Nic do archiwizacji i znacznik na miejscu — plik bez zmian.');
  process.exit(0);
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
    'Wpisy przeniesione z `DZIENNIK.md` po przekroczeniu progu wieku.',
    'Treść jest niezmieniona. Bieżące wpisy i ustalenia trwałe: `DZIENNIK.md`.',
    '',
  ].join('\n');

  writeFileSync(sciezka, `${czolo.replace(/\s+$/, '')}\n\n${nowe.map((w) => w.tresc).join('\n\n')}\n`, 'utf8');
}

// ── indeks archiwum ──────────────────────────────────────────────────────────
// Budowany z PLIKÓW NA DYSKU, nie z tego, co przeniósł bieżący przebieg.
// Pierwsza wersja listowała tylko bieżącą partię, więc drugi przebieg gubił
// link do poprzedniego miesiąca — a indeks stał zaraz pod zdaniem „nic nie
// zostało skasowane, jest tam".
function indeksZDysku() {
  const pliki = existsSync(KATALOG)
    ? readdirSync(KATALOG).filter((f) => /^dziennik-archiwum-\d{4}-\d{2}\.md$/.test(f)).sort().reverse()
    : [];
  return pliki.map((f) => {
    const m = f.match(/(\d{4}-\d{2})/)[1];
    const tresc = readFileSync(`${KATALOG}/${f}`, 'utf8');
    const ile = tresc.split('\n').filter((l) => l.startsWith('## ') && dataZNaglowka(l)).length;
    return `- [\`${m}\`](${KATALOG}/${f}) — ${wpisyOdmiana(ile)}`;
  });
}

const wiersze = indeksZDysku();
const indeks = [
  NAGLOWEK_ARCHIWUM,
  '',
  `Wpisy starsze niż ${PROG_DNI} dni żyją w plikach miesięcznych. Nic nie zostało`,
  'skasowane — jeśli szukasz czegoś starszego, jest tam:',
  '',
  ...(wiersze.length ? wiersze : ['- (jeszcze nic nie zarchiwizowano)']),
  '',
  'Archiwizuje `node scripts/archiwum-dziennika.mjs`.',
].join('\n');

// ── nowy DZIENNIK.md ─────────────────────────────────────────────────────────
// Preambuła bez znacznika i bez starego indeksu; sekcje stałe dokładamy
// w ustalonej kolejności, żeby układ pliku nie zależał od historii przebiegów.
let czolo = preambula
  .split('\n').filter((l) => l.trim() !== ZNACZNIK).join('\n')
  .replace(/\n## Archiwum\n[\s\S]*?(?=\n## |$)/, '')
  .replace(/\s+$/, '');

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

const nowy = `${czolo}\n\n${indeks}\n\n${ZNACZNIK}\n\n${zostaja.map((w) => w.tresc).join('\n\n')}\n`;
writeFileSync(PLIK, nowy, 'utf8');

const linieBylo = oryginal.split('\n').length;
const linieJest = nowy.split('\n').length;
const roznica = linieBylo - linieJest;
console.log(`\n${PLIK}: ${linieBylo} → ${linieJest} linii (${roznica >= 0 ? '−' : '+'}${Math.abs(roznica)}).`);
if (!maZnacznik) console.log('Dopisany znacznik granicy preambuły — od teraz sekcje stałe są chronione.');
