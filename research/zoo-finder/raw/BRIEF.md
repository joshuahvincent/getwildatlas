# Zoo-finder research brief (shared by all research agents)

Context: Wild Atlas (kids' animal app) is building wildatlasapp.com/zoos/. A parent picks an animal and sees nearby places where the family can see it for real. Parents are the audience. Wrong data costs trust, so **precision beats coverage**. Leave a row out rather than guess.

## Hard rules
1. **Evidence or nothing.** Every holding needs a `source_url` you actually fetched or saw in search results, from the institution's own site where possible, dated or live in 2025–2026. Record what the page says in `evidence` (≤ 25 words, paraphrased, no long quotes).
2. **Qualifying places.**
   - Zoos and aquariums: accredited by AZA, CAZA, BIAZA, EAZA, ZAA or JAZA. Verify against the accreditor's member list and record it in `accreditation`. If you can't confirm accreditation, set `accreditation: "unverified"`. Never list roadside or private exotic-animal attractions.
   - Museums: public natural-history museums.
3. **Coordinates.** Take coordinates from Wikidata P625 (record the Q-id) or OpenStreetMap. Never estimate them. Record `coord_source`.
4. **Images.** Find a Wikimedia Commons photo of the place (Wikidata P18 or a Commons category). Record `image_file` (a Commons file title), `image_license` and `image_author`. If there's no free photo, use null. Never use logos or the institution's own photos.
5. **No individual animal names.** This is species-level only.
6. **Related matches.** If a place lacks the exact animal but has a *close relative* (same genus or family; same clade for dinosaurs), you may record it with `match: "related"` and `via` set to the relative's common and scientific names. Never pair on name similarity: a red panda is NOT a relative of a giant panda. Put `related_rationale` in 1 line.
7. **Generic app entries** (e.g. "Rhinoceros", "Dolphin", "Jellyfish", "Parrot", "Viper", "Lemur", "Gecko") count as an exact match for **any** species in that group. Record the actual species in `species_seen`.
8. **Animals not kept in human care** (e.g. blue whale, giant squid, narwhal) should be flagged in `notes_per_animal` with `wild_only: true`. Where they exist, suggest related or museum-specimen places (e.g. a preserved giant squid at a natural-history museum, recorded as `type: "museum"`).
9. **Geography priority:** USA (spread across all regions), Canada, UK and Ireland, Germany, France, Spain, Australia and NZ. Other countries only if notable.
10. **Read-only everywhere.** Don't write anywhere except your one output file. Don't contact anyone.

## Output: one JSON file at the path given in your prompt
```json
{
  "batch": "<name>", "researched": "2026-09-30", "method": "<species-centric|institution-centric|museum>",
  "places": [ { "id": "kebab-slug", "name": "", "type": "zoo|aquarium|museum", "town": "", "region": "", "country": "ISO2",
                "lat": 0, "lng": 0, "coord_source": "wikidata:Q…|osm:…", "url": "https://official site",
                "accreditation": "AZA|CAZA|BIAZA|EAZA|ZAA|JAZA|museum|unverified", "accreditation_source": "url",
                "image_file": "File:….jpg|null", "image_license": "", "image_author": "" } ],
  "holdings": [ { "place_id": "", "animal_id": "<app id>", "match": "exact|related", "species_seen": "scientific name",
                  "via": null, "related_rationale": null, "source_url": "", "evidence": "", "confidence": "HIGH|MED" } ],
  "notes_per_animal": { "<app id>": { "wild_only": false, "in_the_wild": "one line: where it lives wild", "caveats": "" } },
  "stats": { "places": 0, "holdings_exact": 0, "holdings_related": 0, "minutes_spent_estimate": 0, "urls_fetched": 0, "blocked_urls": 0 },
  "method_notes": "what worked, what was slow or blocked, and how you'd scale this to ~600 institutions"
}
```
Confidence: HIGH = the institution's own current page lists the species. MED = a 2025–2026 secondary source says it's there. Anything weaker is left out.
