# Prompty Routines LEGO — kopia z konta

*Plik w całości generuje `scripts/harmonogram-z-konta.mjs` z odpowiedzi `list_triggers`;
odczyt z konta: 15.09.2026, 15:08 (CEST). Nie edytuj ręcznie — źródłem prawdy
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

REPO — NAJPIERW. Sesja powinna mieć repo podpięte z panelu; jeśli katalogu `blogoklockach` nie ma, sklonuj: `cd /home/user && git clone --depth 1 https://github.com/MarekDOLEW/blogoklockach.git` (gdy jest zmienna GH_PUSH_TOKEN — przez `https://x-access-token:${GH_PUSH_TOKEN}@github.com/MarekDOLEW/blogoklockach.git`). W repo: `git fetch origin main && git checkout -B kontroler origin/main`, potem `npm ci --no-audit --no-fund`. Push zawsze poleceniem `git push origin kontroler:main` (nigdy na lokalny `main`); przy odrzuceniu: `git fetch origin main && git rebase origin/main` i ponów (do 3 razy); jeśli dalej nie wchodzi — wyślij zmienione pliki przez SendUserFile i napisz o tym w raporcie.

KROK 0 — DIAGNOZA ŚRODOWISKA. Uruchom `node scripts/diagnoza.mjs` i wklej wynik na początku raportu jako sekcję „Diagnoza środowiska". To jest JEDYNE źródło zdań o tym, co środowisko widzi — nie pisz o dostępach z pamięci ani z założeń. Skrypt nie drukuje wartości sekretów.

HARMONOGRAM I PROMPTY RUNNERÓW. Wywołaj narzędzie `list_triggers` (konektor Claude_Code_Remote, limit 30), zapisz surową odpowiedź do pliku `/tmp/routines.json` (NIE do repo — zawiera ID sesji i treść promptów) i uruchom `node scripts/harmonogram-z-konta.mjs /tmp/routines.json`. Skrypt przepisuje DWA pliki: sekcję między znacznikami HARMONOGRAM:START/KONIEC w `materialy/zadania-cykliczne.md` oraz cały `materialy/routine-prompty.md` (kopia promptów z konta — dzięki temu diff w git pokazuje, kto i kiedy zmienił prompt). Oba dołącz do commita: `git add materialy/zadania-cykliczne.md materialy/routine-prompty.md`. Reszty tych dokumentów nie tykaj. W raporcie sekcja „Harmonogram": ile zadań włączonych; kolizje; które włączone zadanie NIE odpaliło się w minionym tygodniu — ale UWAGA: kolumna „ostatnie odpalenie" zeruje się po każdym odtworzeniu triggera (delete+create), więc dla runnerów z pushem sprawdź też `git log --since=7.days --oneline | grep -i "<nazwa runnera>"` (Scout, Łowca, Radar, Wycofania, LEGO.pl) — brak commita w tygodniu to prawdziwy alarm, brak `last_run` sam w sobie nie. Jeśli `list_triggers` nie odpowie — jedno zdanie i licz resztę normalnie. NIE przepisuj sekcji ręcznie.

ARCHIWUM DZIENNIKA. Uruchom `node scripts/archiwum-dziennika.mjs` (przenosi wpisy starsze niż 14 dni do `materialy/dziennik-archiwum-RRRR-MM.md`, idempotentny). Jeśli coś przeniósł — dołącz `DZIENNIK.md` i plik archiwum do tego samego commita. Jeśli PRZERWAŁ z komunikatem o sekcji stałej — nie naprawiaj ręcznie, jedno zdanie w raporcie. Do tego: zbierz z `DZIENNIK.md` (i z archiwum tego miesiąca) wszystkie pozycje „RADAR · Do zrobienia" oraz sygnały wycofań od Scouta, które nie mają w dzienniku odpowiedzi „zrobione/odrzucone", i wypisz je w raporcie jako sekcję „Zadania bez właściciela" — to jest lista dla Marka i Piotra, nie do wykonania przez Ciebie.

KLIKNIĘCIA AFILIACYJNE: `node scripts/kliki-raport.mjs --dni 7` (Workers Analytics Engine przez SQL API; wymaga CF_ACCOUNT_ID i CF_API_TOKEN, NIE wypisuj wartości).

RUCH BOTÓW — najważniejsza rzecz przy liczeniu EPC. Od 14.09.2026 worker oznacza każde kliknięcie jako „human" albo „bot" (rozstrzyga referer z tylkoklocki.pl), a `kliki-raport.mjs` domyślnie liczy WYŁĄCZNIE ludzi. EPC licz z liczb po filtrze i NIGDY nie mieszaj ich z `--wszystko`. Podaj osobno `podzial_ruchu` (human / bot / nieoznaczone; „nieoznaczone" to kliknięcia sprzed 14.09). Udział „brak-linku" licz po ruchu ludzkim.

Stan zapisu na 25.08.2026: wiązanie analytics_engine_datasets jest w wrangler.jsonc, produkt aktywowany, dataset potwierdzony — worker ZAPISUJE kliknięcia. Błąd o brakujących zmiennych = brak poświadczeń do ODCZYTU: jedno zdanie, nie drąż wiązania.

PROWIZJE ZMIERZONE: `node scripts/prowizje-raport.mjs --dni 30`. Trzy sieci z API: Adtraction (Smyk, Egmont), Performers (Media Expert), Tradedoubler przez Publisher API (Empik, Ceneo). To są prowizje ZMIERZONE — jeśli raport je zwraca, EPC liczy się z nich. Tradedoubler raportuje w EUR, reszta w PLN — nie sumuj jedną liczbą. Allegro i Planeta Klocków nie mają API — tam EPC to model, napisz to wprost. Stan afiliacji: LEGO.com bez programu (Rakuten odmówił 15.09), linkujemy bez prowizji.

Dane wejściowe bierz z repo (folder Cowork nie jest dostępny): `src/data/known_sets.json`, `src/data/ceny_baza.json`, `src/data/afiliacje_rejestr.json`.

WIDOCZNOŚĆ W GOOGLE: `node scripts/gsc-raport.mjs --dni 7` i `--dni 14` (trend). Wymaga GSC_KEY_JSON_B64 (NIE wypisuj). Sekcja „Widoczność w Google": kliki, wyświetlenia, TOP frazy, TOP podstrony, pozycje, trend tydzień do tygodnia.

INDEKSACJA — wąskie gardło serwisu, raportuj co tydzień. (1) Zbuduj serwis: `npm run build` (ok. 30 s) i policz: `ls dist/zestaw | wc -l` (wszystkie huby) oraz `grep -c "<loc>" dist/sitemap-zestawy.xml` (huby zgłaszane do indeksu) — obie liczby do raportu z tygodniowym trendem. (2) Przez API Search Console zainspektuj adresy (POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect z inspectionUrl i siteUrl=sc-domain:tylkoklocki.pl; konto serwisowe z GSC_KEY_JSON_B64 ma pełne uprawnienie): stronę główną, /artykuly/, jeden artykuł z ostatniego tygodnia, /serie/, /wycofania/, /ekskluzywne/ i dwa huby /zestaw/ z sitemapy. Podaj werdykt, coverageState i datę ostatniego crawla. NIE raportuj pola „zindeksowane" z endpointu sitemaps — od 2022 pokazuje 0 i jest bezwartościowe; realną liczbę zindeksowanych stron ma tylko panel GSC (raport „Strony"), o który poproś Marka jednym zdaniem, jeśli minęły 2 tygodnie od ostatniego odczytu w DZIENNIKU. (3) Jeśli którykolwiek inspektowany adres ma werdykt inny niż „zindeksowany" lub crawl starszy niż 14 dni — wypisz go wprost.

Punkty odniesienia: 24.08.2026 — 4 874 adresy przesłane, 0 zindeksowanych, tylko strona główna w indeksie. 15.09.2026 (panel GSC, dane z 4.09) — 307 zindeksowanych, 3 360 nie („wykryta – obecnie niezindeksowana" 3 291), 8 kliknięć / 263 wyświetlenia w 30 dni; 9 363 huby, z tego ok. 775 w sitemapie. Każdą poprawę albo pogorszenie względem tych liczb wypunktuj wprost.

Raport dostarcz jako PDF przez SendUserFile (nie Markdown — Marek nie otwiera plików .md) i zapisz kopię `materialy/kontroler-RRRR-MM-DD.md` w repo (commit razem z harmonogramem).
```

## LEGO pon 06:10 — Wycofania (runner z pushem)

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

## LEGO pon 08:15 — Przypomnienie: zrzut Empiku

- ID: `trig_01BWC5ydHBNVE5Q8usmf62PN` · cron `15 6 * * 1` (UTC) · włączony · świeża sesja na każdy przebieg

```
Cotygodniowa przypominajka dla Marka o ręcznym zrzucie cen Empiku (decyzja 15.09.2026: Empik blokuje ruch serwerowy, więc zrzut robi Marek lokalną przeglądarką przez skill klocki-ceny-empik, a plik lego-empik.json wrzuca do sesji Łowcy Promocji). Ty tylko wysyłasz mail.

Kroki:
1. Jeśli katalogu `blogoklockach` nie ma: `cd /home/user && git clone --depth 1 https://github.com/MarekDOLEW/blogoklockach.git`. W repo: `git fetch origin main && git checkout -B empik origin/main` (bez npm — skrypt wysyłki to Python bez zależności; PDF robi Chromium z kontenera). Wymaga RESEND_API_KEY — gdy brak, wklej komunikat i zakończ.
2. Zapisz plik `/tmp/przypomnienie-empik.md` z treścią (uzupełnij datę poniedziałku):

   # Zrzut Empiku — tydzień od <DD.MM.RRRR>

   Pora na cotygodniowy zrzut cen LEGO z empik.com (skill `klocki-ceny-empik`, lokalna przeglądarka).

   1. Zrób zrzut → `lego-empik.json`.
   2. Wrzuć plik do sesji **Łowca Promocji** z notką „import cen + linków Empik”.
   3. Łowca importuje ceny i uruchamia `node scripts/empik-redirects.mjs lego-empik.json --usun-martwe` (deeplinki produktowe zamiast wyszukiwarki). UWAGA: dziś w redirects.json nie ma w ogóle klucza `empik` — 3 968 cen prowadzi na wyszukiwarkę; pierwszy zrzut z linkami to najważniejsza rzecz do zrobienia dla przychodu.

   Ostatni zrzut wg `src/data/oferty_feed.json`: <najczęstsza wartość pola `daty.empik` albo `data` przy wpisach z `"sklep": "empik"`; jeśli nie ustalisz w minutę, wpisz „nie ustalono”>.

3. Wyślij: `python3 scripts/wyslij-raport.py --zadanie przypomnienie --tytul "Przypomnienie: zrzut Empiku — <DD.MM.RRRR>" --plik /tmp/przypomnienie-empik.md --wstep "Cotygodniowe przypomnienie o ręcznym zrzucie cen Empiku."`
4. Podsumowanie: jedna linijka — wysłano / błąd (wklej komunikat skryptu dosłownie). Nic nie commitujesz, niczego innego nie robisz.
```

## LEGO 04:30 — Zdjęcia → R2 (Planeta Klocków)

- ID: `trig_01EAhU5SKn2GuXxY14WYxNkJ` · cron `30 2 * * *` (UTC) · włączony · świeża sesja na każdy przebieg

```
``` Codzienne dogranie zdjęć do R2 dla tylkoklocki.pl. Kontekst: worker serwuje /img/ z kubełka R2,a gdy tam nic nie ma, pobiera ze źródła — ale Planeta Klocków odrzuca pobrania z workera, więckażde nowe zdjęcie z Planety (nowość od Scouta, galeria do nowego tekstu) trzeba wgrać do R2 zkontenera. Robi to jeden skrypt z repo; Ty go tylko uruchamiasz i czytasz wynik. Szczegóły:RUNBOOK.md, sekcja „Zdjęcia: Planeta Klocków odrzuca fetch z workera".
Kroki, dokładnie w tej kolejności: 1. Jeśli katalogu
blogoklockach
nie ma:
cd /home/user && gitclone --depth 1 https://github.com/MarekDOLEW/blogoklockach.git
. W repo:
git fetch origin main&& git checkout -B zdjecia origin/main
. Jeśli nie ma katalogu node_modules:
npm ci --no-audit --
no-fund
(skrypt używa sharp — od 15.09 jest zadeklarowaną zależnością w package.json). Nic niecommitujesz, nic nie pushujesz. 2.
node scripts/r2-obrazy.mjs
— bez fl ag. Skrypt listuje kubełek,porównuje z danymi i wgrywa brakujące zdjęcia z Planety; zostawia ślad
_stan/r2-obrazy.json
wR2. Zwykle kończy w kilkanaście sekund komunikatem „brakuje w R2: 0". Nie uruchamiaj
--sprawdz
ani
--optymalizuj
(to długie audyty) i nie dopisuj własnych poprawek do skryptu. 3. Jeśli skryptzakończył się kodem 2 (brak CF_ACCOUNT_ID lub CF_R2_TOKEN w środowisku), błędem importusharp albo błędem listowania R2 — wklej dokładny komunikat do podsumowania. Nie wymyślajobejść. 4. Podsumowanie: jedna linijka z wynikiem (ile w R2, ile z Planety w danych, ile brakowało,ile wgrano). Gdy brakowało 0 — to cała odpowiedź. Gdy coś wgrano — wypisz klucze. Gdy byłybłędy — wklej listę błędów ze skryptu dosłownie.
Nie rób niczego poza tym: żadnych zmian w repo, żadnych innych skryptów, żadnego wysyłaniamaili. ```
```

## LEGO wt 05:30 — LEGO.pl katalog (ceny, dostępność, ekskluzywy)

- ID: `trig_012JWbmYwHb59sYazo6K9X33` · cron `30 3 * * 2` (UTC) · włączony · świeża sesja na każdy przebieg

```
Cotygodniowy odczyt listingu lego.pl dla tylkoklocki.pl (decyzja Marka 15.09.2026: LEGO sprawdzamy co najmniej raz w tygodniu) plus tygodniowe odświeżenie cen Ceneo. Ty tylko uruchamiasz skrypty z repo w podanej kolejności i czytasz ich wyniki; skrypty same walidują dane (append-only) i przerywają przy błędzie. Kontekst: RUNBOOK.md, sekcja „lego.pl: dostępne przez Firecrawl". Koszt: ok. 75 kredytów Firecrawla (57 stron listingu).

Kroki, dokładnie w tej kolejności — po błędzie w którymkolwiek przerwij i wklej komunikat do podsumowania:
0. REPO I ŚRODOWISKO. Jeśli katalogu `blogoklockach` nie ma: `cd /home/user && git clone --depth 1 https://github.com/MarekDOLEW/blogoklockach.git`. W repo: `git fetch origin main && git checkout -B lego-pl-katalog origin/main`; jeśli nie ma node_modules: `npm ci --no-audit --no-fund`. Potem `node scripts/diagnoza.mjs --szybko` — ten przebieg wymaga zmiennych FIRECRAWL_KEY (listing) i TD_TOKEN (Ceneo). Brak którejś: nie szukaj obejść, wpisz to do podsumowania i pomiń zależny krok (bez FIRECRAWL_KEY pomijasz kroki 1–5, bez TD_TOKEN pomijasz krok 6).
1. Zaciąg listingu (kilkanaście minut, nie przerywaj): `node scripts/firecrawl-legopl.mjs --wyjscie /tmp/legopl-katalog.json --rrp /tmp/legopl-rrp.json`. Skrypt sam przechodzi wszystkie strony listingu (ok. 57 po 22–24 pozycje). BRAMKA: w podsumowaniu skryptu sprawdź liczbę ZESTAWÓW (nie pozycji — akcesoria to ok. 400 dodatkowych). Jeśli zestawów jest mniej niż 800 (15.09 było 936) — listing się urwał; NIE wczytuj danych, opisz to w podsumowaniu i przejdź do kroku 6.
2. `node scripts/lego-ceny.mjs /tmp/legopl-katalog.json --sucho` — przeczytaj raport (produkty, ekskluzywne, zmiany, ile zestawów przechodzi na EOL po 14 dniach nieobecności, rozbieżności ekskluzywów). Gdy raport wygląda rozsądnie (zmiany w setkach, nie tysiącach; „nowo dostepny" poniżej 100; „na EOL" poniżej 150), uruchom bez `--sucho`. Jeśli „na EOL" jest większe — listing był niepełny mimo bramki: NIE wczytuj, opisz.
3. `node scripts/wczytaj-rrp.mjs /tmp/legopl-rrp.json --zrodlo "lego.pl (Firecrawl)" --sucho`, potem bez `--sucho` (rejestr cen katalogowych jest write-once — konflikty zostają w raporcie, nie używaj --nadpisz).
4. `node scripts/lego-redirects.mjs /tmp/legopl-katalog.json --sucho`, potem bez `--sucho` (adresy kart produktu, tylko dopisywanie).
5. Zestawy „spoza katalogu" z raportu lego-ceny.mjs: `node scripts/katalog-z-rebrickable.mjs --sucho`; jeśli skrypt proponuje dopisać zestawy (nie akcesoria 5xxxxxx) — uruchom bez `--sucho`. To jedyny mechanizm, który daje hub zestawom widocznym na lego.pl, a nieznanym katalogowi.
6. Ceny Ceneo (tygodniowo, wymaga TD_TOKEN): `node scripts/ceneo-feed.mjs`. Skrypt dopisuje klucz `ceneo` do feedu z datą per sklep i linki do redirects.json; nic nie kasuje.
7. `node scripts/generuj-obrazy.mjs` (odświeża obrazy.json dla nowych zestawów — bez tego Routine Zdjęcia → R2 ich nie dogra), potem `npm run build` — musi przejść. Potem `git add src/data && git commit -m "LEGO.pl + Ceneo: ceny, dostępność i ekskluzywy z listingu <DD.MM.RRRR>" && git push origin lego-pl-katalog:main`. Przy odrzuconym pushu: `git fetch origin main && git rebase origin/main` i push ponownie (do 3 prób); jeśli rebase zgłosi konflikt w src/data — NIE rozwiązuj go ręcznie, przerwij (`git rebase --abort`) i wklej komunikat do podsumowania.
8. Podsumowanie (do 8 linijek): liczba zestawów z listingu, ekskluzywnych, zmian w feedzie / sety / katalogu, zestawów przestawionych na EOL (numery), nowych cen RRP, nowych linków, dopisanych z Rebrickable, cen Ceneo; hash commita. Rozbieżności ekskluzywów (flaga w sety.json bez etykiety na listingu) wypisz numerami — to lista do ręcznego sprawdzenia dla Marka.

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
``` Codzienna wysyłka alertów cenowych „Obserwuj zestaw" dla tylkoklocki.pl. Czytelnicy zapisująsię na hubie zestawu, zapisy leżą w R2, a ten przebieg porównuje dzisiejsze ceny (po porannymŁowcy) z progiem i wysyła maile przez Resend. Wszystko robi jeden skrypt; Ty go uruchamiasz iczytasz wynik. Kontekst: RUNBOOK.md, sekcja „Alerty cenowe (Obserwuj zestaw)".
Kroki: 1. Jeśli katalogu
blogoklockach
nie ma:
cd /home/user && git clone --depth 1https://github.com/MarekDOLEW/blogoklockach.git
. W repo:
git fetch origin main && git checkout-B alerty origin/main
(skrypt nie ma zależności npm). Nic nie commitujesz, nic nie pushujesz. 2.Sprawdź, czy Łowca dziś pushnął:
git log -1 --format="%ci %s" --grep="Łowca"
. Jeśli data nie jestdzisiejsza — ceny w repo są wczorajsze; skrypt i tak pominie oferty starsze niż 2 dni, ale napisz to wpodsumowaniu jednym zdaniem. 3.
node scripts/alerty-cen.mjs --sucho
— przeczytaj, ile alertówskrypt chce wysłać. Jeśli więcej niż 200 albo lista wygląda podejrzanie (jeden adres wiele razy, ceny0 zł) — NIE uruchamiaj wysyłki, opisz to w podsumowaniu. 4.
node scripts/alerty-cen.mjs
—wysyłka. Kod wyjścia 2 = brak zmiennej środowiska (CF_ACCOUNT_ID, CF_R2_TOKEN,RESEND_API_KEY): wklej komunikat, nie szukaj obejść. 5. Podsumowanie: jedna linijka ze skryptu(zapisów / potwierdzonych / wysłanych / błędów). Gdy były błędy — wklej je dosłownie.
Nie rób niczego poza tym: żadnych zmian w repo, żadnych innych skryptów, żadnych maili pozatymi, które wysyła skrypt. ```
```
