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
const TYPE_LABEL = { zoo: 'Zoo', aquarium: 'Aquarium', safari_park: 'Safari park', museum: 'Museum', farm: 'Farm / petting zoo', sanctuary: 'Sanctuary', wild: 'National park / reserve' };
const TYPE_EMOJI = { zoo: '🦁', aquarium: '🐠', safari_park: '🦒', museum: '🦴', farm: '🐐', sanctuary: '🐾', wild: '🌿' };
const ACCRED_TEXT = { AZA: 'AZA accredited', CAZA: 'CAZA accredited', EAZA: 'EAZA member', BIAZA: 'BIAZA member', ZAA: 'ZAA accredited', JAZA: 'JAZA member', 'protected-area': 'Protected area', unesco: 'UNESCO World Heritage site' };
const POPULAR = ['lion', 'giraffe', 'hippopotamus', 'african_elephant', 'emperor_penguin', 'dolphin', 'tyrannosaurus_rex', 'cow'];
const SEARCH_TERMS = { tyrannosaurus_rex: 't rex trex dinosaur', velociraptor: 'raptor dinosaur', hippopotamus: 'hippo', african_elephant: 'elephant', great_white_shark: 'shark', hammerhead_shark: 'shark', whale_shark: 'shark', emperor_penguin: 'penguin', atlantic_puffin: 'puffin bird', polar_bear: 'bear', panda: 'giant panda bear', cow: 'cattle farm', pig: 'farm', sheep: 'farm lamb', horse: 'farm pony' };

// Opening view when no animal and no location is set: most visitors are in the USA, so North America by default (Europe / Oceania by browser language)
const EU = 'GB IE FR DE ES IT NL BE PT CH AT SE NO DK FI PL CZ SK HU RO GR'.split(' '), OC = ['AU', 'NZ'];
const START_VIEW = OC.includes(HOME_CC) ? [[108, -48], [180, -9]] : EU.includes(HOME_CC) ? [[-12, 34], [38, 62]] : [[-135, 14], [-55, 60]];
// Analytics (GA4, already on the site). Privacy rule: NEVER send a location, a typed city/postcode, a place name, or a distance.
// Only non-personal fields: animal id, how the visitor located themselves (method name only), filter value, result tier + place type.
const TIER_NAME = ['exact', 'unconfirmed', 'relative', 'relative', 'similar', 'wild'];
function track(name, params) { try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) { /* analytics must never break the page */ } }
let lastEmpty = '';

const $ = (id) => document.getElementById(id);
const TYPE_GROUPS = [['zoo', 'Zoos'], ['aquarium', 'Aquariums'], ['museum', 'Museums'], ['farm', 'Farms and petting zoos'], ['wild', 'National parks and reserves']];
const typeKey = (t) => (t === 'safari_park' || t === 'sanctuary' ? 'zoo' : t);
const KEYS = [['e', 'Lists it', 0], ['w', 'Unconfirmed', 1], ['r', 'Close relative', 2], ['g', 'Similar animals', 3], ['d', 'In the wild', 4]];   // map key: dot class, label, tier
const S = { types: new Set(TYPE_GROUPS.map((g) => g[0])), hidden: new Set(), keep: false, places: [], animals: [], byId: {}, bySlug: {}, groups: {}, cur: null, origin: null, maxKm: Infinity, distLabel: 'Any distance', editing: false, unknown: '', active: null, place: null, view: 'list', cache: {} };
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
  for (const [pi, obs, via] of (d.w || [])) out.push({ pi, rank: 5, obs, via });   // national parks / reserves: their own section
  for (const c of out) {
    c.p = S.places[c.pi];
    c.km = S.origin ? haversineKm({ la: S.origin.la, lo: S.origin.lo }, c.p) : null;
  }
  return out.filter((c) => c.km === null || c.km <= S.maxKm);
}
// Sections: [exact + unconfirmed], [close relatives], [similar animals]. Inside a section the list is ordered by distance from the visitor
// (unconfirmed places are mixed in by distance and marked on the card); with no location, the visitor's own country comes first.
const groupOf = (r) => (r <= 1 ? 0 : r <= 3 ? 1 : r === 4 ? 2 : 3);
function sortCands(list) {
  return list.sort((a, b) => groupOf(a.rank) - groupOf(b.rank)
    || ((a.rank === 5 && b.rank === 5) ? ((a.via ? 1 : 0) - (b.via ? 1 : 0)) : 0)   // in the wild: parks with the animal itself before parks with a close relative
    || (a.km !== null ? a.km - b.km
      : (a.rank - b.rank) || ((a.p.t === 'farm') - (b.p.t === 'farm')) || ((b.p.cc === HOME_CC) - (a.p.cc === HOME_CC)) || (a.p.cc + a.p.n).localeCompare(b.p.cc + b.p.n)));
}
// "All animals" view (no animal chosen): every zoo, aquarium, safari park and museum, so the page starts as a world map
function allCandidates() {
  return S.places.map((p, pi) => ({ pi, rank: p.t === 'wild' ? 5 : 0, p, km: S.origin ? haversineKm({ la: S.origin.la, lo: S.origin.lo }, p) : null }))
    .filter((c) => c.km === null || c.km <= S.maxKm);
}
// the type filter (More filters) and the map key (click a key item to hide that kind of result) both narrow what is shown
const visible = (c) => S.types.has(typeKey(c.p.t)) && !S.hidden.has(TIER_OF(c.rank));
const filtered = () => S.types.size < TYPE_GROUPS.length || S.hidden.size > 0;

// ---------- rendering ----------
// Quiet by design: ONE short "check with the place" line lives in the page header. Cards only say something when the match is not a plain exact one.
function noteFor(c) {
  if (!S.cur) return { text: '', weak: false };
  const k = S.cur.kind;
  if (c.rank === 5 && !S.cur) return { text: 'National park or reserve. Wildlife is never guaranteed.', weak: false };
  if (c.rank === 5) {
    const n = c.obs || 0;
    return { text: (c.via ? 'A close relative is recorded here: ' + c.via + '. ' : (n >= 25 ? 'Recorded here by visitors and researchers (open data). ' : 'A few sightings recorded here. ')) + 'Wildlife is never guaranteed.', weak: false };
  }
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
const accredBadge = (p) => p.ac === 'unverified' ? null : p.ac === 'none' ? el('span', { class: 'zf-badge na', text: 'Not accredited' })
  : p.ac === 'protected-area' ? el('span', { class: 'zf-badge', text: 'Protected area' })
  : p.ac === 'unesco' ? el('span', { class: 'zf-badge', text: 'UNESCO World Heritage' })
  : p.ac === 'museum' ? null : el('span', { class: 'zf-badge', text: p.ac.split(',').map((a) => ACCRED_TEXT[a] || a).join(' · ') });
// no photo (or a photo that failed): a Wild Atlas place-type icon (Gemini, wild-atlas-icon-generator rules); emoji only if even that fails
const ICON_OF = { zoo: 'zoo', safari_park: 'zoo', sanctuary: 'zoo', aquarium: 'aquarium', museum: 'museum', farm: 'farm', wild: 'wild' };
function placeholder(p) {
  const img = el('img', { class: 'zf-photo zf-icon', src: '/assets/zoos/icons/place-' + (ICON_OF[p.t] || 'zoo') + '.png', alt: '', 'aria-hidden': 'true', loading: 'lazy', width: 96, height: 96 });
  img.addEventListener('error', () => img.replaceWith(el('div', { class: 'zf-photo-ph', 'aria-hidden': 'true', text: TYPE_EMOJI[p.t] || '🐾' })), { once: true });
  return img;
}
function card(c) {
  const p = c.p, note = noteFor(c), href = p.u ? siteLink(p) : null;
  let photo = placeholder(p), credit = null;
  if (p.ph) {
    const img = el('img', { class: 'zf-photo', src: '/assets/zoos/img/' + p.id + '.jpg', alt: 'Photo of ' + p.n, loading: 'lazy', decoding: 'async', width: 96, height: 96 });
    // never show a broken-image tile: if a photo fails to load, swap in the place-type tile and drop its credit
    img.addEventListener('error', () => { img.replaceWith(placeholder(p)); const cr = img.closest('.zf-card') && img.closest('.zf-card').querySelector('.zf-credit'); if (cr) cr.remove(); }, { once: true });
    photo = img; credit = p.cr ? el('details', { class: 'zf-credit' }, el('summary', { text: 'Photo credit' }), el('span', { text: creditText(p.cr) })) : null;
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
        el('button', { type: 'button', 'data-show': c.pi, text: 'Show on map' }), credit)));
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
  const collapsed = false;   // the animal and place fields stay separate so the animal is always one click to change
  $('zf-panel').hidden = collapsed; $('zf-summary').hidden = !collapsed;
  $('zf-edit').setAttribute('aria-expanded', String(!collapsed));
  if (collapsed) $('zf-sum-text').textContent = [S.cur.name, S.origin.label === 'your location' ? 'Near you' : S.origin.label, S.distLabel].join(' · ');
  $('zf-legend-me').hidden = !S.origin;
}
function render() {
  const d = S.cur, box = $('zf-results'); box.textContent = '';
  $('zf-quick').hidden = !!d && !S.unknown ? true : false; updateSummary();
  if (!d) {
    const everyone = sortCands(allCandidates()).filter(visible), zoosAll = everyone.filter((c) => c.rank === 0), parksAll = everyone.filter((c) => c.rank === 5);
    const picked = S.place !== null && S.place !== undefined ? everyone.find((c) => c.pi === S.place) : null;
    if (picked) box.append(section('You searched for', '', [picked]));
    if (zoosAll.length) box.append(section('All places', '(' + zoosAll.length.toLocaleString('en') + ')', zoosAll));
    if (parksAll.length) box.append(section('See it in the wild', '(' + parksAll.length.toLocaleString('en') + ' national parks and reserves)', parksAll));
    if (!everyone.length) box.append(el('div', { class: 'zf-empty' }, el('p', { text: filtered() ? 'No places match these filters.' : 'Nothing within that distance.' }), filtered() ? el('button', { type: 'button', class: 'zf-btn', id: 'zf-resetf', text: 'Show everything again' }) : null, Number.isFinite(S.maxKm) ? el('button', { type: 'button', class: 'zf-btn', id: 'zf-widen', text: 'Search any distance' }) : null));
    const where = '';
    $('zf-status').textContent = (S.unknown ? 'We can\u2019t find \u201c' + S.unknown + '\u201d yet, so here are animal places ' + (S.origin ? 'near you' : 'to start with') + '. ' : '') + (S.unknown ? '' : where);
    lastCands = everyone; return drawMap(everyone);
  }
  const all = sortCands(candidates()).filter(visible);
  const exact = all.filter((c) => c.rank <= 1), rel = all.filter((c) => c.rank === 2 || c.rank === 3), grp = all.filter((c) => c.rank === 4), wild = all.filter((c) => c.rank === 5);
  const noun = d.kind === 'dino' ? 'Museums with ' : d.kind === 'farm' ? 'Farms and petting zoos for ' : 'Places with ';
  // the wild section leads when a park is closer than the nearest zoo (e.g. a visitor in Nairobi); otherwise it follows the zoo results
  const wildFirst = !!(S.origin && wild.length && (!exact.length || wild[0].km < exact[0].km));
  const wildSec = wild.length ? section('See it in the wild', '(' + wild.length + ' national parks and reserves)', wild) : null;
  if (wildFirst && wildSec) box.append(wildSec);
  if (exact.length) box.append(section(noun + d.name, '(' + exact.length + ')', exact));
  if (rel.length) box.append(section('Places with a close relative', '(' + rel.length + ')', rel));
  if (grp.length) {
    const label = d.kind === 'farm' ? 'Farms and petting zoos' : 'More places with ' + (d.group ? d.group.label : 'similar animals') + ' (this animal may not be there)';
    const body = cardList(grp);
    if (exact.length || rel.length) box.append(el('details', { class: 'zf-more' }, el('summary', { text: label + ' (' + grp.length + ')' }), body));
    else box.append(el('section', { class: 'zf-sec' }, el('h2', {}, label, el('small', { text: ' (' + grp.length + ')' })), body));
  }
  if (wildSec && !wildFirst) box.append(wildSec);
  if (!all.length) {
    const total = d.e.length + d.r.length + d.g.length + (d.w || []).length;
    const e = el('div', { class: 'zf-empty' }, el('p', { text: filtered() && total ? 'No places match these filters.' : total ? 'Nothing within that distance.' : 'We have not found a place for this one yet. We are still checking.' }));
    if (total && Number.isFinite(S.maxKm)) e.append(el('button', { type: 'button', class: 'zf-btn', id: 'zf-widen', text: 'Search any distance' }));
    if (filtered() && total) e.append(el('button', { type: 'button', class: 'zf-btn', id: 'zf-resetf', text: 'Show everything again' }));
    e.append(el('button', { type: 'button', class: 'zf-btn zf-btn-quiet', id: 'zf-another', text: 'Pick another animal' }));
    box.append(e);
  }
  const primary = all.filter((c) => c.rank <= 3);
  let msg = '';
  if (!S.origin) {
    const home = HOME_CC && primary.some((c) => c.p.cc === HOME_CC);
    msg = all.length ? (home ? 'Showing places in ' + countryName(HOME_CC) + ' first.' : '') : '';
  } else {
    const near = (primary[0] || all[0]), nearWild = wild[0];
    msg = '';   // sorted by distance already; the cards say how far
    if (near && near.rank !== 5 && near.km > FAR_KM) {
      msg += 'The closest ' + (d.kind === 'dino' ? 'museum' : 'zoo or museum') + ' is ' + near.p.n + ', ' + fmtDist(near.km) + ' away.';
      if (nearWild && nearWild.km < near.km) msg += ' In the wild, ' + nearWild.p.n + ' is ' + fmtDist(nearWild.km) + ' away.';
    } else if (near && near.rank === 5 && near.km > FAR_KM) msg += 'The closest is ' + near.p.n + ', ' + fmtDist(near.km) + ' away.';
  }
  $('zf-status').textContent = msg;
  const near2 = [...primary.slice(0, 1), ...wild.slice(0, 1)].sort((a, b) => (a.km || 0) - (b.km || 0))[0] || all[0];
  const emptyReason = !all.length ? ((d.e.length + d.r.length + d.g.length + (d.w || []).length) ? 'none_in_range' : 'no_data') : (S.origin && near2 && near2.km > FAR_KM ? 'far' : '');
  const sig = emptyReason ? d.id + '|' + emptyReason : '';
  if (sig && sig !== lastEmpty) track('zoo_empty_state', { animal_id: d.id, reason: emptyReason });
  lastEmpty = sig;
  drawMap(all);
}

// ---------- map ----------
const FLY_ZOOM = 5.3;   // plain SVG fallback map (no streets): the city and the region around it
const STREET_FLY_ZOOM = 16;   // "Show on map" on the real map: street level, with the place's own streets and buildings
const TEAL = '#0E7C86', TEAL_DARK = '#08454A', GREEN = '#2E7D32', GREEN_DARK = '#17441a', YELLOW = '#FACC15', YELLOW_DARK = '#6b5200', YOU = '#2563EB';
let map = null, mapLib = null, popup = null, mapReady = null, lastCands = [];
// when a place is searched (or located) the map opens about 30 miles / 50 km across, centred on it; if no result is inside that box it widens to take in the closest three
const NEAR_KM = IMPERIAL ? 24.1 : 25;
function nearBox(o, cands) {
  // on a phone the map is small, so open closer (about 10 miles / 18 km across) to show streets rather than a bare outline
  const phone = window.matchMedia('(max-width: 899px)').matches, R = phone ? 9 : NEAR_KM;
  const dLa = R / 111, dLo = R / (111 * Math.max(0.2, Math.cos(o.la * Math.PI / 180)));
  const b = [[o.lo - dLo, o.la - dLa], [o.lo + dLo, o.la + dLa]];
  if (!cands.some((c) => Math.abs(c.p.la - o.la) <= dLa && Math.abs(c.p.lo - o.lo) <= dLo)) {
    cands.filter((c) => c.km !== null).sort((x, y) => x.km - y.km).slice(0, phone ? 1 : 3).forEach((c) => { b[0][0] = Math.min(b[0][0], c.p.lo); b[0][1] = Math.min(b[0][1], c.p.la); b[1][0] = Math.max(b[1][0], c.p.lo); b[1][1] = Math.max(b[1][1], c.p.la); });
  }
  return b;
}
const TIER_OF = (rank) => (rank === 0 ? 0 : rank === 1 ? 1 : rank <= 3 ? 2 : rank === 4 ? 3 : 4);
// pin sizes shrink a lot when the map is zoomed out (thousands of places at world level), and reach their full size by zoom 5
const zoomR = (a, b, c) => ['interpolate', ['linear'], ['zoom'], 0, a * 0.28, 2, a * 0.4, 4, b * 0.75, 5, b, 9, c];
const zoomW = (w) => ['interpolate', ['linear'], ['zoom'], 0, w * 0.35, 3, w * 0.6, 5, w];
const CLUSTER_MAX_ZOOM = 4;   // zoomed out further than this, nearby places merge into a numbered circle
function mapStyle() {
  const pin = (id, tier, radius, paint) => ({ id, type: 'circle', source: 'pins', filter: ['==', ['get', 'tier'], tier], paint: Object.assign({ 'circle-radius': radius }, paint) });
  return {
    version: 8,
    sources: {
      countries: { type: 'geojson', data: '/assets/zoos/geo/countries.json', maxzoom: 7, tolerance: 0.6 },
      pins: { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, cluster: true, clusterMaxZoom: CLUSTER_MAX_ZOOM, clusterRadius: 46, clusterProperties: { best: ['min', ['get', 'tier']] } },
      me: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#dbe9f3' } },
      // a soft shoreline halo on the water side (the land fill below covers the inland half), then land, then bolder country borders
      { id: 'coast', type: 'line', source: 'countries', paint: { 'line-color': '#bcd3e5', 'line-width': ['interpolate', ['linear'], ['zoom'], 0, 3, 4, 8, 8, 14], 'line-blur': ['interpolate', ['linear'], ['zoom'], 0, 2, 4, 5, 8, 8] } },
      { id: 'land', type: 'fill', source: 'countries', paint: { 'fill-color': '#f7efdc' } },
      { id: 'borders', type: 'line', source: 'countries', layout: { 'line-join': 'round' }, paint: { 'line-color': '#8a7650', 'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.8, 3, 1.3, 6, 2] } },
      // tier 3 similar animals: small grey ring; tier 2 close relative: small green dot; tier 1 unconfirmed: yellow dot; tier 0 lists it: large green dot with white halo
      pin('pins-g', 3, zoomR(3.5, 5, 7), { 'circle-color': '#ffffff', 'circle-stroke-color': '#6b6b6b', 'circle-stroke-width': zoomW(1.6) }),
      pin('pins-r', 2, zoomR(3.5, 5, 7), { 'circle-color': GREEN, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': zoomW(1.5) }),
      { id: 'halo', type: 'circle', source: 'pins', filter: ['any', ['<=', ['get', 'tier'], 1], ['==', ['get', 'tier'], 4]], paint: { 'circle-radius': zoomR(7, 9.5, 12.5), 'circle-color': '#ffffff' } },
      pin('pins-w', 1, zoomR(5, 7, 9.5), { 'circle-color': YELLOW, 'circle-stroke-color': YELLOW_DARK, 'circle-stroke-width': zoomW(2) }),
      pin('pins-d', 4, zoomR(5, 7, 9.5), { 'circle-color': TEAL, 'circle-stroke-color': TEAL_DARK, 'circle-stroke-width': zoomW(1.5) }),   // in the wild: national parks / reserves
      pin('pins-e', 0, zoomR(5, 7, 9.5), { 'circle-color': GREEN, 'circle-stroke-color': GREEN_DARK, 'circle-stroke-width': zoomW(1.5) }),
      { id: 'active', type: 'circle', source: 'pins', filter: ['==', ['get', 'pi'], -1], paint: { 'circle-radius': 15, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': '#2A2118', 'circle-stroke-width': zoomW(3) } },
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
    // with a location set, the + button homes in on the blue dot: each press zooms one level and slides the view most of the way toward it (zoom out stays centred)
    const nav = document.querySelector('#zf-map .maplibregl-ctrl-group');
    if (nav) nav.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('button'); if (!b || !S.origin) return;
      const o = S.origin, c = map.getCenter(), z = map.getZoom(), d = reducedMotion() ? 0 : 400;
      if (b.classList.contains('maplibregl-ctrl-zoom-in')) { e.stopImmediatePropagation(); e.preventDefault(); map.easeTo({ center: [c.lng + (o.lo - c.lng) * 0.6, c.lat + (o.la - c.lat) * 0.6], zoom: Math.min(z + 1, 18), duration: d }); }
    }, true);
    map.addControl(new mapLib.AttributionControl({ compact: true, customAttribution: 'Outlines: Natural Earth' }));
    await new Promise((res) => (map.loaded() ? res() : map.once('load', res)));
    delete $('zf-map').dataset.loading;
    // no polar ocean (maplibre 6's maxBounds throws here, so: a zoom floor that fits the 84°N to 58°S band, and a latitude clamp when a move ends)
    const floorZoom = () => { const el = $('zf-map'); try { map.setMinZoom(Math.max(0.6, Math.log2(el.clientWidth / 512), Math.log2(el.clientHeight / 342))); } catch (e) {} };
    floorZoom(); map.on('resize', floorZoom);
    map.on('moveend', () => {
      try {
        const b = map.getBounds(), d = b.getNorth() > 84 ? 84 - b.getNorth() : b.getSouth() < -58 ? -58 - b.getSouth() : 0;
        if (Math.abs(d) > 0.05) { const c = map.getCenter(); map.jumpTo({ center: [c.lng, Math.max(-80, Math.min(80, c.lat + d))] }); }
      } catch (e) {}
    });
    console.debug('[zoos map] ready in ' + Math.round(performance.now() - t0) + ' ms');
    // state/province outlines (1 MB) are only fetched once the visitor zooms in, so the first view starts faster
    const addAdmin1 = () => {
      if (map.getSource('admin1') || map.getZoom() < 2.5) return;
      map.addSource('admin1', { type: 'geojson', data: '/assets/zoos/geo/admin1.json', maxzoom: 7, tolerance: 0.6 });
      map.addLayer({ id: 'admin1', type: 'line', source: 'admin1', paint: { 'line-color': '#c4b085', 'line-width': 0.8, 'line-opacity': ['interpolate', ['linear'], ['zoom'], 2.5, 0.35, 4.5, 1] } }, 'borders');
    };
    map.on('zoomend', addAdmin1); addAdmin1();
    map.on('zoomend', addStreets); map.on('moveend', addStreets); addStreets();
    addCountryLabels();
    const layers = ['pins-e', 'pins-d', 'pins-w', 'pins-r', 'pins-g'];
    map.on('click', layers, (e) => { const f = e.features && e.features[0]; if (f) setActive(f.properties.pi, { popup: true, scroll: true }); });
    layers.forEach((l) => { map.on('mouseenter', l, () => (map.getCanvas().style.cursor = 'pointer')); map.on('mouseleave', l, () => (map.getCanvas().style.cursor = '')); });
    // clusters are HTML circles (no font files needed): rebuilt from the clustered source whenever the view changes
    const cm = new Map();
    const drawClusters = () => {
      if (!map.getSource('pins') || !map.isStyleLoaded()) return;
      const seen = new Set();
      map.querySourceFeatures('pins', { filter: ['has', 'point_count'] }).forEach((f) => {
        const id = f.properties.cluster_id; if (seen.has(id)) return; seen.add(id);
        const n = f.properties.point_count, ll = f.geometry.coordinates;
        let m = cm.get(id);
        if (!m) {
          const b = el('button', { type: 'button', class: 'zf-cluster', 'aria-label': n + ' places, zoom in' });
          b.addEventListener('click', async () => { try { const z = await map.getSource('pins').getClusterExpansionZoom(id); map.easeTo({ center: b._ll, zoom: Math.min(z + 0.3, 13), duration: reducedMotion() ? 0 : 500 }); } catch (e) { /* ignore */ } });
          m = new mapLib.Marker({ element: b }).setLngLat(ll).addTo(map); m._b = b; cm.set(id, m);
        }
        m._b._ll = ll; m._b.textContent = n >= 1000 ? Math.round(n / 100) / 10 + 'k' : String(n);
        const d = n < 10 ? 26 : n < 100 ? 32 : n < 500 ? 40 : 48;
        m._b.style.width = m._b.style.height = d + 'px'; m._b.dataset.t = f.properties.best <= 1 ? 'a' : 'b';
      });
      cm.forEach((m, id) => { if (!seen.has(id)) { m.remove(); cm.delete(id); } });
    };
    map.on('render', () => { if (map.loaded()) drawClusters(); });
    map.on('moveend', drawClusters); map.on('sourcedata', (e) => { if (e.sourceId === 'pins' && e.isSourceLoaded) drawClusters(); });
    if (!map.getSource('pins')) await new Promise((res) => map.once('styledata', res));
    return map;
  })();
  return mapReady;
}
// Country names on the outline map: plain HTML labels in the site font (no font files from anywhere else). Bigger countries show first as you zoom in;
// they step aside at city zoom, where the street map has its own labels.
let labelsOn = false;
async function addCountryLabels() {
  if (labelsOn) return; labelsOn = true;
  try {
    const gj = await (await fetch('/assets/zoos/geo/countries.json')).json();
    const items = gj.features.map((f) => {
      const g = f.geometry, polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates; let best = null, bestA = -1;
      polys.forEach((poly) => { const r = poly[0]; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; r.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }); const a = (x1 - x0) * (y1 - y0) * Math.cos(((y0 + y1) / 2) * Math.PI / 180); if (a > bestA) { bestA = a; best = [(x0 + x1) / 2, (y0 + y1) / 2]; } });
      return { n: f.properties.n, at: best, a: bestA };
    }).filter((i) => i.at && i.n).sort((a, b) => b.a - a.a);
    const marks = items.map((it, rank) => {
      const e = el('div', { class: 'zf-clabel', text: it.n }); const m = new mapLib.Marker({ element: e, anchor: 'center' }).setLngLat(it.at).addTo(map);
      return { e, rank };
    });
    const sync = () => { const z = map.getZoom(), lim = z < 2 ? 14 : z < 3 ? 38 : z < 4.2 ? 85 : 999; marks.forEach((m) => { m.e.hidden = z >= 5.2 || m.rank >= lim; }); };
    map.on('zoom', sync); sync();
  } catch (e) { console.warn('[zoos map] country names unavailable', e); }
}
// Street detail (roads, buildings, water, parks, place names) from OpenFreeMap (OpenStreetMap data). Nothing is requested from them until the map is
// zoomed in to about state level (zoom 5+); until then every request stays on our own site. Their style supplies the layers; we add them under the pins.
const STREET_ZOOM = 5;   // about a state or region on screen
let streets = 0;   // 0 not asked yet, 1 loading, 2 on, 3 failed (outlines only)
async function addStreets() {
  if (streets || !map || map.getZoom() < STREET_ZOOM) return;
  streets = 1;
  try {
    const st = await (await fetch('https://tiles.openfreemap.org/styles/liberty')).json();
    map.addSource('openmaptiles', st.sources.openmaptiles); map.setGlyphs(st.glyphs);
    for (const l of st.layers) {
      const icon = l.type === 'symbol' && l.layout && l.layout['icon-image'], label = icon && /^label_/.test(l.id);   // town / city names carry a dot icon: keep the name, drop the dot
      if (l.type === 'raster' || (icon && !label) || (l.paint && (l.paint['fill-pattern'] || l.paint['line-pattern']))) continue;   // no sprite sheet: skip icon and pattern layers
      const layer = JSON.parse(JSON.stringify(l));
      if (label) { delete layer.layout['icon-image']; delete layer.layout['icon-size']; delete layer.layout['icon-anchor']; }
      if (l.type === 'background') layer.paint = Object.assign({}, l.paint, { 'background-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 6.5, 1] });
      else layer.minzoom = Math.max(l.minzoom || 0, 5.5);
      map.addLayer(layer, 'borders');
    }
    // our simplified outlines fade out as the detailed street map fades in (they would not line up with real borders)
    map.setPaintProperty('land', 'fill-opacity', ['interpolate', ['linear'], ['zoom'], 5, 1, 6.5, 0]);
    ['borders', 'admin1'].forEach((id) => { if (map.getLayer(id)) map.setPaintProperty(id, 'line-opacity', ['interpolate', ['linear'], ['zoom'], 5, 1, 6.5, 0]); });
    streets = 2;
  } catch (e) { streets = 3; console.warn('[zoos map] street detail unavailable', e); }
}
function mapProblem(why) {
  const box = $('zf-map'); if (!box || box.dataset.failed) return; box.dataset.failed = '1'; delete box.dataset.loading;
  box.textContent = ''; box.append(el('p', { class: 'zf-maperr' }, 'The map could not start in this browser, but the list has the same places.', el('small', {}, why ? ' (' + String(why).slice(0, 120) + ')' : '')));
  console.error('[zoos map]', why);
}

// ---------- fallback map (no WebGL): plain SVG, same pins, drag / wheel / +- to move ----------
const FB = { svg: null, gPins: null, gMe: null, ring: null, pop: null, vb: null, cw: 600, ch: 400, pins: [], ready: null, drag: null };
const FB_K = 2;   // svg units per degree
function fbProject(lo, la) { return [(lo + 180) * FB_K, (90 - la) * FB_K]; }
function fbSvg(tag, attrs) { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; }
function fbWebglOk() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
// zoomed out, nearby pins merge into numbered circles (same idea as the WebGL map): grid cells of ~46 screen px, only below about state level
function fbClusters(k) {
  if (!FB.gClu) { FB.gClu = fbSvg('g', {}); FB.svg.insertBefore(FB.gClu, FB.gPins.nextSibling); }
  FB.gClu.textContent = '';
  const z = Math.log2((FB.cw / (FB.vb.w / FB_K)) * 360 / 512);
  if (z >= CLUSTER_MAX_ZOOM + 0.5 || !FB.cw) return;
  const cell = 46 * k, cells = new Map();
  FB.pins.forEach((p) => { const key = Math.floor(p.x / cell) + ':' + Math.floor(p.y / cell); let c = cells.get(key); if (!c) cells.set(key, (c = [])); c.push(p); });
  cells.forEach((ps) => {
    if (ps.length < 2) return;
    ps.forEach((p) => { p.g.style.display = 'none'; });
    const x = ps.reduce((a, p) => a + p.x, 0) / ps.length, y = ps.reduce((a, p) => a + p.y, 0) / ps.length, n = ps.length;
    const r = (n < 10 ? 13 : n < 100 ? 16 : n < 500 ? 20 : 24) * k, best = Math.min(...ps.map((p) => p.t));
    const g = fbSvg('g', { class: 'zf-fbclu', transform: 'translate(' + x + ' ' + y + ')', role: 'button', 'aria-label': n + ' places, zoom in' });
    g.append(fbSvg('circle', { r, fill: best <= 1 ? '#5aa469' : '#8d8272', stroke: '#fff', 'stroke-width': 2 * k }));
    const t = fbSvg('text', { 'text-anchor': 'middle', y: 4 * k, fill: '#fff', 'font-size': 12 * k, 'font-weight': 700 }); t.textContent = n >= 1000 ? Math.round(n / 100) / 10 + 'k' : n; g.append(t);
    g.addEventListener('click', () => { const v = FB.vb, w = v.w / 2.6; FB.vb = { x: x - w / 2, y: y - w * FB.ch / FB.cw / 2, w }; fbClamp(); fbApply(); });
    FB.gClu.append(g);
  });
}
function fbApply() {
  const v = FB.vb, k = FB.cw ? v.w / FB.cw : 1;
  FB.svg.setAttribute('viewBox', [v.x, v.y, v.w, v.w * FB.ch / FB.cw].join(' '));
  const f = Math.max(0.35, Math.min(1, 0.35 + 0.16 * Math.log2(360 * FB_K / v.w)));   // smaller pins when zoomed out
  FB.pins.forEach((p) => { p.g.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') scale(' + (k * f) + ')'); p.g.style.display = ''; });
  fbClusters(k);
  FB.gMe.setAttribute('transform', FB.meXY ? 'translate(' + FB.meXY[0] + ' ' + FB.meXY[1] + ') scale(' + k + ')' : 'translate(-999 -999)');
  FB.ring.setAttribute('transform', FB.ringXY ? 'translate(' + FB.ringXY[0] + ' ' + FB.ringXY[1] + ') scale(' + k + ')' : 'translate(-999 -999)');
  if (FB.popFor) fbPlacePop();
}
const FB_Y0 = (90 - 84) * FB_K, FB_Y1 = (90 + 58) * FB_K;   // no polar ocean: the map stops at 84°N and 58°S
function fbClamp() { const v = FB.vb; v.w = Math.min(360 * FB_K, (FB_Y1 - FB_Y0) * FB.cw / FB.ch, Math.max(1.5 * FB_K * (FB.cw / 100), v.w)); const h = v.w * FB.ch / FB.cw; v.x = Math.max(0, Math.min(360 * FB_K - v.w, v.x)); v.y = Math.max(FB_Y0, Math.min(FB_Y1 - h, v.y)); }
function fbZoom(f, cx, cy) {   // f > 1 zooms in about the container point (cx, cy)
  const v = FB.vb, k = v.w / FB.cw, ux = v.x + cx * k, uy = v.y + cy * k, nw = v.w / f;
  v.w = nw; const nk = nw / FB.cw; v.x = ux - cx * nk; v.y = uy - cy * nk; fbClamp(); fbApply();
}
function fbFitBounds(b, pad) {   // b = [[w, s], [e, n]]
  const [x0, y0] = fbProject(b[0][0], b[1][1]), [x1, y1] = fbProject(b[1][0], b[0][1]);
  const w = Math.max(x1 - x0, 4), h = Math.max(y1 - y0, 4), padU = (pad || 10) * Math.max(w / FB.cw, 0.01);
  const need = Math.max((w + 2 * padU), (h + 2 * padU) * FB.cw / FB.ch);
  FB.vb = { x: (x0 + x1) / 2 - need / 2, y: (y0 + y1) / 2 - need * FB.ch / FB.cw / 2, w: need }; fbClamp(); fbApply();
}
function fbPlacePop() {
  const c = FB.popFor, v = FB.vb, k = v.w / FB.cw, [x, y] = fbProject(c.p.lo, c.p.la);
  const px = (x - v.x) / k, py = (y - v.y) / k, pop = FB.pop;
  pop.style.left = Math.max(8, Math.min(FB.cw - 8, px)) + 'px'; pop.style.top = Math.max(8, py - 12) + 'px';
}
function fbClosePop() { FB.popFor = null; if (FB.pop) FB.pop.hidden = true; }
async function fbInit() {
  if (FB.ready) return FB.ready;
  FB.ready = (async () => {
    const box = $('zf-map'); box.textContent = ''; box.classList.add('zf-fbmap'); delete box.dataset.failed;
    FB.cw = box.clientWidth || 600; FB.ch = box.clientHeight || 400;
    const svg = FB.svg = fbSvg('svg', { class: 'zf-fb', role: 'img', 'aria-label': 'Map of places', preserveAspectRatio: 'xMidYMid slice' });
    svg.append(fbSvg('rect', { x: -400, y: -400, width: 1520, height: 1120, fill: '#dbe9f3' }));
    const data = await (await fetch('/assets/zoos/geo/countries.json')).json();
    let d = '';
    const ring = (r) => 'M' + r.map((pt) => { const q = fbProject(pt[0], pt[1]); return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'Z';
    data.features.forEach((f) => { const g = f.geometry; (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).forEach((poly) => poly.forEach((r) => { d += ring(r); })); });
    svg.append(fbSvg('path', { d, fill: '#f7efdc', stroke: '#a8946a', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke', 'fill-rule': 'evenodd' }));
    FB.gPins = fbSvg('g', {}); svg.append(FB.gPins);
    FB.gMe = fbSvg('g', {}); FB.gMe.append(fbSvg('circle', { r: 18, fill: YOU, 'fill-opacity': .18 }), fbSvg('circle', { r: 11, fill: '#fff' }), fbSvg('circle', { r: 8, fill: YOU })); svg.append(FB.gMe);
    FB.ring = fbSvg('g', {}); FB.ring.append(fbSvg('circle', { r: 15, fill: 'none', stroke: '#2A2118', 'stroke-width': 3 })); svg.append(FB.ring);
    box.append(svg);
    FB.pop = el('div', { class: 'zf-fbpop', hidden: '' }); box.append(FB.pop);
    const ctl = el('div', { class: 'zf-fbctl' }, el('button', { type: 'button', 'aria-label': 'Zoom in', text: '+' }), el('button', { type: 'button', 'aria-label': 'Zoom out', text: '−' }));
    ctl.children[0].addEventListener('click', () => {
      if (FB.meXY) { const v = FB.vb, h = v.w * FB.ch / FB.cw, cx = v.x + v.w / 2, cy = v.y + h / 2; v.x += (FB.meXY[0] - cx) * 0.6; v.y += (FB.meXY[1] - cy) * 0.6; fbClamp(); }
      fbZoom(1.6, FB.cw / 2, FB.ch / 2);
    }); ctl.children[1].addEventListener('click', () => fbZoom(1 / 1.6, FB.cw / 2, FB.ch / 2));
    box.append(ctl, el('div', { class: 'zf-fbcred', text: 'Outlines: Natural Earth' }));
    box.addEventListener('wheel', (e) => { e.preventDefault(); const r = box.getBoundingClientRect(); fbZoom(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    box.addEventListener('pointerdown', (e) => { if (e.target.closest('.zf-fbctl,.zf-fbpop')) return; FB.drag = { x: e.clientX, y: e.clientY, vx: FB.vb.x, vy: FB.vb.y, moved: false, id: e.pointerId }; });
    box.addEventListener('pointermove', (e) => {
      const dr = FB.drag; if (!dr) return; const dx = e.clientX - dr.x, dy = e.clientY - dr.y;
      if (!dr.moved && Math.hypot(dx, dy) < 5) return; dr.moved = true; box.classList.add('is-drag');
      const k = FB.vb.w / FB.cw; FB.vb.x = dr.vx - dx * k; FB.vb.y = dr.vy - dy * k; fbClamp(); fbApply();
    });
    const end = (e) => { const dr = FB.drag; FB.drag = null; box.classList.remove('is-drag');
      if (dr && !dr.moved) { const g = e.target.closest && e.target.closest('[data-pi]'); if (g) setActive(g.dataset.pi, { popup: true, scroll: true }); else fbClosePop(); } };
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', () => { FB.drag = null; box.classList.remove('is-drag'); });
    new ResizeObserver(() => { if (!box.clientWidth) return; FB.cw = box.clientWidth; FB.ch = box.clientHeight || FB.ch; if (FB.vb) { fbClamp(); fbApply(); } }).observe(box);
    FB.vb = { x: 0, y: FB_Y0, w: 360 * FB_K }; fbClamp();
    return true;
  })();
  return FB.ready;
}
async function fbDraw(cands) {
  await fbInit(); fbClosePop(); FB.ringXY = null;
  const box = $('zf-map'); FB.cw = box.clientWidth || FB.cw; FB.ch = box.clientHeight || FB.ch;
  FB.gPins.textContent = ''; FB.pins = [];
  const style = { 3: ['#ffffff', '#6b6b6b', 4], 2: [GREEN, '#ffffff', 4.5], 1: [YELLOW, YELLOW_DARK, 7], 4: [TEAL, TEAL_DARK, 7], 0: [GREEN, GREEN_DARK, 7] };
  const order = { 3: 0, 2: 1, 1: 2, 4: 3, 0: 4 };
  cands.map((c) => ({ c, t: TIER_OF(c.rank) })).sort((a, b) => order[a.t] - order[b.t]).forEach(({ c, t }) => {
    const [fill, stroke, r] = style[t], g = fbSvg('g', { 'data-pi': c.pi, class: 'zf-fbpin' });
    if (t === 0 || t === 1 || t === 4) g.append(fbSvg('circle', { r: r + 2.5, fill: '#fff' }));
    g.append(fbSvg('circle', { r, fill, stroke, 'stroke-width': 1.5 }), fbSvg('circle', { r: Math.max(r + 5, 11), fill: 'transparent' }));
    const [x, y] = fbProject(c.p.lo, c.p.la); FB.pins.push({ g, x, y, t }); FB.gPins.append(g);
  });
  FB.meXY = S.origin ? fbProject(S.origin.lo, S.origin.la) : null;
  if (S.keep) { S.keep = false; fbApply(); } else fbFit(cands);
}
function fbFit(cands) {
  const prim = cands.filter((c) => c.rank <= 3); let use = prim.length ? prim : cands;
  if (S.cur && !S.origin && HOME_CC && use.some((c) => c.p.cc === HOME_CC)) use = use.filter((c) => c.p.cc === HOME_CC);
  if (S.origin) { fbFitBounds(nearBox(S.origin, cands), 28); return; }
  if (!S.cur && !S.origin) { fbFitBounds(START_VIEW, 10); return; }
  const pts = (S.origin ? use.slice(0, 8) : use).map((c) => [c.p.lo, c.p.la]); if (S.origin) pts.push([S.origin.lo, S.origin.la]);
  if (!pts.length) { fbFitBounds(START_VIEW, 10); return; }
  const lo = pts.map((p) => p[0]), la = pts.map((p) => p[1]);
  fbFitBounds([[Math.min(...lo) - 0.5, Math.min(...la) - 0.5], [Math.max(...lo) + 0.5, Math.max(...la) + 0.5]], 48);
}
async function fbActive(pi, opts) {
  await fbInit(); const c = lastCands.find((x) => x.pi === pi); if (!c) return;
  FB.ringXY = fbProject(c.p.lo, c.p.la);
  if (opts && opts.fly) { const deg = FB.cw / (512 * Math.pow(2, FLY_ZOOM)) * 360, w = deg * FB_K, [x, y] = FB.ringXY; FB.vb = { x: x - w / 2, y: y - w * FB.ch / FB.cw / 2, w }; fbClamp(); }
  fbClosePop();
  if (opts && opts.popup) { const pop = FB.pop; pop.textContent = ''; const x = el('button', { type: 'button', class: 'zf-fbx', 'aria-label': 'Close', text: '×' }); x.addEventListener('click', fbClosePop); pop.append(x, popupNode(c)); pop.hidden = false; FB.popFor = c; }
  fbApply();
}
async function drawMap(cands) {
  lastCands = cands;
  if (!map && S.view !== 'map' && !window.matchMedia('(min-width: 900px)').matches) { S.keep = false; return; }
  if (S.mapFailed) return;
  if (!fbWebglOk()) { try { await fbDraw(cands); } catch (e) { S.mapFailed = true; mapProblem(e && e.message); } return; }   // no WebGL (Safari with it off, some locked-down machines): plain SVG map
  try {
    // the start timer only runs while the tab is visible: a background tab does not paint, so its map cannot finish loading until the visitor switches to it
    const giveUp = new Promise((_, rej) => { const arm = () => setTimeout(() => { if (document.hidden) document.addEventListener('visibilitychange', arm, { once: true }); else rej(new Error('map took too long to start')); }, 25000); arm(); });
    await Promise.race([ensureMap(), giveUp]);
  } catch (e) { S.mapFailed = true; mapProblem(e && e.message); return; }
  const feats = cands.map((c) => ({ type: 'Feature', properties: { pi: c.pi, tier: TIER_OF(c.rank) }, geometry: { type: 'Point', coordinates: [c.p.lo, c.p.la] } }));
  map.getSource('pins').setData({ type: 'FeatureCollection', features: feats });
  map.getSource('me').setData({ type: 'FeatureCollection', features: S.origin ? [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [S.origin.lo, S.origin.la] } }] : [] });
  if (S.keep) S.keep = false; else fit(cands);
}
function fit(cands) {
  if (!map) return;
  const pts = [];
  const prim = cands.filter((c) => c.rank <= 3);
  let use = prim.length ? prim : cands;
  if (S.cur && !S.origin && HOME_CC && use.some((c) => c.p.cc === HOME_CC)) use = use.filter((c) => c.p.cc === HOME_CC);
  if (S.origin) { map.resize(); map.fitBounds(nearBox(S.origin, cands), { padding: 28, maxZoom: 13, duration: reducedMotion() ? 0 : 600 }); return; }   // all animals + a location: the whole world, with the pin showing where you are
  if (!S.cur && !S.origin) { map.resize(); map.fitBounds(START_VIEW, { padding: 10, duration: 0 }); return; }   // North America (or Europe / Oceania) to start; the visitor can pan out to the world
  (S.origin ? use.slice(0, 8) : use).forEach((c) => pts.push([c.p.lo, c.p.la]));
  if (S.origin) pts.push([S.origin.lo, S.origin.la]);
  if (!pts.length) { map.fitBounds(START_VIEW, { padding: 10, duration: 0 }); return; }
  const b = new mapLib.LngLatBounds(pts[0], pts[0]); pts.forEach((p) => b.extend(p));
  map.fitBounds(b, { padding: 48, maxZoom: 8, duration: reducedMotion() ? 0 : 600 });
}
function popupNode(c) {
  const p = c.p, href = p.u ? siteLink(p) : null;
  return el('div', {}, el('h4', { text: p.n }), el('p', { text: [p.ci, p.rg, countryName(p.cc)].filter(Boolean).join(', ') }),
    c.km !== null ? el('p', { text: fmtDist(c.km) + ' away' }) : null,
    p.ac === 'unverified' ? null : el('p', { text: p.ac === 'none' ? 'Not accredited' : p.ac === 'museum' ? 'Natural history museum' : p.ac.split(',').map((a) => ACCRED_TEXT[a] || a).join(' · ') }),
    (c.rank === 1 || c.rank === 3) ? el('span', { class: 'pp-unc', text: 'Unconfirmed' }) : null,
    c.rank === 5 ? el('p', { text: 'National park / reserve. Wildlife is never guaranteed.' }) : null,
    href ? el('p', {}, el('a', { href, target: '_blank', rel: 'noopener noreferrer', text: 'Visit website ↗', 'data-rank': c.rank, 'data-type': p.t })) : null);
}
async function setActive(pi, opts) {
  pi = Number(pi); S.active = pi;
  document.querySelectorAll('.zf-card.is-active').forEach((n) => n.classList.remove('is-active'));
  let cardEl = document.getElementById('zf-card-' + pi);
  if (!cardEl) { document.querySelectorAll('.zf-moreBtn').forEach((b) => b.click()); cardEl = document.getElementById('zf-card-' + pi); }
  if (cardEl) { cardEl.classList.add('is-active'); const det = cardEl.closest('details'); if (det && opts && opts.scroll) det.open = true; if (opts && opts.scroll && S.view === 'list') cardEl.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' }); }
  if (!fbWebglOk()) { if (S.mapFailed) return; await fbActive(pi, opts); return; }
  await ensureMap();
  map.setFilter('active', ['==', ['get', 'pi'], pi]);
  const c = lastCands.find((x) => x.pi === pi); if (!c) return;
  if (opts && opts.fly) map.easeTo({ center: [c.p.lo, c.p.la], zoom: STREET_FLY_ZOOM, duration: reducedMotion() ? 0 : 900 });
  if (popup) popup.remove();
  if (opts && opts.popup) popup = new mapLib.Popup({ offset: 12, closeButton: true, maxWidth: '280px' }).setLngLat([c.p.lo, c.p.la]).setDOMContent(popupNode(c)).addTo(map);
}
function setView(v) {
  S.view = v; $('zf-main').dataset.view = v;
  $('zf-tab-list').setAttribute('aria-pressed', String(v === 'list')); $('zf-tab-map').setAttribute('aria-pressed', String(v === 'map'));
  if (v === 'map') { drawMap(lastCands).then(() => map && map.resize()); }
}

// ---------- location ----------
const LOC_KEY = 'wa_zoo_loc_v1';   // the visitor's place, on this device only (localStorage); never sent anywhere
function loadSaved() {
  try { const o = JSON.parse(localStorage.getItem(LOC_KEY) || 'null'); return o && isFinite(o.la) && isFinite(o.lo) && o.label ? o : null; } catch (e) { return null; }
}
function saveOrigin(o) { try { localStorage.setItem(LOC_KEY, JSON.stringify({ la: Math.round(o.la * 100) / 100, lo: Math.round(o.lo * 100) / 100, label: o.label, method: o.method, fromGeo: !!o.fromGeo })); } catch (e) {} }
function forgetLocation() {
  try { localStorage.removeItem(LOC_KEY); } catch (e) {}
  S.origin = null; S.editing = false; $('zf-q').value = ''; $('zf-q').placeholder = 'City or postcode'; $('zf-forgetwrap').hidden = true; render();
}
function setOrigin(o) {
  saveOrigin(o); $('zf-forgetwrap').hidden = false;
  track('zoo_location_used', { method: o.method || 'geolocation' });
  S.origin = o; S.editing = false; $('zf-q').value = o.label === 'your location' ? '' : o.label; $('zf-q').placeholder = o.fromGeo ? 'Using your location' : 'City or postcode';
  closeSuggest(); render();
}
// no saved place: ask on arrival (our own dialog first, then the browser's). Skipped if the visitor said "Not now" this session or the browser has blocked location.
async function askOnArrival() {
  try { if (sessionStorage.getItem('wa_zoo_declined')) return; } catch (e) {}
  if (!('geolocation' in navigator)) return;
  let state = 'prompt';
  try { if (navigator.permissions && navigator.permissions.query) state = (await navigator.permissions.query({ name: 'geolocation' })).state; } catch (e) {}
  if (state === 'denied' || S.origin) return;
  if (state === 'granted') getLocation(); else useMyLocation();
}
function useMyLocation() {
  // ask first, in our own words, before the browser's own permission prompt
  const dlg = $('zf-geo');
  if (dlg && typeof dlg.showModal === 'function') {
    const share = dlg.querySelector('button[value=share]'), cancel = dlg.querySelector('button[value=cancel]');
    // act on the buttons directly (the dialog's close event is not reliable in every browser)
    const onShare = (e) => { e.preventDefault(); cancel.removeEventListener('click', onCancel); dlg.close('share'); getLocation(); };
    const onCancel = (e) => { e.preventDefault(); share.removeEventListener('click', onShare); try { sessionStorage.setItem('wa_zoo_declined', '1'); } catch (x) {} dlg.close('cancel'); };
    share.addEventListener('click', onShare, { once: true }); cancel.addEventListener('click', onCancel, { once: true });
    dlg.addEventListener('cancel', () => { try { sessionStorage.setItem('wa_zoo_declined', '1'); } catch (x) {} share.removeEventListener('click', onShare); cancel.removeEventListener('click', onCancel); }, { once: true });   // Esc
    dlg.showModal(); return;
  }
  getLocation();
}
async function nearestCity(la, lo) {
  try {
    await loadCities(); let best = null, bd = 1e9;
    for (const c of cities) { if (c.pop < 20000) continue; const d = haversineKm({ la, lo }, { la: c.la, lo: c.lo }); if (d < bd) { bd = d; best = c; } }
    return best && bd <= 120 ? best.n + (best.cc === 'US' && best.st ? ', ' + best.st : ', ' + countryName(best.cc)) : null;
  } catch (e) { return null; }
}
function getLocation() {
  const btn = $('zf-locate'), st = $('zf-status');
  if (!('geolocation' in navigator)) { st.textContent = 'Your browser can not share your location. Try typing a city or postcode.'; return; }
  btn.disabled = true; st.textContent = 'Finding you…';
  navigator.geolocation.getCurrentPosition(async (pos) => {
    btn.disabled = false;
    const near = await nearestCity(pos.coords.latitude, pos.coords.longitude);   // looked up locally; the coordinates never leave the browser
    setOrigin({ method: 'geolocation', la: pos.coords.latitude, lo: pos.coords.longitude, label: near ? 'Near ' + near : 'your location', fromGeo: true });
  }, (err) => {
    btn.disabled = false;
    // 1 = permission denied (blocked for this site, or the operating system's location service is off), 2 = position unavailable, 3 = timed out
    const fallback = ' You can type a city or postcode instead.';
    if (err && err.code === 1) {
      const say = (blocked) => { st.textContent = blocked ? 'Location is blocked for this site in your browser. Click the location icon at the right of the address bar (or the lock icon on the left) and choose Allow, then try again.' + fallback
        : 'Your browser or computer did not allow location for this page. On a Mac, check System Settings > Privacy & Security > Location Services > Chrome is on.' + fallback; };
      if (navigator.permissions && navigator.permissions.query) navigator.permissions.query({ name: 'geolocation' }).then((r) => say(r.state === 'denied'), () => say(false)); else say(false);
    } else st.textContent = err && err.code === 3 ? 'Finding you took too long. Try again, or type a city or postcode.' : 'We could not work out where you are.' + fallback;
  }, { maximumAge: 600000, timeout: 15000 });
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
const PLACE_PRI = { zoo: 0, aquarium: 0, safari_park: 0, sanctuary: 1, museum: 1, farm: 2, wild: 3 };
// places by name ("Point Defiance", "San Diego Zoo"), then by town ("Tacoma"); 3+ characters so short animal names stay quick
function placeMatches(q) {
  const nq = norm(q); if (nq.length < 3) return [];
  const words = nq.split(' '), out = [];
  S.places.forEach((p, pi) => {
    const name = p.nn; let s = -1;
    if (name === nq) s = 0; else if (name.startsWith(nq)) s = 1; else if (name.split(' ').some((w) => w.startsWith(nq))) s = 2;
    else if (words.every((w) => name.includes(w))) s = 3; else if (p.nc && p.nc.startsWith(nq)) s = 4;
    if (s >= 0) out.push([s, pi]);
  });
  const P = S.places;
  const pri = (p) => PLACE_PRI[p.t] ?? 2;   // zoos and aquariums before museums, farms and parks when the names match equally well
  return out.sort((x, y) => x[0] - y[0] || pri(P[x[1]]) - pri(P[y[1]]) || ((P[y[1]].cc === HOME_CC) - (P[x[1]].cc === HOME_CC)) || P[x[1]].n.localeCompare(P[y[1]].n))
    .slice(0, 8).map(([, pi]) => ({ place: true, pi, p: P[pi] }));
}
// one box searches both: animals first, then up to 3 places (or up to 8 places when no animal matches)
function searchMatches(q) {
  const a = animalMatches(q); if (!norm(q)) return a;
  const pl = placeMatches(q), nPl = a.length ? Math.min(pl.length, 3) : pl.length;
  return [...a.slice(0, 8 - nPl), ...pl.slice(0, nPl)];
}
function choose(item) { if (item.place) choosePlace(item.pi); else chooseAnimal(item.id); }
function closeAnimalList() { const ul = $('zf-animal-list'); ul.hidden = true; ul.textContent = ''; aList = []; aIdx = -1; $('zf-animal').setAttribute('aria-expanded', 'false'); $('zf-animal').removeAttribute('aria-activedescendant'); }
function showAnimalList(q) {
  aList = searchMatches(q); aIdx = -1; const ul = $('zf-animal-list'); ul.textContent = '';
  if (!aList.length) ul.append(el('li', { role: 'option', 'aria-disabled': 'true', text: q.trim() ? 'We can\u2019t find \u201c' + q.trim() + '\u201d yet. Press Enter to see animal places near you.' : 'Type an animal or a place, like lion, T. rex or San Diego Zoo.' }));
  aList.forEach((a, i) => {
    const li = a.place
      ? el('li', { role: 'option', id: 'zf-a' + i, class: 'is-place' }, el('span', { text: (TYPE_EMOJI[a.p.t] || '\u{1F4CD}') + ' ' + a.p.n }), el('small', { text: [TYPE_LABEL[a.p.t] || 'Place', [a.p.ci, a.p.rg || countryName(a.p.cc)].filter(Boolean).join(', ')].filter(Boolean).join(' \u00b7 ') }))
      : el('li', { role: 'option', id: 'zf-a' + i }, el('span', { text: a.n }), el('small', { text: (a.e + a.r === 0 && a.w ? 'In national parks & reserves' : (KIND_LABEL[a.k] || '')) + (a.e ? ' · ' + a.e + ' places' : a.w ? ' · ' + a.w + ' parks' : '') }));
    li.addEventListener('mousedown', (e) => { e.preventDefault(); choose(a); });
    ul.append(li);
  });
  ul.hidden = false; $('zf-animal').setAttribute('aria-expanded', 'true');
}
function moveAnimal(d) {
  if (!aList.length) return; aIdx = (aIdx + d + aList.length) % aList.length;
  [...$('zf-animal-list').children].forEach((li, i) => li.setAttribute('aria-selected', String(i === aIdx)));
  $('zf-animal').setAttribute('aria-activedescendant', 'zf-a' + aIdx);
}
function chooseAnimal(id) { closeAnimalList(); S.editing = false; S.unknown = ''; S.place = null; selectAnimal(id, 'picker'); if (!S.origin) $('zf-q').focus({ preventScroll: true }); }
// a place picked by name: show every place, put this one first, and fly the map to it.
// Privacy: like the visitor's location, the chosen place stays in this tab (no URL, no storage); analytics get the place type only.
async function choosePlace(pi) {
  closeAnimalList(); const p = S.places[pi];
  S.cur = null; S.unknown = ''; S.editing = false; S.place = pi;
  // make sure nothing hides it: any distance, its type switched on, every map-key tier shown
  S.maxKm = Infinity; S.distLabel = 'Any distance'; document.querySelectorAll('input[name="zf-dist"]').forEach((i) => (i.checked = i.value === '0'));
  S.types.add(typeKey(p.t)); const tc = $('zf-type-' + typeKey(p.t)); if (tc) tc.checked = true;
  S.hidden.clear(); document.querySelectorAll('.zf-key').forEach((b) => b.setAttribute('aria-pressed', 'true')); filterLabel();
  $('zf-animal').value = p.n; $('zf-animal-clear').hidden = false;
  document.title = DEFAULT_TITLE; history.replaceState(null, '', '/zoos/');
  track('zoo_place_selected', { place_type: p.t });
  if (window.matchMedia('(max-width: 899px)').matches) setView('map');
  S.keep = true; await render();
  setActive(pi, { fly: true, popup: true });
}
// an animal we have not indexed: say so plainly and show animal places anyway
function unknownAnimal(q) {
  closeAnimalList(); S.cur = null; S.unknown = q.slice(0, 40); S.editing = false;
  document.title = DEFAULT_TITLE; history.replaceState(null, '', '/zoos/');
  track('zoo_animal_not_found', { query: norm(q).replace(/[^a-z ]/g, '').slice(0, 30) });   // an animal name only; helps us decide what to add next
  render();
}
function clearAnimal() { S.unknown = ''; S.cur = null; S.place = null; S.editing = true; $('zf-animal').value = ''; $('zf-animal-clear').hidden = true; document.title = DEFAULT_TITLE; history.replaceState(null, '', '/zoos/'); render(); $('zf-animal').focus(); showAnimalList(''); }

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
    input.addEventListener('change', () => { S.maxKm = it.km; S.distLabel = it.v ? 'Within ' + it.label : 'Any distance'; track('zoo_distance_filter', { distance: it.v ? it.v + ' ' + unit : 'no limit' }); filterLabel(); render(); });
    box.append(el('label', { class: 'zf-chip', for: id }, input, el('span', { text: it.label })));
  });
}
let filterLabel = () => {};
function buildTypes() {
  const box = $('zf-typechips'); if (!box) return;
  const sum = $('zf-adv-sum');
  const label = filterLabel = () => { const bits = []; if (S.types.size < TYPE_GROUPS.length) bits.push(S.types.size + ' of ' + TYPE_GROUPS.length + ' types'); if (Number.isFinite(S.maxKm)) bits.push(S.distLabel.toLowerCase()); sum.textContent = 'More filters' + (bits.length ? ' (' + bits.join(', ') + ')' : ''); };
  TYPE_GROUPS.forEach(([k, name]) => {
    const id = 'zf-type-' + k, input = el('input', { type: 'checkbox', id, value: k, checked: true });
    input.addEventListener('change', () => {
      if (input.checked) S.types.add(k); else S.types.delete(k);
      if (!S.types.size) { S.types.add(k); input.checked = true; }   // never leave nothing selected
      label(); track('zoo_type_filter', { place_type: k, state: input.checked ? 'on' : 'off' }); render();
    });
    box.append(el('label', { class: 'zf-chip', for: id }, input, el('span', { text: name })));
  });
  label();
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
  buildTypes();
  $('zf-legend').append(...KEYS.map(([c, t, tier]) => {
    const b = el('button', { type: 'button', class: 'zf-key', 'aria-pressed': 'true', title: 'Click to hide or show' }, el('span', { class: 'zf-dot ' + c, 'aria-hidden': 'true' }), t);
    b.addEventListener('click', () => { const off = !S.hidden.has(tier); off ? S.hidden.add(tier) : S.hidden.delete(tier); b.setAttribute('aria-pressed', String(!off)); track('zoo_key_toggle', { tier: t, state: off ? 'hidden' : 'shown' }); S.keep = true; render(); });
    return el('li', {}, b);
  }),
    el('li', { id: 'zf-legend-me', hidden: true }, el('span', { class: 'zf-dot me', 'aria-hidden': 'true' }), 'You'));
  try {
    const [places, meta] = await Promise.all([loadJson(PLACES_URL), loadJson(ANIMALS_URL)]);
    S.places = places; S.groups = meta.groups;
    const gl = {}; Object.entries(meta.groups).forEach(([k, g]) => g.members.forEach((m) => (gl[m] = g.label)));
    S.animals = meta.animals.map((a) => Object.assign({}, a, { gl: gl[a.id] || '' })); S.animals.forEach((a) => { S.byId[a.id] = a; S.bySlug[slugOf(a.id)] = a; });
    S.places.forEach((p) => { p.nn = norm(p.n); p.nc = p.ci ? norm(p.ci) : ''; });   // normalised once for the place-name search
  } catch (e) { $('zf-status').textContent = 'Sorry, we could not load the places just now. Please try again in a moment.'; return; }
  if (window.matchMedia('(max-width: 640px)').matches) { $('zf-animal').placeholder = 'Animal, place'; }   // short, so both search boxes fit on one line
  renderQuick();
  const saved = loadSaved();
  if (saved) { S.origin = saved; $('zf-q').value = saved.label === 'your location' ? '' : saved.label; $('zf-q').placeholder = saved.fromGeo ? 'Using your location' : 'City or postcode'; $('zf-forgetwrap').hidden = false; }
  $('zf-forget').addEventListener('click', forgetLocation);
  // "Don't see your place?" form: stored for review by a person (functions/api/suggest-place.js); the animal field starts as the animal being viewed
  const sdlg = $('zf-suggest-dialog'), sform = $('zf-suggest-form'), smsg = $('zf-suggest-msg');
  $('zf-suggest-open').addEventListener('click', () => {
    smsg.textContent = ''; smsg.className = 'zf-suggest-msg'; $('zf-suggest-send').disabled = false;
    $('zf-suggest-animal').value = S.cur ? S.cur.name : '';
    if (typeof sdlg.showModal === 'function') sdlg.showModal(); else sdlg.setAttribute('open', '');
    sform.elements.establishment.focus();
  });
  $('zf-suggest-close').addEventListener('click', () => sdlg.close());
  sform.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = sform.elements, body = { establishment: f.establishment.value, animal: f.animal.value, address: f.address.value, website: f.website.value, email: f.email.value, company: f.company.value, page: location.pathname };
    const bad = (m) => { smsg.textContent = m; smsg.className = 'zf-suggest-msg err'; };
    if (!body.establishment.trim()) return bad('Please add the name of the place.');
    if (!body.address.trim()) return bad('Please add the address.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email.trim())) return bad('Please add a valid contact email.');
    $('zf-suggest-send').disabled = true; smsg.textContent = 'Sending…'; smsg.className = 'zf-suggest-msg';
    try {
      const r = await fetch('/api/suggest-place', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { track('zoo_suggest_submit', { has_animal: body.animal.trim() ? 'yes' : 'no' }); sform.reset(); smsg.textContent = 'Thank you! We will check it and add it to the map.'; smsg.className = 'zf-suggest-msg ok'; }
      else { $('zf-suggest-send').disabled = false; bad(j.error || 'Sorry, that did not go through. Please email info@wildatlasapp.com.'); }
    } catch (x) { $('zf-suggest-send').disabled = false; bad('Sorry, that did not go through. Please email info@wildatlasapp.com.'); }
  });
  $('zf-adv-sum').addEventListener('click', () => { const open = $('zf-advbody').hidden; $('zf-advbody').hidden = !open; $('zf-adv-sum').setAttribute('aria-expanded', String(open)); });
  // "Larger map": the map takes most of the width and the list shrinks to compact rows; remembered on this device
  const setSize = (big, save) => {
    $('zf-main').dataset.size = big ? 'large' : 'normal'; $('zf-size').setAttribute('aria-pressed', String(big)); $('zf-size').textContent = big ? 'Smaller map' : 'Larger map';
    if (save) { try { localStorage.setItem('wa_zoo_size', big ? 'large' : 'normal'); } catch (e) {} track('zoo_map_size', { state: big ? 'large' : 'normal' }); }
    setTimeout(() => { if (map) { map.resize(); if (lastCands.length) fit(lastCands); } else if (FB.svg) { FB.cw = $('zf-map').clientWidth; FB.ch = $('zf-map').clientHeight; fbClamp(); fbApply(); } }, 60);
  };
  $('zf-size').addEventListener('click', () => setSize($('zf-main').dataset.size !== 'large', true));
  let pref = ''; try { pref = localStorage.getItem('wa_zoo_size') || ''; } catch (e) {}
  if (pref === 'normal') setSize(false, false);   // the larger map is the default; only an explicit "Smaller map" is remembered
  const input = $('zf-animal');
  input.addEventListener('focus', () => showAnimalList(input.value === (S.cur && S.cur.name) || (S.place !== null && S.place !== undefined && input.value === S.places[S.place].n) ? '' : input.value));
  input.addEventListener('input', () => { $('zf-animal-clear').hidden = !input.value; if (S.unknown) S.unknown = ''; showAnimalList(input.value); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if ($('zf-animal-list').hidden) showAnimalList(input.value); moveAnimal(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveAnimal(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); const a = aList[aIdx >= 0 ? aIdx : 0]; if (a) choose(a); else if (input.value.trim()) unknownAnimal(input.value.trim()); }
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
    if (e.target.id === 'zf-resetf') { S.types = new Set(TYPE_GROUPS.map((g) => g[0])); S.hidden.clear(); document.querySelectorAll('#zf-typechips input').forEach((i) => (i.checked = true)); document.querySelectorAll('.zf-key').forEach((b) => b.setAttribute('aria-pressed', 'true')); S.maxKm = Infinity; S.distLabel = 'Any distance'; document.querySelectorAll('input[name="zf-dist"]').forEach((i) => (i.checked = i.value === '0')); filterLabel(); render(); return; }
    if (e.target.id === 'zf-widen') { S.maxKm = Infinity; S.distLabel = 'Any distance'; document.querySelectorAll('input[name="zf-dist"]').forEach((i) => (i.checked = i.value === '0')); filterLabel(); render(); }
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
  // phones open on the map (the list is one tap away); desktop shows both side by side
  const narrow = window.matchMedia('(max-width: 899px)').matches;
  S.view = narrow ? 'map' : 'list'; $('zf-main').dataset.view = S.view;
  $('zf-tab-list').setAttribute('aria-pressed', String(!narrow)); $('zf-tab-map').setAttribute('aria-pressed', String(narrow));
  // which animal? a landing page (/zoos/<animal>/) sets data-animal; the old /zoos/?animal=<id> links redirect to the landing page
  const root = $('zf'), legacy = new URLSearchParams(location.search).get('animal');
  const fromPath = root.dataset.animal, fromLegacy = legacy && (ALIASES[legacy] || legacy.replace(/-/g, '_'));
  if (!fromPath && fromLegacy && S.byId[fromLegacy]) { location.replace('/zoos/' + slugOf(fromLegacy) + '/'); return; }
  if (fromPath && S.byId[fromPath]) { await selectAnimal(fromPath, 'landing'); const seo = $('zf-seo-list'); if (seo) seo.remove(); } else render();
  if (!saved) setTimeout(askOnArrival, 600);
}
init();
