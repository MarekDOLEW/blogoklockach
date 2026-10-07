# Audyt mechanizmu tylkoklocki.pl — przebieg 2 (15.09.2026, po południu)

*Trzy równoległe przeglądy (przepływ danych runnerów, SEO i UX, pipeline redakcyjno-sprzedażowy i konkurencja) na stanie repo `ef836e7`, plus własne odczyty: diagnoza środowiska (12/12 zmiennych, 8/8 dostępów OK, Firecrawl 268 kredytów), Search Console (28 dni: 8 kliknięć, 263 wyświetlenia, pozycja 17,7), kliknięcia ludzkie w /idz/ (7 dni: 41), produkcja (robots, sitemapy, dane strukturalne huba). Poprzedni audyt: `materialy/audyt-mechanizmu-2026-09-15.md` — bilans jego 19 punktów: zrobione 7, częściowo 2, wisi 10.*

## 0. Werdykt w pięciu zdaniach

Mechanizm techniczny jest dziś spójny w tym, co robi codziennie: ceny wchodzą, huby się budują, worker działa, dane nie maleją. Trzy rzeczy były jednak zepsute po cichu i zostały dziś naprawione: **hub obiecywał w Google cenę Ceneo, której tabela nie pokazuje** (737 hubów, 53% indeksowalnych), **eksport skilli nie uruchamiał się od 08:19** (skill mówił odwrotnie niż decyzja Marka), a **alerty cenowe liczyły cenę katalogową inaczej niż hub** (3 209 zestawów bez alertu). Największe dziury nie są w kodzie, tylko w **przepływie decyzji do runnerów**: ustalenia zapisane w DZIENNIKU nie docierają do promptów (Kontroler nie wiedział o hubach i 404, Łowca nie zna Empiku, Ceneo nie ma właściciela), a pola danych, które ktoś zapisuje, nikt nie czyta (`lego_pl_widziano`, `status_nowosci`). Po stronie przychodu jeden fakt przebija wszystko: **Empik — jedyny sklep ze zmierzoną transakcją — ma 3 968 cen i zero linków produktowych**. Po stronie treści: kadencja 3 teksty/tydzień przy planie 30, zero tekstów pod święta i Black Friday, 8 kart researchu na 21 artykułów.

## 1. Naprawione w trakcie audytu (na `main`, commity 497043e → ef836e7)

| # | Co | Skutek |
|---|---|---|
| 1 | Cena w title/meta/JSON-LD huba liczona bez Ceneo; `offers.url`; `Product.description` z karty | 737 hubów przestało obiecywać w Google cenę niższą niż na stronie (najpewniejsza przyczyna 0% CTR na pozycjach 7–12); Product na 714 hubach ma opis |
| 2 | `SearchAction` strony głównej → `/szukaj/` | sitelinks searchbox nie wyśle już na listę wycofań |
| 3 | `eksport-skilli.mjs`: błąd składni (niezaescapowane backticki z 08:19), usunięte zdanie „pomijanie normalnego poziomu rynkowego jest błędem"; skille wyeksportowane i spakowane; `prebuild` sprawdza składnię eksportu | skill mówi to samo co decyzja z 15.09; paczki `.skill` wysłane Markowi |
| 4 | `alerty-cen.mjs`: kolejność źródeł RRP jak hub (rejestr → sety → baza → katalog), oferty starsze niż 2 dni pomijane, data w mailu | koniec „3 209 zestawów bez alertu, 6 z zawyżonym rabatem"; mail nie pisze „dziś" o cenie sprzed tygodnia |
| 5 | `scripts/json-kolejnosc.mjs` — wspólny zapis `sety.json`/`oferty_feed.json` z kolejnością kluczy i formatem pliku; używają go `lego-ceny.mjs` i `ceneo-feed.mjs` | `ceneo-feed.mjs` przestał przepisywać 1,7 MB pliku z posortowanymi kluczami (40 tys. linii diffu na przebieg) |
| 6 | `ceneo-feed.mjs`: data w `daty.ceneo`, wspólna data wpisu nieruszana | 1 426 wierszy Ceneo i cudze wiersze nie dostaną fałszywej daty |
| 7 | `lego-ceny.mjs`: zestaw „dostepny" nieobecny na listingu >14 dni → `eol` (reguła Marka: archiwalne = brak na lego.pl); raport nigdy niewidzianych (dziś 118) | status przestaje być monotonicznie rosnący |
| 8 | `diagnoza.mjs`: `RESEND_API_KEY`, `GH_PUSH_TOKEN` na liście (14/14) | Łowca nie zobaczy „komplet" tuż przed „brak RESEND_API_KEY" |
| 9 | `sharp` jako zadeklarowana zależność; `routines.json` w `.gitignore`; `huby.js` bez importu 4 MB `karty_setow.json` i z ochroną `_meta` w redirects | R2 nie padnie na optional dependency; Kontroler nie wypchnie ID sesji do publicznego repo |
| 10 | Generator harmonogramu: „utworzony <data>, bez przebiegu" zamiast „nigdy nie odpalony" dla triggerów młodszych niż 7 dni | 7 fałszywych alarmów mniej po każdym delete+create |
| 11 | Prompt Kontrolera (zmieniony na koncie): repo najpierw, `routines.json` w /tmp, commit obu generowanych plików, liczba hubów i sitemapy co tydzień, inspekcja 8 adresów przez URL Inspection API, bez bezwartościowego pola „zindeksowane", sekcja „Zadania bez właściciela" (Radar, sygnały Scouta), sprawdzanie runnerów po commitach | ustalenia z DZIENNIKA z 15.09 wreszcie są w promptcie |

## 2. Krytyczne — otwarte, wymagają Marka

1. **`/obserwuj` bez limitu zapytań.** Honeypot i regex e-maila to jedyne zabezpieczenia; skrypt w pętli wyśle maile „Potwierdź alerty" na cudze adresy z naszej domeny, aż Resend zablokuje konto (i nadawcę raportów). Naprawa: licznik per IP i per e-mail w R2 (3/godz., 10/dobę) + sprawdzenie nagłówka `Origin` — zmiana w workerze, więc czeka na „tak".
2. **Empik: 3 968 cen, 0 deeplinków.** `redirects.json` nie ma klucza `empik`; każdy klik idzie na wyszukiwarkę. Jedyny sklep ze zmierzoną transakcją (13.09, 2,74%). Prompt Łowcy nie zawiera słowa „Empik" — zadanie żyje tylko w treści przypominajki. Naprawa: zrzut Marka → `empik-redirects.mjs` w sesji Łowcy + wpis do promptu Łowcy (stała sesja = delete+create).
3. **Prompty czterech Routine z panelu** (LEGO.pl, Alerty, Zdjęcia → R2, Empik) wymagają poprawek, których z sesji nie da się wprowadzić (API odmawia edycji Routine założonych w panelu): klon repo gdy brak katalogu, `checkout -B` zamiast detached HEAD, diagnoza i FIRECRAWL_KEY/TD_TOKEN w LEGO.pl, bramka na liczbę ZESTAWÓW (nie pozycji), `katalog-z-rebrickable`, Ceneo co tydzień w LEGO.pl (dziś nikt go nie uruchamia — ceny Ceneo stoją na 14.09), `generuj-obrazy.mjs` przed buildem, nazwy zgodne z cronem (04:30, 05:30, 08:15). Gotowe teksty: plik `prompty-do-wklejenia-2026-09-15.txt` na czacie.
4. **Prompt Łowcy** (stała sesja) ma trzy dziury: brak Empiku (pkt 2); „sety nieobecne w feedach: usuń oferty" bez ochrony klucza `empik` (chronione są tylko `ceneo` i `lego`); „gałąź allegro ODŚWIEŻAJ" łamie append-only z CLAUDE.md (5 016 wpisów przepisywanych codziennie, pusty feed wymazałby gałąź). Do tego `generuj-obrazy.mjs` przed commitem, żeby nowe zdjęcia weszły do `obrazy.json` tego samego dnia, a nie we wtorek. Naprawa: delete+create z nowym promptem — po „tak".
5. **Katalog: 4 duplikaty numerów** (43026 Icons/Nike, 72423 Icons/Shrek, 40824 Seasonal/Looney Tunes, 77059 dwa razy w Animal Crossing). Usunięcie zmniejsza liczbę wpisów o 4, więc łamie literę append-only — potrzebna zgoda; walidację „wpisy = unikalne numery" dopiszę do skryptów piszących katalog.
6. **Statusy z Rebrickable:** 1 443 z 1 523 dopisanych zestawów ma `eol` nadane bez sprawdzenia, a `status.js` traktuje to jako fakt o producencie; 4 835 zestawów ma `eol` i jednocześnie ofertę sklepu. Po dzisiejszej zmianie listing lego.pl jest arbitrem (co jest na listingu → dostepny; co zniknie na 14 dni → eol), więc błąd zamyka się sam w ciągu 2–3 tygodni dla zestawów widzianych na lego.pl. Zestawy, których lego.pl nigdy nie pokazał (stare), zostają `eol` — i to jest zgodne z regułą Marka. Do decyzji: czy na listingach etykieta ma brzmieć „EOL – koniec produkcji w LEGO" (twierdzenie o producencie), czy ostrożniej „brak w LEGO.com".

## 3. Przepływ danych: runnery → pliki → strona

**Co działa (sprawdzone dziś):** 11 Routine, 0 kolizji minut startu po przestawieniu LEGO.pl na 05:30; 14/14 zmiennych, 8/8 dostępów; feed 8 255 zestawów, 949 cen LEGO.com z datą, 9 363 huby i 0 martwych linków; worker `/obserwuj` przetestowany na produkcji; prompty i harmonogram generowane z konta (Kontroler, poniedziałek).

**Dziury i sprzeczności (poza sekcją 2):**
- **Kanał decyzji → runner nie istnieje.** Ustalenie „od teraz Kontroler raportuje huby i 404" (DZIENNIK 09:30) nie trafiło do promptu, dopóki audyt tego nie wykrył. Runner ze świeżą sesją czyta prompt, nie dziennik; sekcja „Ustalenia trwałe" w DZIENNIKU jest pusta. Reguła od dziś: decyzja o runnerze = zmiana promptu tego samego dnia (fresh: panel/API; stała sesja: delete+create) + jedna linijka w „Ustaleniach trwałych".
- **Pola zapisywane, przez nikogo nieczytane:** `lego_pl_widziano` (od dziś czyta go auto-EOL), `status_nowosci` przeciek/potwierdzone (Scout ma to ustawiać wg `premiery.js`, prompt Scouta o polu nie wie — 3 przecieki na 1 172 zestawy), `ekskluzyw` w katalogu vs sety (hub bierze „lub", więc wygrywa „tak").
- **`audyt-wycofan.mjs --napraw`:** RUNBOOK każe runnerowi Wycofań uruchamiać go po każdym przebiegu i twierdzi, że skrypt „sprawdza zestaw na lego.com" — prompt Wycofań go nie wywołuje, a skrypt nie robi żadnego zapytania sieciowego. Dziś: 4 zestawy z `kiedy: wycofany` przy katalogowym `dostepny`. Do promptu Wycofań (stała sesja, delete+create) i do poprawki RUNBOOK.
- **Walidacja append-only** liczy tylko wpisy: nie wykrywa duplikatów ani zniknięcia całej gałęzi (`allegro` 5 016 wpisów przeszłoby bez alarmu w `ceneo-feed`). `empik-redirects`, `wczytaj-rrp`, `smyk-ceny` nie mają jej wcale. Do zrobienia: wspólna funkcja porównująca liczbę kluczy w każdej gałęzi najwyższego poziomu.
- **Dokumentacja opisuje stan sprzed 4 Routine:** RUNBOOK „Mapa plików danych" (23.08) pomija `lego-ceny`, `katalog-z-rebrickable`, `ceneo-feed`, `rrp_potwierdzone.json`; NARZEDZIA liczy budżet Firecrawla „raz na kwartał" (realnie ~325 kredytów/mies. tygodniowo + opisy); RUNBOOK mówi, że Empik robi „cotygodniowe zadanie Coworka" (jest ręczny zrzut Marka); `scripts/README` przypisuje `ceneo-feed` Łowcy (nie uruchamia), `r2-obrazy` sesji (jest Routine). Tabela „kto pisze który plik" powinna być generowana z `grep writeFileSync/json.dump`, nie pisana.
- **Deploy Cloudflare:** komenda build nie jest nigdzie zapisana (wrangler.jsonc ma tylko `assets.directory`). Jedno spojrzenie Marka w panel → wpis w RUNBOOK.

## 4. Widoczność: indeksacja i SEO

**Fakty:** 8 kliknięć / 263 wyświetlenia w 28 dni (bez zmiany od rana — dane GSC kończą się 13.09); 307 stron w indeksie, 3 291 „wykryta – niezindeksowana"; brak backlinków; robots.txt na produkcji = repo (blokady botów treningowych są w panelu Cloudflare, nie w pliku — repo tego nie zapisuje).

**Mechanizm produkujący „wykryta – niezindeksowana":** strony serii linkują bez paginacji cały katalog — `/serie/city/` to 1,2 MB HTML, 2 201 linków, z tego 980 do hubów noindex; łącznie 8 588 z 9 363 hubów jest noindex i wszystkie są linkowane `follow`. Googlebot nowej domeny wydaje budżet na strony, które i tak wypadają. Naprawa (do decyzji, bo zmienia UX listingów): `rel="nofollow"` na linkach do hubów bez ceny + paginacja/„pokaż więcej" po 100 wierszach.

**Pozostałe (waga wysoka):** `/o-nas/` bez nazwisk, kontaktu i metodologii, a `config.js` podpisuje teksty „Piotr M." z linkiem do niej (E-E-A-T = zero; dla ChatGPT to najczęstszy powód pominięcia źródła); `sitemap-priorytet.xml` (827 adresów) poza indeksem sitemap, duplikuje sekcyjne — zdjąć z GSC i z repo; `/kolekcjoner/` — 321 znaków, 0 linków wewnętrznych, `lastmod` = dziś każdego dnia (sygnał psujący zaufanie do wszystkich `lastmod`); brak nagłówków bezpieczeństwa i `Referrer-Policy` (od tego zależy filtr `/idz/`); GA4 bez zgody przy serwisie zbierającym e-maile; `Product.availability` = InStock na 43 hubach z plakietką EOL, `highPrice` z wiersza LEGO po EOL; meta description 146–231 znaków (Google ucina ~155), sufiks „· tylkoklocki.pl" zjada 17 znaków każdego tytułu; brak `BreadcrumbList` i okruszków na `/serie/*`, `/wycofania/`, `/ekskluzywne/`; `Article` bez `image` i `publisher.logo`; brak globalnego `Organization` z `sameAs`; 216 linków `/wycofania/?q=<nr>` z hubów (każdy = 421 KB crawlu); przekierowania Astro to meta refresh, nie 301; brak `llms.txt`; 6 stron serii z <5 zestawami i `/nowosci/` dublujący trzy miesięczne listy.

## 5. UX

- **Filtr referera w `/idz/`** zawraca na ten sam hub bez słowa — w przeglądarkach kasujących referer (Focus, DuckDuckGo, część webview) przycisk „Sprawdź w sklepie" wygląda na zepsuty. 37 z 78 użytkowników przychodzi z ChatGPT, więc nietypowych klientów mamy dużo. Naprawa: `?idz=zablokowane` + komunikat z bezpośrednim linkiem, albo akceptacja `Sec-Fetch-Site: same-origin` (worker → po „tak").
- **Brak werdyktu „czy to dobra cena"** — hub daje rabat od RRP i minimum, ale nigdzie nie mówi „poniżej X zł kupuj". To jedyne miejsce, gdzie różnimy się od Ceneo. Jedno zdanie liczone z RRP i `ceny_baza`.
- **Data przy cenie** (jedyny dowód świeżości) ma kontrast 4,2:1 przy 11 px — poniżej WCAG; zmienić `opacity` na kolor.
- Disclosure pod tabelą cen ~700 znaków tuż pod przyciskiem zakupu; 404 mówi „hub"; indeks wyszukiwarki 414 KB przy pierwszym wpisaniu numeru; zdjęcie LCP bez `fetchpriority`; przyciski 39–40 px; token potwierdzenia bez terminu ważności; brak linku do polityki prywatności w stopce (139 stron).

## 6. Research → redakcja → sprzedaż

- **Kadencja:** 21 → 5 → 3 teksty w kolejnych tygodniach przy planie „30/tydz." (raport Kontrolera 14.09). Do połowy października powstanie ~15 tekstów zamiast 150.
- **Sezon XI–XII:** kalendarze adwentowe są (ranking + deal); Black Friday, prezenty świąteczne wg budżetu/wieku, wycofania grudnia — `planowane` w `plan-redakcyjny.json`, plików brak; kategoria Historyczne pusta. Google potrzebuje 6–10 tygodni — teksty muszą być do 15.10.
- **Karty researchu:** 8 na 21 artykułów, żadna nowa od 12.09; metodologia i CLAUDE.md mówią „karta przed każdym tekstem". Albo Piotr prowadzi karty poza repo (dopisać jako odstępstwo), albo reguła jest martwa.
- **Prezentowniki:** reguła „osiem zestawów" złamana w 12 z 14 (dziewięć ma dokładnie 6 — układ, który wzorzec odrzuca); 12 z 14 nieruszanych od 26.08.
- **Sprzeczności dokumentów:** dwie „zamknięte" listy kategorii (7 w `kategorie_artykulow.json` vs 6 w NARZEDZIA, plus „Deal dnia" w 5 plikach i czwarty wariant w instrukcji Piotra); instrukcje dla Claude Piotra podają wersje v1.4/v1.3 (w repo v1.7/v1.5) i każą robić snapshot z 5 sklepów, którego ustalenia zabraniają; publikacja PR vs push prosto na main (wspolpraca.md vs instrukcje Piotra); reguła nazw plików „od kategorii" stosowana w 3 z 21.
- **Deale:** progi (dobry 20–29, gorący ≥30, post ≥35%/RRP≥300, >60% Allegro do weryfikacji) istnieją tylko w promptcie Łowcy; skill sprzedażowy nie ma ani jednego procentu, kod ma tylko „gorący". Przenieść do `ustalenia-projektowe.md` i wygenerować do skilla.
- **Radar → nikt.** 11 wpisów Radaru z zadaniami dla redakcji, zero pozycji „RADAR · Do zrobienia", „Ustalenia trwałe" puste. Od dziś Kontroler zbiera „Zadania bez właściciela" do raportu; kto je skreśla — do ustalenia.

## 7. Afiliacja

| Sklep | Ofert | Deeplinków | Prowizja | Stan |
|---|---|---|---|---|
| Allegro | 5 016 | 5 016 | 1,03%, cookie 1 dzień | największa ekspozycja, najgorsza stawka, EPC = model |
| Empik | 3 968 | **0** | ~2,74% (1 transakcja) | klik na wyszukiwarkę — pkt 2 sekcji 2 |
| Ceneo | 1 426 | 1 426 | CPS „do potwierdzenia" | porównywarka; ceny stoją na 14.09 |
| Planeta Klocków | 1 155 | 1 155 | `null` | stawka nigdy niepotwierdzona (od 14.08) |
| LEGO.com | 949 | 946 | brak (Rakuten odmówił 15.09) | najdroższe zestawy linkowane za darmo; promoklocki zarabia na tym samym linku |
| Media Expert | 751 | 751 | 2,00% (API) | OK |
| Smyk | 704 | 704 | 2,10% aktywne, świadomie nieużywane | deeplink Adtraction nie dowozi na produkt |
| Egmont | 0 | — | **6% CPS** | najlepsza stawka w miksie, zero obecności |

1 650 linków (LEGO + Smyk) z definicji nie przyniesie prowizji. Trzy listy sklepów (sklepy.json 19, rejestr 17, z ofertami 7) i rejestr Piotra (priorytet: LEGO, Amazon, ME, Empik, x-kom — Amazon 0 ofert, x-kom 2 linki, Planety brak) opisują różne rynki.

## 8. Konkurencja i przecieki

**Fakty z repo:** baza konkurencji (160 wpisów, 5 serwisów PL) sama stwierdza 20.08: „tylkoklocki.pl NIE MA żadnej funkcji ani formatu, którego nie ma już ktoś inny", a 27.08: „wyścig o przecieki jest przegrany z góry — oni mają to samo źródło i szybszą kadencję". Od tego czasu doszły dwie rzeczy, których nikt z piątki nie ma w tej formie: `dla_rodzica` przy 100% zestawów i rabat liczony od RRP. Warstwa produktowa przecieków już istnieje (plakietki, `status_nowosci`, `/zapowiedzi-lego-2027/`), ale nie ma właściciela ani działu.

**Propozycja polityki przecieków (do decyzji Marka):**
1. Osobny dział `/przecieki/`; przeciek nigdy nie wchodzi do huba faktów, tabeli cen ani `Product` w danych strukturalnych.
2. Etykieta trójpolowa zamiast flagi: `{status, zrodlo, data, pewnosc}`; pewność wysoka = ≥2 niezależne serwisy (PromoBricks + StoneWars) zgodne co do numeru i ceny; średnia = jedno źródło + zdjęcie/listing sklepu; niska = jedno źródło społecznościowe. Ta sama drabina co dla prognoz wycofań, więc serwis mówi jednym językiem.
3. **Tablica trafności jako wyróżnik:** przy każdym przecieku po rozstrzygnięciu zapisujemy `potwierdzony / obalony / zmieniony`; strona pokazuje „z 40 przecieków 2026 potwierdziło się 31". Nikt z pięciu serwisów tego nie robi — to jedyna warstwa, w której nie ścigamy się kadencją, tylko rzetelnością. Standard Piotra tego nie zakazuje (§3.2: „nie ukrywać niepewności"); ryzyko jest wyłącznie w mieszaniu etykiet.
4. Przeciek nie dostaje progu zakupu ani drabiny cenowej — tylko „orientacyjnie X zł wg źródła".
5. Do rozstrzygnięcia: sitemapa i RSS od razu czy po potwierdzeniu.

**Czego grupy docelowe nie dostają:** RODZIC — stron „LEGO dla X-latka" (dane `wiek` dla 1 170 zestawów, stron 2), bezpieczeństwa/małych elementów, czasu budowy, werdyktu „czy warto", tekstów świątecznych. AFOL — historii cen (baza ma jeden punkt na zestaw od 13.08; zrzut RK z 4,9 mln wierszy czeka), minimum historycznego w sensie „historyczne", alertu EOL, „co drożeje po wycofaniu", listingu zł/klocek. Cztery formaty są gotowe po stronie danych i nie mają ani jednej strony: listingi wg wieku (12), tematyczne (hełmy 11, BrickHeadz 26, Botanicals 40, 18+ 192), top zł/klocek w serii (47), tablica trafności przecieków.

## 9. Lista: brakuje / rodzi błędy / opóźnia / ryzyko

Priorytet: **A** = ten tydzień, **B** = do 15.10, **C** = po sezonie.

| # | Co | Typ | Prio | Kto |
|---|---|---|---|---|
| 1 | Limit zapytań na `/obserwuj` + `Origin` | ryzyko | A | Code (worker → „tak") |
| 2 | Empik: zrzut → `empik-redirects.mjs`; Empik w promptcie Łowcy | brakuje (przychód) | A | Marek (zrzut), Code (prompt) |
| 3 | Wkleić 4 prompty z pliku do panelu; nazwy = godziny z crona | błąd | A | Marek |
| 4 | Łowca: delete+create (Empik, ochrona kluczy, allegro append-only, generuj-obrazy) | ryzyko | A | Code po „tak" |
| 5 | Wycofania: `audyt-wycofan.mjs` w promptcie; RUNBOOK o `--napraw` | błąd | A | Code po „tak" |
| 6 | Duplikaty katalogu (4) + walidacja unikalności | błąd | A | Marek („tak" na −4), Code |
| 7 | `/idz/`: komunikat przy odrzuceniu referera | UX | A | Code (worker → „tak") |
| 8 | `/o-nas/` z bio, kontaktem, metodologią; `Organization` + `Person` | brakuje (E-E-A-T) | A | Piotr + Marek (treść), Code |
| 9 | `nofollow` do hubów bez ceny + paginacja stron serii | crawl budget | B | Marek decyduje, Code |
| 10 | `sitemap-priorytet.xml` — zdjąć z GSC i repo; `/kolekcjoner/` — treść albo noindex | błąd | B | Marek decyduje, Code |
| 11 | Werdykt „dobra cena od X zł" na hubie; kontrast daty; disclosure w `<details>` | UX | B | Code |
| 12 | Nagłówki bezpieczeństwa (`_headers`), Consent Mode dla GA4 | ryzyko | B | Code |
| 13 | Teksty sezonowe: Black Friday, prezenty wg budżetu/wieku, wycofania grudnia — do 15.10 | brakuje | B | Piotr |
| 14 | Prezentowniki 6 → 8 zestawów (9 stron) | błąd | B | Piotr |
| 15 | Jedna lista kategorii; instrukcje Piotra v1.7/v1.5; PR vs push | sprzeczność | B | Marek + Piotr |
| 16 | Progi deali → `ustalenia-projektowe.md` → skill sprzedażowy | brakuje | B | Code |
| 17 | Listingi wg wieku, tematyczne, zł/klocek, `/przecieki/` z tablicą | brakuje | B | Code (szablony), Piotr (wstępy) |
| 18 | Historia cen z RK | brakuje | C | Marek (zrzut), Code |
| 19 | Smyk przez netSalesMedia; LEGO.com przez agregatora; stawka Planety | przychód | C | Marek |
| 20 | Egmont w prezentownikach (6%) | przychód | C | Piotr + Code |
| 21 | Mapa „kto pisze który plik" generowana; NARZEDZIA/RUNBOOK po 4 nowych Routine; komenda build z panelu CF | dokumenty | C | Code, Marek (panel) |

## 10. Pytania do Marka

1. Worker: zgoda na trzy zmiany naraz — limit na `/obserwuj`, komunikat przy odrzuconym refererze w `/idz/`, 301 dla dwóch przekierowań Astro?
2. Łowca i Wycofania: zgoda na delete+create promptów (stała sesja) z poprawkami z sekcji 2 i 3?
3. Katalog: zgoda na usunięcie 4 duplikatów (liczba wpisów spadnie z 9 363 do 9 359)?
4. Etykieta na listingach dla zestawów spoza lego.pl: „EOL – koniec produkcji w LEGO" czy ostrożniej „brak w LEGO.com"?
5. Przecieki: kierunek z sekcji 8 (dział + etykieta z pewnością + tablica trafności) — tak/nie; sitemapa i RSS od razu czy po potwierdzeniu?
6. Kategorie: obowiązuje siedem z `kategorie_artykulow.json`? „Deal dnia" legalizujemy jako ósmą wartość dla `/deale/`?
7. Karty researchu: Piotr prowadzi je poza repo? Publikacja Piotra: PR czy push prosto na main?
8. Realne minimum tekstów na tydzień do sezonu (plan 30 jest fikcją, realnie 3)?
9. Strony serii: `nofollow` do hubów bez ceny i paginacja po 100 wierszy — zgoda (zmienia wygląd listingów)?
10. `/kolekcjoner/`: treść (alert EOL + ranking zł/klocek) czy noindex do czasu?
11. Zrzut Empiku — kiedy pierwszy z linkami? Bez niego pkt 2 stoi.
12. Social: data startu kanałów? Dziś dystrybucja = Google (8 kliknięć/28 dni) + RSS.
