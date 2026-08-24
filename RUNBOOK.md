# Runbook — tylkoklocki.pl

Wiedza operacyjna: pułapki, ograniczenia zewnętrznych systemów, procedury
awaryjne. Rzeczy kupione czasem, nie do odtworzenia z kodu.

**Czego tu nie ma:** harmonogramu runnerów (`materialy/zadania-cykliczne.md`,
generowany), podziału pracy (`NARZEDZIA.md`, `redakcja/wspolpraca.md`),
bieżących zadań (`DZIENNIK.md`).

Każdy wpis ma datę ustalenia. Jeśli ustalenie przestaje być prawdziwe —
popraw je i zmień datę, nie dopisuj sprzeczności na dole. Poprzedni dokument
zginął właśnie tak: nowe ustalenia dopisano niżej, tabeli u góry nie poprawiono.

---

## Obieg plików danych

Wszystkie dane serwisu trafiają do `src/data/` w repo, gałąź `main`.
Push na `main` uruchamia build i deploy w Cloudflare automatycznie — strona
odświeża się w ~2 minuty, nic więcej się nie klika.

Runnery pushują same. **Ścieżka awaryjna** (gdy sesja nie ma dostępu do repo):
runner oddaje gotowy plik w czacie → GitHub → `src/data/` → *Add file →
Upload files* → przeciągnij → *Commit changes*.

### Żelazna reguła aktualizacji

**Pobierz aktualny plik z repo → dołóż zmiany → zwaliduj → wypchnij.**
Nigdy nie twórz od zera, nigdy nie usuwaj cudzych wpisów. Append-only.

Gdy sesja buduje dane w czacie, zawsze podaj jej link do surowego pliku:

```
https://raw.githubusercontent.com/MarekDOLEW/blogoklockach/main/src/data/<plik>
```

Przy weryfikacji dodaj `?t=<cokolwiek>` — cache CDN bywa nieświeży.

---

## Mapa plików danych

Który plik co zasila na stronie. Kolumna „co zasila" jest tu jedynym takim
zestawieniem w całym repo — przed zmianą formatu któregokolwiek z tych plików
sprawdź, co się posypie.

Kolumna „kto zapisuje" odzwierciedla realną konfigurację triggerów
(stan 23.08.2026) — przy rozbieżności rozstrzyga
`materialy/zadania-cykliczne.md`.

| Plik w `src/data/` | Kto zapisuje | Co zasila na stronie |
|---|---|---|
| `sety.json` | Scout 05:00 (nowe sety) + Łowca 07:00 (ceny, oferty, zdjęcia) | `/nowosci/`, podstrony `/zestaw/{nr}/`, sekcja „Śledzone" na stronach serii |
| `wycofania.json` | Wycofania 06:00 | `/wycofania/` — lista, filtr, FAQ |
| `katalog.json` | Backfill 12:00 (pole `cena_katalogowa`) + sesje ad hoc (dokładanie serii) | katalogi historyczne na `/serie/{seria}/` + kafelki na `/serie/` |
| `redirects.json` | Łowca 07:00 (linki z feedu) + sesje ad hoc | przekierowania `/idz/{sklep}/{nr}` i widoczność przycisków sklepowych |
| `sklepy.json` | Łowca 07:00 (nowe sklepy) | nazwy sklepów w tabelach cen |
| `oferty_feed.json` | Łowca 07:00 | ceny i oferty w tabelach na podstronach zestawów |
| `ceny_baza.json` | Łowca 07:00 | historia cen, drabina cenowa |
| `known_sets.json` | Scout 05:00 | nic — stan runnera, nie zasila strony |
| `konkurencja_baza.json` | Radar 08:00 | nic — stan runnera, nie zasila strony |
| `obrazy.json` | `scripts/generuj-obrazy.mjs` w prebuild | zdjęcia zestawów |
| `afiliacje_rejestr.json` | ręcznie | nic — dokumentacja |
| `raporty_mail.json` | ręcznie | odbiorcy raportów PDF |

Trzy ostatnie pozycje w kolumnie „co zasila" to celowe „nic" — te pliki są
dokumentacją albo stanem runnerów. Warto o tym wiedzieć, zanim ktoś uzna je
za martwe i skasuje.

---

## Media Expert *(ustalone 18.08.2026)*

**Feed aktualizuje się 2× na dobę, ale z opóźnieniem uploadu.** Stemple
`<updated>` to 00:30 i 18:30 CEST, jednak plik ląduje na
`storage.googleapis.com` około **7 godzin później** — nocny ok. 07:40,
wieczorny w środku nocy.

Praktyczny skutek: przebieg Łowcy o 07:00 zawsze dostaje **wczorajszą wieczorną
wersję**. Świeżej nocnej nie zobaczy. Przy planowaniu zmian godzin trzeba to
uwzględnić, inaczej „poprawka" nic nie da.

**Stron produktowych ME nie da się weryfikować punktowo z sesji.** curl
i WebFetch dostają HTTP 403, prawdziwa przeglądarka (Chromium) — reset
połączenia. ME blokuje ruch z data center. WebFetch działał do 16.08.2026,
potem przestał.

Wniosek obowiązujący: **ceny ME bierzemy wyłącznie z feedu afiliacyjnego**
(oficjalny, wiarygodny). Weryfikację na stronach robimy tylko dla Planety
Klocków.

---

## Typowanie deali *(ustalone 18.08.2026)*

Deale dnia typujemy w **trzech półkach cenowych**: do 200 zł, 201–800 zł,
801 zł i więcej.

Powód: rabat procentowy naturalnie faworyzuje tanie zestawy, przez co drogie
okazje umykały (np. Tower Bridge −27% nie miał szans przebić się przez drobnicę
z −50%).

Slajder na stronie głównej:
- sloty 1–3 — najlepszy rabat z każdej półki, od najdroższej
- sloty 4–5 — dzikie karty wg samego rabatu

Raporty Łowcy pokazują czołówkę osobno dla każdej półki.

---

## Gdzie sprawdzić, gdy coś nie gra

| Problem | Gdzie |
|---|---|
| Build / deploy | Cloudflare → Workers & Pages → `blogoklockach` → *Deployments / Build history*. Czerwony build = strona zamrożona na ostatniej zielonej wersji; logi pod „View build" |
| Ruch na stronie | Cloudflare → Analytics & Logs → Web Analytics |
| Kliknięcia afiliacyjne | panel webePartners (autorytatywny). Worker też je liczy, ale dopiero po włączeniu Analytics Engine — wymaga planu Workers Paid |
| Widoczność w Google | Search Console, usługa `https://tylkoklocki.pl/` |
| Runner „nie działa" | najpierw sprawdź flagę `enabled` w Routines, dopiero potem logi. Wyłączony runner nie zgłasza błędu |

### Rollback

Cloudflare → *Deployments* → *Version History* → „…" przy starszej wersji →
*Rollback*. Nie wymaga zmian w repo.

---

## Runnery: opóźnione commity *(zaobserwowane 23.08.2026)*

Wycofania, Łowca i Backfill odpaliły się o 04:09, 05:09 i 10:03, ale commity
wylądowały dopiero po 17:00 — **7–12 godzin później**. Sesje miały status
`rejected`, co wygląda na kolejkowanie po wyczerpaniu limitu tygodniowego.

Scout i Radar (nowsze sesje na Opusie) pushują punktualnie.

Skutek: **godzina odpalenia nie równa się godzinie, o której dane są na
produkcji.** Przy diagnozie „dlaczego strona ma stare ceny" sprawdzaj czas
commita, nie czas triggera.

---

## Stabilność formatu plików JSON *(do naprawy)*

Scout przepisuje `known_sets.json` w całości (219 zmienionych linii przy
80 dodanych w `sety.json`). Łowca przepisuje całą gałąź Allegro
w `redirects.json` — 2 646 zmienionych linii przy każdym przebiegu.

Diagnoza: **serializacja JSON nie jest deterministyczna** — kolejność kluczy
lub formatowanie zmieniają się między przebiegami, więc git widzi zmianę tam,
gdzie danych nie ruszono.

Skutek: codzienne commity po kilka megabajtów, historia repo puchnie bez
powodu, a prawdziwe zmiany giną w szumie i nie da się ich przejrzeć w diffie.

Kierunek naprawy: sortowanie kluczy, stałe wcięcie, stabilne formatowanie
liczb — po stronie każdego runnera, który zapisuje JSON.

---

## Brickset: limity dla niezalogowanych *(ustalone 24.08.2026)*

**Paginacja urywa się na stronie 20.** Lista `brickset.com/sets/year-2026`
zgłasza 913 dopasowań i 37 stron, ale strony 21 i dalsze zwracają dla nas
pustą listę zestawów (sama nawigacja serwisu). To nie jest blokada ani limit
zapytań — sprawdzone: strona 20 pobrana ponownie po pustych 21–23 nadal
zwraca komplet 25 numerów. Dostępne jest więc 500 pozycji z 913.

**Obejście:** listy per seria, np. `brickset.com/sets/theme-Star-Wars/year-2026`
(z własną paginacją, też do 20 stron, ale żadna seria tego nie dobija).
Tak dobiera się zakres numerów powyżej ~75440.

**Brickset nie podaje RRP w złotych** — tylko GBP/USD/EUR, także na kartach
pojedynczych zestawów (sprawdzone na 10465-1, 11371-1, 11375-1). Ceny w zł
biorzemy z `katalog.json`; walut nie przeliczamy.

**Czego Brickset użyć, a czego nie:** numer, nazwa EN, seria, liczba
elementów, wiek, data premiery, wymiary, liczba minifigurek — tak. Cena —
nie. Nazwa PL — nie ma jej tam w ogóle.

**Parametry sortowania i rozmiaru strony są ignorowane.** `?sortBy=-DateAdded`
i `?pageSize=100` nie zmieniają wyniku — kolejność zostaje po numerze
zestawu, a strona ma 25 pozycji. Nie da się tanio zapytać „co doszło od
wczoraj"; wykrywanie nowości opiera się na porównaniu z `known_sets.json`.

### Uzupełnienie do „Stabilność formatu plików JSON"

Zarzut wobec Scouta był trafny co do objawu, ale przyczyna była inna niż
niedeterminizm. Scout zapisuje `known_sets.json` przez
`json.dumps(indent=2, ensure_ascii=False)` — round-trip jest stabilny bajt
w bajt, sprawdzone 24.08. Duże diffy z 22–23.08 to realna zmiana treści
(przepisywany rejestr luk), nie szum formatowania.

Pułapka, w którą Scout wpadł i z której warto wyciągnąć regułę: **`sety.json`
ma wcięcie 1 spacji i nie kończy się znakiem nowej linii**, a klucze NIE są
posortowane (plik zaczyna się od `21372`). Zapis przez Node z
`JSON.stringify(obj, null, 2)` dał 7 594 wstawień i 7 514 usunięć przy pięciu
faktycznie dodanych zestawach. Poprawnie: Python z
`object_pairs_hook=OrderedDict`, `indent=1`, `ensure_ascii=False`, bez
końcowego `\n` — wtedy diff to same dodania. **Node reorganizuje klucze
wyglądające na liczby, więc do plików z numerami zestawów jako kluczami
nie nadaje się do zapisu.**
