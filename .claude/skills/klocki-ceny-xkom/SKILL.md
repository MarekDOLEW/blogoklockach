---
name: klocki-ceny-xkom
description: 'Cykliczny zrzut cen zestawów LEGO z x-kom.pl dla serwisu tylkoklocki.pl. Używaj ZAWSZE, gdy zadanie cykliczne każe odświeżyć ceny x-kom, albo gdy użytkownik prosi o - zrzut x-kom, odśwież ceny x-kom, aktualizacja cen z x-komu, scraping katalogu LEGO w x-kom, plik lego-xkom.json, ceny x-kom do porównywarki. Triggeruj też przy frazach "przeleć x-kom", "zbierz ceny z x-komu", "xkom ceny". Skill przechodzi katalog LEGO na x-kom.pl przez lokalną przeglądarkę użytkownika (x-kom blokuje ruch serwerowy i nie daje feedu), buduje lego-xkom.json w ustalonym schemacie (z dostępnością) i przekazuje plik do Claude Code jako załącznik w rozmowie z repo; import do danych serwisu robi scripts/xkom-import.mjs, linki scripts/xkom-redirects.mjs.'
---

# Ceny x-kom — cotygodniowy zrzut katalogu LEGO

## Po co ten skill

Serwis tylkoklocki.pl ma z x-kom afiliację (SalesMasters, program własny grupy
x-kom, kod uniwersalny konta doklejany do adresu), ale **x-kom nie daje feedu
produktowego i blokuje ruch serwerowy** (curl, WebFetch, przeglądarka z data
center dostają 403). Do 23.09.2026 serwis nie miał ani jednej ceny x-kom —
sklep był w tabelach tylko jako link „Sprawdź cenę". Jedyną drogą jest
**lokalna przeglądarka użytkownika** sterowana z Coworka, dokładnie tak jak
przy Empiku (skill `klocki-ceny-empik`). Rytm docelowy: **raz w tygodniu**,
najlepiej tego samego dnia co Empik, jeden po drugim.

Różnica wobec Empiku: x-kom pokazuje cenę także przy produkcie **niedostępnym**
(„Niedostępny", „Czasowo niedostępny", „Zapytaj o dostępność"). Dlatego zrzut
niesie pole `available`, a import odrzuca pozycje niedostępne — nie pokazujemy
ceny, której nie da się zrealizować.

Liczby odniesienia: **brak — pierwszy przebieg je ustala.** Po pierwszym
przebiegu podaj Code liczby (pozycji, unikalnych numerów, mediana ceny,
udział dostępnych) — Code wpisze je do tego skilla jako odniesienie dla
kolejnych przebiegów.

## Procedura

1. **Wejdź przez lokalną przeglądarkę użytkownika** (narzędzie sterowania
   Chrome). Katalog: na x-kom.pl kategoria **Zabawki → Klocki LEGO** (albo
   wyszukiwarka `LEGO` z filtrem producenta „LEGO" — wybierz to, co daje
   listing ze wszystkimi zestawami; adres kategorii wpisz do `meta.catalogUrl`,
   żeby kolejne przebiegi startowały od razu). Paginacja do ostatniej strony
   (`?page=N`, ~30 pozycji na stronę). Nie loguj się, nie dodawaj niczego do
   koszyka. Jeśli listing pozwala ustawić „pokaż 60/90 na stronie" — użyj.

   Sprawdź, czy listing nie ucina się przy pewnej liczbie stron (Empik ucinał
   po ~4 860 pozycjach). Porównaj liczbę zebranych pozycji z licznikiem
   produktów w nagłówku kategorii; gdy się nie zgadzają, przejdź katalog
   drugi raz w innym sortowaniu (cena rosnąco / malejąco) i połącz wyniki po
   numerze zestawu.

2. **Z każdego kafelka na listingu zbierz:**
   - pełną nazwę produktu,
   - **adres karty produktu** (`href` kafelka, pole `url`) — pełny,
     bezwzględny, bez parametrów; adres x-kom ma postać
     `https://www.x-kom.pl/p/<id>-<slug>.html`, gdzie `<id>` jest stałe,
   - aktualną cenę,
   - cenę przekreśloną / „najniższa cena z 30 dni" — tylko gdy produkt jest
     w promocji (pole `priceRegular`),
   - **dostępność** (`available`): `true` tylko gdy kafelek mówi „Dostępny" /
     „W magazynie" / podaje termin wysyłki; `false` przy „Niedostępny",
     „Czasowo niedostępny", „Zapytaj o dostępność", „Produkt wycofany".
     Jeśli listing w ogóle nie pokazuje dostępności — ustaw `available: null`
     i napisz to wprost przy oddaniu pliku (import potraktuje `null` jak
     dostępny, a Code zdecyduje, czy dokładać wejścia na karty).
   Nie wchodź w podstrony produktów — wszystko jest na listingu; setki
   dodatkowych wejść niepotrzebnie obciążają przeglądarkę użytkownika.

   **Po co adres.** Link w serwisie to adres karty + uniwersalny kod
   SalesMasters (`?sm=…`) — dokleja go skrypt `xkom-redirects.mjs`, nie Ty.
   **Nigdy nie oddawaj adresów z kodem ani z parametrami** — surowy adres karty.
   Bez wpisu w `redirects.json` worker kieruje na wyszukiwarkę x-kom z kodem,
   więc pozycja bez `url` nie psuje afiliacji, tylko wydłuża drogę klienta.

3. **Numer setu**: pierwszy ciąg 4–7 cyfr z nazwy produktu, z pominięciem
   lat (1900–2099) i liczb, po których następuje „elementów/elementy/el./szt."
   Numery z **zerem wiodącym odrzucaj**. Bez numeru → pomiń pozycję (typowo
   akcesoria: breloki, lampki, gablotki). Duplikaty numeru → zostaw
   **najniższą** cenę spośród dostępnych; gdy wszystkie są niedostępne —
   najniższą niedostępną z `available: false`.

4. **Zapisz `lego-xkom.json`** dokładnie w tym schemacie (import na nim
   polega — nie zmieniaj nazw pól):

   ```json
   {
     "meta": {
       "source": "x-kom.pl (oferta własna sklepu)",
       "scrapedAt": "RRRR-MM-DD",
       "currency": "PLN",
       "catalogUrl": "https://www.x-kom.pl/…",
       "priceType": "aktualna cena na listingu; priceRegular = cena przekreślona / najnizsza z 30 dni, gdy produkt jest w promocji; available = dostepnosc z listingu",
       "productsTotal": 0,
       "available": 0,
       "withPromo": 0
     },
     "products": [
       { "setNumber": "43014", "name": "LEGO Editions 43014 Kask Charles Leclerc Scuderia Ferrari HP", "url": "https://www.x-kom.pl/p/1517900-klocki-lego-lego-editions-43014-kask-charles-leclerc-scuderia-ferrari-hp.html", "price": 249.90, "priceRegular": 286.90, "available": true }
     ]
   }
   ```
   `priceRegular` tylko przy promocji; pozostałe pola zawsze. Pozycję bez
   `url` zapisz mimo wszystko — cena jest ważniejsza niż link.

5. **Kontrola jakości przed oddaniem pliku** — wszystkie muszą przejść
   (progi wstępne; po pierwszym przebiegu Code je zawęzi):
   - liczba produktów w przedziale **300–2 000**,
   - mediana ceny w przedziale **100–450 zł**,
   - zero cen ≤ 0 i zero cen > 20 000 zł,
   - udział pozycji odrzuconych z braku numeru poniżej **15%**,
   - udział pozycji z wypełnionym `url` powyżej **95%**,
   - udział `available: true` podaj wprost (odniesienie: brak — pierwszy
     przebieg; gdy jest poniżej 50%, sprawdź, czy selektor dostępności nie
     łapie złego elementu).
   Jeśli coś nie przechodzi — nie oddawaj pliku; napisz, co się nie zgadza
   (najczęściej: x-kom zmienił układ listingu i selektor łapie nie te elementy).

6. **Przekaż plik do Code** (załącznik w rozmowie Claude Code z repo) z notką:

   > zrzut x-kom z RRRR-MM-DD — do importu: `node scripts/xkom-import.mjs
   > lego-xkom.json --sucho`, potem bez `--sucho`, potem
   > `node scripts/xkom-redirects.mjs lego-xkom.json --usun-martwe`,
   > build i push. Liczby z kontroli jakości: …

   Reguły importu (gadżety, obce marki, numer 4–7 cyfr, konflikt numeru z nazwą,
   próg sanity 40% ceny katalogowej, tylko zestawy z hubem, świeżość
   nadrzędna, `available: false` odpada, `daty.xkom` z `meta.scrapedAt`) są
   **w skrypcie** `scripts/zrzut-import.mjs` (wspólnym z Empikiem). **Nie rób
   importu ręcznie.**

## Czego NIE robić

- **Nie licz rabatów od `priceRegular`** — to cena odniesienia sklepu, nie cena
  katalogowa LEGO. Rabaty liczy import od RRP z danych serwisu.
- **Nie filtruj gadżetów ani obcych marek** — robi to import jedną listą dla
  wszystkich zrzutów. Twój plik ma być surowym zrzutem.
- **Nie zmieniaj schematu pliku** ani nazw pól.
- **Nie doklejaj kodu partnerskiego do adresów** — robi to skrypt; zrzut ma
  czyste adresy kart.
- **Nie scrapuj częściej niż raz w tygodniu** i nie równolegle z innym
  zadaniem korzystającym z przeglądarki użytkownika (Empik idzie po x-komie
  albo przed nim, nigdy w tym samym czasie).
- Nie używaj Firecrawla ani fetchy serwerowych na x-kom.pl — 403; wyłącznie
  lokalna przeglądarka.

## Kontekst w repo

- Import i konwencje: `RUNBOOK.md` → sekcja „Ceny x-kom"; afiliacja:
  `src/data/afiliacje_rejestr.json` (SalesMasters).
- Regulamin SalesMasters zabrania „automatycznych wtyczek porównujących ceny"
  (notatka w rejestrze afiliacji z 18.08.2026). Nasza tabela to redakcyjne
  porównanie odświeżane ręcznie raz w tygodniu, tak jak przy Empiku — ale
  jeśli opiekun programu o to zapyta, tak to opisujemy; decyzję, czy
  dopytać go z wyprzedzeniem, podejmuje Marek.
- Akcje z mailingu partnera (np. Dzień Chłopaka 23–30.09.2026) wchodzą do
  danych osobno, ręcznie w sesji Code, z polem `wazne_do`; tygodniowy zrzut
  je nadpisuje — to celowe, zrzut jest świeższy.
