/* Beko PyroPro – interakcje. Zero zależności, progressive enhancement. */
(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');

  /* ---------- Rok w stopce ---------- */
  document.querySelectorAll('[data-rok]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Animacje wejścia (IntersectionObserver) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  const zredukowany = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || zredukowany) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((wpisy) => {
      wpisy.forEach((w) => { if (w.isIntersecting) { w.target.classList.add('is-visible'); io.unobserve(w.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
  }

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
      prev.hidden = next.hidden = !przewijalna;
      if (!przewijalna) return;
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

  const osadz = (src, nazwa) => {
    ekran.innerHTML = '';
    if (!src) {
      const p = document.createElement('p');
      p.className = 'modal__brak';
      p.textContent = 'Film „' + nazwa + '” zostanie podpięty po dostarczeniu pliku wideo lub adresu YouTube.';
      ekran.appendChild(p);
      return;
    }
    const yt = src.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
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
      v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute('aria-label', nazwa);
      ekran.appendChild(v);
    }
  };

  if (modal && typeof modal.showModal === 'function') {
    document.querySelectorAll('[data-wideo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        ostatniFokus = btn;
        const nazwa = btn.dataset.tytul || 'Film';
        tytul.textContent = nazwa;
        osadz(btn.dataset.wideo, nazwa);
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
