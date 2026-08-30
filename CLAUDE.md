# tylkoklocki.pl — serwis afiliacyjny o LEGO

Astro (statyczny) + Cloudflare Worker (`src/worker.js`: obrazy `/img/`,
przekierowania afiliacyjne `/idz/<sklep>/<nr>`) + R2. Deploy automatyczny
z gałęzi `main`. Dane serwisu w `src/data/*.json`, aktualizowane przez
zadania cykliczne (runnery) i sesje robocze.

## Podzial pracy
   - `redakcja/wspolpraca.md` — miedzy Piotrem a Markiem (ludzie)
   - `NARZEDZIA.md` — miedzy Claude Code a Cowork (narzedzia)
   - `RUNBOOK.md` — wiedza operacyjna, pulapki, procedury awaryjne
   - `DZIENNIK.md` — biezace zadania i wymiana miedzy sesjami

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

`.claude/settings.json` wycisza w tym repo 14 skilli z konta niezwiązanych
z klockami (KDP, XTB, angielski, nieruchomości, faktury, gabinet) —
przez `skillOverrides: "off"`. W pozostałych projektach działają normalnie; to
ustawienie obowiązuje wyłącznie tutaj. Powód nie jest oszczędnościowy: lista
skilli ma budżet ~1% okna kontekstu, a po jego przekroczeniu opisy są ucinane
i skille przestają się poprawnie dobierać. Plik jest commitowany, więc działa
też w sesjach przez przeglądarkę, które startują ze świeżego klona.

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
- Sekretów (tokeny, klucze) nigdy nie commitować — są w zmiennych środowiska.
- Push na `main` robimy z lokalnej gałęzi roboczej:
  `git push origin <gałąź>:main` (lokalny `main` jest rozjechany — nie ruszać);
  przy konflikcie `git fetch origin main` + rebase.

## Zadania cykliczne

Harmonogram runnerów, ich ID i zasady edycji: `materialy/zadania-cykliczne.md`.
Łowca korzysta z `scripts/feedy-lego.py` (wyciąg ofert LEGO z feedów), Ceneo
odświeża `scripts/ceneo-feed.mjs`.

## Rejestr afiliacji

`src/data/afiliacje_rejestr.json` — jedno źródło prawdy o sieciach, statusach,
prowizjach i formatach linków. Aktualizować przy każdej zmianie statusu.
Decyzje projektowe: sekcja `_meta.decyzje` oraz log w `redakcja/README.md`.
