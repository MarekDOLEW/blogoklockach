// Raport ofert odrzuconych przez odsiew (src/lib/odsiew.js) — te same reguły
// i progi, których używa serwis, więc raport zawsze pokazuje dokładnie to,
// co znika z tabel cen.
//
// Po co: feedy marketplace'ów dopasowują ofertę po numerze zestawu w tytule
// aukcji, więc pod numer setu trafiają akcesoria, gabloty, zestawy oświetlenia,
// instrukcje i zbiorcze aukcje. Raport podaje link do konkretnej aukcji, żeby
// dało się to sprawdzić w dwie sekundy — i żeby dało się wychwycić, gdyby odsiew
// zaczął kasować prawdziwe okazje. Właśnie tak wykryliśmy, że pierwsza wersja
// reguły (porównanie między sklepami) kasowała głównie uczciwe polybagi;
// dlatego został wyłącznie próg względem ceny katalogowej.
//
//   node scripts/kontrola-ofert.mjs          # tabela odrzuconych
//   node scripts/kontrola-ofert.mjs --json   # to samo maszynowo

import { readFileSync } from 'node:fs';
import { powodOdrzucenia } from '../src/lib/odsiew.js';

const czytaj = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url)));
const feed = czytaj('oferty_feed.json').sety ?? {};
const cenyBaza = czytaj('ceny_baza.json');
const katalog = czytaj('katalog.json');
const redirects = czytaj('redirects.json');
const rrpPotwierdzone = czytaj('rrp_potwierdzone.json');
const sety = czytaj('sety.json');

const rrpKatalogu = new Map();
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta') continue;
  for (const s of lista) rrpKatalogu.set(s.numer, s.cena_katalogowa ?? null);
}
// Pelny lancuch zrodel z cenaKatalogowaSetu() w src/lib/oferty.js — z rejestrem
// potwierdzonym przez czlowieka na czele. Bez niego raport liczyl prog od ceny
// z backfillu, a strona od ceny potwierdzonej: dla 244 setow w feedzie te dwie
// kwoty sie roznia, wiec raport przestawal opisywac to, co robi serwis.
const rrp = (nr) =>
  rrpPotwierdzone[nr]?.cena ??
  sety[nr]?.cena_katalogowa ??
  cenyBaza[nr]?.cena_katalogowa ??
  rrpKatalogu.get(nr) ??
  null;

// link do konkretnej aukcji, a nie do naszego /idz/ — chodzi o obejrzenie oferty
const aukcja = (sklep, nr) => {
  const url = redirects?.[sklep]?.[nr];
  if (!url) return null;
  const wewn = new URL(url).searchParams.get('redirect_url');
  return wewn ?? url;
};

const odrzucone = [];
for (const [nr, wpis] of Object.entries(feed)) {
  const oferty =
    wpis.oferty && typeof wpis.oferty === 'object'
      ? Object.entries(wpis.oferty)
          .filter(([, c]) => typeof c === 'number' && c > 0)
          .map(([sklep, cena]) => ({ sklep, cena }))
      : wpis.cena
        ? [{ sklep: wpis.sklep, cena: wpis.cena }]
        : [];
  const cenaKat = rrp(nr);
  for (const o of oferty) {
    const powod = powodOdrzucenia(o, cenaKat);
    if (powod) odrzucone.push({ nr, ...o, rrp: cenaKat, powod, link: aukcja(o.sklep, nr) });
  }
}
odrzucone.sort((a, b) => a.cena / (a.rrp || 1) - b.cena / (b.rrp || 1));

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(odrzucone, null, 2));
} else {
  console.log(`Odrzuconych ofert: ${odrzucone.length}\n`);
  const wgSklepu = {};
  for (const o of odrzucone) wgSklepu[o.sklep] = (wgSklepu[o.sklep] ?? 0) + 1;
  console.log(
    'Według sklepu: ' +
      Object.entries(wgSklepu)
        .sort((a, b) => b[1] - a[1])
        .map(([s, n]) => `${s} ${n}`)
        .join(', ') +
      '\n',
  );
  for (const o of odrzucone) {
    console.log(`${o.nr}  ${o.sklep}  ${o.cena} zł  — ${o.powod}`);
    if (o.link) console.log(`      ${o.link}`);
  }
}
