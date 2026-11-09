# Raport Kontrolera — 09.11.2026 (poniedziałek)

> **Trzy rzeczy z tego tygodnia.** Pierwsza: **Media Expert konwertuje** — Performers ma
> 10 oczekujących konwersji z 60 dni (14 764 zł sprzedaży, 268 zł prowizji), a raporty do 07.11
> liczyły tylko zatwierdzone i pokazywały zero. Żadna z tych konwersji nie jest jeszcze
> zatwierdzona, najstarsza czeka od 03.09 (67 dni). Druga: reguła z 02.11 zadziałała —
> kliknięć spoza Polski ze strony głównej przepuszczonych jako „human": **40 → 0**, przy fali
> 13 301 botów w jeden dzień (05.11), z której do sieci nie przeszło nic. Trzecia: panel GSC
> odczytany 06.11 — **903 zaindeksowane** (837 przy poprzednim odczycie), pierwszy nowy odczyt
> od czterech tygodni.

> Na minusie: ruch z Polski spadł z 73 do **48** kliknięć (10,4 → 6,9 dziennie) po tygodniu
> z pikiem 26–27.10; **Wycofania odpaliły się dziś o 06:10 ze statusem SUCCEEDED, ale nie
> zostawiły ani commita, ani wpisu** — pierwszy taki poniedziałek; zrzuty Empiku i x-komu
> znowu nie weszły do 09:40 (tydzień temu weszły we wtorek).

---

## Kto co robi

**Decyzja 1: 49 zestawów z potwierdzonym wycofaniem w 2026 roku nie ma w rejestrze (`sety.json`, `ceny_baza.json`) — pozycja Radaru z 31.10 czeka 9 dni, a do Black Friday zostało 18.**
**Mamy?** — częściowo: huby pokazują ceny z feedu, ale bez rejestru nie ma śledzonego minimum, alertu ani wejścia do „Dziś w dobrej cenie" — a wycofywane zestawy to w Black Friday najczęściej szukane okazje.
**Zrobić:** — zgoda na dopisanie tych 49 do rejestru przed 20.11 (lista w pozycji Radaru 31.10, `materialy/wycofania-poza-rejestrem-2026-10-31.md`); osobna, późniejsza decyzja o 107 zestawach bez rejestru ze Scouta 30.10.
**Kto:** — Marek (decyzja)

**Decyzja 2: 10 konwersji Media Expertu w Performers czeka na zatwierdzenie, najstarsza od 03.09 (67 dni); 08.11 zdecydowałeś „czekamy, nie wysyłamy".**
**Mamy?** — tak: `prowizje-raport.mjs` od 07.11 pokazuje `konwersje_wg_statusu`; termin zatwierdzania Performers/Media Expertu nie jest nam znany.
**Zrobić:** — ustalić termin: jeśli do poniedziałku 23.11 nic z tych 10 nie zmieni statusu (najstarsza będzie miała 81 dni), Kontroler przypomni i mail idzie — pytanie tylko o termin zatwierdzania i o brakującą 1/3 kliknięć, nie o „zero konwersji".
**Kto:** — Marek (decyzja: zgoda na termin 23.11)

**Decyzja 3: decyzje D5–D9 z audytu 06.11 (cotygodniowy mail z okazjami, prezentowniki według zainteresowań, Piotr tylko przez GitHub, maile runnerów → poniedziałek + piątek, strony autorów) wchodzą w życie z odpowiedzią domyślną w środę 11.11.**
**Mamy?** — tak: `materialy/audyt-2026-11-06.md`, sekcja „Decyzje", każda z domyślną odpowiedzią „tak".
**Zrobić:** — do środy powiedzieć, jeśli któraś ma być inna niż domyślna; brak odpowiedzi = Code wdraża domyślne po Black Friday (D5 od czwartku).
**Kto:** — Marek (decyzja)

**Wycofania (pon 06:10) mają w harmonogramie `09.11 06:10 SUCCEEDED`, ale w repo nie ma commita „Wycofania: aktualizacja 2026-11-09" (poprzednie poniedziałki: 19.10, 26.10, 02.11 — zawsze był) ani linii „→ Wycofania 2026-11-09" w dzienniku.**
**Mamy?** — nie: SUCCEEDED w tabeli znaczy „prompt dostarczony", nie „przebieg zrobił swoje"; `wycofania.json` ostatnio zmieniony 02.11.
**Zrobić:** — otworzyć sesję Wycofań na koncie i sprawdzić, co zrobiła 09.11 (odmowa? błąd pushu? nic do zmiany?); jeśli nic nie zrobiła — odpalić ręcznie.
**Kto:** — Marek (panel)

**Zrzuty Empiku i x-komu znowu nie weszły do 09:40 PL — tydzień temu weszły we wtorek 03.11 07:07; import w hubach ma dziś 6 dni.**
**Mamy?** — częściowo: ceny z 03.11 (4 518 Empik, 700 x-kom) stoją jako aktualne, w Black Weeks x-komu zmieniają się co tydzień.
**Zrobić:** — zrzut dziś na Macu (skill `klocki-zrzuty-tygodniowe`); albo decyzja, żeby przypomnienie (pon 08:15) i zrzut przestawić na wtorek rano, skoro poniedziałek drugi raz nie wychodzi.
**Kto:** — Marek (komputer)

**`diagnoza.mjs` zgłasza co tydzień „ROZJAZD Z REJESTREM": Tradedoubler zwraca Ceneo jako ACCEPTED, a rejestr ma status `zakonczony` (program 385881 zamknięty 03.11, linki idą bezpośrednio na ceneo.pl od `834e724`).**
**Mamy?** — tak: rejestr ma rację, API TD nie zmienia statusu zakończonego programu.
**Zrobić:** — w `scripts/diagnoza.mjs` uznać parę „TD ACCEPTED / rejestr `zakonczony`" za zgodną (jedna linia w porównaniu), żeby alarm wracał tylko przy prawdziwym rozjeździe.
**Kto:** — Code (skrypt)

**11381 Jaguar E-Type: karta mówi „1 lipca 2026", recenzja i `sety.json` „1 sierpnia" — pozycja z 02.11, `swiezosc-tekstow.mjs` pokazuje ją drugi tydzień.**
**Zrobić:** — jak 02.11: potwierdzić datę na karcie lego.com i poprawić kartę w `karty_setow.json`.
**Kto:** — Code (dane)

**`/zestaw/10280/` ma crawl z 11.09 (59 dni) mimo indeksacji i obecności w sitemapie; `/aktualnosci/` z 26.10 (14 dni).**
**Zrobić:** — nic dla ludzi: 10280 trafi do kolejki jako „stary crawl" tylko, jeśli kolejka obejmie też huby zindeksowane >45 dni temu — sprawdzę w `kolejka-indeksacji.mjs` za tydzień, czy to jedna linia.
**Kto:** — Kontroler (następny przebieg)

Pozycje zebrane z dziennika — sekcja „Zadania bez właściciela" niżej (mail wysłany, id `01a1bf79`).

---

## Diagnoza środowiska — 2026-11-09 08:37 UTC

**Repo**
- gałąź `kontroler` @ `2654636`, origin/main @ `2654636` — 0 commitów ponad main, 0 do nadrobienia, 2 pliki niezacommitowane (archiwum dziennika)
- node_modules ✓, astro ✓

**Zmienne środowiska**
- ustawione: 14/14 — komplet

**Dane**
- oferty_feed zaktualizowane: 2026-11-09
- rejestr afiliacji zaktualizowany: 2026-11-06 (audyt: Ceneo `zakonczony`, odczyty paneli C3)
- import Empiku: zrzut z **03.11** (4 518 cen Empik, 700 x-kom); dzisiejszy nie wszedł do 09:40 PL
- oferty: allegro 6 248, empik 4 516, ceneo 1 808, planetaklockow 1 085, lego 990, xkom 700, mediaexpert 672, smyk 602, mediamarkt 129, lidl 112
- rejestr Scouta (known_sets.json): 1 305/1 305 ✓ (tydzień temu 1 289)

**Dostępy** *(realne wywołania, nie deklaracje)*
- cloudflare: **ok** (kliknięć 7 dni: **15 267** — tydzień temu 2 387; fala 05.11, patrz „Ruch botów") · r2: **ok**
- tradedoubler: **ok — ROZJAZD Z REJESTREM** (Ceneo: TD ACCEPTED, rejestr `zakonczony`) — rozjazd pozorny, rejestr ma rację; pozycja dla Code w „Kto co robi"
- search_console: **ok** · adtraction: **ok** · performers: **ok**
- produkcja: **ok** (200) · link sklepu z przeglądarki: **ok** (302) · firecrawl: **ok** (2 794 kredytów — tydzień temu 3 839; odnowienie puli 23.11, pełne limity do 30.11 decyzją z 06.11)

Empik 4 552 → 4 516 i `redirects` 19 597 → 19 301: filtr akcesoriów z audytu (D3) zdjął 300 linków
do gablot, uchwytów i Playmobila. Media Expert 698 → 672: niedostępne nie są ofertami od 30.10.

---

## Cztery kamienie milowe na grudzień 2026

| Kamień | Tydzień temu (02.11) | **Dziś (09.11)** | Kierunek |
|---|---|---|---|
| **1. Zatwierdzona prowizja w każdej z 3 sieci z API** | 1 z 3 — TD (6 zatwierdzonych) | **1 z 3 — TD (6 zatwierdzonych); Performers 10 konwersji PENDING (268 zł), 0 zatwierdzonych; Adtraction 0** | Performers z „0 konwersji" na „10 czeka" |
| **2. EPC per sklep na próbie > 1 transakcji (próg 10 EUR)** | 1 sklep (Empik) | **1 sklep zatwierdzony (Empik 4 tr., 374 EUR) + 1 oczekujący (Media Expert 10 tr., 14 764 zł)** | drugi sklep na progu |
| **3. Kliknięcia z Polski dziennie** | 10,6 (7 dni) / 7,0 (28 dni) | **6,9** (7 dni) / 8,6 (14 dni) / 7,5 (28 dni) | 7 dni w dół, 28 dni w górę |
| **4. Zaindeksowane strony (panel GSC)** | 837 *(dane z 12.10)* | **903** *(odczyt 06.11, dane z 23.10)* | **+66** |

### Kamień 1 — Media Expert: dziesięć konwersji, zero zatwierdzonych

Do 07.11 `prowizje-raport.mjs` brał `getStats` Performers, które liczy wyłącznie zatwierdzone —
stąd „0 konwersji" w czterech kolejnych raportach i w audycie. `getConversions` pokazuje co innego:

| Okno | Kliknięcia u Performers | Konwersje pending | Sprzedaż | Prowizja pending |
|---|---:|---:|---:|---:|
| 7 dni | 16 | 2 | 1 031 zł | 7,86 zł |
| 30 dni | 121 | 7 | 13 110 zł | 242,49 zł |
| 60 dni | 246 | 10 | 14 764 zł | 268,09 zł |

W tym zakup testowy Marka z 06.11 (11505, 233,42 zł → 4,67 zł) — tracker przypisuje. Największe
zamówienie: 16.10, 9 998 zł → 199,96 zł. **Żadna z dziesięciu nie jest zatwierdzona, najstarsza
czeka od 03.09.** Dopóki tak jest, kamień 1 stoi na jednej sieci — ale to pierwszy tydzień, w którym
druga sieć ma w ogóle co zatwierdzać. Decyzja 2 to termin, po którym pytamy.

Tradedoubler bez zmian: 60 dni — 16 transakcji, 11,01 EUR, zatwierdzone 6 (Empik 3, Ceneo 2, Lidl 1).
W 7 dniach trzy mikro-transakcje Ceneo po 0,06 EUR z cookies sprzed zamknięcia programu (03.11).
Adtraction: 0 w całej historii.

### Kamień 2 — jeden sklep zatwierdzony, drugi na progu

Empik: 4 transakcje, 374 EUR, 2,25% — bez zmian. Media Expert spełniłby kryterium z nawiązką
(10 transakcji, 14 764 zł), gdyby którakolwiek była zatwierdzona. Zapisuję jako „1 + 1 oczekujący"
i nie liczę EPC z pieniędzy, których jeszcze nie ma.

### Kamień 3 — 6,9 dziennie, po piku wraca do 7–8

| Okno | Kliknięć z Polski | Średnio dziennie |
|---|---:|---:|
| 7 dni | 48 | **6,9** |
| 14 dni | 121 | 8,6 |
| 28 dni | 210 | 7,5 |

Poprzedni tydzień 73 → 48 (−34%). Dni: 7, 9, 4, 8, 11, 6 (+3 z końcówki poniedziałku 02.11). Tydzień
26.10–02.11 miał pik 26–27.10 (21 i 15 kliknięć, w tym 6 testów Marka) — bez niego byłby na poziomie
tego tygodnia. Okno 28 dni rośnie trzeci tydzień: 5,6 → 7,0 → 7,5. **To jest trend: 7–8 dziennie**,
a 10,6 sprzed tygodnia było pikiem, co napisałem już wtedy.

Skąd: **huby 34, artykuły 6, strony serii 5, strona główna 3.** **ChatGPT: 29 z 48 (60%)** — tydzień temu
18 z 74 (24%), liczba bezwzględna urosła z 18 do 29 przy spadku całości. Google w tym samym oknie:
1 kliknięcie. Nowe w refererach: ChatGPT wysyła ludzi na **strony serii z filtrami**
(`/serie/star-wars/?rok=2026&dostepne=1`, `/serie/brickheadz/?dostepne=1&sort=cena-rosnaco`,
`/serie/minecraft/?q=cree`) — 5 kliknięć; używa naszych list jak wyszukiwarki.

### Kamień 4 — 903, pierwszy odczyt od 19.10

Cowork w audycie 06.11 (C2): **903 zaindeksowane** (dane GSC z 23.10), 3 180 niezindeksowanych:
2 282 noindex (nasze), **648 „wykryta – niezindeksowana"** (w tym cała sekcja `/deale/` — stąd
decyzja D12: zakończone deale noindex i poza mapą), 219 × 404 (znane huby z września), 23 zeskanowane
bez indeksu. 837 → 903 to +66 w 11 dni między datami danych (12.10 → 23.10), przy sitemapie,
która w tym czasie urosła o ok. 500 hubów. Google bierze ok. 1 na 8.

---

## Harmonogram

**Data odczytu z konta: 09.11, 07:49 CET — dzisiejsza.** 21 Routines (17 serwisu, 4 inne; tydzień
temu 23 — zniknęły jednorazowe zadania social). **Jedna kolizja: pon 09:30 — Kontroler i „Alerty cen"**
(pozycja wycofana 02.11, bez szkody czwarty tydzień).

Commity w 7 dniach (od 02.11 09:46): **Łowca 7, Scout 7, Radar 7, Kolejka indeksacji 7, Weryfikacja
ofert 7, Dane wt 1 (wt 03.11 05:45 — pierwszy planowy przebieg nowego triggera z 29.10, poszedł),
Wycofania 0 — alarm wyżej.** Zdjęcia → R2 przepięte 04.11 na stałą sesję z repo (dwa nowe triggery),
bo nocny przebieg 04.11 zablokował klasyfikator „Code from External"; od tamtej pory 04:45 i 09:45
mają SUCCEEDED. Skrzynka tekstów Piotra (GitHub, kanał od 02.11): teksty w 5 z 7 dni. Razem ponad
100 commitów w tygodniu — najwięcej od startu, w tym audyt 06.11 (siedem raportów, decyzje D1–D4, D12).

Przypomnienie o zrzutach (pon 08:15) odpaliło się 02.11 o 08:28; zrzuty przyszły we wtorek. Dziś
odczyt z konta był o 07:49, przed przypomnieniem — nie wiem, czy poszło.

---

## Archiwum dziennika

30 wpisów przeniesionych do `materialy/dziennik-archiwum-2026-10.md`; `DZIENNIK.md` 1 741 → 1 294
linii. Zatrzymane mimo wieku: dwa wpisy CODE „w toku" z września (CRO A–G 25.09, kolejka redakcyjna
XLSX 04.09) — dziesiąty tydzień; jeśli nie są w toku, potrzebują linii zamknięcia.

---

## Świeżość tekstów

`swiezosc-tekstow.mjs`: **100 tekstów** (tydzień temu 86), **0 sprzeczności**, 1 do sprawdzenia —
ten sam 77094 (Zelda) z plakietką „przeciek" w `/zapowiedzi-lego-2027/`. **1 przestarzały:**
`/artykuly/lego-ninjago-71888-ivos-ninja-dojo-oficjalnie-3495-elementow/` (zaktualizowano 06.11)
ma w `przecieki.json` rozstrzygnięcie „zmieniony" z 07.11.

Daty premier (541 zestawów): nadal jedna sprzeczność — **11381** (karta „1 lipca", recenzja
i rejestr „1 sierpnia"), pozycja Code z 02.11 bez ruchu.

---

## Zadania bez właściciela

**27 pozycji: Piotr 3, Marek 11, Code 12, Cowork 1** (+1 dla Scouta). Mail do Marka i Piotra, id `01a1bf79`.
Tydzień temu 20. Lista rośnie po stronie Code (5 → 12): Radar i Scout zostawili w tydzień siedem
pozycji o rejestrze rocznika 2027 i kalendarzu upominków, z których część jest już zrobiona
w przebiegu, a pozycja została bez linii zamknięcia.

### Piotr (tekst) — 3
- **Godzilla 21375: „czego nie widać na karcie"** (ukryty easter egg, StoneWars). *(Scout 06.11)*
- **Styczniowa fala Friends 2027** na podstawie hubów 42709/42718/42719. *(Scout 29.10)*
- **„Czy warto zbierać gratisy GWP z miniserii LEGO"** — evergreen. *(Radar 14.10, 26 dni)*

### Marek (decyzja / panel / komputer) — 11
- **49 zestawów z wycofaniem poza rejestrem** (wyszło przy 76329 Masce Milesa Moralesa) *(Radar 31.10)* — decyzja 1.
- **107 zestawów `dostepny` z ofertami bez rejestru** *(Scout 30.10)*.
- **64 zestawy z rabatem ≥25% poza rejestrem** *(Radar 29.10)* — zrobione w danych 29.10 (55+9), bez linii zamknięcia; trzeci tydzień na liście.
- **Pula kodów na gratis 30708 dla fanklockow.pl** — czy pytamy LEGO o to samo. *(Radar 06.11)*
- **Zbiorczy hub zapowiedzi 2027 u konkurencji** — czy `/zapowiedzi-lego-2027/` ma być hubem. *(Radar 06.11)*
- **„Kalendarze adwentowe LEGO najtaniej"** — czy wchodzimy w hasło przed Wigilią. *(Radar 05.11)*
- **Black Weeks Media Expertu** — czy robimy tekst zbiorczy. *(Radar 03.11)*
- **Zrzuty Empiku i x-komu** — dziś znowu nie weszły. *(Kontroler 02.11, ↻ 09.11)*
- **Prompt Scouta** — wyjątek Education w sprzedaży detalicznej. *(Scout 24.10, 16 dni)*
- **Panel SalesMasters** — audyt 06.11 odczytał saldo (0 zł), ale nie stawkę i cookie; nadal „NIE SPRAWDZONA". *(Kontroler 19.10, 21 dni)*
- **Cykl „do szafy"** *(Radar 19.10, 21 dni)*.

### Code (dane, strona, skrypt) — 12
- **30720 Arielka** do `sety.json` (jedyny upominek bez linku w tabeli). *(Radar 09.11)*
- **30762 Batman** — sprawdzić kartę promocji, wpisać albo usunąć z kalendarza. *(Radar 09.11)*
- **`/zapowiedzi-lego-2027/`** bez Botanicals, Seasonal, 42254, 11227, 71888 — i reguła wiążąca rejestr ze stroną. *(Radar 07.11)*
- **42717, 77084, 77088** (rocznik 2027) do rejestru. *(Radar 07.11)*
- **Kontrola linków wewnętrznych** `/zestaw/<nr>/` z artykułów wobec `dist/` — pięć 404 z 06.11. *(Scout 07.11)*
- **Firecrawl `maxAge`** — zapis w RUNBOOK. *(Scout 05.11)*
- **11381** — data premiery. *(Kontroler 02.11, ↻)*
- **11390 Shenron: data w `opis`** (JSON-LD). *(Radar 02.11)*
- **9 zestawów bez strony serii** — reguła `RRRR-MM`. *(Scout 02.11)*
- **Zdanie o transmisji 3.11 i cenie 21375** — po fakcie; do zamknięcia albo wykreślenia. *(Scout 30.10)*
- **Feed MediaMarkt: 76265, 52447** *(Dane wt 20.10, 20 dni)*; **71835** bez katalogu *(Dane wt 20.10)*.

### Cowork (przeglądarka) — 1
- **11388 w koszyku lego.com/pl-pl** — czy 40898 i 40889 doliczały się naraz; okno 40889 zamknięte 08.11, ale 40898 wydłużone do 20.11. *(Scout 01.11)*

### Zamknięte od 02.11 (nie ma ich na liście)
Odczyt GSC (06.11, Cowork), Performers — decyzja „czekamy" (08.11), Ceneo w workerze i na stronie
(03.11 + D1), martwa karta Lidla 10427 (02.11, `redirects.lidl` trzecim wyjątkiem od append-only),
polski próg 40889, kalendarz listopadowy, ceny Botanicals od Piotra (07.11), reguła referera (02.11),
Kontroler 09:35 (wycofane), okno gratisów zamknięte na polecenie Marka (08.11), 30727 u Wycofań —
**jedenaście pozycji w tydzień.**

---

## Ruch botów — fala 13 301 w jeden dzień, filtr trzyma

| Rodzaj | Kliknięć | Udział |
|---|---:|---:|
| bot (odrzucony przez filtr) | 15 170 | 99,4% |
| **„human" (przepuszczony do sieci)** | **59** | 0,4% |
| test (nasza diagnoza i audyt) | 38 | 0,2% |

**05.11: 13 301 kliknięć botów w jeden dzień** (89 krajów według audytu; BR 3 553, AR 1 391, BD 1 225,
CO 900, PK 750, MA 712 w tygodniu); boty tygodnia celowały w Allegro (6 011), Empik (2 637) i Media Expert (1 978).
Tego dnia do sieci przeszły **4 kliknięcia ludzkie z Polski** — filtr nie przepuścił z fali nic.

### Reguła z 02.11 — wynik po tygodniu

| | 27.10–02.11 | **03.11–09.11** |
|---|---:|---:|
| „human" spoza Polski | 43 | **11** |
| z tego z refererem strony głównej | 40 | **0** |
| z tego z hubów i artykułów (prawdziwe) | 3 | 11 |

Jedenaście kliknięć spoza Polski to tym razem ludzie: Norweg porównujący 75455 w trzech sklepach
w trzy minuty (z ChatGPT), Chorwat trzy razy przy 31387 (z ChatGPT), trzech Amerykanów na hubach
i w dealu La Catrina, Hiszpan przy 75192, drugi Norweg przy 72050. Żadnego ze strony głównej. **Dziura zamknięta.** Z Polski
ze strony głównej: 3 kliknięcia, pojedyncze, do ME i Empiku — reguła ich nie dotknęła.

Udział „brak-linku": 0 na 59 — ósmy tydzień z rzędu. Łatka diagnostyczna workera z audytu
(punkt 7) czeka na zgodę Marka — nie dopisuję jej jako decyzji, jest w audycie.

---

## EPC per sklep

Kliknięcia: ruch ludzki z Polski. Prowizje: z API; Performers od 07.11 z podziałem na statusy.
Allegro, Planeta Klocków i x-kom — EPC modelowe (brak API); audyt 06.11 dał jednorazowy odczyt
paneli, podaję go jako liczbę z panelu, nie jako pomiar ciągły.

| Sklep | Kliki PL 7 dni | Kliki PL 30 dni | Prowizja 30 dni | EPC 30 dni | Podstawa |
|---|---:|---:|---:|---:|---|
| Media Expert | 20 | 89 | **0,00 zł zatwierdzone / 242,49 zł pending** | **0 / 2,72 zł pending** | Performers: 7 konwersji pending na 121 klików u nich |
| Allegro | 10 | 44 | — | **model** | panel 06.11: 16,88 zł, 10 transakcji w 90 dni |
| Empik | 6 | 22 | 1,28 EUR | **0,058 EUR** | TD: 1 transakcja (52,90 EUR), niezatwierdzona |
| x-kom | 7 | 18 | — | **model** | panel 06.11: 0 zł; stawka nieznana |
| LEGO.com | 1 | 16 | — | **0 z definicji** | brak programu |
| Smyk | 4 | 14 | 0,00 zł | **0,00 zł** | Adtraction: 0 |
| Ceneo | 0 | 10 | 0,60 EUR | — | program zakończony 03.11; 9 mikro-transakcji z cookies |
| Lidl | 0 | 7 | 0,00 EUR | — | 1,84 EUR zatwierdzone (wrzesień) |
| Media Markt | 0 | 1 | 0,00 EUR | — | TD ACCEPTED, 0 transakcji |
| **Razem** | **48** | **221** | **1,88 EUR + 242,49 zł pending** | **0,0085 EUR/klik zatwierdzone** | 3 sieci z API |

Zatwierdzone: 1,88 EUR na 221 kliknięć — ten sam rząd co tydzień temu (1,70 EUR / 208). **Oczekujące:
242,49 zł z Media Expertu** — gdyby się zatwierdziły, EPC serwisu skoczyłby z groszy do ok. 1,10 zł
na kliknięcie. To największa niewiadoma w liczbach serwisu i powód decyzji 2.

### Performers liczy — czwarty tydzień, proporcja się zmieniła

| Tydzień | Nasze kliknięcia PL do ME | Performers | Udział |
|---|---:|---:|---:|
| 13–19.10 | 29 | 18 | 62% |
| 20–26.10 | 18 | 12 | 67% |
| 27.10–02.11 | 25 | 16 | 64% |
| 03–09.11 | 20 | 16 | **80%** |

Pierwszy tydzień po poprawce subID (06.11, `65b6578`: `tylkoklocki` zamiast makra `Partner_ID`)
i po zamknięciu dziury ze strony głównej. 80% przy 20 kliknięciach to za mało, żeby ogłosić zmianę;
jeśli utrzyma się dwa tygodnie, pytanie o 1/3 kliknięć straci podstawę i zostanie tylko pytanie
o zatwierdzanie.

---

## Widoczność w Google

| Okres | Kliknięcia | Wyświetlenia | CTR | Pozycja |
|---|---:|---:|---:|---:|
| 7 dni (31.10–07.11) | **1** | 178 | 0,56% | 18,0 |
| 14 dni (24.10–07.11) | 3 | 284 | 1,06% | 21,5 |
| Poprzednie 7 dni (z różnicy) | 2 | 106 | — | — |

Kliknięcia 2 → 1 (fraza „tylko klocki" na stronę główną — ktoś nas szukał z nazwy), wyświetlenia
**106 → 178 (+68%)**, pozycja średnia **27,5 → 18,0**, **71 podstron z wyświetleniami** (65, 47, 24
w poprzednich tygodniach). Google pokazuje nas częściej i wyżej, kliknięć z tego jeszcze nie ma.

Co widać: `/artykuly/x-kom-black-weeks-2026-lego-tydzien-3/` — **20 wyświetleń, pozycja 5,7**
(frazy z „x-komu"); `/wycofania/` 20 wyświetleń, pozycja 8,0; fraza **„lego 75448" — 23 wyświetlenia,
pozycja 7,2**; „las odkrywców" 7 wyświetleń, pozycja 6,7; `/nowosci/` 13 wyświetleń, pozycja 32;
`/aktualnosci/` pozycja 3,0 przy 4 wyświetleniach. Tekst o x-komie zbiera jednocześnie 6 kliknięć
afiliacyjnych z ChatGPT i 20 wyświetleń w Google — jedyny tekst widoczny w obu kanałach.

---

## Indeksacja

### Liczby z builda

| Miara | 26.10 | 02.11 | **09.11** | Zmiana t/t |
|---|---:|---:|---:|---:|
| Huby `/zestaw/` w buildzie | 9 879 | 9 936 | **9 954** | +18 |
| Huby w `sitemap-zestawy.xml` | 1 768 | 1 929 | **2 000** | +71 |
| Udział zgłoszonych | 17,9% | 19,4% | **20,1%** | +0,7 pkt |
| **Zaindeksowane (panel GSC)** | 837 *(12.10)* | 837 | **903** *(23.10)* | **+66** |

Przyrost sitemapy zwolnił (393 → 161 → 71): karty P07 wchodzą teraz tylko dla zestawów z hubem
(decyzja 06.11), a 58 z 89 kart z 06.11 dotyczyło numerów bez huba. Build czysty, 10 171 stron, 38 s.

### Inspekcja adresów przez API Search Console

| Adres | Werdykt | coverageState | Crawl | Wiek |
|---|---|---|---|---:|
| `/` | PASS | Submitted and indexed | 04.11 | 5 dni |
| `/artykuly/` | PASS | Submitted and indexed | 06.11 | 3 dni |
| `/artykuly/lego-ideas-21375-godzilla-…/` (opubl. 04.11) | PASS | Submitted and indexed | **05.11** | 4 dni |
| `/serie/` | PASS | Submitted and indexed | 28.10 | 12 dni |
| `/wycofania/` | PASS | Submitted and indexed | 05.11 | 4 dni |
| `/ekskluzywne/` | PASS | Submitted and indexed | **09.11** | 0 dni |
| `/promocje-lego/` | PASS | Submitted and indexed | 08.11 | 1 dzień |
| `/serie/marvel/` | PASS | Submitted and indexed | 01.11 | 8 dni |
| `/aktualnosci/` | PASS | Submitted and indexed | 26.10 | **14 dni** |
| `/zestaw/11208/` | **PASS** | **Submitted and indexed** | **04.11** | 5 dni |
| `/zestaw/10280/` | PASS | Submitted and indexed | 11.09 | **59 dni** |

Godzilla (tekst Piotra z 04.11) w indeksie 05.11 — po tygodniowej przerwie seria „nowy tekst w ciągu
doby" wraca. **`/zestaw/11208/` zindeksowany** — 19.10 „wykryta", 26.10 „nieznany Google", 02.11
znów „wykryta", 04.11 w indeksie; kolejka zgłaszała go trzy razy. Działy mają crawl z ostatnich
12 dni poza `/aktualnosci/` (14 dni — na granicy, zobaczę za tydzień). `/zestaw/10280/` stoi na
11.09 jako jedyny.

Dzisiejsza kolejka: 15 adresów, **wszystkie powtórki z 08.11** (Google nie odwiedził po zgłoszeniu),
w tym 10713 z odczytem „noindex, crawl 11.09", którego na produkcji dawno nie ma. Stan sprawdzonych
dziś: 28 adresów — 10 zindeksowanych, 10 wykrytych, 5 nieznanych, 2 noindex (stare), 1 zeskanowany.
Po D12 (15 zakończonych deali z noindex) sekcja `/deale/` przestanie figurować w „wykrytych" — efekt
w panelu najwcześniej przy następnym odczycie.

---

## Kontrola linków sklepowych

Wykonana przez Łowcę o 08:45 PL (`materialy/kontrola-linkow-2026-11-09.md`). Próba 150 linków,
**19 301 w całości (−296: filtr akcesoriów Empiku −300, martwy Lidl 10427 −1, nowe +5)**, martwych: **0**.

| Sklep | w próbie | żywe | martwe | blokada sklepu | nierozstrzygnięte |
|---|---:|---:|---:|---:|---:|
| ceneo | 48 | 48 | 0 | 0 | 0 |
| planetaklockow | 47 | 47 | 0 | 0 | 0 |
| smyk | 23 | 23 | 0 | 0 | 0 |
| mediamarkt | 4 | 4 | 0 | 0 | 0 |
| lidl | 3 | 3 | 0 | 0 | 0 |
| allegro | 5 | 0 | 0 | 2 | 3 |
| mediaexpert / lego / empik / xkom | 5 każdy | 0 | 0 | 5 każdy | 0 |

Martwa karta Lidla 10427 z 02.11 usunięta tego samego wieczoru (`0f41b8c`), `redirects.lidl` został
trzecim wyjątkiem od append-only. Ceneo nadal w próbie (48), choć od 06.11 nie ma go na stronie —
linki w `redirects.ceneo` istnieją, ale build nie generuje `/idz/ceneo/`; kontrola sprawdza mapę,
nie stronę. O 25 linkach (16,7%) nie wolno powiedzieć „OK"; kontrola w przeglądarce 20.11.

**Zadanie dla `empik-redirects.mjs --usun-martwe`: brak.**

---

## TOP artykuły

**Po kliknięciach afiliacyjnych** (polski ruch do sklepu): `/artykuly/x-kom-black-weeks-2026-lego-tydzien-3/`
— **6**, wszystkie z ChatGPT; żaden inny tekst. Huby: 76437 (3), 72423 (3, ChatGPT), 31136, 11371,
42222 (po 2). Strony serii z filtrami przez ChatGPT: 5.

**Po Google:** jedno kliknięcie, na stronę główną z nazwy serwisu. Wyświetlenia: x-kom BW3 (20, poz. 5,7),
`/wycofania/` (20, poz. 8,0), `/nowosci/` (13), premiery 11388 i 11390 (po 4–5, poz. 9–18),
Star Wars styczeń 2027 (5, poz. 10).

W tym tygodniu weszło **dziesięć tekstów Piotra kanałem GitHub** (Creeper 21276, Godzilla 21375,
Pokój Autumn 42646, ciężarówki 2148/3442/10156, Ninjago 71888, Botanicals 2027, Święto Wiosny 2027,
recenzja 77256 Wehikuł czasu, upominki 9–15.11, recenzja 42682 Kemping, plus dwie nowe wersje starszych)
i dwa deale Łowcy (Grogu 75446, serie growe ME). Do tego **17 deali w nowym formacie** (30.10)
i kafelki okazji w tekstach Black Weeks (06.11). Wzorzec trzyma się czwarty tydzień: **teksty
dealowe i kodowe zbierają kliknięcia (dziś wyłącznie przez ChatGPT), premiery i recenzje zbierają
wyświetlenia w Google na pozycjach 3–10 bez kliknięć.**

---

## Trzy decyzje na ten tydzień

### 1. 49 zestawów z wycofaniem — do rejestru przed Black Friday *(Marek)*
Pozycja Radaru z 31.10 czeka 9 dni. Wycofywane zestawy to w BF pierwsze, czego ludzie szukają,
a bez rejestru nie mają minimum, alertu ani wejścia do „Dziś w dobrej cenie". **Zrobić:** zgoda
na dopisanie 49 do `sety.json` + `ceny_baza.json` do 20.11; 107 ze Scouta osobno. **Kto:** Marek.

### 2. Termin dla Performers *(Marek)*
10 konwersji pending, 268 zł, najstarsza od 03.09. Decyzja z 08.11 „czekamy" bez daty końca to
decyzja bez treści. **Zrobić:** zgoda na 23.11 — jeśli do tego dnia nic się nie zatwierdzi,
Kontroler przypomina, mail idzie z pytaniem o termin zatwierdzania. **Kto:** Marek.

### 3. D5–D9 z audytu — środa 11.11 *(Marek)*
Pięć decyzji z domyślnym „tak" (mail z okazjami w czwartek, prezentowniki według zainteresowań,
Piotr tylko GitHub, maile runnerów pon + pt, strony autorów). **Zrobić:** do środy powiedzieć,
jeśli któraś ma być inna; cisza = domyślne. **Kto:** Marek.

---

## Czego w tym raporcie nie ma

- **Ręcznego odczytu paneli Allegro, Planety Klocków i SalesMasters co tydzień** — decyzja 22.09;
  jednorazowy odczyt z audytu 06.11 podaję jako liczbę z datą.
- **Mnożnika do 20 000 zł** — cel na 2027.
- **EPC Media Expertu z pieniędzy oczekujących** — podaję osobno, nie liczę ich jako przychodu.
- **Dzisiejszych cen Empiku i x-komu** — zrzuty nie weszły do 09:40.
- **Wyniku Wycofań z 09.11** — SUCCEEDED bez śladu; co zrobiła sesja, sprawdzi Marek.
- **Oceny audytu 06.11** — to raport Marka i Code, nie Kontrolera; biorę z niego liczby i decyzje.
