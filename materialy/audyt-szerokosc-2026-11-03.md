# Audyt szerokości układu — 03.11.2026

Pytanie Marka: czy kontener 1080 px (`--max-w` w `src/styles/global.css`) sprawia,
że serwis wygląda staro, i czy przejść na 1600 px.

## Metoda

Zrzuty produkcji w oknie 1600 px: stan obecny oraz ten sam układ z wstrzykniętym
`:root{--max-w:1400px}` i `1600px`. Cztery szablony: główna, `/promocje-lego/`,
`/zestaw/10359/`, recenzja 75421. Plansze w `audyt-szerokosc-2026-11-03/`.

Kontenery serwisów porównawczych przy oknie 1920 px (heurystyka: najczęstszy
wyśrodkowany blok, ±20 px): promoklocki ~1140, Brickset ~1180, Smyk ~1240,
Pepper ~1280, The Verge ~1300, Media Expert i Brick Fanatics ~1350, zklockow ~960.
x-kom i Ceneo niezmierzone (ściana cookies).

## Wnioski

- Norma dla serwisów dealowych i redakcyjnych to 1200–1350 px, nie 1400–1600.
- Samo poszerzenie psuje układ: tabele dostają pustkę między nazwą a ceną, deal
  dnia i hero zestawu mają martwą prawą kolumnę, artykuł nie zmienia się wcale
  (`.prose` 720 px, słusznie).
- Na laptopach 1366–1536 px kontener 1600 nigdy się nie włącza.

## Rekomendacja

`--max-w: 1320px` plus kompozycja per szablon: zajawki 4 kolumny, deal dnia
z trzecią kolumną, tabele z ograniczoną kolumną nazwy i ceną przy CTA, hero
zestawu w trzech kolumnach z przyklejoną ramką ceny, artykuł z prawym paskiem
300 px (spis treści, karta zestawu z ceną z huba, powiązane deale).
Prototyp na gałęzi roboczej w kodzie Astro, plansze przy 1440/1600/1920.
Decyzja Marka: 1320 z kompozycją czy literalnie 1600.
