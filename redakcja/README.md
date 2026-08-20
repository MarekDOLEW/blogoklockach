# Redakcja — dokumenty bazowe projektu

Trzy dokumenty wspólnika stanowią **obowiązującą podstawę pracy nad artykułami**
na tylkoklocki.pl. Każdy artykuł (recenzja, poradnik, ranking, porównanie)
powstaje zgodnie z nimi:

| Dokument | Wersja | Rola |
|---|---|---|
| [metodologia-researchu-lego.md](metodologia-researchu-lego.md) | 1.4 | Jak robić research: hierarchia źródeł, mapa recenzji (min. 4 niezależne opinie), karta researchu, procedura rozbieżności z bramką eskalacyjną |
| [standard-artykulow-biezacych.md](standard-artykulow-biezacych.md) | 1.3 | Jak pisać: rdzeń + moduły, profil odbiorcy, ton, drabina cenowa, próg zakupu, CTA, checklista przed publikacją, antywzorce |
| [sklepy-i-afiliacja.md](sklepy-i-afiliacja.md) | 1.1 | Sklepy w researchu i publikacji: rejestr, kategorie ofert, 2–3 sklepy publikacyjne, bezstronność afiliacji |

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
  poziom A metodologii (LEGO.com) realizujemy przez Brickset, instrukcje,
  feedy sklepów i dane podane przez użytkownika; wymóg „minimum pięciu
  polskich sklepów" pokrywają feedy + osiągalne witryny (Smyk, Planeta
  Klocków, Allegro przez feed, Media Expert przez feed, Empik przez TD).
- Recenzje wideo: transkrypty YouTube bywają niedostępne — wtedy w karcie
  zaznaczamy zakres analizy zgodnie z Metodologią §5.3.

## Decyzje projektowe (log)

- 2026-08-20 (Marek): wiersze „Sprawdź cenę" bez kwoty **zostają** w tabelach
  cen hubów — lepiej mieć link niż nie mieć (zapisane też w
  `afiliacje_rejestr.json`).
