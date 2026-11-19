// SPOT — CASANORTE case: load and play muted only while on screen, sound on request, tap to play/pause.
// Reduced motion or save-data: nothing autoplays; a tap on the frame plays the clip.
(function () {
  const frame = document.getElementById('spotFrame');
  if (!frame) return;
  const video = frame.querySelector('.spot__video');
  const sound = frame.querySelector('.spot__sound');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const saveData = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');

  const play = () => {
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    const p = video.play(); if (p && p.catch) p.catch(() => {});
  };

  const setSound = on => {
    video.muted = !on;
    sound.setAttribute('aria-pressed', on ? 'true' : 'false');
    sound.textContent = on ? 'Izslēgt skaņu' : 'Ieslēgt skaņu';
  };

  sound.addEventListener('click', e => {
    e.stopPropagation();
    setSound(video.muted);
    play();
  });

  frame.addEventListener('click', () => { if (video.paused) play(); else video.pause(); });

  if (!reduce && !saveData && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => entries.forEach(({ isIntersecting }) => {
      if (isIntersecting) play();
      else { video.pause(); setSound(false); }
    }), { rootMargin: '150px 0px', threshold: 0.25 }).observe(frame);
  }
})();
