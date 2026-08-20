# Wild Atlas — Website Deploy Process

**The whole rule, in one line:** commit to `main`, push, Cloudflare auto-deploys in ~60 seconds.

This is a website, not an iOS app. No App Store review, no audio pipeline, no migration safety. If something looks wrong, the fix is another commit. Optimize for ship-speed, not approval gates.

## Where the site deploys from (today)

| Source path | Repo | Branch | Cloudflare Pages project |
|---|---|---|---|
| repo root | [`getwildatlas`](https://github.com/joshuahvincent/getwildatlas) | `main` | `wildatlaswebsite` |

The migration off `wildatlas/website/` is **complete** — [getwildatlas#2](https://github.com/joshuahvincent/getwildatlas/issues/2) closed 2026-05-21. This repo is the only source of `wildatlasapp.com`; there is nothing left to cut over.

If you ever need to re-confirm that from scratch, the cheap check is a short link that exists *only* in this repo's `_redirects`:

```bash
curl -sI https://wildatlasapp.com/kids | head -n1
```

`301` → this repo is live. `404` → the Pages project has been re-pointed somewhere else, go look at the dashboard.

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

## Creator campaign landing pages

Short links an influencer drops in a story sticker — `wildatlasapp.com/<slug>`.
Each one hands the visitor an App Store link plus an offer code, and reports to GA4.

**Adding a creator is a data edit, not a code change.** Append one entry to the
`creators` array in [`_data/creators.json`](_data/creators.json); `creator-link.njk`
generates `/<slug>/` on the next build. Never copy the template.

```json
{
  "slug": "somebody",
  "creator": "somebody_handle",
  "channel": "instagram",
  "campaignToken": "somebody-ig-sep26",
  "code": "SOMEBODYCODE",
  "packName": "Dino Roars",
  "headline": "@somebody_handle sent you.",
  "subhead": "Here's a free dinosaur pack for your explorers."
}
```

One slug per **channel**, not per creator — that's what makes Instagram and TikTok
traffic separable in GA4 and in App Store Connect.

Notes:

- **`providerToken` is set once, at the top of the file**, not per creator. It comes
  back in the campaign URL Apple generates in App Store Connect (Analytics →
  Acquisition → Campaigns) and is the same value for every campaign. While it is
  empty, every page falls back to the plain product URL — deliberately, so we never
  ship a malformed `?pt=&ct=` link.
- These pages are `noindex, nofollow` and are excluded from collections. `sitemap.xml`
  is hand-maintained — **do not add creator slugs to it.**
- Offer codes are generated in App Store Connect against the non-consumable IAP.
