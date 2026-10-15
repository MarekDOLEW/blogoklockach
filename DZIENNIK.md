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
- **Oferta poniżej 50% potwierdzonej ceny katalogowej wymaga sprawdzenia przez
  człowieka** (Marek, 16.09.2026). Sito `filtrujOferty()` ukrywa ją na stronie;
  rano przychodzi mail z linkami (`podejrzany-rynek-mail.mjs`, klucz `podejrzane`,
  kontakt@); Marek potwierdza w rozmowie z Code („potwierdzam <nr> <cena> <sklep>"),
  Code dopisuje do `deale_potwierdzone.json` i oferta wraca tego samego dnia.

## Archiwum

Wpisy starsze niż 14 dni żyją w plikach miesięcznych. Nic nie zostało
skasowane — jeśli szukasz czegoś starszego, jest tam:

- [`2026-09`](materialy/dziennik-archiwum-2026-09.md) — 96 wpisów
- [`2026-08`](materialy/dziennik-archiwum-2026-08.md) — 36 wpisów

Archiwizuje `node scripts/archiwum-dziennika.mjs`.

<!-- WPISY PONIŻEJ — wszystko nad tą linią zostaje w dzienniku na zawsze -->

## 2026-10-15 09:00 · CODE · 40824: 69,99 zł było ceną z kodem, który wygasł 14.10

- Marek: na stronie 69,99, w Media Expert 99,99. Karta ME (Firecrawl): 69,99 to „cena z kodem MEDAYS-10, obowiązuje do 14.10.2026 23:59”; dziś karta na żywo `product:price:amount` 99,99, bez kodu. Kodu MEDAYS-10 nie było w `kody_rabatowe.json` (ostatni zrzut `me-kody.mjs` 10.10), więc strona pokazywała cenę z kodem jak zwykłą.
- Poprawione: ME 40824 → 99,99 (15.10) w `oferty_feed` i `sety.json`; najtańsza oferta teraz x-kom/Ceneo 92,90. Post `/deale/deal-40824-kanarek-tweety-minimum/` dostał `wazne_do: 2026-10-14` (baner „akcja zakończona”). `sortujPostyDealowe()` przesuwa posty po `wazne_do` na koniec — trójka deali na głównej pokazuje tylko trwające akcje.
- Wpis w `deale_potwierdzone.json` (69,99 z 14.10) zostaje: 99,99 i tak jest powyżej progu podejrzanego rynku.

## 2026-10-15 05:20 · SCOUT · Do zrobienia

**Po wpisaniu 81,99 zł do 40909 w `sety.json` zostaje sześć gratisów z `bez_rrp` i bez ceny: 40896 (X-Files), 40897, 40899 (Astro Bot), 40900, 40902, 40916 — każdy ma wycenę dodatku podaną przez LEGO w euro, żaden nie ma polskiej ceny katalogowej.**
**Mamy?** — częściowo: huby stoją, w polu ceny pustka, więc nie wchodzą do tabel cen ani do przeliczeń za element
**Zrobić:** — jedna decyzja dla tych sześciu: wycena dodatku jako `cena_katalogowa` (jak 40909) albo `bez_rrp` zostaje; polybagi, ekskluzywy LEGO House/LEGOLAND i BLDP tej decyzji nie dotyczą
**Kto:** — Marek (decyzja)
→ zamknięte 15.10.2026: decyzja Marka — wszystkie sześć dostaje wycenę dodatku. Wpisane cztery
po sprawdzeniu promoklocki.pl (Firecrawl; nasz serwer dostaje 403 od Cloudflare): 40899 i 40900 po
81,99 zł, 40902 i 40916 po 109,99 zł. 40896 miało już 81,99 zł i tylko sprzeczne `bez_rrp` — zdjęte.
Zostaje 40897 (Miecz świetlny Vadera): ani promoklocki, ani Brickset nie mają dla niego ceny
katalogowej, w Niemczech wyceniony na 29,99 euro — pilnuję go w kolejnych przebiegach (Scout).

**Rejestr `known_sets.json` rozjechał się z `sety.json`: commit 52e1586 dołożył 18 dużych zestawów (lista Radaru z 10.10), ale nie dopisał ich do rejestru — przez trzy dni `liczba_setow` pokazywała 1185 przy 1203 wpisach.**
**Mamy?** — tak: dociągnąłem rejestr w tym przebiegu (1185 → 1203), więc dziura jest zamknięta
**Zrobić:** — przy każdym ręcznym dopisaniu zestawu do `sety.json` aktualizować też `known_sets.json` (lista `sety` + `liczba_setow` + `data_aktualizacji`), albo dorzucić to do skryptu, który dopisuje zestawy
**Kto:** — Code (dane, skrypt)

## 2026-10-14 15:00 · CODE · Rolki wideo z kodu: HyperFrames + generator „Deal alert"

**Decyzja (Marek):** rolki 9:16 składamy z kodu, nie w edytorze. Dotychczasowy
efekt ręcznych rolek był słaby; szukaliśmy narzędzia „na czasie, z efektami,
z dobrą typografią". Przegląd rynku skilli (katalog skills.sh, lista
awesome-claude-video-skills z benchmarkiem 16 narzędzi):

- **wybrane: HyperFrames** (heygen-com/hyperframes, 62 tys. gwiazdek) — HTML +
  GSAP renderowane klatka po klatce w headless Chrome do MP4. Ten sam stos co
  karuzele i skille GSAP z pluginu, zero zmiany paradygmatu, tekst to tekst
  (polskie znaki i ceny bezbłędne), render deterministyczny;
- **dołożone:** pakiety iart-ai `tiktok-video-skills` (gramatyka retencji,
  napisy karaoke) i `ecommerce-video-skills` (`promo-video`: cena
  przekreślona → nowa, wsadowo z danych) — gramatyka, nie silnik;
- **odrzucone:** oficjalne skille Remotion (w benchmarku „wynik bliski filmowi
  bez skilla", React), OpenMontage (przerost), skille na płatnych API wideo
  (inference.sh, NemoVideo, Veo — generują obraz, tekst z modelu łamie regułę
  bezbłędnych cen).

**Zrobione:**
- `materialy/rolki/szablon-deal/` — szablon rolki „Deal alert" 12 s, 1080×1920:
  hook z tezą od pierwszej klatki (jasne tło, kropki-studsy) → żółte
  przejście → cena katalogowa przekreślona, odliczanie do ceny dziś, konfetti,
  „−X%" (granat) → sklepy od najtańszego ze słupkami → logo, „link w bio",
  `#materiałpartnerski` na ekranie. Kolory i Archivo z `system-wizualny.md`.
- `scripts/rolka-deal.mjs <nr>` — pełny przebieg: dane z `ceny_baza.json`
  (katalog, minimum w bazie), `oferty_feed.json` (sklepy, tylko oferty
  ≤ 7 dni), `sety.json`; zdjęcie z feedu; wycięcie pudełka; dźwięk; `npx
  hyperframes check`; render. Dla 75405: 73 s od zera do MP4 (3,9 MB).
- **Wycinanie tła:** model `hyperframes remove-background` (onnxruntime,
  lokalny) uczony na ludziach bierze ciemny karton za tło i zostawia sam statek
  — bezużyteczny dla pudełek. Rendery sklepowe stoją na czystej bieli, więc
  skrypt wypełnia biel od krawędzi (dekodowanie przez ffmpeg, bez `sharp`,
  żeby działało w świeżym klonie); białe napisy NA pudełku zostają, bo
  wypełnienie nie ma do nich dojścia. Model zostaje tylko dla zdjęć na innym tle.
- **Dźwięk:** efekty z biblioteki skilla `media-use` (Pixabay, bez atrybucji;
  kopie w `szablon-deal/audio/`), podkład syntezowany w Node (120 BPM, a-moll,
  deterministyczny) — żeby rolka nigdy nie wyszła niema. Z `HEYGEN_API_KEY`
  skrypt pobiera utwór z katalogu HeyGen (`/v3/audio/sounds`, ponad 10 tys.).
  Pomiar: średnio −17 dB, szczyt −1,7 dB.
- **CLI HeyGen** zainstalowane w kontenerze (v0.10.0, suma SHA-256 zgodna
  z `checksums.txt`; skrypt `curl | bash` zablokował klasyfikator, więc binarium
  pobrane i rozpakowane ręcznie z tego samego archiwum). Logowanie OAuth
  wymaga przeglądarki, więc w sesjach Code działa tylko klucz: **punkt ręczny
  dla Marka** — `HEYGEN_API_KEY` w sekretach środowiska Code (klucz z
  app.heygen.com → Settings → API). Kontener jest ulotny, CLI trzeba będzie
  instalować w setup script środowiska albo zostawić skryptowi bezpośrednie
  wywołanie API (tak jest dziś — CLI nie jest mu potrzebne).
- `.claude/settings.json`: marketplace'y `hyperframes`, `tiktok-video-skills`,
  `ecommerce-video-skills` + włączone pluginy — Code w tym repo ma skille od
  ręki. Wbrew ogólnej zasadzie (skille uniwersalne do `MDmygeneralskills`)
  zostają tutaj, bo to cudze marketplace'y, nie nasze skille.
- `klocki-social`: dopisana sekcja „Rolki wideo — format produkcyjny" (skill
  trafił do repo w `.claude/skills/klocki-social/` i do `NASZE` w
  `spakuj-skille.mjs`; paczka `skille/klocki-social.skill` do wgrania przez
  Marka na claude.ai — Cowork zleca rolkę do Code, nie renderuje sam).
- Dokumentacja: `materialy/rolki/README.md`, wiersze w `scripts/README.md`
  i `materialy/README.md`, punkt 8 w ściądze „Co gdzie wrzucać" w `NARZEDZIA.md`.
  `.gitignore`: `materialy/rolki/wyjscie/`, `.hyperframes/`.

**Test:** LEGO 75405 Krążownik typu Home One — katalog 299,99 zł, dziś 169,99 zł
w Ceneo/Media Expert/Allegro (−43%), minimum w naszej bazie z 12.10. MP4 i zip
projektu wysłane Markowi w rozmowie.

**Do zrobienia:**
- Marek: `HEYGEN_API_KEY` w sekretach środowiska; wgrać `klocki-social.skill`.
- Pętla do klatki zero (re-watch) i wariant 4:5 / 1:1 z tego samego szablonu.
- Drugi format („Ile NAPRAWDĘ kosztuje klocek", cena/element z `sety.json`)
  na tym samym silniku.

## 2026-10-14 13:10 · CODE · Firecrawl: kto zużywa kredyty

- Stan konta (API `team/credit-usage`): zostało **1 270 z 5 000**, okres do 23.10. Zużycie: sierpień 263, wrzesień 1 475, październik do 14.10 już 2 297.
- Źródło według panelu: **MCP 75% (3 169)**, API 25% (1 060). Nasze skrypty LEGO idą przez API. Przez MCP idą sesje z konektorem Firecrawl — wg dziennika aktywności (ostatnie ~18 h) to głównie inne projekty Marka na tym samym koncie: części do Jaguara E-Type (martinrobey, sngbarratt, terrysjag, eBay, wyszukiwania numerów C3xxxx) i fronerigastro.pl (60 stron w godzinę).
- Dziś 302 zadania: 154 LEGO (lego.com + Media Expert, po 1 kredycie), 148 pozostałych — na nie przypada większość z ~640 kredytów dnia (wyszukiwania z pobieraniem treści i ekstrakcja kosztują kilka kredytów za zadanie).
- Jednorazowy koszt LEGO dziś rano: dwa pełne przejścia katalogu lego.pl (~117 stron) przy naprawie parsera.
- Potwierdzone w `firecrawl_credit_usage` (podział na klucze): październik — „Connected app” (konektor MCP w claude.ai/Cowork, inne projekty) **1 663**, „Default” (nasz `FIRECRAWL_KEY`, skrypty LEGO) **634**.
- Decyzja Marka: do 23.10 inne projekty nie używają Firecrawla, gdy na koncie zostaje < 400 kredytów. Twardej blokady nie ma (jeden zespół, jedna pula, Firecrawl nie ma limitów per klucz), więc reguła idzie jako instrukcja w ustawieniach claude.ai (Instrukcje osobiste) i w skillach `czesci-*` — tekst w odpowiedzi Code z 14.10.

## 2026-10-14 12:55 · CODE · Wiersz „wyprzedane" w tabeli cen — i ukryty błąd, który przy okazji wyszedł

Dopisek, o który prosił Marek po obejrzeniu 76329. Przy pisaniu okazało się, że samo
wykluczenie oferty z liczenia najtańszej (wpis 12:20) **nie załatwiło sprawy do końca**.

**Czego nie widziałem wcześniej.** `TabelaCen` dokłada wiersz LEGO z ceną KATALOGOWĄ, gdy
w ofertach nie ma LEGO — i ten wiersz szedł do zwykłego sortowania po cenie. Przy 76329
cennikowe 299,99 zł stawało więc na czele tabeli i dostawało ramkę „najtańszy", mimo że
w metaopisie i na pasku ceny mieliśmy już poprawne 337 zł z Allegro. Strona przeczyła sama
sobie o dwa akapity: na górze „od 337,00 zł", a w tabeli wyróżnione 299,99 zł ze sklepu,
który zestawu nie ma.

**Rozwiązanie jest tym, co serwis robi od dawna z Ceneo:** wiersz, który nie jest ofertą,
stoi osobno na końcu i nie bierze udziału ani w sortowaniu, ani w wyróżnieniu najtańszego.
`wierszLegoWyprzedane` działa teraz dokładnie jak `wierszLegoEol`, tylko z innym tekstem:
znacznik **„wyprzedane"** przy cenie i podpis „oficjalny sklep – w tej chwili wyprzedane;
podajemy cenę katalogową dla porównania". Link do LEGO.com zostaje — na karcie są zdjęcia
i wymiary, a zestaw może wrócić do sprzedaży.

Po zmianie na 76329: najtańszy jest Allegro 337,00 zł, Empik 358,41 zł pod nim, a LEGO.com
z 299,99 zł i znacznikiem „wyprzedane" na końcu. Dokładnie to samo mówi metaopis.

**Zasięg:** wiersz wychodzi na 38 z 39 wyprzedanych hubów. Trzydziesty dziewiąty to
5006157 Play and Display Case — nie ma ceny katalogowej, więc nie ma czego pokazać;
zostaje sama plakietka przy tytule. Nie wymyślamy kwoty, żeby wiersz się pojawił.

Sprawdzone po buildzie (10002 strony), że dostępnym zestawom nic się nie stało: 76447 ma
dalej LEGO.com 271,99 zł jako najtańsze, z datą i rabatem −20%. 10315 pokazuje ten sam
układ co 76329 — Media Expert 308,96 zł na czele, wyprzedane LEGO na końcu.

CSS bez nowej deklaracji: `.tag-wyprzedane` dołączony do selektora `.tag-eol`, bo to ta
sama czerwień i ten sam kształt.

## 2026-10-14 12:45 · CODE · Runner „Kolejka indeksacji 01:57” + zadanie dla Coworka

- Decyzja Marka: osobny runner. Stała sesja `session_01XfrPhwbD2bhMwybCoUdATy`, trigger `trig_01Gh6Payj9QVGDkrKXNzkbCX`, codziennie 01:57. Układa `materialy/indeksacja/kolejka.md` (10 adresów) i pushuje tylko ten katalog.
- Klikanie: zadanie cykliczne Coworka na komputerze Marka, prompt w `materialy/indeksacja/cowork-zadanie.md` (proponowana pora 10:00). Do założenia przez Marka.

**Cowork nie ma jeszcze zadania „Poproś o zindeksowanie” — kolejka z nocy nie zostanie zgłoszona**
**Mamy?** — częściowo: runner układa listę od 15.10, nikt jej nie klika
**Zrobić:** — założyć w Coworku zadanie cykliczne (codziennie 10:00) z promptem z `materialy/indeksacja/cowork-zadanie.md`
**Kto:** — Marek (decyzja, panel)
→ zamknięte 14.10: zadanie „Kolejka GSC — zgłoszenia” założone, codziennie 10:24, pierwszy przebieg 15.10

## 2026-10-14 12:20 · CODE · Wyprzedane oferty nie liczą się do najtańszej ceny

Dokończenie wątku z 11:40. Plakietka mówiła „wyprzedane w LEGO.com", a cena z tego samego
sklepu dalej wygrywała jako najtańsza.

**Cięcie poszło w `filtrujOferty`, nie w `najlepszaOferta` — i to była cała trudność.**
„Najtańszą" liczy w serwisie pięć różnych miejsc: hub (`[nr].astro`), `seo.js`,
strona główna, `/promocje-lego/` i `GaleriaZestawow`. Każde robi własny `Math.min` po
liście już przepuszczonej przez `filtrujOferty`. Gdybym odciął ofertę tylko w
`najlepszaOferta()`, cena wyprzedanego zestawu zostałaby w pozostałych czterech —
strona główna dalej sortowałaby po cenie, której nie da się zrealizować. Sito jest
jedynym miejscem, gdzie da się to powiedzieć raz.

- `oferty.js` → `ofertaKupowalna(o, nr)`: odrzuca wiersz `lego`, gdy `wyprzedaneWLego(nr)`.
  Dopięte do `filtrujOferty`, obok sita świeżości i „podejrzanego rynku" — czyli obok
  dwóch reguł, które już wcześniej wyrzucały oferty, za którymi nie stoimy.
  O innych sklepach nic nie twierdzimy: żaden nie daje nam sygnału dostępności.

**Skala: 39 zestawów jest wyprzedanych w LEGO, ale najtańsza cena zmienia się tylko
na pięciu.** Na pozostałych 34 oferta LEGO i tak nie była najtańsza.

| Zestaw | Było (LEGO) | Teraz |
|---|---|---|
| 76329 Maska Milesa Moralesa | 299,99 | 337,00 (Allegro) |
| 5007061 The Creative Bundle | 579,97 | brak ofert |
| 40722 Braille — niemiecki | 379,99 | brak ofert |
| 5006157 Play and Display Case | 274,99 | brak ofert |
| 88013 Technic Large Motor | 144,99 | brak ofert |

76329 to przypadek, dla którego ta zmiana ma sens: obiecywaliśmy w metaopisie 299,99 zł
w sklepie, który tego zestawu nie ma. Teraz meta mówi „od 337,00 zł w 2 sklepach".
Cztery pozostałe miały ofertę LEGO jako JEDYNĄ, więc hub przestaje obiecywać cenę —
i słusznie, bo nie ma gdzie kupić.

**Tabela cen nie zrobiła się pusta** i to wyszło samo: `TabelaCen` dokłada wiersz
„LEGO.com — oficjalna strona LEGO" z ceną KATALOGOWĄ, gdy w ofertach nie ma LEGO
(linia 40 komponentu). Czytelnik widzi więc cennik producenta bez daty, plakietkę
„wyprzedane w LEGO.com" przy tytule i tabelę, w której najtańsza jest realna oferta.
Nie planowałem tego — sprawdziłem po buildzie i zostawiam, bo wychodzi lepiej niż
pusty hub.

**Sprawdzone po buildzie (10002 strony):** plakietka na dokładnie 39 hubach, na 76447,
42211 i 21355 (przecenione, ale dostępne) jej nie ma i ich ceny się nie zmieniły.
Meta 76329: „od 337,00 zł w 2 sklepach, cena katalogowa 299,99 zł".

**Czego dalej nie ma:** wiersz LEGO w tabeli nie jest podpisany „wyprzedane" — to była
druga z dwóch opcji, które proponowałem, i Marek wybrał tę. Gdyby kiedyś miała dojść,
sygnał jest już policzony (`wyprzedaneWLego`), wystarczy przekazać go do `TabelaCen`.


## 2026-10-14 11:40 · CODE · Plakietka „wyprzedane w LEGO.com" na hubie — 39 zestawów

Domknięcie punktu z wpisu 11:10: etykieta `lego_pl_etykieta: niedostepne` była zapisywana
od 14.10, ale nikt jej nie renderował, więc hub pokazywał cenę za coś, czego w sklepie LEGO
w tej chwili nie kupisz.

- `src/lib/status.js` → `wyprzedaneWLego(nr)`. Trzy warunki: etykieta `niedostepne`
  z listingu, wpis **świeży** (`widzianyNaListingu`, te same 14 dni co reszta reguł
  listingowych) i **zestaw nie jest EOL** — gdy LEGO skończyło produkcję, „koniec produkcji"
  mówi więcej niż „wyprzedane" i dwie plakietki o tym samym byłyby szumem. Świeżość jest tu
  potrzebna, bo `lego-ceny.mjs` kasuje etykietę tylko dla zestawów obecnych w danym
  przebiegu na listingu: zestaw, który z listingu wypadł, zostałby inaczej „wyprzedany"
  na zawsze.
- `src/pages/zestaw/[nr].astro`: plakietka w rzędzie przy tytule, z tooltipem „w sklepie
  LEGO chwilowo go nie kupisz. Inne sklepy mogą mieć zapasy."
- `global.css`: `.badge-status--wyprzedane` w tej samej czerwieni co „wycofanie
  potwierdzone" — dla kupującego jedno i drugie znaczy „tu tego teraz nie weźmiesz" —
  ale osobną klasą, żeby dało się je kiedyś rozdzielić bez ruszania tamtej.

**Sprawdzone, nie założone:** 39 zestawów ma w katalogu etykietę `niedostepne` i **wszystkie
39 potwierdza dzisiejszy listing lego.pl** — zero rozbieżności. Plakietka wychodzi na
dokładnie tych 39 hubach, na 40723 (dostępny włoski alfabet) jej nie ma. Build 10002 strony.

**Czego ta zmiana NIE robi.** Tabela cen dalej pokazuje wiersz LEGO z ceną, bo w całym
module cen nie ma w ogóle pojęcia dostępności oferty — `TabelaCen`, `PasekCeny` i
`lib/oferty.js` nie mają ani jednego pola o tym, czy daną ofertę da się dziś zrealizować.
Dodanie tego to osobna robota (sygnał musiałby dojść do wiersza oferty i do liczenia
„najtańszej"), więc jej tu nie zaczynałem. Na razie plakietka przy tytule mówi to, czego
tabela nie powie.

## 2026-10-14 11:40 · CODE · Indeksacja: stan i dzienna kolejka „Poproś o zindeksowanie”

- Próbka URL Inspection API (300 adresów z sitemap, 14.10): artykuły 29/43 w indeksie, serie 32/69, prezentowniki 19/22, deale 5/15, huby 65/129 (22 z nich Google pamięta jeszcze z `noindex`). Mapy witryny Google czyta regularnie (pobrane 08–13.10, 0 błędów) — wąskie gardło to częstotliwość odwiedzin, nie zgłoszenie.
- Nowy `scripts/kolejka-indeksacji.mjs` wybiera codziennie ok. 10 niezindeksowanych adresów według priorytetu i zapisuje `materialy/indeksacja/kolejka.md`. Klikać musi człowiek albo Cowork w przeglądarce Marka — prośby o zindeksowanie nie ma w API, a Indexing API Google dopuszcza tylko oferty pracy i transmisje wideo.
- Kolejka na 14.10: `/o-nas/` i 9 artykułów (m.in. recenzje 60508, 75438, 77242, BAM Halloween, premiery jesień/święta).
- 14.10 po południu Cowork zgłosił całą listę: 10 z 10, żaden adres nie był w indeksie, bez limitu. Kontrola wejścia do indeksu: 19.10 (URL Inspection API).

## 2026-10-14 11:10 · CODE · Alfabet Braille'a w katalogu: cztery numery, pięć hubów po polsku

Z siedmiu pozycji „spoza katalogu" z wtorkowego łańcucha (wpis 10:30) dopisane cztery
zestawy klocków: **40655 francuski, 40722 niemiecki, 40723 włoski, 40724 hiszpański**,
wszystkie 379,99 zł i 287 elementów. Trzy pozostałe (88011, 88019, 88021) zostają poza
katalogiem — to komponenty Powered Up, nie zestawy.

**Seria: Archiwum, zgodnie z regułą z RUNBOOKA**, nie z braku pomysłu. Własną serię dostaje
linia, która ma co najmniej 10 zestawów; Braille Bricks ma na LEGO.pl pięć pozycji plus
wycofany polybag 30711, więc idzie tam, gdzie od dawna leżał **40656 angielski** — ten jeden
był w katalogu od zaciągu z Rebrickable.

**Czego nie ma: alfabetu polskiego.** LEGO sprzedaje w polskim sklepie pięć wersji
językowych — angielską, francuską, niemiecką, włoską i hiszpańską — i ani jednej polskiej.
To jest informacja zakupowa sama w sobie, gdyby ktoś kiedyś pisał o tej linii.

**Nazwy przepisane na polskie, wszystkie pięć.** Reguła „pozycje z Rebrickable zostają po
angielsku" ma uzasadnienie „nie ma do czego wyrównywać" — tu jest: LEGO.pl podaje własne
polskie nazwy, więc wziąłem je verbatim z zaciągu („Zabawa z alfabetem Braille'a —
francuski" itd.). Poprawiłem przy okazji 40656, żeby piątka nie była rozjechana. Pole
`zrodlo` zostaje `rebrickable` — mówi, skąd wpis, nie skąd nazwa.

**Łańcuch domknięty dla tej czwórki:** `katalog-z-rebrickable.mjs --numery` (status `eol`,
jak zawsze) → `lego-ceny.mjs` z tego samego zaciągu z 14.10 (status `dostepny`,
`lego_pl_widziano`, cena LEGO 379,99 w feedzie) → `wczytaj-rrp.mjs`: **0 nowych wpisów**,
bo RRP 379,99 siedzi w rejestrze dla wszystkich pięciu od 28.08 — brakowało tylko katalogu,
czyli hubów → `lego-redirects.mjs`: +4 linki do kart produktu (986 → 990).
Katalog 9822 → 9826, feed 8769 → 8773.

**Dwie rzeczy, o których trzeba wiedzieć, zanim ktoś się zdziwi.**
1. **40722 niemiecki jest na LEGO.pl „Niedostępne"**, a mimo to ma u nas status `dostepny`
   i cenę 379,99 w tabeli. Tak działa `lego-ceny.mjs`: status `dostepny` dostaje wszystko,
   co stoi na listingu z ceną, a wyprzedanie trafia do osobnego pola `lego_pl_etykieta:
   niedostepne`. Pola nikt jeszcze nie renderuje — `premiery.js` czyta z niego tylko
   `przedsprzedaz` i `zamowienie_oczekujace`. Nie ruszałem tej reguły, bo dotyczy wszystkich
   zestawów, nie tylko tych czterech, ale hub pokazuje teraz cenę za coś, czego w tej chwili
   nie kupisz.
2. **Wszystkie cztery huby mają `noindex, follow`** — to projektowana reguła `seo.js` dla
   cienkich hubów (jedna oferta, zero tekstu redakcyjnego), nie usterka. Odpowiadają 200
   i są poza sitemapą. Indeksowalne zrobiłby je tekst redakcyjny, a nie zmiana w danych.


## 2026-10-14 10:50 · CODE · Dane wt: awaria LEGO.pl nie zabiera już cen Ceneo i Smyka

- Nowy prompt (trigger `trig_01XjJhujd8FnXsGWAHQeUBqd`, ta sama sesja). Błąd w krokach LEGO.pl (alarm parsera, brak kredytów Firecrawla, urwany listing) → runner pomija resztę kroków LEGO.pl, ale robi ceny Ceneo, Lidla, MediaMarktu i Smyka, build i push, a awarię wpisuje do „Kto co robi”. Przed zaciągiem kasuje pliki z /tmp, żeby nie wczytać danych z poprzedniego wtorku. Szczegóły: `materialy/zadania-cykliczne.md`, historia 14.10.

## 2026-10-14 10:40 · CODE · 10030 Imperial Star Destroyer miał zdjęcie plecaka Ninjago

- Przyczyna: feed Planety Klocków ma licencjonowane plecaki, piórniki i walizki z kodem „numer-4 cyfry" (`LEGO CITY 10030-1601 Plecak przedszkolny`, `10052-2103 Piórnik`, `20149-0026 Walizka`). `feedy-lego.py` brał z tytułu numer sprzed myślnika, a gałąź PK w ogóle nie miała filtra gadżetów. W feedzie PK z 14.10 jest 15 takich pozycji na 4 numerach: 10030, 10050, 10052, 20149. Hub ma tylko 10030.
- Poprawka: `WZORZEC_KOD_GADZETU` (`\d{4,7}-\d{4}`) w `nie_zestaw()` i w gałęzi PK. Cała lista słów nie_zestaw celowo nie weszła do PK — zdjęłaby prawdziwe zestawy („Kreatywna walizka" 10713, „pudełko" 10696).
- Dane: z `oferty_feed.sety` usunięte pole `zdjecie` dla tych 4 numerów (wpisy zostają). 10030 bierze teraz zdjęcie z Rebrickable; wgrane do R2 razem z wariantami WebP.
- Cena 11 999 zł to oferta z Allegro „LEGO Star Wars 10030 Gwiezdny niszczyciel UCS nowy" (zestaw z 2002 r., nowy, cena kolekcjonerska) — nie błąd. `redirects.planetaklockow.10030` wskazywał plecak — usunięty za zgodą Marka (14.10). PK nie ma szablonu wyszukiwania w `sklepy.json`, więc bez wpisu link do PK dla 10030 po prostu nie istnieje.

## 2026-10-14 10:30 · CODE · Strażnik parsera LEGO.pl, koniec konfliktów w dzienniku, 40824 potwierdzony

- **Parser LEGO.pl:** `firecrawl-legopl.mjs` liczy na każdej stronie kafelki i produkty odczytane przez parser. Gdy z którejś strony zgubi więcej niż 2, gdy wyprzedaż jest pusta, gdy brak przecen albo gdy pełny przebieg da mniej niż 800 zestawów — przerywa z kodem 3 i niczego nie zapisuje. Sprawdzone na żywo: poprawiony parser 39/39, parser sprzed b4559ca podstawiony na próbę → alarm (0 z 19 na wyprzedaży). Szczegóły: RUNBOOK, „Czwarta pułapka". Dane wt przy alarmie przerywa i zgłasza w „Kto co robi".
- **Dziennik:** `.gitattributes` z `DZIENNIK.md merge=union` — dwa wpisy dopisane w tym samym miejscu przez różne sesje scalają się przy rebase bez konfliktu (sprawdzone na repo testowym). Pliki `src/data/*.json` celowo bez tego — tam konflikt dalej zatrzymuje runnera.
- **40824** Uroczy kanarek Tweety w `deale_potwierdzone.json` (69,99 zł, Media Expert, decyzja Marka).

## 2026-10-14 09:10 · CODE · /podglad/ usunięty (decyzja Marka)

- Skasowane `src/pages/podglad/glowna-obecna.astro` i `deale-obecne.astro` — kopie strony głównej i deali sprzed v2 (29.09). Przypomnienie „Usunąć /podglad/” odpaliło się dziś, Marek potwierdził. Powrót możliwy z historii gita (`7f488de`).

## 2026-10-14 08:50 · ŁOWCA · Do zrobienia

**40824 Uroczy kanarek Tweety: post z 13.10 poleca 69,99 zł w Media Expert, a sito „podejrzany rynek" ukrywa tę ofertę na stronie (−52% od RRP 144,99 zł, brak wpisu w deale_potwierdzone.json)**
**Mamy?** — częściowo: post `/deale/deal-40824-kanarek-tweety-minimum/` jest opublikowany, ale oferta ME nie wchodzi do tabel cen ani huba `/zestaw/40824/`
**Zrobić:** — sprawdzić kartę ME (Łowca potwierdził 69,99 zł na stronie 13.10 i 14.10) i dopisać 40824 do `src/data/deale_potwierdzone.json`
**Kto:** — Marek (decyzja)
→ zamknięte 14.10: Marek potwierdził, 40824 (69,99 zł, Media Expert) w `deale_potwierdzone.json` — oferta wraca do huba i tabel cen
## 2026-10-14 10:30 · CODE · Wtorkowy łańcuch dokończony: rejestr RRP i linki LEGO

Po poprawce parsera (wpis 08:55) dwa ostatnie ogniwa łańcucha, na tym samym zaciągu
z 14.10 — bez ponownego pobierania, przez `--z-pliku`.

**Rejestr cen katalogowych: zero zmian i to jest dobra wiadomość.** Plik RRP policzony
z zaciągu dał 938 cen dla zestawów z katalogu. `wczytaj-rrp.mjs`: **0 nowych, 0 konfliktów**,
938 już w rejestrze (rejestr ma 982 pozycje). Zero konfliktów jest tu najważniejszą liczbą —
rejestr jest write-once i ma pierwszeństwo przed wszystkim, więc gdyby poprawiony parser
podstawił gdziekolwiek cenę wyprzedażową jako katalogową, zobaczylibyśmy to właśnie tutaj.
Sprawdzone też punktowo: 10295 → 729,99 (nie 583,99), 76447 → 339,99 (nie 271,99),
42211 → 439,99 (nie 263,99). Reguła „promocja ⇒ bierz `priceBefore`" działa.
`kontrola-rrp.mjs` bez nowych sygnałów: te same 14 setów z rynkiem poniżej połowy cennika
co wcześniej, 13 z nich już ukrytych do potwierdzenia, 10276 nadal z niepotwierdzonym RRP.

**Linki do kart produktu: +5 wpisów (981 → 986).** I znowu to te same zestawy, które gubił
parser: 71494 Zoey's Time Owl, 76785 Thing's Apartment, 75682 Elphaba & Glinda, 77055 Able
Sisters, 77054 Leif's Caravan — wszystkie dziś przecenione. Czyli brak przecenionych kafelków
odbijał się nie tylko na cenach, ale i na linkach: przez te zestawy worker musiał polegać na
cudzym przekierowaniu `lego.com/pl-pl/product/<numer>`.

Pozostałe mapy w `redirects.json` bez zmian (planetaklockow 1877, allegro 7114, empik 4821,
ceneo 1760, mediaexpert 850, xkom 788, smyk 704, lidl 91, mediamarkt 55). `src/worker.js`
i `wrangler.toml` nietknięte — zmiana jest wyłącznie w danych, które worker czyta, a brak
wpisu i tak ma fallback. Build 10000 stron.

**Siedem pozycji spoza katalogu serwisu** (do obejrzenia ludzkim okiem, nie wchodzą do
rejestru): 40655, 40722, 40723, 40724 — Zabawa z alfabetem Braille'a w czterech językach
po 379,99 zł — oraz Powered Up: 88011 silnik pociągu 57,99, 88019 zasilacz USB 144,99,
88021 akumulator 124,99. Alfabet Braille'a to zestawy klocków, więc jeśli mają u nas być,
dopisuje je Scout albo `katalog-z-rebrickable.mjs`; trzy ostatnie to komponenty, nie zestawy.


## 2026-10-14 08:55 · CODE · Parser listingu LEGO.pl gubił każdy przeceniony zestaw

**Przyczyna, inna niż wczorajsza hipoteza z Radaru.** Nie chodziło o to, że listing nie
oddaje pozycji przecenionych — oddaje je. Gubił je nasz parser: kafelek z obniżką zapisuje
obie kwoty i rabat w JEDNEJ linii (`729,99 zł583,99 zł\- 20%`), a `parser-legopl.mjs`
szukał kwoty stojącej samotnie w linii. Nie łapał żadnej, więc `kwoty.length === 0` i cały
produkt leciał przez `continue`. Dowód bez domysłów: dział wyprzedaży LEGO.pl ma 74
produkty, a nasz parser wyciągał z jego pierwszej strony **zero**.

**Drugi skutek, groźniejszy od cen.** Zestaw nieobecny na listingu przez 14 dni dostaje
w `katalog.json` status `eol`, więc dłuższa wyprzedaż oznaczałaby przecenione zestawy jako
wycofane. Tym razem nie zdążyło — ostatnie widzenie 06.10, próg mijał 20.10.

**Co zmienione**
- `parser-legopl.mjs`: kwoty czytane z całej linii, ale tylko gdy po ich wycięciu nie
  zostaje nic poza „zł", rabatem i interpunkcją; zdanie „Najniższa cena z 30 dni przed
  obniżką" odrzucane osobno (raz niesie cenę obniżoną, raz katalogową). Sklejone etykiety
  („Podwójne punktyWyprzedaż- 20%") rozcinane na granicy mała→WIELKA litera, żeby `status`
  niósł stan produktu, a nie nazwę akcji marketingowej.
- `firecrawl-legopl.mjs`: zaciąg chodzi po dwóch listingach (katalog + dział wyprzedaży),
  `--strony` ogranicza każdy osobno.
- RUNBOOK → „lego.pl: dostępne przez Firecrawl", czwarta pułapka, z testem regresji bez
  kredytów (zrzut markdownu działu wyprzedaży + parser na pliku).

**Efekt w danych.** Zaciąg: 1330 pozycji, **945 zestawów** — wobec 922 z wtorku i 896
z dzisiejszego porannego przebiegu na starym parserze. Odświeżonych cen LEGO: 969;
z 06.10 zostały 4 zestawy, których listing naprawdę nie ma (42653, 71440, 76323, 76325).
Z 43 wcześniej gubionych wróciło 39 — i każde z nich jest akurat przecenione, co domyka
diagnozę.

**Wyprzedaż jako drugi listing dołożyła ZERO pozycji** — wszystkie 74 produkty działu były
już w katalogu po poprawce parsera. Zostawiam ją mimo to jako kanarka: gdyby przecenione
kafelki znowu zaczęły wypadać, ten listing pokaże to od razu. Cztery kredyty tygodniowo.

**Sprawdzone na stronie:** `/zestaw/76447/` pokazuje 271,99 zł z LEGO (było 339,99 z Ceneo),
podobnie 42211 (263,99 zamiast 292,17 z Ceneo), 71494 (87,49 zamiast 112,77 z Allegro)
i 80118 (203,99 zamiast 339,99). Build 10000 stron.

**Czego pilnować przy najbliższym wtorku:** 42653, 71440, 76323 i 76325 są nieobecne od
06.10. Jeśli nie wrócą do 20.10, skrypt oznaczy je jako EOL — i tym razem słusznie, bo
parser przeceny już widzi. 10302 Optimus Prime, 75429 i 72035 poszły na EOL w porannym
przebiegu (nieobecne od 29.09); mój zaciąg, już z poprawką, też ich nie widzi, więc ten
werdykt się broni.

## 2026-10-14 08:40 · CODE · Przedsprzedaż w Nowościach, zdjęcia nowości, 18 dużych zestawów, sklepy na /wycofania/

- **Przedsprzedaż (prośba Marka):** zestaw, który LEGO.com już sprzedaje („Przedsprzedaż” albo „Zamówienie oczekujące” na listingu lego.pl), jest w Nowościach z plakietką „Przedsprzedaż”, a jego hub pokazuje tabelę cen z LEGO.com zamiast samej zapowiedzi. „Wkrótce dostępne” zostaje w Zapowiedziach. Etykietę zapisuje `lego-ceny.mjs` w katalogu (`lego_pl_etykieta`), co wtorek w przebiegu Dane wt; dziś zaciąg zrobiony ręcznie (896 zestawów): 12 w przedsprzedaży, 16 w zamówieniu oczekującym, 4 „wkrótce”, 38 wyprzedanych. Nowości 134 wiersze, w tym 14 w przedsprzedaży (67006, 67008, 67009, 72052–72061, 21065).
- **Zdjęcia nowości:** `generuj-obrazy.mjs` (poza buildem, czyli w przebiegu Łowcy) dociąga zdjęcie z Rebrickable albo Brickset dla zestawów bez źródła; dziś 7 dopisanych i wgranych do R2 (40909, 67006, 67008, 67009, 67012, 71873, 71875). Bez zdjęcia nigdzie: 21375 (przeciek), 71835.
- **18 dużych zestawów do sety.json** (Radar 11.10): Titanic, Wieża Eiffla, Muzeum historii naturalnej, Neuschwanstein, Ogród botaniczny, Włoska riwiera, Goonies, Rodzinna choinka, Zamek Pięknej i Bestii, Hogwart, Sokół Millennium, Gwiazda Śmierci, Baratie, Wieża Avengersów, Arkham Asylum, Nora, Hogsmeade, T. rex — opisy z faktów Brickset API, oferty z feedu.
- **/wycofania/:** pod ceną „w N sklepach” (Radar 26.09).
- **Decyzje Marka:** 72306 — kupno odkładamy; Proshop — ponaglenie, gdy wzrośnie ruch. Obie pozycje Radaru zamknięte.


## 2026-10-14 08:20 · RADAR · Do zrobienia

**faniklockow.pl · 13.10** — Wypisali zestawy najtańsze teraz na LEGO.pl pod okno podwójnych punktów; sprawdzone u źródła: LEGO.pl ma dziś **74 produkty na wyprzedaży** (−20 do −50%).
**Mamy?** — częściowo: 43 zestawy mają w `oferty_feed.json` cenę LEGO z **06.10**, choć 922 dostały 13.10 z wtorkowego Routine — i każdy z 11 sprawdzonych z tej 43 jest dziś przeceniony.
**Zrobić:** — sprawdzić, dlaczego `firecrawl-legopl.mjs` → `lego-ceny.mjs` z 13.10 ominął te 43 (hipoteza: listing nie oddaje pozycji przecenionych), i dociągnąć ceny z `/categories/sales-and-deals`.
**Kto:** — Code (dane, strona)

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


## 2026-10-13 17:20 · CODE · Nowe logo: granatowy klocek + „tylkoklocki.pl" (Rubik)

- Decyzja Marka po czterech rundach propozycji: znak = granatowy klocek 2×2 z żółtymi wypustkami (bez kreski „%”), napis „tylkoklocki.pl" w całości granatowy, Rubik ExtraBold na krzywych.
- Wymienione: logo w nagłówku i stopce (SVG zamiast tekstu z CSS), `favicon.svg/.ico`, `apple-touch-icon.png`, domyślny `og.png`, logo w stopce obrazów OG artykułów — przegenerowane 31 starych i dorobione 31 brakujących (`public/og/`, nikt nie puszczał `generuj-og.py` po nowych tekstach).
- Źródło: `scripts/generuj-logo.py` + `scripts/logo-rastry.mjs`; zasady użycia: `redakcja/system-wizualny.md`, sekcja „Logo”. Plików logo nie poprawiamy ręcznie.
- Nagłówek na telefonie: logo 18–19 px, bo przy 20 px na 375 px przycisk Menu spadał do drugiej linii (sprawdzone 320–1280 px).

## 2026-10-13 09:30 · CODE · Raporty runnerów w formacie „Kto co robi” + MediaMarkt 21034

- Prośba Marka: każdy runner zaczyna raport od sekcji „Kto co robi” (cztery linijki na pozycję: co / Mamy? / Zrobić / Kto — jak Radar), a pozycje dla ludzi zapisuje też w dzienniku jako „<RUNNER> · Do zrobienia”. Kontroler w poniedziałek zbiera wszystkie do maila „Zadania bez właściciela” dla Marka i Piotra, pogrupowane według „Kto”. Nowe triggery i ID: `materialy/zadania-cykliczne.md`, „Historia zmian” 13.10; zasada: RUNBOOK „Format raportów runnerów”.
- `scripts/archiwum-dziennika.mjs` trzyma w dzienniku każdy wpis „<RUNNER> · Do zrobienia” do zamknięcia (dotąd tylko RADAR).
- Zamknięcie pozycji = linia „→ zamknięte <data>: …” pod nią; dopisuje Code po Twojej decyzji (albo Ty sam, wprost w pliku).
- MediaMarkt: 21034 Londyn sprawdzony ręcznie i dopisany (574470e); importer ma listę `potwierdzone_numery`.

## 2026-10-13 08:20 · RADAR · Do zrobienia

**fanklockow.pl + faniklockow.pl · 12.10** — Oba serwisy opisały okno 13–19.10 na LEGO.pl (podwójne punkty Insiders i gratis 40909 Restauracje świata: Włochy od 745 zł), które zaczęło się dzisiaj.
**Mamy?** — tak: `/kalendarz-promocji-lego/` (sekcja `#pazdziernik-punkty`), ale status był „przewidywane", a okno `#gratis-pazdziernik` wisiało jako „trwa, 8.10 – ?" dziewięć dni po starcie.
**Zrobić:** — zrobione w tym przebiegu: kalendarz przestawiony na „trwa" i uzupełniony liczbami z regulaminu LEGO.pl (745 zł, 13–19.10, wartość upominku 81,99 zł, jeden na gospodarstwo domowe, bez zestawów BLDP, podwójne punkty bez łączenia z kuponem); okno 450 zł zamknięte datą 12.10; hub `/zestaw/40909/` miał wpisane „kwoty dla polskiego sklepu nie podał na razie nikt" — poprawione.
**Kto:** — Code (dane, strona) → zamknięte 13.10

**Uwaga do bazy, nie do redakcji.** Baza konkurencji nie trzyma zrzutu menu zklockow.pl,
więc zdania „nowa sekcja" nie da się tam dziś udowodnić — widzę m.in. `/gwp-lego`,
`/okolicznosciowe-lego` i `/odkrywaj/karty-podarunkowe-lego` i **nie wiem, czy są nowe**.
Przy najbliższej okazji warto zapisać pełną listę pozycji ich menu jako punkt odniesienia.
Druga rzecz: faniklockow przeniósł tekst o Hello Kitty z `/2026/10/05/` na `/2026/10/06/`
i w porównaniu po samym URL wyszedł jako nowy, choć leży w bazie od 06.10 — przy tym
serwisie dedup robimy po tytule, nie po adresie.

→ zamknięte 13.10.2026: kalendarz i hub 40909 poprawione w przebiegu Radaru (c8af1a5).

## 2026-10-13 05:25 · SCOUT · Sygnały wycofań dla runnera Wycofań
- **Ponad 300 zestawów oznaczonych przez LEGO „Einstellung in Kürze" na grudzień** — StoneWars,
  https://www.stonewars.de/angebote/doppelte-lego-insiders-punkte-oktober-2026/ (12.10, 22:30):
  po fali z połowy roku LEGO oznaczyło na grudzień kolejne 300+ zestawów; serwis prowadzi własną
  „LEGO EOL Liste 2026" opartą na datach EOL zapisanych u LEGO (niezależną od plakietek „Ostatnia
  szansa" w sklepie), która sięga jeszcze dalej, oraz redakcyjną dziesiątkę z 30.09. Numerów w tym
  tekście nie ma — są w tamtej liście i w tekście Top 10, do weryfikacji u źródła.
- **40909 Restauracje świata: Włochy** — ten sam tekst: gratis sprzedawany tylko 13–19.10.2026,
  a termin końca produkcji podany jako 12/2026. Dla nas bez konsekwencji (gratis, `bez_rrp`),
  ale jeśli runner prowadzi statusy gratisów, to data domknięcia.

## 2026-10-12 14:50 · CODE · MediaMarkt podpięty (decyzja Marka D2)

- Feed TD 96394 (cały sklep, 15 244 produkty) przez ten sam importer co Ceneo i Lidl: `node scripts/ceneo-feed.mjs --sklep mediamarkt`. Nowe opcje w `feedy.json`: `filtr_nazwy`, `pomin_nazwy` (OUTLET, książki, gry), `numer_z_pola: MPN`, `tylko_znane` (numer z nazwy musi mieć wspólne słowo z nazwą katalogową — MediaMarkt podpisał „Figurkę Kapitana Ameryki” numerem 76265).
- Wynik: 54 zestawy z ceną i linkiem `pdt.tradedoubler.com` (`redirects.mediamarkt`), 42 oferty w `sety.json`, 54 wpisy historii cen; MediaMarkt najtańszy w 5 zestawach (np. 75408 za 197,99 zł).
- Odświeżanie: wtorkowy przebieg Dane wt (krok 6 woła importer bez argumentów, więc bierze wszystkie aktywne feedy TD z `feedy.json`).
- Prowizja 1,5%, cookie 30 dni.

## 2026-10-12 14:20 · CODE · Odczyt paneli przez Coworka (audyt 12.10, sekcja 13)

- GSC 09.10: **831 zindeksowanych** (18.09: 807, od 22.09 bez zmian), 3 181 nie: noindex 2 284, wykryta-niezindeksowana 647, **404: 220**. To jest punkt odniesienia dla Kontrolera (kamień 4).
- Noindex w `sitemap-zestawy` (239) to stary crawl, nie reguła: 10365 crawlowany 10.09, od tamtej pory indeksowalny. Wąskie gardło to częstotliwość crawla.
- Cloudflare 30 dni: 82% wizyt z Chin (boty), Polska ok. 20 dziennie.
- MediaMarkt 1,5%, cookie 30 dni, deep linking i porównywarki dozwolone; PK 3%, cookie 30 dni; TD saldo 40,40 zł, płatność 26.10; TD kliki 6–12.10: 139 (fala botów), brak komunikatów o jakości. Rejestr afiliacji uzupełniony.
- Do odczytu przy następnej okazji: lista 220 adresów 404 (eksport z GSC), panele Allegro i SalesMasters, Adtraction, Rakuten.

## 2026-10-12 13:10 · CODE · Filtr botów (D1) i punkty z sekcji 11 audytu

- **Worker `/idz/` (1c663ad, zgoda Marka D1):** referer z naszej domeny musi mieć ścieżkę z ukośnikiem na końcu i nie wskazywać `/idz/`; podrobionego referera nie ratuje już Sec-Fetch-Site; `/promocje-lego/` i `/aktualnosci/` dopuszczone. `diagnoza.mjs` wysyła `x-tk-test` → w statystyce „test”. Symulacja na 30 dniach: 186/186 kliknięć z PL bez zmian, 703 z 751 spoza PL odrzucone.
- `noindex-do-opisania.py` liczy regułę z `ocenaHubu()` przez nowy `scripts/ocena-hubow.mjs` (bez własnej kopii); xlsx odświeżony: 8 356 hubów, 185 z ≥3 sklepami.
- Karuzele serii i Nowości: pierwszeństwo dla hubów indeksowalnych (karty na noindex 59 → 38 z 336).
- JSON-LD (BreadcrumbList + CollectionPage) na 7 listingach; `bez_rrp` wygrywa z RRP w `cenaKatalogowaSetu` (40896 GWP przestał udawać ofertę LEGO.com za 81,99 zł).
- Baner „Akcja zakończona” w artykułach po `wazne_do` (Dzień Chłopaka, weekend x-kom).
- Luki RRP: 11501 = 249,99 zł (lego.pl), 7 saszetek 30xxx i 40902 z `bez_rrp`; **40910, 40912, 40890 dla Scouta** (Brickset nie oddał danych w scrapie). Z 31 opisów `dla_afol` usunięte zdanie „Zestawu nie ma jeszcze w bazie Bricksetu…”.
- `diagnoza.mjs` czyta statusy programów TD i porównuje z rejestrem afiliacji.
- Bez zmian: sito wieku w `huby.js` — oferty >14 dni i tak nie są pokazywane, a trzy wskazane huby istnieją z katalogu; zmiana groziłaby 404 dla hubów spoza katalogu.

## 2026-10-12 12:05 · CODE · Audyt po przebudowie 11.10 i przeniesieniu runnerów

Raport: `materialy/audyt-2026-10-12.md` (+ 4 raporty cząstkowe w `materialy/audyt-2026-10-12/`).
- Strona i runnery bez regresji; 16 Routines, każdy runner z pushem ma commity zgodnie z harmonogramem.
- **MediaMarkt zaakceptowany w TD od 20.08, RTV Euro odrzucony 03.09** — wyszło z API dopiero dziś; rejestr poprawiony, linków MM jeszcze nie ma (czekają na stawkę z panelu).
- Od 30.09 zero transakcji w sieciach z API; wyświetlenia w Google ~4× niżej niż przed 22.09; główne listingi bez crawla 27 dni.
- Poprawione od ręki: notatka robocza w `bez_rrp` (40897, 40900), nazwa źródła przecieku 75484, odmiana „323 zestawy” na /wycofania/, stare ID triggerów w NARZEDZIA i zadaniach cyklicznych.
- Sesja Scouta po kompakcji: 169 tys. tokenów — nowa sesja niepotrzebna.
- Decyzje dla Marka: D1–D10 w sekcji 10 raportu (najpilniejsze: filtr botów w workerze, MediaMarkt, ponowienie zgłoszeń, odczyt paneli przez Coworka).

## 2026-10-12 10:05 · CODE · Radar, Wycofania, Łowca i Kontroler w nowych sesjach
- Stara sesja Radaru `session_01UFkqKNwQexnxLN34HotM4G` doszła do 708 tys. z 1 mln tokenów. Nowa: `session_01N5Bt5oyhgJzLB1FJff9Q3H` (Opus 5, repo z pushem), trigger `trig_012neuySD2HrJgptvXLe2fN9` — ta sama nazwa, cron 08:00 PL i prompt (dopisana tylko wskazówka o całej linii znacznika w dzienniku). Stary trigger `trig_01WgDxbN6eB2QzAZha7dWBfx` skasowany po dzisiejszym przebiegu; starej sesji nie kasujemy (archiwum kontekstu). Pamięć Radaru między przebiegami to `konkurencja_baza.json`, więc nowa sesja niczego nie traci.
- Wycofania też w nowej sesji: `session_01LbKufez6akmviSBqoBRxhC` (Fable 5), trigger `trig_01HtJFSA2mKYUk82ppwoBEca` — prompt identyczny ze starym. Stary `trig_01MGb7VnMvdSHp9Jwa7HyQ69` skasowany po dzisiejszym przebiegu (commit 1f5b561); stara sesja `session_01KfWF14fJvwK78sBVG6XAz8` (581 tys. tokenów) zostaje jako archiwum. Pamięć runnera to `wycofania.json` i adnotacje „→ Wycofania” w dzienniku.
- Łowca też w nowej sesji: `session_01Qae65PWcmFBg2VLncXHB8Y` (Fable 5, sesja 3), trigger `trig_01WCvLUvL5u2kNKc5GVR7xhj` — prompt identyczny (12 528 znaków). Stary `trig_01RjjGRUpJ8QVvhBQrLXiy7Z` skasowany po dzisiejszym przebiegu (commit 15501f4); stara sesja `session_01SdxKtAvW8UmktsuXrsPYga` (528 tys. tokenów) zostaje jako archiwum. Pierwszy przebieg w nowej sesji: 13.10 08:30.
- Kontroler też w nowej sesji: `session_01E7pTLYKdkzz5UgEQ58GMPp` (Opus 5), trigger `trig_01XGtqSHKVQ9cL2uERVx3Gmi` — prompt identyczny (9 801 znaków). Stary `trig_0167qmnWn3Qjjz8HTwZU1uEP` skasowany po dzisiejszym raporcie (commit 8076ba2); stara sesja `session_01M8qMJFfKHEozBSGXjAKP4n` (471 tys. tokenów) zostaje jako archiwum. Pierwszy raport w nowej sesji: 19.10 09:00; punkt odniesienia dla trendów to `materialy/kontroler-2026-10-12.md` w repo.

## 2026-10-12 05:20 · SCOUT · Korekta 40908 i pytanie o wyceny gratisów z serii Restauracje

**Nowości:** brak. Okno przyrostowe Bricksetu (od 11.10) dało pięć rekordów bez ani jednej nowości
(dwa roczniki archiwalne, jeden Gear, 30730 Trainer Supplies mamy od dawna z ceną i ofertami,
40909 dotknięta ponownie). PromoBricks ma najświeższe teksty z 09.10, StoneWars od wczoraj
tylko tekst o MOC-u — żaden serwis nic nie dodał.

**Poprawione dziś (40908 Restauracje świata: Grecja):** mieliśmy premierę `2026-01` i zdanie, że to
„ekskluzyw sklepu LEGO, a nie prezent za zakupy". Oba błędne — Brickset podaje `LEGO Gift with Purchase`
i start 2026-08-11, a tabela serii w PromoBricks daje 254 elementy i release 08/2026. Premiera na `2026-08`,
`opis` (był pusty) napisany, `dla_rodzica` i `dla_afol` przepisane. Wyleciało przy tym zdanie
„Zestawu nie ma jeszcze w bazie Bricksetu" — nieprawdziwe i niezgodne z regułą z 11.10, bo stan Bricksetu
nie jest tekstem dla czytelnika.

**Do decyzji (nie moja):** trzy restauracje z serii gratisów mają w `katalog.json` `cena_katalogowa`
ze źródłem „karta redakcyjna" — 40906 i 40907 po 84,99 zł, 40908 81,99 zł — a czwarta, 40909, dostała
`bez_rrp`. Żaden z tych czterech zestawów nie był sprzedawany osobno, więc albo wszystkie mają wycenę
dodatku, albo żadna. Sam tego nie zmieniam: ceny są append-only, a 40908 chodzi dziś na Allegro po 169 zł
i w Empiku po 278 zł, czyli „cena katalogowa" i rynek rozjeżdżają się trzykrotnie. Jeśli decyzja
pójdzie w stronę `bez_rrp` dla całej serii, zmieni się też to, co widać w tabelach cen w hubach.
↻ 14.10: nadal aktualne — decyzja czeka na Marka, dane bez zmian; od dziś pozycja stoi też
w sekcji „Kto co robi" raportu Scouta (**Kto:** Marek, **Zrobić:** jedna decyzja dla czterech
restauracji 40906–40909: wycena dodatku w `katalog.json` albo `bez_rrp` dla całej serii).
→ zamknięte 14.10.2026: decyzja Marka — ceny 40906, 40907 i 40908 zostają bez zmian, a 40909
dostaje 81,99 zł. Wpisane: `cena_katalogowa` w `sety.json` (zdjęte `bez_rrp`), nowa pozycja
w `katalog.json` przy trzech pozostałych restauracjach, przepisane zdanie w `dla_afol`.
`ceny_baza.json` dociągnie cenę sam przy najbliższym zrzucie.

**Przecieki:** wszystkie osiem rozstrzygniętych wpisów ma już `opis` dla czytelnika (11387, 11390, 40899,
40909, 67006, 67008, 71873, 71875). Bez opisu zostaje osiem wpisów otwartych, gdzie poza numerem, ceną
wg źródła i terminem nie ma na razie czego napisać.

**Luki katalogu (tylko raport):** opisane bez ceny katalogowej — 17 zestawów; rocznik 2026 w sprzedaży
bez wpisu w `sety.json` — 17; cała kolejka redakcyjna — 185 pozycji. `scripts/kolejka-redakcyjna.py`
nie przechodzi w tym kontenerze (brak `openpyxl`), więc liczby policzone osobno, pliku kolejki nie ruszam.

## 2026-10-11 19:50 · CODE · Nowości, serie, przecieki — przebudowa widoków; prompt Scouta
- `/nowosci/`: przełącznik Nowości (w sprzedaży, z datą, ceną i zdjęciem; znaczek PREMIERA) / Zapowiedzi (potwierdzone + przecieki z plakietką). `#zapowiedzi` otwiera drugi widok.
- Strony serii: karuzela „Nasze propozycje” 3×3 (losowanie dzienne z bieżącej oferty LEGO) zamiast boksów „z aktualnymi cenami”; nad tabelą rok premiery, sortowanie, szukaj, „tylko w sprzedaży”.
- `/przecieki/`: karty na pełną szerokość, opis zwinięty do 5 linii. Nowe pole `opis` (dla czytelnika, jedyne na stronie); `uwagi` zostają notatkami Scouta. 13 opisów napisanych.
- Scout: trigger `trig_013FFv1Aaj5gsCrAn27emwih` (ta sama sesja i cron): reguła opis/uwagi dla przecieków (pkt 6a–c) i reguła „opisy zestawów dla czytelnika” (pkt 2). Poprzednie `trig_013QRUCfL8ZAa45eDkQUkWXD` i pośrednie `trig_01AdmJcGkJ949YB9p9JEAwhu` skasowane.
- Opisy zestawów w `sety.json`: 37 pól w 27 zestawach przepisanych bez języka roboczego (RUNBOOK, „Opisy zestawów w sety.json”). Sesja Scouta: 757 tys. z 1 mln tokenów — blisko progu 850 tys.

## 2026-10-11 10:40 · CODE · Dwie recenzje Piotra na stronie (75434 K-2SO, 42650 Sklep dla zwierząt)

**Zrobione:** DOCX (Recenzje_005, Recenzje_006) przez `import-artykul.py`, treść Piotra bez zmian (tytuły też).
Dodane: frontmatter (Recenzje, 11.10, seo_tytul/seo_opis, 3 FAQ z faktów w tekście), tabele cen w miejscu
`[TABELA CENOWA]`, linki do stron serii (Star Wars, Friends), zdjęcia: 75434 — 2, 42650 — 3. Galerie z Planety
Klocków w `galerie.json` (81 → 83: 7 + 12 zdjęć), od razu wgrane do R2 (19/19, 0 błędów).
Kontrola: RRP 379,99 / 169,99, 845 / 375 el., 10+ / 6+, premiery 08.2025 / 01.2025 — zgodne z danymi.
Rynek dziś: K-2SO 272,99 zł (ME, Allegro) — poniżej progu Piotra 290 zł; 42650 113,98 zł (Empik) — poniżej 120 zł.
Adresy: `/artykuly/lego-75434-droid-straznik-k-2so-recenzja/`, `/artykuly/lego-42650-sklep-z-akcesoriami-dla-zwierzat-recenzja/`.
**Stan:** na main.

## 2026-10-11 08:20 · RADAR · Do zrobienia

**faniklockow.pl · 10.10** — Pokazali 75419 Gwiazdę Śmierci na Amazonie za 3249 zł jako „historycznie najtaniej"; nasze dane to potwierdzają, bo najniższy wpis w całej naszej historii cen to 3599 zł (27.09, Allegro).
**Mamy?** — nie tak, jak powinniśmy: 75419 **nie jest zestawem śledzonym** w `sety.json`, więc nie wchodzi do bloku „Dziś w dobrej cenie", nie ma śledzonego minimum i nie może dostać postu dealowego — przy trzech ofertach u nas i RRP 4199,99.
**Zrobić:** — dopisać do śledzonych 19 zestawów dostępnych, po RRP od 1000 zł i z min. dwiema ofertami, których tam nie ma.
**Kto:** — Code (dane, strona), osobnym przebiegiem

Pełna lista najpilniejszych z tych 19, licząc rabat od ceny katalogowej z `katalog.json`
i najtańszej oferty z `oferty_feed.json`:

| Zestaw | RRP | Najtaniej u nas | Rabat | Ofert |
|---|---|---|---|---|
| 75640 Baratie (One Piece) | 1299,99 | 886,98 | −32% | 7 |
| 71043 Zamek Hogwart | 2049,99 | 1509 | −26% | 5 |
| 43263 Zamek z Pięknej i Bestii | 1199,99 | 921,94 | −23% | 4 |
| 21359 Włoska riwiera (Ideas) | 1199,99 | 957,58 | −20% | 4 |
| 76457 Hogsmeade – edycja kolekcjonerska | 1649,99 | 1424,51 | −14% | 3 |
| 75419 Gwiazda Śmierci | 4199,99 | 3599 | −14% | 3 |

Blok „Dziś w dobrej cenie" iteruje po `sety.json`, więc żadnego z nich nie widzi.
Przy progu 15% i obowiązkowych kategoriach cztery pierwsze kwalifikowałyby się od razu.

**Dlaczego nie robię tego w tym przebiegu:** każdy dopisany zestaw potrzebuje notki
`dla_rodzica` i `dla_afol` — bez nich hub jest ubogi i nie łapie progu 300 znaków
tekstu redakcyjnego z `src/lib/seo.js`. Dziewiętnaście zestawów to osobne zadanie,
nie doklejka do Radaru, który ma działać zwięźle.

**Uwaga metodologiczna, żeby nikt nie powtórzył mojego błędu.** Pierwsza miara, którą
policzyłem, była fałszywa: 5688 zestawów „bez ceny katalogowej w `ceny_baza.json`"
i prawie zgłosiłem to jako dziurę w danych. To nie dziura, a **zaprojektowany zakres**:
`oferty_feed.json` jest migawką dla wszystkich setów z feedów (miniatury, tabele cen
w hubach), a `sety.json` i `ceny_baza.json` obejmują zestawy śledzone — mówi to wprost
`_meta` samego `oferty_feed`. Tych dwóch populacji nie wolno porównywać jak równych.

→ zamknięte 14.10.2026: 18 zestawów dopisanych do sety.json (z 19 jeden wypadł z kryterium) z opisami dla czytelnika na faktach z Brickset API i ofertami z feedu.

## 2026-10-10 18:00 · CODE · Archiwizacja dziennika nie wywozi już otwartych zadań

`scripts/archiwum-dziennika.mjs` zatrzymuje w dzienniku (niezależnie od wieku) wpis
„RADAR · Do zrobienia", dopóki pod nim jest mniej linii „→ zamknięte" / „→ Wycofania"
niż pozycji ze „Zrobić" innym niż „nic", oraz wpis „SCOUT · …wycofa…" bez żadnego
zamknięcia (propozycja Kontrolera 05.10, decyzja Marka 10.10). Cztery zadania wywiezione
05.10 wróciły z `materialy/dziennik-archiwum-2026-09.md` na koniec dziennika
(RADAR 16, 17, 18.09 i SCOUT 16.09).
**Dla drugiej strony:** runner Wycofań — w RADAR 16.09 czeka pozycja dla Ciebie
(21333, 21351, 21353, 21356, 76437: status „przewidywane" → sprawdzić, czy LEGO potwierdziło).
Zadanie zamyka się linią „→ Wycofania <data>: …" pod wpisem, tak jak przy sygnałach Scouta.

## 2026-10-10 16:30 · CODE · x-kom (aplikacja) i Media Expert (kod do 31.10): dwie aktualności + kody przy cenach

- `/artykuly/x-kom-aplikacja-weekend-lego-pazdziernik-2026/` – akcja tylko w aplikacji x-kom
  9–11.10 (mail SalesMasters): 9 zestawów, 7 rekordów notowań. Ceny tylko w aplikacji, więc
  NIE dopisane do tabel hubów.
- `/artykuly/media-expert-kod-lego-pazdziernik-2026/` – kod ME0110-311026 do 31.10 (64 zestawy
  z ceną, 45 rekordów wobec minimów sprzed 1.10, 5 taniej gdzie indziej) + PNU0910-1510 do
  15.10 (42239, 60511). Pełna tabela 64 pozycji.
- Odkrycie: ceny ME w naszych tabelach to ceny PO kodzie, a nigdzie nie było kodu – w listingu
  /promocje-lego/ dotyczyło to 47 ze 150 pozycji. Nowy `src/data/kody_rabatowe.json`
  (`scripts/me-kody.mjs`) + `kodRabatowy()` w `src/lib/oferty.js`: kod przy cenie w tabeli
  cen, pasku ceny, /promocje-lego/ i na głównej. RUNBOOK → „Kody rabatowe Media Expertu".
- Lista „tylko w Media Expert" z maila (13 zestawów) – nie pisaliśmy o wyłączności: 6 z nich
  sprzedaje też Empik, prawie wszystkie Allegro. Kalendarz 60510 – ME 84,99 zł, nie najtaniej
  (Ceneo 76,97 zł), bez osobnego tekstu.
**Dla drugiej strony:** gdy ME ogłosi nowy kod – `node scripts/me-kody.mjs`.

## 2026-10-10 08:20 · RADAR · Do zrobienia

**faniklockow.pl · 09.10** — Pokazali Proshop z dwoma wycofywanymi zestawami Star Wars taniej, niż mamy u siebie: 75397 Barka Jabby za 1639 zł i 75382 Tie Interceptor za 769 zł (plus ok. 20 zł wysyłki).
**Mamy?** — częściowo: oba zestawy są w `wycofania.json` i mają huby, ale najtańsze ceny, jakie pokazujemy, to Ceneo 1699 i Ceneo/Allegro 829 — o 60 zł wyżej na każdym.
**Zrobić:** — ponaglić zgłoszenie afiliacyjne do Proshopu przez Awin (status „wysłane" od 19.08.2026; feed Create-a-Feed co godzinę, prowizja 3%, cookie 30 dni).
**Kto:** — Marek (decyzja)

Dlaczego tego nie domykam sam: **ręcznie wpisanych cen Proshopu nie dodaję.** Bez
zaakceptowanego programu nie mamy feedu, czyli nie ma czym ich odświeżać, a jedna
wklejona kwota zestarzeje się w tydzień i zacznie kłamać na hubie. To ta sama
zasada, przez którą ceny trzymamy wyłącznie ze źródeł z harmonogramem odświeżania.

Różnica wobec sprawy Amazona z 07.10, którą świadomie odłożyłem: tam decyzja była
**zamknięta** w rejestrze („wracać przy realnej sprzedaży z serwisu"), a tu status
to **„wysłane"** — czekamy na odpowiedź Awina siódmy tydzień i można ją ponaglić.
Moment jest zły: siedem tygodni przed Black Friday nie mamy dostępu do sklepu,
który bije naszą najtańszą ofertę na dwóch zestawach z listy wycofań.

Czego NIE przepisałem: ich twierdzenia o statusie EOL tych dwóch zestawów. Sami
piszą, że LEGO nie wymienia ich w dziale „ostatnie sztuki", a wniosek wyciągają
z własnych źródeł — u nas oba i tak są już w `wycofania.json`, więc nic nie zmieniam.

→ zamknięte 14.10.2026: decyzja Marka — Proshop ponaglimy, gdy wzrośnie ruch; do tego czasu bez zmian (rejestr: „wysłane”).

## 2026-10-09 09:05 · CODE · Skutek CRO po 14 dniach (kliki-raport, Routine z 25.09)

Ruch ludzki z Analytics Engine (`blob6 = human`, bez bota z refererem `/zestaw/x/`),
źródło kliknięcia = referer (`blob4`). Okna: 11–25.09 (przed) i 25.09–9.10 (po,
CRO na produkcji od 25.09, commit 4153c05).

| | przed 11–25.09 | po 25.09–9.10 |
|---|---:|---:|
| łącznie | 139 | 95 |
| huby `/zestaw/` | 105 (76%) | 62 (65%) |
| prezentowniki | 0 | 4 (wszystkie z `/prezentowniki/lego-technic/`) |
| posty dealowe | 3 | 1 |
| strona główna | 8 | 10 |
| artykuły | 7 | 8 (6 z recenzji 60508) |
| /promocje-lego/ + /deale/ | 2 | 5 |
| bez referera | 14 | 2 |

**Spadek 139 → 95 nie jest skutkiem CRO.** Okno „przed” zawiera skok 14–16.09
(87 kliknięć w trzy dni, m.in. 14 bez referera i 10 na 76354). Bez niego „przed”
to ok. 6 kliknięć dziennie, „po” ok. 6,8 (bez skoku 27.09: ~5). Czyli poziom
płaski, a zmienił się rozkład: pierwsze kliknięcia z prezentowników (cel C),
więcej z głównej i /promocje-lego/, mniejszy udział hubów. Allegro nie zniknęło —
6098 ofert w feedzie z datą 08.10, najtańsze w 4515 zestawach, 28 kliknięć w oknie
„po” — więc nie jest czynnikiem. Liczby odsłon (mianownika konwersji) nie
sprawdzałem; bez niego nie da się powiedzieć, czy CTR hubów wzrósł.
**Dla drugiej strony:** nic.

## 2026-10-09 08:35 · RADAR · Do zrobienia

**fanklockow.pl · 08.10** — Na LEGO.pl trwa nieogłoszona publicznie promocja: przy zakupach od 450 zł gratis do wyboru, 40772 Świecący duszek albo 40760 BrickHeadz z Fortnite.
**Mamy?** — nie mieliśmy tego okna w kalendarzu.
**Zrobić:** — ZROBIONE: nowa sekcja `/kalendarz-promocji-lego/#gratis-pazdziernik` ze statusem „przewidywane" plus wpis w liście „co trwa teraz".
**Kto:** — Code (dane, strona)

**tylkoklocki.pl (znalezione przy okazji)** — Lista „co trwa teraz" pokazywała wrześniowe gratisy halloweenowe jako „trwa", dziewięć dni po zamknięciu okna.
**Mamy?** — tak, i to właśnie było błędem.
**Zrobić:** — ZROBIONE: oba wpisy przestawione na „zamknięte".
**Kto:** — Code (dane, strona)

**Reguła na każdy kolejny przebieg Radaru:** listę „co trwa teraz" na górze
kalendarza trzeba za każdym razem **sprawdzić pod kątem dat**, a nie tylko dopisywać
do niej nowe okna. Strona, której całym zadaniem jest mówić, co trwa dzisiaj,
kłamała w pierwszym bloku przez dziewięć dni i żaden przebieg tego nie zauważył,
bo wszystkie patrzyły tylko na to, co nowego u konkurencji.

Status nowego okna jest „przewidywane" świadomie: LEGO nie ogłosiło tej promocji
(serwis branżowy nazywa ją „sekretną"), końca nie podaje nikt, a warunki mamy
z jednego źródła. W sekcji jest arytmetyka z naszych danych — 40772 chodzi od
69,99 zł (Allegro), 40760 od 129,43 zł — czyli próg 450 zł ma sens tylko dla kogoś,
kto i tak kupuje powyżej tej kwoty. To ta sama reguła, którą wczoraj wpisałem
do FAQ po gratisie w Media Expert.

Druga rzecz do pilnowania: faniklockow założył aktualizowaną listę gratisów GwP
na 2026 i jego październik zgadza się z naszym co do joty (13–19.10, 40909 od 745 zł).
**To nie jest potwierdzenie** — oni też oznaczają te dane jako niepewne, więc mamy
dwie prognozy, nie potwierdzenie od LEGO. Nasz status „przewidywane" zostaje.

→ zamknięte 13.10.2026: sekcja `#gratis-pazdziernik` dodana w przebiegu Radaru 09.10.
→ zamknięte 13.10.2026: wrześniowe gratisy przestawione na „zamknięte” w przebiegu Radaru 09.10.

## 2026-10-08 08:30 · RADAR · Do zrobienia

**faniklockow.pl · 07.10** — Opisali gratis progowy w Media Expert: 43018 Lionel Messi za zakupy od 2500 zł, promocja zamknęła się tego samego wieczoru.
**Mamy?** — nie, i co gorsza nasze FAQ twierdziło nieprawdę: „gratisy GWP i punkty Insiders dotyczą tylko oficjalnego sklepu LEGO".
**Zrobić:** — ZROBIONE w tym przebiegu: FAQ w `/kalendarz-promocji-lego/` poprawione i dołożona reguła o realnej wartości gratisu.
**Kto:** — Code (dane, strona)

Co dokładnie weszło do FAQ: punkty Insiders faktycznie są wyłącznie w sklepie LEGO,
ale gratisy progowe potrafią zrobić i sklepy zewnętrzne — z datą i przykładem.
Plus reguła, która wychodzi z naszych własnych danych: **wartość gratisu podaje się
w cenie katalogowej, nie rynkowej.** 43018 ma w cenniku 779,99 zł, a 07.10 chodził
od 398,97 (Ceneo), 414,98 (Allegro) i 449,99 w samym Media Expert — czyli realna
korzyść z progu 2500 zł to około 400 zł, nie 780.

**Obserwacja o metodzie,** bo zdarzyło się to drugi raz w tym tygodniu: publikacja
konkurencji przydała się nie jako temat do napisania, ale jako **lista twierdzeń do
sprawdzenia u siebie** (06.10 w ten sam sposób wyszło „piątej serii" w bloku BLDP).
Warto czytać ich teksty również w ten sposób — zapisane też w `_meta` bazy.

→ zamknięte 13.10.2026: FAQ kalendarza poprawione w przebiegu Radaru 08.10.

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

## 2026-10-04 08:15 · RADAR · Do zrobienia

**fanklockow.pl · 03.10** — Wideorecenzja LEGO 72306 PlayStation, czyli świeżej premiery za 689,99 zł, która właśnie weszła w okno prezentowe.
**Mamy?** — częściowo: hub `/zestaw/72306/` z notkami dla rodzica i dla AFOL-a oraz wzmianki w trzech tekstach, ale recenzji nie ma.
**Zrobić:** — nowy tekst „Recenzja LEGO 72306 PlayStation" (kategoria Recenzje; wymaga dostępu do zestawu, więc najpierw decyzja, czy go mamy).
**Kto:** — Marek (decyzja o zestawie), potem Piotr (tekst)

Kontekst cenowy do tej pozycji: 03.10 Ceneo ma 619,99 zł, czyli **pierwszą ofertę
poniżej katalogu** 689,99. Jeszcze 29.09 wszystkie oferty zewnętrzne były wyższe
od cennika i na tej podstawie zapisaliśmy, że to odsprzedaż — Allegro 748,99 nadal
nią jest, ale dystrybucja już weszła.

→ zamknięte 14.10.2026: decyzja Marka — kupno 72306 odkładamy, recenzji nie będzie.

## 2026-10-03 09:30 · CODE · Nowy prompt Łowcy zweryfikowany na pierwszym przebiegu

Przebieg z harmonogramu 03.10 08:34 PL, commit `c87196a`. Zmiana z 02.10 działa:

- **Historia cen: 1169 wpisów z datą 2026-10-03** (1030 Allegro, 120 Media Expert,
  12 Lidl, 7 Planeta Klocków). Dzień wcześniej, przed poprawką, ten sam krok dał
  65 wpisów — czyli skrypt faktycznie przeszedł na koniec przebiegu, po zapisaniu
  `oferty_feed.json`. Seria za 30.09–03.10: 1105 / 1190 / 1375 / 1169, bez dziur.
- **Kontrola kart ME: 25 kandydatów, 25 sprawdzonych, 0 poprawek.** Dwie rzeczy
  z tego wynikają: po łatce `g:sale_price` feed zgadza się z kartami, a limit
  80 kart dziennie ma zapas — wczorajsze 85 kandydatów było jednorazowym efektem
  samej poprawki, nie normą.
- Ceny ME w commicie Łowcy sprawdzone niezależnie: wszystkie 746 ofert z datą
  03.10, a zestawy, które wczoraj ręcznie weryfikowałem na kartach, trzymają
  właściwe kwoty (60499 — 179, 10440 — 52,89, 72050 — 499, 10300 — 775). Poprawka
  przechodzi przez pełny przebieg runnera, nie tylko przez moje ręczne naniesienie.

**Odpalenie na żądanie z 02.10 12:57 nie zadziałało i nie wiem dlaczego.**
`fire_trigger` zapisał `last_fired_at`, ale pola `last_run` nie było wcale, sesja
Łowcy nie dostała tury (`updated_at` został na 02.10 07:03) i nie powstał commit.
Dzisiejsze odpalenie z harmonogramu ma `last_run: SUCCEEDED` i `session_id`
`cse_01SdxKtAvW8UmktsuXrsPYga`, podczas gdy wczorajszy `fire_trigger` zwrócił
`cse_012qL4Q3E8BJ5CqFX3eD5Tiz` — inny identyfikator przebiegu, który nigdy się nie
zmaterializował. To obserwacja, nie diagnoza. Wniosek praktyczny: **weryfikację
zmiany promptu runnera planujemy na jego normalny przebieg, a nie na
`fire_trigger`** — albo po `fire_trigger` sprawdzamy `last_run`, zanim napiszemy,
że przebieg wystartował.

**Zrobić:** — sesja Łowcy ma 762 tys. z 1 mln tokenów kontekstu (wczoraj 725 tys.,
czyli ~37 tys. na przebieg). Przy tym tempie zostaje jej około sześciu przebiegów.
Zaplanować odtworzenie sesji (delete+create Routine'a z nowym `persistent_session_id`),
zanim uderzy w limit w środku sezonu XI–XII.
**Kto:** — Marek (decyzja kiedy) + Code (wykonanie)

## 2026-10-03 08:20 · RADAR · Nic do zrobienia (ale poprawka dostępu)

Przebieg bez pozycji do piątki: fanklockow dwie publikacje (jedna o COBI — poza
zakresem), faniklockow zero nowych (feed RSS bajt w bajt identyczny z wczorajszym,
najnowsza pozycja z 01.10 15:35). Cztery wpisy dołożone do bazy, żadnego zadania.

**Poprawka zapisanego „faktu" o dostępie.** `konkurencja_baza.json` miała w
`_meta.dostep`, że dla promoklocki.pl i zklockow.pl „jedynym źródłem pozostaje
WebSearch z allowed_domains". To nieprawda: dziś oba serwisy **weszły Firecrawlem**,
HTTP 200 z `proxy: basic` — zklockow.pl oddał listę produktów i pełne menu sekcji,
promoklocki.pl w formacie `links` kategorie i karty produktów za 1 kredyt. Stary
zapis był obejściem z czasów, gdy nie próbowaliśmy Firecrawla; curl i WebFetch
dalej dostają 403 i to się nie zmieniło. Monitoring strukturalny tych dwóch
serwisów robimy od teraz Firecrawlem, nie WebSearchem — zapisane w `_meta.dostep`.

Przy okazji sprawdzone, czy świąteczny asortyment z promoklocki ma u nas luki:
11 z 12 numerów (40874, 40875, 40866, 40865, 11387, 5011093, 40900, 43026, 76355,
11379, 21373) jest w `katalog.json`; brakuje tylko 5011029, a to gra planszowa
Ninjago, nie zestaw klocków. Luki więc nie ma.

## 2026-10-02 12:40 · RADAR · Media Expert: sprostowanie diagnozy i poprawka w parserze

**Sprostowanie do wpisu z dzisiejszego 08:00.** Napisałem tam, że zawyżone ceny
Media Expertu to skutek niepełnego odświeżenia (594 z 735 pozycji z datą 29.09
lub starszą). To nie była przyczyna. Dzisiejszy świeży feed
(`mediaexpert_feed_updated: 2026-10-02 00:30 CEST`) zwrócił **te same stare
kwoty**, więc świeżość danych nie miała z tym nic wspólnego.

**Prawdziwa przyczyna — dwie, obie zmierzone na kartach przez Firecrawla:**

1. `scripts/feedy-lego.py` czytał tylko `<g:price>`, a cena promocyjna siedzi
   w `<g:sale_price>`. `g:price` zostaje przez cały czas promocji ceną regularną,
   więc czytelnik widział u nas kwoty wyższe od sklepowych (60499: feed 199,99,
   karta 179,00). Po łatce **143 zestawy dostały niższą, prawdziwą cenę** —
   mediana rabatu 8,4%, maksimum 39,9%; 10 z 11 kontrolnych zgadza się teraz
   co do groszy z listą przecen, którą opisał faniklockow.
2. Nawet `g:price` bywa rozjechany z kartą, i to mocno: 10440 feed 84,99 /
   karta 52,89; 71513 feed 219,99 / karta 146,36; 10300 feed 849,99 /
   karta 775,00; 42213 feed 202,99 / karta 185,50. Na pięciu sprawdzonych
   „wzrostach ceny" **cztery były wymysłem feedu**. Kierunek błędu zawsze ten
   sam: feed pokazuje więcej, niż się płaci w sklepie.

**Druga rzecz do odnotowania jako błąd mój:** w pierwszej wersji łatki
zapisałem, że `<g:price>` bywa zdublowane z „0 PLN" na początku. Nieprawda —
dodatkowe `<g:price>` siedzą w `<g:shipping>` (kurier 14,90, InPost 7,99, 0,00
przy darmowej dostawie), a `findtext` i tak patrzy tylko na dzieci `<entry>`.
Teza wzięła się z grepa po surowym pliku. Komentarz w skrypcie i RUNBOOK mówią
teraz, jak ten plik wygląda naprawdę.

**Zrobione w repo:**
- `scripts/feedy-lego.py` — `g:sale_price` przed `g:price`, pole `cena_regularna`
  w wyciągu.
- `scripts/me-ceny-stron.mjs` (nowy) — kontrola cen ME na kartach produktów przez
  Firecrawla, wołana automatycznie przez `feedy-lego.py`, więc Łowca dostaje już
  poprawiony wyciąg i prompt Routine'a nie wymaga zmiany. Sprawdza wąski podzbiór
  (skok ceny powyżej 15% albo ME najtańszy z przewagą powyżej 10%), limit 80 kart
  i budżet 900 s, bo karta to 1 kredyt Firecrawla przy 5 000 na miesiąc.
  Bez `FIRECRAWL_KEY` przepuszcza wyciąg bez zmian — nie może wywrócić Łowcy.
- RUNBOOK: **wycofany** dotychczasowy wniosek „ceny ME bierzemy wyłącznie z feedu,
  bo jest oficjalny i wiarygodny" oraz zdanie, że kart ME nie da się sprawdzić
  z sesji (Firecrawl wchodzi, `proxy: basic`, 1 kredyt).
- Ceny ME w `oferty_feed.json`, `sety.json` i minima w `ceny_baza.json` nanie-
  sione poprawnym parserem na dane, które Łowca zapisał dziś starym.

**Zrobić:** — przy następnym przeglądzie budżetu Firecrawla sprawdzić, czy limit
80 kart dziennie wystarcza; dziś kandydatów było 85, ale to jednorazowy efekt
samej poprawki — w normalny dzień kryterium „skok ceny" powinno dawać kilka.
**Kto:** — Code (dane, strona)

### Przy okazji: historia cen spisuje się o jeden krok za wcześnie

`historia-cen.mjs` jest wołany z wnętrza `feedy-lego.py`, czyli **zanim** Łowca
naniesie ceny z wyciągu na `oferty_feed.json`. Skrypt widzi więc stan wczorajszy
i codziennie spisuje wczorajsze zmiany, nie dzisiejsze. Liczby z dziś:
plik z `origin/main` miał po przebiegu Łowcy **65** wpisów z datą 2026-10-02,
a uruchomienie skryptu po naniesieniu danych dopisało **1310** (986 Allegro,
321 Media Expert, 3 Planeta Klocków) — tyle zmian cen z dziś nie było zapisanych.
Te 1310 wpisów dopisałem w tym przebiegu, więc dzisiejszy dzień jest kompletny.

**ZROBIONE tego samego dnia** (Marek: „zmień ten prompt Łowcy sam"). Wywołanie
`historia-cen.mjs` wyjęte z `feedy-lego.py` i dopisane do promptu Łowcy jako
trzeci skrypt w kroku PRZED COMMITEM — oba końce w jednej zmianie, więc
zbieranie historii nigdzie nie wypada.

Prompt: `update_trigger` odmawia zmiany instrukcji z innej sesji niż ta, do
której Routine wpada („a routine's instructions can be changed only from the
conversation the routine posts into"), więc delete+create — tak jak mówi
CLAUDE.md. Najpierw create, potem delete, żeby ani na chwilę nie zostać bez
Routine'a. Nowy `trig_01RjjGRUpJ8QVvhBQrLXiy7Z` (stary
`trig_01L8awRzxEbeUSQsad7ye18Y` skasowany), ta sama stała sesja
`session_01SdxKtAvW8UmktsuXrsPYga`, ten sam cron `CRON_TZ=Europe/Warsaw 30 8 * * *`,
następny przebieg 03.10 08:34 PL. Sprawdzone po zmianie: sesja Łowcy żyje,
na liście jest dokładnie jeden Routine Łowcy.

Przy okazji w promptcie: pole `_meta.mediaexpert_karty` do raportu, weryfikacja
kart ME przez Firecrawla zamiast WebFetcha (ME oddaje 403) i liczba nowych wpisów
historii w podsumowaniu.

**Zrobić:** — przy następnym przeglądzie budżetu Firecrawla sprawdzić, czy limit
80 kart dziennie wystarcza (dziś 85 kandydatów to jednorazowy efekt poprawki),
i czy pierwszy przebieg Łowcy na nowym promptcie 03.10 dopisał historię cen
w normalnej skali (rzędu kilkuset wpisów, nie 65).
**Kto:** — Code (dane, strona)

## 2026-10-02 08:00 · RADAR · Do zrobienia

**Media Expert · 1.10** — od rana 1 października ruszyła u nich duża fala przecen na LEGO (20–44%, kilka pozycji „historycznie najtaniej"), a nasze ceny Media Expert tego nie widzą.
**Mamy?** — nie: sprawdziłem dwanaście pozycji z ich listy i w **każdej** nasza cena Media Expert jest wyższa od faktycznej, zwykle o 8–15%, a przy 31174 Telefon retro prawie dwukrotnie (129,99 wobec 70 zł). Pomiar szerszy: 735 zestawów ma u nas ofertę Media Expert, odświeżono 1.10 tylko 141 — **594 pozycje (81%) mają ceny z 29.09 lub starsze**. Cały feed dostał 1.10 aż 4632 wpisy, więc odświeżenie się odbyło; niepełne jest samo pokrycie Media Expert.
**Zrobić:** — sprawdzić w runnerze Łowcy, dlaczego import Media Expert objął 1.10 tylko piątą część zestawów, i dociągnąć resztę. To jeden z naszych sklepów publikacyjnych, więc zawyżone ceny widzi czytelnik w tabelach hubów w szczycie sezonu.
**Kto:** — Code (dane, strona)

→ zamknięte 13.10.2026: naprawione 02.10 w 5466f4b (ceny ME z `g:sale_price` + kontrola na kartach produktów); 13.10 wszystkie 733 oferty ME mają datę z dnia.

## 2026-10-01 05:10 · SCOUT · Sygnały wycofań dla runnera Wycofań

- 76477 Zamek Hogwart: lekcje latania — StoneWars, „Top 10 der LEGO EOL-Sets 2026”
  (https://www.stonewars.de/news/top-10-lego-eol-sets-2026/, 30.09.2026): artykuł wskazuje
  jako EOL całe serie Harry Pottera „Zamek Hogwart” i „Ulica Pokątna”, wymieniając m.in.
  76477, 76445 i 76442. Z tych numerów **76477 nie ma w `wycofania.json`** — pozostałe
  wymienione w tekście (76442, 76445, 76447, 76452) już są. Sama dziesiątka z rankingu
  (75192, 42179, 40516, 75397, 10335, 21353, 40805, 21060, 31171, 60495) jest w pliku w całości.

→ Wycofania 2026-10-05: odrzucone (na razie). U źródła: 76477 występuje tylko w sekcji
„Extra-Tipp" jako prognoza redakcji StoneWars, nie oznaczenie LEGO; drugiego niezależnego
źródła brak (sprawdzono promobricks/web). Do tego 76477 to wg katalogu „Norbert: mały smok
Hagrida" (premiera VI 2026, widziany na listingu lego.pl 29.09) — nazwa z sygnału nie pasuje.
Wrócę do tematu, gdy potwierdzi drugie źródło albo LEGO oznaczy zestaw w sklepie.

## 2026-09-30 19:00 · CODE · Routines po audycie: czas polski, Łowca z buildem, Harmonogram w tej sesji

**Zrobione na koncie:**
- Crony runnerów LEGO w zapisie `CRON_TZ=Europe/Warsaw …` z tymi samymi godzinami PL
  (Scout, Radar, Łowca, Wycofania, Kontroler, Dane wt, Harmonogram) — zmiana czasu 25.10
  niczego nie przesunie; jednorazowe przypomnienie o DST niepotrzebne.
- Łowca odtworzony (delete + create w tej samej sesji `session_01SdxKtAvW8UmktsuXrsPYga`,
  nowe ID `trig_01L8awRzxEbeUSQsad7ye18Y`): `npm run build` przed pushem, przy konflikcie
  `historia-cen/` z origin + `historia-cen.mjs` zamiast ręcznego scalania, `seo_tytul`/`seo_opis` w postach.
- Harmonogram z konta przypięty do sesji Code `session_011GrNNd6UVQFF1NamoPaQMS`
  (`trig_01LU2xZxWqyCmNYv7rPyik3x`) + kontrola wielkości sesji runnerów (`get_session`, alarm > 850 tys.).
  Scout 30.09: 313 tys. z 1 mln — nowa sesja niepotrzebna.
- `harmonogram-z-konta.mjs` rozumie `CRON_TZ=Europe/Warsaw`.
**Czeka na Marka (panel, zadania założone przez http_api — agent ich nie zmieni):** Alerty
(cron + krok 2), Zdjęcia → R2 (cron 04:45 i 09:45), Przypomnienie (cron), wyłączenie
„Empik co tydzien”, skasowanie Backfill.
→ 30.09 wieczorem: Marek poprawił w panelu prompt Alertów i czas Zdjęć (04:45). Code założył
dwa zadania z czasem polskim: „Zdjęcia → R2, drugi przebieg” 09:45 (`trig_01XAJy9vca6HUK6YY3XarLWM`,
próba 15:18: 11 563 w R2, brak 0, błędów 0) i nowe Alerty 09:30 (`trig_018D4PGvCaYkcDKDfNM3fjLZ`) —
stare Alerty z panelu Marek wyłącza. Przypomnienie o Empiku zostaje (tylko mail do Marka);
do wyłączenia „Empik co tydzien” (skill w chmurze), Backfill wstrzymany — do skasowania.

## 2026-09-30 18:00 · CODE · Teksty szablonowe, SEO meta, odczyt GSC od Coworka

**Zrobione:** `d526d69` — poprawki tekstów szablonowych z audytu (opisy generowane bez zdań
o dostępności, odmiana liczebników, 880 kart z poprawionym akapitem rocznikowym). `259f5c9` —
tytuły ≤ 60 i opisy ≤ 160 znaków na 1 433 indeksowanych stronach; pola `seo_tytul`/`seo_opis`
(artykuły, deale) i `seoTytul`/`seoOpis` (prezentowniki), zasada w `redakcja/ustalenia-projektowe.md`.
**GSC (odczyt Coworka + URL Inspection API 30.09):** raport „Strony” z 21.09 jest nieaktualny.
10312 i 75355 nie mają już noindex. 0 z 133 stron z wyświetleniami zwraca 404 i 0 martwych
linków wewnętrznych — 220 × 404 to stare adresy spoza serwisu, do obejrzenia przez eksport.
Zgłoszenia Coworka zadziałały (x-kom WSR i 31163 zindeksowane 30.09).
Niezindeksowane teksty: nieznane — 77242, najwieksze-zestawy-lego-star-wars,
najdrozsze-zestawy-lego-rynek-wtorny; wykryte — allegro-black-weeks, jesien-swieta-premiery,
wycofania-grudzien, 75438, 60508, bam-halloween, historia-licencji cz. 3; zeskanowane —
super-mario-2027, najwieksze-technic.
**Dla drugiej strony:** Cowork — 1.10 zgłoszenia wg listy w odpowiedzi Code (zaczynając od 75389).

## 2026-09-30 10:30 · CODE · Audyt po wdrożeniu 29.09: afiliacje, Cloudflare, Firecrawl, Routines, GSC, spójność, teksty

**Zrobione:** `materialy/audyt-2026-09-30.md` (raport zbiorczy, 9 sekcji) + `audyt-2026-09-30.xlsx`
(8 arkuszy) + `audyt-2026-09-30/` (routines, strona-spojnosc, teksty-szablonowe). Liczby z API.
**Najważniejsze:** Cloudflare — plan płatny nie grozi (worker 6% limitu), realny sufit to 20 000
plików w assets (dziś 10 022). Firecrawl 5 000/mies. wg API, 71% zużycia z sesji (json = 5 kredytów).
Routines: bez dubli poza Empikiem, x-kom bez właściciela, Łowca bez builda przed pushem, Scout ~800 k.
Strona spójna (0 martwych linków, 0 błędów LD), meta >160 na 1 300 stron. Teksty: ton dobry, ale
zdania o dostępności w `opisy.json` przeczą tabelom (60339 „z drugiej ręki” obok −50%).
**Stan:** raport na main; poprawki czekają na kolejność od Marka (sekcja 9 raportu).
**Dla drugiej strony:** Cowork — komendy GSC w sekcji 5 raportu.

## 2026-09-29 15:50 · CODE · Karty P07 Piotra: partie 02, 26, 27 (75 nowych kart) wgrane

**Zrobione:** `import-karty.py` na 3 zipach (poprawione wersje od Piotra; automat przez git po stronie chata
nie zadziałał, gałąź w repo Piotra do skasowania przez niego/Marka). 75 kart, 0 zablokowanych (RRP zgodne),
karty_setow 1124 → 1199. Poprawki: metka szablonu „Opis P07 • LEGO … • 2025” jako 1. akapit w całej partii 02
— filtr w imporcie (68ab221); 75350 elementy 776 → 766 (Brickset). Nazwy: zostają kanoniczne z katalogu
(15 różnic typu „–”/„-”, polskie nazwy minifigurek). Wszystkie 75 hubów bez noindex po buildzie.
Uwaga dla Piotra: partia 27 bez nagłówka „Opis zestawu” i z krótszą metryką (bez wieku/typu/dystrybucji);
w partii 26 trzeci akapit bywa dopychany 3–4 zdaniami „na długość”.
**Stan:** na main.

## 2026-09-29 14:20 · CODE · Recenzja Piotra: 31163 Psotny kot (Creator 3 w 1)

**Zrobione:** `artykuly/lego-31163-psotny-kot-recenzja.md` z docx Piotra (Recenzje_004) — tekst bez zmian,
dopisane: frontmatter + 3 FAQ, tabela cen w miejsce `[TABELA CENOWA]`, link do serii Creator, 3 zdjęcia
(kot 31163-3, pies 31163-11, gołąb 31163-12) bez podpisów. Fakty z tekstu zgodne z danymi (RRP 104,99 zł
potwierdzone na lego.pl, 407 el., 8+, premiera 01.2025). Galeria 12 zdjęć z Planety Klocków w `galerie.json`
(80 → 81), od razu wgrana do R2 (`r2-obrazy.mjs --galerie`: 12/12). Uwaga: rynek dziś ~68 zł (Media Expert,
Lidl) — już poniżej progu Piotra 75 zł; tabela huba pokazuje to sama.
**Stan:** na main.

## 2026-09-29 12:40 · CODE · WDROŻONE: v2 strony głównej + „Promocje LEGO” zamiast /deale/ (301)

**Decyzja Marka 29.09:** „wdrażamy v2 i promocje zamiast deali z 301, ale zostaw wersję obecną”.
**Zrobione:** `podglad/glowna-v2` → `index.astro`; `podglad/promocje-lego` → `promocje-lego/index.astro`
(listing 150 pozycji, 30/strona, filtr serii, sortowanie: polecane / cena ↑↓ / największy rabat %;
bez Top 10 wycofań). `/deale/` → **301** na `/promocje-lego/` w `public/_redirects` (posty dealowe
`/deale/<slug>/` bez zmian); dwa stare przekierowania z `astro.config` też przeniesione do
`_redirects` jako 301. Menu: „🔥 Promocje LEGO” (→ /promocje-lego/) zamiast „Promocje dziś” (→ /)
i „Deale”; stopka, 404, llms.txt, okruszki postów dealowych, sitemap i linki w 9 tekstach → nowy adres.
**Powrót (gdyby trzeba):** kopie `/podglad/glowna-obecna/` i `/podglad/deale-obecne/` (noindex) oraz ostatni
commit przed wdrożeniem **`7f488de`** (tag `przed-wdrozeniem-v2-2026-09-29` jest tylko lokalnie – proxy
odrzuca push tagów, 403). Podgląd v1 skasowany.
**Sprawdzone na produkcji po deployu (975e4df):** `curl -sI` bez `-L`: `/deale/` i `/deale` → 301
`/promocje-lego/` (także z nagłówkiem `Sec-Fetch-Mode: navigate`), `/kalendarz-redakcyjny` → 301
`/artykuly/`, `/serie/tradycyjne-festiwale-chinskie/` → 301 `/serie/seasonal/`; posty `/deale/<slug>/`
200; `/_redirects` 404 (plik nie jest publiczny); sitemap ma `/promocje-lego/`, nie ma `/deale/`.
**Nie zrobione z planu 27.09:** pkt 4 (style `.podglad-widok` globalnie — nowe strony nadal mają ten
wrapper, więc wyglądają jak w podglądzie) i pkt 5 (scalenie zdublowanego kodu do `src/lib/`).
**Dla drugiej strony:** GSC — prośba o indeksację `/promocje-lego/` i nowej `/`.
→ 02.10 (API GSC): `/promocje-lego/` i `/` PASS, zindeksowane, crawl 29.09 12:34 i 13:00 UTC (już v2); `/deale/` zindeksowane, ostatni crawl 15.09 — Google jeszcze nie widział 301 (curl 02.10: 301 → `/promocje-lego/`); nic do ponawiania.

## 2026-09-28 12:30 · CODE · x-kom „Wyższa Szkoła Rabatu" (do 18.10): aktualność + 108 cen + 115 linków

**Zrobione:** mailing SalesMasters od Marka → aktualność
`artykuly/x-kom-wyzsza-szkola-rabatu-2026-lego.md` (wyróżniona, `wazne_do` 18.10).
Pełną listę (128 pozycji LEGO, 5 stron) pobrał **Firecrawl** – x-kom.pl oddaje mu
200 (basic proxy), choć na nasz ruch serwerowy daje 403. Kod `rabat12` przy części
pozycji. Porównanie z notowaniami: 33 rekordy, 51 ≈ rynek, 38 droższe niż gdzie indziej.
Dane: 108 ofert xkom w sety.json (`wazne_do` 2026-10-18, pole `kod` przy rabat12);
115 deeplinków w `redirects.xkom` (11 → 126, adres karty + sm=).
Dzień Chłopaka: 43014/43022/11380/43011 podrożały, 43012 niedostępny → ich wpisy
xkom zamknięte (`wazne_do` 30.09 → 27.09), nowe ceny dopisane; do starego posta notka
„Aktualizacja 28 września", wyróżnienie przeszło na nowy tekst.
`oferty.js`: oferta z `wazne_do` nie spada już po 14 dniach sita (akcja trwa 3 tygodnie).
**Uwaga:** hełm 75429 – mailing 269,90 zł, karta 28.09 pokazuje 329,90 zł; w tekście
„nie brać przy tej cenie". Gdy rabat się pojawi – dopisać cenę i poprawić akapit.
**Stan:** na main.

## 2026-09-28 08:40 · CODE · Import zrzutu Empiku z 28.09 (sesja Code, plik od Marka)

**Zrobione:** `empik-import.mjs` (sucho → zapis) + `empik-redirects.mjs --usun-martwe`.
Zrzut 5 320 pozycji → 4 378 cen po filtrach (odrzucone: gadżety 538, obca marka 13,
sanity 52, spoza katalogu 337 = 17,7%, poniżej progu 20%). oferty_feed: 56 nowych,
1 281 zmian, 48 zestawów bez Empiku w zrzucie straciło jego cenę; sety.json 982 ofert;
18 nowych minimów w ceny_baza. Deeplinki: 41 zaktualizowanych, 52 martwe usunięte
(jedyny dopuszczony ubytek), gałąź empik 4 775 → 4 787. Build OK.
Marek zmienił metodę zrzutu (dwa sortowania bez luki, filtr „tylko dostępne",
szersza reguła numeru „1016el") — dlatego ok. 10% więcej pozycji niż 21.09.
**Stan:** gotowe, na main.
**Dla drugiej strony:** skill `klocki-ceny-empik` opisuje jeszcze trzy przebiegi
z filtrem ceny — Marek zrobił dwa i wystarczyło; do aktualizacji w skillu przy
najbliższej okazji (52 „podstawki Blacked Brick" wpadają w sanity zamiast w gadżety —
też do dopisania rdzenia „podstawka" w `zrzut-import.mjs`).

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

## 2026-09-26 08:00 · RADAR · Do zrobienia

**faniklockow.pl · 25.09** — w ich tabeli wycofań jest kolumna „Dystrybucja" (szeroka / ekskluzywna / ograniczona) plus notka „wyprzedane".
**Mamy?** — częściowo: `/wycofania/` pokazuje status terminu, cenę i znacznik EOL, ale nie pokazuje, ilu sklepów zestaw jeszcze ma.
**Zrobić:** — dopisać do listy na `/wycofania/` liczbę sklepów z żywą ofertą (dane są już w `oferty_feed.json`, strona je wczytuje). To nasz odpowiednik ich „dystrybucji", tylko żywy — i to właśnie tę zmienną nasz tekst z 16.09 wskazał jako najlepszy predyktor ceny względem cennika.
**Kto:** — Code (dane, strona)

→ zamknięte 14.10.2026: /wycofania/ pokazuje pod ceną „w N sklepach” (liczba sklepów ze świeżą ofertą, bez Ceneo; link do tabeli cen huba).

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
