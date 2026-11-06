# Audyt 06.11.2026: afiliacje

Stan repo: `praca` = `origin/main` @ `b831994`. Arkusz z pełnymi danymi:
`materialy/audyt-2026-11-06/afiliacje.xlsx` (zakładki „Sklepy”, „Problemy”, „Do zrobienia”).
Punkt odniesienia: `materialy/audyt-2026-10-12/indeksacja-ruch-afiliacje.md` i
`materialy/kontroler-2026-11-02.md`.

**Źródła i odczyty z 06.11 (UTC rano):**
- `prowizje-raport.mjs --dni 30` i `--dni 90` (Tradedoubler, Adtraction, Performers) oraz
  własne zapytania do tych samych API: lista programów TD, lista transakcji TD z datami,
  programy Adtraction, dzienne kliknięcia Performers.
- Analytics Engine `idz_kliki` (te same zapytania co `kliki-raport.mjs` plus podział na PL i resztę
  świata), okna 7, 28 i 90 dni. **„Kliki PL” oznaczają dalej wyłącznie ruch ludzki (`blob6 = human`)
  z Polski.** Okno 90 dni sięga 08.08, a znacznik human/bot istnieje od 14.09. Starsze kliknięcia
  podaję osobno jako „sprzed filtra”.
- Dane z repo: `redirects.json`, `oferty_feed.json`, `sety.json` (oferty z ostatnich 14 dni,
  tak jak sito `ofertaAktualna`), `afiliacje_rejestr.json`, `sklepy.json` i kod
  (`worker.js`, `lib/oferty.js`, `TabelaCen.astro`, `remark-linki-sklepow.mjs`) oraz `dist/`.
- 17 żądań `curl -sI` na `https://tylkoklocki.pl/idz/...` z nagłówkiem `x-tk-test`. Worker
  zapisuje je jako „test”, a bez `-L` nic nie trafia do sieci afiliacyjnej. Do tego 4 wejścia
  wprost na karty produktów (bez trackerów) i **2 wejścia na tracker Performers**, opisane w P1.
- Nie sprawdzono: paneli Allegro, SalesMasters, webePartners i Awin (brak API albo klucza).
  Kwoty Allegro i Planety pochodzą z odczytu Coworka z 12.10, zapisanego w rejestrze.

## Najważniejsze

1. **Media Expert nie ma ani jednej konwersji w 90 dniach**, choć dostaje najwięcej
   kliknięć: 83 z 200 polskich w 28 dniach (42%) i 129 w 90 dniach. W teście tracker Performers
   zwrócił adres sklepu z pustymi makrami: `transaction_id=transaction_id`,
   `Partner_ID=aff_sub`, `utm_campaign=date`. Jeżeli przeglądarka dostaje to samo, sklep nie
   ma czym przypisać sprzedaży. Test szedł z nieprzeglądarkowym nagłówkiem User-Agent, więc to
   **hipoteza do potwierdzenia jednym przejściem w prawdziwej przeglądarce**, a nie pewny wniosek.
2. **Empik: 261 linków prowadzi do akcesoriów zamiast do zestawów** (gabloty Blacked Brick,
   uchwyty Saures, Playmobil, zamienniki). Na produkcji `/idz/empik/75455` kieruje na gablotę,
   choć hub pokazuje przy Empiku cenę 719,99 zł. Hub 71430 wyróżnia Empik 110,98 zł jako
   **najtańszą** ofertę, a link prowadzi do auta Playmobil 71430. Przyczyna: `zrzut-redirects.mjs`
   nie używa filtra `GADZETY`, który ma `zrzut-import.mjs`, a przy kilku kartach pod jednym
   numerem ostatnia nadpisuje poprzednie.
3. **Sprawdzalny przychód: 10,83 EUR w 90 dniach** (Tradedoubler: 13 transakcji) plus ok. 10 zł
   z Allegro za wrzesień (panel). To ok. 56 zł w trzy miesiące, czyli **ok. 20 zł miesięcznie**.
   W ostatnich 30 dniach jest 1,70 EUR: jedna transakcja Empiku z 25.10, jeszcze niezatwierdzona,
   i 6 mikro-zdarzeń Ceneo. Adtraction i Performers dały zero.
4. **60% polskich kliknięć z 28 dni nie przynosi dziś mierzalnego zarobku.** 42% idzie do
   Media Expertu (zero konwersji), a 18% do sklepów bez prowizji: LEGO.com 15, Smyk 11,
   Ceneo 10.
5. **Ceneo:** worker od 03.11 (07:08, `834e724`) linkuje wprost na ceneo.pl, ale tabela
   i `relLinku()` nadal oznaczają ten link jako `sponsored`. Rejestr wciąż pisze, że worker
   „buduje link przez zakończony program”, i nie zna programu **300324 „Ceneo.pl”**, który
   w TD ma status ACCEPTED. To z niego pochodziły zdarzenia po 0,07 EUR. Ceny Ceneo są z 27.10
   i **od 11.11 same znikną z tabel** przez sito 14 dni.
6. Afiliacja nie wpływa na kolejność, bo tabela sortuje wyłącznie po cenie. Kolejność psują
   **braki danych**: Allegro jest najtańsze w 47% śledzonych zestawów, a ma najniższą stawkę
   (1,03% przez TD, własna nieznana) i cookie 24 h. Feed Media Expertu obejmuje 702 z 1276
   śledzonych zestawów. Amazonu w danych nie ma wcale.

## 1. Tabela sklepów

Kliki: ruch ludzki z Polski. Oferty: z ostatnich 14 dni. Kolumna „najtańszy” liczy, w ilu
z 1276 śledzonych zestawów (`sety.json`) dany sklep ma najniższą cenę, bez Ceneo. Kwoty TD są
w EUR. Kolumna „Link” podaje wynik `curl` z 06.11.

| Sklep | Sieć | Status | Prowizja | Cookie | Link na stronie | rel | Linki | Oferty (huby / śledzone) | Najtańszy | Kliki PL 7 / 28 / 90 d | Transakcje 30 d | Transakcje 90 d | Ostatnia cena |
|---|---|---|---|---:|---|---|---:|---|---:|---|---|---|---|
| Media Expert | Performers 1860 | aktywny | 2,00% | 30 | **tak**, track.performers.tech | sponsored | 878 | 707 / 702 | 291 | 23 / 83 / 129 | **0** (118 klików u nich) | **0** (1426 klików) | 05.11 |
| Allegro | własny + TD 288386 | aktywny | ? / TD 1,03% | 1 | **tak**, allegro.pl/affiliate (bez oferty: strona główna) | sponsored | 7 300 | 6 231 / 1 194 | **594** | 8 / 39 / 87 | brak API | IX: 8 konw., 10,08 zł (panel) | 05.11 |
| Empik | TD 289664 | aktywny | 2,25% zmierz. | 7 | **tak**, clk.tradedoubler (**261 linków na akcesoria**) | sponsored | 4 951 | 4 518 / 1 061 | 213 | 4 / 18 / 42 (+18) | 1 · 1,28 EUR (P) | 4 · **8,43 EUR** (374 EUR obrotu) | 05.11 |
| x-kom | SalesMasters | aktywny | ? | ? | **tak**, `?sm=Y74rgdCO` | sponsored | 794 | 700 / 679 | 13 | 5 / 16 / 20 (+16) | brak API | brak API | 03.11 |
| LEGO.com | Rakuten | odrzucony 15.09 | — | — | nie (zamierzone) | nofollow; **sponsored w MD** | 995 | 975 / 875 | 101 | 1 / 15 / 35 | — | — | 03.11 |
| Smyk | Adtraction | aktywny, **bez prowizji** | 2,1% | 45 | nie (karta smyk.com) | nofollow | 704 | 612 / 601 | 38 | 2 / 11 / 25 | 0 | 0 | 03.11 |
| Ceneo | TD 385881 / 300324 | **zakończony 03.11** | — | — | nie (ceneo.pl) | **sponsored (błąd)** | 1 835 | 1 465 / 1 | n/d | 0 / 10 / 18 | 6 · 0,42 EUR | 8 · 0,56 EUR | 27.10 |
| Lidl | TD 298327 | aktywny | 4,00% zmierz. | ? | **tak**, pdt.tradedoubler | sponsored | 111 | 101 / 100 | 12 | 0 / 7 / 12 | 0 | 1 · 1,84 EUR (A) | 05.11 |
| MediaMarkt | TD 229227 | aktywny | 1,50% | 30 | **tak**, pdt.tradedoubler | sponsored | 129 | 114 / 107 | 6 | 1 / 1 / 1 | 0 | 0 | 03.11 |
| Planeta Klocków | webePartners | aktywny | 3,00% | 30 | **tak**, webep1.com | sponsored | 1 880 | 1 096 / 905 | 8 | 0 / 0 / 2 | brak API | panel IX–X: 0 | 05.11 |
| Egmont | Adtraction | aktywny | 6% | 30 | nieużywany | — | 0 | — | — | 0 | 0 | 0 | — |
| Proshop | Awin | wysłane 19.08 | 3% | 30 | brak | — | 0 | — | — | 0 | nie sprawdzono | — | — |
| RTV Euro AGD | TD 118512 | odrzucony 03.09 | — | — | brak | — | 0 | — | — | 0 | — | — | — |
| Amazon.pl | Associates | do zgłoszenia | — | 1 | wyszukiwarka bez tagu (1 artykuł) | **sponsored (błąd)** | 0 | 0 | — | 0 | — | — | — |
| Erli / Komputronik / dadada / Zalando | TD / Admitad / BuyBox / Awin | do zgłoszenia | — | 60 / 1 / ? / ? | brak | — | 0 | — | — | 0 | — | — | — |
| al.to | SalesMasters | aktywny | ok. 2% | ? | nie występuje | — | 0 | — | — | 0 | — | — | — |
| Sferis, małe sklepy | — | brak | — | — | wyszukiwarka sklepu albo brak | nofollow | 0 | 0 (oferty z sierpnia) | — | 0 | — | — | VIII |

„(+N)” oznacza kliknięcia z Polski sprzed wdrożenia znacznika human/bot (14.09), więc mogą
zawierać boty. „P” to transakcja oczekująca, „A” zatwierdzona.

**Test w praktyce (17 × `/idz/`, 06.11):** wszystkie sklepy z umową przekierowują 302 na link
afiliacyjny właściwej sieci. LEGO, Smyk (z wpisem), Ceneo i Amazon prowadzą wprost do sklepu.
Fallbacki działają tak jak w kodzie: x-kom i Empik kierują na wyszukiwarkę z kodem, Smyk na
deeplink Adtraction do kategorii, Allegro na stronę główną z kampanią. Kliknięcie bez referera
wraca na hub (`?idz=odrzucony`). Karty docelowe Lidla, MediaMarktu i Smyka odpowiadają 200.
Media Expert odpowiada 403 (blokuje serwer). Ostatnia kontrola linków (02.11) znalazła jeden
martwy link: Lidl 10427, już usunięty. **Martwych linków w sensie 404 nie ma. Są linki
prowadzące do złych produktów (Empik).**

## 2. Gdzie tracimy pieniądze

| Wyciek | Skala (PL, 28 dni) | Dlaczego | Co zrobić |
|---|---|---|---|
| Media Expert bez konwersji | 83 kliknięcia, 42% | prawdopodobnie śledzenie (P1); Performers liczy ok. 2/3 naszych kliknięć | test w przeglądarce, mail do Performers |
| Sklepy bez prowizji | 36 kliknięć, 18% (LEGO 15, Smyk 11, Ceneo 10) | odmowa Rakuten; zepsuty deeplink Adtraction; koniec programu Ceneo | Smyk: ponowny test albo netSalesMedia; LEGO: ponowne zgłoszenie dopiero przy większym ruchu |
| Allegro: najniższa stawka tam, gdzie najczęściej najtaniej | 39 kliknięć; najtańsze w 594 z 1276 | 1,03% / 24 h; trzy różne `utm_campaign` w linkach | sprawdzić kampanie w panelu; to rynek, nie do zmiany |
| Empik: złe produkty | 261 linków, w tym 3 z ceną na hubach | brak filtra akcesoriów w `zrzut-redirects.mjs` | poprawka skryptu (P2) |
| Luki w danych | ME 702 z 1276 śledzonych; Amazon 0 | feed ME zawężony; Amazon bez programu i danych | mail o pełny feed; decyzja w sprawie Amazonu |
| Aktywne programy bez użycia | Egmont 6%, al.to | brak zestawów (Egmont), brak potrzeby (al.to) | Egmont w prezentownikach |

**Duże sieci:** Smyk, Empik, x-kom, Media Expert, MediaMarkt, Allegro i Lidl mamy z umową.
RTV Euro AGD odrzucił zgłoszenie. OleOle (ta sama grupa) ma w TD status NONE. Amazon.pl jest
„do zgłoszenia”. Kaufland, Carrefour (TD 321318, NONE), Pepco i Zalando nie są podpięte.
**Nie sprawdzono, czy ich feedy zawierają zestawy LEGO, więc tych zgłoszeń nie rekomenduję
przed takim sprawdzeniem.** Erli (TD, cookie 60 dni) i Komputronik (Admitad) są w rejestrze
od sierpnia jako „do zgłoszenia”. W Adtraction poza Smykiem i Egmontem nie ma polskiego
programu z zabawkami. Performers pokazuje nam tylko Media Expert.

**Allegro i ograniczenia:** w dealach obowiązuje limit 30% (decyzja z 13.09). W tabelach
Allegro stoi tam, gdzie wypada mu cena, i ma notkę o marketplace. 41 śledzonych zestawów bez
oferty w feedzie trafia na stronę główną Allegro, ale tylko wtedy, gdy ktoś kliknie wiersz bez
ceny. Takich wierszy tabela już nie pokazuje (zasada z 13.09).

**Disclosure:** stopka `Base.astro` („Część linków na stronie to linki afiliacyjne…”) jest na
każdej stronie. Notkę przy linkach mają huby, artykuły i deale (`Artykul.astro`),
prezentowniki, serie, nowości, wycofania, ekskluzywy i `/promocje-lego/`. **Strona główna ma
tylko stopkę**, choć jest drugim źródłem kliknięć (26 z 200). Nota na hubie („Przyciski ze
strzałką to linki afiliacyjne”) obejmuje też LEGO, Smyka i Ceneo, czyli mówi więcej, niż
trzeba. To bezpieczne. Atrybut `rel` ma trzy niespójności: Ceneo w tabeli, linki z markdownu
(`remark-linki-sklepow.mjs` daje `sponsored` każdemu `/idz/`, także LEGO i Amazonowi) oraz
fallback Smyka, który jest afiliacyjny, a ma `nofollow`. **Polityka prywatności** wymienia
jako partnerów LEGO.com i Rakuten, a nie wymienia sieci, z których faktycznie korzystamy.

## 3. Ekonomia

| Miara | Wartość | Uwagi |
|---|---|---|
| Kliknięcia ludzkie z PL | 44 (7 d), **200 (28 d, 7,1 dziennie)**, 371 (90 d) | w 90 dniach dodatkowo 198 polskich sprzed filtra |
| Przychód zmierzony, 90 d | **10,83 EUR** (TD) + ok. 10 zł (Allegro IX) ≈ **56 zł** | przy kursie ok. 4,25 zł/EUR (przybliżenie) |
| Przychód zmierzony, 30 d | 1,70 EUR | 1,28 EUR to jedna oczekująca transakcja Empiku |
| EPC łącznie | **ok. 0,10–0,15 zł/klik** | 56 zł na 371–569 kliknięć |
| Empik | 4 transakcje na ok. 60 kliknięć: **CR ok. 6–7%, EPC ok. 0,14 EUR (0,60 zł)**, średni koszyk 94 EUR | jedyny sklep z próbą > 1 przy progu 10 EUR (kamień 2) |
| Lidl | 1 na 12, 1,84 EUR | n = 1 |
| Allegro (panel IX) | 83 kliknięcia, 8 konwersji, GMV 960 zł, 10,08 zł, EPC 0,12 zł | stawka efektywna ok. 1,05% |
| Media Expert | 129 kliknięć PL, 0 konwersji | wyciek (P1) |
| Boty | 28 d: **21 506 odrzuconych / 957 human / 38 test**; 05.11 jednego dnia 13 301 | Performers 05.11: 0 kliknięć, więc filtr zatrzymał falę; wśród „human” spoza PL w 7 dniach zostało 20 |

**Uczciwa ocena:** w obecnej skali model nie zarabia. Daje ok. 20 zł miesięcznie, mniej
niż progi wypłat (SalesMasters 100 zł; saldo TD 12.10 wynosiło 40 zł). Infrastruktura działa:
linki są otagowane, filtr botów trzyma, kolejność wynika z ceny. Problemem jest skala
i jeden przeciek:
- **Naprawa Media Expertu** to najtańszy ruch. Przy konwersji takiej jak w Empiku
  (ok. 6%), koszyku ok. 300 zł i stawce 2% daje ok. 30 zł na 28 dni, czyli **mniej więcej
  podwaja przychód**.
- **Ruch** to jedyny duży mnożnik. Google dał 6 kliknięć w 28 dniach przy 480 wyświetleniach,
  a ok. 25% przejść do sklepów przychodzi z ChatGPT. Przy EPC jak w Empiku (0,60 zł)
  1 000 zł miesięcznie wymaga ok. 1 700 kliknięć z PL miesięcznie, czyli ok. 8 razy więcej niż
  dziś. Przy obecnym miksie (0,15 zł) potrzeba ok. 6 700, czyli ok. 30 razy więcej. Black Friday
  (27.11) i grudzień to najlepsze okno w roku na sprawdzenie, jak ruch rośnie w sezonie.
- Nowe programy dokładają procenty do bardzo małej podstawy. Opłacają się tam, gdzie sklep
  bywa najtańszy (Amazon) albo ma długie cookie (Erli 60 dni, Smyk 45 dni).

## 4. Do zrobienia

**P1**
1. **Cowork:** jedno przejście z huba do Media Expertu w prawdziwej przeglądarce. Odczytać
   adres docelowy i sprawdzić, czy `transaction_id` ma wartość.
2. **Marek:** mail do Performers. Gotowy tekst jest w `kontroler-2026-11-02.md`; dopisać
   makra i informację o 0 konwersji przy 129 kliknięciach.
3. **Code:** filtr akcesoriów w `zrzut-redirects.mjs` (wspólny regex z `zrzut-import.mjs`
   plus `playmobil|zamiennik|saures|blacked brick|brickbox|podstawk|wieszak`). Karta zestawu
   nie może zostać nadpisana kartą akcesorium. Potem przebudować `redirects.empik`
   (dopuszczony wyjątek od append-only) i usunąć ceny 71430 i 45303.
4. **Marek:** decyzja w sprawie Ceneo: wiersz z `nofollow` bez prowizji czy usunięcie.
   Bez decyzji ceny wypadną z tabel 11.11. Przy okazji sprawdzić w panelu TD, czy program
   300324 daje deeplinki.

**P2**
5. **Code:** `rel` Ceneo w `TabelaCen.astro` i `relLinku()`. `remark-linki-sklepow.mjs`
   powinien brać `rel` z `relLinku()`.
6. **Code (po akceptacji Marka):** lista sieci w polityce prywatności.
7. **Cowork:** odczyt paneli Allegro (także trzech `utm_campaign`), SalesMasters,
   webePartners i Awin/Proshop (prompt z 12.10, kroki 2–4 i 6).
8. **Code:** aktualizacja `afiliacje_rejestr.json`: Ceneo 300324, ceny Empiku ze zrzutu,
   MediaMarkt 129, Lidl 4,00%, `zaktualizowano`.
9. **Marek:** zgłoszenie Erli (TD), po sprawdzeniu, czy feed ma zestawy. Komputronik w Admitad.

**P3**
10. Notka afiliacyjna przy dealach na stronie głównej.
11. Mail do Performers o pełny feed LEGO.
12. Smyk: test deeplinku Adtraction raz na kwartał; plan B to netSalesMedia.
13. Amazon Associates: decyzja o koncie bez API.
14. Research Kaufland, Carrefour, Sferis i Morele pod kątem LEGO w feedach.
15. Egmont (6%) w prezentownikach.
16. **Decyzja strategiczna:** do grudnia priorytetem jest ruch, nie kolejne programy.

## Uwagi do metody

- 2 wejścia na `track.performers.tech` 06.11 to sztuczne kliknięcia w statystyce Performers
  (diagnoza P1). Trzecia próba, z nagłówkami przeglądarki, została zablokowana przez
  zabezpieczenia sesji i nie została powtórzona.
- `kliki-raport.mjs` w okresie 28 dni liczy „human” ze wszystkich krajów (959), więc zawiera
  falę z 10.10 (643 kliknięcia spoza PL). Liczby w tym raporcie są tylko polskie.
- Kategorie ofert liczyłem w uproszczeniu: wiek do 14 dni, bez odsiewu i bez sita
  „podejrzany rynek”. Liczby „najtańszy” mogą się więc różnić od stron o pojedyncze zestawy.
