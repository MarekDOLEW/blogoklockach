# Raport Kontrolera — 16.11.2026 (poniedziałek)

> **Jedna rzecz z tego tygodnia jest ważniejsza od reszty: Performers zatwierdził trzy konwersje
> Media Expertu z września** (03.09 — 481 zł, 07.09 — 444 zł, 14.09 — 83 zł; razem 1 008 zł sprzedaży,
> **13,06 zł prowizji**). Konwersja z 14.09 była 09.11 jeszcze „pending", więc zatwierdzenie przyszło
> w tym tygodniu, po ok. 60 dniach. **Kamień 1 stoi na dwóch sieciach z trzech, kamień 2 na dwóch
> sklepach.** Dziesięć konwersji z października i listopada (267 zł) nadal czeka — i wygląda na to,
> że po prostu czeka swoje dwa miesiące. Mail do Performers z pytaniem o termin stracił sens; decyzja 3.

> Na minusie: **Dane wt (wt 10.11, 05:35, SUCCEEDED) nie zostawiły commita ani wpisu** — drugi runner
> w dwa tygodnie z pustym przebiegiem po Wycofaniach 09.11 (te 16.11 już działały). `/serie/marvel/`
> wypadł z indeksu (09.11 zindeksowany, dziś „zeskanowana, niezindeksowana"). ChatGPT dał **73%**
> polskich kliknięć do sklepów, Google 3 kliknięcia przy 248 wyświetleniach.

---

## Kto co robi

**Decyzja 1: 107 zestawów ma w `katalog.json` status `dostepny` i aktualne oferty w feedzie, a nie ma ich w rejestrze — pozycja Scouta z 30.10 czeka 17 dni, do Black Friday zostało 11.**
**Mamy?** — częściowo: huby pokazują ceny z feedu, ale bez `sety.json` nie ma śledzonego minimum, alertu ani wejścia do „Dziś w dobrej cenie"; 85 z 107 to zwykłe zestawy roczników 2012–2025, reszta bez ceny katalogowej.
**Zrobić:** — zgoda na dopisanie 85 zwykłych (lista w pozycji Scouta 30.10) do `sety.json` + `ceny_baza.json` do 20.11, tą samą drogą co 48 zestawów z wycofaniem 09.11; 22 bez RRP zostają poza rejestrem.
**Kto:** — Marek (decyzja)

**Decyzja 2: Smyk zrobił w środę 11.11 akcję progową i obniżki (42240 719 → 675 zł), a nasze ceny Smyka były z wtorku — po ręcznym odświeżeniu 12.11 Smyk okazał się najtańszy w 8 zestawach, czego dwa dni nie było widać.**
**Mamy?** — tak: `scripts/smyk-odswiez.mjs` działa z sesji za 0 kredytów (569 kart, 0 błędów); brakuje tylko drugiego terminu w tygodniu.
**Zrobić:** — zgoda na drugi odczyt Smyka w piątek (krok w prompcie „Dane wt" z drugim cronem albo osobne zadanie 05:30 pt na tej samej sesji) do końca grudnia; Code przygotuje.
**Kto:** — Marek (decyzja)

**Decyzja 3: Performers zatwierdza po ok. 60 dniach — trzy wrześniowe konwersje przeszły na „approved" w tygodniu 09–16.11, październikowe (najstarsza 03.10) nadal „pending".**
**Mamy?** — tak: `prowizje-raport.mjs --dni 90` pokazuje `approved: 3` (13,06 zł) i `pending: 10` (267,47 zł); 09.11 ta sama konwersja z 14.09 była „pending".
**Zrobić:** — odwołać mail z pytaniem o termin zatwierdzania (decyzja 2 z 09.11): odpowiedź mamy z danych. Przypomnienie 23.11 zostaje jako kontrola; mail dopiero, gdyby konwersja z 03.10 (1 103 zł → 22 zł) nie przeszła do ~10.12.
**Kto:** — Marek (decyzja)

**Dane wt (wt 05:30, `trig_011BMbbJSYKiauzGNXUk576y`) mają w harmonogramie `10.11 05:35 SUCCEEDED`, ale w repo nie ma commita „LEGO.pl + Ceneo + Smyk … 10.11" (03.11 był) ani wpisu w dzienniku — drugi runner w dwa tygodnie z pustym SUCCEEDED (Wycofania 09.11).**
**Mamy?** — nie: ceny LEGO.pl i Smyka z wtorku nie weszły (Smyk uratował ręczny odczyt Radaru 12.11), katalog LEGO.pl ma ostatnią aktualizację z 03.11.
**Zrobić:** — otworzyć sesję Dane wt na koncie i sprawdzić, co zrobiła 10.11 — przy drugim takim przypadku szukamy wspólnej przyczyny (klasyfikator „Code from External" jak Zdjęcia → R2 04.11?); jeśli odmowa, prompt wymaga tej samej poprawki co Zdjęcia.
**Kto:** — Marek (panel)

**Radar zostawia pozycje „Do zrobienia" z `Zrobić: zrobione w tym przebiegu` bez linii „→ zamknięte" — 17 takich pozycji zalega w dzienniku, parser Kontrolera liczy je jako otwarte, a lista dla Code urosła do 20.**
**Mamy?** — częściowo: Kontroler od dziś pomija pozycje z `Zrobić` zaczynającym się od „zrobione", ale archiwum dziennika trzyma te wpisy w `DZIENNIK.md` bez końca.
**Zrobić:** — w prompcie Radaru (panel zadania) dopisać regułę: gdy coś zrobiono w tym samym przebiegu, pod pozycją ma stanąć linia „→ zamknięte <data>: zrobione w przebiegu" — ta sama konwencja, którą czytają archiwum i Kontroler.
**Kto:** — Marek (panel)

**11381 Jaguar E-Type: karta „1 lipca 2026", recenzja i `sety.json` „1 sierpnia" — trzeci tydzień tej samej sprzeczności w `swiezosc-tekstow.mjs`.**
**Zrobić:** — potwierdzić datę na karcie lego.com i poprawić kartę w `karty_setow.json`; pozycja z 02.11.
**Kto:** — Code (dane)

**`/serie/marvel/` wypadł z indeksu: 09.11 „zindeksowany" (crawl 01.11), dziś „zeskanowana, obecnie niezindeksowana" przy tym samym crawlu.**
**Zrobić:** — nic dla ludzi: kolejka indeksacji łapie ten stan i zgłosi stronę sama; Kontroler sprawdzi za tydzień, czy Google wrócił.
**Kto:** — Kontroler (następny przebieg)

Trzy decyzje redakcyjne przed Black Friday czekają w dzienniku na Marka od 5–13 dni: tekst zbiorczy
o Black Weeks Media Expertu (Radar 03.11), hasło „kalendarze adwentowe LEGO najtaniej" (05.11),
prezentownik „do 50 zł" (11.11) — są w mailu „Zadania bez właściciela" (id `01a1e384`), nie powtarzam
ich tu jako osobnych decyzji, ale po 27.11 dwie z trzech stracą sens.

---

## Diagnoza środowiska — 2026-11-16 08:33 UTC

**Repo**
- gałąź `kontroler` @ `f4f8463`, origin/main @ `f4f8463` — 0 commitów ponad main, 0 do nadrobienia, 3 pliki niezacommitowane (archiwum dziennika)
- node_modules ✓, astro ✓

**Zmienne środowiska**
- ustawione: 14/14 — komplet

**Dane**
- oferty_feed zaktualizowane: 2026-11-16
- rejestr afiliacji zaktualizowany: 2026-11-06
- import Empiku: **2026-11-16** (zrzut 09:24 PL, `8d59719`: 4 575 cen Empik, 674 x-kom) — przed Kontrolerem, jak miało być; poprzedni 13.11
- oferty: allegro 6 273, empik 4 575, ceneo 1 808, planetaklockow 1 074, lego 1 005, xkom 674, mediaexpert 654, smyk 572, mediamarkt 161, lidl 118
- rejestr Scouta (known_sets.json): 1 361/1 361 ✓ (tydzień temu 1 353 — siedem Star Wars 2027 i 10335)

**Dostępy** *(realne wywołania, nie deklaracje)*
- cloudflare: **ok** (kliknięć 7 dni: **12 799** — druga fala botów, patrz „Ruch botów") · r2: **ok**
- tradedoubler: **ok — ROZJAZD Z REJESTREM** (Ceneo: TD ACCEPTED, rejestr `zakonczony`) — rozjazd pozorny, pozycja Code z 09.11 bez ruchu
- search_console: **ok** · adtraction: **ok** · performers: **ok**
- produkcja: **ok** (200) · link sklepu z przeglądarki: **ok** (302) · firecrawl: **ok** (2 191 kredytów — tydzień temu 2 794, zużycie 603; odnowienie puli 23.11)

Ceneo nadal ma 1 808 ofert w feedzie, choć od 06.11 nie ma go na stronie — dane zostają, link nie
powstaje. Media Expert 672 → 654, Smyk 602 → 572 (po odświeżeniu 12.11 zdjęte wyprzedane).

---

## Cztery kamienie milowe na grudzień 2026

| Kamień | Tydzień temu (09.11) | **Dziś (16.11)** | Kierunek |
|---|---|---|---|
| **1. Zatwierdzona prowizja w każdej z 3 sieci z API** | 1 z 3 — TD | **2 z 3 — TD (6 zatwierdzonych, 90 dni) i Performers (3 zatwierdzone, 13,06 zł); Adtraction 0** | **w górę — pierwszy ruch od września** |
| **2. EPC per sklep na próbie > 1 transakcji (próg 10 EUR)** | 1 sklep (Empik) + 1 oczekujący | **2 sklepy: Empik (4 tr., 374 EUR) i Media Expert (3 zatwierdzone, 1 008 zł)** | w górę |
| **3. Kliknięcia z Polski dziennie** | 6,9 (7 dni) / 7,5 (28 dni) | **7,4** (7 dni) / 7,1 (14 dni) / 7,5 (28 dni) | płasko |
| **4. Zaindeksowane strony (panel GSC)** | 903 *(odczyt 06.11, dane z 23.10)* | **903** *(ten sam odczyt, 10 dni)* | brak nowego odczytu |

### Kamień 1 — Performers zatwierdza, po dwóch miesiącach

| Konwersja | Sprzedaż | Prowizja | Status 09.11 | **Status 16.11** |
|---|---:|---:|---|---|
| 03.09 | 481,10 zł | 9,62 zł | poza oknem 60 dni | **approved** |
| 07.09 | 444,00 zł | 1,78 zł | poza oknem 60 dni | **approved** |
| 14.09 | 82,99 zł | 1,66 zł | pending | **approved** |
| 03.10 → 14.11 (10 konwersji) | 14 939,79 zł | 267,47 zł | pending | pending |

Trzy wrześniowe konwersje mają subID `tylkoklocki`, dziewięć z dziesięciu oczekujących — makro
`Partner_ID` (sprzed poprawki z 06.11). Czy to kolejność dat, czy subID decyduje o zatwierdzeniu —
rozstrzygnie konwersja z 03.10 (1 103 zł → 22,07 zł, `Partner_ID`) około 03–10.12. Do tego czasu
pytanie do Performers nic nie da; decyzja 3.

Tradedoubler bez zmian: 90 dni — 17 transakcji, 11,08 EUR, zatwierdzone 6 (Empik 3, Ceneo 2, Lidl 1);
w 7 dniach jedna mikro-transakcja Ceneo (0,07 EUR, cookie sprzed zamknięcia programu). **Adtraction 0**
w całej historii — jedyna sieć bez ruchu; Smyk ma 15 polskich kliknięć w 30 dni.

### Kamień 2 — dwa sklepy

Empik: 4 transakcje, 374 EUR, 2,25% (bez zmian). **Media Expert: 3 zatwierdzone transakcje, 1 008 zł,
13,06 zł, stawka efektywna 1,3%** — próg 10 EUR obrotu spełniony dziesięciokrotnie. EPC na zatwierdzonych
nie liczę uczciwie, bo wrześniowe kliknięcia do ME sprzed filtra botów (14.09) są nieporównywalne z dzisiejszymi;
od grudnia, gdy zatwierdzą się październikowe, będzie z czego liczyć.

### Kamień 3 — 7,4 dziennie, trzeci tydzień w paśmie 7–8

| Okno | Kliknięć z Polski | Średnio dziennie |
|---|---:|---:|
| 7 dni | 52 | **7,4** |
| 14 dni | 100 | 7,1 |
| 28 dni | 209 | 7,5 |

Poprzedni tydzień 48 → 52. Dni: 4, 3, 10, 8, 4, **19** (niedziela 15.11), +3 z końcówki 09.11 i 1 dziś.
Niedziela zrobiła 37% tygodnia: 40812 (Lidl, przez ChatGPT, 5 kliknięć) i 10374 (Empik, ChatGPT, 4).
Okno 28 dni stoi na 7,5 trzeci tydzień — to jest poziom serwisu.

Skąd: **huby 44, strona główna 4, `/promocje-lego/` 2, artykuły 2.** **ChatGPT: 38 z 52 (73%)** —
tydzień temu 29 z 48 (60%), dwa tygodnie temu 24%. Google w tym samym oknie: 3 kliknięcia na stronę.
Trzy czwarte ruchu do sklepów przychodzi z asystenta, który czyta nasze huby i strony serii;
Google pokazuje nas coraz wyżej (pozycja 11), ale jeszcze nie klika.

### Kamień 4 — 903, odczyt sprzed 10 dni

Odczyt 06.11 (dane GSC z 23.10). Dwa tygodnie miną 20.11 — prośba o odczyt w przyszłym raporcie,
jeśli nikt nie zajrzy wcześniej. Sitemapa hubów od tamtego odczytu: 1 929 → 2 106.

---

## Harmonogram

**Data odczytu z konta: 16.11, 07:49 CET — dzisiejsza.** 21 Routines (17 serwisu, 4 inne, w tym moje
jednorazowe przypomnienie na 23.11). **Jedna kolizja: pon 09:30 — Kontroler i „Alerty cen"** (bez szkody,
piąty tydzień).

Commity w 7 dniach (od 09.11 09:46): **Łowca 7** (+1 „do zrobienia" 13.11), **Scout 7** (+1 „do zrobienia"),
**Radar 7, Kolejka indeksacji 7, Weryfikacja ofert 7, Wycofania 1 (pon 16.11, `9ce082f` — tydzień temu
pusty przebieg, dziś z Monkie Kid ×10), Dane wt 0 — alarm wyżej.** Skrzynka tekstów Piotra: teksty
w 4 z 7 dni. Zrzuty Empiku i x-komu: czwartek 13.11 i dziś 09:24 (Marek). Razem ok. 50 commitów —
połowa zeszłego tygodnia, który miał audyt i panel.

**Wzorzec do zapamiętania:** dwa pon./wt. z rzędu po jednym runnerze z `SUCCEEDED` bez śladu (Wycofania
09.11, Dane wt 10.11). `SUCCEEDED` w tabeli to dostarczenie promptu; co sesja z nim zrobiła, widać tylko
w repo. Za tydzień sprawdzę trzeci raz, a Marek — sesję Dane wt.

---

## Archiwum dziennika

17 wpisów przeniesionych (13 do `materialy/dziennik-archiwum-2026-10.md`, 4 do nowego
`materialy/dziennik-archiwum-2026-11.md`); `DZIENNIK.md` 1 518 → 1 273 linii. Dwa wpisy CODE
„w toku" z września nadal zatrzymane (jedenasty tydzień).

---

## Świeżość tekstów

`swiezosc-tekstow.mjs`: **111 tekstów** (tydzień temu 100), **0 sprzeczności**, 1 do sprawdzenia
(77094 w `/zapowiedzi-lego-2027/`, jak co tydzień). **Przestarzałe — 3:**
- `/artykuly/lego-star-wars-styczen-2027-przecieki/` (20.10) — sześć numerów (75466, 75470, 75478, 75480, 75482, 75495) rozstrzygniętych 13.11 jako potwierdzone; Piotr napisał 14.11 nowy tekst o tej fali, stary czeka na dopisek.
- `/artykuly/lego-ninjago-71888-ivos-ninja-dojo-oficjalnie-3495-elementow/` (06.11) — 71888 „zmieniony" 07.11.
- `/artykuly/trzy-upominki-na-lego-pl-od-9-do-15-listopada-batman-z-retro-gry-wideo/` (10.11) — 30762 potwierdzony 12.11.

Daty premier (550 zestawów): **11381** trzeci tydzień — pozycja Code z 02.11 bez ruchu.

---

## Zadania bez właściciela

**37 pozycji: Piotr 3, Marek 13, Code 20, Cowork 1** (+1 dla Scouta). Mail do Marka i Piotra, id `01a1e384`.
Tydzień temu 27. Do tego **17 pozycji Radaru z „Zrobić: zrobione w tym przebiegu"** — zrobione, ale bez
linii zamknięcia; od dziś parser je pomija, a konwencja do poprawienia w prompcie Radaru (wyżej).

### Piotr (tekst) — 3
- **Godzilla 21375: „czego nie widać na karcie"** *(Scout 06.11)*; **Styczniowa fala Friends 2027** *(Scout 29.10)*; **„Czy warto zbierać gratisy GWP"** *(Radar 14.10, 33 dni)*.

### Marek (decyzja / panel) — 13
- **107 zestawów bez rejestru** *(Scout 30.10)* — decyzja 1.
- **Drugi odczyt Smyka w tygodniu** *(Radar 12.11)* — decyzja 2.
- **Performers — termin** *(Kontroler 09.11)* — decyzja 3 odwraca: mail zbędny.
- **Dane wt 10.11 bez śladu** *(Kontroler 16.11)* i **konwencja zamknięć Radaru** *(Kontroler 16.11)*.
- **Trzy decyzje redakcyjne przed BF:** Black Weeks ME *(03.11)*, kalendarze adwentowe *(05.11)*, prezentownik do 50 zł *(11.11)*.
- **76321 za 206 zł w Empiku** — dzisiejszy zrzut dał 227,73 zł, czyli ich cena była błędna; pozycja do zamknięcia. *(Radar 16.11)*
- **Zbiorczy hub zapowiedzi 2027** *(Radar 06.11)*, **64 zestawy ≥25%** *(Radar 29.10, zrobione w danych, bez linii)*, **cykl „do szafy"** *(Radar 19.10, 28 dni)*.
- **Prompt Scouta — Education** *(Scout 24.10, 23 dni)*; **panel SalesMasters** *(Kontroler 19.10, 28 dni)*; **karty Piotra: błędne liczby elementów — poprawka w Code czy przez Piotra** *(Code 03.11)*.

### Code (dane, strona, skrypt) — 20
- **Smyk w `feedy-lego.py`:** piątkowy krok ściął oferty 569 → 203, Łowca przywrócił z origin — parser czy realne cięcie? *(Łowca 13.11)*
- **40887 Ditto: RRP 81,99 zł wobec rynku 299 zł** — ustalić RRP u źródła; **`kontrola-rrp.mjs` bez testu „rynek >> katalog"**. *(Radar 16.11)*
- **42717, 77084, 77088, 30720** do rejestru *(Radar 11.11, 9. dzień)*; **`/zapowiedzi-lego-2027/`** bez Botanicals, Seasonal, Technic, Gabi, Ninjago *(Radar 07.11)*.
- **Gratis 43018 Messi w ME od 2 000 zł** — potwierdzić i dopisać *(Radar 15.11)*; **BrickLink: baner o powrocie Designer Program** *(Radar 13.11)*; **30762** — zamknięte okno, pozycja do wykreślenia *(Radar 09–10.11)*.
- **Kontrola linków wewnętrznych** `/zestaw/<nr>/` z artykułów *(Scout 07.11)*; **Firecrawl `maxAge` → RUNBOOK** *(Scout 05.11)*; **diagnoza: rozjazd Ceneo** *(Kontroler 09.11)*; **11381** *(Kontroler 02.11)*.
- **11390 data w `opis`** *(Radar 02.11)*; **9 zestawów bez strony serii** *(Scout 02.11)*; **zdanie o transmisji 3.11** — po fakcie, do wykreślenia *(Scout 30.10)*; **71835** *(Dane wt 20.10, 27 dni)*.
- Reguły „kafel vs regulamin" i podobne zapisy Radaru — dziś traktuję jako notatki, nie zadania.

### Cowork (przeglądarka) — 1
- **11388 w koszyku lego.com** — czy 40898 i 40889 się sumowały; okno 40889 minęło 08.11, 40898 trwa do 20.11. *(Scout 01.11)*

### Zamknięte od 09.11 (nie ma ich na liście)
48 zestawów z wycofaniem do rejestru (09.11, `5907a36`), tekst Piotra o fali Star Wars 2027 (14.11),
pula kodów gratisowych — decyzja „nie" (16.11, ustalenie trwałe), zrzuty Empiku i x-komu (13.11, 16.11),
Wycofania — runner działa (16.11), D5–D9 — domyślne obowiązują od 11.11, Monkie Kid ×10 u Wycofań,
76321 — cena konkurencji błędna. **Osiem pozycji w tydzień** plus 17 „zrobione" Radaru.

---

## Ruch botów — druga fala, filtr trzyma, reguła z 02.11 trzyma

| Rodzaj | Kliknięć | Udział |
|---|---:|---:|
| bot (odrzucony przez filtr) | 12 742 | 99,6% |
| **„human" (przepuszczony do sieci)** | **56** | 0,4% |
| test (nasza diagnoza) | 1 | 0,0% |

Fale: **14.11 — 5 028**, 09.11 — 2 505, 15.11 — 2 049; kraje BR 2 801, US 1 140, AR 1 053, BD 845;
sklepy Allegro 3 763, Empik 1 957, **Ceneo 1 761** (boty biją w adresy `/idz/ceneo/`, których na stronie
nie ma od 06.11 — chodzą po starych listach, nie po serwisie), LEGO 1 663.

Z 56 kliknięć „human" **52 z Polski, 4 spoza** — Węgry, Ukraina, Litwa, Niemcy, wszystkie z hubów
(trzy z ChatGPT), **0 ze strony głównej**. Reguła „strona główna + kraj spoza PL = bot" drugi tydzień
bez wyjątku: przed nią 17 → 43 kliknięć sondy, po niej 0 → 0. Z Polski ze strony głównej: 4 pojedyncze
(Empik ×3, Planeta Klocków). Udział „brak-linku": 0 na 56 — dziewiąty tydzień.

---

## EPC per sklep

Kliknięcia: ruch ludzki z Polski. Prowizje: z API, Performers z podziałem na statusy. Allegro, Planeta
Klocków i x-kom — model (brak API).

| Sklep | Kliki PL 7 dni | Kliki PL 30 dni | Prowizja 30 dni | EPC 30 dni | Podstawa |
|---|---:|---:|---:|---:|---|
| Media Expert | 14 | 82 | 0 zatw. / **40,31 zł pending** (5 konw.) | 0 / 0,49 zł pending | Performers; **13,06 zł zatwierdzone z września (poza oknem)** |
| Allegro | 8 | 44 | — | **model** | panel 06.11: 16,88 zł / 90 dni |
| Empik | 17 | 34 | 1,28 EUR | **0,038 EUR** | TD: 1 transakcja (52,90 EUR), niezatwierdzona |
| Smyk | 3 | 15 | 0,00 zł | **0,00 zł** | Adtraction: 0 |
| x-kom | 0 | 15 | — | **model** | SalesMasters; stawka nieznana |
| LEGO.com | 4 | 14 | — | **0 z definicji** | brak programu |
| Ceneo | 0 | 7 | 0,60 EUR | — | program zakończony 03.11; cookies |
| Lidl | 3 | 7 | 0,00 EUR | — | 1,84 EUR zatwierdzone (wrzesień) |
| Planeta Klocków | 3 | 3 | — | **model** | webePartners, brak API |
| Media Markt | 0 | 1 | 0,00 EUR | — | TD ACCEPTED, 0 transakcji |
| **Razem** | **52** | **222** | **1,88 EUR + 40,31 zł pending** | **0,0085 EUR/klik zatw.** | 3 sieci z API |

Empik w tym tygodniu pierwszy raz przed Media Expertem (17 wobec 14) — po zrzucie z 13.11 Empik jest
najtańszy w 103 zestawach (Radar 16.11). Okno 90 dni: TD 11,08 EUR + Performers **13,06 zł zatwierdzone**
+ 267,47 zł pending — ok. 60 zł zatwierdzonych i ok. 270 zł oczekujących, tak jak szacował audyt 06.11.

### Performers liczy — piąty tydzień

| Tydzień | Nasze kliknięcia PL do ME | Performers | Udział |
|---|---:|---:|---:|
| 13–19.10 | 29 | 18 | 62% |
| 20–26.10 | 18 | 12 | 67% |
| 27.10–02.11 | 25 | 16 | 64% |
| 03–09.11 | 20 | 16 | 80% |
| 10–16.11 | 14 | 13 | **93%** |

Dwa tygodnie po poprawce subID i zamknięciu dziury ze strony głównej Performers liczy 80–93%
naszych kliknięć. Pytanie o „brakującą 1/3" straciło podstawę razem z pytaniem o termin — decyzja 3.

---

## Widoczność w Google

| Okres | Kliknięcia | Wyświetlenia | CTR | Pozycja |
|---|---:|---:|---:|---:|
| 7 dni (07–14.11) | **3** | 248 | 1,21% | **11,1** |
| 14 dni (31.10–14.11) | 4 | 401 | 1,00% | 13,8 |
| Poprzednie 7 dni (z różnicy) | 1 | 153 | — | — |

Kliknięcia 1 → 3, wyświetlenia 153 → 248 (+62%), pozycja średnia **18,0 → 11,1** — najlepsza od początku
pomiaru, 68 podstron z wyświetleniami (71 tydzień temu). Trzy kliknięcia: premiera 11390 Dragon Ball
(pozycja 3,5), Creeper 21276 (pozycja 2,0), `/promocje-lego/`.

Co widać: **`/wycofania/` 44 wyświetlenia, pozycja 7,4** (dwa razy więcej niż tydzień temu — sezon
EOL przed świętami); **hub `/zestaw/11506/` 30 wyświetleń, pozycja 4,1** (fraza „lego 11506", Botanicals 2027);
hub 75448 — 20, pozycja 6,8; tekst o Botanicals 2027 — 15, pozycja 3,3 („lego piwonie" 2,9);
`/serie/star-wars/` — 11, pozycja 5,2; `/przecieki/` — 8, pozycja 4,8. Huby zestawów 2027 zbierają
wyświetlenia na frazy z numerem, zanim zestaw jest w sprzedaży — to jest nowy wzorzec tego tygodnia.

---

## Indeksacja

### Liczby z builda

| Miara | 02.11 | 09.11 | **16.11** | Zmiana t/t |
|---|---:|---:|---:|---:|
| Huby `/zestaw/` w buildzie | 9 936 | 9 954 | **9 980** | +26 |
| Huby w `sitemap-zestawy.xml` | 1 929 | 2 000 | **2 106** | +106 |
| Udział zgłoszonych | 19,4% | 20,1% | **21,1%** | +1,0 pkt |
| **Zaindeksowane (panel GSC)** | 837 | 903 *(23.10)* | **903** | brak odczytu |

117 kart P07 w tygodniu (25 + 92), 48 zestawów z wycofaniem z 09.11 — ich huby w większości już
były w sitemapie (karty Piotra). Build czysty, 10 208 stron w 40 s.

### Inspekcja adresów przez API Search Console

| Adres | Werdykt | coverageState | Crawl | Wiek |
|---|---|---|---|---:|
| `/` | PASS | Submitted and indexed | 09.11 | 7 dni |
| `/artykuly/` | PASS | Submitted and indexed | 06.11 | 10 dni |
| `/artykuly/lego-31169-maszyna-do-pisania-…-recenzja/` (14.11) | NEUTRAL | Discovered – not indexed | — | w kolejce |
| `/serie/` | PASS | Submitted and indexed | **14.11** | 2 dni |
| `/wycofania/` | PASS | Submitted and indexed | 05.11 | 11 dni |
| `/ekskluzywne/` | PASS | Submitted and indexed | 09.11 | 7 dni |
| `/promocje-lego/` | PASS | Submitted and indexed | 08.11 | 8 dni |
| `/aktualnosci/` | PASS | Submitted and indexed | 09.11 | 7 dni |
| `/serie/marvel/` | **NEUTRAL** | **Crawled – currently not indexed** | 01.11 | 15 dni |
| `/zestaw/11208/` | PASS | Submitted and indexed | 04.11 | 12 dni |
| `/zestaw/10280/` | PASS | Submitted and indexed | 11.09 | **66 dni** |
| `/zestaw/21360/` (dopisany 09.11) | NEUTRAL | Excluded by noindex *(stary odczyt)* | 11.09 | 66 dni |

**`/serie/marvel/` wypadł z indeksu** przy niezmienionym crawlu z 01.11 — Google przeklasyfikował to,
co pobrał. Kolejka łapie stan „zeskanowana, niezindeksowana" i zgłosi stronę. Recenzja 31169 (14.11)
po dwóch dniach jeszcze „wykryta" — poprzednie teksty wchodziły w dobę; za wcześnie na wniosek.
`/zestaw/21360/` ma u Google stary odczyt „noindex" z 11.09 sprzed karty Piotra — kolejka zgłasza
takie adresy, dziś w niej 31376 i 31377 z tym samym stanem. `/zestaw/10280/` 66 dni bez crawla.

Dzisiejsza kolejka: 15 adresów, wszystkie powtórki z 15.11; stan 28 sprawdzonych: 9 zindeksowanych,
14 wykrytych, 2 nieznane, 2 stare noindex, 1 zeskanowany.

---

## Kontrola linków sklepowych

Wykonana przez Łowcę o 08:58 PL (`materialy/kontrola-linkow-2026-11-16.md`). Próba 150 linków,
**19 464 w całości (+163)**, martwych: **0** (trzeci tydzień z zerem po Lidlu 10427).

| Sklep | w próbie | żywe | martwe | blokada sklepu | nierozstrzygnięte |
|---|---:|---:|---:|---:|---:|
| ceneo | 55 | 55 | 0 | 0 | 0 |
| planetaklockow | 46 | 46 | 0 | 0 | 0 |
| smyk | 16 | 16 | 0 | 0 | 0 |
| mediamarkt | 6 | 6 | 0 | 0 | 0 |
| lidl | 2 | 2 | 0 | 0 | 0 |
| allegro | 5 | 0 | 0 | 1 | 4 |
| empik / mediaexpert / lego / xkom | 5 każdy | 0 | 0 | 5 każdy | 0 |

Ceneo bierze 55 ze 150 losowań, choć od 06.11 nie ma go na stronie — kontrola sprawdza mapę
`redirects`, nie linki w buildzie; jedna trzecia próby idzie na sklep, do którego nikt nie klika.
Drobiazg do `kontrola-linkow.mjs` (pominąć `SKLEPY_WYLACZONE`), nie pozycja dla ludzi. O 25 linkach
(16,7%) nie wolno powiedzieć „OK"; kontrola w przeglądarce 20.11 (piątek).

**Zadanie dla `empik-redirects.mjs --usun-martwe`: brak.**

---

## TOP artykuły

**Po kliknięciach afiliacyjnych** (polski ruch do sklepu): żaden artykuł powyżej jednego kliknięcia —
2 z artykułów łącznie, 2 z `/promocje-lego/`, 44 z hubów (40812 — 5, 10374 — 4, oba przez ChatGPT).
Tydzień temu tekst o Black Weeks x-komu miał 6; kod wygasł, kliknięcia zniknęły razem z nim.

**Po Google:** premiera 11390 Dragon Ball (1, pozycja 3,5), recenzja Creepera 21276 (1, pozycja 2,0),
`/promocje-lego/` (1). Wyświetlenia: `/wycofania/` 44, hub 11506 30, hub 75448 20, Botanicals 2027 15.

W tym tygodniu weszło **dziewięć tekstów Piotra** (Weekend Insiders i Black Friday na LEGO.pl, trzy
nowe Ideas, Monkie Kid znika, recenzja 75461 Vadera, klasyczny Space 1978–1987 w dwóch częściach,
Star Wars na 50-lecie — siedem zestawów, upominek Japonia do 20.11, recenzja 31169 Maszyny do pisania)
i **dwa deale Łowcy** (21066 Nowy Jork 349 zł, 42224 Porsche 379,99 zł). Teksty informacyjne i recenzje
zbierają pozycje 2–4 w Google przy pojedynczych wyświetleniach; kliknięcia afiliacyjne idą prawie
wyłącznie z hubów przez ChatGPT. Piąty tydzień tego samego wzorca.

---

## Trzy decyzje na ten tydzień

### 1. 85 zestawów bez rejestru — przed Black Friday *(Marek)*
Pozycja Scouta z 30.10 czeka 17 dni. Ta sama droga co 09.11 (48 zestawów w jeden przebieg):
nazwa, seria, RRP z katalogu, teksty, minimum z historii cen. **Zrobić:** zgoda do 20.11 na 85 zwykłych
zestawów roczników 2012–2025; 22 bez RRP zostają poza. **Kto:** Marek.

### 2. Drugi odczyt Smyka w tygodniu *(Marek)*
Środowa akcja Smyka (11.11) była dwa dni niewidoczna; `smyk-odswiez.mjs` kosztuje 0 kredytów.
**Zrobić:** zgoda na piątkowy odczyt do końca grudnia. **Kto:** Marek.

### 3. Performers — mail odwołany *(Marek)*
Zatwierdzenie przychodzi po ok. 60 dniach (trzy wrześniowe konwersje przeszły w tym tygodniu),
licznik kliknięć zbiegł do 80–93%. **Zrobić:** zgoda, żeby nie pisać do Performers; przypomnienie 23.11
zostaje jako kontrola, próg alarmowy to konwersja z 03.10 niezatwierdzona do ~10.12. **Kto:** Marek.

---

## Czego w tym raporcie nie ma

- **Ręcznego odczytu paneli Allegro, Planety Klocków i SalesMasters** — decyzja 22.09.
- **Mnożnika do 20 000 zł** — cel na 2027.
- **Nowego odczytu liczby zaindeksowanych** — 903 z 06.11; dwa tygodnie miną 20.11.
- **EPC Media Expertu z kliknięć września** — zatwierdzone 13,06 zł podaję bez dzielenia przez kliknięcia sprzed filtra botów.
- **Wyniku Dane wt z 10.11** — SUCCEEDED bez śladu; sesję sprawdza Marek.
- **Odpowiedzi, dlaczego `/serie/marvel/` wypadł z indeksu** — nie wiem; kolejka zgłosi, Kontroler sprawdzi.
