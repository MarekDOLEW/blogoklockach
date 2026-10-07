# Karta researchu — słowniczek pojęć LEGO

- **Artykuł:** `/artykuly/slowniczek-lego/` (18.09.2026, Poradniki)
- **Polecenie Marka (17.09.2026):** „Ciekawym artykułem też może być słownik —
  ale lepiej zrobiony", wzór do pobicia: `fanklockow.pl/slowniczek-lego/`.
- **Źródło researchu:** strony LEGO.com (PL i newsroom), komunikaty prasowe
  Grupy LEGO relacjonowane przez Brickset i The Brothers Brick, Brick Architect
  (wymiary), własne dane serwisu (`src/data/*.json`).

## 1. Co ma wzór i czego mu brakuje

Zrzut `fanklockow.pl/slowniczek-lego/` z 18.09.2026 (data modyfikacji w metadanych
strony: **27.06.2023**). Ok. 45 haseł, układ alfabetyczny, bez spisu treści
i bez kotwic — nawigacja opiera się na dopiskach „patrz wyżej / patrz niżej"
przy niemal każdym haśle.

**Cztery hasła są dziś nieaktualne** (stan na 18.09.2026):

| Hasło u konkurencji | Stan faktyczny | Źródło |
|---|---|---|
| **VIP** — „program lojalnościowy oficjalnych sklepów" | program nazywa się **LEGO Insiders** od 21.08.2023 | newsroom LEGO, `lego.com/.../lego-insiders-where-play-is-rewarding` |
| **LDD** — „ściągniesz go stąd" + link | LDD wyłączony **31.01.2022**, następcą jest BrickLink Studio | komunikat prasowy Grupy LEGO (relacje: Brickset, The Brothers Brick) |
| **B&P vs PaB** jako dwie osobne usługi | scalone w jeden koszyk Pick a Brick (2022); LEGO.pl prowadzi dziś „Części zamienne" i hub „Klocki i elementy" | `lego.com/pl-pl/service/replacementparts` (sprawdzone 18.09.2026) |
| **RLFM** — „jednym z takich podmiotów jest BrickLink" | BrickLink należy do Grupy LEGO od listopada 2019, więc nie jest niezależnym medium fanowskim | komunikat o przejęciu, powszechnie relacjonowany |

**Jeden błąd rachunkowy:** płytka bazowa 32 × 32 opisana jako „kwadrat
25,5 × 25,5 **mm**". 32 study × 8 mm = **256 mm**, czyli ok. 25,6 cm.

**Czego nie ma w ogóle:** nic o cenach i kupowaniu poza EOL — brak ceny
katalogowej, brak przelicznika zł/element, brak „najniższej ceny z 30 dni"
(obowiązek sklepów w Polsce od 1.01.2023), brak Insiders, brak CMF,
brak oznaczenia 18+, brak serii Icons (zmiana nazwy z Creator Expert, 2022),
brak mini-dollek z Friends, brak rozdzielacza do klocków.

## 2. Nasza przewaga — pięć rzeczy

1. **Aktualność.** Cztery hasła wyżej są u nas poprawne, a zmiany nazw
   dostają osobną sekcję („Skróty, które zmieniły znaczenie") — to jest
   dokładnie ten typ wiedzy, po który ktoś przychodzi do słownika.
2. **Podział tematyczny + indeks A–Z z kotwicami.** Zamiast „patrz wyżej"
   są działające odnośniki wewnątrz strony.
3. **Dział o pieniądzach.** Konkurencja tłumaczy, co to AFOL; my dodatkowo
   tłumaczymy, co to cena katalogowa, zł/element i „najniższa cena z 30 dni" —
   czyli to, czym czytelnik posługuje się przy zakupie.
4. **Linkowanie wewnętrzne.** Hasła prowadzą do naszych stron, które je
   pokazują w działaniu: `/wycofania/` (EOL), `/ekskluzywne/` (D2C),
   `/artykuly/lego-insiders-nowe-zasady-nagrod/` (Insiders),
   `/artykuly/wycofania-lego-grudzien-2026/`, `/deale/`, `/nowosci/`,
   huby `/zestaw/<nr>/` (zł za element, historia ceny).
5. **Sekcja „co mylimy najczęściej"** — sześć par pojęć, które w praktyce
   wywracają rozmowę (brick/plate/tile, PaB/części zamienne, EOL/wycofany,
   ekskluzyw/D2C, MOC/custom, lepiny/klony).

## 3. Fakty zweryfikowane u źródła (18.09.2026)

| Fakt | Wartość | Skąd |
|---|---|---|
| Zmiana nazwy VIP → Insiders | 21.08.2023 | newsroom LEGO |
| Wyłączenie LDD | 31.01.2022, następca BrickLink Studio | komunikat prasowy Grupy LEGO |
| Scalenie B&P z Pick a Brick | 2022, hub „Pick and Build" | LEGO.com + relacje branżowe |
| Nazewnictwo usług na LEGO.pl dziś | „Części zamienne" oraz „Klocki i elementy" | `lego.com/pl-pl/service/replacementparts`, sprawdzone 18.09.2026 |
| Moduł konstrukcyjny (LU) | 1,6 mm | Brick Architect |
| Rozstaw studów | 8 mm (5 LU) | Brick Architect |
| Wysokość klocka / płytki | 9,6 mm (6 LU) / 3,2 mm (2 LU) | Brick Architect |
| Płytka bazowa 32 × 32 | 32 × 8 mm = 25,6 cm | rachunek z rozstawu studów |
| BrickLink własnością Grupy LEGO | od listopada 2019 | komunikat o przejęciu |
| Obowiązek „najniższej ceny z 30 dni" w PL | od 1.01.2023 (wdrożenie dyrektywy Omnibus) | ustawa o informowaniu o cenach |

**Nie weryfikowano u źródła** (podajemy jako wiedzę środowiskową, bez liczb
udających precyzję): potoczne znaczenia „greeblesów", „miksu", „lepinów",
granice skal budowlanych. To pojęcia zwyczajowe — nie mają definicji
producenta i tak są w tekście opisane.

## 4. Czego świadomie NIE piszemy

- **Nie podajemy średnicy pręta jako „3,18 mm" z pozorną dokładnością do setnej.**
  Wartość krąży po forach, ale nie znaleźliśmy jej w żadnym dokumencie
  producenta; piszemy „ok. 3,2 mm" i mówimy wprost, skąd ta liczba się bierze
  (2 moduły LU).
- **Nie powtarzamy tezy, że wycofanie = wzrost wartości.** Nasze własne dane
  (206 zestawów z potwierdzonym wycofaniem, artykuł z 17.09.2026) pokazują
  medianę rabatu ok. 18% i tylko co czwarty zestaw powyżej ceny katalogowej.
  Hasło EOL odsyła do tego artykułu zamiast obiecywać zysk.
- **Nie nazywamy podróbek „szajsem z Chin"** (sformułowanie wzoru). Piszemy,
  czym są klony, dlaczego bywają problemem prawnym i jakościowym — bez epitetów.

## 5. Cykl i utrzymanie

Tekst jest wiecznie zielony, ale ma jeden element, który się starzeje: sekcja
zmian nazw. Przegląd co pół roku (marzec / wrzesień) razem z przeglądem
`redakcja/ustalenia-projektowe.md`. Data „zaktualizowano" w nagłówku artykułu
jest jedynym miejscem, gdzie pojawia się data — żadne hasło nie zawiera ceny
ani stanu magazynowego.

## 6. Rozbieżności

Brak nierozstrzygniętych — bramka eskalacyjna nieuruchamiana. Cztery
rozbieżności wobec wzoru (tabela w §1) rozstrzygnięte źródłem producenta.
