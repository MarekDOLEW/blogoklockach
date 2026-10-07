# Audyt CRO hubów `/zestaw/`, postów dealowych i prezentowników — 25.09.2026

Zlecenie Marka (24.09): „zrób audyt CRO hubów". Inspiracja: karuzela „AI CMO"
(/cro-audit — poprawki uszeregowane po pieniądzach, nie po opinii). Tu pieniądz
to **kliknięcie afiliacyjne** — jedyna mierzalna konwersja serwisu (prowizje
liczą sieci, z opóźnieniem i bez podziału na strony).

## 1. Co zmierzono i jak

- **Układ stron** w Chromium (Playwright) na lokalnym buildzie z prawdziwymi
  zdjęciami z produkcji: 6 hubów (43014, 60470, 42177, 75192, 72046 — hub lekki
  z katalogu, 21065 — ekskluzyw), post dealowy x-kom, prezentownik „Święta ·
  dzieci", listing `/deale/`. Dwa widoki: telefon 390×844 (linia zgięcia 844 px)
  i desktop 1280×800.
- **Kliknięcia** z Workers Analytics Engine (`scripts/kliki-raport.mjs`, tylko
  `human`, 14 dni do 25.09) plus własne zapytanie po stronie źródłowej (`blob4`).
- **Indeksacja** z raportu Kontrolera 22.09 i inspekcji GSC z 24.09.

Nie mierzono: odsłon per strona (Cloudflare Web Analytics nie ma tu API), więc
nie znamy współczynnika klik/odsłona. Kolejność poprawek wynika z udziału typu
strony w kliknięciach i z tego, ile ekranów dzieli czytelnika od przycisku.

## 2. Liczby wejściowe

**Kliknięcia afiliacyjne, ludzie, 14 dni: 156** — z czego 17 to jeden przebieg
bota z 16.09 z podrobionym refererem `/zestaw/x/` (18 różnych sklepów w minutę,
USA; worker już o tym wie, `src/worker.js:101`). Realnie **~139, czyli ~10 dziennie**.

| Skąd klik | 14 dni | Udział |
|---|---|---|
| hub `/zestaw/<nr>/` | 122 (w tym 17 bota) | **78%** |
| brak referera | 14 | 9% |
| strona główna | 8 | 5% |
| artykuł | 7 | 4% |
| post dealowy | 3 | 2% |
| listing `/deale/` | 2 | 1% |
| **prezentownik** | **0** | **0%** |

Top huby: 76354 Lotniskowiec (Allegro 11, Smyk 3, ME 2, LEGO 2), 76355 Batmobil
(LEGO 9, PK 4), 43020, 75367, 21348, 42182. Sklepy: Allegro 32, LEGO.com 25,
Media Expert 23, Empik 17, Smyk 13, Ceneo 10, PK 8, x-kom 5.

**11 kliknięć (8%) przyszło z adresów z `utm_source=chatgpt.com`** — huby
i artykuły są cytowane przez ChatGPT; to dziś większe źródło niż wszystkie
posty dealowe razem.

**Układ na telefonie (390 px, zgięcie 844 px):**

| Strona | h1 od góry | tabela cen | pierwszy przycisk sklepu | przyciski w 1. ekranie | wysokość strony |
|---|---|---|---|---|---|
| /zestaw/43014/ | 573 | 776 | 864 | 0 | 8 209 |
| /zestaw/60470/ | 607 | 941 | 1 029 | 0 | 9 021 |
| /zestaw/42177/ | 642 | 1 174 | 1 280 | 0 | 4 897 |
| /zestaw/75192/ | 642 | 1 320 | 1 427 | 0 | 8 073 |
| /zestaw/72046/ (lekki) | 573 | 844 | 950 | 0 | 4 375 |
| /zestaw/21065/ (ekskluzyw) | 676 | 1 079 | 1 185 | 0 | 8 208 |
| post dealowy x-kom | 176 | 1 504 | 1 432 | 0 | 8 847 |
| prezentownik dzieci | 146 | — | 3 480 (link tekstowy) | 0 | 18 670 |
| listing /deale/ | 91 | 484 | 575 | 2 | 10 896 |

Na desktopie (zgięcie 800 px) pierwszy przycisk hubów leży na 703–832 px — na
granicy; przy dłuższym tytule (42177, 75192, 21065) też poniżej.

Co zajmuje pierwszy ekran huba na telefonie: nagłówek serwisu (60 px), okruszki,
**zdjęcie pudełka ~350 px**, plakietka serii, tytuł w 2–3 liniach, dwie linie
metryki. Cena pojawia się dopiero w tabeli, przycisk sklepu 20–580 px pod
linią zgięcia. Poniżej tabeli (10–15% wysokości strony) nie ma już **żadnego**
przycisku sklepu: karta redakcyjna, metryka, FAQ, podobne zestawy i persony
(85% długości strony) prowadzą tylko do innych hubów.

## 3. Lista kontrolna — wynik

| # | Kryterium | Hub | Post dealowy | Prezentownik |
|---|---|---|---|---|
| 1 | Cena i przycisk sklepu widoczne bez przewijania (telefon) | ✗ | ✗ | ✗ |
| 2 | Przycisk dostępny także po przeczytaniu treści (dół strony / pasek) | ✗ | ✓ (przyciski w treści) | ✗ (linki tekstowe) |
| 3 | Najtańsza oferta wyróżniona | ✓ | ✓ | ✗ (karta pokazuje sklepy bez wyróżnienia) |
| 4 | Data przy cenie / uczciwość odczytu | ✓ | ✓ | ✓ |
| 5 | Główna obiekcja odpowiedziana przy przycisku (oryginał, sprzedawca Allegro, koszt dostawy) | ✗ | częściowo | ✗ |
| 6 | Dowód społeczny obok ceny (ocena, liczba posiadaczy) | ✗ (tylko w prozie na dole) | ✗ | ✗ |
| 7 | Etykieta przycisku mówi, dokąd prowadzi | ✗ („Sprawdź w sklepie →" ×6) | ✓ (nazwa sklepu + cena) | — |
| 8 | Ujawnienie afiliacji krótkie, nie odstrasza | ✓ | ✓ | ✓ |
| 9 | Waga strony, lazy loading | ✓ (21–46 kB HTML, obrazy lazy) | ✓ | ✓ |
| 10 | Pomiar kliknięć odporny na boty | częściowo (podrobiony referer przechodzi) | — | — |

## 4. Poprawki uszeregowane po wpływie na kliknięcia

**A. Cena i przycisk nad zgięciem na hubie (telefon).** Największy wpływ:
78% kliknięć idzie z hubów, a każdy czytelnik na telefonie musi przewinąć cały
ekran, zanim zobaczy cenę. Zmiana: pod tytułem pasek „**od 249,90 zł** w 6
sklepach · najtaniej x-kom" z jednym przyciskiem do najtańszego sklepu i kotwicą
„wszystkie ceny ↓"; zdjęcie pudełka na telefonie mniejsze (maks. ~200 px
wysokości albo obok tytułu), okruszki jedną linią. Cel: przycisk poniżej 700 px
na 390 px. Szablon: `src/pages/zestaw/[nr].astro` + `global.css`. Pół dnia.

**B. Powtórzony przycisk na dole huba albo pasek przyklejony.** 85% długości
huba nie ma żadnego przycisku sklepu; czytelnik, który doczytał kartę
redakcyjną do „dla kolekcjonera", jest 5 000–7 000 px od tabeli. Zmiana: blok
„Najtaniej dziś: x-kom 249,90 zł → " po karcie redakcyjnej i przed FAQ, albo
pasek przyklejony do dołu ekranu na telefonie pojawiający się po przewinięciu
tabeli (bez JS: `position: sticky` w karcie cen nie zadziała, potrzebny mały
skrypt). Pół dnia. Razem z A daje przycisk na każdym ekranie huba.

**C. Prezentowniki: linki sklepowe jako przyciski + wyróżnienie najtańszego.**
Zero kliknięć z 20 prezentowników w 14 dni, choć to nośnik całego sezonu.
W karcie zestawu (`KartaPrezentu.astro`) sklepy są linkami tekstowymi w wierszu
„Kup teraz w", bez wyróżnienia i bez przycisku; pierwszy link afiliacyjny leży
3 480 px od góry. Zmiana: wiersze sklepów jak w tabeli huba (najtańszy na żółto,
przycisk z nazwą sklepu i ceną), plus w galerii na górze etykieta „od X zł".
Jeden komponent, wszystkie 20 stron naraz. Pół dnia. Do zrobienia **przed
Black Friday**.

**D. Post dealowy: pierwszy przycisk nad zdjęciem.** Wstęp (150 słów) + zdjęcie
spychają pierwszy przycisk na 1 432 px. Zmiana w szablonie postów: pasek
„od X zł · sklep →" bezpośrednio pod tytułem (z danych, nie z treści) — to samo
co A, inny layout. Godzina, jeśli A jest zrobione.

**E. Pasek zaufania pod tabelą cen.** Obiekcje, których hub nie adresuje przy
przycisku: „czy to nowy, oryginalny zestaw" (Allegro), „ile kosztuje dostawa",
„czy cena jest aktualna" (to akurat jest — data przy każdej cenie). Zmiana: jedna
linia pod tabelą: „Sklepy z własnym magazynem: Media Expert, x-kom, Smyk, Empik,
Planeta Klocków, LEGO.com. Allegro to marketplace — sprawdź, czy sprzedawca jest
firmą i czy zestaw jest nowy." Plus koszt/próg darmowej dostawy tam, gdzie go
znamy (pole w `sklepy.json`). Dwie godziny.

**F. Dowód społeczny obok ceny.** Ocena Bricksetu i liczba posiadaczy istnieją
tylko w prozie „dla kolekcjonera" na dole. Zmiana: pole strukturalne w
`sety.json` (`brickset: {ocena, glosy, posiadacze, data}`) uzupełniane przez
Scouta i wyświetlane w metryce pod tytułem: „4,2/5 · 87 ocen · 4,9 tys.
w kolekcjach (Brickset)". Dane dla roczników 2025–26 mamy już z audytu
prezentowników (594 zestawy). Dzień pracy plus zmiana promptu Scouta.

**G. Etykiety przycisków z nazwą sklepu.** „Sprawdź w sklepie →" sześć razy
pod rząd; wiersz podaje sklep, ale przycisk nie. Zmiana: „Do x-kom →",
„Do Media Expert →". Kwadrans. Sam w sobie mały efekt, ale za darmo.

**H. Pomiar: podrobiony referer.** 17 z 156 „ludzkich" kliknięć to bot
z refererem `/zestaw/x/` (strona nie istnieje, 404). Filtr `human` powinien
wymagać, żeby ścieżka huba w refererze miała numer 4–7 cyfr zgodny z numerem
w `/idz/`. To zmiana w `src/worker.js` — **wymaga zgody Marka** przed pushem.
Bez tego raporty EPC są zawyżone o ~10%.

## 5. Czego nie robić

- Nie dokładać wyskakujących okien, liczników czasu ani „zostały 3 sztuki" —
  standard redakcyjny zakazuje sztucznej presji, a huby są cytowane przez
  ChatGPT właśnie za rzetelność.
- Nie skracać ujawnienia afiliacji — jest krótkie i pod tabelą, nie przeszkadza.
- Nie testować A/B: 10 kliknięć dziennie to za mało na jakikolwiek wynik.
  Pomiar skutku: `kliki-raport.mjs --dni 14` przed wdrożeniem (139 realnych)
  i 14 dni po, z poprawką na sezon.

## 6. Kolejność wdrożenia

1. A + G (hub: cena nad zgięciem, etykiety) — jeden commit.
2. C (prezentowniki) — przed pierwszymi promocjami listopadowymi.
3. B (dolny przycisk / pasek) — razem z A albo tydzień później, żeby widzieć
   osobno.
4. D, E — po sprawdzeniu, czy A nie zepsuło układu na desktopie.
5. F — z udziałem Scouta; H — po decyzji Marka.
