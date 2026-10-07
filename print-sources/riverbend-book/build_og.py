#!/usr/bin/env python3
"""1200x630 social share image for /partners: the hero scene on the right, the pitch on a cream panel on the left."""
import os, sys
from pathlib import Path
from PIL import Image, ImageDraw
HERE = Path(__file__).parent; SITE = HERE.parent.parent
sys.path.insert(0, str(HERE)); import build_riverbend_book as bk
from build_riverbend_book import Fonts, wa_lockup, REPO
F = Fonts(os.path.join(REPO, "Website", "fonts"))
W, H = 1200, 630; CREAM = (255, 245, 225); BARK = (93, 64, 55); PEACH = (230, 138, 106)
img = Image.new("RGB", (W, H), CREAM); d = ImageDraw.Draw(img)
import compose_assets
clean = HERE / "_hero_clean.jpg"; compose_assets.hero(tag=False, out=clean)
hero = Image.open(clean).convert("RGB"); clean.unlink()
s = H / hero.height; hero = hero.resize((int(hero.width * s), H), Image.LANCZOS)          # 844 x 630
pw = 660; x0 = max(0, int((hero.width - pw) * 0.62)); hero = hero.crop((x0, 0, x0 + pw, H)); img.paste(hero, (W - pw, 0))
d.rectangle([W - pw - 8, 0, W - pw, H], fill=(255, 217, 125))                                # sunny edge between panel and photo
d.text((56, 64), "FOR ZOOS, AQUARIUMS & MUSEUMS", font=F.fredoka(24, 650), fill=PEACH)
for i, ln in enumerate(("Partner with", "Wild Atlas")):
    d.text((56, 130 + i * 78), ln, font=F.fredoka(68, 700), fill=BARK)
d.text((56, 320), "Extend the visit home.", font=F.fredoka(38, 650), fill=PEACH)
bk.text_block(d, (56, 378), "A safe, ad-free animal app your families keep exploring after they leave.", F.nunito(27, True), W - pw - 96, fill=BARK, spacing=1.3)
lk = wa_lockup(F, 70); img.paste(lk, (60, H - 70 - lk.height), lk)
out = SITE / "assets" / "partners" / "og-partners.jpg"; img.save(out, quality=90); print("wrote", out, img.size)
