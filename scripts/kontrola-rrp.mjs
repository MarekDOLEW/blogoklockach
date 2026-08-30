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
//   2. wypisuje ceny, których nie ma w żadnym zweryfikowanym wpisie i które
//      nie leżą na polskiej drabinie cenowej — kandydatów do sprawdzenia.
//
// Użycie:
//   node scripts/kontrola-rrp.mjs           # raport
//   node scripts/kontrola-rrp.mjs --napraw  # nadpisz katalog danymi zweryfikowanymi
//
// Kod wyjścia 1, gdy są rozbieżności — nadaje się do bramki przed commitem.

import { readFileSync, writeFileSync } from 'node:fs';

const sciezka = (p) => new URL(`../src/data/${p}`, import.meta.url);
const czytaj = (p) => JSON.parse(readFileSync(sciezka(p)));

const katalog = czytaj('katalog.json');
const cenyBaza = czytaj('ceny_baza.json');
const rrpPotwierdzone = czytaj('rrp_potwierdzone.json');
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
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) if (s.cena_katalogowa) wpisy.push({ ...s, seria, wpis: s });
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
  const potw = zweryfikowana(r.numer) !== null ? 'RRP potwierdzone → podejrzany rynek' : 'RRP niepotwierdzone → sprawdź cenę katalogową';
  console.log(`  ${r.numer.padEnd(8)} katalog ${String(r.cena_katalogowa).padStart(8)} | rynek ${String(r.rynek).padStart(8)}  (${potw})`);
}

if (naprawiaj && rozbiezne.length) {
  // Kształt pliku zachowujemy dokładnie taki, jaki zastaliśmy — RUNBOOK
  // („Stabilność formatu plików JSON"): katalog.json ma wcięcie 1 spacji i NIE
  // kończy się znakiem nowej linii. Wcześniejsza wersja dopisywała `\n`, czyli
  // do diffu z poprawkami cen doklejała zmianę formatu. Round-trip sprawdzamy
  // przed zapisem, żeby wypisać, ile linii zmienia samo formatowanie.
  const przed = readFileSync(sciezka('katalog.json'), 'utf8');
  const konczyNowaLinia = przed.endsWith('\n');
  const serializuj = () => JSON.stringify(katalog, null, 1) + (konczyNowaLinia ? '\n' : '');

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

  for (const r of rozbiezne) r.wpis.cena_katalogowa = r.pewna;
  writeFileSync(sciezka('katalog.json'), serializuj());
  console.log(`Naprawiono ${rozbiezne.length} wpisów w katalog.json.`);
  process.exit(0);
}

process.exit(rozbiezne.length ? 1 : 0);
