# Audyt operacyjny 06.11.2026 — runnery, współpraca z Piotrem, social media

Zakres: zadania cykliczne (Routines), przepływ tekstów Piotra, social media. Okres badany:
23.10–06.11.2026 (dwa tygodnie), dla commitów 20.10–06.11. Źródła: `materialy/zadania-cykliczne.md`
(odczyt z konta 02.11 07:46), `materialy/routine-prompty.md`, raporty Kontrolera z 19.10, 26.10
i 02.11, `materialy/kontrola-linkow-2026-11-02.md`, `DZIENNIK.md` i archiwum października,
`redakcja/skrzynka.json`, `redakcja/skrzynka-instrukcja.md`, `materialy/social/rejestr.json`,
skill `klocki-social`, `materialy/statystyki/*.json`, `git log origin/main` (płytki klon:
237 commitów, pokrycie od 19.10). Pomiary z sieci zrobione dziś: `node scripts/diagnoza.mjs`
(same nazwy zmiennych) i `node scripts/kliki-raport.mjs --dni 7`.

---

## 0. Najważniejsze w pięciu punktach

1. **Firecrawl skończy się przed Black Friday, a żaden runner tego nie sygnalizuje.** 26.10: 4 975
   kredytów, 02.11: 3 839, **dziś 3 081** — zużycie ok. 190 dziennie (Weryfikacja ofert 40/dzień,
   karty ME w Łowcy do 80/dzień, Dane wt ~90/tydz.). Przy tym tempie pula schodzi do zera ok.
   **22.11**, pięć dni przed Black Friday. Do tego dokumenty podają trzy różne budżety
   miesięczne (NARZEDZIA: 1 000 i „pakiet 1 500”, RUNBOOK: 5 000).
2. **Ruch spadł w tym tygodniu i nikt o tym nie wie.** Kliknięcia ludzkie z Polski w oknie 7 dni:
   79 (01.11) → 74 → 55 → 43 → 48 (05.11) → **44 dziś** (6,3 dziennie wobec 10,6 w raporcie z
   02.11). Część to wypadnięcie piku z 26–27.10, ale spadek o ~40% w cztery dni bez żadnego
   sygnału. Równocześnie **ruch botów na `/idz/` urósł z 2 269 do 15 317 w tygodniu** (×6,7) —
   przyczyny nie sprawdzałem. Kontroler zobaczy to dopiero w poniedziałek 09.11.
3. **Runnery robią swoją robotę, ale komunikują się szumem.** Do Marka idzie ok. 30–38 maili
   automatycznych tygodniowo (Łowca codziennie „zawsze”, Scout i Radar prawie codziennie),
   w dzienniku w 14 dni stanęło 26 wpisów „Do zrobienia” od runnerów, a raport Kontrolera
   z 02.11 ma 454 linie i 20 otwartych pozycji (12 dla Marka). Te same prośby wracają tygodniami
   bez odpowiedzi (odczyt panelu GSC: trzecia prośba z rzędu).
4. **Piotr pisze dużo i dobrze, ale teksty idą czterema drogami.** 21 artykułów i ok. 650 kart
   P07 w 18 dni. Jedna trzecia artykułów (7 z 21) wymagała ręcznej interwencji, z czego 4 to błędne
   adresy (slug). W sporach o liczbę elementów Piotr miał rację w ok. 3/4 przypadków — myli się
   nasz katalog z Rebrickable, nie on. Kanał GitHub działa od 03.11 i powinien zostać jedynym.
5. **Social stoi od 11 dni.** Rejestr ma 5 publikacji w trzech dniach (15, 20, 26.10), wyłącznie
   IG+FB, zero TikToka (który skill nazywa priorytetem nr 1), bez UTM, bez strony „link w bio”,
   bez pomiaru kliknięć. Do Black Friday zostały trzy tygodnie — schemat i checklista na weekend
   w sekcji 3.

---

## 1. Runnery

### 1.1. Tabela wszystkich zadań cyklicznych

Stan konta z 02.11 (23 Routines: 17 serwisu, 3 jednorazowe social, 3 prywatne) plus zmiany
z 02–04.11 (nowy trigger Skrzynki, Zdjęcia → R2 na stałej sesji). „Commity” = ślady w
`origin/main` 23.10–06.11 (15 dni).

| # | Zadanie | Cel | Częstotliwość | Kto czyta wynik | Realny efekt 23.10–06.11 | Koszt | Ocena |
|---|---|---|---|---|---|---|---|
| 1 | **Łowca promocji** (Fable 5, stała sesja) | ceny z feedów ME/PK/Allegro, minima, historia cen, deale, posty `/deale/`, w pon. kontrola linków | codz. 08:30 | Marek + Piotr (mail PDF „zawsze”), dziennik, Kontroler | 15/15 dni z commitem (06.11 jeszcze przed startem); 4 posty dealowe (10330, 75192, 42689, 75446); 4 wpisy „Do zrobienia”; wykrył martwą kartę Lidla 10427 | do 80 kart ME/dzień w Firecrawlu (`me-ceny-stron.mjs`) + 3 weryfikacje; najdłuższy prompt (15,7 tys. znaków) | **potrzebny — rdzeń serwisu.** Mail zmienić na „tylko gdy jest gorący deal albo błąd”, Piotra zdjąć z odbiorców |
| 2 | **Scout nowości** (Opus 5) | nowe zestawy, przecieki, luki katalogu, sygnały wycofań | codz. 05:00 | Marek + Piotr (mail przy zmianach ≈ codziennie), dziennik | 13 z 15 dni (brak 25.10 i 27.10); 9 wpisów do dziennika; trafienia: Godzilla 21375 (tekst Piotra tego samego dnia), RRP 42254/11227; pudło: „9 zestawów bez strony serii” (03.11 zamknięte jako nietrafione) | Opus codziennie, prompt 13,5 tys. znaków; drobny Firecrawl | **potrzebny**, ale mail tylko jako cotygodniowe zestawienie + natychmiast przy premierze z ceną PL |
| 3 | **Radar konkurencji** (Opus 5) | publikacje fanklockow/faniklockow/zklockow, zmiany promoklocki | codz. 08:00 | Marek + Piotr (mail przy zmianach ≈ codziennie), dziennik | 14 z 15 dni (brak 30.10); 9 wpisów; coraz częściej sam poprawia dane (Godzilla RRP 04.11, kody ME 03.11) i dopisuje eseje metodologiczne | Opus codziennie | **do zawężenia**: w sezonie zostaje, ale bez codziennego maila — tygodniowe 5 pozycji; „zrobione w tym przebiegu” nie może być wpisem „Do zrobienia” |
| 4 | **Weryfikacja ofert do slajderów** + statystyki panelu (sesja Code) | potwierdzenie cen sklepów tygodniowych na kartach; dzienny zrzut GSC i kliknięć | codz. 09:17 | panel, nikt bezpośrednio | 10/10 dni od 27.10 | **40 kredytów Firecrawla dziennie = ~280/tydz.**, ok. 1/4 zużycia | **potrzebny, do odchudzenia**: limit 20 kart, a w tygodniu Black Friday z powrotem 40. Statystyki zostają — z nich zrobić alert ruchu (1.4) |
| 5 | **Kolejka indeksacji** (Sonnet 5.5) | 10–15 adresów do „Poproś o zindeksowanie” | codz. 01:57 | Cowork 10:24 | 15/15 nocy; 217 z 238 sprawdzonych adresów zindeksowanych (02.11) | build + limit API GSC | **potrzebny do końca roku**, od stycznia 3× w tygodniu |
| 6 | **Kolejka GSC — zgłoszenia** (Cowork, Mac, Chrome) | klikanie w Search Console | codz. 10:24 | nikt — odpowiedź zostaje w Coworku | brak śladu w repo; `historia.json` zapisuje, co kolejka *dała*, nie co *zgłoszono* | czas komputera Marka | **potrzebny**, ale jedna linijka wyniku musi wracać do repo/panelu — dziś nie wiadomo, czy w ogóle działa |
| 7 | **Wycofania** (Fable 5) | `wycofania.json` z działu „Ostatnie zestawy” lego.com | pon 06:10 | Marek + Piotr (mail przy zmianach) | 2 commity (26.10, 02.11) | ~16 kredytów | **potrzebny** |
| 8 | **Dane wt** (Sonnet 5) | listing lego.pl, RRP, Ceneo/Lidl/MediaMarkt, Smyk | wt 05:30 | dziennik, Kontroler | 20.10 i 27.10 zrobiła **sesja Code za runnera**; 01.11 przebieg poza cronem (niedziela); 03.11 nowy trigger zadziałał | ~75–90 kredytów | **potrzebny**; 10.11 drugi przebieg nowego triggera — sprawdzić |
| 9 | **Harmonogram z konta** (sesja Code) | `list_triggers` → zadania-cykliczne + routine-prompty, rozmiar sesji runnerów | pon 07:45 | Kontroler, panel | 2/2 | mały | **potrzebny** (infrastruktura) |
| 10 | **Przypomnienie: zrzuty Empiku i x-komu** | mail do Marka | pon 08:15 | Marek | zrzut z 26.10 wszedł 09:10; z 02.11 dopiero **03.11** (wtorek); 19.10 ceny stały 7 dni | świeża sesja | **do połączenia** z poniedziałkową „Listą Marka” (1.4) |
| 11 | **Kontroler** (Opus 5) | raport tygodnia, kamienie milowe, EPC, indeksacja, „Zadania bez właściciela” | pon 09:30 | Marek (PDF + mail), Piotr (mail z zadaniami) | 2 raporty (26.10, 02.11); jakość analizy wysoka (wykrył sondę spoza PL, rozjazd Performers 2/3) | Opus, prompt 13,6 tys. znaków | **potrzebny, do przebudowy formy**: 1 strona na górze, reszta jako załącznik (1.3) |
| 12 | **Alerty cen „Obserwuj zestaw”** | maile do czytelników | codz. 09:30 | czytelnicy | brak śladu w repo z założenia; **liczby subskrybentów i wysłanych alertów nie sprawdzono** — nie raportuje ich nikt | świeża sesja codziennie | **potrzebny, jeśli są zapisy** — liczba zapisów/wysyłek do tygodniowego podsumowania |
| 13 | **Zdjęcia → R2** — trzy triggery: panelowy `trig_01EAhU5…` (03:45 PL, nazwa mówi 04:45), stały 04:45, stały 09:45 | dogranie zdjęć z Planety do R2 | 3× dziennie | nikt (ślad w R2) | 04.11 nocny „SUCCEEDED” bez uruchomienia skryptu (klasyfikator); i tak to samo robi Łowca w kroku 3a po każdym pushu | 21 przebiegów/tydz. | **do połączenia**: zostawić jeden (09:45) albo tylko krok 3a Łowcy; panelowy skasować (Marek — API odmawia agentom) |
| 14 | **Lista linków do przeglądarki** (20. dnia 07:49) + **Kontrola linków w przeglądarce** (20. dnia 11:45, Mac) | sprawdzenie sklepów blokujących serwer | raz w miesiącu | Code, dziennik | 20.10: pierwszy przebieg poszedł w chmurze bez przeglądarki (28 s, SUCCEEDED), po „Require this computer” 19/20 żywych | mały | **potrzebny**, OK |
| 15 | **Skrzynka tekstów Piotra** (sesja Code, Gmail) | mail + panel + GitHub → publikacja | 08:52 i 14:52 | Marek, Piotr, `+piotr` | 8 commitów z tekstami/kartami od 30.10; obsłużyła 0034 (panel), 0035 (mail), R016/0036/R017 i 94 karty (GitHub) | 14 przebiegów/tydz. w jednej sesji Code | **potrzebny, do uproszczenia** (sekcja 2) |
| 16 | **Jednorazowe social** — „Zdjąć Grogu” (02.11, wykonane), „Archiwizacja karuzeli z 20.10” (03.11, „nigdy nie odpalony”, karuzelę zarchiwizował Marek 04.11), „Archiwizacja postów z 26.10” (09.11) | przypomnienia o zdjęciu postów | jednorazowo | Marek | 09.11 odpali się o postach już zarchiwizowanych 02.11 | — | **do usunięcia** jako mechanizm: panel → Social już pokazuje „po terminie”; termin wchodzi do poniedziałkowej listy |

Pozostałe na tym samym limicie konta (poza serwisem): Angielski (pon), inwestycja (pon), Herzfaden (śr).

**Brakujące** (szczegóły w 1.4): monitor przychodów, alert spadku ruchu i skoku botów, alarm
budżetu Firecrawla, kontrola social, tygodniowe podsumowanie biznesowe w 5 punktach, jedna
poniedziałkowa lista decyzji Marka z domyślną odpowiedzią.

### 1.2. Rytm i obciążenie

- **~96 przebiegów tygodniowo** w Routines serwisu, z czego 21 to Zdjęcia → R2 (redundantne)
  i 14 Skrzynka. Opus 5 chodzi codziennie dwa razy (Scout, Radar) plus Kontroler.
- **Każdy runner z pushem ma ślad** — luki tylko: Scout 25.10 i 27.10, Radar 30.10, Dane wt
  dwa razy zastąpiony przez sesję Code. To dobra kondycja.
- **Sesja Code dźwiga trzy zadania cykliczne** (Skrzynka 2×/dzień, Weryfikacja, Harmonogram)
  i pracę ręczną — rośnie najszybciej. „Harmonogram z konta” liczy rozmiar sesji runnerów;
  trzeba się upewnić, że liczy też tę.
- **`SUCCEEDED` nie znaczy „zrobione”** — dwa udokumentowane przypadki w dwa tygodnie
  (Zdjęcia → R2 04.11, kontrola w przeglądarce 20.10). Dla zadań bez pushu (Alerty, Zdjęcia,
  Kolejka GSC, Przypomnienie) dziś nikt nie sprawdza dowodu wykonania.

### 1.3. Czytelność: sygnał czy szum?

**Ile tego jest.** Odbiorcy z `src/data/raporty_mail.json`: Łowca („zawsze”), Scout, Radar,
Wycofania, Kontroler, teksty — wszystkie do Marka i Piotra; przypomnienie, podejrzany rynek,
linki — tylko do Marka. Przy obecnym rytmie: **ok. 30–38 maili automatycznych tygodniowo do
Marka, 25–30 do Piotra**, do tego PDF Kontrolera przez SendUserFile, powiadomienia push z sesji,
dziennik (26 wpisów „Do zrobienia” od runnerów w 14 dni: Scout 9, Radar 9, Łowca 4, Dane wt 2,
Kontroler 2) i panel. Format „Kto co robi” (od 13.10) jest dobry, ale każdy runner stosuje go
osobno, więc Marek dostaje pięć list zamiast jednej.

**Co działa:** czterolinijkowy format z polem „Kto”, Kontroler zbierający wpisy w „Zadania bez
właściciela”, zamykanie linią „→ zamknięte”, zasada „nie powtarzaj uwag bez dowodu”.

**Przykłady komunikatów niejasnych albo zbędnych:**

1. **„Do zrobienia”, które jest już zrobione.** Radar 04.11: „**Zrobić:** — zrobione w tym
   przebiegu: `rrp_potwierdzone.json`…”, „**Kto:** — Code”. To informacja, nie zadanie —
   a trafia do listy zadań i do maila.
2. **Decyzja przebrana za zadanie, z esejem w środku.** Radar 05.11 (kalendarze adwentowe):
   „zdecydować, czy dokładamy drugi kąt…”, a pod spodem akapit o własnym błędzie z Ceneo
   („Wpadłem więc we własnym zapytaniu w dokładnie ten błąd…”). Marek dostaje do decyzji rzecz
   bez rekomendacji i z dygresją, która nie jest dla niego.
3. **Zadanie dla Piotra na podstawie tekstu, którego runner nie przeczytał.** Scout 06.11:
   „przeczytać artykuł StoneWars… dopisać akapit o ukrytym easter eggu; sam artykułu nie
   otwierałem (budżet przebiegu), więc treści easter egga nie znam.”
4. **Fałszywy alarm, który kosztował przebieg.** Scout 02.11: „9 zestawów bez strony serii” →
   03.11 „zgłoszenie było nietrafione, nie ma czego poprawiać” (zachowanie zamierzone od 11.10).
5. **Drobiazg eskalowany do właściciela.** Kontroler 26.10, decyzja 3: przesunąć Kontrolera
   z 09:30 na 09:35. Trzy tygodnie bez odpowiedzi, 02.11 wycofane („bez szkody”).
6. **Ta sama prośba trzeci tydzień z rzędu.** Odczyt panelu GSC: 19.10, 26.10, 02.11 —
   kamień milowy nr 4 stoi na danych z 12.10. Prośba, która trzy razy nie zadziałała, nie jest
   sygnałem — trzeba ją albo zautomatyzować (zadanie Coworka), albo skasować.
7. **Ręczny krok ukryty w dzienniku.** 02.11: dwa maile do Piotra czekają jako szkice w
   tylkoklockiblog@ („wysyłkę zablokował klasyfikator — Marek klika Wyślij”). Nigdzie poza
   dziennikiem tego nie widać.
8. **Przypomnienie o czymś już zrobionym.** Jednorazowy trigger 09.11 przypomni o zdjęciu
   postów z 26.10, zarchiwizowanych 02.11.
9. **Mail „zawsze”.** Łowca wysyła PDF codziennie, także bez zmian, do Marka i Piotra. Piotr
   nie ma w nim nic do zrobienia (ceny i feedy to obszar Marka).
10. **Raport, który wymaga 20 minut.** Kontroler 02.11: 454 linie, 9 sekcji, 20 pozycji
    otwartych. Treść jest świetna, ale nagłówek „Trzy rzeczy z tego tygodnia” to trzy długie
    akapity, a decyzje są rozrzucone w dwóch miejscach („Kto co robi” i „Trzy decyzje na ten
    tydzień” — te same treści dwa razy).
11. **Pusty wpis.** `DZIENNIK.md`: nagłówek „2.11.2026 (2) — Ustalenia z Piotrem: proces
    publikacji przez GitHub” bez treści (następna linia to już wpis Kontrolera).

**Wniosek:** sygnał „co mam zrobić” istnieje, ale jest rozproszony po ~35 mailach, dzienniku
i 454-liniowym raporcie. Marek nie potrzebuje więcej informacji, tylko **jednego miejsca
z 3–5 decyzjami tygodnia i domyślną odpowiedzią**.

### 1.4. Rekomendacje dla runnerów

**A. Jedna „Lista Marka” zamiast pięciu (najważniejsze).**
- Poniedziałek ok. 10:00 (po Kontrolerze) jeden mail + kafel „Twoje decyzje” na panelu → Dziś.
- Najwyżej 5 pozycji, każda z **terminem i domyślną odpowiedzią**: „Jeśli nie odpowiesz do
  środy, robimy X”. Koniec z prośbami wiszącymi trzy tygodnie (GSC, Performers, 09:35).
- Wchodzą tu: zrzuty Empiku/x-komu (zamiast osobnego Przypomnienia), szkice maili do
  wysłania, triggery do skasowania w panelu, posty social po terminie.
- Pozycje dla Code i Coworka nie trafiają do Marka — idą do kolejki tych sesji.

**B. Mniej maili.**
- Łowca: `wysylka: przy_zmianach` z warunkiem „gorący deal, nowe minimum na zestawie z wycofań,
  błąd feedu”; Piotra zdjąć z odbiorców.
- Scout i Radar: bez codziennego maila; jedno tygodniowe zestawienie (czw./pt.) dla Piotra
  z tematami, natychmiastowy mail tylko przy premierze z polską ceną albo kodzie rabatowym.
- Reguła formatu dla wszystkich: wpis „Do zrobienia” tylko wtedy, gdy ktoś inny niż runner
  ma coś zrobić; „zrobione w tym przebiegu” idzie do sekcji „Zrobione”, nie do listy zadań.
  Każda decyzja dla Marka ma rekomendację runnera („Proponuję: tak, bo…”).

**C. Kontroler — forma, nie treść.**
Na górze jedna strona: 5 liczb (prowizje, kliknięcia PL/dzień, Google, indeksacja, social),
3 decyzje z domyślną odpowiedzią, lista „co się zepsuło”. Reszta (diagnoza, boty, EPC,
inspekcja) jako załącznik. Usunąć duplikat „Kto co robi” / „Trzy decyzje”.

**D. Brakujące zadania — wszystkie tanie, bo dane już są w repo:**

| Brakuje | Jak | Źródło danych | Koszt |
|---|---|---|---|
| **Alarm budżetu Firecrawla** | krok w Weryfikacji ofert 09:17: stan kredytów z `diagnoza.mjs`, prognoza „wystarczy do …”; przy prognozie < 14 dni → pozycja na Liście Marka i automatyczne obcięcie limitów (weryfikacja 20, karty ME 40) | API Firecrawla | 0 kredytów |
| **Alert spadku ruchu i skoku botów** | skrypt porównujący dzisiejszy `materialy/statystyki/<data>.json` z tym sprzed 7 dni: kliknięcia PL (spadek > 30%), boty (wzrost > 3×), Google; jedna linijka w panelu Dziś + mail tylko przy przekroczeniu | `panel-statystyki.mjs` (już działa codziennie) | 0 |
| **Monitor przychodów** | `prowizje-raport.mjs --dni 1` w tym samym zadaniu 09:17: nowa transakcja, zmiana statusu (oczekująca → zatwierdzona/odrzucona), osobno EUR i PLN | API TD, Adtraction, Performers | 0 |
| **Kontrola social** | w podsumowaniu tygodnia: liczba publikacji wg platform wobec planu, posty po terminie, kliknięcia z UTM (sekcja 3.6) | `materialy/social/rejestr.json`, Analytics Engine | 0 |
| **Podsumowanie biznesowe w 5 punktach** | piątek 15:00 (albo jako górna strona Kontrolera): 1) pieniądze, 2) ruch, 3) treści i social, 4) co się zepsuło, 5) decyzje (max 3, z domyślną odpowiedzią) | wszystko powyżej | 1 przebieg/tydz. |
| **Dowód wykonania zadań bez pushu** | Alerty cen, Zdjęcia → R2 i Kolejka GSC zapisują jedną linijkę wyniku (R2 `_stan/` albo plik w repo przez sesję z pushem); alert-runner sprawdza świeżość | — | 0 |

**E. Porządki w harmonogramie (do zrobienia przy okazji):**
- Skasować panelowy `trig_01EAhU5SKn2GuXxY14WYxNkJ` (Marek) i zostawić jeden przebieg Zdjęć.
- Skasować jednorazowy trigger 09.11 o postach z 26.10 (posty zarchiwizowane 02.11, karuzela
  75439 ma stan „zostaje”).
- Ujednolicić budżet Firecrawla w `NARZEDZIA.md` i `RUNBOOK.md` (dziś 1 000 / 1 500 / 5 000).
- `redakcja/wspolpraca.md` — opis „obaj pushują na main” jest nieaktualny (sekcja 2).

---

## 2. Współpraca z Piotrem i jego Claude

### 2.1. Jak dziś płyną teksty

Cztery drogi w ciągu dwóch tygodni:

| Droga | Od kiedy | Przykłady 20.10–04.11 | Uwagi |
|---|---|---|---|
| **Przez Marka w sesji Code** (załącznik) | od 14.09 | 0022–0025, R011 (20–22.10); 0027, 0028, R012 (25.10); 0030–0033 (30.10); R015 + partie 03/04/29 (02.11) | ok. 13 z 21 artykułów; zależy od dostępności Marka |
| **Mail** `tylkoklockiblog+code@` | 24.10 | 0035 (01.11) | limit ~9 MB; 0034 (10,6 MB) odbił |
| **Panel** → Wgraj | 01.11 | 0034 (02.11) | zapasowa droga; docx/pdf czekają na sesję |
| **GitHub** `tylkoklocki-teksty/do-publikacji/` | 02.11 (token), pierwszy przebieg 03.11 | R016, 0036, R017, 94 karty | brak limitu rozmiaru, status widoczny w folderach, kopia wersji ze strony |

Do tego listy zestawów do opisania wracają do Piotra dwiema drogami (xlsx/json w `materialy/`
i CSV w `tylkoklocki-teksty/listy/`), a instrukcje dla jego Claude leżą w siedmiu miejscach:
`redakcja/skrzynka-instrukcja.md`, `przekazywanie-tekstow.md`, `format-tekstow.md`,
`instrukcje-dla-claude-piotra.md` (z 21.10 — sugeruje, że Piotr pracuje na repo z deployem
z `main`), `wspolpraca.md` („obaj pushują niezależnie na main” — nieaktualne), trzy PDF-y
w `materialy/` i doraźne maile `materialy/mail-do-piotra-*.md`.

### 2.2. Liczby

**Artykuły** (rejestr `redakcja/skrzynka.json`, 20.10–04.11): **21**, czyli ok. 9 tygodniowo
(20–26.10: 10; 27.10–02.11: 8; 03–04.11: 3). Brakuje numeru Recenzje_014 — nie sprawdzałem,
czy go nie było, czy zaginął.

**Karty P07:** `karty_setow.json` 1 424 (22.10) → **1 918** (06.11); razem z 150 kartami z 20.10
to ok. **650 kart w 18 dni**.

**Problemy w artykułach — 7 z 21 (33%) wymagało ręcznej interwencji:**

| Tekst | Problem | Skutek |
|---|---|---|
| 0035 | slug „sagrada-**fam-lia**” (slugify gubił „í”) | poprawione przed wysyłką linków |
| Recenzje_015 (75421) | slug ucięty w pół frazy („…-najtansze-wejscie-do”) | adres zmieniony **po** publikacji, stary żył kilka minut bez przekierowania |
| Recenzje_016 (21276) | slug „…-dla-fanow-**ktorzy**” | został na produkcji |
| 0036 (Godzilla) | slug „…-1699-99-zl-**od-27**” (ucięte „od 27 listopada”) — już **po** poprawce slugify z 03.11, bo reguła łapie tylko spójniki/przyimki na końcu | został na produkcji |
| 0030 (DC 2027) | ceny Batmobili w euro, choć LEGO.pl miało złotówki | Code poprawił 27.10; ponowna wysyłka Piotra 30.10 nadpisała poprawkę, przywrócone ręcznie |
| 0034 | mail 10,6 MB | „do poprawy”, publikacja przez panel po ~17 h |
| 0027 | rozbieżność z `przecieki.json` (inny projekt fana) | decyzja Marka: obie wersje zostają |

**Błędne adresy: 4 z 21 (19%)** — to najczęstszy błąd i w całości po naszej stronie (automat
robi slug z tytułu).

**Karty:**
- blokady: 3 karty z jednym akapitem (30638, 30660, 30726 — automat dodatkowo gubił linię
  „BLOKADA” i raportował „ok”), 4 numery z literą (L0002220–23 — błąd importera), 4 nieaktualne
  blokady RRP w partii 26, 1 blokada RRP 42621 (rację miał Piotr);
- **zmarnowana praca:** partie 26–27 (~50 kart) okazały się duplikatami istniejących kart;
  partie 03 i 04 (50 kart z września) „zagubione” i wgrane dopiero 02.11 — ok. 6 tygodni;
- **liczba elementów:** ok. 25 rozjazdów; **rację miał Piotr w ok. 19** (15 przy partiach
  24–25, 10797, 72168 Rayquaza 1083 zamiast 1183, 910055, 910064, 910065), my w ok. 5–6 (40519,
  80056, 43242, 5009005, 40686 — ta ostatnia zostawiona decyzją Marka). Słabszym źródłem jest
  nasz katalog z Rebrickable, nie Piotr;
- wcześniej (mail z 19.10) dwa błędy gramatyczne szablonu: 105 kart z „262 elementów” i 25 kart
  z „jest zabawę…”.

### 2.3. Czas od wysłania do publikacji

- **GitHub i mail:** automat o 08:52 i 14:52 → w dzień 0–6 h, wysłane po 14:52 czeka do rana
  (do 18 h). Przykład: 0036 i R017 wysłane 04.11, na stronie 04.11 po 14:52.
- **Panel po odbitym mailu:** 0034 — 01.11 15:25 → 02.11 08:55 (~17,5 h).
- **Przez Marka:** zależy od Marka; skrajny przypadek partie 03/04 — ok. 6 tygodni.
- Piotr nie dostaje informacji zwrotnej szybciej niż automat — błąd formatu wychodzi dopiero
  po 08:52/14:52, a poprawka kosztuje kolejne pół dnia.

### 2.4. Co Piotr dostaje z powrotem

- mail „Opublikowane” z linkami i uwagami (dobre, konkretne);
- **codziennie PDF Łowcy** i niemal codziennie Scouta i Radaru — razem ok. 20 maili tygodniowo,
  w większości o cenach i danych, czyli obszarze Marka;
- w poniedziałek „Zadania bez właściciela” (02.11: 20 pozycji, z tego 2 dla Piotra);
- **nie dostaje:** jak radzą sobie jego teksty (wyświetlenia w Google, pozycje, kliknięcia do
  sklepów — dane są w `materialy/statystyki/` i panelu, ale nikt mu ich nie podsyła), listy
  priorytetów na sezon (Black Friday, Mikołajki) z terminami, informacji, że Code zmienił coś
  w jego tekście (poza mechanizmem `…__wersja-ze-strony.md` w GitHubie).

Dobre sygnały: recenzja 60478 Betoniarki na pozycji 3 w Google (raport Kontrolera 02.11, przy
pojedynczych wyświetleniach), tekst o Godzilli tego samego dnia co zapowiedź, teksty historyczne
ze zdjęciami — Piotrowi warto o tym mówić.

### 2.5. Jasność instrukcji dla Claude Piotra

Instrukcja skrzynki jest dokładna, ale: (a) trzy kanały opisane w jednym dokumencie, bez
wskazania jednego domyślnego; (b) reguły formatu w czterech plikach i trzech PDF-ach; (c) brak
listy kontrolnej przed wysłaniem — Claude Piotra nie ma jak sprawdzić RRP, ceny w zł czy liczby
elementów wobec naszych danych przed wysłaniem; (d) dokumenty o roli Piotra (`wspolpraca.md`,
`instrukcje-dla-claude-piotra.md`) opisują stan sprzed skrzynki.

### 2.6. Rekomendacje

1. **Jeden kanał: GitHub.** `tylkoklocki-teksty/do-publikacji/` jako jedyna droga dla tekstów
   i kart Piotra. Mail — tylko awaryjnie (opisany jednym zdaniem), panel — dla Marka (docx,
   pliki od osób trzecich). „Przez Marka w sesji” dla tekstów Piotra kończymy. Uzasadnienie:
   bez limitu rozmiaru, stan widać w folderach (`opublikowane/`, `do-poprawki/`), jest kopia
   wersji ze strony, nikt nie musi klikać „Wyślij”.
2. **Natychmiastowa walidacja zamiast czekania do 08:52/14:52.** GitHub Action w repo tekstów
   na każdy push: klon publicznego `blogoklockach`, `import-artykul-md.py --sucho` /
   `import-karty.py --sucho`, wynik jako komentarz do commita albo plik `do-poprawki/…uwagi.md`.
   Piotr widzi błąd po minucie, a automat publikacji dalej chodzi dwa razy dziennie. (Wymaga
   zgody Marka na Actions w repo tekstów; nie dotyka serwisu.)
3. **Slug w bloku danych.** Nowe pole „Adres” w `[DANE DLA SERWISU]` (≤ 60 znaków, bez ucinania,
   recenzje wg konwencji `lego-<nr>-<nazwa>-recenzja`) — Claude Piotra proponuje, importer
   waliduje. Tymczasem w imporcie: nie ucinać na liczbie ani w środku frazy „od 27 listopada”;
   rozważyć przekierowania dla 21276 i 0036 (zmiana `public/_redirects`, nie workera).
4. **Lista kontrolna przed wysłaniem — jeden skill dla Claude Piotra.** Nowy generowany skill
   (np. `tylkoklocki-przekazanie`) z `redakcja/` w miejsce rozproszonych instrukcji:
   format, nazwy plików, rozmiar, slug, „ceny w zł z LEGO.pl, jeśli są — nie w euro”, RRP
   i liczba elementów **sprawdzone w naszych danych** (repo jest publiczne: Claude Piotra może
   czytać `src/data/rrp_potwierdzone.json` i `src/data/sety.json` z raw.githubusercontent.com),
   „poprawki zaczynaj od `…__wersja-ze-strony.md`” (chroni przed powtórką 0030).
5. **Brickset jako automatyczny arbiter liczby elementów.** Przy rozjeździe import sam pyta
   Brickset API (klucz jest) i poprawia katalog albo kartę; do ludzi trafia tylko remis.
   Dziś każdy z ~25 rozjazdów rozstrzygał człowiek.
6. **Lista zestawów do opisania — jedno źródło.** CSV w `tylkoklocki-teksty/listy/`
   generowany automatycznie po każdej wgranej paczce (dziś „co ~5 paczek” ręcznie), z kolumną
   „ma kartę” — koniec duplikatów jak partie 26–27.
7. **Tygodniowy mail „Dla Piotra” (piątek) zamiast codziennych PDF-ów:** opublikowane teksty
   z wyświetleniami i pozycją w Google, kliknięcia do sklepów z jego tekstów, do 5 tematów na
   przyszły tydzień z terminem (od Scouta i Radaru), poprawki, które Code zrobił w jego tekstach.
   Piotra zdjąć z maili Łowcy, Scouta i Radaru.
8. **Podział ról, zapisany na nowo w `redakcja/wspolpraca.md`:**
   - **Piotr** — tematy, research, teksty, karty P07; zgłasza, co chce pisać.
   - **Claude Piotra** — format, lista kontrolna, commit do `do-publikacji/`, czytanie
     `do-poprawki/`.
   - **Code** — publikacja, ceny, linki, galerie, korekta danych; każda zmiana w tekście Piotra
     ląduje w `…__wersja-ze-strony.md`.
   - **Marek** — priorytety tematów na sezon, rozstrzygnięcia sporne (raz w tygodniu, na
     Liście Marka).

---

## 3. Social media

### 3.1. Co zrobiono do tej pory

Rejestr `materialy/social/rejestr.json`: **5 publikacji, wszystkie IG + FB**.

| Data | Format | Temat | Stan |
|---|---|---|---|
| 15.10 | karuzela | „5 zestawów LEGO nawet 600 zł taniej” | zarchiwizowane 01.11 |
| 20.10 | karuzela | „5 zestawów LEGO nawet 400 zł taniej” | zarchiwizowane 04.11 |
| 26.10 | post | Grogu 75446 za 319 zł (x-kom, kod) | zarchiwizowane 02.11 |
| 26.10 | rolka | Deal alert Grogu 75446 −43% | zarchiwizowane 02.11 |
| 26.10 | karuzela | Recenzja 75439 Popiersie Vadera (7 slajdów) | zostaje |

**Od 26.10 — nic (11 dni).** Pole `link` puste w dwóch karuzelach okazji, nigdzie nie ma UTM,
nie ma żadnej liczby (zasięg, kliknięcia). Na stronie nie ma linków do profili (stopka,
`/o-nas/`, `sameAs` w danych strukturalnych). Nie sprawdzałem, czy istnieją konta TikTok,
Pinterest i grupa „Łowcy Klocków” — w repo nie ma po nich śladu.

### 3.2. Zasady (skill `klocki-social`) — co jest dobre, co nie pasuje do praktyki

Dobre i warte utrzymania: faceless; „jedno zadanie na treść: klik albo zapis”; zasady
karuzeli (teza z liczbą, jeden deal na slajd, slajdy czytelne osobno, oznaczenie
#materiałpartnerski na grafice); grafiki z HTML (bezbłędne polskie znaki i ceny); rolka
„Deal alert” z `scripts/rolka-deal.mjs` (dane z repo, odmowa przy cenach starszych niż 7 dni,
kontrola strefy bezpiecznej); rejestr z terminem archiwizacji.

Rozjazdy z praktyką:
- **TikTok „priorytet #1”** — zero publikacji.
- **„1–2 TikToki dziennie w X–XII”, „deale w 2 h od wykrycia”** — nierealne przy obecnym
  podziale pracy (Code generuje, Marek publikuje ręcznie); efekt: 5 publikacji w 3 tygodnie.
- **„Paczka tygodniowa” 7–10 TT + 3 karuzele + 5 FB** — nikt jej nie zamawia; nie ma rytmu.
- **„Zero YouTube”** — wykluczone razem z Shorts, choć to ten sam plik MP4 co Reels.
- **Pinterest nie istnieje w skillu**, a mamy 21 prezentowników (`/prezentowniki/na-mikolaja/`,
  `prezenty-pod-choinke`, `wedlug-budzetu`, `swieta-dla-dzieci`…) — to najlepszy materiał
  na Pinterest w listopadzie i grudniu.
- **Brak szablonu karuzeli jako skryptu** — 26.10 powstał jednorazowy
  `materialy/social/2026-10-26/generuj.py`; każdy kolejny post zaczyna od zera.
- **Brak pomiaru** — skill nie mówi nic o UTM ani o tym, jak liczyć kliknięcia z social.
- Paczkę skilla po zmianie z 01.11 (rejestr) trzeba było wgrać na claude.ai — **nie
  sprawdzono**, czy Cowork ma aktualną wersję.

### 3.3. Co działa, czego brakuje

**Działa:** generator rolek (35 s renderu), grafiki z danych, rejestr i panel → Social
(pokazuje, co po terminie), dyscyplina archiwizacji postów z kodami.

**Brakuje:** rytmu tygodniowego; kont TikTok/Pinterest (albo decyzji, że ich nie będzie);
stałych szablonów (okazje, recenzja, prezentownik, ciekawostka, pin); strony „link w bio”;
UTM i licznika kliknięć z social; wpięcia social w plan sezonu (Black Friday, Mikołajki);
podziału ról przy publikacji (dziś „Code grafika, Marek publikacja” — Marek jest wąskim
gardłem).

### 3.4. Schemat działań

**Kanały (propozycja do decyzji Marka):**

| Kanał | Rola | Co publikujemy | Decyzja |
|---|---|---|---|
| **Instagram** | witryna, karuzele, Reels, Stories z linkiem | wszystkie formaty | zostaje |
| **Facebook** (fanpage) | rodzice 30–45, link bezpośredni w poście | te same treści, link w treści, nie w bio | zostaje |
| **TikTok** | zasięg | rolki deal i edukacyjne (ten sam MP4) | **założyć konto w weekend** (faceless, firmowe); jeśli Marek nie chce — wykreślić ze skilla |
| **Pinterest** | ruch z wyszukiwarki prezentów, długie życie pinu, link bezpośredni | piny prezentowników, kalendarzy adwentowych, „LEGO dla dorosłych” | **nowy — polecam**, najlepszy stosunek pracy do efektu w XI–XII |
| **YouTube Shorts** | dodatkowy zasięg z tego samego pliku | repost rolek | opcjonalnie: zmienić „Zero YouTube” na „zero długiego YouTube”; decyzja Marka |
| Grupa FB „Łowcy Klocków” | aktyw długoterminowy | — | **po Świętach**; dziś brak mocy na moderację |

**Rytm tygodnia (od 09.11):**

| Dzień | Format | Kanały | Źródło treści |
|---|---|---|---|
| **Pon** | Karuzela „Okazje tygodnia” (5 zestawów + slajd CTA) | IG, FB, Stories | Łowca (gorące, cena potwierdzona w Weryfikacji ofert) |
| **Wt** | Rolka „Deal alert” | TikTok, Reels (IG+FB), Shorts | `rolka-deal.mjs` — najlepszy deal dnia |
| **Śr** | Karuzela-recenzja (5–7 slajdów, werdykt i próg zakupu) | IG, FB, Pinterest (1 pin) | recenzja Piotra z ostatniego tygodnia |
| **Czw** | Rolka #2: deal albo edukacyjna („ile kosztuje klocek”, „pseudopromocja”) | TikTok, Reels, Shorts | dane `ceny_baza.json` |
| **Pt** | Prezentownik sezonowy (karuzela) + 3 piny | IG, FB, Pinterest | `/prezentowniki/…` |
| **Sob** | Ciekawostka/historia (karuzela) | IG, FB | teksty historyczne Piotra (Paradisa, Cargo Center, płyty drogowe) |
| **Nd** | tylko Stories (przypomnienie okazji) | IG | — |

Razem 6 publikacji + piny tygodniowo, z czego 2 rolki (jeden plik → 3–4 kanały).

**Kto co robi:**

| Kto | Co | Kiedy |
|---|---|---|
| **Code** | wybór treści z danych (gorące deale z ceną potwierdzoną dziś), grafiki PNG i rolki MP4 ze skryptów, opisy z UTM, wpis w rejestrze ze stanem „przygotowane”, strona „link w bio” | pon rano paczka na tydzień; deale wt/czw rano z ceną z dnia |
| **Cowork** (przeglądarka na Macu) | publikacja i planowanie w Meta Business Suite (IG+FB), TikTok, Pinterest, Shorts; jedna linijka zwrotna „opublikowane: … (linki do postów)” → Code zmienia stan w rejestrze | pon: zaplanowanie paczki; wt/czw: rolki po akceptacji |
| **Marek** | akceptacja paczki tygodniowej jednym „tak” (albo skreślenia); akceptacja rolki z ceną; decyzje o kanałach | pon, 5 minut |
| **Piotr** | nic dodatkowego — jego recenzje i teksty historyczne są surowcem; opcjonalnie wskazuje „tekst tygodnia” | — |

Zasada ceny: post z ceną ma na grafice „cena z DD.MM” i link do huba; przed publikacją
zaplanowanego posta z ceną Cowork porównuje cenę z hubem (skill już to wymaga) — jeśli się
nie zgadza, post czeka na Code.

**Szablony (do zbudowania jako skrypty, jak `rolka-deal.mjs`):**

| Szablon | Rozmiar | Pola |
|---|---|---|
| Okazje tygodnia | 1080×1350, 5 + 2 slajdy | zestaw, zdjęcie, cena dziś, cena katalogowa, rabat (liczony), sklep, data ceny |
| Recenzja | 1080×1350, 5–7 slajdów | teza, 3 plusy/minusy, próg zakupu, werdykt, link |
| Prezentownik | 1080×1350, 6 slajdów | wiek/budżet, 4 zestawy, „gdzie najtaniej dziś”, link |
| Ciekawostka / historia | 1080×1350, 5 slajdów | rok, fakt, zdjęcie, link do tekstu |
| Pin | 1000×1500 | tytuł prezentownika, 3–4 zdjęcia, budżet |
| Rolka deal | 1080×1920, 12 s | istnieje (`scripts/rolka-deal.mjs`) |

Punkt wyjścia: uogólnić `materialy/social/2026-10-26/generuj.py` do `scripts/social-karuzela.mjs`
(albo `.py`) z wyborem szablonu; wyjście do `materialy/social/<data>/`.

**Archiwizacja i rejestr:**
- Rejestr rozszerzyć o stany „przygotowane” i „zaplanowane”, pola `utm_campaign`,
  `linki_postow` (per platforma) i `wyniki` (zasięg, kliknięcia — uzupełniane w poniedziałek).
- Zamiast jednorazowych triggerów: panel → Dziś już pokazuje „Social — do zdjęcia”; to samo
  wchodzi do poniedziałkowej Listy Marka i do zadania Coworka (zdejmuje w tym samym przebiegu,
  w którym planuje nową paczkę).
- Termin bez zmian: okazje +14 dni, kod rabatowy — dzień po wygaśnięciu, recenzje i
  prezentowniki zostają (prezentowniki sezonowe archiwizujemy 27.12).

### 3.5. Mierniki

- **UTM na każdym linku z social:** `?utm_source=instagram|facebook|tiktok|pinterest|youtube`
  `&utm_medium=social&utm_campaign=<RRRR-MM-DD>-<format>` (np. `2026-11-09-okazje`).
  GA4 (jest w `Base.astro`) policzy sesje według źródła.
- **Kliknięcia do sklepów z social bez zmian w workerze:** serwis nie ustawia `Referrer-Policy`,
  więc przeglądarka wysyła przy kliknięciu w `/idz/` pełny adres strony z parametrami
  (ta sama domena). Worker zapisuje referer w `blob4`, więc wystarczy w `kliki-raport.mjs`
  (skrypt, nie worker) dodać zestawienie kliknięć z refererem zawierającym `utm_source=`.
  Ograniczenie: liczy tylko kliknięcia na stronie, na którą wszedł czytelnik z social —
  przejście na drugą stronę gubi UTM (pełny obraz da GA4).
- **Strona „link w bio”** (np. `/linki/`): aktualne posty z linkami do hubów, każdy z UTM;
  ten adres w bio IG i TikToka. Zmiana w `src/pages`, nie w workerze.
- **Tygodniowo (w podsumowaniu biznesowym):** publikacje wg planu (cel 6/tydz. + piny),
  sesje z social (GA4), kliknięcia `/idz/` z UTM, obserwujący na kanał, najlepszy post.
- **Cel na 4 tygodnie (propozycja, bez punktu odniesienia):** 24 publikacje + 20 pinów;
  pierwsze 30 kliknięć do sklepów z social w tygodniu Black Friday. Po dwóch tygodniach
  pomiaru cel trzeba urealnić.

### 3.6. Harmonogram na 4 tygodnie (09.11–06.12)

Kalendarz z `/kalendarz-promocji-lego/` i dziennika: x-kom Black Weeks (kod tygodnia
zmienia się w poniedziałki, `black-weeks3` do 08.11), Allegro Black Weeks do 30.11, kod ME
`R0211-301126` do 30.11, gratis 40889 do 11.11, Black Friday **27.11** (piątek) razem
z premierą **21375 Godzilla** (gratis 40888), Cyber Monday **30.11**, kalendarze adwentowe
od **01.12**, Mikołajki **06.12** (niedziela — realny termin zamówień z dostawą to ok. 02–03.12).
Daty kampanii sklepów „przed Black Friday” (14–20.11) i Insiders Weekend (21–22.11) są
w kalendarzu oznaczone jako przewidywane.

**Tydzień 1: 09–15.11 — „rozruch i kalendarze adwentowe”**
| Dzień | Publikacja |
|---|---|
| pon 09.11 | Karuzela „Okazje tygodnia” + nowy kod x-kom BW (jeśli przyjdzie) |
| wt 10.11 | Rolka: najlepszy deal z kodem x-kom / ME |
| śr 11.11 | Karuzela-recenzja: 42646 Pokój Autumn albo 21276 Creeper (świeże recenzje Piotra); ostatni dzień gratisu 40889 jako Stories |
| czw 12.11 | Rolka: „Kalendarze adwentowe 2026 — który najtańszy dziś” (5 kalendarzy 29–35% pod katalogiem) |
| pt 13.11 | Prezentownik „LEGO na Mikołajki” + 5 pinów (Mikołajki, pod choinkę, według budżetu) |
| sob 14.11 | Ciekawostka: historia płyt drogowych LEGO od 1978 |

**Tydzień 2: 16–22.11 — „przed Black Friday”**
| Dzień | Publikacja |
|---|---|
| pon 16.11 | Okazje tygodnia (pierwsze kampanie przed BF) |
| wt 17.11 | Rolka deal |
| śr 18.11 | Karuzela edukacyjna „Jak rozpoznać pseudopromocję na Black Friday” (próg 15%, cena sprzed 30 dni) — buduje zaufanie przed szczytem |
| czw 19.11 | Rolka: „ile kosztuje klocek” — duże zestawy dla dorosłych |
| pt 20.11 | Prezentownik „Święta dla dorosłych” + 5 pinów |
| sob 21.11 | Insiders Weekend (jeśli potwierdzony) — Stories; ciekawostka: Paradisa |

**Tydzień 3: 23–29.11 — Black Friday i Godzilla**
| Dzień | Publikacja |
|---|---|
| pon 23.11 | Okazje tygodnia + zapowiedź „w piątek Godzilla i BF — obserwuj” |
| wt 24.11 | Rolka deal; przypomnienie: kalendarze adwentowe przed 01.12 |
| śr 25.11 | Karuzela „Black Friday LEGO: które rabaty są prawdziwe” (nasze minima vs ceny BF) |
| czw 26.11 | Rolka: 21375 Godzilla — „premiera w BF to nie okazja, okazją jest gratis 40888” (teza z tekstu Piotra) |
| **pt 27.11** | **Black Friday:** rano karuzela „5 najlepszych cen dnia” (dane z porannego Łowcy), wieczorem rolka z najlepszym dealem; FB post z linkiem |
| sob 28.11 | Stories: aktualizacja cen BF; prezentownik „Według budżetu” + piny |

**Tydzień 4: 30.11–06.12 — Cyber Monday i Mikołajki**
| Dzień | Publikacja |
|---|---|
| **pon 30.11** | **Cyber Monday:** okazje dnia; ostatni dzień kodu ME i Allegro BW |
| wt 01.12 | Rolka: „Mikołajki — zamów do środy” (najlepsze zestawy do 100 i 200 zł) |
| śr 02.12 | Prezentownik „Na Mikołaja” — ostatnie wezwanie (dostawa) |
| czw 03.12 | Rolka deal |
| pt 04.12 | Karuzela „Prezent last minute: LEGO.pl, Smyk, sklepy z odbiorem” (bez obietnic dostawy, których nie znamy) |
| sob 05.12 | Stories; zapowiedź prezentowników świątecznych |
| nd 06.12 | Mikołajki: post „dzień dobry” bez ceny (zasięg) |

Archiwizacja: okazje z tygodnia 1 → 23.11, z tygodnia 2 → 30.11 itd.; posty BF i Cyber
Monday → 01.12; posty z kodami → dzień po wygaśnięciu kodu.

### 3.7. Checklista na weekend 07–08.11

**Sobota (decyzje i fundamenty)**
- [ ] **Marek:** decyzja o kanałach — TikTok tak/nie, Pinterest tak/nie, Shorts tak/nie,
      grupa FB po Świętach (5 minut).
- [ ] **Marek/Cowork:** założyć brakujące konta (TikTok firmowe, Pinterest Business),
      ujednolicić nazwę i awatar, w bio adres „link w bio”.
- [ ] **Code:** strona `/linki/` (link w bio) z aktualnymi postami i UTM.
- [ ] **Code:** konwencja UTM w skillu + zestawienie kliknięć z `utm_source` w `kliki-raport.mjs`.
- [ ] **Code:** linki do profili w stopce i `/o-nas/` + `sameAs` w danych strukturalnych.
- [ ] **Code:** `scripts/social-karuzela.mjs` z czterema szablonami (okazje, recenzja,
      prezentownik, ciekawostka) + pin 1000×1500 — na bazie `generuj.py` z 26.10.
- [ ] **Code:** aktualizacja skilla `klocki-social` (rytm tygodnia, kanały, UTM, role, nowe
      stany rejestru, usunięty „TikTok priorytet #1” albo potwierdzony), spakowanie;
      **Marek wgrywa paczkę na claude.ai**, żeby Cowork miał tę samą wersję.

**Niedziela (paczka tygodnia 1)**
- [ ] **Code:** paczka na 09–15.11: karuzela okazji (dane z porannego Łowcy w poniedziałek —
      w niedzielę tylko szkic), recenzja, kalendarze adwentowe (rolka), prezentownik
      Mikołajki, historia płyt drogowych, 5 pinów; opisy z UTM; wpisy w rejestrze jako
      „przygotowane”.
- [ ] **Marek:** akceptacja paczki jednym „tak”.
- [ ] **Cowork:** zaplanować w Meta Business Suite posty bez cen (recenzja, prezentownik,
      historia); posty z cenami — w dniu publikacji po porównaniu z hubem.
- [ ] **Cowork:** Pinterest — 4 tablice („LEGO na Mikołajki”, „LEGO pod choinkę”, „LEGO dla
      dorosłych”, „Kalendarze adwentowe LEGO”), pierwsze piny.
- [ ] **Code:** skasować jednorazowy trigger 09.11 (posty z 26.10 już zarchiwizowane), jeśli
      to trigger tej sesji; jeśli z panelu — pozycja dla Marka.
- [ ] **Wszyscy:** punkt zero mierników — obserwujący na kanał, kliknięcia z social = 0.

---

## Dodatek: pomiary z dzisiaj (06.11.2026)

- `diagnoza.mjs`: zmienne 14/14; Cloudflare, Search Console, Adtraction, Performers — ok;
  Tradedoubler ok z rozjazdem (Ceneo: TD „ACCEPTED”, rejestr „zakończony” od 03.11);
  **Firecrawl 3 081 kredytów**.
- `kliki-raport.mjs --dni 7`: ludzie 64 (PL 44, NO 5, BR 5, AR 3), **boty 15 317**, test 29.
  W raporcie Kontrolera z 02.11: ludzie 117 (PL 74), boty 2 269.
- `materialy/statystyki`: kliknięcia PL w oknie 7 dni 79 → 74 → 55 → 43 → 48 (01–05.11);
  Google 2 kliknięcia/tydz. przy 94–131 wyświetleniach, średnia pozycja 26 → 20.
- Przyczyny skoku botów i spadku kliknięć ludzkich **nie sprawdzałem** — to pozycja dla Code
  na dziś, nie na poniedziałek.
