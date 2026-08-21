#!/usr/bin/env python3
"""Wyciąga z feedów sklepowych WYŁĄCZNIE oferty LEGO i zapisuje je jako jeden
kompaktowy plik JSON (~kilkaset kB zamiast setek MB).

Powód: feed Media Expert waży ~600 MB, a interesuje nas z niego ~750 pozycji.
Łowca Promocji zamiast parsować surowe feedy w każdym przebiegu (drogo, dużo
prób i błędów) uruchamia ten skrypt i pracuje na gotowym wyciągu.

Użycie:
    python3 scripts/feedy-lego.py [--wyjscie plik.json] [--tylko mediaexpert,allegro]

Wynik: {"_meta": {...}, "mediaexpert": {"<nr>": {...}}, "planetaklockow": {...}, "allegro": {...}}
Pole oferty: cena (float), link (afiliacyjny), zdjecie, dostepny (bool), nazwa.
Zasady dopasowania numeru setu są takie same jak w src/data/feedy.json.
"""

import argparse, json, os, re, subprocess, sys, tempfile, xml.etree.ElementTree as ET
from datetime import date

KATALOG = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEEDY = json.load(open(os.path.join(KATALOG, 'src/data/feedy.json'), encoding='utf-8'))

# numer setu tylko z tytułu zaczynającego się od "LEGO <numer>" — inaczej do wyników
# wpadają puzzle i gry innych marek z czterocyfrowym numerem w nazwie
WZORZEC_LEGO = re.compile(r'^LEGO\b.*?\b(\d{4,7})\b', re.IGNORECASE)
G = '{http://base.google.com/ns/1.0}'


def pobierz(url, sufiks):
    """Pobiera plik curl-em (wyjście sieciowe środowiska idzie przez proxy)."""
    sciezka = os.path.join(tempfile.gettempdir(), f'feed-lego{sufiks}')
    subprocess.run(['curl', '-sL', '--max-time', '900', url, '-o', sciezka], check=True)
    return sciezka


def cena_liczba(tekst):
    if not tekst:
        return None
    czysty = re.sub(r'[^\d,.]', '', str(tekst).split()[0]).replace(',', '.')
    try:
        wartosc = float(czysty)
    except ValueError:
        return None
    return wartosc if wartosc > 0 else None


def z_mediaexpert():
    """Google Shopping XML, ~600 MB — parsowanie strumieniowe z czyszczeniem drzewa."""
    plik = pobierz(FEEDY['mediaexpert']['url'], '-me.xml')
    oferty, updated = {}, None
    for zdarzenie, el in ET.iterparse(plik, events=('end',)):
        tag = el.tag.split('}')[-1]
        if tag == 'updated' and updated is None:
            updated = (el.text or '').strip()
        if tag != 'entry':
            continue
        marka = (el.findtext(G + 'brand') or '').strip()
        tytul = (el.findtext(G + 'title') or '').strip()
        if marka.upper() == 'LEGO':
            dopasowanie = WZORZEC_LEGO.match(tytul)
            if dopasowanie:
                cena = cena_liczba(el.findtext(G + 'price'))
                if cena:
                    nr = dopasowanie.group(1)
                    dostepny = (el.findtext(G + 'availability') or '').strip() == 'In stock'
                    stara = oferty.get(nr)
                    if not stara or cena < stara['cena']:
                        oferty[nr] = {
                            'cena': cena,
                            'link': (el.findtext(G + 'link') or '').strip(),
                            'zdjecie': (el.findtext(G + 'image_link') or '').strip(),
                            'dostepny': dostepny,
                            'nazwa': tytul,
                        }
        el.clear()  # bez tego 600 MB ląduje w pamięci
    os.unlink(plik)
    return oferty, {'feed_updated': updated}


def z_planetyklockow():
    plik = pobierz(FEEDY['planetaklockow']['url'], '-pk.xml')
    oferty, wycofane = {}, []
    for zdarzenie, el in ET.iterparse(plik, events=('end',)):
        if el.tag.split('}')[-1] != 'offer':
            continue
        nazwa = (el.findtext('name') or '').strip()
        kategoria = (el.findtext('shopcategory') or '').strip()
        dopasowanie = WZORZEC_LEGO.match(nazwa)
        if dopasowanie and kategoria.startswith('Klocki LEGO'):
            nr = dopasowanie.group(1)
            cena = cena_liczba(el.findtext('price'))
            # 9999,99 zł w archiwum = pozycja niedostępna, nie oferta
            archiwum = 'wycofane z oferty' in kategoria.lower() or (cena or 0) > 9000
            if archiwum:
                wycofane.append(nr)
            elif cena:
                zdjecie = next((p.text for p in el.findall('property')
                                if p.get('name') == 'ImageOriginalUrl'), None)
                stara = oferty.get(nr)
                if not stara or cena < stara['cena']:
                    oferty[nr] = {
                        'cena': cena,
                        'link': (el.findtext('url') or '').strip(),
                        'zdjecie': (zdjecie or '').strip(),
                        'dostepny': True,
                        'nazwa': nazwa,
                    }
        el.clear()
    os.unlink(plik)
    return oferty, {'archiwum_eol': sorted(set(wycofane))}


def z_allegro():
    """NDJSON — jedna linia = jedna oferta; czytamy linia po linii."""
    plik = pobierz(FEEDY['allegro']['url'], '-allegro.ndjson')
    oferty = {}
    with open(plik, encoding='utf-8') as f:
        for linia in f:
            try:
                o = json.loads(linia)
            except json.JSONDecodeError:
                continue
            nazwa = (o.get('name') or '').strip()
            # atrybut "Numer produktu" ma pierwszeństwo przed regexem z nazwy
            nr = None
            for atrybut in o.get('attributes', []) or []:
                if str(atrybut.get('id')) == '201105':
                    wartosci = atrybut.get('values') or []
                    if wartosci:
                        znaleziony = re.search(r'\b(\d{4,7})\b', str(wartosci[0]))
                        nr = znaleziony.group(1) if znaleziony else None
                    break
            if not nr:
                dopasowanie = WZORZEC_LEGO.match(nazwa)
                nr = dopasowanie.group(1) if dopasowanie else None
            if not nr:
                continue
            cena = cena_liczba((o.get('price') or {}).get('value') if isinstance(o.get('price'), dict) else o.get('price'))
            if not cena:
                continue
            dostepny = str(o.get('availability', '')).lower() in ('in stock', 'in_stock')
            if not dostepny:
                continue
            stara = oferty.get(nr)
            if not stara or cena < stara['cena']:
                oferty[nr] = {
                    'cena': cena,
                    'link': (o.get('item_link') or '').strip(),
                    'zdjecie': (o.get('image_link') or '').strip(),
                    'dostepny': True,
                    'nazwa': nazwa,
                }
    os.unlink(plik)
    return oferty, {}


ZRODLA = {
    'mediaexpert': z_mediaexpert,
    'planetaklockow': z_planetyklockow,
    'allegro': z_allegro,
}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--wyjscie', default='/tmp/feedy-lego.json')
    parser.add_argument('--tylko', default='', help='lista sklepów po przecinku')
    args = parser.parse_args()

    wybrane = [s.strip() for s in args.tylko.split(',') if s.strip()] or list(ZRODLA)
    wynik = {'_meta': {'pobrano': date.today().isoformat(), 'liczby': {}, 'bledy': {}}}

    for sklep in wybrane:
        try:
            oferty, dodatki = ZRODLA[sklep]()
            wynik[sklep] = oferty
            wynik['_meta']['liczby'][sklep] = len(oferty)
            wynik['_meta'].update({f'{sklep}_{k}': v for k, v in dodatki.items()})
            print(f'{sklep}: {len(oferty)} setów', file=sys.stderr)
        except Exception as blad:  # feed niedostępny nie może przerwać pozostałych
            wynik['_meta']['bledy'][sklep] = str(blad)
            print(f'{sklep}: BŁĄD — {blad}', file=sys.stderr)

    with open(args.wyjscie, 'w', encoding='utf-8') as f:
        json.dump(wynik, f, ensure_ascii=False)
    print(f'Zapisano {args.wyjscie} ({os.path.getsize(args.wyjscie)//1024} kB)', file=sys.stderr)
