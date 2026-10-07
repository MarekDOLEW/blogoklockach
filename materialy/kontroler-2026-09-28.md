# Raport Kontrolera — 28.09.2026 (poniedziałek)

Pierwszy raport rozliczany z **czterech kamieni milowych** (decyzja Marka
22.09.2026). Cel „20 000 zł w grudniu" przesunięty na rok 2027 — mnożnika już
nie liczę.

---

## Diagnoza środowiska

```
## Diagnoza środowiska — 2026-09-28 07:22 UTC

**Repo**
- gałąź `kontroler` @ `71c9997`, origin/main @ `71c9997`
- 0 commitów ponad main, 0 do nadrobienia, 0 plików niezacommitowanych
- node_modules ✓, astro ✓

**Zmienne środowiska**
- ustawione: 14/14
- komplet

**Dane**
- oferty_feed zaktualizowane: 2026-09-28
- rejestr afiliacji zaktualizowany: 2026-09-17
- import Empiku: 2026-09-28 — Łowca: ceny i oferty 2026-09-28
- oferty: allegro 6075, empik 4378, ceneo 1552, planetaklockow 1122, lego 951, mediaexpert 736, smyk 654, lidl 68

**Dostępy** *(realne wywołania, nie deklaracje)*
- cloudflare: **ok** (klikniec_7dni: 14320)
- r2: **ok** (kubelki: tylkoklocki-obrazy)
- tradedoubler: **ok**
- search_console: **ok** (witryny: sc-domain:tylkoklocki.pl)
- adtraction: **ok**
- performers: **ok**
- produkcja: **ok** (status: 200)
- link_sklepu_z_przegladarki: **ok** (status: 302)
- firecrawl: **ok** (kredyty: 4453)
```

Komplet dostępów drugi tydzień z rzędu. Allegro wróciło do pełnego feedu
(6 075 ofert wobec 5 112 tydzień temu), Empik 4 378, doszedł x-kom.

---

## Cztery kamienie milowe na grudzień 2026

| Kamień | Tydzień temu (22.09) | **Dziś (28.09)** | Kierunek |
|---|---|---|---|
| **1. Pierwsza zatwierdzona prowizja w każdej z 3 sieci z API** | 0 z 3 | **0 z 3** | **stoi** |
| **2. EPC per sklep na próbie > 1 transakcji** | 0 sklepów z prawdziwym obrotem | **1 sklep (Empik)** | **w górę** |
| **3. Kliknięcia z Polski dziennie** | 7,4 | **8,1** | **w górę (+10%)** |
| **4. Zaindeksowane strony (panel GSC)** | 307 *(dane z 4.09)* | **807** *(dane z 18.09)* | **w górę (+163%)** |

### Kamień 1 — zatwierdzona prowizja: zero, bez ruchu

Tradedoubler ma w oknie 30 dni sześć transakcji na 9,30 EUR i **pole
`zatwierdzone` = 0 w każdej pozycji**. Adtraction: zero transakcji od początku.
Performers: 250 kliknięć po ich stronie w 30 dni i **zero konwersji**.

To jedyny kamień, który nie drgnął, i jedyny, którego nie ruszy nasza praca —
zatwierdzenie zależy od sklepu, nie od nas. Pierwsze transakcje Empiku pochodzą
z drugiej połowy sierpnia, więc **po miesiącu wciąż nic nie zostało
zatwierdzone**. Jeśli za dwa tygodnie nadal będzie zero, to przestaje być
kwestią cierpliwości i staje się pytaniem do menedżera programu.

### Kamień 2 — EPC na sensownej próbie: Empik przekroczył próg

**Empik ma 2 transakcje w 7 dniach i 3 w 30 dniach, przy obrocie 275,82 EUR
w tygodniu.** To pierwszy sklep z próbą większą niż jedna transakcja i realnym
obrotem.

Zastrzeżenie, bez którego ta liczba wprowadza w błąd: tydzień temu formalnie
próg przekraczało Ceneo (2 transakcje), ale przy obrocie **0,16 EUR** i stawce
efektywnej 100% — to dane śmieciowe, nie sprzedaż. Empik jest pierwszym
przypadkiem, w którym po obu stronach są prawdziwe pieniądze.

Drugie zastrzeżenie: okno atrybucji sieci nie pokrywa się z oknem kliknięć.
275,82 EUR obrotu przy 6 kliknięciach w Empik w tym tygodniu oznacza, że część
sprzedaży pochodzi z kliknięć sprzed okna. **EPC Empiku liczone wprost z tych
dwóch liczb jest zawyżone** i podaję je niżej z tą adnotacją.

### Kamień 3 — kliknięcia z Polski: 8,1 dziennie

57 kliknięć w siedem dni wobec 52 tydzień temu. **W tym tygodniu nie odjąłem ani
jednego kliknięcia jako ruchu audytowego** — po raz pierwszy od wdrożenia
pomiaru. Szczegóły w sekcji o botach.

### Kamień 4 — zaindeksowane strony: 807

Odczyt z panelu GSC z 22.09 (dane Google z 18.09) wobec 307 z odczytu 15.09
(dane z 4.09). **Przyrost o 500 stron.** Niezaindeksowanych 2 910 wobec 3 360.

To odczyt sprzed sześciu dni, nie dzisiejszy — API tej liczby nie podaje.
Kolejnego poproszę ok. 6.10, gdy minie od niego dwa tygodnie.

---

## Harmonogram

**Data odczytu z konta: 28.09, 07:47 CEST — dzisiejsza**, przepisana przez sesję
Code o 07:45 zgodnie z podziałem pracy. Odczyt objął **17 Routines**. Alarmu
o nieprzepisanym harmonogramie nie ma.

**Włączonych: 10 z 11 w sekcji LEGO** (wyłączony tylko „Backfill cen
katalogowych", nigdy nieodpalony) **plus 6 Routines spoza serwisu** na tym samym
limicie użycia konta — o dwie więcej niż tydzień temu (doszły dwa zadania
jednorazowe: raport kliknięć CRO 9.10 i archiwizacja starej sesji Łowcy 29.09).

**Kolizje: brak.**

### Ważne zastrzeżenie do kolumny „ostatnie odpalenie"

Zrzut powstaje o 07:45 PL (05:45 UTC), czyli **zanim odpalą się dzienne runnery**
(Radar 06:00, Łowca 06:30, Empik 06:15 UTC). Dlatego wpisy „27.09" przy Radarze,
Łowcy i Alertach cen **nie są sygnałem, że zadanie nie poszło** — są skutkiem
godziny odczytu. Rozstrzygam to commitami, jak każe procedura:

| Runner | Ostatnie odpalenie w zrzucie | Commity w tygodniu | Werdykt |
|---|---|---|---|
| Łowca promocji | 27.09 08:41 | 22, 23, 24, 25, 26, 27, **28.09** | komplet 7/7 |
| Radar konkurencji | 27.09 08:11 | 23, 24, 25, 26, 27, **28.09** | komplet |
| Wycofania | 28.09 06:10 | **28.09** (`644240f`) | OK (tygodniowy) |
| Harmonogram z konta | 28.09 07:45 | **28.09** (`3023be7`) | OK, pierwszy przebieg z harmonogramu |
| Scout nowości | 28.09 05:04 | 23, 24, 25, 26.09 — **brak 27 i 28.09** | patrz niżej |
| Dane wt 05:30 | — (trigger z 22.09) | brak | patrz niżej |

**Scout: cztery commity w tygodniu, ale weekendowa dziura 27–28.09** mimo statusu
SUCCEEDED dziś o 05:04. To nie jest alarm w rozumieniu procedury (commity
w tygodniu są), a wpis z dziennika z 25.09 daje wyjaśnienie: Marek sprawdził
w panelu przebiegi 13/19/20.09 — **były, tylko bez nowości**. Wzór się powtarza
i za każdym razem wypada na weekend. Wart odnotowania, nie interwencji.

**„Dane wt 05:30" nadal bez pierwszego przebiegu — i tak ma być.** Trigger
powstał 22.09 o 06:00, czyli po wtorkowym slocie 05:30. **Pierwszy prawdziwy
sprawdzian wypada jutro, 29.09** — to ten sam termin, który podałem w raporcie
próbnym. Sekwencję z 22.09 wykonała za runnera sesja Code (`639166e`).

### Dwa przypomnienia o Empiku zamiast jednego

Doszedł Routine **„Empik co tydzien"** (utworzony 23.09, `trig_01BQY7Vd…`)
z cronem `CRON_TZ=Europe/Warsaw 0 8 * * 1`, który generator oznacza jako
**format nieobsługiwany**. Obok działa stare „Przypomnienie: zrzut Empiku"
(pon 08:15 PL). Dane Empiku odświeżyły się dziś (`a460501` — 4 378 cen,
52 martwe linki usunięte), więc jedno z nich zadziałało; nie wiem które, bo zrzut
harmonogramu powstał przed oboma slotami. **Do sprawdzenia w panelu przez Marka:
czy nie mamy dwóch zadań robiących to samo, z których jedno ma cron w składni,
której harmonogram nie rozumie.**

---

## Archiwum dziennika

`node scripts/archiwum-dziennika.mjs` przeniósł **8 wpisów** do
`materialy/dziennik-archiwum-2026-09.md`; `DZIENNIK.md` skurczył się z 2 577 do
2 213 linii. Zostaje 90 wpisów. Jeden starszy niż 14 dni zatrzymany celowo ze
stanem „w toku" (`2026-09-04 · Kolejka redakcyjna w XLSX`). Oba pliki w tym
samym commicie co ten raport.

---

## Zadania bez właściciela

Siedem pozycji bez linii zamknięcia: **dwie dla Marka, jedna dla Piotra, cztery
po stronie Code**. Dyscyplina zamknięć wyraźnie się poprawiła — w minionym
tygodniu domknięto sześć pozycji (`→ zamknięte` 24, 25, 26 i 27.09).

**1. BLDP seria 9 — przedsprzedaż 6.10** *(Code — 27.09, 1 dzień)*
Faniklockow podał termin, którego nie mamy: BrickLink Designer Program seria 9,
6 października 17:00, pięć zestawów 209,99–1499,99 zł. Nasz
`/kalendarz-promocji-lego/` ma pierwszy tydzień października, ale BLDP nie
wspomina. Do zrobienia: osobny wiersz z zastrzeżeniem, że to przedsprzedaż na
BrickLinku i że te zestawy nigdy nie stanieją. **Termin mija za 8 dni.**

**2. Liczba sklepów z żywą ofertą na `/wycofania/`** *(Code — 26.09, 2 dni)*
Faniklockow ma w tabeli wycofań kolumnę „Dystrybucja". Nasz odpowiednik byłby
lepszy, bo żywy: liczba sklepów z ofertą jest już w `oferty_feed.json`, a strona
ten plik wczytuje. Nasz własny tekst z 16.09 wskazał tę zmienną jako najlepszy
predyktor ceny względem cennika.

**3. Kalendarz wydarzeń osobno od promocji** *(Marek — 18.09, 10 dni)*
Decyzja, czy rozdzielamy kalendarz na promocje (cena) i wydarzenia (termin,
miejsce), czy zostajemy przy jednym.

**4. Siatka „Największe zestawy LEGO <seria>"** *(Marek — 17.09, 11 dni)*
Decyzja, czy budujemy siatkę generowaną z katalogu (liczba elementów znana przy
98% pozycji). **Uczciwa uwaga: 22.09 Piotr opublikował trzy rankingi ręczne**
(`najwieksze-zestawy-lego-technic`, `najwieksze-zestawy-lego-star-wars`,
`najdrozsze-zestawy-lego-rynek-wtorny`), które pokrywają część tego pomysłu.
Pytanie o **generowaną siatkę per seria** zostaje otwarte, ale nie jest już
pytaniem „czy mamy cokolwiek".

**5. Tekst o wycofaniu 75192 Sokół Millennium UCS** *(Piotr — 16.09, 12 dni)*
Sprawdzone dziś: karta zestawu jest (10 wystąpień w `karty_setow.json`, doszła
22.09), **artykułu nadal nie ma**. Hub dał w tym tygodniu 2 kliknięcia
afiliacyjne z Polski.

**6. Pięć zestawów ze złym statusem wycofania** *(Code / runner Wycofań — 16.09,
12 dni)* Sprawdzone dziś w `src/data/wycofania.json`: 21333, 21351, 21353, 21356
i 76437 **nadal mają `przewidywane`**, choć serwisy podają je jako potwierdzone.
**Runner Wycofań przebiegł od tego czasu dwa razy — 21.09 i 28.09 — i ani razu
tej pozycji nie ruszył.**

**7. Szesnaście wpisów Scouta do weryfikacji i dziesięć do domknięcia**
*(runner Wycofań — 16.09, 12 dni)* Scout dopisał 15.09 szesnaście pozycji ze
StoneWars ze statusem „potwierdzone", **nie weryfikując ich na lego.com**, i
prosił runnera o przegląd. Dodatkowo 10 numerów z tego samego artykułu zostało
pominiętych, bo nie ma ich w `katalog.json`. Bez odpowiedzi.

Pozycje 6 i 7 mają tego samego adresata i ten sam wiek. Wniosek w sekcji decyzji.

---

## Ruch botów i wiarygodność pomiaru

| Rodzaj | Kliknięć | Udział |
|---|---:|---:|
| bot | **14 259** | **99,6%** |
| human | 61 | 0,4% |
| nieoznaczone (sprzed 14.09) | 0 | 0% |

**Ruch botów urósł z 3 746 do 14 259 — prawie czterokrotnie w tydzień.** Filtr
działa i żadne z tych wejść nie poszło do sieci afiliacyjnych, więc nikomu nie
nabiliśmy statystyk. Ale skala rośnie szybciej niż cokolwiek innego w tym
raporcie: 21.09 boty stanowiły 94,2% ruchu przez `/idz/`, 22.09 — 97,5%, dziś —
99,6%.

### Ruchu audytowego w tym tygodniu nie ma

Po raz pierwszy od wdrożenia pomiaru **nie odjąłem ani jednego kliknięcia**.
Dowody: w 30 polskich refererach nie ma ani jednego adresu nieistniejącej strony
(żadnego `/zestaw/x/`), ruch z USA to **4 kliknięcia** wobec 42 tydzień temu,
a rozkład dzienny nie ma sztucznego piku. Poprawka workera z 21.09 (`3f42a9c`,
referer musi wskazywać realną stronę serwisu) trzyma.

**Wynik: wszystkie 57 polskich kliknięć to ruch czytelników.**

### Jeden dzień odstaje — i wygląda na prawdziwy

27.09 dał **28 z 57 polskich kliknięć**, przy 2–8 w pozostałe dni. Sprawdziłem
go osobno, bo koncentracja w jednym dniu to zwykle sygnatura naszego audytu.
Tym razem nie jest: **15 różnych refererów, ruch rozłożony na 9 godzin doby
(5:00–20:00 UTC), 9 różnych sklepów, cztery wejścia z `utm_source=chatgpt.com`.**
Audyt wygląda inaczej — jeden referer, jedno pasmo godzin, jeden sklep. 27.09 to
dzień, w którym weszły na produkcję zmiany CRO i trzy recenzje Piotra.

**Udział „brak-linku": 0 na 61 kliknięć (0,0%)** — drugi tydzień z rzędu.

### Skąd przychodzą czytelnicy

**10 z 57 polskich kliknięć (18%) ma referer z ChatGPT** — tydzień temu 33%.
Udział spadł, ale bezwzględnie to 10 kliknięć wobec 17. W tym samym oknie Google
dał serwisowi **2 kliknięcia**, więc asystent AI nadal jest kilkukrotnie
większym źródłem ruchu zakupowego niż wyszukiwarka.

| Typ strony wyjścia | Kliknięć | Udział |
|---|---:|---:|
| huby `/zestaw/<nr>/` | 34 | 60% |
| strona główna, `/deale/`, `/serie/`, `/wycofania/` | 15 | 26% |
| artykuły `/artykuly/` | 8 | 14% |

Udział hubów spadł z 79% na 60% — strona główna i `/deale/` zaczęły wysyłać ruch
do sklepów (11 kliknięć razem), czego tydzień temu praktycznie nie było. To
najwcześniejszy widoczny skutek przebudowy CRO z 25 i 27.09.

---

## EPC per sklep

Kliknięcia z Polski 21–28.09, prowizje z API sieci za okno 7 dni (od 21.09).
Sklepy bez API mają EPC **modelowe** — i tak zostaje, zgodnie z decyzją Marka
z 22.09 (nie czytamy paneli ręcznie).

| Sklep | Kliknięcia PL | Prowizja 7 dni | EPC | Podstawa |
|---|---:|---:|---:|---|
| **Media Expert** | **20** | 0,00 zł | **0,00 zł** | Performers: 10 klików u nich, 0 konwersji |
| Allegro | 12 | — | **model** | brak API — tak zostaje |
| LEGO.com | 8 | 0,00 | **0,00 z definicji** | brak programu (Rakuten odmówił 15.09) |
| Empik | 6 | 5,86 EUR | **0,98 EUR** *(zawyżone)* | Tradedoubler, 2 transakcje, obrót 275,82 EUR |
| Smyk | 4 | 0,00 zł | 0,00 zł | Adtraction: 0 transakcji |
| x-kom | 3 | — | **model** | SalesMasters, brak API; sklep dodany 24.09 |
| Ceneo | 2 | 0,00 EUR | 0,00 EUR | Tradedoubler: 0 transakcji w tym oknie |
| Lidl | 1 | 0,00 EUR | 0,00 EUR | Tradedoubler: 0 transakcji w tym oknie |
| Planeta Klocków | 1 | — | **model** | webePartners, brak API — tak zostaje |

**EPC Empiku podaję jako zawyżone i tak trzeba je czytać.** 0,98 EUR na klik
wychodzi z podzielenia prowizji przez kliknięcia z tego samego tygodnia, ale
obrót 275,82 EUR nie mógł powstać z sześciu kliknięć — część sprzedaży pochodzi
z kliknięć sprzed okna. Uczciwsza liczba to okno 30-dniowe: 7,27 EUR prowizji
Empiku przy stawce efektywnej 2,22%. Do kamienia 2 wraca za tydzień z próbą,
która nie będzie już wymagała tego zastrzeżenia.

**Media Expert jest największym problemem tej tabeli.** 20 kliknięć z Polski to
**35% całego ruchu zakupowego serwisu** — najwięcej ze wszystkich sklepów, więcej
niż Allegro. Performers raportuje po swojej stronie **250 kliknięć w 30 dni
i zero konwersji**. Nie jest to problem próby: przy 250 kliknięciach zero
konwersji przestaje być przypadkiem.

**x-kom wszedł do pomiaru** — 3 kliknięcia w pierwszym pełnym tygodniu, program
SalesMasters aktywny (ok. 2% prowizji, kod `sm=` uniwersalny). API nie ma, więc
EPC zostaje modelem. W rejestrze afiliacji stoi notka „do sprawdzenia po ~1 dniu,
czy kliki widać w statystykach panelu" — nadal bez odpowiedzi.

---

## Widoczność w Google

| Okres | Kliknięcia | Wyświetlenia | CTR | Pozycja |
|---|---:|---:|---:|---:|
| 7 dni (19–26.09) | **2** | **80** | 2,50% | 24,2 |
| 14 dni (12–26.09) | 10 | 375 | 2,67% | 18,5 |
| Poprzednie 7 dni (12–19.09), z różnicy | **8** | **295** | — | — |

**To jest najgorsza liczba w całym raporcie: kliknięcia z Google spadły z 8 na 2,
wyświetlenia z 295 na 80, średnia pozycja pogorszyła się z 18,5 na 24,2.**
Liczba fraz z jakimkolwiek wyświetleniem spadła ze 100 do 30, liczba podstron
z 95 do 38. To nie jest wahnięcie jednej strony — zwęziła się cała widoczność.

### Co dokładnie zniknęło

Tydzień temu **siedem z dziewięciu kliknięć w całym serwisie** pochodziło
z jednej frazy: „lego 11387" (pozycja 4,3). W oknie 14-dniowym ta strona nadal
ma 7 kliknięć i 116 wyświetleń — **wszystkie z pierwszej połowy okna**.
W ostatnich siedmiu dniach `/zestaw/11387/` ma **zero wyświetleń i zero
kliknięć**. Fraza wypadła z raportu całkowicie.

Sprawdziłem, czy to problem techniczny: **nie jest**. Inspekcja API pokazuje
`/zestaw/11387/` jako „Submitted and indexed", crawl 10.09. Strona jest
w indeksie i po prostu przestała się pokazywać na swoją frazę. To zmiana
rankingu albo sezonowości zapytania, nie awaria.

Dane GSC kończą się 26.09, więc **skutków przebudowy z 27.09 w tych liczbach
jeszcze nie ma.**

### TOP frazy (7 dni) — wszystkie z zerem kliknięć

| Fraza | Wyświetlenia | Pozycja |
|---|---:|---:|
| lego upominki | 4 | 30,3 |
| lego batmobil | 3 | 34,3 |
| „shellem" | 2 | **1,0** |
| „x-wingowi" | 2 | **3,5** |
| lego 75161 | 2 | 47,5 |
| lego city 60152 | 2 | 55 |

### TOP podstrony (7 dni)

| Adres | Kliki | Wyświetlenia | Pozycja |
|---|---:|---:|---:|
| `/` | **2** | 4 | 13 |
| `/wycofania/` | 0 | **21** | 7,4 |
| `/nowosci/` | 0 | 7 | 53 |
| `/prezentowniki/` | 0 | 6 | 27,7 |
| `/zestaw/76332/` | 0 | 4 | 34,8 |
| `/artykuly/historia-licencji-lego-star-wars-minecraft/` | 0 | 3 | **1,0** |
| `/zestaw/76321/` | 0 | 3 | **3,0** |
| `/artykuly/najdrozsze-zestawy-lego/` | 0 | 2 | **6,0** |

**`/wycofania/` trzeci tydzień jest drugim źródłem wyświetleń (21) na pozycji 7,4
i trzeci tydzień ma zero kliknięć.** Do tego doszły trzy strony na pozycjach
1–6 z zerowym CTR. Strona na pierwszym miejscu w Google, która nie zbiera
kliknięć, ma problem z tytułem i opisem w wynikach, nie z pozycją.

---

## TOP artykuły

Dwa różne rankingi, bo mierzą co innego.

**Po kliknięciach afiliacyjnych** (ruch, który idzie do sklepu):

| Artykuł | Kliknięcia PL |
|---|---:|
| `/artykuly/lego-60508-napad-na-policyjny-pociag-recenzja/` | **6** |
| `/deale/deal-x-kom-dzien-chlopaka-2026/` | 3 |
| `/artykuly/lego-77242-bolid-f1-ferrari-sf-24-recenzja/` | 1 |
| `/artykuly/najwieksze-zestawy-lego-star-wars/` | 1 |

**Recenzja 60508 Piotra, opublikowana 27.09, w pierwszej dobie dała 6 kliknięć
do sklepów — więcej niż cała reszta artykułów razem.** To najmocniejszy pojedynczy
dowód w tym raporcie na to, że recenzje konwertują.

**Po widoczności w Google** — żaden artykuł nie dał kliknięcia; najwyżej stoją
`historia-licencji-lego-star-wars-minecraft` (pozycja 1,0) i
`najdrozsze-zestawy-lego` (pozycja 6,0), oba z zerowym CTR.

---

## Indeksacja

### Liczby z builda

| Miara | 15.09 | 22.09 | **28.09** | Zmiana t/t |
|---|---:|---:|---:|---:|
| Huby `/zestaw/` w buildzie | 9 363 | 9 501 | **9 502** | +1 |
| Huby w `sitemap-zestawy.xml` | ok. 775 | 1 163 | **1 196** | **+33** |
| Udział zgłoszonych | 8,3% | 12,2% | **12,6%** | +0,4 pkt |

Build: 9 669 stron w 44 s, czysto. **Pierwszy tydzień, w którym zgłoszenia rosną
szybciej niż katalog** (+33 wobec +1). Tydzień temu było odwrotnie i pisałem, że
kierunek jest zły — odwrócił się.

`sitemap-priorytet.xml` nie ma już ani w repo, ani w GSC (usunięta z panelu
22.09) — temat zamknięty.

### Inspekcja adresów przez API Search Console

**13 z 14 adresów ma werdykt PASS.**

| Adres | Werdykt | coverageState | Ostatni crawl |
|---|---|---|---|
| `/` | PASS | Submitted and indexed | **23.09** |
| `/artykuly/` | PASS | Submitted and indexed | 15.09 |
| `/serie/` | PASS | Submitted and indexed | 15.09 |
| `/wycofania/` | PASS | Submitted and indexed | 15.09 |
| `/ekskluzywne/` | PASS | Submitted and indexed | **22.09** |
| `/zestaw/10280/` | PASS | Submitted and indexed | 11.09 |
| `/zestaw/11387/` | PASS | Submitted and indexed | 10.09 |
| `/zestaw/76354/` | PASS | Submitted and indexed | **22.09** |
| `/prezentowniki/prezenty-pod-choinke/` | PASS | Submitted and indexed | **24.09** |
| `/prezentowniki/na-mikolaja/` | PASS | Submitted and indexed | **24.09** |
| `/prezentowniki/swieta-dla-doroslych/` | PASS | Submitted and indexed | **24.09** |
| `/prezentowniki/swieta-dla-dzieci/` | PASS | Submitted and indexed | **24.09** |
| `/prezentowniki/swieta-licencje/` | PASS | Submitted and indexed | **24.09** |
| `/artykuly/lego-60508-napad-na-policyjny-pociag-recenzja/` | **NEUTRAL** | URL is unknown to Google | — |

**Trzy rzeczy poprawiły się wobec ostatniego raportu, wszystkie wprost:**

1. **Strona główna została zaindeksowana na nowo 23.09** — po 28 dniach bez
   wizyty Googlebota (poprzedni crawl 25.08). Prośba o indeksowanie wysłana
   22.09 zadziałała w ciągu doby.
2. **`/ekskluzywne/` i `/zestaw/76354/` są w indeksie** (crawl 22.09). Tydzień
   temu oba miały „Discovered – currently not indexed"; `/zestaw/76354/` był
   wtedy hubem z największą liczbą kliknięć, który zarabiał bez udziału Google.
3. **Wszystkie pięć stron sezonowych z prośby z 24.09 jest w indeksie** (crawl
   24.09, tego samego dnia). To odpowiedź na kontrolę zapisaną w dzienniku:
   **5/5 — druga prośba dla rozdzielnika nie jest potrzebna.**

**Jedyny adres poza indeksem to recenzja 60508 opublikowana wczoraj** — dla
strony sprzed doby „unknown to Google" jest stanem oczekiwanym, nie usterką.

**Do obserwacji:** `/artykuly/`, `/serie/` i `/wycofania/` mają crawl z 15.09,
czyli 13 dni. Jeszcze pod progiem 14 dni, ale jeśli za tydzień się nie odświeżą,
będzie to znaczyło, że huby sezonowe zabierają budżet indeksowania hubom działów.

---

## Kontrola linków sklepowych

Wykonana przez Łowcę dziś o 08:30, plik `materialy/kontrola-linkow-2026-09-28.md`
(commit `71c9997`). Próba 150 linków z `redirects.json` — **17 867 w całości,
o 1 849 więcej niż tydzień temu**. Martwych: **0**.

| Sklep | w próbie | żywe | martwe (404/410) | blokada sklepu | nierozstrzygnięte |
|---|---:|---:|---:|---:|---:|
| planetaklockow | 57 | 54 | 0 | 0 | 3 |
| ceneo | 49 | 49 | 0 | 0 | 0 |
| smyk | 19 | 19 | 0 | 0 | 0 |
| lidl | 5 | 5 | 0 | 0 | 0 |
| allegro | 5 | 0 | 0 | 2 | 3 |
| mediaexpert | 5 | 0 | 0 | 5 | 0 |
| lego | 5 | 0 | 0 | 5 | 0 |
| empik | 5 | 0 | 0 | 5 | 0 |

**O 23 linkach ze 150 (15%) nie wolno powiedzieć „OK".** Allegro, Media Expert,
LEGO.com i Empik odrzucają ruch serwerowy — 17 linków w kolumnie „blokada
sklepu" to **nie sprawdzone**, a nie „sprawne". Do tego 6 nierozstrzygniętych
(3 Planeta Klocków, 3 Allegro). Te cztery sklepy odpowiadają za 46 z 57 polskich
kliknięć, czyli za 81% ruchu zakupowego.

**Zadanie dla `empik-redirects.mjs --usun-martwe`: brak z kontroli linków** —
żaden link Empiku nie dał się sprawdzić. Niezależnie od tego dzisiejszy import
Empiku sam usunął **52 martwe linki** (`a460501`), zgodnie z wyjątkiem
`redirects.empik` z CLAUDE.md.

---

## Trzy decyzje na ten tydzień

### 1. Rozstrzygnąć, czy spadek w Google to sezon, czy nasza zmiana *(Code — diagnoza, Marek — do wiadomości)*

Kliknięcia 8 → 2, wyświetlenia 295 → 80, pozycja 18,5 → 24,2, liczba widocznych
fraz 100 → 30. Równocześnie **indeksacja poprawiła się na każdym froncie** —
807 stron w indeksie, strona główna odzyskana, 5/5 stron sezonowych w indeksie.
Te dwie rzeczy nie mogą być prawdziwe naraz bez wyjaśnienia, a wyjaśnienia nie
mam — i nie chcę go zgadywać.

Trzy hipotezy warte sprawdzenia w tej kolejności, wszystkie wykonalne z danych,
które już mamy: **(a)** fraza „lego 11387" była sezonowa albo zestaw zniknął
z ofert konkurencji — sprawdzić w `ceny_baza.json`, czy hub nadal ma oferty;
**(b)** wejście 500 nowych stron do indeksu rozproszyło wyświetlenia między
adresy, które nie rankują — sprawdzić, czy suma wyświetleń per typ strony spadła
równomiernie, czy tylko na hubach; **(c)** zmiany tytułów i opisów z przebudowy
25–27.09 zmieniły dopasowanie — porównać `<title>` hubów przed i po w gicie.

Do czasu rozstrzygnięcia **nie proponuję żadnej zmiany w SEO** — przy tej skali
liczb (2 kliknięcia) łatwo zareagować na szum i zepsuć coś, co działa.

### 2. Zapytać Performers, dlaczego Media Expert nie konwertuje *(Marek)*

Media Expert to **35% naszego ruchu zakupowego — 20 kliknięć z Polski w tydzień,
więcej niż Allegro**. Performers widzi po swojej stronie 250 kliknięć w 30 dni
i **zero konwersji**. Zero przy 250 kliknięciach to nie jest mała próba i nie
jest to normalny wynik dla sklepu z tej półki.

Możliwości są trzy i wszystkie wymagają odpowiedzi od sieci, nie od nas: kliknięcia
docierają, ale cookie nie jest ustawiane; docierają pod złym identyfikatorem
kampanii; albo docierają poprawnie i Media Expert po prostu nie sprzedaje LEGO
z naszego ruchu. **Pierwsze dwie są naprawialne w tydzień, trzecia jest
argumentem, żeby zdjąć Media Expert z pierwszego miejsca w tabelach ofert.**
Bez pytania do menedżera programu nie rozróżnimy ich.

To jest jedyny kamień milowy, który stoi (pierwsza zatwierdzona prowizja),
i największy pojedynczy strumień ruchu bez efektu.

### 3. Rozstrzygnąć, dlaczego runner Wycofań nie domyka własnej kolejki *(Marek — decyzja o prompcie)*

Dwie z siedmiu pozycji bez właściciela mają tego samego adresata, ten sam wiek
(12 dni) i ten sam wzór: **runner Wycofań przebiegł 21.09 i 28.09, za każdym
razem zapisał commit — i ani razu nie ruszył zadań, które od 16.09 czekają
w dzienniku.**

- pięć zestawów (21333, 21351, 21353, 21356, 76437) nadal ma status
  „przewidywane" zamiast „potwierdzone";
- szesnaście wpisów, które Scout dopisał bez weryfikacji na lego.com, nadal nie
  zostało przejrzanych, a dziesięć numerów z tego samego źródła — domkniętych.

Runner robi swój normalny przebieg i nie czyta kolejki zostawionej mu w dzienniku.
To jest różnica między „nie zdążył" a „nie ma tego w prompcie" — i tylko druga
odpowiedź da się naprawić. **Propozycja: dopisać do promptu Wycofań krok zerowy
— przed właściwym przebiegiem przejrzyj `DZIENNIK.md` pod kątem pozycji
adresowanych do runnera Wycofań bez linii zamknięcia i albo je wykonaj, albo
dopisz `→ Wycofania <data>: odrzucone, bo …`.** Bez tego kolejka będzie rosła,
a Kontroler co tydzień będzie przepisywał te same dwie pozycje.

---

## Czego w tym raporcie nie ma

- **Świeżego odczytu liczby zaindeksowanych stron** — ostatni z 22.09 (dane
  Google z 18.09), API tej liczby nie podaje. Poproszę Marka ok. 6.10.
- **Skutków przebudowy z 27.09 w danych Google** — GSC kończy dane na 26.09.
  Pierwszy pomiar po zmianie będzie w raporcie 5.10.
- **Rozstrzygnięcia, który Routine odświeżył dziś Empik** — zrzut harmonogramu
  powstaje przed oboma slotami, a `last_run` obu pokazuje stan sprzed nich.
