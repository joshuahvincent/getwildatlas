-- Zoo finder batch 2 (2026-11-06). Staged against a local copy of D1; NOT run on prod until Josh says deploy:
--   wrangler d1 execute wildatlas-places --remote --file research/zoo-finder/db/finder_batch2_2026-11.sql
-- Then run scripts/zoos/export_site_data.py (places.json order is kept stable; new places are appended).

-- 1) Two new orca venues (appended to places.json). Sources: Wikipedia "List of captive orcas" (status 7 Jun 2026) and
--    Ceta-Base global orca list (5 Nov 2026) list them as holders (Chimelong Spaceship 15, Haichang Shanghai 7).
--    Coordinates: Wikipedia article "Chimelong International Ocean Tourist Resort" (Spaceship redirects there; resort-level point, Hengqin island)
--    and OpenStreetMap (Shanghai Haichang Ocean Park). Not added: Wuxi Changqiao (Wikipedia: "no sources yet", no public venue found) and
--    SunAsia Beluga Whale World ("holding" facility, capture date "?"); neither is verifiable as a place families can visit.
INSERT INTO places (id,name,type,town,region,country,lat,lng,coord_source,url,accreditation,accreditation_source,status,first_seen,last_verified)
VALUES
 ('chimelong-spaceship','Chimelong Spaceship','aquarium','Zhuhai','Guangdong','CN',22.1001,113.53,'wikipedia:Chimelong International Ocean Tourist Resort','https://www.chimelong.com/','unverified',NULL,'open','2026-11-06','2026-11-06'),
 ('shanghai-haichang-ocean-park','Shanghai Haichang Ocean Park','aquarium','Shanghai','Shanghai','CN',30.9157783,121.9004656,'osm:nominatim','https://english.shanghai.gov.cn/en-Parks/20240618/91679073e79a4376a90edb76414836d4.html','unverified',NULL,'open','2026-11-06','2026-11-06');
INSERT INTO holdings (place_id,animal_id,match,species_seen,source_url,evidence,confidence,first_seen,last_verified,verified_by,check_status,evidence_tier)
VALUES
 ('chimelong-spaceship','orca','exact','Orcinus orca','https://en.wikipedia.org/wiki/List_of_captive_orcas','15 orcas listed at Chimelong Spaceship in Wikipedia List of captive orcas (7 Jun 2026) and Ceta-Base (5 Nov 2026). Venue''s own page not checked, so tier is weak.','MED','2026-11-06','2026-11-06','manual:finder-batch2-2026-11','ok','weak'),
 ('shanghai-haichang-ocean-park','orca','exact','Orcinus orca','https://english.shanghai.gov.cn/en-Events/20260729/578828f815f74e6094ae76df11ce11dd.html','Shanghai government events page ''Orca Wave Festival at Shanghai Haichang Ocean Park'' (2026); 7 orcas per Wikipedia List of captive orcas and Ceta-Base. Park''s own site unreachable, so tier is weak.','MED','2026-11-06','2026-11-06','manual:finder-batch2-2026-11','ok','weak');

-- 2) Nagoya and Moskvarium: venue's own pages confirm orcas, promote weak -> strong.
UPDATE holdings SET source_url='https://nagoyaaqua.jp/floormap/', evidence_tier='strong', confidence='HIGH', last_verified='2026-11-06', verified_by='manual:finder-batch2-2026-11',
  evidence='Own page ''floor map'' says the aquarium exhibits orcas (シャチ); 1 orca per Wikipedia List of captive orcas and Ceta-Base (Earth died 3 Aug 2025 per the aquarium).'
WHERE place_id='port-of-nagoya-public-aquarium-q7231211' AND animal_id='orca' AND match='exact';
UPDATE holdings SET source_url='https://moskvarium.ru/aquarium/inhabitant/kosatka-naya/', evidence_tier='strong', confidence='HIGH', last_verified='2026-11-06', verified_by='manual:finder-batch2-2026-11',
  evidence='Own page ''Косатка Ная'' (orca Naya); 1 orca per Wikipedia List of captive orcas and Ceta-Base.'
WHERE place_id='moskvarium-q21641834' AND animal_id='orca' AND match='exact';

-- 3) Blue whale and narwhal are wild-only (Chief Naturalist list; Josh yes 2026-11-06). Their zoo rows came from species-information pages.
UPDATE animals SET wild_only=1 WHERE id IN ('blue_whale','narwhal');
UPDATE holdings SET check_status='gone', last_verified='2026-11-06', verified_by='manual:finder-batch2-2026-11',
  evidence='Removed 2026-11-06: no zoo or aquarium keeps this animal (wild-only); crawl matched an information page. Previously: ' || COALESCE(evidence,'')
WHERE animal_id IN ('blue_whale','narwhal') AND match='exact' AND place_id NOT LIKE 'wild-%';

-- 4) Dolphin rows whose cited page is not about an animal on show (information, news, rehab, closed or unrelated pages).
UPDATE holdings SET check_status='gone', last_verified='2026-11-06', verified_by='manual:finder-batch2-2026-11',
  evidence='Removed 2026-11-06: cited page is not evidence of dolphins on show (species information, news, rehab, closed venue or unrelated page). Previously: ' || COALESCE(evidence,'')
WHERE animal_id='dolphin' AND match='exact' AND place_id IN
 ('parc-des-oiseaux','tennessee-aquarium','the-marine-mammal-center-q3521787','marineland','monterey-bay-aquarium','cabrillo-marine-aquarium',
  'nausicaa-centre-national-de-la-mer','new-england-aquarium','mote-marine-laboratory-and-aquarium');

-- 5) Beluga rows citing a fish, a blog post, a research paper or a species-information page.
UPDATE holdings SET check_status='gone', last_verified='2026-11-06', verified_by='manual:finder-batch2-2026-11',
  evidence='Removed 2026-11-06: cited page is not evidence of belugas on show (beluga sturgeon fish page, blog post, research paper or species information). Previously: ' || COALESCE(evidence,'')
WHERE animal_id='beluga_whale' AND match='exact' AND place_id IN
 ('aquarium-barcelona-q1200948','alaska-sealife-center','california-academy-of-sciences-q965731','steinhart-aquarium','new-england-aquarium');
