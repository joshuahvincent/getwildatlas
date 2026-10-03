"""Which zoos, aquariums and similar places does Wikidata know about that are NOT in our list?  Writes not_on_list/wikidata_candidates.csv (+ summary).
Comparison is against raw/roster.json (the accredited roster) and the sweep outputs; a candidate counts as "on the list" if its Wikidata id matches, or its
normalised name matches, or it is within 0.8 km of one of ours with overlapping name words.  Needs no API key (QLever mirror of Wikidata)."""
import csv, glob, json, math, os, re, time, unicodedata, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'WildAtlas-zoo-finder/1.0 (https://wildatlasapp.com)'
PRE = 'PREFIX wd: <http://www.wikidata.org/entity/> PREFIX wdt: <http://www.wikidata.org/prop/direct/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX wikibase: <http://wikiba.se/ontology#> '
CLASSES = {'zoo': 'Q43501', 'aquarium': 'Q2281788'}
def sparql(q):
    for i in range(4):
        try:
            u = 'https://qlever.cs.uni-freiburg.de/api/wikidata?query=' + urllib.parse.quote(PRE + q)
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA, 'Accept': 'application/sparql-results+json'}), timeout=300))['results']['bindings']
        except Exception as e:
            print('  retry', i + 1, repr(e)[:60], flush=True); time.sleep(10 * (i + 1))
    return []
qid = lambda r, k: r[k]['value'].rsplit('/', 1)[-1]
cand = {}
for typ, cls in CLASSES.items():
    rows = sparql('SELECT ?p ?pLabel ?c ?iso ?site ?end ?sl WHERE { ?p wdt:P31/wdt:P279* wd:%s ; wdt:P625 ?c ; wdt:P17 ?cty ; rdfs:label ?pLabel . ?cty wdt:P297 ?iso . OPTIONAL { ?p wdt:P856 ?site } OPTIONAL { ?p wdt:P576 ?end } OPTIONAL { ?p wikibase:sitelinks ?sl } FILTER(LANG(?pLabel) = "en") }' % cls)
    print(typ, 'rows', len(rows), flush=True)
    for r in rows:
        m = re.match(r'(?i)Point\(([-\d.eE+]+) ([-\d.eE+]+)\)', r['c']['value'])
        if not m: continue
        q = qid(r, 'p'); label = r['pLabel']['value']
        if re.fullmatch(r'Q\d+', label): continue
        d = cand.setdefault(q, {'qid': q, 'name': label, 'type': typ, 'country': r['iso']['value'], 'lat': round(float(m.group(2)), 4), 'lng': round(float(m.group(1)), 4), 'website': '', 'closed': '', 'sitelinks': 0})
        if 'site' in r: d['website'] = r['site']['value']
        if 'end' in r: d['closed'] = r['end']['value'][:10]
        if 'sl' in r: d['sitelinks'] = max(d['sitelinks'], int(float(r['sl']['value'])))
        if typ == 'aquarium': d['type'] = 'aquarium'
print('candidates', len(cand))
def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'\b(the|zoo|zoological|park|gardens?|garden|aquarium|aquariums|oceanarium|sea life|centre|center|national)\b', ' ', s)
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()
ours = []
for i in json.load(open(os.path.join(ROOT, 'raw', 'roster.json')))['institutions']:
    ours.append((i.get('wikidata'), i['name'], i.get('lat'), i.get('lng'), i.get('country')))
seen = {o[0] for o in ours if o[0]}
for f in glob.glob(os.path.join(ROOT, 'raw', '*.json')):
    if not os.path.basename(f).startswith(('sweep_', 'out_')) or 'wild' in f: continue
    for p in json.load(open(f)).get('places', []):
        if p.get('type') != 'wild': ours.append((p.get('wikidata'), p['name'], p.get('lat'), p.get('lng'), p.get('country')))
byname = {}
for w, n, la, lo, cc in ours: byname.setdefault(norm(n), []).append((la, lo))
def km(a, b, c, d):
    p = math.pi / 180; x = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(x))
pts = [(la, lo, norm(n)) for w, n, la, lo, cc in ours if la is not None]
def on_list(c):
    if c['qid'] in seen: return 'wikidata id'
    n = norm(c['name'])
    if n and n in byname: return 'same name'
    words = set(n.split())
    for la, lo, nn in pts:
        if abs(la - c['lat']) < 0.02 and abs(lo - c['lng']) < 0.03 and km(la, lo, c['lat'], c['lng']) < 0.8 and (words & set(nn.split()) or not words): return 'nearby same name words'
    return ''
rows = []
for c in cand.values():
    c['on_list'] = on_list(c); rows.append(c)
out = sorted([r for r in rows if not r['on_list'] and not r['closed']], key=lambda r: (-r['sitelinks'], r['country'], r['name']))
os.makedirs(os.path.join(ROOT, 'not_on_list'), exist_ok=True)
with open(os.path.join(ROOT, 'not_on_list', 'wikidata_candidates.csv'), 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=['qid', 'name', 'type', 'country', 'lat', 'lng', 'website', 'sitelinks']); w.writeheader()
    for r in out: w.writerow({k: r[k] for k in w.fieldnames})
import collections
print('on list:', sum(1 for r in rows if r['on_list']), '| closed (skipped):', sum(1 for r in rows if r['closed'] and not r['on_list']), '| NOT on list:', len(out))
print('by type', collections.Counter(r['type'] for r in out)); print('by country top', collections.Counter(r['country'] for r in out).most_common(15))
print('with website', sum(1 for r in out if r['website']), '| notable (>=5 wiki languages):', sum(1 for r in out if r['sitelinks'] >= 5))
