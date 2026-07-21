#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import math
import numpy as np
import trimesh
from trimesh.transformations import translation_matrix, rotation_matrix, scale_matrix, concatenate_matrices

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'assets' / 'models'
OUT.mkdir(parents=True, exist_ok=True)


def rgba(value: int, alpha: int = 255):
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255, alpha]


def pbr(name: str, color: int, roughness=.65, metallic=.05, emissive: int | None = None, emissive_strength=.0):
    emit = [0.0, 0.0, 0.0]
    if emissive is not None and emissive_strength > 0:
        rgb = rgba(emissive)
        emit = [min(1.0, rgb[0] / 255 * emissive_strength), min(1.0, rgb[1] / 255 * emissive_strength), min(1.0, rgb[2] / 255 * emissive_strength)]
    return trimesh.visual.material.PBRMaterial(
        name=name,
        baseColorFactor=rgba(color),
        metallicFactor=float(metallic),
        roughnessFactor=float(roughness),
        emissiveFactor=emit,
        doubleSided=False,
    )


def mat_transform(position=(0,0,0), rotation=(0,0,0), scale=(1,1,1)):
    rx = rotation_matrix(rotation[0], [1,0,0])
    ry = rotation_matrix(rotation[1], [0,1,0])
    rz = rotation_matrix(rotation[2], [0,0,1])
    sm = np.diag([scale[0], scale[1], scale[2], 1.0])
    return concatenate_matrices(translation_matrix(position), rz, ry, rx, sm)


def set_material(mesh: trimesh.Trimesh, material):
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    return mesh


def add(scene, name, geometry, material, position=(0,0,0), rotation=(0,0,0), scale=(1,1,1)):
    mesh = set_material(geometry, material)
    scene.add_geometry(mesh, geom_name=f'{name}_geo', node_name=name, transform=mat_transform(position, rotation, scale))


def capsule(radius, height, count=(12, 12)):
    return trimesh.creation.capsule(radius=radius, height=height, count=count)


def uv_sphere(radius, count=(12, 8)):
    return trimesh.creation.uv_sphere(radius=radius, count=count)


def cyl(radius, height, sections=12):
    return trimesh.creation.cylinder(radius=radius, height=height, sections=sections)


def cone(radius, height, sections=12):
    return trimesh.creation.cone(radius=radius, height=height, sections=sections)


def box(extents):
    return trimesh.creation.box(extents=extents)


def torus(major, minor, major_sections=24, minor_sections=8):
    return trimesh.creation.torus(major_radius=major, minor_radius=minor, major_sections=major_sections, minor_sections=minor_sections)


def guardian_ember():
    s = trimesh.Scene()
    silk = pbr('CrimsonSilk', 0x7d2748, .72, .02)
    silk_dark = pbr('NightSilk', 0x221326, .78, .02)
    skin = pbr('WarmSkin', 0xd69b78, .62, .0)
    lacquer = pbr('BlackLacquer', 0x17101d, .34, .18)
    brass = pbr('MoonBrass', 0xd6a95a, .34, .72, 0xffc96e, .12)
    spirit = pbr('EmberSpirit', 0xff7045, .18, .08, 0xff4e24, 1.0)
    spirit_core = pbr('EmberCore', 0xffe4a1, .12, .02, 0xffbe42, 1.8)
    eye = pbr('SpiritEyes', 0xffefae, .1, .0, 0xffb63c, 2.0)
    paper = pbr('TalismanPaper', 0xf0d9a5, .9, .0)

    add(s, 'pelvis', capsule(.38, .42, (14,10)), silk_dark, (0,.76,0), scale=(1.05,1, .82))
    add(s, 'body', capsule(.52, .9, (16,12)), silk, (0,1.3,0), scale=(.95,1.06,.78))
    add(s, 'chestArmor', box((.92,.5,.18)), lacquer, (0,1.48,.39), rotation=(.08,0,0))
    add(s, 'moonEmblem', torus(.19,.035,20,6), brass, (0,1.5,.5), rotation=(math.pi/2,0,0))
    add(s, 'head', uv_sphere(.47,(18,12)), skin, (0,2.08,0), scale=(1,.96,.9))
    add(s, 'mask', box((.66,.34,.08)), lacquer, (0,2.12,.41), rotation=(.02,0,0), scale=(1,.9,1))
    add(s, 'eyeL', uv_sphere(.065,(10,6)), eye, (-.18,2.14,.465))
    add(s, 'eyeR', uv_sphere(.065,(10,6)), eye, (.18,2.14,.465))
    add(s, 'hornL', cone(.135,.58,10), brass, (-.29,2.63,-.02), rotation=(0,0,-.25))
    add(s, 'hornR', cone(.135,.58,10), brass, (.29,2.63,-.02), rotation=(0,0,.25))
    add(s, 'hairCrest', cone(.16,.48,10), lacquer, (0,2.66,-.13), rotation=(.28,0,0))
    add(s, 'shoulderL', uv_sphere(.22,(10,7)), lacquer, (-.61,1.64,0), scale=(1.25,.72,1))
    add(s, 'shoulderR', uv_sphere(.22,(10,7)), lacquer, (.61,1.64,0), scale=(1.25,.72,1))
    add(s, 'armL', capsule(.13,.72,(10,8)), silk, (-.64,1.17,.02), rotation=(0,0,.2))
    add(s, 'armR', capsule(.13,.72,(10,8)), silk, (.66,1.22,.03), rotation=(0,0,-.32))
    add(s, 'handL', uv_sphere(.15,(10,7)), skin, (-.73,.78,.05))
    add(s, 'handR', uv_sphere(.15,(10,7)), skin, (.83,.82,.08))
    add(s, 'legL', capsule(.16,.55,(10,8)), silk_dark, (-.25,.33,.02), rotation=(0,0,.05))
    add(s, 'legR', capsule(.16,.55,(10,8)), silk_dark, (.25,.33,.02), rotation=(0,0,-.05))
    add(s, 'footL', uv_sphere(.2,(10,7)), lacquer, (-.27,.08,.16), scale=(1,.65,1.45))
    add(s, 'footR', uv_sphere(.2,(10,7)), lacquer, (.27,.08,.16), scale=(1,.65,1.45))
    add(s, 'cloth', box((.86,.72,.08)), silk, (0,.73,-.35), rotation=(-.12,0,0))
    add(s, 'sash', torus(.48,.045,22,6), brass, (0,.92,0), rotation=(math.pi/2,0,0))
    add(s, 'weapon', cyl(.065,1.45,10), lacquer, (.83,1.25,.02), rotation=(0,0,-.43))
    add(s, 'signature', cone(.31,.96,14), spirit, (1.14,1.82,.02), rotation=(0,0,-.32))
    add(s, 'flameCore', cone(.14,.64,12), spirit_core, (1.14,1.78,.09), rotation=(0,0,-.32))
    add(s, 'talisman', box((.25,.58,.025)), paper, (-.46,1.28,.47), rotation=(0,-.18,.08))
    add(s, 'halo', torus(.72,.035,28,6), spirit, (0,1.74,-.42), rotation=(math.pi/2,0,0))
    return s


def monster_imp():
    s = trimesh.Scene()
    hide = pbr('ImpHide', 0x9a3156, .8, .0)
    hide_dark = pbr('ImpShadow', 0x28101f, .86, .0)
    bone = pbr('OldBone', 0xd8c18d, .82, .02)
    eye = pbr('TrickEyes', 0xffd76b, .12, .0, 0xff8c32, 2.0)
    cloth = pbr('RagCloth', 0x4b2942, .92, .0)
    jade = pbr('CursedJade', 0x45d8c3, .26, .05, 0x1dbfac, 1.0)
    add(s,'pelvis',capsule(.34,.35,(12,9)),hide_dark,(0,.55,0),scale=(1.1,1,.9))
    add(s,'body',capsule(.45,.72,(14,10)),hide,(0,1.05,0),scale=(1.08,1,.82))
    add(s,'head',uv_sphere(.43,(16,10)),hide,(0,1.72,.08),scale=(1.08,.94,.9))
    add(s,'mask',box((.56,.26,.07)),bone,(0,1.74,.46),rotation=(.03,0,0))
    add(s,'eyeL',uv_sphere(.06,(9,6)),eye,(-.16,1.78,.505))
    add(s,'eyeR',uv_sphere(.06,(9,6)),eye,(.16,1.78,.505))
    add(s,'earL',cone(.18,.78,8),hide_dark,(-.48,1.78,0),rotation=(0,0,-1.18))
    add(s,'earR',cone(.18,.78,8),hide_dark,(.48,1.78,0),rotation=(0,0,1.18))
    add(s,'hornL',cone(.11,.38,8),bone,(-.25,2.19,-.02),rotation=(0,0,-.28))
    add(s,'hornR',cone(.11,.38,8),bone,(.25,2.19,-.02),rotation=(0,0,.28))
    add(s,'armL',capsule(.12,.64,(9,7)),hide,(-.52,1.08,.05),rotation=(0,0,.45))
    add(s,'armR',capsule(.12,.64,(9,7)),hide,(.54,1.08,.05),rotation=(0,0,-.6))
    add(s,'legL',capsule(.13,.52,(9,7)),hide_dark,(-.23,.27,.08),rotation=(0,0,.18))
    add(s,'legR',capsule(.13,.52,(9,7)),hide_dark,(.23,.27,.08),rotation=(0,0,-.18))
    add(s,'cloth',box((.78,.52,.06)),cloth,(0,.64,-.33),rotation=(-.18,0,0))
    add(s,'weapon',cyl(.065,1.05,9),bone,(.74,1.0,.12),rotation=(0,0,-.76))
    add(s,'signature',cone(.14,.58,8),jade,(1.03,1.24,.12),rotation=(0,0,-.75))
    add(s,'tail',torus(.43,.07,18,6),hide_dark,(0,.73,-.38),rotation=(math.pi/2,.25,.2))
    return s


def boss_tiger():
    s = trimesh.Scene()
    fur = pbr('BloodMoonFur', 0xb14d3f, .75, .0)
    fur_dark = pbr('TigerShadow', 0x251321, .82, .02)
    armor = pbr('UnderworldArmor', 0x34293f, .38, .52)
    brass = pbr('RoyalBrass', 0xd0a35b, .3, .75, 0xffad48, .12)
    bone = pbr('Muzzle', 0xe3c79b, .72, .0)
    eye = pbr('BloodEye', 0xffe0a0, .08, .0, 0xff4b2e, 2.5)
    spirit = pbr('BloodSpirit', 0xff574a, .16, .02, 0xff251d, 1.5)
    add(s,'body',capsule(.82,1.65,(18,12)),fur,(0,1.16,-.32),rotation=(0,0,math.pi/2),scale=(1,1,.86))
    add(s,'chestArmor',box((1.2,.72,.22)),armor,(0,1.35,.4),rotation=(.05,0,0))
    add(s,'head',uv_sphere(.7,(20,14)),fur,(0,1.72,.65),scale=(1.04,.9,.9))
    add(s,'muzzle',uv_sphere(.36,(14,9)),bone,(0,1.57,1.15),scale=(1.18,.62,.75))
    add(s,'nose',uv_sphere(.14,(10,7)),fur_dark,(0,1.64,1.42),scale=(1.25,.65,.7))
    add(s,'eyeL',uv_sphere(.075,(10,7)),eye,(-.25,1.84,1.23))
    add(s,'eyeR',uv_sphere(.075,(10,7)),eye,(.25,1.84,1.23))
    add(s,'earL',cone(.2,.5,10),fur_dark,(-.48,2.24,.66),rotation=(.35,0,-.25))
    add(s,'earR',cone(.2,.5,10),fur_dark,(.48,2.24,.66),rotation=(.35,0,.25))
    add(s,'mane',torus(.82,.18,30,8),fur_dark,(0,1.74,.36),rotation=(math.pi/2,0,0))
    for i,x in enumerate([-0.52,0.52]):
        add(s,f'frontLeg{i}',capsule(.19,.92,(10,8)),fur,(x,.58,.54),rotation=(0,0,0))
        add(s,f'frontPaw{i}',uv_sphere(.26,(11,7)),fur_dark,(x,.12,.78),scale=(1.18,.62,1.45))
        add(s,f'backLeg{i}',capsule(.22,.82,(10,8)),fur,(x,.55,-1.02),rotation=(0,0,0))
        add(s,f'backPaw{i}',uv_sphere(.28,(11,7)),fur_dark,(x,.12,-.83),scale=(1.2,.65,1.5))
    add(s,'tail',torus(.75,.12,24,8),fur,(0,1.05,-1.52),rotation=(math.pi/2,.25,.45))
    for i in range(5):
        z=-.75 + i*.36
        add(s,f'stripe{i}',box((.78,.06,.18)),fur_dark,(0,1.68,z),rotation=(0,.15*(-1 if i%2 else 1),0))
    add(s,'weapon',cone(.14,.65,10),brass,(0,2.55,.4),rotation=(0,0,math.pi))
    add(s,'signature',torus(1.1,.07,34,8),spirit,(0,1.72,.18),rotation=(math.pi/2,0,0))
    add(s,'halo',torus(1.25,.035,36,6),brass,(0,1.72,.05),rotation=(math.pi/2,0,0))
    return s


def export(scene, name):
    data = scene.export(file_type='glb')
    path = OUT / name
    path.write_bytes(data)
    print(f'{name}: {len(data)/1024:.1f} KB, faces={sum(len(g.faces) for g in scene.geometry.values())}')


if __name__ == '__main__':
    export(guardian_ember(), 'guardian-ember-nextgen.glb')
    export(monster_imp(), 'monster-imp-nextgen.glb')
    export(boss_tiger(), 'boss-tiger-nextgen.glb')
