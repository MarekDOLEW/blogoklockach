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
| `feedy-lego.py` | Łowca, codziennie | Wyciąga z feedów sklepowych wyłącznie oferty LEGO (~4 MB zamiast ~630 MB); Allegro tylko z kategorii `LEGO > Zestawy` z filtrem części i akcesoriów, PK z kontrolą `OutOfStock` na karcie produktu (od 23.09.2026 — feed nie niesie dostępności, numery odrzucone w `_meta.planetaklockow_niedostepne`); ME i PK z sitem spójności numer↔link (od 26.09.2026 — feedy miewają przesunięte wiersze z tytułem jednego produktu i linkiem/ceną innego; odrzucone pary w `_meta.<sklep>_niespojne`). Dodatkowo: **nadpisuje adresy kart w `redirects.json`** (ME, PK, Allegro) świeżymi z feedu — wpisów nie kasuje, przerywa gdyby liczba zmalała; uruchamia importery feedów TD oznaczonych `"odswiezanie": "codziennie"`, **zadania tygodniowe z mapy `ZADANIA_TYGODNIOWE`** (dziś: kontrola linków w poniedziałki, Smyk w piątki — wtorek robi Routine „Dane wt 05:30") oraz `historia-cen.mjs`. `--tylko`, `--tylko-td`, `--bez-td` |
| `ceneo-feed.mjs` | Routine „Dane wt 05:30 — katalog LEGO.pl + ceny Ceneo i Smyk" (krok 6) | **Wszystkie feedy Tradedoublera z `feedy.json`** (Ceneo fid 256472; Lidl fid 259772 po akcepcie — `aktywny: true`): linki do `redirects.<sklep>`, ceny do feedu z datą per sklep, dla sklepów (nie Ceneo) także oferta w `sety.json`. `--sklep x`, `--sucho` |
| `kontrola-rrp.mjs` | Backfill przed commitem; sesja po każdym imporcie cen | Bramka sanity: cena rynkowa poniżej 50% RRP oznacza błąd po którejś stronie. Od 16.09 „Test rynkowy" mówi też, czy oferta jest potwierdzona przez człowieka (`deale_potwierdzone.json`) i widoczna, czy ukryta przez sito `filtrujOferty`. Od 25.09 licznik „PUSTYCH, A ŹRÓDŁO ZNA CENĘ” (pusty wpis w `katalog.json`, cena znana z `rrp_potwierdzone`/`sety`/`ceny_baza`) liczy się do kodu wyjścia jak rozbieżność; `--napraw` uzupełnia i zachowuje wcięcie pliku |
| `kliki-raport.mjs` | Kontroler, tygodniowo | Kliknięcia z Analytics Engine. **Domyślnie liczy tylko ludzi** (blob6) |
| `gsc-raport.mjs` | Kontroler | Widoczność w Search Console |
| `prowizje-raport.mjs` | Kontroler | Prowizje zmierzone: Adtraction, Performers, Tradedoubler |
| `diagnoza.mjs` | Kontroler (pełna, KROK 0); Łowca, Wycofania i Dane wt (`--szybko`, krok 0). Scout, Radar, Backfill i Routine ze świeżą sesją nie wołają jej wcale (stan promptów 22.09.2026) | Co widzi środowisko — zmienne, repo, dane, realne wywołania (od 14.09 także R2) |
| `harmonogram-z-konta.mjs` | sesja Code, Routine „LEGO pon 07:45 — Harmonogram z konta" (`trig_01GJ2ecMp3gwtkZ1pFyUPKLH`, od 22.09.2026; wcześniej Kontroler) | Przepisuje sekcję „Zrzut" w `materialy/zadania-cykliczne.md` i cały plik `materialy/routine-prompty.md` (prompty Routines LEGO, kopia z konta) z `list_triggers` |
| `wyslij-raport.py` | **Łowca, Scout, Radar, Wycofania** (od 14.09.2026, ostatni krok promptu); Kontroler (od 16.09 sekcja „Zadania bez właściciela", `--zadanie kontroler`); Routine „Przypomnienie: Empik" (`--zadanie przypomnienie`); pośrednio `podejrzany-rynek-mail.mjs` i `kontrola-linkow.mjs` | Mail z PDF do redakcji przez Resend (`RESEND_API_KEY`), adresy z `src/data/raporty_mail.json`. PDF przez Chromium, bez zależności. `--do` do testów, `--tylko-pdf` bez wysyłki. Pełny raport Kontrolera idzie do Marka przez `SendUserFile`, nie tym skryptem |

## Build i treść

| Skrypt | Kto uruchamia | Do czego |
|---|---|---|
| `generuj-obrazy.mjs` | **npm prebuild**, automatycznie | Tworzy `src/data/obrazy.json` — mapę numer → URL zdjęcia. Patrz uwaga niżej |
| `generuj-og.py` | sesja, po nowych tekstach | Obrazy OG dla artykułów i prezentowników |
| `remark-ceny.mjs` | Astro przy budowaniu | Tabela cen w treści artykułu |
| `remark-galeria.mjs` | Astro przy budowaniu | Slajder ze zdjęciami |
| `remark-nazwy-setow.mjs` | Astro przy budowaniu | Numery i nazwy zestawów — wyróżnione i linkowane |
| `sprawdz-kategorie.mjs` | **npm prebuild**, automatycznie | Waliduje pole `kategoria` we frontmatterze wszystkich tekstów: siedem kategorii z `src/data/kategorie_artykulow.json` + `Prezentownik` i `Deal`; build pada przy każdej innej wartości (decyzja Marka 15.09.2026) |
| `remark-linki-sklepow.mjs` | Astro przy budowaniu | Ręczne linki `/idz/…` w markdownie dostają `target="_blank"` + `rel` z `noopener` (decyzja 16.09.2026: sklepy w nowej karcie) |

## Importery linków i cen — uruchamiane z plikiem na wejściu

Wszystkie biorą zrzut albo feed jako argument i dopisują do `redirects.json`
lub do ofert. Żaden nie chodzi sam.

| Skrypt | Sklep | Uwaga |
|---|---|---|
| `zrzut-import.mjs` | Code (załącznik od Marka) albo Łowca z notką; co tydzień po zrzucie | **Ceny ze zrzutu lokalną przeglądarką do feedu, sety.json i ceny_baza** — jeden skrypt dla Empiku i x-komu (`--sklep empik\|xkom`), reguły importu w jednym miejscu (gadżety, obce marki — `OBCE_MARKI`, numer 4–7 cyfr, konflikt numeru z nazwą, sanity 40% RRP, tylko zestawy z hubem, świeżość nadrzędna, `daty.<sklep>` z pliku; x-kom: `available: false` odpada). Zawsze najpierw `--sucho` |
| `empik-import.mjs`, `xkom-import.mjs` | jw. | Nakładki na `zrzut-import.mjs` (ustawiają `--sklep`) — polecenia w promptach i skillach zostają bez zmian |
| `zrzut-redirects.mjs` | Code / Łowca, po imporcie | Linki kart produktu ze zrzutu: Empik → deeplink Tradedoublera, x-kom → adres + kod SalesMasters. **Jedyny skrypt, który wolno kasować wpisy** (`--usun-martwe`, gałęzie `empik` i `xkom`) — patrz CLAUDE.md |
| `empik-redirects.mjs`, `xkom-redirects.mjs` | jw. | Nakładki na `zrzut-redirects.mjs` |
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
| `podejrzany-rynek-mail.mjs` | Łowca, codziennie po zapisie danych | Lista ofert ukrytych przez sito „podejrzany rynek" (< 50% potwierdzonego RRP bez wpisu w `deale_potwierdzone.json`) z linkami do sklepu i huba — mail do Marka przez `wyslij-raport.py --zadanie podejrzane`; pusta lista = brak maila. `--sucho` tylko wypisuje |
| `kontrola-linkow.mjs` | Łowca, co tydzień w poniedziałek (mapa `ZADANIA_TYGODNIOWE` w `feedy-lego.py`, `--ile 150`; od 21.09.2026 — wcześniej Kontroler, który teraz tylko czyta wynik) | Losowa próba linków z `redirects.json`: wyciąga z linku **adres docelowy sklepu** i sprawdza jego kod HTTP. **Nigdy nie odpytuje linku trackingowego** — to byłby sztucznie nabity klik w sieci afiliacyjnej. Raport **zawsze** do `materialy/kontrola-linkow-RRRR-MM-DD.md` (także przy zerze martwych); martwe karty (404/410) idą mailem (`--zadanie linki`); Allegro, Media Expert i LEGO.com odrzucają ruch serwerowy (403) i trafiają do kolumny „blokada sklepu", nie do „żywe". `--ile N`, `--sklep x`, `--sucho` |
| `sprawdz-oferte.mjs` | człowiek na żądanie | `node scripts/sprawdz-oferte.mjs <nr> [<nr>…]` — dla jednego zestawu: każda oferta z ceną, datą odczytu, wiekiem w dniach, informacją czy przechodzi sito serwisu (czyli czy widać ją na stronie) i kodem HTTP karty produktu. Nie odpytuje trackingu. |
| `linki-cel.mjs` | (biblioteka) | Wyciąga adres docelowy sklepu z linku trackingowego; wspólne dla `kontrola-linkow.mjs` i `sprawdz-oferte.mjs`, żeby żaden z nich nie wszedł przypadkiem na tracker. |
| `historia-cen.mjs` | Łowca, codziennie (woła go `feedy-lego.py`) | Dopisuje cenę **każdej pary (zestaw, sklep)** do `src/data/historia-cen/RRRR-MM.jsonl` — **tylko zmiany**, format JSON Lines; zniknięcie oferty jako `c: null`, z bezpiecznikiem na padnięty feed (sklep, który stracił ponad połowę ofert, nie generuje „zniknięć"). W `src/data`, bo runnery commitują ten katalog; buildowi nie ciąży, bo `.jsonl` nikt nie importuje. `--sucho` |
| `alerty-cen.mjs` | Routine „Alerty cen" codziennie 09:30 (po Łowcy) | Listuje zapisy z R2 (`_obserwuj/`), kasuje niepotwierdzone po 7 dniach, wysyła mail (Resend), gdy cena jest ≥20% poniżej katalogowej i niższa od ostatnio wysłanej. `--sucho` pokazuje, co by wysłał. Zapisy zakłada worker (`/obserwuj`) |

## Firecrawl — tylko tam, gdzie nas blokują

| Skrypt | Kto uruchamia | Do czego |
|---|---|---|
| `firecrawl.mjs` | (biblioteka: `firecrawl-legopl`, `opisy-legopl`, `lego-strony`); człowiek z konsoli do diagnostyki | Cienki klient API |
| `firecrawl-legopl.mjs` | Routine „Dane wt 05:30" (krok 1); sesja na żądanie | Zaciąg katalogu lego.com/pl-pl (lego.com oddaje nam 403) |
| `parser-legopl.mjs` | (biblioteka, woła go `firecrawl-legopl.mjs`) | Parser markdownu listingu — **5× tańszy** niż ekstrakcja modelem (1 kredyt wobec 5) |
| `lego-strony.mjs` | sesja na żądanie | Czy karta produktu na lego.pl jeszcze istnieje (zasada Marka 16.09.2026: link z huba po EOL zostaje, dopóki żyje karta) — `node scripts/lego-strony.mjs <nr>…` albo `--kandydaci N [--sucho]`; prowadzi `src/data/lego_strony_brak.json`. 1 kredyt na zestaw |
| `opisy-legopl.mjs` | sesja na żądanie | Opisy producenta z kart lego.pl (sekcje „Funkcje" i „Szczegóły produktu") jako materiał do researchu dla zestawów w sprzedaży bez opisu i bez karty — `materialy/opisy-lego/lego-pl/<nr>.md`, opcjonalnie PDF `<nr>.pdf` (`--pdf <katalog>`). 1 kredyt na kartę. Tekst LEGO nie jest treścią do publikacji |

## Zdjęcia w R2

| Skrypt | Kto uruchamia | Do czego |
|---|---|---|
| `r2-obrazy.mjs` | Routine „Zdjęcia → R2" codziennie 04:30 + sesja od razu po dopisaniu galerii do `galerie.json` | Wgrywa do R2 zdjęcia, których worker nie pobierze sam (Planeta Klocków odrzuca fetch z workera). Rejestrem wgranych jest sam kubełek (listowanie R2), więc bez zaległości przebieg trwa sekundy. Każdy plik przechodzi przez sharp (≤1200 px, JPEG q80) — `--optymalizuj` robi to samo z tym, co już leży w R2. `--limit N` = najwyżej N wgrań, `--sprawdz` = audyt HEAD produkcji (~15 min, widzi też martwe źródła), `--galerie` = tylko galerie. Wymaga `CF_R2_TOKEN`. Patrz RUNBOOK „Zdjęcia: Planeta Klocków odrzuca fetch z workera" |

Budżet: 1000 kredytów miesięcznie. Szczegóły w `NARZEDZIA.md`.

## Kontrola i listingi — uruchamiasz, gdy coś podejrzewasz

Te nie mają odwołań w dokumentach i właśnie dlatego wyglądały na martwe.
Wszystkie uruchomione i sprawdzone 14.09.2026. Liczb z wyników tu nie ma —
zmieniają się co przebieg, a ten plik ma być prawdziwy za miesiąc.

**Kto uruchamia:** człowiek (sesja) na żądanie — z jednym wyjątkiem:
`audyt-wycofan.mjs` (bez `--napraw`) woła też runner Wycofań po każdym przebiegu.

| Skrypt | Do czego | Zapisuje |
|---|---|---|
| `audyt-wycofan.mjs` | Porównuje trzy źródła prawdy o statusie EOL | stdout |
| `oferty-przeterminowane.mjs` | Usuwa z `sety.json` oferty starsze niż 14 dni (`--dni N`, `--sucho`); strona i tak ich nie pokazuje (`filtrujOferty`), ale dane nie mają udawać oferty | `src/data/sety.json` |
| `kontrola-ofert.mjs` | Oferty odrzucone przez odsiew — te same reguły co w serwisie | stdout |
| `ceny-powyzej-rrp.mjs` | Zestawy z najniższą ofertą powyżej ceny katalogowej; `--lego` rozdziela EOL od błędu statusu | stdout |
| `lista-do-indeksacji.mjs` | Adresy z autorską treścią do ręcznego zgłoszenia w GSC | stdout |
| `zestawy-bez-ceny.py` | W sprzedaży, z podstroną, bez znanej ceny katalogowej | `materialy/zestawy-bez-ceny.xlsx` |
| `karty-poza-kolejka.py` | Karty Piotra, które wypadają z kolejki redakcyjnej | `materialy/karty-poza-kolejka.xlsx` |
| `bez-opisu-od-najnowszych.py` | Zestawy bez opisu, od najnowszych; od 22.09.2026 zestawy bez RRP wchodzą z najniższą ceną z rynku i dopiskiem „bez RRP — cena z rynku" | `materialy/zestawy-bez-opisu.xlsx` |
| `noindex-do-opisania.py` | **Kolejka hubów z `noindex`** (8 044 pozycje), sortowana: najpierw zestawy z ofertami, potem od najnowszych. Przy każdym: liczba sklepów, długość opisu, czy jest karta Piotra i **czego brakuje do indeksu**. Źródłem prawdy o `noindex` jest zbudowany `dist/`, nie powtórzona reguła — wymaga `npm run build`. `--ile N` = podgląd w konsoli | `materialy/zestawy-noindex.xlsx` |
| `kolejka-redakcyjna.py` | Kolejka redakcyjna; od 22.09.2026 liczy też zestawy bez RRP po najniższej cenie z rynku (dopisek „bez RRP — cena z rynku") | `materialy/kolejka-redakcyjna.xlsx` |
| `macierz-cen.py` | człowiek na żądanie (Marek 23.09.2026) | Macierz zestawy × sklepy: cena z datą w każdej komórce, zielony = pokazywana (sito 14 dni), żółty = przeterminowana, pusto = brak; arkusz „Źródła” mówi, skąd i jak często bierze się cena każdego sklepu i jaka jest afiliacja | `materialy/macierz-cen-sklepy.xlsx` |
| `import-karty.py` | Import kart zestawów z paczek Piotra | `src/data/karty_setow.json` |
| `import-artykul.py` | człowiek przy materiale Piotra | **DOCX → markdown z niczym zgubionym**: akapity, nagłówki, tabele w ich miejscu oraz **obrazy osadzone** zapisane do `materialy/obrazy-artykulow/<slug>/` ze znacznikiem `<!-- OBRAZ n -->` w treści. Nie pisze frontmattera ani slajderów — to decyzje redakcyjne. `--slug`, `--wyjscie`, `--sucho` |

Uwaga do plików `.xlsx`: po każdym uruchomieniu git pokazuje je jako zmienione,
nawet gdy dane są identyczne — zip zapisuje czas. Zanim zacommitujesz, porównaj
`xl/worksheets/sheet1.xml` po rozpakowaniu; sam `docProps/core.xml` to szum.

## Raporty analityczne

Uruchamia człowiek na żądanie — żaden prompt runnera ich nie woła (stan 22.09.2026).

| Skrypt | Stan na 14.09.2026 |
|---|---|
| `ga4-raport.mjs` | **działa** — usługa `properties/550318964` |
| `gtm-raport.mjs` | działa, ale **konto serwisowe nie widzi żadnego kontenera GTM** — do nadania dostępu w GTM → Administracja → Zarządzanie dostępem |

## Skille

| Skrypt | Kto uruchamia | Do czego |
|---|---|---|
| `eksport-skilli.mjs` | `npm prebuild` (sprawdzenie składni) i sesja po zmianie w `redakcja/` | `redakcja/` → `.claude/skills/`. Code czyta od razu |
| `spakuj-skille.mjs` | sesja po każdej zmianie skilla | `.claude/skills/` → `skille/*.skill` do wgrania na claude.ai (wgrywa człowiek) |

**Nie edytuj wygenerowanych skilli.** Poprawka przepada przy najbliższym
eksporcie — zdarzyło się to 09.09 i wyszło dopiero 14.09.

## Pozostałe

| Skrypt | Kto uruchamia | Do czego |
|---|---|---|
| `archiwum-dziennika.mjs` | **Kontroler co poniedziałek** (od 14.09.2026); sesja może odpalić ręcznie w każdej chwili | Wpisy starsze niż 14 dni z `DZIENNIK.md` do archiwum miesięcznego |
| `md-na-pdf.py` | człowiek na żądanie | Markdown → HTML do wydruku; PDF robi headless Chromium (użycie na końcu pliku) |
| `json-kolejnosc.mjs` | (biblioteka) — importują ją `lego-ceny`, `ceneo-feed`, `empik-import`, `smyk-odswiez`, `katalog-z-rebrickable`, `oferty-przeterminowane`, `porzadek-ofert` | Zapis `sety.json` i `oferty_feed.json` z JS z zachowaniem kolejności kluczy i wcięcia pliku (`JSON.stringify` sortuje klucze numeryczne i przepisywał 37 tys. linii). Każdy nowy skrypt piszący te pliki z JS ma jej używać |
| `porzadek-ofert.mjs` | Łowca przed commitem (od 22.09.2026); `--sucho` pokazuje, ile wpisów wymaga zmiany | Stała kolejność ofert w `sety.json`: alfabetycznie po sklepie (decyzja Marka 16.09.2026 — sortowanie po cenie dawało 76 tys. linii diffu dziennie; strona sortuje po cenie sama) |

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
