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
3. **Punkt odniesienia zamiast procentu.** Sam procent nic nie znaczy, dopóki nie
   wiadomo, ile wynosi typowa przecena — dlatego tekst zaczyna się od mediany
   rynku, a karty pokazują „najniżej, odkąd notujemy".

## 2. Populacja i metoda

Dane z 17.09.2026, po porannym przebiegu Łowcy. Populacja: zestawy mające
jednocześnie cenę katalogową (kolejność źródeł jak w `oferty.js`) i żywą ofertę
sklepową po sicie serwisu — odsiew podszywek (28% RRP), wiek oferty ≤14 dni,
reguła „podejrzanego rynku" (<50% potwierdzonego RRP bez potwierdzenia człowieka).
Ceneo wyłączone: to porównywarka, nie sklep.

**Populacja: 1 150 zestawów.**

## 3. Ustalenie główne: −27% to nie okazja, tylko cena rynkowa

| | Wartość |
|---|---|
| Mediana rabatu wobec ceny katalogowej | **27%** |
| Rabat ≥30% | 361 zestawów |
| Rabat ≥40% | **27 zestawów** |
| Rabat ≥50% | 3 zestawy |
| Rabat 0–15% (pseudopromocja) | 276 zestawów |
| Cena **wyższa** niż katalogowa | 60 zestawów (5%) |

To jest teza tekstu: skoro połowa rynku stoi poniżej 27% ceny katalogowej,
to „−25%" na banerze nie jest promocją. Realnych okazji jest w danym tygodniu
kilkadziesiąt, nie kilkaset.

## 4. Ustalenie drugie: im droższy zestaw, tym mniejsza przecena

| Półka cenowa (RRP) | Zestawów | Mediana rabatu | Z rabatem ≥30% |
|---|---|---|---|
| do 100 zł | 270 | 24% | 89 |
| 100–250 zł | 459 | 28% | 152 |
| 250–500 zł | 250 | 28% | 89 |
| 500–1000 zł | 126 | 26% | 30 |
| **powyżej 1000 zł** | 45 | **7,5%** | **1** |

Duże modele praktycznie nie tanieją: na 45 zestawów powyżej 1 000 zł tylko jeden
schodzi dziś o ponad 30% (76354 Lotniskowiec T.A.R.C.Z.Y., −32%). To odwraca
intuicję czytelnika, który spodziewa się, że „na drogich jest największy rabat",
i jest drugą osią tekstu.

## 5. Ustalenie trzecie: wycofanie nie pogłębia przeceny

Mediana rabatu zestawów z listy wycofań: **27,6%** (n=245). Bez wycofania:
**26,8%** (n=905). Różnica jest w granicach szumu — potwierdza tezę artykułu
o wycofaniach grudniowych z 16.09: EOL to sygnał „sprawdź", nie „kup taniej".
W tekście używamy wycofania jako argumentu o **dostępności**, nigdy o cenie.

## 6. Dobór dwunastu pozycji

Kryteria, w tej kolejności:

1. rabat wyraźnie powyżej mediany półki (albo minimum notowań),
2. pokrycie progów budżetowych: do 50, do 150, do 400, do 700, powyżej 900 zł,
3. różne sytuacje zakupowe (dodatek, prezent dla dziecka, model dla dorosłego),
4. zdjęcie w R2 i hub z pełną tabelą cen,
5. **limit Allegro ≤30% linków** (reguła Marka z 13.09.2026) — stąd 3 pozycje
   z 12; przy pozostałych karta pokazuje najtańszy sklep spoza marketplace'u,
   nawet gdy Allegro jest o kilka złotych tańsze. Pełna tabela jest na hubie.

| # | Numer | Próg | Sklep na karcie | Rabat | Dlaczego w zestawieniu |
|---|---|---|---|---|---|
| 1 | 60487 | do 40 zł | Empik | −39% | minimum notowań, najtańszy sensowny dodatek |
| 2 | 42678 | do 50 zł | Empik | −40% | minimum + potwierdzone wycofanie XII 2026 |
| 3 | 60407 | do 80 zł | Empik | −38% | minimum, 4,1/5 przy 152 głosach |
| 4 | 43221 | do 140 zł | Empik | −43% | 0,13 zł/element — najlepszy przelicznik w tekście |
| 5 | 42208 | do 160 zł | Allegro | −38% | Technic z licencją poniżej 0,22 zł/el. |
| 6 | 10362 | do 200 zł | Allegro | −42% | 0,31 zł/el. przy medianie Icons 0,46; LEGO już nie sprzedaje |
| 7 | 10359 | do 260 zł | Smyk | −40% | 1 302 elementy, minimum notowań, po EOL |
| 8 | 60339 | do 350 zł | Empik | −50% | największy rabat w zestawieniu, ale najgorszy zł/element |
| 9 | 42182 | do 620 zł | Empik | −36% | 1 913 elementów, licencja NASA, wiek 11+ realny |
| 10 | 43018 | do 550 zł | Empik | −31% | jedyna pozycja „prezent dla nastolatka" powyżej 500 zł |
| 11 | 21067 | do 950 zł | Smyk | −28% | druga przecena na półce, gdzie mediana to 7,5% |
| 12 | 76354 | powyżej 1 000 zł | Allegro | −32% | jedyny zestaw 1 000 zł+ z rabatem ≥30% |

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
