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
- **Oferta poniżej 50% potwierdzonej ceny katalogowej wymaga sprawdzenia przez
  człowieka** (Marek, 16.09.2026). Sito `filtrujOferty()` ukrywa ją na stronie;
  rano przychodzi mail z linkami (`podejrzany-rynek-mail.mjs`, klucz `podejrzane`,
  kontakt@); Marek potwierdza w rozmowie z Code („potwierdzam <nr> <cena> <sklep>"),
  Code dopisuje do `deale_potwierdzone.json` i oferta wraca tego samego dnia.

## Archiwum

Wpisy starsze niż 14 dni żyją w plikach miesięcznych. Nic nie zostało
skasowane — jeśli szukasz czegoś starszego, jest tam:

- [`2026-08`](materialy/dziennik-archiwum-2026-08.md) — 27 wpisów

Archiwizuje `node scripts/archiwum-dziennika.mjs`.

<!-- WPISY PONIŻEJ — wszystko nad tą linią zostaje w dzienniku na zawsze -->

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

## 2026-08-31 15:30 · CODE · Zrzut harmonogramu odtworzony + korekty w RUNBOOK

**Zrobione:**
- **`materialy/zadania-cykliczne.md` przepisany na zrzut** ze świeżego odczytu
  `list_triggers` + `list_sessions` (31.08, 15:25). Wymagane przez `NARZEDZIA.md`
  kolumny są: cron, **enabled**, ostatnie odpalenie. Odczyt objął 11 Routines
  na koncie — pełna lista, bez paginacji.
- Dołożona druga tabela: Routines spoza projektu (Angielski, Herzfaden,
  inwestycja). Nie dotyczą serwisu, ale **dzielą ten sam limit konta**, a to on
  wywrócił harmonogram 21.08. Widać z niej, że poniedziałek 07:00-09:30 to pięć
  zadań naraz — pierwsze miejsce do rozsunięcia przy kolejnym uderzeniu w limit.
- **`RUNBOOK.md`**: pięć wystąpień „Łowca 07:00" w mapie plików → 08:30;
  „Backfill 12:00" → wyłączony od 29.08; usługa GSC poprawiona na domenową.
- **`RUNBOOK.md`, sekcja Media Expert**: przepisana. Mówiła, że przebieg o 07:00
  łapie wczorajszy feed — to już nieprawda, bo po to Łowca poszedł na 08:30.
  Dopisane dwie pułapki: zmiana czasu 25.10 cofnie przebieg na 07:30 i problem
  wróci, oraz że nazwa Routine musi iść za cronem.
- **`RUNBOOK.md`, nowa sekcja „Sitemapy i Search Console"**: dwie sitemapy i po
  co obie, pułapka usługi domenowej w GSC, oraz że karta w `karty_setow.json`
  nie gwarantuje podstrony.

**Stan:** gotowe

**Dla drugiej strony:** nic — runnery i infrastruktura należą do Claude Code.

**Uwagi:**
- **Kontroler działa.** Przebieg 31.08 09:11, status `SUCCEEDED`. To zamyka wątek
  z 30.08, gdy ostatni odczyt pochodził z 17.08 i wyglądało to na cichą awarię.
- **Korekta mojej wczorajszej notatki:** `last_fired_at` zwracają WSZYSTKIE
  triggery, także te przypięte do trwałej sesji. Pełny `last_run` ze statusem
  tylko te tworzące świeżą sesję. Wczoraj napisałem, że runnery nie zwracają nic
  i zastępowałem to `updated_at` sesji — niepotrzebnie, dane są dokładniejsze.
- **Trigger Radara 13:00 (`trig_01KbUQcgjek5iQFhbyokoLLi`) zniknął z konta**
  między 30 a 31.08. Był wyłączony od 15.08, więc nic nie przestało działać.
  Nie odtwarzać — drugi przebieg Radara wycofano świadomie 21.08.
- **Zostaje otwarte: 32 karty bez podstrony.** `karty_setow.json` ma 445 wpisów,
  `/zestaw/<nr>/` powstaje dla 413. Brakujące nie są w `katalog.json`, więc
  `huby.js` ich nie generuje mimo cen i linków. Teksty leżą w repo niewidoczne.
  Naprawa opisana w RUNBOOK, sekcja „Sitemapy i Search Console".

## 2026-08-31 08:10 · CODE · Typografia: pauza → półpauza w całym serwisie; H2 kart bez „— opis"

**Zrobione (decyzja Marka):**
- Nagłówek karty zestawu to teraz samo „LEGO <nr> <nazwa>" — sufiks „— opis"
  usunięty z `[nr].astro`.
- Wszystkie pauzy (—) zamienione na półpauzy (–) w treściach serwisu:
  dane zasilające strony (karty_setow, katalog, sety, wycofania, opisy,
  kategorie_artykulow, galerie), wszystkie strony/komponenty/lib/layouty
  i pluginy remark (tabele cen w artykułach). Zbudowany dist: **zero pauz**
  na 4980 stronach.
- `import-karty.py` dostał `typografia()` — przyszłe DOCX-y Piotra (pisane
  pauzą) normalizują się przy imporcie same.
- NIE ruszone: pliki wewnętrzne (rrp_potwierdzone, rejestr afiliacji, stany
  runnerów, ceny_baza) i dokumenty w `redakcja/` (materiały Piotra verbatim).

**Stan:** gotowe, opublikowane na main.

**Dla drugiej strony:** runnery piszące teksty do plików zasilających stronę
(Scout — opisy w sety.json) powinny od teraz używać półpauzy.

## 2026-08-31 07:25 · CODE · Szósta (ostatnia) partia kart P07: brakujące 57 + Archive + Nike + Super Mario

**Zrobione:**
- `karty_setow.json`: **70 nowych kart** z 4 zipów (w tym „brakujące 57"
  domykające luki w ~30 seriach: polybagi 30xxx, GWP-y 40xxx, Architecture
  21065–67, minifigurki, Zelda, Wednesday, Animal Crossing, KPop, Nike,
  Super Mario). Rejestr: 375 → **445**; na żywo 413 stron. Duplikaty
  międzyseryjne znów pominięte (40920 Looney=Seasonal, 40923 Shrek=BrickHeadz).
- `katalog.json`: nowe serie **The Legend of Zelda, Shrek, Looney Tunes,
  Nike x LEGO** + sety dołożone do AC/Bluey/Sonic/Minifigurek; elementy
  z Bricksetu, RRP Piotra po kalibracji mnożnikiem. 71052: elementy 7→8.
- Bramka RRP zablokowała 7 polybagów (my 16,99/29,99 vs Piotr 16,49) —
  rejestr lego.pl rozstrzygnął NA KORZYŚĆ PIOTRA: saszetki 2026 kosztują
  16,49 (71051–71053 potwierdzone), a 30734 ma €3.99. Poprawione 7 wpisów
  katalogu; stara wiedza „polybag = 16,99" (m.in. komentarz w odsiew.js)
  dotyczy poprzednich roczników.
- `scripts/import-karty.py`: nowe warianty placeholderów partii („sprawdź
  aktualne informacje/oferty/dostępność", „zobacz analizę ceny"), RRP też
  z pola „Cena / sposób uzyskania" (wariant szablonu dla polybagów/GWP),
  fallback linku kategorii na `/serie/` dla serii bez strony (GWP „Inne",
  LEGO House, LEGOLAND), filtr plików macOS `._*`, aliasy Creator 3 w 1
  i Nike x LEGO Collection.
- `[nr].astro`: kotwica `#ceny` istnieje też przy braku tabeli cen
  (fallbackowy komunikat) — linki z kart GWP nie prowadzą w nic.

**Stan:** gotowe, wypchnięte. Build 4978 stron zielony; kontrola-rrp: zero
rozbieżności; zero nierozwiązanych placeholderów w dist.

**Dla drugiej strony:** nic.

**Uwagi:** GWP-y i sety LEGO House/LEGOLAND (17 kart „Inne") świadomie BEZ
wpisu w katalogu (RUNBOOK: gratisy odsiewamy) — karty czekają w danych na
ewentualne huby. Nierozstrzygnięte 1:1 (Piotr vs Brickset, bez trzeciego
głosu): dystrybucja 77093 (P: ekskluzyw, BS: Retail) i 40824 (odwrotnie) —
zostały wartości Piotra.

## 2026-08-31 07:20 · CODE · Piąta paczka kart P07: Sonic, One Piece, Gabi, Fortnite, DREAMZzz

**Zrobione:**
- `karty_setow.json`: **24 nowe karty** (Sonic 5, One Piece 7, Koci Domek
  Gabi 3, Fortnite 4, DREAMZzz 5 — rozkład zliczony z rejestru).
  Rejestr: 351 → 375; na żywo 358 stron.
- `katalog.json`: **nowa seria DREAMZzz** (5 setów) + dołożone 77117/77118
  (Sonic) i 11215 (Gabi) — elementy z Bricksetu, RRP Piotra po kontroli
  mnożnikiem drabiny (wszystkie 4,20–4,29 od EUR, zgodne). Dzięki temu
  powstało 8 nowych hubów i `/serie/dreamzzz/` — build 4959 → 4968 stron.
- 75646 (One Piece, okręt Garpa): elementy w katalogu 1738 → **1705**
  (Brickset potwierdza wartość Piotra).
- 11371: domknięty ogon wczorajszej poprawki — `katalog.json` miał jeszcze
  1099,99; `kontrola-rrp --napraw` wyrównało do 1079,99, kontrola ZERO
  rozbieżności.
- `scripts/import-karty.py`: aliasy serii Sonic the Hedgehog→Sonic,
  ONE PIECE→One Piece.

**Stan:** gotowe, wypchnięte. Build 4968 stron zielony.

**Dla drugiej strony:** nic.

**Uwagi:** nazwy DREAMZzz w katalogu pochodzą z metryk Piotra (jedyne
polskie, jakie mamy) — przy zaciągu lego.pl zweryfikować jak zwykle.

## 2026-08-31 07:15 · CODE · Czwarta paczka kart P07: DC/Batman, Bluey, Art, Architecture (+2 zipy duplikatów)

**Zrobione:**
- `karty_setow.json`: **12 nowych kart** (DC/Batman 5, Bluey 3, Art 3,
  Architecture 1; rozkład sprostowany po zliczeniu z rejestru). Rejestr: 339 → 351; 334 strony z kartą na żywo.
  Zip Chinese Festivals to w całości duplikaty (80118–80121 wgrane jako
  Seasonal), z Bluey odpadł duplikat 10469 (DUPLO), z DC — 40859 (BrickHeadz).
- `scripts/import-karty.py`: **mapowanie serii na klucz katalogu** —
  „LEGO DC / Batman" dawało zepsuty slug `/serie/dc-/-batman/`;
  teraz aliasy (DC/Batman→Batman, Chinese Festivals→Seasonal,
  NINJAGO→Ninjago) + walidacja, że seria istnieje w katalog.json
  (inaczej ostrzeżenie o linku w próżnię). Pole `seria` karty i teksty
  linków biorą nazwę kanoniczną repo.
- 6 kart bez huba (76330/76331/76333 DC, 31218/31220 Art, 21064
  Architecture) — czekają na pierwszą ofertę, jak Editions z paczki 2.

**Stan:** gotowe, wypchnięte. Build 4959 stron zielony, linki
/serie/batman/ i /serie/bluey/ sprawdzone w dist.

**Dla drugiej strony:** nic.

## 2026-08-31 07:10 · CODE · Trzecia paczka kart P07: Seasonal-2, Jurassic World, Ideas, Icons, Botanicals

**Zrobione:**
- `karty_setow.json`: **46 nowych kart** przez `scripts/import-karty.py`
  (61 DOCX, z czego 15 to duplikaty Seasonal z paczki pierwszej — skrypt
  je pominął). Rejestr: 293 → 339; 328 stron z kartą na żywo.
- Bramka RRP: blokada 11371 (Icons Shopping Street) — Piotr 1079,99 vs
  nasze 1099,99. Kalibracja drabiną rozstrzygnęła NA KORZYŚĆ PIOTRA:
  wszystkie 5 potwierdzonych setów z RRP 249,99 € (42177, 71814, 71837,
  76454, 76473) ma polską cenę 1079,99. Poprawione `sety.json`
  i `ceny_baza.json` (błąd Scouta); do rejestru potwierdzonego nie wpisuję
  (kalibracja to poszlaka, nie odczyt u źródła) — potwierdzi się przy
  następnym zaciągu lego.pl.
- 21369 The X-Files: Piotr „regularna" vs Brickset LEGO exclusive i nasz
  własny opis — metryka i FAQ o RRP podmienione na wariant ekskluzywny.

**Stan:** gotowe, wypchnięte. Build 4959 stron zielony.

**Dla drugiej strony:** nic.

**Uwagi:** technika kalibracji drabiny (rejestr potwierdzony × RRP EUR
z Bricksetu) rozstrzyga spory o polską cenę bez dostępu do lego.pl —
warta zapamiętania przy kolejnych blokadach RRP.

## 2026-08-31 07:00 · CODE · Druga paczka kart P07: 5 serii, 127 zestawów

**Zrobione:**
- `karty_setow.json`: **127 nowych kart** przez `scripts/import-karty.py`
  (pierwszy bojowy przebieg skryptu): NINJAGO 23, Friends 30, Disney 28,
  Editions 21, Marvel 25. Rejestr: 166 → 293. (Rozkład per seria poprawiony
  po sprawdzeniu — pierwotny wpis i opis commita d10ff5f podawały błędne
  liczby; suma 127 była dobra.) Build 4959 stron zielony.
- Bramka RRP zadziałała: zablokowała 43306 (Piotr 249,99 vs nasze 169,99 —
  rejestr lego.pl + rynek 173–220 zł potwierdzają nasze) i 43307 (Piotr
  299,99 vs katalog 249,99 — drabina 59,99 € = 249,99 zł). Obie karty
  wgrane nakładką z poprawionym RRP w metryce, FAQ i przeliczniku
  za element. 43307 do potwierdzenia przy następnym zaciągu lego.pl.
- `sety.json`: −ekskluzyw 76345 (Brickset: Retail, Piotr: regularna — 2:1).
- 11 setów Disney (43011–43033: piłkarze „momenty", logo FIFA itp.) nie ma
  huba `/zestaw/` — brak ofert i ceny w feedach. Karty siedzą w danych
  i pojawią się same, gdy set dostanie pierwszą ofertę.

**Stan:** gotowe, wypchnięte.

**Dla drugiej strony:** nic.

**Uwagi:** nasza kanoniczna nazwa 43301 „Toy Story **Cienki** — podpórki pod
książki" wygląda na błąd zaciągu (postać w polskim dubbingu to Chudy; Piotr
też pisze Chudy) — do sprawdzenia na LEGO.com jak 40881.

## 2026-08-31 06:50 · CODE · Korekta starych kart + skrypt importu na kolejne paczki

**Zrobione:**
- `karty_setow.json`: 47 odpowiedzi FAQ w kartach City/Technic/Star Wars
  z pierwszej partii domknięte tą samą korektą co P07 („Najbardziej
  naturalnym kierunkiem są większych samochodów…" → „…jest dokupienie…").
  Stare paczki miały tylko ten jeden wadliwy wzorzec; frazy odbiorcy
  i „Obsadę tworzą" doszły dopiero w P07. Build 4959 stron zielony.
- **`scripts/import-karty.py`** — od teraz jedna ścieżka importu paczek
  Piotra: parsowanie DOCX, bramka RRP (rozjazd blokuje), raport rozbieżności
  elementów/premier/dystrybucji, placeholdery→linki, korekty szablonu
  (z logiem każdej), akapity redakcyjne wg progu, zapis w stabilnym
  formacie. Tryb `--sucho` = sam raport. Procedura opisana w RUNBOOK
  („Karty zestawów — import paczek Piotra").
- Test: przebieg na paczce P07 --sucho → 77× „karta już istnieje", zero
  fałszywych blokad; transformacje bajt w bajt zgodne z wgranym P07.

**Stan:** gotowe. Następne zipy: `python3 scripts/import-karty.py <zipy>
--sucho`, przejrzeć raport, rozstrzygnąć rozjazdy Bricksetem, puścić bez
--sucho, build, commit.

**Dla drugiej strony:** nic.

## 2026-08-31 06:40 · CODE · Karty Piotra: 5 serii (77 zestawów) + metryka zestawu na stronie

**Zrobione:**
- `src/data/karty_setow.json`: **77 nowych kart** z DOCX Piotra (paczka P07):
  BrickHeadz 14, DUPLO 19, Harry Potter 17, Seasonal 14, Speed Champions 13.
  Razem w rejestrze 166 kart. Placeholdery `[… – link wewnętrzny]` zamienione
  na `#ceny` i `/serie/<slug>/` jak w poprzednich partiach; sety 501–1200 el.
  dostały +1, a 1201+ el. +2 akapity redakcyjne liczone z naszych danych
  katalogu (pozycja w roczniku serii, cena/element vs mediana, sąsiedzi
  cenowi z linkami do hubów).
- `src/pages/zestaw/[nr].astro` + `global.css`: sekcja **„Metryka zestawu"**
  (tabela klucz→wartość między opisem a FAQ, podkład #eef1f7 odróżnia ją od
  białych tabel cen). Pole `metryka` istniało w danych od pierwszej partii,
  ale nie było renderowane — tabelkę dostało od razu wszystkie 166 kart.
- Weryfikacja danych Piotra przed importem (Brickset przez curl):
  RRP **77/77 zgodne** z naszym rejestrem. Poprawki za zgodą Marka: elementy
  40923 260→259 i 77259 216→215, premiera 10462 1 stycznia→1 czerwca,
  dystrybucja 80120/80121 regularna→ekskluzywna (FAQ o zakupie w RRP
  podmienione na ekskluzywny wariant Piotra) + ~40 mechanicznych domknięć
  szablonu mail-merge (pola w złym przypadku: „kierunkiem są innych modeli").
- `src/data/sety.json`: rozstrzygnięcia Bricksetu po NASZEJ stronie —
  +ekskluzyw 40858/40860/40872/40924/40925, −ekskluzyw 40923, premiery
  40860/40925 2026-08→2026-06, opis 76473 „ponad 2100"→„2164 elementów"
  (kolidował z metryką karty).

**Stan:** gotowe, build 4959 stron zielony, HTML zweryfikowany (metryka
między opisem a FAQ, FAQPage w schema, linki działają).

**Dla drugiej strony:** nic.

**Uwagi:**
- Nazwy 6 setów u Piotra różnią się od kanonicznych (m.in. 40864 „Mistrz
  pomyślności" vs „Mistrz Szczęścia", 77252, 10468, 10479, 77262) — w kartach
  stoi nazwa kanoniczna, tekst akapitów Piotra bez zmian.
- 40881: nasza kanoniczna nazwa „Lama Zaopatrzeniowa i Palucha Rybnego —
  figurki" wygląda na niegramatyczną (Piotr ma „…i Paluch Rybny”) — do
  sprawdzenia na LEGO.com PL przy najbliższym zaciągu.
- Karty City/Technic/SW z pierwszej partii mają te same zgrzyty szablonu
  („kierunkiem są większych samochodów…") — do decyzji, czy przejechać tą
  samą korektą.
- Premiera 77264 nierozstrzygnięta (Piotr: 1 sierpnia, my: 2026-06, Brickset
  nie podaje) — w metryce data Piotra nie weszła, zostało nasze źródło.

## 02.09.2026 — 75457 Executor (punkt 2 z radaru 02.09)

Opublikowane: `/artykuly/lego-75457-executor-przed-premiera/`, dział Premiery.
Karta researchu: `redakcja/karty/75457-executor.md`.

**Oś tekstu jest odwrotna niż zwykle.** Executor to ekskluzyw LEGO.com i sklepów
stacjonarnych LEGO — nie ma drugiej ceny, rabatu ani progu zakupu. Nasza
standardowa rada („sprawdź, gdzie taniej", „poczekaj do listopada") nie ma tu
zastosowania i tekst mówi to wprost, zamiast udawać porównanie. Jedyna zmienna
pod kontrolą kupującego to zdążyć przed wyczerpaniem gratisu 40897 — stąd
praktyczna konsekwencja: **konto Insiders trzeba mieć założone przed 1.10**,
nie w dniu premiery.

**Wartość, której nikt inny nie poda:** 21065 Sagrada Família ma dokładnie tę
samą cenę katalogową 3199,99 zł przy 12 060 elementach (0,27 zł/el.) wobec
6130 u Executora (0,52 zł/el.). Widać to tylko z jednego katalogu z obiema
pozycjami.

**Dane poprawione przy okazji:**
- `sety.json` 75457: `cena_katalogowa` było `null`, a `dla_afol` szacowało
  ~3170 zł z przelicznika euro — wpisana potwierdzona kwota 3199,99 zł.
- `kalendarz-promocji-lego.md`: sekcja październikowa twierdziła, że polskiej
  ceny nie ogłoszono. Poprawione, dołożone okno gratisu i kanał sprzedaży.

**Nierozstrzygnięte i tak zapisane w tekście:** okno GWP — źródła
anglojęzyczne podają 1–10.10, polskie 1–7.10. Nie rozstrzygamy (LEGO różnicuje
okna między rynkami); w tekście krótsza wersja plus zdanie, że decyduje
wyczerpanie zapasów, nie kalendarz.

**Zdjęć 75457 nie mamy** — zestaw jeszcze nie istnieje w feedach. Zamiast
pustego znacznika galerii poszły dwie pozycje faktycznie w tekście
porównywane: 10221 (poprzednik) i 21065 (alternatywa), z podpisem
wyjaśniającym, czyje to zdjęcie.

Tekst wyszedł 18 dni przed planowanym oknem 20–30.09, bo cena potwierdziła się
wcześniej, a czekanie nie dawało nic poza ryzykiem.

**Zostaje z planu:** Wycofania grudnia 2026 (okno 1–20.10) i Black Friday —
rabat kontra pseudopromocja (okno 10–24.11).

---

## 04.09.2026 — punkty 1–3 z radaru: fala października i haczyk Black Friday

**Punkt 1 i 3 (dane).** Zweryfikowałem u źródeł październikową falę premier. Wpisane
tylko to, co potwierdzone niezależnie w co najmniej dwóch miejscach:

| Zestaw | Było | Jest |
|---|---|---|
| 72306 PlayStation | `cena_katalogowa: null` | **689,99 zł** (0,36 zł/el.) |
| 21371 Wallace i Gromit | `null` | **419,99 zł** (0,40 zł/el.) |
| 40874 Świąteczne odliczanie | `null` | **249,99 zł** (0,29 zł/el.) |
| 11387 Zimowa wioska | `elementy: null` | **1354** |

Miła kontrola własnej metody: nasze wcześniejsze szacunki z przelicznika euro
(≈680, ≈420, ≈250 zł) trafiły co do kilku złotych w kwoty, które LEGO faktycznie
ogłosiło. Przelicznik euro jako *szacunek oznaczony jako szacunek* działa.

**Czego NIE wpisałem i dlaczego** — zapisane w `katalog.json` →
`_meta.rozbieznosci_fala_pazdziernik_2026`:
- **40865 Elf Buddy** — liczba elementów sporna: 713 (faniklockow) kontra 719
  (zklockow). Żadnej nie przyjmuję.
- **11379 Księgarnia Book Nook** — cena sprzeczna: „ok. 520 zł" kontra 559,96 zł.
  Ta druga nie kończy się na „,99", więc to niemal na pewno wyliczenie
  porównywarki, a nie cena katalogowa.
- **40875, 40862, 40866, 11388, 11390, 21373** — po jednym źródle, w dodatku
  samo oznaczonym jako plotka. Zostają puste.
- 72306 nie ma wpisu w `katalog.json` (nowa seria „PlayStation") — hub działa
  z `sety.json`. Dodanie serii do katalogu należy do Zwiadowcy, nie do Radaru.

**Punkt 2 (Black Friday).** 21375 Godzilla ma premierę **27 listopada, czyli w sam
Black Friday**, z własnym gratisem — potwierdzone w dwóch źródłach, cena wciąż
nieznana. To zmienia planowany tekst z ogólnego wywodu w konkret: zestaw
debiutujący w dniu BF z definicji nie jest przeceniony, a stoi obok przecen
i korzysta z ich rozpędu.

- okno tekstu przesunięte z `11-10..11-24` na **`11-05..11-20`**, żeby wyszedł
  przed premierą, nie po niej; w planie dopisany hak i przypomnienie, żeby przed
  publikacją sprawdzić cenę katalogową (bez niej nie policzymy rabatu ani jego braku);
- do kotwic sezonu doszła data 27.11 z premierą Godzilli;
- w `kalendarz-promocji-lego.md` — akapit w sekcji listopadowej („Nowość w Black
  Friday nie jest okazją"), nowa sekcja „Październik to nie tylko Executor"
  z tabelą trzech potwierdzonych cen, oraz dwa wiersze w ściądze.

Sekcja październikowa mówiła dotąd wyłącznie o Executorze, choć tego samego dnia
wchodzi cała reszta fali — to była realna dziura na stronie, która już rankuje.

Build czysty, `kontrola-rrp.mjs` → ROZBIEŻNYCH: 0, wszystkie nowe linki żyją.
`/nowosci/pazdziernik-2026/` podchwyciło ceny samo.

## 2026-09-05 · CODE (Radar) · Dla Łowcy: 16 „okazji" konkurencji — co z nich wynika

Konkurencja (faniklockow) wypuściła 4.09 **szesnaście mikropostów dealowych w jednej
dobie**, większość między 12:22 a 15:08. Poprzednie dni: dwa. Przepuściłem tę listę
przez nasz `oferty_feed.json` (stan 05.09) i zamiast jednej hipotezy wyszły trzy
konkrety. **Nie ruszałem danych Łowcy — to jest zgłoszenie, nie zmiana.**

Zestawy: 10316, 76300, 11389, 11375, 42240, 21355, 77256, 77260, 76475, 60423,
60478, 60488, 71848, 42224, 42226, 42229, 43023.

### 1. To nie jest jeden sklep — i to dobra wiadomość

Rozkład najtańszych ofert: **Allegro 11, Smyk 4, Empik 1, Media Expert 1**. Czyli nie
jedna wyprzedaż u jednego sprzedawcy, tylko szeroki ruch przedsezonowy. Nasze tabele
złapały go same — 15 z 17 zestawów ma świeże oferty, rabaty 23–39% względem katalogu.
Pod tym względem nie mamy nic do nadrabiania.

**Warte uwagi: Smyk jest najtańszy przy czterech pozycjach** (11375 Ferrari −30%,
42240 Aston Martin −26%, 42224 Porsche −23%, 42226 BMW −28%) — same duże Technic
i Icons, czyli wysokie koszyki. Smyk mamy w rejestrze jako **aktywny (Adtraction,
2,10% CPS, cookie 45 dni)**. To sugestia, żeby przy doborze sklepów publikacyjnych
dla Technica nie pomijać Smyku odruchowo na rzecz Allegro.

### 2. Jedna z ich „okazji" okazją nie jest

**11389 Projekt Hail Mary** — u nich „Okazja Cenowa". Nasze dane: cena katalogowa
**469,99 zł**, najtańsza oferta **479,99 zł** (Allegro), Empik 543 zł. Czyli
„okazja" jest **droższa od ceny katalogowej LEGO o dwa procent**.

To jest dokładnie ten mechanizm, o którym ma być listopadowy tekst o Black Friday,
tyle że złapany na żywo we wrześniu. Zapisuję to jako materiał do tamtego artykułu.

### 3. Dwa pytania do sprawdzenia po stronie Łowcy

**a) Empik nigdy nie wygrywa pola `cena`.** W całym feedzie `sklep == "empik"`
występuje **zero razy**, a w **386 zestawach Empik ma najniższą ofertę, która nie
trafiła do pola `cena`**. Przykłady: 3677 (empik 2899 vs allegro 3141), 3818
(1899 vs 2299), 3831 (1599 vs 2177).

Nie przesądzam, czy to błąd. `_meta.zasady` opisuje regułę wyboru `cena` przez
pryzmat PK i ME, a Empik dokumentuje osobno jako klucz w `oferty` — więc możliwe,
że wyłączenie jest **celowe** (marketplace, zrzut tygodniowy, wątpliwa dostępność).
Za celowością przemawiają pozycje w rodzaju 1246 (empik 60,50 vs allegro 179,99),
gdzie cena wygląda na ofertę używanego albo niekompletnego zestawu.

**Jeśli celowe — warto to dopisać wprost do `_meta.zasady`**, bo dziś czyta się to
jak przeoczenie. **Jeśli nie — to 386 zestawów, przy których pokazujemy cenę wyższą
niż dostępna**, a to uderza w jedyną rzecz, którą sprzedajemy.

**b) 2644 zestawy mają cenę rynkową, ale nie mają ceny katalogowej** — więc przy
żadnym z nich nie policzymy rabatu. Z dzisiejszej listy dotyczy to **76300 Arkham
Asylum**: konkurencja ogłasza okazję, a my nie umiemy powiedzieć, czy nią jest.
To nie zadanie na dziś, ale przy 2644 pozycjach to systemowa dziura w funkcji,
która jest sednem serwisu.

### Czego NIE trzeba robić

Odświeżania feedu — dane są z 05.09 i złapały ruch. Zrzut Empiku jest z 31.08
(tygodniowy, przez Cowork), więc w normie.

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
