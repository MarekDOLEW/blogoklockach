# Ustalenia projektowe — warstwa tylkoklocki.pl

Dokumenty wspólnika (`standard-artykulow-biezacych.md`, `metodologia-researchu-lego.md`)
leżą w repo **verbatim** — nie dopisujemy w nich ani słowa. Pisano je dla
„klasycznego" bloga, a nasz serwis ma warstwę automatyzacji: generowane tabele
cen, rejestr RRP, siedem kategorii, worker `/idz/`. Wszystko, co z tej
automatyzacji wynika, mieszka **tutaj**.

Dzięki temu, gdy Piotr przyśle standard 1.6, podmieniamy jeden plik i nic
z naszych ustaleń nie ginie w scalaniu prozy.

## Pierwszeństwo

Przy sprzeczności wygrywa ten dokument — ale **tylko w sprawach infrastruktury
serwisu**: skąd biorą się ceny, jak wstawiamy linki, jak nazywamy i klasyfikujemy
teksty. W sprawach redakcyjnych — ton, struktura, dobór modułów, ważenie zalet
i wad, hierarchia źródeł, próg zakupu jako ocena — rozstrzygają dokumenty
wspólnika i tego nie podważamy.

Sprzeczność, której nie da się rozstrzygnąć tą regułą, idzie do Marka przed
publikacją (bramka eskalacyjna, Metodologia §9).

---

## 1. Podział pracy: kto wstawia ceny i linki

Zasada obowiązująca od 25.08.2026. **Autor tekstu nie wpisuje konkretnych kwot sklepowych ani adresów afiliacyjnych.** Wstawia w ich miejsce oznaczenie `[wstaw link afiliacyjny]`, a ceny podaje wyłącznie tam, gdzie są częścią oceny: cena katalogowa, dobra i bardzo dobra cena, próg zakupu.

Kwoty sklepowe i linki uzupełnia redakcja techniczna podczas wgrywania artykułu na serwer, ze źródeł serwisu:

| Co | Skąd | Kto |
|---|---|---|
| Ceny sklepowe w tabeli | `oferty_feed.json` — renderowane przy budowaniu znacznikiem `<div class="ceny-setu" data-set="<nr>"></div>` | automat, odświeża się z każdym przebiegiem Łowcy |
| Cena katalogowa (RRP) | `rrp_potwierdzone.json` → `sety.json` → `ceny_baza.json` → `katalog.json` | rejestr potwierdzony przez człowieka jest ponad automatem |
| Linki do sklepów | `/idz/<sklep>/<nr>` — worker i `redirects.json` | redakcja techniczna, zamiast `[wstaw link afiliacyjny]` |
| Drabina cenowa i próg zakupu | ocena autora | autor tekstu |

Dzięki temu artykuł nie zawiera ani jednej ręcznie wpisanej ceny sklepowej, która mogłaby się zestarzeć. Tabela cen w treści tekstu jest **generowana**, nie przepisywana — nie jest więc snapshotem, którego zakazuje §18, i nie podaje daty kontroli.

**Cena katalogowa raz ustalona zostaje na zawsze.** RRP nie zmienia się w czasie — nie ma powodu sprawdzać go ponownie przy każdym artykule. Cena potwierdzona u źródła trafia do `src/data/rrp_potwierdzone.json` (rejestr write-once o najwyższym pierwszeństwie) i od tej pory żaden backfill ani runner jej nie nadpisze. Wczytanie listy cen: `node scripts/wczytaj-rrp.mjs <plik> --zrodlo "..."`.

**Cena katalogowa w tekście musi zgadzać się z danymi serwisu**, bo z tego samego źródła bierze ją generowana tabela — inaczej na jednej stronie stoją dwie różne kwoty. Przy rozbieżności rozstrzyga polski cennik LEGO, nie przeliczenie ceny w euro. Kontrola: `node scripts/kontrola-rrp.mjs`.

## 2. Kategorie i nazewnictwo artykułów

Obowiązuje od 27.08.2026. Dział `/artykuly/` ma **siedem stałych kategorii**,
w tej kolejności: **Premiery, Recenzje, Rankingi, Porównania, Poradniki,
Kalendarze, Historyczne**. Lista mieszka w `src/data/kategorie_artykulow.json`
i jest zamknięta — nowy tekst wpada do jednej z nich, nie tworzymy kategorii
pod pojedynczy artykuł. Kategorie bez tekstów też mają przycisk na filtrze:
czytelnik widzi zakres serwisu, redakcja widzi dziury.

**Tytuł roboczy i nazwa pliku zaczynają się od kategorii** — po samej nazwie ma
być widać, gdzie tekst trafia: „Recenzja LEGO 71858…", „Ranking zestawów
Technic do 300 zł", „Porównanie 60506 i 60511".

**Prezentownik nie jest kategorią artykułu.** Ma własny dział `/prezentowniki/`
i nie pojawia się na liście artykułów. Docelowa liczba zestawów w prezentowniku
serii to **osiem** — galeria układa się po cztery w rzędzie, więc osiem daje dwa
równe rzędy (wzorzec: `redakcja/wzorce/prezentownik-serii.md`).

Gotowe szkielety: `redakcja/wzorce/`.


---

## 3. Mapowanie standardu na infrastrukturę serwisu

| Standard mówi | U nas realizuje to |
|---|---|
| rejestr sklepów (Sklepy §2–3) | `src/data/sklepy.json` + `src/data/afiliacje_rejestr.json` |
| snapshot cenowy (Metodologia §6.3) | `src/data/oferty_feed.json`, odświeżany codziennie przez Łowcę |
| „sprawdź bieżącą cenę" | hub `/zestaw/<nr>/` — tabela renderowana przy buildzie |
| karta researchu (Metodologia §10) | `redakcja/karty/<nr>-<slug>.md` dla tekstów pisanych w Code; przy tekstach Piotra karta zostaje w jego środowisku, do repo trafia artykuł (decyzja Marka 15.09.2026) |
| oznaczenie afiliacji (Standard §20) | disclosure w layoucie + `rel="sponsored nofollow"` |
| `[wstaw link afiliacyjny]` | podmieniane przy publikacji na `/idz/<sklep>/<nr>` |

## 4. Ograniczenia wykonawcze

- **lego.com, promoklocki.pl, zklockow.pl, x-kom.pl blokują ruch serwerowy.**
  zklockow.pl przez Cloudflare managed challenge (403 nawet na `robots.txt`),
  lego.com twardą blokadą. Chromium w sesji serwerowej nie ma sieci wychodzącej,
  więc przeglądarka nie obejdzie challenge'a. Poziom A metodologii realizujemy
  przez Brickset, instrukcje, feedy sklepów i dane podane przez użytkownika.
- **Ceny katalogowe z tych źródeł dostarcza człowiek albo Cowork** i wczytujemy
  je skryptem `scripts/wczytaj-rrp.mjs` do `src/data/rrp_potwierdzone.json`.
- Transkrypty YouTube bywają niedostępne — wtedy w karcie zaznaczamy zakres
  analizy zgodnie z Metodologią §5.3.

## Drabina cenowa: „normalny poziom rynkowy" jest opcjonalny *(decyzja Marka 15.09.2026)*

§18 standardu wymienia cztery poziomy (RRP, normalny poziom rynkowy, dobra/bardzo
dobra cena, próg zakupu), a przykład w §19.1 pokazuje trzy. Rozstrzygnięcie:
**obowiązkowe są RRP, dobra i bardzo dobra cena oraz próg zakupu; normalny
poziom rynkowy podajemy, gdy dane go dają** (np. zestaw od miesięcy stabilnie
10% poniżej RRP) — wtedy jest informacją, a nie wymogiem. Dokument Piotra
zostaje bez zmian; skill `lego-standard-redakcyjny` generuje się z tą regułą.


## Kategoria „Aktualności” *(decyzja Marka 27.09.2026)*

Ósma kategoria obok siedmiu ze standardu: **akcje sklepów i kampanie z terminem**
(Dzień Chłopaka w x-kom, Allegro Black Weeks itp.). Na stronie głównej stoją zaraz
pod slajderem deali, w **dwóch kolumnach** (slajder do 6 pozycji), a lista pełna
jest pod `/aktualnosci/`. Zasady:

- frontmatter `kategoria: "Aktualności"`; plik w `src/pages/artykuly/` (starsze
  posty mogą zostać w swoim katalogu — liczy się kategoria, nie ścieżka);
- **`okladka` obowiązkowa** — build (`scripts/sprawdz-kategorie.mjs`) odrzuca
  aktualność bez zdjęcia;
- `wazne_do: "RRRR-MM-DD"`, gdy akcja ma koniec — karta pokazuje „trwa do …”,
  a po terminie „akcja zakończona” i spada na koniec listy;
- datowane ceny sklepowe są tu dopuszczalne, jeśli tekst podaje datę sprawdzenia
  („Ceny sprawdzone: 26.09.2026”) — aktualność opisuje moment, nie trwałą drabinę.
  Próg zakupu i odniesienie do RRP obowiązują jak w innych tekstach.

## Tytuł i opis dla Google (30.09.2026)

Google pokazuje ok. 60 znaków tytułu i ok. 160 znaków opisu. Tytuł i lead
artykułu mogą być dłuższe — na stronie zostają bez zmian — ale wtedy we
frontmatterze dopisujemy wersje wyszukiwarkowe:

- `seo_tytul:` do 60 znaków (sufiks „· tylkoklocki.pl” layout dokłada sam,
  tylko gdy się zmieści);
- `seo_opis:` do 160 znaków, pełne zdania, bez „…”.

W prezentownikach na layoucie `PrezentownikSerii` te same pola nazywają się
`seoTytul` i `seoOpis`. Opis bez wersji skróconej layout przytnie sam na
ostatnim końcu zdania i zgłosi to w logu builda (`[meta] opis przycięty`).
Huby zestawów dobierają tytuł automatycznie z wariantów mieszczących się w 60 znakach.

## „Zestawy pod lupą” — dział /deale/ w nowym formacie (30.10.2026)

Dawne „Okazje pod lupą” (post dealowy z ceną i „historycznym minimum” w tytule
i treści) zastąpił format **„Zestawy pod lupą”**: tekst mówi, *dlaczego warto mieć
zestaw*, a wszystko, co zmienia się z dnia na dzień, liczy automat. Brief Coworka
z pełnym szablonem i zasadami: `redakcja/wzorce/zestawy-pod-lupa.md`.

- **W treści nie ma cen sklepowych**, nazwy najtańszego sklepu, „dziś kosztuje”,
  „najniższa w notowaniach”, rabatu od bieżącej ceny, dat kontroli, kodów. Wolno:
  RRP, progi drabiny, cena za element od RRP, ogólnik o ostatniej fali promocji.
- **Drabina cenowa stoi we frontmatterze** (`cena_katalogowa`, `cena_dobra`,
  `cena_bardzo_dobra`, `prog_zakupu`) i powtarza się w tabeli „Przy jakiej cenie brać”.
- **Moduł ceny** (`CenaPodLupa.astro`, dane z `src/lib/pod-lupa.js`) pod tytułem:
  cena „dziś” = **najtańsza oferta sklepu z własnym magazynem — bez Allegro
  (marketplace) i bez Ceneo (porównywarka)**, po tym samym sicie co tabele
  (`filtrujOferty`; po EOL wiersz LEGO.com nie jest ofertą). Status względem progu:
  *bardzo dobra* (≤ `cena_bardzo_dobra`), *dobra* (≤ `prog_zakupu`), *powyżej progu*,
  *brak oferty*. Przy braku oferty z magazynu moduł pokazuje Allegro jako informację,
  nie jako „cenę dziś”.
- **Strona główna**: tylko teksty ze statusem dobra/bardzo dobra, najwyżej trzy
  (bardzo dobre pierwsze, potem najnowsze). Bez takiej ceny sekcja znika.
  `wylacz_z_glownej_po: "RRRR-MM-DD"` zdejmuje z głównej tekst sezonowy (kalendarze
  adwentowe po 24.12). Listing `/promocje-lego/#zestawy-pod-lupa` pokazuje wszystkie
  teksty z plakietką statusu, najlepszy status pierwszy.
- **URL zostaje przy podmianie treści**; dwa teksty o jednym zestawie łączą się
  w jeden, a drugi adres dostaje `alias_url` — strona pod aliasem renderuje ten sam
  tekst z `rel="canonical"` na adres główny (`src/pages/deale/[alias].astro`).
- Sekcja „Do weryfikacji” z paczki Coworka nie jest publikowana — importer
  (`scripts/import-pod-lupa.mjs`) odkłada ją do `materialy/zestawy-pod-lupa-weryfikacja-<data>.md`.
- `kategoria` zostaje `Deal` (walidator prebuild); czytelnik widzi plakietkę „Pod lupą”.

