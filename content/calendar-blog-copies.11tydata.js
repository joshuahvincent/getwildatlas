// Pull the blog copy's page data from its calendar entry (objects intact).
const from = (key) => (data) => data.entry && data.entry.data[key];
module.exports = {
  eleventyComputed: {
    title: from("title"),
    excerpt: from("excerpt"),
    author: from("author"),
    coverImage: from("coverImage"),
    animalDay: from("animalDay"),
    postDate: (data) => data.entry && data.entry.date,
    canonicalUrl: (data) => data.entry && `https://wildatlasapp.com${data.entry.url}`,
  },
};
