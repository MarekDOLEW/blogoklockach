# Sklepy i afiliacja

Dokument roboczy projektu Blog LEGO

Wersja 1.1

## 1. Cel dokumentu

Dokument określa listę sklepów wykorzystywanych w researchu cenowym, pola potrzebne do ich oceny, zasady wyboru 2–3 sklepów publikacyjnych oraz sposób obsługi afiliacji. Afiliacja jest mechanizmem zaplecza: ma być rejestrowana wewnętrznie, aby możliwa była kontrola bezstronności rekomendacji, ale status afiliacyjny konkretnej oferty nie musi być opisywany w treści każdego artykułu.

Zasada nadrzędna: research obejmuje najlepsze dostępne oferty niezależnie od tego, czy Blog LEGO posiada z danym sklepem współpracę afiliacyjną. Afiliacja nie może wpływać na ocenę zestawu, próg zakupu, wybór najlepszej oferty ani dobór sklepów publikacyjnych.

## 2. Rejestr sklepów — pola obowiązkowe

| Pole | Znaczenie |
|---|---|
| ID sklepu | Krótki identyfikator wewnętrzny, np. LEGO, AMAZON, ME. |
| Nazwa sklepu | Nazwa stosowana w researchu i artykułach. |
| Domena | Główna domena sklepu. |
| Typ sprzedawcy | Sklep własny / marketplace / hybrydowy. |
| Znaczenie dla rynku LEGO | Podstawowy / uzupełniający / okazjonalny. |
| Zakres LEGO | Szeroki / średni / ograniczony. |
| Typowe mocne strony | Np. premiery, ekskluzywności, promocje, zestawy dziecięce. |
| Typowe ograniczenia | Np. zmienni sprzedawcy marketplace, koszt dostawy, warunkowe kody. |
| Program afiliacyjny | Tak / nie / do weryfikacji. |
| Operator afiliacji | Program własny / sieć zewnętrzna / do ustalenia. |
| Status współpracy Blog LEGO | Brak / planowana / zgłoszona / aktywna / zawieszona. |
| ID wydawcy / kampanii | Do uzupełnienia po uruchomieniu współpracy. |
| Stawka prowizji | Aktualna stawka; zawsze z datą obowiązywania lub weryfikacji. |
| Okres atrybucji / cookie | Jeżeli program posługuje się takim parametrem. |
| Deep link | Tak / nie / do ustalenia. |
| Feed produktowy / API | Tak / nie / do ustalenia. |
| Link afiliacyjny | W materiałach roboczych: [wstaw link afiliacyjny]. |
| Uwagi afiliacyjne | Wyłączenia, ograniczenia, zasady naliczania prowizji. |
| Data ostatniej weryfikacji afiliacji | DD.MM.RRRR. |
| Uwagi redakcyjne | Informacje istotne przy rekomendowaniu sklepu. |

## 3. Sklepy bazowe

| ID | Sklep | Typ | Priorytet | Afiliacja | Uwagi |
|---|---|---|---|---|---|
| LEGO | LEGO.pl | sklep producenta | podstawowy | tak / do konfiguracji | Punkt odniesienia dla RRP, premier, ekskluzywności i dostępności oficjalnej. |
| AMAZON | Amazon.pl | sklep / marketplace | podstawowy | do weryfikacji | Często konkurencyjne ceny; kontrolować sprzedawcę, realizację i dostawę. |
| MEDIAEXPERT | MediaExpert.pl | sklep | podstawowy | tak / do konfiguracji | Duży sprzedawca, regularne promocje i kody. |
| EMPIK | Empik.com | sklep / marketplace | podstawowy | tak / do konfiguracji | Szeroka oferta; kontrolować, czy sprzedawcą jest Empik czy partner marketplace. |
| XKOM | x-kom.pl | sklep | podstawowy | tak / do konfiguracji | Duży detalista z ofertą LEGO; warto monitorować promocje i dostępność. |
| SMYK | Smyk.com | sklep | uzupełniający | tak / do konfiguracji | Szczególnie istotny przy zestawach dziecięcych i prezentowych. |
| ALLEGRO | Allegro.pl | marketplace | uzupełniający | tak / do konfiguracji | Szeroki benchmark rynku; obowiązkowa kontrola konkretnego sprzedawcy. |

## 4. Dane zbierane dla konkretnej oferty

- Numer i nazwa zestawu
- Sklep i faktyczny sprzedawca
- Cena produktu
- RRP LEGO
- Rabat względem RRP
- Koszt dostawy
- Cena efektywna
- Dostępność
- Kod rabatowy i jego warunki
- Wymagany program lojalnościowy lub konto
- Status marketplace, jeżeli dotyczy
- Status afiliacyjny — wyłącznie jako pole wewnętrzne
- Link roboczy / [wstaw link afiliacyjny]
- Data sprawdzenia w formacie DD.MM.RRRR — pole wewnętrzne, niepublikowane w artykule
- Uwagi o warunkach oferty
- Kwalifikacja jako sklep publikacyjny i krótkie uzasadnienie

## 5. Kategorie ofert

### 5.1. RRP

Oficjalna polska cena katalogowa LEGO. Jest punktem odniesienia, nie automatyczną miarą dobrej ceny rynkowej.

### 5.2. Najniższa znaleziona cena

Najniższa cena efektywna znaleziona podczas researchu, pod warunkiem realnej dostępności i wiarygodności oferty.

### 5.3. Najlepsza oferta dla czytelnika

Oferta rekomendowana przez Blog LEGO. Nie musi być najtańsza, jeżeli różnicę uzasadniają m.in. renoma sprzedawcy, dostawa, czas realizacji, warunki zwrotu lub prostota reklamacji. Każde odstępstwo od najniższej ceny należy uzasadnić wewnętrznie, a w artykule wtedy, gdy ma znaczenie dla decyzji czytelnika.

### 5.4. Najlepsza oferta objęta afiliacją

Pole obowiązkowe w researchu wewnętrznym, jeżeli Blog LEGO posiada aktywną współpracę. Służy kontroli bezstronności. Jeżeli oferta afiliacyjna jest gorsza od najlepszej oferty dla czytelnika, nie wolno zastępować nią lepszej rekomendacji tylko z powodu afiliacji.

### 5.5. Sklepy publikacyjne

Zestaw 2–3 wiarygodnych sklepów linkowanych w artykule, aby czytelnik mógł samodzielnie sprawdzić aktualną cenę. Jest to osobna kategoria od najniższej znalezionej ceny, najlepszej oferty dla czytelnika i najlepszej oferty objętej afiliacją.

Sklepy publikacyjne dobierać według wiarygodności, stabilności oferty, realnej dostępności, prostoty zakupu oraz użyteczności dla czytelnika. Nie muszą być trzema najtańszymi sklepami w dniu researchu.

Domyślnie stosować 2–3 sklepy. Można podać jeden lub dwa, jeżeli tylko tyle ofert spełnia kryteria; nie uzupełniać listy mechanicznie. Status afiliacyjny nie może decydować o wyborze.

## 6. Zasada publikacyjna afiliacji

W treści artykułu nie ma obowiązku każdorazowego informowania, która konkretna oferta jest objęta afiliacją. Czytelnik powinien otrzymać trwały punkt odniesienia cenowego — RRP, normalny przedział rynkowy, dobrą lub bardzo dobrą cenę i próg zakupu — oraz 2–3 linki do wiarygodnych sklepów. Po kliknięciu sam sprawdza bieżącą kwotę. W artykule nie podaje się daty kontroli cen ani pełnego zestawienia chwilowych ofert. Informacja o korzystaniu przez serwis z afiliacji powinna być zapewniona na poziomie strony, linku lub innego stałego elementu informacyjnego zgodnie z przyjętymi zasadami prawnymi i regulaminowymi.

Status afiliacyjny, data kontroli, najniższa cena, najlepsza oferta dla czytelnika i najlepsza oferta afiliacyjna pozostają widoczne w karcie researchu, arkuszu cenowym i innych narzędziach wewnętrznych. Osobno zapisuje się wybór sklepów publikacyjnych. Dzięki temu można sprawdzić, czy afiliacja nie wpłynęła na rekomendację ani zestaw linków w artykule.

## 7. Marketplace — zasady kontroli

- nazwa konkretnego sprzedawcy
- kto realizuje wysyłkę
- koszt i warunki dostawy
- czy produkt jest nowy i fabrycznie zamknięty
- wiarygodność sprzedawcy, jeżeli ma znaczenie
- warunki zwrotu i reklamacji
- czy dodatkowe korzyści wymagają programu typu Smart, Prime lub podobnego

Najniższa cena na marketplace nie jest automatycznie najlepszą ofertą dla czytelnika.

## 8. Status programu afiliacyjnego

- BRAK PROGRAMU
- PROGRAM DOSTĘPNY
- PLANOWANA REJESTRACJA
- ZGŁOSZENIE W TOKU
- AKTYWNY
- ZAWIESZONY
- ZAKOŃCZONY
- DO WERYFIKACJI

Do czasu uruchomienia realnych współprac nie wpisywać testowych stawek prowizji jako danych faktycznych. Dane testowe muszą być jednoznacznie oznaczone: DANE TESTOWE — NIE UŻYWAĆ W PUBLIKACJI.

## 9. Pola jakościowe sklepu

- Wiarygodność: wysoka / średnia / wymaga kontroli
- Łatwość zwrotu: dobra / standardowa / nieoceniona
- Przewidywalność dostawy: wysoka / średnia / zmienna
- Ryzyko marketplace: brak / średnie / wysokie
- Częstotliwość dobrych promocji LEGO: wysoka / średnia / niska
- Przydatność afiliacyjna: wysoka / średnia / niska
- Priorytet monitorowania: 1 / 2 / 3

Pola jakościowe są narzędziem wewnętrznym. Nie stanowią automatycznej oceny sklepu publikowanej na blogu.

## 10. Priorytet monitorowania

Priorytet 1 — sprawdzać przy praktycznie każdym aktualnym zestawie: LEGO.pl, Amazon.pl, MediaExpert.pl, Empik.com, x-kom.pl.

Priorytet 2 — sprawdzać zależnie od charakteru zestawu i sytuacji rynkowej: Smyk.com, Allegro.pl.

Lista nie jest zamknięta. Jeżeli research pokaże sklep regularnie oferujący istotną część katalogu LEGO w konkurencyjnych cenach, można go dodać po weryfikacji wiarygodności i warunków sprzedaży.

## 11. Zasada aktualizacji

Programy afiliacyjne i ich warunki mogą się zmieniać. Przy każdym sklepie należy przechowywać datę ostatniej weryfikacji programu, status programu i datę ostatniej zmiany danych. Stawki prowizji, okresy atrybucji i wyłączenia produktowe nie powinny być traktowane jako dane stałe.

## 12. Zasada końcowa

Lista sklepów służy do zapewnienia rzetelnego researchu cenowego, a nie do ograniczenia researchu do partnerów afiliacyjnych. Prawidłowym wynikiem researchu może być rekomendacja sklepu, z którym Blog LEGO nie ma współpracy afiliacyjnej. Najpierw pełny obraz rynku i potrzeba czytelnika, potem trwały wybór 2–3 sklepów publikacyjnych, a dopiero na końcu sposób monetyzacji.

Uwagi do wersji 1.1: rozdzielono trzy warstwy pracy cenowej — pełny, datowany research; wybór najlepszych ofert wewnętrznych; oraz 2–3 sklepy publikacyjne służące czytelnikowi do sprawdzenia aktualnej ceny. Doprecyzowano, że data kontroli nie trafia do artykułu, a afiliacja nie wpływa na dobór sklepów publikacyjnych.
