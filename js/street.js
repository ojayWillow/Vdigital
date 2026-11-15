// SHOWREEL — one sector at a time, cut like an edit: the viewer plays a clip, the title card swaps,
// the playhead runs along the timeline, the next clip fades in on top.

(function initShowreel() {
  const sec = document.querySelector('.showreel');
  if (!sec) return;
  const screen = sec.querySelector('.showreel__screen');
  const clips = Array.from(sec.querySelectorAll('.showreel__clip'));
  const caps = Array.from(sec.querySelectorAll('.showreel__cap'));
  const btns = Array.from(sec.querySelectorAll('.showreel__clips button'));
  const head = sec.querySelector('.showreel__playhead');
  const tc = sec.querySelector('.showreel__tc');
  const count = sec.querySelector('.showreel__count b');
  const ruler = sec.querySelector('.showreel__ruler');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const saveData = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  const playable = !reduce && !saveData && 'IntersectionObserver' in window;

  const FADE = 0.7;   // seconds of crossfade into the next clip
  const PASSES = 1;   // each clip plays once and hands over before its dip
  const dur = clips.map(v => parseFloat(v.dataset.dur) || 5);
  const out = clips.map((v, k) => Math.min(dur[k], parseFloat(v.dataset.out) || dur[k]));
  const len = clips.map((v, k) => dur[k] * (PASSES - 1) + out[k]);
  const start = len.map((l, k) => len.slice(0, k).reduce((a, b) => a + b, 0));
  const total = len.reduce((a, b) => a + b, 0);

  // timeline drawn to scale: clip widths, ruler ticks (1 s and 5 s) and labels follow the real lengths
  const clipsEl = sec.querySelector('.showreel__clips');
  if (clipsEl) clipsEl.style.gridTemplateColumns = len.map(l => l.toFixed(2) + 'fr').join(' ');
  if (ruler) {
    ruler.style.setProperty('--sec', (100 / total).toFixed(3) + '%');
    Array.from(ruler.children).forEach((s, k) => {
      if (start[k] === undefined) return;
      s.style.left = (start[k] / total * 100).toFixed(2) + '%';
      s.textContent = '00:' + String(Math.floor(start[k])).padStart(2, '0');
    });
  }

  const pad = n => String(n).padStart(2, '0');
  const timecode = s => { const f = Math.floor(s * 24); return '00:' + pad(Math.floor(f / 1440)) + ':' + pad(Math.floor(f / 24) % 60) + ':' + pad(f % 24); };
  function paint(elapsed) {
    const g = Math.min(total, start[cur] + elapsed);
    if (head) head.style.transform = 'translateX(' + (g / total * 100).toFixed(3) + '%)';
    if (tc) tc.textContent = timecode(g);
  }

  // 1080p when the film is shown wide on a sharp enough screen, 720p otherwise
  const wantHd = () => screen.clientWidth * Math.min(2, window.devicePixelRatio || 1) >= 1100;
  function load(v) {
    if (!playable || v.getAttribute('src') || !v.dataset.src) return;
    v.preload = 'auto';
    v.src = (wantHd() && v.dataset.srcHd) || v.dataset.src;
  }
  function play(v) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }

  let cur = 0, pass = 0, lastT = 0, visible = false, raf = 0, swapTimer = 0;

  function show(k) {
    k = (k + clips.length) % clips.length;
    if (k === cur && clips[k].classList.contains('is-on')) { if (!playable) return; }
    const prev = clips[cur], next = clips[k];
    caps.forEach((c, i) => c.classList.toggle('is-on', i === k));
    btns.forEach((b, i) => { b.classList.toggle('is-on', i === k); if (i === k) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    if (count) count.textContent = pad(k + 1);
    clearTimeout(swapTimer);
    clips.forEach(v => { if (v !== prev && v !== next) { v.classList.remove('is-on', 'is-out', 'is-in'); if (!v.paused) v.pause(); } });
    if (prev !== next) {
      prev.classList.remove('is-on', 'is-in'); prev.classList.add('is-out');
      next.classList.remove('is-out'); next.classList.add('is-in');
      void next.offsetWidth; // commit opacity 0 so the fade runs
      next.classList.remove('is-in'); next.classList.add('is-on');
      swapTimer = setTimeout(() => { prev.classList.remove('is-out'); prev.pause(); }, FADE * 1000 + 60);
      if (reduce) { prev.classList.remove('is-out'); prev.pause(); }
    }
    cur = k; pass = 0; lastT = 0;
    if (playable) {
      load(next); load(clips[(k + 1) % clips.length]);
      try { next.currentTime = 0; } catch (e) { /* not loaded yet */ }
      if (visible) { play(next); loop(); }
    }
    paint(0);
  }

  function tick() {
    raf = 0;
    const v = clips[cur];
    const t = v.currentTime || 0;
    if (t < lastT - 1) pass++;   // the clip wrapped round its loop
    lastT = t;
    paint(Math.min(len[cur], pass * dur[cur] + t));
    if (!v.paused && pass >= PASSES - 1 && t >= out[cur] - FADE) { show(cur + 1); return; }
    loop();
  }
  function loop() { if (visible && !raf) raf = requestAnimationFrame(tick); }

  btns.forEach((b, k) => b.addEventListener('click', () => { if (k !== cur) show(k); }));

  // phones: swipe the film to change clip
  let x0 = null, y0 = 0;
  screen.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  screen.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) show(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // play only while the reel is on screen; start loading a little before it arrives
  if (playable) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) { load(clips[cur]); load(clips[(cur + 1) % clips.length]); } }, { rootMargin: '600px 0px' }).observe(screen);
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      const v = clips[cur];
      if (visible) { play(v); loop(); }
      else { v.pause(); if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    }, { threshold: 0.25 }).observe(screen);
  }
  paint(0);
})();

