from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps
import math, random

ROOT = Path(__file__).resolve().parents[1]
UI = ROOT/'public/assets/ui/v2_6'
MAPS = ROOT/'public/assets/maps/v2_6'
BG = ROOT/'public/assets/backgrounds'
UI.mkdir(parents=True, exist_ok=True)
MAPS.mkdir(parents=True, exist_ok=True)


def save_both(im: Image.Image, path: Path, webp=True, q=84):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path)
    if webp:
        im.convert('RGBA').save(path.with_suffix('.webp'), quality=q, method=6)


def rounded_panel(size, fill1, fill2, stroke, radius=22, border=3, gloss=True):
    w,h = size
    im = Image.new('RGBA', size, (0,0,0,0))
    d = ImageDraw.Draw(im)
    # shadow
    shadow = Image.new('RGBA', size, (0,0,0,0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((8,10,w-8,h-4), radius, fill=(0,0,0,90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(6))
    im.alpha_composite(shadow)
    # gradient core
    grad = Image.new('RGBA', size, (0,0,0,0))
    gd = ImageDraw.Draw(grad)
    for y in range(h):
        t=y/max(1,h-1)
        c=tuple(int(fill1[i]*(1-t)+fill2[i]*t) for i in range(3)) + (int(fill1[3]*(1-t)+fill2[3]*t),)
        gd.line((0,y,w,y), fill=c)
    mask=Image.new('L', size,0); md=ImageDraw.Draw(mask); md.rounded_rectangle((border,border,w-border,h-border), radius, fill=255)
    im.paste(grad, (0, 0), mask)
    d.rounded_rectangle((border,border,w-border,h-border), radius, outline=stroke, width=border)
    d.rounded_rectangle((border+5,border+5,w-border-5,h-border-5), max(4,radius-5), outline=(255,255,255,70), width=1)
    if gloss:
        gd=ImageDraw.Draw(im)
        gd.rounded_rectangle((border+10,border+8,w-border-10,border+20), max(4,radius//2), fill=(255,255,255,42))
    return im

# Combat HUD / dock refined lighter mobile surfaces
for name, src, out, size in [
    ('top','public/assets/ui/v2_4/combat_top_hud_v2_4.png','combat_top_hud_v2_6.png',(900,58)),
    ('dock','public/assets/ui/v2_4/combat_bottom_dock_v2_4.png','combat_bottom_dock_v2_6.png',(920,76)),
    ('build','public/assets/ui/v2_4/tower_build_menu_v2_4.png','tower_build_menu_v2_6.png',(292,196)),
    ('card','public/assets/ui/v2_4/tower_build_card_v2_4.png','tower_build_card_v2_6.png',(122,50)),
    ('panel','public/assets/ui/v2_4/tower_command_panel_v2_4.png','tower_command_panel_v2_6.png',(330,224)),
]:
    p=ROOT/src
    if p.exists():
        im=Image.open(p).convert('RGBA').resize(size, Image.LANCZOS)
        im=ImageEnhance.Color(im).enhance(1.08)
        im=ImageEnhance.Contrast(im).enhance(1.06)
        overlay=Image.new('RGBA', im.size, (255,247,210,0)); od=ImageDraw.Draw(overlay)
        od.rounded_rectangle((5,5,im.size[0]-5,im.size[1]-5), 18, outline=(255,240,160,90), width=2)
        im.alpha_composite(overlay)
    else:
        im=rounded_panel(size,(34,79,151,236),(15,40,92,235),(255,220,120,210),18)
    save_both(im, UI/out)

# Buttons copied with polish
for color in ['blue','gold','green','red','dark']:
    src=ROOT/f'public/assets/ui/v2_4/button_{color}_v2_4.png'
    if src.exists():
        im=Image.open(src).convert('RGBA')
        im=ImageEnhance.Sharpness(im).enhance(1.25)
        im=ImageEnhance.Contrast(im).enhance(1.05)
    else:
        im=rounded_panel((170,44),(60,114,202,255),(24,58,126,255),(255,240,180,230),18)
    save_both(im, UI/f'button_{color}_v2_6.png')

# Strategy cards and chips
season=rounded_panel((252,58),(38,92,169,232),(14,44,99,235),(255,219,118,225),20)
d=ImageDraw.Draw(season)
d.ellipse((14,12,48,46), fill=(98,218,255,180), outline=(255,255,255,150), width=2)
d.polygon([(30,17),(36,30),(30,43),(24,30)], fill=(255,246,155,230))
d.rounded_rectangle((62,13,238,45), 13, fill=(255,255,255,32), outline=(255,255,255,70))
save_both(season, UI/'season_chip_v2_6.png')

card=rounded_panel((278,94),(255,251,235,244),(220,238,255,238),(255,219,128,230),18)
d=ImageDraw.Draw(card)
for x,c in [(28,(255,211,98,180)),(50,(116,219,255,150)),(72,(150,235,144,140))]:
    d.ellipse((x-11,23,x+11,45), fill=c, outline=(255,255,255,120), width=1)
d.rounded_rectangle((104,22,252,38), 8, fill=(39,82,154,55))
d.rounded_rectangle((104,50,238,66), 8, fill=(39,82,154,36))
save_both(card, UI/'strategy_card_v2_6.png')

event_panel=rounded_panel((440,138),(21,57,125,238),(9,27,70,240),(255,217,115,225),22)
d=ImageDraw.Draw(event_panel)
for i in range(8):
    x=30+i*52
    d.ellipse((x,104,x+18,122), fill=(255,232,132,60))
d.rounded_rectangle((26,24,410,52), 14, fill=(255,255,255,36), outline=(255,255,255,90))
d.rounded_rectangle((26,67,188,110), 16, fill=(95,183,255,40), outline=(141,221,255,95))
d.rounded_rectangle((206,67,414,110), 16, fill=(255,213,100,36), outline=(255,231,145,90))
save_both(event_panel, UI/'event_panel_v2_6.png')

syn=rounded_panel((352,60),(30,94,89,235),(14,57,76,235),(147,255,194,220),18)
d=ImageDraw.Draw(syn)
for i,c in enumerate([(142,223,80,170),(169,112,255,165),(79,163,255,165),(255,179,71,165)]):
    d.ellipse((18+i*39,16,48+i*39,46), fill=c, outline=(255,255,255,120), width=2)
d.rounded_rectangle((186,18,330,42), 12, fill=(255,255,255,32))
save_both(syn, UI/'synergy_panel_v2_6.png')

# Elite badge
badge=Image.new('RGBA',(72,72),(0,0,0,0))
d=ImageDraw.Draw(badge)
for r,a in [(35,40),(28,80),(22,190)]:
    d.ellipse((36-r,36-r,36+r,36+r), fill=(255,197,67,a), outline=(255,255,255,min(200,a+30)), width=2)
d.polygon([(36,6),(43,28),(66,28),(47,42),(54,66),(36,51),(18,66),(25,42),(6,28),(29,28)], fill=(255,232,114,230), outline=(121,78,18,210))
save_both(badge, UI/'elite_badge_v2_6.png')

# Command aura
size=128
aura=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(aura)
for r,a in [(58,38),(45,74),(32,120)]:
    d.ellipse((size/2-r,size/2-r,size/2+r,size/2+r), outline=(127,255,218,a), width=3)
for i in range(8):
    ang=math.tau*i/8
    x=size/2+math.cos(ang)*48; y=size/2+math.sin(ang)*48
    d.ellipse((x-4,y-4,x+4,y+4), fill=(255,238,146,150))
save_both(aura, UI/'command_aura_v2_6.png')

# Map passes: clean background plus more hand-painted landmarks outside main path.
colors=[(120,209,121),(239,173,85),(79,166,137),(150,129,184),(88,121,171),(222,107,69),(91,77,150),(197,186,138)]
for idx in range(1,9):
    src=ROOT/f'public/assets/maps/v2_4/battle_stage_{idx:03d}_v2_4.png'
    im=Image.open(src).convert('RGBA') if src.exists() else Image.new('RGBA',(960,540),(70,140,96,255))
    im=ImageEnhance.Color(im).enhance(1.08)
    im=ImageEnhance.Contrast(im).enhance(1.04)
    rng=random.Random(2600+idx)
    layer=Image.new('RGBA', im.size, (0,0,0,0)); d=ImageDraw.Draw(layer)
    # soft playfield gradient; no baked HUD
    d.rectangle((0,0,960,64), fill=(0,15,38,32))
    d.rectangle((0,454,960,540), fill=(0,0,0,26))
    # ornaments well outside path centers
    for _ in range(28):
        x=rng.choice(list(range(36,180))+list(range(790,930))+list(range(230,740)))
        y=rng.choice(list(range(78,130))+list(range(405,445))+list(range(100,420)))
        if 220 < x < 740 and 150 < y < 380 and rng.random()<0.6: continue
        c=colors[(idx+_ )%len(colors)]
        if rng.random()<0.5:
            d.ellipse((x-4,y-4,x+4,y+4), fill=(*c,80), outline=(255,255,255,45))
            d.line((x,y-9,x,y+9), fill=(*c,60), width=1)
            d.line((x-9,y,x+9,y), fill=(*c,60), width=1)
        else:
            pts=[(x,y-8),(x+7,y),(x,y+8),(x-7,y)]
            d.polygon(pts, fill=(*c,70), outline=(255,255,255,55))
    # safe-zone faint rails
    d.rounded_rectangle((18,70,942,450), 28, outline=(255,238,177,30), width=2)
    im.alpha_composite(layer)
    # Vignette
    vig=Image.new('L', im.size, 0); vd=ImageDraw.Draw(vig)
    for r in range(600, 130, -8):
        a=int(max(0, min(80, (600-r)*0.18)))
        vd.ellipse((480-r,270-r*0.6,480+r,270+r*0.6), fill=255-a)
    # not heavy, use alpha overlay border
    border=Image.new('RGBA', im.size, (0,0,0,0)); bd=ImageDraw.Draw(border)
    bd.rectangle((0,0,960,540), outline=(0,0,0,45), width=14)
    im.alpha_composite(border)
    save_both(im, MAPS/f'battle_stage_{idx:03d}_v2_6.png', q=82)

# Login/main small v2.6 derivatives with no baked text, keep performance small
for name, src, out in [
    ('login','public/assets/backgrounds/login_background_clean_v2_4.png','login_background_clean_v2_6.png'),
    ('menu','public/assets/backgrounds/main_menu_splash_v2_4.png','main_menu_splash_v2_6.png')
]:
    im=Image.open(ROOT/src).convert('RGBA')
    im=ImageEnhance.Color(im).enhance(1.04)
    im=ImageEnhance.Contrast(im).enhance(1.03)
    layer=Image.new('RGBA', im.size, (0,0,0,0)); d=ImageDraw.Draw(layer)
    w,h=im.size
    d.rectangle((0,0,w, int(h*0.16)), fill=(0,18,48,42))
    d.rectangle((0,int(h*0.84),w,h), fill=(0,0,0,32))
    im.alpha_composite(layer)
    save_both(im, BG/out, q=84)

print('v2.6 assets generated')
