# Dziennik pracy

Jedyny kanał komunikacji między Claude Code a Cowork. Oba narzędzia czytają
ostatnie wpisy na starcie sesji i dopisują własny na końcu.

**Append-only.** Nowe wpisy na górze, pod tym nagłówkiem. Nie kasuj, nie
przepisuj cudzych wpisów — historia jest tu po to, żeby druga strona
wiedziała, co się działo.

Format wpisu:

```
## RRRR-MM-DD HH:MM · [CODE|COWORK] · krótki tytuł

**Zrobione:** co faktycznie zmienione, z nazwami plików
**Stan:** gotowe / w toku / zablokowane
**Dla drugiej strony:** co ma zrobić, albo „nic"
**Uwagi:** co poszło nie tak, czego nie ruszać
```

Pole **Dla drugiej strony** jest najważniejsze. Jeśli wpisujesz tam zadanie,
druga strona przejmuje je przy najbliższej sesji. Jeśli wpisujesz „nic" —
temat jest zamknięty i nikt go nie dubluje.

Zadanie „w toku" oznacza rezerwację: druga strona go **nie zaczyna**.

## 2026-08-27 06:10 · CODE · Porządki: menu, siedem kategorii, wzorce, okruszki

**Menu — sześć pozycji:** Promocje dziś · Nowości · Wycofania · Serie ·
Prezentowniki · Artykuły. Kalendarz i Zapowiedzi zeszły z menu i są teraz
artykułami (kategorie „Kalendarze" i „Premiery"). Kolekcjoner zszedł — dział
pusty; **strona zostaje pod adresem**, usunąłem tylko linki do niej ze stopek
dwóch recenzji.

**Kategorie artykułów — stała, zamknięta siódemka** w `src/data/kategorie_artykulow.json`:
Premiery (5) · Recenzje (5) · Rankingi (0) · Porównania (0) · Poradniki (0) ·
Kalendarze (1) · Historyczne (0). Puste mają przycisk wyszarzony i nieklikalny.
Prezentowniki wyszły z `/artykuly/` — zostają wyłącznie w swoim dziale (17 kart).

**Wygląd:** zdjęcia w treści artykułu na całą szerokość kolumny (720 px), bez
ramki, obrysu i cienia, kadr 4:3 zamiast kwadratu. Powiększenie miniatur na
listingach 2,2× → **4,4×** (100 px → 440 px).

**Strona zestawu:** okruszki pod menu (Start › LEGO Technic › LEGO 42215) —
ta sama ścieżka co w `BreadcrumbList`, żeby widok i dane strukturalne się nie
rozjechały. Plus tagi wyliczane z danych: „Dla dorosłych", „Duży zestaw",
„Mały zestaw", „Do 100 zł", „Znika z rynku".

**Nota cenowa:** dopisek o zmienności w ciągu dnia — w tabelach cen (komponent
i plugin), na hubach, seriach i wycofaniach.

**Wzorce:** `redakcja/wzorce/` — prezentownik serii (osiem zestawów zamiast
sześciu, drabina ośmiu progów zakupowych) i recenzja zestawu. Plus reguła
nazywania artykułów od kategorii. Standard §18.2.

**Linkowanie wewnętrzne:** każda stopka „Zobacz też" prowadzi teraz do co
najmniej jednego naszego tekstu, nie tylko do listingów; Kalendarz i Zapowiedzi
dostały własne stopki. Kontrola: zero martwych linków w całym `dist/`
(poza `/idz/`, które obsługuje worker).

**Stan:** gotowe, wdrożone i sprawdzone na produkcji

**Dla drugiej strony (COWORK):** dwie rzeczy do rozstrzygnięcia z Markiem.

1. **Duplikat standardu.** Skille `lego-standard-redakcyjny` i
   `klocki-standard-sprzedazowy` powstały z plików `1-Metodologia` / `1-standard`
   i żyją poza tym repo (poziom konta, nie `.claude/skills/`). W repo mamy
   `redakcja/standard-artykulow-biezacych.md` (dziś **wersja 1.4**) oraz
   `redakcja/metodologia-researchu-lego.md`, wskazane w CLAUDE.md jako
   obowiązująca podstawa. To dwie kopie tego samego, które będą się rozjeżdżać
   — wersja 1.4 (§18.1 ceny i linki, §18.2 kategorie i nazewnictwo) jest **tylko
   w repo**. Do decyzji: albo skill wskazuje na pliki w repo, albo przenosimy go
   do `.claude/skills/` i trzymamy jedną kopię.
2. **Trzy prezentowniki pod adresem `/artykuly/`** — „na rozpoczęcie roku
   szkolnego" (rodzinny, chłopiec, dziewczynka). Są w dziale Prezentowniki, ale
   URL mają w `/artykuly/`. Nie ruszam: adresy są zaindeksowane, przeniesienie
   wymaga przekierowań 301 w workerze. Jeśli mają wylądować pod
   `/prezentowniki/`, to osobne zadanie z redirectami.

**Uwagi:** `/kolekcjoner/` i `/zapowiedzi-lego-2027/` nadal działają pod swoimi
adresami — zniknęły tylko z menu, więc nic zaindeksowanego się nie zepsuło.

## 2026-08-26 17:20 · CODE · Fala City przeniesiona do kategorii Premiera + tag odbiorcy „Dla rodziców"

**Zrobione:**
- `src/pages/artykuly/lego-city-czerwiec-2026-fala.md` — `kategoria: "Poradnik"`
  → `"Premiera"`, dodane `tagi: ["Dla rodziców"]`.
- `src/layouts/Artykul.astro` — tagi renderują się obok plakietki kategorii
  w linii nad tytułem; trafiają też do `keywords` w schema.org.
- `src/components/ZajawkaArtykulu.astro` + `src/lib/artykuly.js` — ten sam tag
  na karcie zajawki, pod linią „data · kategoria".
- `src/styles/global.css` — `.badge-tag` (wersaliki, jaśniejsze tło niż
  plakietka kategorii), `.zajawka-tagi`.

**Nowe pole frontmattera:** `tagi: ["…"]` — tablica, więc artykuł może mieć
kilka. Tag mówi **do kogo** tekst jest pisany, kategoria **czym** jest; dlatego
stoją obok siebie, a nie zamiast siebie.

**Uwaga o kategoriach:** „Premiera" już istniała (2 artykuły) — nie tworzyłem
jej od zera, tylko przeniosłem do niej falę City; teraz ma 3 pozycje. Przycisk
„Poradnik" **zniknął sam** z filtra, bo został bez artykułów — pasek liczy się
z faktycznych tekstów.

**Stan:** gotowe, wdrożone na produkcję

**Dla drugiej strony:** nic

**Uwagi:** tag pokazuję też na kartach listingu — ta sama linia nad tytułem co
w artykule, więc rodzic wyłapie tekst już na liście. Gdyby miał być wyłącznie
na stronie artykułu, wystarczy usunąć blok `zajawka-tagi` z komponentu.

## 2026-08-26 16:45 · CODE · Filtr kategorii na /artykuly/

**Zrobione:**
- `src/components/FiltrKategorii.astro` (nowy) — pasek przycisków pod nagłówkiem
  „Artykuły". Kategorie wyliczają się z faktycznych artykułów, nie z ręcznej
  listy, więc nowa kategoria we frontmatterze pojawia się sama. Przy każdej
  licznik: Wszystkie 18 · Prezentownik 7 · Recenzja 5 · Premiera 2 · Deal 1 ·
  Kalendarz 1 · Poradnik 1 · Zapowiedzi 1.
- `src/components/ZajawkaArtykulu.astro` — karta dostała `data-kategoria`.
- `src/lib/artykuly.js` — nowe pole `grupa` w zajawce. Potrzebne, bo plakietka
  prezentownika pokazuje `karta_znacznik` („10 lat · ok. 200 zł"), a filtrować
  trzeba po nazwie kategorii — inaczej każdy prezentownik byłby osobnym
  przyciskiem.
- `src/styles/global.css` — `.filtr-kat`, `.fk-btn`, `.fk-licz`, `.fk-pusto`.

**Jak działa:** cała lista jest w HTML, skrypt wyłącznie ukrywa karty. Bez JS-a
strona pokazuje komplet, a Google widzi wszystkie 18 artykułów. Wybór trafia do
adresu (`?kategoria=Recenzja`), więc filtr da się podlinkować i przeżywa
odświeżenie. Nieznana kategoria w adresie jest ignorowana — nie da się trafić
na pustą stronę.

**Sprawdzone w przeglądarce:** Recenzja → 5 kart, Prezentownik → 7, Deal → 1,
powrót na „Wszystkie" → 18 i czysty adres; deep link `?kategoria=Premiera` → 2;
`?kategoria=Nieistniejaca` → 18. Na 390 px przyciski zawijają się do czterech
rzędów, strona nie przewija się w poziomie.

**Stan:** gotowe, wdrożone na produkcję

**Dla drugiej strony:** nic

**Uwagi:** to filtr, nie sortowanie — kolejność w każdej kategorii pozostaje
malejąco po dacie. Jeśli miało być również przełączanie kolejności
(najnowsze/najstarsze), to osobny temat.

## 2026-08-26 07:35 · CODE · Lista robocza cen katalogowych gotowa dla Coworku

**Zrobione:**
- `materialy/ceny-katalogowe/rrp-do-sprawdzenia.csv` — 1077 zestawów ze statusem
  „dostępny" (tylko takie mają kartę na lego.pl), posortowanych priorytetowo:
  najpierw 1060 obecnych w serwisie, potem reszta.
  Rozkład: **834 z ceną z `katalog.json` (niepewną)**, 202 ze źródła
  zweryfikowanego, 41 bez żadnej ceny.
- `materialy/ceny-katalogowe/BRIEF-cowork-ceny-katalogowe.md` — instrukcja:
  co wypełnić, czym to zapisać, czego nie robić.
- `katalog.json` i CSV wysłane Markowi w czacie.

**Stan:** czeka na Cowork

**Dla drugiej strony (COWORK):** to zadanie dla Ciebie — masz lokalną
przeglądarkę, ja nie mam dostępu do lego.pl (403) ani zklockow.pl (Cloudflare
challenge), a Chromium w sesji serwerowej nie ma sieci wychodzącej.

Wypełnij w CSV **wyłącznie ostatnią kolumnę** `CENA_Z_LEGO_PL` oficjalną ceną
katalogową z lego.pl. Format ceny dowolny (`249,99`, `249.99`, `249,99 zł`).
Wiersze bez ceny zostaw puste — zostaną pominięte. Potem:

    node scripts/wczytaj-rrp.mjs materialy/ceny-katalogowe/rrp-do-sprawdzenia.csv --zrodlo "lego.pl (Cowork)" --sucho
    node scripts/wczytaj-rrp.mjs materialy/ceny-katalogowe/rrp-do-sprawdzenia.csv --zrodlo "lego.pl (Cowork)"
    node scripts/kontrola-rrp.mjs

`--sucho` nic nie zapisuje — pokazuje, ile cen dochodzi i gdzie jest konflikt
z tym, co już potwierdzone. Konflikt rozstrzygamy u źródła, nie nadpisujemy
w ciemno. Nie musisz robić wszystkiego naraz; każda partia zabetonowuje kolejny
kawałek katalogu na stałe, bo cena katalogowa się nie zmienia.

**Uwagi:** nie brać ceny ze sklepu (ME, PK, Allegro) jako RRP — sprawdziłem,
`PreviousPrice` z feedu PK zgadza się z RRP w 10%, `g:price` z ME w 6%. To ceny
sprzedaży, nie cennik. I nie przeliczać z EUR/USD/GBP — polski cennik ma własną
drabinę (59,99 € = 249,99 zł, nie 259,99 zł).

## 2026-08-25 10:40 · CODE · zklockow.pl niedostępny z serwera — rejestr potwierdzonych RRP zamiast tego

**Zadanie:** porównać nasze ceny katalogowe z zklockow.pl i poprawić.
**Nie udało się pobrać zklockow.pl** — i nie jest to nasza polityka egress.

| Źródło | Wynik |
|---|---|
| zklockow.pl | 403, `cf-mitigated: challenge` — Cloudflare managed challenge (JS), także na `robots.txt` |
| lego.com/pl-pl | 403 — twarda blokada ruchu serwerowego |
| Chromium / Playwright | `ERR_CONNECTION_RESET` na **każdym** hoście (nawet brickset, który curl otwiera) — sesja serwerowa nie ma sieci wychodzącej w przeglądarce |
| feed Planeta Klocków | `PreviousPrice` = cena sklepu, nie RRP — zgodność 21/200 (10%) |
| feed Media Expert | `g:price` = cena sklepu, nie RRP — zgodność 13/191 (6%) |
| Brickset | osiągalny (200), ale ceny tylko GBP/USD/EUR — brak PLN |

Tunel proxy wstaje poprawnie (`HTTP/1.1 200 Connection Established`), więc host
jest dozwolony — blokuje sam sklep. Bez przeglądarki z siecią nie ma jak przejść
challenge'a i nie będę go obchodził.

**Zrobione zamiast tego — zasada „raz dobrze wprowadzone zostaje na zawsze":**
- `src/data/rrp_potwierdzone.json` (nowy) — rejestr write-once cen katalogowych
  potwierdzonych przez człowieka. **Najwyższe pierwszeństwo**: `cenaKatalogowaSetu()`
  czyta go przed `sety.json`, `ceny_baza.json` i `katalog.json`, więc żaden backfill
  ani runner go nie nadpisze. Na start 3 wpisy: 31161, 42686, 76321.
- `src/lib/oferty.js` + `scripts/remark-ceny.mjs` — nowa kolejność źródeł.
- `scripts/wczytaj-rrp.mjs` (nowy) — wczytuje listę cen (CSV/TSV/JSON) do rejestru.
  Nie nadpisuje istniejących wpisów, tylko zgłasza konflikt (`--nadpisz` do korekty,
  `--sucho` do samego raportu). Parser rozumie polski przecinek dziesiętny.
- `scripts/kontrola-rrp.mjs` — rejestr jako źródło najwyższej wagi.
- Standard §18.1 i `redakcja/README.md` — zasada i kolejność źródeł zapisane.

**Stan:** gotowe, wdrożone. Zadanie „porównaj z zklockow" — **zablokowane**
do czasu dostarczenia danych.

**Dla drugiej strony (COWORK):** to zadanie dla Ciebie — masz lokalną przeglądarkę.
Zbierz z zklockow.pl ceny katalogowe LEGO i zapisz jako CSV `numer;cena`
(np. `31161;249,99`), po jednym secie w linii. Potem w repo:

    node scripts/wczytaj-rrp.mjs <plik>.csv --zrodlo "zklockow.pl (Cowork)" --sucho
    node scripts/wczytaj-rrp.mjs <plik>.csv --zrodlo "zklockow.pl (Cowork)"
    node scripts/kontrola-rrp.mjs

Pierwsze uruchomienie (`--sucho`) tylko raportuje i pokazuje konflikty z tym,
co już mamy — te rozstrzygamy u źródła przed zapisem. Marek może też po prostu
wkleić listę w czacie.

**Uwagi:** `katalog.json` zostaje najsłabszym źródłem i nadal ma ~1150 cen bez
potwierdzenia. Każda partia z zklockow zabetonuje kolejny kawałek i zdejmie go
z listy rzeczy do sprawdzania — na stałe.

## 2026-08-25 09:15 · CODE · Ceny katalogowe w katalog.json były zawyżone — poprawione + zasada w standardzie

**Miałem złą rację.** Wczoraj rozstrzygnąłem rozbieżność RRP na korzyść
`katalog.json` przeciw materiałowi Piotra. Piotr miał rację, nasze dane były
błędne. Marek sprawdził 31161 na lego.pl: 249,99 zł, nie 259,99 zł.

**Przyczyna:** backfill cen katalogowych w `katalog.json` brał ceny z Bricksetu,
a Brickset podaje GBP/USD/EUR — nie złotówki. Ktoś przeliczał kursem, a polski
cennik LEGO ma własną drabinę. Dowód z naszych danych: **kwota 259,99 zł nie
występuje ani razu** wśród 270 zweryfikowanych setów w `ceny_baza.json`, podczas
gdy 249,99 zł występuje 8 razy, a 209,99 zł — 22 razy. Drabina wyliczona
z par Brickset↔`ceny_baza`: 59,99 € → 249,99 zł (11512, 21595, 75642),
49,99 € → 209,99 zł (10331, 21591, 11211).

**Skala:** 22 rozbieżności na 198 setów możliwych do porównania (11%), w większości
zawyżenia. Najgorsze: 42682 miał 304,99 zamiast 104,99, 43294 179,99 zamiast 81,99,
76347 349,99 zamiast 249,99.

**Zrobione:**
- `src/data/katalog.json` — 22 ceny katalogowe zsynchronizowane ze źródłami
  zweryfikowanymi; 31161 → 249,99, 42686 → 249,99, 76321 → 209,99.
  Liczba wpisów bez zmian (7712).
- `scripts/kontrola-rrp.mjs` (nowy) — porównuje `katalog.json` z `sety.json`
  i `ceny_baza.json`, kod wyjścia 1 przy rozbieżności. `--napraw` nadpisuje.
  Teraz: ROZBIEŻNYCH 0.
- `src/pages/prezentowniki/lego-za-200-zl-dla-10-latka.md` — przywrócone
  wartości Piotra.
- `redakcja/standard-artykulow-biezacych.md` → **wersja 1.4**: nowy §18.1
  „Podział pracy: kto wstawia ceny i linki", doprecyzowany §20, dwa punkty
  checklisty §26 i dwa antywzorce §27.
- `redakcja/README.md` — tabela wersji, opis mechaniki cen, log decyzji.
- `redakcja/karty/prezentownik-200zl-10-latek.md` — rozbieżność rozstrzygnięta.

**Nowa zasada (Standard §18.1):** autor tekstu **nie wpisuje kwot sklepowych ani
adresów afiliacyjnych** — zostawia `[wstaw link afiliacyjny]` i podaje tylko ceny
będące częścią oceny (RRP, dobra cena, próg zakupu). Kwoty i linki podstawia
redakcja techniczna przy publikacji, ze źródeł serwisu. Cena katalogowa w tekście
musi zgadzać się z danymi serwisu, bo z tego samego źródła bierze ją generowana
tabela. Przy sporze rozstrzyga polski cennik LEGO, **nie przelicznik walutowy**.

**Stan:** gotowe, wdrożone na produkcję

**Dla drugiej strony:** przy każdym kolejnym backfillu cen w `katalog.json`
uruchamiać `node scripts/kontrola-rrp.mjs` przed commitem. Cen katalogowych
nie przeliczać z EUR/USD/GBP — brać z polskiego cennika.

**Uwagi:** lego.com i promoklocki.pl blokują ruch serwerowy (403), więc RRP
przy spornym secie weryfikuje człowiek. Brickset jest osiągalny i nadaje się
do ustalenia poziomu cenowego w EUR — ale to punkt wejścia do drabiny,
nie kurs do przemnożenia.

## 2026-08-25 08:45 · CODE · Tabela cen w treści artykułu — renderowana przy buildzie, nie wklepywana

**Zrobione:**
- `scripts/remark-ceny.mjs` (nowy) — znacznik `<div class="ceny-setu" data-set="<nr>"></div>`
  zamienia się przy budowaniu na pełną tabelę cen. Te same dane i ten sam HTML
  co `TabelaCen.astro` na hubie, więc jeden komplet stylów.
- `astro.config.mjs` — plugin dopisany do `remarkPlugins`
- `src/styles/global.css` — `.karta--ceny` (odstępy dopasowane do kolumny tekstu)
- Znacznik wstawiony w 4 nowe teksty (42215, 71858, 60506, 31161)
- **Trzy stare artykuły odmrożone:** 31168, 11381, 76467 miały w treści ręcznie
  wpisaną tabelę „Cena (20.08)" — podmienione na znacznik. Przy okazji usunięte
  zdania typu „w chwili pisania (20.08) kosztuje 439 zł".
  Kontrola: `grep "Cena (2\|w chwili pisania" src/pages/**/*.md` → pusto.

**Dlaczego:** drabina cenowa (RRP → dobra cena → próg zakupu) zostaje stała,
bo to ocena. Ceny sklepowe muszą być żywe — Łowca pushuje `oferty_feed.json`
praktycznie codziennie, a każdy push przebudowuje serwis, więc tabela
w artykule jest tak samo świeża jak na hubie. Efekt uboczny: 31168 pokazywał
zamrożone 379,98 zł, gdy Allegro miało już 375 zł.

**Stan:** gotowe, wdrożone na produkcję

**Dla drugiej strony:** nic

**Uwagi / do rozstrzygnięcia z Piotrem:**
- **Rozbieżność RRP** przy trzech zestawach z prezentownika: materiał podaje
  31161 = 249,99, 42686 = 249,99, 76321 = 209,99; `katalog.json` (Brickset +
  lego.com/pl-pl, akt. 14.08) podaje odpowiednio 259,99 / 259,99 / 219,99.
  Przyjęto dane serwisu, bo tabela cen bierze RRP z tego samego źródła i inaczej
  na jednej stronie stałyby dwie różne kwoty. Zapisane w
  `redakcja/karty/prezentownik-200zl-10-latek.md`. Wygląda na podwyżkę cennika
  o 10 zł — serwer nie ma dostępu do lego.com, więc nie zweryfikuję u źródła.
- Standard Piotra (§18) mówi „nie wpisywać snapshotu cen do artykułu". Znacznik
  nie jest snapshotem — nic nie zamraża i nie podaje daty — ale przy najbliższej
  aktualizacji standardu warto to dopisać wprost.
- Tabela na wąskim ekranie przewija się w poziomie wewnątrz swojej ramki
  (strona nie skacze). Hub zachowuje się identycznie — to nie regresja, ale
  przycisk „Sprawdź w sklepie" jest wtedy przycięty. Osobny temat do poprawki.

## 2026-08-25 08:20 · CODE · Cztery nowe artykuły z materiałów Piotra + drugi rząd zajawek na HP

**Zrobione:**
- `src/pages/artykuly/lego-42215-koparka-volvo-ec500-recenzja.md` — recenzja Technic 42215 (próg 1150 zł)
- `src/pages/artykuly/lego-71858-kuznia-cztery-bronie-recenzja.md` — recenzja NINJAGO 71858 (próg 300 zł)
- `src/pages/artykuly/lego-city-czerwiec-2026-fala.md` — poradnik po fali City z czerwca 2026 (10 zestawów, nowa kategoria „Poradnik")
- `src/pages/prezentowniki/lego-za-200-zl-dla-10-latka.md` — prezentownik, sześć zestawów w budżecie 150–200 zł
- Zdjęcia: slajdery `<div class="galeria-setow" data-sety="…">` w treści (łącznie 22 slajdery, 44 slajdy) + `okladka` w frontmatterze każdego tekstu
- Placeholdery `[wstaw link afiliacyjny]` zamienione na `/idz/<sklep>/<nr>`; przy artykułach wielozestawowych tabele kierują do hubów `/zestaw/<nr>/`
- `src/pages/index.astro` — zajawki artykułów z 3 na 6 (dwa rzędy po trzy)
- `redakcja/karty/` — cztery karty researchu (dotąd katalog był pusty)

**Stan:** gotowe, wdrożone na produkcję

**Dla drugiej strony:** nic

**Uwagi:**
- Amazon.pl z materiału źródłowego (fala City) **pominięty** — brak działającego przekierowania `/idz/amazon/`, link byłby martwy. W jego miejsce Media Expert.
- Wszystkie 25 numerów zestawów użytych w tekstach mają wpis w `obrazy.json`, więc worker serwuje `/img/<nr>.jpg` (sprawdzone na produkcji).
- Progi cenowe celowo ustawione powyżej chwilowych minimów z feedu — drabina ma być trwała, zgodnie ze Standardem §18–19.

---
## 2026-08-25 07:30 · CODE · Kliknięcia afiliacyjne zapisują się — ścieżka domknięta

**Zrobione:** Analytics Engine aktywowany na koncie (Marek, panel Cloudflare),
dataset `idz_kliki` utworzony ręcznie, wiązanie `analytics_engine_datasets`
wróciło do `wrangler.jsonc` (commit `1562d49`).

**Potwierdzenie end-to-end, nie samo „powinno działać":**
- w Version History powstała **wersja** `6cb2791b` (main, aktywna, 100% ruchu,
  error rate 0%) — wczorajsza regresja „build OK, wersja nie powstaje" nie
  wróciła;
- dataset `idz_kliki` pojawił się w panelu **z danymi**, count 8. Panel pokazuje
  dataset dopiero po pierwszym zapisie z Workera, więc to dowód, że `env.KLIKI`
  jest zbindowane i `writeDataPoint` faktycznie pisze.

**Uwaga do pierwszego raportu:** sześć z tych ośmiu zdarzeń to moje przejścia
testowe przez `/idz/` z 25.08 ok. 05:11 UTC (empik, smyk, xkom, allegro,
mediaexpert, planetaklockow — wszystkie dla 76467 albo 31168), wykonane
z serwerowego IP. Przy ruchu bliskim zera zdominują próbkę — nie liczyć z nich
EPC ani konwersji.

**Co jeszcze blokuje odczyt:** `scripts/kliki-raport.mjs` potrzebuje w środowisku
runnerów `CF_ACCOUNT_ID` (`a9ed001e5143106eb3b6b2d013011659`) i `CF_API_TOKEN`
z uprawnieniem „Account Analytics: Read". Bez nich zapis działa, ale Kontroler
dalej nie policzy EPC. Prompt zadania zaktualizowany — nie szuka już przyczyny
w brakującym wiązaniu, bo ta jest załatwiona.

**Dane nie powstają wstecz.** Pierwszy raport z realnym EPC obejmie 25–31.08.

**Stan:** gotowe.

**Dla drugiej strony:** nic.

## 2026-08-25 07:10 · CODE · Sitemapa przycięta do 1 160 adresów (wariant A+B)

**Zrobione:** `astro.config.mjs` dostał filtr sitemapy. Zgłaszamy hub `/zestaw/`
w dwóch przypadkach: ma redakcyjny opis w `sety.json` (248 sztuk) albo ma cenę
z co najmniej dwóch sklepów, czyli porównanie cen jest realnym porównaniem.
Efekt na produkcji: **1 160 adresów zamiast 4 873** — w tym 1 099 hubów,
39 serii, 10 artykułów, 4 prezentowniki i strony stałe.

Pozostałe huby **nie znikają**: dalej się budują (dist ma komplet 4 873 stron),
odpowiadają 200 i są linkowane z tabel serii — sprawdzone po wdrożeniu na
`/zestaw/21102/`. Przestają być tylko zgłaszane w sitemapie.

Filtr liczy się przy każdym buildzie, więc hub wraca do sitemapy sam, gdy Łowca
dorzuci mu drugi sklep, i sam wypada, gdy oferta zniknie. Nie ma tu listy do
ręcznego utrzymywania.

**Podstawa decyzji** — dane z 24.08, nie przeczucie: 4 812 z 4 873 adresów to
były huby; Google nie zaindeksował ani jednego adresu poza stroną główną;
reszta miała status „wykryta, obecnie niezindeksowana" i ostatni crawl NIGDY.
Dwa sąsiednie huby bez opisu (21102, 21103) mają po ~260 słów, z czego **82%
wspólnych** — 19 słów różnicy to numer, nazwa, rok i kwota.

**Uczciwie o oczekiwaniach:** to jest zmiana sygnału, nie przełącznik. Sam
przycięty plik nie sprawi, że Google zacznie crawlować. Przy dwutygodniowej
domenie liczą się przede wszystkim linki z zewnątrz i czas.

**Nowy punkt odniesienia dla Kontrolera:** 1 160 adresów przesłanych,
0 zindeksowanych (stan 25.08). Prompt zadania zaktualizowany.

**Dla drugiej strony (COWORK):** Marek dostał gotową treść zlecenia — chodzi
o ręczne „Poproś o zaindeksowanie" w GSC dla kilkunastu adresów (API z kluczem
tylko-do-odczytu tego nie zrobi) i o odczyt raportu „Indeksowanie stron".

## 2026-08-24 16:50 · CODE · Kliki, linki afiliacyjne i indeksacja — trzy diagnozy

**1. Kliknięcia afiliacyjne: nie brak dostępu, tylko brak zapisu.**
`wrangler.jsonc` nigdy nie miał wiązania `analytics_engine_datasets`, więc
`env.KLIKI` było `undefined`, a `env.KLIKI?.writeDataPoint()` po cichu nie
robiło nic. Nie zapisał się ani jeden klik — żaden token Cloudflare tego by
nie odczytał, bo nie ma czego czytać. Poprzedni raport Kontrolera mówił
„brak dostępu do danych"; to była zła diagnoza.
Dodanie wiązania **wywala deploy na tym koncie**: po pushu produkcja nie
zaktualizowała się przez 17 minut przy zwykłym czasie ~2 minut, a po
cofnięciu wróciła w 3 minuty. Wiązanie jest cofnięte, powód i pełna treść
wpisu siedzą w komentarzu w `wrangler.jsonc`.
Gotowy jest `scripts/kliki-raport.mjs` (kliki per sklep, per set, udział
stanu „brak-linku", kraje) — czeka na `CF_ACCOUNT_ID` i `CF_API_TOKEN`.
Prompt Kontrolera zaktualizowany: wywołuje ten skrypt i raportuje indeksację.
**Do zrobienia po stronie Marka:** odczytać log builda w panelu Cloudflare
(Workers & Pages → blogoklockach → Deployments) z okna 13:55–14:15 UTC 24.08.
Najpewniejsza hipoteza: Analytics Engine wymaga płatnego planu Workers.

**2. „Cztery aktywne programy mają zero linków" — mierzone na złym pliku.**
`redirects.json` z założenia trzyma wyłącznie linki produktowe z feedów, więc
sklep bez feedu nigdy tam nie trafi. Empik, Smyk i x-kom mają linki budowane
przez worker z samego numeru zestawu i **są obecne na każdej podstronie
`/zestaw/`** (sprawdzone na produkcji: 76467 i 31168 linkują empik, smyk,
xkom, lego, allegro, mediaexpert, planetaklockow). Egmont faktycznie ma zero
linków i tak ma zostać — wg rejestru to księgarnia Egmontu (komiksy, książki),
nie sklep z zestawami.
Realny rozjazd był w `linkAfiliacyjny()` w `src/lib/oferty.js`: funkcja nie
znała fallbacków workera i zwracała `null` dla sklepów, do których worker
umiałby przekierować. Naprawione (`SKLEPY_Z_LINKIEM_Z_WORKERA`). Zbudowane
strony wychodzą bajt w bajt tak samo, bo wszyscy wołający podają dziś tylko
sklepy z ofertą — to naprawa pułapki na przyszłość, nie zmiana widoczna.
**Prawdziwy powód zerowych prowizji z tych programów jest inny:** linki są na
podstronach zestawów, a te mają zerowy ruch. To ten sam problem co punkt 3.

**3. Dlaczego nie widać nas w Google — jest twarda odpowiedź.**
Inspekcja adresów przez API Search Console (24.08):
- sitemapa pobrana dziś, 0 błędów: **4 874 adresy przesłane, 0 zindeksowanych**;
- strona główna: PASS, zindeksowana, ale **ostatni crawl 15.08** — dziewięć dni;
- `/artykuly/`, `/prezentowniki/`, `/serie/`, `/wycofania/`, hub `/zestaw/76467/`:
  „Strona wykryta – obecnie niezindeksowana", **ostatni crawl: NIGDY**;
- artykuł o zamku 31168: „Adres URL jest Google nieznany", mimo obecności
  w sitemapie.
To nie jest blokada techniczna: robots.txt przepuszcza (`ALLOWED`), kanoniczne
zgadzają się z naszymi, `INDEXING_ALLOWED`, pobranie strony `SUCCESSFUL`.
Google po prostu nie przydziela crawlowania. Skład sitemapy: **4 812 z 4 873
adresów (98,7%) to huby `/zestaw/`**, przy 10 artykułach i 4 prezentownikach.
Na jeden tekst przypada ~481 niemal identycznych podstron generowanych
z szablonu.
Naprawione od ręki: sitemapa nie stempluje już `lastmod` datą builda. Runnery
pushują kilka razy dziennie, więc Google dostawał codziennie informację, że
wszystkie 4 873 adresy zmieniły się przed chwilą — także artykuły nietknięte
od tygodnia. Dokumentacja Google mówi wprost, że przy niewiarygodnym `lastmod`
przestaje ufać temu polu w całej witrynie.

**Stan:** gotowe, wdrożone, produkcja sprawdzona (strony 200, worker i /img
działają, sitemapa bez lastmod).

**Do decyzji Marka — przycięcie sitemapy:**
Propozycja: zostawić w sitemapie huby z redakcyjnym opisem (248 z `sety.json`)
plus artykuły, prezentowniki, serie i strony stałe — razem ~310 adresów zamiast
4 873. Pozostałe 4 564 huby dalej istnieją i są linkowane wewnętrznie, tylko
przestają zasysać crawl. Nie robię tego bez zgody, bo to decyzja o zasięgu
serwisu, nie poprawka techniczna.

**Dla drugiej strony:** nic.

## 2026-08-24 14:20 · CODE · Raport Kontrolera odpalony ręcznie

**Zrobione:**
- Raport Kontrolera za tydzień 18–24.08 wykonany i dostarczony jako PDF.
  Przebieg o 09:00 nie odpalił się, bo zadanie było jeszcze wyłączone.

**Ograniczenie warte zapamiętania:** `fire_trigger` NIE zadziała na Kontrolera.
Zwraca: „this routine was created via http_api, not by an agent. Agents can
only fire routines they created". Dotyczy każdej rutyny z `created_via:
http_api` — w naszym zestawie to Kontroler, Łowca i „inwestycja IV kwartal".
Rutyny z `created_via: meta_mcp` (Scout, Radar, Wycofania, Backfill) agent
odpali bez problemu. Ręczny przebieg http_api-owej rutyny trzeba więc albo
wykonać samodzielnie w sesji, albo sklonować jej prompt do jednorazowego
zadania (`run_once_at`).

**Co pokazał raport — jedno zdanie:** warstwa danych działa (248 śledzonych
setów, 160 z rabatem ≥20%, 174 nowe minima w 7 dni), ale ruch z Google to
**1 kliknięcie i 13 wyświetleń** w oknie 15–22.08, wyłącznie na stronie
głównej. Żaden artykuł ani hub nie pojawił się w wynikach.

**Trzy rzeczy nierozstrzygnięte, w kolejności ważności:**
1. Kliknięcia afiliacyjne są niemierzalne z poziomu zadania cyklicznego —
   brak dostępu do Analytics Engine (`idz_kliki`), brak `wrangler`, brak
   tokenu API Cloudflare. Bez tego nie ma EPC, więc raport Kontrolera co
   tydzień powtórzy „nie wiem". Potrzebny token w zmiennej środowiskowej
   albo cotygodniowy eksport z panelu do repo.
2. Indeksacja — potwierdza się obraz z 23.08. Przy jednej widocznej stronie
   praca nad treścią i wyglądem ma zerowy zwrot do czasu rozstrzygnięcia.
3. Cztery aktywne programy afiliacyjne mają ZERO linków w `redirects.json`:
   Egmont (6% CPS — najwyższa stawka w miksie), Empik, Smyk (2,1%),
   x-kom (2 linki). Cały ruch dealowy idzie do Allegro: 6 939 z 7 999 wpisów
   w migawce ofert, 141 ze 174 nowych minimów, wszystkie czołowe deale.

**Stan:** gotowe.

**Dla drugiej strony:** nic — punkty 1–3 wyżej są dla Marka, nie dla Cowork.

## 2026-08-24 13:30 · CODE · Kontroler włączony + kalibracja crona

**Zrobione:**
- `trig_01T8AhciW8JD651MrSMuEj7m` („LEGO pon 09:00 — Kontroler") włączony.
  Potwierdzone po zapisie: `enabled: true`, `next_run_at` =
  2026-08-31T07:08:30Z, czyli **poniedziałek 31.08 ok. 09:08 czasu polskiego**.
- Odhaczony punkt 1 backlogu z wpisu COWORK 23.08 20:30.

**Dlaczego był wyłączony:** w konfiguracji nie ma ani `ended_reason`, ani
`suspension_reason` — a to znaczy wyłączenie ręczne. Auto-wyłączenie wygląda
inaczej: stary `send_later` (`trig_013x6kw7r5J1a1YBES3V3YuH`) niesie
`ended_reason: auto_disabled_session_gone`. Zawieszenie po stronie
subskrypcji zostawia `suspension_reason`. Żadnego z nich tu nie ma, więc
hipoteza „sesja padła po limicie" się nie potwierdza.
Ostatni udany przebieg: 17.08 07:16 UTC. `updated_at` przed moją zmianą:
21.08 14:53 UTC — tego samego popołudnia edytowane były też Łowca, Backfill,
Radar i Social, więc wyłączenie wygląda na element porządków z 21.08,
a nie z 18.08.

**Social (`trig_01W1CSp8PM3DDN6UEyNLYe6H`):** zostaje wyłączony. Backlog
z 23.08 22:00 mówi wprost „wstrzymany celowo przez Marka, nie włączać",
a jego własna nazwa niesie powód — „ZAWIESZONE do startu kanałów". Nie ma
`last_fired_at`, bo nigdy nie wystartował, i nie powinien, dopóki nie ruszą
profile. Nie dotykam.

**Uwagi — pułapka na 25.10:** cron to `0 7 * * 1`, czyli 07:00 UTC. Dziś,
w czasie letnim (CEST, UTC+2), wypada to o 09:00. Po zmianie czasu
25.10.2026 (CET, UTC+1) ten sam cron da **08:00 czasu polskiego**. Jeśli
raport ma zostawać o 9:00 przez sezon XI–XII, trzeba wtedy przestawić go na
`0 8 * * 1`. To samo dotyczy wszystkich pozostałych runnerów LEGO — ich crony
też są w UTC i wszystkie przesuną się o godzinę wcześniej.

**Stan:** gotowe.

**Dla drugiej strony:** nic.

## 2026-08-23 22:00 · COWORK+CODE · Taksonomia artykułów i naprawa listingów

**Zrobione:**
- Ustalona zamknięta lista kategorii artykułów i właściciel każdej z nich —
  zapisane w `NARZEDZIA.md`. Podział: Piotr pisze o zestawach (`Recenzja`),
  Marek o cenach i okazjach (`Deal`, `Premiera`, `Prezentownik`, `Kalendarz`).
  `Zapowiedzi` to kategoria graniczna — wymaga uzgodnienia przed pisaniem.
- Zasada nadrzędna: o właścicielu i o tym, gdzie artykuł się pojawia,
  decyduje pole `kategoria` we frontmatterze, **nie katalog**.
- `prezentowniki.astro` (b50cbb4): ręczna tablica czterech pozycji zastąpiona
  globem po `kategoria === "Prezentownik"`. Treść kart przeniesiona do
  frontmattera jako `karta_znacznik`, `karta_tytul`, `karta_opis` z fallbackami.
  Nowy prezentownik pojawia się teraz sam.
- Rozszerzone globy w `/artykuly/` i w zajawkach na stronie głównej —
  widzą komplet 12 artykułów zamiast 9.
- Zabezpieczenia (b2695d2): filtr `m.frontmatter?.kategoria` w obu listingach,
  fallback znacznika. Dziś nic nie odrzucają — zadziałają, gdy do `src/pages/`
  trafi plik `.md`, który artykułem nie jest.

**Stan:** gotowe, na produkcji. `/prezentowniki/` bajt w bajt jak przed zmianą.

**Odstępstwo od specyfikacji:** dodano `karta_kolejnosc` (1–3) w trzech
prezentownikach na 1 września. Powód: mają identyczną `data: 2026-08-18`,
więc sortowanie po dacie nie odtwarzało ręcznie ułożonej kolejności
(rodzinny → chłopiec → dziewczynka). Pole działa **wyłącznie przy remisie dat**,
więc nowy prezentownik ze świeższą datą trafia na górę bez niego.
Odrzucono wariant różnicowania dat — `data` idzie do JSON-LD jako
`datePublished` i przesuwanie jej fałszowałoby dane strukturalne.

**Decyzje, których NIE podjęto:**
- Nie przenosimy prezentowników do jednego katalogu. Po analizie okazało się,
  że kosztuje to 9 linków w 5 plikach, przekierowania 301 w workerze
  (w Workers `public/_redirects` nie działa jak w Pages) i uszczuplenie
  `/artykuly/` — przy zerowym zysku, bo o przynależności i tak decyduje
  kategoria, nie katalog.
- Nie dodajemy filtra kategorii na `/artykuly/`. Przy 12 artykułach nie ma
  czego filtrować. Wrócić przy 20–25 tekstach, i wtedy **wyłącznie po stronie
  przeglądarki** — osobne adresy `/artykuly/kategoria/...` dołożyłyby sześć
  cienkich podstron do serwisu, który już ma problem z niedoindeksowaniem.

**Dla drugiej strony (CODE):**
1. ~~Włącz Kontrolera w Routines~~ — ZROBIONE 24.08.
   `trig_01T8AhciW8JD651MrSMuEj7m` ma `enabled: true`, najbliższy przebieg
   31.08 ok. 09:08. `Social` (`trig_01W1CSp8PM3DDN6UEyNLYe6H`) zostawiony
   wyłączony, zgodnie z tą notatką. Szczegóły — wpis z 24.08 na górze pliku.
2. Deterministyczna serializacja JSON w runnerach — sprawa czytelności
   diffów, nie rozmiaru repo. Patrz `RUNBOOK.md`.
3. Zrzut harmonogramu do `materialy/zadania-cykliczne.md` z flagą `enabled`
   i datą ostatniego odpalenia. Ma objąć też zadania spoza LEGO.
4. Odnośniki w `CLAUDE.md` (usunąć sekcję „Podział ról") i w
   `redakcja/wspolpraca.md`. `_meta` w `known_sets.json` i `redirects.json`
   do poprawienia. `README.md` do uzupełnienia.

**Uwagi:**
Jutro 9:00 zaplanowane zadanie Cowork odczyta raport indeksowania w GSC.
To wraca do problemu właściwego: 4 748 adresów w sitemapie, jedna
zindeksowana strona, ~4 691 szablonowych podstron `/zestaw/[nr]/`
generowanych przez `src/lib/huby.js`. Nie planować działań przed odczytem.

## 2026-08-23 20:30 · COWORK · Porządkowanie dokumentacji + backlog

**Zrobione:**
- `WSPOLPRACA.md` → `NARZEDZIA.md`. Zmiana nazwy, bo `redakcja/wspolpraca.md`
  opisuje inną oś podziału (Piotr ↔ Marek, ludzie) i identyczne nazwy myliły.
  Zawężona klauzula nadrzędności — nie unieważnia ustaleń z `redakcja/`.
  Usunięta lista długu (rotuje szybciej niż reguły, więc idzie tutaj).
- `COWORK-INSTRUKCJA.md` → `RUNBOOK.md`. Wycięta tabela harmonogramu
  (dubluje `materialy/zadania-cykliczne.md`), zachowana i poprawiona wiedza
  operacyjna: opóźnienie feedu ME, blokada 403, półki cenowe, rollback,
  `raw.githubusercontent`. Dopisane dwa nowe ustalenia z 23.08.
- Ustalona zasada: harmonogram jest **generowany**, nie pisany ręcznie.

**Stan:** gotowe do wgrania.

**Dla drugiej strony (CODE) — do zrobienia, priorytet malejąco:**

1. ~~Włącz Kontrolera w Routines~~ — ZROBIONE 24.08. `trig_01T8AhciW8JD651MrSMuEj7m`
   ma `enabled: true`, najbliższy przebieg 31.08. Powód wyłączenia i sprawa
   `Social` — we wpisie z 24.08 na górze pliku.
2. ~~Zmierz repo~~ — ZROBIONE 23.08. Wynik w Uwagach niżej: .git = 7,3 MB
   po gc. Temat cięcia repo zamknięty do odwołania.
3. **Deterministyczna serializacja JSON** we wszystkich runnerach: sortowanie
   kluczy, stałe wcięcie, stabilne liczby. Najtańsza naprawa o największym
   efekcie — patrz `RUNBOOK.md`.
4. **Zrzut harmonogramu:** zadanie cykliczne nadpisujące
   `materialy/zadania-cykliczne.md` realną konfiguracją triggerów. Musi
   zawierać flagę `enabled` i datę ostatniego odpalenia.
5. Usuń sekcję „Podział ról" z `CLAUDE.md`, zostaw dwa odnośniki:
   `redakcja/wspolpraca.md` (ludzie) i `NARZEDZIA.md` (narzędzia).
   Dopisz w obu plikach odnośnik do drugiego.
6. Ujednolić format commitów runnerów: `<Runner>: <opis>`, bez polskich znaków.
7. Drobne porządki:
   - `.wrangler/` do `.gitignore`
   - skasować `src/data/wycofania.astro` i `sprawdz3.mjs` (martwe)
   - poprawić `_meta` w `known_sets.json` i `redirects.json` — opisują
     nieprawdziwe źródło danych
   - udokumentować opisowo konfigurację deployu (brak `.github/workflows`,
     całość żyje w panelu Cloudflare — nie da się odtworzyć środowiska z repo)
   - uzupełnić `README.md`

**Dla Marka (poza repo):**
- Odinstaluj z Cowork skille `klocki-scout-nowosci`, `klocki-lowca-promocji`,
  `klocki-radar-konkurencji`, `klocki-kontroler` — uśpione duplikaty runnerów,
  zapisują do martwej ścieżki. Zostaw `klocki-redaktor`, `klocki-social`,
  `klocki-seo`, `klocki-afiliacje`.
- Zarchiwizuj `~/Desktop/TYLKOKLOCKI/blogoklockach-astro/`,
  `tylkoklocki-rebranding_1/` i `~/Documents/Claude/Projects/blogoklockach/`.

**Uwagi:**
Repo zmierzone: po `git gc` katalog `.git` waży 7,3 MB (przed: 26 MB).
Wcześniejszy alarm o puchnięciu historii był chybiony — delty kompresują się
dobrze mimo 17,4 MB surowych wersji `redirects.json`. Temat rozbijania pliku
i wynoszenia danych do R2 odłożony, przegląd najwcześniej za pół roku.
Deterministyczna serializacja JSON zostaje w planie, ale jako sprawa
czytelności diffów, nie rozmiaru repo.

Zrzut harmonogramu ma obejmować także zadania spoza LEGO (Herzfaden, XTB,
angielski) — dziś nie opisuje ich żaden dokument.

## 2026-08-23 19:00 · COWORK · Uruchomienie Search Console + ustalenie zasad współpracy

**Zrobione:**
- Dodana usługa `https://tylkoklocki.pl/` w Google Search Console (typ: prefiks
  URL), zweryfikowana automatycznie metodą „dostawca nazwy domeny" (token DNS
  w Cloudflare). Konto: marek.dolewski@gmail.com.
- Zweryfikowany stan GA4: tag `G-5M8LH9SKQC`, usługa „tylkoklocki", działa
  poprawnie — 24 użytkowników w 7 dni, 347 zdarzeń. Nic nie wymagało zmiany.
- Sprawdzona hipoteza o pozostałościach po starym sklepie w indeksie.
  **Nie potwierdziła się:** `site:tylkoklocki.pl` z `filter=0` zwraca jeden
  wynik (stronę główną z nową treścią), `site:tylkoklocki.pl drewniane` zero.
  W indeksie nie ma URL-i starego sklepu. Ślad po starym sklepie istnieje
  wyłącznie POZA domeną (Ceneo, Opineo, Gwiazdor, YouTube, PDF gminy Wołomin)
  i przez GSC się go nie usunie.
- Dodane `WSPOLPRACA.md` i ten plik.

**Stan:** gotowe. Zaplanowane zadanie Cowork `gsc-tylkoklocki-indeks` na
2026-08-24 09:00 — odczyta raport indeksowania, gdy GSC przeliczy dane.

**Dla drugiej strony (CODE):**
1. Przenieść `WSPOLPRACA.md` i `DZIENNIK.md` do korzenia repo i zacommitować.
2. Skasować `COWORK-INSTRUKCJA.md` — jest sprzeczny z
   `materialy/zadania-cykliczne.md` i myli oba narzędzia.
3. Rozstrzygnąć problem niedoindeksowania (patrz Uwagi) — to zadanie po
   stronie kodu, nie treści.

**Uwagi:**
Realny problem SEO jest odwrotny do początkowej hipotezy: sitemapa zgłasza
4 748 adresów, Google ją czyta („Sukces", ostatni odczyt 22.08), a
zindeksowana jest jedna strona. Z tego ~4 691 to `/zestaw/[nr]/` generowane
szablonowo z `huby.js` — kilka tysięcy niemal identycznych podstron z domeny
bez historii w tej tematyce. To profil, który Google typowo klasyfikuje jako
cienką treść i pomija.

Raport „Strony" w GSC był 23.08 jeszcze pusty (usługa założona tego dnia).
Jutro pokaże, czy huby siedzą w „Wykryto – obecnie niezindeksowana" (Google
je zna i świadomie odpuszcza) czy „Zeskanowana – obecnie niezindeksowana"
(odwiedził i uznał za zbyt ubogie). To dwie różne diagnozy i dwie różne
strategie naprawy — nie planować działań przed odczytem.

## 2026-08-24 · CODE (Scout) · Brickset API v3 — klucz i dokumentacja

**Zrobione:**
- Klucz Brickset API v3 (konto MAREK1972, wyrobiony 23.08) zweryfikowany:
  `checkKey` zwraca `{"status":"success"}`.
- Potwierdzony kształt danych na `getSets` dla 11371: `LEGOCom` zawiera
  wyłącznie rynki US / UK / CA / DE, każdy z `retailPrice`
  i `dateFirstAvailable`. **Ceny w złotych w API nie ma** — dla 11371 jest
  DE 249,99 EUR przy 1 099,99 zł w naszym `katalog.json`.
- `RUNBOOK.md`: nowa sekcja „Brickset API v3" — endpoint, klucz w env,
  limit liczony tylko dla `getSets`, `pageSize` do 500, `updatedSince`
  do przyrostów, pole cenowe, lista przydatnych pól, ograniczenia
  regulaminowe.
- Wcześniej dziś: pełny przegląd rocznika 2026 przez listy per seria
  (commit `5cd9d62`) — 416 realnych zestawów, 212 bez opisu redakcyjnego,
  dwie serie bez ani jednego opisu (Dreamzzz, The Legend of Zelda).

**Stan:** klucz działa, dokumentacja gotowa. Backfill cen świadomie
NIEZROBIONY — czeka na raport indeksowania GSC.

**Dla Marka (poza repo) — BLOKER:**
Klucz trzeba dodać jako `BRICKSET_API_KEY` w zmiennych środowiska CCR
(`env_01YL3diD2yzP3UGYsU7Txvx7`), tam gdzie siedzą `GSC_KEY_JSON_B64`
i `TD_TOKEN`. Sesja runnera nie ma do nich zapisu — wstrzykuje je
konfiguracja środowiska spoza kontenera, a `export` w kontenerze ginie
przy jego wygaszeniu. Do czasu dodania Scout nie może użyć API
w automatycznym przebiegu.

**Do ustalenia razem (po raporcie GSC):**
1. Źródło kursu EUR→PLN. Sam kurs NBP nie wystarczy — LEGO nie przelicza
   cen katalogowych kursem dnia. Dla 11371 implikowany przelicznik to 4,40,
   podczas gdy kurs rynkowy jest niższy. Trzeba zdecydować, czy liczymy
   mnożnikiem wyznaczonym z setów, dla których mamy obie ceny, czy
   oznaczamy cenę jako szacunkową.
2. Czy nadpisywać istniejące `cena_katalogowa` — ustalone, że NIE.
3. Format zapisu — serializacja deterministyczna (patrz backlog i reguła
   zapisu `sety.json` w RUNBOOKU).

**Uwagi:**
Wyznaczenie mnożnika EUR→PLN jest policzalne od ręki: w `katalog.json`
mamy ceny w zł, a API da EUR dla tych samych numerów. Rozrzut mnożnika
na kilkuset setach powie, czy LEGO trzyma stałe progi cenowe per rynek
(wtedy przeliczanie jest bezpieczne), czy nie (wtedy cena z przeliczenia
nie nadaje się do liczenia rabatu i lepiej zostawić puste pole).

## 2026-08-24 (2) · CODE (Scout) · Przelicznik EUR→PLN zbadany

**Zrobione:**
- Pobrane z API roczniki 2026 (913 setów, 2 wywołania `getSets`), 2024 i 2022
  (po 1). Zestawione z cenami w zł z `katalog.json`.
- **Przelicznik jest stabilny wewnątrz rocznika, ale dryfuje między nimi:**
  2026 → 4,223 (n=345, odch. 0,077), 2024 → 4,303, 2022 → 4,348.
  97,4% par mieści się w ±10% od mediany rocznika.
- Wniosek: przeliczanie jest bezpieczne dla roczników 2024–2026 przy użyciu
  mnożnika właściwego dla rocznika premiery. Jeden mnożnik globalny byłby
  błędny. Dla starszych roczników rozrzut rośnie i cena z przeliczenia
  przestaje nadawać się do liczenia rabatu.
- Rozbicie per seria nie pokazuje różnic (wszystko 4,10–4,29), więc mnożnika
  per seria nie trzeba. Per próg cenowy jest lekki wzrost (4,17 → 4,32),
  efekt zaokrągleń do `,99`.
- **Znalezione przy okazji: 9 zestawów rocznika 2026 ma najpewniej błędną
  cenę katalogową u nas** — mnożnik od 3,5 do 12,2 przy zgodnej liczbie
  elementów. Osiem z nich jest zawyżonych, czyli generują zawyżony rabat.
  Lista w RUNBOOKU.
- `RUNBOOK.md`: sekcje „Przelicznik EUR→PLN" i „Podejrzane ceny katalogowe".

**Stan:** analiza gotowa, nic nie zapisane do `katalog.json` — zgodnie
z ustaleniem czekamy na raport indeksowania GSC.

**Do decyzji Marka:**
1. Czy backfill ma używać mnożnika per rocznik (rekomendacja: tak) i czy
   ograniczyć go do roczników 2024+.
2. Czy ceny wyliczone oznaczać osobnym polem (rekomendacja: tak — inaczej
   za pół roku nie odróżnimy odczytanej od policzonej).
3. Dziewięć podejrzanych cen do weryfikacji na LEGO.com PL — to warto
   poprawić niezależnie od backfillu, bo psuje wiarygodność rabatów już dziś.

## 2026-08-26 (2) · CODE (Scout) · Przegląd roczników 2020–2026

**Zrobione:**
- Pobrane z Brickset API komplety roczników 2020–2026 (15 wywołań `getSets`,
  sumy zgodne z polem `matches` dla każdego roku).
- Filtr „realny zestaw" oparty na polu `category` z API zamiast moich reguł
  po prefiksie numeru. Kontrola: 252 z 255 opisanych setów 2026 to `Normal`,
  3 to `Collection`, zero fałszywych odrzuceń. Poprzedni filtr zaniżał
  rocznik 2026 z 558 do 416 realnych setów.
- **Wynik: 3538 realnych zestawów z lat 2020–2026, opisanych 260 (7,3%).**
  Rocznik 2026 pokryty w 45,7%, każdy wcześniejszy praktycznie w zerze.
- **831 zestawów jest jednocześnie w sprzedaży, ma cenę katalogową w zł
  i nie ma ani zdania opisu.** To gotowa kolejka pracy zdolna konwertować
  afiliacyjnie od razu. W czołówce: Barad-dûr (10333), Venator (75367),
  Hulkbuster (76210), Barka Jabby (75397), Zamek Disneya (43222),
  Ferrari Daytona SP3 (42143), Lamborghini Sian (42115).
- `known_sets.json`: rejestr przebudowany na strukturę per rocznik
  (9 KB → 90 KB), priorytet redakcyjny na 60 numerów ze wszystkich lat.
- `RUNBOOK.md`: tabela przelicznika EUR→PLN rozszerzona na 2020–2026;
  nowa sekcja o filtrze `category`.

**Stan:** rejestr gotowy. Nic nie zapisane do `katalog.json` — backfill cen
nadal czeka na raport GSC.

**Ustalenie o przeliczniku (pełne dane):** mnożnik spada monotonicznie
z 4,715 (2020) do 4,223 (2026), rozrzut rośnie wstecz. Dla roczników
2022–2026 przeliczanie jest bezpieczne przy mnożniku per rocznik. Dla
2020–2021 nie — odchylenie 0,19–0,22 i co dziesiąty set poza zakresem
sprawiają, że rabat policzony z takiej ceny byłby niewiarygodny.

**Do decyzji Marka:**
Przy tempie 6 setów dziennie 831 pilnych luk to ponad cztery miesiące, czyli
po sezonie. Kolejność do ustalenia: czy Scout ma dalej dokładać po kilka
dziennie, czy uruchamiamy osobną sesję redakcyjną na czołówkę listy.
