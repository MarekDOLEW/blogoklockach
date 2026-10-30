# Wzorzec: „Zestawy pod lupą” (dział /deale/)

Brief Coworka z 30.10.2026 (`_SZABLON-I-ZASADY.md` z paczki `zestawy-pod-lupa.zip`),
zachowany verbatim poniżej. Tak wygląda plik, który Cowork oddaje; wgrywa go
`node scripts/import-pod-lupa.mjs <katalog>` (frontmatter przepisuje na pola layoutu,
H1 → `title`, sekcję „Do weryfikacji” odkłada do `materialy/zestawy-pod-lupa-weryfikacja-<data>.md`).
Znaczniki `[moduł ceny: …]` i `[tabela: …]` obsługuje `scripts/remark-pod-lupa.mjs`,
statusy ceny liczy `src/lib/pod-lupa.js` (opis reguł w `redakcja/ustalenia-projektowe.md`).

---

# Brief: przeróbka tekstów „Zestawy pod lupą” (tylkoklocki.pl)

Przerabiasz istniejące teksty z działu /deale/ (dawne „Okazje pod lupą”) na nowy format. **URL zostaje ten sam.** Każdy tekst zapisujesz jako osobny plik `/home/claude/zestawy-pod-lupa/<slug>.md` (slug = ostatni człon obecnego URL, np. `deal-10330-mclaren-mp44-minimum`).

## Idea formatu
Stary deal miał cenę i „historyczne minimum” wpisane ręcznie w tytuł, lead i treść — po kilku dniach kłamał. Nowy tekst opisuje, **dlaczego warto mieć zestaw**. Wszystkie ceny sklepowe, „dziś”, „najniższa w notowaniach”, rabaty od dzisiejszej ceny generuje automat (moduł ceny i tabela). Tekst żyje miesiącami.

## Twarde zasady (standard sprzedażowy serwisu + standard redakcyjny)
- Język polski. Akapity maksymalnie 3 zdania, zdania krótkie, konkretne.
- **NIGDY** nie wpisuj cen sklepowych, nazwy najtańszego sklepu, słów „dziś kosztuje”, „najniższa cena w notowaniach”, „historyczne minimum”, procentu rabatu od bieżącej ceny, dat kontroli cen, kodów rabatowych. Wolno: cenę katalogową (RRP), progi z drabiny, cenę za element przy cenie katalogowej, ogólnik typu „w ostatniej fali promocji zestaw stał 20–25% pod ceną katalogową”.
- Tytuł (H1), tytuł SEO i hak: bez kwot, bez „minimum”, bez dat.
- Nigdy słowo „cegły” — tylko klocki, elementy, części.
- Bez: „ikona”, „legendarny”, „kultowy”, „must have”, „idealny”, „obowiązkowy zakup” (chyba że z uzasadnieniem — lepiej wcale).
- Bez sztucznej presji („ostatnia szansa”, „spiesz się”). Wycofanie podajesz jako fakt, spokojnie.
- **Bez prognoz cen i języka inwestycyjnego** („zarobisz”, „wzrośnie”, „dobra inwestycja”, „drożeją po wycofaniu”). Zamiast tego sekcja „Potencjał kolekcjonerski: niski/umiarkowany/wysoki” z 2–4 argumentami za, min. 1 przeciw i zdaniem o pewności oceny („Nie prognozujemy, ile zestaw będzie kosztował po wycofaniu.”). Dawaj ją tylko, gdy ma sens.
- **Fakty tylko ze źródeł**: karta zestawu `https://tylkoklocki.pl/zestaw/<nr>/` (WebFetch) i obecny tekst dealu `https://tylkoklocki.pl/deale/<slug>/`. Niczego nie dopowiadaj z pamięci (nazwy figurek, wymiary, funkcje). Jeśli czegoś nie jesteś pewien — pomiń i dopisz do sekcji „Do weryfikacji” na końcu pliku.
- Jedna persona główna (AFOL albo RODZIC); druga dostaje jeden akapit w „Dla kogo”.
- Wymyślone „unikaty”: tylko gdy źródło tak mówi („nie występuje w żadnym innym zestawie”).

## Struktura pliku

```
---
url: /deale/<slug>/
set: <numer>
typ: pod-lupa
persona: AFOL | RODZIC
powody: [figurki, kolekcja, flagowiec, wycofanie, licencja, potencjal, funkcja, sezon]  # 1–3 realne
cena_katalogowa: <RRP>
cena_dobra: <podane w zleceniu>
cena_bardzo_dobra: <podane w zleceniu>
prog_zakupu: <podane w zleceniu>
tytul_seo: "<do ~60 znaków, bez ceny>"
hak: "<1 zdanie na kafelek, bez ceny>"
meta_description: "<hak>. Cena katalogowa <RRP> zł, porównanie cen w sklepach."
---

# <H1: numer, nazwa i powód>

[moduł ceny: cena-pod-lupa, set <nr>]

<Lead 2–3 zdania: co to jest, dlaczego warto mieć.>

## <śródtytuł na powód 1>
## <śródtytuł na powód 2 itd.>
## Co jest w środku   (opcjonalnie, gdy źródło daje konkrety)
## Na co uważać       (min. 1 realne ograniczenie)
## Przy jakiej cenie brać
| Poziom | Cena |
| --- | --- |
| Cena katalogowa LEGO | X zł |
| Dobra cena | poniżej Y zł |
| Bardzo dobra cena | poniżej Z zł |
| **Próg zakupu** | **P zł** |
<2–3 zdania uzasadnienia progu, bez bieżących cen sklepów.>
[tabela: ceny-setu, set <nr>]
## Dla kogo
## Potencjał kolekcjonerski: <poziom>   (gdy w powodach)
## Werdykt: 🧱🧱🧱🧱 (4/5)
<1–2 zdania, przy jakiej cenie brać.>

---
## Do weryfikacji (wewnętrzne, nie publikować)
- ...
```

Format liczb: przecinek dziesiętny, „zł” ze spacją (779,99 zł).

## Wzór (gotowy, zaakceptowany kierunek) — LEGO 75389

Tytuł SEO: LEGO 75389 Mroczny Sokół Millennium – figurki z odwróconej galaktyki
Hak: Sokół po ciemnej stronie i sześć figurek z serialu Rebuild the Galaxy

# LEGO 75389 Mroczny Sokół Millennium: Darth Jar Jar i pięć innych figurek z odwróconej galaktyki

[moduł ceny: cena-pod-lupa, set 75389]

LEGO Star Wars 75389 Mroczny Sokół Millennium to czarno-czerwona wersja najsłynniejszego frachtowca sagi, wzięta z animowanego serialu *Rebuild the Galaxy*. Ma 1579 elementów i około 43 cm długości. Kupuje się go jednak przede wszystkim dla obsady: sześciu bohaterów odwróconych na drugą stronę Mocy.

## Figurki, których w tym składzie nie ma nigdzie indziej
W pudełku są Darth Jar Jar, łowca nagród C-3PO, Darth Dev, Darth Rey, plażowy Luke i Jedi Vader. To warianty znanych postaci z alternatywnej rzeczywistości serialu, więc nie da się ich odtworzyć, przemalowując zwykłe figurki. Komplet sześciu postaci w tej konfiguracji nie powtarza się w żadnym innym zestawie.

Dla kolekcjonera minifigurek to główny argument. Statek jest tu oprawą, a obsada jest powodem zakupu.

## Znika z oferty w grudniu 2026
LEGO potwierdziło wycofanie zestawu w grudniu 2026. Po wyczerpaniu zapasów w sklepach zostaje już tylko rynek wtórny, na którym kupuje się od osób prywatnych, bez gwarancji nowego, zapieczętowanego pudełka.

Nie musisz kupować w panice. Do końca roku przejdzie jeszcze fala listopadowych promocji, a moduł ceny na górze pokazuje, czy dzisiejsza oferta mieści się w progu.

## Co jest w środku
Górne panele kadłuba odchylają się osobno, więc do wnętrza dostajesz się bez zdejmowania całej góry. W środku jest sala tronowa Dartha Jar Jara, stanowisko dowodzenia, hipernapęd, cela i kwatery. Na zewnątrz są sprężynowe działka, obrotowe wieżyczki, zdejmowane stanowisko strzelca i ruchoma antena.

## Na co uważać
To świadoma wariacja, nie zamiennik klasycznego, szarego Sokoła z filmów. Kto zbiera wersje kanoniczne, kupuje tu ciekawostkę, a nie kolejny etap kolekcji.

Czarne elementy zlewają się przy słabym świetle, zarówno w trakcie budowy, jak i na półce. Wnętrze warto oświetlić, jeśli model ma stać na ekspozycji.

## Przy jakiej cenie brać
| Poziom | Cena |
| --- | --- |
| Cena katalogowa LEGO | 779,99 zł |
| Dobra cena | poniżej 620 zł |
| Bardzo dobra cena | poniżej 590 zł |
| **Próg zakupu** | **620 zł** |

W ostatniej fali promocji zestaw regularnie stał 20–25% pod ceną katalogową w dużych sklepach. Powyżej 620 zł płacisz więcej, niż płacili kupujący w zwykłym tygodniu promocji. Przy cenie katalogowej za element wychodzi 0,49 zł, czyli tyle, ile wynosi mediana Star Wars z rocznika 2024.

[tabela: ceny-setu, set 75389]

## Dla kogo
Dla dorosłego fana Star Wars, który ma już klasycznego Sokoła i chce wersji, jakiej nikt inny nie ma na półce. Dla kolekcjonera minifigurek to jeden z ciekawszych składów ostatnich lat.

Rodzic też może kupić go śmiało dziecku od 10 lat: otwierane wnętrze i sześć wyrazistych postaci dają gotowe scenariusze zabawy. Znajomość serialu pomaga, ale nie jest konieczna. Przy 1579 elementach budowa zajmie kilka sesji.

## Potencjał kolekcjonerski: umiarkowany
Za: komplet figurek w tej konfiguracji nie powtarza się w innych pudełkach, wycofanie jest potwierdzone, a zestaw jest dobrze oceniany przez kupujących (4,3/5 przy 247 głosach na Bricksecie).

Przeciw: to szeroko sprzedawany zestaw, który ma już ponad 9 tysięcy zgłoszonych egzemplarzy w kolekcjach na Bricksecie, więc rzadkością nie będzie. Popyt zależy też od fanów niszowego serialu animowanego, a nie całej sagi.

Pewność oceny: niska. Nie prognozujemy, ile zestaw będzie kosztował po wycofaniu.

## Werdykt: 🧱🧱🧱🧱 (4/5)
Dla fana minifigurek i nietypowych wersji Sokoła to dobry zakup, jeśli cena jest poniżej 620 zł. Kolekcjonerzy klasycznych modeli mogą go pominąć bez żalu.
