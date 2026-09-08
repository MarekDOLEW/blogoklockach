/* Beko PyroPro – interakcje. Zero zależności, progressive enhancement. */
(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  /* ---------- Rok w stopce ---------- */
  document.querySelectorAll('[data-rok]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Leniwe pojawianie się banerów (IntersectionObserver) ---------- */
  const reveals = document.querySelectorAll('.baner');
  const zredukowany = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || zredukowany) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((wpisy) => {
      wpisy.forEach((w) => { if (w.isIntersecting) { w.target.classList.add('is-visible'); io.unobserve(w.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Licznik minutnika: odliczanie 01:00 -> 59:00 przy wejściu w okno ---------- */
  const MAPA = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  document.querySelectorAll('[data-licznik]').forEach((svg) => {
    const cyfry = [...svg.querySelectorAll('.licznik__cyfra')];
    const pokaz = (min) => {
      const tekst = String(min).padStart(2, '0') + '00';
      cyfry.forEach((g, i) => { const on = MAPA[tekst[i]]; g.querySelectorAll('.seg').forEach((r) => r.classList.toggle('is-on', on.includes(r.className.baseVal.match(/seg-(\w)/)[1]))); });
    };
    const od = +svg.dataset.od || 1, doM = +svg.dataset.do || 59;
    if (zredukowany || !('IntersectionObserver' in window)) { pokaz(doM); return; }
    pokaz(od);
    let raf = 0;
    const odliczaj = () => {
      cancelAnimationFrame(raf);
      const start = performance.now(), czas = 3500;
      const krok = (t) => {
        const p = Math.min(1, (t - start) / czas);
        const e = 1 - Math.pow(1 - p, 3); // ease-out
        pokaz(Math.round(od + (doM - od) * e));
        if (p < 1) raf = requestAnimationFrame(krok);
      };
      raf = requestAnimationFrame(krok);
    };
    // odliczanie startuje za każdym razem, gdy minutnik wjeżdża w okno; poza oknem wraca do 01:00
    const io = new IntersectionObserver((w) => {
      w.forEach((e) => { if (e.isIntersecting) odliczaj(); else { cancelAnimationFrame(raf); pokaz(od); } });
    }, { threshold: 0.6 });
    io.observe(svg);
  });

  /* ---------- Filmy inline: autostart (wyciszony) w oknie, pauza poza nim, przycisk dźwięku ---------- */
  document.querySelectorAll('[data-wideo-inline]').forEach((v) => {
    const btn = v.parentElement.querySelector('[data-dzwiek]');
    const ikona = (id) => { if (btn) btn.querySelector('use').setAttribute('href', '#' + id); };
    const odswiez = () => {
      const gra = !v.paused && !v.ended;
      v.classList.toggle('is-playing', gra);
      if (!btn) return;
      btn.classList.toggle('is-playing', gra);
      if (!gra) { ikona('i-play'); btn.setAttribute('aria-label', 'Odtwórz film z dźwiękiem'); btn.setAttribute('aria-pressed', 'false'); }
      else if (v.muted) { ikona('i-glosnik-wyl'); btn.setAttribute('aria-label', 'Włącz dźwięk'); btn.setAttribute('aria-pressed', 'false'); }
      else { ikona('i-glosnik'); btn.setAttribute('aria-label', 'Wycisz'); btn.setAttribute('aria-pressed', 'true'); }
    };
    ['play', 'playing', 'pause', 'ended', 'volumechange'].forEach((e) => v.addEventListener(e, odswiez));
    if (btn) btn.addEventListener('click', () => {
      if (v.paused) { v.muted = false; v.play().catch(() => { v.muted = true; v.play().catch(() => {}); }); }
      else v.muted = !v.muted;
      odswiez();
    });
    // autostart tylko gdy użytkownik nie ogranicza ruchu; poza oknem pauza (oszczędza transfer)
    if (zredukowany || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((w) => {
      w.forEach((e) => {
        if (e.isIntersecting) { v.muted = v.muted || !v.dataset.dzwiekOn; v.play().catch(() => {}); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.5 });
    io.observe(v);
    // wyciszenie po wyjściu poza okno nie kasuje wyboru dźwięku – zapamiętaj, że włączono
    v.addEventListener('volumechange', () => { if (!v.muted) v.dataset.dzwiekOn = '1'; });
  });

  /* ---------- Karuzele (scroll-snap + przyciski) ---------- */
  document.querySelectorAll('[data-karuzela]').forEach((kar) => {
    const tor = kar.querySelector('[data-tor]');
    const prev = kar.querySelector('[data-prev]');
    const next = kar.querySelector('[data-next]');
    if (!tor || !prev || !next) return;

    const krok = () => {
      const pierwszy = tor.firstElementChild;
      if (!pierwszy) return tor.clientWidth;
      const styl = getComputedStyle(tor);
      return pierwszy.getBoundingClientRect().width + (parseFloat(styl.columnGap) || 0);
    };
    const odswiez = () => {
      const przewijalna = tor.scrollWidth - tor.clientWidth > 4;
      if (!przewijalna) { prev.disabled = next.disabled = true; return; }
      prev.disabled = tor.scrollLeft <= 2;
      next.disabled = tor.scrollLeft + tor.clientWidth >= tor.scrollWidth - 2;
    };
    prev.addEventListener('click', () => tor.scrollBy({ left: -krok(), behavior: zredukowany ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => tor.scrollBy({ left: krok(), behavior: zredukowany ? 'auto' : 'smooth' }));
    tor.addEventListener('scroll', odswiez, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(odswiez), { passive: true });
    tor.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    tor.setAttribute('tabindex', '0');
    requestAnimationFrame(odswiez);
  });

  /* ---------- Modal wideo ---------- */
  const modal = document.getElementById('modal-wideo');
  const ekran = modal && modal.querySelector('[data-ekran]');
  const tytul = modal && modal.querySelector('#modal-tytul');
  let ostatniFokus = null;

  const osadz = (src, nazwa, webm) => {
    ekran.innerHTML = '';
    if (!src && !webm) {
      const p = document.createElement('p');
      p.className = 'modal__brak';
      p.textContent = 'Film „' + nazwa + '” zostanie podpięty po dostarczeniu pliku wideo lub adresu YouTube.';
      ekran.appendChild(p);
      return;
    }
    const yt = (src || '').match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
    if (yt) {
      const f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + yt[1] + '?autoplay=1&rel=0';
      f.title = nazwa;
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.loading = 'lazy';
      ekran.appendChild(f);
    } else {
      const v = document.createElement('video');
      v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('aria-label', nazwa);
      // MP4 (H.264) dla wszystkich przeglądarek + WebM (VP9) jako lżejsza alternatywa
      if (src) { const s1 = document.createElement('source'); s1.src = src; s1.type = 'video/mp4'; v.appendChild(s1); }
      if (webm) { const s2 = document.createElement('source'); s2.src = webm; s2.type = 'video/webm'; v.appendChild(s2); }
      ekran.appendChild(v);
    }
  };

  if (modal && typeof modal.showModal === 'function') {
    document.querySelectorAll('[data-wideo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        ostatniFokus = btn;
        const nazwa = btn.dataset.tytul || 'Film';
        tytul.textContent = nazwa;
        osadz(btn.dataset.wideo, nazwa, btn.dataset.wideoWebm);
        modal.showModal();
      });
    });
    modal.addEventListener('close', () => {
      ekran.innerHTML = '';
      if (ostatniFokus) ostatniFokus.focus();
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
  }
})();
