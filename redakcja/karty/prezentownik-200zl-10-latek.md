# Karta researchu — prezentownik „LEGO za ok. 200 zł dla 10-latka"

- **Artykuł:** `/prezentowniki/lego-za-200-zl-dla-10-latka/` (25.08.2026, Prezentownik)
- **Źródło researchu:** materiał wspólnika (Piotr), plik `Wzorzec_artyku_u_dla_poradnika_zakupowego__Jakie_LEGO_za_oko_o_200_z__kupic__10.docx`
- **Data kontroli cen:** 25.08.2026 (feedy `oferty_feed.json`)

## Pytanie rankingu
Co kupić dziesięciolatkowi za realne 150–200 zł, gdy o jego zainteresowaniach wiemy mało albo nic.

## Kryterium doboru
Sposób zabawy (budowanie / mechanika / motoryzacja / role-play / licencja), a nie liczba elementów ani wielkość pudełka. Budżet liczony od **ceny rynkowej**, nie od RRP.

## Szóstka i uzasadnienia
| Nr | Rola | Zależność od licencji |
|---|---|---|
| 31161 | wybór domyślny — brak licencji, trzy modele, budowanie jako wartość | brak |
| 42213 | mechanika, funkcje obserwowalne po zbudowaniu | niska |
| 77264 | dwa konstrukcyjnie różne auta | niska–umiarkowana |
| 42686 | najwyższa bawialność, role-play | bardzo niska |
| 76321 | gotowy scenariusz akcji | wysoka |
| 21277 | licencja naturalnie zrośnięta z budowaniem | wysoka |

Rekomendacja główna: **31161** — wymaga najmniejszej liczby założeń o dziecku.

## Ceny — zaplecze (nie do artykułu)
Feed 25.08 (najniższe): 31161 169,99 · 42213 186,99 · 77264 168,99 · 42686 173,15 · 76321 174,99 · 21277 166 zł.
Progi w artykule (185–190 / 180 / 175 zł) ustawione powyżej chwilowych minimów, żeby drabina pozostała trwała.

## Sklepy publikacyjne
Media Expert, Empik, Smyk — kategoria prezentowa, wiarygodność i przewidywalna dostawa (przy prezencie termin ma znaczenie). Wybór za materiałem wspólnika.

## Alternatywy poza szóstką
42212 (fan Ferrari), 60497 (zabawa samochodami), 60506 (nieco ponad budżetem, ok. 210 zł), 75451 (fan Star Wars — nie w ciemno).

## Rozbieżności
**Ceny katalogowe — rozstrzygnięte na korzyść materiału Piotra (25.08.2026).**

Początkowo przyjąłem wartości z `katalog.json` (259,99 / 259,99 / 219,99) — **błędnie**.
Kontrola Marka na lego.pl pokazała 249,99 zł dla 31161, a niezależna weryfikacja
potwierdziła to dla całej trójki:

| Zestaw | Brickset (EUR) | PL wg drabiny | materiał Piotra | `katalog.json` (przed) |
|---|---|---|---|---|
| 31161 | 59,99 € | **249,99 zł** | 249,99 zł ✓ | 259,99 zł ✗ |
| 42686 | 59,99 € | **249,99 zł** | 249,99 zł ✓ | 259,99 zł ✗ |
| 76321 | 49,99 € | **209,99 zł** | 209,99 zł ✓ | 219,99 zł ✗ |

Drabina wyliczona z 270 zweryfikowanych setów w `ceny_baza.json`:
59,99 € → 249,99 zł (11512, 21595, 75642), 49,99 € → 209,99 zł (10331, 21591, 11211).
Kwota 259,99 zł nie występuje w zweryfikowanych danych ani razu — nie jest polskim
punktem cennika, tylko efektem przeliczenia euro kursem.

`katalog.json` poprawiony (22 wpisy w całym pliku), dodana kontrola
`scripts/kontrola-rrp.mjs`. Artykuł podaje wartości Piotra.
