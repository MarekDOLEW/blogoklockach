# tylkoklocki.pl — serwis afiliacyjny o LEGO

Astro (statyczny) + Cloudflare Worker (`src/worker.js`: obrazy `/img/`,
przekierowania afiliacyjne `/idz/<sklep>/<nr>`) + R2. Deploy automatyczny
z gałęzi `main`. Dane serwisu w `src/data/*.json`, aktualizowane przez
zadania cykliczne (runnery) i sesje robocze.

## Podzial pracy
   - `redakcja/wspolpraca.md` — miedzy Piotrem a Markiem (ludzie)
   - `NARZEDZIA.md` — miedzy Claude Code a Cowork (narzedzia); sekcja
     „Co gdzie wrzucać" to ściąga dla Marka: co idzie do Code, co do sesji
     runnera, a co na claude.ai — plus lista punktów, które bez niego stoją
   - `RUNBOOK.md` — wiedza operacyjna, pulapki, procedury awaryjne
   - `DZIENNIK.md` — biezace zadania i wymiana miedzy sesjami (ostatnie 14 dni
     + sekcja „Ustalenia trwałe”; starsze wpisy w `materialy/dziennik-archiwum-*`,
     przenosi je `node scripts/archiwum-dziennika.mjs`)

## Skille i standardy — jedno źródło

Standard redakcyjny i metodologia mieszkają **wyłącznie w `redakcja/`**. Skille
`lego-standard-redakcyjny` (dział Artykuły) i `lego-standard-sprzedazowy`
(Prezentowniki i krótkie formy) są z nich **generowane**:

    node scripts/eksport-skilli.mjs    # -> .claude/skills/, Code czyta od razu
    node scripts/spakuj-skille.mjs     # -> skille/*.skill do wgrania na claude.ai

Claude Code w tym repo bierze je z `.claude/skills/` bez żadnego wgrywania.
Cowork czyta skille z konta, a synchronizacja idzie **tylko w jedną stronę**
(serwer → kontener), więc paczkę `.skill` wgrywa człowiek w Settings → Skills.

**Nigdy nie edytujemy skilla na claude.ai ani dwóch paczek generowanych przez
`eksport-skilli.mjs`** (`lego-standard-redakcyjny`, `lego-standard-sprzedazowy`) —
poprawka przepadnie przy następnym eksporcie, a repo i skill znowu się rozjadą.
Zmieniamy dokument w `redakcja/` i uruchamiamy eksport. Pozostałe skille w
`.claude/skills/` są pisane ręcznie albo wendorowane z zewnątrz i edytuje się je
na miejscu — eksport ich nie dotyka.

Skille uniwersalne (karuzele social, `html-do-png`, motion design, szablon
brandowy) i skille GSAP przychodzą z dwóch pluginów jednego marketplace'u
`MarekDOLEW/MDmygeneralskills`, zadeklarowanego w `.claude/settings.json`.
Poprawki do nich robimy w tamtym repo, nie tutaj.
Skrypt `html-do-png.mjs` żyje w pluginie; w repo zostaje tylko zależność
`playwright-core`, z której ten skrypt korzysta.

Dokumenty wspólnika (`standard-artykulow-biezacych.md`,
`metodologia-researchu-lego.md`) trzymamy verbatim; nasze ustalenia dopisujemy
w `redakcja/ustalenia-projektowe.md`.

## Artykuły — zasada nadrzędna

Przed pisaniem lub redagowaniem JAKIEGOKOLWIEK artykułu przeczytaj dokumenty
bazowe w `redakcja/` (README + metodologia researchu + standard artykułów +
sklepy i afiliacja). Skrót najważniejszych reguł:

- najpierw research i karta researchu (`redakcja/karty/`), potem artykuł;
  nierozstrzygnięte rozbieżności eskaluj do użytkownika przed finalną redakcją;
- w treści artykułu: trwała drabina cenowa i próg zakupu zamiast datowanego
  snapshotu cen; 2–3 sklepy publikacyjne + link do huba `/zestaw/<nr>/`
  (tabela huba aktualizuje się sama i tam data jest właściwa);
- afiliacja nie wpływa na ocenę, próg zakupu ani dobór sklepów; disclosure
  zapewnia layout artykułu i `rel="sponsored nofollow"`;
- ton ekspercki po polsku; „klocki/elementy/części", nigdy „cegły";
  bez sztucznej presji zakupowej i pseudopromocji.

## Dyscyplina danych

- Pliki `src/data/*.json`: append-only — liczba wpisów nie może maleć;
  po każdej zmianie walidacja JSON przed commitem.
- **Jedyny wyjątek: `redirects.empik`** (ustalone 14.09.2026). Adres karty
  produktu żyje tylko dopóki produkt jest w ofercie; gdy zniknie, link prowadzi
  na 404 — gorzej niż wyszukiwarka, na którą worker sam spada przy braku wpisu.
  Dlatego `scripts/empik-redirects.mjs --usun-martwe` kasuje wpisy zestawów
  nieobecnych w bieżącym zrzucie. Dotyczy wyłącznie tego klucza i wyłącznie
  tego skryptu; ceny i pozostałe mapy linków są dalej append-only.
- Sekretów (tokeny, klucze) nigdy nie commitować — są w zmiennych środowiska.
- Push na `main` robimy z lokalnej gałęzi roboczej:
  `git push origin <gałąź>:main` (lokalny `main` jest rozjechany — nie ruszać);
  przy konflikcie `git fetch origin main` + rebase.

## Kto publikuje (ustalone 14.09.2026)

**Sesja pushuje na `main` sama**, gdy zmiana przeszła build (`npm run build`)
i walidację danych (JSON parsuje się, liczba wpisów nie zmalała). Użytkownik nie
jest bramką dla każdej zmiany.

Gałąź robocza z polecenia systemowego (`claude/...`) jest miejscem **pracy**, nie
miejscem docelowym. Zostawienie tam gotowej zmiany i napisanie „zgodnie z
CLAUDE.md nie pushowałem" to błąd — reguła powyżej mówi *jak* pushować, nie
*czy*. Gałęzie, które zostają po sesji, są do skasowania.

Wyjątki — wtedy pytamy przed pushem:
- użytkownik prosił, żeby czegoś nie publikować, albo praca jest w toku;
- zmiana kasuje dane (jedyny dopuszczony przypadek: `redirects.empik`);
- zmiana dotyka `src/worker.js`, `wrangler.toml` albo przekierowań — awaria
  workera zdejmuje cały serwis, nie jedną podstronę;
- zmiana wchodzi do dokumentów wspólnika w `redakcja/` (trzymamy je verbatim).

Po pushu podajemy w odpowiedzi hash i jednozdaniowy skutek („1426 cen Ceneo
w hubach"), żeby było co zweryfikować bez czytania diffa.

## Zanim postawisz tezę o dostępach

`node scripts/diagnoza.mjs` — zmienne środowiska (same nazwy, nigdy wartości),
stan repo, świeżość danych i **realne wywołania** do Cloudflare, Search Console,
Tradedoublera, Firecrawla i produkcji.

**Stan na 14.09.2026: robi to jeden runner — Kontroler.** Pozostałe sześć ma
w promptach własne, starsze sprawdzenia albo nie ma żadnych. Nie pisz więc
„runnery odpalają diagnozę" jako o fakcie; to jest kierunek, nie stan.

Powód: 14.09.2026 trzy razy w jednej sesji padło zdanie o brakującym dostępie,
które nie było prawdą („Kontroler nie ma poświadczeń”, „LEGO.com nie ma linków”,
„klient TD nie jest aktywny”). Nie piszemy o uprawnieniach z pamięci —
sprawdzamy, a gdy sprawdzić się nie da, piszemy „nie sprawdzono”.

## Gdzie co leży

- `scripts/README.md` — każdy skrypt z informacją, **kto go uruchamia**:
  runner cyklicznie, build automatycznie, czy człowiek na żądanie.
- `materialy/README.md` — rozdział na treści trwałe, datowane raporty
  i pliki generowane przez skrypty, plus gdzie wrzucać nowe.

## Zadania cykliczne

Harmonogram runnerów, ich ID i zasady edycji: `materialy/zadania-cykliczne.md`.
Sekcja „Zrzut" w tym pliku jest **generowana** — leży między znacznikami
`HARMONOGRAM:START` i `HARMONOGRAM:KONIEC`, przepisuje ją
`scripts/harmonogram-z-konta.mjs` z odpowiedzi `list_triggers`, a uruchamia
Kontroler w cotygodniowym raporcie. Nie poprawiaj jej ręcznie.
Łowca korzysta z `scripts/feedy-lego.py` (wyciąg ofert LEGO z feedów), Ceneo
odświeża `scripts/ceneo-feed.mjs`.

## Rejestr afiliacji

`src/data/afiliacje_rejestr.json` — jedno źródło prawdy o sieciach, statusach,
prowizjach i formatach linków. Aktualizować przy każdej zmianie statusu.
Decyzje projektowe: sekcja `_meta.decyzje` oraz log w `redakcja/README.md`.
