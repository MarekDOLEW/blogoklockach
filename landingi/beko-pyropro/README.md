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
scripts/tnij-layout.mjs    cięcie layoutu JPG na zasoby (img/src/)
layout/                    źródłowy layout JPG (1400 px)
scripts/obrazy.mjs         optymalizacja: img/src -> img/ (sharp)
scripts/buduj-podglad.mjs  jednoplikowy build do podglądu (dist/)
scripts/zrzuty.mjs         test w Chromium: zrzuty 1400 / 390 px, brakujące obrazy, poziomy scroll
AUDYT-SEO-UX.md       audyt SEO i UX + wyniki Lighthouse
```

## Uruchomienie

```
npm install
npm run tnij        # layout JPG -> img/src/
npm run obrazy      # img/src -> img/ (AVIF/WebP/JPG|PNG, 2 szerokości)
npm run build       # dist/index.html (single-file) i dist/artifact.html
npm test            # zrzuty ekranu + kontrola błędów -> dist/zrzut-*.png
npm run serve       # podgląd na http://localhost:8080
```

## Zdjęcia – skąd się biorą

Źródłem jest `layout/Beko_Pyroliza_LP_2026.jpg` (1400 px = skala 1:1 desktopu).
`npm run tnij` (`scripts/tnij-layout.mjs`) wycina z niego wszystkie zasoby do
`img/src/`: prostokąty z płaskim tłem jako JPG, elementy na granacie / niebieskim
(rękawice, balon, minutnik, ikony, AGD, laur, logo) jako PNG z przezroczystością
(kluczowanie kolorem tła). Wypalone w zdjęciach teksty hero i sekcji końcowej
są maskowane gładką plamą, a przyciski play / odznaka / CTA są zakryte tymi
samymi elementami w HTML, pozycjonowanymi w jednostkach `cqw` kadru – pokrywają
się z wypalonymi na każdej szerokości.

Layout jest w 1×, więc na ekranach retina zdjęcia są nieco miękkie. Gdy pojawi
się plik PSD lub zdjęcia w 2×, wystarczy podmienić pliki w `img/src/` (te same
nazwy, 2× szerokość) i uruchomić `npm run obrazy`; dla hero i sekcji końcowej
dodatkowo zniknie potrzeba maskowania tekstu.

Współrzędne wszystkich wycinków są w `scripts/tnij-layout.mjs` (obiekt
`prostokaty` i wywołania `klucz`). Elementy layoutu zbudowane w HTML/CSS/SVG,
żeby tekst był indeksowalny i skalował się bez straty: odznaki „59 min” i „47%”,
kafelki PizzaPro / A++ / WiFi, zawieszka „Nie przeszkadzać / Sprzątam”, przyciski,
strzałki karuzel, gwiazdki opinii.

## Do uzupełnienia przed publikacją

- adresy `href` przy przyciskach „Sprawdź” (4 karty) i docelowy `canonical`/OG w `<head>`,
- filmy: atrybut `data-wideo` na przyciskach play (URL YouTube lub plik MP4),
- sekcja „Opinie” – prawdziwe opinie zamiast *lorem ipsum* z layoutu,
- treść przypisów prawnych (`*` 47 % energii, `**` marka nr 1) – do potwierdzenia z klientem,
- minifikacja CSS/JS i nagłówki cache po stronie serwera (patrz audyt).
