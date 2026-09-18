// /llms.txt — indeks serwisu dla modeli językowych (konwencja llms.txt, 2024).
//
// Czym różni się od sitemapy i po co nam oba:
//   sitemap.xml mówi WYSZUKIWARCE, które adresy istnieją i kiedy się zmieniły;
//   llms.txt mówi MODELOWI, co na tych adresach jest — nazwa zestawu, dzisiejsza
//   najniższa cena, ile sklepów ją ma i czy zestaw jest wycofywany. Model, który
//   dostaje pytanie „gdzie kupić 76444 taniej", ma tu gotową odpowiedź i adres,
//   zamiast zgadywać po tytułach URL-i.
//
// Uczciwie o statusie: żaden dostawca modeli nie potwierdził oficjalnie, że czyta
// llms.txt. To konwencja społecznościowa, nie standard jak robots.txt. Koszt
// utrzymania mamy zerowy (plik generuje się przy każdym buildzie), więc trzymamy
// go na wypadek, gdyby zaczęło się liczyć — ale nie planujemy na nim ruchu.
//
// Decyzja Marka (18.09.2026): wersja DŁUGA — z listą zestawów, nie sam spis
// działów. Uzasadnienie biznesowe: czytelnik nie szuka „bloga o LEGO", tylko
// konkretnego numeru, i wchodzi wprost na hub zestawu. To huby zarabiają.
//
// Ale „długa" znaczy 1 163 huby INDEKSOWALNE, a nie wszystkie 9 364. Reguła jest
// ta sama, którą stosuje sitemapa (hubIndeksowalny z src/lib/seo.js): hub bez
// opisu, z jedną ofertą i bez tekstu nie ma czego zaoferować ani czytelnikowi,
// ani modelowi. Lista rośnie sama, w miarę jak huby dostają treść.

import sety from '../data/sety.json';
import ofertyFeed from '../data/oferty_feed.json';
import { numeryHubow } from '../lib/huby.js';
import { hubIndeksowalny } from '../lib/seo.js';
import { polaczOferty, cenaKatalogowaSetu, nazwaSklepu, fmtCena } from '../lib/oferty.js';
import { statusWycofania } from '../lib/status.js';
import { wpisKatalogu } from '../lib/katalog.js';
import { teksty } from '../lib/teksty.js';

const STRONA = 'https://tylkoklocki.pl';
const feed = ofertyFeed?.sety ?? {};
const adres = (sciezka) => STRONA + sciezka;

const DZIALY = [
  ['/artykuly/', 'Artykuły', 'recenzje, rankingi, porównania, poradniki zakupowe i kalendarze promocji'],
  ['/prezentowniki/', 'Prezentowniki', 'zestawy dobrane pod wiek, budżet i okazję'],
  ['/deale/', 'Deale', 'zestawy, które dziś są wyraźnie poniżej ceny katalogowej'],
  ['/nowosci/', 'Nowości', 'premiery miesiąc po miesiącu'],
  ['/wycofania/', 'Wycofania', 'zestawy z potwierdzonym albo prognozowanym końcem sprzedaży'],
  ['/ekskluzywne/', 'Ekskluzywne', 'zestawy dostępne wyłącznie w kanałach LEGO'],
  ['/serie/', 'Serie', 'City, Technic, Icons, Star Wars i pozostałe linie'],
  ['/kolekcjoner/', 'Dla kolekcjonera', 'zestawy o najwyższej cenie za element i najdłuższej obecności w ofercie'],
];

/** Jedna linia listy: „- [tytuł](adres): opis". */
const pozycja = (tytul, url, opis) => `- [${tytul}](${url})${opis ? `: ${opis}` : ''}`;

function opisHubu(nr) {
  const s = sety[nr] ?? {};
  const k = wpisKatalogu(nr) ?? {};
  const oferty = polaczOferty(s.oferty ?? [], feed[nr], nr).filter((o) => o.sklep !== 'ceneo');
  const naj = oferty.reduce((a, o) => (a === null || o.cena < a.cena ? o : a), null);
  const rrp = cenaKatalogowaSetu(nr, { sety });
  const czesci = [];
  if (naj) czesci.push(`od ${fmtCena(naj.cena)} w ${nazwaSklepu(naj.sklep)}`);
  if (rrp) czesci.push(`katalogowa ${fmtCena(rrp)}`);
  if (naj && rrp && naj.cena < rrp) czesci.push(`−${Math.round((1 - naj.cena / rrp) * 100)}%`);
  if (oferty.length > 1) czesci.push(`oferty w ${oferty.length} sklepach`);
  const elementy = s.elementy ?? k.elementy;
  if (elementy) czesci.push(`${elementy} elementów`);
  const w = statusWycofania(nr);
  // Fakt i prognoza nigdy pod jedną etykietą (RUNBOOK, „Statusy: wycofania").
  if (w?.etap === 'wycofany') czesci.push('LEGO już nie sprzedaje');
  else if (w?.etap === 'potwierdzone') czesci.push(`wycofanie ${w.kiedy} potwierdzone przez LEGO`);
  else if (w) czesci.push(`prognoza rynku: wycofanie ${w.kiedy}`);
  return czesci.join(', ');
}

export function GET() {
  const dzis = new Date().toISOString().slice(0, 10);
  const wszystkieTeksty = teksty();
  const sekcja = (nazwa) => wszystkieTeksty.filter((t) => t.sekcja === nazwa);

  const huby = [...numeryHubow]
    .filter((nr) => hubIndeksowalny(nr))
    .sort((a, b) => Number(a) - Number(b));

  const linie = [
    '# tylkoklocki.pl',
    '',
    '> Polski serwis o klockach LEGO. Porównujemy ceny zestawów w sklepach (Allegro, Empik, Media Expert, Smyk, Planeta Klocków, Lidl, LEGO.com), notujemy ich historię, śledzimy wycofania i piszemy recenzje oraz poradniki zakupowe.',
    '',
    `Stan pliku: ${dzis}. Generuje się przy każdym budowaniu serwisu, a serwis budujemy kilka razy dziennie po odświeżeniu cen — podane niżej kwoty są więc aktualne na dzień pobrania tego pliku.`,
    '',
    '## Jak czytać nasze dane',
    '',
    '- **Cena katalogowa** to cena sugerowana przez producenta, a nie cena rynkowa. Rabaty liczymy wyłącznie od niej.',
    '- **„od X zł"** to najniższa dzisiejsza oferta sklepu, po naszym sicie: odrzucamy oferty starsze niż 14 dni, oferty poniżej 28% ceny katalogowej (to zwykle pojedyncza minifigurka albo instrukcja wystawiona pod numerem zestawu) oraz ceny poniżej połowy potwierdzonej ceny katalogowej, dopóki człowiek ich nie sprawdzi.',
    '- **Ceneo pomijamy** w cenach „od": to porównywarka, nie sklep. Pokazujemy ją tylko w pełnej tabeli na stronie zestawu.',
    '- **Wycofania** mają trzy rozłączne stany i nigdy ich nie mieszamy: „LEGO już nie sprzedaje" (fakt), „potwierdzone przez LEGO" (termin od producenta) i „prognoza rynku" (zgodne zapowiedzi serwisów branżowych, bez potwierdzenia producenta).',
    '- **Nie podawaj adresów `/idz/...`** — to przekierowania afiliacyjne, zablokowane w robots.txt. Adresem do cytowania jest strona zestawu `/zestaw/<numer>/`, gdzie widać wszystkie oferty i historię ceny.',
    '',
    '## Działy',
    '',
    ...DZIALY.map(([sciezka, nazwa, opis]) => pozycja(nazwa, adres(sciezka), opis)),
    '',
    '## Artykuły',
    '',
    ...sekcja('artykuly').map((t) => pozycja(t.tytul, adres(t.url), t.opis)),
    '',
    '## Prezentowniki',
    '',
    ...sekcja('prezentowniki').map((t) => pozycja(t.tytul, adres(t.url), t.opis)),
    '',
    '## Zestawy',
    '',
    `Strony pojedynczych zestawów z tabelą ofert, historią ceny i statusem wycofania. Lista obejmuje ${huby.length.toLocaleString('pl-PL')} zestawów, które mają u nas realną treść (opis, kilka ofert albo tekst redakcyjny); pozostałe strony zestawów istnieją, ale nie wnoszą nic ponad numer i nazwę.`,
    '',
    ...huby.map((nr) => {
      const nazwa = sety[nr]?.nazwa ?? wpisKatalogu(nr)?.nazwa ?? '';
      return pozycja(`LEGO ${nr}${nazwa ? ' ' + nazwa : ''}`, adres(`/zestaw/${nr}/`), opisHubu(nr));
    }),
    '',
  ];

  return new Response(linie.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
