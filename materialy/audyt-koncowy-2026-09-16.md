# Audyt końcowy mechanizmu tylkoklocki.pl — 16.09.2026

*Zakres: zadania cykliczne i odpowiedzialność, komunikacja automat ↔ człowiek, aktualność cen / linków / zdjęć / opisów, linkowanie wewnętrzne i zewnętrzne, rzetelność wobec czytelnika, spójność dokumentów z narzędziami. Każdy punkt ma źródło (plik, skrypt, wywołanie), z którego wynika. Nic nie jest pisane z pamięci; gdzie sprawdzić się nie dało, jest napisane „nie sprawdzono".*

**Werdykt: serwis nie jest dziś w 100% poprawny.** Mechanika (build, linki, przekierowania, obrazy, sitemapy, runnery) jest sprawna — zero martwych linków, wszystkie trasy sklepowe działają, cztery poranne runnery przeszły. Błędy leżą w warstwie **danych i procedur**: cztery ekskluzywy pokazane jako wycofane, choć lego.pl je sprzedaje; 17 przeterminowanych ofert z sierpnia z przyciskami prowadzącymi na strony główne sklepów; trzy „gorące deale" z ceną poniżej połowy katalogu, których nikt nie zweryfikował; artykuł datowany na jutro. Do tego skill Coworka jest o jedną decyzję do tyłu, a poniedziałkowa przypominajka wysyła Markowi nieprawdziwe zdanie. Poniżej wszystko punkt po punkcie, najpierw to, co dotyka czytelnika.

---

## 1. Błędy wobec czytelnika (wprowadzanie w błąd) — do naprawy najpierw

**1.1. Cztery zestawy ekskluzywne pokazane jako „wycofany (EOL)", choć lego.pl je sprzedaje.**
Zestawy: **10335 Endurance** (1 149,99 zł), **10356 U.S.S. Enterprise** (1 649,99 zł), **40516 Każdy jest wspaniały** (144,99 zł), **40797 Kłapouchy** (54,99 zł).
- `wycofania.json`: `kiedy: "wycofany"`, źródło „weryfikacja ręczna (Marek, 14.09.2026) + brak w katalogu lego.com z 28.08.2026" (commit `21a4df6`).
- `katalog.json`: wszystkie cztery `status: "dostepny"`, `lego_pl_widziano: "2026-09-15"`, `ekskluzyw: true`; 10335 ma dodatkowo `status_zrodlo: "lego.com/pl-pl, 13.09.2026: E_AVAILABLE (Dostępne teraz)"`.
- `oferty_feed.json`: każdy ma `oferty.lego` z ceną katalogową i `daty.lego: 2026-09-15` — czyli listing lego.pl pokazał je **wczoraj**.
- `scripts/audyt-wycofan.mjs`, sekcja A: dokładnie te cztery numery.
- Co widzi czytelnik (`dist/zestaw/10356/`): wiersz LEGO.com „oficjalny sklep – zestawu już nie kupisz, ale na karcie zostały zdjęcia" + „brak w sprzedaży"; na `/wycofania/` etykieta „wycofany (EOL)" i opis „zdjęty z oferty po jednym sezonie".
- Skutek: dla zestawu ekskluzywnego LEGO.com jest **jedynym** sklepem — ukrywamy jedyny link zakupowy i mówimy nieprawdę o dostępności. Reguła z RUNBOOK („Statusy", pkt 3: listing lego.pl jest arbitrem; wpis „wycofany" przy zestawie widzianym w ostatnich 14 dniach jest błędny) istnieje od 15.09, ale wykona ją dopiero runner Wycofań w poniedziałek 21.09 — do tego czasu błąd stoi na stronie.
- Trzy dalsze konflikty (sekcja B audytu): 10280, 42211, 40647 — katalog `eol`, lista podaje przyszły termin; kto ma rację, nie sprawdzono.

**1.2. Siedemnaście ofert z sierpnia wyświetlanych jako aktualne, z przyciskami na strony główne sklepów.**
- `sety.json` trzyma 14 ofert z 12–16.08 ze sklepów bez feedu: klocekplus, proshop (4), brixani (2), rozetka (3), sferis, bricksberg, dadada, amazon — plus 3 oferty LEGO.com z 13–15.08 (30729, 40896, 42697) dla zestawów, których listing lego.pl 15.09 **nie pokazał** (`lego_pl_widziano` puste).
- `src/lib/oferty.js` → `polaczOferty()` nie filtruje po wieku oferty; tabela pokazuje datę („z 12.08.2026"), ale wiersz ma normalny przycisk „Sprawdź w sklepie".
- `sklepy.json`: szablony `szukaj` dla proshop, sferis i dadada to **strona główna sklepu** (bez `{nr}`) — sprawdzone na produkcji: `/idz/proshop/42698` → `https://www.proshop.pl/`, `/idz/sferis/10318` → `https://sferis.pl/`, `/idz/dadada/30730` → `https://dadada.pl/`.
- Przykład: hub 10316 Rivendell pokazuje Rozetkę 1 899 zł i brixani 1 849,99 zł „z 12.08.2026" (`dist/zestaw/10316/`); hub 30729 pokazuje LEGO.com 16,49 zł „z 15.08.2026" z przyciskiem.
- Skala: 17 wierszy w serwisie, 8 + 3 + 2 + … linków `/idz/` w buildzie (proshop 8, rozetka 3, amazon 2, xkom 2, brixani 2, klocekplus 1, sferis 1, bricksberg 1, dadada 1).

**1.3. Trzy „gorące deale" z ceną poniżej 50% potwierdzonej ceny katalogowej — niezweryfikowane.**
- `scripts/kontrola-rrp.mjs`, „Test rynkowy": 60339 (katalog 699,99 / rynek 349), 10423 (234,99 / 109), 76156 (479,99 / 229) — wszystkie z RRP potwierdzonym w `rrp_potwierdzone.json`, więc skrypt klasyfikuje je jako „podejrzany rynek".
- Źródło cen: Empik (zrzut 15.09) i Ceneo (14.09) zgodnie; wszystkie trzy są dziś na `/deale/`, a 10423 dodatkowo na stronie głównej (`dist/deale/index.html`, `dist/index.html`).
- Odsiew serwisu (`src/lib/odsiew.js`) odrzuca dopiero ofertę poniżej 28% RRP, więc 47–50% przechodzi. `kontrola-rrp.mjs` jest w promptcie tylko Backfillu (wyłączonego) — **nikt nie uruchamia jej codziennie**.
- Weryfikacja u źródła: karty Empiku pobrane Firecrawlem (3 kredyty) nie zawierają ceny w HTML (sklep renderuje ją skryptem); karta 76156 zawiera słowo „niedostępne". **Nie rozstrzygnięto**, czy to realna wyprzedaż końcówek (zestawy z 2021–2022, możliwe), czy zaślepka. Do sprawdzenia w przeglądarce.

**1.4. Artykuł datowany na jutro.**
- `src/pages/artykuly/wycofania-lego-grudzien-2026.md`: `data: "2026-09-17"`, `zaktualizowano: "2026-09-17"` — opublikowany 16.09 (commit `1aa0a33`, Radar).
- Skutek: JSON-LD `datePublished: 2026-09-17` na produkcji, `<lastmod>2026-09-17</lastmod>` w `sitemap-priorytet.xml` (jedyna data z przyszłości w sitemapach; RUNBOOK twierdzi „data z przyszłości jest przycinana do dzisiejszej" — nie dotyczy sitemapy priorytetowej). Build tego nie wychwytuje.

**1.5. Poniedziałkowa przypominajka wysyła Markowi nieprawdziwe zdanie.**
- Prompt `trig_01BWC5ydHBNVE5Q8usmf62PN` (kopia z konta, `materialy/routine-prompty.md`): „UWAGA: dziś w redirects.json nie ma w ogóle klucza `empik` — 3 968 cen prowadzi na wyszukiwarkę".
- Stan faktyczny: `redirects.json` → `empik` ma **4 480 wpisów** (commit `f9b0cef`, 16.09 06:08, import zrzutu z 15.09). Routine jest z panelu — poprawić może tylko Marek.

---

## 2. Zadania cykliczne — odpowiedzialność i przepływ

**2.1. Co działa (zweryfikowane).**
- Odczyt z konta 16.09 10:22: 13 Routines, 10 naszych, 12 włączonych, 0 kolizji minutowych. Cztery poranne przebiegi 16.09 zakończone `SUCCEEDED` i mają commity: Scout `6d47664` 05:13, Radar `cd00dad` 08:15, Łowca `fa38f5f` 08:38 (+ import Empiku `f9b0cef`), Alerty (bez commitów z założenia), Zdjęcia → R2 (ślad w R2 04:31).
- Każdy skrypt i każda flaga wymieniona w promptach istnieje w repo — sprawdzone 25 par skrypt/flaga (`--wyjscie`, `--rrp`, `--sucho`, `--zrodlo`, `--nadpisz`, `--stare`, `--sprawdz`, `--zadanie`, `--wstep`, `--tylko-pdf`, `--szybko`, `--dni`, `--wszystko`, `--napraw`, `--usun-martwe`, `--tylko`, `--kandydaci`, `--pdf`…).
- Prompt wtorkowego Routine na koncie jest znak w znak zgodny z przekazanym (diff pusty); nazwa „Dane wt 05:30 — katalog LEGO.pl + ceny Ceneo i Smyk" opisuje realny zakres.
- `diagnoza.mjs` 16.09 09:54 UTC: 14/14 zmiennych, Cloudflare / R2 / Tradedoubler / Search Console / Adtraction / Performers / produkcja / trasa `/idz/` z nagłówkami przeglądarki / Firecrawl (251 kredytów) — wszystko „ok".

**2.2. Reguły importu Empiku żyją wyłącznie w pamięci sesji Łowcy.**
- Commit `f9b0cef`: „4967 pozycji → 4488 cen po filtrach (415 gadżetów, 54 sanity, 10 konfliktów)". Prompt Łowcy (sekcja IMPORT EMPIKU) mówi tylko: ceny do `oferty_feed` + `empik-redirects.mjs`. Ani „415 gadżetów", ani „próg sanity" nie są w żadnym prompcie ani skrypcie — Łowca odtworzył je z historii swojej trwałej sesji.
- Skill `klocki-ceny-empik` (linia 115) i `NARZEDZIA.md` (pkt 3 „Co gdzie wrzucać") twierdzą, że reguły „istnieją wyłącznie jako tekst w promptcie Łowcy" — to nieprawda od 15.09 (delete+create Łowcy z nowym promptem). Przy następnym odtworzeniu sesji import przejdzie bez filtrów.

**2.3. Sygnał Scouta o wycofaniach ma inny nagłówek niż ten, którego szuka runner Wycofań.**
- Prompt Scouta każe pisać `## … · SCOUT · Sygnały wycofań dla runnera Wycofań`; wpis z 16.09 05:30 ma nagłówek `SCOUT · Przekazanie wycofań do runnera Wycofań`. Prompt Wycofań (krok 2a) i Kontrolera szukają wpisów „SCOUT · Sygnały wycofań…". Ryzyko: 16 wpisów ze StoneWars i 10 brakujących numerów nie zostaną przetworzone 21.09, a Kontroler nie policzy ich jako zadania bez właściciela.

**2.4. Zadania, które nie mają jak się skończyć.**
- Kontroler co poniedziałek wypisuje „Zadania bez właściciela" dla Marka i Piotra, ale **żaden z nich nie pisze do `DZIENNIK.md`** — nie ma zdefiniowanej ścieżki „zamknięte/odrzucone". Bez niej lista będzie rosła i powtarzać się co tydzień.
- Otwarte dziś (z `DZIENNIK.md`): tekst o 75192 Sokół Millennium — „Kto: Piotr" (Radar 15.09 i 16.09); 16 wpisów wycofań + 10 numerów do domknięcia — runner Wycofań (21.09); 5 statusów 21333/21351/21353/21356/76437 — runner Wycofań; ustalenie „decyzja o runnerze = zmiana promptu tego samego dnia" czeka na akceptację Marka od 15.09 14:50 (sekcja „Ustalenia trwałe" jest pusta); plan 30 tekstów na 21–27.09 (`redakcja/plan-tygodnia-2026-09-21.md`, 19 pozycji „Piotr") leży w repo, a Piotr czyta wyłącznie maile — **nie ma śladu, że plan do niego dotarł**.
- Wysyłka maili do Piotra: z repo wynika tylko konfiguracja (`raporty_mail.json`, oba adresy); log dostarczeń Resend **nie sprawdzono** (brak narzędzia w sesji).

**2.5. Zmiana czasu 25.10.2026** — Łowca zejdzie na 07:30 PL i zacznie łapać wczorajszy feed Media Expert (RUNBOOK, sekcja ME). Nikt nie ma tego w kalendarzu poza dokumentem; tabela „Zmiana czasu" w `zadania-cykliczne.md` jest przy tym nieaktualna (patrz 5.3).

---

## 3. Dane: ceny, daty, linki, zdjęcia, opisy

**3.1. Świeżość cen (`oferty_feed.json`, data per sklep — 0 wierszy bez daty, 0 cen ≤ 0):**

| Sklep | Ofert | Data | Rytm |
|---|---|---|---|
| Allegro | 4 978 | 16.09 | codziennie (Łowca) |
| Empik | 3 947 | 15.09 | tygodniowo (zrzut Marka) |
| Ceneo | 1 426 | 14.09 | tygodniowo (wtorek) |
| Planeta Klocków | 1 165 | 16.09 | codziennie |
| LEGO.com | 949 | 15.09 | tygodniowo (wtorek) |
| Media Expert | 751 | 16.09 | codziennie |
| Smyk | 668 | 16.09 | tygodniowo (wtorek, od dziś) |

- `sety.json` (1 172 zestawy, 5 010 ofert): 0 rozbieżności cen wobec feedu dla tego samego sklepu; 0 rozbieżności nazw i cen katalogowych wobec `katalog.json`; wyjątek: 17 ofert z sierpnia (pkt 1.2).
- `kontrola-rrp.mjs`: 4 661 cen katalogowych, 973 potwierdzone, **0 rozbieżnych** ze źródłem zweryfikowanym.
- `kontrola-ofert.mjs`: 0 ofert odrzuconych odsiewem (podszywki poniżej 28% RRP nie występują).
- `ceny-powyzej-rrp.mjs`: 0 zestawów w sprzedaży wg LEGO z ofertą powyżej katalogu (2 577 powyżej katalogu to wyłącznie EOL — zjawisko normalne).

**3.2. Linki sklepowe (produkcja, nagłówki przeglądarki `Sec-Fetch-Mode: navigate`).**
Każdy sklep z ofertą przekierowuje `302` na poprawny cel afiliacyjny: Allegro → `allegro.pl/affiliate?…`, Empik → `clk.tradedoubler.com` z kartą produktu, Ceneo → `pdt.tradedoubler.com`, Planeta → `webep1.com`, Media Expert → `track.performers.tech`, Smyk → karta produktu, LEGO → `lego.com/pl-pl/product/<slug>` (75377 po EOL → karta przez skrót numeru). Klik spoza strony (bez referera) → `302` na hub z komunikatem `?idz=odrzucony` — filtr botów działa. Pokrycie: 13 ofert Empiku i 3 LEGO bez wpisu w `redirects.json` — obie ścieżki mają działający fallback w workerze.

**3.3. Zdjęcia.**
- Próbka 54 adresów `/img/` na produkcji (40 z `obrazy.json`, 14 galerii): 53 × 200, **1 × 502** — `/img/11920.jpg` (źródło `cdn.rebrickable.com/media/sets/11920-1.jpg`, kontener też nie dostaje odpowiedzi).
- Pełny audyt `r2-obrazy.mjs --sprawdz` (11 281 adresów): **wynik w sekcji 3.6.**
- `oferty_feed.json`: 55 wpisów bez pola `zdjecie` (na 8 257).

**3.4. Opisy i karty.**
- `karty_setow.json`: 1 097 kart, 0 z placeholderami (`[wstaw`, `TODO`, `lorem`); wszystkie 7 kart zestawów z premierą 2026 (21583–21586, 31376, 31377, 31380) mają huby w sitemapie.
- `sety.json`: 1 087 z 1 172 zestawów bez własnego pola `opis` — to stan znany (opisy producenta z lego.pl leżą jako materiał w `materialy/opisy-lego/`, karty Piotra pokrywają 1 097 numerów).
- Teksty (29 plików `.md`): kategorie wyłącznie z zamkniętej listy (Recenzje 5, Premiery 9, Poradniki 1, Prezentownik 5, Porównania 1, Rankingi 2, Kalendarze 1, Deal 5) — walidacja w `prebuild` przeszła.

**3.5. Wycofania** (`audyt-wycofan.mjs`): 314 wpisów (209 potwierdzonych, 105 prognoz, 97 „wycofany"); A = 4 (pkt 1.1), B = 3, C/D/E/F/G = 0, H = 8 kandydatów bez oferty (21375, 11387, 40897, 12010, 12011, 10481, 40857, 40895 — cztery z nich mają w katalogu nazwę `{?}`), I = 4 801 zestawów `eol` z ofertą sklepu (normalne).

**3.6. Pełny audyt obrazów** (`r2-obrazy.mjs --sprawdz`, 11 281 adresów `/img/` na produkcji, 16.09 ok. 12:30): **11 150 OK, 131 brakuje (1,2%)** — wszystkie z kodem 502, wszystkie ze źródłem `cdn.rebrickable.com` (stare numery: 1270, 1753, 2004, 4034…). Z 40 wypisanych przez skrypt każdy hub ma `noindex` (zestawy archiwalne bez oferty), więc Google tego nie widzi; czytelnik na hubie widzi pustą miniaturę. Skrypt wypisuje tylko 40 pierwszych numerów — pełnej listy 131 nie ma gdzie odczytać (do poprawy w skrypcie).

---

## 4. Build, linkowanie, sitemapy, produkcja

- `npm run build`: 9 502 strony, 0 ostrzeżeń, prebuild (składnia eksportu skilli, kategorie, obrazy) przeszedł.
- Skaner `dist/` (własny, 9 504 plików HTML, 412 429 hrefów): **0 martwych linków wewnętrznych**, 0 linków bez końcowego ukośnika, 24 478 linków `/idz/`; jedyna domena zewnętrzna w hrefach to `tylkoklocki.pl` (linki sklepowe idą przez worker — poprawnie).
- Sitemapy: 7 sekcyjnych + priorytetowa, 2 511 adresów / 1 296 unikalnych; **0 adresów bez pliku, 0 adresów z `noindex`**; `sitemap-zestawy.xml` 1 161 hubów; 1 `lastmod` z przyszłości (pkt 1.4). Poza sitemapą została jedna strona indeksowalna: `/polityka-prywatnosci/` (świadomie lub nie — nie udokumentowano). `/kolekcjoner/` ma `noindex` i nie ma go w sitemapie — zgodnie z decyzją z 15.09.
- Canonical ≠ adres tylko dla dwóch stron przekierowujących (`/kalendarz-redakcyjny/` → `/artykuly/`, `/serie/tradycyjne-festiwale-chinskie/` → `/serie/seasonal/`) — zamierzone.
- JSON-LD: bloki parsują się (`Product` + `AggregateOffer` bez Ceneo, `BreadcrumbList`, `FAQPage`, `Article`, `WebSite`, `CollectionPage`); cena w `AggregateOffer` zgodna z tabelą (60339: lowPrice 349 = najniższy wiersz tabeli). OG-obrazy istnieją (`/og.png`, huby przez `/img/`).
- Produkcja 16.09: 19 sprawdzonych adresów (strona główna, huby, działy, `robots.txt`, `sitemap-index.xml`, `rss.xml`, `/szukaj/`, `/o-nas/`, polityka) — wszystkie 200; deploy aktualny (hub 75377 pokazuje wdrożony rano tekst „brak w sprzedaży"); `robots.txt` = `Allow: /`, `Disallow: /idz/`, sitemapa.
- Linkowanie wewnętrzne: hub → seria, podobne z serii (4–6), teksty o zestawie, prezentowniki; teksty → huby przez `remark-nazwy-setow`; działy → huby. Brak sierot w sitemapie (każdy adres z sitemapy ma plik i jest linkowany z listingów).

---

## 5. Spójność dokumentów z narzędziami (co jest nieaktualne)

**5.1. Skill Coworka jest o jedną decyzję do tyłu.** `node scripts/eksport-skilli.mjs` uruchomiony 16.09 zmienia `.claude/skills/*/references/ustalenia-projektowe.md` (wiersz „karta researchu" — decyzja z 15.09 15:07, commit `aedff7b`). Ostatni eksport i paczki `.skill` są z `497043e` (15.09 12:26), a Marek wgrał paczki „ok. 15:00" (NARZEDZIA, pkt 4) — czyli Cowork ma jeszcze regułę „karta dla każdego tekstu". Dokładnie ten rozjazd, przed którym ostrzega CLAUDE.md.

**5.2. `RUNBOOK.md`** — trzy sekcje opisują stan sprzed tygodnia jako obecny:
- „Mapa plików danych" (stan 23.08): Wycofania „06:00" (dziś poniedziałek 06:10), Backfill „wyłączony od 29.08", `katalog.json` bez `lego-ceny.mjs`; brak w ogóle `przecieki.json`, `karty_setow.json`, `rrp_potwierdzone.json`, `lego_strony_brak.json`, `galerie.json`, `zdjecia.json`, `ean.json`, `opisy.json`, `feedy.json`, `kategorie_artykulow.json`.
- „Ceny Empik (od 29.08…)": „Linki idą przez szablon `szukaj`", „Ostatni zrzut: 31.08.2026", „Smyk i lego.pl wciąż na jednorazowych zrzutach z 29.08 — cykliczne odświeżanie do ustalenia" — wszystko nieaktualne od 15–16.09.
- „Stabilność formatu plików JSON *(do naprawy)*" — naprawione 15–16.09 (`json-kolejnosc.mjs`, `porzadek-ofert.mjs`), sekcja nie wie.
- „Pułapka: karta ≠ podstrona (445 kart, 32 bez podstrony)" — od 15.09 każdy numer z katalogu ma hub; kart jest 1 097.

**5.3. `materialy/zadania-cykliczne.md` (część ręczna)**: tabela „Co zapisuje każdy runner" pomija `przecieki.json`, `DZIENNIK.md` (Scout, Radar, Wycofania), `obrazy.json` (Łowca), `routine-prompty.md` i `kontroler-*.md` (Kontroler), cały wtorkowy Routine, Alerty i Przypomnienie; przypisuje Scoutowi `katalog.json`, a Łowcy `sklepy.json` — prompty tego nie każą. Tabela „Zmiana czasu — 25.10.2026": R2 „04:00" (cron `30 2` = 04:30), Empik „pon 07:00" (jest 08:15), brak „Dane wt 05:30" i „Alerty 09:30". Sekcja „Modele": „zgodne ze stanem na 31.08" — nie sprawdzono.

**5.4. `NARZEDZIA.md`**: „Kontroler i Social startują świeżą sesją" (Social skasowany 15.09; świeżą sesją startują dziś Kontroler, R2, Empik-przypomnienie, Dane wt, Alerty); „Budżet Firecrawla: odświeżenie katalogu lego.pl raz na kwartał" (od 15.09 co tydzień, ~75 kredytów → ~300/mies. z 1 000); „Czego Firecrawl nie dostarczył: ani jednej ceny katalogowej" (15.09 dostarczył 147); pkt 3 „Co gdzie wrzucać" — patrz 2.2.

**5.5. `oferty_feed.json` → `_meta`**: „klucz empik … ostatni 14.09.2026" (jest 15.09), „generowane_przez: klocki-lowca-promocji" (skill odinstalowany 14.09). Kosmetyka, ale to plik, który czytają runnery.

**5.6. Co jest spójne (sprawdzone i bez uwag):** `CLAUDE.md`; `scripts/README.md` (właściciele skryptów zgodni z promptami); `redakcja/README.md`, `wspolpraca.md`, `materialy/README.md`; `routine-prompty.md` i sekcja „Zrzut" (generowane z konta 16.09 10:22); `afiliacje_rejestr.json` (LEGO: Rakuten odmowa 15.09 — zgodne z promptem Kontrolera); `raporty_mail.json`.

---

## 6. Widoczność (stan wyjściowy, 16.09)

- Search Console, 7–14.09: **2 kliknięcia, 118 wyświetleń, CTR 1,7%, średnia pozycja 23,9**; najlepsza fraza „lego 11387" (38 wyświetleń, pozycja 8,2).
- Kliknięcia `/idz/` (Analytics Engine, 7 dni): **79 ludzkich**, 1 282 botów, 614 nieoznaczonych sprzed 14.09; ludzkie: Allegro 15, LEGO 15, Smyk 8, Empik 7, Planeta 7, Media Expert 7, Ceneo 3.
- W indeksie (panel GSC, dane z 4.09 — ostatni odczyt 15.09): 307 zindeksowanych, 3 291 „wykryta – obecnie niezindeksowana". Nowszego odczytu z panelu nie ma (tylko Marek).

---

## 7. Czego nie sprawdzono (uczciwie)

- Log dostarczeń Resend (czy maile runnerów i plan tekstów faktycznie doszły do Piotra).
- Ceny trzech deali Empiku u źródła (strona renderowana skryptem; Firecrawl bez JS ich nie widzi).
- Kto ma rację przy 10280 / 42211 / 40647 (katalog `eol` vs termin na liście).
- Modele sesji runnerów („Modele" w zadaniach cyklicznych).
- Liczba zindeksowanych stron w panelu GSC po 4.09.
- Poprawność wizualna na urządzeniach (bez przeglądarki w kontenerze — struktura HTML i CSS tak, render nie).
