#!/usr/bin/env node
// Nakładka zgodności: import zrzutu empik → scripts/zrzut-import.mjs --sklep empik
// (od 24.09.2026 jeden skrypt obsługuje Empik i x-kom; reguły i opis tam).
process.argv.push('--sklep', 'empik');
await import('./zrzut-import.mjs');
