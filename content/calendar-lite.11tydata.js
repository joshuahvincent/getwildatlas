// Page data for lite calendar pages, derived from the app export.
const IUCN = { EX: "Extinct", EW: "Extinct in the Wild", CR: "Critically Endangered", EN: "Endangered",
  VU: "Vulnerable", NT: "Near Threatened", LC: "Least Concern", DD: "Data Deficient", NE: "Not Evaluated" };
const lower = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
module.exports = {
  eleventyComputed: {
    title: (d) => d.lite && (d.lite.official === false
      ? `${d.lite.animal.name} Facts for Kids`
      : `${d.lite.dayName}: ${d.lite.animal.name} Facts for Kids`),
    excerpt: (d) => d.lite && (d.lite.animal.text["summary.young"] || ""),
    author: "Wild Atlas",
    coverImage: (d) => d.lite && d.lite.animal.images && d.lite.animal.images.cover,
    postDate: (d) => d.lite && new Date(d.lite.date + "T00:00:00Z"),
    originSlug: (d) => d.lite && d.lite.slug,
    animalDay: (d) => {
      if (!d.lite) return {};
      const l = d.lite, a = l.animal, name = lower(a.name);
      const status = IUCN[a.iucn];
      return {
        dayName: l.dayName,
        animalName: name,
        animalArticle: /^[aeiou]/i.test(name) ? "an" : "a",
        campaign: `${l.slug.replace(/-/g, "_")}`,
        greeting: l.official === false
          ? `This week's Wild Atlas pick is the **${name}**.`
          : `**Happy ${l.dayName}!** Today we're celebrating the ${name}.`,
        readAloudNote: "Read this one out loud together — these facts come straight from the Wild Atlas app.",
        grownups: status
          ? `The ${name} is listed as **${status}** by the IUCN.${a.habitat ? ` It lives in: ${lower(a.habitat)}.` : ""}`
          : (a.habitat ? `The ${name} lives in: ${lower(a.habitat)}.` : ""),
        appCta: `The ${name} is in Wild Atlas's ${a.packName} pack, with narrated facts, its sounds, and more to explore.`,
        appLinkText: `Meet the ${name} in Wild Atlas`,
      };
    },
  },
};
