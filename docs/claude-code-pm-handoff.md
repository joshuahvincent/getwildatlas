# Claude Code PM Agent — Handoff Prompt

Paste the prompt below into the Claude Code PM agent. It assumes the agent has access to both the `wildatlas` and `getwildatlas` repos on disk.

---

## Prompt

You are orchestrating a coordinated, two-repo migration: cutting over the `wildatlasapp.com` deploy from `joshuahvincent/wildatlas` to `joshuahvincent/getwildatlas`, and shipping the first `/blog/` route as part of the same move. This is the work tracked by [getwildatlas#2](https://github.com/joshuahvincent/getwildatlas/issues/2).

Cowork (running in Josh's marketing project) has already done the editorial and scaffolding work. **Do not redo any of it.** Your job is to execute the engineering migration safely.

### Read these before doing anything

In this order:

1. `getwildatlas/docs/pr-blog-and-migration.md` — the PR draft Cowork already wrote. It enumerates everything that needs to happen and the rationale.
2. `getwildatlas/CLAUDE.md` — declares Eleventy v3 as the stack and documents the blog/CMS roadmap.
3. `getwildatlas/.eleventy.js` — note the passthrough config: existing site files (`index.html`, `about.html`, `privacy.html`, `terms.html`, `css/`, `js/`, `fonts/`, `assets/`, `robots.txt`, `sitemap.xml`) come through unchanged when dropped at the repo root.
4. `wildatlas/PetPeeper/CLAUDE.md` — the wildatlas repo's branching policy. Read the "PR Base Rules" section carefully.

If anything in the PR draft contradicts the actual repo state, **stop and ask Josh**. Do not silently diverge.

---

### Hard constraints — do not violate

**1. Keep iOS app code and website code strictly separate in git.**

The `wildatlas` repo currently contains two unrelated bodies of work under one roof:
- `wildatlas/PetPeeper/` — the iOS app source (Swift, audio pipeline, asset generation, etc.). **Load-bearing for App Store releases.**
- `wildatlas/website/` — the marketing site (HTML/CSS/JS). **Being moved out by this migration.**

After this migration, the website lives in `getwildatlas/` and the `wildatlas` repo is iOS-only.

Therefore:
- **No commit in this work may modify any file under `wildatlas/PetPeeper/`** except a single documentation update to `wildatlas/PetPeeper/CLAUDE.md`'s "Website Work" section (covered in step 6 below).
- **No commit in `getwildatlas` may include iOS app code.** If you find yourself copying Swift, `.xcodeproj`, asset generators, or anything under a `PetPeeper/` subtree, stop — you've copied the wrong thing.
- **No shared branches between the two repos.** Each repo gets its own feature branch with its own name.
- **No git submodules, no symlinks, no nested checkouts** to bridge the two repos. They stay independent.

**2. Respect the wildatlas repo's PR Base Rules.**

The `wildatlas` repo CLAUDE.md is unambiguous: default PR base is `codex/mainline-integration`, not `main`. Direct-to-main requires a documented exception. The wildatlas-side cleanup PR (step 6) **must** target `codex/mainline-integration`. Do not open a direct-to-main PR.

(The `getwildatlas` repo doesn't yet have an integration branch — its current policy is `main` direct. That's fine for that side.)

**3. Don't do the manual steps that are Josh's call.**

These are explicitly out of scope:
- Reconfiguring the Cloudflare Pages dashboard. (Josh will do it after he verifies the preview deploy.)
- Creating the Buttondown account or changing the `wildatlas` placeholder in `getwildatlas/_includes/partials/newsletter-signup.njk`.
- Merging either PR. Both PRs land **open**, awaiting Josh's review.
- Promoting the wildatlas-side PR from `codex/mainline-integration` to `main`. That's the Release Manager's job per `docs/RELEASE_POLICY.md`.

**4. Don't add scope.**

Followups already tracked in the PR draft (RSS feed, blog tag pages, multi-locale blog, Sveltia CMS) are explicitly **not in this PR**. Don't add them. Don't add anything else either — no "while we're here" cleanups, no dependency bumps, no formatting passes.

---

### Execution plan

**Step 1 — Verify clean starting state.**

- In `getwildatlas`: `main` branch, clean working tree, the Cowork-scaffolded files exist (`.eleventy.js`, `package.json`, `wrangler.toml`, `_includes/layouts/blog-base.njk`, `_includes/layouts/post.njk`, `_includes/partials/newsletter-signup.njk`, `blog/index.njk`, `content/blog/why-i-built-this.md` with frontmatter, `docs/pr-blog-and-migration.md`).
- In `wildatlas`: `codex/mainline-integration` branch checked out, clean working tree, `website/` directory still present at repo root.
- If either is dirty, ask Josh before proceeding.

**Step 2 — Branch in `getwildatlas`.**

```
git checkout -b migration/blog-and-cutover
```

**Step 3 — Copy the live site files into `getwildatlas`.**

Copy the contents of `wildatlas/website/*` into the root of the `getwildatlas` working tree. **Do not overwrite the Cowork-scaffolded files.** Specifically:

- `wildatlas/website/wrangler.toml` must **not** replace `getwildatlas/wrangler.toml` (the new one points at `_site/`, the old one points at `.`).
- If `wildatlas/website/` contains any `_includes/`, `blog/`, `content/`, `.eleventy.js`, `package.json`, or `_site/` directories, don't copy those (it doesn't, but verify).
- Use `rsync` or an explicit copy list, not a blanket `cp -R` that overwrites. Recommended:
  ```
  rsync -av --ignore-existing \
    --exclude=wrangler.toml \
    wildatlas/website/ getwildatlas/
  ```

**Step 4 — Build and verify locally.**

In `getwildatlas/`:
```
npm install
npm run build
```

The build must complete with zero errors. Then `npm run dev` and open `http://localhost:8081/`. Verify:
- Home page renders byte-identical to wildatlasapp.com today, including all 5 locales (EN, DE, ES, FR, ZH-Hans — flip via the language picker, confirm no `[i18n]` console warnings).
- `/about`, `/privacy`, `/terms` load and render.
- `/blog/` shows one post (the founder post).
- `/blog/why-i-built-this/` renders with proper OG tags (view source).
- The Buttondown signup form is present (with the placeholder username — leave it).

If any of these fail, stop and report. Don't push broken state.

**Step 5 — Wire the blog into the main site's styling.**

In `getwildatlas/_includes/layouts/blog-base.njk`, uncomment the asset links: `<link rel="stylesheet" href="/css/styles.css">` and the two font preloads. Rebuild and re-verify the blog still renders. The minimal default stylesheet I included will be overridden by the main site's CSS — that's expected.

**Step 6 — Open the `getwildatlas` PR.**

- Commit changes with a clear message: `migration: cut wildatlasapp.com deploy over to this repo + ship blog`.
- Push the branch.
- Open a PR using the body from `getwildatlas/docs/pr-blog-and-migration.md`. Update the `[CONFIRM]` placeholders and any TODO notes in that draft (e.g., remove the "files didn't auto-port" note since you'll have just ported them).
- PR title: `Adopt Eleventy + ship blog; cut wildatlasapp.com deploy over to this repo (closes #2)`
- Labels: `migration`, `infrastructure`, `blog`
- Base: `main` (this repo's current policy).

**Step 7 — Open the companion `wildatlas` cleanup PR.**

In a separate working tree of the `wildatlas` repo (not a branch in `getwildatlas`):

```
git checkout codex/mainline-integration
git pull --rebase
git checkout -b cleanup/remove-website-after-migration
git rm -r website/
```

Then edit `wildatlas/PetPeeper/CLAUDE.md`:
- In the "Website Work — Current Home and Migration Plan" section, update the prose to reflect that the migration is complete. The site is now served from `getwildatlas`, not from `wildatlas/website/`. Remove the "Cloudflare status checks on PRs here" paragraph (no longer relevant — the Pages project no longer watches this repo).

Commit message: `cleanup: remove wildatlas/website/ — migrated to getwildatlas (closes getwildatlas#2 companion)`.

Push and open the PR:
- **Base: `codex/mainline-integration`.** Not `main`. This is mandatory per the repo's PR Base Rules.
- Title: `Remove wildatlas/website/ — site now lives in getwildatlas repo`
- In the PR body, link the `getwildatlas` PR from step 6.

**Critical check before opening this PR:** run `git diff --stat codex/mainline-integration` and confirm:
- Every file change is either a deletion under `website/` or a modification to `PetPeeper/CLAUDE.md`.
- Zero files under `PetPeeper/` (other than `CLAUDE.md`) are modified.
- No new files added anywhere.

If anything else is in the diff, stop and ask Josh.

**Step 8 — Stop. Report.**

Don't merge. Don't reconfigure Cloudflare. Don't touch Buttondown. Report back to Josh with:
- Links to both open PRs.
- Confirmation that the local build is green and the home page renders identically.
- Anything that surprised you during the migration (a file in `wildatlas/website/` you weren't sure about, an unexpected dependency, etc.).

---

### Coordination rules between you and the agents you delegate to

- If you spin up an engineering sub-agent to execute the file moves or PR opening, brief it with these constraints verbatim. Do not paraphrase the iOS-vs-website separation rule — it's load-bearing.
- If a sub-agent reports an ambiguity (e.g., "should this file go in the new repo?"), default to **leave it where it is** and surface the question to Josh. Don't guess on placement of files near the boundary.
- If a sub-agent reports a test failure, stop the whole orchestration. Don't ship around a failing build.

---

### What "done" looks like

- Two PRs open, one per repo, cross-linked.
- `getwildatlas` PR: builds clean on Cloudflare Pages preview, home page renders byte-identical to current production across all 5 locales, blog is live at `/blog/`.
- `wildatlas` PR: deletes `website/`, updates `PetPeeper/CLAUDE.md`, base is `codex/mainline-integration`, touches zero iOS app code.
- Both PR bodies reference each other and reference getwildatlas#2.
- Nothing merged. Nothing deployed. Cloudflare dashboard untouched. Buttondown untouched.

Stop there and ping Josh.
