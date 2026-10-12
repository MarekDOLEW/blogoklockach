# Audyt 12.10.2026: indeksacja, ruch i afiliacje

Tylko odczyt. Stan repo: `origin/main` @ `49c795a`. Odczyty z 12.10 między 09:20 a 09:50 UTC:
Search Console API (lista map GET, URL Inspection, Search Analytics), Cloudflare (Analytics
Engine `idz_kliki`, GraphQL R2/Workers), Tradedoubler Publisher API i Products API, Adtraction,
Performers i Firecrawl. Punkty odniesienia: `materialy/audyt-2026-09-30.md` (sekcje 1, 2, 3, 5)
i `materialy/kontroler-2026-10-12.md` (dzisiaj, 07:20 UTC). Liczby Kontrolera sprawdziłem
ponownie: GSC 7 dni (1 klik, 59 wyświetleń, poz. 29,0), kliknięcia 7 dni (725 „human” wobec jego
724; okno się przesunęło), prowizje 30 dni (9,25 EUR) i inspekcję 9 adresów, które pokrywają się
z moją listą. Wszystko się zgadza. Poniżej opisuję tylko to, czego w jego raporcie nie ma
albo co wychodzi inaczej.

## Najważniejsze

1. **MediaMarkt jest zaakceptowany w Tradedoublerze od 20.08.2026, a my o tym nie wiemy.**
   Rejestr afiliacji (ostatnia aktualizacja 17.09) nadal ma status „wysłane”. Publisher API
   zwraca `Media Markt (PL)`: `statusId 3 ACCEPTED`, zmiana 20.08 14:36. Program ma feed
   `MediaMarkt_feed` (fid 96394, 15 147 produktów, w tym **112 trafień na „LEGO”**). To jedyny
   nowy sklep z prowizją, który można podpiąć bez czekania na nikogo.
2. **RTV Euro AGD odrzucił zgłoszenie 03.09.2026** (`statusId 5 REJECTED`). W rejestrze
   nadal jest „wysłane”.
3. **Od 30.09 nie było ani jednej transakcji w żadnej z trzech sieci z API** (12 dni, ok. 53
   kliknięcia z Polski). Kwota 9,25 EUR za 30 dni to dokładnie te same 6 transakcji co w audycie
   30.09, wszystkie z 12–30.09.
4. **Wyświetlenia w Google spadły około czterokrotnie po 22.09:** z ok. 33 dziennie (12–22.09)
   do ok. 7,6 dziennie (23.09–09.10). Spośród 15 kliknięć z 28 dni 7 dał `/zestaw/11387/`
   w trzech dniach (13–15.09). Od 16.09 ta strona nie ma ani jednego wyświetlenia, choć nadal
   jest w indeksie.
5. **Impresje `/wycofania/` to w większości zapytania z operatorami** (`"ahsoka" "star wars"`,
   `"klasyka" "kolekcjonerski" -"komercyjny"`, `"strażników galktyki"`). Tak wyglądają
   zapytania narzędzi i scraperów, nie czytelników. Zerowy CTR tej strony nie musi więc wynikać
   z tytułu ani z nieświeżego crawla. Szczegóły w sekcji 2.
6. **Filtr botów nadal przecieka po fali 10.10.** Pojawiają się nowe warianty referera bez
   ukośnika: `/serie/friends`, `/serie/creator`, `/serie/archiwum`, `/wycofania`,
   `/wycofania?q=11198` i `/zestaw/30716`. **Performers zarejestrował 10.10 59 kliknięć**
   (przy 1–4 dziennie w pozostałe dni), więc fala dotarła do sieci Media Expertu.

---

## 1. Indeksacja

### 1.1 Mapy witryn (GSC API, GET `/sitemaps`)

| Mapa | lastSubmitted | lastDownloaded | isPending | Ostrzeżenia | Błędy | Adresy (`contents.submitted`) | Na żywo dziś |
|---|---|---|---|---:|---:|---:|---:|
| sitemap-index.xml (indeks) | 29.09 11:41 | 10.10 08:23 | nie | 0 | 0 | 1 460 | — |
| sitemap-zestawy.xml | 29.09 11:41 | 09.10 07:32 | nie | 0 | 0 | 1 291 | 1 291 |
| sitemap-serie.xml | 29.09 11:41 | 08.10 22:53 | nie | 0 | 0 | 69 | 69 |
| sitemap-artykuly.xml | **11.10 10:53** | 11.10 11:21 | nie | 0 | 0 | 40 | 40 |
| sitemap-prezentowniki.xml | 29.09 11:41 | 11.10 02:47 | nie | 0 | 0 | 25 | 25 |
| sitemap-deale.xml | 29.09 11:41 | 11.10 08:23 | nie | 0 | 0 | 14 | 15 |
| sitemap-nowosci.xml | 29.09 11:41 | 10.10 19:18 | nie | 0 | 0 | 13 | 13 |
| sitemap-inne.xml | 29.09 11:41 | 10.10 14:41 | nie | 0 | 0 | 8 | 8 |

Godziny w UTC. **Zmiana od 30.09:** łącznie 1 357 → **1 460** adresów (+103), map nadal
8 z zerem błędów. Google pobiera każdą mapę co 1–3 dni, więc samo zgłaszanie map nie jest
wąskim gardłem. Mapa artykułów była ponownie zgłoszona 11.10, najpewniej przy publikacji
recenzji. Pole `indexed` w API pokazuje 0 we wszystkich mapach (to znana wada API). Liczbę
zaindeksowanych stron widać tylko w panelu, patrz prompt dla Coworka. Wszystkie 15 adresów
z `sitemap-deale.xml` odpowiada 200.

### 1.2 Inspekcja adresów (URL Inspection API)

| Adres | Werdykt | coverageState | Ostatni crawl (UTC) | Wiek | Stan 30.09 |
|---|---|---|---|---:|---|
| `/` | PASS | Submitted and indexed | 11.10 07:10 | 1 d | zindeksowana 29.09 |
| `/artykuly/` | PASS | Submitted and indexed | 11.10 07:12 | 1 d | dział z 15.09 |
| `/nowosci/` | PASS | Submitted and indexed | 15.09 07:35 | **27 d** | dział z 15.09 |
| `/serie/` | PASS | Submitted and indexed | 15.09 07:35 | **27 d** | dział z 15.09 |
| `/serie/icons/` | PASS | Submitted and indexed | 11.09 21:04 | **31 d** | — |
| `/przecieki/` | PASS | Submitted and indexed | 22.09 10:11 | 20 d | — |
| `/promocje-lego/` | PASS | Submitted and indexed | 29.09 12:34 | 13 d | zindeksowana 29.09 |
| `/wycofania/` | PASS | Submitted and indexed | 15.09 06:47 | **27 d** | dział z 15.09 |
| `/ekskluzywne/` | PASS | Submitted and indexed | 22.09 10:09 | 20 d | — |
| `/aktualnosci/` | PASS | Submitted and indexed | 30.09 07:50 | 12 d | **wykryta, niezindeksowana → dziś w indeksie** |
| `/artykuly/lego-75434-droid-straznik-k-2so-recenzja/` (11.10) | PASS | Submitted and indexed | 11.10 10:47 | 1 d | nowy |
| `/artykuly/lego-42650-sklep-z-akcesoriami-dla-zwierzat-recenzja/` (11.10) | PASS | Submitted and indexed | 11.10 10:47 | 1 d | nowy |
| `/artykuly/x-kom-aplikacja-weekend-lego-pazdziernik-2026/` (10.10) | PASS | Submitted and indexed | 10.10 16:01 | 2 d | nowy |
| `/artykuly/media-expert-kod-lego-pazdziernik-2026/` (10.10) | PASS | Submitted and indexed | 10.10 15:55 | 2 d | nowy |
| `/zestaw/10312/` | PASS | Submitted and indexed | 30.09 07:54 | 12 d | **noindex → dziś w indeksie** |
| `/zestaw/75350/` | PASS | Submitted and indexed | 30.09 07:56 | 12 d | **nieznany → dziś w indeksie** |
| `/zestaw/76417/` | PASS | Submitted and indexed | 30.09 07:56 | 12 d | na liście do zgłoszenia |
| `/zestaw/10294/` | **NEUTRAL** | **Excluded by ‘noindex’ tag** | 11.09 16:03 | 31 d | — |
| *uzupełniające (lista z 30.09):* | | | | | |
| `/artykuly/x-kom-wyzsza-szkola-rabatu-2026-lego/` | PASS | Submitted and indexed | 30.09 07:52 | 12 d | wykryta, niezindeksowana → w indeksie |
| `/artykuly/lego-31163-psotny-kot-recenzja/` | PASS | Submitted and indexed | 30.09 07:52 | 12 d | nieznany → w indeksie |
| `/zestaw/75355/`, `/zestaw/21067/`, `/zestaw/42240/` | PASS | Submitted and indexed | 30.09 07:58–08:02 | 12 d | na liście do zgłoszenia |
| `/zestaw/75389/` | **NEUTRAL** | **Discovered – currently not indexed** | — | — | na liście do zgłoszenia, nadal poza indeksem |
| `/zestaw/11387/` | PASS | Submitted and indexed | 02.10 22:10 | 10 d | — |
| `/deale/` (301 → `/promocje-lego/`) | PASS | Submitted and indexed | 15.09 07:48 | **27 d** | „jeszcze jako strona” → bez zmian |
| `/prezentowniki/` | PASS | Submitted and indexed | 15.09 07:37 | **27 d** | dział z 15.09 |

Trzy najnowsze artykuły wybrałem po polu `data`. Dwa teksty mają datę 10.10, więc na liście
są cztery.

**Wnioski z porównania z 30.09:**
- **Ręczne zgłoszenia Coworka z 30.09 zadziałały w 9 przypadkach na 10.** Wszystkie adresy
  z tamtej listy mają crawl 30.09 między 07:50 a 08:02 i są w indeksie. Wyjątkiem jest
  `/zestaw/75389/`, nadal „wykryty, niezindeksowany”. Trzeba sprawdzić, czy prośba w ogóle
  została wysłana (mógł się skończyć dzienny limit).
- Nowe artykuły trafiają do indeksu w ciągu 1–2 dni. Dotyczy to wszystkich czterech tekstów
  z 10–11.10.
- **Huby działów się starzeją:** `/nowosci/`, `/serie/`, `/wycofania/`, `/prezentowniki/`
  i `/deale/` mają crawl z 15.09 (27 dni), a `/serie/icons/` z 11.09 (31 dni). W ciągu dwóch
  tygodni nic się tu nie zmieniło. `/deale/` od 29.09 przekierowuje 301, ale Google jeszcze
  tego nie widział.
- `/zestaw/10294/` (Titanic) ma `noindex` celowo: to cienki hub według
  `hubIndeksowalny()` w `src/lib/seo.js` i nie ma go w mapie. Jeśli Titanic ma rankować,
  potrzebuje karty albo tekstu. Same reguły działają poprawnie.

---

## 2. Widoczność w Google (Search Analytics)

| Okno | Zakres | Kliknięcia | Wyświetlenia | CTR | Śr. pozycja |
|---|---|---:|---:|---:|---:|
| 7 dni | 03–10.10 | **1** | **59** | 1,69% | 29,0 |
| poprzednie 7 dni (różnica okna 14 dni) | 26.09–02.10 | 4 | 57 | 7,0% | — |
| 14 dni | 26.09–10.10 | 5 | 116 | 4,31% | 23,8 |
| 28 dni | 12.09–10.10 | **15** | **491** | 3,05% | 19,8 |
| poprzednie 28 dni (różnica okna 56 dni) | 15.08–11.09 | 8 | 224 | 3,6% | — |
| *30.09 (audyt), 7 dni* | 21–28.09 | 1 | 59 | — | — |

**Trend dzienny jest ważniejszy niż porównanie okien.** Średnia z 28 dni (15 kliknięć,
491 wyświetleń, około dwa razy więcej niż w poprzednich 28 dniach) zawiera jednorazowy szczyt:

| Okres | Wyświetlenia/dzień | Kliknięcia w okresie |
|---|---:|---:|
| 12–22.09 | **32,9** (bez 11387: 22,4) | 9 |
| 23.09–09.10 | **7,6** | 6 |

- `/zestaw/11387/` (Świąteczny dom): 13–15.09 miał 100 wyświetleń i 7 kliknięć na pozycji
  3,7–4,8. **Od 16.09 ma zero wyświetleń,** choć jest w indeksie (crawl 02.10). Ruch był
  jednorazowy i przyszedł z frazy „lego 11387”.
- Bez tego szczytu wyświetlenia serwisu spadły po 22.09 z ok. 22 do ok. 8 dziennie. Kliknięcia
  zostały na poziomie szumu, 0–2 dziennie. **API nie wyjaśnia przyczyny.** Trzeba sprawdzić
  w panelu, czy w tym czasie nie spadła liczba zaindeksowanych stron (prompt dla Coworka,
  krok 1).

**Top frazy, 28 dni:** „lego 11387” (7 kliknięć / 108 wyświetleń / poz. 4,5), „lego batmobil”
(0/9/34,7), „lego upominki” (0/8/29,8), „klocków” (0/6/97,5). **Z 266 wyświetleń
przypisanych do fraz 41 pochodzi z zapytań z cudzysłowami lub operatorami**, a 225 wyświetleń
w ogóle nie ma frazy (anonimizacja). W 7 dniach jest 16 fraz i żadna nie dała kliknięcia.

**Top strony, 28 dni:** `/zestaw/11387/` 7/116/4,5; `/` 7/26/30,3;
`/artykuly/lego-bam-pazdziernik-2026/` 1/1/5; `/wycofania/` **0/100/7,3**; `/nowosci/`
0/22/34,5; `/artykuly/`, `/kalendarz-promocji-lego/` i `/prezentowniki/` po 13 wyświetleń.
Strony w top 10 z ≥3 wyświetleniami i zerem kliknięć: `/zapowiedzi-lego-2027/` (5,3),
`/artykuly/x-kom-wyzsza-szkola-rabatu-2026-lego/` (2,8), `/przecieki/` (4,5),
`/serie/icons/` (2,7), `/zestaw/31221/` (9,3), ranking kalendarzy adwentowych (9,5).

**Uzupełnienie do decyzji 2 Kontrolera (`/wycofania/`).** Zapytania, które w 28 dniach
przyniosły tej stronie wyświetlenia, wyglądają tak: `"ahsoka" "star wars"` (5),
`"strażników galktyki"` (5, z literówką), `"ahsoki"` (4), `"stranger things" "tales from '85"`
(4), `"klasyka" "kolekcjonerski" -"komercyjny"` (2), `"smyk wycofany"`. Takich zapytań
z cudzysłowami i wykluczeniami zwykli czytelnicy praktycznie nie wpisują. Zostawiają je
narzędzia do śledzenia pozycji i scrapery treści. Zero kliknięć jest więc spodziewane
i nie potwierdza ani hipotezy „zły tytuł”, ani „stary crawl”. Ponowny crawl warto zlecić,
bo jest tani, ale poprawy CTR nie należy się po nim spodziewać.

---

## 3. Ruch afiliacyjny (`/idz/`, Analytics Engine)

### 3.1 Ruch ludzki i boty

| Okno | bot (odrzucony) | „human” (przepuszczony) | z tego Polska | nieoznaczone (sprzed 14.09) |
|---|---:|---:|---:|---:|
| 7 dni | 15 867 | 725 | **34** | 0 |
| 30 dni | 42 728 | 954 | **186** | 335 |

W 30 dniach 768 kliknięć „human” spoza Polski, w tym 151 z Brazylii i 79 z USA. To fala
z 10–11.10, nasze testy i kilka zagranicznych kliknięć. **Dalej liczę wyłącznie Polskę.**

### 3.2 Per sklep, kliknięcia „human” z Polski

| Sklep | 7 dni | 30 dni | 30.09 (audyt, 30 dni) | Wszystkie „human” 7 dni (z botami z fali) |
|---|---:|---:|---:|---:|
| Media Expert | 10 | **52** | 40 | 75 |
| Allegro | 12 | **50** | 45 | 426 |
| Empik | 1 | 25 | 22 | 139 |
| LEGO.com | 1 | 20 | 35 | 16 |
| Smyk | 3 | 15 | 16 | 17 |
| Ceneo | 2 | 9 | 11 | 17 |
| Lidl | 3 | 7 | 4 | 11 |
| x-kom | 2 | 6 | 6 | 17 |
| Planeta Klocków | 0 | 2 | 9 | 7 |
| **Razem** | **34** | **186** | **188** | **725** |

Suma z 30 dni stoi w miejscu (188 → 186). LEGO.com spadło z 35 do 20, Planeta z 9 do 2,
a Media Expert wzrósł z 40 do 52.

### 3.3 Per dzień, Polska

| Dzień | 28.09 | 29 | 30 | 01.10 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 (do 09:45 UTC) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Kliknięcia | 10 | 4 | 3 | 2 | 1 | 5 | 6 | 3 | 7 | 3 | 7 | 5 | 1 | 9 | 1 |

| Okres | Kliknięć | Średnio dziennie | Mediana |
|---|---:|---:|---:|
| 14–27.09 | 119 | 8,5 | 7 |
| 28.09–11.10 | 66 | **4,7** | **4,5** |

Kontroler opisuje ruch jako płaski, w przedziale 5–7. Według mediany jest **lekki spadek**:
z 7 do 4,5 kliknięcia dziennie, także po odrzuceniu szczytów 16.09 (20) i 27.09 (28).

### 3.4 Z których stron serwisu klikają (Polska)

| Typ strony | 7 dni | 30 dni |
|---|---:|---:|
| Huby `/zestaw/` | 27 (79%) | 132 (71%) |
| Strona główna | 1 | 16 |
| Artykuły | 1 | 16 |
| `/promocje-lego/` + `/deale/` | 4 | 14 |
| Prezentowniki | 1 | 5 |
| Inne (`/wycofania/`, `/serie/city/`) | 0 | 3 |

**Wejścia z ChatGPT** (`utm_source=chatgpt.com` w refererze): 5 z 34 (15%) w 7 dniach
i **46 z 186 (25%) w 30 dniach**. Google w tych samych 28 dniach dał 15 kliknięć
w wynikach wyszukiwania, czyli z ChatGPT przychodzi więcej kliknięć do sklepów niż
z Google wejść na serwis w ogóle.
Najczęstsze referery w 30 dniach: `/` (15), `/promocje-lego/` (6), recenzja 60508 (6),
`/zestaw/60339/`, `/zestaw/42182/`, `/zestaw/75372/` i `/deale/` (po 4), prezentownik Technic
z ChatGPT (4) oraz „Na rozpoczęcie roku szkolnego” z ChatGPT (4).

### 3.5 Nasz własny ruch w liczbach

- **Brak refererów z `localhost`, `127.0.0.1`, `*.workers.dev` i `*.pages.dev`** w 30 dniach.
  Testy Playwright z 11–12.10 (o ile przeszły przez produkcję) nie kliknęły w `/idz/`
  i nie zaburzają tych liczb.
- **`scripts/diagnoza.mjs` (pełna wersja) zapisuje się jako „human”.** Kontrola
  „link_sklepu_z_przegladarki” robi `/idz/lego/76355` z nagłówkiem
  `sec-fetch-site: same-origin`, a filtr przepuszcza ją jak przeglądarkę. Dziś były dwa takie
  kliknięcia: 07:00 i 09:00 UTC, USA, pusty referer. To 1–2 kliknięcia na każdy przebieg pełnej
  diagnozy, idą do LEGO.com (bez programu, więc bez szkody dla sieci), ale dokładają się do
  liczby „human” z USA (18 w 30 dniach z pustym refererem).
- 16.09 09:00 UTC było 17 kliknięć z refererem `https://tylkoklocki.pl/zestaw/x/` (USA,
  „human”, 17 różnych sklepów). To nasz test z audytu 15–16.09, który wypada z okna 30 dni
  14.10.
- PL „bot” 12.10 07:00 UTC: 7 kliknięć do Media Expertu z pustym refererem. Wzór nie pasuje do
  naszych skryptów (kontener wychodzi z USA). Możliwe, że to crawler sieci albo sklepu
  sprawdzający linki. Nie sprawdzono.

### 3.6 Fala botów: co jest nowe od raportu Kontrolera

- Dni „human” spoza Polski: 10.10 **643**, 11.10 **39**, 12.10 5 (do 09:45 UTC). Fala opadła,
  ale się nie skończyła.
- **Warianty referera z 11–12.10 wychodzą poza dwa opisane przez Kontrolera:**
  `/serie/friends`, `/serie/creator`, `/serie/archiwum`,
  `/serie/ekskluzywne-i-promocyjne`, `/wycofania`, `/wycofania?q=11198`, `/zestaw/30716`
  (każdy bez ukośnika) oraz `/idz/<sklep>/42200`. **Łatka 1 Kontrolera („ścieżka referera
  musi kończyć się ukośnikiem”) obejmuje je wszystkie,** pod warunkiem że sprawdza ścieżkę
  bez query stringa. Wariant `/wycofania?q=` pokazuje, że inaczej łatka przepuści
  `/wycofania?q=…`.
- **Performers (Media Expert) potwierdza przez API, że fala dotarła do sieci:** kliknięcia
  dzienne po ich stronie 28.09–12.10 wynosiły 4, 1, 3, 2, 3, 2, 4, 1, **59** (10.10), 2, 1.
  Konwersji było zero. W 30 dniach Performers liczy 160 kliknięć, a my z Polski 52.
- Kraje botów odrzuconych w 7 dniach: BR 3 361, AR 996, PK 645, US 629, MX 575.
  Referer `https://tylkoklocki.pl/promocje-lego` (bez ukośnika) dał 234 kliknięcia
  odrzucone i 115 przepuszczonych.

---

## 4. Prowizje (API sieci)

| Sieć / program | 30 dni (12.09–12.10) | Od 30.09 (12 dni) | 60 dni | Zatwierdzone |
|---|---|---|---|---|
| Tradedoubler, **EUR** | **6 transakcji, 9,25 EUR** | **0** | 6 / 9,25 EUR | 1 (Lidl) |
| – Empik | 3 tr., obrót 325,44 EUR, 7,23 EUR (2,22%) | 0 | to samo | 0 |
| – Lidl Sklep Online | 1 tr., obrót 46,52 EUR, 1,86 EUR (4,00%) | 0 | to samo | **1** |
| – Ceneo.pl | 2 tr., 0,16 EUR | 0 | to samo | 0 |
| Adtraction (Smyk, Egmont), **PLN** | 0 | 0 | 0 | 0 |
| Performers (Media Expert), **PLN** | 160 kliknięć, 0 konwersji, 0 zł | 77 kliknięć, 0 | 1 375 kliknięć, 0 | — |
| Allegro, webePartners, SalesMasters | brak API | | | |

**Porównanie z 30.09:** 9,25 EUR w 30 dniach przed i po, ale to są **te same transakcje**.
Od 30.09 nie przybyło nic. Zmienił się tylko status Lidla, który jest pierwszą zatwierdzoną
prowizją w historii serwisu (Kontroler). Wszystkie 6 transakcji z 60 dni mieści się w oknie
12–30.09.

**EPC per sklep** (kliknięcia z Polski w 30 dniach, prowizja w 30 dniach; próby są bardzo
małe, więc to orientacyjne wartości, nie stawki):

| Sklep | Kliknięcia PL 30 d | Prowizja 30 d | EPC | Uwagi |
|---|---:|---:|---:|---|
| Empik | 25 | 7,23 EUR | **0,29 EUR** | n = 3, 0 zatwierdzonych, cookie 7 dni |
| Lidl | 7 | 1,86 EUR | **0,27 EUR** | n = 1, zatwierdzona |
| Ceneo | 9 | 0,16 EUR | 0,02 EUR | Ceneo to porównywarka, prowizja symboliczna |
| Media Expert | 52 | 0 zł | 0 | 160 kliknięć u Performers, 0 konwersji |
| Smyk | 15 | 0 | 0 | celowo bez prowizji (link prosto na kartę) |
| LEGO.com | 20 | 0 | 0 | brak programu |
| Allegro | 50 | ? | — | brak API, panel |
| x-kom | 6 | ? | — | brak API, panel |
| Planeta Klocków | 2 | ? | — | brak API, panel |
| **Łącznie zmierzone** | 186 | 9,25 EUR | **0,05 EUR** | |

---

## 5. Afiliacje: statusy

| Sklep | Sieć | Rejestr (`afiliacje_rejestr.json`, 17.09) | Stan faktyczny 12.10 | Źródło |
|---|---|---|---|---|
| **MediaMarkt** | Tradedoubler (229227) | wysłane | **ACCEPTED od 20.08.2026**, feed 96394 (112 × LEGO) | TD Publisher API + Products API |
| **RTV Euro AGD** | Tradedoubler (118512) | wysłane | **REJECTED 03.09.2026** | TD Publisher API |
| Empik | Tradedoubler (289664) | aktywny | ACCEPTED 19.08 | TD API |
| Ceneo | Tradedoubler (300324 i 385881 CPS) | aktywny | oba ACCEPTED | TD API |
| Lidl | Tradedoubler (298327) | aktywny | ACCEPTED 17.09 | TD API |
| Allegro (TD) | Tradedoubler (288386) | aktywny (program własny + TD) | ACCEPTED 20.08 | TD API |
| Erli | Tradedoubler (316767) | do zgłoszenia | nie zgłoszone (NONE) | TD API |
| Proshop | Awin | wysłane 19.08 | **nie sprawdzono** (brak klucza Awin w środowisku) | — |
| Smyk | Adtraction | aktywny, **linkujemy bez prowizji** | bez zmian (0 transakcji) | Adtraction API |
| Egmont | Adtraction | aktywny | 0 transakcji | Adtraction API |
| LEGO.com | Rakuten | odmowa 15.09, **linkujemy bez prowizji** | bez zmian; 20 kliknięć z PL w 30 dniach | rejestr |
| Media Expert | Performers | aktywny | kliknięcia notowane, 0 konwersji od 60 dni | Performers API |
| Planeta Klocków | webePartners | aktywny | nie sprawdzono (panel) | — |
| x-kom / al.to | SalesMasters | aktywny | nie sprawdzono (panel) | — |
| Allegro | Allegro Affiliate | aktywny | nie sprawdzono (panel) | — |

**Zmiany od 30.09:** w repo żadna, bo rejestru nikt nie ruszał od 17.09. W sieciach dwie
zmiany, które **istniały już przed 30.09** i nie zostały odnotowane (MediaMarkt 20.08,
RTV Euro 03.09). Audyt 30.09 zalecał „ponowić MediaMarkt i RTV Euro w panelach”, a MediaMarkt
był wtedy zaakceptowany od sześciu tygodni. Rejestr wymaga aktualizacji. Zgodnie z regułą
z `_meta.zasada` statusy potwierdza się w panelu.

---

## 6. Firecrawl, Cloudflare, R2

**Firecrawl (API `team/credit-usage`):** plan **5 000 kredytów** w okresie 23.09–23.10
(potwierdzone przez API, rozbieżność z „1 500” z 22.09 jest rozstrzygnięta). **Zostało 3 034**
(30.09: 4 175; Kontroler o 07:20: 3 054). Zużycie w okresie: 1 966 w 19 dni, ok. 103 dziennie.
Przy tym tempie do 23.10 zostanie ok. 1 900, więc zapas jest.

| Miesiąc | Razem | Sesje (MCP, „Connected app”) | Skrypty (klucz „Default”) |
|---|---:|---:|---:|
| wrzesień | 1 475 | 1 048 (71%) | 427 (29%) |
| październik (1–12) | 843 | 435 (52%) | **408 (48%)** |

Skrypty zużyły w 12 dniach października prawie tyle co przez cały wrzesień, ok. 34 dziennie
wobec ok. 14. Prawdopodobne źródła to Scout/Wycofania z nowym `lego-ostatnie.mjs`
(ok. 16 kredytów na przebieg, od 12.10), Dane wt (ok. 75 na tydzień) oraz `me-ceny-stron.mjs`
i `me-kody.mjs`. Nie sprawdzono, bo API nie rozbija zużycia na skrypty.

**Cloudflare:**

| Zasób | 30.09 | **12.10** | Limit Free | % |
|---|---:|---:|---:|---:|
| Pliki w `dist` (build 12.10 09:41) | 10 022 | **10 038** (9 978 HTML) | 20 000 | 50% |
| Worker, żądania/dzień (30 dni) | śr. 6 168, max 22 837 | śr. 5 361, max 22 837 (14.09); 07.10: 16 660 | 100 000 | 5% (szczyt 23%) |
| R2, obiekty | 11 563 | **81 216** | — | — |
| R2, magazyn | 1,16 GB | **3,27 GB** | 10 GB | 33% |
| R2, operacje A (PutObject, 30 dni) | 7,2 tys./mies. | 76 tys. | 1 mln | 8% |
| R2, operacje B (GetObject, 30 dni) | 95 tys./mies. | 122 tys. | 10 mln | 1% |

R2 urósł skokowo 08.10 (z 11 573 do 81 055 obiektów), gdy weszły warianty WebP (commit
`132d210`, `warianty-obrazow.mjs`). Skok był jednorazowy i potem przybywa jak dotąd,
kilkanaście obiektów dziennie. Ograniczeniem jest teraz 10 GB magazynu, nie liczba plików:
dogrywanie galerii ma do wykorzystania ok. 6,7 GB.

---

## Do zrobienia

1. **Podpiąć MediaMarkt** *(Code, po potwierdzeniu w panelu TD: stawka dla zabawek/LEGO,
   warunki publikacji)*. W `feedy.json` dodać feed 96394 (wzorem Lidla, `ceneo-feed.mjs
   --sklep`), w `afiliacje_rejestr.json` status „aktywny”, i dopiero wtedy wiersz w tabelach.
   Do tego czasu nowy sklep z prowizją stoi niewykorzystany.
2. **Zaktualizować rejestr afiliacji** *(Code)*: MediaMarkt ACCEPTED 20.08, RTV Euro
   REJECTED 03.09, `zaktualizowano` na 12.10, wpis w `_meta.decyzje`. Do tego krok w
   Kontrolerze albo w `diagnoza.mjs`: odczyt statusów programów TD przez Publisher API
   (`GET /publisher/programs?sourceId=3494691`), żeby zmiana statusu nie leżała niezauważona
   przez dwa miesiące.
3. **Łatka filtra botów** *(decyzja 1 Kontrolera, zgoda Marka; zmiana w `src/worker.js`)*.
   Do jego trzech punktów warto dopisać: ukośnik sprawdzać na ścieżce **bez query stringa**
   (wariant `/wycofania?q=11198`) i odrzucać referer `/idz/` także wtedy, gdy przychodzi
   z `Sec-Fetch-Site`. Przy okazji: **`diagnoza.mjs` powinna przy kontroli `/idz/` ustawiać
   rozpoznawalny znacznik** (np. `?diag=1` albo własny nagłówek, który worker zapisuje jako
   „test”), żeby przestać liczyć się jako „human”.
4. **Odczyt z paneli** *(Cowork, prompt niżej)*: liczba zaindeksowanych stron i przyczyny,
   prowizje Allegro, Planety i x-komu, potwierdzenie MediaMarktu, Proshop, sprawdzenie, czy
   fala z 10.10 jest widoczna w Allegro. Bez tych danych kamień 4 i spadek wyświetleń po 22.09
   zostają bez wyjaśnienia.
5. **Spadek wyświetleń po 22.09** *(Code/SEO, po danych z panelu)*: zestawić liczbę
   zaindeksowanych stron 18.09 (807) z dzisiejszą. Jeśli spadła, sprawdzić przyczyny
   w raporcie „Strony”. Jeśli nie spadła, problem leży w pozycjach, nie w indeksie.
6. *(niżej)* `/zestaw/75389/` ponownie do „Poproś o zindeksowanie” razem z `/wycofania/`,
   `/serie/` i `/serie/icons/`. To decyzja Marka, a ten audyt niczego nie zgłasza.
   Przy `/wycofania/` spodziewać się raczej przyrostu crawla niż kliknięć (sekcja 2).
7. *(niżej)* Titanic 10294 i inne duże zestawy z `noindex`: lista hubów RRP > 1 000 zł bez
   karty to kandydaci na karty redakcyjne, bo dziś ich nie widać w Google z założenia.

---

## Potrzebne dane z paneli (Cowork)

Przez API nie da się odczytać:
- liczby zaindeksowanych i niezaindeksowanych stron oraz tabeli przyczyn z raportu „Strony”
  w GSC, a także kolumny „Wykryte strony” w mapach;
- kliknięć, transakcji i prowizji w **Allegro Affiliate**, **webePartners** (Planeta
  Klocków) i **SalesMasters** (x-kom/al.to), bo nie mają API w rejestrze;
- stawki i warunków **MediaMarkt** w panelu Tradedoublera oraz powodu odrzucenia przez
  RTV Euro;
- statusu **Proshop** (i Zalando) w **Awin**, bo w środowisku nie ma klucza Awin;
- statusu Smyka i Egmonta w Adtraction (API daje transakcje, nie warunki), stanu LEGO
  w Rakuten i ewentualnego konta w Admitad;
- **ruchu na stronach** z Cloudflare Web Analytics (token API nie ma uprawnień do strefy,
  403 w audycie 30.09).

### Prompt dla Coworka (do wklejenia)

```
Zadanie: ODCZYT danych z paneli dla tylkoklocki.pl (audyt 12.10.2026). TYLKO CZYTASZ.
Nie klikaj „Poproś o zindeksowanie”, nie zgłaszaj map witryn, nie wysyłaj żadnych formularzy,
nie zmieniaj ustawień, nie akceptuj regulaminów. Jeśli panel wymaga logowania, którego nie ma
w przeglądarce, wpisz w tabeli „brak zalogowania” i idź dalej. Jeśli nie znajdziesz danej
liczby, wpisz „nie znaleziono” i opisz w jednym zdaniu, gdzie szukałeś. Nie szacuj.
Zakres dat wszędzie: 12.09.2026–11.10.2026 (30 dni), chyba że krok mówi inaczej.

KROK 1 — Google Search Console (search.google.com/search-console), usługa „tylkoklocki.pl”
(domena, sc-domain).
 1a. Indeksowanie → Strony. Przepisz: liczbę „Zindeksowane”, liczbę „Niezindeksowane” i datę
     „Ostatnia aktualizacja” widoczną w raporcie.
 1b. Na tej samej stronie tabela „Dlaczego strony nie są indeksowane”: przepisz KAŻDY wiersz
     (przyczyna, źródło, liczba stron).
 1c. Wykres nad tabelą: przełącz na „Zindeksowane” i odczytaj wartość dla dni 18.09, 22.09,
     29.09, 06.10 i ostatniego dostępnego dnia (najedź kursorem na wykres).
 1d. Indeksowanie → Mapy witryn. Dla każdej z 8 map przepisz: nazwę, „Ostatni odczyt”,
     „Stan”, „Wykryte strony”.
 1e. Kliknij wiersz „sitemap-zestawy.xml” → „Wyświetl indeksowanie stron” i przepisz liczbę
     zindeksowanych i niezindeksowanych stron z tej mapy.

KROK 2 — Allegro Affiliate (panel programu partnerskiego Allegro).
 2a. Statystyki za 12.09–11.10: kliknięcia, transakcje, wartość sprzedaży, prowizja
     (naliczona i zatwierdzona osobno, jeśli panel rozróżnia).
 2b. Kliknięcia dzienne 08.10, 09.10, 10.10, 11.10, 12.10 (czy 10.10 widać skok kilkuset
     kliknięć?).
 2c. Czy na koncie jest jakiekolwiek ostrzeżenie, komunikat o jakości ruchu lub wstrzymaniu?
     Przepisz dosłownie, jeśli jest.

KROK 3 — webePartners (panel wydawcy), program Planeta Klocków.
 3a. Za 12.09–11.10: kliknięcia, transakcje, prowizja (oczekująca / zatwierdzona / odrzucona).
 3b. Stawka prowizji i długość cookie w opisie programu.

KROK 4 — SalesMasters (salesmasters.x-kom.pl), x-kom i al.to.
 4a. Za 12.09–11.10: kliknięcia, zamówienia, prowizja (oczekująca / zatwierdzona).
 4b. Strona „Prowizje”: stawka dla kategorii zabawek / klocków LEGO.

KROK 5 — Tradedoubler (login.tradedoubler.com), konto wydawcy „Tylko Klocki”.
 5a. Programy → Media Markt (PL): status współpracy, data akceptacji, stawka dla kategorii
     zabawek/LEGO (jeśli tabela prowizji ma segmenty — przepisz wszystkie dotyczące zabawek),
     cookie, czy deep linking jest dozwolony, zakazy w warunkach (np. porównywarki cen,
     kody rabatowe).
 5b. Programy → RTV EURO AGD (PL): status i powód odrzucenia, jeśli widoczny.
 5c. Raport transakcji za 12.09–12.10: przepisz każdą transakcję (data, program, wartość,
     prowizja, status: oczekująca/zatwierdzona/odrzucona).
 5d. Czy na koncie jest komunikat o jakości ruchu? Przepisz dosłownie, jeśli jest.

KROK 6 — Awin (ui.awin.com), konto wydawcy.
 6a. Moje programy / Advertisers: status zgłoszenia do Proshop (PL) i do Zalando — dokładna
     nazwa statusu i data.
 6b. Jeśli Proshop jest „pending”, przepisz, czy jest widoczny przycisk/kanał kontaktu
     z reklamodawcą (NIE wysyłaj wiadomości).

KROK 7 — Adtraction (adtraction.com, panel wydawcy, kanał „Tylko Klocki”).
 7a. Smyk PL i Egmont: status programu, stawka, cookie; kliknięcia za 12.09–11.10.

KROK 8 — Rakuten Advertising i Admitad (jeśli zalogowane).
 8a. Rakuten: status programu LEGO (PL) i czy jest opcja ponownego zgłoszenia.
 8b. Admitad: lista programów ze statusem (al.to, x-kom, Komputronik, Allegro).

KROK 9 — Cloudflare (dash.cloudflare.com), strefa tylkoklocki.pl.
 9a. Analytics & Logs → Web Analytics (albo „Traffic”): unikalni odwiedzający i odsłony
     za ostatnie 7 i 30 dni; top 10 stron i top 5 krajów za 7 dni.
 9b. Workers & Pages → Plans/Usage: plan konta (Free/Paid) i zużycie żądań w bieżącym okresie.

WYNIK: oddaj jedną tabelę Markdown z kolumnami:
| Krok | Panel | Miara | Wartość | Data danych / zakres | Uwagi |
— jeden wiersz na każdą liczbę (np. „1a | GSC | Zindeksowane | 812 | aktualizacja 09.10 | ”).
Pod tabelą osobno: dosłowne komunikaty z kroków 2c i 5d (jeśli były) oraz lista kroków,
których nie dało się wykonać, z powodem. Wynik wklej w rozmowie z Claude Code (repo
tylkoklocki) jako tekst — bez zrzutów ekranu.
```
