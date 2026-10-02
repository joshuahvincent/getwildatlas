// "Where to see" map on calendar animal pages. Same map as the zoo finder (/zoos/):
// self-hosted MapLibre, the offline Natural Earth outlines, and the same pin colours
// (big green = keeps this animal, small green = close relative). No tiles, no
// third-party requests, no location: the pins are baked into the page at build time.
// The map only loads when it scrolls into view.
const GREEN = '#2E7D32', GREEN_DARK = '#17441a';
const zoomR = (a, b, c) => ['interpolate', ['linear'], ['zoom'], 1, a, 5, b, 9, c];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function style() {
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
      { id: 'pins-r', type: 'circle', source: 'pins', filter: ['==', ['get', 'tier'], 2], paint: { 'circle-radius': zoomR(3.5, 5, 7), 'circle-color': GREEN, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.5 } },
      { id: 'halo', type: 'circle', source: 'pins', filter: ['==', ['get', 'tier'], 0], paint: { 'circle-radius': zoomR(7, 9.5, 12.5), 'circle-color': '#ffffff' } },
      { id: 'pins-e', type: 'circle', source: 'pins', filter: ['==', ['get', 'tier'], 0], paint: { 'circle-radius': zoomR(5, 7, 9.5), 'circle-color': GREEN, 'circle-stroke-color': GREEN_DARK, 'circle-stroke-width': 1.5 } },
    ],
  };
}

function popupNode(p) {
  const box = document.createElement('div');
  const h = document.createElement('h4'); h.textContent = p.n; box.append(h);
  if (p.pl) { const t = document.createElement('p'); t.textContent = p.pl; box.append(t); }
  if (p.tier === 2) { const t = document.createElement('p'); t.textContent = 'A close relative'; box.append(t); }
  if (p.u) {
    const t = document.createElement('p'); const a = document.createElement('a');
    a.href = p.u; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Visit website ↗';
    t.append(a); box.append(t);
  }
  return box;
}

async function draw(el) {
  let pins;
  try { pins = JSON.parse(el.dataset.pins || '[]'); } catch { pins = []; }
  if (!pins.length) return;
  el.dataset.loading = '1';
  const lib = await import('/js/vendor/maplibre/maplibre-gl.mjs');
  const map = new lib.Map({ container: el, style: style(), center: [10, 22], zoom: 1.2, minZoom: -1,   // below the zoo finder's 0.6 so world-spanning pins (e.g. humpback sites) fit on a phone
    renderWorldCopies: false, attributionControl: false, dragRotate: false, pitchWithRotate: false, cooperativeGestures: true });
  map.touchZoomRotate.disableRotation();
  el.wtsMap = map;   // handy for debugging in the console
  map.addControl(new lib.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new lib.AttributionControl({ compact: true, customAttribution: 'Outlines: Natural Earth' }));
  await new Promise((res) => (map.loaded() ? res() : map.once('load', res)));
  delete el.dataset.loading;
  map.getSource('pins').setData({
    type: 'FeatureCollection',
    features: pins.map((p, i) => ({ type: 'Feature', properties: { i, tier: p.tier }, geometry: { type: 'Point', coordinates: [p.lo, p.la] } })),
  });
  const b = new lib.LngLatBounds([pins[0].lo, pins[0].la], [pins[0].lo, pins[0].la]);
  pins.forEach((p) => b.extend([p.lo, p.la]));
  const narrow = el.clientWidth < 500;
  map.fitBounds(b, { padding: narrow ? 24 : 48, maxZoom: 5, duration: 0 });
  let popup = null;
  ['pins-e', 'pins-r'].forEach((layer) => {
    map.on('click', layer, (e) => {
      const f = e.features && e.features[0]; if (!f) return;
      const p = pins[f.properties.i];
      if (popup) popup.remove();
      popup = new lib.Popup({ offset: 12, maxWidth: '260px' }).setLngLat([p.lo, p.la]).setDOMContent(popupNode(p)).addTo(map);
      map.easeTo({ center: [p.lo, p.la], duration: reducedMotion() ? 0 : 400 });
    });
    map.on('mouseenter', layer, () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', layer, () => (map.getCanvas().style.cursor = ''));
  });
}

const maps = document.querySelectorAll('.wts-map[data-pins]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { io.unobserve(e.target); draw(e.target).catch((err) => console.error('[where-to-see map]', err)); }
  }), { rootMargin: '300px' });
  maps.forEach((m) => io.observe(m));
} else {
  maps.forEach((m) => draw(m));
}
