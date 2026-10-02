"""Export the wildatlas-places D1 database -> static JSON served from /assets/zoos/ (places.json, animals.json, a/<animal>.json).
The database is the source of truth; this regenerates what the page reads. Needs wrangler logged in to the Wild Atlas Cloudflare account.
Usage (from the website repo root):  python3 scripts/zoos/export_site_data.py <path to wrangler binary>"""
import json, os, subprocess, sys, datetime
# a row is shown as 'unconfirmed' if its evidence is weak OR the monthly liveness check flagged it (needs_review / changed / unchecked)
WEAK_STATUS = {'needs_review', 'changed'}
def weak(h): return h['evidence_tier'] != 'strong' or h['check_status'] in WEAK_STATUS
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WR = sys.argv[1]
OUT = os.path.join(ROOT, 'assets', 'zoos')
TODAY = datetime.date.today().isoformat()
import tempfile, time
def q(sql):
    for attempt in range(4):
        r = subprocess.run([WR, 'd1', 'execute', 'wildatlas-places', '--remote', '--json', '--command', sql], capture_output=True, text=True, cwd=tempfile.gettempdir())
        try:
            d = json.loads(r.stdout)
            if isinstance(d, list): return d[0]['results']
            err = str(d)[:300]
        except Exception:
            err = (r.stdout + r.stderr)[:300]
        print('D1 query failed (attempt %d): %s' % (attempt + 1, err), file=sys.stderr); time.sleep(5)
    sys.exit('D1 query failed')
groups = {k: v for k, v in json.load(open(os.path.join(ROOT, 'scripts', 'zoos', 'groups.json'))).items() if not k.startswith('_')}
group_of = {m: k for k, g in groups.items() for m in g['members']}
animals = q("select id, common_name, pack, wild_only, in_the_wild from animals where pack in ('safari_stars','ocean_creatures','rainforest_explorers','feathered_friends','reptile_world','wild_americas','planet_pioneers','dino_roars','farm_friends','calendar') order by pack, common_name")
anim = {a['id']: a for a in animals}
places = q("select id,name,type,town,region,country,lat,lng,url,accreditation,image_file,image_license,image_author,status,area_km2,unesco from places where status='open' and lat is not null and lng is not null order by country, name")
pidx = {p['id']: i for i, p in enumerate(places)}
hold = q("select place_id,animal_id,match,species_seen,via,related_rationale,evidence_tier,check_status,display_until,source_url,confidence,obs_count from holdings where check_status!='gone' and animal_id in (select id from animals where pack in ('safari_stars','ocean_creatures','rainforest_explorers','feathered_friends','reptile_world','wild_americas','planet_pioneers','dino_roars','farm_friends','calendar'))")
wild_ids = {p['id'] for p in places if p['type'] == 'sanctuary'}
by_animal, by_place_animals = {}, {}
for h in hold:
    if h['place_id'] not in pidx: continue
    if h['display_until'] and h['display_until'] < TODAY: continue
    by_animal.setdefault(h['animal_id'], []).append(h)
    if h['match'] == 'exact' and wild_ids.isdisjoint({h['place_id']}): by_place_animals.setdefault(h['place_id'], set()).add(h['animal_id'])

def photo_ext(p):
    return 1 if p.get('image_file') else 0
P = []
for p in places:
    cr = ''
    if p.get('image_file'):
        cr = ((p.get('image_license') or '') + ' · ' + (p.get('image_author') or '')).strip(' ·')[:110]
    wildp = p['type'] == 'sanctuary'
    P.append({'id': p['id'], 'n': p['name'], 't': 'wild' if wildp else p['type'], 'la': round(p['lat'], 4), 'lo': round(p['lng'], 4), 'ci': p.get('town') or '', 'rg': p.get('region') or '', 'cc': p.get('country') or '',
              'u': p.get('url') or '', 'ac': p.get('accreditation') or '', 'ph': photo_ext(p), 'cr': cr, 'wf': p['image_file'] if p.get('image_file') else '', **({'un': 1} if p.get('unesco') else {})})
os.makedirs(os.path.join(OUT, 'a'), exist_ok=True)
json.dump([{k: v for k, v in p.items() if k != 'wf'} for p in P], open(os.path.join(OUT, 'places.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
json.dump({p['id']: p['wf'] for p in P if p['wf']}, open(os.path.join(ROOT, 'scripts', 'zoos', 'photo_files.json'), 'w'), indent=0)
farm_idx = [pidx[p['id']] for p in places if p['type'] == 'farm']
cover = []
for aid, a in anim.items():
    kind = groups.get(group_of.get(aid), {}).get('kind') or ('farm' if a['pack'] == 'farm_friends' else 'dino' if a['pack'] == 'dino_roars' else 'wild')
    hs = by_animal.get(aid, [])
    zh = [h for h in hs if h['place_id'] not in wild_ids]
    e = sorted(([pidx[h['place_id']], (1 if weak(h) else 0), h['species_seen'] or '', h['display_until'] or ''] for h in zh if h['match'] == 'exact'), key=lambda x: (x[1], x[0]))
    r = sorted(([pidx[h['place_id']], h['via'] or '', h['related_rationale'] or '', (1 if weak(h) else 0)] for h in zh if h['match'] == 'related'), key=lambda x: (x[3], x[0]))
    # in the wild (national parks / reserves): [place index, recorded sightings, relative-or-empty]
    w = sorted(([pidx[h['place_id']], h['obs_count'] or 0, (h['via'] or '') if h['match'] == 'related' else ''] for h in hs if h['place_id'] in wild_ids), key=lambda x: -x[1])
    taken = {x[0] for x in e} | {x[0] for x in r}
    g = []
    gk = group_of.get(aid)
    if gk and kind == 'farm':
        g = [[i, ''] for i in farm_idx if i not in taken]
    elif gk:
        mem = set(groups[gk]['members']) - {aid}
        for p in places:
            have = sorted(by_place_animals.get(p['id'], set()) & mem)
            if have and pidx[p['id']] not in taken and p['type'] != 'farm':
                g.append([pidx[p['id']], ','.join(have[:3])])
    doc = {'id': aid, 'name': a['common_name'], 'kind': kind, 'wild_only': bool(a['wild_only']), 'e': e, 'r': r, 'g': g, 'w': w}
    if gk: doc['group'] = {'key': gk, 'label': groups[gk]['label']}
    json.dump(doc, open(os.path.join(OUT, 'a', aid + '.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
    if a['pack'] != 'calendar': cover.append({'id': aid, 'n': a['common_name'], 'pack': a['pack'], 'k': kind, 'e': len(e), 'r': len(r), 'g': len(g), 'w': len(w)})
json.dump({'generated': TODAY, 'animals': cover, 'groups': {k: {'label': v['label'], 'members': v['members']} for k, v in groups.items()}}, open(os.path.join(OUT, 'animals.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
print('places', len(P), 'animals', len(cover), 'holdings used', sum(len(v) for v in by_animal.values()))
