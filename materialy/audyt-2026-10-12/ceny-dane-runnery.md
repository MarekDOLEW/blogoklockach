# Audyt 12.10.2026 — ceny, dane, runnery

Stan: `origin/main` @ `49c795a` (12.10 08:51 UTC). Punkt odniesienia sprzed tygodnia:
`4e3b06d` (05.10 09:16 UTC, „Zrzuty 05.10"). Tryb tylko do odczytu, liczone skryptami
w Pythonie na kopii `git archive` (bez `npm run build`). Godziny commitów w UTC (PL = UTC+2).

## 1. Świeżość cen per sklep

Przedziały wieku liczone od 12.10.2026. „Rytm" to oczekiwana data ostatniego odczytu.

### `oferty_feed.json` (klucz `sety`, pole `daty[sklep]`)

| Sklep | z ceną | dziś | 1–2 dni | 3–7 | 8–14 | >14 | najstarsza | rytm | werdykt |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| allegro | 6103 | 6103 | 0 | 0 | 0 | 0 | 12.10 | codziennie (Łowca) | OK |
| mediaexpert | 728 | 728 | 0 | 0 | 0 | 0 | 12.10 | codziennie (Łowca) | OK |
| planetaklockow | 1101 | 1101 | 0 | 0 | 0 | 0 | 12.10 | codziennie (Łowca) | OK |
| empik | 4394 | 4394 | 0 | 0 | 0 | 0 | 12.10 | pon., zrzut Marka | OK |
| xkom | 735 | 735 | 0 | 0 | 0 | 0 | 12.10 | pon., zrzut Marka | OK |
| lego | 966 | 0 | 0 | 963 | 3 | 0 | 29.09 | wt. 06.10 (Dane wt) | OK (3 zestawy nieobecne na listingu 06.10) |
| ceneo | 1673 | 0 | 0 | 1443 | 95 | **135** | **14.09** | wt. 06.10 (Dane wt) | **stare wpisy wiszą** |
| smyk | 636 | 0 | 0 | 636 | 0 | 0 | 09.10 | wt. (Dane wt) + pt. (Łowca) | OK (piątek 09.10) |
| lidl | 86 | 63 | 13 | 6 | 3 | 1 | 22.09 | codziennie (Łowca → `ceneo-feed.mjs`) | **23 oferty spoza dzisiejszego feedu** |

Ceneo według dat: 1443 × 06.10, 95 × 29.09, 78 × 22.09, 57 × 14.09.

### `sety.json` (`oferty[].data`)

| Sklep | ofert | dziś | 1–2 | 3–7 | 8–14 | >14 | najstarsza |
|---|---:|---:|---:|---:|---:|---:|---|
| allegro | 1099 | 1099 | 0 | 0 | 0 | 0 | 12.10 |
| empik | 980 | 980 | 0 | 0 | 0 | 0 | 12.10 |
| planetaklockow | 850 | 850 | 0 | 0 | 0 | 0 | 12.10 |
| mediaexpert | 666 | 666 | 0 | 0 | 0 | 0 | 12.10 |
| xkom | 654 | 654 | 0 | 0 | 0 | 0 | 12.10 |
| lego | 785 | 0 | 0 | 783 | 2 | 0 | 29.09 |
| smyk | 609 | 0 | 0 | 609 | 0 | 0 | 09.10 |
| lidl | 78 | 55 | 13 | 6 | 3 | **1** | 22.09 (76443) |

Ceneo nie ma ofert w `sety.json`, tylko w feedzie (zgodnie z regułą skryptu).

**Oferty >14 dni.** W `sety.json` 1 (76443 Lidl, 22.09). W feedzie 136 (135 Ceneo, 1 Lidl);
jutro dojdzie 95 Ceneo z 29.09, jeśli wtorkowy przebieg ich nie odświeży. Strona ich
nie pokazuje (`filtrujOferty` → `ofertaAktualna`, 14 dni, `src/lib/oferty.js`), ale:
- 35 wpisów feedu ma legacy `cena`/`sklep` (najniższa) wziętą z przeterminowanej oferty
  (34 Ceneo + 1 Lidl, np. 10256, 10497, 11010);
- 3 numery (71046, 75275, 5009157) mają w feedzie wyłącznie ofertę Ceneo z 14–22.09,
  a `src/lib/huby.js` (`maCeneZFeedu`) liczy hub bez sita wieku, więc dalej uznaje je za
  „ma cenę".

## 2. Historia cen (`historia-cen/2026-10.jsonl`, z końcówką września)

Plik zapisuje tylko zmiany cen, więc liczba wierszy to liczba zmian, nie ofert.

| Dzień | wpisów | w tym |
|---|---:|---|
| 03.10 | 1169 | allegro 1030, ME 120, lidl 12, PK 7 |
| 04.10 | 1159 | allegro 1074, ME 70, lidl 9, PK 6 |
| 05.10 | 3169 | + empik 1304, xkom 721 (zrzut) |
| 06.10 | 1397 | + lego 10, smyk 24, empik 50 |
| 07.10 | 1185 | allegro 1033, ME 142 |
| 08.10 | 1288 | allegro 1132, ME 142 |
| 09.10 | 1335 | + smyk 35 (piątek) |
| 10.10 | 1098 | allegro 941, ME 129 |
| 11.10 | 894 | allegro 816, ME 68 |
| 12.10 | 2746 | + empik 1517, xkom 80 (zrzut) |

**Dziur nie ma**, każdy dzień ma zapis Łowcy. Wrzesień bez zmian (28 563 wiersze,
plik zamknięty), październik 7142 → 19 110, `_ostatnie.json` 15 275 → 16 086 kluczy. JSONL parsuje się w całości.

## 3. Append-only (05.10 `4e3b06d` → 12.10 `49c795a`)

Wszystkie 25 plików `src/data/*.json` parsują się. Porównanie liczby wpisów na dwóch poziomach
(korzeń i każda gałąź) oraz identyfikatorów (czy coś zniknęło):

| Plik | 05.10 | 12.10 | uwagi |
|---|---:|---:|---|
| sety.json | 1180 | 1185 | żaden numer nie zniknął |
| oferty_feed.json `sety` | 8732 | 8765 | żaden numer nie zniknął |
| ceny_baza.json | 1135 | 1135 | |
| redirects.json | 12 gałęzi | 12 | **xkom 796 → 788** (dozwolone, `--usun-martwe`: 10344, 10444, 10476, 42673, 60475, 60498, 75684, 76323); reszta rośnie lub bez zmian (allegro 7057→7108, empik 4785→4821, ceneo 1682→1714, lego 969→974, ME 833→850, lidl 84→86) |
| wycofania.json | 404 | 428 | żaden wpis nie zniknął |
| przecieki.json | 26 | 29 | |
| known_sets.json | 45 | 54 | |
| konkurencja_baza.json `publikacje` | 241 | 281 | |
| galerie.json | 80 | 82 | |
| obrazy.json | 10948 | 10963 | |
| kody_rabatowe.json | — | 1 sklep / 2 kody | plik nowy (10.10) |
| pozostałe (ean, opisy, zdjecia, karty_setow, katalog, rrp_potwierdzone, deale_potwierdzone, sklepy, feedy, afiliacje_rejestr, raporty_mail…) | = | = | bez spadków |

**Alarmów nie ma.** Jedyny spadek to `redirects.xkom`, który reguła z CLAUDE.md dopuszcza.

Liczby ofert per sklep w feedzie tydzień do tygodnia: ME 745→728, PK 1107→1101,
Smyk 647→636 (zwykła rotacja asortymentu), reszta rośnie.

## 4. Runnery w gicie (05–12.10)

| Runner | rytm | dni z commitem | dni bez | uwagi |
|---|---|---|---|---|
| Scout | codziennie 05:00 | 06, 07, 08, 09, 10, 11, 12 | **05.10** | ostatni przed tym: 04.10 `b223fca`; nie sprawdzono, czy 05.10 było „brak nowości", czy brak przebiegu (trigger odtworzono w tygodniu) |
| Łowca | codziennie 08:30 | 05, 06, 07, 08, 09, 10, 11, 12 | — | 12.10 `15501f4` 07:09 UTC + raport linków |
| Radar | codziennie 08:00 | 05, 06, 07, 08, 09, 10, 11, 12 | — | |
| Wycofania | pon. 06:10 | 05 (sama adnotacja), 12 | — | 12.10: +24 wpisy |
| Dane wt (LEGO.pl + Ceneo + Smyk) | wt. 05:30 | 06 (`d42644b`) | — | następny 13.10 |
| Smyk piątkowy (w Łowcy) | pt. | 09 (`077fb6a`) | — | |
| Zrzuty Empik / x-kom | pon., Marek | 05 (`4e3b06d`), 12 (`a3b2ece`) | — | |
| Harmonogram z konta | pon. 07:45 | 05 (`8f6f290`), 12 (`94c589c`) | — | odczyt 12.10 07:47 |
| Kontroler | pon. 09:00 | 05 (`dcb4261`), 12 (`8076ba2`) | — | |

**Duże commity.** Łowca przepisuje codziennie 5–8 tys. linii `sety.json` i 1,5–1,8 tys. linii
`redirects.json` (np. `077fb6a`: +6351/−5060), a Dane wt 06.10 ruszył 2054 linie `katalog.json`
i 3039 linii `sety.json`. Liczby wpisów nie spadły, żaden klucz nie zniknął, więc to zmiany
wartości. Kontroler `8076ba2` przeniósł 917 linii z `DZIENNIK.md` do archiwum, zgodnie z
procedurą. Wycofania `1f5b561` miały +621/−187, ale bez utraty wpisów.

Drobne: raport Kontrolera 12.10 podaje commity Scouta jako „8–12.10", a Radara jako „7–12.10".
W gicie Scout ma też 06 i 07, a Radar 06. Raport zaniża liczbę commitów, ale werdykt
„komplet" jest i tak prawdziwy.

## 5. Kontrola linków

| Sklep | 05.10 próba / żywe / blokada / nierozstrz. | 12.10 próba / żywe / blokada / nierozstrz. |
|---|---|---|
| planetaklockow | 50 / 50 / 0 / 0 | 54 / 54 / 0 / 0 |
| ceneo | 54 / 54 / 0 / 0 | 45 / 45 / 0 / 0 |
| smyk | 23 / 23 / 0 / 0 | 13 / 13 / 0 / 0 |
| lidl | — | 3 / 3 / 0 / 0 |
| xkom | 3 / 0 / 3 / 0 | 15 / 0 / 15 / 0 |
| allegro | 5 / 0 / 0 / 5 | 5 / 0 / 1 / 4 |
| empik | 5 / 0 / 5 / 0 | 5 / 0 / 5 / 0 |
| mediaexpert | 5 / 0 / 5 / 0 | 5 / 0 / 5 / 0 |
| lego | 5 / 0 / 5 / 0 | 5 / 0 / 5 / 0 |
| **razem** | 150, martwych 0, blokada 18 | 150, martwych 0, blokada 31 |

Martwych linków nie ma w żadnym tygodniu. Sprawdzalna część próby spadła ze 127 do 115,
bo x-kom (same blokady) dostał 15 miejsc zamiast 3. Sklepy, których kontrola z serwera nie
sprawdzi (Allegro, ME, Empik, LEGO, x-kom), to ok. 14,5 tys. z 18,9 tys. linków (77%). Dla
nich jedyną kontrolą jest `--usun-martwe` przy zrzutach Empiku i x-komu oraz nadpisywanie
linków z feedu przez Łowcę.

## 6. Diagnoza (`node scripts/diagnoza.mjs`, pełna, 12.10 09:42 UTC)

- Repo: `praca` = `origin/main` @ `49c795a`, czyste drzewo; node_modules i astro są.
- Zmienne środowiska: 14/14.
- Dane: feed 12.10, import Empiku 12.10, **rejestr afiliacji zaktualizowany 17.09** (25 dni).
- Dostępy (realne wywołania): Cloudflare ok (16 598 kliknięć w 7 dni), R2 ok, Tradedoubler ok,
  Search Console ok, Adtraction ok, Performers ok, produkcja 200, link sklepu 302,
  Firecrawl ok (3034 kredyty).

**Wynik: wszystko OK**, problemów z dostępem nie ma.

## 7. Daty ważności

Artykuły z `wazne_do`:

| Plik | wazne_do | stan 12.10 |
|---|---|---|
| `src/pages/deale/deal-x-kom-dzien-chlopaka-2026.md` | 30.09 | **wygasł** (12 dni) |
| `src/pages/artykuly/x-kom-aplikacja-weekend-lego-pazdziernik-2026.md` | 11.10 | **wygasł** (wczoraj) |
| `src/pages/artykuly/x-kom-wyzsza-szkola-rabatu-2026-lego.md` | 18.10 | trwa |
| `src/pages/artykuly/media-expert-kod-lego-pazdziernik-2026.md` | 31.10 | trwa (podkod PNU0910-1510 do 15.10) |

Jak serwis traktuje `wazne_do`:
- `src/lib/aktualnosci.js` porównuje z datą builda. Karta pokazuje „trwa do …", a po dacie
  „akcja zakończona" i spada na koniec listy (`KartaAktualnosci.astro`). Build idzie
  codziennie z pushem Łowcy, więc karty są aktualne.
- `src/layouts/` nie czyta `wazne_do`. **Sama strona artykułu po wygaśnięciu nie ma żadnej
  adnotacji**: Dzień Chłopaka dalej pisze w leadzie „akcja trwa do 30 września" i „wiersz
  x-kom jest tam do 30 września", a teksty mają linki `/idz/xkom/…`.
- Oferta z `wazne_do` w `sety.json` znika po dacie (`ofertaAktualna`). Dziś takich ofert nie
  ma (0).

`kody_rabatowe.json` (generuje `me-kody.mjs`, Code na żądanie, odczyt 10.10): ME0110-311026
do 31.10 (62 zestawy), PNU0910-1510 do 15.10 (2 zestawy). Oba ważne; po dacie wpis jest
pomijany automatycznie.

`deale_potwierdzone.json` (ostatnia zmiana 18.09): 3 potwierdzone, 4 odrzucone. Policzone
lokalnie, tą samą regułą co `podejrzanyRynek`. Uruchomienie `podejrzany-rynek-mail.mjs --sucho`
zablokował klasyfikator uprawnień. **5 ofert ukrytych jako „podejrzany rynek", bez werdyktu**,
wszystkie z Allegro: 76319 (64 zł / RRP 144,99), 75372 (29,99 / 124,99), 71853 (39,99 / 81,99),
40816 (38,59 / 81,99), 40808 (21 / 54,99).

## 8. Luki katalogu

W `sety.json` jest 25 zestawów z `cena_katalogowa: null`, z czego 8 ma `bez_rrp`.
**12 zestawów ma oferty, a nie ma RRP ani `bez_rrp`:**

| Nr | Nazwa | Seria | Premiera | ofert |
|---|---|---|---|---:|
| 11501 | Bukiet tulipanów | Botanicals | 2026-01 | 6 |
| 30715 | Przyjęcie urodzinowe z uroczymi zwierzątkami | Creator | 2026-01 | 4 |
| 30728 | Minimodel Brzeszczota | Star Wars | 2026-04 | 4 |
| 30724 | Gabinet Dumbledore'a z Harrym Potterem | Harry Potter | 2026-02 | 3 |
| 30714 | Rudy kot | Creator | 2026-01 | 2 |
| 30722 | Domek króliczka w ogrodzie | Friends | 2026-01 | 2 |
| 30723 | Samochód ninja Cole'a | Ninjago | 2026-01 | 2 |
| 30735 | Hot Rod | Technic | 2026-01 | 2 |
| 40902 | Hołd dla Leonarda da Vinci | Ekskluzywne i promocyjne | 2026-01 | 2 |
| 40910 | Mistrz Rzucania Mięsem i Podniebna | BrickHeadz | 2026-01 | 2 |
| 40912 | Wąż morski | Ideas | 2026-07 | 2 |
| 40890 | Wielkanocne dekoracje | Seasonal | 2026-03 | 1 |

Osiem to polybagi 30xxx i GWP 40xxx, które zwykle dostają `bez_rrp`. Wyjątki to 11501
(Botanicals, ma RRP na lego.pl) i 40910 (BrickHeadz).

## Rozjazdy (co się nie zgadza z harmonogramem lub regułami)

1. **Ceneo: 135 ofert z 14–22.09 wisi w feedzie.** Wtorkowy `ceneo-feed.mjs` nic nie kasuje,
   a `oferty-przeterminowane.mjs` czyści tylko `sety.json`. Strona ich nie pokazuje, ale 35 z
   nich wyznacza legacy `cena`/`sklep`, a 3 huby liczą się jako „z ceną" bez sita wieku
   (`huby.js`).
2. **Lidl: 23 oferty spoza dzisiejszego feedu** (daty 22.09–11.10) dalej są widoczne na
   stronie do 14 dni od ostatniego odczytu. Lidl ma krótkie akcje, więc cena z wygasłej
   promocji może wisieć dwa tygodnie.
3. **Scout bez commita 05.10.** Pozostałe dni są kompletne.
4. **Wygasłe aktualności bez adnotacji na stronie artykułu.** Karta jest poprawna, artykuł nie.
5. Raport Kontrolera 12.10 zaniża liczbę commitów Scouta (06–07) i Radara (06). Werdykt się
   nie zmienia.
6. Rejestr afiliacji `_meta` z 17.09. Nie sprawdzono, czy od tego czasu zmienił się status
   któregoś programu.
7. Kontrola linków: blokowane sklepy (x-kom 15/150) zjadają próbę, sprawdzalnych linków
   ubyło (127 → 115).

Zgodne z rytmem: Allegro, ME, PK, Empik i x-kom mają 12.10, LEGO i Ceneo 06.10, Smyk 09.10
(piątkowy przebieg Łowcy). Historia cen bez dziur, append-only bez naruszeń, diagnoza czysta.

## Do zrobienia

| # | Kto | Co | Plik |
|---|---|---|---|
| 1 | Marek | Werdykt dla 5 ofert Allegro „podejrzany rynek": 76319, 75372, 71853, 40816, 40808 (prawdopodobnie odrzucone) | `src/data/deale_potwierdzone.json` |
| 2 | Code | Rozszerzyć `oferty-przeterminowane.mjs` (albo `ceneo-feed.mjs`) o czyszczenie `oferty_feed.json` z ofert >14 dni i przeliczanie `cena`/`sklep`; w `huby.js` `maCeneZFeedu` przepuścić przez `ofertaAktualna` | `scripts/oferty-przeterminowane.mjs`, `src/lib/huby.js` |
| 3 | Code + decyzja Marka | Lidl: przy codziennym przebiegu usuwać oferty nieobecne w feedzie (jak `--usun-martwe` dla Empiku i x-komu) albo skrócić dla Lidla sito wieku do 1–2 dni | `scripts/ceneo-feed.mjs` / `src/lib/oferty.js` |
| 4 | Code | Baner „akcja zakończona DD.MM" w layoucie artykułu, gdy `wazne_do` < data builda (dziś: Dzień Chłopaka, weekend w aplikacji x-kom) | `src/layouts/Artykul.astro` |
| 5 | Code / Marek | 12 luk RRP: 11501 i 40910 uzupełnić z lego.pl, polybagi i GWP oznaczyć `bez_rrp` | `src/data/sety.json` (+ `rrp_potwierdzone.json`) |
| 6 | Code | Jednorazowo `node scripts/oferty-przeterminowane.mjs` (76443 Lidl z 22.09) | `src/data/sety.json` |
| 7 | Marek / Code | Sprawdzić log sesji Scouta z 05.10 (brak przebiegu czy brak nowości) | sesja Scouta, `DZIENNIK.md` |
| 8 | Code | `kontrola-linkow.mjs`: losować próbę tylko ze sklepów sprawdzalnych (PK, Ceneo, Smyk, Lidl), a blokowane raportować liczbą | `scripts/kontrola-linkow.mjs` |
| 9 | Marek | Przejrzeć statusy programów (ostatnia zmiana 17.09) | `src/data/afiliacje_rejestr.json` |
