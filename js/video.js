// VIDEO — builds the two shelves from js/reels-data.js, loads a clip only when it is near
// the screen, plays it muted while visible, turns sound on by tap where a clip has it,
// and runs the Pirms / Pēc slider.
(() => {
  const DATA = window.VD_REELS || {};
  const AR = { v: 9 / 16, h: 16 / 9 };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  // Phones and tablets get the light 720p file (<file>-m.mp4): 2K clips stutter there while swiping.
  const small = window.matchMedia('(max-width: 900px)').matches;
  const load = v => { if (!v.getAttribute('src') && v.dataset.src) v.src = (small && v.dataset.srcM) || v.dataset.src; };

  // ---- Shelves ----------------------------------------------------------------------
  // Each shelf is split by shape: first a grid of 9:16 cards, then a grid of 16:9 frames.
  // Every clip keeps its own shape and all frames in one grid are the same size.
  const tile = (r, no) => {
    const shape = AR[r.shape] ? r.shape : 'h';
    const lite = r.lite === false ? '' : ` data-src-m="assets/video/${esc(r.file)}-m.mp4"`;
    return `<figure class="reel reel--${shape}">
      <div class="reel__frame">
        <video class="reel__video" muted loop playsinline preload="none" poster="assets/video/${esc(r.file)}.jpg" data-src="assets/video/${esc(r.file)}.mp4"${lite} aria-label="${esc(r.alt || r.name || '')}"></video>
        ${r.sound ? '<button type="button" class="reel__sound" aria-pressed="false" aria-label="Ieslēgt skaņu">🔇</button>' : ''}
      </div>
      <figcaption><span class="reel__no">${pad(no)}</span>${r.name ? `<b>${esc(r.name)}</b>` : ''}${r.tag ? `<span class="reel__tag">${esc(r.tag)}</span>` : ''}</figcaption>
    </figure>`;
  };

  document.querySelectorAll('[data-shelf]').forEach(shelf => {
    const section = shelf.closest('section');
    const list = (DATA[shelf.dataset.shelf] || []).filter(r => r && r.file);
    if (!list.length) { if (section) section.hidden = true; return; }
    const tall = list.filter(r => r.shape === 'v');
    const wide = list.filter(r => r.shape !== 'v');
    let no = 0;
    // a dashed "your video" card after the last 9:16 clip leads to the contact form
    const slot = `<a class="reel reel--slot" href="#contact">
      <span class="reel__frame"><b aria-hidden="true">+</b><span>${esc(shelf.dataset.slot || 'Jūsu video')}</span></span>
    </a>`;
    shelf.innerHTML =
      (tall.length ? `<div class="reels__grid reels__grid--v">${tall.map(r => tile(r, ++no)).join('')}${slot}</div>` : '')
      + (wide.length ? `<div class="reels__grid reels__grid--h">${wide.map(r => tile(r, ++no)).join('')}</div>` : '');
    const count = section && section.querySelector('[data-count]');
    if (count) count.textContent = pad(list.length) + ' video';
  });

  // ---- Reels: sound, tap to play, missing files ---------------------------------------
  const reels = document.querySelectorAll('.reel:not(.reel--slot)');
  reels.forEach(reel => {
    const video = reel.querySelector('.reel__video');
    const sound = reel.querySelector('.reel__sound');
    if (!video) return;

    // A reel without its file would show an empty frame: hide it instead.
    video.addEventListener('error', () => { reel.hidden = true; });

    if (!sound) {
      // Silent reel: a tap starts or stops it (covers reduced motion and iPhone Low Power Mode, where autoplay is off).
      video.addEventListener('click', () => { load(video); if (video.paused) video.play().catch(() => {}); else video.pause(); });
      return;
    }

    const setSound = on => {
      video.muted = !on;
      sound.textContent = on ? '🔊' : '🔇';
      sound.setAttribute('aria-pressed', on ? 'true' : 'false');
      sound.setAttribute('aria-label', on ? 'Izslēgt skaņu' : 'Ieslēgt skaņu');
    };
    const toggle = () => {
      const turnOn = video.muted;
      // Only one reel plays with sound at a time.
      if (turnOn) reels.forEach(r => {
        const v = r.querySelector('.reel__video');
        const b = r.querySelector('.reel__sound');
        if (v && b && v !== video && !v.muted) { v.muted = true; b.textContent = '🔇'; b.setAttribute('aria-pressed', 'false'); }
      });
      setSound(turnOn);
      load(video);
      if (video.paused) video.play().catch(() => {});
    };
    sound.addEventListener('click', toggle);
    video.addEventListener('click', toggle);
  });

  // Fetch a clip shortly before it scrolls in; play it muted while on screen, pause when it leaves.
  const videos = document.querySelectorAll('.reel__video');
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { load(e.target); near.unobserve(e.target); } });
    }, { rootMargin: '500px 0px' });
    const onScreen = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const v = e.target;
        if (e.isIntersecting) { load(v); if (!reduceMotion) v.play().catch(() => {}); }
        else v.pause();
      });
    }, { threshold: 0.5 });
    videos.forEach(v => { near.observe(v); onScreen.observe(v); });
  } else {
    videos.forEach(load);
  }

  // ---- Pirms / Pēc: one shot, two versions, a line you drag ---------------------------
  const pp = document.querySelector('.pp__frame');
  if (pp) {
    const after = pp.querySelector('.pp__video--after');
    const before = pp.querySelector('.pp__video--before');
    const range = pp.querySelector('.pp__range');
    const setX = x => { pp.style.setProperty('--x', x + '%'); };
    let touched = false, dragging = false, raf = 0, t0 = 0;

    const fromPointer = e => {
      const r = pp.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100));
      touched = true; range.value = x; setX(x);
    };
    pp.addEventListener('pointerdown', e => { dragging = true; try { pp.setPointerCapture(e.pointerId); } catch (err) {} fromPointer(e); });
    pp.addEventListener('pointermove', e => { if (dragging) fromPointer(e); });
    ['pointerup', 'pointercancel'].forEach(ev => pp.addEventListener(ev, () => { dragging = false; }));
    range.addEventListener('input', () => { touched = true; setX(range.value); }); // keyboard

    // Until someone takes the line, it drifts slowly so the difference shows by itself.
    const sweep = ts => {
      if (touched) { raf = 0; return; }
      if (!t0) t0 = ts;
      const x = 50 + 24 * Math.sin((ts - t0) / 1500);
      range.value = x; setX(x);
      raf = requestAnimationFrame(sweep);
    };

    // Keep both versions on the same frame: restart together, pull the top one back if it drifts.
    const both = fn => [after, before].forEach(fn);
    after.addEventListener('ended', () => both(v => { v.currentTime = 0; v.play().catch(() => {}); }));
    after.addEventListener('timeupdate', () => {
      if (Math.abs(before.currentTime - after.currentTime) > 0.12) before.currentTime = after.currentTime;
    });
    pp.addEventListener('click', () => both(v => { load(v); if (v.paused) v.play().catch(() => {}); }));

    const start = () => {
      both(load);
      if (reduceMotion) return;
      both(v => v.play().catch(() => {}));
      if (!touched && !raf) raf = requestAnimationFrame(sweep);
    };
    const stop = () => { both(v => v.pause()); cancelAnimationFrame(raf); raf = 0; t0 = 0; };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => entries.forEach(e => (e.isIntersecting ? start() : stop())), { threshold: 0.35 }).observe(pp);
    } else start();
  }
})();
