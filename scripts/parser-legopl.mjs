#!/usr/bin/env node
// Parser markdownu listingu lego.com/pl-pl — zamiast ekstrakcji przez model.
//
// Po co osobno: ekstrakcja przez schemat kosztuje ~5× więcej (5 kredytów za stronę
// wobec 1 za markdown) i — sprawdzone 28.08.2026 na pierwszej stronie listingu —
// myli liczbę elementów z ceną przed obniżką: dla WSZYSTKICH 22 kafelków wstawiła
// `priceBefore` równe liczbie klocków (SpongeBob: cena 899,99, priceBefore 1794).
// W markdownie te same dane są jednoznaczne, więc czyta się je regułą.
//
// Kształt kafelka w markdownie (pozycje listy numerowanej):
//
//     18+                      <- wiek (bywa 2×, raz dla mobile, raz dla desktop)
//     1794                     <- liczba elementów (też 2×)
//     ### [NAZWA](URL)         <- nagłówek z adresem karty produktu
//     899,99 zł                <- cena; przy promocji NAJPIERW katalogowa, potem obniżona
//     Dodaj do Koszyka         <- albo „Wkrótce dostępne", „Przedsprzedaż" itp.
//     Nowość                   <- etykiety
//
// Reguła cenowa: gdy w kafelku są dwie kwoty, katalogowa to WYŻSZA, a obniżona
// to niższa — niezależnie od kolejności, w jakiej je wypisano.
//
// PUŁAPKA PRZECENY (14.10.2026): kafelek przeceniony skleja obie kwoty i rabat
// w JEDNĄ linię — `729,99 zł583,99 zł\- 20%` — więc wzorzec zakotwiczony na
// „kwota sama w linii" nie łapał ani jednej z nich i produkt wypadał z wyniku
// (`kwoty.length === 0` → `continue`). Skutek: zestawy na wyprzedaży znikały
// z listingu, ich cena LEGO zamarzała na kwocie sprzed obniżki, a po 14 dniach
// nieobecności `lego-ceny.mjs` oznaczał je jako EOL. Strona /categories/sales-and-deals
// parsowała się 14.10 na 0 produktów przy 74 w rzeczywistości. Dlatego kwoty
// czytamy teraz z całej linii, pod warunkiem że linia jest SAMYMI kwotami
// (plus „zł", rabat i znaki interpunkcyjne) — zdanie „Najniższa cena z 30 dni
// przed obniżką: 583,99 zł" jest odrzucane osobno, bo bywa w nim raz cena
// obniżona, a raz katalogowa, więc jako źródło nie nadaje się do niczego.

const NAGLOWEK = /^###\s+\[(.+?)\]\((https:\/\/www\.lego\.com\/pl-pl\/product\/[^)]+)\)\s*$/;
const KWOTA = /(\d[\d\s ]*,\d{2})\s*zł/g;
const CENA_30_DNI = /^Najniższa cena z 30 dni/i;
const LICZBA = /^(\d{1,5})$/;
const NUMER_Z_URL = /-(\d{4,7})(?:[/?#]|$)/;

const naLiczbe = (s) => Number(s.replace(/[\s ]/g, '').replace(',', '.'));

// Kwoty z jednej linii kafelka. Linia przecenionego kafelka skleja obie ceny
// i rabat, więc nie da się ich czytać wzorcem „kwota sama w linii". Żeby przy
// okazji nie wciągnąć kwoty ze zdania (np. z informacji o cenie z 30 dni),
// bierzemy kwoty tylko wtedy, gdy po ich wycięciu nie zostaje w linii nic
// poza „zł", rabatem i interpunkcją.
function kwotyZLinii(linia) {
  if (CENA_30_DNI.test(linia)) return [];
  const znalezione = [...linia.matchAll(KWOTA)].map((m) => naLiczbe(m[1]));
  if (znalezione.length === 0) return [];
  const reszta = linia.replace(KWOTA, '').replace(/zł/g, '').replace(/[\\\s %+\-.,\d]/g, '');
  return reszta === '' ? znalezione : [];
}

// Etykiety, które nie są statusem produktu, tylko elementami interfejsu.
const NIE_STATUS = new Set([
  'Dodaj do Koszyka', 'Filtry', 'Sortuj według', 'Czytaj więcej', 'Załaduj więcej',
  'Dowiedz się jak', 'Oferta limitowana',
]);
// Ogon listingu — wszystko za nim należy do stopki, nie do ostatniego kafelka.
const KONIEC_LISTY = /^(Wyświetla \d+ z |Załaduj więcej|Filtry$|## )/;
const PROMOCJA = /-\s*\d{1,2}\s*%|wyprzeda|czyszczenie magazynu/i;

// Kafelek skleja kilka etykiet w jedną linię bez separatora
// („Podwójne punktyCzyszczenie magazynu- 30%"). Rozcinamy na granicy mała→WIELKA
// litera: w pojedynczych etykietach LEGO takiej granicy nie ma („Czyszczenie
// magazynu", „Ostatnie zestawy", „Wkrótce dostępne", „Ekskluzywne"), więc cięcie
// rozdziela sklejone, a całych nie rusza. Bez tego `status` zaczynałby się od
// nazwy akcji marketingowej zamiast od stanu produktu.
function rozklejEtykiete(e) {
  return e.split(/(?<=[a-ząćęłńóśźż])(?=[A-ZĄĆĘŁŃÓŚŹŻ])/).map((x) => x.trim()).filter(Boolean);
}

export function parsujListing(markdown) {
  const linie = markdown.split('\n').map((l) => l.trim());
  const naglowki = [];
  for (let i = 0; i < linie.length; i++) {
    const m = NAGLOWEK.exec(linie[i]);
    if (m) naglowki.push({ i, nazwa: m[1], url: m[2] });
  }

  const produkty = [];
  for (let k = 0; k < naglowki.length; k++) {
    const { i, nazwa, url } = naglowki[k];
    const nr = NUMER_Z_URL.exec(url.split('?')[0])?.[1];
    if (!nr) continue;

    // Cena i etykiety leżą MIĘDZY tym nagłówkiem a następnym.
    const koniec = k + 1 < naglowki.length ? naglowki[k + 1].i : linie.length;
    const kwoty = [];
    const etykiety = [];
    for (let j = i + 1; j < koniec; j++) {
      const l = linie[j];
      if (!l) continue;
      if (KONIEC_LISTY.test(l)) break;
      const c = kwotyZLinii(l);
      if (c.length) {
        kwoty.push(...c);
        continue;
      }
      // etykieta bywa linkiem: [Wkrótce dostępne](url); na kafelku przecenionym
      // etykiety są sklejone razem z rabatem („Podwójne punktyWyprzedaż\- 20%"),
      // więc zdejmujemy ukośniki markdownu i dopuszczamy dłuższy ciąg
      const czysta = l.replace(/^\[(.+?)\]\(.*\)$/, '$1').replace(/\\/g, '');
      // cyfry muszą przejść — bez nich przepada „Czyszczenie magazynu -30%”,
      // czyli jedyna etykieta, która przesądza o cenie katalogowej
      if (/^[\p{L}][\p{L}\d\s.:%+-]{2,60}$/u.test(czysta) && !NIE_STATUS.has(czysta)) etykiety.push(...rozklejEtykiete(czysta));
    }
    if (kwoty.length === 0) continue;

    // Liczba elementów stoi PRZED nagłówkiem, po wieku („18+”), zwykle powtórzona.
    // Bierzemy ostatnią samodzielną liczbę przed nagłówkiem, ale tylko jeśli tuż
    // przed nią stoi znacznik wieku — inaczej to numer pozycji listy.
    let elementy = null;
    for (let j = i - 1; j >= Math.max(0, i - 8); j--) {
      const l = linie[j];
      if (!l) continue;
      if (LICZBA.test(l)) {
        const przed = linie.slice(Math.max(0, j - 3), j).filter(Boolean);
        if (przed.some((x) => /^\d{1,2}\+$/.test(x))) elementy = Number(l);
        break;
      }
      if (/^\d{1,2}\+$/.test(l)) continue;
      break;
    }

    const cena = Math.min(...kwoty);
    const katalogowa = Math.max(...kwoty);
    produkty.push({
      setNumber: nr,
      name: nazwa.replace(/[®™]/g, '').replace(/[_*]/g, '').trim(),
      price: cena,
      ...(kwoty.length > 1 ? { priceBefore: katalogowa } : {}),
      // Status: promocja ma pierwszeństwo (przesądza o cenie katalogowej), poza
      // tym bierzemy pierwszą etykietę — to dostępność („Przedsprzedaż”,
      // „Wkrótce dostępne”, „Ekskluzywne”). „Nowość” stoi na końcu i jest
      // dopiskiem marketingowym, nie stanem produktu.
      status: etykiety.find((e) => PROMOCJA.test(e)) ?? etykiety[0] ?? null,
      // pełna lista etykiet (od 15.09.2026) — lego-ceny.mjs czyta z niej
      // „Ekskluzywne" (dystrybucja tylko w LEGO), „Ostatnie zestawy", „Przedsprzedaż"
      labels: etykiety,
      url,
      ...(elementy !== null ? { elements: elementy } : {}),
    });
  }
  return produkty;
}

// Adres kolejnej strony listingu, jeśli markdown go zawiera („Załaduj więcej”).
export function nastepnaStrona(markdown) {
  return /\[Załaduj więcej\]\((https:\/\/www\.lego\.com[^)]+)\)/.exec(markdown)?.[1] ?? null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import('node:fs');
  const plik = process.argv[2];
  if (!plik) {
    console.error('Użycie: node scripts/parser-legopl.mjs <plik.md>');
    process.exit(2);
  }
  const md = readFileSync(plik, 'utf8');
  const p = parsujListing(md);
  console.log(JSON.stringify(p, null, 1));
  console.log(`\n${p.length} produktów. Następna strona: ${nastepnaStrona(md) ?? 'brak'}`);
}
