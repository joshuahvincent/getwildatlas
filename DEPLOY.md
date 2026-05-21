# Wild Atlas — Website Deploy Process

**The whole rule, in one line:** commit to `main`, push, Cloudflare auto-deploys in ~60 seconds.

This is a website, not an iOS app. No App Store review, no audio pipeline, no migration safety. If something looks wrong, the fix is another commit. Optimize for ship-speed, not approval gates.

## Where the site deploys from (today)

| When | Source path | Repo | Cloudflare Pages project |
|---|---|---|---|
| Until [getwildatlas#2](https://github.com/joshuahvincent/getwildatlas/issues/2) cuts over | `wildatlas/website/` | [`wildatlas`](https://github.com/joshuahvincent/wildatlas) | `wildatlaswebsite` |
| After the migration | `Website/` (this repo, at the root) | [`getwildatlas`](https://github.com/joshuahvincent/getwildatlas) | same project, re-wired |

The Cloudflare Pages project is bound to the apex hostname (`wildatlasapp.com`). It watches `main` and rebuilds on every push.

## The default flow

```bash
# 1. Be on main
git checkout main
git pull --rebase

# 2. Make changes (or accept changes Cowork prepared)

# 3. Stage and commit
git add <changed files>
git commit -m "website: <what you changed>"

# 4. Ship
git push origin main
```

That's it. Cloudflare picks it up automatically. Watch the build in the [Cloudflare dashboard](https://dash.cloudflare.com) under Pages → `wildatlaswebsite` → Deployments, or just hard-refresh `wildatlasapp.com` after 60–90 seconds.

## Preview gate (optional, for bigger or riskier changes)

When the change is substantial enough that you want to eyeball it on a real URL before shipping to the apex domain:

```bash
git checkout -b preview/<name>
git add ...
git commit -m "..."
git push -u origin preview/<name>
```

Cloudflare Pages will build a per-branch preview at `https://<branch-name>.wildatlaswebsite.pages.dev`. Open it, scan it across pages and locales, then either:

- **Merge to main** when good (PR optional — squash or fast-forward, your call), or
- **Push another commit** to the same branch if something's off.

Don't leave preview branches lingering — when the change ships, delete the branch.

## After deploy — what to check

Quick visual scan, doesn't need to be exhaustive:

1. **`wildatlasapp.com/`** — home page top-to-bottom on a hard refresh.
2. **`/about`, `/privacy`, `/terms`** — load and render.
3. **Language picker** — flip to one non-EN locale (DE is the fastest sanity check) and confirm nothing snaps to placeholder text. The boot-time `[i18n]` console warning will surface missing keys if any.
4. **Social cards** — when changes touched `<head>` meta, run [Twitter Card Validator](https://cards-dev.twitter.com/validator) and [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) to refresh OG previews.

## Rollback

There is no rollback button. If a deploy ships something broken, push the fix as the next commit:

```bash
git revert HEAD       # or fix the file directly
git push origin main
```

Cloudflare will redeploy in another ~60s. The bad version was live for 1–2 minutes. That's the cost of moving fast on a static site, and it's acceptable.

If a deploy is catastrophically broken and you need it gone *now* rather than in 60s, the Cloudflare Pages dashboard lets you roll back to a previous deployment manually (Deployments → previous build → "Rollback to this deployment"). Use sparingly.

## Things that are *not* part of this process

- **No PR review required.** Solo founder, single contributor. When that changes, add review.
- **No integration branch.** The `codex/mainline-integration → main` flow in the wildatlas repo is for iOS app safety. The website doesn't have those failure modes.
- **No release notes.** Commit message is the release note. Keep them descriptive.
- **No staging environment.** Per-branch previews are the staging environment.

## After the `getwildatlas#2` migration

When the Cloudflare Pages project is re-wired to deploy from this repo (`getwildatlas`) instead of `wildatlas/website/`:

1. This document moves with the source — already lives in this repo, ready.
2. Edit `Website/CLAUDE.md` to mark the migration complete.
3. Edit `WORKSPACE.md` at the workspace root to update "live site source" pointer.
4. The deploy process itself — commit to main, push, auto-deploy — does not change.
