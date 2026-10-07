import sys, json
sys.argv = [sys.argv[0]]
exec(open("gen.py").read())          # reuse tokens, CSS, ptile, statusbar, page()
# ---- school palette (emblem green #2F6B4F; manifest-style pack palette)
VA = "#2F6B4F"; VP = "#C9E6D3"; VB = "#EAF5EE"
PACK_BG = f"background-color:{VB};background-image:radial-gradient(circle,{VA}22 1.8px,transparent 1.9px);background-size:36px 36px;background-position:10px 10px"
NAMES = {"lion":"Lion","panda":"Panda","dolphin":"Dolphin","golden_retriever":"Golden Retriever","tyrannosaurus_rex":"Tyrannosaurus rex",
 "emperor_penguin":"Emperor Penguin","giraffe":"Giraffe","maine_coon":"Maine Coon","african_elephant":"African Elephant","polar_bear":"Polar Bear",
 "sea_turtle":"Sea Turtle","horse":"Horse","triceratops":"Triceratops","red_panda":"Red Panda","koala":"Koala","rabbit":"Rabbit","amur_tiger":"Amur Tiger","hedgehog":"Hedgehog"}
WIN = list(NAMES)          # EXAMPLE_WINNERS order (build_vote_booklet.py:38-39)
VISITED = {"lion","panda","golden_retriever"}   # synthetic demo state, no child data
NEWSCRIM = ('#FFF8EC 62%,rgba(255,248,236,0)', f'{VB} 62%,rgba(234,245,238,0)')

LONGCSS = CSS.replace("html,body{width:402px;height:874px;overflow:hidden;background:%s}" % CREAM, "html,body{width:402px;background:transparent}")
def longpage(inner, bg_class="dots", bg_style=""):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{LONGCSS}
body{{background:transparent}}#wrap{{width:402px}}</style></head><body><div id="wrap" class="{bg_class}" style="{bg_style}">{inner}</div></body></html>"""
RECTS = """<script>var o={};['rbcard','t3','d1','d2','t1'].forEach(function(i){var e=document.getElementById(i);if(e){var r=e.getBoundingClientRect();o[i]=[r.left,r.top,r.width,r.height]}});document.body.insertAdjacentHTML('beforeend','<pre id=o>'+JSON.stringify(o)+'</pre>')</script>"""

# ---------------------------------------------------------------- Home bottom
def place_card(emb, title, cap, pills, new=False, cid=None, accent=VA, wash=VB):
    idat = f' id="{cid}"' if cid else ''
    pl = "".join(f'<span class="pill" style="background:{accent}1f;color:{accent}">{p}</span>' for p in pills)
    nw = f"""<div style="position:absolute;right:14px;top:-11px;display:flex;align-items:center;gap:4px;height:24px;padding:0 12px;border-radius:99px;background:{SUNNY};border:1.5px solid #fff;box-shadow:0 2px 4px rgba(93,64,55,.18)"><svg width="11" height="11" viewBox="0 0 24 24"><path d="M12 2l3 6.6 7.200.8-5.400 4.900 1.500 7.100L12 17.800 5.700 21.400l1.500-7.100L1.800 9.400 9 8.600z" fill="{BARK}"/></svg><span class="fr" style="font-size:12px;letter-spacing:.2px">NEW!</span></div>""" if new else ""
    return f"""<div style="position:relative;margin-top:18px;filter:drop-shadow(0 4px 10px rgba(93,64,55,.12))">
  <div{idat} style="position:relative;border-radius:20px;background:linear-gradient(135deg,#FFFFFF,{wash});border:2px solid {accent};padding:16px;display:flex;gap:14px;align-items:center;min-height:128px">
    <div style="width:92px;height:92px;flex:none;border-radius:50%;background:#fff;padding:3px;box-shadow:0 0 0 2px {BARK}"><img src="{emb}" style="width:100%;height:100%;display:block"></div>
    <div style="flex:1;min-width:0"><div class="fr" style="font-size:22px;line-height:1.12">{title}</div>
      <div style="font-weight:700;font-size:14px;line-height:1.25;margin-top:4px;color:rgba(93,64,55,.92)">{cap}</div>
      <div style="display:flex;gap:6px;margin-top:9px">{pl}</div></div></div>{nw}</div>"""
def add_tile():
    return f"""<div style="margin-top:14px;height:58px;border-radius:16px;border:2px dashed rgba(93,64,55,.45);background:rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;gap:12px">
   <div style="position:relative;width:26px;height:32px"><img src="icon-map-pin.png" style="width:26px;height:32px;object-fit:contain">
     <svg style="position:absolute;right:-8px;bottom:-3px" width="18" height="18" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="#fff" stroke="{BARK}" stroke-width="2"/><path d="M11 6v10M6 11h10" stroke="{BARK}" stroke-width="2.4" stroke-linecap="round"/></svg></div>
   <div><div class="fr" style="font-size:17px;line-height:1.1">Add a place</div><div style="font-weight:700;font-size:12.5px;margin-top:1px;color:rgba(93,64,55,.92)">Ask a grown-up to help</div></div></div>"""
def home_bottom_html():
    sec = f"""<div class="pad" style="margin-top:26px"><div class="h-sec" style="display:flex;flex-direction:column;align-items:center">
  <div style="display:flex;align-items:center;gap:8px"><img src="icon-map-pin.png" style="width:24px;height:33px;object-fit:contain"><span class="fr" style="font-size:27px;line-height:1.15">My Places</span></div>
  <div style="font-weight:700;font-size:14px;color:rgba(93,64,55,.9);margin-top:2px">Zoos, aquariums and schools</div></div>
  {place_card("riverbend-emblem.svg","Riverbend Aquarium","Meet the animals that live here",["Visited","9 animals"],accent="#1F6A85",wash="#EAF6FB")}
  {place_card("school-emblem.svg","Pebble Brook's Pack","The 18 animals our school picked",["Our school","18 animals"],new=True,cid="rbcard")}
  {add_tile()}</div>"""
    cta = f'<div style="margin:22px 16px 0;height:50px;border-radius:14px;background:#FF9E7D;display:flex;align-items:center;justify-content:center;font-family:Fredoka;font-weight:700;font-size:18px;color:{BARK};box-shadow:0 3px 8px rgba(93,64,55,.14)">Unlock more worlds</div>'
    explore = f"""<div class="pad h-sec" style="margin-top:30px"><div class="ttl">Explore More Animal Worlds</div><div class="sub">Dinosaurs • Ocean • Safari • Rainforest</div></div>
<div class="pad grid2" style="margin-top:20px">{ptile('dino',1)}{ptile('ocean',1)}{ptile('safa',1)}{ptile('rain',1)}</div>{cta}<div style="height:150px"></div>"""
    return longpage('<div style="height:14px"></div><div class="divider" style="margin-top:34px"></div>' + sec + '<div class="divider" style="margin-top:28px"></div>' + explore + RECTS)
open("home_bottom.html", "w").write(home_bottom_html())

# ---------------------------------------------------------------- Pack screen
def atile2(k, tid=None):
    chk = f'<svg style="position:absolute;right:11px;top:9px" width="12" height="12" viewBox="0 0 12 12"><path d="M1.500 6.500l3 3 6-7" fill="none" stroke="{VA}" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/></svg>' if k in VISITED else ''
    idat = f' id="{tid}"' if tid else ''
    return f"""<div{idat} style="position:relative;height:126px;border-radius:24px;background:#fff;border:1px solid rgba(93,64,55,.15);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px 8px">
<img src="{k}.png" style="width:84px;height:76px;object-fit:contain"><div style="font-weight:700;font-size:12px;line-height:1.1;text-align:center;min-height:13px">{NAMES[k]}</div>{chk}</div>"""
def dots2(active):
    d = ""
    for i in (1, 2):
        a = i == active
        d += f'<div id="d{i}" class="fr" style="width:46px;height:46px;border-radius:50%;border:3px solid {BARK};background:{SKY if a else "#fff"};display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:600;color:{BARK};transform:scale({1.08 if a else 1})">{i}</div>'
    return f'<div style="display:flex;justify-content:center;gap:16px;margin-top:18px">{d}</div>'
def pawcard2():
    cells = ""
    for i, k in enumerate(WIN):
        if k in VISITED:
            cells += f'<div style="width:28px;height:28px;border-radius:50%;background:{VA};border:1.5px solid rgba(93,64,55,.65);display:flex;align-items:center;justify-content:center"><svg width="13" height="13" viewBox="0 0 12 12"><path d="M1.500 6.500l3 3 6-7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
        else:
            cells += f'<div style="width:28px;height:28px;border-radius:50%;background:#fff;border:1.5px solid rgba(93,64,55,.65);display:flex;align-items:center;justify-content:center">{PAW}</div>'
    return f"""<div style="margin:16px 16px 0;padding:12px 14px 10px;border-radius:24px;background:rgba(255,255,255,.94);border:1px solid rgba(93,64,55,.15)">
<div style="display:grid;grid-template-columns:repeat(9,28px);justify-content:space-between;row-gap:7px">{cells}</div>
<div style="text-align:center;font-weight:700;font-size:13px;margin-top:9px;color:rgba(93,64,55,.9)">Visit every animal in this pack to unlock the slideshow.</div></div>"""
def pack_screen(pg):
    ks = WIN[(pg - 1) * 9: pg * 9]
    tiles = "".join(atile2(k, "t%d" % (i + 1) if pg == 1 else None) for i, k in enumerate(ks))
    inner = f"""<div style="height:54px"></div>
<div style="position:relative;height:60px;padding:0 16px;display:flex;align-items:center;justify-content:space-between">
 <img src="icon-back.png" style="width:48px;height:46px;object-fit:contain">
 <div style="position:absolute;left:0;right:0;text-align:center;font-weight:700;font-size:19px">Pebble Brook's Pack</div>
 <img src="icon-treasure.png" style="width:44px;height:44px;object-fit:contain"></div>
<div style="margin:6px 16px 0;position:relative;border-radius:22px;background:linear-gradient(135deg,{VP},{VB});border:1px solid {VA}33;padding:16px;display:flex;gap:14px;align-items:center">
 <div style="width:122px;height:122px;flex:none;border-radius:50%;background:#fff;padding:4px;box-shadow:0 0 0 2.500px {BARK},0 6px 12px rgba(93,64,55,.14)"><img src="school-emblem.svg" style="width:100%;height:100%;display:block"></div>
 <div style="flex:1;min-width:0"><div class="fr" style="font-size:30px;line-height:1.05">Pebble Brook's Pack</div>
  <div style="font-weight:700;font-size:14px;line-height:1.28;margin-top:6px">Our school picked these animals. Let's meet them!</div>
  <div style="display:flex;gap:6px;margin-top:10px"><span class="pill" style="background:#fff;color:{BARK};border:1.5px solid {VA}55">18 animals</span><span class="pill" style="background:#fff;color:{BARK};border:1.5px solid {VA}55">Our school</span></div></div></div>
<div class="fr" style="font-size:26px;margin:24px 16px 12px;line-height:1.1">Meet the Animals</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:0 16px">{tiles}</div>
{dots2(pg)}{pawcard2()}"""
    h = page(inner, "top", bg_class="", bg_style=PACK_BG)
    h = h.replace(NEWSCRIM[0], NEWSCRIM[1])
    return h.replace("</body>", RECTS + "</body>")
open("pack1.html", "w").write(pack_screen(1)); open("pack2.html", "w").write(pack_screen(2))
# status strips
def strip(color, rgba):
    sb = statusbar().replace('<div class="home-ind"></div>', '').replace(NEWSCRIM[0], f'{color} 62%,rgba(0,0,0,0)')
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{LONGCSS}html,body{{height:66px;background:transparent}}</style></head><body><div style="position:relative;width:402px;height:66px">{sb}</div></body></html>"""
open("strip_home.html", "w").write(strip(CREAM, None)); open("strip_pack.html", "w").write(strip(VB, None))
print("html written")
