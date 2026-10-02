// Build-time coordinates for places shown on a places map (js/places-map.js).
// General purpose: give it any list of {title, place, url} and it returns pins.
//
// Coordinates come from the zoo finder's own data (no geocoding service):
//   1. the place's website domain or name, matched against assets/zoos/places.json
//   2. otherwise its town, matched against assets/zoos/geo/cities.json
//   3. a few hand-placed spots in _data/placeCoords.json (checked first)
// Places that can't be placed stay in the list without a pin.
// Pin tiers are the places map's: lists | unconfirmed | relative | similar | wild.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const places = JSON.parse(fs.readFileSync(path.join(root, "assets/zoos/places.json"), "utf8"));
const cities = JSON.parse(fs.readFileSync(path.join(root, "assets/zoos/geo/cities.json"), "utf8"));
const curated = JSON.parse(fs.readFileSync(path.join(root, "_data/placeCoords.json"), "utf8"));

// Shared hosts that serve many unrelated sites, so a domain match means nothing.
const GENERIC = new Set(["fws.gov", "nps.gov", "noaa.gov", "gov.scot", "gob.mx", "com.br", "org.uk", "co.uk", "com.au", "gov.au", "wolf.org", "klax-tv.com", "newsonjapan.com"]);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const domainOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, "").split(".").slice(-2).join("."); } catch { return ""; } };

const byDomain = new Map();
for (const p of places) { const d = domainOf(p.u); if (!d) continue; if (!byDomain.has(d)) byDomain.set(d, []); byDomain.get(d).push(p); }
const byName = new Map(places.map((p) => [norm(p.n), p]));
// Same-named towns (Portage, Alexandria, Brighton…) are told apart by the state/country named in the text.
const cityIndex = new Map();
for (const c of cities) { const k = norm(c[0]); if (!cityIndex.has(k)) cityIndex.set(k, []); cityIndex.get(k).push(c); }
const US_STATES = { alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA", colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV", newhampshire: "NH", newjersey: "NJ", newmexico: "NM", newyork: "NY", northcarolina: "NC", northdakota: "ND", ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA", rhodeisland: "RI", southcarolina: "SC", southdakota: "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT", virginia: "VA", washington: "WA", westvirginia: "WV", wisconsin: "WI", wyoming: "WY" };
const COUNTRIES = { usa: "US", unitedstates: "US", canada: "CA", alberta: "CA", britishcolumbia: "CA", ontario: "CA", quebec: "CA", nunavut: "CA", australia: "AU", tasmania: "AU", queensland: "AU", newsouthwales: "AU", victoria: "AU", westernaustralia: "AU", england: "GB", scotland: "GB", wales: "GB", unitedkingdom: "GB", ireland: "IE", japan: "JP", germany: "DE", france: "FR", spain: "ES", belgium: "BE", czechia: "CZ", netherlands: "NL", denmark: "DK", norway: "NO", iceland: "IS", mexico: "MX", brazil: "BR", kenya: "KE", namibia: "NA", southafrica: "ZA", singapore: "SG", taiwan: "TW", thailand: "TH", newzealand: "NZ", democraticrepublicofthecongo: "CD", egypt: "EG" };
function pickCity(townName, hintText) {
  const opts = cityIndex.get(norm(townName));
  if (!opts) return null;
  const parts = hintText.split(/[,—()]/).map(norm).filter(Boolean);
  let state = null, cc = null;
  for (const h of parts) { if (US_STATES[h]) { state = US_STATES[h]; cc = "US"; } else if (COUNTRIES[h]) cc = COUNTRIES[h]; }
  const ok = opts.filter((c) => (!cc || c[2] === cc) && (!state || c[6] === state));
  if (cc && !ok.length) return null;   // named a country/state we can't find the town in: leave unplaced rather than guess
  return (ok.length ? ok : opts).reduce((a, b) => (b[5] > a[5] ? b : a));
}

function splitPlace(s) {
  // "Zoo Name — City, Region" | "City, Region" | "near City, Country"
  const [a, b] = String(s || "").split(/\s+—\s+/);
  return b ? { name: a, town: b } : { name: "", town: a };
}

function resolve(entry) {
  const fixed = curated[entry.place];
  if (Array.isArray(fixed)) return { la: fixed[0], lo: fixed[1], via: "curated" };
  const { name, town } = splitPlace(entry.place);
  const d = domainOf(entry.url);
  const cands = d && !GENERIC.has(d) ? byDomain.get(d) || [] : [];
  if (cands.length === 1) return { la: cands[0].la, lo: cands[0].lo, via: "place" };
  if (cands.length > 1) {
    const hit = cands.find((p) => norm(p.n) === norm(name)) || cands.find((p) => name && (norm(p.n).includes(norm(name)) || norm(name).includes(norm(p.n))));
    if (hit) return { la: hit.la, lo: hit.lo, via: "place" };
  }
  if (name && byName.has(norm(name))) { const p = byName.get(norm(name)); return { la: p.la, lo: p.lo, via: "place" }; }
  const townName = town.replace(/^near\s+/i, "").split(",")[0].replace(/\(.*?\)/g, "").trim();
  const c = pickCity(townName, String(entry.place || ""));
  if (c) return { la: c[3], lo: c[4], via: "town" };
  return null;
}

// Stable key linking a pin to its card on the page (data-pin-key="{{ (title + '|' + place) | pinKey }}").
const pinKey = (s) => norm(s).slice(0, 80);

// Any list of {title, place, url, tier?, linkText?} -> map pins (unplaceable entries are skipped).
function placePins(list, defaultTier = "lists") {
  const pins = [];
  for (const p of list || []) {
    const r = resolve(p);
    if (r) pins.push({ la: r.la, lo: r.lo, tier: p.tier || defaultTier, title: p.title, sub: p.place || "", url: p.url, linkText: p.linkText, key: pinKey((p.title || "") + "|" + (p.place || "")) });
  }
  return pins;
}

// Calendar "Where to see" section -> pins: listed places + the close-relative "cousin".
function whereToSeePins(w) {
  if (!w) return [];
  // Places marked `wild: true` (whale-watch waters, refuges, national parks) get the teal in-the-wild pin.
  const places = (w.groups || []).flatMap((g) => g.places || []).map((p) => ({ ...p, tier: p.wild ? "wild" : "lists" }));
  if (w.cousin) places.push({ title: w.cousin.title, place: w.cousin.place || w.cousin.title, url: w.cousin.url, tier: "relative" });
  return placePins(places);
}

module.exports = { resolve, placePins, whereToSeePins, pinKey };
