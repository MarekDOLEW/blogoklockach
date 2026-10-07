# Audyt mechanizmu tylkoklocki.pl — 15.09.2026

*Sesja Code, na prośbę Marka: „ostatni test przed oddaniem". Zakres: przepływ
danych runnery → serwis, techniczne SEO i indeksacja, UX i wydajność, pipeline
redakcyjny, wartość na tle konkurencji, nisze. Każda teza ma źródło — liczby są
z buildu `9575467`, z API Search Console/GA4/Cloudflare albo z plików repo.
Czego nie dało się sprawdzić, jest oznaczone jako „nie sprawdzono".*

---

## 0. Werdykt w trzech zdaniach

Mechanizm produkcyjny jest **szczelny**: dane płyną z runnerów do plików, z plików
do buildu, z buildu na produkcję; dziś nie znalazłem miejsca, w którym coś ginie po
drodze (poza trzema lukami opisanymi w §1). Problem jest **na wyjściu**: serwis ma
852 adresy w sitemapach i **7 kliknięć z Google w 30 dni**, a największym źródłem
ruchu w ostatnim tygodniu był ChatGPT (37 z 78 użytkowników). Mamy fabrykę, która
działa, i wystawę, do której nikt jeszcze nie trafia — dalsza praca musi iść
w widoczność i w formaty, których konkurencja nie ma, a nie w kolejne rurki.

---

## 1. Przepływ danych: runnery → pliki → strona

### Co działa (sprawdzone dziś)

| Ogniwo | Dowód |
|---|---|
| Scout 05:06 → `sety.json`, `wycofania.json` → commit → deploy | commit `f743218` dziś 05:10, na produkcji po ~70 s |
| Łowca 08:38 → ceny → huby | „Ceny sprawdzone: 2026-09-14" na hubach; Allegro 3662, Empik 1639, ME 337, Smyk 205 wpisów z 14.09 |
| Zdjęcia → R2 04:00 | Routine założony 15.09, przebieg testowy odpalony 06:48 (wynik w dzienniku) |
| Maile do Piotra | test doręczony 14.09; pierwszy realny od Łowcy dziś ~08:38 |
| Build | 4562 strony, 0 ostrzeżeń, 0 martwych linków wewnętrznych (131 557 sprawdzonych) |
| Sitemapy | 9 plików, Google pobrał 14.09, 0 błędów |

### Luki i sprzeczności

**1.1 Dwóch autorów jednego pliku bez wspólnych reguł — `wycofania.json`.**
Runner „Wycofania" (pon 06:10) **nigdy nie odpalił** (trigger odtworzony 14.09,
pierwszy przebieg 21.09). Tymczasem Scout dopisał dziś 16 wycofań ze StoneWars,
choć **jego prompt w ogóle nie wspomina `wycofania.json`** — zrobił to z własnej
inicjatywy. Skutek: reguły statusów (`kiedy`, `status`, próg dowodowy) żyją tylko
w promptcie Wycofań i w `_meta`, a pisze głównie ten, kto ich nie dostał. Dziś
wpisy wyglądają poprawnie (sprawdzone), ale to szczęście, nie mechanizm.
→ **Decyzja:** albo Scout dostaje jawny krok „wycofania" z tymi samymi regułami,
albo ma zakaz dotykania tego pliku, a Wycofania przechodzą na codziennie.

**1.2 Backfill wyłączony → zestawy bez RRP nie mogą być dealem ani hubem.**
Rabat liczymy od ceny katalogowej. 27 zestawów w `sety.json` nie ma RRP
(`materialy/zestawy-bez-ceny.xlsx`, +Godzilla 21375 wczoraj), a w feedzie jest
**2005 wycenionych zestawów bez RRP i bez huba** — głównie stare numery
(1195, 1382…), ale wśród nich giną też nowości. Runner Backfill stoi od 31.08
z bramką sanity w promptcie. → Uruchomić Backfill raz w tygodniu z limitem
20 pozycji i kontrolą `kontrola-rrp.mjs`, priorytet: zestawy z ofertami z 2025–26.

**1.3 Jedna data dla wierszy o różnej świeżości.** Tabela cen bierze datę
z najtańszego wiersza (`TabelaCen.astro:50`). Oferty LEGO.com w `sety.json`
pochodzą z **16.08** (222 wpisy), Allegro/ME z 14.09. Gdy najtańszy jest wiersz
LEGO, tabela mówi „sprawdzone 16.08", choć reszta jest z wczoraj — i odwrotnie.
→ Data przy każdym wierszu (mała kolumna) albo najstarsza z dat z dopiskiem.

**1.4 Empik: cotygodniowy zrzut zależy od ręcznej sesji Coworka.** Bez Marka
ceny Empiku stoją, a deeplinki (skrypt `empik-redirects.mjs`) nie powstają.
To jedyny sklep z afiliacją, w którym 100% kliknięć idzie na wyszukiwarkę.
Zrzut z 14.09 poszedł już bez deeplinków. → Przy najbliższym zrzucie Łowca ma
odpalić import linków (notka w skillu jest); potem sprawdzić w rejestrze TD, czy
klik na kartę produktu konwertuje lepiej niż na wyszukiwarkę.

**1.5 Radar produkuje rekomendacje, których nikt nie zbiera.** Trafiają do
`konkurencja_baza.json` i (od 14.09) do maila „przy zmianach". Nie ma miejsca,
gdzie rekomendacja zmienia się w zadanie z właścicielem i terminem. Korekta
z 20.08 („nie mamy ani jednej funkcji, której nie ma ktoś inny") do dziś nie
ma odpowiedzi w planie. → Sekcja „Do zrobienia z Radaru" w `DZIENNIK.md`
(Ustalenia trwałe) uzupełniana przez Kontroler raz w tygodniu; Piotr i Marek
skreślają albo przyjmują.

**1.6 Kontroler robi diagnozę, inne runnery nie.** Zapisane w CLAUDE.md jako
stan, nie błąd — ale awaria tokena (np. TD) ujawni się dopiero w poniedziałek.
→ Wystarczy `node scripts/diagnoza.mjs --szybko` (0,15 s) jako krok 0 w Łowcy.

**1.7 Robots.txt na produkcji nie jest tym z repo.** Cloudflare dokłada blokady
GPTBot, ClaudeBot, CCBot, Google-Extended, Bytespider i `Content-Signal:
ai-train=no`. Repo ma tylko `Disallow: /idz/`. Ta decyzja zapadła w panelu i nie
jest nigdzie opisana — a ChatGPT jest naszym **największym źródłem ruchu**
(OAI-SearchBot nie jest blokowany, więc działa; ClaudeBot jest — Claude nas nie
poleci). → Zapisać decyzję w RUNBOOK, świadomie: blokujemy trening, nie
wyszukiwanie; sprawdzić w panelu, czy „AI Crawl Control" nie blokuje też
PerplexityBot/OAI-SearchBot.

---

## 2. Widoczność: fakty z Search Console i GA4

| Miara | Wartość | Źródło |
|---|---|---|
| Kliknięcia z Google, 15.08–13.09 | **8** (T0 1, T1 0, T2 6, T3 1, T4 0) | GSC API |
| Wyświetlenia, ostatni tydzień | 39 (tydzień wcześniej 70, dwa wcześniej 132) — **spadek** | GSC API |
| Średnia pozycja | 27; huby `/zestaw/` na frazach numerowych **37–50** | GSC API |
| Adresy w sitemapach | 852 (742 huby + 110 pozostałych) | GSC API |
| Zindeksowane wg API sitemap | 0 — **pole niewiarygodne** od 2022; realną liczbę pokazuje tylko raport „Strony" w panelu GSC (**nie sprawdzono**) | — |
| Użytkownicy 7 dni | 78; ChatGPT 37, direct 25, Google organic 5, Bing 4 | GA4 API |
| Realne kliknięcia w `/idz/` | ~37/tydzień | Analytics Engine |

Wniosek: po miesiącu Google widzi nas na frazach numerowych daleko za promoklocki
i sklepami, a trend wyświetleń spada. Nie ma jednego błędu technicznego, który
to tłumaczy (build jest czysty). Są za to rzeczy, które **obniżają szansę**:

**2.1 Huby są cienkie i wyglądają identycznie.** Mediana 436 słów, z czego większość
to szablon (tabela, FAQ, disclosure). Unikalne są `opis` + `dla_rodzica` +
`dla_afol` (3–4 zdania) i karta Piotra tam, gdzie jest (1094 kart — dobra baza).
Na 742 indeksowalnych hubach FAQPage jest na 1126 stronach — od 2023 Google
nie pokazuje FAQ rich results serwisom spoza gov/health, więc to schemat bez
nagrody. Nie szkodzi, ale nie pomaga.

**2.2 Tytuły hubów mają 122 znaki.** „LEGO 30086 Bolid… – cena i promocje ·
tylkoklocki.pl" — Google ucina po ~60. 2673 strony z tytułem >65 znaków.
→ Wzór `LEGO <nr> <nazwa do 35 zn.> – cena, promocje` bez sufiksu domeny.

**2.3 Brak favicony** (`/favicon.ico` i `.svg` → 404). Google pokazuje favicony
w mobilnych wynikach; bez niej wynik wygląda jak strona-widmo.

**2.4 Brak `max-image-preview:large`** → Google Discover nie weźmie artykułów
z dużą miniaturą, choć mamy OG 1200×630 dla 31 tekstów.

**2.5 Strona 404 jest pusta** (0 bajtów, `not_found_handling: "404-page"`,
ale `dist/404.html` nie istnieje). Każda literówka w numerze = biała karta.

**2.6 `/kolekcjoner/` obiecuje alerty EOL, rankingi zł/klocek i analizę
inwestycyjną, a ma 168 słów i jeden link.** Jest w sitemapie. To strona-obietnica.
Albo dostaje treść (§5), albo wypada z sitemapy.

**2.7 E-E-A-T.** Autor „Piotr M." linkuje do `/o-nas/` (244 słowa, bez bio,
bez zdjęcia, bez linków do profili). Recenzje bez sygnału, kto i na jakiej
podstawie. → Strona autora z bio i listą tekstów; `Person` w JSON-LD już jest.

**2.8 Content-Signal + blokady AI** — patrz 1.7.

---

## 3. UX i wydajność

**3.1 Obrazy w oryginale.** Worker serwuje pliki z R2/źródła bez zmiany
rozmiaru: mediana 161 KB, **p90 517 KB, max 2,4 MB** (próbka 60). Hub z galerią
ładuje 9 takich plików; `<img width=800>` nie zmniejsza transferu. Na telefonie
to LCP i koszt danych. Dwie drogi: (a) Cloudflare Image Resizing w workerze
(`cf: { image: { width, format } }` — **nie sprawdzono**, czy włączone w strefie);
(b) zmniejszać przy wgrywaniu do R2 (`r2-obrazy.mjs` + `sharp`, 1024 px, WebP)
i przepuścić raz istniejące 11 140 obiektów. (b) nie zależy od planu Cloudflare.

**3.2 Ceneo na dole tabeli pod nagłówkiem „najtańsza oferta zawsze na górze"** —
przy 75430 Ceneo 429 zł stoi pod Allegro 565 zł. Świadoma decyzja (porównywarka,
nie sklep), ale czytelnik widzi sprzeczność. → Zdanie „Ceneo pokazujemy osobno,
bo to porównywarka" przy wierszu, albo Ceneo na górze z etykietą.

**3.3 Dwa akapity o tym samym pod tabelą** (TabelaCen + hub). Do scalenia.

**3.4 Zestawy bez zdjęcia w miejscach premium**: deal dnia 43022 (kask
Hamiltona) na stronie głównej z placeholderem; 3 nowości u góry `/nowosci/`
z placeholderem; ~130 hubów z martwym Rebrickable (2927, 11934, 21375). Skrypt
`r2-obrazy.mjs --sprawdz` je wylicza, ale nie ma skąd wziąć zdjęcia. → Scout
przy nowości szuka zdjęcia w feedach ME/Allegro (ma je w wyciągu) i wpisuje do
`zdjecia.json` od razu.

**3.5 Mobile**: 11 stron bez przewijania poziomego, tabela składa się w karty,
menu w hamburgerze — bez uwag. Desktop bez uwag poza §3.1.

**3.6 Brak jakiegokolwiek mechanizmu powrotu.** Nie ma newslettera, alertów
cenowych, alertów EOL, zapisu „obserwuj zestaw". Konkurencja ma wszystkie trzy
(zklockow, promoklocki, klockoradar). Jedyny kanał powrotu to RSS. Przy 37
klikach tygodniowo każdy użytkownik, który wraca, jest ważny.

---

## 4. Research → redakcja → sprzedaż

| Ogniwo | Stan | Uwaga |
|---|---|---|
| Karty researchu (`redakcja/karty/`) | 9 | 22 artykuły — 13 tekstów powstało bez karty w repo (Piotr pisze poza repo; to zgodne z podziałem, ale metodologia mówi „karta przed tekstem") |
| Artykuły | 22 w 5 tygodni: Premiery 9, Recenzje 5, Prezentownik 3, Rankingi 2, Porównania 1, Poradniki 1, Kalendarze 0 (w dziale są jako strony), Historyczne 0 | dwie kategorie z planu puste |
| Karty zestawów Piotra | 1094 | dobra baza pod huby; z `kolejka-redakcyjna.xlsx` 1123 pozycje |
| Prezentowniki | 17 stron, 3 wg wieku/budżetu | wiek jest w danych dla 1172 setów, a stron wg wieku są 2 |
| Deale | 6 postów | Łowca pisze „przy wyjątkowych okazjach" — brak definicji „wyjątkowej" w promptcie (**nie sprawdzono** w całości promptu, sprawdzono fragmenty) |
| Standard Piotra §18 vs §19.1 | rozjazd czterech i trzech poziomów cen | otwarte pytanie do Piotra od 14.09 |

**4.1 Tempo.** fanklockow.pl: ~10 publikacji dziennie (RSS), faniklockow ~6/5 dni
plus mikro-wpisy. My: ~4/tydzień. Nie wygramy kadencją i nie powinniśmy
(korekta z 22.08: ich „Okazje cenowe" to w 80% normalny poziom rynkowy). Ale
przy 4/tydzień każdy tekst musi mieć **temat, którego nikt nie ma** — §6.

**4.2 Przecieki.** Reguła jest dobra (`przeciek z rynku` vs `potwierdzone przez
LEGO`, RUNBOOK 771–783) i już działa na `/nowosci/` (3 przecieki dziś). Brakuje
**miejsca**, w którym czytelnik szukający „co będzie" to znajdzie: osobnej
strony `/przecieki/` z listą, źródłem, datą i **tablicą trafności** („z 40
przecieków 2026 potwierdziło się 31"). To zamienia naszą słabość (tylko fakty)
w wyróżnik: przecieki tak, ale z etykietą i rozliczeniem. Nikt z konkurencji
nie rozlicza własnych przecieków.

---

## 5. Wartość na tle konkurencji — co mamy, czego nie mamy

Z `konkurencja_baza.json` (Radar, 16.08–13.09):

| Funkcja | promoklocki | zklockow | klockoradar | faniklockow | fanklockow | **my** |
|---|---|---|---|---|---|---|
| porównanie cen między sklepami | ✅ | ✅ | ✅ (50+) | – | – | ✅ (7 sklepów) |
| cena za klocek | ✅ | – | – | – | – | ✅ |
| historia cen (wykres) | ✅ | – | ✅ | – | – | **–** (tylko minimum od 13.08) |
| alerty cenowe | ✅ (app) | ✅ | ✅ | – | – | **–** |
| lista EOL | ✅ per seria | – | – | ✅ | ✅ | ✅ |
| rabat liczony od RRP, nie od „ceny przekreślonej" | – | – | – | – | – | ✅ **jedyni** |
| dla rodzica / dla AFOL przy każdym zestawie | – | – | – | – | – | ✅ **jedyni** |
| recenzje z progiem zakupu | – | – | – | ✅ | ✅ | ✅ |
| przecieki | – | – | – | ✅ | ✅ | częściowo |
| API cenowe | ✅ | – | – | – | – | – |

Dwie rzeczy mamy jako jedyni i **nie mówimy tego nigdzie głośno**: uczciwy rabat
od RRP i podwójną perspektywę rodzic/AFOL. Ani strona główna, ani `/o-nas/` nie
robią z tego argumentu. Trzy rzeczy, których brak boli najbardziej przy AFOL:
historia cen, alerty, „obserwuj". Historia cen jest w zasięgu ręki: zrzut RK ma
**4,9 mln wierszy cen 2023–2026** — to trzy lata wykresów za jeden import.

---

## 6. Nisze — co warto zbudować, czego nikt nie proponuje

Liczby = zestawy „dostępne" w `katalog.json` (975 dostępnych z 7840), po nazwie;
listing może też pokazywać EOL z ceną rynkową. Popyt wyszukiwania **nie
sprawdzony** (nie mamy narzędzia do fraz) — kolejność wg wartości dla grup
docelowych i wg tego, czy konkurencja to ma.

### Listingi tematyczne przez wiele serii (strony na danych, aktualizują się same)

| Nisza | Dostępne / razem | Dla kogo | Dlaczego nikt tego nie ma |
|---|---|---|---|
| **Hełmy i kaski** — SW Helmet Collection + kaski F1 + Sauron | 11 / 58 | AFOL | seria rozproszona po SW, F1, Editions, Icons; kolekcjoner szuka „wszystkie hełmy", trafia na sklep |
| **BrickHeadz wg uniwersum** (Disney/Pixar, SW, HP, Marvel/DC, Stranger Things, Transformers, Pets, sezonowe) + checklista numerów | 26 / 195 | AFOL, dzieci 10+ | LEGO pokazuje tylko bieżące; checklisty są na Bricksecie po angielsku |
| **Speed Champions wg marki** (Ferrari, McLaren, Porsche, F1…) | 32 / 103 | oboje | sklepy sortują po cenie, nie po marce |
| **Botanicals i kwiaty** (Botanicals 16 + Creator 8 + Icons 6 + Friends 3) | 40 / 67 | rodzice kupujący partnerom, AFOL | najsilniejszy prezent dla dorosłych; zklockow ma stronę katalogową, bez progu zakupu |
| **Zestawy dla dorosłych (18+)** wg budżetu | 192 w `sety.json` | AFOL, obdarowujący | „lego dla dorosłych" to pytanie prezentowe; zklockow ma ranking, martwy od 2021 |
| **Pociągi** (City 8, DUPLO 8, Creator 2) | 21 / 77 | rodzice | temat dziecięcy nr 1 obok straży; brak strony u kogokolwiek |
| **Dinozaury** (JW 9, DUPLO 2) | 13 / 77 | rodzice | j.w. |
| **Zamki** (HP 10, Disney 9) | 25 / 81 | rodzice | j.w. |
| **Straż i policja** (City 10) | 15 / 129 | rodzice 4–7 lat | j.w. |
| **Zwierzęta** (Creator 21, DUPLO 8) | 66 / 262 | rodzice małych dzieci | j.w. |
| **Mechy i roboty** (Ninjago 14) | 27 / 130 | dzieci 7–10 | j.w. |
| **Wg wieku 2+…18+** (mamy `wiek` dla 1172 setów) | 12 przedziałów | rodzice | „lego dla 5-latka" — dziś tylko 2 strony; to powinno być 12 stron na danych + próg zakupu |
| **Polybagi i gratisy GWP** (30xxx 37, 40xxx 90) | 127 | AFOL | faniklockow ma listę gratisów; my mamy ceny i EOL — połączyć |
| **Kalendarze adwentowe 2026** | 6 | rodzice, X–XI | strony brak; szczyt popytu za 6 tygodni |
| **Najlepszy zł/klocek w każdej serii** | 47 serii | AFOL | promoklocki ma sortowanie, nikt nie ma „top 10 w serii" |

### Tematy artykułów, których brak w planie kategorii

- **Kalendarze** (0 tekstów): „Kiedy kupować LEGO — okna promocyjne rok po roku"
  z naszych danych (Łowca liczy minima od 13.08; z RK od 2023).
- **Historyczne** (0): „Co się stało z cenami wycofanych zestawów 2023–2025"
  — tylko z historią RK, nikt w Polsce nie ma tych danych.
- „**Które zestawy LEGO drożeją po wycofaniu, a które nie**" — faktyczna analiza,
  nie legenda; klient AFOL czyta to przed zakupem.
- „**Ile naprawdę kosztuje LEGO na Allegro — podszywki i pasmo 50–60% RRP**"
  (mamy audyt z 30.08, nikt o tym nie pisze dla rodziców).
- **Przecieki z rozliczeniem** — §4.2.
- Dla rodziców: „**LEGO 4+ a 5+ — czym różni się budowanie**", „**Pierwszy
  Technic**", „**DUPLO czy Classic po trzecich urodzinach**".

### Poza treścią

- **Historia cen z RK** (3 lata) — największa pojedyncza dźwignia dla AFOL i SEO
  („cena 10316 wykres").
- **Alert EOL / alert cenowy mailem** — Worker + KV + Resend już są; formularz
  na hubie „daj znać, gdy spadnie poniżej X zł" to pierwszy mechanizm powrotu.
- **Strona „Dlaczego nam wierzyć"** — rabat od RRP, dwie perspektywy, brak
  pseudopromocji, rozliczone przecieki. To jest nasz wyróżnik i nie jest opisany.

---

## 7. Lista: brakuje / rodzi błędy / opóźnia / ryzyko

Priorytet: **A** = tydzień, **B** = miesiąc, **C** = po sezonie.

| # | Co | Typ | Prio | Właściciel |
|---|---|---|---|---|
| 1 | Sprawdzić w panelu GSC „Strony" ile z 852 adresów jest zindeksowanych; API tego nie mówi | brakuje | A | Marek |
| 2 | Favicon, strona 404, `max-image-preview:large` | brakuje | A | Code |
| 3 | Tytuły hubów ≤60 znaków | błąd | A | Code |
| 4 | `wycofania.json`: jeden właściciel reguł (1.1) | ryzyko | A | Marek decyduje, Code zmienia prompt |
| 5 | Data przy każdym wierszu tabeli cen (1.3) | błąd | A | Code |
| 6 | Robots: decyzja o blokadach AI zapisana i sprawdzona (1.7) | ryzyko | A | Marek + Code |
| 7 | Obrazy: zmniejszanie przy wgrywaniu do R2 (3.1) | opóźnia (LCP) | B | Code |
| 8 | Backfill: tygodniowy przebieg z limitem (1.2) | brakuje | B | Code (prompt) |
| 9 | Empik: deeplinki przy najbliższym zrzucie (1.4) | opóźnia | B | Marek (zrzut) → Łowca |
| 10 | „Do zrobienia z Radaru" w dzienniku (1.5) | brakuje | B | Kontroler |
| 11 | `/kolekcjoner/`: treść albo poza sitemapą (2.6) | błąd | B | Marek decyduje |
| 12 | Strona autora / o-nas z bio (2.7) | brakuje | B | Piotr + Code |
| 13 | Listingi wg wieku (12 stron na danych) + hełmy + BrickHeadz + Botanicals + kalendarze adwentowe | brakuje | B | Code (szablon), Piotr (wstępy) |
| 14 | `/przecieki/` z tablicą trafności (4.2) | brakuje | B | Scout (dane), Code (strona) |
| 15 | Alert EOL/cenowy mailem (3.6) | brakuje | C | Code (worker — wymaga zgody Marka na dotknięcie workera) |
| 16 | Historia cen z RK (5) | brakuje | C | Marek (dump), Cowork (eksport), Code (import + wykres) |
| 17 | Diagnoza `--szybko` jako krok 0 w Łowcy (1.6) | ryzyko | C | Code (prompt) |
| 18 | Scout wpisuje zdjęcie z feedu przy nowości (3.4) | błąd | C | Code (prompt) |
| 19 | Rozjazd §18/§19.1 standardu | otwarte | — | Piotr |

---

## 8. Pytania do Marka (bez odpowiedzi nie ruszam)

1. Blokady AI w robots.txt (GPTBot, ClaudeBot, CCBot) — świadoma decyzja w panelu
   Cloudflare czy domyślne ustawienie „AI Crawl Control"? ChatGPT to dziś nasz
   największy kanał; chcemy blokować trening, ale nie wyszukiwanie.
2. Cloudflare Image Resizing — włączone w strefie? Jeśli nie, robię zmniejszanie
   przy wgrywaniu (bez zależności od planu).
3. `publisher.rakutenadvertising.com` — 14 sesji, 859 s na sesję w GA4. To ktoś
   z Rakuten przegląda serwis do akceptacji programu? Jeśli tak, to jest dobry
   moment na stronę „Dlaczego nam wierzyć".
4. Historia cen z RK: to projekt na kilka dni (eksport na Twoim komputerze,
   import, wykres na hubie). Robimy przed sezonem, czy po?
5. `wycofania.json`: Scout ma robić wycofania codziennie (i Wycofania kasujemy),
   czy Scout ma zakaz, a Wycofania wracają na codziennie?
6. `/kolekcjoner/`: budujemy (alerty EOL + ranking zł/klocek to dwa tygodnie) czy
   zdejmujemy z sitemapy do czasu?
