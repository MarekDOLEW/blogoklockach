# Raport Kontrolera — 02.11.2026 (poniedziałek)

> **Trzy rzeczy z tego tygodnia.** Pierwsza: ruch z Polski **podwoił się** — 74 kliknięcia
> wobec 36 tydzień temu, 10,6 dziennie; jeden hub (21333 Gwiaździsta noc, dopisany do
> rejestru 28.10 na polecenie Marka) dał 11 z nich. Druga: dziura w filtrze botów **urosła
> z 17 do 43 kliknięć** spoza Polski — i reguła, o którą prosiłem tydzień temu (referer bez
> ukośnika), złapałaby z tych 43 **zero**. Wszystkie 40 „sondowych" mają referer z ukośnikiem.
> Decyzja 1 jest dziś inna niż tydzień temu i mówię to wprost. Trzecia: Performers trzeci
> tydzień z rzędu liczy ok. 2/3 naszych polskich kliknięć (62% → 67% → **64%**); czekanie
> na „trzeci tydzień" się skończyło, mail do nich jest gotowy niżej do wklejenia.

> Na minusie: panel GSC nie ma odczytu od 19.10 (dane z 12.10 — **trzy tygodnie**), zrzuty
> Empiku i x-komu **nie weszły** do 09:46 PL (import nadal z 26.10), a trzy decyzje z 26.10
> nie mają odpowiedzi.

---

## Kto co robi

**Decyzja 1: 43 kliknięcia spoza Polski przeszły w tygodniu 27.10–02.11 jako „human" (tydzień temu 17) — 40 z nich z refererem `https://tylkoklocki.pl/`, z ukośnikiem, w seriach po kilka w pół minuty z różnych krajów (AR, PK, BR, MX, CO w 24 sekundy 26.10 16:38); 23 do Media Expertu, 19 do Allegro.**
**Mamy?** — nie: reguła z 26.10 („referer bez ukośnika = bot") złapałaby 0 z 40. Z Polski ze strony głównej przyszło 10 kliknięć — 6 to seria 26.10 11:32 (x-kom 75446/43303, Allegro, ME ×2) w minucie, w której Marek sprawdzał cenę 43303 (commit `d2fb8a3` 11:36), 4 pozostałe to pojedyncze wejścia do ME w różne dni.
**Zrobić:** — zgoda na regułę w `src/worker.js`: **referer strony głównej (z ukośnikiem lub bez) + kraj spoza PL = bot.** Trzy prawdziwe kliknięcia spoza Polski w tym tygodniu (NO ×2 z ChatGPT, DK) przyszły z hubów, nie ze strony głównej — reguła ich nie dotknie. Koszt: Polak za granicą klikający ze strony głównej. Wdraża Code; worker = pytamy przed pushem.
**Kto:** — Marek (decyzja)

**Decyzja 2: Performers trzeci tydzień liczy ok. 2/3 naszych polskich kliknięć do Media Expertu: 29→18 (62%), 18→12 (67%), 25→16 (64%); 316 kliknięć u nich w 60 dni, 0 konwersji.**
**Mamy?** — tak: trzy tygodnie czystego pomiaru, ta sama proporcja; gotowy tekst maila niżej (sekcja EPC).
**Zrobić:** — wysłać mail do supportu Performers (program Media Expert, offer_id 1860) — treść do skopiowania w sekcji „EPC per sklep".
**Kto:** — Marek (mail)

**Decyzja 3: feed Ceneo (Tradedoubler, fid 256472) od 01.11 odpowiada `PF_392 „Requester is not connected to Feed"` — ten sam wzorzec, co Lidl przed akceptem 17–18.09; 1 808 ofert Ceneo w `oferty_feed.json` zaczyna się starzeć od 27.10.**
**Mamy?** — częściowo: feed działał 27.10, dwa niezależne wywołania 01.11 zwróciły 400; w kodzie nic do zmiany.
**Zrobić:** — zgłosić w panelu TD / do wsparcia, że program Ceneo CPS (385881, konto a=3494691) nie jest podłączony do feedu 256472. Po podpięciu wtorkowy przebieg Dane wt sam odświeży oferty.
**Kto:** — Marek (konto Tradedoubler)

**Liczba zaindeksowanych stron z panelu GSC: odczyt 19.10 (dane z 12.10) — dziś trzy tygodnie, a sitemapa hubów urosła w tym czasie z 1 291 do 1 929.**
**Mamy?** — nie: ostatni odczyt 19.10 przez Coworka; prośba z 26.10 bez odpowiedzi.
**Zrobić:** — odczytać raport „Strony" w panelu GSC (prompt z 19.10 w sesji Kontrolera, 5 minut).
**Kto:** — Marek (panel) albo Cowork (panel)

**Zrzuty Empiku i x-komu nie weszły do 09:46 PL — import nadal z 26.10 (tydzień temu weszły o 09:10).**
**Mamy?** — częściowo: ceny Empiku (4 552) i x-komu (720) z 26.10 stoją w hubach jako aktualne.
**Zrobić:** — odpalić skill `klocki-zrzuty-tygodniowe` na Macu; po pliku import robi sesja Code.
**Kto:** — Marek (komputer)

**Karta Lidla dla 10427 (interaktywny pociąg DUPLO) zwraca 404 — jedyny martwy link na 150 sprawdzonych dziś przez Łowcę; worker odeśle czytelnika na nieistniejącą stronę.**
**Mamy?** — tak: wpis w `redirects.lidl`; mapy poza Empikiem i x-komem są append-only.
**Zrobić:** — zgoda na usunięcie wpisu `10427` z `redirects.lidl` (bez wpisu worker spada na wyszukiwarkę Lidla) — albo decyzja, że Lidl dołącza do wyjątku `--usun-martwe` obok Empiku i x-komu, skoro jego karty też znikają.
**Kto:** — Marek (decyzja)

**11381 Jaguar E-Type ma w naszych danych dwie daty premiery: karta (`karty_setow.json`, metryka i treść) mówi „1 lipca 2026", recenzja i `sety.json` (`2026-08`) — „1 sierpnia 2026".**
**Mamy?** — tak: nowe sprawdzenie dat premier w `swiezosc-tekstow.mjs` (522 zestawy) znalazło tylko tę jedną sprzeczność.
**Zrobić:** — potwierdzić datę na karcie lego.com i poprawić `karty_setow.json` (metryka „Premiera" + zdanie w treści) albo recenzję — jedno źródło prawdy.
**Kto:** — Code (dane)

**Kontroler 09:30 → 09:35 (decyzja 3 z 26.10): trzeci tydzień bez odpowiedzi, trzeci tydzień bez szkody.**
**Zrobić:** — wycofuję pozycję; kolizja z „Alerty cen" nie zrobiła szkody w trzech przebiegach. Wrócę, jeśli harmonogram pokaże skutek.
**Kto:** — Kontroler (zamknięte dziś)

Pozycje z dziennika — sekcja „Zadania bez właściciela" niżej (mail wysłany, id `01a19b73`).

---

## Diagnoza środowiska — 2026-11-02 08:46 UTC

**Repo**
- gałąź `kontroler` @ `4055587`, origin/main @ `7ee2476` — 3 commity do nadrobienia (teksty Piotra z 09:40–09:45 PL), 2 pliki niezacommitowane (archiwum dziennika)
- node_modules ✓, astro ✓

**Zmienne środowiska**
- ustawione: 14/14 — komplet

**Dane**
- oferty_feed zaktualizowane: 2026-11-02
- rejestr afiliacji zaktualizowany: 2026-10-19
- import Empiku: **2026-10-26** — zrzuty z dzisiejszego poniedziałku nie weszły do 09:46 PL
- oferty: allegro 6 219, empik 4 552, ceneo 1 808, planetaklockow 1 097, lego 988, xkom 720, mediaexpert 698, smyk 620, mediamarkt 129, lidl 111
- rejestr Scouta (known_sets.json): 1 289/1 289 ✓ (tydzień temu 1 212 — 77 zestawów w tydzień)

**Dostępy** *(realne wywołania, nie deklaracje)*
- cloudflare: **ok** (kliknięć 7 dni: 2 387) · r2: **ok** (`tylkoklocki-obrazy`)
- tradedoubler: **ok** (Media Markt, Allegro, Empik, Lidl, Ceneo ACCEPTED; RTV EURO AGD REJECTED) — ale **feed Ceneo odpowiada PF_392** od 01.11 (decyzja 3)
- search_console: **ok** · adtraction: **ok** · performers: **ok**
- produkcja: **ok** (200) · link sklepu z przeglądarki: **ok** (302) · firecrawl: **ok** (3 839 kredytów — tydzień temu 4 975, zużycie 1 136 w tydzień)

Media Expert spadł z 738 do 698 ofert — od 30.10 „niedostępne w ME nie są już ofertami"
(Łowca, `38b99bf`), czyli liczba spadła, bo przestaliśmy liczyć to, czego nie da się kupić.
Mediamarkt 56 → 129.

---

## Cztery kamienie milowe na grudzień 2026

| Kamień | Tydzień temu (26.10) | **Dziś (02.11)** | Kierunek |
|---|---|---|---|
| **1. Zatwierdzona prowizja w każdej z 3 sieci z API** | 1 z 3 — TD (6 zatwierdzonych) | **1 z 3 — TD (6 zatwierdzonych: Empik 3, Ceneo 2, Lidl 1)** | bez zmian |
| **2. EPC per sklep na próbie > 1 transakcji (próg 10 EUR)** | 1 sklep (Empik) | **1 sklep (Empik: 4 transakcje, 374 EUR)** | bez zmian |
| **3. Kliknięcia z Polski dziennie** | 5,1 | **10,6** (7 dni) / 7,9 (14 dni) / 7,0 (28 dni) | **w górę ×2** |
| **4. Zaindeksowane strony (panel GSC)** | 837 *(dane z 12.10)* | **837** *(ten sam odczyt, 21 dni)* | brak odczytu |

### Kamień 1 — bez zmian, i jeden feed mniej

Tradedoubler w oknie 60 dni: **13 transakcji, 10,83 EUR, 6 zatwierdzonych** — te same sześć
co tydzień temu (Empik 3 z 4, Ceneo 2 z 8, Lidl 1 z 1). W oknie 7 dni: trzy mikro-transakcje
Ceneo po 0,07 EUR. Transakcja Empiku z 22.10 (52,90 EUR obrotu, 1,28 EUR) nadal czeka
na zatwierdzenie. **Adtraction 0** w całej historii; **Performers 316 kliknięć w 60 dni, 0 konwersji.**

Nowe: feed Ceneo przestał odpowiadać (PF_392) — nie dotyczy prowizji, dotyczy ofert w hubach;
to decyzja 3.

### Kamień 2 — jeden sklep, ta sama próba

Empik: 4 transakcje, 374 EUR obrotu (tydzień temu 379 — kurs), stawka efektywna 2,25%.
Nikt nie dołączył; Ceneo ma 8 transakcji po 0,07 EUR, Lidl jedną.

### Kamień 3 — 10,6 dziennie, najlepszy tydzień od początku pomiaru

| Okno | Kliknięć z Polski | Średnio dziennie |
|---|---:|---:|
| 7 dni | 74 | **10,6** |
| 14 dni | 110 | 7,9 |
| 28 dni | 197 | 7,0 |

Poprzedni tydzień 36 → **74 (+106%)**. Dni: 21, 15, 6, 10, 3, 9, 8 (+2 dziś do 09:46).
Dwa zastrzeżenia, żeby nie przesadzić: 6 z 21 kliknięć poniedziałku 26.10 to seria z 11:32
zgodna co do minuty z pracą Marka nad ceną 43303 — bez nich tydzień ma 68 (9,7 dziennie), nadal
niemal dwa razy więcej niż tydzień temu. I okno 28 dni (7,0) mówi, że to najlepszy tydzień,
a nie nowy poziom — tak samo jak 13–19.10 (54) okazało się szczytem, nie trendem.

Skąd przyszły: **huby 53, strona główna 10, działy 6 (`/promocje-lego/`), artykuły 5.**
Jeden hub zrobił 11: `/zestaw/21333/` Gwiaździsta noc (Smyk 5, Allegro 4, LEGO 2) — dopisany
do rejestru 28.10 na polecenie Marka, cztery dni później najmocniejsza strona serwisu.
**ChatGPT: 18 z 74 (24%)** — tydzień temu 16 z 36 (44%); liczba stała, udział spadł, bo
reszta urosła. Google w tym samym oknie: 2 kliknięcia na stronę.

### Kamień 4 — 837, trzeci tydzień bez odczytu

Odczyt z 19.10 (dane 12.10). Prośba z 26.10 nie doczekała się odczytu. Sitemapa hubów od tamtego
odczytu: 1 291 → 1 929 (+49%). Nie wiem, ile z tego Google wziął — i to jest jedyna liczba
kamieni, której nie da się policzyć z repo.

---

## Harmonogram

**Data odczytu z konta: 02.11, 07:46 CET — dzisiejsza.** 23 Routines (17 serwisu, 6 innych).
**Jedna kolizja: pon 09:30 — Kontroler i „Alerty cen"** — od dziś pozycja wycofana (nie zrobiła
szkody w trzech przebiegach).

Commity w 7 dniach (od 26.10 09:35): **Łowca 11** (7 cen, 3 „do zrobienia", 1 kontrola linków),
**Scout 7 (27.10 bez commita — jedyna luka runnera w tygodniu), Radar 7, Kolejka indeksacji 7, Weryfikacja ofert 7** (nowe zadanie 09:17 w sesji Code
od 26.10), **Wycofania 1** (pon), **Dane wt 2** (27.10 z sesji Code i 01.11 — niedziela, poza
cronem; nowy trigger z 29.10 ma pierwszy planowy przebieg jutro, wt 03.11 — sprawdzę za tydzień),
Harmonogram 1, Skrzynka tekstów Piotra — 6 commitów z tekstami. Dziś do 09:46 weszły 23 commity.
**Każdy runner z pushem ma ślad.**

Zadanie jednorazowe „Zdjąć post i rolkę z Grogu" (02.11 08:00) wykonało się: commit `ade4e5b`
08:16 PL. Dwa następne jednorazowe (03.11, 09.11) czekają.

Poza runnerami: w weekend 01.11 stanął **panel `panel.tylkoklocki.pl`** (wersja 1, Cloudflare
Access, 5 commitów 10:40–12:36) i 02.11 **kanał GitHub skrzynki tekstów** (`tylkoklocki-teksty`),
którym rano weszło 75 kart i dwa teksty Piotra. Nie są to runnery, ale od dziś zmieniają, kto
co widzi — kontrola za tydzień: czy skrzynka GitHub zostawia wpisy w dzienniku tak samo jak mailowa.

---

## Archiwum dziennika

39 wpisów przeniesionych do `materialy/dziennik-archiwum-2026-10.md`; `DZIENNIK.md`
2 066 → 1 338 linii. Tydzień temu przeniosłem 9 — ten tydzień był w dzienniku najgęstszy
od września (panel, skrzynka, karty P07, ok. 350 kart w tydzień).

---

## Świeżość tekstów

`swiezosc-tekstow.mjs`: 86 tekstów (tydzień temu 77), **0 sprzeczności w tekstach**, 1 do
sprawdzenia — ten sam 77094 (Zelda) z plakietką „przeciek" w `/zapowiedzi-lego-2027/`; rejestr
wyprzedził producenta, tekst mówi prawdę.

**Nowe od 02.11 (Code, `ea57d18`): sprawdzenie dat premier** — 522 zestawy, o których jakikolwiek
nasz tekst mówi datę. Wynik: **1 sprzeczność — 11381 Jaguar E-Type**, karta „1 lipca 2026"
(metryka i treść), recenzja i `sety.json` „1 sierpnia 2026". Pozycja dla Code w „Kto co robi".
Pierwszy przebieg nowego sprawdzenia od razu coś znalazł; to dobry znak dla narzędzia i zły dla karty.

---

## Zadania bez właściciela

**20 pozycji: Piotr 2, Marek 12, Code 5, Cowork 1** (+1 dla Scouta, poza listą dla ludzi).
Mail do Marka i Piotra, id `01a19b73`. Tydzień temu 10 — liczba urosła, bo Radar i Scout
zostawiły w tydzień sześć decyzji o rejestrze (49 zestawów z wycofaniem poza rejestrem, 107 bez
rejestru przy aktywnych ofertach, 9 bez strony serii) i doszły moje cztery z 26.10 bez odpowiedzi.

### Piotr (tekst)
- **Styczniowa fala Friends 2027** na podstawie hubów 42709/42718/42719 (+67005). *(Scout 29.10)*
- **„Czy warto zbierać gratisy GWP z miniserii LEGO"** — evergreen. *(Radar 14.10, 19 dni)*

### Marek (decyzja / panel / konto) — 12
- **Ceneo PF_392** — zgłoszenie do TD *(Dane wt 01.11)* — decyzja 3.
- **Referer strony głównej spoza PL = bot** *(Kontroler 26.10 → zmieniona dziś)* — decyzja 1.
- **Mail do Performers** *(Kontroler 26.10)* — decyzja 2, tekst niżej.
- **Odczyt panelu GSC** *(Kontroler 26.10)* — 21 dni.
- **Martwa karta Lidla 10427** — usunąć wpis albo dopisać Lidl do wyjątku. *(Łowca 02.11)*
- **49 zestawów z potwierdzonym wycofaniem 2026 poza rejestrem** — dopisujemy przed grudniem? *(Radar 31.10)*
- **107 zestawów `dostepny` z ofertami bez rejestru** — które grupy śledzić (85 zwykłych 2012–2025 + reszta). *(Scout 30.10)*
- **64 zestawy z RRP i rabatem ≥25% poza rejestrem** — częściowo zrobione 29.10 (55+9 dopisanych), pozycja bez linii zamknięcia. *(Radar 29.10)*
- **Prompt Scouta** — wyjątek dla Education w sprzedaży detalicznej. *(Scout 24.10)*
- **Panel SalesMasters** — stawka x-komu i cookie. *(Kontroler 19.10, 14 dni)*
- **Cykl „do szafy"** — decyzja o formie tygodniowej. *(Radar 19.10)*
- **Kontroler 09:35** — *wycofane dziś.*

### Code (dane, strona, skrypt) — 5
- **11390 Shenron & Goku: data premiery** — `opis` w `sety.json` „1 listopada" wobec „4 listopada" w teaserze; `opis` idzie do JSON-LD. *(Radar 02.11)*
- **9 zestawów bez strony serii** (77094, 50090, 910069–910073, 42254, 11227) — reguła `RRRR-MM` w `[seria].astro`. *(Scout 02.11)*
- **Black Friday: zdanie o transmisji 3.11 i nieustalonej cenie 21375** w `/kalendarz-promocji-lego/#listopad`. *(Scout 30.10)*
- **Feed MediaMarkt:** 76265 i 52447 do `potwierdzone_numery`. *(Dane wt 20.10, 13 dni)*
- **71835** z ofertą Lidla bez katalogu i zdjęcia. *(Dane wt 20.10, 13 dni)*

### Cowork (przeglądarka) — 1
- **11388 w koszyku lego.com/pl-pl** — czy 40898 i 40889 doliczają się naraz. *(Scout 01.11)*

### Zamknięte od 26.10 (nie ma ich na liście)
Deal 75192 (27.10, `2e60004`), okno 40889 z polskim progiem 540 zł (28.10), 18 flag ekskluzyw
(27.10, 33/36 potwierdzonych), kalendarz listopadowy (27.10 — decyzja: bez osobnego tekstu),
21333 w rejestrze (28.10), pamięć OutOfStock kart PK (28.10), filtr PK po zmianie feedu (28.10),
77253 odrzucone (28.10), 30727 u Wycofań (02.11) — **dziewięć pozycji w tydzień.** Pozycja 64
zestawów (Radar 29.10) jest zrobiona w danych (`65e99b4`, `7afa1cf`), ale nie ma linii zamknięcia —
zostaje na liście, dopóki ktoś jej nie dopisze.

---

## Ruch botów — filtr trzyma, dziura się powiększa

| Rodzaj | Kliknięć | Udział |
|---|---:|---:|
| bot (odrzucony przez filtr) | 2 269 | 95,0% |
| **„human" (przepuszczony do sieci)** | **117** | 4,9% |
| test (nasza diagnoza) | 2 | 0,1% |

Z 117 kliknięć „human" **74 jest z Polski, 43 spoza** — tydzień temu 17 spoza, czyli ×2,5.

### 43 kliknięcia spoza Polski — 40 ze strony głównej, 3 prawdziwe

| Wzorzec | Ile | Przykład |
|---|---:|---|
| referer `https://tylkoklocki.pl/` (z ukośnikiem), kraj spoza PL | **40** | 26.10 16:38:26–16:38:50: AR, PK, BR, MX, BR, CO — 6 kliknięć w 24 s, ME ×3, Allegro ×3 |
| referer huba, kraj spoza PL | 3 | NO ×2 (31.10 23:00, huby 75192 i 75367 **z ChatGPT**), DK (hub 75645) |

Sklepy w 40 sondowych: Media Expert 21, Allegro 18, x-kom 1. Kraje: BR 11, AR 5, JP 4
(28.10 04:08 — cztery kliknięcia w ten sam zestaw 76354 w 17 s), US 3, VE 3, dalej po 1–2
z 11 krajów. Serie: 26.10 16:38, 29.10 22:33–22:53, 31.10 05:03–05:05, 01.11 23:12–23:18.

**Wniosek, który zmienia decyzję z 26.10:** tamta reguła (referer bez ukośnika) celowała w 10 z 17
kliknięć zeszłego tygodnia; w tym tygodniu referer bez ukośnika nie wystąpił ani razu. Sondujący
poprawili nagłówek albo to inna sonda. Stała jest co innego: **strona główna jako referer plus
kraj spoza Polski** — 40 na 40 sondowych, 0 na 3 prawdziwych. Z Polski ze strony głównej przyszło
10 kliknięć: 6 w serii 26.10 11:32 (x-kom 75446, 43303 ×2, Allegro 43221, ME 72165 i 11370), kiedy
Marek sprawdzał cenę x-komu dla 43303 (commit 11:36) — to on; 4 pozostałe to pojedyncze wejścia do
Media Expertu w różne dni, zwykli ludzie. Reguła „strona główna + kraj spoza PL = bot" ich nie
dotyka. Decyzja 1.

Skala: 40 w tydzień to 1,7% ruchu botów odrzuconych (2 269), ale **100% tego, co przechodzi
do Performers i Allegro jako nasz „ludzki" ruch spoza Polski**. Udział „brak-linku": 0 na 117 —
siódmy tydzień z rzędu. Boty odrzucone: US 547, **PL 519**, DE 268, BR 204; sklepy Allegro 526,
Media Expert 389, LEGO.com 330.

---

## EPC per sklep

Kliknięcia: ruch ludzki z Polski. Prowizje: z API. Allegro, Planeta Klocków i x-kom —
EPC modelowe (brak API). EUR i PLN osobno.

| Sklep | Kliki PL 7 dni | Kliki PL 30 dni | Prowizja 30 dni | EPC 30 dni | Podstawa |
|---|---:|---:|---:|---:|---|
| Media Expert | 25 | 78 | 0,00 zł | **0,00 zł** | Performers: 116 klików u nich w 30 dni, 0 konwersji |
| Allegro | 21 | 48 | — | **model** | brak API |
| Empik | 6 | 22 | 1,28 EUR | **0,058 EUR** | TD: 1 transakcja w oknie (52,90 EUR obrotu), niezatwierdzona |
| LEGO.com | 5 | 16 | — | **0 z definicji** | brak programu |
| Smyk | 6 | 12 | 0,00 zł | **0,00 zł** | Adtraction: 0 |
| x-kom | 6 | 12 | — | **model** | SalesMasters, brak API |
| Ceneo | 3 | 11 | 0,42 EUR | 0,038 EUR | TD: 6 mikro-transakcji po 0,07 EUR |
| Lidl | 1 | 8 | 0,00 EUR | — | 1,84 EUR zatwierdzone (wrzesień, poza oknem) |
| Media Markt | 1 | 1 | 0,00 EUR | — | TD ACCEPTED, 0 transakcji |
| Planeta Klocków | 0 | 0 | — | **model** | webePartners, brak API |
| **Razem** | **74** | **208** | **1,70 EUR** | **0,008 EUR/klik** | 3 sieci z API |

Tydzień temu 187 kliknięć i 1,53 EUR w oknie 30 dni; dziś 208 i 1,70 EUR — ten sam EPC 0,008.
**Okno 60 dni: 10,83 EUR na 13 transakcji.** Ruch urósł dwukrotnie, prowizja nie — bo 47 z 74
kliknięć poszło do Media Expertu i Allegro, gdzie albo nic nie wpada (Performers), albo nic nie
widać (brak API).

### Performers liczy 2/3 — trzeci tydzień, koniec czekania

| Tydzień | Nasze kliknięcia PL do ME | Performers | Udział |
|---|---:|---:|---:|
| 13–19.10 | 29 | 18 | 62% |
| 20–26.10 | 18 | 12 | 67% |
| 27.10–02.11 | 25 | 16 | **64%** |

Trzeci tydzień, ta sama proporcja, wahanie 5 punktów. Jedno uczciwe zastrzeżenie: licząc
**wszystkie** kliknięcia „human" do ME (48, z sondą spoza PL), Performers widzi 33% — czyli
ich filtr odrzuca sondę lepiej niż nasz. To nie tłumaczy brakującej jednej trzeciej polskich.

Tekst maila do wklejenia (support Performers, program Media Expert, offer_id 1860):

> Dzień dobry, prowadzę serwis tylkoklocki.pl (wydawca w programie Media Expert, offer_id 1860).
> Porównuję od trzech tygodni kliknięcia, które mój serwer przekierowuje na Państwa link
> trackingowy (liczone po stronie serwera, tylko ruch z Polski, po odfiltrowaniu botów), z liczbą
> kliknięć w Państwa panelu. Wychodzi stale ok. 2/3: 13–19.10 — 29 u mnie / 18 u Państwa,
> 20–26.10 — 18 / 12, 27.10–02.11 — 25 / 16. Czy mogą Państwo powiedzieć, jak liczone są
> kliknięcia po Państwa stronie: czy jest okno deduplikacji (jakie), czy odrzucane są kliknięcia
> po User-Agent albo kraju, i czy jest sposób, żebym mógł sprawdzić, które z moich przekierowań
> nie zostały policzone? Mogę przesłać listę znaczników czasu. Pozdrawiam, Marek Dolewski.

---

## Widoczność w Google

| Okres | Kliknięcia | Wyświetlenia | CTR | Pozycja |
|---|---:|---:|---:|---:|
| 7 dni (24–31.10) | **2** | 127 | 1,57% | 27,5 |
| 14 dni (17–31.10) | 5 | 235 | 2,13% | 26,2 |
| Poprzednie 7 dni (z różnicy) | 3 | 108 | — | — |

Kliknięcia 3 → 2, wyświetlenia 127 → 127, pozycja 26,9 → 27,5. Dwa kliknięcia: `/aktualnosci/`
(pozycja 6) i `/artykuly/najwieksze-zestawy-lego-star-wars/` (pozycja 7). **65 podstron
z wyświetleniami** (tydzień temu 47, dwa tygodnie temu 24) — Google pokazuje coraz więcej
naszych stron, ale na pozycjach, z których nikt nie klika. Wyjątki, które mogą zacząć:
recenzja 60478 Betoniarki na pozycji **3**, recenzja 75438 Yody na pozycji **1** (po 1–2
wyświetleniach), tekst o Cargo Center na 5,5.

`/wycofania/`: 22 wyświetlenia, 0 kliknięć, pozycja 7,6. Strona główna 9 wyświetleń, pozycja 31,8.
Fraza numer jeden w 14 dniach nadal `me0110-311026` (kod Media Expertu, pozycja 1,3) — kod
wygasł 31.10, więc ta fraza zniknie w przyszłym tygodniu.

---

## Indeksacja

### Liczby z builda

| Miara | 19.10 | 26.10 | **02.11** | Zmiana t/t |
|---|---:|---:|---:|---:|
| Huby `/zestaw/` w buildzie | 9 830 | 9 879 | **9 936** | +57 |
| Huby w `sitemap-zestawy.xml` | 1 375 | 1 768 | **1 929** | +161 |
| Udział zgłoszonych | 14,0% | 17,9% | **19,4%** | +1,5 pkt |

Karty Piotra P07, partie 16–25, 28 i 03/04 (ok. 350 kart w tydzień). Build czysty.

### Inspekcja adresów przez API Search Console

| Adres | Werdykt | coverageState | Crawl | Wiek |
|---|---|---|---|---:|
| `/` | PASS | Submitted and indexed | 27.10 | 6 dni |
| `/artykuly/` | PASS | Submitted and indexed | 26.10 | 7 dni |
| `/aktualnosci/` | PASS | Submitted and indexed | 26.10 | 7 dni |
| `/serie/` | PASS | Submitted and indexed | 25.10 | 8 dni |
| `/wycofania/` | PASS | Submitted and indexed | 25.10 | 8 dni |
| `/ekskluzywne/` | PASS | Submitted and indexed | 26.10 | 7 dni |
| `/promocje-lego/` | PASS | Submitted and indexed | 26.10 | 7 dni |
| `/serie/marvel/` | PASS | Submitted and indexed | **01.11** | 1 dzień |
| `/zestaw/10280/` | PASS | Submitted and indexed | 11.09 | **52 dni** |
| `/zestaw/11208/` | NEUTRAL | **Discovered – currently not indexed** | — | — |
| `/artykuly/lego-30727-tie-advanced-gratis-lego-pl-listopad-2026/` | NEUTRAL | Discovered – currently not indexed | — | w dzisiejszej kolejce |

`/serie/marvel/` po 52 dniach odwiedzony 01.11 — sam, bez naszego zgłoszenia (strony serii nie są
w liście odświeżeń). Zapowiadałem, że dopiszę `/serie/<slug>/` do mechanizmu, jeśli zostanie na
11.09 — nie zostanie, więc nie dopisuję. `/zestaw/10280/` nadal 11.09, jedyny adres z listy powyżej
52 dni. `/zestaw/11208/` wrócił z „nieznany Google" na „wykryta – niezindeksowana" — kolejka go
zgłosiła, Google go zna, nie wziął.

Dzisiejsza kolejka: 15 adresów (5 powtórek od 01.11, 4 nowe teksty Piotra i Scouta, 6 deali
w nowym formacie), **0 odświeżeń działów** — wszystkie działy mają crawl z ostatnich 8 dni. Stan 238
sprawdzonych adresów: 217 zindeksowanych, 12 wykrytych, 4 zcrawlowanych bez indeksu, 5 nieznanych.
Premiera 11388 (Wenecka okolica, 16.10) ma już wyświetlenie w GSC; tekst o 30727 (TIE Advanced)
czeka w kolejce — seria „nowy tekst w ciągu doby" ma dziś pierwszą przerwę, o jeden tekst, i zobaczę
za tydzień, czy to wyjątek.

---

## Kontrola linków sklepowych

Wykonana przez Łowcę o 08:54 PL (`materialy/kontrola-linkow-2026-11-02.md`). Próba 150 linków,
**19 597 w całości (+324)**, martwych: **1**.

| Sklep | w próbie | żywe | martwe | blokada sklepu | nierozstrzygnięte |
|---|---:|---:|---:|---:|---:|
| planetaklockow | 53 | 53 | 0 | 0 | 0 |
| ceneo | 44 | 44 | 0 | 0 | 0 |
| smyk | 21 | 21 | 0 | 0 | 0 |
| lidl | 4 | 3 | **1** | 0 | 0 |
| mediamarkt | 3 | 3 | 0 | 0 | 0 |
| mediaexpert / empik / xkom / lego | 5 każdy | 0 | 0 | 5 każdy | 0 |
| allegro | 5 | 0 | 0 | 1 | 4 |

**Martwy: Lidl 10427** (interaktywny pociąg DUPLO, 404) — Łowca zostawił pozycję dla Marka,
bo `redirects.lidl` jest append-only. To pierwszy martwy link od początku października — cztery poniedziałki z rzędu miały zero.
O 25 linkach (16,7%) nie wolno powiedzieć „OK" — tyle samo co tydzień temu; o tych
mówi kontrola miesięczna w przeglądarce (następna 20.11).

**Zadanie dla `empik-redirects.mjs --usun-martwe`: brak.**

---

## TOP artykuły

**Po kliknięciach afiliacyjnych** (polski ruch do sklepu): `/artykuly/x-kom-black-weeks-2026-lego/`
— **4** (3 bezpośrednio, 1 z ChatGPT), `/artykuly/media-expert-kod-lego-pazdziernik-2026/` — 1
(ChatGPT). Reszta: huby 53 (21333 — 11, 43263 — 4, 75337 i 77982 po 2), `/promocje-lego/` 6.

**Po Google:** `/aktualnosci/` i `/artykuly/najwieksze-zestawy-lego-star-wars/` po jednym.

W tym tygodniu weszło **co najmniej dziesięć tekstów**: recenzja 60478 Betoniarki (ze zdjęciami),
LEGO DC 2027, Friends 2027, listopadowe premiery (Sagrada Família), ulice miasta od 1978, recenzja
75421 TIE Vadera, 30727 TIE Advanced gratis, 67005 Doctor Strange, deal 75192, deal 42689 — plus
**17 tekstów `/deale/` w nowym formacie „Zestawy pod lupą"** (30.10) i ok. 350 kart. Teksty dealowe
i kodowe nadal jako jedyne zbierają kliknięcia afiliacyjne (x-kom Black Weeks 4 w drugim tygodniu
życia); recenzje zaczynają pokazywać się w Google na pozycjach 1–3 przy pojedynczych
wyświetleniach — za wcześnie na kliknięcia, za dobrze, żeby nie zapisać.

---

## Trzy decyzje na ten tydzień

### 1. Strona główna jako referer + kraj spoza PL = bot *(Marek, worker)*
Zmieniona wobec 26.10: tamta reguła (bez ukośnika) złapałaby dziś 0 z 40. Ta łapie 40 z 40
sondowych i 0 z 3 prawdziwych kliknięć spoza Polski, a z 10 polskich ze strony głównej nie
dotyka żadnego. Jedna reguła w `src/worker.js`, worker = pytam przed pushem.
**Zrobić:** zgoda. **Kto:** Marek.

### 2. Mail do Performers *(Marek)*
62% → 67% → 64%. Trzeci tydzień był warunkiem — jest. Tekst do wklejenia w sekcji EPC.
**Zrobić:** wysłać. **Kto:** Marek.

### 3. Feed Ceneo — zgłoszenie do Tradedoublera *(Marek)*
PF_392 od 01.11; 1 808 ofert Ceneo w hubach starzeje się od 27.10, a Ceneo to jedyna sieć
z zatwierdzonymi transakcjami poza Empikiem. Ten sam wzorzec, który Lidl rozwiązał akceptem
w dwa dni. **Zrobić:** zgłoszenie w panelu TD (program 385881, feed 256472). **Kto:** Marek.

---

## Czego w tym raporcie nie ma

- **Ręcznego odczytu paneli Allegro, Planety Klocków i SalesMasters** — decyzja 22.09; SalesMasters
  stoi jako pozycja z 19.10 (14 dni).
- **Mnożnika do 20 000 zł** — cel na 2027.
- **Nowego odczytu liczby zaindeksowanych** — panel ma 837 z 12.10; trzecia prośba w „Kto co robi".
- **Cen Empiku i x-komu z dzisiaj** — zrzuty nie weszły do 09:46 PL.
- **Odpowiedzi, kto sonduje linki ze strony głównej i po co** — widzę wzorzec, nie źródło; reguła
  z decyzji 1 zamyka go niezależnie od odpowiedzi.
- **Wyjaśnienia brakującej 1/3 u Performers** — to pytanie do nich, decyzja 2.
- **Skutku nowego kanału GitHub skrzynki Piotra i panelu** — oba mają dzień; kontrola za tydzień.
