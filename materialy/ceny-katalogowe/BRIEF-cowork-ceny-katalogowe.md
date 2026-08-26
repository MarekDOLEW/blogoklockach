# Brief dla Cowork — weryfikacja cen katalogowych LEGO

## Po co

Ceny katalogowe (RRP) w `src/data/katalog.json` były uzupełniane partiami
z Bricksetu, który podaje **GBP / USD / EUR — nie złotówki**. Ktoś przeliczał je
kursem, a polski cennik LEGO ma własną drabinę: 59,99 € to **249,99 zł**, nie
259,99 zł. Kontrola z 25.08.2026 znalazła 22 błędy na 198 setów, które dało się
porównać ze źródłem zweryfikowanym — 11%, prawie same zawyżenia. Najgorsze:
42682 miał 304,99 zł zamiast 104,99 zł.

To nie jest kosmetyka. Od RRP liczymy rabat w tabelach cen, więc zawyżone RRP
pokazuje czytelnikowi promocję, której nie ma.

**Cena katalogowa nie zmienia się w czasie.** Raz poprawnie wprowadzona zostaje
na zawsze i nigdy nie trzeba jej sprawdzać ponownie. Dlatego ta robota jest
jednorazowa per zestaw.

## Czego nie mogę zrobić sam

Sesja serwerowa nie ma dostępu do źródeł z polskim cennikiem:

| Źródło | Wynik |
|---|---|
| lego.com/pl-pl | 403 — blokada ruchu serwerowego |
| zklockow.pl | 403, `cf-mitigated: challenge` — Cloudflare, także na `robots.txt` |
| Chromium / Playwright | `ERR_CONNECTION_RESET` na każdym hoście — brak sieci w przeglądarce |
| feed Planeta Klocków | `PreviousPrice` = cena sklepu, zgodność z RRP 10% |
| feed Media Expert | `g:price` = cena sklepu, zgodność 6% |
| Brickset | osiągalny, ale ceny tylko GBP/USD/EUR |

Ty masz lokalną przeglądarkę, więc lego.pl i zklockow.pl są dla Ciebie otwarte.

## Co zrobić

W pliku **`rrp-do-sprawdzenia.csv`** jest 1077 zestawów ze statusem „dostępny"
(tylko takie mają kartę na lego.pl). Kolumny:

| Kolumna | Znaczenie |
|---|---|
| `numer` | numer zestawu |
| `nazwa`, `seria` | do odnalezienia produktu |
| `nasza_cena` | co mamy dziś w bazie |
| `zrodlo_naszej` | `katalog (niepewne)` — 834 szt., **tu jest ryzyko błędu**; `zweryfikowane` — 202 szt.; `BRAK` — 41 szt. bez żadnej ceny |
| `CENA_Z_LEGO_PL` | **do wypełnienia przez Ciebie** — oficjalna cena katalogowa z lego.pl |

Kolejność w pliku jest już priorytetowa: najpierw 1060 zestawów obecnych
w serwisie, potem reszta. Jeśli robisz partiami, bierz od góry.

**Wypełniaj tylko ostatnią kolumnę.** Format ceny dowolny — `249,99`, `249.99`,
`249,99 zł` — parser sobie poradzi. Wiersze bez wypełnionej ceny pomiń, nie kasuj.

Jeżeli zestawu nie ma już na lego.pl (zszedł ze sprzedaży) — zostaw pusto
i dopisz w kolumnie cokolwiek typu `brak`; wtedy wiersz zostanie pominięty.

## Jak oddać wynik

Wrzuć wypełniony CSV do repo i uruchom:

```bash
node scripts/wczytaj-rrp.mjs rrp-do-sprawdzenia.csv --zrodlo "lego.pl (Cowork)" --sucho
```

`--sucho` niczego nie zapisuje: pokazuje, ile cen dochodzi i **gdzie jest
konflikt** z tym, co już mamy potwierdzone. Konflikt oznacza błąd po jednej ze
stron — rozstrzygnij go u źródła, nie nadpisuj w ciemno.

Gdy raport wygląda dobrze:

```bash
node scripts/wczytaj-rrp.mjs rrp-do-sprawdzenia.csv --zrodlo "lego.pl (Cowork)"
node scripts/kontrola-rrp.mjs
```

Ceny trafiają do `src/data/rrp_potwierdzone.json` — rejestru o **najwyższym
pierwszeństwie**. Od tej chwili żaden backfill ani runner ich nie nadpisze,
a `kontrola-rrp.mjs` pilnuje, żeby reszta danych się z nimi zgadzała.

Nie musisz robić wszystkiego naraz. Każda partia zabetonowuje kolejny kawałek
katalogu na stałe.

## Czego NIE robić

- Nie przeliczać cen z EUR/USD/GBP. Polski cennik ma własną drabinę.
- Nie brać ceny ze sklepu (Media Expert, Planeta Klocków, Allegro) jako RRP —
  to cena sprzedaży, nie cennik. Ceny sklepowe zbieramy osobno, feedami.
- Nie nadpisywać wpisów już potwierdzonych bez rozstrzygnięcia u źródła.
