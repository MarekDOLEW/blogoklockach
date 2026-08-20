# Podział ról i zasady współpracy

| Osoba | Obszar | Pliki |
|---|---|---|
| **Piotr** (redakcja) | research, karty researchu, artykuły, standardy redakcyjne | `redakcja/`, `src/pages/artykuly/` |
| **Marek** (sprzedaż) | afiliacje, feedy cenowe, dane, worker, runnery, SEO techniczne, infrastruktura | `src/data/`, `src/worker.js`, `scripts/`, pozostałe `src/pages/` |

Zasady:

- Obaj pushują niezależnie na `main` (deploy automatyczny). Rozdzielne obszary
  plików minimalizują konflikty; przy konflikcie `git pull --rebase`.
- Zmiana w cudzym obszarze → najpierw uzgodnienie (albo notatka w commit
  message i wiadomość do drugiej osoby).
- Wspólne artykuły graniczne (np. prezentowniki z częścią cenową): redakcja
  Piotra, warstwa cenowo-linkowa Marka.
- Decyzje projektowe zapisujemy w `redakcja/README.md` (log) oraz — dla
  afiliacji — w `src/data/afiliacje_rejestr.json` (`_meta.decyzje`).
- Instrukcje dla Claude Piotra: `redakcja/instrukcje-dla-claude-piotra.md`.
