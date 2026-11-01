// Panel tylkoklocki.pl — skrypt przeglądarki: kto jest zalogowany, filtr tabeli
// zestawów, filtr dziennika, wysyłanie plików i lista wgranych (API workera).
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  fetch('/api/ja').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j?.email) $('#kto').textContent = j.email; }).catch(() => {});

  // ── Opisy: wyszukiwarka zestawów ──
  const tab = $('#zestawy');
  if (tab) {
    let dane = [];
    const rysuj = () => {
      const q = $('#szukaj').value.trim().toLowerCase();
      const fk = $('#f-karta').value, fs = $('#f-status').value;
      const wynik = dane.filter((r) => (fk === '' || String(r[5]) === fk) && (fs === '' || String(r[4]) === fs)
        && (!q || r[0].toLowerCase().includes(q) || r[1].toLowerCase().includes(q) || r[2].toLowerCase().includes(q)));
      const pokaz = wynik.slice(0, 300);
      tab.tBodies[0].innerHTML = pokaz.map((r) => `<tr><td><a href="https://tylkoklocki.pl/zestaw/${esc(r[0])}/">${esc(r[0])}</a></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td>${r[4] ? 'w sprzedaży' : 'wycofany'}</td><td>${r[5] === 1 ? '✓ karta' : r[5] === 2 ? '✓ własny' : '<span class="szary">brak</span>'}</td><td class="liczba">${r[6]}</td></tr>`).join('');
      $('#zestawy-info').textContent = `${wynik.length.toLocaleString('pl-PL')} pasujących${wynik.length > 300 ? ' — pokazuję pierwsze 300, zawęź wyszukiwanie' : ''}.`;
    };
    fetch(tab.dataset.zrodlo).then((r) => r.json()).then((d) => { dane = d; rysuj(); });
    ['#szukaj', '#f-karta', '#f-status'].forEach((s) => $(s).addEventListener('input', rysuj));
  }

  // ── Dziennik: filtr po autorze ──
  const fkto = $('#f-kto');
  if (fkto) fkto.addEventListener('input', () => {
    document.querySelectorAll('.wpis').forEach((w) => { w.hidden = fkto.value !== '' && w.dataset.kto !== fkto.value; });
  });

  // ── Artykuły: filtr kategorii ──
  const fkat = $('#f-kat');
  if (fkat) fkat.addEventListener('input', () => {
    document.querySelectorAll('#artykuly tbody tr').forEach((w) => { w.hidden = fkat.value !== '' && w.dataset.kat !== fkat.value; });
  });

  // ── Wgraj ──
  const form = $('#wgraj');
  if (!form) return;
  const input = $('#pliki'), strefa = $('.upuść'), stan = $('#wgraj-stan');
  const MAX = 25 * 1024 * 1024;
  const pokazWybrane = () => {
    $('#wybrane').innerHTML = [...input.files].map((f) => `<li>${esc(f.name)} <span class="szary">${(f.size / 1024 / 1024).toFixed(2)} MB${f.size > MAX ? ' — za duży' : ''}</span></li>`).join('');
  };
  input.addEventListener('change', pokazWybrane);
  ['dragenter', 'dragover'].forEach((e) => strefa.addEventListener(e, (ev) => { ev.preventDefault(); strefa.classList.add('nad'); }));
  ['dragleave', 'drop'].forEach((e) => strefa.addEventListener(e, (ev) => { ev.preventDefault(); strefa.classList.remove('nad'); }));
  strefa.addEventListener('drop', (ev) => { input.files = ev.dataTransfer.files; pokazWybrane(); });

  const STANY = { czeka: 'czeka na automat (8:52 / 14:52)', opublikowane: 'opublikowane', problem: 'problem — szczegóły w mailu', 'do opracowania': 'czeka na sesję Code' };
  const lista = () => fetch('/api/wgrane').then((r) => r.json()).then((j) => {
    const tb = $('#wgrane').tBodies[0];
    if (!j.wpisy?.length) { tb.innerHTML = '<tr><td colspan="4" class="szary">Nic jeszcze nie wgrano.</td></tr>'; return; }
    tb.innerHTML = j.wpisy.map((w) => `<tr><td>${esc(new Date(w.kiedy).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' }))}</td><td>${esc(w.kto)}</td><td>${w.pliki.map((p) => esc(p.nazwa)).join('<br>')}${w.notka ? `<div class="szary">${esc(w.notka)}</div>` : ''}</td><td>${esc(STANY[w.stan] ?? w.stan)}${w.linki?.length ? '<br>' + w.linki.map((l) => `<a href="${esc(l)}">${esc(l.replace('https://tylkoklocki.pl', ''))}</a>`).join('<br>') : ''}${w.problemy?.length ? `<div class="szary">${w.problemy.map(esc).join('<br>')}</div>` : ''}</td></tr>`).join('');
  }).catch(() => { $('#wgrane').tBodies[0].innerHTML = '<tr><td colspan="4" class="szary">Nie udało się pobrać listy.</td></tr>'; });
  lista();

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!input.files.length) { stan.textContent = 'Wybierz co najmniej jeden plik.'; return; }
    if ([...input.files].some((f) => f.size > MAX)) { stan.textContent = 'Któryś plik ma ponad 25 MB.'; return; }
    const btn = $('button', form);
    btn.disabled = true;
    stan.textContent = 'Wysyłam…';
    try {
      const r = await fetch('/api/wgraj', { method: 'POST', body: new FormData(form) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.blad || r.statusText);
      stan.textContent = `Wysłane (${j.pliki} pl.). Automat skrzynki weźmie je w najbliższym przebiegu.`;
      form.reset();
      $('#wybrane').innerHTML = '';
      lista();
    } catch (e) {
      stan.textContent = `Nie udało się: ${e.message}`;
    } finally {
      btn.disabled = false;
    }
  });
})();
