# Dziennik pracy

Jedyny kanał komunikacji między Claude Code a Cowork. Oba narzędzia czytają
ostatnie wpisy na starcie sesji i dopisują własny na końcu.

**Append-only.** Nie kasuj i nie przepisuj cudzych wpisów — historia jest tu po
to, żeby druga strona wiedziała, co się działo.

**Gdzie pisać:** nowy wpis wstawiaj **bezpośrednio pod linią znacznika**
`<!-- WPISY PONIŻEJ … -->`, na początku listy wpisów. Wszystko NAD znacznikiem

## 8.10.2026 — Warianty zdjęć bez Cloudflare Image Transformations (Claude Code)

**Zrobione:**
- Limit 5 000 darmowych transformacji skończył się po jednym dniu (11,5 tys.
  zdjęć × szerokości × formaty). Marek: nie płacimy. Worker miał zabezpieczenie,
  więc strona oddawała oryginały — bez awarii, ale z wynikiem PageSpeed sprzed audytu.
- Nowe: `scripts/warianty-obrazow.mjs` generuje WebP w 6 szerokościach do R2
  (`w/<klucz>/<szerokość>.webp`), `scripts/r2-s3.mjs` to klient S3 do R2
  (bez limitu REST API). `r2-obrazy.mjs` po wgraniu nowego oryginału od razu
  robi jego warianty, więc Routine „Zdjęcia → R2" nie wymaga zmiany promptu.
- Worker oddaje `?w=` z R2 (Accept z WebP) z cache brzegu; brak wariantu →
  oryginał. Image Transformations nie są już wołane.
- Pełny przebieg generowania 8.10 (ok. 40 min, 69 tys. obiektów, ~1,5 GB w R2).

- Po pomiarze: preload czcionek zdjęty (`b23243b`) — Chrome wstrzymywał pierwszy
  render do czasu pobrania woff2; czcionki zastępcze z metrykami trzymają układ.
- Wynik mobile po wszystkim (Lighthouse 12): główna 91, hub 89, listing 86,
  deal 95, artykuł 96, seria 90; desktop 100. Tabela w raporcie, sekcja 7.

**Stan:** wdrożone na `main` (worker `132d210` za zgodą Marka, czcionki `b23243b`),
69 474 warianty w R2 (2,1 GB).

**Dla drugiej strony:** po ręcznym wgraniu lub podmianie zdjęcia w R2 uruchomić
`node scripts/warianty-obrazow.mjs --klucze <klucz>`; lista szerokości żyje
w trzech miejscach (worker, media.js, skrypt) — RUNBOOK „Obrazy skalowane".
(ta instrukcja, ustalenia trwałe, indeks archiwum) zostaje w pliku na stałe
i archiwizacja tego nie rusza. Wpis wstawiony nad znacznikiem nie zostanie
zarchiwizowany nigdy — skrypt zgłosi to ostrzeżeniem.

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

## Ustalenia trwałe

Rzeczy, które obowiązują niezależnie od daty. Nie archiwizują się. Wpisuj tu
tylko to, co ma przetrwać miesiąc — jednorazowe ustalenia zostają we wpisach.

- **Decyzja o runnerze = zmiana jego promptu tego samego dnia** (Marek, 16.09.2026).
  Do runnera prowadzi tylko jeden kanał: prompt Routine (panel albo delete+create
  z sesji). `DZIENNIK.md` czytają sesje robocze, nie runnery — wpis w dzienniku
  sam w sobie niczego w runnerze nie zmienia (15.09 Scout dopisał 16 wycofań wbrew
  ustaleniu, które istniało wyłącznie tutaj). Ustalenie bez zmiany promptu nie jest
  wdrożone i nie wolno pisać, że jest.
  **Uzupełnienie 19.10.2026, sprawdzone wywołaniem:** prompt runnera zmienia się
  wyłącznie z JEGO WŁASNEJ rozmowy albo z panelu. `update_trigger` z sesji Code
  odmawia: „a routine's instructions (its prompt) can be changed only from the
  conversation or thread the routine posts into". Sesja Code może więc przygotować
  skrypt i tekst akapitu, ale nie może wdrożyć kroku — i musi to napisać wprost.
  Delete+create nie jest obejściem: nowy Routine może stracić prawo pisania do tej
  samej stałej sesji.
- **Zamykanie zadań bez właściciela** (Marek, 16.09.2026). Kontroler co poniedziałek
  zbiera z dziennika pozycje „RADAR · Do zrobienia" i sygnały Scouta bez odpowiedzi.
  Zamknięcie: Marek mówi w rozmowie z Code jedno zdanie („zamknij 75192 — Piotr
  odmówił / zrobione / odkładamy do X"), Code dopisuje pod pozycją linię
  `→ zamknięte <data>: <powód>`; runner Wycofań dopisuje `→ Wycofania <data>: …`.
  Pozycje z taką linią Kontroler pomija. Pozycje „Kto: Piotr" i cała sekcja
  „Zadania bez właściciela" idą **mailem do Piotra i Marka** (klucz `kontroler`
  w `raporty_mail.json`), nie tylko PDF-em na czacie.
- **Pushuje tylko trwała sesja z repo w źródłach** (ustalone 21–22.09.2026 na
  dwóch awariach: Kontroler 21.09, Dane wt 22.09). Routine odpalany w świeżej
  sesji — założony z API czy z panelu — nie ma repo w źródłach (klon tylko do
  odczytu, push odrzuca proxy) ani konektora `Claude_Code_Remote`; może czytać,
  mailować i wgrywać do R2. Runner z danymi = `create_session(source_url)` +
  `create_trigger(persistent_session_id)`. Ręczny `fire_trigger` takiego
  Routine NIE trafia do trwałej sesji (zakłada pustą jednorazową); próbny przebieg
  robi się jednorazowym Routine z `run_once_at` przypiętym do sesji.
- **Routine założony z panelu zmienia i kasuje tylko Marek** (22.09.2026). API
  odmawia agentom (`created_via: http_api`), a klasyfikator uprawnień blokuje też
  kasowanie części Routine agentowych — prośba do Marka z ID i adresem
  `claude.ai/code/routines/<id>`.
- **Harmonogram z konta przepisuje sesja Code (pon 07:45), Kontroler tylko
  czyta** (22.09.2026). Konektor `Claude_Code_Remote` ma wyłącznie sesja Code.
- **Żaden audyt nie chodzi przez `/idz/` ani przez link trackingowy** (Marek,
  21.09.2026; 16.09 audyt C wysłał 17 kliknięć do trackerów). Cel linku sprawdza
  się przez `celLinku` z `scripts/linki-cel.mjs`, worker testuje się bez
  podążania za przekierowaniem (`curl` bez `-L`).
- **„SUCCEEDED" w `last_run` nie jest dowodem** (21–22.09.2026). Dowodem
  przebiegu runnera jest commit na `main` albo plik w repo; brak `last_run`
  po delete+create też nic nie znaczy.
- **Sesja runnera ma limit 1 M tokenów kontekstu** (22.09.2026: Łowca 753 k po
  37 dniach, ok. 20 k dziennie). Gdy `context_usage` z `get_session` przekroczy
  ~850 k, zakładamy nową sesję tym samym sposobem (`create_session` + nowy
  trigger, stary skasować) — reguły runnera muszą być w prompcie i skryptach,
  nigdy w pamięci sesji.
- **Gratis bez oficjalnej polskiej ceny katalogowej ma w hubie kreskę** (Marek,
  15.10.2026, potwierdzone 18.10.2026). Dotyczy zestawów GWP z `bez_rrp` — dziś 40898
  i sześć innych (40896, 40897, 40899, 40900, 40902, 40916). Wycena podana przez LEGO
  w euro idzie do treści dla czytelnika, nie do `cena_katalogowa`. Cena z porównywarki
  **nie jest źródłem** ceny katalogowej: 18.10 zklockow podał dla 40898 124,99 zł
  (29,99 EUR ≈ 128 zł, więc liczba jest spójna) i to nie wystarczyło — pytanie wróci
  przy każdym kolejnym gratisie i odpowiedź jest ta sama.
- **Oferta poniżej 50% potwierdzonej ceny katalogowej wymaga sprawdzenia przez
  człowieka** (Marek, 16.09.2026). Sito `filtrujOferty()` ukrywa ją na stronie;
  rano przychodzi mail z linkami (`podejrzany-rynek-mail.mjs`, klucz `podejrzane`,
  kontakt@); Marek potwierdza w rozmowie z Code („potwierdzam <nr> <cena> <sklep>"),
  Code dopisuje do `deale_potwierdzone.json` i oferta wraca tego samego dnia.
- **Rozbieżności ekskluzywów: Dane wt. sprawdza tylko nowe numery, nie całą listę
  od nowa** (Marek, 27.10.2026, po ręcznej weryfikacji 36 pozycji tego dnia).
  `src/data/ekskluzyw_potwierdzone.json` (append-only) trzyma numery już sprawdzone
  kartą produktu (Firecrawl) i potwierdzone jako wciąż ekskluzywne — duże zestawy
  UCS/Icons (np. Sokół Millennium 75192) bywają tam na trwałe, bo listing regularnie
  gubi im etykietę pod inną („Ostatnie zestawy"). Kolejny przebieg filtruje raport
  `lego-ceny.mjs` przez ten plik: numery już w pliku pomija, dla NOWYCH sprawdza kartę
  i albo dopisuje je do pliku (nadal ekskluzywny), albo zdejmuje flagę `ekskluzyw`
  w `sety.json` (jak 29.09 dla 76354/80121/80120 i 27.10 dla 77264/10367/72156).
  Do „Kto co robi” trafiają tylko numery, których nie dało się sprawdzić (błąd
  Firecrawla, brak adresu w `redirects.lego`).
- **„Obserwuj zestaw" jest kanałem wyłącznie cenowym** (Marek, 22.10.2026, po sygnale
  Radaru o discordowym kanale statusów fanklockow). Mail wychodzi tylko wtedy, gdy cena
  spadnie co najmniej 20% pod katalogową albo pobije nasz rekord — i dokładnie to obiecuje
  formularz na hubie. **Alertów o dostępności nie dodajemy**: powrót do sprzedaży,
  „ostatnie sztuki" i wyprzedanie w LEGO.com nie wywołują maila, choć dane do tego mamy
  (`lego_pl_etykieta`, `wyprzedaneWLego`, plakietka na hubach). Powód nie jest techniczny —
  to kilka linii w `alerty-cen.mjs` — tylko taki, że rozszerzenie zmienia obietnicę złożoną
  ludziom, którzy się zapisali, i liczbę maili, które od nas dostają. Dla runnerów znaczy to
  jedno: cudzy kanał powiadomień **notujemy, nie zgłaszamy jako luki** (wpis w
  `konkurencja_baza.json` ma ocenę NOTUJEMY, nie LUKA).

## Archiwum

Wpisy starsze niż 14 dni żyją w plikach miesięcznych. Nic nie zostało
skasowane — jeśli szukasz czegoś starszego, jest tam:

- [`2026-10`](materialy/dziennik-archiwum-2026-10.md) — 54 wpisy
- [`2026-09`](materialy/dziennik-archiwum-2026-09.md) — 105 wpisów
- [`2026-08`](materialy/dziennik-archiwum-2026-08.md) — 36 wpisów

Archiwizuje `node scripts/archiwum-dziennika.mjs`.

<!-- WPISY PONIŻEJ — wszystko nad tą linią zostaje w dzienniku na zawsze -->

## 2.11.2026 (5) — x-kom Black Weeks tydzień 3: aktualność + ceny z kodem black-weeks3 (Claude Code)

- `/artykuly/x-kom-black-weeks-2026-lego-tydzien-3/` (Aktualności,
  **wazne_do 2026-11-08** — x-kom pierwszy raz podał koniec kodu). Mail
  SalesMasters 02.11: 13 zestawów; **wszystkie 13 kart sprawdzone Firecrawlem
  przed południem — każda pokazuje cenę z kodem black-weeks3, wszystko
  dostępne** (pierwsza lista bez braków). 9 nowych minimów notowań
  (m.in. 76454 Hogwart 699, 42175 Volvo 599, 10967 i 43303 po 19,99 —
  −50/−52% od RRP); 42649 i 75443 dobre, ale nie rekord; 72152 Pokémon
  i 77051 Animal Crossing debiutują w notowaniach.
- Dane: kod w `kody_rabatowe.json` (koniec_znany: true), 13 cen xkom
  w `oferty_feed` (kompakt!) i 12 w `sety.json`, 9 minimów w `ceny_baza`.
  Teksty tygodni 1–2 linkują do trójki. Przy okazji `kontrola-rrp --napraw`
  domknęła 3 zastane rozbieżności katalogu (60473, 42621, 42670).
- Fakty opisowe w tekście zweryfikowane z naszymi danymi (76454 bez
  „Wielkiej Sali" — 12 minifigurek i 67 cm; 42175 cztery moduły; 72152
  bez „podświetlenia"; 77051 wodnosamolot z Wilburem).

**Dla drugiej strony:** zrzut x-kom w poniedziałek nadpisze te ceny —
kod i tak wygasa 8.11. Social (rolka/post z kodem) nie zrobiony — do
decyzji Marka.

## 2.11.2026 (4) — Kanał GitHub AKTYWNY (Claude Code)

- Cowork dodał **GH_TEKSTY_TOKEN** (fine-grained PAT). Zweryfikowane z sesji:
  `github-teksty.py lista` klonuje repo i zwraca `{"pliki": []}` (porządki
  Piotra potwierdzone), API pokazuje prawo push. Od najbliższego przebiegu
  (14:52) automat realnie czyta do-publikacji/.
- Mail „kanał aktywny + partie 03/04/29 już na stronie, wysyłajcie tylko
  nowe paczki od 30" czeka jako **draft w tylkoklockiblog@** (wysyłkę
  zablokował klasyfikator — Marek klika Wyślij).

## 2.11.2026 (3) — Partie 03, 04, 29 + recenzja 75421 na stronie; repo tekstów posprzątane (Claude Code)

**Zrobione (pliki od Marka w sesji, publikacja ścieżką skrzynki):**
- **75 kart P07**: partie 03 i 04 (DOCX, te „zagubione" z września — commit
  1b23184) oraz 29 (.md, commit 4055587). Zero kolizji i zero blokad RRP;
  rejestr kart 1724 → 1824. Huby przechodzą z noindex na index same
  (hubIndeksowalny: karta = pełna treść). Powiadomienia z linkami wysłane
  (osobno 29, osobno 03+04).
- **Recenzja 75421 SMART Play TIE** opublikowana; limiter slugów uciął tytuł
  w pół frazy („…-najtansze-wejscie-do") — adres poprawiony na
  lego-75421-mysliwiec-tie-dartha-vadera-recenzja zgodnie z konwencją
  recenzji, rejestr skrzynki zaktualizowany (commit 023ba52); stary adres
  żył kilka minut, bez przekierowania.
- `import-karty.py`: pusta seria w metryce → seria z naszego katalogu
  (8 starych setów promocyjnych w partii 29).
- **Piotr potwierdził porządki** w tylkoklocki-teksty (commit 1ffc6ed:
  do-publikacji/ i do-poprawki/ puste, .gitkeep zostały; skasował też
  gałęzie codex/p07-noindex-partia-25/26/27). **Sprostowanie Piotra:
  partii 26 nie wysyła** — jej zestawy mają opisy na stronie i zostają
  (zgodnie z ustaleniem z 1.11). Tym samym z listy „do wysłania" zostało
  im tylko: nowe paczki od 30.
- Następny krok włączenia kanału GitHub: token GH_TEKSTY_TOKEN (Marek,
  komenda dla Coworka gotowa — bramka czystości do-publikacji/ już spełniona).

**Dla drugiej strony (Cowork):** można wykonywać zadanie tokena — repo
tekstów jest już wyczyszczone.

## 2.11.2026 (2) — Ustalenia z Piotrem: proces publikacji przez GitHub (Claude Code)
## 2026-11-02 10:05 · KONTROLER · Do zrobienia

Raport: `materialy/kontroler-2026-11-02.md`. Mail „Zadania bez właściciela — 02.11.2026" (20 pozycji) wysłany, id `01a19b73`.

**43 kliknięcia spoza Polski przeszły w tygodniu 27.10–02.11 filtr jako „human" (tydzień temu 17) — 40 z refererem `https://tylkoklocki.pl/` **z ukośnikiem**, w seriach po kilka w pół minuty z różnych krajów (26.10 16:38:26–50: AR, PK, BR, MX, BR, CO); ME 21, Allegro 18, x-kom 1. Reguła proponowana 26.10 („referer bez ukośnika") złapałaby 0 z 40.**
**Mamy?** — nie: 3 prawdziwe kliknięcia spoza PL (NO ×2 z ChatGPT, DK) przyszły z hubów; 10 polskich ze strony głównej to 6 z serii 26.10 11:32 (Marek przy cenie 43303, commit `d2fb8a3` 11:36) i 4 pojedyncze do ME.
**Zrobić:** — zgoda na regułę w `src/worker.js`: referer strony głównej (z ukośnikiem lub bez) + kraj spoza PL = bot. Wdraża Code; worker = pytamy przed pushem. Zastępuje pozycję z 26.10.
**Kto:** — Marek (decyzja)
→ zamknięte 02.11.2026 (Kontroler, zgoda Marka 02.11 „zgoda na decyzję 1, zrób regułę w workerze"): reguła `sondaZeStronyGlownej` w `src/worker.js` — referer ze ścieżką `/` przy `cf.country !== 'PL'` idzie jako `bot` (przekierowanie na hub, nie do sieci). Sprawdzone lokalnie na 11 przypadkach (strona główna z/bez ukośnika i www z BR/AR → hub; z PL → sklep; hub/artykuł spoza PL → sklep; Sec-Fetch-Site bez referera → bez zmian). Kontrola skutku: Kontroler 09.11 — liczba kliknięć „human" spoza PL ze strony głównej powinna spaść do zera.

**Zrzuty Empiku i x-komu nie weszły do 09:46 PL — import nadal z 26.10 (tydzień temu weszły o 09:10).**
**Mamy?** — częściowo: ceny z 26.10 (4 552 Empik, 720 x-kom) stoją w hubach jako aktualne.
**Zrobić:** — odpalić skill `klocki-zrzuty-tygodniowe` na Macu; import robi sesja Code.
**Kto:** — Marek (komputer)

**11381 Jaguar E-Type ma dwie daty premiery: `karty_setow.json` (metryka „Premiera" i zdanie w treści) „1 lipca 2026", recenzja `/artykuly/lego-11381-jaguar-e-type-recenzja/` i `sety.json` (`premiera: 2026-08`) „1 sierpnia 2026" — jedyna sprzeczność z nowego sprawdzenia dat premier (`swiezosc-tekstow.mjs`, 522 zestawy).**
**Mamy?** — tak: oba miejsca w repo, karta idzie na hub.
**Zrobić:** — potwierdzić datę na karcie lego.com i poprawić to miejsce, które się myli (najpewniej kartę — rejestr i recenzja zgadzają się na sierpień).
**Kto:** — Code (dane)

Poza listą dla ludzi: Scout nie zostawił commita 27.10 (jedyna luka runnera w tygodniu; 28.10–02.11 codziennie) — sprawdzę za tydzień, czy to jednorazowe. `/zestaw/10280/` nadal z crawlem 11.09 (52 dni), `/serie/marvel/` odwiedzony 01.11 sam. Nowy kanał GitHub skrzynki (`tylkoklocki-teksty`) i panel — kontrola za tydzień, czy zostawiają wpisy w dzienniku.


## 2026-11-02 08:55 · CODE · Skrzynka (panel): 0034 opublikowany

**0034 „Ulice miasta LEGO. Jak płyty drogowe zmieniały się od 1978 roku do dziś” (Historyczne, 13 zdjęć) — https://tylkoklocki.pl/artykuly/ulice-miasta-lego-jak-plyty-drogowe-zmienialy-sie-od-1978-roku-do-dzis/ (`94335d1`).** Pierwszy tekst wgrany przez panel (Piotr, 01.11 15:25) — po tym, jak mail z 10,6 MB nie przeszedł przez konektor Gmail. Wynik zapisany w panelu (Wgraj → opublikowane), powiadomienie poszło.
**Dla drugiej strony:** kanał GitHub (`github-teksty.py`) pominięty — brak `GH_TEKSTY_TOKEN` w środowisku tej sesji.

## 2026-11-02 09:20 · ŁOWCA · Do zrobienia

**Poniedziałkowa kontrola linków: karta Lidla dla 10427 (interaktywny pociąg DUPLO) zwraca 404 — jedyny martwy link na 150 sprawdzonych (raport: materialy/kontrola-linkow-2026-11-02.md)**
**Mamy?** — tak: wpis w `redirects.lidl`, worker przy wejściu odeśle czytelnika na nieistniejącą kartę
**Zrobić:** — zdecydować o usunięciu wpisu `10427` z gałęzi `lidl` w `src/data/redirects.json` (mapy poza Empikiem/x-komem są append-only, kasowanie wymaga decyzji)
**Kto:** — Marek (decyzja)

## 2.11.2026 — Kanał GitHub dla tekstów Piotra + odpowiedzi na jego maile (Claude Code)

**Zrobione (decyzje Marka z tej sesji):**
- **Trzeci kanał skrzynki tekstów: repo `MarekDOLEW/tylkoklocki-teksty`** —
  `scripts/github-teksty.py` (lista/pobierz/wynik, wzór panel-wplywy). Claude
  Piotra commituje do `do-publikacji/` w głównej gałęzi; publikacja tą samą
  ścieżką co mail, wynik mailem jak dziś. Po publikacji źródła przenoszą się
  do `opublikowane/` (link na górze pliku; artykuły z kopią wersji ze strony
  `…__wersja-ze-strony.md` — „wspólna wersja", pyt. e Piotra), błędy do
  `do-poprawki/` z plikiem uwag. **Kanał śpi do czasu, aż Marek doda
  `GH_TEKSTY_TOKEN`** (fine-grained PAT, Contents RW tylko do repo tekstów)
  w ustawieniach środowiska.
- Zadanie „Skrzynka tekstów Piotra" przepięte (delete+create): nowy trigger
  `trig_011U7xwBt1Mp16jRhaMMaiFJ`, ta sama sesja i godziny; prompt z punktami
  3b/5b (GitHub). Instrukcja dla Piotra uzupełniona (sekcja „Kanał GitHub",
  pole „Sposób uzyskania" w metryce — importer znał je od dawna).
- `scripts/lista-brakow-opisow.mjs` — świeża lista zestawów bez karty
  (prośba Piotra: co ~5 paczek). Stan 2.11: 147 z rocznika bieżącego,
  3092 starsze w sprzedaży.
- Ustalenia do odpowiedzi Piotrowi: porządki w repo tekstów robi Piotr
  (do-poprawki/ 576 i do-publikacji/ 75 — wszystkie 75 już na stronie);
  4 blokady cen z partii 26 (76995, 71037–71039) są nieaktualne — dziś nie
  mamy dla nich żadnej ceny, ponowna wysyłka przejdzie; 10 „brakujących"
  numerów z listy Piotra JEST już w katalogu (Monkie Kid/Archiwum/promocyjne),
  7 z nich bez RRP — bramka ich nie zablokuje.

**Dla drugiej strony:** nic — czeka tylko token od Marka.

## 2026-11-02 08:10 · RADAR · Do zrobienia

**faniklockow.pl · 01.11** — Ogłosili, że 11390 Shenron & Goku „debiutuje" i że przy zakupie wpada gratis 40889; próg się zgadza (599,99 zł wobec 540 zł, okno do 8.11), ale karta lego.com sprawdzona dziś mówi „Wkrótce dostępne (4 listopada 2026)" — i przy sprawdzaniu tej daty wyszedł błąd u nas.
**Mamy?** — częściowo: hub `/zestaw/11390/` i `/nowosci/listopad-2026/` są na miejscu, ale **dwa nasze własne pola były sprzeczne**: `opis` w `sety.json` mówił „Premiera 1 listopada 2026", a teaser artykułu na tym samym hubie „trafi do sprzedaży 4 listopada". `opis` idzie do JSON-LD, czyli błędna data szła do danych strukturalnych.
**Zrobić:** — poprawić datę w `sety.json` (11390 `opis` i persona AFOL, 11388 `opis` o wczesny dostęp Insiders) — **zrobione w tym przebiegu**; do rozważenia osobno: rozszerzyć `scripts/swiezosc-tekstow.mjs` o porównywanie dat premier między polem `premiera`, zdaniem w `opis` i zdaniem w personach, bo dziś nic tego nie pilnuje.
**Kto:** — Code (dane, strona)
→ część wykonana 02.11.2026: 11390 `opis` i persona AFOL mówią „Sprzedaż od 4 listopada 2026", 11388 `opis`
rozdziela 4.11 (wszyscy) i 1.11 (Insiders), zgodnie z tekstem premierowym Piotra. Po buildzie na hubie
11390 nie ma ani jednego „1 listopada". 10371 sprawdzony u źródła: „Dostępne teraz", więc jego zapis
o sprzedaży od 1 listopada zostaje. **Otwarte zostaje rozszerzenie `swiezosc-tekstow.mjs`** — dziś ten
skrypt sprawdza tylko plakietki „przeciek", a daty premier trzymamy w trzech miejscach naraz.
→ zrobione 02.11.2026 (polecenie Marka): skrypt ma trzecie ustalenie — **daty premier**. Zbiera
każde zdanie mówiące, kiedy zestaw wchodzi do sprzedaży (`opis` i persony w `sety.json`, karty
w `karty_setow.json`, teksty .md o jednym zestawie) i zgłasza zestawy, dla których dwa miejsca
podają różne daty. Test regresyjny: po wstawieniu z powrotem dzisiejszego błędu w 11390 skrypt
go pokazuje z oboma źródłami; po wycofaniu — nie.
Czego skrypt NIE porównuje i dlaczego, bo to była najtrudniejsza część: **zdań z polem `premiera`**.
Pierwsza wersja to robiła i dała **46 rozjazdów**, prawie wyłącznie karty z datą „1 <miesiąc>" inną
niż miesiąc w rejestrze (10967: pole 2022-03, karta 1 stycznia 2022). Przy tej skali i tym wzorcu to
nie 46 błędów, tylko dwie różne rzeczy nazwane tym samym słowem — warunek wyleciał, tak jak
wcześniej wyleciały wejścia RRP. Jeśli ktoś rozstrzygnie, co znaczy data w karcie, można go wrócić.
Fałszywe alarmy, które trzeba było po kolei zamknąć: okna gratisów (zakresy dat), zdania o wycofaniu,
dzień zapowiedzi („LEGO pokazało zestaw 9 października, premiera 1 stycznia"), przedsprzedaż BLDP
(„Przedsprzedaż ruszyła 4 lutego, zestawy wydano od lipca" — stąd `(?<!przed)` w regule) i wczesny
dostęp dla Insiders, **także gdy zastrzeżenie stoi PO dacie**, jak w polszczyźnie zwykle stoi:
bez tego 11388, 72306 i 76355 wychodziły jako sprzeczność, choć są poprawne.
Zostaje **jedno trafienie i jest prawdziwe: 11381 Jaguar Type E** — karta w `karty_setow.json` mówi
„premierę 1 lipca 2026", a tabela w recenzji i pole `premiera` mówią 1 sierpnia 2026. Nie poprawiam
sam, bo karty pochodzą z dokumentów Piotra — **do rozstrzygnięcia przez Piotra albo Marka**.
→ przy okazji domknięta wątpliwość z 28.10: karta 11390 wymienia w bloku upominków **40898 Wenecka
taksówka wodna** z końcem 08.11.2026 — pierwszy raz LEGO samo nazywa ten gratis. Zapisałem wtedy,
że producent go nie potwierdza i że nazwa pochodzi od StoneWars i zklockow; rozstrzygnięte na korzyść
tekstu Piotra.

## 2026-11-02 05:12 · SCOUT · Do zrobienia

**Dziewięć zestawów z `sety.json` ma hub i wchodzi do `/nowosci/`, ale nie pokazuje się na żadnej stronie serii: 77094, 50090, 910069–910073, 42254 i 11227. Mają `premiera` w formacie samego rocznika i nie ma ich w `katalog.json`, a `src/pages/serie/[seria].astro` wpuszcza zestaw spoza katalogu tylko z premierą `RRRR-MM` (reguła zapisana 29.10).**
**Mamy?** — częściowo: huby stoją i są indeksowalne, brakuje ich tylko w listingach serii (`/serie/technic/`, `/serie/koci-domek-gabi/`, `/serie/bricklink-designer-program/`, `/serie/the-legend-of-zelda/`, `/serie/ekskluzywne-i-promocyjne/`).
**Zrobić:** — zdecydować w `src/pages/serie/[seria].astro`, czy zestaw spoza `katalog.json` z premierą w formacie samego rocznika ma wchodzić na stronę serii (np. na koniec listy, bez sortowania po miesiącu). Sam tego nie załatam przez uzupełnienie miesiąca: sprawdziłem dziś karty `brickset.com/sets/42254-1` i `brickset.com/sets/910069-1` i **żadna nie ma pola Launch/exit** — Brickset podaje je dopiero dla zestawów już wydanych (ma je np. karta 40910-1). Dopóki LEGO nie wystawi kart produktowych, miesiąca nie ma skąd wziąć.
**Kto:** — Code (strona)

## 2026-11-01 14:55 · CODE · Skrzynka (mail): 0035 opublikowany, 0034 za duży dla automatu

**0035 „Listopadowe premiery LEGO” na stronie: https://tylkoklocki.pl/artykuly/listopadowe-premiery-lego-sagrada-familia-upominek-do-weneckiej/ (`3668728`, adres poprawiony w `20a551d` przed wysłaniem linków — slugify robiło z „Família” „fam-lia”; teraz zdejmuje wszystkie znaki diakrytyczne).** 0034 „Historia płyt drogowych LEGO” (md + 13 zdjęć) — mail ma 10,6 MB, konektor Gmail go nie przenosi (zrywa połączenie), IMAP z kontenera zablokowany; mail ma etykietę „do-poprawy”, Piotr i Marek dostali prośbę o wgranie przez panel (Wgraj, do 25 MB na plik) albo ponowną wysyłkę z mniejszymi zdjęciami.
**Dla drugiej strony:** limit ~9 MB na mail dopisany do `redakcja/skrzynka-instrukcja.md` i do promptu automatu skrzynki (sprawdza `sizeEstimate` przed RAW).

## 2026-11-01 · CODE · Panel panel.tylkoklocki.pl — wersja 1 w repo, czeka na Access

**Panel wewnętrzny dla Marka i Piotra jest w `panel/`: zakładki Dziś, Runnery, Opisy, Social, Wgraj, Dziennik (Artykuły, Statystyki, Afiliacje, Ceny — w drugim kroku).** Decyzje Marka: osobna subdomena, logowanie Cloudflare Access, Piotr widzi wszystko, pliki z panelu publikują się od razu, bez przychodów na razie. Osobny worker (`panel/wrangler.jsonc`) — serwisu i `src/worker.js` nie dotyka. Bez `ACCESS_TEAM`/`ACCESS_AUD` panel odpowiada 503 każdemu.
- Wgrane pliki → R2 `_panel/wplywy/` → automat „Skrzynka tekstów Piotra” (prompt rozszerzony 01.11 o `scripts/panel-wplywy.mjs`) → ta sama publikacja co z maila; `.docx/.pdf` czekają na sesję Code.
- Nowy rejestr social: `materialy/social/rejestr.json` (5 publikacji od 15.10); skill `klocki-social` każe dopisywać każdą publikację — **paczkę skilla trzeba wgrać ponownie na claude.ai** (`node scripts/spakuj-skille.mjs`), żeby Cowork też dopisywał.
- Social po terminie: karuzela z 15.10 (przypomnienie poszło 29.10, archiwizacja niepotwierdzona); post i rolka Grogu z kodem black-weeks2 — kod ważny do 01.11, do zdjęcia od 02.11 (przypomnienie stoi na 09.11).
**Dla drugiej strony:** Marek — 4 kroki w panelu Cloudflare z `panel/README.md` (Zero Trust Free, aplikacja Access dla panel.tylkoklocki.pl, worker `tylkoklocki-panel` z repo, potem nazwa zespołu + AUD do sesji Code).

## 2026-11-01 10:20 · DANE WT · Do zrobienia

**Feed Ceneo (Tradedoubler, fid 256472) odpowiada `PF_392 „Requester is not connected to Feed"` — ten sam wzorzec, co Lidl przed akceptem 17–18.09.2026 (RUNBOOK, „Lidl przez Tradedoubler").**
**Mamy?** — częściowo: feed działał jeszcze 27.10.2026 (`feedy.json.ceneo.ostatnie_pobranie`), dziś dwa niezależne wywołania (pełny przebieg i `--sklep ceneo` osobno) zwróciły ten sam błąd 400.
**Zrobić:** — zgłosić w panelu Tradedoublera / do wsparcia TD, że program Ceneo CPS (385881, konto a=3494691) nie jest podłączony do feedu 256472; po potwierdzeniu podpięcia samo się naprawi, kodu nic nie trzeba zmieniać.
**Kto:** — Marek (konto Tradedoubler)

## 2026-11-01 · CODE · Karty P07, paczki 26–28: wgrana tylko 28

**Paczka 28 wgrana: 25 nowych kart (21245–76961), rejestr ma teraz 1749 kart, wszystkie 25 hubów indeksowalnych.** Paczki 26 i 27 (50 zestawów, m.in. 10312, 10314, 71037–71039, 76995) **pominięte**: każdy z tych zestawów miał już pełną kartę (2–4 akapity, 5–6 FAQ, hub w indeksie). Nowe teksty to inne, krótsze wersje (ok. 600–1400 zn. wobec 760–1970 zn. obecnych), więc ich nie nadpisywaliśmy.
**Dla drugiej strony:** lista „noindex”, z której Piotr wybiera zestawy, jest nieaktualna — przed kolejną paczką warto dać mu świeżą listę zestawów bez karty. Gdyby nowe wersje 26–27 miały jednak zastąpić stare, wystarczy `import-karty.py <zip> --nadpisz --krotkie` (decyzja Marka).

## 2026-11-01 05:11 · SCOUT · Do zrobienia

**StoneWars pokazuje zrzut koszyka z 1 listopada, 1:13: do 11388 Wenecka okolica w niemieckim sklepie LEGO wpadają DWA pełne gratisy naraz — jeden to 40898 Wenecka taksówka wodna (okno 1–8.11), drugiego serwis nie nazywa, a u nas w kalendarzu równolegle trwa okno 40889 Buduj, maluj i baw się! od 540 zł (28.10–8.11).**
**Mamy?** — częściowo: hub `/zestaw/40898/`, tekst `/artykuly/lego-11388-wenecka-okolica-premiera/` i okno 40889 w `/kalendarz-promocji-lego/` są, ale nigdzie nie stoi, że przy zakupie 11388 w tym tygodniu można mieć oba gratisy.
**Zrobić:** — wrzucić 11388 do koszyka na lego.com/pl-pl i sprawdzić, czy doliczają się jednocześnie 40898 i 40889 (2149,99 zł jest ponad progiem 540 zł); jeśli tak, wraca do mnie i do tekstu jako konkret na okno do 8 listopada, jeśli nie — trzeba wiedzieć, który gratis wypada.
**Kto:** — Cowork (przeglądarka)
↻ 02.11.2026: nadal aktualne — tekst Piotra `/artykuly/listopadowe-premiery-lego-sagrada-familia-upominek-do-weneckiej/`
(0035, opublikowany 01.11) opisuje już oba okna i kończy je zdaniem, że „LEGO.pl przedstawia obie akcje
osobno i nie informuje wprost o ich łączeniu w jednym zamówieniu". Czyli tekst nie wprowadza nikogo w błąd,
ale pytanie zostaje otwarte i do 8 listopada da się je rozstrzygnąć tylko koszykiem.

## 2026-10-31 08:05 · RADAR · Do zrobienia

**faniklockow.pl · 30.10** — Opisali 76329 Maskę Milesa Moralesa jako okazję (tegoroczny EOL, rynek droższy od katalogu, przy dwóch sztukach wpada gratis 40889); arytmetyka się zgadza, ale karta lego.com sprawdzona dziś mówi „Chwilowo niedostępne", więc po cenie katalogowej nie ma czego kupić — została natomiast luka w naszych danych.
**Mamy?** — nie: 76329 nie ma w `sety.json` ani w `ceny_baza.json`, mimo potwierdzonego wycofania na grudzień 2026. Policzone szerzej: **49 zestawów z potwierdzonym wycofaniem w 2026 roku** jest poza rejestrem (plus 19 już po produkcji).
**Zrobić:** — zdecydować, czy dopisujemy te 49 do `sety.json` + `ceny_baza.json` przed grudniem; lista z nazwami, cenami i terminami w `materialy/wycofania-poza-rejestrem-2026-10-31.md`. To **inna klasa luki niż lista z 29.10**: tam kryterium był rabat ≥25%, a tutaj **21 z 49 pozycji jest na rynku droższe od katalogu** (76329 +47%, Endurance +26%, Nike Dunk Trickshot +21%), więc żaden filtr rabatowy ich nie pokaże — a to właśnie zestawy, przy których argumentem sezonu jest „w grudniu zniknie", nie „jest tanio".
**Kto:** — Marek (decyzja)

## 2026-10-30 09:55 · CODE · Teksty Piotra 0030–0033 (podesłane przez Marka w sesji)

**Zrobione:** publikacja ścieżką skrzynki (`skrzynka-tekstow.py publikuj`, commit `9715f51`):
- 0031 Premiery → `/artykuly/lego-friends-2027-pierwsze-zestawy-galeria-heartlake/`
- 0032 Premiery → `/artykuly/lego-marvel-67005-doctor-strange-supreme-premiera-2027/`
- 0033 Aktualności (ważne do 8.11) → `/artykuly/lego-30727-tie-advanced-gratis-lego-pl-listopad-2026/`
- 0030 Aktualności (LEGO DC 2027) był już na stronie od 27.10 (`6746b54`, z poprawką Marka: ceny Batmobili
  w zł z LEGO.pl zamiast euro + galeria). Przesłany plik to wersja Piotra sprzed poprawki — publikacja
  nadpisała ją na chwilę, przywrócona wersja z 27.10 w kolejnym commicie. Rejestr `skrzynka.json`
  ma teraz wpisy 0030–0033 (krótkie slugi nadane ręcznie przed importem).

**Stan:** gotowe, na `main`.

**Dla drugiej strony:** nic. **Uwagi:** gdy Piotr przyśle ponownie 0030 tą samą nazwą, automat znów
cofnie ceny do euro — poprawkę cen trzeba będzie wtedy powtórzyć albo poprosić Piotra o wersję ze złotówkami.

## 2026-10-30 09:40 · CODE · Opisy P07 jako .md przez skrzynkę tekstów

**Zrobione:**
- `scripts/import-karty.py` czyta także Markdown w układzie Piotra („# LEGO <nr> <nazwa>”, „## Opis zestawu”,
  tabela „## Metryka zestawu”, „## FAQ” z `###`); katalog/zip może mieszać DOCX i .md. Raport wypisuje linie
  `karta <nr>` dla kart do wgrania.
- `scripts/skrzynka-tekstow.py`: załącznik ZIP jest rozpakowywany (płasko, poprawne polskie znaki w nazwach),
  plik z „## Metryka zestawu” idzie do `import-karty.py --nadpisz`, link w mailu to `/zestaw/<nr>/`; karty
  i artykuły w jednym mailu publikują się razem albo wcale. Prompt zadania cyklicznego bez zmian (woła
  `publikuj` na katalogu).
- Odpowiedź dla Claude Piotra: `materialy/mail-do-piotra-opisy-md-2026-10-30.md`; instrukcja:
  `redakcja/skrzynka-instrukcja.md`, sekcja „Opisy zestawów P07”.

**Stan:** gotowe, sprawdzone na sucho na pliku 71458 (import i `publikuj --sucho`); karta 71458 NIE została
podmieniona — plik był przykładem formatu, decyzję o wgraniu zostawiam Piotrowi (nowa wersja ma 3 figurki,
obecna karta 5).

**Dla drugiej strony:** nic — odpowiedź Piotrowi wysyła Marek.
→ 30.10.2026 09:20: oba maile wysłane z konta Marka na piotrmaculewicz@interia.pl (kopia tylkoklockiblog+piotr@gmail.com): instrukcja dla Claude Piotra i odpowiedzi na pięć pytań. Decyzja Marka: polska nazwa Piotra z metryki zostaje (`f0c3cd3`).

**Uwagi:** importer zamienia nazwę z metryki na kanoniczną z katalogu (dla 71458 angielską „Crocodile Car”);
to dotychczasowa reguła, warto rozważyć polską nazwę Piotra, gdy katalog ma tylko angielską.

## 2026-10-30 08:40 · CODE · „Zestawy pod lupą”: 17 tekstów /deale/ w nowym formacie + moduł ceny

**Zrobione:**
- Paczka Coworka `zestawy-pod-lupa.zip` wgrana skryptem `scripts/import-pod-lupa.mjs` (nowy):
  17 tekstów podmienionych pod tymi samymi adresami, data publikacji zostaje, `zaktualizowano: 2026-10-30`.
  Sekcje „Do weryfikacji” nie są publikowane — leżą w `materialy/zestawy-pod-lupa-weryfikacja-2026-10-30.md`.
- Moduł `cena-pod-lupa` (`src/components/CenaPodLupa.astro`, reguły w `src/lib/pod-lupa.js`): cena dziś =
  najtańsza oferta sklepu z własnym magazynem (bez Allegro i Ceneo, sito jak w tabelach), status względem
  progów z frontmattera (bardzo dobra / dobra / powyżej progu / brak oferty), najniższa z notowań Łowcy.
  Znaczniki briefu `[moduł ceny: …]` i `[tabela: …]` obsługuje `scripts/remark-pod-lupa.mjs`.
- Strona główna: sekcja „Zestawy pod lupą” pokazuje tylko statusy dobra/bardzo dobra, max 3 (dziś: 10330,
  76354, 10359 — wszystkie „bardzo dobra”). `/promocje-lego/#zestawy-pod-lupa`: wszystkie teksty
  z plakietką statusu, najlepszy status pierwszy (dziś 3 bardzo dobre, 12 dobre, 2 powyżej progu: 21330, 76325).
- Venator: dwa posty zlane w `/deale/deal-75367-gwiezdny-niszczyciel-venator/`; stary adres
  `/deale/deal-75367-venator-ponizej-2000/` oddaje tę samą stronę z `rel=canonical` na główny
  (`src/pages/deale/[alias].astro`, pole `alias_url`; Base/Artykul przyjmują `canonical`).
- Karty zestawów: wiersz „Status” metryki liczony z listy wycofań i EOL zamiast stanu z dnia pisania
  (122 karty mówiły „dostępny” o zestawach wycofywanych/EOL); nota „ekskluzyw” nie pisze „nie widzimy go
  w innych sklepach”, gdy w tabeli jest Allegro; 40824 — premiera 1 stycznia 2025 (Brickset), poprawione
  w `karty_setow.json` i `katalog.json` (rok 2026 → 2025).
- Dokumentacja: brief jako `redakcja/wzorce/zestawy-pod-lupa.md`, reguły w `redakcja/ustalenia-projektowe.md`
  (skille wyeksportowane), wiersze w `scripts/README.md`.

**Stan:** gotowe, build OK, na `main`.

**Dla drugiej strony (Cowork):** nowe teksty „pod lupą” oddawać w formacie z briefu — import jest
automatyczny. Z notatek „Do weryfikacji” zostały sprawy wymagające źródła/decyzji (imiona figurek 21330
i 75367, lista 6 figurek 76354, unikatowość Senny 10330, status wycofania 60470/60471 jako „potwierdzone”
— lista wycofań mówi potwierdzone, więc teksty są zgodne z danymi). Zdania „Gdyby stanął obok N zestawów
… z 2026 roku” w kartach to świadome porównanie z bieżącym rocznikiem (`import-karty.py`), nie błąd.
Rozjazd „najtaniej dziś” vs Ceneo na hubach jest zamierzony: Ceneo to porównywarka, nie sklep (audyt 15.09).

**Uwagi:** `kategoria` zostaje `Deal` (walidator); plakietka pokazuje „Pod lupą”. Kalendarze adwentowe
schodzą z głównej po 24.12 (`wylacz_z_glownej_po`).

## 2026-10-30 05:18 · SCOUT · Do zrobienia

**LEGO wyznaczyło odsłonięcie zestawu na Black Friday na 3 listopada 2026, godz. 18:00 (transmisja z Q&A projektantów); PromoBricks 28.10 i StoneWars 29.10 zgodnie wskazują na Ideas Godzilla 21375, 5364 elementy, sprzedaż od 27 listopada — ale cena rozjeżdża się między źródłami: 399,99 albo 449,99 euro.**
**Mamy?** — częściowo: `/kalendarz-promocji-lego/` (sekcja `#listopad`) ma akapit o 21375 wchodzącej w dniu Black Friday i terminy z plakietką „przewidywane", ale nie ma daty samego odsłonięcia ani informacji, że cena nie jest ustalona.
**Zrobić:** — dopisać w `/kalendarz-promocji-lego/`, sekcja `#listopad`, jedno zdanie: transmisja LEGO 3 listopada 2026 o 18:00 odsłania zestaw na Black Friday, spodziewana Godzilla 21375; przy cenie napisać widełki 399,99–449,99 euro zamiast jednej kwoty, dopóki LEGO nie poda swojej.
**Kto:** — Code (strona)
↻ 31.10.2026: nadal aktualne — doszły konkretniejsze daty okien. StoneWars (30.10) podaje
Insiders Weekend **21–22 listopada** i Black Friday jako okno **27–30 listopada**, a tabela
w sekcji `#listopad` ma dziś „ok. 21–26.11" dla Insiders Weekend i sam 27.11 dla Black Friday.
Plakietka „przewidywane" zostaje słusznie: StoneWars pisze wprost, że LEGO reklamuje już oba
wydarzenia w sklepie, ale szczegółów nie ujawnia. Przy tej samej poprawce warto więc wstawić obie
daty z przypisem, czyje one są.

**107 zestawów ma w `katalog.json` status `dostepny` i aktualne oferty w `oferty_feed.json`, a nie ma ich w `sety.json` — czyli bez śledzonego minimum, bez alertu cenowego i bez wejścia do „Dziś w dobrej cenie".**
**Mamy?** — częściowo: huby tych zestawów stoją i pokazują ceny z feedu, ale rejestru nie mają. To inna lista niż ta domknięta 29.10 — tamta brała tylko zestawy z potwierdzonym RRP, min. dwiema ofertami i rabatem ≥25%; ta nie ma progu rabatu i obejmuje też pozycje bez ceny katalogowej.
**Zrobić:** — zdecydować, które grupy z tych 107 w ogóle chcemy śledzić, bo to nie jest jednorodna lista: **85** pozycji to normalne zestawy roczników 2012–2025 (84 z nich z potwierdzonym RRP; rocznik 2025 to 48 sztuk, 2024 — 21; m.in. 10351, 10352, 10361, 10375, 21360, 42217, 76317 oraz 21351 z potwierdzonym wycofaniem na grudzień 2026), **13** to gadżety i breloki bez ceny katalogowej (854xxx, 5006157, 5007851), **6** to Power Functions (88005, 88009, 88010, 88012, 88013, 88015), a **4** to tegoroczne saszetki i brelok bez RRP (30718, 30720, 30732, 854328 — ten ostatni liczy się też w gadżetach, stąd 85+13+6+4 daje 108, a nie 107). Pełną listę odtwarza polecenie z raportu Scouta z 30.10.
**Kto:** — Marek (decyzja)

## 2026-10-29 08:05 · RADAR · Do zrobienia

**faniklockow.pl · 28.10** — Trzy „Okazje Cenowe"; dwie sprawdziły się jako nasze własne minimum albo gorszą cenę (60506 ich 179 zł = nasz rekord z 02.10; 77259 ich 65 zł wyżej od naszych 59,99 z 07.09), ale trzecia — 72046 Game Boy, 157,69 zł u Ceneo przy katalogu 249,99 — dotyczy zestawu, którego nie ma w rejestrze; to drugi taki przypadek w dwa dni po 21333.
**Mamy?** — częściowo: huby pokazują ceny z `oferty_feed`, ale **64 zestawy** z potwierdzonym RRP, min. dwiema ofertami i rabatem ≥25% (po sicie podejrzanego rynku) nie są w `sety.json` ani w `ceny_baza.json` — czyli bez śledzonego minimum, bez alertu cenowego i bez wejścia do „Dziś w dobrej cenie". Z 64 hubów 17 jest noindex, 47 indeksowalne.
**Zrobić:** — zdecydować, ile z tej 64 dopisujemy do `sety.json` + `ceny_baza.json` przed szczytem sezonu i od jakiego progu rabatu (czoło listy: 77057 −48%, 77076 −47%, 76785 −47%, 31380 i 10713 −46%, 72046 −37%); pełna lista z nazwami, cenami i terminami wycofań w `materialy/zestawy-poza-rejestrem-2026-10-29.md`. Jeden wpis to para person plus minimum z `historia-cen`, więc 64 sztuki to wielkość do rozstrzygnięcia, nie do cichego zrobienia w przebiegu Radaru.
**Kto:** — Marek (decyzja)
→ rozstrzygnięte 29.10.2026: Marek — „dopisz wszystkie z rabatem od 40%". Dopisanych **9 zestawów**
(`sety.json` 1217 → 1226, `ceny_baza.json` 1136 → 1145): 77057 Kreatywne domy: Pory zabawy,
76785 Mieszkanie Rączki, 77076 Restauracja Durrr Burgerownia, 31380 Konsola do gry retro,
10713 Kreatywna walizka, 77058 Przytulny dom Goldie, 31214 LOVE, 75689 Emerald City i Kiamo Ko
Castle, 77055 Able Sisters i sklep odzieżowy. Wszystkie dziewięć hubów jest po buildzie
indeksowalnych — 77057 i 77058 były wcześniej noindex, persony przeważyły próg treści.
→ **domknięte 29.10.2026: Marek — „dopisz pozostałe z przedziału 25-39%".** Dopisane wszystkie 55
(`sety.json` 1226 → 1281, `ceny_baza.json` 1145 → 1200), czyli cała lista z
`materialy/zestawy-poza-rejestrem-2026-10-29.md` jest wyczerpana. Po buildzie **żaden z 55 hubów
nie ma noindex** — przed dopisaniem 15 z nich było cienkich.

Co poszło nie tak po drodze i jak to wyszło (warto, bo powtórzy się przy następnej partii):
- **Cztery huby zostały pod progiem** (77001, 76458, 75415, 10345): `MIN_ZNAKOW_OPISU` w `seo.js`
  to 300 znaków `opis + dla_rodzica + dla_afol`, a moje persony miały 275–291. Dopisane zdania
  z tych samych danych, nie z domysłów; po poprawce 411–527 znaków i cała czwórka weszła do indeksu.
  Na przyszłość: para person poniżej ~320 znaków nie wystarcza, żeby hub był indeksowalny.
- **Pusta strona serii.** 77037 dostał `seria: "Horizon Adventures"`, bo tak nazywa tę serię
  `karty_setow.json` i Rebrickable — ale w `katalog.json` zestaw siedzi pod „Archiwum", więc
  `/serie/horizon-adventures/` wygenerowała się z `numberOfItems: 0`, indeksowalna i pusta.
  Powód jest w `src/pages/serie/[seria].astro`: zestaw spoza katalogu wchodzi na stronę serii tylko
  z premierą w formacie `RRRR-MM`, a ja miałem sam rok. Rebrickable podał 1 marca 2025, więc
  `premiera` to teraz `2025-03` i strona ma swój jeden zestaw. **Reguła: nadając serię, której nie
  ma w `katalog.json`, trzeba mieć premierę co do miesiąca, inaczej robi się pusta strona serii.**
- **Pole `wiek` zostawiłem puste w 6 wpisach** (10345, 10696, 10698, 60205, 60238, 75415): ani
  `karty_setow.json`, ani zapisane karty lego.pl w `materialy/opisy-lego/` nie podają wieku.
  Przy 76303 wpisałem najpierw „8+" z głowy i **usunąłem to** — karta tego nie potwierdza.
  Do uzupełnienia, gdy ktoś będzie i tak pobierał te karty.

Dane: nazwy polskie z `katalog.json` albo z feedu Planety Klocków, liczba elementów z `katalog.json`
(zgodna co do sztuki dla wszystkich 55), `wiek` i `premiera` z metryk w `karty_setow.json`, reszta
premier to rok z katalogu. Minimum do `ceny_baza` liczone jak poprzednio: po sicie 50% RRP i bez
ofert odrzuconych — skrypt dopisujący sam to sprawdza i przerywa przy rozjeździe.

Trzy rzeczy warte zapisania, bo dotyczą każdego kolejnego dopisywania:
1. **Minimum do `ceny_baza` liczymy po sicie serwisu, nie po surowej historii cen.** Dwa z dziewięciu
   miały w `historia-cen` niższe kwoty, których nie wolno wpisać jako rekordu: 77076 — 89 zł z 22.10,
   **odrzucone przez Marka 23.10** jako nieprawdziwe (wpis w `deale_potwierdzone.odrzucone`), więc
   minimum to 131,99 zł z 25.10; 77058 — 39,99 zł z 23.09, czyli **poniżej progu 50% RRP**, który
   sito „podejrzany rynek" ukrywa na stronie, więc minimum to 50,93 zł z 19.10. Wpisanie tamtych
   kwot kazałoby hubowi chwalić się rekordem, którego serwis sam nie pokazuje.
2. **Dane z kart lego.com/pl-pl** (29.10, osiem kart; 77057 nie ma już karty, nazwa z feedu Planety
   Klocków). Liczba elementów zgodna z `katalog.json` co do sztuki we wszystkich ośmiu przypadkach —
   niezależne potwierdzenie, że zaciąg z Rebrickable nie kłamie.
3. **`premiera` to rok, nie miesiąc** (wyjątek 31380: `2026-01` z karty w `karty_setow.json`). Karty
   lego.com nie podają daty premiery, a `katalog.json` trzyma tylko `rok`; format `RRRR` ma precedens
   przy 77094. Miesiąca nie dopisuję „na oko", bo to pole steruje stronami `/nowosci/<miesiac>/`.
4. **Poprawka tego samego dnia, mój błąd:** budując pole `oferty` wziąłem cały zestaw ofert
   z `oferty_feed`, razem z **Ceneo** — a żaden z 1217 wcześniejszych wpisów w `sety.json` Ceneo
   nie ma, bo to porównywarka, nie sklep (reguła opisana w `najlepszaOferta` i w `deale.js`).
   Ceneo usunięte z tych dziewięciu wpisów; tabela na hubie pokazuje je dalej, bo bierze je z feedu
   i renderuje jako ostatni wiersz. Zasada na przyszłość: **`sety.json` trzyma oferty sklepów,
   Ceneo mieszka wyłącznie w feedzie.**
   **Korekta tej samej notatki, 29.10 po sprawdzeniu kodu zamiast czytania go z pamięci:** napisałem
   tu najpierw, że „skutki były dwa i oba realne" — że `rabat` liczył się od ceny Ceneo (31380 jako
   −46% zamiast −35%) i że karuzela mogła zaprosić „Sprawdź w Ceneo". **Pierwsze jest nieprawdą,
   drugie niewykazane.** `rabat` i `najlepszaCena` liczą się na `wpisyPewne`, czyli po `tylkoPewne`,
   a `ofertaPewna` przepuszcza bez potwierdzenia tylko sklepy z codziennym feedem (Media Expert,
   Allegro, Planeta Klocków). Ceneo nie jest jednym z nich i w `weryfikacja_ofert.json` nie ma ani
   jednego wpisu dla Ceneo (0 z 55), więc moje oferty Ceneo nie dotknęły ani ceny, ani rabatu, ani
   żadnej karty. Realny skutek był **żaden**; złamana została sama spójność danych.
   Co pokazał test A/B (oferta Ceneo 127,49 zł w `sety.json` plus sztuczne potwierdzenie z dziś):
   bez odsiewu zestaw **wypada z karuzeli**, bo Ceneo zostaje jego „najtańszą ofertą" i przestawia
   dobór półek — 77076 zniknął ze slajdera, a nie dostał przycisku „Sprawdź w Ceneo". Z odsiewem
   karta zostaje na Media Expercie, czyli tak jak dziś na produkcji.

## 2026-10-29 05:20 · SCOUT · Do zrobienia

**Pierwsza partia stycznia 2027 ma polskie ceny i przedsprzedaż: 42709 Centrum zabawy i pielęgnacji dla zwierząt (219,99 zł), 42718 Imprezowy autobus przyjaciół (259,99 zł), 42719 Galeria handlowa Heartlake City (429,99 zł) i 67005 Marvel „A gdyby…?" Doctor Strange Supreme (429,99 zł, sześć minifigurek).**
**Mamy?** — tak: huby `/zestaw/42709/`, `/zestaw/42718/`, `/zestaw/42719/`, `/zestaw/67005/` i tabela potwierdzonych w `/zapowiedzi-lego-2027/`; brakuje tekstu.
**Zrobić:** — tekst o styczniowej fali Friends 2027 na podstawie tych hubów (według StoneWars styczeń to 13 zestawów Friends i dwa polybagi, więc ta trójka to pierwsza część); najmocniejszy pojedynczy temat to 67005 — cztery wersje zombie i Strange Supreme, których nie było w żadnym zestawie.
**Kto:** — Piotr (tekst)

## 2026-10-28 09:05 · ŁOWCA · Do zrobienia

**Po naprawie filtra PK (63ebb5c) feedy-lego.py sprawdza ~5400 kart Planety Klocków dziennie zamiast ~1250 — stare zawężenie opierało się na kategorii, której feed już nie podaje (4305 kart to archiwum OutOfStock sprawdzane codziennie na nowo)**
**Mamy?** — częściowo: przebieg działa (PK 1092 setów), ale trwa wyraźnie dłużej i obciąża sklep
**Zrobić:** — w `scripts/feedy-lego.py` zawęzić kandydatów do kart PK (np. pamiętać numery OutOfStock z poprzednich dni w pliku roboczym albo sprawdzać tylko numery obecne w `known_sets.json`), żeby wrócić do ~1200 zapytań
**Kto:** — Code (skrypt)
→ zamknięte 28.10.2026 (Code, zadanie z sesji Łowcy): pamięć OutOfStock w nowym pliku
`src/data/pk_oos.json` — numer po 3 kolejnych przebiegach z OutOfStock schodzi na rytm
tygodniowy (karta odpytywana tylko w dniu `nr % 7`, archiwum rozkłada się na ~620 kart
dziennie zamiast 4300 codziennie), powrót InStock kasuje wpis; to pamięć robocza skryptu
(opis w `_meta` pliku), append-only jej nie obejmuje. Format wyciągu i `_meta` bez zmian
(pominięte numery wchodzą do `planetaklockow_niedostepne`), flaga pustego feedu z 63ebb5c
zostaje. Przebieg kontrolny 28.10: PK 1093 setów (próg 1092 ✓), sprawdzono 5416 kart,
4307 OutOfStock weszło do pamięci z dni=1 — pełne odciążenie od trzeciego przebiegu (31.10),
bo serii nie zasiewamy sztucznie. Koszt świadomy: powrót archiwalnego numeru do sprzedaży
widać najpóźniej po tygodniu.

## 2026-10-28 08:05 · RADAR · Do zrobienia

**faniklockow.pl · 27.10** — Wystawili „Okazję Cenową" na 21333 Gwiaździstą noc (Smyk 599 zł, u nich −26%); sama okazja się nie broni (wobec potwierdzonego katalogu 729,99 zł to −17,9%, a 599 zł u Smyku stało też 25.09 i 09.10), ale odsłoniła lukę w naszym rejestrze.
**Mamy?** — częściowo: hub `/zestaw/21333/` pokazuje ceny z `oferty_feed`, ale numeru **nie ma w `sety.json`** — mimo potwierdzonego wycofania na grudzień 2026.
**Zrobić:** — dopisać 21333 do `src/data/sety.json` (bez wpisu zestaw nie wejdzie do bloku „Dziś w dobrej cenie", nie ma śledzonego minimum i nie dostanie alertu cenowego w szczycie sezonu); research domknięty u źródła: 729,99 zł, 2316 elementów, 18+, premiera 25.05.2022 (Rebrickable), seria Ideas, EOL grudzień 2026 z `wycofania.json`.
**Kto:** — Code (dane, strona)
→ zamknięte 28.10.2026 (polecenie Marka): 21333 dopisany do `sety.json` (1212 → 1213)
**oraz do `ceny_baza.json`** (1135 → 1136) — i to drugie okazało się konieczne, nie ozdobne:
`zrzut-import.mjs` ma `if (!b) continue`, czyli skrypty tylko aktualizują istniejące wpisy
w `ceny_baza`, nigdy nie zakładają nowych. Sam wpis w rejestrze dałby więc hub i persony,
ale nadal zero śledzonego minimum i zero alertów. Minimum zapisane z naszej własnej historii:
599 zł u Smyku, 25.09.2026. Hub `/zestaw/21333/` po buildzie jest pełny i indeksowalny
(persony, tabela z −18% u Smyku, termin wycofania). Zapisane przez `zapiszSety` z
`json-kolejnosc.mjs`, `porzadek-ofert --sucho` i `kontrola-ofert` bez zastrzeżeń.

## 2026-10-28 05:10 · SCOUT · Sygnały wycofań dla runnera Wycofań

- 30727 Minimodel TIE Advanced — karta promocji `lego.com/pl-pl/page/lego-offers-promotions`
  (sprawdzona 28.10.2026): zestaw jest rozdawany jako gratis przy zakupach Star Wars od 165 zł
  w oknie 28.10–8.11.2026, czyli **jest u producenta**. W `katalog.json` ma status `eol` z powodem
  „nigdy na listingu lego.pl, premiera 2026-01 (zaciąg 2026-09-15)" — sygnał odwrotny do wycofania,
  do weryfikacji przy poniedziałkowym zaciągu. Statusu nie ruszam, bo plik nie jest mój.
→ Wycofania 2026-11-02: odrzucone (nic do zmiany u mnie) — 30727 nie figuruje w `wycofania.json`,
więc lista wycofań niczego o nim nie twierdzi; status „eol" w `katalog.json` należy do wtorkowego
zaciągu lego.pl, a saszetki 30xxx jako gratisy i tak nie trafiają na listing, więc „eol" z powodu
„nigdy na listingu" to znana właściwość tej grupy, nie błąd listy wycofań.

## 2026-10-27 · CODE · Recenzja Piotra 60478 Betoniarka; tekst 0030 (DC 2027) wstrzymany

`/artykuly/lego-60478-betoniarka-recenzja/` (Recenzje_013), 4 zdjęcia z galerii + slajder 60480/60494 w „Alternatywach”.
**0030 „LEGO DC na 2027 rok” — opublikowany z poprawką Code (decyzja Marka 27.10):** `/artykuly/lego-dc-2027-batmobile-joker-daily-planet/`; zdanie o LEGO.pl → „Wszystkie trzy mają już polskie ceny katalogowe na LEGO.pl”, w tabeli 67008 i 67009 w złotych zamiast euro. Powód: tekst mówi, że na LEGO.pl jest tylko obraz 67012, a Batmobile
podaje w euro — tymczasem `rrp_potwierdzone.json` ma z LEGO.pl (14.10, Firecrawl) 67008 = 259,99 zł i 67009 = 126,99 zł,
a Media Expert sprzedaje je już w przedsprzedaży (229,99 i 114,99 zł). Opublikowany w obecnej formie byłby sprzecznością
wykrywaną przez `swiezosc-tekstow.mjs`.

## 2026-10-27 · CODE · Karty P07 Piotra: partie 24–25 (50 kart)

Wgrane wszystkie 50 kart (`import-karty.py --krotkie`), bez blokad RRP, wszystkie huby indeksowalne.
15 rozjazdów liczby elementów (katalog z Rebrickable vs Piotr) rozstrzygnął Brickset — za każdym razem
na korzyść Piotra; `katalog.json` poprawiony: 10788, 40657, 41806, 41808, 41811, 76252, 80043–80046,
80048, 80049, 910002, 910004, 910011.

## 2026-10-27 08:50 · ŁOWCA · Do zrobienia

**77253 Bugatti wróciło do maila podejrzanego rynku: Ceneo 56,30 zł przy RRP 114,99 (−51%) — złotówkę poniżej odrzuconych 57,32 zł z 21.10, więc sito znów je pokazuje**
**Mamy?** — tak: oferta w danych, strona ukrywa ją do potwierdzenia
**Zrobić:** — sprawdzić kartę z maila i zaktualizować werdykt 77253 w `src/data/deale_potwierdzone.json` (ponowne odrzucenie przy 56,30 zł wyciszy mail do kolejnego spadku)
**Kto:** — Marek (decyzja)
→ zamknięte 28.10.2026: Marek odrzucił ponownie przy 56,30 zł (czat, „bugatti olej”) — wpis w `deale_potwierdzone.json`, mail wyciszony do kolejnego spadku.

**Feed PK zwrócił 0 setów przy pustym `_meta.bledy` — bez bezpiecznika naniesienie skasowałoby ~1100 ofert PK (27.10 uratował bezpiecznik w skrypcie roboczym Łowcy)**
**Mamy?** — częściowo: bezpiecznik tylko w scratchpadzie Łowcy; `scripts/feedy-lego.py` dalej zapisuje pusty słownik bez ostrzeżenia
**Zrobić:** — w `scripts/feedy-lego.py` dopisywać do `_meta.bledy` sklep, którego feed sparsował się do zera pozycji
**Kto:** — Code (skrypt)
→ zamknięte 28.10.2026: zrobione przez Łowcę commitem 63ebb5c — filtr PK naprawiony po zmianie feedu (puste shopcategory), pusty feed ląduje w `_meta.bledy`.

## 2026-10-26 12:00 · CODE · Slajdery tylko z ofertami sprawdzonymi na karcie produktu

Powód: 43303 z porannego zrzutu x-kom (24,99 zł, krótka promocja) wisiało w banerze, a na karcie było już 46,90 zł.
Decyzja Marka: slajder 5 okazji i „Dziś w dobrej cenie” (12) na głównej oraz slajder `/promocje-lego/` (12) biorą
ofertę sklepu z cenami tygodniowymi tylko po sprawdzeniu karty; Media Expert, Allegro i Planeta Klocków bez
sprawdzania (codzienne feedy). Nowe: `scripts/weryfikacja-ofert.mjs`,
`src/lib/weryfikacja.js`, `src/data/weryfikacja_ofert.json`; skrypt uruchamia codziennie Routine „LEGO 09:17 — Weryfikacja ofert do slajderów” w sesji Code (`trig_01ApTmYLjumFycmtRJgUzXfa`) — prompt Łowcy może zmienić tylko jego sesja. Koszt: 1 kredyt na kartę, limit 40 dziennie
(~1 200/mies. przy 5 000 w planie). Pierwszy przebieg 26.10: 54 karty, ok 37, nieodczytane 2 (43273 MediaMarkt i Smyk),
poprawiona cena 75408 MediaMarkt 197,99 → 289 zł. Przy okazji `firecrawl.mjs`: błąd curla nie wypisuje już linii
poleceń (wcześniej z kluczem API w nagłówku) i ponawia zerwane połączenie.

## 2026-10-26 10:15 · CODE · x-kom Black Weeks, tydzień 2: aktualność + ceny z kodem black-weeks2

- `/artykuly/x-kom-black-weeks-2026-lego-tydzien-2/` (Aktualności, bez `wazne_do`). Mail SalesMasters 26.10: 8 zestawów.
  Karty sprawdzone Firecrawlem 10:08 PL: z kodem black-weeks2 trzy — 75446 319, 76785 189, 75433 199 (wszystkie
  poniżej naszych minimów); bez kodu na karcie 77082 (649,90) i 72050 (589,90); „chwilowo niedostępne” 75434, 10367, 72043.
- Dane: 3 ceny xkom w `oferty_feed`/`sety.json`, minima 75446 i 75433 w `ceny_baza`; kod w `kody_rabatowe.json`
  (`do` 2026-11-01 = horyzont do następnej listy, `koniec_znany: false`). Tekst z 19.10 linkuje do tygodnia 2.
**Dla drugiej strony:** zrzut x-kom 02.11 nadpisze te ceny. 77082 i 72050 sprawdzam jeszcze dziś po południu.

## 2026-10-26 10:05 · KONTROLER · Do zrobienia

**17 kliknięć spoza Polski przeszło w tygodniu 20–26.10 filtr jako „human" — każde z refererem strony głównej, 10 z refererem `https://tylkoklocki.pl` bez końcowego ukośnika (24.10 14:12–20:39, 10 krajów, jedno kliknięcie na sklep), 0 kliknięć z Polski ze strony głównej.**
**Mamy?** — częściowo: reguła z 12.10 sprawdza sparsowaną ścieżkę (`new URL(referer).pathname` = `/` także bez ukośnika), więc surowy nagłówek bez ukośnika przechodzi; przeglądarka serializuje referer strony głównej zawsze z ukośnikiem.
**Zrobić:** — zgoda na jedną regułę w `src/worker.js`: surowy referer równy dokładnie `https://tylkoklocki.pl` albo `https://www.tylkoklocki.pl` → bot (wdraża Code; worker = pytamy przed pushem).
**Kto:** — Marek (decyzja)
→ zamknięte 02.11.2026 (Kontroler): zastąpiona — w tygodniu 27.10–02.11 referer bez ukośnika nie wystąpił ani razu, a 40 sondowych kliknięć spoza PL ma ukośnik; nowa reguła (strona główna + kraj spoza PL = bot) we wpisie KONTROLER 02.11.

**Performers drugi tydzień z rzędu liczy ok. 2/3 naszych kliknięć do Media Expertu: 13–19.10 — 18 wobec 29 naszych ludzkich (62%), 20–26.10 — 12 wobec 18 (67%); 387 kliknięć w 60 dni po ich stronie, 0 konwersji.**
**Mamy?** — częściowo: dwa tygodnie czystego pomiaru po odcięciu botów, ta sama proporcja.
**Zrobić:** — mail do supportu Performers (program Media Expert, offer_id 1860) z obiema parami liczb i pytaniem o sposób liczenia kliknięć (deduplikacja, filtr UA) — albo decyzja, żeby poczekać trzeci tydzień.
**Kto:** — Marek (decyzja)
↻ 02.11 (Kontroler): trzeci tydzień 27.10–02.11 — 25 naszych PL wobec 16 u Performers (64%); warunek „trzeci tydzień" spełniony, gotowy tekst maila w `materialy/kontroler-2026-11-02.md` (sekcja EPC).

**Harmonogram z konta zgłasza jedyną kolizję: pon 09:30 — Kontroler (przesunięty 19.10) i „Alerty cen" (codziennie 09:30).**
**Mamy?** — częściowo: dziś oba przebiegi przeszły, ale dzielą limit konta na tej samej minucie.
**Zrobić:** — zgoda na 09:35 dla Kontrolera (`trig_01KB8XkPcHyvc5kCRKEKYjri`); zmianę crona i wzmianki w `materialy/zadania-cykliczne.md` i `NARZEDZIA.md` robi Kontroler.
**Kto:** — Marek (decyzja)
→ zamknięte 02.11.2026 (Kontroler): wycofane — trzy przebiegi (19.10, 26.10, 02.11) bez szkody z kolizji; wrócę, jeśli harmonogram pokaże skutek.

**Liczba zaindeksowanych stron z panelu GSC ma odczyt z 19.10 (837, dane z 12.10); 02.11 miną dwa tygodnie, a sitemapa hubów urosła w tydzień z 1 375 do 1 768.**
**Mamy?** — nie: ostatni odczyt 19.10.2026 przez Coworka.
**Zrobić:** — odczytać raport „Strony" w panelu GSC przed 02.11 (prompt z 19.10 w sesji Kontrolera).
**Kto:** — Marek (panel) albo Cowork (panel)
↻ 02.11 (Kontroler): nadal brak odczytu — 21 dni od danych z 12.10; sitemapa hubów od tamtego odczytu 1 291 → 1 929.

## 2026-10-25 · CODE · Dwa teksty historyczne Piotra (0026 Cargo Center, 0029 Paradisa) ze zdjęciami

`/artykuly/lego-6391-cargo-center-historia/` i `/artykuly/lego-paradisa-historia-serii/`, po 5 zdjęć Piotra
(`public/zdjecia/artykuly/<slug>/K.webp`), import bez uwag. Okładki to zdjęcia Piotra (Cargo: 1, Paradisa: 3 —
pudełko 6416), bo zestawy z lat 80./90. nie mają u nas zdjęć ani hubów. Dwie poprawki w
`import-artykul-md.py`, ważne też dla automatu skrzynki: (1) zdjęcia zmniejsza teraz sharp z Node,
nie PIL — domyślny `python3` (3.11, /usr/local/bin) nie ma działającego PIL, więc teksty ze zdjęciami
z maila wywaliłyby się przy imporcie; (2) gdy pierwszy zestaw z „Zestawy” nie ma u nas zdjęcia (albo
pola brak), okładką zostaje pierwsze zdjęcie Piotra z `okladka_alt` z podpisu.

## 2026-10-25 · CODE · Trzy teksty Piotra (0027, 0028, Recenzje_012) — starą drogą, przez Marka

Opublikowane skryptem skrzynki (`skrzynka-tekstow.py publikuj`, commit 7ee0f27), bez uwag importu:
`/artykuly/lego-daft-punk-ideas-zapowiedz/` (Premiery, bez zestawu — karta na liście z grafiką zastępczą),
`/artykuly/lego-ideas-40889-upominek-od-28-pazdziernika-2026/` (Aktualności),
`/artykuly/lego-42676-frajda-w-parku-wodnym-recenzja/`. Adresy wpisane do `redakcja/skrzynka.json`,
więc poprawki przysłane mailem trafią pod te same adresy. `import-artykul-md.py` ucina teraz slug
na granicy słowa. Rozbieżność (decyzja Marka 25.10: oba zostają bez zmian): wpis `daft-punk-ideas` w `przecieki.json` (Scout 23.10) mówi o
projekcie fana „RobotRock”, tekst Piotra — o „Daft Punk Concert” Patricka Harbouna; tekst zostaje
bez zmian.

## 2026-10-25 · CODE · Karty P07 Piotra: partie 16–23 (200 kart)

Partie 20–23: wgrane wszystkie 100 kart (`import-karty.py --krotkie`), wszystkie huby indeksowalne (≥2 akapity albo
opis >300 znaków, ≥3 FAQ). 10797 Sala balowa Gabi: katalog miał 260 elementów (Rebrickable), Brickset
i Piotr 252 — katalog poprawiony. 30680 AAT (polybag Star Wars): Piotr podawał 16,99 zł, katalog
17,99 zł — decyzja Marka: karta wgrana z naszą ceną 17,99 zł (i 0,24 zł za element w metryce i FAQ).
Potem partie 16–19: 100 kart, wszystkie indeksowalne. 40686: Piotr pisze 261 elementów, Brickset
i katalog 262 — karta wgrana bez zmian; decyzja Marka 25.10: 261 zostaje, nie poprawiać.

↻ 2026-10-24 · ŁOWCA: w sicie podejrzanego rynku czeka 6 pozycji bez werdyktu (75372, 10696, 76319, 40808, 71853 — szczegóły w mailach „Oferty do sprawdzenia"); żadna nowa w tym tygodniu, decyzje Marka w `src/data/deale_potwierdzone.json`, bez pośpiechu.

## 2026-10-24 08:10 · RADAR · Do zrobienia

**faniklockow.pl · 23.10** — Opisali 75192 Sokół Millennium jako okazję cenową; w naszych danych wychodzi mocniej, niż sami piszą: 2699,90 zł w Media Expert z 23.10 przy potwierdzonym katalogu 3599,99 (−25%) to **minimum całej naszej historii cen** tego zestawu (39 zapisów od 18.09; poprzednie minimum 2799 zł z 18.09, Allegro i Smyk), a zestaw ma potwierdzone wycofanie na grudzień 2026.
**Mamy?** — częściowo: cena jest widoczna na `/zestaw/75192/` (−25% to nie poziom sita „podejrzany rynek"), ale nie mamy o tym żadnego tekstu — mimo że wzorzec stoi w repo: `/deale/deal-76325-quinjet-minimum-przed-wycofaniem/`, 28 linii, napisany w przebiegu Radaru 07.10.
**Zrobić:** — krótki deal „75192 Sokół Millennium w minimum naszych notowań przed grudniowym wycofaniem" w `src/pages/deale/`, na wzór dealu 76325; wszystkie liczby są już policzone z `historia-cen` i `wycofania.json`.
**Kto:** — Code (dane, strona)
↻ 25.10.2026 (Radar): nadal aktualne — cena 2699,90 zł w Media Expert utrzymała się drugi dzień
(feed z 24.10), dealu w `src/pages/deale/` nie ma. Przy zestawie schodzącym z produkcji okno na taki
tekst zamyka się razem z ofertą.
↻ 26.10.2026 (Radar): trzeci dzień — 2699,90 zł w Media Expert z datą 25.10, dealu nadal nie ma.
↻ 27.10.2026 (Radar): czwarty dzień i pierwsza zmiana jakościowa — 2699,90 zł ma już **trzy sklepy**
(Media Expert, Ceneo, x-kom), Allegro stoi 2758,90. To ruch całego rynku, nie wybryk jednego
sprzedawcy, więc cena jest pewniejsza niż w piątek. Dealu nadal nie ma.
→ zamknięte 27.10.2026: deal napisany i opublikowany —
`/deale/deal-75192-sokol-millennium-minimum-przed-wycofaniem/` (polecenie Marka).

Warte zapisania obok samej pozycji: dzień po dniu ta sama kategoria dała przeciwny wynik sprawdzenia.
22.10 ich „to nie błąd cenowy" przy 77076 za 89 zł **nie przeszło** weryfikacji (zestaw stoi po 170,
oferta odrzucona). 23.10 ich okazja na 75192 **sprawdza się** i jest mocniejsza, niż napisali. Wniosek
nie brzmi więc „oni się mylą" ani „oni mają rację", tylko: ich teksty dealowe są leadem do sprawdzenia
w naszych danych, a ta robota opłaca się w obie strony — raz chroni przed fałszywą ceną, raz pokazuje
temat, którego sami nie zauważyliśmy.

## 2026-10-24 05:15 · SCOUT · Do zrobienia

**LEGO otwiera 28.10 nowe okno gratisowe: 40889 Buduj, maluj i baw się! (Ideas, 158 elementów, 18+, wycena 81,99 zł) dokładany do zamówień w sklepie LEGO do 11.11.2026 — polskiego progu zakupu nie ma na karcie produktu, niemiecki to 130 euro.**
**Mamy?** — częściowo: hub `/zestaw/40889/` jest od dziś z wyceną i datami, ale `/kalendarz-promocji-lego/` tego okna nie zna wcale.
**Zrobić:** — dopisać do `/kalendarz-promocji-lego/` okno 28.10–11.11 z gratisem 40889 i sprawdzić polski próg na `lego.com/pl-pl/page/lego-offers-promotions` po starcie akcji (28.10), bo karta produktu go nie podaje.
**Kto:** — Code (dane, strona)
→ częściowo zamknięte 25.10.2026 (polecenie Marka): okno dopisane — nowa sekcja `#listopad-40889`
  plus pozycja na liście „co trwa teraz", `zaktualizowano` 2026-10-25. Polski próg zostaje otwarty:
  karta promocji lego.com/pl-pl sprawdzona dziś ma tylko okno 20–27.10 (165 / 625 / 670 zł), o 40889
  i o oknie od 28.10 nie ma tam ani słowa. **Zrobić:** po 28.10 sprawdzić tę kartę i wpisać polski
  próg do tabeli w `#listopad-40889` (dziś stoi tam tylko niemieckie 130 euro). **Kto:** Scout.
→ zamknięte 28.10.2026: karta promocji lego.com/pl-pl podaje polski próg **540 zł** i okno
  **28.10–8.11.2026** (cytat: „od 28 października 2026 (GMT+0) do 8 listopada 2026, do wyczerpania
  zapasów”, „Wartość zakupionych artykułów LEGO musi wynosić co najmniej 540 zł”). Wpisane do tabeli
  w `#listopad-40889`. Przy okazji wyszło, że polskie okno kończy się **8, nie 11 listopada** — data
  11.11 pochodziła z tekstu StoneWars, czyli z rynku niemieckiego; poprawiona w trzech polach 40889
  w `sety.json`, w opisie wpisu w przeciekach i w dwóch miejscach kalendarza. Na tej samej karcie był
  drugi, nieznany nam gratis: 30727 Minimodel TIE Advanced przy zakupach Star Wars od 165 zł.

**Prompt zadania „Scout nowości" nadal zawiera zdanie „Zestawów LEGO Education nie dodawaj do sety.json", a 23.10 zdecydowałeś odwrotnie dla czterech Science Kitów w sprzedaży detalicznej (45200–45203, dopisane).**
**Mamy?** — nie: decyzja żyje w `DZIENNIK.md` i w `known_sets.json`, ale nie w promptcie, a sesja z czystym kontekstem czyta tylko prompt.
**Zrobić:** — w panelu zadania cyklicznego dopisać wyjątek: Education w zwykłej sprzedaży detalicznej wchodzi do `sety.json`, kanał szkolny (np. 45521) nie.
**Kto:** — Marek (panel)

## 2026-10-24 · CODE · Skrzynka tekstów: teksty Piotra z maila publikują się same

Decyzja Marka: teksty Piotra idą na stronę bez przeglądu, do Marka i Piotra wracają same linki.
Claude Piotra wysyła pliki .md (i zdjęcia `NNNN_zdjecie_K.jpg`) z tylkoklockiblog@gmail.com na
`tylkoklockiblog+code@gmail.com`; zadanie „Skrzynka tekstów Piotra” (8:52 i 14:52) importuje je
`scripts/skrzynka-tekstow.py`, buduje i pushuje na main. Przy błędzie importu (surowy znacznik,
brak zdjęcia, brak opisu) albo buildu nic nie wchodzi, a mail wymienia problemy. Poprawka o tym
samym numerze zastępuje tekst pod tym samym adresem (rejestr `redakcja/skrzynka.json`, zasiany
tekstami 0022–0025 i Recenzje_011; data publikacji zostaje, dochodzi `zaktualizowano`).
**Automat nie dobiera galerii ani przycisków sklepów** — przy ważniejszych tekstach może je
dołożyć sesja ręcznie. IMAP/SMTP z kontenera są zablokowane, więc hasło aplikacji Gmail
(`TEKSTY_GMAIL_HASLO`) jest bezużyteczne — do odwołania w Google i usunięcia ze zmiennych.
Hasło do skrzynki Marek przekazuje Piotrowi SMS-em.

## 2026-10-23 · CODE · Kolejka indeksacji: błąd 500 z API nie przerywa już przeglądu

Nocny przebieg 23.10: pierwszy błąd `500 Internal error` z URL Inspection API przerywał cały przegląd
(0 sprawdzeń → pusta kolejka „wszystko w indeksie”, runner słusznie jej nie commitował; druga próba dała
70 sprawdzeń i 9 adresów). Teraz: 5xx/429 ponawiane 3 razy z przerwą, pojedynczy błędny adres pomijany,
przerwanie dopiero gdy cała partia pada; przy 0 sprawdzeń skrypt nie zapisuje kolejki (kod 4).
Uwaga runnera o hubach 76969 i 10311 („Excluded by noindex”) była fałszywym alarmem: to stary odczyt Google,
w serwisie oba huby są już indeksowalne (karty P07) — kolejka dopisuje teraz przy takim adresie wyjaśnienie.

## 2026-10-23 09:05 · ŁOWCA · Do zrobienia

**Nowa pozycja w podejrzanym rynku: 72151 Eevee na Ceneo za 44 zł przy RRP 249,99 (−82% — wygląda na błąd albo oszustwo; ta sama lista co 77076 z wpisu Radaru wyżej)**
**Mamy?** — tak: oferta w danych, strona ukrywa ją do potwierdzenia
**Zrobić:** — sprawdzić kartę oferty z maila i dopisać 72151 do `src/data/deale_potwierdzone.json` (niemal na pewno odrzucone)
**Kto:** — Marek (decyzja)
→ zamknięte 23.10: Marek olał — 72151 (44 zł, Ceneo) w odrzuconych `deale_potwierdzone.json`, oferta ukryta

**40816 Dekoracyjna Pisanka wróciła do maila: Media Expert 29,99 zł przy RRP 81,99 (−63%, poniżej odrzuconych 38 zł z Allegro; tym razem zwykły sklep — wygląda na realną wyprzedaż końcówek)**
**Mamy?** — tak: oferta w danych, strona ukrywa ją do potwierdzenia
**Zrobić:** — sprawdzić kartę ME z maila i dopisać 40816 do `src/data/deale_potwierdzone.json` (potwierdzone albo ponownie odrzucone)
**Kto:** — Marek (decyzja)
→ zamknięte 23.10: Marek potwierdził — 40816 (29,99 zł, ME) w potwierdzonych, oferta wraca do tabel

## 2026-10-23 08:10 · RADAR · Do zrobienia

**faniklockow.pl · 22.10** — Opisali 77076 Durrr Burgerownia za 89 zł w Media Expert z tytułem „to nie błąd cenowy"; tę samą ofertę mamy w `oferty_feed.json` z datą 22.10, czyli z dnia ich publikacji.
**Mamy?** — nie na stronie: sito „podejrzany rynek" trzyma ją poza serwisem, bo 89 zł to 64% poniżej potwierdzonej ceny katalogowej 249,99 zł, a próg wynosi 50%. Sprawdzone na produkcji dzisiaj: `/zestaw/77076/` pokazuje „od 162,99 zł" i sześć sklepów, Media Expertu wśród nich nie ma. Oferta jest na liście porannego maila (`podejrzany-rynek-mail.mjs`, dziś 8 pozycji, 77076 trzecia).
**Zrobić:** — otworzyć kartę Media Expertu i jednym zdaniem w rozmowie z Code potwierdzić albo odrzucić („potwierdzam 77076 89 mediaexpert"); po potwierdzeniu oferta wraca na stronę tego samego dnia. Ich zdanie „to nie błąd cenowy" nie zastępuje tego kroku — reguła z 16.09 mówi, że kartę sklepu otwiera człowiek.
**Kto:** — Marek (decyzja)
→ zamknięte 23.10.2026: Marek — „burgerownia jest po 170 w Media Ekspert". Oferta 89 zł **odrzucona**,
dopisana do `deale_potwierdzone.json` w sekcji `odrzucone`; zostaje ukryta, a poranny mail przestaje
o nią pytać (wróci tylko przy cenie niższej niż 89 zł). Reguła z 16.09 zadziałała dokładnie tak, jak
miała — i to jest tu najważniejsze: **nagłówek konkurencji „to nie błąd cenowy" nie przeszedł naszego
sprawdzenia.** Przy ich tekstach dealowych kwota jest twierdzeniem do weryfikacji, nie faktem, nawet
gdy zapewniają, że sprawdzili. Zapisane też w `konkurencja_baza.json` przy tym wpisie (ocena LUKA → NOTUJEMY).

Kontekst, żeby decyzja nie wyglądała na formalność: ta sama lista ma dziś 29,99 zł za 75372 na Allegro
i 44 zł za 72151 u Ceneo — pozycje, które wyglądają jak śmieć i dla których sito powstało. Różnica
między nami a konkurencją nie jest w danych ani w szybkości, tylko w tym, że u nas między ofertą
a stroną stoi człowiek. To koszt reguły, nie jej błąd.

## 2026-10-23 05:20 · SCOUT · Do zrobienia

**Cztery zestawy LEGO Education Science są w zwykłej sprzedaży detalicznej, a nasza reguła „LEGO Education nie wchodzi do `sety.json`" zakłada kanał szkolny: 45200 Moon Mission i 45201 Antarctic Animals po 209,99 zł, 45202 Mars Mission i 45203 Arctic Animals po 419,99 zł, w feedzie od 20.10.2026.**
**Mamy?** — nie: żaden z nich nie ma wpisu w `sety.json` ani podstrony `/zestaw/`, a `katalog.json` ma je z polskimi cenami, więc co przebieg wracają na listę luk rocznika 2026.
**Zrobić:** — jedna decyzja: czy zestawy Education sprzedawane detalicznie dostają wpisy w `sety.json` (wtedy dołożę te cztery), czy zostają poza serwisem (wtedy kolejka redakcyjna powinna pomijać theme Education, co jest zadaniem dla Code).
**Kto:** — Marek (decyzja)
→ zamknięte 23.10.2026: decyzja Marka — „dopisz te cztery Education do sety.json". Wpisy założone
  z polskimi nazwami (Zestaw naukowy z misją na Księżyc / ze zwierzętami Antarktydy / z misją na Marsa /
  ze zwierzętami Arktyki), cenami 209,99 / 209,99 / 419,99 / 419,99 zł i wiekiem 8+/7+/9+/9+.
  W `katalog.json` przeniesione z kubełka „Archiwum" do nowej serii „Education", żeby oba pliki
  mówiły to samo; liczba pozycji katalogu bez zmian. Nowa strona `/serie/education/`.

Dowód z tego przebiegu — Brickset, karty 45200–45203: theme Education, subtheme Science,
availability „Retail - limited", premiera 20.01.2026, ceny niemieckie 49,99 / 49,99 / 99,99 / 99,99 euro.

## 2026-10-22 · CODE · Dwa teksty Piotra (.md): NINJAGO styczeń 2027 i recenzja 75439

Pierwszy import przez `import-artykul-md.py` (blok danych → frontmatter, znaczniki → linki i tabela cen).
Dopisane: FAQ (po 3), tagi; w recenzji 4 zdjęcia z galerii 75439 i linki do recenzji 75438 i huba 75304;
w NINJAGO link do /przecieki/.
- `/artykuly/lego-ninjago-styczen-2027-przecieki/` (Aktualności, okładka 71875)
- `/artykuly/lego-75439-popiersie-dartha-vadera-recenzja/` (Recenzje)
**Stan:** na main.

## 2026-10-22 · CODE · Karty P07 Piotra: partie 14–15 (50 kart) wgrane

karty_setow 1424 → 1474, wszystkie 50 hubów indeksowalnych. Blokada RRP 42621: Piotr 429,99 vs katalog 449,99 —
zklockow.pl i promoklocki.pl potwierdzają 429,99, dopisane do `rrp_potwierdzone.json`. Elementy: 43242
(Piotr 2228 vs 2208) i 5009005 (152 vs 150) — zostaje katalog.
**Stan:** na main.

## 2026-10-22 06:50 · SCOUT · Ceny polskie 67006 i 71873

**Oba zestawy z jesiennej partii, które czekały na polską cenę katalogową, mają ją na kartach lego.com/pl-pl: 67006 Panorama uniwersum Marvela — 429,99 zł (przedsprzedaż), 71873 Cole kontra Zły Cole ze spinnerem — 41,99 zł (wkrótce dostępne, 1 stycznia 2027).**
**Mamy?** — teraz tak: ceny w `sety.json` (oba) i `katalog.json` (67006; 71873 w katalogu jeszcze nie ma, doda go zaciąg z Rebrickable). Huby pokazują 429,99 zł i 41,99 zł.
**Zrobić:** — nic.
**Kto:** — Scout (zrobione).

- 429,99 zł dla 67006 wisiało od 19.10 w tabeli `/zapowiedzi-lego-2027/`, ale nigdy nie trafiło do danych —
  strona mówiła prawdę, hub nie miał ceny. **Wniosek:** cena wpisana w artykule nie jest ceną w bazie;
  jeśli research daje polskie RRP, idzie ono do `sety.json` w tym samym przebiegu.
- Nazwy zrównane z nazwami producenta: „Panorama Marvela" → „Panorama uniwersum Marvela",
  „Cole kontra Zły Cole — atak spinnera" → „…ze spinnerem" (nasze tłumaczenie niemieckiego „Spinner").
  Poprawione w `sety.json`, `przecieki.json` i w tabeli `/zapowiedzi-lego-2027/`; w datowanym logu
  `known_sets.json` zostaje stara nazwa, bo to zapis stanu z 09.10.
- Próg zakupu 67006 postawiony na 370 zł (429,99 zł katalogowo, 34 gr/element).

## 2026-10-22 08:10 · RADAR · Do zrobienia

**fanklockow.pl · 21.10** — Uruchomili na swoim Discordzie kanał ze statusami zestawów z lego.pl; pierwszy raz serwis redakcyjny z naszej piątki wchodzi w powiadomienia o dostępności.
**Mamy?** — częściowo: mamy i dane (`lego_pl_etykieta`, `wyprzedaneWLego`, plakietka „wyprzedane" na hubach od 17.10), i własny kanał („Obserwuj zestaw", double opt-in, `scripts/alerty-cen.mjs`) — ale alerty są wyłącznie cenowe (20% pod katalog albo rekord) i dokładnie to obiecuje formularz na hubie. Zmiana dostępności nie wywołuje u nas niczego.
**Zrobić:** — decyzja, czy „Obserwuj zestaw" ma wysyłać też alert o powrocie do sprzedaży lub wyprzedaniu; na „tak" zmienia się treść obietnicy w `ObserwujCene.astro` i trzeba o tym napisać zapisanym, bo zgodzili się na alerty cenowe.
**Kto:** — Marek (decyzja)
→ zamknięte 22.10.2026: Marek — „nie dodawaj alertu o dostępności". Nic nie zmieniam w kodzie;
`alerty-cen.mjs` i formularz zostają cenowe. W `konkurencja_baza.json` ocena tego wpisu zmieniona
z LUKA na NOTUJEMY, żeby ani Radar, ani Kontroler nie wracali z tym co tydzień.

Dlaczego to decyzja, a nie zadanie dla Code: dane i mechanizm są gotowe, kosztem jest liczba maili
i wiarygodność obietnicy, którą złożyliśmy ludziom zapisującym się na alerty. Technicznie to kilka
linii w `alerty-cen.mjs`.

Przy okazji poprawiona własna stara ocena w `konkurencja_baza.json`: wpis zklockow z 24.09 o prezentach
pod choinkę stał jako LUKA, a lukę zamknęliśmy 07.10 stroną `/prezentowniki/prezenty-pod-choinke/`.
Zmienione na PRZEBIJAMY, żeby Kontroler nie zbierał zamkniętego zadania. Dzisiejszy tekst faniklockow
o prezentach świątecznych to drugi serwis na tej frazie — tamten sygnał z września był trafny.

## 2026-10-21 09:00 · ŁOWCA · Do zrobienia

**Nowa pozycja w podejrzanym rynku: 21268 Dom prosiaczka na Ceneo za 40 zł przy RRP 81,99 (−51%)**
**Mamy?** — tak: oferta w danych, strona ukrywa ją do potwierdzenia
**Zrobić:** — sprawdzić kartę oferty z maila podejrzanego rynku i dopisać 21268 do `src/data/deale_potwierdzone.json` (potwierdzone albo odrzucone)
**Kto:** — Marek (decyzja)
→ zamknięte 21.10: Marek potwierdził, 21268 (40 zł, Ceneo) w `deale_potwierdzone.json` — oferta wraca do tabel cen

## 2026-10-21 · CODE · Okno 20–27.10 w kalendarzu i progi w hubach

- `/kalendarz-promocji-lego/` — nowa sekcja `#pazdziernik-kumulacja` z tabelą trzech progów
  (30717 od 165 zł, 40916 od 625 zł, 40765 od 670 zł w Star Wars, 20–27.10), wpis na szczycie
  listy „co trwa teraz", wiersz w tabeli rytmu okien i `zaktualizowano: 2026-10-21`.
  Okno 13–19.10 przestawione z „trwa" na „zamknięte" w obu miejscach.
- **Policzone, nie przepisane:** przy progu 670 zł w Star Wars sprawdziłem 69 zestawów tej serii
  z bieżącego listingu lego.com, które mają u nas cenę katalogową i ofertę zewnętrzną (po sicie
  domu: bez Ceneo, bez ofert poniżej połowy katalogu). **67 z 69 jest tańszych poza LEGO.com,
  mediana różnicy 30%** — czyli koszyk za 670 zł to około 200 zł dopłaty, a upominek wyceniony
  na 129,99 zł tego nie pokrywa. Sześć zestawów, przy których LEGO.com nie przepłaca (75457, 75461,
  75367, 75459, 75458, 75415), wymienione w tekście jako jedyny sensowny sposób zagrania tego okna.
- `sety.json` 1205 → 1207: dołożone 30717 i 40765, których nie było wcale (huby stały jako lekkie,
  z katalogu). 40765 dostał cenę katalogową 129,99 zł — jest na karcie produktu lego.pl, więc
  reguła „gratis bez polskiej wyceny ma kreskę" go nie dotyczy. 30717 kreskę zostaje: LEGO nie
  podaje jego wartości w złotych. 40916 — dopisany polski próg do istniejącego opisu.
- Build 10061 stron; progi widoczne na hubach 30717, 40916 i 40765.
- Zamyka pozycję Radaru z 21.10 i pytanie Scouta o progi (jego wpis ma linię ↻ z liczbami).
- **Naprawa własnej szkody, zanim ktokolwiek ją zauważył.** Mój pierwszy commit (`6da26e0`) wylądował
  nad commitem Scouta `f2cb67c`, który godzinę wcześniej, z decyzji Marka, wpisał 30717 cenę katalogową
  16,49 zł do `katalog.json`. Nie nadpisałem tej liczby — zgasiłem ją inaczej: mój nowy wpis 30717
  w `sety.json` miał `bez_rrp`, a `cenaKatalogowaSetu()` w `src/lib/oferty.js` zwraca `null`, gdy
  `bez_rrp` stoi w którymkolwiek pliku („bez_rrp wygrywa z każdą liczbą", audyt 12.10). Hub
  `/zestaw/30717/` przestał więc pokazywać 16,49 zł — sprawdzone w zbudowanym HTML, nie z założenia.
  Poprawione: `bez_rrp` usunięte, `cena_katalogowa` w `sety.json` zostaje pusta, więc łańcuch spada
  do `katalog.json` i liczba Scouta znów jest jedynym domem tej ceny. Teksty 30717 i akapit w kalendarzu
  przepisane — mówiły, że LEGO nie wycenia szkieltu w złotych, a wycenia.
- **Wniosek na przyszłość:** zakładając wpis w `sety.json` dla gratisu, sprawdź najpierw `katalog.json`.
  `bez_rrp` to nie opis, to wyłącznik ceny na hubie i działa między plikami.
↻ 22.10.2026: 16,49 zł wpisane też do `sety.json` (polecenie Marka) — oba pliki mówią teraz to samo,
  a 30717 schodzi z listy luk katalogu (9 → 8). Z `opis` usunięte zdanie o tym, skąd hub bierze cenę:
  to nasz proces, nie informacja dla kupującego.

## 2026-10-21 07:40 · SCOUT · Do zrobienia

**Siedem saszetek, które mają w `sety.json` flagę `bez_rrp` z powodem „LEGO nie sprzedaje jej w polskim sklepie", ma na lego.com/pl-pl karty produktowe z cenami: 30714 — 16,49 zł, a 30715, 30722, 30723, 30724, 30728 i 30735 po 16,99 zł (sprawdzone Firecrawlem 21.10.2026, karty z polskimi nazwami zgodnymi z naszym katalogiem).**
**Mamy?** — częściowo: huby `/zestaw/30714/` … `/zestaw/30735/` pokazują kreskę w polu ceny katalogowej, więc oferty 10–19 zł nie mają punktu odniesienia i nie liczymy rabatu
**Zrobić:** — jedna decyzja: czy wpisać te ceny do `katalog.json` (jak przy 30717) i co zrobić z `bez_rrp` — zdjąć czy przepisać powód; wszystkie siedem kart ma w metadanych „out of stock", więc „LEGO nie sprzedaje" może być prawdą o dostępności, nie o cenie
**Kto:** — Marek (decyzja)
→ zamknięte 22.10.2026: Marek zdecydował „wpisz ceny i zdejmij bez_rrp z tych siedmiu". Ceny wpisane
  w `sety.json` i `katalog.json` (30714 — 16,49 zł, pozostałe sześć po 16,99 zł), `bez_rrp` zdjęta
  w `sety.json` — w `katalog.json` tej flagi te saszetki nigdy nie miały. Huby liczą rabat
  (`/zestaw/30714/` −15/−16%, `/zestaw/30735/` −21/−38%). Flag `bez_rrp` w `sety.json`: 12 → 5.

## 2026-10-21 08:15 · RADAR · Do zrobienia

**faniklockow.pl · 20.10** — Opisali nową kumulację na lego.pl: trzy gratisy naraz, 20–27.10 — od 165 zł polybag 30717, od 625 zł 40916 Kwiatowa ramka na zdjęcia, od 670 zł w Star Wars 40765 Ośrodek szkoleniowy na Kamino. Progi i daty sprawdziłem u źródła na `lego.com/pl-pl/page/lego-offers-promotions` — zgadzają się co do złotówki i co do dnia.
**Mamy?** — nie: `/kalendarz-promocji-lego/` (zaktualizowano 16.10) nie ma tego okna wcale, a w liście „co trwa teraz" trzyma okno 13–19.10 ze statusem „trwa" dwa dni po jego zamknięciu.
**Zrobić:** — dopisać do `/kalendarz-promocji-lego/` sekcję okna 20–27.10 z trzema progami i zamknąć status okna 13–19.10; przy okazji wpisać progi do hubów 30717, 40916 i 40765 (zamyka dzisiejszą pozycję Scouta).
**Kto:** — Code (dane, strona)
→ zamknięte 21.10.2026: zrobione tego samego dnia. Szczegóły w następnym wpisie.

Uwaga do protokołu, bo to drugi raz: lista „co trwa teraz" pokazała zamknięte okno jako trwające —
pierwszy raz zanotowane 08.10 (wrześniowe gratisy wisiały dziewięć dni po czasie). Pojedyncza poprawka
tego nie rozwiąże. Wniosek: okna w kalendarzu mają daty końca, więc status „trwa" da się policzyć
z danych zamiast trzymać go ręcznie — do rozważenia osobno, nie w tym przebiegu.

## 2026-10-21 05:25 · SCOUT · Do zrobienia

**W sklepie LEGO trwa akcja z trzema gratisami 20–27 października 2026: 30717 szkielet od 40 euro, 40916 kwiatowa ramka od 150 euro i 40765 Ośrodek szkoleniowy na Kamino od 160 euro przy zakupach Star Wars — StoneWars pisze, że Kamino jest tylko w Niemczech, nie w Austrii i Szwajcarii.**
**Mamy?** — częściowo: 40916 ma hub z ceną 109,99 zł i dopisanym zdaniem o powrocie do akcji, ale progów dla polskiego sklepu nie znamy
**Zrobić:** — wejść na lego.pl i sprawdzić, czy akcja obowiązuje w Polsce i z jakimi progami w złotych (trzy gratisy czy mniej, do kiedy); wynik podać numerami, żebym wpisał go do hubów 30717, 40916 i 40765
**Kto:** — Cowork (przeglądarka)
↻ 21.10.2026 08:15 (Radar): progi sprawdzone u źródła na `lego.com/pl-pl/page/lego-offers-promotions`,
bez przeglądarki — akcja obowiązuje w Polsce, trzy gratisy, **20–27 października 2026**: od **165 zł**
30717 Śmieszny halloweenowy szkielet, od **625 zł** 40916 Kwiatowa ramka na zdjęcia, od **670 zł**
w zestawach Star Wars 40765 Ośrodek szkoleniowy na Kamino. Zadanie dla Coworka zbędne; zostaje wpisanie
tych liczb do hubów 30717, 40916 i 40765 — Kto: Code (dane).
→ zamknięte 21.10.2026: sprawdzone bez Coworka, kartami produktowymi lego.com/pl-pl przez Firecrawl
(serwer dostaje 403). Akcja JEST w Polsce, wszystkie trzy gratisy, progi w złotych: 30717 od 165 zł
(wartość 16,49 zł), 40916 od 625 zł (109,99 zł), 40765 od 670 zł wydanych na Star Wars (129,99 zł).
Kamino, o którym StoneWars pisał, że nie ma go w Austrii i Szwajcarii, w polskim sklepie jest.
Wpisane: polski próg w opisie 40916, źródło ceny 40916 i 40765 przepisane z promoklocki na kartę
producenta (ta sama kwota, pewniejsze źródło). Ceny 40916 — 109,99 zł — producent potwierdził co do
grosza, czyli wycena z promoklocki wpisana 15.10 była trafna.

## 2026-10-21 07:10 · SCOUT · Do zrobienia

**Karta 30717 na lego.com/pl-pl podaje wartość upominku 16,49 zł, a u nas ten zestaw ma w `katalog.json` cenę pustą i `bez_rrp` z powodem „LEGO nie sprzedaje jej w polskim sklepie" — saszetki były wyłączone z Twojej decyzji z 15.10 o wycenach gratisów.**
**Mamy?** — częściowo: hub `/zestaw/30717/` pokazuje oferty 14–17 zł, w polu ceny katalogowej kreskę, a producent ma dla niego kwotę
**Zrobić:** — jedna decyzja: czy saszetki rozdawane jako gratis dostają wycenę dodatku z karty lego.pl (dla 30717 byłoby to 16,49 zł), czy zostają bez ceny jak pozostałe sześć polybagów
**Kto:** — Marek (decyzja)
→ zamknięte 21.10.2026: decyzja Marka — 30717 dostaje wycenę 16,49 zł. Wpisane do `katalog.json`
(`cena_zrodlo`: karta produktu lego.com/pl-pl). Sprostowanie do mojego zdania wyżej: 30717 nie miał
`bez_rrp` w żadnym pliku — to pozostałe sześć saszetek (30714, 30715, 30722, 30723, 30724, 30728, 30735)
je ma, a 30717 miał po prostu pustą cenę. Tych sześciu decyzja nie dotyczy i zostają bez zmian.
Hub `/zestaw/30717/` pokazuje teraz cenę katalogową 16,49 zł obok ofert 14–17 zł, więc widać, że rynek
schodzi poniżej wyceny producenta.

## 2026-10-20 13:05 · KONTROLER · Do zrobienia

**Pierwszy przebieg „Kontrola linków w przeglądarce" (`trig_01NRYdRPRMVTYZTGDf5C8iH6`) ma status SUCCEEDED, ale trwał 28 sekund (11:45:46–11:46:14) — za krótko na otwarcie 20 kart sklepów.**
**Mamy?** — częściowo: lista na 20.10 była świeża (`ddf9050`, 07:49), więc „lista nieaktualna" odpada; najpewniej sesja nie załadowała narzędzi Chrome i zgodnie z promptem zakończyła jednym zdaniem — ale tej odpowiedzi z sesji Kontrolera nie widać.
**Zrobić:** — wkleić do sesji Kontrolera odpowiedź tego zadania z Coworka (choćby jedno zdanie); jeśli brzmi „przeglądarka nieosiągalna" — sprawdzić w Claude Desktop, czy zadanie jest przypięte do komputera i czy rozszerzenie Claude in Chrome było włączone o 11:45.
**Kto:** — Marek (komputer)
↻ 20.10.2026 13:20: Marek wkleił odpowiedź zadania — „Nie dało się połączyć z przeglądarką (…) To uruchomienie
szło w chmurze, bez dostępu do Twojego komputera, i narzędzia Claude in Chrome się nie załadowały. W repo nic się nie
zmieniło. Żeby kolejne uruchomienia działały, otwórz to zadanie w aplikacji Claude na komputerze z Chrome i włącz
«Require this computer»." Czyli zadanie założone z panelu NIE dostało powiązania z komputerem — to osobny przełącznik.
Nowe Zrobić: w Claude Desktop na Macu otworzyć zadanie „Kontrola linków w przeglądarce" i włączyć „Require this
computer"; potem test ręczny (Kontroler może odpalić `fire_trigger` na prośbę — lista z 20.10 jest świeża), żeby nie
czekać do 20.11. Kto: Marek (komputer).
→ zamknięte 20.10.2026: Marek włączył „Require this computer" (12:43) i uruchomił zadanie z Maca — **żywe 19,
404 0, przekierowania 0, inne 1 z 20** (Allegro 10416: „Sprzedaż zakończona", oferta z dzisiejszego feedu).
Wynik: `materialy/kontrola-przegladarkowa/wyniki-2026-10-20.md`. Uruchomienie z chmury (`fire_trigger`) nie niesie
podpisu komputera i idzie bez przeglądarki — test ręczny robi się z aplikacji na Macu. Następny przebieg 20.11 11:45.

**`redirects.allegro` ma 1 048 z 7 201 wpisów bez oferty Allegro w dzisiejszym feedzie — ich linki nikt nie odświeża od dnia, w którym zestaw wypadł z feedu; dzisiejsza próba 4 linków Allegro trafiła wyłącznie w zestawy z bieżącą ofertą.**
**Mamy?** — częściowo: kontrola miesięczna działa, ale losuje z całej mapy, więc o 1 048 wpisach z ryzykiem nadal nic nie wie.
**Zrobić:** — w `scripts/kontrola-linkow.mjs --blokujace` losować Allegro spośród wpisów BEZ bieżącej oferty w `oferty_feed.json` (tam kryją się martwe), resztę sklepów jak dotąd; przy następnej liście 20.11.
**Kto:** — Code (skrypt)
→ zamknięte 20.10.2026: decyzja Marka — zrobione. `--blokujace` losuje Allegro wyłącznie spośród wpisów bez bieżącej oferty Allegro w feedzie (1 048 z 7 201), z powrotem na całość, gdy takich zabraknie; w nagłówku listy stoi, skąd losowano. Pierwsza taka lista: 20.11.

## 2026-10-20 · CODE · Karty P07 Piotra: partia 08 (25 kart, ostatnia paczka) wgrana

karty_setow 1399 → 1424, 0 blokad, bez różnic elementów; 24 karty jednoakapitowe.
**Stan:** na main.

## 2026-10-20 · CODE · Karty P07 Piotra: partie 09–13 (125 kart) wgrane

karty_setow 1274 → 1399, 0 blokad (RRP zgodne), wszystkie 125 hubów indeksowalnych po buildzie
(66 kart jednoakapitowych łapie reguła długości opisu z 18.10). Elementy: 14 różnic 1–16 szt. — zostaje
liczba z katalogu. 6 kart bez liczby elementów (breloki 854xxx, minifigurki 71046, 5009550).
**Stan:** na main.

## 2026-10-20 09:10 · CODE · Trzy teksty Piotra: upominki LEGO.pl, 11390 Dragon Ball, Star Wars styczeń 2027

**Zrobione:** teksty bez zmian, dopisane frontmattery, FAQ, linki serii w miejsce znaczników.
- `/artykuly/lego-pl-upominki-30717-40916-40765-pazdziernik-2026/` (Aktualności, `wazne_do` 27.10, galeria 3 upominków).
- `/artykuly/lego-11390-dragon-ball-shenron-goku-premiera/` (Premiery): galeria 8 zdjęć z lego.com w `galerie.json`,
  od razu w R2; tabela cen w miejsce znacznika cen.
- `/artykuly/lego-star-wars-styczen-2027-przecieki/` (Aktualności): okładka poglądowa 75301 z opisem, że to nie zestaw
  z przecieku; link do /przecieki/.
**Stan:** na main.

## 2026-10-20 09:10 · CODE · Do zrobienia

**Tekst Piotra o Star Wars na styczeń 2027 i `przecieki.json` różnią się przy dwóch zestawach: 75474 Master Yoda (Piotr: 1200 el., 149,99 €, 1.01.2027; u nas: bez elementów, 550 zł, 2027-04) i powiększonym Luke’u (Piotr: 75483, nowsze listy; u nas: 75482).**
**Mamy?** — częściowo: oba w `przecieki.json`, tekst Piotra opisuje rozbieżność list
**Zrobić:** — sprawdzić u źródeł i zaktualizować wpisy 75474 i 75482/75483 w `src/data/przecieki.json` (dopisać źródła, nie kasować wpisu)
**Kto:** — Scout (następny przebieg)

## 2026-10-20 09:05 · ŁOWCA · Do zrobienia

**Nowa pozycja w podejrzanym rynku: 77253 Bugatti Vision GT na Ceneo za 57,32 zł przy RRP 114,99 (−50%)**
**Mamy?** — tak: oferta w danych, strona ukrywa ją do potwierdzenia
**Zrobić:** — sprawdzić kartę oferty z maila podejrzanego rynku i dopisać 77253 do `src/data/deale_potwierdzone.json` (potwierdzone albo odrzucone)
**Kto:** — Marek (decyzja)
→ zamknięte 20.10.2026: Marek potwierdził (oferta Allegro widoczna przez Ceneo), wpis w `deale_potwierdzone.json`.
↻ 21.10: Marek zmienił werdykt na „olej" (czat Łowcy) — 77253 przeniesiony do odrzuconych, oferta ukryta

## 2026-10-20 05:45 · DANE WT · Do zrobienia

**Feed MediaMarkt (Tradedoubler) zawiera 2 pozycje, które skrypt pominął jako spoza katalogu albo niezgodne z nazwą: 76265 „Klocki LEGO Marvel Figurka Kapitana Ameryki do zbudowania" i 52447 „Klocki LEGO Classic Kwadratowy Notatnik czarny z długopisem".**
**Mamy?** — częściowo: numery i nazwy z feedu, nie ma ich w `katalog.json`
**Zrobić:** — sprawdzić oba numery (czy to realne numery LEGO) i dopisać do `potwierdzone_numery` w `src/data/feedy.json`, jeśli poprawne
**Kto:** — Code
↻ 2026-10-27: nadal aktualne — te same 2 numery wciąż pomijane w zrzucie MediaMarkt.

**Zestaw 71835 ma ofertę Lidl (59,99 zł, zrzut 19.10) w `oferty_feed.json`, ale nie ma wpisu w `katalog.json` i nie ma zdjęcia (Rebrickable/Brickset nie mają go pod tym numerem).**
**Mamy?** — nie: brak huba i brak zdjęcia, strona zestawu nie istnieje
**Zrobić:** — sprawdzić numer 71835 (czy to LEGO i jaka seria) i dopisać do katalogu albo do `katalog-z-rebrickable.mjs` przy następnym przebiegu
**Kto:** — Code
↻ 2026-10-27: nadal aktualne — ta sama cena 59,99 zł (zrzut 26.10), wciąż bez huba i zdjęcia.

**18 zestawów ma flagę `ekskluzyw: true` w `sety.json`, ale tegotygodniowy listing lego.pl nie pokazał etykiety „Ekskluzywne" przy nich (2 nowe od zeszłego tygodnia: 72156, 40924; pozostałe 16 — w tym 77264 i 10367 z zeszłego tygodnia — nadal niesprawdzone).**
**Mamy?** — tak: adresy kart produktu w `redirects.lego`
**Zrobić:** — sprawdzić wszystkie 18 numerów (21373 31221 76355 76476 11386 40858 40872 43026 40919 40859 21369 11385 40975 40880 77264 10367 72156 40924) na kartach produktu lego.pl i zdjąć flagę `ekskluzyw` w `sety.json` tam, gdzie etykiety już nie ma (jak 29.09 dla 76354/80121/80120)
**Kto:** — Code
↻ 2026-10-27: nadal aktualne, i lista narosła — teraz 36 numerów (wszystkie 18 z zeszłego tygodnia nadal na niej, plus 18 nowych: 10338 76437 76294 75192 21353 10326 75397 10337 43263 10341 75367 10334 10323 21356 10459 71814 10458 40881), a licznik „ekskluzywne" na listingu spadł 116→75. Skok wystarczająco duży, żeby sprawdzić, czy lego.pl nie zmieniło sposobu pokazywania etykiety, zanim ktoś ręcznie przejdzie całą listę.
→ zamknięte 2026-10-27 (ten przebieg, na żądanie Marka): sprawdzone wszystkich 36 numerów kartami produktu lego.pl (Firecrawl). 33/36 nadal ma etykietę „Ekskluzywne" na karcie — skok 116→75 to fałszywe alarmy skanera listingu (duże zestawy UCS/Icons jak Sokół Millennium 75192 też są ekskluzywne LEGO.com, listing czasem gubi etykietę pod inną, np. „Ostatnie zestawy"), nie zmiana układu strony. 3/36 faktycznie straciło etykietę: **77264** (Jaguar Project 7 / Land Rover Defender), **10367** (Władca Pierścieni: Book nook z Balrogiem), **72156** (SMART Play ze Squirtle) — flaga zdjęta w `sety.json` (commit tej sesji). Nowa rozbieżność z kolejnych przebiegów Dane wt wraca jako osobny wpis.

## 2026-10-20 05:25 · SCOUT · Do zrobienia

**LEGO otworzyło w swoim sklepie strony akcji i podało terminy: Insiders Weekend 21–22 listopada 2026, Black Friday od 27 listopada, Cyber Monday 30 listopada (PromoBricks, 19.10).**
**Mamy?** — nie: w dziale Artykuły nie ma kalendarza listopadowych akcji, a to najmocniejszy tydzień zakupowy roku
**Zrobić:** — tekst w kategorii Kalendarze z tymi trzema terminami i zasadą, że nowości wchodzące w to okno (np. zapowiadana na 27 listopada Godzilla 21375) nie mają rabatu, mimo że sklep jest przeceniony
**Kto:** — Piotr (tekst)
→ zamknięte 27.10.2026 (decyzja Marka): osobnego tekstu nie piszemy — wszystkie trzy terminy
i reguła o premierze bez rabatu są już w `/kalendarz-promocji-lego/` (sekcja `#listopad`:
Insiders Weekend ok. 21–26.11, Black Friday 27.11, Cyber Monday 30.11, plus akapit o 21375 Godzilli
wchodzącej do sprzedaży w dniu Black Friday). Strona aktualizowana 25.10.
Sprawdzenie przy zamknięciu (27.10, lego.com/pl-pl/page/lego-offers-promotions): polski sklep
**nadal nie podaje żadnych listopadowych terminów** — stoją tam tylko trzy okna gratisów do 27.10.
Nasze daty listopadowe zostają więc z plakietką „przewidywane”; wpis Scouta opierał się na
PromoBricks, nie na źródle producenta. Datowaną plakietkę zdejmiemy, gdy LEGO ogłosi terminy samo.

## 2026-10-19 · CODE · Strona główna: rotacja zestawów w slajderze i „Dziś w dobrej cenie”

Prośba Marka: codziennie inne zestawy. Każdy zestaw ma stałą grupę 0–2 (z numeru), dziś pierwszeństwo
ma jedna grupa, jutro następna — zestaw wraca najwcześniej po trzech dniach; inne grupy tylko na
dopełnienie pustych slotów. Wyjątek: zestaw z nowym minimum z dzisiejszych danych nadal ma pierwszeństwo
w swojej półce slajdera (to news). Symulacja 20–22.10: slajder 4 z 5 zestawów nowych co dzień, „Dziś
w dobrej cenie” 10–11 z 12 (przedział >1500 zł ma tylko kilka rabatów, tam powtórki zdarzają się).
Kod: `src/pages/index.astro` (`naZmianie`, `dzisNaZmianie`).

## 2026-10-19 15:10 · KONTROLER · Odczyt panelu GSC (Cowork) — punkt odniesienia kamienia 4

- **837 zaindeksowanych** (dane panelu z 12.10.2026; poprzednio 831 z 09.10, 807 z 18.09), niezaindeksowanych
  3 184: noindex **2 285**, wykryta–niezindeksowana **653** (weryfikacja „rozpoczęto"), zeskanowana–niezindeksowana
  **21** (weryfikacja „niepowodzenie" — ktoś ją odpalił, Google jej nie potwierdził), **404: 220**, robots.txt 4,
  przekierowanie 1. Odczyt Coworka 19.10 14:53, prompt z sesji Kontrolera.
- **404 — rozstrzygnięte:** 219 z 220 to nasze huby `/zestaw/`, nie stary sklep. Wszystkie istnieją w buildzie,
  produkcja odpowiada 200, wszystkie **noindex** (cienkie huby). Google skanował je 10–15.09, gdy stron jeszcze nie
  było, i nie wrócił. Nic do roboty — przy następnym crawlu 404 zamieni się w noindex. Lista:
  `materialy/indeksacja/gsc-404-2026-10-19.md`. Jeden adres spoza serwisu (`/p/64/3469/…html`, stary sklep) zostaje 404.
- Mapy witryny: 8 map, wszystkie „Sukces", `sitemap-zestawy.xml` odczytana 19.10 z 1 375 adresami (zgodnie
  z buildem), indeks 1 546. `sitemap-priorytet.xml` nie ma — zamknięte.
- Do obejrzenia kiedyś, nie teraz: 4 adresy „zablokowane przez robots.txt" — panel nie pokazał których.

## 2026-10-19 10:45 · CODE · x-kom Black Weeks: aktualność + ceny z kodem black-weeks1

- `/artykuly/x-kom-black-weeks-2026-lego/` (Aktualności, bez `wazne_do` — x-kom nie podał końca cen z listy;
  akcja do Black Friday 27.11). Mail SalesMasters 19.10: 11 zestawów „hero”. Karty x-kom sprawdzone ok. 10:30:
  4 z kodem black-weeks1 (11381 399, 31220 579, 21064 209, 60510 69,99 — wszystkie poniżej naszych minimów),
  3 „chwilowo niedostępne” (76473, 75447, 71497), 4 w zwykłej cenie bez kodu (10359, 21060, 43300, 71425).
- Dane: te 4 ceny w `sety.json`/`oferty_feed` (xkom) i nowe minima w `ceny_baza`; kod w `kody_rabatowe.json`
  (`xkom`, `koniec_znany: false`, `do` 2026-10-25 = horyzont do następnego zrzutu). Nowe: `terminKodu()` —
  kod bez daty końca nie pokazuje „do …”; `me-kody.mjs` nie kasuje już kodów innych sklepów.
**Dla drugiej strony:** zrzut x-kom 26.10 nadpisze te ceny; jeśli x-kom przedłuży kod, wystarczy przesunąć `do`.

## 2026-10-19 09:40 · KONTROLER · Do zrobienia

**Zrzuty Empiku i x-komu stoją na 12.10 — siódmy dzień; Empik 4 394 ceny, x-kom 735, obie partie z tej samej daty.**
**Mamy?** — częściowo: ceny są w danych serwisu, ale tygodniowe; przypomnienie poszło 19.10 o 08:15.
**Zrobić:** — uruchomić skill „klocki-zrzuty-tygodniowe" i wrzucić `lego-empik.json` oraz `lego-xkom.json` do sesji Code.
**Kto:** — Marek (przeglądarka)
→ zamknięte 19.10.2026: zrobione tego samego dnia o 09:25 PL (`6f3e53c`) — Empik 4 430 cen (+63 nowe), x-kom 726 cen, linki odświeżone. Raport Kontrolera opisywał stan z 07:09 UTC, czyli sprzed tego commita.

**Liczba zaindeksowanych stron z panelu GSC ma odczyt z 09.10 (831 zaindeksowanych, 3 181 nie) — 26.10 minie 17 dni, a API tej liczby nie podaje.**
**Mamy?** — nie: ostatni odczyt 09.10.2026 przez Coworka.
**Zrobić:** — odczytać raport „Strony" w panelu GSC przed 26.10 (zaindeksowane + podział niezaindeksowanych) i wpisać do dziennika.
**Kto:** — Marek (panel) albo Cowork (panel)
→ zamknięte 19.10.2026: odczyt Coworka 14:53 — 837 zaindeksowanych (dane z 12.10). Wpis wyżej w dzienniku; Kontroler 26.10 liczy kamień 4 od tej wartości.

**Łowca wypchnął kontrolę linków 19.10 o 09:14 PL — 14 minut po starcie Kontrolera; tabelę udało się przeczytać tylko dzięki drugiemu `git fetch` w trakcie przebiegu.**
**Mamy?** — częściowo: plik `materialy/kontrola-linkow-2026-10-19.md` jest w repo (`ae759a9`), ale powstał po godzinie, o której go czytam.
**Zrobić:** — przesunąć Łowcę z 08:30 na 08:00 PL albo Kontrolera z 09:00 na 09:30 (`trig_019xWfJ67XhPdnX6GknSYrb3` albo `trig_01KB8XkPcHyvc5kCRKEKYjri`).
**Kto:** — Marek (panel)
→ zamknięte 19.10.2026: decyzja Marka — Kontroler przesunięty na **pon 09:30** PL (`trig_01KB8XkPcHyvc5kCRKEKYjri`, `CRON_TZ=Europe/Warsaw 30 9 * * 1`, pierwszy przebieg 26.10 09:30; od 25.10 Polska na czasie zimowym). Łowca bez zmian o 08:30 — ma teraz godzinę zapasu. Ręczne wzmianki w `materialy/zadania-cykliczne.md` i `NARZEDZIA.md` poprawione; sekcję HARMONOGRAM przepisze sesja Code w poniedziałek.

**Sześć hubów działów ma crawl starszy niż 14 dni; `/serie/` i `/wycofania/` stoją na 15.09 (34 dni), a `/wycofania/` to największe źródło wyświetleń w serwisie (34 w 7 dni, pozycja 7,1).**
**Mamy?** — częściowo: runner „Kolejka indeksacji 01:57" chodzi codziennie, ale bierze wyłącznie huby `/zestaw/`.
**Zrobić:** — decyzja: czy jeden dzień w tygodniu kolejka oddaje 8 z 10 miejsc hubom działów (`/serie/`, `/wycofania/`, `/ekskluzywne/`, `/promocje-lego/`, `/przecieki/`, `/prezentowniki/`, `/aktualnosci/`, `/artykuly/`).
**Kto:** — Marek (decyzja)
→ zamknięte 19.10.2026: decyzja Marka — TAK. `kolejka-indeksacji.mjs` w poniedziałek (albo `--dzialy`)
sprawdza osiem hubów działów i te z crawlem ≥ 14 dni wstawia na początek kolejki ze znacznikiem
„ODŚWIEŻENIE" (do 8 z 15 miejsc; dziś 7 z 8 — `/artykuly/` ma crawl z 11.10). Kluczowe: kolejka dotąd
pomijała KAŻDY adres PASS, a prompt Coworka kazał nie klikać „jest w Google" — huby działów nie miały
prawa tam trafić. Oba miejsca poprawione: skrypt i prompt `trig_01NNqijkQrcpLpD89bVW8ST6`
(kopia w `materialy/indeksacja/cowork-zadanie.md`). Pierwszy poniedziałek z działami: 26.10 01:57,
Cowork klika o 10:24; efekt widać w inspekcji Kontrolera 26.10 (crawl powinien ruszyć z 15.09).

**Kamień 2 nie ma zapisanego kryterium: Ceneo ma 3 transakcje po 0,08 EUR, czyli formalnie „próbę większą niż jedna transakcja", a trzeci raport z rzędu podaje „1 sklep" na mocy uznania Kontrolera.**
**Mamy?** — nie: progu nie ma ani w promptach runnerów, ani w `_meta.decyzje` rejestru afiliacji.
**Zrobić:** — ustalić próg (propozycja Kontrolera: transakcja liczy się przy obrocie ≥ 10 EUR) i wpisać do `src/data/afiliacje_rejestr.json` → `_meta.decyzje`.
**Kto:** — Marek (decyzja)
→ zamknięte 19.10.2026: decyzja Marka — próg 10 EUR obrotu, zapisany w `afiliacje_rejestr.json` →
`_meta.decyzje.kamien_2_prog`. Kamień 2 = 1 sklep (Empik: 3 transakcje, 325,44 EUR w 60 dniach);
Ceneo CPS (3 × 0,08 EUR) nie wchodzi do próby. Kontroler liczy to z `prowizje-raport.mjs --dni 60`.

**Kontrola linków milczy o 46 ze 150 adresów (31%) — trzeci tydzień wzrostu (15% → 23% → 31%); x-kom sam wniósł 26 pozycji, wszystkie w „blokadzie sklepu", a cztery blokujące sklepy zebrały 67% polskich kliknięć.**
**Mamy?** — częściowo: kontrola chodzi co poniedziałek i mówi „martwych: 0", co przy 31% bez odpowiedzi jest mylące.
**Zrobić:** — wybrać A (Cowork raz w miesiącu sprawdza w przeglądarce 20 linków: x-kom, Empik, Media Expert, LEGO.com) albo B (losowanie próby pomija sklepy blokujące, żeby 150 adresów dawało 150 odpowiedzi).
**Kto:** — Marek (decyzja)
→ zamknięte 19.10.2026: decyzja Marka — **wariant A**. Raz w miesiącu Cowork sprawdza w przeglądarce
próbę 20 linków z czterech sklepów blokujących ruch serwerowy. `kontrola-linkow.mjs` zostaje bez zmian
(nadal pisze „blokada sklepu", nie „OK"). Wdrożenie rozbite na dwie pozycje poniżej.
↻ 19.10.2026 (po południu): decyzja Marka — x-kom dopisany do `SKLEPY_BLOKUJACE` w `scripts/linki-cel.mjs`
(wariant B obok A). Od 26.10 x-kom wchodzi do próby tygodniowej po 5 linków kontrolnych zamiast 26 swobodnych;
udział „nie wolno powiedzieć OK" powinien spaść z 31% do ok. 20%, a zwolnione miejsca idą do sklepów sprawdzalnych.

**Decyzja A wymaga listy do sprawdzenia w repo: dziś takiej listy nie ma, a Cowork nie czyta `redirects.json` sam.**
**Mamy?** — nie: `kontrola-linkow.mjs` losuje próbę w locie i nie zapisuje adresów blokujących sklepów do osobnego pliku.
**Zrobić:** — dodać do `scripts/kontrola-linkow.mjs` tryb `--blokujace <N>` (domyślnie 20), który losuje adresy z `redirects.xkom`, `redirects.empik`, `redirects.mediaexpert` i `redirects.lego` i zapisuje je jako `materialy/linki-do-przegladarki-RRRR-MM-DD.md` (numer zestawu, sklep, adres, kolumna na wynik) — bez wchodzenia na nie z serwera.
**Kto:** — Code (skrypt)
→ zamknięte 19.10.2026: tryb `--blokujace [N]` gotowy (`--sklepy a,b` zawęża, `--sucho` tylko drukuje).
Dołożone Allegro, którego w pozycji nie było, a którego kontrola też nie rozstrzyga (5 timeoutów 19.10) —
lista obejmuje pięć sklepów po równo, karuzelą, więc x-kom z 788 linkami nie zjada całej próby.
Nowa stała `SKLEPY_BEZ_WERYFIKACJI` w `scripts/linki-cel.mjs` (te cztery blokujące plus `xkom`) jest
używana WYŁĄCZNIE przez ten tryb — `SKLEPY_BLOKUJACE` steruje losowaniem próby tygodniowej i zostaje
nieruszone, żeby wynik kontroli tydzień do tygodnia był porównywalny. Pierwsza lista:
`materialy/linki-do-przegladarki-2026-10-19.md` (20 adresów). Tryb nie wysyła żadnego zapytania —
sprawdzone na sucho; adresy w pliku to cele sklepów, nigdy trackery ani nasze `/idz/`.

**Po liście potrzebny jest comiesięczny Routine Coworka, który tę listę przechodzi w przeglądarce.**
**Mamy?** — nie: zadanie nie istnieje; wzorem jest „Kolejka GSC — zgłoszenia" (`trig_01NNqijkQrcpLpD89bVW8ST6`), też robota Coworka w przeglądarce.
**Zrobić:** — po oddaniu trybu `--blokujace` założyć Routine „Kontrola linków w przeglądarce" (raz w miesiącu, Cowork): otwiera najnowszy `materialy/linki-do-przegladarki-*.md`, wpisuje wynik per adres (żywy / 404 / przekierowanie) i oddaje plik do sesji Code; martwe linki Empiku idą do `scripts/empik-redirects.mjs --usun-martwe`.
**Kto:** — Marek (panel) — po wykonaniu pozycji dla Code
→ zamknięte 19.10.2026: założone, ale jako DWA zadania, nie jedno — listę umie zrobić tylko sesja
z repo, a sprawdzić tylko sesja z przeglądarką. 1. dnia miesiąca: **07:49** Kontroler losuje 20 adresów
i pushuje `materialy/kontrola-przegladarkowa/lista.md` (`trig_01EePabyXvKUkSkb4bjMoayw`), **11:47** świeża
sesja przechodzi listę w Chrome (`trig_01Umoo2wdqxj6u5qTwUjjQqa`). Lista dostała stałą ścieżkę (data
w nagłówku), wzorem `materialy/indeksacja/kolejka.md`, bo prompt Coworka musi otwierać niezmienny adres.
Zasady: `materialy/kontrola-przegladarkowa/cowork-zadanie.md`.

**Zadanie Coworka na 1. dnia miesiąca 11:47 zostało założone z API BEZ zapisanych konektorów — ostrzeżenie API mówi, że odpalane nim sesje startują bez narzędzi konektorowych.**
**Mamy?** — częściowo: trigger istnieje i ma prompt, ale dostępu do Chrome nie zmierzyłem. „Kolejka GSC" (ten sam mechanizm, działa) ma osiem konektorów, a rozszerzenia Claude in Chrome nie ma wśród nich — czyli przeglądarka idzie przez powiązanie z komputerem, nie przez konektor.
**Zrobić:** — przy pierwszym przebiegu 01.11.2026 sprawdzić odpowiedź: jeśli brzmi „przeglądarka nieosiągalna", założyć to zadanie z panelu Routines na claude.ai (wtedy niesie konektory konta) i skasować `trig_01Umoo2wdqxj6u5qTwUjjQqa`.
**Kto:** — Marek (panel)
↻ 19.10.2026 (godzinę później): rozstrzygnięte bez czekania do listopada. Przy próbie zmiany promptu
„Kolejki GSC” API odpowiedziało, że tamto zadanie „wymaga Claude Desktop (macOS): działa tam, z narzędziami
tego komputera” — Chrome daje powiązanie z komputerem, nie konektor, a dostaje je tylko zadanie założone
w aplikacji na tym komputerze. Trigger `trig_01Umoo2wdqxj6u5qTwUjjQqa` WYŁĄCZONY (zostaje do skasowania).
Nowe Zrobić: Marek zakłada w Claude Desktop na Macu zadanie „Kontrola linków w przeglądarce”, 1. dnia
miesiąca ok. 11:47, prompt z `materialy/kontrola-przegladarkowa/cowork-zadanie.md`; potem Code kasuje
wyłączony trigger. Zadanie 07:49 (lista) zostaje — działa w chmurze z repo.
→ zamknięte 19.10.2026: Marek założył zadanie na Macu — `trig_01NRYdRPRMVTYZTGDf5C8iH6`, **20. dnia miesiąca
11:45** (nie 1.). Lista przestawiona na 20. dnia 07:49 (`trig_01EePabyXvKUkSkb4bjMoayw`), żeby była z tego
samego dnia. Trigger z chmury skasowany (przy próbie kasowania z API już go nie było). Pierwszy pełny
przebieg: 20.10.2026 — lista z 19.10 jest świeża, więc to test na żywo, nie na sucho.

**Prompt zadania „Kolejka GSC — zgłoszenia” (`trig_01NNqijkQrcpLpD89bVW8ST6`) nie przyjął z API wyjątku „ODŚWIEŻENIE” — `needs_device_approval`, nic się nie zmieniło.**
**Mamy?** — częściowo: kolejka od 26.10 będzie wstawiać huby działów ze znacznikiem „ODŚWIEŻENIE”, ale obecny prompt Coworka każe nie klikać adresów, które są w Google — czyli ominie je wszystkie.
**Zrobić:** — w Claude Desktop na Macu zmienić prompt tego zadania na wersję z `materialy/indeksacja/cowork-zadanie.md` (różnica: trzy linijki wyjątku w kroku 3 i „w tym odświeżeń hubów działów: D” w kroku 5) — przed poniedziałkiem 26.10.
**Kto:** — Marek (komputer)
→ zamknięte 19.10.2026: zrobione na Macu tego samego dnia (`updated_at` 10:44 UTC) — prompt `trig_01NNqijkQrcpLpD89bVW8ST6` ma wyjątek „ODŚWIEŻENIE" i linijkę z liczbą odświeżeń. Sprawdzone przez `get_trigger`.

**Eksport listy 220 adresów zwracających 404 w GSC wisi od 12.10 — po noindex (2 284) to największa pojedyncza pozycja wśród niezaindeksowanych.**
**Mamy?** — nie: w dzienniku stoi jako „do odczytu przy następnej okazji" (wpis 12.10 14:20).
**Zrobić:** — wyeksportować listę 404 z panelu GSC do repo, żeby Code rozstrzygnął każdy adres (przekierowanie albo zdjęcie z sitemapy).
**Kto:** — Cowork (panel)
→ zamknięte 19.10.2026: lista w `materialy/indeksacja/gsc-404-2026-10-19.md`. 219 z 220 to nasze huby — żywe (200), noindex; Google widział 404 10–15.09, zanim powstały. Nic do przekierowania. Jeden adres starego sklepu zostaje 404.

**x-komu nie ma w `afiliacje_rejestr.json`, choć jego linki są otagowane (`?sm=Y74rgdCO`, 788 wpisów w `redirects.xkom`) i zebrały 7 polskich kliknięć w 30 dni.**
**Mamy?** — częściowo: w rejestrze jest „alto" (SalesMasters, grupa x-kom), samego x-komu nie ma, a rejestr jest jedynym źródłem prawdy o sieciach.
**Zrobić:** — dopisać wpis `xkom` do `src/data/afiliacje_rejestr.json` (sieć SalesMasters, parametr `sm=`, status, prowizja, cookie).
**Kto:** — Code (dane)
→ zamknięte 19.10.2026: wpis `xkom` dodany (18 → 19 wpisów sklepów). Stawki NIE wpisałem —
panel SalesMasters nie był odczytany ani razu, więc `prowizja` mówi „nie sprawdzona", a stawki al.to
(ok. 2%, kategorie 1–6%) świadomie nie przepisałem na x-kom. `cookie_dni: null` z tego samego powodu.
Przy okazji: `konta_w_sieciach` nie miało wpisu SalesMasters (dodany), a komentarz w
`scripts/zrzut-redirects.mjs:34` odsyłał do „sekcji x-kom" w rejestrze, której nie było. W `alto`
dopisany odsyłacz — to jedno konto, więc zmianę stawki nanosi się w obu wpisach. Nowe ustalenie
w `_meta.decyzje.klucze_sklepow`: klucz w rejestrze musi być tym samym słowem, którego używa reszta
serwisu (`redirects.<sklep>`, `oferty_feed`, worker, raporty kliknięć).

**Prowizja x-komu i cookie są nieznane — panel SalesMasters nie był odczytany ani razu, a sklep zebrał 7 polskich kliknięć w 30 dni.**
**Mamy?** — nie: w rejestrze stoi „nie sprawdzona"; stawka al.to (ok. 2%) nie jest dowodem dla x-komu.
**Zrobić:** — odczytać w `salesmasters.x-kom.pl/prowizje` stawkę dla kategorii z klockami oraz długość cookie i podać je do sesji Code (jedno wejście w panel, przy okazji odczytu innych paneli).
**Kto:** — Cowork (panel sieci) albo Marek (panel)

## 2026-10-19 · CODE · Kontrola świeżości tekstów: skrypt gotowy, krok niewdrożony

Marek: „dodaj to sprawdzanie do Kontrolera". Zrobione pół na pół i to jest cała prawda o stanie.

**Gotowe i sprawdzone:** `scripts/swiezosc-tekstow.mjs` (+ wpis w `scripts/README.md`).
Dwa ustalenia, oba policzalne: **sprzeczność** — numer z plakietką „przeciek" jest już
wystawiony przez LEGO (potwierdzona cena w `rrp_potwierdzone.json` albo listing w
`katalog.json`); **przestarzałe** — `zaktualizowano` starsze niż wpis albo rozstrzygnięcie
w `przecieki.json` dla numeru, który tekst wymienia. Test regresji na stanie strony 2027
z 27.08: wykrywa 67006 i 67008 plus jedenaście nowszych wpisów przecieków. Na stanie
dzisiejszym: zero sprzeczności.

Dwie decyzje projektowe w skrypcie, obie wymuszone pierwszym przebiegiem:
- **ceny nie starzeją tekstu.** Standard zabrania kwot w treści artykułu, a sierpniowy
  zrzut katalogu (ok. 900 wpisów RRP jednego dnia) zapalał każdy starszy tekst i zakopywał
  jedyne ustalenie warte czytania. Ceny służą tylko do opisania numeru.
- **`sety.json` nie jest dowodem, że LEGO ogłosiło zestaw.** 77094 (Zelda) jest w rejestrze,
  a lego.com nie ma dla niego karty — sprawdzone dzisiaj. Takie numery idą do osobnego
  kubełka „DO SPRAWDZENIA". Przy okazji: ten jeden numer to dziś jedyne ustalenie skryptu
  i czeka na rozstrzygnięcie przecieku albo wyjaśnienie, skąd wpis w rejestrze.

**NIEWDROŻONE:** Kontroler tego nie uruchamia. `update_trigger` z tej sesji odmówił —
prompt runnera zmienia się tylko z jego własnej rozmowy albo z panelu. Akapit do wklejenia,
miejsce wstawienia i dokładny komunikat odmowy leżą w
`materialy/kontroler-krok-swiezosc-2026-10-19.md`. Reguła z „Ustaleń trwałych" obowiązuje:
dopóki prompt się nie zmieni, kroku NIE MA i nie wolno pisać, że jest.

**Zrobić:** — wkleić akapit z `materialy/kontroler-krok-swiezosc-2026-10-19.md` do promptu
Routine `trig_01KB8XkPcHyvc5kCRKEKYjri`, przed akapitem „KLIKNIĘCIA AFILIACYJNE:"
**Kto:** — Marek (panel) albo sesja Kontrolera
→ zamknięte 19.10.2026: Marek wkleił. Sprawdzone przez `get_trigger`: akapit stoi w prompcie
dosłownie, w zadanym miejscu (po `ARCHIWUM DZIENNIKA`, przed `KLIKNIĘCIA AFILIACYJNE:`),
`updated_at` 2026-10-19T08:31:59Z. Krok wchodzi w życie przy przebiegu 26.10 — dzisiejszy
Kontroler odpalił się o 09:08, przed zmianą. Przy okazji zmieniona godzina runnera:
`CRON_TZ=Europe/Warsaw 30 9 * * 1`, nazwa „LEGO pon 09:30 — Kontroler". Skutek uboczny do
wiadomości: akapit o kontroli linków nadal mówi, że Łowca chodzi „pół godziny przed Tobą"
(08:30) — teraz to godzina. Treść kroku działa, poprawka tylko dla porządku.

## 2026-10-19 · CODE · Zapowiedzi 2027: dwie tabele zamiast jednej

Zamknięcie pozycji z dzisiejszego Radaru. Strona stała od 27.08 i mówiła nieprawdę.

- **Co było nieprawdą:** „Grupa LEGO nie potwierdziła jeszcze żadnego zestawu na 2027 rok"
  i nagłówek „Super Mario: jedyna potwierdzona zapowiedź". Sprawdzone dziś bezpośrednio
  na lego.com/pl-pl: 72060 i 67008 mają `product:availability: pre-order` i komunikat
  „Zamów ten produkt w przedsprzedaży już dziś (wysyłka od 1 stycznia 2027)".
- **Struktura:** jedna tabela rozbita na dwie — osiem pozycji z kartą produktową i polską
  ceną katalogową (72060 429,99, 72058 259,99, 67012 749,99, 67006 429,99, 67008 259,99,
  67009 126,99, 71875 84,99, 71873 bez ceny) wobec czternastu przecieków. Ceny z
  `rrp_potwierdzone.json` (lego.pl, 13–14.10).
- **Dołożone pozycje**, których strona nie miała: 67009, 67012, 71873, 71875, 77094 Zelda,
  11399 Helmowy Jar (numer i data 1.06.2027 z Bricksetu), 75484 UCS Eta-2, 30748,
  blind boxy Pokémon.
- **Drugi martwy zapis:** „polskich cen katalogowych [Super Mario] jeszcze nie ogłoszono".
  LEGO podało je 28.08.2026 — **dzień po** ostatniej aktualizacji strony. Zdanie było
  nieprawdziwe praktycznie od publikacji.
- **Poprawiony fakt:** Helmowy Jar przy 8060 elementach jest drugim, nie pierwszym
  największym zestawem LOTR — Minas Tirith ma 8278. Strona twierdziła odwrotnie.
- **Liczba zestawów Super Mario w ofercie:** 37 → 22 (w katalogu 98 już wycofanych).
- Wniosek na przyszłość, nie tylko o tej stronie: artykuł z sekcją „stan na dziś" starzeje
  się szybciej, niż ktokolwiek do niego wraca. Tu wyszło siedem tygodni. Warto, żeby
  Kontroler raz w tygodniu porównywał `zaktualizowano` tekstów o zapowiedziach z datami
  wpisów w `przecieki.json` i `sety.json` — to zapytanie, nie praca redakcyjna.

## 2026-10-19 08:10 · RADAR · Do zrobienia

**faniklockow.pl · 19.10** — Wystawili zbiorczą stronę zapowiedzi LEGO 2027; fanklockow tej samej nocy dołożył cztery strony per seria (Star Wars, Ninjago, Friends, City).
**Mamy?** — częściowo: `/zapowiedzi-lego-2027/` istnieje, ale `zaktualizowano: 2026-08-27`, a od tej daty do `przecieki.json` weszło szesć pozycji na 2027 i cztery rozstrzygnięcia; w dwóch miejscach strona mówi „LEGO nie potwierdziło jeszcze żadnego zestawu na 2027" i „Super Mario: jedyna potwierdzona zapowiedź", podczas gdy `sety.json` ma 71875 (84,99 zł), 67008 (259,99 zł), 71873 i 67006 z premierą 2027-01.
**Zrobić:** — uzupełnić `/zapowiedzi-lego-2027/` z `przecieki.json` i `sety.json` oraz usunąć nieprawdziwe zdanie o braku potwierdzeń (najpilniejsze: to błąd faktyczny na produkcji, nie zaległość).
**Kto:** — Code (dane, strona)
→ zamknięte 19.10.2026: zrobione tego samego dnia (`20cb23a`). Szczegóły w następnym wpisie.

**fanklockow.pl · 18.10** — Prowadzą cykl tygodniowy „Jakie LEGO «do szafy» w tym tygodniu", czyli co z wycofywanych w tym roku kupić teraz pod odsprzedaż.
**Mamy?** — częściowo: `/wycofania` ma numery, daty i status potwierdzenia przez LEGO (mocniejsza podstawa niż ich listy), ale nie ma formy, która co tydzień wybiera z niej kilka pozycji i mówi „to kup teraz".
**Zrobić:** — decyzja, czy wchodzimy w formę cykliczną; cykl tygodniowy to stały nakład pracy, a nie jeden tekst.
**Kto:** — Marek (decyzja)

## 2026-10-14 08:20 · RADAR · Do zrobienia

**faniklockow.pl · 13.10** — Wypisali zestawy najtańsze teraz na LEGO.pl pod okno podwójnych punktów; sprawdzone u źródła: LEGO.pl ma dziś **74 produkty na wyprzedaży** (−20 do −50%).
**Mamy?** — częściowo: 43 zestawy mają w `oferty_feed.json` cenę LEGO z **06.10**, choć 922 dostały 13.10 z wtorkowego Routine — i każdy z 11 sprawdzonych z tej 43 jest dziś przeceniony.
**Zrobić:** — sprawdzić, dlaczego `firecrawl-legopl.mjs` → `lego-ceny.mjs` z 13.10 ominął te 43 (hipoteza: listing nie oddaje pozycji przecenionych), i dociągnąć ceny z `/categories/sales-and-deals`.
**Kto:** — Code (dane, strona)
→ zamknięte 19.10.2026 (Kontroler, z opóźnieniem — zrobione było 14.10): hipoteza potwierdzona i naprawiona
tego samego dnia commitem `b4559ca` „Parser listingu LEGO.pl gubił każdy przeceniony zestaw — naprawione,
969 cen odświeżonych"; `firecrawl-legopl.mjs` zaciąga od tej pory oba listingi (`all-sets` i
`sales-and-deals`). Stan 19.10: 973 z 983 cen LEGO ma datę 14.10; 10 zestawów ze starszą datą
(10302, 21271, 21352, 42653, 71440, 72035, 75429, 76317, 76323, 76325) nie było w ostatnim zaciągu —
jutrzejszy Dane wt je rozstrzygnie. Pozycja nie miała linii zamknięcia, dlatego 19.10 poszła w mailu
„Zadania bez właściciela" jako otwarta — to jest błąd, nie zaległość.

**fanklockow.pl · 13.10** — „Minicykle GwP od LEGO® – czy to się opłaca?": analiza, czy zbierać miniserie upominków (Restauracje świata, powiększone minifigurki).
**Mamy?** — częściowo: kalendarz liczy arytmetykę progu osobno w każdym oknie, ale nie ma tekstu odpowiadającego na pytanie „czy zbierać te serie" — dane mamy (ceny wtórne starych GWP w hubach).
**Zrobić:** — nowy tekst „Czy warto zbierać gratisy GWP z miniserii LEGO" (evergreen, nie datowany).
**Kto:** — Piotr (tekst)

Pominięte: 2 publikacje bez znaczenia dla nas (LEGO Store Praga, wycofania Lumibricks — linki w bazie).

**Ile naprawdę kosztuje ta pierwsza pozycja, żeby nikt nie zrobił z niej paniki.** W 11 z 16
sprawdzonych przypadków nasza tabela i tak pokazuje tańszą ofertę zewnętrzną niż cena
wyprzedażowa LEGO.pl, więc czytelnik nie jest wprowadzany w błąd. Realnie zawyżamy trzy pozycje:

| Zestaw | Najtaniej u nas | LEGO.pl dziś | Zawyżenie |
|---|---|---|---|
| 76447 Zamek Hogwart: lekcja latania na miotle | 339,99 (Ceneo) | 271,99 | **68 zł** |
| 42211 Kosmiczny łazik Lunar Outpost | 292,17 (Ceneo) | 263,99 | 28,18 zł |
| 71494 Sowa czasu Zoey | 112,77 (Allegro) | 87,49 | 25,28 zł |

Osobno kłamie sama kolumna „LEGO" tam, gdzie w ogóle ją mamy: 10295 pokazujemy za 729,99
przy faktycznych 583,99, 75402 za 299,99 przy 239,99, 11504 za 249,99 przy 199,99.
**Cen ręcznie nie wpisałem** — tą samą zasadą co przy Proshopie 10.10: wpisana z ręki kwota
nie ma czym się odświeżyć i zacznie kłamać, a tutaj mechanizm odświeżania istnieje i wystarczy
go naprawić.

## 2026-10-06 08:25 · RADAR · Do zrobienia

**fanklockow.pl · 05.10** — Zapraszają na transmisję ze wspólnych zakupów przy starcie 9. serii BrickLink Designer Program, który wypada dziś.
**Mamy?** — tak: `/kalendarz-promocji-lego/#bldp` z terminem, pełnym składem serii i pięcioma cenami katalogowymi.
**Zrobić:** — ZROBIONE w tym przebiegu: nagłówek mówił „seria 9", a zdanie pod nim „piątej serii" — poprawione na „dziewiątej".
**Kto:** — Code (dane, strona)

**faniklockow.pl · 05.10** — LEGO i Sanrio ogłosiły wieloletnią współpracę: Hello Kitty wchodzi do klocków, pierwsze produkty w 2027 roku.
**Mamy?** — nie: dział licencji kończy się na Nike i Formule 1 (`/artykuly/historia-licencji-lego-gry-sport-lifestyle/`, tekst z 21.09), Sanrio tam nie ma.
**Zrobić:** — uzupełnić ten artykuł o akapit o licencji Sanrio (oficjalne oświadczenie obu firm, opisane niezależnie przez oba serwisy — nie plotka).
**Kto:** — Piotr (tekst)

Uwaga do pierwszej pozycji, żeby nikt tego nie „poprawił" w drugą stronę: ich
**16:15 to godzina transmisji live**, nie startu sprzedaży. Nasze 17:00 w kalendarzu
zostaje bez zmian — potwierdzaliśmy je w dwóch serwisach branżowych.

→ zamknięte 13.10.2026 (pozycja BLDP): „piątej serii” poprawione na „dziewiątej” w przebiegu Radaru 06.10. Pozycja o Sanrio (Piotr) zostaje otwarta.

## 2026-09-27 18:40 · CODE · Podgląd przebudowy: nowa strona główna + „Promocje LEGO” (w toku)

**Zrobione:** dwie strony podglądu (noindex, poza sitemapą i menu, pasek „PODGLĄD” u góry), produkcja
bez zmian: `/podglad/glowna/` — slajder, 3 zestawy „Dziś w dobrej cenie” + duży przycisk „Zobacz
wszystkie promocje LEGO”, Aktualności, 3 najnowsze deale, Ostatnio na blogu (bez siatki dobrych cen,
prezentowników, wycofań i person). `/podglad/promocje-lego/` — 12 najlepszych okazji jako boksy,
reszta w listingu półek jak na /deale/, „Dziś w dobrej cenie” po 3 w rzędzie ułożone seriami z filtrem
serii i stronicowaniem po 12 (do 12 zestawów na serię, ~300), 3 prezentowniki, Top 10 wycofań,
„Okazje pod lupą” (#okazje-pod-lupa). Kod to kopie `index.astro` i `deale/index.astro` — po akceptacji
Marka do scalenia we wspólne moduły, zmiany menu („Deale” → „Promocje LEGO”) i przekierowania /deale/.
Wersja 2 (uwagi Marka 27.09): Promocje — slajder 12 okazji (2 karty w widoku), tekst o zasadach pod
slajderem, półki >1500 / 801–1500 / 201–800 / do 200 w stylu tabeli wycofań (zdjęcia 130 px, bez zł/klocek),
„Dziś w dobrej cenie” wmieszane w półki (min. 10 pozycji, reszta pod „Pokaż więcej”), potem Okazje pod
lupą, Prezentowniki, Top 10 wycofań, Persony. Okazja = ≥30% albo nowe minimum przy ≥15%, ekskluzyw ≥15%.
Główna — bez ramek zdjęć (też w slajderze), klocek w osi tytułu, równe odstępy (16/20 px), jednakowe
duże przyciski, deale pod blogiem, wejścia Nowości/Wycofania/Artykuły. Poprawki stylu w klasie
`.podglad-widok` — po akceptacji do przeniesienia globalnie.
**Stan:** w toku — czeka na ocenę Marka.
**Dla drugiej strony:** nic.

## 2026-09-25 07:00 · CODE · CRO A–G wdrożone na przykładach testowych + prezentacja przed/po (PDF)

**Zrobione:** poprawki A–G z audytu CRO (`materialy/audyt-cro-hubow-2026-09-25.md`)
zaimplementowane w kodzie: nowy `src/components/PasekCeny.astro` (pasek „od X zł
w N sklepach −Y%” z przyciskiem do najtańszego sklepu; warianty gora/dol/przyklejony),
hub `[nr].astro` (pasek pod tytułem, dolny blok „Najtaniej dziś”, pasek przyklejony
na telefonie po przewinięciu tabeli, wiersz Brickset przy ≥20 głosach), `TabelaCen.astro`
+ `remark-ceny.mjs` (etykiety „x-kom →” zamiast „Sprawdź w sklepie →”, linia zaufania
pod tabelą), `KartaPrezentu.astro` (sklepy jako przyciski, najtańszy na żółto),
`GaleriaZestawow.astro` („dziś od X zł”), `Artykul.astro` (pasek z frontmatter
`pasek_zestaw`, użyty w poście x-kom). Dane testowe: `brickset` dla 43014 i 60470
w `sety.json`. Prezentacja porównawcza: `materialy/cro-przed-po-2026-09-25.pdf`
(13 slajdów, zrzuty przed/po z lokalnego buildu, pomiar: pierwszy przycisk sklepu na
telefonie 864→413 px na 43014, 1029→485 na 60470, 1432→462 w poście x-kom).
**Stan:** w toku — kod na gałęzi roboczej, **nie na main**; build przechodzi
(9 659 stron). Czeka na decyzję Marka: publikować A–G razem czy etapami (A+G, potem
C i B). H (filtr referera w workerze) osobno, wymaga zgody.
**Dla drugiej strony:** nic do czasu decyzji. Po publikacji: prompt Łowcy dostaje
zdanie o `pasek_zestaw` w postach dealowych, prompt Scouta — uzupełnianie pola
`brickset` (ocena, głosy, posiadacze, data) dla nowości.

## 2026-09-04 06:50 · CODE · Kolejka redakcyjna w XLSX + osobna sesja na czubek

**Zrobione:**
- **`materialy/kolejka-redakcyjna.xlsx`** — 809 zestawów do opisania: rocznik
  2020–2026, status `dostepny`, cena katalogowa w zł, brak wpisu w `sety.json`.
  Kolumny: numer, nazwa PL, rok, seria, cena. Sortowanie po cenie malejąco.
  Drugi arkusz „Metodologia" opisuje kryteria, źródła i rozkład po rocznikach.
- Liczba przeliczona na świeżo z `katalog.json` + `sety.json`. Rejestr
  (`known_sets.json`) podaje 794 — to stan z 26.08; katalog odświeżono 02.09
  i doszło 15 nowych dostępnych zestawów z ceną.
- **Uruchomiona osobna sesja redakcyjna** `session_017crJHR6y9z5CNDcwqQ2UYg`
  („Redakcja — czubek kolejki"). Bierze zestawy po kolei od góry arkusza,
  partiami po 5–10, dopisuje wpisy do `src/data/sety.json`.

**Stan:** gotowe (arkusz), w toku (sesja redakcyjna — praca ciągła)

**Dla drugiej strony:** nic. Kolejka jest zarezerwowana przez sesję redakcyjną —
nie dublować opisów z arkusza.

**Uwagi:**
- Marek jawnie odrzucił przestawienie priorytetu na Harry'ego Pottera.
  Kolejność to cena malejąco, bez wyjątków.
- **Dwie sesje piszą teraz do `sety.json`** (Scout codziennie 5:00 + Redakcja).
  Każda musi robić `git pull origin main` tuż przed zapisem i weryfikować
  `git diff -U0 src/data/sety.json | grep -c '^-[^-]'` = 0.
- Zestaw 40824 (Tweety) jest w katalogu dwa razy: Seasonal/2025 i
  Looney Tunes/2026. W arkuszu został nowszy wpis — do weryfikacji przy opisie.

---

## 7.10.2026 — Audyt PageSpeed i wdrożenie poprawek wydajności (Claude Code, sesja Beko/landing)

**Zrobione:**
- Raport: `materialy/audyt-pagespeed-2026-10-07.md` (Lighthouse mobile: główna
  60, hub zestawu 59, listing promocji 72, artykuł 84, seria 92).
- Wdrożone na `main`: skalowanie obrazów `?w=` w workerze (Cloudflare Image
  Transformations, włączone w panelu przez Marka), `srcset`/`sizes` we
  wszystkich miejscach z `<img>` zestawów, `fetchpriority` + preload obrazu LCP
  (główna, hub), GA po `load`, czcionki przez Fonts API (CLS hubów 0,23 → 0),
  CSS inline, `public/_headers` z `immutable`, poprawki dostępności (kropki
  slajdera, kontrast `kc-data`/`kc-uwaga`/`tag-eol`, nagłówek pustej kolumny
  tabeli cen, stopka bez `h4`, `aria-label` na kafelku bez zdjęcia).
- Opis operacyjny: RUNBOOK → „Obrazy skalowane".

**Stan:** wdrożone, pomiar po deployu w tym samym wpisie raportu (sekcja „Po wdrożeniu").

**Dla drugiej strony:** nowe `<img>` zestawów składać przez `obrazStaly` /
`obrazPlynny` z `src/lib/media.js`, nie ręcznie. Pakiet `@fontsource/archivo`
wyleciał z `package.json` — Fonts API pobiera pliki Archivo z CDN fontsource
przy buildzie (build wymaga dostępu do cdn.jsdelivr.net i api.fontsource.org).
