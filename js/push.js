// PUSH-IN — the slow camera push on looping shop-window videos, done by the browser.
// Baked into 24 fps footage a slow zoom moves in visible steps; here it is a looping Web Animation
// on the compositor (off the main thread, so scrolling can't make it stutter). It resets by its own
// clock in the dark dip, and is nudged back in line with the video once per loop so it never drifts.
// <video data-push="1.05"            scale reached at the end of each loop
//        data-push-offset="0.4">     the file starts this many seconds into the master loop
(function initPush() {
  const vids = Array.from(document.querySelectorAll('video[data-push]'));
  if (!vids.length || !Element.prototype.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

  vids.forEach(v => {
    const end = parseFloat(v.dataset.push) || 1.05;
    const off = parseFloat(v.dataset.pushOffset) || 0;
    let anim = null, lastMt = -1, watching = false;

    const masterTime = t => (t + off) % v.duration;
    function sync(mt) { // mt = where we are in the master loop, seconds
      if (!anim) anim = v.animate([{ transform: 'scale(1)' }, { transform: 'scale(' + end + ')' }],
        { duration: v.duration * 1000, easing: 'linear', iterations: Infinity });
      const at = (anim.currentTime / 1000) % v.duration;
      if (Math.abs(at - mt) > 0.04) anim.currentTime = mt * 1000;
      if (v.paused) anim.pause(); else anim.play();
    }
    function check(t) { // once per loop, just after the master wraps (inside the dark dip), re-align
      if (!v.duration) return;
      const mt = masterTime(t);
      if (lastMt >= 0 && mt < lastMt - 0.2) sync(mt);
      lastMt = mt;
    }
    const onFrame = (now, meta) => { check(meta.mediaTime); if (!v.paused) v.requestVideoFrameCallback(onFrame); else watching = false; };

    v.addEventListener('playing', () => {
      if (!v.duration) return;
      lastMt = masterTime(v.currentTime);
      sync(lastMt);
      if (hasRVFC && !watching) { watching = true; v.requestVideoFrameCallback(onFrame); }
    });
    if (!hasRVFC) v.addEventListener('timeupdate', () => check(v.currentTime));
    v.addEventListener('pause', () => { if (anim) anim.pause(); });
  });
})();
