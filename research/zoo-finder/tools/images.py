"""Fill place photos from Wikimedia Commons via Wikidata P18. Writes raw/images_commons.json {place_id: {image_file, image_license, image_author}}.
Free-licence only (CC / public domain); everything else is skipped. Polite: identified UA, batching, backoff on 429."""
import json, glob, os, re, time, urllib.parse, urllib.request, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'WildAtlas-zoo-finder/1.0 (https://wildatlasapp.com)'
def api(base, params, tries=6):
    url = base + '?' + urllib.parse.urlencode(params)
    for i in range(tries):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40))
        except Exception as e:
            time.sleep(3 * (i + 1))
    return {}
places = {}
for f in glob.glob(os.path.join(ROOT, 'raw', 'sweep_*.json')) + glob.glob(os.path.join(ROOT, 'raw', 'out_*.json')):
    for p in json.load(open(f)).get('places', []):
        places.setdefault(p['id'], p)
roster = {i['id']: i for i in json.load(open(os.path.join(ROOT, 'raw', 'roster.json')))['institutions']}
outp = os.path.join(ROOT, 'raw', 'images_commons.json')
out = json.load(open(outp)) if os.path.exists(outp) else {}
need = {}
for pid, p in places.items():
    if p.get('image_file') or pid in out: continue
    q = p.get('wikidata') or (roster.get(pid) or {}).get('wikidata')
    if q and re.fullmatch(r'Q\d+', q): need[pid] = q
print(len(need), 'places need photos', flush=True)
items = list(need.items())
p18 = {}
for i in range(0, len(items), 40):
    chunk = items[i:i + 40]
    d = api('https://www.wikidata.org/w/api.php', {'action': 'wbgetentities', 'ids': '|'.join(q for _, q in chunk), 'props': 'claims', 'format': 'json'})
    for pid, q in chunk:
        cl = ((d.get('entities') or {}).get(q) or {}).get('claims', {}).get('P18') or []
        if cl:
            v = cl[0]['mainsnak'].get('datavalue', {}).get('value')
            if v: p18[pid] = 'File:' + v
    time.sleep(1.5)
print(len(p18), 'have P18', flush=True)
files = list(p18.items())
for i in range(0, len(files), 30):
    chunk = files[i:i + 30]
    d = api('https://commons.wikimedia.org/w/api.php', {'action': 'query', 'titles': '|'.join(f for _, f in chunk), 'prop': 'imageinfo', 'iiprop': 'extmetadata', 'format': 'json', 'redirects': 1})
    norm = {n['from']: n['to'] for n in (d.get('query') or {}).get('normalized', [])}
    redir = {n['from']: n['to'] for n in (d.get('query') or {}).get('redirects', [])}
    meta = {pg['title']: (pg.get('imageinfo') or [{}])[0].get('extmetadata', {}) for pg in (d.get('query') or {}).get('pages', {}).values()}
    for pid, f in chunk:
        t = redir.get(norm.get(f, f), norm.get(f, f)); m = meta.get(t) or {}
        lic = (m.get('LicenseShortName') or {}).get('value', '')
        if not re.search(r'^(CC|Public domain|PD|No restrictions|GFDL)', lic, re.I): continue
        au = re.sub(r'<[^>]+>', '', html.unescape((m.get('Artist') or {}).get('value', ''))).strip()[:120]
        out[pid] = {'image_file': f, 'image_license': lic, 'image_author': au or 'Unknown'}
    time.sleep(1.5)
    json.dump(out, open(outp, 'w'), indent=0, ensure_ascii=False)
json.dump(out, open(outp, 'w'), indent=0, ensure_ascii=False)
print('free-licence photos for', len(out), 'places')
