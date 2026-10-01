# Zoo-finder research brief v2 (full sweep, 2026-09-30)

This supersedes `raw/BRIEF.md`. The hard rules there still apply: evidence or nothing, coordinates from Wikidata or OSM (never estimated), Wikimedia Commons images only (no logos), no individual animal names, curated related matches only, and generic app entries count for any species in the group.

## New rules, learned from the pilot
1. **Do not spawn sub-agents.** Do all the work yourself. Josh approves every agent, and nested agents aren't approved.
2. **Write to disk as you go.** Save your output JSON after every ~10 places, so a crash or time-out loses almost nothing. Your final reply is a summary only; the data lives in the file.
3. **Use a browser when a site blocks scripts.** About 40% of US zoo sites return 403 to curl. Use the built-in browser tools (`mcp__Claude_Browser__*`: navigate, get_page_text) when curl is blocked. Don't skip the site.
4. **Crawl each place once and match every animal.** Prefer the site's sitemap or its "animals" index; open species pages as needed. Reject pages that say "not currently on view", "has moved" or "in memoriam", or that redirect to a generic page.
5. **A missing animal is not an absence.** Many sites list only featured animals. Record what you can confirm; never record "doesn't have X".
6. **Raw captures go to R2**, the private bucket `wildatlas-places-cache`. Upload each page's extracted text (not images) you relied on:
   ```
   WR="/Users/joshuahv/Documents/Codex Projects/analytics-worker/node_modules/.bin/wrangler"
   "$WR" r2 object put "wildatlas-places-cache/sweep-2026-10/<your-batch>/<place-id>/<slug>.txt" --file <local.txt> --remote
   ```
   Run wrangler from your scratch dir, NOT from inside analytics-worker/, and never edit any wrangler config. Log each capture in your output's `fetches` array: url, fetched_at, http_status, method (curl, browser or search_snippet), r2_key, and sha256 of the text as `fingerprint`.
7. **Never write to D1** (the `wildatlas-places` database). Prithy validates and loads it.
8. **Name matching:** use `research/zoo-finder/raw/*.animals.json` (app `id`, common and scientific names). Also match German, French and Spanish common names and obvious synonyms (e.g. "river hippopotamus" = hippopotamus; "Nilpferd"/"Flusspferd"; "hippopotame"). Look-alikes are not matches (e.g. a Mantella is not a poison dart frog).
9. **Work only inside your assigned files**, `research/zoo-finder/raw/sweep_<batch>.json`, plus a scratch dir under `research/zoo-finder/cache_local/<batch>/` (gitignored). Don't touch anything else in either repo. Don't contact anyone and don't submit forms.

Root for all paths: `/Users/joshuahv/Documents/Codex Projects/getwildatlas/.claude/worktrees/zoo-finder/`

## Sweep output: `raw/sweep_<batch>.json`
The same shape as the pilot files (`places`, `holdings`, `notes_per_animal`, `stats`, `method_notes`), plus a `fetches` array. Reuse place `id`s from `raw/roster.json` exactly. Set `stats.minutes_spent_estimate` honestly.
