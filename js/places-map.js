// General-purpose places map for any page on the site. Insert it with the
// {% placesMap %} shortcode (see docs/places-map.md); this script finds every
// .places-map on the page.
//
// It uses the same map as the zoo finder (/zoos/): self-hosted MapLibre, the
// offline Natural Earth outlines, and the same pin styles. There are no tiles,
// no third-party requests, and no location. Each map loads only when it
// scrolls into view.
//
// Data attributes on .places-map:
//   data-pins    inline pins: [{la, lo, tier, title, sub, url, linkText}]
//   data-src     or: a JSON URL to load pins from (e.g. the zoo finder's places)
//   data-format  "pins" (default) | "zoo-places" (assets/zoos/places.json rows)
//   data-types   zoo-places only: comma list of place types to keep (e.g. "zoo,aquarium")
//   data-fit     "pins" (default: zoom to the pins) | "world"
//   data-max-zoom  closest zoom when fitting to pins (default 5)
//   data-legend  JSON {tier: label} to rename legend entries; "none" hides the legend
//   data-cards   id of an element holding cards with data-pin-key="<pin key>". The cards
//                collapse behind the map; tapping a pin shows its card in a panel under
//                the map, and a "Show all N places as a list" button reveals them all.
//                If the map can't load, the cards stay visible as a plain list.
//
// Pin tiers. The first four are the zoo finder's; "wild" is the in-the-wild pin.
//   lists       big green dot with white halo   (has the animal)
//   unconfirmed big yellow dot with white halo
//   relative    small green dot                  (close relative)
//   similar     small white dot, grey ring       (similar animals)
//   wild        big teal dot with white halo     (see it in the wild)
// Numeric tiers 0–3 from the zoo finder are accepted too (0 lists … 3 similar).

const GREEN = '#2E7D32', GREEN_DARK = '#17441a', YELLOW = '#FACC15', YELLOW_DARK = '#6b5200';
const TEAL = '#0E7C86', TEAL_DARK = '#08454A'; // the zoo finder's in-the-wild pin
const TIER_NAMES = ['lists', 'unconfirmed', 'relative', 'similar'];
const LEGEND = { lists: 'Place to see one', wild: 'In the wild', unconfirmed: 'Unconfirmed', relative: 'Close relative', similar: 'Similar animals' };
const LEGEND_ORDER = ['lists', 'wild', 'unconfirmed', 'relative', 'similar'];
const WORLD = [[-168, -42], [178, 70]]; // the zoo finder's world view, without Antarctica
const zoomR = (a, b, c) => ['interpolate', ['linear'], ['zoom'], 1, a, 5, b, 9, c];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const tierOf = (t) => (typeof t === 'number' ? TIER_NAMES[t] || 'lists' : LEGEND[t] ? t : 'lists');

function style() {
  const big = (id, tier, fill, stroke, w) => ({ id, type: 'circle', source: 'pins', filter: ['==', ['get', 'tier'], tier], paint: { 'circle-radius': zoomR(5, 7, 9.5), 'circle-color': fill, 'circle-stroke-color': stroke, 'circle-stroke-width': w } });
  const small = (id, tier, fill, stroke, w) => ({ id, type: 'circle', source: 'pins', filter: ['==', ['get', 'tier'], tier], paint: { 'circle-radius': zoomR(3.5, 5, 7), 'circle-color': fill, 'circle-stroke-color': stroke, 'circle-stroke-width': w } });
  return {
    version: 8,
    sources: {
      countries: { type: 'geojson', data: '/assets/zoos/geo/countries.json', maxzoom: 7, tolerance: 0.6 },
      pins: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#dbe9f3' } },
      { id: 'land', type: 'fill', source: 'countries', paint: { 'fill-color': '#f7efdc' } },
      { id: 'borders', type: 'line', source: 'countries', paint: { 'line-color': '#a8946a', 'line-width': 1.1 } },
      small('pin-similar', 'similar', '#ffffff', '#6b6b6b', 1.6),
      small('pin-relative', 'relative', GREEN, '#ffffff', 1.5),
      { id: 'halo', type: 'circle', source: 'pins', filter: ['in', ['get', 'tier'], ['literal', ['lists', 'unconfirmed', 'wild']]], paint: { 'circle-radius': zoomR(7, 9.5, 12.5), 'circle-color': '#ffffff' } },
      // draw order matches /zoos/: similar < relative < halo < unconfirmed < wild < lists
      big('pin-unconfirmed', 'unconfirmed', YELLOW, YELLOW_DARK, 2),
      big('pin-wild', 'wild', TEAL, TEAL_DARK, 1.5),
      big('pin-lists', 'lists', GREEN, GREEN_DARK, 1.5),
    ],
  };
}
const PIN_LAYERS = ['pin-lists', 'pin-unconfirmed', 'pin-wild', 'pin-relative', 'pin-similar'];

// assets/zoos/places.json row -> pin
function fromZooPlace(p) {
  return { la: p.la, lo: p.lo, tier: p.t === 'wild' ? 'wild' : 'lists', title: p.n, sub: [p.ci, p.rg, p.cc].filter(Boolean).join(', '), url: p.u };
}

async function loadPins(el) {
  if (el.dataset.src) {
    const rows = await (await fetch(el.dataset.src)).json();
    if (el.dataset.format === 'zoo-places') {
      const keep = el.dataset.types ? new Set(el.dataset.types.split(',').map((s) => s.trim())) : null;
      return rows.filter((p) => !keep || keep.has(p.t)).map(fromZooPlace);
    }
    return rows;
  }
  try { return JSON.parse(el.dataset.pins || '[]'); } catch { return []; }
}

function el$(tag, props, ...kids) {
  const n = document.createElement(tag);
  Object.entries(props || {}).forEach(([k, v]) => (k === 'text' ? (n.textContent = v) : n.setAttribute(k, v)));
  kids.filter(Boolean).forEach((k) => n.append(k));
  return n;
}

function popupNode(p) {
  return el$('div', {},
    el$('h4', { text: p.title || '' }),
    p.sub ? el$('p', { text: p.sub }) : null,
    p.tier === 'relative' ? el$('p', { text: 'A close relative' }) : null,
    p.tier === 'unconfirmed' ? el$('p', { text: 'Unconfirmed' }) : null,
    p.url ? el$('p', {}, el$('a', { href: p.url, target: '_blank', rel: 'noopener noreferrer', text: p.linkText || 'Visit website ↗' })) : null);
}

function renderLegend(el, pins) {
  if (el.dataset.legend === 'none') return;
  let names = el.dataset.format === 'zoo-places' ? { lists: 'Place to visit' } : {};   // no single animal in the all-places view
  try { names = Object.assign(names, JSON.parse(el.dataset.legend || '{}')); } catch { /* keep defaults */ }
  const present = new Set(pins.map((p) => p.tier));
  const items = LEGEND_ORDER.filter((t) => present.has(t));
  if (!items.length) return;
  const ul = el$('ul', { class: 'places-map-legend' });
  items.forEach((t) => ul.append(el$('li', {}, el$('span', { class: 'pm-dot ' + t, 'aria-hidden': 'true' }), names[t] || LEGEND[t])));
  el.after(ul);
}

// ---------- linked cards (data-cards) ----------
function setupCards(el) {
  const box = el.dataset.cards && document.getElementById(el.dataset.cards);
  if (!box) return null;
  const n = box.querySelectorAll('[data-pin-key]').length;
  if (!n) return null;
  const detail = el$('div', { class: 'places-map-detail', 'aria-live': 'polite' });
  detail.hidden = true;
  const toggle = el$('button', { type: 'button', class: 'places-map-toggle', 'aria-controls': box.id, 'aria-expanded': 'false' });
  const label = (open) => (toggle.textContent = open ? 'Hide the list' : 'Show all ' + n + ' place' + (n === 1 ? '' : 's') + ' as a list');
  label(false);
  toggle.addEventListener('click', () => {
    const open = box.classList.toggle('pm-collapsed') === false;
    toggle.setAttribute('aria-expanded', String(open));
    label(open);
  });
  el.after(detail, toggle);
  box.classList.add('pm-collapsed');
  return { box, detail, toggle, restore() { box.classList.remove('pm-collapsed'); detail.remove(); toggle.remove(); } };
}

function showCard(cards, key) {
  const card = key && cards.box.querySelector('[data-pin-key="' + CSS.escape(key) + '"]');
  if (!card) return false;
  const copy = card.cloneNode(true);
  copy.removeAttribute('data-pin-key');
  const close = el$('button', { type: 'button', class: 'places-map-detail-close', 'aria-label': 'Close' });
  close.textContent = '×';
  close.addEventListener('click', () => { cards.detail.hidden = true; cards.detail.replaceChildren(); });
  cards.detail.replaceChildren(close, copy);
  cards.detail.hidden = false;
  cards.detail.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  return true;
}

async function draw(el, cards) {
  el.dataset.loading = '1';
  const pins = (await loadPins(el)).filter((p) => Number.isFinite(p.la) && Number.isFinite(p.lo)).map((p) => ({ ...p, tier: tierOf(p.tier) }));
  renderLegend(el, pins);
  const lib = await import('/js/vendor/maplibre/maplibre-gl.mjs');
  // minZoom -1 (not the zoo finder's 0.6) so world-spanning pins fit on a phone
  const map = new lib.Map({ container: el, style: style(), center: [10, 22], zoom: 1.2, minZoom: -1, renderWorldCopies: false, attributionControl: false, dragRotate: false, pitchWithRotate: false, cooperativeGestures: true });
  el.placesMap = map; // handy for debugging in the console
  map.touchZoomRotate.disableRotation();
  map.addControl(new lib.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new lib.AttributionControl({ compact: true, customAttribution: 'Outlines: Natural Earth' }));
  await new Promise((res) => (map.loaded() ? res() : map.once('load', res)));
  delete el.dataset.loading;
  map.getSource('pins').setData({
    type: 'FeatureCollection',
    features: pins.map((p, i) => ({ type: 'Feature', properties: { i, tier: p.tier }, geometry: { type: 'Point', coordinates: [p.lo, p.la] } })),
  });
  const narrow = el.clientWidth < 500;
  if (el.dataset.fit === 'world' || !pins.length) {
    map.fitBounds(WORLD, { padding: 10, duration: 0 });
  } else {
    const b = new lib.LngLatBounds([pins[0].lo, pins[0].la], [pins[0].lo, pins[0].la]);
    pins.forEach((p) => b.extend([p.lo, p.la]));
    map.fitBounds(b, { padding: narrow ? 24 : 48, maxZoom: Number(el.dataset.maxZoom) || 5, duration: 0 });
  }
  let popup = null;
  PIN_LAYERS.forEach((layer) => {
    map.on('click', layer, (e) => {
      const f = e.features && e.features[0]; if (!f) return;
      const p = pins[f.properties.i];
      if (popup) popup.remove();
      const shown = cards && showCard(cards, p.key);
      popup = new lib.Popup({ offset: 12, maxWidth: '260px' }).setLngLat([p.lo, p.la]).setDOMContent(shown ? el$('div', {}, el$('h4', { text: p.title || '' })) : popupNode(p)).addTo(map);
      map.easeTo({ center: [p.lo, p.la], duration: reducedMotion() ? 0 : 400 });
    });
    map.on('mouseenter', layer, () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', layer, () => (map.getCanvas().style.cursor = ''));
  });
}

const maps = document.querySelectorAll('.places-map');
const linked = new Map([...maps].map((m) => [m, setupCards(m)]));   // collapse cards right away, before the map loads
function start(el) {
  const cards = linked.get(el);
  draw(el, cards).catch((err) => { delete el.dataset.loading; if (cards) cards.restore(); console.error('[places map]', err); });
}
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); start(e.target); } }), { rootMargin: '300px' });
  maps.forEach((m) => io.observe(m));
} else {
  maps.forEach(start);
}
