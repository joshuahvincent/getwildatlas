#!/usr/bin/env python3
"""Riverbend Aquarium: a FICTIONAL venue logo for the Wild Atlas partner-page example book.
Octopus emblem in a circle plus a stacked wordmark, drawn as a vector so it can be reused at any size.
Writes riverbend-logo.svg (color), riverbend-logo-bw.svg (1-color, for the black-ink interior), riverbend-emblem.svg.
Not modelled on any real venue's mark."""
import math, sys

def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return (u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
            u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1])

def tentacle(pts, w0, w1, n=48):
    """Tapered filled shape along a cubic bezier given 4 control points."""
    left, right = [], []
    for i in range(n + 1):
        t = i / n
        x, y = bez(*pts, t)
        x2, y2 = bez(*pts, min(1, t + .01)); x1, y1 = bez(*pts, max(0, t - .01))
        dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        w = (w0 + (w1 - w0) * t ** .8) / 2
        left.append((x + nx * w, y + ny * w)); right.append((x - nx * w, y - ny * w))
    poly = left + right[::-1]
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in poly) + "Z"

def emblem(fg, bg, ring, wave, cx=200, cy=200, R=190):
    # tentacles: each is 4 bezier points, tip curls out; drawn behind the head
    T = [
        ((cx-30, cy+30), (cx-95, cy+90), (cx-130, cy+60), (cx-148, cy+118)),
        ((cx-12, cy+40), (cx-55, cy+120), (cx-98, cy+132), (cx-92, cy+160)),
        ((cx+6, cy+44), (cx-12, cy+130), (cx-22, cy+150), (cx-8, cy+168)),
        ((cx+24, cy+44), (cx+30, cy+128), (cx+52, cy+150), (cx+40, cy+170)),
        ((cx+38, cy+36), (cx+84, cy+112), (cx+110, cy+128), (cx+104, cy+158)),
        ((cx+52, cy+28), (cx+112, cy+84), (cx+142, cy+66), (cx+152, cy+112)),
    ]
    tent = "".join(f'<path d="{tentacle(p, 30, 7)}" fill="{fg}"/>' for p in T)
    head = (f'<path d="M{cx-78},{cy+32} C{cx-96},{cy-62} {cx-40},{cy-118} {cx+8},{cy-118} '
            f'C{cx+64},{cy-118} {cx+104},{cy-64} {cx+78},{cy+32} C{cx+40},{cy+52} {cx-40},{cy+52} {cx-78},{cy+32}Z" fill="{fg}"/>')
    eyes = (f'<ellipse cx="{cx-28}" cy="{cy-8}" rx="15" ry="19" fill="{bg}"/><ellipse cx="{cx+34}" cy="{cy-8}" rx="15" ry="19" fill="{bg}"/>'
            f'<circle cx="{cx-25}" cy="{cy-4}" r="8" fill="{fg}"/><circle cx="{cx+37}" cy="{cy-4}" r="8" fill="{fg}"/>')
    # waves along the lower rim, clipped to the circle
    waves = ""
    for k, yy in enumerate((cy + 128, cy + 150)):
        d = f"M{cx-R},{yy} " + " ".join(f"q{R/4},{-16 if i%2==0 else 16} {R/2},0" for i in range(4))
        waves += f'<path d="{d}" fill="none" stroke="{wave}" stroke-width="7" stroke-linecap="round" opacity="{1 if k==0 else .6}"/>'
    return (f'<defs><clipPath id="c"><circle cx="{cx}" cy="{cy}" r="{R-14}"/></clipPath></defs>'
            f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="{bg}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{R-9}" fill="none" stroke="{ring}" stroke-width="5"/>'
            f'<g clip-path="url(#c)">{waves}{tent}{head}{eyes}</g>')

def lockup(c, fonts="'Avenir Next','Avenir','Optima','Helvetica Neue',Arial,sans-serif"):
    w = 1180
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} 400" width="{w}" height="400">'
            f'<rect width="{w}" height="400" fill="{c["paper"]}"/>'
            + emblem(c["fg"], c["bg"], c["ring"], c["wave"]) +
            f'<text x="430" y="196" font-family="{fonts}" font-weight="700" font-size="112" letter-spacing="9" fill="{c["text"]}">RIVERBEND</text>'
            f'<rect x="436" y="226" width="640" height="5" fill="{c["accent"]}"/>'
            f'<text x="432" y="306" font-family="{fonts}" font-weight="500" font-size="78" letter-spacing="30" fill="{c["text"]}">AQUARIUM</text>'
            '</svg>')

COLOR = dict(paper="#ffffff", fg="#F4F1E8", bg="#0E4A6B", ring="#7FC4C9", wave="#2E8FA3", text="#0E3A55", accent="#2E9CA6")
BW = dict(paper="#ffffff", fg="#ffffff", bg="#000000", ring="#ffffff", wave="#ffffff", text="#000000", accent="#000000")
if __name__ == "__main__":
    open("riverbend-logo.svg", "w").write(lockup(COLOR))
    open("riverbend-logo-bw.svg", "w").write(lockup(BW))
    open("riverbend-emblem.svg", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">' + emblem(**{k: COLOR[k] for k in ("fg","bg","ring","wave")}) + '</svg>')
    print("ok")
