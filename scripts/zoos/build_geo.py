"""Build the compact map outline + gazetteer files served from /assets/zoos/geo/.
Sources (downloaded 2026-10-01, stored locally, not committed):
  Natural Earth 1:50m admin-0 countries + admin-1 states/provinces (public domain) -- naturalearthdata.com
  GeoNames cities15000 + postal-code files for US CA GB AU NZ DE FR ES IE (CC BY 4.0) -- geonames.org
Usage: python3 scripts/zoos/build_geo.py <dir with downloaded files>"""
import json, os, sys, csv, collections
src = sys.argv[1]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'zoos', 'geo')
os.makedirs(out, exist_ok=True)

def rnd(c):
    if isinstance(c[0], (int, float)): return [round(c[0], 2), round(c[1], 2)]
    return [rnd(x) for x in c]
def rdp(pts, eps):
    # Douglas-Peucker line simplification (iterative); keeps outlines recognisable with far fewer points
    if len(pts) < 5: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True; stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop(); (x1, y1), (x2, y2) = pts[a], pts[b]; dx, dy = x2 - x1, y2 - y1; n = dx * dx + dy * dy; mx, mi = 0.0, -1
        for i in range(a + 1, b):
            x, y = pts[i]
            d = ((x - x1) * (x - x1) + (y - y1) * (y - y1)) if n == 0 else abs(dy * (x - x1) - dx * (y - y1)) / (n ** 0.5)
            if d > mx: mx, mi = d, i
        if mx > eps: keep[mi] = True; stack += [(a, mi), (mi, b)]
    return [p for p, k in zip(pts, keep) if k]
def simp(c, eps):
    if isinstance(c[0][0], (int, float)):   # a ring
        r = rdp(c, eps); return r if len(r) >= 4 else None
    out = [simp(x, eps) for x in c]; return [x for x in out if x]
def outline(fn, keep, eps=0.04):
    d = json.load(open(os.path.join(src, fn)))
    feats = []
    for f in d['features']:
        p = f['properties']; g = f['geometry']
        if not g: continue
        if p.get('ISO_A2') == 'AQ' or p.get('iso_a2') == 'AQ' or p.get('NAME') == 'Antarctica' or p.get('admin') == 'Antarctica': continue   # Antarctica takes up too much of the map and holds no places
        co = simp(rnd(g['coordinates']), eps)
        if co: feats.append({'type': 'Feature', 'properties': keep(p), 'geometry': {'type': g['type'], 'coordinates': co}})
    return {'type': 'FeatureCollection', 'features': feats}
json.dump(outline('ne_50m_admin_0_countries.geojson', lambda p: {'n': p.get('NAME'), 'c': p.get('ISO_A2')}), open(os.path.join(out, 'countries.json'), 'w'), separators=(',', ':'))
json.dump(outline('ne_50m_admin_1_states_provinces.geojson', lambda p: {'n': p.get('name'), 'c': p.get('iso_a2')}), open(os.path.join(out, 'admin1.json'), 'w'), separators=(',', ':'))

# cities: [name, ascii, cc, lat, lon, pop, admin1(US only)]
cities = []
for row in csv.reader(open(os.path.join(src, 'cities15000.txt'), encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE):
    cities.append([row[1], row[2], row[8], round(float(row[4]), 3), round(float(row[5]), 3), int(row[14] or 0), row[10] if row[8] == 'US' else ''])
cities.sort(key=lambda c: -c[5])
json.dump(cities, open(os.path.join(out, 'cities.json'), 'w'), separators=(',', ':'), ensure_ascii=False)

# postal: code -> [lat, lon, place, admin1 abbreviation]
for cc in ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR', 'ES', 'IE']:
    d = {}
    for row in csv.reader(open(os.path.join(src, cc + '.txt'), encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE):
        if len(row) < 11 or not row[9] or not row[10]: continue
        code = row[1].strip().upper().replace(' ', '')
        if code in d: continue
        d[code] = [round(float(row[9]), 3), round(float(row[10]), 3), row[2], row[4]]
    json.dump(d, open(os.path.join(out, 'post-%s.json' % cc.lower()), 'w'), separators=(',', ':'), ensure_ascii=False)
    print(cc, len(d))
print('cities', len(cities))
