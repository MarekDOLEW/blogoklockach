# Analiza zadań cyklicznych (Routines) — 30.09.2026

Źródła: odczyt z konta 30.09 ~08:39 PL (`triggers.json`, 17 Routines, pełne prompty),
`materialy/zadania-cykliczne.md`, `materialy/routine-prompty.md` (kopia z 28.09),
`scripts/README.md`, `NARZEDZIA.md`, `RUNBOOK.md` (sekcje o runnerach), `DZIENNIK.md`
(wpisy 16–29.09 + Ustalenia trwałe), `materialy/audyt-2026-09-22.md`,
`materialy/audyt-koncowy-2026-09-16.md` §2, `materialy/kontroler-2026-09-28.md`,
`git log --since=2026-09-16`, daty w `src/data/oferty_feed.json` / `sety.json`.

Które Routines są LEGO: **14 z 17** (11 cyklicznych, z tego 1 wyłączony; 2 jednorazowe
przypięte do sesji Code; **„Empik co tydzien" JEST LEGO** — prompt to dosłownie
`uruchom skill: klocki-ceny-empik`). Spoza serwisu są trzy: „Angielski", „inwestycja IV
kwartal", „Herzfaden". Generator harmonogramu wrzuca „Empik co tydzien" do tabeli
„Pozostałe", bo nie ma prefiksu `LEGO` ani promptu z repo — to błąd klasyfikacji.

Prompty na koncie są **znak w znak zgodne** z kopią w `routine-prompty.md` z 28.09
(11/11 porównanych) — od poniedziałku nikt nic nie zmienił w panelu.

---

## A. Tabela Routines LEGO (stan konta 30.09.2026, czas PL = CEST)

Skrót statusu: „last_run" = pole konta (mówi tylko, że tura się nie wywróciła);
„commit" = dowód w `main`. Model: pole `model` jest puste u wszystkich Routines LEGO
(domyślny konta); model trwałej sesji wg dokumentów i co-authora commitów.

| # | Co robi | Kto (nazwa · sesja · model) | Kiedy (cron UTC → PL) | Status (last_run · commit) | Wejście | Wyjście |
|---|---|---|---|---|---|---|
| 1 | Dogrywa do R2 zdjęcia, których worker sam nie pobierze (od 27.09 wszystkie źródła) | „LEGO 04:30 — Zdjęcia → R2" · świeża sesja (z panelu), 6 konektorów, bez repo w źródłach · model domyślny | `30 2 * * *` → codziennie 04:30 (dryf do 04:40) | ✅ 30.09 04:40, 47 s · bez commitów z założenia | `obrazy.json`, `galerie.json`, `zdjecia.json`; `CF_R2_TOKEN` | kubełek R2 `tylkoklocki-obrazy`, ślad `_stan/r2-obrazy.json` |
| 2 | Nowości i przecieki: Brickset/PromoBricks/StoneWars → nowe sety, luki katalogu, sygnały wycofań do DZIENNIKA | „LEGO 05:00 — Scout nowości" · trwała `session_012AZejbFzsfzkTh4FPaAkVg` · Opus 5 | `0 3 * * *` → codziennie 05:00 | ✅ 30.09 05:04 · commity 22, 23, 24, 25, 26, **(27, 28 brak — weekend, „bez nowości")**, 29, 30.09 (30.09 05:07 i 05:08) | Brickset, PromoBricks, StoneWars; `known_sets.json`, `oferty_feed.json` (luki) | `sety.json`, `known_sets.json`, `przecieki.json`, wpis SCOUT w `DZIENNIK.md`; mail `nowosci` (Resend) gdy był commit |
| 3 | Tygodniowy zaciąg listingu lego.pl (Firecrawl, ~75 kredytów) + RRP + linki LEGO + Rebrickable + Ceneo/Lidl (TD) + Smyk | „Dane wt 05:30 — katalog LEGO.pl + ceny Ceneo i Smyk" · trwała `session_011Ced7USAHUBBsCPZ1os3F9` · Sonnet 5 (co-author commita) | `30 3 * * 2` → wtorek 05:30 (dryf 05:34) | ✅ 29.09 05:34 · **commit 0c2d3fc 29.09 05:52 PL z tej sesji** — pierwszy prawdziwy przebieg runnera zaliczony; UWAGA: tytuł commita skopiowany z 22.09 i mówi „(sesja Code za runnera)", co jest nieprawdą | `FIRECRAWL_KEY`, `TD_TOKEN`; `feedy.json`, `redirects.smyk` | `oferty_feed.json` (`lego`, `ceneo`, `lidl`, `smyk`), `sety.json`, `katalog.json` (status/ekskluzyw/`lego_pl_widziano`/nowe z Rebrickable), `rrp_potwierdzone.json`, `redirects.json` (`lego`, `ceneo`, `lidl`), `obrazy.json`; build |
| 4 | Wycofania: lego.com „Ostatnie sztuki", Brickset, StoneWars/PromoBricks + sygnały Scouta | „LEGO pon 06:10 — Wycofania" · trwała `session_01KfWF14fJvwK78sBVG6XAz8` · Fable 5 | `10 4 * * 1` → pon 06:10 | ✅ 28.09 06:10 · commit 644240f 28.09 06:14 PL; **21.09 bez commita** (nic się nie zmieniło? — prompt pozwala nie commitować; nie zweryfikowano) | źródła www, `DZIENNIK.md` (SCOUT), `katalog.json` (tylko odczyt) | `wycofania.json` (jedyny autor), adnotacje `→ Wycofania` w `DZIENNIK.md`; `audyt-wycofan.mjs` raport; mail `wycofania` |
| 5 | Przepisuje harmonogram i prompty z konta do repo (`list_triggers`) | „LEGO pon 07:45 — Harmonogram z konta" · trwała sesja Code `session_01XzZ5hRoRbmYj4cURMXc2ES` (**nie ta bieżąca**) · sesja Code | `45 5 * * 1` → pon 07:45 | ✅ 28.09 07:45 · commit 3023be7 28.09 07:47 PL | `list_triggers` (jedyna sesja z konektorem `Claude_Code_Remote`) | `materialy/zadania-cykliczne.md` (sekcja Zrzut), `materialy/routine-prompty.md` |
| 6 | Radar konkurencji: fanklockow, faniklockow, zklockow, promoklocki (+ klockoradar wg `_meta`) | „LEGO 08:00 — Radar konkurencji" · trwała `session_01UFkqKNwQexnxLN34HotM4G` · Opus 5 | `0 6 * * *` → codziennie 08:00 (dryf 08:17) | ✅ 30.09 08:17 · commity codziennie 22–30.09 (9/9) | strony konkurencji, `konkurencja_baza.json` | `konkurencja_baza.json`, wpis „RADAR · Do zrobienia" w `DZIENNIK.md`; mail `konkurencja` gdy commit |
| 7 | Uruchamia skill zrzutu Empiku w chmurze | „Empik co tydzien" · świeża sesja (z panelu, `permission_mode: auto`), 7 konektorów (w tym `Claude_Code_Remote`, Firecrawl) · model domyślny | `CRON_TZ=Europe/Warsaw 0 8 * * 1` → pon 08:00 (dryf 08:11; 28.09 odpalił 08:59) | ✅ 28.09 08:59–09:21 (22 min) · **żaden artefakt**: dane Empiku z 28.09 (a460501 08:56 PL) pochodzą z pliku od Marka wgranego do sesji Code 08:40, czyli PRZED startem tego Routine | prompt: `uruchom skill: klocki-ceny-empik` (skill wymaga lokalnej przeglądarki; Empik daje 403 z chmury, Playwright w kontenerze = ERR_CONNECTION_RESET) | nic sprawdzalnego; 22 min limitu konta co poniedziałek |
| 8 | Mail-przypominajka o ręcznym zrzucie Empiku | „LEGO pon 08:15 — Przypomnienie: zrzut Empiku" · świeża sesja (z panelu) · model domyślny | `15 6 * * 1` → pon 08:15 | ✅ 28.09 08:16, 81 s · bez commitów z założenia | `RESEND_API_KEY`, `raporty_mail.json` (`przypomnienie`) | 1 mail na kontakt@ |
| 9 | Ceny z feedów ME/PK/Allegro (+ Lidl codziennie, Smyk w piątki, kontrola linków w poniedziałki, historia cen), deale, posty dealowe, mail „podejrzany rynek" | „LEGO 08:30 — Łowca promocji" · trwała `session_01SdxKtAvW8UmktsuXrsPYga` (od 22.09) · Fable 5 | `30 6 * * *` → codziennie 08:30 (dryf 08:41) | ✅ 29.09 08:42 (30.09 jeszcze przed slotem w chwili odczytu) · commity codziennie 22–29.09 (8/8), commit ląduje 08:58–09:15 PL; 28.09 dodatkowy commit 45acf8f „odzyskane 732 wpisy historii cen" po zderzeniu z importem Empiku | `feedy-lego.py` (feedy ME/PK/Allegro/TD), `ceny_baza.json`, `wycofania.json`, opcjonalnie `lego-empik.json` | `oferty_feed.json` (`mediaexpert`, `planetaklockow`, `allegro`, `lidl`, pt `smyk`), `ceny_baza.json`, `redirects.json` (PK, allegro, ME, lidl), `sety.json`, `obrazy.json`, `src/pages/deale/*.md`, `historia-cen/RRRR-MM.jsonl`, pon `materialy/kontrola-linkow-*.md`; maile `promocje` (zawsze), `podejrzane`, `linki` |
| 10 | Raport tygodnia: diagnoza, kliki, prowizje, GSC, indeksacja, harmonogram (czyta), archiwum dziennika, „zadania bez właściciela" | „LEGO pon 09:00 — Kontroler" · trwała `session_01M8qMJFfKHEozBSGXjAKP4n` · Opus 5 | `0 7 * * 1` → pon 09:00 (dryf 09:21) | ✅ 28.09 09:21 · commit 37258ab 28.09 09:35 PL (raport + archiwum 8 wpisów); 22.09 przebieg próbny | `diagnoza.mjs`, `kliki-raport.mjs`, `prowizje-raport.mjs`, `gsc-raport.mjs`, GSC URL Inspection, `materialy/kontrola-linkow-*.md`, `DZIENNIK.md`, build | `materialy/kontroler-RRRR-MM-DD.md`, `DZIENNIK.md` + `materialy/dziennik-archiwum-*.md`; PDF przez SendUserFile; mail `kontroler` (Marek + Piotr) |
| 11 | Alerty „Obserwuj zestaw": porównuje ceny z repo z progiem, wysyła maile, kasuje niepotwierdzone zapisy | „LEGO 09:30 — Alerty cen" · świeża sesja (z panelu) · model domyślny | `30 7 * * *` → codziennie 09:30 (dryf 09:34–09:36) | ✅ 29.09 09:36, 26 s · bez commitów z założenia | R2 `_obserwuj/`, `oferty_feed.json`/`sety.json` z klonu `--depth 1`; `CF_R2_TOKEN`, `RESEND_API_KEY` | maile do czytelników; kasowanie obiektów w R2 |
| 12 | Backfill cen katalogowych z Brickset/promoklocki | „LEGO co 8h — Backfill cen katalogowych" · trwała `session_01JSfUBJxddBbATeaXhQ6efS` · Fable 5 | `0 2,10,18 * * *` → 04/12/20 | ❌ **wyłączony**, nigdy nie odpalony pod tym ID (odtworzony 31.08) | `katalog.json`, Brickset/promoklocki | `katalog.json.cena_katalogowa` — dziś nikt |
| 13 | Jednorazowo: czy `/promocje-lego/`, `/` i `/deale/` (301) są w indeksie po wdrożeniu 29.09 | „GSC: czy /promocje-lego/ w indeksie" · przypięty do bieżącej sesji Code `session_011GrNNd6UVQFF1NamoPaQMS` | `run_once_at` 02.10 08:52 PL | ⏳ czeka | GSC URL Inspection (`GSC_KEY_JSON_B64`) | linia w `DZIENNIK.md` (wpis 29.09 12:40), push |
| 14 | Jednorazowo: raport kliknięć 14 dni po CRO (odniesienie: 139 klików / 14 dni z 25.09) | „Raport kliknięć — skutek CRO" · bieżąca sesja Code | `run_once_at` 09.10 09:00 PL | ⏳ czeka | `kliki-raport.mjs --dni 14` | tabela przed/po, „→ zamknięte" w `DZIENNIK.md`, push |

Spoza serwisu (ten sam limit konta): „Angielski" pon 07:00 PL (`0 5 * * 1`, Fable 5,
28.09 OK), „inwestycja IV kwartal" pon 10:00 PL (`0 8 * * 1`, 28.09 OK, 8 min),
„Herzfaden" śr 11:00 PL (`0 9 * * 3`, Fable 5, 23.09 OK).

**Przebiegi vs commity za 14 dni (16–30.09):**

| Runner | Rytm | Przebiegi oczekiwane w oknie 22–30.09 (od ostatniego delete+create) | Commity | Werdykt |
|---|---|---|---|---|
| Łowca | codziennie | 8 (22–29.09; 30.09 po odczycie) | 8 | 8/8 |
| Radar | codziennie | 9 (22–30.09) | 9 | 9/9 |
| Scout | codziennie | 9 | 7 (brak 27, 28.09) | zgodne z promptem („brak nowości = brak commita"); wzór weekendowy powtarza się 3. raz (13, 19–20, 27–28.09) |
| Wycofania | pon | 2 (21, 28.09) | 1 (28.09) | 21.09 bez śladu — nie sprawdzono, czy „bez zmian" |
| Dane wt | wt | 1 (29.09; 22.09 zrobiła sesja Code) | 1 | 1/1, ale tytuł commita fałszywy |
| Kontroler | pon | 1 (28.09) | 1 | 1/1 |
| Harmonogram | pon | 1 (28.09) | 1 | 1/1 |
| Empik co tydzien | pon | 1 (28.09) | 0 własnych | brak artefaktu |
| R2 / Alerty / Przypomnienie | codz./codz./pon | — | — (bez pushu) | status OK, artefakty poza repo, nie sprawdzono (R2 `_stan`, log Resend) |

Poniedziałkowe okno (PL): 04:30 R2 → 05:00 Scout → 06:10 Wycofania → 07:00 Angielski →
07:45 Harmonogram → 08:00 Radar → ~08:11 Empik co tydzien → 08:15 Przypomnienie →
08:30 Łowca → 09:00 Kontroler → 09:30 Alerty → 10:00 inwestycja. **12 zadań w 5,5 h**
na jednym limicie konta; 21.08 taki tłok wywrócił harmonogram.

---

## B. Nakładanie się

### B1. Te same pliki danych — kto pisze, kiedy

| Plik | Autorzy (kolejność w dobie) | Zderzenie? |
|---|---|---|
| `sety.json` | Scout 05:00–05:10 · Dane wt (wt) 05:30–05:55 · Łowca 08:30–09:15 · sesje Code (Empik pon, x-kom, karty Piotra, recenzje) | Runnery są rozsunięte; **realne zderzenie: sesje Code w oknie 08:30–09:30** (patrz B3) |
| `oferty_feed.json` | Dane wt (`lego`, `ceneo`, `lidl`, `smyk`) · Łowca (`mediaexpert`, `planetaklockow`, `allegro`, `lidl` codziennie, `smyk` pt) · Code (`empik` pon) | Klucze rozłączne; Lidl pisany dwa razy we wtorek (Dane wt krok 6 + Łowca przez `odswiezanie: codziennie`) — nieszkodliwe |
| `redirects.json` | `feedy-lego.py` (ME/PK/Allegro) codziennie · `ceneo-feed.mjs` (ceneo, lidl) · `lego-redirects.mjs` wt · `empik-redirects.mjs` (Code, pon) · `xkom-redirects.mjs` (Code) | Gałęzie rozłączne; jedyne kasowanie: `empik`/`xkom --usun-martwe` |
| `ceny_baza.json` | Łowca (minima) · `zrzut-import.mjs` (Empik/x-kom, Code) | Bez zderzeń runner–runner |
| `katalog.json` | Dane wt (status, ekskluzyw, `lego_pl_widziano`, Rebrickable) · Scout (`bez_rrp`) · Code (`kontrola-rrp --napraw`) | Wycofania NIE edytują — zgodne z promptem |
| `historia-cen/*.jsonl` | Łowca (przez `feedy-lego.py`) | **28.09 Łowca sam zgubił 732 wpisy** przy nakładaniu danych na stan po imporcie Empiku (45acf8f) |
| `DZIENNIK.md` | Scout (sygnały), Radar (Do zrobienia), Wycofania (adnotacje), Kontroler (archiwum), Code | Wszyscy wstawiają pod tą samą linią `WPISY PONIŻEJ` → każdy równoległy push to konflikt tekstowy przy rebase; dotąd rozsunięte godzinami |
| `obrazy.json` | prebuild, Łowca, Dane wt | bez zderzeń |

### B2. Dublety funkcjonalne

- **Empik: dwa Routines + import ręczny.** „Empik co tydzien" (08:00, `uruchom skill:
  klocki-ceny-empik`, 22 min w chmurze) i „Przypomnienie: zrzut Empiku" (08:15, mail).
  Skill wymaga lokalnej przeglądarki — z kontenera Empik daje 403, Playwright
  ERR_CONNECTION_RESET (`NARZEDZIA.md`, „Zmierzone limity Code"). Dane 28.09 weszły
  z pliku od Marka (sesja Code, 08:40 PL) przed startem Routine (08:59). Kontroler 28.09
  zauważył dublet, ale nie rozstrzygnął, który zadziałał — teraz wiadomo: **żaden
  z dwóch nie odświeża cen, robi to ręcznie Marek + Code.**
- **Lidl:** codziennie Łowca i dodatkowo wtorkowy Dane wt (krok 6 bierze wszystkie aktywne
  feedy TD). Dwa odczyty w jeden dzień — koszt kilku minut, brak szkody.
- **Smyk:** wt Dane wt + pt Łowca — zamierzone (decyzja 20.09).
- **Kontrola linków:** tylko Łowca (pon) — Kontroler tylko czyta; zgodne (28.09: plik
  71c9997 07:06 UTC, Kontroler 07:21 UTC — 15 min zapasu).
- **Sygnały wycofań:** Scout pisze do DZIENNIKA, Wycofania czytają — bez dubla.

### B3. Zderzenia w czasie

- **Import Empiku ręcznie o 08:40 PL vs Łowca 08:30–09:15** — 28.09 to się zdarzyło:
  Code pushnął Empik 08:56 PL, Łowca (start 08:41) przy pushu trafił na konflikt,
  „przełożył" dane na origin/main i zgubił własne 732 wpisy historii cen; odzyskane
  osobnym commitem. **Reguła „konflikt → pull, nanieś ponownie" w prompcie Łowcy nie
  obejmuje `historia-cen`.** To jest jedyne udokumentowane zderzenie git dwóch pisarzy
  `src/data` w tym oknie.
- **Alerty 09:30 vs Łowca 08:30:** commity Łowcy lądują 08:58–09:15 PL, Alerty startują
  09:34–09:36 — alerty idą na **świeżych** cenach, zapas 20–35 min. 23.09 (zacięcie
  40 min) commit był 09:15, więc nadal przed. Ryzyko: każde wydłużenie Łowcy (od 23.09
  sprawdza ~1 300 kart PK, +10 min) zjada zapas; prompt Alertów tylko odnotowuje
  brak dzisiejszego commita, skrypt pomija oferty starsze niż 2 dni.
- **Zdjęcia → R2 04:30 przed Scoutem (05:00) i Łowcą (08:30):** nowe zdjęcia z dnia
  czekają w R2 do następnego ranka (~20 h pustej miniatury dla nowości).
- **Dane wt 05:30 (wt) vs Scout 05:00:** Scout kończy ~05:10, Dane wt startuje 05:34 —
  bez nakładania; pushe przez rebase.
- **Radar 08:00–08:20 vs Empik co tydzien ~08:11 (pon):** różne minuty, ten sam limit;
  generator nie umie rozwinąć `CRON_TZ`, więc tej pary nie widzi w detektorze kolizji.
- **Kontroler 09:21 vs Łowca 09:04–09:15 (pon):** Kontroler czyta plik kontroli linków
  z commita Łowcy; przy zacięciu Łowcy jak 23.09 pliku by nie było i raport dostałby
  „kontrola się nie wykonała" (fałszywie).
- **Zmiana czasu 25.10:** Łowca zjedzie na 07:30 PL i będzie łapał wczorajszy feed ME
  (feed ląduje ~07:40); Empik co tydzien z `CRON_TZ` zostanie na 08:00 PL, reszta
  zjedzie o godzinę. Nikt nie ma przypomnienia poza tabelą w dokumencie.

---

## C. Dziury — tematy bez właściciela

### C1. Źródła danych: kto, jak często, kiedy ostatnio

| Źródło | Kto odświeża | Rytm | Ostatnio (dane) | Uwaga |
|---|---|---|---|---|
| Media Expert (feed) | Łowca / `feedy-lego.py` | codziennie | 29.09 (738 cen) | OK |
| Planeta Klocków (feed + karta OutOfStock) | Łowca | codziennie | 29.09 (1 117) | OK; zdjęcia R2 codziennie 04:30 |
| Allegro (feed „tylko LEGO") | Łowca | codziennie | 29.09 (6 079) | feed bywa 404 (25.09) — bez zapasowego (decyzja Marka) |
| Lidl (TD) | Łowca (codziennie) + Dane wt | codziennie | 29.09 (81) | dubel wtorkowy |
| Ceneo (TD) | Dane wt | wt | 29.09 (1 631) | OK |
| Smyk (karty) | Dane wt + Łowca pt | wt, pt | 29.09 (644) | OK |
| LEGO.com (Firecrawl) | Dane wt | wt | 29.09 (956) | OK; kredyty odnowione 28.09 |
| Empik (zrzut lokalny) | **Marek ręcznie → Code** | pon | 28.09 (4 378) | dwa Routines wokół tego nic nie odświeżają (B2) |
| **x-kom** | **nikt cyklicznie**; skill `klocki-ceny-xkom` (24.09) nigdy nie użyty do zrzutu — dwa importy (23.09, 28.09) zrobił Code z mailingów SalesMasters + Firecrawl | brak (skill mówi „docelowo raz w tygodniu") | 28.09: 117 ofert w `sety.json`, 126 linków; **0 wpisów `xkom` w `oferty_feed.json`** | brak Routine, brak przypominajki, brak w tabeli „Punkty ręczne" NARZEDZIA.md; oferty mają `wazne_do` 18.10, potem znikną i nikt nie odświeży |
| RRP / ceny katalogowe | Dane wt (`wczytaj-rrp` z lego.pl) + Rebrickable (krok 5) + Scout (`bez_rrp`) | wt | 29.09 | Backfill wyłączony — jego pula (EOL bez ceny) nie ma właściciela; `kontrola-rrp.mjs` (bramka sanity) nikt nie uruchamia cyklicznie (README: „sesja po każdym imporcie") |
| Historia cen | Łowca | codziennie | 29.09 | OK, ale bez ochrony przy konflikcie (B3) |
| Kontrola linków | Łowca pon | tyg. | 28.09 (0 martwych / 133) | Allegro/Empik/ME/LEGO nie sprawdzalne z chmury — 17 z 150 „blokada" |
| R2 / zdjęcia | Routine 04:30 | codziennie | 30.09 | `--sprawdz` (HEAD produkcji, martwe źródła) nikt nie uruchamia cyklicznie |
| GSC — API (inspekcja 8 adresów, kliki/wyświetlenia) | Kontroler | pon | 28.09 | OK |
| GSC — liczba zaindeksowanych (tylko panel) | **Marek ręcznie** | „co 2 tyg." | dane z 18.09 (odczyt 22.09) | Kontroler prosi w raporcie; brak Routine-przypominajki |
| Raport kliknięć | Kontroler (7 dni) + jednorazowy 09.10 (14 dni) | pon | 28.09 | OK |
| Prowizje z API (TD, Adtraction, Performers) | Kontroler | pon | 28.09 | OK |
| Prowizje Allegro / webePartners (panele) | **Marek ręcznie** | brak rytmu | nie sprawdzono | decyzja 22.09: „zostawiamy bez odczytu" — świadoma dziura |
| Archiwizacja dziennika | Kontroler | pon | 28.09 (8 wpisów) | OK |
| Harmonogram do repo | sesja Code (Routine) | pon | 28.09 | przypięty do starszej sesji Code `session_01XzZ5…`, nie bieżącej — archiwizacja tej sesji wyłączy trigger po cichu (`auto_disabled_session_gone`) |
| Kontekst sesji runnerów (limit 1 M) | **nikt** | — | 22.09: Scout 676 k, Wycofania 512 k, Radar 450 k, Łowca nowa | Scout ~+20 k/dzień → dziś szacunkowo ~800 k, próg 850 k z Ustaleń trwałych za kilka dni; żaden Routine nie woła `get_session` |
| Skille `.skill` na koncie | Marek ręcznie | po zmianie | 21.09 (empik); `klocki-ceny-empik` opisuje 3 przebiegi, Marek robi 2 (DZIENNIK 28.09) | rozjazd bez sygnału |
| OG dla tekstów (`generuj-og.py`) | sesja po tekście | ad hoc | — | brak kontroli „artykuł bez OG" |
| Kolejka redakcyjna / noindex-do-opisania / zestawy-bez-opisu | człowiek na żądanie | ad hoc | — | świadomie ręczne |
| `oferty-przeterminowane.mjs` | nikt | — | 22.09: 0 przeterminowanych | strona i tak filtruje |
| Diagnoza (`diagnoza.mjs`) | Kontroler (pełna); Łowca, Wycofania, Dane wt (`--szybko`) | pon / codziennie | 28.09 | Scout, Radar, R2, Alerty, Przypomnienie — bez diagnozy (audyt 22.09: „DO ZROBIENIA") |
| Zmiana czasu 25.10 (cron Łowcy `30 7`) | nikt | jednorazowo | — | brak `run_once_at` |
| Backfill „BACKFILL ZAKOŃCZONY" | — | — | — | trigger wyłączony, ale nadal na liście; `zadania-cykliczne.md` każe „nie włączać bez bramki" — martwy balast |

### C2. Zadania z listy pytania, które nie mają Routine ani rytmu

- import x-kom (najbardziej konkretna luka: dane z `wazne_do` wygasną 18.10),
- odczyt liczby zaindeksowanych z panelu GSC,
- pilnowanie kontekstu sesji runnerów,
- przypomnienie o zmianie czasu 25.10,
- audyt R2 `--sprawdz` (martwe źródła zdjęć),
- `kontrola-rrp.mjs` po imporcie cen (bramka sanity bez właściciela od wyłączenia Backfillu),
- OG dla nowych tekstów.

---

## D. Rozjazdy dokumentacji vs stan konta

1. **`NARZEDZIA.md` linia 116** i **`zadania-cykliczne.md` linie 106–108**: Kontroler jako
   `trig_01EDEhtPiW4AVSAiGg9Co1mx` — na koncie jest `trig_0167qmnWn3Qjjz8HTwZU1uEP`
   (odtworzony 22.09 po południu; „Historia zmian" to wie, akapit „Zostaje jeden" nie).
2. **`zadania-cykliczne.md`, sekcja generowana (28.09)**: Kontroler i Dane wt „bez przebiegu
   od utworzenia" — od tego czasu oba przebiegły (28.09 09:21, 29.09 05:34). Zgodne
   z datą zrzutu, ale każdy, kto czyta plik między poniedziałkami, widzi stan nieaktualny;
   raport Kontrolera 28.09 też mówi „Dane wt nadal bez przebiegu".
3. **Commit 0c2d3fc (29.09) podpisany „(sesja Code za runnera")** — zrobił go runner
   (sesja `session_011Ced7USAHUBBsCPZ1os3F9`, 18 min po triggerze). Prompt Dane wt każe
   commitować z tytułem stałym, runner skopiował z `git log` poprzedni tytuł. Kontroler
   w poniedziałek policzy to jako „brak commita runnera" albo jako pracę Code.
4. **Generator harmonogramu**: (a) `CRON_TZ=…` „nieobsługiwane" — brak w detektorze kolizji
   i w tabeli „Zmiana czasu"; (b) „Empik co tydzien" trafia do „Pozostałe Routines"
   (klasyfikacja: prefiks `LEGO` / env / prompt z repo), więc jego prompt nie jest kopiowany
   do `routine-prompty.md`; (c) jednorazowe Routines sesji Code („GSC…", „Raport kliknięć")
   też lądują w „Pozostałe" bez promptów.
5. **`zadania-cykliczne.md` „Zmiana czasu"**: brak wierszy Harmonogram (07:45→06:45),
   Empik co tydzien (zostaje 08:00 — `CRON_TZ`), Przypomnienie jest; tabela „Poniedziałek
   rano" jest jawnie oznaczona jako z 14.09 — OK.
6. **`zadania-cykliczne.md` „Modele"**: „Zgodne ze stanem faktycznym sesji na 31.08" —
   Łowca to nowa sesja z 22.09 (Fable 5 potwierdzone co-authorem), Dane wt Sonnet 5
   potwierdzony; pole `model` na koncie puste u wszystkich LEGO — dokument nie mówi,
   skąd wie o Opusie u Scouta/Radara/Kontrolera (z `create_session`; niesprawdzalne
   z `list_triggers`).
7. **`RUNBOOK.md` ~l. 995**: bramka listingu „poniżej 1 000 produktów" vs prompt Dane wt
   „mniej niż 800 zestawów (22.09 było 938)" — inna jednostka i próg.
8. **`scripts/README.md`**: `kontrola-rrp.mjs` „Backfill przed commitem" — Backfill
   wyłączony od 30.08, więc w praktyce „nikt cyklicznie"; `generuj-og.py` „sesja" — bez
   rytmu. `zrzut-import.mjs` „Code (załącznik od Marka) … co tydzień po zrzucie" —
   dla x-komu nie ma żadnego rytmu.
9. **`NARZEDZIA.md` „Punkty ręczne"**: brak x-komu (skill od 24.09, punkt 3 „Co gdzie
   wrzucać" już go zna); brak „odczyt panelu GSC co 2 tygodnie"; wiersz „Routine założone
   z panelu" wymienia trzy, a są cztery (doszedł „Empik co tydzien").
10. **`NARZEDZIA.md` l. 113**: „Scout, Wycofania, Łowca, Radar, Backfill i Dane wt … trwałe
    sesje" — zgodne; ale zdanie „Cowork nie uruchamia tych zadań" stoi obok Routine
    „Empik co tydzien", który próbuje uruchomić skill Coworka w chmurze.
11. **`audyt-2026-09-22.md` A**: „Skrypty wołane z promptów istnieją 8 z 8", „Diagnoza
    w promptach 4 z 7 — DO ZROBIENIA Scout, Radar" — nadal niezrobione (prompty bez zmian).
12. **`materialy/kontroler-2026-09-28.md`**: „nie wiem, który Routine odświeżył Empik" —
    odpowiedź: żaden, plik od Marka do Code (DZIENNIK 28.09 08:40).
13. **`RUNBOOK.md` l. 1113 / 1179** i skill `klocki-ceny-empik`: mówią o jednym Routine
    przypominającym; drugiego („Empik co tydzien") nie zna żaden dokument poza zrzutem.

Zgodne (sprawdzone): nazwy, crony i sesje 11 Routines LEGO w `zadania-cykliczne.md`
i `routine-prompty.md` = konto; 11/11 promptów identyczne z kopią; wszystkie ID triggerów
w „Historii zmian" 22–23.09 aktualne; `scripts/README.md` „kto uruchamia" dla
`feedy-lego.py`, `ceneo-feed.mjs`, `smyk-odswiez.mjs`, `r2-obrazy.mjs`, `alerty-cen.mjs`,
`kontrola-linkow.mjs`, `historia-cen.mjs`, `harmonogram-z-konta.mjs`,
`archiwum-dziennika.mjs`, `wyslij-raport.py` zgadza się z promptami.

---

## E. Prompty

### E1. Skrypty i flagi — wszystko istnieje

Sprawdzone w `scripts/` dla każdego promptu: `feedy-lego.py`, `diagnoza.mjs --szybko`,
`firecrawl-legopl.mjs --wyjscie --rrp`, `lego-ceny.mjs --sucho`, `wczytaj-rrp.mjs
--zrodlo --sucho --nadpisz`, `lego-redirects.mjs --sucho`, `katalog-z-rebrickable.mjs
--sucho`, `ceneo-feed.mjs`, `smyk-odswiez.mjs --stare`, `generuj-obrazy.mjs`,
`porzadek-ofert.mjs`, `podejrzany-rynek-mail.mjs`, `empik-import.mjs --sucho`
(nakładka → `zrzut-import.mjs`, flaga tam), `empik-redirects.mjs --usun-martwe`
(→ `zrzut-redirects.mjs`), `r2-obrazy.mjs --sprawdz --optymalizuj`, `alerty-cen.mjs
--sucho`, `wyslij-raport.py --zadanie --tytul --plik --wstep`, `kliki-raport.mjs --dni
--wszystko`, `gsc-raport.mjs --dni`, `prowizje-raport.mjs --dni`, `archiwum-dziennika.mjs`,
`audyt-wycofan.mjs` (bez `--napraw`), `kontrola-rrp.mjs`, `harmonogram-z-konta.mjs`,
`kolejka-redakcyjna.py`, `src/pages/sitemap-zestawy.xml.js`. **0 brakujących.**
Wszystkie klucze `raporty_mail.json` z promptów (`nowosci`, `konkurencja`, `wycofania`,
`promocje`, `kontroler`, `przypomnienie`, `podejrzane`, `linki`) — README je potwierdza.

### E2. Za długie / kruche

| Prompt | Znaków | Problem |
|---|---|---|
| Łowca | 10 194 | Najdłuższy; miesza reguły trwałe z historią („22.09 audyt wykazał 905…", „23.09 tak stanęły ceny"), progi liczbowe (Allegro 4 000–10 000, ME ~750, PK ~1 300) wpisane na sztywno — każda zmiana feedu = delete+create; brak reguły dla `historia-cen` przy konflikcie; WebFetch kart PK „w zasięgu 15%" pozostaje mimo że `feedy-lego.py` od 23.09 sprawdza karty sam (dubel roboty). |
| Kontroler | 9 801 | Zbiór zakazów po kolejnych pomyłkach („NIE pisz że…", „nie proponuj ponownie…") — 6 takich klauzul; punkty odniesienia (24.08, 15.09, 22.09) rosną z każdym tygodniem; sekcja INDEKSACJA wymaga `npm run build` i ręcznego POST do API — kandydat na skrypt. |
| Scout | 8 338 | Sekcja „GIT I PAMIĘĆ" to odpowiedź na jeden incydent (22.09) z konkretnymi hashami; drabina pewności przecieków i format wpisu do DZIENNIKA — OK, ale luki katalogu + bez_rrp + Education to trzy kolejne warstwy wyjątków. |
| Dane wt | 5 062 | Poprawny i skryptowy; kruchość: liczby bramek (800 zestawów, „na EOL < 150", „nowo dostepny < 100") w prompcie, nie w skrypcie. |
| Wycofania | 4 338 | OK; wymaga lego.com (403) — prompt to wie. |
| Alerty | 1 515 | `git log -1 --grep="Łowca"` na klonie `--depth 1` widzi tylko HEAD — gdy ostatni commit na main nie jest Łowcy (np. Code pushnął po 09:15), test daje fałszywe „Łowca dziś nie pushnął". |
| Empik co tydzien | 32 | `uruchom skill: klocki-ceny-empik` — bez repo w źródłach, bez przeglądarki; nie ma szans wykonać skillu; brak jakiegokolwiek kroku raportowania. |
| Backfill | 2 887 | Martwy (wyłączony), ale prompt nadal na koncie z wersją ze starymi źródłami (brickset/promoklocki/zklockow WebFetch). |

### E3. Bramki bezpieczeństwa

| Runner | Walidacja append-only | `npm run build` przed pushem | Diagnoza | Uwagi |
|---|---|---|---|---|
| Scout | tak (sety, przecieki) | **nie** | **nie** | pisze opisy do `sety.json`; build nie sprawdzany |
| Radar | tak (JSON, _meta) | nie (pisze tylko bazę + DZIENNIK) | **nie** | akceptowalne |
| Łowca | tak (każda gałąź) | **nie** — a tworzy `src/pages/deale/*.md`, które `sprawdz-kategorie.mjs` w prebuild może odrzucić → deploy Cloudflare pada na danych z produkcji | `--szybko` | jedyny runner piszący strony bez builda |
| Wycofania | tak | nie (JSON) | `--szybko` | OK |
| Dane wt | skrypty (append-only w kodzie) | **tak** | `--szybko` | wzorcowy |
| Kontroler | n/d | tak (dla indeksacji) | pełna | OK |
| R2 / Alerty / Przypomnienie | n/d (bez pushu) | n/d | **nie** | Alerty: sanity „>200 alertów = stop" jest |
| Harmonogram | n/d | nie (markdown) | nie | OK |

Wszystkie runnery z pushem mają ścieżkę awaryjną (patch/SendUserFile) i limit 3 prób
rebase — zgodne z Ustaleniami trwałymi.

---

## F. Rekomendacje

1. **Wyłączyć (docelowo skasować z panelu) „Empik co tydzien"** — 22 min limitu co
   poniedziałek bez artefaktu, bo skill wymaga lokalnej przeglądarki, której chmura nie ma;
   jeśli Marek chciał w ten sposób uruchamiać Cowork, to nie ten mechanizm.
2. **Zostawić „Przypomnienie: zrzut Empiku" i dopisać do jego maila x-kom** (jeden mail:
   „zrzut Empiku + zrzut x-komu, oba jako załącznik do Code") — x-kom nie ma dziś żadnego
   rytmu, a oferty z `wazne_do` 18.10 znikną bez następcy; edycja z panelu, świeża sesja.
3. **Przesunąć ręczny import Empiku/x-komu poza okno Łowcy** (reguła w NARZEDZIA „Co gdzie
   wrzucać": import po 09:30 PL albo przed 08:00) — 28.09 push Code o 08:56 kosztował
   Łowcę 732 wpisy historii cen.
4. **Łowca: dopisać do kroku „konflikt → nanieś ponownie", że nanoszenie obejmuje
   `src/data/historia-cen/`** (albo w skrypcie: `historia-cen.mjs` idempotentnie
   dopisuje z `_ostatnie.json`) — przyczyna straty z 28.09 nie została usunięta.
5. **Łowca: dodać `npm run build` przed pushem** (jak w Dane wt) — jedyny runner tworzący
   strony `.md`, a prebuild potrafi odrzucić kategorię; alternatywnie posty dealowe pisać
   z `kategoria: Deal` i sprawdzać `sprawdz-kategorie.mjs` samodzielnie (10 s).
6. **Dane wt: stały tytuł commita** w prompcie zamiast kopiowania z loga („LEGO.pl + Ceneo +
   Smyk: … <data>" bez dopisku „sesja Code za runnera") — inaczej Kontroler i historia git
   nie odróżnią runnera od sesji Code; wymaga delete+create (stała sesja).
7. **Harmonogram z konta: rozszerzyć krok (5) o `get_session` dla 5 sesji runnerów**
   (context_usage; alarm > 850 k) — Scout był na 676 k 22.09 i rośnie ~20 k/dzień; nikt
   tego nie pilnuje, a limit wyłącza runnera po cichu. Wymaga delete+create; przy okazji
   **przepiąć trigger na aktualną sesję Code** (dziś `session_01XzZ5…`, której archiwizacja
   wyłączy go z `auto_disabled_session_gone`).
8. **Scout: nowa trwała sesja w tym tygodniu** (jak Łowca 22.09) — profilaktycznie, zanim
   dobije do 1 M; reguły są w prompcie, więc przesiadka jest bezpieczna.
9. **Generator `harmonogram-z-konta.mjs`: obsłużyć `CRON_TZ=<strefa>`** (to jedno
   wyrażenie) i klasyfikować jako LEGO także Routines z promptem zawierającym `klocki-` /
   `tylkoklocki` / `scripts/` — wtedy „Empik co tydzien" i jednorazowe zadania sesji Code
   wchodzą do tabeli głównej, kolizji i kopii promptów.
10. **Jednorazowy Routine `run_once_at` 24.10 (sobota) do sesji Code**: „zmień cron Łowcy na
    `30 7 * * *` i nazwę; sprawdź pozostałe godziny po CET" — dziś tabela w dokumencie jest
    jedynym przypomnieniem.
11. **Zdjęcia → R2: drugi przebieg ok. 09:45 PL** (albo przenieść jedyny na 09:45, po
    Łowcy i Alertach) — nowości Scouta i nowe sety z feedów mają miniatury o 20 h wcześniej;
    koszt: sekundy.
12. **`kontrola-rrp.mjs` jako krok raportowy Dane wt** (po `wczytaj-rrp`, bez `--napraw`,
    tylko wynik do podsumowania) — bramka sanity straciła właściciela z Backfillem.
13. **Skasować z panelu wyłączony Backfill** (`trig_01D5ZK…`) i usunąć jego akapity
    z `zadania-cykliczne.md` — nigdy nie odpalony pod tym ID, praca przejęta przez
    Dane wt/Rebrickable/`kontrola-rrp --napraw`; balast w każdym zrzucie.
14. **Alerty: zamienić test `git log -1 --grep` na sprawdzenie daty w danych**
    (np. `node -e` max `daty.mediaexpert` z `oferty_feed.json` == dziś) — działa na klonie
    `--depth 1` niezależnie od tego, kto pushował ostatni.
15. **Scout i Radar: krok 0 `diagnoza.mjs --szybko`** (audyt 22.09 „DO ZROBIENIA", nadal
    nie) — wymaga delete+create, można połączyć z pkt 8 (Scout) i odłożyć dla Radaru.
16. **Kontroler: przenieść INDEKSACJĘ do skryptu (`gsc-inspekcja.mjs`)** i wyciąć z promptu
    „punkty odniesienia" do pliku `materialy/kontroler-odniesienia.json` — prompt 9,8 k
    rośnie o akapit co tydzień.
17. **Dokumenty (jedna sesja Code, ~15 min):** NARZEDZIA.md l. 116 (ID Kontrolera),
    zadania-cykliczne.md l. 106–108 (jw.) i tabela „Zmiana czasu" (Harmonogram,
    Empik co tydzien), „Punkty ręczne" (x-kom, panel GSC, czwarty Routine z panelu),
    RUNBOOK l. 995 (bramka 800 zestawów), scripts/README (`kontrola-rrp` bez Backfillu),
    skill `klocki-ceny-empik` (dwa przebiegi zamiast trzech — DZIENNIK 28.09).
18. **Nie ruszać:** kolejności Łowca → Alerty (działa, świeże dane), podziału
    Smyk wt/pt, dubla Lidla we wtorek (koszt zerowy), Kontrolera czytającego kontrolę
    linków (28.09 zadziałało z 15 min zapasu — ale pkt 5/4 zmniejszają ryzyko zacięcia Łowcy).
