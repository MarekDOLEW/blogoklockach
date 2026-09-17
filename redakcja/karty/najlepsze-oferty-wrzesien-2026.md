# Karta researchu — najlepsze oferty na LEGO, wrzesień 2026

Dokument wewnętrzny. Nie jest częścią publikowanego tekstu.

## 1. Zakres i pytanie

**Kategoria:** Poradniki. **Polecenie Marka (17.09.2026):** zrobić odpowiednik
`fanklockow.pl/najlepsze-oferty-na-lego-wrzesien-2026/`, ale „mniej ofert i kilka
słów treści do każdej — sprzedażowe, a nie listing linków", ze zdjęciami, które
da się kliknąć, w stylu `/nowosci/`.

**Pytanie tekstu:** które z dzisiejszych przecen są realne, a nie są po prostu
ceną rynkową — i przy jakiej kwocie kupno ma sens.

**Czym różnimy się od wzoru.** U konkurencji jest kilkaset pozycji pogrupowanych
po sklepach, z ceną i procentem wpisanymi ręcznie w dniu publikacji. Trzy rzeczy
robimy inaczej:

1. **Dwanaście pozycji z komentarzem** zamiast listy linków — czytelnik ma dostać
   decyzję, nie spis.
2. **Ceny liczą się przy każdym budowaniu strony** z tych samych danych co tabela
   na hubie (`KartaOferty.astro`). Lista linków starzeje się w tydzień; ta nie.
3. **Procent nie jest miarą okazji** (§3). Zamiast jednego rankingu rabatów
   liczymy medianę osobno w ośmiu pasmach cenowych i dobieramy pozycje względem
   ich własnego pasma — dzięki temu w tekście są zestawy za dwa tysiące złotych,
   których żadna lista sortowana procentem nigdy nie pokaże.

## 2. Populacja i metoda

Dane z 17.09.2026, po porannym przebiegu Łowcy. Populacja: zestawy mające
jednocześnie cenę katalogową (kolejność źródeł jak w `oferty.js`) i żywą ofertę
sklepową po sicie serwisu — odsiew podszywek (28% RRP), wiek oferty ≤14 dni,
reguła „podejrzanego rynku" (<50% potwierdzonego RRP bez potwierdzenia człowieka).
Ceneo wyłączone: to porównywarka, nie sklep.

**Populacja: 1 150 zestawów.**

## 3. Ustalenie główne: procent nie mierzy okazji

**Uwaga Marka (17.09.2026), która przestawiła oś tekstu:** „Nie zawsze procent
jest największą okazją. Są zestawy ekskluzywne, które rzadko tanieją bardziej niż
o 15% i te 15% jest najlepszą okazją, jaka była. Im droższy zestaw, tym mniejszy
procent jest potrzebny, aby korzyść była większa."

Sprawdzone w danych — teza się potwierdza w dwóch niezależnych przekrojach.

### 3a. Mediana rabatu w ośmiu pasmach cenowych

| Pasmo (cena katalogowa) | Zestawów | Mediana rabatu | Mediana oszczędności | Najgłębsza przecena |
|---|---|---|---|---|
| do 100 zł | 270 | 24,1% | 13 zł | −42% (60459) |
| 101–400 zł | 623 | 28,0% | 45 zł | −54% (10423) |
| 401–800 zł | 178 | 26,2% | 128 zł | −52% (76156) |
| 801–1200 zł | 47 | 18,8% | 217 zł | −41% (42182) |
| 1201–1600 zł | 14 | **3,7%** | 52 zł | −32% (76354) |
| 1601–2000 zł | 10 | **7,1%** | 138 zł | −28% (42172) |
| 2001–2500 zł | 3 | **0%** | 0 zł | −20% (75397) |
| 2501 zł i więcej | 5 | **0%** | 0 zł | −22% (75367) |

Trzy najwyższe pasma mają małą próbę (14, 10, 3 i 5 zestawów z żywą ofertą) i tekst
mówi o tym wprost. Kierunek jest jednak jednoznaczny: **powyżej 1 200 zł połowa
zestawów stoi w cenie katalogowej**, bo dużą część stanowią ekskluzywy dostępne
wyłącznie w LEGO, a pozostałe sklepy trzymają cennik.

Odwrotnie z oszczędnością: mediana rośnie z 13 zł (pasmo do 100 zł) do 217 zł
(801–1200 zł). Dwie skrajności do tekstu:

- **−42% na 60459** (wyścigówki, RRP 42,99) = **18 zł** oszczędności;
- **−20% na 75397** (Barka Jabby, RRP 2 149,99) = **423 zł** i minimum notowań.

### 3b. Ekskluzywy prawie nie tanieją

| Grupa | Zestawów | Mediana rabatu |
|---|---|---|
| Ekskluzywy (`ekskluzyw: true`) | 79 | **5,5%** |
| Reszta katalogu | 1 071 | **27,3%** |

To jest twarde potwierdzenie uwagi Marka. Przykład skrajny: **10333 Barad-dûr**
schodzi o 4,8% (109 zł) — i jest to najniższa cena, odkąd notujemy. Na takim
zestawie czekanie na „−40%" oznacza nie kupienie go nigdy.

## 4. Konsekwencja redakcyjna: trzy miary zamiast jednej

Przy każdej pozycji tekst podaje:

1. **procent** — bo tego czytelnik szuka i po tym porównuje oferty,
2. **oszczędność w złotówkach** — bo to ona decyduje o budżecie,
3. **pozycję na tle pasma** („najgłębsza przecena w paśmie", „jedyna przecena
   w paśmie") oraz plakietkę „najniżej, odkąd notujemy".

Karta `KartaOferty.astro` pokazuje 1 i 3 automatycznie (procent, cena, minimum
notowań, status wycofania); 2 wchodzi do treści redakcyjnej przy pozycjach, gdzie
kwota jest argumentem.

## 5. Ustalenie poboczne: wycofanie nie pogłębia przeceny

Mediana rabatu zestawów z listy wycofań: **27,6%** (n=245). Bez wycofania:
**26,8%** (n=905). Różnica w granicach szumu — spójne z artykułem o wycofaniach
grudniowych z 16.09. W tekście wycofanie jest argumentem o **dostępności**,
nigdy o cenie.

## 6. Dobór dwunastu pozycji

Kryteria, w tej kolejności:

1. **reprezentacja wszystkich ośmiu pasm** — co najmniej jedna pozycja z każdego,
   z naciskiem na te górne, gdzie konkurencja nie ma czego pokazać;
2. rabat wyraźnie powyżej mediany **swojego pasma** albo minimum notowań;
3. różne sytuacje zakupowe (dodatek, prezent dla dziecka, model dla dorosłego);
4. zdjęcie w R2 i hub z pełną tabelą cen;
5. **limit Allegro ≤30% linków** (reguła Marka z 13.09.2026) — stąd 3 pozycje
   z 12; przy pozostałych karta pokazuje najtańszy sklep spoza marketplace'u.

| # | Numer | Pasmo | Sklep | Rabat | Oszczędność | Dlaczego |
|---|---|---|---|---|---|---|
| 1 | 60487 | do 100 | Empik | −39% | 24 zł | minimum notowań, najtańszy sensowny dodatek |
| 2 | 42678 | do 100 | Empik | −40% | 33 zł | minimum + potwierdzone wycofanie XII 2026 |
| 3 | 43221 | 101–400 | Empik | −43% | 102 zł | 0,13 zł/element — najlepszy przelicznik w tekście |
| 4 | 10362 | 101–400 | Allegro | −42% | 144 zł | 0,31 zł/el. przy medianie Icons 0,46; LEGO już nie sprzedaje |
| 5 | 60339 | 401–800 | Empik | −50% | 351 zł | największy rabat w tekście, ale najgorszy zł/element |
| 6 | 10359 | 401–800 | Smyk | −40% | 169 zł | 1 302 elementy, minimum notowań, po EOL |
| 7 | 42182 | 801–1200 | Empik | −36% | 344 zł | najgłębsza przecena w paśmie (mediana 19%) |
| 8 | 76354 | 1201–1600 | Allegro | −32% | 511 zł | najgłębsza w paśmie o medianie 3,7%; ekskluzyw, minimum |
| 9 | 21067 | 1201–1600 | Smyk | −28% | 361 zł | druga przecena w tym samym paśmie |
| 10 | 42172 | 1601–2000 | Media Expert | −28% | 551 zł | ekskluzyw, minimum notowań, mediana pasma 7,1% |
| 11 | 75397 | 2001–2500 | Media Expert | −20% | 423 zł | **jedyna przecena w paśmie**, minimum, EOL XII 2026 |
| 12 | 75367 | 2501+ | Allegro | −22% | 620 zł | największa oszczędność w tekście, minimum, EOL XII 2026 |

Pozycje 10–12 są sednem tekstu: mają najniższe procenty i największe oszczędności.
Bez nich zestawienie byłoby kolejną listą „−40%", w której półka powyżej 1 200 zł
w ogóle nie istnieje.

Wypadły względem pierwszej wersji (17.09 przed uwagą Marka): 60407, 42208, 43018 —
wszystkie z pasm 101–800 zł, gdzie i tak było najgęściej.

## 7. Co świadomie pominięto

- **10423 Ludziki z emocjami (−54%)**, **76156 Domo powstaje (−52%)** — oba
  potwierdzone przez Marka 16.09 jako prawdziwe, ale to końcówki serii sprzed
  kilku lat, dostępne w jednym–dwóch sklepach. Zostają na `/deale/`; w poradniku
  wyglądałyby jak najlepsze pozycje miesiąca, a są resztkami magazynowymi.
- **75384 Karmazynowy Jastrząb (−46%)** — ocena 3,2/5 przy 74 głosach, 136
  elementów za 134 zł. Rabat duży, zestaw słaby. Nie polecamy dla samego procentu.
- **76263 Hulkbuster (−44%)** — 66 elementów, ponad 1 zł za element.
- Wszystko, co dziś stoi powyżej ceny katalogowej (60 zestawów) — w tekście
  pojawia się tylko jako ostrzeżenie, bez numerów.

## 8. Czego NIE twierdzimy

Konkurencja pisze o „stopniowym wzroście cen przed świętami". **Nie powtarzamy
tego**: nasze notowania zaczynają się 13.08.2026, więc nie mamy zeszłorocznego
grudnia do porównania. W tekście mówimy wprost, czego nie wiemy — i co za tym
idzie, dlaczego karty mówią „najniżej, odkąd notujemy", a nie „najniżej w historii".

## 9. Cykl

Tekst jest miesięczny. Wrzesień jest pierwszy; październikowy powstaje na tych
samych danych i tym samym komponencie. Ceny w opublikowanym tekście odświeżają
się same przy każdym buildzie, więc wersja wrześniowa nie zacznie kłamać po
dwóch tygodniach — zestarzeje się tylko dobór pozycji.
