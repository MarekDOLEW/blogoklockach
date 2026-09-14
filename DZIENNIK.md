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

## Ustalenia trwałe

Rzeczy, które obowiązują niezależnie od daty. Nie archiwizują się. Wpisuj tu
tylko to, co ma przetrwać miesiąc — jednorazowe ustalenia zostają we wpisach.

- (pusto — dopisuj, gdy ustalenie przeżyje swój wpis)

## Archiwum

Wpisy starsze niż 14 dni żyją w plikach miesięcznych. Nic nie zostało
skasowane — jeśli szukasz czegoś sprzed miesiąca, jest tam:

- [`2026-08`](materialy/dziennik-archiwum-2026-08.md) — 27 wpisów

Archiwizuje `node scripts/archiwum-dziennika.mjs`.

## 2026-09-09 08:00 · CODE · Indeksacja: sitemapy sekcyjne z lastmod, noindex na cienkich hubach, RSS, FAQ, „Przeczytaj też"

**Zrobione** (gałąź `claude/tylkoklocki-indexing-seo-5d1jit`, do wdrożenia
`git push origin claude/tylkoklocki-indexing-seo-5d1jit:main`), na podstawie
audytu Cowork z 09.09 (3 523 adresy w sitemapie, 3 418 hubów, zero `lastmod`):
- **Sitemapy sekcyjne**: `@astrojs/sitemap` zdjęta; `sitemap-index.xml` (ten
  sam adres) wskazuje 7 plików `sitemap-{artykuly,prezentowniki,deale,serie,
  nowosci,zestawy,inne}.xml` (`src/lib/sitemapy.js`). `lastmod` tylko z
  realnych dat: `zaktualizowano`/`data` tekstów, dla hubów – data najnowszego
  naszego tekstu o zestawie. Stan: artykuły 19, prezentowniki 19, deale 5,
  serie 45, nowości 12, zestawy 799, inne 4 – razem 903 adresy (było 3 523).
- **Noindex, follow na cienkich hubach** – `src/lib/seo.js`, `hubIndeksowalny`:
  ≥3 z 4 warunków (≥3 sklepy, tekst >300 znaków, wspomniany w tekście,
  premiera ≤18 mies. i nie EOL) albo prezentownik / gorący deal.
  **799 hubów indeksowalnych, 4 148 z noindex** (z 4 947). Huby działają jak
  dotąd. `sitemap-priorytet.xml` też filtruje po tej regule.
- **RSS** `/rss.xml` (30 najnowszych tekstów), link w `<head>` i w stopce.
- **Widoczne FAQ** pod artykułami i prezentownikami (`Faq.astro`) – dotąd FAQ
  szło wyłącznie do JSON-LD. **„Przeczytaj też"** (`PowiazaneArtykuly.astro`,
  4 linki: wspólne zestawy → seria → kategoria → data).
- **Data aktualizacji** widoczna jako „Aktualizacja: DD.MM.RRRR" w `<time>`;
  autor w schema jako osoba i widoczny podpis „Piotr M." (decyzja Marka;
  `src/config.js`, `AUTOR.imie`).
- **Huby**: „Najniższa cena, jaką zanotowaliśmy" (z `ceny_baza.json`, tylko gdy
  niższa od dzisiejszej) i „Inne zestawy z serii" (6 linków do hubów
  indeksowalnych tej serii). Pełnej historii cen w danych nie ma – tabeli nie da
  się zrobić bez zbierania szeregów czasowych.
- **Nietknięte** (decyzja Marka): linkowanie na stronie głównej.
- `RUNBOOK.md`, sekcja „Sitemapy i Search Console" przepisana.

**Stan:** wdrożone na `main` 09.09 ~07:45, produkcja sprawdzona (sitemapy 200,
`sitemap-0.xml` 404, noindex na cienkim hubie, FAQ i „Przeczytaj też" widoczne,
worker `/img/` i `/idz/` działają). **Marek zgłosił sitemapy w GSC 09.09.**

**Dla drugiej strony (COWORK):** nic do zgłaszania – sitemapy są w GSC. Za 2–3
tygodnie (ok. 23–30.09) odczytać w GSC liczniki „przesłane / zindeksowane"
osobno dla każdej z siedmiu sitemap sekcyjnych i raport Discover, i zapisać
tu wynik. Punkt odniesienia: 903 adresy przesłane (799 hubów), stan
indeksacji sprzed zmiany – 0 poza stroną główną.

**Poprawki po przeglądzie Marka (09.09, ~08:30):** `lastmod` we wszystkich
sekcjach (huby z daty ostatniej oferty, serie i nowości z maksimum po
zestawach, `/`, `/deale/`, `/nowosci/`, `/serie/`, `/wycofania/`,
`/kolekcjoner/` z datą builda – zmieniają się codziennie); kalendarz i
zapowiedzi przeniesione z `sitemap-artykuly.xml` do `sitemap-inne.xml`.
Stan: artykuły 17, prezentowniki 19, deale 5, serie 45, nowości 12, zestawy
799, inne 6 – razem 903, `lastmod` na 901. Progi hubów bez zmian (799) –
decyzja: ocenić w GSC za 2–3 tygodnie, zaostrzyć, jeśli „wykryto,
niezindeksowano" zostanie wysokie.

**Uwagi:**
- Cienkie huby z `noindex` po pewnym czasie wypadną z raportu „wykryta,
  niezindeksowana" – to zamierzone. Hub wraca do indeksu sam, gdy Łowca
  dorzuci trzeci sklep albo redakcja dopisze tekst.
- Nadal do zrobienia (redakcja, nie kod): wydłużenie artykułów do 800–1 200
  słów, FAQ w tekstach, które go nie mają, linki z zewnątrz.

## 2026-09-04 06:50 · CODE · Kolejka redakcyjna w XLSX + osobna sesja na czubek

**Zrobione:**
- **`materialy/kolejka-redakcyjna.xlsx`** — 809 zestawów do opisania: rocznik
  2020–2026, status `dostepny`, cena katalogowa w zł, brak wpisu w `sety.json`.
  Kolumny: numer, nazwa PL, rok, seria, cena. Sortowanie po cenie malejąco.
  Drugi arkusz „Metodologia" opisuje kryteria, źródła i rozkład po rocznikach.
- Liczba przeliczona na świeżo z `katalog.json` + `sety.json`. Rejestr
  (`known_sets.json`) podaje 794 — to stan z 26.08; katalog odświeżono 02.09
  i doszło 15 nowych dostępnych zestawów z ceną.
- **Uruchomiona osobna sesja redakcyjna** `session_017crJHR6y9z5CNDcwqQ2UYg`
  („Redakcja — czubek kolejki"). Bierze zestawy po kolei od góry arkusza,
  partiami po 5–10, dopisuje wpisy do `src/data/sety.json`.

**Stan:** gotowe (arkusz), w toku (sesja redakcyjna — praca ciągła)

**Dla drugiej strony:** nic. Kolejka jest zarezerwowana przez sesję redakcyjną —
nie dublować opisów z arkusza.

**Uwagi:**
- Marek jawnie odrzucił przestawienie priorytetu na Harry'ego Pottera.
  Kolejność to cena malejąco, bez wyjątków.
- **Dwie sesje piszą teraz do `sety.json`** (Scout codziennie 5:00 + Redakcja).
  Każda musi robić `git pull origin main` tuż przed zapisem i weryfikować
  `git diff -U0 src/data/sety.json | grep -c '^-[^-]'` = 0.
- Zestaw 40824 (Tweety) jest w katalogu dwa razy: Seasonal/2025 i
  Looney Tunes/2026. W arkuszu został nowszy wpis — do weryfikacji przy opisie.

## 2026-08-31 15:30 · CODE · Zrzut harmonogramu odtworzony + korekty w RUNBOOK

**Zrobione:**
- **`materialy/zadania-cykliczne.md` przepisany na zrzut** ze świeżego odczytu
  `list_triggers` + `list_sessions` (31.08, 15:25). Wymagane przez `NARZEDZIA.md`
  kolumny są: cron, **enabled**, ostatnie odpalenie. Odczyt objął 11 Routines
  na koncie — pełna lista, bez paginacji.
- Dołożona druga tabela: Routines spoza projektu (Angielski, Herzfaden,
  inwestycja). Nie dotyczą serwisu, ale **dzielą ten sam limit konta**, a to on
  wywrócił harmonogram 21.08. Widać z niej, że poniedziałek 07:00-09:30 to pięć
  zadań naraz — pierwsze miejsce do rozsunięcia przy kolejnym uderzeniu w limit.
- **`RUNBOOK.md`**: pięć wystąpień „Łowca 07:00" w mapie plików → 08:30;
  „Backfill 12:00" → wyłączony od 29.08; usługa GSC poprawiona na domenową.
- **`RUNBOOK.md`, sekcja Media Expert**: przepisana. Mówiła, że przebieg o 07:00
  łapie wczorajszy feed — to już nieprawda, bo po to Łowca poszedł na 08:30.
  Dopisane dwie pułapki: zmiana czasu 25.10 cofnie przebieg na 07:30 i problem
  wróci, oraz że nazwa Routine musi iść za cronem.
- **`RUNBOOK.md`, nowa sekcja „Sitemapy i Search Console"**: dwie sitemapy i po
  co obie, pułapka usługi domenowej w GSC, oraz że karta w `karty_setow.json`
  nie gwarantuje podstrony.

**Stan:** gotowe

**Dla drugiej strony:** nic — runnery i infrastruktura należą do Claude Code.

**Uwagi:**
- **Kontroler działa.** Przebieg 31.08 09:11, status `SUCCEEDED`. To zamyka wątek
  z 30.08, gdy ostatni odczyt pochodził z 17.08 i wyglądało to na cichą awarię.
- **Korekta mojej wczorajszej notatki:** `last_fired_at` zwracają WSZYSTKIE
  triggery, także te przypięte do trwałej sesji. Pełny `last_run` ze statusem
  tylko te tworzące świeżą sesję. Wczoraj napisałem, że runnery nie zwracają nic
  i zastępowałem to `updated_at` sesji — niepotrzebnie, dane są dokładniejsze.
- **Trigger Radara 13:00 (`trig_01KbUQcgjek5iQFhbyokoLLi`) zniknął z konta**
  między 30 a 31.08. Był wyłączony od 15.08, więc nic nie przestało działać.
  Nie odtwarzać — drugi przebieg Radara wycofano świadomie 21.08.
- **Zostaje otwarte: 32 karty bez podstrony.** `karty_setow.json` ma 445 wpisów,
  `/zestaw/<nr>/` powstaje dla 413. Brakujące nie są w `katalog.json`, więc
  `huby.js` ich nie generuje mimo cen i linków. Teksty leżą w repo niewidoczne.
  Naprawa opisana w RUNBOOK, sekcja „Sitemapy i Search Console".

## 2026-08-31 08:10 · CODE · Typografia: pauza → półpauza w całym serwisie; H2 kart bez „— opis"

**Zrobione (decyzja Marka):**
- Nagłówek karty zestawu to teraz samo „LEGO <nr> <nazwa>" — sufiks „— opis"
  usunięty z `[nr].astro`.
- Wszystkie pauzy (—) zamienione na półpauzy (–) w treściach serwisu:
  dane zasilające strony (karty_setow, katalog, sety, wycofania, opisy,
  kategorie_artykulow, galerie), wszystkie strony/komponenty/lib/layouty
  i pluginy remark (tabele cen w artykułach). Zbudowany dist: **zero pauz**
  na 4980 stronach.
- `import-karty.py` dostał `typografia()` — przyszłe DOCX-y Piotra (pisane
  pauzą) normalizują się przy imporcie same.
- NIE ruszone: pliki wewnętrzne (rrp_potwierdzone, rejestr afiliacji, stany
  runnerów, ceny_baza) i dokumenty w `redakcja/` (materiały Piotra verbatim).

**Stan:** gotowe, opublikowane na main.

**Dla drugiej strony:** runnery piszące teksty do plików zasilających stronę
(Scout — opisy w sety.json) powinny od teraz używać półpauzy.

## 2026-08-31 07:25 · CODE · Szósta (ostatnia) partia kart P07: brakujące 57 + Archive + Nike + Super Mario

**Zrobione:**
- `karty_setow.json`: **70 nowych kart** z 4 zipów (w tym „brakujące 57"
  domykające luki w ~30 seriach: polybagi 30xxx, GWP-y 40xxx, Architecture
  21065–67, minifigurki, Zelda, Wednesday, Animal Crossing, KPop, Nike,
  Super Mario). Rejestr: 375 → **445**; na żywo 413 stron. Duplikaty
  międzyseryjne znów pominięte (40920 Looney=Seasonal, 40923 Shrek=BrickHeadz).
- `katalog.json`: nowe serie **The Legend of Zelda, Shrek, Looney Tunes,
  Nike x LEGO** + sety dołożone do AC/Bluey/Sonic/Minifigurek; elementy
  z Bricksetu, RRP Piotra po kalibracji mnożnikiem. 71052: elementy 7→8.
- Bramka RRP zablokowała 7 polybagów (my 16,99/29,99 vs Piotr 16,49) —
  rejestr lego.pl rozstrzygnął NA KORZYŚĆ PIOTRA: saszetki 2026 kosztują
  16,49 (71051–71053 potwierdzone), a 30734 ma €3.99. Poprawione 7 wpisów
  katalogu; stara wiedza „polybag = 16,99" (m.in. komentarz w odsiew.js)
  dotyczy poprzednich roczników.
- `scripts/import-karty.py`: nowe warianty placeholderów partii („sprawdź
  aktualne informacje/oferty/dostępność", „zobacz analizę ceny"), RRP też
  z pola „Cena / sposób uzyskania" (wariant szablonu dla polybagów/GWP),
  fallback linku kategorii na `/serie/` dla serii bez strony (GWP „Inne",
  LEGO House, LEGOLAND), filtr plików macOS `._*`, aliasy Creator 3 w 1
  i Nike x LEGO Collection.
- `[nr].astro`: kotwica `#ceny` istnieje też przy braku tabeli cen
  (fallbackowy komunikat) — linki z kart GWP nie prowadzą w nic.

**Stan:** gotowe, wypchnięte. Build 4978 stron zielony; kontrola-rrp: zero
rozbieżności; zero nierozwiązanych placeholderów w dist.

**Dla drugiej strony:** nic.

**Uwagi:** GWP-y i sety LEGO House/LEGOLAND (17 kart „Inne") świadomie BEZ
wpisu w katalogu (RUNBOOK: gratisy odsiewamy) — karty czekają w danych na
ewentualne huby. Nierozstrzygnięte 1:1 (Piotr vs Brickset, bez trzeciego
głosu): dystrybucja 77093 (P: ekskluzyw, BS: Retail) i 40824 (odwrotnie) —
zostały wartości Piotra.

## 2026-08-31 07:20 · CODE · Piąta paczka kart P07: Sonic, One Piece, Gabi, Fortnite, DREAMZzz

**Zrobione:**
- `karty_setow.json`: **24 nowe karty** (Sonic 5, One Piece 7, Koci Domek
  Gabi 3, Fortnite 4, DREAMZzz 5 — rozkład zliczony z rejestru).
  Rejestr: 351 → 375; na żywo 358 stron.
- `katalog.json`: **nowa seria DREAMZzz** (5 setów) + dołożone 77117/77118
  (Sonic) i 11215 (Gabi) — elementy z Bricksetu, RRP Piotra po kontroli
  mnożnikiem drabiny (wszystkie 4,20–4,29 od EUR, zgodne). Dzięki temu
  powstało 8 nowych hubów i `/serie/dreamzzz/` — build 4959 → 4968 stron.
- 75646 (One Piece, okręt Garpa): elementy w katalogu 1738 → **1705**
  (Brickset potwierdza wartość Piotra).
- 11371: domknięty ogon wczorajszej poprawki — `katalog.json` miał jeszcze
  1099,99; `kontrola-rrp --napraw` wyrównało do 1079,99, kontrola ZERO
  rozbieżności.
- `scripts/import-karty.py`: aliasy serii Sonic the Hedgehog→Sonic,
  ONE PIECE→One Piece.

**Stan:** gotowe, wypchnięte. Build 4968 stron zielony.

**Dla drugiej strony:** nic.

**Uwagi:** nazwy DREAMZzz w katalogu pochodzą z metryk Piotra (jedyne
polskie, jakie mamy) — przy zaciągu lego.pl zweryfikować jak zwykle.

## 2026-08-31 07:15 · CODE · Czwarta paczka kart P07: DC/Batman, Bluey, Art, Architecture (+2 zipy duplikatów)

**Zrobione:**
- `karty_setow.json`: **12 nowych kart** (DC/Batman 5, Bluey 3, Art 3,
  Architecture 1; rozkład sprostowany po zliczeniu z rejestru). Rejestr: 339 → 351; 334 strony z kartą na żywo.
  Zip Chinese Festivals to w całości duplikaty (80118–80121 wgrane jako
  Seasonal), z Bluey odpadł duplikat 10469 (DUPLO), z DC — 40859 (BrickHeadz).
- `scripts/import-karty.py`: **mapowanie serii na klucz katalogu** —
  „LEGO DC / Batman" dawało zepsuty slug `/serie/dc-/-batman/`;
  teraz aliasy (DC/Batman→Batman, Chinese Festivals→Seasonal,
  NINJAGO→Ninjago) + walidacja, że seria istnieje w katalog.json
  (inaczej ostrzeżenie o linku w próżnię). Pole `seria` karty i teksty
  linków biorą nazwę kanoniczną repo.
- 6 kart bez huba (76330/76331/76333 DC, 31218/31220 Art, 21064
  Architecture) — czekają na pierwszą ofertę, jak Editions z paczki 2.

**Stan:** gotowe, wypchnięte. Build 4959 stron zielony, linki
/serie/batman/ i /serie/bluey/ sprawdzone w dist.

**Dla drugiej strony:** nic.

## 2026-08-31 07:10 · CODE · Trzecia paczka kart P07: Seasonal-2, Jurassic World, Ideas, Icons, Botanicals

**Zrobione:**
- `karty_setow.json`: **46 nowych kart** przez `scripts/import-karty.py`
  (61 DOCX, z czego 15 to duplikaty Seasonal z paczki pierwszej — skrypt
  je pominął). Rejestr: 293 → 339; 328 stron z kartą na żywo.
- Bramka RRP: blokada 11371 (Icons Shopping Street) — Piotr 1079,99 vs
  nasze 1099,99. Kalibracja drabiną rozstrzygnęła NA KORZYŚĆ PIOTRA:
  wszystkie 5 potwierdzonych setów z RRP 249,99 € (42177, 71814, 71837,
  76454, 76473) ma polską cenę 1079,99. Poprawione `sety.json`
  i `ceny_baza.json` (błąd Scouta); do rejestru potwierdzonego nie wpisuję
  (kalibracja to poszlaka, nie odczyt u źródła) — potwierdzi się przy
  następnym zaciągu lego.pl.
- 21369 The X-Files: Piotr „regularna" vs Brickset LEGO exclusive i nasz
  własny opis — metryka i FAQ o RRP podmienione na wariant ekskluzywny.

**Stan:** gotowe, wypchnięte. Build 4959 stron zielony.

**Dla drugiej strony:** nic.

**Uwagi:** technika kalibracji drabiny (rejestr potwierdzony × RRP EUR
z Bricksetu) rozstrzyga spory o polską cenę bez dostępu do lego.pl —
warta zapamiętania przy kolejnych blokadach RRP.

## 2026-08-31 07:00 · CODE · Druga paczka kart P07: 5 serii, 127 zestawów

**Zrobione:**
- `karty_setow.json`: **127 nowych kart** przez `scripts/import-karty.py`
  (pierwszy bojowy przebieg skryptu): NINJAGO 23, Friends 30, Disney 28,
  Editions 21, Marvel 25. Rejestr: 166 → 293. (Rozkład per seria poprawiony
  po sprawdzeniu — pierwotny wpis i opis commita d10ff5f podawały błędne
  liczby; suma 127 była dobra.) Build 4959 stron zielony.
- Bramka RRP zadziałała: zablokowała 43306 (Piotr 249,99 vs nasze 169,99 —
  rejestr lego.pl + rynek 173–220 zł potwierdzają nasze) i 43307 (Piotr
  299,99 vs katalog 249,99 — drabina 59,99 € = 249,99 zł). Obie karty
  wgrane nakładką z poprawionym RRP w metryce, FAQ i przeliczniku
  za element. 43307 do potwierdzenia przy następnym zaciągu lego.pl.
- `sety.json`: −ekskluzyw 76345 (Brickset: Retail, Piotr: regularna — 2:1).
- 11 setów Disney (43011–43033: piłkarze „momenty", logo FIFA itp.) nie ma
  huba `/zestaw/` — brak ofert i ceny w feedach. Karty siedzą w danych
  i pojawią się same, gdy set dostanie pierwszą ofertę.

**Stan:** gotowe, wypchnięte.

**Dla drugiej strony:** nic.

**Uwagi:** nasza kanoniczna nazwa 43301 „Toy Story **Cienki** — podpórki pod
książki" wygląda na błąd zaciągu (postać w polskim dubbingu to Chudy; Piotr
też pisze Chudy) — do sprawdzenia na LEGO.com jak 40881.

## 2026-08-31 06:50 · CODE · Korekta starych kart + skrypt importu na kolejne paczki

**Zrobione:**
- `karty_setow.json`: 47 odpowiedzi FAQ w kartach City/Technic/Star Wars
  z pierwszej partii domknięte tą samą korektą co P07 („Najbardziej
  naturalnym kierunkiem są większych samochodów…" → „…jest dokupienie…").
  Stare paczki miały tylko ten jeden wadliwy wzorzec; frazy odbiorcy
  i „Obsadę tworzą" doszły dopiero w P07. Build 4959 stron zielony.
- **`scripts/import-karty.py`** — od teraz jedna ścieżka importu paczek
  Piotra: parsowanie DOCX, bramka RRP (rozjazd blokuje), raport rozbieżności
  elementów/premier/dystrybucji, placeholdery→linki, korekty szablonu
  (z logiem każdej), akapity redakcyjne wg progu, zapis w stabilnym
  formacie. Tryb `--sucho` = sam raport. Procedura opisana w RUNBOOK
  („Karty zestawów — import paczek Piotra").
- Test: przebieg na paczce P07 --sucho → 77× „karta już istnieje", zero
  fałszywych blokad; transformacje bajt w bajt zgodne z wgranym P07.

**Stan:** gotowe. Następne zipy: `python3 scripts/import-karty.py <zipy>
--sucho`, przejrzeć raport, rozstrzygnąć rozjazdy Bricksetem, puścić bez
--sucho, build, commit.

**Dla drugiej strony:** nic.

## 2026-08-31 06:40 · CODE · Karty Piotra: 5 serii (77 zestawów) + metryka zestawu na stronie

**Zrobione:**
- `src/data/karty_setow.json`: **77 nowych kart** z DOCX Piotra (paczka P07):
  BrickHeadz 14, DUPLO 19, Harry Potter 17, Seasonal 14, Speed Champions 13.
  Razem w rejestrze 166 kart. Placeholdery `[… – link wewnętrzny]` zamienione
  na `#ceny` i `/serie/<slug>/` jak w poprzednich partiach; sety 501–1200 el.
  dostały +1, a 1201+ el. +2 akapity redakcyjne liczone z naszych danych
  katalogu (pozycja w roczniku serii, cena/element vs mediana, sąsiedzi
  cenowi z linkami do hubów).
- `src/pages/zestaw/[nr].astro` + `global.css`: sekcja **„Metryka zestawu"**
  (tabela klucz→wartość między opisem a FAQ, podkład #eef1f7 odróżnia ją od
  białych tabel cen). Pole `metryka` istniało w danych od pierwszej partii,
  ale nie było renderowane — tabelkę dostało od razu wszystkie 166 kart.
- Weryfikacja danych Piotra przed importem (Brickset przez curl):
  RRP **77/77 zgodne** z naszym rejestrem. Poprawki za zgodą Marka: elementy
  40923 260→259 i 77259 216→215, premiera 10462 1 stycznia→1 czerwca,
  dystrybucja 80120/80121 regularna→ekskluzywna (FAQ o zakupie w RRP
  podmienione na ekskluzywny wariant Piotra) + ~40 mechanicznych domknięć
  szablonu mail-merge (pola w złym przypadku: „kierunkiem są innych modeli").
- `src/data/sety.json`: rozstrzygnięcia Bricksetu po NASZEJ stronie —
  +ekskluzyw 40858/40860/40872/40924/40925, −ekskluzyw 40923, premiery
  40860/40925 2026-08→2026-06, opis 76473 „ponad 2100"→„2164 elementów"
  (kolidował z metryką karty).

**Stan:** gotowe, build 4959 stron zielony, HTML zweryfikowany (metryka
między opisem a FAQ, FAQPage w schema, linki działają).

**Dla drugiej strony:** nic.

**Uwagi:**
- Nazwy 6 setów u Piotra różnią się od kanonicznych (m.in. 40864 „Mistrz
  pomyślności" vs „Mistrz Szczęścia", 77252, 10468, 10479, 77262) — w kartach
  stoi nazwa kanoniczna, tekst akapitów Piotra bez zmian.
- 40881: nasza kanoniczna nazwa „Lama Zaopatrzeniowa i Palucha Rybnego —
  figurki" wygląda na niegramatyczną (Piotr ma „…i Paluch Rybny”) — do
  sprawdzenia na LEGO.com PL przy najbliższym zaciągu.
- Karty City/Technic/SW z pierwszej partii mają te same zgrzyty szablonu
  („kierunkiem są większych samochodów…") — do decyzji, czy przejechać tą
  samą korektą.
- Premiera 77264 nierozstrzygnięta (Piotr: 1 sierpnia, my: 2026-06, Brickset
  nie podaje) — w metryce data Piotra nie weszła, zostało nasze źródło.

## 02.09.2026 — 75457 Executor (punkt 2 z radaru 02.09)

Opublikowane: `/artykuly/lego-75457-executor-przed-premiera/`, dział Premiery.
Karta researchu: `redakcja/karty/75457-executor.md`.

**Oś tekstu jest odwrotna niż zwykle.** Executor to ekskluzyw LEGO.com i sklepów
stacjonarnych LEGO — nie ma drugiej ceny, rabatu ani progu zakupu. Nasza
standardowa rada („sprawdź, gdzie taniej", „poczekaj do listopada") nie ma tu
zastosowania i tekst mówi to wprost, zamiast udawać porównanie. Jedyna zmienna
pod kontrolą kupującego to zdążyć przed wyczerpaniem gratisu 40897 — stąd
praktyczna konsekwencja: **konto Insiders trzeba mieć założone przed 1.10**,
nie w dniu premiery.

**Wartość, której nikt inny nie poda:** 21065 Sagrada Família ma dokładnie tę
samą cenę katalogową 3199,99 zł przy 12 060 elementach (0,27 zł/el.) wobec
6130 u Executora (0,52 zł/el.). Widać to tylko z jednego katalogu z obiema
pozycjami.

**Dane poprawione przy okazji:**
- `sety.json` 75457: `cena_katalogowa` było `null`, a `dla_afol` szacowało
  ~3170 zł z przelicznika euro — wpisana potwierdzona kwota 3199,99 zł.
- `kalendarz-promocji-lego.md`: sekcja październikowa twierdziła, że polskiej
  ceny nie ogłoszono. Poprawione, dołożone okno gratisu i kanał sprzedaży.

**Nierozstrzygnięte i tak zapisane w tekście:** okno GWP — źródła
anglojęzyczne podają 1–10.10, polskie 1–7.10. Nie rozstrzygamy (LEGO różnicuje
okna między rynkami); w tekście krótsza wersja plus zdanie, że decyduje
wyczerpanie zapasów, nie kalendarz.

**Zdjęć 75457 nie mamy** — zestaw jeszcze nie istnieje w feedach. Zamiast
pustego znacznika galerii poszły dwie pozycje faktycznie w tekście
porównywane: 10221 (poprzednik) i 21065 (alternatywa), z podpisem
wyjaśniającym, czyje to zdjęcie.

Tekst wyszedł 18 dni przed planowanym oknem 20–30.09, bo cena potwierdziła się
wcześniej, a czekanie nie dawało nic poza ryzykiem.

**Zostaje z planu:** Wycofania grudnia 2026 (okno 1–20.10) i Black Friday —
rabat kontra pseudopromocja (okno 10–24.11).

---

## 04.09.2026 — punkty 1–3 z radaru: fala października i haczyk Black Friday

**Punkt 1 i 3 (dane).** Zweryfikowałem u źródeł październikową falę premier. Wpisane
tylko to, co potwierdzone niezależnie w co najmniej dwóch miejscach:

| Zestaw | Było | Jest |
|---|---|---|
| 72306 PlayStation | `cena_katalogowa: null` | **689,99 zł** (0,36 zł/el.) |
| 21371 Wallace i Gromit | `null` | **419,99 zł** (0,40 zł/el.) |
| 40874 Świąteczne odliczanie | `null` | **249,99 zł** (0,29 zł/el.) |
| 11387 Zimowa wioska | `elementy: null` | **1354** |

Miła kontrola własnej metody: nasze wcześniejsze szacunki z przelicznika euro
(≈680, ≈420, ≈250 zł) trafiły co do kilku złotych w kwoty, które LEGO faktycznie
ogłosiło. Przelicznik euro jako *szacunek oznaczony jako szacunek* działa.

**Czego NIE wpisałem i dlaczego** — zapisane w `katalog.json` →
`_meta.rozbieznosci_fala_pazdziernik_2026`:
- **40865 Elf Buddy** — liczba elementów sporna: 713 (faniklockow) kontra 719
  (zklockow). Żadnej nie przyjmuję.
- **11379 Księgarnia Book Nook** — cena sprzeczna: „ok. 520 zł" kontra 559,96 zł.
  Ta druga nie kończy się na „,99", więc to niemal na pewno wyliczenie
  porównywarki, a nie cena katalogowa.
- **40875, 40862, 40866, 11388, 11390, 21373** — po jednym źródle, w dodatku
  samo oznaczonym jako plotka. Zostają puste.
- 72306 nie ma wpisu w `katalog.json` (nowa seria „PlayStation") — hub działa
  z `sety.json`. Dodanie serii do katalogu należy do Zwiadowcy, nie do Radaru.

**Punkt 2 (Black Friday).** 21375 Godzilla ma premierę **27 listopada, czyli w sam
Black Friday**, z własnym gratisem — potwierdzone w dwóch źródłach, cena wciąż
nieznana. To zmienia planowany tekst z ogólnego wywodu w konkret: zestaw
debiutujący w dniu BF z definicji nie jest przeceniony, a stoi obok przecen
i korzysta z ich rozpędu.

- okno tekstu przesunięte z `11-10..11-24` na **`11-05..11-20`**, żeby wyszedł
  przed premierą, nie po niej; w planie dopisany hak i przypomnienie, żeby przed
  publikacją sprawdzić cenę katalogową (bez niej nie policzymy rabatu ani jego braku);
- do kotwic sezonu doszła data 27.11 z premierą Godzilli;
- w `kalendarz-promocji-lego.md` — akapit w sekcji listopadowej („Nowość w Black
  Friday nie jest okazją"), nowa sekcja „Październik to nie tylko Executor"
  z tabelą trzech potwierdzonych cen, oraz dwa wiersze w ściądze.

Sekcja październikowa mówiła dotąd wyłącznie o Executorze, choć tego samego dnia
wchodzi cała reszta fali — to była realna dziura na stronie, która już rankuje.

Build czysty, `kontrola-rrp.mjs` → ROZBIEŻNYCH: 0, wszystkie nowe linki żyją.
`/nowosci/pazdziernik-2026/` podchwyciło ceny samo.

## 2026-09-05 · CODE (Radar) · Dla Łowcy: 16 „okazji" konkurencji — co z nich wynika

Konkurencja (faniklockow) wypuściła 4.09 **szesnaście mikropostów dealowych w jednej
dobie**, większość między 12:22 a 15:08. Poprzednie dni: dwa. Przepuściłem tę listę
przez nasz `oferty_feed.json` (stan 05.09) i zamiast jednej hipotezy wyszły trzy
konkrety. **Nie ruszałem danych Łowcy — to jest zgłoszenie, nie zmiana.**

Zestawy: 10316, 76300, 11389, 11375, 42240, 21355, 77256, 77260, 76475, 60423,
60478, 60488, 71848, 42224, 42226, 42229, 43023.

### 1. To nie jest jeden sklep — i to dobra wiadomość

Rozkład najtańszych ofert: **Allegro 11, Smyk 4, Empik 1, Media Expert 1**. Czyli nie
jedna wyprzedaż u jednego sprzedawcy, tylko szeroki ruch przedsezonowy. Nasze tabele
złapały go same — 15 z 17 zestawów ma świeże oferty, rabaty 23–39% względem katalogu.
Pod tym względem nie mamy nic do nadrabiania.

**Warte uwagi: Smyk jest najtańszy przy czterech pozycjach** (11375 Ferrari −30%,
42240 Aston Martin −26%, 42224 Porsche −23%, 42226 BMW −28%) — same duże Technic
i Icons, czyli wysokie koszyki. Smyk mamy w rejestrze jako **aktywny (Adtraction,
2,10% CPS, cookie 45 dni)**. To sugestia, żeby przy doborze sklepów publikacyjnych
dla Technica nie pomijać Smyku odruchowo na rzecz Allegro.

### 2. Jedna z ich „okazji" okazją nie jest

**11389 Projekt Hail Mary** — u nich „Okazja Cenowa". Nasze dane: cena katalogowa
**469,99 zł**, najtańsza oferta **479,99 zł** (Allegro), Empik 543 zł. Czyli
„okazja" jest **droższa od ceny katalogowej LEGO o dwa procent**.

To jest dokładnie ten mechanizm, o którym ma być listopadowy tekst o Black Friday,
tyle że złapany na żywo we wrześniu. Zapisuję to jako materiał do tamtego artykułu.

### 3. Dwa pytania do sprawdzenia po stronie Łowcy

**a) Empik nigdy nie wygrywa pola `cena`.** W całym feedzie `sklep == "empik"`
występuje **zero razy**, a w **386 zestawach Empik ma najniższą ofertę, która nie
trafiła do pola `cena`**. Przykłady: 3677 (empik 2899 vs allegro 3141), 3818
(1899 vs 2299), 3831 (1599 vs 2177).

Nie przesądzam, czy to błąd. `_meta.zasady` opisuje regułę wyboru `cena` przez
pryzmat PK i ME, a Empik dokumentuje osobno jako klucz w `oferty` — więc możliwe,
że wyłączenie jest **celowe** (marketplace, zrzut tygodniowy, wątpliwa dostępność).
Za celowością przemawiają pozycje w rodzaju 1246 (empik 60,50 vs allegro 179,99),
gdzie cena wygląda na ofertę używanego albo niekompletnego zestawu.

**Jeśli celowe — warto to dopisać wprost do `_meta.zasady`**, bo dziś czyta się to
jak przeoczenie. **Jeśli nie — to 386 zestawów, przy których pokazujemy cenę wyższą
niż dostępna**, a to uderza w jedyną rzecz, którą sprzedajemy.

**b) 2644 zestawy mają cenę rynkową, ale nie mają ceny katalogowej** — więc przy
żadnym z nich nie policzymy rabatu. Z dzisiejszej listy dotyczy to **76300 Arkham
Asylum**: konkurencja ogłasza okazję, a my nie umiemy powiedzieć, czy nią jest.
To nie zadanie na dziś, ale przy 2644 pozycjach to systemowa dziura w funkcji,
która jest sednem serwisu.

### Czego NIE trzeba robić

Odświeżania feedu — dane są z 05.09 i złapały ruch. Zrzut Empiku jest z 31.08
(tygodniowy, przez Cowork), więc w normie.

## 2026-09-08 · CODE (Radar) · Dla Zwiadowcy: trzy Pokémony z ofertami i bez strony

Konkurencja ogłosiła 07.09 okazje na **72151 Eevee** i **72152 Pikachu i Pokéball**.
Sprawdziłem u nas: **żadnego z nich nie ma ani w `katalog.json`, ani w `sety.json`** —
a nasz własny `oferty_feed.json` ma dla nich żywe oferty. To samo dotyczy **72153**.

| Numer | U nas | Oferta w naszym feedzie |
|---|---|---|
| 72150 Munchlax | katalog + sety | 217,99 |
| **72151 Eevee** | **BRAK** | **186,27** |
| **72152 Pikachu i Pokéball** | **BRAK** | **589,99** |
| **72153** | **BRAK** | **2648,01** |
| 72154 Pokéball z Trenerami | katalog + sety | 1129,99 |
| 72155, 72156, 72160, 72168 | katalog + sety | mamy |

**Dlaczego to nie jest zwykły brak.** To trzy numery **wewnątrz serii, którą już
prowadzimy** — nie EOL wyłowiony z Allegro, tylko dziura w kompletowaniu bieżącego
Pokémona. Bez wpisu w katalogu nie powstaje `/zestaw/<nr>/`, więc nie ma strony, nie
ma tabeli cen i nie ma linku afiliacyjnego — przy 589,99 i 2648 zł to realny koszyk.
Zwiadowca raportował dziś „brak nowych zestawów", więc jego źródło ich nie widzi,
choć nasz feed sklepowy tak.

**Szersza obserwacja, świadomie bez alarmu.** Zestawów z żywą ofertą, których nie ma
ani w katalogu, ani w `sety.json`, jest **1986** — ale ta liczba jest myląca: na
czele są kolekcjonerskie wystawki EOL z Allegro (10196 Grand Carousel za 8999 zł,
4195 Queen Anne's Revenge, 21021 Marina Bay Sands). Tych nie chcemy i nie powinniśmy
mieć. **Nie umiem oddzielić jednych od drugich moimi danymi** — do tego potrzebne
jest źródło Zwiadowcy z rocznikiem. Wąskie sito (numer dzielący trzycyfrowy prefiks
z rocznikiem 2025/26) daje 312 kandydatów, w tym oprócz Pokémonów także **76482,
76483, 75478, 77092** i **76300 Arkham Asylum** — ten ostatni zgłaszałem już 05.09
jako zestaw bez ceny katalogowej.

**Do decyzji Zwiadowcy:** czy warto dołożyć do jego przebiegu krok „sprawdź, czego
z feedu sklepowego nie ma w katalogu, i przepuść przez Brickset po roczniku".
Trzy Pokémony sugerują, że tak, ale skala 1986 pozycji mówi, że filtr musi być
ostry, bo inaczej wciągniemy pół rynku wtórnego.

**Nie ruszałem katalogu** — dodawanie zestawów to jego rola, nie moja.

## 2026-09-10 · CODE (Radar) · Dla Zwiadowcy: dwa Batmany w trwającej promocji, bez strony

Audyt ośmiu cen katalogowych, które konkurencja podała przy Batman Day (9–19.09).
**Pięć zgodnych co do grosza** — nasze dane trzymają poziom. Ale:

| Numer | Cena katalogowa | U nas |
|---|---|---|
| **76303** Tumbler kontra Dwie Twarze i Joker | 249,99 | **BRAK w katalogu** |
| **76304** Batmobil Batman Forever | 419,99 | **BRAK w katalogu** |
| 40859 Figurki Supermana i Batmana | 104,99 | jest w `sety.json`, nie ma w katalogu |
| 30726 (gratis Batman Day) | polybag | **BRAK** |

**Dlaczego to pilne, a nie tylko porządkowe.** Oba brakujące zestawy są w promocji,
która trwa **do 19 września**, i oba mają w naszym feedzie oferty w czterech
sklepach naraz — 76303 najtaniej 179,99 zł (28% poniżej katalogu), 76304 najtaniej
249,99 zł (**40% poniżej katalogu**). To najgłębsze rabaty, jakie widziałem w tych
przebiegach, na zestawach, których nie umiemy pokazać, bo nie mają huba.

To ten sam wzorzec, co Pokémony zgłoszone 08.09 (72151, 72152, 72153): **numery
brakujące wewnątrz serii, którą już prowadzimy**. Nasz katalog ma pięć Batmanów
(76330, 76331, 76332, 76333, 76355), a konkurencja wymienia osiem w samej promocji.

**Osobno, do rozważenia przez redakcję, nie przeze mnie:** nie mamy prezentownika
Batmana, choć mamy trzynaście innych serii. Batman jest teraz w oknie promocyjnym
i wchodzi w sezon prezentowy. Nie zakładam tego tematu sam, bo dobór pozycji wymaga
kompletnego katalogu — czyli najpierw punkt wyżej.

**Nie ruszałem katalogu.**

### Przy okazji: build lokalny padał, produkcja jest zdrowa

`npm run build` wywalał się na `Rollup failed to resolve import "@astrojs/rss"`.
Pakiet **jest** w `package.json` (^4.0.19), brakowało go tylko w `node_modules`
mojego kontenera po commicie 2364a28. Sprawdziłem produkcję, zanim cokolwiek
zgłosiłem: `https://tylkoklocki.pl/rss.xml` zwraca **200 application/xml**, więc
deploy działa. `npm install` u mnie i po sprawie — ale zapisuję, bo następna sesja
z nieodświeżonym kontenerem zobaczy to samo i może niepotrzebnie wpaść w panikę.

## 2026-09-10 (2) · CODE (Radar) · Batman: katalog uzupełniony, prezentownik opublikowany

Na polecenie Marka, w reakcji na dzisiejszy radar.

**Katalog: 7832 → 7837.** Seria Batman z 5 na 10 pozycji. Dodane 76300 Arkham
Asylum (2953 el., 1299,99), 76301 Batman i Batmobil kontra Mr. Freeze (63 el.,
89,99), 76303 Tumbler kontra Dwie Twarze i Joker (429 el., 249,99), 76304
Batmobil Batman Forever (909 el., 419,99), 76328 Batmobil z serialu z lat 60.
(1822 el., 649,99). Każda pozycja ma `cena_zrodlo`; 76303 i 76304 mają dwa
niezależne potwierdzenia (lista promocyjna Batman Day + porównywarki).

Wszystkie pięć dostało hub `/zestaw/<nr>/` z tabelą cen — czyli to, czego
brakowało 76303 i 76304 w trakcie ich własnej promocji.

**Świadomie NIE dodane**, z uzasadnieniem w `katalog.json/_meta`:
- **76302 Mech Supermana kontra Lex Luthor** — to Superman, nie Batman. Katalog
  nie ma serii DC ani Superman, a wrzucenie tego pod „Batman" byłoby błędnym
  oznaczeniem. **Decyzja o założeniu serii należy do Zwiadowcy.**
- 40859 — jest w `sety.json` jako BrickHeadz z dystrybucją ekskluzywną.
- 30726 — polybag-gratis, brak ceny detalicznej.

**Prezentownik:** `/prezentowniki/lego-batman/`, osiem zestawów, karta researchu
w `redakcja/karty/prezentownik-batman.md`.

Oś: Batman to **dwie rozłączne półki** — zabawa (9+, 90–250 zł) i ekspozycja
(18+, od 650 zł) — a **cena nie mówi, która jest która**. Tumbler za 250 zł jest
zabawką, Batmobil z serialu za 650 zł nie jest. Przy każdej pozycji najpierw
„dla kogo", potem kwota.

**Odstępstwo od wzorca, świadome:** drabina zaczyna się od 90 zł zamiast od 25 zł,
bo Batman nie ma tańszego zestawu detalicznego. Jedyna tańsza pozycja to polybag
30726, który jest gratisem z Batman Day, a nie towarem. Standard pozwala przesunąć
próg zamiast wstawiać zapchajdziurę — i mówimy o tym wprost w tekście oraz w FAQ.

### Dla Łowcy: dwie anomalie w feedzie

Wyszły przy ustalaniu poziomów cenowych, obie zapisane w `katalog.json/_meta`:

- **76328** — Empik pokazuje **45,00 zł** za zestaw 1822-elementowy o cenie
  katalogowej 649,99. Niemal na pewno zły rekord.
- **76355** — Planeta Klocków pokazuje **2589,99 zł** przy cenie katalogowej
  899,99, i jest to jedyna oferta tego zestawu w feedzie. Premiera wrzesień 2026.

Obie kwoty pominąłem przy ustalaniu progów zakupu.

### Czego nie zrobiłem

Zestawy weszły **tylko do katalogu**, bez wpisów w `sety.json` — czyli bez opisu
redakcyjnego, `dla_rodzica` i `dla_afol`. Huby działają (nazwa, parametry, tabela
cen), ale są chudsze niż te z pełnym opisem. To robota dla sesji redakcyjnej,
nie dla radaru.

## 2026-09-10 (3) · CODE (Radar) · Seria DC + wykaz zestawów bez opisu

### Dlaczego nie było serii DC

**Bo nigdy jej nie zaimportowaliśmy — to nie był błąd nazewnictwa, tylko dziura
w imporcie.** Oficjalny motyw LEGO nazywa się „DC Super Heroes" i obejmuje
także wszystkie Batmany: porównywarki trzymają 76328, 76330–76333 i 76355 pod
tym samym adresem co Supermana. Nasz katalog powstał z kart Piotra i importu,
które używały etykiety „Batman" — ta część weszła, reszta DC nie weszła wcale.
Piotr ma 1087 kart i **ani jednej z serią „DC"**; ma pięć z serią „Batman".

**Co zrobione:** założona seria `DC`, wyłącznie na zestawy spoza wątku Batmana.
Pierwsza pozycja: 76302 Mech Supermana kontra Lex Luthor (120 el., 64,99 zł).

**Czego świadomie nie zrobiłem:** nie przeniosłem Batmanów do DC. Batman ma już
stronę serii i świeży prezentownik, a rozbicie Batmanów między dwie serie byłoby
gorsze niż obecny stan. `DC` jest dziś zalążkiem z jedną pozycją — sensowne
wypełnienie wymaga importu całego bloku z rocznikami, czyli roboty Zwiadowcy.

Przy okazji domknięty Batman: dodane 76264 (54 el., 119,99) i 76265 (357 el.,
169,99). Seria ma 12 pozycji. **Wciąż brakuje szesnastu numerów** — lista
w `katalog.json` → `_meta.seria_dc_2026_09_10.batmany_wciaz_brakujace_do_sprawdzenia`.

### Pułapka źródłowa, która o mało nie weszła do danych

Szerokie zapytanie do wyszukiwarki podało 76303 jako **279,99 zł**, a 76331
i 76332 jako **294,99 zł** — czyli sprzecznie z tym, co opublikowałem godzinę
wcześniej. Weryfikacja **każdego numeru z osobna** potwierdziła nasze dane:
76303 = 249,99, 76332 = 124,99 przy 330 elementach.

**Reguła na przyszłość, zapisana też w `_meta`: przy cenach ufamy zapytaniom
o pojedynczy numer, nie zbiorczym podsumowaniom listingów.** Zbiorcze wyniki
mieszają ceny rynkowe z katalogowymi i różne zestawy między sobą.

### Wykaz zestawów bez opisu redakcyjnego

`scripts/bez-opisu-od-najnowszych.py` → `materialy/zestawy-bez-opisu.xlsx`.
Definicja „bez opisu" ta sama co status `do opisania` w kolejce redakcyjnej:
ani karty Piotra, ani naszego opisu, ani pary person.

**Arkusz 1 — populacja kolejki (2020–2026, dostępny, z ceną): 15 pozycji.**
Zaległość jest tam praktycznie zamknięta: na 1135 zestawów 1046 ma kartę Piotra,
a 1120 ma persony. Z tych 15 aż **7 to Batmany i DC, które sam dziś dodałem** —
czyli lista sama się domknie, gdy redakcja dopisze im teksty.

**Arkusz 2 — gdzie jest prawdziwa dziura: 3716 pozycji.** Każdy zestaw
z katalogu, który ma **dziś ofertę w sklepie** i nie ma żadnego tekstu, bez
ograniczenia rocznika i statusu. Rozkład: 2021 — 344, 2022 — 324, 2018 — 321,
2020 — 314, 2023 — 306, 2019 — 300. To są zestawy, które ktoś może kupić,
a my nie mamy o nich zdania.

Oba arkusze sortowane od najnowszych, z metodologią w osobnej zakładce.

## 2026-09-11 · CODE (Radar) · Dla Zwiadowcy: polskie serwisy bywają szybsze przy cenach PL

Dziś rano dodałeś 21373 Downton Abbey z adnotacją „ceny nie ma na żadnym rynku".
Tego samego dnia faniklockow opublikowali **1299,99 zł** — razem z 13 nazwanymi
minifigurkami i wymiarami 30×44×14 cm.

**To nie jest błąd po Twojej stronie.** Brickset i StoneWars faktycznie tej ceny
nie mają, a promoklocki i zklockow **nie mają jeszcze 21373 w indeksie** —
sprawdziłem punktowo, więc ceny nie wpisałem: zostaje jedno źródło, a przy
cenach trzymamy próg dwóch.

Sygnał jest inny: **przy cenach katalogowych w złotych polskie serwisy branżowe
bywają szybsze niż źródła anglojęzyczne.** Liczba elementów zgadza się u nich
co do sztuki (4711), a lista trzynastu postaci jest zbyt konkretna, żeby ją
zmyślić. Propozycja: przy zestawach **przed premierą** zaglądać także do
faniklockow i fanklockow, nie tylko do Bricksetu i StoneWars.

**Do wpisania, gdy porównywarki zaindeksują 21373:** 1299,99 zł.

Przy okazji dwie drobnice:
- 21373 jest w `sety.json`, ale nie ma go w `katalog.json`.
- Liczba elementów Godzilli: my mamy 5364, konkurencja podaje 5360.
- **Cena 21375 Godzilli nadal nieznana** („ok. 1700 zł" to ich szacunek).
  To wciąż pozycja numer jeden przed tekstem o Black Friday — okno 5–20.11.

## 2026-09-12 · CODE (Radar) · Dla runnera Wycofań: kontrola naszej listy o cudzą

Konkurencja opublikowała 11.09 pełną listę EOL-i na koniec 2026 — 38 tys. znaków
z datowanym dziennikiem zmian. Przepuściłem ją przez nasze `wycofania.json`.

**Wynik jest dla nas dobry.** Ich lista: 418 numerów. Nasza: 271.
**Pokrywa się 262** — czyli praktycznie cała ich lista potwierdzonych jest u nas.
W drugą stronę mamy 9 pozycji, których oni nie mają.

**Do nadrobienia: 108 zestawów**, które oni wymieniają, są w naszym `katalog.json`
i nie ma ich na naszej liście wycofań. Przykłady: 11025, 11040, 11043, 11044,
blok 21266–21282, 31145, 40708, 40743, 40807, 40808, 40812.

Zastrzeżenie metodologiczne: numery wyciągnąłem regexem z ich tekstu, więc na
liście mogą być pojedyncze fałszywe trafienia. Trzeba je przejrzeć, a nie
wciągać hurtem. Ich lista miesza też potwierdzenia z przewidywaniami — sami
piszą, że część to prognozy społeczności i rynku.

### Osobno: 51 pozycji, które same sobie przeczą

Niezależnie od tamtego porównania: **51 zestawów ma u nas `kiedy: "wycofany"`
i `status: "potwierdzone"` na liście wycofań, a w `katalog.json` status
`dostepny`.** Według definicji z `katalog.json/_meta.statusy_uwaga` — *„Status
'eol' oznacza koniec produkcji; oznaczaj 'dostepny', chyba że LEGO faktycznie
zakończyło sprzedaż"* — te rekordy powinny być `eol`.

Przykłady: 21344 Orient Express, 10331 Zimorodek, 10359 Fontanna, 10362
Francuska kawiarenka, 75356 Executor, 75347 Bombowiec TIE, 75401 Interceptor
Ahsoki.

**Nie przestawiałem tego sam** — 51 rekordów w cudzej domenie, a zmiana statusu
na `eol` ma skutki uboczne: wypada z kolejki redakcyjnej (filtruje po
`dostepny`) i zmienia reguły generowania hubów. Do decyzji runnera Wycofań.

### Co z tego wziąłem do treści

75356 Executor w skali midi zniknął z LEGO.com na początku września — dokładnie
wtedy, gdy do sprzedaży wchodzi nowy UCS 75457. Dopisałem do artykułu
o Executorze akapit: kto chciał kształt okrętu na biurku za ułamek ceny UCS-a,
ma zamykające się okno u innych sprzedawców. **To jedyna rzecz przy Executorze,
przy której pośpiech ma sens** — i nikt inny tego zestawienia nie zrobi, bo
wymaga trzymania obu zestawów w jednej bazie.

## 2026-09-13 20:30 · CODE · Porządki: statusy wycofań i nowości, EOL na listingu, nowa karta, podobne zestawy, tabela cen mobile, Allegro ≤30%

Dwie sesje Code pracowały równolegle nad tym samym zadaniem Marka w jednym
drzewie (agd-67 i ta); po wykryciu kolizji agd-67 zatrzymała się, ta sesja
scaliła i dokończyła. Gałąź `porzadki-statusy`, **niewypchnięta** – wdrożenie:
`git push origin porzadki-statusy:main`. Lokalnie nie ma `node`/`npm`, więc
build Astro zrobi dopiero Cloudflare; wszystkie `.js/.mjs` i frontmattery
`.astro` przeszły `node --check` (Node z pakietu Photoshopa), a nowe tabele
obejrzane w przeglądarce na makiecie z produkcyjnym CSS (375 px: mieści się).

**Zrobione:**
- `src/lib/status.js` (nowy) – jedno źródło statusów: `eolWLego`,
  `statusWycofania`, `statusListingu`, etykiety „potwierdzone przez LEGO" /
  „prognoza rynku" / „wycofany (EOL)"; obsługa `kiedy: "odwołane"`.
- `/wycofania/`: dwie osobne listy (potwierdzone przez LEGO ↔ prognozy rynku),
  nowe FAQ i wstęp. `TabelaSetow`: kolumna statusu z terminem i znacznikiem
  **EOL** pod „w sprzedaży", gdy LEGO skończyło, a sklep ma. Katalog serii
  i Top 10 wycofań na głównej używają tej samej logiki.
- `TabelaCen.astro` + `scripts/remark-ceny.mjs`: tylko sklepy z ceną (koniec
  wierszy „Sprawdź cenę" bez kwoty – przypadek Planeta Klocków/x-kom przy 21323),
  wiersz LEGO.com z ceną katalogową i EOL bez przycisku po wycofaniu; EOL
  liczy się także dla hubów z sety.json (wcześniej nigdy). Klasy `kc-*`,
  wrapper `.tabela-cen-wrap`, układ siatki ≤720 px bez ramki karty.
- Hub `/zestaw/`: plakietki EOL/wycofanie/przeciek, ramka „LEGO zakończyło
  produkcję", sekcja **Podobne zestawy z serii** (4–6 losowych kafelków,
  `podobneZSerii` w `seria-huby.js`, ziarno numer+dzień) + „Zobacz całą serię".
- Nowa karta dla `/zestaw/`: `target="_blank"` w szablonach i pluginach remark
  plus delegacja kliknięcia w `Base.astro` (markdown, wyszukiwarki `window.open`).
- Nowości: pole `status_nowosci` w `sety.json` (`przeciek`/`potwierdzone`),
  badge „przeciek z rynku" vs „wkrótce · potwierdzone przez LEGO" na
  `/nowosci/`, podstronach miesięcy i hubie; legenda.
- Deale: `src/lib/deale.js` – Allegro maks. 30% linków (karuzela 1 z 5,
  półka `/deale/` 3 z 12), alternatywna oferta spoza Allegro albo pozycja odpada.
- Dane: audyt 593 numerów na lego.com (`materialy/audyt-wycofan-2026-09-13.md`):
  katalog 224× `dostepny→eol` (w tym 76264), 71× `eol→dostepny`, 49× `eol`
  z `--napraw`; wycofania 2× `odwołane` (10307, 40647); przecieki 11387, 21375, 77094.
  Nowe `_meta.regula_statusow` w `wycofania.json`, `scripts/audyt-wycofan.mjs`.
- Dokumentacja: `RUNBOOK.md` (sekcja „Statusy: wycofania, nowości, EOL",
  „Jak sprawdzić status na lego.com", typowanie deali), `redakcja/README.md`.

**Stan:** gotowe do wdrożenia, czeka na push i build na Cloudflare.

**Dla drugiej strony:** runner Wycofań – dopisywać `zrodlo`, przejrzeć 49
wpisów „wycofany" ze statusem „Wyprzedane" na lego.com i 49 kandydatów
z raportu; Scout – ustawiać `status_nowosci` przy każdej zapowiedzi,
zweryfikować 21375 Godzilla (przeciek czy oficjalna zapowiedź LEGO Ideas).

**Uwagi:** wpis 10307 Wieża Eiffla był na liście jako „wycofany", a lego.com
mówi „Dostępne teraz" – dlatego `--napraw` w skrypcie audytu nie może być
ślepy (reguła 5 w RUNBOOK). „Wyprzedane" (K_SOLD_OUT) nie jest ani
dostępnością, ani EOL – nie przestawiamy po nim katalogu automatycznie.

## 2026-09-14 · CODE (Radar) · Zero publikacji u konkurencji; skutek uboczny poprawki wycofań

**Pierwszy dzień bez ani jednej nowej publikacji** na fanklockow i faniklockow.
Bazy konkurencji nie commitowałem — zgodnie z instrukcją przebiegu.

### Moje zgłoszenie z 12.09 zostało wdrożone i wdrożone dobrze

**51 zestawów ze sprzecznym statusem → 0.** Runner Wycofań przestawił statusy
w katalogu na `eol`, zgodnie z definicją, i przy okazji zapisał w
`wycofania.json/_meta.regula_statusow` porządną regułę rozróżniania
„potwierdzone" (sygnał od LEGO) od „przewidywane" (zgodne prognozy co najmniej
**dwóch** źródeł branżowych). Huby wycofanych zestawów zostały — generują się
z listy wycofań niezależnie od statusu.

**108 zestawów z listy konkurencji: wciąż żadnego nie dodano — i to jest
poprawne zachowanie, nie przeoczenie.** Ich nowa reguła wymaga przy prognozie
dwóch zgodnych źródeł, a lista faniklockow to jedno. Zamykam ten wątek po swojej
stronie: nie jest zaległością, tylko oczekiwaniem na drugie źródło.

### Skutek uboczny, przed którym ostrzegałem — zmierzony

Populacja kolejki redakcyjnej spadła z **1135 na 922**. Wypadło z niej
**67 zestawów** z rocznika 2020–2026, bo zmieniły status na `eol`.

Z tych 67: **65 ma dziś ofertę w sklepie**, a **14 nie ma u nas żadnego tekstu**.
I najciekawsze — większość chodzi **powyżej ceny katalogowej**:

| Zestaw | Katalogowa | Dziś |
|---|---|---|
| 76417 Bank Gringotta | 1849,99 | **3179,00** |
| 10305 Zamek rycerzy herbu Lew | 1749,99 | **2399,99** |
| 21323 Fortepian | 1699,99 | **1778,00** |
| 21335 Latarnia morska | 1299,99 | **1489,00** |
| 76430 Sowiarnia w Hogwarcie | 199,99 | **246,44** |

**To są zestawy, przy których nasza funkcja jest najbardziej potrzebna.** Ktoś
widzi Gringotta za 3179 zł i nie ma pojęcia, że katalogowo kosztował 1849,99 —
a my przy czternastu z nich nie mamy ani zdania. Wypadnięcie z kolejki jest
logiczne (zestaw nie jest już w sprzedaży u LEGO), ale akurat te pozycje
zasługują na tekst bardziej niż niejedna bieżąca nowość.

**Propozycja dla redakcji, nie decyzja:** kolejka redakcyjna filtruje po statusie
`dostepny`. Warto rozważyć drugi, mniejszy strumień — „wycofane, ale wciąż
kupowane i bez opisu". Czternaście pozycji to robota na kilka dni, a dotyka
zestawów z najwyższymi koszykami w całym serwisie.

To uzupełnia arkusz `materialy/zestawy-bez-opisu.xlsx` z 10.09: jego arkusz 2
pokazywał 3716 takich pozycji w całym katalogu, ale bez wyróżnienia tych
świeżo wycofanych i drożejących.
