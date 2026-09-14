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

Wszystkie trzy **do archiwum** — przenieść do `_archiwum/`, nie kasować od razu.

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
| artykuły `.md` | wg kategorii — patrz niżej | pisze wybrane |
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
   Z sesji Claude Code: `git push origin <twoja-gałąź>:main` — lokalny `main`
   bywa rozjechany, dlatego pushujemy jawnie gałąź na `main`.
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
nie dotrze na produkcję i nie zgłosi błędu. **Do odinstalowania z Cowork albo
przepisania na tryb wyłącznie czytający.**

Skille `klocki-redaktor`, `klocki-social`, `klocki-seo` i `klocki-afiliacje`
zostają — to treść i research, czyli właściwa robota Coworka.

## Artykuły: właściciel wynika z kategorii

O tym, kto pisze artykuł, decyduje pole **`kategoria`** we frontmatterze —
**nie katalog, w którym plik leży**. Katalog bywa przypadkowy (prezentowniki
leżą dziś w dwóch miejscach), kategoria jest deklaracją intencji.

| Kategoria | Co to jest | Kto pisze |
|---|---|---|
| `Recenzja` | omówienie zestawu, wrażenia z budowania, ocena | **Piotr** |
| `Premiera` | debiut lub nowa seria, dane ze Scouta | Marek / Cowork |
| `Prezentownik` | zestawienia „LEGO dla…", okazjonalne | Marek / Cowork |
| `Deal` | pojedyncza okazja cenowa, dane z Łowcy | Marek / Cowork |
| `Kalendarz` | kalendarz promocji, cykle sezonowe | Marek / Cowork |
| `Zapowiedzi` | zestawy jeszcze niewydane | **graniczna** — patrz niżej |

Linia podziału: **Piotr pisze o zestawach, Marek o cenach i okazjach.**
Wszystko, co powstaje z danych Łowcy i Scouta, może być generowane
półautomatycznie i należy do Coworka. To, co wymaga obcowania z zestawem,
należy do Piotra.

### Lista kategorii jest zamknięta

Sześć wartości powyżej to komplet. `kategoria` nie jest dziś przez nic
walidowana — to zwykły string, wypisywany dosłownie na plakietce artykułu,
na `/artykuly/` i w zajawkach na stronie głównej. Nic nie stoi na
przeszkodzie, żeby powstały obok siebie `Deal`, `deal` i `Okazja`.

Dlatego: **nowa kategoria to decyzja, nie odruch.** Zanim jej użyjesz,
dopisz ją do tej tabeli i odnotuj w `DZIENNIK.md` wraz z właścicielem.

Pisownia dokładnie jak w tabeli — wielka litera, bez skrótów, bez liczby
mnogiej.

### Artykuły graniczne

Gdy artykuł łączy warstwy (np. prezentownik z rozbudowaną częścią
recenzencką), obowiązuje zasada z `redakcja/wspolpraca.md`: **redakcja
Piotra, warstwa cenowo-linkowa Marka.**

`Zapowiedzi` jest kategorią graniczną **z definicji** — to research
o niewydanych zestawach (Piotr) połączony z doradztwem zakupowym i linkami
(Marek). Każdy tekst z tej kategorii wymaga uzgodnienia, kto prowadzi;
ustalenie zapisujemy w `DZIENNIK.md` przed rozpoczęciem pisania, żeby nie
powstały dwie wersje tego samego.

### Kiedy wchodzi Cowork

Nie „od tematów", tylko **od granic technicznych**: Cowork robi to, czego Code
fizycznie nie może, i nic poza tym. Każde zadanie przypisane mu z przyzwyczajenia
kosztuje przepisywanie wyników i rozjazd wersji.

Trzy rzeczy, których Code nie zrobi:

1. **Strony blokujące ruch z centrum danych.** Empik i lego.com oddają `403`
   z Cloudflare — to blokada serwisu, nie naszej sieci, więc dotyczy każdego
   narzędzia działającego z chmury. Dziś: tygodniowy zrzut cen Empiku.
2. **Panele bez API.** Allegro Affiliate i webePartners nie mają API w rejestrze
   — prowizje da się odczytać wyłącznie po zalogowaniu.
3. **Pliki z dysku Marka.** Dokumenty `.docx` od Piotra, eksporty, zrzuty.

Wszystko inne należy do Code i tam jest tańsze: research (WebSearch, WebFetch,
Firecrawl), teksty prosto do repo, raporty przez API (Cloudflare Analytics
Engine, Search Console, Adtraction).

### Zmierzone limity Code *(14.09.2026 — nie zgadywać, to jest sprawdzone)*

| Próba z kontenera sesji | Wynik |
|---|---|
| `empik.com`, `lego.com`, `allegro.pl`, `mediaexpert.pl` (curl) | **403** — Cloudflare, blokada ruchu z data center |
| `planetaklockow.pl` (curl) | 200 |
| Chromium/Playwright, dowolny adres | **ERR_CONNECTION_RESET** — relay nie obsługuje ruchu przeglądarki, także z jawnym proxy |
| `api.firecrawl.dev` | działa — droga do stron blokujących nas wprost |
| usunięcie gałęzi / zapis do GitHub API | **403** od proxy — robi człowiek |
| wgranie skilla na konto | niemożliwe — synchronizacja tylko serwer → kontener |

Dwa różne mury, których nie wolno mylić: **Cloudflare** blokuje serwis
(naprawy po naszej stronie nie pomogą, potrzebny Firecrawl w trybie stealth albo
lokalna przeglądarka), a **brak przeglądarki** to ograniczenie środowiska.
Naprawa drugiego nie daje dostępu do pierwszego.

### Prowizje: co mierzymy, a co zakładamy

`node scripts/prowizje-raport.mjs --dni 30` — jedyne źródło prawdziwego EPC.
Stan dostępów na 14.09.2026:

| Sieć | Sklepy | Stan |
|---|---|---|
| Adtraction | Smyk, Egmont | **działa** (`ADTRACTION_TOKEN`); 0 transakcji w 60 dniach — to wynik, nie awaria |
| Tradedoubler | Empik, Ceneo | `TD_TOKEN` jest **produktowy**; raporty wymagają osobnego tokenu → `TD_REPORT_TOKEN` |
| Performers | Media Expert | brak `PERFORMERS_API_KEY`; API istnieje (HasOffers/TUNE, `NetworkId=wld`) |
| Allegro, webePartners | — | brak API — tylko panel |

Dopóki dwie środkowe pozycje są puste, każdy EPC w raportach jest **modelem**,
nie pomiarem. To najtańsza dostępna poprawa jakości raportowania: dwa klucze.

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
