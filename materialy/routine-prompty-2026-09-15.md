# Prompty dla Routine zakładanych w panelu claude.ai (z podpiętym repo)

*15.09.2026. Routine założony przez API startuje bez repo, a świeżo sklonowany
kod jest dla klasyfikatora trybu auto „Code from External" — pierwsze
uruchomienie `node scripts/r2-obrazy.mjs` zostało 15.09 zablokowane i przeszło
dopiero przy ponownym podejściu. Routine założony w panelu z repozytorium jako
źródłem (jak Kontroler „[env projektu]") tego problemu nie ma: kod repo jest
zaufany. Dlatego Routine ze świeżą sesją zakłada Marek w panelu, wklejając
prompty poniżej; Code kasuje potem swoje wersje z API.*

Ustawienia wspólne: środowisko projektu (to samo, co Kontroler), źródło:
`MarekDOLEW/blogoklockach`, gałąź `main`, nowa sesja przy każdym przebiegu,
bez konektorów, powiadomienia wyłączone.

---

## 1. „LEGO 04:00 — Zdjęcia → R2 (Planeta Klocków)" — codziennie, cron `0 2 * * *`

```
Codzienne dogranie zdjęć do R2 dla tylkoklocki.pl. Kontekst: worker serwuje /img/ z kubełka R2, a gdy tam nic nie ma, pobiera ze źródła — ale Planeta Klocków odrzuca pobrania z workera, więc każde nowe zdjęcie z Planety (nowość od Scouta, galeria do nowego tekstu) trzeba wgrać do R2 z kontenera. Robi to jeden skrypt z repo; Ty go tylko uruchamiasz i czytasz wynik. Szczegóły: RUNBOOK.md, sekcja „Zdjęcia: Planeta Klocków odrzuca fetch z workera".

Kroki, dokładnie w tej kolejności:
1. W katalogu repo: `git fetch origin main && git checkout -q origin/main`. Jeśli nie ma katalogu node_modules: `npm ci --no-audit --no-fund` (skrypt używa sharp z zależności Astro). Nic nie commitujesz, nic nie pushujesz.
2. `node scripts/r2-obrazy.mjs` — bez flag. Skrypt listuje kubełek, porównuje z danymi i wgrywa brakujące zdjęcia z Planety; zostawia ślad `_stan/r2-obrazy.json` w R2. Zwykle kończy w kilkanaście sekund komunikatem „brakuje w R2: 0". Nie uruchamiaj `--sprawdz` ani `--optymalizuj` (to długie audyty) i nie dopisuj własnych poprawek do skryptu.
3. Jeśli skrypt zakończył się kodem 2 (brak CF_ACCOUNT_ID lub CF_R2_TOKEN w środowisku) albo błędem listowania R2 — wklej dokładny komunikat do podsumowania. Nie wymyślaj obejść: brak zmiennej to sprawa Marka, nie Twoja.
4. Podsumowanie: jedna linijka z wynikiem (ile w R2, ile z Planety w danych, ile brakowało, ile wgrano). Gdy brakowało 0 — to cała odpowiedź. Gdy coś wgrano — wypisz klucze. Gdy były błędy — wklej listę błędów ze skryptu dosłownie.

Nie rób niczego poza tym: żadnych zmian w repo, żadnych innych skryptów, żadnego wysyłania maili.
```

## 2. „LEGO pon 07:00 — Przypomnienie: zrzut Empiku" — poniedziałek, cron `0 5 * * 1`

```
Cotygodniowa przypominajka dla Marka o ręcznym zrzucie cen Empiku (decyzja 15.09.2026: Empik blokuje ruch serwerowy, więc zrzut robi Marek lokalną przeglądarką przez skill klocki-ceny-empik, a plik lego-empik.json wrzuca do sesji Łowcy Promocji). Ty tylko wysyłasz mail.

Kroki:
1. W katalogu repo: `git fetch origin main && git checkout -q origin/main` (bez npm — skrypt wysyłki to Python bez zależności; PDF robi Chromium z kontenera).
2. Zapisz plik `/tmp/przypomnienie-empik.md` z treścią (uzupełnij datę poniedziałku):

   # Zrzut Empiku — tydzień od <DD.MM.RRRR>

   Pora na cotygodniowy zrzut cen LEGO z empik.com (skill `klocki-ceny-empik`, lokalna przeglądarka).

   1. Zrób zrzut → `lego-empik.json`.
   2. Wrzuć plik do sesji **Łowca Promocji** z notką „import cen + linków Empik”.
   3. Łowca importuje ceny i uruchamia `node scripts/empik-redirects.mjs lego-empik.json --usun-martwe` (deeplinki produktowe zamiast wyszukiwarki).

   Ostatni zrzut wg `src/data/oferty_feed.json`: <najczęstsza wartość pola `data` przy wpisach z `"sklep": "empik"`; jeśli nie ustalisz w minutę, wpisz „nie ustalono”>.

3. Wyślij: `python3 scripts/wyslij-raport.py --zadanie przypomnienie --tytul "Przypomnienie: zrzut Empiku — <DD.MM.RRRR>" --plik /tmp/przypomnienie-empik.md --wstep "Cotygodniowe przypomnienie o ręcznym zrzucie cen Empiku."`
4. Podsumowanie: jedna linijka — wysłano / błąd (wklej komunikat skryptu dosłownie). Nic nie commitujesz, niczego innego nie robisz.
```

## 3. „LEGO wt 05:00 — LEGO.pl katalog (ceny, dostępność, ekskluzywy)" — wtorek, cron `0 3 * * 2`

```
Cotygodniowy odczyt listingu lego.pl dla tylkoklocki.pl (decyzja Marka 15.09.2026: LEGO sprawdzamy co najmniej raz w tygodniu). Ty tylko uruchamiasz skrypty z repo w podanej kolejności i czytasz ich wyniki; skrypty same walidują dane (append-only) i przerywają przy błędzie. Kontekst: RUNBOOK.md, sekcja „lego.pl: dostępne przez Firecrawl". Koszt: ok. 75 kredytów Firecrawla (57 stron listingu).

Kroki, dokładnie w tej kolejności — po błędzie w którymkolwiek przerwij i wklej komunikat do podsumowania:
1. W katalogu repo: `git fetch origin main && git checkout -B lego-pl-katalog origin/main`. Jeśli nie ma node_modules: `npm ci --no-audit --no-fund`.
2. Zaciąg listingu (kilkanaście minut, nie przerywaj): `node scripts/firecrawl-legopl.mjs --wyjscie /tmp/legopl-katalog.json --rrp /tmp/legopl-rrp.json`. Skrypt sam przechodzi wszystkie strony listingu (ok. 57 po 22–24 zestawy). Sprawdź w wyniku, że liczba produktów przekracza 1000 — jeśli jest mniejsza (np. listing urwał się po kilku stronach), NIE wczytuj danych, tylko opisz to w podsumowaniu.
3. `node scripts/lego-ceny.mjs /tmp/legopl-katalog.json --sucho` — przeczytaj raport (produkty, ekskluzywne, zmiany). Gdy raport wygląda rozsądnie (zmiany liczone w setkach, nie w tysiącach; liczba „nowo dostepny" poniżej 100), uruchom bez `--sucho`.
4. `node scripts/wczytaj-rrp.mjs /tmp/legopl-rrp.json --zrodlo "lego.pl (Firecrawl)" --sucho`, potem bez `--sucho` (rejestr cen katalogowych jest write-once — konflikty zostają w raporcie, nie nadpisuj ich flagą --nadpisz).
5. `node scripts/lego-redirects.mjs /tmp/legopl-katalog.json --sucho`, potem bez `--sucho` (adresy kart produktu do redirects.json, tylko dopisywanie).
6. `npm run build` — musi przejść. Potem `git add src/data && git commit -m "LEGO.pl: ceny, dostępność i ekskluzywy z listingu <DD.MM.RRRR>" && git push origin lego-pl-katalog:main`. Przy odrzuconym pushu: `git fetch origin main && git rebase origin/main` i push ponownie (do 3 prób).
7. Podsumowanie (5 linijek): liczba produktów z listingu, ekskluzywnych, zmian w feedzie / sety / katalogu, nowych cen RRP, nowych linków; hash commita. Zestawy „spoza katalogu" z raportu lego-ceny.mjs wypisz numerami (dopisze je Scout albo katalog-z-rebrickable.mjs).

Nie rób niczego poza tym: żadnych innych skryptów, żadnej edycji kodu, żadnych maili. Gdy Firecrawl odpowie 402/429 (brak kredytów, limit) — przerwij i wklej komunikat.
```

---

Po założeniu wszystkich w panelu: daj znać w sesji Code — skasuję `trig_01TSSqtf4ke7wfxwbmkAp6GM`
i `trig_01RimXSd1NCqbbRP16MBrjVu` (wersje z API), żeby nic nie chodziło podwójnie.
