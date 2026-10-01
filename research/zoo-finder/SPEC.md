# Spec: "Find a place to see a real ___": `/zoos/` (getwildatlas#38)

**PM:** Prithy · **Build:** Wes · **Copy:** Cole · **Design:** Anna · **Data:** Dr. Nadia · **Approver:** Josh
**Status:** v5, 2026-09-30. Adds the related-animals change Josh asked for ("almost"). Research is starting under his sub-agent approval; the build waits for an explicit "approved".
**Hard deadline:** live and verified before World Hippo Day, **Feb 15 2027** (getwildatlas#39 links to `/zoos/?animal=hippopotamus`). Target merge: **Jan 29 2027**.

## Problem
Every awareness-day post ends with "Find the nearest zoo with hippos →". A parent needs a trustworthy answer to one question: *where near us can we see this animal?* They also need to see it on a map, judge how far each place is, and see what it looks like.

## Findings that shape the build (verified 2026-09-29)
1. **Unknown paths on wildatlasapp.com return 200 with the homepage.** The hippo button would fail silently. Fix: a build check that fails if a post links `/zoos/?animal=X` and X has no data.
2. **The octopus ID doesn't match the app.** The app ID is `octopus`; the prototype uses `giant-pacific-octopus`. We key everything on the app's 216 IDs. Dr. Nadia confirms the app's octopus is the giant Pacific octopus.
3. **The prototype's "read our story" links point to posts that aren't on `main`.** The prototype also leaves out 7 places the research already verified.
4. **The privacy policy doesn't mention the site's Google Analytics.** This page is the site's first location feature.

## Scope: which animals, which places
| App packs | Count | Place type shown | Qualifying bar |
|---|---|---|---|
| Safari, Ocean, Rainforest, Feathered, Reptile, Wild Americas, Planet Pioneers | 126 | **Zoos + aquariums** | Accredited (AZA, CAZA, BIAZA, EAZA, ZAA, JAZA) and the species confirmed on site in the last 12 months |
| Dino Roars | 18 | **Museums** with a real fossil or cast of that dinosaur | Public natural-history museum; the specimen confirmed on the museum's own page |
| Farm Friends | 18 | **Petting zoos / open farms** | Open to the public, with the animal listed on the farm's own site or map listing. No accreditor exists, so each card says "Not accredited: check ahead" |
| Happy Hounds, Cool Cats, Cozy Critters | 54 | Left out (breeds and pets) | — |

## The page (mobile-first, top to bottom)
1. **Animal picker** (prefilled from `?animal=`) and a **location control**: "Use my location" (browser prompt only on tap) **or** a typed city/postcode, looked up in the browser from bundled open data (GeoNames + national postcode centroids, lazy-loaded per country). The typed text is never sent anywhere.
2. **Distance filter chips.** **No limit** is the default. Within 5 · 10 · 20 · 50 · 150 mi · No limit.
3. **Map with pins**, list/map toggle on phones, side by side on desktop. It shows a "you are here" dot once location is known. **Tapping a pin opens a card** with the name, town, distance from the parent, accreditation and a "Learn more" link.
4. **Result cards** in the same order as the pins (nearest first once location is known, otherwise grouped by region). Each card has a **Wikimedia photo**, name, place type, town, distance, accreditation badge and a "Check before you visit" link. Tapping a card highlights its pin, and tapping a pin scrolls to its card.
5. **Check-ahead notice** (Josh, 2026-09-30), shown above the results and repeated in each pin card as a short line. Draft for Cole: "Animals move between zoos, museums and aquariums, so this list may not be up to date. Please check with the place before you visit to make sure the animal still lives there." It's always visible, never tucked behind a tooltip.
6. **Empty and far states.** No places within the chosen distance: "Nothing within 20 miles. Try a wider search." Nearest place over 150 mi or 250 km: "The closest one we know about is X away." Location denied: the full list, with no scolding.
7. **"In the wild" note** per wild animal, e.g. "Hippos live wild in African rivers; a guided safari is the way to see them." It names no tour operators.
8. **Footer:** data freshness ("Places checked [month]"), attribution for the map, place names and photos, and an App Store link (`ct=find_a_zoo`).

Units: miles for en-US only, km everywhere else. English only in v1. Indexed and added to `sitemap.xml`.

## Data
- `_data/places.json`: one record per place, with `id`, `type` (zoo/aquarium/museum/farm), name, town, country, lat/lng, url, `accreditation`, image, rating reference and `last_verified`.
- `_data/holdings.json`: one record per place × animal, with `source_url`, `confidence` and `last_verified`. No individual animal names.
- **Sourcing** (approved: parallel research sub-agents). The **126 wild species** are researched by pack, 18 species per batch, one sub-agent per pack, so 7 agents plus a merge and validation pass. Dr. Nadia spot-checks at least 10% of each batch. The **18 dinosaurs** are one museum batch. **Farms** come from OpenStreetMap (`zoo=petting_zoo` and open farms), pulled at build time, with Dr. Nadia spot-checking large regions. OSM coverage is uneven, which I haven't measured yet.
- **Launch bar:** at least 3 verified places per covered animal. Below that, the page says "We're still checking" and shows the nearest accredited zoos.
- **Freshness:** quarterly re-sweep, monthly for short-lived or released species (octopus), and 2 weeks before any post links here. The build warns on stale records but never fails on them, so the daily scheduled-post rebuild is never blocked.

## Data store and liveness (Josh, 2026-09-30)
- **One source of truth, in git.** `research/zoo-finder/` in the website repo stores `places`, `holdings`, `groups`, `relatives` and `aliases` (per-animal name lists in 4 languages) as reviewed JSON. It's excluded from the site build. A build step compiles it into `_data/` for the page.
  - **Why git over a hosted database:** every change is a reviewable diff with history, costs nothing, and needs no new service or keys. Rollback is a revert.
  - Revisit D1 only if we add parent-submitted corrections.
- **We never re-scrape what we already know.** New research only fills gaps and handles flagged rows. Raw page copies aren't stored, because of copyright; each row keeps its source URL, a ≤25-word evidence note, and a **fingerprint** of the source page.
- **Every holding carries:** `first_seen`, `last_verified`, `verified_by` (agent batch or person), `source_url`, `source_fingerprint`, `check_status` (ok, changed, gone or needs_review) and `next_due`.
- **Liveness check, automated, monthly** (GitHub Actions, scheduled; read-only):
  1. Fetch each source URL. A 404 or 410, or a redirect to the homepage, → `gone`.
  2. Check that the animal's name or any alias still appears on the page. If not → `needs_review`.
  3. Compare the fingerprint of the page's animal-related text. If it differs → `changed`. That isn't necessarily bad, but it moves the row up the queue.
  4. Also check the place itself: a closure notice, or loss of accreditation against the AZA, EAZA and other member lists (EAZA publishes a data file).
  - Output: one GitHub issue per run listing the flagged rows. **Nothing is auto-deleted.** A person or an approved re-verify agent decides.
  - A site that blocks automated fetches is marked `unchecked`, not `gone`.
- **Re-verification cadence:** every row gets a full re-verify **annually** (`next_due` = `last_verified` + 12 months). Flagged rows are re-verified within 30 days. Short-lived or released species (octopus) are re-verified every quarter. So is any animal 2 weeks before a post links to it.
- **What the page shows:** a row flagged `gone` is hidden from the page right away. A row that is `changed`, `needs_review` or `unchecked` stays visible (the check-ahead notice covers it), until it's resolved or 60 days pass.

## Evidence tiers and the call-ahead notice (Josh, 2026-10-01)
Err on the side of inclusion. Every holding carries `evidence_tier`:
- **strong** (~5,150 rows): the place's own animal page, or a listing, clearly names the animal.
- **weak** (~760 rows): the page mentions the animal but doesn't clearly say it's on show (a news story, an adoption page, a thin title match). About 40% of these are probably wrong, and Josh accepted that.
- Weak rows **rank below strong rows within the same match tier** and carry an "Unconfirmed: please call ahead" label on the card. Rows whose page says the animal **moved, died or isn't on view** are still excluded.
- The **call-ahead notice** (above the results and in every pin card) is stronger wording on any list that includes weak rows: *"Some places listed here are unconfirmed. Please call ahead to check the animal is there."*
- The monthly liveness check and the annual re-verify promote weak rows to strong (the page is re-read for a species listing) or drop them.

## Farms and petting zoos (Josh, 2026-09-30)
- **Source:** OpenStreetMap via Overpass (`zoo=petting_zoo`, plus `tourism=zoo` with a farm-like name), pulled by `tools/farms.py` into `raw/farms_osm.json`. US, CA, GB, IE, AU, NZ, DE, FR and ES to start. OSM coverage is uneven; Ireland returned only 8.
- **Stored as `type='farm'`, accreditation `none`**, so cards say "Not accredited: please check ahead".
- **Species are rarely known.** For Farm Friends animals the farm appears in the **same-group tier** ("Farm / petting zoo: animals vary, call ahead"). A later pass can crawl farm websites for farm-animal names.

## Rules that don't change
- **Privacy.** The parent's coordinates never go into our URL, GA, cookies or storage, and GA gets no location events. The policy edit ships with the page (approved). The map and tiles are served from our own domain, so no third party is involved. Before launch, Wes confirms that Cloudflare keeps no per-visitor tile-request logs we can read. That's needed to keep the policy sentence accurate.
- **Partners.** Everyone gets the same treatment: no featured pins and no "partner" badges. Vancouver and Birch look like everyone else. Placement deals go through Oskar + Josh with a visible label.
- **Copy** by Cole, with a child-psych pass. Parents are the audience.

## ✔ Decisions (Josh, 2026-09-30)
1. **Map:** self-hosted OpenStreetMap-based vector map (MapLibre GL + Protomaps tiles, served from our own domain). No third party and **no ratings**. The accreditation badge sits where stars would be. The privacy promise holds: your location never leaves your browser.
2. **Images:** a Wikimedia Commons photo of each place, hosted by us, with a credit line. No logos. If there's no free photo, the card shows a neutral place-type illustration.
3. **Distance:** cumulative chips, **Within 5 · 10 · 20 · 50 · 150 mi · No limit** (km: 10 · 15 · 30 · 80 · 250). The default is **No limit**.

4. **Related-animal matches.** A place that doesn't have the animal can still appear if it has a close relative. Its card says so plainly, e.g. "No hippos here, but you can meet their cousin, the pygmy hippo." For museums: "No T. rex here, but you can see its relative, Albertosaurus."
   - **"Related" comes from a curated list, never an algorithm.** Dr. Nadia sets 1–5 relatives per animal, at the same genus or family (the same clade for dinosaurs). The list can't come from name matching: a red panda is *not* related to a giant panda.
   - **Exact matches always rank above related ones** within a distance band. Related pins are a different, lighter pin style, with a legend.
   - A related holding is verified to the same bar as an exact one.
   - **Only exact matches count toward the launch bar** of at least 3 per animal. If an animal has no exact match nearby, related ones fill in rather than showing an empty state.
   - Data: `holdings.json` gains `match: exact | related` plus `via_animal` (the relative that's actually there).
5. **Same-group matches** (Josh, 2026-09-30). A place with animals from the same broad group, but neither the exact animal nor a close relative, is still listed. It ranks **below** exact and related matches, and says plainly that the animal probably isn't there. Examples: "Has other dinosaur fossils. The Stegosaurus may not be here." / "Has other big cats. We couldn't confirm snow leopards here."
   - **Ranking inside each distance band:** exact → related → same group, then by distance. The distance filter still applies to all three.
   - **Groups are a small hand-curated list**, one per animal (e.g. dinosaurs, big cats, bears, whales & dolphins, sharks & rays, primates, penguins, birds of prey, crocodilians, snakes). Dr. Nadia signs off on it. This tier is **computed from data we already verify**: a place qualifies if it has a verified holding of any animal in the group. It needs no extra research and no weaker evidence.
   - **Pins get 3 styles:** solid for exact, lighter for related, outline for same group. A legend explains them.
   - Same-group places never count toward the launch bar. In the list they're collapsed under a "More places with [dinosaurs]" expander when exact or related matches exist, and shown directly when they don't.

## Acceptance
- Hippo and octopus render from real data. An unknown `?animal` falls back to the picker, and the build fails on a dead `/zoos/?animal=X` link.
- DevTools shows no request carrying the parent's coordinates or typed text.
- Distances are right for 3 known city pairs, and each band filters correctly.
- Pins and cards stay in sync. The page works by keyboard and with a screen reader, and there's no horizontal scroll at 375 px.
- The farm and museum types each work for at least one animal.
- The check-ahead notice is visible above the results and in every pin card.
- Same-group cards rank last, say the animal may not be there, and use the outline pin.
- Related cards show the "No X here, but…" note, a different pin style, and rank below exact matches.
- Josh approves the preview URL before anything merges to `main`.

## Sequence
Josh signs off v4 → the 7 wild batches + 1 museum batch run in parallel, then the farm OSM pull → Anna designs, Cole writes → Wes builds on `preview/zoo-finder` (a separate worktree) → Dr. Nadia spot-checks → Josh reviews the preview → merge by Jan 29 → #39 unblocked.
