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
<<<<<<< HEAD

## Prototyp 1320 z kompozycją (03.11.2026, gałąź `claude/practical-heisenberg-639gv6`)

Decyzja Marka: wariant 1320 px. Zbudowany w kodzie Astro, nie jako klon HTML.
Wszystko za `min-width: 1100/1200 px`; telefon i tablet bez zmian (sprawdzone
przy 390 px). Plansze: `audyt-szerokosc-2026-11-03/prototyp/` (produkcja 1080
vs prototyp przy oknie 1600 i 1920; osobne zrzuty 390/1600/1920).

Co się zmienia:

- `global.css`: `--max-w: 1320px`, margines boczny w `--wrap-pad` (24 px,
  32 px od 1400 px, 20 px na telefonie); blok „Prototyp 1320" na końcu pliku.
- Zajawki artykułów: cztery w rzędzie od 1200 px; strona główna buduje 8
  zamiast 6 (poniżej 1200 px CSS chowa dwie). Sekcje z trzema kartami
  redakcyjnymi (`.zajawki--trzy`) zostają przy trzech. „Zestawy pod lupą"
  na /promocje-lego/ stronicują po 8 na szerokim ekranie.
- Slajdery kart (aktualności, okazje): trzy karty w oknie zamiast dwóch.
- Tabele promocji: stałe kolumny ceny (170) i przycisku (210), opis może
  wypełnić resztę (78 znaków).
- Strona główna: slajder deali + boks „Nowe minima cenowe" (gdy mniej niż
  trzy minima – „Największe rabaty dziś"); linki boksu idą na huby, nie do
  sklepów, więc limit Allegro go nie dotyczy.
- Hub zestawu: trzecia kolumna hero z boksem ceny (`BoksCenyZestawu.astro`):
  najtaniej dziś, rabat, przycisk do najtańszego sklepu z linkiem (reguła jak
  w PasekCeny), trzy sklepy informacyjnie, kotwica do tabeli, nasze minimum.
  Poniżej 1100 px boks znika i zostaje dotychczasowy pasek ceny.
- Artykuł: kolumna 720 px + prawy pasek 300 px (`PasekArtykulu.astro`): spis
  treści z podświetleniem bieżącej sekcji, karta zestawu z frontmattera
  `zestawy` (cena z tych samych danych co hub, przycisk do najtańszego sklepu
  z linkiem), najnowsze teksty. Galerie i tabele w treści trzymają się
  kolumny, żeby nie wjechać pod pasek.

Decyzja Marka (03.11.2026): przyciski sklepów zostają. Układ wszedł na `main`
(1ab8fa4) i został cofnięty tego samego dnia na prośbę Marka, który zakładał
kopię podglądową, nie podmianę produkcji. Kod prototypu w całości leży na
gałęzi `prototyp-1320` (commit b13e53a); powrót to merge tej gałęzi albo
`git revert` commitu cofającego.
=======
>>>>>>> parent of b13e53a (Prototyp układu 1320 px: boks minimów na głównej, boks ceny na hubie, pasek artykułu)
