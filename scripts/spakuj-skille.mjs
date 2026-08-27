// Pakowanie skilli z .claude/skills/ do plików .skill gotowych do wgrania
// na claude.ai (Settings -> Skills).
//
// Po co osobny krok: Claude Code czyta skille wprost z katalogu `.claude/skills/`,
// więc w tym repo działają od razu po eksporcie. Cowork czyta je z konta, a synchro
// idzie tylko w jedną stronę — serwer do kontenera. Z sesji nie da się wypchnąć
// skilla na konto, więc ostatni krok robi człowiek: przeciąga plik .skill
// w ustawieniach. Ten skrypt przygotowuje mu paczkę w formacie, którego
// tamten formularz oczekuje (zwykły zip z katalogiem skilla w środku).
//
// Użycie: node scripts/spakuj-skille.mjs

import { readdirSync, statSync, mkdirSync, rmSync, existsSync, createWriteStream, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const katalogSkilli = new URL('../.claude/skills/', import.meta.url);
const wyjscie = new URL('../skille/', import.meta.url);

// Pakujemy tylko skille redakcyjne — reszta w .claude/skills/ to skille
// techniczne (SEO, UX), które z Cowork-iem nie mają nic wspólnego.
const NASZE = ['lego-standard-redakcyjny', 'lego-standard-sprzedazowy'];

if (existsSync(wyjscie)) rmSync(wyjscie, { recursive: true });
mkdirSync(wyjscie, { recursive: true });

for (const nazwa of NASZE) {
  const zrodlo = new URL(`${nazwa}/`, katalogSkilli);
  if (!existsSync(zrodlo)) {
    console.error(`BRAK ${nazwa} — uruchom najpierw: node scripts/eksport-skilli.mjs`);
    process.exit(1);
  }
  // walidacja: bez frontmattera z name i description skill nie wstanie
  const skill = readFileSync(new URL('SKILL.md', zrodlo), 'utf8');
  for (const pole of ['name:', 'description:']) {
    if (!skill.includes(pole)) {
      console.error(`${nazwa}/SKILL.md nie ma pola ${pole}`);
      process.exit(1);
    }
  }
  const plik = new URL(`${nazwa}.skill`, wyjscie).pathname;
  execFileSync('zip', ['-qr', plik, nazwa], { cwd: katalogSkilli.pathname });
  console.log(`  ${nazwa.padEnd(26)} ${Math.round(statSync(plik).size / 1024)} KB`);
}

console.log('\nPliki .skill w skille/. Wgraj je na claude.ai -> Settings -> Skills.');
console.log('Pamiętaj skasować stary klocki-standard-sprzedazowy — zmienił nazwę.');
