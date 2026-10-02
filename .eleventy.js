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
  const animalDaysData = require("./_data/animalDays.json");
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
  // The calendar is perennial: no years on screen. Month names only.
  eleventyConfig.addFilter("monthLabel", (key) =>
    new Date(key + "-01T00:00:00Z").toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })
  );
  // Floating days carry `rule: [n, weekday (Mon=0..Sun=6), month]` (n = -1 for
  // "last") in _data/animalDays.json, so each year's date is computed, not
  // stored. `when` overrides the display text for weeks/months/ranges.
  const ORD = { 1: "First", 2: "Second", 3: "Third", 4: "Fourth", "-1": "Last" };
  const WD = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const occurrence = (day, year) => {
    if (!day.rule) return new Date(Date.UTC(year, +day.date.slice(5, 7) - 1, +day.date.slice(8, 10)));
    const [n, wd, m] = day.rule;
    if (n > 0) {
      const first = new Date(Date.UTC(year, m - 1, 1));
      return new Date(Date.UTC(year, m - 1, 1 + ((wd - ((first.getUTCDay() + 6) % 7) + 7) % 7) + 7 * (n - 1)));
    }
    const last = new Date(Date.UTC(year, m, 0));
    return new Date(Date.UTC(year, m - 1, last.getUTCDate() - ((((last.getUTCDay() + 6) % 7) - wd + 7) % 7)));
  };
  const nextOccurrence = (day, from) => {
    const o = occurrence(day, from.getUTCFullYear());
    return o.getTime() < from.getTime() ? occurrence(day, from.getUTCFullYear() + 1) : o;
  };
  const monthDay = (d) => { const x = new Date(d); return `${MONTHS[x.getUTCMonth()]} ${x.getUTCDate()}`; };
  const whenText = (day) =>
    day.when || (day.rule ? `${ORD[day.rule[0]]} ${WD[day.rule[1]]} in ${MONTHS[day.rule[2] - 1]}` : monthDay(day.date + "T00:00:00Z"));
  // Live dates: the site rebuilds daily (deploy.yml cron), so "next occurrence
  // from today" is always the current year's date — once a day passes, its page
  // rolls to next year's date overnight. No year is printed; the weekday makes
  // it concrete ("Friday, May 21").
  const today = () => { const n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())); };
  const fullDay = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  // {date, note, isToday} for a day entry: next real date, plus how it recurs
  // for floating days ("Every third Friday in May") or multi-day spans.
  const liveDay = (day) => {
    if (day.when && !day.rule) return { date: day.when, note: null, isToday: false }; // fixed spans: "All of October"
    const next = nextOccurrence(day, today());
    const isToday = next.getTime() === today().getTime();
    if (day.when) return { date: `Starts ${fullDay(next)}`, note: day.when, isToday };   // floating weeks
    if (day.rule) return { date: fullDay(next), note: `Always the ${ORD[day.rule[0]].toLowerCase()} ${WD[day.rule[1]]} in ${MONTHS[day.rule[2] - 1]}`, isToday };
    return { date: fullDay(next), note: null, isToday };
  };
  // Calendar page header: its own day entry (by slug), else the day entry for
  // its animal on that date, else the page date's next occurrence.
  eleventyConfig.addFilter("perennialDate", (date, fileSlug, appId) => {
    const all = [...animalDaysData.days, ...animalDaysData.alsoCelebrated];
    const iso = new Date(date).toISOString().slice(0, 10);
    const hit = all.find((d) => fileSlug && (d.slug === fileSlug || d.pageSlug === fileSlug))
      || all.find((d) => appId && d.appId === appId && d.date === iso);
    return liveDay(hit || { date: iso });
  });
  // "Celebrated on" line ({day, date}): matched by day name to its entry.
  eleventyConfig.addFilter("perennialDay", (x) => {
    const hit = [...animalDaysData.days, ...animalDaysData.alsoCelebrated].find((d) => d.day === x.day);
    if (!hit) return x.date instanceof Date ? monthDay(x.date) : x.date;
    const l = liveDay(hit);
    return hit.rule && !hit.when ? `${l.date} (${l.note.replace(/^Always /, "always ")})` : l.date;
  });
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
  // next year (floating days are recomputed from their rule). Each day links to its calendar page (or blog post) once it exists.
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
    for (const p of calendarPages || []) {
      if (p.data.appId && !animalPage.has(p.data.appId)) animalPage.set(p.data.appId, { url: p.url, image: p.data.coverImage });
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
      const occ = nextOccurrence(day, new Date(start));
      const m = months.find((x) => x.key === occ.toISOString().slice(0, 7));
      if (!m) continue;
      const page = (day.slug && pages.get(day.slug)) || (day.pageSlug && pages.get(day.pageSlug));
      const ap = day.appId && animalPage.get(day.appId);
      const url = page ? page.url : ap ? ap.url : day.blogUrl && postUrls.has(day.blogUrl) ? day.blogUrl : null;
      const iso = occ.toISOString().slice(0, 10);
      m.events.push({ ...day, iso, url, day_num: occ.getUTCDate(),
        weekday: occ.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
        image: page ? page.data.coverImage : ap ? ap.image : null, isToday: iso === todayIso, isPast: iso < todayIso });
    }
    // Second-tier days: real awareness days we didn't pick. Dot + list line, no page.
    for (const day of also || []) {
      const occ = nextOccurrence(day, new Date(start));
      const m = months.find((x) => x.key === occ.toISOString().slice(0, 7));
      const sp = day.pageSlug && pages.get(day.pageSlug);
      const ap = (sp && { url: sp.url, image: sp.data.coverImage }) || (day.appId && animalPage.get(day.appId));
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
  // Flip to true when /zoos/ (getwildatlas#38) ships — shows "Find the nearest zoo" buttons.
  eleventyConfig.addGlobalData("zooFinderLive", false);
  eleventyConfig.addGlobalData("todayIso", () => new Date().toISOString().slice(0, 10));
  // Places map (js/places-map.js, docs/places-map.md): general-purpose map with the zoo finder's look.
  const placesLib = require("./lib/place-pins.js");
  eleventyConfig.addFilter("placePins", (list, tier) => placesLib.placePins(list, tier));
  eleventyConfig.addFilter("whereToSeePins", placesLib.whereToSeePins);
  eleventyConfig.addFilter("pinKey", placesLib.pinKey);
  // {% placesMap pins, { label, src, format, types, fit, maxZoom, legend, height, cards, cardsMode, animal, wildMax, link } %}
  // link: { href, text } adds an explore link in the map's bottom-right corner.
  // pins: an array from placePins/whereToSeePins, or null when using `src` (e.g. all zoo-finder places).
  eleventyConfig.addShortcode("placesMap", (pins, opts = {}) => {
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const attrs = [`class="places-map"`, `role="region"`, `aria-label="${esc(opts.label || "Map of places")}"`];
    if (pins && pins.length) attrs.push(`data-pins="${esc(JSON.stringify(pins))}"`);
    if (opts.src) attrs.push(`data-src="${esc(opts.src)}"`);
    if (opts.format) attrs.push(`data-format="${esc(opts.format)}"`);
    if (opts.types) attrs.push(`data-types="${esc(opts.types)}"`);
    if (opts.fit) attrs.push(`data-fit="${esc(opts.fit)}"`);
    if (opts.maxZoom) attrs.push(`data-max-zoom="${esc(opts.maxZoom)}"`);
    if (opts.legend) attrs.push(`data-legend="${esc(typeof opts.legend === "string" ? opts.legend : JSON.stringify(opts.legend))}"`);
    if (opts.height) attrs.push(`style="--places-map-h: ${esc(opts.height)}"`);
    if (opts.cards) attrs.push(`data-cards="${esc(opts.cards)}"`);
    if (opts.cardsMode) attrs.push(`data-cards-mode="${esc(opts.cardsMode)}"`);
    if (opts.animal) attrs.push(`data-animal="${esc(opts.animal)}"`);
    if (opts.wildMax) attrs.push(`data-wild-max="${esc(opts.wildMax)}"`);
    if (!(pins && pins.length) && !opts.src) return "";
    const link = opts.link && opts.link.href ? `<a class="places-map-explore" href="${esc(opts.link.href)}">${esc(opts.link.text || "Explore the map")} →</a>` : "";
    return `<link rel="stylesheet" href="/js/vendor/maplibre/maplibre-gl.css"><link rel="stylesheet" href="/css/places-map.css?v=8">` +
      `<div ${attrs.join(" ")}>${link}</div><script type="module" src="/js/places-map.js?v=13"></script>`;
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
