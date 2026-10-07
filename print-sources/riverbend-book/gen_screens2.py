#!/usr/bin/env python3
"""Final Run-tier screens for the fictional Riverbend Aquarium: Gemini redraws each design layout (refs/layout-*.png, cut from the
approved HTML design) in the visual language of the REAL app screenshot (refs/home-ref.png, refs/pack-ref.png).
Usage: gen_screens2.py [job ...]"""
import base64, datetime, json, re, ssl, sys, urllib.request
from pathlib import Path
import certifi
PP = Path("~/Documents/Codex Projects/PetPeeper").expanduser()
KEY = re.search(r'^(?:export\s+)?GEMINI_API_KEY=(.+)$', (PP / ".env.local").read_text(), re.M).group(1).strip().strip('"\'')
MODEL = "gemini-3.1-flash-image-preview"; HERE = Path(__file__).parent
COMMON = ("Image 1 is a REAL screenshot of the Wild Atlas kids' animal iPhone app: it defines the exact visual language (fonts, thick dark-brown outlines, pastel card gradients, soft shadows, cream dotted background, rounded shapes). "
          "Image 2 is the design layout of a NEW screen. Recreate Image 2 faithfully: the same sections, order, text (keep every word exactly as written), icons and artwork, "
          "but drawn in precisely the visual language of Image 1 so it looks like a genuine screenshot of the same app. Reuse the animal pictures and photos from Image 2 exactly as they are. "
          "Output only the app screen, edge to edge, a full phone screen with no phone frame, no extra captions. No dolphins or whales. ")
JOBS = {
 "home-places": (["refs/home-ref.png", "refs/layout-home-places.png", "riverbend-emblem.png"],
   "This screen is the home screen scrolled down: it shows the lower row of pack tiles (Cozy Critters, Ocean Creatures), a dashed divider, the section My Places with the Riverbend Aquarium tile "
   "(round Riverbend emblem, a NEW! badge, the pills Visited today and 9 animals) and a dashed Add a place tile, another dashed divider, and the start of Explore More Animal Worlds with its tiles. "
   "Show the iOS status bar (9:41, Dynamic Island) at the top. Keep My Places and the Riverbend tile clearly in the middle of the screen. "),
 "pack-top": (["refs/pack-ref.png", "refs/layout-pack-top.png", "riverbend-emblem.png"],
   "Show the status bar and the top bar with a yellow back button and the title, the venue header card with the round emblem, the heading Meet the Animals, a 3x3 grid of animal cards "
   "(Octopus, Sea Otter, Jellyfish, Sea Lion, Starfish, Sloth, Poison Dart Frog, Axolotl, Green Anaconda), and three round page buttons numbered 1, 2 and 3 (1 selected, light blue). "),
 "pack-lower": (["refs/pack-ref.png", "refs/layout-pack-lower.png"],
   "This is the lower part of the same page, scrolled: the paw-print progress card, the section About Riverbend with four fact tiles (27, 9, 1, 365), the section Top Exhibits with a horizontal row of exhibit cards, "
   "and a teal For grown-ups card. Show the iOS status bar at the top. "),
}
def call(prompt, refs):
    parts = [{"inlineData": {"mimeType": "image/png", "data": base64.b64encode((HERE / r).read_bytes()).decode()}} for r in refs] + [{"text": prompt}]
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["TEXT", "IMAGE"], "imageConfig": {"aspectRatio": "9:16"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={KEY}",
                                 data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300, context=ssl.create_default_context(cafile=certifi.where())) as r: res = json.loads(r.read())
    for c in res.get("candidates", []):
        for p in c.get("content", {}).get("parts", []):
            if p.get("inlineData"): return base64.b64decode(p["inlineData"]["data"]), p["inlineData"]["mimeType"]
    raise RuntimeError(str(res)[:400])
if __name__ == "__main__":
    names = sys.argv[1:] or list(JOBS)
    for name in names:
        refs, scene = JOBS[name]
        for take in (1, 2):
            try: data, mime = call(COMMON + scene, refs)
            except Exception as e: print(name, take, "FAIL", str(e)[:200]); continue
            out = HERE / "screens" / f"final-{name}-t{take}{'.png' if 'png' in mime else '.jpg'}"; out.write_bytes(data)
            out.with_suffix(".json").write_text(json.dumps({"file": out.name, "model": MODEL, "prompt": COMMON + scene, "refs": refs, "generated_at": datetime.datetime.utcnow().isoformat() + "Z"}, indent=2))
            print(name, take, "ok", out.name, len(data))
