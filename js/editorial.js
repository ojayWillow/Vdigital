// EDITORIAL — reveals, index page-peek, scrolling page reels, price → form, finale film
(function () {
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const conn = navigator.connection || {};
  const saveData = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  const hasIO = 'IntersectionObserver' in window;

  // 1) Reveal on scroll, small stagger between siblings
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reduce || !hasIO) reveals.forEach(el => el.classList.add('is-in'));
  else {
    const io = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      const sibs = Array.from(target.parentElement.children).filter(c => c.hasAttribute('data-reveal'));
      target.style.setProperty('--d', (Math.max(0, sibs.indexOf(target)) % 4) * 0.08 + 's');
      target.classList.add('is-in');
      io.unobserve(target);
    }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  }

  // 2) Website index: a real page from the portfolio follows the cursor
  const ix = document.getElementById('ix');
  const peek = document.querySelector('.ix__peek');
  if (ix && peek && finePointer && !reduce) {
    const img = peek.querySelector('img');
    const W = 300, H = 225;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, on = false, placed = false;
    const loop = () => {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      const tilt = Math.max(-7, Math.min(7, (tx - x) * 0.05));
      peek.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + tilt.toFixed(2) + 'deg)';
      raf = (on || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) ? requestAnimationFrame(loop) : 0;
    };
    ix.addEventListener('mousemove', e => {
      tx = e.clientX + 28 + W > window.innerWidth ? e.clientX - 28 - W : e.clientX + 28;
      ty = Math.max(12, Math.min(window.innerHeight - H - 12, e.clientY - H / 2));
      if (!placed) { x = tx; y = ty; placed = true; }
      if (!raf) raf = requestAnimationFrame(loop);
    });
    ix.querySelectorAll('.ix__row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        if (img.getAttribute('src') !== row.dataset.img) img.src = row.dataset.img;
        peek.classList.add('is-on'); on = true;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      row.addEventListener('mouseleave', () => { peek.classList.remove('is-on'); on = false; });
    });
    ix.addEventListener('mouseleave', () => { placed = false; });
  }

  // 3) Work reels: how far each page can scroll inside its frame
  const reels = document.querySelectorAll('.reel__item');
  const setShift = () => reels.forEach(item => {
    const frame = item.querySelector('.reel__frame');
    const im = frame && frame.querySelector('img');
    if (!im) return;
    const ratio = (im.naturalHeight || +im.getAttribute('height')) / (im.naturalWidth || +im.getAttribute('width'));
    const shift = Math.max(0, frame.clientWidth * ratio - frame.clientHeight);
    item.style.setProperty('--shift', (-shift).toFixed(0) + 'px');
  });
  setShift();
  window.addEventListener('resize', setShift, { passive: true });
  // phones have no hover: let the page scroll by itself while it is on screen
  if (!finePointer && !reduce && hasIO) {
    const rio = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('is-play', e.isIntersecting)), { threshold: 0.5 });
    reels.forEach(r => rio.observe(r));
  }

  // 4) Price rows pre-select the package in the contact form
  document.querySelectorAll('[data-service]').forEach(a => a.addEventListener('click', () => {
    const sel = document.getElementById('service');
    if (!sel) return;
    Array.from(sel.options).forEach(o => { if (o.text === a.dataset.service) sel.value = o.value; });
  }));

  // 5) Finale: the empty shop again, loaded only when it comes near
  const fv = document.querySelector('.finale .shop__video');
  if (fv && !reduce && !saveData && hasIO) {
    new IntersectionObserver(entries => entries.forEach(({ isIntersecting }) => {
      if (isIntersecting) {
        if (!fv.getAttribute('src')) fv.src = (window.innerWidth * (window.devicePixelRatio || 1) >= 1800 && fv.dataset.srcHd) || fv.dataset.src;
        const p = fv.play(); if (p && p.catch) p.catch(() => {});
      } else if (fv.getAttribute('src')) fv.pause();
    }), { rootMargin: '200px 0px' }).observe(fv);
  }
})();
