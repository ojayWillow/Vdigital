// HERO — background film (lazy, light on mobile)

(function initHeroFilm() {
  const v = document.getElementById('heroVideo');
  if (!v) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const saveData = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  if (reduce || saveData) return; // poster image only

  function load() {
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([k, type]) => {
      const src = v.dataset['src' + k[0].toUpperCase() + k.slice(1)];
      if (!src) return;
      const s = document.createElement('source');
      s.src = src; s.type = type; v.appendChild(s);
    });
    v.load();
    v.addEventListener('canplay', () => { v.classList.add('is-ready'); }, { once: true });
    const p = v.play(); if (p && p.catch) p.catch(() => {});
  }
  // let the page paint first, then pull the video
  if (document.readyState === 'complete') setTimeout(load, 300);
  else window.addEventListener('load', () => setTimeout(load, 300), { once: true });

  // pause when hero is off-screen
  new IntersectionObserver(([e]) => {
    if (!v.currentSrc) return;
    if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    else v.pause();
  }, { threshold: 0.05 }).observe(v);
})();
