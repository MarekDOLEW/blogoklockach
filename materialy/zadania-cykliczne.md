# Zadania cykliczne (Routines) — stan na 21.08.2026

Runnery to trwałe sesje Claude z dopiętym repo; każdy pushuje bezpośrednio na `main`.
Godziny podane w czasie polskim (cron w panelu jest w UTC).

| Godzina | Zadanie | Trigger | Sesja | Co robi |
|---|---|---|---|---|
| 05:00 | Scout nowości **(Opus 5)** | `trig_01Nos3qQb8GJFAVMR1SyEEZT` | `session_012AZejbFzsfzkTh4FPaAkVg` | nowe zestawy → `sety.json`, `known_sets.json` |
| 06:00 | Wycofania | `trig_01EZNzF51DPkHRyKkS7MhNBn` | `session_01KfWF14fJvwK78sBVG6XAz8` | `wycofania.json` |
| 07:00 | Łowca promocji | `trig_014koskPHBgxP79gLKcLqGvf` | `session_017FKg5b8kSCwbJd8r7xPrwD` | ceny i linki → `oferty_feed.json`, `ceny_baza.json`, `redirects.json` |
| 08:00 | Radar konkurencji **(Opus 5)** | `trig_01UpMJdpeguEtby68saqBMpD` | `session_01UFkqKNwQexnxLN34HotM4G` | `konkurencja_baza.json` + rekomendacje redakcyjne |
| 12:00 | Backfill cen katalogowych | `trig_01UYsxXohZqiBKinEAhSDxrT` | `session_01JSfUBJxddBbATeaXhQ6efS` | pole `cena_katalogowa` w `katalog.json` |
| pon 09:00 | Kontroler (raport tygodnia) **(Opus 5)** | `trig_01T8AhciW8JD651MrSMuEj7m` | świeża sesja | raport PDF na maila |
| ndz 10:00 | Social: paczka tygodniowa | `trig_01W1CSp8PM3DDN6UEyNLYe6H` | — | **ZAWIESZONE** do startu kanałów i dopracowania stylu |

## Zmiany z 21.08.2026 (oszczędność limitu)

Konto uderzyło w tygodniowy limit użycia (sesje Łowcy i Backfillu dostały status
`rejected`). Wprowadzone korekty:

1. **Łowca nie parsuje już surowych feedów.** Robi to `scripts/feedy-lego.py`:
   pobiera ME/PK/Allegro i zapisuje wyciąg wyłącznie z ofertami LEGO
   (~4 MB zamiast ~630 MB; ME 758 setów, PK 1299, Allegro 7037).
2. **Backfill z 2× dziennie na 1× o 12:00** — ostatnie przebiegi dokładały
   pojedyncze ceny, pula jest niemal wyczerpana.
3. **Radar z 2× dziennie na 1× o 08:00** (przebieg 16:00 usunięty).
4. **Scout ograniczony do trzech źródeł:** Brickset (dane katalogowe),
   PromoBricks i StoneWars (zapowiedzi). lego.com i BrickLink blokują nasz
   ruch (403/405) — nie próbować.
5. **Social zawieszony** do uruchomienia kanałów.

## Modele (21.08.2026)

Podział wynika z charakteru pracy, nie z prestiżu modelu:

- **Opus 5** — Scout (pisze opisy zestawów), Radar (ocenia konkurencję i rekomenduje
  tematy), Kontroler (analiza tygodnia). Zadania wymagające sądu i dobrego polskiego.
- **Fable 5** — Łowca, Wycofania, Backfill. Po przeniesieniu parsowania do skryptów
  to praca mechaniczna: uruchom, porównaj liczby, zapisz JSON.

Model jest własnością SESJI, nie Routine: `update_trigger --model` działa tylko dla
zadań tworzących świeżą sesję (Kontroler). Runner przypięty do trwałej sesji
zachowuje jej model — żeby go zmienić, trzeba `create_session` z nowym modelem
i przepiąć trigger (tak zrobiliśmy ze Scoutem i Radarem 21.08).
Stare sesje na Fable (`session_0135w54udb1cBHBQ5pYEzYRS` Scout,
`session_014pPdvW1SE9AFW4TnaBPV3z` Radar) nie mają już triggerów — zostają
nieaktywne jako archiwum kontekstu.

## Jak edytować zadanie

Prompt Routine przypiętej do cudzej sesji **nie da się** zmienić przez
`update_trigger` („editing the prompt … is not available via this tool") —
trzeba `delete_trigger` + `create_trigger` z tym samym `persistent_session_id`.
Nazwę, cron i stan `enabled` można zmieniać normalnie.
