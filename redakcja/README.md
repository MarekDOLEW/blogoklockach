# Redakcja — dokumenty bazowe projektu

Trzy dokumenty wspólnika stanowią **obowiązującą podstawę pracy nad artykułami**
na tylkoklocki.pl. Każdy artykuł (recenzja, poradnik, ranking, porównanie)
powstaje zgodnie z nimi:

| Dokument | Wersja | Rola |
|---|---|---|
| [metodologia-researchu-lego.md](metodologia-researchu-lego.md) | 1.7 | Jak robić research: hierarchia źródeł, mapa recenzji (min. 4 niezależne opinie), karta researchu, procedura rozbieżności z bramką eskalacyjną |
| [standard-artykulow-biezacych.md](standard-artykulow-biezacych.md) | 1.5 | Jak pisać: rdzeń + moduły, profil odbiorcy, ton, drabina cenowa, próg zakupu, CTA, checklista przed publikacją, antywzorce |
| [sklepy-i-afiliacja.md](sklepy-i-afiliacja.md) | 1.1 | Sklepy w researchu i publikacji: rejestr, kategorie ofert, 2–3 sklepy publikacyjne, bezstronność afiliacji |

**Dokumenty wspólnika leżą w repo verbatim — nie dopisujemy w nich ani słowa.**
Wszystko, co wynika z naszej automatyzacji (skąd ceny, kto wstawia linki, siedem
kategorii, ograniczenia serwera), mieszka w osobnej warstwie:
[ustalenia-projektowe.md](ustalenia-projektowe.md). Dzięki temu nowa wersja od
Piotra to podmiana jednego pliku, a nie scalanie prozy.

Przy sprzeczności: warstwa projektowa wygrywa **tylko w sprawach infrastruktury**;
w sprawach redakcyjnych rozstrzygają dokumenty wspólnika.

Skille na claude.ai (`lego-standard-redakcyjny`, `lego-standard-sprzedazowy`) są
**generowane z tych plików** przez `node scripts/eksport-skilli.mjs`. Nie edytuj
ich na claude.ai — poprawka przepadnie przy następnym eksporcie.

Źródłowe pliki .docx dostarcza wspólnik; przy nowej wersji dokumentu podmieniamy
odpowiedni plik .md (konwersja ze stylów Worda) i odnotowujemy wersję w tabeli wyżej.

## Jak dokumenty mapują się na infrastrukturę serwisu

Dokumenty pisano dla „klasycznego" bloga; nasz serwis ma warstwę automatyzacji.
Ustalenia integracyjne:

- **Rejestr sklepów** (Sklepy §2–3) → `src/data/sklepy.json` (nazwy, szablony
  wyszukiwarek) + `src/data/afiliacje_rejestr.json` (statusy, prowizje, cookie,
  formaty linków, daty weryfikacji). Nie prowadzimy osobnego arkusza.
- **Snapshot cenowy** (Metodologia §6.3) → `src/data/oferty_feed.json` odświeżany
  codziennie przez runnery z feedów sklepów + `src/data/ceny_baza.json`
  (najniższe historyczne). Data kontroli jest zapisana w danych — wymóg
  „wewnętrznej daty" spełnia automat.
- **Ceny i linki wstawia redakcja techniczna** (Standard §18.1, od 25.08.2026):
  autor zostawia `[wstaw link afiliacyjny]` i podaje wyłącznie ceny będące
  częścią oceny. Kwoty sklepowe wchodzą znacznikiem
  `<div class="ceny-setu" data-set="<nr>"></div>` — `scripts/remark-ceny.mjs`
  zamienia go przy budowaniu na tę samą tabelę co na hubie, więc odświeża się
  z każdym przebiegiem Łowcy. Żadna kwota sklepowa nie jest wpisywana ręcznie.
- **Cena katalogowa** — kolejność źródeł: `rrp_potwierdzone.json` →
  `sety.json` → `ceny_baza.json` → `katalog.json`. RRP nie zmienia się w czasie,
  więc cena potwierdzona u źródła przez człowieka trafia do
  `rrp_potwierdzone.json` i **nie wymaga ponownego sprawdzania** — żaden backfill
  ani runner jej nie nadpisze. Wczytanie listy:
  `node scripts/wczytaj-rrp.mjs <plik> --zrodlo "..."`.
  Backfill w `katalog.json` powstawał z Bricksetu (GBP/USD/EUR) i bywał
  przeliczany kursem — a polski cennik LEGO ma własną drabinę (59,99 € to
  249,99 zł, nie 259,99 zł). Kontrola: `node scripts/kontrola-rrp.mjs`.
- **Prezentacja cen w artykułach** (Standard §18–19): artykuł dostaje trwałą
  drabinę cenową (RRP → dobra cena → bardzo dobra cena → próg zakupu),
  2–3 sklepy publikacyjne z linkami `/idz/<sklep>/<nr>` oraz link do huba
  `/zestaw/<nr>/`. **Hub jest naszym odpowiednikiem „sprawdź bieżącą cenę"** —
  jego tabela aktualizuje się codziennie z feedów, więc data przy tabeli huba
  jest zaletą (zawsze świeża), a nie snapshotem, którego zakazuje standard.
  Zakaz dat i pełnych snapshotów dotyczy **statycznej treści artykułów**.
- **Karta researchu** (Metodologia §10) → `redakcja/karty/<nr>-<slug>.md`.
  Katalog `redakcja/` nie jest publikowany (Astro buduje tylko `src/pages/`),
  więc karty pozostają dokumentami wewnętrznymi w repo.
- **Bramka eskalacyjna** (Metodologia §9): rozbieżności nierozstrzygnięte
  przedstawiamy Markowi w czacie przed finalną redakcją; decyzję zapisujemy
  w karcie researchu.
- **Oznaczenia afiliacji** (Standard §20): zapewnione na poziomie serwisu —
  disclosure w layoutcie artykułu (`src/layouts/Artykul.astro`) oraz
  `rel="sponsored nofollow"` na linkach afiliacyjnych (`TabelaCen.astro`,
  worker `/idz/`). Zgodne z zasadą „poziom strony/linku zamiast każdorazowych
  adnotacji w treści".

## Ograniczenia wykonawcze (środowisko serwerowe)

- lego.com, promoklocki.pl, zklockow.pl, x-kom.pl blokują ruch serwerowy —
  zklockow.pl przez Cloudflare managed challenge (403 nawet na `robots.txt`),
  lego.com twardą blokadą. Chromium w sesji serwerowej **nie ma sieci
  wychodzącej** (ERR_CONNECTION_RESET), więc przeglądarka nie obejdzie
  challenge'a. Ceny katalogowe z tych źródeł dostarcza człowiek albo Cowork
  i wczytujemy je przez `scripts/wczytaj-rrp.mjs` —
  poziom A metodologii (LEGO.com) realizujemy przez Brickset, instrukcje,
  feedy sklepów i dane podane przez użytkownika; wymóg „minimum pięciu
  polskich sklepów" pokrywają feedy + osiągalne witryny (Smyk, Planeta
  Klocków, Allegro przez feed, Media Expert przez feed, Empik przez TD).
- Recenzje wideo: transkrypty YouTube bywają niedostępne — wtedy w karcie
  zaznaczamy zakres analizy zgodnie z Metodologią §5.3.

## Decyzje projektowe (log)

- 2026-08-27 (Marek): **porządki w menu i artykułach.** Menu schodzi do sześciu
  pozycji (Promocje dziś, Nowości, Wycofania, Serie, Prezentowniki, Artykuły).
  Kalendarz i Zapowiedzi to artykuły — mieszkają w `/artykuly/` w kategoriach
  „Kalendarze" i „Premiery". Kolekcjoner zszedł z menu (dział pusty), strona
  zostaje pod adresem. Artykuły mają siedem stałych kategorii, prezentowniki
  wychodzą z `/artykuly/` do własnego działu. Szczegóły: Standard §18.2.

- 2026-08-25 (Marek): **cena katalogowa nie wymaga ponownego sprawdzania** — raz
  dobrze wprowadzona zostaje na zawsze. Wdrożone jako `src/data/rrp_potwierdzone.json`
  (rejestr write-once o najwyższym pierwszeństwie) + `scripts/wczytaj-rrp.mjs`.

- 2026-08-25 (Marek): **ceny wstawiamy my przy publikacji, ze źródeł serwisu** —
  Piotr celowo zostawia w materiale `[wstaw link afiliacyjny]` i nie podaje kwot
  sklepowych. Zapisane w Standardzie §18.1 (wersja 1.4).
- 2026-08-25: `katalog.json` miał zawyżone ceny katalogowe (22 poprawki na 198
  setów możliwych do porównania, m.in. 31161, 42686, 76321). Przyczyna: backfill
  przeliczał ceny z Bricksetu zamiast czytać polski cennik. Dodana kontrola
  `scripts/kontrola-rrp.mjs`; przy sporze rozstrzyga lego.pl, nie przelicznik.

- 2026-08-20 (Marek): wiersze „Sprawdź cenę" bez kwoty **zostają** w tabelach
  cen hubów — lepiej mieć link niż nie mieć (zapisane też w
  `afiliacje_rejestr.json`).
