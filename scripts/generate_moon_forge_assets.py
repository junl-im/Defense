from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math

ROOT = Path(__file__).resolve().parents[1]


def rgba(hex_color, alpha=255):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4)) + (alpha,)


def ellipse(draw, box, fill, outline=None, width=1):
    draw.ellipse(tuple(int(v) for v in box), fill=fill, outline=outline, width=width)


def polygon(draw, pts, fill, outline=None, width=1):
    pts = [(int(x), int(y)) for x, y in pts]
    draw.polygon(pts, fill=fill)
    if outline:
        draw.line(pts + [pts[0]], fill=outline, width=width, joint='curve')


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(tuple(int(v) for v in box), radius=int(radius), fill=fill, outline=outline, width=width)


def mascot_layer(size=768, transparent=True):
    bg = (0, 0, 0, 0) if transparent else rgba('#130924')
    im = Image.new('RGBA', (size, size), bg)
    d = ImageDraw.Draw(im, 'RGBA')
    s = size / 768
    def sc(v): return v * s
    # Moon halo and spirit ring.
    ellipse(d, [sc(92), sc(72), sc(680), sc(660)], rgba('#8eeeff', 20))
    ellipse(d, [sc(145), sc(125), sc(625), sc(605)], rgba('#ffe8a0', 28), rgba('#d9b8ff', 110), max(1, int(sc(8))))
    ellipse(d, [sc(186), sc(166), sc(584), sc(565)], rgba('#2b1746', 185), rgba('#ffd877', 145), max(1, int(sc(5))))
    # Tail flame.
    polygon(d, [(sc(555),sc(475)),(sc(670),sc(428)),(sc(625),sc(535)),(sc(695),sc(575)),(sc(576),sc(595)),(sc(530),sc(540))], rgba('#4ff4e1',210), rgba('#e1ffff',220), max(1,int(sc(7))))
    polygon(d, [(sc(579),sc(492)),(sc(638),sc(475)),(sc(609),sc(530)),(sc(645),sc(552)),(sc(586),sc(556))], rgba('#fff19a',220))
    # Shadow.
    ellipse(d, [sc(194), sc(622), sc(586), sc(694)], rgba('#05020d', 145))
    # Club behind body.
    d.line([(sc(505),sc(243)),(sc(588),sc(570))], fill=rgba('#5b2d35'), width=max(2,int(sc(38))))
    rounded(d, [sc(496),sc(206),sc(552),sc(347)], sc(22), rgba('#8a5141'), rgba('#f0b36d',140), max(1,int(sc(6))))
    # Ears and hair.
    polygon(d, [(sc(241),sc(300)),(sc(138),sc(340)),(sc(248),sc(395))], rgba('#5e2c6f'), rgba('#f2b7ff',160), max(1,int(sc(7))))
    polygon(d, [(sc(527),sc(300)),(sc(632),sc(340)),(sc(520),sc(395))], rgba('#5e2c6f'), rgba('#f2b7ff',160), max(1,int(sc(7))))
    # Body robe.
    rounded(d, [sc(218),sc(390),sc(548),sc(643)], sc(90), rgba('#392058'), rgba('#e5c9ff',120), max(1,int(sc(8))))
    polygon(d, [(sc(256),sc(420)),(sc(390),sc(365)),(sc(510),sc(430)),(sc(470),sc(620)),(sc(295),sc(620))], rgba('#5f2f86'), rgba('#ffd67b',120), max(1,int(sc(5))))
    # Belt and talisman.
    rounded(d, [sc(243),sc(505),sc(525),sc(552)], sc(18), rgba('#9a5b3b'), rgba('#f6ca75',160), max(1,int(sc(5))))
    rounded(d, [sc(355),sc(514),sc(417),sc(595)], sc(8), rgba('#f6dfa5'), rgba('#71456e'), max(1,int(sc(4))))
    d.line([(sc(386),sc(530)),(sc(386),sc(575))], fill=rgba('#bd4774'), width=max(1,int(sc(6))))
    d.line([(sc(369),sc(548)),(sc(403),sc(548))], fill=rgba('#bd4774'), width=max(1,int(sc(5))))
    # Feet.
    ellipse(d, [sc(247),sc(586),sc(365),sc(675)], rgba('#231634'), rgba('#aa8dc6',130), max(1,int(sc(6))))
    ellipse(d, [sc(409),sc(586),sc(527),sc(675)], rgba('#231634'), rgba('#aa8dc6',130), max(1,int(sc(6))))
    # Head.
    ellipse(d, [sc(203),sc(205),sc(564),sc(510)], rgba('#d49177'), rgba('#ffe2bd',130), max(1,int(sc(8))))
    # Hair cap.
    polygon(d, [(sc(212),sc(320)),(sc(229),sc(238)),(sc(297),sc(197)),(sc(392),sc(180)),(sc(492),sc(212)),(sc(555),sc(275)),(sc(548),sc(334)),(sc(496),sc(294)),(sc(445),sc(315)),(sc(384),sc(280)),(sc(326),sc(315)),(sc(270),sc(286))], rgba('#321941'), rgba('#b985cb',110), max(1,int(sc(6))))
    # Crescent horns.
    polygon(d, [(sc(283),sc(230)),(sc(206),sc(132)),(sc(317),sc(188)),(sc(339),sc(252))], rgba('#ffdc78'), rgba('#fff2b8'), max(1,int(sc(6))))
    polygon(d, [(sc(477),sc(230)),(sc(558),sc(130)),(sc(448),sc(188)),(sc(427),sc(252))], rgba('#ffdc78'), rgba('#fff2b8'), max(1,int(sc(6))))
    # Brows and eyes.
    d.arc([sc(262),sc(322),sc(350),sc(382)], start=195, end=338, fill=rgba('#3a1738'), width=max(1,int(sc(9))))
    d.arc([sc(414),sc(322),sc(502),sc(382)], start=202, end=345, fill=rgba('#3a1738'), width=max(1,int(sc(9))))
    ellipse(d, [sc(289),sc(350),sc(342),sc(414)], rgba('#1c122b'))
    ellipse(d, [sc(424),sc(350),sc(477),sc(414)], rgba('#1c122b'))
    ellipse(d, [sc(305),sc(361),sc(325),sc(386)], rgba('#8ef7ff'))
    ellipse(d, [sc(440),sc(361),sc(460),sc(386)], rgba('#8ef7ff'))
    ellipse(d, [sc(311),sc(366),sc(319),sc(375)], rgba('#ffffff'))
    ellipse(d, [sc(446),sc(366),sc(454),sc(375)], rgba('#ffffff'))
    # Nose, grin, fang.
    polygon(d, [(sc(383),sc(401)),(sc(365),sc(428)),(sc(396),sc(428))], rgba('#a86161'))
    d.arc([sc(326),sc(401),sc(445),sc(478)], start=10, end=168, fill=rgba('#5b233d'), width=max(1,int(sc(9))))
    polygon(d, [(sc(349),sc(438)),(sc(367),sc(477)),(sc(382),sc(440))], rgba('#fff5db'), rgba('#b67f83'), max(1,int(sc(3))))
    polygon(d, [(sc(406),sc(440)),(sc(422),sc(476)),(sc(438),sc(437))], rgba('#fff5db'), rgba('#b67f83'), max(1,int(sc(3))))
    # Cheeks and brow jewel.
    ellipse(d, [sc(245),sc(412),sc(305),sc(448)], rgba('#ff7c9b',72))
    ellipse(d, [sc(467),sc(412),sc(527),sc(448)], rgba('#ff7c9b',72))
    ellipse(d, [sc(365),sc(272),sc(405),sc(312)], rgba('#7ef4e7'), rgba('#fff4aa'), max(1,int(sc(4))))
    # Hand and floating coin.
    ellipse(d, [sc(181),sc(474),sc(262),sc(552)], rgba('#d49177'), rgba('#ffe2bd',120), max(1,int(sc(5))))
    ellipse(d, [sc(115),sc(426),sc(196),sc(507)], rgba('#ffd05b'), rgba('#fff3b0'), max(1,int(sc(7))))
    ellipse(d, [sc(134),sc(445),sc(177),sc(488)], rgba('#9d582d'), None)
    # Sparkles.
    for x,y,r,c in [(128,226,11,'#ffe69a'),(622,246,8,'#78f3eb'),(596,170,6,'#d5a7ff'),(178,575,7,'#78f3eb'),(657,625,9,'#ffe69a')]:
        x=sc(x);y=sc(y);r=sc(r)
        polygon(d, [(x,y-r),(x+r*.35,y-r*.35),(x+r,y),(x+r*.35,y+r*.35),(x,y+r),(x-r*.35,y+r*.35),(x-r,y),(x-r*.35,y-r*.35)], rgba(c,220))
    return im


def draw_directional_character(kind, state, angle_index, cell=256):
    im = Image.new('RGBA', (cell, cell), (0,0,0,0))
    d = ImageDraw.Draw(im, 'RGBA')
    angle = angle_index * math.tau / 11
    facing = math.sin(angle)
    depth = math.cos(angle)
    cx = cell / 2
    bob = 0
    lean = 0
    if state == 'move':
        bob = -5 if angle_index % 2 else 3
        lean = 6 * (1 if facing >= 0 else -1)
    elif state == 'attack':
        lean = 11 * (1 if facing >= 0 else -1)
    y0 = 126 + bob
    shadow_w = 66 if kind == 'ember' else 58
    ellipse(d, [cx-shadow_w/2, 211, cx+shadow_w/2, 228], (10,4,18,105))
    if kind == 'ember':
        body, dark, skin, glow, trim = rgba('#623486'), rgba('#25162f'), rgba('#d69578'), rgba('#62f3e0'), rgba('#ffd56d')
        scale = 1.0
    else:
        body, dark, skin, glow, trim = rgba('#8b2e55'), rgba('#241424'), rgba('#bb6f67'), rgba('#ff7c64'), rgba('#d7a4ff')
        scale = .93
    side = facing
    # Back flame/tail.
    flame_x = cx - side * 38
    polygon(d, [(flame_x,y0+18),(flame_x-side*25,y0+2),(flame_x-side*12,y0+33),(flame_x-side*30,y0+49),(flame_x+side*4,y0+43)], glow, rgba('#f8fff2',150), 2)
    # Legs.
    stride = 11 if state == 'move' else 3
    ellipse(d, [cx-28+stride, y0+61, cx-2+stride, y0+95], dark)
    ellipse(d, [cx+2-stride, y0+61, cx+28-stride, y0+95], dark)
    # Body and head, shifted by lean.
    rounded(d, [cx-40+lean, y0-10, cx+40+lean, y0+68], 28, body, rgba('#edd6ff',80), 3)
    ellipse(d, [cx-37+lean, y0-64, cx+37+lean, y0+2], skin, rgba('#ffe4c2',100), 3)
    # Ears / silhouette.
    ear_shift = side * 8
    polygon(d, [(cx-32+lean+ear_shift,y0-44),(cx-54+lean+ear_shift,y0-32),(cx-32+lean+ear_shift,y0-17)], body)
    polygon(d, [(cx+32+lean+ear_shift,y0-44),(cx+54+lean+ear_shift,y0-32),(cx+32+lean+ear_shift,y0-17)], body)
    # Horns.
    horn_spread = 18 + abs(side)*5
    polygon(d, [(cx-horn_spread+lean,y0-58),(cx-horn_spread-12+lean,y0-92),(cx-horn_spread+7+lean,y0-68)], trim, rgba('#fff4c6',160), 2)
    polygon(d, [(cx+horn_spread+lean,y0-58),(cx+horn_spread+12+lean,y0-92),(cx+horn_spread-7+lean,y0-68)], trim, rgba('#fff4c6',160), 2)
    # Face details: visibility changes by direction.
    face_offset = side * 8
    eye_sep = max(4, 12 * (1 - abs(side)*.55))
    for sign in (-1, 1):
        ex = cx + lean + face_offset + sign*eye_sep
        ellipse(d, [ex-4, y0-37, ex+4, y0-27], dark)
        ellipse(d, [ex-1.8, y0-35, ex+1.8, y0-31], glow)
    d.arc([cx-12+lean+face_offset, y0-27, cx+12+lean+face_offset, y0-9], 12, 168, fill=dark, width=3)
    # Belt/talisman.
    rounded(d, [cx-34+lean,y0+30,cx+34+lean,y0+43], 5, rgba('#9a5b3b'))
    rounded(d, [cx-8+lean,y0+35,cx+8+lean,y0+63], 3, rgba('#f6dda0'), rgba('#6f3a67'), 2)
    # Weapon/attack readable silhouette.
    hand_x = cx + lean + (30 if side >= 0 else -30)
    if state == 'attack':
        end_x = cx + (75 if side >= 0 else -75)
        end_y = y0 - 70
        d.line([(hand_x,y0+8),(end_x,end_y)], fill=dark, width=9)
        ellipse(d, [end_x-13,end_y-18,end_x+13,end_y+8], trim, rgba('#fff2b2',120), 3)
        ellipse(d, [end_x-24,end_y-29,end_x+24,end_y+19], rgba('#ffaf5b',55), None)
    else:
        d.line([(hand_x,y0+8),(hand_x + side*12,y0+58)], fill=dark, width=8)
        ellipse(d, [hand_x+side*12-9,y0+48,hand_x+side*12+9,y0+67], trim)
    # Motion streaks.
    if state == 'move':
        for off in (-14, 0, 14):
            d.line([(cx-side*55,y0+25+off),(cx-side*78,y0+25+off)], fill=rgba('#8ef4ff',95), width=3)
    if state == 'attack':
        d.arc([cx-88,y0-105,cx+88,y0+72], 205 if side>=0 else 25, 334 if side>=0 else 154, fill=rgba('#ffe27a',130), width=5)
    return im


def make_atlas(kind, state, path):
    cell = 256
    atlas = Image.new('RGBA', (cell*4, cell*3), (0,0,0,0))
    for i in range(11):
        frame = draw_directional_character(kind, state, i, cell)
        atlas.alpha_composite(frame, ((i % 4)*cell, (i // 4)*cell))
    atlas.save(path, 'WEBP', quality=88, method=6)


def make_cover(mascot):
    w,h=1200,630
    im=Image.new('RGB',(w,h),rgba('#0d071b')[:3])
    d=ImageDraw.Draw(im,'RGBA')
    # Moon market backdrop.
    for y in range(h):
        t=y/h
        col=(int(18+35*t),int(8+12*t),int(38+25*t))
        d.line([(0,y),(w,y)],fill=col)
    ellipse(d,[760,50,1080,370],rgba('#ffe29a',225))
    ellipse(d,[835,80,1105,350],rgba('#2b1746',180))
    for i in range(42):
        x=(i*137)%w; y=35+(i*83)%(h-210); r=2+(i%3)
        ellipse(d,[x-r,y-r,x+r,y+r],rgba('#ffe195',150))
    # Market roof silhouettes.
    for i in range(8):
        x=i*165-35
        polygon(d,[(x,430),(x+65,370),(x+145,430)],rgba('#572649',220))
        rounded(d,[x+15,430,x+130,570],8,rgba('#201126',235))
        ellipse(d,[x+28,415,x+49,436],rgba('#ffb14f',240))
        ellipse(d,[x+95,415,x+116,436],rgba('#ffb14f',240))
    # Sacred tree silhouette.
    rounded(d,[570,248,645,555],28,rgba('#24132f',245))
    for box in [(440,190,720,390),(360,240,570,415),(610,225,805,410)]:
        ellipse(d,box,rgba('#4d2369',225))
    # Mascot.
    m=mascot.resize((500,500),Image.Resampling.LANCZOS)
    im.paste(m,(30,78),m)
    return im


def main():
    mascot=mascot_layer(768,True)
    mascot_path=ROOT/'src/assets/moon-mascot-v1.webp'
    mascot.save(mascot_path,'WEBP',quality=92,method=6)
    for kind, folder in [('ember','guardian'),('imp','monster')]:
        for state in ('idle','move','attack'):
            out=ROOT/f'public/assets/impostors/{folder}/{kind}-{state}-11.webp'
            out.parent.mkdir(parents=True,exist_ok=True)
            make_atlas(kind,state,out)
    icon=mascot_layer(512,False)
    icon.save(ROOT/'public/icon-512.png','PNG',optimize=True)
    icon.resize((192,192),Image.Resampling.LANCZOS).save(ROOT/'public/icon-192.png','PNG',optimize=True)
    mask=Image.new('RGBA',(512,512),rgba('#211235'))
    inner=mascot_layer(430,True)
    mask.alpha_composite(inner,(41,41))
    mask.save(ROOT/'public/icon-maskable-512.png','PNG',optimize=True)
    make_cover(mascot).save(ROOT/'public/cover.webp','WEBP',quality=88,method=6)
    print('generated Moon Forge v2.3 assets')

if __name__=='__main__':
    main()
