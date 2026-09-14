# Zadania cykliczne (Routines)

Sekcja „Zrzut" niżej jest **generowana**, nie pisana. Leży między znacznikami
`HARMONOGRAM:START` i `HARMONOGRAM:KONIEC`; wszystko poza nimi to wiedza pisana
ręcznie i generator jej nie dotyka.

Jak powstaje: sesja z konektorem `Claude_Code_Remote` woła `list_triggers`,
zapisuje odpowiedź do pliku i uruchamia `node scripts/harmonogram-z-konta.mjs
<plik>.json`. Routines nie mają API dostępnego dla skryptu w repo, więc odczyt
musi zrobić sesja — skrypt tylko zamienia go na tekst dokumentu. Robi to
Kontroler przy cotygodniowym raporcie.

**Dlaczego nie ręcznie.** Sprawdzone 14.09.2026: siedem z ośmiu wierszy kolumny
„Ostatnie odpalenie" pokazywało 31.08, gdy konto mówiło 14.09. Zgadzał się
jedyny wiersz ruszony tego dnia ręcznie, a nagłówek twierdził „stan 31.08" nad
treścią opisującą 14.09. Harmonogram pisany ręcznie rozjechał się już cztery
razy (patrz `NARZEDZIA.md`, „Harmonogram: generowany, nie pisany").

**Zmierzone 14.09.2026: konektory są przypięte do Routine, nie do środowiska.**
Wywołanie `list_triggers` zadziała tylko w sesji, która ma konektor
`Claude_Code_Remote`. Rozkład na naszych runnerach:

| Runner | Konektorów | `Claude_Code_Remote` |
|---|---|---|
| Kontroler (raport tygodnia) | 6 | **tak** |
| Łowca promocji | 0 | nie |
| Scout nowości | 0 | nie |
| Radar konkurencji | 0 | nie |
| Wycofania | 0 | nie |
| Backfill cen katalogowych | 0 | nie |

Czyli sekcja o harmonogramie może powstawać **wyłącznie w raporcie Kontrolera** —
żaden inny runner listy nie zobaczy. Pole `environment_id` nie jest zwracane
w ogóle, a `session_request.environment_variables` jest puste u wszystkich
dwunastu Routines i niczego o dostępach nie dowodzi.

<!-- HARMONOGRAM:START — generuje scripts/harmonogram-z-konta.mjs, nie edytuj ręcznie -->

## Zrzut — runnery LEGO

**Odczyt z konta: 14.09 17:30 (CEST, UTC+2).** Objął **12 Routines** — pełna lista, bez paginacji.

Tej sekcji nie pisze się ręcznie. Generuje ją `scripts/harmonogram-z-konta.mjs`
z odpowiedzi `list_triggers`, a uruchamia Kontroler w cotygodniowym raporcie.

| Zadanie | Cron (UTC) | Start PL | Stan | Ostatnie odpalenie (PL) | Status przebiegu | Trigger |
|---|---|---|---|---|---|---|
| LEGO co 8h (4:00/12:00/20:00 PL) — Backfill cen katalogowych (runner z pushem) | `0 2,10,18 * * *` | 04:00 / 12:00 / 20:00 | ❌ wyłączony | — | — nigdy nie odpalony | `trig_01D5ZK2mHY9CSXAQNnfwaV3q` |
| LEGO 05:00 — Scout nowości (runner z pushem, Opus 5) | `0 3 * * *` | 05:00 | ✅ | 14.09 05:05 | ✅ SUCCEEDED | `trig_01Nos3qQb8GJFAVMR1SyEEZT` |
| LEGO 08:00 — Radar konkurencji (runner, Opus 5) | `0 6 * * *` | 08:00 | ✅ | 14.09 08:01 | ✅ SUCCEEDED | `trig_01UpMJdpeguEtby68saqBMpD` |
| LEGO pon 09:00 — Kontroler (raport tygodnia) [env projektu] | `0 7 * * 1` | pon 09:00 | ✅ | 14.09 10:57 | ✅ SUCCEEDED | `trig_01JhfcGMgzv1nBwiguH93m6N` |
| LEGO pon 09:00 — Kontroler (raport tygodnia) [STARY, wyłączony 14.09 — zastąpiony przez env projektu] | `0 7 * * 1` | pon 09:00 | ❌ wyłączony | 14.09 09:10 | ✅ SUCCEEDED | `trig_01T8AhciW8JD651MrSMuEj7m` |
| LEGO ndz 10:00 — Social: paczka tygodniowa (ZAWIESZONE do startu kanałów) | `0 8 * * 0` | ndz 10:00 | ❌ wyłączony | — | — nigdy nie odpalony | `trig_01W1CSp8PM3DDN6UEyNLYe6H` |
| LEGO pon 06:00 — Wycofania (runner z pushem) | `10 4 * * 1` | pon 06:10 | ✅ | 14.09 06:10 | ✅ SUCCEEDED | `trig_01EZNzF51DPkHRyKkS7MhNBn` |
| LEGO 08:30 — Łowca promocji (runner z pushem) | `30 6 * * *` | 08:30 | ✅ | 14.09 08:39 | ✅ SUCCEEDED | `trig_014koskPHBgxP79gLKcLqGvf` |

### Pozostałe Routines na tym samym koncie

Nie dotyczą serwisu, ale **dzielą z runnerami ten sam limit użycia** — a to on
wywrócił harmonogram 21.08. Trzymane tu, żeby obraz obciążenia konta był pełny.

| Zadanie | Cron (UTC) | Start PL | Stan | Ostatnie odpalenie (PL) | Status przebiegu | Trigger |
|---|---|---|---|---|---|---|
| send_later 2026-08-15T06:00Z #25932e | `jednorazowo 15.08 08:00` | — | ❌ auto_disabled_session_gone | — | — nigdy nie odpalony | `trig_013x6kw7r5J1a1YBES3V3YuH` |
| Angielski — tygodniowy plan nauki (pon 7:00) | `0 5 * * 1` | pon 07:00 | ✅ | 14.09 07:10 | ✅ SUCCEEDED | `trig_018atJTaRWiyA8b7ewyV2zWz` |
| Herzfaden — poniedziałkowy raport tygodniowy | `0 6 * * 1` | pon 08:00 | ✅ | 14.09 08:04 | ✅ SUCCEEDED | `trig_01NNWsc3SwnJ5Ticc86oT8AZ` |
| inwestycja IV kwartal | `0 7 * * 1` | pon 09:00 | ✅ | 14.09 09:13 | ✅ SUCCEEDED | `trig_0151L3p8bvgtK4z2otWCUCSt` |

### Kolizje — zadania na tej samej minucie

- `0 7 * * 1` (pon 09:00):
  - LEGO pon 09:00 — Kontroler (raport tygodnia) [env projektu]
  - inwestycja IV kwartal

<!-- HARMONOGRAM:KONIEC -->

### Dwa Kontrolery — dlaczego stary jest wyłączony *(14.09.2026)*

Kontroler odpalał się rano dwa razy: stary trigger z 11.08 o 07:10 UTC i nowy
`[env projektu]`, założony 14.09 o 08:54, o 08:57. Oba `0 7 * * 1`, oba
SUCCEEDED — czyli dwa raporty w każdy poniedziałek i podwójne zużycie limitu
w najciaśniejszym oknie tygodnia.

Różnica nie jest kosmetyczna, ale **nie wiadomo dokładnie, na czym polega**.
Sprawdzenie 14.09: `session_request.environment_variables` jest puste u
**wszystkich** Routines na koncie, także u nowego — to pole trzyma nadpisania,
a nie zmienne środowiska, więc niczego nie dowodzi (moja pierwsza wersja tego
akapitu twierdziła inaczej i była błędna). `list_triggers` nie pokazuje
`environment_id`, więc z API nie da się porównać, w jakim środowisku startuje
który runner. Pewne jest tylko tyle: nowy trigger nazwano `[env projektu]`,
a raport z 14.09
(`materialy/kontroler-2026-09-14.md`) nie ma sekcji o kliknięciach, EPC,
widoczności i indeksacji, i stąd jego rekomendacja numer jeden brzmi
„przywrócić poświadczenia" — w środowisku projektu one są i działają
(sprawdzone 14.09: `kliki-raport.mjs --dni 7` zwraca 940 kliknięć,
`gsc-raport.mjs --dni 7` — 70 wyświetleń i 1 klik). Raport nie był więc błędny,
tylko opisywał środowisko bez dostępów.

Stary trigger jest **wyłączony, nie skasowany** — zachowuje historię przebiegów
i prompt (ten sam w obu). Gdyby nowy okazał się gorszy, wystarczy
`update_trigger` z `enabled: true`.

**Trigger Radara 13:00 (`trig_01KbUQcgjek5iQFhbyokoLLi`) już nie istnieje** —
był wyłączony od 15.08, zniknął z konta między 30 a 31.08. Nie odtwarzać:
drugi przebieg Radara został wycofany świadomie 21.08 dla oszczędności limitu.

### Poniedziałek rano — wąskie gardło

**Pięć zadań między 07:00 a 09:30** (Angielski, Herzfaden, Radar, Łowca,
Kontroler + inwestycja). Przy kolejnym uderzeniu w limit to jest pierwsze
miejsce do rozsunięcia. Aktualną listę kolizji podaje blok generowany wyżej.

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

**Empik ma inny rytm niż Łowca.** Łowca chodzi codziennie o 08:30, a zrzut
Empiku robi Cowork **raz w tygodniu, w poniedziałek** — Empik blokuje ruch
serwerowy, więc katalog trzeba przejść lokalną przeglądarką. Import zrzutu jest
więc poza codzienną instrukcją Łowcy: Cowork wgrywa plik do jego sesji z notką,
a Łowca importuje ceny i od 14.09.2026 uruchamia też
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
