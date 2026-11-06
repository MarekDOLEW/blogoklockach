// Kafelki okazji w artykułach dealowych — jak listing w sklepie: zdjęcie, cena, rabat,
// werdykt „gdzie najtaniej” i przycisk. Pogrupowane według rabatu od ceny katalogowej.
// Powód (06.11.2026, Marek o tekście Black Weeks tyg. 3): „nawet ja nie jestem w stanie przez to
// przejść” — lista akapitów z ceną, procentem i minimum przy każdym zestawie nie da się skanować.
//
// Znacznik w markdownie:
//   <div class="karty-okazji" data-sklep="xkom" data-sety="42649,43291,75443"
//        data-o42649="Na Mikołajki dla sześciolatka"></div>
//   – cena w kafelku = oferta tego sklepu (z plakietką kodu, jeśli kod ją daje),
//     werdykt porównuje ją z najtańszą ofertą dziś w innych sklepach;
//   <div class="karty-okazji" data-sety="76454,42175" data-bez-grup></div>
//   – bez data-sklep: cena = najtańsza oferta dziś (z nazwą sklepu); data-bez-grup = jedna siatka.
//   data-o<nr> = jedno zdanie redakcji pod nazwą (dla kogo / po co).
// Ceny, rabaty, grupy i werdykty liczą się przy każdym buildzie z tych samych danych i tego
// samego sita co tabele cen (remark-ceny.mjs → src/lib/sito-ofert.js), więc się nie starzeją.

import { polaczOferty, cenaKatalogowaSetu, wycofany, sety, katalogIdx, sklepy, kodyRabatowe } from './remark-ceny.mjs';
import { maZdjecie } from './remark-galeria.mjs';
import { kodRabatowyZ } from '../src/lib/sito-ofert.js';

const ZNACZNIK = /<div\s+class="karty-okazji"([^>]*)><\/div>/g;
const GRUPY = [
  { od: 40, tytul: 'Ponad 40% taniej' },
  { od: 30, tytul: '30–40% taniej' },
  { od: 20, tytul: '20–30% taniej' },
  { od: -Infinity, tytul: 'Mniejsze obniżki' },
];

const esc = (t) => String(t ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const fmt = (c) => c.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',00', '') + ' zł';
const nazwaSklepu = (s) => sklepy[s]?.nazwa ?? s;
const atrybut = (atr, n) => new RegExp(`\\s${n}="([^"]*)"`).exec(atr)?.[1] ?? null;
// „w Empik”, „w x-kom” — nazwy sklepów w miejscowniku (audyt UX 06.11: „w Planeta Klocków”)
const MIEJSCOWNIK = { empik: 'w Empiku', xkom: 'w x-komie', mediaexpert: 'w Media Expercie', planetaklockow: 'w Planecie Klocków', smyk: 'w Smyku', allegro: 'na Allegro', lego: 'w sklepie LEGO', lidl: 'w Lidlu', mediamarkt: 'w MediaMarkcie' };
const wSklepie = (s) => MIEJSCOWNIK[s] ?? `w ${nazwaSklepu(s)}`;
const DO = { empik: 'Do Empiku', xkom: 'Do x-komu', mediaexpert: 'Do Media Expertu', planetaklockow: 'Do Planety Klocków', smyk: 'Do Smyka', allegro: 'Do Allegro', lego: 'Do sklepu LEGO', lidl: 'Do Lidla', mediamarkt: 'Do MediaMarktu' };

function dane(nr, sklep) {
  const wpis = sety[nr] ?? {};
  const kat = katalogIdx.get(nr) ?? {};
  const rrp = cenaKatalogowaSetu(nr);
  const oferty = polaczOferty(nr).filter((o) => !(o.sklep === 'lego' && wycofany(nr))).sort((a, b) => a.cena - b.cena);
  const naj = oferty[0] ?? null;
  const wlasna = sklep ? oferty.find((o) => o.sklep === sklep) ?? null : naj;
  const cena = wlasna?.cena ?? null;
  const rabat = rrp && cena ? Math.round((1 - cena / rrp) * 100) : null;
  return {
    nr,
    nazwa: wpis.nazwa ?? kat.nazwa ?? `LEGO ${nr}`,
    seria: wpis.seria ?? kat.seria ?? '',
    wiek: wpis.wiek ?? kat.wiek ?? '',
    elementy: wpis.elementy ?? kat.elementy ?? null,
    rrp,
    sklep: wlasna?.sklep ?? sklep,
    wlasnySklep: Boolean(sklep),
    cena,
    rabat,
    kod: wlasna ? kodRabatowyZ(kodyRabatowe, wlasna.sklep, nr, wlasna.cena) : null,
    taniej: sklep && naj && wlasna && naj.sklep !== sklep && naj.cena < wlasna.cena - 0.05 ? naj : null,
    remis: sklep && wlasna ? oferty.find((o) => o.sklep !== sklep && Math.abs(o.cena - wlasna.cena) <= 0.05) ?? null : null,
  };
}

function karta(d, opis) {
  const meta = [d.seria, d.wiek, d.elementy ? `${Number(d.elementy).toLocaleString('pl-PL')} el.` : ''].filter(Boolean).join(' · ');
  const foto = maZdjecie(d.nr)
    ? `<img src="/img/${d.nr}.jpg?w=400" srcset="/img/${d.nr}.jpg?w=400 1x, /img/${d.nr}.jpg?w=800 2x" alt="LEGO ${esc(d.nr)} ${esc(d.nazwa)}" loading="lazy" width="400" height="400" />`
    : `<span class="ko-brak-foto">LEGO ${esc(d.nr)}</span>`;
  let werdykt = '';
  if (d.cena == null) werdykt = '<p class="ko-werdykt ko-werdykt--brak">Dziś bez oferty w tym sklepie</p>';
  else if (d.taniej) werdykt = `<p class="ko-werdykt ko-werdykt--uwaga">Taniej ${esc(wSklepie(d.taniej.sklep))}: <strong>${fmt(d.taniej.cena)}</strong></p>`;
  else if (d.remis) werdykt = `<p class="ko-werdykt">Tyle samo ${esc(wSklepie(d.remis.sklep))}</p>`;
  else werdykt = `<p class="ko-werdykt ko-werdykt--top">Najtaniej dziś${d.wlasnySklep ? '' : ` ${esc(wSklepie(d.sklep))}`}</p>`;
  const kod = d.kod
    ? `<p class="ko-kod">z kodem <strong>${esc(d.kod.kod)}</strong>${d.kod.koniecZnany === false ? '' : ` do ${d.kod.do.slice(8, 10)}.${d.kod.do.slice(5, 7)}`}</p>`
    : '';
  const cena = d.cena != null
    ? `<p class="ko-cena"><strong>${fmt(d.cena)}</strong>${d.rrp && d.rabat > 0 ? ` <s title="cena katalogowa LEGO">${fmt(d.rrp)}</s> <span class="ko-rabat">−${d.rabat}%</span>` : ''}</p>`
    : (d.rrp ? `<p class="ko-cena"><s title="cena katalogowa LEGO">${fmt(d.rrp)}</s></p>` : '');
  const cta = d.cena != null
    ? `<a class="ko-cta" href="/idz/${d.sklep}/${d.nr}" target="_blank" rel="sponsored nofollow noopener">${esc(DO[d.sklep] ?? `Do sklepu ${nazwaSklepu(d.sklep)}`)} →</a>`
    : '';
  return (
    '<article class="ko-karta">' +
    `<a class="ko-foto" href="/zestaw/${d.nr}/" tabindex="-1" aria-hidden="true">${foto}</a>` +
    '<div class="ko-tresc">' +
    (meta ? `<p class="ko-meta">${esc(meta)}</p>` : '') +
    `<h3 class="ko-nazwa"><a href="/zestaw/${d.nr}/">${esc(d.nazwa)}</a> <span class="ko-nr">${esc(d.nr)}</span></h3>` +
    (opis ? `<p class="ko-opis">${esc(opis)}</p>` : '') +
    cena + kod + werdykt +
    '<div class="ko-akcje">' + cta + `<a class="ko-porownaj" href="/zestaw/${d.nr}/#ceny">Wszystkie ceny</a></div>` +
    '</div></article>'
  );
}

function siatka(atr) {
  const numery = (atrybut(atr, 'data-sety') ?? '').split(',').map((n) => n.trim()).filter(Boolean);
  const sklep = atrybut(atr, 'data-sklep');
  const bezGrup = /\sdata-bez-grup(\s|=|$)/.test(atr);
  const lista = numery.map((nr) => ({ d: dane(nr, sklep), opis: atrybut(atr, `data-o${nr}`) }));
  const html = (elementy) => `<div class="ko-siatka">${elementy.map((x) => karta(x.d, x.opis)).join('')}</div>`;
  if (bezGrup) return `<div class="karty-okazji">${html(lista)}</div>`;
  const posortowane = [...lista].sort((a, b) => (b.d.rabat ?? -1) - (a.d.rabat ?? -1));
  const sekcje = GRUPY.map((g, i) => ({
    ...g,
    elementy: posortowane.filter((x) => (x.d.rabat ?? -Infinity) >= g.od && (i === 0 || (x.d.rabat ?? -Infinity) < GRUPY[i - 1].od)),
  })).filter((g) => g.elementy.length);
  return (
    '<div class="karty-okazji">' +
    sekcje.map((g) => `<section class="ko-grupa"><h3 class="ko-grupa-tytul">${esc(g.tytul)} <span>${g.elementy.length}</span></h3>${html(g.elementy)}</section>`).join('') +
    '<p class="ko-przypis">Rabat liczymy od ceny katalogowej LEGO. Ceny odświeżamy codziennie — wiążąca jest cena w koszyku sklepu.</p>' +
    '</div>'
  );
}

export default function remarkKartyOkazji() {
  return (drzewo) => {
    const idz = (wezel) => {
      if (wezel.type === 'html' && wezel.value.includes('karty-okazji')) wezel.value = wezel.value.replace(ZNACZNIK, (_, atr) => siatka(atr));
      for (const dziecko of wezel.children ?? []) idz(dziecko);
    };
    idz(drzewo);
  };
}
