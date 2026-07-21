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


def toon_source(name: str, color: int, roughness=.78, metallic=.0, emissive: int | None = None, emissive_strength=.0):
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
    silk = toon_source('CoralHanbok', 0xe84f55, .86, .0)
    silk_dark = toon_source('PlumShadow', 0x32203d, .9, .0)
    skin = toon_source('PeachSkin', 0xe6a27f, .82, .0)
    lacquer = toon_source('LacquerPlum', 0x4b2b35, .72, .08)
    brass = toon_source('LanternGold', 0xffc85c, .62, .12, 0xffc85c, .08)
    spirit = toon_source('EmberCoral', 0xff6b4a, .5, .0, 0xff6b4a, .9)
    spirit_core = toon_source('MoonCreamCore', 0xf4e6c8, .42, .0, 0xffc85c, 1.35)
    eye = toon_source('SpiritEyes', 0xf4e6c8, .5, .0, 0xffc85c, 1.5)
    paper = toon_source('TalismanPaper', 0xead6a8, .95, .0)

    add(s, 'pelvis', capsule(.36, .30, (14,10)), silk_dark, (0,.56,0), scale=(1.08,1,.86))
    add(s, 'body', capsule(.50, .62, (16,12)), silk, (0,1.02,0), scale=(1.02,1.02,.86))
    add(s, 'chestArmor', box((.88,.42,.18)), lacquer, (0,1.16,.39), rotation=(.08,0,0))
    add(s, 'moonEmblem', torus(.18,.04,20,6), brass, (0,1.18,.5), rotation=(math.pi/2,0,0))
    add(s, 'head', uv_sphere(.62,(18,12)), skin, (0,1.78,.02), scale=(1.02,.98,.94))
    add(s, 'mask', box((.82,.36,.085)), lacquer, (0,1.82,.56), rotation=(.02,0,0), scale=(1,.92,1))
    add(s, 'eyeL', uv_sphere(.09,(10,6)), eye, (-.22,1.86,.625))
    add(s, 'eyeR', uv_sphere(.09,(10,6)), eye, (.22,1.86,.625))
    add(s, 'hornL', cone(.16,.46,10), brass, (-.34,2.38,-.02), rotation=(0,0,-.22))
    add(s, 'hornR', cone(.16,.46,10), brass, (.34,2.38,-.02), rotation=(0,0,.22))
    add(s, 'hairCrest', cone(.18,.38,10), lacquer, (0,2.42,-.16), rotation=(.28,0,0))
    add(s, 'shoulderL', uv_sphere(.23,(10,7)), lacquer, (-.59,1.28,0), scale=(1.25,.72,1))
    add(s, 'shoulderR', uv_sphere(.23,(10,7)), lacquer, (.59,1.28,0), scale=(1.25,.72,1))
    add(s, 'armL', capsule(.15,.52,(10,8)), silk, (-.62,.91,.02), rotation=(0,0,.22))
    add(s, 'armR', capsule(.15,.52,(10,8)), silk, (.64,.94,.03), rotation=(0,0,-.34))
    add(s, 'handL', uv_sphere(.19,(10,7)), skin, (-.72,.58,.08))
    add(s, 'handR', uv_sphere(.19,(10,7)), skin, (.82,.62,.1))
    add(s, 'legL', capsule(.17,.34,(10,8)), silk_dark, (-.25,.25,.02), rotation=(0,0,.05))
    add(s, 'legR', capsule(.17,.34,(10,8)), silk_dark, (.25,.25,.02), rotation=(0,0,-.05))
    add(s, 'footL', uv_sphere(.24,(10,7)), lacquer, (-.28,.05,.18), scale=(1.05,.62,1.5))
    add(s, 'footR', uv_sphere(.24,(10,7)), lacquer, (.28,.05,.18), scale=(1.05,.62,1.5))
    add(s, 'cloth', box((.82,.54,.08)), silk, (0,.58,-.36), rotation=(-.12,0,0))
    add(s, 'sash', torus(.46,.05,22,6), brass, (0,.74,0), rotation=(math.pi/2,0,0))
    add(s, 'weapon', cyl(.075,1.55,10), lacquer, (.84,1.03,.02), rotation=(0,0,-.48))
    add(s, 'signature', cone(.38,1.08,14), spirit, (1.18,1.62,.02), rotation=(0,0,-.34))
    add(s, 'flameCore', cone(.17,.7,12), spirit_core, (1.18,1.58,.09), rotation=(0,0,-.34))
    add(s, 'talisman', box((.28,.54,.025)), paper, (-.48,1.0,.48), rotation=(0,-.18,.08))
    add(s, 'halo', torus(.78,.045,28,6), spirit, (0,1.5,-.46), rotation=(math.pi/2,0,0))
    return s


def monster_imp():
    s = trimesh.Scene()
    hide = toon_source('ImpHide', 0x9a3156, .8, .0)
    hide_dark = toon_source('ImpShadow', 0x28101f, .86, .0)
    bone = toon_source('OldBone', 0xd8c18d, .82, .02)
    eye = toon_source('TrickEyes', 0xffd76b, .12, .0, 0xff8c32, 2.0)
    cloth = toon_source('RagCloth', 0x4b2942, .92, .0)
    jade = toon_source('CursedJade', 0x45d8c3, .26, .05, 0x1dbfac, 1.0)
    add(s,'pelvis',capsule(.34,.35,(12,9)),hide_dark,(0,.55,0),scale=(1.1,1,.9))
    add(s,'body',capsule(.43,.48,(14,10)),hide,(0,.85,0),scale=(1.1,1,.86))
    add(s,'head',uv_sphere(.57,(16,10)),hide,(0,1.5,.1),scale=(1.08,.96,.92))
    add(s,'mask',box((.72,.3,.075)),bone,(0,1.54,.59),rotation=(.03,0,0))
    add(s,'eyeL',uv_sphere(.08,(9,6)),eye,(-.2,1.58,.655))
    add(s,'eyeR',uv_sphere(.08,(9,6)),eye,(.2,1.58,.655))
    add(s,'earL',cone(.19,.7,8),hide_dark,(-.58,1.54,0),rotation=(0,0,-1.18))
    add(s,'earR',cone(.19,.7,8),hide_dark,(.58,1.54,0),rotation=(0,0,1.18))
    add(s,'hornL',cone(.12,.34,8),bone,(-.3,2.08,-.02),rotation=(0,0,-.25))
    add(s,'hornR',cone(.12,.34,8),bone,(.3,2.08,-.02),rotation=(0,0,.25))
    add(s,'armL',capsule(.14,.46,(9,7)),hide,(-.55,.86,.05),rotation=(0,0,.48))
    add(s,'armR',capsule(.14,.46,(9,7)),hide,(.57,.86,.05),rotation=(0,0,-.62))
    add(s,'legL',capsule(.15,.32,(9,7)),hide_dark,(-.24,.22,.08),rotation=(0,0,.18))
    add(s,'legR',capsule(.15,.32,(9,7)),hide_dark,(.24,.22,.08),rotation=(0,0,-.18))
    add(s,'cloth',box((.78,.52,.06)),cloth,(0,.64,-.33),rotation=(-.18,0,0))
    add(s,'weapon',cyl(.065,1.05,9),bone,(.74,1.0,.12),rotation=(0,0,-.76))
    add(s,'signature',cone(.14,.58,8),jade,(1.03,1.24,.12),rotation=(0,0,-.75))
    add(s,'tail',torus(.43,.07,18,6),hide_dark,(0,.73,-.38),rotation=(math.pi/2,.25,.2))
    return s


def boss_tiger():
    s = trimesh.Scene()
    fur = toon_source('BloodMoonFur', 0xb14d3f, .75, .0)
    fur_dark = toon_source('TigerShadow', 0x251321, .82, .02)
    armor = toon_source('UnderworldArmor', 0x34293f, .38, .52)
    brass = toon_source('RoyalBrass', 0xd0a35b, .3, .75, 0xffad48, .12)
    bone = toon_source('Muzzle', 0xe3c79b, .72, .0)
    eye = toon_source('BloodEye', 0xffe0a0, .08, .0, 0xff4b2e, 2.5)
    spirit = toon_source('BloodSpirit', 0xff574a, .16, .02, 0xff251d, 1.5)
    add(s,'body',capsule(.78,1.35,(18,12)),fur,(0,1.04,-.28),rotation=(0,0,math.pi/2),scale=(1,1,.9))
    add(s,'chestArmor',box((1.2,.72,.22)),armor,(0,1.35,.4),rotation=(.05,0,0))
    add(s,'head',uv_sphere(.76,(20,14)),fur,(0,1.64,.72),scale=(1.05,.95,.96))
    add(s,'muzzle',uv_sphere(.39,(14,9)),bone,(0,1.5,1.34),scale=(1.2,.64,.78))
    add(s,'nose',uv_sphere(.17,(10,7)),fur_dark,(0,1.56,1.7),scale=(1.25,.65,.7))
    add(s,'eyeL',uv_sphere(.1,(10,7)),eye,(-.28,1.82,1.42))
    add(s,'eyeR',uv_sphere(.1,(10,7)),eye,(.28,1.82,1.42))
    add(s,'earL',cone(.2,.5,10),fur_dark,(-.48,2.24,.66),rotation=(.35,0,-.25))
    add(s,'earR',cone(.2,.5,10),fur_dark,(.48,2.24,.66),rotation=(.35,0,.25))
    add(s,'mane',torus(1.0,.2,30,8),fur_dark,(0,1.67,.38),rotation=(math.pi/2,0,0))
    for i,x in enumerate([-0.52,0.52]):
        add(s,f'frontLeg{i}',capsule(.19,.92,(10,8)),fur,(x,.58,.54),rotation=(0,0,0))
        add(s,f'frontPaw{i}',uv_sphere(.32,(11,7)),fur_dark,(x,.12,.86),scale=(1.22,.6,1.5))
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
    export(guardian_ember(), 'guardian-ember-sd-toon.glb')
    export(monster_imp(), 'monster-imp-sd-toon.glb')
    export(boss_tiger(), 'boss-tiger-sd-toon.glb')
