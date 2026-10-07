#!/usr/bin/env python3
"""Riverbend concept screens — drawn to Wild Atlas component specs. Writes 3 html files."""
import sys
SCROLL = {"home": 1370, "top": 0, "lower": 1090}   # px scrolled (tuned by render)
if len(sys.argv) > 1:
    SCROLL.update(eval(sys.argv[1]))

BARK = "#5D4037"; SUNNY = "#FFD97D"; MINT = "#A8E6CF"; CREAM = "#FFF8EC"; SKY = "#A2D2FF"
UT = "#2FA7A0"; UTW = "#D5EDEC"
VA = "#1F6A85"            # venue accent (manifest-style pack palette)
VP = "#BFE3F0"; VB = "#EAF6FB"

CSS = f"""
@font-face{{font-family:Fredoka;src:url(Fredoka.ttf);font-weight:300 700}}
@font-face{{font-family:Nunito;src:url(Nunito-Regular.ttf);font-weight:400}}
@font-face{{font-family:Nunito;src:url(Nunito-Bold.ttf);font-weight:600 800}}
*{{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}}
html,body{{width:402px;height:874px;overflow:hidden;background:{CREAM}}}
body{{font-family:Nunito;color:{BARK}}}
.fr{{font-family:Fredoka;font-weight:700}}
#screen{{position:relative;width:402px;height:874px;overflow:hidden}}
#scroll{{position:absolute;left:0;top:0;width:402px}}
.dots{{background-color:{CREAM};background-image:radial-gradient(circle,rgba(93,64,55,.09) 1.6px,transparent 1.7px);background-size:36px 36px;background-position:10px 10px}}
.status{{position:absolute;left:0;top:0;width:402px;height:54px;z-index:50;display:flex;justify-content:space-between;align-items:center;padding:6px 34px 0 46px;font-family:-apple-system,'SF Pro Text',Helvetica,Arial;font-weight:600;font-size:17px;color:#1b1b1b}}
.status .r{{display:flex;gap:6px;align-items:center}}
.island{{position:absolute;left:50%;top:11px;width:124px;height:36px;margin-left:-62px;background:#000;border-radius:20px;z-index:51}}
.home-ind{{position:absolute;left:50%;bottom:8px;width:134px;height:5px;margin-left:-67px;background:rgba(0,0,0,.85);border-radius:3px;z-index:60}}
.pad{{padding:0 16px}}
.tile{{position:relative;height:122px}}
.tile .base{{position:absolute;inset:0;border-radius:10px;transform:translateY(5px)}}
.tile .face{{position:relative;height:100%;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px 10px}}
.tile img.m{{height:68px;width:68px;object-fit:contain}}
.tile .t{{font-family:Fredoka;font-weight:700;font-size:19px;line-height:1.1;margin-top:4px;white-space:nowrap}}
.tile .s{{font-weight:700;font-size:11px;line-height:1.2;text-align:center;margin-top:3px;color:rgba(93,64,55,.92)}}
.tile .lock{{position:absolute;right:9px;top:8px;width:19px;height:24px;object-fit:contain}}
.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:12px 12px}}
.divider{{height:0;border-top:2px dashed rgba(93,64,55,.28);margin:0 16px;border-radius:2px}}
.h-sec{{text-align:center}}
.h-sec .ttl{{font-family:Fredoka;font-weight:700;font-size:27px;line-height:1.15;color:{BARK}}}
.h-sec .sub{{font-weight:700;font-size:14px;color:rgba(93,64,55,.9);margin-top:2px}}
.pill{{display:inline-flex;align-items:center;height:24px;padding:0 11px;border-radius:99px;font-weight:700;font-size:12px;white-space:nowrap}}
"""

def statusbar():
    return """<div class="island"></div><div style="position:absolute;left:0;top:0;width:402px;height:66px;z-index:40;background:linear-gradient(#FFF8EC 62%,rgba(255,248,236,0))"></div><div class="status"><span>9:41</span><span class="r">
<svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3.4" height="4" rx="1" fill="#1b1b1b"/><rect x="5" y="5.5" width="3.4" height="6.5" rx="1" fill="#1b1b1b"/><rect x="10" y="3" width="3.4" height="9" rx="1" fill="#1b1b1b"/><rect x="15" y="0" width="3.4" height="12" rx="1" fill="#1b1b1b"/></svg>
<svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.4c2.3 0 4.4.9 6 2.4l1-1.1C13.6 1.9 11.2.8 8.5.8S3.4 1.9 1.5 3.7l1 1.1c1.6-1.5 3.7-2.4 6-2.4z" fill="#1b1b1b"/><path d="M8.5 6c1.3 0 2.5.5 3.4 1.3l1-1.1C11.7 5.1 10.2 4.5 8.5 4.5S5.300 5.100 4.100 6.200l1 1.100C6 6.500 7.200 6 8.500 6z" fill="#1b1b1b"/><circle cx="8.5" cy="10" r="1.6" fill="#1b1b1b"/></svg>
<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.6" fill="none" stroke="#1b1b1b" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.3" fill="#1b1b1b"/><rect x="24.6" y="4.2" width="1.8" height="4.6" rx=".9" fill="#1b1b1b" opacity=".45"/></svg></span></div>
<div class="home-ind"></div>"""

def page(inner, key, bg_class="dots", extra_css="", bg_style=""):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}{extra_css}</style></head>
<body><div id="screen" class="{bg_class}" style="{bg_style}">{statusbar()}<div id="scroll" style="transform:translateY(-{SCROLL[key]}px)">{inner}</div></div></body></html>"""

# ---------------------------------------------------------------- HOME
PACKS = {  # (bg, primary, accent, image, title, sub)  — AnimalModels.swift:921-1009 spec palettes
 "hound":("#FFF4EA","#F4C8A6","#E26B5D","pk_happy_hounds.png","Happy Hounds","Dogs you might meet!"),
 "cats": ("#FFF6F2","#F5D4C8","#B88ED6","pk_cool_cats.png","Cool Cats","Cats with cool coats!"),
 "cozy": ("#FFF9E6","#F7E6A5","#7CB7B2","pk_cozy_critters.png","Cozy Critters","Small pets and gentle pals"),
 "ocean":("#EAF9FF","#A9E4FF","#3BB4E7","pk_ocean_creatures.png","Ocean Creatures","Life in the big blue"),
 "dino": ("#F5EEFF","#D9C2F3","#9B78C8","pk_dino_roars.png","Dino Roars","Dinosaurs from long ago"),
 "rept": ("#EEFBF2","#A7E0B5","#5BB58A","pk_reptile_world.png","Reptile World","Reptiles with scales and tails"),
 "safa": ("#FFF6D9","#F6D76B","#E79A3B","pk_safari_stars.png","Safari Stars","Wild animals of Africa"),
 "rain": ("#E9F9EC","#7BCB77","#3FAF5A","pk_rainforest_explorers.png","Rainforest Explorers","Life under the leaves"),
}
def ptile(k, locked=False):
    bg, pr, ac, img, t, s = PACKS[k]
    lock = '<img class="lock" src="icon-locked-pack.png">' if locked else ''
    op = ".82" if locked else "1"
    return f"""<div class="tile" style="filter:drop-shadow(0 2px 4px rgba(93,64,55,.08))">
<div class="base" style="background:{ac}85"></div>
<div class="face" style="opacity:{op};background:linear-gradient(135deg,{bg},{pr}db);border:1.2px solid {ac}59">
<img class="m" src="{img}"><div class="t">{t}</div><div class="s">{s}</div></div>{lock}</div>"""

def home():
    # Places card = GameDenCardLayout (GameDenView.swift:643-767): white, r20, accent .08 wash, accent stroke, NEW! capsule top-trailing
    places = f"""
<div class="pad" style="margin-top:26px">
 <div class="h-sec" style="display:flex;flex-direction:column;align-items:center">
  <div style="display:flex;align-items:center;gap:8px"><img src="icon-map-pin.png" style="width:24px;height:33px;object-fit:contain"><span class="ttl fr" style="font-size:27px;line-height:1.15">My Places</span></div>
  <div class="sub" style="font-weight:700;font-size:14px;color:rgba(93,64,55,.9);margin-top:2px">Zoos and aquariums I've visited</div>
 </div>
 <div style="position:relative;margin-top:22px;filter:drop-shadow(0 4px 10px rgba(93,64,55,.12))">
  <div style="position:relative;border-radius:20px;background:linear-gradient(135deg,#FFFFFF,{VB});border:2px solid {VA};padding:16px 16px 16px 16px;display:flex;gap:14px;align-items:center;min-height:128px">
    <div style="width:92px;height:92px;flex:none;border-radius:50%;background:#fff;padding:3px;box-shadow:0 0 0 2px {BARK}"><img src="riverbend-emblem.svg" style="width:100%;height:100%;display:block"></div>
    <div style="flex:1;min-width:0">
      <div class="fr" style="font-size:22px;line-height:1.12">Riverbend Aquarium</div>
      <div style="font-weight:700;font-size:14px;line-height:1.25;margin-top:4px;color:rgba(93,64,55,.92)">Meet the animals that live here</div>
      <div style="display:flex;gap:6px;margin-top:9px">
        <span class="pill" style="background:{VA}1f;color:{VA}">Visited</span>
        <span class="pill" style="background:{VA}1f;color:{VA}">9 animals</span></div>
    </div>
  </div>
  <div style="position:absolute;right:14px;top:-11px;display:flex;align-items:center;gap:4px;height:24px;padding:0 12px;border-radius:99px;background:{SUNNY};border:1.5px solid #fff;box-shadow:0 2px 4px rgba(93,64,55,.18)">
    <svg width="11" height="11" viewBox="0 0 24 24"><path d="M12 2l3 6.6 7.200.8-5.400 4.900 1.500 7.100L12 17.800 5.700 21.400l1.500-7.100L1.800 9.400 9 8.600z" fill="{BARK}"/></svg>
    <span class="fr" style="font-size:12px;letter-spacing:.2px">NEW!</span></div>
 </div>
 <div style="margin-top:12px;height:58px;border-radius:16px;border:2px dashed rgba(93,64,55,.45);background:rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;gap:12px">
   <div style="position:relative;width:26px;height:32px"><img src="icon-map-pin.png" style="width:26px;height:32px;object-fit:contain">
     <svg style="position:absolute;right:-8px;bottom:-3px" width="18" height="18" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="#fff" stroke="{BARK}" stroke-width="2"/><path d="M11 6v10M6 11h10" stroke="{BARK}" stroke-width="2.4" stroke-linecap="round"/></svg></div>
   <div><div class="fr" style="font-size:17px;line-height:1.1">Add a place</div>
   <div style="font-weight:700;font-size:12.5px;margin-top:1px;color:rgba(93,64,55,.92)">Ask a grown-up to help</div></div>
 </div>
</div>"""
    return f"""
<div style="height:{-0}px"></div>
<div style="padding:0 16px"><div class="grid2" style="margin-top:0">{ptile('hound')}{ptile('cats')}</div></div>
<div style="padding:0 16px"><div class="grid2" style="margin-top:16px">{ptile('cozy')}{ptile('ocean')}</div></div>
<div class="divider" style="margin-top:34px"></div>
{places}
<div class="divider" style="margin-top:28px"></div>
<div class="pad h-sec" style="margin-top:30px"><div class="ttl">Explore More Animal Worlds</div><div class="sub">Dinosaurs • Safari • Rainforest • Reptiles</div></div>
<div class="pad grid2" style="margin-top:20px">{ptile('dino',1)}{ptile('rept',1)}{ptile('safa',1)}{ptile('rain',1)}</div>
<div style="height:200px"></div>"""

# ---------------------------------------------------------------- PACK PAGE
ANIMALS = [("octopus","Octopus"),("sea_otter","Sea Otter"),("jellyfish","Jellyfish"),("sea_lion","Sea Lion"),
           ("starfish","Starfish"),("sloth","Sloth"),("poison_dart_frog","Poison Dart Frog"),("axolotl","Axolotl"),("green_anaconda","Green Anaconda")]
PACK_BG = f"background-color:{VB};background-image:radial-gradient(circle,{VA}22 1.8px,transparent 1.9px);background-size:36px 36px;background-position:10px 10px"

def atile(img, name):
    return f"""<div style="position:relative;height:126px;border-radius:24px;background:#fff;border:1px solid rgba(93,64,55,.15);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px 8px">
<img src="{img}.png" style="width:84px;height:76px;object-fit:contain">
<div style="font-weight:700;font-size:12px;line-height:1.1;text-align:center;min-height:13px">{name}</div>
<svg style="position:absolute;right:11px;top:9px" width="12" height="12" viewBox="0 0 12 12"><path d="M1.500 6.500l3 3 6-7" fill="none" stroke="{VA}" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/></svg></div>"""

def topbar():
    return f"""<div style="height:54px"></div>
<div style="position:relative;height:60px;padding:0 16px;display:flex;align-items:center;justify-content:space-between">
 <img src="icon-back.png" style="width:48px;height:46px;object-fit:contain">
 <div style="position:absolute;left:0;right:0;text-align:center;font-weight:700;font-size:19px;pointer-events:none">Riverbend Aquarium</div>
 <img src="icon-treasure.png" style="width:44px;height:44px;object-fit:contain">
</div>"""

def pawcard():
    cells = ""
    for i in range(27):
        v = i < 9
        if v:
            cells += f'<div style="width:28px;height:28px;border-radius:50%;background:{VA};border:1.5px solid rgba(93,64,55,.65);display:flex;align-items:center;justify-content:center"><svg width="13" height="13" viewBox="0 0 12 12"><path d="M1.500 6.500l3 3 6-7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
        else:
            cells += f'<div style="width:28px;height:28px;border-radius:50%;background:#fff;border:1.5px solid rgba(93,64,55,.65);display:flex;align-items:center;justify-content:center">{PAW}</div>'
    return f"""<div style="margin:16px 16px 0;padding:12px 14px 10px;border-radius:24px;background:rgba(255,255,255,.94);border:1px solid rgba(93,64,55,.15)">
<div style="display:grid;grid-template-columns:repeat(9,28px);justify-content:space-between;row-gap:7px">{cells}</div>
<div style="text-align:center;font-weight:700;font-size:13px;margin-top:9px;color:rgba(93,64,55,.9)">Visit every animal in this pack to unlock the slideshow.</div></div>"""
PAW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(93,64,55,.55)"><ellipse cx="6" cy="10" rx="2.600" ry="3.300"/><ellipse cx="11" cy="5.500" rx="2.600" ry="3.300"/><ellipse cx="17" cy="6" rx="2.600" ry="3.300"/><ellipse cx="21" cy="12" rx="2.300" ry="3"/><path d="M12.500 11c-3.300 0-6.500 4.300-6.500 7.200 0 2.200 1.800 3 3.700 2.500 1-.3 1.800-.6 2.800-.6s1.800.3 2.800.6c1.900.5 3.700-.3 3.700-2.500 0-2.900-3.200-7.200-6.500-7.200z"/></svg>'

def pagedots():
    d = ""
    for i in (1,2,3):
        a = i == 1
        d += f'<div class="fr" style="width:46px;height:46px;border-radius:50%;border:3px solid {BARK};background:{SKY if a else "#fff"};display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:600;color:{BARK};transform:scale({1.08 if a else 1})">{i}</div>'
    return f'<div style="display:flex;justify-content:center;gap:16px;margin-top:18px">{d}</div>'

def pack_top():
    tiles = "".join(atile(a, n) for a, n in ANIMALS)
    return f"""{topbar()}
<div style="margin:6px 16px 0;position:relative;border-radius:22px;background:linear-gradient(135deg,{VP},{VB});border:1px solid {VA}33;padding:16px;display:flex;gap:14px;align-items:center">
 <div style="width:122px;height:122px;flex:none;border-radius:50%;background:#fff;padding:4px;box-shadow:0 0 0 2.500px {BARK},0 6px 12px rgba(93,64,55,.14)"><img src="riverbend-emblem.svg" style="width:100%;height:100%;display:block"></div>
 <div style="flex:1;min-width:0">
  <div class="fr" style="font-size:30px;line-height:1.05">Riverbend Aquarium</div>
  <div style="font-weight:700;font-size:14px;line-height:1.28;margin-top:6px">Meet the animals that live at Riverbend, and discover more at home.</div>
  <div style="display:flex;gap:6px;margin-top:10px"><span class="pill" style="background:#fff;color:{BARK};border:1.5px solid {VA}55">27 animals</span><span class="pill" style="background:#fff;color:{BARK};border:1.5px solid {VA}55">9 exhibits</span></div>
 </div></div>
<div class="fr" style="font-size:26px;margin:24px 16px 12px;line-height:1.1">Meet the Animals</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:0 16px">{tiles}</div>
{pagedots()}
{pawcard()}
<div style="height:40px"></div>"""

def fact(num, label):
    return f"""<div style="border-radius:16px;background:#fff;border:2px solid {BARK};box-shadow:0 3px 8px rgba(93,64,55,.1);padding:8px 8px 9px;text-align:center;min-height:78px;display:flex;flex-direction:column;justify-content:flex-start;padding-top:9px">
<div class="fr" style="font-size:38px;line-height:1;color:{BARK}">{num}</div>
<div style="font-weight:700;font-size:13.5px;line-height:1.15;margin-top:3px">{label}</div></div>"""

def pinpill():
    return f"""<div style="margin-top:8px;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px 0 12px;border-radius:99px;background:{MINT};border:2px solid {BARK}">
<img src="icon-map-pin.png" style="width:20px;height:26px;object-fit:contain"><span class="fr" style="font-size:16px;font-weight:600">Find it on the map</span></div>"""

def exhibit(art, name, line):
    return f"""<div style="flex:none;width:262px;border-radius:22px;background:#fff;border:2px solid {BARK};overflow:hidden;box-shadow:0 4px 10px rgba(93,64,55,.12)">
<div style="height:100px;border-bottom:2px solid {BARK};overflow:hidden">{art}</div>
<div style="padding:10px 14px 14px"><div class="fr" style="font-size:19px;line-height:1.1">{name}</div>
<div style="font-weight:700;font-size:13.500px;line-height:1.28;margin-top:5px;color:rgba(93,64,55,.92);min-height:0">{line}</div>{pinpill()}</div></div>"""

def duo(a, b, bgc):
    t = lambda i: f'<div style="flex:1;height:76px;border-radius:10px;background:#fff;border:2px solid {BARK};display:flex;align-items:center;justify-content:center"><img src="{i}.png" style="width:68px;height:68px;object-fit:contain"></div>'
    return f'<div style="height:100%;background:linear-gradient(135deg,#DDF3EC,{VB});display:flex;gap:10px;padding:14px 14px">{t(a)}{t(b)}</div>'
def photo(f): return f'<img src="{f}.jpg" style="width:100%;height:100%;object-fit:cover;display:block">'

def pack_lower():
    ex = "".join([
      exhibit(photo("otterbay"), "Otter &amp; Sea Lion Bay", "Watch the otters float and the sea lions zoom past the glass."),
      exhibit(photo("jellies"), "Jellyfish Hall", "A glowing tank full of moon jellies, drifting like little moons."),
      exhibit(photo("rainforest"), "Rainforest Gallery", "Tiny bright frogs and slow, sleepy sloths."),
      exhibit(photo("touchpool"), "Touch Pool", "Gentle hands only! Meet a sea star up close."),
      exhibit(photo("tunnel"), "Ocean Tunnel", "Walk through the water and look up!"),
    ])
    return f"""<div style="height:54px"></div>
{pawcard().replace('margin:16px 16px 0','margin:0 16px 0')}
<div class="fr" style="font-size:26px;margin:16px 16px 8px;line-height:1.1">About Riverbend</div>
<div style="margin:0 16px 10px;font-weight:700;font-size:13.5px;line-height:1.3;color:rgba(93,64,55,.92)">A river-city aquarium where otters float, jellyfish glow and a giant ocean tank waits. Come meet the animals up close.</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px">
{fact('27','kinds of animals live here')}{fact('9','exhibits to explore')}{fact('1','giant ocean tank')}{fact('365','days a year, open every day')}</div>
<div class="fr" style="font-size:26px;margin:16px 16px 4px;line-height:1.1">Top Exhibits</div>
<div style="display:flex;gap:12px;padding:2px 16px 8px;width:max-content">{ex}</div>
<div style="margin:10px 16px 0;height:64px;border-radius:99px;background:{UTW};border:2px solid {UT};padding:0 20px;display:flex;gap:14px;align-items:center;justify-content:center">
 <img src="icon-locked-pack.png" style="width:26px;height:32px;object-fit:contain;flex:none">
 <div><div class="fr" style="font-size:19px;line-height:1.1">Learn more</div>
 <div style="font-weight:700;font-size:12.5px;line-height:1.2;margin-top:1px">Opens the website after a grown-up check</div></div></div>
<div style="height:260px"></div>"""

open("home.html","w").write(page(home(),"home"))
open("top.html","w").write(page(pack_top(),"top",bg_class="",bg_style=PACK_BG))
open("lower.html","w").write(page(pack_lower(),"lower",bg_class="",bg_style=PACK_BG))
