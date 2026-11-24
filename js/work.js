// WORK — the slideshow under the hero.
// The slide nearest the strip's left edge is "on": it loads, plays muted and drives the 01 / 06 counter.
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

  // 16:9 clips sit inside the same 9:16 card as the rest: their poster, blurred, fills the card behind them (css/work.css)
  slides.forEach(s => {
    const v = video(s);
    if (v && s.classList.contains('slide--h') && v.poster) s.querySelector('.slide__frame').style.setProperty('--fill', `url('/${v.getAttribute('poster').replace(/^\//, '')}')`);
  });
  const load = v => { if (v && !v.getAttribute('src')) v.src = v.dataset.src; };
  const play = v => { if (!v) return; load(v); const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  const mute = s => {
    const b = s.querySelector('.slide__sound'); const v = video(s);
    if (!b || !v) return;
    v.muted = true; b.setAttribute('aria-pressed', 'false'); b.textContent = 'Ieslēgt skaņu';
  };

  // which slide sits closest to the strip's left padding edge
  const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  const edge = () => track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
  const nearest = () => {
    const e = edge();
    let best = 0, dist = Infinity;
    slides.forEach((s, i) => { const d = Math.abs(s.getBoundingClientRect().left - e); if (d < dist) { dist = d; best = i; } });
    // at the very end the last clips can't reach the edge: the last clip counts as on, so it plays
    if (atEnd()) best = slides.indexOf(videoSlides[videoSlides.length - 1]);
    return best;
  };

  const activate = i => {
    current = i;
    slides.forEach((s, n) => {
      s.classList.toggle('is-on', n === i);
      if (n !== i) { const v = video(s); if (v) v.pause(); mute(s); }
    });
    const vi = videoSlides.indexOf(slides[i]);
    now.textContent = pad(vi < 0 ? videoSlides.length : vi + 1);
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1 || atEnd();
    // keep the neighbour ready so the next swipe is instant
    if (inView) { play(video(slides[i])); load(video(slides[i + 1] || slides[i])); }
  };

  const go = i => {
    i = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: track.scrollLeft + slides[i].getBoundingClientRect().left - edge(), behavior: reduce ? 'auto' : 'smooth' });
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
    raf = requestAnimationFrame(() => { const i = nearest(); if (i !== current) activate(i); else next.disabled = atEnd(); });
  }, { passive: true });

  // tap a frame: bring that slide in, or play/pause it if it is already on
  slides.forEach((s, i) => {
    const frame = s.querySelector('.slide__frame');
    if (!frame) return;
    frame.addEventListener('click', () => {
      if (i !== current) { go(i); return; }
      const v = video(s);
      if (v.paused) play(v); else v.pause();
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
})();
