# getwildatlas — Development Workflow

The website for Wild Atlas (the iOS app). Marketing site, source/transparency pages, terms, privacy, future product routes — anything served from `wildatlasapp.com` lives here.

## Repo purpose

This is the **website** repo. The **iOS app** lives in a separate repo: [`wildatlas`](https://github.com/joshuahvincent/wildatlas). The two repos are intentionally split — see the `wildatlas` repo's CLAUDE.md "Website Work" section for the rationale.

## Status (as of 2026-05-13)

- **Branch model:** just `main` for now. Will adopt integration → main flow if the repo grows or gains contributors.
- **Deploy:** the Cloudflare Pages project `wildatlaswebsite` (apex `wildatlasapp.com`) currently still deploys from `wildatlas/website/`. The migration to `getwildatlas` is tracked at [getwildatlas#2](https://github.com/joshuahvincent/getwildatlas/issues/2). Until that cuts over, treat website pages as live-served from the `wildatlas` repo, with this repo as the new home.
- **Tech stack:** **TBD** — to be decided by the first real PR that lands website code. Update this CLAUDE.md when chosen (static HTML, Astro, Next, Hugo, etc.).
- **Reviewer:** Joshuah Vincent (solo for now).

## Branch + PR rules

- Default branch is `main`.
- Direct commits to `main` are fine while it's a single-dev repo and the deploy isn't wired here yet.
- Once the Cloudflare Pages cutover happens (#2), switch to PR-based review:
  - Feature branch → PR → review → merge to `main`.
  - Pages auto-deploys from `main` on merge.

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
