// PUSH-IN — the slow camera push on looping videos, done by the browser at the screen's refresh rate.
// Baked into 24 fps footage a slow zoom moves in visible steps (it reads as lag); here it glides.
// <video data-push="1.08">                 scale reached at the end of each loop
//        data-push-offset="0.4"            the file starts this many seconds into the master loop
//        data-push-from="0" data-push-to="2.6">  push only during this part of the loop (master seconds)
(function initPush() {
  const vids = Array.from(document.querySelectorAll('video[data-push]'));
  if (!vids.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

  vids.forEach(v => {
    const end = parseFloat(v.dataset.push) || 1.08;
    const off = parseFloat(v.dataset.pushOffset) || 0;
    const from = parseFloat(v.dataset.pushFrom) || 0;
    const to = parseFloat(v.dataset.pushTo) || 0;
    let media = 0, at = 0, raf = 0, chained = false, last = 0;

    // anchor on each decoded frame, then run the clock smoothly between frames
    const onFrame = (now, meta) => { media = meta.mediaTime; at = now; v.requestVideoFrameCallback(onFrame); };

    function tick(now) {
      const dur = v.duration;
      if (dur) {
        let t = hasRVFC && at ? media + Math.min(120, Math.max(0, now - at)) / 1000 * v.playbackRate : v.currentTime;
        t = (t + off) % dur;
        if (t < last && last - t < 0.25) t = last; // never step backwards when a late frame re-anchors the clock
        last = t;
        const stop = to || dur;
        const p = Math.min(1, Math.max(0, (t - from) / Math.max(0.001, stop - from)));
        v.style.transform = 'scale(' + (1 + (end - 1) * p).toFixed(5) + ')';
      }
      raf = requestAnimationFrame(tick);
    }

    v.addEventListener('playing', () => {
      if (hasRVFC && !chained) { chained = true; v.requestVideoFrameCallback(onFrame); }
      if (!raf) raf = requestAnimationFrame(tick);
    });
    v.addEventListener('pause', () => { cancelAnimationFrame(raf); raf = 0; });
  });
})();
