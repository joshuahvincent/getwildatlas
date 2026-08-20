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
  eleventyConfig.addCollection("posts", (collection) => {
    return collection
      .getFilteredByGlob("content/blog/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // ---- Filters --------------------------------------------------------------
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
