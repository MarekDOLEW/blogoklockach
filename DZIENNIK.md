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

- **Nie piszemy o podróbkach ani o sklepach-naciągaczach** (Marek, 08.11.2026).
  Radar zgłosił lukę formatu po ostrzeżeniach fanklockow przed Klocochy.shop i
  MiniVerse.pl — odpowiedź Marka: temat nie jest nasz. Nie zakładamy poradnika
  „jak rozpoznać podróbkę" ani listy sklepów do omijania. Nie zgłaszaj tego
  ponownie przy kolejnych ich ostrzeżeniach; sprawdzenie, czy taki sklep nie
  trafił do `sklepy.json` albo `redirects.json`, zostaje jako kontrola danych.
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

- [`2026-10`](materialy/dziennik-archiwum-2026-10.md) — 84 wpisy
- [`2026-09`](materialy/dziennik-archiwum-2026-09.md) — 105 wpisów
- [`2026-08`](materialy/dziennik-archiwum-2026-08.md) — 36 wpisów

Archiwizuje `node scripts/archiwum-dziennika.mjs`.

<!-- WPISY PONIŻEJ — wszystko nad tą linią zostaje w dzienniku na zawsze -->

## 2026-11-12 14:58 · SKRZYNKA · GitHub: Recenzje_020 (opublikowana), 0047 (do poprawki)
Źródło: repo tylkoklocki-teksty, commit 4aea9e75.
- Recenzje_020 (75461) → https://tylkoklocki.pl/artykuly/lego-75461-powiekszona-minifigurka-dartha-vadera-recenzja/ — z 1 zdjęciem Piotra.
- 0047 „BrickLink wciąż niedostępny” — nie poszedł: tekst z Aktualności bez zestawu i bez zdjęcia nie ma okładki, więc build by go odrzucił. Plik leży w `do-poprawki/` z uwagami (commit a824b2c w repo tekstów), a Piotr dostał mail. Recenzję opublikowaliśmy osobno, żeby nie czekała.

## 2026-11-12 08:30 · RADAR · Do zrobienia

**Smyk · 11.11** — Smyk ruszył z akcją progową: „Kup zestaw LEGO za min. 359 zł i odbierz miękką poduszkę minifigurkę pierniczek za 1 zł" (48 cm, rozliczenie w koszyku) — potwierdzone na stronie promocji Smyka i na karcie 42240.
**Mamy?** — nie mieliśmy, i gorzej: **nasze ceny Smyka były z 10.11**, a promocja ruszyła w środę. Karta 42240 pokazuje 675 zł zamiast 719 („Najniższa cena z 30 dni przed obniżką: 719,00 zł").
**Zrobić:** — zrobione w tym przebiegu: nowa sekcja `#smyk-poduszka` w kalendarzu (z zastrzeżeniem, że Smyk **nie podaje daty końca**, a próg liczy się z **jednego** zestawu) i pozycja w „Co trwa teraz". Niezalatane: **75691** Podpórki Glinda/Elphaba, które podają za 389 zł u Smyka — nie ma go ani w `sety.json`, ani w `redirects.smyk`, więc skrypt go nie odczytuje.
**Kto:** — Code (dane, strona)

**dane · 12.11** — Uruchomiłem `scripts/smyk-odswiez.mjs` (0 kredytów): 569 kart z ceną, 0 błędów, **25 zmian cen**, 12 ofert zdjętych jako wyprzedane; liczba wpisów bez zmian (sety 1354, feed 8938).
**Mamy?** — teraz tak, ale przez dwa dni nie: w **ośmiu** zestawach Smyk jest po tej zmianie **najtańszym sklepem**, a wcześniej było to u nas niewidoczne — 10353 (259→225), 11375 (267→249), 11384 (459→419), 42226 (195→179,90), 42240 (719→675), 60445 (309→285), 71856 (142,90→134,90), 76463 (309→285).
**Zrobić:** — zdecydować o **drugim odczycie Smyka w tygodniu** (zmiana promptu Routine „Dane wt" albo osobny krok): tygodniowy odczyt z wtorku nie łapie promocji śródtygodniowych, a listopad i grudzień to miesiące, w których takie akcje będą się powtarzać.
**Kto:** — Marek (decyzja)

**BrickLink · 11.11** — Awaria z 6 listopada przestała być przerwą techniczną: własna strona serwisowa BrickLinka mówi „We took BrickLink offline after identifying **unusual activity** on the platform… Before bringing the site back online, we need to fully understand what has happened" („Updated: 11th November 2026") — czyli incydent bezpieczeństwa i **brak terminu powrotu**.
**Mamy?** — ekspozycja cenowa nadal zerowa (0 ofert `bricklink` w `sety.json`), ale sekcja `#bldp` kalendarza odsyła czytelnika na Bricklink.com jako jedyny kanał sprzedaży BLDP.
**Zrobić:** — zrobione, zgodnie z zastrzeżeniem z 08.11 („gdyby przedłużyła się poza poniedziałek, wracamy do tego"): w `#bldp` jest notka z cytatem ze źródła i datą sprawdzenia. Przy powrocie serwisu notkę usunąć.
**Kto:** — Code (dane, strona)


## 2026-11-11 08:15 · RADAR · Do zrobienia

**faniklockow.pl · 10.11** — Weszli w prezentownik budżetowy „LEGO na prezent świąteczny **do 50 zł**", sześć tygodni przed Wigilią.
**Mamy?** — częściowo, i luka jest **formy, nie danych**: 950 zestawów ma u nas najtańszą ofertę do 50 zł po odsiewie `ceneo` i `lego` (tak jak liczy kod), z czego **159 ma własny hub**. Próg jest też pokryty wewnątrz `/prezentowniki/na-mikolaja/` (drabina od polybagu do 13 zł przez 30 i 45 zł do ok. 200 zł), ale nie mamy strony na tę frazę — jedyny nasz prezentownik z progiem w tytule to `/prezentowniki/lego-za-200-zl-dla-10-latka/`.
**Zrobić:** — zdecydować, czy robimy prezentownik „LEGO na prezent do 50 zł" (i czy od razu jako drabinę budżetową do 50 / do 100 / do 200 zł). Dwie słabości ich tekstu z góry wyznaczają kształt naszego: dzielą prezenty **po płci** (nasz standard sprzedażowy zabrania tego wprost — kryterium jest sposób zabawy), a tytuł „do 50 zł" kłóci się z treścią, gdzie piszą „w budżecie do 100 zł".
**Kto:** — Marek (decyzja)

**dane · 11.11** — Cztery numery zgłoszone w tym tygodniu nadal nie weszły do rejestru: **42717** Friends, **77084** i **77088** Fortnite (zgłoszone 07.11, czwarty dzień) oraz **30720** Arielka (zgłoszone 09.11, trzeci dzień).
**Mamy?** — nie: żadnego nie ma w `src/data/sety.json` ani `katalog.json`. Pozostałe numery z nowych kart promoklockow sprawdziłem — 67006, 67008, 67009, 67012, 72061 i 80122 **są** w rejestrze z premierą 2027-01, więc dotyczy to tylko tych czterech.
**Zrobić:** — dopisać je do `sety.json` i `ceny_baza.json`, zaczynając od **30720**: to upominek z **trwającego** okna 9–15.11 i jedyna pozycja w tabeli upominków kalendarza **bez linku**, a okno kończy się w niedzielę.
**Kto:** — Code (dane, strona)



## 2026-11-10 14:58 · SKRZYNKA · GitHub: 0035 (aktualizacja) + 92 karty P07
Źródło: repo tylkoklocki-teksty, commit ffa1b89a. Liczba kart w `karty_setow.json` wzrosła z 2033 do 2108: 75 nowych i 17 nadpisanych nowszą wersją, czyli z poprawkami z maila z 06.11 (40686, 42643, 43242, 41758, 77259, 10338, 75328, 43269, 76326, 76327, 31147, polybagi 30715–30735). Sprawdzone: wszystkie liczby z maila stoją w nowych kartach. 72168 nie przyszła.
- 0035 → https://tylkoklocki.pl/artykuly/listopadowe-premiery-lego-sagrada-familia-upominek-do-weneckiej/ — dostała aktualizację: upominek 40898 do 20.11 (tylko online) i `wazne_do: 2026-11-20` od Piotra. Po tym dniu nad tekstem stanie komunikat „akcja zakończona”.
Uwagi bez blokady: liczba elementów u Piotra i w katalogu różni się dla 21057 (827 vs 830), 41946 (118 vs 108), 41957 (486 vs 478), 41958 (115 vs 105) i 41964 (669 vs 659) — do sprawdzenia w Bricksecie. Seria „Avatar” (75573) jest nieznana w `katalog.json`. Karty 30435, 30503, 30584, 30650 i 40567 weszły jako krótkie.


## 2026-11-10 08:55 · SKRZYNKA · GitHub: 0043 (aktualizacja), 0044, 0045, 0046
Źródło: repo tylkoklocki-teksty, commit cf9de41d.
- 0043 (poprawka, +3 linie) → https://tylkoklocki.pl/artykuly/trzy-upominki-na-lego-pl-od-9-do-15-listopada-batman-z-retro-gry-wideo/
- 0044 → https://tylkoklocki.pl/artykuly/weekend-lego-insiders-i-black-friday-2026-na-lego-pl-terminy-godzilla/
- 0045 → https://tylkoklocki.pl/artykuly/lego-ideas-zatwierdza-trzy-nowe-zestawy-interstellar-wiatrak-wsrod/
- 0046 → https://tylkoklocki.pl/artykuly/nieoficjalnie-seria-lego-monkie-kid-zniknie-z-oferty-pod-koniec-2026/

## 2026-11-10 08:15 · RADAR · Do zrobienia

**faniklockow.pl + fanklockow.pl · 09.11** — Oba serwisy piszą o powrocie gratisu **40906**, ale faniklockow podają go jako „przy zakupach za minimum 745 zł ponownie otrzymacie gratisowy zestaw" — **bez słowa o Insiders**, czyli czytelnik spoza programu zostanie bez upominku.
**Mamy?** — tak: `/artykuly/kalendarz-promocji-lego/` sekcja `#listopad-40906`, a od dziś z warunkami wprost z regulaminu promocji: „Wymagane jest uczestnictwo w programie LEGO Insiders", „wyłącznie online", „do wyczerpania zapasów", „jeden zestaw na jedno gospodarstwo domowe".
**Zrobić:** — zrobione w tym przebiegu: dopisany trzeci warunek (kafel mówi „wydaj **ponad** 745 zł", regulamin „co najmniej 745 zł" — przy celowaniu w sam próg to decyduje), akapit z resztą warunków regulaminowych i zdanie, że 40906 **wraca** (nasz rejestr ma dla niego premierę 2026-02, więc kto przegapił pierwsze okno, ma drugą szansę).
**Kto:** — Code (dane, strona)

**lego.com/pl-pl · 10.11** — Dzisiejsza ekstrakcja kafla promocji **nie zawierała** frazy o Insiders, co wyglądało na zniesienie warunku i podważałoby cały wczorajszy akapit.
**Mamy?** — tak, i nie zmieniliśmy tekstu na podstawie krótszej ekstrakcji: wyciągnięty pełny regulamin promocji potwierdza warunek słowo w słowo.
**Zrobić:** — reguła na przyszłość, do stosowania przy każdym oknie: **rozbieżność między dwoma zrzutami tej samej strony rozstrzyga pełny tekst regulaminu, nie nowszy zrzut** — kafel promocji jest skrótem i gubi warunki.
**Kto:** — Code (dane, strona)

**lego.com/pl-pl · 10.11** — Gratis **30762 Batman z retro gry wideo**, zapowiadany przez oba serwisy na 9–15.11, drugiego dnia okna nadal nie występuje na karcie promocji (są tam tylko 40906, 30720 i 40898).
**Mamy?** — tak, jako „przewidywane" w sekcji `#listopad-40906`, z opisem obu nieudanych sprawdzeń (karta promocji 9 i 10.11 oraz blok upominków karty 76333).
**Zrobić:** — sprawdzić kartę promocji jeszcze raz po 15.11 i **usunąć tę pozycję z kalendarza**, jeśli okno minie bez potwierdzenia przez LEGO.
**Kto:** — Code (dane, strona)


## 2026-11-10 05:25 · SCOUT · Sygnały wycofań dla runnera Wycofań

- **Cała linia Monkie Kid** — StoneWars, https://www.stonewars.de/news/lego-monkie-kid-wird-eingestellt/ (09.11.2026): linia schodzi z rynku, koniec produkcji bieżących zestawów, EOL 31.12.2026 na większości rynków, w Azji 31.12.2027 (z powodu otwarcia LEGOLAND w Szanghaju). Serwis podaje jako powód rozstanie z studiem animacji i zwrot LEGO w stronę własnych serii oraz Dragon Balla. Uwaga: tytuł tekstu to pytanie, a konkluzja „dla nas: tak" jest oceną serwisu — komunikatu LEGO nie ma, więc to sygnał do weryfikacji, nie fakt.
  Nasz stan: w `katalog.json` dziesięć zestawów Monkie Kid ze statusem `dostepny` (80040, 80045, 80051, 80054, 80055, 80056, 80057, 80058, 80065, 80066), w `wycofania.json` **ani jednego** wpisu z tej serii. Wszystkie dziesięć siedzi też na liście zestawów w sprzedaży poza `sety.json`.


## 2026-11-09 14:58 · SKRZYNKA · GitHub: 25 kart P07
Źródło: repo tylkoklocki-teksty, commit 91e4ad85. Karty: 10320, 10991, 10992, 10993, 10994, 11028, 21375, 30635, 30651, 30652, 31133, 31144, 40597, 40598, 40646, 41738, 41741, 43211, 43213, 43223, 60397, 76243, 76410, 76423, 76959 (huby /zestaw/<nr>/).
Pierwszy przebieg zatrzymała cena 40646 Żonkile (Piotr 69,99 zł, katalog 59,99 zł). Rację miał Piotr (promoklocki: 69,99 zł), więc w `katalog.json` poprawiliśmy cenę na 69,99 zł, z adnotacją w `cena_zrodlo`. Karty 30635, 30651 i 30652 mają po jednym akapicie, więc weszły jako krótkie (--krotkie).


## 2026-11-09 10:05 · KONTROLER · Do zrobienia

Raport: `materialy/kontroler-2026-11-09.md`. Mail „Zadania bez właściciela — 09.11.2026" (27 pozycji) wysłany, id `01a1bf79`.

**10 konwersji Media Expertu w Performers czeka na zatwierdzenie (60 dni: 14 764 zł sprzedaży, 268,09 zł prowizji), najstarsza od 03.09 (67 dni); 08.11 decyzja Marka „czekamy, nie wysyłamy" — bez daty końca.**
**Mamy?** — tak: `prowizje-raport.mjs` od 07.11 pokazuje `konwersje_wg_statusu`; terminu zatwierdzania Performers/ME nie znamy.
**Zrobić:** — zgoda na termin 23.11: jeśli do tego poniedziałku żadna z 10 nie zmieni statusu (najstarsza będzie miała 81 dni), Kontroler przypomina i mail do supportu Performers idzie — pytanie o termin zatwierdzania i o brakującą 1/3 kliknięć (tydzień 03–09.11: 20 naszych PL wobec 16 u nich, 80%).
**Kto:** — Marek (decyzja)
↻ 09.11 (Kontroler): zgoda Marka 09.11 na termin 23.11 — przypomnienie ustawione w sesji Kontrolera na 23.11 10:20 PL (`trig_01WLwRWVniuzFHiD1hXdxmiF`); pozycja czeka na wynik, nie na decyzję.

**Decyzje D5–D9 z audytu 06.11 (mail z okazjami w czwartek, prezentowniki według zainteresowań, Piotr tylko przez GitHub, maile runnerów pon + pt, strony autorów) wchodzą w życie z odpowiedzią domyślną „tak" w środę 11.11.**
**Mamy?** — tak: `materialy/audyt-2026-11-06.md`, sekcja „Decyzje".
**Zrobić:** — do środy 11.11 powiedzieć, jeśli któraś ma być inna niż domyślna; cisza = Code wdraża domyślne po Black Friday.
**Kto:** — Marek (decyzja)

**Wycofania (pon 06:10, `trig_018T3NrpmpZTRLX7s942gD6q`) mają w harmonogramie z konta `09.11 06:10 SUCCEEDED`, ale w repo nie ma commita „Wycofania: aktualizacja 2026-11-09" (19.10, 26.10 i 02.11 był) ani linii „→ Wycofania 2026-11-09" w dzienniku; `src/data/wycofania.json` ostatnio zmieniony 02.11.**
**Mamy?** — nie: SUCCEEDED w tabeli to dostarczenie promptu, nie wynik przebiegu.
**Zrobić:** — otworzyć sesję Wycofań na koncie i sprawdzić, co zrobiła 09.11 (odmowa klasyfikatora jak Zdjęcia → R2 04.11? błąd pushu? „nic do zmiany"?); jeśli nic — odpalić ręcznie.
**Kto:** — Marek (panel)
↻ 09.11 (Kontroler): Marek 09.11 „wycofania sprawdzę" — w toku po jego stronie.

**`scripts/diagnoza.mjs` zgłasza „ROZJAZD Z REJESTREM" dla Ceneo: Tradedoubler zwraca program 385881 jako ACCEPTED, rejestr ma `zakonczony` (program zamknięty 03.11, mail TD) — alarm będzie wracał co tydzień.**
**Mamy?** — tak: rejestr ma rację, API TD nie zmienia statusu zakończonego programu.
**Zrobić:** — w porównaniu statusów w `scripts/diagnoza.mjs` uznać parę „TD ACCEPTED / rejestr `zakonczony`" za zgodną (jedna linia), żeby „ROZJAZD" oznaczał tylko prawdziwy rozjazd.
**Kto:** — Code (skrypt)

Poza listą dla ludzi: reguła referera z 02.11 zadziałała — kliknięć „human" spoza PL ze strony głównej 40 → 0 przy fali 13 301 botów 05.11; `/zestaw/11208/` zindeksowany 04.11 po trzech zgłoszeniach kolejki; `/zestaw/10280/` crawl 11.09 (59 dni) — sprawdzę za tydzień, czy kolejka może objąć huby zindeksowane ze starym crawlem; `/aktualnosci/` crawl 26.10 (14 dni). Kolizja 09:30 bez szkody czwarty tydzień.


## 2026-11-09 08:55 · SKRZYNKA · GitHub: 0043 i Recenzje_019
Źródło: repo tylkoklocki-teksty (do-publikacji/), 2 teksty + 5 zdjęć, commit 89eee676.
- 0043 → https://tylkoklocki.pl/artykuly/trzy-upominki-na-lego-pl-od-9-do-15-listopada-batman-z-retro-gry-wideo/
- Recenzje_019 (42682) → https://tylkoklocki.pl/artykuly/lego-42682-domek-na-luksusowym-kempingu-recenzja/
Pierwszy przebieg zatrzymał recenzję („brak pliku None_zdjecie_1.jpg”): zdjęcia recenzji przychodzą jako `019_zdjecie_K.jpg`, a importer znał tylko `NNNN_`. `numer_pliku()` w `scripts/import-artykul-md.py` rozumie teraz też `Recenzje_NNN_`.

## 2026-11-09 08:20 · RADAR · Do zrobienia

**lego.com/pl-pl · 09.11** — Karta promocji ma dwa nowe upominki na **9–15.11**: **40906 Restauracje świata: Japonia** („Wydaj ponad 745 zł... **Tylko w programie LEGO Insiders**") i **30720 Urodzinowa potańcówka Arielki i Florka** („Wydaj ponad 165 zł na produkty z tematyki Disney").
**Mamy?** — nie mieliśmy, i stan był najgorszy możliwy: po wczorajszym zamknięciu okna 28.10–8.11 sekcja „Co trwa teraz" nie pokazywała **ani jednej** pozycji ze statusem „trwa", a LEGO prowadziło w tym czasie trzy akcje upominkowe.
**Zrobić:** — zrobione w tym przebiegu: nowa sekcja `#listopad-40906` z tabelą trzech upominków, dwie pozycje w „Co trwa teraz" i wiersz 9–15.11 w tabeli listopadowej. Opisane dwa warunki, których nie było w poprzednich oknach: 40906 **wymaga** członkostwa Insiders (pierwszy raz w tym sezonie) przy najwyższym progu sezonu, a próg 165 zł liczy się **wyłącznie** z produktów Disney.
**Kto:** — Code (dane, strona)

**lego.com/pl-pl · 09.11** — Okno gratisu **40898** zostało wydłużone: karta promocji podaje dziś `dateRange` **1.11–20.11.2026**, a 6.11 podawała 1–8.11.
**Mamy?** — mieliśmy to **błędnie od wczoraj**: zamykając okno na polecenie Marka napisałem, że „okno taksówki skończyło się razem z pozostałymi – 8 listopada". Było to prawdą w chwili pisania i przestało być prawdą dzisiaj.
**Zrobić:** — zrobione w tym przebiegu: taksówka ma własną pozycję „trwa" w „Co trwa teraz" (1–20.11), wiersz tabeli mówi 1–20.11, a akapit wprost opisuje wydłużenie. **Wniosek:** daty końca okien nie są trwałe — LEGO je przesuwa, więc zamknięcie okna w kalendarzu wymaga sprawdzenia karty promocji tego samego dnia, nie tylko kalendarza.
**Kto:** — Code (dane, strona)

**faniklockow.pl + fanklockow.pl · 08.11** — Oba serwisy zapowiedziały na 9–15.11 trzeci upominek: polybag **30762 Batman z retro gry wideo** przy zakupach z serii DC od 165 zł.
**Mamy?** — nie i nie wpisujemy jako faktu: upominku nie ma ani na karcie promocji LEGO.pl, ani w bloku upominków na karcie **76333**, czyli dokładnie tego zestawu, który sami polecają do złapania progu (karta pokazuje tam tylko 40906 dla Insiders). Oba sprawdzenia dzisiejsze.
**Zrobić:** — w kalendarzu stoi jako „przewidywane" z opisem obu sprawdzeń; przy następnym przebiegu sprawdzić kartę promocji jeszcze raz i albo wpisać upominek z datą, albo — jeśli okno minie bez potwierdzenia — usunąć tę pozycję z kalendarza.
**Kto:** — Code (dane, strona)

**dane · 09.11** — Dwóch zestawów upominkowych z tego okna nie ma w rejestrze: **30720** (Arielka, gratis Disney) i **30762** (Batman, niepotwierdzony).
**Mamy?** — nie: ani w `src/data/sety.json`, ani w `katalog.json`, więc nie mają hubów i w tabeli upominków 30720 jest **jedyną pozycją bez linku**.
**Zrobić:** — dopisać 30720 do `src/data/sety.json` (plus wpis w `ceny_baza.json`), a 30762 dopisać dopiero, jeśli LEGO potwierdzi upominek własną stroną.
**Kto:** — Code (dane, strona)

## 2026-11-08 · Code · Maile do Piotra wysłane; Performers czeka

Wysłane do Piotra: odpowiedź o teście 404 i nowościach oraz lista poprawek w kartach/FAQ po audycie (stary szkic z autolinkami Gmaila usunięty). Mail do Performers (termin zatwierdzania 11 konwersji pending od 03.09, 2/3 kliknięć) — decyzja Marka 08.11: czekamy, nie wysyłamy.

## 2026-11-08 · Code · Piotr: korekta testu z 404

Claude Piotra zgłosił, że test z 06.11 nie działa — każdy `/zestaw/<nr>/` się otwiera (huby bez treści mają noindex). Prawda: hub powstaje dla każdego numeru z katalogu; ostrzeżenie „BRAK HUBA” w `import-karty.py` było nieaktualne — poprawione (ostrzega tylko o numerze spoza katalogu i sety.json). Nowa zasada: Piotr opisuje tylko zestawy z naszych list (01.11: 444, partie 38–55), reszty rejestru (~6900) nie. Odpowiedź do Piotra — szkic w Gmailu, do wysłania przez Marka. `redakcja/skrzynka-instrukcja.md` poprawione.

## 2026-11-08 08:10 · RADAR · Do zrobienia

**kalendarz promocji · 08.11** — Okno trzech gratisów (40889, 30727, 40898) kończy się 8.11, a plakietka „trwa" w „Co trwa teraz" i w nagłówku sekcji `#listopad-40889` od 9.11 kłamałaby.
**Mamy?** — tak: `/artykuly/kalendarz-promocji-lego/` — ale nic nie pilnuje daty końca okna automatycznie.
**Zrobić:** — zrobione 8.11 na polecenie Marka („zrób to teraz — przestaw okno na zamknięte"): oba miejsca mają plakietkę „zamknięte", zdania o oknie przepisane w czasie przeszłym (tabela gratisów zostaje, bo pokazuje mechanikę). Zostało do rozważenia: kontrola w `swiezosc-tekstow.mjs`, która porównuje datę końca okna z dzisiejszą i zgłasza plakietkę „trwa" po terminie — bez niej każde następne okno trzeba zamykać ręcznie.
**Kto:** — Code (dane, strona)

## 2026-11-07 14:55 · Skrzynka tekstów Piotra (GitHub)

- 3 pliki + 7 zdjęć; opublikowane (commit `95c20af1`), linki wysłane, źródła w `opublikowane/`.
- 0039 i 0040 — nowe wersje już opublikowanych premier (te same adresy): https://tylkoklocki.pl/artykuly/lego-botanicals-na-poczatek-2027-roku-piwonie-storczyk-galazki-wisni/ , https://tylkoklocki.pl/artykuly/lego-na-swieto-wiosny-2027-80123-spring-festival-voyage-i-80122/
- Recenzje_018 77256 Wehikuł czasu — https://tylkoklocki.pl/artykuly/lego-77256-wehikul-czasu-z-powrotu-do-przyszlosci-recenzja/

## 2026-11-07 · Code · Media Expert: zakup testowy przypisany; 11 konwersji pending od IX

Zakup testowy Marka 11505 (06.11 12:03, 233,42 zł) jest w Performers jako konwersja pending (4,67 zł, aff_sub `Partner_ID` — kupione przed `65b65789`). `getStats` liczy tylko zatwierdzone; `getConversions` pokazuje od 03.09 **11 konwersji pending: 14 410,90 zł sprzedaży, 276,24 zł prowizji** (16.10: 9 998 zł → 199,96 zł). Wniosek audytu „ME 0 konwersji” odwołany. `scripts/prowizje-raport.mjs` dostał `konwersje_wg_statusu`; rejestr afiliacji i audyt poprawione. Sprawdzenie 09.11 niepotrzebne.

## 2026-11-07 08:15 · RADAR · Do zrobienia

**faniklockow.pl · 06.11** — Zapowiedzieli listopadowe „Zbuduj i Zabierz": mikromodel **tramwaju** skladany na miejscu w salonach LEGO **18–19.11, 15:00–17:00**, ograniczona liczba sztuk, akcja przy okazji otwarcia flagowego salonu LEGO w Pradze.
**Mamy?** — nie mieliśmy, a kalendarz sam to obiecywał: wrześniową akcję z popiersiem Batmana zostawialiśmy w tekście „bo pokazuje, czego spodziewać się po jej listopadowym odpowiedniku" — i gdy odpowiednik się pojawił, przyszedł do nas od konkurencji.
**Zrobić:** — zrobione w tym przebiegu: akapit w sekcji wydarzeń (nad 14.11), pozycja w „Co trwa teraz" i poprawka akapitu o listopadzie, który mówił o **jednym** wydarzeniu stacjonarnym. Weryfikacja u źródła nie wyszła i jest to w tekście napisane: `lego.com/pl-pl/stores/events` zwraca 404, LEGO nie prowadzi publicznej listy wydarzeń w salonach — więc status „przewidywane" i zastrzeżenie, żeby potwierdzić w salonie.
**Kto:** — Code (dane, strona)

**faniklockow.pl + fanklockow.pl · 06.11** — Oba serwisy publikują huby rocznika 2027 seria po serii (wczoraj Icons i zbiorczy, dziś Botanicals, Ninjago, okazjonalne/specjalne, One Piece) — to ich temat tygodnia.
**Mamy?** — częściowo, i luka nie jest w danych, tylko w przepisaniu ich na stronę: `/zapowiedzi-lego-2027/` ma datę aktualizacji 29.10 i nie wymienia **ani jednego** z dziesięciu zestawów Botanicals 2027 z `sety.json` (11515, 11516, 11519, 11522, 11532–11537), ani trzech Seasonal (40976, 80122, 80123), ani 42254 Technic, ani 11227 Koci Domek Gabi. Friends (42709, 42718, 42719) i Zelda 77094 na stronie są.
**Zrobić:** — uzupełnić `/zapowiedzi-lego-2027/` o serie, które mamy w rejestrze, a których na stronie nie ma (Botanicals, Seasonal, Technic 42254, Koci Domek Gabi 11227, Ninjago 71888), i odnotować regułę: dopisanie rocznika 2027 do `sety.json` pociąga aktualizację tej strony, bo dziś nic tego nie wiąże.
**Kto:** — Code (dane, strona)

**promoklocki.pl · 07.11** — Ich indeks ma karty trzech zestawów rocznika 2027, których nie ma w naszym rejestrze: **42717** Friends Rodzinny domek, **77084** i **77088** Fortnite (dwa ostatnie widziałem u nich już 05.11 i wtedy tego nie zapisałem).
**Mamy?** — nie: żaden z tych numerów nie wystepuje w `src/data/sety.json` ani w `katalog.json`; serii Fortnite 2027 nie ma też na `/zapowiedzi-lego-2027/`.
**Zrobić:** — sprawdzić u źródła (karty lego.com/pl-pl albo Brickset) i dopisać 42717, 77084 i 77088 do `src/data/sety.json`, razem z wpisami w `ceny_baza.json` — bez nich zestaw nie ma śledzonego minimum ani alertów.
**Kto:** — Code (dane, strona)

## 2026-11-07 05:25 · SCOUT · Do zrobienia

**Tekst `/artykuly/lego-botanicals-na-poczatek-2027-roku-piwonie-storczyk-galazki-wisni/` mówi o sześciu małych zestawach kwiatów (11532–11537): „LEGO nie podało jeszcze ich cen". Brickset podaje dla wszystkich sześciu RRP 4,99 euro i 4,99 dolara — to pierwsza seria kolekcjonerska w Botanicals, wszystkie w jednej cenie.**
**Mamy?** — częściowo: huby wszystkich sześciu zestawów stoją od dziś z liczbami elementów i ceną w euro, ale artykuł mówi, że ceny nie ma.
**Zrobić:** — poprawić w tym tekście jedno zdanie o cenach małych zestawów: podać 4,99 euro za sztukę (polskiej ceny katalogowej nadal nie ma) i, jeśli to pasuje do kompozycji, dopisać, że sześć pudełek w jednej cenie to seria kolekcjonerska.
**Kto:** — Piotr (tekst)
→ zamknięte 08.11.2026: Piotr przysłał nową wersję tekstu jeszcze 7 listopada (`95c20af`) i jest w niej więcej, niż prosiłem — polskie ceny z listy „Wkrótce dostępne" na LEGO.pl dla wszystkich dziesięciu zestawów: sześć małych po 20,99 zł, 11515 i 11519 i 11522 po 259,99 zł, 11516 za 126,99 zł, plus oznaczenie 18+ dla czterech dużych. Te dane wpisałem dziś do `sety.json`.

**Dwa teksty premierowe opublikowane 6 listopada linkowały do pięciu hubów, których nie było w danych: `/zestaw/11515/`, `/zestaw/11519/`, `/zestaw/71888/`, `/zestaw/80122/` i `/zestaw/80123/`. Żadnego z tych numerów nie było ani w `sety.json`, ani w `katalog.json`, więc na produkcji te linki dawały 404 do dzisiejszego przebiegu.**
**Mamy?** — częściowo: wszystkie pięć hubów powstało dziś razem z wpisami w `sety.json`, więc konkretne linki już działają, ale nic nie pilnuje następnego takiego przypadku. `scripts/kontrola-linkow.mjs` sprawdza wyłącznie cele przekierowań do sklepów, nie linki wewnętrzne.
**Zrobić:** — dodać do builda albo do poniedziałkowej kontroli sprawdzenie, że każdy link `/zestaw/<numer>/` z `src/pages/artykuly/*.md` ma odpowiednik w `dist/zestaw/<numer>/`, i zgłaszać listę brakujących numerów.
**Kto:** — Code (skrypt)
↻ 09.11.2026: nadal aktualne — korekta Code z 08.11 („hub powstaje dla każdego numeru", `9d711be`) tej pozycji nie zamyka. Tam chodzi o numery obecne w `katalog.json`, a te pięć nie było ani w katalogu, ani w `sety.json`: `git show bd65e18:src/data/katalog.json` i to samo dla `sety.json` nie znajdują 11515, 11519, 71888, 80122 ani 80123. Dla numerów spoza obu plików strona się nie buduje i link z artykułu prowadzi w pustkę — dlatego sprawdzenie linków `/zestaw/<nr>/` z artykułów dalej ma sens, zwłaszcza że nowa zasada dla Piotra opiera się na tym, czy zestaw „ma już stronę".

## 2026-11-06 · Code · Piotr: bez kart dla zestawów bez huba

Decyzja Marka: Piotr nie opisuje zestawów bez strony `/zestaw/<nr>/`. Mail do Piotra wysłany 06.11 (test: strona otwiera się / 404; priorytet z listy opisów z 01.11). Reguła dopisana w `redakcja/skrzynka-instrukcja.md`. Osobno w Gmailu czeka szkic „kilka poprawek w kartach i FAQ (audyt 6.11)” — do wysłania przez Marka.

## 2026-11-06 14:55 · Skrzynka tekstów Piotra (GitHub) — 89 kart P07

- Paczka 94 kart w `tylkoklocki-teksty`. 4 zablokowane — importer nie rozpoznaje numeru (6614229-2, LANDDUCK, MCPIG, PONDDUCK) i przy zasadzie „wszystko albo nic” wstrzymywały całość; odłożone do `do-poprawki/` z plikiem uwag (to zestawy bez huba). Opublikowane **89 kart** (commit `4a9e6400`), powiadomienie wysłane, źródła w `opublikowane/` (`9267e1e`).
- 58 z 89 kart to zestawy **bez huba** `/zestaw/` (gratisy, polybagi z gazet, nagrody, BAM, L000…) — karty są w danych, ale nie są widoczne na stronie. Do decyzji: czy dla takich numerów robić huby, czy prosić Piotra, żeby ich nie opisywał.

## 2026-11-06 · Code · Kafelki okazji zamiast listy (BW tyg. 3)

Marek o tekście Black Weeks tyg. 3: „nie da się czytać… pokazać w boxach ze zdjęciami, w 3–4 kategoriach rabatów”. Nowy plugin `scripts/remark-karty-okazji.mjs` + style `.ko-*` w `global.css`: kafelki jak w sklepie (zdjęcie, cena, rabat, kod, werdykt „gdzie najtaniej dziś”, przycisk), grupy według rabatu, wszystko liczone przy buildzie z tych samych danych co tabele. Tekst BW3 przepisany: jedna linijka wstępu, kafelki 5 zestawów z kodem, kafelki 8 zestawów, które wypadły z akcji (gdzie dziś najtaniej). Wzorzec dla kolejnych tekstów dealowych (BW tydzień 4, Black Friday).

## 2026-11-06 · Code · Tabele w artykułach = huby; 4 ceny x-kom

- Marek: „tabele w artykułach powinny brać te same rzeczy i tak samo często co huby”. Nowy `src/lib/sito-ofert.js` (bez importu danych) — jedno źródło reguł dla `src/lib/oferty.js` i `scripts/remark-ceny.mjs`: data per sklep, 14 dni / `wazne_do`, podejrzany rynek, LEGO wyprzedane i EOL (z nadpisaniem przez listing), sklepy wyłączone, plakietka kodu; wiersz LEGO.com po EOL z linkiem do karty jak na hubie. Kontrola na buildzie: 125 tabel w artykułach, 125 zgodnych z hubem (sklepy i ceny). Częstotliwość: obie tabele powstają przy każdym buildzie (po każdym pushu runnera).
- Ceny x-kom sprawdzone na kartach (`weryfikacja-ofert.mjs --zestawy`, nowa opcja): 10967 46,90, 43285 74,90, 76336 74,90, 43303 46,90 zł (były 19,99/49,99 ze zrzutu 03.11); przy okazji 10967 Empik 28,00, 43285 Empik 71,99 i MediaMarkt 82,15 zł.

## 2026-11-06 · Code · Audyt: punkty 5, 7, 8

- **5 Black Weeks** (`1854a9d3`): tyg. 1–2 z `wazne_do` (baner „Akcja zakończona”), tyg. 3 z „Aktualizacją 6 listopada” — kod black-weeks3 nie obejmuje już 8 z 13 zestawów (76454 809,90 zł bez kodu; 42175 niedostępny); `kody_rabatowe.json` zawęża `zestawy` do 5 działających. Huby bez linków do zakończonych akcji: 50 → 0 (`src/lib/artykuly-setow.js`). Otwarte: tabele w artykułach (`remark-ceny.mjs`) nie mają sita `podejrzanyRynek`/14 dni; ceny x-kom 10967, 43285, 76336, 43303 nieaktualne do zrzutu 09.11.
- **7 Boty** (`addc8e57`, `materialy/audyt-2026-11-06/boty-klikniecia.md`): spadek ludzi = wypadnięcie piku 26–27.10; fala 05.11 (13 301, 89 krajów) nie przeszła do sieci; reguły filtra bez zmian; propozycja łatki diagnostycznej workera czeka na zgodę Marka.
- **8 Fakty i zdjęcia:** 145 RRP z kart P07 w `rrp_potwierdzone.json` (994 → 1139), 6 RRP wyrównanych (10338, 31147, 43269, 75328, 76326, 76327), 15 liczb elementów w katalogu wg Bricksetu, 8 × Super Mario premiera 2027-01, 72168 = 1083 el., 18+; zdjęcia 10001 i 60086 z Rebrickable (`pierwszenstwo` w `zdjecia.json`); JSON-LD i metryka karty biorą elementy i RRP z danych huba (tekst karty bez zmian).
- **Dla Piotra (karty i teksty nietknięte):** elementy w tekście kart — 40686 261 → 262, 42643 102 → 110, 43242 2228 → 2208, 41758 230 → 231, 77259 216 → 215; 72168 w metryce 1183 → 1083; RRP w kartach/FAQ — 10338 399,99 → 379,99, 75328 309,99 → 299,99, 43269 619,99 → 599,99, 76326 i 76327 269,99 → 249,99, 31147 84,99 → 81,99; polybagi 30715, 30722, 30723, 30724, 30728, 30735 w FAQ 16,49 → 16,99 zł; artykuł `lego-pokemon-premiera` tabela 72168 „1183 | 0,47 zł” → „1083 | 0,52 zł”. Prezentownik „Święta dla dzieci” poleca 72168 (18+) dla 10–12 lat — decyzja redakcyjna.

## 2026-11-06 · Code · D12: zakończone deale z noindex

GSC 06.11: cała sekcja `/deale/` „wykryta – niezindeksowana”. Decyzja Marka: zakończone deale noindex i poza mapą. `src/lib/deal-zakonczony.js`: zakończony = po `wazne_do`, a bez niej 14 dni od `data`; `Artykul.astro` daje noindex, `sitemapy.js` pomija w `sitemap-deale.xml`. Z 20 deali 15 z noindex; w mapie: 10330, 42689, 75192, 75446 i kalendarze adwentowe (`wazne_do` 2026-12-24 — żyje do Wigilii). Deal, który ma być dłużej w Google, dostaje jawne `wazne_do`. D10 (Awin) czeka do wzrostu ruchu, D11 (boost) — osobna rozmowa.

## 2026-11-06 · Code · Firecrawl: pełne limity przywrócone

Odczyt konta (C4): Hobby 5 000/mies., odnowienie 23.11, Pay-as-you-go do 20 USD/mies., 3 043 kredyty 06.11. Cięcie z D2 oszczędzałoby kredyty, które przy odnowieniu mogą przepaść — Marek: „przywróć”. `budzet-firecrawla.mjs`: pełne limity (Weryfikacja 40, karty ME 80) do 30.11, od 01.12 połowa.

## 2026-11-06 · Code · Media Expert: subID w linkach (zgoda Marka)

- Test Coworka (C1): tracker Performers działa (`transaction_id` wypełniony), ale `Partner_ID=Partner_ID` — `feedy-lego.py` codziennie nadpisywał linki ME surowymi z feedu. Teraz `link_me_nasz()` podstawia `tylkoklocki` (makr `{date}`, `{transaction_id}` nie rusza); 826 z 878 istniejących linków poprawione, liczba wpisów bez zmian.
- **Zakup testowy Marka 06.11:** 11505 Botanicals Grzyby leśne w Media Expercie przez hub `/zestaw/11505/` (ME najtańszy, 233,42 zł). Sprawdzić w panelu/API Performers za 1–3 dni, czy pojawi się konwersja (offer 1860, aff_sub `tylkoklocki`) — to rozstrzyga, czy zero konwersji to problem trackingu.

## 2026-11-06 08:55 · Skrzynka tekstów Piotra (GitHub)

- Źródło: repo `tylkoklocki-teksty`, 4 artykuły + 19 zdjęć; opublikowane (commit `08b56d13`), linki wysłane, źródła ze zdjęciami w `opublikowane/`.
- 0037 Historyczne — https://tylkoklocki.pl/artykuly/jedna-ciezarowka-trzy-pudelka-lego-2148-3442-california-truck-i-10156/
- 0038 Premiery — https://tylkoklocki.pl/artykuly/lego-ninjago-71888-ivos-ninja-dojo-oficjalnie-3495-elementow/
- 0039 Premiery — https://tylkoklocki.pl/artykuly/lego-botanicals-na-poczatek-2027-roku-piwonie-storczyk-galazki-wisni/
- 0040 Premiery — https://tylkoklocki.pl/artykuly/lego-na-swieto-wiosny-2027-80123-spring-festival-voyage-i-80122/
- Naprawione po drodze: `github-teksty.py pobierz` brał tylko `.md` (zdjęcia `NNNN_zdjecie_K.jpg` zostawały w repo → pierwszy przebieg „brak pliku”, nic nie wyszło); slug: apostrof sklejany („ivos”, nie „ivo-s”), ucięta data po przyimku znika („…-od-1”, „…-od-27”). Uwaga nieblokująca: tytuł SEO 0037 ma 61 znaków.

## 2026-11-06 · Code · Audyt 06.11 i decyzje D1–D4

Audyt: `materialy/audyt-2026-11-06.md` + 6 raportów w `materialy/audyt-2026-11-06/` (commit 9d22c64d). Decyzje Marka tego samego dnia:
- **D1 Ceneo — usunięte ze strony.** `SKLEPY_WYLACZONE` w `src/lib/oferty.js` (jedno sito `filtrujOferty` + link zastępczy), tabele w artykułach (`remark-ceny.mjs`). Dane cen zostają. W buildzie 0 linków `/idz/ceneo/`, indeksowalnych dalej 2 179.
- **D2 Firecrawl — tniemy.** `scripts/budzet-firecrawla.mjs`: Weryfikacja ofert 15 kart i karty ME w Łowcy 30 do 20.11; 21–30.11 pełne 40/80 (Black Friday); od 01.12 20/40. Stan 06.11: 3 081 kredytów.
- **D3 Empik — filtr akcesoriów.** `scripts/akcesoria.mjs` w `zrzut-redirects.mjs` i `zrzut-import.mjs`; usunięte 300 linków `redirects.empik` do gablot, uchwytów, instrukcji, LED, Playmobilu i zamienników (zestaw wraca na wyszukiwarkę Empiku) oraz ceny Empiku 71430 (Playmobil) i 45303 (zamiennik) w `oferty_feed.json`.
- **D4 Social: TikTok i Pinterest tak, Shorts nie.** Skill `klocki-social` zaktualizowany (kanały, rytm tygodnia, role, UTM, Pinterest), paczka w `skille/klocki-social.skill` — **Marek wgrywa na claude.ai**.

## 2026-11-06 08:20 · RADAR · Do zrobienia

**lego.com/pl-pl · 06.11** — Karta promocji LEGO wymienia dziś **trzy** gratisy, nie dwa: do 40889 (28.10–08.11, próg 540 zł) i 30727 (28.10–08.11, Star Wars od 165 zł) doszedł **40898 Wenecka taksówka wodna, 01.11–08.11.2026**, z warunkiem „Zakup musi obejmować produkt Wenecka okolica (11388)". Domyka to wątek z 28.10, kiedy zapisałem, że LEGO własnym źródłem tego gratisu nie potwierdza.
**Mamy?** — nie mieliśmy, i to był błąd na produkcji: nagłówek sekcji `#listopad-40889`, pozycja w „Co trwa teraz" i tabela mówiły o **dwóch** gratisach, więc żywe okno kończące się za dwa dni było u nas niewidoczne.
**Zrobić:** — zrobione w tym przebiegu: trzeci wiersz tabeli (warunek 11388, okno 1–8.11), „dwa gratisy" → „trzy gratisy" w nagłówku i w „Co trwa teraz", akapit o mechanice (brak progu kwotowego, 322 elementy, wycena 124,99 zł, pomost pasuje do nabrzeża 11388) i zastrzeżenie, że sam gratis nie jest powodem, żeby dokładać do zakupu za 2149,99 zł. **Wniosek na przyszłość:** liczebnik w nagłówku jest trzecim miejscem, w którym trzymamy tę samą daną — przy każdym dopisaniu wiersza do tabeli gratisów przeglądamy nagłówek sekcji i pozycję w „Co trwa teraz".
**Kto:** — Code (dane, strona)

**fanklockow.pl · 05.11** — LEGO.com przyznało im pulę kodów na gratis **30708 Minimodel Sokoła Millennium** dla ich czytelników: 16–20.11.2026, próg 165 zł z dowolnej serii, wyłącznie online, kod w koszyku, zajmuje jeden z trzech slotów nagrody Insiders. Piszą „znów mamy dla Was kolejny gratis", czyli dostają takie pule regularnie.
**Mamy?** — nie i nie możemy mieć treścią: to nie publiczne okno, tylko kody wydawane z ich podstrony. Do naszego kalendarza nie wchodzi — bez ich kodu czytelnik tego gratisu nie dostanie, a my nie odsyłamy do konkurencji. Luka jest **relacyjna**, nie redakcyjna.
**Zrobić:** — zdecydować, czy próbujemy o to samo własnym kanałem (Tradedoubler / kontakt LEGO.pl): pula kodów na gratis dla czytelników tylkoklocki.pl przed Weekendem Insiders.
**Kto:** — Marek (decyzja)

**faniklockow.pl · 05.11** — Wystawili hub „Zbiorcze zapowiedzi zestawów LEGO na 2027 r. Wszystko w jednym miejscu", spinający ich huby serii (Fortnite 04.11, Icons 05.11).
**Mamy?** — dane tak, formy nie: rocznik 2027 zbiera Scout do `zapowiedzi_sledzone`, ale nie ma jednej strony, która go zestawia. Drugi dzień z rzędu ten sam wzorzec co przy kalendarzach adwentowych z 05.11 — oni robią stronę zestawiającą, my mamy dane rozsypane po hubach.
**Zrobić:** — rozstrzygnąć łącznie z pozycją o kalendarzach adwentowych z 05.11: czy wchodzimy w format „wszystko w jednym miejscu" (strona zbiorcza na żywych komponentach), czy zostajemy przy hubach.
**Kto:** — Marek (decyzja)

## 2026-11-06 05:25 · SCOUT · Do zrobienia

**StoneWars opublikował drugi tekst o Ideas Godzilla (21375) — „czego nie widać na karcie produktu": ukryty easter egg i szczegóły budowy, których nie ma w opisie LEGO (https://www.stonewars.de/news/lego-ideas-godzilla-21375-easter-egg-details/). Nasz tekst premierowy wyszedł 04.11, przed tym materiałem.**
**Mamy?** — tak: https://tylkoklocki.pl/artykuly/lego-ideas-21375-godzilla-oficjalnie-5363-elementy-za-1699-99-zl-od-27/ — ale bez tego szczegółu.
**Zrobić:** — przeczytać artykuł StoneWars pod adresem wyżej i dopisać do opublikowanego tekstu akapit o ukrytym easter eggu; sam artykułu nie otwierałem (budżet przebiegu), więc treści easter egga nie znam. Pozycja stała w mailu Scouta z 05.11, ale nie trafiła wtedy do dziennika — stąd wpis dziś.
**Kto:** — Piotr (tekst)

## 2026-11-05 08:10 · RADAR · Do zrobienia

**faniklockow.pl · 04.11** — Weszli w hasło „kalendarze adwentowe LEGO najtaniej" sześć tygodni przed Wigilią, czyli w szczyt tej frazy.
**Mamy?** — częściowo, i brakuje formy, nie danych: pięć kalendarzy na 2026 jest w rejestrze z cenami z 04.11, wszystkie **29–35% pod katalogiem** i wszystkie na albo przy własnym rekordzie (42698 Friends 80,89 u ME przy rekordzie 80,46; 43298 Disney 102,98 u Empiku przy 101,03; 60510 City 74,18 u ME przy 69,99; 75456 Star Wars 101,03 u ME równo z rekordem; 76340 Marvel 102,99 u ME przy 102,98). Nasz tekst `/deale/deal-kalendarze-adwentowe-lego-2026/` jest jednak przewodnikiem **wyboru** dla rodzica (typ „pod-lupa", osiem wzmianek o 60510, jedna tabela cen), a pozostałe cztery numery wymienia po razie.
**Zrobić:** — zdecydować, czy dokładamy drugi kąt: zestawienie pięciu kalendarzy 2026 w jednym miejscu, na żywych komponentach `ceny-setu` (standard zabrania wpisywania kwot do treści), jako sekcja w istniejącym tekście albo osobna krótka forma „Kalendarze adwentowe LEGO 2026 — gdzie najtaniej".
**Kto:** — Marek (decyzja)

Uwaga metodologiczna na własny rachunek, warta zapisania obok pozycji: pierwsza wersja mojego zestawienia
pokazała 75456 jako „89,98 zł, czyli nowy rekord poniżej 101,03" i wyglądało to na przeoczony rekord.
Było fałszywe — **89,98 to Ceneo z 27.10**, a Ceneo jest porównywarką i serwis z zasady nie liczy jej jako
najtańszej oferty (`najlepszaOferta` ją odsiewa, a w `sety.json` jej nie ma od poprawki z 29.10). Najtańsza
realna oferta to Media Expert 101,03, równo z rekordem. Wpadłem więc we własnym zapytaniu w dokładnie ten
błąd, przed którym chronią reguły serwisu: **przy ręcznych zestawieniach cen trzeba odsiewać `ceneo` i `lego`
tak samo, jak robi to kod.**

## 2026-11-05 05:25 · SCOUT · Do zrobienia

**Firecrawl bez parametru `maxAge` oddaje kopię z cache'u, a nie bieżącą stronę: dziś o 04:09 pobranie `promobricks.de` wróciło z `cacheState: "hit"` i `cachedAt: 2026-11-04T04:09:34Z`, czyli dokładnie z poprzedniego przebiegu Scouta — doba wstecz, bez żadnego ostrzeżenia w treści.**
**Mamy?** — nie: w `RUNBOOK.md` nie ma o tym ani słowa, a z Firecrawla korzystają też Radar i sesje robocze.
**Zrobić:** — dopisać do `RUNBOOK.md` notkę przy Firecrawlu: do stron, których świeżość ma znaczenie (listy nowości, karty produktów, kody rabatowe), wywołanie musi mieć `maxAge: 0` albo krótki `maxAge`, bo inaczej serwis może oddać kopię z poprzedniego dnia; dowód z 05.11.2026 wyżej. Ten sam adres pobrany ponownie z `maxAge: 0` wrócił już bez `cacheState`.
**Kto:** — Code (RUNBOOK)

## 2026-11-04 14:55 · Skrzynka tekstów Piotra (GitHub)

- Źródło: repo `tylkoklocki-teksty`, 2 pliki; opublikowane bez przeglądu (commit `794ab34`), linki wysłane Markowi i Piotrowi, źródła przeniesione do `opublikowane/` (ca5d26c w repo tekstów).
- 0036 Premiery — https://tylkoklocki.pl/artykuly/lego-ideas-21375-godzilla-oficjalnie-5363-elementy-za-1699-99-zl-od-27/
- Recenzje_017 — https://tylkoklocki.pl/artykuly/lego-42646-pokoj-autumn-recenzja/
- Mail i panel: puste.

## 2026-11-04 08:10 · RADAR · Do zrobienia

**faniklockow.pl · 03.11** — Wydali profil 21375 Godzilli bez polskiej ceny, ale ich tekst kazał sprawdzić kartę zestawu — i tam cena **już jest**: 1699,99 zł, „Wkrótce dostępne (27 listopada 2026)", 5363 elementy.
**Mamy?** — nie mieliśmy: `cena_katalogowa: null`, brak wpisu w `rrp_potwierdzone.json` i **dwa zdania na produkcji** twierdzące, że LEGO ceny nie podało — w opisie zestawu i w sekcji Black Friday kalendarza, gdzie akapit kończył się puentą „nikt – łącznie z nami – nie policzy, czy to dobra cena".
**Zrobić:** — zrobione w tym przebiegu: `rrp_potwierdzone.json` (993 → 994 wpisy), `cena_katalogowa` w `sety.json`, oba zdania przepisane; kalendarz podaje teraz 1699,99 zł i 0,32 zł za element z wnioskiem, że to przelicznik typowy dla dużych Ideas, a nie okazja. Przy okazji poprawione **5364 → 5363 elementy** w kalendarzu.
**Kto:** — Code (dane, strona)

Wniosek warty zapisania poza samą pozycją: ich publikacja **nie przyniosła ani jednej nowej liczby**, a i tak
była najwartościowszym sygnałem tygodnia — bo dotknęła numeru, przy którym nasz własny tekst mówił „jeszcze
nie wiemy". Takie zdania w naszych tekstach to terminy do odwiedzenia, nie stan trwały; warto je traktować
jak otwarte pozycje. Kandydat na rozszerzenie `swiezosc-tekstow.mjs`: wyłapywać frazy typu „ceny jeszcze nie
ogłoszono", „nie podano", „nie wiemy" przy numerze, który **ma już** potwierdzoną cenę albo wpis w danych.

## 2026-11-04 08:10 · CODE · Zdjęcia → R2: nocny przebieg zablokował klasyfikator „Code from External"

**Routine „LEGO 04:45 — Zdjęcia → R2" (`trig_01EAhU5SKn2GuXxY14WYxNkJ`, cron `45 2 * * *` = od zmiany czasu 03:45 PL) 04.11 o 03:46 ma status SUCCEEDED, ale skryptu nie uruchomił.** Transkrypt sesji `cse_01MLTH64w1w3Ln4Ai5nENWAX`: klon repo i `npm ci` przeszły, a `node scripts/r2-obrazy.mjs` odrzucił klasyfikator trybu auto z powodem „Code from External" (Routine ze świeżą sesją nie ma repo w źródłach — klonuje je w trakcie, więc skrypt z klonu jest dla klasyfikatora kodem z zewnątrz; ten sam mechanizm opisany 15.09 przy LEGO.pl). Sesja wysłała push na telefon i zakończyła się czysto, dlatego `last_run` mówi SUCCEEDED. Dowodem przebiegu jest wyłącznie ślad `_stan/r2-obrazy.json` w R2, a ten miał datę 03.11 08:47 UTC (przebieg 09:45). Decyzja klasyfikatora nie jest powtarzalna: 03.11 o 09:46 identyczne polecenie w świeżej sesji przeszło (11 723 obiekty, brakowało 0).
- Skutek: żaden. Uruchomione z tej sesji (repo w źródłach, `CF_R2_TOKEN` jest): „W R2: 11723 obiektów, zdjęć w danych 11720 (z Planety 5649), brakuje w R2: 0" — krok 3a Łowcy (zdjęcia zaraz po pushu) i przebieg 09:45 pokrywają to, co nocny przebieg by dograł. Ślad w R2 odświeżony.
- Co sprawdzać, gdy runner „nie rusza": nie `last_run` (SUCCEEDED = sesja się skończyła), tylko pole `kiedy` w `_stan/r2-obrazy.json` (`curl` na REST API R2 z `CF_R2_TOKEN`) i `permission_denials` w `list_events` sesji z `last_run.session_id`.
**Mamy?** — częściowo: oba przebiegi Zdjęcia → R2 (03:45 i 09:45) są Routine ze świeżą sesją i każdy może trafić na tę samą blokadę; siatka działa tylko wtedy, gdy klasyfikator przepuści.
**Zrobić:** — przepiąć „Zdjęcia → R2" na trwałą sesję z repo w źródłach, jak Łowca i Kolejka indeksacji: `create_session(source_url)` + nowy `create_trigger(persistent_session_id)` z tym samym cronem (jeden trigger na 03:45 i jeden na 09:45 PL, albo jeden o 09:45, bo nocny dogrywa tylko to, co zostawiły sesje ręczne); stary 09:45 `trig_01XAJy9vca6HUK6YY3XarLWM` kasuje sesja Code, panelowy 04:45 `trig_01EAhU5SKn2GuXxY14WYxNkJ` kasuje Marek (`claude.ai/code/routines/trig_01EAhU5SKn2GuXxY14WYxNkJ`). Alternatywa bez nowej sesji: zostawić jak jest i przyjąć, że pojedyncze przebiegi wypadają — Łowca i tak wgrywa zdjęcia po każdym pushu.
**Kto:** — Marek (decyzja), wykonanie Code
→ zamknięte 04.11.2026 (decyzja Marka: przepiąć): stała sesja `session_01MLTH66y8yzUy9U45avTtAz` + triggery `trig_01HFHKLvDpfYPVuCr3KgGG9E` (04:45 PL) i `trig_017c1bZvdNiBr3dKZnGqNZ5R` (09:45 PL); stary 09:45 skasowany. **Zostaje dla Marka:** skasować panelowy `trig_01EAhU5SKn2GuXxY14WYxNkJ` (https://claude.ai/code/routines/trig_01EAhU5SKn2GuXxY14WYxNkJ) — API odmawia agentom, do tego czasu nocny przebieg chodzi podwójnie (nieszkodliwie).

## 2026-11-04 05:14 · SCOUT · Do zrobienia

**LEGO odsłoniło 3 listopada Ideas Godzilla (21375): 5363 elementy, 399,99 euro, 18+, premiera 27 listopada w dniu Black Friday, ponad 70 cm wysokości, z gratisem 40888 Logo Godzilli ze śladem stopy (359 elementów, wycena 24,99 euro). W dziale Artykuły nie ma o tym ani jednego tekstu.**
**Mamy?** — częściowo: huby `/zestaw/21375/` i `/zestaw/40888/` stoją z oficjalnymi danymi i są indeksowalne, zestaw wchodzi do `/nowosci/listopad-2026/` i na `/serie/ideas/`, a rozstrzygnięcie widać na `/przecieki/`. Brakuje tekstu.
**Zrobić:** — napisać tekst premierowy o 21375 w kategorii Premiery, na podstawie huba: największy zestaw w historii linii Ideas, ruchomy ogon, głowa, ramiona i palce, wyjmowany język i wpinany promień cieplny, projekt fana MattE720, wersja z filmów Legendary Monsterverse. Teza, która odróżni tekst od zapowiedzi konkurencji: premiera w dniu Black Friday nie jest okazją — zestaw wchodzi po cenie katalogowej, a jedyną realną korzyścią z kupna na premierę jest gratis 40888. Polskiej ceny katalogowej jeszcze nie ma, więc albo tekst czeka na nią, albo podaje 399,99 euro i zostawia miejsce na złotówki.
**Kto:** — Piotr (tekst)
→ zamknięte 05.11.2026: tekst jest — Piotr przysłał go skrzynką 04.11 po południu i Code opublikował go bez przeglądu (`794ab34`): https://tylkoklocki.pl/artykuly/lego-ideas-21375-godzilla-oficjalnie-5363-elementy-za-1699-99-zl-od-27/ . Polska cena katalogowa też już jest: 1699,99 zł w `rrp_potwierdzone.json` i w `sety.json` (wpis Radaru `1400046`), więc tytuł i treść podają złotówki, nie euro.

**LEGO.pl podaje już polskie ceny dwóch zestawów rocznika 2027, które u nas mają `cena_katalogowa: null`: 42254 Planety Układu Słonecznego na orbicie za 429,99 zł i 11227 Koci domek Gabi i buda Doozie za 84,99 zł (oba w `oferty_feed.json` ze sklepu `lego`, data 3.11.2026).**
**Mamy?** — częściowo: huby pokazują te kwoty jako ofertę sklepu, ale w `sety.json` nie ma ceny katalogowej, a `rrp_potwierdzone.json` nie zna żadnego z tych numerów — więc rabat nie ma od czego się liczyć.
**Zrobić:** — potwierdzić obie kwoty na kartach produktów na lego.pl w przeglądarce i wczytać je do rejestru: `node scripts/wczytaj-rrp.mjs` z wejściem `{"42254": 429.99, "11227": 84.99}`. Sam tego nie zrobię — serwer dostaje z lego.pl 403, a rejestr RRP z założenia uzupełnia człowiek albo Cowork z prawdziwą przeglądarką.
**Kto:** — Cowork (przeglądarka)
→ zamknięte 04.11.2026: Marek potwierdził obie kwoty i polecił je wczytać. W rejestrze `rrp_potwierdzone.json` są wpisy 42254 = 429,99 zł i 11227 = 84,99 zł, źródło „lego.pl — karty produktów, potwierdzone przez Marka"; huby obu zestawów podają już cenę katalogową. Cowork nie musi tego robić.

## 2026-11-03 15:00 · CODE · Skrzynka (GitHub): 69 kart P07, numery z literą, katalog wg Brickseta

**69 nowych kart z kanału GitHub na stronie (`2d22213`), w tym 49 zestawów w sprzedaży (Minecraft 21591–21598, Creator 31383–31393, Pokémon 72150–72168, Marvel/DC 67005–67012, BrickLink 910055–910067, L0002220–L0002223).** Żaden nie miał wcześniej karty. Źródła przeniesione do `opublikowane/` w tylkoklocki-teksty.
- Pierwszy przebieg blokował się na 4 kartach L000222x — importer czytał tylko numery z cyfr; `import-karty.py` przyjmuje teraz numer z literą (`24358c7`). Poranna poprawka skrzynki (zgłaszanie blokad) zadziałała: paczka czekała zamiast zgubić karty po cichu.
- Liczby elementów: Brickset potwierdził Piotra, poprawiony nasz katalog (`3841ec0`): 72168 Rayquaza 1083 (było 1183 w katalog.json i sety.json), 910055 3382, 910064 3960, 910065 2384.

## 2026-11-03 10:30 · CODE · Po pierwszym przebiegu GitHub: liczby elementów + slugify recenzji

**Domknięte „Zrobić” z wpisu 08:55 (decyzja Marka: poprawiamy u nas).** W `karty_setow.json` poprawione liczby elementów w akapitach i polu `elementy`: 40519 253→254, 80056 755→757 (zgodnie z metryką i Bricksetem). Treści w repo Piotra bez zmian.
**Slugify naprawione w `import-artykul-md.py`:** (1) recenzje dostają slug z konwencji `lego-<nr>-<nazwa>-recenzja` (nazwa z `sety.json`, bez dopisku „SMART Play:”, limit 70 zachowany), zamiast ucinanego tytułu; (2) przy ucięciu długiego tytułu slug nie kończy się już spójnikiem/przyimkiem („…-dla-fanow-ktorzy”). Opublikowana recenzja 21276 zostaje pod starym adresem — rejestr skrzynki trzyma jej slug, więc nic się nie przemianowuje.

## 2026-11-03 08:55 · CODE · Skrzynka (GitHub): 25 kart P07 + recenzja 21276 Creeper

**Pierwszy przebieg kanału GitHub (`tylkoklocki-teksty`): 25 kart z partii 29–31 listy dla Piotra (`25a2f78` + `381ac91`) i recenzja Recenzje_016 https://tylkoklocki.pl/artykuly/lego-minecraft-21276-creeper-duza-zielona-figurka-dla-fanow-ktorzy/ (`25a2f78`).** Rejestr kart: 1849. Źródła w repo tekstów przeniesione do `opublikowane/` (`add64d5` w tylkoklocki-teksty — repo dodane do sesji z prawem zapisu, wcześniej proxy odmawiało pushu).
- Naprawione w automacie: karty 30638, 30660, 30726 (jeden akapit) blokował importer, a skrzynka gubiła linię „BLOKADA” (wzorzec nie przewidywał nazwy pliku po numerze) i raportowała „ok”. Teraz automat przekazuje `--krotkie` (jak ręczne importy P07) i zgłasza każdą blokadę jako problem.
**Dla drugiej strony:** w tekście kart Piotra błędne liczby elementów — 40519 „253 elementy” (Brickset i katalog: 254), 80056 „755 elementów” (757). Treści Piotra nie poprawiałem.
**Mamy?** — częściowo: karty na stronie z błędną liczbą w akapicie
**Zrobić:** — poprawić liczbę w akapicie kart 40519 i 80056 w `src/data/karty_setow.json` (albo przysłać poprawione pliki)
**Kto:** — Marek (decyzja: poprawka w Code czy przez Piotra)

## 2026-11-03 08:10 · RADAR · Do zrobienia

**faniklockow.pl · 02.11** — Ogłosili Black Weeks w Media Expercie; ceny mamy (feed z 02.11 to 698 ofert ME, 323 z rabatem ≥30%), ale nie mieliśmy aktualnego kodu — w `kody_rabatowe.json` stały dwa wpisy wygasłe 31.10 i 15.10.
**Mamy?** — częściowo: kod odświeżony w tym przebiegu (`R0211-301126` do 30.11 na 41 zestawów, `BW3010-0511` do 05.11 na jeden), ale **dla 37 z 42 zestawów nasza cena z feedu jest wyższa od ceny z kodem** (10313: 176,22 wobec 149; 11378: 863,92 wobec 748), a `kodRabatowy()` pokazuje kod tylko przy cenie zgodnej co do złotówki — więc w szczycie Black Weeks zaniżamy rabat Media Expertu i nie mówimy o kodzie.
**Zrobić:** — zdecydować, czy przy aktywnym kodzie tabela ma pokazywać cenę z kodem obok ceny z feedu, czy czekamy, aż feed ME dogoni kod. To zmiana w tym, co widzi czytelnik (`src/lib/oferty.js`, `TabelaCen.astro`), więc jej nie robię sam.
**Kto:** — Marek (decyzja)
→ część wykonana 03.11.2026: `kody_rabatowe.json` odświeżony skryptem `me-kody.mjs`; x-kom nietknięty, liczba wpisów bez zmian (2 ME + 3 x-kom).
Warte zapamiętania: zdanie z `_meta` tego pliku — „feed ME podaje cenę PO kodzie" — **dziś nie jest prawdziwe**.
Na 42 zestawy z kodem tylko 3 mają w feedzie cenę zgodną z kodem. Jeśli to się utrzyma, opis w `_meta`
trzeba poprawić razem z decyzją o regule wyświetlania.


## 2.11.2026 (6) — Pełna lista braków opisów dla Piotra: listy/ w repo tekstów (Claude Code)

- Piotr potwierdził 75/75 po paczkach 03/04/29 i poprosił o pełną listę braków
  z kolumnami status/liczba sklepów/czy jest strona. `lista-brakow-opisow.mjs`
  rozszerzony (status_sprzedazy, liczba_sklepow_z_oferta — pierwsza ręka,
  ma_strone z dist/); CSV **3165 pozycji** (147 rocznik 2026 + 3018 starszych)
  wypchnięty do `tylkoklocki-teksty/listy/braki-opisow-2026-11-02.csv`
  (commit 49018fd) razem z README kolumn — to nowy stały kanał list,
  automat publikacji czyta tylko do-publikacji/, więc bez kolizji.
- Mail z linkiem do pliku czeka jako **draft w tylkoklockiblog@** (wysyłkę
  znów zablokował klasyfikator) — Marek klika Wyślij.
- Uzgodnione: świeża lista do listy/ co ~5 paczek; Piotr robi paczkę 30 wg
  obecnej kolejki i wróci z propozycją wplecenia pełnej listy.

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
↻ 09.11 (Kontroler): zrzuty z 02.11 weszły we wtorek 03.11 07:07 (`31c2d2e`, 4 518 Empik / 700 x-kom); dziś 09.11 do 09:40 PL znowu ich nie ma. Przypomnienie 08:15 odpala się, ale zrzut robi człowiek na Macu — jeśli poniedziałek rano nie pasuje, lepiej przestawić przypomnienie i skill na wtorek, niż co tydzień mieć pozycję.

**11381 Jaguar E-Type ma dwie daty premiery: `karty_setow.json` (metryka „Premiera" i zdanie w treści) „1 lipca 2026", recenzja `/artykuly/lego-11381-jaguar-e-type-recenzja/` i `sety.json` (`premiera: 2026-08`) „1 sierpnia 2026" — jedyna sprzeczność z nowego sprawdzenia dat premier (`swiezosc-tekstow.mjs`, 522 zestawy).**
**Mamy?** — tak: oba miejsca w repo, karta idzie na hub.
**Zrobić:** — potwierdzić datę na karcie lego.com i poprawić to miejsce, które się myli (najpewniej kartę — rejestr i recenzja zgadzają się na sierpień).
**Kto:** — Code (dane)
↻ 09.11 (Kontroler): nadal aktualne — `swiezosc-tekstow.mjs` 09.11 pokazuje tę samą sprzeczność (karta „1 lipca", recenzja i `sety.json` sierpień).

Poza listą dla ludzi: Scout nie zostawił commita 27.10 (jedyna luka runnera w tygodniu; 28.10–02.11 codziennie) — sprawdzę za tydzień, czy to jednorazowe. `/zestaw/10280/` nadal z crawlem 11.09 (52 dni), `/serie/marvel/` odwiedzony 01.11 sam. Nowy kanał GitHub skrzynki (`tylkoklocki-teksty`) i panel — kontrola za tydzień, czy zostawiają wpisy w dzienniku.

## 2026-11-02 08:55 · CODE · Skrzynka (panel): 0034 opublikowany

**0034 „Ulice miasta LEGO. Jak płyty drogowe zmieniały się od 1978 roku do dziś” (Historyczne, 13 zdjęć) — https://tylkoklocki.pl/artykuly/ulice-miasta-lego-jak-plyty-drogowe-zmienialy-sie-od-1978-roku-do-dzis/ (`94335d1`).** Pierwszy tekst wgrany przez panel (Piotr, 01.11 15:25) — po tym, jak mail z 10,6 MB nie przeszedł przez konektor Gmail. Wynik zapisany w panelu (Wgraj → opublikowane), powiadomienie poszło.
**Dla drugiej strony:** kanał GitHub (`github-teksty.py`) pominięty — brak `GH_TEKSTY_TOKEN` w środowisku tej sesji.

## 2026-11-02 09:20 · ŁOWCA · Do zrobienia

**Poniedziałkowa kontrola linków: karta Lidla dla 10427 (interaktywny pociąg DUPLO) zwraca 404 — jedyny martwy link na 150 sprawdzonych (raport: materialy/kontrola-linkow-2026-11-02.md)**
**Mamy?** — tak: wpis w `redirects.lidl`, worker przy wejściu odeśle czytelnika na nieistniejącą kartę
**Zrobić:** — zdecydować o usunięciu wpisu `10427` z gałęzi `lidl` w `src/data/redirects.json` (mapy poza Empikiem/x-komem są append-only, kasowanie wymaga decyzji)
**Kto:** — Marek (decyzja)
→ zamknięte 02.11.2026: Marek zdecydował („lidla usuń") — wpis 10427 usunięty z `redirects.lidl`, worker spada na wyszukiwarkę Lidla.

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
→ **zamknięte 03.11.2026 — zgłoszenie było nietrafione, nie ma czego poprawiać.** Przeczytałem
`src/pages/serie/[seria].astro` zamiast opierać się na notatce z 29.10. Filtr w linii 37 ma DWA
warunki: `/^\d{4}-\d{2}$/.test(s.premiera)` **oraz** `s.premiera <= biezacyYm`. Decyduje więc nie
format, tylko to, czy miesiąc premiery już nadszedł — a komentarz nad tym kodem mówi wprost:
„zapowiedzi zostają na `/nowosci/`" (ustalone 11.10.2026). Wszystkie osiem zestawów to rocznik 2027
albo zapowiedź bez daty, czyli pozycje jeszcze nie w sprzedaży: zachowanie jest zamierzone.
Dowód z tego przebiegu: 42254 dostał dziś `premiera: 2027-01` z oficjalnej daty 1 stycznia 2027 —
i po buildzie **nadal nie ma go** na `/serie/technic/` (0 trafień `/zestaw/42254/`), bo
`"2027-01" <= "2026-11"` jest fałszem. Wejdzie tam sam w styczniu 2027. Nic dla Code.

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
↻ 2026-11-03: nadal aktualne — trzeci przebieg rzędu (01.11, dwa wywołania tego dnia, i teraz 03.11) z tym samym błędem PF_392, nic się nie zmieniło.
→ zamknięte 2026-11-03 (mail Tradedoublera do Marka, wklejony w czacie): przyczyna nie jest usterką podpięcia jak przy Lidlu — **program Ceneo CPS 385881 został trwale zakończony przez Tradedoublera**. Zaległe prowizje mają być wypłacone, nowych nie będzie. `feedy.json.ceneo.aktywny` ustawiony na `false` (Dane wt od teraz pomija ten feed), status w `afiliacje_rejestr.json` zmieniony na „zakonczony", dane w `redirects.json`/`oferty_feed.json` zostają jako ostatni znany stan (append-only). Nowy wpis niżej: decyzja o linku w `worker.js` i wierszu Ceneo w tabelach cen.

## 2026-11-03 · DANE WT · Do zrobienia

**Program Ceneo CPS 385881 (Tradedoubler) zakończony — `src/worker.js` (linie ok. 232–238, `/idz/ceneo/<nr>`) wciąż buduje link przez ten program (`clk.tradedoubler.com?p=385881&a=3494691&url=...`), tak samo linki w `redirects.ceneo` z feedu. Kliki nie przyniosą już prowizji, a sam przekierowywacz może z czasem zacząć błądzić (TD bywa, że wygasza martwe programy).**
**Mamy?** — tak: dokładne miejsce w kodzie (`worker.js` ~232–238) i pełny opis w `afiliacje_rejestr.json._meta.decyzje.ceneo_zakonczony`.
**Zrobić:** — decyzja Marka, co dalej z `/idz/ceneo/`: (a) zostawić jak jest — link i tak trafia na ceneo.pl, tylko bez prowizji; (b) zamienić na zwykły link bez wrappera TD (bezpośrednio na ceneo.pl); (c) zdjąć wiersz Ceneo z tabel cen w ogóle (dotyczy wielu szablonów: `TabelaCen.astro`, `KartaOferty.astro`, `PasekCeny.astro` i innych — do rozpisania po decyzji). To zmiana w `src/worker.js` i/albo szablonach, więc zgodnie z CLAUDE.md wymaga potwierdzenia przed pushem.
**Kto:** — Marek (decyzja), potem Code (wdrożenie)
→ zamknięte 09.11.2026 (Kontroler): zrobione w dwóch krokach — (b) 03.11 `834e724` worker kieruje `/idz/ceneo/` bezpośrednio na ceneo.pl bez wrappera TD, (c) 06.11 decyzja D1 audytu: Ceneo zdjęte z tabel cen (`SKLEPY_WYLACZONE`), 0 linków `/idz/ceneo/` w buildzie.

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
↻ 05.11.2026: nadal aktualne i zostały trzy dni — oba okna (40898 i 40889) kończą się 8 listopada, po tej dacie koszyka nie da się już sprawdzić, a pytanie zostanie bez odpowiedzi na stałe.

## 2026-10-31 08:05 · RADAR · Do zrobienia

**faniklockow.pl · 30.10** — Opisali 76329 Maskę Milesa Moralesa jako okazję (tegoroczny EOL, rynek droższy od katalogu, przy dwóch sztukach wpada gratis 40889); arytmetyka się zgadza, ale karta lego.com sprawdzona dziś mówi „Chwilowo niedostępne", więc po cenie katalogowej nie ma czego kupić — została natomiast luka w naszych danych.
**Mamy?** — nie: 76329 nie ma w `sety.json` ani w `ceny_baza.json`, mimo potwierdzonego wycofania na grudzień 2026. Policzone szerzej: **49 zestawów z potwierdzonym wycofaniem w 2026 roku** jest poza rejestrem (plus 19 już po produkcji).
**Zrobić:** — zdecydować, czy dopisujemy te 49 do `sety.json` + `ceny_baza.json` przed grudniem; lista z nazwami, cenami i terminami w `materialy/wycofania-poza-rejestrem-2026-10-31.md`. To **inna klasa luki niż lista z 29.10**: tam kryterium był rabat ≥25%, a tutaj **21 z 49 pozycji jest na rynku droższe od katalogu** (76329 +47%, Endurance +26%, Nike Dunk Trickshot +21%), więc żaden filtr rabatowy ich nie pokaże — a to właśnie zestawy, przy których argumentem sezonu jest „w grudniu zniknie", nie „jest tanio".
**Kto:** — Marek (decyzja)
↻ 09.11 (Kontroler): nadal aktualne, 9 dni — decyzja 1 raportu 09.11: do Black Friday zostało 18 dni, proponowany termin dopisania do 20.11; lista w `materialy/wycofania-poza-rejestrem-2026-10-31.md`.
→ zamknięte 09.11.2026 (Kontroler, zgoda Marka 09.11 „zgoda na decyzję 1"): 48 zestawów dopisanych do `sety.json` (1305 → 1353) i `ceny_baza.json` (1201 → 1249) — 10335 Endurance był już od 06.11. Nazwa, seria, elementy, RRP z `katalog.json`/`rrp_potwierdzone.json`, wiek i rok z kart, teksty rodzic/AFOL napisane w sesji Kontrolera; minimum w `ceny_baza` z `historia-cen` i dzisiejszego feedu po sicie 50% RRP, bez Ceneo. `known-sets-sync` 1353/1353, kolejka redakcyjna przeliczona, build czysty.

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
↻ 04.11.2026: nadal aktualne, ale treść poprawki się zmieniła — **widełki cenowe są już
nieaktualne**. LEGO odsłoniło zestaw 3 listopada: cena to **399,99 euro**, premiera 27 listopada,
5363 elementy. W sekcji `#listopad` wystarczy więc podać jedną kwotę zamiast dwóch, a zdanie
o nieogłoszonej cenie zastąpić informacją, że polskiej ceny katalogowej wciąż nie ma. Akapit
o premierze bez rabatu zostaje w mocy i zyskał konkret: gratis 40888 jest jedyną korzyścią
z zakupu 27 listopada.

**107 zestawów ma w `katalog.json` status `dostepny` i aktualne oferty w `oferty_feed.json`, a nie ma ich w `sety.json` — czyli bez śledzonego minimum, bez alertu cenowego i bez wejścia do „Dziś w dobrej cenie".**
**Mamy?** — częściowo: huby tych zestawów stoją i pokazują ceny z feedu, ale rejestru nie mają. To inna lista niż ta domknięta 29.10 — tamta brała tylko zestawy z potwierdzonym RRP, min. dwiema ofertami i rabatem ≥25%; ta nie ma progu rabatu i obejmuje też pozycje bez ceny katalogowej.
**Zrobić:** — zdecydować, które grupy z tych 107 w ogóle chcemy śledzić, bo to nie jest jednorodna lista: **85** pozycji to normalne zestawy roczników 2012–2025 (84 z nich z potwierdzonym RRP; rocznik 2025 to 48 sztuk, 2024 — 21; m.in. 10351, 10352, 10361, 10375, 21360, 42217, 76317 oraz 21351 z potwierdzonym wycofaniem na grudzień 2026), **13** to gadżety i breloki bez ceny katalogowej (854xxx, 5006157, 5007851), **6** to Power Functions (88005, 88009, 88010, 88012, 88013, 88015), a **4** to tegoroczne saszetki i brelok bez RRP (30718, 30720, 30732, 854328 — ten ostatni liczy się też w gadżetach, stąd 85+13+6+4 daje 108, a nie 107). Pełną listę odtwarza polecenie z raportu Scouta z 30.10.
**Kto:** — Marek (decyzja)
↻ 05.11.2026: nadal aktualne — przy definicji z `kolejka-redakcyjna.py` (katalog, rocznik 2020–2026, status `dostepny`, z ofertami w feedzie, bez pola `bez_rrp`) wychodzi dziś **100** pozycji i lista jest identyczna jak w stanie z commita `87c47a7` z 04.11 — żadna nie doszła i żadna nie zniknęła. Liczba 107 z tej pozycji obejmuje też roczniki 2012–2019, więc 100 to inne okno, a nie spadek.
↻ 10.11.2026: nadal aktualne, ale lista zrobiła się o połowę krótsza — po dopisaniu 48 zestawów z potwierdzonym wycofaniem (`5907a36`, decyzja Marka 09.11) zostaje **54** pozycje. Największe grupy: Gadżety 13, **Monkie Kid 10**, Archiwum 9, Creator 6, Icons 3. Monkie Kid trafia tu nieprzypadkowo — StoneWars pisze, że cała linia schodzi z rynku z końcem 2026 (sygnał w moim wpisie z dziś), więc te dziesięć zestawów albo dopisujemy teraz, albo zostaną bez śledzonego minimum na zawsze.

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
→ zamknięte 09.11.2026 (Kontroler, decyzja Marka 08.11 „czekamy, nie wysyłamy"): pytanie o zero konwersji okazało się nieaktualne — `getConversions` pokazuje 11 konwersji pending od 03.09 (276 zł), raporty liczyły tylko zatwierdzone. Zostaje pytanie o termin zatwierdzania — Kontroler pilnuje terminu we wpisie 09.11.

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
→ zamknięte 09.11.2026 (Kontroler): odczyt zrobiony 06.11 przez Coworka w audycie (C2) — 903 zindeksowane (dane GSC z 23.10), 648 wykrytych, `materialy/indeksacja/gsc-strony-2026-11-06.md`.

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

## 2026-10-20 09:10 · CODE · Do zrobienia

**Tekst Piotra o Star Wars na styczeń 2027 i `przecieki.json` różnią się przy dwóch zestawach: 75474 Master Yoda (Piotr: 1200 el., 149,99 €, 1.01.2027; u nas: bez elementów, 550 zł, 2027-04) i powiększonym Luke’u (Piotr: 75483, nowsze listy; u nas: 75482).**
**Mamy?** — częściowo: oba w `przecieki.json`, tekst Piotra opisuje rozbieżność list
**Zrobić:** — sprawdzić u źródeł i zaktualizować wpisy 75474 i 75482/75483 w `src/data/przecieki.json` (dopisać źródła, nie kasować wpisu)
**Kto:** — Scout (następny przebieg)

## 2026-10-20 05:45 · DANE WT · Do zrobienia

**Feed MediaMarkt (Tradedoubler) zawiera 2 pozycje, które skrypt pominął jako spoza katalogu albo niezgodne z nazwą: 76265 „Klocki LEGO Marvel Figurka Kapitana Ameryki do zbudowania" i 52447 „Klocki LEGO Classic Kwadratowy Notatnik czarny z długopisem".**
**Mamy?** — częściowo: numery i nazwy z feedu, nie ma ich w `katalog.json`
**Zrobić:** — sprawdzić oba numery (czy to realne numery LEGO) i dopisać do `potwierdzone_numery` w `src/data/feedy.json`, jeśli poprawne
**Kto:** — Code
↻ 2026-10-27: nadal aktualne — te same 2 numery wciąż pomijane w zrzucie MediaMarkt.
↻ 2026-11-03: częściowo zmienione — 52447 zniknął z feedu MediaMarkt (nie pojawia się już w zrzucie), 76265 wciąż pomijany.
→ zamknięte 2026-11-10: sprawdzone (Brickset, Firecrawl) — **76265 to prawdziwy numer LEGO, ale innego zestawu**: „Batwing: Batman vs. The Joker" (DC Comics Super Heroes, 2023), nie figurka Kapitana Ameryki z nazwy w feedzie MediaMarkt. To błędne skojarzenie numeru po stronie feedu/sprzedawcy, nie literówka — numeru NIE dopisujemy do `potwierdzone_numery`, skrypt słusznie go odrzuca co tydzień. Jeśli w kolejnych zrzutach MediaMarkt pojawi się pod innym, poprawnym numerem — nowy wpis.

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
↻ 09.11 (Kontroler): nadal aktualne — audyt 06.11 (C3) odczytał z panelu saldo x-komu (0 zł), ale stawki dla klocków i długości cookie nie; w rejestrze dalej „NIE SPRAWDZONA", `cookie_dni: null`. x-kom ma 18 polskich kliknięć w 30 dni, trzecie miejsce po ME i Allegro.

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
