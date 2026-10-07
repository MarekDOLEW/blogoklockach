# Raport Kontrolera — 05.10.2026 (poniedziałek)

---

## Diagnoza środowiska

```
## Diagnoza środowiska — 2026-10-05 07:20 UTC

**Repo**
- gałąź `kontroler` @ `e5b67f1`, origin/main @ `e5b67f1`
- 0 commitów ponad main, 0 do nadrobienia, 0 plików niezacommitowanych
- node_modules ✓, astro ✓

**Zmienne środowiska**
- ustawione: 14/14
- komplet

**Dane**
- oferty_feed zaktualizowane: 2026-10-05
- rejestr afiliacji zaktualizowany: 2026-09-17
- import Empiku: 2026-09-28 — Łowca: ceny i oferty 2026-09-28
- oferty: allegro 6079, empik 4378, ceneo 1631, planetaklockow 1107, lego 956, mediaexpert 745, smyk 647, lidl 84

**Dostępy** *(realne wywołania, nie deklaracje)*
- cloudflare: **ok** (klikniec_7dni: 9454)
- r2: **ok** (kubelki: tylkoklocki-obrazy)
- tradedoubler: **ok**
- search_console: **ok** (witryny: sc-domain:tylkoklocki.pl)
- adtraction: **ok**
- performers: **ok**
- produkcja: **ok** (status: 200)
- link_sklepu_z_przegladarki: **ok** (status: 302)
- firecrawl: **ok** (kredyty: 3781)
```

Komplet dostępów trzeci tydzień z rzędu. **Jedna rzecz z tej sekcji wymaga uwagi:
import Empiku nosi datę 28.09, czyli ceny Empiku mają tydzień.** Zrzut robi
człowiek przez lokalną przeglądarkę (Empik blokuje ruch serwerowy), a
przypomnienie wychodzi w poniedziałek o 08:15 — dzisiejszego zrzutu po prostu
jeszcze nie ma. Nie jest to awaria, tylko punkt, w którym mechanizm czeka na Marka.

---

## Cztery kamienie milowe na grudzień 2026

| Kamień | Tydzień temu (28.09) | **Dziś (05.10)** | Kierunek |
|---|---|---|---|
| **1. Pierwsza zatwierdzona prowizja w każdej z 3 sieci z API** | 0 z 3 | **0 z 3** | **stoi, trzeci tydzień** |
| **2. EPC per sklep na próbie > 1 transakcji** | 1 sklep (Empik, 3 transakcje / 30 dni) | **1 sklep (Empik, 3 transakcje / 30 dni)** | **bez zmian** |
| **3. Kliknięcia z Polski dziennie** | 8,1 | **4,4** | **w dół — ale patrz zastrzeżenie** |
| **4. Zaindeksowane strony (panel GSC)** | 807 *(dane z 18.09)* | **807** *(ten sam odczyt)* | **brak nowego pomiaru** |

### Kamień 1 — zero zatwierdzonych, i po raz pierwszy zero transakcji

**W oknie 7 dni nie ma ani jednej transakcji w żadnej z trzech sieci.**
Tradedoubler: 0. Adtraction: 0. Performers: 13 kliknięć po ich stronie, 0 konwersji.
To pierwszy taki tydzień od uruchomienia pomiaru — poprzednie trzy miały po
2–4 transakcje.

Okno 30 dni pokazuje **6 transakcji i 9,25 EUR** — dokładnie ten sam zbiór co
tydzień temu (Empik 3 / 7,23 EUR, Ceneo 2 / 0,16 EUR, Lidl 1 / 1,86 EUR). Czyli
w minionym tygodniu nic nie doszło, a kwoty drgnęły tylko o groszowe korekty
kursowe. **Pole `zatwierdzone` = 0 we wszystkich sześciu pozycjach**, najstarsza
z drugiej połowy sierpnia.

### Kamień 2 — utrzymany, ale bez przyrostu

Empik nadal jest jedynym sklepem z próbą większą niż jedna transakcja: 3 transakcje
i 325,44 EUR obrotu w oknie 30 dni, stawka efektywna 2,22%. **W minionym tygodniu
nie doszła żadna nowa transakcja, więc kamień stoi tam, gdzie go zostawiliśmy.**

### Kamień 3 — sprostowanie do mojego własnego raportu z 28.09

Surowa liczba: **31 kliknięć z Polski w 7 dni, czyli 4,4 dziennie**, wobec
8,1 tydzień temu. Zgłaszam to jako spadek, bo tak mówi metryka. Ale sam pomiar
zeszłotygodniowy był zawyżony i warto to powiedzieć wprost, zanim ktoś wyciągnie
z tego wniosek o awarii:

| Dzień | PL kliknięć |
|---|---:|
| 21.09 | 2 |
| 22.09 | 7 |
| 23.09 | 8 |
| 24.09 | 2 |
| 25.09 | 7 |
| 26.09 | 3 |
| **27.09** | **28** |
| 28.09 | 10 |
| 29.09 | 4 |
| 30.09 | 3 |
| 01.10 | 2 |
| 02.10 | 1 |
| 03.10 | 5 |
| 04.10 | 6 |

**Z zeszłotygodniowego okna wystaje jeden dzień — 27.09 z 28 kliknięciami, przy
2–10 we wszystkie pozostałe.** Po jego odjęciu poprzedni tydzień daje
**4,8 kliknięcia dziennie**, a nie 8,1. Wobec 4,8 dzisiejsze 4,4 to różnica
w granicach szumu, nie czterdziestoprocentowy spadek.

Napisałem 28.09, że pik z 27.09 „wygląda organicznie" — i nadal tak wygląda
(15 refererów, 9 godzin doby, 9 sklepów). Czego wtedy nie zrobiłem, a trzeba
było: nie sprawdziłem, jak bardzo ten jeden dzień przesuwa średnią, którą
raportuję jako kamień milowy. **Przy 31 kliknięciach na tydzień jeden dobry dzień
zmienia metrykę dwukrotnie.** Wniosek operacyjny jest w decyzji 2.

### Kamień 4 — brak nowego odczytu

Nadal 807 (odczyt z 22.09, dane Google z 18.09). Próba z 30.09 nie dała nowej
liczby: Cowork ustalił, że **sam raport „Strony" w panelu jest nieaktualny —
pokazywał dane z 21.09**. Od ostatniego użytecznego odczytu minęło 13 dni.
**Marku — przy najbliższym wejściu do panelu GSC poproszę o liczbę
zaindeksowanych stron z raportu „Strony"; bez niej ten kamień stoi w miejscu
niezależnie od tego, co robi serwis.**

---

## Harmonogram

**Data odczytu z konta: 05.10, 07:46 CEST — dzisiejsza.** Odczyt objął
**16 Routines**. Alarmu o nieprzepisanym harmonogramie nie ma.

**Włączonych: 11 w sekcji LEGO + 5 Routines spoza serwisu. Wyłączonych: zero** —
„Backfill cen katalogowych", który od początku pomiaru wisiał wyłączony i nigdy
nie odpalony, został skasowany z konta. **Kolizje: brak.**

**Trzy porządki z 30.09 widać w zrzucie i wszystkie trzy działają:**

1. **Wszystkie crony runnerów LEGO są teraz w zapisie `CRON_TZ=Europe/Warsaw`** —
   generator przyjmuje je bez ostrzeżenia. Tydzień temu zgłaszałem, że „Empik co
   tydzien" ma cron w składni, której harmonogram nie rozumie; ten Routine został
   skasowany, a format naprawiony u wszystkich. Zmiana czasu 25.10 niczego nie przesunie.
2. **Dublet przypomnień o Empiku zniknął** — zostało jedno wspólne
   „Przypomnienie: zrzut Empiku i x-komu" (pon 08:15, utworzone 30.09), obsługujące
   oba sklepy jednym skillem. To była moja uwaga z 28.09.
3. **Doszedł drugi przebieg „Zdjęcia → R2" o 09:45**, po Łowcy — pierwszy jest
   o 04:45. Nowe galerie nie czekają już do rana.

### Które włączone zadanie nie odpaliło się w minionym tygodniu

| Runner | Ostatnie odpalenie | Commity w tygodniu | Werdykt |
|---|---|---|---|
| Łowca promocji | 04.10 08:44 | 29, 30.09, 1, 2, 3, 4, **5.10** | komplet 7/7 |
| Radar konkurencji | 04.10 08:09 | 29, 30.09, 1, 2, 3, 4, **5.10** | komplet 7/7 |
| Scout nowości | 05.10 05:04 | 30.09, 1, 2, 3, **4.10** | OK |
| Wycofania | 05.10 06:11 | **5.10** (`bcf9ce4`) | OK (tygodniowy) |
| Harmonogram z konta | 05.10 07:45 | **5.10** (`8f6f290`) | OK |
| **Dane wt 05:30** | **29.09 05:34** | **29.09** (`0c2d3fc`) | **zdał pierwszy egzamin** |
| Przypomnienie: zrzut Empiku i x-komu | — (utworzone 30.09) | — (mail, nie commit) | nierozstrzygnięte |

**„Dane wt 05:30" przebiegł 29.09 i tym razem zapisał dane sam.** To jest ten
pierwszy prawdziwy sprawdzian, o którym pisałem dwa razy. Commit `0c2d3fc`
(katalog, feedy, oferty) nosi w tytule „sesja Code za runnera", co wygląda na
kolejną awarię — **ale sesja w stopce commitu to
`session_011Ced7USAHUBBsCPZ1os3F9`, czyli stała sesja samego runnera „Dane wt",
założona 22.09.** Tytuł jest skopiowany z poprzedniego tygodnia i wprowadza
w błąd; runner wykonał zadanie we własnej sesji, cztery minuty po slocie.
Warto poprawić to zdanie w prompcie, żeby za miesiąc nikt nie czytał tego jako
awarii.

**Przypomnienia o zrzutach nie da się rozstrzygnąć z tych danych** — wychodzi
mailem o 08:15 PL (06:15 UTC), a zrzut harmonogramu powstaje o 07:45 PL, przed
tym slotem. Nie zostawia też commitu, bo jego produktem jest mail do Marka.

---

## Archiwum dziennika

`node scripts/archiwum-dziennika.mjs` przeniósł **43 wpisy** do
`materialy/dziennik-archiwum-2026-09.md`; `DZIENNIK.md` skurczył się z 2 499 do
1 297 linii (−1 202). Zostaje 60 wpisów. Jeden starszy niż 14 dni zatrzymany
celowo ze stanem „w toku" (`2026-09-04 · Kolejka redakcyjna w XLSX`).

**Ten przebieg ujawnił lukę w mechanizmie i opisuję ją w decyzji 3:** wśród
43 przeniesionych wpisów były **cztery pozycje „RADAR · Do zrobienia" bez linii
zamknięcia**, w tym dwie adresowane do runnera Wycofań. Skrypt wstrzymuje wpisy
oznaczone „w toku", ale nie wstrzymuje otwartych zadań — więc kolejka, na którą
runner miał spojrzeć, wyjechała z jego pola widzenia.

---

## Zadania bez właściciela

**Siedem pozycji: dwie dla Marka, dwie dla Piotra, trzy po stronie Code.** Cztery
z nich (pozycje 4–7) leżą od 16–18.09 i od dzisiejszego przebiegu **nie są już
w `DZIENNIK.md`, a w archiwum wrześniowym** — wypisuję je mimo tego, bo zadanie
nie przestaje istnieć przez to, że plik je przeniósł.

**1. Recenzja LEGO 72306 PlayStation** *(Marek — decyzja, potem Piotr — tekst;
04.10, 1 dzień)* Fanklockow wypuścił wideorecenzję świeżej premiery za 689,99 zł,
która właśnie weszła w okno prezentowe. Mamy hub `/zestaw/72306/` z notkami i
wzmianki w trzech tekstach, recenzji nie ma. Tekst wymaga dostępu do zestawu,
więc najpierw decyzja, czy go kupujemy. Kontekst cenowy: 03.10 Ceneo pokazało
619,99 zł, pierwszą ofertę pod cennikiem.

**2. Liczba sklepów z żywą ofertą na `/wycofania/`** *(Code; 26.09, 9 dni)*
Nasz odpowiednik kolumny „Dystrybucja" konkurencji, tylko żywy — dane są
w `oferty_feed.json`, strona ten plik już wczytuje.

**3. Kalendarz wydarzeń osobno od promocji** *(Marek — decyzja; 18.09, 17 dni)*
Decyzja, czy rozdzielamy kalendarz na promocje (cena) i wydarzenia (termin,
miejsce). Sprawdzone: osobnej strony wydarzeń w buildzie nie ma.

**4. Siatka „Największe zestawy LEGO <seria>"** *(Marek — decyzja; 17.09, 18 dni)*
Decyzja, czy budujemy siatkę generowaną z katalogu. Przypominam uczciwie:
22.09 Piotr opublikował trzy rankingi ręczne, które pokrywają część pomysłu;
otwarte zostaje pytanie o generowaną siatkę per seria.

**5. Tekst o wycofaniu 75192 Sokół Millennium UCS** *(Piotr; 16.09, 19 dni)*
Sprawdzone dziś: karty zestawu są, **artykułu nadal nie ma**.

**6. Pięć zestawów ze złym statusem wycofania** *(runner Wycofań; 16.09, 19 dni)*
Sprawdzone dziś w `src/data/wycofania.json`: 21333, 21351, 21353, 21356 i 76437
**nadal mają `przewidywane`**. **Runner Wycofań przebiegł od zgłoszenia trzy razy
— 21.09, 28.09 i 05.10.**

**7. Szesnaście wpisów Scouta do weryfikacji i dziesięć do domknięcia**
*(runner Wycofań; 16.09, 19 dni)* Bez odpowiedzi.

### Co się w tej sekcji poprawiło i dlaczego pozycje 6–7 to inny problem

**Runner Wycofań odpowiedział w tym tygodniu na sygnał Scouta** — pozycja o 76477
z 01.10 dostała linię `→ Wycofania 2026-10-05: odrzucone (na razie)` z powodem
(u źródła 76477 występuje tylko w jednej sekcji artykułu). Mechanizm zamknięć
działa, i to szybko: sygnał z 1.10 domknięty 5.10. Domknięto też BLDP (29.09)
i rozstrzygnięto wątek cen Media Expertu.

Sprawdziłem, dlaczego pozycje 6–7 go ominęły, i **moja diagnoza z 28.09 była
niepełna.** Prompt runnera Wycofań **ma** krok o kolejce — punkt 2a każe zacząć
od `DZIENNIK.md` i pod każdym przetworzonym wpisem Scouta dopisać linię
„→ Wycofania". Tylko że ten punkt mówi wyłącznie o wpisach **SCOUT**, a pozycja
o pięciu zestawach to wpis **RADAR**. Runner nie pomija kolejki z lenistwa —
czyta tę jej część, którą prompt mu wskazał. Propozycja z zeszłego tygodnia
(„dopisać krok zerowy") była więc w połowie trafna: brakujący fragment to
rozszerzenie punktu 2a na wpisy RADAR adresowane do runnera, a nie nowy krok.

---

## Ruch botów i wiarygodność pomiaru

| Rodzaj | Kliknięć | Udział |
|---|---:|---:|
| bot | **9 423** | 99,6% |
| human | 34 | 0,4% |
| nieoznaczone (sprzed 14.09) | 0 | 0% |

Ruch botów spadł z 14 259 na 9 423 — pierwszy spadek od wdrożenia filtra, choć
udział procentowy jest ten sam. Żadne z tych wejść nie poszło do sieci
afiliacyjnych.

**Ruchu audytowego nie ma ani jednego kliknięcia, drugi tydzień z rzędu.**
Wśród 27 polskich refererów nie ma żadnego adresu nieistniejącej strony, ruch
spoza Polski to 2 kliknięcia z USA i 1 z Litwy, rozkład dzienny nie ma
sztucznego piku. Wszystkie **31 polskich kliknięć to ruch czytelników.**

**Udział „brak-linku": 0 na 34 kliknięcia (0,0%)** — trzeci tydzień z rzędu.

### Skąd przychodzą czytelnicy

**12 z 31 polskich kliknięć (39%) ma referer z ChatGPT** — tydzień temu 18%,
dwa tygodnie temu 33%. W tym samym oknie Google dał serwisowi 4 kliknięcia.
Asystent AI jest trzykrotnie większym źródłem ruchu zakupowego niż wyszukiwarka.

Najmocniejszy pojedynczy referer tygodnia: **`/prezentowniki/lego-technic/`
z `utm_source=chatgpt.com` — 4 kliknięcia.** Prezentownik serii, do którego
ChatGPT odsyła ludzi, okazał się skuteczniejszy od każdego artykułu.

| Typ strony wyjścia | Kliknięć | Udział |
|---|---:|---:|
| huby `/zestaw/<nr>/` | 23 | 74% |
| strona główna, `/promocje-lego/`, prezentowniki | 8 | 26% |
| artykuły `/artykuly/` | **0** | **0%** |

**Zero kliknięć z artykułów** wobec 8 tydzień temu. Tydzień temu te 8 pochodziło
w większości z jednej świeżej recenzji (60508, 6 kliknięć w pierwszej dobie).
W tym tygodniu nowych recenzji było dwie (31163 Psotny kot, x-kom WSR) i żadna
nie dała kliknięcia. Przy tej skali to nie dowodzi niczego o recenzjach jako
formacie — dowodzi tylko, że pojedynczy tekst potrafi zrobić cały tygodniowy
wynik działu albo nic.

---

## EPC per sklep

Kliknięcia z Polski 28.09–05.10, prowizje z API za okno 7 dni (od 28.09).
Sklepy bez API mają EPC **modelowe** — zgodnie z decyzją Marka z 22.09 nie
czytamy ich paneli ręcznie.

| Sklep | Kliknięcia PL | Prowizja 7 dni | EPC | Podstawa |
|---|---:|---:|---:|---|
| **Media Expert** | **14** | 0,00 zł | **0,00 zł** | Performers: 13 klików u nich, 0 konwersji |
| Allegro | 9 | — | **model** | brak API — tak zostaje |
| Empik | 6 | 0,00 EUR | **0,00 EUR** | Tradedoubler: 0 transakcji w oknie |
| Smyk | 1 | 0,00 zł | 0,00 zł | Adtraction: 0 transakcji |
| x-kom | 1 | — | **model** | SalesMasters, brak API |
| LEGO.com | 0 PL | 0,00 | **0,00 z definicji** | brak programu (Rakuten odmówił 15.09) |
| Ceneo | 0 | 0,00 EUR | — | brak kliknięć PL w oknie |
| Lidl | 0 | 0,00 EUR | — | brak kliknięć PL w oknie |
| Planeta Klocków | 0 | — | **model** | webePartners, brak API — tak zostaje |

**Cała tabela mierzonych sklepów ma w tym tygodniu EPC zero**, bo nie było ani
jednej transakcji. Jedyna liczba, która coś mówi, to okno 30-dniowe Empiku:
7,23 EUR przy stawce 2,22%.

**Media Expert trzeci tydzień jest największym strumieniem ruchu bez efektu.**
14 z 31 polskich kliknięć (45% — najwięcej w serwisie), a po stronie Performers
**186 kliknięć w 30 dni i zero konwersji.** Tydzień temu było 250 i zero;
w raporcie z 28.09 postawiłem to jako decyzję dla Marka i w dzienniku nie ma
śladu odpowiedzi od sieci.

Jedna rzecz, którą w tym tygodniu ustalił Radar i która zmienia obraz: **do 02.10
nasze ceny Media Expertu były systematycznie zawyżone** — `feedy-lego.py` czytał
`<g:price>` zamiast `<g:sale_price>`, więc 143 zestawy pokazywały cenę regularną
w trakcie promocji (mediana błędu 8,4%, maksimum 39,9%). Błąd zawsze w tę samą
stronę: feed pokazywał więcej, niż się w sklepie płaci. **To mogło zniechęcać do
kliknięcia, ale nie tłumaczy zera konwersji** — kto kliknął, trafiał na cenę
niższą od obiecanej, a to pomaga sprzedaży, nie szkodzi. Sprawdziłem też, czy
kliknięcia w Media Expert odbiły po poprawce: 03.10 — 3, 04.10 — 0, przy 2 i 0
w dniach przed. Nie odbiły, ale próba jest za mała, żeby cokolwiek z tego wyczytać.

---

## Widoczność w Google

| Okres | Kliknięcia | Wyświetlenia | CTR | Pozycja |
|---|---:|---:|---:|---:|
| 7 dni (26.09–03.10) | **4** | **57** | **7,02%** | 18,4 |
| 14 dni (19.09–03.10) | 6 | 137 | 4,38% | 21,8 |
| Poprzednie 7 dni (19–26.09), z różnicy | 2 | 80 | — | — |

**Kliknięcia wzrosły z 2 na 4, pozycja poprawiła się z 24,2 na 18,4, a CTR
wyszedł na 7,0% — najwyższy w historii pomiaru.** Jednocześnie wyświetlenia
spadły z 80 na 57.

Porównanie okien 14-dniowych pokazuje, jak głęboki jest spadek ekspozycji:
tydzień temu 14 dni dawało **375 wyświetleń**, dziś **137**. To skutek zniknięcia
jednej frazy o dużym wolumenie — „lego 11387" sama dawała ponad 100 wyświetleń.

### Sprostowanie do mojego raportu z 28.09

Napisałem wtedy, że „liczba fraz spadła ze 100 do 30, liczba podstron z 95 do 38
— zwęziła się cała widoczność". **Wymiar fraz nie nadaje się do takiego wniosku:**
Google anonimizuje rzadkie zapytania, więc liczba zwracanych fraz zależy od
progu prywatności, nie tylko od naszej widoczności. Dziś fraz jest **7**, a
podstron z wyświetleniami **81** — gdyby ten pierwszy wymiar mierzył widoczność,
trzeba by ogłosić katastrofę w tygodniu, w którym liczba widocznych podstron
wzrosła dwukrotnie. Od tego raportu podaję liczbę podstron, a frazy traktuję
jako przykłady, nie jako miarę.

Rzetelny obraz jest taki: **podstron z wyświetleniami 38 → 81 (szerzej),
wyświetleń na 14 dni 375 → 137 (rzadziej), kliknięć 2 → 4, CTR 2,5% → 7,0%.**
Serwis pokazuje się pod większą liczbą adresów, znacznie rzadziej, ale skuteczniej.

### TOP podstrony (7 dni)

| Adres | Kliki | Wyświetlenia | Pozycja |
|---|---:|---:|---:|
| `/` | **3** | 5 | **2,0** |
| `/artykuly/lego-bam-pazdziernik-2026/` | **1** | 1 | 5,0 |
| `/wycofania/` | 0 | **17** | 9,5 |
| `/artykuly/najdrozsze-zestawy-lego/` | 0 | 6 | 21,2 |
| `/artykuly/ranking-kalendarze-adwentowe-lego-2026/` | 0 | 3 | 9,0 |
| `/kalendarz-promocji-lego/` | 0 | 3 | 39,7 |
| `/zestaw/60181/` | 0 | 3 | 41,7 |
| `/serie/icons/` | 0 | 2 | **2,0** |

**Strona główna weszła na pozycję 2,0 i zebrała 3 z 4 kliknięć serwisu** —
wdrożenie v2 z 29.09 nie zaszkodziło jej w wyszukiwarce. `/serie/icons/` też
stoi na pozycji 2,0.

**`/wycofania/` czwarty tydzień z rzędu jest największym źródłem wyświetleń
(17, pozycja 9,5) i czwarty tydzień ma zero kliknięć.** Powtarzam to, bo przy
takiej pozycji zero kliknięć to kwestia tytułu i opisu w wynikach, nie rankingu —
a od 30.09 wszystkie indeksowane strony mają skrócone tytuły (≤60) i opisy
(≤160), więc jeśli po tej zmianie CTR nadal jest zerowy, to nie długość była
problemem.

---

## Indeksacja

### Liczby z builda

| Miara | 22.09 | 28.09 | **05.10** | Zmiana t/t |
|---|---:|---:|---:|---:|
| Huby `/zestaw/` w buildzie | 9 501 | 9 502 | **9 789** | **+287** |
| Huby w `sitemap-zestawy.xml` | 1 163 | 1 196 | **1 286** | **+90** |
| Udział zgłoszonych | 12,2% | 12,6% | **13,1%** | +0,5 pkt |

Drugi tydzień z rzędu zgłoszenia rosną — i rosną dzięki konkretnej zmianie:
`3dbaaef` z 02.10 wpuścił do indeksu huby z własnym opisem dłuższym niż
300 znaków. Katalog urósł jednak jeszcze szybciej (+287), więc udział zgłoszonych
poprawił się tylko o pół punktu.

### Inspekcja adresów przez API Search Console

**10 z 10 adresów ma werdykt PASS — pierwszy raz, gdy wszystkie sprawdzane
adresy są w indeksie.**

| Adres | Werdykt | coverageState | Ostatni crawl | Wiek crawla |
|---|---|---|---|---:|
| `/` | PASS | Submitted and indexed | 03.10 | 2 dni |
| `/zestaw/11387/` | PASS | Submitted and indexed | 02.10 | 3 dni |
| `/artykuly/lego-31163-psotny-kot-recenzja/` | PASS | Submitted and indexed | 30.09 | 5 dni |
| `/promocje-lego/` | PASS | Submitted and indexed | 29.09 | 6 dni |
| `/ekskluzywne/` | PASS | Submitted and indexed | 22.09 | 13 dni |
| `/artykuly/` | PASS | Submitted and indexed | 15.09 | **20 dni** |
| `/serie/` | PASS | Submitted and indexed | 15.09 | **20 dni** |
| `/wycofania/` | PASS | Submitted and indexed | 15.09 | **20 dni** |
| `/prezentowniki/lego-technic/` | PASS | Submitted and indexed | 15.09 | **20 dni** |
| `/zestaw/10280/` | PASS | Submitted and indexed | 11.09 | **24 dni** |

**Recenzja 31163, opublikowana 29.09, była w indeksie 30.09 — następnego dnia.**
`/promocje-lego/`, czyli nowy dział z wdrożenia v2, zaindeksowany 29.09, tego
samego dnia. To duża zmiana wobec września, gdy nowe teksty przez tydzień
zostawały „unknown to Google".

**Pięć adresów ma crawl starszy niż 14 dni i trzeba to wypisać wprost:**
`/artykuly/`, `/serie/`, `/wycofania/` i `/prezentowniki/lego-technic/` stoją
na 15.09 (20 dni), a hub `/zestaw/10280/` na 11.09 (24 dni). Wzór jest czytelny:
**Googlebot chodzi po tym, co nowe — strona główna, nowy dział, świeży tekst —
a huby działów, które się nie zmieniają, odwiedza coraz rzadziej.** W tygodniu,
w którym katalog urósł o 287 hubów, to jest przewidywalny skutek, nie usterka.
Ale `/wycofania/` to jednocześnie nasze największe źródło wyświetleń, więc crawl
raz na trzy tygodnie oznacza, że zmiany tytułu i opisu z 30.09 Google jeszcze
tam nie zobaczył — i to częściowo tłumaczy zerowy CTR z poprzedniej sekcji.

`sitemap-priorytet.xml` nie ma ani w repo, ani w GSC — temat zamknięty 22.09.

---

## Kontrola linków sklepowych

Wykonana przez Łowcę dziś o 08:30, plik `materialy/kontrola-linkow-2026-10-05.md`.
Próba 150 linków z `redirects.json` — **18 119 w całości, o 252 więcej niż
tydzień temu**. Martwych: **0**.

| Sklep | w próbie | żywe | martwe (404/410) | blokada sklepu | nierozstrzygnięte |
|---|---:|---:|---:|---:|---:|
| ceneo | 54 | 54 | 0 | 0 | 0 |
| planetaklockow | 50 | 50 | 0 | 0 | 0 |
| smyk | 23 | 23 | 0 | 0 | 0 |
| allegro | 5 | 0 | 0 | 0 | 5 |
| lego | 5 | 0 | 0 | 5 | 0 |
| empik | 5 | 0 | 0 | 5 | 0 |
| mediaexpert | 5 | 0 | 0 | 5 | 0 |
| xkom | 3 | 0 | 0 | 3 | 0 |

**O 23 linkach ze 150 (15%) nie wolno powiedzieć „OK".** Osiemnaście stoi
w kolumnie „blokada sklepu" — x-kom, LEGO.com, Empik i Media Expert odrzucają
ruch serwerowy, więc o nich nie twierdzimy nic; pięć linków Allegro jest
nierozstrzygniętych. **x-kom wszedł do próby pierwszy raz i od razu w całości
jako nie sprawdzony.** Planeta Klocków, która tydzień temu miała 3 pozycje
nierozstrzygnięte, dziś ma 50 na 50 żywych.

Te cztery blokujące sklepy odpowiadają za **21 z 31 polskich kliknięć (68%)**.

**Zadanie dla `empik-redirects.mjs --usun-martwe`: brak** — żadnego linku Empiku
nie dało się sprawdzić, a zrzutu Empiku z tego tygodnia jeszcze nie ma.

---

## Trzy decyzje na ten tydzień

### 1. Dopytać Performers o Media Expert — druga próba *(Marek)*

To ten sam wniosek co 28.09 i stawiam go ponownie, bo liczby się pogorszyły,
a odpowiedzi w dzienniku nie ma. **Media Expert to 45% naszego ruchu zakupowego
(14 z 31 kliknięć) i 186 kliknięć po stronie Performers w 30 dni przy zerze
konwersji.** W całym mierzonym tygodniu nie było ani jednej transakcji w żadnej
z trzech sieci — pierwszy taki tydzień.

Doszedł jeden fakt, który zawęża pytanie: do 02.10 nasze ceny Media Expertu
były zawyżone (feed podawał cenę regularną zamiast promocyjnej), co mogło
zmniejszać liczbę kliknięć, ale **nie mogło wyzerować konwersji** — kto kliknął,
trafiał na cenę niższą, nie wyższą. Zostają więc dwie techniczne hipotezy do
rozstrzygnięcia po stronie sieci: cookie nie jest ustawiane, albo kliknięcia
trafiają pod złym identyfikatorem kampanii. Jedno pytanie do menedżera programu
je rozdziela; z naszej strony nie da się tego zrobić.

### 2. Mierzyć kamień 3 w oknie 28-dniowym, nie tygodniowym *(Marek)*

Dziś ten kamień pokazał spadek z 8,1 na 4,4 kliknięcia dziennie, a po odjęciu
jednego nietypowego dnia z poprzedniego okna prawda brzmi „4,8 → 4,4", czyli
bez zmian. **Przy 31 kliknięciach na tydzień jeden dzień przesuwa metrykę
dwukrotnie — i w zeszłym tygodniu tak właśnie się stało, przeze mnie
nieskorygowane.**

Propozycja: kamień 3 raportujemy jako **średnią dzienną z 28 dni**, z tygodniową
liczbą podaną obok jako kontekst. Okno 28-dniowe przy dzisiejszym ruchu zbiera
ok. 150 kliknięć, więc jeden dobry dzień rusza je o kilka procent, nie o sto.
Pozostałe trzy kamienie zostają bez zmian — one nie mają tego problemu, bo liczą
zdarzenia narastająco, nie średnią.

To jest zmiana sposobu liczenia jednego wskaźnika, nie zmiana celu, więc nie
dotyka decyzji z 22.09 o przeniesieniu kwoty na 2027.

### 3. Archiwum dziennika nie może wypychać otwartych zadań *(Code — poprawka skryptu)*

Dzisiejszy przebieg `archiwum-dziennika.mjs` przeniósł 43 wpisy, **w tym cztery
pozycje „RADAR · Do zrobienia" bez linii zamknięcia** — dwie z nich adresowane
do runnera Wycofań i otwarte od 19 dni. Skrypt ma już mechanizm wstrzymywania
(zatrzymał wpis ze stanem „w toku"), ale reguła jest zawężona do tego jednego
sformułowania.

Skutek jest konkretny i widać go w tym raporcie: prompt runnera Wycofań każe mu
zacząć od `DZIENNIK.md`, a zadania, których ma tam szukać, od dziś w tym pliku
nie ma. Kontroler je widzi tylko dlatego, że zajrzałem do archiwum poza
procedurą — sama procedura mówi „z archiwum tego miesiąca", a te wpisy wylądowały
w archiwum wrześniowym.

Propozycja: **rozszerzyć wstrzymanie na wpisy, których nagłówek zaczyna się od
`RADAR ·` albo `SCOUT ·` i pod którymi nie ma linii `→ zamknięte` / `→ Wycofania`,
niezależnie od wieku.** Dwie linijki w skrypcie, a bez nich każda kolejna
archiwizacja będzie cicho gubić kolejkę. Przy okazji warto rozszerzyć punkt 2a
promptu runnera Wycofań na wpisy RADAR adresowane do niego — dziś mówi tylko
o wpisach Scouta, i to jest prawdziwa przyczyna, dla której pięć zestawów ze
złym statusem przeżyło trzy przebiegi runnera.

---

## Czego w tym raporcie nie ma

- **Świeżej liczby zaindeksowanych stron** — ostatni użyteczny odczyt z 22.09
  (dane Google z 18.09); próba z 30.09 trafiła na nieaktualny raport „Strony"
  w panelu. Kamień 4 stoi do następnego odczytu.
- **Zrzutu cen Empiku i x-komu z tego tygodnia** — przypomnienie wychodzi
  w poniedziałek o 08:15, zrzut robi człowiek w lokalnej przeglądarce. Ceny
  Empiku w serwisie są z 28.09.
- **Rozstrzygnięcia, czy przypomnienie o zrzutach odpaliło** — nie zostawia
  commitu, a zrzut harmonogramu powstaje przed jego slotem.
