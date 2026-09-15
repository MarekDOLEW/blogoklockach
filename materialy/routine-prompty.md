# Prompty Routines LEGO — kopia z konta

*Plik w całości generuje `scripts/harmonogram-z-konta.mjs` z odpowiedzi `list_triggers`;
odczyt z konta: 15.09.2026, 14:10 (CEST). Nie edytuj ręcznie — źródłem prawdy
jest panel claude.ai, a ten plik odświeża Kontroler co poniedziałek. Diff w git
pokazuje, co i kiedy zmieniło się w promptach. Zmiana promptu: Routine ze stałą sesją
wymaga delete + create (sesja Code), Routine ze świeżą sesją edytuje się w panelu.*

## LEGO co 8h (4:00/12:00/20:00 PL) — Backfill cen katalogowych (runner z pushem)

- ID: `trig_01D5ZK2mHY9CSXAQNnfwaV3q` · cron `0 2,10,18 * * *` (UTC) · WYŁĄCZONY · stała sesja (zmiana promptu = delete + create)

```
Kolejny przebieg backfillu cen katalogowych. Repo jest dopięte do tej sesji — pushuj bezpośrednio.

PROCEDURA (jak w poprzednich przebiegach tej rozmowy):
1. git pull na main tuż przed pracą (inne zadania też pushują). Wczytaj src/data/katalog.json.
2. Pula wg priorytetów: (1) status "dostepny", (2) numery z src/data/wycofania.json, (3) EOL z serii Ideas/Icons/Star Wars/Technic/Harry Potter. Pomiń wpisy mające już cena_katalogowa (także null — null znaczy "sprawdzono, brak ceny w zł"). EOL z pozostałych serii poza zakresem. UWAGA: od 30.08.2026 duża część pul ma już ceny z bazy Republiki Klocków (wpisy z polem cena_zrodlo="RK") — te wpisy pomijaj tak samo jak inne z ceną.
3. Partia: ~250 numerów, jeśli WebFetch do brickset.com/promoklocki.pl działa; przy blokadzie (EGRESS_BLOCKED) ~120 numerów i maks. 4 równoległych agentów (wspólny limit WebSearch ~200 zapytań). Numer niesprawdzony z braku budżetu zostaw BEZ zmian.
4. Źródła cen w kolejności: brickset.com/sets/NUMER-1 (pole RRP, WYŁĄCZNIE wartość w zł — walut nie przeliczaj), potem promoklocki.pl ("Cena katalogowa"), potem zklockow.pl. Cena tylko wprost ze źródła; bez szacowania. Brak ceny w zł w żadnym źródle → "cena_katalogowa": null.
5. Sanity-check: 4–6000 zł; typowo 0,15–1,50 zł/element — poza tym przedziałem sprawdź drugie źródło; przy rozbieżności bierz promoklocki.
6. Zapis: dopisuj TYLKO pole cena_katalogowa, niczego nie usuwaj, formatowanie indent=2, ensure_ascii=False. Zaktualizuj _meta.backfill_cen {data, uzupelnione_lacznie, ostatnie_serie}.
7. Walidacja: poprawny JSON, liczba wpisów i liczba pól cena_katalogowa nie zmalały. Commit "Backfill: ceny katalogowe — <serie>, <ile> setów (<data>)", push na main. Przy konflikcie: pull, nanieś ceny ponownie, push raz jeszcze. Przebieg MUSI skończyć się commitem — jeśli push się nie uda, opisz dokładny błąd gita w podsumowaniu i wyślij plik przez SendUserFile.

BRAMKA SANITY (obowiązkowa od 30.08.2026, po audycie fałszywych rabatów): przed commitem uruchom `node scripts/kontrola-rrp.mjs` i przejrzyj sekcję „Test rynkowy". Cena rynkowa z feedów poniżej 50% wpisywanej ceny katalogowej = któraś strona jest błędna. Rozstrzyganie: RRP potwierdzone niezależnie (rrp_potwierdzone.json / wpis RK w katalog.json) → wina rynku (zaślepka sklepu lub oferta-podszywka), wpis zostaje, przypadek do raportu; RRP bez niezależnego potwierdzenia → ceny NIE zapisuj (brak ceny jest lepszy niż fałszywy rabat). Nigdy nie zapisuj ceny z przeliczenia walutowego bez oznaczenia i bez sprawdzenia mnożnika rocznika (RUNBOOK, sekcja o przeliczniku).

ZAKOŃCZENIE CAŁOŚCI: gdy pule 1–3 nie mają już wpisów bez cena_katalogowa, napisz "BACKFILL ZAKOŃCZONY — wyłącz zadanie «LEGO co 8h — Backfill cen katalogowych (runner z pushem)»".

PODSUMOWANIE przebiegu: ile sprawdzono, ile cen (per źródło), ile null, ile pominięto z braku budżetu, które serie, ile zostało w pulach.
```

## LEGO 05:00 — Scout nowości (runner z pushem, Opus 5)

- ID: `trig_01VSNGR5PnnobJW9i9x5PAmQ` · cron `0 3 * * *` (UTC) · włączony · stała sesja (zmiana promptu = delete + create)

```
Kolejny przebieg Scouta Nowości. Repo dopięte do tej sesji — zacznij od `git pull origin main`, na końcu commit i push bezpośrednio.

ŹRÓDŁA — DOKŁADNIE TRZY, żadnych innych. Nie przeszukuj internetu poza nimi, nie używaj WebSearch do szukania kolejnych serwisów. (Ustalone 21.08.2026: lego.com i BrickLink blokują nasz ruch — 403/405 — więc ich nie próbuj.)

1. Brickset — katalog, źródło danych twardych: `brickset.com/sets/year-2026` i `brickset.com/sets/year-2027`, w razie potrzeby listy per seria (`brickset.com/sets/theme-Icons/year-2026`). Stąd bierz numer, nazwę, serię, liczbę elementów, RRP i datę premiery.
2. PromoBricks — `promobricks.de` — zapowiedzi i premiery (serwis niemiecki, szybko podaje nowe zestawy).
3. StoneWars — `stonewars.de` — drugie źródło zapowiedzi; przydatne do potwierdzania informacji z PromoBricks.

Zasada: dane katalogowe (numer, elementy, RRP) zawsze z Bricksetu. PromoBricks i StoneWars służą do wychwycenia, ŻE coś się pojawiło, i do kontekstu. Informacji z jednego serwisu newsowego nie podawaj jako pewnika — jeśli nie ma jej w Brickset ani w drugim serwisie, oznacz jako „zapowiedź niepotwierdzona".

PROCEDURA:
1. Lista znanych setów: `src/data/known_sets.json`. Nowościami są wyłącznie sety, których tam nie ma. Na końcu zaktualizuj ten plik.
2. Nowe sety DOŁÓŻ do `src/data/sety.json` — nigdy od zera, nie usuwaj ani nie skracaj wpisów. Struktura: numer jako klucz; pola: nazwa (PL), seria, cena_katalogowa, elementy, wiek, premiera (RRRR-MM), opis, dla_rodzica, dla_afol, oferty ({sklep, cena, data}). Opisy własnymi słowami po polsku, w tonie serwisu (zasady w `redakcja/standard-artykulow-biezacych.md`: bez „cegieł", bez języka marketingowego producenta, bez sztucznej presji).
3. Walidacja: poprawny JSON, liczba setów nie zmalała. Commit „Scout: nowości <data>" (sety.json + known_sets.json razem), push na main. Konflikt → pull, nanieś ponownie, push. Push niemożliwy → dokładny błąd gita w podsumowaniu + pliki przez SendUserFile.
4. Brak nowości = napisz to wprost i nie commituj.
5. WYCOFANIA — NIE TWOJE ZADANIE (ustalone 15.09.2026). Nie edytuj `src/data/wycofania.json` — właścicielem tego pliku i jego reguł statusów jest cotygodniowy runner „Wycofania" (poniedziałek). Jeśli w źródłach trafisz na sygnał wycofania (lista „Ostatnia szansa"/„Retiring soon" na StoneWars, PromoBricks, Brickset, komunikat LEGO), dopisz go do `DZIENNIK.md` pod linią znacznika `WPISY PONIŻEJ` jako krótki wpis:

    ## <RRRR-MM-DD> <HH:MM> · SCOUT · Sygnały wycofań dla runnera Wycofań
    - <numer> <nazwa> — <źródło z adresem>, <co mówi źródło: termin / „ostatnia szansa" / zniknął z lego.com>

Jeden wpis na przebieg, tylko gdy są sygnały; wpis commitujesz razem z resztą. Runner Wycofań czyta te wpisy w poniedziałek i weryfikuje u źródła. Dzięki temu plik ma jednego autora, a Ty nie tracisz informacji.

BUDŻET — przebieg ma być tani: maksymalnie ~10 pobrań stron łącznie, bez równoległych agentów, bez WebSearch. Jeśli któreś ze źródeł nie odpowiada, pracuj na pozostałych i napisz to w raporcie zamiast szukać zamienników.

PODSUMOWANIE: nowości z priorytetami redakcyjnymi (co warto opisać najpierw i dlaczego), zapowiedzi śledzone, co zmieniło status, oraz z których źródeł pochodziły ustalenia.

WYSYŁKA RAPORTU DO REDAKCJI (od 14.09.2026). Piotr nie widzi tej rozmowy ani plików z SendUserFile — dostaje wyłącznie mail, a przez cztery tygodnie nie dostał żadnego, bo tego kroku tu nie było. Zapisz PODSUMOWANIE z poprzedniego punktu do pliku `/tmp/raport-nowosci.md` (zwykły markdown: nagłówki, tabele, listy — dokładnie to, co piszesz w rozmowie), po czym z katalogu repo uruchom:

    python3 scripts/wyslij-raport.py --zadanie nowosci --tytul "Scout Nowości — <DD.MM.RRRR>" --plik /tmp/raport-nowosci.md --wstep "<1–2 zdania: co w tym przebiegu najważniejsze>"

Skrypt sam robi PDF (Chromium z kontenera — niczego nie instaluj) i wysyła na adresy z `src/data/raporty_mail.json`. Wysyłaj TYLKO wtedy, gdy przebieg coś zmienił (był commit). Brak zmian = brak maila — inaczej raporty spowszednieją i przestaną być czytane. Jeśli skrypt zwróci błąd, wklej jego dokładny komunikat do podsumowania i nie ponawiaj więcej niż raz. Nigdy nie wysyłaj pustego pliku.
```

## LEGO 08:00 — Radar konkurencji (runner, Opus 5)

- ID: `trig_01WgDxbN6eB2QzAZha7dWBfx` · cron `0 6 * * *` (UTC) · włączony · stała sesja (zmiana promptu = delete + create)

```
Kolejny przebieg Radaru Konkurencji. Repo dopięte do tej sesji — zacznij od `git pull origin main`, na końcu commit i push bezpośrednio.

Sprawdź nowe publikacje na fanklockow.pl, faniklockow.pl i zklockow.pl — wskaż, co przebijamy i jakie są luki. Dodatkowo monitoruj promoklocki.pl (konkurencja narzędziowa): NIE raportuj ich bieżących promocji ani zmian cen, wyłącznie zmiany strukturalne — nowe artykuły/poradniki lub sekcje treściowe, nowe funkcje serwisu (alerty, listy wycofań, prezentowniki), zmiany listy porównywanych sklepów (sygnał, kto ma program afiliacyjny). Zapisuj je jako wpisy z serwis="promoklocki.pl" i typ="produkt".

Baza znanych publikacji: `src/data/konkurencja_baza.json`. Raportuj wyłącznie wpisy, których tam nie ma. Na końcu DOŁÓŻ nowe wpisy (nie usuwaj istniejących, zaktualizuj _meta), zwaliduj JSON, commit „Radar: baza konkurencji <data>", push na main. Konflikt → pull, nanieś ponownie, push. Push niemożliwy → dokładny błąd gita w podsumowaniu + plik przez SendUserFile. Brak nowości = napisz wprost, nie commituj.

ANALIZA I FORMAT RAPORTU (przepisane 15.09.2026 na prośbę Marka: dotychczasowe raporty „zasypywały tematami i były nieczytelne"). Raport ma najwyżej PIĘĆ pozycji, wybranych wg wpływu na ruch zakupowy w sezonie XI–XII. Każda pozycja ma dokładnie cztery linijki, bez rozwinięć:

    **<serwis> · <data>** — <jedno zdanie: co opublikowali / co zmienili>
    **Mamy?** — tak: <adres u nas> / częściowo: <czego brakuje> / nie
    **Zrobić:** — <jedna konkretna czynność: nowy tekst „<roboczy tytuł>" / uzupełnić <adres> o <co> / zmiana w danych <plik> / nic>
    **Kto:** — Piotr (tekst) / Code (dane, strona) / Marek (decyzja)

Poza piątką: jedna linijka „Pominięte: N publikacji bez znaczenia dla nas (linki w bazie)". Bez wstępów, bez podsumowań, bez ocen ogólnych typu „konkurencja jest aktywna". Jeśli nic nie zasługuje na miejsce w piątce — raport ma jedno zdanie: „Nic do zrobienia" i nie wysyłasz maila. Standardy redakcyjne serwisu: `redakcja/standard-artykulow-biezacych.md`.

REJESTR ZADAŃ Z RADARU: pozycje ze „Zrobić" innym niż „nic" dopisz do `DZIENNIK.md` pod linią znacznika `WPISY PONIŻEJ` jako jeden wpis „## <data> <godzina> · RADAR · Do zrobienia" z tymi samymi czterema linijkami na pozycję. Kontroler zbiera je co tydzień, Marek i Piotr skreślają albo przyjmują — bez tego rekomendacje ginęły w mailach.

BUDŻET: przebieg ma być zwięzły — bez równoległych agentów, bez przeglądania archiwów konkurencji, tylko świeże publikacje od ostatniego przebiegu.

WYSYŁKA RAPORTU DO REDAKCJI (od 14.09.2026). Piotr nie widzi tej rozmowy ani plików z SendUserFile — dostaje wyłącznie mail, a przez cztery tygodnie nie dostał żadnego, bo tego kroku tu nie było. Zapisz PODSUMOWANIE z poprzedniego punktu do pliku `/tmp/raport-konkurencja.md` (zwykły markdown: nagłówki, tabele, listy — dokładnie to, co piszesz w rozmowie), po czym z katalogu repo uruchom:

    python3 scripts/wyslij-raport.py --zadanie konkurencja --tytul "Radar Konkurencji — <DD.MM.RRRR>" --plik /tmp/raport-konkurencja.md --wstep "<1–2 zdania: co w tym przebiegu najważniejsze>"

Skrypt sam robi PDF (Chromium z kontenera — niczego nie instaluj) i wysyła na adresy z `src/data/raporty_mail.json`. Wysyłaj TYLKO wtedy, gdy przebieg coś zmienił (był commit). Brak zmian = brak maila — inaczej raporty spowszednieją i przestaną być czytane. Jeśli skrypt zwróci błąd, wklej jego dokładny komunikat do podsumowania i nie ponawiaj więcej niż raz. Nigdy nie wysyłaj pustego pliku.
```

## LEGO pon 09:00 — Kontroler (raport tygodnia) [env projektu]

- ID: `trig_01JhfcGMgzv1nBwiguH93m6N` · cron `0 7 * * 1` (UTC) · włączony · świeża sesja na każdy przebieg

```
Raport kontrolera — wynik tygodnia vs plan 20 000 zł na grudzień, EPC per sklep, TOP artykuły i 3 decyzje na ten tydzień.

KROK 0 — DIAGNOZA ŚRODOWISKA. Zaraz po sklonowaniu repo uruchom `node scripts/diagnoza.mjs` i wklej wynik na początku raportu jako sekcję „Diagnoza środowiska". To jest JEDYNE źródło zdań o tym, co środowisko widzi — nie pisz o dostępach z pamięci ani z założeń. Skrypt nie drukuje wartości sekretów, więc wynik można wkleić w całości.

HARMONOGRAM RUNNERÓW. Wywołaj narzędzie `list_triggers` (konektor Claude_Code_Remote, limit 30), zapisz surową odpowiedź do pliku `routines.json` i uruchom `node scripts/harmonogram-z-konta.mjs routines.json`. Skrypt przepisuje wyłącznie sekcję między znacznikami HARMONOGRAM:START i HARMONOGRAM:KONIEC w `materialy/zadania-cykliczne.md`; reszty dokumentu nie tykaj i nie poprawiaj ręcznie. Zmieniony plik wypchnij do repo (zasady pushu niżej). W raporcie daj sekcję „Harmonogram" z trzema rzeczami: ile zadań jest włączonych, które włączone zadanie NIE odpaliło się w minionym tygodniu, oraz jakie są kolizje (dwa zadania startujące w tej samej minucie dzielą limit konta). Jeśli `list_triggers` nie odpowie albo zażąda zgody, której nie ma jak udzielić — napisz o tym jedno zdanie i licz resztę raportu normalnie, tak jak przy braku CF_ACCOUNT_ID. NIE przepisuj tej sekcji ręcznie: harmonogram pisany ręcznie rozjechał się już cztery razy.

ARCHIWUM DZIENNIKA. Uruchom `node scripts/archiwum-dziennika.mjs`. Skrypt przenosi wpisy starsze niż 14 dni z `DZIENNIK.md` do `materialy/dziennik-archiwum-RRRR-MM.md` i jest idempotentny — gdy nie ma nic do przeniesienia, nie zmienia pliku. Jeśli coś przeniósł, dołącz `DZIENNIK.md` i nowy plik archiwum do tego samego commita co harmonogram. Jeśli skrypt PRZERWAŁ z komunikatem o sekcji stałej pod znacznikiem — nie naprawiaj dziennika ręcznie, napisz o tym jedno zdanie w raporcie; to jest praca dla człowieka.

KLIKNIĘCIA AFILIACYJNE: sklonuj repo (patrz niżej) i uruchom `node scripts/kliki-raport.mjs --dni 7`. Skrypt czyta dataset idz_kliki z Workers Analytics Engine przez SQL API i wymaga zmiennych CF_ACCOUNT_ID oraz CF_API_TOKEN (token z uprawnieniem "Account Analytics: Read"; NIE wypisuj ich wartości).

RUCH BOTÓW — to jest najważniejsza rzecz przy liczeniu EPC. Od 14.09.2026 worker oznacza każde kliknięcie jako „human" albo „bot" (rozstrzyga referer z tylkoklocki.pl), a `kliki-raport.mjs` domyślnie liczy WYŁĄCZNIE ludzi. Pomiar z 14.09: 34 boty na 9 ludzi wśród oznaczonych kliknięć, a w analizie z 13.09 scrapery odpowiadały za 92% ruchu na /idz/. EPC licz z liczb po filtrze i NIGDY nie mieszaj ich z liczbami z `--wszystko`. W raporcie podaj osobno pole `podzial_ruchu` (human / bot / nieoznaczone) — „nieoznaczone" to kliknięcia sprzed 14.09, których nie da się zaklasyfikować, więc nie doliczaj ich do ludzi ani nie udawaj, że ich nie było. Udział kliknięć ze stanem „brak-linku" licz po ruchu ludzkim — bot, który trafił w brak linku, nie jest utraconą prowizją.

Stan zapisu na 25.08.2026: wiązanie analytics_engine_datasets jest w wrangler.jsonc, produkt aktywowany na koncie, dataset potwierdzony danymi w panelu — worker ZAPISUJE kliknięcia. Jeśli skrypt zwróci błąd o brakujących zmiennych, to znaczy, że brakuje wyłącznie poświadczeń do ODCZYTU: napisz w raporcie jedno zdanie o tym i licz resztę normalnie, nie drąż tematu wiązania.

PROWIZJE ZMIERZONE: uruchom `node scripts/prowizje-raport.mjs --dni 30`. Od 14.09.2026 działają trzy sieci: Adtraction (Smyk, Egmont), Performers (Media Expert) i Tradedoubler przez Publisher API (Empik, Ceneo). To są prowizje ZMIERZONE, nie modelowane — jeśli raport je zwraca, EPC liczy się z nich, a nie z założeń. Uwaga: Tradedoubler raportuje w EUR, Adtraction i Performers w złotówkach; nie sumuj tego jedną liczbą. Allegro i Planeta Klocków nie mają API i tam EPC pozostaje modelem — napisz to wprost.

Dane wejściowe pobieraj z repo (folder Cowork NIE jest dostępny z zadań cyklicznych): https://raw.githubusercontent.com/MarekDOLEW/blogoklockach/main/src/data/known_sets.json oraz .../src/data/ceny_baza.json — do obu URL-i dodaj parametr ?t=<bieżący znacznik czasu>.

UWAGA historyczna: w danych sprzed 26.08 siedzi sześć przejść testowych przez /idz/ z 25.08 ok. 05:11 UTC (empik, smyk, xkom, allegro, mediaexpert, planetaklockow; zestawy 76467 i 31168) wykonanych z serwerowego IP podczas weryfikacji wdrożenia. Przy oknie 7-dniowym już ich nie ma; liczą się tylko przy raportach obejmujących koniec sierpnia.

WIDOCZNOŚĆ W GOOGLE (Search Console): uruchom `node scripts/gsc-raport.mjs --dni 7` — wymaga zmiennej środowiskowej GSC_KEY_JSON_B64 (ustawiona w środowisku; NIE wypisuj jej wartości). Wynik (suma klików/wyświetleń, TOP frazy, TOP podstrony, pozycje) włącz do raportu jako sekcję „Widoczność w Google" z porównaniem do poprzedniego tygodnia (`--dni 14` pomoże policzyć trend). Jeśli zmiennej brak albo API zwróci błąd — jedno zdanie w raporcie zamiast sekcji.

INDEKSACJA: to jest dziś wąskie gardło całego serwisu, więc raportuj ją co tydzień. Przez API Search Console sprawdź status sitemapy (endpoint sites/<usluga>/sitemaps: ile adresów przesłanych, ile zindeksowanych) oraz zainspektuj kilka adresów (POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect z inspectionUrl i siteUrl=sc-domain:tylkoklocki.pl): stronę główną, /artykuly/, jeden artykuł, /serie/ i jeden hub /zestaw/. Podaj werdykt, coverageState i datę ostatniego crawla.

Punkty odniesienia:
- 24.08.2026 (przed przycięciem sitemapy): 4 874 adresy przesłane, 0 zindeksowanych; tylko strona główna zindeksowana, ostatni crawl 15.08; reszta „wykryta, obecnie niezindeksowana" albo nieznana Google, crawl NIGDY.
- 25.08.2026 (po przycięciu): sitemapa zawiera 1 160 adresów — zgłaszamy tylko huby /zestaw/ z redakcyjnym opisem albo z ceną z co najmniej dwóch sklepów, plus artykuły, prezentowniki, serie i strony stałe. Pozostałe huby dalej działają i są linkowane wewnętrznie, po prostu nie są zgłaszane. Filtr przelicza się przy każdym buildzie (astro.config.mjs). Tego samego dnia Cowork zgłosił ręcznie kilkanaście adresów przez „Poproś o zaindeksowanie".
Każdą poprawę albo pogorszenie względem tych liczb wypunktuj wprost. Szczególnie interesuje nas, czy rośnie liczba zindeksowanych adresów i czy Google zaczyna crawlować cokolwiek poza stroną główną.

Raport dostarcz jako PDF przez SendUserFile (nie Markdown — Marek nie otwiera plików .md). Jeśli w wyniku analizy aktualizujesz któryś plik danych, wypchnij go do repo (git clone https://github.com/MarekDOLEW/blogoklockach.git, a jeśli w środowisku jest zmienna GH_PUSH_TOKEN — klonuj przez https://x-access-token:${GH_PUSH_TOKEN}@github.com/MarekDOLEW/blogoklockach.git, commit, push na main); jeśli push odrzucony — wyślij plik przez SendUserFile.
```

## LEGO ndz 10:00 — Social: paczka tygodniowa (ZAWIESZONE do startu kanałów)

- ID: `trig_01W1CSp8PM3DDN6UEyNLYe6H` · cron `0 8 * * 0` (UTC) · WYŁĄCZONY · świeża sesja na każdy przebieg

```
Przygotuj cotygodniową paczkę social media dla serwisu tylkoklocki.pl (IG + TikTok + FB) na nadchodzący tydzień (pon–ndz). Użyj skilla klocki-social — trzymaj się jego zasad (faceless, konwersja afiliacyjna, ton serwisu). Odpowiadaj po polsku.

DANE WEJŚCIOWE (pobieraj z repo przez raw.githubusercontent.com/MarekDOLEW/blogoklockach/main/... z parametrem ?t=<znacznik czasu> dla ominięcia cache):
- src/data/sety.json — śledzone sety, oferty, opisy dla_rodzica/dla_afol
- src/data/wycofania.json — wycofania (pole kiedy — najbliższe terminy są najpilniejsze)
- src/data/oferty_feed.json — aktualne ceny ME/PK (pole oferty per sklep; rabaty licz od cen katalogowych z sety.json/katalog.json, nie od PreviousPrice)
- src/data/katalog.json — statusy i ceny katalogowe
Z tych danych wybierz na tydzień: 2–3 realne deale (rabat ≥20% od ceny katalogowej), 1–2 nowości/premiery, 1 temat wycofaniowy (zestaw znikający najbliżej), 1 temat evergreen (ranking/ciekawostka z katalogu).

PLAN TYGODNIA (nie spamować):
- IG: 3 publikacje (1 karuzela 7 slajdów, 2 posty statyczne 1080×1350)
- FB: 3 posty (mogą być adaptacją IG, inny lead tekstu)
- TikTok: 2 scenariusze rolek (hook ≤3 s, sceny z tekstem na ekranie, bez twarzy i bez głosu autora, sugestia podkładu z biblioteki TikToka)
Każdej publikacji przypisz dzień i godzinę (pory o wysokim zasięgu: 12:00–13:00 lub 19:00–21:00).

GRAFIKI — renderuj sam:
1. Zbuduj szablony HTML w identyfikacji serwisu: tło #f6f7f9, granat #17233f, żółty #ffc933, czerwień ceny #e0312f, zieleń #0f7a43, font Archivo (Google Fonts lokalnie lub fallback sans-serif), logo tekstowe „tylkoklocki.pl" z 4 żółtymi kropkami (wypustki klocka). Format: 1080×1350 posty, 1080×1080 slajdy karuzeli.
2. Zdjęcia setów bierz z pól zdjecie/zdjecia w danych repo (URL-e planetaklockow/mediaexpert/rebrickable).
3. Render HTML→PNG: playwright + chromium (npx playwright install chromium, screenshot elementu). Jeśli instalacja się nie uda, spróbuj wkhtmltoimage; w ostateczności dostarcz same pliki HTML z dopiskiem, że wymagają zrzutu.
4. Na każdej grafice z ceną: cena + rabat od ceny katalogowej + data sprawdzenia ceny (z pola data oferty). Nie pisz „najniższa cena w historii", jeśli nie potwierdza tego ceny_baza/najnizsza_cena.

TEKSTY: dla każdej publikacji caption (IG/FB per platforma, nie kopiuj 1:1), hashtagi (IG 15–20 mieszanych PL, TikTok 4–6, FB 2–3), CTA kierujące na tylkoklocki.pl (link w bio na IG/TT, link bezpośredni na FB — do konkretnej podstrony /zestaw/... lub /wycofania/). Oznaczenie afiliacji zgodnie ze skillem.

DOSTAWA — WAŻNE: Marek nie otwiera plików .md, wszystkie dokumenty dostarczaj jako PDF:
1. Katalog roboczy: grafiki/*.png (nazwy: pon-ig-karuzela-1.png itd.), kalendarz.pdf (tabela: dzień, godzina, platforma, plik grafiki, caption do wklejenia, hashtagi — captiony muszą dać się skopiować z PDF-a) oraz rolki.pdf (2 scenariusze klatka po klatce). PDF-y generuj przez weasyprint (pip install weasyprint markdown --break-system-packages), styl czytelny, A4.
2. Spakuj wszystko do ZIP i wyślij przez SendUserFile; dodatkowo wyślij sam kalendarz.pdf osobno (żeby dało się go otworzyć bez rozpakowywania).
3. W czacie: krótkie podsumowanie planu (co, kiedy, dlaczego te tematy) — bez wklejania wszystkich tekstów.

Jeśli któregoś pliku danych nie uda się pobrać, użyj pozostałych i napisz to wprost. Nie wymyślaj cen ani dat.
```

## LEGO pon 06:00 — Wycofania (runner z pushem)

- ID: `trig_01S5hMfivCCFytZSqces2pYw` · cron `10 4 * * 1` (UTC) · włączony · stała sesja (zmiana promptu = delete + create)

```
Kolejny przebieg aktualizacji wycofań zestawów LEGO. Repo dopięte do tej sesji — zacznij od git pull na main, na końcu commit i push bezpośrednio.

1. Plik danych: src/data/wycofania.json w klonie tej sesji (w _meta instrukcja formatu — trzymaj się jej). Zweryfikuj, że ma co najmniej ~270 pozycji.
2. Źródła: dział „Ostatnie sztuki" na lego.com/pl-pl (potwierdzone), brickset.com oraz listy „Ostatnia szansa"/„Retiring soon" na stonewars.de i promobricks.de (potwierdzone, gdy piszą, że to oznaczenie LEGO w firmowym sklepie; inaczej przewidywane). WSZYSTKIE serie — od 14.09.2026 strona /wycofania/ pokazuje każdą serię z pliku, nie tylko listę z `_meta.serie_kolejnosc`.
2a. Sygnały od Scouta (od 15.09.2026): zacznij od `DZIENNIK.md` — Scout dopisuje w ciągu tygodnia wpisy „SCOUT · Sygnały wycofań dla runnera Wycofań" z numerami i źródłami. Każdy sygnał zweryfikuj u źródła i dopiero wtedy dopisz do pliku; bez potwierdzenia u LEGO wpis dostaje status „przewidywane" tylko wtedy, gdy podają go dwa niezależne źródła. Jesteś JEDYNYM autorem `src/data/wycofania.json` — Scout ma zakaz jego edycji.
3. Aktualizuj przez DOŁOŻENIE zmian: dopisz nowe pozycje (numer, nazwa PL, seria, elementy, kiedy, status potwierdzone/przewidywane, jedno zdanie uwag własnymi słowami), zmieniaj status przewidywane→potwierdzone gdy LEGO potwierdzi, oznaczaj „wycofany" gdy zniknie ze sprzedaży LEGO, nie usuwaj wpisów.
4. Jeśli są zmiany: zaktualizuj _meta.aktualizacja, zwaliduj JSON (liczba pozycji nie zmalała), commit "Wycofania: aktualizacja <data>", push na main. Konflikt → pull, nanieś ponownie, push. Push niemożliwy → dokładny błąd gita w podsumowaniu + plik przez SendUserFile. Jeśli nic się nie zmieniło — napisz to wprost i nie commituj.
5. Podsumowanie: co doszło, co zmieniło status. Opisy własnymi słowami, po polsku.
6. WYSYŁKA RAPORTU DO REDAKCJI (od 14.09.2026). Piotr nie widzi tej rozmowy ani plików z SendUserFile — dostaje wyłącznie mail, a przez cztery tygodnie nie dostał żadnego, bo tego kroku tu nie było. Zapisz PODSUMOWANIE z poprzedniego punktu do pliku `/tmp/raport-wycofania.md` (zwykły markdown: nagłówki, tabele, listy — dokładnie to, co piszesz w rozmowie), po czym z katalogu repo uruchom:

    python3 scripts/wyslij-raport.py --zadanie wycofania --tytul "Wycofania zestawów — <DD.MM.RRRR>" --plik /tmp/raport-wycofania.md --wstep "<1–2 zdania: co w tym przebiegu najważniejsze>"

Skrypt sam robi PDF (Chromium z kontenera — niczego nie instaluj) i wysyła na adresy z `src/data/raporty_mail.json`. Wysyłaj TYLKO wtedy, gdy przebieg coś zmienił (był commit). Brak zmian = brak maila — inaczej raporty spowszednieją i przestaną być czytane. Jeśli skrypt zwróci błąd, wklej jego dokładny komunikat do podsumowania i nie ponawiaj więcej niż raz. Nigdy nie wysyłaj pustego pliku.
```

## LEGO pon 07:00 — Przypomnienie: zrzut Empiku

- ID: `trig_01BWC5ydHBNVE5Q8usmf62PN` · cron `15 6 * * 1` (UTC) · włączony · świeża sesja na każdy przebieg

```
Cotygodniowa przypominajka dla Marka o ręcznym zrzucie cen Empiku (decyzja 15.09.2026: Empik blokuje ruch serwerowy, więc zrzut robi Marek lokalną przeglądarką przez skill klocki-ceny-empik, a plik lego-empik.json wrzuca do sesji Łowcy Promocji). Ty tylko wysyłasz mail.

Kroki:
1. W katalogu repo: `git fetch origin main && git checkout -q origin/main` (bez npm — skrypt wysyłki to Python bez zależności; PDF robi Chromium z kontenera).
2. Zapisz plik `/tmp/przypomnienie-empik.md` z treścią (uzupełnij datę poniedziałku):

   # Zrzut Empiku — tydzień od <DD.MM.RRRR>

   Pora na cotygodniowy zrzut cen LEGO z empik.com (skill `klocki-ceny-empik`, lokalna przeglądarka).

   1. Zrób zrzut → `lego-empik.json`.
   2. Wrzuć plik do sesji **Łowca Promocji** z notką „import cen + linków Empik”.
   3. Łowca importuje ceny i uruchamia `node scripts/empik-redirects.mjs lego-empik.json --usun-martwe` (deeplinki produktowe zamiast wyszukiwarki).

   Ostatni zrzut wg `src/data/oferty_feed.json`: <najczęstsza wartość pola `data` przy wpisach z `"sklep": "empik"`; jeśli nie ustalisz w minutę, wpisz „nie ustalono”>.

3. Wyślij: `python3 scripts/wyslij-raport.py --zadanie przypomnienie --tytul "Przypomnienie: zrzut Empiku — <DD.MM.RRRR>" --plik /tmp/przypomnienie-empik.md --wstep "Cotygodniowe przypomnienie o ręcznym zrzucie cen Empiku."`
4. Podsumowanie: jedna linijka — wysłano / błąd (wklej komunikat skryptu dosłownie). Nic nie commitujesz, niczego innego nie robisz.
```

## LEGO 04:00 — Zdjęcia → R2 (Planeta Klocków)

- ID: `trig_01EAhU5SKn2GuXxY14WYxNkJ` · cron `30 2 * * *` (UTC) · włączony · świeża sesja na każdy przebieg

```
Codzienne dogranie zdjęć do R2 dla tylkoklocki.pl. Kontekst: worker serwuje /img/ z kubełka R2, a gdy tam nic nie ma, pobiera ze źródła — ale Planeta Klocków odrzuca pobrania z workera, więc każde nowe zdjęcie z Planety (nowość od Scouta, galeria do nowego tekstu) trzeba wgrać do R2 z kontenera. Robi to jeden skrypt z repo; Ty go tylko uruchamiasz i czytasz wynik. Szczegóły: RUNBOOK.md, sekcja „Zdjęcia: Planeta Klocków odrzuca fetch z workera".

Kroki, dokładnie w tej kolejności:
1. W katalogu repo: `git fetch origin main && git checkout -q origin/main`. Jeśli nie ma katalogu node_modules: `npm ci --no-audit --no-fund` (skrypt używa sharp z zależności Astro). Nic nie commitujesz, nic nie pushujesz.
2. `node scripts/r2-obrazy.mjs` — bez flag. Skrypt listuje kubełek, porównuje z danymi i wgrywa brakujące zdjęcia z Planety; zostawia ślad `_stan/r2-obrazy.json` w R2. Zwykle kończy w kilkanaście sekund komunikatem „brakuje w R2: 0". Nie uruchamiaj `--sprawdz` ani `--optymalizuj` (to długie audyty) i nie dopisuj własnych poprawek do skryptu.
3. Jeśli skrypt zakończył się kodem 2 (brak CF_ACCOUNT_ID lub CF_R2_TOKEN w środowisku) albo błędem listowania R2 — wklej dokładny komunikat do podsumowania. Nie wymyślaj obejść: brak zmiennej to sprawa Marka, nie Twoja.
4. Podsumowanie: jedna linijka z wynikiem (ile w R2, ile z Planety w danych, ile brakowało, ile wgrano). Gdy brakowało 0 — to cała odpowiedź. Gdy coś wgrano — wypisz klucze. Gdy były błędy — wklej listę błędów ze skryptu dosłownie.

Nie rób niczego poza tym: żadnych zmian w repo, żadnych innych skryptów, żadnego wysyłania maili.
```

## LEGO wt 05:00 — LEGO.pl katalog (ceny, dostępność, ekskluzywy)

- ID: `trig_012JWbmYwHb59sYazo6K9X33` · cron `30 3 * * 2` (UTC) · włączony · świeża sesja na każdy przebieg

```
Cotygodniowy odczyt listingu lego.pl dla tylkoklocki.pl (decyzja Marka 15.09.2026: LEGO sprawdzamy co najmniej raz w tygodniu). Ty tylko uruchamiasz skrypty z repo w podanej kolejności i czytasz ich wyniki; skrypty same walidują dane (append-only) i przerywają przy błędzie. Kontekst: RUNBOOK.md, sekcja „lego.pl: dostępne przez Firecrawl". Koszt: ok. 75 kredytów Firecrawla (57 stron listingu).

Kroki, dokładnie w tej kolejności — po błędzie w którymkolwiek przerwij i wklej komunikat do podsumowania:
1. W katalogu repo: `git fetch origin main && git checkout -B lego-pl-katalog origin/main`. Jeśli nie ma node_modules: `npm ci --no-audit --no-fund`.
2. Zaciąg listingu (kilkanaście minut, nie przerywaj): `node scripts/firecrawl-legopl.mjs --wyjscie /tmp/legopl-katalog.json --rrp /tmp/legopl-rrp.json`. Skrypt sam przechodzi wszystkie strony listingu (ok. 57 po 22–24 zestawy). Sprawdź w wyniku, że liczba produktów przekracza 1000 — jeśli jest mniejsza (np. listing urwał się po kilku stronach), NIE wczytuj danych, tylko opisz to w podsumowaniu.
3. `node scripts/lego-ceny.mjs /tmp/legopl-katalog.json --sucho` — przeczytaj raport (produkty, ekskluzywne, zmiany). Gdy raport wygląda rozsądnie (zmiany liczone w setkach, nie w tysiącach; liczba „nowo dostepny" poniżej 100), uruchom bez `--sucho`.
4. `node scripts/wczytaj-rrp.mjs /tmp/legopl-rrp.json --zrodlo "lego.pl (Firecrawl)" --sucho`, potem bez `--sucho` (rejestr cen katalogowych jest write-once — konflikty zostają w raporcie, nie nadpisuj ich flagą --nadpisz).
5. `node scripts/lego-redirects.mjs /tmp/legopl-katalog.json --sucho`, potem bez `--sucho` (adresy kart produktu do redirects.json, tylko dopisywanie).
6. `npm run build` — musi przejść. Potem `git add src/data && git commit -m "LEGO.pl: ceny, dostępność i ekskluzywy z listingu <DD.MM.RRRR>" && git push origin lego-pl-katalog:main`. Przy odrzuconym pushu: `git fetch origin main && git rebase origin/main` i push ponownie (do 3 prób).
7. Podsumowanie (5 linijek): liczba produktów z listingu, ekskluzywnych, zmian w feedzie / sety / katalogu, nowych cen RRP, nowych linków; hash commita. Zestawy „spoza katalogu" z raportu lego-ceny.mjs wypisz numerami (dopisze je Scout albo katalog-z-rebrickable.mjs).

Nie rób niczego poza tym: żadnych innych skryptów, żadnej edycji kodu, żadnych maili. Gdy Firecrawl odpowie 402/429 (brak kredytów, limit) — przerwij i wklej komunikat.
```

## LEGO 08:30 — Łowca promocji (runner z pushem)

- ID: `trig_01HUdmCx3Z57H7VcX2uLLuQp` · cron `30 6 * * *` (UTC) · włączony · stała sesja (zmiana promptu = delete + create)

```
Kolejny przebieg Łowcy Promocji. Repo dopięte do tej sesji — zacznij od `git pull origin main`, na końcu commit i push bezpośrednio.

KROK 0 — DIAGNOZA (od 15.09.2026): zaraz po pull uruchom `node scripts/diagnoza.mjs --szybko` (0,2 s, bez sieci). Jeśli brakuje którejś zmiennej środowiska albo plik danych jest starszy, niż powinien, wpisz to w podsumowaniu w pierwszej linii i pracuj dalej na tym, co jest — nie zgaduj, że dostęp „na pewno jest".

DANE — NIE PARSUJ SUROWYCH FEEDÓW. Od 21.08.2026 robi to skrypt w repo:

    python3 scripts/feedy-lego.py

Pobiera feedy Media Expert, Planety Klocków i Allegro, wyciąga z nich WYŁĄCZNIE oferty LEGO i zapisuje /tmp/feedy-lego.json (~4 MB zamiast ~630 MB). Struktura: {"_meta": {...}, "mediaexpert": {"<nr>": {cena, link, zdjecie, dostepny, nazwa}}, "planetaklockow": {...}, "allegro": {...}}. Oczekiwane rzędy wielkości: ME ~750 setów, PK ~1300, Allegro ~7000.

ZASADY PRACY Z WYCIĄGIEM:
- Nie wczytuj pliku w całości do kontekstu — przetwarzaj go skryptami w Pythonie i wypisuj tylko wyniki (liczby, listy dealów).
- `_meta.mediaexpert_feed_updated` to data generowania feedu ME (00:30 CEST). Podaj ją w raporcie; jeśli nie jest z dzisiaj, napisz to wprost.
- `_meta.bledy` — sklep, którego feed się nie pobrał. Wtedy NIE aktualizuj ofert tego sklepu i napisz to w raporcie.
- `_meta.planetaklockow_archiwum_eol` — numery z archiwum PK (wycofane z oferty). Raportuj jako alerty EOL, nie jako deale.
- Skrypt filtruje marki i numery setów (tylko tytuły `^LEGO ... <numer>`), więc puzzle i gry innych marek już nie wchodzą — nie powtarzaj tego filtrowania.

UWAGA — feed PK nie pokazuje cen promocyjnych (akcje typu −7% na koszyk są niewidoczne; NIE mnóż cen przez współczynnik). Dla setów, gdzie cena PK mieści się w 15% od najtańszej znanej oferty, sprawdź cenę na stronie produktu przez WebFetch (URL z pola `link`) i użyj ceny ze strony. Rozbieżności odnotuj w raporcie.

PLIKI w src/data/ (po git pull):
- ceny_baza.json — ceny katalogowe i minima historyczne. Rabaty licz WYŁĄCZNIE od ceny katalogowej. Nowe minimum (niższe, nie równe) → zaktualizuj najnizsza_cena/najnizsza_data/najnizsza_sklep.
- sety.json — zmieniaj tylko ceny i oferty, dopisuj nowe sety wg wzorca, nie usuwaj opisów ani wpisów.
- oferty_feed.json — migawka dla wszystkich setów; wpis: {"zdjecie", "data", "oferty": {"mediaexpert": X, "planetaklockow": Y, "allegro": Z}} + pola "cena"/"sklep" z najniższą (zgodność wstecz). Sety nieobecne w dzisiejszych feedach: usuń oferty/cena/sklep, zostaw zdjecie. NIE RUSZAJ klucza "ceneo" — wypełnia go osobny skrypt (scripts/ceneo-feed.mjs), a wiersz Ceneo jest poza sortowaniem tabeli. NIE RUSZAJ klucza "lego" w ofertach — wypełnia go cotygodniowy zaciąg lego.pl (scripts/lego-ceny.mjs).
- redirects.json — linki afiliacyjne: PK dopisuj do gałęzi planetaklockow (nie nadpisuj istniejących); gałąź allegro ODŚWIEŻAJ przy każdym przebiegu linkami z pola `link` wyciągu Allegro. Gałęzi ceneo i lego nie dotykaj.

ŚWIEŻOŚĆ OFERT: każda oferta z datą faktycznego odczytu; NADPISZ ofertę sklepu dzisiejszą ceną nawet gdy wyższa (koniec promocji musi zniknąć tego samego dnia); minima tylko w ceny_baza.json.

WERYFIKACJA: przed pushem sprawdź 3 sety z dealów gorących przez WebFetch na stronach produktowych (ME/PK działają; allegro.pl blokuje boty — cen Allegro nie weryfikuj na stronie, ufaj feedowi). Różnica >1% → obie wartości w raporcie, użyj ceny ze strony.

KLASYFIKACJA: gorący ≥30% lub nowe minimum; dobry 20–29%; <15% = pseudopromocja. Przy rabacie >60% na Allegro (marketplace) oznacz deal jako „do weryfikacji", nie publikuj jako pewnik.

POSTY DEALOWE (`src/pages/deale/<slug>.md`, reguła ustalona z Markiem 15.09.2026 — wcześniej było tylko „przy wyjątkowych okazjach"): piszesz post, gdy (a) rabat ≥35% od ceny katalogowej na zestawie o RRP ≥300 zł w sklepie (nie marketplace), albo (b) historyczne minimum na zestawie z listy wycofań (`wycofania.json`), albo (c) akcja sklepowa obejmująca ≥5 zestawów LEGO (kod rabatowy, „wyższa szkoła rabatu" itp.). Najwyżej 2 posty tygodniowo — jeśli kandydatów jest więcej, wybierz te o największym rabacie w złotych. Post wg `lego-standard-sprzedazowy` (`.claude/skills/`), z linkiem do huba `/zestaw/<nr>/`, bez daty końca promocji, jeśli sklep jej nie podaje. Nie pisz postu o zestawie, który miał post w ostatnich 14 dniach.

PUBLIKACJA: walidacja JSON-ów (liczby wpisów nie zmalały), commit „Łowca: ceny i oferty <data>", push na main. Konflikt → pull, nanieś ponownie, push. Push niemożliwy → dokładny błąd gita w podsumowaniu + pliki przez SendUserFile.

PODSUMOWANIE: data feedu ME, liczby dopasowań per sklep (z `_meta.liczby`), weryfikacje PK, zmiany cen (ile w górę), deale gorące (cena, rabat, zł/klocek) i gotowe posty dealowe.

BUDŻET: pracuj oszczędnie — jedno uruchomienie skryptu, przetwarzanie w Pythonie, bez powtarzania kroków i bez eksperymentów z parsowaniem. Jeśli skrypt zwróci błąd, napisz jaki i zakończ, zamiast parsować feedy ręcznie.

WYSYŁKA RAPORTU DO REDAKCJI (od 14.09.2026). Piotr nie widzi tej rozmowy ani plików z SendUserFile — dostaje wyłącznie mail, a przez cztery tygodnie nie dostał żadnego, bo tego kroku tu nie było. Zapisz PODSUMOWANIE z poprzedniego punktu do pliku `/tmp/raport-promocje.md` (zwykły markdown: nagłówki, tabele, listy — dokładnie to, co piszesz w rozmowie), po czym z katalogu repo uruchom:

    python3 scripts/wyslij-raport.py --zadanie promocje --tytul "Łowca Promocji — <DD.MM.RRRR>" --plik /tmp/raport-promocje.md --wstep "<1–2 zdania: co w tym przebiegu najważniejsze>"

Skrypt sam robi PDF (Chromium z kontenera — niczego nie instaluj) i wysyła na adresy z `src/data/raporty_mail.json`. Wysyłaj po KAŻDYM przebiegu, także gdy nic się nie zmieniło — wtedy raport ma to powiedzieć wprost. Jeśli skrypt zwróci błąd, wklej jego dokładny komunikat do podsumowania i nie ponawiaj więcej niż raz. Nigdy nie wysyłaj pustego pliku.
```

## LEGO 09:30 — Alerty cen (Obserwuj zestaw)

- ID: `trig_01BLKenDsuWfNpJ4iFdCN9Vc` · cron `30 7 * * *` (UTC) · włączony · świeża sesja na każdy przebieg

```
Codzienna wysyłka alertów cenowych „Obserwuj zestaw" dla tylkoklocki.pl. Czytelnicy zapisują się na hubie zestawu, zapisy leżą w R2, a ten przebieg porównuje dzisiejsze ceny (po porannym Łowcy) z progiem i wysyła maile przez Resend. Wszystko robi jeden skrypt; Ty go uruchamiasz i czytasz wynik. Kontekst: RUNBOOK.md, sekcja „Alerty cenowe (Obserwuj zestaw)".

Kroki:
1. W katalogu repo: `git fetch origin main && git checkout -q origin/main` (skrypt nie ma zależności npm). Nic nie commitujesz, nic nie pushujesz.
2. `node scripts/alerty-cen.mjs --sucho` — przeczytaj, ile alertów skrypt chce wysłać. Jeśli więcej niż 200 albo lista wygląda podejrzanie (jeden adres wiele razy, ceny 0 zł) — NIE uruchamiaj wysyłki, opisz to w podsumowaniu.
3. `node scripts/alerty-cen.mjs` — wysyłka. Kod wyjścia 2 = brak zmiennej środowiska (CF_ACCOUNT_ID, CF_R2_TOKEN, RESEND_API_KEY): wklej komunikat, nie szukaj obejść.
4. Podsumowanie: jedna linijka ze skryptu (zapisów / potwierdzonych / wysłanych / błędów). Gdy były błędy — wklej je dosłownie.

Nie rób niczego poza tym: żadnych zmian w repo, żadnych innych skryptów, żadnych maili poza tymi, które wysyła skrypt.
```
