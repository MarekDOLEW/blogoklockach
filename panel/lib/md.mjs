// Mały renderer Markdownu dla panelu — bez zależności, żeby build panelu
// w Cloudflare nie potrzebował `npm ci` (sam `node panel/build.mjs`).
// Obsługuje to, czego używamy w DZIENNIK.md, skillach i raportach: nagłówki,
// akapity, listy (także zagnieżdżone wcięciem), tabele GFM, cytaty, bloki kodu,
// linię poziomą, **pogrubienie**, *kursywę*, `kod` i [linki](…).
// Komentarze HTML (<!-- … -->) pomija; innego HTML-a nie przepuszcza.

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function inline(t) {
  const kody = [];
  let s = esc(t).replace(/`([^`]+)`/g, (_, k) => `\u0000${kody.push(k) - 1}\u0000`);
  s = s
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?=[^*\w]|$)/g, '$1<em>$2</em>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${kody[i]}</code>`);
}

const komorki = (l) => l.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim());

export function md(tekst) {
  const linie = String(tekst ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/\r/g, '').split('\n');
  const wyj = [];
  let i = 0;
  while (i < linie.length) {
    const l = linie[i];
    if (!l.trim()) { i++; continue; }
    if (/^```/.test(l)) {
      const kod = [];
      for (i++; i < linie.length && !/^```/.test(linie[i]); i++) kod.push(linie[i]);
      i++;
      wyj.push(`<pre><code>${esc(kod.join('\n'))}</code></pre>`);
      continue;
    }
    const h = l.match(/^(#{1,6})\s+(.*)$/);
    if (h) { const n = Math.min(h[1].length + 1, 6); wyj.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }
    if (/^(-{3,}|\*{3,})\s*$/.test(l)) { wyj.push('<hr>'); i++; continue; }
    if (/^\s*\|/.test(l) && i + 1 < linie.length && /^\s*\|?\s*:?-{2,}/.test(linie[i + 1])) {
      const nag = komorki(l);
      const wiersze = [];
      for (i += 2; i < linie.length && /^\s*\|/.test(linie[i]); i++) wiersze.push(komorki(linie[i]));
      wyj.push(`<div class="tabela"><table><thead><tr>${nag.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${wiersze.map((w) => `<tr>${w.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^>\s?/.test(l)) {
      const cyt = [];
      for (; i < linie.length && /^>\s?/.test(linie[i]); i++) cyt.push(linie[i].replace(/^>\s?/, ''));
      wyj.push(`<blockquote>${md(cyt.join('\n'))}</blockquote>`);
      continue;
    }
    if (/^\s*([-*+]|\d+\.)\s+/.test(l)) {
      const nr = /^\s*\d+\./.test(l);
      const pozycje = [];
      for (; i < linie.length; i++) {
        const x = linie[i];
        if (/^\s*([-*+]|\d+\.)\s+/.test(x) && x.search(/\S/) <= 1) pozycje.push([x.replace(/^\s*([-*+]|\d+\.)\s+/, '')]);
        else if (x.trim() && /^\s{2,}/.test(x) && pozycje.length) pozycje.at(-1).push(x.replace(/^\s{2,4}/, ''));
        else break;
      }
      const tag = nr ? 'ol' : 'ul';
      wyj.push(`<${tag}>${pozycje.map(([g, ...reszta]) => `<li>${inline(g)}${reszta.length ? md(reszta.join('\n')) : ''}</li>`).join('')}</${tag}>`);
      continue;
    }
    const akapit = [];
    for (; i < linie.length && linie[i].trim() && !/^(#{1,6}\s|```|>|\s*\||\s*([-*+]|\d+\.)\s+)/.test(linie[i]); i++) akapit.push(linie[i].trim());
    if (!akapit.length) { wyj.push(`<p>${inline(l)}</p>`); i++; continue; }
    wyj.push(`<p>${inline(akapit.join(' '))}</p>`);
  }
  return wyj.join('\n');
}
