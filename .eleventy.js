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
  // Rolling 12-month animal calendar for /calendar/, current month first.
  // Awareness days recur yearly, so a day earlier than this month rolls to
  // next year. Each day links to its calendar page (or blog post) once it exists.
  eleventyConfig.addFilter("calendarYear", (days, calendarPages, posts, also, liteAnimals) => {
    const now = new Date();
    const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
    const pages = new Map((calendarPages || []).map((p) => [p.page.fileSlug, p]));
    const postUrls = new Set((posts || []).map((p) => p.url));
    // Animal → page: a full article (calendar day with that appId and a live page) wins, else its animal page.
    const animalPage = new Map();
    for (const d of days) {
      const p = d.slug && d.appId && pages.get(d.slug);
      if (p && !animalPage.has(d.appId)) animalPage.set(d.appId, { url: p.url, image: p.data.coverImage });
    }
    for (const l of liteAnimals || []) {
      if (!animalPage.has(l.appId)) animalPage.set(l.appId, { url: `/calendar/${l.slug}/`, image: l.animal.images && l.animal.images.cover });
    }
    const todayIso = now.toISOString().slice(0, 10);
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(start); d.setUTCMonth(d.getUTCMonth() + i);
      months.push({ key: d.toISOString().slice(0, 7), events: [], also: [] });
    }
    for (const day of days) {
      let occ = new Date(day.date + "T00:00:00Z");
      while (occ.getTime() < start) occ.setUTCFullYear(occ.getUTCFullYear() + 1);
      const m = months.find((x) => x.key === occ.toISOString().slice(0, 7));
      if (!m) continue;
      const page = day.slug && pages.get(day.slug);
      const ap = day.appId && animalPage.get(day.appId);
      const url = page ? page.url : ap ? ap.url : day.blogUrl && postUrls.has(day.blogUrl) ? day.blogUrl : null;
      const iso = occ.toISOString().slice(0, 10);
      m.events.push({ ...day, iso, url, day_num: occ.getUTCDate(),
        weekday: occ.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
        image: page ? page.data.coverImage : ap ? ap.image : null, isToday: iso === todayIso, isPast: iso < todayIso });
    }
    // Second-tier days: real awareness days we didn't pick. Dot + list line, no page.
    for (const day of also || []) {
      let occ = new Date(day.date + "T00:00:00Z");
      while (occ.getTime() < start) occ.setUTCFullYear(occ.getUTCFullYear() + 1);
      const m = months.find((x) => x.key === occ.toISOString().slice(0, 7));
      const ap = day.appId && animalPage.get(day.appId);
      if (m) m.also.push({ ...day, iso: occ.toISOString().slice(0, 10), day_num: occ.getUTCDate(), url: ap ? ap.url : null, image: ap ? ap.image : null });
    }
    for (const m of months) {
      m.events.sort((a, b) => (a.iso < b.iso ? -1 : 1));
      m.also.sort((a, b) => (a.iso < b.iso ? -1 : 1));
      // Calendar squares (Monday-first) with the featured event + also-celebrated days.
      const [y, mo] = m.key.split("-").map(Number);
      const first = new Date(Date.UTC(y, mo - 1, 1));
      const n = new Date(Date.UTC(y, mo, 0)).getUTCDate();
      m.cells = Array((first.getUTCDay() + 6) % 7).fill(null);
      for (let d = 1; d <= n; d++) {
        const iso = `${m.key}-${String(d).padStart(2, "0")}`;
        m.cells.push({ day: d, iso, isToday: iso === todayIso,
          ev: m.events.find((e) => e.iso === iso) || null, also: m.also.filter((a) => a.iso === iso) });
      }
      while (m.cells.length % 7) m.cells.push(null);
      // Agenda (phones): every date with anything on it.
      m.agenda = m.cells.filter((c) => c && (c.ev || c.also.length));
    }
    return months;
  });
  eleventyConfig.addGlobalData("todayIso", () => new Date().toISOString().slice(0, 10));
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
