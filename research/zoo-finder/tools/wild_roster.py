"""Roster of 'in the wild' destinations from Wikidata (light queries, joined here): national parks, game reserves, wildlife refuges, marine protected areas,
IUCN category II areas, plus any protected area that is a UNESCO World Heritage natural/mixed site. Nature reserves (huge class) only if UNESCO-listed.
Government/UNESCO-designated areas only; private lodges and ranches are excluded (no accreditor). Writes raw/wild_roster.json."""
import json, os, re, time, unicodedata, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'WildAtlas-zoo-finder/1.0 (https://wildatlasapp.com)'
PRE = 'PREFIX wd: <http://www.wikidata.org/entity/> PREFIX wdt: <http://www.wikidata.org/prop/direct/> PREFIX p: <http://www.wikidata.org/prop/> PREFIX psv: <http://www.wikidata.org/prop/statement/value/> PREFIX wikibase: <http://wikiba.se/ontology#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> '
def sparql(q):
    # QLever's public Wikidata mirror: much faster than query.wikidata.org for these joins
    for i in range(4):
        try:
            u = 'https://qlever.cs.uni-freiburg.de/api/wikidata?query=' + urllib.parse.quote(PRE + q)
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA, 'Accept': 'application/sparql-results+json'}), timeout=180))['results']['bindings']
        except Exception as e:
            print('  retry', i + 1, repr(e)[:50], flush=True); time.sleep(12 * (i + 1))
    return None
qid = lambda r, k='p': r[k]['value'].rsplit('/', 1)[-1]
def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:50]
base = {}
CLASSES = {'Q46169': 'national park', 'Q14545628': 'IUCN II', 'Q1714375': 'game reserve', 'Q1377575': 'wildlife refuge', 'Q1367500': 'marine protected area', 'Q6978070': 'national reserve'}
for t, name in CLASSES.items():
    rows = sparql('SELECT ?p ?pLabel ?c ?iso WHERE { ?p wdt:P31/wdt:P279* wd:%s ; wdt:P625 ?c ; wdt:P17 ?cty ; rdfs:label ?pLabel . ?cty wdt:P297 ?iso . FILTER(LANG(?pLabel) = "en") }' % t)
    print(name, 'rows:', None if rows is None else len(rows), flush=True)
    for r in rows or []:
        m = re.match(r'(?i)Point\(([-\d.eE+]+) ([-\d.eE+]+)\)', r['c']['value']); label = r.get('pLabel', {}).get('value', '')
        if not m or not label or re.fullmatch(r'Q\d+', label): continue
        base.setdefault(qid(r), {'wikidata': qid(r), 'name': label, 'type': 'wild', 'country': r['iso']['value'], 'lat': round(float(m.group(2)), 4), 'lng': round(float(m.group(1)), 4), 'class': name})
    time.sleep(4)
# UNESCO natural/mixed protected areas of any class
rows = sparql('SELECT ?p ?pLabel ?c ?iso WHERE { ?p wdt:P1435 wd:Q9259 ; wdt:P625 ?c ; wdt:P17 ?cty ; rdfs:label ?pLabel . ?cty wdt:P297 ?iso . ?p wdt:P31/wdt:P279* wd:Q473972 . FILTER(LANG(?pLabel) = "en") }')
print('UNESCO protected areas:', None if rows is None else len(rows), flush=True)
for r in rows or []:
    m = re.match(r'(?i)Point\(([-\d.eE+]+) ([-\d.eE+]+)\)', r['c']['value']); label = r.get('pLabel', {}).get('value', '')
    if m and label and not re.fullmatch(r'Q\d+', label):
        base.setdefault(qid(r), {'wikidata': qid(r), 'name': label, 'type': 'wild', 'country': r['iso']['value'], 'lat': round(float(m.group(2)), 4), 'lng': round(float(m.group(1)), 4), 'class': 'UNESCO protected area'})

# well-known destinations whose Wikidata type is something else (nature reserve, Ramsar site, conservation area...): looked up by exact English name
EXTRA = ['Maasai Mara', 'Masai Mara', 'Maasai Mara National Reserve', 'Okavango Delta', 'Ngorongoro Conservation Area', 'Samburu National Reserve', 'Lake Nakuru National Park', 'Sabi Sand Game Reserve',
         'Greater Kruger National Park', 'Kgalagadi Transfrontier Park', 'Selous Game Reserve', 'Nyerere National Park', 'Moremi Game Reserve', 'Chobe National Park', 'Hluhluwe–Imfolozi Park',
         'iSimangaliso Wetland Park', 'Etosha National Park', 'Bwindi Impenetrable National Park', 'Virunga National Park', 'Ranthambore National Park', 'Pantanal', 'Svalbard', 'Gal\u00e1pagos Islands',
         'Great Barrier Reef Marine Park', 'Monterey Bay National Marine Sanctuary', 'Channel Islands National Marine Sanctuary', 'Kaikoura', 'Iguazu National Park', 'Tortuguero National Park']
for nm in EXTRA:
    rows = sparql('SELECT ?p ?pLabel ?c ?iso WHERE { ?p rdfs:label "%s"@en ; wdt:P625 ?c ; wdt:P17 ?cty . ?cty wdt:P297 ?iso . BIND("%s"@en AS ?pLabel) } LIMIT 6' % (nm, nm))
    for r in rows or []:
        m = re.match(r'(?i)Point\(([-\d.eE+]+) ([-\d.eE+]+)\)', r['c']['value'])
        if m: base.setdefault(qid(r), {'wikidata': qid(r), 'name': nm, 'type': 'wild', 'country': r['iso']['value'], 'lat': round(float(m.group(2)), 4), 'lng': round(float(m.group(1)), 4), 'class': 'curated'})
    time.sleep(1)
print('base', len(base), flush=True)
for v in base.values(): v.update({'id': 'wild-%s-%s' % (slug(v['name']), v['wikidata'].lower()), 'url': None, 'area_km2': None, 'unesco': False, 'sitelinks': 0, 'image_file': None})
ids = list(base)
def enrich(prop_query, apply):
    for i in range(0, len(ids), 250):
        vals = ' '.join('wd:' + x for x in ids[i:i + 250])
        rows = sparql(prop_query.replace('VALS', vals))
        if rows is None: print('  enrich failed for chunk', i, flush=True); continue
        for r in rows: apply(base[qid(r)], r)
        time.sleep(2)
enrich('SELECT ?p ?site WHERE { VALUES ?p { VALS } ?p wdt:P856 ?site }', lambda e, r: e.__setitem__('url', e['url'] or r['site']['value']))
enrich('SELECT ?p ?img WHERE { VALUES ?p { VALS } ?p wdt:P18 ?img }', lambda e, r: e.__setitem__('image_file', e['image_file'] or 'File:' + urllib.parse.unquote(r['img']['value'].rsplit('/', 1)[-1])))
UNIT_KM2 = {'Q712226': 1.0, 'Q35852': 0.01, 'Q25343': 1e-6, 'Q232291': 2.58999, 'Q81292': 0.00404686, 'Q2737347': 0.01}   # km2, hectare, m2, sq mi, acre
def set_area(e, r):
    f = UNIT_KM2.get(r['u']['value'].rsplit('/', 1)[-1]); 
    if f: e['area_km2'] = max(e['area_km2'] or 0, round(float(r['a']['value']) * f, 1))
enrich('SELECT ?p ?a ?u WHERE { VALUES ?p { VALS } ?p p:P2046/psv:P2046 ?v . ?v wikibase:quantityAmount ?a ; wikibase:quantityUnit ?u }', set_area)
enrich('SELECT ?p WHERE { VALUES ?p { VALS } ?p wdt:P1435 wd:Q9259 }', lambda e, r: e.__setitem__('unesco', True))
out = sorted(base.values(), key=lambda x: (x['country'], x['name']))
json.dump(out, open(os.path.join(ROOT, 'raw', 'wild_roster.json'), 'w'), indent=0, ensure_ascii=False)
print('total', len(out), '| site', sum(bool(x['url']) for x in out), '| area', sum(bool(x['area_km2']) for x in out), '| img', sum(bool(x['image_file']) for x in out), '| unesco', sum(x['unesco'] for x in out))
