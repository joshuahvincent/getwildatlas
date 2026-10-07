#!/usr/bin/env python3
"""Gemini-generated imagery for the fictional Riverbend Aquarium example (photoreal aquarium views + hero backdrop).
Key from PetPeeper/.env.local (never printed). Usage: gen_scenes.py [job ...]"""
import base64, datetime, json, re, ssl, sys, urllib.request
from pathlib import Path
import certifi
PP = Path("~/Documents/Codex Projects/PetPeeper").expanduser()
KEY = re.search(r'^(?:export\s+)?GEMINI_API_KEY=(.+)$', (PP / ".env.local").read_text(), re.M).group(1).strip().strip('"\'')
MODEL = "gemini-3.1-flash-image-preview"
HERE = Path(__file__).parent
NEG = ("No text, no letters, no numbers, no signage with writing, no logos, no watermarks, no real brands, no dolphins, no whales, no belugas, "
       "no identifiable faces. ")
PHOTO = "Photorealistic, natural lighting, high detail, professional editorial photography, shallow depth of field where it suits, warm and welcoming, family-friendly. "
JOBS = {  # name: (aspect, folder, prompt)
  "entrance": ("4:3", "aquarium", "An imaginary modern public aquarium building seen from the front plaza on a bright day: a curved glass-and-timber facade with a wave-shaped roofline, wide entrance doors, large planters, a few families as small distant silhouettes. "),
  "tunnel": ("4:3", "aquarium", "Inside an aquarium: a curved acrylic walk-through tunnel with sharks and a manta ray gliding overhead in deep blue water, soft rippling light on the floor, small silhouettes of visitors looking up. "),
  "jellies": ("4:3", "aquarium", "An aquarium gallery with a large round tank of glowing translucent moon jellyfish drifting in deep blue water, softly lit, a couple of visitor silhouettes in the foreground. "),
  "touchpool": ("4:3", "aquarium", "An aquarium touch pool: children's hands (no faces) gently touching a starfish in shallow clear water in a rock-lined pool, bright natural light, a few orange and purple sea stars visible. "),
  "otterbay": ("4:3", "aquarium", "An aquarium marine-mammal gallery: a big glass viewing window onto a rocky pool where a sea otter floats on its back at the surface and a sea lion glides past underwater, bright natural light, a couple of visitor silhouettes in the foreground. "),
  "rainforest": ("4:3", "aquarium", "An aquarium indoor rainforest gallery: lush green plants and a mossy log in a glass-fronted habitat with a bright blue poison dart frog on a leaf and a sloth hanging from a branch, warm humid light, a couple of visitor silhouettes in the foreground. "),
  "hero-bg": ("4:3", "hero", "A wide scene of the front plaza of an imaginary modern public aquarium: a curved glass-and-timber facade with a wave-shaped roof and wide entrance doors on the left, a smooth paved path curving from the foreground toward the right of the frame, planters and low greenery, clear blue sky with a few soft clouds, golden-hour light, open uncluttered space on the right side and in the lower right for overlaying a phone. "),
}
def call(prompt, ar):
    body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseModalities": ["TEXT", "IMAGE"], "imageConfig": {"aspectRatio": ar}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={KEY}",
                                 data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=240, context=ssl.create_default_context(cafile=certifi.where())) as r: res = json.loads(r.read())
    for c in res.get("candidates", []):
        for p in c.get("content", {}).get("parts", []):
            if p.get("inlineData"): return base64.b64decode(p["inlineData"]["data"]), p["inlineData"]["mimeType"]
    raise RuntimeError(str(res)[:400])
for name in (sys.argv[1:] or JOBS):
    ar, folder, scene = JOBS[name]; prompt = PHOTO + scene + NEG
    try: data, mime = call(prompt, ar)
    except Exception as e: print(name, "FAIL", str(e)[:200]); continue
    out = HERE / folder / (name + (".png" if "png" in mime else ".jpg")); out.parent.mkdir(exist_ok=True); out.write_bytes(data)
    out.with_suffix(".json").write_text(json.dumps({"file": out.name, "model": MODEL, "aspectRatio": ar, "prompt": prompt,
                                                    "generated_at": datetime.datetime.utcnow().isoformat() + "Z"}, indent=2))
    print(name, "ok", out.name, len(data))
