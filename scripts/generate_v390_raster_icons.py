#!/usr/bin/env python3
from __future__ import annotations

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'assets' / 'ui' / 'v390'
S = 1024


def gradient(colors):
    image = Image.new('RGBA', (S, S), colors[0])
    px = image.load()
    for y in range(S):
        for x in range(S):
            dx = (x - S * .42) / S
            dy = (y - S * .32) / S
            r = min(1, math.hypot(dx, dy) * 1.45)
            t = min(1, max(0, (y / S) * .55 + r * .45))
            a, b = colors[0], colors[1]
            px[x, y] = tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(4))
    return image


def rounded_panel(colors, accent):
    image = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    shadow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((94, 112, 930, 948), radius=210, fill=(0, 0, 0, 170))
    shadow = shadow.filter(ImageFilter.GaussianBlur(42))
    image.alpha_composite(shadow)
    panel = gradient(colors)
    mask = Image.new('L', (S, S), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((76, 76, 948, 948), radius=216, fill=255)
    panel.putalpha(mask)
    image.alpha_composite(panel)
    draw = ImageDraw.Draw(image, 'RGBA')
    draw.rounded_rectangle((76, 76, 948, 948), radius=216, outline=accent + (245,), width=34)
    draw.arc((112, 92, 910, 806), 202, 338, fill=(255, 255, 255, 105), width=30)
    draw.ellipse((180, 148, 600, 568), fill=(255, 255, 255, 24))
    return image


def glow_layer(shape_fn, color, blur=32):
    layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer, 'RGBA')
    shape_fn(d, color + (220,))
    return layer.filter(ImageFilter.GaussianBlur(blur))


def sword(draw, color):
    draw.polygon([(486, 174), (558, 174), (548, 660), (522, 748), (496, 660)], fill=color)
    draw.rounded_rectangle((342, 610, 680, 688), radius=36, fill=(255, 215, 110, 255))
    draw.polygon([(468, 680), (576, 680), (626, 820), (522, 890), (418, 820)], fill=(125, 65, 208, 255))
    draw.polygon([(486, 174), (522, 96), (558, 174)], fill=(255, 242, 196, 255))


def bow(draw, color):
    draw.arc((238, 148, 782, 900), 248, 112, fill=color, width=62)
    draw.line((520, 174, 520, 864), fill=(255, 238, 197, 245), width=22)
    draw.line((338, 520, 760, 520), fill=(255, 211, 89, 255), width=34)
    draw.polygon([(760, 520), (670, 466), (680, 520), (670, 574)], fill=(255, 246, 212, 255))


def staff(draw, color):
    draw.rounded_rectangle((478, 230, 548, 882), radius=34, fill=(122, 70, 199, 255))
    draw.ellipse((326, 126, 700, 500), outline=color, width=64)
    draw.ellipse((418, 218, 608, 408), fill=(94, 231, 255, 255))
    draw.ellipse((454, 250, 572, 368), fill=(232, 255, 255, 255))
    draw.arc((364, 164, 662, 462), 188, 354, fill=(255, 224, 103, 255), width=34)


def skull(draw, color):
    draw.ellipse((276, 196, 748, 658), fill=color)
    draw.rounded_rectangle((362, 568, 662, 802), radius=86, fill=color)
    draw.ellipse((362, 338, 484, 472), fill=(28, 20, 48, 255))
    draw.ellipse((540, 338, 662, 472), fill=(28, 20, 48, 255))
    draw.polygon([(512, 454), (460, 554), (564, 554)], fill=(28, 20, 48, 255))
    for x in range(406, 650, 58):
        draw.rounded_rectangle((x, 650, x + 34, 770), radius=12, fill=(40, 27, 58, 220))


def wing(draw, color):
    draw.polygon([(510, 208), (232, 322), (118, 600), (350, 542), (208, 816), (510, 666)], fill=color)
    draw.polygon([(514, 208), (792, 322), (906, 600), (674, 542), (816, 816), (514, 666)], fill=color)
    draw.ellipse((408, 316, 616, 690), fill=(66, 39, 104, 255))
    draw.polygon([(512, 258), (454, 382), (570, 382)], fill=(255, 222, 98, 255))


def ghost(draw, color):
    draw.ellipse((284, 166, 740, 650), fill=color)
    draw.polygon([(284, 470), (740, 470), (708, 838), (620, 748), (548, 862), (466, 748), (360, 842)], fill=color)
    draw.ellipse((370, 348, 478, 480), fill=(32, 21, 67, 255))
    draw.ellipse((546, 348, 654, 480), fill=(32, 21, 67, 255))


def strike(draw, color):
    draw.polygon([(548, 112), (300, 550), (472, 550), (384, 910), (744, 436), (556, 436)], fill=color)


def summon(draw, color):
    draw.ellipse((230, 230, 794, 794), outline=color, width=62)
    pts=[]
    for i in range(10):
        a=-math.pi/2+i*math.pi/5
        r=260 if i%2==0 else 112
        pts.append((512+math.cos(a)*r,512+math.sin(a)*r))
    draw.polygon(pts, outline=(255, 242, 190, 255), width=34)
    draw.ellipse((438, 438, 586, 586), fill=color)


def control(draw, color):
    draw.ellipse((210, 210, 814, 814), outline=color, width=68)
    draw.ellipse((360, 360, 664, 664), outline=(255, 238, 196, 255), width=42)
    draw.line((512, 132, 512, 364), fill=color, width=48)
    draw.line((512, 660, 512, 892), fill=color, width=48)
    draw.line((132, 512, 364, 512), fill=color, width=48)
    draw.line((660, 512, 892, 512), fill=color, width=48)


ICONS = {
    'class-warrior.png': ((69, 43, 118, 255), (28, 18, 59, 255), (255, 208, 90), sword, (104, 229, 255)),
    'class-archer.png': ((40, 120, 111, 255), (19, 48, 61, 255), (143, 246, 190), bow, (143, 246, 190)),
    'class-mage.png': ((93, 48, 154, 255), (30, 20, 73, 255), (159, 126, 255), staff, (109, 233, 255)),
    'enemy-ghost.png': ((65, 57, 141, 255), (21, 20, 61, 255), (125, 232, 255), ghost, (169, 220, 255)),
    'enemy-skeleton.png': ((119, 88, 132, 255), (36, 25, 56, 255), (255, 220, 165), skull, (244, 229, 208)),
    'enemy-crow.png': ((75, 42, 112, 255), (18, 14, 43, 255), (203, 119, 255), wing, (177, 101, 234)),
    'boss-strike.png': ((137, 44, 60, 255), (53, 17, 38, 255), (255, 112, 92), strike, (255, 211, 104)),
    'boss-summon.png': ((100, 45, 150, 255), (32, 18, 69, 255), (198, 116, 255), summon, (242, 176, 255)),
    'boss-control.png': ((36, 107, 126, 255), (15, 39, 64, 255), (91, 231, 255), control, (101, 236, 255)),
}


def render(name, c0, c1, accent, symbol, symbol_color):
    image = rounded_panel((c0, c1), accent)
    image.alpha_composite(glow_layer(symbol, symbol_color, 46))
    d = ImageDraw.Draw(image, 'RGBA')
    symbol(d, symbol_color + (255,))
    image = image.resize((256, 256), Image.Resampling.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True)
    image.save(OUT / name, format='PNG', optimize=True)
    print(f'WROTE {(OUT / name).relative_to(ROOT)}')


if __name__ == '__main__':
    for name, values in ICONS.items():
        render(name, *values)
