-- wildatlas-places (D1). Source of truth for the zoo-finder dataset (getwildatlas#38).
-- Raw page captures live in the private R2 bucket wildatlas-places-cache; this DB stores
-- pointers (r2_key) + fingerprints so re-checks diff instead of re-scraping.

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,                 -- kebab slug
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('zoo','aquarium','museum','farm','safari_park','sanctuary')),
  town TEXT, region TEXT, country TEXT, -- country = ISO2
  lat REAL, lng REAL, coord_source TEXT,
  wikidata_qid TEXT, osm_id TEXT,
  url TEXT,
  accreditation TEXT,                  -- AZA|CAZA|BIAZA|EAZA|ZAA|JAZA|WAZA|AAM|museum|none|unverified (comma-separated if several)
  accreditation_source TEXT, accreditation_checked TEXT,
  image_file TEXT, image_license TEXT, image_author TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','temporarily_closed','closed')),
  status_note TEXT,
  first_seen TEXT NOT NULL, last_verified TEXT
);

CREATE TABLE IF NOT EXISTS animals (
  id TEXT PRIMARY KEY,                 -- Wild Atlas app id
  common_name TEXT NOT NULL, scientific_name TEXT, pack TEXT,
  group_key TEXT,                      -- curated same-group key (e.g. big_cats, dinosaurs)
  wild_only INTEGER NOT NULL DEFAULT 0, in_the_wild TEXT
);

CREATE TABLE IF NOT EXISTS aliases (      -- names used to match place animal lists
  animal_id TEXT NOT NULL REFERENCES animals(id), alias TEXT NOT NULL, lang TEXT,
  PRIMARY KEY (animal_id, alias)
);

CREATE TABLE IF NOT EXISTS holdings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  place_id TEXT NOT NULL REFERENCES places(id),
  animal_id TEXT NOT NULL REFERENCES animals(id),
  match TEXT NOT NULL CHECK (match IN ('exact','related')),   -- same-group is computed, never stored
  species_seen TEXT, via TEXT, related_rationale TEXT,
  source_url TEXT NOT NULL, evidence TEXT, confidence TEXT CHECK (confidence IN ('HIGH','MED')),
  display_until TEXT,
  first_seen TEXT NOT NULL, last_verified TEXT NOT NULL, verified_by TEXT,
  source_fingerprint TEXT,
  check_status TEXT NOT NULL DEFAULT 'ok' CHECK (check_status IN ('ok','changed','gone','needs_review','unchecked')),
  next_due TEXT,
  evidence_tier TEXT NOT NULL DEFAULT 'strong' CHECK (evidence_tier IN ('strong','weak')),  -- weak = page mentions the animal but doesn't clearly list it (news, adoption, thin title match)
  UNIQUE (place_id, animal_id, match, species_seen)
);
CREATE INDEX IF NOT EXISTS holdings_by_animal ON holdings(animal_id, match);
CREATE INDEX IF NOT EXISTS holdings_by_place ON holdings(place_id);

CREATE TABLE IF NOT EXISTS fetches (       -- every page fetch; body stored in R2
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL, fetched_at TEXT NOT NULL, http_status INTEGER,
  method TEXT,                         -- curl|browser|search_snippet
  r2_key TEXT, fingerprint TEXT, bytes INTEGER
);
CREATE INDEX IF NOT EXISTS fetches_by_url ON fetches(url, fetched_at);

CREATE TABLE IF NOT EXISTS accreditation_lists (  -- snapshots of member lists
  body TEXT NOT NULL, fetched_at TEXT NOT NULL, source_url TEXT, r2_key TEXT, member_count INTEGER,
  PRIMARY KEY (body, fetched_at)
);
