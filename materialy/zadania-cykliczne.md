# Zadania cykliczne (Routines)

**Zrzut realnej konfiguracji: 31.08.2026, 15:25.** Odczytany z Routines w koncie
Marka (`list_triggers` + `list_sessions`), nie pisany z pamięci.

Sekcja „Zrzut" **nie jest edytowana ręcznie** — przy każdym przeglądzie nadpisuje
się ją w całości nowym odczytem i podbija datę w nagłówku. Powód: ręcznie pisany
harmonogram rozjeżdżał się już trzy razy (patrz `NARZEDZIA.md`, sekcja
„Harmonogram: generowany, nie pisany").

Zrzutu nie zrobi skrypt w repo — Routines nie mają API dostępnego z kontenera.
Robi go sesja Claude Code wywołaniem `list_triggers`.

## Zrzut — runnery LEGO

Cron w UTC, kolumna „PL" przy obecnym CEST (UTC+2). Odczyt objął **11 Routines
na koncie** (pełna lista, bez paginacji).

| Zadanie | Cron (UTC) | PL | Enabled | Ostatnie odpalenie | Trigger | Sesja |
|---|---|---|---|---|---|---|
| Scout nowości | `0 3 * * *` | 05:00 | ✅ | 31.08 05:05 | `trig_01Nos3qQb8GJFAVMR1SyEEZT` | `session_012AZejbFzsfzkTh4FPaAkVg` |
| Wycofania | `0 4 * * *` | 06:00 | ✅ | 31.08 06:11 | `trig_01EZNzF51DPkHRyKkS7MhNBn` | `session_01KfWF14fJvwK78sBVG6XAz8` |
| Radar konkurencji | `0 6 * * *` | 08:00 | ✅ | 31.08 08:01 | `trig_01UpMJdpeguEtby68saqBMpD` | `session_01UFkqKNwQexnxLN34HotM4G` |
| Łowca promocji | `30 6 * * *` | 08:30 | ✅ | 31.08 08:41 | `trig_014koskPHBgxP79gLKcLqGvf` | `session_017FKg5b8kSCwbJd8r7xPrwD` |
| Kontroler (raport tygodnia) | `0 7 * * 1` | pon 09:00 | ✅ | 31.08 09:11 — **SUCCEEDED** | `trig_01T8AhciW8JD651MrSMuEj7m` | świeża sesja przy każdym odpaleniu |
| Backfill cen katalogowych | `0 2,10,18 * * *` | 04:00 / 12:00 / 20:00 | ❌ wyłączony | — | `trig_01D5ZK2mHY9CSXAQNnfwaV3q` | `session_01JSfUBJxddBbATeaXhQ6efS` |
| Social: paczka tygodniowa | `0 8 * * 0` | ndz 10:00 | ❌ zawieszone | nigdy | `trig_01W1CSp8PM3DDN6UEyNLYe6H` | — |

**Trigger Radara 13:00 (`trig_01KbUQcgjek5iQFhbyokoLLi`) już nie istnieje** —
był wyłączony od 15.08, zniknął z konta między 30 a 31.08. Nie odtwarzać:
drugi przebieg Radara został wycofany świadomie 21.08 dla oszczędności limitu.

### Pozostałe Routines na tym samym koncie

Nie dotyczą serwisu, ale **dzielą z runnerami ten sam limit użycia** — a to on
wywrócił harmonogram 21.08. Trzymane tu, żeby obraz obciążenia konta był pełny.

| Zadanie | Cron (UTC) | PL | Enabled | Ostatnie odpalenie |
|---|---|---|---|---|
| Angielski — tygodniowy plan nauki | `0 5 * * 1` | pon 07:00 | ✅ | 31.08 07:19 |
| Herzfaden — raport tygodniowy | `0 6 * * 1` | pon 08:00 | ✅ | 31.08 08:05 |
| inwestycja IV kwartał | `0 7 * * 1` | pon 09:00 | ✅ | 31.08 09:23 |
| `send_later` z 15.08 (jednorazowy) | — | — | ❌ | `auto_disabled_session_gone` |

Poniedziałek rano to wąskie gardło: **pięć zadań między 07:00 a 09:30**
(Angielski, Herzfaden, Radar, Łowca, Kontroler + inwestycja). Przy kolejnym
uderzeniu w limit to jest pierwsze miejsce do rozsunięcia.

### Co zapisuje każdy runner

| Zadanie | Pliki |
|---|---|
| Scout nowości | `sety.json`, `known_sets.json`, `katalog.json` (nazwy, roczniki) |
| Wycofania | `wycofania.json` |
| Łowca promocji | `oferty_feed.json`, `ceny_baza.json`, `redirects.json`, `sklepy.json`, `sety.json` (ceny), `src/pages/deale/*.md` |
| Radar konkurencji | `konkurencja_baza.json` + rekomendacje redakcyjne |
| Backfill | `katalog.json` → pole `cena_katalogowa` |
| Kontroler | nic w repo — raport PDF na maila |

### Uwagi do odczytu

- **`last_fired_at` zwracają wszystkie triggery** — to na nim opiera się kolumna
  „Ostatnie odpalenie". Pełny `last_run` ze statusem (`SUCCEEDED` / `FAILED`)
  zwracają wyłącznie zadania tworzące świeżą sesję, czyli u nas Kontroler.
  Dla runnerów przypiętych do trwałej sesji wiemy więc, **że** trigger wystrzelił,
  ale nie **czy** przebieg się udał — dowodem jest dopiero commit w historii `main`.
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
**każdy runner przesunie się o godzinę wcześniej względem zegara**: Scout na
04:00, Wycofania 05:00, Radar 07:00, Łowca 07:30, Kontroler pon 08:00.

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

Zgodne ze stanem faktycznym sesji na 31.08.

Model jest własnością SESJI, nie Routine: `update_trigger --model` działa tylko
dla zadań tworzących świeżą sesję (Kontroler). Runner przypięty do trwałej sesji
zachowuje jej model — żeby go zmienić, trzeba `create_session` z nowym modelem
i przepiąć trigger (tak zrobiliśmy ze Scoutem i Radarem 21.08).

## Jak edytować zadanie

Prompt Routine przypiętej do cudzej sesji **nie da się** zmienić przez
`update_trigger` („editing the prompt … is not available via this tool") —
trzeba `delete_trigger` + `create_trigger` z tym samym `persistent_session_id`.
Nazwę, cron i stan `enabled` można zmieniać normalnie.

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
