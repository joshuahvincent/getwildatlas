"""For each park in raw/wild_roster.json ask GBIF (open data) how many recorded sightings of each app animal fall inside the park (2010-2026,
human/machine observations). One facet query per park. Caches per park (resume-safe). Writes raw/sweep_wild.json in the standard sweep format.
Thresholds: >=5 records = listed (weak evidence tier), >=25 = strong. Relatives need >=10. The park boundary is approximated by a circle of equal area (max 90 km radius),
so records from a neighbouring area can leak in: that is why 5-24 records are labelled unconfirmed.
Usage: python3 tools/wild_sightings.py [--limit N]   (run from research/zoo-finder)"""
import json, math, os, re, sys, time, urllib.parse, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
CACHE = os.path.join(ROOT, 'cache_local', 'wild'); os.makedirs(CACHE, exist_ok=True)
UA = 'WildAtlas-zoo-finder/1.0 (https://wildatlasapp.com)'
roster = [x for x in json.load(open(os.path.join(ROOT, 'raw', 'wild_roster.json'))) if x['unesco'] or (x['area_km2'] or 0) >= 100 or (x['url'] and (x['area_km2'] is None or x['area_km2'] >= 10)) or x['class'] == 'curated']   # skip tiny obscure sites
keys = json.load(open(os.path.join(ROOT, 'raw', 'gbif_keys.json')))
# class-level filter (mammals, birds, reptiles, amphibians, ray-finned fish, sharks and rays, cephalopods, jellyfish, sea stars); the facet then returns counts for every taxon
# inside them, including our genus/species keys. (Listing all 738 keys makes the web address too long for GBIF.)
CLASS_KEYS = [359, 212, 358, 131, 204, 121, 136, 352, 214]
# habitat guards (calendar-session review, 2026-10-01): circle boundaries leak land records into marine sanctuaries and sea records into inland refuges
ONLY_COUNTRIES = {'galapagos_giant_tortoise': {'EC'}}
ONLY_NAME = {'galapagos_giant_tortoise': re.compile(r'gal[aá]pagos', re.I)}   # Chelonoidis also covers mainland tortoises
MARINE = {'humpback_whale','orca','sea_otter','great_white_shark','harp_seal','octopus','blue_whale','beluga_whale','narwhal','dolphin','hammerhead_shark','manta_ray','whale_shark','sea_turtle',
          'sea_lion','sea_snake','seahorse','starfish','jellyfish','moray_eel','walrus','west_indian_manatee','giant_squid','clownfish','emperor_penguin','albatross','atlantic_puffin'}
COAST = re.compile(r'marine|coast|seashore|shore|\bsea\b|ocean|\bbay\b|reef|island|cape\b|point\b|lagoon|gulf|archipelag|estuar|delta|wadden|beach|harbou?r|sound\b|fjord|atoll|cay\b|key\b|peninsula', re.I)
MARINE_PARK = re.compile(r'marine|\bsea\b|ocean|reef|sanctuary.*(bay|sea|ocean)|farallones', re.I)
RANGE = {   # hand-set range limits where the circle/records put an animal outside where it really lives
    'great_white_shark': lambda p: not (-25 <= p['lat'] <= 25),   # not the tropics
    'numbat': lambda p: p['country'] == 'AU' and (p['lng'] < 125 or 'mallee cliffs' in p['name'].lower()),   # SW Western Australia + the fenced Mallee Cliffs reintroduction
}
def allowed(aid, p):
    if aid in RANGE and not RANGE[aid](p): return False
    if aid in ONLY_COUNTRIES and p['country'] not in ONLY_COUNTRIES[aid]: return False
    if aid in ONLY_NAME and not ONLY_NAME[aid].search(p['name']): return False
    if aid in MARINE: return bool(COAST.search(p['name']))
    return not MARINE_PARK.search(p['name'])
lim = int(sys.argv[sys.argv.index('--limit') + 1]) if '--limit' in sys.argv else None
def circle(lat, lng, r_km, n=24):
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        pts.append((round(max(-180, min(180, lng + (r_km / (111.0 * max(0.2, math.cos(math.radians(lat))))) * math.sin(a))), 3), round(max(-89.9, min(89.9, lat + (r_km / 111.0) * math.cos(a))), 3)))
    pts.append(pts[0]); return 'POLYGON((%s))' % ','.join('%s %s' % p for p in pts)
def radius(p): return max(3.0, min(90.0, math.sqrt(p['area_km2'] / math.pi))) if p.get('area_km2') else 15.0
def facet(poly):
    params = [('geometry', poly), ('facet', 'taxonKey'), ('facetLimit', '3000'), ('limit', '0'), ('year', '2010,2026'), ('hasCoordinate', 'true'), ('occurrenceStatus', 'PRESENT'),
              ('basisOfRecord', 'HUMAN_OBSERVATION'), ('basisOfRecord', 'MACHINE_OBSERVATION'), ('basisOfRecord', 'OBSERVATION')] + [('taxonKey', k) for k in CLASS_KEYS]
    u = 'https://api.gbif.org/v1/occurrence/search?' + urllib.parse.urlencode(params)
    for i in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=120))
            return {int(c['name']): c['count'] for c in (d.get('facets') or [{}])[0].get('counts', [])}
        except Exception as e:
            time.sleep(4 * (i + 1))
    return None
def direct_count(key, poly):
    u = 'https://api.gbif.org/v1/occurrence/search?' + urllib.parse.urlencode({'geometry': poly, 'taxonKey': key, 'year': '2010,2026', 'hasCoordinate': 'true', 'occurrenceStatus': 'PRESENT', 'limit': 0})
    for i in range(3):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=60))['count']
        except Exception: time.sleep(3)
    return 0
def counts_for(p):
    f = os.path.join(CACHE, p['wikidata'] + '.json')
    if os.path.exists(f): return json.load(open(f))
    poly = circle(p['lat'], p['lng'], radius(p))
    out = facet(poly)
    if out is None: return None
    time.sleep(0.3); res = {'poly': poly, 'counts': {str(k): v for k, v in out.items()}}
    json.dump(res, open(f, 'w')); return res
from concurrent.futures import ThreadPoolExecutor
todo = roster[:lim] if lim else roster
print(len(todo), 'parks to query', flush=True)
with ThreadPoolExecutor(4) as ex: fetched = list(ex.map(counts_for, todo))
places, holdings, done = [], [], 0
for p, res in zip(todo, fetched):
    if res is None: print('skip (GBIF failed)', p['name'], flush=True); continue
    c = {int(k): v for k, v in res['counts'].items()}
    hs = []
    for aid, rows in keys.items():
        if not allowed(aid, p): continue
        ex = [r for r in rows if r['match'] == 'exact']; rel = [r for r in rows if r['match'] == 'related']
        # genus keys include their species, so take the larger of (genus count, species sum) to avoid double counting
        def tot(rs):
            g = max([c.get(r['key'], 0) for r in rs if r['rank'] != 'SPECIES'] or [0]); s = sum(c.get(r['key'], 0) for r in rs if r['rank'] == 'SPECIES'); return max(g, s)
        n = tot(ex)
        if n == 0 and aid in ONLY_COUNTRIES and ex:   # genus facet counts are missing for some genera: ask GBIF directly (few parks)
            n = direct_count(ex[0]['key'], res['poly'])
        if n >= 5:
            best = max(ex, key=lambda r: c.get(r['key'], 0))
            hs.append({'animal_id': aid, 'match': 'exact', 'species_seen': (best['name'] or '').split(' (')[0], 'via': None, 'related_rationale': None, 'obs_count': n, 'key': best['key']})
        else:
            for r in sorted(rel, key=lambda r: -c.get(r['key'], 0)):
                m = c.get(r['key'], 0)
                if m >= 10 and r['via'] and r['rat']:
                    hs.append({'animal_id': aid, 'match': 'related', 'species_seen': (r['name'] or '').split(' (')[0], 'via': r['via'], 'related_rationale': r['rat'], 'obs_count': m, 'key': r['key']}); break
    if not hs: continue
    places.append({'id': p['id'], 'name': p['name'], 'type': 'wild', 'town': None, 'region': None, 'country': p['country'], 'lat': p['lat'], 'lng': p['lng'], 'coord_source': 'wikidata:' + p['wikidata'],
                   'url': p['url'], 'accreditation': 'unesco' if p['unesco'] else 'protected-area', 'accreditation_source': 'https://www.wikidata.org/wiki/' + p['wikidata'], 'wikidata': p['wikidata'],
                   'area_km2': p['area_km2'], 'unesco': p['unesco'], 'image_file': None, 'image_license': None, 'image_author': None})
    for h in hs:
        holdings.append({'place_id': p['id'], 'animal_id': h['animal_id'], 'match': h['match'], 'species_seen': h['species_seen'], 'via': h['via'], 'related_rationale': h['related_rationale'],
                         'source_url': 'https://www.gbif.org/occurrence/search?' + urllib.parse.urlencode({'taxon_key': h['key'], 'geometry': res['poly'], 'year': '2010,2026'}),
                         'evidence': '%d recorded sightings since 2010 inside the park area (GBIF.org)' % h['obs_count'], 'confidence': 'HIGH' if h['obs_count'] >= 25 else 'MED',
                         'obs_count': h['obs_count'], 'evidence_tier': 'strong' if h['obs_count'] >= 25 else 'weak'})
    done += 1
    if done % 50 == 0: print(done, 'parks with sightings;', len(holdings), 'holdings', flush=True)
json.dump({'batch': 'wild', 'researched': time.strftime('%Y-%m-%d'), 'method': 'gbif-sightings', 'places': places, 'holdings': holdings, 'fetches': [], 'notes_per_animal': {},
           'stats': {'places': len(places), 'holdings_exact': sum(h['match'] == 'exact' for h in holdings), 'holdings_related': sum(h['match'] == 'related' for h in holdings), 'minutes_spent_estimate': 0, 'urls_fetched': 0, 'blocked_urls': 0},
           'method_notes': 'Sightings: GBIF.org open occurrence data, 2010-2026, human/machine observations, park approximated by an equal-area circle (max 90 km).'},
          open(os.path.join(ROOT, 'raw', 'sweep_wild.json'), 'w'), ensure_ascii=False)
print('done:', len(places), 'parks,', len(holdings), 'holdings')
