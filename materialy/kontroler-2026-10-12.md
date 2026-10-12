# Raport Kontrolera — 12.10.2026 (poniedziałek)

> **Jedna rzecz wymaga reakcji przed następnym raportem i nie jest to żaden
> z czterech kamieni milowych: filtr botów został przełamany.** W nocy 10–11.10
> przez `/idz/` przeszło **689 sztucznych kliknięć oznaczonych jako „human"**
> i poszły one dalej do sieci afiliacyjnych — 426 do Allegro. Szczegóły i
> propozycja łatki są w sekcji „Ruch botów" i w decyzji 1. Nie ruszam
> `src/worker.js` sam, bo CLAUDE.md wymaga tu pytania przed pushem.

---

## Diagnoza środowiska

```
## Diagnoza środowiska — 2026-10-12 07:20 UTC

**Repo**
- gałąź `kontroler` @ `15501f4`, origin/main @ `15501f4`
- 0 commitów ponad main, 0 do nadrobienia, 0 plików niezacommitowanych
- node_modules ✓, astro ✓

**Zmienne środowiska**
- ustawione: 14/14
- komplet

**Dane**
- oferty_feed zaktualizowane: 2026-10-12
- rejestr afiliacji zaktualizowany: 2026-09-17
- import Empiku: 2026-10-06 — Łowca: ceny i oferty 2026-10-06
- oferty: allegro 6103, empik 4390, ceneo 1673, planetaklockow 1101, lego 966, xkom 734, mediaexpert 728, smyk 636, lidl 86

**Dostępy** *(realne wywołania, nie deklaracje)*
- cloudflare: **ok** (klikniec_7dni: 16925)
- r2: **ok** (kubelki: tylkoklocki-obrazy)
- tradedoubler: **ok**
- search_console: **ok** (witryny: sc-domain:tylkoklocki.pl)
- adtraction: **ok**
- performers: **ok**
- produkcja: **ok** (status: 200)
- link_sklepu_z_przegladarki: **ok** (status: 302)
- firecrawl: **ok** (kredyty: 3054)
```

Komplet dostępów czwarty tydzień z rzędu. **x-kom wszedł do danych na poważnie —
734 oferty**, wobec zera w diagnozie z 05.10; to skutek zrzutu z 06.10. Ceny
Empiku są z 06.10, dzisiejszego zrzutu jeszcze nie ma (robi go człowiek
w lokalnej przeglądarce po przypomnieniu o 08:15).

---

## Cztery kamienie milowe na grudzień 2026

| Kamień | Tydzień temu (05.10) | **Dziś (12.10)** | Kierunek |
|---|---|---|---|
| **1. Pierwsza zatwierdzona prowizja w każdej z 3 sieci z API** | 0 z 3 | **1 z 3 — Tradedoubler** | **RUSZYŁ** |
| **2. EPC per sklep na próbie > 1 transakcji** | 1 sklep (Empik) | **1 sklep (Empik)** | bez zmian |
| **3. Kliknięcia z Polski dziennie** | 4,4 | **5,0** | **w górę** |
| **4. Zaindeksowane strony (panel GSC)** | 807 *(dane z 18.09)* | **807** *(ten sam odczyt)* | **brak pomiaru, 20 dni** |

### Kamień 1 — pierwsza zatwierdzona prowizja w historii serwisu

**Lidl Sklep Online: `zatwierdzone: 1`, prowizja 1,86 EUR, obrót 46,52 EUR,
stawka 4,00%.** To ta sama transakcja, którą od trzech tygodni raportowałem jako
„zgłoszona, nie należna" — **sklep ją potwierdził.** Pierwszy raz od uruchomienia
pomiaru pole `zatwierdzone` nie jest zerem.

Kwota jest symboliczna i nie o kwotę tu chodzi: **ten kamień sprawdzał, czy
łańcuch od kliknięcia przez sieć do zatwierdzenia w ogóle działa od końca do
końca. Dla Tradedoublera działa.** Zostają dwie sieci: Adtraction (0 transakcji
od początku) i Performers (159 kliknięć w 30 dni, 0 konwersji).

Reszta Tradedoublera bez zmian: Empik 3 transakcje / 7,23 EUR i Ceneo 2 / 0,16 EUR,
wszystkie nadal `zatwierdzone: 0`.

### Kamień 2 — bez zmian, drugi tydzień bez transakcji

Empik nadal jedyny sklep z próbą większą niż jedna transakcja (3 transakcje,
325,44 EUR obrotu, 30 dni). **W oknie 7 dni znowu zero transakcji w każdej
z trzech sieci** — drugi taki tydzień z rzędu.

### Kamień 3 — 5,0 kliknięcia dziennie, i trzy okna zamiast jednego

| Okno | Kliknięć z Polski | Średnio dziennie |
|---|---:|---:|
| 7 dni | 35 | **5,0** |
| 14 dni | 66 | 4,7 |
| 28 dni | 185 | 6,6 |

Zgłaszam 5,0 jako wartość kamienia (okno tygodniowe, jak dotąd), ale podaję
wszystkie trzy, bo o to szła decyzja 2 z 05.10 i różnica jest widoczna: okno
28-dniowe daje 6,6 i nie skacze. Tygodniowe już trzeci raz pokazuje inny obraz
niż miesięczne.

Niezależne potwierdzenie z innego źródła: **raport „Skutek CRO po 14 dniach"
(09.10) policzył to samo z drugiej strony** i doszedł do „poziom płaski, ok. 6
kliknięć dziennie przed i po wdrożeniu", odrzucając zarówno skok 14–16.09, jak
i ten z 27.09. Dwa niezależne rachunki dają ten sam wniosek: **ruch czytelników
stoi w miejscu na poziomie 5–7 kliknięć dziennie i to jest prawdziwy stan**, a nie
kolejne tygodniowe wzloty i spadki.

### Kamień 4 — 20 dni bez pomiaru

Nadal 807 (odczyt 22.09, dane Google z 18.09). **Od ostatniego użytecznego odczytu
minęły prawie trzy tygodnie, więc zgodnie z procedurą proszę wprost: Marku,
potrzebuję liczby zaindeksowanych stron z raportu „Strony" w panelu GSC** — API
tej liczby nie podaje, a bez niej ten kamień nie ma żadnej wartości informacyjnej.
Próba z 30.09 nie pomogła, bo panel pokazywał wtedy dane z 21.09.

---

## Harmonogram

**Data odczytu z konta: 12.10, 07:47 CEST — dzisiejsza.** Odczyt objął
**16 Routines**. Alarmu o nieprzepisanym harmonogramie nie ma.

**Włączonych: 16, wyłączonych: zero. Kolizje: brak.** W sekcji LEGO jest
12 pozycji (11 cyklicznych + jedno zadanie jednorazowe „GSC: czy recenzje 75434
i 42650 w Google" na dziś 11:30), poza serwisem 4.

### Które włączone zadanie nie odpaliło się w minionym tygodniu

| Runner | Ostatnie odpalenie | Commity w tygodniu | Werdykt |
|---|---|---|---|
| Łowca promocji | 11.10 08:44 | 6, 7, 8, 9, 10, 11, **12.10** | komplet 7/7 |
| Radar konkurencji | 11.10 08:09 | 7, 8, 9, 10, 11, **12.10** | komplet |
| Scout nowości | 12.10 05:07 | 8, 9, 10, 11, **12.10** | komplet |
| Wycofania | 12.10 06:10 | **12.10** (`1f5b561`) | OK (tygodniowy) |
| Harmonogram z konta | 12.10 07:45 | **12.10** | OK |
| Dane wt 05:30 | 06.10 05:34 | **06.10** (`d42644b`) | OK, drugi udany wtorek |
| Przypomnienie: zrzut Empiku i x-komu | 05.10 08:22 | — (produktem jest mail) | OK |

**Żadne włączone zadanie nie pominęło przebiegu.** Pierwszy taki tydzień
w czterech raportach.

**„Dane wt" przebiegł drugi raz z powodzeniem** (06.10, commit `d42644b`),
i drugi raz commit nosi w tytule mylące „sesja Code za runnera", choć stopka
wskazuje `session_011Ced7USAHUBBsCPZ1os3F9`, czyli stałą sesję samego runnera.
Zgłaszałem to 05.10; zdanie w prompcie nadal nie zostało poprawione i za miesiąc
ktoś znowu odczyta te commity jako awarię.

**Trigger Scouta i Wycofań zostały w tygodniu odtworzone** (nowe ID
`trig_013FFv1Aaj5gsCrAn27emwih` i `trig_01MGb7VnMvdSHp9Jwa7HyQ69`) — Scout dostał
regułę opisów zestawów dla czytelnika. Kolumna „ostatnie odpalenie" nie zeruje
się tu myląco, bo oba mają dzisiejsze przebiegi i commity.

---

## Archiwum dziennika

`node scripts/archiwum-dziennika.mjs` przeniósł **46 wpisów** do
`materialy/dziennik-archiwum-2026-09.md`; `DZIENNIK.md` skurczył się z 1 662 do
740 linii. Zostaje 29 wpisów.

**Decyzja 3 z 05.10 została wykonana i działa.** Commit `cf99386` z 10.10
(„Archiwum dziennika: otwarte zadania Radaru i Scouta zostają w DZIENNIK.md")
dołożył regułę, o którą prosiłem, a dzisiejszy przebieg ją zademonstrował —
wśród wstrzymanych wpisów jest:

```
zatrzymany mimo wieku — otwarte zadanie bez „→ zamknięte":
  ## 2026-09-26 08:00 · RADAR · Do zrobienia
```

To jest dokładnie ta pozycja, która tydzień temu cicho wyjechała do archiwum.
Skrypt wstrzymał dziś cztery wpisy: trzy ze stanem „w toku" i jeden z otwartym
zadaniem.

---

## Zadania bez właściciela

**Osiem pozycji: trzy dla Marka, dwie dla Piotra, trzy po stronie Code.**

**W minionym tygodniu domknęły się cztery z siedmiu pozycji z poprzedniego
raportu** — i to najlepszy wynik tej sekcji od jej powstania:

- **kalendarz wydarzeń** (otwarte 17 dni) i **siatka „Największe zestawy"**
  (18 dni) — zamknięte decyzją Marka 10.10 (`71eb410`);
- **pięć zestawów ze złym statusem wycofania** (19 dni) — sprawdzone dziś
  w `src/data/wycofania.json`: 21333, 21351, 21353, 21356 i 76437 mają już
  **`potwierdzone`**. Pozycja przeżyła trzy przebiegi runnera i padła w czwartym;
- **szesnaście wpisów Scouta do weryfikacji** (19 dni) — zamknięte linią
  `→ Wycofania 2026-10-12: zmienione/zweryfikowane`.

Dwie ostatnie poszły w tygodniu, w którym naprawiono archiwizację i rozszerzono
prompt runnera. Mechanizm zadziałał.

**1. Dopisać 19 zestawów do śledzonych** *(Code; 11.10, 1 dzień)*
75419 Gwiazda Śmierci chodzi na Amazonie po 3249 zł, a najniższy wpis w całej
naszej historii cen to 3599 zł — ale zestaw **nie jest śledzony** w `sety.json`,
więc nie wchodzi do „Dziś w dobrej cenie", nie ma śledzonego minimum i nie może
dostać postu dealowego. Radar wyliczył 19 takich zestawów (dostępne, RRP od
1000 zł, min. dwie oferty).

**2. Ponaglić zgłoszenie do Proshopu przez Awin** *(Marek — decyzja; 10.10, 2 dni)*
Proshop ma dwa wycofywane zestawy Star Wars taniej niż wszystko, co pokazujemy
(75397 za 1639 zł wobec naszych 1699, 75382 za 769 wobec 829). Zgłoszenie wisi
ze statusem „wysłane" od 19.08. Radar wprost napisał, czego nie zrobi sam:
ręcznie wpisanych cen Proshopu nie dodaje, bo bez programu nie ma feedu, a jedna
wklejona kwota zestarzeje się w tydzień.

**3. Akapit o licencji Sanrio** *(Piotr — tekst; 06.10, 6 dni)*
LEGO i Sanrio ogłosiły wieloletnią współpracę (Hello Kitty, pierwsze produkty
2027). Nasz `/artykuly/historia-licencji-lego-gry-sport-lifestyle/` kończy się na
Nike i Formule 1. Oficjalne oświadczenie obu firm, opisane niezależnie przez dwa
serwisy — nie plotka.

**4. Recenzja LEGO 72306 PlayStation** *(Marek — decyzja o zestawie, potem Piotr;
04.10, 8 dni)* Wymaga fizycznego dostępu do zestawu, więc najpierw decyzja, czy
go kupujemy.

**5. Media Expert — pokrycie cen w imporcie** *(Code; 02.10, 10 dni)*
**Rozwiązane w praktyce, ale bez linii zamknięcia.** Radar sprostował własną
diagnozę 02.10 o 12:40 (przyczyną nie było niepełne odświeżenie, a czytanie
`<g:price>` zamiast `<g:sale_price>`) i poprawka weszła tego samego dnia —
143 zestawy dostały prawdziwą cenę. Wymieniam tę pozycję tylko dlatego, że nikt
nie dopisał pod nią `→ zamknięte`; merytorycznie jest zrobiona.

**6. Liczba sklepów z żywą ofertą na `/wycofania/`** *(Code; 26.09, 16 dni)*
Nasz odpowiednik kolumny „Dystrybucja" konkurencji — dane są w `oferty_feed.json`
i strona ten plik już wczytuje. To ta pozycja, którą dziś wstrzymała naprawiona
archiwizacja.

**7. Tekst o wycofaniu 75192 Sokół Millennium UCS** *(Piotr; 16.09, 26 dni)*
Sprawdzone dziś: karta zestawu jest od 22.09, **artykułu nadal nie ma.**
Najstarsza otwarta pozycja na liście.

**8. Wyceny gratisów z serii Restauracje** *(Marek — decyzja; 12.10, dziś)*
Scout zgłosił to dziś jako „do decyzji, nie moja": 40906, 40907 i 40908 mają
`cena_katalogowa` ze źródłem „karta redakcyjna" (84,99 / 84,99 / 81,99 zł),
a czwarty z serii — 40909 — dostał `bez_rrp`. Żaden z czterech nie był sprzedawany
osobno, więc albo wszystkie mają wycenę dodatku, albo żadna. 40908 chodzi dziś na
Allegro po 169 zł i w Empiku po 278 zł, czyli „cena katalogowa" rozjeżdża się
z rynkiem trzykrotnie. Decyzja zmieni to, co widać w tabelach cen w hubach.

*Ta pozycja nie jest ani „RADAR · Do zrobienia", ani sygnałem wycofania, więc
formalnie wypada z moich dwóch kategorii. Wpisuję ją, bo jest wprost adresowana
do człowieka i inaczej nie trafi nigdzie.*

---

## Ruch botów — filtr przełamany

| Rodzaj | Kliknięć | Udział |
|---|---:|---:|
| bot (odrzucony przez filtr) | 16 200 | 95,7% |
| **„human" (przepuszczony do sieci)** | **724** | **4,3%** |
| nieoznaczone (sprzed 14.09) | 0 | 0% |

Liczba „human" wzrosła z 34 na 724. **To nie jest ruch czytelników.**

### Co się stało

| Dzień | Kliknięć „human" |
|---|---:|
| 05–09.10 | 3–7 dziennie |
| **10.10** | **644** |
| **11.10** | **48** |
| 12.10 | 3 |

Na 10.10 **628 z 644 kliknięć przyszło w dwie godziny** (20:00 UTC — 274,
21:00 UTC — 354). Kraje: Brazylia 146, Argentyna 67, Kolumbia 42, Maroko 26,
Pakistan 26, Chile 26, RPA 23, Bangladesz 22, Meksyk 17, Wenezuela 17, Ukraina 16,
Irak 16, Uzbekistan 12, Boliwia 10. Polska w całym oknie: **35**.

### Dwie dziury, obie dające się wskazać palcem

**Dziura pierwsza — 589 kliknięć.** Referer w dwóch wariantach:
`https://tylkoklocki.pl/serie/marvel` i `https://tylkoklocki.pl/promocje-lego`,
**oba bez końcowego ukośnika**. Nasze strony żyją pod `/serie/marvel/` i
`/promocje-lego/`, więc prawdziwa przeglądarka wysyła referer z ukośnikiem.
Reguła w workerze sprawdza tylko **prefiks** ścieżki
(`/^\/($|artykuly\/|...|serie\/|...)/`), więc `/serie/marvel` ją przechodzi —
wystarczyło zgadnąć jedną dopuszczoną sekcję.

**Dziura druga — 45 kliknięć.** Referer wskazujący **nasz własny endpoint
przekierowań**: `https://tylkoklocki.pl/idz/xkom/11208`,
`https://tylkoklocki.pl/idz/lego/76345` i podobne. Strona `/idz/` nie ma żadnych
linków, więc człowiek nie może z niej kliknąć — to bot idący po własnym łańcuchu
przekierowań. Te adresy nie są w dopuszczonej liście, czyli przeszły **drugą
drogą: nagłówkiem `Sec-Fetch-Site`**, który da się podrobić z curla. Komentarz
w `src/worker.js` przewidział to dokładnie: *„to nagłówek również do podrobienia
z curla (…) pełne domknięcie wymagałoby podpisanego tokenu w linku"*.

Przy okazji wyszła trzecia rzecz, mniejsza, ale realna: **`/promocje-lego/` —
główny dział dealowy od 29.09 — nie jest w dopuszczonej liście ścieżek.** Czyli
prawdziwi czytelnicy wychodzący z tego działu przechodzą filtr **wyłącznie**
dzięki podrabialnemu nagłówkowi. To trzeba dopisać niezależnie od reszty.

### Dlaczego to jest pilne, a nie tylko brzydkie

Ruch oznaczony „human" **idzie dalej do sieci afiliacyjnej** — na tym polega
filtr. W tym tygodniu do sieci poszło: **Allegro 426 kliknięć, Empik 141,
Media Expert 74**, Ceneo, Smyk i x-kom po 17, LEGO.com 14, Lidl 11, Planeta
Klocków 7. Komentarz w workerze nazywa ryzyko wprost i pochodzi z września:
*„z ich perspektywy konto wydawcy generowało setki kliknięć przy zerowej
konwersji — typowy powód wstrzymania konta"*. Dokładnie to zrobiliśmy w nocy
10–11.10, tylko tym razem nie my, a ktoś z zewnątrz.

**Ruch z tej fali nie jest naszym audytem** — rozkład krajów i godzin wyklucza
to jednoznacznie, a od 21.09 nasze audyty nie chodzą przez `/idz/`.

### Realny ruch czytelników

Po odjęciu wszystkiego, co nie jest polskie: **35 kliknięć z Polski w 7 dni.**
Rozkład: Allegro 12, Media Expert 9, Empik 3, Smyk 3, Lidl 3, Ceneo 2, x-kom 2,
LEGO.com 1.

**Udział „brak-linku": 0 na 724 kliknięcia (0,0%)** — czwarty tydzień z rzędu.

**6 z 35 polskich kliknięć (17%) ma referer z ChatGPT**, wobec 39% tydzień temu.
W tym samym oknie Google dał serwisowi 1 kliknięcie.

---

## EPC per sklep

Kliknięcia z Polski 05–12.10 (bez fali botowej), prowizje z API za okno 7 dni.
Allegro i Planeta Klocków mają EPC **modelowe** — zgodnie z decyzją Marka z 22.09
nie czytamy ich paneli.

| Sklep | Kliknięcia PL | Prowizja 7 dni | EPC | Podstawa |
|---|---:|---:|---:|---|
| Allegro | 12 | — | **model** | brak API — tak zostaje |
| Media Expert | 9 | 0,00 zł | 0,00 zł | Performers: 68 klików u nich, 0 konwersji |
| Empik | 3 | 0,00 EUR | 0,00 EUR | Tradedoubler: 0 transakcji w oknie |
| Smyk | 3 | 0,00 zł | 0,00 zł | Adtraction: 0 transakcji |
| **Lidl** | 3 | 0,00 EUR w oknie | — | **jedyna ZATWIERDZONA prowizja: 1,86 EUR (30 dni)** |
| Ceneo | 2 | 0,00 EUR | 0,00 EUR | Tradedoubler: 0 transakcji w oknie |
| x-kom | 2 | — | **model** | SalesMasters, brak API |
| LEGO.com | 1 | 0,00 | **0,00 z definicji** | brak programu (Rakuten odmówił 15.09) |
| Planeta Klocków | 0 | — | **model** | webePartners, brak API — tak zostaje |

Cała tabela mierzonych sklepów ma w oknie tygodniowym EPC zero, bo transakcji nie
było. Jedyna liczba z treścią to okno 30-dniowe Empiku (7,23 EUR, stawka 2,22%)
i zatwierdzone 1,86 EUR Lidla.

**Performers: 68 kliknięć w tygodniu po ich stronie, 159 w 30 dni, zero konwersji
w obu oknach.** Zgłaszam to trzeci raz; z naszej strony nie ma czego sprawdzać.
Zwracam jednak uwagę, że **liczby Performers mogą być teraz zanieczyszczone falą
botową** — 74 sztuczne kliknięcia poszły do Media Expertu w nocy 10–11.10, czyli
więcej, niż mieliśmy prawdziwych kliknięć do tego sklepu przez cały tydzień.
To kolejny argument za pilnością decyzji 1: dopóki filtr przecieka, nie da się
odpowiedzieć sieci na pytanie „ile z tych kliknięć było prawdziwych".

---

## Widoczność w Google

| Okres | Kliknięcia | Wyświetlenia | CTR | Pozycja |
|---|---:|---:|---:|---:|
| 7 dni (03–10.10) | **1** | 59 | 1,69% | 29,0 |
| 14 dni (26.09–10.10) | 5 | 116 | 4,31% | 23,8 |
| Poprzednie 7 dni (26.09–03.10), z różnicy | 4 | 57 | — | — |

Kliknięcia spadły z 4 na 1, pozycja z 18,4 na 29,0, wyświetlenia stoją (57 → 59).
Liczba podstron z wyświetleniami: 24 w oknie tygodniowym, 92 w czternastodniowym.

**Trzymam się tego, co napisałem 05.10: przy jednym kliknięciu tygodniowo wymiar
tygodniowy w GSC nie mówi nic o kierunku.** Dwa tygodnie temu zgłaszałem wzrost
2 → 4 i najwyższy CTR w historii; dziś ten sam wskaźnik pokazuje 1 i CTR 1,7%.
Żadna z tych liczb nie opisuje zmiany w serwisie — opisują szum. Okno
14-dniowe (5 kliknięć, 116 wyświetleń) też jest za małe, żeby cokolwiek z niego
wnioskować, i mówię to wprost zamiast budować na nim wniosek.

Jedna rzecz z tej sekcji jest jednak twarda: **strona główna stoi na pozycji 55,1
przy 13 wyświetleniach**, a dwa tygodnie temu miała pozycję 2,0 przy 5
wyświetleniach. To nie szum, to inne zapytania — pojawiamy się na szerszych,
bardziej konkurencyjnych frazach („klocków", pozycja 97,5; „klocki lego
promocje", 47,5) i na nich stoimy daleko.

### TOP podstrony (7 dni)

| Adres | Kliki | Wyświetlenia | Pozycja |
|---|---:|---:|---:|
| `/` | **1** | 13 | 55,1 |
| `/wycofania/` | 0 | **16** | 7,2 |
| `/promocje-lego/` | 0 | 6 | 33,2 |
| `/artykuly/x-kom-wyzsza-szkola-rabatu-2026-lego/` | 0 | 5 | **2,8** |
| `/artykuly/` | 0 | 4 | 39,8 |
| `/przecieki/` | 0 | 3 | **4,3** |
| `/prezentowniki/` | 0 | 2 | **5,0** |
| `/ekskluzywne/` | 0 | 1 | **1,0** |

**`/wycofania/` piąty tydzień z rzędu: największe źródło wyświetleń (16),
pozycja 7,2, zero kliknięć.** Do tego cztery kolejne strony na pozycjach 1–5
z zerowym CTR. To już nie jest obserwacja — to wzór, który trzyma się piąty
tydzień mimo skrócenia tytułów i opisów 30.09.

---

## Indeksacja

### Liczby z builda

| Miara | 28.09 | 05.10 | **12.10** | Zmiana t/t |
|---|---:|---:|---:|---:|
| Huby `/zestaw/` w buildzie | 9 502 | 9 789 | **9 803** | +14 |
| Huby w `sitemap-zestawy.xml` | 1 196 | 1 286 | **1 291** | +5 |
| Udział zgłoszonych | 12,6% | 13,1% | **13,2%** | +0,1 pkt |

Build czysty: 9 978 stron w 52 s. Tempo przyrostu wyraźnie zwolniło po skoku
z poprzedniego tygodnia (+287 hubów), ale kierunek jest ten sam.

### Inspekcja adresów przez API Search Console

**9 z 10 adresów PASS.**

| Adres | Werdykt | coverageState | Crawl | Wiek |
|---|---|---|---|---:|
| `/` | PASS | Submitted and indexed | 11.10 | 1 dzień |
| `/artykuly/` | PASS | Submitted and indexed | 11.10 | 1 dzień |
| `/artykuly/lego-75434-droid-straznik-k-2so-recenzja/` | PASS | Submitted and indexed | 11.10 | 1 dzień |
| `/ekskluzywne/` | PASS | Submitted and indexed | 22.09 | **20 dni** |
| `/promocje-lego/` | PASS | Submitted and indexed | 29.09 | 13 dni |
| `/serie/` | PASS | Submitted and indexed | 15.09 | **27 dni** |
| `/wycofania/` | PASS | Submitted and indexed | 15.09 | **27 dni** |
| `/zestaw/10280/` | PASS | Submitted and indexed | 11.09 | **31 dni** |
| `/serie/marvel/` | PASS | Submitted and indexed | 11.09 | **31 dni** |
| `/zestaw/11208/` | **NEUTRAL** | **Discovered – currently not indexed** | — | — |

**Dwie rzeczy na plus.** `/artykuly/` został przecrawlowany 11.10 — tydzień temu
zgłaszałem go jako stojący 20 dni. Recenzja 75434, opublikowana w tym tygodniu,
jest w indeksie **następnego dnia** — trzeci tydzień z rzędu, gdy nowy tekst
wchodzi w ciągu doby.

**Pięć adresów ma crawl starszy niż 14 dni i trzeba to wypisać wprost:**
`/serie/` i `/wycofania/` stoją na 15.09 (**27 dni**), `/zestaw/10280/` i
`/serie/marvel/` na 11.09 (**31 dni**), `/ekskluzywne/` na 22.09 (20 dni).
Wzór utrzymuje się drugi tydzień i się pogłębia: Googlebot odwiedza to, co nowe,
a huby działów starzeją się w indeksie. **`/wycofania/` jest tu najboleśniejszym
przypadkiem** — największe źródło wyświetleń w serwisie, zero kliknięć i crawl
raz na cztery tygodnie, więc poprawki tytułu i opisu z 30.09 Google nadal tam
nie widział. To łączy się z sekcją o widoczności: piąty tydzień zerowego CTR na
stronie, której Google od 27 dni nie odwiedził, nie jest zagadką.

**`/zestaw/11208/` to jedyny adres poza indeksem** — i jednocześnie hub, w który
najmocniej biła fala botowa (19 kliknięć w pięciu sklepach). Nie ma między tym
związku przyczynowego, ale warto odnotować zbieżność.

`sitemap-priorytet.xml` nie ma ani w repo, ani w GSC — zamknięte 22.09.

---

## Kontrola linków sklepowych

Wykonana przez Łowcę dziś o 08:30, plik `materialy/kontrola-linkow-2026-10-12.md`.
Próba 150 linków z `redirects.json` — **18 894 w całości, o 775 więcej niż
tydzień temu**. Martwych: **0**.

| Sklep | w próbie | żywe | martwe (404/410) | blokada sklepu | nierozstrzygnięte |
|---|---:|---:|---:|---:|---:|
| planetaklockow | 54 | 54 | 0 | 0 | 0 |
| ceneo | 45 | 45 | 0 | 0 | 0 |
| smyk | 13 | 13 | 0 | 0 | 0 |
| lidl | 3 | 3 | 0 | 0 | 0 |
| xkom | 15 | 0 | 0 | 15 | 0 |
| allegro | 5 | 0 | 0 | 1 | 4 |
| empik | 5 | 0 | 0 | 5 | 0 |
| mediaexpert | 5 | 0 | 0 | 5 | 0 |
| lego | 5 | 0 | 0 | 5 | 0 |

**O 35 linkach ze 150 (23%) nie wolno powiedzieć „OK"** — to dwa razy więcej niż
tydzień temu (15%). Przyczyna jest arytmetyczna: x-kom wszedł do próby z 15
pozycjami (tydzień temu 3) i w całości stoi w kolumnie „blokada sklepu". Razem
31 linków **nie sprawdzonych** (x-kom, Allegro, Empik, Media Expert, LEGO.com)
i 4 nierozstrzygnięte.

Te pięć blokujących sklepów odpowiada za **27 z 35 polskich kliknięć (77%)** —
czyli o linkach, w które czytelnicy faktycznie klikają, kontrola mówi najmniej.

**Zadanie dla `empik-redirects.mjs --usun-martwe`: brak** — żadnego linku Empiku
nie dało się sprawdzić.

---

## TOP artykuły

**Po kliknięciach afiliacyjnych** (ruch polski, który poszedł do sklepu):
jedyny artykuł z kliknięciem to `/artykuly/x-kom-aplikacja-weekend-lego-pazdziernik-2026/`
— **1 kliknięcie**. Reszta polskiego ruchu wyszła z hubów, strony głównej
i `/promocje-lego/`.

**Po widoczności w Google:** `/artykuly/x-kom-wyzsza-szkola-rabatu-2026-lego/`
stoi na pozycji **2,8** z 5 wyświetleniami i zerem kliknięć; `/artykuly/jak-rosly-zestawy-lego/`
na pozycji 11 z jednym wyświetleniem.

W tym tygodniu weszły cztery nowe teksty: dwie recenzje Piotra (75434 Droid
strażnik K-2SO, 42650 Sklep z akcesoriami dla zwierząt) i dwa teksty dealowe
(kod Media Expert, weekend x-kom w aplikacji). **Oba teksty dealowe już zbierają
wyświetlenia, obie recenzje jeszcze nie** — ale są w indeksie od wczoraj, więc
jest za wcześnie na jakikolwiek wniosek. Zadanie jednorazowe „GSC: czy recenzje
75434 i 42650 w Google" (dziś 11:30) sprawdzi to osobno.

---

## Trzy decyzje na ten tydzień

### 1. Domknąć filtr botów — zgoda na zmianę w `src/worker.js` *(Marek)*

689 sztucznych kliknięć poszło w dwie noce do Allegro, Empiku i Media Expertu.
CLAUDE.md wymaga pytania przed każdą zmianą w workerze, więc proszę o zgodę na
trzy poprawki — każda z nich zamyka jedną zmierzoną dziurę, żadna nie wymaga
nowej infrastruktury:

1. **Referer musi być kanoniczny, nie „pod prefiksem".** Dziś reguła przepuszcza
   wszystko, co zaczyna się od dopuszczonej sekcji, więc `/serie/marvel` bez
   ukośnika przeszło 474 razy. Poprawka: ścieżka referera musi kończyć się
   ukośnikiem (nasze adresy są kanoniczne z ukośnikiem) — to wycina całą dziurę
   pierwszą jednym warunkiem. Uczciwie: **jest to próg, nie ściana** — ten sam bot
   po dodaniu ukośnika przejdzie znowu. Warto ją wdrożyć, bo koszt to jeden
   warunek, ale nie liczmy, że zamyka temat na stałe.
2. **Referer wskazujący `/idz/` odrzucamy zawsze.** Strona przekierowania nie ma
   linków, więc człowiek nie może z niej kliknąć. 45 kliknięć, zero fałszywych
   trafień po wdrożeniu.
3. **`/promocje-lego/` dopisać do dopuszczonych ścieżek.** To główny dział
   dealowy od 29.09 i dziś przechodzi filtr tylko dzięki podrabialnemu nagłówkowi
   `Sec-Fetch-Site` — czyli prawdziwi czytelnicy stamtąd zależą od tej samej
   dziury, którą zamykamy.

Czego te trzy poprawki **nie** załatwiają: `Sec-Fetch-Site` zostaje drogą
zapasową dla przeglądarek tnących referer i nadal da się go podrobić. Komentarz
w workerze mówi, że pełne domknięcie wymaga **podpisanego tokenu w linku** —
to większa zmiana i nie proponuję jej teraz obok trzech łatek, które zdejmują
97% zmierzonej fali. Gdyby fala wróciła po łatce, token jest następnym krokiem.

Proponuję też sprawdzić w panelach Allegro i Performers, czy te kliknięcia
zostały po ich stronie zarejestrowane — ale **nie jako comiesięczny odczyt**
(decyzja z 22.09 stoi), tylko jednorazowo, bo tu chodzi o ryzyko wstrzymania konta.

### 2. Zapytać Google o `/wycofania/` inaczej: wymusić crawl, nie zmieniać tytułu *(Marek — jedno kliknięcie w panelu)*

Piąty tydzień z rzędu raportuję to samo: `/wycofania/` jest największym źródłem
wyświetleń (16, pozycja 7,2) i ma zero kliknięć. Przez cztery tygodnie pisałem,
że to kwestia tytułu i opisu. **Dziś wiem, że to był zły wniosek** — tytuły
i opisy skrócono 30.09, a Google tej strony **nie odwiedził od 15 września**,
czyli 27 dni. Ocenia ją po wersji sprzed poprawki.

Zanim cokolwiek znowu przepiszemy, trzeba sprawdzić hipotezę taniej: **„Poproś
o zindeksowanie" dla `/wycofania/` i `/serie/` w panelu GSC.** Dwa kliknięcia.
Jeśli po crawlu CTR drgnie, temat jest zamknięty; jeśli nie drgnie, dopiero wtedy
warto siadać do treści. Ta sama metoda zadziałała 22.09 na stronie głównej
(crawl w ciągu doby) i 24.09 na pięciu stronach sezonowych (5/5 w indeksie).

### 3. Poprawić mylące zdanie w prompcie „Dane wt" *(Marek — edycja w panelu)*

Drobne, ale wraca trzeci raport z rzędu. Runner „Dane wt 05:30" działa poprawnie
od 29.09 (dwa udane wtorki, 29.09 i 06.10), ale oba commity noszą tytuł
**„(sesja Code za runnera)"** — zdanie skopiowane z czasów, gdy sekwencję
faktycznie wykonywała za niego sesja Code. Stopki obu commitów wskazują
`session_011Ced7USAHUBBsCPZ1os3F9`, czyli stałą sesję samego runnera.

Każdy, kto za miesiąc przejrzy `git log`, odczyta dwa poprawne przebiegi jako
dwie awarie — i ja sam musiałem to dwa razy weryfikować po stopce commita, żeby
nie wpisać do raportu nieprawdy. Jedno zdanie w prompcie w panelu.

---

## Czego w tym raporcie nie ma

- **Świeżej liczby zaindeksowanych stron** — 20 dni od ostatniego odczytu;
  prośba do Marka w sekcji kamienia 4.
- **Dzisiejszego zrzutu cen Empiku i x-komu** — przypomnienie wyszło o 08:15,
  zrzut robi człowiek w lokalnej przeglądarce. Ceny Empiku są z 06.10.
- **Potwierdzenia, czy fala botowa dotarła do paneli sieci afiliacyjnych** —
  Allegro i Performers nie mają API w rejestrze, a panele czyta człowiek.
  To część decyzji 1.
- **Wniosku o skuteczności nowych recenzji** — 75434 i 42650 są w indeksie od
  wczoraj.
