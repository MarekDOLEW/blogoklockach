# Kolejne działania po audycie końcowym — 16.09.2026

*Kolejność według wpływu na cel (przychód afiliacyjny w sezonie XI–XII i indeksacja), nie według łatwości. Przy każdym punkcie: kto, ile pracy, co daje. Bez linków zewnętrznych i bez reklamy — zgodnie z decyzją: te tematy startują, gdy audyt wyjdzie czysto dwa dni z rzędu.*

---

## A. Dziś — błędy wobec czytelnika (Code, razem ok. 2 h; dwa punkty wymagają jednej decyzji Marka)

**A1. Cztery ekskluzywy z powrotem do sprzedaży na stronie** — *decyzja Marka + Code, 20 min.*
Zestawy 10335, 10356, 40516, 40797 mają wpis `kiedy: "wycofany"` z Twojej ręcznej weryfikacji z 14.09, a listing lego.pl pokazał je 15.09 z ceną (10335 dodatkowo `E_AVAILABLE` 13.09). Reguła z 15.09 mówi, że listing jest arbitrem. Propozycja: przestawić wpisy na `status: "potwierdzone"`, `kiedy: "grudzień 2026"` (są w tegorocznej fali wycofań), co przywróci wiersz LEGO.com z linkiem zakupowym; do tego **zabezpieczenie w kodzie**: `status.js` traktuje wpis „wycofany" jako nieważny, gdy `lego_pl_widziano` jest młodsze niż 14 dni (strona sama broni się przed takim wpisem, niezależnie od runnera). Pytanie do Ciebie: czy 14.09 widziałeś na kartach tych czterech „Produkcja zakończona"? Jeśli tak — to lego.pl ma dwa sprzeczne stany i wpisujemy to do RUNBOOK jako znany przypadek, a stronę i tak ustawiamy po listingu (link sprzedażowy ważniejszy).

**A2. Oferty starsze niż 14 dni znikają z tabel** — *Code, 40 min.*
Filtr wieku w `polaczOferty()` (`src/lib/oferty.js`): oferta z datą starszą niż 14 dni nie wchodzi do tabeli ani do meta/JSON-LD (dla sklepów tygodniowych to wciąż zapas tygodnia). Usuwa 17 sierpniowych wierszy bez ruszania danych (append-only nietknięte). Do tego w `sklepy.json` wyciąć szablony `szukaj` prowadzące na stronę główną (proshop, sferis, dadada) — przycisk „Sprawdź w sklepie" nie może lądować na homepage. Test: skaner `dist/` z audytu policzy `/idz/proshop` = 0.

**A3. Bramka „podejrzany rynek" w dealach** — *Code, 45 min; Marek: 3 sprawdzenia w przeglądarce.*
Dziś 60339, 10423, 76156 są na `/deale/` (10423 na stronie głównej) z ceną poniżej 50% potwierdzonego RRP, a `kontrola-rrp.mjs` uruchamia tylko wyłączony Backfill. Zmiana: reguła w `src/lib/deale.js` — deal z RRP potwierdzonym i ceną < 50% RRP dostaje oznaczenie „do weryfikacji" i nie wchodzi do karuzeli ani na `/deale/`, dopóki człowiek go nie potwierdzi (lista potwierdzeń w `src/data/deale_potwierdzone.json`, append-only). Kontrola-rrp wchodzi do promptu Łowcy jako krok przed commitem (wynik do podsumowania). Ciebie proszę o otwarcie trzech kart Empiku w przeglądarce: jeśli ceny są prawdziwe — wpisujemy je do potwierdzeń i deale wracają.

**A4. Data artykułu o wycofaniach na 16.09** — *Code, 10 min.*
`data` i `zaktualizowano` na `2026-09-16`; w `sprawdz-kategorie.mjs` (prebuild) dodatkowa kontrola: data z przyszłości = build pada; w `sitemap-priorytet.xml.js` przycinanie `lastmod` do dziś jak w sekcjach.

**A5. Przypominajka o Empiku** — *Marek, panel, 2 min.*
W prompcie `trig_01BWC5ydHBNVE5Q8usmf62PN` zastąpić zdanie o braku klucza `empik` tekstem: „Deeplinki Empiku odświeża ten sam import (`empik-redirects.mjs --usun-martwe`); bez cotygodniowego zrzutu ceny Empiku stoją, a martwe adresy kart zostają." Gotowy prompt dostaniesz w czacie razem z tym raportem.

---

## B. W tym tygodniu — procedury, które przestają zależeć od pamięci (Code, razem ok. 4 h)

**B1. Import Empiku jako skrypt** — *Code, 1,5 h; potem Marek wrzuca plik do Code jak wszystko inne.*
`scripts/empik-import.mjs`: filtry z commita `f9b0cef` (gadżety po rdzeniach nazw, próg sanity 40% RRP, konflikt numeru z nazwy, tylko zestawy znane katalogowi), zapis przez `json-kolejnosc.mjs`, `daty.empik` z pliku, potem `empik-redirects.mjs`. Reguły przestają żyć w pamięci trwałej sesji Łowcy, a NARZEDZIA pkt 3 zmienia się w „Code, jak wszystko inne". Skill `klocki-ceny-empik` dostaje jedno zdanie o nowej drodze i idzie do ponownego wgrania.

**B2. Jeden nagłówek sygnałów Scouta** — *Code, 15 min.*
Pod wpisem Scouta z 16.09 dopisać linijkę przekierowującą („= sygnały wycofań dla runnera Wycofań"), a w promptach Wycofań i Kontrolera (przy najbliższym delete+create) szukać wpisów po `SCOUT ·` i słowie „wycofa", nie po pełnym tytule. Do tego czasu Kontroler 21.09 dostaje ten wpis wprost w sekcji „Zadania bez właściciela" tego raportu.

**B3. Zamykanie zadań bez właściciela** — *Marek: decyzja o konwencji, 5 min; Code wdraża.*
Konwencja: Marek zamyka zadanie jednym zdaniem w czacie („zamknij 75192 — Piotr odmówił / zrobione / odkładamy do X"), a Code dopisuje pod wpisem w `DZIENNIK.md` linię `→ zamknięte <data>: <powód>`. Kontroler wypisuje tylko pozycje bez tej linii **i starsze niż 7 dni**, żeby świeże nie zaśmiecały listy. Pozycje z „Kto: Piotr" Kontroler wysyła Piotrowi mailem (`wyslij-raport.py --zadanie kontroler`, nowy klucz w `raporty_mail.json`) — dziś trafiają tylko do Ciebie przez SendUserFile, więc Piotr o nich nie wie.

**B4. Plan 30 tekstów do Piotra** — *Code, 10 min, potem co tydzień automatycznie.*
`redakcja/plan-tygodnia-*.md` idzie mailem przez `wyslij-raport.py` (PDF) w piątek po zatwierdzeniu przez Ciebie; bez tego plan istnieje tylko w repo, którego Piotr nie czyta. Potwierdzenie dostarczenia: linia w `DZIENNIK.md` z datą wysyłki.

**B5. Ustalenie trwałe do przyjęcia** — *Marek, 1 min.*
Zdanie czekające od 15.09: „decyzja o runnerze = zmiana promptu tego samego dnia + linijka w ustaleniach; `DZIENNIK.md` nie jest kanałem do runnerów." Po Twoim „tak" trafia do sekcji „Ustalenia trwałe" (dziś pusta).

**B6. Skill Coworka aktualny** — *Code zrobione w tym przebiegu (eksport + paczki), Marek: wgranie `skille/*.skill` w Settings → Skills, 3 min.*
Eksport z decyzją o karcie researchu (15.09 15:07) nie był uruchomiony; paczki, które wgrałeś 15.09, mają starą regułę.

**B7. Dokumenty do stanu faktycznego** — *Code, 1 h.*
RUNBOOK („Mapa plików danych" na stan 16.09 z wszystkimi 22 plikami; sekcja Empiku przepisana; „Stabilność JSON" i „karta ≠ podstrona" oznaczone jako rozwiązane z datą), NARZEDZIA (kto startuje świeżą sesją, budżet Firecrawla przy tygodniowym listingu ~300 kredytów/mies., pkt 3 po B1), `zadania-cykliczne.md` (tabele „Co zapisuje" i „Zmiana czasu" — pełna lista 10 Routine), `_meta` w `oferty_feed.json`. Zasada z RUNBOOK („popraw i zmień datę, nie dopisuj sprzeczności") stosowana dosłownie.

**B8. Zdjęcia: 131 brakujących z Rebrickable** — *Code, 30 min.*
`r2-obrazy.mjs --sprawdz` ma wypisywać pełną listę (dziś ucina po 40) i zapisywać ją do `materialy/obrazy-brak-RRRR-MM-DD.txt`; dla numerów bez źródła hub pokazuje placeholder serii zamiast pustego pola (`Base`/`[nr].astro`). Wszystkie 131 to huby `noindex`, więc bez wpływu na Google — to porządek dla czytelnika.

---

## C. Do wtorku i poniedziałku — runnery

**C1. Wtorek 22.09, pierwszy przebieg „Dane wt 05:30"** — *obserwacja, Code.* Sprawdzić: liczbę zestawów z listingu (bramka 800), ile poszło na EOL, rozbieżności ekskluzywów, Ceneo (`daty.ceneo` 22.09), Smyk (odczytane / wyprzedane / błędy), hash commita. Jeśli po A1 cztery ekskluzywy dalej są na listingu — potwierdzenie, że lista wycofań była błędna.

**C2. Poniedziałek 21.09, pierwszy przebieg Wycofań** — *obserwacja, Code.* Ma przetworzyć 16 wpisów Scouta, 10 brakujących numerów, 5 statusów z Radaru i sekcje A/B audytu; wynik w mailu do Ciebie i Piotra. Po przebiegu: `audyt-wycofan.mjs` A = 0 jako kryterium.

**C3. Zmiana czasu 25.10** — *Marek, panel, w sobotę 24.10 wieczorem.* Łowca z `30 6` na `30 7` (zostaje 08:30 PL po feedzie ME); reszta może zjechać o godzinę bez szkody. Wpis w kalendarzu Google z tą instrukcją założę na 23.10 (Code, przez konektor kalendarza, jeśli zgodzisz się w czacie).

---

## D. Indeksacja — co realnie przesuwa liczbę stron w indeksie

Stan: 307 zindeksowanych z ok. 1 300 zgłaszanych (dane panelu z 4.09); 2 kliknięcia / 118 wyświetleń w tygodniu. Google zna adresy i nie wchodzi — to nie jest problem zgłaszania, tylko wartości i sygnałów.

**D1. 30 tekstów tygodniowo to najmocniejsza dźwignia** — *Piotr 11 + Code 11 + Cowork/Marek 8, wg planu na 21–27.09.* Każdy tekst linkuje 3–8 hubów (`remark-nazwy-setow`, tabela cen, slajder), a hub ze wspomnieniem w tekście spełnia warunek C indeksowalności — przy 30 tekstach do sitemapy wchodzi ok. 100–150 nowych hubów tygodniowo z linkiem z treści, nie tylko z listingu. Warunek: plan dociera do Piotra (B4).

**D2. Huby ekskluzywów jako priorytet treści** — *Code, w ramach planu.* 126 zestawów ekskluzywnych w sprzedaży ma jeden sklep, więc tabela cen nie spełni warunku A („≥3 sklepy") nigdy; do indeksu wchodzą przez kartę Piotra albo tekst. Lista ekskluzywów bez karty i bez tekstu → na początek kolejki kart (`karty-poza-kolejka.py` z filtrem `ekskluzyw`). To są frazy „lego <numer>", na których serwis już się pokazuje (11387: pozycja 8,2).

**D3. `/polityka-prywatnosci/` do `sitemap-inne.xml`** — *Code, 5 min.* Jedyna strona indeksowalna poza sitemapą; nic nie kosztuje, domyka spójność.

**D4. Tygodniowa kontrola indeksacji w Kontrolerze** — *jest w prompcie od 15.09; do domknięcia przez Marka:* odczyt panelu GSC „Strony" co dwa tygodnie (Kontroler o niego poprosi) — to jedyna liczba, która mówi, czy D1 działa. Pierwszy odczyt po wdrożeniu 30 tekstów: 5.10.

**D5. Sitemapa priorytetowa** — *Code, 20 min, po dwóch tygodniach obserwacji.* Dubluje 1 215 adresów z sekcyjnych; gdy sekcje mają własne liczniki w GSC, priorytetową można zdjąć, żeby raport „Strony" nie liczył adresów podwójnie. Nie ruszać, dopóki GSC nie pokaże sekcyjnych osobno.

**D6. Wewnętrzne linkowanie z artykułów do działów** — *Code, 30 min.* Artykuły linkują huby i serie, ale nie działy (`/wycofania/`, `/ekskluzywne/`, `/deale/`, `/przecieki/`) — blok „Zobacz też w serwisie" pod tekstem (`PowiazaneArtykuly.astro`) z 2 działami dobranymi po kategorii (Kalendarze → wycofania, Premiery → przecieki/nowości, Deal → deale). Działy mają najwięcej treści na jednej stronie, a najmniej linków z tekstów.

---

## E. Kryterium „100% dwa dni z rzędu"

Audyt powtarzalny jednym poleceniem (Code, 1 h): `node scripts/audyt-dnia.mjs` = diagnoza + `audyt-wycofan` (A i D muszą być 0) + `kontrola-rrp` (test rynkowy = 0 albo wszystkie w potwierdzeniach) + `kontrola-ofert` + skaner linków w `dist/` (0 martwych) + sitemapy (0 brak pliku, 0 noindex, 0 dat z przyszłości) + oferty starsze niż 14 dni (0) + próbka 50 `/img/` (0 błędów) + trasy `/idz/` per sklep (wszystkie 302 na cel afiliacyjny, żaden na stronę główną). Wynik: jedna linijka „CZYSTO" albo lista. Uruchamiany przez Kontrolera w poniedziałek i przez Ciebie na żądanie — dwa kolejne „CZYSTO" otwierają etap linków zewnętrznych i reklamy.
