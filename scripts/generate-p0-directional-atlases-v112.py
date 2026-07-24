from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import numpy as np
import trimesh
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

DIRECTIONS = 11
STATES = ("idle", "move", "attack", "skill", "hit", "death")
ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = ROOT / "public/assets/visual-v112/directional"
MANIFEST_PATH = OUTPUT_ROOT / "p0-directional-manifest-v112.json"
RELEASE_VERSION = "1.0.12"
BUILD_ID = "b24.12"
ASSET_JOBS = (
    {"id": "hero-warrior", "actor": "hero-warrior", "model": "public/assets/models/player-dokkaebi-warrior-golden-v1.glb", "cell": 160},
    {"id": "guardian-ember", "actor": "guardian-ember", "model": "public/assets/models/guardian-ember-sd-toon.glb", "cell": 160},
    {"id": "monster-imp", "actor": "monster-imp", "model": "public/assets/models/monster-imp-sd-toon.glb", "cell": 160},
    {"id": "boss-tiger", "actor": "boss-tiger", "model": "public/assets/models/boss-tiger-sd-toon.glb", "cell": 184},
)

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

@dataclass
class Part:
    name: str
    node: str
    material: str
    vertices: np.ndarray
    faces: np.ndarray
    color: np.ndarray
    emissive: np.ndarray


def normalize(v: np.ndarray) -> np.ndarray:
    n = np.linalg.norm(v)
    return v / n if n > 1e-9 else v


def rot_x(a: float) -> np.ndarray:
    c, s = math.cos(a), math.sin(a)
    return np.array([[1,0,0],[0,c,-s],[0,s,c]], dtype=float)


def rot_y(a: float) -> np.ndarray:
    c, s = math.cos(a), math.sin(a)
    return np.array([[c,0,s],[0,1,0],[-s,0,c]], dtype=float)


def rot_z(a: float) -> np.ndarray:
    c, s = math.cos(a), math.sin(a)
    return np.array([[c,-s,0],[s,c,0],[0,0,1]], dtype=float)


def rotation_xyz(rx=0.0, ry=0.0, rz=0.0) -> np.ndarray:
    return rot_z(rz) @ rot_y(ry) @ rot_x(rx)


def transform_points(v: np.ndarray, pivot=(0,0,0), rotation=(0,0,0), translate=(0,0,0), scale=(1,1,1)) -> np.ndarray:
    p = np.asarray(pivot, dtype=float)
    t = np.asarray(translate, dtype=float)
    s = np.asarray(scale, dtype=float)
    out = (v - p) * s
    out = out @ rotation_xyz(*rotation).T
    return out + p + t


def material_color(material) -> tuple[np.ndarray, np.ndarray]:
    main = getattr(material, "main_color", None)
    if main is None:
        base = np.array([190, 190, 205, 255], dtype=np.uint8)
    else:
        base = np.array(main, dtype=np.uint8)
        if base.size == 3:
            base = np.r_[base, 255]
    emissive = np.array(getattr(material, "emissiveFactor", [0,0,0]), dtype=float)
    if emissive.max(initial=0) <= 1.0:
        emissive *= 255
    return base, emissive


def load_parts(path: Path) -> tuple[list[Part], dict]:
    scene = trimesh.load(path, force="scene")
    parts: list[Part] = []
    for mesh in scene.dump(concatenate=False):
        mat = getattr(mesh.visual, "material", None)
        base, emissive = material_color(mat)
        parts.append(Part(
            name=str(mesh.metadata.get("name") or "mesh"),
            node=str(mesh.metadata.get("node") or mesh.metadata.get("name") or "mesh"),
            material=str(getattr(mat, "name", "material") or "material"),
            vertices=np.asarray(mesh.vertices, dtype=float),
            faces=np.asarray(mesh.faces, dtype=np.int32),
            color=base,
            emissive=emissive,
        ))
    all_v = np.concatenate([p.vertices for p in parts], axis=0)
    bounds = np.array([all_v.min(axis=0), all_v.max(axis=0)])
    center = np.array([(bounds[0,0]+bounds[1,0])/2, bounds[0,1], (bounds[0,2]+bounds[1,2])/2])
    for p in parts:
        p.vertices = p.vertices - center
    all_v = np.concatenate([p.vertices for p in parts], axis=0)
    bounds = np.array([all_v.min(axis=0), all_v.max(axis=0)])
    return parts, {
        "bounds": bounds,
        "height": float(bounds[1,1]-bounds[0,1]),
        "width": float(bounds[1,0]-bounds[0,0]),
        "depth": float(bounds[1,2]-bounds[0,2]),
    }


def semantic(part: Part, actor: str) -> str:
    node = part.node.lower()
    name = part.name.lower()
    mat = part.material.lower()
    token = f"{node} {name} {mat}"
    if actor == "hero-warrior":
        m = re.search(r"_(\d+)$", name)
        idx = int(m.group(1)) if m else 0
        if "wood_club" in mat or idx in (23,24): return "weapon_r"
        if idx in (15,17): return "arm_l"
        if idx in (16,18): return "arm_r"
        if idx in (19,21): return "leg_l"
        if idx in (20,22): return "leg_r"
        if idx in (2,3,4,5,6,7,8,9,10,11,12): return "head"
        if idx == 25: return "aura"
        return "body"
    if actor == "boss-tiger":
        if "frontleg0" in token or "frontpaw0" in token: return "front_l"
        if "frontleg1" in token or "frontpaw1" in token: return "front_r"
        if "backleg0" in token or "backpaw0" in token: return "back_l"
        if "backleg1" in token or "backpaw1" in token: return "back_r"
        if any(k in token for k in ("head", "muzzle", "nose", "eye", "ear", "mane", "weapon")): return "head"
        if any(k in token for k in ("halo", "signature")): return "aura"
        if "tail" in token: return "tail"
        return "body"
    if any(k in token for k in ("weapon", "signature", "flamecore")): return "weapon_r"
    if "armr" in token or "handr" in token or "shoulderr" in token: return "arm_r"
    if "arml" in token or "handl" in token or "shoulderl" in token: return "arm_l"
    if "legr" in token or "footr" in token: return "leg_r"
    if "legl" in token or "footl" in token: return "leg_l"
    if any(k in token for k in ("head", "eye", "ear", "horn", "mask")): return "head"
    if any(k in token for k in ("halo", "talisman")): return "aura"
    if "tail" in token: return "tail"
    return "body"


def actor_palette(actor: str) -> dict:
    return {
        "hero-warrior": {"accent": (255,166,54), "secondary": (101,206,255), "outline": (24,12,31), "hit": (255,82,101)},
        "guardian-ember": {"accent": (255,115,41), "secondary": (255,213,90), "outline": (31,13,22), "hit": (255,76,92)},
        "monster-imp": {"accent": (236,74,76), "secondary": (166,255,105), "outline": (20,14,24), "hit": (255,56,79)},
        "boss-tiger": {"accent": (255,70,42), "secondary": (181,60,255), "outline": (25,8,19), "hit": (255,45,63)},
    }[actor]


def apply_pose(part: Part, actor: str, state: str, phase: float = 0.0) -> np.ndarray:
    v = part.vertices.copy()
    role = semantic(part, actor)
    # Stable state poses. Pivots are relative to each model's normalized floor.
    if actor == "boss-tiger":
        if state == "move":
            if role in ("front_l", "back_r"):
                v = transform_points(v, pivot=(0,0.55,0), rotation=(math.radians(16),0,0), translate=(0,0.02,0.12))
            elif role in ("front_r", "back_l"):
                v = transform_points(v, pivot=(0,0.55,0), rotation=(math.radians(-14),0,0), translate=(0,0.0,-0.06))
            elif role in ("body","head","tail"):
                v = transform_points(v, pivot=(0,0.9,0), rotation=(math.radians(-4),0,0), translate=(0,0.02,0.08))
        elif state == "attack":
            if role in ("front_l","front_r"):
                side = -1 if role.endswith("l") else 1
                v = transform_points(v, pivot=(side*.52,.65,.45), rotation=(math.radians(-32),0,math.radians(side*8)), translate=(0,.12,.35))
            elif role in ("body","head","tail"):
                v = transform_points(v, pivot=(0,1.0,0), rotation=(math.radians(-8),0,0), translate=(0,.02,.32))
        elif state == "skill":
            if role == "head":
                v = transform_points(v, pivot=(0,1.55,.55), rotation=(math.radians(14),0,0), translate=(0,.16,.02), scale=(1.04,1.04,1.04))
            elif role in ("body","tail"):
                v = transform_points(v, pivot=(0,.8,0), rotation=(math.radians(4),0,0), translate=(0,.06,0), scale=(1.03,1.06,1.03))
        elif state == "hit":
            v = transform_points(v, pivot=(0,.9,0), rotation=(math.radians(5),0,math.radians(-8)), translate=(-.12,.03,-.18), scale=(.96,1.03,.96))
        elif state == "death":
            v = transform_points(v, pivot=(0,.42,0), rotation=(0,math.radians(-9),math.radians(76)), translate=(-.28,-.08,0), scale=(1.0,.92,1.0))
        return v

    # Humanoid / imp / guardian / hero
    shoulder_l = (-.52,1.18,0.02)
    shoulder_r = (.52,1.18,0.02)
    hip_l = (-.24,.48,0)
    hip_r = (.24,.48,0)
    if actor == "hero-warrior":
        shoulder_l, shoulder_r = (-.5,1.3,0), (.5,1.3,0)
        hip_l, hip_r = (-.24,.45,0), (.24,.45,0)

    if state == "move":
        if role == "arm_l": v = transform_points(v, shoulder_l, (math.radians(22),0,math.radians(-5)), (0,.02,.04))
        elif role in ("arm_r","weapon_r"): v = transform_points(v, shoulder_r, (math.radians(-22),0,math.radians(5)), (0,0,-.03))
        elif role == "leg_l": v = transform_points(v, hip_l, (math.radians(-19),0,0), (0,.03,.05))
        elif role == "leg_r": v = transform_points(v, hip_r, (math.radians(19),0,0), (0,.01,-.04))
        elif role in ("body","head","aura","tail"): v = transform_points(v, (0,.9,0), (math.radians(-3),0,math.radians(-2)), (0,.045,.08), (1.02,.985,1.0))
    elif state == "attack":
        if role in ("arm_r","weapon_r"):
            v = transform_points(v, shoulder_r, (math.radians(-36),math.radians(18),math.radians(-58)), (.08,.16,.24))
        elif role == "arm_l":
            v = transform_points(v, shoulder_l, (math.radians(14),math.radians(-8),math.radians(22)), (-.02,.03,.08))
        elif role in ("body","head","aura","tail"):
            v = transform_points(v, (0,.9,0), (math.radians(-4),math.radians(10),math.radians(-7)), (.08,.03,.18), (1.04,.98,1.0))
        elif role == "leg_r": v = transform_points(v, hip_r, (math.radians(-8),0,math.radians(-4)), (.04,0,.02))
    elif state == "skill":
        if role in ("arm_r","weapon_r"):
            v = transform_points(v, shoulder_r, (math.radians(-10),0,math.radians(-78)), (.02,.28,.02))
        elif role == "arm_l":
            v = transform_points(v, shoulder_l, (math.radians(-8),0,math.radians(72)), (-.02,.25,.02))
        elif role in ("body","head","aura","tail"):
            v = transform_points(v, (0,.8,0), (math.radians(3),0,0), (0,.14,0), (1.05,1.06,1.05))
    elif state == "hit":
        if role == "arm_l": v = transform_points(v, shoulder_l, (0,0,math.radians(-20)), (-.08,.02,-.06))
        elif role in ("arm_r","weapon_r"): v = transform_points(v, shoulder_r, (0,0,math.radians(22)), (.08,0,-.08))
        else: v = transform_points(v, (0,.85,0), (math.radians(5),0,math.radians(8)), (-.11,.02,-.12), (.96,1.04,.96))
    elif state == "death":
        v = transform_points(v, (0,.38,0), (0,math.radians(-5),math.radians(82)), (-.34,-.08,0), (1.0,.9,1.0))
    return v


def render_vfx(layer: Image.Image, actor: str, state: str, direction: int, cell: int, behind: bool) -> None:
    pal = actor_palette(actor)
    accent = pal["accent"]
    secondary = pal["secondary"]
    d = ImageDraw.Draw(layer, "RGBA")
    cx, cy = cell//2, int(cell*.72)
    theta = direction / DIRECTIONS * math.tau
    dx, dy = math.sin(theta), math.cos(theta)
    if behind:
        if state in ("idle","skill"):
            ring = Image.new("RGBA", layer.size, (0,0,0,0)); rd=ImageDraw.Draw(ring,"RGBA")
            box=(int(cell*.16),int(cell*.68),int(cell*.84),int(cell*.89))
            rd.ellipse(box, outline=(*secondary, 88 if state=="idle" else 145), width=max(1,cell//80))
            ring=ring.filter(ImageFilter.GaussianBlur(max(1,cell/90)))
            layer.alpha_composite(ring)
        if state == "move":
            for i in range(3):
                ox=(i-1)*cell*.06
                y=cell*(.48+i*.09)
                length=cell*(.16+i*.035)
                x1=cx-dx*length+ox; x2=cx+dx*cell*.03+ox
                d.line((x1,y+dy*cell*.05,x2,y), fill=(*secondary,90-i*18), width=max(1,int(cell*.018)))
        if state == "skill":
            glow=Image.new("RGBA",layer.size,(0,0,0,0));gd=ImageDraw.Draw(glow,"RGBA")
            for r,a in ((.34,40),(.27,72),(.20,95)):
                rr=cell*r;gd.ellipse((cx-rr,cy-rr*.38,cx+rr,cy+rr*.38),fill=(*accent,a))
            glow=glow.filter(ImageFilter.GaussianBlur(cell*.055));layer.alpha_composite(glow)
        return

    # Foreground effects.
    if state == "attack":
        fx=Image.new("RGBA",layer.size,(0,0,0,0));fd=ImageDraw.Draw(fx,"RGBA")
        bbox=(int(cell*.12),int(cell*.14),int(cell*.91),int(cell*.88))
        start=205 + direction*3
        fd.arc(bbox,start=start,end=start+105,fill=(*accent,210),width=max(2,int(cell*.055)))
        fd.arc((bbox[0]+4,bbox[1]+4,bbox[2]-4,bbox[3]-4),start=start+5,end=start+88,fill=(255,244,189,230),width=max(1,int(cell*.018)))
        blur=fx.filter(ImageFilter.GaussianBlur(cell*.018));layer.alpha_composite(blur);layer.alpha_composite(fx)
    elif state == "skill":
        fx=Image.new("RGBA",layer.size,(0,0,0,0));fd=ImageDraw.Draw(fx,"RGBA")
        for i in range(7):
            a=theta+i*math.tau/7
            r=cell*(.29+.035*(i%2)); x=cx+math.cos(a)*r; y=cell*.47+math.sin(a)*r*.72
            rr=max(1,int(cell*(.014+.006*(i%3))))
            fd.ellipse((x-rr,y-rr,x+rr,y+rr),fill=(*(accent if i%2==0 else secondary),200))
        fd.ellipse((cell*.18,cell*.19,cell*.82,cell*.83),outline=(*secondary,155),width=max(1,int(cell*.024)))
        glow=fx.filter(ImageFilter.GaussianBlur(cell*.035));layer.alpha_composite(glow);layer.alpha_composite(fx)
    elif state == "hit":
        fx=Image.new("RGBA",layer.size,(0,0,0,0));fd=ImageDraw.Draw(fx,"RGBA")
        impact=(cell*.31,cell*.46)
        for i in range(8):
            a=i*math.tau/8; r=cell*(.07+.035*(i%3)); x2=impact[0]+math.cos(a)*r; y2=impact[1]+math.sin(a)*r
            fd.line((impact[0],impact[1],x2,y2),fill=(*pal["hit"],190),width=max(1,int(cell*.016)))
        glow=fx.filter(ImageFilter.GaussianBlur(cell*.025));layer.alpha_composite(glow);layer.alpha_composite(fx)
    elif state == "death":
        smoke=Image.new("RGBA",layer.size,(0,0,0,0));sd=ImageDraw.Draw(smoke,"RGBA")
        for i in range(5):
            x=cell*(.35+i*.07); y=cell*(.62-i*.07); r=cell*(.04+i*.008)
            sd.ellipse((x-r,y-r,x+r,y+r),fill=(*secondary,60-i*7))
        smoke=smoke.filter(ImageFilter.GaussianBlur(cell*.035));layer.alpha_composite(smoke)


def render_cell(parts: list[Part], actor: str, state: str, direction: int, cell: int, projection: dict) -> Image.Image:
    supersample = 2 if cell <= 160 else 1
    C = cell * supersample
    img = Image.new("RGBA", (C,C), (0,0,0,0))
    behind=Image.new("RGBA",(C,C),(0,0,0,0));render_vfx(behind,actor,state,direction,C,True);img.alpha_composite(behind)
    # Ground shadow.
    sh=Image.new("RGBA",(C,C),(0,0,0,0));sd=ImageDraw.Draw(sh,"RGBA")
    shadow_w=C*(.25 if actor!="boss-tiger" else .34); shadow_h=C*(.045 if actor!="boss-tiger" else .065)
    sd.ellipse((C*.5-shadow_w,C*.83-shadow_h,C*.5+shadow_w,C*.83+shadow_h),fill=(5,4,12,118 if state!="death" else 60))
    sh=sh.filter(ImageFilter.GaussianBlur(C*.025));img.alpha_composite(sh)

    theta = direction / DIRECTIONS * math.tau
    ry = rot_y(theta)
    pitch = rot_x(math.radians(-9 if actor != "boss-tiger" else -7))
    triangles=[]
    glow_tris=[]
    all_trans=[]
    for part in parts:
        v=apply_pose(part,actor,state,direction/DIRECTIONS)
        v=v @ ry.T
        v=v @ pitch.T
        all_trans.append(v)
        tri=v[part.faces]
        e1=tri[:,1]-tri[:,0]; e2=tri[:,2]-tri[:,0]
        n=np.cross(e1,e2); nn=np.linalg.norm(n,axis=1,keepdims=True); n=n/np.maximum(nn,1e-8)
        centers=tri.mean(axis=1)
        # Render both sides but darken backs; models contain thin planes for halos.
        light=normalize(np.array([-.38,.72,.58]))
        diff=np.clip(n@light,0,1)
        facing=np.clip(n[:,2],-1,1)
        rim=np.power(np.clip(1-np.abs(facing),0,1),2)
        base=part.color[:3].astype(float)
        emissive_hint=any(k in part.material.lower() for k in ("spirit","eye","emissive","gold","accent","flame","blood"))
        shade=.48+.48*diff+.12*rim
        if emissive_hint: shade=np.maximum(shade,.84)
        colors=np.clip(base[None,:]*shade[:,None],0,255)
        if state=="hit": colors=np.clip(colors*.68+np.array([255,62,78])[None,:]*.42,0,255)
        elif state=="death":
            gray=colors.mean(axis=1,keepdims=True);colors=colors*.42+gray*.36
        alpha=int(part.color[3])
        for i,t in enumerate(tri):
            col=tuple(int(x) for x in colors[i])+(alpha,)
            triangles.append((float(centers[i,2]),t,col, float(facing[i])))
            if emissive_hint and (part.emissive.max(initial=0)>0 or any(k in part.material.lower() for k in ("spirit","eye","gold","accent","flame","blood"))):
                glow_tris.append((float(centers[i,2]),t,actor_palette(actor)["secondary"] if "eye" in part.material.lower() else actor_palette(actor)["accent"]))

    # Global projection fixed by precomputed scale and anchor.
    scale=projection["scale"]*supersample
    ox=projection["ox"]*supersample; oy=projection["oy"]*supersample
    def proj(t):
        x=ox+t[:,0]*scale; y=oy-t[:,1]*scale
        return [(float(a),float(b)) for a,b in zip(x,y)]

    draw=ImageDraw.Draw(img,"RGBA")
    for _,t,col,facing in sorted(triangles,key=lambda q:q[0]):
        if facing < -0.65:
            col=(int(col[0]*.52),int(col[1]*.52),int(col[2]*.58),col[3])
        draw.polygon(proj(t),fill=col)

    # Emissive mesh glow.
    if glow_tris:
        g=Image.new("RGBA",(C,C),(0,0,0,0));gd=ImageDraw.Draw(g,"RGBA")
        for _,t,c in sorted(glow_tris,key=lambda q:q[0]): gd.polygon(proj(t),fill=(*c,95))
        gb=g.filter(ImageFilter.GaussianBlur(C*.018));img.alpha_composite(gb);img.alpha_composite(g)

    # Outline from alpha; protects readability on bright maps.
    alpha=img.getchannel("A")
    dilated=alpha.filter(ImageFilter.MaxFilter(7 if supersample==2 else 5))
    outline=ImageChops.subtract(dilated,alpha)
    outlayer=Image.new("RGBA",(C,C),(*actor_palette(actor)["outline"],0));outlayer.putalpha(outline.point(lambda x:int(x*.9)))
    # Outline should be behind original.
    combined=Image.new("RGBA",(C,C),(0,0,0,0));combined.alpha_composite(outlayer);combined.alpha_composite(img)
    img=combined

    fore=Image.new("RGBA",(C,C),(0,0,0,0));render_vfx(fore,actor,state,direction,C,False);img.alpha_composite(fore)
    if state=="death": img.putalpha(img.getchannel("A").point(lambda x:int(x*.82)))
    if supersample>1: img=img.resize((cell,cell),Image.Resampling.LANCZOS)
    img=ImageEnhance.Sharpness(img).enhance(1.12)
    return img


def compute_projection(parts: list[Part], actor: str, cell: int) -> dict:
    minx,miny=1e9,1e9;maxx,maxy=-1e9,-1e9
    for state in STATES:
        for direction in range(DIRECTIONS):
            theta=direction/DIRECTIONS*math.tau; ry=rot_y(theta); pitch=rot_x(math.radians(-9 if actor!="boss-tiger" else -7))
            for part in parts:
                v=apply_pose(part,actor,state,direction/DIRECTIONS)@ry.T@pitch.T
                minx=min(minx,float(v[:,0].min()));maxx=max(maxx,float(v[:,0].max()));miny=min(miny,float(v[:,1].min()));maxy=max(maxy,float(v[:,1].max()))
    width=maxx-minx;height=maxy-miny
    usable_w=cell*(.72 if actor!="boss-tiger" else .78);usable_h=cell*(.72 if actor!="boss-tiger" else .70)
    scale=min(usable_w/max(width,1e-6),usable_h/max(height,1e-6))
    # Keep feet near 84% of cell, centered horizontally.
    ox=cell*.5-(minx+maxx)*.5*scale
    oy=cell*.83+miny*scale
    return {"scale":scale,"ox":ox,"oy":oy,"bounds":[minx,miny,maxx,maxy]}


def build_atlas(model: Path, actor: str, out: Path, cell: int=160) -> dict:
    parts,metrics=load_parts(model)
    if hasattr(metrics.get("bounds"), "tolist"):
        metrics["bounds"] = metrics["bounds"].tolist()
    projection=compute_projection(parts,actor,cell)
    atlas=Image.new("RGBA",(cell*DIRECTIONS,cell*len(STATES)),(0,0,0,0))
    for row,state in enumerate(STATES):
        for col in range(DIRECTIONS):
            atlas.alpha_composite(render_cell(parts,actor,state,col,cell,projection),(col*cell,row*cell))
    out.parent.mkdir(parents=True,exist_ok=True)
    atlas.save(out,format="WEBP",lossless=True,method=6,exact=True)
    return {"actor":actor,"model":model.name,"cell":cell,"columns":DIRECTIONS,"rows":len(STATES),"width":atlas.width,"height":atlas.height,"states":list(STATES),"metrics":metrics,"projection":projection,"bytes":out.stat().st_size}


def create_runtime_variants(source: Path, actor_id: str, high_cell: int) -> dict:
    """Create tiered GPU-friendly variants while preserving the 11x6 frame grid."""
    medium_cell = 144 if actor_id == "boss-tiger" else 128
    low_cell = 68 if actor_id == "boss-tiger" else 60
    variants = {}
    with Image.open(source) as high_image:
        high_image = high_image.convert("RGBA")
        for tier, cell in (("high", high_cell), ("medium", medium_cell), ("low", low_cell)):
            output = source if tier == "high" else OUTPUT_ROOT / f"{actor_id}-atlas-{tier}-v112.webp"
            if tier != "high":
                resized = high_image.resize((cell * DIRECTIONS, cell * len(STATES)), Image.Resampling.LANCZOS)
                resized = ImageEnhance.Sharpness(resized).enhance(1.08)
                resized.save(output, format="WEBP", lossless=True, method=6, exact=True)
            variants[tier] = {
                "path": output.relative_to(ROOT).as_posix(),
                "cell": cell,
                "width": cell * DIRECTIONS,
                "height": cell * len(STATES),
                "bytes": output.stat().st_size,
                "sha256": sha256(output),
            }
    return variants


def build_all() -> dict:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    files = []
    for job in ASSET_JOBS:
        model = ROOT / job["model"]
        if not model.exists():
            raise FileNotFoundError(model)
        output = OUTPUT_ROOT / f"{job['id']}-atlas-v112.webp"
        result = build_atlas(model, job["actor"], output, int(job["cell"]))
        variants = create_runtime_variants(output, job["id"], int(job["cell"]))
        result.update({
            "id": job["id"],
            "path": output.relative_to(ROOT).as_posix(),
            "modelPath": model.relative_to(ROOT).as_posix(),
            "sha256": sha256(output),
            "frames": DIRECTIONS * len(STATES),
            "authoredDirections": True,
            "mirroringAllowed": False,
            "runtimeApproved": True,
            "productionArtApproved": False,
            "variants": variants,
        })
        files.append(result)
    payload = {
        "schema": "DD-P0-DIRECTIONAL-ATLAS-MANIFEST-1.0",
        "releaseVersion": RELEASE_VERSION,
        "buildId": BUILD_ID,
        "directionCount": DIRECTIONS,
        "stateCount": len(STATES),
        "states": list(STATES),
        "authoredDirections": True,
        "mirroringAllowed": False,
        "atlasCount": len(files),
        "frameCount": sum(item["frames"] for item in files),
        "runtimeApproved": True,
        "productionArtApproved": False,
        "files": files,
    }
    MANIFEST_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return payload


def check_all() -> int:
    if not MANIFEST_PATH.exists():
        print(f"FAIL missing {MANIFEST_PATH.relative_to(ROOT)}")
        return 1
    payload = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    failures = []
    if payload.get("releaseVersion") != RELEASE_VERSION or payload.get("buildId") != BUILD_ID:
        failures.append("release identity mismatch")
    if payload.get("directionCount") != DIRECTIONS or payload.get("stateCount") != len(STATES):
        failures.append("direction/state count mismatch")
    if payload.get("authoredDirections") is not True or payload.get("mirroringAllowed") is not False:
        failures.append("authored/non-mirror policy mismatch")
    if payload.get("atlasCount") != len(ASSET_JOBS) or payload.get("frameCount") != len(ASSET_JOBS) * DIRECTIONS * len(STATES):
        failures.append("atlas/frame total mismatch")
    by_id = {item.get("id"): item for item in payload.get("files", [])}
    for job in ASSET_JOBS:
        item = by_id.get(job["id"])
        if not item:
            failures.append(f"missing manifest entry {job['id']}")
            continue
        path = ROOT / item.get("path", "")
        if not path.exists():
            failures.append(f"missing atlas {job['id']}")
            continue
        if item.get("sha256") != sha256(path):
            failures.append(f"hash mismatch {job['id']}")
        if item.get("bytes") != path.stat().st_size:
            failures.append(f"size mismatch {job['id']}")
        expected = (int(job["cell"]) * DIRECTIONS, int(job["cell"]) * len(STATES))
        with Image.open(path) as image:
            if image.size != expected:
                failures.append(f"dimension mismatch {job['id']}: {image.size} != {expected}")
            if image.mode != "RGBA":
                failures.append(f"alpha mode mismatch {job['id']}: {image.mode}")
        variants = item.get("variants", {})
        expected_cells = {"high": int(job["cell"]), "medium": 144 if job["id"] == "boss-tiger" else 128, "low": 68 if job["id"] == "boss-tiger" else 60}
        for tier, cell in expected_cells.items():
            variant = variants.get(tier)
            if not variant:
                failures.append(f"missing {tier} variant {job['id']}")
                continue
            variant_path = ROOT / variant.get("path", "")
            if not variant_path.exists():
                failures.append(f"missing {tier} atlas file {job['id']}")
                continue
            if variant.get("sha256") != sha256(variant_path) or variant.get("bytes") != variant_path.stat().st_size:
                failures.append(f"{tier} hash/size mismatch {job['id']}")
            with Image.open(variant_path) as variant_image:
                variant_expected = (cell * DIRECTIONS, cell * len(STATES))
                if variant_image.size != variant_expected:
                    failures.append(f"{tier} dimension mismatch {job['id']}: {variant_image.size} != {variant_expected}")
        if item.get("frames") != DIRECTIONS * len(STATES):
            failures.append(f"frame count mismatch {job['id']}")
        if item.get("authoredDirections") is not True or item.get("mirroringAllowed") is not False:
            failures.append(f"direction policy mismatch {job['id']}")
    if failures:
        for failure in failures:
            print(f"FAIL {failure}")
        return 1
    print(f"PASS P0 authored directional atlases v{RELEASE_VERSION} ({payload['atlasCount']} atlases / {payload['frameCount']} frames)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate deterministic P0 11-direction action atlases.")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--model", type=Path)
    parser.add_argument("--actor")
    parser.add_argument("--out", type=Path)
    parser.add_argument("--cell", type=int, default=160)
    parser.add_argument("--json", type=Path)
    args = parser.parse_args()
    if args.check:
        return check_all()
    if args.model or args.actor or args.out:
        if not (args.model and args.actor and args.out):
            parser.error("--model, --actor and --out must be supplied together")
        result = build_atlas(args.model, args.actor, args.out, args.cell)
        result.update({"sha256": sha256(args.out), "frames": DIRECTIONS * len(STATES)})
        if args.json:
            args.json.parent.mkdir(parents=True, exist_ok=True)
            args.json.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(result, ensure_ascii=False))
        return 0
    payload = build_all()
    print(json.dumps({
        "releaseVersion": payload["releaseVersion"],
        "atlasCount": payload["atlasCount"],
        "frameCount": payload["frameCount"],
        "bytes": sum(item["bytes"] for item in payload["files"]),
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
