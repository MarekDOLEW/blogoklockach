#!/usr/bin/env python3
"""Wysyla raport z zadania cyklicznego jako PDF na adresy z src/data/raporty_mail.json.

Wymaga zmiennej srodowiskowej RESEND_API_KEY (nadawca: raporty@tylkoklocki.pl,
domena zweryfikowana w Resend, region eu-west-1).

Uzycie:
  python3 scripts/wyslij-raport.py --zadanie promocje \
      --tytul "Lowca Promocji — 19.08.2026" --plik raport.md \
      [--wstep "Jedno-dwa zdania podsumowania do tresci maila."]

Plik wejsciowy: .md (konwersja przez python-markdown) albo .html.
Zwraca kod 0 przy sukcesie, 1 przy bledzie wysylki, 2 przy bledzie konfiguracji.
"""
import argparse, base64, json, os, sys, tempfile, urllib.request, urllib.error
from datetime import date
from pathlib import Path

NADAWCA = 'Raporty tylkoklocki.pl <raporty@tylkoklocki.pl>'
KONFIG = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'raporty_mail.json'

STYL = """
@page { size: A4; margin: 18mm 15mm; @bottom-center {
  content: "tylkoklocki.pl · raport wewnętrzny · strona " counter(page) " z " counter(pages);
  font-size: 8pt; color: #8b93a1; } }
body { font-family: "DejaVu Sans", sans-serif; font-size: 9.5pt; line-height: 1.5; color: #17233f; }
h1 { font-size: 17pt; margin: 0 0 4pt; letter-spacing: -0.3pt; }
h1 + p.data { color: #6b7280; font-size: 8.5pt; margin: 0 0 14pt; }
h2 { font-size: 12.5pt; margin: 16pt 0 6pt; padding-bottom: 3pt; border-bottom: 1.5pt solid #ffc933; }
h3 { font-size: 10.5pt; margin: 12pt 0 4pt; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 8.5pt; }
th { background: #17233f; color: #fff; text-align: left; padding: 5pt 6pt; font-size: 8pt; }
td { padding: 4.5pt 6pt; border-bottom: 0.5pt solid #e5e7eb; vertical-align: top; }
tr:nth-child(even) td { background: #f8f9fb; }
ul, ol { margin: 6pt 0; padding-left: 16pt; }
li { margin: 2pt 0; }
code { background: #f0f2f5; padding: 1pt 3pt; font-size: 8.5pt; }
a { color: #17233f; text-decoration: none; }
strong { color: #0f1729; }
"""


def html_z_pliku(sciezka: Path, tytul: str) -> str:
    tresc = sciezka.read_text(encoding='utf-8')
    if sciezka.suffix.lower() in ('.html', '.htm'):
        return tresc
    import markdown
    ciało = markdown.markdown(tresc, extensions=['tables', 'fenced_code', 'sane_lists'])
    dzis = date.today().strftime('%d.%m.%Y')
    return (f'<!doctype html><html lang="pl"><head><meta charset="utf-8">'
            f'<style>{STYL}</style></head><body>'
            f'<h1>{tytul}</h1><p class="data">tylkoklocki.pl · wygenerowano {dzis}</p>'
            f'{ciało}</body></html>')


def pdf_z_html(html: str) -> bytes:
    from weasyprint import HTML
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
        cel = Path(f.name)
    HTML(string=html).write_pdf(str(cel))
    dane = cel.read_bytes()
    cel.unlink(missing_ok=True)
    return dane


def wyslij(klucz: str, odbiorcy: list, temat: str, tekst: str, nazwa_pdf: str, pdf: bytes) -> None:
    ładunek = json.dumps({
        'from': NADAWCA,
        'to': odbiorcy,
        'subject': temat,
        'text': tekst,
        'attachments': [{'filename': nazwa_pdf,
                         'content': base64.b64encode(pdf).decode('ascii')}],
    }).encode('utf-8')
    żądanie = urllib.request.Request(
        'https://api.resend.com/emails', data=ładunek, method='POST',
        headers={'Authorization': f'Bearer {klucz}', 'Content-Type': 'application/json',
                 # bez tego naglowka Cloudflare przed API Resend odrzuca urllib (403, kod 1010)
                 'User-Agent': 'tylkoklocki.pl-raporty/1.0'})
    with urllib.request.urlopen(żądanie, timeout=30) as odp:
        wynik = json.loads(odp.read())
    print(f"Wyslano do: {', '.join(odbiorcy)} (id: {wynik.get('id')})")


def main() -> int:
    p = argparse.ArgumentParser(description='Wysylka raportu PDF z zadania cyklicznego.')
    p.add_argument('--zadanie', required=True, help='klucz z raporty_mail.json (promocje/nowosci/wycofania/konkurencja)')
    p.add_argument('--tytul', required=True, help='tytul raportu (naglowek PDF i temat maila)')
    p.add_argument('--plik', required=True, help='sciezka do raportu .md albo .html')
    p.add_argument('--wstep', default='', help='1-2 zdania do tresci maila (PDF w zalaczniku)')
    a = p.parse_args()

    klucz = os.environ.get('RESEND_API_KEY')
    if not klucz:
        print('BLAD: brak RESEND_API_KEY w srodowisku.', file=sys.stderr)
        return 2

    konfig = json.loads(KONFIG.read_text(encoding='utf-8'))
    zadanie = konfig.get('zadania', {}).get(a.zadanie)
    if not zadanie:
        print(f"BLAD: nieznane zadanie '{a.zadanie}'. Dostepne: {', '.join(konfig.get('zadania', {}))}", file=sys.stderr)
        return 2
    odbiorcy = zadanie.get('odbiorcy') or []
    if not odbiorcy:
        print(f"BLAD: brak odbiorcow dla zadania '{a.zadanie}'.", file=sys.stderr)
        return 2

    zrodlo = Path(a.plik)
    if not zrodlo.is_file():
        print(f'BLAD: nie ma pliku {zrodlo}', file=sys.stderr)
        return 2

    pdf = pdf_z_html(html_z_pliku(zrodlo, a.tytul))
    nazwa = f"{a.zadanie}-{date.today().isoformat()}.pdf"
    tresc = (a.wstep or f"Raport „{zadanie['nazwa']}” w załączniku (PDF).").strip()
    tresc += '\n\n---\nRaport wygenerowany automatycznie przez zadanie cykliczne tylkoklocki.pl.'

    try:
        wyslij(klucz, odbiorcy, a.tytul, tresc, nazwa, pdf)
    except urllib.error.HTTPError as e:
        print(f'BLAD wysylki ({e.code}): {e.read().decode("utf-8", "replace")[:400]}', file=sys.stderr)
        return 1
    except Exception as e:  # sieć, timeout itp.
        print(f'BLAD wysylki: {e}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
