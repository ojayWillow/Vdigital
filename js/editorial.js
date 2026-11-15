// EDITORIAL — reveals, the MMK work film, service links → form, finale film
(function () {
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  // 3) Work: the MMK film loads and plays only while it is on screen
  const cv = document.querySelector('.case__video');
  if (cv && !reduce && !saveData && hasIO) {
    new IntersectionObserver(entries => entries.forEach(({ isIntersecting }) => {
      if (isIntersecting) {
        if (!cv.getAttribute('src')) cv.src = cv.dataset.src;
        const p = cv.play(); if (p && p.catch) p.catch(() => {});
      } else if (cv.getAttribute('src')) cv.pause();
    }), { rootMargin: '200px 0px', threshold: 0.2 }).observe(cv);
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
