"""Validate raw/sweep_*.json before loading into D1. Exit 1 on any hard error."""
import json, glob, os, sys, collections
RAW = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'raw')
animal_ids = set()
for f in glob.glob(os.path.join(RAW, '*.animals.json')):
    animal_ids |= {a['id'] for a in json.load(open(f))}
roster = {i['id'] for i in json.load(open(os.path.join(RAW, 'roster.json')))['institutions']} if os.path.exists(os.path.join(RAW, 'roster.json')) else set()
hard = 0
for f in sorted(glob.glob(os.path.join(RAW, 'sweep_*.json'))):
    d = json.load(open(f)); errs = collections.Counter(); warn = collections.Counter()
    pids = {p['id'] for p in d.get('places', [])}
    for p in d.get('places', []):
        if p.get('lat') is None or p.get('lng') is None: errs['place missing coords'] += 1
        if roster and p['id'] not in roster and p.get('type') != 'museum': warn['place not in roster'] += 1
        if not p.get('accreditation'): errs['place missing accreditation'] += 1
    for h in d.get('holdings', []):
        if h['animal_id'] not in animal_ids: errs['unknown animal_id'] += 1
        if h['place_id'] not in pids and h['place_id'] not in roster: errs['holding place unknown'] += 1
        if not h.get('source_url'): errs['holding without source_url'] += 1
        elif 'wikipedia.org' in h['source_url']: errs['wikipedia source'] += 1
        if h.get('match') not in ('exact', 'related'): errs['bad match value'] += 1
        if h.get('match') == 'related' and not (h.get('via') and h.get('related_rationale')): errs['related without via/rationale'] += 1
        if h.get('confidence') not in ('HIGH', 'MED'): errs['bad confidence'] += 1
    for x in d.get('fetches', []):
        if not x.get('r2_key'): warn['fetch without r2_key'] += 1
    n = sum(errs.values()); hard += n
    print(os.path.basename(f), 'places', len(pids), 'holdings', len(d.get('holdings', [])), 'fetches', len(d.get('fetches', [])),
          'ERRORS' if n else 'ok', dict(errs), 'warn', dict(warn))
sys.exit(1 if hard else 0)
