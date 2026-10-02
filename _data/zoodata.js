// Build-time data for the /zoos/ landing pages (SEO). Reads the same static JSON the page uses (assets/zoos/), so the pre-rendered HTML always matches the app.
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, "assets", "zoos", p), "utf8"));
const SITE = "https://wildatlasapp.com";
const regionName = (() => { try { const d = new Intl.DisplayNames(["en"], { type: "region" }); return (c) => d.of(c) || c; } catch (e) { return (c) => c; } })();
const an = (n) => (/^[aeiou]/i.test(n) ? "an" : "a");
const LD_TYPE = { zoo: "Zoo", aquarium: "Aquarium", safari_park: "Zoo", museum: "Museum", farm: "TouristAttraction", sanctuary: "TouristAttraction" };
const TIER_PLACES = 14;

module.exports = () => {
  const places = read("places.json"), meta = read("animals.json");
  const slugOf = (id) => id.replace(/_/g, "-");
  const where = (p) => [p.ci, p.rg, regionName(p.cc)].filter(Boolean).join(", ");
  const animals = meta.animals.map((m) => {
    const d = read("a/" + m.id + ".json");
    const strong = d.e.filter((x) => x[1] === 0).map((x) => places[x[0]]);
    const pool = (strong.length ? strong : d.e.map((x) => places[x[0]])).filter((p) => p.ph).concat(strong.filter((p) => !p.ph));
    const seen = new Set(), top = [];
    for (const p of pool) { if (!seen.has(p.id) && top.length < TIER_PLACES) { seen.add(p.id); top.push({ n: p.n, where: where(p) }); } }
    const total = d.e.length + d.r.length;
    const article = an(m.n);
    // prose uses a lowercase common name ("a hippopotamus", "an African elephant"); dinosaur names keep their scientific capitalisation
    const nm = m.k === "dino" ? m.n : m.n.toLowerCase().replace(/\b(african|asian|arctic|atlantic|american|burmese|komodo|gila|tasmanian|siberian)\b/g, (x) => x[0].toUpperCase() + x.slice(1));
    let title, desc, summary;
    if (m.k === "dino") {
      title = `Where to See ${article} ${m.n} Fossil Near You`;
      desc = `Find natural-history museums near you with ${article} ${nm} fossil or cast on display. ${total ? total + " places on a map" : "Places on a map"} with photos and distance. Check before you go.`;
      summary = `Museums with ${article} ${nm} on display, as a real fossil or a cast${d.r.length ? ", plus museums with a close relative" : ""}. Check with the museum before you go.`;
    } else if (m.k === "farm") {
      title = `Where to Meet ${article} ${m.n} Near You: Farms & Petting Zoos`;
      desc = `Find farms and petting zoos near you where kids can meet ${article} ${nm}. See them on a map with photos and distance. Animals vary, so check before you visit.`;
      summary = `Farms and petting zoos where your family may be able to meet ${article} ${nm}. The animals at each farm vary, so check before you visit.`;
    } else {
      title = `Where to See ${article} ${m.n} Near You`;
      desc = `Find zoos and aquariums near you where your family can see ${article} ${nm}. ${total ? total + " places on a map" : "Places on a map"} with photos and distance. Check before you visit.`;
      summary = `Zoos, aquariums and parks that list ${article} ${nm}${d.r.length ? ", plus places with a close relative" : ""}. Animals move around, so check with the place before you visit.`;
    }
    if (desc.length > 158) desc = desc.slice(0, 155).replace(/\s+\S*$/, "") + "…";
    const url = `${SITE}/zoos/${slugOf(m.id)}/`;
    const ld = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Wild Atlas", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: "Where to see real animals", item: SITE + "/zoos/" },
          { "@type": "ListItem", position: 3, name: m.n, item: url } ] },
        { "@type": "ItemList", name: `Places to see ${article} ${nm}`, url,
          itemListElement: top.map((t, i) => { const p = pool.find((x) => x.n === t.n) || {}; return { "@type": "ListItem", position: i + 1, item: Object.assign({ "@type": LD_TYPE[p.t] || "TouristAttraction", name: t.n, address: { "@type": "PostalAddress", addressLocality: p.ci || undefined, addressRegion: p.rg || undefined, addressCountry: p.cc || undefined } }, p.la ? { geo: { "@type": "GeoCoordinates", latitude: p.la, longitude: p.lo } } : {}, p.u ? { url: p.u } : {}) }; }) },
      ],
    };
    return { id: m.id, slug: slugOf(m.id), name: nm, title0: m.n, kind: m.k, pack: m.pack, article, title, description: desc, summary, top, total: d.e.length + d.r.length + d.g.length, hasData: total > 0, jsonld: JSON.stringify(ld), groupKey: d.group ? d.group.key : null, related: [] };
  });
  // internal links: other animals in the same curated group (max 8), else popular animals of the same kind
  const byGroup = {};
  animals.forEach((a) => { if (a.groupKey) (byGroup[a.groupKey] = byGroup[a.groupKey] || []).push(a); });
  animals.forEach((a) => {
    const sib = (a.groupKey ? byGroup[a.groupKey] : []).filter((x) => x.id !== a.id).slice(0, 8);
    a.related = (sib.length ? sib : animals.filter((x) => x.kind === a.kind && x.id !== a.id && x.hasData).slice(0, 8)).map((x) => ({ slug: x.slug, name: x.name }));
  });
  const kinds = [["wild", "Wild animals"], ["dino", "Dinosaurs"], ["farm", "Farm animals"]];
  const directory = kinds.map(([k, label]) => ({ label, animals: animals.filter((a) => a.kind === k).sort((x, y) => x.name.localeCompare(y.name)).map((a) => ({ slug: a.slug, name: a.name })) }));
  return { generated: meta.generated, animals, directory };
};
