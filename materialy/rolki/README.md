# Rolki wideo (9:16) — szablony HyperFrames

Rolki na TikTok / Reels / Shorts składamy **z kodu**: szablon to zwykły HTML
z animacją GSAP, który [HyperFrames](https://github.com/heygen-com/hyperframes)
renderuje klatka po klatce w headless Chrome i koduje ffmpeg-iem do MP4.
Ten sam stos co karuzele (HTML → PNG przez Playwright), tylko z osią czasu.
Dlatego: polskie znaki i ceny są bezbłędne (to tekst, nie model obrazkowy),
a plik wyjściowy jest deterministyczny — ten sam deal daje tę samą rolkę.

Decyzja i porównanie narzędzi: `DZIENNIK.md`, wpis z 14.10.2026.

## Szablony

| Katalog | Format | Kto uruchamia |
|---|---|---|
| `szablon-deal/` | „Deal alert" 12 s: hook z tezą → cena katalogowa przekreślona i odliczanie do ceny dziś → sklepy od najtańszego → CTA „link w bio" + #materiałpartnerski | `scripts/rolka-deal.mjs <nr>` (sesja Code na żądanie) |

Wyjścia (projekt HyperFrames + MP4) lądują w `wyjscie/<nr>/` — katalog jest
w `.gitignore`, pliki wideo nie wchodzą do repo. Gotowy MP4 bierze się
z `wyjscie/<nr>/renders/deal-<nr>.mp4`.

## Jak powstaje rolka dealowa

```
node scripts/rolka-deal.mjs 75405                 # pełny przebieg: dane → zdjęcie → tło → dźwięk → check → MP4
node scripts/rolka-deal.mjs 75405 --bez-renderu   # tylko projekt, podgląd: cd materialy/rolki/wyjscie/75405 && npm run dev
node scripts/rolka-deal.mjs 75405 --hook1 "Krążownik Rebelii" --hook2 "na dnie cenowym"
```

1. **Dane** z repo, nic nie przepisujemy ręcznie: `ceny_baza.json` (cena
   katalogowa, minimum w naszej bazie i jego data), `oferty_feed.json` (ceny
   sklepów z datami — oferty starsze niż 7 dni odpadają), `sety.json` (seria,
   liczba elementów, wiek). Rabat i oszczędność liczy szablon z tych liczb.
2. **Zdjęcie** pudełka z feedu (Planeta Klocków) albo `obrazy.json`.
   `npx hyperframes remove-background` wycina je z białego tła lokalnym
   modelem (onnxruntime, bez kluczy, ~1 s). Gdy wycięcie się nie uda, szablon
   dostaje oryginał i przełącza się na `mix-blend-mode: multiply`.
3. **Dźwięk.** Efekty (whoosh na przejściach, pop i uderzenie basu przy cenie,
   sparkle pod konfetti) to pliki z biblioteki skilla `media-use` na licencji
   Pixabay (`szablon-deal/audio/CREDITS-sfx.md`). Podkład muzyczny:
   - domyślnie syntezowany w skrypcie (120 BPM, a-moll, kick/hat/bas/pad —
     czysty Node, bez zależności), żeby rolka nigdy nie wyszła niema;
   - z `HEYGEN_API_KEY` w środowisku skrypt pobiera utwór z katalogu HeyGen
     (`heygen asset search`, ponad 10 tys. utworów) — `--muzyka "energetic
     electronic"` ustawia nastrój, `--muzyka synt` wymusza syntezator.
4. **Kontrola i render.** `npx hyperframes check` (lint, układ, kontrast,
   strefa bezpieczna 9:16) musi przejść bez błędów, potem render 1080×1920,
   30 kl/s, H.264. Render 12 s trwa ok. 35 s na CPU.

Hook domyślny: pierwsza linia to nazwa zestawu (skrócona do ~22 znaków), druga
„na dnie cenowym", gdy cena dziś równa się minimum w bazie, inaczej „taniej
o X zł". Lepszy hook podajemy flagami — zasady w skillu `klocki-social`
(teza z liczbą, nie zapowiedź tematu).

## Wymagania środowiska

Node 22, ffmpeg/ffprobe, Chromium (HyperFrames pobiera własny headless shell
przy pierwszym uruchomieniu). Skille HyperFrames i pakiety iart-ai
(`tiktok-video-skills`, `ecommerce-video-skills`) są zadeklarowane jako
marketplace'y w `.claude/settings.json` — Code w tym repo ma je od ręki.
CLI HeyGen (muzyka, TTS) instaluje się jednym poleceniem z
`developers.heygen.com/cli`; w sesjach Code działa tylko przez `HEYGEN_API_KEY`
w sekretach środowiska (OAuth wymaga przeglądarki).
