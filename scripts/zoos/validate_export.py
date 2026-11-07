"""Validate assets/zoos/ before publishing (getwildatlas#79). Exit 1 on any error.
Checks the schema/places_rev pairing, that every row index points at the right kind of place in places.json,
and that animals.json counts match the per-animal files.   Usage: python3 scripts/zoos/validate_export.py [dir]"""
import json, os, sys, hashlib
D = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'assets', 'zoos')
err, warn = [], []
raw = open(os.path.join(D, 'places.json'), 'rb').read()
P = json.loads(raw); N = len(P)
rev = hashlib.sha256(raw).hexdigest()[:12]
man = json.load(open(os.path.join(D, 'manifest.json'))); A = json.load(open(os.path.join(D, 'animals.json')))
for name, doc in (('manifest.json', man), ('animals.json', A)):
    if not isinstance(doc.get('schema'), int): err.append(name + ': schema missing')
    if doc.get('places_rev') != rev: err.append('%s: places_rev %s != places.json %s' % (name, doc.get('places_rev'), rev))
if man.get('places') != N: err.append('manifest places %s != %d' % (man.get('places'), N))
if len({p['id'] for p in P}) != N: err.append('duplicate place ids in places.json')
cover = {a['id']: a for a in A['animals']}
files = sorted(f[:-5] for f in os.listdir(os.path.join(D, 'a')) if f.endswith('.json'))
if set(files) != set(cover): err.append('animals.json ids and a/*.json differ: %s' % sorted(set(files) ^ set(cover))[:5])
if man.get('animals') != len(cover): err.append('manifest animals %s != %d' % (man.get('animals'), len(cover)))
for aid in files:
    d = json.load(open(os.path.join(D, 'a', aid + '.json'))); c = cover.get(aid)
    if d.get('id') != aid: err.append(aid + ': id mismatch')
    if d.get('schema') != A.get('schema'): err.append(aid + ': schema mismatch')
    if d.get('places_rev') != rev: err.append(aid + ': places_rev mismatch')
    for k in ('e', 'r', 'g', 'w'):
        for row in d.get(k, []):
            if not (isinstance(row[0], int) and 0 <= row[0] < N): err.append('%s.%s: index %r out of range' % (aid, k, row[0])); continue
            wild = P[row[0]]['t'] == 'wild'
            if (k == 'w') != wild: err.append('%s.%s: row %d is a %s place' % (aid, k, row[0], P[row[0]]['t']))
    if c and (c['e'], c['r'], c['g'], c['w']) != tuple(len(d.get(k, [])) for k in ('e', 'r', 'g', 'w')): err.append(aid + ': animals.json counts differ from file')
    if len({r[0] for r in d['e']}) != len(d['e']): warn.append(aid + ': same place twice in e (different species rows)')
for w in warn: print('warn:', w)
for e in err: print('ERROR:', e)
print('places %d animals %d places_rev %s: %s' % (N, len(files), rev, 'FAIL' if err else 'ok'))
sys.exit(1 if err else 0)
