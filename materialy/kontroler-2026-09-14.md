# Raport Kontrolera — tydzień 8–14.09.2026

tylkoklocki.pl · przebieg automatyczny, poniedziałek 09:00 · wygenerowano 14.09.2026, 07:30 UTC

---

## Najpierw: czego w tym raporcie nie ma

W środowisku tego przebiegu **nie ma żadnego z poświadczeń**, których wymagają skrypty raportujące. Sprawdzone wprost: `CF_ACCOUNT_ID`, `CF_API_TOKEN`, `GSC_KEY_JSON_B64` i `GH_PUSH_TOKEN` są nieustawione. `node scripts/kliki-raport.mjs --dni 7` kończy się komunikatem „BRAK dostępu do Cloudflare", `node scripts/gsc-raport.mjs --dni 7` — „BRAK zmiennej GSC_KEY_JSON_B64".

W konsekwencji **nie ma w tym raporcie trzech sekcji, które miały być jego rdzeniem**: kliknięć afiliacyjnych i EPC per sklep, udziału kliknięć ze stanem „brak-linku", oraz odczytu Search Console — zarówno widoczności (klik/wyświetlenia/frazy/pozycje), jak i liczników indeksacji i inspekcji adresów. Zgodnie z instrukcją: to brak wyłącznie poświadczeń do **odczytu**. Zapis kliknięć po stronie workera działa i dane w Analytics Engine narastają — po przywróceniu tokenu będą do odczytania wstecz, w granicach retencji datasetu.

Reszta raportu jest policzona z repozytorium i ze świeżego builda serwisu (`npx astro build`, 4 573 strony, bez błędów). To realne liczby produkcyjne, nie szacunki — po prostu opisują **stan i strukturę**, a nie **ruch**.

Ponieważ brakuje też `GH_PUSH_TOKEN`: żaden plik danych nie wymagał w tym tygodniu aktualizacji, więc nie ma czego wypychać. Raport nie zmienia niczego w repo.

---

## Wynik tygodnia vs plan 20 000 zł na grudzień

**Zmierzony wynik tygodnia: nieznany.** Nie z powodu zera sprzedaży, tylko z powodu braku dostępu do odczytu. To jest sam w sobie najważniejszy wniosek tego przebiegu — plan przychodowy jest weryfikowany raz w tygodniu, a od tego tygodnia weryfikacja nie ma na czym się oprzeć.

Żeby rozmowa o grudniu nie wisiała w próżni, poniżej rachunek wsteczny z celu. Wszystkie założenia są jawne, żadne nie jest zmierzone.

**Prowizja efektywna.** Potwierdzone stawki: Media Expert 2,00% (API, 19.08), Smyk 2,10% (ale świadomie nieużywana — patrz niżej), Egmont 6% (księgarnia, nie zestawy), Proshop 3% (zgłoszenie w toku). Dla Allegro i Empiku — dwóch sklepów, które odpowiadają za 73% ekspozycji — stawki są **niepotwierdzone**. Przyjmuję 2% jako ostrożny środek.

| Krok rachunku | Założenie | Wynik |
|---|---|---|
| Cel prowizji, grudzień | — | 20 000 zł |
| Obrót przypisany przy prowizji 2% | 2,0% | 1 000 000 zł |
| Zamówienia przy koszyku 380 zł | średnia oferty w serwisie | ok. 2 630 |
| Kliknięcia przy konwersji 3% | typowo 2–4% dla treści porównawczych | ok. 88 000 |
| Kliknięcia dziennie w grudniu | — | ok. 2 800 |
| Sesje przy CTR w `/idz/` 10% | — | ok. 880 000 |

Wariant optymistyczny liczony po EPC zamiast po konwersji: przy EPC 0,75 zł (średnia sieciowa Tradedoublera podana dla Empiku) wystarczyłoby ok. 27 000 kliknięć; przy EPC 0,25 zł — ok. 80 000. Rozstrzygnąć to może wyłącznie pomiar, czyli dokładnie ta rzecz, której w tym tygodniu zabrakło.

**Ocena kontrolerska.** Punkt startowy to domena, która według ostatniego znanego odczytu GSC ma zaindeksowaną jedną stronę — główną — i 43 teksty redakcyjne. Dojście stąd do rzędu setek tysięcy sesji w trzy i pół miesiąca nie jest scenariuszem, tylko życzeniem. Warto przy tym odnotować, że **dokument strategiczny serwisu mówi co innego niż ten cel**: `materialy/strategia-tresci.md` wprost nazywa sezon XI–XII 2026 „próbą generalną" i wyznacza moment prawdy na listopad–grudzień 2027. Rekomendacja kontrolera: utrzymać 20 000 zł jako cel roku 2027, a grudzień 2026 rozliczać z kamieni milowych, które da się osiągnąć i zmierzyć — pierwsza przypisana sprzedaż, zmierzony EPC per sklep, liczba kliknięć w `/idz/`, liczba zaindeksowanych podstron. Cel przychodowy, o którym z góry wiadomo, że nie zostanie trafiony, przestaje sterować decyzjami.

---

## Struktura monetyzacji — na czym EPC będzie liczone

EPC wymaga kliknięć, których nie mam. Mam natomiast pełną **ekspozycję**: każdą ofertę, którą serwis dziś pokazuje, i to, dokąd faktycznie prowadzi przycisk. Liczby z builda z 14.09: 9 702 oferty na 4 397 hubach, łączna wartość pokazywanych cen 3 686 402 zł, średnia oferta 380 zł.

| Sklep | Ofert | Wartość (zł) | Śr. cena | Dokąd prowadzi `/idz/` |
|---|---|---|---|---|
| Allegro | 3 712 | 1 649 453 | 444 | `item_link` z feedu — 100% pokrycia |
| Empik | 3 356 | 1 375 921 | 410 | deeplink Tradedoubler do wyszukiwarki Empiku |
| Planeta Klocków | 995 | 253 226 | 254 | deeplink webePartners — 100% pokrycia |
| Smyk | 704 | 140 085 | 199 | link bezpośredni, **bez prowizji** (decyzja 28.08) |
| Media Expert | 699 | 176 584 | 253 | 677 deeplinków, **22 bez linku** |
| LEGO.com | 222 | 79 682 | 359 | **0 linków — klik wraca na naszą stronę główną** |
| Pozostałe (8 sklepów) | 14 | 11 451 | — | wyszukiwarka sklepu, bez prowizji |

Podział według tego, czy klik ma szansę zarobić: **90,1% ofert prowadzi linkiem prowizyjnym** (8 740), **7,4% prowadzi linkiem bez prowizji** (718 — Smyk i drobne sklepy z szablonem wyszukiwarki), **2,5% nie prowadzi nigdzie** (244).

Te 244 oferty to strukturalny odpowiednik stanu „brak-linku" z Analytics Engine i jedyna jego miara, jaką dziś potrafię podać. Składają się na nią dwie pozycje i mają zupełnie różny ciężar:

**LEGO.com — 222 oferty, 79 682 zł ekspozycji, zero linku.** Worker nie ma dla LEGO ani wpisu w `redirects.json`, ani fallbacku, ani szablonu `szukaj` w `sklepy.json`, więc klik kończy się przekierowaniem na `tylkoklocki.pl`. To nie jest tylko utracona prowizja (programu Rakuten i tak jeszcze nie mamy — status „do zgłoszenia"), to **błąd doświadczenia użytkownika**: czytelnik widzi cenę 3 199,99 zł przy Sagrada Família, klika „sprawdź" i ląduje z powrotem na stronie głównej. Na liście są najdroższe pozycje katalogu — Sagrada Família, Minas Tirith (2 799,99 zł), Koenigsegg (1 949,99 zł), Ministerstwo Magii (1 849,99 zł).

**Media Expert — 22 oferty bez wpisu w `redirects.json`, 5 630 zł ekspozycji.** Tu prowizja jest realna i potwierdzona (2,00%), a mimo to te kliknięcia przepadają. Wśród nich Koenigsegg za 1 599 zł i Jeep Wrangler z Jurassic Park za 859,99 zł. To najprostsza do domknięcia pozycja w całym raporcie.

Osobno warto przypomnieć skalę świadomie odpuszczonej prowizji: **Smyk to 704 oferty i 140 085 zł ekspozycji linkowanej bez stawki 2,10%**, bo deeplink Adtraction nie dowoził na kartę produktu. Decyzja z 28.08 była słuszna — cena z linkiem na stronę główną psuje zaufanie bardziej, niż warta jest prowizja — ale nie jest darmowa i warto ją co miesiąc przeglądać (plan B: rejestracja bezpośrednio w netSalesMedia).

---

## TOP artykuły

Bez Search Console nie da się zrobić rankingu po ruchu. Poniżej ranking po tym, co potrafię zmierzyć i co i tak decyduje o przyszłym ruchu: **ile hubów zestawów tekst realnie wspiera linkiem wewnętrznym** — bo to jest zadeklarowana ścieżka konwersji serwisu (artykuł → hub → sklep) i jednocześnie warunek C indeksowalności huba.

| Tekst | Sekcja | Zestawów | z tego indeksowalnych |
|---|---|---|---|
| Zapowiedzi LEGO 2027 | artykuł | 22 | 16 |
| Nowe zestawy na jesień i święta 2026 | artykuł | 18 | 18 |
| Kalendarz promocji LEGO 2026 | artykuł | 18 | 17 |
| Najlepsze samochody LEGO Icons w historii | artykuł | 16 | **6** |
| LEGO na rozpoczęcie roku szkolnego 2026 | prezentownik | 13 | 13 |
| LEGO na start roku szkolnego — chłopiec | prezentownik | 12 | 12 |
| LEGO City — nowa fala z czerwca 2026 | artykuł | 10 | 10 |
| LEGO Super Mario zaczyna od nowa | artykuł | 10 | 10 |
| Jakie LEGO za ok. 200 zł dla 10-latka | prezentownik | 10 | 10 |
| LEGO na start roku szkolnego — dziewczynka | prezentownik | 10 | 10 |

Jedna pozycja odstaje: **„Najlepsze samochody LEGO Icons w historii" linkuje do 16 hubów, z których 10 ma dziś `noindex`.** Tekst rozdaje moc linkowania stronom, których Google nie zindeksuje. To do naprawienia albo po stronie hubów (dorzucenie sklepu, dopisanie opisu), albo przez wymianę części zestawów w tekście na takie, które próg przechodzą.

**Kadencja publikacji — to jest problem tygodnia.** Strategia zakłada 4–5 tekstów dziennie, czyli ok. 30 tygodniowo, i termin „prezentowniki na sezon 2026 opublikowane do połowy października" (Google potrzebuje 6–10 tygodni na rozkręcenie). Rzeczywistość:

| Tydzień | Opublikowanych tekstów | Skład |
|---|---|---|
| 25–31.08 | 21 | 7 artykułów, 11 prezentowników, 3 deale |
| 1–7.09 | 5 | 3 artykuły, 1 prezentownik, 1 deal |
| 8–14.09 | **3** | 2 artykuły, 1 prezentownik |

Trzy teksty tygodniowo to ok. 10% planu. Do połowy października zostało pięć tygodni — przy obecnym tempie powstanie ok. 15 tekstów zamiast ok. 150. Ponieważ grudniowy przychód zależy od treści opublikowanych **teraz**, a nie w listopadzie, to jest dziś twardsze ograniczenie planu niż cokolwiek po stronie afiliacji.

Osobno, bez alarmu: sesja redakcyjna „czubek kolejki" z 4.09 miała przerabiać arkusz 809 zestawów do opisania i dopisywać wpisy do `sety.json`. W historii `main` z ostatniego tygodnia widać jeden commit z opisami (P07: 7 nowych opisów + 24 korekty, 14.09). Warto sprawdzić, czy ta sesja nadal żyje.

---

## Widoczność w Google

Sekcji nie ma: `scripts/gsc-raport.mjs` nie wystartował, bo w środowisku brakuje `GSC_KEY_JSON_B64`, więc nie mam ani klików i wyświetleń, ani fraz, ani pozycji, ani porównania z poprzednim tygodniem.

---

## Indeksacja

Odczytu z Search Console nie ma (ten sam brak poświadczenia), więc nie podam werdyktu inspekcji, `coverageState` ani dat ostatniego crawla. Podam natomiast **to, co zgłaszamy** — policzone ze świeżego builda, czyli dokładnie te pliki, które Google pobiera z produkcji.

| Sitemapa | Adresów | Stan 09.09 |
|---|---|---|
| `sitemap-artykuly.xml` | 19 | 17 |
| `sitemap-prezentowniki.xml` | 20 | 19 |
| `sitemap-deale.xml` | 5 | 5 |
| `sitemap-serie.xml` | 46 | 45 |
| `sitemap-nowosci.xml` | 13 | 12 |
| `sitemap-zestawy.xml` | **723** | **799** |
| `sitemap-inne.xml` | 6 | 6 |
| **Razem w `sitemap-index.xml`** | **832** | **903** |
| `sitemap-priorytet.xml` (poza indeksem) | 769 | — |

Względem punktów odniesienia z promptu: 24.08 zgłaszaliśmy 4 874 adresy przy zerowej indeksacji; 25.08 po przycięciu — 1 160; 09.09 po przebudowie na sitemapy sekcyjne — 903; **dziś 832**.

**Spadek o 71 adresów w pięć dni wygląda źle, ale nie jest regresem.** Przyczyna jest znana i zamierzona: audyt 593 numerów na lego.com z 13.09 oznaczył **224 zestawy jako EOL**, co wywraca warunek D indeksowalności (premiera ≤18 miesięcy i nie wycofany). Równolegle skurczyła się cała pula hubów — z 4 947 (09.09) do 4 462 (14.09). Udział hubów indeksowalnych jest więc **identyczny jak tydzień temu: 16,2%**. Zgłaszamy mniej, bo katalog został oczyszczony z pozycji, których i tak nie warto było zgłaszać.

Czego nie wiem i co trzeba odczytać przy pierwszym przebiegu z działającym GSC: czy liczba zaindeksowanych adresów ruszyła z zera i czy Google crawluje cokolwiek poza stroną główną. Dziennik wyznacza ten odczyt na 23–30.09, więc najbliższe dwa przebiegi Kontrolera powinny go objąć — pod warunkiem przywrócenia klucza. Do sprawdzenia przy okazji: czy `sitemap-priorytet.xml` (769 adresów) nadal jest zgłoszona w GSC, bo od 09.09 nie ma jej ani w `sitemap-index.xml`, ani w `robots.txt` — Google nie odkryje jej sam.

**Rezerwa, którą widać w danych.** 364 huby są „o włos" od indeksu: spełniają dwa z czterech warunków, więc wystarczy jeden. Rozkład brakujących warunków (każdy hub ma dwie możliwe drogi): wzmianka w naszym tekście — 357, świeża premiera — 278, trzeci sklep — 91, dłuższy opis — 2. Wniosek praktyczny: **wzmianka w tekście to najtańsza gałka.** Jeden porządny artykuł zestawieniowy linkujący 30–40 hubów przenosi 30–40 stron z `noindex` do sitemapy — a najdroższe pozycje z tej listy to Star Trek Enterprise (1 999,99 zł), Orient Express (1 949 zł), Ninjago Stare Miasto (1 539,99 zł), Main Street U.S.A. (1 499,99 zł) i statek Jacka Sparrowa (1 419,69 zł).

---

## Znalezisko tygodnia: 98 zestawów niewidocznych dla indeksu tekstów

Podczas liczenia hubów wyszedł błąd, którego nie widać z zewnątrz, bo nic się nie wywala — funkcja po cichu zwraca pustkę.

**Objaw.** Wszystkie 14 prezentowników serii zapisanych jako `.astro` (`lego-icons`, `lego-star-wars`, `lego-harry-potter`, `wedlug-budzetu` i pozostałe) raportują **zero zestawów** w indeksie `src/lib/teksty.js`. Prezentowniki w markdownie raportują swoje zestawy normalnie.

**Przyczyna, potwierdzona wprost w buildzie.** `zAstro()` czyta źródło strony przez `readFileSync(new URL(sciezka, import.meta.url))`. Przy budowaniu moduł jest już zbundlowany do `dist/pages/…mjs`, więc ścieżka rozwija się na `dist/pages/prezentowniki/lego-icons.astro` — plik, który nie istnieje. `readFileSync` rzuca `ENOENT`, `catch` łyka wyjątek, treść zostaje pustym stringiem i żaden numer zestawu nie zostaje rozpoznany. Sonda w buildzie: `tekstyOZestawie('10311')` → 0, `wPrezentowniku('10311')` → `false`, mimo że 10311 jest wypisany wprost w `lego-icons.astro`.

**Skutek.** 98 unikalnych zestawów wymienionych w prezentownikach jest dla serwisu niewidocznych. Nie dostają wyjątku „jest w prezentowniku", nie zaliczają warunku C, nie pojawiają się w blokach „Przeczytaj też" i w powiązaniach. 23 z tych 98 hubów ma dziś przez to `noindex` — a są wśród nich najwyższe koszyki w katalogu: Sokół Millennium UCS (2 799 zł), Venator (2 265,24 zł), Barka Jabby (1 970,06 zł), Dom Creelów (974,63 zł), Wielka Sala Hogwartu (909,98 zł). Innymi słowy: strony budowane pod najwyższą intencję zakupową linkują do stron, które sami wypisaliśmy z indeksu.

**Poprawka — sprawdzona, nie proponowana.** Zamiast czytać plik z dysku, wziąć źródło przez surowy glob Vite, który działa w buildzie. W `src/lib/teksty.js`:

```js
const astro = import.meta.glob('../pages/prezentowniki/*.astro', { eager: true });
const astroZrodla = import.meta.glob('../pages/prezentowniki/*.astro',
  { eager: true, query: '?raw', import: 'default' });
```

a w `zAstro()` zamienić blok `try { readFileSync(...) } catch {}` na:

```js
const surowy = astroZrodla[sciezka] ?? '';
```

Import `readFileSync` przestaje być potrzebny.

**Zmierzony efekt po nałożeniu poprawki i przebudowaniu** (zmiana została po pomiarze wycofana — Kontroler nie pisze do repo):

| Miara | Przed | Po |
|---|---|---|
| Huby indeksowalne | 723 | **746** |
| Wyjątek „prezentownik" | 45 | 133 |
| `sitemap-zestawy.xml` | 723 | 746 |
| `sitemap-priorytet.xml` | 769 | 782 |
| Razem w `sitemap-index.xml` | 832 | **855** |
| Zestawy z `.astro` rozpoznane | 10 z 98 | 98 z 98 |

Poza liczbami wracają też bloki „Przeczytaj też" i powiązania dla tych 98 zestawów — czyli linkowanie wewnętrzne w obie strony, o które chodziło przy przebudowie z 09.09.

---

## Trzy decyzje na ten tydzień

**1. Przywrócić poświadczenia odczytu w środowisku Kontrolera.** `CF_ACCOUNT_ID` i `CF_API_TOKEN` (token z uprawnieniem „Account Analytics: Read") oraz `GSC_KEY_JSON_B64`. Bez nich raport tygodniowy nie mierzy ani kliknięć, ani EPC, ani widoczności, ani indeksacji — czyli czterech z pięciu rzeczy, po które istnieje. To jest kilkanaście minut pracy i odblokowuje wszystko pozostałe, łącznie z odczytem liczników sitemap zaplanowanym na 23–30.09. Przy okazji warto dorzucić `GH_PUSH_TOKEN`, żeby przebieg mógł wypchnąć plik danych, gdy analiza go zmieni.

**2. Wdrożyć poprawkę indeksu tekstów i domknąć dwa martwe linki.** Poprawka `.astro` jest sprawdzona i daje +23 huby w sitemapie od ręki, w tym najdroższe zestawy w katalogu. Przy tej samej okazji: dopisać 22 brakujące wpisy Media Expertu do `redirects.json` (prowizja 2%, dziś przepada) i dodać LEGO.com szablon `szukaj` w `sklepy.json`, żeby kliknięcia z 222 ofert nie wracały na naszą stronę główną — prowizji z tego nie będzie, dopóki nie mamy Rakutena, ale przestaniemy odsyłać czytelnika donikąd.

**3. Odblokować kadencję publikacji albo świadomie przesunąć termin.** Trzy teksty w tygodniu wobec planu trzydziestu to nie jest wahnięcie, to zatrzymanie. Prezentowniki sezonowe mają być w Google do połowy października; zostało pięć tygodni. Decyzja jest binarna: albo redakcja wraca do 4–5 tekstów dziennie (sprawdzić, czy sesja „czubek kolejki" z 4.09 jeszcze żyje), albo przyjmujemy, że sezon 2026 jest próbą generalną — tak jak mówi `strategia-tresci.md` — i przestajemy rozliczać grudzień z 20 000 zł.

---

Źródła liczb: build produkcyjny z 14.09.2026 (`npx astro build`, 4 573 strony), pliki `src/data` z `main` @ `1bd73f9`, `materialy/strategia-tresci.md`, `DZIENNIK.md`, `RUNBOOK.md`, `src/data/afiliacje_rejestr.json`. Kliknięcia, EPC i dane Search Console: niedostępne w tym przebiegu.
