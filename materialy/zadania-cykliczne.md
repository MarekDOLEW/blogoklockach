# Zadania cykliczne (Routines)

Sekcja „Zrzut" niżej jest **generowana**, nie pisana. Leży między znacznikami
`HARMONOGRAM:START` i `HARMONOGRAM:KONIEC`; wszystko poza nimi to wiedza pisana
ręcznie i generator jej nie dotyka.

Jak powstaje: sesja z konektorem `Claude_Code_Remote` woła `list_triggers`,
zapisuje odpowiedź do pliku i uruchamia `node scripts/harmonogram-z-konta.mjs
<plik>.json`. Routines nie mają API dostępnego dla skryptu w repo, więc odczyt
musi zrobić sesja — skrypt tylko zamienia go na tekst dokumentu. Od 22.09.2026
robi to sesja Code własnym Routine „LEGO pon 07:45 — Harmonogram z konta"
(`trig_01GJ2ecMp3gwtkZ1pFyUPKLH`); Kontroler (pon 09:00) czyta gotowe pliki
z repo i nie woła API.

**Dlaczego nie ręcznie.** Sprawdzone 14.09.2026: siedem z ośmiu wierszy kolumny
„Ostatnie odpalenie" pokazywało 31.08, gdy konto mówiło 14.09. Zgadzał się
jedyny wiersz ruszony tego dnia ręcznie, a nagłówek twierdził „stan 31.08" nad
treścią opisującą 14.09. Harmonogram pisany ręcznie rozjechał się już cztery
razy (patrz `NARZEDZIA.md`, „Harmonogram: generowany, nie pisany").

**Zmierzone 14.09.2026: konektory są przypięte do Routine, nie do środowiska.**
Wywołanie `list_triggers` zadziała tylko w sesji, która ma konektor
`Claude_Code_Remote`. Rozkład na naszych runnerach *(stan z 14.09.2026;
nieaktualny od 21.09 — patrz uwaga pod tabelą)*:

| Runner | Konektorów | `Claude_Code_Remote` |
|---|---|---|
| Kontroler (raport tygodnia) | 6 | **tak** |
| Łowca promocji | 0 | nie |
| Scout nowości | 0 | nie |
| Radar konkurencji | 0 | nie |
| Wycofania | 0 | nie |
| Backfill cen katalogowych | 0 | nie |

Tak było do 21.09.2026. Tego dnia Kontroler odpalił się już **bez** konektora
`Claude_Code_Remote` (panel nie daje go wybrać, API nie przyjmuje `connectors`),
a od 22.09 jest inną, trwałą sesją. Konektor ma dziś wyłącznie sesja Code — żaden
runner listy nie zobaczy, dlatego sekcję przepisuje Routine „Harmonogram z konta"
z sesji Code. Pole `environment_id` nie jest zwracane
w ogóle, a `session_request.environment_variables` jest puste u wszystkich
dwunastu Routines i niczego o dostępach nie dowodzi.

<!-- HARMONOGRAM:START — generuje scripts/harmonogram-z-konta.mjs, nie edytuj ręcznie -->

## Zrzut — runnery LEGO

**Odczyt z konta: 22.09 11:39 (CEST, UTC+2).** Objął **14 Routines** — pełna lista, bez paginacji.

Tej sekcji nie pisze się ręcznie. Generuje ją `scripts/harmonogram-z-konta.mjs`
z odpowiedzi `list_triggers`, a uruchamia sesja Code Routine „Harmonogram z konta" (pon 07:45 PL); Kontroler ją czyta.

| Zadanie | Cron (UTC) | Start PL | Stan | Ostatnie odpalenie (PL) | Status przebiegu | Trigger |
|---|---|---|---|---|---|---|
| LEGO co 8h (4:00/12:00/20:00 PL) — Backfill cen katalogowych (runner z pushem) | `0 2,10,18 * * *` | 04:00 / 12:00 / 20:00 | ❌ wyłączony | — | — nigdy nie odpalony | `trig_01D5ZK2mHY9CSXAQNnfwaV3q` |
| LEGO 05:00 — Scout nowości (runner z pushem, Opus 5) | `0 3 * * *` | 05:00 | ✅ | — | — utworzony 2026-09-22, bez przebiegu od tego czasu (sprawdź commity runnera) | `trig_01DmDAaz993ddzz61pQj9o9X` |
| LEGO 08:00 — Radar konkurencji (runner, Opus 5) | `0 6 * * *` | 08:00 | ✅ | 22.09 08:01 | ✅ SUCCEEDED | `trig_01WgDxbN6eB2QzAZha7dWBfx` |
| LEGO pon 09:00 — Kontroler (raport tygodnia, runner z pushem, Opus 5) | `0 7 * * 1` | pon 09:00 | ✅ | 22.09 08:20 | — odpalony, bez zapisanego statusu | `trig_01EDEhtPiW4AVSAiGg9Co1mx` |
| LEGO pon 06:10 — Wycofania (runner z pushem) | `10 4 * * 1` | pon 06:10 | ✅ | 21.09 06:10 | ✅ SUCCEEDED | `trig_01NLRxmXX6Y6bMwCV8sevTUs` |
| LEGO pon 08:15 — Przypomnienie: zrzut Empiku | `15 6 * * 1` | pon 08:15 | ✅ | 21.09 08:16 | ✅ SUCCEEDED | `trig_01BWC5ydHBNVE5Q8usmf62PN` |
| LEGO 04:30 — Zdjęcia → R2 (Planeta Klocków) | `30 2 * * *` | 04:30 | ✅ | 22.09 04:31 | ✅ SUCCEEDED | `trig_01EAhU5SKn2GuXxY14WYxNkJ` |
| Dane wt 05:30 — katalog LEGO.pl + ceny Ceneo i Smyk (runner z pushem) | `30 3 * * 2` | wt 05:30 | ✅ | — | — utworzony 2026-09-22, bez przebiegu od tego czasu (sprawdź commity runnera) | `trig_01PwyDWKRCLydgDxAH8eRzzR` |
| LEGO 08:30 — Łowca promocji (runner z pushem) | `30 6 * * *` | 08:30 | ✅ | — | — utworzony 2026-09-22, bez przebiegu od tego czasu (sprawdź commity runnera) | `trig_01Fu1fB4ZmZN6daDtHqEDWZy` |
| LEGO 09:30 — Alerty cen (Obserwuj zestaw) | `30 7 * * *` | 09:30 | ✅ | 22.09 09:38 | ✅ SUCCEEDED | `trig_01BLKenDsuWfNpJ4iFdCN9Vc` |
| LEGO pon 07:45 — Harmonogram z konta (sesja Code, list_triggers) | `45 5 * * 1` | pon 07:45 | ✅ | — | — utworzony 2026-09-22, bez przebiegu od tego czasu (sprawdź commity runnera) | `trig_01GJ2ecMp3gwtkZ1pFyUPKLH` |

### Pozostałe Routines na tym samym koncie

Nie dotyczą serwisu, ale **dzielą z runnerami ten sam limit użycia** — a to on
wywrócił harmonogram 21.08. Trzymane tu, żeby obraz obciążenia konta był pełny.

| Zadanie | Cron (UTC) | Start PL | Stan | Ostatnie odpalenie (PL) | Status przebiegu | Trigger |
|---|---|---|---|---|---|---|
| Angielski — tygodniowy plan nauki (pon 7:00) | `0 5 * * 1` | pon 07:00 | ✅ | 21.09 07:10 | ✅ SUCCEEDED | `trig_018atJTaRWiyA8b7ewyV2zWz` |
| inwestycja IV kwartal | `0 8 * * 1` | pon 10:00 | ✅ | 21.09 10:06 | ✅ SUCCEEDED | `trig_0151L3p8bvgtK4z2otWCUCSt` |
| Herzfaden — środowy raport tygodniowy (śr 11:00) | `0 9 * * 3` | śr 11:00 | ✅ | 16.09 11:03 | ✅ SUCCEEDED | `trig_01NNWsc3SwnJ5Ticc86oT8AZ` |

### Kolizje — zadania na tej samej minucie

- brak — żadne dwa włączone zadania nie startują w tej samej minucie

<!-- HARMONOGRAM:KONIEC -->

### Kontroler — jeden trigger *(14.09.2026)*

Rano odpalały się dwa: stary z 11.08 (`trig_01T8AhciW8JD651MrSMuEj7m`) o 07:10
UTC i nowy `[env projektu]` (`trig_01JhfcGMgzv1nBwiguH93m6N`) o 08:57. Oba
`0 7 * * 1`, oba SUCCEEDED — dwa raporty w każdy poniedziałek i podwójne zużycie
limitu w najciaśniejszym oknie tygodnia.

**Stary został skasowany 14.09.** Najpierw tylko wyłączony, jako zapas na wypadek
gdyby nowy okazał się gorszy — ale po przepisaniu promptu ten zapas przestał być
zapasem: stary miał wersję sprzed 14.09 (3840 znaków, bez diagnozy środowiska,
bez filtra botów, bez harmonogramu i bez prowizji zmierzonych), więc włączenie go
cofnęłoby cały dzień pracy. Do tego wyłączony trigger dalej pokazywał
`next_run_at`, co przy pobieżnym czytaniu wygląda jak zaplanowany przebieg.

**Zostaje jeden: `trig_01JhfcGMgzv1nBwiguH93m6N`**, poniedziałek 09:00 PL.
*(Nieaktualne od 22.09.2026: ten trigger też został skasowany, obowiązuje
`trig_01EDEhtPiW4AVSAiGg9Co1mx` na trwałej sesji — patrz „Historia zmian".)*

Zmierzona różnica między nimi, zanim stary zniknął: stary miał trzy konektory
(Adobe, Google Calendar, Claude_Code_Remote), nowy ma sześć (dodatkowo Alpha
Vantage, Canva, Firecrawl). Oba miały `Claude_Code_Remote`, więc oba potrafiłyby
odczytać harmonogram.

Czego nie udało się ustalić: w jakim środowisku startował który.
`session_request.environment_variables` jest puste u **wszystkich** Routines na
koncie — to pole trzyma nadpisania, a nie zmienne środowiska, więc niczego nie
dowodzi (pierwsza wersja tego akapitu twierdziła inaczej i była błędna).
`list_triggers` zwraca `session_request.environment_id` **tylko dla triggerów
przypiętych do trwałej sesji** (Scout, Radar, Łowca, Wycofania, Backfill:
`env_01YL3diD2yzP3UGYsU7Txvx7` — to samo środowisko, w którym chodzą sesje
robocze); dla zadań tworzących świeżą sesję pole jest puste — sprawdzone
14.09.2026 na pełnej liście. Poszlaka co do starego Kontrolera jest taka, że
raport starego z 14.09 (`materialy/kontroler-2026-09-14.md`, 07:30 UTC) nie ma
sekcji o kliknięciach, EPC, widoczności ani indeksacji i rekomenduje „przywrócić
poświadczenia" — a w środowisku projektu te poświadczenia są i działają
(sprawdzone 14.09: `kliki-raport.mjs` i `gsc-raport.mjs` zwracają dane).
Raport nie był więc błędny, tylko opisywał środowisko bez dostępów.

**Trigger Radara 13:00 (`trig_01KbUQcgjek5iQFhbyokoLLi`) już nie istnieje** —
był wyłączony od 15.08, zniknął z konta między 30 a 31.08. Nie odtwarzać:
drugi przebieg Radara został wycofany świadomie 21.08 dla oszczędności limitu.

### Poniedziałek rano — wąskie gardło

Poniedziałek to najciaśniejsze okno tygodnia — chodzi wtedy wszystko codzienne
plus trzy zadania tygodniowe, na jednym limicie konta. Rozkład po rozsunięciu
z 14.09.2026 (czas PL):

| PL | UTC | Zadanie |
|---|---|---|
| 05:00 | 03:00 | Scout nowości (codziennie) |
| 06:10 | 04:10 | Wycofania |
| 07:00 | 05:00 | Angielski |
| 08:00 | 06:00 | Radar konkurencji (codziennie) |
| 08:30 | 06:30 | Łowca promocji (codziennie) |
| 09:00 | 07:00 | Kontroler |
| 10:00 | 08:00 | inwestycja IV kwartał |

Poza poniedziałkiem chodzą tylko trzy zadania codzienne (05:00, 08:00, 08:30)
plus **Herzfaden w środę o 11:00**. *(Rozkład z 14.09 — od tego czasu doszły
codzienne Zdjęcia → R2 04:30 i Alerty cen 09:30, wtorkowe Dane wt 05:30 oraz
poniedziałkowe Harmonogram z konta 07:45 i Przypomnienie: Empik 08:15; aktualny
obraz daje blok generowany wyżej.)*

**Rozsunięcie 14.09.2026.** Były dwie kolizje, obie po cichu dzielące limit
konta w tej samej minucie:

- inwestycja IV kwartał startowała razem z Kontrolerem — przesunięta
  z `0 7 * * 1` na `0 8 * * 1` (10:00 PL);
- Herzfaden startował razem z Radarem — przeniesiony z poniedziałku 08:00
  na **środę 11:00** (`0 6 * * 1` → `0 9 * * 3`), razem z nazwą i jednym
  zdaniem w promptcie, żeby „poniedziałkowy raport" nie kłócił się z cronem.

Po obu zmianach detektor pokazuje **zero kolizji**. Wolne pełne godziny
w poniedziałkowym oknie (stan 14.09): 04:00, 09:00, 10:00, 11:00 UTC.

Aktualną listę kolizji podaje blok generowany wyżej. Detektor rozwija crona na
realne momenty tygodnia, a nie porównuje napisów — inaczej `0 6 * * *`
i `0 6 * * 1` wyglądałyby na rozbieżne, choć w poniedziałki są tą samą minutą.
Tamta kolizja przez to wisiała niezauważona.

### Co zapisuje każdy runner *(stan 16.09.2026, z promptów)*

| Zadanie | Pliki |
|---|---|
| Scout nowości (codziennie 05:00) | `sety.json`, `known_sets.json`, `przecieki.json`; sygnały wycofań do `DZIENNIK.md` |
| Wycofania (pon 06:10) | `wycofania.json` (jedyny autor); adnotacje pod sygnałami Scouta w `DZIENNIK.md` |
| Radar konkurencji (codziennie 08:00) | `konkurencja_baza.json`; wpis „RADAR · Do zrobienia" w `DZIENNIK.md` |
| Łowca promocji (codziennie 08:30) | `oferty_feed.json` (klucze `mediaexpert`, `planetaklockow`, `allegro`, `empik` przy zrzucie; `lidl` codziennie przez `ceneo-feed.mjs`; `smyk` w piątki), `ceny_baza.json`, `redirects.json` (gałęzie `planetaklockow`, `allegro`, `empik` przez `empik-redirects.mjs`), `sety.json` (oferty), `obrazy.json`, `src/pages/deale/*.md`, `src/data/historia-cen/RRRR-MM.jsonl`; w poniedziałek `materialy/kontrola-linkow-RRRR-MM-DD.md` (od 21.09) |
| Dane wt 05:30 (LEGO.pl + Ceneo + Smyk) | `oferty_feed.json` (`lego`, `ceneo`, `smyk`), `sety.json` (oferty `lego`, `smyk`, `ekskluzyw`), `katalog.json` (`status`, `ekskluzyw`, `lego_pl_widziano`, nowe numery z Rebrickable), `rrp_potwierdzone.json`, `redirects.json` (`lego`, `ceneo`), `obrazy.json` |
| Harmonogram z konta (pon 07:45, sesja Code, od 22.09) | `materialy/zadania-cykliczne.md` (sekcja HARMONOGRAM), `materialy/routine-prompty.md` |
| Kontroler (pon 09:00) | `materialy/kontroler-RRRR-MM-DD.md`, archiwum dziennika (do 21.09 także dwa pliki harmonogramu — teraz tylko je czyta) |
| Alerty cen (codziennie 09:30) | nic w repo — czyta R2 `_obserwuj/`, wysyła maile, kasuje niepotwierdzone zapisy w R2 |
| Zdjęcia → R2 (codziennie 04:30) | nic w repo — wgrywa do kubełka R2 `tylkoklocki-obrazy`, ślad `_stan/r2-obrazy.json` |
| Przypomnienie: Empik (pon 08:15) | nic — jeden mail na kontakt@ |
| Backfill (wyłączony) | `katalog.json` → `cena_katalogowa` |

### Uwagi do odczytu

- **`last_run` ze statusem zwracają także triggery przypięte do trwałej sesji.**
  Sprawdzone 14.09.2026 na pełnej liście: Scout, Radar, Łowca i Wycofania mają
  `persist_session: true` i komplet statusów. Wcześniej stało tu, że status
  dostajemy wyłącznie od zadań tworzących świeżą sesję — **to była nieprawda**
  (albo API się zmieniło). Status jest pusty wyłącznie tam, gdzie trigger nigdy
  nie wystrzelił: Backfill i Social. Mimo to `SUCCEEDED` mówi o przebiegu sesji,
  nie o tym, że dane wylądowały w repo — dowodem zapisu jest commit w `main`.
- **Odpalenie ≠ dane na produkcji.** Commity runnerów potrafiły spóźnić się
  7–12 godzin przy zakolejkowaniu na limicie (patrz `RUNBOOK.md`, „Runnery:
  opóźnione commity"). Przy diagnozie „strona ma stare ceny" sprawdzaj czas
  commita, nie czas triggera.
- **Minuty odpalenia dryfują o kilka minut** względem crona (05:05 zamiast
  05:00) — serwer kotwiczy zadania do minuty utworzenia. To normalne, nie usterka.
- **Kontroler działa.** Zarejestrowany przebieg 31.08 09:11 ze statusem
  `SUCCEEDED` zamyka wątek z 30.08, gdy ostatni odczyt pochodził z 17.08
  i wyglądało to na cichą awarię. Był wyłączony 18–24.08, po włączeniu
  odpalił w pierwszy pełny poniedziałek.
- **Backfill wyłączony świadomie** po wyczerpaniu puli setów bez ceny
  katalogowej (import bazy RK domknął większość). Trigger odtworzono 31.08 pod
  nowym ID, bo prompt Routine cudzej sesji da się zmienić tylko przez
  delete+create. Nie włączać bez przeczytania „Bramki sanity" niżej.

### Zmiana czasu — 25.10.2026

Crony są w UTC i nie znają polskiej zmiany czasu. Po przejściu na CET (UTC+1)
**każde zadanie przesunie się o godzinę wcześniej względem zegara**:

| Zadanie | Dziś (CEST) | Po 25.10 (CET) |
|---|---|---|
| Zdjęcia → R2 | 04:30 | 03:30 |
| Scout nowości | 05:00 | 04:00 |
| Dane wt (LEGO.pl + Ceneo + Smyk) | wt 05:30 | wt 04:30 |
| Wycofania | pon 06:10 | pon 05:10 |
| Angielski | pon 07:00 | pon 06:00 |
| Radar konkurencji | 08:00 | 07:00 |
| Przypomnienie: Empik | pon 08:15 | pon 07:15 |
| Łowca promocji | 08:30 | **07:30 — do przestawienia na cron `30 7`** |
| Kontroler | pon 09:00 | pon 08:00 |
| Alerty cen | 09:30 | 08:30 (po Łowcy — kolejność musi zostać) |
| inwestycja IV kwartał | pon 10:00 | pon 09:00 |
| Herzfaden | śr 11:00 | śr 10:00 |

Przesuwa się wszystko równo, więc **nowych kolizji to nie tworzy**. Tabelę
w bloku generowanym poprawi sam generator — liczy przesunięcie z kalendarza.

Dla Łowcy to jest realny problem, nie kosmetyka: godzina 08:30 została dobrana
pod moment lądowania nocnego feedu Media Expert (~07:40 czasu polskiego).
Po zmianie czasu przebieg wypadnie o 07:30 i **znowu zacznie łapać wczorajszą
wieczorną wersję**. Do przestawienia razem ze zmianą czasu, nie później.

---

Poniżej część pisana ręcznie. Zrzut jej nie nadpisuje.

## Modele

Podział wynika z charakteru pracy, nie z prestiżu modelu:

- **Opus 5** — Scout (pisze opisy zestawów), Radar (ocenia konkurencję
  i rekomenduje tematy), Kontroler (analiza tygodnia). Zadania wymagające
  sądu i dobrego polskiego.
- **Fable 5** — Łowca, Wycofania, Backfill. Po przeniesieniu parsowania do
  skryptów to praca mechaniczna: uruchom, porównaj liczby, zapisz JSON.
- **Sonnet 5** — „Dane wt 05:30" (trwała sesja od 22.09.2026).

Zgodne ze stanem faktycznym sesji na 31.08 (Dane wt i Kontroler jako trwała
sesja Opus 5 dopisane 22.09).

Model jest własnością SESJI, nie Routine: `update_trigger --model` działa tylko
dla zadań tworzących świeżą sesję (Zdjęcia → R2, Alerty cen, Przypomnienie:
Empik). Runner przypięty do trwałej sesji
zachowuje jej model — żeby go zmienić, trzeba `create_session` z nowym modelem
i przepiąć trigger (tak zrobiliśmy ze Scoutem i Radarem 21.08).

## Jak edytować zadanie

**Routine założony przez API (`create_trigger`) nie podpina repozytorium** — świeża
sesja startuje z pustym `/home/user` (`session_request.config.sources: []`), a
sesja bez URL-a odmawia szukania repo (klasyfikator blokuje przeszukiwanie
poświadczeń — słusznie). Sprawdzone 15.09.2026 na „Zdjęcia → R2": sesja
zakończyła się czysto, skrypt nie ruszył. Dlatego prompt każdego takiego Routine
zaczyna się od `git clone --depth 1 https://github.com/MarekDOLEW/blogoklockach.git`
(repo jest publiczne) i `npm ci`, gdy skrypt potrzebuje zależności. Routine
z panelu claude.ai też **nie ma** repo w źródłach — sprawdzone 21.09 (Kontroler)
i 22.09 (Dane wt): `sources: None`, push odrzucony; klon działa tylko do odczytu.
Pushować może wyłącznie trwała sesja założona `create_session(source_url)`.
Prompt Routine ze świeżą sesją **da się** zmienić przez `update_trigger` —
ograniczenie delete+create dotyczy tylko trwałych sesji.

Prompt Routine przypiętej do cudzej sesji **nie da się** zmienić przez
`update_trigger` („editing the prompt … is not available via this tool") —
trzeba `delete_trigger` + `create_trigger` z tym samym `persistent_session_id`.
Nazwę, cron i stan `enabled` można zmieniać normalnie. **Potwierdzone
14.09.2026** próbą no-op na Wycofaniach (ten sam prompt, API odmówiło) i
odtworzeniem czterech runnerów przy wpinaniu wysyłki maili. Kolejność
bezpieczna: najpierw `create_trigger` nowego, odczyt z konta, dopiero potem
`delete_trigger` starego — żeby nie było okna bez runnera. Parametr
`connectors` w `create_trigger` jest w tej organizacji niedostępny; pomiń go.

**Nie kasuj i nie archiwizuj sesji runnera.** Trigger straci cel i wyłączy się
sam z `ended_reason: auto_disabled_session_gone` — bez ostrzeżenia i bez błędu.
Jeden taki przypadek jest w tabeli wyżej.

**Po zmianie crona popraw nazwę Routine.** Nazwa jest jedyną rzeczą, którą widać
na liście zadań; rozjazd nazwy z cronem kosztował nas dobę zamieszania (Łowca
nazywał się „07:00", chodząc o 08:00).

## Sesje archiwalne (bez triggerów)

Zostają jako archiwum kontekstu, nie usuwać bez potrzeby:

- `session_0135w54udb1cBHBQ5pYEzYRS` — Scout na Fable, sprzed przesiadki 21.08
- `session_014pPdvW1SE9AFW4TnaBPV3z` — Radar na Fable, sprzed przesiadki 21.08
- `session_01SDwpiHyQchQaiu46Q76Xfr` — duplikat Scouta utworzony omyłkowo 21.08
  przy przepinaniu triggera; zarchiwizowany 30.08

## Źródła Scouta

Brickset (dane katalogowe, od 23.08 przez API v3 — szczegóły w `RUNBOOK.md`),
PromoBricks i StoneWars (zapowiedzi). **lego.com i BrickLink blokują nasz ruch**
(403/405) — nie próbować. lego.pl jest dostępne przez Firecrawl, patrz `RUNBOOK.md`.

## Feedy: Łowca nie parsuje surowych plików

Od 21.08 robi to `scripts/feedy-lego.py`: pobiera Media Expert, Planetę Klocków
i Allegro, wyciąga wyłącznie oferty LEGO i zapisuje wyciąg ~4 MB zamiast ~630 MB.
Ceneo odświeża osobno `scripts/ceneo-feed.mjs`, ceny Empiku wchodzą ze zrzutu
przez skill `klocki-ceny-empik`. Powód zmiany: konto uderzyło w tygodniowy limit
i sesje Łowcy oraz Backfillu dostawały status `rejected`.

**Empik ma inny rytm niż Łowca.** Łowca chodzi codziennie o 08:30, a zrzut
Empiku robi Cowork **raz w tygodniu, w poniedziałek** — Empik blokuje ruch
serwerowy, więc katalog trzeba przejść lokalną przeglądarką. Import zrzutu jest
więc poza codzienną instrukcją Łowcy: plik idzie **do Code jako załącznik**
(domyślnie, patrz `NARZEDZIA.md` „Co gdzie wrzucać") albo do sesji Łowcy z notką;
importuje go `scripts/empik-import.mjs`, a po nim
`node scripts/empik-redirects.mjs <plik> --usun-martwe` (deeplinki produktowe).
Wniosek praktyczny: zmiany dotyczące Empiku wchodzą do serwisu dopiero przy
najbliższym poniedziałkowym zrzucie, nie następnego dnia.

## Backfill — obowiązkowa bramka sanity *(od 30.08.2026)*

Przed każdym commitem Backfill MUSI uruchomić `node scripts/kontrola-rrp.mjs`
i przejrzeć sekcję „Test rynkowy": cena rynkowa z feedów poniżej 50% wpisywanej
ceny katalogowej oznacza, że któraś strona jest błędna. Rozstrzyganie:

- RRP potwierdzone (`rrp_potwierdzone.json` / baza RK w `katalog.json`
  z `cena_zrodlo: "RK"`) → wina „rynku" (zaślepka sklepu albo oferta-podszywka);
  wpis zostaje, przypadek zgłosić w raporcie do wiadomości Łowcy;
- RRP bez niezależnego potwierdzenia → ceny NIE zapisywać (brak ceny jest lepszy
  niż fałszywy rabat na stronie).

Audyt z 30.08.2026: wpisy Backfilla po naprawach z 24.08 są poprawne; fałszywe
rabaty (75425 „−76%") produkowały zaślepki cenowe Planety Klocków (79,99 dla
linii SMART Play, 559,99 dla zapowiedzi Icons) — obsługuje je Łowca regułą
„cena PK < 50% RRP → wiersz PK wykluczony".

## Historia zmian harmonogramu

**23.09.2026 (rano)**
- Łowca odtworzony (delete+create, ta sama sesja `session_01SdxKtAvW8UmktsuXrsPYga`)
  pod ID `trig_017omSdzXXrZQTjBBp4UfVTg`: nowa sekcja „SKRYPTY ROBOCZE POZA REPO"
  — pierwszy przebieg w nowej sesji utknął na 40 minut na pytaniu o uprawnienia,
  bo runner zrobił `cat > lowca-zapisz-dzis.py` w katalogu repo (tryb auto pyta
  o tworzenie plików poza `src/data`, a nikt nie odpowiada). Odblokowany
  jednorazowym Routine do sesji z instrukcją heredoc/scratchpad; commit eba381f
  o 07:15 UTC. Do promptu weszły też oczekiwane rzędy wielkości Allegro po
  zmianie feedu (~6 400; alarm poniżej 4 000 i powyżej 10 000).

**22.09.2026 (po południu, po audycie)**
- Kontroler odtworzony (delete+create, ta sama sesja) pod ID
  `trig_0167qmnWn3Qjjz8HTwZU1uEP`: cel „20 000 zł w grudniu" zastąpiony czterema
  kamieniami milowymi (decyzja Marka 22.09), pomiar Allegro/PK zostawiony bez
  ręcznego odczytu (decyzja Marka), `sitemap-priorytet.xml` zdjęta z repo, punkty
  odniesienia z 22.09, zakaz tezy „zakaz audytu niewdrożony" dla kliknięć sprzed 21.09.
- Łowca w NOWEJ trwałej sesji `session_01SdxKtAvW8UmktsuXrsPYga` (Fable 5,
  repo w źródłach) pod ID `trig_01Fu1fB4ZmZN6daDtHqEDWZy` — poprzednia sesja
  `session_017FKg5b8kSCwbJd8r7xPrwD` miała 753 k z 1 M tokenów kontekstu po
  37 dniach (decyzja Marka 22.09). Prompt bez zmian poza krokiem PRZED COMMITEM:
  `generuj-obrazy.mjs` + `porzadek-ofert.mjs` (audyt 22.09: 905 zestawów po
  cenie zamiast alfabetycznie). Triggery przejściowe z tego dnia
  (`trig_013VvvPKDiN4W8Bmj4qwd9LK`, `trig_01XWKB1HjSS5riTkB37bQK5V`) skasowane.
  Stara sesja zostaje nieużywana do 29.09 (gdyby trzeba było coś z niej odczytać),
  potem do archiwizacji.

**22.09.2026 (po dwóch nieudanych pushach runnerów ze świeżej sesji)**
- „Dane wt 05:30" przeniesiony do trwałej sesji z repo
  (`session_011Ced7USAHUBBsCPZ1os3F9`, Sonnet 5, dry-run pushu OK) pod nowym ID
  `trig_01PwyDWKRCLydgDxAH8eRzzR`. Stary `trig_012JWbmYwHb59sYazo6K9X33`
  (założony z panelu, `sources: None`) przebiegł 22.09 03:36 bez commita —
  sesja Code nie może go skasować ani wyłączyć (Routine z panelu edytuje tylko
  Marek): **do skasowania z panelu**, inaczej we wtorek odpalą się oba
  *(skasowany przez Marka 22.09 przed odczytem z konta 08:50)*.
- Scout odtworzony (delete+create, ta sama sesja) pod ID
  `trig_01DmDAaz993ddzz61pQj9o9X`: sekcja „GIT I PAMIĘĆ" — przy „forced update"
  wkleja reflog zamiast tezy o przepisaniu historii, format `przecieki.json`
  (wcięcie 1) uznany za docelowy, zakaz powtarzania uwag bez dowodu z bieżącego
  przebiegu, sekcja „Luki katalogu" w podsumowaniu.
- Kontroler przeniesiony do trwałej sesji z repo (`session_01M8qMJFfKHEozBSGXjAKP4n`,
  Opus 5) — panel nie daje pola na konektor, więc krok „harmonogram z konta"
  przejęła sesja Code własnym Routine „LEGO pon 08:00 — Harmonogram z konta"
  (`trig_01GJ2ecMp3gwtkZ1pFyUPKLH`, self-bind, godzinę przed Kontrolerem);
  Kontroler czyta pliki z repo, nie woła API. Prompt: `materialy/kontroler-prompt-2026-09-22.md`.
  Do skasowania z panelu przez Marka (sesja Code: jeden z panelu, drugi
  zablokowany przez klasyfikator uprawnień): stary `trig_01JhfcGMgzv1nBwiguH93m6N`
  oraz założony 22.09 z panelu `trig_012F22qZPFRvBhxG2HUG9puV` („Raport kontrolera
  — wynik tygodnia") — ten drugi ma w konfiguracji `sources: null` i sześć
  konektorów bez `Claude_Code_Remote`, więc też nie pushuje ani nie czyta
  harmonogramu. Zostaje wyłącznie `trig_01EDEhtPiW4AVSAiGg9Co1mx`
  *(oba skasowane przez Marka 22.09 przed odczytem z konta 08:50 — na liście
  z konta jest już tylko ten jeden Kontroler)*.
- Harmonogram z konta przesunięty na pon 07:45 PL (`45 5 * * 1`), żeby nie
  kolidował z Radarem o 08:00.

**16.09.2026 (po audycie końcowym, decyzje Marka)**
- Łowca odtworzony (delete+create, ta sama sesja) pod ID
  `trig_013VvvPKDiN4W8Bmj4qwd9LK`: krok IMPORT EMPIKU woła
  `scripts/empik-import.mjs` (reguły w skrypcie, nie w pamięci sesji); nowy
  krok PODEJRZANY RYNEK — `scripts/podejrzany-rynek-mail.mjs` wysyła Markowi
  poranny mail z ofertami poniżej 50% potwierdzonego RRP do sprawdzenia
  (klucz `podejrzane` w raporty_mail.json). Stary `trig_015CVad7UA3mJpXYWxuEwfNo`
  skasowany od razu.
- Kontroler (`update_trigger`, świeża sesja): pomija zadania z linią
  „→ zamknięte" / „→ Wycofania", rozpoznaje wpisy Scouta po „SCOUT ·" + „wycofa",
  sekcję „Zadania bez właściciela" wysyła mailem do Marka i Piotra (klucz
  `kontroler`).
- Wtorkowy Routine przemianowany przez Marka na „Dane wt 05:30 — katalog
  LEGO.pl + ceny Ceneo i Smyk" (krok 6a: Smyk); generator harmonogramu
  rozpoznaje nasze Routine po środowisku i prompcie, nie po prefiksie nazwy.

**15.09.2026 (wieczór, po audycie 2)**
- Łowca odtworzony (delete+create, ta sama sesja) pod ID
  `trig_015CVad7UA3mJpXYWxuEwfNo`: import zrzutu Empiku (ceny z `daty.empik`,
  `empik-redirects.mjs --usun-martwe`), ochrona kluczy `ceneo/lego/empik/smyk`
  przy kasowaniu ofert nieobecnych w feedach, gałąź `allegro` nadpisywana bez
  kasowania (append-only), `daty[sklep]` przy każdej cenie, `generuj-obrazy.mjs`
  przed commitem, walidacja liczby wpisów w każdej gałęzi, format plików bez zmian.
- Wycofania odtworzone pod ID `trig_01NLRxmXX6Y6bMwCV8sevTUs`: diagnoza,
  listing lego.pl (`lego_pl_widziano`) jako arbiter „czy LEGO sprzedaje", zakaz
  edycji katalogu, `audyt-wycofan.mjs` bez `--napraw` po każdym przebiegu,
  adnotacje pod sygnałami Scouta w DZIENNIKU. Stare ID obu skasowane od razu.

**15.09.2026 (późne popołudnie)**
- Scout odtworzony (delete+create, ta sama stała sesja) pod ID
  `trig_01Rvt1kEmrv2Ltis4oYJS5EN`, cron `0 3 * * *`: krok PRZECIEKI — właściciel
  `src/data/przecieki.json` (dopisywanie z drabiną pewności, rozstrzygnięcia po
  premierze), przecieki nie wchodzą do `sety.json`. Stary
  `trig_01VSNGR5PnnobJW9i9x5PAmQ` skasowany od razu. Kontroler (prompt z konta):
  repo najpierw, `routines.json` w /tmp, commit obu generowanych plików, huby
  i inspekcja URL co tydzień, „Zadania bez właściciela". Prompty czterech Routine
  z panelu (LEGO.pl, Alerty, R2, Empik) wymienione przez Marka; Social skasowany.

**15.09.2026 (wieczór)** — Marek założył w panelu (z repo jako źródłem) cztery
Routine ze świeżą sesją: Zdjęcia → R2 `trig_01EAhU5SKn2GuXxY14WYxNkJ` (`0 2 * * *`),
Przypomnienie Empik `trig_01BWC5ydHBNVE5Q8usmf62PN` (`15 6 * * 1`, 08:15 PL),
LEGO.pl katalog `trig_012JWbmYwHb59sYazo6K9X33` (`0 3 * * 2`, wtorek 05:00 PL),
Alerty cen `trig_01BLKenDsuWfNpJ4iFdCN9Vc` (`30 7 * * *`, 09:30 PL). Wersje z API
(`trig_01TSSqtf4ke7wfxwbmkAp6GM`, `trig_01RimXSd1NCqbbRP16MBrjVu`) skasowane —
nic nie chodzi podwójnie. Prompty: `materialy/routine-prompty.md`.

**15.09.2026 (po południu)**
- Łowca ponownie odtworzony (delete+create) pod ID `trig_01HUdmCx3Z57H7VcX2uLLuQp`:
  reguła postów dealowych (≥35% od RRP ≥300 zł w sklepie, historyczne minimum na
  zestawie z wycofań albo akcja sklepu ≥5 zestawów; najwyżej 2 tygodniowo, bez
  powtórki 14 dni) i zakaz dotykania klucza `lego` w feedzie (należy do Routine
  LEGO.pl). Stary `trig_01AdSEcWEMGmYPJyESzoxE6s` skasowany od razu, żeby nie
  odpalił podwójnie o 06:38.
- Zaprojektowany Routine „LEGO wt 05:00 — LEGO.pl katalog" (cron `0 3 * * 2`):
  `firecrawl-legopl.mjs` → `lego-ceny.mjs` → `wczytaj-rrp.mjs` → `lego-redirects.mjs`
  → build → push. Prompt w `materialy/routine-prompty.md` (kopia z konta);
  zakłada go Marek w panelu z repo jako źródłem (Routine z API startuje bez repo
  i wpada na klasyfikator „Code from External"). Godzina 05:00 PL leży przed
  Scoutem (05:06) — zaciąg trwa kilkanaście minut, więc Scout może wystartować
  w trakcie; oba piszą inne pliki (Scout: nowości/dziennik, LEGO.pl: feed, sety,
  katalog, rrp, redirects), a push idzie przez rebase.

**15.09.2026**
- Łowca i Radar **odtworzone** (delete+create): Łowca `trig_01AdSEcWEMGmYPJyESzoxE6s`
  z krokiem 0 (`diagnoza.mjs --szybko`); Radar `trig_01WgDxbN6eB2QzAZha7dWBfx`
  z nowym formatem raportu (najwyżej 5 pozycji × 4 linijki: fakt / mamy? /
  zrobić / kto) i rejestrem „RADAR · Do zrobienia" w DZIENNIK.md. Powód: Marek —
  „radar zasypuje mnie mnóstwem tematów, nieczytelne".
- Nowy Routine „LEGO pon 07:00 — Przypomnienie: zrzut Empiku" (`0 5 * * 1`,
  świeża sesja): mail na kontakt@ przez `wyslij-raport.py --zadanie przypomnienie`.
  Decyzja Marka: zrzut Empiku ręcznie, wystarczy przypominajka.
- Scout i Wycofania **odtworzone** (delete+create, te same sesje i crony):
  Scout `trig_01VSNGR5PnnobJW9i9x5PAmQ` — zakaz edycji `wycofania.json`, sygnały
  wycofań zapisuje do `DZIENNIK.md`; Wycofania `trig_01S5hMfivCCFytZSqces2pYw` —
  jedyny autor pliku, wszystkie serie, czyta sygnały Scouta, źródła + StoneWars
  i PromoBricks. Powód: 15.09 Scout dopisał 16 wycofań bez reguł w promptcie,
  a runner Wycofań (tygodniowy, decyzja Marka) jeszcze nie odpalił.
- Nowy Routine „LEGO 04:00 — Zdjęcia → R2 (Planeta Klocków)"
  (`trig_01TSSqtf4ke7wfxwbmkAp6GM`, cron `0 2 * * *`, świeża sesja na każdy
  przebieg). Uruchamia `node scripts/r2-obrazy.mjs`: listuje kubełek R2
  i dogrywa zdjęcia z Planety, których worker sam nie pobierze. Bez zaległości
  trwa kilkanaście sekund. Godzina 04:00 PL leży przed Scoutem (05:06) i nie
  koliduje z niczym. Powód: audyt 14.09 — 348 z 608 zdjęć galerii dawało 502.

**31.08.2026**
- Łowca przesunięty na 08:30 (cron `30 6 * * *`). Nocny feed ME ląduje na GCS
  ok. 07:40, więc wcześniejsze przebiegi dostawały wczorajszą wieczorną wersję.
  Po drodze był tego dnia krótko ustawiony na 07:00 — to była pomyłka, 08:30
  jest wartością docelową.
- Backfill: trigger odtworzony pod ID `trig_01D5ZK2mHY9CSXAQNnfwaV3q`
  (delete+create), z bramką sanity w promptcie. Pozostaje wyłączony.

**21.08.2026** — konto uderzyło w tygodniowy limit (Łowca i Backfill dostały
`rejected`). Wprowadzono: parsowanie feedów przeniesione do `scripts/feedy-lego.py`,
Backfill i Radar ograniczone do jednego przebiegu dziennie, Scout zawężony do
trzech źródeł, Social zawieszony do startu kanałów.
