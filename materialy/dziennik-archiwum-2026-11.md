# Dziennik — archiwum 2026-11

Wpisy przeniesione z `DZIENNIK.md` po przekroczeniu progu wieku.
Treść jest niezmieniona. Bieżące wpisy i ustalenia trwałe: `DZIENNIK.md`.

## 2026-11-01 14:55 · CODE · Skrzynka (mail): 0035 opublikowany, 0034 za duży dla automatu

**0035 „Listopadowe premiery LEGO” na stronie: https://tylkoklocki.pl/artykuly/listopadowe-premiery-lego-sagrada-familia-upominek-do-weneckiej/ (`3668728`, adres poprawiony w `20a551d` przed wysłaniem linków — slugify robiło z „Família” „fam-lia”; teraz zdejmuje wszystkie znaki diakrytyczne).** 0034 „Historia płyt drogowych LEGO” (md + 13 zdjęć) — mail ma 10,6 MB, konektor Gmail go nie przenosi (zrywa połączenie), IMAP z kontenera zablokowany; mail ma etykietę „do-poprawy”, Piotr i Marek dostali prośbę o wgranie przez panel (Wgraj, do 25 MB na plik) albo ponowną wysyłkę z mniejszymi zdjęciami.
**Dla drugiej strony:** limit ~9 MB na mail dopisany do `redakcja/skrzynka-instrukcja.md` i do promptu automatu skrzynki (sprawdza `sizeEstimate` przed RAW).

## 2026-11-01 · CODE · Panel panel.tylkoklocki.pl — wersja 1 w repo, czeka na Access

**Panel wewnętrzny dla Marka i Piotra jest w `panel/`: zakładki Dziś, Runnery, Opisy, Social, Wgraj, Dziennik (Artykuły, Statystyki, Afiliacje, Ceny — w drugim kroku).** Decyzje Marka: osobna subdomena, logowanie Cloudflare Access, Piotr widzi wszystko, pliki z panelu publikują się od razu, bez przychodów na razie. Osobny worker (`panel/wrangler.jsonc`) — serwisu i `src/worker.js` nie dotyka. Bez `ACCESS_TEAM`/`ACCESS_AUD` panel odpowiada 503 każdemu.
- Wgrane pliki → R2 `_panel/wplywy/` → automat „Skrzynka tekstów Piotra” (prompt rozszerzony 01.11 o `scripts/panel-wplywy.mjs`) → ta sama publikacja co z maila; `.docx/.pdf` czekają na sesję Code.
- Nowy rejestr social: `materialy/social/rejestr.json` (5 publikacji od 15.10); skill `klocki-social` każe dopisywać każdą publikację — **paczkę skilla trzeba wgrać ponownie na claude.ai** (`node scripts/spakuj-skille.mjs`), żeby Cowork też dopisywał.
- Social po terminie: karuzela z 15.10 (przypomnienie poszło 29.10, archiwizacja niepotwierdzona); post i rolka Grogu z kodem black-weeks2 — kod ważny do 01.11, do zdjęcia od 02.11 (przypomnienie stoi na 09.11).
**Dla drugiej strony:** Marek — 4 kroki w panelu Cloudflare z `panel/README.md` (Zero Trust Free, aplikacja Access dla panel.tylkoklocki.pl, worker `tylkoklocki-panel` z repo, potem nazwa zespołu + AUD do sesji Code).

## 2026-11-01 10:20 · DANE WT · Do zrobienia

**Feed Ceneo (Tradedoubler, fid 256472) odpowiada `PF_392 „Requester is not connected to Feed"` — ten sam wzorzec, co Lidl przed akceptem 17–18.09.2026 (RUNBOOK, „Lidl przez Tradedoubler").**
**Mamy?** — częściowo: feed działał jeszcze 27.10.2026 (`feedy.json.ceneo.ostatnie_pobranie`), dziś dwa niezależne wywołania (pełny przebieg i `--sklep ceneo` osobno) zwróciły ten sam błąd 400.
**Zrobić:** — zgłosić w panelu Tradedoublera / do wsparcia TD, że program Ceneo CPS (385881, konto a=3494691) nie jest podłączony do feedu 256472; po potwierdzeniu podpięcia samo się naprawi, kodu nic nie trzeba zmieniać.
**Kto:** — Marek (konto Tradedoubler)
↻ 2026-11-03: nadal aktualne — trzeci przebieg rzędu (01.11, dwa wywołania tego dnia, i teraz 03.11) z tym samym błędem PF_392, nic się nie zmieniło.
→ zamknięte 2026-11-03 (mail Tradedoublera do Marka, wklejony w czacie): przyczyna nie jest usterką podpięcia jak przy Lidlu — **program Ceneo CPS 385881 został trwale zakończony przez Tradedoublera**. Zaległe prowizje mają być wypłacone, nowych nie będzie. `feedy.json.ceneo.aktywny` ustawiony na `false` (Dane wt od teraz pomija ten feed), status w `afiliacje_rejestr.json` zmieniony na „zakonczony", dane w `redirects.json`/`oferty_feed.json` zostają jako ostatni znany stan (append-only). Nowy wpis niżej: decyzja o linku w `worker.js` i wierszu Ceneo w tabelach cen.

## 2026-11-01 · CODE · Karty P07, paczki 26–28: wgrana tylko 28

**Paczka 28 wgrana: 25 nowych kart (21245–76961), rejestr ma teraz 1749 kart, wszystkie 25 hubów indeksowalnych.** Paczki 26 i 27 (50 zestawów, m.in. 10312, 10314, 71037–71039, 76995) **pominięte**: każdy z tych zestawów miał już pełną kartę (2–4 akapity, 5–6 FAQ, hub w indeksie). Nowe teksty to inne, krótsze wersje (ok. 600–1400 zn. wobec 760–1970 zn. obecnych), więc ich nie nadpisywaliśmy.
**Dla drugiej strony:** lista „noindex”, z której Piotr wybiera zestawy, jest nieaktualna — przed kolejną paczką warto dać mu świeżą listę zestawów bez karty. Gdyby nowe wersje 26–27 miały jednak zastąpić stare, wystarczy `import-karty.py <zip> --nadpisz --krotkie` (decyzja Marka).
