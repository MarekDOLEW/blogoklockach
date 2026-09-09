// Które huby /zestaw/<nr>/ Google ma indeksować.
//
// Tło (Search Console, 24.08 i 09.09.2026): domena jest nowa, Google przydziela
// jej mały budżet crawlowania, a sitemapa zgłaszała 3 418 hubów przy 20
// artykułach. Huby bez tekstu redakcyjnego to jeden szablon w tysiącach
// wariantów – dla Google niska wartość, która ciągnie w dół całą domenę.
// Filtr „opis albo dwa sklepy" z 25.08 przestał wystarczać, bo Łowca dokłada
// sklepy i pula urosła z 1 099 do 3 418.
//
// Zasada: hub jest indeksowalny, gdy spełnia CO NAJMNIEJ TRZY z czterech
// warunków (albo należy do wyjątków niżej):
//   A. co najmniej trzy sklepy z ceną (bez Ceneo – to porównywarka, nie sklep)
//      – dopiero wtedy tabela jest porównaniem, a nie listą dwóch ofert,
//   B. tekst redakcyjny dłuższy niż 300 znaków (opis, persony z sety.json,
//      karta z karty_setow.json albo uwagi z listy wycofań),
//   C. wspomniany w co najmniej jednym naszym tekście (artykuł, prezentownik,
//      deal – link do huba, slajder, tabela cen albo pole `zestawy`),
//   D. premiera w ostatnich 18 miesiącach i zestaw nie jest wycofany.
// Zawsze indeksowalny: zestaw z gorącym dealem (jak na /deale/) albo obecny
// w prezentowniku.
//
// Progi wybrane na danych z 09.09.2026 (4 947 hubów): przy „dwóch z czterech"
// wychodziło 1 212 hubów; „trzy z czterech" z dwoma sklepami i premierą do
// 24 miesięcy – 815 (+ wyjątki 853); trzy sklepy i 18 miesięcy – 799.
// Cel: 300–800 hubów w indeksie. Sam wyjątek dealowy dodaje ~170 hubów
// (wszystkie mają już dwa z czterech warunków) – gdyby trzeba było zejść
// niżej, to jest pierwsza gałka do przekręcenia.
//
// Hub nieindeksowalny nadal istnieje i działa (linki z tabel serii i z
// wyszukiwarki nie mogą się zepsuć) – dostaje tylko <meta name="robots"
// content="noindex, follow"> i nie trafia do sitemapy. Wszystko liczy się przy
// buildzie, więc gdy Łowca dorzuci sklep albo redakcja opisze zestaw, hub
// wraca do indeksu sam.

import sety from '../data/sety.json';
import ofertyFeed from '../data/oferty_feed.json';
import karty from '../data/karty_setow.json';
import cenyBaza from '../data/ceny_baza.json';
import { wpisKatalogu } from './katalog.js';
import { wycofanieSetu } from './huby.js';
import { polaczOferty } from './oferty.js';
import { premieraSetu } from './premiery.js';
import { tekstyOZestawie, wPrezentowniku } from './teksty.js';

const feed = ofertyFeed?.sety ?? {};

export const MIN_SKLEPOW = 3;
export const MIN_ZNAKOW_OPISU = 300;
export const MIESIACE_PREMIERY = 18;
export const MIN_WARUNKOW = 3;

const dzis = new Date();
const progPremiery = (() => {
  const d = new Date(dzis);
  d.setMonth(d.getMonth() - MIESIACE_PREMIERY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
})();

const bezHtml = (t) => String(t ?? '').replace(/<[^>]+>/g, '').trim();

/** Ten sam slug serii co w src/pages/serie/[seria].astro. */
export const slugSerii = (seria) =>
  String(seria).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');

/** Liczba znaków tekstu redakcyjnego o zestawie (bez szablonu strony). */
export function dlugoscOpisu(nr) {
  const klucz = String(nr);
  const s = sety[klucz];
  const zSetow = bezHtml(s?.opis).length + bezHtml(s?.dla_rodzica).length + bezHtml(s?.dla_afol).length;
  const zKarty = (karty[klucz]?.akapity ?? []).map(bezHtml).join(' ').length;
  const zWycofan = bezHtml(wycofanieSetu(klucz)?.uwagi).length;
  return Math.max(zSetow, zKarty, zWycofan);
}

/** Czy zestaw jest wycofany z produkcji (EOL). */
export function wycofanyZProdukcji(nr) {
  const klucz = String(nr);
  const w = wycofanieSetu(klucz);
  if (w) return w.kiedy === 'wycofany';
  return wpisKatalogu(klucz)?.status === 'eol';
}

/** Gorący deal – ta sama reguła co lista na /deale/: rabat ≥30% od ceny
 *  katalogowej albo świeże minimum notowań przy rabacie ≥15%. */
export function goracyDeal(nr) {
  const klucz = String(nr);
  const s = sety[klucz];
  if (!s?.oferty?.length || !s.cena_katalogowa) return false;
  const najlepsza = Math.min(...s.oferty.map((o) => o.cena));
  const rabat = Math.round((1 - najlepsza / s.cena_katalogowa) * 100);
  const dzien = s.oferty.map((o) => o.data ?? '').reduce((a, b) => (b > a ? b : a), '');
  const noweMinimum =
    cenyBaza[klucz]?.najnizsza_data === dzien && cenyBaza[klucz]?.najnizsza_cena === najlepsza;
  return rabat >= 30 || (noweMinimum && rabat >= 15);
}

/**
 * Pełna ocena huba – do decyzji o noindex, do sitemapy i do raportów.
 * Zwraca { indeksowalny, warunki: {sklepy, opis, tekst, premiera}, wyjatek }.
 */
export function ocenaHubu(nr) {
  const klucz = String(nr);
  const s = sety[klucz];
  const sklepy = new Set(polaczOferty(s?.oferty ?? [], feed[klucz], klucz).map((o) => o.sklep));
  sklepy.delete('ceneo');
  const premiera = premieraSetu(klucz);

  const warunki = {
    sklepy: sklepy.size >= MIN_SKLEPOW,
    opis: dlugoscOpisu(klucz) > MIN_ZNAKOW_OPISU,
    tekst: tekstyOZestawie(klucz).length >= 1,
    premiera: Boolean(premiera && premiera >= progPremiery) && !wycofanyZProdukcji(klucz),
  };
  const spelnione = Object.values(warunki).filter(Boolean).length;
  const wyjatek = wPrezentowniku(klucz) ? 'prezentownik' : goracyDeal(klucz) ? 'deal' : null;

  return { indeksowalny: Boolean(wyjatek) || spelnione >= MIN_WARUNKOW, warunki, spelnione, wyjatek };
}

const cache = new Map();

/** Czy hub /zestaw/<nr>/ ma być indeksowany (i zgłaszany w sitemapie). */
export function hubIndeksowalny(nr) {
  const klucz = String(nr);
  if (!cache.has(klucz)) cache.set(klucz, ocenaHubu(klucz).indeksowalny);
  return cache.get(klucz);
}

const maxData = (daty) => daty.filter(Boolean).reduce((a, b) => (b > a ? b : a), '') || null;

/** Data ostatniej oferty sklepowej zestawu (sety.json + feed) albo null. */
export function dataOfertHubu(nr) {
  const klucz = String(nr);
  return maxData([...(sety[klucz]?.oferty ?? []).map((o) => o.data), feed[klucz]?.data]);
}

/**
 * Data ostatniej zmiany treści huba do <lastmod> – albo null.
 *
 * Dwa źródła: publikacja/aktualizacja naszego tekstu o zestawie (hub dostaje
 * wtedy nowy blok odsyłaczy) i data ostatniej oferty sklepowej – tego dnia
 * realnie zmieniła się tabela cen, czyli główna treść huba. Decyzja Marka
 * (09.09.2026): dla stron, które realnie zmieniają się codziennie, świeża data
 * jest prawdziwa, więc może iść do sitemapy. Nie stemplujemy natomiast datą
 * builda hubów, których nikt nie sprawdzał – bez tekstu i bez oferty lastmod
 * pomijamy.
 */
export function lastmodHubu(nr) {
  return maxData([...tekstyOZestawie(nr).map((t) => t.lastmod), dataOfertHubu(nr)]);
}
