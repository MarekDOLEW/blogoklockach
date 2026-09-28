# Dziennik — archiwum 2026-09

Wpisy przeniesione z `DZIENNIK.md` po przekroczeniu progu wieku.
Treść jest niezmieniona. Bieżące wpisy i ustalenia trwałe: `DZIENNIK.md`.

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
