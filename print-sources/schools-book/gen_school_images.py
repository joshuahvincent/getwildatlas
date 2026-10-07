#!/usr/bin/env python3
"""Gemini imagery for the fictional Pebble Brook Elementary activity book: a Wild Atlas-style cover illustration and four photoreal school views.
Key from PetPeeper/.env.local (never printed). Usage: gen_school_images.py [job ...]"""
import base64, datetime, json, re, ssl, sys, urllib.request
from pathlib import Path
import certifi
PP = Path("~/Documents/Codex Projects/PetPeeper").expanduser()
KEY = re.search(r'^(?:export\s+)?GEMINI_API_KEY=(.+)$', (PP / ".env.local").read_text(), re.M).group(1).strip().strip('"\'')
MODEL = "gemini-3.1-flash-image-preview"; HERE = Path(__file__).parent
REFS = [PP / "WildAtlas_Icons/wild_atlas_mascot_dog.png", PP / "GeneratedPackMascots/safari-stars_mascot.png"]
NEG = "No text, no letters, no numbers, no signage with writing, no logos, no watermarks, no real brands, no identifiable faces. "
PHOTO = "Photorealistic, natural light, high detail, warm and welcoming, editorial photography. "
STYLE = ("Wild Atlas mascot illustration style matching the reference images: clean thick dark warm-brown outlines, flat color fills with subtle soft shading, no gloss, no 3D, "
         "rounded chibi plush proportions, big round dark eyes with a white highlight dot, soft pastel palette (cream, peach, mint, sky blue, pale gold). ")
JOBS = {
 "cover": ("3:4", "candidates", True, STYLE + "A tall portrait scene for a children's book cover: a cute small brick schoolhouse with a round tree and a little brook with pebbles in the lower middle, "
    "and a happy group of plush cartoon animals gathered in front of it (a lion, a giraffe, a panda, a small elephant, a golden retriever puppy, a koala). Soft green hills, a sunny sky with fluffy clouds. "
    "The TOP 40 percent of the image is calm open sky with only a few clouds, reserved for a logo and title. One single continuous scene with no bands, stripes or panels. "),
 "entrance": ("4:3", "school-photos", False, PHOTO + "The front entrance of a small friendly elementary school on a bright morning: a low brick building with big windows, a covered entrance with double doors, a paved path, trees and flower beds, a bike rack. No people. "),
 "classroom": ("4:3", "school-photos", False, PHOTO + "A bright pre-kindergarten classroom: low round tables with small chairs, a rug with a reading corner, shelves of picture books and baskets of toys, big sunny windows, colorful drawings pinned on a wall (no readable writing). No people. "),
 "playground": ("4:3", "school-photos", False, PHOTO + "A school playground on a sunny day: a wooden climbing frame with a small slide, raised garden beds with sunflowers, a grassy field behind, trees. No people. "),
 "library": ("4:3", "school-photos", False, PHOTO + "A cozy elementary school library: low shelves full of picture books, a reading nook with floor cushions and a beanbag, warm light from a window. No people. "),
}
def call(prompt, ar, refs):
    parts = ([{"inlineData": {"mimeType": "image/png", "data": base64.b64encode(r.read_bytes()).decode()}} for r in REFS] if refs else []) + [{"text": prompt}]
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["TEXT", "IMAGE"], "imageConfig": {"aspectRatio": ar}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={KEY}", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300, context=ssl.create_default_context(cafile=certifi.where())) as r: res = json.loads(r.read())
    for c in res.get("candidates", []):
        for p in c.get("content", {}).get("parts", []):
            if p.get("inlineData"): return base64.b64decode(p["inlineData"]["data"]), p["inlineData"]["mimeType"]
    raise RuntimeError(str(res)[:400])
if __name__ == "__main__":
    for name in (sys.argv[1:] or list(JOBS)):
        ar, folder, refs, scene = JOBS[name]; prompt = ("Using the attached references as the exact style and character anchors, create: " if refs else "") + scene + (NEG if True else "")
        takes = 3 if name == "cover" else 1
        for t in range(1, takes + 1):
            try: data, mime = call(prompt, ar, refs)
            except Exception as e: print(name, t, "FAIL", str(e)[:200]); continue
            out = HERE / folder / (f"{name}-t{t}" if takes > 1 else name); out = out.with_suffix(".png" if "png" in mime else ".jpg"); out.write_bytes(data)
            out.with_suffix(".json").write_text(json.dumps({"file": out.name, "model": MODEL, "aspectRatio": ar, "prompt": prompt, "generated_at": datetime.datetime.utcnow().isoformat() + "Z"}, indent=2))
            print(name, t, "ok", out.name, len(data))
