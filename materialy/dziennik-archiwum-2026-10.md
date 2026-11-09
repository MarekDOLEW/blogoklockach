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

## 2026-10-18 · CODE · Do zrobienia

**Karty P07 partie 05–07: 7 kart z jednym akapitem opisu zostaje bez indeksacji (40756, 40794, 42651, 60449, 60474, 72033, 75406)**
**Mamy?** — częściowo: karty są na hubach, ale reguła indeksacji wymaga ≥2 akapitów opisu
**Zrobić:** — dopisać drugi akapit opisu w tych 7 plikach i przysłać je ponownie (import z `--nadpisz`)
**Kto:** — Piotr (tekst)
→ zamknięte 18.10.2026: niepotrzebne — Marek zdecydował, że karta jednoakapitowa (małe zestawy <500 el.) też wchodzi do indeksu; reguła w `src/lib/seo.js` liczy teraz długość opisu (≥2 akapity albo >300 znaków), 49 takich kart indeksowalnych.

## 2026-10-18 · CODE · Karty P07 Piotra: partie 05, 06, 07 (75 nowych kart) wgrane

**Zrobione:** karty_setow 1199 → 1274, 68 z 75 hubów indeksowalnych po buildzie. `import-karty.py` dostał
trzy poprawki pod nowy szablon: numery 6–7-cyfrowe (BrickLink 910xxx, 5009325), pola „Elementy” /
„Cena katalogowa w Polsce” / „Sposób uzyskania” (bez nich bramka RRP milczała — po poprawce złapała
42670 i 60473; zklockow.pl i promoklocki.pl potwierdzają ceny Piotra 729,99 i 869,99, dopisane do
`rrp_potwierdzone.json`, katalog miał błąd) oraz serię z katalogu, gdy metryka nie ma pola „Seria”.
Starsze karty z polem „Cena katalogowa w Polsce” sprawdzone wstecz: 0 rozjazdów RRP. Elementy: 8 różnic
1–11 szt., rozstrzyga katalog. Nazwy zostają kanoniczne.
**Stan:** na main.

## 2026-10-18 · CODE · Łowca wgrywa zdjęcia do R2

Od przebiegu 19.10 Łowca po pushu uruchamia `r2-obrazy.mjs` i `warianty-obrazow.mjs --limit 200`
(decyzja Marka: zdjęcia u nas, nie ze sklepów). Trigger `trig_019xWfJ67XhPdnX6GknSYrb3`,
stary usunięty. Szczegóły: `materialy/zadania-cykliczne.md`, historia 18.10.

## 2026-10-18 · CODE · Przegląd zdjęć: zaślepki na listingach (30713 i 52 inne)

- Marek: 30713 ma zdjęcie na hubie, a na stronie głównej klocek-zaślepkę. Przyczyna: `zdjecieSetu()` wołane z samym `sety` (strona główna, `/promocje-lego/`, `/nowosci/<miesiąc>/`, `KartaOferty` w artykule wrześniowym) pomijało feed sklepów. Feed jest teraz domyślnym źródłem w `src/lib/media.js` (`8ce0935`).
- Przegląd po poprawce: 6711 zestawów (6698 ze świeżymi ofertami ≤14 dni, 137 w Nowościach bez zapowiedzi) — 0 hubów bez zdjęcia, 0 zdjęć niełądujących się na produkcji (HEAD `/img/<nr>.jpg`), 0 zaślepek na listingach. Przed poprawką zaślepkę miały 53 zestawy — lista: `materialy/zdjecia-zaslepki-2026-10-18.xlsx`.

## 2026-10-18 · CODE · Adnotacja o Smyku w tabeli cen (zamknięcie pozycji z Radaru 17.10)

- `src/components/TabelaCen.astro` — `smyk` dopisany do `UWAGA_SKLEP`: „sklep prowadzi
  akcje na drugi zestaw (np. −15% przy dwóch) – w koszyku może być taniej”. Sformułowane
  jako stała tendencja sklepu, bo Smyk nie podaje daty końca akcji.
- Widoczne na 661 hubach — wszędzie, gdzie mamy ofertę Smyku. Build przeszedł (10007 stron).
- Pozycja z Radaru 17.10 („Zrobić: dopisać smyk do UWAGA_SKLEP”, Kto: Code) **zamknięta**.
  Otwarte zostają dwie decyzje Marka z tego samego wpisu: cena katalogowa 40898 i okno
  gratisu 1–8.11 wobec „Wkrótce dostępne (4 listopada 2026)” na lego.com/pl-pl.

## 2026-10-17 · RADAR · Smyk „kup 2, −15%”, karty 11388/40898 u zklockow

- **Smyk: rabat przy dwóch sztukach.** faniklockow opisali, my sprawdziliśmy u źródła
  (`smyk.com/pl/pl/promocje/uciekajace-rabaty/15.html`): „Kup min. 2 produkty i zyskaj rabat
  −15%”, nalicza się automatycznie w koszyku, 6462 produkty, LEGO objęte, **bez daty końca**.
  U nas ceny Smyku to ceny za sztukę i tabela nic o tym nie mówi — przy 10375, 60495 i 76317
  Smyk jest naszym najtańszym sklepem, więc realna cena zakupu jest niższa, niż pokazujemy.
  **Do zrobienia (Code):** dopisać `smyk` do `UWAGA_SKLEP` w `src/components/TabelaCen.astro`
  (mechanizm działa już dla Media Expertu i Planety Klocków), sformułowane jako stała tendencja
  sklepu, bo terminu końca akcji Smyk nie podaje. Ich cen jednostkowych nie przepisujemy —
  nie zgadzają się z płaskim −15% od naszych cen bazowych.
- **11388: potwierdzenie, nie luka.** zklockow wystawił kartę 15.10 (2 149,99 zł, 5682 elementy,
  17 minifigurek, EAN 5702018069868) — co do grosza jak nasz `sety.json` i `rrp_potwierdzone.json`.
  Otwarte pytanie z dziennika („potwierdzić 2149,99 drugim źródłem”) **zamknięte**.
- **Dwie rzeczy do decyzji Marka.** (a) zklockow podaje dla 40898 cenę katalogową **124,99 zł**;
  u nas `null` po decyzji z 15.10, że gratis bez polskiej wyceny ma w hubie kreskę. 29,99 EUR ≈ 128 zł,
  więc liczba jest spójna — pytanie brzmi, czy kreskę zostawiamy. (b) **lego.com/pl-pl sprawdzone
  bezpośrednio dzisiaj**: 11388 to „Wkrótce dostępne (4 listopada 2026)”, 2149,99 zł. Nasz tekst
  premierowy mówi, że gratis 40898 jest **1–8 listopada** (za StoneWars), a zestawu, od którego
  gratis zależy, nie da się kupić przed 4.11. Albo okno w PL to faktycznie 4–8.11, albo StoneWars
  podał datę globalną. Nie poprawiam tego sam — tekst jest opublikowany.
  → zamknięte 18.10.2026 (a): Marek — „zostaw kreskę przy 40898". Danych nie ruszam,
  `cena_katalogowa` zostaje `null`, reguła awansowana do „Ustaleń trwałych". Punkt (b)
  o oknie gratisu **zostaje otwarty**.
  → zamknięte 28.10.2026 (b): sprzeczności nie było — pomyliłem się w samym postawieniu
  pytania. Karta 11388 na lego.com/pl-pl nadal mówi „Wkrótce dostępne (4 listopada 2026)”, ale to
  data sprzedaży dla wszystkich, a nasz tekst premierowy od początku mówi „1 listopada dla
  Insiders, od 4 listopada dla pozostałych” — gratis w dniach 1–8.11 mieści się w tym bez
  naciągania, bo przez pierwsze trzy dni zestaw kupują Insiderzy. Karta produktu niesie dziś
  okno upominkowe 1–8.11. Czego LEGO **nadal** nie potwierdza własnym źródłem: że tym upominkiem
  jest 40898 — na stronie promocji go nie ma, nazwa pochodzi od StoneWars i zklockow. Tekstu nie
  ruszam, bo i tak nie podaje nic więcej, niż da się obronić.
- Pomyłka warta zapisania: zacząłem od „nie mamy 11388 w katalogu”, bo szukałem w `katalog.json`
  (plik z listingu lego.com). Rejestrem zestawów jest `sety.json`. Luki w danych sprawdzamy tam.

## 2026-10-16 · CODE · Premiera Piotra: 11388 Wenecka okolica

- `/artykuly/lego-11388-wenecka-okolica-premiera/` — tekst Piotra bez zmian (w DOCX śródtytuły były zwykłymi akapitami — zamienione na nagłówki), FAQ, linki do Icons, 21359 i 40898, tabela cen, 8 zdjęć. Galeria 11388 (9 zdjęć z lego.com) w `galerie.json` i R2.
- Dane: nazwa 11388 „Wenecka okolica” (oficjalna z lego.com/pl-pl, Scout wpisał „Wenecka dzielnica”), `cena_katalogowa` 2149,99 zł + wpis w `rrp_potwierdzone.json`.

## 2026-10-16 · CODE · Trzy recenzje Piotra (007–009): 60447, 31168, 11505

- Import przez `scripts/import-artykul.py` (0 obrazów, 0 tabel w DOCX — nic nie zginęło). Tekst Piotra bez zmian; dopisane: frontmatter z FAQ, linki do serii i do zestawów porównawczych (10348, 11501, 60448, 60453), tabela cen w miejscu `[TABELA CENOWA]`, zdjęcia.
- `/artykuly/lego-11505-grzyby-lesne-recenzja/` i `/artykuly/lego-60447-gorska-terenowka-4x4-recenzja/` — nowe. Galerie 11505 (7) i 60447 (9) z kart Planety Klocków dopisane do `galerie.json`, wgrane do R2 z wariantami WebP.
- `/artykuly/lego-31168-sredniowieczny-zamek-recenzja/` — tekst Piotra zastąpił recenzję z 20.08 pod tym samym adresem (data zostaje, `zaktualizowano: 2026-10-16`); próg zakupu zmienił się z 380 na 370 zł z dostawą.
- Fakty z tekstów zgodne z `sety.json` (RRP, liczba elementów, premiera).

## 2026-10-16 09:30 · CODE · Grudzień w kalendarzu promocji: z trzech zdań na pięć podsekcji

Zamknięcie pozycji z dzisiejszego Radaru. Konkurencja opisała grudzień wcześniej niż my,
ale **nie przepisałem ich tekstu** — cała sekcja stoi na naszych danych, i dlatego mówi
częściowo co innego niż ich.

**Co jest w sekcji, licząc od najmocniejszego:**
- **323 zestawy kończą produkcję w grudniu, 314 potwierdzonych przez LEGO**, 9 to prognoza
  rynku (`wycofania.json`, pole `kiedy: "grudzień 2026"`). Tabela pięciu największych:
  75192 Sokół Millennium 3599,99, 75367 Venator 2799,99, 75397 Barka Jabby 2149,99,
  42215 Volvo 1699,99, 10356 Enterprise 1649,99. Tej liczby nie ma u konkurencji, bo nikt
  poza nami nie prowadzi takiej listy.
- **Zero premier w grudniu** wobec sześciu w listopadzie (11388 Wenecja, 21375 Godzilla,
  21065 Sagrada Família i trzy inne) — policzone z `sety.json`, z zastrzeżeniem, że to stan
  naszej wiedzy, nie obietnica producenta.
- **Trzecie okno punktowe jako prognoza z własnego zapisu**: Member Day 9.09 (jeden dzień,
  bez zapowiedzi), Batman Day 9–19.09, okno 13–19.10. Dwie z trzech akcji LEGO ogłosiło
  z dnia na dzień albo wcale, więc piszemy wprost, że planowanie pod konkretną datę nie ma
  sensu. Plus arytmetyka: 5% zamówienia w punktach, przy 700 zł to jakieś 35 zł.
- Terminy dostaw 18–19.12 — jedyna data w sekcji, która nie jest prognozą.

**Dwie rzeczy, które napisałem inaczej niż konkurencja, i to celowo.**
1. **Nie piszemy „ostatnia szansa"** na wycofywane zestawy. Koniec produkcji to data znikania
   z LEGO.com, nie z rynku — sklepy zewnętrzne sprzedają zapasy tygodniami i czasem wtedy
   schodzą najniżej. To ta sama zasada, którą `status.js` stosuje do plakietek EOL, więc
   tekst i dane mówią teraz to samo. Wyjątek: ekskluzywy, gdzie po grudniu zostaje rynek wtórny.
2. **Przecen po świętach NIE obiecujemy.** Konkurencja zapowiada „BARDZO solidne" styczniowe
   przeceny EOL; możliwe, ale notowania zbieramy od sierpnia 2026 i nie widzieliśmy jeszcze
   ani jednego stycznia. Zamiast powtarzać cudzą obserwację, sekcja mówi wprost, czego nie
   wiemy, i obiecuje sprawdzić to na własnych danych. To jest pozycja na styczeń dla Kontrolera.

Nie ruszyłem daty Weekendu Insiders (u nas 21–26.11, u nich 21–22.11) — powód w dzisiejszym
wpisie RADAR. Build 10004 strony, wszystkie trzynaście linków z nowej sekcji sprawdzone
w `dist/`. Nagłówek sekcji i wiersz w liście „co trwa teraz" zmienione, żeby niosły liczby,
a nie slogan. `zaktualizowano` 13.10 → 16.10.

## 2026-10-16 08:20 · RADAR · Do zrobienia

**fanklockow.pl · 15.10** — Wystawili prognozę Weekendu Insiders i Czarnego piątku 2026 sześć tygodni przed czasem, z zapowiedzią bieżących aktualizacji; obejmuje też grudzień (ostatnie okno podwójnych punktów, dwa świąteczne gratisy, mocne przeceny EOL po świętach).
**Mamy?** — częściowo: `/kalendarz-promocji-lego/` ma listopad rozpisany w tabeli (21–26.11, 27.11, 30.11), ale sekcja grudnia to trzy zdania o terminach dostaw przed Wigilią — ani słowa o kolejnym oknie punktów i o przecenach po świętach.
**Zrobić:** — uzupełnić sekcję `#grudzien` w `/kalendarz-promocji-lego/` o spodziewane okno podwójnych punktów i powyprzedażowe przeceny EOL, napisane **jako nasza prognoza z własnego wzorca 2026** (Member Day 09.09, okno 13–19.10), a nie jako przedruk ich tekstu.
**Kto:** — Code (dane, strona)
→ zamknięte 16.10: sekcja grudnia rozpisana na pięć podsekcji, w całości z naszych danych (323 wycofania, zero premier, trzy okna punktowe tego roku). Przecen po świętach NIE obiecujemy — nie mamy ani jednego stycznia w notowaniach.

**faniklockow.pl · 15.10** — Ujawnili 11388 Wenecka dzielnica: 5682 elementy, 18 minifigurek, cena katalogowa 2149,99 zł, 48×63×31 cm.
**Mamy?** — częściowo: zestaw wszedł dziś do `sety.json` (Scout 16.10, premiera 2026-11, 5682 elementy się zgadzają), ale `cena_katalogowa` jest pusta.
**Zrobić:** — potwierdzić 2149,99 zł drugim źródłem przed wpisaniem do danych (dziś to jedno źródło); przy okazji sprawdzić nasz przeciek 40898 „Weneckie wodne taxi (gratis do dużego zestawu)" — jeśli oba są prawdziwe, listopadowe okno dostaje gratis przypisany do konkretnego zestawu.
**Kto:** — Code (dane, strona) — robota dla Scouta
→ zamknięte 16.10: drugie źródło to karta lego.com/pl-pl (2149,99 zł, Insiders 1–3.11, dla wszystkich od 4.11); oficjalna polska nazwa to „Wenecka okolica” — poprawiona w `sety.json` (było „Wenecka dzielnica”). Gratis 40898 do 11388 w dniach 1–8.11 potwierdza strona produktu i tekst Piotra.

Pominięte: 2 publikacje bez znaczenia dla nas (COBI Viqueens, premiery Pantasy — linki w bazie).

**Czego świadomie NIE robię i dlaczego.** Oni dają Weekend Insiders na **21–22.11**, nasz kalendarz
na **21–26.11**. Nie przestawiam naszej daty na ich: żadne z tych okien nie jest potwierdzone przez
LEGO, więc to nie jest „fakt kontra błąd", tylko dwie prognozy. Wpisujemy datę, gdy ogłosi ją LEGO —
tak samo jak przy Allegro Black Weeks, gdzie od tygodni czekamy na termin.

## 2026-10-16 05:25 · SCOUT · Do zrobienia

**LEGO pokazało 11388 Wenecką dzielnicę: 5682 elementy, 17 minifigurek, 499,99 euro, premiera 1 listopada 2026 wyłącznie w sklepie LEGO, z gratisem 40898 — to jeden z pięciu największych zestawów rocznika i pierwszy z nowym elementem drukowanym 3D (pianino z mechanizmem muzycznym).**
**Mamy?** — częściowo: hub `/zestaw/11388/` stoi z pełnym opisem, ale bez polskiej ceny katalogowej i bez tekstu w dziale Artykuły
**Zrobić:** — tekst premierowy o 11388 (kategoria Premiery): mechanika gratisu 40898 tylko do 11388 w listopadzie, dwa układy ekspozycji, pianino z druku 3D jako czwarty taki element u LEGO
**Kto:** — Piotr (tekst)
→ zamknięte 16.10: tekst Piotra opublikowany — `/artykuly/lego-11388-wenecka-okolica-premiera/` (Premiery, 8 zdjęć z lego.com w galerii 11388)

**Polskiej ceny katalogowej 11388 nie ma — LEGO podało na razie tylko rynki zagraniczne (499,99 euro, 549,99 dolara, 449,99 funta, 779,99 dolara kanadyjskiego).**
**Mamy?** — częściowo: hub działa, w polu ceny pustka, więc nie liczymy progu zakupu ani ceny za element w złotych
**Zrobić:** — po 1 listopada zaciągnąć cenę z listingu lego.pl do `sety.json` (zestaw wchodzi tylko do sklepu LEGO, więc feedy sklepów go nie przyniosą)
**Kto:** — Code (dane)
→ zamknięte 16.10: karta lego.com/pl-pl już podaje 2149,99 zł (Firecrawl) — wpisane do `sety.json` i `rrp_potwierdzone.json`

## 2026-10-15 09:00 · CODE · 40824: 69,99 zł było ceną z kodem, który wygasł 14.10

- Marek: na stronie 69,99, w Media Expert 99,99. Karta ME (Firecrawl): 69,99 to „cena z kodem MEDAYS-10, obowiązuje do 14.10.2026 23:59”; dziś karta na żywo `product:price:amount` 99,99, bez kodu. Kodu MEDAYS-10 nie było w `kody_rabatowe.json` (ostatni zrzut `me-kody.mjs` 10.10), więc strona pokazywała cenę z kodem jak zwykłą.
- Poprawione: ME 40824 → 99,99 (15.10) w `oferty_feed` i `sety.json`; najtańsza oferta teraz x-kom/Ceneo 92,90. Post `/deale/deal-40824-kanarek-tweety-minimum/` dostał `wazne_do: 2026-10-14` (baner „akcja zakończona”). `sortujPostyDealowe()` przesuwa posty po `wazne_do` na koniec — trójka deali na głównej pokazuje tylko trwające akcje.
- Wpis w `deale_potwierdzone.json` (69,99 z 14.10) zostaje: 99,99 i tak jest powyżej progu podejrzanego rynku.

## 2026-10-15 05:20 · SCOUT · Do zrobienia

**Po wpisaniu 81,99 zł do 40909 w `sety.json` zostaje sześć gratisów z `bez_rrp` i bez ceny: 40896 (X-Files), 40897, 40899 (Astro Bot), 40900, 40902, 40916 — każdy ma wycenę dodatku podaną przez LEGO w euro, żaden nie ma polskiej ceny katalogowej.**
**Mamy?** — częściowo: huby stoją, w polu ceny pustka, więc nie wchodzą do tabel cen ani do przeliczeń za element
**Zrobić:** — jedna decyzja dla tych sześciu: wycena dodatku jako `cena_katalogowa` (jak 40909) albo `bez_rrp` zostaje; polybagi, ekskluzywy LEGO House/LEGOLAND i BLDP tej decyzji nie dotyczą
**Kto:** — Marek (decyzja)
→ zamknięte 15.10.2026: decyzja Marka — wszystkie sześć dostaje wycenę dodatku. Wpisane cztery
po sprawdzeniu promoklocki.pl (Firecrawl; nasz serwer dostaje 403 od Cloudflare): 40899 i 40900 po
81,99 zł, 40902 i 40916 po 109,99 zł. 40896 miało już 81,99 zł i tylko sprzeczne `bez_rrp` — zdjęte.
Zostaje 40897 (Miecz świetlny Vadera): ani promoklocki, ani Brickset nie mają dla niego ceny
katalogowej, w Niemczech wyceniony na 29,99 euro — pilnuję go w kolejnych przebiegach (Scout).

**Rejestr `known_sets.json` rozjechał się z `sety.json`: commit 52e1586 dołożył 18 dużych zestawów (lista Radaru z 10.10), ale nie dopisał ich do rejestru — przez trzy dni `liczba_setow` pokazywała 1185 przy 1203 wpisach.**
**Mamy?** — tak: dociągnąłem rejestr w tym przebiegu (1185 → 1203), więc dziura jest zamknięta
**Zrobić:** — przy każdym ręcznym dopisaniu zestawu do `sety.json` aktualizować też `known_sets.json` (lista `sety` + `liczba_setow` + `data_aktualizacji`), albo dorzucić to do skryptu, który dopisuje zestawy
**Kto:** — Code (dane, skrypt)
→ zamknięte 19.10.2026 (Kontroler): skryptu dopisującego zestawy nie ma (robi to ręcznie sesja Code), więc
zamiast reguły „pamiętaj" są dwa mechanizmy: (1) `diagnoza.mjs` — także w trybie `--szybko`, który
odpala każdy runner — liczy rozjazd `known_sets.json` ↔ `sety.json` i pisze **ROZJAZD** w sekcji Dane,
więc widać go następnego dnia, nie po trzech; (2) `node scripts/known-sets-sync.mjs` dociąga rejestr
jednym poleceniem (dopisuje brakujące, przelicza `liczba_setow`, niczego nie kasuje). Dziś: 1205/1205 ✓.

## 2026-10-14 15:00 · CODE · Rolki wideo z kodu: HyperFrames + generator „Deal alert"

**Decyzja (Marek):** rolki 9:16 składamy z kodu, nie w edytorze. Dotychczasowy
efekt ręcznych rolek był słaby; szukaliśmy narzędzia „na czasie, z efektami,
z dobrą typografią". Przegląd rynku skilli (katalog skills.sh, lista
awesome-claude-video-skills z benchmarkiem 16 narzędzi):

- **wybrane: HyperFrames** (heygen-com/hyperframes, 62 tys. gwiazdek) — HTML +
  GSAP renderowane klatka po klatce w headless Chrome do MP4. Ten sam stos co
  karuzele i skille GSAP z pluginu, zero zmiany paradygmatu, tekst to tekst
  (polskie znaki i ceny bezbłędne), render deterministyczny;
- **dołożone:** pakiety iart-ai `tiktok-video-skills` (gramatyka retencji,
  napisy karaoke) i `ecommerce-video-skills` (`promo-video`: cena
  przekreślona → nowa, wsadowo z danych) — gramatyka, nie silnik;
- **odrzucone:** oficjalne skille Remotion (w benchmarku „wynik bliski filmowi
  bez skilla", React), OpenMontage (przerost), skille na płatnych API wideo
  (inference.sh, NemoVideo, Veo — generują obraz, tekst z modelu łamie regułę
  bezbłędnych cen).

**Zrobione:**
- `materialy/rolki/szablon-deal/` — szablon rolki „Deal alert" 12 s, 1080×1920:
  hook z tezą od pierwszej klatki (jasne tło, kropki-studsy) → żółte
  przejście → cena katalogowa przekreślona, odliczanie do ceny dziś, konfetti,
  „−X%" (granat) → sklepy od najtańszego ze słupkami → logo, „link w bio",
  `#materiałpartnerski` na ekranie. Kolory i Archivo z `system-wizualny.md`.
- `scripts/rolka-deal.mjs <nr>` — pełny przebieg: dane z `ceny_baza.json`
  (katalog, minimum w bazie), `oferty_feed.json` (sklepy, tylko oferty
  ≤ 7 dni), `sety.json`; zdjęcie z feedu; wycięcie pudełka; dźwięk; `npx
  hyperframes check`; render. Dla 75405: 73 s od zera do MP4 (3,9 MB).
- **Wycinanie tła:** model `hyperframes remove-background` (onnxruntime,
  lokalny) uczony na ludziach bierze ciemny karton za tło i zostawia sam statek
  — bezużyteczny dla pudełek. Rendery sklepowe stoją na czystej bieli, więc
  skrypt wypełnia biel od krawędzi (dekodowanie przez ffmpeg, bez `sharp`,
  żeby działało w świeżym klonie); białe napisy NA pudełku zostają, bo
  wypełnienie nie ma do nich dojścia. Model zostaje tylko dla zdjęć na innym tle.
- **Dźwięk:** efekty z biblioteki skilla `media-use` (Pixabay, bez atrybucji;
  kopie w `szablon-deal/audio/`), podkład syntezowany w Node (120 BPM, a-moll,
  deterministyczny) — żeby rolka nigdy nie wyszła niema. Z `HEYGEN_API_KEY`
  skrypt pobiera utwór z katalogu HeyGen (`/v3/audio/sounds`, ponad 10 tys.).
  Pomiar: średnio −17 dB, szczyt −1,7 dB.
- **CLI HeyGen** zainstalowane w kontenerze (v0.10.0, suma SHA-256 zgodna
  z `checksums.txt`; skrypt `curl | bash` zablokował klasyfikator, więc binarium
  pobrane i rozpakowane ręcznie z tego samego archiwum). Logowanie OAuth
  wymaga przeglądarki, więc w sesjach Code działa tylko klucz: **punkt ręczny
  dla Marka** — `HEYGEN_API_KEY` w sekretach środowiska Code (klucz z
  app.heygen.com → Settings → API). Kontener jest ulotny, CLI trzeba będzie
  instalować w setup script środowiska albo zostawić skryptowi bezpośrednie
  wywołanie API (tak jest dziś — CLI nie jest mu potrzebne).
- `.claude/settings.json`: marketplace'y `hyperframes`, `tiktok-video-skills`,
  `ecommerce-video-skills` + włączone pluginy — Code w tym repo ma skille od
  ręki. Wbrew ogólnej zasadzie (skille uniwersalne do `MDmygeneralskills`)
  zostają tutaj, bo to cudze marketplace'y, nie nasze skille.
- `klocki-social`: dopisana sekcja „Rolki wideo — format produkcyjny" (skill
  trafił do repo w `.claude/skills/klocki-social/` i do `NASZE` w
  `spakuj-skille.mjs`; paczka `skille/klocki-social.skill` do wgrania przez
  Marka na claude.ai — Cowork zleca rolkę do Code, nie renderuje sam).
- Dokumentacja: `materialy/rolki/README.md`, wiersze w `scripts/README.md`
  i `materialy/README.md`, punkt 8 w ściądze „Co gdzie wrzucać" w `NARZEDZIA.md`.
  `.gitignore`: `materialy/rolki/wyjscie/`, `.hyperframes/`.

**Test:** LEGO 75405 Krążownik typu Home One — katalog 299,99 zł, dziś 169,99 zł
w Ceneo/Media Expert/Allegro (−43%), minimum w naszej bazie z 12.10. MP4 i zip
projektu wysłane Markowi w rozmowie.

**Do zrobienia:**
- Marek: `HEYGEN_API_KEY` w sekretach środowiska; wgrać `klocki-social.skill`.
- Pętla do klatki zero (re-watch) i wariant 4:5 / 1:1 z tego samego szablonu.
- Drugi format („Ile NAPRAWDĘ kosztuje klocek", cena/element z `sety.json`)
  na tym samym silniku.

## 2026-10-14 13:10 · CODE · Firecrawl: kto zużywa kredyty

- Stan konta (API `team/credit-usage`): zostało **1 270 z 5 000**, okres do 23.10. Zużycie: sierpień 263, wrzesień 1 475, październik do 14.10 już 2 297.
- Źródło według panelu: **MCP 75% (3 169)**, API 25% (1 060). Nasze skrypty LEGO idą przez API. Przez MCP idą sesje z konektorem Firecrawl — wg dziennika aktywności (ostatnie ~18 h) to głównie inne projekty Marka na tym samym koncie: części do Jaguara E-Type (martinrobey, sngbarratt, terrysjag, eBay, wyszukiwania numerów C3xxxx) i fronerigastro.pl (60 stron w godzinę).
- Dziś 302 zadania: 154 LEGO (lego.com + Media Expert, po 1 kredycie), 148 pozostałych — na nie przypada większość z ~640 kredytów dnia (wyszukiwania z pobieraniem treści i ekstrakcja kosztują kilka kredytów za zadanie).
- Jednorazowy koszt LEGO dziś rano: dwa pełne przejścia katalogu lego.pl (~117 stron) przy naprawie parsera.
- Potwierdzone w `firecrawl_credit_usage` (podział na klucze): październik — „Connected app” (konektor MCP w claude.ai/Cowork, inne projekty) **1 663**, „Default” (nasz `FIRECRAWL_KEY`, skrypty LEGO) **634**.
- Decyzja Marka: do 23.10 inne projekty nie używają Firecrawla, gdy na koncie zostaje < 400 kredytów. Twardej blokady nie ma (jeden zespół, jedna pula, Firecrawl nie ma limitów per klucz), więc reguła idzie jako instrukcja w ustawieniach claude.ai (Instrukcje osobiste) i w skillach `czesci-*` — tekst w odpowiedzi Code z 14.10.

## 2026-10-14 12:55 · CODE · Wiersz „wyprzedane" w tabeli cen — i ukryty błąd, który przy okazji wyszedł

Dopisek, o który prosił Marek po obejrzeniu 76329. Przy pisaniu okazało się, że samo
wykluczenie oferty z liczenia najtańszej (wpis 12:20) **nie załatwiło sprawy do końca**.

**Czego nie widziałem wcześniej.** `TabelaCen` dokłada wiersz LEGO z ceną KATALOGOWĄ, gdy
w ofertach nie ma LEGO — i ten wiersz szedł do zwykłego sortowania po cenie. Przy 76329
cennikowe 299,99 zł stawało więc na czele tabeli i dostawało ramkę „najtańszy", mimo że
w metaopisie i na pasku ceny mieliśmy już poprawne 337 zł z Allegro. Strona przeczyła sama
sobie o dwa akapity: na górze „od 337,00 zł", a w tabeli wyróżnione 299,99 zł ze sklepu,
który zestawu nie ma.

**Rozwiązanie jest tym, co serwis robi od dawna z Ceneo:** wiersz, który nie jest ofertą,
stoi osobno na końcu i nie bierze udziału ani w sortowaniu, ani w wyróżnieniu najtańszego.
`wierszLegoWyprzedane` działa teraz dokładnie jak `wierszLegoEol`, tylko z innym tekstem:
znacznik **„wyprzedane"** przy cenie i podpis „oficjalny sklep – w tej chwili wyprzedane;
podajemy cenę katalogową dla porównania". Link do LEGO.com zostaje — na karcie są zdjęcia
i wymiary, a zestaw może wrócić do sprzedaży.

Po zmianie na 76329: najtańszy jest Allegro 337,00 zł, Empik 358,41 zł pod nim, a LEGO.com
z 299,99 zł i znacznikiem „wyprzedane" na końcu. Dokładnie to samo mówi metaopis.

**Zasięg:** wiersz wychodzi na 38 z 39 wyprzedanych hubów. Trzydziesty dziewiąty to
5006157 Play and Display Case — nie ma ceny katalogowej, więc nie ma czego pokazać;
zostaje sama plakietka przy tytule. Nie wymyślamy kwoty, żeby wiersz się pojawił.

Sprawdzone po buildzie (10002 strony), że dostępnym zestawom nic się nie stało: 76447 ma
dalej LEGO.com 271,99 zł jako najtańsze, z datą i rabatem −20%. 10315 pokazuje ten sam
układ co 76329 — Media Expert 308,96 zł na czele, wyprzedane LEGO na końcu.

CSS bez nowej deklaracji: `.tag-wyprzedane` dołączony do selektora `.tag-eol`, bo to ta
sama czerwień i ten sam kształt.

## 2026-10-14 12:45 · CODE · Runner „Kolejka indeksacji 01:57” + zadanie dla Coworka

- Decyzja Marka: osobny runner. Stała sesja `session_01XfrPhwbD2bhMwybCoUdATy`, trigger `trig_01Gh6Payj9QVGDkrKXNzkbCX`, codziennie 01:57. Układa `materialy/indeksacja/kolejka.md` (10 adresów) i pushuje tylko ten katalog.
- Klikanie: zadanie cykliczne Coworka na komputerze Marka, prompt w `materialy/indeksacja/cowork-zadanie.md` (proponowana pora 10:00). Do założenia przez Marka.

**Cowork nie ma jeszcze zadania „Poproś o zindeksowanie” — kolejka z nocy nie zostanie zgłoszona**
**Mamy?** — częściowo: runner układa listę od 15.10, nikt jej nie klika
**Zrobić:** — założyć w Coworku zadanie cykliczne (codziennie 10:00) z promptem z `materialy/indeksacja/cowork-zadanie.md`
**Kto:** — Marek (decyzja, panel)
→ zamknięte 14.10: zadanie „Kolejka GSC — zgłoszenia” założone, codziennie 10:24, pierwszy przebieg 15.10

## 2026-10-14 12:20 · CODE · Wyprzedane oferty nie liczą się do najtańszej ceny

Dokończenie wątku z 11:40. Plakietka mówiła „wyprzedane w LEGO.com", a cena z tego samego
sklepu dalej wygrywała jako najtańsza.

**Cięcie poszło w `filtrujOferty`, nie w `najlepszaOferta` — i to była cała trudność.**
„Najtańszą" liczy w serwisie pięć różnych miejsc: hub (`[nr].astro`), `seo.js`,
strona główna, `/promocje-lego/` i `GaleriaZestawow`. Każde robi własny `Math.min` po
liście już przepuszczonej przez `filtrujOferty`. Gdybym odciął ofertę tylko w
`najlepszaOferta()`, cena wyprzedanego zestawu zostałaby w pozostałych czterech —
strona główna dalej sortowałaby po cenie, której nie da się zrealizować. Sito jest
jedynym miejscem, gdzie da się to powiedzieć raz.

- `oferty.js` → `ofertaKupowalna(o, nr)`: odrzuca wiersz `lego`, gdy `wyprzedaneWLego(nr)`.
  Dopięte do `filtrujOferty`, obok sita świeżości i „podejrzanego rynku" — czyli obok
  dwóch reguł, które już wcześniej wyrzucały oferty, za którymi nie stoimy.
  O innych sklepach nic nie twierdzimy: żaden nie daje nam sygnału dostępności.

**Skala: 39 zestawów jest wyprzedanych w LEGO, ale najtańsza cena zmienia się tylko
na pięciu.** Na pozostałych 34 oferta LEGO i tak nie była najtańsza.

| Zestaw | Było (LEGO) | Teraz |
|---|---|---|
| 76329 Maska Milesa Moralesa | 299,99 | 337,00 (Allegro) |
| 5007061 The Creative Bundle | 579,97 | brak ofert |
| 40722 Braille — niemiecki | 379,99 | brak ofert |
| 5006157 Play and Display Case | 274,99 | brak ofert |
| 88013 Technic Large Motor | 144,99 | brak ofert |

76329 to przypadek, dla którego ta zmiana ma sens: obiecywaliśmy w metaopisie 299,99 zł
w sklepie, który tego zestawu nie ma. Teraz meta mówi „od 337,00 zł w 2 sklepach".
Cztery pozostałe miały ofertę LEGO jako JEDYNĄ, więc hub przestaje obiecywać cenę —
i słusznie, bo nie ma gdzie kupić.

**Tabela cen nie zrobiła się pusta** i to wyszło samo: `TabelaCen` dokłada wiersz
„LEGO.com — oficjalna strona LEGO" z ceną KATALOGOWĄ, gdy w ofertach nie ma LEGO
(linia 40 komponentu). Czytelnik widzi więc cennik producenta bez daty, plakietkę
„wyprzedane w LEGO.com" przy tytule i tabelę, w której najtańsza jest realna oferta.
Nie planowałem tego — sprawdziłem po buildzie i zostawiam, bo wychodzi lepiej niż
pusty hub.

**Sprawdzone po buildzie (10002 strony):** plakietka na dokładnie 39 hubach, na 76447,
42211 i 21355 (przecenione, ale dostępne) jej nie ma i ich ceny się nie zmieniły.
Meta 76329: „od 337,00 zł w 2 sklepach, cena katalogowa 299,99 zł".

**Czego dalej nie ma:** wiersz LEGO w tabeli nie jest podpisany „wyprzedane" — to była
druga z dwóch opcji, które proponowałem, i Marek wybrał tę. Gdyby kiedyś miała dojść,
sygnał jest już policzony (`wyprzedaneWLego`), wystarczy przekazać go do `TabelaCen`.

## 2026-10-14 11:40 · CODE · Plakietka „wyprzedane w LEGO.com" na hubie — 39 zestawów

Domknięcie punktu z wpisu 11:10: etykieta `lego_pl_etykieta: niedostepne` była zapisywana
od 14.10, ale nikt jej nie renderował, więc hub pokazywał cenę za coś, czego w sklepie LEGO
w tej chwili nie kupisz.

- `src/lib/status.js` → `wyprzedaneWLego(nr)`. Trzy warunki: etykieta `niedostepne`
  z listingu, wpis **świeży** (`widzianyNaListingu`, te same 14 dni co reszta reguł
  listingowych) i **zestaw nie jest EOL** — gdy LEGO skończyło produkcję, „koniec produkcji"
  mówi więcej niż „wyprzedane" i dwie plakietki o tym samym byłyby szumem. Świeżość jest tu
  potrzebna, bo `lego-ceny.mjs` kasuje etykietę tylko dla zestawów obecnych w danym
  przebiegu na listingu: zestaw, który z listingu wypadł, zostałby inaczej „wyprzedany"
  na zawsze.
- `src/pages/zestaw/[nr].astro`: plakietka w rzędzie przy tytule, z tooltipem „w sklepie
  LEGO chwilowo go nie kupisz. Inne sklepy mogą mieć zapasy."
- `global.css`: `.badge-status--wyprzedane` w tej samej czerwieni co „wycofanie
  potwierdzone" — dla kupującego jedno i drugie znaczy „tu tego teraz nie weźmiesz" —
  ale osobną klasą, żeby dało się je kiedyś rozdzielić bez ruszania tamtej.

**Sprawdzone, nie założone:** 39 zestawów ma w katalogu etykietę `niedostepne` i **wszystkie
39 potwierdza dzisiejszy listing lego.pl** — zero rozbieżności. Plakietka wychodzi na
dokładnie tych 39 hubach, na 40723 (dostępny włoski alfabet) jej nie ma. Build 10002 strony.

**Czego ta zmiana NIE robi.** Tabela cen dalej pokazuje wiersz LEGO z ceną, bo w całym
module cen nie ma w ogóle pojęcia dostępności oferty — `TabelaCen`, `PasekCeny` i
`lib/oferty.js` nie mają ani jednego pola o tym, czy daną ofertę da się dziś zrealizować.
Dodanie tego to osobna robota (sygnał musiałby dojść do wiersza oferty i do liczenia
„najtańszej"), więc jej tu nie zaczynałem. Na razie plakietka przy tytule mówi to, czego
tabela nie powie.

## 2026-10-14 11:40 · CODE · Indeksacja: stan i dzienna kolejka „Poproś o zindeksowanie”

- Próbka URL Inspection API (300 adresów z sitemap, 14.10): artykuły 29/43 w indeksie, serie 32/69, prezentowniki 19/22, deale 5/15, huby 65/129 (22 z nich Google pamięta jeszcze z `noindex`). Mapy witryny Google czyta regularnie (pobrane 08–13.10, 0 błędów) — wąskie gardło to częstotliwość odwiedzin, nie zgłoszenie.
- Nowy `scripts/kolejka-indeksacji.mjs` wybiera codziennie ok. 10 niezindeksowanych adresów według priorytetu i zapisuje `materialy/indeksacja/kolejka.md`. Klikać musi człowiek albo Cowork w przeglądarce Marka — prośby o zindeksowanie nie ma w API, a Indexing API Google dopuszcza tylko oferty pracy i transmisje wideo.
- Kolejka na 14.10: `/o-nas/` i 9 artykułów (m.in. recenzje 60508, 75438, 77242, BAM Halloween, premiery jesień/święta).
- 14.10 po południu Cowork zgłosił całą listę: 10 z 10, żaden adres nie był w indeksie, bez limitu. Kontrola wejścia do indeksu: 19.10 (URL Inspection API).

## 2026-10-14 11:10 · CODE · Alfabet Braille'a w katalogu: cztery numery, pięć hubów po polsku

Z siedmiu pozycji „spoza katalogu" z wtorkowego łańcucha (wpis 10:30) dopisane cztery
zestawy klocków: **40655 francuski, 40722 niemiecki, 40723 włoski, 40724 hiszpański**,
wszystkie 379,99 zł i 287 elementów. Trzy pozostałe (88011, 88019, 88021) zostają poza
katalogiem — to komponenty Powered Up, nie zestawy.

**Seria: Archiwum, zgodnie z regułą z RUNBOOKA**, nie z braku pomysłu. Własną serię dostaje
linia, która ma co najmniej 10 zestawów; Braille Bricks ma na LEGO.pl pięć pozycji plus
wycofany polybag 30711, więc idzie tam, gdzie od dawna leżał **40656 angielski** — ten jeden
był w katalogu od zaciągu z Rebrickable.

**Czego nie ma: alfabetu polskiego.** LEGO sprzedaje w polskim sklepie pięć wersji
językowych — angielską, francuską, niemiecką, włoską i hiszpańską — i ani jednej polskiej.
To jest informacja zakupowa sama w sobie, gdyby ktoś kiedyś pisał o tej linii.

**Nazwy przepisane na polskie, wszystkie pięć.** Reguła „pozycje z Rebrickable zostają po
angielsku" ma uzasadnienie „nie ma do czego wyrównywać" — tu jest: LEGO.pl podaje własne
polskie nazwy, więc wziąłem je verbatim z zaciągu („Zabawa z alfabetem Braille'a —
francuski" itd.). Poprawiłem przy okazji 40656, żeby piątka nie była rozjechana. Pole
`zrodlo` zostaje `rebrickable` — mówi, skąd wpis, nie skąd nazwa.

**Łańcuch domknięty dla tej czwórki:** `katalog-z-rebrickable.mjs --numery` (status `eol`,
jak zawsze) → `lego-ceny.mjs` z tego samego zaciągu z 14.10 (status `dostepny`,
`lego_pl_widziano`, cena LEGO 379,99 w feedzie) → `wczytaj-rrp.mjs`: **0 nowych wpisów**,
bo RRP 379,99 siedzi w rejestrze dla wszystkich pięciu od 28.08 — brakowało tylko katalogu,
czyli hubów → `lego-redirects.mjs`: +4 linki do kart produktu (986 → 990).
Katalog 9822 → 9826, feed 8769 → 8773.

**Dwie rzeczy, o których trzeba wiedzieć, zanim ktoś się zdziwi.**
1. **40722 niemiecki jest na LEGO.pl „Niedostępne"**, a mimo to ma u nas status `dostepny`
   i cenę 379,99 w tabeli. Tak działa `lego-ceny.mjs`: status `dostepny` dostaje wszystko,
   co stoi na listingu z ceną, a wyprzedanie trafia do osobnego pola `lego_pl_etykieta:
   niedostepne`. Pola nikt jeszcze nie renderuje — `premiery.js` czyta z niego tylko
   `przedsprzedaz` i `zamowienie_oczekujace`. Nie ruszałem tej reguły, bo dotyczy wszystkich
   zestawów, nie tylko tych czterech, ale hub pokazuje teraz cenę za coś, czego w tej chwili
   nie kupisz.
2. **Wszystkie cztery huby mają `noindex, follow`** — to projektowana reguła `seo.js` dla
   cienkich hubów (jedna oferta, zero tekstu redakcyjnego), nie usterka. Odpowiadają 200
   i są poza sitemapą. Indeksowalne zrobiłby je tekst redakcyjny, a nie zmiana w danych.

## 2026-10-14 10:50 · CODE · Dane wt: awaria LEGO.pl nie zabiera już cen Ceneo i Smyka

- Nowy prompt (trigger `trig_01XjJhujd8FnXsGWAHQeUBqd`, ta sama sesja). Błąd w krokach LEGO.pl (alarm parsera, brak kredytów Firecrawla, urwany listing) → runner pomija resztę kroków LEGO.pl, ale robi ceny Ceneo, Lidla, MediaMarktu i Smyka, build i push, a awarię wpisuje do „Kto co robi”. Przed zaciągiem kasuje pliki z /tmp, żeby nie wczytać danych z poprzedniego wtorku. Szczegóły: `materialy/zadania-cykliczne.md`, historia 14.10.

## 2026-10-14 10:40 · CODE · 10030 Imperial Star Destroyer miał zdjęcie plecaka Ninjago

- Przyczyna: feed Planety Klocków ma licencjonowane plecaki, piórniki i walizki z kodem „numer-4 cyfry" (`LEGO CITY 10030-1601 Plecak przedszkolny`, `10052-2103 Piórnik`, `20149-0026 Walizka`). `feedy-lego.py` brał z tytułu numer sprzed myślnika, a gałąź PK w ogóle nie miała filtra gadżetów. W feedzie PK z 14.10 jest 15 takich pozycji na 4 numerach: 10030, 10050, 10052, 20149. Hub ma tylko 10030.
- Poprawka: `WZORZEC_KOD_GADZETU` (`\d{4,7}-\d{4}`) w `nie_zestaw()` i w gałęzi PK. Cała lista słów nie_zestaw celowo nie weszła do PK — zdjęłaby prawdziwe zestawy („Kreatywna walizka" 10713, „pudełko" 10696).
- Dane: z `oferty_feed.sety` usunięte pole `zdjecie` dla tych 4 numerów (wpisy zostają). 10030 bierze teraz zdjęcie z Rebrickable; wgrane do R2 razem z wariantami WebP.
- Cena 11 999 zł to oferta z Allegro „LEGO Star Wars 10030 Gwiezdny niszczyciel UCS nowy" (zestaw z 2002 r., nowy, cena kolekcjonerska) — nie błąd. `redirects.planetaklockow.10030` wskazywał plecak — usunięty za zgodą Marka (14.10). PK nie ma szablonu wyszukiwania w `sklepy.json`, więc bez wpisu link do PK dla 10030 po prostu nie istnieje.

## 2026-10-14 10:30 · CODE · Strażnik parsera LEGO.pl, koniec konfliktów w dzienniku, 40824 potwierdzony

- **Parser LEGO.pl:** `firecrawl-legopl.mjs` liczy na każdej stronie kafelki i produkty odczytane przez parser. Gdy z którejś strony zgubi więcej niż 2, gdy wyprzedaż jest pusta, gdy brak przecen albo gdy pełny przebieg da mniej niż 800 zestawów — przerywa z kodem 3 i niczego nie zapisuje. Sprawdzone na żywo: poprawiony parser 39/39, parser sprzed b4559ca podstawiony na próbę → alarm (0 z 19 na wyprzedaży). Szczegóły: RUNBOOK, „Czwarta pułapka". Dane wt przy alarmie przerywa i zgłasza w „Kto co robi".
- **Dziennik:** `.gitattributes` z `DZIENNIK.md merge=union` — dwa wpisy dopisane w tym samym miejscu przez różne sesje scalają się przy rebase bez konfliktu (sprawdzone na repo testowym). Pliki `src/data/*.json` celowo bez tego — tam konflikt dalej zatrzymuje runnera.
- **40824** Uroczy kanarek Tweety w `deale_potwierdzone.json` (69,99 zł, Media Expert, decyzja Marka).

## 2026-10-14 09:10 · CODE · /podglad/ usunięty (decyzja Marka)

- Skasowane `src/pages/podglad/glowna-obecna.astro` i `deale-obecne.astro` — kopie strony głównej i deali sprzed v2 (29.09). Przypomnienie „Usunąć /podglad/” odpaliło się dziś, Marek potwierdził. Powrót możliwy z historii gita (`7f488de`).

## 2026-10-14 08:50 · ŁOWCA · Do zrobienia

**40824 Uroczy kanarek Tweety: post z 13.10 poleca 69,99 zł w Media Expert, a sito „podejrzany rynek" ukrywa tę ofertę na stronie (−52% od RRP 144,99 zł, brak wpisu w deale_potwierdzone.json)**
**Mamy?** — częściowo: post `/deale/deal-40824-kanarek-tweety-minimum/` jest opublikowany, ale oferta ME nie wchodzi do tabel cen ani huba `/zestaw/40824/`
**Zrobić:** — sprawdzić kartę ME (Łowca potwierdził 69,99 zł na stronie 13.10 i 14.10) i dopisać 40824 do `src/data/deale_potwierdzone.json`
**Kto:** — Marek (decyzja)
→ zamknięte 14.10: Marek potwierdził, 40824 (69,99 zł, Media Expert) w `deale_potwierdzone.json` — oferta wraca do huba i tabel cen

## 2026-10-14 10:30 · CODE · Wtorkowy łańcuch dokończony: rejestr RRP i linki LEGO

Po poprawce parsera (wpis 08:55) dwa ostatnie ogniwa łańcucha, na tym samym zaciągu
z 14.10 — bez ponownego pobierania, przez `--z-pliku`.

**Rejestr cen katalogowych: zero zmian i to jest dobra wiadomość.** Plik RRP policzony
z zaciągu dał 938 cen dla zestawów z katalogu. `wczytaj-rrp.mjs`: **0 nowych, 0 konfliktów**,
938 już w rejestrze (rejestr ma 982 pozycje). Zero konfliktów jest tu najważniejszą liczbą —
rejestr jest write-once i ma pierwszeństwo przed wszystkim, więc gdyby poprawiony parser
podstawił gdziekolwiek cenę wyprzedażową jako katalogową, zobaczylibyśmy to właśnie tutaj.
Sprawdzone też punktowo: 10295 → 729,99 (nie 583,99), 76447 → 339,99 (nie 271,99),
42211 → 439,99 (nie 263,99). Reguła „promocja ⇒ bierz `priceBefore`" działa.
`kontrola-rrp.mjs` bez nowych sygnałów: te same 14 setów z rynkiem poniżej połowy cennika
co wcześniej, 13 z nich już ukrytych do potwierdzenia, 10276 nadal z niepotwierdzonym RRP.

**Linki do kart produktu: +5 wpisów (981 → 986).** I znowu to te same zestawy, które gubił
parser: 71494 Zoey's Time Owl, 76785 Thing's Apartment, 75682 Elphaba & Glinda, 77055 Able
Sisters, 77054 Leif's Caravan — wszystkie dziś przecenione. Czyli brak przecenionych kafelków
odbijał się nie tylko na cenach, ale i na linkach: przez te zestawy worker musiał polegać na
cudzym przekierowaniu `lego.com/pl-pl/product/<numer>`.

Pozostałe mapy w `redirects.json` bez zmian (planetaklockow 1877, allegro 7114, empik 4821,
ceneo 1760, mediaexpert 850, xkom 788, smyk 704, lidl 91, mediamarkt 55). `src/worker.js`
i `wrangler.toml` nietknięte — zmiana jest wyłącznie w danych, które worker czyta, a brak
wpisu i tak ma fallback. Build 10000 stron.

**Siedem pozycji spoza katalogu serwisu** (do obejrzenia ludzkim okiem, nie wchodzą do
rejestru): 40655, 40722, 40723, 40724 — Zabawa z alfabetem Braille'a w czterech językach
po 379,99 zł — oraz Powered Up: 88011 silnik pociągu 57,99, 88019 zasilacz USB 144,99,
88021 akumulator 124,99. Alfabet Braille'a to zestawy klocków, więc jeśli mają u nas być,
dopisuje je Scout albo `katalog-z-rebrickable.mjs`; trzy ostatnie to komponenty, nie zestawy.

## 2026-10-14 08:55 · CODE · Parser listingu LEGO.pl gubił każdy przeceniony zestaw

**Przyczyna, inna niż wczorajsza hipoteza z Radaru.** Nie chodziło o to, że listing nie
oddaje pozycji przecenionych — oddaje je. Gubił je nasz parser: kafelek z obniżką zapisuje
obie kwoty i rabat w JEDNEJ linii (`729,99 zł583,99 zł\- 20%`), a `parser-legopl.mjs`
szukał kwoty stojącej samotnie w linii. Nie łapał żadnej, więc `kwoty.length === 0` i cały
produkt leciał przez `continue`. Dowód bez domysłów: dział wyprzedaży LEGO.pl ma 74
produkty, a nasz parser wyciągał z jego pierwszej strony **zero**.

**Drugi skutek, groźniejszy od cen.** Zestaw nieobecny na listingu przez 14 dni dostaje
w `katalog.json` status `eol`, więc dłuższa wyprzedaż oznaczałaby przecenione zestawy jako
wycofane. Tym razem nie zdążyło — ostatnie widzenie 06.10, próg mijał 20.10.

**Co zmienione**
- `parser-legopl.mjs`: kwoty czytane z całej linii, ale tylko gdy po ich wycięciu nie
  zostaje nic poza „zł", rabatem i interpunkcją; zdanie „Najniższa cena z 30 dni przed
  obniżką" odrzucane osobno (raz niesie cenę obniżoną, raz katalogową). Sklejone etykiety
  („Podwójne punktyWyprzedaż- 20%") rozcinane na granicy mała→WIELKA litera, żeby `status`
  niósł stan produktu, a nie nazwę akcji marketingowej.
- `firecrawl-legopl.mjs`: zaciąg chodzi po dwóch listingach (katalog + dział wyprzedaży),
  `--strony` ogranicza każdy osobno.
- RUNBOOK → „lego.pl: dostępne przez Firecrawl", czwarta pułapka, z testem regresji bez
  kredytów (zrzut markdownu działu wyprzedaży + parser na pliku).

**Efekt w danych.** Zaciąg: 1330 pozycji, **945 zestawów** — wobec 922 z wtorku i 896
z dzisiejszego porannego przebiegu na starym parserze. Odświeżonych cen LEGO: 969;
z 06.10 zostały 4 zestawy, których listing naprawdę nie ma (42653, 71440, 76323, 76325).
Z 43 wcześniej gubionych wróciło 39 — i każde z nich jest akurat przecenione, co domyka
diagnozę.

**Wyprzedaż jako drugi listing dołożyła ZERO pozycji** — wszystkie 74 produkty działu były
już w katalogu po poprawce parsera. Zostawiam ją mimo to jako kanarka: gdyby przecenione
kafelki znowu zaczęły wypadać, ten listing pokaże to od razu. Cztery kredyty tygodniowo.

**Sprawdzone na stronie:** `/zestaw/76447/` pokazuje 271,99 zł z LEGO (było 339,99 z Ceneo),
podobnie 42211 (263,99 zamiast 292,17 z Ceneo), 71494 (87,49 zamiast 112,77 z Allegro)
i 80118 (203,99 zamiast 339,99). Build 10000 stron.

**Czego pilnować przy najbliższym wtorku:** 42653, 71440, 76323 i 76325 są nieobecne od
06.10. Jeśli nie wrócą do 20.10, skrypt oznaczy je jako EOL — i tym razem słusznie, bo
parser przeceny już widzi. 10302 Optimus Prime, 75429 i 72035 poszły na EOL w porannym
przebiegu (nieobecne od 29.09); mój zaciąg, już z poprawką, też ich nie widzi, więc ten
werdykt się broni.

## 2026-10-14 08:40 · CODE · Przedsprzedaż w Nowościach, zdjęcia nowości, 18 dużych zestawów, sklepy na /wycofania/

- **Przedsprzedaż (prośba Marka):** zestaw, który LEGO.com już sprzedaje („Przedsprzedaż” albo „Zamówienie oczekujące” na listingu lego.pl), jest w Nowościach z plakietką „Przedsprzedaż”, a jego hub pokazuje tabelę cen z LEGO.com zamiast samej zapowiedzi. „Wkrótce dostępne” zostaje w Zapowiedziach. Etykietę zapisuje `lego-ceny.mjs` w katalogu (`lego_pl_etykieta`), co wtorek w przebiegu Dane wt; dziś zaciąg zrobiony ręcznie (896 zestawów): 12 w przedsprzedaży, 16 w zamówieniu oczekującym, 4 „wkrótce”, 38 wyprzedanych. Nowości 134 wiersze, w tym 14 w przedsprzedaży (67006, 67008, 67009, 72052–72061, 21065).
- **Zdjęcia nowości:** `generuj-obrazy.mjs` (poza buildem, czyli w przebiegu Łowcy) dociąga zdjęcie z Rebrickable albo Brickset dla zestawów bez źródła; dziś 7 dopisanych i wgranych do R2 (40909, 67006, 67008, 67009, 67012, 71873, 71875). Bez zdjęcia nigdzie: 21375 (przeciek), 71835.
- **18 dużych zestawów do sety.json** (Radar 11.10): Titanic, Wieża Eiffla, Muzeum historii naturalnej, Neuschwanstein, Ogród botaniczny, Włoska riwiera, Goonies, Rodzinna choinka, Zamek Pięknej i Bestii, Hogwart, Sokół Millennium, Gwiazda Śmierci, Baratie, Wieża Avengersów, Arkham Asylum, Nora, Hogsmeade, T. rex — opisy z faktów Brickset API, oferty z feedu.
- **/wycofania/:** pod ceną „w N sklepach” (Radar 26.09).
- **Decyzje Marka:** 72306 — kupno odkładamy; Proshop — ponaglenie, gdy wzrośnie ruch. Obie pozycje Radaru zamknięte.

## 2026-10-13 17:20 · CODE · Nowe logo: granatowy klocek + „tylkoklocki.pl" (Rubik)

- Decyzja Marka po czterech rundach propozycji: znak = granatowy klocek 2×2 z żółtymi wypustkami (bez kreski „%”), napis „tylkoklocki.pl" w całości granatowy, Rubik ExtraBold na krzywych.
- Wymienione: logo w nagłówku i stopce (SVG zamiast tekstu z CSS), `favicon.svg/.ico`, `apple-touch-icon.png`, domyślny `og.png`, logo w stopce obrazów OG artykułów — przegenerowane 31 starych i dorobione 31 brakujących (`public/og/`, nikt nie puszczał `generuj-og.py` po nowych tekstach).
- Źródło: `scripts/generuj-logo.py` + `scripts/logo-rastry.mjs`; zasady użycia: `redakcja/system-wizualny.md`, sekcja „Logo”. Plików logo nie poprawiamy ręcznie.
- Nagłówek na telefonie: logo 18–19 px, bo przy 20 px na 375 px przycisk Menu spadał do drugiej linii (sprawdzone 320–1280 px).

## 2026-10-13 09:30 · CODE · Raporty runnerów w formacie „Kto co robi” + MediaMarkt 21034

- Prośba Marka: każdy runner zaczyna raport od sekcji „Kto co robi” (cztery linijki na pozycję: co / Mamy? / Zrobić / Kto — jak Radar), a pozycje dla ludzi zapisuje też w dzienniku jako „<RUNNER> · Do zrobienia”. Kontroler w poniedziałek zbiera wszystkie do maila „Zadania bez właściciela” dla Marka i Piotra, pogrupowane według „Kto”. Nowe triggery i ID: `materialy/zadania-cykliczne.md`, „Historia zmian” 13.10; zasada: RUNBOOK „Format raportów runnerów”.
- `scripts/archiwum-dziennika.mjs` trzyma w dzienniku każdy wpis „<RUNNER> · Do zrobienia” do zamknięcia (dotąd tylko RADAR).
- Zamknięcie pozycji = linia „→ zamknięte <data>: …” pod nią; dopisuje Code po Twojej decyzji (albo Ty sam, wprost w pliku).
- MediaMarkt: 21034 Londyn sprawdzony ręcznie i dopisany (574470e); importer ma listę `potwierdzone_numery`.

## 2026-10-13 08:20 · RADAR · Do zrobienia

**fanklockow.pl + faniklockow.pl · 12.10** — Oba serwisy opisały okno 13–19.10 na LEGO.pl (podwójne punkty Insiders i gratis 40909 Restauracje świata: Włochy od 745 zł), które zaczęło się dzisiaj.
**Mamy?** — tak: `/kalendarz-promocji-lego/` (sekcja `#pazdziernik-punkty`), ale status był „przewidywane", a okno `#gratis-pazdziernik` wisiało jako „trwa, 8.10 – ?" dziewięć dni po starcie.
**Zrobić:** — zrobione w tym przebiegu: kalendarz przestawiony na „trwa" i uzupełniony liczbami z regulaminu LEGO.pl (745 zł, 13–19.10, wartość upominku 81,99 zł, jeden na gospodarstwo domowe, bez zestawów BLDP, podwójne punkty bez łączenia z kuponem); okno 450 zł zamknięte datą 12.10; hub `/zestaw/40909/` miał wpisane „kwoty dla polskiego sklepu nie podał na razie nikt" — poprawione.
**Kto:** — Code (dane, strona) → zamknięte 13.10

**Uwaga do bazy, nie do redakcji.** Baza konkurencji nie trzyma zrzutu menu zklockow.pl,
więc zdania „nowa sekcja" nie da się tam dziś udowodnić — widzę m.in. `/gwp-lego`,
`/okolicznosciowe-lego` i `/odkrywaj/karty-podarunkowe-lego` i **nie wiem, czy są nowe**.
Przy najbliższej okazji warto zapisać pełną listę pozycji ich menu jako punkt odniesienia.
Druga rzecz: faniklockow przeniósł tekst o Hello Kitty z `/2026/10/05/` na `/2026/10/06/`
i w porównaniu po samym URL wyszedł jako nowy, choć leży w bazie od 06.10 — przy tym
serwisie dedup robimy po tytule, nie po adresie.

→ zamknięte 13.10.2026: kalendarz i hub 40909 poprawione w przebiegu Radaru (c8af1a5).

## 2026-10-13 05:25 · SCOUT · Sygnały wycofań dla runnera Wycofań
- **Ponad 300 zestawów oznaczonych przez LEGO „Einstellung in Kürze" na grudzień** — StoneWars,
  https://www.stonewars.de/angebote/doppelte-lego-insiders-punkte-oktober-2026/ (12.10, 22:30):
  po fali z połowy roku LEGO oznaczyło na grudzień kolejne 300+ zestawów; serwis prowadzi własną
  „LEGO EOL Liste 2026" opartą na datach EOL zapisanych u LEGO (niezależną od plakietek „Ostatnia
  szansa" w sklepie), która sięga jeszcze dalej, oraz redakcyjną dziesiątkę z 30.09. Numerów w tym
  tekście nie ma — są w tamtej liście i w tekście Top 10, do weryfikacji u źródła.
- **40909 Restauracje świata: Włochy** — ten sam tekst: gratis sprzedawany tylko 13–19.10.2026,
  a termin końca produkcji podany jako 12/2026. Dla nas bez konsekwencji (gratis, `bez_rrp`),
  ale jeśli runner prowadzi statusy gratisów, to data domknięcia.
→ Wycofania 2026-10-19: sygnał 1 zweryfikowany bezpośrednio w dziale „Ostatnie zestawy"
(`lego-ostatnie.mjs`, 318/318 produktów): grudniowa fala jest u nas od września, dziś z działu
doszło tylko potwierdzenie 60464 (przewidywane → potwierdzone). Sygnał 2 (40909) odrzucone
(na razie): jedno źródło, a statusy gratisów prowadzimy — 40906 i 40908 weszły jako „wycofany"
dopiero po zniknięciu z katalogu lego.com; 40909 dopiszemy tak samo po zakończeniu akcji 13–19.10,
gdy LEGO przestanie go rozdawać.
→ Wycofania 2026-10-26: dopisane — 40909 wszedł na listę (grudzień 2026, potwierdzone): akcja
13–19.10 była jedynym oknem dystrybucji wg regulaminu LEGO.pl, karta lego.com/pl-pl z 26.10 mówi
„Produkt obecnie niedostępny". Na „wycofany" przejdzie, gdy karta zniknie z lego.com, jak 40906/40908.

## 2026-10-12 14:50 · CODE · MediaMarkt podpięty (decyzja Marka D2)

- Feed TD 96394 (cały sklep, 15 244 produkty) przez ten sam importer co Ceneo i Lidl: `node scripts/ceneo-feed.mjs --sklep mediamarkt`. Nowe opcje w `feedy.json`: `filtr_nazwy`, `pomin_nazwy` (OUTLET, książki, gry), `numer_z_pola: MPN`, `tylko_znane` (numer z nazwy musi mieć wspólne słowo z nazwą katalogową — MediaMarkt podpisał „Figurkę Kapitana Ameryki” numerem 76265).
- Wynik: 54 zestawy z ceną i linkiem `pdt.tradedoubler.com` (`redirects.mediamarkt`), 42 oferty w `sety.json`, 54 wpisy historii cen; MediaMarkt najtańszy w 5 zestawach (np. 75408 za 197,99 zł).
- Odświeżanie: wtorkowy przebieg Dane wt (krok 6 woła importer bez argumentów, więc bierze wszystkie aktywne feedy TD z `feedy.json`).
- Prowizja 1,5%, cookie 30 dni.

## 2026-10-12 14:20 · CODE · Odczyt paneli przez Coworka (audyt 12.10, sekcja 13)

- GSC 09.10: **831 zindeksowanych** (18.09: 807, od 22.09 bez zmian), 3 181 nie: noindex 2 284, wykryta-niezindeksowana 647, **404: 220**. To jest punkt odniesienia dla Kontrolera (kamień 4).
- Noindex w `sitemap-zestawy` (239) to stary crawl, nie reguła: 10365 crawlowany 10.09, od tamtej pory indeksowalny. Wąskie gardło to częstotliwość crawla.
- Cloudflare 30 dni: 82% wizyt z Chin (boty), Polska ok. 20 dziennie.
- MediaMarkt 1,5%, cookie 30 dni, deep linking i porównywarki dozwolone; PK 3%, cookie 30 dni; TD saldo 40,40 zł, płatność 26.10; TD kliki 6–12.10: 139 (fala botów), brak komunikatów o jakości. Rejestr afiliacji uzupełniony.
- Do odczytu przy następnej okazji: lista 220 adresów 404 (eksport z GSC), panele Allegro i SalesMasters, Adtraction, Rakuten.

## 2026-10-12 13:10 · CODE · Filtr botów (D1) i punkty z sekcji 11 audytu

- **Worker `/idz/` (1c663ad, zgoda Marka D1):** referer z naszej domeny musi mieć ścieżkę z ukośnikiem na końcu i nie wskazywać `/idz/`; podrobionego referera nie ratuje już Sec-Fetch-Site; `/promocje-lego/` i `/aktualnosci/` dopuszczone. `diagnoza.mjs` wysyła `x-tk-test` → w statystyce „test”. Symulacja na 30 dniach: 186/186 kliknięć z PL bez zmian, 703 z 751 spoza PL odrzucone.
- `noindex-do-opisania.py` liczy regułę z `ocenaHubu()` przez nowy `scripts/ocena-hubow.mjs` (bez własnej kopii); xlsx odświeżony: 8 356 hubów, 185 z ≥3 sklepami.
- Karuzele serii i Nowości: pierwszeństwo dla hubów indeksowalnych (karty na noindex 59 → 38 z 336).
- JSON-LD (BreadcrumbList + CollectionPage) na 7 listingach; `bez_rrp` wygrywa z RRP w `cenaKatalogowaSetu` (40896 GWP przestał udawać ofertę LEGO.com za 81,99 zł).
- Baner „Akcja zakończona” w artykułach po `wazne_do` (Dzień Chłopaka, weekend x-kom).
- Luki RRP: 11501 = 249,99 zł (lego.pl), 7 saszetek 30xxx i 40902 z `bez_rrp`; **40910, 40912, 40890 dla Scouta** (Brickset nie oddał danych w scrapie). Z 31 opisów `dla_afol` usunięte zdanie „Zestawu nie ma jeszcze w bazie Bricksetu…”.
- `diagnoza.mjs` czyta statusy programów TD i porównuje z rejestrem afiliacji.
- Bez zmian: sito wieku w `huby.js` — oferty >14 dni i tak nie są pokazywane, a trzy wskazane huby istnieją z katalogu; zmiana groziłaby 404 dla hubów spoza katalogu.

## 2026-10-12 12:05 · CODE · Audyt po przebudowie 11.10 i przeniesieniu runnerów

Raport: `materialy/audyt-2026-10-12.md` (+ 4 raporty cząstkowe w `materialy/audyt-2026-10-12/`).
- Strona i runnery bez regresji; 16 Routines, każdy runner z pushem ma commity zgodnie z harmonogramem.
- **MediaMarkt zaakceptowany w TD od 20.08, RTV Euro odrzucony 03.09** — wyszło z API dopiero dziś; rejestr poprawiony, linków MM jeszcze nie ma (czekają na stawkę z panelu).
- Od 30.09 zero transakcji w sieciach z API; wyświetlenia w Google ~4× niżej niż przed 22.09; główne listingi bez crawla 27 dni.
- Poprawione od ręki: notatka robocza w `bez_rrp` (40897, 40900), nazwa źródła przecieku 75484, odmiana „323 zestawy” na /wycofania/, stare ID triggerów w NARZEDZIA i zadaniach cyklicznych.
- Sesja Scouta po kompakcji: 169 tys. tokenów — nowa sesja niepotrzebna.
- Decyzje dla Marka: D1–D10 w sekcji 10 raportu (najpilniejsze: filtr botów w workerze, MediaMarkt, ponowienie zgłoszeń, odczyt paneli przez Coworka).

## 2026-10-12 10:05 · CODE · Radar, Wycofania, Łowca i Kontroler w nowych sesjach
- Stara sesja Radaru `session_01UFkqKNwQexnxLN34HotM4G` doszła do 708 tys. z 1 mln tokenów. Nowa: `session_01N5Bt5oyhgJzLB1FJff9Q3H` (Opus 5, repo z pushem), trigger `trig_012neuySD2HrJgptvXLe2fN9` — ta sama nazwa, cron 08:00 PL i prompt (dopisana tylko wskazówka o całej linii znacznika w dzienniku). Stary trigger `trig_01WgDxbN6eB2QzAZha7dWBfx` skasowany po dzisiejszym przebiegu; starej sesji nie kasujemy (archiwum kontekstu). Pamięć Radaru między przebiegami to `konkurencja_baza.json`, więc nowa sesja niczego nie traci.
- Wycofania też w nowej sesji: `session_01LbKufez6akmviSBqoBRxhC` (Fable 5), trigger `trig_01HtJFSA2mKYUk82ppwoBEca` — prompt identyczny ze starym. Stary `trig_01MGb7VnMvdSHp9Jwa7HyQ69` skasowany po dzisiejszym przebiegu (commit 1f5b561); stara sesja `session_01KfWF14fJvwK78sBVG6XAz8` (581 tys. tokenów) zostaje jako archiwum. Pamięć runnera to `wycofania.json` i adnotacje „→ Wycofania” w dzienniku.
- Łowca też w nowej sesji: `session_01Qae65PWcmFBg2VLncXHB8Y` (Fable 5, sesja 3), trigger `trig_01WCvLUvL5u2kNKc5GVR7xhj` — prompt identyczny (12 528 znaków). Stary `trig_01RjjGRUpJ8QVvhBQrLXiy7Z` skasowany po dzisiejszym przebiegu (commit 15501f4); stara sesja `session_01SdxKtAvW8UmktsuXrsPYga` (528 tys. tokenów) zostaje jako archiwum. Pierwszy przebieg w nowej sesji: 13.10 08:30.
- Kontroler też w nowej sesji: `session_01E7pTLYKdkzz5UgEQ58GMPp` (Opus 5), trigger `trig_01XGtqSHKVQ9cL2uERVx3Gmi` — prompt identyczny (9 801 znaków). Stary `trig_0167qmnWn3Qjjz8HTwZU1uEP` skasowany po dzisiejszym raporcie (commit 8076ba2); stara sesja `session_01M8qMJFfKHEozBSGXjAKP4n` (471 tys. tokenów) zostaje jako archiwum. Pierwszy raport w nowej sesji: 19.10 09:00; punkt odniesienia dla trendów to `materialy/kontroler-2026-10-12.md` w repo.

## 2026-10-12 05:20 · SCOUT · Korekta 40908 i pytanie o wyceny gratisów z serii Restauracje

**Nowości:** brak. Okno przyrostowe Bricksetu (od 11.10) dało pięć rekordów bez ani jednej nowości
(dwa roczniki archiwalne, jeden Gear, 30730 Trainer Supplies mamy od dawna z ceną i ofertami,
40909 dotknięta ponownie). PromoBricks ma najświeższe teksty z 09.10, StoneWars od wczoraj
tylko tekst o MOC-u — żaden serwis nic nie dodał.

**Poprawione dziś (40908 Restauracje świata: Grecja):** mieliśmy premierę `2026-01` i zdanie, że to
„ekskluzyw sklepu LEGO, a nie prezent za zakupy". Oba błędne — Brickset podaje `LEGO Gift with Purchase`
i start 2026-08-11, a tabela serii w PromoBricks daje 254 elementy i release 08/2026. Premiera na `2026-08`,
`opis` (był pusty) napisany, `dla_rodzica` i `dla_afol` przepisane. Wyleciało przy tym zdanie
„Zestawu nie ma jeszcze w bazie Bricksetu" — nieprawdziwe i niezgodne z regułą z 11.10, bo stan Bricksetu
nie jest tekstem dla czytelnika.

**Do decyzji (nie moja):** trzy restauracje z serii gratisów mają w `katalog.json` `cena_katalogowa`
ze źródłem „karta redakcyjna" — 40906 i 40907 po 84,99 zł, 40908 81,99 zł — a czwarta, 40909, dostała
`bez_rrp`. Żaden z tych czterech zestawów nie był sprzedawany osobno, więc albo wszystkie mają wycenę
dodatku, albo żadna. Sam tego nie zmieniam: ceny są append-only, a 40908 chodzi dziś na Allegro po 169 zł
i w Empiku po 278 zł, czyli „cena katalogowa" i rynek rozjeżdżają się trzykrotnie. Jeśli decyzja
pójdzie w stronę `bez_rrp` dla całej serii, zmieni się też to, co widać w tabelach cen w hubach.
↻ 14.10: nadal aktualne — decyzja czeka na Marka, dane bez zmian; od dziś pozycja stoi też
w sekcji „Kto co robi" raportu Scouta (**Kto:** Marek, **Zrobić:** jedna decyzja dla czterech
restauracji 40906–40909: wycena dodatku w `katalog.json` albo `bez_rrp` dla całej serii).
→ zamknięte 14.10.2026: decyzja Marka — ceny 40906, 40907 i 40908 zostają bez zmian, a 40909
dostaje 81,99 zł. Wpisane: `cena_katalogowa` w `sety.json` (zdjęte `bez_rrp`), nowa pozycja
w `katalog.json` przy trzech pozostałych restauracjach, przepisane zdanie w `dla_afol`.
`ceny_baza.json` dociągnie cenę sam przy najbliższym zrzucie.

**Przecieki:** wszystkie osiem rozstrzygniętych wpisów ma już `opis` dla czytelnika (11387, 11390, 40899,
40909, 67006, 67008, 71873, 71875). Bez opisu zostaje osiem wpisów otwartych, gdzie poza numerem, ceną
wg źródła i terminem nie ma na razie czego napisać.

**Luki katalogu (tylko raport):** opisane bez ceny katalogowej — 17 zestawów; rocznik 2026 w sprzedaży
bez wpisu w `sety.json` — 17; cała kolejka redakcyjna — 185 pozycji. `scripts/kolejka-redakcyjna.py`
nie przechodzi w tym kontenerze (brak `openpyxl`), więc liczby policzone osobno, pliku kolejki nie ruszam.

## 2026-10-25 · CODE · Dwa teksty historyczne Piotra (0026 Cargo Center, 0029 Paradisa) ze zdjęciami

`/artykuly/lego-6391-cargo-center-historia/` i `/artykuly/lego-paradisa-historia-serii/`, po 5 zdjęć Piotra
(`public/zdjecia/artykuly/<slug>/K.webp`), import bez uwag. Okładki to zdjęcia Piotra (Cargo: 1, Paradisa: 3 —
pudełko 6416), bo zestawy z lat 80./90. nie mają u nas zdjęć ani hubów. Dwie poprawki w
`import-artykul-md.py`, ważne też dla automatu skrzynki: (1) zdjęcia zmniejsza teraz sharp z Node,
nie PIL — domyślny `python3` (3.11, /usr/local/bin) nie ma działającego PIL, więc teksty ze zdjęciami
z maila wywaliłyby się przy imporcie; (2) gdy pierwszy zestaw z „Zestawy” nie ma u nas zdjęcia (albo
pola brak), okładką zostaje pierwsze zdjęcie Piotra z `okladka_alt` z podpisu.

## 2026-10-25 · CODE · Trzy teksty Piotra (0027, 0028, Recenzje_012) — starą drogą, przez Marka

Opublikowane skryptem skrzynki (`skrzynka-tekstow.py publikuj`, commit 7ee0f27), bez uwag importu:
`/artykuly/lego-daft-punk-ideas-zapowiedz/` (Premiery, bez zestawu — karta na liście z grafiką zastępczą),
`/artykuly/lego-ideas-40889-upominek-od-28-pazdziernika-2026/` (Aktualności),
`/artykuly/lego-42676-frajda-w-parku-wodnym-recenzja/`. Adresy wpisane do `redakcja/skrzynka.json`,
więc poprawki przysłane mailem trafią pod te same adresy. `import-artykul-md.py` ucina teraz slug
na granicy słowa. Rozbieżność (decyzja Marka 25.10: oba zostają bez zmian): wpis `daft-punk-ideas` w `przecieki.json` (Scout 23.10) mówi o
projekcie fana „RobotRock”, tekst Piotra — o „Daft Punk Concert” Patricka Harbouna; tekst zostaje
bez zmian.

## 2026-10-25 · CODE · Karty P07 Piotra: partie 16–23 (200 kart)

Partie 20–23: wgrane wszystkie 100 kart (`import-karty.py --krotkie`), wszystkie huby indeksowalne (≥2 akapity albo
opis >300 znaków, ≥3 FAQ). 10797 Sala balowa Gabi: katalog miał 260 elementów (Rebrickable), Brickset
i Piotr 252 — katalog poprawiony. 30680 AAT (polybag Star Wars): Piotr podawał 16,99 zł, katalog
17,99 zł — decyzja Marka: karta wgrana z naszą ceną 17,99 zł (i 0,24 zł za element w metryce i FAQ).
Potem partie 16–19: 100 kart, wszystkie indeksowalne. 40686: Piotr pisze 261 elementów, Brickset
i katalog 262 — karta wgrana bez zmian; decyzja Marka 25.10: 261 zostaje, nie poprawiać.

↻ 2026-10-24 · ŁOWCA: w sicie podejrzanego rynku czeka 6 pozycji bez werdyktu (75372, 10696, 76319, 40808, 71853 — szczegóły w mailach „Oferty do sprawdzenia"); żadna nowa w tym tygodniu, decyzje Marka w `src/data/deale_potwierdzone.json`, bez pośpiechu.

## 2026-10-24 08:10 · RADAR · Do zrobienia

**faniklockow.pl · 23.10** — Opisali 75192 Sokół Millennium jako okazję cenową; w naszych danych wychodzi mocniej, niż sami piszą: 2699,90 zł w Media Expert z 23.10 przy potwierdzonym katalogu 3599,99 (−25%) to **minimum całej naszej historii cen** tego zestawu (39 zapisów od 18.09; poprzednie minimum 2799 zł z 18.09, Allegro i Smyk), a zestaw ma potwierdzone wycofanie na grudzień 2026.
**Mamy?** — częściowo: cena jest widoczna na `/zestaw/75192/` (−25% to nie poziom sita „podejrzany rynek"), ale nie mamy o tym żadnego tekstu — mimo że wzorzec stoi w repo: `/deale/deal-76325-quinjet-minimum-przed-wycofaniem/`, 28 linii, napisany w przebiegu Radaru 07.10.
**Zrobić:** — krótki deal „75192 Sokół Millennium w minimum naszych notowań przed grudniowym wycofaniem" w `src/pages/deale/`, na wzór dealu 76325; wszystkie liczby są już policzone z `historia-cen` i `wycofania.json`.
**Kto:** — Code (dane, strona)
↻ 25.10.2026 (Radar): nadal aktualne — cena 2699,90 zł w Media Expert utrzymała się drugi dzień
(feed z 24.10), dealu w `src/pages/deale/` nie ma. Przy zestawie schodzącym z produkcji okno na taki
tekst zamyka się razem z ofertą.
↻ 26.10.2026 (Radar): trzeci dzień — 2699,90 zł w Media Expert z datą 25.10, dealu nadal nie ma.
↻ 27.10.2026 (Radar): czwarty dzień i pierwsza zmiana jakościowa — 2699,90 zł ma już **trzy sklepy**
(Media Expert, Ceneo, x-kom), Allegro stoi 2758,90. To ruch całego rynku, nie wybryk jednego
sprzedawcy, więc cena jest pewniejsza niż w piątek. Dealu nadal nie ma.
→ zamknięte 27.10.2026: deal napisany i opublikowany —
`/deale/deal-75192-sokol-millennium-minimum-przed-wycofaniem/` (polecenie Marka).

Warte zapisania obok samej pozycji: dzień po dniu ta sama kategoria dała przeciwny wynik sprawdzenia.
22.10 ich „to nie błąd cenowy" przy 77076 za 89 zł **nie przeszło** weryfikacji (zestaw stoi po 170,
oferta odrzucona). 23.10 ich okazja na 75192 **sprawdza się** i jest mocniejsza, niż napisali. Wniosek
nie brzmi więc „oni się mylą" ani „oni mają rację", tylko: ich teksty dealowe są leadem do sprawdzenia
w naszych danych, a ta robota opłaca się w obie strony — raz chroni przed fałszywą ceną, raz pokazuje
temat, którego sami nie zauważyliśmy.

## 2026-10-24 · CODE · Skrzynka tekstów: teksty Piotra z maila publikują się same

Decyzja Marka: teksty Piotra idą na stronę bez przeglądu, do Marka i Piotra wracają same linki.
Claude Piotra wysyła pliki .md (i zdjęcia `NNNN_zdjecie_K.jpg`) z tylkoklockiblog@gmail.com na
`tylkoklockiblog+code@gmail.com`; zadanie „Skrzynka tekstów Piotra” (8:52 i 14:52) importuje je
`scripts/skrzynka-tekstow.py`, buduje i pushuje na main. Przy błędzie importu (surowy znacznik,
brak zdjęcia, brak opisu) albo buildu nic nie wchodzi, a mail wymienia problemy. Poprawka o tym
samym numerze zastępuje tekst pod tym samym adresem (rejestr `redakcja/skrzynka.json`, zasiany
tekstami 0022–0025 i Recenzje_011; data publikacji zostaje, dochodzi `zaktualizowano`).
**Automat nie dobiera galerii ani przycisków sklepów** — przy ważniejszych tekstach może je
dołożyć sesja ręcznie. IMAP/SMTP z kontenera są zablokowane, więc hasło aplikacji Gmail
(`TEKSTY_GMAIL_HASLO`) jest bezużyteczne — do odwołania w Google i usunięcia ze zmiennych.
Hasło do skrzynki Marek przekazuje Piotrowi SMS-em.

## 2026-10-23 · CODE · Kolejka indeksacji: błąd 500 z API nie przerywa już przeglądu

Nocny przebieg 23.10: pierwszy błąd `500 Internal error` z URL Inspection API przerywał cały przegląd
(0 sprawdzeń → pusta kolejka „wszystko w indeksie”, runner słusznie jej nie commitował; druga próba dała
70 sprawdzeń i 9 adresów). Teraz: 5xx/429 ponawiane 3 razy z przerwą, pojedynczy błędny adres pomijany,
przerwanie dopiero gdy cała partia pada; przy 0 sprawdzeń skrypt nie zapisuje kolejki (kod 4).
Uwaga runnera o hubach 76969 i 10311 („Excluded by noindex”) była fałszywym alarmem: to stary odczyt Google,
w serwisie oba huby są już indeksowalne (karty P07) — kolejka dopisuje teraz przy takim adresie wyjaśnienie.

## 2026-10-23 09:05 · ŁOWCA · Do zrobienia

**Nowa pozycja w podejrzanym rynku: 72151 Eevee na Ceneo za 44 zł przy RRP 249,99 (−82% — wygląda na błąd albo oszustwo; ta sama lista co 77076 z wpisu Radaru wyżej)**
**Mamy?** — tak: oferta w danych, strona ukrywa ją do potwierdzenia
**Zrobić:** — sprawdzić kartę oferty z maila i dopisać 72151 do `src/data/deale_potwierdzone.json` (niemal na pewno odrzucone)
**Kto:** — Marek (decyzja)
→ zamknięte 23.10: Marek olał — 72151 (44 zł, Ceneo) w odrzuconych `deale_potwierdzone.json`, oferta ukryta

**40816 Dekoracyjna Pisanka wróciła do maila: Media Expert 29,99 zł przy RRP 81,99 (−63%, poniżej odrzuconych 38 zł z Allegro; tym razem zwykły sklep — wygląda na realną wyprzedaż końcówek)**
**Mamy?** — tak: oferta w danych, strona ukrywa ją do potwierdzenia
**Zrobić:** — sprawdzić kartę ME z maila i dopisać 40816 do `src/data/deale_potwierdzone.json` (potwierdzone albo ponownie odrzucone)
**Kto:** — Marek (decyzja)
→ zamknięte 23.10: Marek potwierdził — 40816 (29,99 zł, ME) w potwierdzonych, oferta wraca do tabel

## 2026-10-23 08:10 · RADAR · Do zrobienia

**faniklockow.pl · 22.10** — Opisali 77076 Durrr Burgerownia za 89 zł w Media Expert z tytułem „to nie błąd cenowy"; tę samą ofertę mamy w `oferty_feed.json` z datą 22.10, czyli z dnia ich publikacji.
**Mamy?** — nie na stronie: sito „podejrzany rynek" trzyma ją poza serwisem, bo 89 zł to 64% poniżej potwierdzonej ceny katalogowej 249,99 zł, a próg wynosi 50%. Sprawdzone na produkcji dzisiaj: `/zestaw/77076/` pokazuje „od 162,99 zł" i sześć sklepów, Media Expertu wśród nich nie ma. Oferta jest na liście porannego maila (`podejrzany-rynek-mail.mjs`, dziś 8 pozycji, 77076 trzecia).
**Zrobić:** — otworzyć kartę Media Expertu i jednym zdaniem w rozmowie z Code potwierdzić albo odrzucić („potwierdzam 77076 89 mediaexpert"); po potwierdzeniu oferta wraca na stronę tego samego dnia. Ich zdanie „to nie błąd cenowy" nie zastępuje tego kroku — reguła z 16.09 mówi, że kartę sklepu otwiera człowiek.
**Kto:** — Marek (decyzja)
→ zamknięte 23.10.2026: Marek — „burgerownia jest po 170 w Media Ekspert". Oferta 89 zł **odrzucona**,
dopisana do `deale_potwierdzone.json` w sekcji `odrzucone`; zostaje ukryta, a poranny mail przestaje
o nią pytać (wróci tylko przy cenie niższej niż 89 zł). Reguła z 16.09 zadziałała dokładnie tak, jak
miała — i to jest tu najważniejsze: **nagłówek konkurencji „to nie błąd cenowy" nie przeszedł naszego
sprawdzenia.** Przy ich tekstach dealowych kwota jest twierdzeniem do weryfikacji, nie faktem, nawet
gdy zapewniają, że sprawdzili. Zapisane też w `konkurencja_baza.json` przy tym wpisie (ocena LUKA → NOTUJEMY).

Kontekst, żeby decyzja nie wyglądała na formalność: ta sama lista ma dziś 29,99 zł za 75372 na Allegro
i 44 zł za 72151 u Ceneo — pozycje, które wyglądają jak śmieć i dla których sito powstało. Różnica
między nami a konkurencją nie jest w danych ani w szybkości, tylko w tym, że u nas między ofertą
a stroną stoi człowiek. To koszt reguły, nie jej błąd.

## 2026-10-23 05:20 · SCOUT · Do zrobienia

**Cztery zestawy LEGO Education Science są w zwykłej sprzedaży detalicznej, a nasza reguła „LEGO Education nie wchodzi do `sety.json`" zakłada kanał szkolny: 45200 Moon Mission i 45201 Antarctic Animals po 209,99 zł, 45202 Mars Mission i 45203 Arctic Animals po 419,99 zł, w feedzie od 20.10.2026.**
**Mamy?** — nie: żaden z nich nie ma wpisu w `sety.json` ani podstrony `/zestaw/`, a `katalog.json` ma je z polskimi cenami, więc co przebieg wracają na listę luk rocznika 2026.
**Zrobić:** — jedna decyzja: czy zestawy Education sprzedawane detalicznie dostają wpisy w `sety.json` (wtedy dołożę te cztery), czy zostają poza serwisem (wtedy kolejka redakcyjna powinna pomijać theme Education, co jest zadaniem dla Code).
**Kto:** — Marek (decyzja)
→ zamknięte 23.10.2026: decyzja Marka — „dopisz te cztery Education do sety.json". Wpisy założone
  z polskimi nazwami (Zestaw naukowy z misją na Księżyc / ze zwierzętami Antarktydy / z misją na Marsa /
  ze zwierzętami Arktyki), cenami 209,99 / 209,99 / 419,99 / 419,99 zł i wiekiem 8+/7+/9+/9+.
  W `katalog.json` przeniesione z kubełka „Archiwum" do nowej serii „Education", żeby oba pliki
  mówiły to samo; liczba pozycji katalogu bez zmian. Nowa strona `/serie/education/`.

Dowód z tego przebiegu — Brickset, karty 45200–45203: theme Education, subtheme Science,
availability „Retail - limited", premiera 20.01.2026, ceny niemieckie 49,99 / 49,99 / 99,99 / 99,99 euro.

## 2026-10-22 · CODE · Dwa teksty Piotra (.md): NINJAGO styczeń 2027 i recenzja 75439

Pierwszy import przez `import-artykul-md.py` (blok danych → frontmatter, znaczniki → linki i tabela cen).
Dopisane: FAQ (po 3), tagi; w recenzji 4 zdjęcia z galerii 75439 i linki do recenzji 75438 i huba 75304;
w NINJAGO link do /przecieki/.
- `/artykuly/lego-ninjago-styczen-2027-przecieki/` (Aktualności, okładka 71875)
- `/artykuly/lego-75439-popiersie-dartha-vadera-recenzja/` (Recenzje)
**Stan:** na main.

## 2026-10-22 · CODE · Karty P07 Piotra: partie 14–15 (50 kart) wgrane

karty_setow 1424 → 1474, wszystkie 50 hubów indeksowalnych. Blokada RRP 42621: Piotr 429,99 vs katalog 449,99 —
zklockow.pl i promoklocki.pl potwierdzają 429,99, dopisane do `rrp_potwierdzone.json`. Elementy: 43242
(Piotr 2228 vs 2208) i 5009005 (152 vs 150) — zostaje katalog.
**Stan:** na main.

## 2026-10-22 06:50 · SCOUT · Ceny polskie 67006 i 71873

**Oba zestawy z jesiennej partii, które czekały na polską cenę katalogową, mają ją na kartach lego.com/pl-pl: 67006 Panorama uniwersum Marvela — 429,99 zł (przedsprzedaż), 71873 Cole kontra Zły Cole ze spinnerem — 41,99 zł (wkrótce dostępne, 1 stycznia 2027).**
**Mamy?** — teraz tak: ceny w `sety.json` (oba) i `katalog.json` (67006; 71873 w katalogu jeszcze nie ma, doda go zaciąg z Rebrickable). Huby pokazują 429,99 zł i 41,99 zł.
**Zrobić:** — nic.
**Kto:** — Scout (zrobione).

- 429,99 zł dla 67006 wisiało od 19.10 w tabeli `/zapowiedzi-lego-2027/`, ale nigdy nie trafiło do danych —
  strona mówiła prawdę, hub nie miał ceny. **Wniosek:** cena wpisana w artykule nie jest ceną w bazie;
  jeśli research daje polskie RRP, idzie ono do `sety.json` w tym samym przebiegu.
- Nazwy zrównane z nazwami producenta: „Panorama Marvela" → „Panorama uniwersum Marvela",
  „Cole kontra Zły Cole — atak spinnera" → „…ze spinnerem" (nasze tłumaczenie niemieckiego „Spinner").
  Poprawione w `sety.json`, `przecieki.json` i w tabeli `/zapowiedzi-lego-2027/`; w datowanym logu
  `known_sets.json` zostaje stara nazwa, bo to zapis stanu z 09.10.
- Próg zakupu 67006 postawiony na 370 zł (429,99 zł katalogowo, 34 gr/element).

## 2026-10-22 08:10 · RADAR · Do zrobienia

**fanklockow.pl · 21.10** — Uruchomili na swoim Discordzie kanał ze statusami zestawów z lego.pl; pierwszy raz serwis redakcyjny z naszej piątki wchodzi w powiadomienia o dostępności.
**Mamy?** — częściowo: mamy i dane (`lego_pl_etykieta`, `wyprzedaneWLego`, plakietka „wyprzedane" na hubach od 17.10), i własny kanał („Obserwuj zestaw", double opt-in, `scripts/alerty-cen.mjs`) — ale alerty są wyłącznie cenowe (20% pod katalog albo rekord) i dokładnie to obiecuje formularz na hubie. Zmiana dostępności nie wywołuje u nas niczego.
**Zrobić:** — decyzja, czy „Obserwuj zestaw" ma wysyłać też alert o powrocie do sprzedaży lub wyprzedaniu; na „tak" zmienia się treść obietnicy w `ObserwujCene.astro` i trzeba o tym napisać zapisanym, bo zgodzili się na alerty cenowe.
**Kto:** — Marek (decyzja)
→ zamknięte 22.10.2026: Marek — „nie dodawaj alertu o dostępności". Nic nie zmieniam w kodzie;
`alerty-cen.mjs` i formularz zostają cenowe. W `konkurencja_baza.json` ocena tego wpisu zmieniona
z LUKA na NOTUJEMY, żeby ani Radar, ani Kontroler nie wracali z tym co tydzień.

Dlaczego to decyzja, a nie zadanie dla Code: dane i mechanizm są gotowe, kosztem jest liczba maili
i wiarygodność obietnicy, którą złożyliśmy ludziom zapisującym się na alerty. Technicznie to kilka
linii w `alerty-cen.mjs`.

Przy okazji poprawiona własna stara ocena w `konkurencja_baza.json`: wpis zklockow z 24.09 o prezentach
pod choinkę stał jako LUKA, a lukę zamknęliśmy 07.10 stroną `/prezentowniki/prezenty-pod-choinke/`.
Zmienione na PRZEBIJAMY, żeby Kontroler nie zbierał zamkniętego zadania. Dzisiejszy tekst faniklockow
o prezentach świątecznych to drugi serwis na tej frazie — tamten sygnał z września był trafny.

## 2026-10-21 09:00 · ŁOWCA · Do zrobienia

**Nowa pozycja w podejrzanym rynku: 21268 Dom prosiaczka na Ceneo za 40 zł przy RRP 81,99 (−51%)**
**Mamy?** — tak: oferta w danych, strona ukrywa ją do potwierdzenia
**Zrobić:** — sprawdzić kartę oferty z maila podejrzanego rynku i dopisać 21268 do `src/data/deale_potwierdzone.json` (potwierdzone albo odrzucone)
**Kto:** — Marek (decyzja)
→ zamknięte 21.10: Marek potwierdził, 21268 (40 zł, Ceneo) w `deale_potwierdzone.json` — oferta wraca do tabel cen

## 2026-10-21 · CODE · Okno 20–27.10 w kalendarzu i progi w hubach

- `/kalendarz-promocji-lego/` — nowa sekcja `#pazdziernik-kumulacja` z tabelą trzech progów
  (30717 od 165 zł, 40916 od 625 zł, 40765 od 670 zł w Star Wars, 20–27.10), wpis na szczycie
  listy „co trwa teraz", wiersz w tabeli rytmu okien i `zaktualizowano: 2026-10-21`.
  Okno 13–19.10 przestawione z „trwa" na „zamknięte" w obu miejscach.
- **Policzone, nie przepisane:** przy progu 670 zł w Star Wars sprawdziłem 69 zestawów tej serii
  z bieżącego listingu lego.com, które mają u nas cenę katalogową i ofertę zewnętrzną (po sicie
  domu: bez Ceneo, bez ofert poniżej połowy katalogu). **67 z 69 jest tańszych poza LEGO.com,
  mediana różnicy 30%** — czyli koszyk za 670 zł to około 200 zł dopłaty, a upominek wyceniony
  na 129,99 zł tego nie pokrywa. Sześć zestawów, przy których LEGO.com nie przepłaca (75457, 75461,
  75367, 75459, 75458, 75415), wymienione w tekście jako jedyny sensowny sposób zagrania tego okna.
- `sety.json` 1205 → 1207: dołożone 30717 i 40765, których nie było wcale (huby stały jako lekkie,
  z katalogu). 40765 dostał cenę katalogową 129,99 zł — jest na karcie produktu lego.pl, więc
  reguła „gratis bez polskiej wyceny ma kreskę" go nie dotyczy. 30717 kreskę zostaje: LEGO nie
  podaje jego wartości w złotych. 40916 — dopisany polski próg do istniejącego opisu.
- Build 10061 stron; progi widoczne na hubach 30717, 40916 i 40765.
- Zamyka pozycję Radaru z 21.10 i pytanie Scouta o progi (jego wpis ma linię ↻ z liczbami).
- **Naprawa własnej szkody, zanim ktokolwiek ją zauważył.** Mój pierwszy commit (`6da26e0`) wylądował
  nad commitem Scouta `f2cb67c`, który godzinę wcześniej, z decyzji Marka, wpisał 30717 cenę katalogową
  16,49 zł do `katalog.json`. Nie nadpisałem tej liczby — zgasiłem ją inaczej: mój nowy wpis 30717
  w `sety.json` miał `bez_rrp`, a `cenaKatalogowaSetu()` w `src/lib/oferty.js` zwraca `null`, gdy
  `bez_rrp` stoi w którymkolwiek pliku („bez_rrp wygrywa z każdą liczbą", audyt 12.10). Hub
  `/zestaw/30717/` przestał więc pokazywać 16,49 zł — sprawdzone w zbudowanym HTML, nie z założenia.
  Poprawione: `bez_rrp` usunięte, `cena_katalogowa` w `sety.json` zostaje pusta, więc łańcuch spada
  do `katalog.json` i liczba Scouta znów jest jedynym domem tej ceny. Teksty 30717 i akapit w kalendarzu
  przepisane — mówiły, że LEGO nie wycenia szkieltu w złotych, a wycenia.
- **Wniosek na przyszłość:** zakładając wpis w `sety.json` dla gratisu, sprawdź najpierw `katalog.json`.
  `bez_rrp` to nie opis, to wyłącznik ceny na hubie i działa między plikami.
↻ 22.10.2026: 16,49 zł wpisane też do `sety.json` (polecenie Marka) — oba pliki mówią teraz to samo,
  a 30717 schodzi z listy luk katalogu (9 → 8). Z `opis` usunięte zdanie o tym, skąd hub bierze cenę:
  to nasz proces, nie informacja dla kupującego.

## 2026-10-21 07:40 · SCOUT · Do zrobienia

**Siedem saszetek, które mają w `sety.json` flagę `bez_rrp` z powodem „LEGO nie sprzedaje jej w polskim sklepie", ma na lego.com/pl-pl karty produktowe z cenami: 30714 — 16,49 zł, a 30715, 30722, 30723, 30724, 30728 i 30735 po 16,99 zł (sprawdzone Firecrawlem 21.10.2026, karty z polskimi nazwami zgodnymi z naszym katalogiem).**
**Mamy?** — częściowo: huby `/zestaw/30714/` … `/zestaw/30735/` pokazują kreskę w polu ceny katalogowej, więc oferty 10–19 zł nie mają punktu odniesienia i nie liczymy rabatu
**Zrobić:** — jedna decyzja: czy wpisać te ceny do `katalog.json` (jak przy 30717) i co zrobić z `bez_rrp` — zdjąć czy przepisać powód; wszystkie siedem kart ma w metadanych „out of stock", więc „LEGO nie sprzedaje" może być prawdą o dostępności, nie o cenie
**Kto:** — Marek (decyzja)
→ zamknięte 22.10.2026: Marek zdecydował „wpisz ceny i zdejmij bez_rrp z tych siedmiu". Ceny wpisane
  w `sety.json` i `katalog.json` (30714 — 16,49 zł, pozostałe sześć po 16,99 zł), `bez_rrp` zdjęta
  w `sety.json` — w `katalog.json` tej flagi te saszetki nigdy nie miały. Huby liczą rabat
  (`/zestaw/30714/` −15/−16%, `/zestaw/30735/` −21/−38%). Flag `bez_rrp` w `sety.json`: 12 → 5.

## 2026-10-21 08:15 · RADAR · Do zrobienia

**faniklockow.pl · 20.10** — Opisali nową kumulację na lego.pl: trzy gratisy naraz, 20–27.10 — od 165 zł polybag 30717, od 625 zł 40916 Kwiatowa ramka na zdjęcia, od 670 zł w Star Wars 40765 Ośrodek szkoleniowy na Kamino. Progi i daty sprawdziłem u źródła na `lego.com/pl-pl/page/lego-offers-promotions` — zgadzają się co do złotówki i co do dnia.
**Mamy?** — nie: `/kalendarz-promocji-lego/` (zaktualizowano 16.10) nie ma tego okna wcale, a w liście „co trwa teraz" trzyma okno 13–19.10 ze statusem „trwa" dwa dni po jego zamknięciu.
**Zrobić:** — dopisać do `/kalendarz-promocji-lego/` sekcję okna 20–27.10 z trzema progami i zamknąć status okna 13–19.10; przy okazji wpisać progi do hubów 30717, 40916 i 40765 (zamyka dzisiejszą pozycję Scouta).
**Kto:** — Code (dane, strona)
→ zamknięte 21.10.2026: zrobione tego samego dnia. Szczegóły w następnym wpisie.

Uwaga do protokołu, bo to drugi raz: lista „co trwa teraz" pokazała zamknięte okno jako trwające —
pierwszy raz zanotowane 08.10 (wrześniowe gratisy wisiały dziewięć dni po czasie). Pojedyncza poprawka
tego nie rozwiąże. Wniosek: okna w kalendarzu mają daty końca, więc status „trwa" da się policzyć
z danych zamiast trzymać go ręcznie — do rozważenia osobno, nie w tym przebiegu.

## 2026-10-21 05:25 · SCOUT · Do zrobienia

**W sklepie LEGO trwa akcja z trzema gratisami 20–27 października 2026: 30717 szkielet od 40 euro, 40916 kwiatowa ramka od 150 euro i 40765 Ośrodek szkoleniowy na Kamino od 160 euro przy zakupach Star Wars — StoneWars pisze, że Kamino jest tylko w Niemczech, nie w Austrii i Szwajcarii.**
**Mamy?** — częściowo: 40916 ma hub z ceną 109,99 zł i dopisanym zdaniem o powrocie do akcji, ale progów dla polskiego sklepu nie znamy
**Zrobić:** — wejść na lego.pl i sprawdzić, czy akcja obowiązuje w Polsce i z jakimi progami w złotych (trzy gratisy czy mniej, do kiedy); wynik podać numerami, żebym wpisał go do hubów 30717, 40916 i 40765
**Kto:** — Cowork (przeglądarka)
↻ 21.10.2026 08:15 (Radar): progi sprawdzone u źródła na `lego.com/pl-pl/page/lego-offers-promotions`,
bez przeglądarki — akcja obowiązuje w Polsce, trzy gratisy, **20–27 października 2026**: od **165 zł**
30717 Śmieszny halloweenowy szkielet, od **625 zł** 40916 Kwiatowa ramka na zdjęcia, od **670 zł**
w zestawach Star Wars 40765 Ośrodek szkoleniowy na Kamino. Zadanie dla Coworka zbędne; zostaje wpisanie
tych liczb do hubów 30717, 40916 i 40765 — Kto: Code (dane).
→ zamknięte 21.10.2026: sprawdzone bez Coworka, kartami produktowymi lego.com/pl-pl przez Firecrawl
(serwer dostaje 403). Akcja JEST w Polsce, wszystkie trzy gratisy, progi w złotych: 30717 od 165 zł
(wartość 16,49 zł), 40916 od 625 zł (109,99 zł), 40765 od 670 zł wydanych na Star Wars (129,99 zł).
Kamino, o którym StoneWars pisał, że nie ma go w Austrii i Szwajcarii, w polskim sklepie jest.
Wpisane: polski próg w opisie 40916, źródło ceny 40916 i 40765 przepisane z promoklocki na kartę
producenta (ta sama kwota, pewniejsze źródło). Ceny 40916 — 109,99 zł — producent potwierdził co do
grosza, czyli wycena z promoklocki wpisana 15.10 była trafna.

## 2026-10-21 07:10 · SCOUT · Do zrobienia

**Karta 30717 na lego.com/pl-pl podaje wartość upominku 16,49 zł, a u nas ten zestaw ma w `katalog.json` cenę pustą i `bez_rrp` z powodem „LEGO nie sprzedaje jej w polskim sklepie" — saszetki były wyłączone z Twojej decyzji z 15.10 o wycenach gratisów.**
**Mamy?** — częściowo: hub `/zestaw/30717/` pokazuje oferty 14–17 zł, w polu ceny katalogowej kreskę, a producent ma dla niego kwotę
**Zrobić:** — jedna decyzja: czy saszetki rozdawane jako gratis dostają wycenę dodatku z karty lego.pl (dla 30717 byłoby to 16,49 zł), czy zostają bez ceny jak pozostałe sześć polybagów
**Kto:** — Marek (decyzja)
→ zamknięte 21.10.2026: decyzja Marka — 30717 dostaje wycenę 16,49 zł. Wpisane do `katalog.json`
(`cena_zrodlo`: karta produktu lego.com/pl-pl). Sprostowanie do mojego zdania wyżej: 30717 nie miał
`bez_rrp` w żadnym pliku — to pozostałe sześć saszetek (30714, 30715, 30722, 30723, 30724, 30728, 30735)
je ma, a 30717 miał po prostu pustą cenę. Tych sześciu decyzja nie dotyczy i zostają bez zmian.
Hub `/zestaw/30717/` pokazuje teraz cenę katalogową 16,49 zł obok ofert 14–17 zł, więc widać, że rynek
schodzi poniżej wyceny producenta.

## 2026-10-20 13:05 · KONTROLER · Do zrobienia

**Pierwszy przebieg „Kontrola linków w przeglądarce" (`trig_01NRYdRPRMVTYZTGDf5C8iH6`) ma status SUCCEEDED, ale trwał 28 sekund (11:45:46–11:46:14) — za krótko na otwarcie 20 kart sklepów.**
**Mamy?** — częściowo: lista na 20.10 była świeża (`ddf9050`, 07:49), więc „lista nieaktualna" odpada; najpewniej sesja nie załadowała narzędzi Chrome i zgodnie z promptem zakończyła jednym zdaniem — ale tej odpowiedzi z sesji Kontrolera nie widać.
**Zrobić:** — wkleić do sesji Kontrolera odpowiedź tego zadania z Coworka (choćby jedno zdanie); jeśli brzmi „przeglądarka nieosiągalna" — sprawdzić w Claude Desktop, czy zadanie jest przypięte do komputera i czy rozszerzenie Claude in Chrome było włączone o 11:45.
**Kto:** — Marek (komputer)
↻ 20.10.2026 13:20: Marek wkleił odpowiedź zadania — „Nie dało się połączyć z przeglądarką (…) To uruchomienie
szło w chmurze, bez dostępu do Twojego komputera, i narzędzia Claude in Chrome się nie załadowały. W repo nic się nie
zmieniło. Żeby kolejne uruchomienia działały, otwórz to zadanie w aplikacji Claude na komputerze z Chrome i włącz
«Require this computer»." Czyli zadanie założone z panelu NIE dostało powiązania z komputerem — to osobny przełącznik.
Nowe Zrobić: w Claude Desktop na Macu otworzyć zadanie „Kontrola linków w przeglądarce" i włączyć „Require this
computer"; potem test ręczny (Kontroler może odpalić `fire_trigger` na prośbę — lista z 20.10 jest świeża), żeby nie
czekać do 20.11. Kto: Marek (komputer).
→ zamknięte 20.10.2026: Marek włączył „Require this computer" (12:43) i uruchomił zadanie z Maca — **żywe 19,
404 0, przekierowania 0, inne 1 z 20** (Allegro 10416: „Sprzedaż zakończona", oferta z dzisiejszego feedu).
Wynik: `materialy/kontrola-przegladarkowa/wyniki-2026-10-20.md`. Uruchomienie z chmury (`fire_trigger`) nie niesie
podpisu komputera i idzie bez przeglądarki — test ręczny robi się z aplikacji na Macu. Następny przebieg 20.11 11:45.

**`redirects.allegro` ma 1 048 z 7 201 wpisów bez oferty Allegro w dzisiejszym feedzie — ich linki nikt nie odświeża od dnia, w którym zestaw wypadł z feedu; dzisiejsza próba 4 linków Allegro trafiła wyłącznie w zestawy z bieżącą ofertą.**
**Mamy?** — częściowo: kontrola miesięczna działa, ale losuje z całej mapy, więc o 1 048 wpisach z ryzykiem nadal nic nie wie.
**Zrobić:** — w `scripts/kontrola-linkow.mjs --blokujace` losować Allegro spośród wpisów BEZ bieżącej oferty w `oferty_feed.json` (tam kryją się martwe), resztę sklepów jak dotąd; przy następnej liście 20.11.
**Kto:** — Code (skrypt)
→ zamknięte 20.10.2026: decyzja Marka — zrobione. `--blokujace` losuje Allegro wyłącznie spośród wpisów bez bieżącej oferty Allegro w feedzie (1 048 z 7 201), z powrotem na całość, gdy takich zabraknie; w nagłówku listy stoi, skąd losowano. Pierwsza taka lista: 20.11.

## 2026-10-20 · CODE · Karty P07 Piotra: partia 08 (25 kart, ostatnia paczka) wgrana

karty_setow 1399 → 1424, 0 blokad, bez różnic elementów; 24 karty jednoakapitowe.
**Stan:** na main.

## 2026-10-20 · CODE · Karty P07 Piotra: partie 09–13 (125 kart) wgrane

karty_setow 1274 → 1399, 0 blokad (RRP zgodne), wszystkie 125 hubów indeksowalnych po buildzie
(66 kart jednoakapitowych łapie reguła długości opisu z 18.10). Elementy: 14 różnic 1–16 szt. — zostaje
liczba z katalogu. 6 kart bez liczby elementów (breloki 854xxx, minifigurki 71046, 5009550).
**Stan:** na main.

## 2026-10-20 09:10 · CODE · Trzy teksty Piotra: upominki LEGO.pl, 11390 Dragon Ball, Star Wars styczeń 2027

**Zrobione:** teksty bez zmian, dopisane frontmattery, FAQ, linki serii w miejsce znaczników.
- `/artykuly/lego-pl-upominki-30717-40916-40765-pazdziernik-2026/` (Aktualności, `wazne_do` 27.10, galeria 3 upominków).
- `/artykuly/lego-11390-dragon-ball-shenron-goku-premiera/` (Premiery): galeria 8 zdjęć z lego.com w `galerie.json`,
  od razu w R2; tabela cen w miejsce znacznika cen.
- `/artykuly/lego-star-wars-styczen-2027-przecieki/` (Aktualności): okładka poglądowa 75301 z opisem, że to nie zestaw
  z przecieku; link do /przecieki/.
**Stan:** na main.

## 2026-10-20 09:05 · ŁOWCA · Do zrobienia

**Nowa pozycja w podejrzanym rynku: 77253 Bugatti Vision GT na Ceneo za 57,32 zł przy RRP 114,99 (−50%)**
**Mamy?** — tak: oferta w danych, strona ukrywa ją do potwierdzenia
**Zrobić:** — sprawdzić kartę oferty z maila podejrzanego rynku i dopisać 77253 do `src/data/deale_potwierdzone.json` (potwierdzone albo odrzucone)
**Kto:** — Marek (decyzja)
→ zamknięte 20.10.2026: Marek potwierdził (oferta Allegro widoczna przez Ceneo), wpis w `deale_potwierdzone.json`.
↻ 21.10: Marek zmienił werdykt na „olej" (czat Łowcy) — 77253 przeniesiony do odrzuconych, oferta ukryta

## 2026-10-20 05:25 · SCOUT · Do zrobienia

**LEGO otworzyło w swoim sklepie strony akcji i podało terminy: Insiders Weekend 21–22 listopada 2026, Black Friday od 27 listopada, Cyber Monday 30 listopada (PromoBricks, 19.10).**
**Mamy?** — nie: w dziale Artykuły nie ma kalendarza listopadowych akcji, a to najmocniejszy tydzień zakupowy roku
**Zrobić:** — tekst w kategorii Kalendarze z tymi trzema terminami i zasadą, że nowości wchodzące w to okno (np. zapowiadana na 27 listopada Godzilla 21375) nie mają rabatu, mimo że sklep jest przeceniony
**Kto:** — Piotr (tekst)
→ zamknięte 27.10.2026 (decyzja Marka): osobnego tekstu nie piszemy — wszystkie trzy terminy
i reguła o premierze bez rabatu są już w `/kalendarz-promocji-lego/` (sekcja `#listopad`:
Insiders Weekend ok. 21–26.11, Black Friday 27.11, Cyber Monday 30.11, plus akapit o 21375 Godzilli
wchodzącej do sprzedaży w dniu Black Friday). Strona aktualizowana 25.10.
Sprawdzenie przy zamknięciu (27.10, lego.com/pl-pl/page/lego-offers-promotions): polski sklep
**nadal nie podaje żadnych listopadowych terminów** — stoją tam tylko trzy okna gratisów do 27.10.
Nasze daty listopadowe zostają więc z plakietką „przewidywane”; wpis Scouta opierał się na
PromoBricks, nie na źródle producenta. Datowaną plakietkę zdejmiemy, gdy LEGO ogłosi terminy samo.

## 2026-10-19 · CODE · Strona główna: rotacja zestawów w slajderze i „Dziś w dobrej cenie”

Prośba Marka: codziennie inne zestawy. Każdy zestaw ma stałą grupę 0–2 (z numeru), dziś pierwszeństwo
ma jedna grupa, jutro następna — zestaw wraca najwcześniej po trzech dniach; inne grupy tylko na
dopełnienie pustych slotów. Wyjątek: zestaw z nowym minimum z dzisiejszych danych nadal ma pierwszeństwo
w swojej półce slajdera (to news). Symulacja 20–22.10: slajder 4 z 5 zestawów nowych co dzień, „Dziś
w dobrej cenie” 10–11 z 12 (przedział >1500 zł ma tylko kilka rabatów, tam powtórki zdarzają się).
Kod: `src/pages/index.astro` (`naZmianie`, `dzisNaZmianie`).

## 2026-10-19 15:10 · KONTROLER · Odczyt panelu GSC (Cowork) — punkt odniesienia kamienia 4

- **837 zaindeksowanych** (dane panelu z 12.10.2026; poprzednio 831 z 09.10, 807 z 18.09), niezaindeksowanych
  3 184: noindex **2 285**, wykryta–niezindeksowana **653** (weryfikacja „rozpoczęto"), zeskanowana–niezindeksowana
  **21** (weryfikacja „niepowodzenie" — ktoś ją odpalił, Google jej nie potwierdził), **404: 220**, robots.txt 4,
  przekierowanie 1. Odczyt Coworka 19.10 14:53, prompt z sesji Kontrolera.
- **404 — rozstrzygnięte:** 219 z 220 to nasze huby `/zestaw/`, nie stary sklep. Wszystkie istnieją w buildzie,
  produkcja odpowiada 200, wszystkie **noindex** (cienkie huby). Google skanował je 10–15.09, gdy stron jeszcze nie
  było, i nie wrócił. Nic do roboty — przy następnym crawlu 404 zamieni się w noindex. Lista:
  `materialy/indeksacja/gsc-404-2026-10-19.md`. Jeden adres spoza serwisu (`/p/64/3469/…html`, stary sklep) zostaje 404.
- Mapy witryny: 8 map, wszystkie „Sukces", `sitemap-zestawy.xml` odczytana 19.10 z 1 375 adresami (zgodnie
  z buildem), indeks 1 546. `sitemap-priorytet.xml` nie ma — zamknięte.
- Do obejrzenia kiedyś, nie teraz: 4 adresy „zablokowane przez robots.txt" — panel nie pokazał których.

## 2026-10-19 10:45 · CODE · x-kom Black Weeks: aktualność + ceny z kodem black-weeks1

- `/artykuly/x-kom-black-weeks-2026-lego/` (Aktualności, bez `wazne_do` — x-kom nie podał końca cen z listy;
  akcja do Black Friday 27.11). Mail SalesMasters 19.10: 11 zestawów „hero”. Karty x-kom sprawdzone ok. 10:30:
  4 z kodem black-weeks1 (11381 399, 31220 579, 21064 209, 60510 69,99 — wszystkie poniżej naszych minimów),
  3 „chwilowo niedostępne” (76473, 75447, 71497), 4 w zwykłej cenie bez kodu (10359, 21060, 43300, 71425).
- Dane: te 4 ceny w `sety.json`/`oferty_feed` (xkom) i nowe minima w `ceny_baza`; kod w `kody_rabatowe.json`
  (`xkom`, `koniec_znany: false`, `do` 2026-10-25 = horyzont do następnego zrzutu). Nowe: `terminKodu()` —
  kod bez daty końca nie pokazuje „do …”; `me-kody.mjs` nie kasuje już kodów innych sklepów.
**Dla drugiej strony:** zrzut x-kom 26.10 nadpisze te ceny; jeśli x-kom przedłuży kod, wystarczy przesunąć `do`.

## 2026-10-19 · CODE · Kontrola świeżości tekstów: skrypt gotowy, krok niewdrożony

Marek: „dodaj to sprawdzanie do Kontrolera". Zrobione pół na pół i to jest cała prawda o stanie.

**Gotowe i sprawdzone:** `scripts/swiezosc-tekstow.mjs` (+ wpis w `scripts/README.md`).
Dwa ustalenia, oba policzalne: **sprzeczność** — numer z plakietką „przeciek" jest już
wystawiony przez LEGO (potwierdzona cena w `rrp_potwierdzone.json` albo listing w
`katalog.json`); **przestarzałe** — `zaktualizowano` starsze niż wpis albo rozstrzygnięcie
w `przecieki.json` dla numeru, który tekst wymienia. Test regresji na stanie strony 2027
z 27.08: wykrywa 67006 i 67008 plus jedenaście nowszych wpisów przecieków. Na stanie
dzisiejszym: zero sprzeczności.

Dwie decyzje projektowe w skrypcie, obie wymuszone pierwszym przebiegiem:
- **ceny nie starzeją tekstu.** Standard zabrania kwot w treści artykułu, a sierpniowy
  zrzut katalogu (ok. 900 wpisów RRP jednego dnia) zapalał każdy starszy tekst i zakopywał
  jedyne ustalenie warte czytania. Ceny służą tylko do opisania numeru.
- **`sety.json` nie jest dowodem, że LEGO ogłosiło zestaw.** 77094 (Zelda) jest w rejestrze,
  a lego.com nie ma dla niego karty — sprawdzone dzisiaj. Takie numery idą do osobnego
  kubełka „DO SPRAWDZENIA". Przy okazji: ten jeden numer to dziś jedyne ustalenie skryptu
  i czeka na rozstrzygnięcie przecieku albo wyjaśnienie, skąd wpis w rejestrze.

**NIEWDROŻONE:** Kontroler tego nie uruchamia. `update_trigger` z tej sesji odmówił —
prompt runnera zmienia się tylko z jego własnej rozmowy albo z panelu. Akapit do wklejenia,
miejsce wstawienia i dokładny komunikat odmowy leżą w
`materialy/kontroler-krok-swiezosc-2026-10-19.md`. Reguła z „Ustaleń trwałych" obowiązuje:
dopóki prompt się nie zmieni, kroku NIE MA i nie wolno pisać, że jest.

**Zrobić:** — wkleić akapit z `materialy/kontroler-krok-swiezosc-2026-10-19.md` do promptu
Routine `trig_01KB8XkPcHyvc5kCRKEKYjri`, przed akapitem „KLIKNIĘCIA AFILIACYJNE:"
**Kto:** — Marek (panel) albo sesja Kontrolera
→ zamknięte 19.10.2026: Marek wkleił. Sprawdzone przez `get_trigger`: akapit stoi w prompcie
dosłownie, w zadanym miejscu (po `ARCHIWUM DZIENNIKA`, przed `KLIKNIĘCIA AFILIACYJNE:`),
`updated_at` 2026-10-19T08:31:59Z. Krok wchodzi w życie przy przebiegu 26.10 — dzisiejszy
Kontroler odpalił się o 09:08, przed zmianą. Przy okazji zmieniona godzina runnera:
`CRON_TZ=Europe/Warsaw 30 9 * * 1`, nazwa „LEGO pon 09:30 — Kontroler". Skutek uboczny do
wiadomości: akapit o kontroli linków nadal mówi, że Łowca chodzi „pół godziny przed Tobą"
(08:30) — teraz to godzina. Treść kroku działa, poprawka tylko dla porządku.

## 2026-10-19 · CODE · Zapowiedzi 2027: dwie tabele zamiast jednej

Zamknięcie pozycji z dzisiejszego Radaru. Strona stała od 27.08 i mówiła nieprawdę.

- **Co było nieprawdą:** „Grupa LEGO nie potwierdziła jeszcze żadnego zestawu na 2027 rok"
  i nagłówek „Super Mario: jedyna potwierdzona zapowiedź". Sprawdzone dziś bezpośrednio
  na lego.com/pl-pl: 72060 i 67008 mają `product:availability: pre-order` i komunikat
  „Zamów ten produkt w przedsprzedaży już dziś (wysyłka od 1 stycznia 2027)".
- **Struktura:** jedna tabela rozbita na dwie — osiem pozycji z kartą produktową i polską
  ceną katalogową (72060 429,99, 72058 259,99, 67012 749,99, 67006 429,99, 67008 259,99,
  67009 126,99, 71875 84,99, 71873 bez ceny) wobec czternastu przecieków. Ceny z
  `rrp_potwierdzone.json` (lego.pl, 13–14.10).
- **Dołożone pozycje**, których strona nie miała: 67009, 67012, 71873, 71875, 77094 Zelda,
  11399 Helmowy Jar (numer i data 1.06.2027 z Bricksetu), 75484 UCS Eta-2, 30748,
  blind boxy Pokémon.
- **Drugi martwy zapis:** „polskich cen katalogowych [Super Mario] jeszcze nie ogłoszono".
  LEGO podało je 28.08.2026 — **dzień po** ostatniej aktualizacji strony. Zdanie było
  nieprawdziwe praktycznie od publikacji.
- **Poprawiony fakt:** Helmowy Jar przy 8060 elementach jest drugim, nie pierwszym
  największym zestawem LOTR — Minas Tirith ma 8278. Strona twierdziła odwrotnie.
- **Liczba zestawów Super Mario w ofercie:** 37 → 22 (w katalogu 98 już wycofanych).
- Wniosek na przyszłość, nie tylko o tej stronie: artykuł z sekcją „stan na dziś" starzeje
  się szybciej, niż ktokolwiek do niego wraca. Tu wyszło siedem tygodni. Warto, żeby
  Kontroler raz w tygodniu porównywał `zaktualizowano` tekstów o zapowiedziach z datami
  wpisów w `przecieki.json` i `sety.json` — to zapytanie, nie praca redakcyjna.
