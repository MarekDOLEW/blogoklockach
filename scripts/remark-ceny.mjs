// Tabela cen zestawu w treści artykułu — renderowana przy budowaniu.
//
// W markdownie wystarczy jednolinijkowy znacznik:
//   <div class="ceny-setu" data-set="42215"></div>
//
// Dlaczego znacznik, a nie wpisana ręcznie tabela: artykuł zostaje na stronie
// latami, a cena zmienia się codziennie. Ręcznie wklepana tabela z datą
// („Cena (20.08)") starzeje się w tydzień i mówi czytelnikowi wprost, że
// patrzy na coś nieaktualnego. Ten znacznik czyta te same dane co hub
// /zestaw/<nr>/, a Łowca odświeża je i pushuje praktycznie codziennie —
// każdy push przebudowuje serwis, więc tabela w artykule jest tak samo świeża
// jak na hubie. Stała zostaje drabina cenowa i próg zakupu, bo to ocena, nie
// odczyt z feedu.
//
// HTML jest zgodny z src/components/TabelaCen.astro (te same klasy), żeby
// obie tabele wyglądały identycznie i miały jeden komplet stylów w global.css.
// Przy zmianie komponentu trzeba poprawić też ten plik — dlatego trzymamy tu
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

// Zestaw wycofany nie dostaje wiersza LEGO.com ani dokładanych sklepów bez ceny
// (wyszukiwarki bywają wtedy puste) — tak samo jak na hubie.
const wycofany = (nr) =>
  !sety[nr] && (wycofaniaIdx.get(nr)?.kiedy === 'wycofany' || (!wycofaniaIdx.has(nr) && katalogIdx.get(nr)?.status === 'eol'));

const Z_WORKERA = new Set(['lego', 'xkom', 'allegro', 'smyk', 'empik', 'ceneo']);

// ── render (lustrzane odbicie TabelaCen.astro) ──

const fmt = (c) => c.toLocaleString('pl-PL', { minimumFractionDigits: 2 }) + ' zł';
const esc = (t) =>
  String(t ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const UWAGA_SKLEP = {
  mediaexpert: 'w sklepie bywają kody rabatowe — może być jeszcze taniej',
  planetaklockow: 'sklep prowadzi akcje rabatowe niewidoczne w cenniku — na stronie może być taniej',
  lego: 'oficjalna strona LEGO',
};

function tabela(nr) {
  const rrp = cenaKatalogowaSetu(nr);
  const dodajLego = !wycofany(nr);
  const maAfiliacje = (sklep) =>
    sklep === 'lego' ||
    ((sklep === 'xkom' || sklep === 'smyk' || sklep === 'empik') && dodajLego) ||
    Boolean(redirects?.[sklep]?.[nr]);
  const maLink = (sklep) => maAfiliacje(sklep) || Boolean(sklepy[sklep]?.szukaj);
  const rel = (sklep) => (sklep === 'lego' || !maAfiliacje(sklep) ? 'nofollow' : 'sponsored nofollow');
  const rabat = (c) => Math.round((1 - c / rrp) * 100);

  const oferty = polaczOferty(nr);
  const zLego =
    dodajLego && !oferty.some((o) => o.sklep === 'lego') && rrp ? [{ sklep: 'lego', cena: rrp, data: null }] : [];
  const wszystkie = [...oferty, ...zLego];
  // Ceneo to porównywarka, nie sklep — zawsze na końcu, poza sortowaniem.
  const ceneo = wszystkie.find((o) => o.sklep === 'ceneo') ?? null;
  const posortowane = wszystkie.filter((o) => o.sklep !== 'ceneo').sort((a, b) => a.cena - b.cena);
  if (posortowane.length === 0 && !ceneo) return '';

  const bezCeny = [...new Set([...Object.keys(redirects), 'xkom', 'smyk', 'empik'])].filter(
    (s) => s !== '_meta' && s !== 'ceneo' && maAfiliacje(s) && !posortowane.some((o) => o.sklep === s),
  );
  if (dodajLego && !posortowane.some((o) => o.sklep === 'lego') && !bezCeny.includes('lego')) bezCeny.push('lego');

  const nazwa = (s) => esc(sklepy[s]?.nazwa ?? s);
  const uwaga = (s) =>
    UWAGA_SKLEP[s] ? `<span style="display:block;font-size:0.72rem;opacity:0.65;">${esc(UWAGA_SKLEP[s])}</span>` : '';
  const kolRabat = (c) => (rrp ? `<td>${rabat(c) > 0 ? `−${rabat(c)}%` : '—'}</td>` : '');

  const wiersze = posortowane.map(
    (o, i) =>
      `<tr${i === 0 ? ' class="najtanszy"' : ''}><td><strong>${nazwa(o.sklep)}</strong>${uwaga(o.sklep)}</td>` +
      `<td class="cena">${fmt(o.cena)}</td>${kolRabat(o.cena)}<td>` +
      (maLink(o.sklep)
        ? `<a class="cta" href="/idz/${o.sklep}/${nr}" rel="${rel(o.sklep)}">Sprawdź w sklepie →</a>`
        : '<span style="font-size:0.85rem;opacity:0.55;white-space:nowrap;">link wkrótce</span>') +
      '</td></tr>',
  );

  const wierszeBezCeny = bezCeny.map(
    (s) =>
      `<tr><td><strong>${nazwa(s)}</strong>${uwaga(s)}</td><td class="cena">—</td>${rrp ? '<td>—</td>' : ''}` +
      `<td><a class="cta" href="/idz/${s}/${nr}" rel="${rel(s)}">Sprawdź cenę →</a></td></tr>`,
  );

  const wierszCeneo = ceneo
    ? `<tr class="wiersz-ceneo"><td><strong>${nazwa('ceneo')}</strong>` +
      '<span style="display:block;font-size:0.72rem;opacity:0.65;">porównywarka — najniższa oferta w całym rynku, sklep wybierasz na Ceneo</span>' +
      `</td><td class="cena">${fmt(ceneo.cena)}</td>${kolRabat(ceneo.cena)}` +
      `<td><a class="cta" href="/idz/ceneo/${nr}" rel="sponsored nofollow">Porównaj oferty →</a></td></tr>`
    : '';

  const stopka =
    (rrp ? `* Rabat liczony od ceny katalogowej LEGO (${fmt(rrp)}). ` : '') +
    'Tabela odświeża się razem z cenami w serwisie. Sklepy prowadzą też własne promocje i kody rabatowe, ' +
    'których nie widać w cennikach, i zmieniają ceny także w ciągu dnia — kwota powyżej jest ostatnią, ' +
    'jaką zobaczyliśmy, a wiążąca jest zawsze cena w koszyku sklepu. Różnica zwykle wypada na Twoją korzyść.';

  return (
    '<div class="karta karta--ceny">' +
    '<table class="tabela-cen">' +
    `<caption>Aktualne ceny — LEGO ${nr}</caption>` +
    `<thead><tr><th>Sklep</th><th>Cena</th>${rrp ? '<th>Rabat*</th>' : ''}<th></th></tr></thead>` +
    `<tbody>${wiersze.join('')}${wierszeBezCeny.join('')}${wierszCeneo}</tbody>` +
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
            console.warn(`[remark-ceny] brak ofert dla ${nr} — pomijam tabelę (${plik?.path ?? '?'})`);
          }
          return html;
        });
      }
      for (const dziecko of wezel.children ?? []) idz(dziecko);
    };
    idz(drzewo);
  };
}
