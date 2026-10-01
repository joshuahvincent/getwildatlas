"""Pull petting zoos / open farms from OpenStreetMap (Overpass) -> raw/farms_osm.json.
Josh 2026-09-30: include farm petting zoos. No accreditor exists for farms, so type='farm', accreditation='none'.
Usage: python3 tools/farms.py [ISO2 ...]   (default: US CA GB IE AU NZ DE FR ES)"""
import json, os, re, sys, time, unicodedata, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'raw', 'farms_osm.json')
UA = 'WildAtlas-zoo-finder/1.0 (https://wildatlasapp.com)'
ENDPOINT = 'https://overpass-api.de/api/interpreter'
NAME_RX = 'farm|petting|barnyard|ferme|bauernhof|granja|kinderbauernhof|streichelzoo|ferma'
def overpass(q, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(ENDPOINT, data=urllib.parse.urlencode({'data': q}).encode(), headers={'User-Agent': UA})
            return json.load(urllib.request.urlopen(req, timeout=300))
        except Exception as e:
            print('  retry', i + 1, repr(e)[:80], flush=True); time.sleep(20 * (i + 1))
    return None
def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:60]
have = json.load(open(OUT)) if os.path.exists(OUT) else {}
countries = sys.argv[1:] or ['US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'DE', 'FR', 'ES']
for cc in countries:
    q = ('[out:json][timeout:240];area["ISO3166-1"="%s"][admin_level=2]->.a;('
         'nwr["zoo"="petting_zoo"](area.a);'
         'nwr["tourism"="zoo"]["name"~"%s",i](area.a););out center tags;') % (cc, NAME_RX)
    d = overpass(q)
    if d is None: print(cc, 'failed'); continue
    n = 0
    for e in d['elements']:
        t = e.get('tags', {})
        name = t.get('name')
        lat = e.get('lat') or (e.get('center') or {}).get('lat'); lng = e.get('lon') or (e.get('center') or {}).get('lon')
        if not name or lat is None: continue
        pid = 'farm-%s-%s-%s' % (cc.lower(), slug(name), e['id'] % 100000)
        have[pid] = {'id': pid, 'name': name, 'type': 'farm', 'town': t.get('addr:city') or t.get('addr:town') or t.get('addr:village'), 'region': t.get('addr:state') or t.get('addr:province'),
                     'country': cc, 'lat': lat, 'lng': lng, 'coord_source': 'osm:%s/%s' % (e['type'], e['id']),
                     'url': t.get('website') or t.get('contact:website') or t.get('url'), 'accreditation': 'none', 'accreditation_source': None,
                     'wikidata': t.get('wikidata'), 'osm_tags': {k: v for k, v in t.items() if k in ('zoo', 'tourism', 'animal', 'opening_hours', 'fee', 'phone', 'contact:phone')},
                     'image_file': None, 'image_license': None, 'image_author': None, 'first_seen': '2026-10-01'}
        n += 1
    print(cc, n, 'features', flush=True)
    json.dump(have, open(OUT, 'w'), indent=0, ensure_ascii=False)
    time.sleep(8)
print('total', len(have))
