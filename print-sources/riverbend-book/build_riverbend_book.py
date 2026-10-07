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
  ("octopus", "spot2", dict(removes=[(250, 1037), (436, 1484)], holes=[(1464, 160, 44)],
                             adds=[("clownfish", 800, 1010, 190, False), ("seahorse", 1500, 1040, 270, False)],
                             text="{n} things missing in the bottom picture: the octopus's eye, the left coral, the sponge, the clownfish and the seahorse.")),
  ("capybara", "maze", dict(prompt="Help the little capybara find its mom!", seed=5)),
  ("clownfish", "count", dict(counts={"clownfish": 5, "starfish": 4, "seahorse": 3},
                              sizes={"clownfish": 230, "starfish": 190, "seahorse": 210}, scene="ocean")),
  ("jellyfish", "shadow", dict(ks=["jellyfish", "octopus", "seahorse", "starfish"])),
  ("sea_otter", "next", dict(pats=[(["sea_otter", "starfish"], "ABAB"), (["seahorse", "sea_otter"], "AABAA"),
                                   (["clownfish", "octopus", "sea_otter"], "ABCAB"), (["sea_otter", "jellyfish"], "ABBAB")])),
  ("sea_turtle", "safe", dict(ks=["sea_turtle", "clownfish", "jellyfish", "poison_dart_frog", "seahorse", "sea_otter"])),
  ("seahorse", "finish", dict(prompt="Oh no! Part of me is missing. Draw my tail and my back fin. Then color me in!")),
  ("hippopotamus", "home", dict(prompt="I live in rivers and lakes in Africa. Draw my home: add water and reeds!")),
  ("manta_ray", "trace", dict(word="Manta")),
  ("sea_lion", "spot", dict(hide=[(0.70, 0.67, 0.84, 0.92)], hide_label="the sea lion's flipper")),
  ("glass_frog", "big", dict(rows=[("glass_frog", "sea_otter"), ("clownfish", "sea_turtle"), ("starfish", "octopus")])),
  ("starfish", "dots_rich", dict(N=64)),
  ("moray_eel", "odd", dict(rows=[("moray_eel", "seahorse"), ("clownfish", "jellyfish"), ("starfish", "moray_eel")])),
  ("atlantic_puffin", "scramble", dict(items=[("atlantic_puffin", "PUFFIN"), ("octopus", "OCTOPUS"), ("sea_otter", "OTTER"),
                                              ("clownfish", "CLOWNFISH"), ("starfish", "STARFISH")])),
  ("emperor_penguin", "dots_rich", dict(N=68)),
  ("tree_frog", "shadow", dict(ks=["tree_frog", "glass_frog", "poison_dart_frog", "axolotl"])),
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
    s = H / sh; im = src.resize((int(sw * s), H), Image.LANCZOS)
    out = bf.blank(); out.paste(im, ((W - im.width) // 2, 0)); return out

def title_page(F, logo_color):
    img = bf.blank(); d = ImageDraw.Draw(img)
    paste_fit(img, logo_color, (M + 40, 330, W - M - 40, 760))
    center_text(d, 900, "Animal Coloring", F.fredoka(120, 650)); center_text(d, 1040, "& Activity Book", F.fredoka(120, 650))
    center_text(d, 1220, "20 Animals from Oceans, Rivers & Rainforests", F.nunito(48, True))
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
         "encyclopedia for kids. Turn to the claim page near the back."),
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
    import qrcode
    qr = qrcode.QRCode(border=2, box_size=10); qr.add_data("https://riverbendaquarium.example/wild-atlas-free-pack"); qr.make(fit=True)
    qi = qr.make_image(fill_color="black", back_color="white").convert("RGB").resize((qs, qs), Image.NEAREST)
    d.rectangle([qx - 20, qy - 20, qx + qs + 20, qy + qs + 20], outline=INK, width=6); p.img.paste(qi, (qx, qy))
    cy = qy + qs + 70; f = F.fredoka(92, 650); txt = "RIVERBEND"; tw = d.textlength(txt, font=f)
    d.rounded_rectangle([(W - tw) / 2 - 70, cy, (W + tw) / 2 + 70, cy + 150], radius=75, width=6, outline=INK)
    d.text((W / 2, cy + 75), txt, font=f, fill=INK, anchor="mm")
    center_text(d, cy + 200, "Free: no ads, no sign-up, works offline.", F.nunito(40, True))
    text_block(d, (M + 40, cy + 300), "Example page. This QR code, “Riverbend Aquarium” and the code RIVERBEND are made up and unlock nothing. "
               "A real venue gets its own code and QR.", F.nunito(30), W - 2 * M - 80, fill=(110, 110, 110), align="center")
    return p.img

def colophon_page(F, logo_color):
    """Back cover: the front cover's ocean water (sampled row by row), both logos on white panels above the credits."""
    import numpy as np
    cov = np.array(Image.open(os.path.join(HERE, "candidates", "cover-full.jpg")).convert("RGB").resize((W, H), Image.LANCZOS)).astype(float)
    water = cov[: int(H * .60), 40:W - 40].mean(1)                                   # per-row average of the water-only part
    grad = np.stack([np.interp(np.linspace(0, len(water) - 1, H), np.arange(len(water)), water[:, c]) for c in range(3)], 1)
    img = Image.fromarray(np.repeat(grad[:, None, :], W, 1).astype("uint8")); d = ImageDraw.Draw(img)
    # Riverbend logo panel
    pw = 1100; lg = logo_color.resize((pw - 140, int(logo_color.height * (pw - 140) / logo_color.width)), Image.LANCZOS)
    ph = lg.height + 110; px = (W - pw) // 2; py = H - 1280
    d.rounded_rectangle([px, py, px + pw, py + ph], radius=64, fill="white"); img.paste(lg, (px + 70, py + 55))
    # Wild Atlas panel
    lk = wa_lockup(F, 110); tw_ = lk.width + 110; th_ = lk.height + 70; tx = (W - tw_) // 2; ty = py + ph + 60
    d.rounded_rectangle([tx, ty, tx + tw_, ty + th_], radius=48, fill="white"); img.paste(lk, (tx + 55, ty + 35), lk)
    d.text((W / 2, ty + th_ + 52), "Animals, facts & puzzles by Wild Atlas", font=F.nunito(34, True), fill=NAVY, anchor="mm")
    lines = [f"{VENUE} Animal Coloring & Activity Book", "", "Example book for the Wild Atlas partner program.",
             "Riverbend Aquarium is a fictional venue and is not a real organization.", "",
             "© 2026 Wild Atlas. All rights reserved.", "wildatlasapp.com/partners"]
    y = H - 450
    for ln in lines:
        d.text((W / 2, y), ln, font=F.nunito(34, ln.startswith(VENUE)), fill=NAVY, anchor="mm"); y += 50
    return img

# ------------------------------------------------------------------------------------------------ color cover, welcome, map
NAVY = (14, 58, 85)
SITE = os.path.join(HERE, "..", "..")          # website repo root (assets/)
CONTACT = dict(name=VENUE, addr1="100 Harbour Walk", addr2="Riverbend Point", phone="(555) 010-0142",
               email="hello@riverbendaquarium.example", web="riverbendaquarium.example")   # all fictional (.example, 555-01xx)

def cover_page(F, logo_color):
    """Full-color front cover: water gradient with a surface at the top, the octopus/jellyfish/turtle scene at the bottom."""
    # one seamless Gemini illustration (candidates/cover-full.jpg), water rising to the surface; no procedural layers
    cov = Image.open(os.path.join(HERE, "candidates", "cover-full.jpg")).convert("RGB").resize((W, H), Image.LANCZOS)
    d = ImageDraw.Draw(cov)
    # logo on a white panel, title, subtitle
    pw = 1360; lg = logo_color.resize((pw - 120, int(logo_color.height * (pw - 120) / logo_color.width)), Image.LANCZOS)
    ph = lg.height + 100; px = (W - pw) // 2; py = 190
    d.rounded_rectangle([px, py, px + pw, py + ph], radius=60, fill="white")
    cov.paste(lg, (px + 60, py + 50))
    ty = py + ph + 110
    for i, ln in enumerate(("Animal Coloring", "& Activity Book")):
        d.text((W / 2, ty + i * 150), ln, font=F.fredoka(128, 700), fill=NAVY, anchor="mm", stroke_width=7, stroke_fill="white")
    sub = "20 Animals from Oceans, Rivers & Rainforests to Color & Solve"; f = F.nunito(50, True)
    sw_ = d.textlength(sub, font=f)
    yy = ty + 300
    d.rounded_rectangle([(W - sw_) / 2 - 40, yy - 44, (W + sw_) / 2 + 40, yy + 44], radius=44, fill="white")
    d.text((W / 2, yy), sub, font=f, fill=NAVY, anchor="mm")
    ft = "Example book. Riverbend Aquarium is a fictional venue."; ff = F.nunito(28, True); fw = d.textlength(ft, font=ff)
    d.rounded_rectangle([60, H - 86, 60 + fw + 60, H - 30], radius=28, fill=NAVY)
    d.text((90, H - 58), ft, font=ff, fill="white", anchor="lm")
    lk = wa_lockup(F, 84); tag_w, tag_h = lk.width + 70, lk.height + 40       # Wild Atlas attribution, bottom right
    tx0, ty0 = W - 60 - tag_w, H - 40 - tag_h
    d.rounded_rectangle([tx0, ty0, tx0 + tag_w, ty0 + tag_h], radius=36, fill="white")
    cov.paste(lk, (tx0 + 35, ty0 + 20), lk)
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
    y = 105
    d.text((M, y), f"Welcome to {VENUE}!", font=F.fredoka(78, 700), fill=NAVY); y += 112
    paras = [("Our story", "Riverbend Aquarium opened in 1987, started by teachers, fishers and neighbors who wanted every child in town to meet the animals of the water up close. "
                           "Today we care for more than 25 kinds of animals and give rescued otters and sea lions a safe home. Every visit helps fund animal care, rescue work and free school programs. "
                           "We hope this book keeps the wonder going long after you leave."),
             ("How this book works", "Every animal gets two pages: the animal to color on the left, with real facts to read aloud, and a puzzle or something to draw on the right. "
                                     "Read each one-line instruction once; the little picture reminds your explorer what to do. Crayons and colored pencils work best. Most answers are printed upside down on the page; the rest are in the answer key."),
             ("A free animal pack", "This book includes a free animal pack for the Wild Atlas app, a safe, ad-free animal encyclopedia for kids. The claim page is near the back of the book.")]
    for h, t in paras:
        d.text((M, y), h, font=F.fredoka(46, 650), fill=(30, 30, 30)); y += 62
        y = text_block(d, (M, y), t, F.nunito(36), W - 2 * M, spacing=1.3) + 28
    # venue card
    ch = 300; cy = y + 4
    d.rounded_rectangle([M, cy, W - M, cy + ch], radius=34, outline=NAVY, width=6, fill="white")
    lg = logo_color.resize((520, int(logo_color.height * 520 / logo_color.width)), Image.LANCZOS)
    img.paste(lg, (M + 40, cy + (ch - lg.height) // 2))
    x = M + 640; yy = cy + 44
    d.text((x, yy), CONTACT["name"], font=F.fredoka(50, 700), fill=NAVY); yy += 66
    for ln in (f"{CONTACT['addr1']}, {CONTACT['addr2']}", f"Phone: {CONTACT['phone']}", f"Email: {CONTACT['email']}", CONTACT["web"]):
        d.text((x, yy), ln, font=F.nunito(34, True), fill=(40, 40, 40)); yy += 46
    # image strip: imaginary aquarium views
    sy = cy + ch + 44
    names = [("entrance", "The entrance"), ("tunnel", "Ocean Tunnel"), ("jellies", "Jellyfish Hall"), ("touchpool", "Touch Pool")]
    gap = 22; tw = (W - 2 * M - 3 * gap) // 4; th = int(tw * .85)
    for i, (key, cap) in enumerate(names):
        x0 = M + i * (tw + gap); fp = os.path.join(HERE, "aquarium", key + ".jpg")
        if os.path.exists(fp):
            im = ImageOps.fit(Image.open(fp).convert("RGB"), (tw, th), Image.LANCZOS)
            img.paste(im, (x0, sy)); d.rounded_rectangle([x0, sy, x0 + tw, sy + th], radius=18, outline=(210, 210, 210), width=3)
        else:
            d.rounded_rectangle([x0, sy, x0 + tw, sy + th], radius=18, outline=(170, 170, 170), width=4, fill=(238, 244, 246))
            d.text((x0 + tw / 2, sy + th / 2), "photo", font=F.nunito(34), fill=(150, 150, 150), anchor="mm")
        d.text((x0 + tw / 2, sy + th + 30), cap, font=F.nunito(30, True), fill=(60, 60, 60), anchor="mm")
    # footer: Wild Atlas lockup + QR to install the app
    import qrcode
    qr = qrcode.QRCode(border=2, box_size=10); qr.add_data("https://apps.apple.com/us/app/wild-atlas/id6761081031"); qr.make(fit=True)
    qi = qr.make_image(fill_color="black", back_color="white").convert("RGB").resize((250, 250), Image.NEAREST)
    fy = H - 330
    d.line([(M, fy - 30), (W - M, fy - 30)], fill=(200, 200, 200), width=3)
    d.text((M, fy + 6), "Animals, facts & puzzles by", font=F.nunito(30, True), fill=(120, 120, 120))
    lk = wa_lockup(F, 130); img.paste(lk, (M, fy + 50), lk)
    d.text((M, fy + 205), "A safe, ad-free animal app for kids.", font=F.nunito(34), fill=(70, 70, 70))
    img.paste(qi, (W - M - 250, fy + 10))
    d.text((W - M - 265, fy + 90), "Scan to install", font=F.fredoka(40, 650), fill=(30, 30, 30), anchor="rm")
    d.text((W - M - 265, fy + 140), "Wild Atlas, free on iPhone & iPad", font=F.nunito(28), fill=(90, 90, 90), anchor="rm")
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
    ZONES = [  # name, rect(frac), animals -- only animals that live at Vancouver Aquarium (vanaqua.org) AND are in Wild Atlas
        ("Octopus & Sea Star Cove", (0.0, 0.015, 0.47, 0.285), ["octopus", "starfish"]),
        ("Jellyfish Hall", (0.53, 0.015, 1.0, 0.285), ["jellyfish"]),
        ("Otter & Sea Lion Bay", (0.0, 0.315, 0.47, 0.585), ["sea_otter", "sea_lion"]),
        ("Rainforest Gallery", (0.53, 0.315, 1.0, 0.585), ["sloth", "poison_dart_frog"]),
        ("Axolotl Corner", (0.0, 0.615, 0.47, 0.865), ["axolotl"]),
    ]
    nm = lambda k: k.replace("_", " ").title()
    for name, fr, ks in ZONES:
        x0, y0, x1, y1 = R(*fr); rbox(d, [x0, y0, x1, y1], r=34, width=6)
        f = F.fredoka(34, 650); tw = d.textlength(name, font=f)
        d.rounded_rectangle([x0 + 22, y0 - 4, x0 + 22 + tw + 30, y0 + 50], radius=24, fill="white", outline=INK, width=4)
        d.text((x0 + 37, y0 + 4), name, font=f, fill=INK)
        n = len(ks); cols = n
        gx0, gy0, gx1, gy1 = x0 + 16, y0 + 66, x1 - 16, y1 - 12
        cw, chh = (gx1 - gx0) / cols, (gy1 - gy0)
        for i, k in enumerate(ks):
            c0 = gx0 + i * cw
            paste_fit(p.img, A.lineart(k, 3), (c0 + 8, gy0, c0 + cw - 8, gy0 + chh - 40))
            d.text((c0 + cw / 2, gy0 + chh - 18), nm(k), font=F.nunito(28, True), fill=(70, 70, 70), anchor="mm")
    # cafe + gift shop (Gemini icons; nothing to circle here)
    x0, y0, x1, y1 = R(0.53, 0.615, 1.0, 0.865); rbox(d, [x0, y0, x1, y1], r=34, width=6, dash=True)
    f = F.fredoka(34, 650); d.rounded_rectangle([x0 + 22, y0 - 4, x0 + 22 + d.textlength("Café & Gift Shop", font=f) + 30, y0 + 50], radius=24, fill="white", outline=INK, width=4)
    d.text((x0 + 37, y0 + 4), "Café & Gift Shop", font=f, fill=INK)
    cw = (x1 - x0 - 32) / 2
    for i, (fn, lab) in enumerate((("icon-cafe.jpg", "Café"), ("icon-giftshop.jpg", "Gift Shop"))):
        ic = Image.open(os.path.join(HERE, "icons", fn)).convert("L").point(lambda v: 255 if v > 200 else 0 if v < 90 else v)
        c0 = x0 + 16 + i * cw
        paste_fit(p.img, ic.convert("RGB"), (c0 + 10, y0 + 66, c0 + cw - 10, y1 - 56))
        d.text((c0 + cw / 2, y1 - 28), lab, font=F.nunito(28, True), fill=(70, 70, 70), anchor="mm")
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

# ------------------------------------------------------------------------------------------------ math & writing pages
import math as _m

def _arc(cx, cy, rx, ry, a0, a1, n=48):
    """Points on an ellipse; angles in degrees, 0=right, 90=top (y up), counterclockwise positive."""
    return [(cx + rx * _m.cos(_m.radians(a0 + (a1 - a0) * i / n)), cy - ry * _m.sin(_m.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]

def _line(*pts, n=24):
    out = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        out += [(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n) for i in range(n)]
    out.append(pts[-1]); return out

# stroke-order centerlines in a unit box (x right, y down); each digit is a list of strokes
DIGITS = {
  "0": [_arc(.5, .5, .3, .45, 90, 450, 72)],
  "1": [_line((.2, .3), (.62, .07)), _line((.62, .07), (.62, .97))],
  "2": [_arc(.5, .3, .34, .24, 160, -40) + _line((.76, .46), (.12, .95))[1:], _line((.12, .95), (.92, .95))],
  "3": [_arc(.45, .27, .32, .21, 150, -90), _arc(.45, .72, .36, .24, 90, -150)],
  "4": [_line((.62, .05), (.08, .68), (.93, .68)), _line((.62, .05), (.62, .97))],
  "5": [_line((.24, .07), (.2, .45)) + _arc(.48, .67, .36, .3, 130, -140)[1:], _line((.24, .07), (.86, .07))],
  "6": [_line((.78, .06), (.32, .38), (.2, .72), n=18) + _arc(.5, .72, .3, .25, 180, 540, 72)[1:]],
  "7": [_line((.1, .07), (.9, .07)), _line((.9, .07), (.32, .97))],
  "8": [[(.5 + .3 * _m.sin(2 * t), .5 - .45 * _m.cos(t)) for t in [2 * _m.pi * i / 90 for i in range(91)]]],
  "9": [_arc(.5, .3, .27, .24, 0, 360, 64) + _line((.77, .3), (.74, .6), (.55, .88), (.28, .95))[1:]],
}

def _draw_digit(d, strokes, ox, oy, w, h, F):
    pw = int(min(w, h) * .27)                       # corridor width
    P = [[(ox + x * w, oy + y * h) for x, y in st] for st in strokes]
    r = pw // 2
    for width, col in ((pw, INK), (pw - 18, "white")):
        for st in P:
            d.line(st, fill=col, width=width, joint="curve")
            for x, y in st[::3] + [st[-1]]: d.ellipse([x - width / 2, y - width / 2, x + width / 2, y + width / 2], fill=col)
    for i, st in enumerate(P):                       # dashed centerline
        run, on = 0, True
        for (x0, y0), (x1, y1) in zip(st, st[1:]):
            seg = _m.hypot(x1 - x0, y1 - y0)
            if on: d.line([(x0, y0), (x1, y1)], fill=(110, 110, 110), width=4)
            run += seg
            if run > (18 if on else 14): on, run = (not on), 0
        # arrow at the end
        (xa, ya), (xb, yb) = st[-4] if len(st) > 4 else st[0], st[-1]; ang = _m.atan2(yb - ya, xb - xa)
        d.polygon([(xb + 22 * _m.cos(ang), yb + 22 * _m.sin(ang)),
                   (xb + 10 * _m.cos(ang + 2.2), yb + 10 * _m.sin(ang + 2.2)), (xb + 10 * _m.cos(ang - 2.2), yb + 10 * _m.sin(ang - 2.2))], fill=INK)
    seen = []
    for i, st in enumerate(P):                       # numbered start dots
        x, y = st[0]
        while any(abs(x - sx) < 34 and abs(y - sy) < 34 for sx, sy in seen): x += 38
        seen.append((x, y)); d.ellipse([x - 21, y - 21, x + 21, y + 21], fill=INK)
        d.text((x, y), str(i + 1), font=F.nunito(26, True), fill="white", anchor="mm")

def _name_date(d, F):
    d.text((M, 36), "Name:", font=F.nunito(32, True), fill=INK); d.line([(M + 130, 74), (M + 760, 74)], fill=INK, width=4)
    d.text((M + 830, 36), "Date:", font=F.nunito(32, True), fill=INK); d.line([(M + 940, 74), (W - M, 74)], fill=INK, width=4)

def act_numbers(F, logo):
    p = bf.page(F, "Write the Numbers", "Trace each number. Start at the dot and follow the arrows!", "", "", logo, "trace")
    d = p.d; _name_date(d, F)
    top = p.y + 40; avail = p.body_bottom + 80 - top; rowh = avail / 3; colw = (W - 2 * M) / 4
    layout = [("0", 0, 0, 1), ("1", 1, 0, 1), ("2", 2, 0, 1), ("3", 3, 0, 1),
              ("4", 0, 1, 1), ("5", 1, 1, 1), ("6", 2, 1, 1), ("7", 3, 1, 1), ("8", 0, 2, 1), ("9", 1, 2, 1)]
    dh = rowh - 95; dw = colw - 80
    for ch, c, r, _ in layout:
        _draw_digit(d, DIGITS[ch], M + c * colw + 35, top + r * rowh + 10, dw, dh, F)
    # "10" spans the last two cells: a one and a zero
    ox = M + 2 * colw + 35
    _draw_digit(d, DIGITS["1"], ox, top + 2 * rowh + 10, dw * .85, dh, F)
    _draw_digit(d, DIGITS["0"], ox + colw * .78, top + 2 * rowh + 10, dw, dh, F)
    return p.img

def act_howmany(F, A, logo):
    p = bf.page(F, "How Many?", "Count the animals. Write the number in the box.", "", "", logo, "count")
    d = p.d; _name_date(d, F)
    rows = [("clownfish", 4), ("sea_turtle", 1), ("jellyfish", 3), ("seahorse", 2), ("starfish", 5)]
    top = p.y + 30; bottom = p.body_bottom + 70; rowh = (bottom - top) / len(rows)
    d.rectangle([M, top, W - M, bottom], outline=INK, width=8)
    bx = 260                                         # write-in box width
    for i, (k, n) in enumerate(rows):
        y0 = top + i * rowh
        if i: d.line([(M, y0), (W - M, y0)], fill=INK, width=7)
        d.rounded_rectangle([W - M - bx - 20, y0 + 25, W - M - 20, y0 + rowh - 25], radius=18, outline=INK, width=7)
        cell = (W - 2 * M - bx - 90) / 5; ih = rowh - 70
        for j in range(n):
            paste_fit(p.img, A.lineart(k, 3), (M + 30 + j * cell, y0 + 35, M + 30 + j * cell + cell - 14, y0 + 35 + ih))
    ans = ", ".join(str(n) for _, n in rows)
    g.upside_down(p.img, (W / 2, bottom + 28), "Answers: " + ans, F.nunito(28))
    return p.img, dict(kind="text", text=ans)

def act_maze2(F, D, A, logo, k, prompt, seed):
    """Maze with a clearly smaller baby at the start (heart + label) and a big mom at the finish."""
    cols, rows = 9, 9; walls = bf.build_maze(cols, rows, seed)
    p = bf.page(F, "Amazing Maze", prompt, D.name(k), D.pack(k), logo, "draw")
    d = p.d; cell = 118; mx = (W - cols * cell) / 2 + 60; my = p.y + 210
    for (c, r), ws in walls.items():
        x, y = mx + c * cell, my + r * cell
        if "N" in ws and not (c == 0 and r == 0): d.line([(x, y), (x + cell, y)], fill=INK, width=7)
        if "S" in ws and not (c == cols - 1 and r == rows - 1): d.line([(x, y + cell), (x + cell, y + cell)], fill=INK, width=7)
        if "W" in ws: d.line([(x, y), (x, y + cell)], fill=INK, width=7)
        if "E" in ws: d.line([(x + cell, y), (x + cell, y + cell)], fill=INK, width=7)
    paste_fit(p.img, A.lineart(k, 3), (mx + 4, my - 128, mx + cell - 4, my - 40))                 # baby: small
    d.text((mx - 14, my - 84), "Baby", font=F.fredoka(46, 650), fill=INK, anchor="rm")
    hx, hy = mx + cell + 24, my - 84                                                            # a heart beside the baby
    d.polygon([(hx, hy + 22), (hx - 24, hy - 4), (hx - 16, hy - 20), (hx, hy - 8), (hx + 16, hy - 20), (hx + 24, hy - 4)], outline=INK, width=5)
    mom = ImageOps.mirror(A.lineart(k, 3))
    paste_fit(p.img, mom, (mx + cols * cell - 300, my + rows * cell + 8, mx + cols * cell + 170, my + rows * cell + 185))   # mom: big
    d.text((mx + cols * cell - 320, my + rows * cell + 96), "Mom", font=F.fredoka(60, 700), fill=INK, anchor="rm")
    key = p.img.crop((int(mx - 20), int(my - 20), int(mx + cols * cell + 20), int(my + rows * cell + 20))).copy()
    kd = ImageDraw.Draw(key)
    pts = [(c * cell + cell / 2 + 20, r * cell + cell / 2 + 20) for c, r in bf.maze_path(walls, cols, rows)]
    kd.line(pts, fill=(90, 90, 90), width=22, joint="curve")
    return p.img, dict(kind="maze", img=key)

def act_dots_outline(F, D, A, logo, k, N=60):
    """Dot-to-dot with the outline dots only (no inside lines): cleaner for animals with busy texture, like the starfish."""
    import numpy as np, cv2
    p = bf.page(F, "Dot-to-Dot", "Connect the dots from 1 to the end. Then color me in!", D.name(k), D.pack(k), logo, "connect")
    c = A.contour(k)
    closed = np.vstack([c, c[:1]]); seg = np.r_[0, np.cumsum(np.hypot(*np.diff(closed, axis=0).T))]
    pts = np.array([closed[np.searchsorted(seg, t, side="right") - 1] for t in np.linspace(0, seg[-1], N, endpoint=False)])
    approx = cv2.approxPolyDP(c.astype(np.int32).reshape(-1, 1, 2), seg[-1] * .004, True)[:, 0, :]
    for q in approx:                                                       # snap dots onto the sharp tips (the arms)
        i = np.argmin(np.hypot(*(pts - q).T))
        if np.hypot(*(pts[i] - q)) < seg[-1] / N * .6: pts[i] = q
    pts = np.roll(pts, -int(np.argmax(pts[:, 0])), axis=0)
    iw, ih = A.size(k); bx0, by0, bx1, by1 = M + 60, p.y + 60, W - M - 60, p.body_bottom - 40
    s = min((bx1 - bx0) / iw, (by1 - by0) / ih); ox, oy = bx0 + ((bx1 - bx0) - iw * s) / 2, by0 + ((by1 - by0) - ih * s) / 2
    f = F.nunito(28, True); cxm, cym = pts[:, 0].mean(), pts[:, 1].mean()
    for i, (x, y) in enumerate(pts, 1):
        X, Y = ox + x * s, oy + y * s
        p.d.ellipse([X - 9, Y - 9, X + 9, Y + 9], fill=INK)
        vx, vy = x - cxm, y - cym; nr = max(np.hypot(vx, vy), 1)
        p.d.text((X + vx / nr * 34, Y + vy / nr * 34), str(i), font=f, fill=INK, anchor="mm")
    return p.img, None

# ------------------------------------------------------------------------------------------------ richer dot-to-dots, bigger spot-the-difference
def _master_crop(k, masters):
    """The RGBA master cropped exactly like Masters._load (alpha bbox + 12px pad), so contours line up with A.contour/A.size."""
    import numpy as np
    im = np.array(Image.open(os.path.join(masters, f"{k}.png")).convert("RGBA")); a = im[:, :, 3]
    ys, xs = np.where(a > 20); pad = 12
    y0, y1, x0, x1 = max(ys.min() - pad, 0), ys.max() + pad, max(xs.min() - pad, 0), xs.max() + pad
    return im[y0:y1, x0:x1]

def _resample(c, spacing):
    import numpy as np
    closed = np.vstack([c, c[:1]]); seg = np.r_[0, np.cumsum(np.hypot(*np.diff(closed, axis=0).T))]
    n = max(6, int(seg[-1] // spacing))
    return np.array([closed[np.searchsorted(seg, t, side="right") - 1] for t in np.linspace(0, seg[-1], n, endpoint=False)])

def _closed_mask(rgba, k=41):
    import numpy as np, cv2
    m = (rgba[:, :, 3] > 20).astype(np.uint8) * 255
    return cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))

def _largest_contour(mask):
    import numpy as np, cv2
    cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    return max(cs, key=cv2.contourArea)[:, 0, :].astype(float)

def _penguin_features(rgba):
    """Closed contours (master px) of the head, orange collar, wings and the face marks, found by color."""
    import numpy as np, cv2
    rgb = rgba[:, :, :3].astype(int); a = rgba[:, :, 3] > 20; h, w = a.shape
    dark = ((rgb.sum(2) < 210) & a).astype(np.uint8)
    orange = (((rgb[:, :, 0] > 170) & (rgb[:, :, 0] - rgb[:, :, 2] > 70)) & a).astype(np.uint8)
    cs = []
    def add(m, minpts=8):
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
        found, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        if found:
            c = max(found, key=cv2.contourArea)[:, 0, :].astype(float)
            if len(c) >= minpts: cs.append(c)
    n, lab, st, cen = cv2.connectedComponentsWithStats(dark, 8)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 0.004 * h * w and cen[i][1] < 0.82 * h: add((lab == i).astype(np.uint8))
    n3, lab3, st3, _ = cv2.connectedComponentsWithStats(orange, 8)
    for i in range(1, n3):
        if st3[i, cv2.CC_STAT_AREA] > 0.0004 * h * w: add((lab3 == i).astype(np.uint8), 5)
    light = ((rgb.sum(2) > 690) & a).astype(np.uint8)                       # the white belly
    n4, lab4, st4, _ = cv2.connectedComponentsWithStats(light, 8)
    if n4 > 1:
        big = 1 + int(np.argmax(st4[1:, cv2.CC_STAT_AREA])); add((lab4 == big).astype(np.uint8))
    # face marks: light spots inside the dark head
    head = np.zeros_like(dark); ys, xs = np.where(dark[: int(.2 * h)] > 0)
    if len(xs):
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        spot = ((rgb.sum(2) > 330) & a); spot[:, :x0] = False; spot[:, x1:] = False; spot[:y0] = False; spot[y1:] = False
        n2, lab2, st2, _ = cv2.connectedComponentsWithStats(spot.astype(np.uint8), 8)
        for i in range(1, n2):
            if 20 < st2[i, cv2.CC_STAT_AREA] < 0.004 * h * w: add((lab2 == i).astype(np.uint8), 4)
    return cs

def _starfish_features(A, k):
    """Peaks (tips) and valleys of the starfish outline, in master px, plus its center."""
    import numpy as np
    c = A.contour(k); cen = c.mean(0); v = c - cen; r = np.hypot(v[:, 0], v[:, 1]); th = np.arctan2(v[:, 1], v[:, 0])
    order = np.argsort(th); th, r, c = th[order], r[order], c[order]
    rs = np.convolve(np.r_[r[-9:], r, r[:9]], np.ones(19) / 19, mode="same")[9:-9]
    peaks = []
    for i in np.argsort(-rs):
        if all(min(abs(th[i] - th[j]), 2 * np.pi - abs(th[i] - th[j])) > np.radians(50) for j in peaks): peaks.append(i)
        if len(peaks) == 5: break
    peaks.sort(key=lambda i: th[i])
    tips = [(c[i], th[i]) for i in peaks]
    return tips, cen, float(np.median(rs))

def act_dots_rich(F, D, A, logo, k, N=84, masters=None):
    """Dot-to-dot with a finer outline plus extra inside definition.
    penguin: head, collar, wings and face marks as dotted guide lines; starfish: a numbered inner star plus ring 'nodules'."""
    import numpy as np, cv2
    masters = masters or os.path.join(REPO, "GeneratedStyleAssetsMaster", "animals")
    rgba = _master_crop(k, masters)
    ink = "Connect the dots from 1 to the end. Then trace the dotted lines inside!" if k == "emperor_penguin" else "Connect the dots from 1 to the end, even the star inside. Then color me in!"
    p = bf.page(F, "Dot-to-Dot", ink, D.name(k), D.pack(k), logo, "connect")
    closed = _closed_mask(rgba, 29 if k == "emperor_penguin" else 15)
    c = _largest_contour(closed)
    cl = np.vstack([c, c[:1]]); seg = np.r_[0, np.cumsum(np.hypot(*np.diff(cl, axis=0).T))]
    pts = np.array([cl[np.searchsorted(seg, t, side="right") - 1] for t in np.linspace(0, seg[-1], N, endpoint=False)])
    approx = cv2.approxPolyDP(c.astype(np.int32).reshape(-1, 1, 2), seg[-1] * .006, True)[:, 0, :]
    for q in approx:
        i = np.argmin(np.hypot(*(pts - q).T))
        if np.hypot(*(pts[i] - q)) < seg[-1] / N * .6: pts[i] = q
    pts = np.roll(pts, -int(np.argmax(pts[:, 0])), axis=0)
    h0, w0 = rgba.shape[:2]
    bx0, by0, bx1, by1 = M + 60, p.y + 60, W - M - 60, p.body_bottom - 40
    s = min((bx1 - bx0) / w0, (by1 - by0) / h0); ox, oy = bx0 + ((bx1 - bx0) - w0 * s) / 2, by0 + ((by1 - by0) - h0 * s) / 2
    X = lambda x, y: (ox + x * s, oy + y * s)
    DOT = (80, 80, 80); f = F.nunito(28, True)
    cxm, cym = pts[:, 0].mean(), pts[:, 1].mean()
    extra = []                                                         # numbered inner points (starfish)
    if k == "emperor_penguin":
        inside = cv2.distanceTransform(closed, cv2.DIST_L2, 5)
        for cont in _penguin_features(rgba):
            tiny = cv2.contourArea(cont.astype(np.float32)) < 900
            for x, y in _resample(cont, (14 if tiny else 30) / s):
                xi, yi = int(min(max(x, 0), w0 - 1)), int(min(max(y, 0), h0 - 1))
                if inside[yi, xi] > 12 or tiny:
                    a_, b_ = X(x, y); r_ = 4 if tiny else 6; p.d.ellipse([a_ - r_, b_ - r_, a_ + r_, b_ + r_], fill=DOT)
        # a dotted line down the middle of each wing (split by side, since the wings join the head in the color mask)
        rgb_ = rgba[:, :, :3].astype(int); dark_ = ((rgb_.sum(2) < 210) & (rgba[:, :, 3] > 20))
        for x_lo, x_hi in ((0, int(w0 * .36)), (int(w0 * .64), w0)):
            for yy_ in range(int(h0 * .24), int(h0 * .80), max(int(30 / s), 6)):
                xs_ = np.where(dark_[yy_, x_lo:x_hi])[0]
                if len(xs_) > 6:
                    a_, b_ = X(x_lo + xs_.mean(), yy_); p.d.ellipse([a_ - 5, b_ - 5, a_ + 5, b_ + 5], fill=DOT)
    elif k == "starfish":
        tips, cen, Rm = _starfish_features(A, k)
        inner = []
        for n_, (tp, th) in enumerate(tips):
            inner.append(cen + (tp - cen) * 0.52)
            nxt = tips[(n_ + 1) % len(tips)][1]; mid = (th + (nxt if nxt > th else nxt + 2 * np.pi)) / 2
            inner.append(cen + Rm * 0.22 * np.array([np.cos(mid), np.sin(mid)]))
        extra = inner
        for tp, th in tips:                                            # printed ring "nodules" along each arm
            for f_ in (0.68, 0.84):
                a_, b_ = X(*(cen + (tp - cen) * f_)); p.d.ellipse([a_ - 13, b_ - 13, a_ + 13, b_ + 13], outline=INK, width=5)
        a_, b_ = X(*cen); p.d.ellipse([a_ - 16, b_ - 16, a_ + 16, b_ + 16], outline=INK, width=5)
    def put(i, x, y, cx, cy):
        a_, b_ = X(x, y); p.d.ellipse([a_ - 9, b_ - 9, a_ + 9, b_ + 9], fill=INK)
        vx, vy = x - cx, y - cy; nr = max(np.hypot(vx, vy), 1)
        p.d.text((a_ + vx / nr * 34, b_ + vy / nr * 34), str(i), font=f, fill=INK, anchor="mm")
    for i, (x, y) in enumerate(pts, 1): put(i, x, y, cxm, cym)
    for j, (x, y) in enumerate(extra, len(pts) + 1): put(j, x, y, cxm, cym)
    return p.img, None

def act_spot2(F, D, S, A, logo, k, removes, holes, adds, text):
    """Spot the Difference. The TOP picture is the complete original (including the added animals). The BOTTOM picture has
    things missing: removed coral/sponge components, round holes (the eye) and the animals that appear only on top.
    removes/holes/adds use art pixel coordinates; holes are (cx, cy, radius)."""
    import numpy as np, cv2
    from PIL import ImageChops
    base = S.art(k).point(lambda v: 0 if v < 150 else 255); a = np.array(base); h_, w_ = a.shape
    n, lab, st, cen = cv2.connectedComponentsWithStats((a == 0).astype(np.uint8), 8)
    big = max(range(1, n), key=lambda i: st[i, cv2.CC_STAT_AREA])
    b = a.copy(); marks = []
    for cx, cy in removes:                                                   # remove the nearest sizeable component + its residue
        cand = [i for i in range(1, n) if i != big and st[i, cv2.CC_STAT_AREA] > 1200]
        i = min(cand, key=lambda i: np.hypot(cen[i][0] - cx, cen[i][1] - cy))
        x0_, y0_, ww_, hh_ = st[i, 0], st[i, 1], st[i, 2], st[i, 3]
        inside_box = np.isin(lab, [j for j in range(1, n) if j != big and x0_ - 70 <= cen[j][0] <= x0_ + ww_ + 70
                                   and y0_ - 70 <= cen[j][1] <= y0_ + hh_ + 70 and st[j, 2] < 700 and st[j, 3] < 700])
        b[inside_box] = 255; marks.append((cen[i][0], cen[i][1], max(ww_, hh_) / 2))
    for cx, cy, rad in holes:                                                # a round, neat hole (the eye)
        cv2.circle(b, (int(cx), int(cy)), int(rad), 255, -1); marks.append((cx, cy, rad * 1.5))
    top = Image.fromarray(a)
    for animal, cx, cy, hpx, flip in adds:                                    # animals present on top only
        la = A.lineart(animal, 4).convert("L")
        if flip: la = ImageOps.mirror(la)
        la = la.crop(ImageOps.invert(la).getbbox()); la = la.resize((int(la.width * hpx / la.height), hpx), Image.LANCZOS)
        pad = Image.new("L", top.size, 255); pad.paste(la, (int(cx - la.width / 2), int(cy - la.height / 2)))
        top = ImageChops.darker(top, pad); marks.append((cx, cy, max(la.width, la.height) / 2))
    bottom = Image.fromarray(b); n_d = len(marks)
    p = bf.page(F, "Spot the Difference", f"Find {n_d} things missing in the bottom picture. Circle them!", D.name(k), D.pack(k), logo, "find")
    t0 = p.y + 10; gap = 40; ph = (p.body_bottom - t0 - gap) / 2; crop_h = int(.82 * h_)
    r = None
    for j, im in enumerate((top.crop((0, 0, w_, crop_h)), bottom.crop((0, 0, w_, crop_h)))):
        r = paste_fit(p.img, im, (M, t0 + j * (ph + gap), W - M, t0 + j * (ph + gap) + ph))
        rbox(p.d, [r[0] - 8, r[1] - 8, r[2] + 8, r[3] + 8], r=24, width=5)
    for x in range(n_d):
        cx = r[2] + 62 + x * 54
        p.d.ellipse([cx - 20, t0 + ph + gap / 2 - 20, cx + 20, t0 + ph + gap / 2 + 20], outline=INK, width=4)
    key = bottom.convert("RGB"); kd = ImageDraw.Draw(key)
    for cx, cy, rr in marks:
        rr = max(rr * 1.2, 70); kd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=INK, width=14)
    return p.img, dict(kind="spot", img=key, text=text.format(n=n_d))

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
    footer_rb = logo_small.resize((int(logo_small.width * 64 / logo_small.height), 64), Image.LANCZOS)
    logo_small = None                                   # page templates no longer paste a logo; the footer below does
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
    fns["maze"] = act_maze2; fns["dots_outline"] = act_dots_outline; fns["dots_rich"] = act_dots_rich
    for i, (k, act, prm) in enumerate(BOOK):
        pl, pr = 4 + 2 * i, 5 + 2 * i
        img, info = (bf.act_spot(F, D, S, logo_small, k, **prm) if act == "spot" else
                     act_spot2(F, D, S, A, logo_small, k, **prm) if act == "spot2" else fns[act](F, D, A, logo_small, k, **prm))
        pages[pr] = img; pages[pl] = coloring_page(S, k, logo_bw_full)          # coloring page first (left), puzzle right
        keys.append((pr, D.name(k), act, info)); print(f"p{pl:>3} {act:8s} {k}")
    pages[44] = act_numbers(F, logo_small)
    pages[45], info45 = act_howmany(F, A, logo_small); keys.append((45, "How Many?", "count", info45))
    pages[46] = bf.invent_page(F, logo_small)
    pages[47], pages[48] = bf.answer_pages(F, logo_small, keys)
    pages[49] = claim_page(F, logo_small); pages[50] = colophon_page(F, logo_color)
    footer_lk = wa_lockup(F, 54)
    for n in range(2, 50):                                                  # the back page (50) carries no number or footer lockup
        im = pages[n]
        if n >= 3:                                                           # page 2 has its own larger footer
            yc = H - 150                                                     # one shared baseline for both footer logos
            im.paste(footer_lk, (70, yc - footer_lk.height // 2), footer_lk)
            im.paste(footer_rb, (W - 70 - footer_rb.width, yc - footer_rb.height // 2))
        dd = ImageDraw.Draw(im); dd.text((W / 2, H - 70), str(n), font=F.nunito(40, True), fill=(50, 50, 50), anchor="mm")

    import fitz
    pdf = fitz.open()
    for n in range(1, 51):
        buf = io.BytesIO(); (pages[n].convert("RGB") if n in (1, 2, 50) else pages[n].convert("L")).save(buf, "JPEG", quality=(82 if n in (1, 2, 50) else a.dpi_jpeg), optimize=True)
        pg = pdf.new_page(width=612, height=792); pg.insert_image(pg.rect, stream=buf.getvalue())
        (pages[n].convert("RGB") if n in (1, 2, 50) else pages[n].convert("L")).save(os.path.join(a.out, f"p{n:02d}.png"))
    pdf.set_metadata({"title": f"{VENUE} Animal Coloring & Activity Book (example)", "author": "Wild Atlas"})
    out = os.path.join(a.out, "riverbend-coloring-activity-book.pdf"); pdf.save(out, deflate=True, garbage=3)
    print("wrote", out, os.path.getsize(out) // 1024, "KB", len(pdf), "pages")

if __name__ == "__main__":
    main()
