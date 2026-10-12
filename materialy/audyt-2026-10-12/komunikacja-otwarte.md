# Audyt 12.10.2026: komunikacja i otwarte sprawy

Stan z `origin/main` @ `49c795a` (12.10, po przepięciu runnerów). Tylko odczyt. Nic nie zostało
poprawione, a `npm run build` nie był uruchamiany. Numery linii dotyczą plików z `origin/main`.

---

## 1. Otwarte sprawy w `DZIENNIK.md`

### 1a. Sprawy merytorycznie otwarte (18)

| # | Data | Kto zostawił | Co | Kto ma zrobić | Dowód w gicie |
|---|---|---|---|---|---|
| 1 | 11.10 | RADAR | Dopisać do śledzonych 19 zestawów (RRP ≥ 1000 zł, ≥ 2 oferty; 75419, 75640, 71043…) | Code | **brak**: 0 z 6 numerów z tabeli w `sety.json` |
| 2 | 10.10 | RADAR | Ponaglić zgłoszenie do Proshopu (Awin), status „wysłane” od 19.08 | Marek (decyzja) | **brak**: rejestr `proshop.status = wyslane` |
| 3 | 06.10 | RADAR | Akapit o licencji Sanrio w `historia-licencji-lego-gry-sport-lifestyle` | Piotr | **brak**: słowa „Sanrio” nie ma w żadnym artykule (Scout potwierdził licencję 07.10) |
| 4 | 04.10 | RADAR | Recenzja 72306 PlayStation | Marek (czy kupujemy zestaw), potem Piotr | **brak** artykułu |
| 5 | 26.09 | RADAR | Na `/wycofania/` liczba sklepów z żywą ofertą | Code | **brak**: `wycofania.astro` bez tej kolumny, ostatnia zmiana 30.09 |
| 6 | 12.10 | SCOUT | Wycena gratisów Restauracje 40906–40909 (trzy mają RRP z „karty redakcyjnej”, 40909 ma `bez_rrp`) | Marek (decyzja) | brak (czeka na decyzję) |
| 7 | 12.10 | SCOUT | `kolejka-redakcyjna.py` nie działa w kontenerze (brak `openpyxl`) | Code | brak |
| 8 | 11.10 | CODE | Sesja Scouta: 757 tys. z 1 mln tokenów, blisko progu 850 tys. | Code (wykonanie), Marek (wiedza) | **nieaktualne**: `get_session` 12.10 — sesja Scouta po automatycznej kompakcji ma 169 tys. tokenów; nowa sesja niepotrzebna |
| 9 | 12.10 | Kontroler, decyzja 1 | Łatka filtra botów w `src/worker.js` (689 sztucznych kliknięć 10–11.10) | Marek (zgoda) | brak (worker wymaga pytania) |
| 10 | 12.10 | Kontroler, decyzja 2 | „Poproś o zindeksowanie” `/wycofania/` i `/serie/` oraz odczyt liczby zaindeksowanych stron (20 dni bez pomiaru) | Marek / Cowork | brak |
| 11 | 12.10 | Kontroler, decyzja 3 | Tytuł commitów Dane wt „(sesja Code za runnera)” | Code (delete+create, bo sesja jest stała), nie panel | brak; prompt **nie zawiera** tego zdania (runner kopiuje tytuł z `git log`) |
| 12 | 29.09 | CODE | Uwagi dla Piotra do partii 27 kart (brak „Opis zestawu”, krótsza metryka, dopychanie zdań) oraz gałąź w repo Piotra do skasowania | Marek → Piotr | **brak śladu przekazania** |
| 13 | 29.09 | CODE | Pkt 4–5 planu z 27.09: style `.podglad-widok` przenieść globalnie i scalić zdublowany kod | Code | **nie**: `podglad-widok` wciąż w `index.astro` i `promocje-lego/index.astro` |
| 14 | 28.09 | CODE | Skill `klocki-ceny-empik` (dwa przebiegi zamiast trzech) i rdzeń „podstawka” w `zrzut-import.mjs` | Code | **nie**: skill bez zmian od 22.09, „podstawk” = 0 trafień |
| 15 | 28.09 | CODE | 75429 hełm: dopisać cenę, gdy pojawi się rabat | Code (warunkowo) | nie dotyczy, dopóki nie ma rabatu |
| 16 | 30.09 | CODE | Cowork: zgłoszenia GSC 1.10 (lista od 75389) | Cowork | **nie sprawdzono**: brak śladu w repo |
| 17 | n/d | harmonogram | Jednorazowy Routine „Usunąć /podglad/” 14.10 09:00 (`trig_01RTWXNaHH82W1E4M1g65Ku6`) | Marek (decyzja) | `src/pages/podglad/` ma 2 pliki |
| 18 | 03.10 | CODE | Nowa sesja Łowcy | Marek + Code | **zrobione 12.10** (`d9b8bea`), ale bez linii zamknięcia |

Podział według tego, kto ma ruch: **Marek 7** (2, 4, 6, 9, 10, 12, 17), **Piotr 2** (3, 4 po decyzji),
**Code 8** (1, 5, 7, 8, 11, 13, 14, 15), **Cowork 1** (16). Pozycja 18 jest już zrobiona.

### 1b. Zrobione, ale bez linii „→ zamknięte” (formalności)

Skrypt `archiwum-dziennika.mjs` (l. 118) liczy jako otwartą każdą linię `**Zrobić:**`, która nie
brzmi „— nic”. „ZROBIONE” w treści linii nie zamyka pozycji, więc te wpisy **nigdy nie zejdą do archiwum**:

| Wpis | Pozycje | Dowód realizacji |
|---|---|---|
| RADAR 09.10 | 2 (gratis LEGO.pl, lista „co trwa teraz”) | `cf79f6d` |
| RADAR 08.10 | 1 (FAQ gratisów) | `f02bb7a` |
| RADAR 06.10 | 1 z 2 (BLDP „dziewiątej”) | `63a9d3e` |
| RADAR 02.10 08:00 | 1 (pokrycie cen ME) | parser `g:sale_price` 02.10, wpis RADAR 12:40 |

Wpisy wstrzymane statusem „w toku”, choć praca się skończyła: CODE 25.09 (CRO, na produkcji od 25.09,
`4153c05`), CODE 27.09 (podgląd, wdrożony 29.09, `975e4df`), CODE 04.09 (sesja redakcyjna
`session_017crJ…` „rezerwuje” kolejkę, choć Scout raportuje kolejkę na 185 pozycji).

**Usterki samego dziennika:** wpis „8.10.2026 — Warianty zdjęć” (l. 12–36) wklejono **w środek
preambuły**, nad znacznikiem. Rozcina zdanie instrukcji (l. 11 → l. 37) i nie zostanie zarchiwizowany.
Wpis „7.10.2026 — Audyt PageSpeed” (l. 726) stoi na samym końcu pliku, pod wpisem z 04.09. Oba mają
nagłówki w niestandardowym formacie.

### 1c. Porównanie z „Zadaniami bez właściciela” (Kontroler 12.10, 8 pozycji)

| Kontroler | Ocena |
|---|---|
| 1 (19 zestawów), 2 (Proshop), 3 (Sanrio), 4 (72306), 6 (`/wycofania/`), 8 (Restauracje) | zgodne z 1a |
| 5 (ME) | zgodne: zrobione, brakuje tylko linii zamknięcia |
| **7 (tekst o 75192, „26 dni, najstarsza otwarta”)** | **BŁĄD**: zamknięte 10.10 decyzją Marka („odłożone”), linia `→ zamknięte 10.10` w `dziennik-archiwum-2026-09.md:2520`, commit `42dba71`. Jeśli mail `kontroler` wyszedł, Piotr dostał nieaktualne zadanie |
| brak | sesja Scouta (8), wpisy „w toku”, formalności z 1b, pozycje 7, 11, 13, 14 (spoza kategorii RADAR/SCOUT, więc Kontroler ich z zasady nie zbiera) |

---

## 2. Maile do redakcji

| Klucz w `raporty_mail.json` | Wysyłka | Adresów | Kto wysyła |
|---|---|---|---|
| `promocje` | zawsze (codziennie) | 2 | Łowca |
| `nowosci` | przy zmianach | 2 | Scout |
| `wycofania` | przy zmianach | 2 | Wycofania |
| `konkurencja` | przy zmianach | 2 | Radar |
| `kontroler` | przy zmianach | 2 | Kontroler (sekcja „Zadania bez właściciela”) |
| `przypomnienie` | zawsze | 1 | Przypomnienie (pon 08:15) |
| `podejrzane` | przy zmianach | 1 | Łowca (`podejrzany-rynek-mail.mjs`) |
| `linki` | przy zmianach | 1 | Kontroler (`kontrola-linkow.mjs`) |

W całym pliku są **dwa różne adresy**: `kontakt@` dostaje wszystkie 8 kluczy, a drugi adres (według
`_meta`: Piotr) dostaje 5 kluczy: promocje, nowosci, wycofania, konkurencja i kontroler. Piotr
dostaje więc codziennie mail Łowcy i do tego raporty pozostałych runnerów.

**Czy maile faktycznie wychodzą: z repo nie da się tego sprawdzić.**
- `wyslij-raport.py` nie zapisuje żadnego śladu. Wypisuje tylko `Wyslano do: … (id: …)` na stdout
  sesji runnera i nie zostawia logu w repo, w `materialy/` ani w danych.
- `diagnoza.mjs` (Kontroler 12.10): „zmienne 14/14”, ale **nie wywołuje Resend**. Obecność klucza nie
  dowodzi wysyłki.
- Raporty Kontrolera z 05.10 i 12.10 nie potwierdzają ani nie zaprzeczają wysyłce maili. Jedyna
  wzmianka to wiersz „Przypomnienie… produktem jest mail” (status „OK” według `last_run`, co według
  ustaleń trwałych nie jest dowodem).
- W dzienniku od 28.09 nie ma żadnej wzmianki o udanym ani nieudanym mailu.
- Dowód jest tylko w logu Resend albo w skrzynkach odbiorców. Najprościej: Marek potwierdza, czy
  12.10 przyszły maile „Kontroler” i „Przypomnienie”. Docelowo `wyslij-raport.py` mógłby dopisywać
  datę, klucz i id do pliku w repo, który runner commituje.

---

## 3. Stare ID podane jako aktualne (po przepięciu 11–12.10)

| Plik:linia | Co mówi | Ocena |
|---|---|---|
| `NARZEDZIA.md:116` | „Od 22.09.2026 Kontroler (`trig_0167qmnWn3Qjjz8HTwZU1uEP`) też jest trwałą sesją” | **jako aktualne**, do poprawy na `trig_01XGtqSHKVQ9cL2uERVx3Gmi` |
| `materialy/zadania-cykliczne.md:101` | „od 22.09 po południu obowiązuje `trig_0167qmnWn3Qjjz8HTwZU1uEP`” | **jako aktualne**, do poprawy |
| `materialy/kontroler-prompt-2026-09-22.md:14` | „Trigger Kontrolera: `trig_01EDEh…`, trwała sesja `session_01M8qMJFfKHEozBSGXjAKP4n`” | dokument datowany, ale czyta się go jak opis bieżący; wystarczy dopisek „nieaktualne od 12.10” |
| `materialy/kontroler-2026-10-12.md:142` | Wycofania: „nowe ID … `trig_01MGb7VnMvdSHp9Jwa7HyQ69`” | raport datowany, był prawdziwy o 09:00 i nieaktualny od 10:05; nie poprawiać |
| poza listą: `materialy/zadania-cykliczne.md:12` | Harmonogram jako `trig_01GJ2ecMp3gwtkZ1pFyUPKLH` | **jako aktualne**, a obowiązuje `trig_01LU2xZxWqyCmNYv7rPyik3x` (tak podaje `NARZEDZIA.md:125`) |

Pominięte zgodnie z zakresem: `zadania-cykliczne.md:57–62` (sekcja HARMONOGRAM, przepisze ją Routine
19.10) i `routine-prompty.md` (odczyt z 12.10 07:47, sprzed przepięcia: Radar, Kontroler, Wycofania i
Łowca mają tam stare ID). Wzmianki historyczne są w porządku: `DZIENNIK.md` 122–125, 160, 485–487, 529;
„Sesje archiwalne” `zadania-cykliczne.md:293–302`; „Historia zmian” 350–494; `audyt-2026-09-30/routines.md`.
**Brak wpisu w „Historii zmian harmonogramu”** za 05–12.10: ostatni wpis jest z 02.10, nie ma w nim
dwóch zmian triggera Scouta ani przepięcia czterech runnerów 12.10. Poza `*.md` żaden plik nie
zawiera starych ID.

---

## 4. Stan rekomendacji z audytu 30.09

Z = zrobione, C = częściowo, N = nie, X = nieaktualne.

| Pozycja | Stan | Dowód |
|---|---|---|
| **S1.1** Panele bez API (Allegro, PK, x-kom) | N | decyzja 22.09 „model” podtrzymana w raporcie Kontrolera 12.10 (EPC „model”) |
| S1.2 LEGO.com: Rakuten ponownie / Dognet | N | rejestr `lego.status = odmowa` (15.09); Dognet tylko w uwagach |
| S1.3 Smyk → netSalesMedia | N | rejestr: „DO ROZWAŻENIA” |
| **S1.4** MediaMarkt, RTV Euro, Proshop ponowić | N | wszystkie trzy „wyslane” (16–19.08); Proshop bije nasze ceny (RADAR 10.10) |
| S1.5 x-kom cyklicznie | Z | `07c7d6d` (tygodniowo, decyzja 30.09); zrzuty `4e3b06d` 05.10 i `a3b2ece` 12.10 |
| S4.1 „Empik co tydzien” wyłączony, x-kom w przypomnieniu | Z | `NARZEDZIA.md:118` (skasowany 30.09); prompt Przypomnienia (Empik + x-kom) |
| S4.2 Reguła: importy poza oknem 08:30–09:30 | N | brak w NARZEDZIA i RUNBOOK (w praktyce zrzuty 12.10 o 10:09) |
| S4.3 Łowca: build + `historia-cen/` | Z | prompt Łowcy, krok 2 „BUILD PRZED PUSHEM” i reguła historii |
| S4.4 Alerty: świeżość z `oferty_feed` | Z | prompt Alertów, krok 2 |
| S4.5 Harmonogram w bieżącej sesji + `get_session` | Z | `trig_01LU2…`, krok (4) z alarmem > 850 tys. |
| S4.6 Scout w nowej sesji | nieaktualne | 11.10: 757 tys.; 12.10 po automatycznej kompakcji 169 tys. (`get_session`) — próg przestał być pilny |
| S4.7 Routine 24.10 na zmianę czasu | X | zastąpione `CRON_TZ=Europe/Warsaw` (30.09) |
| S4.8 Zdjęcia → R2 o 09:45 | Z | `trig_01XAJy9vca6HUK6YY3XarLWM` |
| S4.9 `kontrola-rrp` w Dane wt, Backfill skasować | C | Backfill skasowany 30.09; `kontrola-rrp` nie ma w żadnym prompcie |
| S4.10 Poprawki dokumentów (routines.md D) | C | `9e7b0f2`; nadal otwarte: D3 (tytuł commita Dane wt), D11 (diagnoza u Scouta i Radaru) |
| S8 Nowa sesja Łowcy | Z | 23.09 i ponownie 12.10 (`d9b8bea`) |
| S8 Kredyty Firecrawla 5000 czy 1500 | Z | RUNBOOK:362 „5 000”; diagnoza 12.10: zostało 3054 |
| S8 Przypomnienie z x-komem | Z | prompt Przypomnienia |
| S8 Luki weekendowe Scouta | Z | commity sob./niedz. 03–04.10 i 10–11.10; jedyna luka to pon. 05.10 (nie sprawdzono przyczyny) |
| S8 Kamienie, sitemap, pomiar Allegro/PK | X | zamknięte 22.09 |
| S8 Diagnoza u Scouta i Radaru | N | prompty Scouta (l. 33–86) i Radaru (l. 87–117) bez `diagnoza.mjs` |
| S9.1 Teksty szablonowe | Z | `d526d69` (ocenę jakości robi inny agent) |
| S9.2 Meta + `/podglad/` + `/kolekcjoner/` | C | meta `259f5c9`, kolekcjoner 301 `ba9fb5c`; `/podglad/` nadal jest (Routine 14.10) |
| S9.3 Routines 1–6 | C | 1, 3, 4, 5 zrobione; 2 i 6 nie |
| S9.4 x-kom | Z | jak S1.5 |
| S9.5 GSC | C | odczyt 30.09 i API 02.10; zgłoszenia 1.10 bez śladu; liczba zaindeksowanych stron bez odczytu od 18.09 |
| S9.6 Panele bez API raz w miesiącu | N | jak S1.1 |
| **S9.7** Ponowić zgłoszenia + Smyk | N | jak S1.2–S1.4 |

**Razem 28 pozycji: Z 12, C 5, N 8, X 3** (S4.6 przeklasyfikowane na nieaktualne po `get_session`). Najważniejsze niezrobione: **(1)** ponowienie zgłoszeń afiliacyjnych: Proshop,
MediaMarkt i RTV wiszą 8 tygodni przed Black Friday, a do tego LEGO.com i Smyk; **(2)** diagnoza
w promptach Scouta i Radaru oraz `kontrola-rrp` w Dane wt (zmiany w promptach, delete+create).

---

## 5. Decyzje dla Marka

| # | Sprawa | Opcje | Rekomendacja |
|---|---|---|---|
| D1 | **Filtr botów w workerze.** 689 sztucznych „human” kliknięć poszło 10–11.10 do Allegro, Empiku i ME; grozi to wstrzymaniem konta w sieci | a) trzy łatki Kontrolera (kanoniczny referer, odrzucanie referera `/idz/`, `/promocje-lego/` na liście); b) od razu token w linku; c) czekać | **a) w tym tygodniu**, b) dopiero, gdy fala wróci; do tego jednorazowy odczyt paneli Allegro i Performers |
| D2 | **x-kom: tylko mailingi czy rytm tygodniowy** | — | **Już rozstrzygnięte 30.09: co tydzień** (zrzuty 05.10 i 12.10 działają). Nie ma czego decydować, można skreślić z listy |
| D3 | **Ponowienie zgłoszeń** (Proshop/Awin, MediaMarkt i RTV/TD, LEGO/Rakuten albo Dognet, Smyk/netSalesMedia) | a) wszystkie teraz; b) tylko Proshop; c) czekać na ruch | **a)**: koszt to kilka formularzy, a okno BF zaczyna się za około 5 tygodni; Proshop najpierw (ma feed co godzinę) |
| D4 | **Panele bez API** (Allegro, PK, SalesMasters), decyzja 22.09 „model” | a) zostaje model; b) odczyt miesięczny do arkusza; c) jednorazowo teraz | **c) teraz** (fala botów) i **b) w XI–XII**: to 60% kliknięć bez wiedzy, czy zarabiają |
| D5 | **Usunięcie `/podglad/`** (Routine 14.10) | a) usunąć; b) zostawić jako „powrót” | **a)**: v2 stoi od 2 tygodni, a powrót jest w commicie `7f488de`; kopie żyją na produkcji |
| D6 | **Dane wt: nowa sesja?** (275 tys. tokenów) | a) nowa teraz; b) nie | **b)**: przebieg raz w tygodniu, daleko od 850 tys.; pilnuje tego alarm Harmonogramu. Przy okazji delete+create (poprawka tytułu commita, `kontrola-rrp`) można rozważyć nową sesję, ale nie jest konieczna |
| D7 | **Wycena gratisów Restauracje** 40906–40909 | a) `bez_rrp` dla całej serii; b) „wycena dodatku” dla wszystkich czterech | **a)**: nie były sprzedawane osobno, a RRP z „karty redakcyjnej” daje w tabelach huba fałszywy rabat lub narzut (rynek 169–278 zł) |
| D8 | **Recenzja 72306 PlayStation** | a) kupić i zlecić Piotrowi; b) zamknąć „odkładamy” | Zdecydować w tym tygodniu (okno prezentowe); jeśli nie ma budżetu, wybrać **b** i dopisać linię zamknięcia |
| D9 | **GSC: odczyt panelu i crawl `/wycofania/`** | — | Dwa kliknięcia i jeden odczyt w Coworku; kamień 4 stoi 20 dni |
| D10 | **Start social media** | a) teraz; b) po D1 i nowej sesji Scouta | **b)**: z dziurawym filtrem nie zmierzymy ruchu z social; warunki z sekcji 9 audytu 30.09 są poza tym w większości spełnione. Realnie po raporcie Kontrolera 19.10 |

Do zlecenia Code bez decyzji: ~~nowa sesja Scouta~~ (nieaktualne — 169 tys. po kompakcji, sprawdzone 12.10); poprawka
Kontrolera w sprawie 75192; linie „→ zamknięte” z 1b; trzy poprawki ID z sekcji 3.

---

## 6. Komunikacja z Piotrem

**Dostarczył ostatnio:** recenzje 75434 K-2SO i 42650 Sklep dla zwierząt (opublikowane 11.10,
`3582481`), recenzję 31163 (29.09, `37ae400`), 75 kart P07 w partiach 02, 26 i 27 (29.09, `d30f4b3`)
oraz trzy rankingi „Największe…” (22.09).

**Czeka na Piotra:**

| Co | Od kiedy | Kanał, którym to do niego doszło |
|---|---|---|
| Akapit o Sanrio w tekście o licencjach | 06.10 | Radar (mail `konkurencja`) i Kontroler (mail `kontroler`), jeśli maile wyszły |
| Recenzja 72306 | 04.10, czeka na decyzję Marka | jak wyżej |
| Poprawki szablonu kart z partii 27, skasowanie gałęzi w jego repo | 29.09 | **tylko dziennik** |
| Frazy z kart typu „brak minifigurek” na hubach (audyt 30.09, sekcja 7) | 30.09 | **tylko raport audytu** |

**Czego Piotr najpewniej nie wie, bo trafiło tylko do dziennika:**
- 75192: tekst odłożony i zamknięty decyzją Marka 10.10, a mail Kontrolera z 12.10 nadal zleca
  mu go jako „najstarszą otwartą pozycję”;
- rynek zszedł poniżej jego progów zakupu: K-2SO 272,99 zł przy progu 290 zł, 42650 113,98 zł przy
  120 zł, 31163 około 68 zł przy 75 zł. Tabela huba pokazuje to sama, ale zdanie o progu w tekście
  nie jest już aktualne;
- uwagi do partii 27 (patrz wyżej);
- zamknięcia z 10.10 (kalendarz wydarzeń, siatka „Największe zestawy”).

**Kanał:** `redakcja/wspolpraca.md` to statyczny regulamin (ostatnia zmiana 21.09). Nie ma tam listy
spraw do załatwienia. Jedynym kanałem z zadaniami do Piotra jest mail, a z repo nie da się
potwierdzić, że wychodzi (sekcja 2). Do tego Piotr dostaje 5 strumieni raportów, w tym codzienny
mail Łowcy, więc zadania dla niego giną w szumie. Rekomendacja: Kontroler (albo Marek) wysyła
Piotrowi wyłącznie pozycje „Kto: Piotr” razem z zamknięciami z tygodnia; Piotra warto wypisać
z kluczy `promocje` i `nowosci`, chyba że sam chce je dostawać.
