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

- **Nie staramy się o pule kodów gratisowych od LEGO.pl** (Marek, 16.11.2026).
  Radar zgłosił to 06.11 (pula kodów na 30708 u fanklockow) i podniósł wagę 16.11,
  gdy tę samą pulę dostali faniklockow — odpowiedź Marka: **jesteśmy za mali**.
  Nie występujemy o to ani przez Tradedoublera, ani bezpośrednio do LEGO.pl i nie
  wracamy do tematu przy kolejnych takich akcjach konkurencji. Same akcje nadal
  odnotowujemy w bazie jako sygnał kalendarzowy (kiedy LEGO.pl szykuje okno
  gratisowe), ale do kalendarza nie wchodzą — bez cudzego kodu czytelnik gratisu
  nie dostanie.
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

- [`2026-11`](materialy/dziennik-archiwum-2026-11.md) — 27 wpisów
- [`2026-10`](materialy/dziennik-archiwum-2026-10.md) — 97 wpisów
- [`2026-09`](materialy/dziennik-archiwum-2026-09.md) — 105 wpisów
- [`2026-08`](materialy/dziennik-archiwum-2026-08.md) — 36 wpisów

Archiwizuje `node scripts/archiwum-dziennika.mjs`.

<!-- WPISY PONIŻEJ — wszystko nad tą linią zostaje w dzienniku na zawsze -->
## 2026-11-28 05:15 · SCOUT · Do zrobienia

**Dla 79 zestawów `wycofania.json` i `sety.json` podają różne nazwy, więc dział Wycofania i hub tego samego zestawu nazywają go inaczej — np. 10370 to „Poinsecja" w wycofaniach i „Botanicals Gwiazda Betlejemska" na hubie, 21349 „Kot w smokingu" wobec „Czarno-biały kot", 75367 „Krążownik typu Venator" wobec „Gwiezdny Niszczyciel typu Venator".**
**Mamy?** — częściowo: oba pliki są poprawne same w sobie. Nazwy w `wycofania.json` pochodzą z zaciągu lego.pl (`lego-ostatnie.mjs`), nazwy w `sety.json` są nasze. Licznik: 79 rozbieżności na 439 wpisów wycofań, sprawdzone dziś porównaniem obu plików po numerze.
**Zrobić:** — w widoku Wycofań brać nazwę z `sety.json`, gdy numer tam jest, a nazwę z zaciągu zostawić tylko dla numerów, których w rejestrze nie ma. Poprawka w szablonie strony, nie w danych — `wycofania.json` ma jednego właściciela (runner Wycofań) i ręczne przepisywanie 79 nazw rozjedzie się przy następnym zaciągu.
**Kto:** — Code (dane, strona)

## 2026-11-27 08:55 · SKRZYNKA · Zrobione

**GitHub (tylkoklocki-teksty) → opublikowane (6d147d5):** 0063 [LEGO Fortnite 77084 P-1000 i 77088 Guaco's Tacos](/artykuly/lego-fortnite-77084-p-1000-i-77088-guacos-tacos-oficjalnie-dwa-zestawy/) (3 zdjęcia).
**Kto:** — Code (automat skrzynki)

## 2026-11-27 08:20 · RADAR · Do zrobienia

**lego.com/pl-pl · 27.11** — W dniu Black Friday karta pokazuje rabaty **20–50%**, a w regulaminach pojawiła się **czwarta akcja**: poczwórne punkty Insiders na 77984, 72154, 43031, 43026 i 77082 (27–30.11, **wymagane Insiders**, inaczej niż przy gratisach).
**Mamy?** — tak: sekcja `#listopad-bf` uzupełniona, okna 23–26.11 i 21–26.11 przestawione na zamknięte, Black Friday na „trwa".
**Zrobić:** — zrobione, a najważniejsze ustalenie dnia zapisałem w kalendarzu wprost: **pod każdą przeceną najniższa cena z 30 dni przed obniżką jest równa cenie promocyjnej**, czyli te same ceny były już w wyprzedaży Insiders 21–26.11 — rabat wobec cennika jest prawdziwy, ale **nie jest nowym minimum**. To dokładnie ten typ pseudopromocji, który obiecaliśmy rozbierać.
**Kto:** — Code (dane, strona)

**faniklockow.pl · 26.11** — Opublikowali przegląd **Black Weeks na Amazonie**.
**Mamy?** — **nie**: Amazona nie mamy w ogóle — ani w mapach linków, ani w tabelach cen na podstronach zestawów. W szczycie sezonu nie pokazujemy czytelnikowi jednego z dużych sklepów.
**Zrobić:** — sprawdzić w `src/data/afiliacje_rejestr.json` i u źródła, czy Amazon ma dla nas dostępny program partnerski, i zdecydować, czy dodajemy go przed grudniem. Decyzja po stronie Marka, przygotowanie danych po mojej.
**Kto:** — Marek (decyzja)

**lego.com/pl-pl · 27.11 (kontrola naszych danych)** — Dzisiejsza cena [75192](/zestaw/75192/) na LEGO.com (−30% od cennika) jest **niższa niż obie nasze świeże oferty zewnętrzne** z feedu: allegro z 26.11 i x-kom z 25.11.
**Mamy?** — częściowo: tabela huba pokaże to po dzisiejszym odświeżeniu LEGO.pl, więc do tego czasu czytelnik widzi nieaktualny obraz.
**Zrobić:** — potwierdzić w jutrzejszym przebiegu, że odświeżenie weszło, a jeśli nie — uruchomić odświeżenie LEGO.pl ręcznie; przy BF to jedyny dzień w roku, kiedy sklep LEGO bywa najtańszym źródłem i tabela musi to pokazać od razu.
**Kto:** — Code (dane, strona)


## 2026-11-27 05:15 · SCOUT · Do zrobienia

**LEGO wystawiło w Centrum Nagród Insiders nową świąteczną nagrodę 5010881 Warsztat Mikołaja — 135 elementów, dwie minifigurki, do wymiany za 2400 punktów od 27 listopada 2026 (LEGO wycenia ją na 16 euro).**
**Mamy?** — częściowo: zestaw jest od dziś w `sety.json` z polem `bez_rrp` i ma hub `/zestaw/5010881/`, ale `grep -c "5010881" src/pages/kalendarz-promocji-lego.md` daje dziś 0. Kalendarz wspomina Centrum Nagród tylko przy bombkach z Harrym Potterem za 1700 punktów.
**Zrobić:** — dopisać 5010881 do `kalendarz-promocji-lego.md` tam, gdzie stoją nagrody punktowe (akapit o Centrum Nagród i wiersz „Co trwa teraz"): 2400 punktów, od 27.11.2026, z linkiem do huba i zastrzeżeniem, że nagrody schodzą po wyczerpaniu zapasu, a nie w ustalonym terminie.
**Kto:** — Code (dane, strona)
↻ 2026-11-28 (Scout): nadal aktualne — `grep -c "5010881" src/pages/kalendarz-promocji-lego.md` daje dziś 0, a doszła druga pozycja do tego samego miejsca: **40903 Mini gwiazdy betlejemskie**, upominek do zamówień w sklepie LEGO w grudniu 2026 (według StoneWars okno 2–8 grudnia, progu LEGO nie podało), od dziś w `sety.json` z hubem `/zestaw/40903/`. Przy 40903 w kalendarzu trzeba zaznaczyć, że to okno nieoficjalne — jedno źródło branżowe, bez progu.

## 2026-11-26 09:05 · SKRZYNKA · Zrobione

**GitHub (tylkoklocki-teksty) → opublikowane (8afc246, 968f06b):** nowe 0061 [Poczwórne punkty LEGO Insiders przedłużone do 30.11](/artykuly/poczworne-punkty-lego-insiders-na-trzy-zestawy-przedluzone/) (3 zdjęcia) i 0062 [LEGO Marvel 67023 Jeff the Land Shark](/artykuly/lego-marvel-67023-jeff-the-land-shark-oficjalnie-pierwszy-zestaw-z-gry/) (4 zdjęcia); poprawki z dołożonymi zdjęciami: 0060 [Harry Potter według serialu HBO](/artykuly/lego-harry-potter-wedlug-serialu-hbo-cztery-zestawy-od-1-stycznia-2027/) (3) i recenzja 026 [60480](/artykuly/lego-60480-zolta-koparko-ladowarka-recenzja/) (5).
**Wyścig:** zdjęcia do 0061/0062 Piotr wypchnął w trakcie przebiegu — teksty poszły najpierw bez nich, push repo tekstów został odrzucony. Po rebase oba .md wróciły do `do-publikacji/` i przeszły drugi raz razem ze zdjęciami (968f06b); Piotr i Marek dostali dwa maile z linkami.
**Kto:** — Code (automat skrzynki)

## 2026-11-26 08:20 · RADAR · Do zrobienia

**lego.com/pl-pl · 26.11** — Karta Black Friday ma już **regulaminy**: gratis **40914 od 1070 zł** i **40918 od 705 zł** w dniach **27–29.11** (nie do Cyber Monday), plus **40888** do zakupu obejmującego [21375 Godzilla](/zestaw/21375/), 27–30.11.
**Mamy?** — tak, od dziś: nowa sekcja `#listopad-bf` z tabelą i trzema pułapkami; Black Friday przestawiony z „przewidywane" na „potwierdzone"; tekst z 10.11, który miał „warunki nieznane", dostał blok aktualizacji z progami.
**Zrobić:** — zrobione. Trzy rzeczy warte powtórzenia w krótkich formach: progowe gratisy kończą się **29.11**, regulamin 40918 **wyklucza z progu zakup Godzilli**, a w regulaminach BF **nie ma wymogu Insiders**, który obowiązywał przy tych samych gratisach 21–22.11.
**Kto:** — Code (dane, strona)

**faniklockow.pl · 24–26.11** — Drugi prezentownik progowy w trzy dni: po „do 200 zł" wyszedł **„od 200 do 500 zł"**. Serwis buduje pełną drabinę prógów prezentowych.
**Mamy?** — częściowo i nie pod te frazy: w `/prezentowniki/wedlug-budzetu/` mamy „do 100 zł", „150–250 zł" i „do 600 zł", więc przedział 200–500 zł rozpada się na dwa nasze progi, a żaden nie odpowiada temu zapytaniu.
**Zrobić:** — to wzmacnia punkt z 24.11: przepisać progi pod rzeczywiste zapytania (do 50 zł, do 100 zł, do 200 zł, 200–500 zł) zamiast trzymać dotychczasowego podziału. Decyzja nadal po stronie Marka — teraz z drugim dowodem, że konkurencja celuje w te frazy.
**Kto:** — Marek (decyzja)

**fanklockow.pl · 26.11** — Opublikowali własny **poradnik Black Friday i Cyber Monday na LEGO.pl**, tego samego dnia co nasza sekcja.
**Mamy?** — tak: `#listopad-bf` z regulaminami u źródła. Treści ich poradnika **nie czytałem** — nie wiem, czy mają te trzy pułapki w datach i progach.
**Zrobić:** — nic dzisiaj; w poniedziałkowym przebiegu porównać ich poradnik z naszą sekcją i sprawdzić, czy czegoś u nas nie brakuje (to jest ich mocny format — „megaporadniki" wracają przy każdej akcji).
**Kto:** — Code (dane, strona)


## 2026-11-25 14:55 · SKRZYNKA · Zrobione

**GitHub (tylkoklocki-teksty) → opublikowane (619c46e):** 0060 [LEGO Harry Potter według serialu HBO — cztery zestawy od 1 stycznia 2027](/artykuly/lego-harry-potter-wedlug-serialu-hbo-cztery-zestawy-od-1-stycznia-2027/), recenzja 026 [60480 Żółta koparko-ładowarka](/artykuly/lego-60480-zolta-koparko-ladowarka-recenzja/) (bez zdjęć Piotra) oraz nowa wersja 0059 — Piotr przepisał tekst na „BrickLink znów działa” (powrót 24.11).
**Uwaga:** 0059 zachował adres `/artykuly/aktualizacja-bricklink-wciaz-niedostepny-serwis-nie-potwierdza-juz/` (data 24.11, `zaktualizowano: 25.11`), więc slug mówi „wciąż niedostępny”, a tytuł — że działa. Zmiana adresu = przekierowanie, decyzja Marka. Ta sama lekcja co przy tekście z 21.11: datowany stan w tytule starzeje się w kilka dni.
**Kto:** — Code (automat skrzynki)

## 2026-11-25 08:15 · RADAR · Do zrobienia

**bricklink.com · 24.11** — **Serwis wrócił** po pięciu dniach. Centrum pomocy: „Our teams have completed the work needed to restore the site on 24th November 2026", a na pytanie o dane — **„No — ... no passwords, payment information, bank account information, national identification information, or other sensitive data were accessed"** (inaczej niż po przerwie 5–12.11). Wszystkie sklepy otwarto automatycznie, mogą przyjść zaległe maile, serwis ostrzega przed podszywaniem się.
**Mamy?** — tak: tekst przepisany (tytuł „BrickLink wrócił po pięciu dniach", blok aktualizacji z cytatami i trzema rzeczami ważnymi po powrocie), slug bez zmian.
**Zrobić:** — zrobione, a notki w `#bldp` **nie zdjąłem** — przepisałem ją na trwałą, zgodnie z wnioskiem z 20.11: sekcja mówi teraz o dwóch listopadowych przerwach (5–12.11 i 19–24.11) i o tym, że przy przedsprzedaży BLDP trzeba zakładać chwilową niedostępność kanału. Koniec cyklu „dopisz i skasuj" co tydzień.
**Kto:** — Code (dane, strona)

**bricklink.com · 24.11 (do sprawdzenia)** — Banner na stronie głównej zapowiada **powrót Designer Program**: „New opportunity to support fan designers from LEGO Ideas".
**Mamy?** — nie, i **treści nie znam**: strona newsa zwraca błąd bez logowania, więc nie wiem, czy chodzi o nową serię, nową formułę finansowania, czy o dokończenie serii 9.
**Zrobić:** — dopytać u źródła w kolejnym przebiegu (strona pomocy BLDP albo ogłoszenie w serwisach branżowych); jeśli to nowa seria, trafia do kalendarza i do planu tekstów na grudzień. Do tego czasu **nie piszemy o tym nic** — mamy tylko nagłówek bannera.
**Kto:** — Code (dane, strona)

**faniklockow.pl · 25.11 (luka w monitoringu)** — Dwa odczyty strony głównej (format `links`, raz z `onlyMainContent`, raz bez) zwróciły **pustą listę** przy statusie 200.
**Mamy?** — nie dotyczy: dzisiejszych publikacji tego serwisu **nie sprawdziłem**, nie zakładam, że ich nie było.
**Zrobić:** — w jutrzejszym przebiegu zacząć od tego serwisu i, jeśli znowu wróci pusto, czytać go z `markdown` albo z listy kategorii zamiast ze strony głównej.
**Kto:** — Code (dane, strona)


## 2026-11-24 08:55 · SKRZYNKA · Zrobione

**GitHub (tylkoklocki-teksty) → opublikowane (3df70cd):** 0058 [Świąteczny zestaw artystyczny 5011174 gratis na LEGO.pl](/artykuly/swiateczny-zestaw-artystyczny-5011174-gratis-na-lego-pl-od-310-zl/) (3 zdjęcia), 0059 [BrickLink wciąż niedostępny](/artykuly/aktualizacja-bricklink-wciaz-niedostepny-serwis-nie-potwierdza-juz/) (1 zdjęcie) oraz poprawka recenzji 025 [71866](/artykuly/lego-71866-ozdoba-z-postaciami-ninja-15-lecie-recenzja/) — Piotr dołożył 5 zdjęć; data 23.11 zostaje, `zaktualizowano: 24.11`.
**Poprawka importera (90565a0):** Piotr odesłał 025 z kopii w `opublikowane/`, z naszym znacznikiem `<!-- Opublikowane: … -->` w pierwszej linii — importer odrzucał plik („Pierwszy wiersz … # Tytuł”). Teraz znacznik jest pomijany.
**Uwaga:** 0059 i nasz tekst z 21.11 o BrickLinku opisują tę samą przerwę — warto je podlinkować wzajemnie.
**Kto:** — Code (automat skrzynki)

## 2026-11-24 08:15 · RADAR · Do zrobienia

**bricklink.com · 24.11** — **Wtorkowy termin powrotu został wycofany.** Poniedziałkowy komunikat: „We're not quite ready to confirm when access will be restored" — kolejna informacja dziś o 19:00 CET, o powrocie BrickLink powiadomi członków mailem. Przerwa trwa szósty dzień.
**Mamy?** — tak, poprawione dziś rano: tytuł i opis tekstu z 21.11 zmienione na „LEGO wycofało wtorkowy termin powrotu", na górze datowany blok aktualizacji z cytatem, adres (slug) **bez zmian**, żeby nie psuć linków; sekcja `#bldp` w kalendarzu przepisana.
**Zrobić:** — sprawdzić komunikat z 19:00 w jutrzejszym przebiegu. **Lekcja na przyszłość: nie wkładamy do tytułu daty, która zależy od cudzej decyzji** — ten jeden tekst wymagał poprawki dwa razy w trzy dni, a slug został z nieaktualnym terminem na zawsze.
**Kto:** — Code (dane, strona)

**faniklockow.pl · 23.11** — Opublikowali prezentownik progowy **„Klocki LEGO na prezent do 200 zł"** — najczęściej szukana kwota prezentowa, w szczycie sezonu.
**Mamy?** — częściowo: [/prezentowniki/wedlug-budzetu/](/prezentowniki/wedlug-budzetu/) ma progi „do 100 zł", „150–250 zł" i „do 600 zł", a osobny tekst to „LEGO za 200 zł dla 10-latka" — zawężony do wieku. Progu **200 zł bez zawężenia wiekowego** nie mamy.
**Zrobić:** — decyzja, czy robimy osobny prezentownik „do 200 zł" (i czy razem z otwartym punktem „do 50 zł" — 950 zestawów w tej cenie, 159 z hubami), czy rozbijamy istniejący próg „150–250 zł" na dwa. Do środy, bo potem ruch prezentowy zaczyna spadać.
**Kto:** — Marek (decyzja)

**fanklockow.pl · 23.11** — Opisali gratis 5011174 i poczwórne punkty — tę samą falę, którą my opublikowaliśmy **dzień wcześniej**.
**Mamy?** — tak i szerzej: sekcja `#listopad-pakiety` ma dwa warunki z regulaminu, których u nich nie ma (próg 310 zł liczony tylko z pięciu serii dziecięcych; zakaz rozdzielania i zwrotu pojedynczych zestawów z pakietu).
**Zrobić:** — nic.
**Kto:** — Code (dane, strona)


## 2026-11-24 05:15 · SCOUT · Do zrobienia

**W zestawie 76329 (maska Milesa Moralesa) trafiła się komuś przez pomyłkę czarna płytka 2×4 ze złotym nadrukiem „10th Anniversary" i głową z logo BrickHeadz — seria kończy w 2027 roku dziesięć lat, licząc od 41585 Batmana z 2017.**
**Mamy?** — częściowo: w `katalog.json` jest **195** zestawów BrickHeadz, w `sety.json` 27 (roczniki 2023–2026), ale w dziale Artykuły **nie ma o tej serii ani jednego tekstu**.
**Zrobić:** — napisać tekst historyczny o dziesięciu latach BrickHeadz (kategoria Historyczne), oparty na naszym katalogu: od 41585 z 2017 do fali 2026, co się zmieniło w cenie za element i w licencjach. Znalezisko z 76329 to tylko punkt zaczepienia — pochodzi z jednego wpisu na Reddicie, a serwis branżowy sam pisze, że nie wie, czy płytka trafi do zestawów 2027; tekst ma stać na rocznicy i katalogu, nie na tej płytce.
**Kto:** — Piotr (tekst)


## 2026-11-23 10:05 · KONTROLER · Do zrobienia

Raport: `materialy/kontroler-2026-11-23.md` (PDF u Marka). Mail „Zadania bez właściciela — 23.11.2026" (id `01a2078e`): 48 pozycji — Piotr 5, Marek 13, Code 29, Cowork 1. Archiwum: 23 wpisy → `materialy/dziennik-archiwum-2026-11.md`. Kamienie: 1 = 2 z 3 (bez zmian), 2 = 2 sklepy, 3 = **8,1/dzień** (7 dni; okno 28 dni **8,2**, rekord), 4 = 903 (odczyt z 06.11, 17 dni). Boty 12 742 → 4 509; reguła z 02.11 trzeci tydzień bez wyjątku (0 kliknięć spoza PL ze strony głównej). Trzy decyzje z raportu dopisane jako ↻ przy pozycjach źródłowych: Smyk przez Firecrawl (Radar 17.11), kupon Allegro (Radar 19.11), 43018 Messi (Łowca 17.11). Pozycje poniżej są nowe.

**Panel GSC („Strony") bez odczytu od 06.11 — 17 dni; sitemapa hubów urosła w tym czasie z 1 929 do 2 444 adresów, a kamień 4 stoi na 903 z danych z 23.10.**
**Mamy?** — nie: ostatni odczyt `materialy/indeksacja/gsc-strony-2026-11-06.md`; API URL Inspection nie daje liczby zbiorczej.
**Zrobić:** — odczytać raport „Strony" w panelu GSC (ten sam prompt Coworka co 06.11, punkt C2 z audytu) i zapisać jak `gsc-strony-2026-11-06.md`; Kontroler wpisze liczbę do kamienia 4 w następny poniedziałek.
**Kto:** — Cowork (panel) albo Marek (panel)

**Kontrola linków w przeglądarce 20.11 odpaliła się (Routine `trig_01NRYdRPRMVTYZTGDf5C8iH6`, 11:45, SUCCEEDED), ale w repo nie ma `materialy/kontrola-przegladarkowa/wyniki-2026-11-20.md` i w dzienniku nie ma wyniku — nie wiadomo, czy 20 linków z listy było żywych.**
**Mamy?** — nie: lista z 20.11 (`lista.md`, 4 × 5 sklepów, `4da8fe0`) jest, wyniku nie ma; 20.10 wynik wkleił Marek do sesji Kontrolera.
**Zrobić:** — wkleić wynik z rozmowy Coworka z 20.11 (albo napisać, że przebieg nie dał wyniku); Kontroler zapisze `wyniki-2026-11-20.md` i dopisze pozycje za martwe karty, jeśli były.
**Kto:** — Marek (przeglądarka)

**80122 Pixiu i 80123 Noworoczny rejs: pole `opis` w `sety.json` podaje dla każdego dwie daty wejścia do sprzedaży („23 grudnia 2026" i „1 stycznia 2027") — `swiezosc-tekstow.mjs` liczy to jako sprzeczność (razem z 11381 są trzy), a `opis` idzie do JSON-LD huba.**
**Mamy?** — częściowo: najpewniej to wcześniejszy dostęp Insiders (23.12) i sprzedaż ogólna (1.01), czyli obie daty prawdziwe, ale skrypt tego nie rozróżnia i czytelnik JSON-LD też nie.
**Zrobić:** — w `opis` obu zestawów zostawić jedną datę dzienną (premiera 1 stycznia 2027), a wcześniejszy dostęp opisać bez daty w formacie dziennym; albo nauczyć `swiezosc-tekstow.mjs` frazy „wcześniejszy dostęp" — jedno z dwojga, żeby alarm nie wracał co tydzień.
**Kto:** — Code (dane)

**Zrzuty Empiku i x-komu weszły w piątek 20.11 (`2e7b3fe`, 08:54), nie w poniedziałek; dziś do 09:33 dzisiejszych nie ma — ceny Empiku w hubach mają 3 dni, w tygodniu Black Friday.**
**Mamy?** — częściowo: piątkowy zrzut jest świeży jak na zwykły tydzień (4 579 Empik, 656 x-kom), ale skill `klocki-zrzuty-tygodniowe` zakłada poniedziałek.
**Zrobić:** — nic, jeśli piątkowy rytm jest zamierzony na czas Black Weeks (wtedy jedno zdanie tu); jeśli nie — dzisiejszy zrzut jak zwykle.
**Kto:** — Marek (przeglądarka)

## 2026-11-23 08:58 · SKRZYNKA · GitHub: Recenzje_025
Źródło: repo tylkoklocki-teksty, commit ba2e4d6.
- Recenzje_025 (71866) → https://tylkoklocki.pl/artykuly/lego-71866-ozdoba-z-postaciami-ninja-15-lecie-recenzja/ (bez zdjęć Piotra)

## 2026-11-23 08:20 · RADAR · Do zrobienia

**lego.com/pl-pl · 23.11** — Dzień po weekendzie LEGO otworzyło **falę do 26.11**: gratis **5011174** (wycena 45,99 zł) przy zakupach **od 310 zł** liczonych tylko z serii NINJAGO, Creator 3 w 1, City, Friends i Classic, oraz **dziesięć pakietów** (−20% za parę albo drugi zestaw −25%). Do listy 4× punktów doszly 11386, 72537 i 43024.
**Mamy?** — tak, od dziś: nowa sekcja `#listopad-pakiety` z tabelą dziesięciu par i warunkami z regulaminu; weekend Insiders przestawiony na zamknięty (okno skończyło się 22.11 o 23:59, co potwierdziło zniknięcie jego regulaminów).
**Zrobić:** — zrobione. Uwaga redakcyjna: pakiet sprzedaje się w całości — regulamin zabrania rozdzielania i zwrotu pojedynczych zestawów, więc jeśli drugiego zestawu ktoś nie chce, to nie rabat, tylko dopłata. Tak to opisaliśmy.
**Kto:** — Code (dane, strona)

**lego.com/pl-pl · 23.11 (luka w danych)** — Upominek **5011174 Świąteczny zestaw artystyczny** nie istnieje w `src/data/sety.json`, więc kalendarz wymienia go bez linku do huba (wszystkie 24 pozostałe numery z dzisiejszej fali sprawdziłem — są).
**Mamy?** — nie.
**Zrobić:** — dopisać kartę 5011174 do `sety.json` na wzór 40914/40918 (`cena_katalogowa: null` + `bez_rrp` z progiem 310 zł i oknem 23–26.11); liczby elementów i wieku nie zgadywać — wziąć z karty produktu LEGO.com.
**Kto:** — Code (dane, strona)

**lego.com/pl-pl · 23.11 (temat na krótką formę)** — Próg 310 zł z pięciu serii dziecięcych to **najniższy próg upominkowy od polybagów z 9–15.11** i pierwsza w tym sezonie akcja LEGO.com wycelowana w zakupy prezentowe dla dzieci, a nie w zestawy 18+.
**Mamy?** — częściowo: jest w kalendarzu, nie ma krótkiej formy, która by to niosła.
**Zrobić:** — krótka forma dealowa „Gratis od 310 zł na prezenty dla dzieci — tylko do 26 listopada" z progiem, listą pięciu serii i zastrzeżeniem o Insiders; okno zamyka się w środę, więc tekst ma sens do wtorku.
**Kto:** — Piotr (tekst)

**bricklink.com · 23.11** — Dziś po **19:00 CET** BrickLink ma podać komunikat o planowanym powrocie we wtorek 24.11.
**Mamy?** — tak: tekst z 21.11 i sekcja `#bldp` mówią „wtorek, warunkowo".
**Zrobić:** — sprawdzić komunikat w jutrzejszym przebiegu i zaktualizować oba miejsca: albo wtorek się potwierdził, albo termin się przesunął (to będzie trzecia zmiana terminu w tej awarii).
**Kto:** — Code (dane, strona)

## 2026-11-22 08:15 · RADAR · Do zrobienia

**bricklink.com · 22.11** — BrickLink ma **pierwszy termin powrotu**: „aiming to bring BrickLink back online on **Tuesday, November 24, 2026**", z zastrzeżeniem, że zależy to od przebiegu dochodzenia; kolejny komunikat zapowiedziany „by 10:00 AM PST / 7:00 PM CET on **Monday**". fanklockow.pl dał w tytule „wyłączony **do poniedziałku**" — poniedziałek to data komunikatu, nie powrotu.
**Mamy?** — tak i lepiej niż oni: tekst Piotra z 21.11 ma w tytule wtorek 24.11. Kalendarz miał jeszcze cytat z 20.11 bez terminu — poprawiony dziś, z linkiem do tego tekstu.
**Zrobić:** — zrobione. W poniedziałek po 19:00 sprawdzić komunikat: albo potwierdzi wtorek, albo przesunie — i wtedy aktualizujemy tytułowy termin w tekście i w `#bldp`.
**Kto:** — Code (dane, strona)

**lego.com/pl-pl · 22.11** — Dwa miejsca w naszym tekście o Weekendzie Insiders rozjeżdżały się z regulaminem: progi gratisów opisane jako „**ponad** 705/1070 zł" (regulamin mówi „**co najmniej**" — ta sama pułapka, którą opisaliśmy 15.11 przy 40906) oraz zdanie, że przy zamówieniu powyżej 1070 zł do koszyka trafiają **oba** upominki.
**Mamy?** — tak, poprawione: progi na „co najmniej"; zdanie o dwóch gratisach zmienione na informację, że piszą tak serwisy branżowe, a **regulaminy LEGO tego nie potwierdzają** — każdy upominek ma własny regulamin, próg i zastrzeżenie „jeden na gospodarstwo domowe".
**Zrobić:** — zrobione dziś rano, bo okno gratisów i kodu INSIDERS10 zamyka się **dziś o 23:59**. Zasada na przyszłość: próg GWP przepisujemy z regulaminu, nigdy z kafla ani z relacji innego serwisu.
**Kto:** — Code (dane, strona)

## 2026-11-21 14:58 · SKRZYNKA · GitHub: 0056, 0057, Recenzje_024
Źródło: repo tylkoklocki-teksty, commit 9b26303.
- 0056 → https://tylkoklocki.pl/artykuly/bricklink-znow-niedostepny-powrot-planowany-na-wtorek-24-listopada/ (1 zdjęcie)
- 0057 → https://tylkoklocki.pl/artykuly/weekend-lego-insiders-podwojne-i-poczworne-punkty-ceny-insiders/
- Recenzje_024 (75441) → https://tylkoklocki.pl/artykuly/lego-75441-krazownik-szturmowy-typu-venator-recenzja/ (5 zdjęć). Tytuł ma 107 znaków, a blok nie podaje „Tytuł SEO” — uwaga, nie blokuje.

## 2026-11-21 08:20 · RADAR · Do zrobienia

**lego.com/pl-pl · 21.11** — Weekend Insiders wystartował i jest **większy niż zapowiedź**: karta promocji ma od dziś **pięć regulaminów** — gratis 40914 od 1070 zł, gratis 40918 od 705 zł, kod **INSIDERS10** (−10% od 420 zł), podwójne punkty 21–22.11 oraz ceny Insiders i **poczwórne punkty aż do 26.11**.
**Mamy?** — tak, od dziś: nowa sekcja `#listopad-insiders` w kalendarzu z tabelą pięciu akcji; okna 40906 i 40898 przestawione na zamknięte (skończyły się 20.11).
**Zrobić:** — zrobione. Lekcja powtarza się drugi raz w tym miesiącu: **wczorajszy pusty odczyt nie był dowodem, że akcji nie ma** — regulaminy pojawiły się dopiero pierwszego dnia okna. Nie wnioskujemy z pustego odczytu.
**Kto:** — Code (dane, strona)

**faniklockow.pl · 20.11** — Tabela dziesięciu zestawów z rabatem −20% na Weekend Insiders — **z przecieków**, co autor pisze wprost („100% pewność będziemy mieli po północy"). Regulamin LEGO.pl żadnej listy ani wysokości rabatu nie podaje.
**Mamy?** — częściowo: mamy to, czego u nich nie ma — **kod INSIDERS10** (−10% od 420 zł, jedno użycie, tylko dla zapisujących się do Insiders 21–22.11, z imienną listą wykluczeń). Nie mamy krótkiej formy, która by to niosła — tylko sekcję w kalendarzu.
**Zrobić:** — krótka forma dealowa „Weekend Insiders: kod −10% dla nowych w programie, dwa gratisy i poczwórne punkty do środy" — jedyny element weekendu, który jest realnym rabatem, a nie punktami; okno zamyka się **w niedzielę 23:59**, więc tekst ma sens tylko dziś albo jutro.
**Kto:** — Piotr (tekst)

**promoklocki.pl · 21.11** — W katalogu konkurenta stoi już pełna fala Botanicals rocznika 2027 (11532–11537 plus 11515, 11516, 11519, 11522); paginacja 227 → 229. Zmian strukturalnych brak.
**Mamy?** — częściowo: wszystkie te numery **są w `sety.json`**, ale żadnego z nich nie ma na stronie `/zapowiedzi-lego-2027/` — sprawdzone grepem, zero trafień.
**Zrobić:** — uzupełnić `/zapowiedzi-lego-2027/` o Botanicals (10 pozycji); to ten sam punkt, który wisi od 07.11 razem z Seasonal (3), 42254, 11227 i 71888.
**Kto:** — Code (dane, strona)

## 2026-11-21 05:20 · SCOUT · Do zrobienia

**W opublikowanym tekście `/artykuly/weekend-lego-insiders-i-black-friday-2026-na-lego-pl-terminy-godzilla/` stoi zdanie „oraz zestaw 40918, którego nazwy jeszcze nie znamy" — a nazwę i dane tego zestawu mamy u siebie od 17 listopada.**
**Mamy?** — tak: `40918` jest w `sety.json` jako **Zimowa kula śnieżna**, 231 elementów, 10+, z polem `bez_rrp` i oknem 21–29.11.2026 z karty Bricksetu; ma hub `/zestaw/40918/`.
**Zrobić:** — w tym pliku (`src/pages/artykuly/weekend-lego-insiders-i-black-friday-2026-na-lego-pl-terminy-godzilla.md`, sekcja „Nieoficjalnie: jakie gratisy i podwójne punkty") zamienić „oraz zestaw 40918, którego nazwy jeszcze nie znamy" na „oraz 40918 Zimowa kula śnieżna (231 elementów, 10+)" z linkiem do `/zestaw/40918/`; tekst ma `wazne_do: 2026-11-30`, więc poprawka ma sens tylko w tym tygodniu.
**Kto:** — Code (dane, strona)

## 2026-11-20 14:58 · SKRZYNKA · GitHub: 0055 + karty 21241 i 41379 (poprawione)
Źródło: repo tylkoklocki-teksty, commit c997a048.
- 0055 → https://tylkoklocki.pl/artykuly/historia-kalendarzy-adwentowych-lego-od-jednego-pudelka-w-1998-roku/ (6 zdjęć)
- 21241 Pszczeli ul i 41379 Restauracja w Heartlake — Piotr poprawił ceny na 99,99 zł i 259,99 zł, zgodne z katalogiem. Karty są na hubach, a stare wersje usunięte z `do-poprawki/` (commit bde3622 w repo tekstów).

## 2026-11-20 08:25 · RADAR · Do zrobienia

**BrickLink · 19.11** — **Serwis wyłączony po raz drugi w dwa tygodnie.** Wrócił 12.11 po sześciu dniach, 19.11 zniknął ponownie. Strona serwisowa sprawdzona dziś: „BrickLink will remain unavailable while we investigate **unusual activity**… particularly coming so soon after our recent outage", z zapowiedzią informacji „by 10:00 AM PST / 7:00 PM CET on Friday, November 20".
**Mamy?** — notkę z sekcji `#bldp` zdjąłem 13.11, gdy serwis wrócił; od wczoraj kalendarz znowu odsyłał czytelnika na martwy adres.
**Zrobić:** — zrobione: notka wróciła, tym razem z informacją, że to **druga** przerwa i że serwis obiecuje aktualizację dziś wieczorem. Kryterium bez zmian: brak terminu powrotu plus incydent bezpieczeństwa. Przy kolejnym powrocie zdjąć — ale jeśli to się powtórzy trzeci raz, lepiej **przepisać zdanie w `#bldp` na trwałe** („kanał bywa niedostępny") niż dopisywać i zdejmować notkę co tydzień.
**Kto:** — Code (dane, strona)

**lego.com/pl-pl · 20.11** — Zadanie z 18.11 wykonane, wynik **negatywny**: karta promocji nie wymienia dziś **żadnej** akcji zaczynającej się 21.11; w odczycie został tylko regulamin 40898, który kończy się **dzisiaj**.
**Mamy?** — tak i zgodnie ze źródłem: kalendarz mówi, że konkretów promocji weekendowych LEGO jeszcze nie podało.
**Zrobić:** — sprawdzić **jutro rano**, pierwszego dnia weekendu. Uwaga metodologiczna: dzisiejszy odczyt zwrócił **jeden** regulamin zamiast dwóch (40906 nie wyszło, choć wczoraj było), więc zgodnie z lekcją z 15.11 to **brak potwierdzenia, nie dowód nieobecności**.
**Kto:** — Code (dane, strona)

## 2026-11-19 14:58 · SKRZYNKA · GitHub: 0052–0054 (aktualizacje ze zdjęciami) + 124 karty; 41379 i 21241 wstrzymane
Źródło: repo tylkoklocki-teksty, commit 48a53e30.
- Artykuły 0052, 0053 i 0054 dostały poprawioną wersję i 4 zdjęcia Piotra.
- 124 karty P07 na hubach /zestaw/<nr>/.
Wstrzymane, obie w `do-poprawki/` (commit e5f583b w repo tekstów), Piotr dostał mail:
- 41379 Restauracja w Heartlake — drugi raz z ceną 269,99 zł (katalog i promoklocki.pl: 259,99 zł).
- 21241 Pszczeli ul — Piotr 89,99 zł, katalog i promoklocki.pl 99,99 zł, zklockow.pl 89,99 zł. Rozbieżność do rozstrzygnięcia przez Marka.
Uwagi bez blokady:
- Liczba elementów: 10996 (29 vs 23), 41803 (115 vs 105), 41807 (388 vs 379), 75397 (3943 vs 3942), 80047 (605 vs 612).
- 31 kart krótkich (1 akapit).

## 2026-11-19 08:58 · SKRZYNKA · GitHub: 0054
Źródło: repo tylkoklocki-teksty, commit 059404c9.
- 0054 → https://tylkoklocki.pl/artykuly/lego-speed-champions-f1-2027-jedenascie-bolidow-z-dwoma-kierowcami/

## 2026-11-19 08:30 · RADAR · Do zrobienia

**faniklockow.pl · 18.11** — Podali Media Expert **550 zł** za 72306 PlayStation jako „historycznie najniższą cenę". **Potwierdzone u źródła:** karta ME pokazuje **549,99 zł**, „Taniej o 17,91 zł", „Cena bezpośrednio przed obniżką 567,90 zł" — czyli poniżej naszego rekordu 567,90 z 14.11.
**Mamy?** — nie, i luka jest większa od jednej ceny: w `oferty_feed.json` nie mamy dla 72306 **żadnej** oferty Media Expertu (tylko allegro 619,10, ceneo 619,99, lego 689,99), a w całej historii cen tego zestawu są **dwa** wpisy ME. Karta ME podaje powód: „**Przedsprzedaż. Planowana data premiery 01.12.2026r.**".
**Zrobić:** — sprawdzić w źródle ME Łowcy, czy pomijamy oferty **przedsprzedażowe** (availability ≠ dostępny), i jeśli tak — wpuścić je z własną etykietą. W listopadzie i grudniu to właśnie przedsprzedaż bywa najtańsza, a dziś jest dla nas niewidoczna.
**Kto:** — Code (dane, strona)

**faniklockow.pl · 18.11** — Ogłosili start Black Weeka na Allegro i dali zestawienie przykładów (10316 za 1689 zł, −21%).
**Mamy?** — częściowo: adres `allegro.pl/kampania/black-weeks` prowadzi do strefy okazji **„Black Weeks 2026 na Allegro"** (sprawdzone 19.11), ale **dat tam nie ma** — strona renderuje się JS-em i w metadanych nie ma żadnego terminu.
**Zrobić:** — zrobione tyle, na ile pozwala źródło: sekcja Allegro w kalendarzu zostaje „przewidywana", ale mówi teraz, że kampania ma własną stronę i że serwisy pisały 18.11 o starcie. Daty wpiszemy, gdy Allegro je poda.
**Kto:** — Code (dane, strona)

**dane · 19.11** — Dwie pozostałe „Okazje Cenowe" z Allegro (10316 za 1689, 76300 za 1034,55) są **niższe od naszych odczytów z 18.11** (1948,40 i 1199,97), a 76300 nie ma u nas żadnego rekordu w `ceny_baza`.
**Mamy?** — nie sprawdzone u źródła i tak to zapisuję: Allegro czytamy z feedu, nie z kart ofert, a ich ceny mogą pochodzić z innej oferty tego samego zestawu albo z rabatu naliczanego w koszyku (Smart, kupon kampanijny), czego feed nie widzi.
**Zrobić:** — w trakcie Black Weeka warto raz sprawdzić na żywej ofercie, czy różnica bierze się z kuponu kampanijnego: jeśli tak, nasze tabele będą przez cały tydzień pokazywać ceny **wyższe** niż to, co widzi kupujący na Allegro, i trzeba to opisać w tekście o Black Weeks.
**Kto:** — Marek (decyzja)
↻ 2026-11-23 (Kontroler): nadal aktualne — **decyzja 2 w raporcie 23.11**: jedna oferta (10316, link z huba) w koszyku Allegro; jeśli cena spada do ~1 689 zł, Code dopisze przy Allegro w tabelach zastrzeżenie „cena bez kuponu Black Weeks" na 24–30.11.

## 2026-11-19 05:15 · SCOUT · Do zrobienia

**Sklep Smyths Toys wystawił przed zapowiedzią LEGO całą falę Speed Champions 2027: jedenaście bolidów Formuły 1 na 1 marca (77267–77277) i Lamborghini Fenomeno na 1 stycznia (77280), wszystkie po 29,99 euro — i każdy bolid ma teraz DWIE minifigurki kierowców zamiast jednej.**
**Mamy?** — częściowo: wszystkie dwanaście numerów stoi od dziś w `src/data/przecieki.json` i na `/przecieki/` z pewnością „średnią" (jedno źródło branżowe plus listing sklepu), z liczbami elementów, nazwiskami kierowców i oznaczeniami wiekowymi. W dziale Artykuły nie ma o tym nic.
**Zrobić:** — napisać tekst „nieoficjalnie" o fali Speed Champions 2027 na podstawie tych dwunastu wpisów. Teza odróżniająca: para kierowców w każdym pudełku to zmiana formuły serii (dotąd jeden bolid = jedna figurka), a cena 29,99 euro jest **jednakowa dla całej jedenastki**, więc jedyne, co różnicuje bolidy, to liczba elementów (198 przy McLarenie, 231 przy Williamsie). Wart wzmianki wyjątek: 77280 Lamborghini Fenomeno ma 280 elementów w tej samej cenie i wchodzi dwa miesiące wcześniej.
**Kto:** — Piotr (tekst)
→ zamknięte 20.11.2026: Piotr napisał ten tekst tego samego dnia — https://tylkoklocki.pl/artykuly/lego-speed-champions-f1-2027-jedenascie-bolidow-z-dwoma-kierowcami/ (kategoria Premiery, wszystkie jedenaście numerów w metadanych). Jedenaście bolidów jest od dziś także w `sety.json`, a przecieki o nich rozstrzygnięte jako potwierdzone.

## 2026-11-18 14:58 · SKRZYNKA · GitHub: 0052, 0053, Recenzje_023
Źródło: repo tylkoklocki-teksty, commit b62dfd79.
- 0052 → https://tylkoklocki.pl/artykuly/nieoficjalnie-30-seria-minifigurek-lego-71054-w-styczniu-2027-rycerz/ (tytuł SEO 62 znaki, limit 60 — uwaga, nie blokuje)
- 0053 → https://tylkoklocki.pl/artykuly/nieoficjalnie-lego-city-na-styczen-2027-modulowy-posterunek-policji/
- Recenzje_023 (76463) → https://tylkoklocki.pl/artykuly/lego-76463-zamek-hogwart-skrzydlo-szpitalne-recenzja/ (bez zdjęć Piotra)

## 2026-11-18 08:58 · SKRZYNKA · GitHub: 124 karty P07 (41379 do poprawki)
Źródło: repo tylkoklocki-teksty, commit f5288c35 — 124 karty na hubach /zestaw/<nr>/.
- Pierwszy przebieg zatrzymały dwie ceny katalogowe:
  - 31058 Potężne dinozaury: Piotr 64,99 zł, katalog 69,99 zł (RK). Rację miał Piotr (promoklocki.pl i zklockow.pl: 64,99 zł) — poprawiony `katalog.json`.
  - 41379 Restauracja w Heartlake: Piotr 269,99 zł, katalog 259,99 zł. Rację ma katalog (promoklocki.pl: 259,99 zł) — karta w `do-poprawki/` z uwagami (commit 3ddfb30 w repo tekstów), Piotr dostał mail.
- Uwagi bez blokady:
  - Seria „Avatar” (75575–75578) i „Unikitty!” (41452) nie ma w katalogu, więc linki do tych serii mogą prowadzić donikąd.
  - Liczba elementów różni się o 1–3 przy 10786, 41452, 60215, 60229, 70419, 70420, 75575, 75576, 75578 i 76054.
  - Krótkie karty (1 akapit): 30545, 30630, 30639, 30640, 40616–40618, 5008897, 562401, 562406 i 912510.

## 2026-11-18 08:25 · RADAR · Do zrobienia

**lego.com/pl-pl/insiders · 18.11** — **Weekend Insiders ma potwierdzone daty: 21.11 i 22.11.** Strona programu podaje dosłownie „Już wkrótce — ważny weekend dla uczestników programu: 21.11 i 22.11" oraz „weekend pełny wyjątkowych promocji i ofert, takich jak **podwójne punkty lojalnościowe**". Trop przyszedł z tekstu faniklockow, ale data jest sprawdzona u źródła.
**Mamy?** — mieliśmy **prognozę od sierpnia**: „ok. 21–26.11, przewidywane". To najważniejsza pozycja listopada i do dziś stała jako wzorzec z poprzednich lat.
**Zrobić:** — zrobione: pozycja w „Co trwa teraz" rozbita (Weekend Insiders 21–22.11 **potwierdzone**, Black Friday 27.11 i Cyber Monday 30.11 osobno jako prognoza), wiersz tabeli listopadowej ma 21–22.11 z adnotacją o źródle, plus dwa akapity z rachunkiem: **oba upominki (40906, 40898) kończą się 20.11, czyli dzień przed weekendem**, więc gratisu z podwójnymi punktami nie da się połączyć, a same punkty to nie rabat przy Black Friday pięć dni później.
**Kto:** — Code (dane, strona)

**lego.com/pl-pl · 18.11** — Karta promocji z regulaminami wymienia dziś **tylko 40898 i 40906, oba do 20.11** — żadnej akcji na 21.11 jeszcze tam nie ma, choć faniklockow piszą o „potwierdzonych promocjach na Weekend Insiders".
**Mamy?** — tak i zgodnie ze źródłem: w kalendarzu stoi, że konkretów promocji LEGO jeszcze nie podaje.
**Zrobić:** — sprawdzić sekcję regulaminów **20 i 21.11** i dopisać akcje weekendowe, gdy się tam pojawią. Reguła po wpadce z 30762 jest symetryczna: źródłem jest regulamin LEGO, więc nie wpisujemy czegoś, czego tam nie ma, tak samo jak nie odrzucamy czegoś, co tam jest.
**Kto:** — Code (dane, strona)

## 2026-11-18 05:20 · SCOUT · Do zrobienia

**StoneWars opublikował 17.11 cztery materiały z pierwszymi zdjęciami styczniowej fali 2027: City (20 numerów), Disney (6), Ninjago (7) i dwa dodatkowe Star Wars — razem 35 numerów, z czego 26 nie było u nas w ogóle.**
**Mamy?** — częściowo: wszystkie 35 stoi od dziś w `src/data/przecieki.json` i na `/przecieki/` (26 nowych wpisów, 9 październikowych podniesionych z „niskiej" na „średnią"). Strona `/zapowiedzi-lego-2027/` nie wymienia **ani jednego** numeru 60xxx ani 433xx — `grep "60[0-9][0-9][0-9]\|433[0-9][0-9]" src/pages/zapowiedzi-lego-2027.md` daje dziś 0 trafień.
**Zrobić:** — dopisać do `src/pages/zapowiedzi-lego-2027.md` sekcje City i Disney na styczeń 2027 na podstawie `przecieki.json` (numery, elementy, cena niemiecka, wiek), z plakietką pewności przy każdym numerze; dane są gotowe, nie trzeba nic pobierać.
**Kto:** — Code (dane, strona)
↻ 2026-11-26 (Scout): nadal aktualne, a doszła pilniejsza rzecz na tej samej stronie — **sekcja „Harry Potter: restart serii? (76483, 76479)” jest już nieprawdziwa**. LEGO przedstawiło 25.11 cztery zestawy serialowej fali (76481 Privet Drive, 76482 Pokój wspólny Gryffindoru, 76487 Ekspres Hogwart i peron 9¾, 40992 BrickHeadz) — wszystkie cztery stoją od dziś w `sety.json`, a strona wciąż pisze „Grupa LEGO niczego nie potwierdziła” i „to interpretacja, nie fakt”. Do poprawienia: znak zapytania w nagłówku, oba zdania o braku potwierdzenia, tabela w sekcji podsumowującej (wiersze 53–54 mają tylko dwa przecieki) i orientacyjne ceny 76483/76479, które skorygowałem dziś w `przecieki.json` z ~480 i ~65 zł na ~420 i ~60 zł (źródło podaje teraz 99,99 i 14,99 euro, nie USD). Same 76483 i 76479 zostają przeciekiem — nie było ich w prezentacji.

## 2026-11-17 14:58 · SKRZYNKA · GitHub: 50 kart P07
Źródło: repo tylkoklocki-teksty, commit ff2c74d7. 50 kart na hubach /zestaw/<nr>/ (m.in. 10270, 10273, 21051, 21052, 75978, 76191, 76193).
Uwagi bez blokady — liczba elementów u Piotra i w katalogu różni się dla:
- 41916 (109 vs 99)
- 71741 (5686 vs 5685)
- serii VIDIYO 43102–43107, 43113 i 43114 — wszędzie u Piotra o 13–14 więcej (najpewniej liczone z kafelkami BeatBit)
Do sprawdzenia w Bricksecie.

## 2026-11-17 08:58 · SKRZYNKA · GitHub: 0050, 0051
Źródło: repo tylkoklocki-teksty, commit 47cf6610.
- 0050 → https://tylkoklocki.pl/artykuly/weekend-lego-insiders-21-22-listopada-upominki-40914-szafa-grajaca/
- 0051 → https://tylkoklocki.pl/artykuly/smart-play-czy-super-mario-jak-zmienilo-sie-interaktywne-lego/ (2 zdjęcia)

## 2026-11-17 08:50 · ŁOWCA · Do zrobienia

**43018 Lionel Messi — cieszynka spadł w Media Expert do 349 zł (−55% od RRP 779,99) — pierwszy raz regularny sklep schodzi poniżej 50% RRP na tym zestawie; strona ukrywa ofertę do potwierdzenia.**
**Mamy?** — częściowo: cena w danych i w hubie /zestaw/43018/, ale blok ofert ukrywa ją jako niepotwierdzoną (<50% RRP)
**Zrobić:** — potwierdzić ofertę w panelu (deale_potwierdzone), link w dzisiejszym mailu „podejrzany rynek"; po potwierdzeniu to mocny kandydat na post dealowy (kryterium a)
**Kto:** — Marek (decyzja, panel)
↻ 2026-11-23 (Kontroler): nadal aktualne, szósty dzień — **decyzja 3 w raporcie 23.11**; hub dalej ukrywa 349 zł, ME dokłada 43018 jako gratis od 2 000 zł (Radar 15.11), Black Friday za cztery dni.

↻ 2026-11-25: nadal aktualne — ME zszedł do 299 zł (−62%, rabat urósł z 431 do 481 zł), karta zweryfikowana; dziewiąty dzień bez decyzji w panelu.

## 2026-11-17 08:30 · RADAR · Do zrobienia

**`smyk-odswiez.mjs` · 17.11** — Zadanie z dzisiejszego wpisu DANE WT (adresowane do „Code") **zrobione**: skrypt rozpoznaje stronę blokady bota (`Gcore`, „Browser Validation Page", „Please enable cookies") i zwraca ją jako **błąd**, nie jako „niedostępny" — cena z poprzedniego przebiegu zostaje, oferta nie znika.
**Mamy?** — zmierzone na próbce 12 kart: przed poprawką takie karty dałyby **8 „niedostępnych"** (osiem zdjętych ofert), po poprawce idą jako 8 błędów i **0 zdjętych**.
**Zrobić:** — druga sugestia z tamtego wpisu, mniejsza równoległość, **nie pomaga** i to też jest zmierzone: dodałem flagę `--rownolegle N`, przy 2 było 7 blokad na 12, przy 1 pięć. Domyślne 6 zostaje. Zostaje decyzja, jak czytać Smyka na czas blokady: **Firecrawl z proxy „basic" przechodzi** (12.11 karta 42240 odczytała się z ceną 675 zł), ale 5 kredytów za kartę × 704 to za dużo na cały katalog — albo punktowe sprawdzenia wybranych zestawów, albo zrzut z przeglądarki jak przy Empiku i x-komie.
**Kto:** — Marek (decyzja)
↻ 2026-11-20 (pierwszy piątkowy przebieg „Smyk: drugi odczyt"): gorzej, nie lepiej — 604/704 blokad, tylko **83 kart z ceną** (bramka tego zadania to 400 — 12.11 było 569). `--stare` dobił resztę: 621/621 ponownych prób, 0 sukcesów, 100% blokady. Bramka nie przeszła, przebieg NIE commitowany (dane zostają takie, jak po ostatnim dobrym odczycie) — decyzja nadal czeka na Marka, teraz z mocniejszym dowodem, że to nie jest zjawisko przejściowe.
↻ 2026-11-23 (Kontroler): nadal aktualne — **decyzja 1 w raporcie 23.11**: proponuję odczyt przez Firecrawl raz w tygodniu (ok. 570 kart; koszt 570–2 850 kredytów zależnie od stawki za kartę — Radar liczył 5, zmierzyć na 10 kartach; pula 5 000 odnawia się dziś), do końca blokady albo do 31.12; Code dopisze tryb `--firecrawl` do `smyk-odswiez.mjs`. Ceny Smyka w hubach stoją na 12–13.11, Smyk ma 18 polskich kliknięć w 30 dni.
↻ 2026-11-24 (Dane wt, zwykły wtorkowy przebieg): nadal aktualne, bez poprawy — 618/704 błędów (blokada), 67 kart z ceną, `--stare` dobił 637/637 ponownych prób i 0 sukcesów. Tryb `--firecrawl` z decyzji Kontrolera jeszcze nie wdrożony. Dane bezpieczne (błąd nie usuwa starej ceny), więc przebieg wtorkowy normalnie commitowany — to zadanie nie ma własnej bramki liczbowej jak piątkowe.
↻ 2026-11-27 (drugi piątkowy przebieg „Smyk: drugi odczyt"): trzeci tydzień bez zmiany — 610/704 błędów, 71 kart z ceną (bramka 400), `--stare` 633/633 ponownych prób, 0 sukcesów. Bramka nie przeszła, przebieg NIE commitowany. Tryb `--firecrawl` z decyzji Kontrolera 23.11 wciąż niewdrożony, więc źródło na piątki nadal nie istnieje — to już czwarty pomiar (12.11, 20.11, 24.11, 27.11) potwierdzający stałą blokadę, nie przejściową usterkę.

**dane · 17.11** — Wpis DANE WT mówi, że ceny Smyka „przywrócone ręcznie do stanu z 10.11.2026". **W danych tego nie ma** i warto to wiedzieć, zanim ktoś oprze na tym decyzję.
**Mamy?** — sprawdzone, zanim czegokolwiek „przywróciłem": w `oferty_feed.json` nie ma ani jednej oferty Smyka z datą 10.11 — jest **368 z 12.11 i 203 z 13.11**, a 579 z 583 wartości zgadza się z moim odświeżeniem z 12.11 (42240 nadal 675 zł). Dane są więc świeższe, niż zapowiada ten wpis.
**Zrobić:** — nic w danych; gdybym poszedł za notatką, nadpisałbym świeższe dane starszymi. Przy następnym wycofywaniu przebiegu warto w opisie podać **datę odczytu, która naprawdę została w plikach**.
**Kto:** — Code (dane, strona)

## 2026-11-17 05:16 · DANE WT · Do zrobienia

**`smyk-odswiez.mjs` dostał dziś od smyk.com stronę blokady bota (Gcore „Browser Validation Page" / „Please enable cookies i JavaScript") zamiast karty produktu — HTTP 200, więc skrypt nie liczy tego jako błąd sieci, tylko jako brak `schema.org/InStock` i usuwa ofertę. Skok z ~125 niedostępnych (10.11) do 558 z 704 w tym przebiegu nie jest realną zmianą stanu magazynowego: ręcznie sprawdzone 2 karty (10280, 10300) po przebiegu — obie dały tę samą stronę blokady, nie prawdziwą kartę produktu.**
**Mamy?** — częściowo: mechanizm `InStock`/`OutOfStock` działa (sprawdzone wcześniej na 75192, RUNBOOK), ale nie rozpoznaje strony blokady jako błędu.
**Zrobić:** — w `scripts/smyk-odswiez.mjs`, funkcja `zeStrony` (linia ok. 50–58): dodać wykrywanie strony blokady (np. `/Gcore|Browser Validation Page|Please enable cookies/.test(html)`) i w takim przypadku zwracać `błąd` (jak przy nieudanym fetchu), nie `niedostępny` — żeby wczorajsza cena zostawała, nie znikała. Do rozważenia też mniejsza równoległość (`ROWNOLEGLE`), jeśli blokada włącza się po liczbie żądań, nie od razu.
**Kto:** — Code

**Przebieg 17.11 NIE wczytał wyniku `smyk-odswiez.mjs` do danych** — ceny i dostępność Smyka w `sety.json`/`oferty_feed.json` przywrócone ręcznie do stanu z 10.11.2026 (ostatni znany dobry odczyt), żeby blokada bota nie zdjęła ~430 prawdziwych ofert ze strony. Commit `cff338a` zawiera tę korektę razem z resztą przebiegu (LEGO.pl, Rebrickable, MediaMarkt, Lidl — te źródła działały normalnie).

## 2026-11-17 05:15 · SCOUT · Do zrobienia

**LEGO pokazało 16.11 oba gratisy na Insiders Weekend i Black Friday: 40914 Szafa grająca w stylu retro (287 elementów, 18+) i 40918 Zimowa kula śnieżna (231 elementów, 10+), oba do zdobycia od 21 do 29 listopada 2026.**
**Mamy?** — częściowo: oba zestawy są od dziś w `sety.json` z polem `bez_rrp`, mają huby `/zestaw/40914/` i `/zestaw/40918/`, a przecieki o nich (z 31.10, pewność „niska") rozstrzygnięte jako potwierdzone. W `kalendarz-promocji-lego.md` wiersz „21–30.11" stoi jako „przewidywane" i nie wymienia żadnego z tych numerów.
**Zrobić:** — dopisać 40914 i 40918 do kalendarza promocji (wiersz „21–30.11" w tabeli okien i sekcja listopadowa): okno 21–29.11.2026 z Bricksetu, progi niemieckie 250 euro dla 40914 (wymagane Insiders) i 170 euro dla 40918, z zastrzeżeniem, że polskich progów LEGO nie podało.
**Kto:** — Code (dane, strona)
↻ 21.11.2026: nadal aktualne — `grep -c "40914\|40918" src/pages/kalendarz-promocji-lego.md` daje dziś 0, a akcja ruszyła w nocy z 20 na 21 listopada. Doszedł trzeci upominek do dopisania: **5011174** (zestaw do majsterkowania z filcowymi zawieszkami, nie zestaw klockowy), według StoneWars w oknie 23–26.11, próg nieoficjalny 65 euro.
→ zamknięte 23.11.2026: kalendarz ma oba upominki w trzech miejscach (tabela okien, sekcja listopadowa i wiersz „Co trwa teraz"), z **polskimi** progami z regulaminów LEGO.pl: 40914 od 1070 zł i 40918 od 705 zł, oba dla członków Insiders, z wyceną LEGO 124,99 zł i 104,99 zł. Te polskie liczby przeniosłem dziś do opisów obu zestawów w `sety.json` — stało tam „polskiego progu LEGO nie podało". 5011174 to gadżet (nie zestaw klockowy) i do rejestru nie wchodzi; w kalendarzu zostaje po stronie Code, jeśli akcja 23–26.11 się potwierdzi.

## 2026-11-16 14:58 · SKRZYNKA · GitHub: Recenzje_022 + 50 kart P07
Źródło: repo tylkoklocki-teksty, commit 9b75a458.
- Recenzje_022 (77248) → https://tylkoklocki.pl/artykuly/lego-77248-bolid-f1-bwt-alpine-team-a524-recenzja/ (bez zdjęć Piotra)
- 50 kart P07 na hubach /zestaw/<nr>/ (m.in. 10278, 10283, 76178, 76240, 76911).
Uwagi bez blokady:
- Liczba elementów u Piotra i w katalogu różni się dla 41931 (105 vs 91), 41932 (120 vs 110), 45345 (449 vs 453), 76178 (3789 vs 3772) i 76183 (581 vs 590) — do sprawdzenia w Bricksecie.
- Karty 30495, 30592 i 40564 weszły jako krótkie.
- 45345 i 45681 to LEGO Education SPIKE (seria z katalogu: „Archiwum”).

## 2026-11-16 10:05 · KONTROLER · Do zrobienia

Raport: `materialy/kontroler-2026-11-16.md`. Mail „Zadania bez właściciela — 16.11.2026" (37 pozycji) wysłany, id `01a1e384`. Kamień 1: Performers zatwierdził trzy wrześniowe konwersje (13,06 zł) — dwie sieci z trzech.

**Dane wt (wt 05:30, `trig_011BMbbJSYKiauzGNXUk576y`) mają w harmonogramie z konta `10.11 05:35 SUCCEEDED`, ale w repo nie ma commita „LEGO.pl + Ceneo + Smyk … 10.11" (03.11 był) ani wpisu w dzienniku — drugi runner w dwa tygodnie z pustym SUCCEEDED (Wycofania 09.11).**
**Mamy?** — nie: ceny LEGO.pl i Smyka z wtorku nie weszły (Smyk uratował ręczny `smyk-odswiez.mjs` Radaru 12.11), katalog LEGO.pl ma ostatnią aktualizację z 03.11.
**Zrobić:** — otworzyć sesję Dane wt na koncie i sprawdzić, co zrobiła 10.11; przy drugim takim przypadku szukać wspólnej przyczyny (klasyfikator „Code from External" jak Zdjęcia → R2 04.11?) — jeśli odmowa, prompt wymaga tej samej poprawki co Zdjęcia.
**Kto:** — Marek (panel)
→ zamknięte 23.11.2026 (Kontroler): przebieg 17.11 zostawił commit `cff338a` i wpis DANE WT — runner działa; co stało się 10.11, zostaje niewyjaśnione, jak 09.11 u Wycofań. Dwa pojedyncze puste przebiegi bez powtórki nie są pozycją.

**Radar zostawia pozycje „Do zrobienia" z `Zrobić: zrobione w tym przebiegu` bez linii „→ zamknięte" — 17 takich pozycji w dzienniku (04.11–16.11), parser Kontrolera liczył je jako otwarte, archiwum trzyma je w `DZIENNIK.md` bez końca.**
**Mamy?** — częściowo: Kontroler od 16.11 pomija pozycje z `Zrobić` zaczynającym się od „zrobione"; archiwum dziennika nie.
**Zrobić:** — w prompcie Radaru (panel zadania) dopisać regułę: gdy coś zrobiono w tym samym przebiegu, pod pozycją ma stanąć linia „→ zamknięte <data>: zrobione w przebiegu" — ta konwencja, którą czytają archiwum i Kontroler.
**Kto:** — Marek (panel)
↻ 23.11 (Kontroler): nadal aktualne — dziś 25 pozycji „zrobione w tym przebiegu" bez linii zamknięcia (tydzień temu 17); parser Kontrolera je pomija, archiwum nie.

Poza listą dla ludzi: `/serie/marvel/` wypadł z indeksu (09.11 zindeksowany, 16.11 „zeskanowana, niezindeksowana", crawl 01.11) — kolejka go zgłosi, sprawdzę 23.11; `/zestaw/10280/` 66 dni bez crawla; reguła referera z 02.11 drugi tydzień bez wyjątku (0 kliknięć spoza PL ze strony głównej przy 12 742 botach); zrzuty Empiku i x-komu weszły przed Kontrolerem (09:24).

## 2026-11-16 09:05 · RADAR · Do zrobienia

**zrzut Empiku · 16.11** — Zrzut wszedł (commit 8d59719, 4575 cen): **880 zmian cen**, 30 ofert zdjętych jako niedostępne, **103 zestawy, w których Empik jest teraz najtańszym sklepem**, 2 nowe rekordy cenowe z Empiku (76786 Morticia's Cottage 348,99 → 332,99 i 40887).
**Mamy?** — tak, dane są świeże. **Ich okazja się nie potwierdziła:** faniklockow podali 76321 za 206 zł w Empiku, a dzisiejszy odczyt daje **227,73 zł** — powyżej ceny katalogowej (209,99) i drożej niż u nich. To piąty raz w trzy tygodnie, gdy ich post dealowy nie broni się przy sprawdzeniu (po 21333 u Smyka, 77076 za 89 zł, 76329 i „debiucie" 11390).
**Zrobić:** — nic; dane po zrzucie są aktualne, a pozycję o drugim odczycie Empiku w tygodniu można zamknąć — różnica nie wynikała z naszego opóźnienia, tylko z ich błędnej ceny.
**Kto:** — Code (dane, strona)

**dane · 16.11** — **40887 SMART Play: Ditto jako Squirtle** ma u nas cenę katalogową **81,99 zł**, a rynek stoi na **299 zł (Empik)** i 349 zł (Allegro) — czyli 3,6 raza wyżej niż „katalog".
**Mamy?** — błąd jest po naszej stronie i został sprawdzony u źródła: karta Empiku to **pojedynczy zestaw 40887, 185 elementów, 299,00 zł** (nie pakiet), a w `rrp_potwierdzone.json` tego numeru nie ma, więc 81,99 pochodzi z niepewnego źródła. Na lego.com nie mamy dla niego adresu, więc właściwej ceny katalogowej **nie znam** i jej nie zgaduję.
**Zrobić:** — ustalić RRP u źródła (karta lego.com albo Brickset) i wpisać do `rrp_potwierdzone.json`; do tego czasu hub tego zestawu pokazuje nonsensowną „cenę powyżej katalogu".
**Kto:** — Code (dane, strona)

**kontrola · 16.11** — `scripts/kontrola-rrp.mjs` ma test rynkowy **tylko w jedną stronę**: „rynek < 50% ceny katalogowej" (dziś 12 setów). Odwrotnego przypadku — rynek **wielokrotnie wyższy** od katalogu, czyli zaniżonego RRP — nie łapie nic.
**Mamy?** — nie: 40887 przeszedł przez wszystkie kontrole i wyszedł dopiero z ręcznego porównania rekordów po zrzucie.
**Zrobić:** — dopisać do `kontrola-rrp.mjs` drugi próg (np. rynek > 200% ceny katalogowej przy co najmniej dwóch sklepach) i policzyć, ile takich wpisów już mamy — zaniżone RRP psuje rabat tak samo jak zawyżone, tylko w drugą stronę.
**Kto:** — Code (dane, strona)

## 2026-11-16 08:20 · RADAR · Do zrobienia

**kalendarz · 16.11** — Okno polybagów 30720 i 30762 (9–15.11, próg 165 zł z właściwej kolekcji) zamknęło się wczoraj; 40906 i 40898 trwają do 20.11.
**Mamy?** — tak: `/artykuly/kalendarz-promocji-lego/`.
**Zrobić:** — zrobione w tym przebiegu: pozycja w „Co trwa teraz" ma plakietkę „zamknięte", akapit przepisany w czasie przeszłym z dopiskiem, że kolejnego tak niskiego progu spodziewamy się dopiero przy Weekendzie Insiders.
**Kto:** — Code (dane, strona)

**faniklockow.pl · 15.11** — **Drugi** serwis dostał od LEGO.pl pulę kodów na gratis **30708** — ten sam zestaw i to samo okno 16–20.11, które fanklockow ogłosili 05.11.
**Mamy?** — nie: to nie jest przywilej jednego serwisu, tylko sposób, w jaki LEGO.pl pracuje z polskimi partnerami contentowymi, a my takiej puli nie dostajemy mimo konta afiliacyjnego.
**Zrobić:** — **ROZSTRZYGNIĘTE 16.11 przez Marka: nie staramy się o kody, jesteśmy za mali.** Pozycja z 06.11 zamknięta, reguła dopisana do „Ustaleń trwałych"; takie akcje konkurencji odnotowujemy dalej w bazie jako sygnał, kiedy LEGO.pl szykuje okno gratisowe, ale do kalendarza nie wchodzą.
**Kto:** — Marek (decyzja) — zamknięte

**faniklockow.pl · 15.11** — Podają Empik **206 zł** dla 76321 (tegoroczny EOL, wyprzedany na lego.com).
**Mamy?** — nie i to znowu **nasza stara cena**: Empik stoi u nas na 238,81 z odczytu 13.11, a najtańsza realna oferta to Allegro 243,90, czyli **powyżej** ceny katalogowej. Nie sprawdziłem u źródła — Empik blokuje ruch serwerowy.
**Zrobić:** — to ta sama klasa problemu co Smyk 12.11 (sklep z tygodniowym odczytem robi obniżkę w środku tygodnia), ale Empiku nie odświeżymy skryptem z sesji. Rozstrzygnie dzisiejszy poniedziałkowy zrzut; jeśli potwierdzi 206 zł, warto przy decyzji o drugim odczycie Smyka rozważyć też drugi zrzut Empiku w tygodniu.
**Kto:** — Marek (decyzja)
→ zamknięte 23.11.2026 (Kontroler, za Radarem 16.11 09:05): zrzut Empiku 16.11 dał 227,73 zł — cena konkurencji była błędna, nie nasze opóźnienie; drugi odczyt Empiku w tygodniu nie jest potrzebny.

## 2026-11-15 08:25 · RADAR · Do zrobienia

**lego.com/pl-pl · 15.11** — Pełna lista regulaminów na karcie promocji wymienia **cztery** upominki, nie trzy: do 40898 (1–20.11) i 40906 dochodzą **30720** (9–15.11, Disney od 165 zł) i **30762 Batman z retro gry wideo** (9–15.11, „Wartość zakupionych artykułów z kolekcji DC lub Batman™ musi wynosić co najmniej 165 zł"). Przy okazji **40906 zostało wydłużone z 15 na 20 listopada**.
**Mamy?** — mieliśmy to **błędnie od 9 do 14 listopada**: w kalendarzu stało zdanie, że 30762 „nie potwierdzamy". Nie LEGO go nie potwierdzało — ja go nie znalazłem. Serwisy branżowe miały rację.
**Zrobić:** — zrobione w tym przebiegu: tabela ma cztery wiersze z właściwymi oknami i kanałami, nagłówek „cztery gratisy, 9–20.11", rozbite pozycje w „Co trwa teraz" (40906 do 20.11; dwa polybagi z dopiskiem „dziś ostatni dzień"), akapit o różnicy kanałów i **jawne sprostowanie** z cytatem z regulaminu. **Reguła, której zabrakło:** kafelki promocji i blok upominków na karcie produktu **nie są kompletną listą** — jedyną kompletną jest sekcja regulaminów na dole karty promocji i tę czytamy całą, nie po jednym upominku.
**Kto:** — Code (dane, strona)

**faniklockow.pl · 14.11** — Piszą, że Media Expert dodaje **43018 Lionel Messi** (kat. 779,99 zł) jako gratis do zakupów od **2000 zł** — to powtórka akcji z 7 października, ale próg jest niższy (wtedy 2500 zł).
**Mamy?** — ceny tak i są świeże: ich przykłady zgadzają się z naszym odczytem z 14.11 co do groszy (11383 334 / 333,99; 42224 380 / 379,99; 71859 287 / 286,98; 75409 1068 / 1068). Samego gratisu **nie sprawdziłem** — karta ME renderuje się AJAX-em i serwerowe zapytanie nie zwraca treści promocji.
**Zrobić:** — potwierdzić ten próg inną drogą (strona akcji ME albo koszyk) i wtedy dopisać do kalendarza przy sekcji o sklepach zewnętrznych; do tego czasu **nie** wpisujemy. Warto użyć w tekście realnej wyceny: ME sprzedaje samo 43018 za 550,51 zł, czyli o ponad 200 zł mniej, niż wynosi cena katalogowa, którą podają.
**Kto:** — Code (dane, strona)

## 2026-11-14 14:58 · SKRZYNKA · GitHub: 0048 (aktualizacja), 0049, Recenzje_021
Źródło: repo tylkoklocki-teksty, commit fe623dfa.
- 0048 (poprawka) → https://tylkoklocki.pl/artykuly/lego-star-wars-na-50-lecie-sagi-siedem-zestawow-od-1-stycznia-2027/
- 0049 → https://tylkoklocki.pl/artykuly/upominek-restauracje-swiata-japonia-na-lego-pl-dluzej-do-20-listopada/
- Recenzje_021 (31169) → https://tylkoklocki.pl/artykuly/lego-31169-maszyna-do-pisania-z-kwiatami-recenzja/ (1 zdjęcie)

## 2026-11-13 08:58 · SKRZYNKA · GitHub: 0041, 0042, 0048
Źródło: repo tylkoklocki-teksty, commit dbdefee4 (3 teksty, 9 zdjęć Piotra).
- 0041 → https://tylkoklocki.pl/artykuly/klasyczny-lego-space-1978-1987-czesc-1-rakiety-bazy-i-flagowce/ (4 zdjęcia)
- 0042 → https://tylkoklocki.pl/artykuly/klasyczny-lego-space-1978-1987-czesc-2-od-skutera-do-starfleet/ (5 zdjęć)
- 0048 → https://tylkoklocki.pl/artykuly/lego-star-wars-na-50-lecie-sagi-siedem-zestawow-od-1-stycznia-2027/

## 2026-11-13 09:20 · ŁOWCA · Do zrobienia

**Piątkowy krok Smyka w feedy-lego.py ściął oferty Smyka z 569 do 203 (−64%); straż historii cen uznała to za awarię feedu, Łowca przywrócił wczorajsze oferty z origin (push ba2b640)**
**Mamy?** — częściowo: oferty Smyka w danych są kompletne (572), ale źródłowy zrzut/krok smyk w `scripts/feedy-lego.py` zwrócił tylko 203 pozycje
**Zrobić:** — sprawdzić krok `smyk` w `scripts/feedy-lego.py` (źródło zrzutu i parser): czy 13.11 Smyk faktycznie wyciął 2/3 asortymentu LEGO, czy padł parser; jeśli cięcie jest realne, zdjąć przywrócone oferty następnym przebiegiem
**Kto:** — Code (dane, skrypt)

↻ 2026-11-20: nadal aktualne — piątkowy krok Smyka znowu uciął oferty (572→246, zero z datą 20.11; „Dane wt" potwierdziły blokadę bota). Oferty przywrócone z origin/main, Smyk z powrotem na 572.

## 2026-11-13 08:20 · RADAR · Do zrobienia

**BrickLink · 12.11** — Serwis wrócił po sześciu dniach: `bricklink.com` nie przekierowuje już na `maintenance.bricklink.com`, tylko serwuje normalną stronę główną z katalogiem (21 920 zestawów, 97 246 części) i opiniami sprzedających sprzed minut.
**Mamy?** — mieliśmy notkę o awarii w sekcji `#bldp`, dopisaną wczoraj.
**Zrobić:** — zrobione: notka **usunięta**, zgodnie z wczorajszym zapisem („przy powrocie serwisu notkę usunąć"). Awaria trwała 6–12 listopada.
**Kto:** — Code (dane, strona)

**BrickLink · 13.11** — Na stronie głównej wisi baner „The return of the Designer Program: New opportunity to support fan designers from LEGO® Ideas".
**Mamy?** — **nie sprawdzone**: link do ogłoszenia (`newsview.page?msgid=1239834`) zwraca „Resource Not Found", najpewniej wymaga zalogowania. Nie zgaduję, co tam jest.
**Zrobić:** — przy następnej okazji sprawdzić, czy to zapowiedź kolejnej serii BLDP; do kalendarza wchodzi **dopiero z datami**, tak jak seria 9 (sekcja `#bldp`).
**Kto:** — Code (dane, strona)

## 2026-11-13 05:30 · SCOUT · Do zrobienia

**LEGO pokazało 12 listopada całą styczniową falę Star Wars na pięćdziesięciolecie serii: siedem zestawów z kartami produktów, od 39,99 do 299,99 euro. Największy to 75467 Plakat filmowy „Nowa nadzieja" — 3209 elementów za 299,99 euro.**
**Mamy?** — tak: wszystkie siedem (75466, 75467, 75470, 75478, 75480, 75482, 75495) jest od dziś w `sety.json`, z hubami i danymi z Bricksetu, a siedem przecieków o nich rozstrzygniętych. W dziale Artykuły o tej fali nie ma nic.
**Zrobić:** — napisać tekst o styczniowej fali Star Wars (kategoria Premiery) na podstawie siedmiu hubów. Teza odróżniająca od zapowiedzi konkurencji: rocznicowa fala nie jest falą rabatów — zestawy wchodzą 1 stycznia po cenie katalogowej, polskich cen LEGO jeszcze nie ogłosiło, więc jedyne, co dziś da się porównać, to stawka za element (0,09 euro przy plakacie, 0,12 przy Y-Wingu). Warto osobno wspomnieć 75495: to hełm z concept artu McQuarrie’ego, nie wersja filmowa.
**Kto:** — Piotr (tekst)
→ zamknięte 14.11.2026: Piotr napisał ten tekst tego samego dnia — https://tylkoklocki.pl/artykuly/lego-star-wars-na-50-lecie-sagi-siedem-zestawow-od-1-stycznia-2027/ (kategoria Premiery, wszystkie siedem numerów w metadanych).

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
↻ 16.11 (Kontroler): decyzja 2 raportu 16.11 — proponowany piątkowy odczyt Smyka do końca grudnia (0 kredytów), Code przygotuje po zgodzie.
→ zamknięte 16.11.2026 (Kontroler, zgoda Marka 16.11 „zgoda na decyzję 2"): nowy trigger `trig_01SLg8WTqDmV7GW29RJKpgpG` — piątek 05:30 PL na stałej sesji Dane wt, tylko krok Smyka (0 kredytów), bramka ≥400 kart z ceną, do 31.12.2026; pierwszy przebieg 20.11. Opis w `materialy/zadania-cykliczne.md` („Historia zmian") i `scripts/README.md`.

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
→ Wycofania 2026-11-16: dopisane — wszystkie dziesięć weszło na listę jako „przewidywane,
grudzień 2026". W dziale „Ostatnie zestawy" żadnego nie ma (sprawdzone 16.11), więc bez
potwierdzenia LEGO; dwa źródła: StoneWars (EOL 31.12.2026 poza Azją, w Azji 31.12.2027)
i Brickset/brickonomics (terminy 07/2027 i 12/2027 — wg StoneWars to daty azjatyckie).
Rozbieżność dat odnotowana w polu `zrodlo`; gdy LEGO oznaczy zestawy w dziale albo
znikną z listingu, statusy pójdą w górę zwykłym trybem.

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
↻ 16.11 (Kontroler): **Performers zatwierdził trzy konwersje z września** (03.09 481,10 zł → 9,62 zł; 07.09 444 zł → 1,78 zł; 14.09 82,99 zł → 1,66 zł; razem 13,06 zł) — 09.11 konwersja z 14.09 była jeszcze „pending", więc zatwierdzenie przyszło w tym tygodniu, po ok. 60 dniach. Dziesięć z października i listopada nadal „pending" (267,47 zł). Wniosek: termin zatwierdzania to ok. dwa miesiące, pytanie o niego jest zbędne; przypomnienie 23.11 zostaje jako kontrola, mail tylko gdyby konwersja z 03.10 nie przeszła do ~10.12.
→ zamknięte 16.11.2026 (Kontroler, decyzja Marka 16.11 „3 całkiem olej"): żadnego maila do Performers i żadnego przypomnienia — trigger 23.11 (`trig_01WLwRWVniuzFHiD1hXdxmiF`) skasowany. Zatwierdzenia (3 wrześniowe → approved, ok. 60 dni) widzi co tydzień `prowizje-raport.mjs --dni 90` w raporcie Kontrolera; nic więcej nie pilnujemy.

**Decyzje D5–D9 z audytu 06.11 (mail z okazjami w czwartek, prezentowniki według zainteresowań, Piotr tylko przez GitHub, maile runnerów pon + pt, strony autorów) wchodzą w życie z odpowiedzią domyślną „tak" w środę 11.11.**
**Mamy?** — tak: `materialy/audyt-2026-11-06.md`, sekcja „Decyzje".
**Zrobić:** — do środy 11.11 powiedzieć, jeśli któraś ma być inna niż domyślna; cisza = Code wdraża domyślne po Black Friday.
**Kto:** — Marek (decyzja)
→ zamknięte 16.11.2026 (Kontroler): środa 11.11 minęła bez innej odpowiedzi — D5–D9 obowiązują w wersji domyślnej z `materialy/audyt-2026-11-06.md`; wdrożenie po Black Friday leży po stronie Code (osobne pozycje założy sesja, która je robi).

**Wycofania (pon 06:10, `trig_018T3NrpmpZTRLX7s942gD6q`) mają w harmonogramie z konta `09.11 06:10 SUCCEEDED`, ale w repo nie ma commita „Wycofania: aktualizacja 2026-11-09" (19.10, 26.10 i 02.11 był) ani linii „→ Wycofania 2026-11-09" w dzienniku; `src/data/wycofania.json` ostatnio zmieniony 02.11.**
**Mamy?** — nie: SUCCEEDED w tabeli to dostarczenie promptu, nie wynik przebiegu.
**Zrobić:** — otworzyć sesję Wycofań na koncie i sprawdzić, co zrobiła 09.11 (odmowa klasyfikatora jak Zdjęcia → R2 04.11? błąd pushu? „nic do zmiany"?); jeśli nic — odpalić ręcznie.
**Kto:** — Marek (panel)
↻ 09.11 (Kontroler): Marek 09.11 „wycofania sprawdzę" — w toku po jego stronie.
→ zamknięte 16.11.2026 (Kontroler): przebieg 16.11 06:10 zostawił commit `9ce082f` („Wycofania: aktualizacja 2026-11-16", Monkie Kid ×10 jako przewidywane) i linię „→ Wycofania 2026-11-16" pod sygnałem Scouta — runner działa. Co stało się 09.11, nie wiadomo; jeden pusty poniedziałek bez powtórki nie jest już pozycją.

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

## 2026-11-08 08:10 · RADAR · Do zrobienia

**kalendarz promocji · 08.11** — Okno trzech gratisów (40889, 30727, 40898) kończy się 8.11, a plakietka „trwa" w „Co trwa teraz" i w nagłówku sekcji `#listopad-40889` od 9.11 kłamałaby.
**Mamy?** — tak: `/artykuly/kalendarz-promocji-lego/` — ale nic nie pilnuje daty końca okna automatycznie.
**Zrobić:** — zrobione 8.11 na polecenie Marka („zrób to teraz — przestaw okno na zamknięte"): oba miejsca mają plakietkę „zamknięte", zdania o oknie przepisane w czasie przeszłym (tabela gratisów zostaje, bo pokazuje mechanikę). Zostało do rozważenia: kontrola w `swiezosc-tekstow.mjs`, która porównuje datę końca okna z dzisiejszą i zgłasza plakietkę „trwa" po terminie — bez niej każde następne okno trzeba zamykać ręcznie.
**Kto:** — Code (dane, strona)

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

## 2026-11-06 08:20 · RADAR · Do zrobienia

**lego.com/pl-pl · 06.11** — Karta promocji LEGO wymienia dziś **trzy** gratisy, nie dwa: do 40889 (28.10–08.11, próg 540 zł) i 30727 (28.10–08.11, Star Wars od 165 zł) doszedł **40898 Wenecka taksówka wodna, 01.11–08.11.2026**, z warunkiem „Zakup musi obejmować produkt Wenecka okolica (11388)". Domyka to wątek z 28.10, kiedy zapisałem, że LEGO własnym źródłem tego gratisu nie potwierdza.
**Mamy?** — nie mieliśmy, i to był błąd na produkcji: nagłówek sekcji `#listopad-40889`, pozycja w „Co trwa teraz" i tabela mówiły o **dwóch** gratisach, więc żywe okno kończące się za dwa dni było u nas niewidoczne.
**Zrobić:** — zrobione w tym przebiegu: trzeci wiersz tabeli (warunek 11388, okno 1–8.11), „dwa gratisy" → „trzy gratisy" w nagłówku i w „Co trwa teraz", akapit o mechanice (brak progu kwotowego, 322 elementy, wycena 124,99 zł, pomost pasuje do nabrzeża 11388) i zastrzeżenie, że sam gratis nie jest powodem, żeby dokładać do zakupu za 2149,99 zł. **Wniosek na przyszłość:** liczebnik w nagłówku jest trzecim miejscem, w którym trzymamy tę samą daną — przy każdym dopisaniu wiersza do tabeli gratisów przeglądamy nagłówek sekcji i pozycję w „Co trwa teraz".
**Kto:** — Code (dane, strona)

**fanklockow.pl · 05.11** — LEGO.com przyznało im pulę kodów na gratis **30708 Minimodel Sokoła Millennium** dla ich czytelników: 16–20.11.2026, próg 165 zł z dowolnej serii, wyłącznie online, kod w koszyku, zajmuje jeden z trzech slotów nagrody Insiders. Piszą „znów mamy dla Was kolejny gratis", czyli dostają takie pule regularnie.
**Mamy?** — nie i nie możemy mieć treścią: to nie publiczne okno, tylko kody wydawane z ich podstrony. Do naszego kalendarza nie wchodzi — bez ich kodu czytelnik tego gratisu nie dostanie, a my nie odsyłamy do konkurencji. Luka jest **relacyjna**, nie redakcyjna.
**Zrobić:** — zdecydować, czy próbujemy o to samo własnym kanałem (Tradedoubler / kontakt LEGO.pl): pula kodów na gratis dla czytelników tylkoklocki.pl przed Weekendem Insiders.
**Kto:** — Marek (decyzja)
→ zamknięte 16.11.2026 (decyzja Marka 16.11, zapisana przez Radar w pozycji z 16.11 i w „Ustaleniach trwałych", `a11313d`): nie staramy się o pulę kodów gratisowych.

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
→ zamknięte 16.11.2026 (Kontroler): zrzuty weszły w czwartek 13.11 (`d3492fb`) i dziś 16.11 o 09:24 PL (`8d59719`, 4 575 Empik / 674 x-kom) — przed przebiegiem Kontrolera, tak jak miało być.

**11381 Jaguar E-Type ma dwie daty premiery: `karty_setow.json` (metryka „Premiera" i zdanie w treści) „1 lipca 2026", recenzja `/artykuly/lego-11381-jaguar-e-type-recenzja/` i `sety.json` (`premiera: 2026-08`) „1 sierpnia 2026" — jedyna sprzeczność z nowego sprawdzenia dat premier (`swiezosc-tekstow.mjs`, 522 zestawy).**
**Mamy?** — tak: oba miejsca w repo, karta idzie na hub.
**Zrobić:** — potwierdzić datę na karcie lego.com i poprawić to miejsce, które się myli (najpewniej kartę — rejestr i recenzja zgadzają się na sierpień).
**Kto:** — Code (dane)
↻ 09.11 (Kontroler): nadal aktualne — `swiezosc-tekstow.mjs` 09.11 pokazuje tę samą sprzeczność (karta „1 lipca", recenzja i `sety.json` sierpień).
↻ 16.11 (Kontroler): trzeci tydzień — ta sama sprzeczność w `swiezosc-tekstow.mjs` 16.11.
↻ 23.11 (Kontroler): czwarty tydzień — `swiezosc-tekstow.mjs` 23.11 pokazuje to samo; doszły dwie nowe sprzeczności dat (80122, 80123), osobna pozycja we wpisie KONTROLER 23.11.

Poza listą dla ludzi: Scout nie zostawił commita 27.10 (jedyna luka runnera w tygodniu; 28.10–02.11 codziennie) — sprawdzę za tydzień, czy to jednorazowe. `/zestaw/10280/` nadal z crawlem 11.09 (52 dni), `/serie/marvel/` odwiedzony 01.11 sam. Nowy kanał GitHub skrzynki (`tylkoklocki-teksty`) i panel — kontrola za tydzień, czy zostawiają wpisy w dzienniku.

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
↻ 16.11 (Kontroler): nadal aktualne, 17 dni — decyzja 1 raportu 16.11: 85 zwykłych zestawów roczników 2012–2025 do rejestru do 20.11 tą samą drogą co 48 z wycofaniem (09.11, `5907a36`); 22 bez RRP poza.
↻ 05.11.2026: nadal aktualne — przy definicji z `kolejka-redakcyjna.py` (katalog, rocznik 2020–2026, status `dostepny`, z ofertami w feedzie, bez pola `bez_rrp`) wychodzi dziś **100** pozycji i lista jest identyczna jak w stanie z commita `87c47a7` z 04.11 — żadna nie doszła i żadna nie zniknęła. Liczba 107 z tej pozycji obejmuje też roczniki 2012–2019, więc 100 to inne okno, a nie spadek.
↻ 10.11.2026: nadal aktualne, ale lista zrobiła się o połowę krótsza — po dopisaniu 48 zestawów z potwierdzonym wycofaniem (`5907a36`, decyzja Marka 09.11) zostaje **54** pozycje. Największe grupy: Gadżety 13, **Monkie Kid 10**, Archiwum 9, Creator 6, Icons 3. Monkie Kid trafia tu nieprzypadkowo — StoneWars pisze, że cała linia schodzi z rynku z końcem 2026 (sygnał w moim wpisie z dziś), więc te dziesięć zestawów albo dopisujemy teraz, albo zostaną bez śledzonego minimum na zawsze.
→ zamknięte 16.11.2026 (Kontroler, zgoda Marka 16.11 „zgoda na decyzję 1"): z listy po 09.11 zostało 58 kandydatów; 34 zwykłe zestawy z RRP dopisane do `sety.json` (1361 → 1395) i `ceny_baza.json` (1249 → 1283) — Monkie Kid ×10, Braille ×5, pocztówki ×5, Icons ×3, Wicked ×2, Archiwum, 75394, 43008, 10373, 40619, 40478, 21358. 24 pozostałe to gadżety 854xxx/500xxxx, Power Functions 88xxx, saszetki 30718/30720/30732 i 2000414 — bez RRP, poza rejestrem (30720 ma osobną pozycję Radaru).

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
