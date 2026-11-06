# Audyt UX, przekazu i spójności — 06.11.2026

Zakres: spójność UI w 26 szablonach, ton i hierarchia informacji, paleta i kontrast,
szybka dostępność i wydajność, elementy zbędne. Bez zmian w kodzie.

## Metoda

- Produkcja `https://tylkoklocki.pl`, Chromium + Playwright, okna **390×844**
  (mobile, dotyk) i **1440×900**, `deviceScaleFactor: 1`. Na każdej stronie:
  błędy konsoli, odpowiedzi 4xx/5xx, poziomy scroll (elementy wystające poza
  okno), `alt` i wymiary obrazów, `loading=lazy` nad zgięciem, cele dotyku
  < 24 px, CLS (PerformanceObserver po przewinięciu strony), element LCP, kontrast
  tekstu względem faktycznego tła, warianty stylów linków `/idz/`, nagłówki h1/h2.
- Źródła: `src/styles/global.css` (1731 linii), `src/components`, `src/layouts`,
  `src/pages`, zbudowany `dist/` (10 149 stron HTML).
- Zrzuty: `materialy/audyt-2026-11-06/zrzuty/` (29 plików JPEG; `-cala` = cała
  strona przycięta do 4200/6000 px, bez dopisku = pierwszy ekran).
- Strony: `/`, `/promocje-lego/`, `/deale/` (301 → `/promocje-lego/`), deal
  `/deale/deal-75192-…/`, huby `/zestaw/42215/` (w sprzedaży), `/zestaw/10359/`
  (EOL, w sklepach), `/zestaw/10001/` (wycofany), `/zestaw/11227/` (zapowiedź 2027),
  `/nowosci/`, `/serie/`, `/serie/city/`, `/wycofania/`, `/przecieki/`,
  `/artykuly/` + recenzja 75421, premiera 11388, historyczny 6391, ranking aut
  Icons, `/prezentowniki/` + `lego-dla-7-latka`, `/aktualnosci/`, `/szukaj?q=sokol`,
  `/ekskluzywne`, `/kalendarz-promocji-lego/`, `/o-nas/`, 404.

### Stan układu 1320 px (pytanie wstępne)

Prototyp **nie jest na produkcji**. Historia `origin/main`:
`b13e53a` (prototyp) → `1ab8fa4` (wejście 1320 na main) → `51f6ec3` (cofnięcie
tego samego dnia, „Marek zakładał kopię podglądową"). Gałąź `prototyp-1320`
istnieje na `origin` (wskazuje `1ab8fa4`). Na produkcji `--max-w: 1080px`
(`global.css:40`) — wszystkie zrzuty 1440 pokazują kolumnę 1080 z pustymi
marginesami po ~180 px.

Dwa skutki uboczne cofnięcia, do naprawy przy okazji:

1. `materialy/audyt-szerokosc-2026-11-03.md` **na `main` zawiera nierozwiązane
   znaczniki konfliktu** (`<<<<<<< HEAD`, `=======`, `>>>>>>> parent of b13e53a`,
   linie 33–72). Sekcja „Prototyp 1320" jest między nimi — dla czytelnika wygląda
   jak zepsuty plik.
2. Commit `51f6ec3` mówi „plansze zostają", a skasował 16 plansz z
   `audyt-szerokosc-2026-11-03/prototyp/`. Są tylko na gałęzi `prototyp-1320`.

---

## Najważniejsze ustalenia (skrót)

| # | Ustalenie | Waga |
|---|---|---|
| 1 | Prezentowniki dzielone według płci („Dla chłopca do 500 zł", „Dla dziewczynki do 500 zł") wbrew własnym zasadom | Wysoka |
| 2 | Strona główna nie ma żadnego wejścia „prezent" — w listopadzie rodzic widzi Hogwart 16+ za 1349 zł i nagłówek o metodologii rabatu | Wysoka |
| 3 | Treści sprzedażowe bez zdjęć: 17 z 21 postów „Pod lupą" i 13 z 69 artykułów (w tym 4 recenzje) nie mają ani jednego zdjęcia | Wysoka |
| 4 | Błędne zdjęcie produktu: `/zestaw/10001/` (Metroliner) pokazuje grę planszową Monkey Palace; kilka kolejnych podejrzanych | Wysoka |
| 5 | Przycisk do sklepu ma 8 osobnych definicji CSS, 4 wzory etykiet i niepoprawną odmianę („w Empik", „w Planeta Klocków") | Średnia |
| 6 | Paleta rozjechana: 27 wartości hex poza tokenami, trzy różne czerwienie cen, ~34 warianty „pigułek" | Średnia |
| 7 | Hub zapowiedzi 2027 wygląda jak zestaw w sprzedaży (tabela cen, przycisk LEGO.com, schema `InStock`) | Średnia |
| 8 | Wydajność: LCP z `loading="lazy"` i zdjęcia 600 px rozciągane do 1040 px w prezentownikach i rankingach; CLS 0,27 na `/szukaj` (mobile) | Średnia |

Szczegóły i dowody poniżej.

---

## 1. Spójność UX i UI

### 1.1 Przyciski do sklepów — Średnia

**Dowód (CSS).** Nie ma bazowej klasy `.cta`. Ten sam granatowy przycisk jest
zdefiniowany osobno w 8 kontekstach, każdy z innym rozmiarem:

| Selektor | `global.css` | padding | promień | font |
|---|---|---|---|---|
| `.tabela-cen .cta` | 198 | 8/14 | 6 px | 0.85rem |
| `.deal-akcje .cta` | 288 | 12/20 | 8 px | 1rem |
| `.oferta-karta__akcje .cta` | 1321 | 11/18 | 8 px | 1rem |
| `.pasek-ceny .cta` | 1428 | 10/18 | 6 px | 0.95rem |
| `.prezent__kup-wiersz .cta` | 1441 | 8/14 | 6 px | 0.88rem |
| `.promo-boks .cta` | 1492 | 10/14 | 8 px | 0.9rem |
| `.tabela-promocje .cta` | 1528 | 9/14 | 6 px | 0.86rem |
| `.lupa-cena__akcje .cta` | 1729 | 10/18 | 6 px | 0.95rem |

Do tego `.promo-cta` (8 px), `.przycisk` i `.przycisk-drugi` (pigułka 999 px),
`.cta--eol` (obrys). Reguła z 1560 („Najazd na przycisk sklepu: żółty wszędzie")
musi używać `!important`, bo „poszczególne komponenty mają własne :hover" — sam
komentarz w CSS opisuje problem.

**Dowód (produkcja, 1440).** Na zmierzonych stronach linki `/idz/` mają
**7 wariantów** wyglądu (kolor/promień/padding/rozmiar). Główna i `/promocje-lego/`
mają dwa różne przyciski obok siebie (17 px/8 px w slajderze i 13,8 px/6 px w
tabeli). W tabeli „Dziś w dobrej cenie" przycisk „Sprawdź w Media Expert" łamie
się na dwie linie, a „Sprawdź w Allegro" nie — kolumna przycisków jest
poszarpana (`zrzuty/glowna--1440-cala.jpg`, `promocje--1440-cala.jpg`).

**Etykiety** (zliczone w `dist/`, 10 149 stron):

| Wzór | Gdzie | Przykład |
|---|---|---|
| sama nazwa sklepu | hub, artykuł, deal, prezentownik | „Allegro →", „Media Expert →" (≈29 tys.) |
| „Sprawdź w …" | główna, promocje | „Sprawdź w Allegro", „Sprawdź w Empik" |
| „Sprawdź cenę na/w …" | treść artykułów (markdown) | „Sprawdź cenę na Allegro →", „…na Amazon →" |
| sama kwota jako link | wycofania, serie, nowości, ekskluzywne | „683,99 zł" (≈1100 na stronę serii City) |
| „Porównaj oferty →" | Ceneo w tabeli cen | |

Strzałka „→" jest raz, raz jej nie ma („Sprawdź w Allegro" vs „Sprawdź w
Allegro →" na tej samej stronie głównej). Odmiana: „Sprawdź w Empik", „w Smyk",
„w Planeta Klocków", „w x-kom" — po polsku „w Empiku", „w Smyku", „w Planecie
Klocków", „w x-komie". Disclosure na `/wycofania/` i `/ekskluzywne` mówi o
„Przyciskach „Sprawdź cenę"", których na tych stronach nie ma — tam linkiem jest
kwota (`src/pages/wycofania.astro:117`, `src/pages/ekskluzywne.astro:68`).

**Rekomendacja.** Jedna klasa `.cta` (+ `--maly`, `--duzy`, `--obrys`) z jednym
promieniem (6 px — taki ma większość) i jedna formuła etykiety. Proponuję
**„Kup w Empiku →"** w tabelach i kartach, gdzie stoi cena (użytkownik już ją
widzi, więc „sprawdź" jest asekuracją), i **„Zobacz w Empiku →"** tam, gdzie
ceny nie ma. Nazwy sklepów w miejscowniku trzymać w `sklepy.json`
(`nazwa_w: "w Empiku"`). Disclosure przepisać na „Linki do sklepów…".

### 1.2 Tabele i format cen — Średnia

- **Trzy czerwienie ceny:** token `--czerwien #e0312f` (karty, deal dnia, hub),
  `#c8102e` w tabeli i slajderze `/promocje-lego/` (`global.css:1510`, `1526`)
  i granat z żółtym podkreśleniem jako link-kwota w tabelach serii/wycofań.
- **Czerwona cena bez rabatu.** `.set-karta .cena-linia .cena` jest zawsze
  czerwona, także dla ceny katalogowej: Sagrada Família 3199,99 zł na
  `/nowosci/` i wszystkie karty „Nasze propozycje" na `/serie/city/` wyglądają
  jak promocje (`zrzuty/nowosci--1440.jpg`, `seria--1440.jpg`). To łamie regułę
  `system-wizualny.md`: „czerwień — tylko o pieniądzach, plakietka rabatu tylko
  przy realnym rabacie". Rekomendacja: cena granatowa, czerwona dopiero przy
  rabacie ≥ X%.
- **Daty cen w pięciu formatach:** „DANE Z 05.11.2026" (deal dnia), „Stan cen z
  05.11.2026" (promocje), „z 05.11.2026" (tabela huba), „Allegro · z 05.11"
  (wycofania), „Aktualizacja: 30.10.2026" (deal). Rekomendacja: „ceny z 5 listopada"
  w nagłówku sekcji, w wierszu tylko gdy różni się od nagłówka.
- **Wiersz Ceneo** na hubie stoi na końcu z ceną niższą niż „najtaniej dziś"
  (42215: Ceneo 1199,00 zł z 27.10 vs „od 1247,89 zł"), a feed Ceneo nie jest już
  odświeżany (program zakończony 03.11, `afiliacje_rejestr.json` → `ceneo.uwagi`).
  Ten wiersz będzie coraz starszy i myli. Link ma przy tym zaszyte
  `rel="sponsored"` (`TabelaCen.astro:144`), choć prowizji już nie ma. Decyzja
  jest w rejestrze jako „DO ZROBIENIA (Marek)" — z perspektywy UX: ukryć wiersz.
- Kolejność sklepów jest spójna (rosnąco po cenie, Ceneo na końcu) — to plus.

### 1.3 Plakietki i statusy — Średnia

W CSS jest 18 klas `.badge-*` i 16 klas statusu (`.status--*`, `.tag-eol`,
`.lupa-status--*`, `.pewnosc--*`) — **ok. 34 warianty pigułek**. Mieszają dwie
typografie: zdania małymi literami („wycofanie: potwierdzone przez LEGO",
„wkrótce – zapowiedź potwierdzona przez LEGO") i WERSALIKI z rozstrzeleniem
(„DLA DOROSŁYCH", „DUŻY ZESTAW", „ZNIKA Z RYNKU", „DO 100 ZŁ", „OKAZJA").
Na hubie 42215 stoi pięć plakietek, z czego dwie mówią to samo („wycofanie:
potwierdzone przez LEGO" i „ZNIKA Z RYNKU"), a trzecią informację o wycofaniu
podaje ramka pod opisem (`zrzuty/zestaw-sprzedaz--390.jpg`: na telefonie
plakietki zajmują trzy linie przed tytułem). Na wycofanym 10001 komunikat „nie
ma w sklepach" jest dwa razy jeden pod drugim (`zestaw-wycofany--1440.jpg`).

`.badge-premiera` jest czerwona (`global.css:1679`) — czerwień bez związku
z ceną, wbrew regule semantycznej palety.

Na `/promocje-lego/` żółta plakietka „OKAZJA" stoi przy prawie każdym wierszu
(`promocje--1440-cala.jpg`) — przestaje cokolwiek wyróżniać.

**Rekomendacja.** Dwa poziomy: *status* (pigułka, zdanie, kolor semantyczny,
maks. 1 na kartę) i *cecha* (szara etykieta, wersaliki, maks. 2). Na hubie:
Seria · Status · jedna cecha. „OKAZJA" tylko dla top 10–15% rabatów.

### 1.4 Karty, slajdery, nagłówki sekcji, okruszki — Niska/Średnia

- **Typy kart:** `set-karta`, `set-karta--mini`, `zajawka`, `seria-karta`,
  `oferta-karta`, `akt-karta`, `promo-slajd`, `deal-dnia`, `karta-setu`,
  `prezent__*`, `promo-boks` — 11 wzorów. Zdjęcia raz w ramce 4:3 z obrysem, raz
  bez, raz kwadrat.
- **Cztery slajdery** z różnymi kontrolkami: `deale-slajder` (okrągłe strzałki
  granatowe na zdjęciu), `akt-slajder` (strzałka biała poza kartą), karuzela
  propozycji (strzałki + licznik „1/3" nad kartami), `galeria-slajder` (kropki
  10 px). Kropki slajdera głównego mają powiększony obszar dotyku 24 px
  (`global.css:174`), kropki galerii `.gs-kropka` (10×10, `global.css:1062`) — nie.
- **Nagłówki h2** w dwóch stylach: z wypustkami (`.sekcja-head`: główna,
  promocje, wycofania, „Pełny katalog") i bez (`/artykuly/` „Wszystkie teksty",
  `/nowosci/` „Nowości – listopad", `/serie/city/` „Nasze propozycje"). Na
  `/serie/city/` oba style stoją jeden pod drugim (`seria--1440.jpg`).
- **Okruszki** (`Okruszki.astro`) tylko na hubie, nowościach miesięcznych
  i przeciekach. Brak na artykułach, dealach, prezentownikach, seriach,
  wycofaniach — choć artykuły mają `BreadcrumbList` w JSON-LD. Na `/serie/city/`
  (1080 zestawów) nie ma ani okruszków, ani wstępu pod h1.
- **Stopka** spójna na wszystkich stronach — w porządku.
- **Poziomy scroll:** brak na żadnej z 26 stron przy 390 i 1440 px
  (`scrollWidth == innerWidth`). Plus.

**Rekomendacja:** okruszki w `Artykul.astro`, `PrezentownikSerii.astro`
i na stronach serii; jeden styl h2 sekcji (z wypustkami) na listingach.

### 1.5 Hub zapowiedzi wygląda jak hub w sprzedaży — Średnia

`/zestaw/11227/` (premiera 2027) ma tabelę „Porównanie cen" z LEGO.com 84,99 zł
„z 03.11.2026", przycisk „LEGO.com →" i dopisek „Sklepy z własnym magazynem
(LEGO.com) – kupujesz nowy, zapieczętowany zestaw" (`zestaw-zapowiedz--1440.jpg`).
JSON-LD ma `"availability":"https://schema.org/InStock"`. Rekomendacja: dla
statusu zapowiedzi zamiast tabeli „Cena zapowiedziana: 84,99 zł · premiera 2027"
+ „Obserwuj — damy znać w dniu premiery", schema `PreOrder`/`PreSale` albo bez `offers`.

### 1.6 Błędne zdjęcia produktów — Wysoka

`/zestaw/10001/` LEGO Metroliner pokazuje pudełko gry planszowej „Monkey
Palace" (`zestaw-wycofany--1440.jpg`). Źródło: `src/data/obrazy.json` →
`"10001": …/LEGO-Monkey-Palace-DOT10001-Gra-Planszowa.jpg` (kolizja numeru z kodem
DOT10001 w Planecie Klocków). Heurystyka (nazwa pliku zawiera inny numer niż
klucz albo „Puzzle"/„Gra-Planszowa") wskazuje do ręcznej weryfikacji m.in.:
30690 (plik 30665), 51095 (61998 notatnik), 52608 (52008 zawieszka), 53241
(magnes Hermiona), 60086 (puzzle 62278), 76285 (76286). Rekomendacja: w
skrypcie pobierającym zdjęcia z Planety Klocków odrzucać pliki, w których numer
w nazwie ≠ numer zestawu.

---

## 2. Przekaz i ton

### 2.1 Pierwsze 5 sekund

**Rodzic szukający prezentu (390 px, `zrzuty/glowna--390.jpg`)** widzi:
szary nagłówek „Prawdziwe promocje na klocki LEGO – rabaty liczone od cen
katalogowych", plakietkę „801 ZŁ+", Zamek Hogwart 16+, 6020 elementów,
1349 zł, „−34% od ceny katalogowej". Nic o wieku dziecka, prezencie ani
budżecie. **Na całej stronie głównej nie ma sekcji prezentowników** (sekcje:
slajder deali, „Dziś w dobrej cenie", Aktualności, Ostatnie artykuły, „Zestawy
pod lupą" z plakietkami „Dla AFOL"). Wejście dla rodzica to szósta pozycja menu.
To jest 6 listopada — szczyt sezonu prezentowego.

**Dorosły fan** dostaje w 5 sekund to, czego szuka: realny rabat od ceny
katalogowej, dużą liczbę, link do porównania. Dla niego hierarchia działa.

**Rekomendacja.** Na głównej, między slajderem a tabelą, pas „Szukasz
prezentu?" z 3–4 kafelkami: *Dla 4–6 lat · Dla 7–9 lat · Dla nastolatka · Dla
dorosłego* oraz *do 100 / do 200 / do 500 zł*, prowadzącymi do prezentowników.
H1 strony głównej zmienić z metodologii na obietnicę (propozycje niżej).
Plakietkę ceny w slajderze („801 zł+", „201–800 zł", „do 200 zł",
`src/pages/index.astro:355`) przepisać na język prezentu albo usunąć.

### 2.2 Cytaty i propozycje

| Gdzie | Jest | Problem | Propozycja |
|---|---|---|---|
| `/` h1 | „Prawdziwe promocje na klocki LEGO – rabaty liczone od cen katalogowych" | metodologia zamiast korzyści; szary, mały (`.glowna-h1`) | „Dobre ceny na LEGO — i pomysły na prezent, które sprawdziliśmy" |
| `/promocje-lego/` h1 | „Promocje LEGO – rabaty liczone od cen katalogowych" | prawie identyczny z h1 głównej | „Promocje LEGO dziś: tylko prawdziwe obniżki" |
| slajder | „801 ZŁ+" | nie wiadomo, co to | usunąć albo „Duży prezent" / „Na wyjątkową okazję" |
| slajder | „OKAZJA DNIA · DANE Z 05.11.2026" | techniczne | „Okazja dnia · ceny z 5 listopada" |
| `/prezentowniki/` lead | „Przewodniki prezentowe według wieku, budżetu i okazji. Ceny przy zestawach są bieżące, a rabat liczymy od ceny katalogowej LEGO." | druga połowa to metodologia | „Wybraliśmy zestawy, przy których dziecko (albo dorosły) naprawdę usiądzie do budowania — według wieku, budżetu i okazji." |
| karty prezentowników | „24.09.2026 · Mikołajki" | data publikacji jako pierwsza informacja; w listopadzie wygląda na stare | „Mikołajki · 8 zestawów do 200 zł" |
| hub, meta | „0,72 zł za klocek" | wskaźnik AFOL na górze, rodzic go nie użyje | przenieść do boksu „Dla kolekcjonera"; w meta wiek i liczba minifigurek |
| hub | „cena katalogowa **brak w naszych danych**" (10001) | mowa bazy danych | pominąć wiersz |
| hub | persona „Dla rodzica" na samym dole, pod tabelą, formularzem i podobnymi | najbardziej ludzki tekst strony jest najniżej | przenieść pod opis (obok/pod paskiem ceny), zwinięty do 2 zdań |
| deal | „Próg zakupu 2800 zł · Bardzo dobra cena poniżej 2650 zł" | „próg zakupu" to żargon redakcji | „Warto kupić poniżej 2800 zł · świetna cena poniżej 2650 zł" |
| deal | „Cena „dziś" to najtańsza oferta sklepu z własnym magazynem (bez Allegro i Ceneo), odświeżana razem z cenami w serwisie; wiążąca jest cena w koszyku." | przypis metodologiczny w kluczowym boksie | do `title`/rozwijanego „Skąd ta cena?" |
| `/promocje-lego/` „Zestawy pod lupą" | „Powyżej progu zakupu · 1199,90 zł" | promuje zestawy, które *nie* są teraz okazją, językiem redakcji | „Jeszcze za drogo — czekamy na 1050 zł" |
| plakietka | „Dla AFOL" | skrót nieznany rodzicom | „Dla dorosłych fanów" |
| `/wycofania/` lead | „Kolumna **Status** mówi, skąd znamy termin… Znacznik EOL oznacza…" | pierwszy akapit to instrukcja obsługi tabeli | zacząć od korzyści: „Te zestawy znikną ze sklepów do końca roku. Jeśli któryś jest na liście życzeń — to ostatni moment." Legendę pod filtr. |
| listingi | „w sprzedaży EOL" (dwie plakietki obok siebie) | sprzeczne na pierwszy rzut oka | „Ostatnie sztuki w sklepach" |
| deal h2 | „Werdykt: 🧱🧱🧱🧱 (4/5)" | czytnik ekranu czyta emoji 🧱 jako **„cegła"** — dokładnie słowo, którego serwis nie używa | wypustki CSS albo `<span aria-hidden="true">` + „4/5" |
| hub, promocje | „🧱 Dla kolekcjonera", „🧱 Budujesz kolekcję?" (`zestaw/[nr].astro:520`, `promocje-lego/index.astro:324`) | jw., 1291 hubów | jw. |
| menu | „🔥 Promocje LEGO" | ogień to język presji, z którym serwis deklaruje walkę | wypustki albo bez ikony |
| `/artykuly/` | h1 „Artykuły" + h2 „Wszystkie teksty" | podwójny nagłówek, zero obietnicy | h1 „Recenzje, premiery i poradniki LEGO" + jedno zdanie wstępu |

Tam, gdzie tekst jest dobry, jest naprawdę dobry: `/o-nas/` („Jeden z nas
zbudował domową kolekcję ponad 1000 zestawów LEGO – więc kiedy piszemy, że
instrukcja ma trzy trudne momenty, to dlatego, że je przeszliśmy"), lead
prezentownika 7-latka, „Obserwuj cenę" („Wyślemy jeden mail… Bez newslettera
i bez reklam"). Ten głos warto przenieść na główną i do leadów listingów.

### 2.3 Prezentowniki według płci — Wysoka

`/prezentowniki/` linkuje „Dla chłopca do 500 zł" i „Dla dziewczynki do 500 zł"
(`/artykuly/lego-na-rozpoczecie-roku-szkolnego-chlopiec/`, `…-dziewczynka/`,
tytuł: „LEGO na start roku szkolnego dla chłopca – do 500 zł"). Własne zasady
mówią wprost: `redakcja/system-wizualny.md:187` „Bez podziału prezentów według
płci", `redakcja/persony-czytelnikow.md:44` „Zakaz stereotypów płciowych",
skill `lego-standard-sprzedazowy` „Nie dzielimy prezentów według płci dziecka".
Teksty są sezonowe (wrzesień) i nieaktualne. Rekomendacja: zdjąć z listingu,
przekierować 301 na ogólny `lego-na-rozpoczecie-roku-szkolnego` albo na
prezentownik według budżetu; jeśli zostają dla SEO — przemianować na sposób
zabawy („dla fana pojazdów", „dla lubiących odgrywać historie").

---

## 3. Kolorystyka i branding

**Co komunikuje.** Granat + biel papieru + żółty klockowy, Archivo Bold,
wypustki — spójne z logo (granatowy klocek 2×2 z żółtymi wypustkami) i czytelnie
„instrukcyjne". Wrażenie: rzetelny, chłodny, ekspercki porównywacz. Ciepła
„radość budowania" jest prawie wyłącznie w zdjęciach pudełek; interfejs jej nie
dokłada. Czerwień cen dominuje każdą listę, przez co strona „krzyczy promocją"
mocniej, niż mówi jej tekst.

**Dryf palety.** Poza 9 tokenami w `:root` CSS i komponenty używają **27 innych
wartości hex**: 5 odcieni jasnego żółtego (`#fff8e1`, `#fff6da`, `#fff4d6`,
`#fff3cd`, `#fff3c4`), 4 ciemne czerwienie (`#b42318`, `#b3201f`, `#8a1c1c`,
`#c8102e`), 3 zielenie poza tokenem (`#17623a`, `#1a7f37`, `#e7f6ec`/`#e7f3ec`),
`#0f1830` (hover granatu, 13×). Rekomendacja: dodać
tokeny `--zolty-jasny`, `--czerwien-tekst`, `--zielen-jasna`, `--granat-hover`
i zastąpić nimi literały; `system-wizualny.md` dostaje te same wiersze.

**Kontrast (WCAG 2.2 AA), policzony:**

| Element | Kontrast | Wynik |
|---|---|---|
| tekst główny granat / papier | 14,5:1 | OK |
| biały / granat (CTA) | 15,6:1 | OK |
| czerwona cena `#e0312f` / biały (karty) | 4,52:1 | OK, na granicy |
| `#e0312f` / papier `#f6f7f9` | 4,21:1 | **nie** — `.status--stop` „zamknięte" na `/kalendarz-promocji-lego/` (3,65:1 na różowym tle 10%) |
| `.tag-eol`, `.badge-status--pewny` (`#b3201f` na różowym) | 5,76:1 | OK |
| `.pasek-ceny__rabat` `#b42318` / `#fff8e1` | 6,19:1 | OK |
| **obrys fokusu** `--zolty` / biały, papier | 1,54 / 1,43:1 | **nie** (1.4.11 wymaga 3:1; `zrzuty/fokus-klawiatura--1440.jpg` — ledwo widoczny) |
| obramowanie pola e-mail `--linia` / biały | 1,31:1 | **nie** (1.4.11 dla granic pól formularza) |
| żółte podkreślenie linków w tekście / biały | 1,54:1 | słabe; linki w `.prose` mają ten sam kolor co tekst, więc podkreślenie jest jedynym wyróżnikiem |

Rekomendacja: fokus jako podwójny obrys (granat 2 px + żółty 2 px) albo granat
na jasnych tłach i żółty tylko w stopce; ramka pól `#8a94a6` (≈3,2:1);
`.status--stop` na tekst `#b3201f` jak pozostałe czerwone pigułki.

---

## 4. Dostępność i wydajność (szybko)

| Sprawdzenie | Wynik | Waga |
|---|---|---|
| Błędy JS w konsoli | **0** na 26 stronach × 2 szerokości (jedyny błąd to oczekiwany 404 strony błędu) | — plus |
| Obrazy bez `alt` | 0. Pusty `alt=""` na 144 miniaturach mozaiki `/serie/` (dekoracyjne, nazwa serii jest w linku — poprawnie) | — |
| Obrazy bez wymiarów | 8 w premierze 11388, 5 w historycznym 6391 (markdown); CSS rezerwuje 4:3, więc CLS = 0 | Niska |
| CLS | 0 wszędzie poza `/szukaj?q=sokol`: **0,27 (390)** i 0,13 (1440) — stopka zjeżdża, gdy dorysowują się wyniki | Średnia |
| LCP z `loading="lazy"` | ranking aut Icons (LCP = `10295.jpg`, lazy), prezentownik 7-latka (`60496.jpg`), `/artykuly/` i `/prezentowniki/` (pierwsza zajawka). W chwili zdarzenia `load` te obrazy mają `naturalWidth = 0` | Średnia |
| Zdjęcia rozciągane | w prezentownikach i rankingach `src=?w=600` (srcset tylko 1x/2x) wyświetlane na 1036–1040 px przy 1440 — ×1,73, rozmyte, a pudełko zajmuje cały ekran (`prezentownik--1440.jpg`) | Średnia |
| Cele dotyku < 24 px (390) | `/wycofania/` „w 3 sklepach" 72×18 (×~400), `.badge-artykul` „PREMIERA" 84×21 na nowościach/serii, kropki galerii `.gs-kropka` 10×10, linki `set-ref` 46×19 w tabelach kalendarza | Niska |
| Tekst < 12 px | `.tag-eol` 10,6 px, `.badge-artykul` 10,9 px, `.kc-data` 11,2 px, plakietki 11,5 px | Niska |
| Fokus klawiatury | widoczny, ale żółty na jasnym tle (patrz kontrast) | Średnia |

Rekomendacje: `min-height` kontenera wyników na `/szukaj` (albo pokazywać stopkę
dopiero po wyrenderowaniu); pierwsze zdjęcie prezentownika/rankingu i pierwsza
zajawka `loading="eager"` + `fetchpriority="high"`; srcset w szerokościach
(`w=600, 900, 1200` + `sizes`), albo nie wypuszczać zdjęć pudełek poza 720 px
kolumny; „w N sklepach" jako `display:inline-block; padding:4px 0`.

---

## 5. Co jest zbędne albo się dubluje

| Element | Dowód | Rekomendacja | Waga |
|---|---|---|---|
| Strona główna ≈ `/promocje-lego/` | ten sam układ: h1 o „rabatach liczonych od cen katalogowych", slajder okazji, tabela z przyciskami, „Zestawy pod lupą" | główna jako rozdroże (okazje + prezent + nowości + wycofania), promocje jako pełna lista | Średnia |
| `/aktualnosci/` | 13 linków do `/artykuly/…`, to samo co filtr „Aktualności (14)" na `/artykuly/`; strony nie ma w menu | zostawić jako widok, ale `canonical` lub scalić z filtrem | Niska |
| Trzy nazwy na jedno | „Pod lupą" (kategoria), `/deale/` (URL), „OKAZJA", „Okazja dnia", „Dobra cena", „Dziś w dobrej cenie" | jeden termin dla postów („Pod lupą") i jeden dla oceny ceny | Niska |
| Martwy CSS | klasy bez użycia w HTML ani JS: `.siatka--4x4`, `.promo-boks*`, `.promo-podtytul`, `.lightbox`, `.podglad-pasek`, `.seria-inne`, `.chip/.chipy` (w `index.astro`, ale niewyrenderowane), `.set-kiedy--juz`, `.cykl-*` | usunąć (próbka 1627 stron + wszystkie artykuły, deale, prezentowniki) | Niska |
| `CyklArtykulow.astro` | podpięty w `Artykul.astro:132`, ale żaden artykuł nie ma `cykl:` we frontmatterze — choć istnieje trzyczęściowa „Historia licencji LEGO" | użyć w tych trzech tekstach albo usunąć | Niska |
| Komunikat o wycofaniu ×3 na hubie | plakietka + plakietka + ramka (42215); ×2 na 10001 | jedna ramka | Niska |
| Kalendarz promocji | „Co trwa teraz i co dalej" pokazuje zaraz po bieżącym oknie dwa **zamknięte** (20–27.10, 13–19.10), a Black Friday 27.11 („tu dzieje się najwięcej") jest niżej | kolejność: trwa → nadchodzi → archiwum (zwinięte) | Średnia |
| Przecieki | Daft Punk w „W obserwacji", choć opis mówi „LEGO potwierdziło go samo" 22.10 | przenieść do rozstrzygniętych | Niska |

### Treści sprzedażowe bez zdjęć — Wysoka

Zliczone w `dist/` (obrazy w treści poza dwoma logo):

- **Posty „Pod lupą" (`/deale/`): 17 z 21 bez żadnego zdjęcia**, m.in. 75192
  Sokół Millennium (`zrzuty/deal--1440.jpg`, `deal--390.jpg`: tytuł, boks ceny,
  tekst — bez obrazu zestawu).
- **Artykuły: 13 z 69 bez zdjęcia**, w tym recenzje 75421, 42646, 77242, 21276
  oraz `lego-friends-2027-pierwsze-zestawy-galeria-heartlake` (słowo „galeria"
  w adresie, zero zdjęć). Recenzja 75421 na telefonie to 6000 px samego tekstu
  (`zrzuty/art-recenzja--390-cala.jpg`), tabela cen dopiero na końcu.

Rekomendacja: w `Artykul.astro` dla tekstów z `zestawy:` we frontmatterze
automatycznie wstawiać zdjęcie pierwszego zestawu z `/img/<nr>.jpg` pod tytułem
(dane już są — hub ma to zdjęcie); w recenzjach mini-boks ceny pod leadem
(prototyp 1320 miał to w pasku bocznym).

---

## Mocne strony

- **Zasady przejrzystości widać w interfejsie**: rabat od ceny katalogowej,
  najtańszy sklep zawsze na górze, `rel="sponsored"` tylko tam, gdzie jest
  prowizja (`src/lib/oferty.js:241`, Smyk i LEGO świadomie bez), disclosure
  w stopce i przy tabelach.
- **Czystość techniczna**: 0 błędów JS, 0 poziomego scrolla, CLS 0 na 25 z 26
  stron (metryki zastępczych fontów w `global.css` działają), LCP poniżej 1,2 s
  na wszystkich stronach w tym pomiarze.
- **Dbałość o dostępność w wielu miejscach**: skip-link, `aria-current` z belką
  (nie sam kolor), obszar dotyku kropek slajdera 24 px, `prefers-reduced-motion`,
  kontrast zieleni przyciemniony świadomie, wszystkie obrazy z `alt`.
- **Mobile**: hub zestawu na 390 px jest wzorcowy — tytuł, cena „od … w 6
  sklepach", rabat i przycisk na pierwszym ekranie (`zestaw-sprzedaz--390.jpg`).
- **Głos**: `/o-nas/`, leady prezentowników, „Obserwuj cenę", persony „Dla
  rodzica / Dla kolekcjonera" na hubach — konkretne, ludzkie, bez presji.
- **Interfejs nie używa żargonu typu „hub", „RRP", „SKU"**; problemem są
  „próg zakupu", „EOL", „AFOL", „za klocek" — terminy redakcji, nie czytelnika.
- **Wyszukiwarka** szybka, podświetla dopasowanie i toleruje brak polskich znaków
  („sokol" → „Sokół", `szukaj--390.jpg`).
- **Spójny nagłówek i stopka**, czytelne menu z aktywną sekcją.

## Zrzuty

`zrzuty/` (29): `glowna--390`, `glowna--1440-cala`, `promocje--390`,
`promocje--1440-cala`, `deal--390`, `deal--1440`, `zestaw-sprzedaz--390`,
`zestaw-sprzedaz--1440-cala`, `zestaw-wycofany--1440`, `zestaw-zapowiedz--1440`,
`nowosci--1440`, `seria--1440`, `wycofania--390`, `wycofania--1440`,
`przecieki--1440`, `artykuly--1440`, `art-recenzja--390-cala`,
`art-recenzja--1440`, `art-ranking--1440`, `prezentowniki--1440`,
`prezentownik--390`, `prezentownik--1440`, `aktualnosci--1440`, `szukaj--390`,
`ekskluzywne--1440`, `kalendarz--1440`, `o-nas--1440`, `404--1440`,
`fokus-klawiatura--1440`.
