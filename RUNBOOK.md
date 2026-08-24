# Runbook — tylkoklocki.pl

Wiedza operacyjna: pułapki, ograniczenia zewnętrznych systemów, procedury
awaryjne. Rzeczy kupione czasem, nie do odtworzenia z kodu.

**Czego tu nie ma:** harmonogramu runnerów (`materialy/zadania-cykliczne.md`,
generowany), podziału pracy (`NARZEDZIA.md`, `redakcja/wspolpraca.md`),
bieżących zadań (`DZIENNIK.md`).

Każdy wpis ma datę ustalenia. Jeśli ustalenie przestaje być prawdziwe —
popraw je i zmień datę, nie dopisuj sprzeczności na dole. Poprzedni dokument
zginął właśnie tak: nowe ustalenia dopisano niżej, tabeli u góry nie poprawiono.

---

## Obieg plików danych

Wszystkie dane serwisu trafiają do `src/data/` w repo, gałąź `main`.
Push na `main` uruchamia build i deploy w Cloudflare automatycznie — strona
odświeża się w ~2 minuty, nic więcej się nie klika.

Runnery pushują same. **Ścieżka awaryjna** (gdy sesja nie ma dostępu do repo):
runner oddaje gotowy plik w czacie → GitHub → `src/data/` → *Add file →
Upload files* → przeciągnij → *Commit changes*.

### Żelazna reguła aktualizacji

**Pobierz aktualny plik z repo → dołóż zmiany → zwaliduj → wypchnij.**
Nigdy nie twórz od zera, nigdy nie usuwaj cudzych wpisów. Append-only.

Gdy sesja buduje dane w czacie, zawsze podaj jej link do surowego pliku:

```
https://raw.githubusercontent.com/MarekDOLEW/blogoklockach/main/src/data/<plik>
```

Przy weryfikacji dodaj `?t=<cokolwiek>` — cache CDN bywa nieświeży.

---

## Mapa plików danych

Który plik co zasila na stronie. Kolumna „co zasila" jest tu jedynym takim
zestawieniem w całym repo — przed zmianą formatu któregokolwiek z tych plików
sprawdź, co się posypie.

Kolumna „kto zapisuje" odzwierciedla realną konfigurację triggerów
(stan 23.08.2026) — przy rozbieżności rozstrzyga
`materialy/zadania-cykliczne.md`.

| Plik w `src/data/` | Kto zapisuje | Co zasila na stronie |
|---|---|---|
| `sety.json` | Scout 05:00 (nowe sety) + Łowca 07:00 (ceny, oferty, zdjęcia) | `/nowosci/`, podstrony `/zestaw/{nr}/`, sekcja „Śledzone" na stronach serii |
| `wycofania.json` | Wycofania 06:00 | `/wycofania/` — lista, filtr, FAQ |
| `katalog.json` | Backfill 12:00 (pole `cena_katalogowa`) + sesje ad hoc (dokładanie serii) | katalogi historyczne na `/serie/{seria}/` + kafelki na `/serie/` |
| `redirects.json` | Łowca 07:00 (linki z feedu) + sesje ad hoc | przekierowania `/idz/{sklep}/{nr}` i widoczność przycisków sklepowych |
| `sklepy.json` | Łowca 07:00 (nowe sklepy) | nazwy sklepów w tabelach cen |
| `oferty_feed.json` | Łowca 07:00 | ceny i oferty w tabelach na podstronach zestawów |
| `ceny_baza.json` | Łowca 07:00 | historia cen, drabina cenowa |
| `known_sets.json` | Scout 05:00 | nic — stan runnera, nie zasila strony |
| `konkurencja_baza.json` | Radar 08:00 | nic — stan runnera, nie zasila strony |
| `obrazy.json` | `scripts/generuj-obrazy.mjs` w prebuild | zdjęcia zestawów |
| `afiliacje_rejestr.json` | ręcznie | nic — dokumentacja |
| `raporty_mail.json` | ręcznie | odbiorcy raportów PDF |

Trzy ostatnie pozycje w kolumnie „co zasila" to celowe „nic" — te pliki są
dokumentacją albo stanem runnerów. Warto o tym wiedzieć, zanim ktoś uzna je
za martwe i skasuje.

---

## Media Expert *(ustalone 18.08.2026)*

**Feed aktualizuje się 2× na dobę, ale z opóźnieniem uploadu.** Stemple
`<updated>` to 00:30 i 18:30 CEST, jednak plik ląduje na
`storage.googleapis.com` około **7 godzin później** — nocny ok. 07:40,
wieczorny w środku nocy.

Praktyczny skutek: przebieg Łowcy o 07:00 zawsze dostaje **wczorajszą wieczorną
wersję**. Świeżej nocnej nie zobaczy. Przy planowaniu zmian godzin trzeba to
uwzględnić, inaczej „poprawka" nic nie da.

**Stron produktowych ME nie da się weryfikować punktowo z sesji.** curl
i WebFetch dostają HTTP 403, prawdziwa przeglądarka (Chromium) — reset
połączenia. ME blokuje ruch z data center. WebFetch działał do 16.08.2026,
potem przestał.

Wniosek obowiązujący: **ceny ME bierzemy wyłącznie z feedu afiliacyjnego**
(oficjalny, wiarygodny). Weryfikację na stronach robimy tylko dla Planety
Klocków.

---

## Typowanie deali *(ustalone 18.08.2026)*

Deale dnia typujemy w **trzech półkach cenowych**: do 200 zł, 201–800 zł,
801 zł i więcej.

Powód: rabat procentowy naturalnie faworyzuje tanie zestawy, przez co drogie
okazje umykały (np. Tower Bridge −27% nie miał szans przebić się przez drobnicę
z −50%).

Slajder na stronie głównej:
- sloty 1–3 — najlepszy rabat z każdej półki, od najdroższej
- sloty 4–5 — dzikie karty wg samego rabatu

Raporty Łowcy pokazują czołówkę osobno dla każdej półki.

---

## Gdzie sprawdzić, gdy coś nie gra

| Problem | Gdzie |
|---|---|
| Build / deploy | Cloudflare → Workers & Pages → `blogoklockach` → *Deployments / Build history*. Czerwony build = strona zamrożona na ostatniej zielonej wersji; logi pod „View build" |
| Ruch na stronie | Cloudflare → Analytics & Logs → Web Analytics |
| Kliknięcia afiliacyjne | panel webePartners (autorytatywny). Worker też je liczy, ale dopiero po włączeniu Analytics Engine — wymaga planu Workers Paid |
| Widoczność w Google | Search Console, usługa `https://tylkoklocki.pl/` |
| Runner „nie działa" | najpierw sprawdź flagę `enabled` w Routines, dopiero potem logi. Wyłączony runner nie zgłasza błędu |

### Rollback

Cloudflare → *Deployments* → *Version History* → „…" przy starszej wersji →
*Rollback*. Nie wymaga zmian w repo.

---

## Runnery: opóźnione commity *(zaobserwowane 23.08.2026)*

Wycofania, Łowca i Backfill odpaliły się o 04:09, 05:09 i 10:03, ale commity
wylądowały dopiero po 17:00 — **7–12 godzin później**. Sesje miały status
`rejected`, co wygląda na kolejkowanie po wyczerpaniu limitu tygodniowego.

Scout i Radar (nowsze sesje na Opusie) pushują punktualnie.

Skutek: **godzina odpalenia nie równa się godzinie, o której dane są na
produkcji.** Przy diagnozie „dlaczego strona ma stare ceny" sprawdzaj czas
commita, nie czas triggera.

---

## Stabilność formatu plików JSON *(do naprawy)*

Scout przepisuje `known_sets.json` w całości (219 zmienionych linii przy
80 dodanych w `sety.json`). Łowca przepisuje całą gałąź Allegro
w `redirects.json` — 2 646 zmienionych linii przy każdym przebiegu.

Diagnoza: **serializacja JSON nie jest deterministyczna** — kolejność kluczy
lub formatowanie zmieniają się między przebiegami, więc git widzi zmianę tam,
gdzie danych nie ruszono.

Skutek: codzienne commity po kilka megabajtów, historia repo puchnie bez
powodu, a prawdziwe zmiany giną w szumie i nie da się ich przejrzeć w diffie.

Kierunek naprawy: sortowanie kluczy, stałe wcięcie, stabilne formatowanie
liczb — po stronie każdego runnera, który zapisuje JSON.

---

## Brickset: limity dla niezalogowanych *(ustalone 24.08.2026)*

**Paginacja urywa się na stronie 20.** Lista `brickset.com/sets/year-2026`
zgłasza 913 dopasowań i 37 stron, ale strony 21 i dalsze zwracają dla nas
pustą listę zestawów (sama nawigacja serwisu). To nie jest blokada ani limit
zapytań — sprawdzone: strona 20 pobrana ponownie po pustych 21–23 nadal
zwraca komplet 25 numerów. Dostępne jest więc 500 pozycji z 913.

Logowanie tego nie zmienia z naszego poziomu dostępu — sprawdzone niezależnie
dwiema drogami: WebFetch i `curl` widzą to samo (strony 21+ to 44 kB pustego
szablonu, strona 20 nadal 196 kB z listą).

**Obejście — pełny crawl per seria.** Sidebar strony rocznej
(`brickset.com/sets/year-2026`) zawiera komplet serii rocznika z licznikami;
sumy per seria zgadzają się z sumą roczną (913 dla 2026), więc pokrycie jest
pełne. Największa seria ma 112 pozycji, czyli limit 500 nie zadziała.
Schemat: `brickset.com/sets/theme-<seria>/year-2026[/page-N]`, 25 pozycji
na stronę.

**`curl` działa na brickset.com bez przeszkód** — ścieżka `/sets/` zwraca
pełny HTML, więc numery wyciąga się lokalnie przez
`grep -oE '/sets/[0-9]+-[0-9]+'`. Ścieżka `/article/` zwraca 403. To istotne
kosztowo: cały rocznik (46 serii, ~60 stron) schodzi bez ani jednego wywołania
WebFetch, czyli bez kosztu streszczania. Pełny przegląd rocznika 2026 zajął
tak kilka minut.

**Brickset nie podaje RRP w złotych** — tylko GBP/USD/EUR, także na kartach
pojedynczych zestawów (sprawdzone na 10465-1, 11371-1, 11375-1). Ceny w zł
biorzemy z `katalog.json`; walut nie przeliczamy.

**Czego Brickset użyć, a czego nie:** numer, nazwa EN, seria, liczba
elementów, wiek, data premiery, wymiary, liczba minifigurek — tak. Cena —
nie. Nazwa PL — nie ma jej tam w ogóle.

**Parametry sortowania i rozmiaru strony są ignorowane.** `?sortBy=-DateAdded`
i `?pageSize=100` nie zmieniają wyniku — kolejność zostaje po numerze
zestawu, a strona ma 25 pozycji. Nie da się tanio zapytać „co doszło od
wczoraj"; wykrywanie nowości opiera się na porównaniu z `known_sets.json`.

### Uzupełnienie do „Stabilność formatu plików JSON"

Zarzut wobec Scouta był trafny co do objawu, ale przyczyna była inna niż
niedeterminizm. Scout zapisuje `known_sets.json` przez
`json.dumps(indent=2, ensure_ascii=False)` — round-trip jest stabilny bajt
w bajt, sprawdzone 24.08. Duże diffy z 22–23.08 to realna zmiana treści
(przepisywany rejestr luk), nie szum formatowania.

Pułapka, w którą Scout wpadł i z której warto wyciągnąć regułę: **`sety.json`
ma wcięcie 1 spacji i nie kończy się znakiem nowej linii**, a klucze NIE są
posortowane (plik zaczyna się od `21372`). Zapis przez Node z
`JSON.stringify(obj, null, 2)` dał 7 594 wstawień i 7 514 usunięć przy pięciu
faktycznie dodanych zestawach. Poprawnie: Python z
`object_pairs_hook=OrderedDict`, `indent=1`, `ensure_ascii=False`, bez
końcowego `\n` — wtedy diff to same dodania. **Node reorganizuje klucze
wyglądające na liczby, więc do plików z numerami zestawów jako kluczami
nie nadaje się do zapisu.**

---

## Brickset API v3 *(klucz wyrobiony 23.08.2026, zweryfikowany 24.08.2026)*

Uzupełnia sekcję wyżej: crawl HTML zostaje jako awaryjny, API jest drogą
podstawową dla metadanych katalogowych.

**Endpoint:** `https://brickset.com/api/v3.asmx/{metoda}`, odpowiedzi w JSON.
Parametry przez query string; `params` to zagnieżdżony JSON, np.
`params={"theme":"Icons","year":"2026","pageSize":500}`.

**Klucz:** w zmiennej środowiskowej `BRICKSET_API_KEY` (tam gdzie
`GSC_KEY_JSON_B64` i `TD_TOKEN`). Konto MAREK1972. **Nigdy nie trafia do
repo ani do commita.**

**Weryfikacja klucza:** `checkKey` → `{"status":"success"}`. Nie liczy się
do limitu.

**Limity:** dzienny limit zapytań liczy **tylko `getSets`** — `checkKey`,
`getThemes` i podobne są poza nim. Maksymalnie **500 rekordów na stronę**
(`pageSize`), czyli cały rocznik schodzi dwoma wywołaniami zamiast ~60 stron
HTML. Do pobierania przyrostowego: **`updatedSince`** w formacie `yyyy-mm-dd`
— dzienny przebieg Scouta powinien pytać tylko o to, co zmieniło się od
ostatniego uruchomienia.

**Pole cenowe:** `LEGOCom.DE.retailPrice` — cena w EUR, rynek referencyjny
dla Polski. **Cen w złotych w API NIE MA.** Obiekt `LEGOCom` zawiera
wyłącznie rynki `US`, `UK`, `CA`, `DE`, każdy z `retailPrice`
i `dateFirstAvailable`. Sprawdzone 24.08.2026 na 11371: DE 249,99 EUR przy
1 099,99 zł w naszym `katalog.json`.

**Pozostałe przydatne pola z `getSets`:** `number`, `name`, `pieces`,
`minifigs`, `year`, `theme`, `subtheme`, `themeGroup`, `ageRange.min`,
`launchDate`, `exitDate`, `availability`, `lastUpdated`, `dimensions`,
`image`, `bricksetURL`, `rating`. To komplet tego, po co dotąd chodziliśmy
na karty setów po jednym pobraniu na sztukę.

**Regulamin — twarde ograniczenia.** Klucz przyznano od razu, ale Brickset
przegląda wniosek po fakcie i może go cofnąć. Zadeklarowane zastosowanie:
komplementarne metadane katalogowe, nie scraping. Trzymamy się tego
dosłownie: **tylko odczyt, tylko metadane, przyrostowo po `updatedSince`.**
Bez masowego zaciągania całej bazy „na zapas", bez odsprzedaży danych, bez
budowania z tego kopii Bricksetu.

### Przelicznik EUR→PLN dla cen katalogowych *(zbadane 24.08.2026)*

LEGO **nie przelicza cen kursem walutowym** — trzyma osobne progi cenowe per
rynek, ale progi są ze sobą powiązane na tyle mocno, że przelicznik jest
stabilny wewnątrz rocznika. Zmierzone na parach, dla których mamy cenę w zł
w `katalog.json` i cenę DE w EUR z API:

| Rocznik | Par | Mediana | Odch. std | Odstających >10% |
|---|---|---|---|---|
| 2026 | 345 | **4,223** | 0,077 | 9 (2,6%) |
| 2024 | 176 | **4,303** | 0,104 | 4 (2,3%) |
| 2022 | 76 | **4,348** | 0,183 | 6 (7,9%) |

**Przelicznik dryfuje między rocznikami — jeden mnożnik globalny byłby
błędny.** Trzeba stosować mnożnik wyznaczony dla rocznika premiery zestawu.
Rozrzut rośnie z wiekiem rocznika, więc dla setów starszych niż ~2022 cena
z przeliczenia jest coraz mniej wiarygodna.

W obrębie rocznika 2026 przelicznik lekko rośnie z ceną: 4,17 dla setów do
40 EUR, 4,32 powyżej 150 EUR. To efekt zaokrąglania do progów `,99`.
Rozbicie na serie nie pokazuje różnic — wszystkie mieszczą się w 4,10–4,29,
więc mnożnika per seria nie trzeba.

**Wniosek dla backfillu:** przeliczanie jest bezpieczne dla roczników
2024–2026, pod warunkiem użycia mnożnika właściwego dla rocznika i oznaczenia
ceny jako wyliczonej, a nie odczytanej. Dla starszych roczników — ostrożnie.

### Podejrzane ceny katalogowe *(znalezione przy okazji, 24.08.2026)*

Test przelicznika działa też jako audyt naszych danych. W roczniku 2026
dziewięć zestawów ma mnożnik daleki od 4,22 **przy zgodnej liczbie
elementów** (więc to nie jest pomyłka w dopasowaniu setu) — czyli to nasza
cena jest najpewniej zła:

| Numer | Nasze | EUR | Mnożnik | Z przelicznika |
|---|---|---|---|---|
| 42682 Nature Glamping Cabin | 304,99 | 24,99 | 12,20 | ~105 zł |
| 43294 Rapunzel's Mini Tower | 179,99 | 19,99 | 9,00 | ~84 zł |
| 42702 Spinning Flower & Fairy Teacup Ride | 309,99 | 39,99 | 7,75 | ~169 zł |
| 43289 Belle & the Beast's Enchanted Castle | 279,99 | 39,99 | 7,00 | ~169 zł |
| 11507 Olivia Rodrigo's Flower Bouquet | 289,99 | 44,99 | 6,45 | ~190 zł |
| 76347 Avengers: Doomsday Quinjet | 349,99 | 59,99 | 5,83 | ~253 zł |
| 42694 Pizza Truck | 84,99 | 14,99 | 5,67 | ~63 zł |
| 43298 Disney Advent Calendar 2026 | 174,99 | 34,99 | 5,00 | ~148 zł |
| 76474 Hogwarts Herbology Plants | 349,99 | 99,99 | 3,50 | ~422 zł |

**Osiem z dziewięciu jest zawyżonych** — a zawyżona cena katalogowa to
zawyżony rabat na stronie zestawu, czyli dokładnie ta pseudopromocja, której
zakazuje `CLAUDE.md`. Do ręcznej weryfikacji na LEGO.com PL przed backfillem;
te dziewięć poprawiamy niezależnie od decyzji o przeliczaniu.

## Oferty podszywające się pod zestaw *(ustalone 24.08.2026)*

Feedy marketplace'ów dopasowują ofertę po numerze zestawu **w tytule aukcji**,
więc pod numer setu trafiają rzeczy, które zestawem nie są. Sprawdzone aukcje:

| Set | Cena w feedzie | Co to naprawdę było |
|---|---|---|
| 21315 | 5,00 zł | „LEGO Ideas 21315 książka instrukcja" — sama instrukcja |
| 42156 | 50,00 zł | mocowanie ścienne do modelu, bez klocków |
| 43247 | 45,00 zł | zestaw oświetlenia „bez klocków" |
| 76419 | 149,90 zł | akrylowa gablota na modele |
| 60198 | 45,01 zł | zbiorcza aukcja z siedmioma innymi numerami w tytule |
| 75372 | 29,99 zł | pojedynczy droid wyjęty z zestawu |
| 10276 | 89,99 zł | „koloseum 3D kalendarz" — nie LEGO |

Takie pozycje wchodziły do tabel jako **najtańsza oferta, której nie da się
kupić**. Odsiew działa w `src/lib/odsiew.js` (jedna reguła: oferta poniżej
**28% ceny katalogowej**) i wpina się w `ofertyZFeedu` w `src/lib/oferty.js`,
czyli w jedyne miejsce, przez które ceny z feedów wchodzą na strony.

**Filtrujemy przy odczycie, nie w danych.** `oferty_feed.json` zostaje surowy —
Łowca zapisuje to, co przysłał feed, a serwis sam odsiewa. Dzięki temu żaden
runner nie musi o tym pamiętać, a zmiana progu nie wymaga przeliczania danych.

Kontrola: `node scripts/kontrola-ofert.mjs` wypisuje odrzucone oferty **z linkiem
do konkretnej aukcji**, żeby dało się sprawdzić, czy odsiew nie kasuje realnych
okazji. Warto zerknąć po każdej większej zmianie w feedach.

### Czego NIE robić: porównania między sklepami

Pierwsza wersja reguły odrzucała ofertę radykalnie tańszą od pozostałych
sklepów. Brzmi rozsądnie, ale sprawdzenie linków pokazało, że **kasuje głównie
prawdziwe okazje**: punktem odniesienia bywa oferta zawyżona. Polybagi mają
katalogowo 16,99 zł, na Allegro chodzą po 8–10 zł, a w innym sklepie stoją po
24,99 zł — czyli powyżej ceny katalogowej. Reguła odrzucała wtedy tę uczciwą,
a zostawiała zawyżoną. Tak samo z wycofanymi seriami (VIDIYO, DOTS)
wyprzedawanymi po ułamku ceny. Z 49 odrzuceń tej wersji tylko 11 było
prawdziwymi podszywkami. Cena katalogowa jest jedynym stabilnym punktem
odniesienia — nie wracać do porównań międzysklepowych.

### Znany kompromis

Sety bez znanej ceny katalogowej (ok. 6,7 tys. z 8 tys. wpisów w feedzie) nie
są filtrowane wcale. To świadoma decyzja: lepiej pokazać tanią ofertę, która
okaże się akcesorium, niż ukryć realną okazję. Ryzyko maleje z każdą partią
**Backfillu cen katalogowych** (12:00) — im więcej setów ma RRP, tym szerzej
działa odsiew.
