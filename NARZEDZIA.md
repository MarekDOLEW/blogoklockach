# Podział pracy: Claude Code ↔ Cowork

Dotyczy wyłącznie osi **narzędziowej** — które z dwóch narzędzi co robi.

Podział na osi **ludzkiej** (Piotr ↔ Marek) opisuje `redakcja/wspolpraca.md`
i ten plik go nie zmienia. Gdy oba dokumenty mówią o tym samym pliku, ustalenia
z `redakcja/wspolpraca.md` mają pierwszeństwo — tam decydują ludzie, tu tylko
narzędzia.

## Mapa dokumentów

Każdy temat ma jedno miejsce. Jeśli szukasz czegoś indziej, szukasz źle.

| Temat | Plik |
|---|---|
| Kto z ludzi czym włada | `redakcja/wspolpraca.md` |
| Które narzędzie czym włada | ten plik |
| Harmonogram runnerów | `materialy/zadania-cykliczne.md` *(generowany)* |
| Wiedza operacyjna, pułapki, awarie | `RUNBOOK.md` |
| Wymiana informacji między sesjami | `DZIENNIK.md` |
| Standard artykułów, metodologia | `redakcja/` |
| Bieżące zadania i dług | `DZIENNIK.md`, nie ten plik |

**W tym pliku nie ma list zadań.** Reguły są trwałe, zadania są datowane —
mieszanie ich sprawia, że dokument gnije razem z listą. Zadania: `DZIENNIK.md`.

## Model: nie ma wspólnego dysku

Claude Code pracuje w kontenerze sesji (`/home/user/blogoklockach`).
Cowork pracuje na Macu Marka.

**Te dwa środowiska nie widzą swoich plików.** Jedynym kanałem wymiany jest
repozytorium `github.com/MarekDOLEW/blogoklockach`, gałąź `main`.

Konsekwencja, którą trzeba przyjąć dosłownie: praca niezacommitowana
i niewypchnięta **dla drugiej strony nie istnieje**.

## Źródło prawdy

Gałąź `main` na GitHubie. Z niej Cloudflare buduje produkcję.

Wszystko inne to kopie robocze. W szczególności **nie są źródłem prawdy**:

- `~/Desktop/TYLKOKLOCKI/blogoklockach-astro/` — kopia z 11.08, sprzed
  rebrandingu (`site: blogoklockach.pl`, 8 zestawów w `sety.json`).
- `~/Desktop/TYLKOKLOCKI/tylkoklocki-rebranding_1/` — szkielet, 4 pliki.
- `~/Documents/Claude/Projects/blogoklockach/` — stara baza skilli Cowork.
  Repo nie odwołuje się do niej nigdzie (sprawdzone grepem: zero trafień).

Uwaga osobno: **harmonogram runnerów też nie mieszka w repo.** Triggery są
w koncie Claude Code Remote (Routines). Plik `materialy/zadania-cykliczne.md`
jest ich zrzutem, nie konfiguracją — patrz sekcja „Harmonogram".

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
| `materialy/zadania-cykliczne.md` | generator | **nikt nie edytuje ręcznie** |

### Dlaczego `src/data/*.json` jest zamknięte dla Cowork

Te pliki są generowane przez runnery i są duże: `redirects.json` 2,6 MB,
`oferty_feed.json` 1,6 MB. Łowca przepisuje w nich całe gałęzie przy każdym
przebiegu (ostatni: 2 646 zmienionych linii). Ręczna edycja z drugiej strony
to gwarantowany konflikt na pliku, którego nikt nie rozwiąże sensownie.

Gdy Cowork potrzebuje zmiany w danych — **opisuje ją w `DZIENNIK.md`
i zostawia Claude Code.** Nigdy nie edytuje sam.

## Protokół pracy

Obowiązuje obie strony, bez wyjątków.

1. **Na starcie sesji:** `git pull --rebase origin main`, potem przeczytaj
   ostatnie 3 wpisy w `DZIENNIK.md`.
2. **Przed zadaniem:** sprawdź w dzienniku, czy druga strona nie ma go w toku.
   Wpis „w toku" to rezerwacja — nie zaczynaj.
3. **W trakcie:** commituj tylko własne pliki. **Nigdy `git add -A`** —
   wciągnie cudze zmiany i artefakty.
4. **Na koniec:** dopisz wpis do `DZIENNIK.md`, zacommituj, wypchnij na `main`.
5. **Nie zostawiaj pracy niewypchniętej.**

### Format commitów

`<Runner|Cowork|Code>: <co zrobione>` — bez polskich znaków w tytule.
Jeden format, bo historia jest przeszukiwana.

## Zasada jednego wykonawcy

Jedno zadanie ma dokładnie jednego wykonawcę. Gdy da się je wykonać po obu
stronach, rozstrzyga tabela własności — decyduje to, **gdzie leżą pliki
do zmiany**, nie to, kto szybciej zacznie.

W razie wątpliwości: nie rób, zapytaj. Jedno pytanie kosztuje mniej niż
zdublowana praca na plikach po 2 MB.

## Runnery cykliczne należą do Claude Code

Scout, Wycofania, Łowca, Radar, Backfill, Kontroler i Social działają jako
trwałe sesje Claude Code Remote i pushują do repo.

**Cowork nie uruchamia tych zadań.** Skille `klocki-scout-nowosci`,
`klocki-lowca-promocji`, `klocki-radar-konkurencji` i `klocki-kontroler`
zainstalowane w Cowork to uśpione duplikaty — zapisują do
`~/Documents/Claude/Projects/blogoklockach/`, czyli w próżnię. Ich wynik nigdy
nie dotrze na produkcję i nie zgłosi błędu. Do odinstalowania z Cowork.

Skille `klocki-redaktor`, `klocki-social`, `klocki-seo` i `klocki-afiliacje`
zostają — to treść i research, czyli właściwa robota Coworka.

## Harmonogram: generowany, nie pisany

Prawda o triczach mieszka w Routines w koncie Marka. Każdy ręcznie pisany opis
harmonogramu zaczyna się rozjeżdżać w dniu powstania — stało się to już dwa
razy (`COWORK-INSTRUKCJA.md` pokazywał Radar 3× dziennie i Łowcę o 09:00;
`materialy/zadania-cykliczne.md` pokazywał Kontrolera jako aktywnego, gdy był
wyłączony od 18.08).

Dlatego `materialy/zadania-cykliczne.md` jest **zrzutem realnej konfiguracji**,
odświeżanym cyklicznie, z nagłówkiem i datą. Nikt go nie edytuje ręcznie.

Zrzut musi zawierać dla każdego zadania: nazwę, cron, **flagę enabled**, datę
ostatniego odpalenia i pliki, do których zapisuje. Flaga `enabled` i data
ostatniego odpalenia są najważniejsze — to one wychwytują runner, który cicho
przestał chodzić.

### Cisza to nie sukces

Runner wyłączony lub taki, który nigdy nie wystartował, **nie zgłasza błędu**.
Kontroler nie chodził od 18.08 i nikt tego nie zauważył przez dwa tygodnie,
bo brak raportu wygląda tak samo jak brak problemu.

Przy każdym przeglądzie zrzutu sprawdzaj nie to, co się wykonało, ale
**czego brakuje**.

## Przegląd dokumentacji

Raz w miesiącu, przy okazji zrzutu harmonogramu: sprawdź, czy dokumenty w mapie
na górze nadal opisują stan faktyczny. Dokumentacja gnije cicho i wychodzi to
dopiero wtedy, gdy ktoś na niej polega.
