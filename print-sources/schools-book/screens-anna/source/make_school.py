import subprocess, glob, math, os
import numpy as np
from PIL import Image, ImageDraw
W,H=1206,2622; FPS=30
OUT="out"; os.makedirs(OUT,exist_ok=True)
real=Image.open("real_home_school_clean.png").convert("RGB")
SEAM=2124
bottom=Image.open("home_bottom.png").convert("RGB").crop((0,0,W,2500))
home=Image.new("RGB",(W,SEAM+2500)); home.paste(real.crop((0,0,W,SEAM)),(0,0)); home.paste(bottom,(0,SEAM))
band=40; a=real.crop((0,SEAM-band,W,SEAM)); b=bottom.crop((0,0,W,band))
home.paste(Image.composite(b,a,Image.linear_gradient("L").resize((W,band))),(0,SEAM-band))
sh=Image.open("strip_home.png").convert("RGBA")
def strip_over(img,strip,alpha=1.0):
    s=strip.copy()
    if alpha<1.0: s.putalpha(s.getchannel("A").point(lambda v:int(v*alpha)))
    img=img.copy(); img.paste(s,(0,0),s); return img
def home_frame(scroll): return strip_over(home.crop((0,scroll,W,scroll+H)),sh,min(1.0,scroll/90))
CARD_Y=int((292+64)*3)
HS=SEAM+CARD_Y-1500
print("home scroll",HS)
home_frame(HS).save(f"{OUT}/school-home.png")
pack1=Image.open("pack1.png").convert("RGB"); pack2=Image.open("pack2.png").convert("RGB"); pack1.save(f"{OUT}/school-pack-top.png")
chip=Image.open("chip.png").convert("RGBA")
gr0=Image.open("gr_static.png").convert("RGB")
def with_chip(frame,s=0):
    f=frame.convert("RGBA"); ov=Image.new("RGBA",(W,H),(0,0,0,0)); ov.paste(chip,(0,-s),chip); f.alpha_composite(ov)
    f=f.convert("RGB"); f.paste(frame.crop((0,0,W,305)),(0,0)); return f
with_chip(gr0).save(f"{OUT}/school-animal.png")
# ---- real recording frames + chip tracking
grf=sorted(glob.glob("grf/f_*.png")); gr=[Image.open(f).convert("RGB") for f in grf]
g0=np.asarray(gr[0].convert("L").resize((W//4,H//4)),dtype=np.float32)
y0,y1=900//4,1300//4
def offset(img):
    g=np.asarray(img.convert("L").resize((W//4,H//4)),dtype=np.float32); best=(1e18,0)
    for s in range(0,56):
        d=np.abs(g[y0-s:y1-s]-g0[y0:y1]).mean()
        if d<best[0]: best=(d,s)
    return best[1]*4, best[0]
anim=[]; 
for i,f in enumerate(gr):
    s,d=offset(f)
    anim.append(with_chip(f,s) if (d<6 and s<=240) else f)
print("anim frames",len(anim))
def ease(t): return 0.5-0.5*math.cos(math.pi*t)
def ripple(img,cx,cy,t):
    ov=Image.new("RGBA",img.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
    r=int(40+110*t); al=int(235*(1-t)**1.1)
    d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(93,64,55,int(al*.45)),outline=(255,255,255,al),width=8)
    c=int(34*(1-0.3*t)); d.ellipse((cx-c,cy-c,cx+c,cy+c),fill=(93,64,55,min(230,int(al*1.2))))
    out=img.convert("RGBA"); out.alpha_composite(ov); return out.convert("RGB")
shadow=Image.new("RGBA",(60,H),(0,0,0,0)); dd=ImageDraw.Draw(shadow)
for k in range(60): dd.line([(k,0),(k,H)],fill=(0,0,0,int(55*(k/60)**2)))
def push(out_img,in_img,n=13):
    fr=[]
    for i in range(1,n+1):
        t=1-(1-i/n)**3; x=int(W*(1-t)); shift=int(-W*0.28*t)
        u=Image.new("RGB",(W,H),(0,0,0)); u.paste(out_img,(shift,0)); u=Image.blend(u,Image.new("RGB",(W,H),(0,0,0)),0.18*t)
        u.paste(in_img,(x,0)); u=u.convert("RGBA")
        if x-60>=0: u.alpha_composite(shadow,(x-60,0))
        fr.append(u.convert("RGB"))
    return fr
frames=[]
def add(img,n=1): frames.extend([img]*n)
add(home_frame(0),30)
for i in range(1,67): frames.append(home_frame(int(HS*ease(i/66))))
base=home_frame(HS); add(base,22)
for i in range(14): frames.append(ripple(base,603,1500,i/13))
frames.extend(push(base,pack1)); add(pack1,36)
t2=(696,2351); t1=(510,2351); tg=(221,1625)
for i in range(14): frames.append(ripple(pack1,*t2,i/13))
for i in range(1,9): frames.append(Image.blend(pack1,pack2,i/8))
add(pack2,30)
for i in range(14): frames.append(ripple(pack2,*t1,i/13))
for i in range(1,9): frames.append(Image.blend(pack2,pack1,i/8))
add(pack1,15)
for i in range(14): frames.append(ripple(pack1,*tg,i/13))
frames.extend(push(pack1,anim[0]))
frames.extend(anim); add(anim[-1],30)
print("frames",len(frames),"sec",round(len(frames)/FPS,1))
p=subprocess.Popen(["ffmpeg","-y","-v","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-","-c:v","libx264","-preset","medium","-crf","19","-pix_fmt","yuv420p","-movflags","+faststart",f"{OUT}/school-flow.mp4"],stdin=subprocess.PIPE)
for f in frames: p.stdin.write(f.tobytes())
p.stdin.close(); p.wait(); print("done",p.returncode)
