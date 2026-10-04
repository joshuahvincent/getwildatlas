"""Crawl each south-europe place once: sitemaps + homepage + animal index pages (depth 2).
Raw HTML -> html/<place_id>/<sha1>.html ; index -> html/<place_id>/index.json
"""
import json, os, re, sys, hashlib, time, gzip, threading
from urllib.parse import urljoin, urlparse, urldefrag
from concurrent.futures import ThreadPoolExecutor
import requests
from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import WORK as HERE, region_places
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
H = {'User-Agent': UA, 'Accept-Language': 'en,fr,es,it,pt,cs,pl,hu;q=0.8', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'}
KW = re.compile(r'(dobutsu|doubutsu|ikimono|zukan|seibutsu|kaiyo|%e5%8b%95%e7%89%a9|%e5%8a%a8%e7%89%a9|%e7%94%9f%e3%81%8d%e7%89%a9|%e7%94%9f%e7%89%a9|dongwu|dongmul|%eb%8f%99%eb%ac%bc|zhivotn|%d0%b6%d0%b8%d0%b2%d0%be%d1%82%d0%bd|exhibit|animal|animaux|animales|animais|animali|animale|especie|espece|esp%c3%a8ce|espèce|specie|species|fauna|zvir|zvíř|zv%c3%ad%c5%99|zwierz|allat|%c3%a1llat|állat|zivotinj|životinj|zvierat|hayvan|tiere|fiche|ficha|scheda|bestiar|pensionnaire|chovan|druh|gatun|lexikon|encyklop|atlas|bewohner|zival|žival|loomad|dzivniek|dzīvniek|gyvun|gyvūn|residents|inhabitants|residentes|habitantes|abitanti|ospiti|lakoink|lak%c3%b3|lakó|mieszka|obyvatel|chovance|mammal|mammif|mamifer|mammiferi|savci|ssaki|eml%c5%91s|emlős|bird|oiseau|aves|uccelli|ptaci|ptaki|madar|madár|reptil|plazi|gady|hull%c3%b3|hüllő|amphib|poisson|peces|pesci|peixes|ryby|halak|sisak|sisavci|ptice|gmizavci|kusi|memeli|kuşlar|surungen)', re.I)
BAD = re.compile(r'(aktual|novink|nowosci|/actus|novedad|novita|/article|/articol|magazin|/news|/actualit|/noticias|/notizie|/noticia|/aktuality|/aktualnosci|/hirek|/h%c3%adrek|/blog|/evenement|/event|/agenda|/eventos|/eventi|/udalosti|/wydarzen|/esemeny|/boutique|/shop|/tienda|/negozio|/obchod|/sklep|/billet|/ticket|/entradas|/biglietti|/vstupen|/bilet|/jegy|/presse|/press|/prensa|/stampa|/tisk|/prasa|/sajto|/job|/emploi|/empleo|/lavora|/kariera|/praca|/\?|\.pdf$|\.jpe?g$|\.png$|\.webp$|\.gif$|\.mp4$|\.zip$|\.doc|/wp-content/|/wp-json|/feed|/tag/|/author/|/category/|/cart|/panier|/login|/account|/de/|/nl/|/ru/|/zh/|/ja/|/uk/|/ko/)', re.I)
MAX_PAGES = int(os.environ.get('MAX_PAGES', '900'))
lock = threading.Lock()

def get(sess, url, timeout=20):
    try:
        r = sess.get(url, headers=H, timeout=timeout, allow_redirects=True)
        return r
    except Exception as e:
        return None

def parse_sitemap(sess, url, seen, out, depth=0):
    if url in seen or len(seen) > 80 or depth > 3:
        return
    seen.add(url)
    r = get(sess, url)
    if r is None or r.status_code != 200:
        return
    data = r.content
    if url.endswith('.gz'):
        try: data = gzip.decompress(data)
        except Exception: pass
    txt = data.decode('utf-8', 'ignore')
    if '<urlset' not in txt and '<sitemapindex' not in txt:
        return
    locs = re.findall(r'<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)', txt)
    if '<sitemapindex' in txt:
        # prioritise sitemaps likely to hold animals; skip image/news/product ones
        locs.sort(key=lambda u: 0 if KW.search(u) else (2 if re.search(r'(image|news|product|post_tag|author|event|attachment)', u, re.I) else 1))
        for l in locs[:40]:
            if re.search(r'(image|product|post_tag|author|attachment)', l, re.I):
                continue
            parse_sitemap(sess, l.replace('&amp;', '&'), seen, out, depth + 1)
    else:
        out.update(l.replace('&amp;', '&') for l in locs)

def same_site(u, host):
    h = urlparse(u).netloc.lower().replace('www.', '')
    return h == host or h.endswith('.' + host) or host.endswith('.' + h)

def crawl(place):
    try:
        return _crawl(place)
    except Exception as e:
        return place['id'], 'error ' + repr(e)[:80]

def _crawl(place):
    pid = place['id']
    if not place.get('url'):
        return pid, 'no url in roster'
    d = os.path.join(HERE, 'html', pid)
    os.makedirs(d, exist_ok=True)
    idxf = os.path.join(d, 'index.json')
    if os.path.exists(idxf) and not os.environ.get('FORCE'):
        return pid, 'cached'
    sess = requests.Session()
    start = place['url']
    r = get(sess, start)
    if r is None and start.startswith('http://'):
        start = 'https://' + start[7:]; r = get(sess, start)
    idx = {'place': pid, 'start': start, 'home_status': getattr(r, 'status_code', None), 'final': getattr(r, 'url', None), 'pages': {}, 'sitemap_urls': 0}
    if r is None or r.status_code >= 400:
        json.dump(idx, open(idxf, 'w'), indent=0); return pid, f'home fail {idx["home_status"]}'
    final = r.url
    host = urlparse(final).netloc.lower().replace('www.', '')
    root = f'{urlparse(final).scheme}://{urlparse(final).netloc}'
    # sitemaps
    sm = set()
    rb = get(sess, root + '/robots.txt')
    sms = []
    if rb is not None and rb.status_code == 200:
        sms = re.findall(r'(?im)^\s*sitemap:\s*(\S+)', rb.text)
    sms += [root + '/sitemap.xml', root + '/sitemap_index.xml', root + '/wp-sitemap.xml', root + '/sitemap-index.xml']
    seen = set()
    for s in dict.fromkeys(sms):
        parse_sitemap(sess, s, seen, sm)
    idx['sitemap_urls'] = len(sm)
    cands = set()
    def consider(u):
        u = urldefrag(u)[0]
        if not u.startswith('http') or not same_site(u, host):
            return False
        path = urlparse(u).path
        if BAD.search(u.lower()):
            return False
        return bool(KW.search(u.lower()))
    for u in sm:
        if consider(u): cands.add(u)
    pages = {}
    def save(u, resp):
        h = hashlib.sha1(u.encode()).hexdigest()[:16]
        fn = os.path.join(d, h + '.html')
        open(fn, 'wb').write(resp.content)
        pages[u] = {'file': h + '.html', 'status': resp.status_code, 'final': resp.url, 'fetched_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
    save(final, r)
    def links(resp):
        try:
            soup = BeautifulSoup(resp.content, 'lxml')
        except Exception:
            return []
        return [urldefrag(urljoin(resp.url, a.get('href')))[0] for a in soup.find_all('a', href=True)]
    # homepage links, depth-1 index pages
    level = [u for u in links(r) if consider(u)]
    frontier = list(dict.fromkeys(level))
    # also any homepage link whose anchor path is short and keyword-y is in frontier already
    fetched = {final}
    todo = list(dict.fromkeys(frontier + sorted(cands, key=len)))
    depth_links = 0
    with ThreadPoolExecutor(6) as ex:
        rounds = 0
        while todo and len(fetched) < MAX_PAGES and rounds < 3:
            rounds += 1
            batch = [u for u in todo if u not in fetched][:MAX_PAGES - len(fetched)]
            fetched.update(batch)
            res = list(ex.map(lambda u: (u, get(sess, u)), batch))
            new = []
            for u, resp in res:
                if resp is None: pages[u] = {'status': None}; continue
                if 'html' not in resp.headers.get('content-type', 'html'): continue
                save(u, resp)
                if resp.status_code == 200 and rounds < 3:
                    # expand from shallow pages (index-like) only
                    if len(urlparse(u).path.strip('/').split('/')) <= 3:
                        new += [x for x in links(resp) if consider(x) and x not in fetched]
            todo = list(dict.fromkeys(new))
    idx['pages'] = pages
    json.dump(idx, open(idxf, 'w'), indent=0, ensure_ascii=False)
    return pid, f'ok sitemap={len(sm)} cands={len(cands)} pages={len(pages)}'

if __name__ == '__main__':
    places = region_places()
    json.dump(places, open(os.path.join(HERE, 'places.json'), 'w'))
    only = set(sys.argv[1:])
    if only: places = [p for p in places if p['id'] in only]
    with ThreadPoolExecutor(int(os.environ.get('PAR', '10'))) as ex:
        for pid, msg in ex.map(crawl, places):
            print(pid, msg, flush=True)
