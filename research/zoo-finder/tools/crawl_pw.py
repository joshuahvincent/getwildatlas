"""Headless-browser crawl for the places whose sites block plain downloads or build their pages with JavaScript.
Same output layout as crawl.py (html/<id>/<sha>.html + index.json), so analyze.py and assemble.py run unchanged.
Run with the venv python:  PLAYWRIGHT_BROWSERS_PATH=cache_local/pw-browsers ROSTER=roster_pw.json TAG=pw REGION=us-east cache_local/pw/bin/python tools/crawl_pw.py [place-id ...]
Polite: a real Chrome user agent, one page at a time per site, 1 s pause, at most MAX_PAGES pages per site, public pages only."""
import hashlib, json, os, re, sys, time
from urllib.parse import urljoin, urlparse, urldefrag
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import WORK as HERE, region_places
import crawl as C   # KW / BAD patterns and same_site, shared with the plain crawler
from playwright.sync_api import sync_playwright
MAX_PAGES = int(os.environ.get('MAX_PAGES', '40'))
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'

EXTRA = re.compile(r'(exhibit|explore|meet-|/meet|fish|shark|/rays?\b|aquatic|marine|penguin|otter|habitat|gallery|galleries|wildlife|creature|critter|living-collection|our-animals|the-animals)')
def consider(u, host):
    u = urldefrag(u)[0]
    if not u.startswith('http') or not C.same_site(u, host): return False
    if re.search(r'\.(jpg|jpeg|png|gif|webp|pdf|zip|mp4|svg)(\?|$)', u, re.I): return False
    if C.BAD.search(u.lower()): return False
    return bool(C.KW.search(u.lower()) or EXTRA.search(u.lower()))

def crawl_one(place):
    pid = place['id']; d = os.path.join(HERE, 'html', pid); os.makedirs(d, exist_ok=True)
    idxf = os.path.join(d, 'index.json')
    if os.path.exists(idxf) and not os.environ.get('FORCE'): return pid, 'cached'
    if not place.get('url'): return pid, 'no url'
    idx = {'place': pid, 'start': place['url'], 'home_status': None, 'final': None, 'pages': {}, 'sitemap_urls': 0, 'via': 'playwright'}
    try:
        with sync_playwright() as pw:
            br = pw.chromium.launch(); ctx = br.new_context(user_agent=UA, locale='en-US', viewport={'width': 1366, 'height': 900}); pg = ctx.new_page()
            pg.set_default_timeout(25000)
            def fetch(u):
                try:
                    r = pg.goto(u, wait_until='domcontentloaded')
                    try: pg.wait_for_load_state('networkidle', timeout=6000)
                    except Exception: pass
                    html = pg.content(); st = r.status if r else None
                except Exception as e:
                    return None, None, None
                return st, pg.url, html
            def save(u, st, final, html):
                h = hashlib.sha1(u.encode()).hexdigest()[:16]
                open(os.path.join(d, h + '.html'), 'w', encoding='utf-8').write(html)
                idx['pages'][u] = {'file': h + '.html', 'status': st, 'final': final, 'fetched_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
            st, final, html = fetch(place['url'])
            if st is None and place['url'].startswith('http://'): st, final, html = fetch('https://' + place['url'][7:])
            idx['home_status'] = st; idx['final'] = final
            if st is None or st >= 400 or not html:
                json.dump(idx, open(idxf, 'w'), indent=0); br.close(); return pid, 'home fail %s' % st
            host = urlparse(final).netloc.lower().replace('www.', '')
            save(final, st, final, html)
            def links():
                try: return pg.eval_on_selector_all('a[href]', 'els => els.map(e => e.href)')
                except Exception: return []
            todo = list(dict.fromkeys(u for u in links() if consider(u, host)))
            seen = {final}; rounds = 0
            while todo and len(seen) < MAX_PAGES and rounds < 3:
                rounds += 1; nxt = []
                for u in todo:
                    if u in seen or len(seen) >= MAX_PAGES: continue
                    seen.add(u); time.sleep(1.0)
                    st, fin, html = fetch(u)
                    if st is None or not html: idx['pages'][u] = {'status': None}; continue
                    save(u, st, fin, html)
                    if st == 200 and rounds < 3 and len(urlparse(u).path.strip('/').split('/')) <= 3:
                        nxt += [x for x in links() if consider(x, host) and x not in seen]
                todo = list(dict.fromkeys(nxt))
            br.close()
    except Exception as e:
        json.dump(idx, open(idxf, 'w'), indent=0); return pid, 'error ' + repr(e)[:80]
    json.dump(idx, open(idxf, 'w'), indent=0, ensure_ascii=False)
    return pid, 'ok pages=%d' % len(idx['pages'])

if __name__ == '__main__':
    places = region_places(include_done=True)
    json.dump(places, open(os.path.join(HERE, 'places.json'), 'w'))
    only = set(sys.argv[1:])
    if only: places = [p for p in places if p['id'] in only]
    with ThreadPoolExecutor(int(os.environ.get('PAR', '4'))) as ex:
        for pid, msg in ex.map(crawl_one, places): print(pid, msg, flush=True)
