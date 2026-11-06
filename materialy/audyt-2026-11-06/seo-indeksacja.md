# Audyt 06.11.2026: SEO, indeksacja i pozycje

Tylko odczyt. Stan repo `b831994` (origin/main), build w `dist/` z 06.11 07:11 (10 149 stron HTML).
Odczyty 06.11 między 07:10 a 08:10 UTC:

- skan `dist/` własnym skryptem (meta robots, canonical, title, description, H1, JSON-LD, linki
  wewnętrzne, głębokość od strony głównej);
- `scripts/ocena-hubow.mjs`, czyli `ocenaHubu()` z `src/lib/seo.js`, z wyjściem do scratchpadu.
  Wynik zgadza się z buildem w 9 940 na 9 940 hubach;
- Search Console API w zakresie `webmasters.readonly`: mapy witryn, Search Analytics (7, 28 i 90 dni
  oraz tygodnie według typu strony), URL Inspection dla 118 adresów. `gsc-raport.mjs` czyta tylko
  w tym zakresie, a moje zapytania szły na tym samym kluczu i w tym samym zakresie;
- GA4 przez `scripts/ga4-raport.mjs` (28 i 90 dni);
- `curl` na produkcję (przekierowania, statusy);
- Firecrawl: 11 wyszukiwań z lokalizacją Polska, 22 kredyty.

Punkty odniesienia to `materialy/audyt-2026-10-12/indeksacja-ruch-afiliacje.md`
i `strona-noindex-teksty.md` (stan z 12.10) oraz `materialy/statystyki/2026-11-0{1..5}.json`.
Dane GSC mają 2–3 dni opóźnienia: ostatni pełny dzień to 04.11.

---

## Najważniejsze

1. **Indeksowalnych stron jest o połowę więcej niż 12.10 (1 462 → 2 179), ale Google nie nadąża.**
   Inspekcja losowej próbki 60 hubów z `sitemap-zestawy.xml` pokazała, że **w indeksie jest 14 z 60
   (23%)**. 17 hubów Google nadal widzi jako „noindex”, bo czyta je ze skanu z 10–12.09. 22 huby są
   „wykryte, niezindeksowane”, a 7 Google w ogóle nie zna. Po ekstrapolacji w indeksie jest
   ok. 460 hubów (95% CI ok. 270–700) z 1 972 zgłoszonych. Strony poza hubami trzymają się dobrze:
   49 z 51 jest w indeksie.
2. **Huby z wyjątkiem „karta” praktycznie nie wchodzą do indeksu.** W próbce zaindeksowanych jest
   6 z 47, przy 5 z 7 dla „deal” i 3 z 5 dla „prezentownik”. Tymczasem karta to dziś 1 295
   z 1 972 indeksowalnych hubów (12.10 było ich 636). Mediana wieku ostatniego crawla
   zaindeksowanych hubów wynosi **55 dni**.
3. **Kolejka „Poproś o zindeksowanie” utknęła.** Budżet 300 sprawdzeń dziennie idzie na ponowne
   czytanie stron, które już są w indeksie. Dziś wyszło 293 PASS na 300 i tylko **6 adresów do
   zgłoszenia**, 05.11 trzy, a 04.11 dziesięć, choć limit wynosi 15. Skrypt nie dochodzi do
   ok. 1 500 hubów poza indeksem.
4. **Widoczność stoi w miejscu, a huby z niej wypadły.** W 28 dniach jest 6 kliknięć
   i 460 wyświetleń, poz. 23,6. Poprzednie 28 dni dały 15 kliknięć, 511 wyświetleń i poz. 19,8.
   Huby `/zestaw/` miały 108–158 wyświetleń tygodniowo na przełomie VIII i IX, a od października
   mają **5–31**. Wyświetlenia artykułów rosną powoli (7 → 41 tygodniowo).
5. **Na 11 sprawdzonych fraz nie ma nas w top 10 ani razu.** Wygrywają LEGO.com, sklepy
   (Media Expert, Allegro, Planeta) i trzy serwisy branżowe: promoklocki, zklocków i fanklocków.
   Według GSC na „lego promocje” stoimy na pozycji 62, a na „lego nowości” na 70.
6. **Hubu `/black-friday-lego/` nie ma (404)**, choć `architektura-seo.md` planował go na ~15.10.
   Black Friday wypada 27.11, a konkurencja ma już strony i przewodniki.
7. **ChatGPT daje ok. 9 razy więcej ruchu niż Google.** Według GA4 w 28 dniach `chatgpt.com /
   ai-assistant` to 310 sesji, a `google / organic` 36. `llms.txt` i dane strukturalne pracują
   dziś więcej niż klasyczne SEO.
8. **61 hubów z `noindex` jest linkowanych z 19 naszych zaindeksowanych tekstów.** Najwięcej mają
   rankingi „największe/najdroższe”: 75252, 10179, 10221, 10305 i inne duże zestawy. Google trafia
   tam na ślepą uliczkę, a to są zestawy, na które ludzie wpisują numery.

---

## 1. Noindex, mapy witryn i sygnały techniczne

### 1.1 Liczby: 12.10 → 06.11

| | 12.10 | **06.11** |
|---|---:|---:|
| strony HTML w `dist/` | 9 978 | **10 149** |
| indeksowalne | 1 462 | **2 179** (21,5%) |
| noindex | 8 516 | **7 970** |
| huby `/zestaw/` (wszystkie / indeksowalne) | 9 803 / 1 291 | **9 940 / 1 972** |
| artykuły / deale / prezentowniki / nowości / serie (indeksowalne) | 43 / 14 / – / 13 / 69 | **70 / 21 / 22 / 13 / 71** |
| URL-e w mapach witryn | 1 461 | **2 177** |
| `/podglad/*` na produkcji | 200 | **404** (usunięte) |

### 1.2 Reguła i podział

Wszystkie strony z noindex, 7 970:

| Typ | Stron | Reguła (plik) |
|---|---:|---|
| huby `/zestaw/<nr>/` | 7 968 | `ocenaHubu()` w `src/lib/seo.js:98–148`, meta `noindex, follow` |
| `/szukaj/` | 1 | wyniki liczone w przeglądarce |
| `/404.html` | 1 | strona błędu |
| serie, artykuły, deale, prezentowniki, nowości, listingi | 0 | wszystkie indeksowalne |

Hub jest indeksowalny przy ≥3 z 4 warunków (A: ≥3 sklepy bez Ceneo, B: tekst >300 zn.,
C: wzmianka w naszym tekście, D: premiera ≤18 mies. i nie EOL) albo przy wyjątku. **Indeksowalne
huby (1 972) przeszły wyłącznie przez wyjątki:** karta 1 295, deal 478, prezentownik 163, opis 36.
Sama reguła 3 z 4 nie wpuszcza żadnego huba.

**Noindex według spełnionych warunków (7 968):** 0 z 4: 7 886, 1 z 4: 81 (tekst 44, sklepy 37),
2 z 4: 1. Prawie wszystkie (7 967) to zestawy spoza `sety.json`, czyli archiwum katalogu
z Bricksetu: stare i wycofane zestawy, bez opisu i zwykle bez ofert. Mediana tekstu w `<main>`
to **293 słowa** wobec **868** na hubie indeksowalnym.

**Czy reguła ma sens: tak, w obecnym kształcie.** Noindex dotyczy dziś niemal wyłącznie
archiwum. Hubów z ≥3 sklepami poza indeksem zostało 37 (12.10 było ich 185), bo opisy i karty
dopisano. Reguła 3 z 4 jest już tylko formalnością, bo o wszystkim decydują wyjątki. Komentarz
w `seo.js:22–26` („cel: 300–800 hubów w indeksie”) jest nieaktualny wobec 1 972 indeksowalnych.

### 1.3 Noindex z wartością (kandydaci do otwarcia)

| Grupa | Ile | Przykłady | Dlaczego warto | Koszt |
|---|---:|---|---|---|
| Huby linkowane z naszych zaindeksowanych tekstów | **61** (44 spełniają „tekst”, reszta to przecieki/zapowiedzi) | 75252 UCS Niszczyciel, 10179 i 10221 UCS Sokół/Niszczyciel, 10305 Zamek Lwiego Rycerza, 10143, 21323, 10304 Camaro, 10317 Defender, 42100 Liebherr | 19 tekstów prowadzi do nich czytelnika i Google, m.in. `najdrozsze-zestawy-lego-rynek-wtorny` (13 linków), `najwieksze-zestawy-lego-star-wars` (12), `ranking-najlepsze-samochody-lego-icons` (11), `/wycofania/` (8). Duże UCS i Icons to zapytania z numerem | opis >300 zn. w `sety.json` (wyjątek „opis”) |
| Huby z ≥3 sklepami bez tekstu | 37 | 41916–41964 (DOTS), 43102–43114, 854307–854311, 60397, 75119, 76157 | mają tabelę cen, czyli realne porównanie | opis |
| Huby z wyświetleniami w GSC w ostatnich 90 dniach, dziś noindex | 66 | `/zestaw/10299/` (20 wyśw., „santiago bernabéu lego” 15 wyśw.), 10188, 10246, 41691, 60181, 75929 | Google je pokazywał, choć na poz. 35–70 | opis; 10299 jest jeszcze w indeksie ze skanu 04.09 |

Rekomendacja (średnia waga): opisy dla 61 + 37 hubów, w kolejności od linkowanych z tekstów.
Druga, tańsza opcja: w rankingach historycznych **nie linkować hubów noindex** albo linkować je
dopiero po dopisaniu opisu.

### 1.4 Cienkie strony w indeksie

- **Serie z bardzo krótką treścią:** `/serie/shrek/` 159 słów, `/serie/kpop-demon-hunters/` 165,
  `/serie/horizon-adventures/` 167, `/serie/nike-x-lego/` 188, `/serie/looney-tunes/` 200. Do tego
  `/serie/bionicle/` w inspekcji ma stan **„zeskanowana, niezindeksowana”** (crawl 21.10), czyli
  Google ocenił ją i odrzucił. Rekomendacja (niska waga): akapit wstępu z historią serii
  i odsyłaczami albo noindex dla serii z 1–3 zestawami bez tekstu.
- **`/nowosci/listopad-2026/` ma 205 słów**, `/nowosci/lipiec-2026/` 236. To miesięczne listy
  z krótkim wstępem.
- **30 indeksowalnych hubów ma mniej niż 450 słów** (karta 17, opis 9, prezentownik 4),
  np. 910065–910073 (BrickLink Designer Program, 243–385 słów), 40888, 50090.
- **Szablonowość kart.** Audyt z 12.10 (pkt 7.7) wskazał 228 kart z tym samym zdaniem
  porównawczym („Gdyby stanął obok 22 zestawów LEGO Icons z 2026 roku…”). Przy 1 295 hubach
  z kartą i 6 z 47 w indeksie istnieje ryzyko, że Google traktuje karty jako odmiany jednego
  szablonu. **Nie sprawdzono** podobieństwa tekstów kart. Warto policzyć powtarzalne zdania
  (n-gramy) w `karty_setow.json`, zanim przyjmiemy hipotezę, że winny jest sam budżet crawla.

### 1.5 Mapy witryn, canonical, hreflang, robots, llms.txt, przekierowania

- **Mapy:** 7 map i indeks, razem 2 177 URL-i. To dokładnie zbiór indeksowalnych bez 2 wyjątków:
  `/polityka-prywatnosci/` (pominięta świadomie, `src/lib/sitemapy.js`) i alias
  `/deale/deal-75367-venator-ponizej-2000/` (canonical na tekst główny). **0 URL-i z noindex
  w mapach.** GSC: 0 błędów i 0 ostrzeżeń, ostatnie pobrania 01–05.11, `sitemap-zestawy.xml`
  pobrana 03.11 z 1 929 adresami (dziś 1 972). Google pobiera mapy na bieżąco, więc nie one są
  wąskim gardłem.
- **`<lastmod>` w `sitemap-zestawy.xml`:** 1 956 z 1 972 ma datę, z czego 1 797 z ostatnich 7 dni,
  bo lastmod = data ostatniej oferty (`lastmodHubu()`). Gdy niemal cała mapa zmienia się
  codziennie, Google traktuje lastmod jako szum. Rekomendacja (niska/średnia waga): lastmod
  przesuwać tylko przy zmianie najniższej ceny o ≥5% albo nowej treści (karta, opis, tekst) i
  **przy imporcie karty**. Dziś import karty nie daje sygnału, a to właśnie on zmienia hub
  z noindex w indeksowalny.
- **Canonical:** 10 149 z 10 149 stron ma canonical, każdy wskazuje samą stronę oprócz aliasu
  Venatora. W 118 inspekcjach canonical Google = nasz canonical w każdym przypadku.
- **Alias Venatora:** strona-sierota (0 linków przychodzących), 2 × H1, duplikat title
  i description. Google ma ją jako „wykryta, niezindeksowana”. Rekomendacja (niska waga):
  zamienić alias na 301 w `public/_redirects`. Zmiana dotyczy przekierowań, więc według
  CLAUDE.md wymaga pytania przed pushem.
- **hreflang:** brak na 10 149 stronach, wszystkie `lang="pl"`. Serwis ma jedną wersję
  językową, więc hreflang nie jest potrzebny.
- **robots.txt:** `Allow: /`, `Disallow: /idz/`, wskazuje `sitemap-index.xml`. Poprawny.
- **llms.txt:** 374 693 B (ok. 366 KB), generowany przy każdym buildzie, z zasadami czytania
  danych i zakazem cytowania `/idz/`. Specyfikacja llms.txt zakłada krótki indeks. Rekomendacja
  (niska waga): krótki `llms.txt` (zasady + linki do działów i hubów evergreen) i pełna lista
  w `llms-full.txt`. Ruch z ChatGPT jest naszym największym kanałem, więc warto o ten plik dbać.
- **Przekierowania na produkcji:** `http://` → 301, `www.` → 301, `/sitemap.xml` → 301,
  `/deale/` → 301. Adres huba bez ukośnika (`/zestaw/10359`) daje **307**, czyli przekierowanie
  tymczasowe. Rekomendacja (niska waga): 301. Linki wewnętrzne mają ukośnik, więc wpływ jest mały.
- **`/black-friday-lego/` → 404.** Opis w punkcie 5.

---

## 2. Indeksacja i widoczność w Google

### 2.1 Liczba stron w indeksie

**Nie sprawdzono** liczby z raportu „Strony” ani przyczyn niezindeksowania. API ich nie
udostępnia (pole `indexed` w mapach zwraca 0, znana wada), a panel wymaga przeglądarki
(Cowork). Zamiast tego oszacowanie z inspekcji 118 adresów:

| Typ (próbka) | W indeksie | Inne stany | Mediana wieku crawla |
|---|---:|---|---:|
| **Huby z mapy, losowe 60** | **14 (23%)** | „noindex” (stary odczyt z 10–12.09) 17, wykryte-niezindeksowane 22, nieznane 7 | **55 dni** |
| – w tym wyjątek „karta” | 6 z 47 | noindex 16, wykryte 18, nieznane 7 | |
| – „deal” | 5 z 7 | wykryte 2 | |
| – „prezentownik” | 3 z 5 | wykryte 2 | |
| Artykuły (15 + 1) | 16 z 16 | – | 8 dni |
| Serie (12) | 11 z 12 | `/serie/bionicle/` zeskanowana, niezindeksowana | 17 dni |
| Prezentowniki (5) | 5 z 5 | – | 9 dni |
| Deale (6 + alias) | 5 z 7 | `deal-x-kom-dzien-chlopaka-2026` i alias wykryte | 8 dni |
| Nowości (4) | 4 z 4 | – | 55 dni |
| Listingi i strona główna (11) | 11 z 11 | – | 0–55 dni |

Szacunek: **ok. 460 hubów (95% CI ok. 270–700) + ok. 200 pozostałych stron, czyli ok. 650–700
adresów w indeksie z 2 179 indeksowalnych (ok. 30%).** Dla porównania panel 18.09 pokazywał 807.

**Wnioski:**
- **Stary odczyt noindex.** 16 z 47 hubów z kartą Google ostatnio odwiedził 10–12.09, gdy
  miały jeszcze noindex. Od tamtej pory nie wrócił, więc nie wie, że strony się otworzyły.
  W drugą stronę też: `/zestaw/10299/` jest w indeksie ze skanu 04.09, choć w buildzie ma noindex.
- **Brak popytu na crawl hubów.** Zaindeksowane huby mają crawl sprzed 55 dni (mediana). Artykuły
  Google odwiedza co ~8 dni, a nowe teksty trafiają do indeksu w 1–2 dni. Problem dotyczy więc
  hubów, a nie domeny jako całości.
- Dodatkowy sygnał: 919 z 1 972 indeksowalnych hubów ma linki tylko z list serii (strony
  1,1–1,3 MB z setkami wierszy) i z innych hubów. Nie linkuje do nich żaden tekst.

Rekomendacje w punktach 5.1 i 5.2.

### 2.2 Kolejka indeksacji: budżet API zjadają strony już zaindeksowane

`scripts/kolejka-indeksacji.mjs` sprawdza adresy w kolejności: listingi → artykuły →
prezentowniki → serie → deale → nowości → huby (od największej liczby sklepów), z budżetem 300
wywołań. Zaindeksowanych adresów nie zapamiętuje, więc codziennie czyta od nowa ok. 200 stron
spoza hubów i ok. 100 „najlepszych” hubów, a te są w indeksie. Wynik w `kolejka.md`:
„Sprawdzone dziś w API: 300 … Submitted and indexed: 293”.

| Dzień | 22.10–03.11 | 04.11 | 05.11 | **06.11** |
|---|---|---:|---:|---:|
| Adresów w kolejce (limit 15) | 15 dziennie (poza 23.10) | 10 | 3 | **6** |

Od 14.10 zgłoszono 291 adresów. Hubów z kartą i 1–2 sklepami, czyli największej grupy poza
indeksem, kolejka nie sięga.
**Rekomendacja (wysoka waga, niski koszt):** pamiętać w `historia.json` (albo osobnym pliku)
adresy z PASS i ich crawl, a PASS sprawdzać ponownie najwcześniej po 14 dniach. Huby „noindex
(stary odczyt)” i „unknown” stawiać przed „discovered”. Budżet podnieść do 1 000 z 2 000
dostępnych.

### 2.3 Ruch z Google: 7 / 28 / 90 dni

| Okno | Zakres | Kliknięcia | Wyświetlenia | CTR | Śr. pozycja | 12.10 (to samo okno) |
|---|---|---:|---:|---:|---:|---|
| 7 dni | 29.10–04.11 | **2** | **104** | 1,9% | 19,9 | 1 / 59 / poz. 29,0 |
| poprzednie 7 | 22–28.10 | 0 | 115 | 0 | 25,6 | |
| 28 dni | 08.10–04.11 | **6** | **460** | 1,3% | 23,6 | 15 / 491 / poz. 19,8 |
| poprzednie 28 | 10.09–07.10 | 15 | 511 | 2,9% | 19,8 | |
| 90 dni | 07.08–04.11 | **29** | **1 164** | 2,5% | 20,7 | – |

Tygodnie według typu strony (kliknięcia / wyświetlenia, suma po stronach):

| Tydzień od | `/zestaw/` | `/artykuly/` | `/serie/` | `/prezentowniki/` | cały serwis |
|---|---|---|---|---|---|
| 31.08 | 0/132 | 0/7 | 0/0 | 0/0 | 5/147 |
| 14.09 | 6/158 | 0/14 | 0/4 | 0/6 | 8/265 |
| 28.09 | 0/63 | 1/22 | 0/5 | 0/9 | 5/65 |
| 05.10 | 0/5 | 0/29 | 0/5 | 0/4 | 0/107 |
| 19.10 | 0/16 | 2/29 | 0/47 | 0/5 | 2/113 |
| 02.11 (niepełny) | 0/31 | 0/41 | 0/18 | 0/4 | 0/91 |

- **Huby wypadły z wyników.** W 90 dniach wyświetlenia miało 162 różnych hubów, w ostatnich
  28 dniach już tylko 27. Szczyt z września dał `/zestaw/11387/` (7 kliknięć, 119 wyświetleń
  na „lego 11387”, poz. 5,5).
- **Artykuły rosną** z ok. 7 do ok. 30–40 wyświetleń tygodniowo. Najlepsza pozycja to
  `/artykuly/media-expert-kod-lego-pazdziernik-2026/` (23 wyśw., poz. 4,3).
- **Urządzenia (90 dni):** mobile 18 kliknięć / 510 wyśw. / poz. 16,0, desktop 11 / 624 / 25,3.
- **Typy wyników:** Product snippets dały **244 wyświetlenia** (0 kliknięć, poz. 24,3), więc
  dane Product działają. Discover i Google News w 90 dniach: **0**. Grafika: 15 stron po 1–9 wyśw.

**Top zapytania (90 dni):** „lego 11387” 7/119/5,5; „santiago bernabéu lego” 0/15/47;
„lego gustav klimt” 0/11/12,6; „lego batmobil” 0/9/34,7; „lego 40463” 0/8/44; „lego dc”
0/8/102; „lego upominki” 0/8/29,8; „klimt lego” 0/6/2,0; „lego 31221” 0/6/4,0.
**24 z 249 fraz (122 z 613 wyświetleń przypisanych do fraz, 20%) to zapytania z cudzysłowami
lub operatorami**, np. `"x-komu" -"sex" -"anal" …`, `"smyk wycofane" -site:reddit.com …`.
To narzędzia do monitoringu i scrapery, nie czytelnicy, tak samo jak 12.10.

**Top strony (90 dni):** `/` 14/132/24,5; `/zestaw/11387/` 7/129/5,4; `/wycofania/` 1/180/7,1;
`/zestaw/31221/` 0/72/7,2; `/nowosci/` 0/46/41,9; `/zestaw/21065/` 0/37/13;
`/kalendarz-promocji-lego/` 1/24/10,7.

### 2.4 Inne źródła ruchu (GA4, 28 dni)

| Źródło | Sesje | Śr. czas sesji |
|---|---:|---:|
| `chatgpt.com / ai-assistant` | **310** | 120 s |
| `google / organic` | **36** | 244 s |
| `bing / organic` | 22 | 43 s |
| Facebook (3 domeny) | 25 | – |
| `(direct)` | 6 147 | 19 s (w większości boty, por. fala z 10.10) |

W 90 dniach ChatGPT dał 623 sesje, a Google organic 79. Kliknięcia do sklepów (`/idz/`, ludzie,
7 dni do 05.11) to 75, z tego 48 z Polski (`materialy/statystyki/2026-11-05.json`).

---

## 3. Pozycje na kluczowe frazy

Metoda: `firecrawl_search`, lokalizacja Polska, 10 wyników. To przybliżenie SERP Google bez
personalizacji, bez reklam i bez modułów (Zakupy, „Ludzie pytają też”). Pozycje „nasze” pochodzą
z GSC (90 dni, średnia).

| Fraza | Czy jesteśmy w top 10 | Nasza poz. (GSC) | Top 3 | Kto wygrywa (typ) |
|---|---|---|---|---|
| promocje lego | nie | 65 (`/promocje-lego/`) | lego.com, Media Expert, **promoklocki** | sklep + agregator; w top 10 też Pepper, grupa FB, fanklocków |
| lego promocja | nie | 28–62 („lego w promocji”, „lego promocje”) | lego.com, Media Expert, **promoklocki** | j.w.; 8. miejsce kalendarz promocji fanklocków |
| lego 10359 cena | nie | 19 („lego 10359”, 1 wyśw.) | **zklocków**, Planeta, Media Expert | porównywarka #1, potem sklepy i Ceneo |
| lego 21065 sagrada familia cena | nie | 5–11 (warianty bez „cena”) | lego.com, Planeta, **zklocków** | sklepy + porównywarki (promoklocki #4) |
| najtańsze lego | nie | – | **promoklocki**, lego.com, Media Expert | porównywarka; tantis.pl z rankingiem 9 zestawów (#7) |
| lego wycofane 2026 | nie | – (`/wycofania/` ma 180 wyśw., ale na zapytania z operatorami) | lego.com, **klockinews**, **fanklocków** | blogi z listą EOL; promoklocki #6, faniklocków #4 |
| nowości lego listopad 2026 | nie | – | Planeta, **promoklocki**, fanklocków | sklep + agregator miesięczny |
| lego prezent dla 8 latka | nie | – | lego.com, al.to, Allegro | sklepy z filtrem wieku; jedyny poradnik: Empik (#9) |
| kalendarz adwentowy lego 2026 | nie | – (ranking ma 10 wyśw., poz. 8,7, na inne zapytania) | lego.com, Media Expert, lego.com | sklepy; promoklocki #7, zklocków #8 |
| lego black friday | nie | 64 (`allegro-black-weeks-2026-lego`) | lego.com, MediaMarkt, lego.com | sklepy; Komputronik z przewodnikiem (#6), faniklocków z poradnikiem z 2025 (#9) |
| zapowiedzi lego 2027 | nie | – (`/zapowiedzi-lego-2027/` 6 wyśw., poz. 5,3) | **fanklocków** (×2), **faniklocków** | blogi: fanklocków ma 5 z 10 miejsc |

**Wnioski:**
- **Frazy z numerem zestawu** („lego 10359 cena”) wygrywają porównywarki zklocków i promoklocki.
  Ich tytuły zaczynają się od „LEGO 10359 …”, u nas numer stoi w nawiasie na końcu nazwy:
  „LEGO Fontanna w ogrodzie (10359) – cena i promocje”. Rekomendacja w punkcie 5.4.
- **Frazy informacyjne** (wycofania, zapowiedzi, nowości) wygrywają blogi fanklocków
  i klockinews, które mają jedną stronę zbiorczą i aktualizują ją co kilka dni („3 days ago”,
  „2 days ago”). Nasze odpowiedniki istnieją (`/wycofania/`, `/zapowiedzi-lego-2027/`,
  `/nowosci/listopad-2026/`), ale mają słabe sygnały: `/zapowiedzi-lego-2027/` i `/nowosci/`
  Google odwiedził ostatnio 11–12.09.
- **Frazy prezentowe** wygrywają sklepy z filtrem wieku. Poradniki pojawiają się dopiero
  na miejscach 7–9 (Empik, Auchan). Nisza jest otwarta, a my mamy `/prezentowniki/lego-dla-7-latka/`,
  ale nie mamy stron „dla 8-latka”, „dla 10-latka” poza budżetem 200 zł.
- **Black Friday:** nie mamy strony docelowej. Na tę frazę rankuje tekst o Allegro Black Weeks
  (poz. 64).

---

## 4. On-page i techniczne

### 4.1 Title, description, H1

| Miara (indeksowalne, 2 179) | 12.10 | **06.11** |
|---|---:|---:|
| duplikaty title | 0 | **1 para** (alias Venatora) |
| duplikaty description | 2 pary | **2 grupy, 6 stron** (4 breloki 854xxx: „Od 24,99 zł w 1 sklepie. Porównanie cen…”; alias Venatora) |
| title > 60 zn. | 0 | **3** (deale 75389, 76354, 10359; max 68) |
| description > 160 / < 70 zn. | 0 / – | 0 / **9** (huby bez RRP, 60–63 zn.) |
| strony z H1 ≠ 1 | 0 | **1** (alias, 2 × H1) |
| mediana title / description | 54 / 135 | 54 / 134 |

Waga niska. Wzorzec title huba „LEGO <nazwa> (<nr>) – cena i promocje” jest poprawny, ale nie
pokrywa się z tym, jak ludzie szukają (punkt 3).

**Kanibalizacja „promocje lego”:** strona główna ma title „Promocje LEGO dziś – prawdziwe
rabaty”, a `/promocje-lego/` „Promocje LEGO – rabaty liczone od cen katalogowych”. W GSC frazy
promocyjne trafiają na `/promocje-lego/` (poz. 47–65), na `/aktualnosci/` (poz. 36–97)
i na stronę główną. Rekomendacja (niska/średnia waga): stronie głównej dać markę i ogólny opis
serwisu, a frazę „promocje LEGO” zostawić `/promocje-lego/`.

### 4.2 Dane strukturalne (JSON-LD)

- 0 błędnych bloków na 10 149 stronach. W indeksowalnych: Product 1 972 (AggregateOffer 1 913),
  BreadcrumbList 2 105, FAQPage 1 986, Article 113, ItemList 105, WebSite + SearchAction 1.
- **59 indeksowalnych hubów ma Product bez `offers`, `review` i `aggregateRating`**, np. 21375,
  40726, 71045, 910070. Google wymaga co najmniej jednego z tych pól i taki blok jest nieważny
  dla fragmentów produktu. Rekomendacja: na zapowiedziach bez ceny nie emitować Product albo
  emitować go bez wymogu ofert. **Waga średnia, koszt niski.**
- **Brak `gtin13`**, choć `src/data/ean.json` ma ok. 6 800 kodów EAN. GTIN pomaga Google dopasować
  ofertę do produktu w Zakupach i w fragmentach produktu. **Waga średnia, koszt niski.**
- Inspekcja pokazała fragmenty produktu jako **PASS z ostrzeżeniami** „brak aggregateRating /
  review” (18 hubów z próbki) i „Menu nawigacyjne” (breadcrumb) jako PASS. Ocen nie dodawać, bo
  nie mamy własnych recenzji użytkowników, a cudze oceny w schemacie są niezgodne z wytycznymi.
- **FAQPage na 1 986 stronach.** Od 2023 Google pokazuje wyniki rozszerzone FAQ tylko dla stron
  rządowych i medycznych, więc w SERP to nic nie daje. Treść FAQ jest jednak dobra dla czytelnika
  i dla modeli AI, więc zostaje.
- **69 z 71 stron serii nie ma BreadcrumbList** (tylko ItemList). `/o-nas/`
  i `/polityka-prywatnosci/` nie mają żadnego JSON-LD. Waga niska.
- **Wszystkie 113 bloków Article (artykuły, deale, prezentowniki) ma autora „Piotr M.”** z linkiem
  do `/o-nas/`, także teksty, których Piotr nie pisał (deale, prezentowniki z Code). Punkt 5.6.
- Usterka: FAQ huba 75192 skleja „…sprzedawców.zobacz tabelę cen nad tym opisem”, bez spacji
  i z małej litery, w HTML i w JSON-LD (1 hub, źródło: karta).

### 4.3 Linkowanie wewnętrzne

- **Głębokość od strony głównej** (BFS po linkach z buildu): 2 173 z 2 179 indeksowalnych na
  głębokości ≤3 (1 na 0, 43 na 1, 856 na 2, 1 274 na 3), 4 huby na głębokości 4, a alias
  Venatora jest nieosiągalny. Cel z `architektura-seo.md` („maks. 3 kliknięcia”) jest spełniony.
- **Sieroty:** `/404.html` i alias Venatora. Poza nimi każda strona ma link przychodzący.
- **Linki przychodzące do indeksowalnych hubów:** mediana 4 (3 ze stron indeksowalnych). Do 919 hubów
  prowadzą wyłącznie listy serii i inne huby.
- **Artykuły → huby:** mediana 3 linki do hubów na artykuł. Bez linku do huba są 2 teksty:
  `lego-star-wars-styczen-2027-przecieki`, `lego-daft-punk-ideas-zapowiedz` (zapowiedzi bez
  huba, to w porządku).
- **Linki do hubów noindex z tekstów:** 61 hubów z 19 stron (punkt 1.3).

### 4.4 Szybkość i Core Web Vitals

- **PageSpeed Insights API: nie sprawdzono.** Bez klucza zwraca 429 („Quota exceeded … Queries
  per day”, wspólny projekt). **Danych terenowych CrUX też nie sprawdzono.** Przy tym ruchu
  serwis najpewniej nie ma ich w ogóle, a GSC API raportu CWV nie udostępnia.
- Ostatni pomiar laboratoryjny (`materialy/audyt-pagespeed-2026-10-07.md`, sekcja 7, 08.10,
  mobile): strona główna 91 / LCP 2,5 s, hub 89 / 2,4 s, `/promocje-lego/` 86 / 2,6 s,
  seria 90 / 2,7 s, artykuł 96 / 1,2 s, CLS 0 wszędzie. Desktop strony głównej: 100.
  Duże problemy (obrazy, CLS czcionek, GA) są rozwiązane.
- **Zostały ciężkie listingi:** `/serie/city/` 1,3 MB HTML, `/serie/star-wars/` 1,27 MB,
  `/serie/duplo/` 1,07 MB, `/promocje-lego/` 314 KB. Dla Google to także rozcieńczenie linków:
  ok. 1 000 linków na stronę, większość do hubów noindex. Rekomendacja (średnia waga): na
  listach serii linkować wprost tylko huby indeksowalne i bieżące, a archiwum zwinąć, przenieść
  na `/serie/<seria>/archiwum/` albo stronicować.

---

## 5. Pomysły do wdrożenia, według wpływu i kosztu

Skala: wpływ W (wysoki) / Ś / N, koszt N (godziny) / Ś (1–3 dni) / W (tydzień+).

| # | Pomysł | Wpływ | Koszt | Kto | Uzasadnienie |
|---|---|---|---|---|---|
| 5.1 | **Naprawić kolejkę indeksacji:** pamięć PASS, priorytet dla hubów ze starym odczytem noindex i „unknown”, budżet API 1 000 | W | N | Code | 1 500 hubów poza indeksem, a kolejka daje 3–6 adresów dziennie (2.2) |
| 5.2 | **Linki z tekstów do hubów:** blok „Zestawy w tym tekście” i „Podobne zestawy” (3–6 kart) na każdym hubie z kartą; w prezentownikach i rankingach link do każdego wymienionego huba | W | Ś | Code | 919 hubów bez linku z tekstu; Google odwiedza artykuły co ~8 dni, a huby co ~55 |
| 5.3 | **Hub `/black-friday-lego/`** (evergreen URL, rok w tytule): terminy LEGO (Insiders 21–22.11, BF 27–30.11), GWP, 21375 Godzilla, lista deali z hubów, FAQ; link z menu i strony głównej; zgłoszenie w kolejce od razu | W (sezon) | Ś | Code + redakcja | 404 dziś; konkurencja ma strony; 21 dni do 27.11 |
| 5.4 | **Title hubów z numerem na początku:** „LEGO 10359 Fontanna w ogrodzie – cena od 250 zł”; H1 bez zmian; najniższa cena w title tylko gdy jest oferta | Ś | N | Code | porównywarki z numerem na przodzie wygrywają frazy „lego <nr> cena” (3) |
| 5.5 | **`gtin13` z `ean.json` w Product; bez Product przy zapowiedziach bez oferty** | Ś | N | Code | 244 wyświetlenia fragmentów produktu w 90 dniach; 59 nieważnych bloków (4.2) |
| 5.6 | **E-E-A-T:** strona autora dla Piotra i Marka (imię, kolekcja, zdjęcia własnych zestawów, kontakt), `/o-nas/` rozbudowane z 112 słów o metodologię cen („jak liczymy rabat”, sito 14 dni), osobny autor „Redakcja tylkoklocki.pl” dla tekstów automatycznych; `Person.sameAs` | Ś | Ś | Marek/Piotr + Code | „Piotr M.” na 113 tekstach, w tym na tych, których nie pisał; dla serwisu afiliacyjnego to ryzyko przy przeglądach jakości |
| 5.7 | **Prezentowniki pod frazy wiekowe:** „lego dla 8-latka”, „dla 10-latka”, „dla 5-latka”, „dla nastolatka”, „dla dorosłego” (obecny `lego-dla-7-latka` jako wzór) + link z `/prezentowniki/` | Ś | Ś | redakcja | w top 10 brak poradników poza Empikiem i Auchan; szczyt popytu 15.11–20.12 |
| 5.8 | **Opisy dla 61 + 37 hubów noindex** (linkowane z tekstów i z ≥3 sklepami) albo odpięcie linków do noindex w rankingach | Ś | Ś | Piotr / Code | 1.3 |
| 5.9 | **Świeżość hubów zbiorczych:** `/wycofania/`, `/zapowiedzi-lego-2027/`, `/nowosci/<miesiąc>/` z widoczną datą „aktualizacja” i realną zmianą 2× w tygodniu; poniedziałkowe ODŚWIEŻENIE w kolejce rozszerzyć o `/zapowiedzi-lego-2027/` i bieżący miesiąc nowości | Ś | N | Code | zapowiedzi i nowości mają crawl z 11–12.09; liderzy aktualizują co 2–3 dni |
| 5.10 | **Lżejsze listy serii:** archiwum zwinięte lub na podstronie, linki tylko do hubów indeksowalnych | Ś | Ś | Code | 1,3 MB HTML, ok. 1 000 linków, z czego większość do noindex (4.4) |
| 5.11 | **Ruch z AI:** krótki `llms.txt` + `llms-full.txt`; na hubach zdanie-podsumowanie („Najtaniej dziś: X zł w Y, 30% poniżej RRP, najniżej w naszych notowaniach: Z zł”) w pierwszym akapicie, które modele chętnie cytują | Ś | N | Code | ChatGPT to 310 sesji wobec 36 z Google (2.4) |
| 5.12 | **Linki zewnętrzne:** (a) udostępnienie danych: „Indeks cen LEGO w Polsce” (średni rabat od RRP w miesiącu, liczba wycofań) jako materiał dla mediów i blogów parentingowych; (b) wpisy w katalogach i forach AFOL (Lugpol, Zbudujmy to razem, grupy FB) z linkiem do `/wycofania/` i kalendarza; (c) wymiana z blogami niekomercyjnymi; (d) profile social z linkiem w bio do hubów | Ś–W (długoterminowo) | W | Marek | domena nowa, bez linków; konkurencja ma lata historii; żadna poprawka on-page tego nie zastąpi |
| 5.13 | **Social → serwis:** każdy post dealowy z linkiem do `/zestaw/<nr>/` (nie do sklepu), UTM; karuzele „top 5 rabatów tygodnia” z linkiem do `/promocje-lego/` | N–Ś | N | Social | Facebook dał 25 sesji w 28 dniach |
| 5.14 | **Kanibalizacja „promocje LEGO”** (strona główna vs `/promocje-lego/`) i alias Venatora → 301 | N | N | Code (301 = pytanie przed pushem) | 4.1, 1.5 |
| 5.15 | **Google Merchant Center (bezpłatne listingi):** **nie dotyczy**. Merchant Center wymaga, żeby to strona sprzedawała, a my tylko porównujemy. Zostają fragmenty produktu z punktu 5.5 | – | – | – | uniknąć pracy, która nie przejdzie weryfikacji |
| 5.16 | **Discover:** obrazy ≥1 200 px w `og:image` artykułów, `max-image-preview:large` (już jest), mocne zdjęcia własne w recenzjach | N | N | Code + redakcja | 0 wyświetleń Discover w 90 dniach; przy tej skali domeny Discover jest mało prawdopodobny |
| 5.17 | **Google News:** nie teraz. Wymaga regularnych newsów i przejrzystości redakcyjnej (5.6); wrócić po 3 miesiącach publikacji ≥1 tekstu dziennie | N | Ś | – | 0 wyświetleń w News |
| 5.18 | **Strony porównań** (np. „75192 vs 75375”, „Icons vs Technic samochody”) generowane z danych, ale z tekstem redakcji | N–Ś | Ś | redakcja | `porownanie-cztery-zamki-lego` to dobry wzorzec; popyt nie sprawdzony |
| 5.19 | **lastmod hubów** zmieniać tylko przy realnej zmianie ceny lub treści, w tym przy imporcie karty (1.5) | N–Ś | N | Code | 1 797 z 1 972 hubów ma lastmod z ostatnich 7 dni |

Kolejność na najbliższe 3 tygodnie: **5.1 → 5.3 → 5.2 → 5.4/5.5 → 5.7 → 5.9**. Pozostałe po
Black Friday.

---

## 6. Mocne strony

- **Higiena techniczna bez zarzutu:** 0 błędów JSON-LD, 0 stron bez canonical, title
  i description w granicach długości, H1 ≠ 1 tylko na aliasie, mapy zgodne 1:1
  z indeksowalnymi (poza dwoma świadomymi wyjątkami), 0 błędów map w GSC.
- **Reguła noindex jest spójna i liczona w jednym miejscu** (`seo.js`). Build, mapy i raporty
  zgadzają się w 100% (9 940 z 9 940 hubów). Archiwum katalogu nie zaśmieca indeksu.
- **Nowe treści wchodzą do indeksu szybko:** 16 z 16 artykułów z próbki jest w indeksie,
  najnowsze w 1–3 dni od publikacji.
- **Struktura płaska:** 99,7% stron indeksowalnych jest ≤3 kliknięcia od strony głównej.
- **Fragmenty produktu działają** (244 wyświetlenia, PASS w inspekcji). Breadcrumb jest
  rozpoznawany.
- **Szybkość:** mobile 86–96 w laboratorium, CLS 0 (08.10).
- **Przekierowania porządne:** http/www/sitemap.xml/`/deale/` przez 301, `/podglad/` usunięte
  (rekomendacja z 30.09 i 12.10 zrobiona).
- **Gotowa pozycja w AI:** ChatGPT jest głównym źródłem wejść, a `llms.txt` opisuje zasady
  danych (cena katalogowa, sito, stany wycofań) lepiej niż konkurencja.
- **Rekomendacje z 12.10 w większości wykonane:** 185 → 37 hubów z ≥3 sklepami bez indeksu,
  `/podglad/*` zdjęte, `/nowosci/` miesięczne mają już H2.

---

## 7. Czego nie sprawdzono

| Co | Powód |
|---|---|
| Liczba stron zindeksowanych i niezindeksowanych oraz tabela przyczyn z raportu „Strony” | API GSC tego nie udostępnia. Odczyt w panelu przez Cowork (prompt z 12.10, krok 1 — nadal aktualny). Zamiast tego szacunek z próbki 118 inspekcji |
| PageSpeed Insights i CrUX na dziś | API bez klucza zwraca 429 (dzienny limit wspólnego projektu). Ostatni pomiar laboratoryjny z 08.10 |
| Core Web Vitals w GSC | brak w API. Przy obecnym ruchu raport najpewniej jest pusty |
| Rzeczywiste SERP Google (moduły, reklamy, „Ludzie pytają też”) | Firecrawl zwraca 10 wyników organicznych bez modułów. Lokalizacja PL, bez personalizacji |
| Linki zewnętrzne (backlinki) | brak narzędzia w środowisku. GSC „Linki” jest tylko w panelu |
| Podobieństwo tekstów kart (szablonowość) | poza zakresem czasu. Hipoteza w 1.4 |
| Ruch na stronach z Cloudflare Web Analytics | token bez uprawnień do strefy (jak 12.10) |

Pliki robocze (skany, odpowiedzi API) leżą w scratchpadzie sesji i nie są częścią repo.
