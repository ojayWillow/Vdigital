// OFFERS — play each loop only while it is on screen; load nothing until then

(function initOfferFilms() {
  const vids = [...document.querySelectorAll('.offer-film__video')];
  if (!vids.length || !('IntersectionObserver' in window)) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const saveData = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  if (reduce || saveData) return; // posters only

  const io = new IntersectionObserver(entries => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (!v.src && v.dataset.src) { v.src = v.dataset.src; }
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      } else if (v.src) {
        v.pause();
      }
    });
  }, { rootMargin: '120px 0px', threshold: 0.25 });
  vids.forEach(v => io.observe(v));
})();
