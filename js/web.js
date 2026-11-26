// WEB — "Mājas lapas". The visitor picks a starting point (landing / shop / custom); the browser plays that type
// through the four steps on a demo page for a made-up brand (MIGLA):
// 01 Saruna = a short chat over the sketch · 02 Skice = wireframe, then the design + "approved" stamp ·
// 03 Izstrāde = pictures come in · 04 Palaišana = live, the film plays, a cursor clicks the main button.
// Loops while on screen; clicking a step stops the loop on that step. Reduced motion: the finished page.
(function () {
  const sec = document.getElementById('web');
  if (!sec) return;
  const mock = document.getElementById('webMock');
  const status = document.getElementById('webStatus');
  const cta = document.getElementById('webCta');
  const types = Array.from(sec.querySelectorAll('.web__type'));
  const steps = Array.from(sec.querySelectorAll('.web__step'));
  const cursor = mock.querySelector('.m-cursor');
  const toast = mock.querySelector('.m-toast');
  const cart = mock.querySelector('.m-cart');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const quiet = reduce || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  const NAMES = ['Saruna', 'Skice', 'Izstrāde', 'Tiešsaistē'];
  const DUR = [3600, 3000, 2600, 4200];
  let cur = 0, auto = true, inView = false, timers = [];

  // stagger: every bar, button and picture changes a moment after the one before it
  mock.querySelectorAll('.lay').forEach(l => l.querySelectorAll('.t, .m-btn, .m-img').forEach((el, i) => el.style.setProperty('--d', Math.min(i * 0.03, 0.6).toFixed(2) + 's')));

  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; };
  const layer = () => mock.querySelector('.lay--' + mock.dataset.type);

  function syncVideo() {
    const v = layer().querySelector('.m-vid');
    mock.querySelectorAll('.m-vid').forEach(o => { if (o !== v) o.pause(); });
    if (!v) return;
    if (mock.dataset.step === '3' && inView && !quiet) {
      if (!v.getAttribute('src')) { v.addEventListener('playing', () => v.classList.add('is-ready'), { once: true }); v.src = v.dataset.src; }
      const p = v.play(); if (p && p.catch) p.catch(() => {});
    } else v.pause();
  }

  function resetDemo() {
    cursor.classList.remove('is-on');
    if (toast) toast.classList.remove('is-show');
    mock.querySelectorAll('.is-click').forEach(e => e.classList.remove('is-click'));
  }

  function demo() {
    if (!inView || reduce) return;
    const t = layer().querySelector('.js-target');
    if (!t) return;
    const m = mock.getBoundingClientRect(), r = t.getBoundingClientRect();
    cursor.style.transition = 'none';
    cursor.style.transform = 'translate(' + m.width * 0.9 + 'px,' + m.height * 0.96 + 'px)';
    void cursor.offsetWidth;
    cursor.classList.add('is-on');
    cursor.style.transition = 'transform 1000ms cubic-bezier(.2,.7,.2,1), opacity .3s';
    cursor.style.transform = 'translate(' + (r.left - m.left + r.width * 0.62) + 'px,' + (r.top - m.top + r.height * 0.6) + 'px)';
    later(() => {
      t.classList.add('is-click');
      later(() => t.classList.remove('is-click'), 240);
      if (mock.dataset.type === 'shop' && cart) {
        const n = cart.querySelector('b'); n.textContent = String(Number(n.textContent) + 1);
        toast.classList.add('is-show');
        later(() => toast.classList.remove('is-show'), 1600);
      }
      later(() => cursor.classList.remove('is-on'), 1000);
    }, 1100);
  }

  // one process step = how the demo page looks
  function show(i, run) {
    stop(); resetDemo();
    cur = i;
    steps.forEach((b, k) => {
      b.classList.toggle('is-on', k === i);
      b.classList.toggle('is-run', !!run && k === i);
      b.style.setProperty('--dur', DUR[i] + 'ms');
      b.setAttribute('aria-current', k === i ? 'step' : 'false');
    });
    status.textContent = NAMES[i];
    status.classList.toggle('is-live', i === 3);
    mock.classList.toggle('is-chat', i === 0);
    mock.classList.remove('is-ok');
    if (i === 0) mock.dataset.step = '0';
    if (i === 1) { mock.dataset.step = '0'; later(() => { mock.dataset.step = '1'; mock.classList.add('is-ok'); }, reduce ? 0 : 1200); }
    if (i === 2) mock.dataset.step = '2';
    if (i === 3) { mock.dataset.step = '3'; later(demo, 900); }
    syncVideo();
    if (run) later(() => show((i + 1) % 4, true), DUR[i]);
  }

  types.forEach(b => b.addEventListener('click', () => {
    types.forEach(o => { o.classList.toggle('is-on', o === b); o.setAttribute('aria-checked', String(o === b)); });
    mock.dataset.type = b.dataset.type;
    if (cart) cart.querySelector('b').textContent = '0';
    auto = !reduce;
    show(reduce ? 3 : 0, auto && inView);
  }));

  steps.forEach((b, i) => b.addEventListener('click', () => { auto = false; show(i, false); }));

  cta.addEventListener('click', () => {
    const sel = document.getElementById('service');
    if (sel) sel.value = mock.dataset.type === 'shop' ? 'E-veikals' : 'Mājas lapa';
  });

  if (reduce || !('IntersectionObserver' in window)) { inView = true; show(3, false); return; }
  show(0, false);
  new IntersectionObserver(entries => entries.forEach(({ isIntersecting, intersectionRatio }) => {
    const was = inView;
    inView = isIntersecting && intersectionRatio >= 0.35;
    if (inView && !was && auto) show(cur, true);
    if (!inView && was) { stop(); resetDemo(); syncVideo(); }
  }), { threshold: [0, 0.35] }).observe(mock);
})();
