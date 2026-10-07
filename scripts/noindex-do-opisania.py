#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Huby z `noindex` — kolejka do opisania, od najnowszych po najstarsze.

Czym różni się od `bez-opisu-od-najnowszych.py`: tamten arkusz pyta „co z rzeczy
w sprzedaży nie ma jeszcze tekstu" i obejmuje 1 173 zestawy z `sety.json`.
Ten patrzy na WSZYSTKIE huby i wybiera te, które Google widzi jako `noindex` —
8 tysięcy stron, które istnieją, ale nie wchodzą do indeksu.

Źródłem prawdy o `noindex` jest **zbudowany serwis** (`dist/zestaw/<nr>/index.html`),
a nie powtórzona w Pythonie reguła z `src/lib/seo.js`. Powód: reguła ma cztery
warunki i trzy wyjątki, a dwie kopie tej samej logiki rozjeżdżają się przy
pierwszej zmianie. Skrypt wymaga więc świeżego `npm run build`.

Czego potrzeba, żeby hub wyszedł z noindex (`ocenaHubu`): **trzy z czterech**
warunków — ≥3 sklepy, opis dłuższy niż 300 znaków, ≥1 tekst redakcyjny wspominający
zestaw, świeża premiera — ALBO jeden z wyjątków: prezentownik, gorący deal,
karta Piotra (≥2 akapity + ≥3 pytania FAQ).

**To jest najważniejsza informacja praktyczna: sam opis nie wystarczy.** Opis
dopisany do huba bez ofert i bez tekstu daje jeden warunek z czterech. Kartę
Piotra wystarczy jedna. Dlatego arkusz pokazuje przy każdym zestawie, ile
warunków już ma i czego konkretnie brakuje.

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
PROG_PREMIERY = (DZIS - datetime.timedelta(days=365)).isoformat()

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


def huby_noindex():
    katalog_dist = os.path.join(BAZA, 'dist/zestaw')
    if not os.path.isdir(katalog_dist):
        sys.exit('Brak dist/zestaw — najpierw `npm run build`.')
    out = []
    for nr in os.listdir(katalog_dist):
        plik = os.path.join(katalog_dist, nr, 'index.html')
        if not os.path.exists(plik):
            continue
        with open(plik, encoding='utf-8') as f:
            if 'noindex' in f.read(4000):
                out.append(nr)
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--ile', type=int, default=0, help='podgląd w konsoli zamiast arkusza')
    a = p.parse_args()

    # Tylko prawdziwe numery zestawów. W katalogu siedzą też kody gadżetów
    # i pozycji serwisowych (L0002291, PONDDUCK, MCPIG) — mają huby, ale nie są
    # zestawami do opisania i zaśmiecałyby górę listy.
    NUMER = re.compile(r'^\d{4,7}$')
    wiersze = []
    for nr in huby_noindex():
        if not NUMER.match(nr):
            continue
        s = sety.get(nr, {})
        k = kat_idx.get(nr, {})
        szt = sklepy(nr)
        war = {
            'sklepy': len(szt) >= 3,
            'opis': dlugosc_opisu(nr) > 300,
            'premiera': bool(premiera(nr) and premiera(nr) >= PROG_PREMIERY),
        }
        spelnione = sum(war.values())          # bez warunku „tekst" – ten liczy build
        brakuje = []
        if not war['sklepy']:
            brakuje.append(f'sklepy ({len(szt)}/3)')
        if not war['opis']:
            brakuje.append('opis >300 znaków')
        if not war['premiera']:
            brakuje.append('świeża premiera')
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
            'spelnione': spelnione,
            'brakuje': ', '.join(brakuje) or '—',
            'podstrona': f'/zestaw/{nr}/',
        })

    # Kolejność: najpierw to, co realnie da się sprzedać (zestaw ma dziś oferty),
    # potem od najnowszych. Hub bez ani jednej oferty może mieć opis i tak nie
    # wejdzie do indeksu (potrzebuje trzech warunków z czterech), a czytelnik
    # i tak nie ma czego na nim kupić — takie zestawy zostają na końcu kolejki.
    wiersze.sort(key=lambda w: (w['sklepy'] > 0, w['premiera'] or f'{w["rok"]}-00-00', w['numer']), reverse=True)

    print(f'Hubów z noindex: {len(wiersze)}', file=sys.stderr)
    print('roczniki:', dict(sorted(Counter(w['rok'] for w in wiersze).items(), reverse=True)[:8]), file=sys.stderr)
    print('serie:', Counter(w['seria'] for w in wiersze).most_common(8), file=sys.stderr)
    print(f'z kartą Piotra (wystarczy do indeksu): {sum(1 for w in wiersze if w["karta"] == "tak")}', file=sys.stderr)

    if a.ile:
        print(f'{"numer":8s} {"premiera":11s} {"seria":18s} {"nazwa":38s} {"sklepy":>6s} {"opis":>5s}  brakuje')
        for w in wiersze[:a.ile]:
            print(f'{w["numer"]:8s} {(w["premiera"] or str(w["rok"])):11s} {w["seria"][:18]:18s} '
                  f'{w["nazwa"][:38]:38s} {w["sklepy"]:6d} {w["znaki_opisu"]:5d}  {w["brakuje"]}')
        return

    from openpyxl import Workbook
    from openpyxl.styles import Font, Alignment, PatternFill
    wb = Workbook()
    ws = wb.active
    ws.title = 'noindex — od najnowszych'
    naglowki = ['Numer', 'Nazwa', 'Seria', 'Premiera', 'Rok', 'Elementy', 'Cena katalogowa (zł)',
                'Sklepy dziś', 'Znaki opisu', 'Karta Piotra', 'Warunki spełnione (z 3 liczonych)',
                'Czego brakuje', 'Podstrona']
    ws.append(naglowki)
    for kom in ws[1]:
        kom.font = Font(bold=True, color='FFFFFF')
        kom.fill = PatternFill('solid', fgColor='17233F')
        kom.alignment = Alignment(vertical='center', wrap_text=True)
    for w in wiersze:
        ws.append([w['numer'], w['nazwa'], w['seria'], w['premiera'], w['rok'], w['elementy'], w['rrp'],
                   w['sklepy'], w['znaki_opisu'], w['karta'], w['spelnione'], w['brakuje'], w['podstrona']])
    for i, szer in enumerate([10, 42, 18, 12, 7, 10, 18, 11, 12, 13, 16, 34, 20], start=1):
        ws.column_dimensions[chr(64 + i) if i <= 26 else 'A'].width = szer
    ws.freeze_panes = 'A2'
    sciezka = os.path.join(BAZA, 'materialy/zestawy-noindex.xlsx')
    wb.save(sciezka)
    print(f'zapisane: {sciezka} | pozycji: {len(wiersze)}', file=sys.stderr)


if __name__ == '__main__':
    main()
