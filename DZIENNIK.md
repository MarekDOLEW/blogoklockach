# Dziennik pracy

Jedyny kanał komunikacji między Claude Code a Cowork. Oba narzędzia czytają
ostatnie wpisy na starcie sesji i dopisują własny na końcu.

**Append-only.** Nie kasuj i nie przepisuj cudzych wpisów — historia jest tu po
to, żeby druga strona wiedziała, co się działo.

**Gdzie pisać:** nowy wpis wstawiaj **bezpośrednio pod linią znacznika**
`<!-- WPISY PONIŻEJ … -->`, na początku listy wpisów. Wszystko NAD znacznikiem
(ta instrukcja, ustalenia trwałe, indeks archiwum) zostaje w pliku na stałe
i archiwizacja tego nie rusza. Wpis wstawiony nad znacznikiem nie zostanie
zarchiwizowany nigdy — skrypt zgłosi to ostrzeżeniem.

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

## Ustalenia trwałe

Rzeczy, które obowiązują niezależnie od daty. Nie archiwizują się. Wpisuj tu
tylko to, co ma przetrwać miesiąc — jednorazowe ustalenia zostają we wpisach.

- **Decyzja o runnerze = zmiana jego promptu tego samego dnia** (Marek, 16.09.2026).
  Do runnera prowadzi tylko jeden kanał: prompt Routine (panel albo delete+create
  z sesji). `DZIENNIK.md` czytają sesje robocze, nie runnery — wpis w dzienniku
  sam w sobie niczego w runnerze nie zmienia (15.09 Scout dopisał 16 wycofań wbrew
  ustaleniu, które istniało wyłącznie tutaj). Ustalenie bez zmiany promptu nie jest
  wdrożone i nie wolno pisać, że jest.
- **Zamykanie zadań bez właściciela** (Marek, 16.09.2026). Kontroler co poniedziałek
  zbiera z dziennika pozycje „RADAR · Do zrobienia" i sygnały Scouta bez odpowiedzi.
  Zamknięcie: Marek mówi w rozmowie z Code jedno zdanie („zamknij 75192 — Piotr
  odmówił / zrobione / odkładamy do X"), Code dopisuje pod pozycją linię
  `→ zamknięte <data>: <powód>`; runner Wycofań dopisuje `→ Wycofania <data>: …`.
  Pozycje z taką linią Kontroler pomija. Pozycje „Kto: Piotr" i cała sekcja
  „Zadania bez właściciela" idą **mailem do Piotra i Marka** (klucz `kontroler`
  w `raporty_mail.json`), nie tylko PDF-em na czacie.
- **Pushuje tylko trwała sesja z repo w źródłach** (ustalone 21–22.09.2026 na
  dwóch awariach: Kontroler 21.09, Dane wt 22.09). Routine odpalany w świeżej
  sesji — założony z API czy z panelu — nie ma repo w źródłach (klon tylko do
  odczytu, push odrzuca proxy) ani konektora `Claude_Code_Remote`; może czytać,
  mailować i wgrywać do R2. Runner z danymi = `create_session(source_url)` +
  `create_trigger(persistent_session_id)`. Ręczny `fire_trigger` takiego
  Routine NIE trafia do trwałej sesji (zakłada pustą jednorazową); próbny przebieg
  robi się jednorazowym Routine z `run_once_at` przypiętym do sesji.
- **Routine założony z panelu zmienia i kasuje tylko Marek** (22.09.2026). API
  odmawia agentom (`created_via: http_api`), a klasyfikator uprawnień blokuje też
  kasowanie części Routine agentowych — prośba do Marka z ID i adresem
  `claude.ai/code/routines/<id>`.
- **Harmonogram z konta przepisuje sesja Code (pon 07:45), Kontroler tylko
  czyta** (22.09.2026). Konektor `Claude_Code_Remote` ma wyłącznie sesja Code.
- **Żaden audyt nie chodzi przez `/idz/` ani przez link trackingowy** (Marek,
  21.09.2026; 16.09 audyt C wysłał 17 kliknięć do trackerów). Cel linku sprawdza
  się przez `celLinku` z `scripts/linki-cel.mjs`, worker testuje się bez
  podążania za przekierowaniem (`curl` bez `-L`).
- **„SUCCEEDED" w `last_run` nie jest dowodem** (21–22.09.2026). Dowodem
  przebiegu runnera jest commit na `main` albo plik w repo; brak `last_run`
  po delete+create też nic nie znaczy.
- **Sesja runnera ma limit 1 M tokenów kontekstu** (22.09.2026: Łowca 753 k po
  37 dniach, ok. 20 k dziennie). Gdy `context_usage` z `get_session` przekroczy
  ~850 k, zakładamy nową sesję tym samym sposobem (`create_session` + nowy
  trigger, stary skasować) — reguły runnera muszą być w prompcie i skryptach,
  nigdy w pamięci sesji.
- **Oferta poniżej 50% potwierdzonej ceny katalogowej wymaga sprawdzenia przez
  człowieka** (Marek, 16.09.2026). Sito `filtrujOferty()` ukrywa ją na stronie;
  rano przychodzi mail z linkami (`podejrzany-rynek-mail.mjs`, klucz `podejrzane`,
  kontakt@); Marek potwierdza w rozmowie z Code („potwierdzam <nr> <cena> <sklep>"),
  Code dopisuje do `deale_potwierdzone.json` i oferta wraca tego samego dnia.

## Archiwum

Wpisy starsze niż 14 dni żyją w plikach miesięcznych. Nic nie zostało
skasowane — jeśli szukasz czegoś starszego, jest tam:

- [`2026-09`](materialy/dziennik-archiwum-2026-09.md) — 3 wpisy
- [`2026-08`](materialy/dziennik-archiwum-2026-08.md) — 36 wpisów

Archiwizuje `node scripts/archiwum-dziennika.mjs`.

<!-- WPISY PONIŻEJ — wszystko nad tą linią zostaje w dzienniku na zawsze -->

## 2026-09-25 07:05 · CODE · CRO: A, B (dolny blok), C, D, E, G na main; F i pasek przyklejony odrzucone

**Zrobione:** decyzja Marka po prezentacji przed/po: publikujemy wszystko oprócz F
(wiersz Brickset) i paska przyklejonego do dołu ekranu. Wycofane z kodu: wiersz
Brickset w `[nr].astro` i testowe pole `brickset` w `sety.json` (nie było go na
main, więc nic nie ubyło), wariant `przyklejony` w `PasekCeny.astro`, jego CSS
i skrypt IntersectionObserver w hubie. Zostaje: pasek „od X zł” pod tytułem huba
i posta (`pasek_zestaw`), blok „Najtaniej dziś” po karcie redakcyjnej, etykiety
przycisków z nazwą sklepu (tabele w hubach i artykułach), linia zaufania pod
tabelą, przyciski sklepów i „dziś od” w prezentownikach. RUNBOOK: sekcja
„Dział /deale/” opisuje `pasek_zestaw` i obie odrzucone rzeczy. Build 9 659 stron,
JSON bez ubytków.
**Stan:** gotowe, na produkcji po deployu z main.
**Dla drugiej strony (Marek, panel Routines):** w prompcie Łowcy dopisać jedno
zdanie: „W poście dealowym podaj we frontmatterze `pasek_zestaw: "<nr>"` z numerem
zestawu z tytułu — layout wstawi pasek z ceną pod tytułem.” Prompt Scouta bez zmian
(F odrzucone). Pomiar skutku: `node scripts/kliki-raport.mjs --dni 14` ok. 9.10 —
punkt odniesienia 139 realnych kliknięć/14 dni, 0 z prezentowników.
Uzupełnienie 07:10: Marek wstawił zdanie w panelu (edycja promptu Routine ze
stałą sesją zadziałała bez delete+create — `updated_at` 07:02, ta sama sesja
Łowcy); potwierdzone przez `get_trigger`. Kopia w `routine-prompty.md` odświeży
się w poniedziałek Routine „Harmonogram z konta".

**Otwarte po tej sesji (dla następnego wątku Code):**
- H z audytu CRO: filtr podrobionego referera na `/idz/` (`src/worker.js`) —
  czeka na decyzję Marka, dotyka workera.
- 40896 X-Files Laboratorium Scully: błędne RRP 81,99 zł w `sety.json`
  (wpis z 25.09 wyżej) — do poprawy po sprawdzeniu w lego.pl.
- 29.09: zarchiwizować starą sesję Łowcy `session_017FKg5b8kSCwbJd8r7xPrwD`
  (nowa działa od 23.09).
- Poniedziałek 28.09: Kontroler sprawdza indeksację 5 stron sezonowych
  (prezentowniki + rozdzielnik `/prezentowniki/prezenty-pod-choinke/`).
- Empik dwa zrzuty w tygodniu: Marek nie potwierdził — Routine „Przypomnienie
  Empik" zostaje raz w tygodniu, dopóki nie powie inaczej.
- Ok. 9.10: `node scripts/kliki-raport.mjs --dni 14` — skutek CRO.

## 2026-09-25 07:00 · CODE · CRO A–G wdrożone na przykładach testowych + prezentacja przed/po (PDF)

**Zrobione:** poprawki A–G z audytu CRO (`materialy/audyt-cro-hubow-2026-09-25.md`)
zaimplementowane w kodzie: nowy `src/components/PasekCeny.astro` (pasek „od X zł
w N sklepach −Y%” z przyciskiem do najtańszego sklepu; warianty gora/dol/przyklejony),
hub `[nr].astro` (pasek pod tytułem, dolny blok „Najtaniej dziś”, pasek przyklejony
na telefonie po przewinięciu tabeli, wiersz Brickset przy ≥20 głosach), `TabelaCen.astro`
+ `remark-ceny.mjs` (etykiety „x-kom →” zamiast „Sprawdź w sklepie →”, linia zaufania
pod tabelą), `KartaPrezentu.astro` (sklepy jako przyciski, najtańszy na żółto),
`GaleriaZestawow.astro` („dziś od X zł”), `Artykul.astro` (pasek z frontmatter
`pasek_zestaw`, użyty w poście x-kom). Dane testowe: `brickset` dla 43014 i 60470
w `sety.json`. Prezentacja porównawcza: `materialy/cro-przed-po-2026-09-25.pdf`
(13 slajdów, zrzuty przed/po z lokalnego buildu, pomiar: pierwszy przycisk sklepu na
telefonie 864→413 px na 43014, 1029→485 na 60470, 1432→462 w poście x-kom).
**Stan:** w toku — kod na gałęzi roboczej, **nie na main**; build przechodzi
(9 659 stron). Czeka na decyzję Marka: publikować A–G razem czy etapami (A+G, potem
C i B). H (filtr referera w workerze) osobno, wymaga zgody.
**Dla drugiej strony:** nic do czasu decyzji. Po publikacji: prompt Łowcy dostaje
zdanie o `pasek_zestaw` w postach dealowych, prompt Scouta — uzupełnianie pola
`brickset` (ocena, głosy, posiadacze, data) dla nowości.

## 2026-09-25 09:30 · CODE · Audyt CRO hubów — raport `materialy/audyt-cro-hubow-2026-09-25.md`

Pomiar układu (Playwright, 390 i 1280 px) + kliknięcia z Analytics Engine.
Fakty: 156 „ludzkich" kliknięć w 14 dni, z czego 17 to bot z podrobionym
refererem `/zestaw/x/` (16.09) — realnie ~10 dziennie; **78% z hubów, 0 z
prezentowników**, 8% z adresów `utm_source=chatgpt.com`. Na telefonie żaden hub
nie pokazuje ceny ani przycisku na pierwszym ekranie (tabela 776–1 320 px,
zgięcie 844), a poniżej tabeli — 85% długości strony — nie ma żadnego przycisku
sklepu. Poprawki po wpływie: A cena+przycisk nad zgięciem (hub), B dolny
przycisk/pasek, C prezentowniki z przyciskami (przed BF), D post dealowy,
E pasek zaufania (Allegro/dostawa), F dowód społeczny z Bricksetu (pole w
sety.json, Scout), G etykiety przycisków, H worker: referer bota (zgoda Marka).

## 2026-09-24 11:45 · CODE · Rozdzielnik sezonu `/prezentowniki/prezenty-pod-choinke/` (Radar 24.09 → zrobione)

Decyzja Marka: robimy, adres `prezenty-pod-choinke` (nie samo „pod choinkę").
Strona bez własnej listy zestawów: trzy pytania (wiek, kwota, licencja),
kafelki do czterech prezentowników świątecznych, kafelki do rankingu kalendarzy
adwentowych i wycofań grudniowych, terminy (Black Friday 27.11, Mikołajki do
1–2.12, Wigilia do 15.12), FAQ. Cztery prezentowniki sezonowe linkują do niej
z akapitu końcowego. Okładka 40809 (piernikowa chatka). Jest w sitemapie
prezentowników i na listingu działu. Po sezonie zostaje jako evergreen —
kafelki aktualizować co rok.
**GSC (Cowork, 24.09 ok. 12:00):** 5 próśb o indeksowanie wysłanych
(rozdzielnik + 4 prezentowniki), wszystkie „niezindeksowany" przy inspekcji
(strony sprzed 3 godzin — oczekiwane), limit dzienny nie wyczerpany.
Kontrola: Kontroler w poniedziałek 28.09 sprawdza, czy pięć adresów jest już
w indeksie; jeśli nie — druga prośba tylko dla rozdzielnika.

## 2026-09-24 11:15 · CODE · Prezentownik świąteczny po licencjach + sezonowa trójka na stronie głównej

`/prezentowniki/swieta-licencje/`: po jednej pozycji z ośmiu światów (Disney
43293, Super Mario 72035, Minecraft 21595, Star Wars 75402, Bluey 11217, Harry
Potter 76471, Marvel 76342, One Piece 75639), 125–430 zł. Karta:
`redakcja/karty/prezentownik-swieta-licencje.md`. Tym samym komplet czterech
tekstów z briefu Marka jest na produkcji. Rząd „Prezentowniki" na stronie
głównej przełączony na sezon: Mikołajki, dzieci, dorośli (po świętach wrócić
do wiek / seria / budżet — komentarz w `index.astro`). Do rozważenia
(Radar 24.09): rozdzielnik `/prezentowniki/pod-choinke/` pod frazę sezonu —
teraz ma sens, bo jest co rozdzielać.

## 2026-09-24 10:45 · CODE · Prezentownik świąteczny dla dzieci — trzy koperty

`/prezentowniki/swieta-dla-dzieci/`: dzieci 6–10 lat, koperty do 120 / 250 /
500 zł (3+3+2): 60498 Traktor, 71864 Ninjago pojazdy, 77119 Sonic Tails,
43299 łódź Arielki, 42688 stadnina Friends, 77982 spinozaur, 31168 zamek 3 w 1,
72168 Rayquaza (rada „kupuj przed Black Friday, nie po"). Różni się od
„według budżetu" zakresem wieku i wysokością prezentu. Karta:
`redakcja/karty/prezentownik-swieta-dzieci.md`.

## 2026-09-24 10:15 · CODE · Prezentownik świąteczny dla dorosłych — z researchem Bricksetu

`/prezentowniki/swieta-dla-doroslych/`: osiem zestawów 180–1 400 zł (Game Boy,
WALL-E i Ewa, Grzyby leśne, Pływające wydry, Jaguar E-Type, Fontanna di Trevi,
Mercedes G 500 — znika XII 2026, McLaren P1). Research: pełny listing Bricksetu
2025–26 (594 zestawy) posortowany po liczbie posiadaczy — Icons > Star Wars >
Botanicals > Ideas > Technic; hity to Game Boy (8 471 posiadaczy, 4,7), WALL-E
(5 274, 4,6), hełmy SW. Ekskluzywy bez rynku (Tudor Corner, Shire, Minas Tirith)
świadomie poza listą. Karta: `redakcja/karty/prezentownik-swieta-dorosli.md`.
Uwaga z danych: 40896 X-Files Laboratorium Scully ma w `sety.json` RRP 81,99 zł
przy cenie rynkowej ~419 zł — RRP do sprawdzenia (prawdopodobnie 469,99).

## 2026-09-24 09:30 · CODE · Prezentownik „na Mikołaja" — pierwszy z czterech sezonowych

Brief Marka: Mikołajki (małe zestawy dla dzieci do 300 zł), potem trzy
świąteczne: dorośli (kolekcje, auta, Technic — z researchem, co kupują AFOL-e),
dzieci w trzech progach cenowych, linie licencyjne. Pierwszy gotowy:
`/prezentowniki/na-mikolaja/` — osiem serii, osiem sposobów zabawy, wiek 4–10,
od polybagu 30729 po 60505 (990 el. za ~200 zł); sufit 300 zł z briefu
świadomie nieużyty (Mikołajki to mniejszy prezent niż gwiazdkowy). Kandydaci:
271 zestawów po filtrach (dostępny, RRP, cena rynkowa, bez wycofań, bez użytych
w innych prezentownikach). Karta: `redakcja/karty/prezentownik-na-mikolaja.md`.
Odpowiedź na pytanie Marka o rytm: Empik raz w tygodniu (pon.), dwa razy
w tygodniu to Smyk (automat); x-kom ręcznie, dopóki nie ma feedu (Admitad).

## 2026-09-24 09:20 · CODE · Skill `klocki-ceny-xkom` + wspólny import zrzutów (Empik, x-kom)

Marek: „zrób skill klocki-ceny-xkom jak dla Empiku". Zrobione na tym samym
wzorcu: `.claude/skills/klocki-ceny-xkom/SKILL.md`, paczka
`skille/klocki-ceny-xkom.skill` (Marek wgrywa w Settings → Skills), plik
`lego-xkom.json` z polem `available` (x-kom pokazuje cenę także przy
niedostępnym). Skrypty: `empik-import.mjs`/`empik-redirects.mjs` przepisane na
wspólne `zrzut-import.mjs`/`zrzut-redirects.mjs` z `--sklep`, stare nazwy
zostały jako nakładki (polecenia w promptach i skillu Empiku bez zmian);
`--sucho` na zrzucie Empiku z 21.09 daje identyczny wynik jak przed zmianą.
Test na syntetycznym zrzucie x-kom: gadżet, obca marka, niedostępny i adres
wyszukiwarki odrzucone, link = karta + `sm=`. CLAUDE.md: wyjątek od append-only
rozszerzony na `redirects.xkom` (ten sam powód co Empik). Liczby odniesienia
do kontroli jakości ustali pierwszy przebieg Coworka — wpisać je do skilla.

## 2026-09-24 08:00 · RADAR · Do zrobienia

**zklockow.pl · 24.09** — mają evergreenową stronę „Prezenty LEGO pod choinkę dla dzieci", wprost pod frazę szczytu sezonu.
**Mamy?** — nie: szesnaście prezentowników po seriach, wieku i budżecie, ale żaden nie celuje w tę frazę. „Choinka" pada tylko w środku kilku tekstów, nie w tytule ani adresie żadnej strony.
**Zrobić:** — strona-rozdzielnik `/prezentowniki/pod-choinke/` kierująca do istniejących prezentowników (wiek, budżet, seria) plus do [kalendarzy adwentowych](/artykuly/ranking-kalendarze-adwentowe-lego-2026/) i [wycofań](/artykuly/wycofania-lego-grudzien-2026/). Treść już mamy, brakuje wejścia pod frazę.
**Kto:** — Code (dane, strona)


## 2026-09-23 15:40 · CODE · Ceny x-kom w tabelach (pierwsze w historii serwisu) + pole `wazne_do`

Marek: „nie mamy w ogóle cen z x-kom?" — nie mieliśmy: zero w `sety.json`
i `oferty_feed.json`, bo SalesMasters nie daje feedu, a x-kom blokuje ruch
serwerowy; sklep był w tabelach tylko jako link z workera. Teraz 9 cen z mailingu
(23.09) siedzi w `sety.json` jako oferty `xkom` z `wazne_do: 2026-09-30`;
`ofertaAktualna()` w `src/lib/oferty.js` respektuje to pole, więc po 30.09 wiersz
znika sam. Skutek: x-kom jest najtańszy w tabelach 8 z 9 hubów (43014, 42231,
43012, 43027, 43022, 11380, 42235, 43011), meta description hubów liczy rabat od
tej ceny. W poście linki do x-kom zmienione z tekstu na przyciski `.przycisk`
z ceną. Do decyzji Marka: skąd brać ceny x-kom na stałe (feed z Admitad — w
planie z 18.08 — albo prośba do opiekuna SalesMasters o feed).

## 2026-09-23 15:15 · CODE · „Podobne zestawy z serii": tylko z ceną i dostępne w LEGO

Marek (zrzut z huba 42130): obok BMW M 1000 RR stał Test Car 8865 z 1988 roku
i trzy kafelki „brak w lego.pl". Reguła w `src/lib/seria-huby.js` dobierała
„z reszty", gdy brakowało pełnych pozycji. Teraz pula to wyłącznie zestawy ze
zdjęciem, aktualną ofertą i obecne w sklepie LEGO (`!eolLego`); mniej niż
cztery → tyle, ile jest; zero → sekcja znika. Po buildzie: 8 888 hubów
z sekcją, 613 bez, zero plakietek EOL/„brak w lego.pl" i zero „sprawdź cenę"
w kafelkach. Kolejność postów dealowych: pole `wyroznienie: true` we
frontmatterze wypycha post na początek na głównej i w `/deale/` (x-kom do 30.09).

## 2026-09-23 15:00 · CODE · Strona główna: trzy najnowsze posty dealowe pod slajderem + przycisk „Zobacz wszystkie deale"

Decyzja Marka: dział /deale/ był zbyt ukryty (wejście tylko z menu i stopki).
Nowa sekcja „Najnowsze deale" zaraz pod karuzelą dealów dnia: trzy najświeższe
posty z `src/pages/deale/*.md` (te same zajawki co listing działu), zakończone
pełnym przyciskiem `.przycisk` (nowy styl, granatowy) do `/deale/`. Posty nie
dublują się z sekcją „Ostatnio na blogu" (tamta nie czyta katalogu deale).
Reguła Marka: „jak jest taka akcja, to trzeba o niej pisać" — kampania sklepu
z datą końca jest poza limitem dwóch postów tygodniowo.

## 2026-09-23 12:00 · CODE · Deal: Dzień Chłopaka w x-kom (mailing SalesMasters, do 30.09)

Marek wkleił mailing opiekuna x-kom: 9 zestawów, „rabaty do −23%" liczone od
ceny wyjściowej sklepu. Od RRP to −29% do −38%. Porównanie z naszymi danymi:
cztery rekordy notowań (43014 Leclerc 249,90; 42231 Dodge Charger 444,90; 43012
Ronaldo i 43027 Vini Jr. po 76,90), cztery poniżej dzisiejszego rynku bez rekordu
(43022, 11380, 42235, 43011), jeden droższy niż Allegro (42228 McLaren 699,90 vs
659). Post `/deale/deal-x-kom-dzien-chlopaka-2026/` z reguły (c) — akcja sklepowa
≥5 zestawów; **trzeci post dealowy w tym tygodniu** (Łowca dał dziś 60470 i
75404) — limit „2 tygodniowo" dotyczy Łowcy, kampania partnera z datą końca
uznana za wyjątek; Marek może zdjąć. Linki produktowe x-kom z uniwersalnym kodem
SalesMasters (`sm=Y74rgdCO`) dopisane do `redirects.json` (gałąź `xkom`, 2 → 11).
Cen x-kom NIE wpisano do `sety.json`/`oferty_feed.json`: sito 14 dni pokazywałoby
je do 7.10, a akcja kończy się 30.09 — hub ma wiersz „Sprawdź cenę" z workera.
Stron x-kom nie da się zweryfikować z kontenera (blokada ruchu serwerowego) —
post mówi wprost, że kwoty są z informacji sklepu z 23.09.

## 2026-09-23 10:30 · CODE · Łowca 23.09: widma PK i śmieci z Allegro — poprawki w `feedy-lego.py`; werdykty Coworka o lukach katalogu

**Planeta Klocków — 55 z 85 „najtańszych" ofert to widma.** Feed `nokaut.xml` nie
niesie dostępności; karta produktu ma `schema.org/OutOfStock` (np. 21065 Sagrada
Família za 559,99 zł). Od dziś `feedy-lego.py` sprawdza każdą kartę PK z feedu
(`ProductUrl`, `curl`, 8 równolegle, druga próba z dłuższym limitem dla
nierozstrzygniętych) i oferty OutOfStock wyrzuca z wyciągu — Łowca traktuje je
jak nieobecne w feedzie i zdejmuje z huba bez zmiany promptu. Test na dzisiejszym
feedzie: 1 302 karty, 137 OutOfStock (w tym 21065, 11503, 10365), 235
nierozstrzygniętych w pierwszej próbie (limit 15 s — stąd druga próba; próbka 40
kart przy ponownym odczycie: 40 rozstrzygnięć, próbka 12 „OutOfStock": 12 trafień,
zero stron z oboma znacznikami). Przebieg Łowcy wydłuży się o ~10 minut. Szczegóły:
RUNBOOK „Planeta Klocków: feed nie niesie dostępności". Numery odrzucone:
`_meta.planetaklockow_niedostepne`.

**Allegro — śmieci z numerem w tytule.** Separator 96874 za 3,99 zł wchodził jako
„najtańsza oferta" — do `SLOWA_NIE_ZESTAW` doszły akcesoria (separator, akcesori,
wyciskacz, mata, podkładka); `p[lł]ytk` i słowa o płytkach bazowych wypadły
(łapały zestawy 11717, 11026). **561701 i 391506 to prawdziwe polybagi** (są
w katalogu) — nie błąd filtru. Podwójny mail „podejrzany rynek" wziął się z
dwukrotnego uruchomienia skryptu w jednym przebiegu — bez poprawki, do obserwacji.
Jednorazowy trigger odblokowujący Łowcę (07:10) już się wyłączył sam.

**Werdykty Coworka (przeglądarka: LEGO.com PL, Brickset, Ceneo) o lukach Scouta:**
- 72050 (779,99 zł) i 11503 (379,99 zł) miały RRP w katalogu, brakowało w
  `sety.json` — uzupełnione; 72050 pokazuje teraz −29% od cennika;
- 40507 (LEGO House), 40952 (LEGOLAND), 40916 (GWP) i 910059 (BrickLink Designer
  Program) nigdy nie miały polskiej ceny katalogowej — nowe pole **`bez_rrp`**
  (powód w wartości) w `sety.json` i `katalog.json`; hub zamiast „podamy, gdy LEGO
  ją poda" pisze „bez polskiej ceny katalogowej: <powód>, rabatu nie liczymy",
  meta description bez „rabat liczony od RRP"; Scout ma je pomijać w Lukach;
- nowe wpisy w `sety.json`: 72153 Venusaur, Charizard i Blastoise (2 799,99 zł,
  6 838 el., ekskluzyw), 72152 Pikachu i Poké Ball (869,99 zł, 2 050 el.), 910059
  Privateer Frigate Fortuna (4 087 el., 20 minifigurek, `bez_rrp`); 45521 to LEGO
  Education — nie wchodzi;
- 72152: RRP 869,99 zł potwierdzone; rynek ~540–600 zł to cena europejska
  (199,99 €), nie błąd — tekst „dla kolekcjonera" mówi o tym wprost. Temat na
  krótką formę dla Piotra: „cena LEGO.com odstaje, rynek stabilny".

**Scout — nowy trigger `trig_013QRUCfL8ZAa45eDkQUkWXD`** (ta sama sesja
`session_012AZejbFzsfzkTh4FPaAkVg`, cron `0 3 * * *`) z regułą `bez_rrp`
i zakazem dodawania LEGO Education. Stary `trig_01DmDAaz993ddzz61pQj9o9X`
wyłączony i przemianowany na „STARY (do skasowania)" — klasyfikator trybu auto nie
pozwala sesji Code kasować triggerów (jak przy Kontrolerze 22.09), a prompt
stałej sesji da się zmienić tylko z tej sesji albo przez delete+create. Marek
kasuje stary w panelu. Harmonogram w `zadania-cykliczne.md` przepisze się
w poniedziałek.

## 2026-09-23 10:00 · CODE · Łowca: pierwszy przebieg w nowej sesji i na feedzie „tylko LEGO" — po 40-minutowym zacięciu na uprawnieniach

Przebieg 06:33 UTC stanął na `cat > lowca-zapisz-dzis.py && python3 …` w katalogu
repo — tryb auto zapytał o zgodę, której w sesji runnera nikt nie daje (stara
sesja pisała skrypty inaczej i pytań nie miała). Odblokowanie: jednorazowy Routine
do sesji (07:10) z instrukcją „skrypty robocze przez heredoc albo ze scratchpadu";
commit eba381f o 07:15, raport do redakcji wysłany. Stała poprawka: sekcja
„SKRYPTY ROBOCZE POZA REPO" w prompcie Łowcy (`trig_017omSdzXXrZQTjBBp4UfVTg`).

Dane z nowego feedu Allegro: 6 398 ofert z datą 23.09 (wczoraj 5 108 ze starego
feedu), `porzadek-ofert --sucho` = 0, w repo nie ma pliku roboczego. Sito: 6 ofert
powyżej 3× RRP ukryte. Najtańsze oferty Allegro to prawdziwe polybagi i minibuildy
(11947, 11969, 30659, 30636…), 1 w Archiwum (30711 Creator polybag) — filtr części
trzyma. Diff commita: sety.json 7 453 linii, redirects.json 11 377 — jednorazowo, bo
wszystkie linki Allegro dostały nowe adresy z nowego feedu; jutro ma być mały.
Dwa posty dealowe (60470 Ekspres polarny < 600 zł, 75404 Acclamator nowe minimum) —
oba z reguły (b): minimum na zestawie z listy wycofań. Łowca zgłosił w podsumowaniu
„55 niedostępnych ofert PK i błąd filtru akcesoriów" — do przeczytania w raporcie
mailowym Łowcy z 23.09 (Code nie widzi rozmowy runnera).

## 2026-09-23 08:00 · RADAR · Do zrobienia

**faniklockow.pl · 22.09** — opublikowali tekst o 75455 Boba Fett z tezą, że ponad połowa wartości zestawu to minifigurka.
**Mamy?** — częściowo: `/zestaw/75455/` ma kartę redakcyjną, ale nie mamy żadnego własnego tekstu o tym zestawie.
**Zrobić:** — krótka forma dealowa „LEGO 75455 Boba Fett trzydzieści procent pod cennikiem". Oś nasza, nie ich: zestaw chodzi w siedmiu sklepach, najtaniej 509 zł wobec 729,99 zł katalogowo, a LEGO.com jest najdroższy. Ich tezy o udziale minifigurki nie powtarzamy — nie mamy danych o cenach minifigurek i nie da się jej sprawdzić.
**Kto:** — Piotr (tekst)

**promoklocki.pl · 23.09** — prowadzą osobne wpisy z terminami na każdą kampanię sklepu zewnętrznego: Allegro Smart! Weeks, Allegro Days, Black Weeks, okazje limitowane.
**Mamy?** — nie: nasz kalendarz mówi ogólnie o „kampaniach sklepów zewnętrznych przed Black Friday", ale nie nazywa żadnej i nie podaje terminu.
**Zrobić:** — ustalić termin Allegro Black Weeks 2026 i dopisać go do sekcji listopadowej `/kalendarz-promocji-lego/`; to jedyna kampania sklepowa, która realnie wpada w nasz szczyt sezonu.
**Kto:** — Code (dane, strona)


## 2026-09-22 14:40 · CODE · Trzy rankingi Piotra + karta 75192 na stronie

Artykuły (Rankingi, data 22.09, tagi „Dla kolekcjonera"): `/artykuly/najwieksze-zestawy-lego-technic/`
(okładka 42100; tabele cen 42177, 42172, 42232; galeria 6 zdjęć),
`/artykuly/najwieksze-zestawy-lego-star-wars/` (okładka 75419; tabele cen 75397,
75367, 75192, 75419 w miejscach oznaczonych przez Piotra `[TABELA CENOWA]`; galeria 6),
`/artykuly/najdrozsze-zestawy-lego-rynek-wtorny/` (okładka 10123; tabele cen dla
wycofanych z ofertą: 21137, 10196; galeria 6; ceny w USD z BrickLink/eBay III–VIII
2026 to treść rankingu, nie snapshot sklepowy). Tabele zbiorcze mają linki do hubów
tylko w kolumnie zestawu (pierwsza wersja zlinkowała też kolumnę „Mediana USD" — 8098
to numer zestawu; poprawione przed buildem). FAQ w frontmatter napisane z faktów
z tekstu (3 na artykuł). Sześć numerów z rankingu wtórnego nie ma huba (6286, 6285,
852293, 7783, 7785, 6991) — bez linku. Bez „cegieł" w żadnym z tekstów.

Karta P07 75192 Sokół Millennium: nowy wariant szablonu (bez stylów, metryka jako
tabela Pole|Dane, FAQ w jednym akapicie „pytanie?odpowiedź") — `import-karty.py`
rozszerzony (P07c), RRP 3 599,99 zgodne, 4 akapity + 5 FAQ, rejestr 1 098 → 1 099.
Hub `/zestaw/75192/` bez `noindex` (przy crawlu 10.09 Google widział noindex —
prośba o indeksowanie wysłana dziś przez Coworka). Build: 9 651 stron.

## 2026-09-22 14:10 · MAREK (Cowork) → CODE · GSC: 807 zaindeksowanych (18.09), sitemap-priorytet usunięta, 10 próśb o indeksowanie wysłanych

Panel GSC, dane z 18.09.2026: **807 zaindeksowanych, 2 910 niezaindeksowanych**
(6 przyczyn) — wobec 307 / 3 360 z odczytu 15.09 (dane z 4.09). Mapa
`sitemap-priorytet.xml` usunięta z GSC, zostało 8 map (index nietknięty).
Prośby o zindeksowanie wysłane dla 10 adresów bez limitu: `/` (crawl 25.08),
`/artykuly/najdrozsze-zestawy-lego/`, `/przecieki/`, `/artykuly/jak-rosly-zestawy-lego/`,
`/artykuly/slowniczek-lego/`, dwa teksty o historii licencji — wszystkie
„nieznane Google"; `/zestaw/76354/` i `/ekskluzywne/` — „wykryta, niezindeksowana";
`/zestaw/75192/` — przy crawlu 10.09 miał `noindex` (dziś w buildzie go nie ma,
karta P07 Piotra dla 75192 w imporcie). Punkt odniesienia dla Kontrolera 29.09.

## 2026-09-22 13:20 · CODE · Allegro: przełączenie na feed „tylko LEGO" (decyzja Marka), filtr części w feedy-lego.py

Porównanie (surowo): feed LEGO `39967a61…` 475 847 linii / 475 419 LEGO; feed
szeroki `497662bc…` 777 165 / 64 977 LEGO. Wyciąg bez zmian w skrypcie dawał
z nowego feedu 25 895 „zestawów" — w tym 605 ofert poniżej 15 zł na numerach
elementów kolidujących z Archiwum (1747, 2431, 2434…). Po nowych bramkach
(ścieżka `> LEGO > Zestawy`, „Liczba elementów" ≥ 10, słownik części w
`SLOWA_NIE_ZESTAW`, atrybut „Numer produktu" tylko gdy sam numer, fallback
numeru z tytułu w kategorii Zestawy): 6 398 numerów, 5 975 z hubem, 2 odsiane
progiem 28%, 957 powyżej 3× RRP (kolekcjonerskie, ukrywa górne sito), 83 bez
RRP poniżej 15 zł — same polybagi Creator 119xx. `feedy.json`: `url` → feed
LEGO, stary jako `url_zapasowy`. Testy zaciągały feed czterokrotnie po ~1,1 GB;
skutki uboczne w `historia-cen`, `oferty_feed`, `redirects` cofnięte, na main
idzie tylko konfiguracja i skrypt. Pierwszy realny przebieg: Łowca 23.09 08:30 —
sprawdzić `_meta.liczby.allegro` (oczekiwane ~6 400) i czy huby Archiwum nie
dostały ofert za 1 zł.

## 2026-09-22 12:05 · MAREK → CODE · Decyzje: kamienie milowe zamiast 20 000 zł, sitemap-priorytet zdjęta, pomiar Allegro/PK zostaje, Firecrawl 1 500/mies.

- **Cel na grudzień 2026 = cztery kamienie milowe** (pierwsza zatwierdzona prowizja
  w każdej z trzech sieci z API, EPC per sklep na próbie > 1 transakcji, kliknięcia
  z Polski dziennie, zaindeksowane strony z panelu GSC); 20 000 zł to cel roku 2027.
  Prompt Kontrolera przepisany (`trig_0167qmnWn3Qjjz8HTwZU1uEP`).
  → zamknięte 22.09: decyzja Marka.
- **`sitemap-priorytet.xml` zdjęta z repo** (`src/pages/sitemap-priorytet.xml.js`
  usunięty; nie była w `sitemap-index.xml`). Z panelu GSC (Mapy witryny) usuwa ją
  Marek — Cowork dostaje komendę razem z prośbą o indeksowanie 10 adresów.
  → zamknięte 22.09 (pozycja 10 audytu mechanizmu z 15.09).
- **Pomiar Allegro i Planety Klocków: zostawiamy** bez ręcznego odczytu z paneli;
  EPC tych sklepów pozostaje modelem. Kontroler nie proponuje tego ponownie.
  → zamknięte 22.09: decyzja Marka.
- **Firecrawl: 1 500 kredytów miesięcznie, odnowienie 28.09** (i co miesiąc).
  Tygodniowy listing lego.pl (~75) mieści się z zapasem; alarm z audytu 22.09
  (107 kredytów) nieaktualny.
- **Scout 13/19/20.09**: Marek sprawdził w panelu — przebiegi były, bez nowości.
  → zamknięte 22.09.
- **Nowy feed Allegro** `39967a61-8483-4037-bc45-165d4978a379` odpowiada 200
  (ndjson, LEGO w środku) — porównanie z obecnym `497662bc…` w toku, wynik niżej.

## 2026-09-22 11:40 · CODE · Łowca w nowej sesji (decyzja Marka), stara zostaje do 29.09

Nowa sesja `session_01SdxKtAvW8UmktsuXrsPYga` (Fable 5, repo w źródłach), trigger
`trig_01Fu1fB4ZmZN6daDtHqEDWZy`, ten sam prompt z krokiem `porzadek-ofert.mjs`.
Sesja startowa: fetch, `npm ci`, diagnoza `--szybko`, dry-run pushu — wynik w
podsumowaniu sesji. Pierwszy realny przebieg jutro 08:30 PL; sprawdzić commit
„Łowca: ceny i oferty 2026-09-23" i czy `sety.json` nie wraca do kolejności po
cenie (`node scripts/porzadek-ofert.mjs --sucho` ma zwrócić 0). Stara sesja
Łowcy (753 k tokenów, 1 030 USD od 16.08) bez triggera — do archiwizacji 29.09.
Skill `klocki-ceny-empik` — Marek podmienia paczkę na koncie (stara do skasowania,
nowa z pliku `skille/klocki-ceny-empik.skill`).

## 2026-09-22 09:45 · CODE · Audyt po awariach: 18 cen-absurdów, 3 zapowiedzi jako EOL, Łowca bez porządku ofert, 25 zdań nieprawdziwych w dokumentach

Raport: `materialy/audyt-2026-09-22.md` (PDF u Marka). Trzy przebiegi — A zadania
cykliczne, B dane, C dokumenty. Korekty do wcześniejszych wpisów: stary Kontroler
`trig_01JhfcGMgzv1nBwiguH93m6N` skasowany przez Marka przed 08:50 (wpis 06:20
mówił „nadal istnieje"); decyzja o workerze zamknięta 22.09 — zostaje; plan
„28.09 z patchem" z wpisu 21.09 12:00 nieaktualny (Kontroler w trwałej sesji,
próbny przebieg 06:40 UTC wypchnął raport sam: 6337305, 897729e).

Naprawione dziś: próg górny 3× RRP w `src/lib/odsiew.js` (18 ofert, m.in. 11025
za 8 981,49 zł przy RRP 36,99 zniknęło z tabel i JSON-LD); 75457, 10371, 21373
z EOL na `dostepny` (21373 do Ideas), `katalog-z-rebrickable.mjs` czyta sety.json;
trzy huby „LEGO {?}" → „bez ogłoszonej nazwy" + osłona w szablonie; granica tokenu
numeru w `empik-import.mjs` i `empik-redirects.mjs` (sw1246 ≠ 1246);
`porzadek-ofert.mjs` uruchomiony (905 zestawów) i dopisany do promptu Łowcy —
nowy trigger `trig_01XWKB1HjSS5riTkB37bQK5V`, stary skasowany; CLAUDE.md,
NARZEDZIA, RUNBOOK, zadania-cykliczne (część ręczna), scripts/README,
materialy/README, skill Empik (przepakowany — do wgrania), redakcja/README,
szablon generatora harmonogramu. Sześć nowych Ustaleń trwałych.

Decyzje dla Marka: nowa sesja Łowcy (753 k z 1 M tokenów), kredyty Firecrawla
(107, tydzień = 75), prompt „Przypomnienie: Empik" w panelu (plik do Code, nie
do Łowcy), historia przebiegów Scouta 13/19/20.09, trzy decyzje z raportu
Kontrolera.

## 2026-09-22 08:00 · RADAR · Do zrobienia

**Kontrola własna · 22.09** — `kontrola-rrp.mjs` porównuje ze źródłem tylko wpisy, które JUŻ mają cenę (linia 66: `if (s.cena_katalogowa)`), więc puste ceny nigdy nie były zgłaszane jako rozbieżność. Tak przeleżało 112 zestawów z ceną potwierdzoną w `rrp_potwierdzone.json` i `null` w katalogu.
**Mamy?** — tak: ceny uzupełnione w tym przebiegu, `ROZBIEŻNYCH: 0`, liczba wpisów z ceną 4661 → 4773.
**Zrobić:** — zmiana w `scripts/kontrola-rrp.mjs`: osobny licznik „puste ceny, a źródło je zna", żeby następna taka luka wyszła sama, zamiast czekać na przypadek.
**Kto:** — Code (dane, strona)


## 2026-09-22 06:00 · CODE · Naprawy po dwóch dniach awarii runnerów: Dane wt w trwałej sesji, Scout z regułą dowodu, luka 30732

Ustalenia z gita (ten klon, reflog `origin/main` od 12.09): zero przepisań
historii `main` — każdy odczyt jest przodkiem następnego; wszystkie commity
Scouta z 15–18.09 są na `main` (f743218, 6d47664, 8af713c, fee8edd); jedyne
duble to dwie pary z 15.09 08:28/08:48 vs 08:49 (rebase w sesji Code, obie
kopie na `main`, bez skutków dla danych). Force-push z tej sesji szedł tylko na
własną gałąź `claude/…`, nigdy na `main`. Zgłoszenie Scouta „forced update +
zniknęły commity z 15–16.09" nie ma pokrycia w `main`; prawdopodobna przyczyna
po stronie jego klonu (płytka historia / stały ref), ale z tej sesji tego nie
widać — od jutra Scout ma wklejać reflog zamiast tezy. Nadal bez wyjaśnienia:
brak commitów Scouta 19–20.09 (historia przebiegów tylko w panelu).
`przecieki.json` z wcięciem 1 to zmiana zamierzona (bf85683, 16.09, na uwagę
samego Scouta) — Scout pamiętał stan sprzed niej i zgłosił ją jako nową.

Zrobione: (1) „Dane wt 05:30" jako trwała sesja z repo
(`session_011Ced7USAHUBBsCPZ1os3F9`, Sonnet 5; dry-run pushu OK, 14/14
zmiennych), trigger `trig_01PwyDWKRCLydgDxAH8eRzzR`; (2) Scout odtworzony
`trig_01DmDAaz993ddzz61pQj9o9X` z sekcją „GIT I PAMIĘĆ" i „Luki katalogu";
(3) kolejka redakcyjna i wykaz bez opisu liczą zestawy bez RRP po najniższej
ofercie z feedu — 30732 (14,04 zł, Minecraft) wchodzi do obu arkuszy z dopiskiem
„bez RRP — cena z rynku"; takich zestawów jest 13 (4 polybagi 2026, reszta
gadżety/archiwum); (4) harmonogram i kopie promptów przepisane z konta.

Kontroler (06:12): panel nie ma pola na konektor (Marek sprawdził), więc
zamiast odtwarzania z panelu — trwała sesja z repo
`session_01M8qMJFfKHEozBSGXjAKP4n` (Opus 5; dry-run pushu OK, 14/14 zmiennych),
trigger `trig_01EDEhtPiW4AVSAiGg9Co1mx` (pon 09:00 PL). Krok „harmonogram
z konta" przejęła ta sesja Code własnym Routine `trig_01GJ2ecMp3gwtkZ1pFyUPKLH`
(pon 08:00 PL, self-bind — tylko sesja Code ma konektor `Claude_Code_Remote`);
Kontroler czyta gotowe pliki z repo. Prompt: `materialy/kontroler-prompt-2026-09-22.md`.

Do zrobienia z panelu przez Marka (sesja Code nie ma uprawnień do Routines
założonych w panelu): skasować stare `trig_012JWbmYwHb59sYazo6K9X33` (Dane wt,
inaczej we wtorek odpalą się dwa, stary bez pushu za ~75 kredytów Firecrawla)
oraz dwa Kontrolery bez repo: `trig_01JhfcGMgzv1nBwiguH93m6N` (stary; próba
skasowania z tej sesji zablokowana przez klasyfikator uprawnień) i założony dziś
z panelu `trig_012F22qZPFRvBhxG2HUG9puV` (`sources: null`, konektory bez
`Claude_Code_Remote` — panel nie daje go wybrać). Inaczej w poniedziałek
odpalą się trzy raporty, z których pushuje tylko `trig_01EDEhtPiW4AVSAiGg9Co1mx`.
Harmonogram z konta przesunięty na 07:45 PL (kolizja z Radarem o 08:00).

**06:20 — Marek skasował dwa Routine, worker zatwierdzony.** Z panelu zniknął
mój nowy Kontroler (`trig_01UjqSHw…`) i jego własny z 22.09; stary
`trig_01JhfcGMgzv1nBwiguH93m6N` („[env projektu]", bez repo) nadal istnieje —
do skasowania, inaczej w poniedziałek dwa raporty. Kontroler odtworzony na tę
samą sesję pod `trig_01EDEhtPiW4AVSAiGg9Co1mx` i odpalony próbnie o 06:21 UTC. Poprawka
referera (3f42a9c) była na produkcji od 21.09 11:55 UTC; decyzja Marka 22.09
zamyka sprawę — zostaje. Test produkcji (bez podążania za redirectem, więc bez
kliknięcia u trackera): fałszywy referer `/zestaw/x/` → 302 na hub z
`?idz=odrzucony`; realny hub + `Sec-Fetch-Site: same-origin` → 302 do trackera. Decyzja o poprawce workera (3f42a9c na produkcji od 21.09 11:55 UTC)
nadal otwarta.

## 2026-09-22 05:40 · CODE · „Dane wt 05:30" przebiegł i nic nie zapisał — sekwencję wykonała sesja Code

Routine `trig_012JWbmYwHb59sYazo6K9X33` odpalił się 03:36 UTC, sesja
`session_01KuJvFCLE1Ad2xxcrAEMZgT` pracowała 22 minuty (Sonnet 5, 94 k tokenów),
status „SUCCEEDED" — a na `main` nie ma commita „LEGO.pl + Ceneo + Smyk…".
Konfiguracja sesji: `sources` puste, jak u Kontrolera 21.09. Drugi dowód na to
samo: Routine ze świeżą sesją nie ma repo, więc push odpada. Co runner zrobił
z danymi (patch? pliki na czat?) z tej sesji nie widać — Marek zobaczy w panelu.

Sekwencję z promptu wykonała sesja Code (ten sam FIRECRAWL_KEY i TD_TOKEN):
listing lego.pl 1 343 pozycje / 938 zestawów (bramka ≥800 OK), 951 cen `lego`
(2 nowe), 975 RRP (+1, 0 konfliktów), `redirects.lego` +1; Ceneo 1 552 cen
(126 nowych, 809 zmian), linki 1 538 → 1 618; Lidl 61; Smyk 662 z ceną,
42 niedostępnych, 0 błędów — cztery zestawy z datą 16.09 (42699, 43266, 43271,
43272) domknięte datą 22.09; Rebrickable dopisał 140 zestawów do katalogu
(9 360 → 9 500). Koszt: drugie ~75 kredytów Firecrawla w tym samym dniu, bo
przebiegu runnera nie da się odzyskać. Ekskluzywy bez etykiety na listingu (do
ręcznego sprawdzenia): 76355 40858 11386 43026 11385 40919 76476 31221 40872
40975 21369 76354 40880 21373 40868 80121 80120 40859.

## 2026-09-21 12:50 · CODE · Zrzut Empiku z 21.09 wgrany: 4 370 cen, 4 775 deeplinków

Cowork (skill `klocki-ceny-empik`) dostarczył 5 309 pozycji z trzech przebiegów
listingu — Empik ucina każde sortowanie po ~4 860 pozycjach, więc `priceAsc`
i `priceDesc` zostawiały lukę ok. 170–234 zł; trzeci przebieg z filtrem
`priceFrom=150&priceTo=260` domknął katalog (11 153 z 11 155). Zapisane w skillu
i przepakowane (`skille/klocki-ceny-empik.skill` — do wgrania na claude.ai).

Import (`empik-import.mjs`): 4 370 cen (było 3 947), 571 nowych, 1 268 zmian,
148 setów straciło cenę Empiku (świeżość nadrzędna), 34 nowe minima w `ceny_baza`.
Nowy filtr `OBCE_MARKI` — Empik miesza w „Klockach" Playmobil i CaDA, a numery
70734/71417 kolidują z zestawami LEGO; 13 pozycji odrzuconych po nazwie marki.
`empik-redirects.mjs --usun-martwe`: 4 480 → 4 775 (325 nowych, 261
zaktualizowanych, 30 martwych skasowanych). Liczba setów w feedzie 8 285 → 8 545,
`sety.json` i `ceny_baza` bez ubytków. Sokoła 75192 w zrzucie nie ma — Empik
go nie sprzedaje, hub pokazuje pozostałe sklepy.

## 2026-09-21 12:00 · CODE · Werdykt: Routines odpalane od zera nie mają repo ani konektorów — naprawa tylko z panelu

Jednorazowy trigger testowy (świeża sesja, jak Kontroler) pokazał to już w chwili
utworzenia: `session_request.config.sources: []`, `mcp_connections: []`, plus
ostrzeżenie platformy: *„this trigger stores no MCP connectors… If the routine
needs connectors, create it from the claude.ai routines UI"*. Parametr `connectors`
w `create_trigger` jest w tej organizacji odrzucany, źródeł API nie przyjmuje wcale.
Wyniku samej sesji testowej nie da się odczytać z tej sesji (przebiegi odpalane
przez Routine nie są na liście sesji; `get_session` na `cse_…` zwraca 404) —
ale konfiguracja rozstrzyga sprawę bez tego.

**Stan triggerów z konta:** Kontroler `sources: None`, „Dane wt 05:30" `sources: None`.
Oba pushują w promptcie, oba skończą jak 21.09 — pliki + patch na czat.

**Naprawa (decyzja Marka, droga A):** utworzyć oba Routine **z panelu claude.ai**
z repozytorium `MarekDOLEW/blogoklockach` w źródłach i konektorem
`Claude_Code_Remote` (Kontroler; „Dane wt" konektora nie potrzebuje). Gotowy prompt
Kontrolera: `materialy/kontroler-prompt-2026-09-22.md`. Droga B (stała sesja przez
`create_session(source_url)` + `persistent_session_id`) rozwiązuje repo, ale
konektora nie gwarantuje i wraca do delete+create przy każdej zmianie promptu —
gorsza.

Prompt w obecnym triggerze zaktualizowany (`update_trigger`): usunięte fałszywe
zdanie o „12 minutach", dopisane: co robić przy odmowie proxy (`git format-patch`
+ SendUserFile), pomijanie harmonogramu bez konektora, ostrzeżenie o własnym
ruchu audytowym w „human". Do czasu decyzji Marka poniedziałek 28.09 pójdzie tą
samą drogą co 21.09 — z patchem, który nakładam ręcznie.

Trigger testowy skasowany. Sprawdzenie wtorkowego runnera ustawione na 22.09 05:00 UTC.

## 2026-09-21 09:40 · CODE · Korekta: Kontroler NIE zawiódł — zawiódł dostęp. Patch nałożony, dziura w filtrze botów potwierdzona

Wpis z 09:10 („Kontroler odpalił się i nie zostawił nic") miał **błędną diagnozę**.
Marek dosłał pełny raport i patch. Fakty:

- Kontroler wykonał komplet: raport 24 kB, archiwum dziennika (12 wpisów),
  kontrola linków **185 sprawdzalnych / 0 martwych**, mail „Zadania bez
  właściciela" (5 pozycji) do Marka i Piotra.
- **Push odrzuciło proxy gita**: „MarekDOLEW/blogoklockach is not in this session's
  authorized repository set" — repo nie jest w źródłach sesji, którą Routine
  odpala od zera. Klon działa, zapis nie. Identycznie z tokenem.
- **Brak konektora `Claude_Code_Remote`** w tej sesji → `list_triggers` nie było
  czym wywołać → harmonogram nie przepisany. 14.09 ten sam Routine konektor MIAŁ.
- Kontroler zrobił jedyną słuszną rzecz: wysłał cztery pliki + patch na czat.
  **Nałożone `git am -3`, bez konfliktów — `e26593d` na main.**

**Co ustalił raport i co z tego wynika (do gruntownej analizy, bo tak prosił Marek):**

1. **53% „ludzkich" kliknięć to nasz audyt.** 17 wejść 16.09 z refererem
   `https://tylkoklocki.pl/zestaw/x/`, po jednym na sklep — to był mój audyt C
   (linkowanie zewnętrzne), który testował `/idz/` z podstawionym refererem.
   Wszystkie 17 poszło do trackerów jako prawdziwe kliknięcia. **Filtr workera
   sprawdza tylko host**, więc dowolna zmyślona ścieżka na naszej domenie
   przechodzi. Poprawka (referer musi wskazywać hub z tym samym numerem albo
   realną stronę serwisu) — `src/worker.js`, commit 3f42a9c. **Korekta 21.09
   12:55:** miała czekać na zgodę Marka (CLAUDE.md), ale weszła na `main`
   razem z pushem 83835ff o 11:55 UTC — błąd sesji Code, nie decyzja. Jest na
   produkcji; Marek decyduje: zostaje albo revert (też dotyka workera, więc
   też za zgodą). Ryzyko małe: nowoczesne przeglądarki i tak wysyłają
   `Sec-Fetch-Site: same-origin`, a odrzucony klik wraca na hub z komunikatem.
2. **Realny ruch: 62 kliknięcia z Polski w tygodniu, ~9 dziennie; 29% z ChatGPT**
   — więcej niż z Google (8 kliknięć).
3. **Pierwsza zmierzona prowizja w historii: 2,03 EUR z 3 transakcji** (Ceneo,
   Lidl), żadna zatwierdzona. EPC 0,033 EUR/klik → do 20 000 zł w grudniu
   brakuje mnożnika ~515×.
4. **Scout bez commita 19 i 20.09** (weekend), przy komplecie w pozostałe dni.
5. **Google: 8 kliknięć / 295 wyświetleń w 7 dni** — tyle, ile wcześniej w 30.
   Sitemapa hubów 775 → 1 164. **Strona główna bez crawla od 25.08.**

**Ryzyko na jutro:** „Dane wt 05:30" to też Routine ze świeżą sesją i z pushem
w promptcie — bez repo w źródłach skończy jak Kontroler. Test dostępu puszczony
osobnym jednorazowym triggerem.

## 2026-09-21 09:10 · CODE · Kontroler odpalił się i nie zostawił nic — kontrola linków przeniesiona do Łowcy

Pierwszy poniedziałek z krokiem kontroli linków w promptcie Kontrolera.
**Routine wystartował 07:05:41, skończył 07:17:59, status SUCCEEDED — i nie ma
po nim ani commita, ani `materialy/kontroler-2026-09-21.md`, ani gałęzi
`kontroler` na origin.** Dwanaście minut pracy, zero artefaktów.

Diagnoza: `kontrola-linkow.mjs --ile 200` trwa kilkanaście minut i zjadł budżet
sesji, zanim doszła do commita. „SUCCEEDED" w `last_run` znaczy tylko, że tura
się nie wywróciła — nie, że raport powstał. **Sprawdzajmy artefakty, nie status.**

Trzy zmiany:

1. **Kontrola linków przeszła do Łowcy** (mapa `ZADANIA_TYGODNIOWE`, poniedziałek).
   Łowca chodzi o 08:30, Kontroler o 09:00 — raport czeka na niego gotowy.
   Ta sama ścieżka co Smyk w piątki i Lidl codziennie: prompty zostają cienkie,
   harmonogram siedzi w danych.
2. **Skrypt zapisuje raport ZAWSZE** do `materialy/kontrola-linkow-RRRR-MM-DD.md`,
   także przy zerze martwych linków. Gdyby tak było w piątek, od razu byłoby
   widać, że krok się nie wykonał. Domyślna próba zeszła z 200 na 150.
3. **Prompt Kontrolera przepisany**: krok kontroli linków to teraz „przeczytaj
   plik", a na górze doszedł BUDŻET CZASU — najpierw commit z harmonogramem
   i archiwum, potem sekcje analityczne; przy końcu czasu zapisz, co jest,
   i napisz, czego zabrakło. Raport niepełny bije brak raportu.

Przebieg z dzisiaj puszczony ręcznie: **135 sprawdzalnych linków, 0 martwych**,
15 zablokowanych przez sklepy (Empik, Media Expert, LEGO.com), 5 nierozstrzygniętych
(Allegro). Ceneo 66/66, Planeta 47/47, Smyk 16/16, Lidl 1/1 — wszystkie żywe.

## 2026-09-21 05:25 · MAREK → CODE · Slajdery w piątce tekstów Piotra; pozostałe PDF-y bez grafik

Marek: „dodajmy do artykułów 1–2 slajdery w treści z kilkoma zdjęciami
przykładowymi". Zrobione — **7 slajderów, 25 zdjęć**, wszystkie z naszych danych
(znacznik `galeria-setow`, więc miniatury idą z R2 i klikają się w huby):

| Artykuł | Slajdery |
|---|---|
| Historia licencji cz. 1 | 1 — dzisiejsze Star Wars (75192, 75419, 75367, 75397) przy akapicie o 1999 jako początku ery |
| Historia licencji cz. 2 | 2 — Harry Potter i Gringott przy sekcji o HP; Minecraft i Śródziemie przy roku 2012 |
| Historia licencji cz. 3 | 2 — Pokémon i Mario przy sekcji o szerokich licencjach; Technic, akwarium i HP 18+ przy partnerstwach lifestyle |
| Najdroższe zestawy | 1 — pięć pierwszych miejsc rankingu, zaraz pod tabelą |
| Jak rosły zestawy | 1 — World Map, Wieża Eiffla, Titanic, Star Destroyer pod tabelą wymiarów |

Zero pustych slajdów — sprawdzone po buildzie. Do galerii nie weszły **75457
Executor** i **72306 PlayStation**, bo nie mamy dla nich zdjęć; zamiast pustych
kafelków są zestawy, które je mają. Po dopisaniu zdjęć warto je dołożyć.
`r2-obrazy.mjs`: 11 152 obiekty w R2, brakujących 0.

**Sprawdzone przy okazji: pozostałe cztery PDF-y Piotra nie mają żadnych grafik**
(`/Subtype/Image` = 0 w każdym z nich). Wykres był wyłącznie w tekście o wzroście
zestawów i już jest w serwisie. Czyli konwersja DOCX → nasz markdown niczego nie
zgubiła w trzech częściach historii licencji ani w rankingu.

→ Ustalenie robocze: przy materiałach Piotra bierzemy DOCX na tekst, a PDF jako
kontrolę, czy nie ma w środku grafiki. Dziś PDF-y potwierdziły komplet.

## 2026-09-21 05:20 · MAREK → CODE · Brakujący wykres z PDF-a Piotra wstawiony jako SVG

Marek dosłał PDF z materiałem o wzroście zestawów — był w nim wykres, którego nie
miał DOCX. Wczoraj zbudowałem w jego miejsce tabelę z liczb rozsianych po prozie
i zostawiłem kreskę przy latach 90., bo Piotr nie podał tam udziału ≥500 elementów.

Wykres ma wszystkie sześć punktów obu serii, więc:

- **kreska zniknęła** — lata 90. to **7,5%** zestawów ≥500 elementów,
- liczby są teraz dokładne zamiast „około": 3 / 5,2 / 7,5 / 13,4 / 16,8 / **28,9%**
  dla ≥500 oraz 0 / 0 / 1,1 / 3,9 / 5,8 / **13%** dla ≥1000,
- zgadzają się co do jednego z prozą Piotra („prawie 29 procent", „blisko sześć"),
  więc tabela i tekst mówią to samo.

Wykres odtworzony jako **inline SVG** (`.wykres` w `global.css`): bez biblioteki,
bez JS, skaluje się z szerokością kolumny. Pod nim została tabela z tymi samymi
liczbami — kto nie widzi grafiki, dostaje dane, a nie komunikat „wykres".
Opis dla czytnika ekranu siedzi w `<title>`/`<desc>` SVG i wymienia wszystkie
wartości.

## 2026-09-21 05:00 · CODE · Cała piątka Piotra na stronie + Smyk: 8 zestawów straciło cenę

**Opublikowane cztery pozostałe teksty** (ranking wyszedł 20.09):

| Artykuł | Kategoria | Znaków |
|---|---|---|
| `/artykuly/historia-licencji-lego-poczatki/` | Historyczne | 13 100 |
| `/artykuly/historia-licencji-lego-star-wars-minecraft/` | Historyczne | 15 400 |
| `/artykuly/historia-licencji-lego-gry-sport-lifestyle/` | Historyczne | 14 200 |
| `/artykuly/jak-rosly-zestawy-lego/` | Historyczne | 13 500 |

Trzy części historii licencji linkują się wzajemnie (część 3 domyka serię odsyłaczem
do obu poprzednich), tekst o wielkości zestawów linkuje do rankingu najdroższych,
a ranking do artykułu o wycofaniach. **Zero martwych linków wewnętrznych** — sprawdzone
skryptem po buildzie na wszystkich artykułach.

Do tekstu o wzroście zestawów przeniosłem z DOCX-a dwie tabele (średnia/mediana/próg
10% per dekada oraz elementy kontra wymiary modelu) i **dorobiłem trzecią**: udział
zestawów ≥500 i ≥1000 elementów per dekada, złożony z liczb rozsianych po prozie
Piotra. Powód: tekst miał podpis „Duże zestawy stają się coraz częstsze" pod wykresem,
którego nie dostaliśmy — zamiast usuwać podpis, dołożyliśmy dane, które go bronią.
Dla lat 90. udział ≥500 elementów zostaje kreską, bo Piotr go nie podał.

**Smyk po pełnym odświeżeniu 704 kart** (uwaga Marka: „sokoła nie ma w Smyku"):
ofert 668 → 663, **8 zestawów straciło cenę** (10440, 21267, 30722, 42233, 72041,
**75192**, 75412, 76307), 3 doszły. Sokół Millennium zniknął ze Smyka — czyli
z tabeli tego zestawu zeszła najniższa cena, która nie była do zrealizowania.

Od 25.09 Smyk odświeża się w piątki (`feedy-lego.py`, mapa `ZADANIA_TYGODNIOWE`),
niezależnie od wtorkowego Routine — dostępność najwyżej czterodniowa zamiast
siedmiodniowej.

## 2026-09-20 17:45 · CODE · Ranking najdroższych zestawów (Piotr) + ustalenie: „styczeń 2027" nie istnieje jako termin wycofań

**Artykuł Piotra opublikowany:** `/artykuly/najdrozsze-zestawy-lego/` (Rankingi),
karta w `redakcja/karty/najdrozsze-zestawy-lego.md`. Pierwszy z pięciu plików,
które Marek wrzucił 20.09.

Weryfikacja: **19 z 19 cen katalogowych Piotra zgadza się co do grosza** z naszymi
danymi — najczystszy materiał, jaki od niego dostaliśmy. Poziomy rynkowe też się
bronią; nasze dzisiejsze minima mieszczą się w jego widełkach albo tuż pod nimi.

Dwie rzeczy dołożyliśmy od siebie:

1. **76417 Bank Gringotta kosztuje dziś ok. 3250 zł przy cenniku 1849,99 zł** —
   +76%, **jedyny zestaw w zestawieniu droższy od katalogu**. Piotr zostawił go
   bez poziomu rynkowego. To najmocniejszy argument tekstu: ranking liczony
   cennikiem stawia go na 19. miejscu z 19, a liczony realną ceną — w pierwszej trójce.
2. **75419 Gwiazda Śmierci** — Piotr podał poziom „3620–3970 zł", a my mamy
   jedną ofertę: LEGO.com w cenie katalogowej. Nie przepisaliśmy jego widełek;
   w tekście stoi to, co widzimy, plus zdanie „nie znaczy to, że rabatów nie ma —
   znaczy, że my ich dziś nie widzimy".

Wszystkie kwoty bieżące idą przez znaczniki `<div class="ceny-setu">` (9 tabel,
33 wiersze cen) — tekst nie zestarzeje się w listopadzie.

**Ustalenie przy okazji polecenia Marka o „wycofaniach ze stycznia 2027":
taki termin nie istnieje.** Sprawdzone u źródła (Brick Fanatics, pełna lista
wycofań): Grupa LEGO wycofuje zestawy w dwóch terminach rocznie — **31 lipca
i 31 grudnia**. Rozkład nagłówków na liście: 31.07.2026 (29 grup), 31.12.2026 (28),
31.07.2027 (25), 31.12.2027 (25), dalej 2028–2029. Żadnego stycznia.

Nasz `wycofania.json` ma **zero pozycji z 2027** (wartości pola `kiedy`:
„grudzień 2026" 209, „wycofany" 93, „2026" 11, „odwołane" 1) — czyli za grudniem
2026 jesteśmy ślepi, choć branża publikuje już 50 grup terminów na 2027.
To jest zadanie dla Scouta, nie dla tekstu.

→ Do decyzji Marka: „co znika 31 grudnia 2026" mamy opisane w tekście z 17.09;
sensowny nowy temat to „co LEGO wycofuje w 2027", ale wymaga najpierw importu
terminów 2027 do `wycofania.json`.

## 2026-09-19 07:30 · CODE · Pierwszy pełny przebieg: Lidl OK, llms.txt OK, historia cen miała datę o dobę za późno

**Lidl — działa.** 60 zestawów z dzisiejszą `daty.lidl` w feedzie, 55 ofert
w `sety.json`, 60 linków, żadna gałąź `redirects` nie zmalała. Krok nadpisywania
adresów też poszedł: **1 371 adresów zaktualizowanych**, Allegro +318 nowych
linków, Media Expert +11.

**`/llms.txt` na produkcji — 200, `text/plain`, 225 790 bajtów, 1 179 pozycji,
„Stan pliku: 2026-09-19".** Cena w pliku zgadza się z danymi (76444: 550,00 zł
z Allegro w obu miejscach), więc plik generuje się z danych, a nie zamarł.

**Błąd, który wyszedł dopiero na pełnym przebiegu: historia cen dołożyła 4 linie
zamiast tysiąca.** Powód: Łowca uruchamia `feedy-lego.py` (a ten nas) NA POCZĄTKU
swojej pracy, a ceny zapisuje na KOŃCU. Widzieliśmy więc stan sprzed jego zapisu —
zmiany łapaliśmy dobę później, a stempel „dziś" przypisywał je do złego dnia.
Złapały się tylko oferty Lidla, bo te importuje `ceneo-feed.mjs` chwilę wcześniej.

Naprawione u źródła zamiast przestawiania kolejności: **wpis nosi teraz datę
ODCZYTU ceny** (`daty[sklep]` z feedu albo `data` oferty), a nie dzień
uruchomienia skryptu. Dniem uruchomienia stemplujemy wyłącznie zniknięcia — tam
data naszego spostrzeżenia jest jedyną, jaką mamy. Dzięki temu nie ma znaczenia,
w którym momencie przebiegu skrypt się odpali.

Po poprawce 19.09 dołożył **976 linii: 949 zmian ceny i 27 zniknięć ofert**,
+54 kB. Rozkład: allegro 808, mediaexpert 163, lidl 4, planetaklockow 1 —
zgodnie z oczekiwaniem ruszają się tylko sklepy odświeżane codziennie; Empik,
Smyk, Ceneo i LEGO.com dołożą swoje po wtorkowym przebiegu.

→ Tempo roczne przy tym rytmie to ok. 350 tys. linii i ~20 MB. Do przeglądu
w grudniu, gdy będziemy robić wykresy — wtedy warto zamykać rok osobnym plikiem.

## 2026-09-18 11:30 · MAREK → CODE · noindex zostaje, zestawy bez cen zostają, nowe narzędzie do ofert

Trzy ustalenia z rozmowy o liczbie podstron.

**1. 8 201 hubów zostaje w noindex**, zdejmujemy je pojedynczo w miarę
dopisywania opisów (decyzja Marka). **Uwaga praktyczna, żeby ta praca nie poszła
w próżnię:** sam opis to JEDEN z czterech warunków `ocenaHubu` (opis >300 znaków,
≥3 sklepy, ≥1 tekst redakcyjny, świeża premiera), a do indeksu trzeba trzech.
Opis dopisany do huba bez ofert i bez tekstu **nie zdejmie noindex**.
Zdejmuje go natomiast od ręki **karta w formacie Piotra** (≥2 akapity + ≥3 FAQ) —
to wyjątek `karta` z 15.09. Czyli: jeśli celem jest wyprowadzanie hubów z noindex,
najtańszą dźwignią są karty, nie krótkie opisy.

**2. Zestawy bez żadnej ceny zostają na stronie** (Marek: budują historię i są
ważne dla kogoś, kto przegląda całą serię). To już działa: hub powstaje dla
każdego zestawu z katalogu, a strona serii listuje **pełny katalog** z katalog.json
ze statusem „brak w sprzedaży", nie tylko to, co ma dziś ofertę. Liczby dzisiaj:
**3 516 hubów nie ma żadnej żywej oferty**, z czego 3 509 siedzi w noindex —
i tak ma zostać.

**3. Nowe narzędzie: `node scripts/sprawdz-oferte.mjs <nr>`** — odpowiedź na
pytanie „jak sprawdzić, czy oferta jest aktualna". Dane mówią tylko, KIEDY
widzieliśmy cenę w feedzie; skrypt dokłada kod HTTP karty produktu i informację,
czy oferta przechodzi sito (14 dni / 28% RRP / podejrzany rynek). Na 43024 widać
od razu: Ceneo i Planeta Klocków — karta OK, Allegro/Empik/ME/LEGO.com — sklep
blokuje ruch serwerowy, więc „nie sprawdzone", nigdy „OK".

Logika wyciągania adresu docelowego z linku trackingowego wyjechała do
`scripts/linki-cel.mjs` — wspólna dla kontroli linków i tego skryptu, żeby żaden
z nich nie wszedł przypadkiem na tracker (to byłby sztucznie nabity klik).

## 2026-09-18 10:30 · MAREK → CODE · /llms.txt w wersji długiej — 1 163 zestawy z ceną

Marek zapytał, czy mamy `llms.txt` (nie mieliśmy), a po propozycji krótkiej
wersji postawił argument biznesowy i miał rację: „ludzie szukają w Google
zestawu, to wchodzą na wynik, a nie na stronę główną czy artykuły" — więc długa.

Zrobione: `src/pages/llms.txt.js`, generowane przy każdym buildzie, 220 kB.
Nie jest to kopia sitemapy. Sitemapa mówi, JAKIE adresy istnieją; llms.txt mówi,
CO na nich jest:

`- [LEGO 76444 Magiczne sklepy na Ulicy Pokątnej](…/zestaw/76444/): od 613,39 zł
w Media Expert, katalogowa 869,99 zł, −29%, oferty w 6 sklepach, 2750 elementów`

**Zakres: 1 163 huby indeksowalne, nie wszystkie 9 364.** Ta sama reguła co
w sitemapie (`hubIndeksowalny`) — hub bez opisu, z jedną ofertą i bez tekstu nie
ma czego zaoferować ani czytelnikowi, ani modelowi. Lista rośnie sama.

Do pliku weszła sekcja „Jak czytać nasze dane": cena katalogowa nie jest ceną
rynkową, Ceneo pomijamy w cenach „od", sito ofert (14 dni, 28% RRP, podejrzany
rynek), trzy rozłączne stany wycofania — i **żeby nie cytować adresów `/idz/`**,
bo to przekierowania afiliacyjne; adresem do podania jest hub zestawu.

**Czego NIE twierdzimy:** że to przyniesie ruch. Żaden dostawca modeli nie
potwierdził, że czyta llms.txt — to konwencja, nie standard. Utrzymanie kosztuje
zero, więc plik jest na wypadek, gdyby zaczęło się liczyć.

## 2026-09-18 09:45 · MAREK → CODE · Historia cen per sklep, nie tylko najniższa

Marek po zobaczeniu pierwszych liczb: „przestaw na wersję per sklep". Zrobione
tego samego dnia, zanim plik urósł — przy danych historycznych to jedyny moment,
w którym taka zmiana jest darmowa.

| | rano (tylko najniższa) | teraz (per sklep) |
|---|---|---|
| linii w pliku | 5 991 | **12 606** |
| zestawów | 5 991 | 5 977 |
| sklepów | — (tylko ten najtańszy) | **7** |
| rozmiar | 322 kB | 685 kB |

Rozkład startowy: allegro 5 080, empik 3 947, planetaklockow 1 150, lego 949,
mediaexpert 752, smyk 668, lidl 60. Ceneo pomijamy (porównywarka).

Co to otwiera, czego pierwsza wersja nie umiała: „ile to kosztowało w Empiku
w listopadzie", „który sklep jest najczęściej najtańszy w tej serii", „jak
zmieniała się rozpiętość ofert przed świętami".

**Zniknięcie oferty zapisujemy teraz jako `c: null`** — to fakt, nie dziura.
Do tego bezpiecznik, bez którego ta funkcja byłaby pułapką: sklep, który z dnia
na dzień stracił ponad połowę ofert, jest traktowany jako awaria pobrania i jego
zniknięć nie zapisujemy. Sprawdzone na symulacji padniętego feedu Empiku —
skrypt pominął **3 947 fałszywych zniknięć** i nazwał sklep w wyniku.

Dzisiejszy plik przeliczony od zera w nowym formacie (stare 5 991 linii to
podzbiór nowych 12 606, więc nic nie przepadło).

## 2026-09-18 09:20 · CODE · Martwy link PK to była nasza stara kopia — linki nie odświeżały się nigdy

Marek zauważył, że zestaw 43024 jest na Planecie Klocków pod dłuższym adresem,
i zapytał, czy nie ma go w feedzie. **Jest.** Feed z dzisiaj niesie poprawny
`…-editions-kask-ayrton-senna` (200), a my trzymaliśmy `…-editions` (404).

Przyczyna jest szersza niż jeden zestaw: **mapy linków tylko rosły**. Łowca
dopisywał adresy dla zestawów, których nie było w `redirects.json`, ale nigdy nie
poprawiał tych, które już tam były — więc każda zmiana slugu w sklepie zostawała
u nas jako martwy link na zawsze.

Skala: porównanie 1 307 zestawów PK obecnych w dzisiejszym feedzie dało **3 adresy
inne niż nasze**. Mało, ale to jedyny rodzaj błędu, który wysyła czytelnika prosto
na 404 — i sam z siebie nigdy się nie naprawi.

Naprawione w `feedy-lego.py`: po sparsowaniu feedów skrypt **nadpisuje adresy**
w `redirects.json` dla Media Expertu, Planety Klocków i Allegro. „Append-only"
dotyczy kasowania wpisów, nie aktualizacji adresu tego samego zestawu — liczba
wpisów i tak jest sprawdzana, a skrypt przerywa, gdyby zmalała.

Po przebiegu wszystkie trzy adresy PK odpowiadają 200. Liczba linków PK bez zmian
(1 877). Znów bez ruszania promptu Łowcy — ta sama ścieżka co przy Lidlu.

→ Wniosek do zapamiętania: kontrola linków nie jest kosmetyką. Pierwszy przebieg
znalazł błąd, którego żaden runner nie mógł wykryć, bo każdy patrzył tylko na ceny.

## 2026-09-18 08:10 · CODE · Lidl codziennie, kontrola linków, start historii cen

Trzy rzeczy z porannej rozmowy z Markiem.

**1. Lidl codziennie.** Marek: „skoro mamy feed produktowy, nie możemy przerzucić
na codziennie?". Można — ale prompt Łowcy siedzi w stałej sesji, więc dokładanie
tam kroku to delete+create triggera. Zrobione bez ruszania promptu:
`scripts/feedy-lego.py` (Łowca odpala go codziennie) sam woła `ceneo-feed.mjs`
dla feedów TD z polem `"odswiezanie": "codziennie"` w `feedy.json`.
**Wzorzec: częstotliwość sklepu jest decyzją w danych, nie w promptach.**
Ceneo zostaje tygodniowe (porównywarka, duży feed).

Przy okazji: TD potrafi odpowiedzieć **200 z komunikatem** „Unlimited file will be
created…" zamiast 202 — skrypt uznawał to za pusty feed i pomijał sklep. Przy
dziennym przebiegu oznaczałoby to ciche zniknięcie ofert na dobę. Poprawione.

**2. Kontrola linków sklepowych** (Marek: „tak dodaj testowanie losowe linków").
`scripts/kontrola-linkow.mjs` — krok Kontrolera w poniedziałek, mail tylko gdy są
martwe (klucz `linki`, kontakt@). Prompt Kontrolera zaktualizowany przez
`update_trigger` (to Routine bez stałej sesji, więc bez delete+create); kopia
w `materialy/routine-prompty.md` odświeży się przy poniedziałkowym raporcie.

**Zasada, która zdecydowała o konstrukcji: nie odpytujemy linków trackingowych.**
Wejście na `pdt.tradedoubler.com` czy `webep1.com` to zarejestrowany klik w sieci
afiliacyjnej — sztucznie nabity, bez człowieka po drugiej stronie. Skrypt wyciąga
z linku adres docelowy sklepu i sprawdza wyłącznie jego.

Zmierzone na próbie 150: **Allegro, Empik, Media Expert i LEGO.com odrzucają każde
zapytanie serwerowe** (403 albo timeout). Dlatego skrypt bierze z nich po 5 linków
kontrolnych, a resztę próby kieruje na sklepy sprawdzalne — z 37/150 realnych
sprawdzeń zrobiło się 134/150. Pierwszy przebieg złapał martwy link:
**Planeta Klocków 43024 → 404**.

**3. Historia cen — zaczęliśmy zbierać.** Marek pytał, czy da się za pół roku
zrobić wykres zmian ceny. Odpowiedź brzmiała **nie**: `ceny_baza.json` trzyma
tylko minimum wszech czasów, `oferty_feed.json` to migawka z dziś, a historia repo
sięga 9 dni. Od dziś zbieramy: `scripts/historia-cen.mjs` (codziennie, z tego
samego miejsca co Lidl) dopisuje najniższą dzienną cenę zestawu do
`src/data/historia-cen/RRRR-MM.jsonl`, **tylko gdy cena się ruszyła**.
Pierwszy zapis: 5 966 zestawów, 328 kB. Katalog jest w `src/data`, bo **runnery
commitują wyłącznie `src/data`** — plik gdzie indziej przepadałby razem
z kontenerem. Build tego nie widzi (`.jsonl` nikt nie importuje).

→ Wykresy na hubach mają sens najwcześniej po 2–3 miesiącach zbierania (grudzień).
Wtedy osobny skrypt wytnie z JSONL kompaktową serię do `src/data`.

## 2026-09-18 08:00 · RADAR · Do zrobienia

**fanklockow.pl · 17.09** — uruchomili drugi kalendarz obok kalendarza promocji: osobno klockowe wydarzenia 2026 (otwarcia salonów, eventy, prywatne zakupy, ścianki BaM).
**Mamy?** — nie: mamy jeden kalendarz, w którym wydarzenia stacjonarne albo mieszają się z promocjami cenowymi, albo w ogóle ich nie ma.
**Zrobić:** — decyzja, czy rozdzielamy nasz kalendarz na promocje (cena) i wydarzenia (termin, miejsce), czy zostajemy przy jednym.
**Kto:** — Marek (decyzja)

**Korekta, którą warto zapamiętać:** 17.09 wpisaliśmy do kalendarza gratis
jako 40722, za fanklockow. 18.09 faniklockow podał ten sam gratis jako 40772
i nasz własny katalog to potwierdził — 40772 „Seria okolicznościowa: Świecący
duszek" (Creator, 2025). Poprawione. Wniosek na przyszłość: numer zestawu
z jednego serwisu sprawdzamy w `katalog.json` po nazwie, zanim trafi do treści.

## 2026-09-18 06:10 · MAREK → CODE · Lidl: tylko linki z feedu, bez zapasowego deeplinku

Odpowiedź na pytanie z porannego raportu: „zostaw lidl jak jest — tylko linki
z feed". Czyli zestaw spoza feedu 259772 **nie dostaje linku do Lidla w ogóle**
i tak ma zostać. Bez zapasowego deeplinku w `src/worker.js` i bez pola `szukaj`
w `sklepy.json` (to ta sama ścieżka — worker schodzi na `sklepy[sklep].szukaj`,
gdy nie ma wpisu w `redirects`). Powód: wyszukiwarka lidl.pl bez parametrów TD
to ruch bez prowizji.

Zapisane w RUNBOOK-u w sekcji Lidla. Temat zamknięty — nie wracamy bez nowej
decyzji Marka.

## 2026-09-18 05:30 · CODE · Lidl ruszył — 60 zestawów, 55 ofert, link sprawdzony

Feed 259772 („LEGO klocki", program „Lidl Sklep Online" 298327) odpowiedział po
raz pierwszy o **05:16 UTC**, przy szóstym sprawdzeniu od wczorajszego popołudnia.
Wcześniej przez dobę zwracał `PF_392 „Requester is not connected to Feed"`, mimo
że program był ACCEPTED już 17.09 o 12:10.

**Wniosek na przyszłość: w Tradedoublerze akcept programu i podpięcie feedu do
witryny to dwie różne rzeczy.** Nie ma tu czego naprawiać po naszej stronie —
trzeba tylko sprawdzać feed co kilka godzin (albo poprosić TD, co Marek zrobił
mailem 17.09 ok. 12:00 UTC; feed ruszył ~17 godzin później).

Import (`node scripts/ceneo-feed.mjs --sklep lidl`):

| | |
|---|---|
| produktów w feedzie | 102 |
| rozpoznanych numerów zestawów | 60 |
| linków w `redirects.lidl` | 0 → **60** |
| ofert w `sety.json` | **55** |
| sety w `oferty_feed.json` | 8 260 → 8 260 (bez zmian, tylko ceny) |

- `feedy.json` → `lidl.aktywny: true`, więc **krok 6 wtorkowego Routine bierze
  Lidla automatycznie** — bez zmiany promptu.
- Sprawdzone na żywym zestawie: 76444 Magiczne sklepy na Ulicy Pokątnej, Lidl 649 zł
  obok Allegro 629,99 i Media Expert 613,39. Link `/idz/lidl/76444` →
  `pdt.tradedoubler.com/click?a(3494691)p(298327)…`, atrybuty
  `target="_blank" rel="sponsored nofollow noopener"`.
- Rejestr afiliacji: status `wyslane` → **`aktywny`**, format linków zweryfikowany.
- Build 9 505 stron OK; liczby wpisów w danych nie zmalały (sprawdzone per sklep
  w `redirects.json` i per plik).

**Jedna rzecz do decyzji Marka:** zestaw spoza feedu Lidla nie dostaje linku do
Lidla w ogóle. Dla innych sklepów worker ma zapasowy deeplink na wyszukiwarkę,
dla Lidla go nie zakładam — link do `lidl.pl` bez parametrów TD wypuszczałby ruch
bez prowizji, a zmiana w `src/worker.js` i tak wymaga pytania (CLAUDE.md).
Jeśli TD potwierdzi, że deeplink na wyszukiwarkę Lidla liczy prowizję, dorobię go
tak jak dla Empiku i Ceneo.

## 2026-09-18 01:30 · CODE · Słowniczek LEGO — 69 haseł, indeks A–Z, pięć haseł poprawionych względem wzoru

Zadanie Marka z 17.09: „Ciekawym artykułem też może być słownik — ale lepiej
zrobiony", wzór: `fanklockow.pl/slowniczek-lego/`. Tekst:
`/artykuly/slowniczek-lego/` (Poradniki), karta researchu w
`redakcja/karty/slowniczek-lego.md`.

**Czym bijemy wzór** (zrzut konkurencji z 18.09, data modyfikacji strony: 27.06.2023):

| Hasło u konkurencji | Stan faktyczny | Źródło |
|---|---|---|
| VIP jako program lojalnościowy | **LEGO Insiders** od 21.08.2023 | newsroom LEGO |
| LDD „ściągniesz go stąd" + link | LDD wyłączony **31.01.2022**, następca BrickLink Studio | komunikat prasowy Grupy LEGO |
| B&P i PaB jako dwie usługi | scalone w 2022; LEGO.pl ma dziś „Części zamienne" i hub „Klocki i elementy" | lego.com/pl-pl/service/replacementparts, sprawdzone 18.09 |
| RLFM: „jednym z takich podmiotów jest BrickLink" | BrickLink należy do Grupy LEGO od XI 2019 | komunikat o przejęciu |
| płytka bazowa 32×32 = „25,5 × 25,5 **mm**" | 32 × 8 mm = **25,6 cm** | rachunek z rozstawu studów |

- **69 haseł w ośmiu działach tematycznych** + indeks A–Z z działającymi kotwicami
  (`<dl class="slownik">`, każde `<dt>` ma id). Zamiast „patrz wyżej/niżej" — odnośniki.
- **Dział o pieniądzach, którego wzór nie ma w ogóle**: cena katalogowa, zł/element,
  najniższa cena z 30 dni (Omnibus, od 1.01.2023), promocja pozorna, próg zakupu,
  drabina cenowa, podszywka (nasz próg 28% RRP), marketplace, scalper.
- **Linkowanie wewnętrzne**: /wycofania/, /ekskluzywne/, /serie/, /prezentowniki/,
  /zestaw/10350/, artykuł o Insiders i o wycofaniach grudniowych. 18 adresów, wszystkie
  sprawdzone w `dist/`.
- **Nie powtarzamy tezy „wycofanie = wzrost wartości"** — hasło EOL cytuje nasze dane
  (206 zestawów, mediana −18%, powyżej cennika co czwarty). Hasło o modularach mówi
  wprost, że opinii rynku nie potwierdzamy własnymi notowaniami (mamy je od VIII 2026).
- Nie podajemy „3,18 mm" jako średnicy pręta — nie znaleźliśmy tego w dokumencie
  producenta; piszemy „ok. 3,2 mm" i tłumaczymy, że to dwa moduły LU (1,6 mm).
- CSS: blok `.slownik` / `.slownik-indeks` w `global.css` (podświetlenie `dt:target`).

Build 9 505 stron OK; artykuł wchodzi na listing /artykuly/, stronę główną, RSS
i sitemapę. Okładka: 10350.

## 2026-09-17 17:40 · CODE · Poradnik wrześniowy przepisany: procent nie mierzy okazji (uwaga Marka)

Marek po pierwszej wersji: „Nie zawsze procent jest największą okazją. Są zestawy
ekskluzywne, które rzadko tanieją bardziej niż o 15% i te 15% jest najlepszą okazją,
jaka była. Im droższy zestaw, tym mniejszy procent jest potrzebny, aby korzyść była
większa." Policzone w ośmiu pasmach cenowych — **teza potwierdzona w danych**:

| Pasmo | n | Mediana rabatu | Mediana oszczędności |
|---|---|---|---|
| do 100 zł | 270 | 24,1% | 13 zł |
| 101–400 | 623 | 28,0% | 45 zł |
| 401–800 | 178 | 26,2% | 128 zł |
| 801–1200 | 47 | 18,8% | 217 zł |
| 1201–1600 | 14 | 3,7% | 52 zł |
| 1601–2000 | 10 | 7,1% | 138 zł |
| 2001–2500 | 3 | 0% | 0 zł |
| 2501+ | 5 | 0% | 0 zł |

Do tego drugi przekrój: **ekskluzywy mediana 5,5% (n=79) wobec 27,3% reszty katalogu**.
Skrajny przykład: 10333 Barad-dûr −4,8% = 109 zł i jest to minimum notowań.

- Nowa oś tekstu: „−42% na zestawie za 43 zł to 18 zł; −20% na Barce Jabby to 423 zł
  i najniższa cena, odkąd notujemy". Trzy miary przy każdej pozycji: procent,
  oszczędność w złotówkach, pozycja na tle pasma.
- **Dobór 12 pozycji przebudowany** — z każdego pasma. Weszły trzy zestawy, których
  żadna lista sortowana procentem nie pokaże: 42172 McLaren P1 (−28%, 551 zł, ekskluzyw,
  Media Expert), 75397 Barka Jabby (−20%, 423 zł, jedyna przecena w paśmie 2001–2500),
  75367 Venator (−22%, 620 zł, największa oszczędność w tekście). Wypadły 60407, 42208,
  43018 — z pasm, gdzie i tak było najgęściej.
- Limit Allegro dalej 3/12. FAQ przepisane (pierwsze pytanie: dlaczego mały procent bywa
  lepszą okazją). Karta researchu §3–6 przepisana z pełnymi tabelami.

## 2026-09-17 16:20 · CODE · Poradnik „Najlepsze oferty na LEGO — wrzesień 2026" (nowy format: karty ofert z żywą ceną)

Polecenie Marka: odpowiednik listy ofert z fanklockow.pl, ale „mniej ofert i kilka
słów treści do każdej — sprzedażowe, a nie listing linków", ze zdjęciami do kliknięcia
w stylu `/nowosci/`.

- **Tekst:** `/artykuly/najlepsze-oferty-lego-wrzesien-2026/`, kategoria Poradniki,
  12 pozycji w progach od 40 zł do 1 100 zł. Karta researchu:
  `redakcja/karty/najlepsze-oferty-wrzesien-2026.md`.
- **Nowy komponent `KartaOferty.astro`:** klikalne zdjęcie → hub, cena i rabat liczone
  przy buildzie z tych samych danych co tabela cen, plakietki („najniżej, odkąd notujemy",
  ekskluzyw, status wycofania), CTA do sklepu i link do pełnej tabeli. Fakt i prognoza
  mają OSOBNE etykiety (reguła z RUNBOOK) — „potwierdzone przez LEGO" vs „prognoza rynku".
- **Przewaga nad wzorem:** u konkurencji ceny są wpisane ręcznie w dniu publikacji i
  starzeją się w tydzień; nasze odświeżają się z każdym buildem. Do tego tekst zaczyna się
  od mediany rynku (27% na 1 150 zestawach), więc czytelnik wie, ile w ogóle znaczy „−25%".
- **Uczciwość:** 60339 ma największy rabat (−50%) i najgorszy przelicznik zł/element —
  napisane wprost. Odrzucone świadomie: głębokie rabaty na słabych zestawach (75384),
  końcówki magazynowe (10423, 76156 — zostają na `/deale/`), pozycje powyżej cennika.
  Nie powtarzamy tezy konkurencji o wzroście cen przed świętami — nie mamy notowań
  sprzed roku i mówimy to w tekście.
- **Limit Allegro** ≤30% linków utrzymany: 3 karty z 12; przy pozostałych karta pokazuje
  najtańszy sklep spoza marketplace'u, a pełna tabela jest na hubie (wyjaśnione w FAQ).
- **Infrastruktura:** `teksty.js` i listing `/artykuly/` widzą teraz artykuły pisane jako
  `.astro` (glob + `meta`), nie tylko markdown — to było potrzebne, żeby poradnik z kartami
  trafił do sitemapy, RSS i bloków „Przeczytaj też". Sprawdzone po buildzie: jest na
  listingu, w `sitemap-artykuly.xml`, w RSS i w powiązanych na sześciu innych stronach.

**Dla drugiej strony:** nic. Kolejny w kolejce (polecenie Marka): lepszy słowniczek LEGO
niż `fanklockow.pl/slowniczek-lego/`.

## 2026-09-17 10:40 · CODE · Lidl (Tradedoubler, feed 259772) — przygotowane, czeka na akcept

- Marek zgłosił się do programu Lidl online w TD; feed „LEGO klocki" fid 259772
  (tylko klocki LEGO). Dziś TD odpowiada `PF_392 not connected` — normalne przed akceptem.
- `ceneo-feed.mjs` przerobiony na importer **wszystkich feedów TD z `feedy.json`**
  (Ceneo + Lidl; `--sklep`, `--sucho`); sklep z magazynem dostaje też ofertę
  w `sety.json`. Test: Lidl — czysty komunikat bez zapisu; Ceneo `--sucho` — 1 441
  zestawów, 67 nowych, 690 zmian (zapisze wtorkowy przebieg). Prompt wtorkowego
  Routine bez zmian — nowy feed to wpis w danych.
- Dane: `feedy.json` lidl (`aktywny: false`), `sklepy.json` lidl, rejestr afiliacji
  lidl `wyslane`. RUNBOOK „Lidl przez Tradedoubler" opisuje kroki po akcepcie.

## 2026-09-17 09:10 · CODE · Karty Piotra P07c: 11387 Świąteczny dom, 40900 Straszne nawiedzone drzewo

- Import `import-karty.py` (2 karty, 0 zablokowanych): 11387 — 4 akapity, 6 FAQ, metryka;
  40900 — 2 akapity, 6 FAQ. Rejestr kart: 1 097 → 1 099.
- **Nazwa 11387:** Piotr „Świąteczny domek", repo „Świąteczny dom" (tłumaczenie robocze
  Scouta z 16.09; Brickset „Holiday Cottage"). Została nazwa z repo (reguła z 15.09),
  ale ŻADNA nie pochodzi z lego.com PL — `katalog.json` miał jeszcze „Zimowa wioska 2026
  (nazwa nieoficjalna)", wyrównany do sety.json z polem `nazwa_zrodlo`. Do potwierdzenia
  na lego.com/pl-pl po 1.10 (start sprzedaży) — Dane wt wczyta oficjalną nazwę z listingu.
- **40900 to GWP** (gratis do zakupów, bez RRP) — nie było go w katalogu, więc karta nie
  miałaby huba; dopisany do Creator (`zrodlo` Brickset + karta). Dwa nowe placeholdery
  Piotra („sprawdź warunki zdobycia LEGO <nr>", „sprawdź aktualne promocje LEGO") importer
  kieruje na `/deale/`.
- Pułapka przy okazji: `lego-ceny.mjs` i `katalog-z-rebrickable.mjs` zapisywały
  `katalog.json` ze sztywnym wcięciem 1, a plik ma 2 — najbliższy wtorkowy przebieg
  przepisałby 80 tys. linii. Oba biorą teraz wcięcie z pliku (`wykryjWciecie`).

## 2026-09-17 06:30 · CYKL RANKINGÓW · Zadanie cykliczne skasowane, teksty pisze Piotr

**Przebieg dnia:** Marek zamówił rano cykl dziewięciu rankingów katalogowych
co 3 dni. Ustawiłem Routine, napisałem tekst 1/9 i wysłałem PDF. Po południu
Marek dogadał z Piotrem, że **te artykuły napisze Piotr** — Routine
`trig_017bUnuamQeRs6QuUgoXadkf` skasowany tego samego dnia.

**Co zostaje w planie:** dziewięć tematów z terminami 17.09–10.10, status
`planowane`, `autor: Piotr`. Tematy są dobre i zostały zamówione przez Marka —
zmienił się tylko wykonawca.

**Materiał, który powstał, poszedł do Piotra w PDF i został skasowany.**
Gałąź `cykl-rankingi` (artykuł `najwieksze-zestawy-lego-historia.md` + karta
`najwieksze-zestawy-lego.md`) usunięta 17.09 na polecenie Marka — nic z tego
nigdy nie było na `main`. Gdyby ktoś chciał odtworzyć research: progresja
rekordu 1977–2026, zł za element dla półki 5 000+ i mediana rabatu osobno dla
gigantów dostępnych (−5%) i wycofanych (+20%) liczą się z `katalog.json`
i `oferty_feed.json` w kilkanaście minut.

**Pułapka warta zapamiętania niezależnie od losu cyklu:** źródłem bieżących
ofert jest `oferty_feed.json` (klucz `sety`), a NIE `sety.json`. Analiza
policzona z tego drugiego dała „mediana 0 sklepów dla gigantów" i fałszywą tezę
o ich słabej dystrybucji; po poprawce mediana to 2, czyli tyle, co dla całej
bazy.

## 2026-09-17 08:00 · RADAR · Do zrobienia

**zklockow.pl · sekcja „odkrywaj"** — mają siatkę stron kolekcyjnych („największe zestawy LEGO", „największe Technic", kolekcje per seria); nie są datowane, więc to trwała przewaga, nie świeża publikacja.
**Mamy?** — nie: `/serie/<seria>/` z wyszukiwarką owszem, stron „największe / najdroższe zestawy serii" nie ma.
**Zrobić:** — decyzja, czy budujemy siatkę „Największe zestawy LEGO <seria>" generowaną z katalogu (liczba elementów przy 9211 z 9359 pozycji, 98%).
**Kto:** — Marek (decyzja)

## 2026-09-17 05:30 · SCOUT · Sygnały wycofań dla runnera Wycofań

- **Lista „Ostatnia szansa" urosła z ponad 100 do ponad 300 pozycji** —
  <https://www.stonewars.de/news/letzte-chance-eol-ende-2026/>, artykuł
  zaktualizowany: „LEGO markiert weitere 200 EOL-Sets, jetzt über 300
  Auslaufmodelle zum Jahresende 2026". Termin: koniec 2026.

  To ten sam adres, z którego 15.09 wziąłem 93 numery (16 z nich dopisałem
  wtedy do `wycofania.json`, jeszcze pod starą regułą — patrz wpis z 16.09).
  Artykuł od tamtej pory urósł o około 200 pozycji, więc **poprzedni odczyt
  jest już niepełny**.

  Numerów nie wyciągałem — `wycofania.json` nie jest moim plikiem, a przy tej
  skali sensowniej zrobić to raz, po stronie właściciela, razem z weryfikacją.

**Dla drugiej strony:** runner Wycofań — to jest największy sygnał EOL w tym
sezonie i wypada na trzy miesiące przed świętami. Warto go wziąć w poniedziałek
w całości, a nie w kawałkach.

→ Wycofania 2026-09-21: dopisane — z artykułu wyciągnięto 246 numerów, 88
brakujących dodano jako potwierdzone/grudzień 2026 (dane z katalog.json,
źródło StoneWars); do tego 2 pozycje widoczne tylko w PL dziale (71051, 71052).
Dział „Ostatnie sztuki" na lego.com/pl-pl potwierdza falę: 369 produktów
(tydzień temu 30). Breloczki i minipuzzle z działu pominięte jako gadżety.

## 2026-09-16 16:20 · CODE · Linki do sklepów i Ceneo w nowej karcie (decyzja Marka)

Wszystkie anchory `/idz/…` mają `target="_blank"` w szablonach (TabelaCen ×3,
TabelaSetow, KartaPrezentu ×2, karuzela strony głównej, `/deale/`, `remark-ceny.mjs`
×2), `relLinku()` dokłada `noopener`, a delegacja w `Base.astro` obejmuje też
`/idz/` z markdownu. Po buildzie: 0 linków do sklepów bez nowej karty, 0 `noreferrer`
(referer zostaje — filtr botów na `/idz/` działa jak dotąd). RUNBOOK, sekcja
„Filtr botów" — akapit o nowej karcie.

## 2026-09-16 15:40 · CODE · Audyt końcowy: raport + naprawy 1–3 i 6 (decyzje Marka)

Raport: `materialy/audyt-koncowy-2026-09-16.md`, plan: `materialy/plan-dzialan-2026-09-16.md`
(PDF-y na czacie). Werdykt: mechanika czysta (0 martwych linków na 412 tys.
hrefów, sitemapy 0 braków, wszystkie `/idz/` 302 na cel afiliacyjny, 11 150 z
11 281 obrazów 200), błędy w danych i procedurach. Decyzje Marka i naprawy:

- **Cztery ekskluzywy (10335, 10356, 40516, 40797)** — Marek: „ostatnie sztuki,
  ale dostępne w sklepie LEGO". `wycofania.json`: `kiedy: "grudzień 2026"`,
  status potwierdzone, źródło poprawione. Do tego **strona sama broni się przed
  takim wpisem**: `status.js` → `widzianyNaListingu()` — „wycofany" o zestawie
  widzianym na listingu lego.pl w ostatnich 14 dniach jest traktowany jak termin.
  `audyt-wycofan.mjs` A = 0.
- **18 ofert z 12–16.08** (sklepy bez feedu + 4 LEGO.com sprzed listingu) usunięte
  z `sety.json` (`scripts/oferty-przeterminowane.mjs`, decyzja Marka „usunąć");
  szablony `szukaj` bez `{nr}` (proshop, sferis, dadada → strona główna sklepu)
  wycięte ze `sklepy.json`; **sito `filtrujOferty()`** w `oferty.js`: oferta
  starsza niż 14 dni nie wchodzi do tabel, meta, deali ani oceny indeksowalności.
- **Trzy deale poniżej 50% RRP (60339, 10423, 76156)** — Marek: prawdziwe.
  Nowy plik `src/data/deale_potwierdzone.json` + reguła „podejrzany rynek" w tym
  samym sicie: oferta < 50% POTWIERDZONEGO RRP bez wpisu człowieka jest ukryta;
  `kontrola-rrp.mjs` mówi, co jest potwierdzone, a co ukryte.
- **Import Empiku jako skrypt** (`scripts/empik-import.mjs`): reguły z pamięci
  sesji Łowcy (commit `f9b0cef`) spisane i wykonywane deterministycznie; test na
  syntetycznym zrzutie z 3 950 pozycji: 0 zmian wobec danych + poprawnie odrzucone
  gadżet, sanity i konflikt numeru. Plik od Marka idzie do Code (NARZEDZIA pkt 3).
- Artykuł z datą 17.09 zostaje (decyzja Marka „artykuł ok"). Przypominajka
  o Empiku i skille — Marek wgrał. Paczka `klocki-ceny-empik.skill` zmieniona
  (trasa przez skrypt) — do wgrania przy okazji, treść informacyjna.
- Dokumenty do stanu faktycznego: RUNBOOK („Mapa plików danych" 16.09, „Ceny
  Empik", „Stabilność JSON" rozwiązane, „karta ≠ podstrona" rozwiązane, nowa
  sekcja o sicie ofert, zabezpieczenie w regule 3 statusów), NARZEDZIA (kto
  startuje świeżą sesją, budżet Firecrawla przy tygodniowym listingu, pkt 3),
  `zadania-cykliczne.md` (tabele „Co zapisuje" i „Zmiana czasu" — pełna lista),
  `scripts/README.md`, `_meta` feedu.

**Domknięte po odpowiedziach Marka (16.09, 15:30–15:45):** B5 i B3 — w „Ustaleniach
trwałych" (zamykanie zadań: „zamknij X — powód" w czacie → linia `→ zamknięte`;
sekcja „Zadania bez właściciela" mailem do Piotra i Marka). Kontroler zaktualizowany
(`update_trigger`), Łowca odtworzony pod `trig_013VvvPKDiN4W8Bmj4qwd9LK` (import
Empiku przez skrypt + poranny mail z ofertami do sprawdzenia —
`podejrzany-rynek-mail.mjs`, klucz `podejrzane`, na kontakt@; dziś na liście są
4 oferty Ceneo: 31382, 71830, 60404, 31146). Zrzut Empiku od teraz do Code.
**Nadal otwarte:** B4 — kanał planu tekstów do Piotra (propozycja: mail z PDF
w piątek po zatwierdzeniu).

## 2026-09-16 14:05 · CODE · Wtorkowy Routine to slot na dane, nie na LEGO — nazwa i generator poprawione

- **Marek przemianował Routine `trig_012JWbmYwHb59sYazo6K9X33`** na „Dane wt 05:30 —
  katalog LEGO.pl + ceny Ceneo i Smyk" i wkleił prompt z krokiem 6a. Odczyt z konta
  potwierdza: prompt na koncie jest znak w znak tym, który przekazałem (diff pusty),
  więc wklejenie nic nie pogięło. Jeden slot tygodniowo obsługuje teraz trzy źródła
  cen: listing lego.pl (kroki 1–5), Ceneo (6) i Smyk (6a).
- **Generator harmonogramu rozpoznawał nasze Routine po prefiksie nazwy** (`/^LEGO\b/`)
  i zmiana nazwy natychmiast go złamała: wtorkowy runner wylądował w tabeli
  „Pozostałe Routines na tym samym koncie", czyli dokument zaczął twierdzić, że
  runner serwisu nie jest runnerem serwisu. Nazwa jest opisem dla człowieka i będzie
  się zmieniać, więc przynależność czytamy teraz z dwóch trwałych śladów: środowiska
  runnerów (`env_01YL3diD2yzP3UGYsU7Txvx7`) i promptu wskazującego repo albo domenę
  (Kontroler chodzi na środowisku projektu i pola `environment_id` nie ma). Prefiks
  nazwy został jako zapasowa przesłanka. Po poprawce: 10 naszych, 3 obce — jak ma być.
- **Ślady starej nazwy w dokumentach** („LEGO.pl katalog", „wtorek 05:00") poprawione
  w `scripts/README.md` (trzy wiersze, w tym `smyk-odswiez.mjs` dostał wreszcie
  właściciela w kolumnie „kto uruchamia") i w `RUNBOOK.md`. Wpisy datowane w logu
  `materialy/zadania-cykliczne.md` zostawiam bez zmian — opisują stan z 15.09.

## 2026-09-16 13:10 · CODE · Smyk odświeżony (668 cen z dziś), stała kolejność ofert, sprostowanie daty zrzutu

- **Smyk ma świeże ceny po raz pierwszy od sierpnia.** Adtraction nie daje feedu
  (`"feed": false` w API), ale smyk.com odpowiada zwykłemu curl z kontenera i niesie
  cenę oraz dostępność w schema.org. `scripts/smyk-odswiez.mjs` czyta 704 adresy
  z `redirects.smyk`, po 6 naraz, ok. 4 min, 0 kredytów. Wynik: 668 cen z 16.09
  (95 realnie zmienionych), 36 zestawów wyprzedanych straciło ofertę, 0 błędów po
  trybie `--stare`. Do wtorkowego Routine dochodzi krok 6a (prompt do wklejenia
  przekazany Markowi).
- **Stała kolejność ofert w `sety.json`** (alfabetycznie po sklepie, `porzadek-ofert.mjs`):
  dzienny diff Łowcy schodzi z 76 tys. linii do realnych zmian. Strona sortuje po
  cenie sama, więc czytelnik nic nie zauważy.
- **SPROSTOWANIE daty zrzutu Smyka.** Pisałem „zrzut z 29 sierpnia" jako fakt —
  to była wartość z RUNBOOK-a, której nie sprawdziłem. Twarde dane: rejestr afiliacji
  ma przy Smyku datę 28.08, a `redirects.smyk` weszło do repo 09.09 (commit 27178b9).
  Dokładnego dnia odczytu tamtych cen nie da się dziś ustalić. Data 29.08, którą
  wpisałem rano do 704 wpisów, żyła w pliku niecałe dwie godziny — od 13:00 wszystkie
  ceny Smyka mają datę 16.09, zweryfikowaną odczytem ze stron.
  Reguła na przyszłość: data w danych pochodzi z odczytu, nie z dokumentu.

## 2026-09-16 11:30 · CODE · Kontrola przebiegu Łowcy: dwa błędy naprawione

Sprawdzenie raportu Łowcy (commit `fa38f5f`) wobec repo. Potwierdzone i zgodne:
redirects append-only (allegro 5016→5039, planetaklockow 1866→1877, **zero
skasowanych wpisów w każdej gałęzi**), feed 8255→8257, daty per sklep dla ME/PK/
Allegro/Empik/LEGO, `obrazy.json` 10 701, usunięte oferty tylko z trzech kluczy
Łowcy (allegro 61, ME 3, PK 1), 60505 i 42698 mają w danych to, co w raporcie.

**Błąd 1 — poprawka filtra nie trafiła do repo.** Wzorzec kodów minifigurek, który
wyłapał „Lego min­ifgurka sw1160" (415 zł, udawało −44,6% na 75315), Łowca dopisał
do `pipeline_run19.py` w `/tmp` — a kontener czyści `/tmp`. Jutro wyciek wróciłby.
Przeniesione do `scripts/feedy-lego.py` jako `nie_zestaw()`: kody `sw####/njo###/
hp###/cty####` i słowa (minifigurka, instrukcja, pudełko, naklejka, luzem, na wagę),
z usuwaniem miękkiego dywizu z tytułów Allegro. 12 testów, 0 fałszywych trafień na
prawdziwych tytułach zestawów. **Reguła: poprawka reguły biznesowej należy do repo,
nie do skryptu w /tmp.**

**Błąd 2 — 1 373 wierszy pokazywało nieprawdziwą datę.** Łowca podbija wspólne pole
`data` wpisu na dziś, a wiersze Ceneo (1 426 cen z 14.09) i Smyk (704 z 29.08) nie
miały własnej daty i brały tę wspólną — czytelnik widział „z 16.09". Uzupełnione:
`daty.ceneo` z `_meta.ceneo_pobrano`, `daty.smyk` = 29.08 (RUNBOOK). `smyk-ceny.mjs`
zapisuje teraz własną datę i nie rusza wspólnej. Po poprawce **0 wpisów bez daty
per sklep**.

Drobne: raport mówi o 40 nowych minimach, w `ceny_baza.json` jest 42 wpisy z datą
16.09 — różnica nie wyjaśniona, ale bez wpływu na dane. Diff `sety.json` to 76 tys.
linii, bo oferty są sortowane po cenie i przy wcięciu 2 zmiana kolejności przepisuje
plik; do rozważenia stabilna kolejność (po nazwie sklepu) dla czytelności historii.

## 2026-09-16 06:30 · RADAR · Wycofania grudnia 2026 — okno przesunięte i tekst opublikowany

**Polecenie Marka:** przesunąć okno wycofań na 17–30.09, robić jak najszybciej.

**Zrobione:**
- `redakcja/plan-redakcyjny.json` — okno `2026-10-01..2026-10-20` → `2026-09-17..2026-09-30`,
  status `opublikowane`, url `/artykuly/wycofania-lego-grudzien-2026/`.
- `redakcja/karty/wycofania-grudnia-2026.md` — karta researchu (populacja 206 zestawów
  z potwierdzonym EOL, ceną katalogową i żywą ofertą).
- `src/pages/artykuly/wycofania-lego-grudzien-2026.md` — tekst, dział Kalendarze.
- Commit `1aa0a33`, push na `main`.

**Czego się dowiedzieliśmy z własnych danych (to jest oś tekstu):**
- 54 z 206 zestawów (26%) kosztuje dziś **więcej** niż cennik — „ostatni moment"
  bywa najgorszym momentem;
- mediana rabatu na całej populacji: 18%;
- **liczba sklepów, które zestaw jeszcze mają, przewiduje cenę lepiej niż seria
  i lepiej niż poziom cenowy**: 4 sklepy → mediana 11% pod cennikiem, 1 sklep →
  wielokrotność cennika. Tę liczbę nasze huby już pokazują, tylko nikt jej tak nie czytał.

**Pułapka, na którą się nadziałem (drugi raz w tym tygodniu):** polski cudzysłów
zamykający wpisany jako ASCII `"` w polu YAML łamie build — `bad indentation of
a mapping entry`. Zamiana `„..."` → `„...”` w frontmatterze i w treści.

**Zostaje otwarte:** 75192 Sokół Millennium i reszta wycofywanych bez tekstu (Piotr);
pięć statusów do sprawdzenia — 21333, 21351, 21353, 21356, 76437 (runner Wycofań).

## 2026-09-16 08:00 · RADAR · Do zrobienia

**faniklockow · 15.09** — zaktualizowali listę Icons 2026 o ceny 11379 (559,99) i 11387 (469,99).
**Mamy?** — tak: `/zestaw/11379/` i `/zestaw/11387/`, ceny wpisane w tym przebiegu.
**Zrobić:** — nic (zamknięte).
**Kto:** — Code (zrobione)

**Kontrola własna · 16.09** — `kontrola-rrp.mjs` po imporcie z lego.pl pokazał 8 cen katalogowych niezgodnych ze źródłem.
**Mamy?** — tak: poprawione w `katalog.json` (10338, 10361, 75328, 40797, 31147, 76326, 76327, 43269).
**Zrobić:** — nic (zamknięte).
**Kto:** — Code (zrobione)

**Radar · 15.09** — LEGO potwierdziło wycofanie ponad stu zestawów; 75192 Sokół Millennium UCS bez żadnego opisu u nas.
**Mamy?** — częściowo: hub `/zestaw/75192/` jest, brakuje karty, person i opisu.
**Zrobić:** — nowy tekst „LEGO 75192 Sokół Millennium schodzi z produkcji — kupować teraz czy odpuścić".
**Kto:** — Piotr (tekst)

**Radar · 15.09** — potwierdzona lista wycofań grudniowych jest dostępna od 14.09.
**Mamy?** — tak: `/artykuly/wycofania-lego-grudzien-2026/`, okno przesunięte na 17–30.09.
**Zrobić:** — nic (zamknięte 16.09, decyzja Marka + tekst w tym samym przebiegu).
**Kto:** — Marek (decyzja) → Code (tekst, zrobione)

**Radar · 15.09** — pięć zestawów ma u nas status „przewidywane", a serwisy podają je jako potwierdzone przez LEGO.
**Mamy?** — częściowo: są na liście, zły status (21333, 21351, 21353, 21356, 76437).
**Zrobić:** — zmiana w danych `src/data/wycofania.json` po sprawdzeniu działu „Ostatnie Sztuki".
**Kto:** — Code (runner Wycofań)

## 2026-09-16 05:30 · SCOUT · Przekazanie wycofań do runnera Wycofań

**Zrobione:** nic w `wycofania.json` — od dziś to nie mój plik (nowa reguła
w prompcie Scouta z 16.09).

**Do weryfikacji przez runnera Wycofań:** 15.09, jeszcze pod starą regułą,
dopisałem do `wycofania.json` **16 pozycji** ze StoneWars — lista zestawów
oznaczonych przez LEGO w firmowym sklepie jako „Ostatnia szansa" (wycofanie
do końca 2026). Źródło:
<https://www.stonewars.de/news/letzte-chance-eol-ende-2026/>, data 13.09.2026.

Numery: 75685, 80119, 76304, 80118, 43262, 10459, 43217, 76924, 40708,
10450, 77242, 77243, 77259, 43033, 43263, 10461.

Wszystkie dostały `kiedy: "grudzień 2026"`, `status: "potwierdzone"` i pole
`zrodlo` z zastrzeżeniem, że **nie zweryfikowałem tego na lego.com** — serwis
blokuje nasz ruch. Jeśli reguły statusów runnera Wycofań wymagają bezpośredniego
potwierdzenia, te wpisy trzeba przejrzeć i ewentualnie przestawić na
„przewidywane".

W artykule było 93 numery; 67 już było w pliku, 10 pominąłem, bo nie ma ich
w `katalog.json` (brak polskiej nazwy i ceny). Te 10 zostaje do domknięcia.

**Dla drugiej strony:** runner Wycofań — przejrzyj te 16 wpisów i domknij
brakujące 10.

## 2026-09-15 20:15 · CODE · AWARIA linków do sklepów (naprawiona): warstwa assets przed workerem

- Objaw (zgłoszenie Marka ok. 18:30): każde kliknięcie w sklep kończyło się na
  `/idz/<sklep>/<nr>` jako 404; padły też `/img/` w nowej karcie, `/obserwuj/`
  z maili i 410 dla `/p/`. Z serwera curl dostawał 302 — testy były ślepe, bo nie
  wysyłały `Sec-Fetch-Mode: navigate`. Przez ~godzinę odpowiadałem, że linki działają.
- Przyczyna: Workers Static Assets obsługuje żądania nawigacyjne najpierw warstwą
  plików; dla ścieżki bez pliku oddaje stronę 404 i nie uruchamia workera.
- Naprawa `9ca3d5a`: `assets.run_worker_first` = `/idz/*`, `/img/*`, `/obserwuj`,
  `/obserwuj/*`, `/p/*` w `wrangler.jsonc` (push bez pytania — awaria). Sprawdzone
  na produkcji z nagłówkami przeglądarki: 302 do sklepów, 200 obraz, 410 stare adresy.
- Wcześniejsza poprawka `fb082a1` (Sec-Fetch-Site jako dowód kliknięcia + komunikat
  na hubie przy odrzuceniu) zostaje — to inna warstwa (filtr botów w workerze).
- `diagnoza.mjs` ma nowy test `link_sklepu_z_przegladarki` (nagłówki nawigacji).
  RUNBOOK: sekcja „Worker za warstwą assets". Nie wiadomo, czemu do rana działało
  bez tej opcji — konfiguracja w repo nie zmieniała się; najpewniej zmiana po
  stronie Cloudflare.

## 2026-09-15 18:40 · CODE · Karty Piotra P07b (10371, 21373), karta jako wyjątek indeksowalności, plan 30 tekstów

- Import dwóch kart Piotra w nowym szablonie (nazwa w tytule, FAQ jako nagłówki H2,
  polski nagłówek FAQ) — `import-karty.py` poprawiony; RRP obu do rejestru; 21373
  ekskluzyw. Rozbieżność nazwy 10371: Piotr „Urocze roślinki", repo „Przytulne
  rośliny" — została kanoniczna z repo; Marek 15.09 wieczorem: „Przytulne" (rozstrzygnięte).
- **Karta Piotra = wyjątek indeksowalności** (decyzja Marka): hub z kartą (≥2 akapity,
  ≥3 FAQ) idzie do sitemapy niezależnie od sklepów i tekstów. Sitemapa zestawów
  775 → **1 162**. Kontroler zobaczy to w poniedziałek jako skok liczby hubów.
- Decyzje z listy siedmiu punktów wdrożone (etykieta „brak w lego.pl", kategorie
  7+2 z walidacją w buildzie, karta researchu tylko dla tekstów Code,
  `/kolekcjoner/` noindex); plan 30 tekstów na 21–27.09 w `redakcja/plan-tygodnia-2026-09-21.md`.
- Kontrola porannych runnerów 16.09 zaplanowana na 10:05 PL.

## 2026-09-15 17:20 · CODE · Duplikaty katalogu usunięte, etykieta „brak w LEGO.com", Łowca i Wycofania odtworzone

- **Katalog 9 363 → 9 359** (decyzja Marka): 43026 zostaje w Nike x LEGO, 72423 w Shrek,
  40824 w Looney Tunes, 77059 jeden wpis. Jedyne świadome zmniejszenie liczby wpisów
  poza `redirects.empik`. Od teraz `sprawdzUnikalnoscKatalogu()` (json-kolejnosc.mjs)
  blokuje zapis katalogu z dublem — w `lego-ceny.mjs` i `katalog-z-rebrickable.mjs`.
- **Etykieta EOL** (decyzja Marka): „EOL – koniec produkcji w LEGO" tylko gdy lista
  wycofań ma wpis „wycofany" (`eolPotwierdzony()` w status.js); sam status `eol`
  z katalogu (listing lego.pl, import Rebrickable) daje „brak w LEGO.com" — na
  listingach, hubie, w tabeli cen i w „podobnych z serii". Strona City: 982 etykiet
  „brak w LEGO.com", 0 „wycofany (EOL)" — bo lista wycofań nie potwierdza żadnego.
- **Łowca** `trig_015CVad7UA3mJpXYWxuEwfNo` i **Wycofania** `trig_01NLRxmXX6Y6bMwCV8sevTUs`
  odtworzone z poprawkami z audytu (szczegóły: zadania-cykliczne.md, historia).

## 2026-09-15 16:10 · CODE · Dział /przecieki/, limit „Obserwuj", auto-EOL, prompty Routine

- **`/przecieki/` na produkcji** (decyzja Marka: osobno od faktów, od razu w sitemapie):
  15 wpisów na start (3 z `sety.json` ze statusem przeciek + 12 z tekstu Zapowiedzi
  2027), każdy ze źródłem, oceną pewności (wysoka/średnia/niska) i miejscem na
  rozstrzygnięcie; tablica trafności na górze strony; menu, stopka, link z /nowosci/
  i z plakietki na hubie. Dane: `src/data/przecieki.json` (append-only, właściciel
  Scout). Reguły w RUNBOOK „Przecieki — dział osobno od faktów".
- **Scout** odtworzony (delete+create, ta sama sesja) z krokiem PRZECIEKI: dopisuje
  wpisy z pewnością wg drabiny, rozstrzyga po premierze, ustawia `status_nowosci`.
- **„Obserwuj zestaw"**: limit 10 zapisów/dobę per IP i per e-mail + odrzucanie obcego
  Origin (worker, decyzja Marka „zmień obserwuj na 10 zapytań").
- **Auto-EOL**: 101 zestawów „dostepny" bez śladu na lego.pl i z premierą starszą niż
  3 miesiące → EOL (lista 122 przejrzana przez Marka, reguła w `lego-ceny.mjs`);
  17 zostaje do sprawdzenia (bez daty premiery).
- **Prompty Routine z panelu**: Alerty i Zdjęcia → R2 wklejone poprawnie; LEGO.pl
  i Empik za pierwszym razem z PDF-a — sklejone słowa, rozbite komendy — ponowione
  z bloków kodu na czacie (weryfikacja odczytem z konta w tym wpisie niżej).

## 2026-09-15 14:50 · CODE · Audyt, przebieg 2 — 11 napraw na main, reszta do decyzji Marka

Raport: `materialy/audyt-mechanizmu-2026-09-15b.md` (PDF na czacie). Trzy równoległe
przeglądy: przepływ danych runnerów, SEO/UX, redakcja–sprzedaż–konkurencja.

**Naprawione (497043e → ef836e7 + ten commit):** cena w meta/JSON-LD huba bez Ceneo
(737 hubów obiecywało w Google cenę niższą niż tabela — najpewniejsza przyczyna 0% CTR);
`SearchAction` → `/szukaj/`; eksport skilli (nie uruchamiał się od 08:19, skill mówił
odwrotnie niż decyzja o opcjonalnym poziomie rynkowym — paczki wysłane Markowi);
alerty liczą RRP jak hub i pomijają ceny starsze niż 2 dni; wspólny zapis JSON
z kolejnością kluczy (`scripts/json-kolejnosc.mjs`) w `lego-ceny` i `ceneo-feed`;
`daty.ceneo` zamiast nadpisywania wspólnej daty; auto-EOL po 14 dniach poza listingiem
lego.pl; `RESEND_API_KEY`/`GH_PUSH_TOKEN` w diagnozie; `sharp` zadeklarowany;
`routines.json` w .gitignore; prompt Kontrolera przepisany na koncie (repo najpierw,
commit obu generowanych plików, huby i inspekcja URL co tydzień, „Zadania bez właściciela").

**Do Marka (sekcja 10 raportu):** zgoda na worker (limit `/obserwuj`, komunikat przy
odrzuconym refererze `/idz/`, 301 dla przekierowań), delete+create Łowcy i Wycofań,
usunięcie 4 duplikatów katalogu, 4 prompty do wklejenia w panelu (plik na czacie —
API nie edytuje Routine z panelu), przecieki, kategorie, karty, kadencja, `/kolekcjoner/`,
zrzut Empiku (3 968 cen bez deeplinków — jedyny sklep ze zmierzoną transakcją).

**Ustalenie (do „Ustaleń trwałych" po akceptacji):** decyzja o runnerze = zmiana
promptu tego samego dnia + linijka w ustaleniach; DZIENNIK nie jest kanałem do runnerów.

## 2026-09-15 10:50 · CODE · Opisy producenta (166 PDF) + „Obserwuj zestaw" gotowe na gałęzi

- **Opisy z kart lego.pl**: 166 zestawów w sprzedaży bez opisu i bez karty
  (`materialy/opisy-lego/lego-pl/<nr>.md`, PDF-y `<nr>.pdf` w paczce wysłanej
  Markowi na czacie). 24 kandydatów nie ma adresu karty w katalogu (21341, 75119,
  30685, 60198, 12010…) — to polybagi i zestawy spoza listingu „all-sets".
  Firecrawl: plan darmowy ma limit 10 zapytań/min — pierwsze podejście straciło
  136 z 166 na 429; skrypt ma teraz odstęp 6,5 s i ponowienie po minucie.
- **„Obserwuj zestaw" (alerty cenowe) — na produkcji od 11:20** (Marek dodał sekret
  `RESEND_API_KEY` w workerze i dał „tak"; push `4c3a636`). Test na żywo: zły
  e-mail → `zly-email`, honeypot → udany „wyslano" bez zapisu, zły token → 400,
  zapis `kontakt@tylkoklocki.pl` → obiekt w R2 + mail potwierdzający z Resend
  (kliknięcie linku z tej skrzynki kończy test end-to-end); `alerty-cen.mjs --sucho`
  widzi zapis. Zostaje Routine nr 4 do założenia w panelu. Formularz na hubie,
  trasy `/obserwuj` w workerze (zapis w R2, double opt-in przez Resend),
  `scripts/alerty-cen.mjs` (próg 20% poniżej RRP, kasowanie niepotwierdzonych po
  7 dniach), polityka prywatności z sekcją RODO. Trasy przetestowane na atrapie R2
  (zapis, zły e-mail, honeypot, potwierdzenie, zły token, rezygnacja, brak sekretu).
  Prompt Routine „LEGO 09:30 — Alerty cen" w `materialy/routine-prompty.md` (plik generowany z konta).

## 2026-09-15 10:20 · CODE · LEGO.pl co tydzień: ceny, dostępność, ekskluzywy + strona /ekskluzywne/

**Zrobione (polecenie Marka „Działaj z tym"):**
- **Pełny listing lego.pl przez Firecrawl** (57 stron, 1 342 pozycje: 936 zestawów,
  406 akcesoriów; ~75 kredytów). Nowy `scripts/lego-ceny.mjs` wczytał go do danych:
  949 cen LEGO.com w `oferty_feed` (klucz `lego` + data per sklep `daty.lego`),
  850 ofert LEGO w `sety.json`, 93 zestawy z katalogu wróciły na `dostepny`,
  112 dostało flagę `ekskluzyw`, każdy widziany na lego.pl ma `lego_pl_widziano`.
  Do tego 147 nowych cen katalogowych (`wczytaj-rrp.mjs`, 0 konfliktów) i 219
  nowych linków do kart produktu (`lego-redirects.mjs`: 741 → 960).
- **Strona `/ekskluzywne/`** — tabela dystrybucji wyłącznej LEGO: 126 zestawów
  w sprzedaży (Icons 32, BrickHeadz 23, Ideas 12…) + 4 po EOL, filtr serii, FAQ.
  Hub zestawu ekskluzywnego dostał ramkę „nie czekaj na promocję w innych sklepach".
  Link w stopce, na /kolekcjoner/ i w sitemapie „inne".
- **Kolejność kluczy w JSON zachowana** — `JSON.stringify` sortuje klucze numeryczne,
  co przy pierwszym przebiegu przepisało cały `sety.json` (37 tys. linii diffu).
  `lego-ceny.mjs` ma własny parser kolejności; nowe wpisy idą na koniec.
- **Etykiety ekskluzywu: listing gubi je przy „Nowość"/„Zamówienie oczekujące"**
  (pole `status` niesie jedną etykietę). 18 zestawów z ręczną flagą w `sety.json`
  (31221 Klimt, 21369 X-Files, 76476…) nie ma jej na listingu — flagi ręcznej NIE
  zdejmujemy automatycznie, skrypt tylko podnosi do `true` i raportuje rozbieżności.
  Od następnego zaciągu katalog niesie pełną listę `labels` (poprawka w
  `firecrawl-legopl.mjs`), więc rozbieżności powinny zmaleć.
- **Routine „LEGO.pl katalog" (wtorek 05:00 PL)** — prompt nr 3 w
  `materialy/routine-prompty.md`, do założenia przez Marka w panelu
  (z repo jako źródłem). Prompt ma bramkę: poniżej 1 000 produktów = listing
  urwany, nie wczytywać (Marek: „ostatnio listing urywał się po 20 zestawach").
- **Opisy producenta** dla zestawów w sprzedaży bez opisu i bez karty:
  `scripts/opisy-legopl.mjs` pobiera sekcje „Funkcje"/„Szczegóły produktu" do
  `materialy/opisy-lego/lego-pl/<nr>.md` i robi PDF `<nr>.pdf`. Kandydatów 190
  (po odświeżeniu statusów), 166 z adresem karty — w toku, wynik w kolejnym wpisie.

**Do zrobienia (Marek):** założyć Routine nr 3 w panelu; sprawdzić ręcznie 18
rozbieżności ekskluzywów po następnym zaciągu (wtorek); wgrać ponownie
`skille/*.skill` (opcjonalny „normalny poziom rynkowy").

## 2026-09-15 09:30 · CODE · Po raporcie GSC: huby na zawsze, katalog +1523, opisy meta z ceną

**Zrobione (decyzje Marka po odczycie panelu GSC):**
- **Hub dla każdego zestawu z katalogu, nigdy 404** — `policzHuby()` bierze cały
  katalog: 4 450 → **9 363 huby**, build 25 s, 0 martwych linków (335 789
  sprawdzonych). Cienkie huby mają noindex; sitemapa zestawów 742 → 752.
- **Katalog +1 523 zestawy z Rebrickable** (`katalog-z-rebrickable.mjs`): wycenione
  w feedach numery bez huba (41087, 1382, 911617…). 20 nowych serii dawnych
  linii (Nexo Knights, DOTS, Chima, Bionicle, Castle, Pirates…), 265 w Archiwum,
  96 gadżetów. 197 numerów Rebrickable nie zna — bez huba, celowo.
- **Opis meta hubów zaczyna się od ceny**: „Od 429,00 zł w 2 sklepach (17% poniżej
  ceny katalogowej 519,99 zł)…" — huby na pozycjach 7–12 miały 0% CTR.
- Stopka: linki do wszystkich działów — strony działowe były „wykryte,
  niezindeksowane".
- Robots: Marek zdjął blokady AI; produkcja = `public/robots.txt`. RUNBOOK.

**Stan:** na main. Czeka: prompt dla Coworka „Poproś o zindeksowanie" (w czacie),
410 dla starych adresów sklepu z zabawkami (worker — zgoda Marka), tabela
dystrybucji i cotygodniowy lego.pl, alerty.

**Dla drugiej strony:** Scout — nowe serie w katalogu mają nazwy z Rebrickable;
nie tłumacz ich hurtem, tylko gdy zestaw wraca do sprzedaży. Kontroler — od
teraz raport tygodniowy ma podawać liczbę hubów i 404 z GSC.

## 2026-09-15 09:40 · CODE · Decyzje Marka po audycie: zdjęcia, wycofania, Rakuten, robots, poprawki A

**Zrobione:**
- **Zdjęcia**: każdy plik przechodzi przez sharp przed wgraniem do R2 (≤1200 px,
  JPEG q80); `--optymalizuj` przepuszcza 3716 obiektów cięższych niż 250 KB
  (w toku; 4,6 MB PNG → 101 KB na produkcji). Worker bez zmian.
- **Wycofania — jeden autor** (decyzja: raz w tygodniu): Scout i Wycofania
  odtworzone. Scout ma zakaz edycji `wycofania.json`; sygnały zapisuje w DZIENNIK
  jako „SCOUT · Sygnały wycofań dla runnera Wycofań". Wycofania (pon 06:10) czyta
  je, weryfikuje u źródła, obsługuje wszystkie serie. Nowe ID w zadania-cykliczne.
- **Rakuten**: odmowa — w rejestrze afiliacji ze wskazówką, kiedy wracać.
- **Robots.txt**: blokady AI z panelu Cloudflare zostają (domyślne, do zdjęcia w
  razie potrzeby) — opisane w RUNBOOK, razem z brakiem przekierowania http→https
  (do włączenia w panelu: SSL/TLS → Always Use HTTPS).
- **Poprawki A bez decyzji**: favicon (SVG+ICO+apple), strona 404, meta
  `max-image-preview:large`, tytuły hubów z nazwą ≤40 znaków, data przy każdej
  cenie w tabeli, jeden akapit pod tabelą z wyjaśnieniem pozycji Ceneo.
  Sprawdzone na produkcji po deployu (`1e0893a`).
- `materialy/gsc-checklista-2026-09-15.md` — prompt dla sesji Cowork z panelem GSC.

**Stan:** czekam na wynik GSC od Marka i na zrzuty cen RK (historia cen — „teraz").

**Dla drugiej strony:** Scout — od jutra nowy prompt (05:00). Wycofania — pierwszy
przebieg 21.09 z sygnałami Scouta. Piotr — mail od Łowcy doszedł (potwierdzenie
Marka 15.09 rano).

**Uwagi:** hub 75430 (bohater deala x-kom) jest noindex — 2 sklepy + opis,
brak tekstu, bo post dealowy nie liczy się jako tekst o zestawie? Do sprawdzenia
w `teksty.js` (`poSecie`). Jeśli deale nie są liczone, warto je dołożyć: hub
zestawu z aktualnym dealem powinien być w indeksie.

## 2026-09-15 08:20 · CODE · Audyt mechanizmu od researchu po widoczność — raport

**Zrobione:** `materialy/audyt-mechanizmu-2026-09-15.md` (PDF wysłany Markowi).
Najważniejsze liczby: 8 kliknięć z Google w 30 dni, wyświetlenia spadają
(132 → 70 → 39/tydz.), huby na frazach numerowych na pozycjach 37–50; 78
użytkowników/7 dni, z czego 37 z ChatGPT. Mechanizm produkcyjny szczelny; luki:
`wycofania.json` pisane przez Scouta bez reguł (runner Wycofań nigdy nie odpalił),
Backfill wyłączony (2005 wycenionych setów bez RRP), jedna data dla wierszy
o różnej świeżości w tabeli cen, robots.txt na produkcji z blokadami AI
z panelu Cloudflare (nie z repo), brak favicony, pusta 404, obrazy w oryginale
(p90 517 KB). Nisze policzone na katalogu: hełmy 11, BrickHeadz 26, Speed
Champions 32, Botanicals 40, 18+ 192, wg wieku 12 przedziałów, adwentowe 6.

**Stan:** raport gotowy; 19 punktów z priorytetami i 6 pytań do Marka — bez
odpowiedzi nie ruszam punktów 1, 4, 5, 6, 11, 15, 16.

**Dla drugiej strony:** Piotr — §4 (karty vs teksty, dwie puste kategorie:
Kalendarze i Historyczne) i §6 (tematy). Scout — nie dotykaj `wycofania.json`
do decyzji Marka (§1.1).

**Uwagi:** pole „zindeksowane" w API sitemap pokazuje 0 dla wszystkich —
niewiarygodne od 2022; realną liczbę trzeba odczytać z panelu GSC.

## 2026-09-15 06:55 · CODE · Zdjęcia → R2: rejestrem jest kubełek, codzienny Routine o 04:00

**Zrobione:** pełny przegląd zdjęć głównych (10 664 na produkcji): 10 530 działa,
z Planety brakowały 3 (dograne), reszta to martwe źródła Rebrickable. Planeta jest
więc w R2 w całości: 4 991 głównych + 608 galerii. Problem dotyczył tylko przyszłości.
- `scripts/r2-obrazy.mjs` przepisany: **rejestrem „co wgrane" jest listowanie
  kubełka R2** (12 stron po 1000 kluczy), nie plik stanu w repo — plik rozjeżdżałby
  się przy ręcznym wgraniu albo kasowaniu, kubełek nie. Przebieg bez zaległości:
  **16 s** (było 15 min HEAD-ów). `--sprawdz` zostaje jako audyt produkcji, który
  widzi też martwe źródła.
- Nowy Routine „LEGO 04:00 — Zdjęcia → R2" (`trig_01TSSqtf4ke7wfxwbmkAp6GM`,
  `0 2 * * *`, świeża sesja): `git fetch` + skrypt + jednolinijkowy raport.
  Osobny trigger zamiast kroku w Scoucie: nowe zdjęcia przychodzą z trzech stron
  (Scout, Łowca, sesje z tekstami), jeden sprzątacz jest prostszy niż trzy kroki,
  a istniejących triggerów nie trzeba odtwarzać.
- CLAUDE.md: sesja, która dopisuje galerię, uruchamia skrypt od razu — nowy tekst
  nie czeka z pustymi miniaturami do rana.

**Stan:** przebieg testowy Routine odpalony ręcznie 06:48 — wynik niżej w „Uwagi".

**Dla drugiej strony:** Scout — nic nie zmieniasz; Routine o 04:00 dogra to, co
dopiszesz o 05:00 następnego dnia, a huby nowości i tak mają zdjęcia z Allegro/ME,
które worker pobiera sam.

**Uwagi:** decyzja Marka 15.09: „dlaczego nie może być bazy co już jest wgrane" —
słusznie; odpowiedzią jest kubełek jako baza, nie nowy plik.
Przebieg testowy Routine (sesja `session_01XtaGYLcaUj6N8LtrqzYSen`, 06:48–06:51 PL):
zakończony bez błędu (IDLE po 3 min 20 s, 65 tys. tokenów, model sonnet-5
z domyślnych ustawień Routine). Linijki podsumowania nie da się odczytać z tej
sesji przez API — widać ją w claude.ai/code. Kontrola pośrednia: listowanie R2
po przebiegu nadal „brakuje 0", czyli skrypt nie zepsuł stanu.
**SPROSTOWANIE 15.09 09:00 (Marek wkleił podsumowanie sesji):** sesja
zakończyła się czysto, ale **skrypt nie ruszył** — świeża sesja z Routine
założonego przez API startuje **bez sklonowanego repo** (`sources: []`; Kontroler
z panelu ma repo podpięte, moje dwa Routine nie). „Kontrola pośrednia" niczego
nie dowodziła. Naprawa: prompty obu świeżo-sesyjnych Routine (Zdjęcia → R2,
Przypomnienie Empik) klonują repo same (`git clone --depth 1` + `npm ci`), a tryb
codzienny skryptu zostawia ślad `_stan/r2-obrazy.json` w R2, który da się
odczytać z zewnątrz — bez tego nie ma jak potwierdzić, że skrypt się wykonał.
**Test nr 2, 08:59–09:00 PL (sesja `session_01YHUx55HaYYWBYqZdteQn4H`): przeszedł
z dowodem** — ślad w R2 `kiedy: 2026-09-15T07:00:12Z` (mój własny zapis był
06:58:35Z), `w_r2 11141, z_planety 5599, brakowalo 0, wgrano 0, bledy 0`.
Klon + npm ci + skrypt zmieściły się w 80 s, koszt 0,17 $. Routine gotowy na
jutro 04:02.

## 2026-09-14 21:15 · CODE · Galerie zdjęć wgrane do R2 — 608/608 działa

**Zrobione:** Marek dodał `CF_R2_TOKEN` (osobny token *Workers R2 Storage: Edit*).
Sprawdzone realnym wywołaniem (`r2/buckets` → `tylkoklocki-obrazy`), potem
348 brakujących zdjęć galerii pobrane z Planety Klocków z kontenera i wgrane
do R2 pod kluczami workera (`42220-1`…). Bez zmiany w workerze, bez deployu —
worker czyta R2 przed źródłem, więc huby ożyły od razu. Kontrola po wgraniu:
**608/608 galerii oddaje 200** (było 259).
- Nowy `scripts/r2-obrazy.mjs`: `--sprawdz` (raport bez tokena), domyślnie
  galerie, `--glowne` dla zdjęć głównych, `--klucze a,b`. Do uruchomienia po
  każdym dopisaniu galerii do `galerie.json` — inaczej nowe zdjęcia z Planety
  nie pokażą się nigdy.
- `diagnoza.mjs` sprawdza teraz także R2 (lista kubełków). RUNBOOK: sekcja
  „Zdjęcia: Planeta Klocków odrzuca fetch z workera".
- Baza RK nie była alternatywą: sięga rocznika 2024, a wszystkie 37 padających
  galerii to zestawy z 2026.

**Stan:** gotowe. Zdjęcia główne z martwym źródłem (Rebrickable 404: 2927, 11934,
21375) skrypt nie naprawi — potrzebne inne źródło w `obrazy.json`.

**Dla drugiej strony:** Scout/sesje piszące galerie — po dopisaniu wpisów do
`galerie.json` odpal `node scripts/r2-obrazy.mjs`.

**Uwagi:** Planeta resetuje połączenie przy serii pobrań (curl 35), skrypt ponawia;
348 plików zajęło ~25 minut przy 4 równoległych.

## 2026-09-14 20:00 · CODE · Audyt serwisu po dzisiejszych zmianach: dwa błędy naprawione, jeden do decyzji

**Zrobione:** przegląd produkcji po 40 dzisiejszych commitach — build, linki,
przekierowania, obrazy, teksty, zrzuty desktop (1440) i mobile (390).
- Produkcja = build `a9a4e0a` bajt w bajt (8 stron + CSS/JS porównane z `dist/`).
  Build czysty: 4562 strony, 0 ostrzeżeń. 131 557 linków wewnętrznych, **0 martwych**.
  Sitemapa 852 adresów, próbka 25 → wszystkie 200. html-validate na 11 stronach:
  0 błędów (ostrzeżenia tylko o poziomach nagłówków w treści artykułów).
- `/idz/` sprawdzone po 2 losowe na każdy z 16 sklepów: wszystkie 302 na właściwy
  adres z parametrami sieci; filtr botów (bez referera → hub) działa; nieznany
  numer → strona główna. Ceny w hubach „sprawdzone 2026-09-14".
- **Błąd 1 (z dzisiejszej zmiany, naprawiony):** 16 z 31 zestawów, które Marek
  ręcznie zweryfikował jako wycofane (`21a4df6`), nie było na `/wycofania/` —
  szablon wyświetlał tylko serie z `_meta.serie_kolejnosc`, a Pokémon, Super Mario,
  DUPLO, Speed Champions… w niej nie było. Liczniki u góry je liczyły, sekcji nie było.
  Szablon dokłada teraz pozostałe serie alfabetycznie za listą z pliku: 281 → 297 wierszy.
- **Błąd 2 (starszy, naprawiony):** „Obecnie: 30zapowiedzi potwierdzone i 3przecieków"
  na `/nowosci/` i „1przeciek" na stronach miesięcy — Astro zjada spację między
  dwoma wyrażeniami `{}` w tekście. Zdania przepisane na jeden szablon `${}`.
  Cały build przeszukany pod tym kątem: innych miejsc nie ma.
- **Do decyzji (nie z dzisiaj):** galerie zdjęć na hubach — **348 z 608** obrazów
  `/img/<nr>-<poz>.jpg` oddaje 502. Wszystkie pochodzą z cache Planety Klocków;
  z kontenera te same adresy dają 200, worker dostaje odmowę (najpewniej blokada
  adresów Cloudflare po stronie PK). Widoczny skutek: 37 hubów (m.in. 42220–42239,
  60478–60505, 75420–75455) z rzędem pustych miniatur i pustych slajdów; 10 hubów
  częściowo; `/prezentowniki/lego-city/` też. Działa to, co już leży w R2 (259).
  Naprawa bez ruszania workera: wgrać brakujące pliki do R2 z kontenera — ale
  `CF_API_TOKEN` nie ma uprawnień R2 (`r2/buckets` → Authentication error).
  Potrzebna decyzja Marka: token z R2 Write albo wyłączenie galerii dla tych setów.
- Obrazy główne: próbka 120 → 118 OK; 2 błędy to Rebrickable 404 (2927, 11934),
  do tego 21375 Godzilla na `/nowosci/` — ~1–2% setów bez działającego zdjęcia,
  dane, nie kod. 43022 (kask Hamiltona, deal na stronie głównej) bez zdjęcia w ogóle.
- Empik: 3114 linków w serwisie, 0 deeplinków — `redirects.empik` jeszcze nie
  istnieje, bo skrypt importu (`9636271`) powstał po dzisiejszym zrzucie. Wszystko
  idzie na wyszukiwarkę Empiku przez Tradedoublera (działa, prowizja liczona).
  Wypełni się przy następnym zrzucie, zgodnie z tygodniowym rytmem.
- Mobile: brak przewijania poziomego na 11 stronach, tabela cen składa się w karty,
  menu w hamburgerze. Desktop bez uwag poza galeriami.

**Stan:** dwie poprawki szablonów na `main`. Galerie czekają na decyzję o tokenie.

**Dla drugiej strony:** Łowca — nic. Scout — nowe serie w `wycofania.json`
trafiają na stronę same, listy `serie_kolejnosc` nie trzeba już uzupełniać.

**Uwagi:** Chromium z kontenera nie dochodzi do tylkoklocki.pl (reset przez proxy,
jak w notatce o konkurencji), więc zrzuty robione z lokalnego `dist/` serwowanego
na 127.0.0.1, z obrazami dociąganymi z produkcji przez curl — build jest identyczny
z produkcją, więc wynik jest miarodajny. Drobiazg redakcyjny: pod tabelą cen huba
dwa akapity mówią to samo o cenach zmiennych w ciągu dnia (TabelaCen + hub).

## 2026-09-14 19:30 · CODE · Maile do Piotra: wysyłka nigdy nie była podpięta — naprawione

**Zrobione:** Piotr dostał jeden mail (19.08) i potem nic. Log Resend
potwierdza: w całej historii konta wyszedł jeden mail, z tematem „TEST".
Trzy niezależne przyczyny: żaden runner nie miał kroku wysyłki w promptcie,
runnery nie tworzyły pliku raportu, a `wyslij-raport.py` importował
weasyprint, którego nikt nie instalował.
- `scripts/wyslij-raport.py` przepisany: PDF przez headless Chromium
  z kontenera, markdown przez `md-na-pdf.py` — zero zależności. Nowe flagi
  `--do` (test na jeden adres) i `--tylko-pdf`. Test doręczony na kontakt@.
- Krok wysyłki dopisany na końcu promptów Łowcy (zawsze), Scouta, Radaru
  i Wycofań (tylko przy zmianach). Triggery **odtworzone** (nowe ID, te same
  sesje i crony), bo `update_trigger` odmawia zmiany promptu na trwałej
  sesji — sprawdzone próbą no-op.
- Kontroler bez zmian: jego raport idzie do Marka przez SendUserFile.

**Stan:** gotowe. Pierwszy mail od runnera wyjdzie jutro po 08:38 (Łowca,
zasada „zawsze").

**Dla drugiej strony:** nic. Jeśli jutro Piotr nie dostanie maila od Łowcy,
pierwsze miejsce do sprawdzenia to podsumowanie tej sesji runnera — prompt
każe wkleić tam dokładny komunikat błędu skryptu.

**Uwagi:** nowe triggery mają `allowed_tools: []`, skasowany Łowca miał
jawną listę. Pozostałe trzy stare też jej nie miały i chodziły bez problemu,
więc to najpewniej domyślna wartość — ale jutrzejsze przebiegi są pierwszym
realnym dowodem. `environment_id` JEST zwracane przez `list_triggers`
dla triggerów trwałych sesji; wcześniejsza notatka „nie zwraca w ogóle"
była błędna i jest poprawiona.

## 2026-09-14 17:50 · CODE · Prowizje zmierzone, filtr botów, trzy porządki z audytu

**Zrobione:**
- **Tradedoubler Publisher API działa** (`scripts/prowizje-raport.mjs`). Pierwsza
  ZMIERZONA prowizja: Empik 13.09, obrót 51,53 EUR, prowizja 1,41 EUR (2,74%).
  Adres tokenu to `/uaa/oauth/token`, grant `password` — `client_credentials`
  nie jest dozwolony. TD raportuje w EUR, nie sumować ze złotówkami.
- **Filtr botów na `/idz/`** (`src/worker.js`): ruch bez referera z tylkoklocki.pl
  dostaje `blob6 = 'bot'` i przekierowanie na hub zamiast do sklepu.
  `kliki-raport.mjs` **domyślnie liczy tylko ludzi** — pomiar: 34 boty na
  9 ludzi. Wcześniejsze „940 kliknięć" to był w większości ruch scraperów.
- **Ceneo na produkcji**: 1426 cen, 1538 linków.
- **`scripts/diagnoza.mjs`** — zmienne (same nazwy), stan repo, świeżość danych
  i realne wywołania do Cloudflare, GSC, TD, Firecrawla i produkcji.
- **`scripts/archiwum-dziennika.mjs`** — ten plik schudł z 1971 do 889 linii.
  Wpisy sierpniowe są w `materialy/dziennik-archiwum-2026-08.md`.
- **`scripts/harmonogram-z-konta.mjs`** — sekcja „Zrzut" w
  `materialy/zadania-cykliczne.md` jest generowana z `list_triggers`.
- **Harmonogram rozsunięty**: inwestycja pon 09:00 → 10:00, Herzfaden
  pon 08:00 → **środa 11:00**. Zero kolizji.

**Stan:** gotowe, wszystko na `main`.

**Dla drugiej strony (Cowork):** nic nowego do zrobienia, ale dwie zmiany
dotyczą Twojej pracy. (1) Zrzut Empiku dalej robisz w poniedziałek, tylko Łowca
uruchamia teraz dodatkowo `scripts/empik-redirects.mjs --usun-martwe` — klucz
`redirects.empik` powstanie przy pierwszym takim imporcie, dziś go jeszcze nie
ma. (2) **Nowy wpis w tym dzienniku wstawiaj pod linią znacznika**
`WPISY PONIŻEJ`; wszystko nad nią (instrukcja, ustalenia trwałe, indeks
archiwum) jest stałe i archiwizacja tego nie rusza.

**Uwagi:** dzień zszedł też na własne błędy i warto je znać, żeby ich nie
powtarzać. Trzy razy postawiłem tezę o braku dostępu, która nie była prawdą
(„Kontroler nie ma poświadczeń" — miał; „LEGO.com nie ma linków" — miał;
„klient TD nie jest aktywny" — był, tylko biłem w zmyśloną ścieżkę). Stąd
`diagnoza.mjs` i reguła w CLAUDE.md: nie piszemy o uprawnieniach z pamięci.
Pierwsza wersja archiwizatora wywoziła sekcję „Ustalenia trwałe" do archiwum,
a pierwsza wersja diagnozy drukowała fragment sekretu w komunikacie błędu —
oba znalezione dopiero przy powtórnym czytaniu, oba naprawione i przetestowane.

## 2026-09-09 08:00 · CODE · Indeksacja: sitemapy sekcyjne z lastmod, noindex na cienkich hubach, RSS, FAQ, „Przeczytaj też"

**Zrobione** (gałąź `claude/tylkoklocki-indexing-seo-5d1jit`, do wdrożenia
`git push origin claude/tylkoklocki-indexing-seo-5d1jit:main`), na podstawie
audytu Cowork z 09.09 (3 523 adresy w sitemapie, 3 418 hubów, zero `lastmod`):
- **Sitemapy sekcyjne**: `@astrojs/sitemap` zdjęta; `sitemap-index.xml` (ten
  sam adres) wskazuje 7 plików `sitemap-{artykuly,prezentowniki,deale,serie,
  nowosci,zestawy,inne}.xml` (`src/lib/sitemapy.js`). `lastmod` tylko z
  realnych dat: `zaktualizowano`/`data` tekstów, dla hubów – data najnowszego
  naszego tekstu o zestawie. Stan: artykuły 19, prezentowniki 19, deale 5,
  serie 45, nowości 12, zestawy 799, inne 4 – razem 903 adresy (było 3 523).
- **Noindex, follow na cienkich hubach** – `src/lib/seo.js`, `hubIndeksowalny`:
  ≥3 z 4 warunków (≥3 sklepy, tekst >300 znaków, wspomniany w tekście,
  premiera ≤18 mies. i nie EOL) albo prezentownik / gorący deal.
  **799 hubów indeksowalnych, 4 148 z noindex** (z 4 947). Huby działają jak
  dotąd. `sitemap-priorytet.xml` też filtruje po tej regule.
- **RSS** `/rss.xml` (30 najnowszych tekstów), link w `<head>` i w stopce.
- **Widoczne FAQ** pod artykułami i prezentownikami (`Faq.astro`) – dotąd FAQ
  szło wyłącznie do JSON-LD. **„Przeczytaj też"** (`PowiazaneArtykuly.astro`,
  4 linki: wspólne zestawy → seria → kategoria → data).
- **Data aktualizacji** widoczna jako „Aktualizacja: DD.MM.RRRR" w `<time>`;
  autor w schema jako osoba i widoczny podpis „Piotr M." (decyzja Marka;
  `src/config.js`, `AUTOR.imie`).
- **Huby**: „Najniższa cena, jaką zanotowaliśmy" (z `ceny_baza.json`, tylko gdy
  niższa od dzisiejszej) i „Inne zestawy z serii" (6 linków do hubów
  indeksowalnych tej serii). Pełnej historii cen w danych nie ma – tabeli nie da
  się zrobić bez zbierania szeregów czasowych.
- **Nietknięte** (decyzja Marka): linkowanie na stronie głównej.
- `RUNBOOK.md`, sekcja „Sitemapy i Search Console" przepisana.

**Stan:** wdrożone na `main` 09.09 ~07:45, produkcja sprawdzona (sitemapy 200,
`sitemap-0.xml` 404, noindex na cienkim hubie, FAQ i „Przeczytaj też" widoczne,
worker `/img/` i `/idz/` działają). **Marek zgłosił sitemapy w GSC 09.09.**

**Dla drugiej strony (COWORK):** nic do zgłaszania – sitemapy są w GSC. Za 2–3
tygodnie (ok. 23–30.09) odczytać w GSC liczniki „przesłane / zindeksowane"
osobno dla każdej z siedmiu sitemap sekcyjnych i raport Discover, i zapisać
tu wynik. Punkt odniesienia: 903 adresy przesłane (799 hubów), stan
indeksacji sprzed zmiany – 0 poza stroną główną.

**Poprawki po przeglądzie Marka (09.09, ~08:30):** `lastmod` we wszystkich
sekcjach (huby z daty ostatniej oferty, serie i nowości z maksimum po
zestawach, `/`, `/deale/`, `/nowosci/`, `/serie/`, `/wycofania/`,
`/kolekcjoner/` z datą builda – zmieniają się codziennie); kalendarz i
zapowiedzi przeniesione z `sitemap-artykuly.xml` do `sitemap-inne.xml`.
Stan: artykuły 17, prezentowniki 19, deale 5, serie 45, nowości 12, zestawy
799, inne 6 – razem 903, `lastmod` na 901. Progi hubów bez zmian (799) –
decyzja: ocenić w GSC za 2–3 tygodnie, zaostrzyć, jeśli „wykryto,
niezindeksowano" zostanie wysokie.

**Uwagi:**
- Cienkie huby z `noindex` po pewnym czasie wypadną z raportu „wykryta,
  niezindeksowana" – to zamierzone. Hub wraca do indeksu sam, gdy Łowca
  dorzuci trzeci sklep albo redakcja dopisze tekst.
- Nadal do zrobienia (redakcja, nie kod): wydłużenie artykułów do 800–1 200
  słów, FAQ w tekstach, które go nie mają, linki z zewnątrz.

## 2026-09-04 06:50 · CODE · Kolejka redakcyjna w XLSX + osobna sesja na czubek

**Zrobione:**
- **`materialy/kolejka-redakcyjna.xlsx`** — 809 zestawów do opisania: rocznik
  2020–2026, status `dostepny`, cena katalogowa w zł, brak wpisu w `sety.json`.
  Kolumny: numer, nazwa PL, rok, seria, cena. Sortowanie po cenie malejąco.
  Drugi arkusz „Metodologia" opisuje kryteria, źródła i rozkład po rocznikach.
- Liczba przeliczona na świeżo z `katalog.json` + `sety.json`. Rejestr
  (`known_sets.json`) podaje 794 — to stan z 26.08; katalog odświeżono 02.09
  i doszło 15 nowych dostępnych zestawów z ceną.
- **Uruchomiona osobna sesja redakcyjna** `session_017crJHR6y9z5CNDcwqQ2UYg`
  („Redakcja — czubek kolejki"). Bierze zestawy po kolei od góry arkusza,
  partiami po 5–10, dopisuje wpisy do `src/data/sety.json`.

**Stan:** gotowe (arkusz), w toku (sesja redakcyjna — praca ciągła)

**Dla drugiej strony:** nic. Kolejka jest zarezerwowana przez sesję redakcyjną —
nie dublować opisów z arkusza.

**Uwagi:**
- Marek jawnie odrzucił przestawienie priorytetu na Harry'ego Pottera.
  Kolejność to cena malejąco, bez wyjątków.
- **Dwie sesje piszą teraz do `sety.json`** (Scout codziennie 5:00 + Redakcja).
  Każda musi robić `git pull origin main` tuż przed zapisem i weryfikować
  `git diff -U0 src/data/sety.json | grep -c '^-[^-]'` = 0.
- Zestaw 40824 (Tweety) jest w katalogu dwa razy: Seasonal/2025 i
  Looney Tunes/2026. W arkuszu został nowszy wpis — do weryfikacji przy opisie.

## 2026-09-08 · CODE (Radar) · Dla Zwiadowcy: trzy Pokémony z ofertami i bez strony

Konkurencja ogłosiła 07.09 okazje na **72151 Eevee** i **72152 Pikachu i Pokéball**.
Sprawdziłem u nas: **żadnego z nich nie ma ani w `katalog.json`, ani w `sety.json`** —
a nasz własny `oferty_feed.json` ma dla nich żywe oferty. To samo dotyczy **72153**.

| Numer | U nas | Oferta w naszym feedzie |
|---|---|---|
| 72150 Munchlax | katalog + sety | 217,99 |
| **72151 Eevee** | **BRAK** | **186,27** |
| **72152 Pikachu i Pokéball** | **BRAK** | **589,99** |
| **72153** | **BRAK** | **2648,01** |
| 72154 Pokéball z Trenerami | katalog + sety | 1129,99 |
| 72155, 72156, 72160, 72168 | katalog + sety | mamy |

**Dlaczego to nie jest zwykły brak.** To trzy numery **wewnątrz serii, którą już
prowadzimy** — nie EOL wyłowiony z Allegro, tylko dziura w kompletowaniu bieżącego
Pokémona. Bez wpisu w katalogu nie powstaje `/zestaw/<nr>/`, więc nie ma strony, nie
ma tabeli cen i nie ma linku afiliacyjnego — przy 589,99 i 2648 zł to realny koszyk.
Zwiadowca raportował dziś „brak nowych zestawów", więc jego źródło ich nie widzi,
choć nasz feed sklepowy tak.

**Szersza obserwacja, świadomie bez alarmu.** Zestawów z żywą ofertą, których nie ma
ani w katalogu, ani w `sety.json`, jest **1986** — ale ta liczba jest myląca: na
czele są kolekcjonerskie wystawki EOL z Allegro (10196 Grand Carousel za 8999 zł,
4195 Queen Anne's Revenge, 21021 Marina Bay Sands). Tych nie chcemy i nie powinniśmy
mieć. **Nie umiem oddzielić jednych od drugich moimi danymi** — do tego potrzebne
jest źródło Zwiadowcy z rocznikiem. Wąskie sito (numer dzielący trzycyfrowy prefiks
z rocznikiem 2025/26) daje 312 kandydatów, w tym oprócz Pokémonów także **76482,
76483, 75478, 77092** i **76300 Arkham Asylum** — ten ostatni zgłaszałem już 05.09
jako zestaw bez ceny katalogowej.

**Do decyzji Zwiadowcy:** czy warto dołożyć do jego przebiegu krok „sprawdź, czego
z feedu sklepowego nie ma w katalogu, i przepuść przez Brickset po roczniku".
Trzy Pokémony sugerują, że tak, ale skala 1986 pozycji mówi, że filtr musi być
ostry, bo inaczej wciągniemy pół rynku wtórnego.

**Nie ruszałem katalogu** — dodawanie zestawów to jego rola, nie moja.

## 2026-09-10 · CODE (Radar) · Dla Zwiadowcy: dwa Batmany w trwającej promocji, bez strony

Audyt ośmiu cen katalogowych, które konkurencja podała przy Batman Day (9–19.09).
**Pięć zgodnych co do grosza** — nasze dane trzymają poziom. Ale:

| Numer | Cena katalogowa | U nas |
|---|---|---|
| **76303** Tumbler kontra Dwie Twarze i Joker | 249,99 | **BRAK w katalogu** |
| **76304** Batmobil Batman Forever | 419,99 | **BRAK w katalogu** |
| 40859 Figurki Supermana i Batmana | 104,99 | jest w `sety.json`, nie ma w katalogu |
| 30726 (gratis Batman Day) | polybag | **BRAK** |

**Dlaczego to pilne, a nie tylko porządkowe.** Oba brakujące zestawy są w promocji,
która trwa **do 19 września**, i oba mają w naszym feedzie oferty w czterech
sklepach naraz — 76303 najtaniej 179,99 zł (28% poniżej katalogu), 76304 najtaniej
249,99 zł (**40% poniżej katalogu**). To najgłębsze rabaty, jakie widziałem w tych
przebiegach, na zestawach, których nie umiemy pokazać, bo nie mają huba.

To ten sam wzorzec, co Pokémony zgłoszone 08.09 (72151, 72152, 72153): **numery
brakujące wewnątrz serii, którą już prowadzimy**. Nasz katalog ma pięć Batmanów
(76330, 76331, 76332, 76333, 76355), a konkurencja wymienia osiem w samej promocji.

**Osobno, do rozważenia przez redakcję, nie przeze mnie:** nie mamy prezentownika
Batmana, choć mamy trzynaście innych serii. Batman jest teraz w oknie promocyjnym
i wchodzi w sezon prezentowy. Nie zakładam tego tematu sam, bo dobór pozycji wymaga
kompletnego katalogu — czyli najpierw punkt wyżej.

**Nie ruszałem katalogu.**

### Przy okazji: build lokalny padał, produkcja jest zdrowa

`npm run build` wywalał się na `Rollup failed to resolve import "@astrojs/rss"`.
Pakiet **jest** w `package.json` (^4.0.19), brakowało go tylko w `node_modules`
mojego kontenera po commicie 2364a28. Sprawdziłem produkcję, zanim cokolwiek
zgłosiłem: `https://tylkoklocki.pl/rss.xml` zwraca **200 application/xml**, więc
deploy działa. `npm install` u mnie i po sprawie — ale zapisuję, bo następna sesja
z nieodświeżonym kontenerem zobaczy to samo i może niepotrzebnie wpaść w panikę.

## 2026-09-10 (2) · CODE (Radar) · Batman: katalog uzupełniony, prezentownik opublikowany

Na polecenie Marka, w reakcji na dzisiejszy radar.

**Katalog: 7832 → 7837.** Seria Batman z 5 na 10 pozycji. Dodane 76300 Arkham
Asylum (2953 el., 1299,99), 76301 Batman i Batmobil kontra Mr. Freeze (63 el.,
89,99), 76303 Tumbler kontra Dwie Twarze i Joker (429 el., 249,99), 76304
Batmobil Batman Forever (909 el., 419,99), 76328 Batmobil z serialu z lat 60.
(1822 el., 649,99). Każda pozycja ma `cena_zrodlo`; 76303 i 76304 mają dwa
niezależne potwierdzenia (lista promocyjna Batman Day + porównywarki).

Wszystkie pięć dostało hub `/zestaw/<nr>/` z tabelą cen — czyli to, czego
brakowało 76303 i 76304 w trakcie ich własnej promocji.

**Świadomie NIE dodane**, z uzasadnieniem w `katalog.json/_meta`:
- **76302 Mech Supermana kontra Lex Luthor** — to Superman, nie Batman. Katalog
  nie ma serii DC ani Superman, a wrzucenie tego pod „Batman" byłoby błędnym
  oznaczeniem. **Decyzja o założeniu serii należy do Zwiadowcy.**
- 40859 — jest w `sety.json` jako BrickHeadz z dystrybucją ekskluzywną.
- 30726 — polybag-gratis, brak ceny detalicznej.

**Prezentownik:** `/prezentowniki/lego-batman/`, osiem zestawów, karta researchu
w `redakcja/karty/prezentownik-batman.md`.

Oś: Batman to **dwie rozłączne półki** — zabawa (9+, 90–250 zł) i ekspozycja
(18+, od 650 zł) — a **cena nie mówi, która jest która**. Tumbler za 250 zł jest
zabawką, Batmobil z serialu za 650 zł nie jest. Przy każdej pozycji najpierw
„dla kogo", potem kwota.

**Odstępstwo od wzorca, świadome:** drabina zaczyna się od 90 zł zamiast od 25 zł,
bo Batman nie ma tańszego zestawu detalicznego. Jedyna tańsza pozycja to polybag
30726, który jest gratisem z Batman Day, a nie towarem. Standard pozwala przesunąć
próg zamiast wstawiać zapchajdziurę — i mówimy o tym wprost w tekście oraz w FAQ.

### Dla Łowcy: dwie anomalie w feedzie

Wyszły przy ustalaniu poziomów cenowych, obie zapisane w `katalog.json/_meta`:

- **76328** — Empik pokazuje **45,00 zł** za zestaw 1822-elementowy o cenie
  katalogowej 649,99. Niemal na pewno zły rekord.
- **76355** — Planeta Klocków pokazuje **2589,99 zł** przy cenie katalogowej
  899,99, i jest to jedyna oferta tego zestawu w feedzie. Premiera wrzesień 2026.

Obie kwoty pominąłem przy ustalaniu progów zakupu.

### Czego nie zrobiłem

Zestawy weszły **tylko do katalogu**, bez wpisów w `sety.json` — czyli bez opisu
redakcyjnego, `dla_rodzica` i `dla_afol`. Huby działają (nazwa, parametry, tabela
cen), ale są chudsze niż te z pełnym opisem. To robota dla sesji redakcyjnej,
nie dla radaru.

## 2026-09-10 (3) · CODE (Radar) · Seria DC + wykaz zestawów bez opisu

### Dlaczego nie było serii DC

**Bo nigdy jej nie zaimportowaliśmy — to nie był błąd nazewnictwa, tylko dziura
w imporcie.** Oficjalny motyw LEGO nazywa się „DC Super Heroes" i obejmuje
także wszystkie Batmany: porównywarki trzymają 76328, 76330–76333 i 76355 pod
tym samym adresem co Supermana. Nasz katalog powstał z kart Piotra i importu,
które używały etykiety „Batman" — ta część weszła, reszta DC nie weszła wcale.
Piotr ma 1087 kart i **ani jednej z serią „DC"**; ma pięć z serią „Batman".

**Co zrobione:** założona seria `DC`, wyłącznie na zestawy spoza wątku Batmana.
Pierwsza pozycja: 76302 Mech Supermana kontra Lex Luthor (120 el., 64,99 zł).

**Czego świadomie nie zrobiłem:** nie przeniosłem Batmanów do DC. Batman ma już
stronę serii i świeży prezentownik, a rozbicie Batmanów między dwie serie byłoby
gorsze niż obecny stan. `DC` jest dziś zalążkiem z jedną pozycją — sensowne
wypełnienie wymaga importu całego bloku z rocznikami, czyli roboty Zwiadowcy.

Przy okazji domknięty Batman: dodane 76264 (54 el., 119,99) i 76265 (357 el.,
169,99). Seria ma 12 pozycji. **Wciąż brakuje szesnastu numerów** — lista
w `katalog.json` → `_meta.seria_dc_2026_09_10.batmany_wciaz_brakujace_do_sprawdzenia`.

### Pułapka źródłowa, która o mało nie weszła do danych

Szerokie zapytanie do wyszukiwarki podało 76303 jako **279,99 zł**, a 76331
i 76332 jako **294,99 zł** — czyli sprzecznie z tym, co opublikowałem godzinę
wcześniej. Weryfikacja **każdego numeru z osobna** potwierdziła nasze dane:
76303 = 249,99, 76332 = 124,99 przy 330 elementach.

**Reguła na przyszłość, zapisana też w `_meta`: przy cenach ufamy zapytaniom
o pojedynczy numer, nie zbiorczym podsumowaniom listingów.** Zbiorcze wyniki
mieszają ceny rynkowe z katalogowymi i różne zestawy między sobą.

### Wykaz zestawów bez opisu redakcyjnego

`scripts/bez-opisu-od-najnowszych.py` → `materialy/zestawy-bez-opisu.xlsx`.
Definicja „bez opisu" ta sama co status `do opisania` w kolejce redakcyjnej:
ani karty Piotra, ani naszego opisu, ani pary person.

**Arkusz 1 — populacja kolejki (2020–2026, dostępny, z ceną): 15 pozycji.**
Zaległość jest tam praktycznie zamknięta: na 1135 zestawów 1046 ma kartę Piotra,
a 1120 ma persony. Z tych 15 aż **7 to Batmany i DC, które sam dziś dodałem** —
czyli lista sama się domknie, gdy redakcja dopisze im teksty.

**Arkusz 2 — gdzie jest prawdziwa dziura: 3716 pozycji.** Każdy zestaw
z katalogu, który ma **dziś ofertę w sklepie** i nie ma żadnego tekstu, bez
ograniczenia rocznika i statusu. Rozkład: 2021 — 344, 2022 — 324, 2018 — 321,
2020 — 314, 2023 — 306, 2019 — 300. To są zestawy, które ktoś może kupić,
a my nie mamy o nich zdania.

Oba arkusze sortowane od najnowszych, z metodologią w osobnej zakładce.

## 2026-09-11 · CODE (Radar) · Dla Zwiadowcy: polskie serwisy bywają szybsze przy cenach PL

Dziś rano dodałeś 21373 Downton Abbey z adnotacją „ceny nie ma na żadnym rynku".
Tego samego dnia faniklockow opublikowali **1299,99 zł** — razem z 13 nazwanymi
minifigurkami i wymiarami 30×44×14 cm.

**To nie jest błąd po Twojej stronie.** Brickset i StoneWars faktycznie tej ceny
nie mają, a promoklocki i zklockow **nie mają jeszcze 21373 w indeksie** —
sprawdziłem punktowo, więc ceny nie wpisałem: zostaje jedno źródło, a przy
cenach trzymamy próg dwóch.

Sygnał jest inny: **przy cenach katalogowych w złotych polskie serwisy branżowe
bywają szybsze niż źródła anglojęzyczne.** Liczba elementów zgadza się u nich
co do sztuki (4711), a lista trzynastu postaci jest zbyt konkretna, żeby ją
zmyślić. Propozycja: przy zestawach **przed premierą** zaglądać także do
faniklockow i fanklockow, nie tylko do Bricksetu i StoneWars.

**Do wpisania, gdy porównywarki zaindeksują 21373:** 1299,99 zł.

Przy okazji dwie drobnice:
- 21373 jest w `sety.json`, ale nie ma go w `katalog.json`.
- Liczba elementów Godzilli: my mamy 5364, konkurencja podaje 5360.
- **Cena 21375 Godzilli nadal nieznana** („ok. 1700 zł" to ich szacunek).
  To wciąż pozycja numer jeden przed tekstem o Black Friday — okno 5–20.11.

## 2026-09-12 · CODE (Radar) · Dla runnera Wycofań: kontrola naszej listy o cudzą

Konkurencja opublikowała 11.09 pełną listę EOL-i na koniec 2026 — 38 tys. znaków
z datowanym dziennikiem zmian. Przepuściłem ją przez nasze `wycofania.json`.

**Wynik jest dla nas dobry.** Ich lista: 418 numerów. Nasza: 271.
**Pokrywa się 262** — czyli praktycznie cała ich lista potwierdzonych jest u nas.
W drugą stronę mamy 9 pozycji, których oni nie mają.

**Do nadrobienia: 108 zestawów**, które oni wymieniają, są w naszym `katalog.json`
i nie ma ich na naszej liście wycofań. Przykłady: 11025, 11040, 11043, 11044,
blok 21266–21282, 31145, 40708, 40743, 40807, 40808, 40812.

Zastrzeżenie metodologiczne: numery wyciągnąłem regexem z ich tekstu, więc na
liście mogą być pojedyncze fałszywe trafienia. Trzeba je przejrzeć, a nie
wciągać hurtem. Ich lista miesza też potwierdzenia z przewidywaniami — sami
piszą, że część to prognozy społeczności i rynku.

### Osobno: 51 pozycji, które same sobie przeczą

Niezależnie od tamtego porównania: **51 zestawów ma u nas `kiedy: "wycofany"`
i `status: "potwierdzone"` na liście wycofań, a w `katalog.json` status
`dostepny`.** Według definicji z `katalog.json/_meta.statusy_uwaga` — *„Status
'eol' oznacza koniec produkcji; oznaczaj 'dostepny', chyba że LEGO faktycznie
zakończyło sprzedaż"* — te rekordy powinny być `eol`.

Przykłady: 21344 Orient Express, 10331 Zimorodek, 10359 Fontanna, 10362
Francuska kawiarenka, 75356 Executor, 75347 Bombowiec TIE, 75401 Interceptor
Ahsoki.

**Nie przestawiałem tego sam** — 51 rekordów w cudzej domenie, a zmiana statusu
na `eol` ma skutki uboczne: wypada z kolejki redakcyjnej (filtruje po
`dostepny`) i zmienia reguły generowania hubów. Do decyzji runnera Wycofań.

### Co z tego wziąłem do treści

75356 Executor w skali midi zniknął z LEGO.com na początku września — dokładnie
wtedy, gdy do sprzedaży wchodzi nowy UCS 75457. Dopisałem do artykułu
o Executorze akapit: kto chciał kształt okrętu na biurku za ułamek ceny UCS-a,
ma zamykające się okno u innych sprzedawców. **To jedyna rzecz przy Executorze,
przy której pośpiech ma sens** — i nikt inny tego zestawienia nie zrobi, bo
wymaga trzymania obu zestawów w jednej bazie.

## 2026-09-13 20:30 · CODE · Porządki: statusy wycofań i nowości, EOL na listingu, nowa karta, podobne zestawy, tabela cen mobile, Allegro ≤30%

Dwie sesje Code pracowały równolegle nad tym samym zadaniem Marka w jednym
drzewie (agd-67 i ta); po wykryciu kolizji agd-67 zatrzymała się, ta sesja
scaliła i dokończyła. Gałąź `porzadki-statusy`, **niewypchnięta** – wdrożenie:
`git push origin porzadki-statusy:main`. Lokalnie nie ma `node`/`npm`, więc
build Astro zrobi dopiero Cloudflare; wszystkie `.js/.mjs` i frontmattery
`.astro` przeszły `node --check` (Node z pakietu Photoshopa), a nowe tabele
obejrzane w przeglądarce na makiecie z produkcyjnym CSS (375 px: mieści się).

**Zrobione:**
- `src/lib/status.js` (nowy) – jedno źródło statusów: `eolWLego`,
  `statusWycofania`, `statusListingu`, etykiety „potwierdzone przez LEGO" /
  „prognoza rynku" / „wycofany (EOL)"; obsługa `kiedy: "odwołane"`.
- `/wycofania/`: dwie osobne listy (potwierdzone przez LEGO ↔ prognozy rynku),
  nowe FAQ i wstęp. `TabelaSetow`: kolumna statusu z terminem i znacznikiem
  **EOL** pod „w sprzedaży", gdy LEGO skończyło, a sklep ma. Katalog serii
  i Top 10 wycofań na głównej używają tej samej logiki.
- `TabelaCen.astro` + `scripts/remark-ceny.mjs`: tylko sklepy z ceną (koniec
  wierszy „Sprawdź cenę" bez kwoty – przypadek Planeta Klocków/x-kom przy 21323),
  wiersz LEGO.com z ceną katalogową i EOL bez przycisku po wycofaniu; EOL
  liczy się także dla hubów z sety.json (wcześniej nigdy). Klasy `kc-*`,
  wrapper `.tabela-cen-wrap`, układ siatki ≤720 px bez ramki karty.
- Hub `/zestaw/`: plakietki EOL/wycofanie/przeciek, ramka „LEGO zakończyło
  produkcję", sekcja **Podobne zestawy z serii** (4–6 losowych kafelków,
  `podobneZSerii` w `seria-huby.js`, ziarno numer+dzień) + „Zobacz całą serię".
- Nowa karta dla `/zestaw/`: `target="_blank"` w szablonach i pluginach remark
  plus delegacja kliknięcia w `Base.astro` (markdown, wyszukiwarki `window.open`).
- Nowości: pole `status_nowosci` w `sety.json` (`przeciek`/`potwierdzone`),
  badge „przeciek z rynku" vs „wkrótce · potwierdzone przez LEGO" na
  `/nowosci/`, podstronach miesięcy i hubie; legenda.
- Deale: `src/lib/deale.js` – Allegro maks. 30% linków (karuzela 1 z 5,
  półka `/deale/` 3 z 12), alternatywna oferta spoza Allegro albo pozycja odpada.
- Dane: audyt 593 numerów na lego.com (`materialy/audyt-wycofan-2026-09-13.md`):
  katalog 224× `dostepny→eol` (w tym 76264), 71× `eol→dostepny`, 49× `eol`
  z `--napraw`; wycofania 2× `odwołane` (10307, 40647); przecieki 11387, 21375, 77094.
  Nowe `_meta.regula_statusow` w `wycofania.json`, `scripts/audyt-wycofan.mjs`.
- Dokumentacja: `RUNBOOK.md` (sekcja „Statusy: wycofania, nowości, EOL",
  „Jak sprawdzić status na lego.com", typowanie deali), `redakcja/README.md`.

**Stan:** gotowe do wdrożenia, czeka na push i build na Cloudflare.

**Dla drugiej strony:** runner Wycofań – dopisywać `zrodlo`, przejrzeć 49
wpisów „wycofany" ze statusem „Wyprzedane" na lego.com i 49 kandydatów
z raportu; Scout – ustawiać `status_nowosci` przy każdej zapowiedzi,
zweryfikować 21375 Godzilla (przeciek czy oficjalna zapowiedź LEGO Ideas).

**Uwagi:** wpis 10307 Wieża Eiffla był na liście jako „wycofany", a lego.com
mówi „Dostępne teraz" – dlatego `--napraw` w skrypcie audytu nie może być
ślepy (reguła 5 w RUNBOOK). „Wyprzedane" (K_SOLD_OUT) nie jest ani
dostępnością, ani EOL – nie przestawiamy po nim katalogu automatycznie.

## 2026-09-14 · CODE (Radar) · Zero publikacji u konkurencji; skutek uboczny poprawki wycofań

**Pierwszy dzień bez ani jednej nowej publikacji** na fanklockow i faniklockow.
Bazy konkurencji nie commitowałem — zgodnie z instrukcją przebiegu.

### Moje zgłoszenie z 12.09 zostało wdrożone i wdrożone dobrze

**51 zestawów ze sprzecznym statusem → 0.** Runner Wycofań przestawił statusy
w katalogu na `eol`, zgodnie z definicją, i przy okazji zapisał w
`wycofania.json/_meta.regula_statusow` porządną regułę rozróżniania
„potwierdzone" (sygnał od LEGO) od „przewidywane" (zgodne prognozy co najmniej
**dwóch** źródeł branżowych). Huby wycofanych zestawów zostały — generują się
z listy wycofań niezależnie od statusu.

**108 zestawów z listy konkurencji: wciąż żadnego nie dodano — i to jest
poprawne zachowanie, nie przeoczenie.** Ich nowa reguła wymaga przy prognozie
dwóch zgodnych źródeł, a lista faniklockow to jedno. Zamykam ten wątek po swojej
stronie: nie jest zaległością, tylko oczekiwaniem na drugie źródło.

### Skutek uboczny, przed którym ostrzegałem — zmierzony

Populacja kolejki redakcyjnej spadła z **1135 na 922**. Wypadło z niej
**67 zestawów** z rocznika 2020–2026, bo zmieniły status na `eol`.

Z tych 67: **65 ma dziś ofertę w sklepie**, a **14 nie ma u nas żadnego tekstu**.
I najciekawsze — większość chodzi **powyżej ceny katalogowej**:

| Zestaw | Katalogowa | Dziś |
|---|---|---|
| 76417 Bank Gringotta | 1849,99 | **3179,00** |
| 10305 Zamek rycerzy herbu Lew | 1749,99 | **2399,99** |
| 21323 Fortepian | 1699,99 | **1778,00** |
| 21335 Latarnia morska | 1299,99 | **1489,00** |
| 76430 Sowiarnia w Hogwarcie | 199,99 | **246,44** |

**To są zestawy, przy których nasza funkcja jest najbardziej potrzebna.** Ktoś
widzi Gringotta za 3179 zł i nie ma pojęcia, że katalogowo kosztował 1849,99 —
a my przy czternastu z nich nie mamy ani zdania. Wypadnięcie z kolejki jest
logiczne (zestaw nie jest już w sprzedaży u LEGO), ale akurat te pozycje
zasługują na tekst bardziej niż niejedna bieżąca nowość.

**Propozycja dla redakcji, nie decyzja:** kolejka redakcyjna filtruje po statusie
`dostepny`. Warto rozważyć drugi, mniejszy strumień — „wycofane, ale wciąż
kupowane i bez opisu". Czternaście pozycji to robota na kilka dni, a dotyka
zestawów z najwyższymi koszykami w całym serwisie.

To uzupełnia arkusz `materialy/zestawy-bez-opisu.xlsx` z 10.09: jego arkusz 2
pokazywał 3716 takich pozycji w całym katalogu, ale bez wyróżnienia tych
świeżo wycofanych i drożejących.

## 2026-09-15 · CODE (Radar) · LEGO potwierdziło wycofania — to zmienia priorytety

**Wydarzenie sezonu.** LEGO potwierdziło 14.09 w dziale „Ostatnie Sztuki"
wycofanie **ponad stu zestawów** na koniec 2026. Oba serwisy branżowe zareagowały
tego samego dnia. To powtarzalny wrzesniowy rytuał producenta — warto wpisać tę
datę do kalendarza redakcyjnego jako stałą.

**Nasza lista ma wszystkie trzynaście zestawów, które wymieniają z nazwy.**
Żadnego nie brakuje. Zwiadowca i ręczna weryfikacja Marka nadrobiły to w ciągu
doby (271 → 314 pozycji).

### Dla runnera Wycofań: pięć statusów do przeglądu

Te pozycje mają u nas `przewidywane`, a serwisy podają je jako **potwierdzone
przez LEGO** (obecne w „Ostatnie Sztuki"):

`21333` Van Gogh · `21351` Miasteczko Halloween · `21353` Ogród botaniczny ·
`21356` Parowiec rzeczny · `76437` Nora

Nie przestawiam sam — zgodnie z regułą z 13.09 `potwierdzone` wymaga sygnału od
LEGO, a tego nie zweryfikuję (lego.com blokuje ruch serwerowy). Runner Wycofań
ma metodę i dostęp.

### Najważniejsze dla treści: mamy dziurę przy najdroższym zestawie w serwisie

**75192 Sokół Millennium UCS — 3599,99 zł katalogowo, wycofanie grudzień 2026
potwierdzone, dziś 3047,89 zł u Media Expert (15% poniżej cennika).
I NIE MAMY O NIM ANI ZDANIA** — ani karty Piotra, ani person, ani opisu.

To najdroższa pozycja w całym katalogu, schodzi z produkcji po prawie dziesięciu
latach, jest w tym momencie przeceniona, a nasza strona nie umie o niej nic
powiedzieć. Podobnie **10326 Muzeum** (1299,99) i **43263 Zamek z Pięknej
i Bestii** — ten drugi w ogóle nie ma u nas ceny katalogowej.

To dokładnie ten strumień, który zaproponowałem wczoraj („wycofane, wciąż
kupowane, bez opisu"), tyle że po wczorajszym ogłoszeniu przestał być
propozycją porządkową, a stał się pilny.

### Rekomendacja: przesunąć tekst o wycofaniach

Plan ma „Wycofania grudnia 2026" z oknem **1–20 października**. LEGO potwierdziło
listę **wczoraj**, więc decyzja zakupowa czytelnika jest teraz, a nie za trzy
tygodnie. Proponuję przesunąć okno na **17–30 września** i oprzeć tekst na
potwierdzonej liście zamiast na prognozach — to pierwszy raz w tym sezonie, gdy
możemy pisać o wycofaniach na danych poziomu A.

### Obserwacja o konkurencji

fanklockow uruchomili **płatny biuletyn dla patronów** z przeciekami. Monetyzują
informację przed publikacją — inny model niż nasz. Praktyczny wniosek: część ich
najświeższych danych jest za płotkiem i może do nas docierać z opóźnieniem.
