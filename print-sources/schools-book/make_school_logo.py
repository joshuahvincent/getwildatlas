#!/usr/bin/env python3
"""Pebble Brook Elementary: a FICTIONAL school logo for the Wild Atlas schools example. Emblem (tree over a brook) + stacked wordmark.
Writes school-logo.svg (color), school-logo-bw.svg (1-color) and school-emblem.svg. Not modelled on any real school's mark."""
import math
def emblem(fg, bg, ring, accent, cx=200, cy=200, R=190):
    waves = ""
    for k, yy in enumerate((cy + 105, cy + 135)):
        d = f"M{cx-R},{yy} " + " ".join(f"q{R/4},{-14 if i%2==0 else 14} {R/2},0" for i in range(4))
        waves += f'<path d="{d}" fill="none" stroke="{accent}" stroke-width="9" stroke-linecap="round" opacity="{1 if k==0 else .65}"/>'
    crown = "".join(f'<circle cx="{cx+dx}" cy="{cy+dy}" r="{r}" fill="{fg}"/>' for dx, dy, r in ((0, -70, 64), (-58, -30, 50), (58, -30, 50), (-24, -2, 46), (30, -4, 46)))
    trunk = f'<path d="M{cx-14},{cy+100} L{cx-9},{cy+10} L{cx+9},{cy+10} L{cx+14},{cy+100}Z" fill="{fg}"/>'
    return (f'<defs><clipPath id="c"><circle cx="{cx}" cy="{cy}" r="{R-14}"/></clipPath></defs>'
            f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="{bg}"/><circle cx="{cx}" cy="{cy}" r="{R-9}" fill="none" stroke="{ring}" stroke-width="5"/>'
            f'<g clip-path="url(#c)">{waves}{trunk}{crown}</g>')
def lockup(c, fonts="'Avenir Next','Avenir','Optima','Helvetica Neue',Arial,sans-serif"):
    w = 1420
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} 400" width="{w}" height="400"><rect width="{w}" height="400" fill="{c["paper"]}"/>'
            + emblem(c["fg"], c["bg"], c["ring"], c["accent"]) +
            f'<text x="430" y="170" font-family="{fonts}" font-weight="700" font-size="100" letter-spacing="6" fill="{c["text"]}">PEBBLE BROOK</text>'
            f'<rect x="436" y="204" width="900" height="5" fill="{c["accent"]}"/>'
            f'<text x="432" y="290" font-family="{fonts}" font-weight="500" font-size="76" letter-spacing="22" fill="{c["text"]}">ELEMENTARY</text></svg>')
COLOR = dict(paper="#ffffff", fg="#F4F1E8", bg="#2F6B4F", ring="#A8D5B8", accent="#E0A63A", text="#1F4A37")
BW = dict(paper="#ffffff", fg="#ffffff", bg="#000000", ring="#ffffff", accent="#000000", text="#000000")
if __name__ == "__main__":
    open("school-logo.svg", "w").write(lockup(COLOR)); open("school-logo-bw.svg", "w").write(lockup(BW))
    open("school-emblem.svg", "w").write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">' + emblem(COLOR["fg"], COLOR["bg"], COLOR["ring"], COLOR["accent"]) + '</svg>')
