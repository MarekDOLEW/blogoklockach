# Audyt 06.11.2026: ceny, oferty, spójność między stronami, braki

Stan: build w `dist/` z commita `b831994` (06.11, 07:11 UTC). Dane: `src/data/*` z tego samego
commita. Ostatni przebieg Łowcy w danych jest z 05.11. Dzisiejszy (08:30 PL) przyszedł już po
buildzie, więc ceny „dziś” to w praktyce ceny z 05.11. Audyt robiłem tylko do odczytu. Własne
skrypty w Pythonie parsowały **9 940 hubów** i 10 533 wiersze listingów w `dist/`, a obok nich
dane z `src/data`. Skrypty repo uruchomiłem tylko w trybie bez zapisu: `oferty-przeterminowane.mjs --sucho`,
`kontrola-ofert.mjs`, `ceny-powyzej-rrp.mjs`, `swiezosc-tekstow.mjs`, `sprawdz-oferte.mjs`
i `lista-brakow-opisow.mjs` (wynik na stdout). Kopie `zestawy-bez-ceny.py` i
`bez-opisu-od-najnowszych.py` zapisywały wynik do scratchpadu. Nic w repo się nie zmieniło.
Firecrawl: 12 kredytów. Punktem odniesienia jest audyt z 12.10 (`materialy/audyt-2026-10-12.md`,
`audyt-2026-10-12/ceny-dane-runnery.md`, `strona-noindex-teksty.md`).

---

## Podsumowanie

**Mechanika cen jest spójna.** Sprawdziłem 7 526 przycisków `/idz/<sklep>/<nr>` poza hubami: na
stronie głównej, w `/promocje-lego/`, w seriach, na `/wycofania/`, `/nowosci/` i
`/ekskluzywne/`, w prezentownikach i w tabelach artykułów. Każda kwota z tych przycisków zgadza się
z wierszem tego sklepu w hubie. Rozjazdy są tylko w prozie artykułów, która z natury jest
datowana.

W hubach wszystko się zgadza ze sobą: pasek „od X zł w N sklepach”, minimum tabeli i
`lowPrice`/`highPrice`/`offerCount` w JSON-LD (wyjątek: 1 hub). Nie ma cen zerowych. LEGO.com w
żadnym hubie nie pokazuje ceny wyższej od RRP. Na żywo sprawdziłem 10 popularnych zestawów,
razem 26 cen. Zgadza się 22, 3 nie, 1 jest nierozstrzygnięta.

**Problemy są w treściach statycznych i w sklepach odświeżanych rzadziej:**
1. Ceny Empiku po tygodniu są nieaktualne. Weryfikacja kart z 01–02.11, czyli 5–6 dni po zrzucie,
   wykazała inną cenę na 25 z 31 kart. W 30 z 34 zmian Empik był drożej, niż pokazujemy.
2. Ceneo: program afiliacyjny zakończył się 03.11, a 1 456 hubów dalej ma wiersz Ceneo z 27.10.
   W 660 z nich Ceneo jest „najtańsze w całym rynku”.
3. Ten sam hub mówi o zestawie dwie różne rzeczy:
   - 145 hubów ma w nagłówku „cena katalogowa: brak w naszych danych”, a karta niżej podaje
     polskie RRP;
   - 8 hubów Super Mario podaje premierę „sierpień 2026” i „przedsprzedaż”, a karta pisze
     „1 stycznia 2027”;
   - hub 72168 Rayquaza podaje 1 083 i 1 183 elementy oraz wiek 10+ i 18+.
4. **Artykuły z promocjami, które się już skończyły, dalej są podlinkowane.** Linkuje do nich 52
   huby z tytułami pełnymi kwot, a Black Weeks tydz. 2 stoi na stronie głównej jako bieżąca
   „Aktualność”. Black Weeks tydz. 3 obiecuje 76454 w x-komie za 699 zł z kodem, a tabela w tym samym
   artykule i karta x-komu pokazują 809,90 zł. To najczęściej klikany zestaw tygodnia.
5. Prezentowniki mają wpisane na sztywno RRP i liczby elementów. W 14 kartach RRP nie zgadza się
   z hubem, np. 30734: 29,99 zł wobec 16,49 zł.

**Względem 12.10:**
- poprawiło się: luki RRP, kolejka opisów (185 → 38 hubów z ≥3 sklepami bez tekstu), baner
  „akcja zakończona”, hub 40896, liczba indeksowalnych hubów (1 291 → 1 972);
- pogorszyło się: Ceneo z zakończonym programem, przeterminowane oferty w `sety.json` (1 → 39),
  legacy `cena`/`sklep` z wygasłych ofert (35 → 110), Lidl spoza feedu (23 → 41).

---

## 1. Aktualność cen

### 1.1 Świeżość per sklep

Wiek liczony od 06.11. Kolumna „>14 dni (ukryte)” to oferty, których strona już nie pokazuje
(`ofertaAktualna`, 14 dni).

**`oferty_feed.json`:**

| Sklep | Ofert | 0–1 dzień | 2–7 dni | 8–14 dni | >14 dni (ukryte) | Najstarsza | Rytm | Werdykt |
|---|---:|---:|---:|---:|---:|---|---|---|
| Allegro | 6 231 | 6 231 | 0 | 0 | 0 | 05.11 | codziennie | OK |
| Media Expert | 707 | 707 | 0 | 0 | 0 | 05.11 | codziennie | OK |
| Planeta Klocków | 1 096 | 1 096 | 0 | 0 | 0 | 05.11 | codziennie | OK |
| Empik | 4 518 | 1 | 4 517 | 0 | 0 | 03.11 | pon., zrzut | OK według rytmu, ale patrz 1.3 |
| x-kom | 700 | 0 | 700 | 0 | 0 | 03.11 | pon., zrzut | OK |
| Smyk | 612 | 0 | 612 | 0 | 0 | 03.11 | wt. | OK |
| LEGO.com | 990 | 0 | 970 | 5 | 15 | 29.09 | wt. | OK (20 zniknęło z listingu) |
| MediaMarkt (nowy) | 129 | 0 | 97 | 17 | 15 | 13.10 | wt. | 17 widocznych spoza ostatniego feedu |
| Lidl | 112 | 71 | 10 | 20 | 11 | 22.09 | codziennie | **30 widocznych spoza dzisiejszego feedu** |
| **Ceneo** | 1 808 | 0 | 0 | 1 465 | 343 | 14.09 | **feed wyłączony 03.11** | **wszystko z 27.10 i starsze** |

**`sety.json`:** Allegro 1 192, Empik 1 059, Planeta Klocków 905, Media Expert 702, x-kom 679,
Smyk 601 — wszystko z 03–05.11. LEGO.com 886 (16 starszych niż 7 dni), Lidl 111 (31 w
przedziale 8–14 dni plus 11 starszych), MediaMarkt 120 (12 w przedziale 8–14 dni plus 13
starszych), Ceneo 1 (27.10).

**Liczby, o które prosiłeś:**
- Zestawy z jakąkolwiek ceną w danych: **6 972**.
- **Najnowsza cena (bez Ceneo) starsza niż 7 dni: 0 zestawów.** Starsza niż 30 dni: 0.
  - 14 zestawów ma wyłącznie cenę Ceneo, w tym 2 starsze niż 30 dni.
- Zestawy z co najmniej jedną ceną starszą niż 7 dni: 1 809 (prawie same Ceneo z 27.10). Starszą
  niż 14 dni: 380 (strona ich nie pokazuje). Starszą niż 30 dni: 178.
- W `dist/` 5 864 huby pokazują cenę sklepu. Wiek **najtańszej pokazanej** ceny:
  - 0–1 dzień: 4 637;
  - 2–7 dni: 1 221;
  - 8–14 dni: 6.
- 38 hubów ma w tabeli wiersz sklepu (bez Ceneo) starszy niż 7 dni: MediaMarkt 17, Lidl 16,
  LEGO.com 5. 12.10 audyt podał 97 hubów z jakąkolwiek ceną starszą niż 7 dni. Nie wiem, czy
  liczył wtedy Ceneo, więc porównanie jest przybliżone.

### 1.2 Ustalenia

**1.2.1 Ceneo: program zakończony, wiersze wiszą do 10.11** — *ważne*
- Dowód: `oferty_feed.json._meta.ceneo_pobrano = 2026-10-27`; `DZIENNIK.md` l. 471 (program
  385881 zakończony 03.11, `feedy.json.ceneo.aktywny = false`).
- Wiersz Ceneo ma 1 456 hubów. W **660** z nich jest tańszy od każdego sklepu i podpisany
  „najniższa oferta w całym rynku”. Przykład: `/zestaw/21372/` — Ceneo 339,00 zł „z 27.10.2026”.
- 7 hubów pokazuje wyłącznie Ceneo: 75132, 10909, 71039, 71048, 71046, 71050, 42125.
- Link ma dalej `rel="sponsored"`, choć od `834e724` prowadzi wprost na ceneo.pl.
- Od 10.11 sito 14 dni zdejmie te wiersze same, a 7 hubów zostanie bez ceny.
- Rekomendacja: zdecydować teraz, czy wiersz Ceneo znika od razu. Jeśli zostaje, zdjąć
  `sponsored` i podpis „w całym rynku” przy cenie sprzed 10 dni.

**1.2.2 Lidl: oferty spoza feedu wiszą do 14 dni, także dla martwej karty** — *ważne*
- Na stronie wisi 30 ofert Lidla, których nie było w feedzie z 05.11 (daty 23.10–03.11). 12.10
  takich ofert było 23.
- W 4 hubach taka oferta jest **najtańsza**: 11036 (28.10), 75375 (29.10), 11200 (28.10),
  60316 (24.10).
- `/zestaw/10427/`: wiersz „Lidl 259,00 zł z 29.10.2026” bez przycisku. Karta produktu zwraca
  404, a wpis w `redirects.lidl` skasowano 02.11 (`0f41b8c`). Wiersz jest więc ofertą, której
  nie da się kupić.
- Decyzja D9 z 12.10 („od razu, jak przy Empiku”) nie ma śladu w `ceneo-feed.mjs` ani w
  `oferty.js`.
- Rekomendacja: dla Lidla sito 1–2 dni albo kasowanie przy codziennym imporcie. Wiersz bez linku
  nie powinien się pokazywać.

**1.2.3 MediaMarkt (nowy od 12.10)** — *drobne*
- Feed jest z 03.11. 17 ofert z 13–27.10 jest spoza ostatniego feedu i dalej widocznych.
- W 2 hubach to najtańsza cena: 71804 i 30635, obie z 27.10.
- Rekomendacja: ta sama co dla Lidla, ale nie pilna.

### 1.3 Empik: ceny tygodniowe dezaktualizują się po kilku dniach — *ważne*

Dowód: `src/data/weryfikacja_ofert.json` (Firecrawl na kartach, 26.10–05.11):

| Dzień sprawdzenia | Dni od zrzutu | Kart Empiku | Inna cena |
|---|---:|---:|---:|
| 27–30.10 | 0–3 | 10 | 3 |
| 01–02.11 | 5–6 | 31 | **25** |
| 04–05.11 | 1–2 | 38 | 6 |

Z 34 zmian w 30 Empik był **drożej**, niż podawaliśmy. Przykłady: 43284 26,95 → 36,99 zł,
75384 128,99 → 169,99 zł, 75438 108,99 → 139,99 zł. MediaMarkt: 3 z 4 sprawdzonych kart drożej
(75408 197,99 → 289 zł).

Weryfikacja chroni tylko slajdery i „Dziś w dobrej cenie”. Tabele hubów pokazują wszystkie 4 518 cen Empiku
z poniedziałku do poniedziałku.

Rekomendacja:
- od czwartku oznaczać ceny Empiku i x-komu jako „ceny z poniedziałku” albo wyłączyć je z liczenia
  minimum;
- albo dorzucić środowy zrzut Empiku;
- albo poszerzyć weryfikację o huby z Empikiem jako najtańszym.

### 1.4 Na żywo: 10 popularnych zestawów

Wybór: slajder strony głównej i top kliknięć z 7 dni (`materialy/statystyki/2026-11-05.json`).
Smyk i Planetę Klocków sprawdzałem curlem (JSON-LD i `price`), Media Expert, x-kom, Empik, LEGO.com
i Allegro Firecrawlem.

| Zestaw | Sklep | U nas (odczyt) | Sklep 06.11 | Wynik |
|---|---|---:|---:|---|
| 71043 Zamek Hogwart (slajder 1/5) | Media Expert | 1 349,00 (05.11, kod R0211-301126) | 1 349,00 z kodem (1 509 przed kodem) | ✓ |
| 71043 | Smyk / x-kom | 1 509 / 1 509 | 1 509 / 1 509 | ✓ ✓ |
| 11379 Księgarnia (slajder 2/5) | Media Expert / PK / x-kom | 409,99 / 549,99 / 519,90 | 409,99 / 549,99 / 519,90 | ✓ ✓ ✓ |
| 21372 La Catrina | Empik / Smyk / PK | 353,99 / 389 / 474,29 | 353,99 / 389 / 474,29 | ✓ ✓ ✓ |
| 21372 | Allegro | 339,00 (05.11) | oferta przekierowuje na kartę produktu z najlepszą ofertą 373,88 | nierozstrzygnięte |
| 75192 Sokół Millennium | Media Expert / LEGO.com | 2 699 / 3 599,99 | 2 699 / 3 599,99 | ✓ ✓ |
| 76454 Hogwart: Główna wieża | x-kom / Smyk / PK | 809,90 / 829 / 1 099,99 | 809,90 / 829 / 1 099,99 | ✓ ✓ ✓ |
| 42175 Volvo FMX | Smyk / PK | 659 / 889,99 | 659 / 889,99 | ✓ ✓ |
| 72423 Shrek | Media Expert / Smyk / PK | 369 / 389 / 478,94 | 369 / 389 / 478,94 | ✓ ✓ ✓ |
| **43298 Disney kalendarz (slajder 3/5, „nowe minimum cenowe”)** | Media Expert | **89,00** (05.11) | **109,99** | **✗** |
| **76451 Privet Drive** | Media Expert / PK | **264,89 / 389,99** (05.11) | **286,02 / 343,19** | **✗ ✗** |
| 77982 Ucieczka spinozaura | Media Expert / Smyk / PK | 210,33 / 219 / 269,69 | 210,33 / 219 / 269,69 | ✓ ✓ ✓ |

Wynik: **22 zgodne, 3 niezgodne, 1 nierozstrzygnięta.** Wszystkie niezgodności dotyczą sklepów
codziennych z odczytem z 05.11, czyli ruchu cen w ciągu doby. Nie sprawdziłem, czy dzisiejszy
przebieg Łowcy je poprawił, bo commit przyszedł po buildzie.

Waga: *drobne* dla 76451. *Ważne* dla 43298: slajder 3/5 strony głównej obiecuje „nowe minimum
cenowe” 89 zł, a w sklepie jest 109,99 zł.

### 1.5 Ceny powyżej RRP, zera, skoki

- `ceny-powyzej-rrp.mjs`: 2 819 zestawów z minimum powyżej RRP. Z tego 2 816 to zestawy po EOL
  (normalne), a **3 są w sprzedaży**. Wszystkie trzy to GWP z ofertą tylko na Allegro:
  - 40896: 399 zł przy RRP 81,99 zł;
  - 40899: 324,90 zł przy RRP 81,99 zł;
  - 40909: 119,99 zł przy RRP 81,99 zł.

  Plus 40889: 128,49 zł przy RRP 81,99 zł (wycena gratisu). *Drobne*: to prawdziwa
  odsprzedaż, tekst huba to tłumaczy.
- Cen 0 zł i ≤1 zł w hubach: **0**.
- LEGO.com powyżej RRP: 0. LEGO.com poniżej RRP: 35 hubów (promocje −20/−30/−40%, np. 42211
  263,99 zł przy RRP 439,99 zł). To prawdziwe akcje z listingu 03.11.
- Skoki ×2 albo ÷2 dzień do dnia w `historia-cen` 30.10–05.11: 52.
  - Allegro 30, Empik 14 — marketplace; ostrzejsze przypadki łapie odsiew.
  - **Lidl 29.10:** sześć zestawów skoczyło do 3–4× ceny i wróciło po dobie (76336 59,90 → 259
    → 59,90; 10313 189 → 839 → 199; 11504, 10348, 75443, 75449).
  - Odsiew (próg 3× RRP) powinien był je zdjąć. Nie sprawdziłem tego na buildzie z 29.10.
  - *Drobne*. Rekomendacja: zgłosić jako błąd feedu Lidla, jeśli się powtórzy.
- `kontrola-ofert.mjs`: 1 649 ofert odrzuconych przez odsiew (Allegro 958, Empik 675, Ceneo 15,
  PK 1). Przykład skrajny: 76104 Empik 8 369 zł przy RRP 169,99 zł. Odsiew działa.
- **Podejrzany rynek bez werdyktu** (oferty poniżej 50% potwierdzonego RRP) — *ważne*.
  - Z listy D8 z 12.10 dalej czekają 3 z 5:
    - 76319 (Allegro 68,69 zł, Empik 69,99 zł);
    - 75372 (Allegro 29,99 zł);
    - 40808 (Allegro 21,99 zł).
  - **Dwie nowe oferty sprawdzone na karcie, a mimo to ukryte:**
    - 43303 x-kom 19,99 zł: cena z kodem `black-weeks3`, sprawdzona Firecrawlem 02.11
      (`kody_rabatowe.json`). Artykuł BW3 ją reklamuje, a hub jej nie pokazuje;
    - 40808 Empik 26,44 zł: `weryfikacja_ofert.json`, status „zmiana”, cena strony 26,44 zł.
  - Rekomendacja: wpisać obie do `deale_potwierdzone.json`, a dla 3 starych wydać werdykt.

### 1.6 Porządek w danych — *drobne*

- `oferty-przeterminowane.mjs --sucho`: **39 ofert starszych niż 14 dni** w `sety.json` (12.10: 1).
  Lidl 14, MediaMarkt 13, LEGO.com 11. Najstarsza: 76443 Lidl 143,90 zł z 22.09. Strona ich nie
  pokazuje.
- `oferty_feed.json`: **110 wpisów ma legacy `cena`/`sklep` z oferty starszej niż 14 dni**
  (12.10: 35). Prawie wszystkie to Ceneo, np. 10256 1 799 zł z 22.09. Strona bierze ceny z
  `oferty`, więc czytelnik tego nie widzi. `maCeneZFeedu` w `src/lib/huby.js` dalej nie sprawdza
  wieku.
- Rekomendacja: uruchamiać `oferty-przeterminowane.mjs` w Łowcy, a feed czyścić z tym samym progiem.

---

## 2. Oferty i promocje: aktualne i przeterminowane

### Co działa

- **Kody rabatowe** (`kody_rabatowe.json`):
  - aktywne: ME `R0211-301126` do 30.11 (41 zestawów) i x-kom `black-weeks3` do 08.11 (13);
  - wygasłe, czyli ME `BW3010-0511` (05.11) oraz x-kom `black-weeks1` i `black-weeks2`, nie
    pojawiają się w żadnym znaczniku kodu w `dist/`;
  - plakietki: `R0211-301126` 100×, `black-weeks3` 10×.
- **Baner „Akcja zakończona”** (rekomendacja 4 z 12.10) jest w `Artykul.astro`. Działa na
  stronach z `wazne_do`, np. `/artykuly/media-expert-kod-lego-pazdziernik-2026/` i
  `/artykuly/lego-pl-upominki-…-pazdziernik-2026/`.
- `/aktualnosci/` oznacza zakończone akcje.
- Strona główna i `/promocje-lego/`: wszystkie kwoty z przycisków zgadzają się z hubami (sekcja 3).

### Ustalenia

**2.1 Black Weeks tydz. 1 i 2 bez `wazne_do`** — *ważne*
- Dowód: `src/pages/artykuly/x-kom-black-weeks-2026-lego.md` (kod do 25.10) i
  `…-tydzien-2.md` (kod do 01.11) nie mają pola `wazne_do`.
- Skutki:
  - nie mają banera;
  - **strona główna** pokazuje kartę „Aktualność 26.10.2026 — Black Weeks w x-kom, tydzień 2:
    Grogu za 319 zł… trzy zestawy LEGO kupisz dziś z kodem black-weeks2”, choć kod wygasł 01.11;
  - na `/aktualnosci/` stoją jako trwające.
- Rekomendacja: dopisać `wazne_do: "2026-10-25"` i `"2026-11-01"`. Dodać do importu albo do
  `swiezosc-tekstow.mjs` kontrolę: artykuł z kodem z `kody_rabatowe.json` musi mieć `wazne_do`.

**2.2 Huby i listingi linkują do zakończonych akcji, a tytuł pokazuje stare kwoty** — *ważne*
- Dowód: odsyłacz „Artykuł …” w hubie (`p.odsylacz-artykul`) i plakietka „Artykuł” w
  wierszach listingów.
- Liczba hubów z linkiem do zakończonej akcji:

  | Artykuł | Hubów |
  |---|---:|
  | BW tydz. 1 | 11 |
  | BW tydz. 2 | 8 |
  | Kod ME0110-311026 | 8 |
  | Weekend x-kom | 9 |
  | Wyższa Szkoła Rabatu | 12 |
  | Upominki październik | 3 |
  | Deal 21372 z sierpnia | 1 |
  | **Razem** | **52** |

- Te same linki są na `/wycofania/`, `/ekskluzywne/`, `/nowosci/` i w 12 listingach serii.
- Przykłady:
  - `/zestaw/72050/`: „Kod ME0110-311026 w Media Expert: 64 zestawy LEGO do końca października”
    i „Grogu za 319 zł” (BW2), a dziś najniżej jest 479 zł;
  - `/zestaw/76354/`: „Weekend z LEGO… NASA Apollo za 499 zł”, przy minimum huba 1 123,27 zł;
  - `/zestaw/21372/`: „La Catrina za 359,90 zł na Amazonie – −31% na świeżej premierze”
    (sierpień), a dziś jest 339 zł.
- Rekomendacja: odsyłacz i plakietkę dobierać tylko z artykułów bez `wazne_do` albo z
  `wazne_do` ≥ dziś, tą samą funkcją co `src/lib/artykuly.js` (`zakonczony`).

**2.3 BW tydz. 3: proza mówi jedno, tabela pod spodem drugie** — *ważne*
- Dowód: `/artykuly/x-kom-black-weeks-2026-lego-tydzien-3/`.
  - **76454:** proza i przycisk „Hogwart w x-kom: 699 zł z kodem →”, a tabela „Aktualne ceny”
    niżej pokazuje x-kom 809,90 zł. Karta x-komu 06.11 (Firecrawl): 809,90 zł, przy kodzie
    brak ceny, plakietka „Black Weeks”.
  - **42175:** „Volvo z koparką w x-kom: 599 zł z kodem”, a hub i tabela nie mają wiersza
    x-komu (minimum Smyk 659 zł).
  - **43303:** „19,99 zł z kodem”, a hub ukrywa tę ofertę jako podejrzany rynek (1.5).
- x-kom 76454 to **najczęściej klikany zestaw tygodnia** (4 z 75 kliknięć ludzi,
  `statystyki/2026-11-05.json`). Czytelnik klika obietnicę 699 zł i widzi w x-komie 809,90 zł.
- Czy kod obniża cenę w koszyku: nie sprawdziłem (wymaga koszyka).
- Rekomendacja:
  - Code: sprawdzić kartę x-komu jeszcze raz;
  - jeśli kod już nie obejmuje 76454, poprawić prozę i wpis w `kody_rabatowe.json`;
  - jeśli obejmuje, cena z kodem powinna trafić do tabeli (jak przy ME) przez `kodRabatowy`.
    Dziś nie trafia, bo x-kom ma w danych 809,90 zł, a mechanizm pokazuje kod tylko wtedy, gdy
    cena z feedu ≈ cenie z kodem.

**2.4 Kalendarz promocji: statusy sprzeczne z datami** — *drobne*
- Dowód: `src/pages/kalendarz-promocji-lego.md`.
  - Lista u góry (l. 28): „21–30.09 zamknięte”. Nagłówek sekcji (l. 115): „Wrzesień: dwa gratisy
    halloweenowe, 21–30.09 — przewidywane”.
  - Back to Hogwarts (29.08–06.09), Batman Day (9–19.09), Executor (1.10/4.10) i BLDP (6.10)
    mają dalej „potwierdzone”, choć minęły.
  - „Grudzień: 323 wycofania”, a `/wycofania/` ma 428 pozycji, w tym 317 z terminem „grudzień
    2026”.
- Rekomendacja: przejrzeć statusy przy następnej aktualizacji. Liczbę wycofań brać z danych albo
  ją usunąć.

**2.5 Deale „pod lupą” ze starymi slugami** — *drobne*
- Dowód: od 30.10 teksty `deal-76354-lotniskowiec-tarczy-kod-me`,
  `deal-media-expert-przecena-lego-pazdziernik` i `deal-wrzesniowa-fala-promocji-2026` są
  evergreen (tytuły bez kodu i bez miesiąca).
- Adres dalej sugeruje akcję, która się skończyła.
- Rekomendacja: zostawić (zmiana URL kosztuje więcej), ewentualnie alias i 301.

---

## 3. Spójność informacji między stronami

### 3.1 Ceny: zgodne — *mocna strona*

| Porównanie | Sprawdzonych | Rozjazdów |
|---|---:|---:|
| Przycisk `/idz/` z kwotą poza hubami vs wiersz tego sklepu w hubie | 7 526 | **0** (poza prozą artykułów, 3.6) |
| Cena w wierszu listingu (serie, `/wycofania/`, `/nowosci/`, `/ekskluzywne/`) vs „od” w hubie | 10 533 | **0** |
| RRP w wierszu listingu vs nagłówek huba | 10 533 | **0** |
| Hub: „od” = minimum tabeli (bez Ceneo) | 5 864 | 0 |
| Hub: JSON-LD `lowPrice`/`highPrice`/`offerCount` = tabela | 5 864 | 0 (12.10: 40896 rozjechany, naprawione) |
| Hub: „w N sklepach” = liczba wierszy | 5 864 | 1 (`/zestaw/10427/`: „6”, a wierszy 7, w tym martwy Lidl bez linku) |
| Meta description „Od X zł… N elementów… RRP” vs nagłówek | 9 940 | 0 |

### 3.2 Ten sam hub, dwie wersje faktów — *ważne*

**a) 145 hubów:** nagłówek „cena katalogowa: brak w naszych danych”, a karta Piotra niżej
podaje „Polska cena katalogowa RRP”.
- Przykłady:
  - `/zestaw/80044/`: nagłówek „brak w naszych danych”, karta 439,99 zł, minimum 599,90 zł;
  - `/zestaw/41838/`: karta 659,99 zł;
  - `/zestaw/31209/`: karta 859,99 zł;
  - `/zestaw/854319/`: karta 24,99 zł.
- Wszystkie 145 są indeksowalne. Bez RRP nie ma rabatu ani progu.
- Rekomendacja: importować RRP z karty do łańcucha `cenaKatalogowaSetu` (np. `rrp_potwierdzone`
  ze źródłem „karta P07”) albo przynajmniej pokazać je w nagłówku.

**b) 6 hubów: RRP w karcie ≠ RRP w nagłówku.**
- 10338: 399,99 / 379,99 zł;
- 75328: 309,99 / 299,99 zł;
- 43269: 619,99 / 599,99 zł;
- 76326: 269,99 / 249,99 zł;
- 76327: 269,99 / 249,99 zł;
- 31147: 84,99 / 81,99 zł.

Nagłówek bierze `rrp_potwierdzone` (lego.pl 15.09), karta i `sety.json` mają starą cenę.
Rekomendacja: wyrównać `sety.json`, a kartę poprawić przez Piotra.

**c) 6 polybagów:** FAQ (JSON-LD) „Oficjalna lub wskazana cena katalogowa wynosi 16,49 zł”, a
nagłówek pokazuje 16,99 zł. Dotyczy 30715, 30722, 30723, 30724, 30728 i 30735.
Rekomendacja: poprawić kartę.

**d) 8 hubów Super Mario (72052, 72054–72058, 72060, 72061):**
- nagłówek: „premiera sierpień 2026”, plakietka: „przedsprzedaż na LEGO.com – premiera:
  sierpień 2026”;
- karta: „1 stycznia 2027”;
- `katalog.json`: `rok: 2027`, `lego_pl_etykieta: przedsprzedaz`;
- listing `/serie/super-mario/`: rok 2027.

Rekomendacja: `sety.json` `premiera: "2027-01"`.

**e) `/zestaw/72168/` Rayquaza (prezentownik świąteczny, flagowiec Pokémon):**
- nagłówek: 1 083 elementy (Brickset, `3841ec0`);
- prosa i JSON-LD `description` (`sety.json.opis`): „1183 elementy”;
- karta i metryka: 1 183;
- wiek: nagłówek 10+, karta 18+;
- `/prezentowniki/swieta-dla-dzieci/`: `elementy={1183}`.

Rekomendacja: jedna wartość we wszystkich czterech miejscach.

**f) 20 hubów:** JSON-LD `description` podaje inną liczbę elementów niż nagłówek.
- Duże różnice:
  - 43242: 2 228 / 2 208;
  - 11204: 103 / 114;
  - 42643: 102 / 110;
  - 80053: 990 / 998;
  - 71483: 457 / 464.
- Małe różnice (±1–5): 80051, 77259, 75681, 910049, 910043, 910029 i inne.

Rekomendacja: `swiezosc-tekstow.mjs` sprawdza już daty premier; dopisać liczby elementów.

**g) Wiek: 13 hubów z innym wiekiem w nagłówku i w karcie.**
- Merytoryczne:
  - 10371: nagłówek 9+, karta 18+;
  - 71866: 14+ / 8+;
  - 72160: 18+ / 10+;
  - 76156: 8+ / 6+;
  - 60341: 7+ / 5+;
  - 72165: 10+ / 8+;
  - 42235 i 42212: 9+ / 10+.
- Formatowanie: „1,5+” vs „1+”.

**h) Metryka karty vs nagłówek, liczba elementów (7):**
- 71051: 7 / 9;
- 71052: 8 / 7;
- 75646: 1 705 / 1 738;
- 910055, 910064, 910065: różnica ±3–8.

### 3.3 Prezentowniki: dane wpisane na sztywno — *ważne*

`src/pages/prezentowniki/*.astro` mają `rrp`, `elementy` i `rocznik` jako literały w `<Karta>`.
Z 121 kart 14 ma RRP ≠ hub:

| Prezentownik | Zestaw | RRP w karcie | RRP w hubie |
|---|---|---:|---:|
| speed-champions | 30734 | **29,99** | **16,49** |
| botanicals | 11510 | 219,99 | 209,99 |
| friends | 42692 / 42649 / 42685 | 42,99 / 129,99 / 219,99 | 41,99 / 124,99 / 209,99 |
| marvel | 76341 | 259,99 | 249,99 |
| harry-potter | 76464 | 259,99 | 249,99 |
| minecraft | 21279 | 439,99 | 419,99 |
| star-wars | 75448 / 75443 / 75328 | 62,99 / 84,99 / 309,99 | 61,99 / 81,99 / 299,99 |
| city | 60415 | 84,99 | 81,99 |
| ninjago | 71853 | 84,99 | 81,99 |
| duplo | 30712 | 16,99 | 16,49 |

Progi „dobra / bardzo dobra cena” wyliczono od tych RRP.

Przy 30734 nie wiem, która wartość jest prawdziwa. 14 polybagów 2026 ma w `katalog.json` 16,49 zł
bez `cena_zrodlo` — nie sprawdziłem. Do sprawdzenia na lego.pl.

Liczby elementów różnią się w 1 karcie (72168: 1 183 / 1 083). Nazwy różnią się w 42 kartach,
głównie stylistycznie (prefiks serii).

Rekomendacja: `KartaPrezentu` powinna brać RRP, elementy i rocznik z danych (jak tabela cen), a
literał zostawić tylko jako awaryjny.

### 3.4 Listingi vs huby: nazwy, seria, rok, elementy — *drobne*

- **Nazwy (179 rozjazdów):**
  - 81 na `/wycofania/` (własne nazwy w `wycofania.json`, np. 21349 „Kot w smokingu” vs
    „Czarno-biały kot”, 21335 „Zmechanizowana latarnia” vs „Zmotoryzowana latarnia morska”);
  - około 95 w listingach serii z **angielską nazwą z `katalog.json`**, gdy hub ma polską z
    `sety.json`: 42709 „Pet Care & Play Center” vs „Centrum zabawy i pielęgnacji dla
    zwierząt”, cała seria Animal Crossing, BDP, Fortnite, Architecture;
  - 30660 w `/serie/dreamzzz/`: „Zoey's Dream Jet Pack Booster”, w hubie „Plecak odrzutowy z
    dopalaczami Zoey & Pajęcza ucieczka…” — w hubie najpewniej sklejona nazwa dwóch produktów.

  Rekomendacja: listing powinien brać nazwę tak jak hub (`sety.json` przed katalogiem).
- **Seria (18):**
  - 75426 i 75427 w `/serie/star-wars/`, a breadcrumb huba „SMART Play”;
  - 43026 „Nike x LEGO” / Icons;
  - 72423 Shrek / Icons;
  - 40872, 40873, 40883 Seasonal / Icons;
  - 72306 i 40899 Archiwum / PlayStation.

  Ten sam zestaw stoi na liście jednej serii, a hub prowadzi okruszkami do innej.
- **Rok (13):** 8 × Super Mario (3.2d); 10326 i 10329 (2024 / grudzień 2023); 30673 (2024 /
  styczeń 2025).
- **Elementy (7):**
  - `/wycofania/`: 31172 **266 / 366**, 40725 430 / 438, 76417, 42211, 42130 (±1–2);
  - `/serie/one-piece/`: 75646 1 705 / 1 738, 75640 3 398 / 3 402.

  Źródło rozjazdu to `wycofania.json`.elementy i `katalog.json` vs `sety.json`.
- **Terminy wycofania:**
  - hub vs `/wycofania/`: 324 zgodne, 0 rozjazdów;
  - termin wycofania między listingami: 0 rozjazdów.

### 3.5 Nowości, zapowiedzi, przecieki, wycofania

- `/nowosci/` ma 50 wierszy nowości i 13 zapowiedzi. Nazwa, RRP, elementy i premiera zgadzają się
  z hubami: 0 rozjazdów poza nazwami angielskimi (Friends 2027, Ninjago 71875).
- `/przecieki/`: liczniki zgodne (86 w obserwacji + 14 rozstrzygniętych = 100; 13 + 1 + 0 = 14).
  77094 w karcie ~1750 elementów, w hubie 1 750.
- `swiezosc-tekstow.mjs`:
  - `/zapowiedzi-lego-2027/` — 77094 „do sprawdzenia” (w rejestrze, ale bez potwierdzenia LEGO);
  - **sprzeczność dat premiery 11381 Jaguar:** „1 lipca 2026” w `karty_setow.json`, „1 sierpnia
    2026” w recenzji `lego-11381-jaguar-e-type-recenzja.md`. *Drobne*.
- `/wycofania/`: tytuł, meta i treść podają 428 / 420 potwierdzonych — zgodnie z danymi.
  Kalendarz promocji podaje 323 (2.4).

### 3.6 Proza artykułów — *drobne, z dwoma wyjątkami*

- Proza z kwotami (28 przypadków) pochodzi z artykułów promocyjnych, które z natury są datowane.
  Wyjątki to BW3 w trakcie akcji (2.3) i artykuły bez `wazne_do` (2.1).
- „Lekcja na rozpoczęcie roku szkolnego” (sierpień): „Katalogowo 1079,99 zł, teraz 74…” i
  podobne. To snapshot sprzed 2 miesięcy, sprzeczny z zasadą „drabina zamiast snapshotu” z
  CLAUDE.md. Nie oceniałem, czy tekst jest oznaczony jako archiwalny.

---

## 4. Braki

Liczę w `dist/` (9 940 hubów; 12.10 było 9 803) z danymi z `src/data`. „W sprzedaży” = status
`dostepny` w `katalog.json` albo oferta w sklepie pierwszej ręki.

| Brak | Huby w sprzedaży (4 110) | Huby EOL (5 830) | 12.10 |
|---|---:|---:|---|
| Bez ceny w żadnym sklepie | **10** | 4 066 | — |
| Bez RRP | 1 400 (w tym 23 ze statusem `dostepny`) | 3 727 | 12 luk z ofertami → **0** (zamknięte) |
| Bez tekstu redakcyjnego (karta / opis / persony) | 2 259 | 5 708 | — |
| — w tym status `dostepny` | **26 z 996** | — | — |
| — bez żadnego opisu, także generowanego | 722 | 1 057 | — |
| ≥3 sklepy i bez tekstu redakcyjnego | **38** | — | **185** |
| Bez zdjęcia w danych (`obrazy` / `zdjecia` / `sety.zdjecia`) | 0 | 11 | — |
| Hub bez głównego `<img>` (martwe źródło, zaślepka) | 3 | 82 | — |
| Bez linku do sklepu przy cenie | 2 wiersze (10427 Lidl, 72031 x-kom) | — | — |

Skrypty repo (wersje do scratchpadu):
- `zestawy-bez-ceny.py`: 18 zestawów w sprzedaży bez RRP, 10 z kartą Piotra; 3 038 wycofanych
  poza listą.
- `bez-opisu-od-najnowszych.py`: 16 zestawów 2020–2026 `dostepny` bez żadnego tekstu.
- `lista-brakow-opisow.mjs`: 3 025 bez karty P07 — 80 z bieżącego rocznika i 2 945 starszych w
  sprzedaży. To lista dla Piotra, a nie brak na stronie, bo wiele z nich ma opis lub persony.

**Najważniejsze przykłady**

- **W sprzedaży, nowe, bez ceny:**
  - 21375 Godzilla: tylko wiersz LEGO.com bez kwoty, premiera 27.11 — w porządku;
  - 10481, 40895, 40857 „bez ogłoszonej nazwy” oraz 12010 i 12011 „City World Builder parts”:
    `dostepny` w katalogu, bez ofert, bez zdjęcia (3) i bez tekstu, noindex;
  - rekomendacja: sprawdzić, czy to nie śmieci z importu. Hub „LEGO bez ogłoszonej nazwy” w
    sprzedaży wygląda na błąd danych.
- **W sprzedaży bez tekstu (status `dostepny`):**
  - 854307, 854308, 854311 (miecze DREAMZzz/Ninjago, 3 sklepy);
  - 40722–40724, 40655, 40656 (Braille);
  - 88012, 88013, 88015 i 88009, 88010, 88005 (Powered Up);
  - 5007851, 854114, 854115.

  Same akcesoria i gadżety. **Zestawów z bieżącego rocznika bez tekstu: 0**, poza pięcioma
  bezimiennymi.
- **Bez RRP, w sprzedaży, 2026:**
  - 30732 i 30720 (polybagi, 3 i 2 sklepy);
  - 30718;
  - 40897 Miecz Dartha Vadera (GWP);
  - 854328 Dumbo Key Chain.

  145 kolejnych ma RRP w karcie Piotra (3.2a), co jest najtańszą drogą do domknięcia.
- **Bez zdjęcia:** 11 hubów EOL bez źródła, m.in. 50090 Przygoda w parku LEGOLAND (zapowiedź
  2027), L0002205, L0002213, L0002215, L0002290 (polybagi Ninjago/City 2026). 82 kolejne mają
  martwe źródło (np. 5009635, Rebrickable 404). Żaden z nich nie jest w sprzedaży. *Drobne*.

---

## Mocne strony

- **Ceny są spójne na wszystkich typach stron:** 0 rozjazdów przy 7 526 przyciskach i 10 533
  wierszach listingów. Jedno sito (`filtrujOferty`) i wspólne funkcje działają tak, jak
  zaprojektowano.
- **Hub zgadza się ze sobą:** „od”, minimum tabeli, JSON-LD i meta description — 100%. Usterka
  40896 z 12.10 zniknęła.
- **Sklepy codzienne są świeże:** Allegro, ME i PK w 100% z 05.11. 0 zestawów z najnowszą ceną
  starszą niż 7 dni (poza 14 „tylko Ceneo”).
- **Ceny na żywo:** 22 z 26 zgodnych (85%), wszystkie rozjazdy dobowe. Kody ME są poprawnie
  wliczone (71043: 1 349 zł z kodem).
- **Kody wygasłe znikają automatycznie.** Baner „akcja zakończona” wdrożony. `/aktualnosci/`
  porządkuje zakończone akcje.
- **Odsiew łapie śmieci:** 1 649 ofert. LEGO.com nigdy powyżej RRP. W sprzedaży nad RRP są tylko
  3 GWP.
- **Braki tekstów prawie zamknięte:** 26 z 996 zestawów `dostepny` bez tekstu (same gadżety).
  Huby ≥3 sklepy bez opisu: 185 → 38. Indeksowalne huby: 1 291 → 1 972.
- 12 luk RRP z 12.10 zamkniętych (11501 ma RRP, polybagi i GWP mają RRP albo `bez_rrp`).
- Weryfikacja kart przed slajderami (`weryfikacja_ofert.json`) to dobre narzędzie. Ona
  ujawniła problem Empiku z 1.3.

## Porównanie z 12.10

| Obszar | 12.10 | 06.11 | Kierunek |
|---|---|---|---|
| Ceneo w feedzie | 135 ofert >14 dni, feed działa | program zakończony, 1 465 z 27.10 widocznych, 343 >14 dni | **gorzej** |
| Lidl spoza feedu widoczny | 23 | 30 (+11 ukrytych), martwa karta 10427 z ceną | **gorzej** |
| `sety.json` oferty >14 dni | 1 | 39 | **gorzej** (strona ich nie pokazuje) |
| Legacy `cena`/`sklep` ze starej oferty | 35 | 110 | gorzej (niewidoczne) |
| Podejrzany rynek bez werdyktu | 5 | 3 stare + 2 sprawdzone, a ukryte | bez zmian |
| Wygasłe aktualności | brak banera | baner jest; 2 artykuły BW bez `wazne_do`; 52 huby linkują do zakończonych akcji | lepiej, z luką |
| Luki RRP z ofertami | 12 | 0 | **lepiej** |
| 40896 JSON-LD vs tabela | rozjazd | zgodne | **lepiej** |
| Huby ≥3 sklepy bez opisu | 185 | 38 | **lepiej** |
| Huby indeksowalne | 1 291 | 1 972 | **lepiej** |
| Nowy sklep MediaMarkt | — | 129 ofert, tygodniowo, 17 widocznych spoza feedu | nowe |

## Nie sprawdzono

- **Ceneo na żywo:** ceneo.pl zwraca stronę zabezpieczającą (21 KB, ten sam tytuł dla każdego
  produktu). `sprawdz-oferte.mjs` widzi tylko kod 200.
- **Allegro 21372 (339 zł):** adres oferty przekierowuje na kartę produktu z inną ofertą
  wyróżnioną (373,88 zł). Nie da się stwierdzić, czy oferta za 339 zł żyje.
- **Cena x-kom z kodem `black-weeks3` w koszyku:** wymaga koszyka. Strona produktu pokazuje
  809,90 zł.
- **Czy dzisiejszy Łowca (06.11) poprawił 43298 i 76451:** commit przyszedł po buildzie, a
  zgodnie z zasadami nie robiłem builda.
- **Prawdziwe RRP polybagów 2026 (16,49 vs 16,99 vs 29,99 zł):** 14 wpisów w `katalog.json` bez
  źródła. Rozstrzyga lego.pl.
- **Skok cen Lidla z 29.10:** nie sprawdziłem, czy trafił na stronę. Build z tamtego dnia nie
  istnieje lokalnie.

## Rekomendacje według wpływu

| # | Kto | Co | Waga |
|---|---|---|---|
| 1 | Code | BW tydz. 1 i 2: dopisać `wazne_do`. Odsyłacze w hubach i plakietki w listingach tylko do akcji trwających | ważne |
| 2 | Code (x-kom) | BW3: sprawdzić 76454, 42175 i 43303 na karcie. Poprawić prozę albo dostarczyć cenę z kodem do tabeli; 43303 do `deale_potwierdzone` | ważne |
| 3 | Marek | Ceneo: wiersz znika teraz czy 10.11? Jeśli zostaje: bez `sponsored`, bez „w całym rynku” | ważne |
| 4 | Code | 145 RRP z kart P07 do łańcucha RRP. Wyrównać 6 rozjazdów RRP karta/nagłówek i 6 polybagów w FAQ | ważne |
| 5 | Code | Super Mario 8 × premiera 2027-01; Rayquaza 72168 jedna liczba elementów i wiek; 20 rozjazdów elementów w opisach | ważne |
| 6 | Marek + Code | Empik: druga połowa tygodnia — oznaczyć wiek ceny, środowy zrzut albo szersza weryfikacja kart | ważne |
| 7 | Code | Prezentowniki: RRP, elementy i rocznik z danych, nie z literałów (14 rozjazdów RRP) | ważne |
| 8 | Code (decyzja D9) | Lidl i MediaMarkt: oferty spoza ostatniego feedu poza tabelą; wiersz bez linku poza tabelą | ważne |
| 9 | Marek | Werdykt: 76319, 75372, 40808 (Allegro) i 40808 Empik 26,44 zł (sprawdzone) | drobne |
| 10 | Code | `oferty-przeterminowane.mjs` w Łowcy; czyszczenie legacy `cena`/`sklep` w feedzie | drobne |
| 11 | Code | Listingi: nazwa z `sety.json` przed katalogiem; wyrównać serię 18 zestawów i elementy w `wycofania.json` (31172: 266 → 366) | drobne |
| 12 | Code / Piotr | Kalendarz: statusy minionych okien, „323 wycofania”; 11381 data premiery (karta vs recenzja) | drobne |
| 13 | Code | Sprawdzić huby „LEGO bez ogłoszonej nazwy” (10481, 40895, 40857) i „City World Builder parts” ze statusem `dostepny` | drobne |

Pliki robocze: `/tmp/claude-0/-home-user-blogoklockach/7bc39f44-7207-58cb-999c-eb466d2f2ed5/scratchpad/a/`
(`huby.json`, `listingi.json`, `idz.py`, `cmp_*.py`, `braki.py`, `prez.py`, wyniki skryptów repo).
