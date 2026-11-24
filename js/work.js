// WORK — the slideshow under the hero.
// The slide nearest the strip's middle is "on": it loads, plays muted and drives the 01 / 06 counter.
// Videos load only when the section is near the screen. Reduced motion / save-data: nothing autoplays, tap plays.
(function () {
  const track = document.getElementById('workTrack');
  if (!track) return;
  const section = track.closest('section');
  const slides = Array.from(track.querySelectorAll('.slide'));
  const videoSlides = slides.filter(s => s.querySelector('.slide__video'));
  const now = document.getElementById('workNow');
  const all = document.getElementById('workAll');
  const prev = document.getElementById('workPrev');
  const next = document.getElementById('workNext');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const quiet = reduce || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  const pad = n => String(n).padStart(2, '0');
  let current = 0;
  let inView = false;

  all.textContent = pad(videoSlides.length);

  const video = s => s.querySelector('.slide__video');

  // Phones and tablets get the light 720p file (data-src-m): 2K clips stutter there while swiping.
  const small = window.matchMedia('(max-width: 900px)').matches;
  const load = v => { if (v && !v.getAttribute('src')) v.src = (small && v.dataset.srcM) || v.dataset.src; };
  const play = v => { if (!v) return; load(v); const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  const mute = s => {
    const b = s.querySelector('.slide__sound'); const v = video(s);
    if (!b || !v) return;
    v.muted = true; b.setAttribute('aria-pressed', 'false'); b.textContent = 'Ieslēgt skaņu';
  };

  // the "on" slide is the one whose middle sits closest to the strip's middle
  const middle = () => { const r = track.getBoundingClientRect(); return r.left + r.width / 2; };
  const centre = s => { const r = s.getBoundingClientRect(); return r.left + r.width / 2; };
  const nearest = () => {
    const m = middle();
    let best = 0, dist = Infinity;
    slides.forEach((s, i) => { const d = Math.abs(centre(s) - m); if (d < dist) { dist = d; best = i; } });
    return best;
  };

  let activatedAt = 0;
  const activate = i => {
    if (i !== current) activatedAt = performance.now();
    current = i;
    slides.forEach((s, n) => {
      s.classList.toggle('is-on', n === i);
      if (n !== i) { const v = video(s); if (v) v.pause(); mute(s); }
    });
    const vi = videoSlides.indexOf(slides[i]);
    now.textContent = pad(vi < 0 ? videoSlides.length : vi + 1);
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    // keep the neighbour ready so the next swipe is instant
    if (inView) { play(video(slides[i])); load(video(slides[i + 1] || slides[i])); }
  };

  // Clicking a card, an arrow or a key glides that card to the middle and plays it.
  // While the glide runs, the chosen card stays on (the scroll handler must not pick a neighbour).
  let pending = -1, settle = 0;
  const go = i => {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const delta = centre(slides[i]) - middle();
    activate(i);
    if (Math.abs(delta) < 4) { pending = -1; return; }
    pending = i;
    clearTimeout(settle); settle = setTimeout(() => { pending = -1; }, 900);
    track.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' });
  };
  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
  });

  let raf = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (pending >= 0) { if (pending !== current) activate(pending); return; }
      const i = nearest(); if (i !== current) activate(i);
    });
  }, { passive: true });
  // a swipe or wheel by hand ends any pending click
  ['pointerdown', 'wheel', 'touchstart'].forEach(ev => track.addEventListener(ev, () => { pending = -1; }, { passive: true }));

  // tap a frame: bring that slide in, or play/pause it if it is already on
  slides.forEach((s, i) => {
    const frame = s.querySelector('.slide__frame');
    if (!frame) return;
    frame.addEventListener('click', () => {
      if (i !== current) { go(i); return; }
      const v = video(s);
      // a tap on a card that has only just slid into the middle starts it, never stops it
      if (v.paused || performance.now() - activatedAt < 600) play(v); else v.pause();
    });
    const b = s.querySelector('.slide__sound');
    if (b) b.addEventListener('click', e => {
      e.stopPropagation();
      const v = video(s);
      const on = v.muted;
      v.muted = !on;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? 'Izslēgt skaņu' : 'Ieslēgt skaņu';
      if (i !== current) go(i);
      play(v);
    });
  });

  // play only while the section is on screen
  if (!quiet && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => entries.forEach(({ isIntersecting }) => {
      inView = isIntersecting;
      if (isIntersecting) activate(current);
      else slides.forEach(s => { const v = video(s); if (v) v.pause(); mute(s); });
    }), { rootMargin: '100px 0px', threshold: 0.2 }).observe(section);
  } else {
    // no autoplay: show posters, load a clip only when tapped
    slides.forEach(s => { const v = video(s); if (v) v.preload = 'none'; });
  }

  activate(0);

  // WIDE — the 16:9 clips under the strip: each one loads shortly before it scrolls in,
  // plays muted while at least half of it is on screen and pauses when it leaves. A tap plays or pauses it.
  const wides = Array.from(document.querySelectorAll('.wide__video'));
  wides.forEach(v => v.closest('.wide__frame').addEventListener('click', () => { if (v.paused) play(v); else v.pause(); }));
  if (!quiet && 'IntersectionObserver' in window) {
    const near = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { load(e.target); near.unobserve(e.target); } }), { rootMargin: '300px 0px' });
    const seen = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) play(e.target); else e.target.pause(); }), { threshold: 0.5 });
    wides.forEach(v => { near.observe(v); seen.observe(v); });
  }
})();
