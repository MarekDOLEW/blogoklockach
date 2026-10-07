---
name: klocki-zrzuty-tygodniowe
description: 'Poniedziałkowe zrzuty cen LEGO z Empiku i x-komu dla tylkoklocki.pl w jednym przebiegu — uruchamia po kolei skille klocki-ceny-empik i klocki-ceny-xkom i oddaje oba pliki (lego-empik.json, lego-xkom.json). Używaj ZAWSZE, gdy użytkownik pisze: "zrzuty tygodniowe", "zrzuty", "poniedziałkowe zrzuty", "zrób zrzuty Empik i x-kom", "przeleć Empik i x-kom", "ceny z Empiku i x-komu", albo gdy przyszedł mail „Przypomnienie: zrzuty Empiku i x-komu". Zastępuje pisanie osobnego promptu co tydzień.'
---

# Zrzuty tygodniowe — Empik i x-kom w jednym przebiegu

## Po co ten skill

Co poniedziałek o 08:15 Marek dostaje mail „Przypomnienie: zrzuty Empiku
i x-komu". Oba sklepy blokują ruch serwerowy, więc zrzut robi Cowork
w lokalnej przeglądarce. Każdy sklep ma własny skill z pełną procedurą
(`klocki-ceny-empik`, `klocki-ceny-xkom`). Ten skill tylko je spina, żeby
wystarczyło napisać **„zrzuty tygodniowe”** zamiast układać prompt od nowa.

Procedur sklepów tu NIE powtarzamy — obowiązuje zawsze wersja z ich skilli.

## Procedura

1. **Empik** — wykonaj w całości skill `klocki-ceny-empik` (wszystkie jego
   kroki i kontrole jakości). Wynik: `lego-empik.json`.
2. **x-kom** — wykonaj w całości skill `klocki-ceny-xkom`. Wynik: `lego-xkom.json`.
3. Jeśli jeden sklep się nie uda (blokada, logowanie, captcha, urwany listing),
   **nie przerywaj drugiego** — zrób drugi zrzut i w podsumowaniu napisz
   wprost, który się nie udał i na którym kroku.
4. **Oddaj oba pliki** do pobrania i napisz krótkie podsumowanie:

       Empik: <liczba ofert>, <unikalnych numerów>, strony <x/y> — OK / problem: …
       x-kom: <liczba ofert>, <unikalnych numerów> — OK / problem: …
       Pliki: lego-empik.json, lego-xkom.json → wrzuć do sesji Claude Code.

5. Marek wrzuca oba pliki do sesji Claude Code jako załączniki. Import
   (`empik-import.mjs`, `xkom-import.mjs`) i deeplinki
   (`empik-redirects.mjs`, `xkom-redirects.mjs --usun-martwe`) robi Code —
   nie Cowork.

## Czego NIE robić

- Nie importuj danych do repo i nie pisz do plików serwisu — to robi Code.
- Nie przepisuj procedur sklepów z pamięci — idź za ich skillami.
- Nie uruchamiaj tego z zadania w chmurze: Empik i x-kom blokują serwery,
  działa tylko lokalna przeglądarka.
