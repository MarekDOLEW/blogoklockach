# Dziennik pracy

Jedyny kanał komunikacji między Claude Code a Cowork. Oba narzędzia czytają
ostatnie wpisy na starcie sesji i dopisują własny na końcu.

**Append-only.** Nowe wpisy na górze, pod tym nagłówkiem. Nie kasuj, nie
przepisuj cudzych wpisów — historia jest tu po to, żeby druga strona
wiedziała, co się działo.

Format wpisu:

```
## RRRR-MM-DD HH:MM · [CODE|COWORK] · krótki tytuł

**Zrobione:** co faktycznie zmienione, z nazwami plików
**Stan:** gotowe / w toku / zablokowane
**Dla drugiej strony:** co ma zrobić, albo „nic"
**Uwagi:** co poszło nie tak, czego nie ruszać
```

Pole **Dla drugiej strony** jest najważniejsze. Jeśli wpisujesz tam zadanie,
druga strona przejmuje je przy najbliższej sesji. Jeśli wpisujesz „nic" —
temat jest zamknięty i nikt go nie dubluje.

Zadanie „w toku" oznacza rezerwację: druga strona go **nie zaczyna**.

## 2026-08-25 08:20 · CODE · Cztery nowe artykuły z materiałów Piotra + drugi rząd zajawek na HP

**Zrobione:**
- `src/pages/artykuly/lego-42215-koparka-volvo-ec500-recenzja.md` — recenzja Technic 42215 (próg 1150 zł)
- `src/pages/artykuly/lego-71858-kuznia-cztery-bronie-recenzja.md` — recenzja NINJAGO 71858 (próg 300 zł)
- `src/pages/artykuly/lego-city-czerwiec-2026-fala.md` — poradnik po fali City z czerwca 2026 (10 zestawów, nowa kategoria „Poradnik")
- `src/pages/prezentowniki/lego-za-200-zl-dla-10-latka.md` — prezentownik, sześć zestawów w budżecie 150–200 zł
- Zdjęcia: slajdery `<div class="galeria-setow" data-sety="…">` w treści (łącznie 22 slajdery, 44 slajdy) + `okladka` w frontmatterze każdego tekstu
- Placeholdery `[wstaw link afiliacyjny]` zamienione na `/idz/<sklep>/<nr>`; przy artykułach wielozestawowych tabele kierują do hubów `/zestaw/<nr>/`
- `src/pages/index.astro` — zajawki artykułów z 3 na 6 (dwa rzędy po trzy)
- `redakcja/karty/` — cztery karty researchu (dotąd katalog był pusty)

**Stan:** gotowe, wdrożone na produkcję

**Dla drugiej strony:** nic

**Uwagi:**
- Amazon.pl z materiału źródłowego (fala City) **pominięty** — brak działającego przekierowania `/idz/amazon/`, link byłby martwy. W jego miejsce Media Expert.
- Wszystkie 25 numerów zestawów użytych w tekstach mają wpis w `obrazy.json`, więc worker serwuje `/img/<nr>.jpg` (sprawdzone na produkcji).
- Progi cenowe celowo ustawione powyżej chwilowych minimów z feedu — drabina ma być trwała, zgodnie ze Standardem §18–19.

---
## 2026-08-25 07:30 · CODE · Kliknięcia afiliacyjne zapisują się — ścieżka domknięta

**Zrobione:** Analytics Engine aktywowany na koncie (Marek, panel Cloudflare),
dataset `idz_kliki` utworzony ręcznie, wiązanie `analytics_engine_datasets`
wróciło do `wrangler.jsonc` (commit `1562d49`).

**Potwierdzenie end-to-end, nie samo „powinno działać":**
- w Version History powstała **wersja** `6cb2791b` (main, aktywna, 100% ruchu,
  error rate 0%) — wczorajsza regresja „build OK, wersja nie powstaje" nie
  wróciła;
- dataset `idz_kliki` pojawił się w panelu **z danymi**, count 8. Panel pokazuje
  dataset dopiero po pierwszym zapisie z Workera, więc to dowód, że `env.KLIKI`
  jest zbindowane i `writeDataPoint` faktycznie pisze.

**Uwaga do pierwszego raportu:** sześć z tych ośmiu zdarzeń to moje przejścia
testowe przez `/idz/` z 25.08 ok. 05:11 UTC (empik, smyk, xkom, allegro,
mediaexpert, planetaklockow — wszystkie dla 76467 albo 31168), wykonane
z serwerowego IP. Przy ruchu bliskim zera zdominują próbkę — nie liczyć z nich
EPC ani konwersji.

**Co jeszcze blokuje odczyt:** `scripts/kliki-raport.mjs` potrzebuje w środowisku
runnerów `CF_ACCOUNT_ID` (`a9ed001e5143106eb3b6b2d013011659`) i `CF_API_TOKEN`
z uprawnieniem „Account Analytics: Read". Bez nich zapis działa, ale Kontroler
dalej nie policzy EPC. Prompt zadania zaktualizowany — nie szuka już przyczyny
w brakującym wiązaniu, bo ta jest załatwiona.

**Dane nie powstają wstecz.** Pierwszy raport z realnym EPC obejmie 25–31.08.

**Stan:** gotowe.

**Dla drugiej strony:** nic.

## 2026-08-25 07:10 · CODE · Sitemapa przycięta do 1 160 adresów (wariant A+B)

**Zrobione:** `astro.config.mjs` dostał filtr sitemapy. Zgłaszamy hub `/zestaw/`
w dwóch przypadkach: ma redakcyjny opis w `sety.json` (248 sztuk) albo ma cenę
z co najmniej dwóch sklepów, czyli porównanie cen jest realnym porównaniem.
Efekt na produkcji: **1 160 adresów zamiast 4 873** — w tym 1 099 hubów,
39 serii, 10 artykułów, 4 prezentowniki i strony stałe.

Pozostałe huby **nie znikają**: dalej się budują (dist ma komplet 4 873 stron),
odpowiadają 200 i są linkowane z tabel serii — sprawdzone po wdrożeniu na
`/zestaw/21102/`. Przestają być tylko zgłaszane w sitemapie.

Filtr liczy się przy każdym buildzie, więc hub wraca do sitemapy sam, gdy Łowca
dorzuci mu drugi sklep, i sam wypada, gdy oferta zniknie. Nie ma tu listy do
ręcznego utrzymywania.

**Podstawa decyzji** — dane z 24.08, nie przeczucie: 4 812 z 4 873 adresów to
były huby; Google nie zaindeksował ani jednego adresu poza stroną główną;
reszta miała status „wykryta, obecnie niezindeksowana" i ostatni crawl NIGDY.
Dwa sąsiednie huby bez opisu (21102, 21103) mają po ~260 słów, z czego **82%
wspólnych** — 19 słów różnicy to numer, nazwa, rok i kwota.

**Uczciwie o oczekiwaniach:** to jest zmiana sygnału, nie przełącznik. Sam
przycięty plik nie sprawi, że Google zacznie crawlować. Przy dwutygodniowej
domenie liczą się przede wszystkim linki z zewnątrz i czas.

**Nowy punkt odniesienia dla Kontrolera:** 1 160 adresów przesłanych,
0 zindeksowanych (stan 25.08). Prompt zadania zaktualizowany.

**Dla drugiej strony (COWORK):** Marek dostał gotową treść zlecenia — chodzi
o ręczne „Poproś o zaindeksowanie" w GSC dla kilkunastu adresów (API z kluczem
tylko-do-odczytu tego nie zrobi) i o odczyt raportu „Indeksowanie stron".

## 2026-08-24 16:50 · CODE · Kliki, linki afiliacyjne i indeksacja — trzy diagnozy

**1. Kliknięcia afiliacyjne: nie brak dostępu, tylko brak zapisu.**
`wrangler.jsonc` nigdy nie miał wiązania `analytics_engine_datasets`, więc
`env.KLIKI` było `undefined`, a `env.KLIKI?.writeDataPoint()` po cichu nie
robiło nic. Nie zapisał się ani jeden klik — żaden token Cloudflare tego by
nie odczytał, bo nie ma czego czytać. Poprzedni raport Kontrolera mówił
„brak dostępu do danych"; to była zła diagnoza.
Dodanie wiązania **wywala deploy na tym koncie**: po pushu produkcja nie
zaktualizowała się przez 17 minut przy zwykłym czasie ~2 minut, a po
cofnięciu wróciła w 3 minuty. Wiązanie jest cofnięte, powód i pełna treść
wpisu siedzą w komentarzu w `wrangler.jsonc`.
Gotowy jest `scripts/kliki-raport.mjs` (kliki per sklep, per set, udział
stanu „brak-linku", kraje) — czeka na `CF_ACCOUNT_ID` i `CF_API_TOKEN`.
Prompt Kontrolera zaktualizowany: wywołuje ten skrypt i raportuje indeksację.
**Do zrobienia po stronie Marka:** odczytać log builda w panelu Cloudflare
(Workers & Pages → blogoklockach → Deployments) z okna 13:55–14:15 UTC 24.08.
Najpewniejsza hipoteza: Analytics Engine wymaga płatnego planu Workers.

**2. „Cztery aktywne programy mają zero linków" — mierzone na złym pliku.**
`redirects.json` z założenia trzyma wyłącznie linki produktowe z feedów, więc
sklep bez feedu nigdy tam nie trafi. Empik, Smyk i x-kom mają linki budowane
przez worker z samego numeru zestawu i **są obecne na każdej podstronie
`/zestaw/`** (sprawdzone na produkcji: 76467 i 31168 linkują empik, smyk,
xkom, lego, allegro, mediaexpert, planetaklockow). Egmont faktycznie ma zero
linków i tak ma zostać — wg rejestru to księgarnia Egmontu (komiksy, książki),
nie sklep z zestawami.
Realny rozjazd był w `linkAfiliacyjny()` w `src/lib/oferty.js`: funkcja nie
znała fallbacków workera i zwracała `null` dla sklepów, do których worker
umiałby przekierować. Naprawione (`SKLEPY_Z_LINKIEM_Z_WORKERA`). Zbudowane
strony wychodzą bajt w bajt tak samo, bo wszyscy wołający podają dziś tylko
sklepy z ofertą — to naprawa pułapki na przyszłość, nie zmiana widoczna.
**Prawdziwy powód zerowych prowizji z tych programów jest inny:** linki są na
podstronach zestawów, a te mają zerowy ruch. To ten sam problem co punkt 3.

**3. Dlaczego nie widać nas w Google — jest twarda odpowiedź.**
Inspekcja adresów przez API Search Console (24.08):
- sitemapa pobrana dziś, 0 błędów: **4 874 adresy przesłane, 0 zindeksowanych**;
- strona główna: PASS, zindeksowana, ale **ostatni crawl 15.08** — dziewięć dni;
- `/artykuly/`, `/prezentowniki/`, `/serie/`, `/wycofania/`, hub `/zestaw/76467/`:
  „Strona wykryta – obecnie niezindeksowana", **ostatni crawl: NIGDY**;
- artykuł o zamku 31168: „Adres URL jest Google nieznany", mimo obecności
  w sitemapie.
To nie jest blokada techniczna: robots.txt przepuszcza (`ALLOWED`), kanoniczne
zgadzają się z naszymi, `INDEXING_ALLOWED`, pobranie strony `SUCCESSFUL`.
Google po prostu nie przydziela crawlowania. Skład sitemapy: **4 812 z 4 873
adresów (98,7%) to huby `/zestaw/`**, przy 10 artykułach i 4 prezentownikach.
Na jeden tekst przypada ~481 niemal identycznych podstron generowanych
z szablonu.
Naprawione od ręki: sitemapa nie stempluje już `lastmod` datą builda. Runnery
pushują kilka razy dziennie, więc Google dostawał codziennie informację, że
wszystkie 4 873 adresy zmieniły się przed chwilą — także artykuły nietknięte
od tygodnia. Dokumentacja Google mówi wprost, że przy niewiarygodnym `lastmod`
przestaje ufać temu polu w całej witrynie.

**Stan:** gotowe, wdrożone, produkcja sprawdzona (strony 200, worker i /img
działają, sitemapa bez lastmod).

**Do decyzji Marka — przycięcie sitemapy:**
Propozycja: zostawić w sitemapie huby z redakcyjnym opisem (248 z `sety.json`)
plus artykuły, prezentowniki, serie i strony stałe — razem ~310 adresów zamiast
4 873. Pozostałe 4 564 huby dalej istnieją i są linkowane wewnętrznie, tylko
przestają zasysać crawl. Nie robię tego bez zgody, bo to decyzja o zasięgu
serwisu, nie poprawka techniczna.

**Dla drugiej strony:** nic.

## 2026-08-24 14:20 · CODE · Raport Kontrolera odpalony ręcznie

**Zrobione:**
- Raport Kontrolera za tydzień 18–24.08 wykonany i dostarczony jako PDF.
  Przebieg o 09:00 nie odpalił się, bo zadanie było jeszcze wyłączone.

**Ograniczenie warte zapamiętania:** `fire_trigger` NIE zadziała na Kontrolera.
Zwraca: „this routine was created via http_api, not by an agent. Agents can
only fire routines they created". Dotyczy każdej rutyny z `created_via:
http_api` — w naszym zestawie to Kontroler, Łowca i „inwestycja IV kwartal".
Rutyny z `created_via: meta_mcp` (Scout, Radar, Wycofania, Backfill) agent
odpali bez problemu. Ręczny przebieg http_api-owej rutyny trzeba więc albo
wykonać samodzielnie w sesji, albo sklonować jej prompt do jednorazowego
zadania (`run_once_at`).

**Co pokazał raport — jedno zdanie:** warstwa danych działa (248 śledzonych
setów, 160 z rabatem ≥20%, 174 nowe minima w 7 dni), ale ruch z Google to
**1 kliknięcie i 13 wyświetleń** w oknie 15–22.08, wyłącznie na stronie
głównej. Żaden artykuł ani hub nie pojawił się w wynikach.

**Trzy rzeczy nierozstrzygnięte, w kolejności ważności:**
1. Kliknięcia afiliacyjne są niemierzalne z poziomu zadania cyklicznego —
   brak dostępu do Analytics Engine (`idz_kliki`), brak `wrangler`, brak
   tokenu API Cloudflare. Bez tego nie ma EPC, więc raport Kontrolera co
   tydzień powtórzy „nie wiem". Potrzebny token w zmiennej środowiskowej
   albo cotygodniowy eksport z panelu do repo.
2. Indeksacja — potwierdza się obraz z 23.08. Przy jednej widocznej stronie
   praca nad treścią i wyglądem ma zerowy zwrot do czasu rozstrzygnięcia.
3. Cztery aktywne programy afiliacyjne mają ZERO linków w `redirects.json`:
   Egmont (6% CPS — najwyższa stawka w miksie), Empik, Smyk (2,1%),
   x-kom (2 linki). Cały ruch dealowy idzie do Allegro: 6 939 z 7 999 wpisów
   w migawce ofert, 141 ze 174 nowych minimów, wszystkie czołowe deale.

**Stan:** gotowe.

**Dla drugiej strony:** nic — punkty 1–3 wyżej są dla Marka, nie dla Cowork.

## 2026-08-24 13:30 · CODE · Kontroler włączony + kalibracja crona

**Zrobione:**
- `trig_01T8AhciW8JD651MrSMuEj7m` („LEGO pon 09:00 — Kontroler") włączony.
  Potwierdzone po zapisie: `enabled: true`, `next_run_at` =
  2026-08-31T07:08:30Z, czyli **poniedziałek 31.08 ok. 09:08 czasu polskiego**.
- Odhaczony punkt 1 backlogu z wpisu COWORK 23.08 20:30.

**Dlaczego był wyłączony:** w konfiguracji nie ma ani `ended_reason`, ani
`suspension_reason` — a to znaczy wyłączenie ręczne. Auto-wyłączenie wygląda
inaczej: stary `send_later` (`trig_013x6kw7r5J1a1YBES3V3YuH`) niesie
`ended_reason: auto_disabled_session_gone`. Zawieszenie po stronie
subskrypcji zostawia `suspension_reason`. Żadnego z nich tu nie ma, więc
hipoteza „sesja padła po limicie" się nie potwierdza.
Ostatni udany przebieg: 17.08 07:16 UTC. `updated_at` przed moją zmianą:
21.08 14:53 UTC — tego samego popołudnia edytowane były też Łowca, Backfill,
Radar i Social, więc wyłączenie wygląda na element porządków z 21.08,
a nie z 18.08.

**Social (`trig_01W1CSp8PM3DDN6UEyNLYe6H`):** zostaje wyłączony. Backlog
z 23.08 22:00 mówi wprost „wstrzymany celowo przez Marka, nie włączać",
a jego własna nazwa niesie powód — „ZAWIESZONE do startu kanałów". Nie ma
`last_fired_at`, bo nigdy nie wystartował, i nie powinien, dopóki nie ruszą
profile. Nie dotykam.

**Uwagi — pułapka na 25.10:** cron to `0 7 * * 1`, czyli 07:00 UTC. Dziś,
w czasie letnim (CEST, UTC+2), wypada to o 09:00. Po zmianie czasu
25.10.2026 (CET, UTC+1) ten sam cron da **08:00 czasu polskiego**. Jeśli
raport ma zostawać o 9:00 przez sezon XI–XII, trzeba wtedy przestawić go na
`0 8 * * 1`. To samo dotyczy wszystkich pozostałych runnerów LEGO — ich crony
też są w UTC i wszystkie przesuną się o godzinę wcześniej.

**Stan:** gotowe.

**Dla drugiej strony:** nic.

## 2026-08-23 22:00 · COWORK+CODE · Taksonomia artykułów i naprawa listingów

**Zrobione:**
- Ustalona zamknięta lista kategorii artykułów i właściciel każdej z nich —
  zapisane w `NARZEDZIA.md`. Podział: Piotr pisze o zestawach (`Recenzja`),
  Marek o cenach i okazjach (`Deal`, `Premiera`, `Prezentownik`, `Kalendarz`).
  `Zapowiedzi` to kategoria graniczna — wymaga uzgodnienia przed pisaniem.
- Zasada nadrzędna: o właścicielu i o tym, gdzie artykuł się pojawia,
  decyduje pole `kategoria` we frontmatterze, **nie katalog**.
- `prezentowniki.astro` (b50cbb4): ręczna tablica czterech pozycji zastąpiona
  globem po `kategoria === "Prezentownik"`. Treść kart przeniesiona do
  frontmattera jako `karta_znacznik`, `karta_tytul`, `karta_opis` z fallbackami.
  Nowy prezentownik pojawia się teraz sam.
- Rozszerzone globy w `/artykuly/` i w zajawkach na stronie głównej —
  widzą komplet 12 artykułów zamiast 9.
- Zabezpieczenia (b2695d2): filtr `m.frontmatter?.kategoria` w obu listingach,
  fallback znacznika. Dziś nic nie odrzucają — zadziałają, gdy do `src/pages/`
  trafi plik `.md`, który artykułem nie jest.

**Stan:** gotowe, na produkcji. `/prezentowniki/` bajt w bajt jak przed zmianą.

**Odstępstwo od specyfikacji:** dodano `karta_kolejnosc` (1–3) w trzech
prezentownikach na 1 września. Powód: mają identyczną `data: 2026-08-18`,
więc sortowanie po dacie nie odtwarzało ręcznie ułożonej kolejności
(rodzinny → chłopiec → dziewczynka). Pole działa **wyłącznie przy remisie dat**,
więc nowy prezentownik ze świeższą datą trafia na górę bez niego.
Odrzucono wariant różnicowania dat — `data` idzie do JSON-LD jako
`datePublished` i przesuwanie jej fałszowałoby dane strukturalne.

**Decyzje, których NIE podjęto:**
- Nie przenosimy prezentowników do jednego katalogu. Po analizie okazało się,
  że kosztuje to 9 linków w 5 plikach, przekierowania 301 w workerze
  (w Workers `public/_redirects` nie działa jak w Pages) i uszczuplenie
  `/artykuly/` — przy zerowym zysku, bo o przynależności i tak decyduje
  kategoria, nie katalog.
- Nie dodajemy filtra kategorii na `/artykuly/`. Przy 12 artykułach nie ma
  czego filtrować. Wrócić przy 20–25 tekstach, i wtedy **wyłącznie po stronie
  przeglądarki** — osobne adresy `/artykuly/kategoria/...` dołożyłyby sześć
  cienkich podstron do serwisu, który już ma problem z niedoindeksowaniem.

**Dla drugiej strony (CODE):**
1. ~~Włącz Kontrolera w Routines~~ — ZROBIONE 24.08.
   `trig_01T8AhciW8JD651MrSMuEj7m` ma `enabled: true`, najbliższy przebieg
   31.08 ok. 09:08. `Social` (`trig_01W1CSp8PM3DDN6UEyNLYe6H`) zostawiony
   wyłączony, zgodnie z tą notatką. Szczegóły — wpis z 24.08 na górze pliku.
2. Deterministyczna serializacja JSON w runnerach — sprawa czytelności
   diffów, nie rozmiaru repo. Patrz `RUNBOOK.md`.
3. Zrzut harmonogramu do `materialy/zadania-cykliczne.md` z flagą `enabled`
   i datą ostatniego odpalenia. Ma objąć też zadania spoza LEGO.
4. Odnośniki w `CLAUDE.md` (usunąć sekcję „Podział ról") i w
   `redakcja/wspolpraca.md`. `_meta` w `known_sets.json` i `redirects.json`
   do poprawienia. `README.md` do uzupełnienia.

**Uwagi:**
Jutro 9:00 zaplanowane zadanie Cowork odczyta raport indeksowania w GSC.
To wraca do problemu właściwego: 4 748 adresów w sitemapie, jedna
zindeksowana strona, ~4 691 szablonowych podstron `/zestaw/[nr]/`
generowanych przez `src/lib/huby.js`. Nie planować działań przed odczytem.

## 2026-08-23 20:30 · COWORK · Porządkowanie dokumentacji + backlog

**Zrobione:**
- `WSPOLPRACA.md` → `NARZEDZIA.md`. Zmiana nazwy, bo `redakcja/wspolpraca.md`
  opisuje inną oś podziału (Piotr ↔ Marek, ludzie) i identyczne nazwy myliły.
  Zawężona klauzula nadrzędności — nie unieważnia ustaleń z `redakcja/`.
  Usunięta lista długu (rotuje szybciej niż reguły, więc idzie tutaj).
- `COWORK-INSTRUKCJA.md` → `RUNBOOK.md`. Wycięta tabela harmonogramu
  (dubluje `materialy/zadania-cykliczne.md`), zachowana i poprawiona wiedza
  operacyjna: opóźnienie feedu ME, blokada 403, półki cenowe, rollback,
  `raw.githubusercontent`. Dopisane dwa nowe ustalenia z 23.08.
- Ustalona zasada: harmonogram jest **generowany**, nie pisany ręcznie.

**Stan:** gotowe do wgrania.

**Dla drugiej strony (CODE) — do zrobienia, priorytet malejąco:**

1. ~~Włącz Kontrolera w Routines~~ — ZROBIONE 24.08. `trig_01T8AhciW8JD651MrSMuEj7m`
   ma `enabled: true`, najbliższy przebieg 31.08. Powód wyłączenia i sprawa
   `Social` — we wpisie z 24.08 na górze pliku.
2. ~~Zmierz repo~~ — ZROBIONE 23.08. Wynik w Uwagach niżej: .git = 7,3 MB
   po gc. Temat cięcia repo zamknięty do odwołania.
3. **Deterministyczna serializacja JSON** we wszystkich runnerach: sortowanie
   kluczy, stałe wcięcie, stabilne liczby. Najtańsza naprawa o największym
   efekcie — patrz `RUNBOOK.md`.
4. **Zrzut harmonogramu:** zadanie cykliczne nadpisujące
   `materialy/zadania-cykliczne.md` realną konfiguracją triggerów. Musi
   zawierać flagę `enabled` i datę ostatniego odpalenia.
5. Usuń sekcję „Podział ról" z `CLAUDE.md`, zostaw dwa odnośniki:
   `redakcja/wspolpraca.md` (ludzie) i `NARZEDZIA.md` (narzędzia).
   Dopisz w obu plikach odnośnik do drugiego.
6. Ujednolić format commitów runnerów: `<Runner>: <opis>`, bez polskich znaków.
7. Drobne porządki:
   - `.wrangler/` do `.gitignore`
   - skasować `src/data/wycofania.astro` i `sprawdz3.mjs` (martwe)
   - poprawić `_meta` w `known_sets.json` i `redirects.json` — opisują
     nieprawdziwe źródło danych
   - udokumentować opisowo konfigurację deployu (brak `.github/workflows`,
     całość żyje w panelu Cloudflare — nie da się odtworzyć środowiska z repo)
   - uzupełnić `README.md`

**Dla Marka (poza repo):**
- Odinstaluj z Cowork skille `klocki-scout-nowosci`, `klocki-lowca-promocji`,
  `klocki-radar-konkurencji`, `klocki-kontroler` — uśpione duplikaty runnerów,
  zapisują do martwej ścieżki. Zostaw `klocki-redaktor`, `klocki-social`,
  `klocki-seo`, `klocki-afiliacje`.
- Zarchiwizuj `~/Desktop/TYLKOKLOCKI/blogoklockach-astro/`,
  `tylkoklocki-rebranding_1/` i `~/Documents/Claude/Projects/blogoklockach/`.

**Uwagi:**
Repo zmierzone: po `git gc` katalog `.git` waży 7,3 MB (przed: 26 MB).
Wcześniejszy alarm o puchnięciu historii był chybiony — delty kompresują się
dobrze mimo 17,4 MB surowych wersji `redirects.json`. Temat rozbijania pliku
i wynoszenia danych do R2 odłożony, przegląd najwcześniej za pół roku.
Deterministyczna serializacja JSON zostaje w planie, ale jako sprawa
czytelności diffów, nie rozmiaru repo.

Zrzut harmonogramu ma obejmować także zadania spoza LEGO (Herzfaden, XTB,
angielski) — dziś nie opisuje ich żaden dokument.

## 2026-08-23 19:00 · COWORK · Uruchomienie Search Console + ustalenie zasad współpracy

**Zrobione:**
- Dodana usługa `https://tylkoklocki.pl/` w Google Search Console (typ: prefiks
  URL), zweryfikowana automatycznie metodą „dostawca nazwy domeny" (token DNS
  w Cloudflare). Konto: marek.dolewski@gmail.com.
- Zweryfikowany stan GA4: tag `G-5M8LH9SKQC`, usługa „tylkoklocki", działa
  poprawnie — 24 użytkowników w 7 dni, 347 zdarzeń. Nic nie wymagało zmiany.
- Sprawdzona hipoteza o pozostałościach po starym sklepie w indeksie.
  **Nie potwierdziła się:** `site:tylkoklocki.pl` z `filter=0` zwraca jeden
  wynik (stronę główną z nową treścią), `site:tylkoklocki.pl drewniane` zero.
  W indeksie nie ma URL-i starego sklepu. Ślad po starym sklepie istnieje
  wyłącznie POZA domeną (Ceneo, Opineo, Gwiazdor, YouTube, PDF gminy Wołomin)
  i przez GSC się go nie usunie.
- Dodane `WSPOLPRACA.md` i ten plik.

**Stan:** gotowe. Zaplanowane zadanie Cowork `gsc-tylkoklocki-indeks` na
2026-08-24 09:00 — odczyta raport indeksowania, gdy GSC przeliczy dane.

**Dla drugiej strony (CODE):**
1. Przenieść `WSPOLPRACA.md` i `DZIENNIK.md` do korzenia repo i zacommitować.
2. Skasować `COWORK-INSTRUKCJA.md` — jest sprzeczny z
   `materialy/zadania-cykliczne.md` i myli oba narzędzia.
3. Rozstrzygnąć problem niedoindeksowania (patrz Uwagi) — to zadanie po
   stronie kodu, nie treści.

**Uwagi:**
Realny problem SEO jest odwrotny do początkowej hipotezy: sitemapa zgłasza
4 748 adresów, Google ją czyta („Sukces", ostatni odczyt 22.08), a
zindeksowana jest jedna strona. Z tego ~4 691 to `/zestaw/[nr]/` generowane
szablonowo z `huby.js` — kilka tysięcy niemal identycznych podstron z domeny
bez historii w tej tematyce. To profil, który Google typowo klasyfikuje jako
cienką treść i pomija.

Raport „Strony" w GSC był 23.08 jeszcze pusty (usługa założona tego dnia).
Jutro pokaże, czy huby siedzą w „Wykryto – obecnie niezindeksowana" (Google
je zna i świadomie odpuszcza) czy „Zeskanowana – obecnie niezindeksowana"
(odwiedził i uznał za zbyt ubogie). To dwie różne diagnozy i dwie różne
strategie naprawy — nie planować działań przed odczytem.

## 2026-08-24 · CODE (Scout) · Brickset API v3 — klucz i dokumentacja

**Zrobione:**
- Klucz Brickset API v3 (konto MAREK1972, wyrobiony 23.08) zweryfikowany:
  `checkKey` zwraca `{"status":"success"}`.
- Potwierdzony kształt danych na `getSets` dla 11371: `LEGOCom` zawiera
  wyłącznie rynki US / UK / CA / DE, każdy z `retailPrice`
  i `dateFirstAvailable`. **Ceny w złotych w API nie ma** — dla 11371 jest
  DE 249,99 EUR przy 1 099,99 zł w naszym `katalog.json`.
- `RUNBOOK.md`: nowa sekcja „Brickset API v3" — endpoint, klucz w env,
  limit liczony tylko dla `getSets`, `pageSize` do 500, `updatedSince`
  do przyrostów, pole cenowe, lista przydatnych pól, ograniczenia
  regulaminowe.
- Wcześniej dziś: pełny przegląd rocznika 2026 przez listy per seria
  (commit `5cd9d62`) — 416 realnych zestawów, 212 bez opisu redakcyjnego,
  dwie serie bez ani jednego opisu (Dreamzzz, The Legend of Zelda).

**Stan:** klucz działa, dokumentacja gotowa. Backfill cen świadomie
NIEZROBIONY — czeka na raport indeksowania GSC.

**Dla Marka (poza repo) — BLOKER:**
Klucz trzeba dodać jako `BRICKSET_API_KEY` w zmiennych środowiska CCR
(`env_01YL3diD2yzP3UGYsU7Txvx7`), tam gdzie siedzą `GSC_KEY_JSON_B64`
i `TD_TOKEN`. Sesja runnera nie ma do nich zapisu — wstrzykuje je
konfiguracja środowiska spoza kontenera, a `export` w kontenerze ginie
przy jego wygaszeniu. Do czasu dodania Scout nie może użyć API
w automatycznym przebiegu.

**Do ustalenia razem (po raporcie GSC):**
1. Źródło kursu EUR→PLN. Sam kurs NBP nie wystarczy — LEGO nie przelicza
   cen katalogowych kursem dnia. Dla 11371 implikowany przelicznik to 4,40,
   podczas gdy kurs rynkowy jest niższy. Trzeba zdecydować, czy liczymy
   mnożnikiem wyznaczonym z setów, dla których mamy obie ceny, czy
   oznaczamy cenę jako szacunkową.
2. Czy nadpisywać istniejące `cena_katalogowa` — ustalone, że NIE.
3. Format zapisu — serializacja deterministyczna (patrz backlog i reguła
   zapisu `sety.json` w RUNBOOKU).

**Uwagi:**
Wyznaczenie mnożnika EUR→PLN jest policzalne od ręki: w `katalog.json`
mamy ceny w zł, a API da EUR dla tych samych numerów. Rozrzut mnożnika
na kilkuset setach powie, czy LEGO trzyma stałe progi cenowe per rynek
(wtedy przeliczanie jest bezpieczne), czy nie (wtedy cena z przeliczenia
nie nadaje się do liczenia rabatu i lepiej zostawić puste pole).

## 2026-08-24 (2) · CODE (Scout) · Przelicznik EUR→PLN zbadany

**Zrobione:**
- Pobrane z API roczniki 2026 (913 setów, 2 wywołania `getSets`), 2024 i 2022
  (po 1). Zestawione z cenami w zł z `katalog.json`.
- **Przelicznik jest stabilny wewnątrz rocznika, ale dryfuje między nimi:**
  2026 → 4,223 (n=345, odch. 0,077), 2024 → 4,303, 2022 → 4,348.
  97,4% par mieści się w ±10% od mediany rocznika.
- Wniosek: przeliczanie jest bezpieczne dla roczników 2024–2026 przy użyciu
  mnożnika właściwego dla rocznika premiery. Jeden mnożnik globalny byłby
  błędny. Dla starszych roczników rozrzut rośnie i cena z przeliczenia
  przestaje nadawać się do liczenia rabatu.
- Rozbicie per seria nie pokazuje różnic (wszystko 4,10–4,29), więc mnożnika
  per seria nie trzeba. Per próg cenowy jest lekki wzrost (4,17 → 4,32),
  efekt zaokrągleń do `,99`.
- **Znalezione przy okazji: 9 zestawów rocznika 2026 ma najpewniej błędną
  cenę katalogową u nas** — mnożnik od 3,5 do 12,2 przy zgodnej liczbie
  elementów. Osiem z nich jest zawyżonych, czyli generują zawyżony rabat.
  Lista w RUNBOOKU.
- `RUNBOOK.md`: sekcje „Przelicznik EUR→PLN" i „Podejrzane ceny katalogowe".

**Stan:** analiza gotowa, nic nie zapisane do `katalog.json` — zgodnie
z ustaleniem czekamy na raport indeksowania GSC.

**Do decyzji Marka:**
1. Czy backfill ma używać mnożnika per rocznik (rekomendacja: tak) i czy
   ograniczyć go do roczników 2024+.
2. Czy ceny wyliczone oznaczać osobnym polem (rekomendacja: tak — inaczej
   za pół roku nie odróżnimy odczytanej od policzonej).
3. Dziewięć podejrzanych cen do weryfikacji na LEGO.com PL — to warto
   poprawić niezależnie od backfillu, bo psuje wiarygodność rabatów już dziś.
