// Wild Atlas 2.0 — home page behaviours (index.html only)
//   1. hero video: lazy (after load + idle), never under Reduce Motion / Save-Data / slow links, poster stays underneath
//   2. sky: html[data-sky] + sun/moon disc position from the visitor's local hour (used by background option A)
//   3. camp parallax (option A only): ground drifts ~10% slower than the page, capped, off under Reduce Motion
(function () {
  'use strict';

  var root = document.documentElement;
  var rmq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  // ── 1. hero reel: poster + play button, the video is only fetched on tap and plays with sound ──
  // No autoplay (it has sound and is 37 s), so there is nothing to suppress for Reduce Motion / Save-Data.
  var reel = document.getElementById('heroReel');
  var playBtn = document.getElementById('heroReelPlay');
  var video = null;

  function startReel() {
    if (!reel || !playBtn) return;
    if (!video) {
      video = document.createElement('video');
      video.className = 'reel-video';
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('controls', '');
      video.setAttribute('controlslist', 'nodownload noremoteplayback');
      video.setAttribute('aria-label', 'Wild Atlas 2.0 video: a child in a car opens the app and explores animal packs');
      video.disablePictureInPicture = true;
      video.preload = 'metadata';
      video.src = reel.getAttribute('data-src');
      video.addEventListener('ended', function () {
        reel.classList.remove('is-playing');
        playBtn.hidden = false;
        video.currentTime = 0;
      });
      reel.insertBefore(video, reel.querySelector('.reel-transcript'));
    }
    reel.classList.add('is-playing');
    playBtn.hidden = true;
    var p = video.play(); // inside the click handler, so iOS Safari allows sound + inline play
    if (p && p.catch) p.catch(function () { reel.classList.remove('is-playing'); playBtn.hidden = false; });
  }
  if (playBtn) playBtn.addEventListener('click', startReel);

  // ── 2. sky keyed to the visitor's local hour ───────────────────
  function skyPhase(h) {
    if (h >= 5 && h < 8) return 'dawn';
    if (h >= 8 && h < 17) return 'day';
    if (h >= 17 && h < 20) return 'dusk';
    return 'night';
  }
  function updateSky() {
    var d = new Date();
    var h = d.getHours() + d.getMinutes() / 60;
    // ?sky=dawn|day|dusk|night previews a phase on staging
    var forced = /[?&]sky=(dawn|day|dusk|night)\b/.exec(location.search);
    var phase = forced ? forced[1] : skyPhase(Math.floor(h));
    var hh = forced ? { dawn: 6.5, day: 12, dusk: 18.5, night: 23 }[phase] : h;
    root.setAttribute('data-sky', phase);
    // sun crosses 06–18, moon 18–30 (06 next morning)
    var sun = hh >= 6 && hh < 18;
    var prog = sun ? (hh - 6) / 12 : (((hh >= 18 ? hh : hh + 24) - 18) / 12);
    var x = 8 + 84 * prog;
    var y = 74 - Math.sin(Math.PI * prog) * 56;
    root.style.setProperty('--disc-x', x.toFixed(1) + '%');
    root.style.setProperty('--disc-y', y.toFixed(1) + '%');
  }
  updateSky();
  setInterval(updateSky, 5 * 60 * 1000);

  // ── 3. option A parallax ───────────────────────────────────────
  var camp = document.getElementById('heroCamp');
  var hero = document.getElementById('hero');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (!camp || !hero || (' ' + root.getAttribute('data-bg') + ' ').indexOf(' a ') === -1 || rmq.matches) { if (camp) camp.style.transform = ''; return; }
      var s = window.pageYOffset || 0;
      if (s > hero.offsetHeight) return;
      camp.style.transform = 'translate3d(0,' + Math.min(s * 0.1, 24).toFixed(1) + 'px,0)';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
