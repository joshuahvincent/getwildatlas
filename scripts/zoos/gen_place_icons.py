"""Generate the four place-type tile icons (zoo, aquarium, museum, farm) with Gemini 2.5 Flash Image, following the
wild-atlas-icon-generator skill rules. Needs GEMINI_API_KEY in the environment (kept in PetPeeper/.env.local; never printed).
Usage: set -a && source <PetPeeper>/.env.local && set +a && python3 scripts/zoos/gen_place_icons.py [slug ...]"""
import base64, io, json, os, sys, urllib.request
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'zoos', 'icons')
MODEL = 'gemini-2.5-flash-image'
STYLE = ("A standalone Wild Atlas icon in the same world as the Wild Atlas mascots. Warm pastel palette matching the mascot family "
         "(warm pastel gold, soft cream, warm teal, soft peach), dark warm-brown outlines. Flat illustration style, simple flat color fills with only "
         "subtle soft tonal shading, no gloss, no specular highlights, no 3D rendering. Rounded, cute, child-friendly proportions. "
         "Premium storybook / family-animation-inspired charm. One main object and at most one tiny accent. Simple, highly readable silhouette. "
         "Readable at 48px. No text, no numbers, no clutter. Isolated on a plain flat soft cream background (#EFE4CB), centered with generous margin.")
NEG = "3D render, glossy, specular highlight, dimensional shading, faceted, gemstone, sharp corners, corporate flat design, realism, clutter, text, gradients, neon"
ICONS = {
  'zoo': "Show a single cute friendly giraffe head and neck with soft peach-gold coat and teal patches, peeking over a short rounded cream picket fence. Tiny accent: one small soft green leaf in its mouth.",
  'aquarium': "Show a single cute chunky rounded aquarium tank with thick soft cream glass edges, soft warm teal water, and one happy round peach fish inside. Tiny accent: two or three small bubbles.",
  'museum': "Show a single cute chunky rounded dinosaur skull fossil in soft cream bone color with simple rounded teeth, resting on a small warm pastel gold display base. Tiny accent: one small flat gold 4-point star.",
  'wild': "Show a single cute chunky rounded flat-topped acacia tree in soft green with a warm brown trunk, standing on a small mound of soft peach-gold savanna ground. Tiny accent: a small soft gold sun behind it.",
  'farm': "Show a single cute chunky rounded barn in soft peach with cream trim, a warm teal roof, and a friendly arched door. Tiny accent: a small soft gold sun peeking behind it.",
}
key = os.environ.get('GEMINI_API_KEY')
if not key: sys.exit('GEMINI_API_KEY is not set')
def gen(slug):
    prompt = ICONS[slug] + ' ' + STYLE + ' Avoid: ' + NEG + '.'
    body = {'contents': [{'parts': [{'text': prompt}]}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': '1:1'}}}
    req = urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent' % MODEL, data=json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json', 'x-goog-api-key': key})
    d = json.load(urllib.request.urlopen(req, timeout=180))
    for c in d.get('candidates', []):
        for p in c.get('content', {}).get('parts', []):
            if 'inlineData' in p:
                im = Image.open(io.BytesIO(base64.b64decode(p['inlineData']['data']))).convert('RGB')
                raw = os.path.join(OUT, 'raw-%s.png' % slug); im.save(raw)
                im.resize((192, 192), Image.LANCZOS).save(os.path.join(OUT, 'place-%s.png' % slug), optimize=True)
                return True
    print(slug, 'no image in response:', json.dumps(d)[:300]); return False
for slug in (sys.argv[1:] or ICONS):
    print(slug, 'ok' if gen(slug) else 'FAILED', flush=True)
