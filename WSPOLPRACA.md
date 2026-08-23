# Współpraca Claude Code ↔ Cowork

Dokument nadrzędny dla podziału pracy między dwoma narzędziami. Czytają go oba.
Jeśli cokolwiek w innym pliku jest z tym sprzeczne — obowiązuje ten plik.

## Model: nie ma wspólnego dysku

Claude Code pracuje w kontenerze sesji (`/home/user/blogoklockach`).
Cowork pracuje na Macu Marka.

**Te dwa środowiska nie widzą swoich plików.** Jedynym kanałem wymiany jest
repozytorium `github.com/MarekDOLEW/blogoklockach`. Nie istnieje żaden inny
sposób, w jaki jedno narzędzie może zobaczyć pracę drugiego.

Konsekwencja: praca, która nie została zacommitowana i wypchnięta, dla drugiej
strony nie istnieje.

## Źródło prawdy

Repozytorium GitHub, gałąź `main`. To z niej Cloudflare buduje produkcję.

Wszystko inne to kopie robocze. W szczególności **nie są źródłem prawdy**:

- `~/Desktop/TYLKOKLOCKI/blogoklockach-astro/` — kopia z 11.08, sprzed
  rebrandingu (`site: blogoklockach.pl`, 8 zestawów w `sety.json`). Do archiwum.
- `~/Desktop/TYLKOKLOCKI/tylkoklocki-rebranding_1/` — szkielet, 4 pliki.
  Do archiwum.
- `~/Documents/Claude/Projects/blogoklockach/` — stara baza danych skilli
  Cowork. Repo nie odwołuje się do niej w żadnym miejscu. Do archiwum.

## Podział własności

| Ścieżka | Właściciel | Cowork |
|---|---|---|
| `src/lib/`, `src/components/`, `src/layouts/` | Claude Code | tylko czyta |
| `src/pages/**/*.astro`, `src/worker.js` | Claude Code | tylko czyta |
| `src/data/*.json` | runnery (Code) | **nie dotyka** |
| `scripts/` | Claude Code | tylko czyta |
| `astro.config.mjs`, `wrangler.jsonc`, `package.json` | Claude Code | **nie dotyka** |
| `public/` | Claude Code | tylko czyta |
| `src/pages/artykuly/*.md` | **Cowork** | pisze |
| `src/pages/prezentowniki/*.md` | **Cowork** | pisze |
| `materialy/` | **Cowork** | pisze |
| `redakcja/` | wspólnik + Cowork | pisze |
| `DZIENNIK.md` | oba, append-only | dopisuje |

### Dlaczego `src/data/*.json` jest zamknięte dla Cowork

Te pliki są generowane przez runnery i są duże: `redirects.json` 2,6 MB,
`oferty_feed.json` 1,6 MB. Łowca przepisuje w nich całe gałęzie przy każdym
przebiegu. Ręczna edycja z drugiej strony to gwarantowany konflikt merge'a
na pliku, którego nikt nie rozwiąże sensownie.

Jeśli Cowork potrzebuje zmiany w danych — **opisuje ją w `DZIENNIK.md`
i zostawia Claude Code do wykonania.** Nigdy nie edytuje sam.

## Protokół pracy

Obowiązuje obie strony, bez wyjątków.

1. **Na starcie każdej sesji:** `git pull --rebase origin main`, potem
   przeczytaj ostatnie 3 wpisy w `DZIENNIK.md`.
2. **Przed rozpoczęciem zadania:** sprawdź w dzienniku, czy druga strona nie
   ma go w toku. Jeśli ma — nie duplikuj, zapytaj Marka.
3. **W trakcie:** commituj tylko własne pliki. **Nigdy `git add -A`** — wciągnie
   cudze zmiany i artefakty.
4. **Na koniec:** dopisz wpis do `DZIENNIK.md`, zacommituj, wypchnij:
   `git push origin <twoja-gałąź>:main`.
5. **Nie zostawiaj pracy niewypchniętej.** Dla drugiej strony to znaczy, że jej nie ma.

## Zasada jednego zadania

Jedno zadanie ma dokładnie jednego wykonawcę. Jeśli zadanie da się wykonać
po obu stronach, rozstrzyga tabela własności — decyduje to, gdzie leżą pliki,
które trzeba zmienić.

W razie wątpliwości: **nie rób, zapytaj.** Zdublowana praca na dużych plikach
JSON kosztuje więcej niż jedno pytanie.

## Runnery cykliczne — należą do Claude Code

Scout, Łowca, Radar, Kontroler, Wycofania i Backfill działają po stronie
Claude Code i zapisują do repo. Harmonogram: `materialy/zadania-cykliczne.md`.

**Cowork nie uruchamia tych zadań.** Skille `klocki-scout-nowosci`,
`klocki-lowca-promocji`, `klocki-radar-konkurencji` i `klocki-kontroler`
zainstalowane w Cowork to uśpione duplikaty — piszą do
`~/Documents/Claude/Projects/blogoklockach/`, czyli w próżnię. Ich wynik
nigdy nie dotrze na produkcję.

Do odinstalowania z Cowork albo przepisania na tryb wyłącznie czytający.

## Co Cowork robi dobrze

Research, teksty artykułów, social, raporty, analityka przez przeglądarkę
(GSC, GA4, panele sieci afiliacyjnych), praca na dokumentach `.docx`
wspólnika. Oddaje gotowe pliki `.md` do `src/pages/artykuly/`
zgodne ze standardem z `redakcja/`.

## Dług do spłacenia

- `COWORK-INSTRUKCJA.md` — nieaktualny w kluczowych punktach (błędne godziny
  Radara i Łowcy, opis zapisu „do plików Cowork"). Sprzeczny z
  `materialy/zadania-cykliczne.md`. **Skasować** — mylący plik jest gorszy
  niż jego brak, bo oba narzędzia go czytają.
- `_meta` w `known_sets.json` i `redirects.json` — nieprawdziwe opisy źródła
  danych. Poprawić.
- `.wrangler/` — dodać do `.gitignore`.
- `src/data/wycofania.astro` — martwy komponent w katalogu danych. Skasować.
- `sprawdz3.mjs` — jednorazowy skrypt z zahardkodowaną ścieżką. Skasować.
- Brak `.github/workflows` — konfiguracja deployu żyje tylko w panelu
  Cloudflare, nie da się odtworzyć środowiska z repo. Do udokumentowania
  przynajmniej opisowo.
