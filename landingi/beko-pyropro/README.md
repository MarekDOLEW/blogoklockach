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
scripts/psd-eksport.py     eksport warstw z PSD do img/src/ (główne źródło)
scripts/tnij-layout.mjs    cięcie layoutu JPG (zapasowe: 4 wycinki)
scripts/srcset.mjs         przepisuje srcset/width/height w HTML z plików w img/
layout/                    layout JPG + PSD (zip), tlo-full.jpg (render samego tła)
scripts/obrazy.mjs         optymalizacja: img/src -> img/ (sharp)
scripts/buduj-podglad.mjs  jednoplikowy build do podglądu (dist/)
scripts/zrzuty.mjs         test w Chromium: zrzuty 1400 / 390 px, brakujące obrazy, poziomy scroll
AUDYT-SEO-UX.md       audyt SEO i UX + wyniki Lighthouse
```

## Uruchomienie

```
npm install
npm run psd         # layout PSD -> img/src/ (najpierw rozpakuj layout/*.psd.zip)
npm run srcset      # po `obrazy`: aktualizacja srcset/width/height w index.html
npm run obrazy      # img/src -> img/ (AVIF/WebP/JPG|PNG, 2 szerokości)
npm run build       # dist/index.html (single-file) i dist/artifact.html
npm test            # zrzuty ekranu + kontrola błędów -> dist/zrzut-*.png
npm run serve       # podgląd na http://localhost:8080
```

## Zdjęcia – skąd się biorą

Źródłem jest warstwowy `layout/Beko_Pyroliza_LP_2026.psd` (w repo jako
`.psd.zip`, 1400 px = skala 1:1 desktopu). `npm run psd` (`scripts/psd-eksport.py`,
wymaga `pip install psd-tools pillow`) eksportuje z niego do `img/src/` czyste
warstwy: zdjęcia hero i sekcji końcowej bez wypalonych tekstów, wycinki
(rękawice, balon, produkty, ikony, telefon, pizza) z prawdziwą przezroczystością,
pas stopki, kadry mobilne oraz tła sekcji granatowych (`tlo-intro`, `tlo-zabawa`
– dokładne gradienty). Z PSD pochodzą też font (Encode Sans, Google Fonts),
rozmiary i kolory tekstów oraz kolory kształtów (`css/style.css`, sekcja tokenów).

Cztery wycinki (świnka-rękawica, AGD, laur, logo stopki) pochodzą z kluczowania
koloru na JPG (`npm run tnij`), bo ich warstwy w PSD mają tryby mieszania /
są spłaszczone. Skrypt PSD ich nie nadpisuje.

Po każdej zmianie w `img/src/`: `npm run obrazy` (warianty AVIF/WebP + JPG lub
PNG, 2 szerokości) i `npm run srcset` – ten drugi przepisuje `src`/`srcset`/
`width`/`height` w `index.html` na podstawie plików w `img/`, więc HTML nie
wymaga ręcznych poprawek.

Layout jest w 1×, więc na ekranach retina zdjęcia są nieco miękkie; zdjęcia
w 2× wystarczy wrzucić do `img/src/` pod tymi samymi nazwami.

Współrzędne wszystkich wycinków są w `scripts/tnij-layout.mjs` (obiekt
`prostokaty` i wywołania `klucz`). Elementy layoutu zbudowane w HTML/CSS/SVG,
żeby tekst był indeksowalny i skalował się bez straty: odznaki „59 min” i „47%”,
kafelki PizzaPro / A++ / WiFi, przyciski, strzałki karuzel, gwiazdki opinii.
Zawieszka „Nie przeszkadzać / Sprzątam”: sylwetka to PNG z alfą wygenerowany
z warstwy PSD (`img/src/zawieszka.png`, gradient odczytany z oryginału), tekst
leży na niej w HTML. Rękawice dekoracyjne (wstęp i sekcja „Mniej sprzątania”)
są przypięte do krawędzi okna, więc na szerokich ekranach rozsuwają się poza
pole 1400 px.

## Filmy

`media/` zawiera oryginały spotów (`Beko_Spot_*.mp4`, 1080p) i wersje webowe
zrobione ffmpegiem: `pyropro-header` (spot v3, hero) i `pyropro-technologiczny`
(sekcja wideo) – MP4 H.264 720p ≤ 5 MB oraz WebM VP9 (ok. połowa wagi).
Oba filmy są osadzone inline (`<video muted playsinline loop preload="none">`
w hero i w sekcji wideo): startują wyciszone, gdy co najmniej połowa filmu jest
w oknie, i pauzują poza nim; przycisk na filmie włącza / wycisza dźwięk
(autostart z dźwiękiem blokują przeglądarki). Przy `prefers-reduced-motion`
film nie startuje sam – przycisk go uruchamia. Zdjęcie pod filmem to plakat
widoczny do pierwszej klatki. Modal `<dialog>` (`data-wideo`) zostaje dla
przycisku AeroPerfect.
Ponowna kompresja: patrz komenda w `AUDYT-SEO-UX.md`, sekcja „Media”.

## Szerokość strony

Hero, sekcja końcowa „Więcej czasu” i pas stopki rozciągają się na całą
szerokość przeglądarki (zdjęcia z PSD są w 1400 px, powyżej tej szerokości są
skalowane w górę). Tekst hero i CTA jest w jednostkach `cqw` kontenera, więc
skaluje się razem ze zdjęciem. Pozostałe sekcje mają kolumnę treści 940 px,
a rękawice dekoracyjne trzymają się krawędzi okna.

## Licznik minutnika

Cyfry „59:00” wypalone w zdjęciu minutnika są zamalowane (interpolacja koloru
wyświetlacza), a nad nimi leży wyświetlacz siedmiosegmentowy w SVG. JS odlicza
od 01:00 do 59:00 (3 s, ease-out), gdy sekcja wejdzie w okno; przy
`prefers-reduced-motion` i bez JS wyświetlacz pokazuje od razu 59:00.

## Do uzupełnienia przed publikacją

- docelowy `canonical`/OG w `<head>` (adresy produktów na beko.com są już podpięte),
- film AeroPerfect (przycisk play w sekcji technologii) – brak pliku,
- sekcja „Opinie” – prawdziwe opinie zamiast *lorem ipsum* z layoutu,
- treść przypisów prawnych (`*` 47 % energii, `**` marka nr 1) – do potwierdzenia z klientem,
- minifikacja CSS/JS i nagłówki cache po stronie serwera (patrz audyt).
