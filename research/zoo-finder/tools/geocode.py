"""Fill missing roster coordinates from OpenStreetMap Nominatim (1 req/s, identified UA). Writes raw/coords_osm.json."""
import json, os, sys, time, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
roster = json.load(open(os.path.join(ROOT, 'raw', 'roster.json')))['institutions']
outp = os.path.join(ROOT, 'raw', 'coords_osm.json')
out = json.load(open(outp)) if os.path.exists(outp) else {}
UA = 'WildAtlas-zoo-finder/1.0 (https://wildatlasapp.com)'
def q(u):
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=30))
miss = [i for i in roster if i.get('lat') is None and i['id'] not in out]
print(len(miss), 'to look up')
for i in miss:
    for query in (', '.join(x for x in [i['name'], i.get('town'), i.get('country')] if x), ', '.join(x for x in [i.get('town'), i.get('region'), i.get('country')] if x)):
        try:
            r = q('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + urllib.parse.quote(query))
        except Exception as e:
            r = []
        time.sleep(1.1)
        if r:
            out[i['id']] = {'lat': float(r[0]['lat']), 'lng': float(r[0]['lon']), 'coord_source': 'osm:%s/%s' % (r[0]['osm_type'], r[0]['osm_id']),
                            'matched': r[0].get('display_name', '')[:120], 'by': 'name' if query.startswith(i['name']) else 'town-centroid'}
            break
    json.dump(out, open(outp, 'w'), indent=0)
print('found', len(out), 'of', len(miss))
