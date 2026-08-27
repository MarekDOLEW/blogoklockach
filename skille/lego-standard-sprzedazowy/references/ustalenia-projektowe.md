# Ustalenia projektowe — warstwa tylkoklocki.pl

Dokumenty wspólnika (`standard-artykulow-biezacych.md`, `metodologia-researchu-lego.md`)
leżą w repo **verbatim** — nie dopisujemy w nich ani słowa. Pisano je dla
„klasycznego" bloga, a nasz serwis ma warstwę automatyzacji: generowane tabele
cen, rejestr RRP, siedem kategorii, worker `/idz/`. Wszystko, co z tej
automatyzacji wynika, mieszka **tutaj**.

Dzięki temu, gdy Piotr przyśle standard 1.6, podmieniamy jeden plik i nic
z naszych ustaleń nie ginie w scalaniu prozy.

## Pierwszeństwo

Przy sprzeczności wygrywa ten dokument — ale **tylko w sprawach infrastruktury
serwisu**: skąd biorą się ceny, jak wstawiamy linki, jak nazywamy i klasyfikujemy
teksty. W sprawach redakcyjnych — ton, struktura, dobór modułów, ważenie zalet
i wad, hierarchia źródeł, próg zakupu jako ocena — rozstrzygają dokumenty
wspólnika i tego nie podważamy.

Sprzeczność, której nie da się rozstrzygnąć tą regułą, idzie do Marka przed
publikacją (bramka eskalacyjna, Metodologia §9).

---

## 1. Podział pracy: kto wstawia ceny i linki

Zasada obowiązująca od 25.08.2026. **Autor tekstu nie wpisuje konkretnych kwot sklepowych ani adresów afiliacyjnych.** Wstawia w ich miejsce oznaczenie `[wstaw link afiliacyjny]`, a ceny podaje wyłącznie tam, gdzie są częścią oceny: cena katalogowa, dobra i bardzo dobra cena, próg zakupu.

Kwoty sklepowe i linki uzupełnia redakcja techniczna podczas wgrywania artykułu na serwer, ze źródeł serwisu:

| Co | Skąd | Kto |
|---|---|---|
| Ceny sklepowe w tabeli | `oferty_feed.json` — renderowane przy budowaniu znacznikiem `<div class="ceny-setu" data-set="<nr>"></div>` | automat, odświeża się z każdym przebiegiem Łowcy |
| Cena katalogowa (RRP) | `rrp_potwierdzone.json` → `sety.json` → `ceny_baza.json` → `katalog.json` | rejestr potwierdzony przez człowieka jest ponad automatem |
| Linki do sklepów | `/idz/<sklep>/<nr>` — worker i `redirects.json` | redakcja techniczna, zamiast `[wstaw link afiliacyjny]` |
| Drabina cenowa i próg zakupu | ocena autora | autor tekstu |

Dzięki temu artykuł nie zawiera ani jednej ręcznie wpisanej ceny sklepowej, która mogłaby się zestarzeć. Tabela cen w treści tekstu jest **generowana**, nie przepisywana — nie jest więc snapshotem, którego zakazuje §18, i nie podaje daty kontroli.

**Cena katalogowa raz ustalona zostaje na zawsze.** RRP nie zmienia się w czasie — nie ma powodu sprawdzać go ponownie przy każdym artykule. Cena potwierdzona u źródła trafia do `src/data/rrp_potwierdzone.json` (rejestr write-once o najwyższym pierwszeństwie) i od tej pory żaden backfill ani runner jej nie nadpisze. Wczytanie listy cen: `node scripts/wczytaj-rrp.mjs <plik> --zrodlo "..."`.

**Cena katalogowa w tekście musi zgadzać się z danymi serwisu**, bo z tego samego źródła bierze ją generowana tabela — inaczej na jednej stronie stoją dwie różne kwoty. Przy rozbieżności rozstrzyga polski cennik LEGO, nie przeliczenie ceny w euro. Kontrola: `node scripts/kontrola-rrp.mjs`.

## 2. Kategorie i nazewnictwo artykułów

Obowiązuje od 27.08.2026. Dział `/artykuly/` ma **siedem stałych kategorii**,
w tej kolejności: **Premiery, Recenzje, Rankingi, Porównania, Poradniki,
Kalendarze, Historyczne**. Lista mieszka w `src/data/kategorie_artykulow.json`
i jest zamknięta — nowy tekst wpada do jednej z nich, nie tworzymy kategorii
pod pojedynczy artykuł. Kategorie bez tekstów też mają przycisk na filtrze:
czytelnik widzi zakres serwisu, redakcja widzi dziury.

**Tytuł roboczy i nazwa pliku zaczynają się od kategorii** — po samej nazwie ma
być widać, gdzie tekst trafia: „Recenzja LEGO 71858…", „Ranking zestawów
Technic do 300 zł", „Porównanie 60506 i 60511".

**Prezentownik nie jest kategorią artykułu.** Ma własny dział `/prezentowniki/`
i nie pojawia się na liście artykułów. Docelowa liczba zestawów w prezentowniku
serii to **osiem** — galeria układa się po cztery w rzędzie, więc osiem daje dwa
równe rzędy (wzorzec: `redakcja/wzorce/prezentownik-serii.md`).

Gotowe szkielety: `redakcja/wzorce/`.


---

## 3. Mapowanie standardu na infrastrukturę serwisu

| Standard mówi | U nas realizuje to |
|---|---|
| rejestr sklepów (Sklepy §2–3) | `src/data/sklepy.json` + `src/data/afiliacje_rejestr.json` |
| snapshot cenowy (Metodologia §6.3) | `src/data/oferty_feed.json`, odświeżany codziennie przez Łowcę |
| „sprawdź bieżącą cenę" | hub `/zestaw/<nr>/` — tabela renderowana przy buildzie |
| karta researchu (Metodologia §10) | `redakcja/karty/<nr>-<slug>.md`, katalog niepublikowany |
| oznaczenie afiliacji (Standard §20) | disclosure w layoucie + `rel="sponsored nofollow"` |
| `[wstaw link afiliacyjny]` | podmieniane przy publikacji na `/idz/<sklep>/<nr>` |

## 4. Ograniczenia wykonawcze

- **lego.com, promoklocki.pl, zklockow.pl, x-kom.pl blokują ruch serwerowy.**
  zklockow.pl przez Cloudflare managed challenge (403 nawet na `robots.txt`),
  lego.com twardą blokadą. Chromium w sesji serwerowej nie ma sieci wychodzącej,
  więc przeglądarka nie obejdzie challenge'a. Poziom A metodologii realizujemy
  przez Brickset, instrukcje, feedy sklepów i dane podane przez użytkownika.
- **Ceny katalogowe z tych źródeł dostarcza człowiek albo Cowork** i wczytujemy
  je skryptem `scripts/wczytaj-rrp.mjs` do `src/data/rrp_potwierdzone.json`.
- Transkrypty YouTube bywają niedostępne — wtedy w karcie zaznaczamy zakres
  analizy zgodnie z Metodologią §5.3.
