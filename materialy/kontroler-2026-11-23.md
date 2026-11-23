# Raport Kontrolera — 23.11.2026 (poniedziałek)

> **Tydzień przed Black Friday, trzy rzeczy.** Pierwsza: **Smyk blokuje nas od 17.11** (strona
> „Browser Validation" zamiast karty produktu) — wtorkowy odczyt nie wszedł, pierwszy piątkowy odczyt
> z decyzji 2 z 16.11 skończył się 83 kartami z ceną na 704 (bramka 400 go zatrzymała, słusznie); ceny
> Smyka w hubach mają 10–11 dni, a Smyk ma 18 polskich kliknięć w 30 dni. Decyzja 1. Druga: ruch
> z Polski **57 kliknięć (8,1 dziennie)**, okno 28 dni **8,2** — najwyżej od początku pomiaru, przy
> botach, które spadły z 12 742 do 4 509. Trzecia: Google odwiedził `/zestaw/10280/` **po 72 dniach**
> (22.11) i przyjął z powrotem `/serie/marvel/`; sitemapa hubów skoczyła o 338 adresów (karty P07).

> Na minusie: panel GSC bez odczytu od 06.11 (17 dni — prośba niżej), kontrola w przeglądarce
> z 20.11 odpaliła się (SUCCEEDED 11:45), ale **wyniku nie ma ani w repo, ani w dzienniku**, zrzuty
> Empiku i x-komu weszły w piątek, nie w poniedziałek, a dziś do 09:33 ich nie ma.

---

## Kto co robi

**Decyzja 1: smyk.com blokuje odczyt skryptem od 17.11 (Gcore „Browser Validation Page", HTTP 200 bez ceny) — wtorek 17.11: 0 wczytanych, piątek 20.11: 83 karty z ceną na 704 (12.11 było 569); ceny Smyka w hubach stoją na 12–13.11.**
**Mamy?** — częściowo: `smyk-odswiez.mjs` od 17.11 rozpoznaje blokadę jako błąd (nie zdejmuje ofert), mniejsza równoległość nie pomaga (Radar zmierzył: 5–7 blokad na 12 przy 1–2 wątkach); Firecrawl ma od dziś pełną pulę (odnowienie 23.11, 5 000 kredytów); Radar 17.11 liczył 5 kredytów za kartę, czego nie weryfikowałem.
**Zrobić:** — zgoda na odczyt Smyka przez Firecrawl: ok. 570 kart na przebieg, raz w tygodniu (wtorek) do końca blokady albo do 31.12; koszt do zmierzenia na 10 kartach przed pełnym odczytem — przy stawce podstawowej ok. 570 kredytów, Radar 17.11 liczył 5 kredytów za kartę (wtedy ok. 2 850 z puli 5 000); Code dopisze tryb `--firecrawl` do `smyk-odswiez.mjs`, piątkowy trigger zostaje (bramka 400 chroni dane). Alternatywa bez kredytów: Cowork w przeglądarce, ale 570 kart to nie jest robota na klikanie.
**Kto:** — Marek (decyzja, kredyty)

**Decyzja 2: faniklockow podają na Black Weeks Allegro ceny niższe od naszego feedu (10316 — 1 689 wobec 1 948,40 zł; 76300 — 1 034,55 wobec 1 199,97 zł); Radar nie sprawdził na żywej ofercie, czy to kupon koszykowy, którego feed nie widzi.**
**Mamy?** — częściowo: ceny Allegro czytamy z feedu, nie z kart ofert; jeśli różnica to kupon kampanijny, przez cały tydzień Black Friday nasze tabele będą pokazywać Allegro drożej, niż widzi kupujący.
**Zrobić:** — otworzyć w przeglądarce ofertę 10316 na Allegro (link z huba `/zestaw/10316/`), dodać do koszyka i sprawdzić, czy cena spada do ~1 689 zł; jeśli tak — Code dopisze przy wierszu Allegro w tabelach dopisek „cena bez kuponu Black Weeks" na 24–30.11.
**Kto:** — Marek (przeglądarka)

**Decyzja 3: 43018 Lionel Messi spadł w Media Expert do 349 zł (−55% od RRP 779,99) — hub ukrywa ofertę jako niepotwierdzoną (sito 50% RRP), pozycja Łowcy czeka od 17.11 (6 dni), a ME dokłada ten zestaw jako gratis od 2 000 zł.**
**Mamy?** — częściowo: cena w danych i w `/zestaw/43018/`, blok ofert jej nie pokazuje; mail „podejrzany rynek" z 17.11 ma link do panelu.
**Zrobić:** — potwierdzić albo odrzucić w `deale_potwierdzone.json` (panel, link z maila 17.11); po potwierdzeniu to najmocniejszy kandydat na post dealowy przed Black Friday (kryterium a: regularny sklep poniżej 50% RRP).
**Kto:** — Marek (decyzja, panel)

**Panel GSC („Strony") bez odczytu od 06.11 — 17 dni, a sitemapa hubów urosła w tym czasie z 1 929 do 2 444.**
**Mamy?** — nie: ostatni odczyt 903 (dane z 23.10).
**Zrobić:** — odczytać raport „Strony" w panelu GSC (ten sam prompt Coworka co 06.11, C2 z audytu), zapisać jak `materialy/indeksacja/gsc-strony-2026-11-06.md`.
**Kto:** — Cowork (panel) albo Marek (panel)

**Kontrola linków w przeglądarce 20.11 odpaliła się (Routine `trig_01NRYdRPRMVTYZTGDf5C8iH6`, 11:45, SUCCEEDED), ale w repo nie ma `materialy/kontrola-przegladarkowa/wyniki-2026-11-20.md`, a w dzienniku nie ma wyniku — nie wiem, czy 20 linków było żywych.**
**Mamy?** — nie: lista z 20.11 (`lista.md`, 4 × 5 sklepów) jest, wyniku nie ma; 20.10 wynik wkleił Marek do sesji Kontrolera.
**Zrobić:** — wkleić wynik z rozmowy Coworka z 20.11 (albo napisać, że przebieg nie dał wyniku); Kontroler zapisze `wyniki-2026-11-20.md` i dopisze pozycje za martwe karty, jeśli były.
**Kto:** — Marek (przeglądarka)

**80122 Pixiu i 80123 Noworoczny rejs: pole `opis` w `sety.json` podaje dla każdego dwie daty wejścia do sprzedaży („23 grudnia 2026" i „1 stycznia 2027") — `swiezosc-tekstow.mjs` liczy to jako sprzeczność, a `opis` idzie do JSON-LD huba.**
**Mamy?** — częściowo: najpewniej to wcześniejszy dostęp Insiders (23.12) i sprzedaż ogólna (1.01), czyli prawda w dwóch datach, ale skrypt tego nie rozróżnia i czytelnik JSON-LD też nie.
**Zrobić:** — w `opis` obu zestawów zostawić jedną datę jako datę premiery (1 stycznia 2027) i wcześniejszy dostęp opisać słowami bez daty w formacie dziennym, albo nauczyć `swiezosc-tekstow.mjs` frazy „wcześniejszy dostęp" — jedno z dwojga, żeby alarm nie wracał co tydzień.
**Kto:** — Code (dane)

**11381 Jaguar E-Type: karta „1 lipca 2026", recenzja i `sety.json` „1 sierpnia" — czwarty tydzień tej samej sprzeczności.**
**Zrobić:** — potwierdzić datę na karcie lego.com i poprawić kartę w `karty_setow.json`; pozycja z 02.11.
**Kto:** — Code (dane)

**Radar nadal zostawia pozycje „zrobione w tym przebiegu" bez linii „→ zamknięte" — 25 takich w dzienniku (tydzień temu 17); pozycja z 16.11 dla Marka (prompt Radaru) bez ruchu.**
**Zrobić:** — jedna linijka w prompcie zadania Radaru (panel): po „zrobione w tym przebiegu" dopisywać „→ zamknięte <data>".
**Kto:** — Marek (panel)

Trzy decyzje redakcyjne przed Black Friday z poprzednich tygodni (Black Weeks ME — tekst zbiorczy, kalendarze
adwentowe, prezentownik do 50 zł) nadal bez odpowiedzi; po 27.11 dwie z nich stracą sens. Są w mailu
„Zadania bez właściciela" (id `01a2078e`), razem z dwiema krótkimi formami dla Piotra na ten tydzień
(gratis od 310 zł do 26.11; kod INSIDERS10 — okno już zamknięte 22.11, więc ta druga jest po terminie).

---

## Diagnoza środowiska — 2026-11-23 08:33 UTC

**Repo**
- gałąź `kontroler` @ `03e5dce`, origin/main @ `03e5dce` — 0 commitów ponad main, 0 do nadrobienia, 2 pliki niezacommitowane (archiwum dziennika)
- node_modules ✓, astro ✓

**Zmienne środowiska**
- ustawione: 14/14 — komplet

**Dane**
- oferty_feed zaktualizowane: 2026-11-23
- rejestr afiliacji zaktualizowany: 2026-11-06
- import Empiku: **2026-11-20** (piątek, `2e7b3fe`: 4 579 cen Empik, 656 x-kom, −39 martwych Empiku, −3 x-komu); dzisiejszy nie wszedł do 09:33 PL
- oferty: allegro 6 279, empik 4 579, ceneo 1 808, planetaklockow 1 043, lego 1 012, xkom 656, mediaexpert 620, **smyk 572 (daty 12–13.11 — blokada bota)**, mediamarkt 204, lidl 120
- rejestr Scouta (known_sets.json): 1 408/1 408 ✓ (tydzień temu 1 361: +34 z decyzji 1 z 16.11, +13 Scouta)

**Dostępy** *(realne wywołania, nie deklaracje)*
- cloudflare: **ok** (kliknięć 7 dni: 4 568 — tydzień temu 12 799) · r2: **ok**
- tradedoubler: **ok — ROZJAZD Z REJESTREM** (Ceneo: TD ACCEPTED, rejestr `zakonczony`) — pozorny, pozycja Code z 09.11 bez ruchu trzeci tydzień
- search_console: **ok** · adtraction: **ok** · performers: **ok**
- produkcja: **ok** (200) · link sklepu z przeglądarki: **ok** (302) · firecrawl: **ok** (1 581 kredytów — tydzień temu 2 191; **pula odnawia się dziś, 23.11**)

Media Markt 161 → 204 ofert (feed TD rośnie trzeci tydzień), Media Expert 654 → 620 (niedostępne
odpadają), Planeta Klocków 1 074 → 1 043.

---

## Cztery kamienie milowe na grudzień 2026

| Kamień | Tydzień temu (16.11) | **Dziś (23.11)** | Kierunek |
|---|---|---|---|
| **1. Zatwierdzona prowizja w każdej z 3 sieci z API** | 2 z 3 — TD, Performers | **2 z 3 — TD (7 zatwierdzonych, 90 dni), Performers (3 zatwierdzone, 13,06 zł); Adtraction 0** | bez zmian |
| **2. EPC per sklep na próbie > 1 transakcji (próg 10 EUR)** | 2 sklepy | **2 sklepy: Empik (4 tr., 374 EUR), Media Expert (3 zatw., 1 008 zł)** | bez zmian |
| **3. Kliknięcia z Polski dziennie** | 7,4 (7 dni) / 7,5 (28 dni) | **8,1** (7 dni) / 7,8 (14 dni) / **8,2** (28 dni) | **w górę — rekord okna 28 dni** |
| **4. Zaindeksowane strony (panel GSC)** | 903 *(06.11, dane z 23.10)* | **903** *(ten sam odczyt, 17 dni)* | brak odczytu — prośba wyżej |

### Kamień 1 — bez zmian, ale Ceneo dołożyło trzecie zatwierdzenie

Tradedoubler, 90 dni: 17 transakcji, 11,08 EUR, **zatwierdzone 7** (Empik 3, Ceneo 3, Lidl 1) —
tydzień temu 6. W oknie 7 dni **zero transakcji TD** po raz pierwszy od września (Ceneo zamknięte,
Empik bez konwersji w tygodniu Insiders). Performers, 90 dni: 3 zatwierdzone (13,06 zł) bez zmian,
**pending 12 (15 189 zł sprzedaży, 269,11 zł prowizji)** — dwie nowe w tygodniu (248,99 zł → 1,64 zł).
Najstarsza oczekująca z 03.10 ma dziś 51 dni; jeśli rytm z września się powtórzy, przejdzie około
03–10.12. Adtraction: 0 w całej historii przy 18 polskich kliknięciach do Smyka w 30 dni.

### Kamień 2 — dwa sklepy, nic nowego

Empik 4 transakcje (374 EUR), Media Expert 3 zatwierdzone (1 008 zł). Trzeci kandydat — Smyk przez
Adtraction — nie ma ani jednej transakcji, a od 17.11 nie mamy nawet jego cen (decyzja 1).

### Kamień 3 — 8,1 dziennie, okno 28 dni 8,2 — najwyżej od startu

| Okno | Kliknięć z Polski | Średnio dziennie |
|---|---:|---:|
| 7 dni | 57 | **8,1** |
| 14 dni | 109 | 7,8 |
| 28 dni | 230 | **8,2** |

Poprzedni tydzień 52 → 57. Dni: 6, 11, 6, 6, 9, 7, 10 (+2 dziś) — bez piku, równo. Okno 28 dni:
5,6 → 7,0 → 7,5 → 7,5 → **8,2** w pięć tygodni. Skąd: **huby 41, artykuły 8, strona główna 7,
prezentowniki 1.** **ChatGPT: 37 z 57 (65%)** — tydzień temu 73%, liczba bezwzględna 38 → 37.
Google: 4 kliknięcia na stronę. Artykuły wracają do gry: tekst o Black Weeks x-komu (tydzień 5) dał
5 kliknięć do x-komu przez ChatGPT, Allegro Black Weeks 1, prezentownik „święta dla dzieci" 1 —
pierwszy raz kliknięcie z prezentownika.

### Kamień 4 — 903, 17 dni bez odczytu

Prośba w „Kto co robi". Od tamtego odczytu sitemapa hubów urosła o 515 adresów (1 929 → 2 444).

---

## Harmonogram

**Data odczytu z konta: 23.11, 07:46 CET — dzisiejsza.** 22 Routines (18 serwisu — doszedł piątkowy
Smyk z decyzji 2 z 16.11 — i 4 inne). **Jedna kolizja: pon 09:30 — Kontroler i „Alerty cen"** (szósty
tydzień bez szkody).

Commity w 7 dniach (od 16.11 09:46): **Łowca 7** (+1 „do zrobienia" 17.11), **Radar 7, Kolejka
indeksacji 7, Weryfikacja ofert 7, Scout 5 nowości + 1 „do zrobienia"** (bez commita 22.11 —
niedziela, drugi raz w miesiącu bez śladu po SUCCEEDED), **Wycofania 1** (23.11, `1fedbe8`),
**Dane wt 1** (17.11, `cff338a` — po pustym 10.11 znów działa; Smyk w nim nie wszedł przez blokadę),
**Smyk pt 1** (20.11, `afcd8a3` — tylko wpis „do zrobienia", bramka 400 nie przeszła: 83 karty).
Skrzynka Piotra: teksty w 6 z 7 dni, 224 karty P07. Zrzuty Empiku i x-komu: piątek 20.11 08:54
(Marek), dzisiejszych nie ma do 09:33. Razem ok. 70 commitów.

Dwa puste przebiegi z poprzednich tygodni (Wycofania 09.11, Dane wt 10.11) nie powtórzyły się —
oba runnery zostawiły ślad; zamykam obie pozycje, przyczyna zostaje niewyjaśniona.

---

## Archiwum dziennika

23 wpisy przeniesione do `materialy/dziennik-archiwum-2026-11.md`; `DZIENNIK.md` 1 540 → 1 349 linii.
Jeden wpis CODE „w toku" z 04.09 nadal zatrzymany (dwunasty tydzień).

---

## Świeżość tekstów

`swiezosc-tekstow.mjs`: **125 tekstów** (tydzień temu 111), **0 sprzeczności w tekstach**, 1 do sprawdzenia
(77094 w `/zapowiedzi-lego-2027/`, jak co tydzień). **Przestarzałe — 6**, jedną linijką:
- `/artykuly/lego-star-wars-styczen-2027-przecieki/` (20.10) — 6 numerów potwierdzonych 13.11.
- `/artykuly/lego-ninjago-71888-ivos-ninja-dojo-oficjalnie-3495-elementow/` (06.11) — 71888 „zmieniony" 07.11.
- `/artykuly/trzy-upominki-na-lego-pl-od-9-do-15-listopada-batman-z-retro-gry-wideo/` (10.11) — 30762 potwierdzony 12.11.
- `/artykuly/weekend-lego-insiders-i-black-friday-2026-na-lego-pl-terminy-godzilla/` (10.11) — 40914, 40918 potwierdzone 17.11 (Scout 21.11 ma na to osobną pozycję dla Code).
- `/artykuly/lego-speed-champions-f1-2027-jedenascie-bolidow-z-dwoma-kierowcami/` (19.11) — 11 wpisów przecieków z tego samego dnia, późniejszych niż tekst; formalność.
- `/zapowiedzi-lego-2027/` (29.10) — od 07.11 bez Botanicals, Seasonal, Technic, Gabi, Ninjago; pozycja Radaru (ponowiona 21.11).

Daty premier (580 zestawów): **3 sprzeczności** — 11381 (czwarty tydzień) oraz nowe **80122 i 80123**
(dwie daty w jednym `opis`: 23.12.2026 i 1.01.2027 — wcześniejszy dostęp i premiera, pozycja Code).

---

## Zadania bez właściciela

**48 pozycji: Piotr 5, Marek 13, Code 29, Cowork 1** (+1 dla Scouta). Mail do Marka i Piotra, id `01a2078e`.
Tydzień temu 37. Pominięte **25 pozycji Radaru „zrobione w tym przebiegu"** bez linii zamknięcia (17 → 25).

### Piotr (tekst) — 5
- **Krótka forma: gratis 5011174 od 310 zł z pięciu serii dziecięcych, do 26.11** — tekst ma sens do wtorku. *(Radar 23.11)*
- **Krótka forma: kod INSIDERS10** — okno zamknęło się 22.11 23:59, pozycja po terminie. *(Radar 21.11)*
- **Godzilla 21375: „czego nie widać na karcie"** *(Scout 06.11)*; **Friends 2027** *(Scout 29.10)*; **„Czy warto zbierać GWP"** *(Radar 14.10, 40 dni)*.

### Marek (decyzja / panel / przeglądarka) — 13
- **Smyk w czasie blokady** *(Radar 17.11)* — decyzja 1; **kupon Allegro Black Weeks** *(Radar 19.11)* — decyzja 2; **43018 Messi 349 zł** *(Łowca 17.11)* — decyzja 3.
- **Prompt Radaru — konwencja zamknięć** *(Kontroler 16.11)*; **karty Piotra: błędne liczby elementów — poprawka w Code czy przez Piotra** *(Code 03.11)*.
- **Trzy decyzje redakcyjne przed BF:** Black Weeks ME *(03.11)*, kalendarze adwentowe *(05.11)*, prezentownik do 50 zł *(11.11)*.
- **Zbiorczy hub zapowiedzi 2027** *(Radar 06.11)*, **64 zestawy ≥25%** *(Radar 29.10 — zrobione w danych, bez linii)*, **cykl „do szafy"** *(Radar 19.10, 35 dni)*, **prompt Scouta — Education** *(Scout 24.10, 30 dni)*.

### Code (dane, strona, skrypt) — 29
- **Smyk w `feedy-lego.py`** — piątkowy krok ściął oferty 569 → 203 *(Łowca 13.11)*; **`smyk-odswiez.mjs` — blokada bota** *(Dane wt 17.11, część zrobiona przez Radar)*.
- **5011174 do `sety.json`** (upominek bez huba, okno do 26.11) *(Radar 23.11)*; **40918 „którego nazwy jeszcze nie znamy"** w tekście o Weekendzie Insiders — nazwę mamy od 17.11 *(Scout 21.11)*.
- **`/zapowiedzi-lego-2027/`** — Botanicals, Seasonal, City, Disney (26 nowych przecieków 18.11), Technic, Gabi, Ninjago *(Radar 07.11, 21.11; Scout 18.11)*; **42717, 77084, 77088, 30720** do rejestru *(Radar 11.11, 12 dni)*.
- **Przedsprzedaż ME w źródle Łowcy** (72306 za 549,99 zł niewidoczne) *(Radar 19.11)*; **gratis 43018 w ME od 2 000 zł** *(Radar 15.11)*; **40887 RRP 81,99 wobec rynku 299 zł** i **`kontrola-rrp.mjs` bez testu „rynek >> katalog"** *(Radar 16.11)*.
- **BrickLink: komunikat po 19:00 dziś** — termin wtorek 24.11 do potwierdzenia w tekście i `#bldp` *(Radar 22–23.11)*; **baner Designer Program** *(Radar 13.11)*.
- **Kontrola linków wewnętrznych** *(Scout 07.11)*; **Firecrawl `maxAge` → RUNBOOK** *(Scout 05.11)*; **diagnoza: rozjazd Ceneo** *(Kontroler 09.11)*; **11381** i **80122/80123** *(Kontroler)*; **11390 data w `opis`** *(Radar 02.11)*; **9 zestawów bez strony serii** *(Scout 02.11)*; **71835** *(Dane wt 20.10, 34 dni)*; pozostałe to notatki Radaru o regulaminach i oknach.

### Cowork (przeglądarka / panel) — 1 (+1 wspólna z Markiem)
- **11388 w koszyku lego.com** — okno 40889 minęło, 40898 skończyło się 20.11; pozycja do zamknięcia jako nieaktualna. *(Scout 01.11)*
- **Panel SalesMasters** — stawka x-komu i cookie *(Kontroler 19.10, 35 dni)*; x-kom ma 20 polskich kliknięć w 30 dni.

### Zamknięte od 16.11 (nie ma ich na liście)
34 zestawy do rejestru (16.11, `61d88ea`), piątkowy odczyt Smyka — zadanie założone (16.11),
Performers — bez maila (16.11), 40914 i 40918 w kalendarzu (23.11), tekst Piotra o Speed Champions 2027
(20.11), Dane wt — runner działa (17.11), 76321 — cena konkurencji błędna, Monkie Kid ×10 u Wycofań,
martwa karta Lidla 43270 — usunięta przez Łowcę (23.11). **Dziewięć pozycji w tydzień.**

---

## Ruch botów — fala opadła, filtr i reguła bez zmian

| Rodzaj | Kliknięć | Udział |
|---|---:|---:|
| bot (odrzucony przez filtr) | 4 509 | 98,7% |
| **„human" (przepuszczony do sieci)** | **59** | 1,3% |

Boty 12 742 → 4 509 (największy dzień 17.11 — 1 134); kraje **US 2 593 (57%)**, BR 266, NL 216;
sklepy Allegro 981, Ceneo 658 (adresy `/idz/ceneo/`, których na stronie nie ma od 06.11), Empik 643.
Z 59 kliknięć „human" **57 z Polski, 2 spoza** (Łotwa, Szwecja — oba z hubów, jedno z ChatGPT),
**0 ze strony głównej spoza PL** — reguła z 02.11 trzeci tydzień bez wyjątku. Z Polski ze strony głównej
7 pojedynczych kliknięć (Empik ×6, Allegro). Udział „brak-linku": 0 na 59 — dziesiąty tydzień.

---

## EPC per sklep

Kliknięcia: ruch ludzki z Polski. Prowizje: z API, Performers z podziałem na statusy. Allegro, Planeta
Klocków i x-kom — model (brak API).

| Sklep | Kliki PL 7 dni | Kliki PL 30 dni | Prowizja 30 dni | EPC 30 dni | Podstawa |
|---|---:|---:|---:|---:|---|
| Media Expert | 14 | 77 | 0 zatw. / **41,95 zł pending** (7 konw.) | 0 / 0,54 zł pending | Performers; 13,06 zł zatw. z września poza oknem |
| Empik | **19** | 53 | 1,28 EUR | **0,024 EUR** | TD: 1 transakcja (52,90 EUR), niezatwierdzona |
| Allegro | 6 | 47 | — | **model** | panel 06.11: 16,88 zł / 90 dni |
| x-kom | 7 | 20 | — | **model** | SalesMasters; stawka nieznana |
| Smyk | 4 | 18 | 0,00 zł | **0,00 zł** | Adtraction: 0; ceny z 12–13.11 |
| LEGO.com | 3 | 15 | — | **0 z definicji** | brak programu |
| Lidl | 0 | 5 | 0,00 EUR | — | TD, 1,84 EUR zatw. (wrzesień) |
| Media Markt | 4 | 5 | 0,00 EUR | — | TD ACCEPTED, 0 transakcji; 31382 ×4 w tym tygodniu |
| Ceneo | 0 | 3 | 0,46 EUR | — | program zakończony; cookies |
| Planeta Klocków | 0 | 3 | — | **model** | webePartners, brak API |
| **Razem** | **57** | **246** | **1,74 EUR + 41,95 zł pending** | **0,007 EUR/klik zatw.** | 3 sieci z API |

Empik drugi tydzień z rzędu przed Media Expertem w kliknięciach (19 wobec 14) — po zrzutach 16.11
i 20.11 Empik jest najtańszy w ponad 100 zestawach, ale w 30 dni dał jedną transakcję TD. Media Markt
pierwszy raz z 4 kliknięciami w tygodniu (31382) — feed rośnie, program TD aktywny, konwersji brak.

### Performers liczy — szósty tydzień

| Tydzień | Nasze kliknięcia PL do ME | Performers | Udział |
|---|---:|---:|---:|
| 13–19.10 | 29 | 18 | 62% |
| 20–26.10 | 18 | 12 | 67% |
| 27.10–02.11 | 25 | 16 | 64% |
| 03–09.11 | 20 | 16 | 80% |
| 10–16.11 | 14 | 13 | 93% |
| 17–23.11 | 14 | 11 | **79%** |

Po poprawce subID licznik trzyma się 79–93%; przy kilkunastu kliknięciach tygodniowo różnica 3 sztuk
to szum. Temat zamknięty decyzją z 16.11 — zostaje w tabeli jako pomiar.

---

## Widoczność w Google

| Okres | Kliknięcia | Wyświetlenia | CTR | Pozycja |
|---|---:|---:|---:|---:|
| 7 dni (14–21.11) | **4** | 253 | 1,58% | 19,2 |
| 14 dni (07–21.11) | 6 | 460 | 1,30% | 15,0 |
| Poprzednie 7 dni (z różnicy) | 2 | 207 | — | — |

Kliknięcia 2 → 4, wyświetlenia 207 → 253, **86 podstron z wyświetleniami** (68 tydzień temu), pozycja
średnia 11,1 → 19,2 — więcej stron widocznych daleko. Cztery kliknięcia: strona główna, premiera 11390
(pozycja 8,1), Creeper 21276, **`/wycofania/` — pierwsze kliknięcie od tygodni** przy 45 wyświetleniach
(pozycja 8,2; 82 w 14 dni). Huby zestawów na frazy z numerem: 21368 (15 wyświetleń, pozycja 5,7),
75448 (12, pozycja 5,8), 11506 (29 w 14 dni, pozycja 4,2). `/wycofania/` w sezonie EOL to nasza
najczęściej pokazywana strona — bez tekstu, który by ten ruch zagospodarował (cykl „do szafy" czeka od 19.10).

---

## Indeksacja

### Liczby z builda

| Miara | 09.11 | 16.11 | **23.11** | Zmiana t/t |
|---|---:|---:|---:|---:|
| Huby `/zestaw/` w buildzie | 9 954 | 9 980 | **10 003** | +23 |
| Huby w `sitemap-zestawy.xml` | 2 000 | 2 106 | **2 444** | **+338** |
| Udział zgłoszonych | 20,1% | 21,1% | **24,4%** | +3,3 pkt |
| **Zaindeksowane (panel GSC)** | 903 *(23.10)* | 903 | **903** | brak odczytu |

Największy tygodniowy przyrost sitemapy od 26.10: 224 karty P07 kanałem GitHub (50 + 124 + 50) plus
34 zestawy z rejestru. Build czysty, 10 246 stron w 38 s.

### Inspekcja adresów przez API Search Console

| Adres | Werdykt | coverageState | Crawl | Wiek |
|---|---|---|---|---:|
| `/` | PASS | Submitted and indexed | 18.11 | 5 dni |
| `/artykuly/` | PASS | Submitted and indexed | 20.11 | 3 dni |
| `/artykuly/lego-71866-…-recenzja/` (opubl. dziś 07:54) | NEUTRAL | URL is unknown to Google | — | 1 godz. |
| `/serie/` | PASS | Submitted and indexed | 14.11 | 9 dni |
| `/wycofania/` | PASS | Submitted and indexed | 21.11 | 2 dni |
| `/ekskluzywne/` | PASS | Submitted and indexed | 19.11 | 4 dni |
| `/promocje-lego/` | PASS | Submitted and indexed | 21.11 | 2 dni |
| `/aktualnosci/` | PASS | Submitted and indexed | 19.11 | 4 dni |
| `/serie/marvel/` | **PASS** | **Submitted and indexed** | 01.11 | 22 dni |
| `/zestaw/10280/` | PASS | Submitted and indexed | **22.11** | 1 dzień |
| `/zestaw/11208/` | PASS | Submitted and indexed | 04.11 | 19 dni |
| `/zestaw/80056/` (dopisany 16.11) | NEUTRAL | Discovered – currently not indexed | — | w kolejce |

**`/zestaw/10280/` odwiedzony 22.11 po 72 dniach** — bez naszego zgłoszenia (hub zindeksowany nie
wchodził do kolejki). **`/serie/marvel/` wrócił do indeksu** (16.11 „zeskanowana, niezindeksowana",
dziś PASS przy tym samym crawlu z 01.11) — Google przeklasyfikował w obie strony w dwa tygodnie,
nie ruszając strony. Wszystkie działy mają crawl z ostatnich 9 dni. Recenzja 71866 opublikowana
godzinę przed inspekcją — za wcześnie na wniosek.

Dzisiejsza kolejka: 15 adresów (5 powtórek z 22.11, 3 nowe teksty Piotra jako „nieznane", 7 hubów
Technic/Friends); stan 43 sprawdzonych: 22 zindeksowane, 11 wykrytych, 7 nieznanych, 3 zeskanowane.

---

## Kontrola linków sklepowych

Wykonana przez Łowcę o 08:48 PL (`materialy/kontrola-linkow-2026-11-23.md`). Próba 150 linków,
**19 581 w całości (+117)**, martwych: **1** — Lidl 43270 (Kajakowa przygoda Vaiany, 404), **usunięty
przez Łowcę w tym samym przebiegu** (`33a22ab`) zgodnie z regułą z 03.11 (`redirects.lidl` trzecim
wyjątkiem od append-only). Nic dla ludzi.

| Sklep | w próbie | żywe | martwe | blokada sklepu | nierozstrzygnięte |
|---|---:|---:|---:|---:|---:|
| planetaklockow | 59 | 59 | 0 | 0 | 0 |
| ceneo | 35 | 35 | 0 | 0 | 0 |
| smyk | 22 | 22 | 0 | 0 | 0 |
| mediamarkt | 6 | 6 | 0 | 0 | 0 |
| lidl | 3 | 2 | **1** | 0 | 0 |
| allegro | 5 | 0 | 0 | 2 | 3 |
| lego / empik / mediaexpert / xkom | 5 każdy | 0 | 0 | 5 każdy | 0 |

Smyk: 22 karty żywe z serwera — kontrola linków sprawdza kod HTTP, a Smyk odpowiada 200 ze stroną
blokady, więc „żywy" znaczy tu tylko „nie 404"; cen z tych kart nie odczytamy (decyzja 1). O 25 linkach
(16,7%) nie wolno powiedzieć „OK". **Kontrola w przeglądarce 20.11: bez zapisanego wyniku** — pozycja wyżej.

**Zadanie dla `empik-redirects.mjs --usun-martwe`: brak** (zrzut 20.11 sam zdjął 39 martwych).

---

## TOP artykuły

**Po kliknięciach afiliacyjnych** (polski ruch do sklepu): `/artykuly/x-kom-black-weeks-2026-lego-tydzien-5/`
— **5** (wszystkie z ChatGPT), `/artykuly/allegro-black-weeks-2026-lego/` — 1, `/prezentowniki/swieta-dla-dzieci/`
— 1 (pierwsze kliknięcie z prezentownika w pomiarze). Huby: 31382 (4, Media Markt), 11508 (3), 31165 (3).

**Po Google:** strona główna, premiera 11390 (pozycja 8,1), Creeper 21276, `/wycofania/` — po jednym.

W tym tygodniu weszło **dwanaście tekstów Piotra** (recenzje 77248, 76463, 75441, 71866; Weekend Insiders
w trzech ujęciach; Smart Play kontra Super Mario; 30. seria minifigurek i City 2027 nieoficjalnie; Speed
Champions F1 2027; historia kalendarzy adwentowych; BrickLink znów niedostępny) i **jeden deal Łowcy**
(Black Weeks Media Expert, 8 minimów, 23.11). Wzorzec bez zmian szósty tydzień: kliknięcia afiliacyjne
dają teksty o kodach i Black Weeks oraz huby przez ChatGPT; recenzje i premiery zbierają wyświetlenia
w Google. Nowe: `/wycofania/` zaczyna klikać (1 na 45 wyświetleń).

---

## Trzy decyzje na ten tydzień

### 1. Smyk przez Firecrawl na czas blokady *(Marek)*
Od 17.11 skrypt dostaje stronę blokady; piątkowy odczyt 20.11: 83 karty z ceną na 704. Ceny Smyka
w hubach mają 10–11 dni, Black Friday za cztery dni. **Zrobić:** zgoda na odczyt przez Firecrawl raz
w tygodniu, do końca blokady albo do 31.12 (pula 5 000 odnawia się dziś; koszt 570–2 850 kredytów na przebieg,
zmierzyć na 10 kartach przed pełnym odczytem); Code dopisze
`--firecrawl` do `smyk-odswiez.mjs`. **Kto:** Marek.

### 2. Kupon Allegro Black Weeks *(Marek)*
Konkurencja podaje ceny niższe od naszego feedu o 13–15% na dwóch zestawach. Jeśli to kupon koszykowy,
nasze tabele Allegro będą przez cały tydzień BF za wysokie. **Zrobić:** jedna oferta (10316) w koszyku
Allegro; Code dopisze zastrzeżenie przy Allegro na 24–30.11, jeśli się potwierdzi. **Kto:** Marek.

### 3. 43018 Messi za 349 zł — potwierdzić albo odrzucić *(Marek)*
Pierwsza oferta regularnego sklepu poniżej 50% RRP na tym zestawie, od 17.11 ukryta sitem. **Zrobić:**
decyzja w `deale_potwierdzone.json` (link z maila Łowcy 17.11); po potwierdzeniu post dealowy przed BF.
**Kto:** Marek.

---

## Czego w tym raporcie nie ma

- **Ręcznego odczytu paneli Allegro, Planety Klocków i SalesMasters** — decyzja 22.09.
- **Mnożnika do 20 000 zł** — cel na 2027.
- **Nowego odczytu liczby zaindeksowanych** — 903 z 06.11, prośba w „Kto co robi".
- **Cen Smyka z tego tygodnia** — blokada bota od 17.11; decyzja 1.
- **Wyniku kontroli w przeglądarce z 20.11** — Routine odpalił, wyniku w repo nie ma.
- **Dzisiejszych cen Empiku i x-komu** — zrzuty z piątku 20.11; dzisiejszych nie ma do 09:33.
- **Odpowiedzi, co stało się 10.11 (Dane wt) i 09.11 (Wycofania)** — oba runnery działają od tamtej pory; nie drążę.
