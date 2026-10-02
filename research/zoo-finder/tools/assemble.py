"""Turn cands/<place>.json (analyze.py output) into raw/sweep_<region>.json + review queue.
Auto-accept only strong evidence; everything else goes to review/<region>.jsonl for a cheap-model or human pass.
Usage: REGION=us-east python3 tools/assemble.py"""
import json, os, sys, hashlib, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import WORK, RAW, REGION, REGIONS, ROOT, region_places
import analyze as A

TODAY = '2026-10-01'
places_in = region_places()
coords_cache = json.load(open(os.path.join(ROOT, 'raw', 'coords_osm.json'))) if os.path.exists(os.path.join(ROOT, 'raw', 'coords_osm.json')) else {}
out_places, holdings, fetches, review, failed = [], [], [], [], []
fetch_seen = set()

def snippet(h):
    who = h.get('anchor') or h.get('phrase') or h.get('sci') or ''
    return ("Own page '%s' names %s." % ((h.get('head') or '')[:70], who))[:200]

for p in places_in:
    idxf = os.path.join(WORK, 'html', p['id'], 'index.json')
    cf = os.path.join(WORK, 'cands', p['id'] + '.json')
    lat, lng, csrc = p.get('lat'), p.get('lng'), p.get('coord_source')
    if lat is None and p['id'] in coords_cache:
        lat, lng, csrc = coords_cache[p['id']]['lat'], coords_cache[p['id']]['lng'], coords_cache[p['id']]['coord_source']
    if lat is None:
        failed.append({'id': p['id'], 'why': 'no coordinates'}); continue
    # 2026-10-02: an accredited place stays on the map even when its website blocks scripts or crawls thin; it just has no animal rows from the crawl
    out_places.append({'id': p['id'], 'name': p['name'], 'type': p['type'], 'town': p.get('town'), 'region': p.get('region'), 'country': p.get('country'),
                       'lat': lat, 'lng': lng, 'coord_source': csrc, 'url': p['url'], 'accreditation': ','.join(p['accreditation']),
                       'accreditation_source': ';'.join(p.get('accreditation_source') or []) or None, 'wikidata': p.get('wikidata'),
                       'image_file': None, 'image_license': None, 'image_author': None})
    if not os.path.exists(idxf) or not os.path.exists(cf):
        failed.append({'id': p['id'], 'why': 'not crawled', 'kept': True}); continue
    idx = json.load(open(idxf))
    if not idx.get('home_status') or idx['home_status'] >= 400 or len(idx.get('pages', {})) < 2:
        failed.append({'id': p['id'], 'why': 'home %s, pages %d' % (idx.get('home_status'), len(idx.get('pages', {}))), 'kept': True}); continue
    by_aid = {}
    for h in json.load(open(cf)):
        by_aid.setdefault(h['aid'], []).append(h)
    for aid, hs in by_aid.items():
        good = [h for h in hs if not h.get('depart') and not h.get('contradict')]
        if not good:
            review.append({'place': p['id'], 'animal': aid, 'why': 'departure/contradiction text', 'url': hs[0]['url'], 'head': hs[0].get('head')}); continue
        strong = [h for h in good if h.get('sci_confirmed') and h['kind'] in ('title', 'sci_top', 'list_sci', 'anchor')] or \
                 [h for h in good if h['kind'] == 'title' and h.get('animalish') and h.get('exactish', True)]
        tier = 'strong'
        if not strong:   # Josh 2026-10-01: err on the side of inclusion; show as unconfirmed, ranked below strong, under the call-ahead notice
            strong = good; tier = 'weak'
        ex = [h for h in strong if h['match'] == 'exact']
        best = (ex or strong)[0]
        key = (p['id'], aid, best['match'])
        species = best.get('sci') or A.default_species(aid)
        hold = {'place_id': p['id'], 'animal_id': aid, 'match': best['match'], 'species_seen': species,
                'via': None if best['match'] == 'exact' else best.get('via'),
                'related_rationale': None if best['match'] == 'exact' else best.get('rat'),
                'source_url': best.get('final') or best['url'], 'evidence': snippet(best),
                'confidence': 'HIGH' if (best.get('sci_confirmed') and tier == 'strong') else 'MED', 'evidence_tier': tier}
        if best['match'] == 'related' and not (hold['via'] and hold['related_rationale']):
            review.append({'place': p['id'], 'animal': aid, 'why': 'related without via', 'url': best['url'], 'head': best.get('head')}); continue
        holdings.append(hold)
        fp = best.get('file')
        if fp and (p['id'], fp) not in fetch_seen:
            fetch_seen.add((p['id'], fp))
            raw = open(os.path.join(WORK, 'html', p['id'], fp), 'rb').read()
            fetches.append({'url': best.get('final') or best['url'], 'fetched_at': best.get('fetched_at') or TODAY, 'http_status': 200, 'method': 'script',
                            'r2_key': 'sweep-2026-10/%s/%s/%s' % (REGION, p['id'], fp), 'local': os.path.join('cache_local', REGION, 'html', p['id'], fp),
                            'fingerprint': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)})

json.dump({'batch': REGION, 'researched': TODAY, 'method': 'scripted-crawl', 'places': out_places, 'holdings': holdings, 'fetches': fetches,
           'notes_per_animal': {}, 'stats': {'places': len(out_places), 'holdings_exact': sum(h['match'] == 'exact' for h in holdings), 'holdings_related': sum(h['match'] == 'related' for h in holdings),
                                              'minutes_spent_estimate': 0, 'urls_fetched': len(fetches), 'blocked_urls': len(failed)},
           'method_notes': 'tools/crawl.py + analyze.py + assemble.py; auto-accepted strong evidence only'},
          open(os.path.join(RAW, 'sweep_%s%s.json' % (REGION, os.environ.get('TAG', ''))), 'w'), ensure_ascii=False)
os.makedirs(os.path.join(ROOT, 'review'), exist_ok=True)
with open(os.path.join(ROOT, 'review', REGION + os.environ.get('TAG', '') + '.jsonl'), 'w') as f:
    for r in review: f.write(json.dumps(r, ensure_ascii=False) + '\n')
json.dump(failed, open(os.path.join(ROOT, 'review', REGION + os.environ.get('TAG', '') + '.failed_places.json'), 'w'), indent=0)
print(REGION, 'places', len(out_places), 'holdings', len(holdings), 'review', len(review), 'failed', len(failed))
