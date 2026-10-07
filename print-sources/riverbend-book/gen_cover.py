#!/usr/bin/env python3
"""Gemini: one seamless portrait cover illustration (octopus/jellyfish/turtle at the bottom, water rising to the sunlit surface)
for the Riverbend example book. Reference = candidates/cover-b.jpg. Usage: gen_cover.py [takes]"""
import base64, datetime, json, re, ssl, sys, urllib.request
from pathlib import Path
import certifi
PP = Path("~/Documents/Codex Projects/PetPeeper").expanduser()
KEY = re.search(r'^(?:export\s+)?GEMINI_API_KEY=(.+)$', (PP / ".env.local").read_text(), re.M).group(1).strip().strip('"\'')
MODEL = "gemini-3.1-flash-image-preview"; HERE = Path(__file__).parent
PROMPT = ("Using the attached image as the exact style and character reference, create ONE seamless tall portrait illustration (3:4) in the same Wild Atlas mascot style. "
          "Keep the same cute peach-coral octopus (center), pale lavender moon jellyfish (left) and mint sea turtle (right), coral and rocks on the seabed, in the lower 40 percent of the picture. "
          "From there the water continues smoothly all the way up to the top edge of the picture, with a bright sunlit ocean surface at the very top: gentle white wave lines, soft light shining down. "
          "The whole image must read as a single continuous scene: no vertical lines, no stripes, no bands, no panels, no hard seams or rectangles, no flat color blocks; light rays are very soft and diffuse. "
          "The water color gradually changes from pale bright aqua at the top to deeper teal toward the bottom. The middle and upper-middle of the picture are open water with only a few tiny bubbles, "
          "leaving calm space for a logo and title to be placed over it. Flat illustration style, simple flat fills with subtle soft shading, no gloss, no 3D rendering, clean thick warm-brown outlines on the animals only. "
          "NO text, NO letters, NO numbers, NO logos, NO watermarks, NO dolphins or whales.")
def call():
    parts = [{"inlineData": {"mimeType": "image/jpeg", "data": base64.b64encode((HERE / "candidates/cover-b.jpg").read_bytes()).decode()}}, {"text": PROMPT}]
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["TEXT", "IMAGE"], "imageConfig": {"aspectRatio": "3:4"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={KEY}",
                                 data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300, context=ssl.create_default_context(cafile=certifi.where())) as r: res = json.loads(r.read())
    for c in res.get("candidates", []):
        for p in c.get("content", {}).get("parts", []):
            if p.get("inlineData"): return base64.b64decode(p["inlineData"]["data"]), p["inlineData"]["mimeType"]
    raise RuntimeError(str(res)[:400])
for i in range(1, int(sys.argv[1] if len(sys.argv) > 1 else 3) + 1):
    try: data, mime = call()
    except Exception as e: print(i, "FAIL", str(e)[:200]); continue
    out = HERE / "candidates" / f"cover-full-t{i}{'.png' if 'png' in mime else '.jpg'}"; out.write_bytes(data)
    out.with_suffix(".json").write_text(json.dumps({"file": out.name, "model": MODEL, "prompt": PROMPT, "ref": "candidates/cover-b.jpg", "generated_at": datetime.datetime.utcnow().isoformat() + "Z"}, indent=2))
    print(i, "ok", out.name, len(data))
