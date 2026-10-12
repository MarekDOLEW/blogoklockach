# Audyt 12.10.2026 — spójność strony, noindex, teksty szablonowe

Build z gałęzi `praca` (= origin/main, `49c795a`), `npm run build` 68 s, bez ostrzeżeń.
Narzędzia: kopie `skan.mjs`, `analiza.mjs`, `analiza2.mjs` z audytu 30.09 (te same reguły, nowe
ścieżki wyjściowe) + `ocena.mjs` (wywołuje `ocenaHubu()` z `src/lib/seo.js` przez Vite dla każdego
huba), `slowa.py`, `odmiana.py`, `mobile*.mjs` — wszystko w scratchpadzie sesji `audyt2/`.
Porównanie z `materialy/audyt-2026-09-30.md` (sekcje 6–7) i `audyt-2026-09-30/*.md`.

## 1. Liczby: 30.09 → dziś

| | 30.09 | 12.10 |
|---|---:|---:|
| stron HTML w `dist/` | 9 955 | **9 978** |
| indeksowalnych | 1 432 | **1 462** |
| noindex | 8 523 | **8 516** |
| huby `/zestaw/` (wszystkie / indeksowalne) | 9 787 / 1 269 | **9 803 / 1 291** |
| artykuły / deale / nowości (indeksowalne) | 39 / 11 / 12 | 43 / 14 / 13 |
| martwe linki wewnętrzne | 0 | 0 |
| sieroty (bez żadnego linku) / indeksowalne sieroty | 3 / 0 | 2 / 0 (`/podglad/*`) |
| bez title / description / canonical / robots | 0 | 0 |
| duplikaty title (wszystkie strony) | 0 | 0 |
| duplikaty description wśród indeksowalnych | 0 | **2 pary** (huby 42644=60464, 42676=42677) |
| indeksowalne z description > 160 zn. | 1 300 | **0** (max 160, mediana 135) |
| indeksowalne z title > 60 zn. | 1 241 | **0** (max 60, mediana 54) |
| błędne bloki JSON-LD | 0 | 0 |
| strony bez JSON-LD | 12 | 11 |
| sitemapy: URL-i / zgodność z indeksowalnymi | 1 431 / 1:1 + polityka | 1 461 / 1:1 + polityka |
| `undefined`/`NaN`/`null`/`{?}`/`Invalid Date` w HTML | 0 | 0 |
| puste tabele cen (`<tbody>` bez wierszy) | 0 | 0 |
| strony bez h1 / z >1 h1 | 0 / 0 | 0 / 0 |
| skok nagłówków w `<main>` | 12 (`/nowosci/*`) | 12 (`/nowosci/<miesiąc>/`) |
| `<img>` bez alt / `alt=""` bez aria-hidden | 0 / 891 | 0 / 916 |
| strony z błędną odmianą po liczebniku 2–4 | 249 | **~19** |

JSON-LD typy dziś: BreadcrumbList 9 883, Product 9 803 (5 704 z AggregateOffer), FAQPage 1 259,
ItemList 85, Article 79, WebSite 2, WebPage 2, CollectionPage 1; 12 stron z `@graph`.
Daty cen na hubach: 14 567 wystąpień, najstarsza 29.09; 97 hubów ma jakąś cenę starszą niż 7 dni,
1 hub ma wszystkie (`/zestaw/10304/`, 29.09).

## 2. Noindex

**Łącznie 8 516 stron z `noindex`:**

| typ | stron | powód (miejsce w kodzie) |
|---|---:|---|
| huby `/zestaw/<nr>/` | 8 512 | `ocenaHubu()` — `src/lib/seo.js:98–129` |
| — z czego warianty z sufiksem (`10282-2`, `2878-3`…) | 128 | ta sama reguła |
| serie `/serie/*` | 0 | wszystkie 69 indeksowalne |
| `/podglad/deale-obecne/`, `/podglad/glowna-obecna/` | 2 | kopie z 29.09, `noindex={true}` (`src/pages/podglad/*.astro:77, :244`) |
| `/szukaj/` | 1 | wyniki liczy przeglądarka (`src/pages/szukaj.astro:15`) |
| `/404.html` | 1 | strona błędu |

Ocena z `ocena.mjs` zgadza się z `dist/` w 9 803/9 803 hubach (0 rozjazdów).

**Reguła** (`seo.js`): indeksowalny, gdy ≥3 z 4 warunków — A ≥3 sklepy bez Ceneo, B tekst
redakcyjny >300 zn. (opis/persony z `sety.json`, akapity karty, uwagi wycofań — **bez** `opisy.json`),
C wzmianka w naszym tekście, D premiera w ostatnich 18 mies. i nie EOL — albo wyjątek:
prezentownik, gorący deal, karta Piotra (≥2 akapity + ≥3 FAQ), od 02.10 także **własny opis
w `sety.json` >300 zn.** (poza przeciekami).

**1 291 hubów indeksowalnych** (30.09: 1 269, +22): karta 636, deal 426, prezentownik 163,
opis 58, czyste „3 z 4” 8. Bez wyjątku nie przeszłoby 637 (443 karta, 158 deal, 23 opis,
13 prezentownik) — reguła 3/4 sama prawie nic nie wpuszcza.

**8 512 hubów noindex wg spełnionych warunków:** 0/4 — 8 280; 1/4 — 221; 2/4 — 11; 3/4 — 0.
Brakujący warunek: premiera 8 510, opis 8 510, tekst 8 458, sklepy 8 327. 2 597 noindex nie ma
żadnej oferty, 5 911 ma ofertę z przyciskiem.

**Najtańsze do odblokowania — 185 hubów z ≥3 sklepami.** Każdemu wystarczy własny opis
>300 zn. w `sety.json` (wyjątek `opis`, nie trzeba dobijać do 3/4):
- 9 hubów 2/4 (sklepy + tekst, brak opisu i premiery): 10307 Wieża Eiffla, 10326 Muzeum historii
  naturalnej, 21061 Notre-Dame, 31214 LOVE, 43021 Nike Dunk Trickshot, 75430 Ewok Wicket,
  76785 Thing's Apartment, 77057 Seasons of Fun, 77073 Battle Bus (5–9 ofert każdy);
- 176 hubów 1/4 z samymi sklepami (np. 10300, 10309, 10340, 10345, 10351, 10352, 10361, 10373).
- Pozostałe 2 huby 2/4 (21375 Godzilla, 77094 Zelda) mają opis >900 zn., ale są przeciekami —
  zostają poza indeksem celowo.

Najczęściej brakuje opisu i premiery (po 8 510); dla hubów z ofertami w praktyce brakuje **opisu** —
premiery nie da się „dopisać”.

**`scripts/noindex-do-opisania.py` działa na świeżym buildzie (8 356 hubów numerycznych), ale
jego podpowiedzi są nieaktualne:** docstring (l. 20–23) mówi „sam opis nie wystarczy”, a od 02.10
wystarcza (`seo.js:118–123`); `dlugosc_opisu()` liczy wygenerowany `opisy.json`, którego `seo.js`
nie liczy; premiera = 365 dni zamiast 18 miesięcy; nie zna wyjątku `opis`. Kolumna „Czego brakuje”
w `materialy/zestawy-noindex.xlsx` wprowadza w błąd.

## 3. Status rekomendacji z 30.09

Sekcja 6 (spójność): **4 zrobione, 3 częściowo, 3 nie.**

| # | rekomendacja | status | dowód |
|---|---|---|---|
| 6.1 | description ≤160 | zrobione | 1 300 → 0; hub: `[nr].astro:222` (nowa meta warunkowa) |
| 6.2 | title ≤60 | zrobione | 1 241 → 0 |
| 6.3 | skasować `src/pages/podglad/` | **nie** | 2 pliki w repo; produkcja `/podglad/deale-obecne/` → 200 |
| 6.4 | polityka prywatności w stopce i sitemapie | częściowo | stopka tak (`Base.astro:249`); sitemapa świadomie bez niej (`src/lib/sitemapy.js:128`), ale strona nie ma noindex → jedyna indeksowalna poza sitemapą |
| 6.5 | `/nowosci/` h3 → h2 | częściowo | `/nowosci/` ma h2; 12 stron miesięcznych dalej h1→h3 (`src/pages/nowosci/[miesiac].astro:149`) |
| 6.6 | `/kolekcjoner/` usunąć/301 | zrobione | `public/_redirects:14–15`, produkcja 301 → `/wycofania/` |
| 6.7 | JSON-LD na listingach | **nie** | 11 stron bez JSON-LD: `/artykuly/`, `/nowosci/`, `/prezentowniki/`, `/promocje-lego/`, `/serie/`, `/serie/archiwalne/`, `/aktualnosci/`, `/o-nas/`, `/polityka-prywatnosci/`, `/szukaj/`, `/404.html` |
| 6.8 | 40896 (GWP) LD vs tabela | **nie** | LD low 407,99, tabela „LEGO.com 81,99 zł” |
| 6.9 | stopkowe h4 | zrobione | `Base.astro`: `<p class="stopka-tytul">` |
| 6.10 | drobiazgi hubów | częściowo | pusty `src` lightboxa zniknął; 2198/7235 dalej tabela z samym wierszem EOL; `availability` 100% InStock, gałąź `Discontinued` martwa (`[nr].astro:139`) |

Sekcja 7 (teksty): **6 zrobionych, 4 częściowo, 0 nie.**

| # | rekomendacja | status | dowód |
|---|---|---|---|
| 7.1 | wyciąć zdania o dostępności z opisów | zrobione | filtr przy renderze `src/lib/media.js:53–104` (dane `opisy.json` nietknięte); w `dist` 0× „Nie ma go już w śledzonych”, „giełdach”, „ceny sprawdzamy codziennie rano”, 1× „wyraźnie kolekcjonerski” (karta 10358, nie opis) |
| 7.2 | warunkowa meta huba | zrobione | 0 meta z „codziennie”; 1 175 meta z „rodzica” — wszystkie na hubach z sekcją „Dla rodzica”; 0 błędów „w 1 sklepach”/„2 elementów” w meta |
| 7.3 | jedna nota afiliacyjna + jedno zdanie o koszyku | częściowo | koszyk 1× na hubie; nota w 4 brzmieniach: `Base.astro:245` i `PrezentownikSerii.astro:92` („ani grosza więcej”), `Artykul.astro:112` + 5 listingów („wspierasz serwis i nie płacisz więcej”), `[nr].astro:403`, `o-nas.astro:10`; „Różnica zwykle wypada na Twoją korzyść” — `scripts/remark-ceny.mjs:186`, 40 stron |
| 7.4 | funkcja odmiany liczebnika | zrobione | `odmien()` `src/lib/oferty.js:285`, użyta w 8 plikach; 249 → ~19 stron, resztki niżej (pkt 4.6) |
| 7.5 | „nieogłoszona” tylko dla zapowiedzi | zrobione | 4 882 → 4 huby (21375, 77094, 67006, 71873 — wszystkie zapowiedzi) |
| 7.6 | „ostatnie sztuki” tylko przy sklepie z magazynem | zrobione | `[nr].astro:91, 154` (`ofertyZMagazynu` bez Allegro); 3 051 hubów z etykietą — więcej niż 30.09, bo doszły Empik/x-kom |
| 7.7 | rocznik = rok premiery w `akapity_redakcyjne` | częściowo | „Różnią się charakterem” — 0; ale 228 kart dalej porównuje stare zestawy z 2026 („Gdyby stanął obok 22 zestawów LEGO Icons z 2026 roku…”, 10281 z 2021) — `scripts/import-karty.py:257–266` |
| 7.8 | `linkuj` jako pełne zdanie | częściowo | „. zobacz” 617 → 1 hub (75192); 6 brzmień odsyłacza („zobacz tabelę cen nad tym opisem”, „sprawdź bieżące ceny na tle katalogowej w sekcji nad opisem”, „porównaj oferty w sekcji cen nad opisem”…) |
| 7.9 | liczby serii z danych | zrobione | „w 11 seriach” — 0 |
| 7.10 | „codziennie” tylko gdzie prawda, „w historii” → „w naszych notowaniach” | częściowo | szablony czyste (zostały komentarze i karty); 4 nazwy minimum: „najniżej w naszych notowaniach” (`TabelaCen.astro:77`), „najniżej, odkąd notujemy” (`KartaOferty.astro:77`), „nowe minimum cenowe” (`index.astro:336`, `promocje-lego/index.astro:201`), „nowe minimum” (`index.astro:412`, `promocje-lego/index.astro:173, 253`) |

Drobne z 30.09: `{?}` w H2 karty — 0 (zrobione); „wycofanie w XII 2026”, „Każda cena z datą
sprawdzenia”, „Ceneo stoi osobno” — 0 (zrobione); „premiera 2021-01” 1 187 → 3 huby (pkt 4.9).

## 4. Problemy (wg wpływu na czytelnika i SEO)

1. **87% hubów noindex, a narzędzie do kolejki opisów liczy złą regułę.** 185 hubów z ≥3 sklepami
   wejdzie do indeksu po jednym opisie >300 zn. w `sety.json`; `scripts/noindex-do-opisania.py`
   (l. 20–23, `dlugosc_opisu`, `PROG_PREMIERY`) tego nie pokazuje. Do poprawy skrypt, potem
   kolejka z 185 pozycji.
2. **`/podglad/*` żyje na produkcji (200)** — `src/pages/podglad/deale-obecne.astro`,
   `glowna-obecna.astro`. Dwie stare kopie z „codziennie” i innymi tekstami sprzed audytu.
3. **Brak JSON-LD na 11 listingach** (lista w 6.7) — nawet BreadcrumbList. `src/pages/*.astro`
   tych działów, prop `jsonld` w `Base.astro:12`.
4. **Notatki robocze widoczne dla czytelnika:**
   - 12 hubów z polem `bez_rrp` wklejanym dosłownie (`[nr].astro:369`): „prezent do zakupów (GWP)
     na LEGO.com — Brickset: availability „LEGO Gift with Purchase” (sprawdzone 26.09.2026)”
     (40897, 40900), „Bez polskiej ceny katalogowej: BrickLink Designer Program — …, bez polskiej
     ceny katalogowej” (6 hubów, powtórzenie). Dane: `sety.json` / `katalog.json`, pole `bez_rrp`.
   - `/przecieki/`: nazwa źródła „Brickset — rezerwacja numeru w roczniku 2027 (pusty rekord,
     motyw Star Wars)” (`przecieki.json`, wpis 75484, `zrodla[].nazwa`).
   - Pozostałe słowa robocze z zadania w widocznym tekście: „PODNIESIENIE”, „KOREKTA”, „mnożnik”,
     „launchDate”, „srednia” — 0 stron (pole `uwagi` w `przecieki.json` je ma, ale nie jest
     renderowane); „feed” — 3 strony (artykuły/deal, tekst redakcji); „drabin…” — 0 w znaczeniu
     roboczym (98 trafień to „wóz z drabiną” + 1 prezentownik „drabina zaczyna się wyżej”).
5. **Zestaw GWP 40896**: wiersz „LEGO.com 81,99 zł” wygląda jak oferta, LD low 407,99 —
   `TabelaCen.astro` / `[nr].astro` (wiersz LEGO przy GWP).
6. **Odmiana — resztki (~19 stron):** `/wycofania/` „obejmuje 323 zestawów” (`wycofania.astro:64`)
   i „Duży zestaw (4502 elementów)” (dane wycofań); 17 hubów „Liczy 44 elementów” z kart Piotra
   (`karty_setow.json`, 19 kart: 42224, 42232, 42233, 42236, 60484…) — do zgłoszenia wspólnikowi.
7. **Karuzele „Nasze propozycje” promują huby noindex**: 59 z 336 kart (np. `/serie/gadzety/`
   854313, `/serie/icons/` 10340 Wieniec). Pula w `src/pages/serie/[seria].astro:86` nie patrzy na
   `hubIndeksowalny`. Do tego linki wewnętrzne z `target="_blank"`
   (`src/components/KaruzelaPropozycji.astro:28`).
8. **`/nowosci/<miesiąc>/` h1 → h3** (12 stron) — `src/pages/nowosci/[miesiac].astro:149`.
9. **Surowa data ISO w zapowiedzi**: „Zapowiedź: premiera 2027-01.” (3 huby: 21375, 67006, 71873)
   — `[nr].astro:360`, `{premiera}` bez formatowania.
10. **Ciężkie listingi serii na telefonie**: `/serie/city/` 1,35 MB HTML, 1 071 wierszy,
    608 tys. px wysokości przy 390 px; `/serie/star-wars/` 1,30 MB. Bez stronicowania.
11. **Karta przecieku bez serii**: „Seria” z pustą wartością (Cutelings) — `src/pages/przecieki/index.astro:97`
    (`p.seria ?? '–'` nie łapie pustego napisu).
12. **Drobne:** 2 pary identycznych meta description wśród indeksowalnych hubów (42644/60464,
    42676/42677 — ta sama cena, sklepy i liczba elementów); 2198/7235 tabela z samym wierszem EOL;
    martwa gałąź `Discontinued` (`[nr].astro:139`); tabela zapowiedzi na `/nowosci/` — 7 z 11 wierszy
    z zaślepką zamiast zdjęcia (zestawy bez zdjęcia w R2); 1 hub z kartą „. zobacz tabelę” (75192).

## 5. Nowe strony z 11.10

- **`/nowosci/`**: przełącznik działa (po kliknięciu „Zapowiedzi” widok nowości `hidden`, zapowiedzi
  widoczne). Tabela nowości 130 wierszy — 130 zdjęć, 0 bez ceny. Tabela zapowiedzi 11 wierszy —
  4 zdjęcia + 7 zaślepek, 4 wiersze „cena nieujawniona” (zgodne z danymi). Karuzela 9 kart, licznik
  „1/3”. Pusty `src` lightboxa usunięty. Filtr „star” → 7 wierszy, bez poziomego scrolla.
- **`/serie/*`**: 68 stron z tabelą; karuzela w 41 (9 kart — 31, 6 — 6, 3 — 4), 27 bez karuzeli;
  0 przypadków spoza wielokrotności 3, 0 kart bez ceny lub zdjęcia. Pasek filtra
  (`.pasek-filtr`) na 67/68 (bez: `/serie/archiwalne/` — nie ma tabeli). Sprawdzone ręcznie:
  icons (176 wierszy, filtr „zamek” → 1), city (1 071), bluey (8).
- **`/przecieki/`**: 0 tabel, 29 kart (21 w obserwacji + 8 rozstrzygniętych). Słowa robocze —
  patrz pkt 4.4 (jedno: „pusty rekord” w nazwie źródła).

## 6. Mobile (390 px, Playwright/Chromium, `astro preview`)

| strona | scrollWidth | błędy JS (`pageerror`) |
|---|---:|---|
| `/` | 390 | 0 |
| `/nowosci/` | 390 | 0 |
| `/serie/icons/` | 390 | 0 |
| `/przecieki/` | 390 | 0 |
| `/promocje-lego/` | 390 | 0 |
| `/zestaw/10294/` | 390 | 0 |

Poziomego scrolla brak, także po przełączeniu widoku na `/nowosci/`, przewinięciu karuzeli
i filtrowaniu na `/serie/icons/`. Komunikaty w konsoli to wyłącznie środowisko testu: 404 na
`/img/*` (obrazy serwuje worker, nie `astro preview`) i zablokowane przez sandbox
`static.cloudflareinsights.com` oraz `googletagmanager.com`.
