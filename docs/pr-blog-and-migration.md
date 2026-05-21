# PR draft — getwildatlas#2 cutover + blog scaffold

Paste the body below into the GitHub PR when opening it. Tweak titles/links as needed once the wildatlas-side companion PR has a real number.

---

## Suggested PR title

`Adopt Eleventy + ship blog; cut wildatlasapp.com deploy over to this repo (closes #2)`

## Suggested PR labels

`migration`, `infrastructure`, `blog`

---

## PR body

Closes #2.

### What this does

Two things in one PR because they're coupled:

1. **Picks the tech stack** for this repo (Eleventy v3) and lands the first real build. Templating-only, no client-side framework. The existing site's vanilla HTML/CSS/JS lands here as passthrough, so nothing about how the home page renders changes.
2. **Cuts the `wildatlasapp.com` deploy over from `wildatlas/website/` to this repo.** Same Cloudflare Pages project (`wildatlaswebsite`), repointed at this repo's `main`.

Net new for users: a `/blog/` route with the founder post that was already drafted, and a Buttondown signup form. Everything else looks identical.

### What's in this PR

- `.eleventy.js`, `.eleventyignore`, `package.json`, `package-lock.json` — Eleventy v3 config and deps.
- `_includes/layouts/blog-base.njk` — shared HTML shell for blog routes. Will inherit the main site's CSS once the asset links are uncommented (one-line change, see below).
- `_includes/layouts/post.njk` — post wrapper template.
- `_includes/partials/newsletter-signup.njk` — Buttondown signup form. Placeholder username `wildatlas` — needs replacing with the real handle before merge.
- `blog/index.njk` — `/blog/` listing page, newest-first.
- `content/blog/why-i-built-this.md` — existing post with frontmatter added.
- `wrangler.toml` — Cloudflare Pages config pointed at `_site/`.
- Migrated from `wildatlas/website/`: `index.html`, `css/`, `js/`, `fonts/`, `assets/`, `robots.txt`, `sitemap.xml`. **TODO before merge — copy these files in.** They didn't auto-port because Cowork didn't have access to the wildatlas repo when scaffolding this.
- Updates to `CLAUDE.md`, `README.md` documenting the stack, build commands, and blog authoring flow. `DEPLOY.md` updated to reflect the new build step.

### What needs human action

Two things outside of git:

1. **Buttondown account.** Create the account, replace `wildatlas` in `_includes/partials/newsletter-signup.njk` with the real username (two occurrences in the form `action` and the `onsubmit` popup URL).
2. **Cloudflare Pages dashboard reconfigure.** On the `wildatlaswebsite` project:
   - Disconnect from `wildatlas` repo.
   - Connect to `getwildatlas` repo, watching `main`.
   - Build command: `npm install && npm run build`
   - Build output directory: `_site`
   - Node version env var: `NODE_VERSION=22`
   - Keep the apex domain binding (`wildatlasapp.com`) — that stays on the project, just sources from a different repo now.

Do step 2 **after** this PR merges and the first deploy succeeds on a preview URL.

### Companion PR in `wildatlas`

Once this deploys cleanly, the `wildatlas/website/` directory in the [wildatlas](https://github.com/joshuahvincent/joshuahvincent/wildatlas) repo is dead code. Companion PR there:

- Delete `wildatlas/website/`.
- Update `PetPeeper/CLAUDE.md` "Website Work" section to mark the migration complete.
- Update `PetPeeper/Website/DEPLOY.md` references that still point at the old path.

Mirror-issue pattern per [`getwildatlas` CLAUDE.md "Cross-repo coordination"](../CLAUDE.md#cross-repo-coordination--when-website-work-originates-from-app-side).

### Test plan

Before merge:

1. `npm install && npm run build` locally — should output to `_site/` with no errors.
2. `npm run dev` — eyeball `http://localhost:8081/` (home), `/blog/`, `/blog/why-i-built-this/`. Confirm the home page renders byte-identical to what's live at wildatlasapp.com today.
3. Push to a branch — Cloudflare Pages builds a preview at `https://<branch>.wildatlaswebsite.pages.dev`.
4. Smoke-check the preview:
   - Home page renders correctly across the 5 locales (i18n.js still loads and runs).
   - `/blog/` shows one post.
   - `/blog/why-i-built-this/` renders with the right OG tags (view source).
   - Newsletter signup form posts to `https://buttondown.com/api/emails/embed-subscribe/<username>` (replace placeholder first).
   - Mobile rendering on the blog isn't broken.
5. Uncomment the `<link rel="stylesheet" href="/css/styles.css">` line and font preloads in `_includes/layouts/blog-base.njk` once the migrated CSS is in. Re-eyeball the blog — it should pick up the main site's typography and palette.

### Rollback

If the deploy lands broken after the CF dashboard cutover:

- Immediate: revert the Cloudflare Pages project to its previous deployment via the dashboard (Deployments → previous → "Rollback to this deployment"). That puts the old `wildatlas/website/` build back live in ~10 seconds.
- Then: fix forward in this repo and re-deploy. Don't try to roll back this PR.

The old `wildatlas/website/` files are still in git history in the wildatlas repo even if the companion PR has merged, so worst case they're recoverable.

### Followups (separate PRs, not blocking this one)

- **RSS feed.** ~5 lines of config + a template. Wire up when there are 3+ posts.
- **Blog tag pages** (`/blog/tag/<x>/`). Wire up when tag volume justifies it.
- **Multi-locale blog.** Currently EN-only. Use `eleventy-plugin-i18n` or a directory-based locale scheme when the content team is ready to write in DE/ES/FR/ZH.
- **Sveltia CMS at `/admin/`.** When a second writer needs to author without git. Mounts as a static admin route, GitHub OAuth via free Cloudflare Workers proxy, writes markdown to `content/blog/` for Eleventy to render. Zero rewrite to the existing blog stack.

### Risk

Low-ish. The home page is passthrough so it's not at risk from the Eleventy build. The biggest risk is the CF dashboard reconfigure step (step 2 above) — if the build command or output directory is wrong, the apex serves a broken page. Mitigation: test on a preview URL first; the CF dashboard rollback button is fast.

---

## Optional: split this into two PRs

If you want to reduce risk further, split:

- **PR A — Add Eleventy scaffold + blog** (this repo, doesn't affect what's live). Land it whenever; nothing changes for users. Lets you iterate on the blog before the cutover.
- **PR B — Migrate site files + cut Cloudflare over.** Bigger, riskier, but happens against a known-good Eleventy build.

The combined PR above is fine if you want to ship it as one move. Up to you.
