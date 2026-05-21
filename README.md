# getwildatlas

Source for **wildatlasapp.com** — the marketing site, blog, and product pages for the Wild Atlas iOS app.

## Quick start

```bash
npm install
npm run dev       # local dev server, hot reload, http://localhost:8081/
npm run build     # one-shot build → _site/
```

## Stack

- **[Eleventy](https://www.11ty.dev/) v3** — static site generator. Templating-only, no client framework shipped.
- **Cloudflare Pages** — hosting + auto-deploy on push to `main`.
- **[Buttondown](https://buttondown.com/)** — newsletter (free under 100 subs).

Tech-stack rationale, blog authoring workflow, and CMS roadmap live in [CLAUDE.md](./CLAUDE.md).

## Layout

```
.
├── _includes/
│   ├── layouts/
│   │   ├── blog-base.njk      # HTML shell shared by all blog routes
│   │   └── post.njk           # individual blog post wrapper
│   └── partials/
│       └── newsletter-signup.njk
├── blog/
│   └── index.njk              # /blog/ listing page
├── content/
│   ├── blog/                  # blog posts (markdown + frontmatter)
│   └── press/                 # launch press kit copy (raw, not yet rendered)
├── press-kit-staging/         # localized press kit (raw, not yet rendered)
├── .eleventy.js               # Eleventy config
├── .eleventyignore            # files Eleventy should skip
└── wrangler.toml              # Cloudflare Pages config (active after getwildatlas#2)
```

## Deploy

See [DEPLOY.md](./DEPLOY.md). One-line summary: commit to `main`, push, Cloudflare auto-deploys.

## Adding a blog post

Create `content/blog/<slug>.md`:

```markdown
---
layout: layouts/post.njk
title: "Your post title"
date: 2026-05-26
author: Joshuah Vincent
excerpt: "One-line summary — shows on the index and in social previews."
permalink: /blog/<slug>/
tags: [founder]
---

Your post body in markdown.
```

Run `npm run dev`, eyeball at `http://localhost:8081/blog/`, commit, push.
