import json, datetime
from collections import Counter
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

kat = json.load(open('/home/user/blogoklockach/src/data/katalog.json'))
sety = json.load(open('/home/user/blogoklockach/src/data/sety.json'))
karty = {k for k in json.load(open('/home/user/blogoklockach/src/data/karty_setow.json')) if k != '_meta'}

# Arkusz obejmuje CAŁĄ populację kwalifikującą się do opisu (decyzja Marka
# 06.09.2026). Wcześniej wykluczał zestawy obecne w sety.json, więc odhaczeniem
# było zniknięcie wiersza — nie było widać ani kart Piotra, ani person.
# Status liczymy z danych przy każdym przebiegu, więc nie da się go rozjechać.
def status(nr):
    wpis = sety.get(nr)
    ma_karte = nr in karty
    ma_persony = bool(wpis and wpis.get('dla_rodzica') and wpis.get('dla_afol'))
    ma_nasz_opis = bool(wpis and wpis.get('opis'))
    if ma_karte and ma_persony and not ma_nasz_opis: return 'gotowe'
    if ma_karte and ma_nasz_opis:                    return 'dubel - wyczyscic nasz opis'
    if ma_karte and not wpis:                        return 'do person'
    if ma_karte:                                     return 'karta bez person'
    if ma_persony:                                   return 'nasz opis - czeka na karte'
    return 'do opisania'

rows = [(s, r) for s, v in kat.items() if s != '_meta' and isinstance(v, list) for r in v]
kand = [(s, r) for s, r in rows
        if isinstance(r.get('rok'), int) and 2020 <= r['rok'] <= 2026
        and r.get('status') == 'dostepny'
        and r.get('cena_katalogowa') not in (None, '', 0)]

# dedup po numerze — zostawiamy rekord z nowszym rocznikiem
best = {}
for s, r in kand:
    n = str(r['numer'])
    if n not in best or r['rok'] > best[n][1]['rok']:
        best[n] = (s, r)
data = sorted(best.values(), key=lambda x: (-float(x[1]['cena_katalogowa']), x[1]['rok'], str(x[1]['numer'])))

ARIAL = 'Arial'
wb = Workbook()
ws = wb.active
ws.title = 'Kolejka redakcyjna'

hdr_fill = PatternFill('solid', fgColor='1F3864')
hdr_font = Font(name=ARIAL, size=11, bold=True, color='FFFFFF')
thin = Side(style='thin', color='BFBFBF')
border = Border(bottom=thin)

headers = ['Numer', 'Nazwa', 'Rok wydania', 'Seria', 'Cena katalogowa (zł)',
           'Karta Piotra', 'Persony', 'Status']
for c, h in enumerate(headers, 1):
    cell = ws.cell(row=1, column=c, value=h)
    cell.fill = hdr_fill
    cell.font = hdr_font
    cell.alignment = Alignment(horizontal='center', vertical='center')

band = PatternFill('solid', fgColor='F2F2F2')
for i, (seria, r) in enumerate(data, start=2):
    ws.cell(row=i, column=1, value=str(r['numer'])).alignment = Alignment(horizontal='left')
    ws.cell(row=i, column=2, value=r.get('nazwa'))
    ws.cell(row=i, column=3, value=r['rok']).alignment = Alignment(horizontal='center')
    ws.cell(row=i, column=4, value=seria)
    pc = ws.cell(row=i, column=5, value=float(r['cena_katalogowa']))
    pc.number_format = '#,##0.00'
    nr = str(r['numer'])
    wpis = sety.get(nr)
    ws.cell(row=i, column=6, value='tak' if nr in karty else '').alignment = Alignment(horizontal='center')
    ws.cell(row=i, column=7,
            value='tak' if (wpis and wpis.get('dla_rodzica') and wpis.get('dla_afol')) else ''
            ).alignment = Alignment(horizontal='center')
    ws.cell(row=i, column=8, value=status(nr))
    for c in range(1, 9):
        cl = ws.cell(row=i, column=c)
        cl.font = Font(name=ARIAL, size=10)
        cl.border = border
        if i % 2 == 0:
            cl.fill = band

widths = [10, 62, 13, 22, 20, 13, 10, 28]
for c, w in enumerate(widths, 1):
    ws.column_dimensions[get_column_letter(c)].width = w
ws.row_dimensions[1].height = 26
ws.freeze_panes = 'A2'
ws.auto_filter.ref = f'A1:H{len(data)+1}'

# --- arkusz informacyjny ---
ws2 = wb.create_sheet('Metodologia')
per_year = Counter(r['rok'] for _, r in data)
per_status = Counter(status(str(r['numer'])) for _, r in data)
info = [
    ('KOLEJKA REDAKCYJNA — stan opisów zestawów LEGO na tylkoklocki.pl', ''),
    ('', ''),
    ('Data wygenerowania', datetime.date.today().isoformat()),
    ('Liczba pozycji', len(data)),
    ('', ''),
    ('KRYTERIA WEJŚCIA DO ZESTAWIENIA (wszystkie naraz)', ''),
    ('1. Rocznik', '2020–2026'),
    ('2. Status w katalogu', 'dostepny (nadal w sprzedaży, nie EOL)'),
    ('3. Cena katalogowa', 'znana, w złotych'),
    ('', ''),
    ('KOLUMNA STATUS — co oznacza', ''),
    ('gotowe', 'jest karta Piotra i są obie persony; nasz opis wyczyszczony, '
               'żeby strona nie dublowała tych samych faktów'),
    ('do person', 'jest karta Piotra, brak wpisu w sety.json — do dorobienia '
                  '„Dla rodzica" i „Dla kolekcjonera"'),
    ('karta bez person', 'jest karta i wpis, ale brakuje którejś persony'),
    ('dubel - wyczyscic nasz opis', 'jest karta Piotra i nasz opis naraz — '
                                    'te same fakty pojawią się na stronie dwa razy'),
    ('nasz opis - czeka na karte', 'nasz pełny opis i persony, karty Piotra jeszcze nie ma'),
    ('do opisania', 'ani karty, ani wpisu — właściwa kolejka do pracy'),
    ('', ''),
    ('ŹRÓDŁA DANYCH', ''),
    ('Numer, nazwa PL, rok, seria, cena', 'src/data/katalog.json'),
    ('Nasze opisy i persony', 'src/data/sety.json'),
    ('Karty katalogowo-sprzedażowe Piotra', 'src/data/karty_setow.json'),
    ('', ''),
    ('SORTOWANIE', 'cena katalogowa malejąco — droższy zestaw = wyższa prowizja afiliacyjna'),
    ('', ''),
    ('ROZKŁAD PO STATUSACH', ''),
]
for st, ile in per_status.most_common():
    info.append((st, ile))
info += [('', ''), ('ROZKŁAD PO ROCZNIKACH', '')]
for rok in sorted(per_year):
    info.append((str(rok), per_year[rok]))
info += [
    ('', ''),
    ('UWAGI', ''),
    ('Zestaw 40824 (Tweety)', 'w katalogu występuje dwukrotnie — jako Seasonal/2025 i Looney Tunes/2026. '
                              'W tabeli zostawiono nowszy wpis. Do zweryfikowania przy opisie.'),
    ('Historia liczby', '04.09: 809 pozycji (start kolejki). 05.09: 721 — sesja redakcyjna zamknęła 88 '
                        'najdroższych, doszły pojedyncze nowe zestawy z katalogu.'),
    ('Poza kolejką', 'zestawy z ceną w zł, ale ze statusem EOL — nie konwertują poza rynkiem wtórnym, '
                     'więc nie wchodzą do kolejki.'),
    ('Plik odświeżany', 'przez runnera Scout Nowości przy każdym przebiegu. Statusy liczone są z danych, '
                        'więc arkusza nie odhacza się ręcznie — ręczna zmiana zniknie przy następnym '
                        'przebiegu. Żeby zmienić status, trzeba zmienić dane.'),
]
for i, (a, b) in enumerate(info, start=1):
    ca = ws2.cell(row=i, column=1, value=a)
    cb = ws2.cell(row=i, column=2, value=b)
    ca.font = Font(name=ARIAL, size=10, bold=(b == '' and a != ''))
    cb.font = Font(name=ARIAL, size=10)
    cb.alignment = Alignment(wrap_text=True, vertical='top')
ws2.cell(row=1, column=1).font = Font(name=ARIAL, size=13, bold=True)
ws2.column_dimensions['A'].width = 42
ws2.column_dimensions['B'].width = 78

out = '/home/user/blogoklockach/materialy/kolejka-redakcyjna.xlsx'
wb.save(out)
print('zapisano', out, 'pozycji:', len(data))
print('po rocznikach:', sorted(per_year.items()))
print('po statusach:', per_status.most_common())
