# Kontrola linków w przeglądarce — zadanie miesięczne

Po co: Allegro, Empik, Media Expert, LEGO.com i x-kom odrzucają ruch serwerowy
(403/429/503 albo timeout), więc cotygodniowa `scripts/kontrola-linkow.mjs` pisze
o ich linkach „blokada sklepu" i **nie wie o nich nic** — a to one zebrały 36 z 54
polskich kliknięć w tygodniu do 19.10.2026 (67%). Decyzja Marka 19.10.2026
(wariant A z raportu Kontrolera): raz w miesiącu te linki otwiera przeglądarka.

## Dwa zadania, nie jedno

| Kiedy | Co | Trigger |
|---|---|---|
| 1. dnia miesiąca, 07:49 PL | Kontroler (stała sesja z repo) losuje 20 adresów i pushuje `lista.md` | `trig_01EePabyXvKUkSkb4bjMoayw` |
| 1. dnia miesiąca, 11:47 PL | świeża sesja z Chrome przechodzi listę i oddaje wypełnioną tabelę | `trig_01Umoo2wdqxj6u5qTwUjjQqa` |

Rozdzielone, bo listę może wygenerować tylko sesja z repo, a sprawdzić tylko
sesja z przeglądarką. Lista leży pod **stałą ścieżką** (`lista.md`), bo zadanie
Coworka otwiera ją pod niezmiennym adresem; datę trzyma nagłówek pliku i to ją
sprawdza Cowork przed pracą (tak samo jak `materialy/indeksacja/kolejka.md`).

## Czego to zadanie NIE robi

- **nie wchodzi na linki trackingowe** (`pdt.tradedoubler.com`, `webep1.com`,
  `track.performers.tech`, `allegro.pl/affiliate`) ani na `tylkoklocki.pl/idz/...`
  — każde takie wejście to sztucznie nabity klik w sieci afiliacyjnej, z przeglądarki
  dokładnie tak samo jak z serwera. W `lista.md` są wyłącznie adresy docelowe sklepów;
- **nie obchodzi blokady serwerowej** curl-em ani Firecrawlem, gdy przeglądarka jest
  nieosiągalna — wtedy pisze jedno zdanie i kończy;
- **nie zmienia niczego w repo** — oddaje tabelę do rozmowy.

## Co z wynikiem

Wypełnioną tabelę wkleja się do repo jako
`materialy/kontrola-przegladarkowa/wyniki-RRRR-MM-DD.md`. Martwe karty **Empiku**
idą do `scripts/empik-redirects.mjs --usun-martwe` (to jedyna mapa linków poza
`redirects.xkom`, z której wolno kasować wpisy). Dla pozostałych sklepów martwa
karta wymaga decyzji — mapy linków są append-only. Kolejny przebieg o 07:49
przenosi niezamknięte wyniki do `DZIENNIK.md` jako pozycję „KONTROLER · Do zrobienia".

## Do sprawdzenia przy pierwszym przebiegu (19.10.2026)

Zadanie o 11:47 zostało założone z tej sesji i **nie ma zapisanych konektorów** —
API ostrzegło, że sesje odpalane takim triggerem startują bez narzędzi konektorowych.
Dla porównania „Kolejka GSC — zgłoszenia" (`trig_01NNqijkQrcpLpD89bVW8ST6`, ten sam
mechanizm, działa) ma zapisanych osiem konektorów, ale **rozszerzenia Claude in Chrome
nie ma wśród nich** — dostęp do przeglądarki idzie przez powiązanie z komputerem,
nie przez konektor. Czyli najpewniej zadziała, ale to „najpewniej", nie „zmierzone".
Pierwszy przebieg 01.11.2026 to pokaże; jeśli napisze, że przeglądarka jest
nieosiągalna, Marek zakłada to zadanie z panelu Routines na claude.ai (wtedy
niesie konektory konta) i stare kasuje.
