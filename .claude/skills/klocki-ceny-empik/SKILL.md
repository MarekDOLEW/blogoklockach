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
   - **adres karty produktu** (`href` z kafelka, pole `url`) — pełny,
     bezwzględny, bez parametrów śledzenia; adres Empiku ma w środku
     stabilne ID produktu (`…,pXXXXXXXXX,…`) i nie zmienia się w czasie,
     w odróżnieniu od ceny,
   - najtańszą aktualną cenę oferty,
   - „cenę regularną" (omnibus) — tylko gdy produkt jest oznaczony jako
     promocja,
   - do pola `offers` — liczbę **różnych wariantów oferty** znalezionych
     dla danego numeru (Empik nie pokazuje już na listingu etykiety
     „X ofert", więc to przybliżenie, nie licznik sprzedawców).
   Nie wchodź w podstrony produktów — wszystko jest na listingu (adres też,
   jako `href` kafelka), a setki dodatkowych wejść niepotrzebnie obciążają
   przeglądarkę użytkownika.

   **Po co adres.** Do 14.09.2026 `/idz/empik/<nr>` prowadził na wyszukiwarkę
   Empiku, bo feed Tradedoublera nie zawiera zestawów LEGO (weryfikacja na
   pełnym pliku 2,5 GB, 19.08) i nie było skąd wziąć adresów kart. Z polem
   `url` serwis kieruje wprost na produkt. Afiliacja działa bez zmian: prowizję
   liczy deeplink `clk.tradedoubler.com`, a adres produktu jest w nim tylko
   parametrem `url=`. **Nigdy nie linkujemy do Empiku bezpośrednio** — bez
   deeplinku prowizja przepada.

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
       { "setNumber": "10280", "name": "LEGO Icons, Bukiet kwiatów, 10280", "url": "https://www.empik.com/lego-icons-bukiet-kwiatow-10280,p1234567890,zabawki-p", "price": 199.99, "priceRegular": 249.99, "offers": 3 }
     ]
   }
   ```
   `priceRegular` tylko przy promocji; pozostałe pola zawsze. Pozycję bez
   `url` zapisz mimo wszystko — cena jest ważniejsza niż link, a import
   zostawi dla niej dotychczasowe kierowanie na wyszukiwarkę.

5. **Kontrola jakości przed oddaniem pliku** — wszystkie cztery muszą przejść:
   - liczba produktów w przedziale **4 000–6 500** (odniesienie: 5 376),
   - mediana ceny w przedziale **150–300 zł** (odniesienie: ~220 zł),
   - zero cen ≤ 0 i zero cen > 20 000 zł,
   - udział pozycji odrzuconych z braku numeru poniżej **15%**,
   - **udział pozycji z wypełnionym `url` powyżej 90%** — niżej znaczy, że
     selektor nie łapie `href` kafelka (nowość od 14.09.2026; przy pierwszym
     przebiegu podaj tę liczbę wprost, nawet jeśli przechodzi).
   Jeśli coś nie przechodzi — nie oddawaj pliku; napisz, co się nie
   zgadza (najczęściej: Empik zmienił układ listingu i selektor łapie
   nie te elementy).

6. **Przekaż plik do Code** (załącznik w rozmowie Claude Code z repo) albo do
   sesji „Łowca Promocji" z notką:

   > zrzut Empiku z RRRR-MM-DD — do importu: `node scripts/empik-import.mjs
   > lego-empik.json --sucho`, potem bez `--sucho`, potem
   > `node scripts/empik-redirects.mjs lego-empik.json --usun-martwe`,
   > build i push.

   Reguły importu (filtry gadżetów, numer 4–7 cyfr, konflikt numeru z nazwą,
   próg sanity 40% ceny katalogowej, świeżość nadrzędna, `daty.empik` z pola
   `meta.scrapedAt`) są **w skrypcie** `scripts/empik-import.mjs` — od
   16.09.2026 nie zależą od pamięci żadnej sesji. **Nie rób importu
   ręcznie** — rozjedziesz się z regułami skryptu.

## Czego NIE robić

- **Nie licz rabatów od `priceRegular`** — to omnibusowa cena odniesienia
  sklepu, nie cena katalogowa LEGO. Rabaty w serwisie liczy się wyłącznie
  od RRP z `ceny_baza.json` i robi to import Łowcy.
- **Nie filtruj gadżetów** (breloki, gablotki, pościel…) — celowo robi to
  `scripts/empik-import.mjs`, żeby jedna lista wykluczeń obowiązywała dla
  wszystkich zrzutów. Twój plik ma być surowym zrzutem.
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
