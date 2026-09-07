# Beko PyroPro – landing page

Statyczny landing (HTML + CSS + JS, bez frameworka) odtworzony z layoutu
`Beko_Pyroliza_LP_2026.jpg`. Desktop projektowany na **1400 px**, wersja
mobilna od 360 px, tablet pomiędzy. Cała treść jest prawdziwym tekstem
(indeksowalnym), grafika wyłącznie tam, gdzie naprawdę jest zdjęciem.

## Struktura

```
index.html            strona (semantyczny HTML, meta SEO, JSON-LD, sprite ikon SVG)
css/style.css         tokeny, siatka 1400 px, breakpointy 768 / 1100 / 1400 px
js/main.js            karuzele (scroll-snap), modal wideo (<dialog>), animacje wejścia
img/src/              ŹRÓDŁA zdjęć (tu podmieniamy placeholdery na prawdziwe wycinki)
img/                  wygenerowane warianty AVIF / WebP / JPG w 2 szerokościach
scripts/placeholdery.mjs   generuje placeholdery w docelowych wymiarach
scripts/obrazy.mjs         optymalizacja: img/src -> img/ (sharp)
scripts/buduj-podglad.mjs  jednoplikowy build do podglądu (dist/)
scripts/zrzuty.mjs         test w Chromium: zrzuty 1400 / 390 px, brakujące obrazy, poziomy scroll
AUDYT-SEO-UX.md       audyt SEO i UX + wyniki Lighthouse
```

## Uruchomienie

```
npm install
npm run obrazy      # po podmianie zdjęć w img/src/
npm run build       # dist/index.html (single-file) i dist/artifact.html
npm test            # zrzuty ekranu + kontrola błędów -> dist/zrzut-*.png
npm run serve       # podgląd na http://localhost:8080
```

## Podmiana placeholderów na prawdziwe zdjęcia

Zdjęcia z layoutu nie były dostępne jako plik w środowisku budowania, więc
`img/src/` zawiera placeholdery w docelowych proporcjach. Procedura:

1. Wytnij z layoutu zdjęcie i zapisz pod tą samą nazwą w `img/src/`
   (najlepiej w **2× szerokości** z tabeli, żeby wariant retina był ostry).
2. `npm run obrazy` – powstaną warianty `-<szer>.avif/.webp/.jpg`.
3. Jeśli źródło ma inną szerokość niż w tabeli, popraw `srcset` w `index.html`
   (nazwy plików zawierają szerokość).

| plik w img/src/          | wymiar 1× | użycie                                   |
|--------------------------|-----------|------------------------------------------|
| hero.jpg                 | 1400×700  | tło hero (desktop)                       |
| hero-mobile.jpg          | 780×880   | tło hero (mobile, kadr pionowy)          |
| rekawica-balon.jpg       | 640×640   | „Bezpieczne czyszczenie”                 |
| sciereczka.jpg           | 520×360   | „Szybki efekt” (minutnik jest w HTML)    |
| skarbonka-rekawica.jpg   | 520×440   | „Niskie zużycie prądu”                   |
| wideo-plakat.jpg         | 1400×620  | plakat filmu PyroPro                     |
| produkt-1…4.jpg          | 400×400   | karty piekarników                        |
| piekarnik-zawieszka.jpg  | 800×800   | „Mniej sprzątania” (zawieszka jest w HTML)|
| rekawica-lewa/prawa.jpg  | 420×640   | dekoracje po bokach (tylko ≥1400 px); najlepiej PNG/WebP z przezroczystością |
| homewhiz-telefon.jpg     | 420×700   | HomeWhiz                                 |
| aeroperfect.jpg          | 640×440   | AeroPerfect (plakat filmu)               |
| pizza.jpg                | 640×440   | PizzaPro                                 |
| final.jpg                | 1400×560  | tło sekcji „Więcej czasu”                |
| agd.jpg                  | 640×260   | stopka                                   |

Elementy graficzne z layoutu, które celowo są zbudowane w HTML/CSS/SVG (a nie
jako obrazki), żeby tekst był czytelny dla Google i skalował się bez straty:
odznaki „59 min” i „47%”, minutnik 59:00, zawieszka „Nie przeszkadzać / Sprzątam”,
ikony (tarcza, zegar, skarbonka, Wi‑Fi, pizza, A++, laur), logo Beko (wordmark
tymczasowy – podmienić na oficjalne SVG w trzech miejscach: hero, plakat wideo, stopka).

## Do uzupełnienia przed publikacją

- adresy `href` przy przyciskach „Sprawdź” (4 karty) i docelowy `canonical`/OG w `<head>`,
- filmy: atrybut `data-wideo` na przyciskach play (URL YouTube lub plik MP4),
- sekcja „Opinie” – prawdziwe opinie zamiast *lorem ipsum* z layoutu,
- treść przypisów prawnych (`*` 47 % energii, `**` marka nr 1) – do potwierdzenia z klientem,
- symbole modeli piekarników odczytane z layoutu – zweryfikować,
- minifikacja CSS/JS i nagłówki cache po stronie serwera (patrz audyt).
