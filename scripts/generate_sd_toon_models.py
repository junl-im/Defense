#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import sys
import math
import numpy as np
import trimesh
from trimesh.transformations import translation_matrix, rotation_matrix, concatenate_matrices

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'assets' / 'models'
OUT.mkdir(parents=True, exist_ok=True)


def rgba(value: int, alpha: int = 255):
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255, alpha]


def toon_source(name: str, color: int, roughness=.8, metallic=.0, emissive: int | None = None, emissive_strength=0.0):
    emit = [0.0, 0.0, 0.0]
    if emissive is not None and emissive_strength > 0:
        rgb = rgba(emissive)
        emit = [min(1.0, rgb[i] / 255 * emissive_strength) for i in range(3)]
    return trimesh.visual.material.PBRMaterial(
        name=name,
        baseColorFactor=rgba(color),
        metallicFactor=float(metallic),
        roughnessFactor=float(roughness),
        emissiveFactor=emit,
        doubleSided=False,
    )


def mat_transform(position=(0, 0, 0), rotation=(0, 0, 0), scale=(1, 1, 1)):
    rx = rotation_matrix(rotation[0], [1, 0, 0])
    ry = rotation_matrix(rotation[1], [0, 1, 0])
    rz = rotation_matrix(rotation[2], [0, 0, 1])
    sm = np.diag([scale[0], scale[1], scale[2], 1.0])
    return concatenate_matrices(translation_matrix(position), rz, ry, rx, sm)


def set_material(mesh: trimesh.Trimesh, material):
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    return mesh


def add(scene, name, geometry, material, position=(0, 0, 0), rotation=(0, 0, 0), scale=(1, 1, 1)):
    mesh = set_material(geometry, material)
    scene.add_geometry(mesh, geom_name=f'{name}_geo', node_name=name, transform=mat_transform(position, rotation, scale))


def capsule(radius, height, count=(12, 10)):
    return trimesh.creation.capsule(radius=radius, height=height, count=count)


def uv_sphere(radius, count=(14, 10)):
    return trimesh.creation.uv_sphere(radius=radius, count=count)


def cyl(radius, height, sections=10):
    return trimesh.creation.cylinder(radius=radius, height=height, sections=sections)


def cone(radius, height, sections=10):
    return trimesh.creation.cone(radius=radius, height=height, sections=sections)


def box(extents):
    return trimesh.creation.box(extents=extents)


def torus(major, minor, major_sections=20, minor_sections=6):
    return trimesh.creation.torus(major_radius=major, minor_radius=minor, major_sections=major_sections, minor_sections=minor_sections)


def biped_base(scene, prefix, main, dark, skin, eye, accent, *, head_scale=1.0, body_scale=(1.0, 1.0, 1.0), mask=False, low_detail=False):
    body_count = (10, 8) if low_detail else (14, 10)
    head_count = (12, 8) if low_detail else (16, 11)
    limb_count = (8, 6) if low_detail else (10, 8)
    round_count = (7, 5) if low_detail else (9, 7)
    add(scene, 'pelvis', capsule(.34, .27, limb_count), dark, (0, .55, 0), scale=(1.08, 1, .86))
    add(scene, 'body', capsule(.48, .57, body_count), main, (0, 1.03, 0), scale=(body_scale[0], body_scale[1], body_scale[2]))
    add(scene, 'head', uv_sphere(.61, head_count), skin, (0, 1.82, .02), scale=(1.02 * head_scale, .98 * head_scale, .94 * head_scale))
    if mask:
        add(scene, 'mask', box((.76, .31, .075)), dark, (0, 1.84, .58), rotation=(.02, 0, 0))
    add(scene, 'eyeL', uv_sphere(.085, (9, 6)), eye, (-.21, 1.89, .60))
    add(scene, 'eyeR', uv_sphere(.085, (9, 6)), eye, (.21, 1.89, .60))
    add(scene, 'shoulderL', uv_sphere(.22, round_count), dark, (-.58, 1.30, 0), scale=(1.25, .72, 1))
    add(scene, 'shoulderR', uv_sphere(.22, round_count), dark, (.58, 1.30, 0), scale=(1.25, .72, 1))
    add(scene, 'armL', capsule(.14, .50, limb_count), main, (-.62, .94, .02), rotation=(0, 0, .24))
    add(scene, 'armR', capsule(.14, .50, limb_count), main, (.64, .96, .03), rotation=(0, 0, -.34))
    add(scene, 'handL', uv_sphere(.18, round_count), skin, (-.72, .60, .09))
    add(scene, 'handR', uv_sphere(.18, round_count), skin, (.80, .64, .10))
    add(scene, 'legL', capsule(.16, .34, limb_count), dark, (-.25, .26, .02), rotation=(0, 0, .05))
    add(scene, 'legR', capsule(.16, .34, limb_count), dark, (.25, .26, .02), rotation=(0, 0, -.05))
    add(scene, 'footL', uv_sphere(.24, round_count), dark, (-.28, .06, .18), scale=(1.05, .62, 1.50))
    add(scene, 'footR', uv_sphere(.24, round_count), dark, (.28, .06, .18), scale=(1.05, .62, 1.50))
    add(scene, 'cloth', box((.80, .54, .075)), main, (0, .59, -.36), rotation=(-.12, 0, 0))
    add(scene, 'sash', torus(.45, .045), accent, (0, .76, 0), rotation=(math.pi / 2, 0, 0))


def add_horns(scene, material, height=.44, spread=.34, radius=.14):
    add(scene, 'hornL', cone(radius, height, 9), material, (-spread, 2.39, -.02), rotation=(0, 0, -.22))
    add(scene, 'hornR', cone(radius, height, 9), material, (spread, 2.39, -.02), rotation=(0, 0, .22))


def guardian_model(kind: str):
    palettes = {
        'player': (0x6c4592, 0x241a38, 0xe7a887, 0x8ff8ff, 0xf2c65f),
        'ember': (0xe84f55, 0x382033, 0xe7a887, 0xffedb0, 0xffc85c),
        'frost': (0x63cbe2, 0x24465e, 0xe8b08d, 0xf4ffff, 0x8ff4ff),
        'wind': (0x63c58d, 0x23483f, 0xe8b08d, 0xf6fff2, 0xaaf29d),
        'stone': (0xc6945e, 0x4c3829, 0xe2a57f, 0xfff0bd, 0xf0bd68),
        'bell': (0xc978d3, 0x4c2859, 0xe8ae8b, 0xffedff, 0xffa8f3),
        'thunder': (0xd8bb43, 0x423a22, 0xe8ae8b, 0xffffcf, 0xffdf48),
    }
    main_c, dark_c, skin_c, eye_c, accent_c = palettes[kind]
    s = trimesh.Scene()
    main = toon_source(f'{kind}Cloth', main_c, .88)
    dark = toon_source(f'{kind}Shadow', dark_c, .92)
    skin = toon_source('SharedPeachSkin', skin_c, .84)
    eye = toon_source(f'{kind}Eyes', eye_c, .45, 0, eye_c, 1.25)
    accent = toon_source(f'{kind}Accent', accent_c, .62, .15, accent_c, .25)
    spirit = toon_source(f'{kind}Spirit', accent_c, .42, 0, accent_c, 1.0)
    paper = toon_source('TalismanPaper', 0xf0d6a2, .96)
    biped_base(s, kind, main, dark, skin, eye, accent)
    add_horns(s, accent, .44 if kind != 'thunder' else .58)

    if kind == 'player':
        add(s, 'gatBrim', cyl(.79, .075, 14), dark, (0, 2.26, 0))
        add(s, 'gatCrown', cone(.54, .42, 12), dark, (0, 2.49, 0))
        add(s, 'weapon', cyl(.065, 1.25, 9), dark, (.76, 1.16, .03), rotation=(0, 0, -.42))
        add(s, 'signature', uv_sphere(.30, (12, 8)), spirit, (.98, 1.72, .08))
        add(s, 'halo', torus(.74, .045, 24, 6), spirit, (0, 1.55, -.48), rotation=(math.pi / 2, 0, 0))
        add(s, 'talisman', box((.28, .54, .025)), paper, (-.48, 1.02, .48), rotation=(0, -.18, .08))
    elif kind == 'ember':
        add(s, 'weapon', cyl(.07, 1.48, 9), dark, (.83, 1.04, .02), rotation=(0, 0, -.48))
        add(s, 'signature', cone(.38, 1.08, 13), spirit, (1.17, 1.62, .02), rotation=(0, 0, -.34))
        add(s, 'flameCore', cone(.17, .70, 10), eye, (1.17, 1.58, .09), rotation=(0, 0, -.34))
        add(s, 'halo', torus(.78, .045, 24, 6), spirit, (0, 1.50, -.46), rotation=(math.pi / 2, 0, 0))
        add(s, 'talisman', box((.28, .54, .025)), paper, (-.48, 1.02, .48), rotation=(0, -.18, .08))
    elif kind == 'frost':
        add(s, 'hood', cone(.69, .76, 12), dark, (0, 2.28, -.02), scale=(1, .72, 1))
        add(s, 'weapon', cyl(.065, 1.72, 9), dark, (.70, 1.24, .02), rotation=(0, 0, -.18))
        add(s, 'signature', trimesh.creation.icosphere(subdivisions=1, radius=.31), spirit, (.84, 2.12, .02))
        add(s, 'halo', torus(.69, .05, 22, 6), spirit, (0, 1.42, -.48), rotation=(math.pi / 2, 0, 0))
    elif kind == 'wind':
        add(s, 'gatBrim', cyl(.88, .08, 16), dark, (0, 2.25, 0))
        add(s, 'gatCrown', cone(.68, .46, 14), dark, (0, 2.50, 0))
        add(s, 'weapon', torus(.48, .055, 22, 6), accent, (.72, 1.30, .05), rotation=(0, 0, -1.03))
        add(s, 'signature', cone(.12, .72, 8), spirit, (1.03, 1.52, .02), rotation=(0, 0, -.46))
        add(s, 'ribbon', box((.14, .84, .035)), main, (-.52, 1.22, -.44), rotation=(0, 0, .18))
    elif kind == 'stone':
        add(s, 'chestArmor', box((.95, .50, .22)), dark, (0, 1.18, .42))
        add(s, 'weapon', cyl(.18, 1.38, 8), dark, (.72, 1.22, .02), rotation=(0, 0, -.66))
        add(s, 'signature', trimesh.creation.icosphere(subdivisions=1, radius=.37), accent, (1.06, 1.70, .02))
        add(s, 'backStone', trimesh.creation.icosphere(subdivisions=1, radius=.42), main, (-.55, 1.18, -.38))
    elif kind == 'bell':
        add(s, 'hood', cone(.72, .88, 12), dark, (0, 2.27, 0), scale=(1, .76, 1))
        add(s, 'weapon', cyl(.055, .76, 8), dark, (.69, 1.45, .04), rotation=(0, 0, -.30))
        add(s, 'signature', cyl(.32, .50, 10), accent, (.82, 1.08, .04), rotation=(0, 0, -.30))
        add(s, 'talisman', box((.28, .54, .025)), paper, (-.44, 1.05, .48), rotation=(0, -.18, .08))
        add(s, 'halo', torus(.70, .045, 24, 6), spirit, (0, 1.48, -.48), rotation=(math.pi / 2, 0, 0))
    else:
        add(s, 'helmet', cyl(.57, .36, 10), dark, (0, 2.18, 0))
        add(s, 'crest', box((.16, .62, .16)), accent, (0, 2.60, 0), rotation=(0, 0, .12))
        add(s, 'weapon', box((.17, 1.48, .20)), accent, (.70, 1.36, .04), rotation=(0, 0, -.46))
        add(s, 'guard', box((.58, .12, .22)), dark, (.54, 1.68, .04), rotation=(0, 0, -.46))
        add(s, 'signature', torus(.35, .055, 18, 6), spirit, (.92, 2.04, .02), rotation=(math.pi / 2, 0, 0))
    return s


def monster_model(kind: str):
    palettes = {
        'imp': (0xa33b64, 0x2a1426, 0xdac18b, 0xffd86c, 0x49e1c7),
        'runner': (0xd86d3e, 0x4b251e, 0xe8b48b, 0xfff0a3, 0xff9d48),
        'brute': (0x75618d, 0x30283b, 0xb7a9c8, 0xffe28a, 0xa88cce),
        'shaman': (0x3f91a6, 0x1d3d4c, 0xd7bb91, 0xe9ffff, 0x59dfd2),
    }
    main_c, dark_c, skin_c, eye_c, accent_c = palettes[kind]
    s = trimesh.Scene()
    main = toon_source(f'{kind}Hide', main_c, .86)
    dark = toon_source(f'{kind}Shadow', dark_c, .92)
    skin = toon_source(f'{kind}Mask', skin_c, .88)
    eye = toon_source(f'{kind}Eyes', eye_c, .4, 0, eye_c, 1.6)
    accent = toon_source(f'{kind}Accent', accent_c, .58, .08, accent_c, .7)
    biped_base(s, kind, main, dark, main, eye, accent, head_scale=1.02, body_scale=(1.02, .90, .88), mask=True, low_detail=True)

    if kind == 'imp':
        add_horns(s, skin, .34, .30, .12)
        add(s, 'earL', cone(.18, .70, 8), dark, (-.61, 1.70, 0), rotation=(0, 0, -1.18))
        add(s, 'earR', cone(.18, .70, 8), dark, (.61, 1.70, 0), rotation=(0, 0, 1.18))
        add(s, 'weapon', cyl(.065, 1.10, 8), skin, (.74, 1.02, .12), rotation=(0, 0, -.78))
        add(s, 'signature', cone(.15, .62, 8), accent, (1.05, 1.27, .12), rotation=(0, 0, -.76))
        add(s, 'tail', torus(.43, .07, 18, 6), dark, (0, .73, -.39), rotation=(math.pi / 2, .25, .2))
    elif kind == 'runner':
        add(s, 'headWrap', torus(.56, .07, 20, 6), dark, (0, 1.94, -.02), rotation=(math.pi / 2, 0, 0))
        add(s, 'earL', cone(.14, .58, 8), main, (-.52, 1.90, .03), rotation=(0, 0, -1.03))
        add(s, 'earR', cone(.14, .58, 8), main, (.52, 1.90, .03), rotation=(0, 0, 1.03))
        add(s, 'weapon', cone(.18, .90, 9), accent, (.78, 1.06, .06), rotation=(0, 0, -1.10))
        add(s, 'signature', box((.12, .82, .06)), accent, (-.63, 1.12, -.40), rotation=(0, 0, .24))
        add(s, 'scarf', box((.18, 1.18, .05)), main, (0, 1.18, -.47), rotation=(0, 0, -.14))
    elif kind == 'brute':
        add(s, 'armorCore', trimesh.creation.icosphere(subdivisions=1, radius=.66), dark, (0, 1.08, .02), scale=(1.2, .86, .92))
        add(s, 'shoulderRockL', trimesh.creation.icosphere(subdivisions=1, radius=.34), accent, (-.70, 1.38, 0))
        add(s, 'shoulderRockR', trimesh.creation.icosphere(subdivisions=1, radius=.34), accent, (.70, 1.38, 0))
        add(s, 'weapon', box((.96, 1.26, .19)), dark, (.72, 1.17, .52), rotation=(-.08, 0, 0))
        add(s, 'signature', torus(.37, .07, 18, 6), accent, (0, 1.14, .66), rotation=(math.pi / 2, 0, 0))
        add_horns(s, accent, .40, .34, .15)
    else:
        add(s, 'hatBrim', cyl(.74, .07, 14), dark, (0, 2.22, 0))
        add(s, 'hat', cone(.58, .78, 12), dark, (0, 2.62, 0))
        add(s, 'weapon', cyl(.07, 1.72, 9), dark, (.70, 1.30, .02), rotation=(0, 0, -.16))
        add(s, 'signature', trimesh.creation.icosphere(subdivisions=1, radius=.29), accent, (.82, 2.15, .02))
        add(s, 'talisman', box((.28, .56, .025)), skin, (-.46, 1.06, .48), rotation=(0, -.18, .06))
        add(s, 'halo', torus(.70, .045, 22, 6), accent, (0, 1.47, -.48), rotation=(math.pi / 2, 0, 0))
    return s


def boss_tiger():
    s = trimesh.Scene()
    fur = toon_source('BloodMoonFur', 0xb44e42, .82)
    dark = toon_source('TigerShadow', 0x271522, .88)
    armor = toon_source('UnderworldArmor', 0x3a3047, .55, .35)
    gold = toon_source('RoyalGold', 0xe0b85e, .55, .32, 0xffbd55, .2)
    bone = toon_source('Muzzle', 0xe4c797, .82)
    eye = toon_source('BloodEye', 0xffe0a0, .35, 0, 0xff4b2e, 1.7)
    spirit = toon_source('BloodSpirit', 0xff574a, .38, 0, 0xff251d, 1.1)
    add(s, 'body', capsule(.78, 1.35, (16, 11)), fur, (0, 1.04, -.28), rotation=(0, 0, math.pi / 2), scale=(1, 1, .9))
    add(s, 'chestArmor', box((1.22, .72, .22)), armor, (0, 1.35, .40), rotation=(.05, 0, 0))
    add(s, 'head', uv_sphere(.77, (18, 12)), fur, (0, 1.65, .72), scale=(1.05, .95, .96))
    add(s, 'muzzle', uv_sphere(.39, (13, 9)), bone, (0, 1.50, 1.34), scale=(1.2, .64, .78))
    add(s, 'nose', uv_sphere(.17, (9, 6)), dark, (0, 1.56, 1.70), scale=(1.25, .65, .70))
    add(s, 'eyeL', uv_sphere(.10, (9, 6)), eye, (-.28, 1.82, 1.42))
    add(s, 'eyeR', uv_sphere(.10, (9, 6)), eye, (.28, 1.82, 1.42))
    add(s, 'earL', cone(.20, .50, 9), dark, (-.48, 2.24, .66), rotation=(.35, 0, -.25))
    add(s, 'earR', cone(.20, .50, 9), dark, (.48, 2.24, .66), rotation=(.35, 0, .25))
    add(s, 'mane', torus(1.0, .20, 28, 7), dark, (0, 1.67, .38), rotation=(math.pi / 2, 0, 0))
    for i, x in enumerate([-.52, .52]):
        add(s, f'frontLeg{i}', capsule(.19, .92, (10, 8)), fur, (x, .58, .54))
        add(s, f'frontPaw{i}', uv_sphere(.32, (10, 7)), dark, (x, .12, .86), scale=(1.22, .60, 1.50))
        add(s, f'backLeg{i}', capsule(.22, .82, (10, 8)), fur, (x, .55, -1.02))
        add(s, f'backPaw{i}', uv_sphere(.28, (10, 7)), dark, (x, .12, -.83), scale=(1.20, .65, 1.50))
    add(s, 'tail', torus(.75, .12, 24, 7), fur, (0, 1.05, -1.52), rotation=(math.pi / 2, .25, .45))
    add(s, 'weapon', cone(.14, .65, 9), gold, (0, 2.55, .40), rotation=(0, 0, math.pi))
    add(s, 'signature', torus(1.10, .07, 32, 7), spirit, (0, 1.72, .18), rotation=(math.pi / 2, 0, 0))
    add(s, 'halo', torus(1.25, .035, 34, 6), gold, (0, 1.72, .05), rotation=(math.pi / 2, 0, 0))
    return s


def boss_serpent():
    s = trimesh.Scene()
    teal = toon_source('MoonSerpent', 0x3fae9b, .76)
    dark = toon_source('DeepScale', 0x183f4a, .88)
    jade = toon_source('MoonJade', 0x73f0da, .40, .08, 0x55e8cd, 1.0)
    bone = toon_source('HornBone', 0xe3d19b, .82)
    eye = toon_source('SerpentEye', 0xf8ffbd, .30, 0, 0x7fffe5, 1.5)
    for i in range(7):
        radius = .48 + i * .13
        add(s, f'coil{i}', torus(radius, .13, 24, 7), teal if i % 2 == 0 else dark, (0, .42 + i * .18, -.07 * i), rotation=(math.pi / 2, 0, i * .32))
    add(s, 'body', capsule(.34, 1.55, (14, 10)), teal, (0, 1.88, .05), rotation=(0, 0, -.08))
    add(s, 'head', uv_sphere(.62, (17, 11)), teal, (0, 2.76, .18), scale=(1.0, .78, 1.16))
    add(s, 'muzzle', uv_sphere(.30, (12, 8)), bone, (0, 2.64, .74), scale=(1.25, .58, .92))
    add(s, 'eyeL', uv_sphere(.09, (9, 6)), eye, (-.22, 2.86, .67))
    add(s, 'eyeR', uv_sphere(.09, (9, 6)), eye, (.22, 2.86, .67))
    add(s, 'hornL', cone(.14, .68, 9), bone, (-.31, 3.36, .04), rotation=(0, 0, -.28))
    add(s, 'hornR', cone(.14, .68, 9), bone, (.31, 3.36, .04), rotation=(0, 0, .28))
    add(s, 'armL', capsule(.12, .55, (9, 7)), teal, (-.42, 2.25, .18), rotation=(0, 0, .65))
    add(s, 'armR', capsule(.12, .55, (9, 7)), teal, (.42, 2.25, .18), rotation=(0, 0, -.65))
    add(s, 'weapon', cyl(.06, 1.16, 9), dark, (.64, 2.18, .10), rotation=(0, 0, -.42))
    add(s, 'signature', torus(.78, .06, 26, 7), jade, (0, 2.58, -.46), rotation=(math.pi / 2, 0, 0))
    add(s, 'halo', torus(1.02, .035, 30, 6), jade, (0, 2.55, -.58), rotation=(math.pi / 2, 0, 0))
    return s


def boss_king():
    s = trimesh.Scene()
    royal = toon_source('GhostRoyal', 0x6d3ac7, .80)
    dark = toon_source('NightRoyal', 0x241330, .90)
    mask = toon_source('IvoryMask', 0xe0c99b, .86)
    magenta = toon_source('EclipseMagenta', 0xff60d9, .42, .06, 0xff43d3, 1.0)
    gold = toon_source('RoyalGold', 0xe0b85e, .56, .28, 0xffc45e, .2)
    eye = toon_source('KingEye', 0xffffcf, .32, 0, 0xff65df, 1.5)
    biped_base(s, 'king', royal, dark, royal, eye, gold, head_scale=1.08, body_scale=(1.16, 1.22, .94), mask=True)
    add(s, 'crownBase', cyl(.64, .28, 12), dark, (0, 2.36, 0))
    for i in range(5):
        angle = -0.8 + i * .4
        add(s, f'crownSpike{i}', cone(.12, .68 + (i == 2) * .18, 8), gold, (math.sin(angle) * .46, 2.72 + math.cos(angle) * .10, 0), rotation=(0, 0, angle * .42))
    add(s, 'weapon', cyl(.08, 1.75, 10), dark, (.78, 1.34, .02), rotation=(0, 0, -.22))
    add(s, 'signature', trimesh.creation.icosphere(subdivisions=1, radius=.34), magenta, (.95, 2.22, .02))
    add(s, 'halo', torus(1.05, .065, 30, 7), magenta, (0, 1.75, -.55), rotation=(math.pi / 2, 0, 0))
    for i in range(4):
        a = i * math.pi / 2
        add(s, f'orbitMask{i}', trimesh.creation.icosphere(subdivisions=0, radius=1.0), mask, (math.cos(a) * 1.04, 1.75 + math.sin(a * 2) * .18, math.sin(a) * .55), scale=(.20, .28, .12))
    return s


def export(scene, name):
    data = scene.export(file_type='glb')
    path = OUT / name
    path.write_bytes(data)
    faces = sum(len(g.faces) for g in scene.geometry.values())
    print(f'{name}: {len(data) / 1024:.1f} KB, triangles={faces}')


if __name__ == '__main__':
    if '--prototype-only' not in sys.argv:
        raise SystemExit('BLOCKED: 이 생성기는 개발용 프로토타입 전용입니다. 실행하려면 --prototype-only를 명시하세요. AAA 제작 에셋에는 사용하지 마세요.')
    models = {
        'player-moon-captain-sd-toon.glb': guardian_model('player'),
        'guardian-ember-sd-toon.glb': guardian_model('ember'),
        'guardian-frost-sd-toon.glb': guardian_model('frost'),
        'guardian-wind-sd-toon.glb': guardian_model('wind'),
        'guardian-stone-sd-toon.glb': guardian_model('stone'),
        'guardian-bell-sd-toon.glb': guardian_model('bell'),
        'guardian-thunder-sd-toon.glb': guardian_model('thunder'),
        'monster-imp-sd-toon.glb': monster_model('imp'),
        'monster-runner-sd-toon.glb': monster_model('runner'),
        'monster-brute-sd-toon.glb': monster_model('brute'),
        'monster-shaman-sd-toon.glb': monster_model('shaman'),
        'boss-tiger-sd-toon.glb': boss_tiger(),
        'boss-serpent-sd-toon.glb': boss_serpent(),
        'boss-king-sd-toon.glb': boss_king(),
    }
    for filename, scene in models.items():
        export(scene, filename)
