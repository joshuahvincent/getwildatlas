"""Ask Google Places (New) Text Search whether each Wikidata 'not on our list' candidate exists and is open.
Key: GOOGLE_PLACES_API_KEY from the environment (never printed, never written to disk).  Hard cap: MAX_CALLS (default 1800).
Per Google's terms only the place id, business status and our own verdict are kept (no names, photos or reviews).
Writes not_on_list/google_validated.json: {qid: {place_id, status, types, dist_m, name_match, verdict}}."""
import csv, json, math, os, re, sys, time, unicodedata, urllib.request, concurrent.futures as cf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = os.environ['GOOGLE_PLACES_API_KEY']; MAX_CALLS = int(os.environ.get('MAX_CALLS', '1800'))
rows = list(csv.DictReader(open(os.path.join(ROOT, 'not_on_list', 'wikidata_candidates.csv'))))
outp = os.path.join(ROOT, 'not_on_list', 'google_validated.json')
done = json.load(open(outp)) if os.path.exists(outp) else {}
def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return set(re.sub(r'[^a-z0-9 ]+', ' ', s).split()) - {'the', 'zoo', 'park', 'aquarium', 'of', 'de', 'la', 'le', 'and'}
def dist(a, b, c, d):
    p = math.pi / 180; x = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2; return 12742000 * math.asin(math.sqrt(x))
calls = 0
def ask(r):
    body = json.dumps({'textQuery': r['name'], 'locationBias': {'circle': {'center': {'latitude': float(r['lat']), 'longitude': float(r['lng'])}, 'radius': 3000.0}}, 'maxResultCount': 1}).encode()
    req = urllib.request.Request('https://places.googleapis.com/v1/places:searchText', data=body, headers={'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'places.id,places.displayName,places.businessStatus,places.location,places.types'})
    for i in range(3):
        try: return json.load(urllib.request.urlopen(req, timeout=30))
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503): time.sleep(3 * (i + 1)); continue
            return {'error': e.code}
        except Exception: time.sleep(2)
    return {'error': 0}
todo = [r for r in rows if r['qid'] not in done][:MAX_CALLS]
print(len(todo), 'to ask', flush=True)
def work(r):
    d = ask(r); p = (d.get('places') or [None])[0]
    if p is None: return r['qid'], {'verdict': 'not_found' if 'error' not in d else 'error %s' % d['error']}
    loc = p.get('location', {}); dm = int(dist(float(r['lat']), float(r['lng']), loc.get('latitude', 0), loc.get('longitude', 0)))
    nm = bool(norm(r['name']) & norm(p.get('displayName', {}).get('text', ''))) or not norm(r['name'])
    st = p.get('businessStatus', '')
    ok = dm <= 1500 and (nm or dm <= 300)
    return r['qid'], {'place_id': p['id'], 'status': st, 'types': [t for t in p.get('types', []) if t in ('zoo', 'aquarium', 'park', 'tourist_attraction', 'natural_feature', 'amusement_park')], 'dist_m': dm, 'name_match': nm,
                      'verdict': ('closed' if st in ('CLOSED_PERMANENTLY',) else 'temp_closed' if st == 'CLOSED_TEMPORARILY' else 'open') if ok else 'different_place'}
with cf.ThreadPoolExecutor(6) as ex:
    for k, (q, v) in enumerate(ex.map(work, todo)):
        done[q] = v
        if k % 200 == 199: json.dump(done, open(outp, 'w')); print(k + 1, 'asked', flush=True)
json.dump(done, open(outp, 'w'))
import collections; print(collections.Counter(v['verdict'] for v in done.values()))
