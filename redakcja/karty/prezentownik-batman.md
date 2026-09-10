# Karta researchu — prezentownik LEGO Batman

Dokument wewnętrzny. Nie jest częścią publikowanego tekstu.

## 1. Skąd ten temat

Radar konkurencji 10.09.2026: przy okazji Batman Day (9–19.09) konkurencja
wymieniła osiem zestawów w promocji, a nasz katalog miał **pięć**. Dwa z nich
(76303, 76304) były w trwającej promocji, miały oferty w czterech sklepach
i **nie miały u nas strony** — czyli ani tabeli cen, ani linku afiliacyjnego.

Batman był też jedyną dużą licencją bez prezentownika: mieliśmy trzynaście
innych serii. Wchodzi w sezon prezentowy i akurat jest w oknie promocyjnym.

## 2. Uzupełnienie katalogu (warunek wstępny)

Dodane do `katalog.json` → `Batman`, ze źródłem w polu `cena_zrodlo`:

| Numer | Nazwa | Rok | Elementy | Katalogowa |
|---|---|---|---|---|
| 76300 | Arkham Asylum | 2025 | 2953 | 1299,99 |
| 76301 | Batman i Batmobil kontra Mr. Freeze | 2025 | 63 | 89,99 |
| 76303 | Tumbler Batmana kontra Dwie Twarze i Joker | 2025 | 429 | 249,99 |
| 76304 | Batmobil Batman Forever | 2025 | 909 | 419,99 |
| 76328 | Klasyczny serial telewizyjny Batman — Batmobil | 2024 | 1822 | 649,99 |

Ceny 76303 i 76304 mają **dwa niezależne potwierdzenia**: listę promocyjną
Batman Day z 9.09 i porównywarki. Pozostałe trzy — porównywarki PL.

**Świadomie nie dodane:** 76302 (Mech Supermana — to Superman, nie Batman,
a katalog nie ma serii DC; decyzja o jej założeniu należy do Zwiadowcy),
40859 (jest w `sety.json` jako BrickHeadz z dystrybucją ekskluzywną),
30726 (polybag-gratis, brak ceny detalicznej).

## 3. Oś prezentownika

**Pytanie:** kupuję prezent „z Batmanem" — co właściwie dostanę i dla kogo to jest?

**Teza, na której stoi tekst.** Batman w LEGO to nie jedna półka, tylko **dwie
rozłączne**, a pomylenie ich jest tu najczęstszym błędem prezentowym:

1. **Zabawa** — scenki i Batmobile 9+, od 90 do 250 zł, do jeżdżenia i odgrywania;
2. **Ekspozycja** — modele 18+, od 650 zł w górę, których się nie dotyka po złożeniu.

Między nimi jest przerwa: Logo Batmana (12+) i Batmobil Batman Forever to strefa
pośrednia. **Cena nie rozstrzyga o odbiorcy** — Tumbler za 250 zł jest zabawką,
a Batmobil z serialu za 650 zł nie jest.

## 4. Drabina — odstępstwo od wzorca

Wzorzec przewiduje osiem progów od 25 zł. **Batman nie ma detalicznego zestawu
poniżej 90 zł.** Jedyna pozycja w tym przedziale to polybag 30726, który jest
gratisem z Batman Day, a nie towarem. Zgodnie z regułą standardu („jeśli seria
nie ma sensownej pozycji w progu, przesuwamy próg") drabina zaczyna się od 90 zł
i mówimy w tekście wprost, dlaczego.

| # | Numer | Rola |
|---|---|---|
| 1 | 76301 | najtańsze wejście, 2 minifigurki |
| 2 | 76332 | pierwszy Batmobil, najlepszy przelicznik w progu |
| 3 | 76303 | scenka z dwoma złoczyńcami — **znika 31.12.2026** |
| 4 | 76330 | ekspozycja 12+, nie zabawka |
| 5 | 76304 | duży pojazd — **znika 31.12.2026** |
| 6 | 76328 | sentyment dorosłego, serial z lat 60. |
| 7 | 76355 | najnowszy, premiera 09.2026 |
| 8 | 76300 | wielki prezent, 16 minifigurek |

**Odrzucone:** 76331 i 76333 — trzy Batmobile po 124,99 zł to ta sama sytuacja
zakupowa; wybrany 76332 ma najwięcej elementów z tej trójki (330).

## 5. Niepewności

1. **Wycofania 76303 i 76304 na 31.12.2026** podają porównywarki, nie LEGO.
   Zgodnie z progiem dowodowym z RUNBOOK-a **nie dopisujemy ich do
   `/wycofania/`**; w tekście mówimy „zapowiadane", nie „potwierdzone".
2. **Dwie anomalie w naszym feedzie**, zgłoszone Łowcy: Empik pokazuje 45,00 zł
   za 76328 (1822 el., katalog 649,99), a Planeta Klocków 2589,99 zł za 76355
   przy katalogu 899,99. Obie kwoty pomijam przy ustalaniu poziomów.
3. **76300 i 76328 prawie nie schodzą z ceny** — odpowiednio 3% i 1% poniżej
   katalogu. Progi ustawiam poniżej dzisiejszego rynku, bo to poziomy docelowe,
   nie odczyt z feedu.

## 6. Bibliografia

Dane własne: `katalog.json`, `sety.json`, `oferty_feed.json` (stan 10.09.2026),
`wycofania.json` (kontrola — żaden z ośmiu nie jest na naszej liście).
Zewnętrzne: lista promocyjna Batman Day (faniklockow, 09.09.2026) oraz karty
produktowe promoklocki.pl i zklockow.pl — parametry i ceny katalogowe.
