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

  // 1) Walk: vertical scroll drives the street sideways while the section is pinned
  let distance = 0, ticking = false;
  function measure() {
    const walk = desktop.matches && !reduce;
    street.classList.toggle('is-walk', walk);
    if (!walk) { pin.style.height = ''; track.style.transform = ''; return; }
    const last = track.lastElementChild;
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    distance = Math.max(0, last.offsetLeft + last.offsetWidth + pad - window.innerWidth);
    pin.style.height = (window.innerHeight + distance) + 'px';
    update();
  }
  function update() {
    ticking = false;
    if (!street.classList.contains('is-walk')) return;
    const top = pin.getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, -top / Math.max(1, distance)));
    track.style.transform = 'translate3d(' + (-p * distance) + 'px,0,0)';
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', measure);
  desktop.addEventListener ? desktop.addEventListener('change', measure) : desktop.addListener(measure);
  measure();

  // 2) Shop windows: load + play only while visible
  if (!reduce && !saveData && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(({ target: v, isIntersecting }) => {
        if (isIntersecting) {
          if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src;
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
