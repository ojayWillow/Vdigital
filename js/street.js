// VDIGITAL IELA — horizontal walk on desktop, lazy shop-window loops, the visitor's sign

(function initStreet() {
  const street = document.querySelector('.street');
  if (!street) return;
  const pin = street.querySelector('.street__pin');
  const track = street.querySelector('.street__track');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const saveData = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  const desktop = window.matchMedia('(min-width: 901px)');

  // 1) Walk: vertical scroll drives the street sideways while the stage is pinned.
  //    The window you are passing is lit, the route map follows, rain drifts at two depths.
  const stage = street.querySelector('.street__stage');
  const shops = Array.from(track.querySelectorAll('.shop'));
  const stops = Array.from(street.querySelectorAll('.street__map button'));
  const line = street.querySelector('.street__line i');
  const rain = street.querySelector('.street__rain');
  let distance = 0, ticking = false, lit = -1;
  const isWalk = () => street.classList.contains('is-walk');

  function light(idx, p) {
    if (line) line.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    if (idx === lit) return;
    lit = idx;
    shops.forEach((s, k) => s.classList.toggle('is-lit', k === idx));
    stops.forEach((b, k) => { b.classList.toggle('is-on', k === idx); b.setAttribute('aria-current', k === idx ? 'step' : 'false'); });
  }
  function nearest(offset) { // index of the shop whose centre is closest to the middle of the screen
    const mid = offset + window.innerWidth / 2;
    let best = 0, d = Infinity;
    shops.forEach((s, k) => { const c = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid); if (c < d) { d = c; best = k; } });
    return best;
  }
  function measure() {
    const walk = desktop.matches && !reduce;
    street.classList.toggle('is-walk', walk);
    if (!walk) { pin.style.height = ''; track.style.transform = ''; swipe(); return; }
    const last = shops[shops.length - 1];
    const pad = parseFloat(getComputedStyle(track).paddingRight) || 0;
    distance = Math.max(0, last.offsetLeft + last.offsetWidth + pad - window.innerWidth);
    pin.style.height = (window.innerHeight - 68 + distance) + 'px';
    lit = -1; update();
  }
  function update() {
    ticking = false;
    if (!isWalk()) return;
    const top = pin.getBoundingClientRect().top - 68;
    const p = Math.min(1, Math.max(0, -top / Math.max(1, distance)));
    const x = p * distance;
    track.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
    if (rain) { rain.style.setProperty('--rn', (-x * 0.35).toFixed(1) + 'px'); rain.style.setProperty('--rf', (x * 0.12).toFixed(1) + 'px'); }
    light(nearest(x), p);
  }
  // phones / reduced motion: the row is swiped, the map follows the swipe
  function swipe() {
    const max = Math.max(1, track.scrollWidth - track.clientWidth);
    light(nearest(track.scrollLeft), track.scrollLeft / max);
  }
  track.addEventListener('scroll', () => { if (!isWalk()) requestAnimationFrame(swipe); }, { passive: true });
  stops.forEach((b, k) => b.addEventListener('click', () => {
    const s = shops[k];
    const target = s.offsetLeft + s.offsetWidth / 2 - window.innerWidth / 2;
    if (isWalk()) {
      const pinTop = pin.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top: pinTop + Math.min(distance, Math.max(0, target)), behavior: reduce ? 'auto' : 'smooth' });
    } else {
      track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
    }
  }));
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', measure);
  desktop.addEventListener ? desktop.addEventListener('change', measure) : desktop.addListener(measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();

  // 2) Shop windows: load + play only while visible
  // big or sharp screens get the 1080p cut, phones and small laptops the 720p one
  const hd = window.innerWidth * (window.devicePixelRatio || 1) >= 1800;
  if (!reduce && !saveData && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(({ target: v, isIntersecting }) => {
        if (isIntersecting) {
          if (!v.getAttribute('src') && v.dataset.src) v.src = (hd && v.dataset.srcHd) || v.dataset.src;
          const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
        } else if (v.getAttribute('src')) v.pause();
      });
    }, { rootMargin: '0px 200px', threshold: 0.2 });
    street.querySelectorAll('.shop__video').forEach(v => io.observe(v));
  }

  // 3) "Šis skatlogs ir jūsu": put the visitor's name on every sign (street + finale), then hand it to the contact form
  const form = document.getElementById('shopForm');
  const input = document.getElementById('shopName');
  const signs = Array.from(document.querySelectorAll('.shop__sign')).map(el => ({ el, text: el.querySelector('span') })).filter(s => s.text);
  if (form && input && signs.length) {
    const fallback = signs[0].text.textContent;
    // shrink long names so they stay on the fascia
    const fit = () => signs.forEach(({ el, text }) => {
      el.style.setProperty('--sign-fit', 1);
      const room = el.clientWidth * 0.94, w = text.scrollWidth;
      if (room && w > room) el.style.setProperty('--sign-fit', (room / w).toFixed(3));
    });
    fit();
    window.addEventListener('resize', fit, { passive: true });
    let t;
    input.addEventListener('input', () => {
      clearTimeout(t);
      signs.forEach(s => s.el.classList.add('is-swapping'));
      t = setTimeout(() => {
        signs.forEach(s => { s.text.textContent = input.value.trim() || fallback; });
        fit();
        signs.forEach(s => s.el.classList.remove('is-swapping'));
      }, 180);
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = input.value.trim();
      const msg = document.getElementById('message');
      if (name && msg && !msg.value) msg.value = 'Uzņēmums: ' + name + '\n';
      const contact = document.getElementById('contact');
      if (contact) contact.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(() => { const f = document.getElementById('name'); if (f) f.focus({ preventScroll: true }); }, reduce ? 0 : 700);
    });
  }
})();
