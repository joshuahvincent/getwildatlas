// Scheduled + draft posts for content/blog/.
//
// A post is HIDDEN from the build (no page, not in /blog/ listing) when:
//   - `status: draft` is set in its front-matter, or
//   - its `date` is in the future at build time.
// Hidden posts become visible automatically on the first build on/after their
// date. The deploy workflow runs a scheduled daily build (see
// .github/workflows/deploy.yml), so a post dated 2027-02-15 goes live on the
// morning of Feb 15 with no manual step.
//
// Local preview of hidden posts:  SHOW_HIDDEN_POSTS=1 npm run dev

function isHidden(data) {
  if (process.env.SHOW_HIDDEN_POSTS) return false;
  if (data.status === "draft") return true;
  const date = data.page && data.page.date;
  return Boolean(date && new Date(date).getTime() > Date.now());
}

module.exports = {
  eleventyComputed: {
    permalink: (data) => (isHidden(data) ? false : data.permalink),
    eleventyExcludeFromCollections: (data) =>
      isHidden(data) ? true : Boolean(data.eleventyExcludeFromCollections),
  },
};
