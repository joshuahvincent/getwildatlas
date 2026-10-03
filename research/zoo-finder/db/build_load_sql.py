"""Compile research/zoo-finder/raw/*.json into db/load.sql for D1 wildatlas-places.
Idempotent: INSERT OR IGNORE for places/holdings, upsert for animals."""
import json, glob, os, re, sys, unicodedata
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'raw')
APP_MASTER = sys.argv[1]  # path to PetPeeper/data/output/v4/wild_atlas_v4_master_structured_full.json
TODAY = '2026-10-01'

def q(v):
    if v is None: return 'NULL'
    if isinstance(v, (int, float)): return repr(v)
    return "'" + str(v).replace("'", "''") + "'"

def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'\(.*?\)', '', s)
    s = re.sub(r'\b(the|of|and|museum|natural|history|science|sciences|nature|national|university)\b', ' ', s)
    return re.sub(r'[^a-z]+', ' ', s).strip()

out = []
# animals
arr = json.load(open(APP_MASTER))['animals']
notes = {}
for f in (glob.glob(os.path.join(RAW, 'out_*.json')) + glob.glob(os.path.join(RAW, 'sweep_*.json'))):
    notes.update(json.load(open(f)).get('notes_per_animal') or {})
for a in arr:
    t = a.get('taxonomy') or {}
    n = notes.get(a['id'], {})
    out.append("INSERT INTO animals (id,common_name,scientific_name,pack,wild_only,in_the_wild) VALUES (%s,%s,%s,%s,%s,%s) "
               "ON CONFLICT(id) DO UPDATE SET common_name=excluded.common_name, scientific_name=excluded.scientific_name, pack=excluded.pack;"
               % (q(a['id']), q(a.get('common_name')), q(t.get('scientific_name')), q(a['category']['pack_id']),
                  1 if n.get('wild_only') else 0, q(n.get('in_the_wild'))))

# extra (calendar) animals: GBIF-only, hidden from the /zoos/ search (pack 'calendar'); added so their park sightings have an animal row to attach to
extra_p = os.path.join(RAW, 'extra_animals.json')
if os.path.exists(extra_p):
    for a in json.load(open(extra_p)):
        out.append("INSERT INTO animals (id,common_name,scientific_name,pack,wild_only,in_the_wild) VALUES (%s,%s,%s,'calendar',0,NULL) ON CONFLICT(id) DO UPDATE SET common_name=excluded.common_name, scientific_name=excluded.scientific_name;"
                   % (q(a['id']), q(a['name']), q(a['sci'].replace(' *', ''))))
# places
ID_FIX = {'museum-f-r-naturkunde': 'museum-fur-naturkunde', 'museo-del-jur-sico-de-asturias': 'museo-del-jurasico-de-asturias'}
places, by_qid, by_norm = {}, {}, {}
STATUS = {  # verified closures from research hand-backs (2026-09-30)
  'academy-of-natural-sciences-of-drexel-university': ('closed', 'Closed permanently 2026-09-27 (Philadelphia Inquirer).'),
  'galerie-de-pal-ontologie-et-d-anatomie-compar-e': ('temporarily_closed', 'Closed for renovation 2026-01-19 to late 2027.'),
}
for f in sorted((glob.glob(os.path.join(RAW, 'out_*.json')) + glob.glob(os.path.join(RAW, 'sweep_*.json')))):
    for p in json.load(open(f))['places']:
        qid = p.get('wikidata') or (p.get('coord_source') or '').split('wikidata:')[-1] if 'wikidata' in (p.get('coord_source') or '') or p.get('wikidata') else None
        p['id'] = ID_FIX.get(p['id'], p['id'])
        if p['id'] in places or (qid and qid in by_qid):
            continue
        places[p['id']] = p
        if qid: by_qid[qid] = p['id']
        by_norm[norm(p['name'])] = p['id']
        st, note = STATUS.get(p['id'], ('open', None))
        # type 'wild' (national park / reserve) is stored as 'sanctuary' (see schema.sql); the export maps it back to 'wild'
        out.append("INSERT OR IGNORE INTO places (id,name,type,town,region,country,lat,lng,coord_source,wikidata_qid,url,accreditation,accreditation_source,accreditation_checked,image_file,image_license,image_author,status,status_note,first_seen,last_verified,area_km2,unesco) VALUES (%s);"
                   % ','.join(q(x) for x in [p['id'], p['name'], 'sanctuary' if p['type'] == 'wild' else p['type'], p.get('town'), p.get('region'), p.get('country'), p.get('lat'), p.get('lng'),
                                             p.get('coord_source'), qid, p.get('url'), p.get('accreditation'), p.get('accreditation_source'), TODAY,
                                             p.get('image_file'), p.get('image_license'), p.get('image_author'), st, note, TODAY, TODAY, p.get('area_km2'), 1 if p.get('unesco') else 0]))

farms_p = os.path.join(RAW, 'farms_osm.json')
if os.path.exists(farms_p):
    for fid, p in json.load(open(farms_p)).items():
        out.append("INSERT OR IGNORE INTO places (id,name,type,town,region,country,lat,lng,coord_source,wikidata_qid,url,accreditation,accreditation_checked,status,first_seen,last_verified) VALUES (%s);"
                   % ','.join(q(x) for x in [fid, p['name'], 'farm', p.get('town'), p.get('region'), p.get('country'), p['lat'], p['lng'], p['coord_source'], p.get('wikidata'), p.get('url'), 'none', TODAY, 'open', TODAY, TODAY]))
        places[fid] = p

MUSEUM_ALIAS = {  # hand-back museum names that don't normalise to the place name
  'smithsonian national museum of natural history': 'national-museum-of-natural-history',
  'burke museum': 'burke-museum-of-natural-history-and-culture',
  'museo jurasico de asturias': 'museo-del-jurasico-de-asturias',
  'royal belgian institute of natural sciences': 'royal-belgian-institute-of-natural-sciences',
  'naturhistorisches museum wien': 'natural-history-museum-vienna',
  'senckenberg naturmuseum frankfurt': 'senckenberg-natural-history-museum',
  'museum fur naturkunde berlin': 'museum-fur-naturkunde',
}
def museum_id(name):
    base = re.sub(r'\s*\(.*?\)', '', name).split(' / ')[0]
    key = unicodedata.normalize('NFKD', base).encode('ascii', 'ignore').decode().lower()
    for k, v in MUSEUM_ALIAS.items():
        if key.startswith(k) and v in places: return v
    n = norm(base)
    if n in by_norm: return by_norm[n]
    return None  # no fuzzy substring fallback: it silently misrouted Berlin/MUJA to the Smithsonian

def holding(h, pid, verified_by):
    if not h.get('source_url') or 'wikipedia.org' in h['source_url']:
        return None
    return ("INSERT OR IGNORE INTO holdings (place_id,animal_id,match,species_seen,via,related_rationale,source_url,evidence,confidence,display_until,first_seen,last_verified,verified_by,source_fingerprint,check_status,next_due,evidence_tier,obs_count) VALUES (%s);"
            % ','.join(q(x) for x in [pid, h['animal_id'], h['match'], h.get('species_seen'), h.get('via'), h.get('related_rationale'), h['source_url'],
                                      h.get('evidence'), h.get('confidence'), h.get('display_until'), TODAY, TODAY, verified_by, FP.get(h['source_url']), 'ok',
                                      '2027-09-30' if h['animal_id'] != 'octopus' else '2026-12-31', h.get('evidence_tier', 'strong'), h.get('obs_count')]))

FP = {}   # source_url -> fingerprint (from sweep 'fetches')
for f in sorted(glob.glob(os.path.join(RAW, 'sweep_*.json'))):
    for x in json.load(open(f)).get('fetches', []):
        FP[x['url']] = x.get('fingerprint')
        out.append("INSERT OR IGNORE INTO fetches (url,fetched_at,http_status,method,r2_key,fingerprint,bytes) VALUES (%s);"
                   % ','.join(q(v) for v in [x['url'], x.get('fetched_at'), x.get('http_status'), x.get('method'), x.get('r2_key'), x.get('fingerprint'), x.get('bytes')]))
unmatched, dropped, n = [], 0, 0
for f in sorted((glob.glob(os.path.join(RAW, 'out_*.json')) + glob.glob(os.path.join(RAW, 'sweep_*.json')))):
    for h in json.load(open(f)).get('holdings', []):
        s = holding(h, h['place_id'], 'agent:' + os.path.basename(f))
        if s: out.append(s); n += 1
        else: dropped += 1
for f in sorted(glob.glob(os.path.join(RAW, 'dino_part_*.json'))):
    for h in json.load(open(f))['holdings']:
        pid = museum_id(h['museum'])
        if not pid: unmatched.append(h['museum']); continue
        s = holding(h, pid, 'agent:' + os.path.basename(f))
        if s: out.append(s); n += 1
        else: dropped += 1

open(os.path.join(ROOT, 'db', 'load.sql'), 'w').write('\n'.join(out) + '\n')
print('places', len(places), 'holdings', n, 'dropped', dropped, 'unmatched museums', sorted(set(unmatched)))

# overrides (appended after inserts so they win)
ov = json.load(open(os.path.join(RAW, 'overrides.json')))
extra = []
for o in ov.get('holdings', []):
    extra.append("UPDATE holdings SET check_status=%s WHERE place_id LIKE %s AND animal_id=%s;" % (q(o['check_status']), q(o['place_id'] + '%'), q(o['animal_id'])))
open(os.path.join(ROOT, 'db', 'load.sql'), 'a').write('\n'.join(extra) + '\n')
print('overrides', len(extra))

# photos from Commons (tools/images.py); only fills places that have none
imgp = os.path.join(RAW, 'images_commons.json')
if os.path.exists(imgp):
    im = json.load(open(imgp)); upd = []
    for pid, v in im.items():
        upd.append("UPDATE places SET image_file=%s,image_license=%s,image_author=%s WHERE id=%s AND image_file IS NULL;" % (q(v['image_file']), q(v['image_license']), q(v['image_author']), q(pid)))
    open(os.path.join(ROOT, 'db', 'load.sql'), 'a').write('\n'.join(upd) + '\n')
    open(os.path.join(ROOT, 'db', 'images_only.sql'), 'w').write('\n'.join(upd) + '\n')
    print('image updates', len(upd))
