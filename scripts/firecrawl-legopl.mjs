#!/usr/bin/env node
// Zaciąg katalogu lego.com/pl-pl przez Firecrawl — ceny katalogowe do rejestru.
//
// Po co: lego.pl oddaje serwerowi 403 (blokada ruchu serwerowego), a Chromium
// w tym środowisku nie ma sieci wychodzącej. Firecrawl renderuje stronę u siebie
// i oddaje gotowe dane, więc zaciąg da się odpalać z runnera bez człowieka.
//
// Ekstrakcja idzie przez schemat (format `json`), a nie przez parsowanie HTML —
// przebudowa listingu w sklepie nie wywali wtedy zadania cyklicznego. UWAGA: to
// tryb ~5× droższy od surowego markdownu (patrz RUNBOOK) i z definicji podatny
// na zmyślone wartości, dlatego każda cena przechodzi kontrolę polskiej drabiny
// (.99/.49/.00) — pozycje spoza drabiny są odrzucane i wypisywane na koniec.
// Po pierwszym udanym przebiegu warto obejrzeć markdown listingu i — jeśli da
// się z niego czytać regułą — dopisać tańszy tryb.
//
// PUŁAPKA CENOWA (patrz RUNBOOK): na listingu `price` to cena BIEŻĄCA — przy
// promocji obniżona. Ceną katalogową jest wtedy `priceBefore`. Status
// „Ostatnie zestawy” to NIE promocja (cena jest katalogowa), za to
// „Czyszczenie magazynu -30%”, „Wyprzedaż -30%” i „Niedostepne -50%” już tak.
// Pozycję promocyjną bez `priceBefore` pomijamy — lepiej brak niż zaniżona cena
// w rejestrze, który ma pierwszeństwo przed wszystkim.
//
// Wymaga FIRECRAWL_KEY. Użycie:
//   node scripts/firecrawl-legopl.mjs --wyjscie katalog-legopl.json
//   node scripts/firecrawl-legopl.mjs --strony 3            # próbka, do testów
//   node scripts/firecrawl-legopl.mjs --rrp ceny-rrp.json   # dodatkowo plik dla wczytaj-rrp.mjs
//   node scripts/firecrawl-legopl.mjs --z-pliku katalog.json --rrp ceny-rrp.json
//       ^ bez zaciągu: przelicza gotowy katalog (np. dostarczony przez Cowork)
//         tą samą regułą cenową. Nie wymaga klucza.
//
// Dalej: node scripts/wczytaj-rrp.mjs ceny-rrp.json --zrodlo "lego.pl (Firecrawl)"

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { ekstrakcja } from './firecrawl.mjs';

const LISTING = 'https://www.lego.com/pl-pl/categories/all-sets';
const NA_STRONIE = 24; // tyle kafelków oddaje jedna strona listingu

const args = process.argv.slice(2);
const opcja = (n) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : null;
};
const wyjscie = opcja('wyjscie') ?? 'katalog-legopl.json';
const plikRrp = opcja('rrp');
const limitStron = Number(opcja('strony') ?? 0) || Infinity;
const zPliku = opcja('z-pliku');

const SCHEMAT = {
  type: 'object',
  properties: {
    products: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nazwa produktu bez znaku towarowego' },
          url: { type: 'string', description: 'Pełny adres karty produktu' },
          price: { type: 'number', description: 'Cena bieżąca w PLN, liczba' },
          priceBefore: { type: 'number', description: 'Cena przed obniżką w PLN, tylko gdy widnieje przekreślona' },
          status: { type: 'string', description: 'Etykieta z kafelka: Nowość, Ekskluzywne, Wyprzedaż -30%, Ostatnie zestawy, Niedostępne itp.' },
          elements: { type: 'integer', description: 'Liczba elementów, gdy podana na kafelku' },
          category: {
            type: 'string',
            enum: ['zestaw', 'akcesoria/merch'],
            description:
              'zestaw = zestaw klocków do zbudowania. akcesoria/merch = breloki, torby, kubki, ' +
              'odzież, pojemniki, zawieszki, gadżety, książki, pisaki, zestawy LEGO SERIOUS PLAY.',
          },
        },
        required: ['name', 'url', 'price'],
      },
    },
  },
  required: ['products'],
};

const POLECENIE =
  'Wypisz wszystkie produkty widoczne na tej stronie listingu sklepu LEGO. ' +
  'Ceny podaj jako liczby w złotych (np. 249.99). Jeśli kafelek pokazuje cenę ' +
  'przekreśloną obok obniżonej, przekreśloną wpisz w priceBefore, a obniżoną w price. ' +
  'Kategorię rozstrzygnij po tym, czy produkt jest zestawem klocków do zbudowania, ' +
  'czy gadżetem/akcesorium (brelok, torba, kubek, odzież, pojemnik, zawieszka, książka). ' +
  'Nie wymyślaj produktów, których na stronie nie ma.';

// Numer zestawu bierzemy z adresu karty produktu, nie z nazwy — nazwa bywa myląca
// („LEGO 2 w 1”, roczniki w tytule), a slug URL kończy się numerem katalogowym.
const NUMER_Z_URL = /-(\d{4,7})(?:[/?#]|$)/;

const PROMOCJA = /-\s*\d{1,2}\s*%|wyprzeda|czyszczenie magazynu/i;

// LEGO PL wycenia wyłącznie na końcówkach .99 i .49 (grosze .00 zdarzają się
// przy okrągłych kwotach gadżetów). Cena spoza tej drabiny to nie promocja,
// tylko błąd odczytu — nie wpuszczamy jej dalej.
function cenaZDrabiny(cena) {
  if (typeof cena !== 'number' || cena <= 0) return false;
  const grosze = Math.round(cena * 100) % 100;
  return grosze === 99 || grosze === 49 || grosze === 0;
}

function ustalNumer(url = '') {
  return NUMER_Z_URL.exec(url.split('?')[0])?.[1] ?? null;
}

// Kategorię rozstrzyga model przy ekstrakcji — z samego listingu nie da się jej
// wyliczyć regułą (adresy wszystkich produktów mają ten sam segment /product/,
// a liczby elementów brakuje przy 119 zestawach i jest przy 11 akcesoriach).
// Poniższe to wyłącznie awaryjne uzupełnienie, gdyby model pola nie podał.
function ustalKategorie(p) {
  if (p.category === 'zestaw' || p.category === 'akcesoria/merch') return p.category;
  if (/breloc|torba|kubek|koszul|plecak|pi[oó]rnik|zawieszk|pojemnik|wiaderk|serious play/i.test(p.name ?? ''))
    return 'akcesoria/merch';
  return typeof p.elements === 'number' && p.elements > 0 ? 'zestaw' : 'akcesoria/merch';
}

async function pobierzStrone(nr) {
  const url = nr === 1 ? LISTING : `${LISTING}?page=${nr}`;
  for (let proba = 1; proba <= 3; proba++) {
    try {
      const dane = ekstrakcja(url, SCHEMAT, { polecenie: POLECENIE, czekaj: 3000 });
      return dane?.products ?? [];
    } catch (e) {
      console.error(`  strona ${nr}, próba ${proba}: ${e.message.slice(0, 160)}`);
      if (proba === 3) return null;
      execFileSync('sleep', [String(proba * 5)]);
    }
  }
}

const zebrane = new Map(); // nr -> produkt
const bledy = [];
let strona = 0;
let pusteZRzedu = 0;

if (zPliku) {
  const gotowy = JSON.parse(readFileSync(zPliku, 'utf8'));
  for (const p of gotowy.products ?? gotowy) {
    const nr = String(p.setNumber ?? ustalNumer(p.url) ?? '');
    if (!nr) continue;
    zebrane.set(nr, { ...p, setNumber: nr, category: ustalKategorie(p) });
  }
  strona = gotowy.meta?.pagesScraped ?? 0;
  console.log(`Wczytano ${zebrane.size} pozycji z ${zPliku} (bez zaciągu).`);
}

while (!zPliku && strona < limitStron) {
  strona += 1;
  const produkty = await pobierzStrone(strona);
  if (produkty === null) {
    bledy.push(strona);
    if (bledy.length >= 5) {
      console.error('Pięć stron nie do pobrania — przerywam, żeby nie zapisać kadłubka.');
      break;
    }
    continue;
  }
  if (produkty.length === 0) {
    pusteZRzedu += 1;
    if (pusteZRzedu >= 2) break; // koniec listingu
    continue;
  }
  pusteZRzedu = 0;

  let nowe = 0;
  for (const p of produkty) {
    const nr = ustalNumer(p.url);
    if (!nr || zebrane.has(nr)) continue;
    zebrane.set(nr, {
      setNumber: nr,
      name: (p.name ?? '').replace(/®|™/g, '').trim(),
      price: p.price,
      status: p.status ?? null,
      url: p.url,
      ...(typeof p.elements === 'number' ? { elements: p.elements } : {}),
      ...(typeof p.priceBefore === 'number' ? { priceBefore: p.priceBefore } : {}),
      category: ustalKategorie(p),
    });
    nowe += 1;
  }
  console.log(`strona ${strona}: ${produkty.length} kafelków, ${nowe} nowych (łącznie ${zebrane.size})`);
  if (produkty.length < NA_STRONIE / 2 && strona > 1) break; // ostatnia, niepełna strona
}

const produkty = [...zebrane.values()];
if (produkty.length === 0) {
  console.error('Nic nie pobrano — nie nadpisuję niczego.');
  process.exit(1);
}

const zestawy = produkty.filter((p) => p.category === 'zestaw');
const promocje = produkty.filter((p) => PROMOCJA.test(p.status ?? '') || p.priceBefore);

const katalog = {
  meta: {
    source: LISTING,
    scrapedAt: new Date().toISOString().slice(0, 10),
    currency: 'PLN',
    priceType: 'cena bieżąca sklepu LEGO PL (katalogowa lub promocyjna; priceBefore = cena przed obniżką)',
    productsTotal: produkty.length,
    sets: zestawy.length,
    accessories: produkty.length - zestawy.length,
    promotions: promocje.length,
    pagesScraped: strona,
    ...(bledy.length ? { pagesFailed: bledy } : {}),
    note: 'Zaciąg automatyczny (scripts/firecrawl-legopl.mjs). Numery z URL produktu.',
  },
  products: produkty,
};
writeFileSync(wyjscie, `${JSON.stringify(katalog, null, 1)}\n`);
console.log(
  `\nZapisano ${wyjscie}: ${produkty.length} pozycji (${zestawy.length} zestawów, ${promocje.length} w promocji)` +
    (bledy.length ? `, strony nie do pobrania: ${bledy.join(', ')}` : ''),
);

// ── plik dla rejestru cen katalogowych ──
// Rejestr jest write-once i ma pierwszeństwo przed wszystkim, więc wpuszczamy do
// niego wyłącznie numery, które znamy z src/data/katalog.json. Gdyby model wziął
// brelok za zestaw, jego cena i tak nie trafi do rejestru — wyląduje w pliku
// „spoza katalogu”, do obejrzenia ludzkim okiem.
if (plikRrp) {
  const katalogSerwisu = JSON.parse(readFileSync('src/data/katalog.json', 'utf8'));
  const znane = new Set(
    Object.entries(katalogSerwisu)
      .filter(([seria]) => seria !== '_meta')
      .flatMap(([, lista]) => (Array.isArray(lista) ? lista.map((z) => String(z.numer)) : [])),
  );

  const ceny = {};
  const spozaKatalogu = {};
  const pozaDrabina = [];
  let pominiete = 0;
  for (const p of zestawy) {
    const wPromocji = PROMOCJA.test(p.status ?? '') || typeof p.priceBefore === 'number';
    const cena = wPromocji ? p.priceBefore : p.price;
    if (typeof cena !== 'number' || cena <= 0) {
      pominiete += 1; // promocja bez ceny sprzed obniżki — lepiej brak niż zaniżona
      continue;
    }
    if (!cenaZDrabiny(cena)) {
      pozaDrabina.push([p.setNumber, cena, p.name]);
      continue;
    }
    if (znane.has(p.setNumber)) ceny[p.setNumber] = cena;
    else spozaKatalogu[p.setNumber] = { cena, nazwa: p.name, url: p.url };
  }

  writeFileSync(plikRrp, `${JSON.stringify(ceny, null, 1)}\n`);
  console.log(
    `Zapisano ${plikRrp}: ${Object.keys(ceny).length} cen katalogowych dla zestawów z katalogu` +
      (pominiete ? `, pominięto ${pominiete} (promocja bez ceny sprzed obniżki)` : ''),
  );

  if (pozaDrabina.length) {
    console.log(`\nODRZUCONE — cena poza polską drabiną (.99/.49/.00), prawdopodobny błąd odczytu:`);
    for (const [nr, cena, nazwa] of pozaDrabina) console.log(`  ${nr}  ${cena}  ${nazwa}`);
  }

  const plikNowe = plikRrp.replace(/(\.json)?$/, '-spoza-katalogu.json');
  writeFileSync(plikNowe, `${JSON.stringify(spozaKatalogu, null, 1)}\n`);
  console.log(`Zapisano ${plikNowe}: ${Object.keys(spozaKatalogu).length} pozycji spoza katalogu serwisu (do przeglądu).`);
  console.log(`Dalej: node scripts/wczytaj-rrp.mjs ${plikRrp} --zrodlo "lego.pl (Firecrawl)" --sucho`);
}
