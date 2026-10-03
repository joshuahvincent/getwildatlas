"""Free validation of the Wikidata 'not on our list' candidates (not_on_list/wikidata_candidates.csv). No API keys.
For each: (1) website answers (HTTP < 400, or 403/429 = alive but blocks scripts), (2) OpenStreetMap has a zoo/aquarium/animal place within 600 m (Overpass), (3) notability (Wikipedia languages).
valid = website alive OR OSM match OR >= 5 Wikipedia languages.  Writes not_on_list/validated.json."""
import csv, json, os, re, sys, time, urllib.parse, urllib.request, concurrent.futures as cf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'Mozilla/5.0 (compatible; WildAtlas-zoo-finder/1.0; +https://wildatlasapp.com)'
rows = list(csv.DictReader(open(os.path.join(ROOT, 'not_on_list', 'wikidata_candidates.csv'))))
def site_status(u):
    if not u: return None
    for url in (u, ('https://' + u.split('://', 1)[1]) if u.startswith('http://') else u):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=15); return r.status
        except urllib.error.HTTPError as e: return e.code
        except Exception: continue
    return 0
import socket; socket.setdefaulttimeout(12)
ex = cf.ThreadPoolExecutor(24); futs = [ex.submit(site_status, r['website']) for r in rows]
status = []
deadline = time.time() + 540
for f in futs:   # overall deadline: a site that never answers counts as "unknown", it must not hold up the run
    try: status.append(f.result(timeout=max(0.1, deadline - time.time())))
    except Exception: status.append(0)
ex.shutdown(wait=False, cancel_futures=True)
print('websites checked', sum(1 for s in status if s is not None), flush=True)
osm = {}
def overpass(chunk):
    around = ''.join('nwr(around:600,%s,%s)["tourism"~"^(zoo|aquarium)$"];nwr(around:600,%s,%s)["zoo"];' % (r['lat'], r['lng'], r['lat'], r['lng']) for r in chunk)
    q = '[out:json][timeout:120];(%s);out center tags;' % around
    for i in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request('https://overpass-api.de/api/interpreter', data=urllib.parse.urlencode({'data': q}).encode(), headers={'User-Agent': UA}), timeout=180))
            return d.get('elements', [])
        except Exception as e:
            time.sleep(15 * (i + 1))
    return None
import math
def near(a, b, c, d): 
    p = math.pi / 180; x = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2; return 12742000 * math.asin(math.sqrt(x))
els = []; failed = 0
for k in range(0, len(rows), 60):
    e = overpass(rows[k:k + 60]); 
    if e is None: failed += 1; continue
    els += e; time.sleep(2)
print('osm elements', len(els), 'failed chunks', failed, flush=True)
pts = [((e.get('lat') or e.get('center', {}).get('lat')), (e.get('lon') or e.get('center', {}).get('lon')), e.get('tags', {}).get('name', '')) for e in els]
out = []
for r, st in zip(rows, status):
    la, lo = float(r['lat']), float(r['lng'])
    m = next(((n) for a, b, n in pts if a is not None and near(la, lo, a, b) <= 600), None)
    alive = st is not None and (st < 400 or st in (401, 403, 429))
    sl = int(r['sitelinks'] or 0)
    out.append({**r, 'site_status': st, 'site_alive': alive, 'osm_match': m if m is not None else '', 'valid': bool(alive or m is not None or sl >= 5)})
json.dump(out, open(os.path.join(ROOT, 'not_on_list', 'validated.json'), 'w'), indent=0, ensure_ascii=False)
v = sum(1 for o in out if o['valid']); print('valid', v, 'of', len(out), '| site alive', sum(o['site_alive'] for o in out), '| osm match', sum(1 for o in out if o['osm_match'] != ''), '| neither (held back)', len(out) - v)
