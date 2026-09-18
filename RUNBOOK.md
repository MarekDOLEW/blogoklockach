# Runbook — tylkoklocki.pl

Wiedza operacyjna: pułapki, ograniczenia zewnętrznych systemów, procedury
awaryjne. Rzeczy kupione czasem, nie do odtworzenia z kodu.

**Czego tu nie ma:** harmonogramu runnerów (`materialy/zadania-cykliczne.md`,
generowany), podziału pracy (`NARZEDZIA.md`, `redakcja/wspolpraca.md`),
bieżących zadań (`DZIENNIK.md`).

Każdy wpis ma datę ustalenia. Jeśli ustalenie przestaje być prawdziwe —
popraw je i zmień datę, nie dopisuj sprzeczności na dole. Poprzedni dokument
zginął właśnie tak: nowe ustalenia dopisano niżej, tabeli u góry nie poprawiono.

---

## Obieg plików danych

Wszystkie dane serwisu trafiają do `src/data/` w repo, gałąź `main`.
Push na `main` uruchamia build i deploy w Cloudflare automatycznie — strona
odświeża się w ~2 minuty, nic więcej się nie klika.

Runnery pushują same. **Ścieżka awaryjna** (gdy sesja nie ma dostępu do repo):
runner oddaje gotowy plik w czacie → GitHub → `src/data/` → *Add file →
Upload files* → przeciągnij → *Commit changes*.

### Żelazna reguła aktualizacji

**Pobierz aktualny plik z repo → dołóż zmiany → zwaliduj → wypchnij.**
Nigdy nie twórz od zera, nigdy nie usuwaj cudzych wpisów. Append-only.

Gdy sesja buduje dane w czacie, zawsze podaj jej link do surowego pliku:

```
https://raw.githubusercontent.com/MarekDOLEW/blogoklockach/main/src/data/<plik>
```

Przy weryfikacji dodaj `?t=<cokolwiek>` — cache CDN bywa nieświeży.

---

## Mapa plików danych

Który plik co zasila na stronie. Kolumna „co zasila" jest tu jedynym takim
zestawieniem w całym repo — przed zmianą formatu któregokolwiek z tych plików
sprawdź, co się posypie.

Kolumna „kto zapisuje" odzwierciedla realną konfigurację Routines
(stan 16.09.2026, po audycie końcowym) — przy rozbieżności rozstrzyga
`materialy/zadania-cykliczne.md`.

| Plik w `src/data/` | Kto zapisuje | Co zasila na stronie |
|---|---|---|
| `sety.json` | Scout 05:00 (nowe sety) + Łowca 08:30 (ceny ME/PK/Allegro, import Empiku) + Dane wt 05:30 (oferta `lego`, `smyk`) | `/nowosci/`, huby `/zestaw/{nr}/`, „Śledzone" na stronach serii, deale |
| `oferty_feed.json` | Łowca 08:30 (`mediaexpert`, `planetaklockow`, `allegro`; `empik` przy zrzucie) + Dane wt 05:30 (`lego`, `ceneo`, `smyk`) — każdy sklep z własną datą w `daty` | ceny i oferty w tabelach hubów, miniatury katalogów serii |
| `ceny_baza.json` | Łowca 08:30 (minima), importy sklepów | historia cen, drabina cenowa, badge „nowe minimum" |
| `redirects.json` | Łowca (`planetaklockow`, `allegro`), Dane wt (`lego`, `ceneo`), `empik-redirects.mjs` (`empik`, jedyny klucz z kasowaniem), sesje (`mediaexpert`, `smyk`) | przekierowania `/idz/{sklep}/{nr}` i widoczność przycisków |
| `sklepy.json` | ręcznie (sesja) | nazwy sklepów, szablony `szukaj` workera (muszą mieć `{nr}`) |
| `katalog.json` | Dane wt 05:30 (`status`, `ekskluzyw`, `lego_pl_widziano` z listingu lego.pl) + `katalog-z-rebrickable.mjs` + sesje (serie, nazwy) | huby dla każdego numeru (nigdy 404), katalogi serii, `/ekskluzywne/` |
| `wycofania.json` | Wycofania, poniedziałek 06:10 (jedyny autor) | `/wycofania/`, etykiety statusu na hubach i listingach |
| `przecieki.json` | Scout 05:00 (jedyny autor) | `/przecieki/` |
| `known_sets.json` | Scout 05:00 | nic — stan runnera |
| `konkurencja_baza.json` | Radar 08:00 | nic — stan runnera |
| `karty_setow.json` | `import-karty.py` z paczek Piotra (sesja) | opis, metryka i FAQ na hubie; wyjątek indeksowalności „karta" |
| `rrp_potwierdzone.json` | `wczytaj-rrp.mjs` (Dane wt z listingu lego.pl; sesje) — write-once | cena katalogowa o najwyższym pierwszeństwie, rabaty, odsiew |
| `deale_potwierdzone.json` | ręcznie po sprawdzeniu w sklepie (od 16.09.2026) | odblokowanie oferty poniżej 50% potwierdzonego RRP |
| `lego_strony_brak.json` | `lego-strony.mjs` (sesja) | czy hub po EOL ma jeszcze link do karty lego.pl |
| `obrazy.json` | `generuj-obrazy.mjs` w prebuild (także Łowca i Dane wt przed commitem) | zdjęcia zestawów przez `/img/` |
| `galerie.json`, `zdjecia.json` | sesje (galerie do tekstów; zdjęcia ze źródeł) | slajdery i miniatury; R2 dogrywa Routine „Zdjęcia → R2" |
| `opisy.json`, `ean.json`, `feedy.json` | sesje ad hoc | opisy serii, kody EAN, adresy feedów dla `feedy-lego.py` |
| `kategorie_artykulow.json` | ręcznie (decyzja) | zamknięta lista kategorii; walidacja w prebuild |
| `src/pages/deale/*.md` | Łowca (posty dealowe wg reguły z 15.09) | dział `/deale/` |
| `afiliacje_rejestr.json` | ręcznie | nic — dokumentacja |
| `raporty_mail.json` | ręcznie | odbiorcy raportów PDF |

Pozycje z „nic" w kolumnie „co zasila" to celowe „nic" — te pliki są
dokumentacją albo stanem runnerów. Warto o tym wiedzieć, zanim ktoś uzna je
za martwe i skasuje.

---

## Allegro: feed potrafi zamarznąć *(zaobserwowane 09–10.09.2026)*

Feed afiliacyjny Allegro (`feeds.allegro.pl/affiliate-feed/...`) pobiera się
poprawnie (HTTP 200, pełny plik), ale bywa **niezregenerowany po stronie
Allegro** — 09.09 i 10.09 dwa kolejne przebiegi dostały identyczną treść:
0 zmian cen na ~7100 ofert (normalny dzień to 100–600 zmian). Serwer nie
zwraca Last-Modified ani ETag, więc jedynym sygnałem jest właśnie
**dokładnie zero zmian w statystykach Łowcy**.

Postępowanie: dane traktować jak pobrane (nie jest to błąd pobrania),
odnotować w raporcie; przy zamrożeniu 3+ dni sprawdzić w panelu afiliacyjnym
Allegro, czy generowanie feedu nie wymaga odnowienia po naszej stronie.

**Eskalacja 11.09.2026: po dwóch dniach zamrożenia feed zwrócił PUSTY plik**
(HTTP 200, 0 ofert). Pusty feed traktujemy jak feed niepobrany — sklepu NIE
aktualizujemy (inaczej jedna pusta odpowiedź wymazałaby wszystkie oferty
i całą gałąź `redirects.allegro`). Pipeline Łowcy pomija sklepy z pustym
feedem automatycznie. Stan wymaga sprawdzenia w panelu afiliacyjnym Allegro
(link feedu mógł wygasnąć lub wymagać ponownego wygenerowania).

---

## Empik: deeplinki produktowe *(przygotowane 14.09.2026)*

Do 14.09 `/idz/empik/<nr>` prowadził na wyszukiwarkę Empiku — nie z lenistwa,
tylko dlatego, że **feed Tradedoublera nie zawiera zestawów LEGO** (weryfikacja
na pełnym pliku 2,5 GB z 19.08: 10316, 21348, 76454, 60337 — zero trafień; to
marketplace: gabloty, opłatki, magazyny). Adresów kart nie było skąd wziąć.

Bierzemy je teraz z tygodniowego zrzutu Coworka (skill `klocki-ceny-empik`,
nowe pole `url`), a wgrywa je `scripts/empik-redirects.mjs`:

    node scripts/empik-redirects.mjs lego-empik.json --sucho          # podgląd
    node scripts/empik-redirects.mjs lego-empik.json --usun-martwe

**Afiliacja zostaje nietknięta.** Adres produktu pakujemy w ten sam deeplink
`clk.tradedoubler.com/click?p=289664&a=3494691&url=<adres>` — prowizję liczy
tracker, cel jest w nim tylko parametrem. Bezpośredni link do empik.com
oznaczałby klik bez prowizji, więc skrypt odrzuca wszystko, co nie jest kartą
produktu na empik.com (w tym adresy wyszukiwarki).

**Worker bez zmian.** Bierze wpis z `redirects.json` przed swoją wyszukiwarką,
więc zestawy bez adresu zachowują dotychczasowe zachowanie.

**Dlaczego `--usun-martwe`.** Cena starzeje się z dnia na dzień, ale adres karty
nie — Empik trzyma w URL stabilne ID produktu. Link psuje się dopiero, gdy
produkt zniknie z oferty, a wtedy znika też z naszego zrzutu i to jest sygnał do
skasowania wpisu. Zestaw wraca wtedy na wyszukiwarkę, która nigdy nie oddaje 404.
To jedyny wyjątek od append-only w `src/data/` — zapisany w CLAUDE.md.

**Po zmianie skilla trzeba go wgrać do Coworka:** `node scripts/spakuj-skille.mjs`
i przeciągnięcie `skille/klocki-ceny-empik.skill` w Settings → Skills. Synchronizacja
idzie tylko serwer → kontener, więc z sesji nie da się tego zrobić.

---

## Hub dla każdego zestawu z katalogu — nigdy 404 *(decyzja Marka 15.09.2026)*

Do 15.09 hub `/zestaw/<nr>/` istniał tylko dla zestawu z ofertą w feedzie, wpisem
w `sety.json`, kartą Piotra albo statusem „dostepny" z RRP. Gdy oferta wypadała
z feedu, **strona znikała i oddawała 404** — Search Console: 9% skanowań to 404
na `/zestaw/NNNN/`, a Google do nich wraca. Od 15.09 `policzHuby()` bierze
**każdy numer z `katalog.json`** (9 363 huby, build 25 s). Cienki hub dostaje
`noindex, follow` z reguł `seo.js` i nie trafia do sitemapy, ale odpowiada 200.
Raz wpisany zestaw zostaje na zawsze — to dane historyczne.

Katalog dostał 1 523 numery z Rebrickable (`scripts/katalog-z-rebrickable.mjs`):
wycenione w feedach, których katalog nie znał (stare numery z Allegro). Nazwy
po angielsku, bez RRP, pole `zrodlo: "rebrickable"`; motywy mapowane na nasze
serie (Super Heroes DC → DC, Creator Expert → Icons, breloki → Gadżety),
realne dawne linie (Nexo Knights, DOTS, Bionicle, Chima…) dostały własne serie,
gdy mają ≥10 zestawów; reszta i śmieci → Archiwum. 197 numerów z feedów
Rebrickable nie zna (podszywki, EAN-y, numery pomocnicze) — bez huba, celowo.
Skrypt jest append-only; uruchamiać, gdy `--sucho` pokaże nowe „spoza katalogu".

## Zdjęcia: Planeta Klocków odrzuca fetch z workera *(ustalone 14.09.2026)*

Worker serwuje `/img/<nr>.jpg` i `/img/<nr>-<poz>.jpg` z R2, a gdy w R2 nic nie
ma — pobiera ze źródła (`obrazy.json` / `galerie.json`) i zapisuje kopię. Ten
drugi krok **nie działa dla planetaklockow.pl**: z kontenera te same adresy
oddają 200, ale fetch z workera dostaje odmowę i worker odpowiada 502.
Audyt 14.09: 348 z 608 zdjęć galerii puste — 37 hubów z rzędem pustych miniatur.
Działało tylko to, co ktoś wcześniej zdążył zobaczyć (kopia w R2).

Naprawa bez ruszania workera: **wgrać plik do R2 z kontenera** pod kluczem,
którego używa worker (`42220-1`, bez rozszerzenia). Robi to
`node scripts/r2-obrazy.mjs`: listuje kubełek R2 (to jest rejestr „co już
wgrane" — nie trzymamy osobnego pliku stanu, bo rozjeżdżałby się przy każdym
ręcznym wgraniu albo kasowaniu), porównuje z `galerie.json` i `obrazy.json`
i wgrywa brakujące zdjęcia z Planety. Przebieg bez zaległości trwa sekundy.
Wymaga `CF_R2_TOKEN` (token *Workers R2 Storage: Edit*, osobny od
`CF_API_TOKEN`, który ma tylko Analytics: Read). `--sprawdz` to co innego:
audyt HEAD na każde `/img/` na produkcji (~15 min), który widzi też martwe
źródła Rebrickable — bez tokena, ale to nie codzienność. Po dopisaniu nowych
galerii do `galerie.json` uruchom skrypt — inaczej nowe zdjęcia z Planety nie
pokażą się nigdy.

Planeta potrafi resetować połączenie przy serii pobrań (curl 35) — skrypt
ponawia trzy razy z odstępem; przy setkach plików liczy się w dziesiątkach minut.

## Robots.txt: blokady AI zdjęte *(15.09.2026)*

Do 15.09 Cloudflare (AI Crawl Control, ustawienie domyślne) dokładał do naszego
`robots.txt` blokady GPTBot, ClaudeBot, CCBot, Google-Extended i pięciu innych
oraz `Content-Signal: ai-train=no`. Marek zdjął to 15.09 rano: produkcja oddaje
teraz dokładnie `public/robots.txt` (`Allow: /`, `Disallow: /idz/`, sitemapa).
Na brzegu (AI Crawl Control, osobny przełącznik od robots.txt) zablokowane
zostały wyłącznie boty treningowe: Bytespider, CCBot, PetalBot, Amazonbot,
GPTBot, Google-CloudVertexBot, FacebookBot, Meta-ExternalAgent i kilka
niszowych. Boty wyszukiwania i asystentów (Googlebot, OAI-SearchBot,
ChatGPT-User, ClaudeBot, PerplexityBot) mają wstęp — ChatGPT był 15.09
największym źródłem ruchu w GA4, więc to jest świadomy wybór, nie domyślne
ustawienie. Sprawdzenie: `curl -s https://tylkoklocki.pl/robots.txt`.

## HTTP → HTTPS *(wykryte i naprawione 15.09.2026)*

Do 15.09 `http://tylkoklocki.pl/` oddawało **200** zamiast 301 i Search Console
widziała dwie wersje serwisu. Marek włączył w panelu Cloudflare → SSL/TLS →
Edge Certificates → **Always Use HTTPS**. Sprawdzone tego samego dnia: strona
główna, hub, `/img/` i `/idz/` oddają **301** na https jednym skokiem. `www.`
nie ma rekordu DNS — w porządku, serwis jest bez www. Nagłówka HSTS nie ma;
to opcja (Cloudflare → HSTS), nie konieczność — włączać dopiero, gdy nic
w serwisie nie ma już wracać na http, bo przeglądarki pamiętają ją miesiącami.

## Filtr botów na /idz/ *(wdrożony 14.09.2026)*

Pomiar z Analytics Engine za 7–14.09: **939 kliknięć w `/idz/`, z czego 867
(92,3%) bez referera i spoza Polski**. Polska: 40 kliknięć (4,3%) — przy serwisie
po polsku, z cenami w złotówkach i linkami do polskich sklepów. Search Console
za ten sam tydzień: 1 kliknięcie, 70 wyświetleń. Realnych przejść było **37**.

Sygnatury, po których to widać:

| sygnał | wartość |
|---|---|
| brak referera | 867 / 939 |
| podrobiony referer `http://tylkoklocki.pl` | 29 (serwis chodzi wyłącznie po HTTPS) |
| referer `m.baidu.com` z losową frazą (`?wd=describe884`) | 4 |
| różnych zestawów w tygodniu | 307 przy ruchu ludzkim dotykającym 24 |
| szczyt godzinowy | 02:00 UTC (113) wyżej niż 20:00 (36) |

**Dlaczego to nie była kwestia statystyki.** Każde takie przejście szło dalej do
Allegro Affiliate, Performers, Tradedoublera i Adtraction — z ich perspektywy
konto wydawcy generowało setki kliknięć miesięcznie przy zerowej konwersji. To
typowy powód wstrzymania konta, a wstrzymanie w listopadzie kasuje sezon.

**Kryterium to wyłącznie referer, nigdy kraj.** 20 z 66 kliknięć z naszym
refererem przyszło z Niemiec, 9 z USA — Polacy za granicą, VPN, własne testy.
Filtr po `request.cf.country` odciąłby realnych czytelników.

Odrzucone żądanie dostaje **302 na hub zestawu**, nie 204: sieć afiliacyjna nie
widzi pustego kliknięcia, a człowiek, któremu przeglądarka wycięła referer,
trafia na stronę z tabelą cen i może kliknąć jeszcze raz. Zapis do Analytics
Engine zostaje w obu przypadkach — doszedł `blob6` z wartością `human`/`bot`,
żeby dalej mierzyć skalę. Starsze zapytania (`blob1`–`blob5`) działają bez zmian.

    SELECT blob6 AS kto, SUM(_sample_interval) AS kliki FROM idz_kliki
    WHERE timestamp > NOW() - INTERVAL '7' DAY GROUP BY kto

**`scripts/kliki-raport.mjs` od 14.09 domyślnie liczy wyłącznie `human`** —
suma z raportu będzie więc mniejsza niż z powyższego zapytania, i to jest
zamierzone. Pełny ruch daje `--wszystko`. Kliknięcia sprzed wdrożenia mają
`blob6` puste i raport pokazuje je osobno jako „nieoznaczone", bo nie da się
ich zaklasyfikować wstecz.

**Czego pilnować:** gdyby kiedyś doszła restrykcyjna `Referrer-Policy` albo
`rel="noreferrer"` na linkach `/idz/`, filtr zacznie odcinać własnych
czytelników. Dziś polityka jest domyślna, a linki mają tylko `sponsored nofollow`
i `noopener` — żadne z nich referera nie wycina.

**Linki do sklepów i Ceneo otwierają się w nowej karcie** *(decyzja Marka
16.09.2026: czytelnik ma wracać do nas, nie wypuszczamy ruchu)*. Każdy anchor
`/idz/…` ma `target="_blank"` wpisane w szablonie (TabelaCen, TabelaSetow,
KartaPrezentu, karuzela na stronie głównej, `/deale/`, `remark-ceny.mjs`) plus
`noopener` w `relLinku()`; ręczne linki `/idz/` w markdownie dostają to samo przy
buildzie (`scripts/remark-linki-sklepow.mjs`), a delegacja kliknięcia w `Base.astro`
jest siatką bezpieczeństwa dla reszty. Sprawdzone po buildzie 16.09: 0 anchorów
`/idz/` bez `target="_blank"`. `noopener` NIE wycina referera, więc filtr botów
działa bez zmian; `noreferrer` jest zakazany.

---

## Media Expert *(ustalone 18.08.2026, godzina Łowcy poprawiona 31.08.2026)*

**Feed aktualizuje się 2× na dobę, ale z opóźnieniem uploadu.** Stemple
`<updated>` to 00:30 i 18:30 CEST, jednak plik ląduje na
`storage.googleapis.com` około **7 godzin później** — nocny ok. 07:40,
wieczorny w środku nocy.

**Po imporcie cen dopisz linki.** Łowca wkłada do `oferty_feed.json` same ceny,
a worker nie ma dla ME żadnego fallbacku ani szablonu `szukaj` — zestaw bez wpisu
w `redirects.json` pokazuje więc cenę, ale klik wraca na naszą stronę główną
i prowizja 2% przepada (24 takie pozycje na 5 945 zł ekspozycji, 14.09.2026):

    python3 scripts/feedy-lego.py --tylko mediaexpert --wyjscie /tmp/me.json
    node scripts/me-redirects.mjs /tmp/me.json --sucho   # najpierw podgląd
    node scripts/me-redirects.mjs /tmp/me.json

Skrypt dopisuje wyłącznie brakujące wpisy i tylko dla zestawów, które mają
ofertę ME w serwisie; istniejących nie rusza. Link z feedu ma placeholdery sieci
(`aff_sub=Partner_ID`), które podmienia na `tylkoklocki` — starsze wpisy mają
w zakodowanym URL inne parametry `utm_*` i to jest w porządku, bo o przypisaniu
prowizji decydują `aff_id`, `aff_sub` i `transaction_id`, identyczne w obu.

Praktyczny skutek: **każdy przebieg Łowcy przed ~07:40 dostaje wczorajszą
wieczorną wersję.** Dlatego od 31.08 Łowca chodzi o **08:30** — to najwcześniejsza
sensowna godzina z zapasem na opóźnienie uploadu.

To ograniczenie rządzi godziną Łowcy i żadna zmiana harmonogramu nie może go
pominąć. Dwie pułapki na przyszłość:

- **Zmiana czasu 25.10.2026.** Crony są w UTC, więc po przejściu na CET przebieg
  wypadnie o 07:30 i znowu zacznie łapać wczorajszy feed. Trzeba go wtedy
  przesunąć razem ze zmianą czasu.
- **Nazwa Routine musi iść za cronem.** 30.08 Łowca nazywał się „07:00",
  chodząc faktycznie o 08:00; próba „naprawy" na 07:00 pogorszyła sprawę,
  bo trafiała przed upload feedu.

**Stron produktowych ME nie da się weryfikować punktowo z sesji.** curl
i WebFetch dostają HTTP 403, prawdziwa przeglądarka (Chromium) — reset
połączenia. ME blokuje ruch z data center. WebFetch działał do 16.08.2026,
potem przestał.

Wniosek obowiązujący: **ceny ME bierzemy wyłącznie z feedu afiliacyjnego**
(oficjalny, wiarygodny). Weryfikację na stronach robimy tylko dla Planety
Klocków.

---

## Typowanie deali *(ustalone 18.08.2026, limit Allegro 05.09.2026, zaostrzony 13.09.2026)*

Deale dnia typujemy w **trzech półkach cenowych**: do 200 zł, 201–800 zł,
801 zł i więcej.

Powód: rabat procentowy naturalnie faworyzuje tanie zestawy, przez co drogie
okazje umykały (np. Tower Bridge −27% nie miał szans przebić się przez drobnicę
z −50%).

Slajder na stronie głównej:
- sloty 1–3 — najlepszy rabat z każdej półki, od najdroższej
- sloty 4–5 — dzikie karty wg samego rabatu
- **Allegro maks. 30% linków w dealach** (decyzja Marka 13.09.2026; wcześniej
  „2 z 5" od 05.09): marketplace wygrywa ceną niemal każdy slot, a deale mają
  pokazywać też sklepy z własnym magazynem. W karuzeli (5 slotów) to **1 slot**,
  na półce `/deale/` (12 pozycji) — **3 pozycje**. Po wyczerpaniu limitu zestaw
  dostaje najlepszą ofertę spoza Allegro — z ceną i rabatem tego sklepu (nadal
  ≥15%, a na `/deale/` nadal kryterium deala gorącego); set bez takiej oferty
  odpada. Reguła i próg w `src/lib/deale.js` (`UDZIAL_ALLEGRO`, `limitAllegro`,
  `przydzielOferty`); karuzela używa `limitAllegro(5)`, półki `przydzielOferty`.

Raporty Łowcy pokazują czołówkę osobno dla każdej półki.

---

## Gdzie sprawdzić, gdy coś nie gra

| Problem | Gdzie |
|---|---|
| Build / deploy | Cloudflare → Workers & Pages → `blogoklockach` → *Deployments / Build history*. Czerwony build = strona zamrożona na ostatniej zielonej wersji; logi pod „View build" |
| Ruch na stronie | Cloudflare → Analytics & Logs → Web Analytics |
| Kliknięcia afiliacyjne | panel webePartners (autorytatywny). Worker też je liczy, ale dopiero po włączeniu Analytics Engine — wymaga planu Workers Paid |
| Widoczność w Google | Search Console, usługa **domenowa** `sc-domain:tylkoklocki.pl` |
| Runner „nie działa" | najpierw sprawdź flagę `enabled` w Routines, dopiero potem logi. Wyłączony runner nie zgłasza błędu |

### Rollback

Cloudflare → *Deployments* → *Version History* → „…" przy starszej wersji →
*Rollback*. Nie wymaga zmian w repo.

---

## Runnery: opóźnione commity *(zaobserwowane 23.08.2026)*

Wycofania, Łowca i Backfill odpaliły się o 04:09, 05:09 i 10:03, ale commity
wylądowały dopiero po 17:00 — **7–12 godzin później**. Sesje miały status
`rejected`, co wygląda na kolejkowanie po wyczerpaniu limitu tygodniowego.

Scout i Radar (nowsze sesje na Opusie) pushują punktualnie.

Skutek: **godzina odpalenia nie równa się godzinie, o której dane są na
produkcji.** Przy diagnozie „dlaczego strona ma stare ceny" sprawdzaj czas
commita, nie czas triggera.

---

## Stabilność formatu plików JSON *(rozwiązane 15–16.09.2026)*

Problem z 23.08 (Łowca przepisywał całą gałąź Allegro, Scout cały
`known_sets.json`, a skrypt z Node zmieniał kolejność kluczy numerycznych)
jest domknięty trzema rzeczami:

- `scripts/json-kolejnosc.mjs` — wspólny zapis `sety.json`, `oferty_feed.json`
  i map z numerami jako kluczami: kolejność z pliku, wcięcie z pliku, nowe
  klucze na końcu. Używają go `lego-ceny`, `ceneo-feed`, `smyk-odswiez`,
  `empik-import`, `oferty-przeterminowane`.
- stała kolejność ofert w `sety.json` (alfabetycznie po sklepie, sekcja niżej).
- Łowca zapisuje z Pythona z zachowaniem kolejności i wcięcia (prompt).

Uzupełnienie historyczne o Scoucie zostaje w sekcji Bricksetu niżej.

---

## Brickset: limity dla niezalogowanych *(ustalone 24.08.2026)*

**Paginacja urywa się na stronie 20.** Lista `brickset.com/sets/year-2026`
zgłasza 913 dopasowań i 37 stron, ale strony 21 i dalsze zwracają dla nas
pustą listę zestawów (sama nawigacja serwisu). To nie jest blokada ani limit
zapytań — sprawdzone: strona 20 pobrana ponownie po pustych 21–23 nadal
zwraca komplet 25 numerów. Dostępne jest więc 500 pozycji z 913.

Logowanie tego nie zmienia z naszego poziomu dostępu — sprawdzone niezależnie
dwiema drogami: WebFetch i `curl` widzą to samo (strony 21+ to 44 kB pustego
szablonu, strona 20 nadal 196 kB z listą).

**Obejście — pełny crawl per seria.** Sidebar strony rocznej
(`brickset.com/sets/year-2026`) zawiera komplet serii rocznika z licznikami;
sumy per seria zgadzają się z sumą roczną (913 dla 2026), więc pokrycie jest
pełne. Największa seria ma 112 pozycji, czyli limit 500 nie zadziała.
Schemat: `brickset.com/sets/theme-<seria>/year-2026[/page-N]`, 25 pozycji
na stronę.

**`curl` działa na brickset.com bez przeszkód** — ścieżka `/sets/` zwraca
pełny HTML, więc numery wyciąga się lokalnie przez
`grep -oE '/sets/[0-9]+-[0-9]+'`. Ścieżka `/article/` zwraca 403. To istotne
kosztowo: cały rocznik (46 serii, ~60 stron) schodzi bez ani jednego wywołania
WebFetch, czyli bez kosztu streszczania. Pełny przegląd rocznika 2026 zajął
tak kilka minut.

**Brickset nie podaje RRP w złotych** — tylko GBP/USD/EUR, także na kartach
pojedynczych zestawów (sprawdzone na 10465-1, 11371-1, 11375-1). Ceny w zł
biorzemy z `katalog.json`; walut nie przeliczamy.

**Czego Brickset użyć, a czego nie:** numer, nazwa EN, seria, liczba
elementów, wiek, data premiery, wymiary, liczba minifigurek — tak. Cena —
nie. Nazwa PL — nie ma jej tam w ogóle.

**Parametry sortowania i rozmiaru strony są ignorowane.** `?sortBy=-DateAdded`
i `?pageSize=100` nie zmieniają wyniku — kolejność zostaje po numerze
zestawu, a strona ma 25 pozycji. Nie da się tanio zapytać „co doszło od
wczoraj"; wykrywanie nowości opiera się na porównaniu z `known_sets.json`.

### Uzupełnienie do „Stabilność formatu plików JSON"

Zarzut wobec Scouta był trafny co do objawu, ale przyczyna była inna niż
niedeterminizm. Scout zapisuje `known_sets.json` przez
`json.dumps(indent=2, ensure_ascii=False)` — round-trip jest stabilny bajt
w bajt, sprawdzone 24.08. Duże diffy z 22–23.08 to realna zmiana treści
(przepisywany rejestr luk), nie szum formatowania.

Pułapka, w którą Scout wpadł i z której warto wyciągnąć regułę: **`sety.json`
nie kończy się znakiem nowej linii**, a klucze NIE są posortowane (plik
zaczyna się od `21372`). Zapis przez Node z `JSON.stringify(obj, null, 2)`
dał 7 594 wstawień i 7 514 usunięć przy pięciu faktycznie dodanych zestawach.
Poprawnie: Python z `object_pairs_hook=OrderedDict`, `ensure_ascii=False`,
bez końcowego `\n`. **Node reorganizuje klucze wyglądające na liczby, więc
do plików z numerami zestawów jako kluczami nie nadaje się do zapisu.**

**Wcięcia nie zakładać na pamięć — sprawdzać przed każdym zapisem.**
`sety.json` miał wcięcie 1 spacji do 28.08.2026, a commit „Nazwy zestawów
wyrównane do LEGO.com PL" przestawił je na 2 spacje. Scout zapisał plik
starym wcięciem i dostał 8 466 usuniętych linii przy sześciu dodanych
zestawach. Procedura: przed zapisem zrobić round-trip
(`json.dumps` → `diff` z oryginałem) i użyć tego wcięcia, przy którym plik
wychodzi bajt w bajt identyczny. Zajmuje sekundę i wyłapuje każdą taką
zmianę.

---

## Brickset API v3 *(klucz wyrobiony 23.08.2026, zweryfikowany 24.08.2026)*

Uzupełnia sekcję wyżej: crawl HTML zostaje jako awaryjny, API jest drogą
podstawową dla metadanych katalogowych.

**Endpoint:** `https://brickset.com/api/v3.asmx/{metoda}`, odpowiedzi w JSON.
Parametry przez query string; `params` to zagnieżdżony JSON, np.
`params={"theme":"Icons","year":"2026","pageSize":500}`.

**Klucz:** w zmiennej środowiskowej `BRICKSET_API_KEY` (tam gdzie
`GSC_KEY_JSON_B64` i `TD_TOKEN`). Konto MAREK1972. **Nigdy nie trafia do
repo ani do commita.**

**Weryfikacja klucza:** `checkKey` → `{"status":"success"}`. Nie liczy się
do limitu.

**Limity:** dzienny limit zapytań liczy **tylko `getSets`** — `checkKey`,
`getThemes` i podobne są poza nim. Maksymalnie **500 rekordów na stronę**
(`pageSize`), czyli cały rocznik schodzi dwoma wywołaniami zamiast ~60 stron
HTML. Do pobierania przyrostowego: **`updatedSince`** w formacie `yyyy-mm-dd`
— dzienny przebieg Scouta powinien pytać tylko o to, co zmieniło się od
ostatniego uruchomienia.

**Pole cenowe:** `LEGOCom.DE.retailPrice` — cena w EUR, rynek referencyjny
dla Polski. **Cen w złotych w API NIE MA.** Obiekt `LEGOCom` zawiera
wyłącznie rynki `US`, `UK`, `CA`, `DE`, każdy z `retailPrice`
i `dateFirstAvailable`. Sprawdzone 24.08.2026 na 11371: DE 249,99 EUR przy
1 099,99 zł w naszym `katalog.json`.

**Pozostałe przydatne pola z `getSets`:** `number`, `name`, `pieces`,
`minifigs`, `year`, `theme`, `subtheme`, `themeGroup`, `ageRange.min`,
`launchDate`, `exitDate`, `availability`, `lastUpdated`, `dimensions`,
`image`, `bricksetURL`, `rating`. To komplet tego, po co dotąd chodziliśmy
na karty setów po jednym pobraniu na sztukę.

**Regulamin — twarde ograniczenia.** Klucz przyznano od razu, ale Brickset
przegląda wniosek po fakcie i może go cofnąć. Zadeklarowane zastosowanie:
komplementarne metadane katalogowe, nie scraping. Trzymamy się tego
dosłownie: **tylko odczyt, tylko metadane, przyrostowo po `updatedSince`.**
Bez masowego zaciągania całej bazy „na zapas", bez odsprzedaży danych, bez
budowania z tego kopii Bricksetu.

### Przelicznik EUR→PLN dla cen katalogowych *(zbadane 24.08.2026)*

LEGO **nie przelicza cen kursem walutowym** — trzyma osobne progi cenowe per
rynek, ale progi są ze sobą powiązane na tyle mocno, że przelicznik jest
stabilny wewnątrz rocznika. Zmierzone na parach, dla których mamy cenę w zł
w `katalog.json` i cenę DE w EUR z API:

| Rocznik | Par | Mediana | Odch. std | Odstających >10% |
|---|---|---|---|---|
| 2026 | 344 | **4,223** | 0,074 | 0 (0,0%) |
| 2025 | 335 | **4,273** | 0,101 | 5 (1,5%) |
| 2024 | 192 | **4,303** | 0,105 | 4 (2,1%) |
| 2023 | 98 | **4,316** | 0,132 | 1 (1,0%) |
| 2022 | 80 | **4,348** | 0,195 | 6 (7,5%) |
| 2021 | 41 | **4,668** | 0,223 | 4 (9,8%) |
| 2020 | 19 | **4,715** | 0,188 | 2 (10,5%) |

*(Tabela rozszerzona 26.08.2026 na komplet roczników 2020–2026 z API.)*
**Rozstrzygnięcie po pełnych danych:** przelicznik spada monotonicznie
z 4,72 w 2020 do 4,22 w 2026 i jest to trend, nie szum. Rozrzut rośnie wstecz
(odch. std 0,074 w 2026 wobec 0,19 w 2020, odsetek odstających 0% wobec 10,5%).
Praktycznie: dla roczników **2022–2026 przeliczanie jest bezpieczne** przy
mnożniku właściwym dla rocznika premiery. Dla **2020–2021 nie** — przy
odchyleniu 0,19–0,22 i co dziesiątym secie poza zakresem cena z przeliczenia
myli się na tyle, że policzony z niej rabat przestaje być wiarygodny.
Tam potrzebne jest źródło PL, a nie przelicznik.


**Przelicznik dryfuje między rocznikami — jeden mnożnik globalny byłby
błędny.** Trzeba stosować mnożnik wyznaczony dla rocznika premiery zestawu.
Rozrzut rośnie z wiekiem rocznika, więc dla setów starszych niż ~2022 cena
z przeliczenia jest coraz mniej wiarygodna.

W obrębie rocznika 2026 przelicznik lekko rośnie z ceną: 4,17 dla setów do
40 EUR, 4,32 powyżej 150 EUR. To efekt zaokrąglania do progów `,99`.
Rozbicie na serie nie pokazuje różnic — wszystkie mieszczą się w 4,10–4,29,
więc mnożnika per seria nie trzeba.

**Wniosek dla backfillu:** przeliczanie jest bezpieczne dla roczników
2024–2026, pod warunkiem użycia mnożnika właściwego dla rocznika i oznaczenia
ceny jako wyliczonej, a nie odczytanej. Dla starszych roczników — ostrożnie.

### Podejrzane ceny katalogowe *(znalezione przy okazji, 24.08.2026)*

Test przelicznika działa też jako audyt naszych danych. W roczniku 2026
dziewięć zestawów ma mnożnik daleki od 4,22 **przy zgodnej liczbie
elementów** (więc to nie jest pomyłka w dopasowaniu setu) — czyli to nasza
cena jest najpewniej zła:

| Numer | Nasze | EUR | Mnożnik | Z przelicznika |
|---|---|---|---|---|
| 42682 Nature Glamping Cabin | 304,99 | 24,99 | 12,20 | ~105 zł |
| 43294 Rapunzel's Mini Tower | 179,99 | 19,99 | 9,00 | ~84 zł |
| 42702 Spinning Flower & Fairy Teacup Ride | 309,99 | 39,99 | 7,75 | ~169 zł |
| 43289 Belle & the Beast's Enchanted Castle | 279,99 | 39,99 | 7,00 | ~169 zł |
| 11507 Olivia Rodrigo's Flower Bouquet | 289,99 | 44,99 | 6,45 | ~190 zł |
| 76347 Avengers: Doomsday Quinjet | 349,99 | 59,99 | 5,83 | ~253 zł |
| 42694 Pizza Truck | 84,99 | 14,99 | 5,67 | ~63 zł |
| 43298 Disney Advent Calendar 2026 | 174,99 | 34,99 | 5,00 | ~148 zł |
| 76474 Hogwarts Herbology Plants | 349,99 | 99,99 | 3,50 | ~422 zł |

**Osiem z dziewięciu jest zawyżonych** — a zawyżona cena katalogowa to
zawyżony rabat na stronie zestawu, czyli dokładnie ta pseudopromocja, której
zakazuje `CLAUDE.md`. Do ręcznej weryfikacji na LEGO.com PL przed backfillem;
te dziewięć poprawiamy niezależnie od decyzji o przeliczaniu.

## Oferty podszywające się pod zestaw *(ustalone 24.08.2026)*

Feedy marketplace'ów dopasowują ofertę po numerze zestawu **w tytule aukcji**,
więc pod numer setu trafiają rzeczy, które zestawem nie są. Sprawdzone aukcje:

| Set | Cena w feedzie | Co to naprawdę było |
|---|---|---|
| 21315 | 5,00 zł | „LEGO Ideas 21315 książka instrukcja" — sama instrukcja |
| 42156 | 50,00 zł | mocowanie ścienne do modelu, bez klocków |
| 43247 | 45,00 zł | zestaw oświetlenia „bez klocków" |
| 76419 | 149,90 zł | akrylowa gablota na modele |
| 60198 | 45,01 zł | zbiorcza aukcja z siedmioma innymi numerami w tytule |
| 75372 | 29,99 zł | pojedynczy droid wyjęty z zestawu |
| 10276 | 89,99 zł | „koloseum 3D kalendarz" — nie LEGO |

Takie pozycje wchodziły do tabel jako **najtańsza oferta, której nie da się
kupić**. Odsiew działa w `src/lib/odsiew.js` (jedna reguła: oferta poniżej
**28% ceny katalogowej**) i wpina się w `ofertyZFeedu` w `src/lib/oferty.js`,
czyli w jedyne miejsce, przez które ceny z feedów wchodzą na strony.

**Filtrujemy przy odczycie, nie w danych.** `oferty_feed.json` zostaje surowy —
Łowca zapisuje to, co przysłał feed, a serwis sam odsiewa. Dzięki temu żaden
runner nie musi o tym pamiętać, a zmiana progu nie wymaga przeliczania danych.

Kontrola: `node scripts/kontrola-ofert.mjs` wypisuje odrzucone oferty **z linkiem
do konkretnej aukcji**, żeby dało się sprawdzić, czy odsiew nie kasuje realnych
okazji. Warto zerknąć po każdej większej zmianie w feedach.

### Czego NIE robić: porównania między sklepami

Pierwsza wersja reguły odrzucała ofertę radykalnie tańszą od pozostałych
sklepów. Brzmi rozsądnie, ale sprawdzenie linków pokazało, że **kasuje głównie
prawdziwe okazje**: punktem odniesienia bywa oferta zawyżona. Polybagi mają
katalogowo 16,99 zł, na Allegro chodzą po 8–10 zł, a w innym sklepie stoją po
24,99 zł — czyli powyżej ceny katalogowej. Reguła odrzucała wtedy tę uczciwą,
a zostawiała zawyżoną. Tak samo z wycofanymi seriami (VIDIYO, DOTS)
wyprzedawanymi po ułamku ceny. Z 49 odrzuceń tej wersji tylko 11 było
prawdziwymi podszywkami. Cena katalogowa jest jedynym stabilnym punktem
odniesienia — nie wracać do porównań międzysklepowych.

### Znany kompromis

Sety bez znanej ceny katalogowej (ok. 6,7 tys. z 8 tys. wpisów w feedzie) nie
są filtrowane wcale. To świadoma decyzja: lepiej pokazać tanią ofertę, która
okaże się akcesorium, niż ukryć realną okazję. Ryzyko maleje z każdą partią
**Backfillu cen katalogowych** (12:00) — im więcej setów ma RRP, tym szerzej
działa odsiew.

---

## WebFetch kłamie na niektórych serwisach *(ustalone 25.08.2026)*

**403 od WebFetcha nie znaczy, że serwis nas blokuje.** StoneWars zwracał
WebFetchowi 403 przez trzy dni z rzędu (22–24.08) i został przeze mnie
odpisany jako źródło trwale niedostępne. To był błędny wniosek: `curl`
z normalnym User-Agentem dostaje ze `stonewars.de` HTTP 200 i pełne 185 kB
strony. Blokowany jest User-Agent WebFetcha, nie nasz ruch. Źródło wraca
do użycia.

**Gorszy przypadek: PromoBricks.** WebFetch nie zwracał błędu, tylko
**milcząco obciętą wersję strony** — przez trzy dni pokazywał jako najnowszy
artykuł z 21.08, przez co raportowałem „serwis nic nie publikuje", a nawet
sprawdziłem to drugi raz z parametrem omijającym cache i dostałem to samo.
`curl` na tej samej stronie pokazuje wpisy z 24.08. To groźniejsze niż 403,
bo wygląda jak poprawna odpowiedź i przechodzi przez weryfikację.

**Reguła: do list nagłówków używać `curl` + parsowania lokalnego, nie
WebFetcha.** WebFetch zostaje do stron, gdzie faktycznie potrzebne jest
streszczenie długiego tekstu. Przy każdym „źródło milczy" najpierw sprawdzić
`curl`-em, zanim wyciągnie się wniosek o ciszy wydawniczej. Dotyczy to też
Bricksetu: cap na stronie 20 potwierdziłem właśnie dlatego, że sprawdziłem
go dwiema drogami — i tam `curl` potwierdził WebFetcha, więc wniosek się
utrzymał.

---

## Filtr „realny zestaw": pole `category` z API *(ustalone 26.08.2026)*

Do odsiewania szumu z list Bricksetu **używać pola `category` z API**, nie
własnych reguł po prefiksie numeru.

- **`Normal`** — zwykły zestaw detaliczny. To jest ten filtr.
- **`Collection`** — serie minifigurek (71052, 71053). Też trzymamy.
- **`Gear`** (112 pozycji w 2026), **`Book`**, **`Extended`** (BrickLink
  Designer Program, numery 910xxx, oraz promocje), **`Other`** (zestawy
  z czasopism i gratisy o 6-cyfrowych numerach), **`Random`** — odsiewamy.

Kontrola trafności: 252 z 255 naszych opisanych setów rocznika 2026 ma
`category='Normal'`, pozostałe 3 to `Collection`. Zero fałszywych odrzuceń.

**Dlaczego to ważne:** mój wcześniejszy filtr po prefiksie numeru odrzucał
całe zakresy `30xxx` i `40xxx`, przez co gubił BrickHeadz i polybagi będące
normalnymi zestawami, a jednocześnie przepuszczał śmieci. Zaniżał rocznik 2026
z 558 realnych setów do 416. Nie stosować go ponownie.

Osobna pułapka z tego samego dnia: seria **`tbd`** to NIE jest szum — to
zestaw, któremu Brickset nie przypisał jeszcze motywu, czyli najświeższy
z możliwych. Tak zgubiłem 72306 (replika PlayStation 1, 1911 elementów, 18+).

**Ta sama pułapka na poziomie kategorii** *(6.09.2026)*: wartość
**`{t.b.a.}`** w polu `category` też NIE jest szumem. Znaczy „kategorii
jeszcze nie nadano" — czyli rekord założony przed chwilą. Filtr
`category in ('Normal','Collection')` wycina te rekordy, a to są dokładnie
te, których Scout szuka. 5.09 policzyłem tak rocznik 2027 na 222 rekordy
zamiast 224; tego samego dnia oba pominięte numery (11227, 11229) ruszyły
się w katalogu.

Reguła po poprawce: **odsiewaj po tym, co jest szumem** (`Gear`, `Book`,
`Extended`, `Other`, `Random`), a nie po tym, co uznajesz za realne.
Wszystko inne — łącznie z `{t.b.a.}` i każdą nową wartością, której
wcześniej nie widziałeś — traktuj jako zestaw i sprawdź ręcznie.

**Uzupełnienie** *(8.09.2026)*: `{t.b.a.}` w polu `category` znaczy tylko
tyle, że kategorii nie nadano — nie że rekord jest zestawem. Gdy kategoria
jest pusta, **o szumie decyduje motyw**. Tego dnia przyszło sześć rekordów
`category='{t.b.a.}'`, `theme='Gear'` o numerach `66499xx` — karty
kolekcjonerskie Star Wars, czyli merch. Praktyczna kolejność sprawdzania:
kategoria → jeśli `{t.b.a.}`, to motyw → jeśli i to nie rozstrzyga, numer
(7 cyfr to prawie zawsze gadżet).

Motywy-szum przy pustej kategorii: **`Gear`** (gadżety, karty kolekcjonerskie)
i **`BrickLink`** (Designer Program, numery `910xxx` — limitowany crowdfunding,
nie sprzedaż detaliczna). 9.09.2026 przyszło pięć rekordów `910069`–`910073`
o 613–4027 elementach z kategorią `{t.b.a.}`; sam filtr kategorii ich nie łapał.

## Pole `premiera`: dopuszczalny sam rok *(9.09.2026)*

Do 9.09 wszystkie wpisy w `sety.json` miały `premiera` w formacie `RRRR-MM`.
Gdy Brickset zna rocznik, ale nie ma daty startu (77094 Zelda), **wpisujemy
sam rok** — `"2027"` — zamiast zmyślać miesiąc.

Sprawdzone przed zmianą: `src/lib/premiery.js` porównuje `premiera >
BIEZACY_MIESIAC` leksykalnie, więc `"2027" > "2026-09"` daje poprawny wynik,
a hub wyświetla „premiera 2027". Nie psuje to ani flagi zapowiedzi, ani
renderowania.

## Co NIE trafia na stronę publiczną

Ustalone 28.08.2026 po wpadce: plan redakcyjny został opublikowany jako
`/kalendarz-redakcyjny/` i zajawiony na stronie głównej. Adres zdjęty tego
samego dnia (przekierowanie na `/artykuly/` z `noindex` — patrz `redirects`
w `astro.config.mjs`).

**Zasada:** `src/pages/` to treść dla czytelnika. Ustalenia wewnętrzne —
plan publikacji, kolejność prac, analiza konkurencji, argumentacja
redakcyjna, statusy zadań — na stronę nie idą, nawet gdy są ciekawe
i nawet gdy pokazują, że serwis jest prowadzony rzetelnie.

**Gdzie zamiast tego:**
- `redakcja/` — nie jest budowany przez Astro, więc fizycznie nie może
  wyciec na stronę. Tu mieszka `plan-redakcyjny.json`.
- `DZIENNIK.md` — wymiana między sesjami.
- Osobny prywatny link (artefakt) — gdy Marek ma coś przeczytać w formie
  wizualnej, a nie w repo.

**Test przed dodaniem czegokolwiek do `src/pages/`:** czy czytelnik, który
wszedł z Google po nazwę zestawu, ma z tej strony pożytek przy zakupie?
Jeśli odpowiedź brzmi „nie, ale pokazuje, jak pracujemy" — to nie jest
treść, to jest materiał wewnętrzny.

**Uwaga na dane:** plik w `src/data/` sam z siebie nie trafia na stronę
(Astro bundluje tylko to, co zaimportowane), ale leży w katalogu, z którego
strony czerpią treść — więc materiały wewnętrzne trzymamy w `redakcja/`,
żeby nikt ich stamtąd przez pomyłkę nie zaimportował.

## Nazwy zestawów — jedno źródło

Ustalone 28.08.2026 (decyzja Marka): **kanoniczna jest nazwa produktu
z LEGO.com PL.** Reguły wynikające z tej decyzji:

1. **Motyw/seria nie jest częścią nazwy.** LEGO.com PL podaje je obok, nie
   w nazwie — potwierdzone na 31387 („Legendarny statek piracki 31387 |
   Creator 3 w 1"). Prefiksy z Bricksetu (`3w1 `, `Marvel `,
   `Chinese Festivals `) zdejmujemy.
2. **Typografia wg LEGO PL**: apostrof typograficzny (`Snoopy’ego`,
   `Cole’a`), myślnik jako separator podtytułu, zdaniowa wielkość liter poza
   nazwami własnymi (`Smok życia`, nie `Smok Życia`).
3. **Wyjątek — kalendarze adwentowe.** Zachowują serię w nazwie, bo bez niej
   pięć zestawów z 2026 roku nazywa się identycznie („Kalendarz adwentowy na
   2026 rok") i nie da się ich rozróżnić na listach.
4. **Czego NIE ruszamy.** Stare i promocyjne pozycje z lat 2000–2015 mają
   w katalogu angielskie nazwy Bricksetu, w których prefiks (`City `,
   `Star Wars `, `Friends `, `Ninjago `) jest częścią nazwy — nie ma
   polskiego odpowiednika u LEGO, więc nie ma do czego wyrównywać.
   Podobnie licencyjny podmotyw `Disney ` w DUPLO.

Po każdej zmianie sprawdzić, że nazwy w `sety.json` i `katalog.json` są
identyczne dla tego samego numeru — rozjazd oznacza, że jedna ze stron
została zaktualizowana bez drugiej.

Pozycje przyjęte bez potwierdzenia u źródła są wypisane w
`katalog.json` → `_meta.nazwy_do_weryfikacji`. LEGO.com PL blokuje odczyt
stron produktu (Cloudflare) — działa wyszukiwarka z `allowed_domains`.

## Oznaczenia wycofań — próg dowodowy

**Aneks 13.09.2026 (Marek):** prognozy branżowe WRACAJĄ na listę, ale wyłącznie
jako osobny, wyraźnie oznaczony status „prognoza rynku" — pełna reguła
w sekcji „Statusy: wycofania, nowości, EOL" poniżej. Poniższy próg z 28.08
obowiązuje nadal dla statusu „potwierdzone przez LEGO": to, co podpisujemy jako
fakt, musi pochodzić od Grupy LEGO.

Ustalone 28.08.2026 (decyzja Marka): na `/wycofania/` jako **potwierdzone**
trafiają **wyłącznie zestawy z terminem potwierdzonym przez Grupę LEGO.** Branżowe zestawienia
bywają trafne, ale bywają też przesunięte o miesiące, a data wycofania jest
informacją, na której czytelnik opiera zakup za kilkaset złotych.

Konkretny przypadek: cała interaktywna linia Super Mario (37 zestawów) ma
według źródeł branżowych zejść ze sprzedaży do końca 2026 — **nie oznaczamy
jej**, dopóki LEGO nie poda terminów. Artykuł o restarcie serii mówi o tym
czytelnikowi wprost i tłumaczy dlaczego, zamiast udawać, że luki nie ma.

---

## Statusy: wycofania, nowości, EOL na listingu *(ustalone 13.09.2026, decyzje Marka)*

Serwis ma być ekspercki: fakt od Grupy LEGO i prognoza rynku to dwie różne
informacje i czytelnik musi widzieć, którą dostaje. Obie są ważne — fakt musi
być u nas odnotowany, prognoza pokazuje, że trzymamy rękę na pulsie.

### Wycofania (`wycofania.json`, runner Wycofań)

| status w pliku | na stronie | znaczenie |
|---|---|---|
| `potwierdzone` | **potwierdzone przez LEGO** | fakt: dział „Ostatnie sztuki"/„Retiring soon" na lego.com, oficjalny komunikat LEGO, albo zestaw zniknął z lego.com (`kiedy: "wycofany"`) |
| `przewidywane` | **prognoza rynku** | zgodne przewidywania ≥2 źródeł branżowych (Brickset, Brick Fanatics, StoneWars, PromoBricks, listy EOL konkurencji) |

Reguły (pełny tekst także w `wycofania.json` → `_meta.regula_statusow`):

1. Każdy wpis ma `zrodlo` (skąd i z jaką datą). Prognoza nigdy nie jest
   podpisywana jako potwierdzona — nawet gdy „wszyscy tak piszą".
2. Przejścia: `przewidywane → potwierdzone`, gdy LEGO potwierdzi (zmień status,
   dopisz `potwierdzono: RRRR-MM-DD`, nie kasuj wpisu); `potwierdzone` z
   terminem `→ kiedy: "wycofany"`, gdy zestaw zniknie z lego.com; prognoza,
   której LEGO zaprzeczyło albo termin minął bez wycofania `→ kiedy: "odwołane"`
   (wpis zostaje w pliku, strona go nie pokazuje). Najczęstsza ścieżka to
   prognoza, która po sprawdzeniu zamienia się w potwierdzenie.
3. `kiedy: "wycofany"` wymaga `status: "potwierdzone"` i zgodności z katalogiem:
   od 15.09.2026 status `dostepny`/`eol` w `katalog.json` ustawia wyłącznie
   cotygodniowy zaciąg listingu lego.pl (`lego-ceny.mjs`, wtorek): zestaw
   widziany na listingu jest `dostepny`, nieobecny 14 dni przechodzi na `eol`.
   Runner Wycofań NIE edytuje katalogu — daje `kiedy: "wycofany"` tylko, gdy
   katalog mówi `eol` albo `lego_pl_widziano` jest starsze niż 14 dni. Po każdym
   przebiegu uruchamia `node scripts/audyt-wycofan.mjs` (sam raport, BEZ
   `--napraw`): sekcja A (wpis „wycofany" przy katalogowym `dostepny`) i H
   (kandydaci) idą do podsumowania dla Marka; wpis „wycofany" o zestawie
   widzianym na listingu w ostatnich 14 dniach runner sam cofa do poprzedniego
   terminu.
   **Strona nie czeka na runner** (od 16.09.2026, `src/lib/status.js` →
   `widzianyNaListingu`): wpis „wycofany" o zestawie, który listing lego.pl
   pokazał w ostatnich 14 dniach, jest na stronie traktowany jak termin
   „wkrótce (ostatnie sztuki w LEGO)" ze statusem potwierdzonym — hub zachowuje
   wiersz LEGO.com z linkiem. Powód: 16.09 cztery ekskluzywy (10335, 10356,
   40516, 40797) stały jako „wycofany (EOL)" z ukrytym jedynym linkiem
   zakupowym, choć listing pokazał je dzień wcześniej z ceną.
4. Na stronie lista wycofań ma pierwszeństwo przed statusem katalogu
   (`src/lib/status.js` → `eolWLego`, `statusWycofania`, `statusListingu`).
   Wpis `kiedy: "odwołane"` jest dla strony niewidoczny – zestaw wraca do
   statusu z katalogu.
5. **`--napraw` nic nie sprawdza w sieci** (poprzednia wersja tego punktu
   twierdziła, że „sprawdza zestaw na lego.com" — nieprawda, lego.com oddaje
   serwerowi 403). Tryb `--napraw` zostaje jako narzędzie dla człowieka po
   ręcznej weryfikacji; runner go nie używa. Weryfikacją „czy LEGO jeszcze
   sprzedaje" jest pole `lego_pl_widziano` z listingu lego.pl.

**Układ strony `/wycofania/` — jedna lista, nie dwie** *(zmiana 14.09.2026,
decyzja Marka).* Przez dzień wycofania stały w dwóch blokach: najpierw
potwierdzone, pod nimi prognozy. Rozróżnienie było czytelne, ale prognozy
lądowały po kilkuset wierszach i nikt tak nisko nie schodził. Teraz jest jedna
lista z podziałem tylko na serie, a status niesie kolumna „Status" w każdym
wierszu — te same etykiety co wszędzie indziej (`lib/status.js` →
`ETYKIETY_WYCOFANIA`). Wewnątrz serii kolejność idzie od pewnego terminu do
rzeczy już nieosiągalnych: potwierdzone przez LEGO → prognoza rynku →
w sprzedaży (po EOL w LEGO, ale sklepy jeszcze mają) → wycofany (EOL).

Sortujemy po **wyświetlanym** statusie, nie po surowym polu z pliku: zestaw po
EOL w LEGO ma w danych `status: "potwierdzone"`, a na liście jest „w sprzedaży"
— sortowanie po polu z pliku wrzucało go między zestawy z terminem i układ
wyglądał przypadkowo. Zasada rozróżniania faktu od prognozy nie zmienia się ani
o jotę; zmienił się wyłącznie sposób pokazania.

### Nowości (`sety.json`, Scout)

| pole `status_nowosci` | na stronie | znaczenie |
|---|---|---|
| brak albo `potwierdzone` | **wkrótce · potwierdzone przez LEGO** (tylko zapowiedzi) | karta produktu na lego.com albo oficjalny komunikat Grupy LEGO |
| `przeciek` | **przeciek z rynku** | informacja od dystrybutorów, z katalogów sklepowych, od społeczności — numer, nazwa, cena i liczba elementów mogą się zmienić |

Scout ustawia `status_nowosci` **przy każdej zapowiedzi, którą dopisuje**:
`"przeciek"`, gdy źródłem są dystrybutorzy, rezerwacja numeru w Brickset,
StoneWars/PromoBricks czy społeczność; `"potwierdzone"`, gdy LEGO ma kartę
produktu (także „Wkrótce w sprzedaży" / przedsprzedaż), wydało komunikat albo
pokazało zestaw oficjalnie (targi, LEGO Ideas). Dwa zgodne źródła branżowe to
wciąż przeciek – tylko producent potwierdza. Gdy LEGO ujawni zestaw, Scout
przestawia pole na `"potwierdzone"` i uzupełnia oficjalną nazwę, cenę i liczbę
elementów. Brak pola = potwierdzone (tak są traktowane wszystkie zestawy, które
weszły do bazy przed 13.09 i mają kartę na lego.com). Zestaw w sprzedaży jest
z definicji potwierdzony i statusu nie pokazuje.
Logika: `src/lib/premiery.js` (`statusNowosci`, `przeciek`).

### EOL na listingu i w tabeli cen (`src/lib/status.js`)

Dwa pytania, których nie wolno mieszać: *czy LEGO jeszcze sprzedaje* i *czy da
się kupić w sklepach*. Zestaw wycofany przez LEGO bywa miesiącami w Media
Expert, Planecie Klocków czy na Allegro (13.09: 3 152 zestawy z katalogu
„eol" mają ofertę sklepu).

- Listing (`TabelaSetow`): LEGO sprzedaje → „w sprzedaży"; LEGO nie sprzedaje,
  sklep ma → „w sprzedaży" + znacznik **EOL** pod plakietką i cena sklepu;
  nikt nie ma → „wycofany (EOL)", „brak w sklepach – tylko rynek wtórny", bez
  linku do LEGO.com.
- Tabela cen huba (`TabelaCen`): tylko sklepy z aktualną ceną; wiersz LEGO.com
  zostaje z ceną katalogową i znacznikiem **EOL** pod ceną, bez przycisku.
  Wiersze „Sprawdź cenę" bez kwoty (x-kom, Smyk, Empik, link z `redirects.json`
  bez ceny w feedzie) po EOL **znikają** — nie wiemy, czy sklep ma zestaw, więc
  nie wysyłamy czytelnika w pustą wyszukiwarkę. Dla zestawów w sprzedaży
  zostają (decyzja z 20.08.2026 w `redakcja/README.md`).
- Serwer nie sprawdzi lego.com (Cloudflare, 403), ale przeglądarka na Macu
  Marka – tak (sekcja „Jak sprawdzić status na lego.com" niżej). Status EOL
  spoza listy wycofań ustala człowiek, ta metoda albo Firecrawl (sekcja
  „lego.pl: dostępne przez Firecrawl"). Przykład: 76264 Batmobil Pogoń —
  katalog miał `dostepny`, karta na lego.com „Produkcja zakończona"; wpis
  dostał `status: "eol"` i `status_zrodlo`.

### Jak sprawdzić status na lego.com *(metoda z 13.09.2026)*

Karta produktu `https://www.lego.com/pl-pl/product/<numer>` (przekierowuje na
adres ze slugiem) niesie w `<script id="__NEXT_DATA__">` stan Apollo:
obiekt `*Product:*` z `productCode` równym numerowi, jego `variant` →
`ProductVariant` → `attributes.availabilityStatus` i `availabilityText`.
Wartości, które widzieliśmy:

| `availabilityStatus` | `availabilityText` | znaczenie dla nas |
|---|---|---|
| `E_AVAILABLE` | Dostępne teraz | w sprzedaży |
| `K_SOLD_OUT` | Wyprzedane | w sprzedaży (chwilowy brak – NIE eol) |
| `F_BACKORDER_FOR_DATE`, `G_BACKORDER` | zamówienie z opóźnieniem | w sprzedaży |
| `A_PRE_ORDER_FOR_DATE`, `B_COMING_SOON_AT_DATE` | przedsprzedaż / wkrótce | zapowiedź potwierdzona przez LEGO |
| `P_FREE_ITEM`, `Q_OUT_STOCK_FREE_ITEM` | gratis (GWP/polybag) | poza sprzedażą detaliczną – nie ruszać statusu |
| `R_RETIRED` | Produkcja zakończona | **EOL** |
| HTTP 404 | – | LEGO.com PL nigdy nie miało karty (polybagi, część DUPLO) – status z katalogu zostaje |

Z serwera (runner) to nie działa – 403. Z przeglądarki na Macu działa: po
otwarciu dowolnej karty na lego.com można z konsoli pobrać kolejne karty
`fetch('/pl-pl/product/<nr>')` i sparsować `__NEXT_DATA__`. Limity: po ~150
szybkich zapytaniach lego.com odpowiada 429 na ~90 s; tempo 1 zapytanie /
1,5 s przechodzi. Prosty regex po samym HTML **nie wystarcza** – strona
zawiera statusy także polecanych produktów, trzeba czytać obiekt z właściwym
`productCode`. Wynik przebiegu z 13.09: `materialy/audyt-wycofan-2026-09-13.md`.

### Pozostałe ustalenia z 13.09.2026

- **Szczegóły zestawu otwierają się w nowej karcie** z każdego miejsca serwisu
  — dwa poziomy: szablony i pluginy remark (`remark-nazwy-setow`,
  `remark-galeria`) dopisują `target="_blank" rel="noopener"` wprost (działa
  bez JS, widzą to też roboty), a delegacja kliknięcia w `Base.astro`
  (`a[href^="/zestaw/"]`) łapie resztę: ręczne linki w markdownie i wyniki
  wyszukiwarki dorysowane skryptem (tam Enter robi `window.open`). Nowy link
  do huba w szablonie ma dostawać atrybuty jawnie.
- **Podobne zestawy pod hubem**: 4–6 kafelków losowanych z hubów tej samej serii
  (ziarno = dzień + numer, `src/lib/seria-huby.js` → `podobneZSerii`), pod nimi
  „Zobacz całą serię". Pula: najpierw zestawy z ceną i zdjęciem.
- **Tabela cen na telefonie** (`≤720px`): bez ramki karty, wiersz jako siatka
  sklep / cena + rabat / przycisk na całą szerokość (`.tabela-cen-wrap`,
  klasy `kc-*` w `TabelaCen.astro`, w `scripts/remark-ceny.mjs` i na
  `/deale/`). Musi mieścić się w jednym widoku bez przewijania w poziomie.
  Przy zmianie komponentu tabeli poprawiamy oba renderery (komponent i remark).

## LEGO.com: link z huba *(sprawdzone 14.09.2026)*

Raport Kontrolera z 14.09 podał, że 222 oferty LEGO.com nie mają linku i klik
wraca na naszą stronę główną. **Sprawdzone na produkcji — to nieprawda.**
`/idz/lego/42232` oddaje `302` na `lego.com/pl-pl/product/42232`; worker ma dla
LEGO fallback z samego numeru i on działa.

**Drugi koniec tej ścieżki też jest potwierdzony** (Marek, w przeglądarce,
14.09.2026): `lego.com/pl-pl/product/21351` — czyli skrót bez sluga, dla zestawu
spoza tych 741 z kanonicznym adresem — otwiera właściwą kartę produktu. Cała
trasa `/idz/lego/<nr>` → karta zestawu jest więc sprawna, także dla zestawów,
których w `redirects.json` nie ma. To jedyny sposób, żeby to zweryfikować:
z serwera lego.com oddaje 403, więc sprawdza człowiek w przeglądarce.

Wierszy LEGO.com bez linku jest w serwisie 3 015 i **wszystkie dotyczą zestawów
po EOL** — zamiast przycisku stoi tam „produkcja zakończona". To zachowanie
zamierzone: nie wysyłamy czytelnika do sklepu, który zestawu już nie sprzedaje.
Wierszy z działającym linkiem jest 954.

Co mimo to zmieniliśmy: fallback opiera się na CUDZYM przekierowaniu — lego.com
rozwija skrót z numerem na pełny adres ze slugiem. Działa, ale z naszego
środowiska nie da się tego monitorować (lego.com odrzuca ruch serwerowy: 403 na
curl i na WebFetch), więc gdyby LEGO je wyłączyło, dowiedzielibyśmy się od
czytelnika. `scripts/lego-redirects.mjs` wpisuje kanoniczne adresy kart produktu
z katalogu lego.pl — 741 zestawów, sprawdzając, że adres kończy się numerem.
Reszta korzysta z fallbacku jak dotąd.

    node scripts/lego-redirects.mjs katalog-legopl.json --sucho
    node scripts/lego-redirects.mjs katalog-legopl.json

Warto odświeżać przy każdym nowym zaciągu katalogu (`scripts/firecrawl-legopl.mjs`).

---

## lego.pl: dostępne przez Firecrawl *(ustalone 28.08.2026)*

**Od 15.09.2026 listing czytamy co tydzień** (Routine „Dane wt 05:30 — katalog LEGO.pl + ceny Ceneo i Smyk",
prompt w `materialy/routine-prompty.md`). Ten sam Routine odświeża tygodniowo
ceny Ceneo (krok 6) i Smyka (krok 6a) — nazwa mówi „Dane", a nie „LEGO",
bo od 16.09.2026 to jest wspólny slot na dane cenowe, nie tylko listing. Łańcuch:
`firecrawl-legopl.mjs` (katalog + plik RRP) → `lego-ceny.mjs` (cena LEGO.com do
`oferty_feed.sety[nr].oferty.lego` z datą w `daty.lego`, oferta `lego` w
`sety.json`, status `dostepny` + `ekskluzyw` + `lego_pl_widziano` w `katalog.json`)
→ `wczytaj-rrp.mjs` → `lego-redirects.mjs`. Bramka: poniżej 1 000 produktów
w zaciągu = listing się urwał, nie wczytywać. Trzy pułapki:
- `JSON.stringify` sortuje klucze numeryczne — `lego-ceny.mjs` zachowuje
  kolejność z pliku własnym parserem; każdy nowy skrypt piszący `sety.json`
  albo `oferty_feed.json` z JS musi robić to samo (albo pisać z Pythona).
- Etykieta „Ekskluzywne" bywa na listingu przykryta przez „Nowość" / „Zamówienie
  oczekujące" — flagę `ekskluzyw` w `sety.json` skrypt tylko podnosi, nigdy nie
  zdejmuje; rozbieżności wypisuje w raporcie. Strona `/ekskluzywne/` bierze
  sumę flag z `sety.json` i `katalog.json`.
- Numery spoza katalogu i `sety.json` (głównie akcesoria 5xxxxxx) skrypt pomija —
  bez nazwy i serii nie ma z czego zrobić huba.

Serwer nie ma dostępu do lego.com (403 na ruch z data center) i to była nasza
największa dziura w danych — polskie ceny katalogowe braliśmy z Bricksetu,
przeliczane kursem, co dawało systematyczne zawyżenia.

**Firecrawl przechodzi.** Pełny katalog `lego.com/pl-pl/categories/all-sets`
to 57 stron listingu, ~75 kredytów przy pobieraniu jako markdown (ekstrakcja
przez AI kosztuje ~5× więcej i dokłada ryzyko zmyślonych wartości — nie używać).

Wynik pierwszego przebiegu: 1210 pozycji, w tym 814 zestawów. Po wczytaniu do
`rrp_potwierdzone.json`: 119 naszych cen okazało się błędnych (112 zawyżonych),
32 sety dostały brakującą cenę, pule 1 i 2 backfillu (dostępne + wycofania)
zeszły do zera.

**Reguła odczytu ceny:** `RRP = priceBefore` gdy trwa promocja, w przeciwnym
razie `price`. Status „Ostatnie zestawy" to dostępność, nie obniżka — te ceny
są katalogowe. Kontrola: wszystkie kwoty muszą leżeć na polskiej drabinie
(końcówki .99 i .49); cokolwiek innego oznacza błąd scrapowania.

**Czego lego.pl nie da:** zestawów wycofanych z produkcji. Pozostałe 319 pozycji
puli backfillu to EOL z serii Ideas/Icons/Star Wars/Technic/Harry Potter —
tam nadal potrzebny jest Brickset albo inne źródło.

### Zaciąg bez człowieka: Firecrawl przez API *(28.08.2026)*

Serwer MCP Firecrawl żyje tylko w sesji, w której ktoś go akurat podłączył —
runner nie ma jak z niego skorzystać. Za to **`api.firecrawl.dev` przechodzi
przez proxy środowiska** (sprawdzone: odpowiada 401 na zły klucz, czyli allowlista
go przepuszcza). Zaciąg jest więc zwykłym skryptem i nadaje się na zadanie cykliczne.

    scripts/firecrawl.mjs          # cienki klient API (scrape / mapa / ekstrakcja)
    scripts/firecrawl-legopl.mjs   # katalog lego.pl -> JSON + plik dla wczytaj-rrp.mjs

Wymaga `FIRECRAWL_KEY` w zmiennych środowiska sesji (klucz `fc-…` z app.firecrawl.dev).
Bez klucza skrypty kończą się czytelnym komunikatem i niczego nie ruszają.

    node scripts/firecrawl.mjs test                        # weryfikacja klucza
    node scripts/firecrawl-legopl.mjs --strony 2 --rrp /tmp/p.json   # próbka
    node scripts/firecrawl-legopl.mjs --rrp /tmp/ceny.json           # pełny katalog
    node scripts/wczytaj-rrp.mjs /tmp/ceny.json --zrodlo "lego.pl (Firecrawl)" --sucho

Tryb `--z-pliku <katalog.json>` przelicza gotowy plik (np. dostarczony przez Cowork)
tą samą regułą cenową, bez zaciągu i bez klucza.

**Zabezpieczenia przed śmieciem w rejestrze** — rejestr jest write-once i ma
pierwszeństwo przed wszystkim, więc bramek jest kilka:

- numer bierzemy z adresu karty produktu, nie z nazwy (na katalogu z 28.08:
  1210/1210 numerów zgodnych, zero rozbieżności);
- cena musi leżeć na polskiej drabinie (.99/.49/.00) — cokolwiek innego jest
  odrzucane i wypisywane na koniec przebiegu;
- do rejestru wchodzą wyłącznie numery znane z `src/data/katalog.json`; reszta
  ląduje w osobnym pliku `…-spoza-katalogu.json` do obejrzenia (na katalogu
  z 28.08: 701 wchodzi, 113 do przeglądu);
- pozycja w promocji bez ceny sprzed obniżki jest pomijana — lepiej brak ceny
  niż zaniżona.

Skrypt odtworzony na katalogu z 28.08 daje **te same 701 cen co wczytane ręcznie,
zero konfliktów z rejestrem** — reguła jest wierna.

### Ekstrakcja modelem myli elementy z ceną *(sprawdzone 28.08.2026)*

Próbka pierwszej strony listingu przez Firecrawl, format `json` ze schematem:
model wstawił `priceBefore` równe liczbie klocków — **we wszystkich 22 kafelkach**.
SpongeBob 11386: cena 899,99 zł, `priceBefore` 1794 (to liczba elementów).
Klimt 31221: 1299,99 zł i `priceBefore` 4000. I tak dalej.

Gdyby to poszło do rejestru, wpisałoby ceny katalogowe zawyżone kilkukrotnie —
a rejestr jest write-once i ma pierwszeństwo przed wszystkim. Pierwsza wersja
kontroli drabiny **tego nie łapała**, bo dopuszczała końcówkę `.00`, a liczby
elementów są całkowite. Stąd dwie poprawki:

- drabina to **wyłącznie .99 i .49**; `.00` jest zabronione (w katalogu z 28.08
  na 814 zestawów: 805× .99, 7× .49, zero pełnych złotówek);
- osobna bramka odrzuca pozycję, gdy `priceBefore === elements`.

Sprawdzone na tych samych zmyślonych danych: wszystkie 5 testowanych pozycji
odrzuconych, do rejestru trafia zero.

**Dlatego domyślnym trybem jest markdown, nie ekstrakcja.** `scripts/parser-legopl.mjs`
czyta kafelki regułą: nagłówek `### [nazwa](url)`, pod nim kwoty, pod nimi etykiety;
liczba elementów stoi przed nagłówkiem, po znaczniku wieku. Gdy w kafelku są dwie
kwoty, katalogowa to wyższa. Ekstrakcja została jako `--tryb ekstrakcja`, na wypadek
gdyby lego.pl przebudowało listing.

**Koszt** (zmierzony, `creditsUsed` z odpowiedzi): markdown **1 kredyt/stronę**,
ekstrakcja **5**. Pełny katalog to 57 stron, czyli ~57 kredytów miesięcznie zamiast ~285.

Dwie pułapki parsera, obie już obsłużone, ale warto o nich wiedzieć przy zmianach:
ostatni kafelek na stronie zgarnia stopkę listingu (odcinamy na „Wyświetla N z M"),
a etykieta statusu musi dopuszczać cyfry — bez nich przepada „Czyszczenie magazynu
-30%", jedyna informacja przesądzająca o tym, że cena jest promocyjna.

## Alerty cenowe „Obserwuj zestaw" *(na produkcji od 15.09.2026)*

Hub zestawu ma formularz (`src/components/ObserwujCene.astro`) → `POST /obserwuj`
w workerze → obiekt `_obserwuj/<nr>/<token>.json` w kubełku R2 `tylkoklocki-obrazy`
(ten sam binding `OBRAZY`, żadnej nowej infrastruktury) → mail potwierdzający
z Resend (double opt-in, link `/obserwuj/potwierdz?nr=&t=`) → codziennie
`scripts/alerty-cen.mjs` liczy najlepszą cenę z danych serwisu i pisze, gdy
zestaw jest ≥20% poniżej ceny katalogowej (próg „dobry" z reguł deali) i taniej
niż przy ostatnim alercie. Rezygnacja: `/obserwuj/rezygnuj?nr=&t=` kasuje obiekt.

Worker ma sekret `RESEND_API_KEY` (dodany ręcznie w panelu 15.09: Workers →
blogoklockach → Settings → Variables and Secrets). Bez niego worker odsyła na hub
ze stanem `niedostepne` i nic nie zapisuje. Maile z alertami wysyła Routine
„Alerty cen" (prompt „LEGO 09:30 — Alerty cen" w `materialy/routine-prompty.md`, kopia z konta) — bez
niego zapisy się zbierają, ale nikt nie dostaje alertu. Podgląd zapisów bez
wysyłki: `node scripts/alerty-cen.mjs --sucho`.

Nadawca `alerty@tylkoklocki.pl` — ta sama domena, którą Resend ma już
zweryfikowaną dla `raporty@`. Polityka prywatności ma sekcję o alertach
(`#obserwuj`); formularz linkuje do niej. Honeypot (pole `www`) odsiewa boty
bez captchy. Adresy niepotwierdzone przez 7 dni kasuje skrypt alertów.

## Dział /deale/ (od 29.08.2026)

Podstrona `/deale/` generuje się z danych przy każdym buildzie: deale gorące
(rabat ≥30% od ceny katalogowej lub świeże minimum notowań) w trzech półkach
cenowych, z badge'ami nowych minimów i CTA afiliacyjnymi — bez ręcznie
wpisanych kwot, więc nie wymaga żadnej obsługi.

Posty dealowe to markdown w `src/pages/deale/` (frontmatter jak artykuł +
`dzial: "Deale"`, kategoria „Deal dnia", tag „Dla rodziców"/„Dla AFOL").
Łowca dopisuje 1–2 przy wyjątkowych okazjach — nowe minima na drogich
zestawach, okazje sezonowe — wg standardu sprzedażowego: ceny sklepowe
wyłącznie przez `<div class="ceny-setu" data-set>`, w treści tylko RRP,
dobra cena i próg zakupu; linki przez `/idz/<sklep>/<nr>`. Posty nie wchodzą
do `/artykuly/` ani na listing strony głównej (glob ich nie łapie).

## Karty zestawów — import paczek Piotra *(ustalone 31.08.2026)*

Opisy DOCX od Piotra (zip per seria) wchodzą do `karty_setow.json` **wyłącznie
przez** `python3 scripts/import-karty.py <zipy/katalogi> --sucho`, a po
przejrzeniu raportu — bez `--sucho`. Nigdy Node'em: klucze numeryczne +
wcięcie 1 bez końcowego `\n` (patrz „Stabilność formatu plików JSON").

Co robi skrypt: parsuje strukturę Opis→Metryka→FAQ, zamienia placeholdery
`[… – link wewnętrzny]` na `#ceny`/`/serie/<slug>/`, domyka znane zgrzyty
szablonu mail-merge (pola w dopełniaczu po „są/tworzą" — decyzja Marka
31.08: poprawiamy minimalnie, każda korekta w logu), dopisuje akapity
redakcyjne wg progu (501–1200 el.: +1, 1201+: +2) liczone z katalog.json
i pilnuje bramek: **rozjazd RRP blokuje kartę**, rozjazdy elementów /
premiery / dystrybucji tylko raportuje.

Rozjazdy rozstrzyga się **przed** importem u źródła: Brickset przez curl
(`https://brickset.com/sets/<nr>-1`, pola Launch/exit, Availability,
Pieces — parsować `<dt>…</dt><dd>`). Przy paczce P07 arbitraż wykazał
błędy po OBU stronach (nasze brakujące flagi ekskluzywu i złe premiery
vs elementy/dystrybucja u Piotra) — nie zakładać z góry, kto ma rację.

Nazwa w karcie i metryce jest zawsze kanoniczna (repo); tekst akapitów
Piotra zostaje. Sekcję „Metryka zestawu" renderuje `[nr].astro` między
opisem a FAQ — pole `metryka` musi być mapą klucz→wartość.

---

## Ceny Empik *(od 29.08.2026; deeplinki i skrypt importu od 16.09.2026)*

Empik blokuje ruch serwerowy, więc zrzut katalogu robi Marek lokalną
przeglądarką (skill `klocki-ceny-empik`, rytm poniedziałkowy — przypomina o tym
Routine „Przypomnienie: zrzut Empiku"). Plik `lego-empik.json` wchodzi do danych
**skryptem**, nie z pamięci sesji:

    node scripts/empik-import.mjs lego-empik.json --sucho    # raport, nic nie zapisuje
    node scripts/empik-import.mjs lego-empik.json            # ceny do feedu, sety.json, ceny_baza
    node scripts/empik-redirects.mjs lego-empik.json --usun-martwe   # deeplinki kart produktu

Reguły importu są w skrypcie i tylko tam (do 16.09 żyły w pamięci trwałej sesji
Łowcy — commit `f9b0cef` „415 gadżetów, 54 sanity, 10 konfliktów" nie miał
pokrycia w żadnym prompcie): numer 4–7 cyfr bez zera wiodącego, konflikt numeru
z nazwą rozstrzygany po katalogu (Empik wpisuje w `setNumber` liczbę elementów
„1016el" albo model auta), gadżety po rdzeniach nazwy, próg sanity 40% ceny
katalogowej, tylko zestawy z hubem, z kilku pozycji najtańsza, zestaw nieobecny
w zrzucie traci cenę Empiku, `daty.empik` = data zrzutu (`meta.scrapedAt`).
Zapis przez `json-kolejnosc.mjs`, walidacja liczby wpisów.

Plik wrzucasz **do Code** (jak każdy załącznik) albo do sesji Łowcy z notką
„uruchom `node scripts/empik-import.mjs lego-empik.json`, potem
`empik-redirects.mjs --usun-martwe`". Stan 16.09.2026: 3 947 cen ze zrzutu
z 15.09, 4 480 deeplinków (`redirects.empik`), 13 cen dla numerów spoza
katalogu (bez huba, nieobsługiwane). Smyk i lego.pl mają własne cotygodniowe
odświeżenie (sekcje „Smyk" i „lego.pl" w tym pliku).

---

## Sitemapy i Search Console *(ustalone 31.08.2026, przebudowane 09.09.2026)*

Od 09.09.2026 sitemapy generują **własne endpointy** (`src/pages/sitemap-*.xml.js`,
logika w `src/lib/sitemapy.js`); integracja `@astrojs/sitemap` została zdjęta,
plik `sitemap-0.xml` już nie istnieje. Adres indeksu **nie zmienił się**.

| Adres | Co zgłasza | Skąd |
|---|---|---|
| `/sitemap-index.xml` | indeks siedmiu sitemap sekcyjnych niżej | `src/pages/sitemap-index.xml.js` |
| `/sitemap-artykuly.xml` | `/artykuly/` + artykuły spod `/artykuly/` | `src/lib/teksty.js` |
| `/sitemap-prezentowniki.xml` | `/prezentowniki/` + prezentowniki `.md` i `.astro` | `src/lib/teksty.js` |
| `/sitemap-deale.xml` | `/deale/` + posty dealowe | `src/lib/teksty.js` |
| `/sitemap-serie.xml` | `/serie/` + strony serii (bez adresów przekierowanych w `astro.config.mjs`) | `src/lib/sitemapy.js` |
| `/sitemap-nowosci.xml` | `/nowosci/` + miesiące premier | ta sama reguła co `nowosci/[miesiac].astro` |
| `/sitemap-zestawy.xml` | huby `/zestaw/<nr>/`, **tylko indeksowalne** | `hubIndeksowalny()` z `src/lib/seo.js` |
| `/sitemap-inne.xml` | `/`, `/o-nas/`, `/wycofania/`, `/kolekcjoner/`, `/kalendarz-promocji-lego/`, `/zapowiedzi-lego-2027/` | `src/lib/sitemapy.js` |
| `/sitemap-priorytet.xml` | strona główna, kategorie, teksty, zestawy z kartami (i indeksowalne) | `src/pages/sitemap-priorytet.xml.js` |

Sens podziału: w GSC każda sekcja ma osobny licznik „przesłane / zindeksowane",
więc widać, czy Google nie indeksuje tekstów, czy hubów cenowych. Wszystko
liczy się przy buildzie i nie wymaga utrzymania. `sitemap-priorytet.xml`
zostaje, bo jest zgłoszona w GSC – dubluje część sekcyjnych; można ją zdjąć,
gdy sekcyjne przejmą jej rolę w raportach.

**`<lastmod>` wszędzie, gdzie data jest prawdziwa** (decyzja Marka 09.09.2026):
teksty biorą `zaktualizowano` z frontmattera / `meta` (fallback `data`); huby
zestawów – późniejszą z dat: nasz tekst o zestawie albo ostatnia oferta
sklepowa (tego dnia zmieniła się tabela cen); serie – najświeższy hub lub
tekst serii; miesiące nowości – najświeższy zestaw z premierą w tym miesiącu;
strony przeliczane co dzień z cen (`/`, `/deale/`, `/nowosci/`, `/serie/`,
`/wycofania/`, `/kolekcjoner/`) – data builda, bo realnie zmieniają się
codziennie. Bez daty zostaje tylko `/o-nas/` i huby bez tekstu i bez oferty.
Data z przyszłości jest przycinana do dzisiejszej. **Nie stemplować datą
builda stron, które się nie zmieniły** (artykułów, hubów bez świeżej oferty) –
przy niewiarygodnym `lastmod` Google przestaje ufać polu w całej witrynie.
Teksty z korzenia (`/kalendarz-promocji-lego/`, `/zapowiedzi-lego-2027/`) są
w `sitemap-inne.xml`, nie w artykułach – tak są zgłoszone w GSC.

**Noindex na cienkich hubach.** `src/lib/seo.js` → `hubIndeksowalny(nr)`:
hub jest indeksowany, gdy spełnia **co najmniej trzy z czterech** warunków
(≥3 sklepy z ceną bez Ceneo; tekst redakcyjny >300 znaków – opis/persony
z `sety.json`, karta z `karty_setow.json` albo uwagi z wycofań; wspomniany
w naszym tekście; premiera w ostatnich 18 miesiącach i nie wycofany), **albo**
jest w prezentowniku, **albo** ma gorący deal (reguła jak na `/deale/`).
Pozostałe huby dostają `<meta name="robots" content="noindex, follow">`
(`Base.astro`, prop `noindex`), działają normalnie i nie ma ich w sitemapie.
Stan 09.09: **799 indeksowalnych z 4 947**. Stan 15.09: **1 162 z 9 363** — huby
dla całego katalogu (nigdy 404) i wyjątek „karta": hub z kartą Piotra (≥2 akapity,
≥3 FAQ) jest indeksowalny jak prezentownik i deal (decyzja Marka 15.09.2026). Progi (`MIN_SKLEPOW`,
`MIESIACE_PREMIERY`, `MIN_WARUNKOW`) są stałymi na górze `seo.js`; pierwsza
gałka, gdyby trzeba było zejść niżej, to wyjątek dealowy (~170 hubów).

**Feed RSS:** `/rss.xml` (`src/pages/rss.xml.js`, `@astrojs/rss`) – 30
najnowszych tekstów z tego samego indeksu `src/lib/teksty.js`; link w `<head>`
każdej strony i w stopce. Zgłaszać w GSC **nie trzeba** (to nie sitemapa);
efekt sprawdzać w raporcie Discover po ~2 tygodniach.

**Bloki pod tekstami:** `Faq.astro` (widoczne FAQ z frontmattera `faq` /
propsa `faq` – do 09.09 FAQ szło wyłącznie do JSON-LD, a Google wymaga treści
widocznej; artykuł z własnym „## FAQ" w treści nie dostaje drugiego bloku)
i `PowiazaneArtykuly.astro` („Przeczytaj też": 4 linki, dobór w
`src/lib/powiazane.js` – wspólne zestawy → wspólna seria → kategoria → data;
deale tylko z ostatnich 30 dni). Autor w schema i w widocznym podpisie:
`src/config.js` → `AUTOR.imie` = „Piotr M." (decyzja Marka 09.09; puste =
organizacja; frontmatter `autor:` nadpisuje per tekst).

**Usługa w GSC jest domenowa (`sc-domain:tylkoklocki.pl`).** Praktyczny skutek:
w polu „Dodaj nową mapę witryny" trzeba wpisać **pełny adres**
(`https://tylkoklocki.pl/sitemap-priorytet.xml`), a nie samą nazwę pliku.
Usługa domenowa obejmuje wiele protokołów i subdomen, więc GSC nie dokleja
prefiksu i odrzuca samą ścieżkę komunikatem „Nieprawidłowy adres mapy witryny".
Doklejanie prefiksu działa tylko w usługach typu „prefiks URL".

**Sitemapa nie powoduje indeksacji, tylko wykrycie.** Diagnoza z 24.08: adresy
były znane Google'owi ze statusem „wykryta, obecnie niezindeksowana" i datą
crawla NIGDY — czyli wykrycie już nastąpiło, a robot świadomie nie wchodził.
Ponowne zgłoszenie listy tego samo nie odwróci; zmienia to jakość treści
i linkowanie wewnętrzne.

**Karta ≠ podstrona — rozwiązane 15.09.2026.** Do 15.09 hub powstawał tylko
dla numeru z `katalog.json`, więc karty spoza katalogu (31.08: 32 z 445) nie
miały strony. Od 15.09 każdy numer z katalogu ma hub, a karty importowane są
tylko dla numerów z katalogu; 16.09: 1 097 kart, wszystkie z hubem
(sprawdzone w audycie końcowym). `sitemap-priorytet.xml.js` dalej filtruje
przez `maHub` — to tania bramka, zostaje.

## Przecieki — dział osobno od faktów *(od 15.09.2026, decyzja Marka)*

`/przecieki/` pokazuje nieoficjalne zapowiedzi z `src/data/przecieki.json`
(`src/lib/przecieki.js`, strona `src/pages/przecieki/index.astro`). Zasady:

- **Przeciek nigdy nie wchodzi do huba faktów**, tabeli cen ani danych
  strukturalnych `Product`. Dostaje cenę „ok. X zł wg źródła", termin wg źródła,
  ocenę pewności i źródło. Progu zakupu nie ma, bo cena nie jest katalogowa.
- **Pewność** (drabina jak przy prognozach wycofań): *wysoka* = ≥2 niezależne
  serwisy (PromoBricks + StoneWars) zgodne co do numeru i ceny; *średnia* = jedno
  źródło branżowe + dowód (zdjęcie, listing sklepu, katalog dystrybutora);
  *niska* = jedno źródło społecznościowe albo sam numer.
- **Tablica trafności** to wyróżnik działu: po premierze albo zaprzeczeniu Scout
  dopisuje `rozstrzygniecie: {kiedy, wynik: potwierdzony|zmieniony|obalony,
  co_sie_zmienilo}`. Wpis nigdy nie jest kasowany — to historia trafności.
- Gdy LEGO potwierdzi przeciek, Scout dopisuje zestaw do `sety.json` jak każdą
  nowość (bez `status_nowosci: przeciek`) i rozstrzyga wpis w `przecieki.json`.
  Zestawy, które siedzą w `sety.json` z `status_nowosci: przeciek` (stan sprzed
  działu: 21375, 11387, 77094), mają hub bez ofert i plakietkę linkującą do działu.
- Strona jest w sitemapie `inne` i w menu od pierwszego dnia (Marek: „od razu do
  sitemapy"). Do RSS przecieki nie wchodzą — RSS to teksty redakcyjne.
- Właściciel danych: Scout (codziennie 05:00). Prompt Scouta ma krok „PRZECIEKI".
- Format pliku: JSON z wcięciem 1 spacji jak `sety.json` (od 16.09.2026; pierwsza
  wersja miała hybrydę „_meta z wcięciem, wpisy w jednej linii" i Scout musiał
  pisać własny serializer). Zapis z Pythona: `json.dump(..., ensure_ascii=False, indent=1)`
  + końcowy `\n`; z JS: `JSON.stringify(d, null, 1) + '\n'` (klucze nie są numeryczne,
  więc kolejność się nie psuje).

## Worker za warstwą assets: trasy workera muszą być w `run_worker_first` *(awaria 15.09.2026 wieczorem)*

Objaw: każde kliknięcie w link sklepu wracało na `/idz/<sklep>/<nr>` jako
strona 404; padły też obrazy otwierane w nowej karcie, linki `/obserwuj/`
z maili i 410 dla `/p/…`. Z serwera wszystko „działało": curl dostawał 302.

Przyczyna: Cloudflare Workers Static Assets obsługuje żądania NAWIGACYJNE
przeglądarki (nagłówek `Sec-Fetch-Mode: navigate`) najpierw warstwą plików;
dla ścieżki bez pliku i przy `not_found_handling: "404-page"` oddaje stronę
404 i workera nie uruchamia. curl tego nagłówka nie wysyła, więc trafia do
workera — testy z serwera są ślepe na ten błąd.

Naprawa: `wrangler.jsonc` → `assets.run_worker_first` z listą ścieżek workera
(`/idz/*`, `/img/*`, `/obserwuj`, `/obserwuj/*`, `/p/*`). Reszta serwisu dalej
idzie z plików statycznych. Każda nowa trasa w `src/worker.js` MUSI trafić na tę
listę, inaczej w przeglądarce dostanie 404.

Test, który wykrywa tę klasę awarii (do `diagnoza.mjs` i do ręcznych sprawdzeń):

    curl -sS -o /dev/null -w "%{http_code} %{redirect_url}\n" \
      -H "Sec-Fetch-Mode: navigate" -H "Sec-Fetch-Dest: document" \
      -H "Accept: text/html" -H "Sec-Fetch-Site: same-origin" \
      https://tylkoklocki.pl/idz/lego/76355      # oczekiwane: 302 na lego.com

Nie wiadomo, czemu do 15.09 rano działało bez `run_worker_first` — konfiguracja
w repo się nie zmieniała; najpewniej zmiana po stronie Cloudflare, która weszła
przy którymś z deployów tego dnia. Nie da się tego sprawdzić z kontenera.

## Lidl przez Tradedoubler — działa od 18.09.2026

Lidl online ma w Tradedoublerze feed produktowy **„LEGO klocki", fid 259772**
(tylko klocki LEGO). Program „Lidl Sklep Online" (programId **298327**) dostał
akcept 17.09, ale feed przez dobę odpowiadał `PF_392 „Requester is not connected
to Feed (259772)"` — akcept programu i podpięcie feedu do witryny to w TD **dwie
różne rzeczy**. Ruszyło 18.09 po zgłoszeniu Marka do TD; z perspektywy kodu nie
było czego naprawiać, trzeba było tylko sprawdzać feed co kilka godzin.

Stan: `feedy.json` → `lidl.aktywny: true`, `sklepy.json` → `lidl: Lidl`,
`afiliacje_rejestr.json` → status `aktywny`. Pierwszy import 18.09: **102 produkty
w feedzie, 60 rozpoznanych numerów zestawów, 60 linków w `redirects.lidl`,
55 ofert w `sety.json`.**

`scripts/ceneo-feed.mjs` obsługuje **wszystkie feedy TD z `feedy.json`** (bez
argumentów: wszystkie aktywne; `--sklep lidl` jeden; `--sucho` bez zapisu) —
krok 6 wtorkowego Routine bierze Lidla automatycznie, bez zmiany w promptach.
Sklep z własnym magazynem (Lidl) dostaje też ofertę w `sety.json` (deale);
Ceneo nadal nie (porównywarka).

Linki idą z feedu (gotowy `pdt.tradedoubler.com`), worker bierze je
z `redirects.lidl` — **bez zmian w `src/worker.js`**. Konsekwencja: zestaw spoza
feedu nie dostaje linku do Lidla w ogóle.

**Decyzja Marka (18.09.2026): tak zostaje — tylko linki z feedu.** Innych sklepów
dotyczy to inaczej (w workerze stoi zapasowy deeplink na wyszukiwarkę), ale dla
Lidla zapasu **nie dorabiamy**: link do wyszukiwarki lidl.pl bez parametrów TD
wypuszczałby ruch bez prowizji. Nie wracamy do tematu bez nowej decyzji —
w szczególności nie dopisujemy Lidlowi pola `szukaj` w `sklepy.json`, bo to
ta sama ścieżka tylnymi drzwiami (worker schodzi na `sklepy[sklep].szukaj`).

## Lidl codziennie, choć jedzie importerem „wtorkowym" *(od 18.09.2026)*

Marek: skoro mamy feed produktowy, Lidl ma się odświeżać codziennie, nie raz
w tygodniu. Prompt Łowcy siedzi w **stałej sesji** (zmiana = delete + create
triggera), więc dokładanie tam kroku byłoby operacją na żywym runnerze.

Zrobione inaczej i to jest wzorzec na przyszłość: **`scripts/feedy-lego.py`
(który Łowca uruchamia codziennie) sam woła `ceneo-feed.mjs` dla tych feedów TD,
które mają w `feedy.json` pole `"odswiezanie": "codziennie"`.** Częstotliwość
sklepu jest więc decyzją w danych, dokładnie jak mówi `_meta` tego pliku — żeby
przestawić kolejny sklep na codzienny, wystarczy jedno pole, bez ruszania
promptów. Ceneo zostaje tygodniowe (porównywarka, duży feed).

Kolejność jest bezpieczna: importer zapisuje dane, ZANIM Łowca je wczyta i dopisze
swoje oferty. Błąd feedu nie przerywa przebiegu — ląduje w `_meta.bledy['td:<sklep>']`
wyciągu i w raporcie Łowcy.

Przy okazji poprawka w `ceneo-feed.mjs`: TD potrafi odpowiedzieć **200 z samym
komunikatem** „Unlimited file will be created…" zamiast 202. Przedtem skrypt
uznawał to za pusty feed i pomijał sklep — przy dziennym przebiegu oznaczałoby to
ciche zniknięcie ofert na dobę. Teraz czeka i ponawia.

## Kontrola linków sklepowych — próba losowa, nigdy przez tracker *(od 18.09.2026)*

`node scripts/kontrola-linkow.mjs --ile 200` — krok Kontrolera w poniedziałek.
Losuje linki z `redirects.json` i sprawdza, czy karta produktu jeszcze żyje.

**Zasada nienaruszalna: nie odpytujemy linków trackingowych.** Wejście na
`pdt.tradedoubler.com`, `clk.tradedoubler.com`, `webep1.com`,
`track.performers.tech` czy `allegro.pl/affiliate` to zarejestrowany klik
w sieci afiliacyjnej — sztucznie nabity, bez człowieka. Skrypt wyciąga z linku
**adres docelowy sklepu** (`url(...)`, `&url=`, `redirect_url=`, base64 w `r=`)
i sprawdza wyłącznie jego.

**Czego się nie da sprawdzić z kontenera** (zmierzone 18.09.2026 na próbie 150):
Allegro, Empik, Media Expert i LEGO.com odrzucają każde zapytanie serwerowe —
403 albo timeout, niezależnie od nagłówków. Dlatego skrypt bierze z nich tylko
**5 linków kontrolnych** (żeby zauważyć, gdyby któryś przestał blokować), a resztę
próby przeznacza na Planetę Klocków, Ceneo, Smyk, Lidla i x-kom. W raporcie te
sklepy mają własną kolumnę „blokada sklepu" — nigdy nie wolno policzyć ich jako
„żywe". Pierwszy przebieg znalazł jeden martwy link (Planeta Klocków, 43024, 404).

Mail idzie tylko, gdy są martwe (klucz `linki` w `raporty_mail.json`, kontakt@).

## Historia cen — seria czasowa pod wykresy *(od 18.09.2026)*

Do 18.09.2026 **nie mieliśmy żadnej historii cen**: `ceny_baza.json` trzyma
wyłącznie minimum wszech czasów (jedna liczba), a `oferty_feed.json` to migawka
z dziś. Wykres „jak zmieniała się cena" był niewykonalny — i pozostałby taki,
dopóki ktoś nie zacznie zapisywać.

`scripts/historia-cen.mjs` (odpalany codziennie przez `feedy-lego.py`) dopisuje
najniższą dzienną cenę każdego zestawu do `src/data/historia-cen/RRRR-MM.jsonl`
w formacie `{"d":data,"nr":numer,"c":cena,"s":sklep}`. **Tylko zmiany** — gdy cena
stoi, linii nie ma. Stan ostatnich cen trzyma `_ostatnie.json`, żeby nie czytać
całej historii przy każdym przebiegu.

Dlaczego w `src/data`, skoro to nie są dane serwisu: **runnery commitują
`src/data`** (Łowca i wtorkowy „Dane 05:30" mają to wprost w promptach), a kontener
po przebiegu znika — plik poza tym katalogiem groziłby tym, że historia nigdy nie
trafi do repo. Buildowi to nie ciąży: Astro pakuje wyłącznie to, co ktoś
zaimportuje, a `.jsonl` nie importuje nikt (w `src/` nie ma `import.meta.glob`
po `src/data`). Gdy dojdą wykresy na hubach, osobny skrypt wytnie z tego
kompaktową serię (punkty tygodniowe, tylko zestawy z hubem) do zwykłego `.json`.

Pierwszy zapis 18.09.2026: 5 966 zestawów, 328 kB. Ceneo pomijamy (porównywarka).

## Smyk: ceny wprost ze stron produktów, bez feedu i bez Firecrawla *(od 16.09.2026)*

Adtraction **nie daje feedu produktowego dla Smyka** — sprawdzone w API
(`GET /v2/affiliate/programs?market=PL`: `Smyk PL` ma `"feed": false`, dla
porównania `Egmont.pl` ma `true`). Dlatego ceny stały od jednorazowego zrzutu
z 29.08 i hub pokazywał je jako świeże (wspólna data wpisu).

Rozwiązanie: **smyk.com odpowiada zwykłemu `curl` z kontenera** (200, ~0,5 MB,
1,7 s) i niesie cenę oraz dostępność w danych strukturalnych:

    <meta itemProp="price" content="1179"/>
    <link itemProp="availability" href="http://schema.org/InStock"/>

`node scripts/smyk-odswiez.mjs` czyta 704 adresy kart z `redirects.smyk`, pobiera
je po sześć naraz (ok. 4 min) i zapisuje `oferty.smyk` + `daty.smyk`. Zestaw
wyprzedany (`OutOfStock`) traci cenę — jego karta nie pokazuje wtedy żadnej kwoty
(przykład 10333 Barad-dûr). Błąd sieci NIE kasuje wczorajszej ceny; domyka je
`--stare` (tylko zestawy bez dzisiejszej daty). Pierwszy przebieg 16.09: 668 cen,
95 realnie zmienionych wobec zrzutu z 29.08, 36 zestawów wyprzedanych.

Uwaga o prowizji bez zmian: linkujemy wprost na kartę produktu, bo deeplink
Adtraction nie dowozi (patrz rejestr afiliacji).

## Oferty w sety.json: kolejność alfabetyczna po sklepie *(od 16.09.2026)*

Łowca zapisywał oferty posortowane po cenie, więc każda zmiana ceny przestawiała
kolejność — diff jednego przebiegu miał 76 tys. linii (wcięcie 2 spacji, oferta
to 5 linii). Historia zmian była nieczytelna, a przy konflikcie rebase nie dało
się zobaczyć, co runner naprawdę zmienił.

Od 16.09 kolejność jest stała: **alfabetycznie po `sklep`**. Strony to nie
dotyczy — `TabelaCen` i `najlepszaOferta()` sortują po cenie same, więc czytelnik
dalej widzi najtańszą ofertę na górze. Normalizacja: `node scripts/porzadek-ofert.mjs`
(`--sucho` pokazuje, ile wpisów wymaga zmiany). Reguła jest w promptcie Łowcy;
każdy skrypt dopisujący ofertę do `sety.json` ma ją utrzymać.

## Oferty przeterminowane i „podejrzany rynek": sito przy odczycie *(od 16.09.2026)*

`src/lib/oferty.js` → `filtrujOferty()` jest jedynym sitem dla ofert z `sety.json`
i z feedu; przechodzą przez nie tabela cen huba, meta/JSON-LD, karuzela na
stronie głównej, `/deale/`, listingi serii i ocena indeksowalności. Dwie reguły,
obie przy odczycie (dane zostają surowe, jak przy odsiewie podszywek):

1. **Wiek oferty — 14 dni** (`MAX_WIEK_OFERTY_DNI`). Audyt 16.09 znalazł w
   `sety.json` osiemnaście ofert z 12–16.08 (sklepy bez feedu: proshop, rozetka,
   brixani, sferis, dadada, klocekplus, bricksberg, amazon; cztery LEGO.com sprzed
   listingu) z normalnym przyciskiem „Sprawdź w sklepie" — trzy prowadziły na
   stronę główną sklepu, bo szablon `szukaj` nie miał `{nr}`. Oferty usunięte
   (`scripts/oferty-przeterminowane.mjs`), szablony bez `{nr}` wycięte ze
   `sklepy.json`, a sito pilnuje, żeby to nie wróciło. Sklepy tygodniowe
   (Ceneo, Empik, Smyk, LEGO.com) mieszczą się w 14 dniach z zapasem.
2. **Podejrzany rynek — poniżej 50% potwierdzonego RRP**
   (`PROG_PODEJRZANEGO_RYNKU`). Odsiew podszywek działa od 28%, ale cena
   47–50% katalogu przy RRP potwierdzonym przez człowieka to najczęściej
   zaślepka sklepu; taka oferta nie wchodzi nigdzie, dopóki człowiek nie
   sprawdzi jej w sklepie i nie dopisze do `src/data/deale_potwierdzone.json`
   (numer, cena, sklep, data, kto). Wpis obowiązuje, dopóki cena nie spadnie
   poniżej potwierdzonej. Kandydatów pokazuje `node scripts/kontrola-rrp.mjs`
   („Test rynkowy": wiersz mówi, czy oferta jest potwierdzona i na stronie,
   czy ukryta). 16.09: 60339, 10423, 76156 — prawdziwe wyprzedaże końcówek
   (Empik + Ceneo), potwierdzone przez Marka.
   **Rano przychodzi mail** (decyzja Marka 16.09): Łowca po zapisie danych
   uruchamia `scripts/podejrzany-rynek-mail.mjs` — lista ukrytych ofert z linkiem
   do sklepu i do huba na kontakt@ (klucz `podejrzane` w `raporty_mail.json`;
   brak kandydatów = brak maila). Marek potwierdza w rozmowie z Code
   („potwierdzam <nr> <cena> <sklep>"), Code dopisuje do `deale_potwierdzone.json`,
   oferta wraca na stronę z najbliższym buildem.

Kontrola po zmianach: `node scripts/kontrola-rrp.mjs` (test rynkowy) i skaner
`dist/` z audytu (żaden link `/idz/` nie może prowadzić na stronę główną sklepu).

## Zestaw po EOL: link do lego.pl zostaje, dopóki żyje karta produktu *(zasada Marka 16.09.2026)*

Powód: `75377 Niewidzialna ręka` ma u nas status „brak w lego.pl" i nie miał
linku, a na `lego.com/pl-pl/product/invisible-hand-75377` dalej są zdjęcia,
opis, wymiary i adnotacja „Produkcja zakończona". Czytelnik ma po co tam pójść,
nawet jeśli nie kupi.

Reguła w tabeli cen (`src/components/TabelaCen.astro`, wiersz `wiersz-eol`):

1. Zestaw po EOL ze znaną ceną katalogową dostaje wiersz LEGO.com z tą ceną,
   plakietką **„brak w sprzedaży"** i przyciskiem „Sprawdź w sklepie" (link
   `/idz/lego/<nr>`, wyciszony stylem `.cta--eol`, żeby nie konkurował z realnymi
   ofertami). Pod nazwą sklepu: „zestawu już nie kupisz, ale na karcie zostały
   zdjęcia, opis i wymiary".
2. Link znika **tylko wtedy**, gdy karty produktu nie ma. Numery takich zestawów
   trzyma `src/data/lego_strony_brak.json` (`legoMaStrone()` w `src/lib/oferty.js`).
3. Adres buduje worker z samego numeru — `lego.com/pl-pl/product/<nr>` przekierowuje
   na pełny slug także po EOL (sprawdzone na 75377).

Weryfikacja: `node scripts/lego-strony.mjs <numery>` albo `--kandydaci N`
(zestawy `eol` z ceną katalogową, od najstarszych). 1 kredyt Firecrawla na zestaw;
karta istniejąca to ~30 tys. znaków markdownu, nieistniejąca ~70 znaków (lego.com
oddaje pustą stronę, nie 404). **Sitemapa lego.pl nie nadaje się do tego testu:**
`sitemap-productPage-pl-PL0.xml` ma 2 165 numerów, ale 75377 w nim nie ma, choć
karta żyje. Stan 16.09.2026: sprawdzone 3 zestawy z lat 2005–2007 (10182, 7235,
2198) — kart nie mają. Resztę bierzemy partiami przy wtorkowym zaciągu LEGO.pl.
