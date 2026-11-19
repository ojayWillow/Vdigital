// SPOT — CASANORTE case: load and play only while on screen, switch finished ↔ raw, sound on request.
// Reduced motion or save-data: nothing autoplays; a tap on the frame plays the clip.
(function () {
  const frame = document.getElementById('spotFrame');
  if (!frame) return;
  const spot = frame.closest('.spot');
  const vids = Array.from(frame.querySelectorAll('.spot__video'));
  const tabs = Array.from(spot.querySelectorAll('.spot__switch button'));
  const state = frame.querySelector('.spot__state');
  const sound = frame.querySelector('.spot__sound');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const saveData = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  let current = 0;
  let inView = false;

  const load = v => { if (!v.getAttribute('src')) v.src = v.dataset.src; };
  const play = v => { load(v); const p = v.play(); if (p && p.catch) p.catch(() => {}); };

  const setSound = on => {
    vids[0].muted = !on;
    sound.setAttribute('aria-pressed', on ? 'true' : 'false');
    sound.textContent = on ? 'Izslēgt skaņu' : 'Ieslēgt skaņu';
  };

  const show = i => {
    current = i;
    vids.forEach((v, n) => {
      v.classList.toggle('is-on', n === i);
      if (n !== i) v.pause();
    });
    tabs.forEach((t, n) => { t.classList.toggle('is-on', n === i); t.setAttribute('aria-pressed', n === i ? 'true' : 'false'); });
    state.textContent = tabs[i].textContent;
    // raw shots have no soundtrack: hide the sound button and mute the ad behind them
    sound.hidden = i !== 0;
    if (i !== 0) setSound(false);
    vids[i].currentTime = 0;
    if (inView || reduce || saveData) play(vids[i]);
  };

  tabs.forEach((t, i) => t.addEventListener('click', () => { if (i !== current) show(i); }));

  sound.addEventListener('click', e => {
    e.stopPropagation();
    setSound(vids[0].muted);
    play(vids[0]);
  });

  // tap on the picture: play/pause
  frame.addEventListener('click', () => {
    const v = vids[current];
    if (v.paused) play(v); else v.pause();
  });

  if (!reduce && !saveData && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => entries.forEach(({ isIntersecting }) => {
      inView = isIntersecting;
      if (isIntersecting) play(vids[current]);
      else vids.forEach(v => v.pause());
    }), { rootMargin: '150px 0px', threshold: 0.25 }).observe(frame);
    // warm the raw cut once the finished ad is playing, so the switch is instant
    vids[0].addEventListener('playing', () => { vids[1].preload = 'auto'; load(vids[1]); }, { once: true });
  }
})();
