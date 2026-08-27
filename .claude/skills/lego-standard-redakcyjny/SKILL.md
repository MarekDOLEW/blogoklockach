---
name: lego-standard-redakcyjny
description: >-
  Obowiązujący standard redakcyjny i metodologia researchu dla WSZYSTKICH tekstów
  z działu Artykuły serwisu tylkoklocki.pl — siedem kategorii: Premiery, Recenzje,
  Rankingi, Porównania, Poradniki, Kalendarze, Historyczne. Używaj przy: recenzja
  zestawu, artykuł o nowej fali premierowej, ranking, porównanie zestawów, poradnik
  zakupowy, kalendarz promocji, tekst historyczny o wycofanej serii. Triggeruj przy
  frazach "napisz artykuł o zestawie", "recenzja seta", "ranking zestawów",
  "porównaj zestawy", "poradnik zakupowy LEGO", "artykuł o nowej fali",
  "tekst na bloga klockowego" — nawet bez słowa "standard". NIE używaj do
  prezentowników ani krótkich form dealowych — tam obowiązuje skill
  lego-standard-sprzedazowy. Skill narzuca kolejność: research → karta researchu →
  bramka rozbieżności → dopiero tekst, oraz reguły stylu, cen, afiliacji
  i hierarchii źródeł.
---

# Standard redakcyjny — dział Artykuły

> **Ten plik jest generowany.** Źródłem są dokumenty w repo `blogoklockach`:
> `redakcja/`. Nie edytuj skilla na claude.ai — poprawka przepadnie przy
> następnym eksporcie. Zmieniasz dokument w repo i uruchamiasz
> `node scripts/eksport-skilli.mjs`.
>
> Rola tego skilla: teksty do `/artykuly/`, pisane w oparciu o pełny research.

## Zanim zaczniesz pisać

1. **Ustal kategorię.** To ona decyduje o strukturze tekstu i o tym, gdzie tekst
   trafi w serwisie. Kategoria musi być jedną z siedmiu:

| Kategoria | Zakres |
|---|---|
| Premiery | Nowe zestawy i całe fale premierowe — co wchodzi do sprzedaży i czy warto. |
| Recenzje | Pojedynczy zestaw od środka: budowanie, gotowy model, próg zakupu. |
| Rankingi | Zestawienia od najlepszego — w obrębie serii, budżetu albo tematu. |
| Porównania | Dwa lub kilka zestawów obok siebie: który dla kogo. |
| Poradniki | Jak kupować, na co uważać, jak czytać ceny i promocje. |
| Kalendarze | Terminy: okna promocyjne, premiery, wycofania. |
| Historyczne | Archiwalne serie i zestawy — co się zmieniło i ile są dziś warte. |

   Jeśli tekst nie mieści się w żadnej — to znak, że albo jest prezentownikiem
   (patrz skill `lego-standard-sprzedazowy`), albo brief wymaga doprecyzowania.
   **Nie tworzymy kategorii pod pojedynczy artykuł.**

2. **Nazwij tekst od kategorii.** „Recenzja LEGO 71858…", „Ranking zestawów
   Technic do 300 zł", „Porównanie 60506 i 60511". Po nazwie ma być widać, gdzie
   tekst trafia.

3. **Research przed tekstem.** Kolejność jest nienaruszalna: research → karta
   researchu → bramka rozbieżności → dopiero pisanie. Szczegóły w
   `references/metodologia-researchu.md`.

4. **Przeczytaj ustalenia projektowe** (`references/ustalenia-projektowe.md`)
   — tam jest to, czego nie ma w standardzie: kto wstawia ceny i linki, skąd
   bierze się cena katalogowa, czego serwer nie potrafi sprawdzić.

## Reguła, o którą najłatwiej się potknąć

**Nie wpisujesz do tekstu żadnej ceny sklepowej.** Podajesz wyłącznie ceny będące
oceną: cenę katalogową, dobrą cenę, bardzo dobrą cenę i próg zakupu. Kwoty
sklepowe wstawia redakcja techniczna przy publikacji, znacznikiem, który renderuje
się przy każdym budowaniu serwisu. W miejscu linków zostawiasz
`[wstaw link afiliacyjny]`.

Powód jest prosty: artykuł zostaje na stronie latami, a cena zmienia się
codziennie. Ręcznie wpisana kwota z datą starzeje się w tydzień.

## Dokumenty

| Plik | Co zawiera |
|---|---|
| `references/standard-artykulow.md` | pełny standard redakcyjny (wersja 1.5) |
| `references/metodologia-researchu.md` | hierarchia źródeł, mapa recenzji, karta researchu (wersja 1.7) |
| `references/ustalenia-projektowe.md` | warstwa tylkoklocki.pl — ceny, linki, kategorie, ograniczenia |
| `references/sklepy-i-afiliacja.md` | rejestr sklepów, wybór sklepów publikacyjnych |
| `references/wzorzec-recenzja.md` | gotowy szkielet recenzji zestawu |

Czytaj je na żądanie — nie wciągaj wszystkich naraz. Do recenzji potrzebujesz
standardu, metodologii i wzorca recenzji; do rankingu — standardu §23 i §26.
