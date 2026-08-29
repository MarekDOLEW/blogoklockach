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
| `src/pages/deale/*.md` | Łowca (posty dealowe przy wyjątkowych okazjach) | dział `/deale/` — sekcja „Okazje pod lupą” |
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
nie kończy się znakiem nowej linii**, a klucze NIE są posortowane (plik
zaczyna się od `21372`). Zapis przez Node z `JSON.stringify(obj, null, 2)`
dał 7 594 wstawień i 7 514 usunięć przy pięciu faktycznie dodanych zestawach.
Poprawnie: Python z `object_pairs_hook=OrderedDict`, `ensure_ascii=False`,
bez końcowego `\n`. **Node reorganizuje klucze wyglądające na liczby, więc
do plików z numerami zestawów jako kluczami nie nadaje się do zapisu.**

**Wcięcia nie zakładać na pamięć — sprawdzać przed każdym zapisem.**
`sety.json` miał wcięcie 1 spacji do 28.08.2026, a commit „Nazwy zestawów
wyrównane do LEGO.com PL" przestawił je na 2 spacje. Scout zapisał plik
starym wcięciem i dostał 8 466 usuniętych linii przy sześciu dodanych
zestawach. Procedura: przed zapisem zrobić round-trip
(`json.dumps` → `diff` z oryginałem) i użyć tego wcięcia, przy którym plik
wychodzi bajt w bajt identyczny. Zajmuje sekundę i wyłapuje każdą taką
zmianę.

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
| 2026 | 344 | **4,223** | 0,074 | 0 (0,0%) |
| 2025 | 335 | **4,273** | 0,101 | 5 (1,5%) |
| 2024 | 192 | **4,303** | 0,105 | 4 (2,1%) |
| 2023 | 98 | **4,316** | 0,132 | 1 (1,0%) |
| 2022 | 80 | **4,348** | 0,195 | 6 (7,5%) |
| 2021 | 41 | **4,668** | 0,223 | 4 (9,8%) |
| 2020 | 19 | **4,715** | 0,188 | 2 (10,5%) |

*(Tabela rozszerzona 26.08.2026 na komplet roczników 2020–2026 z API.)*
**Rozstrzygnięcie po pełnych danych:** przelicznik spada monotonicznie
z 4,72 w 2020 do 4,22 w 2026 i jest to trend, nie szum. Rozrzut rośnie wstecz
(odch. std 0,074 w 2026 wobec 0,19 w 2020, odsetek odstających 0% wobec 10,5%).
Praktycznie: dla roczników **2022–2026 przeliczanie jest bezpieczne** przy
mnożniku właściwym dla rocznika premiery. Dla **2020–2021 nie** — przy
odchyleniu 0,19–0,22 i co dziesiątym secie poza zakresem cena z przeliczenia
myli się na tyle, że policzony z niej rabat przestaje być wiarygodny.
Tam potrzebne jest źródło PL, a nie przelicznik.


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

---

## WebFetch kłamie na niektórych serwisach *(ustalone 25.08.2026)*

**403 od WebFetcha nie znaczy, że serwis nas blokuje.** StoneWars zwracał
WebFetchowi 403 przez trzy dni z rzędu (22–24.08) i został przeze mnie
odpisany jako źródło trwale niedostępne. To był błędny wniosek: `curl`
z normalnym User-Agentem dostaje ze `stonewars.de` HTTP 200 i pełne 185 kB
strony. Blokowany jest User-Agent WebFetcha, nie nasz ruch. Źródło wraca
do użycia.

**Gorszy przypadek: PromoBricks.** WebFetch nie zwracał błędu, tylko
**milcząco obciętą wersję strony** — przez trzy dni pokazywał jako najnowszy
artykuł z 21.08, przez co raportowałem „serwis nic nie publikuje", a nawet
sprawdziłem to drugi raz z parametrem omijającym cache i dostałem to samo.
`curl` na tej samej stronie pokazuje wpisy z 24.08. To groźniejsze niż 403,
bo wygląda jak poprawna odpowiedź i przechodzi przez weryfikację.

**Reguła: do list nagłówków używać `curl` + parsowania lokalnego, nie
WebFetcha.** WebFetch zostaje do stron, gdzie faktycznie potrzebne jest
streszczenie długiego tekstu. Przy każdym „źródło milczy" najpierw sprawdzić
`curl`-em, zanim wyciągnie się wniosek o ciszy wydawniczej. Dotyczy to też
Bricksetu: cap na stronie 20 potwierdziłem właśnie dlatego, że sprawdziłem
go dwiema drogami — i tam `curl` potwierdził WebFetcha, więc wniosek się
utrzymał.

---

## Filtr „realny zestaw": pole `category` z API *(ustalone 26.08.2026)*

Do odsiewania szumu z list Bricksetu **używać pola `category` z API**, nie
własnych reguł po prefiksie numeru.

- **`Normal`** — zwykły zestaw detaliczny. To jest ten filtr.
- **`Collection`** — serie minifigurek (71052, 71053). Też trzymamy.
- **`Gear`** (112 pozycji w 2026), **`Book`**, **`Extended`** (BrickLink
  Designer Program, numery 910xxx, oraz promocje), **`Other`** (zestawy
  z czasopism i gratisy o 6-cyfrowych numerach), **`Random`** — odsiewamy.

Kontrola trafności: 252 z 255 naszych opisanych setów rocznika 2026 ma
`category='Normal'`, pozostałe 3 to `Collection`. Zero fałszywych odrzuceń.

**Dlaczego to ważne:** mój wcześniejszy filtr po prefiksie numeru odrzucał
całe zakresy `30xxx` i `40xxx`, przez co gubił BrickHeadz i polybagi będące
normalnymi zestawami, a jednocześnie przepuszczał śmieci. Zaniżał rocznik 2026
z 558 realnych setów do 416. Nie stosować go ponownie.

Osobna pułapka z tego samego dnia: seria **`tbd`** to NIE jest szum — to
zestaw, któremu Brickset nie przypisał jeszcze motywu, czyli najświeższy
z możliwych. Tak zgubiłem 72306 (replika PlayStation 1, 1911 elementów, 18+).

## Co NIE trafia na stronę publiczną

Ustalone 28.08.2026 po wpadce: plan redakcyjny został opublikowany jako
`/kalendarz-redakcyjny/` i zajawiony na stronie głównej. Adres zdjęty tego
samego dnia (przekierowanie na `/artykuly/` z `noindex` — patrz `redirects`
w `astro.config.mjs`).

**Zasada:** `src/pages/` to treść dla czytelnika. Ustalenia wewnętrzne —
plan publikacji, kolejność prac, analiza konkurencji, argumentacja
redakcyjna, statusy zadań — na stronę nie idą, nawet gdy są ciekawe
i nawet gdy pokazują, że serwis jest prowadzony rzetelnie.

**Gdzie zamiast tego:**
- `redakcja/` — nie jest budowany przez Astro, więc fizycznie nie może
  wyciec na stronę. Tu mieszka `plan-redakcyjny.json`.
- `DZIENNIK.md` — wymiana między sesjami.
- Osobny prywatny link (artefakt) — gdy Marek ma coś przeczytać w formie
  wizualnej, a nie w repo.

**Test przed dodaniem czegokolwiek do `src/pages/`:** czy czytelnik, który
wszedł z Google po nazwę zestawu, ma z tej strony pożytek przy zakupie?
Jeśli odpowiedź brzmi „nie, ale pokazuje, jak pracujemy" — to nie jest
treść, to jest materiał wewnętrzny.

**Uwaga na dane:** plik w `src/data/` sam z siebie nie trafia na stronę
(Astro bundluje tylko to, co zaimportowane), ale leży w katalogu, z którego
strony czerpią treść — więc materiały wewnętrzne trzymamy w `redakcja/`,
żeby nikt ich stamtąd przez pomyłkę nie zaimportował.

## Nazwy zestawów — jedno źródło

Ustalone 28.08.2026 (decyzja Marka): **kanoniczna jest nazwa produktu
z LEGO.com PL.** Reguły wynikające z tej decyzji:

1. **Motyw/seria nie jest częścią nazwy.** LEGO.com PL podaje je obok, nie
   w nazwie — potwierdzone na 31387 („Legendarny statek piracki 31387 |
   Creator 3 w 1"). Prefiksy z Bricksetu (`3w1 `, `Marvel `,
   `Chinese Festivals `) zdejmujemy.
2. **Typografia wg LEGO PL**: apostrof typograficzny (`Snoopy’ego`,
   `Cole’a`), myślnik jako separator podtytułu, zdaniowa wielkość liter poza
   nazwami własnymi (`Smok życia`, nie `Smok Życia`).
3. **Wyjątek — kalendarze adwentowe.** Zachowują serię w nazwie, bo bez niej
   pięć zestawów z 2026 roku nazywa się identycznie („Kalendarz adwentowy na
   2026 rok") i nie da się ich rozróżnić na listach.
4. **Czego NIE ruszamy.** Stare i promocyjne pozycje z lat 2000–2015 mają
   w katalogu angielskie nazwy Bricksetu, w których prefiks (`City `,
   `Star Wars `, `Friends `, `Ninjago `) jest częścią nazwy — nie ma
   polskiego odpowiednika u LEGO, więc nie ma do czego wyrównywać.
   Podobnie licencyjny podmotyw `Disney ` w DUPLO.

Po każdej zmianie sprawdzić, że nazwy w `sety.json` i `katalog.json` są
identyczne dla tego samego numeru — rozjazd oznacza, że jedna ze stron
została zaktualizowana bez drugiej.

Pozycje przyjęte bez potwierdzenia u źródła są wypisane w
`katalog.json` → `_meta.nazwy_do_weryfikacji`. LEGO.com PL blokuje odczyt
stron produktu (Cloudflare) — działa wyszukiwarka z `allowed_domains`.

## Oznaczenia wycofań — próg dowodowy

Ustalone 28.08.2026 (decyzja Marka): na `/wycofania/` trafiają **wyłącznie
zestawy z terminem potwierdzonym przez Grupę LEGO.** Branżowe zestawienia
bywają trafne, ale bywają też przesunięte o miesiące, a data wycofania jest
informacją, na której czytelnik opiera zakup za kilkaset złotych.

Konkretny przypadek: cała interaktywna linia Super Mario (37 zestawów) ma
według źródeł branżowych zejść ze sprzedaży do końca 2026 — **nie oznaczamy
jej**, dopóki LEGO nie poda terminów. Artykuł o restarcie serii mówi o tym
czytelnikowi wprost i tłumaczy dlaczego, zamiast udawać, że luki nie ma.

---

## lego.pl: dostępne przez Firecrawl *(ustalone 28.08.2026)*

Serwer nie ma dostępu do lego.com (403 na ruch z data center) i to była nasza
największa dziura w danych — polskie ceny katalogowe braliśmy z Bricksetu,
przeliczane kursem, co dawało systematyczne zawyżenia.

**Firecrawl przechodzi.** Pełny katalog `lego.com/pl-pl/categories/all-sets`
to 57 stron listingu, ~75 kredytów przy pobieraniu jako markdown (ekstrakcja
przez AI kosztuje ~5× więcej i dokłada ryzyko zmyślonych wartości — nie używać).

Wynik pierwszego przebiegu: 1210 pozycji, w tym 814 zestawów. Po wczytaniu do
`rrp_potwierdzone.json`: 119 naszych cen okazało się błędnych (112 zawyżonych),
32 sety dostały brakującą cenę, pule 1 i 2 backfillu (dostępne + wycofania)
zeszły do zera.

**Reguła odczytu ceny:** `RRP = priceBefore` gdy trwa promocja, w przeciwnym
razie `price`. Status „Ostatnie zestawy" to dostępność, nie obniżka — te ceny
są katalogowe. Kontrola: wszystkie kwoty muszą leżeć na polskiej drabinie
(końcówki .99 i .49); cokolwiek innego oznacza błąd scrapowania.

**Czego lego.pl nie da:** zestawów wycofanych z produkcji. Pozostałe 319 pozycji
puli backfillu to EOL z serii Ideas/Icons/Star Wars/Technic/Harry Potter —
tam nadal potrzebny jest Brickset albo inne źródło.

### Zaciąg bez człowieka: Firecrawl przez API *(28.08.2026)*

Serwer MCP Firecrawl żyje tylko w sesji, w której ktoś go akurat podłączył —
runner nie ma jak z niego skorzystać. Za to **`api.firecrawl.dev` przechodzi
przez proxy środowiska** (sprawdzone: odpowiada 401 na zły klucz, czyli allowlista
go przepuszcza). Zaciąg jest więc zwykłym skryptem i nadaje się na zadanie cykliczne.

    scripts/firecrawl.mjs          # cienki klient API (scrape / mapa / ekstrakcja)
    scripts/firecrawl-legopl.mjs   # katalog lego.pl -> JSON + plik dla wczytaj-rrp.mjs

Wymaga `FIRECRAWL_KEY` w zmiennych środowiska sesji (klucz `fc-…` z app.firecrawl.dev).
Bez klucza skrypty kończą się czytelnym komunikatem i niczego nie ruszają.

    node scripts/firecrawl.mjs test                        # weryfikacja klucza
    node scripts/firecrawl-legopl.mjs --strony 2 --rrp /tmp/p.json   # próbka
    node scripts/firecrawl-legopl.mjs --rrp /tmp/ceny.json           # pełny katalog
    node scripts/wczytaj-rrp.mjs /tmp/ceny.json --zrodlo "lego.pl (Firecrawl)" --sucho

Tryb `--z-pliku <katalog.json>` przelicza gotowy plik (np. dostarczony przez Cowork)
tą samą regułą cenową, bez zaciągu i bez klucza.

**Zabezpieczenia przed śmieciem w rejestrze** — rejestr jest write-once i ma
pierwszeństwo przed wszystkim, więc bramek jest kilka:

- numer bierzemy z adresu karty produktu, nie z nazwy (na katalogu z 28.08:
  1210/1210 numerów zgodnych, zero rozbieżności);
- cena musi leżeć na polskiej drabinie (.99/.49/.00) — cokolwiek innego jest
  odrzucane i wypisywane na koniec przebiegu;
- do rejestru wchodzą wyłącznie numery znane z `src/data/katalog.json`; reszta
  ląduje w osobnym pliku `…-spoza-katalogu.json` do obejrzenia (na katalogu
  z 28.08: 701 wchodzi, 113 do przeglądu);
- pozycja w promocji bez ceny sprzed obniżki jest pomijana — lepiej brak ceny
  niż zaniżona.

Skrypt odtworzony na katalogu z 28.08 daje **te same 701 cen co wczytane ręcznie,
zero konfliktów z rejestrem** — reguła jest wierna.

### Ekstrakcja modelem myli elementy z ceną *(sprawdzone 28.08.2026)*

Próbka pierwszej strony listingu przez Firecrawl, format `json` ze schematem:
model wstawił `priceBefore` równe liczbie klocków — **we wszystkich 22 kafelkach**.
SpongeBob 11386: cena 899,99 zł, `priceBefore` 1794 (to liczba elementów).
Klimt 31221: 1299,99 zł i `priceBefore` 4000. I tak dalej.

Gdyby to poszło do rejestru, wpisałoby ceny katalogowe zawyżone kilkukrotnie —
a rejestr jest write-once i ma pierwszeństwo przed wszystkim. Pierwsza wersja
kontroli drabiny **tego nie łapała**, bo dopuszczała końcówkę `.00`, a liczby
elementów są całkowite. Stąd dwie poprawki:

- drabina to **wyłącznie .99 i .49**; `.00` jest zabronione (w katalogu z 28.08
  na 814 zestawów: 805× .99, 7× .49, zero pełnych złotówek);
- osobna bramka odrzuca pozycję, gdy `priceBefore === elements`.

Sprawdzone na tych samych zmyślonych danych: wszystkie 5 testowanych pozycji
odrzuconych, do rejestru trafia zero.

**Dlatego domyślnym trybem jest markdown, nie ekstrakcja.** `scripts/parser-legopl.mjs`
czyta kafelki regułą: nagłówek `### [nazwa](url)`, pod nim kwoty, pod nimi etykiety;
liczba elementów stoi przed nagłówkiem, po znaczniku wieku. Gdy w kafelku są dwie
kwoty, katalogowa to wyższa. Ekstrakcja została jako `--tryb ekstrakcja`, na wypadek
gdyby lego.pl przebudowało listing.

**Koszt** (zmierzony, `creditsUsed` z odpowiedzi): markdown **1 kredyt/stronę**,
ekstrakcja **5**. Pełny katalog to 57 stron, czyli ~57 kredytów miesięcznie zamiast ~285.

Dwie pułapki parsera, obie już obsłużone, ale warto o nich wiedzieć przy zmianach:
ostatni kafelek na stronie zgarnia stopkę listingu (odcinamy na „Wyświetla N z M"),
a etykieta statusu musi dopuszczać cyfry — bez nich przepada „Czyszczenie magazynu
-30%", jedyna informacja przesądzająca o tym, że cena jest promocyjna.

## Dział /deale/ (od 29.08.2026)

Podstrona `/deale/` generuje się z danych przy każdym buildzie: deale gorące
(rabat ≥30% od ceny katalogowej lub świeże minimum notowań) w trzech półkach
cenowych, z badge'ami nowych minimów i CTA afiliacyjnymi — bez ręcznie
wpisanych kwot, więc nie wymaga żadnej obsługi.

Posty dealowe to markdown w `src/pages/deale/` (frontmatter jak artykuł +
`dzial: "Deale"`, kategoria „Deal dnia", tag „Dla rodziców"/„Dla AFOL").
Łowca dopisuje 1–2 przy wyjątkowych okazjach — nowe minima na drogich
zestawach, okazje sezonowe — wg standardu sprzedażowego: ceny sklepowe
wyłącznie przez `<div class="ceny-setu" data-set>`, w treści tylko RRP,
dobra cena i próg zakupu; linki przez `/idz/<sklep>/<nr>`. Posty nie wchodzą
do `/artykuly/` ani na listing strony głównej (glob ich nie łapie).
