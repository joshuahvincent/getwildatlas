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
    pages[1] = title_page(F, logo_color); pages[2] = grownups_page(F, logo_small); pages[3] = bf.belongs_page(F, logo_small)
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
    for n in range(2, 48): bf.number(pages[n], n, F)

    import fitz
    pdf = fitz.open()
    for n in range(1, 49):
        buf = io.BytesIO(); pages[n].convert("L").save(buf, "JPEG", quality=a.dpi_jpeg, optimize=True)
        pg = pdf.new_page(width=612, height=792); pg.insert_image(pg.rect, stream=buf.getvalue())
        pages[n].convert("L").save(os.path.join(a.out, f"p{n:02d}.png"))
    pdf.set_metadata({"title": f"{VENUE} Animal Coloring & Activity Book (example)", "author": "Wild Atlas"})
    out = os.path.join(a.out, "riverbend-coloring-activity-book.pdf"); pdf.save(out, deflate=True, garbage=3)
    print("wrote", out, os.path.getsize(out) // 1024, "KB", len(pdf), "pages")

if __name__ == "__main__":
    main()
