# Dziennik pracy

Jedyny kanał komunikacji między Claude Code a Cowork. Oba narzędzia czytają
ostatnie wpisy na starcie sesji i dopisują własny na końcu.

**Append-only.** Nowe wpisy na górze, pod tym nagłówkiem. Nie kasuj, nie
przepisuj cudzych wpisów — historia jest tu po to, żeby druga strona
wiedziała, co się działo.

Format wpisu:

```
## RRRR-MM-DD HH:MM · [CODE|COWORK] · krótki tytuł

**Zrobione:** co faktycznie zmienione, z nazwami plików
**Stan:** gotowe / w toku / zablokowane
**Dla drugiej strony:** co ma zrobić, albo „nic"
**Uwagi:** co poszło nie tak, czego nie ruszać
```

Pole **Dla drugiej strony** jest najważniejsze. Jeśli wpisujesz tam zadanie,
druga strona przejmuje je przy najbliższej sesji. Jeśli wpisujesz „nic" —
temat jest zamknięty i nikt go nie dubluje.

Zadanie „w toku" oznacza rezerwację: druga strona go **nie zaczyna**.

---
## 2026-08-23 20:30 · COWORK · Porządkowanie dokumentacji + backlog

**Zrobione:**
- `WSPOLPRACA.md` → `NARZEDZIA.md`. Zmiana nazwy, bo `redakcja/wspolpraca.md`
  opisuje inną oś podziału (Piotr ↔ Marek, ludzie) i identyczne nazwy myliły.
  Zawężona klauzula nadrzędności — nie unieważnia ustaleń z `redakcja/`.
  Usunięta lista długu (rotuje szybciej niż reguły, więc idzie tutaj).
- `COWORK-INSTRUKCJA.md` → `RUNBOOK.md`. Wycięta tabela harmonogramu
  (dubluje `materialy/zadania-cykliczne.md`), zachowana i poprawiona wiedza
  operacyjna: opóźnienie feedu ME, blokada 403, półki cenowe, rollback,
  `raw.githubusercontent`. Dopisane dwa nowe ustalenia z 23.08.
- Ustalona zasada: harmonogram jest **generowany**, nie pisany ręcznie.

**Stan:** gotowe do wgrania.

**Dla drugiej strony (CODE) — do zrobienia, priorytet malejąco:**

1. **Włącz Kontrolera w Routines** (`trig_01T8AhciW8JD651MrSMuEj7m`). Wyłączony
   od 18.08, dwa poniedziałki bez raportu finansowego. Sprawdź też `Social`
   (`trig_01W1CSp8PM3DDN6UEyNLYe6H`) — nie odpalił się nigdy.
2. **Zmierz repo:** `git count-objects -vH` + rozmiar 10 największych blobów
   w historii. Bez tej liczby nie ma sensu decydować o cięciu.
3. **Deterministyczna serializacja JSON** we wszystkich runnerach: sortowanie
   kluczy, stałe wcięcie, stabilne liczby. Najtańsza naprawa o największym
   efekcie — patrz `RUNBOOK.md`.
4. **Zrzut harmonogramu:** zadanie cykliczne nadpisujące
   `materialy/zadania-cykliczne.md` realną konfiguracją triggerów. Musi
   zawierać flagę `enabled` i datę ostatniego odpalenia.
5. Usuń sekcję „Podział ról" z `CLAUDE.md`, zostaw dwa odnośniki:
   `redakcja/wspolpraca.md` (ludzie) i `NARZEDZIA.md` (narzędzia).
   Dopisz w obu plikach odnośnik do drugiego.
6. Ujednolić format commitów runnerów: `<Runner>: <opis>`, bez polskich znaków.
7. Drobne porządki:
   - `.wrangler/` do `.gitignore`
   - skasować `src/data/wycofania.astro` i `sprawdz3.mjs` (martwe)
   - poprawić `_meta` w `known_sets.json` i `redirects.json` — opisują
     nieprawdziwe źródło danych
   - udokumentować opisowo konfigurację deployu (brak `.github/workflows`,
     całość żyje w panelu Cloudflare — nie da się odtworzyć środowiska z repo)
   - uzupełnić `README.md`

**Dla Marka (poza repo):**
- Odinstaluj z Cowork skille `klocki-scout-nowosci`, `klocki-lowca-promocji`,
  `klocki-radar-konkurencji`, `klocki-kontroler` — uśpione duplikaty runnerów,
  zapisują do martwej ścieżki. Zostaw `klocki-redaktor`, `klocki-social`,
  `klocki-seo`, `klocki-afiliacje`.
- Zarchiwizuj `~/Desktop/TYLKOKLOCKI/blogoklockach-astro/`,
  `tylkoklocki-rebranding_1/` i `~/Documents/Claude/Projects/blogoklockach/`.

**Uwagi:**
Repo zmierzone: po `git gc` katalog `.git` waży 7,3 MB (przed: 26 MB).
Wcześniejszy alarm o puchnięciu historii był chybiony — delty kompresują się
dobrze mimo 17,4 MB surowych wersji `redirects.json`. Temat rozbijania pliku
i wynoszenia danych do R2 odłożony, przegląd najwcześniej za pół roku.
Deterministyczna serializacja JSON zostaje w planie, ale jako sprawa
czytelności diffów, nie rozmiaru repo.

Zrzut harmonogramu ma obejmować także zadania spoza LEGO (Herzfaden, XTB,
angielski) — dziś nie opisuje ich żaden dokument.

## 2026-08-23 19:00 · COWORK · Uruchomienie Search Console + ustalenie zasad współpracy

**Zrobione:**
- Dodana usługa `https://tylkoklocki.pl/` w Google Search Console (typ: prefiks
  URL), zweryfikowana automatycznie metodą „dostawca nazwy domeny" (token DNS
  w Cloudflare). Konto: marek.dolewski@gmail.com.
- Zweryfikowany stan GA4: tag `G-5M8LH9SKQC`, usługa „tylkoklocki", działa
  poprawnie — 24 użytkowników w 7 dni, 347 zdarzeń. Nic nie wymagało zmiany.
- Sprawdzona hipoteza o pozostałościach po starym sklepie w indeksie.
  **Nie potwierdziła się:** `site:tylkoklocki.pl` z `filter=0` zwraca jeden
  wynik (stronę główną z nową treścią), `site:tylkoklocki.pl drewniane` zero.
  W indeksie nie ma URL-i starego sklepu. Ślad po starym sklepie istnieje
  wyłącznie POZA domeną (Ceneo, Opineo, Gwiazdor, YouTube, PDF gminy Wołomin)
  i przez GSC się go nie usunie.
- Dodane `WSPOLPRACA.md` i ten plik.

**Stan:** gotowe. Zaplanowane zadanie Cowork `gsc-tylkoklocki-indeks` na
2026-08-24 09:00 — odczyta raport indeksowania, gdy GSC przeliczy dane.

**Dla drugiej strony (CODE):**
1. Przenieść `WSPOLPRACA.md` i `DZIENNIK.md` do korzenia repo i zacommitować.
2. Skasować `COWORK-INSTRUKCJA.md` — jest sprzeczny z
   `materialy/zadania-cykliczne.md` i myli oba narzędzia.
3. Rozstrzygnąć problem niedoindeksowania (patrz Uwagi) — to zadanie po
   stronie kodu, nie treści.

**Uwagi:**
Realny problem SEO jest odwrotny do początkowej hipotezy: sitemapa zgłasza
4 748 adresów, Google ją czyta („Sukces", ostatni odczyt 22.08), a
zindeksowana jest jedna strona. Z tego ~4 691 to `/zestaw/[nr]/` generowane
szablonowo z `huby.js` — kilka tysięcy niemal identycznych podstron z domeny
bez historii w tej tematyce. To profil, który Google typowo klasyfikuje jako
cienką treść i pomija.

Raport „Strony" w GSC był 23.08 jeszcze pusty (usługa założona tego dnia).
Jutro pokaże, czy huby siedzą w „Wykryto – obecnie niezindeksowana" (Google
je zna i świadomie odpuszcza) czy „Zeskanowana – obecnie niezindeksowana"
(odwiedził i uznał za zbyt ubogie). To dwie różne diagnozy i dwie różne
strategie naprawy — nie planować działań przed odczytem.
