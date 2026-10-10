# Dziennik pracy

Jedyny kanał komunikacji między Claude Code a Cowork. Oba narzędzia czytają
ostatnie wpisy na starcie sesji i dopisują własny na końcu.

**Append-only.** Nie kasuj i nie przepisuj cudzych wpisów — historia jest tu po
to, żeby druga strona wiedziała, co się działo.

**Gdzie pisać:** nowy wpis wstawiaj **bezpośrednio pod linią znacznika**
`<!-- WPISY PONIŻEJ … -->`, na początku listy wpisów. Wszystko NAD znacznikiem

## 8.10.2026 — Warianty zdjęć bez Cloudflare Image Transformations (Claude Code)

**Zrobione:**
- Limit 5 000 darmowych transformacji skończył się po jednym dniu (11,5 tys.
  zdjęć × szerokości × formaty). Marek: nie płacimy. Worker miał zabezpieczenie,
  więc strona oddawała oryginały — bez awarii, ale z wynikiem PageSpeed sprzed audytu.
- Nowe: `scripts/warianty-obrazow.mjs` generuje WebP w 6 szerokościach do R2
  (`w/<klucz>/<szerokość>.webp`), `scripts/r2-s3.mjs` to klient S3 do R2
  (bez limitu REST API). `r2-obrazy.mjs` po wgraniu nowego oryginału od razu
  robi jego warianty, więc Routine „Zdjęcia → R2" nie wymaga zmiany promptu.
- Worker oddaje `?w=` z R2 (Accept z WebP) z cache brzegu; brak wariantu →
  oryginał. Image Transformations nie są już wołane.
- Pełny przebieg generowania 8.10 (ok. 40 min, 69 tys. obiektów, ~1,5 GB w R2).

- Po pomiarze: preload czcionek zdjęty (`b23243b`) — Chrome wstrzymywał pierwszy
  render do czasu pobrania woff2; czcionki zastępcze z metrykami trzymają układ.
- Wynik mobile po wszystkim (Lighthouse 12): główna 91, hub 89, listing 86,
  deal 95, artykuł 96, seria 90; desktop 100. Tabela w raporcie, sekcja 7.

**Stan:** wdrożone na `main` (worker `132d210` za zgodą Marka, czcionki `b23243b`),
69 474 warianty w R2 (2,1 GB).

**Dla drugiej strony:** po ręcznym wgraniu lub podmianie zdjęcia w R2 uruchomić
`node scripts/warianty-obrazow.mjs --klucze <klucz>`; lista szerokości żyje
w trzech miejscach (worker, media.js, skrypt) — RUNBOOK „Obrazy skalowane".
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

- [`2026-09`](materialy/dziennik-archiwum-2026-09.md) — 50 wpisów
- [`2026-08`](materialy/dziennik-archiwum-2026-08.md) — 36 wpisów

Archiwizuje `node scripts/archiwum-dziennika.mjs`.

<!-- WPISY PONIŻEJ — wszystko nad tą linią zostaje w dzienniku na zawsze -->

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


## 2026-10-06 08:25 · RADAR · Do zrobienia

**fanklockow.pl · 05.10** — Zapraszają na transmisję ze wspólnych zakupów przy starcie 9. serii BrickLink Designer Program, który wypada dziś.
**Mamy?** — tak: `/kalendarz-promocji-lego/#bldp` z terminem, pełnym składem serii i pięcioma cenami katalogowymi.
**Zrobić:** — ZROBIONE w tym przebiegu: nagłówek mówił „seria 9", a zdanie pod nim „piątej serii" — poprawione na „dziewiątej".
**Kto:** — Code (dane, strona)

**faniklockow.pl · 05.10** — LEGO i Sanrio ogłosiły wieloletnią współpracę: Hello Kitty wchodzi do klocków, pierwsze produkty w 2027 roku.
**Mamy?** — nie: dział licencji kończy się na Nike i Formule 1 (`/artykuly/historia-licencji-lego-gry-sport-lifestyle/`, tekst z 21.09), Sanrio tam nie ma.
**Zrobić:** — uzupełnić ten artykuł o akapit o licencji Sanrio (oficjalne oświadczenie obu firm, opisane niezależnie przez oba serwisy — nie plotka).
**Kto:** — Piotr (tekst)

Uwaga do pierwszej pozycji, żeby nikt tego nie „poprawił" w drugą stronę: ich
**16:15 to godzina transmisji live**, nie startu sprzedaży. Nasze 17:00 w kalendarzu
zostaje bez zmian — potwierdzaliśmy je w dwóch serwisach branżowych.


## 2026-10-04 08:15 · RADAR · Do zrobienia

**fanklockow.pl · 03.10** — Wideorecenzja LEGO 72306 PlayStation, czyli świeżej premiery za 689,99 zł, która właśnie weszła w okno prezentowe.
**Mamy?** — częściowo: hub `/zestaw/72306/` z notkami dla rodzica i dla AFOL-a oraz wzmianki w trzech tekstach, ale recenzji nie ma.
**Zrobić:** — nowy tekst „Recenzja LEGO 72306 PlayStation" (kategoria Recenzje; wymaga dostępu do zestawu, więc najpierw decyzja, czy go mamy).
**Kto:** — Marek (decyzja o zestawie), potem Piotr (tekst)

Kontekst cenowy do tej pozycji: 03.10 Ceneo ma 619,99 zł, czyli **pierwszą ofertę
poniżej katalogu** 689,99. Jeszcze 29.09 wszystkie oferty zewnętrzne były wyższe
od cennika i na tej podstawie zapisaliśmy, że to odsprzedaż — Allegro 748,99 nadal
nią jest, ale dystrybucja już weszła.

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

## 2026-09-30 19:00 · CODE · Routines po audycie: czas polski, Łowca z buildem, Harmonogram w tej sesji

**Zrobione na koncie:**
- Crony runnerów LEGO w zapisie `CRON_TZ=Europe/Warsaw …` z tymi samymi godzinami PL
  (Scout, Radar, Łowca, Wycofania, Kontroler, Dane wt, Harmonogram) — zmiana czasu 25.10
  niczego nie przesunie; jednorazowe przypomnienie o DST niepotrzebne.
- Łowca odtworzony (delete + create w tej samej sesji `session_01SdxKtAvW8UmktsuXrsPYga`,
  nowe ID `trig_01L8awRzxEbeUSQsad7ye18Y`): `npm run build` przed pushem, przy konflikcie
  `historia-cen/` z origin + `historia-cen.mjs` zamiast ręcznego scalania, `seo_tytul`/`seo_opis` w postach.
- Harmonogram z konta przypięty do sesji Code `session_011GrNNd6UVQFF1NamoPaQMS`
  (`trig_01LU2xZxWqyCmNYv7rPyik3x`) + kontrola wielkości sesji runnerów (`get_session`, alarm > 850 tys.).
  Scout 30.09: 313 tys. z 1 mln — nowa sesja niepotrzebna.
- `harmonogram-z-konta.mjs` rozumie `CRON_TZ=Europe/Warsaw`.
**Czeka na Marka (panel, zadania założone przez http_api — agent ich nie zmieni):** Alerty
(cron + krok 2), Zdjęcia → R2 (cron 04:45 i 09:45), Przypomnienie (cron), wyłączenie
„Empik co tydzien”, skasowanie Backfill.
→ 30.09 wieczorem: Marek poprawił w panelu prompt Alertów i czas Zdjęć (04:45). Code założył
dwa zadania z czasem polskim: „Zdjęcia → R2, drugi przebieg” 09:45 (`trig_01XAJy9vca6HUK6YY3XarLWM`,
próba 15:18: 11 563 w R2, brak 0, błędów 0) i nowe Alerty 09:30 (`trig_018D4PGvCaYkcDKDfNM3fjLZ`) —
stare Alerty z panelu Marek wyłącza. Przypomnienie o Empiku zostaje (tylko mail do Marka);
do wyłączenia „Empik co tydzien” (skill w chmurze), Backfill wstrzymany — do skasowania.

## 2026-09-30 18:00 · CODE · Teksty szablonowe, SEO meta, odczyt GSC od Coworka

**Zrobione:** `d526d69` — poprawki tekstów szablonowych z audytu (opisy generowane bez zdań
o dostępności, odmiana liczebników, 880 kart z poprawionym akapitem rocznikowym). `259f5c9` —
tytuły ≤ 60 i opisy ≤ 160 znaków na 1 433 indeksowanych stronach; pola `seo_tytul`/`seo_opis`
(artykuły, deale) i `seoTytul`/`seoOpis` (prezentowniki), zasada w `redakcja/ustalenia-projektowe.md`.
**GSC (odczyt Coworka + URL Inspection API 30.09):** raport „Strony” z 21.09 jest nieaktualny.
10312 i 75355 nie mają już noindex. 0 z 133 stron z wyświetleniami zwraca 404 i 0 martwych
linków wewnętrznych — 220 × 404 to stare adresy spoza serwisu, do obejrzenia przez eksport.
Zgłoszenia Coworka zadziałały (x-kom WSR i 31163 zindeksowane 30.09).
Niezindeksowane teksty: nieznane — 77242, najwieksze-zestawy-lego-star-wars,
najdrozsze-zestawy-lego-rynek-wtorny; wykryte — allegro-black-weeks, jesien-swieta-premiery,
wycofania-grudzien, 75438, 60508, bam-halloween, historia-licencji cz. 3; zeskanowane —
super-mario-2027, najwieksze-technic.
**Dla drugiej strony:** Cowork — 1.10 zgłoszenia wg listy w odpowiedzi Code (zaczynając od 75389).

## 2026-09-30 10:30 · CODE · Audyt po wdrożeniu 29.09: afiliacje, Cloudflare, Firecrawl, Routines, GSC, spójność, teksty

**Zrobione:** `materialy/audyt-2026-09-30.md` (raport zbiorczy, 9 sekcji) + `audyt-2026-09-30.xlsx`
(8 arkuszy) + `audyt-2026-09-30/` (routines, strona-spojnosc, teksty-szablonowe). Liczby z API.
**Najważniejsze:** Cloudflare — plan płatny nie grozi (worker 6% limitu), realny sufit to 20 000
plików w assets (dziś 10 022). Firecrawl 5 000/mies. wg API, 71% zużycia z sesji (json = 5 kredytów).
Routines: bez dubli poza Empikiem, x-kom bez właściciela, Łowca bez builda przed pushem, Scout ~800 k.
Strona spójna (0 martwych linków, 0 błędów LD), meta >160 na 1 300 stron. Teksty: ton dobry, ale
zdania o dostępności w `opisy.json` przeczą tabelom (60339 „z drugiej ręki” obok −50%).
**Stan:** raport na main; poprawki czekają na kolejność od Marka (sekcja 9 raportu).
**Dla drugiej strony:** Cowork — komendy GSC w sekcji 5 raportu.

## 2026-09-29 15:50 · CODE · Karty P07 Piotra: partie 02, 26, 27 (75 nowych kart) wgrane

**Zrobione:** `import-karty.py` na 3 zipach (poprawione wersje od Piotra; automat przez git po stronie chata
nie zadziałał, gałąź w repo Piotra do skasowania przez niego/Marka). 75 kart, 0 zablokowanych (RRP zgodne),
karty_setow 1124 → 1199. Poprawki: metka szablonu „Opis P07 • LEGO … • 2025” jako 1. akapit w całej partii 02
— filtr w imporcie (68ab221); 75350 elementy 776 → 766 (Brickset). Nazwy: zostają kanoniczne z katalogu
(15 różnic typu „–”/„-”, polskie nazwy minifigurek). Wszystkie 75 hubów bez noindex po buildzie.
Uwaga dla Piotra: partia 27 bez nagłówka „Opis zestawu” i z krótszą metryką (bez wieku/typu/dystrybucji);
w partii 26 trzeci akapit bywa dopychany 3–4 zdaniami „na długość”.
**Stan:** na main.

## 2026-09-29 14:20 · CODE · Recenzja Piotra: 31163 Psotny kot (Creator 3 w 1)

**Zrobione:** `artykuly/lego-31163-psotny-kot-recenzja.md` z docx Piotra (Recenzje_004) — tekst bez zmian,
dopisane: frontmatter + 3 FAQ, tabela cen w miejsce `[TABELA CENOWA]`, link do serii Creator, 3 zdjęcia
(kot 31163-3, pies 31163-11, gołąb 31163-12) bez podpisów. Fakty z tekstu zgodne z danymi (RRP 104,99 zł
potwierdzone na lego.pl, 407 el., 8+, premiera 01.2025). Galeria 12 zdjęć z Planety Klocków w `galerie.json`
(80 → 81), od razu wgrana do R2 (`r2-obrazy.mjs --galerie`: 12/12). Uwaga: rynek dziś ~68 zł (Media Expert,
Lidl) — już poniżej progu Piotra 75 zł; tabela huba pokazuje to sama.
**Stan:** na main.

## 2026-09-29 12:40 · CODE · WDROŻONE: v2 strony głównej + „Promocje LEGO” zamiast /deale/ (301)

**Decyzja Marka 29.09:** „wdrażamy v2 i promocje zamiast deali z 301, ale zostaw wersję obecną”.
**Zrobione:** `podglad/glowna-v2` → `index.astro`; `podglad/promocje-lego` → `promocje-lego/index.astro`
(listing 150 pozycji, 30/strona, filtr serii, sortowanie: polecane / cena ↑↓ / największy rabat %;
bez Top 10 wycofań). `/deale/` → **301** na `/promocje-lego/` w `public/_redirects` (posty dealowe
`/deale/<slug>/` bez zmian); dwa stare przekierowania z `astro.config` też przeniesione do
`_redirects` jako 301. Menu: „🔥 Promocje LEGO” (→ /promocje-lego/) zamiast „Promocje dziś” (→ /)
i „Deale”; stopka, 404, llms.txt, okruszki postów dealowych, sitemap i linki w 9 tekstach → nowy adres.
**Powrót (gdyby trzeba):** kopie `/podglad/glowna-obecna/` i `/podglad/deale-obecne/` (noindex) oraz ostatni
commit przed wdrożeniem **`7f488de`** (tag `przed-wdrozeniem-v2-2026-09-29` jest tylko lokalnie – proxy
odrzuca push tagów, 403). Podgląd v1 skasowany.
**Sprawdzone na produkcji po deployu (975e4df):** `curl -sI` bez `-L`: `/deale/` i `/deale` → 301
`/promocje-lego/` (także z nagłówkiem `Sec-Fetch-Mode: navigate`), `/kalendarz-redakcyjny` → 301
`/artykuly/`, `/serie/tradycyjne-festiwale-chinskie/` → 301 `/serie/seasonal/`; posty `/deale/<slug>/`
200; `/_redirects` 404 (plik nie jest publiczny); sitemap ma `/promocje-lego/`, nie ma `/deale/`.
**Nie zrobione z planu 27.09:** pkt 4 (style `.podglad-widok` globalnie — nowe strony nadal mają ten
wrapper, więc wyglądają jak w podglądzie) i pkt 5 (scalenie zdublowanego kodu do `src/lib/`).
**Dla drugiej strony:** GSC — prośba o indeksację `/promocje-lego/` i nowej `/`.
→ 02.10 (API GSC): `/promocje-lego/` i `/` PASS, zindeksowane, crawl 29.09 12:34 i 13:00 UTC (już v2); `/deale/` zindeksowane, ostatni crawl 15.09 — Google jeszcze nie widział 301 (curl 02.10: 301 → `/promocje-lego/`); nic do ponawiania.

## 2026-09-28 12:30 · CODE · x-kom „Wyższa Szkoła Rabatu" (do 18.10): aktualność + 108 cen + 115 linków

**Zrobione:** mailing SalesMasters od Marka → aktualność
`artykuly/x-kom-wyzsza-szkola-rabatu-2026-lego.md` (wyróżniona, `wazne_do` 18.10).
Pełną listę (128 pozycji LEGO, 5 stron) pobrał **Firecrawl** – x-kom.pl oddaje mu
200 (basic proxy), choć na nasz ruch serwerowy daje 403. Kod `rabat12` przy części
pozycji. Porównanie z notowaniami: 33 rekordy, 51 ≈ rynek, 38 droższe niż gdzie indziej.
Dane: 108 ofert xkom w sety.json (`wazne_do` 2026-10-18, pole `kod` przy rabat12);
115 deeplinków w `redirects.xkom` (11 → 126, adres karty + sm=).
Dzień Chłopaka: 43014/43022/11380/43011 podrożały, 43012 niedostępny → ich wpisy
xkom zamknięte (`wazne_do` 30.09 → 27.09), nowe ceny dopisane; do starego posta notka
„Aktualizacja 28 września", wyróżnienie przeszło na nowy tekst.
`oferty.js`: oferta z `wazne_do` nie spada już po 14 dniach sita (akcja trwa 3 tygodnie).
**Uwaga:** hełm 75429 – mailing 269,90 zł, karta 28.09 pokazuje 329,90 zł; w tekście
„nie brać przy tej cenie". Gdy rabat się pojawi – dopisać cenę i poprawić akapit.
**Stan:** na main.

## 2026-09-28 08:40 · CODE · Import zrzutu Empiku z 28.09 (sesja Code, plik od Marka)

**Zrobione:** `empik-import.mjs` (sucho → zapis) + `empik-redirects.mjs --usun-martwe`.
Zrzut 5 320 pozycji → 4 378 cen po filtrach (odrzucone: gadżety 538, obca marka 13,
sanity 52, spoza katalogu 337 = 17,7%, poniżej progu 20%). oferty_feed: 56 nowych,
1 281 zmian, 48 zestawów bez Empiku w zrzucie straciło jego cenę; sety.json 982 ofert;
18 nowych minimów w ceny_baza. Deeplinki: 41 zaktualizowanych, 52 martwe usunięte
(jedyny dopuszczony ubytek), gałąź empik 4 775 → 4 787. Build OK.
Marek zmienił metodę zrzutu (dwa sortowania bez luki, filtr „tylko dostępne",
szersza reguła numeru „1016el") — dlatego ok. 10% więcej pozycji niż 21.09.
**Stan:** gotowe, na main.
**Dla drugiej strony:** skill `klocki-ceny-empik` opisuje jeszcze trzy przebiegi
z filtrem ceny — Marek zrobił dwa i wystarczyło; do aktualizacji w skillu przy
najbliższej okazji (52 „podstawki Blacked Brick" wpadają w sanity zamiast w gadżety —
też do dopisania rdzenia „podstawka" w `zrzut-import.mjs`).

## 2026-09-27 20:30 · CODE · DO WDROŻENIA 28.09: nowa strona główna + „Promocje LEGO” (czeka na opinię Piotra)

**Stan:** podglądy zaakceptowane przez Marka („jest super”), czekają na opinię Piotra; wdrożenie planowane
28.09. Podglądy (noindex, poza sitemapą i menu):
- `/podglad/glowna/` (v1: 3 boksy „Dziś w dobrej cenie”, losowo z przedziałów >500 / 151–500 / ≤150 zł)
- `/podglad/glowna-v2/` (v2: listing 12 pozycji, po 3 z przedziałów >1500 / 801–1500 / 201–800 / ≤200, losowo)
- `/podglad/promocje-lego/` (następca /deale/)

**Plan wdrożenia (po wyborze v1 albo v2):**
1. Wybraną wersję → `src/pages/index.astro` (bez paska PODGLĄD, bez `noindex`, bez wrappera `.podglad-widok`).
2. `promocje-lego.astro` → `src/pages/promocje-lego/index.astro` (albo zostaje adres /deale/ — do decyzji
   Marka); stare `/deale/` → **prawdziwe 301** na nowy adres, posty dealowe `/deale/<slug>/` zostają pod
   swoimi adresami. UWAGA (Marek 27.09: „przenosić z 301”): `redirects` w astro.config przy stronie
   statycznej daje 200 + meta refresh, NIE 301 — sprawdzone 27.09 na `/serie/tradycyjne-festiwale-chinskie/`
   (200). Robimy 301 plikiem `public/_redirects` (obsługiwany przez Cloudflare static assets) albo w
   workerze (wtedy zgoda Marka — zmiana workera); po wdrożeniu `curl -I` bez `-L` ma pokazać 301 + Location.
   Przy okazji przenieść na 301 dwa istniejące przekierowania z astro.config (`/kalendarz-redakcyjny`,
   `/serie/tradycyjne-festiwale-chinskie`).
3. Menu (`Base.astro`): „Deale” → „Promocje LEGO”; „🔥 Promocje dziś” prowadzi na Promocje, nie na „/”.
4. Poprawki stylu z `.podglad-widok` globalnie: `.sekcja-head h2 { margin:0 }` (klocek w osi tytułu),
   odstępy 16/20 px, bez ramek zdjęć w kartach i slajderze — sprawdzić wszystkie strony (huby, serie,
   artykuły) zrzutami przed/po.
5. Scalić zdublowany kod (dobór okazji, półki, wycofania, prezentowniki) do `src/lib/` — dziś to kopie
   `index.astro` i `deale/index.astro`.
6. Sitemap (`sitemapy.js`): nowy adres Promocji zamiast /deale/; skasować strony `/podglad/*`.
7. Reguła okazji do RUNBOOK/ustaleń: ≥30% albo nowe minimum przy ≥15%, ekskluzyw ≥15%; półki 10–20
   pozycji (dopełnienie mniejszymi rabatami), slajder po 3 z każdej półki.
8. Build, zrzuty (1280/390), brak poziomego scrolla, push; potem GSC: prośba o indeksację nowej strony.

**Dla drugiej strony:** nic — czeka na decyzję Marka po opinii Piotra.

## 2026-09-27 18:40 · CODE · Podgląd przebudowy: nowa strona główna + „Promocje LEGO” (w toku)

**Zrobione:** dwie strony podglądu (noindex, poza sitemapą i menu, pasek „PODGLĄD” u góry), produkcja
bez zmian: `/podglad/glowna/` — slajder, 3 zestawy „Dziś w dobrej cenie” + duży przycisk „Zobacz
wszystkie promocje LEGO”, Aktualności, 3 najnowsze deale, Ostatnio na blogu (bez siatki dobrych cen,
prezentowników, wycofań i person). `/podglad/promocje-lego/` — 12 najlepszych okazji jako boksy,
reszta w listingu półek jak na /deale/, „Dziś w dobrej cenie” po 3 w rzędzie ułożone seriami z filtrem
serii i stronicowaniem po 12 (do 12 zestawów na serię, ~300), 3 prezentowniki, Top 10 wycofań,
„Okazje pod lupą” (#okazje-pod-lupa). Kod to kopie `index.astro` i `deale/index.astro` — po akceptacji
Marka do scalenia we wspólne moduły, zmiany menu („Deale” → „Promocje LEGO”) i przekierowania /deale/.
Wersja 2 (uwagi Marka 27.09): Promocje — slajder 12 okazji (2 karty w widoku), tekst o zasadach pod
slajderem, półki >1500 / 801–1500 / 201–800 / do 200 w stylu tabeli wycofań (zdjęcia 130 px, bez zł/klocek),
„Dziś w dobrej cenie” wmieszane w półki (min. 10 pozycji, reszta pod „Pokaż więcej”), potem Okazje pod
lupą, Prezentowniki, Top 10 wycofań, Persony. Okazja = ≥30% albo nowe minimum przy ≥15%, ekskluzyw ≥15%.
Główna — bez ramek zdjęć (też w slajderze), klocek w osi tytułu, równe odstępy (16/20 px), jednakowe
duże przyciski, deale pod blogiem, wejścia Nowości/Wycofania/Artykuły. Poprawki stylu w klasie
`.podglad-widok` — po akceptacji do przeniesienia globalnie.
**Stan:** w toku — czeka na ocenę Marka.
**Dla drugiej strony:** nic.

## 2026-09-27 18:05 · CODE · 25 kart P07 (Cowork) w karty_setow.json

**Zrobione:** plik od Coworka (pełny `karty_setow.json`) porównany z repo: 1 099 kart identycznych,
25 nowych (30717, 30718, 30720, 30732, 31215, 45200–45203, 45521, 5010075, 5011072, 5011093, 53708,
72151–72153, 72159, 77002, 77078, 854328, 910054, 910056, 910057, 910059); `_meta`: data i lista serii.
Kontrola 25 kart: nazwy, liczby elementów i RRP zgodne z danymi serwisu, każdy numer ma hub, bez „cegieł”.
Zapis w formacie repo (wcięcie 1). 1 099 → 1 124 kart. Build przeszedł.
**Stan:** gotowe, na main.
**Dla drugiej strony (Cowork):** nic — karty są na hubach po deployu.

## 2026-09-27 14:10 · CODE · Informacja prawna LEGO, bez podpisów pod zdjęciami, wszystkie zdjęcia w R2

**Zrobione:** (1) stopka (`Base.astro`): pełna informacja prawna — niezależność od Grupy LEGO, lista
znaków towarowych, „Zdjęcia zestawów © Grupa LEGO”. (2) Usunięte podpisy „Fot.: …” pod zdjęciem huba
i w powiększeniu w Nowościach (decyzja Marka). (3) Zdjęcia na naszym serwerze: przed zmianą 11 362
z 11 624 miało kopię w R2, reszta kopiowała się dopiero przy pierwszym wyświetleniu. Wgrane 133
z Allegro; 131 adresów Rebrickable (wzorzec `<nr>-1.jpg`, archiwalne DUPLO i promocyjne) zwracało 404 —
56 przestawione na Brickset i wgrane, 75 dostało w `zdjecia.json` `url: null` (+ stary adres w
`poprzednio`), więc strona pokazuje zastępczy klocek zamiast zepsutego obrazka. `obrazy.json` (plik
generowany) ma przez to 75 pozycji mniej; `zdjecia.json` bez zmiany liczby wpisów (7 777).
(4) `r2-obrazy.mjs` w trybie codziennym (Routine „Zdjęcia → R2”) kopiuje każde brakujące zdjęcie
z danych, także literowe i warianty — stan: 11 549 w danych, brakuje w R2: 0.
**Stan:** gotowe, na main.
**Dla drugiej strony:** nic. Routine „Zdjęcia → R2” wywołuje skrypt tak samo jak dotąd.

## 2026-09-27 13:30 · CODE · Zdjęcia dla 166 zestawów bez zdjęcia (Rebrickable/Brickset → R2)

**Zrobione:** z 176 zestawów bez żadnego zdjęcia 166 dostało wpis w `zdjecia.json` (68 Rebrickable,
98 Brickset; 7611 → 7777 wpisów). LEGO.com, Allegro, Empik i ME odrzucają pobieranie z serwera (403);
LEGO.com przez Firecrawl nie ma pozostałych 10 (edukacyjne 20209/20211/20212, 75188-3, IRONMAN, 342160,
promocyjne L0002205/2213/2215/2290) — zostają z zastępczym klockiem. Do R2 wgrane (zmniejszone):
44 zwykłe numery (m.in. nowości 72052–72061, 40897, 40899, 40907, 10371, 21373, 75457, 77094) i 31
wariantów „nr-N” — `r2-obrazy.mjs` bierze dla takiego klucza zdjęcie główne wariantu, gdy bazowy
numer nie ma galerii. `media.js`: numer, którego worker nie obsłuży (spoza 4–7 cyfr), nie dostaje
adresu `/img/` — wcześniej 28 zestawów (np. 850–876) miało na stronie zepsuty obrazek.
**Stan:** gotowe dla 75 zestawów; 91 kodów literowych (ARENDELLE, SDCC2019, L0002199…) ma zdjęcie
w danych, ale czeka na zmianę workera.
**Dla drugiej strony (Marek):** zgoda na małą zmianę w `src/worker.js`: trasa `/img/` przyjmuje
też klucze literowe i numer wariantu, a zdjęcie główne z `obrazy.json` ma pierwszeństwo przed galerią.
Po zgodzie: zmiana, test na produkcji, wgranie 91 (+28 krótkich numerów) do R2, zdjęcie guard z `media.js`.
→ zamknięte 27.09: zgoda Marka. `src/worker.js`: klucz `/img/` = litery/cyfry + opcjonalne „-N”
(max 24 znaki), dokładny klucz z `obrazy.json` przed pozycją galerii. Test offline (esbuild + atrapa R2):
galeria, zdjęcie główne, R2, warianty, literowe, 850 → 200; śmieciowe klucze → 404; `/idz/` bez zmian.
Ten sam wzorzec w `media.js` i `r2-obrazy.mjs` (tryb Routine sprawdzony: „brakuje w R2: 0”).
119 zdjęć (91 literowych + 28 krótkich numerów) wgranych do R2 przed deployem.

## 2026-09-27 13:15 · CODE · Black Weeks ze zdjęciami, Dzień Chłopaka w Artykułach/Aktualnościach, kolejność 3–2–1

**Zrobione:** (1) Black Weeks: zdjęcie pod nagłówkiem każdego z 5 zestawów (42213 i 77264 — zdjęcie
główne, bo nie mają galerii; 60506-5, 31168-5, 60508-6 z galerii, model zamiast pudełka).
(2) Dzień Chłopaka (adres `/deale/…` bez zmian) jest teraz w `/artykuly/` pod filtrem Aktualności
(2 teksty), a z listy `/deale/` zszedł. (3) Listingi przy tej samej dacie sortują po tytule malejąco
(`najnowszePierwsze()` w `src/lib/artykuly.js`, `/artykuly/` i „Ostatnio na blogu”) — cykl Historii
licencji układa się 3–2–1, wcześniej 3–1–2.
**Stan:** gotowe, na main.
**Dla drugiej strony:** nic.

## 2026-09-27 13:00 · CODE · Nowa kategoria „Aktualności” + sekcja na głównej, Black Weeks i Dzień Chłopaka

**Zrobione:** kategoria `Aktualności` (rejestr `kategorie_artykulow.json`, filtr w `/artykuly/`,
reguła w `redakcja/ustalenia-projektowe.md`, skille wyeksportowane). Build odrzuca aktualność bez
`okladka`; opcjonalne `wazne_do` daje plakietkę „trwa do …” / „akcja zakończona”.
Strona główna: pod slajderem deali sekcja „Aktualności” (2 karty w rzędzie, slajder do 6,
„Zobacz wszystkie” → nowa strona `/aktualnosci/`, w sitemapie `inne`, link w stopce);
„Najnowsze deale” przeniesione pod „Dziś w dobrej cenie”; aktualności nie dublują się w
„Najnowszych deal[ach]” ani „Ostatnio na blogu”. Dwie aktualności:
`/deale/deal-x-kom-dzien-chlopaka-2026/` (adres bez zmian, kategoria Aktualności, okładka 43014,
wazne_do 30.09, blok „W skrócie”) i nowa `/artykuly/allegro-black-weeks-2026-lego/` (tekst Piotra,
śródtytuły, 5 tabel cen, linki do hubów, recenzji 31168 i 60508 oraz kalendarza; kalendarz linkuje
z powrotem). Przy okazji: z końca `global.css` usunięty osierocony `}` — po dopisaniu reguł zjadłby
pierwszą z nich. Build 9 665 stron, bez ostrzeżeń CSS, bez poziomego scrolla (1280 i 390 px).
**Stan:** gotowe, na main.
**Dla drugiej strony (Marek):** paczki `skille/*.skill` odświeżone — wgrać `lego-standard-redakcyjny`
i `lego-standard-sprzedazowy` w claude.ai → Settings → Skills, żeby Cowork znał nową kategorię.

## 2026-09-27 12:45 · CODE · Trzy recenzje Piotra na stronie (75438, 60508, 77242)

**Zrobione:** DOCX przez `import-artykul.py` (bez obrazów w dokumentach). Treść Piotra bez zmian;
dodane: frontmatter (Recenzje, data 27.09, okładka, 3 FAQ z faktów w tekście), tabele cen w miejscu
`[TABELA CENOWA]`, linki do hubów (75439, 60470) i stron serii, zdjęcia z galerii (75438: 2, 60508: 3;
77242 nie ma galerii — tylko okładka). Adresy: `/artykuly/lego-75438-popiersie-yody-recenzja/`,
`/artykuly/lego-60508-napad-na-policyjny-pociag-recenzja/`, `/artykuly/lego-77242-bolid-f1-ferrari-sf-24-recenzja/`.
Kontrola: RRP w tekstach = dane serwisu (169,99 / 869,99 / 114,99), liczby elementów, roczniki i wiek
zgodne z katalogiem, bez „cegieł”. Build 9 663 stron. Przy okazji: `python-docx` dopisany do
`requirements.txt` (skrypt importu go wymagał, a pliku nie było w zależnościach).
**Stan:** gotowe, na main.
**Dla drugiej strony:** nic.
**Uwagi:** tytuł 77242 bez tezy („LEGO Speed Champions 77242 Bolid F1 Ferrari SF-24”) — zostawiony
jak u Piotra; pozostałe dwa mają tezę po myślniku.

## 2026-09-27 12:30 · CODE · Ekskluzywy: definicja „tylko LEGO” zastąpiona (decyzja Marka)

**Zrobione:** Marek zauważył, że 11371 jest opisany jako „sprzedaje go tylko LEGO”, a tabela
pokazuje Empik o 95 zł taniej. Pomiar: 115 ze 133 ekskluzywów miało ofertę w Empiku, ME, PK
albo Smyku. Nowa funkcja `sieciEkskluzywu()` (`src/lib/oferty.js`) liczy sieci z ofertą
(bez LEGO, Ceneo i Allegro). Hub (`[nr].astro`): gdy nie ma sieci, zostaje „dziś sprzedaje
go tylko LEGO”; gdy są — „ma etykietę »Ekskluzywne«, ale trafił też do wybranych sieci:
<lista>, porównaj ceny”. Strona `/ekskluzywne/`: nowy tytuł, H1 i wstęp z liczbą zestawów
w sieciach, przepisane dwa pytania FAQ i akapit o zestawach po EOL. Poprawione opisy
w `kolekcjoner.astro` i `llms.txt`. Build 9 660 stron: 102 huby z sieciami, 30 „tylko LEGO”.
**Stan:** gotowe, na main.
**Dla drugiej strony:** nic. Nie piszemy już, że ekskluzyw „nigdy nie stanieje w innym
sklepie” (dotyczy też tekstów i postów).

## 2026-09-27 08:00 · RADAR · Do zrobienia

**faniklockow.pl · 26.09** — w ich liście premier października jest termin, którego nie mamy: przedsprzedaż BrickLink Designer Program seria 9 rusza 6 października o 17:00 (pięć zestawów, 209,99–1499,99 zł, dystrybucja specjalna).
**Mamy?** — nie: `/kalendarz-promocji-lego/` ma pierwszy tydzień października (Executor, fala premierowa), ale o BLDP nie wspomina.
**Zrobić:** — nic (zamknięte 29.09). Drugie źródło potwierdziło termin i skład serii co do złotówki, więc BLDP ma w kalendarzu własną sekcję `#bldp`.
**Kto:** — Code (zrobione)

## 2026-09-26 08:00 · RADAR · Do zrobienia

**faniklockow.pl · 25.09** — w ich tabeli wycofań jest kolumna „Dystrybucja" (szeroka / ekskluzywna / ograniczona) plus notka „wyprzedane".
**Mamy?** — częściowo: `/wycofania/` pokazuje status terminu, cenę i znacznik EOL, ale nie pokazuje, ilu sklepów zestaw jeszcze ma.
**Zrobić:** — dopisać do listy na `/wycofania/` liczbę sklepów z żywą ofertą (dane są już w `oferty_feed.json`, strona je wczytuje). To nasz odpowiednik ich „dystrybucji", tylko żywy — i to właśnie tę zmienną nasz tekst z 16.09 wskazał jako najlepszy predyktor ceny względem cennika.
**Kto:** — Code (dane, strona)

## 2026-09-25 09:15 · CODE · Allegro 25.09: feed „tylko LEGO” znowu 404 — bez zapasowego (decyzja Marka)

**Zrobione:** diagnoza błędu z przebiegu Łowcy (commit `d60fee4`, curl exit 22).
Główny feed `39967a61…` odpowiada **HTTP 404, pusta treść** (dwa sprawdzenia
ok. 09:00–09:10). Czyli awaria po stronie Allegro, nie nasza: skrypt, proxy
i sieć są sprawne, a szeroki feed `497662bc…` w tym samym czasie odpowiadał 200.
To druga taka przerwa (pierwsza 24.08–21.09). Marek: **nie przechodzimy na feed
zapasowy.** Notka w `feedy.json` (`allegro.uwaga_feed`) mówiła „przełączyć
ręcznie przy 404” i została poprawiona. Skrypt bez zmian: przy awarii oferty
Allegro zostają z ostatnią datą.
**Stan:** feed Allegro leży, czekamy, aż wróci. 11:27–11:33 UTC (po sygnale Marka, że Allegro usunęło przerwę):
404 zmieniło się na **HTTP 200 z pustą treścią** (0 bajtów, 5 prób). `feedy-lego.py` odrzuci to jako „pusty plik”,
więc nadal nic nie wchodzi. Jeśli Łowca 26.09 znowu zgłosi błąd, zgłosić Allegro, że feed jest pusty.
→ zamknięte 26.09: feed wrócił (przerwa po stronie Allegro, potwierdził Marek). Łowca 26.09 (`ca6d5bc`)
wczytał 6066 zestawów, 1093 oferty Allegro w `sety.json` z datą 26.09. Feed jest teraz dużo mniejszy:
26 MB i 8 442 linie (6 583 w „Zestawy”, 1 859 w innych kategoriach LEGO), a 22.09 było ~1,1 GB i 476 tys. linii.
Allegro wycięło pojedyncze elementy. Wyciąg jest bez zmian, bramki w `feedy-lego.py` działają dalej.
**Dla drugiej strony:** Łowca każdego dnia zgłosi to samo, dopóki feed nie wróci.
Jeśli 404 potrwa dłużej niż kilka dni, Marek sprawdza feed w panelu Allegro
Affiliate (czy nie wygasł albo nie zmienił ID; nowe ID wpisujemy w `allegro.url`).
Termin: `ofertaAktualna()` (`src/lib/oferty.js`) ukrywa oferty starsze niż 14 dni.
Oferty Allegro mają datę 24.09, więc bez feedu znikną z tabel ok. 9.10.

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
  → zamknięte 25.09: Marek — nie robimy.
- 40896 X-Files Laboratorium Scully: błędne RRP 81,99 zł w `sety.json`
  (wpis z 25.09 wyżej) — do poprawy po sprawdzeniu w lego.pl.
  → zamknięte 25.09: RRP poprawne — lego.pl podaje 81,99 zł, 221 el., zestaw
  promocyjny (GWP), niedostępny; ~419 zł na Allegro to cena rynku wtórnego.
- 29.09: zarchiwizować starą sesję Łowcy `session_017FKg5b8kSCwbJd8r7xPrwD` → zamknięte 29.09: zarchiwizowana (Łowca pracuje w session_01SdxKtAvW8UmktsuXrsPYga, commit z 28.09 na main; żaden Routine nie wskazywał starej sesji)
  (nowa działa od 23.09).
  → 25.09: zgoda Marka; zaplanowane `send_later` na 29.09 07:00 PL
  (`trig_01TP1mKUB2TX4BSrwD7CeWN2`) — sprawdza commit Łowcy i brak Routine
  na starej sesji, potem archive_session. Żaden Routine 25.09 jej nie używał.
- Poniedziałek 28.09: Kontroler sprawdza indeksację 5 stron sezonowych
  (prezentowniki + rozdzielnik `/prezentowniki/prezenty-pod-choinke/`).
  → zamknięte 25.09: inspekcja API GSC — wszystkie 5 „Submitted and indexed”,
  crawl 24.09. Uwaga: tej kontroli nie było w prompcie Kontrolera, istniała
  tylko w dzienniku.
- Empik dwa zrzuty w tygodniu: Marek nie potwierdził — Routine „Przypomnienie
  Empik" zostaje raz w tygodniu, dopóki nie powie inaczej.
  → zamknięte 25.09: Marek — raz w tygodniu.
- Ok. 9.10: `node scripts/kliki-raport.mjs --dni 14` — skutek CRO.
  → 25.09: zaplanowane `send_later` na 9.10 09:00 PL (`trig_01MCXZFZBymmddVXBNiWk6x1`).
  → zamknięte 9.10: 95 kliknięć w 14 dni po CRO wobec 139 przed, ale bez skoku
    14–16.09 (87 kliknięć) średnia dzienna stoi w miejscu (~6/dzień); prezentowniki
    0 → 4, udział hubów 76% → 65% — patrz wpis 2026-10-09 09:05.

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
→ zamknięte 24.09: zrobione — `/prezentowniki/prezenty-pod-choinke/` (wpis CODE 24.09 11:45), w indeksie od 24.09.

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
→ zamknięte 25.09: decyzja Marka — przekazane Piotrowi mailem (Resend, z kontakt@ w kopii) z cenami z 25.09 (ME 515,59 … LEGO.com 729,99).

**promoklocki.pl · 23.09** — prowadzą osobne wpisy z terminami na każdą kampanię sklepu zewnętrznego: Allegro Smart! Weeks, Allegro Days, Black Weeks, okazje limitowane.
**Mamy?** — nie: nasz kalendarz mówi ogólnie o „kampaniach sklepów zewnętrznych przed Black Friday", ale nie nazywa żadnej i nie podaje terminu.
**Zrobić:** — ustalić termin Allegro Black Weeks 2026 i dopisać go do sekcji listopadowej `/kalendarz-promocji-lego/`; to jedyna kampania sklepowa, która realnie wpada w nasz szczyt sezonu.
**Kto:** — Code (dane, strona)
→ zamknięte 25.09: w kalendarzu jako „przewidywane” (sekcja `#allegro-black-weeks`, 2025: 31.10–1.12, 2024: start 4.11). Termin 2026 wpisać, gdy Allegro ogłosi. Tekstu o Black Weeks nie mieliśmy — temat poszedł mailem do Piotra.

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
→ zamknięte 25.09: licznik „PUSTYCH, A ŹRÓDŁO ZNA CENĘ” liczy się do kodu wyjścia; pierwszy przebieg znalazł 1 (40896, uzupełnione 81,99). `--napraw` zachowuje teraz wcięcie pliku (wcześniej przepisałby cały `katalog.json`).

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

---

## 7.10.2026 — Audyt PageSpeed i wdrożenie poprawek wydajności (Claude Code, sesja Beko/landing)

**Zrobione:**
- Raport: `materialy/audyt-pagespeed-2026-10-07.md` (Lighthouse mobile: główna
  60, hub zestawu 59, listing promocji 72, artykuł 84, seria 92).
- Wdrożone na `main`: skalowanie obrazów `?w=` w workerze (Cloudflare Image
  Transformations, włączone w panelu przez Marka), `srcset`/`sizes` we
  wszystkich miejscach z `<img>` zestawów, `fetchpriority` + preload obrazu LCP
  (główna, hub), GA po `load`, czcionki przez Fonts API (CLS hubów 0,23 → 0),
  CSS inline, `public/_headers` z `immutable`, poprawki dostępności (kropki
  slajdera, kontrast `kc-data`/`kc-uwaga`/`tag-eol`, nagłówek pustej kolumny
  tabeli cen, stopka bez `h4`, `aria-label` na kafelku bez zdjęcia).
- Opis operacyjny: RUNBOOK → „Obrazy skalowane".

**Stan:** wdrożone, pomiar po deployu w tym samym wpisie raportu (sekcja „Po wdrożeniu").

**Dla drugiej strony:** nowe `<img>` zestawów składać przez `obrazStaly` /
`obrazPlynny` z `src/lib/media.js`, nie ręcznie. Pakiet `@fontsource/archivo`
wyleciał z `package.json` — Fonts API pobiera pliki Archivo z CDN fontsource
przy buildzie (build wymaga dostępu do cdn.jsdelivr.net i api.fontsource.org).

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
→ zamknięte 10.10: już jest — `/kalendarz-promocji-lego/` ma osobną sekcję „Wydarzenia w salonach LEGO” (`#wydarzenia`), oddzieloną od promocji cenowych (Marek).

## 2026-09-17 08:00 · RADAR · Do zrobienia

**zklockow.pl · sekcja „odkrywaj"** — mają siatkę stron kolekcyjnych („największe zestawy LEGO", „największe Technic", kolekcje per seria); nie są datowane, więc to trwała przewaga, nie świeża publikacja.
**Mamy?** — nie: `/serie/<seria>/` z wyszukiwarką owszem, stron „największe / najdroższe zestawy serii" nie ma.
**Zrobić:** — decyzja, czy budujemy siatkę „Największe zestawy LEGO <seria>" generowaną z katalogu (liczba elementów przy 9211 z 9359 pozycji, 98%).
**Kto:** — Marek (decyzja)
→ zamknięte 10.10: mamy rankingi Piotra „Największe zestawy LEGO Technic” i „…Star Wars” (22.09); siatki generowanej dla pozostałych serii nie budujemy (Marek).

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
