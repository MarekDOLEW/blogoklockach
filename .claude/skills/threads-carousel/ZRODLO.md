Skill wendorowany z https://github.com/itchernetski/threads-carousel-claude-skill
(commit cc775b668088ba348022bc2296ff41f130f1f7ef, 2026-04-20, licencja MIT, wersja 1.2.0).

Zmiany względem upstreamu:
- pominięty preview.png (obrazek do README, 492 KB);
- w SKILL.md, sekcja "Prepare working copy": ścieżka ~/.claude/skills/threads-carousel
  zastąpiona zmienną SKILL_DIR wskazującą na .claude/skills/threads-carousel w repo
  (z fallbackiem do ~/.claude/skills/). Przy odświeżaniu z upstreamu nanieść ponownie.

Uwagi:
- generowanie wymaga bun (lub npm), serwera Next.js na porcie 3333 i przeglądarki
  do eksportu PNG/PDF — to skill do pracy LOKALNEJ, w sesji chmurowej eksport nie zadziała;
- pierwsze uruchomienie instaluje node_modules w template/ (ok. 350 MB, jest w .gitignore);
- eksport-skilli.mjs go nie dotyka.
