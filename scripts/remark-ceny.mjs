// Tabela cen zestawu w treści artykułu – renderowana przy budowaniu.
//
// W markdownie wystarczy jednolinijkowy znacznik:
//   <div class="ceny-setu" data-set="42215"></div>
//
// Dlaczego znacznik, a nie wpisana ręcznie tabela: artykuł zostaje na stronie
// latami, a cena zmienia się codziennie. Ręcznie wklepana tabela z datą
// („Cena (20.08)") starzeje się w tydzień i mówi czytelnikowi wprost, że
// patrzy na coś nieaktualnego. Ten znacznik czyta te same dane co hub
// /zestaw/<nr>/, a Łowca odświeża je i pushuje praktycznie codziennie –
// każdy push przebudowuje serwis, więc tabela w artykule jest tak samo świeża
// jak na hubie. Stała zostaje drabina cenowa i próg zakupu, bo to ocena, nie
// odczyt z feedu.
//
// HTML jest zgodny z src/components/TabelaCen.astro (te same klasy), żeby
// obie tabele wyglądały identycznie i miały jeden komplet stylów w global.css.
// Przy zmianie komponentu trzeba poprawić też ten plik – dlatego trzymamy tu
// wyłącznie renderowanie, a progi odsiewu importujemy z src/lib/odsiew.js.

import { readFileSync } from 'node:fs';
import { odsiej } from '../src/lib/odsiew.js';

const czytaj = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url)));
const sety = czytaj('sety.json');
const feed = czytaj('oferty_feed.json').sety ?? {};
const sklepy = czytaj('sklepy.json');
const redirects = czytaj('redirects.json');
const cenyBaza = czytaj('ceny_baza.json');
const rrpPotwierdzone = czytaj('rrp_potwierdzone.json');
const katalog = czytaj('katalog.json');
const karty = czytaj('karty_setow.json');
const wycofania = czytaj('wycofania.json').wycofania ?? [];

const katalogIdx = new Map();
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) katalogIdx.set(s.numer, { ...s, seria });
}
const wycofaniaIdx = new Map(wycofania.map((w) => [w.numer, w]));

// ── te same reguły co src/lib/oferty.js (plugin działa poza grafem modułów Astro) ──

// Kolejność jak w src/lib/oferty.js: potwierdzone przez człowieka mają
// pierwszeństwo przed czymkolwiek generowanym.
const cenaKatalogowaSetu = (nr) =>
  rrpPotwierdzone[nr]?.cena ??
  sety[nr]?.cena_katalogowa ??
  cenyBaza[nr]?.cena_katalogowa ??
  katalogIdx.get(nr)?.cena_katalogowa ??
  null;

function ofertyZFeedu(wpis, nr) {
  if (!wpis) return [];
  const { data } = wpis;
  const surowe =
    wpis.oferty && typeof wpis.oferty === 'object'
      ? Object.entries(wpis.oferty)
          .filter(([, cena]) => typeof cena === 'number' && cena > 0)
          .map(([sklep, cena]) => ({ sklep, cena, data }))
      : wpis.cena
        ? [{ sklep: wpis.sklep, cena: wpis.cena, data }]
        : [];
  return odsiej(surowe, cenaKatalogowaSetu(nr));
}

function polaczOferty(nr) {
  const perSklep = new Map();
  for (const o of [...(sety[nr]?.oferty ?? []), ...ofertyZFeedu(feed[nr], nr)]) {
    const stara = perSklep.get(o.sklep);
    if (!stara || o.cena < stara.cena) perSklep.set(o.sklep, o);
  }
  return [...perSklep.values()];
}

// EOL w LEGO – ta sama reguła co src/lib/status.js (eolWLego): wpis „wycofany"
// na liście wycofań albo status eol w katalogu, gdy listy nie ma. Dotyczy
// także setów śledzonych w sety.json – wcześniej te były zawsze „w sprzedaży".
const wycofany = (nr) => {
  const w = wycofaniaIdx.get(nr);
  if (w?.kiedy === 'wycofany') return true;
  if (w) return false;
  return katalogIdx.get(nr)?.status === 'eol';
};

// ── render (lustrzane odbicie TabelaCen.astro) ──

const fmt = (c) => c.toLocaleString('pl-PL', { minimumFractionDigits: 2 }) + ' zł';
const esc = (t) =>
  String(t ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

// ── zapowiedzi: zestaw przed premierą nie dostaje tabeli „aktualnych cen" ──
// Ta sama zasada co na hubie /zestaw/[nr]/: dopóki zestawu nie ma w sklepach,
// wiersz LEGO.com z ceną katalogową i przyciskiem „Sprawdź w sklepie" prowadzi
// donikąd, a nagłówek „Aktualne ceny" mówi nieprawdę. Znacznik nie zostawia
// wtedy NICZEGO w treści (decyzja Marka 06.09: powtórzona kilkanaście razy
// notka rozbijała tekst) — informację o tym, że tabele wypełnią się po
// premierze, artykuł podaje raz, na końcu. Po premierze ten sam znacznik
// zamienia się w tabelę cen bez żadnej zmiany w markdownie.
// Datę premiery bierzemy z sety.json („2026-10"), a gdy zestawu tam jeszcze
// nie ma – z metryki karty redakcyjnej („1 października 2026").
const MIESIACE = {
  stycznia: '01', lutego: '02', marca: '03', kwietnia: '04', maja: '05', czerwca: '06',
  lipca: '07', sierpnia: '08', września: '09', października: '10', listopada: '11', grudnia: '12',
};

function premieraSetu(nr) {
  if (sety[nr]?.premiera) return sety[nr].premiera;
  const dopasowanie = /([a-ząćęłńóśźż]+)\s+(\d{4})/i.exec(karty[nr]?.metryka?.Premiera ?? '');
  const miesiac = dopasowanie && MIESIACE[dopasowanie[1].toLowerCase()];
  return miesiac ? `${dopasowanie[2]}-${miesiac}` : null;
}

const dzis = new Date();
const BIEZACY_MIESIAC = `${dzis.getFullYear()}-${String(dzis.getMonth() + 1).padStart(2, '0')}`;

const UWAGA_SKLEP = {
  mediaexpert: 'w sklepie bywają kody rabatowe – może być jeszcze taniej',
  planetaklockow: 'sklep prowadzi akcje rabatowe niewidoczne w cenniku – na stronie może być taniej',
  lego: 'oficjalna strona LEGO',
};

function tabela(nr) {
  const rrp = cenaKatalogowaSetu(nr);
  const premiera = premieraSetu(nr);
  const wkrotce = Boolean(premiera && premiera > BIEZACY_MIESIAC);
  const eolLego = wycofany(nr);
  // przed premierą nie dokładamy wiersza LEGO.com – tak samo jak na hubie
  const dodajLego = !eolLego && !wkrotce;
  const maAfiliacje = (sklep) =>
    sklep === 'lego' ||
    ((sklep === 'xkom' || sklep === 'smyk' || sklep === 'empik') && dodajLego) ||
    Boolean(redirects?.[sklep]?.[nr]);
  const maLink = (sklep) => maAfiliacje(sklep) || Boolean(sklepy[sklep]?.szukaj);
  const rel = (sklep) => (sklep === 'lego' || sklep === 'smyk' || !maAfiliacje(sklep) ? 'nofollow' : 'sponsored nofollow');
  const rabat = (c) => Math.round((1 - c / rrp) * 100);

  // Zasada z 13.09.2026 (jak w TabelaCen.astro): tylko sklepy z ofertą cenową,
  // bez wierszy „Sprawdź cenę" dla sklepów bez ceny. LEGO.com zawsze, gdy znamy
  // cenę katalogową – jako oferta (w sprzedaży) albo wiersz informacyjny (EOL).
  const oferty = polaczOferty(nr);
  if (wkrotce && oferty.length === 0) return '';
  const sklepowe = eolLego ? oferty.filter((o) => o.sklep !== 'lego') : oferty;
  const zLego =
    dodajLego && !sklepowe.some((o) => o.sklep === 'lego') && rrp ? [{ sklep: 'lego', cena: rrp, data: null }] : [];
  const wszystkie = [...sklepowe, ...zLego];
  // Ceneo to porównywarka, nie sklep – zawsze na końcu, poza sortowaniem.
  const ceneo = wszystkie.find((o) => o.sklep === 'ceneo') ?? null;
  const posortowane = wszystkie.filter((o) => o.sklep !== 'ceneo').sort((a, b) => a.cena - b.cena);
  const wierszLegoEol = eolLego && rrp ? { cena: rrp } : null;
  if (posortowane.length === 0 && !ceneo && !wierszLegoEol) return '';

  const nazwa = (s) => esc(sklepy[s]?.nazwa ?? s);
  const uwaga = (s) => (UWAGA_SKLEP[s] ? `<span class="kc-uwaga">${esc(UWAGA_SKLEP[s])}</span>` : '');
  const kolRabat = (c) => (rrp ? `<td class="kc-rabat">${rabat(c) > 0 ? `−${rabat(c)}%` : '–'}</td>` : '');

  const wiersze = posortowane.map(
    (o, i) =>
      `<tr${i === 0 ? ' class="najtanszy"' : ''}><td class="kc-sklep"><strong>${nazwa(o.sklep)}</strong>${uwaga(o.sklep)}</td>` +
      `<td class="cena kc-cena">${fmt(o.cena)}</td>${kolRabat(o.cena)}<td class="kc-cta">` +
      (maLink(o.sklep)
        ? `<a class="cta" href="/idz/${o.sklep}/${nr}" rel="${rel(o.sklep)}">Sprawdź w sklepie →</a>`
        : '<span class="link-wkrotce">link wkrótce</span>') +
      '</td></tr>',
  );

  const wierszEol = wierszLegoEol
    ? `<tr class="wiersz-eol"><td class="kc-sklep"><strong>${nazwa('lego')}</strong>` +
      '<span class="kc-uwaga">oficjalny sklep – produkcja zakończona, zestaw został u innych sprzedawców</span></td>' +
      `<td class="cena kc-cena">${fmt(wierszLegoEol.cena)}<span class="tag-eol" title="EOL – LEGO zakończyło produkcję i już nie sprzedaje">EOL</span></td>` +
      `${rrp ? '<td class="kc-rabat">–</td>' : ''}` +
      '<td class="kc-cta"><span class="kc-eol-info">produkcja zakończona</span></td></tr>'
    : '';

  const wierszCeneo = ceneo
    ? `<tr class="wiersz-ceneo"><td class="kc-sklep"><strong>${nazwa('ceneo')}</strong>` +
      '<span class="kc-uwaga">porównywarka – najniższa oferta w całym rynku, sklep wybierasz na Ceneo</span>' +
      `</td><td class="cena kc-cena">${fmt(ceneo.cena)}</td>${kolRabat(ceneo.cena)}` +
      `<td class="kc-cta"><a class="cta" href="/idz/ceneo/${nr}" rel="sponsored nofollow">Porównaj oferty →</a></td></tr>`
    : '';

  const stopka =
    (rrp ? `* Rabat liczony od ceny katalogowej LEGO (${fmt(rrp)}). ` : '') +
    (wierszLegoEol ? 'EOL – LEGO zakończyło produkcję tego zestawu; sklepy sprzedają zapasy, dopóki je mają. ' : '') +
    'Tabela odświeża się razem z cenami w serwisie. Sklepy prowadzą też własne promocje i kody rabatowe, ' +
    'których nie widać w cennikach, i zmieniają ceny także w ciągu dnia – kwota powyżej jest ostatnią, ' +
    'jaką zobaczyliśmy, a wiążąca jest zawsze cena w koszyku sklepu. Różnica zwykle wypada na Twoją korzyść.';

  return (
    '<div class="karta karta--ceny tabela-cen-wrap">' +
    '<table class="tabela-cen">' +
    `<caption>Aktualne ceny – LEGO ${nr}</caption>` +
    `<thead><tr><th>Sklep</th><th>Cena</th>${rrp ? '<th>Rabat*</th>' : ''}<th></th></tr></thead>` +
    `<tbody>${wiersze.join('')}${wierszEol}${wierszCeneo}</tbody>` +
    '</table>' +
    `<p class="tabela-data">${stopka}</p>` +
    '</div>'
  );
}

const ZNACZNIK = /<div\s+class="ceny-setu"\s+data-set="(\d{4,7})"\s*><\/div>/g;

export default function remarkCeny() {
  return (drzewo, plik) => {
    const idz = (wezel) => {
      if (wezel.type === 'html' && wezel.value.includes('ceny-setu')) {
        wezel.value = wezel.value.replace(ZNACZNIK, (_, nr) => {
          const html = tabela(nr);
          if (!html) {
            const powod = premieraSetu(nr) > BIEZACY_MIESIAC ? 'przed premierą' : 'brak ofert';
            console.warn(`[remark-ceny] ${powod} dla ${nr} – pomijam tabelę (${plik?.path ?? '?'})`);
          }
          return html;
        });
      }
      for (const dziecko of wezel.children ?? []) idz(dziecko);
    };
    idz(drzewo);
  };
}
