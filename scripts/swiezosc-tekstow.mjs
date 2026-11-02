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
// Skrypt NIE ocenia treści i nie czyta tekstów ze zrozumieniem. Robi trzy rzeczy,
// które da się policzyć:
//
//   1. SPRZECZNOŚĆ — tekst oznacza numer plakietką „przeciek" (wiersz tabeli
//      albo nagłówek z klasą status--maybe), a ten numer stoi już w sety.json.
//      To nie jest zaległość, to zdanie nieprawdziwe na produkcji.
//   2. PRZESTARZAŁE — `zaktualizowano` tekstu jest starsze niż wpis albo
//      rozstrzygnięcie w przecieki.json dotyczące numeru, który tekst wymienia.
//   3. DATY PREMIER — ten sam zestaw ma w dwóch miejscach dwie różne daty wejścia
//      do sprzedaży. Powód dopisania (02.11.2026): hub 11390 mówił jednocześnie
//      „Premiera 1 listopada 2026" (pole `opis` w sety.json, idzie do JSON-LD)
//      i „trafi do sprzedaży 4 listopada" (tytuł artykułu renderowany na tej samej
//      stronie). Prawdziwa była druga data — potwierdza ją karta lego.com — ale
//      niczego to nie pilnowało, bo datę premiery trzymamy w trzech miejscach
//      naraz: w polu `premiera`, w zdaniu w `opis` i w zdaniu w personach.
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
const karty = wczytaj('src/data/karty_setow.json');

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

// ── 3. Daty premier: jedna data na zestaw, nie trzy ──────────────────────────
//
// Zbieramy KAŻDE zdanie, które mówi, kiedy zestaw wchodzi do sprzedaży, z czterech
// miejsc: `opis` i persony w sety.json, akapity karty w karty_setow.json oraz teksty
// .md (frontmatter i treść). Zdanie liczy się tylko wtedy, gdy ma słowo o premierze
// i datę — i gdy NIE jest jednym z trzech wyjątków poniżej, bo każdy z nich wpuszczał
// do pierwszej wersji fałszywe alarmy:
//
//   - okno promocji („od 1 do 8 listopada 2026" przy gratisie 40898) to zakres dat,
//     nie premiera — zdania z zakresem pomijamy w całości;
//   - zdanie o wycofaniu („znika w grudniu 2026") też ma datę i czasownik sprzedażowy;
//   - w jednym zdaniu bywają dwie prawdziwe daty: wczesny dostęp dla Insiders
//     („sprzedaż od 4 listopada, a od 1 listopada dla Insiders") i dzień zapowiedzi
//     („LEGO pokazało zestaw 9 października 2026, premiera 1 stycznia 2027").
//     Każdą datę klasyfikujemy po NAJBLIŻSZYM słowie przed nią, nie po całym zdaniu,
//     i do porównania bierzemy tylko daty sprzedaży dla wszystkich.
//
// Czego ten skrypt świadomie NIE porównuje: zdań z polem `premiera` w sety.json.
// Sprawdzone 02.11.2026 na pełnych danych: takich rozjazdów jest 46 i prawie wszystkie
// to karty w karty_setow.json z datą „1 <miesiąc>" inną niż miesiąc w rejestrze
// (np. 10967 ma pole 2022-03 i kartę z 1 stycznia 2022). Przy tej skali i tym wzorcu
// to nie 46 błędów, tylko dwie różne rzeczy nazwane tym samym słowem — dopóki nikt nie
// rozstrzygnie, co znaczy data w karcie, taki warunek zalewałby raport dokładnie tak,
// jak robiły to wejścia RRP w pierwszej wersji tego skryptu.
const MIESIACE = {
  stycznia: '01', lutego: '02', marca: '03', kwietnia: '04', maja: '05', czerwca: '06',
  lipca: '07', sierpnia: '08', września: '09', października: '10', listopada: '11', grudnia: '12',
  styczeń: '01', luty: '02', marzec: '03', kwiecień: '04', maj: '05', czerwiec: '06',
  lipiec: '07', sierpień: '08', wrzesień: '09', październik: '10', listopad: '11', grudzień: '12',
};
const NAZWY_MIESIECY = Object.keys(MIESIACE).join('|');
const SLOWO_PREMIERY = /premier|debiut|sprzeda[żź]|trafi\w* do sklep|ukaza\w* si[ęę]|dost[ęe]pny od|wchodzi do/i;
const SLOWO_WYCOFANIA = /wycofan|znika|zejd\w* z produkcji|koniec produkcji|ostatni[ae] szansa|rynek wt[óo]rny/i;
// Klasyfikatory daty — liczy się ten, który stoi NAJBLIŻEJ przed nią.
const KLASY = [
  // `(?<!przed)` jest tu po to, żeby „Przedsprzedaż ruszyła 4 lutego" nie wyszła jako
  // data sprzedaży dla wszystkich — przy zestawach BrickLink Designer Program (910044,
  // 910047) przedsprzedaż i wydanie dzieli pół roku i obie daty są prawdziwe.
  ['sprzedaz', /premier|debiut|(?<!przed)sprzeda[żź]|dost[ęe]pny od|trafi|wchodzi do|ukaza\w* si[ęę]/gi],
  ['wczesny', /insider|wczesn\w* dost[ęe]p|przedsprzeda[żź]/gi],
  ['zapowiedz', /pokaza|zapowied|og[łl]osi|zaprezentowa|ujawni/gi],
];
const bezHtml = (x) => String(x ?? '').replace(/<[^>]+>/g, ' ');

/** Daty premier w jednym zdaniu: [{ iso, tekst, klasa }]. Pusta tablica, gdy zdanie nie o tym. */
function datyPremiery(zdanie) {
  if (!SLOWO_PREMIERY.test(zdanie) || SLOWO_WYCOFANIA.test(zdanie)) return [];
  // zakres („od 1 do 8 listopada", „1–8 listopada") to okno, nie data wejścia
  if (/\bod\s+\d{1,2}\s+(do|–|-)\s*\d{1,2}\b/i.test(zdanie) || /\d{1,2}\s*[–-]\s*\d{1,2}\s+(?:\w+)\s+\d{4}/.test(zdanie)) return [];
  const znalezione = [];
  const dodaj = (iso, tekst, poz) => {
    if (znalezione.some((d) => d.iso.startsWith(iso) || iso.startsWith(d.iso))) return;
    const przed = zdanie.slice(0, poz);
    let klasa = 'sprzedaz';
    let najblizej = -1;
    for (const [nazwa, wzor] of KLASY) {
      for (const m of przed.matchAll(wzor)) if (m.index > najblizej) { najblizej = m.index; klasa = nazwa; }
    }
    // Zastrzeżenie o Insiders stoi w polszczyźnie najczęściej PO dacie („sprzedaż
    // rozpocznie się 1 listopada dla uczestników programu LEGO Insiders"), więc samo
    // patrzenie w lewo brało tę datę za datę dla wszystkich i zgłaszało sprzeczność
    // z prawdziwym „od 4 listopada" w zdaniu obok.
    if (/^.{0,70}?(insider|wczesn\w* dost[ęe]p|przedsprzeda[żź])/i.test(zdanie.slice(poz + tekst.length))) klasa = 'wczesny';
    znalezione.push({ iso, tekst, klasa });
  };
  for (const m of zdanie.matchAll(new RegExp(String.raw`(\d{1,2})\s+(${NAZWY_MIESIECY})\s+(\d{4})`, 'gi')))
    dodaj(`${m[3]}-${MIESIACE[m[2].toLowerCase()]}-${String(m[1]).padStart(2, '0')}`, m[0], m.index);
  for (const m of zdanie.matchAll(new RegExp(String.raw`(${NAZWY_MIESIECY})\s+(\d{4})`, 'gi')))
    dodaj(`${m[2]}-${MIESIACE[m[1].toLowerCase()]}`, m[0], m.index);
  for (const m of zdanie.matchAll(/\b(\d{4})-(\d{2})(?:-(\d{2}))?\b/g))
    dodaj(m[3] ? `${m[1]}-${m[2]}-${m[3]}` : `${m[1]}-${m[2]}`, m[0], m.index);
  return znalezione;
}

const zdania = (tekst) => bezHtml(tekst).split(/(?<=[.;!?])\s+/);

/** numer -> [{ zrodlo, iso, tekst, wczesny }] */
const twierdzenia = new Map();
const dopiszDate = (nr, zrodlo, d) => {
  if (!twierdzenia.has(nr)) twierdzenia.set(nr, []);
  twierdzenia.get(nr).push({ zrodlo, ...d });
};
const zebrz = (nr, zrodlo, tekst) => {
  for (const zd of zdania(tekst)) for (const d of datyPremiery(zd)) dopiszDate(nr, zrodlo, d);
};

for (const [nr, s] of Object.entries(sety)) {
  if (nr === '_meta') continue;
  zebrz(nr, 'sety.json: opis', s.opis);
  zebrz(nr, 'sety.json: dla_rodzica', s.dla_rodzica);
  zebrz(nr, 'sety.json: dla_afol', s.dla_afol);
}
for (const [nr, k] of Object.entries(karty)) {
  if (nr === '_meta') continue;
  zebrz(nr, 'karty_setow.json', (k.akapity ?? []).join(' '));
  for (const f of k.faq ?? []) zebrz(nr, 'karty_setow.json: FAQ', `${f.q} ${f.a}`);
}
// Teksty .md: datę przypisujemy tylko wtedy, gdy wiadomo, o którym zestawie mowa —
// czyli plik ma we frontmatterze dokładnie jeden numer (`zestawy` albo `pasek_zestaw`).
// Przy liście premier miesiąca z ośmioma numerami nie da się powiedzieć, do którego
// z nich odnosi się zdanie, a zgadywanie dawałoby właśnie te fałszywe alarmy, których
// pierwsza wersja tego skryptu miała w nadmiarze.
for (const plik of pliki(STRONY)) {
  const surowy = readFileSync(plik, 'utf8');
  const { pola, tresc, fmSurowy = '' } = frontmatter(surowy);
  const zPola = new Set([
    ...((fmSurowy.match(/zestawy:\s*\[(.*?)\]/s)?.[1] ?? '').match(/\d{4,7}/g) ?? []),
    ...(pola.pasek_zestaw ? [pola.pasek_zestaw] : []),
  ]);
  if (zPola.size !== 1) continue;
  const nr = [...zPola][0];
  const skad = relative(KORZEN, plik);
  zebrz(nr, `${skad}: frontmatter`, [pola.title, pola.opis, pola.seo_tytul, pola.seo_opis].filter(Boolean).join('. '));
  zebrz(nr, `${skad}: FAQ`, fmSurowy.match(/faq:[\s\S]*/)?.[0] ?? '');
  zebrz(nr, `${skad}: treść`, tresc);
}

const rozjazdyDat = [];
for (const [nr, lista] of twierdzenia) {
  const glowne = lista.filter((d) => d.klasa === 'sprzedaz');
  if (!glowne.length) continue;
  // Porównujemy z dokładnością, jaką mają oba twierdzenia: dzień z dniem, miesiąc
  // z miesiącem. „listopad 2026" i „4 listopada 2026" to zgoda, nie sprzeczność.
  const pary = [];
  for (let i = 0; i < glowne.length; i++)
    for (let j = i + 1; j < glowne.length; j++) {
      const [a, b] = [glowne[i].iso, glowne[j].iso];
      const dlugosc = Math.min(a.length, b.length);
      if (a.slice(0, dlugosc) !== b.slice(0, dlugosc)) pary.push([glowne[i], glowne[j]]);
    }
  if (pary.length) rozjazdyDat.push({ nr, glowne, pary, pole: String(sety[nr]?.premiera ?? '') });
}
rozjazdyDat.sort((a, b) => b.pary.length - a.pary.length || a.nr.localeCompare(b.nr));

console.log(`Świeżość tekstów wobec danych — ${new Date().toISOString().slice(0, 10)}`);
console.log(`Sprawdzone: ${pliki(STRONY).length} plików .md w src/pages, dane: sety.json i przecieki.json\n`);

if (ustalenia.length === 0) {
  console.log('Teksty wobec przecieków — nic do zgłoszenia: żaden tekst nie nazywa przeciekiem numeru,');
  console.log('który jest już w sety.json, i żaden nie ma w przeciekach wpisu nowszego niż jego data aktualizacji.\n');
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

if (ustalenia.length) {
  console.log(`Razem: ${ustalenia.length} tekstów, w tym ${ustalenia.filter((u) => u.sprzeczne.length).length} ze sprzecznością.`);
  console.log('Sprzeczność to zdanie nieprawdziwe na produkcji i ma pierwszeństwo nad zaległością.');
}

console.log(`\nDaty premier — sprawdzone ${twierdzenia.size} zestawów, o których cokolwiek mówi datę wejścia do sprzedaży.`);
if (rozjazdyDat.length === 0) {
  console.log('Nic do zgłoszenia: każdy zestaw ma jedną datę we wszystkich miejscach, które o niej mówią.');
} else {
  for (const r of rozjazdyDat) {
    console.log(`\n## ${r.nr} — ${sety[r.nr]?.nazwa ?? '?'}  (pole premiera: ${r.pole || 'brak'})`);
    console.log('   SPRZECZNOŚĆ — miejsca podają różne daty wejścia do sprzedaży:');
    // Grupujemy po dacie, nie po parach: przy czterech źródłach par jest sześć i wypis
    // powtarzałby te same dwie daty kilka razy.
    const poDacie = new Map();
    for (const d of r.glowne) {
      if (!poDacie.has(d.iso)) poDacie.set(d.iso, []);
      poDacie.get(d.iso).push(d);
    }
    for (const [iso, lista] of [...poDacie].sort(([a], [b]) => a.localeCompare(b))) {
      console.log(`     ${iso}  „${lista[0].tekst}"`);
      const zrodla = [...new Set(lista.map((d) => d.zrodlo))];  // tytuł i opis w tym samym frontmatterze to jedno miejsce
      for (const z of zrodla.slice(0, 3)) console.log(`        ← ${z}`);
      if (zrodla.length > 3) console.log(`        ← … i ${zrodla.length - 3} w tym samym pliku`);
    }
    const inne = (twierdzenia.get(r.nr) ?? []).filter((d) => d.klasa !== 'sprzedaz');
    if (inne.length) console.log(`   (nie porównywane: ${inne.map((d) => `${d.iso} jako ${d.klasa}`).join(', ')})`);
  }
  const odmienZestaw = (n) => {
    const d = n % 10, dd = n % 100;
    return n === 1 ? 'zestaw' : d >= 2 && d <= 4 && !(dd >= 12 && dd <= 14) ? 'zestawy' : 'zestawów';
  };
  console.log(`\nRazem: ${rozjazdyDat.length} ${odmienZestaw(rozjazdyDat.length)} z dwiema różnymi datami w naszych tekstach.`);
  console.log('Pole `opis` idzie do danych strukturalnych huba, więc błędna data w nim jest widoczna dla Google.');
}

const jestSprzecznosc = ustalenia.some((u) => u.sprzeczne.length) || rozjazdyDat.some((r) => r.pary.length);
if (kod && jestSprzecznosc) process.exit(1);
