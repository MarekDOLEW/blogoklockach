# Karta researchu — prezentownik LEGO według budżetu

Dokument wewnętrzny. Nie jest częścią publikowanego tekstu.

## 1. Zakres i oś wyboru

**Typ:** prezentownik (dział `/prezentowniki/`, standard sprzedażowy).
**Pytanie:** mam do wydania konkretną kwotę — co kupić, żeby trafić?

**Dlaczego ta oś.** Mamy dwanaście prezentowników po seriach, ale one zakładają,
że kupujący wie, *jaką serię* chce. W praktyce częściej wie, *ile chce wydać* —
zwłaszcza przy prezencie dla cudzego dziecka. To brakująca oś, nie powtórka.

**Trzy przedziały, nie osiem progów.** Wzorzec prezentownika serii ma drabinę
ośmiu progów, ale ona **sama jest osią budżetową**. Powielenie jej tutaj dałoby
tekst, który powtarza wzorzec zamiast wnosić nową oś. Zamiast tego trzy realne
koperty zakupowe (do 100, do 300, do 600 zł), a wewnątrz każdej różnicujemy po
**sposobie zabawy**, nie po cenie.

Podział 3 + 3 + 2 = **osiem pozycji**, zgodnie z regułą galerii (dwa równe
rzędy po cztery). Górna półka ma dwie pozycje świadomie: przy takich kwotach
decyzja jest rzadsza i bardziej osobista, a szeroki wybór tylko rozmywa radę.

**Zakres cenowy odnosimy do ceny rynkowej, nie katalogowej** — bo kupujący ma
w kieszeni tyle, ile ma, i płaci to, co w sklepie. Dlatego w przedziale „do
100 zł" jest zestaw o cenie katalogowej 114,99 zł.

## 2. Populacja i kwalifikacja

Kandydaci: zestawy z `sety.json`, które mają **cenę katalogową**, **redakcyjny
opis** (żeby było o czym pisać rzetelnie) i **realną cenę rynkową w feedach**.
Po tym filtrze: 55 kandydatów do 100 zł, 106 w przedziale 101–300 zł,
53 w przedziale 301–600 zł.

Wyłączenia: zestawy z listy wycofań (przy prezencie termin bywa ważniejszy od
kwoty, a nie chcemy polecać czegoś, co zniknie w trakcie sezonu) oraz zestawy
bez opisu redakcyjnego.

**Kryteria doboru wewnątrz przedziału**, w kolejności wagi:
1. różny **sposób zabawy** — budowanie, przebudowa, role-play, ekspozycja;
2. **rozpiętość wieku** — przedział ma obsłużyć dwulatka i dorosłego;
3. brak dublowania serii między pozycjami;
4. przelicznik ceny za element jako kontrola, nie jako kryterium.

**Świadomie nie dzielimy według płci dziecka** — to reguła standardu i tutaj
ma szczególne znaczenie, bo prezentowniki budżetowe u konkurencji zwykle
rozjeżdżają się na „dla chłopca / dla dziewczynki".

## 3. Wybrane pozycje — fakty i uzasadnienie

Wszystkie parametry z `sety.json` i `katalog.json`, ceny rynkowe
z `oferty_feed.json` (stan 01.09.2026, dane wewnętrzne). Żaden z ośmiu
zestawów nie jest na liście wycofań.

| Nr | Seria | RRP | Elementy | Wiek | Rola w tekście |
|---|---|---|---|---|---|
| 71052 | Minifigurki | 16,49 | 7 | 5+ | drobiazg, świadomie z zastrzeżeniem |
| 43280 | Disney | 81,99 | 113 | 4+ | najmłodsze dziecko, role-play |
| 77256 | Speed Champions | 114,99 | 357 | 9+ | licencja działająca na dwa pokolenia |
| 10470 | DUPLO | 339,99 | 166 | 2+ | pierwsze klocki, rośnie z dzieckiem |
| 31386 | Creator 3 w 1 | 274,99 | 839 | 9+ | przebudowa, najlepszy przelicznik |
| 76339 | Marvel | 299,99 | 747 | 10+ | figurka zamiast pojazdu |
| 60494 | City | 519,99 | 1132 | 8+ | duża zabawa, nie ekspozycja |
| 11372 | Icons | 479,99 | 1102 | 18+ | prezent dla dorosłego |

**Trudne decyzje:**

- **71052 jako drobiazg.** Saszetka minifigurkowa to loteria — kupujący nie
  wie, którą figurkę dostanie. Przy prezencie to wada i **mówimy o niej wprost**
  zamiast sprzedawać niespodziankę jako zaletę. Zostaje w zestawieniu, bo przy
  kilkunastu złotych to jedyna sensowna pozycja tej wielkości, a rola „dokładka
  do prezentu" jest realna.
- **42704 Grand Hotel odrzucony** mimo dobrego przelicznika w górnej półce.
  Powód: w prezentowniku Friends napisaliśmy 28.08, że w styczniu wraca
  42719 Centrum handlowe i przy dużym prezencie warto poczekać. Polecanie go
  tutaj bez tego zastrzeżenia byłoby niespójne, a z zastrzeżeniem — słabe.
- **11372 zamiast 21370 E.T. i 21366 Pływające wydry** w półce dla dorosłego.
  Wszystkie trzy są dobre; Icons wygrywa, bo jest najtańszy z nich i jako
  jedyny nie wymaga sentymentu do konkretnego tytułu.
- **Górna półka bez modelu 18+ z licencją.** Świadomie: przy 600 zł kupujący
  dla dorosłego zwykle wie, czego szuka, a kupujący dla dziecka potrzebuje
  wskazówki bardziej. Stąd 60494 (dziecko) i 11372 (dorosły) zamiast dwóch
  modeli kolekcjonerskich.

## 4. Drabina cenowa

Poziomy to **ocena redakcyjna**, nie odczyt z feedu. Punktem odniesienia jest
rozkład cen rynkowych w danym przedziale, a nie stały procent od katalogu.

| Nr | Katalogowa | Dobra | Bardzo dobra | Próg zakupu |
|---|---|---|---|---|
| 71052 | 16,49 | 12 | 10 | poniżej 12 zł |
| 43280 | 81,99 | 55 | 50 | poniżej 55 zł |
| 77256 | 114,99 | 70 | 64 | poniżej 70 zł |
| 10470 | 339,99 | 230 | 215 | poniżej 230 zł |
| 31386 | 274,99 | 190 | 175 | poniżej 190 zł |
| 76339 | 299,99 | 205 | 190 | poniżej 205 zł |
| 60494 | 519,99 | 390 | 365 | poniżej 390 zł |
| 11372 | 479,99 | 350 | 325 | poniżej 350 zł |

Sklepy publikacyjne dobrane niezależnie od afiliacji, zgodnie z
`sklepy-i-afiliacja.md`. Kwoty do treści nie trafiają.

## 5. Niepewności

1. **Brak recenzji części pozycji.** 76339 ma premierę 08.2026, 31386 i 43280
   — 06.2026. Oceniamy skład i przeznaczenie, nie jakość budowania.
2. **Ceny rynkowe zmieniają się codziennie.** Dlatego w tekście jest drabina
   i próg zakupu, a bieżące kwoty wchodzą znacznikiem tabeli, który odświeża
   się przy każdym budowaniu serwisu.
3. **Przedziały mogą przestać pasować.** Jeśli któryś zestaw wyjdzie ze swojego
   przedziału na trwałe, trzeba go podmienić — to jedyny element tego tekstu,
   który wymaga ręcznego doglądania.

## 6. Bibliografia

Dane własne: `src/data/sety.json` (parametry, opisy redakcyjne),
`src/data/katalog.json` (ceny katalogowe), `src/data/oferty_feed.json`
(poziom cen rynkowych, stan 01.09.2026), `src/data/wycofania.json`
(kontrola, czy któryś kandydat nie znika z rynku).

Nie korzystaliśmy ze źródeł zewnętrznych — wszystkie twierdzenia w tekście
wynikają z parametrów zestawów i z naszej oceny redakcyjnej.
