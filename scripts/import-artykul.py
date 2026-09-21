#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Import artykułu Piotra (DOCX) do markdownu naszego serwisu.

Po co osobny skrypt, skoro tekst da się skopiować: bo kopiowanie gubi to, czego
nie widać w akapitach. 21.09.2026 z materiału „Jak rosły zestawy LEGO" wypadł
wykres — w Wordzie widoczny, w konwersji nie, bo siedział jako obraz osadzony
(`word/media/image1.png`), a nie jako tekst. Wyszło to tylko dlatego, że
w tekście został podpis pod nieistniejącą grafiką. Ten skrypt pilnuje, żeby taka
sytuacja nie mogła przejść po cichu: **każdy obraz z dokumentu jest zapisywany
na dysk i zostawia widoczny znacznik w markdownie**, dokładnie w tym miejscu,
w którym stał w dokumencie.

Co robi:
  - akapity → tekst, nagłówki → `## `,
  - tabele → tabele markdownu, W KOLEJNOŚCI z dokumentu (python-docx trzyma je
    poza listą akapitów, więc naiwna konwersja przenosi je na koniec albo gubi),
  - obrazy → pliki w `materialy/obrazy-artykulow/<slug>/` + znacznik
    `<!-- OBRAZ n: ... -->` w treści,
  - pierwszy akapit traktuje jako tytuł (idzie do frontmattera, nie do treści).

Czego NIE robi: nie pisze frontmattera, nie dobiera slajderów, nie wstawia
znaczników cen. To są decyzje redakcyjne — skrypt daje surowy, kompletny
materiał, a resztę robi sesja według `redakcja/`.

Użycie:
  python3 scripts/import-artykul.py plik.docx                 # markdown na stdout
  python3 scripts/import-artykul.py plik.docx --wyjscie a.md  # do pliku
  python3 scripts/import-artykul.py plik.docx --sucho         # tylko raport
"""

import argparse, os, re, sys
import docx
from docx.table import Table
from docx.text.paragraph import Paragraph

KATALOG = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLIP = './/{http://schemas.openxmlformats.org/drawingml/2006/main}blip'
EMBED = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed'


def slugify(tekst):
    t = tekst.lower()
    for a, b in zip('ąćęłńóśźż', 'acelnoszz'):
        t = t.replace(a, b)
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', t)).strip('-')[:60]


def tabela_md(tabela):
    wiersze = [[k.text.strip().replace('|', '\\|') for k in w.cells] for w in tabela.rows]
    if not wiersze:
        return ''
    szer = len(wiersze[0])
    linie = ['| ' + ' | '.join(wiersze[0]) + ' |', '|' + '---|' * szer]
    for w in wiersze[1:]:
        linie.append('| ' + ' | '.join(w) + ' |')
    return '\n'.join(linie)


def obrazy_akapitu(akapit, dokument):
    """Bloby obrazów osadzonych w akapicie, w kolejności wystąpienia."""
    out = []
    for blip in akapit._p.findall(BLIP):
        rid = blip.get(EMBED)
        if not rid:
            continue
        czesc = dokument.part.related_parts.get(rid)
        if czesc is not None:
            out.append((rid, czesc.blob, os.path.splitext(czesc.partname)[1] or '.png'))
    return out


def importuj(sciezka, slug=None, zapisuj=True):
    d = docx.Document(sciezka)
    slug = slug or slugify(os.path.splitext(os.path.basename(sciezka))[0])
    katalog_obrazow = os.path.join(KATALOG, 'materialy/obrazy-artykulow', slug)
    linie, tytul = [], None
    licz = {'akapity': 0, 'naglowki': 0, 'tabele': 0, 'obrazy': 0}
    zapisane = []

    for element in d.element.body.iterchildren():
        if element.tag.endswith('}p'):
            akapit = Paragraph(element, d)
            for _, blob, rozsz in obrazy_akapitu(akapit, d):
                licz['obrazy'] += 1
                nazwa = f'{slug}-{licz["obrazy"]}{rozsz}'
                if zapisuj:
                    os.makedirs(katalog_obrazow, exist_ok=True)
                    with open(os.path.join(katalog_obrazow, nazwa), 'wb') as f:
                        f.write(blob)
                zapisane.append((nazwa, len(blob)))
                linie.append(f'<!-- OBRAZ {licz["obrazy"]}: materialy/obrazy-artykulow/{slug}/{nazwa} '
                             f'({len(blob) // 1024} kB) — decyzja redakcyjna: SVG, <img> czy pominąć -->')
            tekst = akapit.text.strip()
            if not tekst:
                continue
            if tytul is None:
                tytul = tekst           # pierwszy akapit to tytuł – idzie do frontmattera
                continue
            if akapit.style.name.startswith('Head'):
                licz['naglowki'] += 1
                linie.append('## ' + tekst)
            else:
                licz['akapity'] += 1
                linie.append(tekst)
        elif element.tag.endswith('}tbl'):
            licz['tabele'] += 1
            linie.append(tabela_md(Table(element, d)))

    return {'tytul': tytul, 'slug': slug, 'markdown': '\n\n'.join(linie),
            'licz': licz, 'obrazy': zapisane, 'katalog': katalog_obrazow}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('plik')
    p.add_argument('--slug', default=None)
    p.add_argument('--wyjscie', default=None)
    p.add_argument('--sucho', action='store_true', help='nie zapisuj obrazów ani markdownu')
    a = p.parse_args()

    w = importuj(a.plik, a.slug, zapisuj=not a.sucho)
    licz = w['licz']
    print(f'Tytuł: {w["tytul"]}', file=sys.stderr)
    print(f'Slug:  {w["slug"]}', file=sys.stderr)
    print(f'Akapity: {licz["akapity"]} · nagłówki: {licz["naglowki"]} · tabele: {licz["tabele"]} '
          f'· obrazy: {licz["obrazy"]}', file=sys.stderr)
    if licz['obrazy']:
        # Najważniejsza linia całego skryptu: obraz w dokumencie NIE MOŻE zniknąć po cichu.
        print(f'UWAGA: dokument ma {licz["obrazy"]} obraz(ów). '
              f'{"Zapisane w " + w["katalog"] if not a.sucho else "(--sucho: nie zapisano)"}. '
              f'W markdownie stoją znaczniki <!-- OBRAZ n --> — przejrzyj każdy przed publikacją.',
              file=sys.stderr)
        for nazwa, rozmiar in w['obrazy']:
            print(f'   {nazwa} ({rozmiar // 1024} kB)', file=sys.stderr)
    if a.sucho:
        print('--sucho: markdownu nie zapisuję.', file=sys.stderr)
        return
    if a.wyjscie:
        with open(a.wyjscie, 'w', encoding='utf-8') as f:
            f.write(w['markdown'] + '\n')
        print(f'Markdown: {a.wyjscie}', file=sys.stderr)
    else:
        print(w['markdown'])


if __name__ == '__main__':
    main()
