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

## Rozstrzygnięte 19.10.2026: zadanie 11:47 musi powstać na komputerze Marka

Trigger `trig_01Umoo2wdqxj6u5qTwUjjQqa` został założony z sesji Kontrolera w chmurze i **nie ma
powiązania z komputerem** — a tego samego dnia API odpowiedziało przy innym zadaniu
(„Kolejka GSC — zgłoszenia”), że ono „wymaga Claude Desktop (macOS): działa tam, z narzędziami
tego komputera”. Czyli dostęp do Chrome daje powiązanie z komputerem, nie konektor, i dostaje je
tylko zadanie założone w aplikacji Claude Desktop na tym komputerze. Zadanie z chmury odpaliłoby
sesję bez przeglądarki (prompt ma na to bezpiecznik: jedno zdanie i koniec, bez obchodzenia blokady).

Dlatego 19.10 trigger `trig_01Umoo2wdqxj6u5qTwUjjQqa` został **wyłączony** (nie skasowany — do
skasowania, gdy powstanie właściwe zadanie). Do zrobienia przez Marka, w Claude Desktop na Macu:
nowe zadanie cykliczne „Kontrola linków w przeglądarce”, 1. dnia miesiąca ok. 11:47, z promptem
poniżej. Zadanie 07:49 (lista, `trig_01EePabyXvKUkSkb4bjMoayw`) zostaje bez zmian — działa w chmurze
z repo i tam ma być.

## Prompt do wklejenia w zadanie na komputerze

```
Miesięczna kontrola linków sklepowych, których nie da się sprawdzić z serwera (decyzja Marka 19.10.2026, wariant A). Allegro, Empik, Media Expert, LEGO.com i x-kom odrzucają ruch serwerowy, więc cotygodniowa kontrola w repo pisze o nich „blokada sklepu” i nie wie nic — a to one zbierają większość kliknięć czytelników. Dlatego raz w miesiącu te linki otwiera przeglądarka.

Pracujesz w Chrome przez rozszerzenie Claude in Chrome — najpierw przeczytaj skill chrome-browser i załaduj narzędzia mcp__claude-in-chrome__* jednym wywołaniem ToolSearch. Pracuj w nowej karcie. Jeśli narzędzi Chrome nie da się załadować — NIE szukaj obejścia (nie sprawdzaj tych adresów curl-em ani przez Firecrawla: sklepy odrzucą ruch serwerowy, a to cały powód tego zadania). Napisz jednym zdaniem, że przeglądarka jest nieosiągalna, i zakończ.

1. Otwórz https://github.com/MarekDOLEW/blogoklockach/blob/main/materialy/kontrola-przegladarkowa/lista.md i przeczytaj datę z nagłówka oraz tabelę. Jeśli data jest starsza niż 7 dni — nic nie sprawdzaj, napisz „lista nieaktualna (data …), zadanie o 07:49 jej nie odświeżyło” i zakończ.
2. Dla każdego wiersza otwórz adres z kolumny „Karta produktu” i zapisz wynik jako jedno z: `żywy` (otwiera się karta tego produktu), `404` (karta nie istnieje), `przekierowanie` (sklep przerzuca na listing, kategorię albo stronę główną — to NIE jest żywa karta), `inne: <co widać>` (captcha, błąd, pusta strona).
3. Czego nie wolno: nie wchodź na linki trackingowe (`pdt.tradedoubler.com`, `clk.tradedoubler.com`, `webep1.com`, `track.performers.tech`, `allegro.pl/affiliate`) ani na adresy `tylkoklocki.pl/idz/...` — każde takie wejście to sztucznie nabity klik w sieci afiliacyjnej, z przeglądarki tak samo jak z serwera. W tabeli są wyłącznie adresy docelowe sklepów i tylko te otwieraj. Nic nie kupuj, nie dodawaj do koszyka, nie loguj się, nie rozwiązuj CAPTCHY — przy CAPTCHY zapisz `inne: captcha` i przejdź dalej.
4. Odpowiedz: jedna linijka podsumowania („żywe X, 404 Y, przekierowania Z, inne W z N; po sklepach: …”), a pod nią pełna tabela w układzie listy (Sklep | Zestaw | Karta produktu | Wynik), wypełniona i w markdownie — trafi do repo jako `materialy/kontrola-przegladarkowa/wyniki-RRRR-MM-DD.md`.
5. Jeśli wyszło cokolwiek innego niż `żywy`, dopisz jedno zdanie: ile kart jest martwych i w których sklepach — martwe karty Empiku idą do `scripts/empik-redirects.mjs --usun-martwe`, pozostałe sklepy wymagają decyzji, bo z ich map linków nie kasujemy wpisów.

Odpowiadaj po polsku. Nie zakładaj nowych zadań cyklicznych i nie zmieniaj niczego w repo.
```
