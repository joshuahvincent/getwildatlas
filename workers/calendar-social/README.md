# calendar-social

Cron Worker that posts each World Wildlife Calendar day to the Facebook Page, Instagram and X.
Spec: [`docs/CALENDAR_SOCIAL_WORKER.md`](../../docs/CALENDAR_SOCIAL_WORKER.md). No model in the loop.

## How it runs
`*/30 * * * *`; the handler converts to Pacific time and acts only in two windows:
- **06:00–06:29 PT preview** — emails Josh the three captions + images with a one-click skip link.
- **17:30–17:59 PT publish** — FB → IG → X. Idempotent via KV `posted:<date>`; skip via KV `skip:<date>`.

It compares `latest.json`'s `iso` to the Pacific date itself (`isToday` there is baked at UTC build time).
Skips: not today, `featured:false`, `social.json` missing, no images, or fewer than 3 `facts` (emails Josh instead).
A platform failing never blocks the others and is not retried.

## Safe by default
`DRY_RUN = "1"` in `wrangler.toml`: builds + emails everything, posts nothing. Flip to `"0"` only for go-live.

## Setup
```bash
cd workers/calendar-social && npm install
npx wrangler kv namespace create CALENDAR_SOCIAL   # paste id into wrangler.toml
npx wrangler deploy                                 # then set WORKER_ORIGIN to the printed URL, redeploy
for s in META_PAGE_TOKEN META_PAGE_ID IG_USER_ID X_API_KEY X_API_SECRET X_ACCESS_TOKEN X_ACCESS_SECRET KILL_KEY EMAIL_TO; do npx wrangler secret put $s; done
npm test && npm run typecheck
```
Test a day end-to-end: `FORCE_SLUG=world-okapi-day npx wrangler dev --test-scheduled`, then
`curl "localhost:8787/__scheduled?cron=*/30+*+*+*+*"` (only fires inside a PT window — temporarily adjust, or call from a one-off test).

## Open items before go-live
- **`templates.json` greetings are placeholders** built from strategy §5's literal options. Cole writes the three real variants.
- **Banned-vocab list** in `src/caption.ts` is the subset named in `MARKETING_SOCIAL_DISTRIBUTION_AGENT.md`; extend from the Brand Bible.
- **`social.facts`** must be backfilled on each calendar page (`node scripts/propose-social-facts.js`, from the site root) — the Worker refuses to post a day without 3.
- X media upload uses the v1.1 endpoint per the spec; not yet exercised live (X has been migrating media upload to v2 — verify in the dry run).
- Email uses Cloudflare Email Service: onboard `wildatlasapp.com` for Email Sending (dashboard → Email Service) before the preview emails can send.
- Video path (IG first-item, X video-only) is implemented but untested until `assets/calendar-videos/<appId>.mp4` exists.
