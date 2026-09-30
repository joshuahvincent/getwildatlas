// Scheduled + draft posts for content/blog/.
//
// Front-matter `status`:
//   (none)     legacy/published post — visible (subject to date)
//   draft      never built
//   scheduled  written + advisor-gated, awaiting Josh's approval — never built
//   approved   Josh approved — goes live on its `date`
//
// Any post dated in the future is also hidden. The deploy workflow runs a
// daily scheduled build (.github/workflows/deploy.yml), so an approved post
// dated 2027-02-15 goes live the morning of Feb 15 with no manual step.
// The review loop (.github/workflows/blog-review.yml) emails Josh five days
// ahead; commenting "approve" flips `scheduled` → `approved`.
//
// Show hidden posts (local dev + the preview deploy): SHOW_HIDDEN_POSTS=1

const HIDDEN_STATUSES = new Set(["draft", "scheduled"]);

function isHidden(data) {
  if (process.env.SHOW_HIDDEN_POSTS) return false;
  if (HIDDEN_STATUSES.has(data.status)) return true;
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
