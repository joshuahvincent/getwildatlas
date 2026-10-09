# Calendar Social Worker — Claude Code task spec

Owner: Josh. Written 2026-10-09 from the strategy in
`~/Documents/Claude/Projects/Wild Atlas/marketing/conservation-calendar/Social_Post_Routine_Strategy.md`.

## Goal

A Cloudflare Worker on a cron schedule that, on each World Wildlife Calendar day, publishes one post per channel (Facebook Page, Instagram, X) for that day's animal — images from the animal's `/calendar/<slug>/` page, facts copied verbatim from the page, UTM'd App Store link — with a same-morning email preview and a kill switch. No model in the loop; it's a deterministic script.

Facts copied verbatim from a live calendar page are already past the naturalist + child-psych gates, so nothing in this path needs per-post review.

## Why a separate Worker

Pages Functions (`functions/`) cannot run on cron. This is a standalone Worker with its own `wrangler.toml`, living in this repo so it deploys next to the site and reads the same build output. Path: `workers/calendar-social/`.

## Accounts and IDs (already exist)

| | |
|---|---|
| Facebook Page | **Wild Atlas**, ID `61595239020717`, created 2026-10-08 |
| Instagram | `@wildatlas.app`, Professional, linked to the Page, in business portfolio "Wild Atlas" |
| X | developer account exists with ~$500 pay-per-use credit. Handle: TBD — ask Josh |
| App Store | `https://apps.apple.com/us/app/wild-atlas/id6761081031` |
| Calendar feed | `https://wildatlasapp.com/calendar/latest.json` → `{latest:{day,animal,iso,url,image,featured,isToday}, next:{…}}` |
| Schedule source | `_data/animalDays.json` (53 days; `appId`, `official`, `slug`) |

## Phase 1 — site: emit `social.json` per calendar page (Eleventy)

Add a paginated template that writes `/calendar/<slug>/social.json` for every page in `collections.calendarPage`:

```json
{
  "slug": "world-octopus-day",
  "day": "World Octopus Day",
  "official": true,
  "animal": "giant Pacific octopus",
  "article": "a",
  "appId": "octopus",
  "pack": "Ocean Creatures",
  "campaign": "world_octopus_day_2026",
  "greeting": "Happy World Octopus Day! October 8 — the eighth day of the month, for an animal with eight arms.",
  "facts": ["It has three hearts.", "Its blood is blue.", "It has one big brain plus a mini-brain in every arm — nine \"brains\" altogether."],
  "images": [
    {"src": "https://wildatlasapp.com/assets/blog/world-octopus-day/cover.jpg", "alt": "…"},
    {"src": "…/scale.jpg", "alt": "…"},
    {"src": "…/hatchling.jpg", "alt": "…"}
  ],
  "video": "https://wildatlasapp.com/assets/calendar-videos/octopus.mp4",
  "pageUrl": "https://wildatlasapp.com/calendar/world-octopus-day/",
  "appUrl": "https://apps.apple.com/us/app/wild-atlas/id6761081031?ct=world_octopus_day_2026"
}
```

Sources in front matter: `animalDay.greeting` (strip markdown bold), `animalDay.animalName`, `animalDay.animalArticle`, `animalDay.campaign`, `animalDay.appCta` (extract pack name), figures via the `{% figure %}` shortcode (src + alt, in page order, cover first). `facts`: the first three sentences in the body that are bolded or contain a number — or simpler: add an explicit `social.facts: [...]` array to front matter and backfill the 117 pages with a one-off script that proposes three and Josh approves in bulk. Prefer the explicit array; it's reviewable.

`video` is null until the batch exists (section 9 of the strategy doc). The Worker treats null as "photos only".

Also fix: calendar pages emit the generic `/assets/og-image.png`. Set `og:image` to the page cover.

## Phase 2 — Meta app + tokens (Josh does this in the browser, Claude Code documents it)

1. developers.facebook.com → Create app → type **Business**, connect to business portfolio "Wild Atlas".
2. Add products: **Facebook Login for Business**, **Instagram Graph API**.
3. Permissions needed: `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`, `business_management`.
4. Stay in **Development mode**. Josh is admin on the app, the Page and the IG account, so Development mode is enough to publish to our own assets — no App Review, no Business Verification.
5. Graph API Explorer → generate a User token with the above scopes → exchange for a long-lived user token (60 d) → `GET /me/accounts` → take the Page's `access_token` (**Page tokens from a long-lived user token do not expire**). Store as `META_PAGE_TOKEN`.
6. `GET /{page-id}?fields=instagram_business_account` → store the IG user ID as `IG_USER_ID`. The Page token works for IG publishing.
7. `META_PAGE_ID=61595239020717`.

## Phase 3 — X app (Josh in the browser)

developer.x.com → the existing project/app → User authentication settings: OAuth 1.0a **and** OAuth 2.0, app permissions **Read and write**. Generate: API key/secret, Access token/secret (OAuth 1.0a, needed for media upload v1.1). Store as `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`. Cost: $0.015/post, $0.20 with a link. Budget is a non-issue.

## Phase 4 — the Worker (`workers/calendar-social/`)

```
workers/calendar-social/
  wrangler.toml      # name, crons, KV binding, secrets listed as comments
  src/index.ts       # scheduled() handler + fetch() for the kill-switch route
  src/meta.ts        # FB photo upload, FB multi-photo post, IG carousel container flow
  src/x.ts           # OAuth1 signing, media/upload (chunked for video), POST /2/tweets
  src/caption.ts     # template fill, platform limits, banned-vocab regex
  src/email.ts       # preview email via MailChannels or Resend
  templates.json     # Cole's 3×2 caption variants (see strategy §5)
  README.md
```

**Crons (UTC; PT is −7/−8):**
- `0 13 * * *` (06:00 PT) — **preview**: fetch `latest.json`; if `!latest.isToday` exit. Else fetch `social.json`, build all three captions, send Josh an email with images inline and one link: `https://<worker>/skip?date=YYYY-MM-DD&key=<KILL_KEY>`. Write `preview:<date>` to KV.
- `30 0 * * *` next day… no: `30 0` UTC is 17:30 PT **the same day** only in winter. Use two cron lines and check `isToday` in-handler, or compute PT in the handler and run hourly `0 * * * *` checking `hour === 17 && minute >= 30`. Simplest: run `*/30 * * * *`, compute PT time in handler, act only in the 17:30–17:59 PT window and only if `posted:<date>` is unset. Idempotent by design.
- **publish** step: if KV `skip:<date>` exists → log and exit. Else post to FB, IG, X in that order, write `posted:<date>` = JSON of post IDs/URLs, append a line to KV `log`.

**Skip rules:** `latest.featured === false` → skip (lite pages, no app animal). `social.json` 404 or `<1` image → don't post, email Josh. Any platform fails → post the others, email the failure, don't retry (next day's run won't retry either — it checks `isToday`).

**Captions:** fill from `templates.json`, rotate variant by `dayIndex % 3`. Platform rules: FB = full text + both links. IG = full text, no URLs (say "link in bio"), 5 hashtags, carousel items: video first if present, then images in order. X = ≤280 chars: greeting + `facts[0]` + App Store link only; media = video alone if present, else up to 4 images. Pre-flight regex from `PetPeeper/docs/agents/MARKETING_SOCIAL_DISTRIBUTION_AGENT.md` (banned vocab, competitor names) — fail closed.

**Meta API calls:**
- FB multi-photo post: `POST /{page-id}/photos` per image with `published=false` → ids; `POST /{page-id}/feed` with `message` + `attached_media=[{media_fbid}…]`.
- FB video: `POST /{page-id}/videos` with `file_url` (video can't be in the same post as photos on FB via API either; post video as a separate post 30 min later, or skip video on FB in v1). **v1: FB = photos only.**
- IG carousel: `POST /{ig-user-id}/media` per item (`image_url` or `video_url` + `media_type=VIDEO`, `is_carousel_item=true`) → `POST /{ig-user-id}/media` with `media_type=CAROUSEL`, `children=[…]`, `caption` → poll container `status_code` until `FINISHED` → `POST /{ig-user-id}/media_publish`. Media must be at a public URL — it is.
- Long-lived Page token doesn't expire; still catch `code 190` and email Josh.

**X API calls:** OAuth 1.0a user context. `POST https://upload.twitter.com/1.1/media/upload.json` (INIT/APPEND/FINALIZE for video, simple upload for images) → `POST https://api.x.com/2/tweets` with `text` + `media.media_ids`.

**Secrets** (`wrangler secret put`): `META_PAGE_TOKEN`, `META_PAGE_ID`, `IG_USER_ID`, `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`, `KILL_KEY`, `EMAIL_TO=josh@wildatlasapp.com`, email provider key. Never in the repo.

**KV namespace:** `CALENDAR_SOCIAL` — keys `preview:<date>`, `skip:<date>`, `posted:<date>`, `log`.

## Phase 5 — dry run and go-live

1. `wrangler dev --test-scheduled` against a `DRY_RUN=1` env that builds everything and emails but doesn't post.
2. Manual trigger on a non-calendar day with `FORCE_SLUG=world-okapi-day` to exercise the full path to all three platforms, then delete the posts.
3. First live run: **International Sloth Day, Oct 20** (Okapi on Oct 18 falls before Phase 2 is likely done; if it's done, use Okapi).
4. Add a weekly Claude scheduled task (cloud) that reads KV `log` and reports failures — that's the only ongoing monitoring.

## Already posted by hand (don't repost)

- 2026-10-08 World Octopus Day: FB post + IG carousel live. X: not posted.

## Out of scope for this task

- Video rendering (Mac mini batch; strategy §9) — Worker just honours `video` when present.
- Newsletter / blog — Josh: not wanted.
- TikTok.
