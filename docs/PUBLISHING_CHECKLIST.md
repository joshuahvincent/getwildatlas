# Publishing Checklist — getwildatlas

Standing checklist for every new page or blog post. Complete before merging to main.

---

## SEO & Meta Tags

Every page and blog post must include the following. Blog posts use Eleventy front matter; static pages add the tags manually in the `<head>`.

### Required tags (all pages)

```html
<!-- Primary meta -->
<meta name="description" content="[One sentence. 140–160 chars. Specific, not generic.]">

<!-- Open Graph (controls appearance when shared on Facebook, iMessage, Slack, etc.) -->
<meta property="og:type" content="article"> <!-- or "website" for non-blog pages -->
<meta property="og:title" content="[Post title]">
<meta property="og:description" content="[Same as meta description, or a tighter version]">
<meta property="og:image" content="[Absolute URL to cover image — 1200×630px ideal]">
<meta property="og:url" content="[Canonical URL for this page]">
<meta property="og:site_name" content="Wild Atlas">

<!-- Twitter / X card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Post title]">
<meta name="twitter:description" content="[Same as og:description]">
<meta name="twitter:image" content="[Same as og:image]">

<!-- Canonical (prevents duplicate-content issues if the post is cross-posted) -->
<link rel="canonical" href="[Absolute URL for this page]">
```

### For blog posts — Eleventy front matter

Add these fields to every blog post's front matter. The layout should read them and render the tags automatically (see implementation note below):

```yaml
---
title: "Post title here"
excerpt: "140–160 char description for meta and og:description."
coverImage: /assets/blog/filename.png   # used as og:image
permalink: /blog/slug/
---
```

The `post.njk` layout should output the meta block using these fields. If it does not yet, add it — see **Implementation** below.

### Implementation (Wes)

1. **Update `_includes/layouts/post.njk`** to render the full meta block in `<head>` using front-matter values. Absolute URLs require prepending the site base URL (set in `_data/site.json` or equivalent).

2. **Update base layout (`_includes/layouts/base.njk` or equivalent)** so static pages can pass `title`, `description`, `ogImage`, and `canonicalUrl` as variables and get the same meta block.

3. **Retroactively verify all existing blog posts** have `excerpt` and `coverImage` set in their front matter. Current posts to check:
   - `content/blog/wild-atlas-for-pre-readers.md`
   - `content/blog/conservation-status-for-kids.md`
   - `content/blog/legends-of-the-wild.md` (if published)
   - Any others under `content/blog/`

4. **Static pages** (`index.html`, `about.html`, `privacy.html`, `support.html`, `press.html`, etc.) should each have a hand-written `description` meta tag at minimum. Open Graph is lower priority for utility pages but worth adding to the homepage.

5. **Structured data (optional, high value for blog posts):** Add a `<script type="application/ld+json">` Article block to each post. At minimum:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Post title",
  "description": "Excerpt",
  "image": "Absolute cover image URL",
  "datePublished": "YYYY-MM-DD",
  "author": { "@type": "Person", "name": "Josh Vincent" },
  "publisher": {
    "@type": "Organization",
    "name": "Wild Atlas",
    "logo": { "@type": "ImageObject", "url": "https://wildatlasapp.com/assets/logo.png" }
  }
}
```

---

## Beehiiv Newsletter

When a blog post publishes, a Beehiiv issue goes out within 1–2 days. Mara drafts the issue and sends it to Josh for sign-off via Telegram before it's sent.

**Cadence:** send when there's something worth sharing — new post, new pack, major update. Target 2–3x/month. Do not send on a fixed schedule if there's nothing meaningful to share.

**Per-issue process:**
1. Post merges to main and deploys.
2. Anna creates a new coloring page PDF for the issue (one set per issue — see below).
3. PDF is added to `assets/downloads/` with an issue-numbered filename (e.g. `wild-atlas-coloring-book-issue-02.pdf`) and merged to main via PR.
4. Mara drafts a Beehiiv issue (teaser + link, free gift block pointing to the new PDF).
5. Mara sends Josh a Telegram with the draft and a one-line rationale.
6. Josh approves or requests changes.
7. Issue sends.

### Coloring pages — standing deliverable

Every newsletter issue ships with a free printable coloring page PDF. This is a recurring creative asset owned by Anna.

- **Filename convention:** `assets/downloads/wild-atlas-coloring-book-issue-NN.pdf`
- **Public URL pattern:** `https://wildatlasapp.com/assets/downloads/wild-atlas-coloring-book-issue-NN.pdf`
- **Format:** 6 pages, one Wild Atlas animal per page, A4/Letter, black and white line art, 300dpi
- **Brief template:** see GitHub issue #698 for the full brief — reuse it for each issue, swapping the animal list

Anna should be briefed at the start of each issue cycle so the PDF is ready before the email drafts. Lead time: ~1 week.

---

## Image assets

- Cover images (`coverImage`) should be at least **1200×630px** for og:image to render well when shared.
- All blog images live in `assets/blog/`. Use descriptive filenames (`conservation-hammerhead-page.png`, not `IMG_4231.PNG`).

---

## After publishing

- Confirm the page is indexed: search `site:wildatlasapp.com [post title]` in Google a few days after publish.
- If a post is cross-posted to Medium, add `<link rel="canonical">` on Medium pointing back to the wildatlasapp.com URL.
