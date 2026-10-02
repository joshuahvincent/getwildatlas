"""Map each app animal to GBIF taxon keys from the scientific-name patterns in tools/taxa.py ('Genus species' or 'Genus *').
Writes raw/gbif_keys.json: {animal_id: [{key, rank, name, match, via, rat}]}"""
import json, os, sys, time, urllib.parse, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import taxa
ROOT = os.path.dirname(HERE); UA = 'WildAtlas-zoo-finder/1.0 (https://wildatlasapp.com)'
cache = {}
def match(name, rank=None):
    if (name, rank) in cache: return cache[(name, rank)]
    u = 'https://api.gbif.org/v1/species/match?kingdom=Animalia&name=' + urllib.parse.quote(name) + ('&rank=' + rank if rank else '')
    for i in range(6):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=60)); break
        except Exception: d = {}; time.sleep(5 * (i + 1))
    time.sleep(0.25); cache[(name, rank)] = d; return d
def genus_search(name):
    # fallback: GBIF backbone search (the match endpoint returns only the kingdom for some bare genus names)
    u = 'https://api.gbif.org/v1/species?name=%s&rank=GENUS&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&limit=10' % urllib.parse.quote(name)
    for i in range(4):
        try:
            res = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=60))['results']; break
        except Exception: res = []; time.sleep(4 * (i + 1))
    time.sleep(0.25)
    for r in res:
        if r.get('taxonomicStatus') == 'ACCEPTED' and r.get('kingdom') == 'Animalia': return r
    return None
out, miss = {}, []
for aid, t in taxa.T.items():
    rows = []
    for pat, m, via, rat in t['sci']:
        genus_only = pat.endswith(' *'); nm = pat[:-2] if genus_only else pat
        d = match(nm, 'genus' if genus_only else None)
        key = d.get('genusKey') if genus_only else (d.get('speciesKey') or d.get('usageKey'))
        if genus_only and d.get('rank') == 'GENUS': key = d.get('usageKey')
        if genus_only and (not key or d.get('matchType') in (None, 'NONE') or d.get('rank') == 'KINGDOM'):
            g = genus_search(nm)
            if g: d = {'scientificName': g['scientificName'], 'rank': 'GENUS'}; key = g['key']
            else: key = None
        if not key or (not genus_only and d.get('matchType') in (None, 'NONE')): miss.append((aid, pat)); continue
        if d.get('rank') not in ('SPECIES', 'GENUS', 'SUBSPECIES', 'VARIETY'):   # never accept a higher-rank match (e.g. the whole animal kingdom)
            miss.append((aid, pat + ' [rank ' + str(d.get('rank')) + ']')); continue
        rows.append({'key': key, 'rank': d.get('rank'), 'name': d.get('scientificName'), 'match': m, 'via': via, 'rat': rat})
    out[aid] = rows
json.dump(out, open(os.path.join(ROOT, 'raw', 'gbif_keys.json'), 'w'), indent=0)
print(len(out), 'animals;', sum(len(v) for v in out.values()), 'keys;', len(miss), 'unmatched', miss[:8])
