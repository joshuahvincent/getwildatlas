import subprocess, glob, math
from PIL import Image, ImageDraw, ImageFilter
W,H=1206,2622; FPS=30
real=Image.open("real_home.png").convert("RGB")
SEAM=2124
bottom=Image.open("home_bottom.png").convert("RGB").crop((0,0,W,2500))
home=Image.new("RGB",(W,SEAM+2500)); home.paste(real.crop((0,0,W,SEAM)),(0,0)); home.paste(bottom,(0,SEAM))
# feather seam
band=40
a=real.crop((0,SEAM-band,W,SEAM)); b=bottom.crop((0,0,W,band))
mask=Image.linear_gradient("L").resize((W,band))   # 0..255 top->bottom
home.paste(Image.composite(b,a,mask),(0,SEAM-band))
pack=Image.open("pack_long.png").convert("RGB").crop((0,0,W,5280))
sh=Image.open("strip_home.png").convert("RGBA"); sp=Image.open("strip_pack.png").convert("RGBA")
otter=[Image.open(f).convert("RGB") for f in sorted(glob.glob("otf2/f_*.png"))]
print("home",home.size,"pack",pack.size,"otter",len(otter))
def ease(t): return 0.5-0.5*math.cos(math.pi*t)
def strip_over(img,strip,alpha=1.0):
    s=strip.copy()
    if alpha<1.0:
        al=s.getchannel("A").point(lambda v:int(v*alpha)); s.putalpha(al)
    img=img.copy(); img.paste(s,(0,0),s); return img
def home_frame(scroll):
    f=home.crop((0,scroll,W,scroll+H))
    return strip_over(f,sh,min(1.0,scroll/90))
def pack_frame(scroll):
    return strip_over(pack.crop((0,scroll,W,scroll+H)),sp,1.0)
def ripple(img,cx,cy,t):
    ov=Image.new("RGBA",img.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
    r=int(40+110*t); al=int(235*(1-t)**1.1)
    d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(93,64,55,int(al*.45)),outline=(255,255,255,al),width=8)
    c=int(34*(1-0.3*t)); d.ellipse((cx-c,cy-c,cx+c,cy+c),fill=(93,64,55,min(230,int(al*1.2))))
    out=img.convert("RGBA"); out.alpha_composite(ov); return out.convert("RGB")
def push(out_img,in_img,n=13):
    fr=[]
    for i in range(1,n+1):
        t=1-(1-i/n)**3
        x=int(W*(1-t)); under=out_img.copy()
        shift=int(-W*0.28*t); u=Image.new("RGB",(W,H),(0,0,0)); u.paste(under,(shift,0))
        dark=Image.new("RGB",(W,H),(0,0,0)); u=Image.blend(u,dark,0.18*t)
        u.paste(in_img,(x,0))
        # soft edge shadow
        sh_=Image.new("RGBA",(60,H),(0,0,0,0)); 
        for k in range(60):
            ImageDraw.Draw(sh_).line([(k,0),(k,H)],fill=(0,0,0,int(55*(k/60)**2)))
        u=u.convert("RGBA"); u.alpha_composite(sh_,(max(0,x-60),0)) if x-60>=0 else None; fr.append(u.convert("RGB"))
    return fr
frames=[]
def add(img,n=1):
    frames.extend([img]*n)
# 1 home hold + scroll
HS=1516
add(home_frame(0),30)
n=66
for i in range(1,n+1): frames.append(home_frame(int(HS*ease(i/n))))
add(home_frame(HS),22)
tap_home=(603,1250)
base=home_frame(HS)
n=14
for i in range(n): frames.append(ripple(base,*tap_home,i/(n-1)))
pack0=pack_frame(0)
frames.extend(push(base,pack0))
add(pack0,26)
PS=2658
n=100
for i in range(1,n+1): frames.append(pack_frame(int(PS*ease(i/n))))
add(pack_frame(PS),22)
n=76
for i in range(1,n+1): frames.append(pack_frame(int(PS*(1-ease(i/n)))))
add(pack0,12)
tap_otter=(603,1315)
n=14
for i in range(n): frames.append(ripple(pack0,*tap_otter,i/(n-1)))
frames.extend(push(pack0,otter[0]))
frames.extend(otter)
add(otter[-1],30)
print("frames",len(frames),"sec",len(frames)/FPS)
p=subprocess.Popen(["ffmpeg","-y","-v","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-","-c:v","libx264","-preset","medium","-crf","19","-pix_fmt","yuv420p","-movflags","+faststart","riverbend_flow.mp4"],stdin=subprocess.PIPE)
for f in frames: p.stdin.write(f.tobytes())
p.stdin.close(); p.wait(); print("done",p.returncode)
