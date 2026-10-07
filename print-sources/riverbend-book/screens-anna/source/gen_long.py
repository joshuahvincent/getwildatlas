import sys
sys.argv=[sys.argv[0]]
exec(open("gen.py").read())
LONGCSS = CSS.replace("html,body{width:402px;height:874px;overflow:hidden;background:%s}"%CREAM,"html,body{width:402px;background:transparent}")
def longpage(inner, bg_class="dots", bg_style=""):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{LONGCSS}
body{{background:transparent}}#wrap{{width:402px}}</style></head><body><div id="wrap" class="{bg_class}" style="{bg_style}">{inner}</div></body></html>"""
# ---- home bottom (below the real Dino Roars tile)
cta = f'<div style="margin:22px 16px 0;height:50px;border-radius:14px;background:#FF9E7D;display:flex;align-items:center;justify-content:center;font-family:Fredoka;font-weight:700;font-size:18px;color:{BARK};box-shadow:0 3px 8px rgba(93,64,55,.14)">Unlock more worlds</div>'
h = home()
a = h.index('<div class="divider" style="margin-top:34px"></div>')
b = h.index('<div class="pad h-sec"')
places_part = h[a:b]
explore = f"""<div class="pad h-sec" style="margin-top:30px"><div class="ttl">Explore More Animal Worlds</div><div class="sub">Ocean • Safari • Rainforest • Reptiles</div></div>
<div class="pad grid2" style="margin-top:20px">{ptile('ocean',1)}{ptile('rept',1)}{ptile('safa',1)}{ptile('rain',1)}</div>{cta}<div style="height:150px"></div>"""
open("home_bottom.html","w").write(longpage('<div style="height:14px"></div>'+places_part+explore))
# ---- pack long page
pt = pack_top().replace('<div style="height:40px"></div>','')
pl = pack_lower()
pl = pl.replace(pawcard().replace('margin:16px 16px 0','margin:0 16px 0'),'',1)
pl = pl.replace('<div style="height:54px"></div>\n','',1)
pl = pl.replace('<div style="height:260px"></div>','<div style="height:170px"></div>')
open("pack_long.html","w").write(longpage(pt+pl,"",PACK_BG))
# status strips (transparent bg) with scrim
def strip(color):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{LONGCSS}html,body{{height:66px;background:transparent}}</style></head><body><div style="position:relative;width:402px;height:66px">{statusbar().replace('<div class="home-ind"></div>','').replace('z-index:40;background:linear-gradient(#FFF8EC 62%,rgba(255,248,236,0))','z-index:40;background:linear-gradient(%s 62%%,rgba(0,0,0,0))'%color)}</div></body></html>"""
open("strip_home.html","w").write(strip(CREAM)); open("strip_pack.html","w").write(strip(VB))
print("ok")
