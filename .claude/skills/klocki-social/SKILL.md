---
name: klocki-social
description: "Agent \"Social\" serwisu afiliacyjnego o klockach LEGO. Używaj ZAWSZE, gdy użytkownik prosi o - posty na TikTok / Instagram / Facebook o klockach, paczkę social media, scenariusze rolek o LEGO, karuzele IG, content plan social, posty dealowe na social, \"co publikować w tym tygodniu na TT/IG/FB\". Skill tworzy content faceless (bez pokazywania twarzy i występów publicznych) nastawiony na ruch do serwisu i konwersję afiliacyjną."
---

# Social — faceless, dealowo, do celu

## Ograniczenie fundamentalne
Właściciele NIE pokazują twarzy i NIE występują publicznie. Cały content jest faceless: ręce + klocki, zrzuty ekranu cen, grafiki, tekst na ekranie, lektor AI lub napisy. Zero YouTube.

## Rola każdej platformy
**TikTok** (silnik zasięgu — priorytet #1 na start, bo nowa domena nie ma SEO):
- Format 1: "Deal alert" (15–25 s) — zrzut ceny, porównanie sklepów, tekst na ekranie "LEGO [set] za X zł, normalnie Y", link w bio/komentarzu. Produkcja: 10 min.
- Format 2: "Ile NAPRAWDĘ kosztuje klocek" — edukacyjne porównania cena/klocek między setami (unikatowa nisza, buduje autorytet)
- Format 3: Timelapse budowy z kolekcji 1000+ setów (ręce + klocki) z ceną i werdyktem na końcu
- Format 4: "Pseudopromocje — nie daj się nabrać" (demaskowanie zawyżonych przecen — viralowy potencjał, buduje zaufanie)
- Częstotliwość: 1–2 dziennie w X–XII, 4–5/tydz. wcześniej. Trendy audio sprawdzać przy publikacji.

**Instagram** (witryna marki): rolki = reposty TT; karuzele "TOP 5 okazji tygodnia" (szablon graficzny stały — rozpoznawalność); Stories z naklejką link do dealów dnia — Stories to nasz najszybszy kanał konwersji.

**Facebook** (konwersja u rodziców 30–45): posty dealowe z linkiem bezpośrednim, obecność w grupach ("LEGO okazje", grupy parentingowe — dawać wartość, nie spamować), własna grupa "Łowcy Klocków — okazje LEGO" jako aktyw długoterminowy (grupa = zasięg organiczny, którego algorytm nie dusi tak jak fanpage).

## Paczka tygodniowa (wyjście domyślne)
Na prośbę "paczka social na tydzień" wygeneruj:
1. 7–10 scenariuszy TikTok (hook w pierwszej sekundzie, tekst na ekranie, opis, hashtagi PL: #lego #legopolska #promocje #okazje #klocki + serie)
2. 3 karuzele IG (treść slajd po slajdzie — wg **Zasad dobrej karuzeli** poniżej)
3. 5 postów FB (gotowy tekst + do którego artykułu linkują)
4. Kalendarz publikacji z godzinami (TT: 7:00/12:30/19:00; FB: 20:00–21:00 — rodzice po położeniu dzieci)

## Zasady dobrej karuzeli (checklista przy każdej karuzeli IG)

1. **Ostatni slajd piszesz pierwszy.** Ostatni slajd to zawsze JEDNO działanie: „pełna lista + linki → link w bio" albo „dołącz do grupy Łowcy Klocków". Dopiero potem hook i środek — wszystko ma prowadzić do tego slajdu.
2. **Hook stawia tezę, nie zapowiada tematu.** ❌ „TOP 5 okazji tygodnia" (spis treści — nikt nie przewija dalej) → ✅ „Ten zestaw za 3 tygodnie będzie droższy o 120 zł — dziś jest w dnie" albo „Empik ma go najtaniej w Polsce, ale tylko do niedzieli". Teza z liczbą, którą da się sprawdzić.
3. **Jedna myśl na slajd.** Jeden deal = jeden slajd: zdjęcie setu, cena teraz, cena „normalnie", sklep, do kiedy. Nic więcej. Pięć dealów = pięć slajdów, nie tabela na jednym.
4. **Konkret, nie ogólnik.** ❌ „Świetna promocja na LEGO City" → ✅ „LEGO City 60367 — 189 zł w Empiku (było 249 zł, −24 %), najniższa cena od marca". Test: czy rodzic może jutro rano kupić to, mając tylko ten slajd i telefon?
5. **Layout robisz na końcu.** Najpierw dane (ceny zweryfikowane przez łowcę), potem copy, na końcu szablon. Szablon jest STAŁY (rozpoznawalność feedu) — nie projektujemy każdej karuzeli od nowa.
6. **Każdy slajd czyta się bez poprzedniego** — slajdy z dealami są udostępniane pojedynczo w Stories/grupach; każdy ma logo serwisu, cenę i sklep.
7. **Oznaczenie**: slajd 1 lub ostatni z #materiałpartnerski / „linki afiliacyjne" (UOKiK) — nie chowamy tego w podpisie.

**Parametry techniczne:** 1080×1350 px (4:5), max 30–40 słów na slajd, cena jako największy element po zdjęciu setu, kontrast ≥ 4,5:1, marginesy ≥ 80 px. Grafiki generujemy z szablonu HTML/CSS → PNG (Playwright) z polami `set`, `cena`, `cena_stara`, `rabat`, `sklep`, `do_kiedy` — tekst NIGDY z modelu obrazkowego (polskie znaki, ceny muszą być bezbłędne). Ceny na grafikach = z dnia publikacji; deal starszy niż 24 h ponownie weryfikujemy.

## Zasady
- Każdy content ma JEDNO zadanie: klik do serwisu albo zapis do grupy/newslettera. Bez wyjątków — nie robimy zasięgu dla zasięgu.
- Deale gorące publikujemy w ciągu 2 h od wykrycia przez łowcę — szybkość to przewaga.
- Oznaczanie treści reklamowych zgodnie z wytycznymi UOKiK (#materiałpartnerski przy linkach afiliacyjnych).
- Materiały wideo/zdjęcia setów: własna kolekcja + panel partnerski LEGO. Nie używamy cudzych nagrań.

## Rolki wideo — format produkcyjny (od 14.10.2026)

Rolki 9:16 **składamy z kodu**, nie w edytorze: szablon HTML + GSAP renderuje
HyperFrames do MP4 (1080×1920, 30 kl/s). Ten sam stos co karuzele (HTML → PNG),
więc polskie znaki i ceny są bezbłędne, a plik jest deterministyczny. Opis
i wymagania: `materialy/rolki/README.md`; decyzja: `DZIENNIK.md` z 14.10.2026.

**Format 1 „Deal alert" ma gotowy generator** — w sesji Claude Code:

    node scripts/rolka-deal.mjs <nr> [--hook1 "…" --hook2 "…"] [--sklepy 5] [--muzyka "…"|synt] [--wstep spokojny|dynamiczny]

Skrypt sam bierze dane z repo (`ceny_baza.json`, `oferty_feed.json`, `sety.json`),
wycina pudełko z tła, dokłada podkład i efekty, uruchamia kontrolę strefy
bezpiecznej i renderuje. MP4 ląduje w `materialy/rolki/wyjscie/<nr>/renders/`.
Cowork nie renderuje — zleca rolkę do Code (numer zestawu + hook), a potem
publikuje gotowy plik.

Struktura 12 s (retencja: hook → otwarta pętla → payoff → CTA, pattern
interrupt co 2–4 s żółtym przejściem):

1. **Hook 0–3,7 s, jasne tło** — teza z liczbą widoczna od pierwszej klatki
   (bez wjazdu z czerni), zdjęcie pudełka z punch-inem, plakietka serii.
   `--hook1` to nazwa/bohater (≤ 22 znaki), `--hook2` to teza (domyślnie
   „na dnie cenowym", gdy cena dziś = minimum w naszej bazie; inaczej
   „taniej o X zł"). Zasada jak w karuzeli: teza, którą da się sprawdzić, nie
   zapowiedź tematu.
2. **Cena 3,7–7,7 s, granat** — cena katalogowa przekreślana czerwoną kreską,
   potem odliczanie do ceny dziś, konfetti, plakietka „−X%", żółty chip
   „najniższa cena w naszej bazie" z datą. Procent i oszczędność liczy szablon
   z dwóch liczb — nigdy nie wpisujemy ich ręcznie.
3. **Sklepy 7,7–10,7 s, jasne tło** — do pięciu sklepów od najtańszego
   (Ceneo nie jest sklepem i nie wchodzi; Allegro tak),
   słupek dłuższy = drożej, najtańsze na żółto. Tylko oferty z feedu nie
   starsze niż 7 dni; gdy wszystkie są starsze, skrypt odmawia (nie publikujemy
   rolki ze starą ceną).
4. **CTA 10,7–12 s, granat** — logo, „Linki do sklepów w bio", oznaczenie
   `#materiałpartnerski · linki afiliacyjne` na ekranie (UOKiK), nie w opisie.

Dźwięk: podkład syntezowany w skrypcie (żeby rolka nigdy nie wyszła niema)
albo utwór z katalogu HeyGen, gdy w środowisku jest `HEYGEN_API_KEY`; efekty
(whoosh, pop, bas, sparkle) z biblioteki na licencji Pixabay. Trend audio
z TikToka dokładamy przy publikacji w aplikacji, nie w pliku — rolka ma
własny dźwięk, ale nie blokuje podmiany.

Checklista przed publikacją: cena na ekranie = cena w hubie `/zestaw/<nr>/`
dziś; hook czyta się bez dźwięku; nic ważnego poza strefą bezpieczną
(skrypt to sprawdza, ale obejrzyj pierwszą i ostatnią klatkę); opis posta
powtarza cenę, sklep i „link w bio".
