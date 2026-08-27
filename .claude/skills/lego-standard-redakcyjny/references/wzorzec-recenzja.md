# Wzorzec: recenzja jednego zestawu

Wzór na produkcji: `/artykuly/lego-71858-kuznia-cztery-bronie-recenzja/`
Plik: `src/pages/artykuly/lego-<nr>-<slug>-recenzja.md`
Kategoria: **Recenzje**

## Zmiana wobec wzoru: zdjęcia na całą szerokość kolumny

Slajder w treści nie jest już kartą. Zdjęcie zajmuje **pełną szerokość kolumny
tekstu**, bez białej ramki, bez obrysu i bez cienia; kadr 4:3 zamiast kwadratu,
bo zdjęcia produktowe LEGO są poziome i kwadrat zostawiał pasy pustego tła.
Podpis stoi pod zdjęciem, bez linii oddzielającej.

Nie wymaga to niczego w treści artykułu — znacznik zostaje ten sam:

```html
<div class="galeria-setow" data-sety="71858"></div>
<div class="galeria-setow" data-sety="71866,71860,71837"></div>
```

Jeden numer = jedno zdjęcie na całą szerokość. Kilka numerów = slajder ze
strzałkami i kropkami.

## Szkielet pliku

```markdown
---
layout: ../../layouts/Artykul.astro
title: "LEGO <SERIA> <NR> <Nazwa> — <teza w kilku słowach>"
opis: "<Liczba> elementów, <co wyróżnia>. Recenzja: <główny problem zakupowy>. Próg zakupu: ok. <kwota> zł."
data: "RRRR-MM-DD"
kategoria: "Recenzje"
okladka: "<nr>"
tagi: ["Dla rodziców"]        # opcjonalnie — do kogo tekst jest pisany
faq:
  - q: "Ile kosztuje LEGO <nr>?"
    a: ""
  - q: "<pytanie o zawartość — minifigurki, funkcje>"
    a: ""
  - q: "<pytanie o odbiorcę — czy dla dziecka>"
    a: ""
  - q: "<pytanie o wartość kolekcjonerską albo alternatywy>"
    a: ""
---

Otwarcie: dlaczego ten zestaw jest ciekawy — teza, nie streszczenie pudełka.

<div class="galeria-setow" data-sety="<nr>"></div>

Kontekst: skąd ten zestaw się wziął, do czego się odnosi.

## Podstawowe dane

| | LEGO <NR> <Nazwa> |
|---|---|
| Seria | [<Seria>](/serie/<slug>/) |
| Premiera | |
| Elementy | |
| Wiek | |
| Wymiary | |
| Cena katalogowa | |

## <Śródtytuł o najmocniejszej stronie zestawu>
## <Śródtytuł o budowaniu — jeśli istotne>
## <Śródtytuł o gotowym modelu / bawialności / ekspozycji>
## <Śródtytuł o ograniczeniu, które trzeba znać przed zakupem>

## Cena

Zdanie o tym, dlaczego cena katalogowa jest albo nie jest punktem odniesienia.

| Pozycja | Poziom |
|---|---|
| Cena katalogowa | |
| Cena jeszcze rozsądna | |
| **Próg zakupu** | |
| Bardzo dobra cena | |
| Poziom okazji | |

<div class="ceny-setu" data-set="<nr>"></div>

Pełną kartę zestawu z historią cen znajdziesz na [stronie zestawu <nr>](/zestaw/<nr>/).

## A jeśli szukamy czegoś innego?

<div class="galeria-setow" data-sety="<nr alternatywy>,<nr alternatywy>"></div>

## Potencjał kolekcjonerski

## Czy warto kupić LEGO <nr>?

Rekomendacja: **KUP TERAZ / KUP W DOBREJ PROMOCJI / POCZEKAJ / OMIŃ**.

---

*Zobacz też: [wszystkie zestawy <Seria>](/serie/<slug>/) · [<powiązany nasz artykuł>](…) · [prezentownik <Seria>](/prezentowniki/lego-<seria>/)*
```

## Czego pilnować

- **Żadnej ręcznie wpisanej ceny sklepowej** — tylko drabina (ocena) i znacznik
  `ceny-setu` (Standard §18.1). Bez daty sprawdzenia w treści.
- Cena katalogowa zgodna z danymi serwisu: `node scripts/kontrola-rrp.mjs`.
- Śródtytuły piszemy pod konkretny zestaw — nie kopiujemy tych samych nagłówków
  do każdej recenzji (antywzorzec ze Standardu §27).
- Zależność od licencji określamy wprost: niska / umiarkowana / wysoka.
- Stopka „Zobacz też" prowadzi do **co najmniej jednego naszego tekstu**, nie
  tylko do listingów.
