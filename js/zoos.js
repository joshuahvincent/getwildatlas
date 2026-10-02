// /zoos/ — find a place to see a real animal.
// Privacy: the visitor's location (geolocation or a typed city/postcode) lives only in memory in this tab.
// It is never put in the URL, storage, cookies, analytics, or any request. The URL carries only the animal (/zoos/<animal>/).
const PLACES_URL = '/assets/zoos/places.json';
const ANIMALS_URL = '/assets/zoos/animals.json';
const ALIASES = { 'giant-pacific-octopus': 'octopus', hippo: 'hippopotamus' };
const KM_PER_MI = 1.609344;
const FAR_KM = 250;
const IMPERIAL = (navigator.language || '').toLowerCase() === 'en-us';
const HOME_CC = ((navigator.language || '').split('-')[1] || '').toUpperCase();   // smart default: show the visitor's own country first (no location needed)
const CHIP_MI = [5, 10, 20, 50, 150];
const CHIP_KM = [10, 15, 30, 80, 250];
const TYPE_LABEL = { zoo: 'Zoo', aquarium: 'Aquarium', safari_park: 'Safari park', museum: 'Museum', farm: 'Farm / petting zoo', sanctuary: 'Sanctuary' };
const TYPE_EMOJI = { zoo: '🦁', aquarium: '🐠', safari_park: '🦒', museum: '🦴', farm: '🐐', sanctuary: '🐾' };
const ACCRED_TEXT = { AZA: 'AZA accredited', CAZA: 'CAZA accredited', EAZA: 'EAZA member', BIAZA: 'BIAZA member', ZAA: 'ZAA accredited', JAZA: 'JAZA member' };
const POPULAR = ['lion', 'giraffe', 'hippopotamus', 'african_elephant', 'emperor_penguin', 'dolphin', 'tyrannosaurus_rex', 'cow'];
const SEARCH_TERMS = { tyrannosaurus_rex: 't rex trex dinosaur', velociraptor: 'raptor dinosaur', hippopotamus: 'hippo', african_elephant: 'elephant', great_white_shark: 'shark', hammerhead_shark: 'shark', whale_shark: 'shark', emperor_penguin: 'penguin', atlantic_puffin: 'puffin bird', polar_bear: 'bear', panda: 'giant panda bear', cow: 'cattle farm', pig: 'farm', sheep: 'farm lamb', horse: 'farm pony' };

// Analytics (GA4, already on the site). Privacy rule: NEVER send a location, a typed city/postcode, a place name, or a distance.
// Only non-personal fields: animal id, how the visitor located themselves (method name only), filter value, result tier + place type.
const TIER_NAME = ['exact', 'unconfirmed', 'relative', 'relative', 'similar'];
function track(name, params) { try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) { /* analytics must never break the page */ } }
let lastEmpty = '';

const $ = (id) => document.getElementById(id);
const S = { places: [], animals: [], byId: {}, bySlug: {}, groups: {}, cur: null, origin: null, maxKm: Infinity, distLabel: 'Any distance', editing: false, unknown: '', active: null, view: 'list', cache: {} };
const countryName = (() => { try { const d = new Intl.DisplayNames(['en'], { type: 'region' }); return (c) => d.of(c) || c; } catch (e) { return (c) => c; } })();
const slugOf = (id) => id.replace(/_/g, '-');

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
const norm = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loadJson = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
// Commons author strings can be long or machine-generated ("No machine-readable author provided. X~commonswiki assumed..."): keep the credit short and honest.
function creditText(cr) {
  const [lic, ...rest] = (cr || '').split(' · '); let who = rest.join(' · ');
  const m = who.match(/([^\s~][^~]*?)~commonswiki/i);
  if (/machine-readable|assumed/i.test(who)) who = m ? m[1].trim() : 'Wikimedia Commons';
  who = who.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
  if (who.length > 48) who = who.slice(0, 47).trim() + '…';
  return [lic, who].filter(Boolean).join(' · ');
}

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
// Sections: [exact + unconfirmed], [close relatives], [similar animals]. Inside a section the list is ordered by distance from the visitor
// (unconfirmed places are mixed in by distance and marked on the card); with no location, the visitor's own country comes first.
const groupOf = (r) => (r <= 1 ? 0 : r <= 3 ? 1 : 2);
function sortCands(list) {
  return list.sort((a, b) => groupOf(a.rank) - groupOf(b.rank)
    || (a.km !== null ? a.km - b.km
      : (a.rank - b.rank) || ((b.p.cc === HOME_CC) - (a.p.cc === HOME_CC)) || (a.p.cc + a.p.n).localeCompare(b.p.cc + b.p.n)));
}
// "All animals" view (no animal chosen): every zoo, aquarium, safari park and museum, so the page starts as a world map
function allCandidates() {
  return S.places.map((p, pi) => ({ pi, rank: 0, p, km: S.origin ? haversineKm({ la: S.origin.la, lo: S.origin.lo }, p) : null }))
    .filter((c) => c.p.t !== 'farm' && (c.km === null || c.km <= S.maxKm));
}

// ---------- rendering ----------
// Quiet by design: ONE short "check with the place" line lives in the page header. Cards only say something when the match is not a plain exact one.
function noteFor(c) {
  if (!S.cur) return { text: '', weak: false };
  const k = S.cur.kind;
  if (c.rank <= 1) return { text: '', weak: c.rank === 1 };
  if (c.rank === 2 || c.rank === 3) return { text: 'Close relative: ' + c.via + '.', weak: !!c.weak };
  if (k === 'farm') return { text: 'A farm or petting zoo. The animals vary.', weak: true };
  const names = (c.names || '').split(',').filter(Boolean).map((id) => (S.byId[id] || {}).n).filter(Boolean).join(', ');
  return { text: names ? 'Also has ' + names + '.' : 'Has similar animals.', weak: true };
}
function siteLink(p) {
  try {
    const u = new URL(p.u); u.searchParams.set('utm_source', 'wildatlas_web'); u.searchParams.set('utm_medium', 'referral'); u.searchParams.set('utm_campaign', 'find_a_zoo');
    return u.toString();
  } catch (e) { return null; }
}
const accredBadge = (p) => p.ac === 'none' ? el('span', { class: 'zf-badge na', text: 'Not accredited' })
  : p.ac === 'museum' ? null : el('span', { class: 'zf-badge', text: p.ac.split(',').map((a) => ACCRED_TEXT[a] || a).join(' · ') });
function placeholder(p) { return el('div', { class: 'zf-photo-ph', 'aria-hidden': 'true', text: TYPE_EMOJI[p.t] || '🐾' }); }
function card(c) {
  const p = c.p, note = noteFor(c), href = p.u ? siteLink(p) : null;
  let photo = placeholder(p), credit = null;
  if (p.ph) {
    const img = el('img', { class: 'zf-photo', src: '/assets/zoos/img/' + p.id + '.jpg', alt: 'Photo of ' + p.n, loading: 'lazy', decoding: 'async', width: 96, height: 96 });
    // never show a broken-image tile: if a photo fails to load, swap in the place-type tile and drop its credit
    img.addEventListener('error', () => { img.replaceWith(placeholder(p)); const cr = img.closest('.zf-card') && img.closest('.zf-card').querySelector('.zf-credit'); if (cr) cr.remove(); }, { once: true });
    photo = img; credit = p.cr ? el('p', { class: 'zf-credit', text: 'Photo: ' + creditText(p.cr) }) : null;
  }
  const where = [p.ci, p.rg, countryName(p.cc)].filter(Boolean).join(', ');
  return el('li', { class: 'zf-card' + (c.rank === 1 || c.rank === 3 ? ' is-weak' : ''), id: 'zf-card-' + c.pi, 'data-pi': c.pi, 'data-rank': c.rank, 'data-type': p.t },
    photo,
    el('div', {},
      el('div', { class: 'zf-top' }, el('h3', { text: p.n }), c.km !== null ? el('span', { class: 'zf-dist-val', text: fmtDist(c.km) }) : null),
      el('p', { class: 'zf-where-line', text: where }),
      note.text ? el('p', { class: 'zf-note', text: note.text }) : null,
      el('div', { class: 'zf-badges' },
        (c.rank === 1 || c.rank === 3) ? el('span', { class: 'zf-badge unc', text: 'Unconfirmed' }) : null,
        el('span', { class: 'zf-badge type', text: TYPE_LABEL[p.t] || p.t }), accredBadge(p)),
      el('div', { class: 'zf-actions' },
        href ? el('a', { href, target: '_blank', rel: 'noopener noreferrer', text: 'Visit website ↗' }) : null,
        el('button', { type: 'button', 'data-show': c.pi, text: 'Show on map' }))),
    credit);
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
// once an animal and a location are both set, the controls fold into one summary line ("Hippopotamus · Seattle, WA · Any distance · Change")
function updateSummary() {
  const collapsed = !!(S.cur && S.origin && !S.editing);
  $('zf-panel').hidden = collapsed; $('zf-summary').hidden = !collapsed;
  $('zf-edit').setAttribute('aria-expanded', String(!collapsed));
  if (collapsed) $('zf-sum-text').textContent = [S.cur.name, S.origin.label === 'your location' ? 'Near you' : S.origin.label, S.distLabel].join(' · ');
  $('zf-legend-me').hidden = !S.origin;
}
function render() {
  const d = S.cur, box = $('zf-results'); box.textContent = '';
  $('zf-quick').hidden = !!d && !S.unknown ? true : false; updateSummary();
  if (!d) {
    const everyone = sortCands(allCandidates());
    if (everyone.length) box.append(section('All zoos, aquariums and museums', '(' + everyone.length.toLocaleString('en') + ')', everyone));
    else box.append(el('div', { class: 'zf-empty' }, el('p', { text: 'Nothing within that distance.' }), Number.isFinite(S.maxKm) ? el('button', { type: 'button', class: 'zf-btn', id: 'zf-widen', text: 'Search any distance' }) : null));
    const where = S.origin ? 'Closest first, from ' + (S.origin.label === 'your location' ? 'your location' : S.origin.label) + '.' : 'Add your location to put the closest first.';
    $('zf-status').textContent = (S.unknown ? 'We can\u2019t find \u201c' + S.unknown + '\u201d yet, so here are animal places ' + (S.origin ? 'near you' : 'to start with') + '. ' : 'Showing every place. Search for an animal to narrow it down. ') + (S.unknown ? '' : where);
    lastCands = everyone; drawMap(everyone); return;
  }
  const all = sortCands(candidates());
  const exact = all.filter((c) => c.rank <= 1), rel = all.filter((c) => c.rank === 2 || c.rank === 3), grp = all.filter((c) => c.rank === 4);
  const noun = d.kind === 'dino' ? 'Museums with ' : d.kind === 'farm' ? 'Farms and petting zoos for ' : 'Places with ';
  if (exact.length) box.append(section(noun + d.name, '(' + exact.length + ')', exact));
  if (rel.length) box.append(section('Places with a close relative', '(' + rel.length + ')', rel));
  if (grp.length) {
    const label = d.kind === 'farm' ? 'Farms and petting zoos' : 'More places with ' + (d.group ? d.group.label : 'similar animals') + ' (this animal may not be there)';
    const body = cardList(grp);
    if (exact.length || rel.length) box.append(el('details', { class: 'zf-more' }, el('summary', { text: label + ' (' + grp.length + ')' }), body));
    else box.append(el('section', { class: 'zf-sec' }, el('h2', {}, label, el('small', { text: ' (' + grp.length + ')' })), body));
  }
  if (!all.length) {
    const total = d.e.length + d.r.length + d.g.length;
    const e = el('div', { class: 'zf-empty' }, el('p', { text: total ? 'Nothing within that distance.' : 'We have not found a place for this one yet. We are still checking.' }));
    if (total && Number.isFinite(S.maxKm)) e.append(el('button', { type: 'button', class: 'zf-btn', id: 'zf-widen', text: 'Search any distance' }));
    e.append(el('button', { type: 'button', class: 'zf-btn zf-btn-quiet', id: 'zf-another', text: 'Pick another animal' }));
    box.append(e);
  }
  const primary = all.filter((c) => c.rank <= 3);
  let msg = '';
  if (!S.origin) {
    const home = HOME_CC && primary.some((c) => c.p.cc === HOME_CC);
    msg = all.length ? (home ? 'Showing places in ' + countryName(HOME_CC) + ' first. Add your location to put the closest first.' : 'Add your location to put the closest first.') : '';
  } else {
    const near = (primary[0] || all[0]);
    msg = all.length ? 'Closest first, from ' + (S.origin.label === 'your location' ? 'your location' : S.origin.label) + '.' : '';
    if (near && near.km > FAR_KM) msg += ' The closest is ' + near.p.n + ', ' + fmtDist(near.km) + ' away.';
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
const GREEN = '#2E7D32', GREEN_DARK = '#17441a', YELLOW = '#FACC15', YELLOW_DARK = '#6b5200', YOU = '#2563EB';
let map = null, mapLib = null, popup = null, mapReady = null, lastCands = [];
const TIER_OF = (rank) => (rank === 0 ? 0 : rank === 1 ? 1 : rank <= 3 ? 2 : 3);
const zoomR = (a, b, c) => ['interpolate', ['linear'], ['zoom'], 1, a, 5, b, 9, c];
function mapStyle() {
  const pin = (id, tier, radius, paint) => ({ id, type: 'circle', source: 'pins', filter: ['==', ['get', 'tier'], tier], paint: Object.assign({ 'circle-radius': radius }, paint) });
  return {
    version: 8,
    sources: {
      countries: { type: 'geojson', data: '/assets/zoos/geo/countries.json', maxzoom: 7, tolerance: 0.6 },
      pins: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
      me: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#dbe9f3' } },
      { id: 'land', type: 'fill', source: 'countries', paint: { 'fill-color': '#f7efdc' } },
      { id: 'borders', type: 'line', source: 'countries', paint: { 'line-color': '#a8946a', 'line-width': 1.1 } },
      // tier 3 similar animals: small grey ring; tier 2 close relative: small green dot; tier 1 unconfirmed: yellow dot; tier 0 lists it: large green dot with white halo
      pin('pins-g', 3, zoomR(3.5, 5, 7), { 'circle-color': '#ffffff', 'circle-stroke-color': '#6b6b6b', 'circle-stroke-width': 1.6 }),
      pin('pins-r', 2, zoomR(3.5, 5, 7), { 'circle-color': GREEN, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.5 }),
      { id: 'halo', type: 'circle', source: 'pins', filter: ['<=', ['get', 'tier'], 1], paint: { 'circle-radius': zoomR(7, 9.5, 12.5), 'circle-color': '#ffffff' } },
      pin('pins-w', 1, zoomR(5, 7, 9.5), { 'circle-color': YELLOW, 'circle-stroke-color': YELLOW_DARK, 'circle-stroke-width': 2 }),
      pin('pins-e', 0, zoomR(5, 7, 9.5), { 'circle-color': GREEN, 'circle-stroke-color': GREEN_DARK, 'circle-stroke-width': 1.5 }),
      { id: 'active', type: 'circle', source: 'pins', filter: ['==', ['get', 'pi'], -1], paint: { 'circle-radius': 15, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': '#2A2118', 'circle-stroke-width': 3 } },
      // "You": a big blue dot with a white halo and a soft ring so it reads on any background
      { id: 'me-ring', type: 'circle', source: 'me', paint: { 'circle-radius': 18, 'circle-color': YOU, 'circle-opacity': 0.18 } },
      { id: 'me-halo', type: 'circle', source: 'me', paint: { 'circle-radius': 11, 'circle-color': '#ffffff' } },
      { id: 'me', type: 'circle', source: 'me', paint: { 'circle-radius': 8, 'circle-color': YOU } },
    ],
  };
}
async function ensureMap() {
  if (mapReady) return mapReady;   // always wait for the SAME promise: `map` exists before its style has loaded
  mapReady = (async () => {
    const t0 = performance.now();
    mapLib = await import('/js/vendor/maplibre/maplibre-gl.mjs');
    map = new mapLib.Map({ container: 'zf-map', style: mapStyle(), center: [10, 22], zoom: 1.2, minZoom: 0.6, renderWorldCopies: false, attributionControl: false, dragRotate: false, pitchWithRotate: false });
    $('zf-map').dataset.loading = '1';
    map.on('error', (e) => console.error('[zoos map]', e && e.error ? e.error.message : e));
    map.touchZoomRotate.disableRotation();
    map.addControl(new mapLib.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new mapLib.AttributionControl({ compact: true, customAttribution: 'Outlines: Natural Earth' }));
    await new Promise((res) => (map.loaded() ? res() : map.once('load', res)));
    delete $('zf-map').dataset.loading;
    console.debug('[zoos map] ready in ' + Math.round(performance.now() - t0) + ' ms');
    // state/province outlines (1 MB) are only fetched once the visitor zooms in, so the first view starts faster
    const addAdmin1 = () => {
      if (map.getSource('admin1') || map.getZoom() < 3) return;
      map.addSource('admin1', { type: 'geojson', data: '/assets/zoos/geo/admin1.json', maxzoom: 7, tolerance: 0.6 });
      map.addLayer({ id: 'admin1', type: 'line', source: 'admin1', paint: { 'line-color': '#d3c3a0', 'line-width': 0.7 } }, 'borders');
    };
    map.on('zoomend', addAdmin1); addAdmin1();
    const layers = ['pins-e', 'pins-w', 'pins-r', 'pins-g'];
    map.on('click', layers, (e) => { const f = e.features && e.features[0]; if (f) setActive(f.properties.pi, { popup: true, scroll: true }); });
    layers.forEach((l) => { map.on('mouseenter', l, () => (map.getCanvas().style.cursor = 'pointer')); map.on('mouseleave', l, () => (map.getCanvas().style.cursor = '')); });
    if (!map.getSource('pins')) await new Promise((res) => map.once('styledata', res));
    return map;
  })();
  return mapReady;
}
async function drawMap(cands) {
  lastCands = cands;
  if (!map && S.view !== 'map' && !window.matchMedia('(min-width: 900px)').matches) return;
  await ensureMap();
  const feats = cands.map((c) => ({ type: 'Feature', properties: { pi: c.pi, tier: TIER_OF(c.rank) }, geometry: { type: 'Point', coordinates: [c.p.lo, c.p.la] } }));
  map.getSource('pins').setData({ type: 'FeatureCollection', features: feats });
  map.getSource('me').setData({ type: 'FeatureCollection', features: S.origin ? [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [S.origin.lo, S.origin.la] } }] : [] });
  fit(cands);
}
function fit(cands) {
  if (!map) return;
  const pts = [];
  const prim = cands.filter((c) => c.rank <= 3);
  let use = prim.length ? prim : cands;
  if (S.cur && !S.origin && HOME_CC && use.some((c) => c.p.cc === HOME_CC)) use = use.filter((c) => c.p.cc === HOME_CC);
  if (!S.cur && !S.origin) { map.resize(); map.fitBounds([[-168, -42], [178, 70]], { padding: 10, duration: 0 }); return; }   // world view without Antarctica
  (S.origin ? use.slice(0, 8) : use).forEach((c) => pts.push([c.p.lo, c.p.la]));
  if (S.origin) pts.push([S.origin.lo, S.origin.la]);
  if (!pts.length) { map.jumpTo({ center: [10, 22], zoom: 1.2 }); return; }
  const b = new mapLib.LngLatBounds(pts[0], pts[0]); pts.forEach((p) => b.extend(p));
  map.fitBounds(b, { padding: 48, maxZoom: 8, duration: reducedMotion() ? 0 : 600 });
}
function popupNode(c) {
  const p = c.p, href = p.u ? siteLink(p) : null;
  return el('div', {}, el('h4', { text: p.n }), el('p', { text: [p.ci, p.rg, countryName(p.cc)].filter(Boolean).join(', ') }),
    c.km !== null ? el('p', { text: fmtDist(c.km) + ' away' }) : null,
    el('p', { text: p.ac === 'none' ? 'Not accredited' : p.ac === 'museum' ? 'Natural history museum' : p.ac.split(',').map((a) => ACCRED_TEXT[a] || a).join(' · ') }),
    (c.rank === 1 || c.rank === 3) ? el('span', { class: 'pp-unc', text: 'Unconfirmed' }) : null,
    href ? el('p', {}, el('a', { href, target: '_blank', rel: 'noopener noreferrer', text: 'Visit website ↗', 'data-rank': c.rank, 'data-type': p.t })) : null);
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
  if (opts && opts.fly) map.easeTo({ center: [c.p.lo, c.p.la], zoom: 6.5, duration: reducedMotion() ? 0 : 500 });   // the city plus its region: the outline-only map has no streets or labels, so closer in shows empty land
  if (popup) popup.remove();
  if (opts && opts.popup) popup = new mapLib.Popup({ offset: 12, closeButton: true, maxWidth: '280px' }).setLngLat([c.p.lo, c.p.la]).setDOMContent(popupNode(c)).addTo(map);
}
function setView(v) {
  S.view = v; $('zf-main').dataset.view = v;
  $('zf-tab-list').setAttribute('aria-pressed', String(v === 'list')); $('zf-tab-map').setAttribute('aria-pressed', String(v === 'map'));
  if (v === 'map') { drawMap(lastCands).then(() => map && map.resize()); }
}

// ---------- location ----------
function setOrigin(o) {
  track('zoo_location_used', { method: o.method || 'geolocation' });
  S.origin = o; S.editing = false; $('zf-q').value = o.fromGeo ? '' : o.label; $('zf-q').placeholder = o.fromGeo ? 'Using your location' : 'City or postcode';
  closeSuggest(); render();
}
function useMyLocation() {
  // ask first, in our own words, before the browser's own permission prompt
  const dlg = $('zf-geo');
  if (dlg && typeof dlg.showModal === 'function') {
    const share = dlg.querySelector('button[value=share]'), cancel = dlg.querySelector('button[value=cancel]');
    // act on the buttons directly (the dialog's close event is not reliable in every browser)
    const onShare = (e) => { e.preventDefault(); cancel.removeEventListener('click', onCancel); dlg.close('share'); getLocation(); };
    const onCancel = (e) => { e.preventDefault(); share.removeEventListener('click', onShare); dlg.close('cancel'); };
    share.addEventListener('click', onShare, { once: true }); cancel.addEventListener('click', onCancel, { once: true });
    dlg.addEventListener('cancel', () => { share.removeEventListener('click', onShare); cancel.removeEventListener('click', onCancel); }, { once: true });   // Esc
    dlg.showModal(); return;
  }
  getLocation();
}
function getLocation() {
  const btn = $('zf-locate'), st = $('zf-status');
  if (!('geolocation' in navigator)) { st.textContent = 'Your browser can not share your location. Try typing a city or postcode.'; return; }
  btn.disabled = true; st.textContent = 'Finding you…';
  navigator.geolocation.getCurrentPosition((pos) => {
    btn.disabled = false;
    setOrigin({ method: 'geolocation', la: pos.coords.latitude, lo: pos.coords.longitude, label: 'your location', fromGeo: true });
  }, () => {
    btn.disabled = false;
    st.textContent = 'No problem. We could not use your location, so try typing a city or postcode.';
  }, { maximumAge: 600000, timeout: 12000 });
}
let cities = null, citiesLoading = null; const postal = {};
const loadCities = () => cities ? Promise.resolve(cities) : (citiesLoading = citiesLoading || loadJson('/assets/zoos/geo/cities.json').then((c) => (cities = c.map((r) => ({ n: r[0], a: norm(r[1]), nn: norm(r[0]), cc: r[2], la: r[3], lo: r[4], pop: r[5], st: r[6] })))));
const loadPostal = (cc) => postal[cc] ? Promise.resolve(postal[cc]) : loadJson('/assets/zoos/geo/post-' + cc.toLowerCase() + '.json').then((d) => (postal[cc] = d)).catch(() => (postal[cc] = {}));
function postalCountries(q) {
  const k = q.toUpperCase().replace(/\s+/g, ''), out = [];
  if (/^\d{5}(-?\d{4})?$/.test(k)) ['US', 'DE', 'FR', 'ES'].forEach((c) => out.push([c, k.slice(0, 5)]));
  else if (/^\d{4}$/.test(k)) ['AU', 'NZ'].forEach((c) => out.push([c, k]));
  else {
    if (/^[A-Z]\d[A-Z]\d?[A-Z]?\d?$/.test(k) && k.length >= 3) out.push(['CA', k.slice(0, 3)]);
    if (/^[A-Z]{1,2}\d[A-Z\d]?(\d[A-Z]{2})?$/.test(k)) out.push(['GB', k.length >= 5 && /\d[A-Z]{2}$/.test(k) ? k.slice(0, -3) : k]);
    if (/^[A-Z]\d{2}[A-Z0-9]{0,4}$/.test(k)) out.push(['IE', k.slice(0, 3)]);
  }
  return out.sort((a, b) => (b[0] === HOME_CC) - (a[0] === HOME_CC));
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
  hit.sort((a, b) => ((b.cc === HOME_CC) - (a.cc === HOME_CC)) || b.pop - a.pop);
  const seen = new Set();
  return hit.filter((c) => { const k = c.n + c.cc + c.st; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 6)
    .map((c) => ({ method: 'city', la: c.la, lo: c.lo, label: c.n + (c.cc === 'US' && c.st ? ', ' + c.st : '') + ', ' + countryName(c.cc) }));
}
let sugg = [], suggIdx = -1, suggTimer = 0;
function closeSuggest() { const ul = $('zf-suggest'); ul.hidden = true; ul.textContent = ''; sugg = []; suggIdx = -1; $('zf-q').setAttribute('aria-expanded', 'false'); $('zf-q').removeAttribute('aria-activedescendant'); }
function showSuggest(list) {
  sugg = list; suggIdx = -1; const ul = $('zf-suggest'); ul.textContent = '';
  if (!list.length) ul.append(el('li', { role: 'option', 'aria-disabled': 'true', text: 'No match. Try a larger nearby city or a postcode.' }));
  list.forEach((s, i) => { const li = el('li', { role: 'option', id: 'zf-s' + i, text: s.label }); li.addEventListener('mousedown', (e) => { e.preventDefault(); setOrigin(s); }); ul.append(li); });
  ul.hidden = false; $('zf-q').setAttribute('aria-expanded', 'true');
}
function moveSuggest(d) {
  if (!sugg.length) return; suggIdx = (suggIdx + d + sugg.length) % sugg.length;
  [...$('zf-suggest').children].forEach((li, i) => li.setAttribute('aria-selected', String(i === suggIdx)));
  $('zf-q').setAttribute('aria-activedescendant', 'zf-s' + suggIdx);
}

// ---------- animal type-ahead ----------
let aList = [], aIdx = -1;
const KIND_LABEL = { wild: 'Zoos & aquariums', dino: 'Dinosaur · museums', farm: 'Farm animal · farms' };
function animalMatches(q) {
  const nq = norm(q);
  if (!nq) return POPULAR.map((id) => S.byId[id]).filter(Boolean);
  const words = nq.split(' ');
  const scored = [];
  for (const a of S.animals) {
    const name = norm(a.n), hay = name + ' ' + norm(a.gl || '') + ' ' + (SEARCH_TERMS[a.id] || '');
    let s = -1;
    if (name === nq) s = 0; else if (name.startsWith(nq)) s = 1; else if (name.split(' ').some((w) => w.startsWith(nq))) s = 2;
    else if (words.every((w) => hay.includes(w))) s = 3;
    if (s >= 0) scored.push([s, a]);
  }
  return scored.sort((x, y) => x[0] - y[0] || x[1].n.localeCompare(y[1].n)).slice(0, 8).map((x) => x[1]);
}
function closeAnimalList() { const ul = $('zf-animal-list'); ul.hidden = true; ul.textContent = ''; aList = []; aIdx = -1; $('zf-animal').setAttribute('aria-expanded', 'false'); $('zf-animal').removeAttribute('aria-activedescendant'); }
function showAnimalList(q) {
  aList = animalMatches(q); aIdx = -1; const ul = $('zf-animal-list'); ul.textContent = '';
  if (!aList.length) ul.append(el('li', { role: 'option', 'aria-disabled': 'true', text: q.trim() ? 'We can\u2019t find \u201c' + q.trim() + '\u201d yet. Press Enter to see animal places near you.' : 'Type an animal, like lion, penguin or T. rex.' }));
  aList.forEach((a, i) => {
    const li = el('li', { role: 'option', id: 'zf-a' + i }, el('span', { text: a.n }), el('small', { text: (KIND_LABEL[a.k] || '') + (a.e ? ' · ' + a.e + ' places' : '') }));
    li.addEventListener('mousedown', (e) => { e.preventDefault(); chooseAnimal(a.id); });
    ul.append(li);
  });
  ul.hidden = false; $('zf-animal').setAttribute('aria-expanded', 'true');
}
function moveAnimal(d) {
  if (!aList.length) return; aIdx = (aIdx + d + aList.length) % aList.length;
  [...$('zf-animal-list').children].forEach((li, i) => li.setAttribute('aria-selected', String(i === aIdx)));
  $('zf-animal').setAttribute('aria-activedescendant', 'zf-a' + aIdx);
}
function chooseAnimal(id) { closeAnimalList(); S.editing = false; S.unknown = ''; selectAnimal(id, 'picker'); if (!S.origin) $('zf-q').focus({ preventScroll: true }); }
// an animal we have not indexed: say so plainly and show animal places anyway
function unknownAnimal(q) {
  closeAnimalList(); S.cur = null; S.unknown = q.slice(0, 40); S.editing = false;
  document.title = DEFAULT_TITLE; history.replaceState(null, '', '/zoos/');
  track('zoo_animal_not_found', { query: norm(q).replace(/[^a-z ]/g, '').slice(0, 30) });   // an animal name only; helps us decide what to add next
  render();
}
function clearAnimal() { S.unknown = ''; S.cur = null; S.editing = true; $('zf-animal').value = ''; $('zf-animal-clear').hidden = true; document.title = DEFAULT_TITLE; history.replaceState(null, '', '/zoos/'); render(); $('zf-animal').focus(); showAnimalList(''); }

// ---------- animal + distance controls ----------
const DEFAULT_TITLE = document.title;
async function selectAnimal(id, source) {
  if (!id || !S.byId[id]) { S.cur = null; render(); return; }
  track('zoo_animal_selected', { animal_id: id, source });
  $('zf-status').textContent = 'Loading…';
  if (!S.cache[id]) S.cache[id] = await loadJson('/assets/zoos/a/' + id + '.json');
  S.cur = S.cache[id]; $('zf-animal').value = S.cur.name; $('zf-animal-clear').hidden = false;
  if (source !== 'landing') {
    history.replaceState(null, '', '/zoos/' + slugOf(id) + '/');
    document.title = 'Where to see ' + (/^[aeiou]/i.test(S.cur.name) ? 'an ' : 'a ') + S.cur.name + ' near you — Wild Atlas';
  }
  render();
}
function buildChips() {
  const box = $('zf-chips'), set = IMPERIAL ? CHIP_MI : CHIP_KM, unit = IMPERIAL ? 'mi' : 'km';
  const items = set.map((v) => ({ v, km: IMPERIAL ? v * KM_PER_MI : v, label: v + ' ' + unit })).concat([{ v: 0, km: Infinity, label: 'Any distance' }]);
  items.forEach((it, i) => {
    const id = 'zf-chip-' + i;
    const input = el('input', { type: 'radio', name: 'zf-dist', id, value: it.v, checked: it.v === 0, 'aria-label': it.v ? 'Within ' + it.label : 'Any distance' });
    input.addEventListener('change', () => { S.maxKm = it.km; S.distLabel = it.v ? 'Within ' + it.label : 'Any distance'; track('zoo_distance_filter', { distance: it.v ? it.v + ' ' + unit : 'no limit' }); render(); });
    box.append(el('label', { class: 'zf-chip', for: id }, input, el('span', { text: it.label })));
  });
}
function renderQuick() {
  const q = $('zf-quick'); q.textContent = ''; q.append('Try:');
  POPULAR.map((id) => S.byId[id]).filter(Boolean).forEach((a) => { const b = el('button', { type: 'button', text: a.n }); b.addEventListener('click', () => chooseAnimal(a.id)); q.append(b); });
}

async function init() {
  // stale cached page + newer script: say so instead of looking broken
  if (['zf-panel', 'zf-summary', 'zf-edit', 'zf-animal', 'zf-q', 'zf-chips', 'zf-results', 'zf-map', 'zf-main', 'zf-legend'].some((id) => !$(id))) {
    const r = $('zf-results') || document.body; r.prepend(el('p', { class: 'zf-empty' }, 'This page is out of date. Please ', el('a', { href: location.pathname, text: 'refresh' }), '.')); return;
  }
  buildChips();
  $('zf-legend').append(...[['e', 'Lists it'], ['w', 'Unconfirmed'], ['r', 'Close relative'], ['g', 'Similar animals']].map(([c, t]) => el('li', {}, el('span', { class: 'zf-dot ' + c, 'aria-hidden': 'true' }), t)),
    el('li', { id: 'zf-legend-me', hidden: true }, el('span', { class: 'zf-dot me', 'aria-hidden': 'true' }), 'You'));
  try {
    const [places, meta] = await Promise.all([loadJson(PLACES_URL), loadJson(ANIMALS_URL)]);
    S.places = places; S.groups = meta.groups;
    const gl = {}; Object.entries(meta.groups).forEach(([k, g]) => g.members.forEach((m) => (gl[m] = g.label)));
    S.animals = meta.animals.map((a) => Object.assign({}, a, { gl: gl[a.id] || '' })); S.animals.forEach((a) => { S.byId[a.id] = a; S.bySlug[slugOf(a.id)] = a; });
  } catch (e) { $('zf-status').textContent = 'Sorry, we could not load the places just now. Please try again in a moment.'; return; }
  renderQuick();
  const input = $('zf-animal');
  input.addEventListener('focus', () => showAnimalList(input.value === (S.cur && S.cur.name) ? '' : input.value));
  input.addEventListener('input', () => { $('zf-animal-clear').hidden = !input.value; if (S.unknown) S.unknown = ''; showAnimalList(input.value); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if ($('zf-animal-list').hidden) showAnimalList(input.value); moveAnimal(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveAnimal(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); const a = aList[aIdx >= 0 ? aIdx : 0]; if (a) chooseAnimal(a.id); else if (input.value.trim()) unknownAnimal(input.value.trim()); }
    else if (e.key === 'Escape') closeAnimalList();
  });
  input.addEventListener('blur', () => setTimeout(closeAnimalList, 150));
  $('zf-animal-clear').addEventListener('click', clearAnimal);
  $('zf-locate').addEventListener('click', useMyLocation);
  $('zf-edit').addEventListener('click', () => { S.editing = true; updateSummary(); $('zf-animal').focus(); });
  const q = $('zf-q');
  q.addEventListener('input', () => { clearTimeout(suggTimer); const v = q.value; if (v.trim().length < 2) { closeSuggest(); return; } suggTimer = setTimeout(async () => showSuggest(await suggest(v)), 140); });
  q.addEventListener('keydown', async (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSuggest(1); } else if (e.key === 'ArrowUp') { e.preventDefault(); moveSuggest(-1); } else if (e.key === 'Escape') closeSuggest();
    else if (e.key === 'Enter') { e.preventDefault(); const l = suggIdx >= 0 ? sugg[suggIdx] : (sugg[0] || (await suggest(q.value))[0]); if (l) setOrigin(l); else showSuggest([]); }
  });
  q.addEventListener('blur', () => setTimeout(closeSuggest, 150));
  $('zf-tab-list').addEventListener('click', () => setView('list'));
  $('zf-tab-map').addEventListener('click', () => setView('map'));
  $('zf-results').addEventListener('click', (e) => {
    const b = e.target.closest('[data-show]'); if (b) { if (window.matchMedia('(max-width: 899px)').matches) setView('map'); setActive(b.dataset.show, { fly: true, popup: true }); return; }
    if (e.target.id === 'zf-widen') { S.maxKm = Infinity; S.distLabel = 'Any distance'; document.querySelectorAll('input[name="zf-dist"]').forEach((i) => (i.checked = i.value === '0')); render(); }
    if (e.target.id === 'zf-another') { S.editing = true; updateSummary(); $('zf-animal').focus(); $('zf-animal').select(); }
  });
  const clicked = (e) => {
    const a = e.target.closest('a[target="_blank"]'); if (!a) return;
    const holder = a.closest('.zf-card') || a;
    if (holder.dataset.rank === undefined) return;
    track('zoo_result_click', { tier: TIER_NAME[Number(holder.dataset.rank)] || 'exact', place_type: holder.dataset.type || '' });
  };
  $('zf-results').addEventListener('click', clicked);
  $('zf-map').addEventListener('click', clicked);
  $('zf-main').dataset.view = 'list';
  // which animal? a landing page (/zoos/<animal>/) sets data-animal; the old /zoos/?animal=<id> links redirect to the landing page
  const root = $('zf'), legacy = new URLSearchParams(location.search).get('animal');
  const fromPath = root.dataset.animal, fromLegacy = legacy && (ALIASES[legacy] || legacy.replace(/-/g, '_'));
  if (!fromPath && fromLegacy && S.byId[fromLegacy]) { location.replace('/zoos/' + slugOf(fromLegacy) + '/'); return; }
  if (fromPath && S.byId[fromPath]) { await selectAnimal(fromPath, 'landing'); const seo = $('zf-seo-list'); if (seo) seo.remove(); } else render();
}
init();
