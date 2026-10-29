// Wild Atlas 2.0 — staged background treatments (all pages)
//   ?bg=a   Camp horizon      (home hero; styles in css/world.css)
//   ?bg=b   Pack worlds band  (home "Every page is a world"; styles in css/world.css)
//   ?bg=c   Scenery edges     (site-wide; css/scenery.css, loaded only when selected)
//   ?bg=off no treatment (the default)
// The choice is remembered for the tab (sessionStorage) so it follows you across pages.
// On the production hostnames this file does nothing but apply DEFAULT_OPTION and never shows the switcher.
// When Josh picks one: set DEFAULT_OPTION to it, drop the unused option's markup/CSS, delete the switcher.
(function () {
  'use strict';

  var DEFAULT_OPTION = 'all';
  var OPTIONS = ['off', 'a', 'b', 'c', 'all'];
  var LABELS = { off: 'Off', a: 'A', b: 'B', c: 'C', all: 'All' };
  var NAMES = { off: 'No background treatment', a: 'Camp horizon', b: 'Pack worlds band', c: 'Scenery edges', all: 'A + B + C together' };
  var KEY = 'wa_bg';
  var root = document.documentElement;
  var isProd = /^(www\.)?wildatlasapp\.com$/i.test(location.hostname);
  var embed = /[?&]embed=1\b/.test(location.search); // used by scenery-options.html: no switcher, no stored choice

  function store(get, v) {
    try { if (get) return window.sessionStorage.getItem(KEY); window.sessionStorage.setItem(KEY, v); } catch (e) { /* private mode: fine */ }
    return null;
  }

  function fromQuery() {
    var m = /[?&]bg=(off|a|b|c|all)\b/i.exec(location.search);
    return m ? m[1].toLowerCase() : null;
  }

  var current = DEFAULT_OPTION;
  if (!isProd) {
    var q = fromQuery();
    var s = store(true);
    current = q || (OPTIONS.indexOf(s) !== -1 ? s : DEFAULT_OPTION);
    if (q && !embed) store(false, q);
  }

  // ---- option C: strip along the footer + faint silhouettes at the outer margins ----
  var cNodes = [];
  function removeC() {
    cNodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    cNodes = [];
    root.removeAttribute('data-scenery');
  }
  function addC() {
    if (cNodes.length) return;
    if (!document.getElementById('waSceneryCss')) {
      var l = document.createElement('link');
      l.id = 'waSceneryCss'; l.rel = 'stylesheet'; l.href = '/css/scenery.css?v=1';
      document.head.appendChild(l); cNodes.push(l);
    }
    root.setAttribute('data-scenery', 'c');
    var mk = function (cls, src) {
      var d = document.createElement('div');
      d.className = cls; d.setAttribute('aria-hidden', 'true');
      var i = document.createElement('img'); i.src = src; i.alt = ''; i.decoding = 'async'; i.loading = 'lazy';
      d.appendChild(i); document.body.appendChild(d); cNodes.push(d);
    };
    mk('scenery-edge scenery-edge-l', '/assets/v2/scene/edge-dino.webp');
    mk('scenery-edge scenery-edge-r', '/assets/v2/scene/edge-safari.webp');
    var footer = document.querySelector('footer.footer, footer');
    if (footer) {
      var strip = document.createElement('div');
      strip.className = 'scenery-footer'; strip.setAttribute('aria-hidden', 'true');
      ['grass-a', 'bush-b', 'flower-daisy-open', 'grass-b', 'leaf-cluster', 'bush-a', 'flower-cosmos-open', 'grass-a', 'bush-b', 'grass-b', 'flower-daisy-open', 'leaf-cluster'].forEach(function (n) {
        var i = document.createElement('img'); i.src = '/assets/v2/scene/camp-' + n + '.webp'; i.alt = ''; i.loading = 'lazy'; i.decoding = 'async';
        strip.appendChild(i);
      });
      footer.appendChild(strip); cNodes.push(strip);
      footer.classList.add('has-scenery');
    }
  }

  function apply(opt) {
    current = opt;
    root.setAttribute('data-bg', opt === 'all' ? 'a b c' : opt);
    var hasC = opt === 'c' || opt === 'all';
    if (hasC) addC(); else {
      removeC();
      var f = document.querySelector('footer.has-scenery'); if (f) f.classList.remove('has-scenery');
    }
    var btns = document.querySelectorAll('.wa-bg-switch button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-opt') === opt ? 'true' : 'false');
    var label = document.getElementById('waBgName'); if (label) label.textContent = NAMES[opt];
  }

  function buildSwitcher() {
    var st = document.createElement('style');
    st.textContent =
      '.wa-bg-switch{position:fixed;left:12px;bottom:12px;z-index:1300;display:flex;flex-direction:column;gap:6px;padding:8px 10px;border-radius:16px;background:#5D4037;color:#FFF5E1;font:600 12px/1.2 Nunito,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.25);max-width:200px}' +
      '.wa-bg-switch .row{display:flex;gap:6px;align-items:center}.wa-bg-switch b{font-family:Fredoka,sans-serif;font-weight:600;font-size:12px;letter-spacing:.04em}' +
      '.wa-bg-switch button{all:unset;cursor:pointer;min-width:30px;min-height:30px;box-sizing:border-box;text-align:center;border-radius:999px;border:1.5px solid #FFF5E1;color:#FFF5E1;font:700 13px/27px Fredoka,sans-serif;padding:0 8px}' +
      '.wa-bg-switch button[aria-pressed="true"]{background:#FFF5E1;color:#5D4037}.wa-bg-switch button:focus-visible{outline:3px solid #A2D2FF;outline-offset:2px}';
    document.head.appendChild(st);
    var box = document.createElement('div');
    box.className = 'wa-bg-switch'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Staging only: background treatment');
    var row = document.createElement('div'); row.className = 'row';
    var t = document.createElement('b'); t.textContent = 'BG'; row.appendChild(t);
    OPTIONS.forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-opt', o); b.textContent = LABELS[o]; b.title = NAMES[o];
      b.addEventListener('click', function () {
        store(false, o); apply(o);
        try { var u = new URL(location.href); u.searchParams.set('bg', o); history.replaceState(null, '', u.toString()); } catch (e) { /* ignore */ }
      });
      row.appendChild(b);
    });
    var name = document.createElement('span'); name.id = 'waBgName';
    box.appendChild(row); box.appendChild(name);
    document.body.appendChild(box);
  }

  function init() {
    if (!isProd && !embed && /[?&]switcher=1\b/.test(location.search)) buildSwitcher();
    apply(current);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
