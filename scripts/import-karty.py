#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Import kart katalogowo-sprzedażowych Piotra (DOCX) do karty_setow.json.

Jedna ścieżka dla każdej paczki zipów — parsowanie, weryfikacja wobec danych
repo, znane korekty szablonu, akapity redakcyjne wg progu elementów i zapis
w formacie, którego Node nie umie utrzymać (klucze numeryczne + wcięcie 1,
bez końcowego \n — patrz RUNBOOK "Stabilność formatu plików JSON").

Struktura DOCX (paczka P07, 08.2026): nagłówek → "Opis zestawu" (akapity) →
"Metryka zestawu" (pary klucz/wartość) → "FAQ – zakup i dalsza nawigacja"
(pary pytanie/odpowiedź). Starsze paczki (City/Technic/SW) różniły się
frazami szablonu — wzorce gramatyki niżej obsługują obie generacje.

Weryfikacja (sekcja RAPORT przed zapisem):
  - RRP wobec łańcucha rrp_potwierdzone → sety → ceny_baza → katalog;
    rozjazd RRP BLOKUJE kartę (cena to serce serwisu, nie zgadujemy);
  - elementy/premiera/dystrybucja wobec sety.json i katalog.json — rozjazd
    NIE blokuje, ale ląduje w raporcie; rozstrzygaj Bricksetem
    (curl https://brickset.com/sets/<nr>-1, pola Launch/exit, Availability,
    Pieces) i poprawiaj dane PRZED importem — skrypt sam niczego nie zgaduje;
  - brak huba /zestaw/<nr>/ = karta bez strony — raportowane.

Korekty szablonu mail-merge (pola w dopełniaczu po "są/tworzą"):
  aplikowane tylko na dokładnym złączeniu fraza+wartość pola, każda wypisana.

Użycie:
  python3 scripts/import-karty.py <katalog-z-docx-lub-zip>... --sucho  # raport
  python3 scripts/import-karty.py <katalog-z-docx-lub-zip>...          # zapis
"""
import json, re, sys, zipfile, glob, os, collections, tempfile
from xml.etree import ElementTree as ET

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(REPO, 'src', 'data')
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

def czytaj(nazwa):
    with open(os.path.join(DATA, nazwa), encoding='utf-8') as f:
        return json.load(f, object_pairs_hook=collections.OrderedDict)

# ---------- parsowanie DOCX ----------
def akapity_docx(path):
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read('word/document.xml'))
    out = []
    for p in root.iter(W + 'p'):
        st = p.find('.//' + W + 'pStyle')
        styl = st.get(W + 'val') if st is not None else ''
        txt = ''.join(t.text or '' for t in p.iter(W + 't')).strip()
        if txt:
            out.append((styl, txt))
    return out

def parsuj(path):
    d = {'plik': os.path.basename(path), 'nr': None, 'akapity': [], 'metryka': collections.OrderedDict(), 'faq': []}
    sekcja = None; met = []; faq = []
    for styl, t in akapity_docx(path):
        if styl.startswith('Heading'):
            sekcja = ('opis' if 'Opis' in t else 'metryka' if 'Metryka' in t
                      else 'faq' if 'FAQ' in t else 'inne')
            continue
        if sekcja is None:
            m = re.match(r'LEGO (\d{4,5})$', t)
            if m: d['nr'] = m.group(1)
        elif sekcja == 'opis': d['akapity'].append(t)
        elif sekcja == 'metryka': met.append(t)
        elif sekcja == 'faq': faq.append(t)
    d['metryka'] = collections.OrderedDict((met[i], met[i+1]) for i in range(0, len(met)-1, 2))
    d['faq'] = [{'q': faq[i], 'a': faq[i+1]} for i in range(0, len(faq)-1, 2)]
    return d

# ---------- dane repo ----------
def zbuduj_kontekst():
    kat = czytaj('katalog.json'); sety = czytaj('sety.json')
    rp = czytaj('rrp_potwierdzone.json'); cb = czytaj('ceny_baza.json')
    feed = czytaj('oferty_feed.json').get('sety', {}); red = czytaj('redirects.json')
    wyc = {w['numer']: w for w in czytaj('wycofania.json')['wycofania']}
    wKat = {}
    for seria, l in kat.items():
        if isinstance(l, list):
            for x in l: wKat[x['numer']] = {**x, 'seriaKat': seria}
    def rrp(nr):
        for zrodlo in (rp.get(nr, {}).get('cena'), sety.get(nr, {}).get('cena_katalogowa'),
                       cb.get(nr, {}).get('cena_katalogowa'), wKat.get(nr, {}).get('cena_katalogowa')):
            if zrodlo: return zrodlo
        return None
    def ma_hub(nr):
        if nr in sety or nr in wyc: return True
        k = wKat.get(nr)
        if not k: return False
        f = feed.get(nr, {})
        ma_cene = bool(f.get('cena') or any(c > 0 for c in (f.get('oferty') or {}).values() if isinstance(c, (int, float))))
        ma_link = any(nr in (m or {}) for m in red.values())
        return ma_cene or ma_link or (k.get('status') == 'dostepny' and k.get('cena_katalogowa'))
    return {'kat': kat, 'sety': sety, 'wKat': wKat, 'rrp': rrp, 'ma_hub': ma_hub}

def slug_serii(seria):
    import unicodedata
    s = unicodedata.normalize('NFD', seria.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'\s+', '-', s.strip())

# ---------- transformacje ----------
def linkuj(t, seria_pelna, slug):
    s = seria_pelna.replace('LEGO ', '')
    t = re.sub(r'\[sprawdź aktualne ceny LEGO \d+ – link wewnętrzny\]',
               '<a href="#ceny">zobacz tabelę cen nad tym opisem</a>', t)
    t = re.sub(r'\[porównaj oferty LEGO \d+ – link wewnętrzny\]',
               '<a href="#ceny">porównaj oferty w tabeli nad opisem</a>', t)
    t = t.replace('[zobacz analizę ceny i próg zakupu – link wewnętrzny]',
                  '<a href="#ceny">sprawdź bieżące ceny na tle katalogowej w tabeli nad opisem</a>')
    t = re.sub(r'\[zobacz kategorię LEGO [^\]]+ – link wewnętrzny\]',
               f'<a href="/serie/{slug}/">zobacz wszystkie zestawy LEGO {s}</a>', t)
    return t

# fraza szablonu (przyjmuje mianownik) -> zamiennik przyjmujący dopełniacz;
# aplikowane WYŁĄCZNIE na złączeniu fraza+wartość pola "Powiązanie"
GRAMATYKA_POW = [
    ('Najbardziej naturalnym kierunkiem są ', 'Najbardziej naturalnym kierunkiem jest dokupienie '),
    ('Naturalnym kierunkiem są ', 'Naturalnym kierunkiem jest dokupienie '),
    ('Dobrym kierunkiem są ', 'Dobrym kierunkiem jest dokupienie '),
    ('Alternatywą mogą być ', 'Alternatywy warto szukać wśród '),
    ('Najbliższe tematycznie są ', 'Tematycznie najbliżej mu do '),
    ('Najbliższy kontekst tworzą ', 'Najbliższy kontekst zbudujesz z '),
    ('Naturalnym punktem odniesienia są ', 'Naturalnym punktem odniesienia jest porównanie do '),
]
# wartości pola-odbiorcy w dopełniaczu nie kleją się z "grupy, którą tworzą X" —
# "trafi do X" przyjmuje dopełniacz; wykrycie po pierwszym słowie wartości
DOPELNIACZ_1SLOWO = re.compile(r'^(rodzin|par|miłośników|fanów|kolekcjonerów|dorosłych|graczy|osób|dzieci,|dzieci\s+i\s+dorosłych)')

def gramatyka(t, powiazanie, log):
    if powiazanie:
        for a, b in GRAMATYKA_POW:
            if a + powiazanie in t:
                t = t.replace(a + powiazanie, b + powiazanie); log.append(f'„{a.strip()}…” → „{b.strip()}…”')
    m = re.search(r'trafi do grupy, którą tworzą ([^.]{0,80})', t)
    if m and DOPELNIACZ_1SLOWO.match(m.group(1)):
        t = t.replace('trafi do grupy, którą tworzą ', 'trafi do '); log.append('odbiorca w dopełniaczu → „trafi do …”')
    def obsada(m):
        w = m.group(1)
        jedn = (w.isdigit() and int(w) >= 5) or w in ('kilka', 'sześć', 'siedem', 'osiem', 'dziewięć',
                 'budowana', 'budowany', 'figurka', 'rodzina')
        if jedn: log.append(f'„Obsadę tworzą {w}” → „tworzy”')
        return ('Obsadę tworzy ' if jedn else 'Obsadę tworzą ') + w
    t = re.sub(r'Obsadę tworzą (\S+)', obsada, t)
    return t

def fmt_zl(x):
    return f'{x:,.2f}'.replace(',', ' ').replace('.', ',') + ' zł'

def akapity_redakcyjne(nr, seria_pelna, el, rrp, ctx):
    sk = ctx['wKat'].get(nr, {}).get('seriaKat')
    rocznik = [x for x in ctx['kat'].get(sk, []) if isinstance(x, dict) and x.get('rok') == 2026 and x.get('elementy')]
    s = seria_pelna.replace('LEGO ', ''); out = []
    if len(rocznik) >= 6 and el:
        wieksze = sorted([x for x in rocznik if x['elementy'] > el], key=lambda x: -x['elementy'])
        poz = len(wieksze) + 1
        zc = [x for x in rocznik if x.get('cena_katalogowa') and x.get('elementy')]
        med = sorted(x['cena_katalogowa'] / x['elementy'] for x in zc)[len(zc)//2] if zc else None
        cel = rrp / el if rrp else None
        a = (f'Na tle rocznika 2026 serii LEGO {s} to '
             + ('największy zestaw' if poz == 1 else f'{poz}. największy zestaw')
             + f' spośród {len(rocznik)}, o których wiemy w tym roku')
        if 1 < poz <= 3 and wieksze:
            w0 = wieksze[0]
            a += (f' — więcej elementów ma {"tylko " if poz == 2 else "m.in. "}'
                  f'<a href="/zestaw/{w0["numer"]}/">LEGO {w0["numer"]} {w0["nazwa"]}</a> ({w0["elementy"]} el.)')
        a += '.'
        if cel and med:
            rel = 'niżej' if cel < med else 'wyżej'
            a += (f' Przelicznik ceny katalogowej na element wypada u niego {rel} niż mediana serii'
                  f' ({cel:.2f} zł wobec {med:.2f} zł)'.replace('.', ',')
                  + ' — to miara pomocnicza, ale przy porównywaniu zestawów z jednej półki cenowej bywa pierwszą wskazówką.')
        out.append(a)
    if el and el > 1200 and rrp:
        sasiedzi = sorted([x for x in rocznik if x.get('cena_katalogowa') and x['numer'] != nr],
                          key=lambda x: abs(x['cena_katalogowa'] - rrp))[:2]
        if len(sasiedzi) == 2:
            a, b = sasiedzi
            out.append(
                f'Jeśli budżet jest ustalony, naturalne punkty porównania w tej samej serii to '
                f'<a href="/zestaw/{a["numer"]}/">LEGO {a["numer"]} {a["nazwa"]}</a> ({fmt_zl(a["cena_katalogowa"])} katalogowo) '
                f'i <a href="/zestaw/{b["numer"]}/">LEGO {b["numer"]} {b["nazwa"]}</a> ({fmt_zl(b["cena_katalogowa"])}). '
                f'Różnią się charakterem, więc przed zakupem warto zestawić nie tylko ceny, '
                f'ale i to, co z każdego pudełka realnie trafia na półkę.')
    return out

# ---------- główny przebieg ----------
def main():
    argv = [a for a in sys.argv[1:] if not a.startswith('--')]
    sucho = '--sucho' in sys.argv
    if not argv:
        print(__doc__); sys.exit(1)
    pliki = []
    tmp = tempfile.mkdtemp(prefix='karty-')
    for a in argv:
        if a.endswith('.zip'):
            with zipfile.ZipFile(a) as z: z.extractall(tmp)
            pliki += glob.glob(os.path.join(tmp, '**', '*.docx'), recursive=True)
        elif os.path.isdir(a):
            pliki += glob.glob(os.path.join(a, '**', '*.docx'), recursive=True)
        else:
            pliki.append(a)
    pliki = sorted(set(pliki))
    print(f'plików DOCX: {len(pliki)}')
    ctx = zbuduj_kontekst()
    karty = czytaj('karty_setow.json')
    orig = open(os.path.join(DATA, 'karty_setow.json'), encoding='utf-8').read()
    assert json.dumps(karty, ensure_ascii=False, indent=1) == orig, 'karty_setow.json: round-trip niestabilny!'

    nowe = collections.OrderedDict(); blokady = []; ostrz = []
    for p in pliki:
        d = parsuj(p); nr = d['nr']; m = d['metryka']
        if not nr or len(d['akapity']) < 2 or len(d['faq']) < 3 or len(m) < 6:
            blokady.append((d['plik'], 'niekompletna struktura DOCX')); continue
        if nr in karty:
            ostrz.append((nr, 'karta już istnieje — pominięta')); continue
        seria_pelna = m.get('Seria', ''); slug = slug_serii(seria_pelna.replace('LEGO ', ''))
        # RRP — bramka twarda
        mc = re.search(r'([\d\s]+,\d{2})', m.get('Polska cena katalogowa RRP', ''))
        rrp_p = float(mc.group(1).replace(' ', '').replace(',', '.')) if mc else None
        rrp_my = ctx['rrp'](nr)
        if rrp_p and rrp_my and abs(rrp_p - rrp_my) > 0.01:
            blokady.append((nr, f'RRP: Piotr {rrp_p} vs my {rrp_my} — rozstrzygnij przed importem')); continue
        # miękkie ostrzeżenia
        k = ctx['wKat'].get(nr); s = ctx['sety'].get(nr)
        el = int(m.get('Liczba elementów', '0').replace(' ', '') or 0)
        if k and k.get('elementy') and el and k['elementy'] != el:
            ostrz.append((nr, f'elementy: Piotr {el} vs katalog {k["elementy"]} — sprawdź Brickset'))
        if not ctx['ma_hub'](nr): ostrz.append((nr, 'BRAK HUBA /zestaw/ — karta nie będzie widoczna'))
        if s and s.get('ekskluzyw') and 'regularna' in m.get('Dystrybucja', ''):
            ostrz.append((nr, 'dystrybucja: Piotr regularna vs nasz ekskluzyw — sprawdź Brickset'))
        nazwa = (k or {}).get('nazwa') or (s or {}).get('nazwa') or m['Nazwa']
        if nazwa.replace("'", '’') != m['Nazwa'].replace("'", '’').replace('™', '').strip():
            ostrz.append((nr, f'nazwa: Piotr „{m["Nazwa"]}” → kanoniczna „{nazwa}”'))
        m['Nazwa'] = nazwa
        log = []
        pow = m.get('Powiązanie')
        ak = [gramatyka(linkuj(a, seria_pelna, slug), pow, log) for a in d['akapity']]
        faq = [{'q': f['q'].strip(), 'a': gramatyka(linkuj(f['a'], seria_pelna, slug), pow, log)} for f in d['faq']]
        for wpis in log: ostrz.append((nr, 'gramatyka szablonu: ' + wpis))
        for t in ak + [f['a'] for f in faq]:
            if 'link wewnętrzny' in t: ostrz.append((nr, 'NIEROZWIĄZANY placeholder: ' + t[:80]))
        potrzeba = 2 if el > 1200 else (1 if el > 500 else 0)
        if potrzeba:
            ak += akapity_redakcyjne(nr, seria_pelna, el, rrp_p, ctx)[:potrzeba]
        nowe[nr] = collections.OrderedDict([
            ('seria', seria_pelna.replace('LEGO ', '')), ('nazwa', nazwa), ('elementy', el),
            ('akapity', ak), ('metryka', m), ('faq', faq)])

    print(f'\nRAPORT — do wgrania: {len(nowe)}, zablokowane: {len(blokady)}, ostrzeżeń: {len(ostrz)}')
    for nr, o in blokady: print(f'  BLOKADA {nr}: {o}')
    for nr, o in ostrz: print(f'  uwaga {nr}: {o}')
    if sucho:
        print('\n--sucho: nic nie zapisano.'); return
    if not nowe:
        print('brak kart do zapisania'); return
    for nr, karta in nowe.items(): karty[nr] = karta
    import datetime
    karty['_meta']['zaktualizowano'] = datetime.date.today().strftime('%Y-%m-%d')
    serie = sorted({v['seria'] for k2, v in karty.items() if k2 != '_meta'})
    karty['_meta']['serie_wgrane'] = serie
    with open(os.path.join(DATA, 'karty_setow.json'), 'w', encoding='utf-8') as f:
        f.write(json.dumps(karty, ensure_ascii=False, indent=1))
    print(f'\nzapisano — kart w rejestrze: {len(karty) - 1}')
    print('dalej: node --run build (kontrola), commit, push; rozbieżności z raportu rozstrzygaj Bricksetem')

if __name__ == '__main__':
    main()
