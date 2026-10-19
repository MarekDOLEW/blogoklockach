# Raport Kontrolera — 19.10.2026 (poniedziałek)

> **Filtr botów trzyma.** Poprawka workera `1c663ad` weszła 12.10 po południu i od
> tej godziny do sieci afiliacyjnych nie poszło ani jedno sztuczne kliknięcie:
> wszystkie trzy podejrzane wpisy z tego tygodnia mają znacznik czasu **przed**
> wdrożeniem. Tydzień temu było 689 sztucznych kliknięć oznaczonych jako „human";
> dziś 61 kliknięć ludzkich, z czego 54 z Polski. Pierwszy tydzień od wdrożenia
> pomiaru, w którym liczby EPC są zbudowane na czystym ruchu.

> **Druga rzecz: kamień 4 ma nowy odczyt, którego w zeszłym tygodniu nie miałem.**
> Cowork odczytał panel GSC 09.10 — **831 zaindeksowanych** wobec 807 z 18.09.
> Wpis stanął w dzienniku 12.10 o 14:20, czyli pięć godzin po zamknięciu
> poprzedniego raportu, w którym napisałem „brak pomiaru, 20 dni". Kamień 4
> ruszył w górę i nie stoi.

---

## Kto co robi

**Zrzuty Empiku i x-komu stoją na 12.10 — siódmy dzień; Empik 4 394 ceny, x-kom 735, obie partie z tej samej daty.**
**Mamy?** — częściowo: ceny są w danych serwisu, ale tygodniowe; przypomnienie poszło dziś o 08:15.
**Zrobić:** — uruchomić skill „klocki-zrzuty-tygodniowe" (Empik + x-kom w jednym przebiegu) i wrzucić `lego-empik.json` oraz `lego-xkom.json` do sesji Code.
**Kto:** — Marek (przeglądarka)

**Liczba zaindeksowanych stron z panelu GSC ma odczyt z 09.10 (831) — w najbliższy poniedziałek minie 17 dni, a API tej liczby nie podaje.**
**Mamy?** — nie: ostatni odczyt 09.10.2026 przez Coworka (831 zaindeksowanych, 3 181 nie).
**Zrobić:** — odczytać raport „Strony" w panelu GSC przed 26.10 (zaindeksowane + podział niezaindeksowanych).
**Kto:** — Marek (panel) albo Cowork (panel)

**Łowca wypchnął dziś kontrolę linków o 09:14 PL — 14 minut po moim starcie; tabelę mam tylko dlatego, że pobrałem repo drugi raz w trakcie przebiegu.**
**Mamy?** — częściowo: plik `materialy/kontrola-linkow-2026-10-19.md` jest w repo (commit `ae759a9`), ale powstał po godzinie, o której go czytam.
**Zrobić:** — przesunąć Łowcę z 08:30 na 08:00 PL albo Kontrolera z 09:00 na 09:30 (panel Routines, jeden z dwóch triggerów: `trig_019xWfJ67XhPdnX6GknSYrb3` lub `trig_01KB8XkPcHyvc5kCRKEKYjri`).
**Kto:** — Marek (panel)

**Decyzja 1 z sekcji „Trzy decyzje": crawl działów — `/serie/` i `/wycofania/` nietknięte przez Googlebota od 15.09 (34 dni), a `/wycofania/` to największe źródło wyświetleń w serwisie.**
**Mamy?** — częściowo: runner „Kolejka indeksacji 01:57" działa codziennie, ale bierze wyłącznie huby `/zestaw/`.
**Zrobić:** — zgoda albo odmowa na oddanie 8 z 10 miejsc w kolejce jednego dnia w tygodniu na huby działów (`/serie/`, `/wycofania/`, `/ekskluzywne/`, `/promocje-lego/`, `/przecieki/`, `/prezentowniki/`, `/aktualnosci/`, `/artykuly/`).
**Kto:** — Marek (decyzja)

**Decyzja 2: kryterium kamienia 2 chwieje się — Ceneo ma już 3 transakcje, ale po 0,08 EUR każda, więc formalnie spełnia „próbę większą niż jedna transakcja", a sensu nie wnosi.**
**Mamy?** — nie: kryterium nie jest nigdzie zapisane, przez co trzeci raport z rzędu podaje „1 sklep", choć liczba transakcji mówi „2".
**Zrobić:** — ustalić próg i wpisać go do `afiliacje_rejestr.json` → `_meta.decyzje`; proponuję: transakcja liczy się do kamienia 2, gdy obrót ≥ 10 EUR (wtedy Ceneo nie liczy się, a Empik i Lidl tak).
**Kto:** — Marek (decyzja)

**Decyzja 3: kontrola linków milczy o 46 ze 150 sprawdzanych adresów (31%) — x-kom sam wniósł 26 pozycji, wszystkie w kolumnie „blokada sklepu".**
**Mamy?** — częściowo: kontrola co poniedziałek chodzi, ale cztery sklepy odrzucają ruch serwerowy i o nich nie wiemy nic.
**Zrobić:** — decyzja: albo raz w miesiącu Cowork sprawdza w przeglądarce próbę 20 linków (x-kom, Empik, Media Expert, LEGO.com), albo przyjmujemy to jako lukę i zmniejszamy udział tych sklepów w próbie, żeby 150 adresów dawało 150 odpowiedzi.
**Kto:** — Marek (decyzja)

**Eksport listy 220 adresów zwracających 404 w GSC wisi od 12.10 — po noindex (2 284) to największa pojedyncza pozycja wśród niezaindeksowanych.**
**Mamy?** — nie: w dzienniku stoi jako „do odczytu przy następnej okazji".
**Zrobić:** — wyeksportować listę 404 z panelu GSC do repo, żeby Code rozstrzygnął każdy adres (przekierowanie albo zdjęcie z sitemapy).
**Kto:** — Cowork (panel)

**x-komu nie ma w `afiliacje_rejestr.json`, a jego linki są otagowane (`?sm=Y74rgdCO`, 788 wpisów w `redirects.xkom`) i zebrały 7 polskich kliknięć w 30 dni.**
**Mamy?** — częściowo: w rejestrze jest „alto" (SalesMasters, grupa x-kom), ale samego x-komu nie ma, a rejestr jest jedynym źródłem prawdy o sieciach.
**Zrobić:** — dopisać wpis `xkom` do `src/data/afiliacje_rejestr.json` (sieć SalesMasters, parametr `sm=`, status, prowizja, cookie) — jeden wpis, append-only.
**Kto:** — Code (dane)

**Scout odpalił się dziś o 05:10 ze statusem SUCCEEDED, ale nie zostawił commita — pierwszy taki dzień od 15.10.**
**Mamy?** — nie wiem: z tej sesji widzę tylko brak commita, nie treść przebiegu.
**Zrobić:** — sprawdzić przy następnym przebiegu, czy brak commita się powtarza (dwa dni z rzędu = alarm, nie cisza w danych).
**Kto:** — Kontroler (następny przebieg)

Pozycje zebrane z dziennika — osobna sekcja „Zadania bez właściciela" niżej; mail
do Marka i Piotra wyszedł dziś (5 pozycji z dziennika + 3 z tego raportu).

---

## Diagnoza środowiska — 2026-10-19 07:09 UTC

**Repo**
- gałąź `kontroler` @ `fe0d313`, origin/main @ `fe0d313` *(w trakcie przebiegu doszedł `ae759a9` — Łowca; przebazowałem)*
- 0 commitów ponad main, 0 do nadrobienia, 0 plików niezacommitowanych
- node_modules ✓, astro ✓

**Zmienne środowiska**
- ustawione: 14/14 — komplet (same nazwy, wartości nie są drukowane)

**Dane**
- oferty_feed zaktualizowane: 2026-10-18 *(po przebazowaniu 2026-10-19)*
- rejestr afiliacji zaktualizowany: 2026-10-12
- import Empiku: 2026-10-12 — Zrzuty 12.10: Empik (4 394 ceny, 1 minimum) i x-kom (735 cen, 5 minimów)
- oferty: allegro 6182, empik 4394, ceneo 1725, planetaklockow 1101, lego 983, xkom 735, mediaexpert 730, smyk 661, lidl 101, mediamarkt 55

**Dostępy** *(realne wywołania, nie deklaracje)*
- cloudflare: **ok** (kliknięć 7 dni: 2 184) · r2: **ok** (kubełek `tylkoklocki-obrazy`)
- tradedoubler: **ok** (Media Markt ACCEPTED, Allegro ACCEPTED, Empik ACCEPTED, Lidl ACCEPTED, Ceneo ACCEPTED, Ceneo CPS ACCEPTED, RTV EURO AGD REJECTED)
- search_console: **ok** (`sc-domain:tylkoklocki.pl`) · adtraction: **ok** · performers: **ok**
- produkcja: **ok** (200) · link sklepu z przeglądarki: **ok** (302) · firecrawl: **ok** (1 002 kredyty)

Pierwszy raz od 22.09 wszystkie dziesięć pozycji „Dostępy" wraca `ok` w jednym
przebiegu.

---

## Cztery kamienie milowe na grudzień 2026

| Kamień | Tydzień temu (12.10) | **Dziś (19.10)** | Kierunek |
|---|---|---|---|
| **1. Pierwsza zatwierdzona prowizja w każdej z 3 sieci z API** | 1 z 3 — Tradedoubler | **1 z 3 — Tradedoubler** (druga zatwierdzona transakcja, drugi program) | bez zmian w liczbie sieci, **w górę wewnątrz TD** |
| **2. EPC per sklep na próbie > 1 transakcji** | 1 sklep (Empik) | **1 sklep (Empik)** — kryterium do ustalenia, patrz decyzja 2 | bez zmian |
| **3. Kliknięcia z Polski dziennie** | 5,0 | **7,7** (7 dni) / 6,4 (14 dni) / 6,3 (28 dni) | **w górę** |
| **4. Zaindeksowane strony (panel GSC)** | 807 *(dane z 18.09)* | **831** *(odczyt 09.10)* | **w górę, +24** |

### Kamień 1 — druga zatwierdzona transakcja, i to w drugim programie

W oknie 60 dni Tradedoubler ma **7 transakcji i 9,33 EUR**, a pole `zatwierdzone`
stoi na **1 w dwóch programach**: Lidl (1,86 EUR, obrót 46,52 EUR, stawka 4,00%)
i **Empik — nowość w tym tygodniu** (jedna z trzech transakcji Empiku na 7,23 EUR
została potwierdzona; tydzień temu wszystkie trzy były `zatwierdzone: 0`).

Dwie sieci nadal nie mają w historii ani jednej transakcji:
- **Adtraction** (Smyk, Egmont): 0 transakcji w oknie 60 dni, stan API `ok`;
- **Performers** (Media Expert): **1 249 kliknięć w 60 dni, 0 konwersji.**

Uwaga liczbowa, żeby nie zmylić przy czytaniu: w oknie **30 dni** raport pokazuje
`zatwierdzone: 0` dla wszystkich programów, bo transakcja Lidla wypadła z okna,
a potwierdzenie Empiku dotyczy transakcji z września. **Liczbę kamienia czytam
z okna 60-dniowego i piszę to wprost** — kamień pyta „czy kiedykolwiek", nie
„czy w ostatnich 30 dniach".

### Kamień 2 — jeden sklep, ale kryterium trzeba domknąć

| Sklep | Transakcje (60 dni) | Obrót | Prowizja | Zatwierdzone |
|---|---:|---:|---:|---:|
| Empik | 3 | 325,44 EUR | 7,23 EUR | **1** |
| Ceneo.pl | 3 | 0,24 EUR | 0,24 EUR | 0 |
| Lidl Sklep Online | 1 | 46,52 EUR | 1,86 EUR | **1** |

**Formalnie próbę większą niż jedna transakcja mają dwa sklepy, nie jeden** —
Ceneo doszło do trzech transakcji. Tylko że każda z nich to **0,08 EUR obrotu
i 0,08 EUR prowizji**, czyli mikro-rozliczenie Ceneo CPS, a nie zakup; stawka
efektywna wychodzi 100% i nie znaczy nic. Dlatego podaję 1 sklep — tak jak
poprzednie raporty — ale **zgłaszam, że robię to na mocy własnego uznania, a nie
zapisanej reguły**, i proszę o decyzję (decyzja 2). W oknie 7 dni znowu zero
transakcji wartych tej nazwy: jedna, Ceneo, 0,08 EUR. **Trzeci tydzień z rzędu
bez realnej transakcji w którejkolwiek z trzech sieci.**

### Kamień 3 — 7,7 kliknięcia dziennie i pierwszy tydzień na czystym ruchu

| Okno | Kliknięć z Polski | Średnio dziennie |
|---|---:|---:|
| 7 dni | 54 | **7,7** |
| 14 dni | 89 | 6,4 |
| 28 dni | 177 | 6,3 |

Poprzedni tydzień (8–14 dni wstecz) dał **35** — dokładnie tyle, ile raportowałem
tydzień temu, więc oba pomiary się domykają. Tydzień do tygodnia to **+54%**.

Dwa zastrzeżenia, bez których ta liczba kłamie:
1. **okno 28-dniowe stoi na 6,3 i nie drgnęło** (tydzień temu 6,6) — czyli to, co
   widzę, to nadal poziom 6–7 kliknięek dziennie z jednym lepszym tygodniem, a nie
   nowy poziom;
2. **jeden dzień zrobił różnicę: 15.10 to 17 kliknięek**, przy medianie 6 w pozostałe
   dni. Bez 15.10 tydzień wychodzi 5,3 — czyli tyle, ile tydzień temu.

Źródła polskich kliknięć (54): **huby `/zestaw/` 31**, strona główna 13,
artykuły 5, działy 5. **12 z 54 (22%) ma referer z ChatGPT** — tydzień temu 6 z 35
(17%). Google dał w tym samym oknie 1 kliknięcie na stronę.

### Kamień 4 — 831, pierwszy wzrost od 18.09

Odczyt Coworka z 09.10 (wpis w dzienniku 12.10 14:20): **831 zaindeksowanych**
wobec 807 z 18.09, czyli **+24 w trzy tygodnie**. Niezaindeksowanych 3 181, z tego:
**noindex 2 284** (nasza własna reguła dla cienkich hubów — to działa zgodnie
z zamiarem), **wykryta, obecnie niezindeksowana 647** i **404: 220**.

Dwie rzeczy z tego odczytu, które są ważniejsze niż sama liczba:
- **220 adresów zwracających 404** to nie szum, a nikt ich jeszcze nie widział na
  liście — eksport wisi od 12.10 (pozycja dla Coworka w „Kto co robi");
- noindex w `sitemap-zestawy` (239 adresów) **nie wynika z reguły, tylko ze starego
  crawla** — 10365 jest indeksowalny od 10.09, a Google ma jego starą wersję.
  To ta sama przyczyna, co w sekcji o indeksacji: **wąskim gardłem jest częstotliwość
  crawla, nie reguła.**

---

## Harmonogram

**Data odczytu z konta: 19.10, 07:47 CEST — dzisiejsza.** Alarmu o nieprzepisanym
harmonogramie nie ma. Odczyt objął **19 Routines** (tydzień temu 16): 13 zadań
serwisu i 6 pozostałych na tym samym koncie.

**Kolizje: brak** — żadne dwa włączone zadania nie startują w tej samej minucie.

Trzy zadania mają w kolumnie „ostatnie odpalenie" kreskę, i w żadnym przypadku
nie jest to alarm — wszystkie trzy triggery powstały w ostatnich pięciu dniach:
- **Łowca** (`trig_019xWfJ67XhPdnX6GknSYrb3`, utworzony 18.10): odczyt zrobiono
  o 05:47 UTC, a Łowca chodzi o 06:30 UTC — **w repo jest jego commit z 07:14 UTC**
  (`ae759a9`), czyli odpalił się i wypchnął;
- **Kontroler** (`trig_01KB8XkPcHyvc5kCRKEKYjri`, utworzony 13.10): to jest ten przebieg;
- **Dane wt** (`trig_01XjJhujd8FnXsGWAHQeUBqd`, utworzony 14.10): najbliższy przebieg
  wtorek 20.10 05:30.

Weryfikacja przez commity (bo `last_run` zeruje się po odtworzeniu triggera),
7 dni: **Radar 10, Łowca 8, Kolejka indeksacji 7, Scout 6, Wycofania 4, Dane wt 1.**
Każdy runner z pushem zostawił ślad w tygodniu — **prawdziwego alarmu nie ma.**

Jedna rzecz do odnotowania: **Scout odpalił się dziś o 05:10 ze statusem
SUCCEEDED i nie zostawił commita** (ostatni: 18.10 03:14 UTC). Jednorazowy brak
commita jest dopuszczalny — przebieg bez nowości nie ma czego pushować — ale
dwa dni z rzędu będą już alarmem; zapisałem to sobie na następny przebieg.

---

## Archiwum dziennika

`node scripts/archiwum-dziennika.mjs` przeniósł **15 wpisów** starszych niż
14 dni: 9 do `materialy/dziennik-archiwum-2026-09.md` i 6 do nowego
`materialy/dziennik-archiwum-2026-10.md`. `DZIENNIK.md` skrócił się z 1 473 do
1 157 linii (−316). Skrypt nie przerwał.

Trzy wpisy **zatrzymał mimo wieku**, bo mają stan „w toku" — i słusznie:
przebudowa strony głównej (27.09), CRO A–G na przykładach testowych (25.09),
kolejka redakcyjna w XLSX (04.09). Najstarszy z nich stoi już **sześć tygodni**;
jeśli któryś nie jest w toku, powinien dostać linię zamknięcia, bo inaczej
zostanie w dzienniku na zawsze.

---

## Zadania bez właściciela

**5 pozycji z dziennika: 2 dla Piotra, 1 dla Marka, 2 dla Code.** Mail wyszedł
dziś do Marka i Piotra (`kontakt@tylkoklocki.pl`, `piotrmaculewicz@interia.pl`,
id `01a15309`), z trzema pozycjami z tego raportu dopisanymi osobno.

### Piotr (tekst) — 2

**fanklockow.pl · 13.10 — „Minicykle GwP od LEGO® – czy to się opłaca?"**
**Zrobić:** — nowy tekst „Czy warto zbierać gratisy GWP z miniserii LEGO" (evergreen, nie datowany). *Wpis 14.10, RADAR — otwarty 5 dni.*

**faniklockow.pl · 05.10 — LEGO i Sanrio: wieloletnia współpraca, pierwsze produkty w 2027.**
**Zrobić:** — akapit o licencji Sanrio w `/artykuly/historia-licencji-lego-gry-sport-lifestyle/`. *Wpis 06.10, RADAR — otwarty 13 dni; 13.10 zamknięto inną pozycję z tego wpisu, tę zostawiając wprost otwartą.*

### Marek (decyzja) — 1

**fanklockow.pl · 18.10 — cykl tygodniowy „Jakie LEGO «do szafy» w tym tygodniu".**
**Zrobić:** — decyzja, czy wchodzimy w formę cykliczną. *Wpis 19.10, RADAR — z dzisiejszego przebiegu.*

### Code (dane, skrypt) — 2

**`known_sets.json` rozjechał się z `sety.json` (1185 przy 1203 wpisach, trzy dni).**
**Zrobić:** — przy ręcznym dopisaniu zestawu do `sety.json` aktualizować rejestr, albo wpiąć to w skrypt. *Wpis 15.10, SCOUT — otwarty 4 dni; sama dziura zamknięta, otwarta przyczyna.*

**43 zestawy z ceną LEGO z 06.10, choć 922 dostały 13.10; LEGO.pl ma 74 produkty na wyprzedaży.**
**Zrobić:** — sprawdzić, dlaczego `firecrawl-legopl.mjs` → `lego-ceny.mjs` je ominął, i dociągnąć ceny z `/categories/sales-and-deals`. *Wpis 14.10, RADAR — otwarty 5 dni; najbliższa okazja: Dane wt 20.10.*

### Zamknięte w tym tygodniu, więc ich tu nie ma

Dwie pozycje, które tydzień temu byłyby na tej liście, mają już linie zamknięcia:
Proshop przez Awin (→ zamknięte 14.10, decyzja Marka: ponaglimy, gdy wzrośnie
ruch) i 75419 Gwiazda Śmierci (→ zamknięte 14.10: 18 z 19 zestawów dopisanych
do śledzonych). **Mechanizm zamykania działa** — pierwszy tydzień, w którym
widzę, że pozycje z tej listy znikają, a nie tylko dochodzą.

---

## Ruch botów — filtr trzyma

| Rodzaj | Kliknięć | Udział |
|---|---:|---:|
| bot (odrzucony przez filtr) | 2 103 | 96,5% |
| **„human" (przepuszczony do sieci)** | **61** | 2,8% |
| test (nasza własna diagnoza) | 16 | 0,7% |
| nieoznaczone (sprzed 14.09) | 0 | 0% |

Tydzień temu „human" wynosiło 724, z czego 689 było sztuczne. Dziś **61**, i to
jest prawdziwy ruch. Jednocześnie **cały ruch spadł z 16 924 na 2 180** — fala
z 10–11.10 była jednorazowa.

### Trzy podejrzane kliknięcia — wszystkie sprzed wdrożenia poprawki

Sprawdziłem referery po jednym kliknięciu i znacznikach czasu:

| Znacznik czasu | Sklep | Referer | Kraj |
|---|---|---|---|
| 12.10 10:24:55 | empik | `https://tylkoklocki.pl/idz/ceneo/30716` | PE |
| 12.10 07:21:05 | lego | *(pusty)* | US |
| 12.10 09:42:18 | lego | *(pusty)* | US |

**Poprawka `1c663ad` weszła 12.10 po 13:10** (wpis w dzienniku: zgoda Marka D1,
referer musi mieć ukośnik na końcu i nie wskazywać `/idz/`, podrobionego referera
nie ratuje już `Sec-Fetch-Site`). Wszystkie trzy wpisy są **wcześniejsze**. Od
13:10 w dniu 12.10 do teraz **każde kliknięcie oznaczone „human" ma referer
wskazujący realną stronę serwisu** — hub, artykuł, stronę główną albo dział
z ukośnikiem. Dwa kliknięcia spoza Polski po poprawce (17.10 Allegro, 19.10 Media
Expert, oba z referera `https://tylkoklocki.pl/`) mają poprawny referer i nie mam
podstaw nazywać ich botem.

**Nie jest to zasługa spadku ruchu botów — to działanie reguły.** Symulacja
wpisana do dziennika 12.10 dała dokładnie ten wynik: 186/186 kliknięć z Polski
bez zmian, 703 z 751 spoza Polski odrzucone.

### Co boty robią dalej

Odrzucone kliknięcia nadal walą w te same sklepy: Allegro 554, Media Expert 505,
LEGO.com 271, Empik 218, x-kom 169, Ceneo 140. Kraje: **US 477, Brazylia 267**,
Bangladesz 84, Argentyna 78, Niemcy 63, Chiny 63, Singapur 62, Kolumbia 46.
To ruch zatrzymany na naszej granicy — **do sieci afiliacyjnych nie poszedł**.

**Udział „brak-linku": 0 na 61 kliknięć (0,0%)** — piąty tydzień z rzędu.
Znacznik „test" (16 kliknięć, referer `/zestaw/75408/`) to nasza własna diagnoza,
która od 12.10 wysyła nagłówek `x-tk-test` i **nie miesza się już z ludźmi**.

---

## EPC per sklep

Pierwszy tydzień, w którym liczby nie są zanieczyszczone. Kliknięcia: ruch ludzki
z Polski. Prowizje: z API. **Allegro i Planeta Klocków mają EPC modelowe** —
zgodnie z decyzją Marka z 22.09 nie czytamy ich paneli i nie proponuję tego.
Tradedoubler rozlicza w EUR, Performers i Adtraction w PLN — **nie sumuję tego
jedną liczbą.**

| Sklep | Kliki PL 7 dni | Kliki PL 30 dni | Prowizja 30 dni | EPC 30 dni | Podstawa |
|---|---:|---:|---:|---:|---|
| Media Expert | 28 | 74 | 0,00 zł | **0,00 zł** | Performers: 112 klików u nich, 0 konwersji |
| Allegro | 8 | 48 | — | **model** | brak API — tak zostaje |
| Empik | 4 | 20 | 5,83 EUR | **0,29 EUR** | Tradedoubler, 2 transakcje w oknie |
| LEGO.com | 7 | 18 | — | **0,00 z definicji** | brak programu (Rakuten, odmowa 15.09) |
| Smyk | 2 | 12 | 0,00 zł | **0,00 zł** | Adtraction: 0 transakcji |
| Ceneo | 2 | 9 | 0,08 EUR | **0,009 EUR** | Tradedoubler, 1 transakcja (mikro-CPS) |
| Lidl | 2 | 8 | 0,00 EUR w 30 dni | **0,21 EUR w 60 dni** | zatwierdzone 1,86 EUR, transakcja z września |
| x-kom | 1 | 7 | — | **model** | SalesMasters, brak API; brak wpisu w rejestrze |
| Planeta Klocków | 0 | 1 | — | **model** | webePartners 3%, brak API — tak zostaje |
| **Razem** | **54** | **197** | **5,91 EUR** | **0,030 EUR/klik** | 3 sieci z API |

Jedna liczba z tej tabeli ma treść: **Empik, 0,29 EUR za kliknięcie na próbie
20 kliknięć i 2 transakcji.** Przy 197 polskich kliknięciach w 30 dni cały serwis
zarobił 5,91 EUR zmierzone, czyli **3 grosze eurowe na kliknięcie**.

### Media Expert: ich licznik jest teraz NIŻSZY niż nasz

Nowa rzecz, pierwszy raz widoczna po odcięciu botów. W oknie 7 dni **my wysłaliśmy
do Media Expertu 29 kliknięć ludzkich, a Performers zaraportował 18.** Tydzień
temu było odwrotnie (68 u nich wobec 9 naszych polskich) i wyjaśnieniem była fala
botowa. Teraz, na czystym ruchu, **brakuje 11 kliknięek z 29 (38%)**.

Nie stawiam tezy, co to jest — mogą to być ich reguły deduplikacji, mogą być
kliknięcia, które nie dotarły do trackera. Odnotowuję jako rzecz do obserwacji
przy następnym przebiegu: **jeśli różnica utrzyma się przy większej próbie, to
pytanie do Performers**, bo 1 249 kliknięć w 60 dni przy zerowej konwersji przestaje
być tylko złym szczęściem.

---

## Widoczność w Google

| Okres | Kliknięcia | Wyświetlenia | CTR | Pozycja |
|---|---:|---:|---:|---:|
| 7 dni (10–17.10) | **1** | **148** | 0,68% | **22,5** |
| 14 dni (03–17.10) | 2 | 207 | 0,97% | 24,3 |
| Poprzednie 7 dni (z różnicy) | 1 | 59 | — | — |

**Wyświetlenia wzrosły z 59 na 148 — dwa i pół raza, i to jest najmocniejsza
liczba w całym raporcie.** Pozycja średnia poprawiła się z 29,0 na 22,5.
Kliknięcia stoją na 1 i trzymam to, co pisałem 05.10 i 12.10: **przy jednym
kliknięciu tygodniowo wymiar kliknięć w GSC nie mówi nic o kierunku.** Ale
wyświetlenia to już próba, w której 2,5× nie jest szumem.

### TOP podstrony (7 dni)

| Adres | Kliki | Wyświetlenia | Pozycja |
|---|---:|---:|---:|
| `/wycofania/` | **1** | 34 | **7,1** |
| `/` | 0 | 49 | 22,6 |
| `/aktualnosci/` | 0 | 7 | 28,4 |
| `/artykuly/lego-75434-droid-straznik-k-2so-recenzja/` | 0 | 8 | **9,4** |
| `/artykuly/lego-jesien-swieta-2026-premiery/` | 0 | 4 | 12,0 |
| `/artykuly/lego-bam-pazdziernik-2026/` | 0 | 3 | 9,0 |
| `/artykuly/` | 0 | 2 | **5,5** |
| `/artykuly/allegro-black-weeks-2026-lego/` | 0 | 1 | 73,0 |

**`/wycofania/` przerwało pięciotygodniową serię zerowego CTR: jedno kliknięcie
przy 34 wyświetleniach (2,9%).** Dodaję to z ostrożnością — jedno kliknięcie to
jedno kliknięcie — ale od pięciu tygodni raportowałem tam zero przy najwyższej
liczbie wyświetleń w serwisie i pozycji 7, więc zmiana jest warta nazwania.
**I ma drugie dno: Google nie odwiedził tej strony od 15.09**, czyli kliknięcie
przyszło na wersję sprzed poprawek tytułu i opisu z 30.09.

Strona główna: 49 wyświetleń (tydzień temu 13), pozycja 22,6 (tydzień temu 55,1)
— wraca na węższe frazy po tygodniu na szerokich i konkurencyjnych.

TOP frazy to nadal prawie wyłącznie frazy cudzysłowowe o niskiej liczbie
wyświetleń: `„w smyku"` 16 wyświetleń (pozycja 9,3), `„las odkrywców"` 8 (4,1),
`„star wars" „andor"` 8 (9,4), `„black weeks"` 6 (5,8). Fraz zakupowych
z ruchem („klocki lego promocje", pozycja 97; „allegro black week", 73) nadal
nie dotykamy.

---

## Indeksacja

### Liczby z builda

| Miara | 05.10 | 12.10 | **19.10** | Zmiana t/t |
|---|---:|---:|---:|---:|
| Huby `/zestaw/` w buildzie | 9 789 | 9 803 | **9 830** | +27 |
| Huby w `sitemap-zestawy.xml` | 1 286 | 1 291 | **1 375** | **+84** |
| Udział zgłoszonych | 13,1% | 13,2% | **14,0%** | +0,8 pkt |

Build czysty: **10 007 stron w 45 s**. Przyrost zgłoszonych hubów (+84) jest
siedemnaście razy większy niż tydzień temu (+5) i ma konkretną przyczynę:
18.10 reguła indeksacji zaczęła liczyć długość opisu, a nie liczbę akapitów
(`d96ae1f`) — 49 małych zestawów z jednoakapitową kartą weszło do sitemapy.
**To pierwsza w tym miesiącu zmiana, która ruszyła udział zgłoszonych o więcej
niż 0,1 punktu.**

### Inspekcja adresów przez API Search Console

**9 z 10 adresów PASS** — jak tydzień temu, z tym samym jednym wyjątkiem.

| Adres | Werdykt | coverageState | Crawl | Wiek |
|---|---|---|---|---:|
| `/` | PASS | Submitted and indexed | 11.10 | 8 dni |
| `/artykuly/` | PASS | Submitted and indexed | 11.10 | 8 dni |
| `/artykuly/lego-11388-wenecka-okolica-premiera/` | PASS | Submitted and indexed | **17.10** | **2 dni** |
| `/promocje-lego/` | PASS | Submitted and indexed | 29.09 | **20 dni** |
| `/ekskluzywne/` | PASS | Submitted and indexed | 22.09 | **27 dni** |
| `/serie/` | PASS | Submitted and indexed | 15.09 | **34 dni** |
| `/wycofania/` | PASS | Submitted and indexed | 15.09 | **34 dni** |
| `/serie/marvel/` | PASS | Submitted and indexed | 11.09 | **38 dni** |
| `/zestaw/10280/` | PASS | Submitted and indexed | 11.09 | **38 dni** |
| `/zestaw/11208/` | **NEUTRAL** | **Discovered – currently not indexed** | — | — |

**Na plus:** premiera 11388 (Wenecka okolica), opublikowana 16.10, jest w indeksie
**następnego dnia** — czwarty tydzień z rzędu, gdy nowy tekst wchodzi w ciągu doby.
To jedyny mechanizm w tym serwisie, który działa bez zarzutu.

**Sześć adresów ma crawl starszy niż 14 dni i trzeba to wypisać wprost:**
`/serie/marvel/` i `/zestaw/10280/` — 38 dni; `/serie/` i `/wycofania/` — 34 dni;
`/ekskluzywne/` — 27 dni; `/promocje-lego/` — 20 dni. **Tydzień temu było pięć
i wszystkie te same adresy postarzały się dokładnie o siedem dni** — czyli
Googlebot nie zajrzał na żadną z nich przez cały tydzień. Wzór trzyma trzeci
tydzień i się pogłębia: **nowe teksty wchodzą w ciągu doby, huby działów
starzeją się bez końca.**

`/wycofania/` zostaje najdroższym przypadkiem: największe źródło wyświetleń
(34), pozycja 7,1, pierwsze kliknięcie od pięciu tygodni — **i wersja z 15.09
w indeksie.** Dlatego decyzja 1 dotyczy właśnie kolejki indeksacji dla działów.

`/zestaw/11208/` — jedyny adres poza indeksem, trzeci tydzień w stanie
„Discovered – currently not indexed", bez crawla.

`sitemap-priorytet.xml` nie ma ani w repo, ani w GSC — zamknięte 22.09, nie wracam.

---

## Kontrola linków sklepowych

Wykonana przez Łowcę, plik `materialy/kontrola-linkow-2026-10-19.md` (commit
`ae759a9`, 09:14 PL — 14 minut po moim starcie). Próba 150 linków z
`redirects.json`, **19 148 w całości, o 254 więcej niż tydzień temu.**
Martwych: **0.**

| Sklep | w próbie | żywe | martwe (404/410) | blokada sklepu | nierozstrzygnięte |
|---|---:|---:|---:|---:|---:|
| ceneo | 46 | 46 | 0 | 0 | 0 |
| planetaklockow | 40 | 40 | 0 | 0 | 0 |
| smyk | 17 | 17 | 0 | 0 | 0 |
| mediamarkt | 1 | 1 | 0 | 0 | 0 |
| xkom | 26 | 0 | 0 | **26** | 0 |
| allegro | 5 | 0 | 0 | 0 | 5 |
| empik | 5 | 0 | 0 | 5 | 0 |
| mediaexpert | 5 | 0 | 0 | 5 | 0 |
| lego | 5 | 0 | 0 | 5 | 0 |

**O 46 linkach ze 150 (31%) nie wolno powiedzieć „OK"** — 41 w kolumnie „blokada
sklepu" (x-kom, Empik, Media Expert, LEGO.com odrzucają ruch serwerowy)
i 5 nierozstrzygniętych (Allegro). Tydzień temu było 35 (23%), dwa tygodnie temu
15%. **Trzeci tydzień wzrostu z rzędu i przyczyna jest ta sama: x-kom rośnie
w próbie** (3 → 15 → 26 pozycji), bo rośnie w `redirects.json`, a w całości stoi
w „blokadzie".

Te cztery blokujące sklepy zebrały **36 z 54 polskich kliknięek (67%)** — czyli
o linkach, w które czytelnicy faktycznie klikają, kontrola mówi najmniej.
To treść decyzji 3.

**Zadanie dla `empik-redirects.mjs --usun-martwe`: brak** — żadnego linku Empiku
nie dało się sprawdzić, więc nie ma podstawy do usuwania czegokolwiek.

---

## TOP artykuły

**Po kliknięciach afiliacyjnych** (ruch polski, który poszedł do sklepu):
jedyny artykuł z kliknięciami to **`/artykuly/media-expert-kod-lego-pazdziernik-2026/`
— 5 kliknięć** (3 z refererem ChatGPT, 2 bez). Tydzień temu najlepszy artykuł
miał 1 kliknięcie. Reszta polskiego ruchu wyszła z hubów (31), strony głównej (13)
i działów (5: `/promocje-lego/` 2, `/wycofania/` 2, strona dealowa 75389 — 1).

**Po widoczności w Google:** recenzja `/artykuly/lego-75434-droid-straznik-k-2so-recenzja/`
— 8 wyświetleń, pozycja 9,4; `/artykuly/lego-jesien-swieta-2026-premiery/` — 4
wyświetlenia, pozycja 12; `/artykuly/lego-bam-pazdziernik-2026/` — 3, pozycja 9.
**Recenzja 75434, o której tydzień temu pisałem „jeszcze nie zbiera wyświetleń",
zbiera je teraz najlepiej z artykułów** — tydzień był potrzebny, nie więcej.

W tym tygodniu weszły trzy nowe teksty Piotra: premiera 11388 (Wenecka okolica)
oraz recenzje 60447 (Górska terenówka) i 11505 (Grzyby leśne). **Żaden nie ma
jeszcze wyświetleń** — 11388 jest w indeksie od 17.10, więc jest za wcześnie
na jakikolwiek wniosek.

Jedna obserwacja, która wychodzi dopiero przy zestawieniu dwóch rzędów liczb:
**tekst dealowy z kodem rabatowym zarobił 5 kliknięć afiliacyjnych przy zerowej
widoczności w Google, a recenzja zarobiła najwyższą widoczność przy zerze
kliknięek.** Dwa różne mechanizmy, obie potrzebne, ale warto wiedzieć, że
w tym tygodniu ruch do sklepów przyszedł z ChatGPT i hubów, nie z Google.

---

## Trzy decyzje na ten tydzień

### 1. Kolejka indeksacji dla hubów działów *(Marek)*

**Co się stało:** sześć hubów działów ma crawl starszy niż 14 dni, a `/serie/`
i `/wycofania/` stoją na 15.09 — 34 dni. Przez cały tydzień żaden z nich nie
został odwiedzony. Jednocześnie `/wycofania/` daje najwięcej wyświetleń w serwisie
i w tym tygodniu dało pierwsze kliknięcie od pięciu tygodni — na wersji sprzed
poprawek z 30.09.

**Propozycja:** jeden dzień w tygodniu runner „Kolejka indeksacji 01:57" oddaje
8 z 10 miejsc hubom działów (`/serie/`, `/wycofania/`, `/ekskluzywne/`,
`/promocje-lego/`, `/przecieki/`, `/prezentowniki/`, `/aktualnosci/`, `/artykuly/`)
zamiast hubom `/zestaw/`. Koszt: 8 miejsc w kolejce raz w tygodniu, czyli
ok. 11% tygodniowego limitu zgłoszeń. Zysk: huby działów przestają starzeć się
bez końca.

**Czego nie proponuję:** zwiększenia dziennego limitu ani zgłaszania ręcznego —
limit jest po stronie Google, a ręczne zgłaszanie robi Cowork i to jest jego
czas, nie nasz.

**Zrobić:** zgoda albo odmowa. **Kto:** Marek (decyzja).

### 2. Kryterium kamienia 2 — czy mikro-CPS Ceneo się liczy *(Marek)*

**Co się stało:** Ceneo doszło do 3 transakcji w 60 dniach, czyli formalnie
spełnia „próbę większą niż jedna transakcja". Tylko że każda z nich to 0,08 EUR
obrotu. Trzeci raport z rzędu podaje „1 sklep" na mocy mojego uznania, a nie
zapisanej reguły — i to jest dokładnie ten rodzaj luzu, przez który liczby
w raportach zaczynają się rozjeżdżać między tygodniami.

**Propozycja:** do kamienia 2 liczy się transakcja z obrotem ≥ 10 EUR. Wtedy
Empik (325,44 EUR / 3 transakcje) i Lidl (46,52 EUR / 1) są w grze, Ceneo (0,24 EUR
/ 3) nie, a kamień ma dziś wartość **1 sklep** i nie zależy od tego, kto pisze
raport.

**Zrobić:** ustalić próg i wpisać do `afiliacje_rejestr.json` → `_meta.decyzje`.
**Kto:** Marek (decyzja).

### 3. Linki sklepów blokujących ruch serwerowy *(Marek)*

**Co się stało:** 46 ze 150 sprawdzanych linków (31%) nie daje odpowiedzi, trzeci
tydzień wzrostu z rzędu (15% → 23% → 31%). Przyczyna jest arytmetyczna: x-kom ma
już 26 pozycji w próbie i w całości stoi w „blokadzie sklepu". Te cztery sklepy
zebrały 67% polskich kliknięć, czyli kontrola milczy akurat o linkach, w które
czytelnicy klikają.

**Dwie drogi, wybór należy do Marka:**
- **A — Cowork raz w miesiącu:** próba 20 linków (x-kom, Empik, Media Expert,
  LEGO.com) sprawdzana w przeglądarce, bo przeglądarka przechodzi tam, gdzie
  serwer dostaje 403. Koszt: jeden przebieg Coworka w miesiącu. Zysk: wiemy,
  czy te linki żyją.
- **B — przyjmujemy lukę i naprawiamy arytmetykę:** losowanie próby przestaje
  brać sklepy blokujące, więc 150 adresów daje 150 odpowiedzi, a o blokujących
  mówimy wprost „nie sprawdzamy". Koszt: zero. Zysk: liczba „martwych: 0" przestaje
  być myląca.

**Czego nie proponuję:** wchodzenia na linki trackingowe, żeby obejść blokadę —
to sztucznie nabite kliknięcie w sieci afiliacyjnej i dokładnie ten rodzaj
ruchu, przed którym broni filtr z sekcji o botach.

**Zrobić:** wybrać A albo B. **Kto:** Marek (decyzja).

---

## Czego w tym raporcie nie ma

- **Ręcznego odczytu paneli Allegro i Planety Klocków** — decyzja Marka z 22.09;
  ich EPC zostaje modelowe i nie proponuję tego ponownie.
- **Mnożnika do 20 000 zł** — cel przesunięty na 2027 (decyzja Marka 22.09).
- **Liczby zaindeksowanych stron z dzisiejszego dnia** — API jej nie podaje,
  a panel ma odczyt z 09.10 (831). Prośba o nowy odczyt stoi w „Kto co robi",
  bo 26.10 minie 17 dni.
- **Listy 220 adresów 404** — eksport z panelu GSC wisi od 12.10; bez niej nie
  umiem powiedzieć, czy to stare slugi, czy coś, co psuje się dalej.
- **Odpowiedzi, dlaczego Performers widzi 18 kliknięć tam, gdzie my wysłaliśmy 29** —
  to pierwszy tydzień, w którym tę różnicę da się w ogóle zobaczyć bez botów;
  jeden tydzień to za mało, żeby pisać do sieci.
- **Przebiegu Scouta z dzisiejszego rana** — widzę status SUCCEEDED i brak
  commita, nie widzę treści. Sprawdzę za tydzień.
- **Oceny, czy wzrost wyświetleń w Google (59 → 148) utrzyma się** — to jeden
  tydzień na jednej próbie.
