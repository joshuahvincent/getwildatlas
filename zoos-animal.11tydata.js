// Per-animal page fields come straight from _data/zoodata.js (no template escaping, so the JSON-LD stays valid JSON).
module.exports = {
  eleventyComputed: {
    title: (data) => data.a.title,
    excerpt: (data) => data.a.description,
    jsonld: (data) => data.a.jsonld,
  },
};
