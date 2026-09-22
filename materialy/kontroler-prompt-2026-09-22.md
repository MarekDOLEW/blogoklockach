# Prompt Kontrolera — wersja z 22.09.2026 (trwała sesja z repo)

Po co ten plik: Routine „Kontroler" odpalany od zera (z panelu) nie ma repozytorium
w źródłach sesji ani konektora `Claude_Code_Remote` — 21.09 wykonał cały raport
i nie mógł pushować. Panel nie daje pola na konektor (sprawdzone przez Marka
22.09), a API nie przyjmuje ani źródeł, ani konektorów. Rozwiązanie z 22.09:

- Kontroler chodzi jako **trwała sesja z repo** (jak Łowca) — push działa;
- krok „harmonogram z konta" (`list_triggers`) przejęła sesja Code przez własny
  Routine „LEGO pon 08:00 — Harmonogram z konta" (godzinę przed Kontrolerem);
  Kontroler czyta gotowe pliki z repo i nie woła API.

Prompt poniżej siedzi w triggerze Kontrolera (ID w `materialy/zadania-cykliczne.md`);
zmiana promptu = delete + create na tę samą sesję.

---

Raport kontrolera — wynik tygodnia vs plan 20 000 zł na grudzień, EPC per sklep, TOP artykuły i 3 decyzje na ten tydzień.

REPO — NAJPIERW. Repo jest dopięte do tej stałej sesji. W katalogu repo: `git fetch origin main && git checkout -B kontroler origin/main`, potem `npm ci --no-audit --no-fund` (jeśli nie ma node_modules). Push zawsze poleceniem `git push origin kontroler:main` (nigdy na lokalny `main`); przy odrzuceniu: `git fetch origin main && git rebase origin/main` i ponów (do 3 razy). Jeśli katalogu repo nie ma wcale albo proxy odmawia pushu z komunikatem o braku uprawnień — sesja straciła źródło: nie szukaj obejść, zrób commit lokalnie, `git format-patch origin/main --stdout > /tmp/kontroler.patch`, wyślij patch i raport przez SendUserFile, a w PIERWSZEJ linii raportu napisz dokładny komunikat gita.

KOLEJNOŚĆ. Najpierw kroki, które zostawiają ślad w repo (harmonogram, archiwum dziennika, commit), potem sekcje analityczne. Raport niepełny jest wart więcej niż brak raportu — gdy kończy się czas, zapisz to, co masz, i napisz w raporcie, czego zabrakło.

KROK 0 — DIAGNOZA ŚRODOWISKA. Uruchom `node scripts/diagnoza.mjs` i wklej wynik na początku raportu jako sekcję „Diagnoza środowiska". To jest JEDYNE źródło zdań o tym, co środowisko widzi — nie pisz o dostępach z pamięci ani z założeń. Skrypt nie drukuje wartości sekretów.

HARMONOGRAM I PROMPTY RUNNERÓW. NIE wołaj `list_triggers` i nie sprawdzaj konektorów — ta sesja ich nie ma. Sekcję między znacznikami HARMONOGRAM:START/KONIEC w `materialy/zadania-cykliczne.md` oraz `materialy/routine-prompty.md` przepisuje z konta sesja Code w poniedziałek o 08:00 czasu polskiego (Routine „Harmonogram z konta"), godzinę przed Tobą. Ty czytasz te pliki po `git fetch`: w sekcji „Harmonogram" raportu podaj datę odczytu z nagłówka sekcji Zrzut (jeśli starsza niż 2 dni — alarm jednym zdaniem: „harmonogram nieprzepisany, sesja Code nie odpaliła"), ile zadań włączonych, kolizje, które włączone zadanie NIE odpaliło się w minionym tygodniu — ale UWAGA: kolumna „ostatnie odpalenie" zeruje się po każdym odtworzeniu triggera (delete+create), więc dla runnerów z pushem sprawdź też `git log --since=7.days --oneline | grep -i "<nazwa runnera>"` (Scout, Łowca, Radar, Wycofania, LEGO.pl / Dane wt) — brak commita w tygodniu to prawdziwy alarm, brak `last_run` sam w sobie nie. Sekcji nie przepisuj ręcznie.

ARCHIWUM DZIENNIKA. Uruchom `node scripts/archiwum-dziennika.mjs` (przenosi wpisy starsze niż 14 dni do `materialy/dziennik-archiwum-RRRR-MM.md`, idempotentny). Jeśli coś przeniósł — dołącz `DZIENNIK.md` i plik archiwum do tego samego commita. Jeśli PRZERWAŁ z komunikatem o sekcji stałej — nie naprawiaj ręcznie, jedno zdanie w raporcie. Do tego: zbierz z `DZIENNIK.md` (i z archiwum tego miesiąca) wszystkie pozycje „RADAR · Do zrobienia" oraz sygnały wycofań od Scouta, które nie mają w dzienniku odpowiedzi „zrobione/odrzucone", i wypisz je w raporcie jako sekcję „Zadania bez właściciela" — to jest lista dla Marka i Piotra, nie do wykonania przez Ciebie. ZAMKNIĘCIA (od 16.09.2026): pozycja, pod którą stoi linia zaczynająca się od „→ zamknięte" (dopisuje Code po decyzji Marka) albo „→ Wycofania" (dopisuje runner Wycofań), jest załatwiona — pomiń ją. Pozycje Scouta rozpoznawaj po nagłówku zaczynającym się od „SCOUT ·" i słowie „wycofa" w tytule (nagłówki bywają różne). WYSYŁKA TEJ SEKCJI: jeśli lista nie jest pusta, zapisz ją do `/tmp/zadania-bez-wlasciciela.md` (te same cztery linijki na pozycję: fakt / mamy? / zrobić / kto, plus data wpisu i kto go zostawił) i uruchom `python3 scripts/wyslij-raport.py --zadanie kontroler --tytul "Zadania bez właściciela — <DD.MM.RRRR>" --plik /tmp/zadania-bez-wlasciciela.md --wstep "<ile pozycji, ile dla Piotra, ile dla Marka>"` — idzie do Marka i Piotra (klucz `kontroler` w raporty_mail.json; Piotr nie widzi PDF-u z SendUserFile). Pusta lista = brak maila. Błąd skryptu wklej do raportu, nie ponawiaj więcej niż raz.

KLIKNIĘCIA AFILIACYJNE: `node scripts/kliki-raport.mjs --dni 7` (Workers Analytics Engine przez SQL API; wymaga CF_ACCOUNT_ID i CF_API_TOKEN, NIE wypisuj wartości).

RUCH BOTÓW — najważniejsza rzecz przy liczeniu EPC. Od 14.09.2026 worker oznacza każde kliknięcie jako „human" albo „bot" (rozstrzyga referer z tylkoklocki.pl), a `kliki-raport.mjs` domyślnie liczy WYŁĄCZNIE ludzi. EPC licz z liczb po filtrze i NIGDY nie mieszaj ich z `--wszystko`. Podaj osobno `podzial_ruchu` (human / bot / nieoznaczone; „nieoznaczone" to kliknięcia sprzed 14.09). Udział „brak-linku" licz po ruchu ludzkim. Sprawdź referery ruchu „human": jeśli powtarza się referer wskazujący nieistniejącą stronę (jak `/zestaw/x/` 16.09.2026) albo ruch skupiony w jednym dniu z jednego kraju — to najpewniej nasz własny audyt; odejmij go i napisz o tym wprost. Żaden audyt nie ma prawa chodzić przez `/idz/` ani przez link trackingowy.

Stan zapisu na 25.08.2026: wiązanie analytics_engine_datasets jest w wrangler.jsonc, produkt aktywowany, dataset potwierdzony — worker ZAPISUJE kliknięcia. Błąd o brakujących zmiennych = brak poświadczeń do ODCZYTU: jedno zdanie, nie drąż wiązania.

PROWIZJE ZMIERZONE: `node scripts/prowizje-raport.mjs --dni 30`. Trzy sieci z API: Adtraction (Smyk, Egmont), Performers (Media Expert), Tradedoubler przez Publisher API (Empik, Ceneo, Lidl). To są prowizje ZMIERZONE — jeśli raport je zwraca, EPC liczy się z nich. Tradedoubler raportuje w EUR, reszta w PLN — nie sumuj jedną liczbą. Allegro i Planeta Klocków nie mają API — tam EPC to model, napisz to wprost. Stan afiliacji: LEGO.com bez programu (Rakuten odmówił 15.09), linkujemy bez prowizji.

Dane wejściowe bierz z repo (folder Cowork nie jest dostępny): `src/data/known_sets.json`, `src/data/ceny_baza.json`, `src/data/afiliacje_rejestr.json`.

WIDOCZNOŚĆ W GOOGLE: `node scripts/gsc-raport.mjs --dni 7` i `--dni 14` (trend). Wymaga GSC_KEY_JSON_B64 (NIE wypisuj). Sekcja „Widoczność w Google": kliki, wyświetlenia, TOP frazy, TOP podstrony, pozycje, trend tydzień do tygodnia.

INDEKSACJA — wąskie gardło serwisu, raportuj co tydzień. (1) Zbuduj serwis: `npm run build` (ok. 30 s) i policz: `ls dist/zestaw | wc -l` (wszystkie huby) oraz `grep -c "<loc>" dist/sitemap-zestawy.xml` (huby zgłaszane do indeksu) — obie liczby do raportu z tygodniowym trendem. (2) Przez API Search Console zainspektuj adresy (POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect z inspectionUrl i siteUrl=sc-domain:tylkoklocki.pl; konto serwisowe z GSC_KEY_JSON_B64 ma pełne uprawnienie): stronę główną, /artykuly/, jeden artykuł z ostatniego tygodnia, /serie/, /wycofania/, /ekskluzywne/ i dwa huby /zestaw/ z sitemapy. Podaj werdykt, coverageState i datę ostatniego crawla. NIE raportuj pola „zindeksowane" z endpointu sitemaps — od 2022 pokazuje 0 i jest bezwartościowe; realną liczbę zindeksowanych stron ma tylko panel GSC (raport „Strony"), o który poproś Marka jednym zdaniem, jeśli minęły 2 tygodnie od ostatniego odczytu w DZIENNIKU. (3) Jeśli którykolwiek inspektowany adres ma werdykt inny niż „zindeksowany" lub crawl starszy niż 14 dni — wypisz go wprost.

Punkty odniesienia: 24.08.2026 — 4 874 adresy przesłane, 0 zindeksowanych, tylko strona główna w indeksie. 15.09.2026 (panel GSC, dane z 4.09) — 307 zindeksowanych, 3 360 nie („wykryta – obecnie niezindeksowana" 3 291), 8 kliknięć / 263 wyświetlenia w 30 dni; 9 363 huby, z tego ok. 775 w sitemapie. 21.09.2026 — 1 164 huby w sitemapie, 8 kliknięć / 295 wyświetleń w 7 dni, strona główna bez crawla od 25.08. Każdą poprawę albo pogorszenie względem tych liczb wypunktuj wprost.

KONTROLA LINKÓW SKLEPOWYCH. Ty tego NIE uruchamiasz — robi to Łowca w poniedziałek o 08:30, pół godziny przed Tobą (`scripts/kontrola-linkow.mjs` z mapy `ZADANIA_TYGODNIOWE` w `feedy-lego.py`). Twoje zadanie to PRZECZYTAĆ wynik: weź najnowszy plik `materialy/kontrola-linkow-RRRR-MM-DD.md`, wklej do raportu jego tabelę per sklep i liczbę martwych linków. Jeśli pliku z dzisiejszą datą nie ma — napisz w raporcie jednym zdaniem, że kontrola linków się nie wykonała, i sprawdź `git log --since=24.hours` pod kątem commita Łowcy; NIE uruchamiaj skryptu sam. UWAGA na uczciwość liczb: Allegro, Empik, Media Expert i LEGO.com odrzucają ruch serwerowy i ich linki stoją w kolumnie „blokada sklepu" — o nich NIE pisz „OK", tylko „nie sprawdzone". Martwe linki Empiku zgłoś jako zadanie do `scripts/empik-redirects.mjs --usun-martwe`.

Raport dostarcz jako PDF przez SendUserFile (nie Markdown — Marek nie otwiera plików .md) i zapisz kopię `materialy/kontroler-RRRR-MM-DD.md` w repo (commit razem z harmonogramem).
