// „Zestawy pod lupą” (dział /deale/, od 30.10.2026 w miejsce „Okazji pod lupą”).
//
// Stary post dealowy miał cenę i „historyczne minimum” wpisane ręcznie w tytuł
// i treść – po kilku dniach kłamał. Nowy tekst opisuje, dlaczego warto mieć
// zestaw, a wszystko, co zmienia się z dnia na dzień (cena dziś, sklep, rabat,
// status względem progu), liczy ten moduł z tych samych danych co huby /zestaw/.
// Tekst żyje miesiącami; drabina cenowa stoi we frontmatterze:
//
//   typ: pod-lupa
//   set: 75389
//   cena_katalogowa: 779.99
//   cena_dobra: 620            # „dobra cena” = poniżej tej kwoty
//   cena_bardzo_dobra: 590     # „bardzo dobra cena” = poniżej tej kwoty
//   prog_zakupu: 620           # powyżej tej kwoty nie polecamy zakupu
//   wylacz_z_glownej_po: 2026-12-24   # (opcjonalnie) tekst sezonowy znika z głównej
//
// Cena „dziś” (reguła z dokumentu „Zestawy pod lupą – nowy format”): najtańsza
// oferta sklepu z WŁASNYM MAGAZYNEM – bez Allegro (marketplace, resellerzy)
// i bez Ceneo (porównywarka). Przechodzi przez to samo sito co tabela cen
// (`filtrujOferty`: wiek oferty, podejrzany rynek, wyprzedane w LEGO), a po
// EOL wiersz LEGO.com nie jest już ofertą.
//
// Statusy:
//   bardzo-dobra – cena dziś ≤ cena_bardzo_dobra
//   dobra        – cena dziś ≤ prog_zakupu (albo cena_dobra, gdy progu nie ma)
//   powyzej      – jest oferta, ale powyżej progu zakupu
//   brak         – żaden sklep z własnym magazynem nie ma dziś zestawu
// Na stronie głównej stoją wyłącznie teksty ze statusem dobra/bardzo-dobra,
// najwyżej trzy; listing /promocje-lego/ pokazuje wszystkie, z plakietką statusu.

import sety from '../data/sety.json';
import ofertyFeed from '../data/oferty_feed.json';
import cenyBaza from '../data/ceny_baza.json';
import { polaczOferty, cenaKatalogowaSetu, linkAfiliacyjny, nazwaSklepu } from './oferty.js';
import { eolWLego } from './status.js';
import { zajawkaArtykulu } from './artykuly.js';

const feed = ofertyFeed?.sety ?? {};

/** Sklepy, których oferta nie liczy się jako „cena dziś”. */
export const BEZ_WLASNEGO_MAGAZYNU = new Set(['allegro', 'ceneo']);

export const ETYKIETY_STATUSU = {
  'bardzo-dobra': 'Bardzo dobra cena',
  dobra: 'Dobra cena',
  powyzej: 'Powyżej progu zakupu',
  brak: 'Brak oferty w sklepach',
};

/** Kolejność na listingach: najlepszy status pierwszy. */
const RANGA = { 'bardzo-dobra': 0, dobra: 1, powyzej: 2, brak: 3 };

export const jestPodLupa = (modul) => modul?.frontmatter?.typ === 'pod-lupa' && modul.frontmatter.set != null;

const liczba = (x) => {
  const n = Number(x);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Ocena ceny dla tekstu „pod lupą” z jego frontmattera.
 * Zwraca null, gdy tekst nie jest w tym formacie.
 */
export function cenaPodLupa(frontmatter) {
  if (frontmatter?.typ !== 'pod-lupa' || frontmatter.set == null) return null;
  const nr = String(frontmatter.set);
  const rrp = liczba(frontmatter.cena_katalogowa) ?? cenaKatalogowaSetu(nr, { sety });
  const dobra = liczba(frontmatter.cena_dobra);
  const bardzoDobra = liczba(frontmatter.cena_bardzo_dobra);
  const prog = liczba(frontmatter.prog_zakupu) ?? dobra;

  const eol = eolWLego(nr);
  const oferty = polaczOferty(sety[nr]?.oferty ?? [], feed[nr] ?? null, nr).filter((o) => !(eol && o.sklep === 'lego'));
  const zMagazynu = oferty.filter((o) => !BEZ_WLASNEGO_MAGAZYNU.has(o.sklep) && o.cena > 0 && linkAfiliacyjny(o.sklep, nr));
  const dzis = zMagazynu.length ? zMagazynu.reduce((a, b) => (b.cena < a.cena ? b : a)) : null;
  const allegro = oferty.find((o) => o.sklep === 'allegro') ?? null;

  let status = 'brak';
  if (dzis) {
    if (bardzoDobra && dzis.cena <= bardzoDobra) status = 'bardzo-dobra';
    else if (prog && dzis.cena <= prog) status = 'dobra';
    else status = 'powyzej';
  }

  // najniższa cena z notowań Łowcy – jedyna „historia ceny”, jaką mamy w danych;
  // pokazujemy, gdy jest niższa od dzisiejszej (informacja, że bywało taniej)
  const min = cenyBaza[nr]?.najnizsza_cena ? { cena: cenyBaza[nr].najnizsza_cena, data: cenyBaza[nr].najnizsza_data ?? null, sklep: cenyBaza[nr].najnizsza_sklep ?? null } : null;

  return {
    nr,
    status,
    etykieta: ETYKIETY_STATUSU[status],
    ranga: RANGA[status],
    rrp,
    progi: { dobra, bardzoDobra, prog },
    dzis: dzis ? { cena: dzis.cena, sklep: dzis.sklep, nazwaSklepu: nazwaSklepu(dzis.sklep), link: linkAfiliacyjny(dzis.sklep, nr), data: dzis.data ?? null } : null,
    rabat: dzis && rrp && dzis.cena < rrp ? Math.round((1 - dzis.cena / rrp) * 100) : 0,
    allegro: allegro ? { cena: allegro.cena, link: linkAfiliacyjny('allegro', nr) } : null,
    minimum: min && (!dzis || min.cena < dzis.cena) ? min : null,
    liczbaSklepow: new Set(zMagazynu.map((o) => o.sklep)).size,
    eol,
  };
}

const dzisIso = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());

/** Czy tekst sezonowy ma już nie stać na stronie głównej (`wylacz_z_glownej_po`). */
export function wylaczonyZGlownej(frontmatter, dzis = dzisIso()) {
  const pole = frontmatter?.wylacz_z_glownej_po;
  // nieopakowana data we frontmatterze przychodzi z YAML-a jako Date
  const d = pole instanceof Date ? pole.toISOString().slice(0, 10) : String(pole ?? '');
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && d < dzis;
}

/**
 * Zajawka posta dealowego z oceną ceny (`lupa`) – ten sam kształt co
 * zajawkaArtykulu, więc trafia do tego samego komponentu karty.
 */
export function zajawkaPodLupa(modul) {
  const z = zajawkaArtykulu(modul);
  const lupa = cenaPodLupa(modul.frontmatter);
  return { ...z, kategoria: lupa ? 'Pod lupą' : z.kategoria, lupa };
}

const czas = (m) => new Date(m.frontmatter?.data ?? 0).getTime() || 0;

/**
 * Posty dealowe do listingu /promocje-lego/: najlepszy status pierwszy, w obrębie
 * statusu najnowsze pierwsze. Teksty w starym formacie (bez `typ: pod-lupa`)
 * stają za „dobrymi” – nie mamy dla nich oceny ceny.
 */
export function postyPodLupa(moduly) {
  return moduly
    .filter((m) => m.frontmatter?.data && m.frontmatter.kategoria !== 'Aktualności')
    .map((m) => ({ m, z: zajawkaPodLupa(m) }))
    .sort((a, b) => (a.z.lupa?.ranga ?? 2) - (b.z.lupa?.ranga ?? 2) || czas(b.m) - czas(a.m))
    .map((x) => x.z);
}

/**
 * Trójka na stronę główną: wyłącznie teksty „pod lupą” ze statusem dobra albo
 * bardzo dobra (bardzo dobre najpierw, potem najnowsze), bez tekstów sezonowych
 * po `wylacz_z_glownej_po`. Może zwrócić mniej niż `ile`, także zero.
 */
export function postyPodLupaNaGlowna(moduly, { ile = 3 } = {}) {
  return postyPodLupa(moduly.filter((m) => jestPodLupa(m) && !wylaczonyZGlownej(m.frontmatter)))
    .filter((z) => z.lupa && (z.lupa.status === 'dobra' || z.lupa.status === 'bardzo-dobra'))
    .slice(0, ile);
}
