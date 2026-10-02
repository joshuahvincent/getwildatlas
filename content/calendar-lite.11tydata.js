// Page data for calendar animal pages, derived from the app export.
const IUCN = { EX: "Extinct", EW: "Extinct in the Wild", CR: "Critically Endangered", EN: "Endangered",
  VU: "Vulnerable", NT: "Near Threatened", LC: "Least Concern", DD: "Data Deficient", NE: "Not Evaluated" };
// Keep proper nouns capitalised in running text ("African elephant", "Pallas's cat").
const PROPER = new Set(["african", "american", "amur", "arctic", "asian", "asiatic", "bengal", "bornean", "sumatran",
  "pacific", "atlantic", "galapagos", "pallas's", "malayan", "iberian", "scottish", "siberian", "komodo", "nile",
  "florida", "west", "indian", "emperor", "king", "bald", "grizzly", "humboldt", "andean", "tasmanian", "australian", "japanese"]);
const proper = new Set(["african", "american", "amur", "arctic", "asian", "asiatic", "bengal", "bornean", "sumatran",
  "pacific", "atlantic", "galapagos", "pallas's", "malayan", "iberian", "scottish", "siberian", "komodo", "nile",
  "florida", "indian", "humboldt", "andean", "tasmanian", "australian", "japanese"]);
const runningName = (name) => name.split(" ").map((w) => (proper.has(w.toLowerCase()) ? w : w.toLowerCase())).join(" ");
const fmtDate = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

module.exports = {
  eleventyComputed: {
    title: (d) => d.lite && `${d.lite.animal.name} Facts for Kids`,
    excerpt: (d) => d.lite && (d.lite.animal.text["summary.young"] || ""),
    author: "Wild Atlas",
    coverImage: (d) => d.lite && d.lite.animal.images && d.lite.animal.images.cover,
    postDate: (d) => d.lite && new Date(d.lite.days[0].date + "T00:00:00Z"),
    animalDay: (d) => {
      if (!d.lite) return {};
      const l = d.lite, a = l.animal, name = runningName(a.name);
      const status = "iucnText" in a ? a.iucnText : IUCN[a.iucn];
      const official = l.days.filter((x) => x.official);
      return {
        dayName: official.length ? official[0].day : "Wild Atlas Spotlight",
        animalName: name,
        animalArticle: /^[aeiou]/i.test(name) ? "an" : "a",
        campaign: `animal_${l.appId}`,
        greeting: official.length
          ? `**Meet the ${name}!** People around the world celebrate the ${name} on ${official.map((x) => `${x.day} (${fmtDate(x.date)})`).join(", ")}.`
          : `**Meet the ${name}!** It's one of our Wild Atlas Spotlights for the calendar.`,
        celebratedOn: l.days.map((x) => ({ day: x.official ? x.day : "Wild Atlas Spotlight", date: fmtDate(x.date), origin: x.origin, sourceUrl: x.sourceUrl })),
        readAloudNote: "Read this one out loud together — these facts come straight from the Wild Atlas app.",
        grownups: status
          ? `The ${name} is listed as **${status}** by the IUCN.${a.habitat ? ` Where it lives: ${a.habitat}.` : ""}`
          : (a.habitat ? `Where it lives: ${a.habitat}.` : ""),
        appCta: `The ${name} is in Wild Atlas's ${a.packName} pack, with narrated facts, its sounds, and more to explore.`,
        appLinkText: `Meet the ${name} in Wild Atlas`,
      };
    },
  },
};
