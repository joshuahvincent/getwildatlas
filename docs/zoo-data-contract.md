# Zoo finder data contract (`/assets/zoos/`)

The Wild Atlas app and `/finder/` both read these static files live, so they are an **app-facing API** (getwildatlas#79, mirror of wildatlas#1179). Source of truth is the `wildatlas-places` D1 database; `scripts/zoos/export_site_data.py` regenerates the files and `scripts/zoos/validate_export.py` checks them before publishing.

## Files

| URL | What |
|---|---|
| `/assets/zoos/manifest.json` | `{schema, places_rev, generated, places, animals}`. Read this first. |
| `/assets/zoos/places.json` | Bare array of places. Kept as a bare array so existing site JS keeps working. |
| `/assets/zoos/animals.json` | `{schema, places_rev, generated, animals:[...], groups:{...}}`: the picker list and the same-group definitions. |
| `/assets/zoos/a/<animal_id>.json` | One file per animal: the places that have (or may have) it. |

## Versioning rules

- `schema` (integer, currently **1**) is in `manifest.json`, `animals.json` and every `a/<id>.json`. Check it before trusting the data.
- Within one `schema`, changes are **additive only**: no key renames or removals, no tuple reordering or meaning changes. A breaking change bumps `schema` and is coordinated with an app release.
- `places_rev` (12 hex characters) is the first 12 characters of the SHA-256 of `places.json`. It is identical in `manifest.json`, `animals.json` and every `a/<id>.json` of one generation. **Rows in `e`, `r`, `g` and `w` address `places.json` by array index.** If a cached animal file's `places_rev` differs from the places file you hold, refetch both; never mix them.
- `places.json` order is stable: the exporter keeps the published order, appends new places at the end, and refuses to drop a published row. Do not insert, reorder or delete rows by hand.
- Publish `places.json`, `animals.json`, `manifest.json` and all changed `a/*.json` together (one commit).

## `places.json` row

`{id, n, t, la, lo, ci, rg, cc, u, ac, ph, cr, un?}`

| Key | Meaning |
|---|---|
| `id` | Stable slug. Wild places start with `wild-`. |
| `n` | Name (as published by the place or Wikidata; not translated). |
| `t` | Type: `zoo`, `aquarium`, `museum`, `farm`, `safari_park`, `wild` (park or reserve). |
| `la`, `lo` | Latitude, longitude (WGS84). |
| `ci`, `rg`, `cc` | Town, region, ISO 3166-1 alpha-2 country. May be empty. |
| `u` | Website; may be empty. |
| `ac` | Accreditation, comma-separated: `AZA`, `CAZA`, `BIAZA`, `EAZA`, `ZAA`, `JAZA`, `WAZA`, `AAM`, `museum`, `none` (farms), `unverified`, `protected-area`, `unesco`. |
| `ph` | `1` if `/assets/zoos/img/<id>.jpg` exists, else `0`. |
| `cr` | Photo credit, `License · Author`; empty when `ph` is `0`. |
| `un` | Present and `1` only for UNESCO World Heritage sites. |

## `a/<animal_id>.json`

`{schema, places_rev, id, name, kind, wild_only, e, r, g, w, group?}`

| Key | Meaning |
|---|---|
| `kind` | `wild` (zoos and aquariums), `dino` (museums), `farm` (farms and petting zoos). |
| `wild_only` | `true` when no zoo or aquarium keeps this animal; show the `w` list only. |
| `e` | Exact matches: `[placeIndex, weak, species, until]`. `weak` is `0`/`1` (`1` = unconfirmed, show "please call ahead"). `species` is the scientific name seen, or empty. `until` is a `YYYY-MM-DD` date after which the row is hidden, or empty. Sorted strong first. |
| `r` | Close relatives: `[placeIndex, via, rationale, weak]`. `via` is the relative's animal id; `rationale` is English text. |
| `g` | Same group, animal probably not there: `[placeIndex, names]` where `names` is up to 3 comma-separated animal ids kept there (empty for farms). |
| `w` | In the wild: `[placeIndex, obs, via]`. `obs` is recorded sightings since 2010 (GBIF); `via` is a relative's animal id or empty. Always indexes places with `t: "wild"`; `e`, `r`, `g` never do. |
| `group` | `{key, label}` for the same-group tier, when the animal has one. |

## Questions from #79

- **Fossil or cast (museums)?** Not recorded. A museum row means the museum's own page names that dinosaur; the data does not say whether it is a real fossil or a cast.
- **Localized names?** No. Place names, group labels, relative rationales and `kind` text are English. Animal ids are the app's ids; the app localizes animal names itself.
- **`generated`?** The date the export ran, not a verification date. Per-row verification dates live in D1 and are not exported. A "Places checked {month}" line should use `generated` as an upper bound only.
- **ETag and Brotli:** provided by Cloudflare Pages and present today.
- **Unknown `a/<id>.json`:** returns `200 text/html` (the homepage) because Pages treats a site without a top-level `404.html` as a single-page app. Clients must treat a non-JSON response as "no data". A real 404 needs a site-wide `404.html`; that changes every unknown URL on wildatlasapp.com, so it is a separate decision.
