Wersja 1.0

# System wizualny — „Instrukcja"

Ten dokument opisuje warstwę wizualną tylkoklocki.pl tak, żeby dało się z niej
korzystać poza przeglądarką: przy grafikach otwierających artykuły, kartach
prezentowników, obrazkach OG, paczkach social i PDF-ach.

**Nie wymyśla nowego stylu.** System już istnieje i mieszka w
`src/styles/global.css` — ma nawet nazwę, wpisaną w nagłówek pliku: *Instrukcja*.
Ten plik był dotąd jedynym miejscem, gdzie ta wiedza była zapisana, więc sesja
robiąca grafikę nie miała jak jej poznać bez czytania 985 linii CSS-a.

## Źródło prawdy

| Warstwa | Źródło | Kto czyta |
|---|---|---|
| Tokeny (kolory, krój, promień, cień) | `src/styles/global.css`, blok `:root` | przeglądarka |
| Reguły użycia poza stroną | **ten dokument** | sesja robiąca grafikę |

Tabele poniżej są **lustrem** bloku `:root`, nie drugim źródłem. Jeśli się
rozjadą, wygrywa `global.css` — i to ten dokument wymaga poprawki, nigdy odwrotnie.
Przed dłuższą serią grafik warto rzucić okiem na `:root`, czy nic się nie zmieniło.

## Skąd nazwa

Cała identyfikacja jest zbudowana na skojarzeniu z **instrukcją składania LEGO**:
biel papieru zamiast czystej bieli, granat diagramów montażowych, żółty klockowy
jako kolor marki. To nie jest ozdoba — to decyzja, która odróżnia serwis od
konkurencji operującej fotografią produktową na białym tle. Komentarz w
`global.css` przy typografii artykułu nazywa to wprost: *„kontra do zagęszczonych
ścian tekstu u konkurencji: powietrze"*.

Grafika, która tego nie respektuje, będzie wyglądać jak z innego serwisu.

## Paleta

| Token | Hex | Rola | Uwagi |
|---|---|---|---|
| `--papier` | `#f6f7f9` | tło strony | biel papieru, nigdy `#ffffff` jako tło całości |
| `--karta` | `#ffffff` | tło kart i kafli | czysta biel tylko jako *element na* papierze |
| `--granat` | `#17233f` | tekst, tło ciemnych plansz | kolor diagramów montażowych |
| `--granat-60` | `#4a5670` | tekst drugorzędny, podpisy | |
| `--zolty` | `#ffc933` | kolor marki, akcent, wypustki | |
| `--zolty-ciemny` | `#e6ae00` | stan `:hover` | w grafice statycznej zwykle niepotrzebny |
| `--czerwien` | `#e0312f` | cena, rabat, deal | **tylko** o pieniądzach |
| `--zielen` | `#0f7a43` | najniższa cena w historii | |
| `--linia` | `#dde1e8` | obrysy, separatory | |

Czerwień i zieleń mają w tym systemie znaczenie semantyczne, nie dekoracyjne.
Czerwony prostokąt bez związku z ceną fałszywie sygnalizuje promocję — a to
uderza w regułę „bez pseudopromocji" ze standardu sprzedażowego.

### Kontrasty — policzone, nie deklarowane

| Zestawienie | Kontrast | WCAG AA |
|---|---|---|
| biały tekst na granacie | 15,57:1 | OK |
| granat na papierze | 14,53:1 | OK |
| granat na żółtym | 10,12:1 | OK |
| granat-60 na papierze | 6,86:1 | OK |
| biały tekst na zieleni | 5,41:1 | OK |
| biały tekst na czerwieni | 4,52:1 | OK, ledwo |
| **biały tekst na żółtym** | **1,54:1** | **nie wolno** |

Dwie reguły wynikają z tej tabeli wprost:

1. **Na żółtym piszemy granatem.** Nigdy białym — 1,54:1 to tekst nieczytelny dla
   każdego, nie tylko dla osób słabowidzących.
2. **Biały na czerwieni ma zapas 0,02.** Wystarcza, ale nie wolno tej czerwieni
   rozjaśniać „żeby ładniej wyglądała" — natychmiast schodzi poniżej progu.
   Zieleń została już raz z tego powodu przyciemniona (komentarz w `global.css`).

Trzecia reguła nie wynika z liczb, tylko z WCAG 1.4.1 i jest w `global.css`
respektowana: **informacja nie może zależeć od samego koloru**. Zielona plakietka
„najniższa cena" ma napis, nie jest samą zieloną kropką. W grafice tak samo.

## Typografia

**Krój wyświetleniowy: Archivo** (wagi 700 i 800). Na stronie ładowany przez
`@fontsource/archivo`. Do grafik dołożony do biblioteki skilla:

    .claude/skills/canvas-design/canvas-fonts/Archivo-Variable.ttf
    .claude/skills/canvas-design/canvas-fonts/Archivo-OFL.txt

To font zmienny, z osiami `wght` (100–900) i `wdth` (62–125). **Pułapka: domyślna
waga na osi to 600, nie 400.** Bez jawnego ustawienia dostaniesz SemiBold i
grafika nie będzie się zgadzać ze stroną. W Pythonie:

```python
from PIL import ImageFont
f = ImageFont.truetype('.../Archivo-Variable.ttf', 72)
f.set_variation_by_name('Bold')       # 700 — nagłówki, jak h1/h2 na stronie
# f.set_variation_by_name('ExtraBold') # 800 — logo, stopka
```

Dostępne instancje nazwane: Regular, SemiBold, Bold, ExtraBold (plus lżejsze).

**Krój tekstowy: systemowy sans** (`-apple-system`, Segoe UI, Roboto…). W grafice
nie da się na nim polegać, bo renderuje się inaczej na każdej maszynie. Do
dłuższego tekstu na grafice bierz **Instrument Sans** z biblioteki skilla — to
neo-grotesk najbliższy Archivo, więc para trzyma się razem.

Hierarchia ze strony, do przeniesienia na grafikę: nagłówki mają ujemny tracking
(`-0.015em`) i interlinię 1,15; tekst ciągły interlinię 1,6, a w artykule 1,78.
Ta ostatnia liczba to celowe „powietrze" z komentarza w CSS — na grafice też nie
zagęszczaj.

## Sygnatura: wypustki

Element rozpoznawczy to **wypustki klocka** (`.studs` w CSS): żółte koła
z wewnętrznym cieniem `inset 0 -2px 0 rgba(0,0,0,0.18)`, który daje wrażenie
plastiku, nie płaskiej kropki. Występują w dwóch układach:

- **dwie w poziomie** — przed każdym `h2` w artykule (`.prose h2::before`),
  średnica 9 px, rozstaw 14 px;
- **cztery w siatce 2×2** — znak marki, tak jest na `public/og.png`.

Reguła: **jedna sygnatura na grafikę.** Wypustki są akcentem, nie teksturą. Jeśli
kompozycja ma już mocny element (zdjęcie zestawu, duża liczba, plakietka rabatu),
wypustki schodzą do roli małego znacznika w rogu albo znikają.

## Formaty

| Zastosowanie | Wymiar | Format | Uwagi |
|---|---|---|---|
| Obraz OG / Twitter | 1200 × 630 | PNG | `summary_large_image`, wzorzec: `public/og.png` |
| Post kwadratowy (IG/FB) | 1080 × 1080 | PNG | |
| Post pionowy (IG) | 1080 × 1350 | PNG | |
| Naklejka na karton | A4, 210 × 297 mm | PDF | skill `lego-tabelka-kartonu` ma własny układ |

Grafika otwierająca artykuł nie ma dziś ustalonego wymiaru, bo artykuły ich nie
mają — patrz „Luki".

## Jak to spiąć z canvas-design

Skill `canvas-design` domyślnie **wymyśla nową filozofię wizualną** na starcie
każdego zadania — nazywa ruch artystyczny i pisze manifest. Dla tego serwisu to
byłby błąd: filozofia już istnieje i nazywa się *Instrukcja*.

Dlatego przy grafikach do tylkoklocki.pl:

1. **Pomiń etap wymyślania filozofii.** Zamiast tego przeczytaj ten dokument
   i potraktuj go jako gotowy manifest.
2. Trzymaj z niego trzy rzeczy twardo: paletę z rolami semantycznymi, Archivo
   Bold/ExtraBold na nagłówki, jedną sygnaturę wypustek.
3. Swobodę zostaw sobie w kompozycji, skali i kadrze — tam skill jest przydatny.

Filozofię wymyślamy od zera tylko wtedy, gdy grafika świadomie nie należy do
serwisu (np. materiał na cudzy kanał).

## Czego nie robimy

Reguły spójne ze standardem sprzedażowym, przeniesione na warstwę wizualną:

- **Bez sztucznej pilności.** Żadnych zegarów odliczających, „ostatnia sztuka",
  pulsujących ramek. Termin wycofania podajemy, gdy jest prawdziwy.
- **Bez pseudopromocji.** Czerwona plakietka rabatu tylko przy realnym rabacie od
  ceny katalogowej.
- **Bez podziału prezentów według płci.** Kryterium jest sposób zabawy — dotyczy
  też doboru zdjęć i kolorystyki grafiki.
- **Bez fioletowych gradientów, wyśrodkowania wszystkiego i jednolitych
  zaokrągleń.** To domyślny look generowanej grafiki; serwis ma własny.
  Promień w systemie to `10px` dla kart i `999px` dla plakietek — nie „wszystko
  po 16px".
- **Nie piszemy „cegły".** Klocki, elementy, części — także w tekście na grafice.

## Luki — do zrobienia

1. **Sekcje serwisu dzielą jeden `public/og.png`.** Artykuły i prezentowniki
   mają już własne obrazy (`scripts/generuj-og.py` → `public/og/<slug>.png`),
   a strony zestawów zdjęcie produktowe. Na wspólnej domyślce zostają strony
   sekcji: `/`, `/serie/`, `/nowosci/`, `/deale/`, `/wycofania/`, `/o-nas/`.
   Ten sam szablon je obsłuży — brakuje tylko tytułów w jednym miejscu.
2. **Obraz OG zestawu to zdjęcie produktowe, zwykle kwadratowe.** Sloty OG mają
   proporcje 1,91:1, więc platformy je kadrują albo dodają pasy. Typograficzna
   karta z numerem zestawu byłaby bezpieczniejsza — do rozważenia, ale to
   zamiana działającego rozwiązania, nie łatanie dziury.
3. **Artykuły nie mają grafik otwierających w treści.** Obraz OG rozwiązuje
   udostępnianie, nie samą stronę.
4. **Tabele w tym dokumencie mogą się rozjechać z `global.css`.** Da się to
   zabezpieczyć skryptem `--sprawdz`, który porówna hexy z blokiem `:root` —
   na wzór `eksport-skilli.mjs`. Na razie kontrola jest ręczna.
