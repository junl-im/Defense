#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import math
import random

ROOT = Path(__file__).resolve().parents[1]
random.seed(300)


def rgba(hex_color, a=255):
    h=hex_color.lstrip('#')
    return tuple(int(h[i:i+2],16) for i in (0,2,4))+(a,)


def glow_layer(size, points):
    im=Image.new('RGBA',size,(0,0,0,0)); d=ImageDraw.Draw(im,'RGBA')
    for x,y,r,color,alpha in points:
        for k in range(8,0,-1):
            rr=r*k/8
            aa=int(alpha*(1-k/9)**1.7)
            d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=rgba(color,aa))
    return im.filter(ImageFilter.GaussianBlur(max(2,int(min(size)*.008))))


def make_ground():
    n=1024
    im=Image.new('RGB',(n,n),rgba('#171021')[:3]); px=im.load()
    for y in range(n):
        for x in range(n):
            v=random.randint(-7,7)
            radial=1-math.hypot(x-n/2,y-n/2)/(n*.72)
            px[x,y]=(max(8,min(255,24+v+int(radial*6))),max(5,min(255,15+v//2+int(radial*3))),max(12,min(255,34+v+int(radial*8))))
    d=ImageDraw.Draw(im,'RGBA')
    tile=128
    for row in range(-1,10):
        for col in range(-1,10):
            ox=col*tile + (row%2)*tile//2
            oy=row*tile
            wobble=random.randint(-5,5)
            poly=[(ox+6,oy+8+wobble),(ox+tile-8,oy+4),(ox+tile-4,oy+tile-10),(ox+8,oy+tile-5)]
            d.polygon(poly,fill=rgba('#2c2138',145),outline=rgba('#5b486b',80))
            d.line(poly+[poly[0]],fill=rgba('#090610',180),width=5)
            # moon-metal inlay on selected stones
            if (row+col)%5==0:
                cx=ox+tile*.5; cy=oy+tile*.5
                d.arc((cx-30,cy-30,cx+30,cy+30),35,315,fill=rgba('#b59a62',115),width=5)
            for _ in range(2):
                sx=ox+random.randint(25,100); sy=oy+random.randint(20,105)
                d.line([(sx,sy),(sx+random.randint(-24,24),sy+random.randint(10,35)),(sx+random.randint(-35,35),sy+random.randint(35,55))],fill=rgba('#0d0913',95),width=2)
    # central ghostly rune fragments
    for i in range(32):
        a=i*math.tau/32
        r=390+12*math.sin(i*2.3)
        x=n/2+math.cos(a)*r; y=n/2+math.sin(a)*r
        x2=n/2+math.cos(a+.07)*(r+20); y2=n/2+math.sin(a+.07)*(r+20)
        d.line([(x,y),(x2,y2)],fill=rgba('#6adbd2',55),width=3)
    im=ImageEnhance.Contrast(im).enhance(1.08)
    out=ROOT/'public/assets/textures/moon-market-ground-v1.webp'; out.parent.mkdir(parents=True,exist_ok=True)
    im.save(out,'WEBP',quality=90,method=6)


def radial_sprite(cell, core, edge, pattern='orb'):
    im=Image.new('RGBA',(cell,cell),(0,0,0,0))
    cx=cy=cell/2
    d=ImageDraw.Draw(im,'RGBA')
    for r in range(cell//2,0,-4):
        t=r/(cell/2)
        a=int(255*(1-t)**1.8)
        c=tuple(int(core[i]*(1-t)+edge[i]*t) for i in range(3))
        d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(*c,a))
    if pattern=='orb':
        d.ellipse((cx-27,cy-27,cx+27,cy+27),fill=(*core,255))
        d.arc((cx-54,cy-54,cx+54,cy+54),210,510,fill=(255,255,255,185),width=7)
        for i in range(7):
            a=i*math.tau/7
            x=cx+math.cos(a)*66;y=cy+math.sin(a)*66
            d.polygon([(x,y-12),(x+5,y-4),(x+13,y),(x+5,y+4),(x,y+13),(x-5,y+4),(x-13,y),(x-5,y-4)],fill=(*core,170))
    elif pattern=='slash':
        d.line([(35,185),(220,45)],fill=(*core,245),width=20)
        d.line([(22,205),(210,70)],fill=(255,255,255,170),width=5)
    elif pattern=='ring':
        d.ellipse((36,36,220,220),outline=(*core,240),width=16)
        d.ellipse((62,62,194,194),outline=(255,255,255,110),width=5)
    elif pattern=='burst':
        pts=[]
        for i in range(24):
            a=i*math.pi/12
            rr=105 if i%2==0 else 48
            pts.append((cx+math.cos(a)*rr,cy+math.sin(a)*rr))
        d.polygon(pts,fill=(*core,160))
        d.ellipse((91,91,165,165),fill=(255,255,255,235))
    return im.filter(ImageFilter.GaussianBlur(.65))


def make_fx():
    cell=256; atlas=Image.new('RGBA',(1024,1024),(0,0,0,0))
    specs=[
        ((255,103,57),(93,24,80),'orb'),((130,224,255),(48,52,115),'orb'),((103,255,210),(25,72,88),'slash'),((205,170,116),(60,43,58),'burst'),
        ((255,213,93),(92,40,40),'ring'),((178,102,255),(41,17,78),'orb'),((255,77,106),(82,12,35),'ring'),((104,235,255),(17,60,83),'burst'),
        ((255,170,70),(83,29,22),'slash'),((158,255,226),(19,65,62),'ring'),((210,184,255),(49,31,84),'burst'),((255,244,183),(86,60,25),'orb'),
        ((255,72,56),(80,12,22),'burst'),((94,212,255),(17,49,84),'slash'),((243,208,104),(78,51,19),'ring'),((198,104,255),(51,18,75),'burst')]
    for i,(core,edge,pat) in enumerate(specs):
        spr=radial_sprite(cell,core,edge,pat)
        atlas.alpha_composite(spr,((i%4)*cell,(i//4)*cell))
    out=ROOT/'public/assets/effects/moon-fx-atlas-v1.webp'; out.parent.mkdir(parents=True,exist_ok=True)
    atlas.save(out,'WEBP',quality=92,method=6)


def make_keyart():
    w,h=1600,900
    im=Image.new('RGB',(w,h),rgba('#090510')[:3]); d=ImageDraw.Draw(im,'RGBA')
    for y in range(h):
        t=y/(h-1)
        c=(int(10+24*t),int(6+8*t),int(20+28*t))
        d.line([(0,y),(w,y)],fill=c)
    # moon and clouds
    glow=glow_layer((w,h),[(1230,170,240,'#d8e9ff',125),(750,570,350,'#743d9e',80),(350,650,280,'#ff7c45',55)])
    im=Image.alpha_composite(im.convert('RGBA'),glow); d=ImageDraw.Draw(im,'RGBA')
    d.ellipse((1100,45,1410,355),fill=rgba('#e8e4c8',245))
    d.ellipse((1170,25,1455,330),fill=rgba('#23142f',205))
    for i in range(18):
        x=780+i*55; y=260+math.sin(i*.7)*24
        d.ellipse((x,y,x+170,y+48),fill=rgba('#3c2850',80))
    # market silhouette with layered roof
    for i in range(7):
        x=-80+i*260; base=720+random.randint(-15,12)
        d.rectangle((x+28,base-210,x+205,base),fill=rgba('#170d1d',245))
        d.polygon([(x,base-220),(x+110,base-320),(x+245,base-220)],fill=rgba('#4f2447',235))
        d.polygon([(x+15,base-235),(x+110,base-285),(x+225,base-235)],fill=rgba('#7a3556',180))
        for lx in (x+55,x+172):
            d.ellipse((lx-16,base-200,lx+16,base-150),fill=rgba('#ffbb55',235))
    # sacred tree
    d.rounded_rectangle((720,350,850,790),radius=58,fill=rgba('#251229',255))
    for box in [(530,240,900,570),(650,130,1020,500),(430,330,760,620),(810,300,1130,630)]:
        d.ellipse(box,fill=rgba('#542767',225))
    d.ellipse((720,390,850,520),fill=rgba('#77f1dd',125),outline=rgba('#d9ffff',200),width=8)
    # foreground hero silhouette, modern chibi proportions
    cx,cy=390,505
    d.ellipse((cx-145,cy-65,cx+145,cy+225),fill=rgba('#291534',235),outline=rgba('#bd8eff',150),width=8)
    d.ellipse((cx-125,cy-250,cx+125,cy-15),fill=rgba('#d49073',255),outline=rgba('#ffe1bd',160),width=8)
    d.polygon([(cx-92,cy-220),(cx-165,cy-350),(cx-55,cy-280)],fill=rgba('#e8b85f',255),outline=rgba('#fff0a4',200))
    d.polygon([(cx+92,cy-220),(cx+165,cy-350),(cx+55,cy-280)],fill=rgba('#e8b85f',255),outline=rgba('#fff0a4',200))
    d.rectangle((cx-95,cy-175,cx+95,cy-90),fill=rgba('#1b101f',245))
    d.ellipse((cx-55,cy-150,cx-25,cy-110),fill=rgba('#9ff7ff',255))
    d.ellipse((cx+25,cy-150,cx+55,cy-110),fill=rgba('#9ff7ff',255))
    d.polygon([(cx+110,cy+40),(cx+265,cy-190),(cx+315,cy-140),(cx+180,cy+95)],fill=rgba('#ff6a3e',220),outline=rgba('#ffe198',220))
    # enemy shapes
    for j,(ex,ey,s,col) in enumerate([(1180,590,1.0,'#a4335f'),(1375,640,.78,'#623f94'),(1030,690,.64,'#3e7e75')]):
        d.ellipse((ex-90*s,ey-80*s,ex+90*s,ey+100*s),fill=rgba(col,235),outline=rgba('#f0b8ff',80),width=max(2,int(6*s)))
        d.polygon([(ex-45*s,ey-70*s),(ex-105*s,ey-145*s),(ex-35*s,ey-112*s)],fill=rgba('#24111f',255))
        d.polygon([(ex+45*s,ey-70*s),(ex+105*s,ey-145*s),(ex+35*s,ey-112*s)],fill=rgba('#24111f',255))
        d.ellipse((ex-35*s,ey-35*s,ex-12*s,ey-12*s),fill=rgba('#ffcf6d',255))
        d.ellipse((ex+12*s,ey-35*s,ex+35*s,ey-12*s),fill=rgba('#ffcf6d',255))
    # atmospheric sparks
    for i in range(90):
        x=random.randrange(w); y=random.randrange(80,h-100); r=random.choice([1,2,3,5])
        col=random.choice(['#ffcc67','#75f1dc','#bc8cff'])
        d.ellipse((x-r,y-r,x+r,y+r),fill=rgba(col,random.randint(60,180)))
    im=im.filter(ImageFilter.GaussianBlur(.15))
    im.save(ROOT/'src/assets/moon-market-keyart.webp','WEBP',quality=92,method=6)
    im.resize((1200,675),Image.Resampling.LANCZOS).crop((0,20,1200,650)).save(ROOT/'public/cover.webp','WEBP',quality=90,method=6)


if __name__=='__main__':
    make_ground(); make_fx(); make_keyart(); print('generated NextGen visual assets')
