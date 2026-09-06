"""Karty Piotra, ktore NIE trafiaja do kolejki redakcyjnej i nie maja person.

Kolejka (scripts/kolejka-redakcyjna.py) bierze wylacznie zestawy z katalog.json
z rocznikiem 2020-2026, statusem "dostepny" i znana cena katalogowa. Karta
Piotra moze jednak istniec dla zestawu, ktory zadnego z tych warunkow nie
spelnia - i wtedy wypada z arkusza bez sladu. Ten skrypt zbiera takie przypadki
w osobny listing: numer z linkiem do podstrony (o ile istnieje), powod
wykluczenia i proponowane dzialanie.

Uruchomienie: python3 scripts/karty-poza-kolejka.py
"""
import json
import re
from collections import Counter
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

REPO = '/home/user/blogoklockach'
czytaj = lambda p: json.load(open(f'{REPO}/src/data/{p}', encoding='utf-8'))

kat = czytaj('katalog.json')
sety = czytaj('sety.json')
karty = czytaj('karty_setow.json')
rrp = czytaj('rrp_potwierdzone.json')
ceny_baza = czytaj('ceny_baza.json')
feed = czytaj('oferty_feed.json').get('sety', {})
redirects = czytaj('redirects.json')
wycofania = {w['numer']: w for w in czytaj('wycofania.json')['wycofania']}

katidx = {}
for seria, lista in kat.items():
    if seria == '_meta' or not isinstance(lista, list):
        continue
    for s in lista:
        katidx[str(s['numer'])] = dict(s, seria=seria)

# ── populacja kolejki: dokladnie te same warunki co w kolejka-redakcyjna.py ──
w_kolejce = {
    n for n, r in katidx.items()
    if isinstance(r.get('rok'), int) and 2020 <= r['rok'] <= 2026
    and r.get('status') == 'dostepny'
    and r.get('cena_katalogowa') not in (None, '', 0)
}

ma_persony = lambda n: bool(sety.get(n) and sety[n].get('dla_rodzica') and sety[n].get('dla_afol'))

# ── ktore numery maja podstrone /zestaw/<nr>/ (lustro src/lib/huby.js) ──
def ma_cene_z_feedu(w):
    if not isinstance(w, dict):
        return False
    return bool(w.get('cena') or any(isinstance(c, (int, float)) and c > 0 for c in (w.get('oferty') or {}).values()))

mapy_redirect = [m for m in redirects.values() if isinstance(m, dict)]
huby = set(sety) | set(wycofania)
for nr in set(feed) | {n for m in mapy_redirect for n in m}:
    if nr in huby or (nr not in katidx and nr not in wycofania):
        continue
    if ma_cene_z_feedu(feed.get(nr)) or any(m.get(nr) for m in mapy_redirect):
        huby.add(nr)
for nr, s in katidx.items():
    if s.get('status') == 'dostepny' and (s.get('cena_katalogowa') or rrp.get(nr, {}).get('cena')):
        huby.add(nr)


def powod(nr):
    r = katidx.get(nr)
    if not r:
        return 'brak w katalogu serwisu'
    if r.get('status') != 'dostepny':
        return 'wycofany (EOL)'
    if r.get('cena_katalogowa') in (None, '', 0):
        return 'brak ceny katalogowej'
    if not (isinstance(r.get('rok'), int) and 2020 <= r['rok'] <= 2026):
        return f"rocznik {r.get('rok')}"
    return '?'


DZIALANIE = {
    'brak w katalogu serwisu': 'dopisac do katalog.json (nazwa, rok, seria, cena) - wtedy wejdzie do kolejki',
    'brak ceny katalogowej': 'uzupelnic cene katalogowa - wtedy wejdzie do kolejki',
    'wycofany (EOL)': 'decyzja: czy opisujemy zestawy juz wycofane',
}

# ── cena i liczba elementow: karta Piotra ma je nawet wtedy, gdy katalog nie ma ──
def z_karty(nr, pole):
    return (karty.get(nr) or {}).get('metryka', {}).get(pole)


# Karty nazywaja pole ceny na kilka sposobow ("Cena katalogowa", "Polska cena
# katalogowa RRP", "Cena / sposob uzyskania"), a przy zestawach promocyjnych
# wpisuja tam zdanie zamiast kwoty - dlatego szukamy wzorca kwoty, nie klucza.
KWOTA = re.compile(r'(\d[\d\s]*,\d{2})\s*zł')


def cena_z_karty(nr):
    for klucz, wartosc in (karty.get(nr) or {}).get('metryka', {}).items():
        if 'cena' not in klucz.lower() or not isinstance(wartosc, str):
            continue
        trafienie = KWOTA.search(wartosc)
        if trafienie:
            return float(trafienie.group(1).replace(' ', '').replace(',', '.'))
    return None


def cena(nr):
    z_rrp = rrp.get(nr, {}).get('cena')
    if z_rrp:
        return float(z_rrp), 'rejestr RRP'
    z_kat = katidx.get(nr, {}).get('cena_katalogowa')
    if z_kat:
        return float(z_kat), 'katalog'
    z_bazy = (ceny_baza.get(nr) or {}).get('cena_katalogowa')
    if z_bazy:
        return float(z_bazy), 'ceny_baza'
    z_k = cena_z_karty(nr)
    return (z_k, 'karta Piotra') if z_k else (None, 'brak - GWP lub cena nieogloszona')


def elementy(nr):
    z_kat = katidx.get(nr, {}).get('elementy')
    if z_kat:
        return int(z_kat)
    surowa = str(z_karty(nr, 'Liczba elementów') or z_karty(nr, 'Liczba elementow') or '').replace(' ', '')
    return int(surowa) if surowa.isdigit() else None


def nazwa(nr):
    k = (karty.get(nr) or {}).get('nazwa')
    if k and k != '{?}':
        return k
    for zrodlo in (katidx.get(nr, {}).get('nazwa'), (sety.get(nr) or {}).get('nazwa')):
        if zrodlo and zrodlo != '{?}':
            return zrodlo
    return '(brak nazwy)'


def seria(nr):
    return katidx.get(nr, {}).get('seria') or z_karty(nr, 'Seria') or ''


def rok(nr):
    r = katidx.get(nr, {}).get('rok')
    if isinstance(r, int):
        return r
    premiera = z_karty(nr, 'Premiera') or ''
    for token in premiera.split():
        if token.isdigit() and len(token) == 4:
            return int(token)
    return None


numery = sorted(
    n for n in karty if n != '_meta' and n not in w_kolejce and not ma_persony(n)
)

# ── arkusz ──
ARIAL = 'Arial'
wb = Workbook()
ws = wb.active
ws.title = 'Karty poza kolejka'

hdr_fill = PatternFill('solid', fgColor='1F3864')
hdr_font = Font(name=ARIAL, size=11, bold=True, color='FFFFFF')
band = PatternFill('solid', fgColor='F2F2F2')
border = Border(bottom=Side(style='thin', color='BFBFBF'))
link_font = Font(name=ARIAL, size=10, color='1155CC', underline='single')

headers = ['Numer', 'Nazwa', 'Seria', 'Rok', 'Elementy', 'Cena katalogowa (zl)',
           'Zrodlo ceny', 'Podstrona w serwisie', 'Powod, dlaczego poza kolejka',
           'Proponowane dzialanie', 'Brickset']
for c, h in enumerate(headers, 1):
    cell = ws.cell(row=1, column=c, value=h)
    cell.fill = hdr_fill
    cell.font = hdr_font
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)

for i, nr in enumerate(numery, start=2):
    p = powod(nr)
    c, zrodlo = cena(nr)
    hub = nr in huby

    ws.cell(row=i, column=1, value=nr).alignment = Alignment(horizontal='left')
    ws.cell(row=i, column=2, value=nazwa(nr))
    ws.cell(row=i, column=3, value=seria(nr))
    ws.cell(row=i, column=4, value=rok(nr)).alignment = Alignment(horizontal='center')
    ws.cell(row=i, column=5, value=elementy(nr)).alignment = Alignment(horizontal='center')
    kom_cena = ws.cell(row=i, column=6, value=c)
    kom_cena.number_format = '#,##0.00'
    ws.cell(row=i, column=7, value=zrodlo)

    kom_hub = ws.cell(row=i, column=8, value='/zestaw/%s/' % nr if hub else 'brak')
    if hub:
        kom_hub.hyperlink = f'https://tylkoklocki.pl/zestaw/{nr}/'

    ws.cell(row=i, column=9, value=p)
    ws.cell(row=i, column=10, value=DZIALANIE.get(p, ''))

    kom_bs = ws.cell(row=i, column=11, value=f'{nr}-1')
    kom_bs.hyperlink = f'https://brickset.com/sets/{nr}-1'

    for kol in range(1, len(headers) + 1):
        cl = ws.cell(row=i, column=kol)
        cl.font = link_font if kol in (8, 11) and (kol == 11 or hub) else Font(name=ARIAL, size=10)
        cl.border = border
        if i % 2 == 0:
            cl.fill = band
        if kol in (2, 9, 10):
            cl.alignment = Alignment(vertical='center', wrap_text=True)

for kol, szer in enumerate([10, 46, 18, 8, 10, 16, 14, 22, 26, 56, 12], start=1):
    ws.column_dimensions[get_column_letter(kol)].width = szer
ws.freeze_panes = 'A2'
ws.auto_filter.ref = f'A1:{get_column_letter(len(headers))}{len(numery) + 1}'

# ── zakladka z metodologia, zeby arkusz tlumaczyl sie sam ──
m = wb.create_sheet('Metodologia')
m.column_dimensions['A'].width = 34
m.column_dimensions['B'].width = 110
wiersze = [
    ('Co to za lista', 'Zestawy, dla ktorych Piotr napisal karte katalogowo-sprzedazowa, ale ktore nie '
                       'trafiaja do kolejki redakcyjnej i nie maja jeszcze person.'),
    ('Skad wykluczenie', 'Kolejka bierze wylacznie zestawy z katalog.json: rocznik 2020-2026, status '
                         '"dostepny" i znana cena katalogowa. Kazdy inny przypadek wypada z arkusza.'),
    ('brak w katalogu serwisu', 'Numeru nie ma w katalog.json. Najczesciej zestawy promocyjne (GWP), '
                                'ekskluzywy sklepu LEGO i premiery, ktorych katalog jeszcze nie zaciagnal.'),
    ('brak ceny katalogowej', 'Zestaw jest w katalogu, ale bez ceny. Cene zwykle zna karta Piotra - '
                              'kolumna "Zrodlo ceny" mowi, skad pochodzi kwota w tym wierszu.'),
    ('wycofany (EOL)', 'Zestaw jest juz poza oficjalna sprzedaza. Karta zostaje, ale to decyzja '
                       'redakcyjna, czy dopisujemy persony do zestawow, ktorych nie da sie kupic.'),
    ('Podstrona w serwisie', 'Link dziala tylko wtedy, gdy /zestaw/<nr>/ faktycznie powstaje. '
                             '"brak" oznacza, ze karta Piotra nie ma sie gdzie wyswietlic.'),
    ('Kiedy odswiezyc', 'Po kazdym imporcie kart i po kazdej zmianie w katalog.json: '
                        'python3 scripts/karty-poza-kolejka.py'),
]
m.cell(row=1, column=1, value='Zagadnienie').font = hdr_font
m.cell(row=1, column=1).fill = hdr_fill
m.cell(row=1, column=2, value='Wyjasnienie').font = hdr_font
m.cell(row=1, column=2).fill = hdr_fill
for i, (a, b) in enumerate(wiersze, start=2):
    m.cell(row=i, column=1, value=a).font = Font(name=ARIAL, size=10, bold=True)
    kb = m.cell(row=i, column=2, value=b)
    kb.font = Font(name=ARIAL, size=10)
    kb.alignment = Alignment(vertical='top', wrap_text=True)
    m.row_dimensions[i].height = 34

sciezka = f'{REPO}/materialy/karty-poza-kolejka.xlsx'
wb.save(sciezka)
print('zapisano', sciezka, 'pozycji:', len(numery))
print('powody:', Counter(powod(n) for n in numery).most_common())
print('bez podstrony:', sum(1 for n in numery if n not in huby))
