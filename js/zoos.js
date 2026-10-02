// /zoos/ — find a place to see a real animal.
// Privacy: the visitor's location (geolocation or a typed city/postcode) lives only in memory in this tab.
// It is never put in the URL, storage, cookies, analytics, or any request. The URL carries only ?animal=<id>.
const PLACES_URL = '/assets/zoos/places.json';
const ANIMALS_URL = '/assets/zoos/animals.json';
const ALIASES = { 'giant-pacific-octopus': 'octopus', hippo: 'hippopotamus' };
const KM_PER_MI = 1.609344;
const FAR_KM = 250;
const IMPERIAL = (navigator.language || '').toLowerCase() === 'en-us';
const CHIP_MI = [5, 10, 20, 50, 150];
const CHIP_KM = [10, 15, 30, 80, 250];
const TYPE_LABEL = { zoo: 'Zoo', aquarium: 'Aquarium', safari_park: 'Safari park', museum: 'Museum', farm: 'Farm / petting zoo', sanctuary: 'Sanctuary' };
const TYPE_EMOJI = { zoo: '🦁', aquarium: '🐠', safari_park: '🦒', museum: '🦴', farm: '🐐', sanctuary: '🐾' };
const ACCRED_TEXT = { AZA: 'AZA accredited', CAZA: 'CAZA accredited', EAZA: 'EAZA member', BIAZA: 'BIAZA member', ZAA: 'ZAA accredited', JAZA: 'JAZA member' };
const NOTICE = 'Animals move between zoos, museums and aquariums, so this list may not be up to date. Please check with the place before you visit to make sure the animal still lives there.';
const NOTICE_WEAK = ' Some places below are unconfirmed, so please call ahead to check the animal is there.';

// Analytics (GA4, already on the site). Privacy rule: NEVER send a location, a typed city/postcode, a place name, or a distance.
// Only non-personal fields: animal id, how the visitor located themselves (method name only), filter value, result tier + place type.
const TIER_NAME = ['exact', 'unconfirmed', 'relative', 'relative', 'similar'];
function track(name, params) { try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) { /* analytics must never break the page */ } }
let lastEmpty = '';
const $ = (id) => document.getElementById(id);
const S = { places: [], animals: [], byId: {}, groups: {}, cur: null, origin: null, maxKm: Infinity, active: null, view: 'list', cache: {} };
const countryName = (() => { try { const d = new Intl.DisplayNames(['en'], { type: 'region' }); return (c) => d.of(c) || c; } catch (e) { return (c) => c; } })();

function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const k in attrs || {}) {
    if (k === 'class') n.className = attrs[k];
    else if (k === 'text') n.textContent = attrs[k];
    else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) n.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
  }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : document.createTextNode(c));
  return n;
}
const haversineKm = (a, b) => {
  const R = 6371, t = Math.PI / 180, dLa = (b.la - a.la) * t, dLo = (b.lo - a.lo) * t;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.la * t) * Math.cos(b.la * t) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const fmtDist = (km) => {
  const v = IMPERIAL ? km / KM_PER_MI : km, u = IMPERIAL ? 'mi' : 'km';
  return (v < 10 ? v.toFixed(1) : Math.round(v).toLocaleString('en')) + ' ' + u;
};
const norm = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- candidates and ranking ----------
function candidates() {
  const d = S.cur, today = new Date().toISOString().slice(0, 10), out = [];
  for (const [pi, weak, species, until] of d.e) { if (until && until < today) continue; out.push({ pi, rank: weak ? 1 : 0, species }); }
  for (const [pi, via, rat, weak] of d.r) out.push({ pi, rank: weak ? 3 : 2, via, rat, weak: !!weak });
  for (const [pi, names] of d.g) out.push({ pi, rank: 4, names });
  for (const c of out) {
    c.p = S.places[c.pi];
    c.km = S.origin ? haversineKm({ la: S.origin.la, lo: S.origin.lo }, c.p) : null;
  }
  return out.filter((c) => c.km === null || c.km <= S.maxKm);
}
function sortCands(list) {
  return list.sort((a, b) => a.rank - b.rank || (a.km !== null ? a.km - b.km : (a.p.cc + a.p.n).localeCompare(b.p.cc + b.p.n)));
}

// ---------- rendering ----------
function noteFor(c) {
  const d = S.cur, k = d.kind;
  if (c.rank === 0) {
    const sp = c.species && !/not named/i.test(c.species) ? ' (' + c.species + ')' : '';
    return { text: (k === 'dino' ? 'Has this dinosaur on display, as a fossil or a cast' : 'Lists this animal') + sp + '.', weak: false };
  }
  if (c.rank === 1) return { text: 'May have this animal, but we could not fully confirm it. Please call ahead.', weak: true };
  if (c.rank === 2 || c.rank === 3) return { text: 'No exact match found, but it has a close relative: ' + c.via + '.' + (c.weak ? ' Unconfirmed, please call ahead.' : ' Please call ahead to check.'), weak: !!c.weak };
  if (k === 'farm') return { text: 'A farm or petting zoo. The animals vary, so please call ahead to ask about this one.', weak: true };
  const label = d.group ? d.group.label : 'animals';
  const names = (c.names || '').split(',').filter(Boolean).map((id) => (S.byId[id] || {}).n).filter(Boolean).join(', ');
  return { text: 'Has other ' + label + (names ? ' (' + names + ')' : '') + (k === 'dino' ? ' on display' : '') + '. This one may not be here, so please call ahead.', weak: true };
}
function siteLink(p) {
  try {
    const u = new URL(p.u); u.searchParams.set('utm_source', 'wildatlas_web'); u.searchParams.set('utm_medium', 'referral'); u.searchParams.set('utm_campaign', 'find_a_zoo');
    return u.toString();
  } catch (e) { return null; }
}
function card(c) {
  const p = c.p, note = noteFor(c), href = p.u ? siteLink(p) : null;
  const photo = p.ph ? el('img', { class: 'zf-photo', src: '/assets/zoos/img/' + p.id + '.jpg', alt: '', loading: 'lazy', decoding: 'async', width: 96, height: 96 })
                     : el('div', { class: 'zf-photo-ph', 'aria-hidden': 'true', text: TYPE_EMOJI[p.t] || '🐾' });
  const where = [p.ci, p.rg, countryName(p.cc)].filter(Boolean).join(', ');
  const accred = p.ac === 'none' ? el('span', { class: 'zf-badge na', text: 'Not accredited: check ahead' })
    : p.ac === 'museum' ? null : el('span', { class: 'zf-badge', text: p.ac.split(',').map((a) => ACCRED_TEXT[a] || a).join(' · ') });
  const li = el('li', { class: 'zf-card', id: 'zf-card-' + c.pi, 'data-pi': c.pi, 'data-rank': c.rank, 'data-type': p.t },
    el('div', {}, photo, p.ph && p.cr ? el('p', { class: 'zf-credit', text: 'Photo: ' + p.cr }) : null),
    el('div', {},
      el('div', { class: 'zf-top' }, el('h3', { text: p.n }), c.km !== null ? el('span', { class: 'zf-dist-val', text: fmtDist(c.km) }) : null),
      el('p', { class: 'zf-where-line', text: where }),
      el('p', { class: 'zf-note' + (note.weak ? ' weak' : ''), text: note.text }),
      el('div', { class: 'zf-badges' }, el('span', { class: 'zf-badge type', text: TYPE_LABEL[p.t] || p.t }), accred),
      el('div', { class: 'zf-actions' },
        href ? el('a', { href, target: '_blank', rel: 'noopener noreferrer', text: 'Visit website ↗' }) : el('span', { text: 'No website listed' }),
        el('button', { type: 'button', 'data-show': c.pi, text: 'Show on map' }))));
  return li;
}
const PAGE = 24;
function cardList(list) {
  const ul = el('ul', { class: 'zf-list' }), wrap = el('div', {}, ul);
  let shown = 0;
  const btn = el('button', { type: 'button', class: 'zf-btn zf-btn-quiet zf-moreBtn' });
  const more = () => {
    list.slice(shown, shown + PAGE).forEach((c) => ul.append(card(c)));
    shown = Math.min(list.length, shown + PAGE);
    if (shown >= list.length) btn.remove(); else btn.textContent = 'Show ' + Math.min(PAGE, list.length - shown) + ' more (' + (list.length - shown) + ' left)';
  };
  btn.addEventListener('click', more); more();
  if (shown < list.length) wrap.append(btn);
  return wrap;
}
function section(title, sub, list) {
  return el('section', { class: 'zf-sec' }, el('h2', {}, title, sub ? el('small', { text: ' ' + sub }) : null), cardList(list));
}
function render() {
  const d = S.cur, box = $('zf-results'); box.textContent = '';
  if (!d) { box.append(el('div', { class: 'zf-empty', text: 'Pick an animal above to see where you can meet one for real.' })); $('zf-notice').textContent = NOTICE; $('zf-status').textContent = ''; drawMap([]); return; }
  const all = sortCands(candidates());
  const exact = all.filter((c) => c.rank <= 1), rel = all.filter((c) => c.rank === 2 || c.rank === 3), grp = all.filter((c) => c.rank === 4);
  const noun = d.kind === 'dino' ? 'Museums with ' : d.kind === 'farm' ? 'Farms and petting zoos for ' : 'Places with ';
  if (exact.length) box.append(section(noun + d.name, '(' + exact.length + ')', exact));
  if (rel.length) box.append(section('Places with a close relative', '(' + rel.length + ')', rel));
  if (grp.length) {
    const label = d.kind === 'farm' ? 'Farms and petting zoos' : 'More places with ' + (d.group ? d.group.label : 'similar animals');
    const body = cardList(grp);
    if (exact.length || rel.length) box.append(el('details', { class: 'zf-more' }, el('summary', { text: label + ' (' + grp.length + ')' }), body));
    else box.append(el('section', { class: 'zf-sec' }, el('h2', {}, label, el('small', { text: ' (' + grp.length + ')' })), body));
  }
  const weak = all.some((c) => c.rank === 1 || c.rank === 3 || c.rank === 4);
  $('zf-notice').textContent = ''; $('zf-notice').append(el('strong', { text: 'Please call ahead. ' }), NOTICE + (weak ? NOTICE_WEAK : ''));
  if (!all.length) {
    const total = d.e.length + d.r.length + d.g.length;
    const e = el('div', { class: 'zf-empty' }, el('p', { text: total ? 'Nothing within that distance.' : 'We have not found a place for this one yet. We are still checking.' }));
    if (total && Number.isFinite(S.maxKm)) e.append(el('button', { type: 'button', class: 'zf-btn zf-btn-quiet', id: 'zf-widen', text: 'Search any distance' }));
    box.append(e);
  }
  const primary = all.filter((c) => c.rank <= 3);
  let msg = '';
  if (!S.origin) msg = all.length ? 'Showing ' + all.length + ' places. Tell us where you are to put the closest first.' : '';
  else {
    const near = (primary[0] || all[0]);
    msg = all.length ? 'Closest first, from ' + S.origin.label + '.' : '';
    if (near && near.km > FAR_KM) msg += ' The closest we know about is ' + near.p.n + ', ' + fmtDist(near.km) + ' away. Your local zoo or museum may have wonderful animals too.';
  }
  $('zf-status').textContent = msg;
  const near2 = primary[0] || all[0];
  const emptyReason = !all.length ? ((d.e.length + d.r.length + d.g.length) ? 'none_in_range' : 'no_data') : (S.origin && near2 && near2.km > FAR_KM ? 'far' : '');
  const sig = emptyReason ? d.id + '|' + emptyReason : '';
  if (sig && sig !== lastEmpty) track('zoo_empty_state', { animal_id: d.id, reason: emptyReason });
  lastEmpty = sig;
  drawMap(all);
}

// ---------- map ----------
let map = null, mapLib = null, popup = null, mapReady = null;
const TIER_OF = (rank) => (rank === 0 ? 0 : rank === 1 ? 1 : rank <= 3 ? 2 : 3);
function mapStyle() {
  return {
    version: 8,
    sources: {
      countries: { type: 'geojson', data: '/assets/zoos/geo/countries.json' },
      admin1: { type: 'geojson', data: '/assets/zoos/geo/admin1.json' },
      pins: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
      me: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#dbe9f3' } },
      { id: 'land', type: 'fill', source: 'countries', paint: { 'fill-color': '#f7efdc' } },
      { id: 'admin1', type: 'line', source: 'admin1', paint: { 'line-color': '#dccfae', 'line-width': 0.7 } },
      { id: 'borders', type: 'line', source: 'countries', paint: { 'line-color': '#b9a67f', 'line-width': 1.1 } },
      { id: 'pins', type: 'circle', source: 'pins',
        layout: { 'circle-sort-key': ['get', 'z'] },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 4, 5, 7, 9, 10],
          'circle-color': ['match', ['get', 'tier'], 0, '#C25A2C', 1, '#e9b99f', 2, '#f7d3bf', '#ffffff'],
          'circle-stroke-color': ['match', ['get', 'tier'], 0, '#6e2f12', 1, '#C25A2C', 2, '#d9783f', '#8a7b66'],
          'circle-stroke-width': 2 } },
      { id: 'active', type: 'circle', source: 'pins', filter: ['==', ['get', 'pi'], -1],
        paint: { 'circle-radius': 14, 'circle-color': 'rgba(43,108,176,0)', 'circle-stroke-color': '#2b6cb0', 'circle-stroke-width': 3 } },
      { id: 'me', type: 'circle', source: 'me', paint: { 'circle-radius': 7, 'circle-color': '#2b6cb0', 'circle-stroke-color': '#fff', 'circle-stroke-width': 3 } },
    ],
  };
}
async function ensureMap() {
  if (map) return map;
  if (mapReady) return mapReady;
  mapReady = (async () => {
    mapLib = await import('/js/vendor/maplibre/maplibre-gl.mjs');
    map = new mapLib.Map({ container: 'zf-map', style: mapStyle(), center: [-30, 30], zoom: 1.2, attributionControl: false, dragRotate: false, pitchWithRotate: false, cooperativeGestures: false });
    map.touchZoomRotate.disableRotation();
    map.addControl(new mapLib.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new mapLib.AttributionControl({ compact: true, customAttribution: 'Outlines: Natural Earth' }));
    await new Promise((res) => (map.loaded() ? res() : map.once('load', res)));
    map.on('click', 'pins', (e) => { const f = e.features && e.features[0]; if (f) setActive(f.properties.pi, { popup: true, scroll: true }); });
    map.on('mouseenter', 'pins', () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', 'pins', () => (map.getCanvas().style.cursor = ''));
    return map;
  })();
  return mapReady;
}
let lastCands = [];
async function drawMap(cands) {
  lastCands = cands;
  if (!map && S.view !== 'map' && !window.matchMedia('(min-width: 900px)').matches) return;
  await ensureMap();
  const feats = cands.map((c) => ({ type: 'Feature', properties: { pi: c.pi, tier: TIER_OF(c.rank), z: 4 - TIER_OF(c.rank) }, geometry: { type: 'Point', coordinates: [c.p.lo, c.p.la] } }));
  map.getSource('pins').setData({ type: 'FeatureCollection', features: feats });
  map.getSource('me').setData({ type: 'FeatureCollection', features: S.origin ? [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [S.origin.lo, S.origin.la] } }] : [] });
  fit(cands);
}
function fit(cands) {
  if (!map) return;
  const pts = [];
  const prim = cands.filter((c) => c.rank <= 3);
  const use = (prim.length ? prim : cands);
  const slice = S.origin ? use.slice(0, 8) : use;
  slice.forEach((c) => pts.push([c.p.lo, c.p.la]));
  if (S.origin) pts.push([S.origin.lo, S.origin.la]);
  if (!pts.length) { map.jumpTo({ center: [-30, 30], zoom: 1.2 }); return; }
  const b = new mapLib.LngLatBounds(pts[0], pts[0]); pts.forEach((p) => b.extend(p));
  map.fitBounds(b, { padding: 48, maxZoom: 9, duration: reducedMotion() ? 0 : 600 });
}
function popupNode(c) {
  const p = c.p, note = noteFor(c), href = p.u ? siteLink(p) : null;
  return el('div', {}, el('h4', { text: p.n }), el('p', { text: [p.ci, p.rg, countryName(p.cc)].filter(Boolean).join(', ') }),
    c.km !== null ? el('p', { text: fmtDist(c.km) + ' away' }) : null,
    el('p', { text: p.ac === 'none' ? 'Not accredited: check ahead' : p.ac === 'museum' ? 'Natural history museum' : p.ac.split(',').map((a) => ACCRED_TEXT[a] || a).join(' · ') }),
    el('p', { class: note.weak ? 'pp-warn' : '', text: note.weak ? 'Unconfirmed. Call ahead to check the animal is there.' : 'Call ahead to confirm the animal is there.' }),
    href ? el('p', {}, el('a', { href, target: '_blank', rel: 'noopener noreferrer', text: 'Visit website ↗', 'data-track': 'popup', 'data-rank': c.rank, 'data-type': p.t })) : null);
}
async function setActive(pi, opts) {
  pi = Number(pi); S.active = pi;
  document.querySelectorAll('.zf-card.is-active').forEach((n) => n.classList.remove('is-active'));
  let cardEl = document.getElementById('zf-card-' + pi);
  if (!cardEl) { document.querySelectorAll('.zf-moreBtn').forEach((b) => b.click()); cardEl = document.getElementById('zf-card-' + pi); }
  if (cardEl) { cardEl.classList.add('is-active'); const det = cardEl.closest('details'); if (det && opts && opts.scroll) det.open = true; if (opts && opts.scroll && S.view === 'list') cardEl.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' }); }
  await ensureMap();
  map.setFilter('active', ['==', ['get', 'pi'], pi]);
  const c = lastCands.find((x) => x.pi === pi); if (!c) return;
  if (opts && opts.fly) map.easeTo({ center: [c.p.lo, c.p.la], zoom: Math.max(map.getZoom(), 7), duration: reducedMotion() ? 0 : 500 });
  if (popup) popup.remove();
  if (opts && opts.popup) popup = new mapLib.Popup({ offset: 12, closeButton: true, maxWidth: '280px' }).setLngLat([c.p.lo, c.p.la]).setDOMContent(popupNode(c)).addTo(map);
}
function setView(v) {
  S.view = v; $('zf-main').dataset.view = v;
  $('zf-tab-list').setAttribute('aria-selected', String(v === 'list')); $('zf-tab-map').setAttribute('aria-selected', String(v === 'map'));
  if (v === 'map') { drawMap(lastCands).then(() => map && map.resize()); }
}

// ---------- location ----------
function setOrigin(o) {
  track('zoo_location_used', { method: o.method || 'geolocation' });
  S.origin = o; $('zf-q').value = o.fromGeo ? '' : o.label;
  closeSuggest(); render();
}
function useMyLocation() {
  const btn = $('zf-locate'), st = $('zf-status');
  if (!('geolocation' in navigator)) { st.textContent = 'Your browser can not share your location. Try typing a city or postcode instead.'; return; }
  btn.disabled = true; st.textContent = 'Finding you…';
  navigator.geolocation.getCurrentPosition((pos) => {
    btn.disabled = false; btn.textContent = 'Update my location';
    setOrigin({ method: 'geolocation', la: pos.coords.latitude, lo: pos.coords.longitude, label: 'your location', fromGeo: true });
  }, () => {
    btn.disabled = false;
    st.textContent = 'No problem. We could not use your location, so try typing a city or postcode instead.';
  }, { maximumAge: 600000, timeout: 12000 });
}
let cities = null, citiesLoading = null; const postal = {};
const loadJson = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
const loadCities = () => cities ? Promise.resolve(cities) : (citiesLoading = citiesLoading || loadJson('/assets/zoos/geo/cities.json').then((c) => (cities = c.map((r) => ({ n: r[0], a: norm(r[1]), nn: norm(r[0]), cc: r[2], la: r[3], lo: r[4], pop: r[5], st: r[6] })))));
const loadPostal = (cc) => postal[cc] ? Promise.resolve(postal[cc]) : loadJson('/assets/zoos/geo/post-' + cc.toLowerCase() + '.json').then((d) => (postal[cc] = d)).catch(() => (postal[cc] = {}));
function postalCountries(q) {
  const k = q.toUpperCase().replace(/\s+/g, ''), out = [];
  const region = ((navigator.language || '').split('-')[1] || '').toUpperCase();
  if (/^\d{5}(-?\d{4})?$/.test(k)) ['US', 'DE', 'FR', 'ES'].forEach((c) => out.push([c, k.slice(0, 5)]));
  else if (/^\d{4}$/.test(k)) ['AU', 'NZ'].forEach((c) => out.push([c, k]));
  else {
    if (/^[A-Z]\d[A-Z]\d?[A-Z]?\d?$/.test(k) && k.length >= 3) out.push(['CA', k.slice(0, 3)]);
    if (/^[A-Z]{1,2}\d[A-Z\d]?(\d[A-Z]{2})?$/.test(k)) out.push(['GB', k.length >= 5 && /\d[A-Z]{2}$/.test(k) ? k.slice(0, -3) : k]);
    if (/^[A-Z]\d{2}[A-Z0-9]{0,4}$/.test(k)) out.push(['IE', k.slice(0, 3)]);
  }
  return out.sort((a, b) => (b[0] === region) - (a[0] === region));
}
async function suggest(q) {
  q = q.trim(); if (q.length < 2) return [];
  const out = [];
  if (/\d/.test(q)) {
    for (const [cc, key] of postalCountries(q)) {
      const d = await loadPostal(cc), r = d[key];
      if (r) out.push({ method: 'postcode', la: r[0], lo: r[1], label: key + ' · ' + r[2] + (r[3] && cc === 'US' ? ', ' + r[3] : '') + ', ' + countryName(cc) });
    }
    if (out.length) return out.slice(0, 5);
  }
  await loadCities();
  const parts = q.split(',').map((s) => norm(s)), c0 = parts[0], c1 = parts[1] || '';
  const hit = cities.filter((c) => (c.a.startsWith(c0) || c.nn.startsWith(c0)) && (!c1 || c.st.toLowerCase() === c1 || c.cc.toLowerCase() === c1 || norm(countryName(c.cc)).startsWith(c1)));
  const seen = new Set();
  return hit.filter((c) => { const k = c.n + c.cc + c.st; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 6)
    .map((c) => ({ method: 'city', la: c.la, lo: c.lo, label: c.n + (c.cc === 'US' && c.st ? ', ' + c.st : '') + ', ' + countryName(c.cc) }));
}
let sugg = [], suggIdx = -1, suggTimer = 0;
function closeSuggest() { const ul = $('zf-suggest'); ul.hidden = true; ul.textContent = ''; sugg = []; suggIdx = -1; $('zf-q').removeAttribute('aria-activedescendant'); }
function showSuggest(list) {
  sugg = list; suggIdx = -1; const ul = $('zf-suggest'); ul.textContent = '';
  if (!list.length) { ul.append(el('li', { role: 'option', 'aria-disabled': 'true', text: 'No match. Try a larger nearby city or a postcode.' })); ul.hidden = false; return; }
  list.forEach((s, i) => { const li = el('li', { role: 'option', id: 'zf-s' + i, text: s.label }); li.addEventListener('mousedown', (e) => { e.preventDefault(); setOrigin(s); }); ul.append(li); });
  ul.hidden = false;
}
function moveSuggest(d) {
  if (!sugg.length) return; suggIdx = (suggIdx + d + sugg.length) % sugg.length;
  [...$('zf-suggest').children].forEach((li, i) => li.setAttribute('aria-selected', String(i === suggIdx)));
  $('zf-q').setAttribute('aria-activedescendant', 'zf-s' + suggIdx);
}

// ---------- animal + distance controls ----------
async function selectAnimal(id, pushUrl) {
  if (!id || !S.byId[id]) { S.cur = null; render(); return; }
  track('zoo_animal_selected', { animal_id: id, source: pushUrl ? 'picker' : 'link' });
  $('zf-status').textContent = 'Loading…';
  if (!S.cache[id]) S.cache[id] = await loadJson('/assets/zoos/a/' + id + '.json');
  S.cur = S.cache[id]; $('zf-animal').value = id; $('zf-name').textContent = S.cur.name.toLowerCase().replace(/\b(african|asian|arctic|atlantic|american|burmese|komodo|gila|tasmanian|polar)\b/g, (m) => m[0].toUpperCase() + m.slice(1));
  if (pushUrl) history.replaceState(null, '', '?animal=' + encodeURIComponent(id));
  document.title = 'Where to see ' + (/^[aeiou]/i.test(S.cur.name) ? 'an ' : 'a ') + S.cur.name.toLowerCase() + ' near you — Wild Atlas';
  render();
}
function buildChips() {
  const box = $('zf-chips'), set = IMPERIAL ? CHIP_MI : CHIP_KM, unit = IMPERIAL ? 'mi' : 'km';
  const items = set.map((v) => ({ v, km: IMPERIAL ? v * KM_PER_MI : v, label: 'Within ' + v + ' ' + unit })).concat([{ v: 0, km: Infinity, label: 'No limit' }]);
  items.forEach((it, i) => {
    const id = 'zf-chip-' + i;
    const input = el('input', { type: 'radio', name: 'zf-dist', id, value: it.v, checked: it.v === 0 });
    input.addEventListener('change', () => { S.maxKm = it.km; track('zoo_distance_filter', { distance: it.v ? it.v + ' ' + unit : 'no limit' }); render(); });
    box.append(el('label', { class: 'zf-chip', for: id }, input, el('span', { text: it.label })));
  });
}
function buildPicker() {
  const sel = $('zf-animal'); sel.textContent = '';
  sel.append(el('option', { value: '', text: 'Choose an animal…' }));
  const kinds = [['wild', 'Wild animals (zoos and aquariums)'], ['dino', 'Dinosaurs (fossils at museums)'], ['farm', 'Farm animals (farms and petting zoos)']];
  for (const [k, label] of kinds) {
    const og = el('optgroup', { label });
    S.animals.filter((a) => a.k === k).sort((a, b) => a.n.localeCompare(b.n)).forEach((a) => og.append(el('option', { value: a.id, text: a.n })));
    sel.append(og);
  }
}

async function init() {
  buildChips();
  try {
    const [places, meta] = await Promise.all([loadJson(PLACES_URL), loadJson(ANIMALS_URL)]);
    S.places = places; S.animals = meta.animals; S.groups = meta.groups; meta.animals.forEach((a) => (S.byId[a.id] = a));
  } catch (e) { $('zf-status').textContent = 'Sorry, we could not load the places just now. Please try again in a moment.'; return; }
  buildPicker();
  $('zf-animal').addEventListener('change', (e) => selectAnimal(e.target.value, true));
  $('zf-locate').addEventListener('click', useMyLocation);
  $('zf-form').addEventListener('submit', async (e) => { e.preventDefault(); const l = suggIdx >= 0 ? sugg[suggIdx] : (sugg[0] || (await suggest($('zf-q').value))[0]); if (l) setOrigin(l); else showSuggest([]); });
  $('zf-q').addEventListener('input', (e) => { clearTimeout(suggTimer); const v = e.target.value; if (v.trim().length < 2) { closeSuggest(); return; } suggTimer = setTimeout(async () => showSuggest(await suggest(v)), 140); });
  $('zf-q').addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); moveSuggest(1); } else if (e.key === 'ArrowUp') { e.preventDefault(); moveSuggest(-1); } else if (e.key === 'Escape') closeSuggest(); });
  $('zf-q').addEventListener('blur', () => setTimeout(closeSuggest, 150));
  $('zf-tab-list').addEventListener('click', () => setView('list'));
  $('zf-tab-map').addEventListener('click', () => setView('map'));
  $('zf-results').addEventListener('click', (e) => {
    const b = e.target.closest('[data-show]'); if (b) { if (window.matchMedia('(max-width: 899px)').matches) setView('map'); setActive(b.dataset.show, { fly: true, popup: true }); return; }
    if (e.target.id === 'zf-widen') { S.maxKm = Infinity; document.querySelectorAll('input[name="zf-dist"]').forEach((i) => (i.checked = i.value === '0')); render(); }
  });
  const clicked = (e) => {
    const a = e.target.closest('a[target="_blank"]'); if (!a) return;
    const holder = a.closest('.zf-card') || a;
    if (!holder.dataset.rank) return;
    track('zoo_result_click', { tier: TIER_NAME[Number(holder.dataset.rank)] || 'exact', place_type: holder.dataset.type || '' });
  };
  $('zf-results').addEventListener('click', clicked);
  $('zf-map').addEventListener('click', clicked);
  $('zf-legend').append(...[['e', 'Lists this animal'], ['w', 'Unconfirmed'], ['r', 'Close relative'], ['g', 'Similar animals'], ['me', 'You']].map(([c, t]) => el('li', {}, el('span', { class: 'zf-dot ' + c }), t)));
  const q = new URLSearchParams(location.search).get('animal');
  const id = ALIASES[q] || q;
  $('zf-main').dataset.view = 'list';
  if (id && S.byId[id]) await selectAnimal(id, false); else render();
}
init();
