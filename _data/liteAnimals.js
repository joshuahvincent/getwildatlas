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
  const byAnimal = new Map();
  const add = (d, official) => {
    if (!d.appId || !app[d.appId] || full.has(d.appId)) return;
    if (!byAnimal.has(d.appId)) byAnimal.set(d.appId, []);
    const o = (d.slug && origins[d.slug]) || {};
    byAnimal.get(d.appId).push({ day: d.day, date: d.date, official,
      origin: d.origin || o.text || "", sourceUrl: d.sourceUrl || o.sourceUrl || "" });
  };
  cal.days.forEach((d) => add(d, d.official !== false));
  (cal.alsoCelebrated || []).forEach((d) => add(d, true));
  return [...byAnimal.entries()].map(([appId, days]) => {
    days.sort((a, b) => (a.date.slice(5) < b.date.slice(5) ? -1 : 1));
    return { appId, slug: slugify(app[appId].name), animal: app[appId], days };
  });
};
module.exports.fullArticleAppIds = fullArticleAppIds;
