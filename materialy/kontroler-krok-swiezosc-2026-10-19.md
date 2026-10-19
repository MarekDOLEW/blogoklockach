# Krok do wklejenia w prompt Kontrolera — świeżość tekstów (19.10.2026)

**Stan: NIEWDROŻONE.** Skrypt `scripts/swiezosc-tekstow.mjs` jest w repo i działa,
ale Kontroler go nie uruchamia, dopóki poniższy akapit nie wejdzie do promptu
Routine `trig_01KB8XkPcHyvc5kCRKEKYjri`. Zgodnie z „Ustaleniami trwałymi" wpis
w repo niczego w runnerze nie zmienia — do runnera prowadzi tylko jego prompt.

**Dlaczego to nie zostało zrobione z sesji Code:** `update_trigger` odmówił:

> a routine's instructions (its prompt) can be changed only from the conversation
> or thread the routine posts into, and this is not that one. Nothing was changed.

Prompt Kontrolera zmienia się więc **z rozmowy Kontrolera** (jego stała sesja
`session_01E7pTLYKdkzz5UgEQ58GMPp`) albo z panelu claude.ai. Nie kasować i nie
odtwarzać Routine — nowy może nie mieć prawa pisać do tej samej sesji.

**Gdzie wstawić:** jako osobny akapit **przed** akapitem zaczynającym się od
`KLIKNIĘCIA AFILIACYJNE:`, czyli zaraz po bloku `ARCHIWUM DZIENNIKA`. To miejsce
jest celowe — prompt każe najpierw robić kroki, które zostawiają ślad w repo.

---

ŚWIEŻOŚĆ TEKSTÓW WOBEC DANYCH (od 19.10.2026). Uruchom `node scripts/swiezosc-tekstow.mjs` i wklej wynik do raportu jako sekcję „Świeżość tekstów". Skrypt porównuje datę `zaktualizowano` tekstów z `src/pages` z naszymi danymi i zgłasza dwie rzeczy: SPRZECZNOŚĆ (tekst oznacza numer plakietką „przeciek", a ten numer ma już potwierdzoną polską cenę katalogową albo stoi w listingu lego.com — czyli tekst mówi nieprawdę) oraz PRZESTARZAŁE (`zaktualizowano` starsze niż wpis albo rozstrzygnięcie w `przecieki.json` dla numeru, który tekst wymienia). Każdą SPRZECZNOŚĆ traktuj jak błąd faktyczny na produkcji, nie jak zaległość: idzie do „Kto co robi" jako osobna pozycja z „Kto: Code (dane, strona)" i do dziennika. PRZESTARZAŁE wymień jedną linijką na tekst, bez rozpisywania zdarzeń. Tekstów sam NIE poprawiasz. Gdy skrypt nic nie znajdzie, sekcja ma jedno zdanie. Powód tego kroku: 19.10.2026 strona /zapowiedzi-lego-2027/ przez siedem tygodni twierdziła, że „Grupa LEGO nie potwierdziła jeszcze żadnego zestawu na 2027 rok", mając w `sety.json` cztery zestawy z premierą 2027-01 i polskimi cenami katalogowymi — rozjazdu nie zauważył nikt, bo nic go nie liczyło.

---

## Co skrypt robi, w jednym akapicie

Dwa ustalenia, oba policzalne, żadnej oceny treści. **Sprzeczność**: numer
oznaczony w tabeli albo nagłówku plakietką `status--maybe">przeciek` stoi już w
`sety.json` i jest publicznie wystawiony przez LEGO — ma potwierdzoną cenę w
`rrp_potwierdzone.json` albo widnieje w listingu z `katalog.json`. **Przestarzałe**:
`zaktualizowano` tekstu jest starsze niż `dodano` albo `rozstrzygniecie.kiedy`
w `przecieki.json` dla numeru, który tekst wymienia.

Dwie rzeczy skrypt świadomie pomija, bo inaczej byłby nieczytelny:

- **cen katalogowych nie liczy jako starzenia tekstu** — standard redakcyjny
  zabrania kwot w treści artykułu (wstawia je tabela huba przy każdym budowaniu),
  a sierpniowy zrzut pełnego katalogu dał ok. 900 wpisów RRP tego samego dnia i
  w pierwszej wersji zapalał każdy starszy tekst, zakopując jedyne ustalenie
  warte czytania;
- **samo wejście numeru do `sety.json` nie jest dowodem**, że LEGO zestaw ogłosiło.
  Scout zakłada tam wpis, gdy numer zarezerwuje katalog branżowy. Przy 77094
  (Zelda: Ocarina of Time) dało to zestaw w rejestrze, dla którego lego.com nie ma
  karty produktowej — sprawdzone 19.10.2026. Taki numer idzie do osobnego kubełka
  „DO SPRAWDZENIA", nie do sprzeczności.

## Test regresji (bez sieci, bez kredytów)

Skrypt sprawdzono na stanie, który miał wykryć — strona 2027 z 27.08.2026:

```
git show 20cb23a^:src/pages/zapowiedzi-lego-2027.md > src/pages/zapowiedzi-lego-2027.md
node scripts/swiezosc-tekstow.mjs      # SPRZECZNOŚĆ: 67006, 67008 + 11 wpisów przecieków
git checkout src/pages/zapowiedzi-lego-2027.md
```

Wynik na tym stanie: dwie sprzeczności (67006 Panorama Marvela 429,99 zł,
67008 Batmobil 259,99 zł — oba oznaczone w tekście jako przeciek) i jedenaście
wpisów przecieków nowszych niż data aktualizacji. Na stanie dzisiejszym:
zero sprzeczności, jeden numer w „DO SPRAWDZENIA" (77094).
