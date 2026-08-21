# Zadania cykliczne (Routines) — stan na 21.08.2026

Runnery to trwałe sesje Claude z dopiętym repo; każdy pushuje bezpośrednio na `main`.
Godziny podane w czasie polskim (cron w panelu jest w UTC).

| Godzina | Zadanie | Trigger | Sesja | Co robi |
|---|---|---|---|---|
| 05:00 | Scout nowości | `trig_01PoDaJxGarknENXdQyPt4zs` | `session_0135w54udb1cBHBQ5pYEzYRS` | nowe zestawy → `sety.json`, `known_sets.json` |
| 06:00 | Wycofania | `trig_01EZNzF51DPkHRyKkS7MhNBn` | `session_01KfWF14fJvwK78sBVG6XAz8` | `wycofania.json` |
| 07:00 | Łowca promocji | `trig_014koskPHBgxP79gLKcLqGvf` | `session_017FKg5b8kSCwbJd8r7xPrwD` | ceny i linki → `oferty_feed.json`, `ceny_baza.json`, `redirects.json` |
| 08:00 | Radar konkurencji | `trig_01Fr7df9Hfc3n4eBHKY6du4H` | `session_014pPdvW1SE9AFW4TnaBPV3z` | `konkurencja_baza.json` |
| 12:00 | Backfill cen katalogowych | `trig_01UYsxXohZqiBKinEAhSDxrT` | `session_01JSfUBJxddBbATeaXhQ6efS` | pole `cena_katalogowa` w `katalog.json` |
| pon 09:00 | Kontroler (raport tygodnia) | `trig_01T8AhciW8JD651MrSMuEj7m` | świeża sesja | raport PDF na maila |
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

## Jak edytować zadanie

Prompt Routine przypiętej do cudzej sesji **nie da się** zmienić przez
`update_trigger` („editing the prompt … is not available via this tool") —
trzeba `delete_trigger` + `create_trigger` z tym samym `persistent_session_id`.
Nazwę, cron i stan `enabled` można zmieniać normalnie.
