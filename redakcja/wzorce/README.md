# Wzorce artykułów

Gotowe szkielety do kopiowania przy nowym tekście. Każdy wzorzec opisuje
strukturę, pola i decyzje, których nie widać w gotowym artykule.

| Wzorzec | Kiedy | Wzór na produkcji |
|---|---|---|
| [prezentownik-serii.md](prezentownik-serii.md) | prezent z jednej serii LEGO | `/prezentowniki/lego-friends/` |
| [recenzja-zestawu.md](recenzja-zestawu.md) | jeden zestaw od środka | `/artykuly/lego-71858-kuznia-cztery-bronie-recenzja/` |

Do dopisania: premiery, ranking, porównanie, poradnik, kalendarz, tekst historyczny.
Kontrola pokrycia: `node scripts/eksport-skilli.mjs --sprawdz` wypisuje kategorie bez wzorca.

Wzorce trafiają do skilli: recenzja → `lego-standard-redakcyjny`,
prezentownik → `lego-standard-sprzedazowy` (eksport `scripts/eksport-skilli.mjs`).

## Nazewnictwo — obowiązuje od 27.08.2026

**Tytuł roboczy i nazwa pliku zaczynają się od kategorii.** Po samej nazwie ma
być widać, do którego działu tekst trafia:

```
Recenzja LEGO 71858 Kuźnia Cztery Bronie
Ranking najlepszych zestawów Technic do 300 zł
Porównanie 60506 i 60511 — który pociąg dla dziecka
Poradnik: jak czytać ceny katalogowe LEGO
```

Kategoria w `frontmatter` musi być jedną z siedmiu z
`src/data/kategorie_artykulow.json`: **Premiery, Recenzje, Rankingi,
Porównania, Poradniki, Kalendarze, Historyczne**.

Prezentownik nie jest kategorią artykułu — ma własny dział `/prezentowniki/`
i nie pokazuje się na liście artykułów.

## Reguły wspólne

- Research i karta researchu (`redakcja/karty/`) **przed** tekstem — Metodologia §10.
- Ceny sklepowe wchodzą znacznikiem `<div class="ceny-setu" data-set="<nr>"></div>`,
  nigdy wpisywane ręcznie (Standard §18.1).
- Cena katalogowa w tekście musi zgadzać się z danymi serwisu:
  `node scripts/kontrola-rrp.mjs`.
- Zdjęcia w treści: `<div class="galeria-setow" data-sety="60496,60497"></div>`.
- Linkujemy wewnętrznie: do serii, do hubów zestawów i **do innych naszych
  tekstów o tym samym temacie**.
