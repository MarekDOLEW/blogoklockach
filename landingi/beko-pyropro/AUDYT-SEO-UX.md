# Audyt SEO i UX – landing Beko PyroPro

Data: 2026-09-07. Zakres: `landingi/beko-pyropro/` (wersja 3, zasoby z warstwowego PSD, font Encode Sans).
Narzędzia: Lighthouse 12 (Chromium headless, throttling mobile „Slow 4G”
i preset desktop), własny test Playwright (`npm test`), przegląd ręczny
względem WCAG 2.2 AA i heurystyk Nielsena.

## 1. Wyniki Lighthouse (po poprawkach)

| Profil  | Performance | Accessibility | Best Practices | SEO | LCP   | CLS | TBT   |
|---------|-------------|---------------|----------------|-----|-------|-----|-------|
| Mobile  | 100         | 100           | 96             | 100 | 1,7 s | 0   | 0 ms  |
| Desktop | 100         | 100           | 96             | 100 | 0,3 s | 0   | 0 ms  |

Jedyny punkt odjęty w „Best Practices” to błąd konsoli z zablokowanego w
środowisku testowym Google Fonts (brak dostępu do sieci) – na produkcji nie
wystąpi. Pozostałe uwagi Lighthouse dotyczą wdrożenia na serwer, nie kodu:
minifikacja CSS/JS, nagłówki `Cache-Control`, kompresja Brotli.

Pomiar na prawdziwych zdjęciach z layoutu: strona ładuje na starcie tylko hero
(AVIF ok. 60 KB), reszta obrazów dociąga się leniwie; katalog `img/` to 2,3 MB
w 121 plikach, z czego przeglądarka pobiera jeden wariant formatu i rozmiaru.

## 2. Co zostało wykonane w kodzie

### SEO techniczne
- Semantyczny HTML: `header/main/section/article/footer`, jeden `h1`,
  logiczna hierarchia `h2 → h3` odpowiadająca sekcjom layoutu.
- Cała treść z layoutu jest tekstem (także odznaki „59 min”, „47 %”,
  minutnik, zawieszka „Sprzątam”, model piekarnika) – zero tekstu w obrazkach.
- `<title>` (68 zn.) i `meta description` (158 zn.) ze słowami kluczowymi:
  *czyszczenie pyrolityczne*, *PyroPro*, *piekarnik*, *59 minut*, *Beko*.
- `canonical`, `robots` z `max-image-preview:large`, Open Graph + Twitter Card,
  `lang="pl"`, `theme-color`, favicon.
- JSON-LD: `WebPage` + `Organization` + `ItemList` produktów (`Product`, `Brand`).
- Obrazy: `alt` opisowe (dekoracyjne mają `alt=""`), `width/height`
  (CLS = 0), `loading="lazy"` poza hero, hero z `fetchpriority="high"`
  i `<link rel="preload">` wariantu AVIF, `srcset` + `sizes` dla każdego zdjęcia,
  `<picture>` AVIF → WebP → JPG.
- Google Fonts ładowane bez blokowania renderowania (preload + `onload`,
  fallback `<noscript>`), `font-display: swap`, stos zapasowy systemowy.
- Brak zależności zewnętrznych poza fontami; JS 3 KB, CSS 20 KB.

### UX / dostępność
- Kontrasty ≥ 4,5:1: żółty tekst na granacie ma odcień `#ffd633` (10,5:1),
  niebieski przycisk `#0057b8` na białym (7,1:1), szary opis `#56606c` (6,3:1).
- Link „Przejdź do treści”, widoczny `:focus-visible` (żółta obwódka),
  wszystkie przyciski ≥ 44×44 px (WCAG 2.5.8), karuzele obsługiwane
  klawiaturą (strzałki, przyciski z `aria-label`), modal wideo jako natywny
  `<dialog>` (focus trap, Esc, zwrot fokusu).
- Banery pojawiają się z przenikaniem przy przewijaniu (IntersectionObserver), obrazy poniżej hero ładują się leniwie; przy `prefers-reduced-motion` i bez JS wszystko jest widoczne od razu.
- Bez JS strona jest w pełni czytelna (karuzele stają się przewijanymi
  listami, sekcje nie są ukryte).
- Mobile: brak poziomego przewijania (test automatyczny), hero z osobnym
  kadrem pionowym, karuzele ze scroll-snap i przyciskami, dekoracyjne
  rękawice tylko ≥ 1400 px (nie zasłaniają treści).
- Przypisy `*` i `**` są linkowane do treści w stopce i z powrotem.

## 3. Uwagi do layoutu – do decyzji przed publikacją

| # | Waga | Uwaga | Rekomendacja |
|---|------|-------|--------------|
| 1 | wysoka | Sekcja „Opinie” zawiera *lorem ipsum* z layoutu. Publikacja z placeholderem szkodzi wiarygodności i może być uznana za thin content. | Wstawić 3 prawdziwe opinie (imię, źródło, data) albo usunąć sekcję do czasu ich zebrania. Przy prawdziwych opiniach dodać `Review`/`AggregateRating` w JSON-LD. |
| 2 | wysoka | Przyciski „Sprawdź” i CTA końcowe nie mają docelowych adresów – to jedyna ścieżka konwersji na stronie. | Podpiąć karty produktów; CTA końcowe prowadzi teraz do sekcji produktów (`#piekarniki`). Rozważyć drugi, stały CTA po sekcji korzyści (na mobile użytkownik przewija ~7 ekranów do pierwszego przycisku). |
| 3 | wysoka | Twierdzenia „do 47 % mniej energii” i „marka nr 1 w Europie” wymagają przypisów prawnych; treść w stopce jest robocza. | Potwierdzić treść z klientem / działem prawnym. |
| 4 | średnia | Dwa odtwarzacze wideo (PyroPro, AeroPerfect) nie mają źródła. | Uzupełnić `data-wideo` (YouTube ID lub MP4). Kod osadza YouTube dopiero po kliknięciu (`youtube-nocookie`), więc nie obciąża strony ani nie wymaga zgody cookie przed odtworzeniem. |
| 5 | średnia | Symbole modeli (BBIM13300P itd.) odczytane z layoutu w niskiej rozdzielczości. | Zweryfikować z listą produktową. |
| 6 | średnia | Layout ma w hero tylko logo bez nawigacji ani linku do sklepu. | To akceptowalne dla landingu kampanijnego, ale warto dodać w stopce linki do polityki prywatności i strony głównej (wymóg prawny przy analityce/cookies). |
| 7 | niska | Pasek „PizzaPro / A++ / Wi‑Fi” powtarza treści z sekcji „Poznaj inne technologie”. | Zostawiono zgodnie z layoutem; można rozważyć linkowanie kotwicowe z paska do odpowiednich akapitów. |
| 8 | niska | Layout (PSD) jest w skali 1×, zdjęcia na ekranach retina są miękkie. | Zdjęcia w 2× do `img/src/` pod tymi samymi nazwami + `npm run obrazy` + `npm run srcset`. |

## 4. Checklist wdrożenia

- [ ] Zdjęcia w 2× (z PSD) do `img/src/` i `npm run obrazy`.
- [ ] Ustawić docelowy adres w `canonical`, `og:url`, `og:image` i JSON-LD.
- [ ] Minifikacja CSS/JS (np. `esbuild --minify`) i nagłówki cache (`immutable` dla `img/`, `css/`, `js/` z hashem w nazwie).
- [ ] Kompresja Brotli/gzip na serwerze, HTTP/2.
- [ ] Dodać stronę do sitemap serwisu Beko i sprawdzić w Search Console (Rich Results Test dla JSON-LD).
- [ ] Analityka i baner cookie tylko jeśli klient go wymaga – wtedy zdarzenia: klik „Sprawdź”, play wideo, klik CTA.
- [ ] Ponowny Lighthouse po podmianie zdjęć (cel: LCP < 2,5 s na mobile).
