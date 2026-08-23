# Runbook — tylkoklocki.pl

Wiedza operacyjna: pułapki, ograniczenia zewnętrznych systemów, procedury
awaryjne. Rzeczy kupione czasem, nie do odtworzenia z kodu.

**Czego tu nie ma:** harmonogramu runnerów (`materialy/zadania-cykliczne.md`,
generowany), podziału pracy (`NARZEDZIA.md`, `redakcja/wspolpraca.md`),
bieżących zadań (`DZIENNIK.md`).

Każdy wpis ma datę ustalenia. Jeśli ustalenie przestaje być prawdziwe —
popraw je i zmień datę, nie dopisuj sprzeczności na dole. Poprzedni dokument
zginął właśnie tak: nowe ustalenia dopisano niżej, tabeli u góry nie poprawiono.

---

## Obieg plików danych

Wszystkie dane serwisu trafiają do `src/data/` w repo, gałąź `main`.
Push na `main` uruchamia build i deploy w Cloudflare automatycznie — strona
odświeża się w ~2 minuty, nic więcej się nie klika.

Runnery pushują same. **Ścieżka awaryjna** (gdy sesja nie ma dostępu do repo):
runner oddaje gotowy plik w czacie → GitHub → `src/data/` → *Add file →
Upload files* → przeciągnij → *Commit changes*.

### Żelazna reguła aktualizacji

**Pobierz aktualny plik z repo → dołóż zmiany → zwaliduj → wypchnij.**
Nigdy nie twórz od zera, nigdy nie usuwaj cudzych wpisów. Append-only.

Gdy sesja buduje dane w czacie, zawsze podaj jej link do surowego pliku:

```
https://raw.githubusercontent.com/MarekDOLEW/blogoklockach/main/src/data/<plik>
```

Przy weryfikacji dodaj `?t=<cokolwiek>` — cache CDN bywa nieświeży.

---

## Media Expert *(ustalone 18.08.2026)*

**Feed aktualizuje się 2× na dobę, ale z opóźnieniem uploadu.** Stemple
`<updated>` to 00:30 i 18:30 CEST, jednak plik ląduje na
`storage.googleapis.com` około **7 godzin później** — nocny ok. 07:40,
wieczorny w środku nocy.

Praktyczny skutek: przebieg Łowcy o 07:00 zawsze dostaje **wczorajszą wieczorną
wersję**. Świeżej nocnej nie zobaczy. Przy planowaniu zmian godzin trzeba to
uwzględnić, inaczej „poprawka" nic nie da.

**Stron produktowych ME nie da się weryfikować punktowo z sesji.** curl
i WebFetch dostają HTTP 403, prawdziwa przeglądarka (Chromium) — reset
połączenia. ME blokuje ruch z data center. WebFetch działał do 16.08.2026,
potem przestał.

Wniosek obowiązujący: **ceny ME bierzemy wyłącznie z feedu afiliacyjnego**
(oficjalny, wiarygodny). Weryfikację na stronach robimy tylko dla Planety
Klocków.

---

## Typowanie deali *(ustalone 18.08.2026)*

Deale dnia typujemy w **trzech półkach cenowych**: do 200 zł, 201–800 zł,
801 zł i więcej.

Powód: rabat procentowy naturalnie faworyzuje tanie zestawy, przez co drogie
okazje umykały (np. Tower Bridge −27% nie miał szans przebić się przez drobnicę
z −50%).

Slajder na stronie głównej:
- sloty 1–3 — najlepszy rabat z każdej półki, od najdroższej
- sloty 4–5 — dzikie karty wg samego rabatu

Raporty Łowcy pokazują czołówkę osobno dla każdej półki.

---

## Gdzie sprawdzić, gdy coś nie gra

| Problem | Gdzie |
|---|---|
| Build / deploy | Cloudflare → Workers & Pages → `blogoklockach` → *Deployments / Build history*. Czerwony build = strona zamrożona na ostatniej zielonej wersji; logi pod „View build" |
| Ruch na stronie | Cloudflare → Analytics & Logs → Web Analytics |
| Kliknięcia afiliacyjne | panel webePartners (autorytatywny). Worker też je liczy, ale dopiero po włączeniu Analytics Engine — wymaga planu Workers Paid |
| Widoczność w Google | Search Console, usługa `https://tylkoklocki.pl/` |
| Runner „nie działa" | najpierw sprawdź flagę `enabled` w Routines, dopiero potem logi. Wyłączony runner nie zgłasza błędu |

### Rollback

Cloudflare → *Deployments* → *Version History* → „…" przy starszej wersji →
*Rollback*. Nie wymaga zmian w repo.

---

## Runnery: opóźnione commity *(zaobserwowane 23.08.2026)*

Wycofania, Łowca i Backfill odpaliły się o 04:09, 05:09 i 10:03, ale commity
wylądowały dopiero po 17:00 — **7–12 godzin później**. Sesje miały status
`rejected`, co wygląda na kolejkowanie po wyczerpaniu limitu tygodniowego.

Scout i Radar (nowsze sesje na Opusie) pushują punktualnie.

Skutek: **godzina odpalenia nie równa się godzinie, o której dane są na
produkcji.** Przy diagnozie „dlaczego strona ma stare ceny" sprawdzaj czas
commita, nie czas triggera.

---

## Stabilność formatu plików JSON *(do naprawy)*

Scout przepisuje `known_sets.json` w całości (219 zmienionych linii przy
80 dodanych w `sety.json`). Łowca przepisuje całą gałąź Allegro
w `redirects.json` — 2 646 zmienionych linii przy każdym przebiegu.

Diagnoza: **serializacja JSON nie jest deterministyczna** — kolejność kluczy
lub formatowanie zmieniają się między przebiegami, więc git widzi zmianę tam,
gdzie danych nie ruszono.

Skutek: codzienne commity po kilka megabajtów, historia repo puchnie bez
powodu, a prawdziwe zmiany giną w szumie i nie da się ich przejrzeć w diffie.

Kierunek naprawy: sortowanie kluczy, stałe wcięcie, stabilne formatowanie
liczb — po stronie każdego runnera, który zapisuje JSON.
