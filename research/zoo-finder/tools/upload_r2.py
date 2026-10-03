"""Upload the page captures referenced by raw/sweep_*.json 'fetches' to the private R2 bucket (8 parallel wrangler puts).
Skips keys already uploaded (tracked in db/uploaded_keys.txt). Run from ANY dir except analytics-worker/."""
import json, os, glob, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WR = '/Users/joshuahv/Documents/Codex Projects/analytics-worker/node_modules/.bin/wrangler'
BUCKET = 'wildatlas-places-cache'
done_f = os.path.join(ROOT, 'db', 'uploaded_keys.txt')
done = set(open(done_f).read().split('\n')) if os.path.exists(done_f) else set()
todo = []
for f in glob.glob(os.path.join(ROOT, 'raw', 'sweep_*.json')):
    for x in json.load(open(f)).get('fetches', []):
        if x.get('local') and x['r2_key'] not in done:
            todo.append((x['r2_key'], os.path.join(ROOT, x['local'])))
print(len(todo), 'to upload', flush=True)
def put(a):
    key, path = a
    if not os.path.exists(path): return key, False
    r = subprocess.run([WR, 'r2', 'object', 'put', BUCKET + '/' + key, '--file', path, '--content-type', 'text/html', '--remote'], capture_output=True, cwd='/private/tmp/claude-501/-Users-joshuahv-Documents-Codex-Projects-PetPeeper-Pack-Generation-Skill--claude-worktrees-zoo-finder-page-0ef080/bb282c0d-0863-4b7e-bf8b-5c7113861541/scratchpad')
    return key, r.returncode == 0
ok = fail = 0
with ThreadPoolExecutor(8) as ex, open(done_f, 'a') as out:
    for key, good in ex.map(put, todo):
        if good: ok += 1; out.write(key + '\n'); out.flush()
        else: fail += 1
print('uploaded', ok, 'failed', fail)
