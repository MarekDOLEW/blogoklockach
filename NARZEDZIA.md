# Podział pracy: Claude Code ↔ Cowork

Dotyczy wyłącznie osi **narzędziowej** — które z dwóch narzędzi co robi.

Podział na osi **ludzkiej** (Piotr ↔ Marek) opisuje `redakcja/wspolpraca.md`
i ten plik go nie zmienia. Gdy oba dokumenty mówią o tym samym pliku, ustalenia
z `redakcja/wspolpraca.md` mają pierwszeństwo — tam decydują ludzie, tu tylko
narzędzia.

## Mapa dokumentów

Każdy temat ma jedno miejsce. Jeśli szukasz czegoś indziej, szukasz źle.

| Temat | Plik |
|---|---|
| Kto z ludzi czym włada | `redakcja/wspolpraca.md` |
| Które narzędzie czym włada | ten plik |
| Harmonogram runnerów | `materialy/zadania-cykliczne.md` *(generowany)* |
| Wiedza operacyjna, pułapki, awarie | `RUNBOOK.md` |
| Wymiana informacji między sesjami | `DZIENNIK.md` |
| Standard artykułów, metodologia | `redakcja/` |
| Bieżące zadania i dług | `DZIENNIK.md`, nie ten plik |

**W tym pliku nie ma list zadań.** Reguły są trwałe, zadania są datowane —
mieszanie ich sprawia, że dokument gnije razem z listą. Zadania: `DZIENNIK.md`.

## Model: nie ma wspólnego dysku

Claude Code pracuje w kontenerze sesji (`/home/user/blogoklockach`).
Cowork pracuje na Macu Marka.

**Te dwa środowiska nie widzą swoich plików.** Jedynym kanałem wymiany jest
repozytorium `github.com/MarekDOLEW/blogoklockach`, gałąź `main`.

Konsekwencja, którą trzeba przyjąć dosłownie: praca niezacommitowana
i niewypchnięta **dla drugiej strony nie istnieje**.

## Źródło prawdy

Gałąź `main` na GitHubie. Z niej Cloudflare buduje produkcję.

Wszystko inne to kopie robocze. W szczególności **nie są źródłem prawdy**:

- `~/Desktop/TYLKOKLOCKI/blogoklockach-astro/` — kopia z 11.08, sprzed
  rebrandingu (`site: blogoklockach.pl`, 8 zestawów w `sety.json`).
- `~/Desktop/TYLKOKLOCKI/tylkoklocki-rebranding_1/` — szkielet, 4 pliki.
- `~/Documents/Claude/Projects/blogoklockach/` — stara baza skilli Cowork.
  Repo nie odwołuje się do niej nigdzie (sprawdzone grepem: zero trafień).

Wszystkie trzy **do archiwum** — przenieść do `_archiwum/`, nie kasować od razu.

Uwaga osobno: **harmonogram runnerów też nie mieszka w repo.** Triggery są
w koncie Claude Code Remote (Routines). Plik `materialy/zadania-cykliczne.md`
jest ich zrzutem, nie konfiguracją — patrz sekcja „Harmonogram".

## Podział własności

| Ścieżka | Właściciel | Cowork |
|---|---|---|
| `src/lib/`, `src/components/`, `src/layouts/` | Claude Code | tylko czyta |
| `src/pages/**/*.astro`, `src/worker.js` | Claude Code | tylko czyta |
| `src/data/*.json` | runnery (Code) | **nie dotyka** |
| `scripts/` | Claude Code | tylko czyta |
| `astro.config.mjs`, `wrangler.jsonc`, `package.json` | Claude Code | **nie dotyka** |
| `public/` | Claude Code | tylko czyta |
| artykuły `.md` | wg kategorii — patrz niżej | pisze wybrane |
| `materialy/` | **Cowork** | pisze |
| `redakcja/` | wspólnik + Cowork | pisze |
| `DZIENNIK.md` | oba, append-only | dopisuje |
| `materialy/zadania-cykliczne.md` | generator | **nikt nie edytuje ręcznie** |

### Dlaczego `src/data/*.json` jest zamknięte dla Cowork

Te pliki są generowane przez runnery i są duże: `redirects.json` 2,6 MB,
`oferty_feed.json` 1,6 MB. Łowca przepisuje w nich całe gałęzie przy każdym
przebiegu (ostatni: 2 646 zmienionych linii). Ręczna edycja z drugiej strony
to gwarantowany konflikt na pliku, którego nikt nie rozwiąże sensownie.

Gdy Cowork potrzebuje zmiany w danych — **opisuje ją w `DZIENNIK.md`
i zostawia Claude Code.** Nigdy nie edytuje sam.

## Protokół pracy

Obowiązuje obie strony, bez wyjątków.

1. **Na starcie sesji:** `git pull --rebase origin main`, potem przeczytaj
   ostatnie 3 wpisy w `DZIENNIK.md`.
2. **Przed zadaniem:** sprawdź w dzienniku, czy druga strona nie ma go w toku.
   Wpis „w toku" to rezerwacja — nie zaczynaj.
3. **W trakcie:** commituj tylko własne pliki. **Nigdy `git add -A`** —
   wciągnie cudze zmiany i artefakty.
4. **Na koniec:** dopisz wpis do `DZIENNIK.md`, zacommituj, wypchnij na `main`.
   Z sesji Claude Code: `git push origin <twoja-gałąź>:main` — lokalny `main`
   bywa rozjechany, dlatego pushujemy jawnie gałąź na `main`.
5. **Nie zostawiaj pracy niewypchniętej.**

### Format commitów

`<Runner|Cowork|Code>: <co zrobione>` — bez polskich znaków w tytule.
Jeden format, bo historia jest przeszukiwana.

## Zasada jednego wykonawcy

Jedno zadanie ma dokładnie jednego wykonawcę. Gdy da się je wykonać po obu
stronach, rozstrzyga tabela własności — decyduje to, **gdzie leżą pliki
do zmiany**, nie to, kto szybciej zacznie.

W razie wątpliwości: nie rób, zapytaj. Jedno pytanie kosztuje mniej niż
zdublowana praca na plikach po 2 MB.

## Runnery cykliczne należą do Claude Code

Scout, Wycofania, Łowca, Radar, Backfill i (od 22.09.2026) „Dane wt 05:30"
działają jako trwałe sesje Claude Code Remote (`persist_session: true`) z repo
w źródłach sesji — tylko one mogą pushować. Kontroler, Zdjęcia → R2,
Przypomnienie o Empiku i Alerty cen startują świeżą sesją przy każdym
odpaleniu (Social skasowany 15.09.2026); **świeża sesja z Routine nie ma repo
ani konektorów** (dowody 21.09 Kontroler i 22.09 Dane wt), więc taki Routine
może tylko czytać, mailować i wgrywać do R2 — nie pushuje. Od 22.09.2026
Kontroler też jest trwałą sesją z repo; konektor `Claude_Code_Remote` ma
wyłącznie sesja Code, więc ona przepisuje harmonogram własnym Routine
w poniedziałek o 08:00 (prompt Kontrolera: `materialy/kontroler-prompt-2026-09-22.md`). Rozróżnienie ma też znaczenie
przy edycji: promptu trwałej sesji nie zmienia się przez `update_trigger`
(patrz `materialy/zadania-cykliczne.md`, „Jak edytować zadanie"), a Routine
założony z panelu (`http_api`) może zmienić lub skasować tylko Marek.

**Cowork nie uruchamia tych zadań.** Uśpione duplikaty `klocki-scout-nowosci`,
`klocki-lowca-promocji`, `klocki-radar-konkurencji` i `klocki-kontroler`, które
zapisywały w próżnię do `~/Documents/Claude/Projects/blogoklockach/`, **zostały
odinstalowane** — stan na 14.09.2026: w koncie są `klocki-afiliacje`,
`klocki-seo`, `klocki-social`, `klocki-ceny-empik` i dwa standardy.

Skille `klocki-redaktor`, `klocki-social`, `klocki-seo` i `klocki-afiliacje`
zostają — to treść i research, czyli właściwa robota Coworka.

## Artykuły: właściciel wynika z kategorii

O tym, kto pisze artykuł, decyduje pole **`kategoria`** we frontmatterze —
**nie katalog, w którym plik leży**. Katalog bywa przypadkowy (prezentowniki
leżą dziś w dwóch miejscach), kategoria jest deklaracją intencji.

| Kategoria | Rodzaj | Co to jest | Kto pisze |
|---|---|---|---|
| `Premiery` | redakcyjna | debiut lub nowa fala, dane ze Scouta | Marek / Cowork / Piotr |
| `Recenzje` | redakcyjna | omówienie zestawu, wrażenia z budowania, ocena | **Piotr** |
| `Rankingi` | redakcyjna | zestawienia od najlepszego w serii, budżecie, temacie | Piotr / Code |
| `Porównania` | redakcyjna | dwa lub kilka zestawów obok siebie | Piotr |
| `Poradniki` | redakcyjna | jak kupować, jak czytać ceny i promocje | Piotr / Code |
| `Kalendarze` | redakcyjna | okna promocyjne, premiery, wycofania | Marek / Code |
| `Historyczne` | redakcyjna | archiwalne serie i zestawy | Piotr |
| `Prezentownik` | sprzedażowa | zestawienia „LEGO dla…", dział /prezentowniki/ | Marek / Cowork |
| `Deal` | sprzedażowa | pojedyncza okazja cenowa z Łowcy, dział /deale/ | Łowca / Marek |

Linia podziału: **Piotr pisze o zestawach, Marek o cenach i okazjach.**
Wszystko, co powstaje z danych Łowcy i Scouta, może być generowane
półautomatycznie i należy do Coworka. To, co wymaga obcowania z zestawem,
należy do Piotra. Zapowiedzi niepotwierdzone nie są kategorią tekstu —
od 15.09.2026 mają własny dział `/przecieki/` na danych.

### Lista kategorii jest zamknięta

Siedem kategorii redakcyjnych to `src/data/kategorie_artykulow.json` — jedyne
źródło (decyzja Marka 15.09.2026; wcześniej ten dokument miał własną, inną
listę). Do tego dwie wartości sprzedażowe: `Prezentownik` i `Deal`. Build
sprawdza pole `kategoria` we wszystkich tekstach (`scripts/sprawdz-kategorie.mjs`,
uruchamiany w `prebuild`) i pada przy każdej innej wartości — więc `Deal`,
`deal` i `Okazja` nie powstaną obok siebie.

Dlatego: **nowa kategoria to decyzja, nie odruch.** Zanim jej użyjesz,
dopisz ją do `kategorie_artykulow.json` (redakcyjna) albo do listy w
`scripts/sprawdz-kategorie.mjs` (sprzedażowa) i odnotuj w `DZIENNIK.md`.

Pisownia dokładnie jak w tabeli — wielka litera, bez skrótów.
mnogiej.

### Artykuły graniczne

Gdy artykuł łączy warstwy (np. prezentownik z rozbudowaną częścią
recenzencką), obowiązuje zasada z `redakcja/wspolpraca.md`: **redakcja
Piotra, warstwa cenowo-linkowa Marka.**

`Zapowiedzi` jest kategorią graniczną **z definicji** — to research
o niewydanych zestawach (Piotr) połączony z doradztwem zakupowym i linkami
(Marek). Każdy tekst z tej kategorii wymaga uzgodnienia, kto prowadzi;
ustalenie zapisujemy w `DZIENNIK.md` przed rozpoczęciem pisania, żeby nie
powstały dwie wersje tego samego.

### Kiedy wchodzi Cowork

Nie „od tematów", tylko **od granic technicznych**: Cowork robi to, czego Code
fizycznie nie może, i nic poza tym. Każde zadanie przypisane mu z przyzwyczajenia
kosztuje przepisywanie wyników i rozjazd wersji.

Trzy rzeczy, których Code nie zrobi:

1. **Strony blokujące ruch z centrum danych.** Empik i lego.com oddają `403`
   z Cloudflare — to blokada serwisu, nie naszej sieci, więc dotyczy każdego
   narzędzia działającego z chmury. Dziś: tygodniowy zrzut cen Empiku.
2. **Panele bez API.** Allegro Affiliate i webePartners nie mają API w rejestrze
   — prowizje da się odczytać wyłącznie po zalogowaniu.
3. **Pliki, które zostają na dysku.** Tylko takie, których nie da się albo nie
   opłaca załączyć do rozmowy — bardzo duże eksporty, materiały do otwarcia
   w aplikacji, rzeczy poufne.

   **Pliki od Piotra idą do Code**, nie tu. Paczka `.docx` albo `.zip` załączona
   w rozmowie ląduje w kontenerze i jest przetwarzana od razu do repo: parsowanie,
   transformacja, walidacja JSON, build i commit w jednym przebiegu (sprawdzone
   14.09 na paczce P07 — dwa zipy, 31 dokumentów, 7 nowych kart i 24 korekty).
   Droga przez Cowork dokłada krok, w którym ktoś musi przenieść wynik do repo,
   a to jest dokładnie ten moment, w którym praca się gubi.

Wszystko inne należy do Code i tam jest tańsze: research (WebSearch, WebFetch,
Firecrawl), teksty prosto do repo, raporty przez API (Cloudflare Analytics
Engine, Search Console, Adtraction).

### Zmierzone limity Code *(14.09.2026 — nie zgadywać, to jest sprawdzone)*

| Próba z kontenera sesji | Wynik |
|---|---|
| `empik.com`, `lego.com`, `allegro.pl`, `mediaexpert.pl` (curl) | **403** — Cloudflare, blokada ruchu z data center |
| `planetaklockow.pl` (curl) | 200 |
| Chromium/Playwright, dowolny adres | **ERR_CONNECTION_RESET** — relay nie obsługuje ruchu przeglądarki, także z jawnym proxy |
| `api.firecrawl.dev` | działa — droga do stron blokujących nas wprost |
| usunięcie gałęzi / zapis do GitHub API | **403** od proxy — robi człowiek |
| wgranie skilla na konto | niemożliwe — synchronizacja tylko serwer → kontener |

Dwa różne mury, których nie wolno mylić: **Cloudflare** blokuje serwis
(naprawy po naszej stronie nie pomogą, potrzebny Firecrawl w trybie stealth albo
lokalna przeglądarka), a **brak przeglądarki** to ograniczenie środowiska.
Naprawa drugiego nie daje dostępu do pierwszego.

### Prowizje: co mierzymy, a co zakładamy

`node scripts/prowizje-raport.mjs --dni 30` — jedyne źródło prawdziwego EPC.
Stan dostępów na 14.09.2026:

| Sieć | Sklepy | Stan |
|---|---|---|
| Adtraction | Smyk, Egmont | **działa** (`ADTRACTION_TOKEN`); 0 transakcji w 60 dniach — to wynik, nie awaria |
| Tradedoubler | Empik, Ceneo, Lidl (zgłoszenie 17.09.2026, czeka na akcept) | **działa** (Publisher API: `TD_CLIENT_ID`, `TD_CLIENT_SECRET`, `TD_USERNAME`, `TD_PASSWORD`); 14.09: pierwsza zmierzona transakcja — Empik, obrót 51,53 EUR, prowizja 1,41 EUR. Token z `/uaa/oauth/token`, grant `password`. Stare `TD_TOKEN` (produktowy) i `TD_REPORT_TOKEN` (Conversions, tylko push) zostają do swoich zadań |
| Performers | Media Expert | **działa** (`PERFORMERS_API_KEY`); 14.09: 1245 kliknięć, 0 konwersji w 30 dniach |
| Allegro, webePartners | — | brak API — tylko panel |

Od 14.09 wszystkie trzy sieci z API są mierzone. Bez pomiaru zostają Allegro
i Planeta Klocków — tam EPC dalej jest **modelem**, nie pomiarem, i trzeba to
pisać wprost w każdym raporcie.

Dwie pułapki, na których ten pomiar już raz poległ — obie warte zapamiętania,
bo dotyczą każdego API, nie tylko TD:

- **Zmyślona ścieżka oddaje 401, nie 404.** `/uni/oauth2/token` nie istnieje,
  a brama TD odpowiada „Full authentication is required" — identycznie dla
  każdego adresu, także nieistniejącego. Wzięliśmy to za dowód, że klient nie
  jest aktywny. Jednakowa odpowiedź pod adresem, który nie ma prawa istnieć,
  jest sygnałem, że pytamy w złym miejscu — nie diagnozą uprawnień.
- **Grant trzeba odczytać z panelu, nie założyć.** Nasz klient ma `password`
  i `refresh_token`; `client_credentials` jest niedozwolony, więc te próby nie
  przeszłyby nawet pod dobrym adresem.

Zasada z tego: **zanim postawimy tezę o uprawnieniach, sprawdzamy dokumentację
dostawcy.** Domysł o cudzym systemie wpisany do dokumentacji jako fakt kosztuje
więcej niż przyznanie, że się nie wie.

## Co gdzie wrzucać — ściąga dla Marka

Lista powstała 14.09.2026, bo trasy były rozsiane po czterech dokumentach.
Zasada ogólna: **domyślnie Code, w rozmowie, jako załącznik.** Cowork tylko tam,
gdzie Code fizycznie nie sięga. Jeśli czegoś nie ma na liście — Code.

1. **Teksty, docx, zipy od Piotra** → **Code**, załącznik w rozmowie.
   Paczka ląduje w kontenerze i idzie do repo jednym przebiegiem: parsowanie,
   walidacja, build, commit. *(Od 14.09; wcześniej szło przez Cowork i tam się
   gubiło.)*

2. **Arkusze do weryfikacji** (xlsx z odznaczeniami, listy do sprawdzenia)
   → **Code**, załącznik. Odsyłasz ten sam plik z dopiskami.

3. **Zrzut cen Empiku** (`lego-empik.json`) → **Code, załącznik** — jak
   wszystko inne. Od 16.09.2026 reguły importu są w `scripts/empik-import.mjs`
   (do tego dnia żyły wyłącznie w pamięci trwałej sesji Łowcy, bez pokrycia
   w prompcie — audyt końcowy, pkt 2.2). Code uruchamia `empik-import.mjs`
   i `empik-redirects.mjs --usun-martwe`, buduje, pushuje. Plik wrzucony do
   sesji Łowcy też zadziała — z notką „uruchom `node scripts/empik-import.mjs`".

4. **Paczka `.skill`** (`skille/*.skill` po `node scripts/spakuj-skille.mjs`)
   → **claude.ai → Settings → Skills**. Nie da się inaczej: synchronizacja idzie
   tylko serwer → kontener. Stan na 15.09.2026 ok. 15:00: **zgodne** — Marek wgrał
   paczki po commicie `497043e` (naprawa eksportu + opcjonalny „normalny poziom
   rynkowy"). Uwaga z audytu: paczki z 08:03 tego dnia były zapakowane ze starych
   plików, bo eksport miał błąd składni — od `497043e` `prebuild` sprawdza składnię
   eksportu, więc build padnie zamiast cicho rozjechać skill z repo.

5. **Eksporty CSV z paneli afiliacyjnych** (Tradedoubler, Allegro, webePartners)
   → **Code**, załącznik. Sparsuję i wpiszę do rejestru w jednym przebiegu.

6. **Zrzuty ekranu z paneli** → **Code**, wklejone w rozmowę. Zrzut z panelu TD
   dał 14.09 `programId` Allegro, na który rejestr czekał od 20 sierpnia.

7. **Pliki klienckie** (landingi, prezentacje, materiały spoza LEGO)
   → **nie do tego repo**. Jest publiczne. Dwa razy w tym miesiącu wylądowały
   tu przez pomyłkę (Whirlpool, Beko).

## Punkty ręczne — co bez Ciebie stoi

Żaden z nich **nie zgłasza, że zalega** — brak zrzutu wygląda tak samo jak brak
zmian w cenach. Tydzień nieobecności zatrzymuje wszystkie naraz.

| Punkt | Jak często | Co się psuje przy zaległości |
|---|---|---|
| **Zrzut cen Empiku** (lokalna przeglądarka, skill `klocki-ceny-empik`) | tygodniowo, poniedziałek | Ceny Empiku zamrażają się na tabelach hubów. Nie odświeżają się deeplinki `redirects.empik`, więc martwe adresy zostają i prowadzą na 404 — gorzej niż wyszukiwarka, na którą worker spada sam |
| **Wgranie paczki `.skill`** | po każdej zmianie w `redakcja/` albo w eksporcie | Cowork pracuje według starszego standardu niż repo, a rozjazd jest niewidoczny — obie strony są przekonane, że mają aktualną wersję |
| **Kasowanie gałęzi w GitHubie** | po sesji, która zostawiła gałąź | Gałęzie się gromadzą w publicznym repo (14.09: skasowane sześć, została jedna z landingiem klienckim) |
| **Odczyt paneli Allegro i webePartners** | przy przeglądzie prowizji | EPC dla tych dwóch zostaje **modelem**, nie pomiarem — a Allegro to największa ekspozycja w serwisie |
| **Doładowanie Firecrawla** | tylko powyżej 1000 kredytów/mies. | Brak kanonicznych linków dla nowych zestawów i brak kontroli, czy skrót lego.com dalej działa |

### Czego na tej liście już NIE ma

- **Pliki od Piotra** — od 14.09 prosto do Code (punkt 1 wyżej).
- **Prowizje Tradedoublera** (Empik, Ceneo) — od 14.09 przez Publisher API,
  panel niepotrzebny.

### Budżet Firecrawla

**1000 kredytów miesięcznie w abonamencie.** Jedno pobranie strony to 1 kredyt,
ekstrakcja modelem 5 — dlatego `firecrawl-legopl.mjs` używa parsera markdownu,
nie ekstrakcji.

- **Odświeżenie katalogu lego.pl** — 57 stron listingu, **co tydzień**
  (Routine „Dane wt 05:30", od 15.09.2026): ~75 kredytów na przebieg, ~300
  miesięcznie. Do tego `lego-strony.mjs` (1 kredyt na zestaw, partie po kilkadziesiąt)
  i `opisy-legopl.mjs` na żądanie. Mieści się, ale bez zapasu na drugi taki zaciąg.
- **Zrzut Empiku** — skill przechodzi ~200 stron **dwa razy** (rosnąco
  i malejąco, bo przy jednym kierunku Empik gubi produkty), czyli **~400
  kredytów na przebieg**. Tygodniowo to ~1700 miesięcznie i budżet nie
  wystarcza. Sprawdzone 14.09: Firecrawl technicznie przechodzi przez Cloudflare
  Empiku i zwraca poprawne dane (48 kart produktu z cenami i deeplinkami
  z jednej strony wyników) — bariera jest wyłącznie kosztowa. Zostaje więc drogą
  awaryjną dla pojedynczych zestawów, nie zamiennikiem zrzutu.

Co Firecrawl realnie dostarczył (stan 16.09.2026): 960 kanonicznych adresów
kart lego.com (`redirects.lego`), 949 cen LEGO.com z datą (`oferty.lego`),
147 nowych cen katalogowych 15.09 (`wczytaj-rrp.mjs` z listingu; wcześniejsze
pokrycie RRP pochodzi z importu bazy RK), 166 opisów producenta jako materiał
do researchu, statusy „karta istnieje / nie istnieje" dla zestawów po EOL.

## Harmonogram: generowany, nie pisany

Prawda o triggerach mieszka w Routines w koncie Marka. Każdy ręcznie pisany opis
harmonogramu zaczyna się rozjeżdżać w dniu powstania — stało się to już cztery
razy (`COWORK-INSTRUKCJA.md` pokazywał Radar 3× dziennie i Łowcę o 09:00;
`materialy/zadania-cykliczne.md` pokazywał Kontrolera jako aktywnego, gdy był
wyłączony od 18.08; 14.09.2026 siedem z ośmiu wierszy kolumny „Ostatnie
odpalenie" wisiało na 31.08, a nagłówek dokumentu twierdził „stan 31.08" nad
treścią opisującą 14.09).

**Od 14.09.2026 jest czym to generować.** Sekcja „Zrzut" w
`materialy/zadania-cykliczne.md` leży między znacznikami `HARMONOGRAM:START`
i `HARMONOGRAM:KONIEC` i przepisuje ją `scripts/harmonogram-z-konta.mjs`
z odpowiedzi `list_triggers`. Wszystko poza znacznikami to wiedza pisana ręcznie
i generator jej nie rusza. Uruchamia to Kontroler przy cotygodniowym raporcie —
ma jako jedyny z runnerów konektor `Claude_Code_Remote` (pozostałe pięć ma zero
konektorów, sprawdzone 14.09), więc tylko w jego przebiegu ta sekcja może
powstać. Ręczna poprawka w tej sekcji jest błędem: przepadnie przy najbliższym
przebiegu i po drodze da fałszywe poczucie, że dokument jest aktualny.

Zrzut musi zawierać dla każdego zadania: nazwę, cron, **flagę enabled**, datę
ostatniego odpalenia i pliki, do których zapisuje. Flaga `enabled` i data
ostatniego odpalenia są najważniejsze — to one wychwytują runner, który cicho
przestał chodzić.

### Cisza to nie sukces

Runner wyłączony lub taki, który nigdy nie wystartował, **nie zgłasza błędu**.
Kontroler nie chodził od 18.08 i nikt tego nie zauważył przez dwa tygodnie,
bo brak raportu wygląda tak samo jak brak problemu.

Przy każdym przeglądzie zrzutu sprawdzaj nie to, co się wykonało, ale
**czego brakuje**.

## Przegląd dokumentacji

Raz w miesiącu, przy okazji zrzutu harmonogramu: sprawdź, czy dokumenty w mapie
na górze nadal opisują stan faktyczny. Dokumentacja gnije cicho i wychodzi to
dopiero wtedy, gdy ktoś na niej polega.
