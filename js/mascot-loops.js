// Pack mascot loops: the app's own clip for each pack (transparent video), laid over the still art so it lines up exactly.
// The still stays as poster and as the reduced-motion / data-saver fallback. A clip only loads when its card nears the screen,
// and pauses when it leaves. Safari and every iOS browser get the HEVC-with-alpha .mov, the rest get VP9 .webm.
(function () {
  'use strict';
  var els = document.querySelectorAll('.mascot-live');
  if (!els.length || !('IntersectionObserver' in window)) return;
  var rmq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var c = navigator.connection || {};
  if (rmq.matches || c.saveData) return; // effectiveType is too jumpy to trust, so only an explicit data-saver choice skips the clips
  var ua = navigator.userAgent;
  var webkit = /iP(hone|ad|od)/.test(ua) || (/Safari\//.test(ua) && !/Chrome|Chromium|Android|Edg|OPR/.test(ua));
  var ext = webkit ? 'mov' : 'webm';

  function build(el) {
    var canvas = el.querySelector('.mascot-canvas');
    var g = (el.getAttribute('data-geom') || '').split(',');
    if (!canvas || g.length < 3) return null;
    var v = document.createElement('video');
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.setAttribute('tabindex', '-1');
    v.disablePictureInPicture = true; v.preload = 'auto';
    v.style.left = g[0] + '%'; v.style.top = g[1] + '%'; v.style.width = g[2] + '%';
    v.src = '/assets/v2/mascot-loops/' + el.getAttribute('data-loop') + '.' + ext;
    v.addEventListener('playing', function () { canvas.classList.add('is-live'); });
    v.addEventListener('error', function () { canvas.classList.remove('is-live'); if (v.parentNode) v.parentNode.removeChild(v); el._v = null; });
    canvas.appendChild(v);
    return v;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var el = e.target;
      el._in = e.isIntersecting;
      if (e.isIntersecting) {
        if (!el._v) el._v = build(el);
        else { var p = el._v.play(); if (p && p.catch) p.catch(function () {}); }
      } else if (el._v) { el._v.pause(); }
    });
  }, { rootMargin: '150px 0px' });
  for (var i = 0; i < els.length; i++) io.observe(els[i]);
  document.addEventListener('visibilitychange', function () {
    for (var i = 0; i < els.length; i++) {
      var v = els[i]._v; if (!v) continue;
      if (document.hidden) v.pause();
      else if (els[i]._in) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    }
  });
})();
