# Dziennik — archiwum 2026-11

Wpisy przeniesione z `DZIENNIK.md` po przekroczeniu progu wieku.
Treść jest niezmieniona. Bieżące wpisy i ustalenia trwałe: `DZIENNIK.md`.

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

## 2026-11-01 · CODE · Karty P07, paczki 26–28: wgrana tylko 28

**Paczka 28 wgrana: 25 nowych kart (21245–76961), rejestr ma teraz 1749 kart, wszystkie 25 hubów indeksowalnych.** Paczki 26 i 27 (50 zestawów, m.in. 10312, 10314, 71037–71039, 76995) **pominięte**: każdy z tych zestawów miał już pełną kartę (2–4 akapity, 5–6 FAQ, hub w indeksie). Nowe teksty to inne, krótsze wersje (ok. 600–1400 zn. wobec 760–1970 zn. obecnych), więc ich nie nadpisywaliśmy.
**Dla drugiej strony:** lista „noindex”, z której Piotr wybiera zestawy, jest nieaktualna — przed kolejną paczką warto dać mu świeżą listę zestawów bez karty. Gdyby nowe wersje 26–27 miały jednak zastąpić stare, wystarczy `import-karty.py <zip> --nadpisz --krotkie` (decyzja Marka).

## 2026-11-08 · Code · Maile do Piotra wysłane; Performers czeka

Wysłane do Piotra: odpowiedź o teście 404 i nowościach oraz lista poprawek w kartach/FAQ po audycie (stary szkic z autolinkami Gmaila usunięty). Mail do Performers (termin zatwierdzania 11 konwersji pending od 03.09, 2/3 kliknięć) — decyzja Marka 08.11: czekamy, nie wysyłamy.

## 2026-11-08 · Code · Piotr: korekta testu z 404

Claude Piotra zgłosił, że test z 06.11 nie działa — każdy `/zestaw/<nr>/` się otwiera (huby bez treści mają noindex). Prawda: hub powstaje dla każdego numeru z katalogu; ostrzeżenie „BRAK HUBA” w `import-karty.py` było nieaktualne — poprawione (ostrzega tylko o numerze spoza katalogu i sety.json). Nowa zasada: Piotr opisuje tylko zestawy z naszych list (01.11: 444, partie 38–55), reszty rejestru (~6900) nie. Odpowiedź do Piotra — szkic w Gmailu, do wysłania przez Marka. `redakcja/skrzynka-instrukcja.md` poprawione.

## 2026-11-07 14:55 · Skrzynka tekstów Piotra (GitHub)

- 3 pliki + 7 zdjęć; opublikowane (commit `95c20af1`), linki wysłane, źródła w `opublikowane/`.
- 0039 i 0040 — nowe wersje już opublikowanych premier (te same adresy): https://tylkoklocki.pl/artykuly/lego-botanicals-na-poczatek-2027-roku-piwonie-storczyk-galazki-wisni/ , https://tylkoklocki.pl/artykuly/lego-na-swieto-wiosny-2027-80123-spring-festival-voyage-i-80122/
- Recenzje_018 77256 Wehikuł czasu — https://tylkoklocki.pl/artykuly/lego-77256-wehikul-czasu-z-powrotu-do-przyszlosci-recenzja/

## 2026-11-07 · Code · Media Expert: zakup testowy przypisany; 11 konwersji pending od IX

Zakup testowy Marka 11505 (06.11 12:03, 233,42 zł) jest w Performers jako konwersja pending (4,67 zł, aff_sub `Partner_ID` — kupione przed `65b65789`). `getStats` liczy tylko zatwierdzone; `getConversions` pokazuje od 03.09 **11 konwersji pending: 14 410,90 zł sprzedaży, 276,24 zł prowizji** (16.10: 9 998 zł → 199,96 zł). Wniosek audytu „ME 0 konwersji” odwołany. `scripts/prowizje-raport.mjs` dostał `konwersje_wg_statusu`; rejestr afiliacji i audyt poprawione. Sprawdzenie 09.11 niepotrzebne.

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

## 2026-11-04 14:55 · Skrzynka tekstów Piotra (GitHub)

- Źródło: repo `tylkoklocki-teksty`, 2 pliki; opublikowane bez przeglądu (commit `794ab34`), linki wysłane Markowi i Piotrowi, źródła przeniesione do `opublikowane/` (ca5d26c w repo tekstów).
- 0036 Premiery — https://tylkoklocki.pl/artykuly/lego-ideas-21375-godzilla-oficjalnie-5363-elementy-za-1699-99-zl-od-27/
- Recenzje_017 — https://tylkoklocki.pl/artykuly/lego-42646-pokoj-autumn-recenzja/
- Mail i panel: puste.

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

## 2026-11-03 · DANE WT · Do zrobienia

**Program Ceneo CPS 385881 (Tradedoubler) zakończony — `src/worker.js` (linie ok. 232–238, `/idz/ceneo/<nr>`) wciąż buduje link przez ten program (`clk.tradedoubler.com?p=385881&a=3494691&url=...`), tak samo linki w `redirects.ceneo` z feedu. Kliki nie przyniosą już prowizji, a sam przekierowywacz może z czasem zacząć błądzić (TD bywa, że wygasza martwe programy).**
**Mamy?** — tak: dokładne miejsce w kodzie (`worker.js` ~232–238) i pełny opis w `afiliacje_rejestr.json._meta.decyzje.ceneo_zakonczony`.
**Zrobić:** — decyzja Marka, co dalej z `/idz/ceneo/`: (a) zostawić jak jest — link i tak trafia na ceneo.pl, tylko bez prowizji; (b) zamienić na zwykły link bez wrappera TD (bezpośrednio na ceneo.pl); (c) zdjąć wiersz Ceneo z tabel cen w ogóle (dotyczy wielu szablonów: `TabelaCen.astro`, `KartaOferty.astro`, `PasekCeny.astro` i innych — do rozpisania po decyzji). To zmiana w `src/worker.js` i/albo szablonach, więc zgodnie z CLAUDE.md wymaga potwierdzenia przed pushem.
**Kto:** — Marek (decyzja), potem Code (wdrożenie)
→ zamknięte 09.11.2026 (Kontroler): zrobione w dwóch krokach — (b) 03.11 `834e724` worker kieruje `/idz/ceneo/` bezpośrednio na ceneo.pl bez wrappera TD, (c) 06.11 decyzja D1 audytu: Ceneo zdjęte z tabel cen (`SKLEPY_WYLACZONE`), 0 linków `/idz/ceneo/` w buildzie.
