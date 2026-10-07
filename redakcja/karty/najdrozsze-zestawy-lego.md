# Karta researchu — najdroższe zestawy LEGO dostępne obecnie

- **Artykuł:** `/artykuly/najdrozsze-zestawy-lego/` (20.09.2026, Rankingi)
- **Źródło researchu:** materiał wspólnika (Piotr), plik
  `Rankingi_Najdrozsze_zestawy_LEGO_dostepne_obecnie.docx` (20.09.2026)
- **Data kontroli cen:** 20.09.2026 (`oferty_feed.json` + `sety.json`)

## 1. Weryfikacja liczb Piotra

Sprawdzone **19 pozycji** tabeli wobec naszych danych. **Wszystkie 19 cen
katalogowych zgadza się co do grosza** z `rrp_potwierdzone.json` / `sety.json`.
To najczystszy materiał, jaki dostaliśmy — zwykle poprawiamy 1–2 RRP.

Poziomy rynkowe podane przez Piotra też się bronią; nasze dzisiejsze minimum
mieści się w jego widełkach albo tuż pod nimi:

| Zestaw | Widełki Piotra | Nasze minimum 20.09 | |
|---|---|---|---|
| 75192 Sokół | 2800–3000 | 2799 | zgodne |
| 71043 Hogwart | 1510–1600 | 1509 | zgodne |
| 42172 McLaren P1 | 1390–1450 | 1399 | zgodne |
| 42232 Koenigsegg | 1520–1550 | 1525 | zgodne |
| 75397 Barka Jabby | 1720–1975 | 1727 | zgodne |
| 75367 Venator | 2000–2250 | 2295 | **wyżej** niż widełki |
| 10333 Barad-dûr | 1940–2000 | 1891 | **niżej** niż widełki |
| 10366 Akwarium | 1800–1950 | 1758 | **niżej** niż widełki |

Rozbieżności są w granicach normalnego ruchu cen w ciągu kilku dni i **żadna
nie zmienia tezy tekstu**. Bramki eskalacyjnej nie uruchamiano.

## 2. Jedna rozbieżność, której nie da się zignorować

**75419 Gwiazda Śmierci.** Piotr podaje poziom rynkowy „ok. 3620–3970 zł".
W naszych danych ten zestaw ma **jedną ofertę: LEGO.com, 4199,99 zł** — czyli
cenę katalogową. Nie widzimy żadnej oferty poniżej RRP.

Decyzja redakcyjna: **nie przepisujemy jego widełek**. W tekście zostaje fakt,
który możemy pokazać (jedna oferta, cena katalogowa), a poziom rynkowy pokaże
tabela odświeżana z naszych danych. Nie twierdzimy, że rabatów nie ma — piszemy,
że my ich dziś nie widzimy.

## 3. Ustalenie własne, którego nie ma w materiale Piotra

**76417 Bank Gringotta kosztuje dziś więcej niż katalogowo — 3249 zł przy RRP
1849,99 zł.** Piotr zostawił go w rankingu z adnotacją „ostatnie zestawy /
wyprzedany" i nie podał poziomu rynkowego. Nasze dane pokazują **+76% ponad
cennik**, czyli jedyny zestaw w całym zestawieniu, który jest droższy, a nie
tańszy od katalogu.

To jest najmocniejszy pojedynczy argument tekstu i wchodzi do niego jako osobna
sekcja: ranking „najdroższych" liczony katalogiem stawia Gringotta na przedostatnim
miejscu, a liczony tym, co trzeba zapłacić — w pierwszej trójce.

## 4. Konsekwencja redakcyjna: kwoty z danych, nie z tekstu

Materiał Piotra ma kilkadziesiąt kwot wpisanych ręcznie. Zgodnie ze standardem
(`redakcja/standard-artykulow-biezacych.md` §18–19) do publikacji wchodzą:

- **ceny katalogowe** — wpisane wprost, bo się nie zmieniają,
- **poziomy rynkowe** — jako przedziały z zastrzeżeniem „stan z researchu",
- **dzisiejsze kwoty** — wyłącznie przez znaczniki `<div class="ceny-setu">`,
  które renderują się przy każdym buildzie z tych samych danych co huby.

Dzięki temu tekst nie zacznie kłamać w listopadzie. Piotr oznaczył w materiale
miejsca na tabele (`TABELA CENOWA [...]`) — rozwinęliśmy je na pojedyncze
znaczniki, bo komponent przyjmuje jeden zestaw na tabelę.

## 5. Co świadomie pominięto

- **Rynek wtórny** — Piotr sam wyłączył go z zakresu i to jest słuszne: zestaw
  wycofany dostępny tylko na Allegro i BrickLinku rządzi się inną logiką.
  Wyjątek: Gringotta, bo LEGO wciąż trzyma go w ofercie (§3).
- **Cena za element** jako kryterium rankingu — tekst mówi wprost, dlaczego przy
  tak różnych produktach to ciekawostka, a nie werdykt.

## 6. Rozbieżności

Jedna nierozstrzygnięta (§2, Gwiazda Śmierci) — rozwiązana redakcyjnie przez
niepodawanie widełek, których nie potwierdzamy. Bramka eskalacyjna
nieuruchamiana, bo rozstrzygnięcie nie wymaga decyzji Marka: nie publikujemy
liczby, której nie widzimy w danych.
