// Calendar "lite" pages: every calendar day whose animal is in a visible
// Wild Atlas pack (appId) but has no full article (content/calendar/<slug>.md).
// Built from the app's own copy + images (_data/appAnimals.json, exported by
// scripts/export_app_animals.py). Rendered by content/calendar-lite.njk.
const fs = require("fs");
const path = require("path");

const slugify = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

module.exports = () => {
  const root = path.join(__dirname, "..");
  const days = JSON.parse(fs.readFileSync(path.join(__dirname, "animalDays.json"), "utf8"));
  const app = JSON.parse(fs.readFileSync(path.join(__dirname, "appAnimals.json"), "utf8")).animals;
  const full = new Set(fs.readdirSync(path.join(root, "content/calendar")).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")));
  const entries = [
    ...days.days.map((d) => ({ ...d, tier: "primary" })),
    ...(days.alsoCelebrated || []).map((d) => ({ ...d, tier: "also", official: true })),
  ];
  return entries
    .filter((d) => d.appId && app[d.appId] && !(d.slug && full.has(d.slug)))
    .map((d) => {
      const dayName = d.official === false ? `${app[d.appId].name}` : d.day;
      return {
        ...d,
        dayName,
        slug: d.slug && !full.has(d.slug) ? d.slug : `${slugify(d.official === false ? d.animal + " facts for kids" : d.day)}`,
        animal: app[d.appId],
      };
    });
};
