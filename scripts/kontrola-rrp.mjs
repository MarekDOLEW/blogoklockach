// Kontrola cen katalogowych w katalog.json.
//
// Skąd problem: `cena_katalogowa` w katalog.json jest uzupełniana partiami
// (backfill per seria) na podstawie Bricksetu, a Brickset podaje ceny w GBP,
// USD i EUR — nie w złotówkach. Przeliczenie kursem daje kwoty, których
// w polskim cenniku LEGO w ogóle nie ma: 59,99 € to u nas 249,99 zł, a nie
// 259,99 zł. Kontrola z 25.08.2026 znalazła 22 takie wpisy na 198 możliwych
// do porównania (11%), w większości zawyżone — jeden set miał 304,99 zł
// zamiast 104,99 zł.
//
// Przebieg 30.08.2026: po zaciągu pełnego katalogu lego.com/pl-pl (Firecrawl,
// 28.08) rejestr potwierdzony urósł do 814 pozycji, przez co porównywalnych
// setów jest 764 zamiast 198, a rozbieżnych było 127 (17%). Wszystkie
// naprawione przez `--napraw`; strona tych błędów nie pokazywała, bo
// cenaKatalogowaSetu() czyta rrp_potwierdzone.json przed katalog.json.
//
// Dlaczego to boli: `cenaKatalogowaSetu()` schodzi do katalog.json dla setów
// spoza sety.json i ceny_baza.json, a od RRP liczymy rabat w tabelach cen.
// Zawyżone RRP = zmyślony rabat na stronie.
//
// Co robi skrypt:
//   1. porównuje katalog.json ze źródłami zweryfikowanymi (sety.json,
//      ceny_baza.json) tam, gdzie set występuje w obu — to miara błędu;
//   2. liczy wpisy BEZ ceny, dla których źródło zweryfikowane ją zna (Radar
//      22.09.2026: porównanie brało tylko wpisy z ceną, więc 112 pustych cen
//      przeleżało niezauważonych) — liczą się jak rozbieżność;
//   3. wypisuje ceny, których nie ma w żadnym zweryfikowanym wpisie i które
//      nie leżą na polskiej drabinie cenowej — kandydatów do sprawdzenia.
//   4. test rynkowy w obie strony: rynek poniżej 50% RRP (zawyżona cena
//      katalogowa albo fałszywa oferta) oraz rynek powyżej 200% RRP z co
//      najmniej dwóch sklepów, liczony tylko dla bieżącej oferty (zaniżone
//      RRP, upominek GWP odsprzedawany powyżej wyceny albo podszywka) —
//      oba to raporty do ręcznego rozstrzygnięcia, nie automatyczne poprawki.
//
// Użycie:
//   node scripts/kontrola-rrp.mjs           # raport
//   node scripts/kontrola-rrp.mjs --napraw  # nadpisz katalog danymi zweryfikowanymi
//
// Kod wyjścia 1, gdy są rozbieżności albo puste ceny, które źródło zna —
// nadaje się do bramki przed commitem.

import { readFileSync, writeFileSync } from 'node:fs';

const sciezka = (p) => new URL(`../src/data/${p}`, import.meta.url);
const czytaj = (p) => JSON.parse(readFileSync(sciezka(p)));

const katalog = czytaj('katalog.json');
const cenyBaza = czytaj('ceny_baza.json');
const rrpPotwierdzone = czytaj('rrp_potwierdzone.json');
const dealePotwierdzone = JSON.parse(readFileSync(new URL('../src/data/deale_potwierdzone.json', import.meta.url)));
const sety = czytaj('sety.json');

const naprawiaj = process.argv.includes('--napraw');

// Rejestr potwierdzony przez człowieka jest ponad wszystkim — cena katalogowa
// nie zmienia się w czasie, więc raz sprawdzona u źródła nie podlega dyskusji.
const zweryfikowana = (nr) =>
  rrpPotwierdzone[nr]?.cena ??
  sety[nr]?.cena_katalogowa ??
  (nr !== '_meta' ? cenyBaza[nr]?.cena_katalogowa : null) ??
  null;

// Polska drabina cenowa LEGO: wszystkie kwoty kończą się na ,99 i schodzą
// z listy cen, a nie z przelicznika walutowego. Zbieramy ją z danych
// zweryfikowanych — jeśli kwoty z katalogu nie ma na tej liście ani w jej
// bezpośrednim sąsiedztwie, to sygnał, że powstała z przeliczenia.
const drabina = new Set();
for (const [nr, w] of Object.entries(cenyBaza)) if (nr !== '_meta' && w.cena_katalogowa) drabina.add(w.cena_katalogowa);
for (const s of Object.values(sety)) if (s.cena_katalogowa) drabina.add(s.cena_katalogowa);
for (const [nr, w] of Object.entries(rrpPotwierdzone)) if (nr !== '_meta' && w.cena) drabina.add(w.cena);

const wpisy = [];
const puste = [];
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) {
    if (s.cena_katalogowa) wpisy.push({ ...s, seria, wpis: s });
    else if (zweryfikowana(s.numer) !== null) puste.push({ ...s, seria, wpis: s, pewna: zweryfikowana(s.numer) });
  }
}

const rozbiezne = [];
for (const w of wpisy) {
  const pewna = zweryfikowana(w.numer);
  if (pewna !== null && pewna !== w.cena_katalogowa) rozbiezne.push({ ...w, pewna });
}

console.log(`Wpisów z ceną katalogową: ${wpisy.length}`);
console.log(`Potwierdzonych przez człowieka (rrp_potwierdzone.json): ${Object.keys(rrpPotwierdzone).length - 1}`);
console.log(`Porównywalnych ze źródłem zweryfikowanym: ${wpisy.filter((w) => zweryfikowana(w.numer) !== null).length}`);
console.log(`ROZBIEŻNYCH: ${rozbiezne.length}`);
for (const r of rozbiezne.slice(0, 40)) {
  const kierunek = r.cena_katalogowa > r.pewna ? 'zawyżona' : 'zaniżona';
  console.log(`  ${r.numer.padEnd(8)} ${r.seria.padEnd(16)} katalog ${String(r.cena_katalogowa).padStart(8)} | pewna ${String(r.pewna).padStart(8)}  (${kierunek})`);
}
console.log(`PUSTYCH, A ŹRÓDŁO ZNA CENĘ: ${puste.length}`);
for (const r of puste.slice(0, 40)) {
  console.log(`  ${r.numer.padEnd(8)} ${r.seria.padEnd(16)} katalog    pusta | pewna ${String(r.pewna).padStart(8)}`);
}

const nieNaDrabinie = wpisy.filter((w) => zweryfikowana(w.numer) === null && !drabina.has(w.cena_katalogowa));
const wgKwoty = new Map();
for (const w of nieNaDrabinie) wgKwoty.set(w.cena_katalogowa, (wgKwoty.get(w.cena_katalogowa) ?? 0) + 1);
console.log(`\nKwoty spoza drabiny (bez źródła zweryfikowanego): ${wgKwoty.size} kwot, ${nieNaDrabinie.length} setów`);
console.log('To tylko sygnał, nie błąd — drabina zna dziś ceny tylko z 270 zweryfikowanych setów.');
for (const [c, n] of [...wgKwoty.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${String(c).padStart(8)} — ${n} setów`);
}

// Test rynkowy (audyt 30.08.2026): cena rynkowa z feedów poniżej 50% ceny
// katalogowej to sygnał, że KTÓRAŚ z dwóch stron jest błędna — zawyżone RRP
// (przelicznik walutowy Backfillu) albo fałszywy „rynek" (zaślepka cenowa
// sklepu jak PK 79,99/559,99, oferta-podszywka na marketplace). Audyt z 30.08
// pokazał, że po naprawach RRP przeważa druga kategoria — dlatego to raport
// do ręcznego rozstrzygnięcia, nie automatyczna poprawka. Rozstrzyganie:
// wpis potwierdzony w rrp_potwierdzone/RK → wina rynku (zgłoś Łowcy do
// wykluczeń); wpis bez niezależnego potwierdzenia → usuń cenę z katalogu.
const feed = czytaj('oferty_feed.json').sety ?? {};
const SKLEPY_FEED = ['mediaexpert', 'planetaklockow', 'allegro', 'smyk', 'empik'];
const rynkowe = [];
for (const w of wpisy) {
  const oferty = feed[w.numer]?.oferty;
  if (!oferty) continue;
  const ceny = SKLEPY_FEED.map((s) => oferty[s]).filter((c) => typeof c === 'number' && c > 0);
  if (!ceny.length) continue;
  const rynek = Math.min(...ceny);
  if (rynek < w.cena_katalogowa * 0.5) rynkowe.push({ ...w, rynek });
}
console.log(`\nTest rynkowy (rynek < 50% ceny katalogowej): ${rynkowe.length} setów`);
for (const r of rynkowe.slice(0, 30)) {
  const potwDeal = dealePotwierdzone.potwierdzone?.[r.numer];
  const potw = zweryfikowana(r.numer) === null
    ? 'RRP niepotwierdzone → sprawdź cenę katalogową'
    : potwDeal && r.rynek >= potwDeal.cena - 0.01
      ? `RRP potwierdzone, oferta sprawdzona przez człowieka ${potwDeal.data} (${potwDeal.kto}) → na stronie`
      : 'RRP potwierdzone → podejrzany rynek, UKRYTA na stronie do potwierdzenia w deale_potwierdzone.json';
  console.log(`  ${r.numer.padEnd(8)} katalog ${String(r.cena_katalogowa).padStart(8)} | rynek ${String(r.rynek).padStart(8)}  (${potw})`);
}

// Test rynkowy w drugą stronę (16.11.2026): rynek WIELOKROTNIE wyższy od ceny
// katalogowej psuje rabat tak samo jak RRP zawyżone, tylko odwrotnie: na hubie
// staje „cena powyżej katalogu", rabat wychodzi ujemny, a próg zakupu liczony
// od RRP nie ma sensu.
//
// UWAGA przy rozstrzyganiu — trafienia mają TRZY różne przyczyny i tylko
// pierwsza jest błędem do poprawienia:
//   1. zaniżone RRP (cena katalogowa z niepewnego źródła) — popraw u źródła;
//   2. upominek GWP, którego „cena katalogowa" to wycena LEGO („przybliżona
//      wartość"), a sklepy odsprzedają go powyżej niej — tu RRP jest poprawne
//      i NIE wolno go podnosić pod rynek (tak wygląda np. 40906 i 40899);
//   3. oferta-podszywka albo zaślepka cenowa w feedzie — zgłoś Łowcy.
// Kolumna po prawej mówi tylko, skąd wzięliśmy RRP, nie który to przypadek.
//
// Powód dopisania: 40887 SMART Play ma w sety.json 81,99 zł, a karta Empiku
// (sprawdzona u źródła 16.11) to pojedynczy zestaw, 185 elementów, 299 zł;
// Allegro 349 zł. Pierwszy test rynkowy go nie widział z DWÓCH powodów naraz:
// patrzy wyłącznie w dół i chodzi tylko po katalog.json, a tego numeru tam
// nie ma. Dlatego ten test idzie po feedzie i bierze cenę katalogową tą samą
// drogą co strona: rrp_potwierdzone → sety → ceny_baza → katalog.
//
// Dwa sklepy są wymagane, bo pojedyncza oferta na marketplace bywa podszywką
// albo zaślepką — dwie niezależne wysokie ceny to już rynek, nie wypadek.
// To raport do ręcznego rozstrzygnięcia, nie automatyczna poprawka: właściwe
// RRP ustala się u źródła (karta lego.com albo Brickset) i wpisuje do
// rrp_potwierdzone.json.
const PROG_ZANIZENIA = 2;
const MIN_SKLEPOW_ZANIZENIE = 2;
const MIESIECY_WSTECZ = 24;
const cenaZKatalogu = new Map(wpisy.map((w) => [w.numer, w.cena_katalogowa]));
const wpisKatalogu = new Map(wpisy.map((w) => [w.numer, w]));

// Granica wieku jest tu najważniejsza. Pierwsza wersja tego testu (bez niej)
// dała 848 trafień, a na górze listy stały zestawy sprzed lat: 10224 Ratusz
// z 2012 roku ma 799,99 zł w katalogu i 4599 zł na rynku. To nie jest błąd
// danych, tylko premia kolekcjonerska po wycofaniu — i gdyby test ją zgłaszał,
// utopiłby prawdziwe przypadki w szumie. Druga wersja próbowała odsiać to
// obecnością w katalog.json i też dała 848: katalog.json NIE jest bieżącą
// ofertą lego.com, tylko pełnym katalogiem z rocznikami i statusem „eol".
// Pytamy więc o zestawy, które realnie można dziś kupić w cenie katalogowej:
// premiera w sety.json z ostatnich ${MIESIECY_WSTECZ} miesięcy, albo wpis
// w katalogu z rocznikiem z tego okresu i bez statusu „eol".
const dzis = new Date();
const progPremiery = new Date(dzis.getFullYear(), dzis.getMonth() - MIESIECY_WSTECZ, 1)
  .toISOString()
  .slice(0, 7);
const rokProgu = Number(progPremiery.slice(0, 4));
const wBiezacejOfercie = (nr) => {
  const premiera = sety[nr]?.premiera;
  if (typeof premiera === 'string' && /^\d{4}-\d{2}$/.test(premiera)) return premiera >= progPremiery;
  const k = wpisKatalogu.get(nr);
  if (!k) return false;
  return k.status !== 'eol' && typeof k.rok === 'number' && k.rok >= rokProgu;
};

const zanizone = [];
for (const [nr, w] of Object.entries(feed)) {
  if (nr === '_meta') continue;
  const rrp = zweryfikowana(nr) ?? cenaZKatalogu.get(nr) ?? null;
  if (!rrp) continue;
  if (!wBiezacejOfercie(nr)) continue;
  const ceny = SKLEPY_FEED.map((s) => w.oferty?.[s]).filter((c) => typeof c === 'number' && c > 0);
  if (ceny.length < MIN_SKLEPOW_ZANIZENIE) continue;
  const rynek = Math.min(...ceny);
  if (rynek > rrp * PROG_ZANIZENIA) zanizone.push({ numer: nr, rrp, rynek, ile: ceny.length });
}
zanizone.sort((a, b) => b.rynek / b.rrp - a.rynek / a.rrp);
console.log(`\nTest rynkowy odwrotny (najtańsza z co najmniej ${MIN_SKLEPOW_ZANIZENIE} ofert > ${PROG_ZANIZENIA * 100}% ceny katalogowej, tylko bieżąca oferta): ${zanizone.length} setów`);
console.log(`Bieżąca oferta = premiera od ${progPremiery} albo rocznik katalogowy od ${rokProgu} bez statusu „eol" — bez tej granicy test zgłasza premię kolekcjonerską wycofanych zestawów (848 trafień), nie błąd danych.`);
for (const r of zanizone.slice(0, 30)) {
  const zrodlo = rrpPotwierdzone[r.numer]?.cena != null
    ? 'RRP potwierdzone u źródła → rynek, nie RRP (upominek GWP? podszywka?)'
    : sety[r.numer]?.cena_katalogowa != null
      ? 'RRP z sety.json, niepotwierdzone → sprawdź cenę katalogową'
      : cenyBaza[r.numer]?.cena_katalogowa != null
        ? 'RRP z ceny_baza.json, niepotwierdzone → sprawdź cenę katalogową'
        : 'RRP z katalog.json, niepotwierdzone → sprawdź cenę katalogową';
  const krotnosc = (r.rynek / r.rrp).toFixed(1);
  console.log(`  ${r.numer.padEnd(8)} katalog ${String(r.rrp).padStart(8)} | rynek ${String(r.rynek).padStart(8)} (x${krotnosc}, ofert: ${r.ile})  (${zrodlo})`);
}

if (naprawiaj && (rozbiezne.length || puste.length)) {
  // Kształt pliku zachowujemy dokładnie taki, jaki zastaliśmy — RUNBOOK
  // („Stabilność formatu plików JSON"): wcięcie i końcowy znak nowej linii
  // zostają takie, jakie są w pliku. Wcześniejsza wersja dopisywała `\n`, czyli
  // do diffu z poprawkami cen doklejała zmianę formatu. Round-trip sprawdzamy
  // przed zapisem, żeby wypisać, ile linii zmienia samo formatowanie.
  const przed = readFileSync(sciezka('katalog.json'), 'utf8');
  const konczyNowaLinia = przed.endsWith('\n');
  // Wcięcie bierzemy z pliku (25.09.2026 było już 2 spacje, a stała 1 przepisywała
  // cały katalog przy uzupełnieniu jednej ceny).
  const wciecie = przed.match(/^\{\n( +)/)?.[1].length ?? 1;
  const serializuj = () => JSON.stringify(katalog, null, wciecie) + (konczyNowaLinia ? '\n' : '');

  const bezZmian = serializuj();
  if (bezZmian !== przed) {
    const linie = (a, b) => {
      const x = a.split('\n');
      const y = b.split('\n');
      let n = 0;
      for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) n++;
      return n;
    };
    console.log(
      `\nUwaga: sama serializacja zmienia ${linie(przed, bezZmian)} linii ` +
        '(zapis Pythona podaje kwoty całkowite jako 1500.0, Node jako 1500). ' +
        'To zmiana zapisu, nie wartości.',
    );
  }

  for (const r of [...rozbiezne, ...puste]) r.wpis.cena_katalogowa = r.pewna;
  writeFileSync(sciezka('katalog.json'), serializuj());
  console.log(`Naprawiono ${rozbiezne.length} rozbieżnych i uzupełniono ${puste.length} pustych wpisów w katalog.json.`);
  process.exit(0);
}

process.exit(rozbiezne.length || puste.length ? 1 : 0);
