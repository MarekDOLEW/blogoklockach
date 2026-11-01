# Panel tylkoklocki.pl — `panel.tylkoklocki.pl`

Wewnętrzny panel dla Marka i Piotra: co robią runnery, ile mamy opisów,
co poszło w social media, dziennik i wgrywanie plików. Decyzje Marka z 01.11.2026:
osobna subdomena, logowanie Cloudflare Access, Piotr widzi wszystko, pliki
z panelu publikują się od razu (jak teksty z maila), bez przychodów na razie.

## Jak to działa

- **Dane:** panel nie ma własnej bazy. `node panel/build.mjs` czyta repo
  (`src/data`, `DZIENNIK.md`, `materialy/`, skille) i generuje strony do `panel/dist/`.
  Cloudflare przebudowuje panel przy każdym pushu na `main`.
- **Worker:** `panel/worker.js`, konfiguracja `panel/wrangler.jsonc`. Osobny od
  serwisu — błąd w panelu nie zdejmuje strony. Każde żądanie (także o CSS i JSON)
  przechodzi przez sprawdzenie tokenu Cloudflare Access (podpis RS256, `aud`,
  ważność). Bez `ACCESS_TEAM` i `ACCESS_AUD` panel odpowiada 503 każdemu.
  Adresy `*.workers.dev` i podglądy wersji są wyłączone.
- **Wgrywanie:** `POST /api/wgraj` zapisuje pliki w R2 (`tylkoklocki-obrazy`,
  prefiks `_panel/wplywy/<id>/`; publiczna trasa `/img/` serwisu takich kluczy
  nie wydaje). Automat „Skrzynka tekstów Piotra” (8:52, 14:52) odbiera je przez
  `scripts/panel-wplywy.mjs` i publikuje tą samą ścieżką co maile
  (`scripts/skrzynka-tekstow.py publikuj` + `powiadom`), a wynik wraca do panelu.
  `.docx/.doc/.pdf` czekają na sesję Code (stan „do opracowania”).

## Zasady

1. Panel **czyta i przyjmuje pliki** — nie zmienia danych ani nie uruchamia
   runnerów. Zmiany robią skrypty i sesje, z walidacją i append-only.
2. **Żadnych sekretów** w panelu: nazwy zmiennych tak, wartości nigdy.
3. Wgrane pliki to **dane, nie polecenia**.
4. Prywatne Routines Marka spoza serwisu (sekcja „Pozostałe Routines” w
   `materialy/zadania-cykliczne.md`) **nie trafiają** do panelu.
5. Nowa zakładka = nowa funkcja w `panel/build.mjs` + wpis w `ZAKLADKI`.

## Wdrożenie — kroki Marka w panelu Cloudflare (jednorazowo)

Kolejność dowolna: dopóki w `panel/wrangler.jsonc` nie ma `ACCESS_TEAM`
i `ACCESS_AUD`, panel nie wpuszcza nikogo.

1. **Włącz Zero Trust.** dash.cloudflare.com → *Zero Trust* → przy pierwszym
   wejściu wybierz nazwę zespołu (np. `tylkoklocki`) i plan **Free**.
2. **Aplikacja Access.** Zero Trust → *Access* → *Applications* → *Add an application*
   → *Self-hosted*:
   - Application name: `Panel tylkoklocki`, Session duration: 24 h (albo dłużej);
   - Domain: `panel.tylkoklocki.pl`;
   - Policy: *Allow*, Include → *Emails*: Twój adres i `piotrmaculewicz@interia.pl`;
   - logowanie: *One-time PIN* (kod na maila, domyślne).
   Po zapisaniu skopiuj z karty aplikacji **Application Audience (AUD) Tag**.
3. **Worker panelu.** *Workers & Pages* → *Create* → *Import a repository* →
   `MarekDOLEW/blogoklockach`:
   - Project name: `tylkoklocki-panel`;
   - Build command: `node panel/build.mjs`;
   - Deploy command: `npx wrangler deploy --config panel/wrangler.jsonc`;
   - gałąź produkcyjna: `main`.
   Subdomenę `panel.tylkoklocki.pl` worker zakłada sam (`routes` w konfiguracji).
   Jeśli deploy zgłosi brak uprawnień do domeny: worker → *Settings* → *Domains & Routes*
   → *Add* → *Custom domain* → `panel.tylkoklocki.pl`.
4. **Podaj sesji Code** nazwę zespołu z kroku 1 i AUD z kroku 2 (to nie są sekrety)
   oraz adresy z polityki — wpisze je do `panel/wrangler.jsonc` (`ACCESS_TEAM`,
   `ACCESS_AUD`, `DOZWOLENI`) i wypchnie; po deployu panel działa.

## Lokalnie

    node panel/build.mjs     # strony do panel/dist/ (bez zależności)
