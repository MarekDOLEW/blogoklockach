// Audyt wycofań i statusów EOL – porównuje trzy źródła prawdy o tym, czy
// zestaw jest jeszcze w sprzedaży: wycofania.json (runner Wycofań),
// katalog.json (status z Bricksetu/scouta) i oferty sklepów (Łowca).
//
//   node scripts/audyt-wycofan.mjs           – raport na konsolę
//   node scripts/audyt-wycofan.mjs --napraw  – dodatkowo przestawia w katalog.json
//                                              status na "eol" tam, gdzie lista
//                                              wycofań mówi `kiedy: "wycofany"`
//
// Reguła (RUNBOOK, „Statusy: wycofania, nowości, EOL"): wpis na liście wycofań
// przesądza. `kiedy: "wycofany"` => katalog `eol`. Odwrotnego automatu nie ma:
// katalog `eol` przy wpisie z przyszłym terminem to sygnał do ręcznego
// sprawdzenia (który z runnerów ma rację), nie do przestawienia.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const KATALOG = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const wczytaj = (plik) => JSON.parse(readFileSync(join(KATALOG, plik), 'utf8'));

const napraw = process.argv.includes('--napraw');

const wycofania = wczytaj('wycofania.json');
const katalog = wczytaj('katalog.json');
const sety = wczytaj('sety.json');
const feed = wczytaj('oferty_feed.json').sety ?? {};

const katIdx = new Map();
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) if (!katIdx.has(s.numer)) katIdx.set(s.numer, { ...s, seria });
}
const wyIdx = new Map(wycofania.wycofania.map((w) => [w.numer, w]));

const maOferteSklepu = (nr) => {
  const w = feed[nr];
  const zFeedu = w?.oferty && typeof w.oferty === 'object'
    ? Object.values(w.oferty).some((c) => typeof c === 'number' && c > 0)
    : Boolean(w?.cena);
  const zSetow = (sety[nr]?.oferty ?? []).some((o) => o.sklep !== 'lego' && o.sklep !== 'ceneo');
  return zFeedu || zSetow;
};

const sekcja = (tytul, lista, pokaz = 15) => {
  console.log(`\n${tytul}: ${lista.length}`);
  if (lista.length) console.log('  ' + lista.slice(0, pokaz).join(', ') + (lista.length > pokaz ? ', …' : ''));
};

const wyc = [...wyIdx.values()];
const A = wyc.filter((w) => w.kiedy === 'wycofany' && katIdx.get(w.numer)?.status === 'dostepny').map((w) => w.numer);
const B = wyc.filter((w) => w.kiedy !== 'wycofany' && w.kiedy !== 'odwołane' && katIdx.get(w.numer)?.status === 'eol')
  .map((w) => `${w.numer} (${w.status}, ${w.kiedy})`);
const C = wyc.filter((w) => !katIdx.has(w.numer)).map((w) => w.numer);
const D = wyc.filter((w) => w.kiedy === 'wycofany' && w.status !== 'potwierdzone').map((w) => w.numer);
const E = wyc.filter((w) => !['potwierdzone', 'przewidywane'].includes(w.status) || !w.kiedy).map((w) => w.numer);
const F = wyc.filter((w) => w.kiedy === 'wycofany' && !maOferteSklepu(w.numer)).map((w) => w.numer);
const G = wyc.filter((w) => w.kiedy !== 'wycofany' && w.kiedy !== 'odwołane' && !maOferteSklepu(w.numer)).map((w) => w.numer);
const H = [...katIdx.values()].filter((s) => s.status === 'dostepny' && !maOferteSklepu(s.numer) && !wyIdx.has(s.numer))
  .map((s) => `${s.numer} (${s.seria})`);
const eolZOferta = [...katIdx.values()].filter((s) => s.status === 'eol' && !wyIdx.has(s.numer) && maOferteSklepu(s.numer)).length;

console.log(`Lista wycofań: ${wyc.length} wpisów (${wyc.filter((w) => w.status === 'potwierdzone').length} potwierdzonych przez LEGO, ${wyc.filter((w) => w.status === 'przewidywane').length} prognoz rynku, ${wyc.filter((w) => w.kiedy === 'wycofany').length} już wycofanych); katalog: ${katIdx.size} zestawów.`);
sekcja('A. kiedy=wycofany, a katalog.json mówi "dostepny" (do przestawienia na eol; --napraw)', A);
sekcja('B. katalog.json "eol", a lista wycofań podaje przyszły termin (sprawdzić ręcznie, kto ma rację)', B);
sekcja('C. wpis na liście wycofań bez wpisu w katalog.json', C);
sekcja('D. kiedy=wycofany ze statusem innym niż "potwierdzone" (niedozwolone)', D);
sekcja('E. wpis z nieznanym statusem albo bez pola kiedy', E);
sekcja('F. już wycofane (EOL) bez żadnej oferty sklepu – na listingu "wycofany (EOL)", tylko rynek wtórny', F);
sekcja('G. z terminem w przyszłości, ale bez oferty sklepu – listing pokazuje cenę katalogową z linkiem do LEGO.com', G);
sekcja('H. katalog "dostepny" bez oferty w żadnym sklepie i poza listą wycofań – kandydaci do sprawdzenia na lego.com', H);
console.log(`\nI. katalog "eol" (poza listą wycofań) z ofertą sklepu – na listingu "w sprzedaży" + EOL: ${eolZOferta}`);

if (napraw && A.length) {
  const zbior = new Set(A);
  let zmienione = 0;
  for (const [seria, lista] of Object.entries(katalog)) {
    if (seria === '_meta' || !Array.isArray(lista)) continue;
    for (const s of lista) {
      if (zbior.has(s.numer) && s.status === 'dostepny') { s.status = 'eol'; zmienione += 1; }
    }
  }
  const surowy = readFileSync(join(KATALOG, 'katalog.json'), 'utf8');
  const wciecie = /^\{\n {2}"/.test(surowy) ? 2 : /^\{\n "/.test(surowy) ? 1 : 0;
  writeFileSync(join(KATALOG, 'katalog.json'), JSON.stringify(katalog, null, wciecie || undefined) + (surowy.endsWith('\n') ? '\n' : ''));
  console.log(`\n--napraw: przestawiono ${zmienione} statusów na "eol" w katalog.json`);
} else if (napraw) {
  console.log('\n--napraw: nic do przestawienia');
}
