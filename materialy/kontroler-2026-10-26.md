# Raport Kontrolera — 26.10.2026 (poniedziałek)

> **Dwie rzeczy z tego tygodnia są warte więcej niż cała reszta.** Pierwsza: Google
> odwiedził `/serie/`, `/wycofania/` i `/ekskluzywne/` 25.10 i `/promocje-lego/` 26.10 —
> po 34–41 dniach ciszy. Zrobił to **sam, dzień przed pierwszym poniedziałkowym
> zgłoszeniem**, więc decyzji 1 z 19.10 nie wolno przypisać tej zasługi. Druga:
> filtr botów ma małą dziurę — **17 kliknięć spoza Polski przeszło jako „human"**,
> wszystkie z refererem strony głównej, 10 z nich z refererem bez końcowego
> ukośnika, którego prawdziwa przeglądarka nie wysyła. Z Polski z tej samej strony
> głównej nie przyszło w tym tygodniu ani jedno kliknięcie. To jest decyzja 1.

> **Przeprosiny na wstępie:** pierwszy dzisiejszy mail „Zadania bez właściciela" poszedł
> z listą z 19.10 (błąd mojego skryptu — zapisał wynik w złe miejsce). Poprawka wyszła
> dziewięć minut później, oznaczona w tytule.

---

## Kto co robi

**Decyzja 1: 17 kliknięć spoza Polski przeszło w tym tygodniu filtr jako „human" — każde z refererem strony głównej, 10 z refererem `https://tylkoklocki.pl` bez końcowego ukośnika, 0 kliknięć z Polski z tej samej strony.**
**Mamy?** — częściowo: worker sprawdza ścieżkę referera (`new URL(referer).pathname`), a dla `https://tylkoklocki.pl` bez ukośnika ścieżka i tak wychodzi `/` — reguła „ścieżka z ukośnikiem" tego nie łapie, bo pracuje na sparsowanej ścieżce, nie na surowym nagłówku.
**Zrobić:** — zgoda na jedną regułę w `src/worker.js`: surowy referer równy dokładnie `https://tylkoklocki.pl` albo `https://www.tylkoklocki.pl` (bez ukośnika) = bot. Przeglądarka serializuje referer strony głównej zawsze z ukośnikiem. Wdraża Code; worker = pytamy przed pushem.
**Kto:** — Marek (decyzja)

**Decyzja 2: Performers drugi tydzień z rzędu liczy mniej kliknięć niż my wysyłamy — 12 wobec 18 naszych ludzkich (67%), tydzień temu 18 wobec 29 (62%).**
**Mamy?** — częściowo: dwa tygodnie czystego pomiaru po odcięciu botów, ta sama proporcja; 387 kliknięć w 60 dni po ich stronie i 0 konwersji.
**Zrobić:** — napisać do Performers (support, program Media Expert, offer_id 1860) z obiema parami liczb i pytaniem, jak liczą kliknięcia (okno deduplikacji, odrzucanie po UA) — albo świadomie poczekać trzeci tydzień.
**Kto:** — Marek (decyzja)

**Decyzja 3: przesunięcie Kontrolera na 09:30 (19.10) zrobiło kolizję z „Alerty cen" (codziennie 09:30) — harmonogram z konta zgłasza ją jako jedyną.**
**Mamy?** — częściowo: kolizja nie zrobiła dziś szkody (oba przeszły), ale dzieli limit konta na tej samej minucie.
**Zrobić:** — zgoda na 09:35 dla Kontrolera (jedna zmiana crona `trig_01KB8XkPcHyvc5kCRKEKYjri`, Kontroler zrobi ją sam i poprawi wzmianki w repo).
**Kto:** — Marek (decyzja)

**Liczba zaindeksowanych stron z panelu GSC ma odczyt z 19.10 (837, dane z 12.10) — 02.11 miną dwa tygodnie, a w sitemapie przybyło w tydzień 393 hubów (1 375 → 1 768).**
**Mamy?** — nie: ostatni odczyt 19.10.2026 przez Coworka.
**Zrobić:** — odczytać raport „Strony" w panelu GSC przed 02.11 (ten sam prompt co 19.10 — leży w sesji Kontrolera).
**Kto:** — Marek (panel) albo Cowork (panel)

**Akapit o Sanrio w `/artykuly/historia-licencji-lego-gry-sport-lifestyle/` czeka od 06.10 (20 dni) — pozycja Piotra z Radaru, której parser nie wysłał w dzisiejszym mailu (wpis ma na końcu zamknięcie innej pozycji).**
**Mamy?** — nie: dział licencji kończy się na Nike i Formule 1.
**Zrobić:** — akapit o licencji Sanrio (oficjalne oświadczenie obu firm, pierwsze produkty 2027). Piotr dostał tę pozycję w mailu 19.10.
**Kto:** — Piotr (tekst)

**W prompcie Kontrolera nadal stoi „Łowca o 08:30, pół godziny przed Tobą" — od 19.10 to godzina.**
**Mamy?** — częściowo: nie wpływa na przebieg (Kontroler czyta najnowszy plik kontroli, dziś z 08:51).
**Zrobić:** — jedna fraza w prompcie zadania na Macu, przy okazji.
**Kto:** — Marek (komputer)

**`/zestaw/11208/` spadł w GSC z „wykryta – niezindeksowana" na „adres nieznany Google", choć jest w sitemapie i jest indeksowalny.**
**Mamy?** — tak: hub w buildzie, bez noindex, w `sitemap-zestawy.xml`.
**Zrobić:** — nic dla ludzi: kolejka indeksacji łapie stan „unknown to Google" i zgłosi go sama; Kontroler sprawdzi za tydzień.
**Kto:** — Kontroler (następny przebieg)

Pozycje zebrane z dziennika — sekcja „Zadania bez właściciela" niżej (mail z poprawką
wysłany, id `01a17760`).

---

## Diagnoza środowiska — 2026-10-26 08:35 UTC

**Repo**
- gałąź `kontroler` @ `2e50143`, origin/main @ `2e50143` — 0 commitów ponad main, 0 do nadrobienia
- node_modules ✓, astro ✓

**Zmienne środowiska**
- ustawione: 14/14 — komplet

**Dane**
- oferty_feed zaktualizowane: 2026-10-26
- rejestr afiliacji zaktualizowany: 2026-10-19
- import Empiku: 2026-10-26 — Zrzut Empiku i x-komu 26.10.2026: 4552 cen Empik, 720 cen x-kom, deeplinki
- oferty: allegro 6201, empik 4552, ceneo 1764, planetaklockow 1102, lego 984, mediaexpert 738, xkom 720, smyk 642, lidl 110, mediamarkt 56
- rejestr Scouta (known_sets.json): 1212/1212 ✓ *(nowa kontrola z 19.10 — pierwszy raport z tą linią)*

**Dostępy** *(realne wywołania, nie deklaracje)*
- cloudflare: **ok** (kliknięć 7 dni: 1 940) · r2: **ok** (`tylkoklocki-obrazy`)
- tradedoubler: **ok** (Media Markt, Allegro, Empik, Lidl, Ceneo, Ceneo CPS ACCEPTED; RTV EURO AGD REJECTED)
- search_console: **ok** · adtraction: **ok** · performers: **ok**
- produkcja: **ok** (200) · link sklepu z przeglądarki: **ok** (302) · firecrawl: **ok** (4 975 kredytów — tydzień temu 1 002, doładowane)

Zrzuty Empiku i x-komu weszły **przed** raportem (09:10 PL), Łowca wypchnął kontrolę
linków o 08:51 — przesunięcie Kontrolera na 09:30 zrobiło to, co miało.

---

## Cztery kamienie milowe na grudzień 2026

| Kamień | Tydzień temu (19.10) | **Dziś (26.10)** | Kierunek |
|---|---|---|---|
| **1. Zatwierdzona prowizja w każdej z 3 sieci z API** | 1 z 3 — TD (2 zatwierdzone transakcje) | **1 z 3 — TD (6 zatwierdzonych: Empik 3, Ceneo 2, Lidl 1)** | w górę wewnątrz TD |
| **2. EPC per sklep na próbie > 1 transakcji (próg 10 EUR)** | 1 sklep (Empik) | **1 sklep (Empik: 4 transakcje, 379 EUR)** | bez zmian |
| **3. Kliknięcia z Polski dziennie** | 7,7 | **5,1** (7 dni) / 6,4 (14 dni) / 5,6 (28 dni) | **w dół** |
| **4. Zaindeksowane strony (panel GSC)** | 837 *(dane z 12.10)* | **837** *(ten sam odczyt)* | brak nowego odczytu, 7 dni |

### Kamień 1 — sześć zatwierdzonych transakcji, nadal jedna sieć

Tradedoubler w oknie 60 dni: **10 transakcji, 10,78 EUR, 6 zatwierdzonych** — Empik 3 z 4
(8,53 EUR), Ceneo 2 z 5 (0,39 EUR — mikro-CPS), Lidl 1 z 1 (1,86 EUR). Tydzień temu
zatwierdzone były dwie. **W oknie 7 dni pierwsza transakcja Empiku od września:**
obrót 53,56 EUR, prowizja 1,30 EUR, jeszcze niezatwierdzona.

Dwie pozostałe sieci bez zmian: **Adtraction 0 transakcji** w całej historii;
**Performers 387 kliknięć w 60 dni, 0 konwersji** — i do tego rozjazd liczników
opisany w EPC.

### Kamień 2 — jeden sklep, kryterium już zapisane

Po decyzji z 19.10 (próg 10 EUR obrotu, `afiliacje_rejestr.json` → `_meta.decyzje.kamien_2_prog`)
liczy się tylko Empik: 4 transakcje, 379 EUR, stawka efektywna 2,25%. Lidl ma jedną,
Ceneo pięć po 0,08 EUR — nie wchodzą. Pierwszy raport, w którym ta liczba nie zależy
od uznania piszącego.

### Kamień 3 — 5,1 dziennie, w dół, i co z tego wynika

| Okno | Kliknięć z Polski | Średnio dziennie |
|---|---:|---:|
| 7 dni | 36 | **5,1** |
| 14 dni | 89 | 6,4 |
| 28 dni | 156 | 5,6 |

Poprzedni tydzień: 53 (tydzień temu raportowałem 54 — granica okna). Spadek 54 → 36
to **−33%**, ale okno 28-dniowe stoi na 5,6 wobec 6,3 tydzień temu, czyli ruch wraca
do poziomu, który 12.10 nazwałem prawdziwym: **5–7 kliknięć dziennie**, a tydzień 13–19.10
był lepszy, nie nowy. Dni: 2, 5, 2, 6, 11, 15, 10, 2 — weekend 24–25.10 dał 25 z 36.

Źródła polskich kliknięć: **huby 29, działy 5, artykuły 2, strona główna 0.**
**ChatGPT: 16 z 36 (44%)** — tydzień temu 22%, dwa tygodnie temu 17%. Google dał
w tym samym oknie 3 kliknięcia na stronę. To jest już trend, nie tydzień.

### Kamień 4 — 837, bez nowego odczytu

Odczyt z 19.10 (dane 12.10). Następny należy się przed 02.11 — tym bardziej, że sitemapa
hubów urosła w tydzień o 393 adresy (karty Piotra P07, partie 08–13).

---

## Harmonogram

**Data odczytu z konta: 26.10, 07:47 CET — dzisiejsza.** 22 Routines (16 serwisu, 6 innych).
**Jedna kolizja: pon 09:30 — Kontroler i „Alerty cen"** (codziennie 09:30). Zrobiłem ją
sam 19.10, przesuwając Kontrolera; decyzja 3.

Commity w 7 dniach: **Łowca 11, Scout 9, Kolejka indeksacji 8, Radar 7, Wycofania 1
(pon), Dane wt 1 (wt)** — każdy runner z pushem ma ślad; dziś do 09:34 weszło siedem
commitów (kolejka 01:04, Scout 04:16, Wycofania 05:15, Harmonogram 06:47, Radar 07:04,
Łowca 07:51, zrzuty 08:10 UTC). **Scout, który 19.10 nie zostawił commita, w tym tygodniu
zostawił 9** — alarm z zeszłego tygodnia zdjęty.

Zadanie 20. dnia miesiąca (lista do przeglądarki) odpaliło się 20.10 i pushnęło;
kontrola w Chrome z Maca dała 19/20 żywych (`materialy/kontrola-przegladarkowa/wyniki-2026-10-20.md`).

---

## Archiwum dziennika

9 wpisów przeniesionych do `materialy/dziennik-archiwum-2026-10.md`; `DZIENNIK.md`
1 759 → 1 565 linii. Zatrzymane mimo wieku: 1 wpis Radaru z 06.10 (otwarta pozycja
o Sanrio) i trzy wpisy CODE „w toku" z września — te same, co tydzień temu, najstarszy
ma siedem tygodni; jeśli nie są w toku, potrzebują linii zamknięcia.

---

## Świeżość tekstów

`swiezosc-tekstow.mjs` (nowy krok od 19.10): 77 tekstów, **0 sprzeczności**, 1 do
sprawdzenia — `/zapowiedzi-lego-2027/` oznacza 77094 (Zelda: Link i Epona) plakietką
„przeciek", a numer jest już w `sety.json` z premierą 2027 i bez ceny katalogowej.
Rejestr wyprzedził producenta (źródło: PromoBricks/StoneWars, pewność średnia) —
tekst mówi prawdę, nic do roboty.

---

## Zadania bez właściciela

**11 pozycji: Piotr 2 (+ Sanrio, patrz wyżej), Marek 3, Code 5, Scout 1.** Mail z poprawką
do Marka i Piotra, id `01a17760`.

### Piotr (tekst)
- **Kalendarz listopadowy** — LEGO podało terminy: Insiders Weekend 21–22.11, Black Friday od 27.11; tekst w kategorii Kalendarze. *(Scout 20.10)*
- **„Czy warto zbierać gratisy GWP z miniserii LEGO"** — evergreen. *(Radar 14.10, 12 dni)*
- **Akapit o Sanrio** w tekście o licencjach. *(Radar 06.10, 20 dni — poza mailem, parser)*

### Marek (decyzja / panel)
- **Prompt Scouta** nadal zakazuje dodawać zestawy Education do `sety.json`, a 23.10 zdecydowano inaczej — wyjątek do dopisania w panelu. *(Scout 24.10)*
- **Panel SalesMasters:** stawka x-komu dla klocków i cookie — jedyne puste pola w rejestrze afiliacji. *(Kontroler 19.10)*
- **Cykl „do szafy"** — decyzja, czy wchodzimy w formę tygodniową. *(Radar 19.10)*

### Code (dane, strona, skrypt)
- **Deal 75192 Sokół Millennium** w minimum notowań przed grudniowym wycofaniem. *(Radar 24.10)*
- **Okno gratisowe 28.10–11.11 z 40889** w `/kalendarz-promocji-lego/` + polski próg. *(Scout 24.10)*
- **Feed MediaMarkt:** 76265 i 52447 do sprawdzenia i `potwierdzone_numery`. *(Dane wt 20.10)*
- **71835** z ofertą Lidla bez wpisu w katalogu i bez zdjęcia. *(Dane wt 20.10)*
- **18 flag `ekskluzyw`** bez etykiety na lego.pl do sprawdzenia na kartach. *(Dane wt 20.10)*

### Zamknięte od 19.10 (nie ma ich na liście)
Proshop (14.10), 75419 (14.10), 43 ceny LEGO.pl (14.10, `b4559ca`), `known_sets` (19.10),
zrzuty Empiku/x-komu, odczyt GSC, eksport 404, wpis x-komu w rejestrze, obie decyzje z 19.10,
kontrola w przeglądarce — **dziesięć pozycji w tydzień.** Mechanizm zamykania działa.

---

## Ruch botów — filtr trzyma z jedną dziurą

| Rodzaj | Kliknięć | Udział |
|---|---:|---:|
| bot (odrzucony przez filtr) | 1 887 | 97,2% |
| **„human" (przepuszczony do sieci)** | **53** | 2,7% |
| test (nasza diagnoza) | 1 | 0,1% |

Z 53 kliknięć „human" **36 jest z Polski, 17 spoza** — i te 17 trzeba obejrzeć.

### 17 kliknięć spoza Polski — wszystkie z refererem strony głównej

| Kiedy | Ile | Kraje | Referer | Sklepy |
|---|---:|---|---|---|
| 23.10 15:51–16:16 (25 min) | 6 | BR, BD, BD, CO, NG, PK | `https://tylkoklocki.pl/` | ME ×4, Lidl, Allegro |
| 24.10 14:12–20:39 | 10 | SG, US, BR, ZA, ES, BR, US, TR, UY, US | **`https://tylkoklocki.pl` — bez ukośnika** | LEGO, PK, Lidl, Ceneo, Empik, x-kom ×3, Smyk, Allegro |
| 24.10 18:05 | 1 | US | `https://tylkoklocki.pl/` | Allegro |

Trzy rzeczy przesądzają: **z Polski ze strony głównej nie przyszło w tym tygodniu ani
jedno kliknięcie** (36 polskich to huby, działy i artykuły); dziesięć kliknięć z 24.10
ma referer **bez końcowego ukośnika**, którego prawdziwa przeglądarka nie wysyła
(nagłówek Referer dla strony głównej jest zawsze serializowany jako `https://host/`);
i szły jedno na sklep, po kolei, jak sonda. Reguła z 12.10 tego nie łapie, bo sprawdza
sparsowaną ścieżkę (`new URL(referer).pathname` = `/` także bez ukośnika), a nie surowy
nagłówek. Poprawka to jedna linia — decyzja 1.

Skala: 17 kliknięć w tydzień wobec 689 w fali 10–11.10. **Nie alarm, tylko dziura do
zalepienia, zanim ktoś ją znajdzie na większą skalę.**

Udział „brak-linku": **0 na 53** — szósty tydzień z rzędu. Boty odrzucone: US 617,
Chiny 243, Brazylia 190; sklepy Allegro 603, Media Expert 272, LEGO.com 262.

---

## EPC per sklep

Kliknięcia: ruch ludzki z Polski. Prowizje: z API. Allegro, Planeta Klocków i x-kom —
EPC modelowe (brak API, tak zostaje). EUR i PLN osobno.

| Sklep | Kliki PL 7 dni | Kliki PL 30 dni | Prowizja 30 dni | EPC 30 dni | Podstawa |
|---|---:|---:|---:|---:|---|
| Media Expert | 14 | 74 | 0,00 zł | **0,00 zł** | Performers: 113 klików u nich, 0 konwersji |
| Allegro | 5 | 40 | — | **model** | brak API |
| Empik | 5 | 20 | 1,30 EUR | **0,065 EUR** | TD: 1 transakcja w oknie (53,56 EUR obrotu) |
| LEGO.com | 3 | 19 | — | **0 z definicji** | brak programu |
| Ceneo | 4 | 9 | 0,23 EUR | 0,026 EUR | TD: 3 mikro-transakcje |
| Smyk | 1 | 9 | 0,00 zł | **0,00 zł** | Adtraction: 0 |
| Lidl | 2 | 8 | 0,00 EUR | — | 1,86 EUR zatwierdzone (wrzesień, poza oknem) |
| x-kom | 2 | 7 | — | **model** | SalesMasters, brak API |
| Planeta Klocków | 0 | 1 | — | **model** | webePartners, brak API |
| **Razem** | **36** | **187** | **1,53 EUR** | **0,008 EUR/klik** | 3 sieci z API |

Tydzień temu okno 30 dni dawało 5,91 EUR na 197 kliknięć (0,030 EUR/klik); dziś 1,53 EUR
na 187 (0,008) — wrześniowe transakcje Empiku wypadły z okna, a październik dał jedną.
**Okno 60 dni: 10,78 EUR.** To jest skala, w jakiej serwis dziś zarabia.

### Performers liczy 2/3 naszych kliknięć — drugi tydzień

| Tydzień | Nasze kliknięcia ludzkie do ME | Performers | Udział |
|---|---:|---:|---:|
| 13–19.10 | 29 | 18 | 62% |
| 20–26.10 | 18 | 12 | 67% |

Dwa tygodnie czystego pomiaru, ta sama proporcja. Jedna trzecia kliknięć do Media Expertu
nie dociera do licznika sieci, która ma nam za nie płacić — przy zerowej konwersji od
sierpnia to pytanie, które warto zadać na piśmie. Decyzja 2.

---

## Widoczność w Google

| Okres | Kliknięcia | Wyświetlenia | CTR | Pozycja |
|---|---:|---:|---:|---:|
| 7 dni (17–24.10) | **3** | 127 | 2,36% | 26,9 |
| 14 dni (10–24.10) | 4 | 275 | 1,45% | 24,5 |
| Poprzednie 7 dni (z różnicy) | 1 | 148 | — | — |

Kliknięcia 1 → 3, wyświetlenia 148 → 127, pozycja 22,5 → 26,9. Trzy kliknięcia to trzy
**artykuły** po jednym: `/artykuly/lego-bam-pazdziernik-2026/` (pozycja 10),
`/artykuly/media-expert-kod-lego-pazdziernik-2026/` (pozycja **2,2**) i
`/artykuly/ranking-kalendarze-adwentowe-lego-2026/` (pozycja 8). Pierwszy raz od początku
pomiaru kliknięcia z Google przyszły na teksty, nie na stronę główną czy `/wycofania/`.

**Fraza numer jeden to kod rabatowy Media Expertu: `me0110-311026`, pozycja 1,3** — ludzie
szukają kodu, nie zestawu. 47 podstron z wyświetleniami w tygodniu (tydzień temu 24).

`/wycofania/`: 24 wyświetlenia, 0 kliknięć, pozycja 6,4 — po jednym kliknięciu tydzień
temu znowu zero. Strona główna 17 wyświetleń, pozycja 32,6.

---

## Indeksacja

### Liczby z builda

| Miara | 12.10 | 19.10 | **26.10** | Zmiana t/t |
|---|---:|---:|---:|---:|
| Huby `/zestaw/` w buildzie | 9 803 | 9 830 | **9 879** | +49 |
| Huby w `sitemap-zestawy.xml` | 1 291 | 1 375 | **1 768** | **+393** |
| Udział zgłoszonych | 13,2% | 14,0% | **17,9%** | +3,9 pkt |

Największy tygodniowy przyrost zgłoszonych hubów w historii pomiaru: karty Piotra P07,
partie 08–13 (150 kart, 20.10) plus reguła z 18.10 (karta jednoakapitowa >300 znaków
wchodzi do indeksu). Build czysty.

### Inspekcja adresów przez API Search Console

| Adres | Werdykt | coverageState | Crawl | Wiek |
|---|---|---|---|---:|
| `/` | PASS | Submitted and indexed | 20.10 | 6 dni |
| `/artykuly/` | PASS | Submitted and indexed | 11.10 | **15 dni** |
| `/artykuly/lego-11390-dragon-ball-shenron-goku-premiera/` | PASS | Submitted and indexed | **21.10** | 5 dni |
| `/serie/` | PASS | Submitted and indexed | **25.10** | 1 dzień |
| `/wycofania/` | PASS | Submitted and indexed | **25.10** | 1 dzień |
| `/ekskluzywne/` | PASS | Submitted and indexed | **25.10** | 1 dzień |
| `/promocje-lego/` | PASS | Submitted and indexed | **26.10** | 0 dni |
| `/serie/marvel/` | PASS | Submitted and indexed | 11.09 | **45 dni** |
| `/zestaw/10280/` | PASS | Submitted and indexed | 11.09 | **45 dni** |
| `/zestaw/11208/` | **NEUTRAL** | **URL is unknown to Google** | — | — |

**Cztery huby działów, które tydzień temu stały na 15.09–29.09, zostały odwiedzone
25–26.10.** I tu uczciwość wymaga jednego zdania: pierwsze poniedziałkowe zgłoszenie ze
znacznikiem ODŚWIEŻENIE powstało dziś o 01:57, Cowork klika je o 10:24 — a Google był na
`/serie/`, `/wycofania/` i `/ekskluzywne/` **w sobotę 25.10**. To nie jest skutek decyzji 1;
to Google sam. Co zadziałało — nie wiem; kandydaci to zmiana treści tych stron (Piotr,
karty) i nowy `lastmod` w mapach. Dzisiejsza kolejka ma w związku z tym tylko trzy
odświeżenia (`/promocje-lego/` — odwiedzone dziś o 04:08, już po wygenerowaniu kolejki —
`/aktualnosci/`, `/artykuly/`), bo reszta jest świeża; **mechanizm sprawdzi się dopiero,
gdy działy znowu się zestarzeją.**

Premiera 11390 (Dragon Ball), opublikowana 20.10, w indeksie 21.10 — piąty tydzień z rzędu
„nowy tekst w ciągu doby". Dwa adresy stoją na 11.09 (45 dni): `/serie/marvel/`
i `/zestaw/10280/` — strony serii nie są w liście działów do odświeżania; jeśli
w przyszłym tygodniu nadal będą na 11.09, dopiszę `/serie/<slug>/` do mechanizmu
jako propozycję.

`/zestaw/11208/` **cofnął się** z „wykryta – niezindeksowana" na „adres nieznany Google",
choć jest w sitemapie i jest indeksowalny. Kolejka łapie ten stan i zgłosi go sama.

`sitemap-priorytet.xml` — zamknięte, nie wracam.

---

## Kontrola linków sklepowych

Wykonana przez Łowcę o 08:51 PL (`materialy/kontrola-linkow-2026-10-26.md`) — **43 minuty
przed moim startem**. Próba 150 linków, **19 273 w całości (+125)**, martwych: **0**.

| Sklep | w próbie | żywe | martwe | blokada sklepu | nierozstrzygnięte |
|---|---:|---:|---:|---:|---:|
| planetaklockow | 54 | 54 | 0 | 0 | 0 |
| ceneo | 40 | 40 | 0 | 0 | 0 |
| smyk | 22 | 22 | 0 | 0 | 0 |
| lidl | 7 | 7 | 0 | 0 | 0 |
| mediamarkt | 2 | 2 | 0 | 0 | 0 |
| lego | 5 | 0 | 0 | 5 | 0 |
| allegro | 5 | 0 | 0 | 3 | 2 |
| empik | 5 | 0 | 0 | 5 | 0 |
| xkom | 5 | 0 | 0 | 5 | 0 |
| mediaexpert | 5 | 0 | 0 | 5 | 0 |

**O 25 linkach ze 150 (16,7%) nie wolno powiedzieć „OK"** — tydzień temu 46 (31%).
Spadek ma jedną przyczynę: x-kom wszedł na listę sklepów blokujących (decyzja z 19.10)
i zamiast 26 swobodnych losowań dostał 5 kontrolnych; zwolnione 21 miejsc poszło do Smyka
(13 → 22), Planety (40 → 54) i Lidla (3 → 7). O pięciu blokujących sklepach mówi teraz
kontrola miesięczna w przeglądarce — pierwszy wynik z 20.10: 19/20 żywych, 1 zakończona
oferta Allegro z bieżącego feedu.

**Zadanie dla `empik-redirects.mjs --usun-martwe`: brak.**

---

## TOP artykuły

**Po kliknięciach afiliacyjnych** (polski ruch do sklepu): dwa artykuły po jednym
kliknięciu — `/artykuly/x-kom-black-weeks-2026-lego/` i `/artykuly/media-expert-kod-lego-pazdziernik-2026/`
(ten drugi przez ChatGPT). Reszta polskiego ruchu: huby 29, `/promocje-lego/` 3 (wszystkie
przez ChatGPT), deal 76449 i `/wycofania/` po 1.

**Po Google:** trzy artykuły po jednym kliknięciu (BAM październik, kod Media Expert na
pozycji 2,2, ranking kalendarzy adwentowych) — patrz wyżej.

W tym tygodniu weszło **dziesięć nowych tekstów**: premiera 11390 (Dragon Ball), recenzje
42676 i 75439, dwa teksty historyczne (6391 Cargo Center, Paradisa), zapowiedź Daft Punk
(Ideas), upominek 40889 od 28.10, upominki LEGO.pl (30717/40916/40765), przecieki Ninjago
i Star Wars na styczeń 2027. Najszybszy efekt: premiera 11390 w indeksie po dobie,
na pozycji 2 przy jednym wyświetleniu. **Teksty dealowe i kodowe zbierają zarówno
kliknięcia z Google, jak i afiliacyjne; historyczne i recenzje jeszcze nic** — za wcześnie
na wniosek, zbyt spójne, żeby tego nie zapisać.

---

## Trzy decyzje na ten tydzień

### 1. Referer bez ukośnika = bot *(Marek, worker)*
17 kliknięć spoza Polski jako „human", 10 z refererem `https://tylkoklocki.pl` bez
ukośnika, 0 polskich ze strony głównej. Jedna linia w `src/worker.js`: surowy referer
równy dokładnie `https://tylkoklocki.pl` lub `https://www.tylkoklocki.pl` → bot.
Czytelnikowi nic to nie zmienia (przeglądarka zawsze dokleja ukośnik). Worker = pytam
przed pushem. **Zrobić:** zgoda. **Kto:** Marek.

### 2. Pytanie do Performers *(Marek)*
Dwa tygodnie: 29 → 18 i 18 → 12. Jedna trzecia kliknięć do Media Expertu nie dochodzi
do ich licznika; przy 387 kliknięciach i 0 konwersji w 60 dni to jedyna sieć, w której
nie wiemy nawet, czy jesteśmy liczeni. **Zrobić:** mail do supportu Performers z obiema
parami liczb i pytaniem o deduplikację — albo decyzja, żeby poczekać trzeci tydzień.
**Kto:** Marek.

### 3. Kontroler 09:30 → 09:35 *(Marek)*
Jedyna kolizja w harmonogramie, zrobiona przeze mnie 19.10. **Zrobić:** zgoda; zmianę
crona i wzmianki w repo robię sam. **Kto:** Marek.

---

## Czego w tym raporcie nie ma

- **Ręcznego odczytu paneli Allegro, Planety Klocków i SalesMasters** — decyzja 22.09; SalesMasters
  stoi jako pozycja Marka z 19.10 (stawka x-komu).
- **Mnożnika do 20 000 zł** — cel na 2027.
- **Nowego odczytu liczby zaindeksowanych** — panel ma 837 z 12.10; prośba w „Kto co robi".
- **Odpowiedzi, dlaczego Google odwiedził działy 25.10** — nie wiem i nie zgaduję; wiem tylko,
  że nie był to nasz poniedziałkowy mechanizm, bo ten ruszył dzień później.
- **Wyjaśnienia rozjazdu z Performers** — to pytanie do nich, decyzja 2.
- **Pierwszego maila „Zadania bez właściciela" z dzisiaj** — poszedł z listą z 19.10 przez
  mój błąd; obowiązuje poprawka (`01a17760`).
