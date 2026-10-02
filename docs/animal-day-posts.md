# Awareness-day animal posts

Every conservation-calendar animal post, such as World Hippo Day or World Elephant Day, uses `layout: layouts/animal-day.njk`, so they all look the same. The reference post is `content/blog/world-hippo-day.md`: copy it and change the content, not the structure.

## Page order (fixed by the layout)
1. Greeting (`animalDay.greeting`): names the day and explains why it's today.
2. Read-aloud note (`animalDay.readAloudNote`).
3. **Story**: the markdown body. Short read-aloud sentences, "Can you…?" prompts, 4–5 wow facts. Use images with `{% figure "/assets/blog/<slug>/<file>.jpg", "Alt text", "optional caption" %}`. Order: action shot → scale diagram → weight diagram → baby.
4. **Where to see** (`animalDay.whereToSee`): an intro about the wild habitat, the find-a-zoo button (`findLabel` plus `animalId`), `groups` of place cards (North America / Around the world), an optional `cousin` card, and a `note`. UTM tags are added automatically from `animalDay.campaign`.
5. **For grown-ups** (`animalDay.grownups`, markdown): the conservation status with the hopeful story, one family hope action, 2–3 conversation starters, and the hardest kid question answered.
6. **Keep exploring**: `appCta` text, then the App Store link (`?ct=<campaign>`), then an optional `source` link.

## Rules
- `status: scheduled` plus the calendar `date`. It stays hidden until Josh replies "approve" to the T-5 review email (see `.github/workflows/blog-review.yml`).
- Content must pass the naturalist and child-psych gates before it's committed.
- Named zoo animals and holdings must be re-verified the week of publishing, since animals move.
- Images live in `assets/blog/<slug>/`, as JPEGs at most 1400px wide. Use app art for animals in the app.
- `campaign`: `<day_snake_case>_<year>`, e.g. `world_hippo_day_2027`.

## Where-to-see map

The "Where to see" section shows a map: `{% placesMap %}`, see `docs/places-map.md`.

- **Place cards:** each one becomes a pin. Mark wild-viewing spots (whale-watch waters, refuges, national parks) with `wild: true` so they get the teal "In the wild" pin.
- **Reserves:** the map also adds national parks and reserves for the page's animal from the zoo finder's data (`assets/zoos/a/<animalId>.json`, the `w` list). The animal is the page's `animalDay.animalId`, or `appId` if that isn't set.
- **Turning reserves off:** set `whereToSee.wildPlaces: false` when that data is wrong for the page's species or subspecies, or mixes up land and sea. Note why in a comment. Nineteen pages are off as of 2026-10-02. Turn them back on once the zoo finder fixes their data.
