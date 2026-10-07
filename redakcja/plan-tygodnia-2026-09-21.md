# Plan tekstów na tydzień 21–27.09.2026 — 30 tekstów, start kadencji 30/tydzień

*Decyzja Marka 15.09.2026: wracamy do 30 tekstów tygodniowo. To pierwszy tydzień w tym rytmie. Plan zbudowany z danych serwisu (stan 15.09): wycofania grudnia potwierdzone przez LEGO, nowości wrzesień–październik, karty Piotra bez tekstu, dzisiejsze deale ≥30%, luki w kategoriach (0 tekstów historycznych, 1 poradnik, 1 kalendarz, 2 prezentowniki wg wieku). Dobór kieruje się sezonem: Google potrzebuje 6–10 tygodni na rozkręcenie strony, więc teksty pod Black Friday i prezenty świąteczne muszą wejść we wrześniu i na początku października.*

## Zasady tygodnia

- **Podział:** Piotr 11 tekstów (recenzje, porównania, historyczne), Code 11 (rankingi, prezentowniki, poradniki, kalendarze — strony na danych i teksty z drabiną cenową), Cowork/Marek 6 (premiery z danych Scouta, poradnik o ekskluzywach), Łowca 2 (posty dealowe według reguły ≥35%/RRP ≥300 zł). Rytm: 5 tekstów dziennie od poniedziałku do piątku, 5 w weekend.
- **Standard:** teksty redakcyjne wg skilla `lego-standard-redakcyjny` (7 kategorii), sprzedażowe wg `lego-standard-sprzedazowy`. Kategoria w frontmatterze z zamkniętej listy — build sprawdza.
- **Ceny:** żaden tekst nie podaje bieżącej ceny sklepu; drabina cenowa + próg zakupu + link do huba `/zestaw/<nr>/`, gdzie tabela cen aktualizuje się sama.
- **Karty researchu:** dla tekstów pisanych w Code powstają w `redakcja/karty/`; Piotr prowadzi karty u siebie (ustalenie 15.09).
- **Zdjęcia:** przy każdym nowym tekście z galerią dopisać `galerie.json` i uruchomić `node scripts/r2-obrazy.mjs` od razu.

## Poniedziałek 21.09 — otwarcie sezonu wycofań i Black Friday

| # | Kategoria | Tytuł roboczy | Zestawy / dane | Kto | Po co teraz |
|---|---|---|---|---|---|
| 1 | Kalendarze | Wycofania LEGO grudzień 2026 — pełna lista z terminami i co kupić najpierw | wszystkie wpisy `kiedy: grudzień 2026, status: potwierdzone` | Code | pozycja „planowane" od 1.09, kotwica sezonu; 60+ dni do indeksacji |
| 2 | Poradniki | Black Friday LEGO 2026 — jak się przygotować, gdzie były najniższe ceny w 2025, czego nie kupować przed | dane z `ceny_baza`, kalendarz promocji | Code | jedyny tekst pod frazę sezonową z realnym wolumenem; musi być do 15.10 |
| 3 | Recenzje | LEGO 76354 Lotniskowiec T.A.R.C.Z.Y. — recenzja | 76354 (karta jest) | Piotr | najdroższy Marvel roku, karta gotowa, 0 tekstów o zestawie |
| 4 | Rankingi | Najlepsze zestawy Star Wars na wycofaniu 2026 — ranking przed grudniem | 75397, 75382, 75389, 75413, 75435, 75428, 75430 | Code | 7 potwierdzonych wycofań SW bez tekstu, najwyższe RRP na liście |
| 5 | Premiery | LEGO 11386 SpongeBob Kanciastoporty: Bikini Dolne — nowość Icons | 11386 (karta jest) | Cowork/Marek | premiera wrześniowa, ekskluzyw, 899,99 zł, zero tekstów |

## Wtorek 22.09 — prezenty wg wieku (dane są, stron nie ma)

| # | Kategoria | Tytuł roboczy | Zestawy / dane | Kto | Po co teraz |
|---|---|---|---|---|---|
| 6 | Prezentownik | LEGO dla 5-latka — 8 zestawów wg budżetu | `wiek` z sety.json + wzorzec 8 progów | Code | pole `wiek` dla 1 170 zestawów, stron wg wieku są 2; najczęstsze pytanie rodzica |
| 7 | Prezentownik | LEGO dla 8-latka — 8 zestawów wg budżetu | jw. | Code | jw. |
| 8 | Recenzje | LEGO 42232 Koenigsegg Sadair's Spear — recenzja Technic | 42232 (karta jest) | Piotr | 1 949,99 zł, karta gotowa |
| 9 | Porównania | Mroczny Sokół 75389 kontra UCS Sokół 75192 — który przed wycofaniem | 75389, 75192 | Piotr | oba na liście wycofań XII; 75192 to najczęściej wyszukiwany zestaw na liście |
| 10 | Premiery | LEGO 11385 Star Trek: Mostek U.S.S. Enterprise — nowość Icons | 11385 (karta jest) | Cowork/Marek | nowa licencja, 779,99 zł |

## Środa 23.09 — Icons i kolekcjoner

| # | Kategoria | Tytuł roboczy | Zestawy / dane | Kto | Po co teraz |
|---|---|---|---|---|---|
| 11 | Rankingi | Najlepsze LEGO Icons do 600 zł — ranking 2026 | 10351, 10341 (wycofanie XII), 11379, 10362, 10280… | Code | Icons = największa seria w ekskluzywach i wycofaniach; próg 600 zł to koszyk AFOL |
| 12 | Recenzje | LEGO 43302 Main Street, U.S.A. — recenzja Disney | 43302 (karta jest) | Piotr | 1 499,99 zł, karta gotowa |
| 13 | Poradniki | Ekskluzywy LEGO — dlaczego nie czekać na promocję w sklepach i kiedy LEGO samo obniża cenę | `/ekskluzywne/` (126 zestawów), okna promocyjne Insiders | Cowork/Marek | nowa strona działu potrzebuje tekstu wspierającego |
| 14 | Historyczne | Bionicle — co dziś warte są zestawy i od czego zacząć kolekcję | seria archiwalna, huby z cenami Allegro | Piotr | kategoria Historyczne ma 0 tekstów; serie archiwalne mają huby od 15.09 |
| 15 | Premiery | LEGO 21373 Downton Abbey — zapowiedź Ideas (etykieta „Wkrótce dostępne" na lego.pl) | 21373 | Cowork/Marek | 1 299,99 zł, w katalogu lego.pl, brak tekstu |

## Czwartek 24.09 — prezenty świąteczne i poradniki

| # | Kategoria | Tytuł roboczy | Zestawy / dane | Kto | Po co teraz |
|---|---|---|---|---|---|
| 16 | Poradniki | Prezent LEGO na święta 2026 wg budżetu: 100, 200, 400, 800 zł | drabina progów z wzorca, huby | Code | 0 tekstów świątecznych; szczyt popytu za 8 tygodni |
| 17 | Recenzje | LEGO 11374 Automat do gry pinball — recenzja | 11374 (karta jest) | Piotr | 899,99 zł, karta gotowa |
| 18 | Porównania | Pinball 11374 kontra Pac-Man 10323 — który automat na półkę | 11374, 10323 | Piotr | domknięcie tematu z recenzją tego samego dnia |
| 19 | Prezentownik | LEGO dla 12-latka — 8 zestawów wg budżetu | `wiek` z sety.json | Code | trzeci przedział wieku |
| 20 | Premiery | Święta 2026 w LEGO: ozdoby, Buddy the Elf, sanie Mikołaja i kalendarze adwentowe — co weszło | 40862, 40865, 40866 + kalendarze | Cowork/Marek | fala Seasonal bez tekstu; kalendarze mają ranking, reszta nie |

## Piątek 25.09 — Star Wars, deale, kalendarz premier

| # | Kategoria | Tytuł roboczy | Zestawy / dane | Kto | Po co teraz |
|---|---|---|---|---|---|
| 21 | Recenzje | LEGO 75453 Piaskoczołg wędrownych Jawów — recenzja | 75453 (karta jest) | Piotr | 869,99 zł, karta gotowa |
| 22 | Kalendarze | Kalendarz premier LEGO IV kwartał 2026 — październik, listopad, grudzień | zapowiedzi potwierdzone z sety.json (premiera ≥ 2026-10), `/przecieki/` tylko linkiem | Code | kategoria Kalendarze ma 1 tekst; zapowiedzi potwierdzone vs przecieki osobno |
| 23 | Deal | Post dealowy wg reguły Łowcy (kandydat 15.09: 76156 Domo powstaje −52%, RRP 479,99 zł) | z przebiegu Łowcy 25.09 | Łowca | reguła ≥35%/RRP ≥300 zł w sklepie |
| 24 | Poradniki | Jak czytać ceny LEGO: cena katalogowa, promocja, minimum, „dobra cena" — instrukcja do naszych tabel | mechanika hubów, `ceny_baza` | Code | wyjaśnia rabat od RRP (jedyni tak liczymy) i przygotowuje werdykt „dobra cena" |
| 25 | Premiery | LEGO 43024 Kask Ayrton Senna — nowość F1 | 43024 | Cowork/Marek | 379,99 zł, dziś −26% w sklepach |

## Weekend 26–27.09 — domknięcie

| # | Kategoria | Tytuł roboczy | Zestawy / dane | Kto | Po co teraz |
|---|---|---|---|---|---|
| 26 | Recenzje | LEGO 71872 Bitwa z ultrasmokiem — recenzja Ninjago | 71872 (karta jest) | Piotr | 869,99 zł, karta gotowa |
| 27 | Porównania | Kask Senna 43024 kontra kask Hamilton 43022 — który dla fana F1 | 43024, 43022 (−47% dziś) | Piotr | 43022 jest w dealach ≥30% |
| 28 | Rankingi | Najlepsza cena za klocek w LEGO City — ranking 2026 | katalog City, zł/klocek z RRP | Code | strona na danych; City = największa seria w katalogu |
| 29 | Historyczne | LEGO Castle 1978–1997 — zamki, które zbudowały serię, i ile dziś kosztują | seria archiwalna Castle, huby | Piotr | drugi tekst historyczny; Castle wróciło w Icons (10305, 10332) |
| 30 | Deal | Post dealowy nr 2 wg reguły Łowcy (kandydaci 15.09: 60339 −50%, 10291 −48%) | z przebiegu Łowcy 26–27.09 | Łowca | limit 2 posty tygodniowo |

## Aktualizacje poza liczbą 30 (ten sam tydzień)

- 9 prezentowników z 6 zestawami do uzupełnienia do 8 wg drabiny progów: Ninjago, Icons, Star Wars, Botanicals, Technic, Speed Champions, Friends, City, Harry Potter (Code, z danych; Piotr sprawdza dobór).
- `/o-nas/` z nazwiskami, kontaktem i metodologią cen — bez tego artykuły podpisane „Piotr M." prowadzą do strony, która autora nie potwierdza (Marek i Piotr piszą, Code wstawia).
- Karty Piotra bez tekstu po tym tygodniu: 31221 Klimt, 42240 Aston Martin F1, 21369 X-Files, 77082 Jaskinia Ubawu — kandydaci na tydzień 28.09.

## Co mierzymy po tygodniu (Kontroler, poniedziałek 28.09)

Liczba opublikowanych tekstów vs 30; które z 30 mają kartę (Code) lub źródła (Piotr); ile nowych adresów weszło do sitemapy priorytetowej; pierwsze wyświetlenia w Search Console dla fraz „black friday lego 2026", „wycofania lego grudzień 2026", „lego dla 5-latka".
