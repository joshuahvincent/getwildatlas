#!/usr/bin/env python3
"""
"Pick Our Animals!" class vote booklet for the FICTIONAL Pebble Brook Elementary, Room 4 (Wild Atlas schools example).

12 US Letter pages: color cover, note to grown-ups, 6 picture vote pages (48 animals, tick your favorites), a write-in page,
a teacher tally sheet, an example "class pack" (the 18 winners), and a color back page. Uses the app repo's finished animal
art (no new animal art) and the helpers from the Riverbend booklet builder. No student names or accounts are asked for.

  python3 print-sources/schools-book/build_vote_booklet.py --out /tmp/vote
Env: WA_REPO = app repo checkout (default ~/Documents/Codex Projects/PetPeeper). Needs Pillow, numpy, opencv-python, qrcode, PyMuPDF.
"""
import argparse, io, os, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageOps

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "riverbend-book"))
import build_riverbend_book as bk          # wa_lockup, REPO, Fonts, helpers
import build_flagship_book as bf
import generate_activity_samples as g
from generate_activity_samples import W, H, M, INK, GREY, Fonts, Masters, Data, paste_fit, rbox, text_block, center_text
REPO = bk.REPO

SCHOOL, CLASS = "Pebble Brook Elementary", "Room 4"
GREEN = (31, 74, 55)
CODE = "PEBBLEBROOK"
REDEEM = f"https://apps.apple.com/redeem?ctx=offercodes&id=6761081031&code={CODE}"

# 48 popular animals (flagship-book research), rottweiler swapped for a beagle; grouped so neighbours look different.
ANIMALS = ["lion", "panda", "dolphin", "golden_retriever", "tyrannosaurus_rex", "emperor_penguin", "giraffe", "maine_coon",
           "african_elephant", "polar_bear", "sea_turtle", "horse", "triceratops", "red_panda", "koala", "rabbit",
           "amur_tiger", "hedgehog", "orca", "pig", "snowy_owl", "capybara", "gorilla", "border_collie",
           "zebra", "sea_otter", "cow", "stegosaurus", "arctic_wolf", "ragdoll", "hippopotamus", "parrot",
           "leopard", "guinea_pig", "blue_whale", "duck", "bald_eagle", "axolotl", "grizzly_bear", "beagle",
           "velociraptor", "red_fox", "crocodile", "persian", "labrador_retriever", "german_shepherd", "british_shorthair", "great_white_shark"]
assert len(ANIMALS) == 48 and len(set(ANIMALS)) == 48
EXAMPLE_WINNERS = ["lion", "panda", "dolphin", "golden_retriever", "tyrannosaurus_rex", "emperor_penguin", "giraffe", "maine_coon", "african_elephant",
                   "polar_bear", "sea_turtle", "horse", "triceratops", "red_panda", "koala", "rabbit", "amur_tiger", "hedgehog"]

def logo_color():
    im = Image.open(HERE / "school-logo.png").convert("RGB")
    return im.crop(ImageOps.invert(im.convert("L")).point(lambda v: 255 if v > 12 else 0).getbbox())

def logo_bw(height):
    im = Image.open(HERE / "school-logo-bw.png").convert("L"); im = im.crop(ImageOps.invert(im).getbbox())
    return im.resize((int(im.width * height / im.height), height), Image.LANCZOS).convert("RGB")

def emblem(px):
    im = Image.open(HERE / "school-emblem.png").convert("RGBA"); return im.resize((px, px), Image.LANCZOS)

def page(F, header, instruction, ico="circle"):
    return bf.page(F, header, instruction, "", "", None, ico)

def footer(img, F, n, lk, rb):
    yc = H - 150
    img.paste(lk, (70, yc - lk.height // 2), lk); img.paste(rb, (W - 70 - rb.width, yc - rb.height // 2))
    ImageDraw.Draw(img).text((W / 2, H - 70), str(n), font=F.nunito(40, True), fill=(50, 50, 50), anchor="mm")

def qr_img(px, data):
    import qrcode
    q = qrcode.QRCode(border=2, box_size=10); q.add_data(data); q.make(fit=True)
    return q.make_image(fill_color="black", back_color="white").convert("RGB").resize((px, px), Image.NEAREST)

# ---------------------------------------------------------------- cover and back (color)
def sky_hills(top=(162, 210, 255), bottom=(222, 240, 255)):
    ys = np.linspace(0, 1, H)[:, None, None]
    grad = (np.array(top)[None, None, :] * (1 - ys) + np.array(bottom)[None, None, :] * ys)
    img = Image.fromarray(np.repeat(grad, W, 1).astype("uint8")); d = ImageDraw.Draw(img)
    d.ellipse([1180, 90, 1560, 470], fill=bf.BRAND["sun"])
    for cx, cy, sc in ((200, 1180, .8), (1480, 1080, .9)):
        for dx, dy, r in ((-90, 14, 66), (0, -16, 86), (92, 14, 62)):
            d.ellipse([cx + (dx - r) * sc, cy + (dy - r) * sc, cx + (dx + r) * sc, cy + (dy + r) * sc], fill="white")
    hill = Image.new("L", (W, H), 0); hd = ImageDraw.Draw(hill)
    hd.ellipse([-600, 1560, 1250, 2700], fill=255); hd.ellipse([500, 1500, 2300, 2750], fill=255)
    img.paste(Image.new("RGB", (W, H), bf.BRAND["mint"]), (0, 0), hill)
    h2 = Image.new("L", (W, H), 0); ImageDraw.Draw(h2).ellipse([-400, 1850, 2100, 3100], fill=255)
    img.paste(Image.new("RGB", (W, H), bf.BRAND["mint_l"]), (0, 0), h2)
    return img

def sticker_row(img, masters, items):
    for k, cx, cy, h, flip in items:
        st = bf.sticker(masters, k, h, outline=14, flip=flip)
        img.paste(st, (int(cx - st.width / 2), int(cy - st.height / 2)), st)

def cover(F, masters):
    img = sky_hills(); d = ImageDraw.Draw(img)
    pw = 1360; lg = logo_color(); lgr = lg.resize((pw - 140, int(lg.height * (pw - 140) / lg.width)), Image.LANCZOS)
    ph = lgr.height + 100; px = (W - pw) // 2; py = 130
    d.rounded_rectangle([px, py, px + pw, py + ph], radius=60, fill="white"); img.paste(lgr, (px + 70, py + 50))
    y = py + ph + 130
    d.text((W / 2, y), "Pick Our", font=F.fredoka(190, 700), fill=bf.BRAND["bark"], anchor="mm", stroke_width=10, stroke_fill="white")
    d.text((W / 2, y + 190), "Animals!", font=F.fredoka(190, 700), fill=bf.BRAND["peach"], anchor="mm", stroke_width=10, stroke_fill="white")
    sub = f"{CLASS}'s class pack vote"; f = F.nunito(56, True); sw_ = d.textlength(sub, font=f); yy = y + 400
    d.rounded_rectangle([(W - sw_) / 2 - 44, yy - 48, (W + sw_) / 2 + 44, yy + 48], radius=48, fill="white"); d.text((W / 2, yy), sub, font=f, fill=bf.BRAND["bark"], anchor="mm")
    pill = F.fredoka(46, 650); pt = "Pre-K to Grade 1"; pw2 = d.textlength(pt, font=pill)
    d.rounded_rectangle([(W - pw2) / 2 - 44, yy + 76, (W + pw2) / 2 + 44, yy + 160], radius=42, fill=bf.BRAND["sun"]); d.text((W / 2, yy + 118), pt, font=pill, fill=bf.BRAND["bark"], anchor="mm")
    sticker_row(img, masters, [("lion", 290, 1760, 460, False), ("giraffe", 760, 1640, 700, False), ("panda", 1180, 1800, 460, False), ("red_panda", 1540, 1840, 320, True),
                               ("african_elephant", 480, 1990, 400, False), ("golden_retriever", 150, 2010, 330, False), ("koala", 950, 2010, 330, True),
                               ("emperor_penguin", 1230, 2000, 270, True)])
    lk = bk.wa_lockup(F, 84); tw, th = lk.width + 70, lk.height + 40; tx0, ty0 = W - 60 - tw, H - 40 - th
    d.rounded_rectangle([tx0, ty0, tx0 + tw, ty0 + th], radius=36, fill="white"); img.paste(lk, (tx0 + 35, ty0 + 20), lk)
    ft = "Example booklet. Pebble Brook Elementary is a fictional school."; ff = F.nunito(28, True); fw = d.textlength(ft, font=ff)
    d.rounded_rectangle([60, H - 86, 60 + fw + 60, H - 30], radius=28, fill=GREEN); d.text((90, H - 58), ft, font=ff, fill="white", anchor="lm")
    return img

def back(F):
    img = sky_hills((162, 210, 255), (168, 230, 207)); d = ImageDraw.Draw(img)
    pw, ph = 1360, 1120; px, py = (W - pw) // 2, 260
    d.rounded_rectangle([px, py, px + pw, py + ph], radius=70, fill="white")
    em = emblem(210); img.paste(em, (W // 2 - 105, py + 50), em)
    d.text((W / 2, py + 330), "Your class pack, free.", font=F.fredoka(96, 700), fill=bf.BRAND["bark"], anchor="mm")
    steps = ["1  Count the ticks. Send us your top 18 animals.", "2  We build the pack and send it back to you.", "3  Share the free code with your families."]
    y = py + 440
    for s_ in steps:
        d.text((px + 150, y), s_, font=F.nunito(44, True), fill=bf.BRAND["bark"]); y += 78
    qs = 330; img.paste(qr_img(qs, REDEEM), (px + 150, py + 700))
    d.text((px + 150 + qs + 70, py + 740), "Scan with a grown-up", font=F.fredoka(56, 700), fill=bf.BRAND["bark"])
    f2 = F.fredoka(78, 700); tw_ = d.textlength(CODE, font=f2)
    d.rounded_rectangle([px + 150 + qs + 70, py + 830, px + 150 + qs + 70 + tw_ + 70, py + 950], radius=60, outline=bf.BRAND["bark"], width=6)
    d.text((px + 150 + qs + 70 + 35 + tw_ / 2, py + 890), CODE, font=f2, fill=bf.BRAND["bark"], anchor="mm")
    bk.text_block(d, (px + 150 + qs + 70, py + 975), "Or open the App Store, tap your picture and choose Redeem Gift Card or Code.", F.nunito(32), pw - 150 - qs - 70 - 100, fill=(60, 60, 60))
    lk = bk.wa_lockup(F, 110); tw, th = lk.width + 110, lk.height + 70; tx, ty = (W - tw) // 2, py + ph + 70
    d.rounded_rectangle([tx, ty, tx + tw, ty + th], radius=48, fill="white"); img.paste(lk, (tx + 55, ty + 35), lk)
    d.text((W / 2, ty + th + 60), "We never ask for student names or accounts.", font=F.nunito(38, True), fill=GREEN, anchor="mm")
    d.text((W / 2, ty + th + 120), f"Example booklet. {SCHOOL} and the code {CODE} are fictional. The QR code unlocks nothing.", font=F.nunito(28), fill=GREEN, anchor="mm")
    return img

# ---------------------------------------------------------------- inner pages
def grownups(F):
    p = page(F, "Hello, Grown-Ups!", "", None); d = p.d; y = p.y + 10; bw = W - 2 * M - 40
    blocks = [("How the vote works", "Each child ticks their 6 favorite animals in this booklet, with a grown-up reading the animal names aloud. "
                                      "The teacher counts the ticks on the tally sheet. The 18 animals with the most ticks become your class pack."),
              ("Not here? Write it in.", "Use the write-in page for any animal that isn't in the booklet. The class pack uses animals that are in Wild Atlas. "
                                         "If a favorite isn't in Wild Atlas yet, we'll tell you."),
              ("Please keep it anonymous", "Don't write your child's name on this booklet. We never ask for student names or accounts. "
                                           "The only thing we need from your class is the final list of 18 animals."),
              ("Then what?", "We build a Wild Atlas pack of those 18 animals, just for your class, and send it back for your OK. "
                             "Families get a free code to unlock it in the Wild Atlas app, a narrated, ad-free animal encyclopedia for kids.")]
    for h, t in blocks:
        d.text((M + 20, y), h, font=F.fredoka(54, 650), fill=GREEN); y += 78
        y = text_block(d, (M + 20, y), t, F.nunito(40), bw, spacing=1.3) + 52
    y += 10
    d.rounded_rectangle([M + 20, y, W - M - 20, y + 270], radius=34, outline=GREEN, width=6)
    lg = logo_color(); lgr = lg.resize((520, int(lg.height * 520 / lg.width)), Image.LANCZOS); p.img.paste(lgr, (M + 60, y + (270 - lgr.height) // 2))
    x = M + 640
    for i, ln in enumerate((f"{SCHOOL}, {CLASS}", "200 Brookside Lane, Pebble Brook", "Phone: (555) 010-0188", "Email: room4@pebblebrook.example")):
        d.text((x, y + 40 + i * 52), ln, font=F.fredoka(46, 700) if i == 0 else F.nunito(34, True), fill=GREEN if i == 0 else (40, 40, 40))
    return p.img

def vote_page(F, A, D, ks, n_page):
    p = page(F, "Pick Your Favorites", "Tick the animals you love! Pick 6 favorites in the whole book.", "circle"); d = p.d
    top = p.y + 20; bottom = p.body_bottom + 110; cols, rows = 2, 4; gap = 26
    cw = (W - 2 * M - gap) / cols; ch = (bottom - top - gap * (rows - 1)) / rows
    for i, k in enumerate(ks):
        c, r = i % cols, i // cols; x0 = M + c * (cw + gap); y0 = top + r * (ch + gap)
        rbox(d, [x0, y0, x0 + cw, y0 + ch], r=34, width=5)
        paste_fit(p.img, A.lineart(k, 3), (x0 + 24, y0 + 18, x0 + cw - 190, y0 + ch - 82))
        d.text((x0 + 36, y0 + ch - 44), D.name(k), font=F.nunito(40, True), fill=INK, anchor="lm")
        cx, cy = x0 + cw - 92, y0 + ch / 2; d.ellipse([cx - 52, cy - 52, cx + 52, cy + 52], outline=INK, width=9)
    return p.img

def write_in(F):
    p = page(F, "Not Here? Add Your Own!", "Draw your animal. Then a grown-up writes its name on the line.", "draw"); d = p.d
    rbox(d, [M, p.y + 30, W - M, p.y + 1050], r=44, width=7, dash=True)
    center_text(d, p.y + 1110, "My animal is called:", F.fredoka(60, 600))
    d.line([(M + 120, p.y + 1290), (W - M - 120, p.y + 1290)], fill=INK, width=6)
    bk.text_block(d, (M + 60, p.y + 1350), "Please don't write names of children or families on this page. Write only the animal. "
                  "The class pack uses animals that are in Wild Atlas, and we'll tell you if a favorite isn't there yet.", F.nunito(34), W - 2 * M - 120, fill=(90, 90, 90), align="center")
    return p.img

def tally(F, A, D):
    p = page(F, "Teacher Tally Sheet", "Count the ticks for each animal. The 18 with the most ticks become the class pack.", None); d = p.d
    top = p.y + 30; bottom = H - 250; per = 24; rh = (bottom - top - 50) / per; colw = (W - 2 * M - 30) / 2
    for c in range(2):
        x0 = M + c * (colw + 30)
        d.text((x0 + 20, top), "Animal", font=F.nunito(30, True), fill=GREY); d.text((x0 + colw - 330, top), "Tally", font=F.nunito(30, True), fill=GREY); d.text((x0 + colw - 90, top), "Total", font=F.nunito(30, True), fill=GREY, anchor="ra")
        for r in range(per):
            k = ANIMALS[c * per + r]; y0 = top + 50 + r * rh
            d.line([(x0, y0 + rh), (x0 + colw, y0 + rh)], fill=(215, 215, 215), width=2)
            paste_fit(p.img, A.lineart(k, 2), (x0 + 6, y0 + 4, x0 + 82, y0 + rh - 4))
            d.text((x0 + 98, y0 + rh / 2), D.name(k), font=F.nunito(28, True), fill=INK, anchor="lm")
            d.rectangle([x0 + colw - 340, y0 + 8, x0 + colw - 120, y0 + rh - 8], outline=INK, width=3)
            d.rectangle([x0 + colw - 108, y0 + 8, x0 + colw - 8, y0 + rh - 8], outline=INK, width=3)
    return p.img

def example_pack(F, masters):
    img = Image.new("RGB", (W, H), bf.BRAND["cream"]); d = ImageDraw.Draw(img)
    em = emblem(150); img.paste(em, (M, 70), em)
    d.text((M + 190, 112), f"{CLASS}'s Pack", font=F.fredoka(110, 700), fill=bf.BRAND["bark"], anchor="lm")
    d.text((M + 190, 200), "18 animals, picked by the class", font=F.nunito(44, True), fill=bf.BRAND["bark"], anchor="lm")
    d.rounded_rectangle([W - M - 420, 78, W - M, 150], radius=36, fill=bf.BRAND["sun"]); d.text((W - M - 210, 114), "EXAMPLE", font=F.fredoka(42, 700), fill=bf.BRAND["bark"], anchor="mm")
    cols, rows = 3, 6; gap = 24; top = 280; bottom = H - 300
    cw = (W - 2 * M - gap * (cols - 1)) / cols; ch = (bottom - top - gap * (rows - 1)) / rows
    for i, k in enumerate(EXAMPLE_WINNERS):
        c, r = i % cols, i // cols; x0 = M + c * (cw + gap); y0 = top + r * (ch + gap)
        d.rounded_rectangle([x0, y0, x0 + cw, y0 + ch], radius=30, fill="white", outline=bf.BRAND["bark"], width=5)
        m = Image.open(os.path.join(masters, k + ".png")).convert("RGBA"); m = m.crop(m.getbbox()); s = min((cw - 50) / m.width, (ch - 92) / m.height); m = m.resize((int(m.width * s), int(m.height * s)), Image.LANCZOS)
        img.paste(m, (int(x0 + (cw - m.width) / 2), int(y0 + 14 + (ch - 92 - m.height) / 2)), m)
        d.text((x0 + cw / 2, y0 + ch - 36), D_NAME(k), font=F.nunito(30, True), fill=bf.BRAND["bark"], anchor="mm")
    d.text((W / 2, H - 215), "This is the kind of pack your class gets. Yours will hold the 18 animals your class picks.", font=F.nunito(34, True), fill=bf.BRAND["bark"], anchor="mm")
    return img

D_NAME = None

def main():
    global D_NAME
    ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
    R = lambda *q: os.path.join(REPO, *q)
    F = Fonts(R("Website", "fonts")); masters = R("GeneratedStyleAssetsMaster", "animals")
    D = Data(R("WildAtlas", "Data", "wild_atlas_catalog.json"), R("WildAtlas", "Data", "wild_atlas_strings.en.json")); A = Masters(masters)
    D_NAME = D.name
    for k in ANIMALS + EXAMPLE_WINNERS:
        assert k in D.A, k; assert os.path.exists(os.path.join(masters, k + ".png")), k
    pages = {1: cover(F, masters), 2: grownups(F)}
    for i in range(6): pages[3 + i] = vote_page(F, A, D, ANIMALS[i * 8:(i + 1) * 8], i + 1)
    pages[9] = write_in(F); pages[10] = tally(F, A, D); pages[11] = example_pack(F, masters); pages[12] = back(F)
    lk = bk.wa_lockup(F, 54); rb = logo_bw(64)
    for n in range(2, 12):
        if n == 11: continue                                   # the example pack page is full-bleed color
        footer(pages[n], F, n, lk, rb)
    import fitz
    pdf = fitz.open()
    for n in range(1, 13):
        buf = io.BytesIO(); color = n in (1, 11, 12)
        (pages[n].convert("RGB") if color else pages[n].convert("L")).save(buf, "JPEG", quality=84 if color else 74, optimize=True)
        pg = pdf.new_page(width=612, height=792); pg.insert_image(pg.rect, stream=buf.getvalue())
        (pages[n].convert("RGB") if color else pages[n].convert("L")).save(os.path.join(a.out, f"p{n:02d}.png"))
    pdf.set_metadata({"title": f"{CLASS} Pick Our Animals vote booklet (example)", "author": "Wild Atlas"})
    out = os.path.join(a.out, "pick-our-animals-vote-booklet.pdf"); pdf.save(out, deflate=True, garbage=3)
    print("wrote", out, os.path.getsize(out) // 1024, "KB", len(pdf), "pages")

if __name__ == "__main__":
    main()
