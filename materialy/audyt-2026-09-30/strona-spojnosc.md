# Audyt spójności technicznej tylkoklocki.pl — build dist/ z 30.09.2026

Zakres: 9 955 plików HTML w `dist/` (9 954 `index.html` + `404.html`), 8 sitemap, robots, `_redirects`.
Narzędzia: `skan.mjs` (fakty per strona → `strony.json`), `analiza.mjs`, `analiza2.mjs` (ten katalog).
Produkcja: 38 zapytań HEAD (24 pierwszej próbki obrazów zmarnowane przez parsowanie linii proxy,
10 obrazów powtórzonych z realnym statusem, 4 sprawdzenia przekierowań/podglądu).

Skala: `/zestaw/` 9 787 hubów, `/serie/` 69, `/artykuly/` 39, `/prezentowniki/` 22, `/nowosci/` 12,
`/deale/` 11 (posty), pojedyncze: `/`, `/promocje-lego/`, `/wycofania/`, `/ekskluzywne/`, `/przecieki/`,
`/aktualnosci/`, `/kalendarz-promocji-lego/`, `/zapowiedzi-lego-2027/`, `/o-nas/`, `/polityka-prywatnosci/`,
`/szukaj/`, `/kolekcjoner/`, `/podglad/` ×2.

## 1. Linki wewnętrzne — OK
- Sprawdzono wszystkie `href="/…"` we wszystkich stronach (pominięto `/idz/`, `/img/`, `/obserwuj`).
- **Martwych linków: 0.** Linków do katalogu bez końcowego slasha: 0.
- Linki polegające na 301 z `public/_redirects`: `/deale/` – 2 strony (`/podglad/deale-obecne/` i 1 hub);
  `/kalendarz-redakcyjny` i `/serie/tradycyjne-festiwale-chinskie/` – 0. Na produkcji wszystkie trzy
  zwracają 301 z poprawnym `location` (sprawdzone curl -sI).
- Posty dealowe `/deale/<slug>/` mają po 3–7 linków przychodzących (z artykułów/hubów) – nie osierocone.

## 2. Strony-sieroty — OK (drobiazg)
- Bez żadnego linku wewnętrznego (licząc menu i stopkę): **3** — `/kolekcjoner/`, `/podglad/deale-obecne/`,
  `/podglad/glowna-obecna/`. Wszystkie trzy mają `noindex`. **Sierot indeksowalnych: 0.**
- Linkowane wyłącznie z nagłówka/stopki (0 linków z treści): `/o-nas/`, `/szukaj/` — normalne.
- `/polityka-prywatnosci/` ma 9 786 linków, ale wszystkie z formularza „Obserwuj cenę" na hubach
  (`src/components/ObserwujCene.astro`); w stopce `Base.astro` go nie ma (0 wystąpień).
- Naprawa: `/kolekcjoner/` to trzyzdaniowy stub (`src/pages/kolekcjoner.astro`) → skasować albo 301 na
  `/wycofania/` w `public/_redirects`; `/podglad/*` → patrz pkt 8.

## 3. Meta — problem (długości), reszta OK
- Bez `<title>`: 0. Bez description: 0. Bez canonical: 0. Bez `meta robots`: 0.
- Duplikaty `<title>` (wszystkie strony): 0. Duplikaty description wśród indeksowalnych: 0.
- Canonical inny niż własny URL: tylko `/404.html` → `https://tylkoklocki.pl/404/` (nieistotne, noindex).
- Description < 50 zn.: 0. **Description > 160 zn.: 3 490 stron, z tego 1 300 indeksowalnych**:
  huby 1 239 (mediana 194, p90 214, max 248 zn.), artykuły 33/39 (np. 209–210 zn.:
  `/artykuly/historia-licencji-lego-gry-sport-lifestyle/`), deale 9, prezentowniki 8, serie 8,
  `/ekskluzywne/`, `/wycofania/`, `/zapowiedzi-lego-2027/`.
- **Title > 60 zn.: 7 417 stron, 1 241 indeksowalnych** (huby: mediana 75, p90 86, max 88;
  np. „LEGO Botanicals Drzewko bonsai (10281) – cena i promocje · tylkoklocki.pl" = 74). Sufiks
  ` · tylkoklocki.pl` (17 zn.) dokłada `Base.astro`; artykuły do 95 zn. (`jak-rosly-zestawy-lego`).
- noindex per katalog: `/zestaw/` **8 518**, `/podglad/` 2, `/kolekcjoner/` 1, `/szukaj/` 1, `/404.html` 1.
  Indeksowalnych hubów: **1 269** z 9 787 (13%). `sitemap-zestawy.xml` ma dokładnie te 1 269 — zgodne 1:1.
- Naprawa: hub – `opisMeta`/`ogonMeta` w `src/pages/zestaw/[nr].astro` (~L205–219): ogon „– porównanie cen,
  rabat liczony od RRP, dla rodzica i dla kolekcjonera." dodaje ~80 zn.; skrócić ogon do ≤160 łącznie.
  Artykuły – pole `opis:` we frontmatter `src/pages/artykuly/*.md` (skracać przy redakcji). Tytuł huba –
  rozważyć `LEGO <nazwa> <nr> – cena` bez „i promocje" albo krótszy sufiks domeny w `Base.astro`.

## 4. Sitemapy — OK (1 drobiazg)
- 7 sitemap podrzędnych, 1 431 URL-i: artykuły 36, prezentowniki 25, deale 12, serie 69, nowości 12,
  zestawy 1 269, inne 8. **Każdy URL istnieje w dist, żaden nie jest noindex, zero duplikatów.**
- Strony indeksowalne poza wszystkimi sitemapami: **1** — `/polityka-prywatnosci/`.
- Naprawa: dopisać do listy w `src/pages/sitemap-inne.xml.js` (lub nadać noindex, jeśli celowo poza).

## 5. Nagłówki — drobiazg
- Bez `<h1>`: 0. Więcej niż jeden `<h1>`: 0.
- Przeskok w obrębie `<main>`: **12 stron `/nowosci/`** (h1 → h3 per zestaw: `/nowosci/`,
  `/nowosci/wrzesien-2026/` …). Źródło: `src/pages/nowosci/[miesiac].astro` L148 `<h3>{s.nazwa}</h3>`
  (i analogicznie `nowosci.astro`) → zmienić na `<h2>` albo wstawić `<h2>` sekcji.
- Stopka ma trzy `<h4>` („tylkoklocki.pl", „Przejrzystość", „Info") – na każdej stronie daje formalny skok
  h2→h4, na 15 stronach bez h2 (nowości, kolekcjoner, szukaj, 404) h1→h4. Kosmetyka: `Base.astro` → `<h2>`
  z klasą wizualną albo `<p class="stopka-tytul">`.

## 6. Obrazy — OK
- 68 799 `<img>`; **bez atrybutu alt: 0**. `alt=""` (bez aria-hidden na samym tagu): 891 —
  700 miniatur galerii na hubach (80×80 w przyciskach `.miniatura-btn`, np. `/zestaw/11381/`),
  190 miniatur kart serii wewnątrz `<span aria-hidden="true">` (`/serie/archiwalne/`), 1 pusty
  placeholder lightboxa `<img id="lb-img" src="" alt="">` na `/nowosci/` (pusty `src` = zbędne żądanie
  w niektórych przeglądarkach; lepiej bez `src` do czasu otwarcia).
- Wszystkie 68 798 realnych `src` to `/img/<klucz>.jpg` (worker). Produkcja, 10 losowych hubów:
  10/10 → 200 (`10019, 5814, 75092, 4014, 41700 (image/webp pod .jpg), 30498, 951440, 561811, 60033, 4002025`).

## 7. Huby /zestaw/ — OK, z uwagami
- 9 787 hubów: **tabela z ofertami 7 199** (1 262 indeksowalnych), **komunikat „brak ofert" 2 581**
  (2 575 noindex, 6 indeksowalnych), zapowiedź 5, tabela z samym wierszem EOL bez CTA 2.
- Pustych tabel (`<tbody>` bez wierszy): **0**. Strona bez ofert pokazuje pełne zdanie:
  „Nie widzimy tego zestawu w żadnym ze śledzonych sklepów – LEGO zakończyło jego sprzedaż (EOL),
  pozostaje rynek wtórny (Allegro, OLX). Gdy oferta się pojawi, cena będzie widoczna w tym miejscu." — sensowne.
- Treść: karta Piotra 1 199, opis (generowany/wycofania) 6 729 (bez karty), karta lub opis 7 899,
  **tylko szablon 1 888** — z tego indeksowalne tylko 4 (`71457, 76300, 76301, 76328` – 3 sklepy + świeża
  premiera). Wszystkie huby z kartą są indeksowalne (0 z noindex).
- Przykłady: karta – `/zestaw/10280/ 10281/ 10291/ 10295/ 10302/`; opis bez karty – `/zestaw/10018/ 10019/
  10026/ 10030/ 10068/`; sam szablon – `/zestaw/1000/ 10001/ 10024/ 10048/ 10072/`; brak ofert –
  `/zestaw/1000/ 10001/ 10018/ 10019/ 10026/`; zapowiedź – `/zestaw/11390/ 21375/ 40897/ 40899/ 77094/`;
  indeksowalne bez ofert – `/zestaw/40916/ 5010075/ 5011093/ 66813/ 71037/ 71038/` (mają kartę);
  EOL bez CTA – `/zestaw/2198/ 7235/` (tabela z jednym wierszem „produkcja zakończona" – lepiej komunikat).
- 5 937 hubów noindex ma oferty z CTA (4 350 z tekstem) – to celowy hamulec z `src/lib/seo.js`
  (3 z 4 warunków), nie błąd.

## 8. Nawigacja — drobiazg
- Menu (`Base.astro`): `/`, `/szukaj/`, `/promocje-lego/`, `/nowosci/`, `/przecieki/`, `/wycofania/`,
  `/serie/`, `/prezentowniki/`, `/artykuly/`. Stopka: `/o-nas/`, `/aktualnosci/`, `/promocje-lego/`,
  `/nowosci/`, `/wycofania/`, `/ekskluzywne/`, `/przecieki/`, `/serie/`, `/prezentowniki/`, `/artykuly/`,
  `/rss.xml`. **Wszystkie cele istnieją.**
- Poza menu i stopką: `/kalendarz-promocji-lego/` (49 linków z treści), `/zapowiedzi-lego-2027/` (20),
  `/polityka-prywatnosci/` (tylko formularz na hubach), `/kolekcjoner/` (0, noindex, stub),
  `/aktualnosci/` (stopka + 2 z treści), `/ekskluzywne/` (stopka + 133 huby).
- `/podglad/deale-obecne/` i `/podglad/glowna-obecna/`: „KOPIA – poprzednie Deale / poprzednia strona
  główna (do 29.09.2026)", noindex, 0 linków, ale **na produkcji 200**. Pozostałość po przebudowie
  29.09 → skasować `src/pages/podglad/*.astro`.

## 9. JSON-LD — OK (2 drobiazgi)
- Błędnych bloków (JSON.parse): **0**. Typy: BreadcrumbList 9 860, Product 9 787, FAQPage 1 255,
  ItemList 85, Article 72, WebSite 2, WebPage 2, CollectionPage 1; 11 stron `/nowosci/<miesiąc>/` używa `@graph`.
- Bez żadnego JSON-LD: 12 — listingi `/artykuly/`, `/nowosci/`, `/prezentowniki/`, `/promocje-lego/`,
  `/serie/`, `/serie/archiwalne/`, `/aktualnosci/`, `/o-nas/`, `/polityka-prywatnosci/`, `/kolekcjoner/`,
  `/szukaj/`, `/404.html` (brak nawet BreadcrumbList).
- Huby: Product z AggregateOffer **5 724**, Product bez offers 4 063 (brak ofert / tylko EOL / tylko Ceneo).
  Zgodność `lowPrice` z minimum tabeli (bez Ceneo i wiersza EOL): **1 rozjazd** — `/zestaw/40896/`
  (tabela: „LEGO.com 81,99 zł" z CTA + Allegro 418,95; LD low 418,95). To zestaw GWP – wiersz LEGO.com
  z ceną „wartości przypisanej" wygląda jak oferta sklepu, której nie ma.
- `availability` = InStock w 100% — gałąź `Discontinued` w `[nr].astro` L135 nigdy nie zachodzi (gdy EOL i
  brak ofert sklepowych, `ofertyBezCeneo` jest puste i offers znika). Martwy kod, bez skutku dla użytkownika.
- 9 hubów ma w tabeli tylko Ceneo (4 indeksowalne: `40894, 40905, 40907, 71039`) – bez Offer, poprawnie.

## 10. Daty i śmieci — OK
- „undefined / NaN / null / Invalid Date / [object Object]" w tekście lub atrybutach: **0 stron**.
- Daty przy cenach (`kc-data`): 13 998 wystąpień na 5 733 hubach, wszystkie z września 2026; najstarsza
  22.09.2026 (8 dni). Hubów z co najmniej jedną ceną starszą niż 7 dni: **122**; hubów, gdzie *wszystkie*
  ceny są starsze niż 7 dni: **2** (`/zestaw/5009157/`, `/zestaw/71045/` – tylko Ceneo z 22.09).
- Listingi (`/promocje-lego/`, `/nowosci/`, `/serie/*`, `/wycofania/`) nie pokazują daty danych; jedyne
  „16.09.2026" na tych stronach to komentarz HTML o decyzjach, nie treść.

## 11. robots.txt i _redirects — OK
- `robots.txt`: `Allow: /`, `Disallow: /idz/`, `Sitemap: https://tylkoklocki.pl/sitemap-index.xml`.
  Nie blokuje `/img/` (zdjęcia indeksowalne) ani `/_astro/`. Nic potrzebnego nie jest zablokowane.
- `public/_redirects` = `dist/_redirects` (identyczne): `/deale/`→`/promocje-lego/`,
  `/kalendarz-redakcyjny`→`/artykuly/`, `/serie/tradycyjne-festiwale-chinskie`→`/serie/seasonal/`
  (obie wersje ze slashem i bez). Wszystkie trzy na produkcji zwracają 301 z właściwym `location`.
- Brak przekierowania dla `/kolekcjoner/` i `/podglad/*` (patrz pkt 2 i 8).

## Top 10 do naprawy (wpływ na czytelnika i Google)
1. **Meta description > 160 zn. na 1 300 indeksowalnych stron** (1 239 hubów, 33 artykuły) —
   `src/pages/zestaw/[nr].astro` `ogonMeta`/`opisMeta`; frontmatter `opis:` artykułów.
2. **Title > 60 zn. na 1 241 indeksowalnych** (huby mediana 75) — skrócić wzorzec tytułu huba
   i/lub sufiks domeny w `src/layouts/Base.astro`.
3. **Pozostałości `/podglad/deale-obecne/`, `/podglad/glowna-obecna/`** żyją na produkcji (200) —
   skasować `src/pages/podglad/`.
4. **`/polityka-prywatnosci/` bez linku w stopce i poza sitemapą** — `Base.astro` (stopka) +
   `src/pages/sitemap-inne.xml.js`.
5. **`/nowosci/` (12 stron): h1 → h3** — `src/pages/nowosci/[miesiac].astro` L148 i `nowosci.astro` → `<h2>`.
6. **`/kolekcjoner/` – sierota-stub** (0 linków, noindex) — usunąć albo 301 → `/wycofania/` w `public/_redirects`.
7. **Brak JSON-LD (nawet BreadcrumbList) na listingach** `/artykuly/`, `/promocje-lego/`, `/nowosci/`,
   `/prezentowniki/`, `/serie/` — dodać CollectionPage/ItemList + okruszki w tych stronach `src/pages/`.
8. **Zestawy GWP z wierszem „LEGO.com <cena przypisana>" jako ofertą** (`/zestaw/40896/`; LD low ≠ tabela) —
   w `TabelaCen`/`[nr].astro` nie dodawać wiersza LEGO, gdy karta oznacza dystrybucję jako GWP.
9. **Stopkowe `<h4>` łamią hierarchię na każdej stronie** (h2→h4, na 15 stronach h1→h4) — `Base.astro`.
10. **Drobiazgi hubów**: 2 huby z tabelą zawierającą tylko „produkcja zakończona" bez CTA (`2198, 7235`) →
    pokazać komunikat „brak ofert"; pusty `src=""` lightboxa na `/nowosci/`; martwa gałąź `Discontinued`
    w JSON-LD; 122 hubów z ceną starszą niż 7 dni (rytm odświeżania Ceneo, nie błąd builda).

Ocena ogólna: **strona jest spójna** — 0 martwych linków, 0 sierot indeksowalnych, sitemapy 1:1 z
indeksowalnością, 0 śmieciowych wartości, 0 błędnych JSON-LD, 0 stron bez title/description/canonical/h1.
Realne zadania to długości meta (skala: >1 200 stron), porządki po przebudowie 29.09 i drobne braki
strukturalne (nagłówki w nowościach, JSON-LD na listingach, polityka prywatności w stopce/sitemapie).
