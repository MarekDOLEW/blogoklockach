# Co leży w `materialy/`

Ten katalog mieszał trzy różne rzeczy i audyt słusznie to wytknął. Rozdzielenie
zrobione **opisem, nie przenoszeniem** — i to jest świadoma decyzja, nie
pójście na łatwiznę.

Powód: prawie każdy plik jest linkowany z `DZIENNIK.md`, a wpisów w dzienniku
**nie wolno przepisywać** (reguła append-only z CLAUDE.md). Przeniesienie pliku
zostawiłoby w cudzym wpisie martwą ścieżkę, której nie mam prawa poprawić.
Sprawdzone przed decyzją: z siedemnastu pozycji tylko trzy nie mają żadnego
odwołania.

## Trwałe — czyta się je, żeby wiedzieć jak pracować

| Plik | Co zawiera |
|---|---|
| `zadania-cykliczne.md` | Harmonogram runnerów. Sekcja „Zrzut" jest **generowana** — `HARMONOGRAM:START/KONIEC`, nie edytuj ręcznie |
| `architektura-seo.md` | Struktura serwisu pod wyszukiwarki |
| `strategia-tresci.md` | Plan treści; mówi wprost, że sezon XI–XII 2026 to próba generalna, a moment prawdy to XI–XII 2027 |
| `instrukcja-import-bazy-rk.md` | Import bazy Republiki Klocków |
| `feedy-lego-mapa-sieci.html` | Mapa feedów i sieci afiliacyjnych |
| `ceny-katalogowe/` | Brief i lista RRP do sprawdzenia |
| `opisy-lego/` | Opisy serii — źródło dla kart zestawów |

## Datowane — zapis stanu z konkretnego dnia, nie reguła

Nie aktualizuje się ich. Nowy raport to nowy plik z nową datą w nazwie.

| Plik | Z kiedy |
|---|---|
| `kontroler-2026-09-14.md` | Raport Kontrolera. Opisuje przebieg **bez dostępów** — patrz `zadania-cykliczne.md`, sekcja o Kontrolerze |
| `audyt-wycofan-2026-09-13.md` | Audyt statusów EOL |
| `audyt-mechanizmu-2026-09-15.md` | Audyt całego mechanizmu (przepływ danych, SEO/indeksacja, UX, redakcja, konkurencja, nisze) — lista 19 punktów i 6 pytań do Marka |
| `dziennik-archiwum-2026-08.md` | Archiwum dziennika. **Tworzy i linkuje je `scripts/archiwum-dziennika.mjs`** — nie przenoś, indeks w `DZIENNIK.md` wskazuje na tę ścieżkę |
| `gsc-test.txt` | Test połączeń z API Google, 18.08.2026 — zapis momentu włączenia Search Console API w GCP |
| `mail-do-piotra-karty-poprawki.md` + `.pdf` | Jednorazowa korespondencja |

## Generowane — powstają ze skryptu i nadpisują się przy każdym przebiegu

Nie edytuj ich ręcznie: najbliższe uruchomienie skryptu i tak je nadpisze.

| Plik | Generuje |
|---|---|
| `kolejka-redakcyjna.xlsx` | `scripts/kolejka-redakcyjna.py` |
| `zestawy-bez-opisu.xlsx` | `scripts/bez-opisu-od-najnowszych.py` |
| `zestawy-bez-ceny.xlsx` | `scripts/zestawy-bez-ceny.py` |
| `karty-poza-kolejka.xlsx` | `scripts/karty-poza-kolejka.py` |

Zostają w gicie mimo że są odtwarzalne — Marek je otwiera, a bez nich świeży
klon nie pokazywałby stanu kolejki bez uruchamiania czterech skryptów.

## Gdzie wrzucać nowe

- **Reguła, instrukcja, plan** → tutaj, bez daty w nazwie, i dopisz do tabeli
  „Trwałe" wyżej.
- **Raport z konkretnego dnia** → tutaj, z datą w nazwie (`nazwa-RRRR-MM-DD.md`).
- **Wynik skryptu** → tam, gdzie skrypt go zapisuje; nie kopiuj ręcznie.
- **Materiał klienta spoza LEGO** (landing, prezentacja) → **nie do tego repo**.
  Jest publiczne. W tym miesiącu trafiły tu dwa razy przez pomyłkę.

## `obrazy-artykulow/<slug>/`

Obrazy wyciągnięte z DOCX-ów Piotra przez `scripts/import-artykul.py` — po jednym
katalogu na artykuł. To materiał źródłowy, nie zasób serwisu: leży tu po to, żeby
było widać, co było w oryginale, i żeby dało się wrócić do grafiki, gdy tekst
zostanie później poprawiony. Zdjęcia publikowane idą normalną drogą (R2, `/img/`).

