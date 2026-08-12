# getwildatlas — Development Workflow

The website for Wild Atlas (the iOS app). Marketing site, source/transparency pages, terms, privacy, future product routes — anything served from `wildatlasapp.com` lives here.

## Repo purpose

This is the **website** repo. The **iOS app** lives in a separate repo: [`wildatlas`](https://github.com/joshuahvincent/wildatlas). The two repos are intentionally split — see the `wildatlas` repo's CLAUDE.md "Website Work" section for the rationale.

## Status (as of 2026-08-11)

- **Branch model:** just `main`. Direct-to-`main` per [DEPLOY.md](DEPLOY.md) — see "Branch + PR rules" below.
- **Deploy:** **live.** The Cloudflare Pages project `wildatlaswebsite` (apex `wildatlasapp.com`) deploys from **this repo's root**, `main` branch. The migration off `wildatlas/website/` is **complete** — [getwildatlas#2](https://github.com/joshuahvincent/getwildatlas/issues/2) closed 2026-05-21.
- **Tech stack:** [Eleventy](https://www.11ty.dev/) v3 (Node-based static site generator). Templating-only — no client-side framework shipped. Vanilla HTML/CSS/JS at the repo root passes through; blog routes render from `content/blog/*.md` via Nunjucks layouts under `_includes/`. See "Build & blog" section below.
- **Analytics:** Google Analytics 4 (`G-3ZQB7WVQJ1`) on every page. Website only — never the app. Two compliance follow-ups deferred by Josh (2026-08-11): privacy-policy disclosure + an EU/UK cookie-consent banner with GA Consent Mode.
- **Owner:** **Wes** (website developer — everything at `wildatlasapp.com`). Josh is the sole approver for anything public.

## Team / who's who

Wild Atlas is a named team. Wes (this repo's owner) coordinates with:

- **Josh** — sole approver for anything public. Nothing user-facing ships without his sign-off.
- **Mara** — marketing director. Owns the content calendar and decides what the site publishes; owns the newsletter lists the Beehiiv capture funnels into.
- **Blake** — blog / founder-voice content. Writes the posts Wes publishes.
- **Cole** — copywriter. Brings approved site copy. **Wes does not author marketing claims** — Cole/Blake deliver copy that has cleared the advisor/copy gates upstream.
- **Anna** — design lead. Visual judgment on site changes that carry the brand.
- **Oskar** — partnerships / outreach. His campaigns land traffic on specific pages; the Beehiiv capture funnels into marketing-owned lists.
- **Roger** — release manager, **app repo** (`wildatlas`). Cross-repo coordination — e.g. when the app links to a `wildatlasapp.com` URL (see "Cross-repo coordination").

Process rules are set by **this repo's docs** ([DEPLOY.md](DEPLOY.md) is authoritative for deploy/branch flow); do **not** import the app repo's PR-only / integration-branch rules.

## Build & blog

### Local build

```bash
npm install
npm run build     # one-shot build → _site/
npm run dev       # local dev server with hot reload on :8081
```

Eleventy reads everything in this repo, passes most files through unchanged, and renders blog routes from `content/blog/*.md` using the Nunjucks layouts under `_includes/`.

### How the blog works

- **Post source:** `content/blog/<slug>.md` with YAML frontmatter:
  ```yaml
  ---
  layout: layouts/post.njk
  title: "Post title"
  date: 2026-05-26
  author: Joshuah Vincent
  excerpt: "One-line summary that shows on the index and in OG tags."
  permalink: /blog/<slug>/
  tags: [founder]
  ---
  ```
- **Listing:** `/blog/` renders from `blog/index.njk`, sorted newest first.
- **Layouts:** `_includes/layouts/blog-base.njk` is the HTML shell shared by all blog routes. Once the migration brings over the main site's `css/styles.css`, fonts, and i18n JS, uncomment the asset links in `blog-base.njk` and the blog will adopt the main site's full styling automatically.
- **Newsletter signup:** posts to **Beehiiv** (not Buttondown — that was the original plan, never shipped). The form POSTs to `/api/subscribe`, a **Cloudflare Pages Function** (`functions/api/subscribe.js`) that proxies to the Beehiiv API server-side so the API key never reaches the browser. **Single opt-in** (Josh's call — subscribers are active immediately, no confirmation email). Successful signups return the `INFORMED2026` custom offer code (free Farm Friends pack). Shipped under [getwildatlas#18](https://github.com/joshuahvincent/getwildatlas/issues/18). Lists are owned by marketing (Mara).

### Adding a new post

1. Create `content/blog/<slug>.md` with frontmatter (copy from any existing post).
2. Write the body in markdown.
3. `npm run dev` to eyeball locally.
4. Commit, push. Cloudflare Pages rebuilds in ~60s.

### Future: CMS for non-technical authors

When a second writer needs to author posts without git, drop in [Sveltia CMS](https://github.com/sveltia/sveltia-cms) at `/admin/`. It mounts as a static admin route, authenticates via GitHub OAuth (Cloudflare Workers OAuth proxy is free), and writes markdown to `content/blog/` for Eleventy to render. Zero rewrite needed.

## Branch + PR rules

**[DEPLOY.md](DEPLOY.md) is authoritative for the deploy/branch flow.** In one line: commit to `main`, push, Cloudflare Pages auto-deploys in ~60s. Summary:

- Default branch is `main`. **Direct commits to `main` are the norm** — no mandatory PR, no integration branch.
- Push **is** publish (auto-deploy). So for **significant public-facing changes**, the approval moment is *before* the commit: build a preview (per-branch `*.wildatlaswebsite.pages.dev` or local), screenshot it, and get **Josh's sign-off first**. Routine/low-risk changes ship directly.
- Use an optional `preview/<name>` branch when you want to eyeball a real URL before the apex domain; delete it once shipped.
- **Do not import the `wildatlas` (app) repo's PR-only / `codex/mainline-integration` → `main` rules.** Those exist for iOS App Store safety; the website doesn't have those failure modes. Rollback here is just another commit.

## Cross-repo coordination — when website work originates from app side

Wild Atlas (the iOS app) frequently needs corresponding website work — a new page for an About-screen link, a privacy policy update, a press kit, etc. The pattern:

1. **App side files an issue** in `wildatlas` describing what the website needs to do (URL the app will link to, content needed, deadline).
2. **A mirror issue is filed in `getwildatlas`** with the actual implementation scope. The mirror references the app-side issue.
3. **The implementation PR lands in `getwildatlas`.** Once live, the URL is finalized.
4. **App side updates its URL reference** in a one-line PR (eventually using a URL registry file — location TBD in the `wildatlas` repo).
5. **Close both issues** once the loop is complete.

**Canonical first example:** [wildatlas#140](https://github.com/joshuahvincent/wildatlas/issues/140) ↔ [getwildatlas#1](https://github.com/joshuahvincent/getwildatlas/issues/1) — publishing the Wild Atlas source/transparency list referenced from the app's About screen.

When opening a website-side PR that addresses an app-side request, **always reference both issues** in the PR body so the loop closes cleanly.

## Conventions to adopt as the repo grows

These don't apply yet (repo is too small) but document them now for future contributors:

- **URLs that the app depends on are load-bearing.** Once a page is live and the app links to it, don't rename or restructure that URL without a coordinated PR in `wildatlas`. There will eventually be a URL registry file in `wildatlas` listing app-referenced routes; consult it before refactoring.
- **Cloudflare Pages preview deploys** are advisory for review, load-bearing for production once the project is rewired here.
- **No secrets in source.** Standard rule. Cloudflare env vars for anything sensitive.
- **Keep page content easy to update** — markdown rendered at build time is preferred over hard-coded HTML, so non-engineering updates (e.g., adding a new source to the transparency list) don't require a code review.

## Useful references

- [`wildatlas` repo CLAUDE.md](https://github.com/joshuahvincent/wildatlas/blob/main/PetPeeper/CLAUDE.md) — see "Website Work" section for the boundary rationale and migration plan
- [`wildatlas` RELEASE_POLICY.md](https://github.com/joshuahvincent/wildatlas/blob/main/PetPeeper/docs/RELEASE_POLICY.md) — release patterns to mirror when this repo gains scale
