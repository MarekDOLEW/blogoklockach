# Wzorzec: prezentownik jednej serii

Wzór na produkcji: `/prezentowniki/lego-friends/`
Plik: `src/pages/prezentowniki/lego-<seria>.astro`

## Zmiana wobec wzoru: osiem zestawów, nie sześć

Galeria na górze układa się po **cztery zdjęcia w rzędzie**. Sześć pozycji daje
rząd pełny i rząd z dwiema sierotami; osiem daje dwa równe rzędy i lepiej
wygląda na listingu. **Osiem to liczba docelowa dla nowych prezentowników.**

Ośmiu pozycji nie dobieramy „żeby było" — mają pokryć osiem różnych sytuacji
zakupowych. Sprawdzona drabina:

| # | Rola | Orientacyjny próg |
|---|---|---|
| 1 | drobiazg / dodatek do prezentu | do 25 zł |
| 2 | mały prezent | do 60 zł |
| 3 | pierwszy zestaw z serii | do 90 zł |
| 4 | średni budżet, dużo zabawy | do 150 zł |
| 5 | klasyczny prezent urodzinowy | do 180 zł |
| 6 | mocna pozycja dla fana serii | do 260 zł |
| 7 | prezent „na wypasie" | do 400 zł |
| 8 | wielki prezent / model dla dorosłego | powyżej 450 zł |

Jeśli seria nie ma sensownej pozycji w którymś progu, przesuwamy próg — nie
wstawiamy słabego zestawu, żeby zapełnić rubrykę. Lepiej siedem dobrych niż
osiem z zapchajdziurą; wtedy w komentarzu w pliku piszemy dlaczego.

## Szkielet pliku

```astro
---
import Prezentownik from '../../layouts/PrezentownikSerii.astro';
import Galeria from '../../components/GaleriaZestawow.astro';
import Karta from '../../components/KartaPrezentu.astro';

// <Seria>: ile zestawów w sprzedaży, mediana przeceny, co wyróżnia serię przy
// doborze prezentu. Ten komentarz jest notatką researchową — zostaje w pliku.
const SKLEPY = ['mediaexpert', 'allegro', 'planetaklockow'];

export const meta = {
  url: '/prezentowniki/lego-<seria>/',
  kategoria: 'Prezentownik',
  kolejnosc: 0,              // pozycja na hubie przy tej samej dacie
  znacznik: '<Seria>',       // krótka plakietka na karcie listingu
  tytul: 'Prezent z LEGO <Seria>',
  opis: 'Osiem zestawów, od … do … . Jedno zdanie o tym, co wyróżnia serię.',
  data: 'RRRR-MM-DD',
  okladka: '<numer najbardziej reprezentatywnego zestawu>',
};

const zestawy = [
  { nr: '', nazwa: '', etykieta: 'Do 25 zł',      rrp: 0, dobra: 0 },
  { nr: '', nazwa: '', etykieta: 'Do 60 zł',      rrp: 0, dobra: 0 },
  { nr: '', nazwa: '', etykieta: 'Do 90 zł',      rrp: 0, dobra: 0 },
  { nr: '', nazwa: '', etykieta: 'Do 150 zł',     rrp: 0, dobra: 0 },
  { nr: '', nazwa: '', etykieta: 'Do 180 zł',     rrp: 0, dobra: 0 },
  { nr: '', nazwa: '', etykieta: 'Do 260 zł',     rrp: 0, dobra: 0 },
  { nr: '', nazwa: '', etykieta: 'Do 400 zł',     rrp: 0, dobra: 0 },
  { nr: '', nazwa: '', etykieta: 'Wielki prezent', rrp: 0, dobra: 0 },
];

const faq = [
  { q: 'Czym <Seria> różni się w zabawie od <sąsiedniej serii>?', a: '' },
  { q: 'Od jakiego wieku ma sens?', a: '' },
  { q: 'Ile realnie kosztują zestawy <Seria> w sklepach?', a: '' },
  { q: 'Które zestawy <Seria> znikają z rynku?', a: '' },
];
---
<Prezentownik title="…" opis="…" data="…" zaktualizowano="…" faq={faq} zestawy={zestawy}>
  <p>Otwarcie: <b>jedna rzecz</b>, która decyduje o trafności prezentu z tej serii.</p>
  <p>Druga rzecz, którą trzeba wiedzieć przed zakupem — najlepiej ta mniej przyjemna.</p>

  <Galeria zestawy={zestawy} />

  <h2>Drobiazg do 25 zł: …</h2>
  <Karta nr="" nazwa="" … />
  <!-- …osiem sekcji, po jednej na zestaw… -->
</Prezentownik>
```

## Czego pilnować

- **`rrp` musi zgadzać się z danymi serwisu.** Sprawdź `node scripts/kontrola-rrp.mjs`;
  przy rozbieżności rozstrzyga polski cennik LEGO, nie przelicznik z euro.
- **`dobra` to ocena, nie odczyt z feedu** — poziom, przy którym zestaw ma sens.
  Nie kopiujemy tu chwilowej najniższej ceny.
- Każda sekcja odpowiada na: dla kogo, co po zbudowaniu, przy jakiej cenie brać.
- Terminy wycofań traktujemy jak cenę: jeśli zestaw znika w tym roku, mówimy to
  wprost — przy prezencie termin bywa ważniejszy od kwoty.
- Na końcu link do innych prezentowników i do serii w katalogu.
