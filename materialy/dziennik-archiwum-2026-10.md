# Dziennik — archiwum 2026-10

Wpisy przeniesione z `DZIENNIK.md` po przekroczeniu progu wieku.
Treść jest niezmieniona. Bieżące wpisy i ustalenia trwałe: `DZIENNIK.md`.

## 2026-10-04 08:15 · RADAR · Do zrobienia

**fanklockow.pl · 03.10** — Wideorecenzja LEGO 72306 PlayStation, czyli świeżej premiery za 689,99 zł, która właśnie weszła w okno prezentowe.
**Mamy?** — częściowo: hub `/zestaw/72306/` z notkami dla rodzica i dla AFOL-a oraz wzmianki w trzech tekstach, ale recenzji nie ma.
**Zrobić:** — nowy tekst „Recenzja LEGO 72306 PlayStation" (kategoria Recenzje; wymaga dostępu do zestawu, więc najpierw decyzja, czy go mamy).
**Kto:** — Marek (decyzja o zestawie), potem Piotr (tekst)

Kontekst cenowy do tej pozycji: 03.10 Ceneo ma 619,99 zł, czyli **pierwszą ofertę
poniżej katalogu** 689,99. Jeszcze 29.09 wszystkie oferty zewnętrzne były wyższe
od cennika i na tej podstawie zapisaliśmy, że to odsprzedaż — Allegro 748,99 nadal
nią jest, ale dystrybucja już weszła.

→ zamknięte 14.10.2026: decyzja Marka — kupno 72306 odkładamy, recenzji nie będzie.

## 2026-10-03 09:30 · CODE · Nowy prompt Łowcy zweryfikowany na pierwszym przebiegu

Przebieg z harmonogramu 03.10 08:34 PL, commit `c87196a`. Zmiana z 02.10 działa:

- **Historia cen: 1169 wpisów z datą 2026-10-03** (1030 Allegro, 120 Media Expert,
  12 Lidl, 7 Planeta Klocków). Dzień wcześniej, przed poprawką, ten sam krok dał
  65 wpisów — czyli skrypt faktycznie przeszedł na koniec przebiegu, po zapisaniu
  `oferty_feed.json`. Seria za 30.09–03.10: 1105 / 1190 / 1375 / 1169, bez dziur.
- **Kontrola kart ME: 25 kandydatów, 25 sprawdzonych, 0 poprawek.** Dwie rzeczy
  z tego wynikają: po łatce `g:sale_price` feed zgadza się z kartami, a limit
  80 kart dziennie ma zapas — wczorajsze 85 kandydatów było jednorazowym efektem
  samej poprawki, nie normą.
- Ceny ME w commicie Łowcy sprawdzone niezależnie: wszystkie 746 ofert z datą
  03.10, a zestawy, które wczoraj ręcznie weryfikowałem na kartach, trzymają
  właściwe kwoty (60499 — 179, 10440 — 52,89, 72050 — 499, 10300 — 775). Poprawka
  przechodzi przez pełny przebieg runnera, nie tylko przez moje ręczne naniesienie.

**Odpalenie na żądanie z 02.10 12:57 nie zadziałało i nie wiem dlaczego.**
`fire_trigger` zapisał `last_fired_at`, ale pola `last_run` nie było wcale, sesja
Łowcy nie dostała tury (`updated_at` został na 02.10 07:03) i nie powstał commit.
Dzisiejsze odpalenie z harmonogramu ma `last_run: SUCCEEDED` i `session_id`
`cse_01SdxKtAvW8UmktsuXrsPYga`, podczas gdy wczorajszy `fire_trigger` zwrócił
`cse_012qL4Q3E8BJ5CqFX3eD5Tiz` — inny identyfikator przebiegu, który nigdy się nie
zmaterializował. To obserwacja, nie diagnoza. Wniosek praktyczny: **weryfikację
zmiany promptu runnera planujemy na jego normalny przebieg, a nie na
`fire_trigger`** — albo po `fire_trigger` sprawdzamy `last_run`, zanim napiszemy,
że przebieg wystartował.

**Zrobić:** — sesja Łowcy ma 762 tys. z 1 mln tokenów kontekstu (wczoraj 725 tys.,
czyli ~37 tys. na przebieg). Przy tym tempie zostaje jej około sześciu przebiegów.
Zaplanować odtworzenie sesji (delete+create Routine'a z nowym `persistent_session_id`),
zanim uderzy w limit w środku sezonu XI–XII.
**Kto:** — Marek (decyzja kiedy) + Code (wykonanie)

## 2026-10-03 08:20 · RADAR · Nic do zrobienia (ale poprawka dostępu)

Przebieg bez pozycji do piątki: fanklockow dwie publikacje (jedna o COBI — poza
zakresem), faniklockow zero nowych (feed RSS bajt w bajt identyczny z wczorajszym,
najnowsza pozycja z 01.10 15:35). Cztery wpisy dołożone do bazy, żadnego zadania.

**Poprawka zapisanego „faktu" o dostępie.** `konkurencja_baza.json` miała w
`_meta.dostep`, że dla promoklocki.pl i zklockow.pl „jedynym źródłem pozostaje
WebSearch z allowed_domains". To nieprawda: dziś oba serwisy **weszły Firecrawlem**,
HTTP 200 z `proxy: basic` — zklockow.pl oddał listę produktów i pełne menu sekcji,
promoklocki.pl w formacie `links` kategorie i karty produktów za 1 kredyt. Stary
zapis był obejściem z czasów, gdy nie próbowaliśmy Firecrawla; curl i WebFetch
dalej dostają 403 i to się nie zmieniło. Monitoring strukturalny tych dwóch
serwisów robimy od teraz Firecrawlem, nie WebSearchem — zapisane w `_meta.dostep`.

Przy okazji sprawdzone, czy świąteczny asortyment z promoklocki ma u nas luki:
11 z 12 numerów (40874, 40875, 40866, 40865, 11387, 5011093, 40900, 43026, 76355,
11379, 21373) jest w `katalog.json`; brakuje tylko 5011029, a to gra planszowa
Ninjago, nie zestaw klocków. Luki więc nie ma.

## 2026-10-02 12:40 · RADAR · Media Expert: sprostowanie diagnozy i poprawka w parserze

**Sprostowanie do wpisu z dzisiejszego 08:00.** Napisałem tam, że zawyżone ceny
Media Expertu to skutek niepełnego odświeżenia (594 z 735 pozycji z datą 29.09
lub starszą). To nie była przyczyna. Dzisiejszy świeży feed
(`mediaexpert_feed_updated: 2026-10-02 00:30 CEST`) zwrócił **te same stare
kwoty**, więc świeżość danych nie miała z tym nic wspólnego.

**Prawdziwa przyczyna — dwie, obie zmierzone na kartach przez Firecrawla:**

1. `scripts/feedy-lego.py` czytał tylko `<g:price>`, a cena promocyjna siedzi
   w `<g:sale_price>`. `g:price` zostaje przez cały czas promocji ceną regularną,
   więc czytelnik widział u nas kwoty wyższe od sklepowych (60499: feed 199,99,
   karta 179,00). Po łatce **143 zestawy dostały niższą, prawdziwą cenę** —
   mediana rabatu 8,4%, maksimum 39,9%; 10 z 11 kontrolnych zgadza się teraz
   co do groszy z listą przecen, którą opisał faniklockow.
2. Nawet `g:price` bywa rozjechany z kartą, i to mocno: 10440 feed 84,99 /
   karta 52,89; 71513 feed 219,99 / karta 146,36; 10300 feed 849,99 /
   karta 775,00; 42213 feed 202,99 / karta 185,50. Na pięciu sprawdzonych
   „wzrostach ceny" **cztery były wymysłem feedu**. Kierunek błędu zawsze ten
   sam: feed pokazuje więcej, niż się płaci w sklepie.

**Druga rzecz do odnotowania jako błąd mój:** w pierwszej wersji łatki
zapisałem, że `<g:price>` bywa zdublowane z „0 PLN" na początku. Nieprawda —
dodatkowe `<g:price>` siedzą w `<g:shipping>` (kurier 14,90, InPost 7,99, 0,00
przy darmowej dostawie), a `findtext` i tak patrzy tylko na dzieci `<entry>`.
Teza wzięła się z grepa po surowym pliku. Komentarz w skrypcie i RUNBOOK mówią
teraz, jak ten plik wygląda naprawdę.

**Zrobione w repo:**
- `scripts/feedy-lego.py` — `g:sale_price` przed `g:price`, pole `cena_regularna`
  w wyciągu.
- `scripts/me-ceny-stron.mjs` (nowy) — kontrola cen ME na kartach produktów przez
  Firecrawla, wołana automatycznie przez `feedy-lego.py`, więc Łowca dostaje już
  poprawiony wyciąg i prompt Routine'a nie wymaga zmiany. Sprawdza wąski podzbiór
  (skok ceny powyżej 15% albo ME najtańszy z przewagą powyżej 10%), limit 80 kart
  i budżet 900 s, bo karta to 1 kredyt Firecrawla przy 5 000 na miesiąc.
  Bez `FIRECRAWL_KEY` przepuszcza wyciąg bez zmian — nie może wywrócić Łowcy.
- RUNBOOK: **wycofany** dotychczasowy wniosek „ceny ME bierzemy wyłącznie z feedu,
  bo jest oficjalny i wiarygodny" oraz zdanie, że kart ME nie da się sprawdzić
  z sesji (Firecrawl wchodzi, `proxy: basic`, 1 kredyt).
- Ceny ME w `oferty_feed.json`, `sety.json` i minima w `ceny_baza.json` nanie-
  sione poprawnym parserem na dane, które Łowca zapisał dziś starym.

**Zrobić:** — przy następnym przeglądzie budżetu Firecrawla sprawdzić, czy limit
80 kart dziennie wystarcza; dziś kandydatów było 85, ale to jednorazowy efekt
samej poprawki — w normalny dzień kryterium „skok ceny" powinno dawać kilka.
**Kto:** — Code (dane, strona)

### Przy okazji: historia cen spisuje się o jeden krok za wcześnie

`historia-cen.mjs` jest wołany z wnętrza `feedy-lego.py`, czyli **zanim** Łowca
naniesie ceny z wyciągu na `oferty_feed.json`. Skrypt widzi więc stan wczorajszy
i codziennie spisuje wczorajsze zmiany, nie dzisiejsze. Liczby z dziś:
plik z `origin/main` miał po przebiegu Łowcy **65** wpisów z datą 2026-10-02,
a uruchomienie skryptu po naniesieniu danych dopisało **1310** (986 Allegro,
321 Media Expert, 3 Planeta Klocków) — tyle zmian cen z dziś nie było zapisanych.
Te 1310 wpisów dopisałem w tym przebiegu, więc dzisiejszy dzień jest kompletny.

**ZROBIONE tego samego dnia** (Marek: „zmień ten prompt Łowcy sam"). Wywołanie
`historia-cen.mjs` wyjęte z `feedy-lego.py` i dopisane do promptu Łowcy jako
trzeci skrypt w kroku PRZED COMMITEM — oba końce w jednej zmianie, więc
zbieranie historii nigdzie nie wypada.

Prompt: `update_trigger` odmawia zmiany instrukcji z innej sesji niż ta, do
której Routine wpada („a routine's instructions can be changed only from the
conversation the routine posts into"), więc delete+create — tak jak mówi
CLAUDE.md. Najpierw create, potem delete, żeby ani na chwilę nie zostać bez
Routine'a. Nowy `trig_01RjjGRUpJ8QVvhBQrLXiy7Z` (stary
`trig_01L8awRzxEbeUSQsad7ye18Y` skasowany), ta sama stała sesja
`session_01SdxKtAvW8UmktsuXrsPYga`, ten sam cron `CRON_TZ=Europe/Warsaw 30 8 * * *`,
następny przebieg 03.10 08:34 PL. Sprawdzone po zmianie: sesja Łowcy żyje,
na liście jest dokładnie jeden Routine Łowcy.

Przy okazji w promptcie: pole `_meta.mediaexpert_karty` do raportu, weryfikacja
kart ME przez Firecrawla zamiast WebFetcha (ME oddaje 403) i liczba nowych wpisów
historii w podsumowaniu.

**Zrobić:** — przy następnym przeglądzie budżetu Firecrawla sprawdzić, czy limit
80 kart dziennie wystarcza (dziś 85 kandydatów to jednorazowy efekt poprawki),
i czy pierwszy przebieg Łowcy na nowym promptcie 03.10 dopisał historię cen
w normalnej skali (rzędu kilkuset wpisów, nie 65).
**Kto:** — Code (dane, strona)

## 2026-10-02 08:00 · RADAR · Do zrobienia

**Media Expert · 1.10** — od rana 1 października ruszyła u nich duża fala przecen na LEGO (20–44%, kilka pozycji „historycznie najtaniej"), a nasze ceny Media Expert tego nie widzą.
**Mamy?** — nie: sprawdziłem dwanaście pozycji z ich listy i w **każdej** nasza cena Media Expert jest wyższa od faktycznej, zwykle o 8–15%, a przy 31174 Telefon retro prawie dwukrotnie (129,99 wobec 70 zł). Pomiar szerszy: 735 zestawów ma u nas ofertę Media Expert, odświeżono 1.10 tylko 141 — **594 pozycje (81%) mają ceny z 29.09 lub starsze**. Cały feed dostał 1.10 aż 4632 wpisy, więc odświeżenie się odbyło; niepełne jest samo pokrycie Media Expert.
**Zrobić:** — sprawdzić w runnerze Łowcy, dlaczego import Media Expert objął 1.10 tylko piątą część zestawów, i dociągnąć resztę. To jeden z naszych sklepów publikacyjnych, więc zawyżone ceny widzi czytelnik w tabelach hubów w szczycie sezonu.
**Kto:** — Code (dane, strona)

→ zamknięte 13.10.2026: naprawione 02.10 w 5466f4b (ceny ME z `g:sale_price` + kontrola na kartach produktów); 13.10 wszystkie 733 oferty ME mają datę z dnia.

## 2026-10-01 05:10 · SCOUT · Sygnały wycofań dla runnera Wycofań

- 76477 Zamek Hogwart: lekcje latania — StoneWars, „Top 10 der LEGO EOL-Sets 2026”
  (https://www.stonewars.de/news/top-10-lego-eol-sets-2026/, 30.09.2026): artykuł wskazuje
  jako EOL całe serie Harry Pottera „Zamek Hogwart” i „Ulica Pokątna”, wymieniając m.in.
  76477, 76445 i 76442. Z tych numerów **76477 nie ma w `wycofania.json`** — pozostałe
  wymienione w tekście (76442, 76445, 76447, 76452) już są. Sama dziesiątka z rankingu
  (75192, 42179, 40516, 75397, 10335, 21353, 40805, 21060, 31171, 60495) jest w pliku w całości.

→ Wycofania 2026-10-05: odrzucone (na razie). U źródła: 76477 występuje tylko w sekcji
„Extra-Tipp" jako prognoza redakcji StoneWars, nie oznaczenie LEGO; drugiego niezależnego
źródła brak (sprawdzono promobricks/web). Do tego 76477 to wg katalogu „Norbert: mały smok
Hagrida" (premiera VI 2026, widziany na listingu lego.pl 29.09) — nazwa z sygnału nie pasuje.
Wrócę do tematu, gdy potwierdzi drugie źródło albo LEGO oznaczy zestaw w sklepie.

## 2026-10-11 19:50 · CODE · Nowości, serie, przecieki — przebudowa widoków; prompt Scouta
- `/nowosci/`: przełącznik Nowości (w sprzedaży, z datą, ceną i zdjęciem; znaczek PREMIERA) / Zapowiedzi (potwierdzone + przecieki z plakietką). `#zapowiedzi` otwiera drugi widok.
- Strony serii: karuzela „Nasze propozycje” 3×3 (losowanie dzienne z bieżącej oferty LEGO) zamiast boksów „z aktualnymi cenami”; nad tabelą rok premiery, sortowanie, szukaj, „tylko w sprzedaży”.
- `/przecieki/`: karty na pełną szerokość, opis zwinięty do 5 linii. Nowe pole `opis` (dla czytelnika, jedyne na stronie); `uwagi` zostają notatkami Scouta. 13 opisów napisanych.
- Scout: trigger `trig_013FFv1Aaj5gsCrAn27emwih` (ta sama sesja i cron): reguła opis/uwagi dla przecieków (pkt 6a–c) i reguła „opisy zestawów dla czytelnika” (pkt 2). Poprzednie `trig_013QRUCfL8ZAa45eDkQUkWXD` i pośrednie `trig_01AdmJcGkJ949YB9p9JEAwhu` skasowane.
- Opisy zestawów w `sety.json`: 37 pól w 27 zestawach przepisanych bez języka roboczego (RUNBOOK, „Opisy zestawów w sety.json”). Sesja Scouta: 757 tys. z 1 mln tokenów — blisko progu 850 tys.

## 2026-10-11 10:40 · CODE · Dwie recenzje Piotra na stronie (75434 K-2SO, 42650 Sklep dla zwierząt)

**Zrobione:** DOCX (Recenzje_005, Recenzje_006) przez `import-artykul.py`, treść Piotra bez zmian (tytuły też).
Dodane: frontmatter (Recenzje, 11.10, seo_tytul/seo_opis, 3 FAQ z faktów w tekście), tabele cen w miejscu
`[TABELA CENOWA]`, linki do stron serii (Star Wars, Friends), zdjęcia: 75434 — 2, 42650 — 3. Galerie z Planety
Klocków w `galerie.json` (81 → 83: 7 + 12 zdjęć), od razu wgrane do R2 (19/19, 0 błędów).
Kontrola: RRP 379,99 / 169,99, 845 / 375 el., 10+ / 6+, premiery 08.2025 / 01.2025 — zgodne z danymi.
Rynek dziś: K-2SO 272,99 zł (ME, Allegro) — poniżej progu Piotra 290 zł; 42650 113,98 zł (Empik) — poniżej 120 zł.
Adresy: `/artykuly/lego-75434-droid-straznik-k-2so-recenzja/`, `/artykuly/lego-42650-sklep-z-akcesoriami-dla-zwierzat-recenzja/`.
**Stan:** na main.

## 2026-10-11 08:20 · RADAR · Do zrobienia

**faniklockow.pl · 10.10** — Pokazali 75419 Gwiazdę Śmierci na Amazonie za 3249 zł jako „historycznie najtaniej"; nasze dane to potwierdzają, bo najniższy wpis w całej naszej historii cen to 3599 zł (27.09, Allegro).
**Mamy?** — nie tak, jak powinniśmy: 75419 **nie jest zestawem śledzonym** w `sety.json`, więc nie wchodzi do bloku „Dziś w dobrej cenie", nie ma śledzonego minimum i nie może dostać postu dealowego — przy trzech ofertach u nas i RRP 4199,99.
**Zrobić:** — dopisać do śledzonych 19 zestawów dostępnych, po RRP od 1000 zł i z min. dwiema ofertami, których tam nie ma.
**Kto:** — Code (dane, strona), osobnym przebiegiem

Pełna lista najpilniejszych z tych 19, licząc rabat od ceny katalogowej z `katalog.json`
i najtańszej oferty z `oferty_feed.json`:

| Zestaw | RRP | Najtaniej u nas | Rabat | Ofert |
|---|---|---|---|---|
| 75640 Baratie (One Piece) | 1299,99 | 886,98 | −32% | 7 |
| 71043 Zamek Hogwart | 2049,99 | 1509 | −26% | 5 |
| 43263 Zamek z Pięknej i Bestii | 1199,99 | 921,94 | −23% | 4 |
| 21359 Włoska riwiera (Ideas) | 1199,99 | 957,58 | −20% | 4 |
| 76457 Hogsmeade – edycja kolekcjonerska | 1649,99 | 1424,51 | −14% | 3 |
| 75419 Gwiazda Śmierci | 4199,99 | 3599 | −14% | 3 |

Blok „Dziś w dobrej cenie" iteruje po `sety.json`, więc żadnego z nich nie widzi.
Przy progu 15% i obowiązkowych kategoriach cztery pierwsze kwalifikowałyby się od razu.

**Dlaczego nie robię tego w tym przebiegu:** każdy dopisany zestaw potrzebuje notki
`dla_rodzica` i `dla_afol` — bez nich hub jest ubogi i nie łapie progu 300 znaków
tekstu redakcyjnego z `src/lib/seo.js`. Dziewiętnaście zestawów to osobne zadanie,
nie doklejka do Radaru, który ma działać zwięźle.

**Uwaga metodologiczna, żeby nikt nie powtórzył mojego błędu.** Pierwsza miara, którą
policzyłem, była fałszywa: 5688 zestawów „bez ceny katalogowej w `ceny_baza.json`"
i prawie zgłosiłem to jako dziurę w danych. To nie dziura, a **zaprojektowany zakres**:
`oferty_feed.json` jest migawką dla wszystkich setów z feedów (miniatury, tabele cen
w hubach), a `sety.json` i `ceny_baza.json` obejmują zestawy śledzone — mówi to wprost
`_meta` samego `oferty_feed`. Tych dwóch populacji nie wolno porównywać jak równych.

→ zamknięte 14.10.2026: 18 zestawów dopisanych do sety.json (z 19 jeden wypadł z kryterium) z opisami dla czytelnika na faktach z Brickset API i ofertami z feedu.

## 2026-10-10 18:00 · CODE · Archiwizacja dziennika nie wywozi już otwartych zadań

`scripts/archiwum-dziennika.mjs` zatrzymuje w dzienniku (niezależnie od wieku) wpis
„RADAR · Do zrobienia", dopóki pod nim jest mniej linii „→ zamknięte" / „→ Wycofania"
niż pozycji ze „Zrobić" innym niż „nic", oraz wpis „SCOUT · …wycofa…" bez żadnego
zamknięcia (propozycja Kontrolera 05.10, decyzja Marka 10.10). Cztery zadania wywiezione
05.10 wróciły z `materialy/dziennik-archiwum-2026-09.md` na koniec dziennika
(RADAR 16, 17, 18.09 i SCOUT 16.09).
**Dla drugiej strony:** runner Wycofań — w RADAR 16.09 czeka pozycja dla Ciebie
(21333, 21351, 21353, 21356, 76437: status „przewidywane" → sprawdzić, czy LEGO potwierdziło).
Zadanie zamyka się linią „→ Wycofania <data>: …" pod wpisem, tak jak przy sygnałach Scouta.

## 2026-10-10 16:30 · CODE · x-kom (aplikacja) i Media Expert (kod do 31.10): dwie aktualności + kody przy cenach

- `/artykuly/x-kom-aplikacja-weekend-lego-pazdziernik-2026/` – akcja tylko w aplikacji x-kom
  9–11.10 (mail SalesMasters): 9 zestawów, 7 rekordów notowań. Ceny tylko w aplikacji, więc
  NIE dopisane do tabel hubów.
- `/artykuly/media-expert-kod-lego-pazdziernik-2026/` – kod ME0110-311026 do 31.10 (64 zestawy
  z ceną, 45 rekordów wobec minimów sprzed 1.10, 5 taniej gdzie indziej) + PNU0910-1510 do
  15.10 (42239, 60511). Pełna tabela 64 pozycji.
- Odkrycie: ceny ME w naszych tabelach to ceny PO kodzie, a nigdzie nie było kodu – w listingu
  /promocje-lego/ dotyczyło to 47 ze 150 pozycji. Nowy `src/data/kody_rabatowe.json`
  (`scripts/me-kody.mjs`) + `kodRabatowy()` w `src/lib/oferty.js`: kod przy cenie w tabeli
  cen, pasku ceny, /promocje-lego/ i na głównej. RUNBOOK → „Kody rabatowe Media Expertu".
- Lista „tylko w Media Expert" z maila (13 zestawów) – nie pisaliśmy o wyłączności: 6 z nich
  sprzedaje też Empik, prawie wszystkie Allegro. Kalendarz 60510 – ME 84,99 zł, nie najtaniej
  (Ceneo 76,97 zł), bez osobnego tekstu.
**Dla drugiej strony:** gdy ME ogłosi nowy kod – `node scripts/me-kody.mjs`.

## 2026-10-10 08:20 · RADAR · Do zrobienia

**faniklockow.pl · 09.10** — Pokazali Proshop z dwoma wycofywanymi zestawami Star Wars taniej, niż mamy u siebie: 75397 Barka Jabby za 1639 zł i 75382 Tie Interceptor za 769 zł (plus ok. 20 zł wysyłki).
**Mamy?** — częściowo: oba zestawy są w `wycofania.json` i mają huby, ale najtańsze ceny, jakie pokazujemy, to Ceneo 1699 i Ceneo/Allegro 829 — o 60 zł wyżej na każdym.
**Zrobić:** — ponaglić zgłoszenie afiliacyjne do Proshopu przez Awin (status „wysłane" od 19.08.2026; feed Create-a-Feed co godzinę, prowizja 3%, cookie 30 dni).
**Kto:** — Marek (decyzja)

Dlaczego tego nie domykam sam: **ręcznie wpisanych cen Proshopu nie dodaję.** Bez
zaakceptowanego programu nie mamy feedu, czyli nie ma czym ich odświeżać, a jedna
wklejona kwota zestarzeje się w tydzień i zacznie kłamać na hubie. To ta sama
zasada, przez którą ceny trzymamy wyłącznie ze źródeł z harmonogramem odświeżania.

Różnica wobec sprawy Amazona z 07.10, którą świadomie odłożyłem: tam decyzja była
**zamknięta** w rejestrze („wracać przy realnej sprzedaży z serwisu"), a tu status
to **„wysłane"** — czekamy na odpowiedź Awina siódmy tydzień i można ją ponaglić.
Moment jest zły: siedem tygodni przed Black Friday nie mamy dostępu do sklepu,
który bije naszą najtańszą ofertę na dwóch zestawach z listy wycofań.

Czego NIE przepisałem: ich twierdzenia o statusie EOL tych dwóch zestawów. Sami
piszą, że LEGO nie wymienia ich w dziale „ostatnie sztuki", a wniosek wyciągają
z własnych źródeł — u nas oba i tak są już w `wycofania.json`, więc nic nie zmieniam.

→ zamknięte 14.10.2026: decyzja Marka — Proshop ponaglimy, gdy wzrośnie ruch; do tego czasu bez zmian (rejestr: „wysłane”).

## 2026-10-09 09:05 · CODE · Skutek CRO po 14 dniach (kliki-raport, Routine z 25.09)

Ruch ludzki z Analytics Engine (`blob6 = human`, bez bota z refererem `/zestaw/x/`),
źródło kliknięcia = referer (`blob4`). Okna: 11–25.09 (przed) i 25.09–9.10 (po,
CRO na produkcji od 25.09, commit 4153c05).

| | przed 11–25.09 | po 25.09–9.10 |
|---|---:|---:|
| łącznie | 139 | 95 |
| huby `/zestaw/` | 105 (76%) | 62 (65%) |
| prezentowniki | 0 | 4 (wszystkie z `/prezentowniki/lego-technic/`) |
| posty dealowe | 3 | 1 |
| strona główna | 8 | 10 |
| artykuły | 7 | 8 (6 z recenzji 60508) |
| /promocje-lego/ + /deale/ | 2 | 5 |
| bez referera | 14 | 2 |

**Spadek 139 → 95 nie jest skutkiem CRO.** Okno „przed” zawiera skok 14–16.09
(87 kliknięć w trzy dni, m.in. 14 bez referera i 10 na 76354). Bez niego „przed”
to ok. 6 kliknięć dziennie, „po” ok. 6,8 (bez skoku 27.09: ~5). Czyli poziom
płaski, a zmienił się rozkład: pierwsze kliknięcia z prezentowników (cel C),
więcej z głównej i /promocje-lego/, mniejszy udział hubów. Allegro nie zniknęło —
6098 ofert w feedzie z datą 08.10, najtańsze w 4515 zestawach, 28 kliknięć w oknie
„po” — więc nie jest czynnikiem. Liczby odsłon (mianownika konwersji) nie
sprawdzałem; bez niego nie da się powiedzieć, czy CTR hubów wzrósł.
**Dla drugiej strony:** nic.

## 2026-10-09 08:35 · RADAR · Do zrobienia

**fanklockow.pl · 08.10** — Na LEGO.pl trwa nieogłoszona publicznie promocja: przy zakupach od 450 zł gratis do wyboru, 40772 Świecący duszek albo 40760 BrickHeadz z Fortnite.
**Mamy?** — nie mieliśmy tego okna w kalendarzu.
**Zrobić:** — ZROBIONE: nowa sekcja `/kalendarz-promocji-lego/#gratis-pazdziernik` ze statusem „przewidywane" plus wpis w liście „co trwa teraz".
**Kto:** — Code (dane, strona)

**tylkoklocki.pl (znalezione przy okazji)** — Lista „co trwa teraz" pokazywała wrześniowe gratisy halloweenowe jako „trwa", dziewięć dni po zamknięciu okna.
**Mamy?** — tak, i to właśnie było błędem.
**Zrobić:** — ZROBIONE: oba wpisy przestawione na „zamknięte".
**Kto:** — Code (dane, strona)

**Reguła na każdy kolejny przebieg Radaru:** listę „co trwa teraz" na górze
kalendarza trzeba za każdym razem **sprawdzić pod kątem dat**, a nie tylko dopisywać
do niej nowe okna. Strona, której całym zadaniem jest mówić, co trwa dzisiaj,
kłamała w pierwszym bloku przez dziewięć dni i żaden przebieg tego nie zauważył,
bo wszystkie patrzyły tylko na to, co nowego u konkurencji.

Status nowego okna jest „przewidywane" świadomie: LEGO nie ogłosiło tej promocji
(serwis branżowy nazywa ją „sekretną"), końca nie podaje nikt, a warunki mamy
z jednego źródła. W sekcji jest arytmetyka z naszych danych — 40772 chodzi od
69,99 zł (Allegro), 40760 od 129,43 zł — czyli próg 450 zł ma sens tylko dla kogoś,
kto i tak kupuje powyżej tej kwoty. To ta sama reguła, którą wczoraj wpisałem
do FAQ po gratisie w Media Expert.

Druga rzecz do pilnowania: faniklockow założył aktualizowaną listę gratisów GwP
na 2026 i jego październik zgadza się z naszym co do joty (13–19.10, 40909 od 745 zł).
**To nie jest potwierdzenie** — oni też oznaczają te dane jako niepewne, więc mamy
dwie prognozy, nie potwierdzenie od LEGO. Nasz status „przewidywane" zostaje.

→ zamknięte 13.10.2026: sekcja `#gratis-pazdziernik` dodana w przebiegu Radaru 09.10.
→ zamknięte 13.10.2026: wrześniowe gratisy przestawione na „zamknięte” w przebiegu Radaru 09.10.

## 2026-10-08 08:30 · RADAR · Do zrobienia

**faniklockow.pl · 07.10** — Opisali gratis progowy w Media Expert: 43018 Lionel Messi za zakupy od 2500 zł, promocja zamknęła się tego samego wieczoru.
**Mamy?** — nie, i co gorsza nasze FAQ twierdziło nieprawdę: „gratisy GWP i punkty Insiders dotyczą tylko oficjalnego sklepu LEGO".
**Zrobić:** — ZROBIONE w tym przebiegu: FAQ w `/kalendarz-promocji-lego/` poprawione i dołożona reguła o realnej wartości gratisu.
**Kto:** — Code (dane, strona)

Co dokładnie weszło do FAQ: punkty Insiders faktycznie są wyłącznie w sklepie LEGO,
ale gratisy progowe potrafią zrobić i sklepy zewnętrzne — z datą i przykładem.
Plus reguła, która wychodzi z naszych własnych danych: **wartość gratisu podaje się
w cenie katalogowej, nie rynkowej.** 43018 ma w cenniku 779,99 zł, a 07.10 chodził
od 398,97 (Ceneo), 414,98 (Allegro) i 449,99 w samym Media Expert — czyli realna
korzyść z progu 2500 zł to około 400 zł, nie 780.

**Obserwacja o metodzie,** bo zdarzyło się to drugi raz w tym tygodniu: publikacja
konkurencji przydała się nie jako temat do napisania, ale jako **lista twierdzeń do
sprawdzenia u siebie** (06.10 w ten sam sposób wyszło „piątej serii" w bloku BLDP).
Warto czytać ich teksty również w ten sposób — zapisane też w `_meta` bazy.

→ zamknięte 13.10.2026: FAQ kalendarza poprawione w przebiegu Radaru 08.10.
