// Wild Atlas website — Eleventy config.
//
// Design intent:
//   - Treat the existing static site files (index.html, css/, js/, assets/,
//     fonts/, robots.txt, sitemap.xml) as passthrough. Eleventy must not
//     transform them. The home page renders byte-identically to today.
//   - Render the blog under /blog/ from markdown in content/blog/.
//   - Inherit the existing site's CSS, JS, fonts, and i18n shell by sharing
//     the same _includes/layouts/blog-base.njk wrapper.
//
// The getwildatlas#2 migration is complete (closed 2026-05-21): index.html,
// css/, js/, fonts/ and assets/ live at this repo's root and are picked up by
// the passthrough rules below. This repo is the sole source of wildatlasapp.com.

module.exports = function (eleventyConfig) {
  // ---- Passthrough: static site --------------------------------------------
  // Copied verbatim into _site/. Eleventy must not transform these.
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("_redirects");  // Cloudflare short links
  // Existing top-level HTML pages (index.html, about.html, privacy.html, …)
  // are passthrough until they're converted to use the shared layout. Drop
  // them at the repo root and they'll appear in _site/ unchanged.
  eleventyConfig.addPassthroughCopy("*.html");

  // ---- Collections ----------------------------------------------------------
  // Blog posts = hand-written posts in content/blog/ plus the generated blog
  // copies of conservation-calendar pages (tag "blogCopy", see
  // content/calendar-blog-copies.njk). Sorted by their publish date.
  const postDate = (item) => new Date(item.data.postDate || item.date);
  eleventyConfig.addCollection("posts", (collection) => {
    return [
      ...collection.getFilteredByGlob("content/blog/*.md"),
      ...collection.getFilteredByTag("blogCopy"),
    ].sort((a, b) => postDate(b) - postDate(a));
  });

  // ---- Conservation calendar ------------------------------------------------
  // content/calendar/<slug>.md → /calendar/<slug>/ (live once advisor-gated;
  // `status: draft` hides). Its blog copy (/blog/<slug>/) is generated on the
  // day once Josh approves (`blogStatus: approved`) — see calendar.11tydata.js.
  const showHidden = () => Boolean(process.env.SHOW_HIDDEN_POSTS);
  const calendarItems = (collection) =>
    collection
      .getFilteredByGlob("content/calendar/*.md")
      .filter((i) => showHidden() || i.data.status !== "draft")
      .sort((a, b) => a.date - b.date);
  eleventyConfig.addCollection("calendar", calendarItems);
  eleventyConfig.addCollection("calendarBlogDue", (collection) =>
    calendarItems(collection).filter(
      (i) => showHidden() || (i.data.blogStatus === "approved" && i.date.getTime() <= Date.now())
    )
  );
  eleventyConfig.addFilter("monthKey", (d) => new Date(d).toISOString().slice(0, 7));
  eleventyConfig.addFilter("monthLabel", (key) =>
    new Date(key + "-01T00:00:00Z").toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("dayNum", (d) => new Date(d).getUTCDate());
  eleventyConfig.addFilter("weekday", (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }));
  eleventyConfig.addFilter("isPast", (d) => new Date(d).getTime() < Date.now() - 86400000);
  eleventyConfig.addFilter("isToday", (d) => new Date(d).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10));
  // Month grid for /calendar/: Monday-first weeks of {day, iso} cells (null = padding).
  eleventyConfig.addFilter("monthGrid", (key) => {
    const [y, m] = key.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells = Array((first.getUTCDay() + 6) % 7).fill(null);
    for (let d = 1; d <= days; d++) cells.push({ day: d, iso: `${key}-${String(d).padStart(2, "0")}` });
    while (cells.length % 7) cells.push(null);
    return cells;
  });
  eleventyConfig.addFilter("isoDay", (d) => new Date(d).toISOString().slice(0, 10));
  const { RenderPlugin } = require("@11ty/eleventy");
  eleventyConfig.addPlugin(RenderPlugin);

  // ---- Filters --------------------------------------------------------------
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC", // front-matter dates are calendar days; don't shift them
    });
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString();
  });

  // Reading-time estimate, used on /blog/ list and post header.
  eleventyConfig.addFilter("readingTime", (content) => {
    if (!content) return "";
    const words = String(content).trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 220));
    return `${minutes} min read`;
  });

  // ---- Awareness-day animal posts (layouts/animal-day.njk) -----------------
  // Markdown for front-matter fields (greeting, grown-ups box, app CTA).
  const md = require("markdown-it")({ html: true, linkify: false, typographer: false });
  eleventyConfig.addFilter("md", (s) => (s ? md.render(String(s)) : ""));
  eleventyConfig.addFilter("mdInline", (s) => (s ? md.renderInline(String(s)) : ""));
  // Append campaign UTM tags to an outbound link.
  eleventyConfig.addFilter("utm", (url, campaign, source = "wildatlas_blog", medium = "referral") => {
    if (!url) return url;
    const u = new URL(url);
    u.searchParams.set("utm_source", source);
    u.searchParams.set("utm_medium", medium);
    u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  });
  // {% figure "/assets/blog/x.jpg", "Alt text", "Optional caption" %}
  eleventyConfig.addShortcode("figure", (src, alt, caption) => {
    const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    return `<figure class="story-figure"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">` +
      (caption ? `<figcaption>${esc(caption)}</figcaption>` : "") + `</figure>`;
  });

  // ---- Config ---------------------------------------------------------------
  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    // dataTemplateEngine: false, // keep default
  };
};
