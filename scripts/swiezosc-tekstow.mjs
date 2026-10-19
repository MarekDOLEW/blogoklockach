#!/usr/bin/env node
// Sprawdza, czy teksty nie rozjechały się z danymi serwisu.
//
// Powód: 19.10.2026 strona /zapowiedzi-lego-2027/ twierdziła, że „Grupa LEGO nie
// potwierdziła jeszcze żadnego zestawu na 2027 rok", podczas gdy sety.json miał
// już cztery zestawy z premierą 2027-01 i polskimi cenami katalogowymi, a jedno
// z martwych zdań („polskich cen Super Mario jeszcze nie ogłoszono") było
// nieprawdziwe od DNIA PO publikacji — ceny weszły 28.08, strona stanęła 27.08.
// Rozjazd trwał siedem tygodni i nie zauważył go nikt, bo nic go nie liczyło.
//
// Skrypt NIE ocenia treści i nie czyta tekstów ze zrozumieniem. Robi dwie rzeczy,
// które da się policzyć:
//
//   1. SPRZECZNOŚĆ — tekst oznacza numer plakietką „przeciek" (wiersz tabeli
//      albo nagłówek z klasą status--maybe), a ten numer stoi już w sety.json.
//      To nie jest zaległość, to zdanie nieprawdziwe na produkcji.
//   2. PRZESTARZAŁE — `zaktualizowano` tekstu jest starsze niż wpis albo
//      rozstrzygnięcie w przecieki.json dotyczące numeru, który tekst wymienia.
//
// Czego ten skrypt świadomie NIE liczy: wejścia cen do rrp_potwierdzone.json.
// Standard redakcyjny zabrania wpisywania kwot do treści artykułu (ceny wstawia
// tabela huba przy każdym budowaniu), więc cena nie ma jak zestarzeć tekstu —
// a sierpniowy zrzut pełnego katalogu dał 900 wpisów RRP tego samego dnia i
// zapalał każdy starszy tekst, co zakopywało jedyne ustalenie warte czytania.
// Ceny używamy tylko do opisania numeru, który już jest produktem.
//
// Numery bierzemy z trzech miejsc: pola `zestawy` we frontmatterze, linków
// `/zestaw/<nr>/` w treści i goł z treści — te ostatnie tylko wtedy, gdy numer
// jest znany naszym danym, bo inaczej łapałoby liczby elementów i kwoty.
//
// Uruchamia Kontroler w poniedziałek; człowiek na żądanie. Wynik to raport,
// nie błąd — skrypt zawsze kończy się zerem, chyba że podasz --kod.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const KORZEN = new URL('..', import.meta.url).pathname;
const STRONY = join(KORZEN, 'src/pages');
const kod = process.argv.includes('--kod');

const wczytaj = (p) => JSON.parse(readFileSync(join(KORZEN, p), 'utf8'));
const sety = wczytaj('src/data/sety.json');
const katalog = wczytaj('src/data/katalog.json');
const rrp = wczytaj('src/data/rrp_potwierdzone.json');
const przecieki = wczytaj('src/data/przecieki.json').przecieki ?? [];

// rrp_potwierdzone trzyma daty jako DD.MM.RRRR, reszta repo jako RRRR-MM-DD
function naIso(d) {
  if (!d) return null;
  const m = String(d).match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : String(d).slice(0, 10);
}

// zdarzenia w danych: numer -> [{ data, co }]
const zdarzenia = new Map();
const dopisz = (nr, data, co) => {
  if (!nr || !data) return;
  if (!zdarzenia.has(nr)) zdarzenia.set(nr, []);
  zdarzenia.get(nr).push({ data: naIso(data), co });
};

for (const p of przecieki) {
  const nr = p.numer ? String(p.numer) : null;
  dopisz(nr, p.dodano, 'wpis w przecieki.json');
  if (p.rozstrzygniecie?.kiedy) {
    dopisz(nr, p.rozstrzygniecie.kiedy, `rozstrzygnięcie „${p.rozstrzygniecie.wynik}"`);
  }
  if (p.rozstrzygniecie?.skorygowane) {
    dopisz(nr, p.rozstrzygniecie.skorygowane, 'korekta rozstrzygnięcia');
  }
}
const znane = new Set([...Object.keys(sety), ...zdarzenia.keys()]);
znane.delete('_meta');

// Numery, które LEGO wystawia publicznie: są w listingu lego.com (katalog.json)
// albo mają potwierdzoną polską cenę katalogową. Samo wejście do sety.json tym
// nie jest — Scout zakłada tam wpis, gdy numer zarezerwuje katalog branżowy, co
// przy 77094 (Zelda) dało zestaw w rejestrze, którego LEGO wcale nie ogłosiło.
const wystawione = new Set();
for (const [seria, pozycje] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(pozycje)) continue;
  for (const x of pozycje) if (x?.nr) wystawione.add(String(x.nr));
}
for (const [nr, w] of Object.entries(rrp)) {
  if (nr !== '_meta' && w?.cena) wystawione.add(nr);
}

function pliki(dir) {
  const out = [];
  for (const wpis of readdirSync(dir)) {
    const p = join(dir, wpis);
    if (statSync(p).isDirectory()) out.push(...pliki(p));
    else if (wpis.endsWith('.md')) out.push(p);
  }
  return out;
}

function frontmatter(tekst) {
  const m = tekst.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { pola: {}, tresc: tekst };
  const pola = {};
  for (const linia of m[1].split('\n')) {
    const kv = linia.match(/^(\w+):\s*(.*)$/);
    if (kv) pola[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return { pola, tresc: tekst.slice(m[0].length), fmSurowy: m[1] };
}

const ustalenia = [];

for (const plik of pliki(STRONY)) {
  const surowy = readFileSync(plik, 'utf8');
  const { pola, tresc, fmSurowy = '' } = frontmatter(surowy);
  const stan = pola.zaktualizowano || pola.data;
  if (!stan) continue;

  const numery = new Set();
  const zPola = fmSurowy.match(/zestawy:\s*\[(.*?)\]/s);
  if (zPola) for (const n of zPola[1].match(/\d{4,7}/g) ?? []) numery.add(n);
  for (const m of tresc.matchAll(/\/zestaw\/(\d{4,7})\//g)) numery.add(m[1]);
  for (const m of tresc.matchAll(/\b\d{4,7}\b/g)) if (znane.has(m[0])) numery.add(m[0]);

  if (numery.size === 0) continue;

  // 1. sprzeczność: numer z plakietką „przeciek" stoi już w sety.json.
  // Liczy się tylko plakietka (status--maybe) w wierszu tabeli albo w nagłówku,
  // bo ona oznacza konkretną pozycję. Samo słowo „przeciek" w akapicie odnosi
  // się do czegoś innego niż numery, które przy okazji w nim stoją — pierwsza
  // wersja tego skryptu brała zdanie „jeśli przecieki o następcy się potwierdzą,
  // 75192…" za twierdzenie, że 75192 jest przeciekiem.
  const sprzeczne = [];
  const doSprawdzenia = [];
  for (const linia of tresc.split('\n')) {
    const plakietka = /status--maybe">(przeciek|wzorzec)/.test(linia);
    if (!plakietka || !/^\s*[|#]/.test(linia)) continue;
    for (const m of linia.matchAll(/\b\d{4,7}\b/g)) {
      const nr = m[0];
      if (!sety[nr]) continue;
      const kubelek = wystawione.has(nr) ? sprzeczne : doSprawdzenia;
      if (!kubelek.includes(nr)) kubelek.push(nr);
    }
  }

  // 2. przestarzałe: zdarzenie w danych nowsze niż `zaktualizowano`
  const nowsze = [];
  for (const nr of numery) {
    for (const z of zdarzenia.get(nr) ?? []) {
      if (z.data > stan) nowsze.push({ nr, ...z });
    }
  }
  nowsze.sort((a, b) => b.data.localeCompare(a.data));

  if (sprzeczne.length || doSprawdzenia.length || nowsze.length) {
    ustalenia.push({
      adres: '/' + relative(STRONY, plik).replace(/\.md$/, '').replace(/\/index$/, '') + '/',
      plik: relative(KORZEN, plik),
      stan,
      sprzeczne,
      doSprawdzenia,
      nowsze,
    });
  }
}

ustalenia.sort((a, b) => (b.sprzeczne.length - a.sprzeczne.length) || a.stan.localeCompare(b.stan));

console.log(`Świeżość tekstów wobec danych — ${new Date().toISOString().slice(0, 10)}`);
console.log(`Sprawdzone: ${pliki(STRONY).length} plików .md w src/pages, dane: sety.json i przecieki.json\n`);

if (ustalenia.length === 0) {
  console.log('Nic do zgłoszenia: żaden tekst nie nazywa przeciekiem numeru, który jest już w sety.json,');
  console.log('i żaden nie ma w przeciekach wpisu nowszego niż jego data aktualizacji.');
  process.exit(0);
}

for (const u of ustalenia) {
  console.log(`## ${u.adres}  (zaktualizowano: ${u.stan})`);
  console.log(`   ${u.plik}`);
  if (u.sprzeczne.length) {
    console.log(`   SPRZECZNOŚĆ — tekst nazywa przeciekiem numery, które są już w sety.json: ${u.sprzeczne.join(', ')}`);
    for (const nr of u.sprzeczne) {
      const s = sety[nr];
      const cena = s.cena_katalogowa ?? rrp[nr]?.cena ?? null;
      console.log(`     ${nr} — ${s.nazwa ?? '?'}, premiera ${s.premiera ?? '?'}${cena ? `, cena katalogowa ${cena} zł` : ', bez ceny katalogowej'}`);
    }
  }
  if (u.doSprawdzenia.length) {
    console.log(`   DO SPRAWDZENIA — numery z plakietką „przeciek", które są w sety.json, ale LEGO ich nie wystawiło: ${u.doSprawdzenia.join(', ')}`);
    console.log('     Albo rejestr wyprzedził producenta (wtedy tekst jest w porządku), albo przeciek trzeba rozstrzygnąć.');
  }
  if (u.nowsze.length) {
    console.log(`   PRZESTARZAŁE — ${u.nowsze.length} wpisów w przeciekach nowszych niż data aktualizacji:`);
    for (const z of u.nowsze.slice(0, 8)) console.log(`     ${z.data}  ${z.nr}  ${z.co}`);
    if (u.nowsze.length > 8) console.log(`     … i ${u.nowsze.length - 8} dalszych`);
  }
  console.log('');
}

console.log(`Razem: ${ustalenia.length} tekstów, w tym ${ustalenia.filter((u) => u.sprzeczne.length).length} ze sprzecznością.`);
console.log('Sprzeczność to zdanie nieprawdziwe na produkcji i ma pierwszeństwo nad zaległością.');

if (kod && ustalenia.some((u) => u.sprzeczne.length)) process.exit(1);
