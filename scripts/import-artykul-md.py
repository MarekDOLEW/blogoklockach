#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Import artykułu Piotra w Markdownie (.md) do formatu serwisu.

Od 20.10.2026 Piotr przysyła teksty jako pliki .md (notatka „jak przekazujemy
teksty do publikacji”, odpowiedź na `redakcja/format-tekstow.md`). DOCX dalej
importuje `import-artykul.py`; ten skrypt robi to samo dla .md, a do tego
czyta blok danych i zamienia znaczniki, które w DOCX trzeba było zamieniać ręcznie.

Co robi:
  - `# Tytuł` z pierwszego wiersza → `title` we frontmatterze,
  - blok `[DANE DLA SERWISU] … [KONIEC DANYCH DLA SERWISU]` → frontmatter
    (Opis → opis, Tytuł SEO → seo_tytul, Kategoria → kategoria, Zestawy → zestawy,
    FAQ: P:/O: → faq, opcjonalnie Ważne do: RRRR-MM-DD → wazne_do); blok nie trafia do treści,
  - kategoria z bloku, a gdy jej brak — z nazwy pliku (`0024_Aktualności_…`, `Recenzje_010_…`),
  - `[TABELA CENOWA]` → tabela cen pierwszego zestawu z bloku; `[TABELA CENOWA 42215]`
    → tabela jednego zestawu; `[TABELA CENOWA 42215, 42216]` → tabela zbiorcza
    (`scripts/remark-ceny.mjs`),
  - `[sprawdź aktualne ceny LEGO 12345 – link wewnętrzny]` → link do `/zestaw/12345/`,
  - `[zobacz kategorię LEGO <seria> – link wewnętrzny]` → link do `/serie/<slug>/`
    (seria spoza katalogu → `/serie/`),
  - obrazy `obrazy/…` → kopia do `materialy/obrazy-artykulow/<slug>/` i znacznik
    `<!-- OBRAZ n -->` w treści, tak jak przy DOCX (decyzja redakcyjna: SVG, <img> czy pominąć).

Czego NIE robi: nie dobiera zdjęć zestawów, okładki poza pierwszym zestawem z bloku,
galerii ani linków do sklepów — to robi sesja według `redakcja/`.

Użycie:
  python3 scripts/import-artykul-md.py plik.md                     # markdown na stdout
  python3 scripts/import-artykul-md.py plik.md --wyjscie a.md      # do pliku
  python3 scripts/import-artykul-md.py plik.md --slug moj-slug --sucho
"""

import argparse, datetime, json, os, re, shutil, sys, unicodedata

KATALOG = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KATEGORIE = ['Aktualności', 'Premiery', 'Recenzje', 'Rankingi', 'Porównania', 'Poradniki', 'Kalendarze', 'Historyczne']
# te same aliasy co w import-karty.py: nazwa marketingowa serii → klucz w katalog.json
SERIA_ALIASY = {
    'DC / Batman': 'Batman', 'DC': 'Batman', 'Chinese Festivals': 'Seasonal',
    'Sonic the Hedgehog': 'Sonic', 'ONE PIECE': 'One Piece', 'Creator 3 w 1': 'Creator',
    'Nike x LEGO Collection': 'Nike x LEGO', 'NINJAGO': 'Ninjago',
}
LINK = r'\s+[–-]\s+link wewnętrzny\]'


def slugify(tekst):
    t = tekst.lower()
    for a, b in zip('ąćęłńóśźż', 'acelnoszz'):
        t = t.replace(a, b)
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', t)).strip('-')[:70]


def slug_serii(seria):
    s = unicodedata.normalize('NFD', seria.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'\s+', '-', s.strip())


def serie_katalogu():
    with open(os.path.join(KATALOG, 'src', 'data', 'katalog.json'), encoding='utf-8') as f:
        return [k for k, v in json.load(f).items() if isinstance(v, list)]


def link_serii(nazwa, serie):
    s = SERIA_ALIASY.get(re.sub(r'^LEGO\s+', '', nazwa).strip(), re.sub(r'^LEGO\s+', '', nazwa).strip())
    trafiona = next((k for k in serie if k.lower() == s.lower()), None)
    return f'/serie/{slug_serii(trafiona)}/' if trafiona else '/serie/'


def kategoria_z_nazwy(plik):
    czlon = re.split(r'_', os.path.basename(plik))
    if czlon[0] == 'Recenzje':
        return 'Recenzje'
    if len(czlon) > 1:
        k = unicodedata.normalize('NFC', czlon[1])
        return next((x for x in KATEGORIE if x.lower() == k.lower()), k)
    return None


def czytaj_blok(linie):
    """Zwraca (dane, linie bez bloku)."""
    try:
        start = next(i for i, l in enumerate(linie) if l.strip() == '[DANE DLA SERWISU]')
    except StopIteration:
        return {}, linie
    koniec = next((i for i in range(start, len(linie)) if linie[i].strip() == '[KONIEC DANYCH DLA SERWISU]'), len(linie) - 1)
    dane, faq, pyt = {}, [], None
    for l in linie[start + 1:koniec]:
        l = l.strip()
        if not l:
            continue
        m = re.match(r'^(Opis|Tytuł SEO|Kategoria|Zestawy|Ważne do)\s*:\s*(.*)$', l)
        if m:
            dane[m.group(1)] = m.group(2).strip()
        elif re.match(r'^P\s*:', l):
            pyt = l.split(':', 1)[1].strip()
        elif re.match(r'^O\s*:', l) and pyt:
            faq.append({'q': pyt, 'a': l.split(':', 1)[1].strip()})
            pyt = None
    if faq:
        dane['FAQ'] = faq
    return dane, linie[:start] + linie[koniec + 1:]


def yaml_tekst(t):
    return '"' + t.replace('\\', '\\\\').replace('"', '\\"') + '"'


def importuj(plik, slug=None, zapisuj=True):
    with open(plik, encoding='utf-8') as f:
        linie = f.read().replace('\r\n', '\n').split('\n')
    uwagi = []
    dane, linie = czytaj_blok(linie)
    while linie and not linie[0].strip():
        linie.pop(0)
    if not linie or not linie[0].startswith('# '):
        raise SystemExit('Pierwszy wiersz pliku powinien być „# Tytuł”.')
    tytul = linie.pop(0)[2:].strip()
    slug = slug or slugify(tytul)
    tresc = '\n'.join(linie).strip()

    zestawy = re.findall(r'\d{4,7}', dane.get('Zestawy', ''))
    kategoria = dane.get('Kategoria') or kategoria_z_nazwy(plik)
    if kategoria not in KATEGORIE:
        uwagi.append(f'kategoria „{kategoria}” spoza listy {KATEGORIE}')

    # tabele cen
    def tabela(m):
        nry = re.findall(r'\d{4,7}', m.group(1) or '') or zestawy[:1]
        if not nry:
            uwagi.append('[TABELA CENOWA] bez numeru, a blok danych nie podaje zestawów — znacznik zostawiony')
            return m.group(0)
        return f'<div class="ceny-setu" data-set="{",".join(nry)}"></div>'
    tresc = re.sub(r'\[TABELA CENOWA((?:\s+\d{4,7}\s*,?)*)\s*\]', tabela, tresc)

    # linki wewnętrzne
    serie = serie_katalogu()
    tresc = re.sub(r'\[(sprawdź aktualne ceny LEGO (\d{4,7}))' + LINK, r'[\1](/zestaw/\2/)', tresc)
    tresc = re.sub(r'\[(zobacz kategorię (LEGO [^\]]+?))' + LINK,
                   lambda m: f'[{m.group(1)}]({link_serii(m.group(2), serie)})', tresc)
    for m in re.finditer(r'\[[^\]]*link wewnętrzny\]', tresc):
        uwagi.append(f'nierozpoznany znacznik: {m.group(0)}')

    # obrazy z folderu obrazy/ obok pliku
    obrazy = []
    def obraz(m):
        src = os.path.join(os.path.dirname(os.path.abspath(plik)), m.group(2))
        nazwa = f'{slug}-{len(obrazy) + 1}{os.path.splitext(src)[1]}'
        cel = os.path.join(KATALOG, 'materialy', 'obrazy-artykulow', slug, nazwa)
        if not os.path.exists(src):
            uwagi.append(f'brak pliku obrazu: {m.group(2)}')
        elif zapisuj:
            os.makedirs(os.path.dirname(cel), exist_ok=True)
            shutil.copyfile(src, cel)
        obrazy.append(nazwa)
        return (f'<!-- OBRAZ {len(obrazy)}: materialy/obrazy-artykulow/{slug}/{nazwa} „{m.group(1)}” '
                f'— decyzja redakcyjna: SVG, <img> czy pominąć -->')
    tresc = re.sub(r'!\[([^\]]*)\]\((?!/|https?:)([^)\s]+)\)', obraz, tresc)

    opis = dane.get('Opis', '')
    if not opis:
        uwagi.append('brak „Opis” w bloku danych — uzupełnij `opis` ręcznie')
    if len(opis) > 160:
        uwagi.append(f'opis ma {len(opis)} znaków (limit 160)')
    if len(dane.get('Tytuł SEO', '')) > 60:
        uwagi.append(f'tytuł SEO ma {len(dane["Tytuł SEO"])} znaków (limit 60)')
    if len(tytul) > 60 and not dane.get('Tytuł SEO'):
        uwagi.append(f'tytuł ma {len(tytul)} znaków, a blok nie podaje „Tytuł SEO”')

    fm = ['---', 'layout: ../../layouts/Artykul.astro', f'title: {yaml_tekst(tytul)}', f'opis: {yaml_tekst(opis)}']
    if dane.get('Tytuł SEO'):
        fm.append(f'seo_tytul: {yaml_tekst(dane["Tytuł SEO"])}')
    fm += [f'data: "{datetime.date.today().isoformat()}"', f'kategoria: {yaml_tekst(kategoria or "")}']
    wazne = dane.get('Ważne do', '')
    if wazne:
        if re.fullmatch(r'\d{4}-\d{2}-\d{2}', wazne):
            fm.append(f'wazne_do: "{wazne}"')
        else:
            uwagi.append(f'„Ważne do” w formacie RRRR-MM-DD, jest: {wazne}')
    if zestawy:
        fm += [f'okladka: "{zestawy[0]}"', 'zestawy: [' + ', '.join(f'"{n}"' for n in zestawy) + ']']
    elif kategoria == 'Aktualności':
        uwagi.append('Aktualności wymagają pola okladka (build odrzuci tekst) — blok danych nie podaje zestawów')
    if dane.get('FAQ'):
        fm.append('faq:')
        for p in dane['FAQ']:
            fm += [f'  - q: {yaml_tekst(p["q"])}', f'    a: {yaml_tekst(p["a"])}']
    fm.append('---')
    return {'tytul': tytul, 'slug': slug, 'kategoria': kategoria, 'zestawy': zestawy,
            'markdown': '\n'.join(fm) + '\n\n' + tresc, 'obrazy': obrazy, 'uwagi': uwagi}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('plik')
    p.add_argument('--slug', default=None)
    p.add_argument('--wyjscie', default=None)
    p.add_argument('--sucho', action='store_true', help='nie zapisuj obrazów ani markdownu')
    a = p.parse_args()
    w = importuj(a.plik, a.slug, zapisuj=not a.sucho)
    print(f'Tytuł: {w["tytul"]}\nSlug:  {w["slug"]}\nKategoria: {w["kategoria"]} · zestawy: {", ".join(w["zestawy"]) or "—"} '
          f'· obrazy: {len(w["obrazy"])}', file=sys.stderr)
    for u in w['uwagi']:
        print(f'UWAGA: {u}', file=sys.stderr)
    if a.sucho:
        print('--sucho: nic nie zapisano.', file=sys.stderr)
        return
    if a.wyjscie:
        with open(a.wyjscie, 'w', encoding='utf-8') as f:
            f.write(w['markdown'] + '\n')
        print(f'Markdown: {a.wyjscie}', file=sys.stderr)
    else:
        print(w['markdown'])


if __name__ == '__main__':
    main()
