#!/usr/bin/env python3
"""Gemini edits of the REAL Wild Atlas app screenshots (refs/) to show a Run-tier venue experience for the fictional
Riverbend Aquarium: a "My Zoo" tile on the home screen and a venue pack page. Illustrative mockups, not shipping features."""
import base64, datetime, json, re, ssl, sys, urllib.request
from pathlib import Path
import certifi
PP = Path("~/Documents/Codex Projects/PetPeeper").expanduser()
KEY = re.search(r'^(?:export\s+)?GEMINI_API_KEY=(.+)$', (PP / ".env.local").read_text(), re.M).group(1).strip().strip('"\'')
MODEL = "gemini-3.1-flash-image-preview"; HERE = Path(__file__).parent
KEEP = ("Keep the exact same visual style, fonts, colors, card shapes, shadows, status bar and proportions as the reference app screenshot; "
        "it must look like a genuine screenshot of the same iPhone app. Only the app screen itself, edge to edge, no phone frame, no extra marketing text. ")
JOBS = {
 "run-home": (["refs/home-ref.png", "riverbend-emblem.png"],
   "The first image is a real screenshot of the Wild Atlas kids' animal app home screen. The second image is the round Riverbend Aquarium emblem (a white octopus in a navy circle). "
   "Produce the same screen with exactly one change: below the three existing pack tiles (Happy Hounds, Cool Cats, Cozy Critters) add a new section with the heading \"My Zoo\" "
   "set in the same bold rounded font as the \"Explore More Animal Worlds\" heading, and under it one wide tile in the same card style (soft pastel blue gradient, rounded corners, soft thick bottom edge) "
   "that shows the round Riverbend emblem from the second image at left, the title \"Riverbend Aquarium\" and the smaller caption \"Meet the animals you saw today\". "
   "Remove the \"Explore More Animal Worlds\" section to make room. Keep the greeting, mascot and top icons unchanged. " + KEEP),
 "run-pack": (["refs/pack-ref.png", "riverbend-emblem.png"],
   "The first image is a real screenshot of a pack page in the Wild Atlas kids' animal app (the Dino Roars pack). The second image is the round Riverbend Aquarium emblem. "
   "Produce the equivalent page for a venue pack: the top bar title reads \"Riverbend Aquarium\"; the large header card shows the round emblem from the second image where the dinosaur mascot was, "
   "with the title \"Riverbend Aquarium\" and the description \"The animals you met today, and a few more to discover at home.\"; below it the heading \"Meet the Animals\" and a grid of rounded white animal cards "
   "in the same style as the dinosaur cards, each with a realistic cut-out animal photo and its name: Octopus, Sea Otter, Jellyfish, Sea Lion, Starfish, Sloth, Poison Dart Frog, Axolotl "
   "(two rows of three, then a last row of two with an empty third slot). Below the grid keep the two round page-dot buttons (1 and 2) centered, exactly as in the reference, and at the very bottom keep the WHITE rounded paw-print progress panel with the sentence \"Visit every animal in this pack to unlock the slideshow.\", exactly like the reference (white panel, not dark). " + KEEP),
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
        refs, prompt = JOBS[name]
        for take in (3, 4):
            try: data, mime = call(prompt, refs)
            except Exception as e: print(name, take, "FAIL", str(e)[:200]); continue
            out = HERE / "screens" / f"{name}-t{take}{'.png' if 'png' in mime else '.jpg'}"; out.write_bytes(data)
            out.with_suffix(".json").write_text(json.dumps({"file": out.name, "model": MODEL, "prompt": prompt, "refs": refs,
                                                            "generated_at": datetime.datetime.utcnow().isoformat() + "Z"}, indent=2))
            print(name, take, "ok", out.name, len(data))
