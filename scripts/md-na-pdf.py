"""Minimalny konwerter markdown -> HTML na potrzeby wydruku maila do Piotra.
Obsluguje dokladnie to, co jest w pliku: naglowki, tabele, listy, cytaty,
pogrubienia, kod inline i linie poziome."""
import re, sys, html

zrodlo = open(sys.argv[1], encoding='utf-8').read()
linie = zrodlo.split('\n')

def inline(t):
    t = html.escape(t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = t.replace('✔', '<span class="ok">✔</span>').replace('✗', '<span class="zle">✗</span>')
    return t

out, i = [], 0
while i < len(linie):
    w = linie[i]
    if not w.strip():
        i += 1; continue
    if w.startswith('---') and set(w.strip()) == {'-'}:
        out.append('<hr>'); i += 1; continue
    m = re.match(r'^(#{1,6})\s+(.*)', w)
    if m:
        p = len(m.group(1)); out.append(f'<h{p}>{inline(m.group(2))}</h{p}>'); i += 1; continue
    if w.lstrip().startswith('|'):
        tab = []
        while i < len(linie) and linie[i].lstrip().startswith('|'):
            tab.append(linie[i]); i += 1
        kom = lambda r: [c.strip() for c in r.strip().strip('|').split('|')]
        out.append('<table>')
        out.append('<thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in kom(tab[0])) + '</tr></thead><tbody>')
        for r in tab[2:]:
            out.append('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in kom(r)) + '</tr>')
        out.append('</tbody></table>'); continue
    if w.startswith('>'):
        cyt = []
        while i < len(linie) and (linie[i].startswith('>') or (cyt and linie[i].strip() and not linie[i].startswith(('#', '-', '|')))):
            cyt.append(re.sub(r'^>\s?', '', linie[i])); i += 1
        out.append('<blockquote>' + inline(' '.join(x.strip() for x in cyt if x.strip())) + '</blockquote>'); continue
    if re.match(r'^[-*]\s+', w):
        poz = []
        while i < len(linie) and (re.match(r'^[-*]\s+', linie[i]) or (poz and linie[i].startswith('  ') and linie[i].strip())):
            if re.match(r'^[-*]\s+', linie[i]):
                poz.append(re.sub(r'^[-*]\s+', '', linie[i]))
            else:
                poz[-1] += ' ' + linie[i].strip()
            i += 1
        out.append('<ul>' + ''.join(f'<li>{inline(p)}</li>' for p in poz) + '</ul>'); continue
    # myslnik i gwiazdka otwieraja liste tylko ze spacja po nich - inaczej
    # akapit zaczynajacy sie od **pogrubienia** przepadal
    lista_lub_blok = lambda w: (w.lstrip().startswith(('|', '>', '#'))
                                or re.match(r'^[-*]\s+', w.lstrip()) is not None)
    akapit = []
    while i < len(linie) and linie[i].strip() and not lista_lub_blok(linie[i]):
        akapit.append(linie[i].strip()); i += 1
    if akapit:
        out.append(f'<p>{inline(" ".join(akapit))}</p>')
    else:
        i += 1

STYL = """
@page { size: A4; margin: 18mm 16mm 20mm 16mm; }
* { box-sizing: border-box; }
body { font-family: "DejaVu Sans", "Liberation Sans", Arial, sans-serif;
       font-size: 10pt; line-height: 1.55; color: #1c2333; margin: 0; }
h1 { font-size: 19pt; color: #0f2b57; margin: 0 0 4pt; letter-spacing: -.2pt; }
h1 + p { color: #5a6478; font-size: 9.5pt; margin-top: 0; }
h2 { font-size: 12.5pt; color: #0f2b57; margin: 20pt 0 6pt;
     padding-bottom: 4pt; border-bottom: 2px solid #f0c419; page-break-after: avoid; }
h3 { font-size: 11pt; margin: 14pt 0 4pt; page-break-after: avoid; }
p { margin: 0 0 7pt; }
ul { margin: 0 0 8pt; padding-left: 16pt; }
li { margin-bottom: 2.5pt; }
hr { border: 0; border-top: 1px solid #dfe3ea; margin: 14pt 0; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 8.8pt;
       background: #f2f4f8; padding: 1px 3px; border-radius: 2px; }
strong { color: #0f2b57; }
blockquote { margin: 8pt 0; padding: 7pt 10pt; background: #f7f9fc;
             border-left: 3px solid #0f2b57; font-size: 9.5pt; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0 12pt;
        font-size: 8.6pt; page-break-inside: auto; }
th { background: #0f2b57; color: #fff; text-align: left; padding: 5pt 6pt;
     font-weight: 700; font-size: 8.4pt; }
td { padding: 4pt 6pt; border-bottom: 1px solid #e3e7ee; vertical-align: top; }
tr:nth-child(even) td { background: #f7f9fc; }
tr { page-break-inside: avoid; }
td:first-child { font-variant-numeric: tabular-nums; white-space: nowrap; font-weight: 600; color: #0f2b57; }
.ok { color: #1a7f4b; font-weight: 700; }
.zle { color: #b3261e; font-weight: 700; }
"""
print('<!doctype html><html lang="pl"><head><meta charset="utf-8">'
      f'<title>Mail do Piotra</title><style>{STYL}</style></head><body>'
      + '\n'.join(out) + '</body></html>')

# Uzycie:
#   python3 scripts/md-na-pdf.py plik.md > /tmp/plik.html
#   /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --disable-gpu \
#       --no-sandbox --no-pdf-header-footer --print-to-pdf=plik.pdf /tmp/plik.html
