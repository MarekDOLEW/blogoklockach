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

## 2026-08-30 13:00 · CODE · Naprawa 127 cen katalogowych + zgodność raportu odsiewu ze stroną

**Zrobione:**
- `src/data/katalog.json` — `node scripts/kontrola-rrp.mjs --napraw` poprawił
  **127 cen katalogowych** rozjechanych z `rrp_potwierdzone.json`. Źródłem
  rozbieżności jest backfill z Bricksetu (GBP/USD/EUR) kontra zaciąg pełnego
  katalogu lego.com/pl-pl przez Firecrawl z 28.08 (814 potwierdzonych pozycji).
  Liczba setów bez zmian (7777 w 37 seriach), zmieniło się wyłącznie pole
  `cena_katalogowa` — zero innych pól. Kontrola po naprawie: **ROZBIEŻNYCH 0**.
- `scripts/kontrola-ofert.mjs` — łańcuch RRP nie zaczynał się od
  `rrp_potwierdzone.json`, więc raport liczył próg odsiewu od innej kwoty niż
  serwis (`katalogowaDoOdsiewu` w `src/lib/oferty.js`). Dotyczyło **244 setów**
  w feedzie. Na dzisiejszych danych zero różnic w decyzjach — uśpiona
  niespójność, nie żywy błąd, ale nagłówek skryptu obiecuje „te same reguły
  i progi, których używa serwis".
- `scripts/kontrola-rrp.mjs` — `--napraw` dopisywał `\n` na końcu
  `katalog.json`, którego tam nie ma (pułapka z RUNBOOK „Stabilność formatu
  plików JSON"). Teraz zapis zachowuje kształt zastanego pliku i raportuje,
  ile linii zmienia sama serializacja.

**Stan:** gotowe. Diff `katalog.json` to 171 linii: 127 poprawionych cen
+ 44 linie normalizacji zapisu (`1500.0` → `1500`, ślad po zapisie Pythona).
Build nie odpalony — w kontenerze nie ma `node_modules`, a zmiana dotyczy
wyłącznie wartości w danych.

**Dla drugiej strony:** nic. Jeśli Backfill (Python) będzie zapisywał
`katalog.json`, kwoty całkowite wrócą jako `1500.0` — to kosmetyka, nie błąd.

**Uwagi:** te 127 błędnych kwot **nie trafiało na stronę** —
`cenaKatalogowaSetu()` czyta `rrp_potwierdzone.json` jako pierwsze źródło.
Zgniły był sam `katalog.json`, czyli ostatnie ogniwo łańcucha i jedyne
źródło dla setów spoza rejestru.

Zostaje do rozstrzygnięcia ręcznego: **19 setów w teście rynkowym**
(cena z feedu < 50% RRP) — wg procedury z `materialy/zadania-cykliczne.md`.
Osobno: **Ceneo z 20.08** (10 dni) i **Empik ze zrzutu 29.08 bez odświeżania
cyklicznego** — najstarsze dane w tabelach cen.

## 2026-08-27 08:15 · CODE · Dwa teksty Piotra opublikowane: ranking Icons i porównanie zamków

**Zrobione:**
- `src/pages/artykuly/ranking-najlepsze-samochody-lego-icons.md` — kategoria
  **Rankingi**, jedenaście dużych samochodów Icons od 2008 do 2026.
- `src/pages/artykuly/porownanie-cztery-zamki-lego.md` — kategoria **Porównania**,
  31120 / 31168 / 10305 / 71814.

Kategorie Rankingi i Porównania miały dotąd zero tekstów — filtr na `/artykuly/`
odblokował oba przyciski.

**Import, nie redakcja.** Tekst Piotra wchodzi słowo w słowo. Kontrola: skrypt
porównujący akapity `.docx` z opublikowanym markdownem daje **jedną różnicę na
plik** — wiersz tytułu, który przeszedł do frontmattera i renderuje się jako H1.
Reszta identyczna.

Dodane wyłącznie mechanicznie:
- `<div class="ceny-setu">` przy czterech zestawach **w regularnej sprzedaży**:
  11381 i 10295 w rankingu, 31168 i 71814 w porównaniu;
- linki do hubów `/zestaw/<nr>/` na numerach zestawów w treści;
- slajdery zdjęć, frontmatter (w tym FAQ pod dane strukturalne), stopka
  „Zobacz też" z linkami do naszych tekstów.

**Decyzja: wycofane zestawy nie dostają tabeli cen.** Siedem z jedenastu
samochodów rankingu oraz 31120 i 10305 są EOL — ich pojedyncze oferty to
notowania rynku wtórnego, często powyżej RRP (10248 Ferrari F40: 2099 zł przy
katalogowych 399,99 zł). Tabela „Aktualne ceny" pod takim zestawem wprowadzałaby
w błąd. Zamiast niej link do karty zestawu, która sama oznacza status EOL.
Uzasadnia to zresztą sam tekst Piotra: „w ich przypadku dochodzi rynek wtórny
i nie ma sensu porównywać ich obecnych cen ofertowych jeden do jednego".

**Weryfikacja danych Piotra wobec katalogu:** liczby elementów zgadzają się
wszędzie (10248 = 1158, 10317 = 2336, 11376 = 1060, 31168 = 1371, 31120 = 1426,
10305 = 4514, 71814 = 3489). RRP 31168 = 519,99 i 71814 = 1079,99 — zgodne.

**Stan:** gotowe, wdrożone

**Dla drugiej strony:** nic

**Do sprawdzenia z Piotrem — jedna rozbieżność faktyczna:** tekst porównania
mówi o 71814, że „również można znaleźć go wyraźnie poniżej RRP". Dziś nie da
się: obie oferty w feedzie (Media Expert i Allegro) stoją na 1099,99 zł, czyli
**powyżej** katalogowych 1079,99 zł, a najtańszą pozycją w tabeli jest LEGO.com
w cenie katalogowej. Zdania nie ruszałem — to fakt do rozstrzygnięcia przez
autora, nie literówka. Progi (850 / 800 zł) zostają, bo to ocena, nie odczyt.
Tabela renderuje się bezpośrednio pod tym zdaniem, więc sprzeczność jest
widoczna dla czytelnika.

## 2026-08-27 07:35 · CODE · Persony czytelnika uratowane ze skilla klocki-redaktor

**Powód:** `klocki-redaktor` (wersja z 11.08) idzie do skasowania — jest trzecim,
nieaktualnym standardem, który w kilku miejscach mówi wprost odwrotnie niż to,
co wczoraj naprawialiśmy:

| klocki-redaktor | obowiązuje dziś |
|---|---|
| „każda cena z datą sprawdzenia" | Standard §18 — bez daty w treści |
| „ramka cen: tabela 3–5 sklepów z datą" | znacznik `ceny-setu`, tabela generowana |
| `[AFF:sklep:set]`, `[IMG:numer]` | `[wstaw link afiliacyjny]`, `galeria-setow` |
| „ocena okazji, skala 1–5 klocków" | §21 i §27 — bez arbitralnej skali punktowej |
| „kategoria z drzewa serwisu" | siedem stałych kategorii |

To dokładnie ten skill, który podpowiadałby wklejanie zamrożonych tabel z datą.

**Uratowane:** opis dwóch person czytelnika (RODZIC 60% ruchu, AFOL 40%) —
motywacje, lęki, język, czego każde z nich potrzebuje w tekście. Nowe skille
mówiły o „dwóch tonacjach", ale nigdzie ich nie opisywały.
→ `redakcja/persony-czytelnikow.md`, wchodzi do **obu** paczek skilli.

Dopisałem trzy rzeczy, których w oryginale nie było, a wynikają z naszych
ustaleń: wskazujemy jedną personę główną (nie obie naraz), persona zmienia
kolejność faktów a nie ocenę zestawu, i zakaz stereotypów płciowych obowiązuje
niezależnie od persony.

**Stan:** gotowe; `klocki-redaktor` można kasować bez straty

**Dla drugiej strony (COWORK):** przy okazji wgrywania skilli — skasuj też
`klocki-redaktor` (`skill_01GoRinYCXheZf4C8ahA17Zk`). Wartościowa część jest
już w repo.

**Uwagi:** nie mam jak zweryfikować, czy wczorajsze wgranie skilli się udało —
kopia z konta w kontenerze pochodzi z 26.08 07:02, a synchronizacja idzie przy
starcie sesji. Sprawdzenie po stronie Coworku: zapytać go, jakie ma skille.

## 2026-08-27 07:05 · CODE · Skille redakcyjne — zadanie wgrania dla Coworku

**Dla drugiej strony (COWORK):** wgraj dwa skille na konto claude.ai.

    git pull origin main
    node scripts/spakuj-skille.mjs        # -> skille/*.skill

Potem w ustawieniach skilli na claude.ai:

1. **skasuj `klocki-standard-sprzedazowy`** (`skill_01Se74bhez3aMwXW7YVBJnZA`) —
   zastąpiony przez `lego-standard-sprzedazowy`, granica przesunięta z „do 5
   pozycji" na dział serwisu;
2. wgraj `skille/lego-standard-sprzedazowy.skill`;
3. wgraj `skille/lego-standard-redakcyjny.skill`, **nadpisując** istniejący
   (`skill_01EPaKf6XtHsyK7B6egHwWcy`) — nazwa się nie zmienia.

**Do rozważenia przy okazji:** `klocki-redaktor`
(`skill_01GoRinYCXheZf4C8ahA17Zk`) łapie „prezentownik, ranking, poradnik
zakupowy, post dealowy" i nie ma żadnej granicy wobec nowych standardów. Przy
„zrób prezentownik" konkuruje z `lego-standard-sprzedazowy`. Albo skasować, albo
zawęzić opis tak, żeby wprost odsyłał do `lego-standard-*` w sprawach standardu.

**Kolejność ma znaczenie:** Marek zmienia dziś z Piotrem dokumenty redakcyjne.
Jeśli zmiany wejdą do `redakcja/` po wgraniu, trzeba będzie wgrywać drugi raz.
Sensowniej: najpierw zmiany w repo, potem jeden eksport i jedno wgranie.

**Stan:** czeka na Cowork

**Uwagi:** Claude Code w tym repo ma oba skille od razu z `.claude/skills/` —
sprawdzone, wstają w sesji. Wgranie na konto jest potrzebne wyłącznie dla
Coworku. Skille edytujemy tylko przez `redakcja/` + `node scripts/eksport-skilli.mjs`.

## 2026-08-27 06:50 · CODE · Dwa skille standardów generowane z repo — koniec rozjazdu

**Rozjazd zlikwidowany u przyczyny.** Standard i metodologia istniały w dwóch
kopiach: repo 1.4/1.4 z naszymi §18.1 i §18.2, skill 1.5/1.7 od Piotra bez nich.
Zamiast scalać prozę:

- **dokumenty Piotra leżą w repo verbatim** — `standard-artykulow-biezacych.md`
  (1.5) i `metodologia-researchu-lego.md` (1.7), słowo w słowo jak je przysłał;
- **nasza warstwa poszła osobno** — `redakcja/ustalenia-projektowe.md`: podział
  pracy przy cenach i linkach, siedem kategorii i nazewnictwo, mapowanie
  standardu na infrastrukturę, ograniczenia wykonawcze (lego.com/zklockow 403,
  brak sieci w Chromium).

Dzięki temu następna wersja od Piotra to **podmiana jednego pliku**, a nie
scalanie akapitów. Zasada pierwszeństwa: warstwa projektowa wygrywa tylko
w sprawach infrastruktury; w redakcyjnych rozstrzygają dokumenty wspólnika.

**Dwa skille, granica po dziale serwisu — nie po długości tekstu:**

| Skill | Zakres | Autor tekstów |
|---|---|---|
| `lego-standard-redakcyjny` | całe `/artykuly/`, siedem kategorii | Piotr |
| `lego-standard-sprzedazowy` | `/prezentowniki/` + krótkie formy dealowe | Marek |

To zmiana wobec starego podziału, gdzie granicą było „powyżej 5 zestawów lub
900 słów". Prezentownik z ośmioma zestawami wpadał wtedy do redakcyjnego —
teraz liczba pozycji niczego nie rozstrzyga.

**`scripts/eksport-skilli.mjs`** buduje obie paczki z `redakcja/` do `skille/`
(98 KB i 56 KB). `--sprawdz` sam raportuje kategorie bez wzorca — dziś sześć:
Premiery, Rankingi, Porównania, Poradniki, Kalendarze, Historyczne.

**Zapisane w CLAUDE.md:** standard edytujemy wyłącznie w `redakcja/`, skilla na
claude.ai nigdy — poprawka przepadłaby przy następnym eksporcie.

**Stan:** gotowe; paczki czekają na wgranie

**Dla drugiej strony (COWORK):** wgraj `skille/lego-standard-redakcyjny/`
i `skille/lego-standard-sprzedazowy/` na claude.ai → Settings → Skills,
**zastępując** dotychczasowe `lego-standard-redakcyjny`
i `klocki-standard-sprzedazowy`. Ten drugi zmienia nazwę, więc stary skasuj.
Po wgraniu synchronizują się same do Coworku i do Claude Code.

**Uwagi:** teksty „na rozpoczęcie roku szkolnego dla chłopca / dla dziewczynki"
zostają bez zmian (decyzja Marka), mimo że standard 1.5 odradza dzielenie
prezentów według płci. Reguła obowiązuje od nowych tekstów.

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

## 2026-08-27 (2) · CODE (Radar) · Super Mario 2027 + Insiders w Poradnikach

**Zrobione:**
- Nowy artykuł `/artykuly/lego-super-mario-2027-minifigurki/` (kategoria
  *Premiery*). Restart serii potwierdzony oficjalnie na Gamescom 2026:
  osiem zestawów 1.01.2027 (72052–72061, 9,99–99,99 USD), dziesięć
  debiutujących minifigurek, koniec elektronicznej figurki po sześciu latach.
  Cen w zł nie przeliczamy — brak oficjalnego cennika PL.
- Szkic o zmianie zasad nagród Insiders opublikowany: `redakcja/szkice/` →
  `src/pages/artykuly/`, kategoria **Poradniki** (pierwszy tekst w tym
  dziale — filtr na `/artykuly/` przestał być wyszarzony). Dopisana
  przedsprzedaż 75457 Executor 1.10 wyłączna dla Insiders.
  `redakcja/szkice/README.md`: zero szkiców czekających na akceptację.
- `/zapowiedzi-lego-2027/`: sekcja Super Mario z plakietką „potwierdzone",
  dwa wiersze w tabeli przeglądowej, poprawione FAQ — twierdziło, że żaden
  zestaw 2027 nie jest oficjalnie ogłoszony, co przestało być prawdą.

**Do zrobienia (zgłoszone, nie wykonane):**
- **Żaden z 37 zestawów Super Mario nie jest oznaczony na `/wycofania/`**,
  mimo że branżowe zestawienia mówią o wycofaniu całej interaktywnej linii
  do końca 2026. Artykuł to jawnie sygnalizuje czytelnikowi, ale lista
  wymaga uzupełnienia po potwierdzeniu terminów u źródła.
- 75394 / 75419 / 75639 bez ceny katalogowej; 75639 brakowało w `katalog.json`.

**Do decyzji Marka (wciąż otwarte z 26.08):**
- 80120/80121 (Chinese Festivals) — rozjazd serii między `sety.json`
  a `katalog.json`; SMART Play zostaje jak jest, Halloween → Seasonal.
- Która forma nazwy jest kanoniczna przy 28 rozbieżnościach nazw.

## 2026-08-28 (2) · CODE (Radar) · Nowości miesięczne, kalendarz redakcyjny, luki z radaru

**Zrobione (z rekomendacji porannego radaru):**
- **75639 Statek piracki Going Merry** dopisany do `katalog.json` (One Piece,
  559,99 zł, 1376 el., rocznik 2025). Brakowało go w obu plikach danych, więc
  zestaw nie miał podstrony, mimo że feedy miały na niego ofertę i mimo że
  konkurencja opublikowała na niego okazję. `/zestaw/75639/` już działa
  i liczy rabat (Allegro 463,26 zł, −17%). Źródło ceny: LEGO.com PL,
  potwierdzone u promoklocki.
- **Prezentownik Friends**: akapit o styczniowej fali 2027 i powrocie
  42719 Centrum handlowe w Heartlake (~420 zł) — jako alternatywa dla
  Grand Hotelu przy dużym prezencie, z zaznaczeniem, że to wciąż przeciek.
- **`/nowosci/<miesiac>-<rok>/`** — dziewięć podstron liczonych z `sety.json`
  (pole `premiera`), próg 3 premier na miesiąc, żeby nie robić cienkich stron.
  Nawigacja poprzedni/następny, ItemList + BreadcrumbList, pasek miesięcy na
  `/nowosci/`. Wrzesień: 15 zestawów, 5 kalendarzy adwentowych, 8 ekskluzywów.
  Przewaga nad formatem konkurencji: ich lista jest przepisana, nasza liczy
  się z danych i sama się aktualizuje z każdą partią.
- **`/kalendarz-redakcyjny/`** — plan tekstów w oknach publikacji (nie w dniach),
  powiązany z kotwicami sezonu: Executor 1 i 4.10, Black Friday 27.11,
  grudniowa fala wycofań, fala premier 1.01. Dane w
  `src/data/kalendarz_redakcyjny.json`, append-only: pozycje zmieniają status,
  nie znikają; zdjęty tekst zostaje ze statusem `odlozone` i powodem.
- **Strona główna**: sekcja „Co piszemy w najbliższych tygodniach" — trzy
  najbliższe pozycje planu + link do kalendarza. Znika sama, gdy plan pusty.

**Uwaga do planu redakcyjnego:** pięć zaplanowanych pozycji to deklaracja
publiczna. Pierwsza (kalendarze adwentowe, okno 1–14 września) jest
najpilniejsza — kalendarze wchodzą do sprzedaży we wrześniu, a kupuje się je
na trzy miesiące przed otwarciem.

**Korekta wcześniejszego wpisu:** 75394 i 75419 mają już ceny katalogowe
(729,99 i 4199,99 zł) — zgłoszenie z 27.08 było nieaktualne.

## 2026-08-28 (3) · CODE (Radar) · Trzy decyzje Marka wdrożone

**Nazwy — kanoniczne są nazwy z LEGO.com PL.**
- Wszystkie **30 rozjazdów** między `sety.json` a `katalog.json` wyrównane;
  po zmianie zostaje **zero** rozbieżności.
- Zniknęły prefiksy motywu z Bricksetu (`3w1 `, `Marvel `,
  `Chinese Festivals `) — potwierdzone na 31387/31389, gdzie LEGO.com PL
  podaje motyw obok nazwy („Legendarny statek piracki 31387 | Creator 3 w 1").
  Dla spójności serii zdjąłem też 13 dodatkowych prefiksów `3w1` w Creatorze,
  które nie były w konflikcie (bo tych setów nie ma w `sety.json`).
- Typografia wg LEGO PL: apostrof typograficzny, myślnik jako separator
  podtytułu, zdaniowa wielkość liter poza nazwami własnymi.
- Wyjątek: **kalendarze adwentowe zachowują serię w nazwie** — bez niej pięć
  zestawów z 2026 nazywa się identycznie i nie da się ich rozróżnić na listach.
- **Nie ruszone**: ~110 starych i promocyjnych pozycji 2000–2015 z angielskimi
  nazwami Bricksetu (`City `, `Star Wars `, `Friends `, `Ninjago `) — prefiks
  jest tam częścią nazwy i nie ma polskiego odpowiednika u LEGO. Podobnie
  licencyjny podmotyw `Disney ` w DUPLO.
- **7 form przyjętych bez potwierdzenia u źródła** (LEGO.com blokuje odczyt
  stron produktu przez Cloudflare; działa wyszukiwarka z `allowed_domains`):
  42224, 42233, 42235, 75427, 77263 oraz 10448/10451 (DUPLO ma „3 w 1" raz
  jako prefiks, raz jako sufiks — jedna forma jest błędna). Lista siedzi
  w `katalog.json` → `_meta.nazwy_do_weryfikacji`.
- Przy okazji literówka: 31018 „Zdobywca autrostad" → „autostrad".

**80120 / 80121 → Seasonal.** W obu plikach. Seria „Tradycyjne festiwale
chińskie" została bez zestawów, więc `/serie/tradycyjne-festiwale-chinskie/`
zniknęło — dodane przekierowanie na `/serie/seasonal/`, żeby nie zostawić 404.

**Wycofania Super Mario — nie oznaczamy.** Nic nie dopisane do `/wycofania/`.
Z decyzji wyszła reguła ogólna: na liście wycofań są wyłącznie terminy
potwierdzone przez Grupę LEGO. Artykuł o restarcie serii tłumaczy teraz
czytelnikowi ten próg („wolimy nie podać daty niż podać niepewną") zamiast
obiecywać uzupełnienie listy.

Obie reguły — nazewnictwo i próg dowodowy wycofań — zapisane w `RUNBOOK.md`.

**Plan redakcyjny nie jest już publiczny** (patrz wpis wyżej). Mieszka
w `redakcja/plan-redakcyjny.json`, a Marek dostaje go osobnym prywatnym
linkiem, nie jako podstronę serwisu.
