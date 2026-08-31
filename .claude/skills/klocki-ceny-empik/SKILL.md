---
name: klocki-ceny-empik
description: 'Cykliczny zrzut cen zestawów LEGO z empik.com dla serwisu tylkoklocki.pl. Używaj ZAWSZE, gdy zadanie cykliczne każe odświeżyć ceny Empiku, albo gdy użytkownik prosi o - zrzut Empiku, odśwież ceny Empik, aktualizacja cen z Empiku, scraping katalogu LEGO w Empiku, plik lego-empik.json, dane do porównywarki cen. Triggeruj też przy frazach "przeleć Empik", "zbierz ceny z Empiku". Skill przechodzi katalog LEGO na empik.com przez lokalną przeglądarkę użytkownika (Empik blokuje ruch serwerowy), buduje lego-empik.json w ustalonym schemacie i przekazuje plik do sesji Łowcy Promocji, która importuje go do danych serwisu.'
---

# Ceny Empik — cotygodniowy zrzut katalogu LEGO

## Po co ten skill

Serwis tylkoklocki.pl pokazuje ceny Empiku w tabelach porównania cen
(`oferty_feed.json`, klucz `empik`). Empik **blokuje ruch serwerowy**
(curl, WebFetch i przeglądarka z data center dostają blokadę anty-botową),
więc jedyną drogą jest **lokalna przeglądarka użytkownika** sterowana z
Coworka. Bez cyklicznego odświeżania ceny w serwisie starzeją się i wiersz
Empiku trzeba by wyłączyć — rytm docelowy to **raz w tygodniu**.

Liczby odniesienia do kontroli jakości (zrzut 31.08.2026): ~200 stron
katalogu po ~60 pozycji, 8 404 oferty, 5 376 unikalnych numerów,
mediana ~220 zł.

## Procedura

1. **Wejdź przez lokalną przeglądarkę użytkownika** (narzędzie sterowania
   Chrome). Katalog: wyszukiwarka Empiku dla frazy „LEGO" zawężona do
   kategorii klocków (`https://www.empik.com/szukaj/produkt?q=lego` +
   filtr kategorii Zabawki → Klocki), paginacja do ostatniej strony
   (~200 stron po ~60 pozycji). Nie loguj się, nie dodawaj niczego
   do koszyka.

   **UWAGA — sortowanie domyślne się zapętla**: po ~4 000 setów kolejne
   strony zaczynają powtarzać te same produkty i pełnego katalogu nie
   widać. Przejdź katalog **dwa razy: z `sort=priceAsc` i z
   `sort=priceDesc`**, a wyniki połącz po numerze setu — dopiero suma obu
   przebiegów pokrywa całość (ustalenie z przebiegu 31.08.2026).

2. **Z każdej karty produktu na listingu zbierz:**
   - pełną nazwę produktu,
   - najtańszą aktualną cenę oferty,
   - „cenę regularną" (omnibus) — tylko gdy produkt jest oznaczony jako
     promocja,
   - do pola `offers` — liczbę **różnych wariantów oferty** znalezionych
     dla danego numeru (Empik nie pokazuje już na listingu etykiety
     „X ofert", więc to przybliżenie, nie licznik sprzedawców).
   Nie wchodź w podstrony produktów — wszystko jest na listingu, a setki
   dodatkowych wejść niepotrzebnie obciążają przeglądarkę użytkownika.

3. **Numer setu**: pierwszy ciąg 4–7 cyfr z nazwy produktu, z pominięciem
   lat (1900–2099) i liczb, po których następuje „elementów/elementy/el./szt."
   Numery z **zerem wiodącym odrzucaj** (np. `0002198` z listingów
   magazynów — LEGO nie ma takich numerów; bez tego filtra wchodzi
   ~100 śmieciowych pozycji). Bez numeru → pomiń pozycję (typowo ~7%
   ofert; głównie akcesoria). Duplikaty numeru → zostaw **najniższą**
   cenę, zsumuj liczbę wariantów w `offers`.

4. **Zapisz `lego-empik.json`** dokładnie w tym schemacie (import Łowcy
   na nim polega — nie zmieniaj nazw pól):

   ```json
   {
     "meta": {
       "source": "empik.com (oficjalna oferta Empik + sprzedawcy marketplace)",
       "scrapedAt": "RRRR-MM-DD",
       "currency": "PLN",
       "priceType": "najtansza aktualna oferta na listingu; priceRegular = 'cena regularna' (omnibus) gdy produkt jest w promocji",
       "productsTotal": 0,
       "withPromo": 0,
       "offersTotal": 0
     },
     "products": [
       { "setNumber": "10280", "name": "LEGO Icons, Bukiet kwiatów, 10280", "price": 199.99, "priceRegular": 249.99, "offers": 3 }
     ]
   }
   ```
   `priceRegular` tylko przy promocji; pozostałe pola zawsze.

5. **Kontrola jakości przed oddaniem pliku** — wszystkie cztery muszą przejść:
   - liczba produktów w przedziale **4 000–6 500** (odniesienie: 5 376),
   - mediana ceny w przedziale **150–300 zł** (odniesienie: ~220 zł),
   - zero cen ≤ 0 i zero cen > 20 000 zł,
   - udział pozycji odrzuconych z braku numeru poniżej **15%**.
   Jeśli coś nie przechodzi — nie oddawaj pliku; napisz, co się nie
   zgadza (najczęściej: Empik zmienił układ listingu i selektor łapie
   nie te elementy).

6. **Przekaż plik do sesji „Łowca Promocji"** (wgraj `lego-empik.json`
   w jej czacie z notką „zrzut Empiku z RRRR-MM-DD — do importu").
   Import po stronie Łowcy jest ustalony: filtry anty-gadżetowe, próg
   sanity 40% ceny katalogowej, aktualizacja `oferty_feed.json` (klucz
   `empik`) i minimów w `ceny_baza.json`, commit i push. **Nie rób tego
   importu samodzielnie** — rozjedziesz się z jego regułami wykluczeń.

## Czego NIE robić

- **Nie licz rabatów od `priceRegular`** — to omnibusowa cena odniesienia
  sklepu, nie cena katalogowa LEGO. Rabaty w serwisie liczy się wyłącznie
  od RRP z `ceny_baza.json` i robi to import Łowcy.
- **Nie filtruj gadżetów** (breloki, gablotki, pościel…) — celowo robi to
  import po stronie Łowcy, żeby jedna lista wykluczeń obowiązywała dla
  wszystkich sklepów. Twój plik ma być surowym zrzutem.
- **Nie zmieniaj schematu pliku** ani nazw pól — import się na nim opiera.
- **Nie scrapuj częściej niż raz w tygodniu** i nie równolegle z innym
  zadaniem korzystającym z przeglądarki użytkownika.
- Nie używaj Firecrawla ani fetchy serwerowych na empik.com — blokada
  anty-botowa; wyłącznie lokalna przeglądarka.

## Kontekst w repo

- Import i konwencje: `RUNBOOK.md` → sekcja „Ceny Empik".
- Ten sam obieg dotyczy zrzutów `lego-smyk.json` i
  `lego-pl-katalog-pelny.json` — jeśli użytkownik prosi o „komplet do
  porównywarki", odśwież wszystkie trzy tą samą metodą (Smyk i lego.pl
  mają własne listingi, schemat pliku analogiczny).
