// Conservation calendar leaf pages: content/calendar/<slug>.md → /calendar/<slug>/
//
// Front-matter:
//   status: draft          hidden (advisor gates not passed yet)
//   (no status)            LIVE — Josh's standing decision (2026-09-30): calendar
//                          pages publish as soon as the naturalist + child-psych
//                          gates pass, no per-page approval.
//   blogStatus: scheduled  blog copy (/blog/<slug>/) waits for Josh's "approve"
//   blogStatus: approved   blog copy goes live on the page's `date`
//                          (content/calendar-blog-copies.njk + daily build)
//
// SHOW_HIDDEN_POSTS=1 shows drafts (local dev + preview deploy).

module.exports = {
  layout: "layouts/animal-day.njk",
  tags: ["calendarPage"],
  backLink: { url: "/calendar/", label: "Conservation calendar" },
  eleventyComputed: {
    originSlug: (data) => data.page.fileSlug, // → _data/dayOrigins.json
    permalink: (data) =>
      data.status === "draft" && !process.env.SHOW_HIDDEN_POSTS
        ? false
        : `/calendar/${data.page.fileSlug}/`,
    eleventyExcludeFromCollections: (data) =>
      data.status === "draft" && !process.env.SHOW_HIDDEN_POSTS,
  },
};
