from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import random, hashlib, math

OUT=Path('public/assets/ui/v2_26')
OUT.mkdir(parents=True, exist_ok=True)

def rnd(name): return random.Random(int(hashlib.md5(name.encode()).hexdigest()[:10],16))
def clamp(v): return max(0,min(255,int(v)))
def mix(a,b,t): return tuple(clamp(a[i]*(1-t)+b[i]*t) for i in range(4))
GOLD=(255,219,126,255); PEARL=(255,249,229,255); SKY=(127,219,255,255); ROSE=(255,143,183,255); MINT=(137,232,184,255); VIOLET=(168,145,255,255); INK=(30,48,104,255)
PALETTE=[GOLD,PEARL,SKY,ROSE,MINT,VIOLET]

def noise_layer(size, alpha=22, seed=0):
    n=Image.effect_noise(size, 55).convert('L')
    n=n.point(lambda p: int((p/255)*alpha))
    img=Image.new('RGBA', size, (255,255,255,0)); img.putalpha(n)
    return img.filter(ImageFilter.GaussianBlur(0.55))

def gradient(size, top, bottom):
    w,h=size; img=Image.new('RGBA',size)
    d=ImageDraw.Draw(img)
    step=max(1,h//90)
    for y in range(0,h,step):
        t=y/max(1,h-1); d.rectangle((0,y,w,y+step), fill=mix(top,bottom,t))
    return img

def star(cx,cy,r1,r2,n=5):
    return [(cx+math.cos(-math.pi/2+i*math.pi/n)*(r1 if i%2==0 else r2), cy+math.sin(-math.pi/2+i*math.pi/n)*(r1 if i%2==0 else r2)) for i in range(n*2)]

def sparkles(img,name,count):
    r=rnd(name+'spark'); d=ImageDraw.Draw(img); w,h=img.size
    for i in range(count):
        x=r.randint(6,max(7,w-6)); y=r.randint(6,max(7,h-6)); rad=r.uniform(2,6)
        c=PALETTE[(i+r.randint(0,5))%len(PALETTE)]
        d.polygon(star(x,y,rad,rad*.4,5), fill=(c[0],c[1],c[2],r.randint(60,150)))
        if i%3==0: d.ellipse((x-rad,y-rad,x+rad,y+rad), outline=(255,255,255,70), width=1)

def trim(img, radius=26):
    d=ImageDraw.Draw(img); w,h=img.size
    for i,a in enumerate([200,160,115,75]):
        d.rounded_rectangle((4+i*2,4+i*2,w-5-i*2,h-5-i*2), radius=max(2,radius-i*2), outline=(255,232,151,a), width=2)
    d.rounded_rectangle((17,15,w-18,h-17), radius=max(2,radius-11), outline=(255,255,255,70), width=1)

def make_bg(name,size,mood):
    colors={
        'login':((31,63,134,255),(205,232,255,255)),
        'lobby':((45,75,139,255),(255,226,181,255)),
        'world':((35,72,148,255),(187,236,210,255)),
        'battle':((29,36,74,255),(120,90,145,255)),
    }
    img=gradient(size,*colors[mood]); d=ImageDraw.Draw(img,'RGBA'); r=rnd(name)
    for i in range(18):
        x=r.randint(-120,size[0]+120); y=r.randint(-40,size[1]+60); rx=r.randint(120,360); ry=r.randint(42,150); c=PALETTE[i%len(PALETTE)]
        for j in range(4,0,-1): d.ellipse((x-rx*j/4,y-ry*j/4,x+rx*j/4,y+ry*j/4), fill=(c[0],c[1],c[2],10+j*4))
    for i in range(36):
        x=r.randint(-60,size[0]); y=r.randint(0,size[1]); d.arc((x,y,x+r.randint(100,290),y+r.randint(40,150)), 190, 345, fill=(255,255,255,r.randint(18,55)), width=r.randint(1,3))
    img=Image.alpha_composite(img, noise_layer(size, 24, 1)); sparkles(img,name,60)
    return img.filter(ImageFilter.UnsharpMask(radius=1, percent=40, threshold=3))

def make_frame(name,size):
    w,h=size; img=Image.new('RGBA',size,(0,0,0,0)); d=ImageDraw.Draw(img,'RGBA')
    d.rounded_rectangle((12,16,w-12,h-6), radius=min(w,h)//5, fill=(15,23,58,70))
    body=gradient(size,(255,249,232,225),(197,230,255,195)); mask=Image.new('L',size,0); ImageDraw.Draw(mask).rounded_rectangle((4,4,w-5,h-11), radius=min(w,h)//5, fill=255); body.putalpha(mask)
    img.alpha_composite(body); trim(img, min(w,h)//5)
    for x,y in [(24,24),(w-25,24),(24,h-28),(w-25,h-28)]: d.polygon(star(x,y,11,4,6), fill=(255,255,255,105))
    sparkles(img,name,10); return img

def make_button(name,size):
    w,h=size; img=Image.new('RGBA',size,(0,0,0,0)); d=ImageDraw.Draw(img,'RGBA')
    is_gold='gold' in name or 'start' in name
    base=(255,218,116,230) if is_gold else (244,250,255,225)
    d.rounded_rectangle((6,10,w-6,h-7), radius=h//2, fill=(13,24,58,70))
    d.rounded_rectangle((4,4,w-4,h-13), radius=h//2, fill=base, outline=(255,255,255,160), width=3)
    d.rounded_rectangle((16,10,w-16,h//2), radius=h//3, fill=(255,255,255,82))
    trim(img,h//2); sparkles(img,name,8); return img

def make_icon(name,size):
    w,h=size; img=Image.new('RGBA',size,(0,0,0,0)); d=ImageDraw.Draw(img,'RGBA'); r=rnd(name); c=PALETTE[r.randrange(len(PALETTE))]
    pad=max(3,int(min(w,h)*0.10)); d.ellipse((pad,pad+2,w-pad,h-pad), fill=(11,22,55,64)); d.ellipse((pad,pad,w-pad,h-pad-4), fill=(c[0],c[1],c[2],186), outline=(255,255,255,150), width=max(1,w//24)); d.ellipse((pad*2,pad*2,w-pad*2,max(pad*2+1,h//2)), fill=(255,255,255,80))
    if 'ring' in name or 'stage' in name: d.ellipse((w*.22,h*.22,w*.78,h*.78), outline=(255,255,255,190), width=max(2,w//14))
    elif 'coin' in name or 'gold' in name: d.ellipse((w*.28,h*.25,w*.72,h*.72), fill=(255,224,85,225), outline=(113,80,34,130), width=3)
    elif 'gem' in name or 'crystal' in name: d.polygon([(w/2,h*.18),(w*.76,h*.35),(w*.66,h*.75),(w/2,h*.86),(w*.34,h*.75),(w*.24,h*.35)], fill=(137,225,255,220), outline=(57,76,142,140))
    elif 'lock' in name: d.rounded_rectangle((w*.28,h*.44,w*.72,h*.78), radius=w//10, fill=(98,82,136,220), outline=(255,255,255,135), width=2); d.arc((w*.3,h*.18,w*.7,h*.58),180,360,fill=(255,225,132,210),width=max(3,w//10))
    elif 'heart' in name: d.ellipse((w*.28,h*.3,w*.5,h*.54), fill=(255,113,151,220)); d.ellipse((w*.5,h*.3,w*.72,h*.54), fill=(255,113,151,220)); d.polygon([(w*.26,h*.43),(w*.74,h*.43),(w*.5,h*.75)], fill=(255,113,151,220))
    else: d.polygon(star(w/2,h/2,min(w,h)*.27,min(w,h)*.12,6), fill=(255,255,255,185), outline=(70,67,120,95))
    sparkles(img,name,5); return img

def make_mascot(name,size):
    w,h=size; img=Image.new('RGBA',size,(0,0,0,0)); d=ImageDraw.Draw(img,'RGBA'); r=rnd(name); body=PALETTE[r.randrange(len(PALETTE))]
    d.ellipse((w*.14,h*.70,w*.86,h*.93), fill=(15,23,58,55))
    if 'fox' in name or 'cat' in name: d.polygon([(w*.27,h*.36),(w*.34,h*.09),(w*.46,h*.38)], fill=body, outline=(74,64,102,120)); d.polygon([(w*.73,h*.36),(w*.66,h*.09),(w*.54,h*.38)], fill=body, outline=(74,64,102,120))
    elif 'deer' in name: d.line((w*.34,h*.35,w*.24,h*.12), fill=(136,96,55,210), width=max(3,w//22)); d.line((w*.66,h*.35,w*.76,h*.12), fill=(136,96,55,210), width=max(3,w//22))
    else: d.ellipse((w*.2,h*.18,w*.38,h*.38), fill=body); d.ellipse((w*.62,h*.18,w*.8,h*.38), fill=body)
    d.ellipse((w*.24,h*.28,w*.76,h*.78), fill=body, outline=(74,64,102,120), width=2); d.ellipse((w*.36,h*.52,w*.64,h*.82), fill=(255,246,228,165))
    d.ellipse((w*.38,h*.47,w*.46,h*.55), fill=(34,45,92,220)); d.ellipse((w*.54,h*.47,w*.62,h*.55), fill=(34,45,92,220)); d.arc((w*.43,h*.55,w*.57,h*.68),20,160,fill=(93,60,91,190),width=2)
    d.rounded_rectangle((w*.34,h*.72,w*.66,h*.88), radius=w//12, fill=(255,225,130,165), outline=(255,255,255,110), width=2); sparkles(img,name,7); return img

def make_route(name,size):
    w,h=size; img=Image.new('RGBA',size,(0,0,0,0)); d=ImageDraw.Draw(img,'RGBA'); pts=[(i,h/2+math.sin(i/18)*h*.14) for i in range(0,w,8)]
    for ww,c in [(16,(20,26,65,40)),(10,(255,230,145,120)),(5,(132,220,255,145)),(2,(255,255,255,135))]: d.line(pts, fill=c, width=max(1,min(ww,h//2)), joint='curve')
    for i,(x,y) in enumerate(pts[2::5]): d.ellipse((x-3,y-3,x+3,y+3), fill=(255,255,255,135))
    return img

def make_ring(name,size):
    w,h=size; img=Image.new('RGBA',size,(0,0,0,0)); d=ImageDraw.Draw(img,'RGBA'); c=min(w,h)/2
    for rr,col in [(c*.86,(12,20,55,45)),(c*.75,(255,222,120,150)),(c*.62,(255,255,255,125)),(c*.45,(135,225,255,95))]: d.ellipse((w/2-rr,h/2-rr,w/2+rr,h/2+rr), outline=col, width=max(2,int(c*.08)))
    for i in range(8):
        a=i*math.pi/4; x=w/2+math.cos(a)*c*.76; y=h/2+math.sin(a)*c*.76; d.polygon(star(x,y,c*.12,c*.05,5), fill=(255,255,255,130))
    return img

def make_overlay(name,size):
    img=Image.new('RGBA',size,(0,0,0,0)); d=ImageDraw.Draw(img,'RGBA'); r=rnd(name)
    for i in range(12):
        c=PALETTE[i%len(PALETTE)]; x=r.randint(-40,size[0]+40); y=r.randint(-30,size[1]+30); rx=r.randint(70,max(80,size[0]//2)); ry=r.randint(28,max(40,size[1]//2))
        d.ellipse((x-rx,y-ry,x+rx,y+ry), fill=(c[0],c[1],c[2],r.randint(12,28)))
    sparkles(img,name,24); return img.filter(ImageFilter.GaussianBlur(.45))

def make_asset(name,kind,size,mood):
    if kind=='bg': return make_bg(name,size,mood)
    if kind=='frame': return make_frame(name,size)
    if kind=='button': return make_button(name,size)
    if kind=='mascot': return make_mascot(name,size)
    if kind=='route': return make_route(name,size)
    if kind=='ring': return make_ring(name,size)
    if kind=='overlay': return make_overlay(name,size)
    return make_icon(name,size)

core=[
('login_atelier_bg','bg',(960,540),'login'),('login_lacquer_card','frame',(492,318),'login'),('login_glass_title_plaque','frame',(364,132),'login'),('login_prismatic_rays','overlay',(760,260),'login'),('login_start_button_gold','button',(306,74),'login'),('login_cloud_button_pearl','button',(306,74),'login'),('login_small_button_ivory','button',(150,50),'login'),('login_left_gold_filigree','icon',(138,138),'login'),('login_right_gold_filigree','icon',(138,138),'login'),('login_mascot_fox_duke','mascot',(132,132),'login'),('login_mascot_deer_mage','mascot',(132,132),'login'),('login_latency_shield_badge','icon',(54,54),'login'),('login_local_save_badge','icon',(54,54),'login'),('login_micro_gloss_divider','route',(238,34),'login'),
('lobby_atelier_bg','bg',(960,540),'lobby'),('lobby_royal_header_banner','frame',(480,118),'lobby'),('lobby_velvet_nav_frame','frame',(744,96),'lobby'),('lobby_profile_glass_panel','frame',(188,80),'lobby'),('lobby_resource_star_relic','icon',(92,52),'lobby'),('lobby_resource_coin_relic','icon',(92,52),'lobby'),('lobby_resource_gem_relic','icon',(92,52),'lobby'),('lobby_shop_gilded_stall','icon',(70,70),'lobby'),('lobby_quest_illuminated_book','icon',(70,70),'lobby'),('lobby_mail_crystal_bird','icon',(60,60),'lobby'),('lobby_event_moon_lantern','icon',(60,60),'lobby'),('lobby_npc_raccoon_curator','mascot',(90,90),'lobby'),('lobby_npc_rabbit_cartographer','mascot',(90,90),'lobby'),('lobby_perf_budget_badge','icon',(44,44),'lobby'),
('world_atlas_bg','bg',(960,540),'world'),('world_preview_oil_frame','frame',(340,262),'world'),('world_stage_gem_ring','ring',(84,84),'world'),('world_route_aurora_thread','route',(142,42),'world'),('world_boss_aurora_gate','icon',(100,96),'world'),('world_lock_velvet_seal','icon',(32,32),'world'),('world_reward_crystal_bloom','icon',(34,34),'world'),('world_selected_crown_glow','icon',(36,36),'world'),('world_cloud_chapter_panel','frame',(250,82),'world'),('world_compass_enamel','icon',(66,66),'world'),('world_chapter_badge','frame',(300,64),'world'),('world_mist_watercolor','overlay',(260,130),'world'),('world_island_soft_shadow','icon',(90,50),'world'),('world_node_crown_micro','icon',(28,28),'world'),
('battle_painterly_overlay','overlay',(960,540),'battle'),('battle_top_hud_lacquer','frame',(790,70),'battle'),('battle_bottom_skill_bar','frame',(724,92),'battle'),('battle_side_vine_left','frame',(80,286),'battle'),('battle_side_vine_right','frame',(80,286),'battle'),('battle_skill_meteor_card','frame',(136,66),'battle'),('battle_skill_guard_card','frame',(136,66),'battle'),('battle_skill_hero_card','frame',(136,66),'battle'),('battle_combo_crystal_badge','icon',(44,44),'battle'),('battle_boss_cut_warning','icon',(48,48),'battle'),('battle_mana_lacquer_drop','icon',(38,38),'battle'),('battle_safe_corner_left','frame',(112,76),'battle'),('battle_safe_corner_right','frame',(112,76),'battle'),('battle_frame_budget_badge','icon',(30,30),'battle')]

gallery=[]
for group,mood,count in [('login','login',14),('lobby','lobby',18),('world','world',16),('battle','battle',18),('shared','lobby',16)]:
    for i in range(count):
        kind=(['icon','frame','route','ring','mascot','overlay'] if group!='shared' else ['icon','frame','route','overlay'])[i% (6 if group!='shared' else 4)]
        if kind=='frame': size=(172+(i%4)*34,68+(i%3)*24)
        elif kind=='route': size=(128+(i%5)*16,34+(i%3)*4)
        elif kind=='ring': size=(58+(i%3)*12,58+(i%3)*12)
        elif kind=='mascot': size=(76+(i%3)*12,76+(i%3)*12)
        elif kind=='overlay': size=(220+(i%4)*40,110+(i%3)*28)
        else: size=(54+(i%4)*8,54+(i%4)*8)
        gallery.append((f'{group}_gallery_masterpiece_{i+1:02d}',kind,size,mood))

assets=core+gallery
for name,kind,size,mood in assets:
    img=make_asset(name,kind,size,mood)
    img.save(OUT/f'{name}_v2_26.png', compress_level=3)
    img.save(OUT/f'{name}_v2_26.webp','WEBP',quality=82,method=3)
print(len(assets))
