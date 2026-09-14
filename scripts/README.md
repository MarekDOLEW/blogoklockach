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
| `ceneo-feed.mjs` | Łowca | Feed Ceneo przez Tradedoubler (program 385881, fid 256472) |
| `kontrola-rrp.mjs` | Backfill, obowiązkowo przed commitem | Bramka sanity: cena rynkowa poniżej 50% RRP oznacza błąd po którejś stronie |
| `kliki-raport.mjs` | Kontroler, tygodniowo | Kliknięcia z Analytics Engine. **Domyślnie liczy tylko ludzi** (blob6) |
| `gsc-raport.mjs` | Kontroler | Widoczność w Search Console |
| `prowizje-raport.mjs` | Kontroler | Prowizje zmierzone: Adtraction, Performers, Tradedoubler |
| `diagnoza.mjs` | Kontroler, KROK 0 | Co widzi środowisko — zmienne, repo, dane, realne wywołania |
| `harmonogram-z-konta.mjs` | Kontroler | Przepisuje sekcję „Zrzut" w `materialy/zadania-cykliczne.md` z `list_triggers` |
| `wyslij-raport.py` | **nikt dziś** — Kontroler dostarcza PDF przez `SendUserFile` | Droga mailowa przez Resend (`RESEND_API_KEY`), adresy z `src/data/raporty_mail.json`. Zostaje jako zapas, gdyby SendUserFile przestał wystarczać |

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
| `empik-redirects.mjs` | Empik | **Jedyny skrypt, który wolno kasować wpisy** (`--usun-martwe`) — patrz CLAUDE.md |
| `me-redirects.mjs` | Media Expert | |
| `lego-redirects.mjs` | LEGO.com | Wejściem jest katalog z `firecrawl-legopl.mjs` |
| `smyk-ceny.mjs` | Smyk | Wymaga pliku: `node scripts/smyk-ceny.mjs <plik.json>` |
| `wczytaj-rrp.mjs` | — | Potwierdzone ceny katalogowe do `rrp_potwierdzone.json` |

## Firecrawl — tylko tam, gdzie nas blokują

| Skrypt | Do czego |
|---|---|
| `firecrawl.mjs` | Cienki klient API; też do diagnostyki z konsoli |
| `firecrawl-legopl.mjs` | Zaciąg katalogu lego.com/pl-pl (lego.com oddaje nam 403) |
| `parser-legopl.mjs` | Parser markdownu listingu — **5× tańszy** niż ekstrakcja modelem (1 kredyt wobec 5) |

Budżet: 1000 kredytów miesięcznie. Szczegóły w `NARZEDZIA.md`.

## Kontrola i listingi — uruchamiasz, gdy coś podejrzewasz

Te nie mają odwołań w dokumentach i właśnie dlatego wyglądały na martwe.
Wszystkie uruchomione i sprawdzone 14.09.2026. Liczb z wyników tu nie ma —
zmieniają się co przebieg, a ten plik ma być prawdziwy za miesiąc.

| Skrypt | Do czego | Zapisuje |
|---|---|---|
| `audyt-wycofan.mjs` | Porównuje trzy źródła prawdy o statusie EOL | stdout |
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
