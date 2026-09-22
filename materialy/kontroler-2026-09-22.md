# Raport Kontrolera — 22.09.2026 (wtorek)

> **PRZEBIEG PRÓBNY.** To nie jest cotygodniowy raport z harmonogramu. Sesja Code
> odpaliła Kontrolera jednorazowo, żeby sprawdzić, czy stała sesja z dopiętym repo
> potrafi wykonać komplet — po tym, jak 21.09 Routine ze świeżą sesją wykonał cały
> raport i nie mógł go zapisać (brak repo w źródłach sesji).
>
> **Ostrzeżenie do wszystkich liczb tygodniowych:** poprzedni raport powstał
> 21.09, czyli **wczoraj**. Okno 7 dni przesunęło się o jedną dobę, więc
> porównania „tydzień do tygodnia" w tym dokumencie dotyczą okien, które
> pokrywają się w ok. 86%. Traktuj je jako kontrolę spójności pomiaru, nie jako
> nowy tydzień. Prawdziwe porównanie będzie w poniedziałek 28.09.

---

## Diagnoza środowiska

```
## Diagnoza środowiska — 2026-09-22 06:40 UTC

**Repo**
- gałąź `kontroler` @ `c9e4e43`, origin/main @ `c9e4e43`
- 0 commitów ponad main, 0 do nadrobienia, 0 plików niezacommitowanych
- node_modules ✓, astro ✓

**Zmienne środowiska**
- ustawione: 14/14
- komplet

**Dane**
- oferty_feed zaktualizowane: 2026-09-21
- rejestr afiliacji zaktualizowany: 2026-09-17
- import Empiku: 2026-09-21 — Empik 21.09: 4370 cen, 4775 deeplinkow, filtr obcych marek, trzeci przebieg w skillu
- oferty: allegro 5112, empik 4370, ceneo 1552, planetaklockow 1149, lego 951, mediaexpert 749, smyk 662, lidl 61

**Dostępy** *(realne wywołania, nie deklaracje)*
- cloudflare: **ok** (klikniec_7dni: 3838)
- r2: **ok** (kubelki: tylkoklocki-obrazy)
- tradedoubler: **ok**
- search_console: **ok** (witryny: sc-domain:tylkoklocki.pl)
- adtraction: **ok**
- performers: **ok**
- produkcja: **ok** (status: 200)
- link_sklepu_z_przegladarki: **ok** (status: 302)
- firecrawl: **ok** (kredyty: 107)
```

**To jest pierwszy przebieg Kontrolera od 14.09, w którym wszystkie dziewięć
dostępów odpowiedziało.** 21.09 zawiodło repo i konektor; dziś komplet. Stała
sesja z dopiętym repo rozwiązała problem, o który chodziło.

---

## Harmonogram

**Data odczytu z konta: 22.09, 08:18 CEST — dzisiejsza.** Sekcję przepisała sesja
Code przed tym przebiegiem, zgodnie z nowym podziałem pracy. Odczyt objął
14 Routines bez paginacji. Alarmu o nieprzepisanym harmonogramie nie ma.

**Włączonych zadań: 10 z 11 w sekcji LEGO** (wyłączony jest tylko „Backfill cen
katalogowych", nigdy nieodpalony) **plus 3 zadania spoza serwisu** na tym samym
koncie i tym samym limicie użycia.

**Kolizje: brak** — żadne dwa włączone zadania nie startują w tej samej minucie.

### Które włączone zadanie nie odpaliło się w minionym tygodniu

Trzy pozycje nie mają `last_run`, bo triggery odtworzono 22.09 (delete+create
zeruje tę kolumnę). Sprawdziłem je po commitach, jak każe procedura:

| Zadanie | `last_run` | Commity w tygodniu | Werdykt |
|---|---|---|---|
| Scout nowości | — (odtworzony 22.09) | `f37fc2d` 22.09, `3228965` 21.09, `fee8edd` 18.09 | **pracuje** — brak `last_run` to artefakt odtworzenia |
| Harmonogram z konta | — (utworzony 22.09) | sekcja Zrzut przepisana dziś 08:18 | **pracuje** — pierwszy przebieg z harmonogramu dopiero pon. 28.09 |
| Dane wt 05:30 | — (odtworzony 22.09) | `639166e` 22.09 — **„sesja Code za runnera"** | **nie wykonał się sam** |

**Jedyny prawdziwy alarm to „Dane wt 05:30".** Dziś jest wtorek, zadanie miało
pójść o 05:30 PL. Wpis w dzienniku z 05:40 mówi wprost: przebiegł i nic nie
zapisał, sekwencję wykonała sesja Code. Dopiero o 06:00 przestawiono go na stałą
sesję z repo (`session_011Ced7USAHUBBsCPZ1os3F9`), więc **poprawka nie była
jeszcze testowana w boju — pierwszy sprawdzian wypada 29.09**. To ten sam błąd,
który 21.09 zdjął Kontrolera: Routine w świeżej sesji nie ma repo.

Pozostałe włączone zadania odpaliły się z sukcesem: Radar (22.09 08:01),
Wycofania (21.09 06:10), Zdjęcia → R2 (22.09 04:31), Łowca (21.09 08:34),
Alerty cen (21.09 09:38), Przypomnienie o Empiku (21.09 08:16), Kontroler
(21.09 09:05).

---

## Archiwum dziennika

`node scripts/archiwum-dziennika.mjs` przeszedł bez błędu i **nic nie przeniósł**:
próg 2026-09-08, wpisów w dzienniku 62, do archiwum 0. Jeden wpis starszy niż
14 dni został zatrzymany celowo — `2026-09-04 06:50 · CODE · Kolejka redakcyjna
w XLSX` ma stan „w toku". Plik bez zmian, nic do commitu z tej strony.

---

## Zadania bez właściciela

Pięć pozycji z `DZIENNIK.md` bez linii zamknięcia. Archiwum wrześniowe nie
zawiera żadnych pozycji RADAR ani SCOUT, więc lista jest kompletna. **To jest
lista dla Marka i Piotra — Kontroler jej nie wykonuje.**

**1. Kontrola własna · 22.09 — `kontrola-rrp.mjs` nie widzi pustych cen**
*Fakt:* skrypt porównuje ze źródłem tylko wpisy, które już mają cenę (linia 60:
`if (s.cena_katalogowa)`), więc `null` nigdy nie był zgłaszany jako rozbieżność.
Tak przeleżały 112 zestawów z ceną potwierdzoną w `rrp_potwierdzone.json`.
*Mamy?* Tak — ceny uzupełnione w przebiegu 22.09 (4661 → 4773 wpisów z ceną).
**Sprawdziłem: warunek z linii 60 i 65 nadal stoi w kodzie, luka jest otwarta.**
*Zrobić:* osobny licznik „puste ceny, a źródło je zna" w `scripts/kontrola-rrp.mjs`.
*Kto:* Code (dane, strona). *Wpis z 22.09, zostawił Radar.*

**2. fanklockow.pl · 17.09 — drugi kalendarz, osobno wydarzenia**
*Fakt:* konkurencja rozdzieliła kalendarz promocji od kalendarza wydarzeń
klockowych 2026 (otwarcia salonów, eventy, ścianki BaM).
*Mamy?* Nie — u nas jeden kalendarz, w którym wydarzenia stacjonarne mieszają
się z promocjami cenowymi albo ich nie ma.
*Zrobić:* decyzja, czy rozdzielamy kalendarz na promocje (cena) i wydarzenia
(termin, miejsce).
*Kto:* **Marek (decyzja)**. *Wpis z 18.09, zostawił Radar — leży 4 dni.*

**3. zklockow.pl · 17.09 — siatka stron kolekcyjnych**
*Fakt:* mają trwałą siatkę „największe zestawy LEGO", „największe Technic",
kolekcje per seria. Nie są datowane, więc to przewaga stała, nie świeża publikacja.
*Mamy?* Nie — `/serie/<seria>/` z wyszukiwarką jest, stron „największe /
najdroższe zestawy serii" nie ma.
*Zrobić:* decyzja, czy budujemy siatkę „Największe zestawy LEGO <seria>"
generowaną z katalogu (liczba elementów znana przy 9211 z 9359 pozycji, 98%).
*Kto:* **Marek (decyzja)**. *Wpis z 17.09, zostawił Radar — leży 5 dni.*

**4. Radar · 15.09 — 75192 Sokół Millennium UCS bez tekstu**
*Fakt:* LEGO potwierdziło wycofanie, a najbardziej rozpoznawalny zestaw w tej
fali nie ma u nas ani karty, ani opisu.
*Mamy?* Częściowo — hub `/zestaw/75192/` istnieje. **Sprawdziłem: w
`src/pages/artykuly/` nadal nie ma żadnego pliku o 75192.** W tym tygodniu hub
dał 2 kliknięcia afiliacyjne z Polski bez jednego zdania treści.
*Zrobić:* tekst „LEGO 75192 Sokół Millennium schodzi z produkcji — kupować teraz
czy odpuścić".
*Kto:* **Piotr (tekst)**. *Wpis z 16.09, zostawił Radar — leży 6 dni.*

**5. Radar · 15.09 — pięć zestawów ma zły status wycofania**
*Fakt:* 21333, 21351, 21353, 21356 i 76437 mają u nas „przewidywane", a serwisy
podają je jako potwierdzone przez LEGO.
*Mamy?* **Sprawdziłem `src/data/wycofania.json` dziś: wszystkie pięć nadal ma
`status: "przewidywane"`.** Runner Wycofań przebiegł w międzyczasie (21.09,
`ab0a518`) i tej pozycji nie ruszył.
*Zrobić:* zmiana statusów w `src/data/wycofania.json` po sprawdzeniu działu
„Ostatnie Sztuki" na lego.com/pl-pl.
*Kto:* Code (runner Wycofań). *Wpis z 16.09 — leży 6 dni mimo przebiegu runnera.*

**Pozycja domknięta od ostatniego raportu:** sygnał Scouta z 17.09 o liście
„Ostatnia szansa" (ponad 300 pozycji w StoneWars) został zamknięty linią
„→ Wycofania 2026-09-21" — wyciągnięto 246 numerów, 88 dopisano jako
potwierdzone/grudzień 2026. Pomijam go zgodnie z regułą zamknięć.

---

## Ruch botów i wiarygodność pomiaru

Zanim policzę cokolwiek z EPC — ile z tego ruchu to ludzie.

| Rodzaj | Kliknięć | Udział |
|---|---:|---:|
| bot (brak referera z naszej domeny) | 3 746 | 97,5% |
| human (referer wskazujący realną stronę serwisu) | 95 | 2,5% |
| nieoznaczone (sprzed 14.09) | 0 | 0% |

Okno „nieoznaczonych" wypadło już z siedmiu dni — od dziś każde kliknięcie
w pomiarze ma etykietę. Filtr działa: 3 746 wejść botów nie poszło do sieci
afiliacyjnych.

**Udział botów urósł z 94,2% do 97,5%** przy prawie tym samym oknie. Bezwzględnie:
2 820 → 3 746 wejść botów. To nie jest problem prowizji (nie są przekazywane),
ale jest to obciążenie workera rosnące szybciej niż ruch ludzi.

### Ile z „human" to nasz własny audyt

**42 z 95 kliknięć oznaczonych jako „human" pochodzi ze Stanów Zjednoczonych
i jest naszym własnym ruchem testowym.** Dowody, każdy osobno wystarczający:

- **17 kliknięć ma referer `https://tylkoklocki.pl/zestaw/x/`** — strona o tym
  adresie nie istnieje i nigdy nie istniała. To ta sama sygnatura, co 16.09.
- **13 kliknięć ma referer pusty**, a wszystkie z US.
- Reszta amerykańskiego ruchu (76354, 76355) skupia się w dniach **15.09 (22 kliki)
  i 16.09 (18 klików)** — dwa dni audytu, po których zostaje ogon 1–2 dziennie.
- Wszystkie 5 kliknięć w Planetę Klocków w tym tygodniu to ruch z US. W ruchu
  polskim Planeta nie ma ani jednego.

**Odejmuję całe US.** Realny ruch czytelników: **52 kliknięcia z Polski
w siedem dni, około 7,4 dziennie** (plus 1 kliknięcie spoza PL i US).

Przypominam ustalenie, które nadal nie jest wykonane: **żaden audyt nie ma prawa
chodzić przez `/idz/`.** Wpis z 21.09 zgłaszał to jako decyzję do podjęcia przez
Marka; ruch z `/zestaw/x/` w tym oknie pokazuje, że zakaz nie został wdrożony.

**Udział „brak-linku": 0 na 95 kliknięć (0,0%).** Tydzień temu było 1 na 131.
Worker miał dokąd wysłać każde kliknięcie — jedyna liczba w tej sekcji bez
zastrzeżeń.

### Skąd przychodzi ruch, który kupuje

**17 z 52 polskich kliknięć (33%) ma w refererze `utm_source=chatgpt.com`.**
W tym samym oknie Google dał serwisowi 9 kliknięć. **Asystent AI jest nadal
większym źródłem ruchu zakupowego niż wyszukiwarka**, i udział ten wzrósł
z 29% do 33%.

Rozkład polskiego ruchu po typie strony wyjścia:

| Typ strony | Kliknięć | Udział |
|---|---:|---:|
| huby `/zestaw/<nr>/` | 41 | 79% |
| artykuły `/artykuly/` | 7 | 13% |
| strona główna i pozostałe | 4 | 8% |

---

## Wynik tygodnia vs plan 20 000 zł na grudzień

**Prowizja zmierzona, okno 7 dni (od 15.09): 2,89 EUR i 0,00 zł.** Cztery
transakcje, wszystkie w Tradedoublerze — Empik 0,86 EUR (obrót 69,07 EUR, stawka
1,25%), Lidl 1,87 EUR (obrót 46,79 EUR, 4,00%), Ceneo 0,16 EUR z dwóch transakcji.
Adtraction: zero transakcji. Performers: 5 kliknięć po ich stronie, zero konwersji.
**Żadna transakcja nie jest zatwierdzona** — pole `zatwierdzone` = 0 wszędzie,
więc to prowizja zgłoszona, nie należna.

W oknie 30 dni: **4,30 EUR z 5 transakcji**, 0,00 zł w sieciach złotówkowych.
Tradedoubler raportuje w euro, Adtraction i Performers w złotych — nie sumuję
tego jedną liczbą.

Względem raportu z 21.09 doszła jedna transakcja Empiku (0,86 EUR) — atrybucja
dopisała się po fakcie do okna, które wtedy pokazywało 2,03 EUR. To normalne
zachowanie sieci i warto o nim pamiętać przy czytaniu świeżych liczb.

| Krok | 21.09 | **22.09** |
|---|---:|---:|
| Prowizja zmierzona, 7 dni | 2,03 EUR | **2,89 EUR** |
| Kliknięcia z Polski, 7 dni | 62 | **52** |
| **EPC mieszane, zmierzone** | 0,033 EUR/klik | **0,056 EUR/klik** |
| To samo przy 4,25 zł/EUR *(założenie, nie pomiar)* | 0,14 zł/klik | **0,24 zł/klik** |
| Kliknięć potrzebnych na 20 000 zł | ok. 144 000 | **ok. 84 700** |
| Dziennie w grudniu | ok. 4 640 | **ok. 2 730** |
| Dziennie dziś | ok. 9 | **ok. 7,4** |
| **Mnożnik** | ok. 515× | **ok. 369×** |

**Mnożnik spadł z 515× na 369× i to nie jest dobra wiadomość — to jest szum.**
Poprawa bierze się z jednej transakcji Empiku dopisanej do tego samego okna,
przy jednoczesnym spadku kliknięć z 62 na 52. Przy czterech transakcjach
w tygodniu jedna dołożona pozycja rusza EPC o 70%. Rząd wielkości się nie zmienił.

**Ocena kontrolerska bez zmian, trzeci tydzień z rzędu: 20 000 zł w grudniu 2026
nie jest planem, tylko życzeniem.** `materialy/strategia-tresci.md` mówi to samo —
nazywa sezon XI–XII 2026 „próbą generalną", a moment prawdy wyznacza na przełom
2027. Rekomendacja bez zmian: utrzymać 20 000 zł jako cel roku 2027, a grudzień
2026 rozliczać z czterech rzeczy mierzalnych — liczby zaindeksowanych podstron,
kliknięć z Polski dziennie, EPC per sklep i pierwszej **zatwierdzonej** prowizji
w każdej sieci.

---

## EPC per sklep

Liczone na kliknięciach z Polski (15–22.09) i prowizjach z API sieci za to samo
okno. Tam, gdzie sieć nie ma API, EPC jest **modelem** i jest to napisane wprost.

| Sklep | Kliknięcia PL | Prowizja 7 dni | EPC | Podstawa |
|---|---:|---:|---:|---|
| Allegro | 16 | — | **model** | brak API, panel przez przeglądarkę |
| Empik | 8 | 0,86 EUR | **0,108 EUR** | Tradedoubler, 1 transakcja |
| LEGO.com | 7 | 0,00 | **0,00 z definicji** | brak programu (Rakuten odmówił 15.09) |
| Media Expert | 7 | 0,00 zł | 0,00 zł | Performers: 5 klików, 0 konwersji |
| Smyk | 6 | 0,00 zł | 0,00 zł | Adtraction: 0 transakcji |
| Ceneo | 5 | 0,16 EUR | 0,032 EUR | Tradedoubler, 2 transakcje |
| Lidl | 3 | 1,87 EUR | **0,62 EUR** | Tradedoubler — 1 transakcja, statystycznie nic |
| Planeta Klocków | 0 | — | **brak ruchu PL** | 5 klików w tygodniu, wszystkie z audytu US |

Trzy rzeczy z tej tabeli.

**Empik pierwszy raz pokazał EPC powyżej zera na polskim ruchu** — 0,108 EUR na
klik. To wciąż jedna transakcja, ale Empik ma 4 370 cen w serwisie i 8 kliknięć
tygodniowo, więc jest to sklep, w którym próba urośnie najszybciej. Stawka
efektywna 1,25% jest niższa niż 2,74% z okna 30-dniowego — warto sprawdzić za
miesiąc, która jest prawdziwa.

**Lidl nadal wygląda najlepiej i nadal jest to złudzenie.** 0,62 EUR na klik przy
trzech kliknięciach i jednej transakcji. Ta sama liczba co tydzień temu, bo to
ta sama transakcja. Wracamy do niego, gdy będzie ich pięć.

**Dwie największe ekspozycje dalej nie mają pomiaru.** Allegro to 16 z 52
polskich kliknięć — **31% całego ruchu zakupowego serwisu jest niemierzalne**,
a EPC mieszane z poprzedniej sekcji jest z tego powodu zaniżone o nieznaną
wielkość. Planeta Klocków (1 149 ofert) w tym tygodniu nie dostała ani jednego
polskiego kliknięcia, co samo w sobie jest sygnałem — sklep z drugą największą
ekspozycją w serwisie nie generuje ruchu.

---

## Widoczność w Google

| Okres | Kliknięcia | Wyświetlenia | CTR | Średnia pozycja |
|---|---:|---:|---:|---:|
| 7 dni (13–20.09) | **9** | **275** | 3,27% | 17,7 |
| 14 dni (06–20.09) | 10 | 381 | 2,62% | 20,4 |
| **Poprzednie 7 dni (06–13.09), z różnicy** | **1** | **106** | — | — |

**Trend tydzień do tygodnia jest wyraźnie dodatni: 1 → 9 kliknięć, 106 → 275
wyświetleń, średnia pozycja z 20,4 na 17,7.** To pierwszy tydzień, w którym
serwis ma w Google więcej niż pojedyncze kliknięcia.

Względem punktów odniesienia: 15.09 było 8 kliknięć / 263 wyświetlenia w **30
dni**; dziś jest 9 / 275 w **7 dni**. To czterokrotne przyspieszenie tempa.
Wobec odczytu z 21.09 (8 kliknięć / 295 wyświetleń w 7 dni) kliknięcia +1,
wyświetlenia −20 — w granicach szumu przy tej skali.

### TOP frazy (7 dni)

| Fraza | Kliki | Wyświetlenia | Pozycja |
|---|---:|---:|---:|
| lego 11387 | **7** | 93 | 4,3 |
| lego batmobil | 0 | 6 | 34,5 |
| santiago bernabéu lego | 0 | 6 | 46,8 |
| „ahsoka" „star wars" | 0 | 5 | 7,4 |
| „strażników galaktyki" | 0 | 5 | 9,2 |
| „ahsoki" | 0 | 4 | 3,3 |
| „boba fett" | 0 | 4 | 8,5 |
| lego upominki | 0 | 4 | 31 |

**Siedem z dziewięciu kliknięć w całym serwisie pochodzi z jednej frazy: „lego
11387".** To zestaw z karty Piotra opublikowanej 17.09 (`950dcd9`). Cały ruch
z Google stoi na jednym zestawie, który dostał porządny tekst — to jest
najmocniejszy argument za kolejnymi kartami, jaki pojawił się w pomiarach.

Frazy w cudzysłowach (ahsoka, boba fett, strażnicy galaktyki) to zapytania
z operatorem — prawdopodobnie czyjś research, nie ruch zakupowy. Mają dobre
pozycje (3,3–9,2) i zero kliknięć.

### TOP podstrony (7 dni)

| Adres | Kliki | Wyświetlenia | Pozycja |
|---|---:|---:|---:|
| `/zestaw/11387/` | **7** | 100 | 4,3 |
| `/` | 2 | 5 | 2,4 |
| `/wycofania/` | 0 | **49** | 6,5 |
| `/nowosci/` | 0 | 14 | 29,9 |
| `/kalendarz-promocji-lego/` | 0 | 9 | 4,2 |
| `/zestaw/10299/` | 0 | 9 | 47,8 |
| `/zestaw/76332/` | 0 | 7 | 35 |
| `/zapowiedzi-lego-2027/` | 0 | 6 | 5,3 |
| `/artykuly/` | 0 | 5 | 50,2 |

**`/wycofania/` to drugie źródło wyświetleń w serwisie (49) na pozycji 6,5
i ma zero kliknięć.** Przy takiej pozycji zerowy CTR oznacza, że tytuł albo opis
w wynikach nie mówi, co użytkownik dostanie. To najtańsza poprawka SEO
w tym raporcie — jedna zmiana meta na stronie, która już rankuje.

---

## Indeksacja

### Liczby z builda

| Miara | 15.09 | 21.09 | **22.09** | Zmiana t/t |
|---|---:|---:|---:|---:|
| Huby `/zestaw/` w buildzie | 9 363 | — | **9 501** | **+138** |
| Huby w `sitemap-zestawy.xml` | ok. 775 | 1 164 | **1 163** | **−1** |
| Udział zgłoszonych | 8,3% | — | **12,2%** | +3,9 pkt |

Build przeszedł czysto: 9 648 stron w 30 s. **Przyrost hubów (+138) jest szybszy
niż przyrost zgłoszeń do indeksu (−1).** Sitemapa cofnęła się o jeden adres —
to mieści się w wahaniu progu indeksowalności (hub traci ofertę i wypada
z sitemapy), ale kierunek jest zły: katalog rośnie, zgłoszenia stoją.

### Inspekcja adresów przez API Search Console

| Adres | Werdykt | coverageState | Ostatni crawl |
|---|---|---|---|
| `/` | PASS | Submitted and indexed | **25.08.2026** |
| `/artykuly/` | PASS | Submitted and indexed | 15.09.2026 |
| `/serie/` | PASS | Submitted and indexed | 15.09.2026 |
| `/wycofania/` | PASS | Submitted and indexed | 15.09.2026 |
| `/zestaw/10280/` | PASS | Submitted and indexed | 11.09.2026 |
| `/artykuly/najdrozsze-zestawy-lego/` | **NEUTRAL** | **URL is unknown to Google** | — |
| `/ekskluzywne/` | **NEUTRAL** | Discovered – currently not indexed | — |
| `/zestaw/76354/` | **NEUTRAL** | Discovered – currently not indexed | — |

**Trzy adresy wymagają uwagi, a jeden z nich jest gorszy niż tydzień temu.**

**Strona główna nie była odwiedzona przez Googlebota od 25 sierpnia — 28 dni**
(tydzień temu 27). Licznik rośnie, nic się nie zmieniło. Przy serwisie, który
w tym czasie dodał kilkanaście tekstów i blisko 400 hubów, to jest sygnał
niskiego budżetu indeksowania, nie przypadek.

**`/artykuly/najdrozsze-zestawy-lego/` jest Google'owi nieznany.** Tekst wszedł
20.09 (`044ed8c`), jest w `sitemap-artykuly.xml` z `lastmod` 2026-09-22 —
**sprawdziłem, sitemapa nie jest tu winna**. Sam fakt zgłoszenia niczego nie
załatwia, skoro Googlebot nie przychodzi.

**`/zestaw/76354/` jest „wykryty, obecnie niezaindeksowany"** — a to jest hub
z **największą liczbą kliknięć afiliacyjnych w tym tygodniu** (10 kliknięć,
Allegro). Zarabia bez udziału Google. To ta sama kategoria, w której 4.09 siedziało
3 291 adresów.

**`/ekskluzywne/`** — bez zmian od tygodnia, wykryty i niezaindeksowany.

### Jedna rzecz, której nie raportuję

Nie podaję pola „zindeksowane" z endpointu sitemaps — od 2022 pokazuje 0 i jest
bezwartościowe. Ostatni realny odczyt z panelu GSC („Strony") pochodzi z 15.09
(dane z 4.09): **307 zindeksowanych, 3 360 nie, w tym 3 291 „wykryta – obecnie
niezindeksowana"**. Od tego odczytu minęło 7 dni, więc zgodnie z procedurą jeszcze
nie proszę Marka o nowy — poproszę w raporcie 29.09, jeśli nic nie wpłynie wcześniej.

---

## Kontrola linków sklepowych

Kontrolę uruchamia Łowca w poniedziałek o 08:30. **Najświeższy plik pochodzi
z 21.09** (`materialy/kontrola-linkow-2026-09-21.md`) — zgodnie z instrukcją
przebiegu próbnego biorę go i nie twierdzę, że kontrola się nie wykonała.

Próba 150 linków z `redirects.json` (16 018 w całości). **Martwych: 0.**

| Sklep | w próbie | żywe | martwe (404/410) | blokada sklepu | nierozstrzygnięte |
|---|---:|---:|---:|---:|---:|
| ceneo | 66 | 66 | 0 | 0 | 0 |
| planetaklockow | 47 | 47 | 0 | 0 | 0 |
| smyk | 16 | 16 | 0 | 0 | 0 |
| lidl | 1 | 1 | 0 | 0 | 0 |
| allegro | 5 | 0 | 0 | 0 | 5 |
| empik | 5 | 0 | 0 | 5 | 0 |
| mediaexpert | 5 | 0 | 0 | 5 | 0 |
| lego | 5 | 0 | 0 | 5 | 0 |

**O czterech sklepach nie wolno powiedzieć „OK".** Empik, Media Expert i LEGO.com
(15 linków) odrzucają ruch serwerowy — **nie sprawdzone**. Allegro: 5 linków
**nierozstrzygniętych**. Razem **20 z 150 linków w próbie (13%) nie ma werdyktu**,
i są to akurat sklepy odpowiadające za 31 z 52 polskich kliknięć.

**Zadanie dla `empik-redirects.mjs --usun-martwe`: brak** — żaden martwy link
Empiku nie został wykryty, bo żadnego linku Empiku nie dało się sprawdzić.

---

## Trzy decyzje na ten tydzień

### 1. Zamienić cel „20 000 zł w grudniu" na cztery mierzalne kamienie milowe *(Marek)*

Pytanie leży od 14.09 — **dziewiąty dzień, trzeci raport z rzędu.** Dziś jest
poparte pomiarem, nie modelem: zmierzone EPC 0,056 EUR na klik i 7,4 kliknięcia
dziennie dają mnożnik **369×** do grudnia. Nawet przy optymistycznym EPC 0,75 zł,
które rok temu podawał Tradedoubler dla Empiku, grudzień wymagałby ok. 26 700
kliknięć, czyli 860 dziennie — **116× więcej niż dziś**.

Propozycja bez zmian: 20 000 zł zostaje celem roku 2027 (zgodnie ze
`strategia-tresci.md`), a grudzień 2026 rozliczamy z czterech liczb, które
wszystkie są w tym raporcie i wszystkie da się śledzić co tydzień — pierwsza
**zatwierdzona** prowizja w każdej z trzech sieci z API; EPC per sklep na próbie
większej niż jedna transakcja; kliknięcia z Polski dziennie; liczba
zaindeksowanych podstron z panelu.

Dopóki odpowiedzi nie ma, Kontroler co tydzień liczy mnożnik do celu, o którym
z góry wiadomo, że nie zostanie trafiony. To nie steruje decyzjami, tylko je
zaciemnia.

### 2. Odblokować budżet indeksowania: zdjąć `sitemap-priorytet.xml` i poprosić o crawl ręcznie *(Marek — decyzja, Code — wykonanie)*

Strona główna bez wizyty Googlebota od 28 dni, a tekst z 20.09 „nieznany
Google'owi" mimo poprawnego zgłoszenia — to nie jest problem sitemapy, tylko
budżetu indeksowania. Mamy jedną rzecz, która ten budżet marnuje i leży bez
decyzji od 15.09: **`sitemap-priorytet.xml` z 1 224 adresami stoi poza
`sitemap-index.xml` i duplikuje sitemapy sekcyjne.** To pozycja 10 z audytu
mechanizmu — „zdjąć z GSC i z repo", waga B, czeka na Marka siódmy dzień.
Tydzień temu miał 827 adresów, dziś 1 224 — duplikat rośnie.

Do tego jedna rzecz od Marka, której sesja nie zrobi: **ręczne „Poproś
o zindeksowanie" w panelu GSC dla strony głównej i dwóch adresów z tego raportu**
(`/artykuly/najdrozsze-zestawy-lego/` i `/zestaw/76354/` — hub z największą
liczbą kliknięć w serwisie). Trzy kliknięcia w panelu, po których zobaczymy,
czy Google w ogóle reaguje na sygnał ręczny.

### 3. Dopisać pomiar Allegro i Planety Klocków — raz w miesiącu, ręcznie *(Marek)*

**31% polskiego ruchu zakupowego (16 z 52 kliknięć) idzie do Allegro i nie ma
pomiaru.** Planeta Klocków ma 1 149 ofert i w tym tygodniu zero polskich
kliknięć — nie wiadomo, czy to problem ekspozycji, czy cen, bo nie ma z czym
porównać. Obie sieci nie mają API w rejestrze; panel otwiera się tylko
w przeglądarce, czyli po stronie człowieka.

Propozycja: raz w miesiącu ktoś wchodzi do panelu webePartners i Allegro,
odczytuje kliknięcia i prowizję za miniony miesiąc i wkleja dwie liczby do
dziennika. Bez tego „EPC mieszane" w każdym kolejnym raporcie jest zaniżone
o nieznaną wielkość, a decyzja „którym sklepom dawać pierwsze miejsce w tabeli
ofert" zapada na jednej trzeciej danych.

---

## Czego w tym raporcie nie ma

- **Świeżej kontroli linków** — najnowsza jest z 21.09; kolejna w poniedziałek
  28.09 z przebiegu Łowcy.
- **Odczytu liczby zaindeksowanych stron z panelu GSC** — ostatni z 15.09 (dane
  z 4.09), API tej liczby nie podaje. Poproszę Marka 29.09, gdy minie dwa tygodnie.
- **Porównania „tydzień do tygodnia" z prawdziwego tygodnia** — patrz ostrzeżenie
  na górze; okna 21.09 i 22.09 pokrywają się w 86%.
