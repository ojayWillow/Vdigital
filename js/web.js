// WEB — "Mājas lapas" configurator.
// The visitor picks a base (one page / company site / shop), a look, and switches features on.
// Each feature is every .fx[data-f] in the window: switching it on shows them, scrolls the demo page to the first one
// and flashes it gold. Checkout features (payments, parcel lockers) slide in the checkout panel.
// When the section first comes into view, three features switch on by themselves to show how it works;
// any click by the visitor stops that. "Pieteikt sarunu" writes the choice into the contact form.
(function () {
  const sec = document.getElementById('web');
  if (!sec) return;
  const view = document.getElementById('webView');
  const page = document.getElementById('webMock');
  const checkout = document.getElementById('webCheckout');
  const count = document.getElementById('webCount');
  const sum = document.getElementById('webSum');
  const cta = document.getElementById('webCta');
  const clearBtn = document.getElementById('webClear');
  const cursor = view.querySelector('.m-cursor');
  const toast = view.querySelector('.m-toast');
  const cart = view.querySelector('.m-cart');
  const baseBtns = Array.from(sec.querySelectorAll('.web__seg [data-base]'));
  const lookBtns = Array.from(sec.querySelectorAll('.web__seg [data-look]'));
  const feats = Array.from(sec.querySelectorAll('.web__f'));
  const onlyShop = Array.from(sec.querySelectorAll('.web__panel [data-only="shop"]'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const quiet = reduce || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');

  const BASES = { landing: 'Vienas lapas mājas lapa', site: 'Uzņēmuma mājas lapa', shop: 'E-veikals' };
  const LOOKS = { calm: 'kluss', dark: 'tumšs', colour: 'krāsains' };
  const SHOP_ONLY = ['pay', 'parcel', 'gift', 'acct', 'pvideo'];
  const CHECKOUT = ['pay', 'parcel'];
  const TOP = ['video', 'lang', 'acct', 'admin'];
  const name = f => { const b = feats.find(x => x.dataset.f === f); return b ? b.textContent.trim() : f; };
  const on = new Set();
  let inView = false, demoTimers = [], lastAuto = '';

  // ── base: show the parts of the demo page that belong to it ──
  function setBase(base) {
    view.dataset.base = base;
    view.querySelectorAll('[data-base]').forEach(el => { el.hidden = !el.dataset.base.split(' ').includes(base); });
    onlyShop.forEach(el => { el.hidden = base !== 'shop'; });
    if (base !== 'shop') SHOP_ONLY.forEach(f => on.has(f) && setFeat(f, false));
    baseBtns.forEach(b => { const is = b.dataset.base === base; b.classList.toggle('is-on', is); b.setAttribute('aria-checked', String(is)); });
    closeCheckout();
    page.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    update();
  }

  function setLook(look) {
    view.dataset.look = look;
    lookBtns.forEach(b => { const is = b.dataset.look === look; b.classList.toggle('is-on', is); b.setAttribute('aria-checked', String(is)); });
    update();
  }

  // ── features ──
  const els = f => Array.from(view.querySelectorAll('.fx[data-f="' + f + '"]'));
  const visible = el => !el.closest('[hidden]') && el.getClientRects().length > 0;

  function flash(el) {
    el.classList.remove('is-new'); void el.offsetWidth; el.classList.add('is-new');
    setTimeout(() => el.classList.remove('is-new'), 1900);
  }

  function scrollTo(el) {
    const top = el.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop - page.clientHeight * 0.22;
    page.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  }

  function setFeat(f, state, show) {
    if (state) on.add(f); else on.delete(f);
    feats.filter(b => b.dataset.f === f).forEach(b => b.setAttribute('aria-pressed', String(state)));
    els(f).forEach(el => el.classList.toggle('is-on', state));
    view.classList.toggle('f-' + f, state);
    syncVideo();
    if (!state || !show) { if (!state && CHECKOUT.includes(f) && !CHECKOUT.some(x => on.has(x))) closeCheckout(); update(); return; }

    if (CHECKOUT.includes(f) && view.dataset.base === 'shop') openCheckout();
    else closeCheckout();
    if (TOP.includes(f)) page.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    const inPage = els(f).filter(el => page.contains(el) && visible(el));
    if (inPage.length && !TOP.includes(f)) scrollTo(inPage[0]);
    els(f).filter(visible).forEach(flash);
    update();
  }

  function openCheckout() { checkout.classList.add('is-open'); }
  function closeCheckout() { checkout.classList.remove('is-open'); }

  // films play only while the section is on screen
  function syncVideo() {
    view.querySelectorAll('.m-vid').forEach(v => {
      if (v.classList.contains('is-on') && inView && !quiet && visible(v)) {
        if (!v.getAttribute('src')) v.src = v.dataset.src;
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      } else v.pause();
    });
  }

  // ── count, summary ──
  const word = n => n % 10 === 1 && n % 100 !== 11 ? 'funkcija' : n === 0 ? 'funkciju' : 'funkcijas';
  function chosen() { return feats.filter(b => on.has(b.dataset.f) && !b.hidden && !b.closest('[hidden]')).map(b => b.dataset.f).filter((f, i, a) => a.indexOf(f) === i); }
  function update() {
    const list = chosen();
    count.textContent = list.length + ' ' + word(list.length);
    sum.innerHTML = '<b>' + BASES[view.dataset.base] + '</b>, izskats ' + LOOKS[view.dataset.look] +
      (list.length ? ' + ' + list.length + ' ' + word(list.length) + ':<br/><em>' + list.map(name).join(', ') + '</em>' : '.');
  }

  // ── shop: a click on "Grozā" when the shop opens ──
  function shopDemo() {
    const btn = view.querySelector('.js-add');
    if (!btn || !visible(btn) || reduce || !inView) return;
    page.scrollTo({ top: btn.closest('.m-sec').offsetTop - page.clientHeight * 0.12, behavior: 'smooth' });
    setTimeout(() => {
      const v = view.getBoundingClientRect(), r = btn.getBoundingClientRect();
      cursor.style.transition = 'none';
      cursor.style.transform = 'translate(' + v.width * 0.92 + 'px,' + v.height * 0.95 + 'px)';
      void cursor.offsetWidth;
      cursor.classList.add('is-on');
      cursor.style.transition = 'transform 900ms cubic-bezier(.2,.7,.2,1), opacity .3s';
      cursor.style.transform = 'translate(' + (r.left - v.left + r.width * 0.6) + 'px,' + (r.top - v.top + r.height * 0.6) + 'px)';
      setTimeout(() => {
        btn.classList.add('is-click'); setTimeout(() => btn.classList.remove('is-click'), 240);
        const n = cart.querySelector('b'); n.textContent = String(Number(n.textContent) + 1);
        cart.classList.add('is-bump'); toast.classList.add('is-show');
        setTimeout(() => { cart.classList.remove('is-bump'); toast.classList.remove('is-show'); cursor.classList.remove('is-on'); }, 1600);
      }, 1000);
    }, 600);
  }

  // ── first view: three switches turn on by themselves ──
  function stopDemo() { demoTimers.forEach(clearTimeout); demoTimers = []; }
  function demo() {
    if (reduce) return;
    [['video', 700], ['reviews', 2300], ['wa', 3900]].forEach(([f, t]) => demoTimers.push(setTimeout(() => { if (!on.has(f)) setFeat(f, true, true); }, t)));
    demoTimers.push(setTimeout(() => page.scrollTo({ top: 0, behavior: 'smooth' }), 5200));
  }

  // ── wiring ──
  sec.querySelector('.web__panel').addEventListener('click', stopDemo, true);
  baseBtns.forEach(b => b.addEventListener('click', () => {
    if (view.dataset.base === b.dataset.base) return;
    setBase(b.dataset.base);
    if (b.dataset.base === 'shop') setTimeout(shopDemo, 500);
  }));
  lookBtns.forEach(b => b.addEventListener('click', () => setLook(b.dataset.look)));
  feats.forEach(b => b.addEventListener('click', () => setFeat(b.dataset.f, !on.has(b.dataset.f), true)));
  clearBtn.addEventListener('click', () => { Array.from(on).forEach(f => setFeat(f, false)); closeCheckout(); page.scrollTo({ top: 0, behavior: 'smooth' }); });
  checkout.querySelector('.m-x').addEventListener('click', closeCheckout);
  page.addEventListener('click', closeCheckout);

  cta.addEventListener('click', () => {
    const sel = document.getElementById('service');
    const msg = document.getElementById('message');
    const base = view.dataset.base, list = chosen();
    if (sel) sel.value = base === 'shop' ? 'E-veikals' : (on.has('video') ? 'Mājas lapa un video' : 'Mājas lapa');
    const text = 'Interesē: ' + BASES[base].toLowerCase() + ', izskats ' + LOOKS[view.dataset.look] + '.' + (list.length ? '\nFunkcijas: ' + list.map(name).join(', ') + '.' : '');
    if (msg && (!msg.value.trim() || msg.value === lastAuto)) { msg.value = text; lastAuto = text; }
  });

  setBase('landing');
  if (!('IntersectionObserver' in window)) { inView = true; syncVideo(); return; }
  let started = false;
  new IntersectionObserver(entries => entries.forEach(({ isIntersecting, intersectionRatio }) => {
    inView = isIntersecting;
    if (intersectionRatio >= 0.5 && !started) { started = true; demo(); }
    if (!inView) stopDemo();
    syncVideo();
  }), { threshold: [0, 0.5] }).observe(view);
})();
