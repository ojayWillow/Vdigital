// VIDEO — reel autoplay in view, tap for sound, hide reels whose file is missing.
// Silent reels have no .reel__sound button and simply loop.
const reels = document.querySelectorAll('.reel');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

reels.forEach(reel => {
  const video = reel.querySelector('.reel__video');
  const sound = reel.querySelector('.reel__sound');
  if (!video) return;

  // A reel without its file would show an empty frame: hide it instead.
  video.addEventListener('error', () => { reel.hidden = true; });
  if (!sound) return;

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
      if (v && b && v !== video && !v.muted) { v.muted = true; b.textContent = '🔇'; }
    });
    setSound(turnOn);
    if (video.paused) video.play().catch(() => {});
  };

  sound.addEventListener('click', toggle);
  video.addEventListener('click', toggle);
});

// Play muted while on screen, pause when scrolled away. Reduced motion: play only on tap.
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.reel__video').forEach(v => io.observe(v));
}
