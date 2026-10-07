# Raport Kontrolera — tydzień 15–21.09.2026

tylkoklocki.pl · przebieg automatyczny, poniedziałek 09:00 · wygenerowano 21.09.2026, 07:06 UTC

---

## Diagnoza środowiska

*(wynik `node scripts/diagnoza.mjs` — jedyne źródło zdań o tym, co środowisko widzi)*

**Repo**

- gałąź `kontroler` @ `4adfd29`, origin/main @ `4adfd29`
- 0 commitów ponad main, 0 do nadrobienia, 0 plików niezacommitowanych
- node_modules ✓, astro ✓

**Zmienne środowiska** — ustawione 14/14, komplet.

**Dane**

- oferty_feed zaktualizowane: 2026-09-21
- rejestr afiliacji zaktualizowany: 2026-09-17
- import Empiku: 2026-09-16
- oferty: allegro 5112, empik 3947, ceneo 1426, planetaklockow 1149, lego 949, mediaexpert 749, smyk 663, lidl 60

**Dostępy** *(realne wywołania, nie deklaracje)* — cloudflare **ok** (kliknięć 7 dni: 2995), r2 **ok**, tradedoubler **ok**, search_console **ok**, adtraction **ok**, performers **ok**, produkcja **ok** (200), link_sklepu_z_przeglądarki **ok** (302), firecrawl **ok** (223 kredyty).

To pierwszy przebieg Kontrolera z kompletem poświadczeń. Tydzień temu nie było ani jednego — raport z 14.09 nie miał kliknięć, EPC ani Search Console. Wszystkie liczby niżej są zmierzone, a tam gdzie są modelowe, jest to napisane wprost.

---

## Push do repozytorium nie przeszedł

`git push origin kontroler:main` kończy się odmową proxy gita: *„MarekDOLEW/blogoklockach is not in this session's authorized repository set, so the proxy will not inject a credential for it. To fix, add the repository to the session's sources."* — kod 403, identycznie przy zdalnym adresie z `GH_PUSH_TOKEN`. Klonowanie działa (odczyt), blokowany jest wyłącznie zapis, więc to nie jest problem z tokenem, tylko z listą źródeł przypiętych do środowiska tego zadania cyklicznego.

Commit `8dfe58d` istnieje lokalnie i obejmuje cztery pliki: `materialy/kontroler-2026-09-21.md`, `DZIENNIK.md` oraz `materialy/dziennik-archiwum-2026-08.md` i `materialy/dziennik-archiwum-2026-09.md` (archiwizacja 12 wpisów starszych niż 14 dni). **Wszystkie cztery idą do Marka jako pliki razem z tym raportem, bo kontener po zakończeniu przebiegu przepada.** Do naprawy na stałe: dodać `MarekDOLEW/blogoklockach` do źródeł środowiska Routine Kontrolera — inaczej każdy kolejny poniedziałkowy przebieg będzie kończył się tak samo.

---

## Najważniejsze zdanie tego przebiegu

**53% ruchu, który worker oznaczył jako „human", to nasz własny ruch testowy — i to on przez trzy dni napędzał wszystkie liczby o kliknięciach.** Zanim cokolwiek policzę z EPC, muszę to odjąć, bo inaczej każdy wskaźnik w tym raporcie jest zawyżony dwukrotnie. Szczegóły w sekcji „Ruch botów"; konsekwencja jest taka, że realny ruch czytelników serwisu to **62 kliknięcia w sklepy w całym tygodniu**, czyli około dziewięciu dziennie.

---

## Ruch botów i wiarygodność pomiaru

W oknie 7 dni worker zapisał **2 995 wejść na `/idz/`**. Podział ruchu:

| Kategoria | Kliknięć | Udział |
|---|---:|---:|
| bot (brak referera z naszej domeny) | 2 820 | 94,2% |
| human (referer albo `Sec-Fetch-Site`) | 131 | 4,4% |
| nieoznaczone (sprzed 14.09) | 44 | 1,5% |

Filtr działa tak, jak miał działać: ruch botów nie jest przekazywany do sieci afiliacyjnych, więc 2 820 wejść nie nabiło nikomu statystyk. To jest dobra wiadomość i jedyna w tej sekcji.

**Zła wiadomość: te 131 „ludzi" to nie są czytelnicy.** Rozkład geograficzny — 70 kliknięć z USA, 62 z Polski — na polskojęzycznym serwisie o cenach w złotych jest sam w sobie podejrzany. Rozkład dzienny rozstrzyga sprawę:

| Dzień | Polska | USA |
|---|---:|---:|
| 14.09 | 12 | 29 |
| 15.09 | 3 | 22 |
| 16.09 | 20 | 18 |
| 17.09 | 2 | 0 |
| 18.09 | 5 | 0 |
| 19.09 | 9 | 0 |
| 20.09 | 11 | 0 |
| 21.09 | 0 | 1 |

Ruch z USA to 69 kliknięć w dniach 14–16.09 i jedno od tamtej pory. To dokładnie te trzy dni, w których szły audyt mechanizmu, awaria linków i audyt końcowy. Najczęstszy referer tego ruchu przesądza resztę: **`https://tylkoklocki.pl/zestaw/x/` — 17 kliknięć, wszystkie 16.09, dokładnie po jednym na każdy sklep** (allegro, ceneo, empik, lego, mediaexpert, planetaklockow, smyk, amazon, bricksberg, brixani, dadada, klocekplus, proshop, rozetka, sferis, xkom). Taka strona nie istnieje — w całym `dist/` nie ma ani jednego wystąpienia `zestaw/x/`. To nie jest czytelnik, to przebieg kontrolny, który podstawił sobie referer, żeby przejść przez filtr.

Z tego wynikają dwie osobne rzeczy i warto ich nie mieszać.

**Pierwsza — dziura w filtrze.** Worker sprawdza referer wyrażeniem `^https://(www\.)?tylkoklocki\.pl(\/|$)`, czyli akceptuje **dowolną ścieżkę** na naszej domenie, także nieistniejącą. Każdy, kto wyśle stały, zmyślony referer z naszym hostem, jest liczony jako człowiek i jego klik idzie dalej do sieci afiliacyjnej. Dziś przeszło tędy 17 wejść naszego własnego audytu; nic nie stoi na przeszkodzie, żeby jutro przeszedł tędy ktoś obcy. Naprawa jest tania: sprawdzać, czy numer zestawu w refererze zgadza się z numerem w klikniętym adresie (albo przynajmniej, czy ścieżka referera wygląda jak realny hub, artykuł lub `/deale/`).

**Druga — audyty nie mogą chodzić przez `/idz/`.** 17 wejść z 16.09 zostało przekazanych do trackerów Tradedoublera, Adtractionu, Performers, Allegro i webePartners jako prawdziwe kliknięcia. To jest dokładnie to, czego zakazuje reguła wpisana 18.09 przy okazji `kontrola-linkow.mjs` — ten skrypt już nigdy nie odpytuje linku trackingowego i dziś zachował się wzorowo (patrz sekcja o linkach). Audyt z 16.09 był starszy i tej reguły nie miał. Sprzątnięte tylko częściowo: reguła jest w jednym skrypcie, a powinna być zasadą dla wszystkich.

**Wniosek do liczb:** wszystko niżej liczę na **62 kliknięciach z Polski**, nie na 131. Udział stanu „brak-linku" w ruchu ludzkim: **1 kliknięcie na 131 (0,8%)** — to jedyna liczba, którą zostawiam na pełnym „human", bo dotyczy poprawności linków, nie zarobku.

Jeszcze jedna rzecz z tych danych, bardziej ciekawa niż zła: **18 z 62 polskich kliknięć (29%) przyszło z ChatGPT** (referer z `utm_source=chatgpt.com`). W tym samym tygodniu Google dał serwisowi 8 kliknięć. Na dziś większym źródłem ruchu zakupowego jest asystent AI niż wyszukiwarka.

---

## Wynik tygodnia vs plan 20 000 zł na grudzień

**Zmierzona prowizja, 15–21.09: 2,03 EUR i 0,00 zł.** Trzy transakcje, wszystkie w Tradedoublerze (Ceneo 0,16 EUR z dwóch transakcji, Lidl 1,87 EUR z jednej). Adtraction: zero transakcji. Performers: 39 kliknięć po ich stronie, zero konwersji. **Żadna z tych transakcji nie jest jeszcze zatwierdzona** — pole `zatwierdzone` = 0 w każdej pozycji, więc to prowizja zgłoszona, nie należna.

W oknie 30 dni dochodzi Empik: 1 transakcja, obrót 51,53 EUR, prowizja 1,41 EUR (stawka efektywna 2,74%). Razem 30 dni: **3,44 EUR i 0,00 zł**. Tradedoubler raportuje w euro, Adtraction i Performers w złotych — nie sumuję tego jedną liczbą.

To jest pierwszy tydzień w historii serwisu, w którym w ogóle jest co mierzyć. Pierwsza przypisana sprzedaż to kamień milowy i warto go odnotować. Ale rachunek do grudnia wygląda tak:

| Krok | Liczba |
|---|---:|
| Prowizja zmierzona, 7 dni | 2,03 EUR |
| Kliknięcia z Polski, 7 dni | 62 |
| **EPC mieszane, zmierzone** | **0,033 EUR / klik** |
| To samo przy kursie 4,25 zł/EUR *(założenie, nie pomiar)* | 0,14 zł / klik |
| Kliknięć potrzebnych na 20 000 zł | ok. 144 000 |
| Dziennie w grudniu | ok. 4 640 |
| Dziennie dziś | ok. 9 |
| **Mnożnik** | **ok. 515×** |

Nawet przy optymistycznym EPC 0,75 zł, które rok temu podawał Tradedoubler dla Empiku, grudzień wymagałby ok. 26 700 kliknięć, czyli 860 dziennie — wciąż **96× więcej niż dziś**, i to przy założeniu, że wszystkie sklepy nagle zaczną płacić.

**Ocena kontrolerska jest ta sama co tydzień temu i nie zmieniła jej żadna z nowych liczb: 20 000 zł w grudniu 2026 nie jest planem, tylko życzeniem.** Przypominam, że `materialy/strategia-tresci.md` mówi to samo — nazywa sezon XI–XII 2026 „próbą generalną", a moment prawdy wyznacza na przełom 2027. Rekomendacja bez zmian: utrzymać 20 000 zł jako cel roku 2027, a grudzień 2026 rozliczać z rzeczy mierzalnych — liczby zaindeksowanych podstron, kliknięć z Polski, EPC per sklep i pierwszej zatwierdzonej prowizji w każdej sieci. Cel, o którym z góry wiadomo, że nie zostanie trafiony, przestaje sterować decyzjami, a zaczyna je zaciemniać.

---

## EPC per sklep

Liczone na kliknięciach z Polski (15–21.09) i prowizjach z API sieci za to samo okno. Tam, gdzie sieć nie ma API, EPC jest modelem i jest to napisane wprost.

| Sklep | Kliknięcia PL | Prowizja 7 dni | EPC | Podstawa |
|---|---:|---:|---:|---|
| Allegro | 17 | — | **model** | brak API, panel przez przeglądarkę |
| LEGO.com | 11 | 0,00 | **0,00 z definicji** | brak programu (Rakuten odmówił 15.09) |
| Empik | 10 | 0,00 EUR | 0,00 EUR | Tradedoubler; w oknie 30 dni 1,41 EUR / 14 klików = 0,10 EUR |
| Media Expert | 8 | 0,00 zł | 0,00 zł | Performers: 39 klików, 0 konwersji |
| Smyk | 7 | 0,00 zł | 0,00 zł | Adtraction: 0 transakcji |
| Ceneo | 5 | 0,16 EUR | 0,032 EUR | Tradedoubler |
| Lidl | 3 | 1,87 EUR | 0,62 EUR | Tradedoubler — **jedna transakcja, statystycznie nic** |
| Planeta Klocków | 1 | — | **model** | webePartners, brak API |

Trzy rzeczy warto z tej tabeli wyjąć.

**Lidl wygląda najlepiej i to jest złudzenie.** 0,62 EUR na klik pochodzi z jednej transakcji przy trzech kliknięciach. Przy takiej próbie równie dobrze można rzucić monetą. Lidl ruszył 18.09, ma 55 ofert w serwisie i najniższą średnią cenę (154 zł) — wróćmy do niego za miesiąc.

**Dwie największe ekspozycje nie mają pomiaru w ogóle.** Allegro (971 ofert, 17 kliknięć — najwięcej w serwisie) i Planeta Klocków (961 ofert) nie mają API w rejestrze. Dopóki ich nie ma, jedna trzecia ruchu jest niemierzalna i całe „EPC mieszane" z poprzedniej sekcji jest z tego powodu zaniżone o nieznaną wielkość. To argument za tym, żeby ktoś raz w miesiącu wszedł do obu paneli ręcznie i podał liczbę.

**LEGO.com to 776 ofert i 11 kliknięć tygodniowo, które z definicji nie mogą zarobić.** Po odmowie Rakutena z 15.09 linkujemy tam bez prowizji. To 18% realnego ruchu zakupowego serwisu, oddawane za darmo — i to ruch na najdroższych pozycjach katalogu (średnia oferta LEGO.com: 328 zł, najwyższa ze wszystkich sklepów).

---

## Ekspozycja — na czym EPC się liczy

Stan z dzisiejszego builda: **5 040 ofert na 1 173 zestawach**.

| Sklep | Ofert | Wartość (zł) | Śr. cena (zł) |
|---|---:|---:|---:|
| Allegro | 971 | 271 231 | 279 |
| Planeta Klocków | 961 | 248 910 | 259 |
| Empik | 955 | 208 678 | 219 |
| LEGO.com | 776 | 254 822 | 328 |
| Media Expert | 685 | 166 484 | 243 |
| Smyk | 637 | 123 731 | 194 |
| Lidl | 55 | 8 443 | 154 |

Tydzień temu raport pokazywał 9 702 oferty na 4 397 hubach. Spadek do 5 040 na 1 173 **nie jest regresem** — to skutek sita z 16.09, które wycina oferty starsze niż 14 dni oraz pozycje poniżej 50% potwierdzonego RRP bez ręcznego werdyktu. Liczba jest niższa, bo przestała zawierać ceny, których już nie ma w sklepach. Od tego tygodnia to jest właściwy punkt odniesienia i do niego będę porównywał następne przebiegi.

---

## TOP artykuły

Dwie miary, bo mówią o dwóch różnych rzeczach: co Google pokazuje i co realnie wysyła klik do sklepu.

**Z Search Console (7 dni, 12–19.09):**

| Strona | Kliki | Wyświetlenia | Pozycja |
|---|---:|---:|---:|
| /zestaw/11387/ | 7 | 116 | 4,5 |
| strona główna | 1 | 4 | 2,8 |
| /wycofania/ | 0 | 46 | 6,5 |
| /nowosci/ | 0 | 11 | 24,1 |
| /zestaw/10299/ | 0 | 10 | 48,0 |
| /kalendarz-promocji-lego/ | 0 | 9 | 4,2 |
| /zapowiedzi-lego-2027/ | 0 | 6 | 5,3 |
| /artykuly/ | 0 | 4 | 51,0 |
| /artykuly/porownanie-cztery-zamki-lego/ | 0 | 3 | 47,0 |

**Żaden tekst redakcyjny nie dostał w tym tygodniu ani jednego kliknięcia z Google.** Cały ruch organiczny serwisu to jeden hub zestawu — 11387 Świąteczny dom, 7 z 8 kliknięć, na frazie „lego 11387" z pozycji 4,5.

Osobno warto zapamiętać `/wycofania/`: **46 wyświetleń na średniej pozycji 6,5 i zero kliknięć**. Pozycja 6,5 przy zerowym CTR to prawie zawsze problem tytułu i opisu w wynikach, nie problem treści — strona jest pokazywana i konsekwentnie pomijana. To najtańsza rzecz do poprawienia w całym serwisie.

**Z kliknięć afiliacyjnych (które strony realnie wysyłają ludzi do sklepów, ruch PL):** dominują huby zestawów, ale w pierwszej piątce źródeł są też `/artykuly/lego-na-rozpoczecie-roku-szkolnego-chlopiec/` (4 kliknięcia, wszystkie z ChatGPT), strona główna (4), `/artykuly/najdrozsze-zestawy-lego/` (3 — tekst opublikowany 20.09, więc to wynik z półtora dnia) i `/deale/` (2). Ranking po ruchu z Google i ranking po klikach do sklepu prawie się nie pokrywają, bo pierwszy napędza Google, a drugi ChatGPT i wejścia bezpośrednie.

---

## Widoczność w Google

| Okno | Kliki | Wyświetlenia | CTR | Śr. pozycja |
|---|---:|---:|---:|---:|
| 7 dni (12–19.09) | 8 | 295 | 2,71% | 17,0 |
| 14 dni (5–19.09) | 9 | 365 | 2,47% | 19,8 |

Z różnicy wychodzi tydzień do tygodnia: **5–12.09 to 1 kliknięcie i 70 wyświetleń, 12–19.09 to 8 kliknięć i 295 wyświetleń.** Wyświetlenia ×4, kliknięcia ×8, średnia pozycja w górę z 19,8 na 17,0. To jest najlepszy tydzień serwisu w Google i pierwszy, w którym widać trend, a nie szum.

TOP frazy: „lego 11387" (7 kliknięć, 108 wyświetleń, pozycja 4,5) — jedna fraza to 88% całego ruchu z wyszukiwarki. Dalej wyłącznie wyświetlenia bez kliknięć: „santiago bernabéu lego" (7 wyśw., pozycja 47,3), „lego batmobil" (6, poz. 34,8), „lego upominki" (3, poz. 29). Osobna grupa to frazy w cudzysłowach („ahsoka" „star wars", „star wars" „andor", „strażników galktyki") — to zapytania z operatorami, prawdopodobnie ruch narzędziowy, nie czytelniczy; nie budowałbym na nich planu treści.

Obraz jest spójny: **serwis ma dobre pozycje tam, gdzie nikt nie szuka (frazy w cudzysłowie, pozycje 3–10, zero kliknięć), i złe tam, gdzie szukają wszyscy** („lego batmobil" — pozycja 34,8). Jedyny wyjątek, 11387, to zestaw premierowy, na który zdążyliśmy z kartą przed konkurencją. To jest powtarzalny mechanizm i warto go świadomie powtarzać.

---

## Indeksacja

| Miara | 24.08 | 15.09 | **21.09** | Zmiana |
|---|---:|---:|---:|---|
| Huby `/zestaw/` w buildzie | — | 9 363 | **9 364** | +1 |
| Huby w `sitemap-zestawy.xml` | — | ok. 775 | **1 164** | **+389 (+50%)** |
| Udział hubów w sitemapie | — | 8,3% | **12,4%** | +4,1 pkt |
| Adresy przesłane (panel) | 4 874 | 3 667 | brak odczytu | — |
| Zindeksowane (panel) | 0 | 307 | brak odczytu | — |
| Kliki / wyświetlenia | — | 8 / 263 *(30 dni)* | **8 / 295 *(7 dni)*** | ten sam wynik w ¼ czasu |

Build: 9 511 stron, bez błędów, 32,5 s.

**Poprawa, którą warto wypunktować wprost:** miesięczny wynik z odczytu panelu z 15.09 (8 kliknięć, 263 wyświetlenia w 30 dniach, dane z 4.09) serwis osiąga dziś w ciągu siedmiu dni. Liczba hubów zgłaszanych do indeksu urosła o połowę — sito indeksowalności przepuszcza teraz 1 164 huby zamiast ok. 775.

**Wąskie gardło się nie zmieniło:** 1 164 z 9 364 hubów w sitemapie to nadal 12,4%. Osiem tysięcy hubów istnieje w buildzie i nie jest zgłaszanych do Google, bo nie przechodzą progu indeksowalności (kolejka `noindex-do-opisania.py` z 21.09 wylicza 8 044 takie huby).

**Inspekcja adresów przez API** — 5 z 8 z werdyktem „zindeksowany":

| Adres | Werdykt | coverageState | Ostatni crawl |
|---|---|---|---|
| strona główna | PASS | Submitted and indexed | **25.08.2026** ⚠ |
| /artykuly/ | PASS | Submitted and indexed | 15.09.2026 |
| /serie/ | PASS | Submitted and indexed | 15.09.2026 |
| /wycofania/ | PASS | Submitted and indexed | 15.09.2026 |
| /zestaw/10280/ | PASS | Submitted and indexed | 11.09.2026 |
| /ekskluzywne/ | NEUTRAL | **Discovered – currently not indexed** | brak ⚠ |
| /zestaw/43240/ | NEUTRAL | **URL is unknown to Google** | brak ⚠ |
| /artykuly/najdrozsze-zestawy-lego/ | NEUTRAL | URL is unknown to Google | brak |

Trzy pozycje wymagają uwagi. **Strona główna nie była odwiedzona przez Googlebota od 25 sierpnia — 27 dni.** Przy serwisie, który w tym czasie dodał kilkanaście tekstów i 389 hubów do sitemapy, to jest sygnał niskiego budżetu indeksowania, nie przypadek. **`/zestaw/43240/` jest w sitemapie i Google go nie zna** — to znaczy, że sam fakt zgłoszenia niczego nie załatwia; z 1 164 zgłoszonych hubów nieznana część jest w tym samym stanie. **`/ekskluzywne/` jest „wykryty, obecnie niezaindeksowany"** — ta sama kategoria, w której 4.09 siedziało 3 291 adresów.

Tekst `/artykuly/najdrozsze-zestawy-lego/` jest nieznany Google, ale został opublikowany 20.09 po południu — na werdykt jest po prostu za wcześnie.

*Uwaga metodologiczna:* pola „zindeksowane" z endpointu `sitemaps` nie raportuję — od 2022 pokazuje 0 i nic nie znaczy. Realną liczbę zindeksowanych stron ma tylko panel GSC (raport „Strony"); ostatni odczyt jest z 15.09, czyli sprzed sześciu dni, więc w tym tygodniu nie proszę o kolejny. Następny wypada około 29.09.

---

## Kontrola linków sklepowych

Próba 200 losowych linków z `redirects.json` (16 018 wpisów), sprawdzany adres docelowy sklepu, nigdy link trackingowy.

| Sklep | W próbie | Żywe | Martwe (404/410) | Blokada sklepu | Nierozstrzygnięte |
|---|---:|---:|---:|---:|---:|
| Planeta Klocków | 77 | 77 | 0 | 0 | 0 |
| Ceneo | 71 | 71 | 0 | 0 | 0 |
| Smyk | 31 | 31 | 0 | 0 | 0 |
| Lidl | 1 | 1 | 0 | 0 | 0 |
| Empik | 5 | 0 | 0 | 5 | 0 |
| LEGO.com | 5 | 0 | 0 | 5 | 0 |
| Media Expert | 5 | 0 | 0 | 5 | 0 |
| Allegro | 5 | 0 | 0 | 0 | 5 |

**Martwych linków: 0 na 185 sprawdzalnych.** Mail na kontakt@ nie poszedł, bo nie było o czym pisać. Zadania dla `empik-redirects.mjs --usun-martwe` w tym tygodniu nie ma.

O Empiku, Media Expercie, LEGO.com (blokada 403 dla ruchu serwerowego) i Allegro (nierozstrzygnięte) **nie twierdzę, że są OK — są niesprawdzone.** To 20 linków z 200, czyli 10% próby, i tej dziury nie da się zamknąć z serwera; potrzebny byłby przebieg przez przeglądarkę z maszyny Marka.

---

## Harmonogram

**Sekcja `HARMONOGRAM:START/KONIEC` w `materialy/zadania-cykliczne.md` nie została w tym tygodniu przepisana, bo ta sesja nie ma konektora `Claude_Code_Remote`** — `ListConnectors` zwraca pustą listę, więc `list_triggers` nie było czym wywołać i `harmonogram-z-konta.mjs` nie dostał czego przetworzyć. Zgodnie z regułą „nie przepisuj sekcji ręcznie" zostawiam ją w stanie z 16.09; `materialy/routine-prompty.md` też bez zmian. To jest osobny problem do rozwiązania: dokument `zadania-cykliczne.md` sam stwierdza, że ta sekcja może powstawać **wyłącznie** w raporcie Kontrolera, a Kontroler właśnie stracił jedyny dostęp, który to umożliwiał.

Pozostaje kontrola po commitach, która i tak jest twardsza niż kolumna „ostatnie odpalenie" (ta zeruje się po każdym odtworzeniu triggera). Runnery z pushem, 15–21.09:

| Runner | Oczekiwane | Commity | Stan |
|---|---|---:|---|
| Radar konkurencji (codziennie) | 7 | 7 | ✅ komplet |
| Łowca promocji (codziennie) | 7 | 7 | ✅ komplet |
| Wycofania (poniedziałek) | 1 | 1 | ✅ 21.09 04:19 |
| **Scout nowości (codziennie)** | **7** | **5** | ⚠ **brak 19 i 20.09** |
| Dane wt 05:30 (LEGO.pl + Ceneo + Smyk) | 0 | 0 | trigger utworzony 15.09 po godzinie startu — pierwszy przebieg wypada 22.09 |

**Scout nie zostawił commitu w sobotę 19.09 ani w niedzielę 20.09**, przy komplecie w pozostałe pięć dni (15, 16, 17, 18, 21.09). Brak `last_run` sam w sobie nie byłby alarmem, ale brak commitu przy codziennym runnerze z pushem jest — tym bardziej że oba brakujące dni to weekend, czyli wzór, a nie przypadek. Do sprawdzenia w panelu: czy przebiegi w ogóle wystartowały, czy wystartowały i padły na limicie użycia konta (to on wywrócił harmonogram 21.08).

Kolizji nie stwierdzam — ostatni znany odczyt (16.09) nie pokazywał dwóch włączonych zadań na tej samej minucie, a nowych triggerów w tym tygodniu nie zakładano.

---

## Zadania bez właściciela

**5 pozycji.** Mail wyszedł do Marka i Piotra (`kontakt@tylkoklocki.pl`, `piotrmaculewicz@interia.pl`, id `01a0c2ce-b35d-75bb-be13-fcc3a5866711`). W skrócie:

| # | Pozycja | Kto | Otwarte |
|---|---|---|---:|
| 1 | Rozdzielić kalendarz na promocje i wydarzenia (za fanklockow.pl) | Marek — decyzja | 3 dni |
| 2 | Siatka stron „Największe zestawy LEGO <seria>" (za zklockow.pl) | Marek — decyzja | 4 dni |
| 3 | Tekst o wycofaniu 75192 Sokół Millennium UCS | Piotr — tekst | 5 dni |
| 4 | Pięć złych statusów wycofania (21333, 21351, 21353, 21356, 76437) | Code — runner Wycofań | 5 dni |
| 5 | 16 niezweryfikowanych wpisów ze StoneWars + 10 numerów spoza katalogu | Code — runner Wycofań | 5 dni |

Pozycje 4 i 5 czekają na runner Wycofań, który odpalił się dziś o 04:19 i domknął **nowszy** sygnał (246 numerów z artykułu z 17.09, 88 dopisanych), a tych dwóch starszych nie tknął. Warto dopisać mu do promptu, żeby przed nowym sygnałem sprzątał zaległe.

---

## Trzy decyzje na ten tydzień

### 1. Zamienić cel „20 000 zł w grudniu" na zestaw mierzalnych kamieni milowych *(Marek)*

Pytanie leży od 14.09 bez odpowiedzi, a od dzisiaj jest poparte pomiarem, a nie modelem: zmierzone EPC 0,033 EUR na klik i 9 kliknięć dziennie dają do grudnia mnożnik **515×**. Nawet najbardziej optymistyczne założenie o prowizji zostawia mnożnik 96×. Propozycja bez zmian: 20 000 zł zostaje celem roku 2027 (zgodnie z `strategia-tresci.md`), a grudzień 2026 rozliczamy z czterech liczb — pierwsza **zatwierdzona** prowizja w każdej z trzech sieci z API, EPC per sklep na próbie większej niż jedna transakcja, kliknięcia z Polski dziennie, liczba zaindeksowanych podstron z panelu. Wszystkie cztery są w tym raporcie i wszystkie da się śledzić co tydzień.

### 2. Domknąć filtr botów i zakazać audytom chodzenia przez `/idz/` *(Marek — zgoda, Code — wykonanie)*

Dwie zmiany, obie tanie. Po pierwsze: worker ma sprawdzać, czy referer wskazuje na realną stronę serwisu (najprościej: numer zestawu w refererze zgadza się z klikniętym numerem) — dziś wystarczy dowolny zmyślony adres na naszej domenie, żeby zostać uznanym za człowieka i zostać przepuszczonym do sieci afiliacyjnej. Po drugie: reguła „żaden skrypt nie odpytuje `/idz/` ani linku trackingowego", dziś obecna tylko w `kontrola-linkow.mjs`, ma trafić do RUNBOOK-a jako zasada dla wszystkich audytów. 16.09 przeszło tędy 17 sztucznych kliknięć, po jednym na każdy sklep. Dopóki to nie jest domknięte, każdy tygodniowy EPC trzeba czytać z zastrzeżeniem.

### 3. Rozstrzygnąć, co robimy z LEGO.com *(Marek)*

776 ofert, 254 822 zł ekspozycji, najwyższa średnia cena w serwisie (328 zł) i **11 z 62 realnych kliknięć tygodniowo — 18% ruchu zakupowego — oddawane bez żadnej prowizji**, bo po odmowie Rakutena z 15.09 nie mamy programu. Do wyboru w zasadzie trzy drogi: szukać LEGO.com w innej sieci (Awin, Convertiser, bezpośrednio), zostawić jako jest i świadomie traktować jako koszt wiarygodności cennika, albo przestać dawać LEGO.com pierwszeństwo w tabeli cen i przepuszczać ten ruch do sklepów, które płacą. Pierwsza jest najlepsza, trzecia najszybsza, druga jest dzisiejszym stanem domyślnym — i to ona kosztuje najwięcej, bo trwa bez decyzji.

---

## Czego w tym raporcie nie ma

- **Harmonogramu z konta** — brak konektora `Claude_Code_Remote` w tej sesji; sekcja generowana nie została przepisana (szczegóły wyżej).
- **Prowizji Allegro i Planety Klocków** — brak API w rejestrze; obie pozycje w EPC są modelem, nie pomiarem.
- **Liczby zaindeksowanych stron** — endpoint `sitemaps` jej nie podaje, a panel był czytany 15.09; następny odczyt około 29.09.
- **Werdyktu o linkach Empiku, Media Expertu, LEGO.com i Allegro** — 20 linków z 200 nie da się sprawdzić z serwera.
