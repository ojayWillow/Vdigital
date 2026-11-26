// WEB — "Mājas lapas". The visitor picks a site type (one page / company site / shop / redesign) and a look
// (calm / with video / colour). A demo page for a made-up brand (MIGLA) builds inside the browser frame:
// 01 sketch → 02 design → 03 content → 04 live, then a cursor clicks the main button (shop: adds to cart;
// redesign: drags the before/after line). Plays once when the section comes into view and again on every type change.
// The steps under the frame can be clicked. Reduced motion: the finished page, no film, no cursor.
(function () {
  const sec = document.getElementById('web');
  if (!sec) return;
  const mock = document.getElementById('webMock');
  const status = document.getElementById('webStatus');
  const range = document.getElementById('webRange');
  const cta = document.getElementById('webCta');
  const opts = Array.from(sec.querySelectorAll('.web__opt'));
  const chips = Array.from(sec.querySelectorAll('.web__chip'));
  const steps = Array.from(sec.querySelectorAll('.web__step'));
  const cursor = mock.querySelector('.m-cursor');
  const toast = mock.querySelector('.m-toast');
  const cart = mock.querySelector('.m-cart');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const quiet = reduce || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  const NAMES = ['Skice', 'Dizains', 'Saturs', 'Tiešsaistē'];
  const TYPES = { landing: 'vienas lapas mājas lapa', site: 'uzņēmuma mājas lapa', shop: 'e-veikals', redo: 'esošās lapas pārveide' };
  const LOOKS = { calm: 'kluss', motion: 'ar video', colour: 'krāsains' };
  const STEP_MS = 1300;
  let step = 3, inView = false, started = false, timers = [], raf = 0;

  // stagger: every bar, button and picture in a layout changes a moment after the one before it
  mock.querySelectorAll('.lay').forEach(l => l.querySelectorAll('.t, .m-btn, .m-img').forEach((el, i) => el.style.setProperty('--d', Math.min(i * 0.03, 0.6).toFixed(2) + 's')));

  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); };
  const layer = () => mock.querySelector('.lay--' + mock.dataset.type);
  const box = () => mock.getBoundingClientRect();

  function syncVideo() {
    const v = layer().querySelector('.m-vid');
    mock.querySelectorAll('.m-vid').forEach(o => { if (o !== v) o.pause(); });
    if (!v) return;
    if (step === 3 && mock.dataset.style === 'motion' && inView && !quiet) {
      if (!v.getAttribute('src')) { v.addEventListener('playing', () => v.classList.add('is-ready'), { once: true }); v.src = v.dataset.src; }
      const p = v.play(); if (p && p.catch) p.catch(() => {});
    } else v.pause();
  }

  function setStep(n, running) {
    step = n; mock.dataset.step = n;
    steps.forEach((b, i) => {
      b.classList.toggle('is-done', i < n);
      b.classList.toggle('is-on', i === n);
      b.classList.toggle('is-run', !!running && i === n);
      b.setAttribute('aria-pressed', String(i === n));
    });
    status.textContent = NAMES[n];
    status.classList.toggle('is-live', n === 3);
    syncVideo();
  }

  function resetDemo() {
    cursor.classList.remove('is-on');
    toast.classList.remove('is-show');
    cart.classList.remove('is-bump');
    mock.querySelectorAll('.is-click').forEach(e => e.classList.remove('is-click'));
  }

  function build(from) {
    stop(); resetDemo();
    if (reduce) { setStep(3); return; }
    for (let s = from; s <= 3; s++) later(() => { setStep(s, s < 3); if (s === 3) later(demo, 600); }, (s - from) * STEP_MS);
  }

  // cursor: the tip of the arrow sits at the element's point
  const put = (x, y, ms) => { cursor.style.transition = ms ? 'transform ' + ms + 'ms cubic-bezier(.2,.7,.2,1), opacity .3s' : 'opacity .3s'; cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)'; };
  const setCut = v => { mock.style.setProperty('--cut', v); range.value = Math.round(v); };

  function sweep(a, b, ms, done) {
    const t0 = performance.now(), m = box();
    const f = now => {
      const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, v = a + (b - a) * e;
      setCut(v); put(m.width * v / 100, m.height * 0.5);
      if (k < 1) raf = requestAnimationFrame(f); else if (done) done();
    };
    raf = requestAnimationFrame(f);
  }

  function demo() {
    if (!inView) return;
    const m = box();
    put(m.width * 0.9, m.height * 0.96);
    void cursor.offsetWidth;
    cursor.classList.add('is-on');
    if (mock.dataset.type === 'redo') {
      put(m.width * 0.5, m.height * 0.5, 900);
      later(() => sweep(50, 86, 1000, () => sweep(86, 30, 1300, () => sweep(30, 55, 700, () => later(() => cursor.classList.remove('is-on'), 500)))), 1000);
      return;
    }
    const t = layer().querySelector('.js-target'), r = t.getBoundingClientRect();
    put(r.left - m.left + r.width * 0.62, r.top - m.top + r.height * 0.6, 1000);
    later(() => {
      t.classList.add('is-click');
      later(() => t.classList.remove('is-click'), 240);
      if (mock.dataset.type === 'shop') {
        const n = cart.querySelector('b'); n.textContent = String(Number(n.textContent) + 1);
        cart.classList.add('is-bump'); toast.classList.add('is-show');
        later(() => { toast.classList.remove('is-show'); cart.classList.remove('is-bump'); }, 1800);
      }
      later(() => cursor.classList.remove('is-on'), 1100);
    }, 1100);
  }

  const pick = (list, el) => list.forEach(o => { o.classList.toggle('is-on', o === el); o.setAttribute('aria-checked', String(o === el)); });

  opts.forEach(b => b.addEventListener('click', () => {
    if (mock.dataset.type === b.dataset.type) return;
    pick(opts, b);
    mock.dataset.type = b.dataset.type;
    setCut(50);
    build(0);
  }));

  chips.forEach(c => c.addEventListener('click', () => {
    if (mock.dataset.style === c.dataset.style) return;
    pick(chips, c);
    mock.dataset.style = c.dataset.style;
    syncVideo();
  }));

  steps.forEach((b, i) => b.addEventListener('click', () => {
    stop(); resetDemo(); setStep(i);
    if (i === 3 && !reduce) later(demo, 400);
  }));

  range.addEventListener('input', () => { stop(); resetDemo(); setCut(Number(range.value)); });

  // the chosen type and look go into the contact form
  cta.addEventListener('click', () => {
    const sel = document.getElementById('service');
    const msg = document.getElementById('message');
    const type = mock.dataset.type, look = mock.dataset.style;
    if (sel) sel.value = type === 'shop' ? 'E-veikals' : look === 'motion' ? 'Mājas lapa un video' : 'Mājas lapa';
    if (msg && !msg.value.trim()) msg.value = 'Interesē: ' + TYPES[type] + ', stils "' + LOOKS[look] + '".';
  });

  if (reduce || !('IntersectionObserver' in window)) { inView = true; setStep(3); return; }
  setStep(0);
  new IntersectionObserver(entries => entries.forEach(({ isIntersecting, intersectionRatio }) => {
    inView = isIntersecting;
    if (intersectionRatio >= 0.45 && !started) { started = true; build(0); }
    syncVideo();
  }), { threshold: [0, 0.45] }).observe(mock);
})();
