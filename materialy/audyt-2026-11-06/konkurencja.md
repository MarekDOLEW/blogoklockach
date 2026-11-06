# Audyt 06.11.2026 — porównanie z konkurencją

Część audytu serwisu tylkoklocki.pl. Pytania: co mają konkurenci, jak mówią do
rodzica i do dorosłego fana, czego nam brakuje, kto co robi lepiej i co z tego
wynika.

## Metoda i ograniczenia

- **Serwisy:** promoklocki.pl, zklockow.pl (porównywarki), faniklockow.pl,
  fanklockow.pl (blogi), lego.com/pl-pl (sklep producenta), pepper.pl (deale,
  tylko punkt odniesienia). Dla porównania tylkoklocki.pl.
- **fanklockow.pl istnieje** i nie jest literówką od faniklockow.pl. To osobny
  serwis: blog i narzędzia, prowadzi go YEAH! NOT. S.C., autor podpisuje się
  „Brewa”. Ma Patronite, sklep, Discorda i logowanie. faniklockow.pl należy do
  BrickInvestment Sp. z o.o. (autorzy: Piotr Księżycki, „Brick Head”, Tomasz
  Franaszek).
- **lego.pl** przekierowuje 301 na `https://www.lego.com/pl-pl/` i nie jest
  osobnym sklepem (sprawdzone curlem 06.11.2026).
- **Dostęp:** blogi i tylkoklocki przez curl, RSS i Playwright. promoklocki,
  zklockow, lego.com i pepper mają challenge Cloudflare (403 dla curla
  i headless Chromium), więc treść i zrzuty pobrałem Firecrawlem (proxy basic,
  ok. 15 kredytów z limitu 40). Nie obchodziłem zabezpieczeń.
- **Zrzuty** leżą w `zrzuty-konkurencja/` (14 plików JPEG). Każdy plik to
  1440 px i, gdzie się dało, 390 px obok siebie. Firecrawl przy 1440 px łapał
  baner cookies (promoklocki), a lego.com otwierał się na bramce wieku
  „LEGO.com / Strefa zabawy”. To też jest obserwacja, patrz sekcja 2.
- **Liczby obserwujących** w social media: żaden serwis nie pokazuje ich na
  stronie. Nie sprawdzałem ich w samych serwisach społecznościowych.
- **Brickset** nie był badany w tym przebiegu. Używamy go jako źródła ocen
  (np. 3,9/5 dla 10359 na hubie).
- Fakty historyczne o kadencji i taktykach biorę z bazy Radaru
  (`src/data/konkurencja_baza.json`, `obserwacje_strategiczne`). Zaznaczam,
  skąd pochodzą.

## 1. Tabela porównawcza

| | **tylkoklocki.pl** | **promoklocki.pl** | **zklockow.pl** | **faniklockow.pl** | **fanklockow.pl** | **lego.com/pl-pl** | **pepper.pl** (odn.) |
|---|---|---|---|---|---|---|---|
| Typ | porównywarka i redakcja | porównywarka i katalog | porównywarka i katalog | blog: newsy, okazje, inwestycje | blog, narzędzia, społeczność | sklep producenta | społeczność dealowa |
| Główne sekcje | Promocje, Nowości, Przecieki, Wycofania, Serie, Prezentowniki, Artykuły, Kalendarz, Ekskluzywy | Okazje, Promocje, Gazetki, Książki, Najtaniej w LEGO, Ostatnie w LEGO, Nowości, Kalendarz, Black Friday, EOL, Rok po roku, Tagi, Kody rabatowe, Kod GWP, Artykuły | Klocki LEGO, Nowości, Premiery (przedsprzedaż), Serie, Odkrywaj (rankingi), Dla dorosłych, Kwiaty, Akcesoria, Popularne tematy, Okolicznościowe | Aplikacja, Ebook, Newsy, Inwestycje, Ciekawostki, Wideo, Okazje | Poradniki, Narzędzia (ok. 15), Zapowiedzi, Wycofania, Info, Wspieraj, Sklep | Tematyka, Wiek, Cena, Okazje, Zainteresowania, Merch, Klocki i elementy, Insiders | grupa LEGO + podgrupy serii |
| Porównanie sklepów (10359) | **6 sklepów + LEGO.com + Ceneo** | **22 sklepy** + Amazon, BrickLink, Rebrickable | **14 ofert** + rozwinięte oferty Allegro per sprzedawca | brak (1 sklep na wpis „Okazja Cenowa”) | lista ofert z 6 sklepów w zbiorczym wpisie dnia | — | 1 oferta na wątek |
| Historia cen | tylko najniższa zanotowana (240 zł, 26.09) | najniższa z 30 dni + historyczna + wykres | najniższa z 30 dni + wykres 30 dni i 12 mies. + zmiana ceny katalogowej | — | — | — | — |
| Alert cenowy | mail per zestaw (≥20% lub nowe minimum) | mail z ceną docelową (jednorazowy) + aplikacja | alerty premier (wg Radaru) | push w przeglądarce | push w przeglądarce | — | „Ustaw alert” per seria |
| Newsletter | **nie** („bez newslettera”) | nie widać; kanały WhatsApp i Telegram | nie widać | nie widać | nie widać | tak („Zasubskrybuj biuletyn”) | tak (konto) |
| Konto | nie | nie | nie | tak (app.faniklockow.pl) | tak („Zaloguj”) | tak + Insiders | tak |
| Aplikacja | nie | Android + skaner kodu kreskowego | nie | web app: kolekcja, marketplace, inwestycje | nie | LEGO Builder, Insiders | tak |
| Social (linki) | **brak** (tylko RSS) | FB, IG, YT, TikTok, WhatsApp, Discord, Telegram, Wykop | nie widać | FB, YT | FB, YT, Discord, Patronite | — | — |
| Wideo | nie | YT + lista „Polscy LEGO Youtuberzy” | nie | sekcja Wideo | omówienia wideo (wg Radaru) | — | — |
| Kadencja | ok. 31 artykułów w 30 dni + ceny codziennie | katalog na bieżąco, artykuły rzadko | blog martwy od 17.02.2021, katalog odświeżany automatycznie | 36 wpisów w 16 dni (21.10–05.11), ok. 2,3 dziennie | ok. 10 dziennie w tygodniu (wg Radaru); 9 wpisów 05.11 | — | 219 aktywnych okazji LEGO |
| Skala katalogu | 1972 huby w sitemapie | 226 stron listingu | „tysiące zestawów” | — | — | pełna oferta | — |
| Wiarygodność | O nas: „dwójka przyjaciół z Warszawy”, kolekcja 1000+ zestawów, zasady; autor „Piotr M.” | brak „o nas”; Kontakt, Dla sklepów, Dla programistów | sekcja SEO „Dlaczego warto nam zaufać” | autorzy z imienia i nazwiska, spółka w stopce | „O serwisie”, spółka, pseudonim | marka | społeczność, temperatura |
| Monetyzacja | afiliacja, **bez reklam** | afiliacja (TD, Linksynergy, Netsales, Buybox, Amazon) + Google AdSense (lista cookies) + baner | afiliacja | afiliacja (Performers, Amazon) + reklamy | afiliacja (al.to, Allegro, Amazon, AWIN, Rakuten, TD) + reklamy displayowe + Patronite + sklep | sprzedaż | afiliacja + reklamy |

Źródła: strony główne i strony zestawu 10359 pobrane 06.11.2026; RSS
`faniklockow.pl/feed/` i `fanklockow.pl/feed/`; nasza sitemapa
`tylkoklocki.pl/sitemap-zestawy.xml`.

## 2. Kolorystyka, typografia, przekaz

### Jak wyglądają

| Serwis | Kolory | Typografia | Wrażenie |
|---|---|---|---|
| tylkoklocki | granat (#17233F) na jasnym szarym (#F6F7F9), żółty akcent, czerwone ceny, granatowe CTA | Archivo 700 w nagłówkach, systemowy sans w tekście | czysto, „konsumencko”, gęsto od liczb; zero reklam i popupów |
| promoklocki | biel i szarość, niebieski #0884B7, pomarańczowe ceny i przycisk szukania | Open-Sans-podobny, mały stopień | lista katalogowa, baner reklamowy nad logo, przełącznik motywu (ciemny) |
| zklockow | biel, granatowe pigułki CTA, niebieskie numery setów | geometryczny sans (Google-Sans-podobny) | najbardziej „sklepowy” i nowoczesny; przyklejony dolny pasek „KUP ZA 250,00 ZŁ / PORÓWNAJ 14 OFERT” |
| faniklockow | gradientowy niebieski nagłówek, żółte logo, duże grafiki promo | Oswald (wąski, wersaliki) + Lato | magazyn fanowski, kolorowe hero, boks „Reklama” w prawej kolumnie |
| fanklockow | żółto-pomarańczowy pasek menu, pikselowe logo | Raleway / Roboto | portal z lat 2010; reklama suplementu nad treścią, popup „ostatni wpis”, dzwonek push |
| lego.com | żółty nagłówek; sekcja dla dorosłych na czarnym tle | własny krój | dwa światy: kolorowa „Strefa zabawy” dla dzieci i ciemna, „galeryjna” strefa dla dorosłych |

### Jak mówią

**LEGO.com do dorosłego** mówi o relaksie i czasie dla siebie, a o cenie milczy:

- „Czy zestawy LEGO® nadają się dla dorosłych? No raczej! Znajdź chwilę dla
  siebie i odpocznij […] Więc odłóż smartfon, otwórz pudełko i zrelaksuj się.
  To czas dla Ciebie.”
  (https://www.lego.com/pl-pl/categories/adults-welcome)
- „Masz ochotę na przerwę? Szukasz wytchnienia albo kreatywnego projektu do
  własnoręcznego zbudowania?” (tamże)
- Szybkie linki nie idą po seriach, tylko po pasjach: „Rozrywka”, „Sztuka,
  design i muzyka”, „Podróże i historia”, „Nauka i technologia”, „Przyroda
  i zwierzęta”, „Pojazdy” (tamże).
- Treści redakcyjne: „Dekoracje wnętrz, koło których nikt nie przejdzie
  obojętnie!”, „Jak urządzić łazienkę w stylu retro za pomocą estetycznych
  zestawów LEGO®”, „Nieopowiedziana historia: Jak zbudowaliśmy gotycki model
  LEGO® DC Batmobil™” (tamże).
- Opis produktu 10359 (powielają go promoklocki i zklockow): „Zrelaksuj się
  podczas budowania zestawu dla dorosłych […] będzie stanowił piękną ozdobę
  domowego biura” (https://promoklocki.pl/lego-icons-10359-fontanna-w-ogrodzie-p23143).

**LEGO.com do rodzica i kupującego prezent** mówi o miłości, radości i dziecku:

- „Podaruj prezent pełen miłości, który można zbudować”, CTA „Do sklepu”
  (https://www.lego.com/pl-pl).
- „PREZENTY, KTÓRE BUDZĄ RADOŚĆ. Pokaż, jak dobrze znasz bliską Ci osobę,
  wręczając jej zestaw LEGO®, który przemieni jej pasję w dzieło godne
  wyeksponowania.” (https://www.lego.com/pl-pl)
- „Pozwól dzieciom dać upust kreatywności i zbudujcie razem listę życzeń!”,
  CTA „Sprawdź” (https://www.lego.com/pl-pl/holiday-gifts).
- „Teraz dzieci mogą bawić się jak prawdziwi Trenerzy Pokémonów”
  (https://www.lego.com/pl-pl).
- Ścieżki wyboru: „Wyszukaj pomysły na prezenty według wieku, zainteresowań
  i nie tylko!”, „Czas na prezenty. Szukaj pomysłów według okazji, wieku
  i ceny”.
- Stereotypy płciowe w praktyce LEGO: „Najlepsze prezenty świąteczne dla
  chłopców — […] od zestawów z piratami i zwierzętami po modele samochodów
  wyścigowych i dinozaurów” oraz „dla dziewczynek — Od mroźnych pałaców, przez
  przygody z udziałem dzielnych rycerzy, po ulubione gry”
  (https://www.lego.com/pl-pl/holiday-gifts). LEGO zostawia to w treściach
  SEO, ale nawigacja główna idzie po wieku, cenie, okazji i zainteresowaniach,
  nie po płci.
- Bramka wieku na wejściu (zrzut `05-lego-home.jpg`): „LEGO.com: Znajdziesz
  tam sklep, pomoc i nie tylko. [Dalej]” obok „STREFA ZABAWY: Graj w gry,
  oglądaj filmy i nie tylko! [ZACZNIJ ZABAWĘ]”. Dziecko i dorosły rozchodzą się
  od pierwszego kliknięcia.

**Porównywarki** mówią technicznie, z jednym hasłem zaufania:

- promoklocki: same parametry w karcie („Rok: 2027, elementów: 3495, cena/el:
  0,36zł, wiek 14+”), CTA „Do sklepu”, „Sprawdź dzisiejsze okazje!”
  (https://promoklocki.pl/).
- zklockow: „Porównywarka cen klocków LEGO – kupuj taniej i świadomie”, „To
  różnica między kupowaniem w ciemno a kupowaniem z pełną wiedzą o tym, ile
  dany model naprawdę powinien kosztować”, „Jesteśmy największą porównywarką
  cen klocków LEGO w Polsce”. CTA „KUP ZA 250,00 ZŁ”, „PORÓWNAJ 14 OFERT”
  (https://zklockow.pl/, https://zklockow.pl/lego-10359-icons-fontanna-w-ogrodzie).

**Blogi** mówią emocjonalnie i fanowsko, z presją czasu:

- faniklockow: „Godzilla powraca! Imponujący model i wyjątkowy gratis na
  premierę”, „Kalendarze Adwentowe od LEGO® – gdzie dorwać najtaniej?”,
  „Chwilowo jest to historycznie najniższa cena!”
  (https://faniklockow.pl/2026/11/03/okazja-cenowa-technic-42240-bolid-f1-aston-martin-aramco-amr25-3/).
- fanklockow: „AKTUALIZOWANE! NAJLEPSZE oferty LEGO®: LISTOPAD 2026”, „No i mamy
  listopad, a wraz z nim nadchodzą najlepsze tegoroczne okazje […] Zapraszamy!”,
  legenda emoji „🔥 – GORĄCA OFERTA”, „Listopadowy mini gratis na LEGO.pl dla
  naszych czytelników!” (https://fanklockow.pl/najlepsze-oferty-na-lego-listopad-2026/).

**Pepper** mówi językiem społeczności i liczb: temperatura („3195°”), „W necie
od 75,58 zł”, „Procent ceny katalogowej: 65%”, CTA „Idź do okazji”, a w tekście
SEO „cierpliwe wyczekiwanie prawdziwych promocji zamiast impulsywnych zakupów”
(https://www.pepper.pl/grupa/klocki-lego). Pepper sam stosuje naszą logikę
„procent katalogu”.

**tylkoklocki.pl:**

- H1 strony głównej: „Prawdziwe promocje na klocki LEGO – rabaty liczone od cen
  katalogowych”; sekcje „Dziś w dobrej cenie”, „Zestawy pod lupą”; CTA „Sprawdź
  w Media Expert →”, „Pełna karta zestawu i porównanie cen →”, etykieta
  „OKAZJA DNIA · DANE Z 05.11.2026” (https://tylkoklocki.pl/).
- Tytuły artykułów: „LEGO Star Wars 75421 Myśliwiec TIE Dartha Vadera –
  najtańsze wejście do SMART Play, ale nie za cenę katalogową”, „LEGO Friends
  42646 Pokój Autumn – mały pokój pełen szczegółów, który warto kupić tylko
  z rabatem”.
- Hub 10359, boks „👨‍👩‍👧 Dla rodzica”: „Dekoracja dla dorosłego, bez wartości
  zabawowej. Budowa jest spokojna i roślinna […]”. Boks „🧱 Dla kolekcjonera”:
  „0,32 zł za element przy medianie Icons z rocznika 2025 na poziomie ok.
  0,46 zł” (https://tylkoklocki.pl/zestaw/10359/).

### Ocena: czy nasz przekaz jest zbyt techniczny?

**Dla łowcy okazji i dorosłego fana nie jest.** To nasz wyróżnik: tylko my
mówimy wprost, kiedy nie kupować („warto kupić tylko z rabatem”), i dajemy próg.
Blogi grają emocją i presją, porównywarki samą liczbą, a my liczbą
z interpretacją.

**Dla rodzica i kupującego prezent jest zbyt techniczny.** Trzy powody:

1. Pierwszy ekran strony głównej mówi o „cenach katalogowych”, a nie o tym,
   czego szuka kupujący prezent w listopadzie (dla kogo, ile wydać, na jaką
   okazję). Na stronie głównej nie ma żadnego wejścia do prezentowników.
   Nagłówki sekcji: deale, „Dziś w dobrej cenie”, „Aktualności”, „Ostatnie
   artykuły”, „Zestawy pod lupą”.
2. Boks „Dla rodzica” na hubie jest napisany językiem kolekcjonera („bez
   wartości zabawowej”, „budowa jest spokojna i roślinna”). Brakuje odpowiedzi
   na pytania rodzica: dla ilu lat naprawdę, ile godzin budowy, czy da radę
   samo, czy to się nada na prezent.
3. Na hubie przed ceną stoją metryki: elementy, zł za klocek, wiek, premiera.
   LEGO i zklockow zaczynają od korzyści albo od ceny i jednego przycisku.

Kierunek: emocjonalności LEGO nie kopiujemy, bo łamałaby nasz standard („bez
sztucznej presji zakupowej”). Wystarczy tłumaczyć liczby na decyzję zwykłym
językiem, a moduły dla rodzica umieścić tam, gdzie rodzic wchodzi.

## 3. Kategorie, których nam brakuje

| Kategoria | Kto ma | My | Luka |
|---|---|---|---|
| **Według wieku** (1,5+ / 4+ / 6+ / 9+ / 13+ / 18+) | LEGO (nawigacja „Grupy wiekowe”), promoklocki (`/lego-dla-3-latka`, `-5-`, `-8-`), zklockow („LEGO dla najmłodszych”, „dla czterolatków”) | 2 teksty: „Jakie LEGO dla 7-latka?”, „LEGO za ok. 200 zł dla 10-latka” | **duża.** Brak stałych hubów wiekowych z żywymi cenami |
| **Według budżetu** | LEGO (poniżej 50 / 50–100 / 100–200 / 200–500 / ponad 500 zł), promoklocki (`/lego-do-50-zl`, `-100-`, `-200-`) | 1 prezentownik „do 100, do 300 i do 600 zł” | **duża.** Listingi „do X zł” z bieżącą ceną i rabatem to nasza mocna strona danych, a ich nie mamy |
| **Okazje** (urodziny, Mikołaj, komunia, Dzień Dziecka, walentynki, Dzień Ojca/Mamy, ślub, emerytura) | LEGO (Holiday, Urodziny, Ślub, Emerytura, Współpracownicy, Walentynki, Dzień Ojca/Mamy), zklockow (`/okolicznosciowe-lego`, `/boze-narodzenie-lego`, `/halloween-lego`) | tylko święta i Mikołaj | **średnia teraz, duża wiosną.** Komunii nie widziałem u nikogo w nawigacji (LEGO PL też jej nie ma), a to polska okazja z wysokim budżetem |
| **Zainteresowania / tematy ponad seriami** (F1, pociągi, kwiaty, dinozaury, kosmos, smoki, statki, budynki) | LEGO (27 zainteresowań + „16 więcej”), zklockow („Popularne tematy”: Ferrari, Formuła 1, pociągi, dinozaury, smoki, statki, rośliny…) | tylko serie | **duża.** Rodzic myśli „syn lubi pociągi”, a nie „City czy Technic” |
| **Dla dorosłych (18+)** jako stały hub | LEGO („Dorośli mile widziani”), zklockow (w menu głównym + rankingi „Najlepsze zestawy LEGO dla dorosłych fanów…”) | etykieta „DLA DOROSŁYCH” na hubie, prezentownik świąteczny | **średnia.** Brak stałej strony 18+ (dekoracje, relaks, ekspozycja) |
| **Minifigurki** (CMF, duże figurki) | promoklocki (kategoria), zklockow („Figurki LEGO”, „Kolekcja dużych minifigurek”), fanklockow (skaner minifigurek) | brak | **średnia** |
| **Kalendarze adwentowe** jako hub | zklockow (`/kalendarze-adwentowe-lego`), LEGO, faniklockow („gdzie dorwać najtaniej?”) | ranking 2026 (artykuł) | **mała, sezonowa.** Na listopad wystarczy hub z żywą tabelą cen wszystkich kalendarzy |
| **Kody rabatowe / GWP** jako strona | promoklocki (`/lego-kod-rabatowy`, `/kod-gwp-lego`), Pepper, fanklockow (ekskluzywny gratis „dla naszych czytelników”) | kody tylko w kartach deali (`kody_rabatowe.json`) | **średnia.** Fraza z dużym popytem, a dane już mamy |
| **LEGO Insiders / VIP** (poradnik, kalkulator punktów) | fanklockow (FAQ Insiders, kalkulator punktów), LEGO | 1 artykuł o nowych zasadach | **mała do średniej** |
| **Najtaniej w sklepie LEGO / ostatnie sztuki w LEGO** | promoklocki | wycofania (inna logika) | mała |
| **Rankingi „naj”** (najdroższe, największe, najwięcej minifigurek) | promoklocki, zklockow | mamy (najdroższe, największe SW i Technic) | brak luki |
| **Budowanie MOC, renowacja, czyszczenie** | fanklockow („Jak odbudować stare LEGO?”, „Jak czyścić klocki?”) | brak | mała. Niska wartość afiliacyjna |
| **Dla dziewczynek / dla chłopców** | LEGO (artykuły SEO), my („Dla chłopca do 500 zł”, „Dla dziewczynki do 500 zł”) | mamy | **uwaga**, patrz rekomendacje |

## 4. Kto co robi lepiej

### Konkurencja lepiej

1. **Szerokość porównania.** Dla 10359 promoklocki pokazuje 22 sklepy,
   zklockow 14 ofert, a my 6 (+ LEGO.com i Ceneo). Przy zestawach EOL i zakupach
   świątecznych mniejsze sklepy (brixani, lubieklocki, Świat Skrzata, Max
   Elektro, Neonet, al.to) często dają drugą najlepszą cenę.
2. **Historia cen.** promoklocki i zklockow mają „najniższa cena z 30 dni”,
   najniższą historyczną i wykres. zklockow dopisuje komentarz („W maju tego
   roku cena katalogowa […] spadła z 439,99 zł na 419,99 zł”). My mamy jedną
   linię o minimum, choć **od 18.09.2026 zbieramy dzienne ceny per sklep**
   (`src/data/historia-cen/*.jsonl`, ok. 79 tys. linii) i ich nie pokazujemy.
3. **Nawigacja dla kupującego prezent** (wiek, budżet, okazja,
   zainteresowania). LEGO i zklockow mają ją w menu. My mamy wyłącznie serie.
4. **Kanały powrotu.** promoklocki ma osiem kanałów (WhatsApp, Telegram,
   Discord, TikTok…), blogi mają push i Discorda, LEGO newsletter. My nie mamy
   ani jednego linku social i świadomie rezygnujemy z newslettera, więc czytelnik
   wraca tylko z Google albo przez alert jednego zestawu.
5. **Tempo newsów i społeczność.** Blogi publikują 2–10 wpisów dziennie,
   z wideo i Discordem. Wyścig na przecieki jest przegrany z góry (wniosek
   Radaru z 27.08 nadal aktualny).
6. **Konwersja na hubie (zklockow).** Jeden główny przycisk z ceną („KUP ZA
   250,00 ZŁ”) i przyklejony dolny pasek na mobile. U nas przycisk nazywa się
   nazwą sklepu, a pasek jest tylko na wąskim ekranie.
7. **Twarze i autorzy (faniklockow).** Imię i nazwisko przy każdym wpisie,
   spółka w stopce. U nas „Piotr M.” i anonimowa „dwójka przyjaciół”.

### My lepiej

1. **Uczciwy próg.** Rabat zawsze od ceny katalogowej plus jawne progi
   („OKAZJA” od 30%, „DOBRA CENA”), etykieta „nowe minimum cenowe”, data przy
   każdej cenie („z 05.11.2026”). U konkurencji tego nie ma: faniklockow
   oznacza jako „Okazję Cenową” dowolną cenę poniżej katalogu (według Radaru
   mediana 14%, 10372 przy −2%), a promoklocki i zklockow pokazują procent bez
   oceny.
2. **Kontekst przy cenie.** Uwagi przy sklepach („sklep prowadzi akcje na drugi
   zestaw […] w koszyku może być taniej”, ostrzeżenie o marketplace Allegro),
   komunikat EOL, „dziś jest o 10,00 zł drożej” niż minimum. Konkurencja podaje
   gołe liczby.
3. **Analiza, której nie ma nikt inny.** Cena za klocek wobec mediany serii,
   boksy „Dla rodzica / Dla kolekcjonera” na hubie, recenzje z rozstrzygnięciem
   „kupić tylko z rabatem”. Porównywarki wklejają opis producenta, blogi
   przepisują komunikaty.
4. **Jeden URL na zestaw.** Kolejne przeceny wzmacniają ten sam hub, a
   faniklockow tworzy wpis z sufiksem -2 … -9 (10365 Czarna Perła ma już „-9”).
5. **Czystość.** Brak reklam, popupów, pushy i suplementów nad treścią.
   promoklocki ma AdSense i baner nad logo, blogi reklamy i popupy.
6. **Łączenie warstw.** Przecieki, wycofania, kalendarz promocji i ceny siedzą
   w jednym serwisie i odsyłają do siebie. Każdy konkurent ma najwyżej dwie
   z tych warstw naraz.

## 5. Rekomendacje

### Skopiować (wzorzec, nie treść)

1. **Wykres i „najniższa z 30 dni” na hubie.** Dane już są
   (`historia-cen/*.jsonl`). To parytet z obiema porównywarkami i zarazem
   wzmocnienie naszej tezy o pseudopromocjach. Sama linia z minimum 30 dni
   wystarczy na start. Wykres może dojść później.
2. **Listingi „LEGO do 50 / 100 / 200 / 500 zł” i „LEGO dla X-latka”**
   generowane z danych (pSEO) w naszej konwencji: najtańsza oferta dziś, rabat
   od katalogu, filtr „tylko okazje”. Pod spodem 3–5 zdań redakcyjnych dla
   rodzica. Wzorzec ma LEGO i promoklocki, a my możemy dodać do niego ocenę.
3. **Huby tematyczne ponad seriami:** F1 i auta, pociągi, kwiaty i rośliny,
   dinozaury, kosmos, zamki i rycerze. Wzorzec: „Popularne tematy” zklockow,
   „Zainteresowania” LEGO.
4. **Moduł „Szukasz prezentu?” na stronie głównej** od 1.11 do 24.12: chipy
   wieku, budżetu i zainteresowań prowadzące do prezentowników i listingów.
   Poza sezonem wraca na dół strony.
5. **Główny przycisk z ceną na hubie** („Kup za 250 zł w Allegro →” zamiast
   „Allegro →”) i przyklejony pasek ceny również na desktopie. Wzorzec
   zklockow. Kolejność afiliacyjna bez zmian.
6. **Strona „Kody rabatowe i gratisy LEGO”** zasilana z `kody_rabatowe.json`
   i kalendarza promocji, z datą ważności przy każdym kodzie.
7. **Stały hub „LEGO dla dorosłych”** w tonie LEGO.com (dekoracja, relaks,
   ekspozycja), ale z naszą warstwą cenową. Hasło typu „Zestaw do salonu, nie
   do skrzyni z zabawkami. Kupuj z rabatem” zamiast „bez wartości zabawowej”.
8. **Choć jeden kanał powrotu.** Rekomendacja: cotygodniowy mail „5 prawdziwych
   okazji tygodnia” (opt-in, ta sama infrastruktura co alerty) albo kanał
   WhatsApp lub Telegram. Do tego linki do kont social w stopce, jeśli konta
   istnieją (skill `klocki-social` to sugeruje, ale tego nie sprawdzałem).

### Unikać

- **Farmy wpisów okazyjnych** (faniklockow -2…-9) i przedatowywania tych samych
  treści (fanklockow, wg Radaru). Mamy na to lepszą strukturę.
- **Reklam displayowych i popupów push.** Czystość to dziś przewaga widoczna na
  pierwszy rzut oka (zrzuty 01, 08, 10, 11 wobec 12–14).
- **Wyścigu na liczbę sklepów za wszelką cenę.** Lepiej dołożyć 5–8 sklepów,
  które realnie bywają najtańsze (Neonet/al.to, Max Elektro, brixani,
  lubieklocki, Świat Skrzata, taniaksiazka), niż 22 sklepy z ceną przy
  katalogu. brixani i taniaksiazka są już w `src/data/sklepy.json`, a mimo to
  nie trafiły do tabeli 10359. Warto sprawdzić, dlaczego (brak źródła ceny?),
  zanim dopiszemy nowe sklepy.
- **Podziału na „dla chłopca” i „dla dziewczynki” w nawigacji.** LEGO trzyma go
  tylko w treściach SEO, a jego opisy powielają stereotypy (chłopcy: piraci,
  wyścigówki, dinozaury; dziewczynki: pałace). Nasze dwa teksty
  szkolne warto przeredagować na „według zainteresowań” albo przynajmniej
  zadbać, by obie listy nie różniły się tematami, tylko propozycjami. Tytuł
  może zostać ze względu na frazę, ale H2 i dobór powinny iść po pasjach.
- **Języka presji** („Chwilowo…!”, „🔥 GORĄCA OFERTA”, „gdzie dorwać”). Nasza
  powściągliwość to element wiarygodności.
- **Własnej aplikacji i kont.** Dużo pracy, mały zwrot przy naszej skali.
  promoklocki i faniklockow mają tu przewagę lat.

### Luki do zajęcia

1. **Komunia i Dzień Dziecka (maj–czerwiec).** Nikt z badanych nie ma tych
   okazji w nawigacji, a to największy polski sezon prezentowy poza grudniem.
   Prezentowniki „LEGO na komunię do 300 / 500 / 1000 zł” warto przygotować
   w marcu.
2. **„Czy to naprawdę okazja?” jako produkt.** Pepper i blogi ogłaszają okazje,
   porównywarki pokazują ceny, a nikt nie ocenia. Ocena „to okazja / to normalna
   cena / poczekaj” przy każdej cenie, z historią 30 dni, jest naszym naturalnym
   terytorium. Tego nie da się szybko skopiować bez naszego standardu.
3. **Rodzic, który nie zna serii.** LEGO prowadzi go w swoim sklepie, a polskie
   porównywarki go nie prowadzą (listy po seriach i numerach). Huby wiek,
   budżet i zainteresowanie z jednym zdaniem „dla kogo” przy zestawie dają
   ruch prezentowy, którego dziś nie łapiemy.
4. **Dorosły „dekorator”** (Botanicals, Art, Icons jako ozdoba wnętrza). LEGO
   ma na to treści, a polskie serwisy nie. Wystarczą 2–3 teksty („LEGO do
   salonu”, „kwiaty z klocków, które nie więdną: ranking cen”) podpięte do
   hubów.

## Załączniki

- Zrzuty (`zrzuty-konkurencja/`): 01–02 promoklocki, 03–04 zklockow, 05–06
  lego.com (bramka wieku, „Dorośli mile widziani”), 07 pepper, 08–09
  faniklockow, 10–11 fanklockow, 12–14 tylkoklocki (główna, /promocje-lego/,
  /zestaw/10359/).
- Surowe pobrania (markdown z Firecrawla, RSS, wyciągi tekstu) zostały
  w scratchpadzie sesji i nie trafiają do repo.
