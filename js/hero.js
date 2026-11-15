// HERO — the reel starts from an inline script right after the <video> (no waiting for the page load).
// Here: reveal it on its first frame (the poster is that same frame), pause it when the hero is off-screen.

(function initHeroFilm() {
  const v = document.getElementById('heroVideo');
  if (!v || !v.querySelector('source')) return; // reduced motion / data saver: poster only
  const show = () => v.classList.add('is-ready');
  if (v.readyState >= 2) show(); else v.addEventListener('loadeddata', show, { once: true });
  const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  play();
  new IntersectionObserver(([e]) => { if (e.isIntersecting) play(); else v.pause(); }, { threshold: 0.05 }).observe(v);
})();
