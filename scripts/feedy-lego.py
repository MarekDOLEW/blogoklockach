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

# Oferty, które NIE są zestawem, choć tytuł zaczyna się od „LEGO" i niesie numer:
# pojedyncze minifigurki (kod katalogowy sw1160 / njo104 / hp200 / cty0123),
# instrukcje, pudełka, naklejki, części na wagę. Taka aukcja bierze numer setu
# z tytułu i udaje deal rzędu −45%.
#
# Wzorzec kodu minifigurki wszedł 16.09.2026 po wycieku „Lego min­ifgurka sw1160"
# (415 zł, udawało −44,6% na 75315) — literówka w słowie „minifigurka" omijała
# filtr po słowach, ale kod `sw1160` w tytule jest jednoznaczny. Oba testy
# stosujemy razem: słowo albo kod.
WZORZEC_KOD_MINIFIGURKI = re.compile(
    r'\b(?:sw|njo|hp|cty|col|sh|iaj|tlm|dis|hs|loc|nex|elf|frnd|twn|cas|pi|gs|adp|idea|mk)\d{2,4}[a-z]?\b',
    re.IGNORECASE,
)
SLOWA_NIE_ZESTAW = re.compile(
    r'minifig|figurka\s+lego|instrukcj|pude[lł]k|naklejk|breloc|zestaw\s+cz[eę][sś]ci|cz[eę][sś]ci\s+lego|luzem|na\s+wag[eę]',
    re.IGNORECASE,
)


def nie_zestaw(nazwa):
    """Czy tytuł oferty to nie zestaw, tylko minifigurka/część/instrukcja."""
    tekst = (nazwa or '').replace('\u00ad', '')   # miękki dywiz z tytułów Allegro
    return bool(WZORZEC_KOD_MINIFIGURKI.search(tekst) or SLOWA_NIE_ZESTAW.search(tekst))
G = '{http://base.google.com/ns/1.0}'


def pobierz(url, sufiks):
    """Pobiera plik curl-em (wyjście sieciowe środowiska idzie przez proxy).

    --fail zamienia HTTP 4xx/5xx na błąd curla, a kontrola rozmiaru łapie
    pusty plik przy kodzie 200 — oba przypadki mają wylądować w _meta.bledy
    zamiast przejść po cichu jako „0 ofert" (tak 10–11.09.2026 wygasający
    feed Allegro przez dwa dni wyglądał na zdrowy).
    """
    sciezka = os.path.join(tempfile.gettempdir(), f'feed-lego{sufiks}')
    subprocess.run(['curl', '-sL', '--fail', '--max-time', '900', url, '-o', sciezka], check=True)
    if os.path.getsize(sciezka) == 0:
        raise RuntimeError(f'pusty plik z {url}')
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
            # Od 11.09.2026 feed to cała kategoria Dziecko (stary feed LEGO
            # wygaszony przy migracji feedów Allegro), więc najpierw brama
            # marki: atrybut Marka (id 248811) = LEGO albo nazwa od "LEGO".
            # Bez niej atrybut "Numer produktu" wpuszczałby podróbki klocków
            # z numerami łudząco podobnymi do setów.
            marka = None
            nr = None
            for atrybut in o.get('attributes', []) or []:
                ident = str(atrybut.get('id'))
                if ident == '248811':
                    wartosci = atrybut.get('values') or []
                    marka = str(wartosci[0]) if wartosci else None
                elif ident == '201105':
                    # atrybut "Numer produktu" ma pierwszeństwo przed regexem z nazwy
                    wartosci = atrybut.get('values') or []
                    if wartosci:
                        znaleziony = re.search(r'\b(\d{4,7})\b', str(wartosci[0]))
                        nr = znaleziony.group(1) if znaleziony else None
            if (marka or '').strip().upper() != 'LEGO' and not nazwa.upper().startswith('LEGO'):
                continue
            if not nr:
                dopasowanie = WZORZEC_LEGO.match(nazwa)
                nr = dopasowanie.group(1) if dopasowanie else None
            if not nr or nie_zestaw(nazwa):
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


def odswiez_redirects(wynik):
    """Wpisuje do redirects.json dzisiejsze adresy kart produktów z feedów.

    Powód (18.09.2026): mapy linków rosły, ale nigdy się nie odświeżały — wpis raz
    zapisany zostawał na zawsze, także gdy sklep zmienił adres karty. Kontrola
    linków znalazła 43024 w Planecie Klocków: nasz link dawał 404, a feed z tego
    samego dnia miał poprawny, dłuższy adres. Różnic było 3 na 1 307 zestawów
    obecnych w feedzie — mało, ale każda to czytelnik wysłany na 404.

    „Append-only" znaczy, że nie wolno KASOWAĆ wpisów. Aktualizacja adresu tego
    samego zestawu w tym samym sklepie nie jest kasowaniem — liczba wpisów nigdy
    nie maleje i skrypt to sprawdza.
    """
    sciezka = os.path.join(KATALOG, 'src/data/redirects.json')
    with open(sciezka, encoding='utf-8') as f:
        redirects = json.load(f)
    zmiany, nowe = {}, {}
    for sklep in ('mediaexpert', 'planetaklockow', 'allegro'):
        mapa = redirects.setdefault(sklep, {})
        przed = len(mapa)
        for nr, oferta in (wynik.get(sklep) or {}).items():
            link = (oferta.get('link') or '').strip()
            if not link:
                continue
            if nr not in mapa:
                mapa[nr] = link
                nowe[sklep] = nowe.get(sklep, 0) + 1
            elif mapa[nr] != link:
                mapa[nr] = link
                zmiany[sklep] = zmiany.get(sklep, 0) + 1
        if len(mapa) < przed:  # nie powinno się zdarzyć — pilnujemy tego wprost
            raise RuntimeError(f'redirects.{sklep}: liczba wpisów zmalała {przed} -> {len(mapa)}')
    with open(sciezka, 'w', encoding='utf-8') as f:
        json.dump(redirects, f, ensure_ascii=False, indent=1)
        f.write('\n')
    return nowe, zmiany


def feedy_td_codzienne():
    """Feedy Tradedoublera oznaczone w feedy.json jako codzienne.

    Te feedy importuje `scripts/ceneo-feed.mjs`, który sam zapisuje dane serwisu
    (redirects, oferty_feed, sety) — nie przechodzą więc przez wyciąg w /tmp.
    Wołamy je stąd, bo Łowca i tak uruchamia ten skrypt codziennie, a prompt
    Routine'a jest w stałej sesji (zmiana = delete + create). Dzięki temu
    częstotliwość sklepu jest decyzją w danych, nie w promptach — tak jak mówi
    `_meta` w feedy.json. Sklep przestawia się na codzienny jednym polem:
    "odswiezanie": "codziennie".
    """
    return [k for k, v in FEEDY.items()
            if isinstance(v, dict)
            and str(v.get('siec', '')).startswith('Tradedoubler')
            and v.get('aktywny')
            and v.get('odswiezanie') == 'codziennie']


def importuj_feed_td(sklep):
    """Uruchamia importer TD dla jednego sklepu. Zwraca (ok, ostatnia_linia)."""
    wynik = subprocess.run(
        ['node', 'scripts/ceneo-feed.mjs', '--sklep', sklep],
        cwd=KATALOG, capture_output=True, text=True, timeout=600,
    )
    wyjscie = (wynik.stdout or '') + (wynik.stderr or '')
    linie = [l.strip() for l in wyjscie.splitlines() if l.strip()]
    return wynik.returncode == 0, (linie[-1] if linie else 'brak wyjścia')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--wyjscie', default='/tmp/feedy-lego.json')
    parser.add_argument('--tylko', default='', help='lista sklepów po przecinku')
    parser.add_argument('--bez-td', action='store_true', help='pomiń import feedów Tradedoublera')
    parser.add_argument('--tylko-td', action='store_true', help='TYLKO import feedów TD (bez pobierania wielkich feedów)')
    args = parser.parse_args()

    wybrane = [] if args.tylko_td else ([s.strip() for s in args.tylko.split(',') if s.strip()] or list(ZRODLA))
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

    # Adresy kart produktów z dzisiejszych feedów — zanim Łowca zacznie liczyć ceny.
    if wybrane and not args.tylko_td:
        try:
            nowe_linki, zmiany_linkow = odswiez_redirects(wynik)
            wynik['_meta']['redirects'] = {'nowe': nowe_linki, 'zmienione': zmiany_linkow}
            print(f'redirects: nowe {nowe_linki or "—"}, zmienione {zmiany_linkow or "—"}', file=sys.stderr)
        except Exception as blad:
            wynik['_meta']['bledy']['redirects'] = str(blad)
            print(f'redirects: BŁĄD — {blad}', file=sys.stderr)

    # Feedy TD (dziś: Lidl) — importer zapisuje dane serwisu sam, więc nie wchodzą
    # do wyciągu. Błąd jednego feedu nie może przerwać reszty przebiegu Łowcy.
    if not args.bez_td:
        wynik['_meta']['td'] = {}
        for sklep in feedy_td_codzienne():
            try:
                ok, podsumowanie = importuj_feed_td(sklep)
            except Exception as blad:
                ok, podsumowanie = False, str(blad)
            wynik['_meta']['td'][sklep] = podsumowanie
            if not ok:
                wynik['_meta']['bledy'][f'td:{sklep}'] = podsumowanie
            print(f'td:{sklep}: {"ok" if ok else "BŁĄD"} — {podsumowanie}', file=sys.stderr)

    # Historia cen — jedna linia na zestaw tylko wtedy, gdy cena się ruszyła.
    # Tu, bo Łowca uruchamia ten skrypt codziennie po imporcie feedów, a seria
    # czasowa ma sens wyłącznie wtedy, gdy zbiera się bez przerw.
    try:
        h = subprocess.run(['node', 'scripts/historia-cen.mjs'], cwd=KATALOG,
                           capture_output=True, text=True, timeout=180)
        linia = [l for l in (h.stdout or '').splitlines() if l.strip()]
        wynik['_meta']['historia_cen'] = linia[-1] if linia else 'brak wyjścia'
        if h.returncode != 0:
            wynik['_meta']['bledy']['historia_cen'] = (h.stderr or '').strip()[:200]
        print(f'historia-cen: {wynik["_meta"]["historia_cen"]}', file=sys.stderr)
    except Exception as blad:
        wynik['_meta']['bledy']['historia_cen'] = str(blad)
        print(f'historia-cen: BŁĄD — {blad}', file=sys.stderr)

    if args.tylko_td:
        print('--tylko-td: wyciągu nie zapisuję.', file=sys.stderr)
        sys.exit(0)

    with open(args.wyjscie, 'w', encoding='utf-8') as f:
        json.dump(wynik, f, ensure_ascii=False)
    print(f'Zapisano {args.wyjscie} ({os.path.getsize(args.wyjscie)//1024} kB)', file=sys.stderr)
