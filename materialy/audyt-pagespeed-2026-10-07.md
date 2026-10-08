# Audyt PageSpeed tylkoklocki.pl — 7.10.2026

Pomiar: Lighthouse 12 (ten sam silnik co PageSpeed Insights), tryb mobile
(Moto G Power, 4G z throttlingiem) i desktop, żywa strona zbudowana z `main`
(commit `357afa0`). Źródła odniesień w kodzie: gałąź `main`.

Zastrzeżenie: pomiar szedł z kontenera przez proxy HTTPS, które wymusza HTTP/1.1
i dokłada ok. 400 ms do każdego żądania. Wynik w PageSpeed Insights będzie więc
nieco wyższy (szacunkowo +5–10 pkt), ale lista problemów i ich kolejność nie
zmienią się. Interfejs API PSI miał wyczerpany dzienny limit, więc danych
terenowych CrUX nie udało się pobrać — warto je sprawdzić ręcznie w PSI.

## 1. Wyniki

| Strona (mobile) | Wydajność | LCP | FCP | TBT | CLS | Waga | Obrazy do oszczędzenia |
|---|---|---|---|---|---|---|---|
| `/` (główna) | **60** | 5,7 s | 3,9 s | 350 ms | 0,02 | 1 329 KiB | 962 KiB |
| `/zestaw/10291/` (hub) | **59** | 5,4 s | 3,2 s | 200 ms | **0,23** | 410 KiB | 90 KiB |
| `/deale/deal-76325-…/` | 67 | 5,5 s | 3,5 s | 180 ms | 0 | 482 KiB | 148 KiB |
| `/promocje-lego/` (listing) | 72 | 5,1 s | 3,7 s | 60 ms | 0 | 838 KiB | 487 KiB |
| `/artykuly/lego-31163-…/` | 84 | 3,4 s | 3,2 s | 80 ms | 0,07 | 391 KiB | 62 KiB |
| `/serie/animal-crossing/` | 92 | 3,2 s | 1,3 s | 90 ms | 0 | 478 KiB | 130 KiB |

Desktop, strona główna: wydajność **94**, LCP 1,5 s, TBT 0 ms, CLS 0.

Pozostałe kategorie na wszystkich stronach: SEO 100, Best Practices 100,
Dostępność 91–98 (szczegóły w p. 3.8).

Progi Google (Core Web Vitals): LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms. Na
mobile LCP jest przekroczone na każdym typie strony, CLS na hubach zestawów.

## 2. Z czego wynika niski wynik na mobile

Trzy przyczyny odpowiadają za niemal całą różnicę między 60 a 90+:

1. **Obrazy serwowane w oryginalnym rozmiarze i jako JPEG** — trasa `/img/`
   w workerze oddaje plik 1:1 ze źródła (Rebrickable, sklepy). Przykład:
   `/img/75442.jpg` to 1200×473 px i 246 KB, wyświetlane jako miniatura 130×130.
   Na stronie głównej 7 obrazów waży 1 043 KiB z 1 329 KiB całej strony.
2. **Czas do pierwszego renderu (FCP 3,2–3,9 s)** — jeden zewnętrzny plik CSS
   blokujący render (16 KB, ~725 ms na 4G), a w tym samym momencie przeglądarka
   ściąga `gtag.js` (179 KB) i 4 pliki czcionek, które konkurują o łącze
   z CSS-em i obrazem LCP.
3. **Google Analytics na głównym wątku** — `gtag.js` generuje 3 długie zadania
   (341 + 265 + 233 ms) i 158 ms wymuszonych przeliczeń układu; to jest całe
   TBT 350 ms na stronie głównej. CSS/JS własny serwisu jest lekki (3 KB JS).

Do tego **CLS 0,23 na hubach zestawów** — przesunięcie bloku ze zdjęciem
o ~230 px w chwili, gdy ładuje się Archivo 700 (`font-display: swap`,
zastępcza czcionka systemowa ma inne metryki, więc nagłówek zmienia wysokość).

## 3. Co poprawić — według zysku

### 3.1 Obrazy: skalowanie i nowoczesny format (największy zysk)

Efekt: −800–900 KiB na stronie głównej, −450 KiB na listingu promocji,
LCP mobile z ~5,5 s do ok. 3 s. To jedyna zmiana, która sama z siebie przenosi
wynik mobile o 20+ punktów.

Opcje, od najprostszej:

- **A. Cloudflare Image Transformations w workerze** (zalecane). W panelu
  Cloudflare: Images → Transformations → włączyć dla strefy tylkoklocki.pl
  (5 000 unikalnych transformacji miesięcznie w cenie, dalej 0,50 USD/1 000).
  W `src/worker.js` trasa `/img/` czyta parametr `?w=` (dozwolone wartości
  np. 130, 260, 440, 840) i dla takiego żądania woła
  `fetch(adresOryginalu, { cf: { image: { width, fit: 'scale-down', format: 'auto', quality: 82 } } })`;
  `format: 'auto'` oddaje AVIF/WebP według nagłówka `Accept`. Kopia w R2
  zostaje bez zmian jako źródło. Adresy bez `?w=` działają jak dziś.
- **B. Warianty generowane przy buildzie** — `scripts/generuj-obrazy.mjs`
  rozszerzony o `sharp` (jak w `landingi/beko-pyropro/scripts/obrazy.mjs`),
  zapis wariantów `<nr>-260.webp` do R2 przez `wrangler r2 object put`.
  Zero kosztów, ale 1 300+ zestawów × 3 szerokości × 2 formaty do
  wygenerowania i pilnowania przy nowych setach.

Niezależnie od wariantu, w komponentach `srcset` + `sizes`:

| Miejsce (plik na `main`) | Dziś | Docelowo |
|---|---|---|
| `src/pages/index.astro` — miniatury `set-mini` 130×130 | oryginał | `?w=130 1x, ?w=260 2x` |
| `src/pages/index.astro` — slajder „Deale dnia" (220–385 px) | oryginał | `?w=440` + `sizes` |
| `src/components/TabelaSetow.astro` — 64×64 | oryginał | `?w=130` (2x) |
| `src/pages/zestaw/[nr].astro` — hero 800×800 | oryginał | `?w=420 / ?w=840` + `sizes="(max-width:760px) 100vw, 420px"` |
| `src/pages/promocje-lego/index.astro` — `akt-foto` 800×450 | oryginał | `?w=440 / ?w=880` |
| `scripts/remark-galeria.mjs` — galerie 600×600 | oryginał | `?w=600 / ?w=1200` |

### 3.2 Obraz LCP: priorytet i brak `lazy`

- Strona główna: pierwszy slajd ma `loading="eager"`, ale brak
  `fetchpriority="high"` — Lighthouse wskazuje to wprost. Dodać.
- `/promocje-lego/` i `/serie/…`: element LCP to obraz z `loading="lazy"`
  (miniatura 130×130 w `set-mini`, a w seriach 64×64 w tabeli). Pierwsze
  2–3 obrazy nad zgięciem powinny być `eager`; reszta `lazy`.
- Hub zestawu: hero bez `fetchpriority="high"`; można dodać
  `<link rel="preload" as="image">` w `<head>` huba (jak w landingu Beko).

### 3.3 Google Analytics poza ścieżką krytyczną

`gtag.js` (179 KB, 41 % nieużywane) ładuje się `async` w `<head>` i wykonuje
w trakcie renderu. Zmiana w `src/layouts/Base.astro`:

```html
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date()); gtag('config', 'G-5M8LH9SKQC');
  addEventListener('load', function () {
    var start = function () {
      var s = document.createElement('script'); s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=G-5M8LH9SKQC';
      document.head.appendChild(s);
    };
    'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 3000 }) : setTimeout(start, 1500);
  });
</script>
```

Zdarzenia sprzed załadowania trafiają do `dataLayer` i nie giną. Efekt: TBT
350 → <100 ms, FCP szybsze o ~0,5 s (łącze nie dzieli się z 179 KB skryptu).
Do tego `<link rel="preconnect" href="https://www.googletagmanager.com">`.

Dwa systemy analityki naraz (Cloudflare Web Analytics 21 KB + GA4) to
podwójny koszt; jeśli raporty CF nie są używane, usunąć beacon z `Base.astro`.

### 3.4 Czcionki: CLS i opóźnione odkrycie

- CLS 0,23 na hubach wynika z różnicy metryk Archivo i czcionki zastępczej.
  Astro 5 ma wbudowane API czcionek (`experimental.fonts` w `astro.config.mjs`,
  provider `fontsource`), które generuje zastępczą czcionkę z
  `size-adjust`/`ascent-override` i dodaje `<link rel="preload">`. To zamyka
  problem CLS bez ręcznego liczenia metryk. Ręczna alternatywa: własny
  `@font-face { font-family: 'Archivo Fallback'; src: local('Arial'); size-adjust: 105%; ascent-override: 93%; … }`
  i `font-family: Archivo, 'Archivo Fallback', …`.
- Dziś pobierane są 4 pliki (latin + latin-ext × 700 i 800, 58 KB) i są
  odkrywane dopiero po CSS. Preload dwóch plików latin-ext (polskie znaki)
  albo ograniczenie do jednej grubości (800 jest używane tylko w logo).

### 3.5 CSS blokujący render

Jeden wspólny plik `_astro/…css` (16 KB, 14 KB po brotli) kosztuje na 4G
jedną pełną rundę (~700 ms) przed pierwszym renderem; na stronie głównej 69 %
reguł jest nieużywanych. Dwie drogi:

- `build: { inlineStylesheets: 'always' }` w `astro.config.mjs` — HTML rośnie
  z 11 do ~25 KB po brotli, ale pierwszy render nie czeka na drugi plik.
  Dla ruchu z Google (jedna strona na wizytę) to wygrana netto.
- Zostawić osobny plik i dać mu długi cache (p. 3.6) — pomaga tylko kolejnym
  wizytom.

### 3.6 Nagłówki cache dla zasobów z hashem

`/_astro/*.css`, `*.js`, `*.woff2` są serwowane z `cache-control: public,
max-age=0, must-revalidate` — każda kolejna strona i wizyta rewaliduje pliki,
których nazwa i tak zmienia się przy każdej zmianie treści. Nowy plik
`public/_headers` (Workers static assets go obsługują, tak jak `_redirects`):

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

Obrazy `/img/` mają 30 dni — w porządku.

### 3.7 Przekierowanie `/deale/`

`/deale/` → 301 → `/promocje-lego/` kosztuje ~1 s na mobile, gdy ktoś wejdzie
starym linkiem. Menu na `main` wskazuje już `/promocje-lego/`; został jeden
link w `src/pages/podglad/glowna-obecna.astro`. Sprawdzić też linki zewnętrzne
(social, newsletter), żeby kierować od razu na nowy adres.

### 3.8 Dostępność (91–98)

- `.slajder-kropki` ma `role="tablist"`, a dzieci to zwykłe `<button>` —
  albo dodać `role="tab"` + `aria-selected`, albo zdjąć `tablist` i dać
  `aria-label` na kontenerze.
- Cele dotykowe kropek 12×12 px (wymagane 24×24): dodać `padding` lub
  pseudo-element `::before` z obszarem 24 px bez zmiany wyglądu.
- Kontrast: `.kc-data` 4,16:1, `.kc-uwaga` 3,06:1, `.tag-eol` 3,64:1 (próg
  4,5:1). Ciemniejszy kolor albo większa czcionka (od 18,5 px wystarcza 3:1).
- `tabela-cen`: pusty `<th></th>` w kolumnie z linkiem — wstawić tekst ukryty
  wizualnie („Oferta").
- Kolejność nagłówków: `<h4>` w stopce po `<h2>`/`<h3>` — zamienić na `<h2>`
  w stopce albo zwykły `<p><strong>`.
- `.akt-foto` bez nazwy, gdy zestaw nie ma zdjęcia (placeholder
  `aria-hidden`) — dodać `aria-label={`LEGO ${s.nr} ${s.nazwa}`}` na linku.
- Obrazy w treści artykułów bez `width`/`height` (markdown `![…]`) → CLS 0,07;
  najprościej w CSS `.prose img { aspect-ratio: 4/3; height: auto }` albo
  wtyczka remark dopisująca wymiary z `obrazy.json`.

### 3.9 Bez działania

- „Nie używa HTTP/2" — artefakt proxy w pomiarze; żywa strona ma h2/h3
  (`alt-svc: h3`).
- „Przestarzały JavaScript 21 KB" i krótki cache 1 dnia — dotyczy skryptu
  Cloudflare Web Analytics, poza naszą kontrolą (p. 3.3: rozważyć usunięcie).
- Rozmiar DOM (620 elementów) i własny JS (3 KB) — w normie.

## 4. Proponowana kolejność wdrożenia

| Krok | Zmiana | Spodziewany efekt (mobile, główna) | Kto |
|---|---|---|---|
| 1 | Włączyć Image Transformations w panelu Cloudflare | warunek dla kroku 2 | Marek (panel) |
| 2 | `?w=` w workerze + `srcset` w 6 miejscach (3.1) | 60 → ~80, LCP 5,7 → ~3 s | Claude Code |
| 3 | GA po `load` + preconnect (3.3) | TBT 350 → <100 ms, +5 pkt | Claude Code |
| 4 | `public/_headers` immutable (3.6) | kolejne wizyty, bez zmiany wyniku | Claude Code |
| 5 | `fetchpriority` / `eager` na LCP (3.2) | LCP −0,3–0,5 s | Claude Code |
| 6 | Czcionki: Astro Fonts API lub fallback z metrykami (3.4) | CLS hubów 0,23 → <0,05 | Claude Code |
| 7 | CSS inline (3.5) | FCP −0,5–0,7 s | Claude Code (decyzja: tak/nie) |
| 8 | Dostępność (3.8) | 91 → 100 | Claude Code |

Po krokach 1–6 realny wynik mobile strony głównej powinien mieścić się
w przedziale 85–92, hub zestawu ok. 90, przy LCP poniżej 2,5 s na łączu 4G.

## 5. Jak powtórzyć pomiar

```
CHROME_PATH=/opt/pw-browsers/chromium \
npx lighthouse https://tylkoklocki.pl/ --output=html --output-path=lh.html \
  --chrome-flags="--headless=new --no-sandbox"
```

albo https://pagespeed.web.dev/ (dodatkowo pokaże dane terenowe CrUX).

## 6. Po wdrożeniu (7.10.2026, ten sam dzień)

Wdrożone na `main` (commity `77e2298`, `12c281a`, `b21d238`): skalowanie
obrazów `?w=` przez Cloudflare Image Transformations z formatem AVIF/WebP
dobranym z nagłówka Accept, `srcset`/`sizes` we wszystkich komponentach ze
zdjęciami zestawów, `fetchpriority` i preload obrazu LCP, GA po `load`,
czcionki przez Fonts API z własnymi czcionkami zastępczymi o dopasowanych
metrykach (Roboto, Arial, Liberation Sans, Segoe UI, Helvetica Neue), CSS
inline, `public/_headers` z `immutable`, poprawki dostępności.

Pomiar tą samą metodą (Lighthouse z kontenera, mobile):

| Strona | Wydajność przed → po | LCP przed → po | CLS przed → po | Waga przed → po |
|---|---|---|---|---|
| `/` (główna) | 60 → **93** | 5,7 s → 3,0 s | 0,02 → 0 | 1 329 → 405 KiB |
| `/zestaw/10291/` (hub) | 59 → **93** | 5,4 s → 3,0 s | 0,23 → 0 | 410 → 353 KiB |
| `/deale/deal-76325-…/` | 67 → **98** | 5,5 s → 1,4 s | 0 → 0 | 482 → 391 KiB |
| `/promocje-lego/` | 72 → **82** | 5,1 s → 3,9 s | 0 → 0 | 838 → 447 KiB |
| `/artykuly/lego-31163-…/` | 84 → **99** | 3,4 s → 1,3 s | 0,07 → 0 | 391 → 391 KiB |
| `/serie/animal-crossing/` | 92 → **93** | 3,2 s → 2,8 s | 0 → 0 | 478 → 355 KiB |

Desktop, strona główna: 94 → **100**. Dostępność: 91–98 → **100** na każdej
mierzonej stronie. Przykładowe wagi obrazów: 42143 w slajderze 93 KB → 14 KB
(AVIF 440 px), 75442 jako miniatura 246 KB → 1,7 KB.

Co zostało:

- `/promocje-lego/` (82): to już nie obrazy, tylko rozmiar dokumentu —
  288 KB HTML (42 KB po brotli), 3 185 elementów DOM, 1,1 s samego renderu
  po pobraniu obrazu LCP. Poprawa wymaga podziału listingu (stronicowanie
  albo sekcje renderowane po przewinięciu) — osobna decyzja redakcyjna.
- Obrazy w treści artykułów wstawione składnią markdown (`![…](/img/…)`)
  nie dostają `?w=` ani wymiarów; CSS rezerwuje im proporcję 4:3, ale wciąż
  pobierają oryginał. Warto dopisać wtyczkę remark, która dla `/img/` doda
  `srcset` tak jak `remark-galeria`.
- Lighthouse nadal wskazuje „oszczędność 24–94 KiB" na obrazach: przy
  emulowanym ekranie 2,6× wybiera wariant 880 px dla kart ~300 px. To koszt
  ostrości na ekranach Retina, zostawiamy świadomie.

## 7. Zmiana 8.10.2026: warianty z R2 zamiast Image Transformations

Darmowy limit Image Transformations (5 000 unikalnych transformacji miesięcznie)
skończył się po jednym dniu. Warianty WebP generuje teraz `scripts/warianty-obrazow.mjs`
(sharp) do R2, worker oddaje je pod tym samym `?w=`. Różnica dla czytelnika:
WebP zamiast AVIF (pliki ~10–15 % cięższe), ta sama rozdzielczość i jakość 82.
Szczegóły: RUNBOOK „Obrazy skalowane".

Przy okazji wyszło, że `<link rel="preload">` czcionek wstrzymuje pierwszy
render: Chrome czeka na preloadowane woff2 (w pomiarze z kontenera ponad 2 s,
na 4G ok. 0,7 s). Preload zdjęty (`b23243b`); czcionki zastępcze z metrykami
rysują tekst od razu, a podmiana na Archivo nie przesuwa układu.

Pomiar 8.10.2026 po obu zmianach (Lighthouse 12, mobile, ten sam sposób):

| Strona | Wydajność | LCP | FCP | CLS | Obrazy |
|---|---|---|---|---|---|
| `/` (główna) | 91 | 2,5 s | 1,1 s | 0 | 99 KiB |
| `/zestaw/10291/` (hub) | 89 | 2,4 s | 1,0 s | 0 | 68 KiB |
| `/promocje-lego/` | 86 | 2,6 s | 1,3 s | 0 | 219 KiB |
| `/deale/deal-76325-…/` | 95 | 1,2 s | 1,1 s | 0 | 114 KiB |
| `/artykuly/lego-31163-…/` | 96 | 1,2 s | 1,0 s | 0,03 | 107 KiB |
| `/serie/animal-crossing/` | 90 | 2,7 s | 1,1 s | 0 | 113 KiB |

Desktop, strona główna: 100. LCP na każdym typie strony poniżej progu 2,5 s
lub tuż przy nim (listing 2,6 s, seria 2,7 s). TBT w tym pomiarze jest wyższe
niż 7.10 (240–430 ms wobec 60–140 ms) — kontener pomiarowy ma wolniejszy
procesor (strona referencyjna example.com też wypadła wolniej), nie zmieniło
się nic w JavaScripcie serwisu.
