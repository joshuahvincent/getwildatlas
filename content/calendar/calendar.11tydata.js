// Conservation calendar leaf pages: content/calendar/<slug>.md → /calendar/<slug>/
//
// Front-matter:
//   status: draft          hidden (advisor gates not passed yet)
//   (no status)            LIVE — Josh's standing decision (2026-09-30): calendar
//                          pages publish as soon as the naturalist + child-psych
//                          gates pass, no per-page approval.
//
// SHOW_HIDDEN_POSTS=1 shows drafts (local dev + preview deploy).

module.exports = {
  layout: "layouts/animal-day.njk",
  tags: ["calendarPage"],
  backLink: { url: "/calendar/", label: "World Wildlife Calendar" },
  eleventyComputed: {
    // Share cards show the page's cover instead of the generic site image.
    ogImage: (data) => data.coverImage ? `https://wildatlasapp.com${data.coverImage}` : undefined,
    originSlug: (data) => data.page.fileSlug, // → _data/dayOrigins.json
    permalink: (data) =>
      data.status === "draft" && !process.env.SHOW_HIDDEN_POSTS
        ? false
        : `/calendar/${data.page.fileSlug}/`,
    eleventyExcludeFromCollections: (data) =>
      data.status === "draft" && !process.env.SHOW_HIDDEN_POSTS,
  },
};
