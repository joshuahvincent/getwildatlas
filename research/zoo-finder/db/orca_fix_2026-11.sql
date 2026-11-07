-- Orca venue correction (2026-11-06). NOT YET RUN against D1: Josh approves the data change, then run with
--   wrangler d1 execute wildatlas-places --remote --file research/zoo-finder/db/orca_fix_2026-11.sql
-- and re-run scripts/zoos/export_site_data.py (it keeps places.json order stable and only appends).
-- Sources: Wikipedia "List of captive orcas" (living table, status 7 Jun 2026) and Ceta-Base global orca list
-- (https://cetabase.org/orcensus/global-orca-list/, read 5 Nov 2026: 55 orcas at 13 facilities). The two agree.

-- 1) Five venues that hold no orcas. The crawl matched species-information pages (wild orcas, Antarctic fauna,
--    a False Killer Whale page), not animals on show. Soft-delete ('gone' is hidden by the exporter, history kept).
UPDATE holdings SET check_status='gone', last_verified='2026-11-06', verified_by='manual:orca-audit-2026-11',
  evidence='Removed 2026-11-06: crawl matched a species-information page; venue is not a holder of orcas in Wikipedia List of captive orcas (7 Jun 2026) or Ceta-Base (5 Nov 2026). Previously: ' || COALESCE(evidence,'')
WHERE animal_id='orca' AND match='exact' AND place_id IN
  ('monterey-bay-aquarium','cabrillo-marine-aquarium','alaska-sealife-center','nausicaa-centre-national-de-la-mer','adventure-world-q2587322');

-- 2) Three existing places that hold orcas but had no orca holding.
INSERT INTO holdings (place_id,animal_id,match,species_seen,source_url,evidence,confidence,first_seen,last_verified,verified_by,check_status,evidence_tier)
VALUES
 ('seaworld-orlando','orca','exact','Orcinus orca','https://seaworld.com/orlando/animal-experiences/orca-underwater-viewing/',
  'Own page ''Orca Underwater Viewing'' names orcas; 4 orcas per Wikipedia List of captive orcas (7 Jun 2026) and Ceta-Base (5 Nov 2026).','HIGH','2026-11-06','2026-11-06','manual:orca-audit-2026-11','ok','strong'),
 ('port-of-nagoya-public-aquarium-q7231211','orca','exact','Orcinus orca','https://en.wikipedia.org/wiki/List_of_captive_orcas',
  '1 orca listed at Port of Nagoya Public Aquarium in Wikipedia List of captive orcas (7 Jun 2026) and Ceta-Base (5 Nov 2026). Venue''s own page not yet checked, so tier is weak.','MED','2026-11-06','2026-11-06','manual:orca-audit-2026-11','ok','weak'),
 ('moskvarium-q21641834','orca','exact','Orcinus orca','https://en.wikipedia.org/wiki/List_of_captive_orcas',
  '1 orca listed at Moskvarium in Wikipedia List of captive orcas (7 Jun 2026) and Ceta-Base (5 Nov 2026). Venue''s own page not yet checked, so tier is weak.','MED','2026-11-06','2026-11-06','manual:orca-audit-2026-11','ok','weak');
