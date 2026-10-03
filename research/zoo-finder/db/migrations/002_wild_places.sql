-- 002: 'in the wild' destinations reuse places.type = 'sanctuary' (a table rebuild to add a new type was rolled back by D1's foreign-key check).
-- Adds the park area and UNESCO flag, plus GBIF sighting counts on holdings.
ALTER TABLE places ADD COLUMN area_km2 REAL;
ALTER TABLE places ADD COLUMN unesco INTEGER NOT NULL DEFAULT 0;
ALTER TABLE holdings ADD COLUMN obs_count INTEGER;
