#!/usr/bin/env node
// Nakładka zgodności: linki ze zrzutu empik → scripts/zrzut-redirects.mjs --sklep empik
// (od 24.09.2026 jeden skrypt obsługuje Empik i x-kom; zasady i wyjątek od
// append-only opisane tam i w CLAUDE.md).
process.argv.push('--sklep', 'empik');
await import('./zrzut-redirects.mjs');
