"""Add GBIF keys for the extra (calendar) animals in raw/extra_animals.json to raw/gbif_keys.json. These animals are GBIF-only: park sightings, no zoo rows,
hidden from the /zoos/ animal search (pack 'calendar')."""
import json, os, sys, time, urllib.parse, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); UA = 'WildAtlas-zoo-finder/1.0 (https://wildatlasapp.com)'
extra = json.load(open(os.path.join(ROOT, 'raw', 'extra_animals.json'))); keys = json.load(open(os.path.join(ROOT, 'raw', 'gbif_keys.json')))
def get(u):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=60))
        except Exception: time.sleep(4 * (i + 1))
    return {}
for a in extra:
    genus = a['sci'].endswith(' *'); nm = a['sci'][:-2] if genus else a['sci']
    if genus:
        res = get('https://api.gbif.org/v1/species?name=%s&rank=GENUS&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&limit=10' % urllib.parse.quote(nm)).get('results', [])
        g = next((r for r in res if r.get('taxonomicStatus') == 'ACCEPTED' and r.get('kingdom') == 'Animalia'), None)
        row = {'key': g['key'], 'rank': 'GENUS', 'name': g['scientificName'], 'match': 'exact', 'via': None, 'rat': None} if g else None
    else:
        d = get('https://api.gbif.org/v1/species/match?kingdom=Animalia&name=' + urllib.parse.quote(nm))
        ok = d.get('matchType') in ('EXACT', 'FUZZY') and d.get('rank') in ('SPECIES', 'SUBSPECIES')
        row = {'key': d.get('speciesKey') or d.get('usageKey'), 'rank': 'SPECIES', 'name': d.get('scientificName'), 'match': 'exact', 'via': None, 'rat': None} if ok else None
    print(a['id'], a['sci'], '->', (row['key'], row['name']) if row else 'NOT MATCHED', flush=True)
    if row: keys[a['id']] = [row]
    time.sleep(0.3)
json.dump(keys, open(os.path.join(ROOT, 'raw', 'gbif_keys.json'), 'w'), indent=0)
