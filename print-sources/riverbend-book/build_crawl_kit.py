#!/usr/bin/env python3
"""Crawl-tier example kit for the fictional Riverbend Aquarium: exit poster (11x17), exit-desk card (3.5x5), member-email snippet.
Writes assets/downloads/riverbend-crawl-kit.pdf (3 pages) and assets/downloads/riverbend-member-email-snippet.html, plus preview PNGs
in assets/partners/. The QR encodes Apple's standard offer-code redemption link with the FICTIONAL code RIVERBEND (unredeemable).
Run from anywhere: python3 print-sources/riverbend-book/build_crawl_kit.py"""
import base64, io, os, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import numpy as np, qrcode
HERE = Path(__file__).parent; SITE = HERE.parent.parent
sys.path.insert(0, str(HERE)); import build_riverbend_book as bk
from build_riverbend_book import Fonts, NAVY, wa_lockup, REPO
F = Fonts(os.path.join(REPO, "Website", "fonts"))
REDEEM = "https://apps.apple.com/redeem?ctx=offercodes&id=6761081031&code=RIVERBEND"
CODE = "RIVERBEND"
COVER = HERE / "candidates" / "cover-full.jpg"

def logo_color():
    im = Image.open(HERE / "riverbend-logo.png").convert("RGB")
    return im.crop(ImageOps.invert(im.convert("L")).point(lambda v: 255 if v > 12 else 0).getbbox())

def qr_img(px):
    q = qrcode.QRCode(border=2, box_size=10); q.add_data(REDEEM); q.make(fit=True)
    return q.make_image(fill_color="black", back_color="white").convert("RGB").resize((px, px), Image.NEAREST)

def water(w, h):
    """Water-and-animals scene filling w x h, from the cover art (cropped to fit, water extended up if needed)."""
    src = Image.open(COVER).convert("RGB")
    s = max(w / src.width, h / src.height); im = src.resize((int(src.width * s), int(src.height * s)), Image.LANCZOS)
    x0 = (im.width - w) // 2; y0 = im.height - h if im.height >= h else 0
    if im.height >= h: return im.crop((x0, y0, x0 + w, y0 + h))
    top = np.array(im.crop((0, 0, im.width, 40))).reshape(-1, 3).mean(0); canvas = Image.new("RGB", (w, h), tuple(int(v) for v in top))
    canvas.paste(im.crop((x0, 0, x0 + w, im.height)), (0, h - im.height)); return canvas

def tag(img, d, xy_right_bottom, height):
    lk = wa_lockup(F, height); tw, th = lk.width + 70, lk.height + 40
    x1, y1 = xy_right_bottom; d.rounded_rectangle([x1 - tw, y1 - th, x1, y1], radius=36, fill="white"); img.paste(lk, (x1 - tw + 35, y1 - th + 20), lk)

def poster():
    W, H = 1650, 2550
    img = water(W, H); d = ImageDraw.Draw(img)
    lg = logo_color(); pw = 1150; lgr = lg.resize((pw - 140, int(lg.height * (pw - 140) / lg.width)), Image.LANCZOS)
    ph = lgr.height + 110; px = (W - pw) // 2; py = 110
    d.rounded_rectangle([px, py, px + pw, py + ph], radius=70, fill="white"); img.paste(lgr, (px + 70, py + 55))
    y = py + ph + 110
    for i, ln in enumerate(("Keep exploring", "on the way home.")):
        d.text((W / 2, y + i * 170), ln, font=F.fredoka(158, 700), fill=NAVY, anchor="mm", stroke_width=9, stroke_fill="white")
    sub = "A free animal pack, from us to you."; f = F.nunito(62, True); sw = d.textlength(sub, font=f); yy = y + 430
    d.rounded_rectangle([(W - sw) / 2 - 50, yy - 52, (W + sw) / 2 + 50, yy + 52], radius=52, fill="white"); d.text((W / 2, yy), sub, font=f, fill=NAVY, anchor="mm")
    cy0, ch = yy + 130, 520; cx0, cx1 = 150, W - 150
    d.rounded_rectangle([cx0, cy0, cx1, cy0 + ch], radius=60, fill="white")
    q = qr_img(400); img.paste(q, (cx0 + 60, cy0 + 60))
    tx = cx0 + 520
    d.text((tx, cy0 + 70), "Scan with a grown-up", font=F.fredoka(66, 700), fill=NAVY)
    f2 = F.fredoka(96, 700); tw = d.textlength(CODE, font=f2)
    d.rounded_rectangle([tx, cy0 + 170, tx + tw + 80, cy0 + 300], radius=65, outline=NAVY, width=7); d.text((tx + 40 + tw / 2, cy0 + 235), CODE, font=f2, fill=NAVY, anchor="mm")
    bk.text_block(d, (tx, cy0 + 330), "Or open the App Store, tap your picture, tap “Redeem Gift Card or Code” and type the code.", F.nunito(38, True), cx1 - tx - 40, fill=(60, 60, 60), spacing=1.25)
    tag(img, d, (W - 60, H - 50), 100)
    ft = "Example kit. Riverbend Aquarium and the code are fictional."; ff = F.nunito(32, True); fw = d.textlength(ft, font=ff)
    d.rounded_rectangle([60, H - 112, 60 + fw + 60, H - 50], radius=31, fill=NAVY); d.text((90, H - 81), ft, font=ff, fill="white", anchor="lm")
    return img

def card():
    W, H = 1050, 1500
    img = water(W, H); d = ImageDraw.Draw(img)
    lg = logo_color(); pw = 800; lgr = lg.resize((pw - 100, int(lg.height * (pw - 100) / lg.width)), Image.LANCZOS)
    ph = lgr.height + 70; px = (W - pw) // 2; py = 60
    d.rounded_rectangle([px, py, px + pw, py + ph], radius=46, fill="white"); img.paste(lgr, (px + 50, py + 35))
    d.text((W / 2, py + ph + 85), "Keep exploring", font=F.fredoka(84, 700), fill=NAVY, anchor="mm", stroke_width=6, stroke_fill="white")
    d.text((W / 2, py + ph + 170), "at home. It's free!", font=F.fredoka(84, 700), fill=NAVY, anchor="mm", stroke_width=6, stroke_fill="white")
    qs = 330; qy = py + ph + 285; d.rounded_rectangle([W / 2 - qs / 2 - 40, qy - 36, W / 2 + qs / 2 + 40, qy + qs + 150], radius=44, fill="white")
    img.paste(qr_img(qs), (int(W / 2 - qs / 2), qy)); f2 = F.fredoka(58, 700); tw = d.textlength(CODE, font=f2)
    d.rounded_rectangle([W / 2 - tw / 2 - 36, qy + qs + 22, W / 2 + tw / 2 + 36, qy + qs + 118], radius=48, outline=NAVY, width=5); d.text((W / 2, qy + qs + 70), CODE, font=f2, fill=NAVY, anchor="mm")
    tag(img, d, (W - 40, H - 36), 70)
    ft = "Example. Fictional venue and code."; ff = F.nunito(24, True); fw = d.textlength(ft, font=ff)
    d.rounded_rectangle([36, H - 84, 36 + fw + 40, H - 36], radius=24, fill=NAVY); d.text((56, H - 60), ft, font=ff, fill="white", anchor="lm")
    return img

def email_html():
    lg = logo_color(); lg.thumbnail((560, 200)); b = io.BytesIO(); lg.save(b, "PNG"); logo64 = base64.b64encode(b.getvalue()).decode()
    banner = water(1200, 420).resize((600, 210), Image.LANCZOS); b = io.BytesIO(); banner.save(b, "JPEG", quality=84); ban64 = base64.b64encode(b.getvalue()).decode()
    return f"""<!-- Riverbend Aquarium member email: drop-in block (600px). Example for a FICTIONAL venue.
     Swap the data: images for hosted URLs before sending. The button uses Apple's standard offer-code link; the code RIVERBEND is fictional. -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Nunito,Arial,sans-serif;color:#0E3A55">
  <tr><td style="padding:0"><img src="data:image/jpeg;base64,{ban64}" width="600" alt="Octopus, jellyfish and a sea turtle under the sunlit water" style="display:block;width:100%;height:auto"></td></tr>
  <tr><td style="padding:24px 32px 8px;text-align:center"><img src="data:image/png;base64,{logo64}" width="260" alt="Riverbend Aquarium" style="display:inline-block;height:auto"></td></tr>
  <tr><td style="padding:8px 32px 0;text-align:center"><h1 style="margin:0;font-family:Fredoka,Arial,sans-serif;font-size:30px;line-height:1.15;color:#0E3A55">Keep exploring at home</h1></td></tr>
  <tr><td style="padding:12px 40px 0;text-align:center;font-size:17px;line-height:1.5;color:#33414d">Thanks for visiting Riverbend Aquarium. Keep the wonder going with Wild Atlas, a safe, ad-free animal app for kids that works offline. Tap below for a free animal pack, on us.</td></tr>
  <tr><td style="padding:22px 32px 8px;text-align:center"><a href="{REDEEM}" style="display:inline-block;background:#FF9E7D;color:#4a2a1f;font-family:Fredoka,Arial,sans-serif;font-weight:700;font-size:20px;text-decoration:none;padding:14px 30px;border-radius:999px">Get your free animal pack</a></td></tr>
  <tr><td style="padding:6px 40px 24px;text-align:center;font-size:13px;line-height:1.5;color:#5c6b75">Works on iPhone and iPad. Or open the App Store, tap your picture, choose “Redeem Gift Card or Code” and enter <b>{CODE}</b>.</td></tr>
  <tr><td style="padding:14px 32px;text-align:center;font-size:12px;color:#7a8791;background:#f1f7f8">Animals and puzzles by Wild Atlas. Example for a fictional venue.</td></tr>
</table>
"""

def main():
    out_pdf = SITE / "assets" / "downloads" / "riverbend-crawl-kit.pdf"; prev = SITE / "assets" / "partners"
    p, c = poster(), card()
    p.save(prev / "crawl-poster.jpg", quality=88); c.save(prev / "crawl-card.jpg", quality=88)
    html = email_html(); (SITE / "assets" / "downloads" / "riverbend-member-email-snippet.html").write_text(html)
    wrap = SITE / "print-sources" / "riverbend-book" / "_email_preview.html"
    wrap.write_text('<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#e9eef0;padding:30px 0;font-family:Nunito}</style></head><body>' + html + '</body></html>')
    ch = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; emp = prev / "crawl-email.png"
    subprocess.run([ch, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2", "--window-size=700,900", f"--screenshot={emp}", f"file://{wrap}"], capture_output=True)
    wrap.unlink()
    import fitz
    doc = fitz.open()
    for im, wpt, hpt in ((p, 792, 1224), (c, 252, 360)):
        buf = io.BytesIO(); im.save(buf, "JPEG", quality=90); pg = doc.new_page(width=wpt, height=hpt); pg.insert_image(pg.rect, stream=buf.getvalue())
    e = Image.open(emp).convert("RGB"); bg = e.getpixel((4, e.height - 4))
    diff = ImageOps.invert(Image.eval(ImageOps.invert(e.convert("L")), lambda v: v)).point(lambda v: 0)  # placeholder (kept simple below)
    arr = np.array(e).astype(int); mask = (np.abs(arr - np.array(bg)).sum(2) > 24); ys, xs = np.where(mask)
    e = e.crop((0, max(ys.min() - 30, 0), e.width, min(ys.max() + 30, e.height)))
    e.save(prev / "crawl-email.png")
    buf = io.BytesIO(); e.save(buf, "JPEG", quality=90); pg = doc.new_page(width=612, height=int(612 * e.height / e.width)); pg.insert_image(pg.rect, stream=buf.getvalue())
    doc.set_metadata({"title": "Riverbend Aquarium Crawl kit (example)", "author": "Wild Atlas"}); doc.save(str(out_pdf), deflate=True, garbage=3)
    print("wrote", out_pdf, out_pdf.stat().st_size // 1024, "KB", len(doc), "pages")

if __name__ == "__main__":
    main()
