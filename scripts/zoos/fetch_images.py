"""Download a 420px-wide copy of each place's Wikimedia Commons photo into assets/zoos/img/<place-id>.jpg (re-runnable; skips existing).
Photos are free-licence only (see scripts/zoos/photo_files.json); credits are shown on the page from places.json 'cr'."""
import json, os, sys, time, io, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
files = json.load(open(os.path.join(ROOT, 'scripts', 'zoos', 'photo_files.json')))
out = os.path.join(ROOT, 'assets', 'zoos', 'img'); os.makedirs(out, exist_ok=True)
UA = 'WildAtlas-zoo-finder/1.0 (https://wildatlasapp.com)'
def get(pid):
    dest = os.path.join(out, pid + '.jpg')
    if os.path.exists(dest): return pid, 'have'
    name = files[pid].split(':', 1)[1].replace(' ', '_')
    W = 320 if pid.startswith('wild-') else 420   # national-park photos are smaller to keep the site light (thousands of parks)
    url = 'https://commons.wikimedia.org/wiki/Special:FilePath/%s?width=%d' % (urllib.parse.quote(name), W)
    for i in range(4):
        try:
            b = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40).read()
            im = Image.open(io.BytesIO(b)).convert('RGB')
            if im.width > W: im = im.resize((W, round(im.height * W / im.width)))
            im.save(dest, 'JPEG', quality=66 if W == 320 else 72, optimize=True, progressive=True)
            time.sleep(0.3)
            return pid, 'ok'
        except Exception as e:
            time.sleep(4 * (i + 1)); err = repr(e)[:60]
    return pid, 'FAIL ' + err
res = {}
with ThreadPoolExecutor(3) as ex:
    for pid, st in ex.map(get, list(files)):
        res[st.split()[0]] = res.get(st.split()[0], 0) + 1
        if st.startswith('FAIL'): print(pid, st, flush=True)
print(res)
