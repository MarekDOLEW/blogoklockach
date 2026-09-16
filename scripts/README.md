# Skrypty — co jest do czego

Spis powstał 14.09.2026, przy porządkach po audycie. Audyt twierdził, że do
usunięcia jest **pięć martwych skryptów**. Sprawdzenie tego twierdzenia:
osiem skryptów nie ma ani jednego odwołania w repo ani w promptach runnerów,
ale **wszystkie osiem uruchomiłem i wszystkie działają**, dając sensowny wynik.
Żaden nie jest martwy — po prostu nigdzie nie były opisane i dlatego wyglądały
na porzucone. Stąd ten plik: tańszy niż kasowanie działających narzędzi
i odtwarzanie ich za miesiąc.

Kolumna „kto uruchamia" jest ważniejsza od opisu — mówi, czy coś chodzi samo,
czy czeka, aż ktoś je wywoła.

## Runnery cykliczne

| Skrypt | Kto uruchamia | Do czego |
|---|---|---|
| `feedy-lego.py` | Łowca, codziennie | Wyciąga z feedów sklepowych wyłącznie oferty LEGO (~4 MB zamiast ~630 MB) |
| `ceneo-feed.mjs` | Routine „Dane wt 05:30 — katalog LEGO.pl + ceny Ceneo i Smyk" (krok 6) | Feed Ceneo przez Tradedoubler (program 385881, fid 256472); data per sklep w `daty.ceneo`, zapis przez `json-kolejnosc.mjs` |
| `kontrola-rrp.mjs` | Backfill przed commitem; sesja po każdym imporcie cen | Bramka sanity: cena rynkowa poniżej 50% RRP oznacza błąd po którejś stronie. Od 16.09 „Test rynkowy" mówi też, czy oferta jest potwierdzona przez człowieka (`deale_potwierdzone.json`) i widoczna, czy ukryta przez sito `filtrujOferty` |
| `kliki-raport.mjs` | Kontroler, tygodniowo | Kliknięcia z Analytics Engine. **Domyślnie liczy tylko ludzi** (blob6) |
| `gsc-raport.mjs` | Kontroler | Widoczność w Search Console |
| `prowizje-raport.mjs` | Kontroler | Prowizje zmierzone: Adtraction, Performers, Tradedoubler |
| `diagnoza.mjs` | Kontroler, KROK 0 | Co widzi środowisko — zmienne, repo, dane, realne wywołania (od 14.09 także R2) |
| `harmonogram-z-konta.mjs` | Kontroler | Przepisuje sekcję „Zrzut" w `materialy/zadania-cykliczne.md` i cały plik `materialy/routine-prompty.md` (prompty Routines LEGO, kopia z konta) z `list_triggers` |
| `wyslij-raport.py` | **Łowca, Scout, Radar, Wycofania** (od 14.09.2026, ostatni krok promptu) | Mail z PDF do redakcji przez Resend (`RESEND_API_KEY`), adresy z `src/data/raporty_mail.json`. PDF przez Chromium, bez zależności. `--do` do testów, `--tylko-pdf` bez wysyłki. Kontroler nie — jego raport idzie do Marka przez `SendUserFile` |

## Build i treść

| Skrypt | Kto uruchamia | Do czego |
|---|---|---|
| `generuj-obrazy.mjs` | **npm prebuild**, automatycznie | Tworzy `src/data/obrazy.json` — mapę numer → URL zdjęcia. Patrz uwaga niżej |
| `generuj-og.py` | sesja, po nowych tekstach | Obrazy OG dla artykułów i prezentowników |
| `remark-ceny.mjs` | Astro przy budowaniu | Tabela cen w treści artykułu |
| `remark-galeria.mjs` | Astro przy budowaniu | Slajder ze zdjęciami |
| `remark-nazwy-setow.mjs` | Astro przy budowaniu | Numery i nazwy zestawów — wyróżnione i linkowane |

## Importery linków i cen — uruchamiane z plikiem na wejściu

Wszystkie biorą zrzut albo feed jako argument i dopisują do `redirects.json`
lub do ofert. Żaden nie chodzi sam.

| Skrypt | Sklep | Uwaga |
|---|---|---|
| `empik-import.mjs` | Code (załącznik od Marka) albo Łowca z notką; co tydzień po zrzucie | **Ceny ze zrzutu `lego-empik.json` do feedu, sety.json i ceny_baza** z regułami importu (gadżety, numer 4–7 cyfr, konflikt numeru z nazwą, sanity 40% RRP, tylko zestawy z hubem, świeżość nadrzędna, `daty.empik` z pliku). Zawsze najpierw `--sucho`. Do 16.09.2026 reguły żyły w pamięci sesji Łowcy |
| `empik-redirects.mjs` | Empik | **Jedyny skrypt, który wolno kasować wpisy** (`--usun-martwe`) — patrz CLAUDE.md |
| `me-redirects.mjs` | Media Expert | |
| `lego-redirects.mjs` | LEGO.com | Wejściem jest katalog z `firecrawl-legopl.mjs` |
| `smyk-ceny.mjs` | Smyk | Wczytanie katalogu ze zrzutu: `node scripts/smyk-ceny.mjs <plik.json>` (pierwsze wejście sklepu, adresy kart do `redirects.smyk`) |
| `smyk-odswiez.mjs` | Routine „Dane wt 05:30 — katalog LEGO.pl + ceny Ceneo i Smyk" (krok 6a) | **Cotygodniowe odświeżenie cen wprost ze stron produktów, 0 kredytów** — Adtraction nie daje feedu (`feed: false`), a smyk.com odpowiada zwykłemu zapytaniu. Czyta adresy z `redirects.smyk`, zapisuje `oferty.smyk` + `daty.smyk`; wyprzedany zestaw traci cenę. `--stare` domyka błędy sieci, `--limit N --sucho` to próbka |
| `wczytaj-rrp.mjs` | — | Potwierdzone ceny katalogowe do `rrp_potwierdzone.json` |
| `lego-ceny.mjs` | LEGO.com | **Routine „Dane wt 05:30 — katalog LEGO.pl + ceny Ceneo i Smyk" (kroki 1–5)**. Wejściem jest katalog z `firecrawl-legopl.mjs`: cena LEGO.com do `oferty_feed` (klucz `lego` + `daty.lego`) i do `sety.json`, status `dostepny` + flaga `ekskluzyw` + `lego_pl_widziano` w `katalog.json`. Nic nie kasuje. Zawsze najpierw `--sucho` |
| `katalog-z-rebrickable.mjs` | sesja, gdy `--sucho` pokaże nowe numery spoza katalogu | Dopisuje do `katalog.json` zestawy wycenione w feedach, których katalog nie zna (Rebrickable CSV, nazwy EN, bez RRP). Append-only. Patrz RUNBOOK „Hub dla każdego zestawu" |

## Alerty cenowe „Obserwuj zestaw"

| Skrypt | Kto uruchamia | Do czego |
|---|---|---|
| `alerty-cen.mjs` | Routine „Alerty cen" codziennie 09:30 (po Łowcy) | Listuje zapisy z R2 (`_obserwuj/`), kasuje niepotwierdzone po 7 dniach, wysyła mail (Resend), gdy cena jest ≥20% poniżej katalogowej i niższa od ostatnio wysłanej. `--sucho` pokazuje, co by wysłał. Zapisy zakłada worker (`/obserwuj`) |

## Firecrawl — tylko tam, gdzie nas blokują

| Skrypt | Do czego |
|---|---|
| `firecrawl.mjs` | Cienki klient API; też do diagnostyki z konsoli |
| `firecrawl-legopl.mjs` | Zaciąg katalogu lego.com/pl-pl (lego.com oddaje nam 403) |
| `parser-legopl.mjs` | Parser markdownu listingu — **5× tańszy** niż ekstrakcja modelem (1 kredyt wobec 5) |
| `opisy-legopl.mjs` | Sesja na żądanie. Opisy producenta z kart lego.pl (sekcje „Funkcje" i „Szczegóły produktu") jako materiał do researchu dla zestawów w sprzedaży bez opisu i bez karty — `materialy/opisy-lego/lego-pl/<nr>.md`, opcjonalnie PDF `<nr>.pdf` (`--pdf <katalog>`). 1 kredyt na kartę. Tekst LEGO nie jest treścią do publikacji |

## Zdjęcia w R2

| Skrypt | Kto uruchamia | Do czego |
|---|---|---|
| `r2-obrazy.mjs` | Routine „Zdjęcia → R2" codziennie 04:30 + sesja od razu po dopisaniu galerii do `galerie.json` | Wgrywa do R2 zdjęcia, których worker nie pobierze sam (Planeta Klocków odrzuca fetch z workera). Rejestrem wgranych jest sam kubełek (listowanie R2), więc bez zaległości przebieg trwa sekundy. Każdy plik przechodzi przez sharp (≤1200 px, JPEG q80) — `--optymalizuj` robi to samo z tym, co już leży w R2. `--limit N` = najwyżej N wgrań, `--sprawdz` = audyt HEAD produkcji (~15 min, widzi też martwe źródła), `--galerie` = tylko galerie. Wymaga `CF_R2_TOKEN`. Patrz RUNBOOK „Zdjęcia: Planeta Klocków odrzuca fetch z workera" |

Budżet: 1000 kredytów miesięcznie. Szczegóły w `NARZEDZIA.md`.

## Kontrola i listingi — uruchamiasz, gdy coś podejrzewasz

Te nie mają odwołań w dokumentach i właśnie dlatego wyglądały na martwe.
Wszystkie uruchomione i sprawdzone 14.09.2026. Liczb z wyników tu nie ma —
zmieniają się co przebieg, a ten plik ma być prawdziwy za miesiąc.

| Skrypt | Do czego | Zapisuje |
|---|---|---|
| `audyt-wycofan.mjs` | Porównuje trzy źródła prawdy o statusie EOL | stdout |
| `oferty-przeterminowane.mjs` | Usuwa z `sety.json` oferty starsze niż 14 dni (`--dni N`, `--sucho`); strona i tak ich nie pokazuje (`filtrujOferty`), ale dane nie mają udawać oferty | `src/data/sety.json` |
| `kontrola-ofert.mjs` | Oferty odrzucone przez odsiew — te same reguły co w serwisie | stdout |
| `ceny-powyzej-rrp.mjs` | Zestawy z najniższą ofertą powyżej ceny katalogowej; `--lego` rozdziela EOL od błędu statusu | stdout |
| `lista-do-indeksacji.mjs` | Adresy z autorską treścią do ręcznego zgłoszenia w GSC | stdout |
| `zestawy-bez-ceny.py` | W sprzedaży, z podstroną, bez znanej ceny katalogowej | `materialy/zestawy-bez-ceny.xlsx` |
| `karty-poza-kolejka.py` | Karty Piotra, które wypadają z kolejki redakcyjnej | `materialy/karty-poza-kolejka.xlsx` |
| `bez-opisu-od-najnowszych.py` | Zestawy bez opisu, od najnowszych | `materialy/zestawy-bez-opisu.xlsx` |
| `kolejka-redakcyjna.py` | Kolejka redakcyjna | `materialy/kolejka-redakcyjna.xlsx` |
| `import-karty.py` | Import kart zestawów z paczek Piotra | `src/data/karty_setow.json` |

Uwaga do plików `.xlsx`: po każdym uruchomieniu git pokazuje je jako zmienione,
nawet gdy dane są identyczne — zip zapisuje czas. Zanim zacommitujesz, porównaj
`xl/worksheets/sheet1.xml` po rozpakowaniu; sam `docProps/core.xml` to szum.

## Raporty analityczne

| Skrypt | Stan na 14.09.2026 |
|---|---|
| `ga4-raport.mjs` | **działa** — usługa `properties/550318964` |
| `gtm-raport.mjs` | działa, ale **konto serwisowe nie widzi żadnego kontenera GTM** — do nadania dostępu w GTM → Administracja → Zarządzanie dostępem |

## Skille

| Skrypt | Do czego |
|---|---|
| `eksport-skilli.mjs` | `redakcja/` → `.claude/skills/`. Code czyta od razu |
| `spakuj-skille.mjs` | `.claude/skills/` → `skille/*.skill` do wgrania na claude.ai |

**Nie edytuj wygenerowanych skilli.** Poprawka przepada przy najbliższym
eksporcie — zdarzyło się to 09.09 i wyszło dopiero 14.09.

## Pozostałe

| Skrypt | Do czego |
|---|---|
| `archiwum-dziennika.mjs` | Wpisy starsze niż 14 dni z `DZIENNIK.md` do archiwum miesięcznego. **Uruchamia Kontroler co poniedziałek** (od 14.09.2026); sesja może odpalić ręcznie w każdej chwili |
| `md-na-pdf.py` | Markdown → HTML do wydruku; PDF robi headless Chromium (użycie na końcu pliku) |

---

## Uwaga: `src/data/obrazy.json` zostaje w gicie

Audyt proponował wrzucić go do `.gitignore`, bo powstaje w `prebuild`. **Nie
robimy tego**, dopóki nie wiadomo, jaką komendą buduje Cloudflare.

Powód: `src/worker.js` importuje ten plik **statycznie** (`import obrazy from
'./data/obrazy.json'`), a `wrangler.jsonc` nie ma własnej komendy build. Skoro
`dist/` jest ignorowane, a worker serwuje z niego assety, deploy musi coś
budować — ale `prebuild` odpala się tylko przy `npm run build`. Gdyby w panelu
Cloudflare stało `astro build`, plik by nie powstał i **cały `/img/` przestałby
działać**.

Koszt trzymania go w gicie jest zresztą znikomy: 1,1 MB i **cztery commity
w całej historii**. Ryzyko jest asymetryczne, więc zostaje.
