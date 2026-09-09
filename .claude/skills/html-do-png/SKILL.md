---
name: html-do-png
description: >
  Renderuje HTML+CSS do PNG przez Playwright (headless Chromium) skryptem
  scripts/html-do-png.mjs. Używaj ZAWSZE, gdy trzeba zamienić plik HTML na
  obraz: grafika do posta na Instagram/Facebook/TikTok, karuzela (każdy slajd
  osobny PNG), miniatura, okładka, obraz OG z HTML, "zrób z tego PNG",
  "wyeksportuj slajdy", "zrzut tego HTML-a". To wspólny silnik eksportu dla
  skilli instagram-carousel, threads-carousel i klocki-social — używaj go zamiast
  ich własnych instrukcji z pip/bun, bo działa w repo bez instalowania
  przeglądarki (w chmurze i lokalnie z Google Chrome).
---

# HTML+CSS → Playwright → PNG

## Kiedy

Każda grafika, którą łatwiej opisać w HTML/CSS niż rysować: post, karuzela,
miniatura, tabela porównawcza jako obrazek, cytat, "okazja dnia" do social.
Nie do obrazów OG artykułów — te robi `scripts/generuj-og.py` (Pillow, bez
przeglądarki) i tak ma zostać.

## Jak

1. Napisz plik HTML z całym CSS w środku. Fonty: system albo `@font-face`
   z lokalnego pliku / base64. Obrazy: ścieżka względna do pliku albo base64.
   Nic z sieci — w chmurze zewnętrzne zasoby mogą nie dojść i render wyjdzie pusty.
2. Karuzela = jeden HTML, każdy slajd w elemencie o stałym rozmiarze
   (np. `<section class="slajd">` 1080×1350). Skrypt zrzuca każdy element osobno.
3. Uruchom:

```bash
node scripts/html-do-png.mjs grafiki/post.html                                  # 1 PNG 1080x1350
node scripts/html-do-png.mjs grafiki/karuzela.html --selector .slajd --out out/  # slajd-01.png, -02...
node scripts/html-do-png.mjs grafiki/ --w 1200 --h 630                          # katalog, format OG
node scripts/html-do-png.mjs post.html --scale 2                                # retina (2160x2700)
```

Opcje: `--out`, `--w`, `--h`, `--scale`, `--selector`, `--full`, `--czekaj <ms>`.

4. Obejrzyj wynik (Read na PNG) zanim oddasz — sprawdź obcięty tekst, brakujące
   fonty, puste miejsca po obrazach.

## Rozmiary

| Cel | --w | --h |
|---|---|---|
| Post / karuzela IG 4:5 (domyślne) | 1080 | 1350 |
| Kwadrat IG/FB | 1080 | 1080 |
| Stories / Reels / TikTok | 1080 | 1920 |
| OG / link FB | 1200 | 630 |
| YouTube / prezentacja | 1920 | 1080 |

## Przeglądarka

Skrypt szuka kolejno: `CHROMIUM_PATH`, Chromium Playwrighta
(`PLAYWRIGHT_BROWSERS_PATH`, w chmurze jest), zainstalowany Google Chrome.
Na Macu bez Chrome: `npx playwright install chromium` (jednorazowo).
Zależność `playwright-core` jest w devDependencies i nie pobiera przeglądarki.

## Zasady treści

Obowiązuje standard sprzedażowy: bez wypalania datowanych cen i plakietek
rabatowych w grafikach, które będą żyły w social dłużej niż promocja.
Wyjątek: post dealowy z datą w treści.
