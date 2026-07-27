from PIL import Image, ImageDraw, ImageFilter, ImageChops
from pathlib import Path
import math
root=Path('.')
src=Image.open(root/'src/assets/title-v112/title-mascot-lite-v112.webp').convert('RGBA')
S=768
canvas=Image.new('RGBA',(S,S),(0,0,0,0))
# ambient glow safely inset from edges
glow=Image.new('RGBA',(S,S),(0,0,0,0)); gd=ImageDraw.Draw(glow)
for r,a in [(310,24),(278,34),(244,50)]:
    gd.ellipse((S//2-r,S//2-r,S//2+r,S//2+r), fill=(84,177,255,a))
glow=glow.filter(ImageFilter.GaussianBlur(42))
canvas=Image.alpha_composite(canvas,glow)
# dark portal disc with layered rings
base=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(base)
cx=cy=S//2
# shadow
for r,a in [(284,65),(270,95)]: d.ellipse((cx-r,cy-r+20,cx+r,cy+r+20),fill=(0,0,0,a))
# outer cyan halo
d.ellipse((74,74,694,694),fill=(43,176,255,130))
d.ellipse((92,92,676,676),fill=(13,20,55,255))
# gold bevel rings
d.ellipse((102,102,666,666),fill=(255,218,103,255))
d.ellipse((116,116,652,652),fill=(117,58,9,255))
d.ellipse((128,128,640,640),fill=(255,204,74,255))
d.ellipse((144,144,624,624),fill=(38,12,72,255))
# inner purple gradient via concentric discs
for r in range(240, 0, -4):
    t=1-r/240
    col=(int(50+42*t),int(13+25*t),int(90+85*t),255)
    d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=col)
# top gloss
shine=Image.new('RGBA',(S,S),(0,0,0,0)); sd=ImageDraw.Draw(shine)
sd.ellipse((170,148,598,420),fill=(255,255,255,38))
shine=shine.filter(ImageFilter.GaussianBlur(28)); base=Image.alpha_composite(base,shine)
canvas=Image.alpha_composite(canvas,base)
# mascot face/torso crop, clean antialiased scale
crop=src.crop((105,0,450,365))
# trim transparent bbox then fit
bbox=crop.getbbox(); crop=crop.crop(bbox)
crop.thumbnail((390,420),Image.Resampling.LANCZOS)
# subtle dark silhouette shadow
alpha=crop.getchannel('A')
shadow=Image.new('RGBA',crop.size,(0,0,0,0)); shadow.putalpha(alpha.filter(ImageFilter.GaussianBlur(12)))
shadow_rgb=Image.new('RGBA',crop.size,(0,0,0,155)); shadow_rgb.putalpha(shadow.getchannel('A'))
x=(S-crop.width)//2-8; y=168
canvas.alpha_composite(shadow_rgb,(x+10,y+18))
canvas.alpha_composite(crop,(x,y))
# cover lower crop edge with inner plate so no harsh cutoff
plate=Image.new('RGBA',(S,S),(0,0,0,0)); pd=ImageDraw.Draw(plate)
pd.rounded_rectangle((173,533,595,642),radius=46,fill=(22,8,50,240),outline=(255,205,83,255),width=12)
pd.rounded_rectangle((190,548,578,627),radius=34,outline=(106,214,255,170),width=5)
# summoning spark symbols
for px,py,scale in [(179,235,18),(586,248,15),(205,502,13),(557,476,11)]:
    pd.polygon([(px,py-scale),(px+scale//3,py-scale//3),(px+scale,py),(px+scale//3,py+scale//3),(px,py+scale),(px-scale//3,py+scale//3),(px-scale,py),(px-scale//3,py-scale//3)],fill=(255,239,154,235))
# random die badge
die=Image.new('RGBA',(170,170),(0,0,0,0)); dd=ImageDraw.Draw(die)
dd.rounded_rectangle((18,18,152,152),radius=32,fill=(43,178,255,255),outline=(255,228,122,255),width=10)
dd.rounded_rectangle((33,33,137,137),radius=23,fill=(38,20,95,255),outline=(255,255,255,90),width=4)
for px,py in [(55,55),(115,55),(85,85),(55,115),(115,115)]: dd.ellipse((px-10,py-10,px+10,py+10),fill=(255,237,142,255))
die=die.rotate(-10,resample=Image.Resampling.BICUBIC,expand=True)
plate.alpha_composite(die,(497,488))
canvas=Image.alpha_composite(canvas,plate)
# final edge-safe downsample and slight unsharp
canvas=canvas.resize((256,256),Image.Resampling.LANCZOS)
canvas=canvas.filter(ImageFilter.UnsharpMask(radius=1.1,percent=115,threshold=3))
# guarantee transparent outer 2px to avoid clipped edges
pix=canvas.load(); w,h=canvas.size
for yy in range(h):
  for xx in range(w):
    if xx<2 or yy<2 or xx>=w-2 or yy>=h-2:
      r,g,b,a=pix[xx,yy]; pix[xx,yy]=(r,g,b,0)
out=root/'src/assets/ui-v142/random-summon-emblem-v142.png'
canvas.save(out,optimize=True)
print(out, out.stat().st_size)
