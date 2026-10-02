# Places map

`{% placesMap %}` adds a map to any page on the site. It looks like the zoo finder's map at `/zoos/`: self-hosted MapLibre, the offline Natural Earth outlines, and the same pin styles. It makes no third-party requests, uses no tiles, and never asks for location. The map loads only when it scrolls into view.

**Files**
- `js/places-map.js`: the map.
- `css/places-map.css`: its styles.
- `lib/place-pins.js`: turns places into coordinates at build time.
- `_data/placeCoords.json`: hand-placed spots the automatic lookup can't resolve.

## Show a list of places

```njk
{%- set pins = [
  { title: "Hippos", place: "Cincinnati Zoo — Cincinnati, Ohio", url: "https://cincinnatizoo.org/" },
  { title: "Humpbacks", place: "Húsavík, North Iceland", url: "https://www.visithusavik.is/", tier: "wild" }
] | placePins %}
{% placesMap pins, { label: "Places to see hippos" } %}
```

`placePins` finds coordinates for each place at build time, in this order:
1. `_data/placeCoords.json`, matched by the exact `place` text.
2. The zoo finder's `assets/zoos/places.json`, matched by website domain or name.
3. Its `assets/zoos/geo/cities.json`, matched by town. A state or country named in the text decides between same-named towns (Alexandria, Louisiana vs. Egypt).

Places it can't resolve are left off the map. If that happens, add them to `_data/placeCoords.json`.

## Show every place (the "all pins" map)

```njk
{% placesMap null, { src: "/assets/zoos/places.json", format: "zoo-places", fit: "world", label: "Zoos, aquariums and parks" } %}
{% placesMap null, { src: "/assets/zoos/places.json", format: "zoo-places", types: "zoo,aquarium", fit: "world", label: "Zoos and aquariums" } %}
```

## Options

| Option | Meaning |
|---|---|
| `label` | Accessible name for the map region (required in practice). |
| `src`, `format` | Load pins from a JSON file instead of the page. `format: "zoo-places"` reads the zoo finder's place rows; anything else expects pin objects. |
| `types` | `zoo-places` only. Comma list of place types to keep (`zoo`, `aquarium`, `wild`, …). |
| `fit` | `"pins"` (default) zooms to the pins. `"world"` shows the whole world. |
| `maxZoom` | The closest zoom used when fitting to pins (default 5). |
| `legend` | `{ tier: "label" }` to rename legend entries, or `"none"` to hide the legend. |
| `height` | CSS height, e.g. `"420px"` (default 340px; 280px on phones). |

## Pin tiers

These match the zoo finder:

| Tier | Pin | Default legend label |
|---|---|---|
| `lists` (default) | big green with white halo | Place to see one (Place to visit for `zoo-places`) |
| `unconfirmed` | big yellow | Unconfirmed |
| `relative` | small green | Close relative |
| `similar` | small white, grey ring | Similar animals |
| `wild` | big teal | In the wild |

The teal colour is provisional until the zoo finder's in-the-wild pin is final. The legend only lists tiers that appear on that map.

## Used by
- Calendar animal pages: the "Where to see" section (`_includes/layouts/animal-day.njk`, through `whereToSeePins`).
