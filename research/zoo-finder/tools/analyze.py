"""Match crawled pages to the 126 animals. Writes cands/<place>.json with per-page evidence."""
import json, os, re, sys, unicodedata, glob
from urllib.parse import urlparse, unquote
from bs4 import BeautifulSoup
import taxa
try:
    import taxa_i18n
except ImportError:
    taxa_i18n = None

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import WORK as HERE, RAW
SS_ANIMALS = {a['id'] for a in json.load(open(os.path.join(RAW, 'safari_stars.animals.json')))}

def strip_acc(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))

def norm(s):
    s = strip_acc(s.lower()).replace('’', "'").replace('‘', "'")
    s = re.sub(r"[^\w' ]+", ' ', s.replace('-', ' '))
    return re.sub(r'\s+', ' ', s).strip()

# ---- common-name phrase table (longest first) ----
CJK_RX = re.compile(r'[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff\uac00-\ud7af]')
KATA = re.compile(r'^[\u30a1-\u30fa\u30fc]+$')
CJK_PHR = {}   # phrase (NFKC) -> aid, for Japanese / Chinese / Korean names: matched as substrings because those scripts have no spaces
if taxa_i18n:
    for _aid, _names in taxa_i18n.I.items():
        if _aid not in taxa.T: continue
        for _n in _names:
            if CJK_RX.search(_n): CJK_PHR.setdefault(unicodedata.normalize('NFKC', _n), _aid)
            else: taxa.T[_aid]['names'].append(_n)   # Cyrillic goes through the normal word matcher
_kata = sorted([p for p in CJK_PHR if KATA.match(p)], key=lambda k: -len(k)); _oth = sorted([p for p in CJK_PHR if not KATA.match(p)], key=lambda k: -len(k))
CJK_KATA_RX = re.compile(r'(?<![\u30a1-\u30fa\u30fc])(' + '|'.join(re.escape(p) for p in _kata) + r')(?![\u30a1-\u30fa\u30fc])') if _kata else None
CJK_OTH_RX = re.compile('(' + '|'.join(re.escape(p) + ('(?!터)' if p == '하마' else '') for p in _oth) + ')') if _oth else None
PHR = {}
for aid, t in taxa.T.items():
    for n in t['names']:
        PHR.setdefault(norm(n), (aid, 'exact', None, None))
for aid, t in taxa.T.items():
    for n, via, rat in t['rel']:
        k = norm(n)
        if k not in PHR:
            PHR[k] = (aid, 'related', via, rat)
for n in taxa.NEG:
    k = norm(n)
    if k and k not in PHR:
        PHR[k] = (None, None, None, None)
PHR.pop('', None)
PKEYS = sorted(PHR, key=lambda k: -len(k))
PRE = re.compile(r"(?<![\w'])(" + '|'.join(re.escape(k) for k in PKEYS) + r")(?![\w])")

def name_hits(text):
    """return list of (aid, match, via, rat, phrase) using longest-first, non-overlapping."""
    out = []
    for m in PRE.finditer(norm(text)):
        v = PHR[m.group(1)]
        if v[0]:
            out.append((*v, m.group(1)))
    if CJK_PHR and CJK_RX.search(text):
        t = unicodedata.normalize('NFKC', text); seen = set()
        for rx in (CJK_KATA_RX, CJK_OTH_RX):
            if rx is None: continue
            for m in rx.finditer(t):
                aid = CJK_PHR.get(m.group(1))
                if aid and aid not in seen: seen.add(aid); out.append((aid, 'exact', None, None, m.group(1)))
    return out

# ---- scientific names ----
SCI = []  # (regex, aid, match, via, rat, pattern)
for aid, t in taxa.T.items():
    for pat, match, via, rat in t['sci']:
        parts = pat.split()
        if parts[1] == '*':
            rx = re.compile(r'\b' + parts[0] + r'\s+([a-z]{3,})(\s+[a-z]{3,})?\b')
        else:
            rx = re.compile(r'\b' + r'\s+'.join(parts) + r'(\s+[a-z]{3,})?\b')
        SCI.append((rx, aid, match, via, rat, pat))
NOT_EPITHET = {'and', 'the', 'est', 'and', 'with', 'sont', 'son', 'que', 'des', 'les', 'del', 'por', 'per', 'che', 'para', 'con', 'une', 'sur', 'nel', 'dei', 'jest', 'sich', 'und', 'der', 'die', 'das', 'ist', 'has', 'was', 'are', 'from', 'aus', 'von'}
BINOM = re.compile(r'\b([A-Z][a-z]{2,})\s+([a-z]{3,})(?:\s+([a-z]{3,}))?\b')

def sci_hits(text):
    res = {}
    for rx, aid, match, via, rat, pat in SCI:
        for m in rx.finditer(text):
            s = m.group(0)
            if '*' in pat and m.group(1) in NOT_EPITHET:
                continue
            words = s.split()
            if len(words) == 3 and words[2] in NOT_EPITHET:
                s = ' '.join(words[:2])
            prev = res.get(aid)
            # exact beats related
            if prev is None or (prev['match'] == 'related' and match == 'exact'):
                res[aid] = {'sci': s, 'match': match, 'via': via, 'rat': rat, 'pat': pat}
            break
    return res

DEPART = re.compile(r"(not currently on view|no longer (?:at|in|live|here|on)|has moved|have moved|in memoriam|n'est plus (?:présent|visible|au|là)|ne sont plus (?:présent|visible|au|là)|n'est plus pr[ée]sent|plus visible au|ya no (?:está|se encuentra|vive)|non (?:è|sono) più (?:presenti|presente|visibile)|j[ií]ž (?:nechov|nen[ií] v)|už (?:nechov|nen[ií] v)|nie ma już|már nem (?:él|látható)|nicht mehr (?:zu sehen|im zoo)|temporarily not viewable|temporairement fermé|we said goodbye|passed away|est décédé|est morte|est mort |ha fallecido|è morto|è morta|zemřel|zemřela|odešel|nie żyje|elpusztult|was euthanized|fue sacrificad)", re.I)

GENERIC_SPECIES = {  # species_seen when only a common name is seen
    'parrot': 'Psittaciformes (species not named)', 'macaw': 'Ara / Anodorhynchus (species not named)', 'cockatoo': 'Cacatuidae (species not named)',
    'lemur': 'Lemuriformes (species not named)', 'gecko': 'Gekkota (species not named)', 'viper': 'Viperidae (species not named)',
    'dolphin': 'Delphinidae (species not named)', 'jellyfish': 'Scyphozoa (species not named)', 'starfish': 'Asteroidea (species not named)',
    'seahorse': 'Hippocampus (species not named)', 'rhinoceros': 'Rhinocerotidae (species not named)', 'zebra': 'Equus (zebra, species not named)',
    'flamingo': 'Phoenicopterus (species not named)', 'crocodile': 'Crocodylidae (species not named)', 'monitor_lizard': 'Varanus (species not named)',
    'skink': 'Scincidae (species not named)', 'iguana': 'Iguanidae (species not named)', 'tree_frog': 'Hylidae (species not named)',
    'poison_dart_frog': 'Dendrobatidae (species not named)', 'toucan': 'Ramphastidae (species not named)', 'sloth': 'Choloepus/Bradypus (species not named)',
    'camel': 'Camelus (species not named)', 'kangaroo': 'Macropus/Osphranter (species not named)', 'swan': 'Cygnus (species not named)',
    'sea_turtle': 'Cheloniidae (species not named)', 'octopus': 'Octopoda (species not named)', 'moray_eel': 'Muraenidae (species not named)',
    'clownfish': 'Amphiprion (species not named)', 'sea_lion': 'Otariidae (sea lion, species not named)', 'armadillo': 'Cingulata (species not named)',
    'hummingbird': 'Trochilidae (species not named)', 'woodpecker': 'Picidae (species not named)', 'anaconda': 'Eunectes (species not named)',
    'orangutan': 'Pongo (species not named)', 'tapir': 'Tapirus (species not named)', 'hyena': 'Hyaenidae (species not named)', 'giraffe': 'Giraffa (species not named)',
    'gorilla': 'Gorilla gorilla', 'baboon': 'Papio (species not named)', 'leafcutter_ant': 'Atta/Acromyrmex (species not named)', 'howler_monkey': 'Alouatta (species not named)',
    'spider_monkey': 'Ateles (species not named)', 'glass_frog': 'Centrolenidae (species not named)', 'rattlesnake': 'Crotalus (species not named)', 'sea_snake': 'Hydrophiinae (species not named)',
    'bearded_dragon': 'Pogona (species not named)', 'african_elephant': 'Loxodonta africana', 'alligator': 'Alligator (species not named)', 'hammerhead_shark': 'Sphyrna (species not named)',
    'albatross': 'Diomedeidae', 'horned_lizard': 'Phrynosoma', 'prairie_dog': 'Cynomys (species not named)', 'roadrunner': 'Geococcyx', 'box_turtle': 'Terrapene', 'capybara': 'Hydrochoerus hydrochaeris',
    'african_buffalo': 'Syncerus caffer', 'warthog': 'Phacochoerus africanus', 'emperor_penguin': 'Aptenodytes forsteri',
}
def default_species(aid):
    if aid in GENERIC_SPECIES:
        return GENERIC_SPECIES[aid]
    for pat, match, via, rat in taxa.T[aid]['sci']:
        if match == 'exact' and '*' not in pat:
            return pat
    return aid

def title_parts(soup):
    h1 = [h.get_text(' ', strip=True) for h in soup.find_all('h1')]
    t = soup.title.get_text(' ', strip=True) if soup.title else ''
    tseg = re.split(r'\s[|\-–—:·»]\s|\s[|–—]|[|–—]\s', t)
    return [x for x in h1 if x][:2], [x.strip() for x in tseg if x.strip()][:1]

ANIMAL_PATH = re.compile(taxa.__dict__.get('ANIMAL_PATH', r'(animal|animaux|animales|animais|animali|especie|espece|specie|species|fauna|zvir|zv%c3%ad%c5%99|zvíř|zwierz|allat|%c3%a1llat|állat|zivotinj|životinj|zvierat|hayvan|tiere|fiche|ficha|scheda|bestiar|lexikon|encyklop|atlas|pensionnaire|chovan|gatun|druh|residents|mammi|mamif|oiseau|aves|uccell|ptac|ptak|madar|reptil|plaz|gady|amphib|poisson|peces|pesci|peix|ryby|halak|sisavc|ptice|gmaz|memeli|kus|loomad|dzivniek|gyvun|zival)'), re.I)
ANIMAL_PATH = re.compile(ANIMAL_PATH.pattern + r'|dobutsu|doubutsu|ikimono|zukan|dongwu|dongmul|exhibit|動物|动物|生き物|生物|동물|животн')

def analyze_place(pid):
    d = os.path.join(HERE, 'html', pid)
    idxf = os.path.join(d, 'index.json')
    if not os.path.exists(idxf):
        return None
    idx = json.load(open(idxf))
    ss_done = pid in SS_PLACES
    hits = []   # dicts
    for url, meta in idx['pages'].items():
        if not meta.get('file') or meta.get('status') != 200:
            continue
        final = meta.get('final') or url
        if urlparse(final).path.strip('/') == '' and urlparse(url).path.strip('/') != '':
            continue  # redirected to home
        try:
            raw = open(os.path.join(d, meta['file']), 'rb').read()
            soup = BeautifulSoup(raw, 'lxml')
        except Exception:
            continue
        h1s, tseg = title_parts(soup)
        for tag in soup(['script', 'style', 'noscript', 'nav', 'header', 'footer', 'form', 'select', 'svg']):
            tag.decompose()
        for tag in soup.find_all(attrs={'class': re.compile(r'(menu|navbar|breadcrumb|footer|header|cookie|related|similar|autres|otros|altri|dalsi|inne|more-animals|carousel|slider)', re.I)}):
            tag.decompose()
        body = soup.body or soup
        text = body.get_text(' ', strip=True)
        text = re.sub(r'\s+', ' ', text)
        depart = DEPART.search(text)
        sh = sci_hits(text)
        # italic binomials (page's own latin names)
        itals = [re.sub(r'\s+', ' ', i.get_text(' ', strip=True)) for i in body.find_all(['i', 'em'])][:15]
        itals_bin = [x for x in itals if BINOM.fullmatch(x.strip()) or re.fullmatch(r'[A-Z][a-z]+ [a-z]+( [a-z]+)?', x.strip())]
        head = ' | '.join(h1s + tseg)
        th = name_hits(' | '.join(h1s)) or name_hits(' | '.join(tseg))
        head_sci = sci_hits(head)
        top = text[:1500]
        top_sci = sci_hits(top)
        page_is_animalish = bool(ANIMAL_PATH.search(unquote(url).lower()))
        # --- species page via title ---
        title_aids = []
        for aid, match, via, rat, phrase in th:
            if aid in title_aids:
                continue
            title_aids.append(aid)
            ev = {'url': url, 'final': final, 'fetched_at': meta.get('fetched_at'), 'file': meta['file'], 'kind': 'title', 'head': head[:120], 'phrase': phrase, 'animalish': page_is_animalish, 'depart': depart.group(0) if depart else None}
            if aid in sh:
                s = sh[aid]
                hits.append({**ev, 'aid': aid, 'match': s['match'] if match == 'exact' else 'related', 'sci': s['sci'], 'via': s['via'] or via, 'rat': s['rat'] or rat, 'sci_confirmed': True})
            else:
                # contradiction check: page's own italic binomial that is not ours
                own = [x for x in itals_bin if not sci_hits(x)]
                hn = norm(' | '.join(h1s) or ' | '.join(tseg))
                exactish = (hn == phrase) or (len(phrase.split()) >= 2) or (hn.startswith(phrase) and len(hn.split()) <= 3)
                if own and not sh:
                    ev['contradict'] = own[:2]
                hits.append({**ev, 'aid': aid, 'match': match, 'sci': None, 'via': via, 'rat': rat, 'sci_confirmed': False, 'exactish': exactish, 'contradict': ev.get('contradict')})
        # --- sci names in heading / top of page (species pages whose title is local-only) ---
        for aid, s in {**top_sci, **head_sci}.items():
            if aid in title_aids:
                continue
            if len(sh) <= 3 or aid in head_sci:
                hits.append({'url': url, 'final': final, 'fetched_at': meta.get('fetched_at'), 'file': meta['file'], 'kind': 'sci_top', 'head': head[:120], 'aid': aid, 'match': s['match'], 'sci': s['sci'], 'via': s['via'], 'rat': s['rat'], 'sci_confirmed': True, 'animalish': page_is_animalish, 'depart': depart.group(0) if depart else None, 'n_sci': len(sh)})
        # --- listing pages: many sci names ---
        if len(sh) >= 4 and not title_aids:
            for aid, s in sh.items():
                hits.append({'url': url, 'final': final, 'fetched_at': meta.get('fetched_at'), 'file': meta['file'], 'kind': 'list_sci', 'head': head[:120], 'aid': aid, 'match': s['match'], 'sci': s['sci'], 'via': s['via'], 'rat': s['rat'], 'sci_confirmed': True, 'animalish': page_is_animalish, 'depart': None, 'n_sci': len(sh)})
        # --- listing pages: anchor texts ---
        if page_is_animalish:
            seen = set()
            for a in body.find_all('a', href=True):
                at = a.get_text(' ', strip=True)
                if not at or len(at) > 60:
                    continue
                href = a['href']
                if not ANIMAL_PATH.search(unquote(href).lower()):
                    continue
                nh = name_hits(at)
                if len(nh) != 1:
                    continue
                aid, match, via, rat, phrase = nh[0]
                an = norm(at)
                if not (an == phrase or (len(phrase.split()) >= 2 and len(an.split()) <= len(phrase.split()) + 2) or (an.startswith(phrase) and len(an.split()) <= 3)):
                    continue
                if aid in seen:
                    continue
                seen.add(aid)
                asci = sci_hits(at)
                hits.append({'url': url, 'final': final, 'fetched_at': meta.get('fetched_at'), 'file': meta['file'], 'kind': 'anchor', 'head': head[:120], 'aid': aid, 'match': match, 'sci': asci.get(aid, {}).get('sci'), 'via': via, 'rat': rat, 'sci_confirmed': aid in asci, 'animalish': True, 'depart': None, 'anchor': at, 'href': href})
    return hits

SS_PLACES = {p['id'] for p in json.load(open(os.path.join(RAW, 'out_safari_stars.json')))['places']}

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'cands'), exist_ok=True)
    places = json.load(open(os.path.join(HERE, 'places.json')))
    only = set(sys.argv[1:])
    for p in places:
        if only and p['id'] not in only:
            continue
        h = analyze_place(p['id'])
        if h is None:
            continue
        if p['id'] in SS_PLACES:
            h = [x for x in h if x['aid'] not in SS_ANIMALS]
        json.dump(h, open(os.path.join(HERE, 'cands', p['id'] + '.json'), 'w'), ensure_ascii=False, indent=0)
        print(p['id'], len(h), len({x['aid'] for x in h}))
