# tylkoklocki.pl — zadania cykliczne i obieg plików

*Stan na 13.08.2026. Jedno miejsce prawdy: co się dzieje automatycznie, co produkuje i co Ty z tym robisz.*

## Złota zasada

Każdy plik danych serwisu trafia w jedno miejsce: **`src/data/` w repo `MarekDOLEW/blogoklockach`**, gałąź `main`.
Wgranie = GitHub → folder `src/data/` → **Add file → Upload files** → przeciągnij plik → **Commit changes**.
Push na `main` uruchamia build i deploy automatycznie (Cloudflare) — nic więcej nie klikasz. Strona odświeża się w ~2 minuty.

Zadania próbują pushować same; jeśli sesja nie ma dostępu do repo, oddadzą Ci gotowy plik w czacie — wtedy wykonujesz jeden upload wg zasady powyżej.

## Harmonogram dzienny (czasy PL)

| Godzina | Zadanie | Co produkuje | Co robisz Ty |
|---|---|---|---|
| 05:00 | **Scout nowości** | zaktualizowany `sety.json` (nowe premiery) + raport zajawek | plik → `src/data/sety.json` (jeśli nie spushował sam) |
| 06:00 | **Wycofania** | zaktualizowany `wycofania.json` (nowe pozycje, zmiany statusów) | plik → `src/data/wycofania.json` |
| 08:00 / 13:00 / 17:00 | **Radar konkurencji** (×3) | raport luk tematycznych w czacie; bazę `konkurencja_baza.json` zapisuje sam w plikach Cowork | nic nie wgrywasz — czytasz raport, ew. zlecasz artykuły Redaktorowi |
| 09:00 | **Łowca promocji** | `sety.json` (ceny/oferty/zdjęcia z feedu PK), ew. `sklepy.json`, `redirects.json` (nowe linki afiliacyjne) + posty dealowe | pliki → `src/data/…`; posty dealowe publikujesz wg uznania |
| pon 09:00 | **Kontroler** | tygodniowy raport finansowy | nic nie wgrywasz |

Poza projektem LEGO: pon 07:00 — plan angielskiego (PDF w czacie), pon 08:00 — raport Herzfaden. Jednorazowo: **15.08 08:00** — przypomnienie w głównym czacie o rozbudowie stron serii (ceny/zdjęcia/akordeon).

## Mapa plików danych

| Plik w `src/data/` | Kto go aktualizuje | Co zasila na stronie |
|---|---|---|
| `sety.json` | Scout (nowe sety) + Łowca (ceny, oferty, zdjęcia) | `/nowosci/`, podstrony `/zestaw/{nr}/`, sekcja „Śledzone" na stronach serii |
| `wycofania.json` | Wycofania 06:00 | `/wycofania/` (lista, filtr, FAQ) |
| `katalog.json` | sesje ad hoc (dokładanie serii) | katalogi historyczne na `/serie/{seria}/` + kafelki na `/serie/` |
| `redirects.json` | Łowca (linki z feedu) + sesje ad hoc | przekierowania `/idz/{sklep}/{nr}` i widoczność przycisków sklepowych |
| `sklepy.json` | Łowca (nowe sklepy) | nazwy sklepów w tabelach cen |

Żelazna reguła dla każdej aktualizacji (wpisana w prompty zadań): **pobierz aktualny plik z repo → dołóż zmiany → zwaliduj → nigdy nie twórz od zera i nie usuwaj wpisów.** Gdy sesja w czacie buduje dane, zawsze podawaj jej link do surowego pliku: `https://raw.githubusercontent.com/MarekDOLEW/blogoklockach/main/src/data/<plik>` (przy weryfikacji dodać `?t=<cokolwiek>`, bo cache CDN bywa nieświeży).

## Gdzie co sprawdzić, gdy coś nie gra

- **Build/deploy**: Cloudflare → Workers & Pages → blogoklockach → *Deployments / Build history*. Czerwony build = strona zamrożona na ostatniej zielonej wersji; logi po kliknięciu „View build".
- **Ruch na stronie**: Cloudflare → Analytics & Logs → Web Analytics.
- **Kliknięcia afiliacyjne**: dziś w panelu webePartners (autorytatywne); worker dodatkowo je liczy, gdy włączymy Analytics Engine (wymaga planu Workers Paid).
- **Rollback**: Deployments → Version History → „…" przy starszej wersji → rollback.
