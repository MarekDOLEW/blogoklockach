# Karta researchu — wycofania grudnia 2026

Dokument wewnętrzny. Nie jest częścią publikowanego tekstu.

## 1. Zakres i pytanie

**Kategoria:** Kalendarze. **Okno:** 17–30.09.2026 (przesunięte z 1–20.10
decyzją Marka 16.09, po tym jak LEGO potwierdziło listę).

**Pytanie artykułu:** LEGO potwierdziło wycofanie ponad stu zestawów z końcem
2026 roku. Które z nich kupić teraz, a przy których jest już za późno?

**Dlaczego teraz, a nie w październiku.** LEGO ogłosiło listę 14 września
w dziale „Ostatnie Sztuki". To pierwszy moment w tym sezonie, gdy możemy pisać
o wycofaniach na danych od producenta zamiast na prognozach — i jednocześnie
moment, w którym czytelnik podejmuje decyzję.

## 2. Populacja i metoda

Z `wycofania.json` wzięte wyłącznie pozycje ze statusem **`potwierdzone`**
(sygnał od LEGO), skrzyżowane z `katalog.json` (cena katalogowa) i
`oferty_feed.json` (bieżące oferty sklepowe). Po filtrze: **206 zestawów**
mających jednocześnie cenę katalogową i żywą ofertę.

Prognozy (`przewidywane`) świadomie pominięte — tekst ma stać na danych
poziomu A.

## 3. Ustalenie główne: wycofanie nie znaczy „kupuj"

| | Wartość |
|---|---|
| Mediana rabatu wobec ceny katalogowej | **18%** |
| Zestawy już **droższe** niż cennik | **54 z 206 (26%)** |
| Rabat 25% i więcej | 81 |
| Rabat 10–25% | 54 |

Co czwarty potwierdzony „ostatni moment" jest już droższy od ceny katalogowej.
To jest teza tekstu: **wycofanie to sygnał „sprawdź", a nie „kup".**

## 4. Ustalenie drugie i mocniejsze: liczy się liczba sklepów

Skrzyżowanie rabatu z liczbą sklepów mających zestaw w ofercie:

| Sklepów z ofertą | Zestawów | Mediana rabatu | Powyżej cennika |
|---|---|---|---|
| 1 | 6 | **−153%** | 5 z 6 |
| 2 | 20 | −12% | 16 z 20 |
| 3 | 38 | −5% | 21 z 38 |
| 4 | 41 | **+11%** | 11 z 41 |

**Im mniej sklepów ma zestaw, tym drożej.** Zależność jest jednokierunkowa
i bez wyjątków w żadnym przedziale.

To najcenniejsza część tekstu z dwóch powodów. Po pierwsze, daje czytelnikowi
regułę, którą stosuje sam. Po drugie, **nasze podstrony zestawów pokazują
dokładnie tę informację** — tabela cen wymienia sklepy z ofertą. Czytelnik
widzi jeden wiersz i wie, że jest za późno.

## 5. Ustalenia pomocnicze

**Wg serii** (mediana rabatu, min. 6 zestawów): Friends 29%, Marvel 27%,
Speed Champions 26%, Star Wars 22%, Ninjago 16%, Technic 16%, Creator 14%,
Icons 13%, Harry Potter 13%, **Ideas −5%**, **City −8%**.

**Wg półki cenowej:** do 200 zł mediana 12% (38% powyżej cennika),
200–700 zł mediana 24% (tylko 11% powyżej cennika), 700+ zł mediana 11%
(36% powyżej cennika). Środkowa półka jest najbezpieczniejsza; skrajne
najszybciej uciekają.

**Duże zestawy — rozrzut jest brutalny:** 75367 Venator −29% i 75192 Sokół
Millennium −22% wciąż poniżej cennika, podczas gdy 76417 Bank Gringotta jest
**72% powyżej**, 21344 Orient Express 50% powyżej, 10305 Zamek rycerzy 37%
powyżej.

## 6. Niepewności

1. **Liczby są pomiarem z dnia pisania.** Rabaty i mediany zmienią się.
   W tekście podajemy je jako zmierzone i datowane w akapicie źródłowym;
   kwoty per zestaw idą znacznikiem `ceny-setu`, który odświeża się przy
   każdym budowaniu.
2. **Pięć pozycji ma u nas status `przewidywane`**, a serwisy branżowe podają
   je jako potwierdzone (21333, 21351, 21353, 21356, 76437). Nie weszły do
   populacji — do przeglądu przez runner Wycofań.
3. **Oferta z jednego sklepu bywa artefaktem.** Przy sześciu zestawach
   z jedną ofertą mediana −153% jest napędzana wystawkami kolekcjonerskimi.
   Kierunek zależności to nie zmienia, ale w tekście nie podajemy tej liczby
   jako precyzyjnej — mówimy „wielokrotnie powyżej cennika".

## 7. Bibliografia

Dane własne: `src/data/wycofania.json` (status `potwierdzone`),
`src/data/katalog.json`, `src/data/oferty_feed.json`, `src/data/sety.json`.
Zewnętrzne: ogłoszenie LEGO z 14.09.2026 (dział „Ostatnie Sztuki" na lego.com),
odnotowane przez faniklockow.pl i fanklockow.pl tego samego dnia.
