# Do Piotra – poprawki w generatorze kart

Temat: **Karty zestawów – trzy powtarzalne błędy szablonu i lista zestawów do dopisania**

---

Cześć Piotrze,

wgraliśmy wszystkie karty z ostatnich paczek (`kolejka_511–617` oraz `braki_001–124`).
Rejestr ma teraz 1088 kart, a kolejka redakcyjna 1042 pozycje gotowe. Dziękuję –
paczki „braki" domknęły praktycznie całą lukę tekstową.

Przy wgrywaniu wyszły trzy powtarzalne rzeczy, które biorą się z szablonu, a nie
z pojedynczych kart. Poprawianie ich u nas po każdej dostawie nie ma sensu, bo
kolejna paczka wnosi je z powrotem – dlatego zbieram je razem.

## 1. Liczebniki 2 / 3 / 4 – POPRAWIONE U NAS

Po czasowniku rządzącym biernikiem, przy liczebnikach kończących się na 2, 3, 4
(poza 12, 13, 14), jest **„elementy"**, nie „elementów":

- było: „pudełko zawiera 262 elementów", „zestaw liczy 153 elementów"
- ma być: „pudełko zawiera 262 **elementy**", „zestaw liczy 153 **elementy**"

Poprawiliśmy to u siebie: **105 wystąpień w 105 kartach**. Świadomie nie ruszaliśmy
konstrukcji z dopełniaczem, bo tam forma jest poprawna i nie wolno jej zmieniać:

- „składa się ze 133 elementów" ✔
- „za pomocą zaledwie 72 elementów" ✔
- „wśród 243 elementów" ✔

**Do zrobienia u Ciebie:** w generatorze wystarczy jedna reguła odmiany zależna od
tego, czy fraza stoi po czasowniku (biernik → „elementy"), czy po przyimku
(dopełniacz → „elementów").

## 2. „Punktem wyjścia dla … **jest** …" – zły przypadek

Szablon wstawia po „jest" biernik zamiast mianownika. Fraza występuje w 51 kartach,
w **25 jest niepoprawna**:

| numer | jest w karcie | powinno być |
|---|---|---|
| 10431 | jest zabawę rodzeństwa | jest zabawa rodzeństwa |
| 10473 | jest prostą akcję gaszenia pożaru | jest prosta akcja gaszenia pożaru |
| 30645 | jest wesołego bałwana z miotłą | jest wesoły bałwan z miotłą |
| 30692 | jest Świętego Mikołaja wchodzącego przez komin | jest Święty Mikołaj wchodzący przez komin |
| 30701 | jest kompozycję polnych roślin | jest kompozycja polnych roślin |
| 31136 | jest barwną papugę siedzącą na gałęzi | jest barwna papuga siedząca na gałęzi |
| 31159 | jest ruchomego pająka | jest ruchomy pająk |
| 40721 | jest nawiedzoną stodołę | jest nawiedzona stodoła |
| 40725 | jest parę kwitnących gałązek wiśni | jest para kwitnących gałązek wiśni |
| 40816 | jest przestrzenną pisankę | jest przestrzenna pisanka |
| 40861 | jest bohaterów filmu Potwory i spółka | są bohaterowie filmu Potwory i spółka |
| 40885 | jest kaczą rodzinę spacerującą wśród roślin | jest kacza rodzina spacerująca wśród roślin |
| 41712 | jest zbiórkę i sortowanie odpadów | jest zbiórka i sortowanie odpadów |
| 41725 | jest wycieczkę łazikiem po plaży | jest wycieczka łazikiem po plaży |
| 42219 | jest wyścigową wersję Grave Diggera | jest wyścigowa wersja Grave Diggera |
| 42665 | jest trening i zabawę trzech szczeniąt | są trening i zabawa trzech szczeniąt |
| 42666 | jest urodzinową zabawę kotów | jest urodzinowa zabawa kotów |
| 43016 | jest karierę Cristiano Ronaldo | jest kariera Cristiano Ronaldo |
| 71780 | jest wyścigową misję Kaia | jest wyścigowa misja Kaia |
| 71810 | jest obronę smoczątka Riyu | jest obrona smoczątka Riyu |
| 71854 | jest wspólną walkę Cole'a i Zane'a | jest wspólna walka Cole'a i Zane'a |
| 71869 | jest wyprawę ninja w mobilnej bazie | jest wyprawa ninja w mobilnej bazie |
| 76474 | jest mandragorę | jest mandragora |
| 76901 | jest współczesną Toyotę GR Supra | jest współczesna Toyota GR Supra |
| 77244 | jest Mercedesa W15 z sezonu 2024 | jest Mercedes W15 z sezonu 2024 |

W pozostałych 26 kartach ta sama fraza wychodzi poprawnie („jest baśniowa
przejażdżka", „jest strój gospodarza mundialu") – czyli generator raz odmienia
dobrze, raz źle. Dlatego nie poprawialiśmy tego automatycznie u siebie: regułą
tekstową nie da się odróżnić jednych od drugich bez analizy przypadka, a ryzyko
zepsucia poprawnych zdań jest realne.

**Najprostsze obejście w generatorze**, jeśli nie chcesz odmieniać: zmienić ramę na
taką, która rządzi biernikiem, i wtedy wszystkie warianty są poprawne bez zmiany
rzeczownika:

> „**Za punkt wyjścia dla** LEGO Creator 40885 Rodzina kaczek **przyjęto** kaczą
> rodzinę spacerującą wśród roślin."

## 3. „W centrum konstrukcji **znajduje się** …" – liczba i przypadek

Fraza występuje w **254 kartach** i w każdej z nich po niej stoi wyliczenie mnogie,
więc orzeczenie powinno być w liczbie mnogiej. Do tego sama lista bywa w bierniku:

- jest: „W centrum konstrukcji znajduje się dwie odmienne rośliny, żółtą i
  niebieską osłonkę oraz…"
- powinno być: „W centrum konstrukcji **znajdują się** dwie odmienne rośliny,
  **żółta i niebieska osłonka** oraz…"

Tu też prościej zmienić ramę niż odmieniać całą listę – wtedy biernik, który
generator już wstawia, staje się poprawny:

> „W centrum konstrukcji **znajdziemy** dwie odmienne rośliny, żółtą i niebieską
> osłonkę oraz…"

Ta jedna podmiana załatwia wszystkie 254 karty bez ruszania rzeczowników.

## 4. Karta 40885 – nowa wersja jest krokiem wstecz

W ostatniej paczce przysłałeś ponownie 61 kart. 60 z nich było identycznych co do
znaku z tym, co już mamy – tu nie ma sprawy.

Wyjątkiem jest **40885 Rodzina kaczek**. Nowa wersja ma lepszą metrykę (dokładna
data premiery „1 marca 2026" zamiast samego rocznika, doszło pole Status) – ale
gorszy opis: poprzednia wersja miała poprawne zdanie otwierające („Mama kaczka i
trzy kaczątka tworzą spokojną, wiosenną kompozycję…"), nowa ma szablonowe „jest
kaczą rodzinę spacerującą". Zostawiliśmy nowszą w całości, zgodnie z zasadą, że
Twój tekst jest nadrzędny – ale sygnalizuję, bo to jedyny przypadek, w którym
ponowne przysłanie karty pogorszyło treść.

## 5. Wiek – 24 rozbieżności między kartą a Bricksetem

Na podstronie zestawu wiek pojawia się dwa razy: w linii nagłówkowej (z naszych
danych, źródło Brickset) i w metryce karty. W 24 zestawach te dwie wartości się nie
zgadzają i czytelnik widzi sprzeczność na jednej stronie. W większości to różnica
o rok, ale dwa przypadki są duże i wyglądają na pomyłkę w karcie:

- **71866** – karta 14+, Brickset 8+
- **40958** – karta 9+, Brickset 12+

Pozostałe: 42235, 40873, 77982, 76348, 76347, 76156, 43246, 42212, 76292, 60360,
60355, 76334, 40867, 76337, 76335, 30734, 40901 oraz zestawy DUPLO 10913, 10914,
10983, 10479 (tam chodzi tylko o zapis „1½+" / „1,5+" / „1+").

Powiedz proszę, które źródło ma wygrywać przy konflikcie – ustawimy to raz i
przestanie wracać.

## 6. Zostało do opisania – 7 zestawów

To wszystko, czego jeszcze nie mamy. Wszystkie z rocznika 2026:

| numer | nazwa | seria | elementy | cena kat. |
|---|---|---|---|---|
| 31380 | Konsola do gry retro | Creator | 268 | 81,99 zł |
| 21585 | Farma kurczaków | Minecraft | 233 | 81,99 zł |
| 21586 | Blady ogród | Minecraft | 243 | 81,99 zł |
| 21584 | Podróż przez portal Netheru | Minecraft | 192 | 61,99 zł |
| 31376 | Uroczy chomik z kwiatkiem | Creator | 166 | 41,99 zł |
| 31377 | Żółw i kwiat lilii wodnej | Creator | 124 | 41,99 zł |
| 21583 | Przygoda Steve'a w Tajdze | Minecraft | 79 | 41,99 zł |

Poza tym mamy jeszcze **74 zestawy z naszym opisem, ale bez Twojej karty** – te nie
blokują publikacji, więc traktujemy je jako niski priorytet. Listę wyślę, gdyby
przydała się do planowania.

Pozdrawiam,
Marek
