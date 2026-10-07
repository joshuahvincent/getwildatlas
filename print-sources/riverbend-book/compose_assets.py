#!/usr/bin/env python3
"""Compose the web assets for /partners from generated + real imagery:
  assets/partners/hero-riverbend.jpg   realistic aquarium + the real marketing screenshot in an iPhone
  assets/partners/run-home-phone.png   Gemini-edited real home screen (My Zoo tile) in an iPhone
  assets/partners/run-pack-phone.png   Gemini-edited real pack page in an iPhone
  assets/partners/book-*.jpg           pages of the example book PDF"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
HERE = Path(__file__).parent; SITE = HERE.parent.parent; OUT = SITE / "assets" / "partners"

def make_phone(screen, width, tilt=0.0, shadow=True):
    sw = width; sh = int(screen.height * sw / screen.width)
    bez = max(10, int(width * .035)); R = int(width * .15); r = R - bez
    W_, H_ = sw + 2 * bez, sh + 2 * bez
    pad = 60 if shadow else 4
    canvas = Image.new("RGBA", (W_ + 2 * pad, H_ + 2 * pad), (0, 0, 0, 0))
    if shadow:
        sh_l = Image.new("RGBA", canvas.size, (0, 0, 0, 0)); ImageDraw.Draw(sh_l).rounded_rectangle([pad + 6, pad + 26, pad + W_ - 6, pad + H_ + 16], R, fill=(20, 30, 50, 120))
        canvas = Image.alpha_composite(canvas, sh_l.filter(ImageFilter.GaussianBlur(26)))
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle([pad, pad, pad + W_, pad + H_], R, fill=(28, 28, 30, 255))                      # body
    d.rounded_rectangle([pad + 2, pad + 2, pad + W_ - 2, pad + H_ - 2], R - 2, outline=(110, 110, 116, 255), width=3)  # edge
    scr = ImageOps.fit(screen.convert("RGB"), (sw, sh), Image.LANCZOS)
    m = Image.new("L", (sw, sh), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, sw - 1, sh - 1], r, fill=255)
    canvas.paste(scr, (pad + bez, pad + bez), m)
    if tilt: canvas = canvas.rotate(tilt, resample=Image.BICUBIC, expand=True)
    return canvas

def dotted(img, pts, color=(255, 217, 125), step=30, rad=9):
    d = ImageDraw.Draw(img, "RGBA"); path = []
    for t in range(0, 201):
        u = t / 200; (x0, y0), (x1, y1), (x2, y2), (x3, y3) = pts
        path.append(((1-u)**3*x0 + 3*(1-u)**2*u*x1 + 3*(1-u)*u*u*x2 + u**3*x3, (1-u)**3*y0 + 3*(1-u)**2*u*y1 + 3*(1-u)*u*u*y2 + u**3*y3))
    acc, last = 0, path[0]
    for p in path:
        acc += math.hypot(p[0] - last[0], p[1] - last[1]); last = p
        if acc >= step:
            acc = 0; d.ellipse([p[0] - rad - 3, p[1] - rad - 3, p[0] + rad + 3, p[1] + rad + 3], fill=(60, 40, 30, 150))
            d.ellipse([p[0] - rad, p[1] - rad, p[0] + rad, p[1] + rad], fill=color + (255,))

def hero():
    base = Image.open(HERE / "hero" / "hero-bg.jpg").convert("RGB")
    shot = Image.open(SITE / "assets" / "press" / "ss-home.jpg").convert("RGB")      # real marketing screenshot
    ph = make_phone(shot, 380, tilt=-4)
    base = base.convert("RGBA")
    dotted(base, [(380, 640), (470, 830), (620, 860), (760, 770)])
    base.alpha_composite(ph, (base.width - ph.width - 10, base.height - ph.height + 95))
    tag = Image.open(HERE / "riverbend-logo.png").convert("RGB")
    tag = tag.crop(ImageOps.invert(tag.convert("L")).point(lambda v: 255 if v > 12 else 0).getbbox())
    tw = 330; tag = tag.resize((tw, int(tag.height * tw / tag.width)), Image.LANCZOS)
    pill = Image.new("RGBA", (tw + 50, tag.height + 40), (0, 0, 0, 0)); ImageDraw.Draw(pill).rounded_rectangle([0, 0, pill.width - 1, pill.height - 1], 26, fill=(255, 255, 255, 235))
    pill.paste(tag, (25, 20)); base.alpha_composite(pill, (base.width - pill.width - 36, 34))
    base.convert("RGB").save(OUT / "hero-riverbend.jpg", quality=90); print("hero ok")

def phones():
    for src, name in (("screens/run-home-t1.jpg", "run-home-phone.png"), ("screens/run-pack-t3.jpg", "run-pack-phone.png")):
        make_phone(Image.open(HERE / src), 560).save(OUT / name, optimize=True); print(name, "ok")

def book_pages(pdf):
    import pymupdf
    d = pymupdf.open(pdf)
    for n, name in ((1, "cover"), (2, "welcome"), (3, "map"), (4, "coloring"), (5, "puzzle"), (7, "maze"), (44, "numbers"), (45, "howmany"), (49, "claim")):
        d[n - 1].get_pixmap(matrix=pymupdf.Matrix(.75, .75)).save(OUT / f"book-{name}.jpg", jpg_quality=84); print("book", name)

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    hero(); phones()
    book_pages(sys.argv[1] if len(sys.argv) > 1 else SITE / "assets" / "downloads" / "riverbend-coloring-activity-book.pdf")
