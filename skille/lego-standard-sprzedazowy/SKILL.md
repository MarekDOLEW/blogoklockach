---
name: lego-standard-sprzedazowy
description: >-
  Standard treści sprzedażowych serwisu tylkoklocki.pl — dział Prezentowniki oraz
  krótkie formy dealowe. Używaj przy: prezentownik serii LEGO, prezentownik
  według wieku lub budżetu, "co kupić na prezent", post dealowy, alert cenowy,
  opis promocji, "okazja dnia", karta zestawu, snippet na newsletter lub social.
  Triggeruj przy frazach "zrób prezentownik", "co kupić dziecku", "prezent
  z LEGO", "napisz o tej promocji", "spadła cena", "zrób deala na ten set".
  NIE używaj do recenzji, rankingu, porównania, poradnika ani artykułu o nowej
  fali — tam obowiązuje skill lego-standard-redakcyjny. Skill pisze pod konwersję
  afiliacyjną, w dwóch tonacjach: dla rodziców i dla AFOL.
---

# Standard sprzedażowy — Prezentowniki i krótkie formy

> **Ten plik jest generowany.** Źródłem są dokumenty w repo `blogoklockach`:
> `redakcja/`. Nie edytuj skilla na claude.ai — poprawka przepadnie przy
> następnym eksporcie. Zmieniasz dokument w repo i uruchamiasz
> `node scripts/eksport-skilli.mjs`.
>
> Rola tego skilla: teksty do `/prezentowniki/` oraz krótkie formy dealowe, pisane pod decyzję zakupową.

## Granica wobec standardu redakcyjnego

Granicę wyznacza **dział serwisu, nie długość tekstu**:

| Tekst trafia do | Standard |
|---|---|
| `/artykuly/` — siedem kategorii | `lego-standard-redakcyjny` |
| `/prezentowniki/` | **ten skill** |
| krótka forma dealowa (post, alert, karta zestawu) | **ten skill** |

Prezentownik z ośmioma zestawami nadal jest prezentownikiem — liczba pozycji
niczego tu nie rozstrzyga.

## Prezentownik serii — reguły

- **Osiem zestawów.** Galeria układa się po cztery w rzędzie, więc osiem daje dwa
  równe rzędy. Sześć zostawia dwie sieroty w drugim rzędzie.
- Osiem pozycji ma pokryć **osiem sytuacji zakupowych**, nie osiem ładnych
  pudełek — drabina progów jest we wzorcu.
- Jeśli seria nie ma sensownej pozycji w którymś progu, **przesuwamy próg**.
  Lepiej siedem dobrych niż osiem z zapchajdziurą.
- Terminy wycofań traktujemy jak cenę: gdy zestaw znika w tym roku, mówimy to
  wprost. Przy prezencie termin bywa ważniejszy od kwoty.
- Każda sekcja odpowiada na trzy pytania: dla kogo, co po zbudowaniu, przy jakiej
  cenie brać.

## Czego nie robimy

- **Nie wpisujemy cen sklepowych do treści** — tak samo jak w artykułach.
  Podajemy RRP, dobrą cenę i próg zakupu; kwoty wstawia redakcja techniczna.
- Nie tworzymy sztucznej presji zakupowej ani pozornej pilności.
- Nie przedstawiamy typowej ceny rynkowej jako wyjątkowej promocji.
- Nie dzielimy prezentów według płci dziecka — kryterium jest sposób zabawy
  (budowanie, przebudowa, mechanika, role-play, ekspozycja, licencja).
- Nie ukrywamy wad, żeby podnieść konwersję. Wiarygodność jest warta więcej niż
  pojedyncze kliknięcie.

## Dokumenty

| Plik | Co zawiera |
|---|---|
| `references/wzorzec-prezentownik.md` | szkielet prezentownika serii, drabina ośmiu progów |
| `references/ustalenia-projektowe.md` | ceny, linki, ograniczenia infrastruktury |
| `references/sklepy-i-afiliacja.md` | wybór sklepów publikacyjnych, bezstronność afiliacji |
| `references/standard-artykulow.md` | standard redakcyjny — do zajrzenia przy ocenie zestawu |
