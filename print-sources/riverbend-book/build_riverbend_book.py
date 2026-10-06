#!/usr/bin/env python3
"""
Riverbend Aquarium example coloring & activity book (FICTIONAL venue) for the Wild Atlas partner page.

20 animal spreads = 20 coloring pages + 20 activity pages, plus front/back matter = 48 pages, US Letter.
Reuses the flagship-book pipeline in the Wild Atlas app repo (finished pack coloring pages + activity generators);
no new animal art. Only the Riverbend logo is new (make_logo.py).

  python3 print-sources/riverbend-book/build_riverbend_book.py --out /tmp/riverbend

Env: WA_REPO = path to the app repo checkout (default ~/Documents/Codex Projects/PetPeeper).
Needs: Pillow, numpy, opencv-python, PyMuPDF.

Cetaceans are left out on purpose (a venue like the one this example is modelled on has none).
"""
import argparse, io, os, random, sys
from PIL import Image, ImageDraw, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.expanduser(os.environ.get("WA_REPO", "~/Documents/Codex Projects/PetPeeper"))
sys.path.insert(0, os.path.join(REPO, "coloring_pages", "flagship-book"))
import generate_activity_samples as g
import build_flagship_book as bf
from generate_activity_samples import W, H, M, INK, GREY, Fonts, Masters, Data, Scenes, paste_fit, rbox, text_block, center_text

VENUE = "Riverbend Aquarium"

# (animal, activity, params). Never the same activity twice in a row.
BOOK = [
  ("octopus", "spot", dict(hide=[(0.635, 0.04, 0.715, 0.125)], hide_label="the octopus's eye")),
  ("capybara", "maze", dict(prompt="Help the little capybara find its mom!", seed=5)),
  ("clownfish", "count", dict(counts={"clownfish": 5, "starfish": 4, "seahorse": 3},
                              sizes={"clownfish": 230, "starfish": 190, "seahorse": 210}, scene="ocean")),
  ("jellyfish", "shadow", dict(ks=["jellyfish", "octopus", "seahorse", "starfish"])),
  ("sea_otter", "next", dict(pats=[(["sea_otter", "starfish"], "ABAB"), (["seahorse", "sea_otter"], "AABAA"),
                                   (["clownfish", "octopus", "sea_otter"], "ABCAB"), (["sea_otter", "jellyfish"], "ABBAB")])),
  ("great_white_shark", "safe", dict(ks=["great_white_shark", "clownfish", "sea_turtle", "jellyfish", "seahorse", "sea_otter"])),
  ("seahorse", "finish", dict(prompt="Oh no! Part of me is missing. Draw my tail and my back fin. Then color me in!")),
  ("hippopotamus", "home", dict(prompt="I live in rivers and lakes in Africa. Draw my home: add water and reeds!")),
  ("manta_ray", "trace", dict(word="Manta")),
  ("sea_lion", "spot", dict(hide=[(0.70, 0.67, 0.84, 0.92)], hide_label="the sea lion's flipper")),
  ("whale_shark", "big", dict(rows=[("whale_shark", "clownfish"), ("great_white_shark", "seahorse"), ("sea_turtle", "starfish")])),
  ("sea_turtle", "dots", {}),
  ("moray_eel", "odd", dict(rows=[("moray_eel", "seahorse"), ("clownfish", "jellyfish"), ("starfish", "moray_eel")])),
  ("atlantic_puffin", "scramble", dict(items=[("atlantic_puffin", "PUFFIN"), ("octopus", "OCTOPUS"), ("sea_otter", "OTTER"),
                                              ("clownfish", "CLOWNFISH"), ("starfish", "STARFISH")])),
  ("emperor_penguin", "dots", {}),
  ("hammerhead_shark", "shadow", dict(ks=["hammerhead_shark", "great_white_shark", "whale_shark", "manta_ray"])),
  ("axolotl", "odd", dict(rows=[("axolotl", "sea_otter"), ("walrus", "atlantic_puffin"), ("axolotl", "platypus")])),
  ("alligator", "home", dict(prompt="I live in rivers and swamps. Draw my home: add water, reeds and maybe a fish!")),
  ("platypus", "maze", dict(prompt="Help the little platypus find its mom!", seed=21)),
  ("poison_dart_frog", "finish", dict(prompt="Draw my back legs! Then color me in with bright colors.")),
]
assert len(BOOK) == 20

class RiverbendData(Data):
    def pack(self, k): return VENUE        # footer subtitle on every page

def load_logo(name, width=None):
    im = Image.open(os.path.join(HERE, name)).convert("L")
    im = im.crop(ImageOps.invert(im).getbbox())
    if width: im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS)
    return im.convert("RGB")

def coloring_page(S, k, logo_bw):
    """Pack coloring page: strip the QR and the Wild Atlas corner logo, put the venue logo in its place."""
    src = S.page(k).convert("RGB"); sw, sh = src.size; d = ImageDraw.Draw(src)
    d.rectangle([int(sw * .05), int(sh * .862), int(sw * .15), int(sh * .935)], fill="white")   # QR
    d.rectangle([int(sw * .785), int(sh * .862), int(sw * .97), int(sh * .94)], fill="white")   # Wild Atlas logo
    lw = int(sw * .155); lg = logo_bw.resize((lw, int(logo_bw.height * lw / logo_bw.width)), Image.LANCZOS)
    src.paste(lg, (int(sw * .955) - lw, int(sh * .90) - lg.height // 2))
    s = H / sh; im = src.resize((int(sw * s), H), Image.LANCZOS)
    out = bf.blank(); out.paste(im, ((W - im.width) // 2, 0)); return out

def title_page(F, logo_color):
    img = bf.blank(); d = ImageDraw.Draw(img)
    paste_fit(img, logo_color, (M + 40, 330, W - M - 40, 760))
    center_text(d, 900, "Animal Coloring", F.fredoka(120, 650)); center_text(d, 1040, "& Activity Book", F.fredoka(120, 650))
    center_text(d, 1220, "20 Ocean & River Animals to Color, Solve & Draw", F.nunito(48, True))
    center_text(d, 1300, "For explorers ages 3–8", F.nunito(44))
    center_text(d, H - 330, "Animals, facts and puzzles by Wild Atlas", F.nunito(36, True), fill=(90, 90, 90))
    center_text(d, H - 270, "Example book. Riverbend Aquarium is a fictional venue.", F.nunito(30), fill=(120, 120, 120))
    return img

def grownups_page(F, logo):
    p = bf.page(F, "Hello, Grown-Ups!", "", "", "", logo, None); d = p.d; y = p.y + 20; bw = W - 2 * M - 80
    paras = [
        (f"Welcome to {VENUE}!", "Every animal in this book gets two pages. On the left is a puzzle or something to draw. "
         "On the right is the animal to color, with real facts to read aloud."),
        ("Made for kids who aren't reading yet", "Read the one-line instruction once. The little picture next to it reminds "
         "them what to do: draw a line, find, circle, count, draw, or trace."),
        ("Crayons and colored pencils work best", "Markers may show through to the next page."),
        ("Answers", "Many answers are printed upside down at the bottom of the page. The rest are in the answer key near the back."),
        ("A free animal pack!", "This book includes a free animal pack for the Wild Atlas app, a safe, ad-free animal "
         "encyclopedia for kids. Turn to the last page to claim it."),
    ]
    for h, t in paras:
        d.text((M + 40, y), h, font=F.fredoka(56, 650), fill=INK); y += 80
        y = text_block(d, (M + 40, y), t, F.nunito(42), bw) + 55
    return p.img

def claim_page(F, logo):
    p = bf.page(F, "Your Free Pack!", "", "", "", logo, None); d = p.d; y = p.y + 10
    lines = ["Scan with a grown-up to unlock a free animal pack in the Wild Atlas app.",
             "Or open the App Store, tap your picture, tap “Redeem Gift Card or Code”, and type the code."]
    for t in lines:
        y = text_block(d, (M + 40, y), t, F.nunito(44, True), W - 2 * M - 80, align="center") + 20
    qs = 520; qx = (W - qs) // 2; qy = y + 50
    rbox(d, [qx, qy, qx + qs, qy + qs], r=24, width=6, dash=True)
    center_text(d, qy + qs // 2 - 40, "SAMPLE QR", F.fredoka(60, 600), fill=GREY)
    center_text(d, qy + qs // 2 + 30, "not scannable", F.nunito(34), fill=GREY)
    cy = qy + qs + 70; f = F.fredoka(92, 650); txt = "RIVERBEND"; tw = d.textlength(txt, font=f)
    d.rounded_rectangle([(W - tw) / 2 - 70, cy, (W + tw) / 2 + 70, cy + 150], radius=75, width=6, outline=INK)
    d.text((W / 2, cy + 75), txt, font=f, fill=INK, anchor="mm")
    center_text(d, cy + 200, "Free: no ads, no sign-up, works offline.", F.nunito(40, True))
    text_block(d, (M + 40, cy + 300), "Example page. “Riverbend Aquarium” and the code RIVERBEND are fictional and unlock nothing. "
               "A real venue gets its own code and QR.", F.nunito(30), W - 2 * M - 80, fill=(110, 110, 110), align="center")
    return p.img

def colophon_page(F):
    img = bf.blank(); d = ImageDraw.Draw(img); y = H - 900
    lines = [f"{VENUE} Animal Coloring & Activity Book", "", "Example book for the Wild Atlas partner program.",
             "Riverbend Aquarium is a fictional venue and is not a real organization.", "",
             "Illustrations, animal facts and puzzles by Wild Atlas.", "© 2026 Wild Atlas. All rights reserved.", "",
             "wildatlasapp.com/partners"]
    for ln in lines:
        center_text(d, y, ln, F.nunito(34, ln.startswith(VENUE))); y += 50
    return img


# ------------------------------------------------------------------------------------------------ color cover, welcome, map
NAVY = (14, 58, 85)
SITE = os.path.join(HERE, "..", "..")          # website repo root (assets/)
CONTACT = dict(name=VENUE, addr1="100 Harbour Walk", addr2="Riverbend Point", phone="(555) 010-0142",
               email="hello@riverbendaquarium.example", web="riverbendaquarium.example")   # all fictional (.example, 555-01xx)

def cover_page(F, logo_color):
    """Full-color front cover: water gradient with a surface at the top, the octopus/jellyfish/turtle scene at the bottom."""
    import numpy as np
    scene = Image.open(os.path.join(SITE, "assets", "partners", "candidates", "cover-b.jpg")).convert("RGB")
    scene = scene.resize((W, int(scene.height * W / scene.width)), Image.LANCZOS)
    top_rgb = np.array(scene.crop((0, 0, W, 8))).reshape(-1, 3).mean(0)
    sy = H - scene.height
    # vertical gradient: bright surface -> the scene's own top color at the seam
    ys = np.linspace(0, 1, sy + 140)[:, None]
    surf = np.array((205, 238, 240), float); mid = np.array((120, 205, 205), float)
    grad = np.where(ys < .55, surf + (mid - surf) * (ys / .55), mid + (top_rgb - mid) * ((ys - .55) / .45))
    bg = Image.fromarray(np.repeat(grad[:, None, :], W, 1).astype("uint8"))
    cov = Image.new("RGB", (W, H), tuple(int(v) for v in top_rgb)); cov.paste(bg, (0, 0))
    # blend the scene's flat top band into the gradient
    mask = Image.new("L", scene.size, 255); md = ImageDraw.Draw(mask)
    for y in range(160): md.line([(0, y), (W, y)], fill=int(255 * y / 160))
    cov.paste(scene, (0, sy), mask)
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    for x0, wd in ((180, 150), (520, 110), (860, 170), (1250, 120)):                  # soft light rays
        od.polygon([(x0, 0), (x0 + wd, 0), (x0 + wd + 330, sy + 120), (x0 - 160, sy + 120)], fill=(255, 255, 255, 26))
    import math
    for k, (yy, a) in enumerate(((46, 255), (86, 140), (122, 80))):                  # the water surface
        pts = [(x, yy + 14 * math.sin(x / 95 + k)) for x in range(0, W + 20, 20)]
        od.line(pts, fill=(255, 255, 255, a), width=9 - 2 * k, joint="curve")
    cov = Image.alpha_composite(cov.convert("RGBA"), ov).convert("RGB"); d = ImageDraw.Draw(cov)
    # logo on a white panel, title, subtitle
    pw = 1360; lg = logo_color.resize((pw - 120, int(logo_color.height * (pw - 120) / logo_color.width)), Image.LANCZOS)
    ph = lg.height + 100; px = (W - pw) // 2; py = 190
    d.rounded_rectangle([px, py, px + pw, py + ph], radius=60, fill="white")
    cov.paste(lg, (px + 60, py + 50))
    ty = py + ph + 110
    for i, ln in enumerate(("Animal Coloring", "& Activity Book")):
        d.text((W / 2, ty + i * 150), ln, font=F.fredoka(128, 700), fill=NAVY, anchor="mm", stroke_width=7, stroke_fill="white")
    sub = "20 Ocean & River Animals to Color, Solve & Draw"; f = F.nunito(50, True)
    sw_ = d.textlength(sub, font=f)
    yy = ty + 300
    d.rounded_rectangle([(W - sw_) / 2 - 40, yy - 44, (W + sw_) / 2 + 40, yy + 44], radius=44, fill="white")
    d.text((W / 2, yy), sub, font=f, fill=NAVY, anchor="mm")
    pill = F.fredoka(44, 650); pt = "Ages 3–8"; pw2 = d.textlength(pt, font=pill)
    d.rounded_rectangle([(W - pw2) / 2 - 40, yy + 80, (W + pw2) / 2 + 40, yy + 160], radius=40, fill=(255, 217, 125))
    d.text((W / 2, yy + 120), pt, font=pill, fill=NAVY, anchor="mm")
    ft = "Example book. Riverbend Aquarium is a fictional venue."; ff = F.nunito(28, True); fw = d.textlength(ft, font=ff)
    d.rounded_rectangle([(W - fw) / 2 - 30, H - 86, (W + fw) / 2 + 30, H - 30], radius=28, fill=NAVY)
    d.text((W / 2, H - 58), ft, font=ff, fill="white", anchor="mm")
    return cov

def wa_lockup(F, height=190):
    """Wild Atlas mascot + the word 'Wild Atlas' (site wordmark: Fredoka bold)."""
    m = Image.open(os.path.join(SITE, "assets", "mascot-logo.png")).convert("RGBA"); m = m.crop(m.getbbox())
    m = m.resize((int(m.width * height / m.height), height), Image.LANCZOS)
    f = F.fredoka(int(height * .62), 700); tmp = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    tw = int(tmp.textlength("Wild Atlas", font=f))
    out = Image.new("RGBA", (m.width + 30 + tw, height), (255, 255, 255, 0)); out.paste(m, (0, 0), m)
    ImageDraw.Draw(out).text((m.width + 30, height / 2 + 4), "Wild Atlas", font=f, fill=(93, 64, 55), anchor="lm")
    return out

def welcome_page(F, logo_color, logo_small):
    img = Image.new("RGB", (W, H), "white"); d = ImageDraw.Draw(img)
    d.text((M, 70), "Animals, facts & puzzles by", font=F.nunito(30, True), fill=(120, 120, 120))
    lk = wa_lockup(F, 170); img.paste(lk, (M, 115), lk)
    y = 360
    d.text((M, y), f"Welcome to {VENUE}!", font=F.fredoka(84, 700), fill=NAVY); y += 125
    paras = [("How this book works", "Every animal gets two pages: a puzzle or something to draw on the left, and the animal to color on the right, "
                                    "with real facts to read aloud. Read each one-line instruction once; the little picture reminds your explorer what to do."),
             ("Crayons and colored pencils work best", "Markers may show through to the next page. Most answers are printed upside down on the page; the rest are in the answer key."),
             ("A free animal pack", "This book includes a free animal pack for the Wild Atlas app, a safe, ad-free animal encyclopedia for kids. The claim page is the last page.")]
    for h, t in paras:
        d.text((M, y), h, font=F.fredoka(46, 650), fill=(30, 30, 30)); y += 64
        y = text_block(d, (M, y), t, F.nunito(37), W - 2 * M, spacing=1.32) + 34
    # venue card
    ch = 330; cy = y + 6
    d.rounded_rectangle([M, cy, W - M, cy + ch], radius=34, outline=NAVY, width=6, fill="white")
    lg = logo_color.resize((520, int(logo_color.height * 520 / logo_color.width)), Image.LANCZOS)
    img.paste(lg, (M + 40, cy + (ch - lg.height) // 2))
    x = M + 640; yy = cy + 44
    d.text((x, yy), CONTACT["name"], font=F.fredoka(52, 700), fill=NAVY); yy += 74
    for ln in (f"{CONTACT['addr1']}, {CONTACT['addr2']}", f"Phone: {CONTACT['phone']}", f"Email: {CONTACT['email']}", CONTACT["web"]):
        d.text((x, yy), ln, font=F.nunito(36, True), fill=(40, 40, 40)); yy += 52
    # image strip: imaginary aquarium views
    sy = cy + ch + 60
    d.text((M, sy), "Around the aquarium", font=F.fredoka(46, 650), fill=(30, 30, 30)); sy += 80
    names = [("entrance", "The entrance"), ("tunnel", "Shark Tunnel"), ("jellies", "Jellyfish Hall"), ("touchpool", "Touch Pool")]
    gap = 22; tw = (W - 2 * M - 3 * gap) // 4; th = int(tw * 1.12)
    for i, (key, cap) in enumerate(names):
        x0 = M + i * (tw + gap); fp = os.path.join(HERE, "aquarium", key + ".jpg")
        if os.path.exists(fp):
            im = ImageOps.fit(Image.open(fp).convert("RGB"), (tw, th), Image.LANCZOS)
            img.paste(im, (x0, sy)); d.rounded_rectangle([x0, sy, x0 + tw, sy + th], radius=18, outline=(210, 210, 210), width=3)
        else:
            d.rounded_rectangle([x0, sy, x0 + tw, sy + th], radius=18, outline=(170, 170, 170), width=4, fill=(238, 244, 246))
            d.text((x0 + tw / 2, sy + th / 2), "photo", font=F.nunito(34), fill=(150, 150, 150), anchor="mm")
        d.text((x0 + tw / 2, sy + th + 30), cap, font=F.nunito(30, True), fill=(60, 60, 60), anchor="mm")
    return img

def _glyph_cup(d, x, y, s):
    d.rounded_rectangle([x, y + s * .25, x + s * .6, y + s * .85], radius=s * .1, outline=INK, width=5)
    d.arc([x + s * .5, y + s * .35, x + s * .85, y + s * .7], -90, 90, fill=INK, width=5)
    for k in (.15, .3, .45): d.arc([x + s * k, y - s * .05, x + s * (k + .1), y + s * .2], 200, 340, fill=INK, width=4)

def _glyph_bag(d, x, y, s):
    d.polygon([(x + s * .1, y + s * .3), (x + s * .75, y + s * .3), (x + s * .85, y + s * .9), (x, y + s * .9)], outline=INK, width=5)
    d.arc([x + s * .22, y, x + s * .62, y + s * .5], 180, 360, fill=INK, width=5)

def map_page(F, A, logo):
    p = bf.page(F, "My Explorer Map", "Circle every animal you saw at the aquarium today!", "", "", logo, "find")
    d = p.d; mx0, mw = M, W - 2 * M
    # name + date line
    d.text((M, p.y - 8), "My name:", font=F.nunito(36, True), fill=INK); d.line([(M + 190, p.y + 34), (M + 760, p.y + 34)], fill=INK, width=4)
    d.text((M + 830, p.y - 8), "Date:", font=F.nunito(36, True), fill=INK); d.line([(M + 960, p.y + 34), (W - M, p.y + 34)], fill=INK, width=4)
    my0 = p.y + 80; mh = p.body_bottom + 130 - my0
    R = lambda fx0, fy0, fx1, fy1: [mx0 + fx0 * mw, my0 + fy0 * mh, mx0 + fx1 * mw, my0 + fy1 * mh]
    rbox(d, [mx0 - 14, my0 - 14, mx0 + mw + 14, my0 + mh + 14], r=44, width=8)
    # paths (dotted), drawn first so zones sit on top
    def dotted(pts, step=26):
        for (xa, ya), (xb, yb) in zip(pts, pts[1:]):
            n = int(max(abs(xb - xa), abs(yb - ya)) // step)
            for i in range(n + 1):
                t = i / max(n, 1); x = xa + (xb - xa) * t; y = ya + (yb - ya) * t
                d.ellipse([x - 6, y - 6, x + 6, y + 6], fill=INK)
    cx = mx0 + mw * .5
    dotted([(cx, my0 + mh * .88), (cx, my0 + mh * .035)])
    ZONES = [  # name, rect(frac), animals
        ("Reef Gallery", (0.0, 0.015, 0.47, 0.24), ["octopus", "clownfish", "seahorse", "starfish"]),
        ("Jellyfish Hall", (0.53, 0.015, 1.0, 0.24), ["jellyfish", "manta_ray"]),
        ("Otter & Sea Lion Cove", (0.0, 0.26, 0.47, 0.43), ["sea_otter", "sea_lion"]),
        ("Shark Tunnel", (0.53, 0.26, 1.0, 0.43), ["great_white_shark", "hammerhead_shark"]),
        ("Penguin Point", (0.0, 0.45, 0.47, 0.675), ["emperor_penguin", "atlantic_puffin"]),
        ("River Walk", (0.53, 0.45, 1.0, 0.675), ["capybara", "hippopotamus", "alligator", "platypus"]),
        ("Frog & Axolotl Corner", (0.0, 0.695, 0.47, 0.865), ["axolotl", "poison_dart_frog"]),
    ]
    nm = lambda k: k.replace("_", " ").title()
    for name, fr, ks in ZONES:
        x0, y0, x1, y1 = R(*fr); rbox(d, [x0, y0, x1, y1], r=34, width=6)
        f = F.fredoka(34, 650); tw = d.textlength(name, font=f)
        d.rounded_rectangle([x0 + 22, y0 - 4, x0 + 22 + tw + 30, y0 + 50], radius=24, fill="white", outline=INK, width=4)
        d.text((x0 + 37, y0 + 4), name, font=f, fill=INK)
        n = len(ks); cols = n if n <= 2 else 2; rows = (n + cols - 1) // cols
        gx0, gy0, gx1, gy1 = x0 + 16, y0 + 66, x1 - 16, y1 - 12
        cw, chh = (gx1 - gx0) / cols, (gy1 - gy0) / rows
        for i, k in enumerate(ks):
            c0 = gx0 + (i % cols) * cw; r0 = gy0 + (i // cols) * chh
            paste_fit(p.img, A.lineart(k, 3), (c0 + 8, r0, c0 + cw - 8, r0 + chh - 34))
            d.text((c0 + cw / 2, r0 + chh - 16), nm(k), font=F.nunito(24, True), fill=(70, 70, 70), anchor="mm")
    # cafe + gift shop (not animals: nothing to circle)
    x0, y0, x1, y1 = R(0.53, 0.695, 1.0, 0.865); rbox(d, [x0, y0, x1, y1], r=34, width=6, dash=True)
    f = F.fredoka(34, 650); d.rounded_rectangle([x0 + 22, y0 - 4, x0 + 22 + d.textlength("Café & Gift Shop", font=f) + 30, y0 + 50], radius=24, fill="white", outline=INK, width=4)
    d.text((x0 + 37, y0 + 4), "Café & Gift Shop", font=f, fill=INK)
    gs = 120; _glyph_cup(d, x0 + (x1 - x0) * .25 - gs / 2, y0 + 80, gs); _glyph_bag(d, x0 + (x1 - x0) * .72 - gs / 2, y0 + 80, gs)
    d.text((x0 + (x1 - x0) * .25 + 5, y0 + (y1 - y0) - 28), "Café", font=F.nunito(26, True), fill=(70, 70, 70), anchor="mm")
    d.text((x0 + (x1 - x0) * .72 + 5, y0 + (y1 - y0) - 28), "Gift Shop", font=F.nunito(26, True), fill=(70, 70, 70), anchor="mm")
    # entrance + you are here
    x0, y0, x1, y1 = R(0.27, 0.9, 0.73, 1.0)
    d.rounded_rectangle([x0, y0, x1, y1], radius=40, fill=INK)
    d.text(((x0 + x1) / 2, (y0 + y1) / 2 - 14), "ENTRANCE", font=F.fredoka(54, 700), fill="white", anchor="mm")
    d.text(((x0 + x1) / 2, (y0 + y1) / 2 + 30), "You are here!", font=F.nunito(28, True), fill="white", anchor="mm")
    # compass
    kx, ky = mx0 + mw * .93, my0 + mh * .93
    d.polygon([(kx, ky - 50), (kx + 16, ky), (kx, ky + 50), (kx - 16, ky)], outline=INK, width=5)
    d.text((kx, ky - 72), "N", font=F.fredoka(40, 700), fill=INK, anchor="mm")
    return p.img

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); ap.add_argument("--dpi-jpeg", type=int, default=70)
    a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
    R = lambda *q: os.path.join(REPO, *q)
    F = Fonts(R("Website", "fonts")); masters = R("GeneratedStyleAssetsMaster", "animals")
    D = RiverbendData(R("WildAtlas", "Data", "wild_atlas_catalog.json"), R("WildAtlas", "Data", "wild_atlas_strings.en.json"))
    A, S = Masters(masters), Scenes(REPO, D)
    # every animal used must exist as a master and in the catalog
    used = {k for k, _, _ in BOOK}
    for _, act, prm in BOOK:
        for v in prm.values():
            if isinstance(v, list):
                for x in v:
                    used |= set([x] if isinstance(x, str) else [y for y in (x if isinstance(x, (tuple, list)) else []) if isinstance(y, str) and y in D.A])
            if isinstance(v, dict): used |= set(v)
    missing = [k for k in used if k in D.A and not os.path.exists(os.path.join(masters, k + ".png"))]
    assert not missing, missing
    logo_small = load_logo("riverbend-logo-bw.png", 520); logo_color = load_logo("riverbend-logo.png")
    logo_color = Image.open(os.path.join(HERE, "riverbend-logo.png")).convert("RGB")
    logo_color = logo_color.crop(ImageOps.invert(logo_color.convert("L")).point(lambda v: 255 if v > 12 else 0).getbbox())
    logo_bw_full = load_logo("riverbend-logo-bw.png")

    pages = {}
    pages[1] = cover_page(F, logo_color)
    pages[2] = welcome_page(F, logo_color, logo_small); pages[3] = map_page(F, A, logo_small)
    keys = []
    fns = {"shadow": bf.act_shadow, "odd": bf.act_odd, "next": bf.act_next, "count": bf.act_count, "big": bf.act_big,
           "safe": bf.act_safe, "finish": bf.act_finish, "dots": bf.act_dots, "maze": bf.act_maze, "home": bf.act_home,
           "trace": bf.act_trace, "scramble": bf.act_scramble}
    for i, (k, act, prm) in enumerate(BOOK):
        pl, pr = 4 + 2 * i, 5 + 2 * i
        img, info = (bf.act_spot(F, D, S, logo_small, k, **prm) if act == "spot" else fns[act](F, D, A, logo_small, k, **prm))
        pages[pl] = img; pages[pr] = coloring_page(S, k, logo_bw_full)
        keys.append((pl, D.name(k), act, info)); print(f"p{pl:>3} {act:8s} {k}")
    pages[44] = bf.invent_page(F, logo_small)
    pages[45], pages[46] = bf.answer_pages(F, logo_small, keys)
    pages[47] = claim_page(F, logo_small); pages[48] = colophon_page(F)
    for n in range(3, 48): bf.number(pages[n], n, F)

    import fitz
    pdf = fitz.open()
    for n in range(1, 49):
        buf = io.BytesIO(); (pages[n].convert("RGB") if n <= 2 else pages[n].convert("L")).save(buf, "JPEG", quality=(82 if n <= 2 else a.dpi_jpeg), optimize=True)
        pg = pdf.new_page(width=612, height=792); pg.insert_image(pg.rect, stream=buf.getvalue())
        (pages[n].convert("RGB") if n <= 2 else pages[n].convert("L")).save(os.path.join(a.out, f"p{n:02d}.png"))
    pdf.set_metadata({"title": f"{VENUE} Animal Coloring & Activity Book (example)", "author": "Wild Atlas"})
    out = os.path.join(a.out, "riverbend-coloring-activity-book.pdf"); pdf.save(out, deflate=True, garbage=3)
    print("wrote", out, os.path.getsize(out) // 1024, "KB", len(pdf), "pages")

if __name__ == "__main__":
    main()
