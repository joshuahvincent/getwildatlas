// Calendar animal pages ("lite"): one page per Wild Atlas app animal that has
// at least one day on the calendar but no full article. Built from the app's
// own copy + images (_data/appAnimals.json, from scripts/export_app_animals.py)
// and every calendar day that celebrates that animal. Rendered by
// content/calendar-lite.njk at /calendar/<animal-slug>/.
const fs = require("fs");
const path = require("path");

const slugify = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// appIds that already have a live full article in content/calendar/.
function fullArticleAppIds(root, days) {
  const dir = path.join(root, "content/calendar");
  const ids = new Map();
  for (const d of days) {
    if (!d.slug || !d.appId) continue;
    const f = path.join(dir, `${d.slug}.md`);
    if (!fs.existsSync(f)) continue;
    if (/^status:\s*draft\s*$/m.test(fs.readFileSync(f, "utf8")) && !process.env.SHOW_HIDDEN_POSTS) continue;
    if (!ids.has(d.appId)) ids.set(d.appId, `/calendar/${d.slug}/`);
  }
  return ids;
}

module.exports = () => {
  const root = path.join(__dirname, "..");
  const cal = JSON.parse(fs.readFileSync(path.join(__dirname, "animalDays.json"), "utf8"));
  const app = JSON.parse(fs.readFileSync(path.join(__dirname, "appAnimals.json"), "utf8")).animals;
  const origins = JSON.parse(fs.readFileSync(path.join(__dirname, "dayOrigins.json"), "utf8"));
  const full = fullArticleAppIds(root, cal.days);
  // Website-only corrections to app copy (and day origins), by exact find/replace.
  const overrides = JSON.parse(fs.readFileSync(path.join(__dirname, "appCopyOverrides.json"), "utf8")).overrides || [];
  const fix = (appId, s) => overrides.filter((o) => o.appId === appId).reduce((acc, o) => (typeof acc === "string" ? acc.split(o.find).join(o.replace) : acc), s);
  for (const [id, a] of Object.entries(app)) {
    for (const [k, v] of Object.entries(a.text || {})) {
      a.text[k] = Array.isArray(v) ? v.map((x) => fix(id, x)).filter((x) => x && x.trim()) : fix(id, v);
    }
    if (a.habitat) a.habitat = fix(id, a.habitat);
  }
  const iucnText = JSON.parse(fs.readFileSync(path.join(__dirname, "appCopyOverrides.json"), "utf8")).iucnText || {};
  for (const [id, a] of Object.entries(app)) {
    if (id in iucnText) a.iucnText = iucnText[id]; // null = no status (e.g. domestic animals)
  }
  const byAnimal = new Map();
  const add = (d, official) => {
    if (!d.appId || !app[d.appId] || full.has(d.appId)) return;
    if (!byAnimal.has(d.appId)) byAnimal.set(d.appId, []);
    const o = (d.slug && origins[d.slug]) || {};
    byAnimal.get(d.appId).push({ day: d.day, date: d.date, official,
      origin: fix(d.appId, d.origin || o.text || ""), sourceUrl: d.sourceUrl || o.sourceUrl || "" });
  };
  cal.days.forEach((d) => add(d, d.official !== false));
  (cal.alsoCelebrated || []).forEach((d) => add(d, true));
  return [...byAnimal.entries()].map(([appId, days]) => {
    days.sort((a, b) => (a.date.slice(5) < b.date.slice(5) ? -1 : 1));
    return { appId, slug: slugify(app[appId].name), animal: app[appId], days };
  });
};
module.exports.fullArticleAppIds = fullArticleAppIds;
