#!/usr/bin/env node
// Nakładka zgodności: import zrzutu xkom → scripts/zrzut-import.mjs --sklep xkom
// (od 24.09.2026 jeden skrypt obsługuje Empik i x-kom; reguły i opis tam).
process.argv.push('--sklep', 'xkom');
await import('./zrzut-import.mjs');
