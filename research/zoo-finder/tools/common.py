"""Shared paths for the zoo-finder sweep tools. Usage: REGION=us-east python3 tools/crawl.py"""
import os, json, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'raw')
REGIONS = {
    'us-west': 'US-West', 'us-central': 'US-Central', 'us-east': 'US-East', 'canada-latam': 'Canada+LatAm',
    'uk-ie': 'UK+IE', 'central-north-europe': 'DE+AT+CH+Benelux+Nordics',
    'south-europe': 'FR+ES+PT+IT+rest-of-Europe', 'oceania-asia-africa': 'Oceania+Asia+Africa',
}
REGION = os.environ.get('REGION') or ''
if REGION not in REGIONS:
    sys.exit('set REGION to one of: ' + ', '.join(REGIONS))
TAG = os.environ.get('TAG', '')   # TAG=x2: a second pass (the extra, unaccredited places) with its own cache dir and sweep file
WORK = os.path.join(ROOT, 'cache_local', REGION + TAG)
os.makedirs(WORK, exist_ok=True)

def done_places():
    """place ids already swept (pilots + any sweep_*.json written by an agent or by assemble.py)."""
    ids = set()
    for f in os.listdir(RAW):
        if f == 'sweep_%s%s.json' % (REGION, TAG):
            continue  # our own scripted output is recomputed each run
        if f.startswith(('out_institution_pilot', 'sweep_')) and f.endswith('.json'):
            ids |= {p['id'] for p in json.load(open(os.path.join(RAW, f))).get('places', [])}
    return ids

def region_places(include_done=None):
    if include_done is None: include_done = bool(os.environ.get('ALL'))   # ALL=1: re-crawl every roster place (a new species list needs fresh pages)
    roster = json.load(open(os.path.join(RAW, os.environ.get('ROSTER', 'roster.json'))))['institutions']
    done = set() if include_done else done_places()
    return [i for i in roster if i.get('sweep_region') == REGIONS[REGION] and i['id'] not in done]
