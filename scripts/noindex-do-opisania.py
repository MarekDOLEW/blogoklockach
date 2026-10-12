#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Huby z `noindex` — kolejka do opisania, od najnowszych po najstarsze.

Czym różni się od `bez-opisu-od-najnowszych.py`: tamten arkusz pyta „co z rzeczy
w sprzedaży nie ma jeszcze tekstu" i obejmuje 1 173 zestawy z `sety.json`.
Ten patrzy na WSZYSTKIE huby i wybiera te, które Google widzi jako `noindex` —
8 tysięcy stron, które istnieją, ale nie wchodzą do indeksu.

Źródłem prawdy jest `ocenaHubu()` z `src/lib/seo.js` — ta sama funkcja, która
w buildzie stawia `noindex`. Skrypt nie powtarza reguły: pyta ją przez
`scripts/ocena-hubow.mjs` (vite + konfiguracja Astro) i tylko układa wynik
w arkusz. Do 12.10.2026 trzymał tu własną kopię reguły i rozjechał się przy
pierwszej zmianie (02.10): pisał „sam opis nie wystarczy" i liczył premierę
z 365 dni zamiast 18 miesięcy. Wymaga świeżego `npm run build` (lista hubów).

Jak hub wychodzi z noindex (stan od 02.10.2026): **trzy z czterech** warunków
(≥3 sklepy bez Ceneo, opis >300 znaków, ≥1 tekst redakcyjny o zestawie, premiera
z ostatnich 18 miesięcy i zestaw nie wycofany) ALBO jeden z wyjątków: prezentownik,
gorący deal, karta Piotra (≥2 akapity + ≥3 FAQ) albo **własny opis w `sety.json`**
(opis + dla_rodzica + dla_afol razem >300 znaków, nie przeciek).

**Najkrótsza droga to dziś własny opis w `sety.json`** — wystarcza sam, bez sklepów
i tekstów. Zestaw spoza `sety.json` trzeba tam najpierw dopisać (wpis z danymi
katalogowymi), dlatego arkusz ma osobną kolumnę „Najkrótsza droga".

Użycie:
  npm run build && python3 scripts/noindex-do-opisania.py
  python3 scripts/noindex-do-opisania.py --ile 40     # tylko podgląd w konsoli
"""
import argparse, json, os, re, sys, datetime
from collections import Counter

BAZA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
czytaj = lambda n: json.load(open(os.path.join(BAZA, 'src/data', n), encoding='utf-8'))

sety = czytaj('sety.json')
katalog = czytaj('katalog.json')
opisy = czytaj('opisy.json')
karty = czytaj('karty_setow.json')
feed = czytaj('oferty_feed.json').get('sety', {})
rrp_potw = czytaj('rrp_potwierdzone.json')
ceny_baza = czytaj('ceny_baza.json')

DZIS = datetime.date.today()

kat_idx = {}
for seria, lista in katalog.items():
    if seria == '_meta' or not isinstance(lista, list):
        continue
    for s in lista:
        kat_idx[str(s.get('numer'))] = dict(s, seria=seria)


def swieza(data, dni=14):
    if not data:
        return True
    try:
        return (DZIS - datetime.date.fromisoformat(data)).days <= dni
    except ValueError:
        return True


def sklepy(nr):
    z = set()
    w = feed.get(nr) or {}
    daty = w.get('daty') or {}
    for sk, c in (w.get('oferty') or {}).items():
        if sk != 'ceneo' and c and swieza(daty.get(sk)):
            z.add(sk)
    for o in (sety.get(nr, {}).get('oferty') or []):
        if o.get('sklep') != 'ceneo' and o.get('cena') and swieza(o.get('data')):
            z.add(o['sklep'])
    return z


def ma_karte(nr):
    k = karty.get(nr) or {}
    return len(k.get('akapity') or []) >= 2 and len(k.get('faq') or []) >= 3


def dlugosc_opisu(nr):
    for zrodlo in (sety.get(nr, {}).get('opis'), opisy.get(nr)):
        if isinstance(zrodlo, str):
            return len(zrodlo)
        if isinstance(zrodlo, dict) and isinstance(zrodlo.get('tekst'), str):
            return len(zrodlo['tekst'])
    return 0


def premiera(nr):
    return sety.get(nr, {}).get('premiera') or (kat_idx.get(nr) or {}).get('premiera') or ''


def rok(nr):
    p = premiera(nr)
    if p[:4].isdigit():
        return int(p[:4])
    return (kat_idx.get(nr) or {}).get('rok') or 0


def cena_katalogowa(nr):
    return (rrp_potw.get(nr) or {}).get('cena') or sety.get(nr, {}).get('cena_katalogowa') \
        or (ceny_baza.get(nr) or {}).get('cena_katalogowa') or (kat_idx.get(nr) or {}).get('cena_katalogowa')


def ocena_hubow():
    import subprocess, tempfile
    plik = os.path.join(tempfile.gettempdir(), 'ocena-hubow.json')
    r = subprocess.run(['node', os.path.join(BAZA, 'scripts/ocena-hubow.mjs'), plik])
    if r.returncode:
        sys.exit('scripts/ocena-hubow.mjs nie zadziałał — patrz komunikat wyżej.')
    with open(plik, encoding='utf-8') as f:
        return json.load(f)


ETYKIETY = {'sklepy': 'sklepy (≥3)', 'opis': 'opis >300 znaków', 'tekst': 'tekst redakcyjny',
            'premiera': 'premiera z 18 mies.'}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--ile', type=int, default=0, help='podgląd w konsoli zamiast arkusza')
    a = p.parse_args()

    # Tylko prawdziwe numery zestawów. W katalogu siedzą też kody gadżetów
    # i pozycji serwisowych (L0002291, PONDDUCK, MCPIG) — mają huby, ale nie są
    # zestawami do opisania i zaśmiecałyby górę listy.
    NUMER = re.compile(r'^\d{4,7}$')
    ocena = ocena_hubow()
    wiersze = []
    for nr, o in ocena.items():
        if o['indeksowalny'] or not NUMER.match(nr):
            continue
        s = sety.get(nr, {})
        k = kat_idx.get(nr, {})
        szt = sklepy(nr)
        brakuje = [ETYKIETY[w] for w, ok in o['warunki'].items() if not ok]
        if nr in sety:
            droga = 'własny opis >300 znaków w sety.json'
        elif o['spelnione'] == 2:
            droga = 'jeszcze jeden warunek: ' + ' albo '.join(brakuje)
        else:
            droga = 'wpis w sety.json + opis albo karta Piotra'
        wiersze.append({
            'numer': nr,
            'nazwa': s.get('nazwa') or k.get('nazwa') or '',
            'seria': s.get('seria') or k.get('seria') or '',
            'premiera': premiera(nr) or '',
            'rok': rok(nr),
            'elementy': s.get('elementy') or k.get('elementy') or '',
            'rrp': cena_katalogowa(nr) or '',
            'sklepy': len(szt),
            'znaki_opisu': dlugosc_opisu(nr),
            'karta': 'tak' if ma_karte(nr) else '—',
            'spelnione': o['spelnione'],
            'brakuje': ', '.join(brakuje) or '—',
            'droga': droga,
            'podstrona': f'/zestaw/{nr}/',
        })

    # Kolejność: najpierw zestawy z ≥3 sklepami (czytelnik ma z czego wybierać,
    # a hub wejdzie do indeksu po samym opisie), potem z jakąkolwiek ofertą,
    # na końcu bez ofert; w każdej grupie od najnowszych.
    wiersze.sort(key=lambda w: (w['sklepy'] >= 3, w['sklepy'] > 0, w['premiera'] or f'{w["rok"]}-00-00', w['numer']), reverse=True)

    print(f'Hubów z noindex: {len(wiersze)}', file=sys.stderr)
    print('roczniki:', dict(sorted(Counter(w['rok'] for w in wiersze).items(), reverse=True)[:8]), file=sys.stderr)
    print('serie:', Counter(w['seria'] for w in wiersze).most_common(8), file=sys.stderr)
    print(f'z ≥3 sklepami (wystarczy opis): {sum(1 for w in wiersze if w["sklepy"] >= 3)}', file=sys.stderr)

    if a.ile:
        print(f'{"numer":8s} {"premiera":11s} {"seria":18s} {"nazwa":38s} {"sklepy":>6s} {"war.":>4s}  najkrótsza droga')
        for w in wiersze[:a.ile]:
            print(f'{w["numer"]:8s} {(w["premiera"] or str(w["rok"])):11s} {w["seria"][:18]:18s} '
                  f'{w["nazwa"][:38]:38s} {w["sklepy"]:6d} {w["spelnione"]:4d}  {w["droga"]}')
        return

    from openpyxl import Workbook
    from openpyxl.styles import Font, Alignment, PatternFill
    wb = Workbook()
    ws = wb.active
    ws.title = 'noindex — od najnowszych'
    naglowki = ['Numer', 'Nazwa', 'Seria', 'Premiera', 'Rok', 'Elementy', 'Cena katalogowa (zł)',
                'Sklepy dziś', 'Znaki opisu', 'Karta Piotra', 'Warunki spełnione (z 4)',
                'Czego brakuje (z 4 warunków)', 'Najkrótsza droga do indeksu', 'Podstrona']
    ws.append(naglowki)
    for kom in ws[1]:
        kom.font = Font(bold=True, color='FFFFFF')
        kom.fill = PatternFill('solid', fgColor='17233F')
        kom.alignment = Alignment(vertical='center', wrap_text=True)
    for w in wiersze:
        ws.append([w['numer'], w['nazwa'], w['seria'], w['premiera'], w['rok'], w['elementy'], w['rrp'],
                   w['sklepy'], w['znaki_opisu'], w['karta'], w['spelnione'], w['brakuje'], w['droga'], w['podstrona']])
    for i, szer in enumerate([10, 42, 18, 12, 7, 10, 18, 11, 12, 13, 14, 40, 36, 20], start=1):
        ws.column_dimensions[chr(64 + i) if i <= 26 else 'A'].width = szer
    ws.freeze_panes = 'A2'
    sciezka = os.path.join(BAZA, 'materialy/zestawy-noindex.xlsx')
    wb.save(sciezka)
    print(f'zapisane: {sciezka} | pozycji: {len(wiersze)}', file=sys.stderr)


if __name__ == '__main__':
    main()
