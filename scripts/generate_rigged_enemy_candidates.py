#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import math
import struct
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image, ImageDraw, ImageFilter

from generate_golden_hero_glb import (
    Builder, STYLE_LOCK_ID, matrix, quaternion, combine_quaternions,
    uv_sphere, capsule, cylinder, cone, box, torus, make_part
)

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / 'public' / 'assets' / 'models'
RIG_ID = 'DOKKAEBI-HUMANOID-RIG-1'
CLIPS = ['Idle', 'Walk', 'Run', 'Attack', 'Skill', 'Hit', 'Death']

PROFILES = {
    'brute': {
        'asset_id': 'monster-brute-sd-toon',
        'file': 'monster-brute-sd-toon.glb',
        'display': '돌갑옷 귀수',
        'base': (102, 128, 112),
        'accent': (225, 168, 72),
        'spirit': (72, 222, 185),
        'generator': 'Dokkaebi Rigged Brute Candidate v1',
    },
    'shaman': {
        'asset_id': 'monster-shaman-sd-toon',
        'file': 'monster-shaman-sd-toon.glb',
        'display': '저주 무당',
        'base': (118, 79, 160),
        'accent': (245, 207, 104),
        'spirit': (96, 198, 255),
        'generator': 'Dokkaebi Rigged Shaman Candidate v1',
    },
}


def texture_set(profile):
    size = 256
    base_rgb = profile['base']
    accent_rgb = profile['accent']
    spirit_rgb = profile['spirit']
    base = Image.new('RGB', (size, size), base_rgb)
    px = base.load()
    for y in range(size):
        for x in range(size):
            radial = max(0.0, 1.0 - math.hypot(x - 88, y - 70) / 245)
            weave = math.sin(x * .07 + y * .035) * 5 + math.sin(y * .12) * 2
            px[x, y] = tuple(max(0, min(255, int(channel * (.72 + radial * .34) + weave))) for channel in base_rgb)
    draw = ImageDraw.Draw(base, 'RGBA')
    draw.ellipse((18, 16, 174, 170), fill=(*accent_rgb, 32))
    draw.arc((18, 22, 236, 238), 200, 338, fill=(*accent_rgb, 126), width=9)
    draw.rounded_rectangle((24, 184, 232, 226), radius=16, outline=(*accent_rgb, 92), width=5)
    base = base.filter(ImageFilter.GaussianBlur(.38))

    normal = Image.new('RGB', (size, size), (128, 128, 255))
    nd = ImageDraw.Draw(normal)
    for y in range(8, size, 24):
        nd.arc((12, y - 8, 244, y + 20), 190, 350, fill=(128, 124 + (y // 24) % 7, 255), width=2)

    orm = Image.new('RGB', (size, size), (238, 180, 18))
    op = orm.load()
    for y in range(size):
        for x in range(size):
            roughness = int(152 + 55 * (y / (size - 1)))
            metallic = 20 if x < 176 else 92
            op[x, y] = (235, roughness, metallic)

    emissive = Image.new('RGB', (size, size), (0, 0, 0))
    ed = ImageDraw.Draw(emissive)
    ed.ellipse((68, 54, 188, 174), fill=spirit_rgb)
    ed.ellipse((96, 82, 160, 146), fill=tuple(min(255, c + 48) for c in spirit_rgb))
    emissive = emissive.filter(ImageFilter.GaussianBlur(10))

    payloads = []
    for image in (base, normal, orm, emissive):
        stream = io.BytesIO()
        image.save(stream, format='PNG', optimize=True)
        payloads.append(stream.getvalue())
    return payloads


def skeleton():
    joint_names = ['Armature', 'Hips', 'Spine', 'Head', 'Arm_L', 'Hand_L', 'Arm_R', 'Hand_R', 'WeaponSocket', 'Leg_L', 'Foot_L', 'Leg_R', 'Foot_R', 'AccessorySocket']
    local_positions = {
        'Armature': (0, 0, 0), 'Hips': (0, .72, 0), 'Spine': (0, .55, 0), 'Head': (0, .72, .02),
        'Arm_L': (-.56, .23, 0), 'Hand_L': (0, -.48, .05), 'Arm_R': (.56, .23, 0), 'Hand_R': (0, -.48, .05),
        'WeaponSocket': (.05, -.05, .12), 'Leg_L': (-.25, -.34, 0), 'Foot_L': (0, -.36, .18),
        'Leg_R': (.25, -.34, 0), 'Foot_R': (0, -.36, .18), 'AccessorySocket': (0, .12, -.36),
    }
    parent = {
        'Armature': None, 'Hips': 'Armature', 'Spine': 'Hips', 'Head': 'Spine',
        'Arm_L': 'Spine', 'Hand_L': 'Arm_L', 'Arm_R': 'Spine', 'Hand_R': 'Arm_R', 'WeaponSocket': 'Hand_R',
        'Leg_L': 'Hips', 'Foot_L': 'Leg_L', 'Leg_R': 'Hips', 'Foot_R': 'Leg_R', 'AccessorySocket': 'Spine',
    }
    world = {}
    for name in joint_names:
        local = np.array(matrix(local_positions[name]), dtype=np.float64)
        world[name] = local if parent[name] is None else world[parent[name]] @ local
    nodes = [{'name': 'SceneRoot', 'children': [1, len(joint_names) + 1]}]
    node_index = {name: index + 1 for index, name in enumerate(joint_names)}
    for name in joint_names:
        node = {'name': name, 'translation': list(local_positions[name])}
        children = [node_index[child] for child in joint_names if parent[child] == name]
        if children:
            node['children'] = children
        nodes.append(node)
    return joint_names, local_positions, parent, world, nodes, node_index


def materials(profile):
    base = [c / 255 for c in profile['base']]
    accent = [c / 255 for c in profile['accent']]
    spirit = [c / 255 for c in profile['spirit']]
    return [
        {'name': 'Skin_HandPainted', 'pbrMetallicRoughness': {'baseColorFactor': [*base, 1], 'metallicFactor': 0, 'roughnessFactor': .7}},
        {'name': 'Cloth_Primary', 'pbrMetallicRoughness': {'baseColorFactor': [base[0] * .72, base[1] * .72, base[2] * .78, 1], 'metallicFactor': 0, 'roughnessFactor': .86}},
        {'name': 'Armor_StoneOrLacquer', 'pbrMetallicRoughness': {'baseColorFactor': [base[0] * .58, base[1] * .62, base[2] * .6, 1], 'metallicFactor': .08, 'roughnessFactor': .77}},
        {'name': 'Accent_Gold', 'pbrMetallicRoughness': {'baseColorFactor': [*accent, 1], 'metallicFactor': .28, 'roughnessFactor': .48}},
        {'name': 'Weapon', 'pbrMetallicRoughness': {'baseColorFactor': [.28, .17, .1, 1], 'metallicFactor': .12, 'roughnessFactor': .72}},
        {'name': 'Spirit_Emissive', 'pbrMetallicRoughness': {'baseColorFactor': [*spirit, 1], 'metallicFactor': 0, 'roughnessFactor': .32}, 'emissiveFactor': [spirit[0] * .65, spirit[1] * .65, spirit[2] * .7]},
        {'name': 'Eye_Ink', 'pbrMetallicRoughness': {'baseColorFactor': [.04, .025, .065, 1], 'metallicFactor': 0, 'roughnessFactor': .42}},
        {'name': 'Eye_Highlight', 'pbrMetallicRoughness': {'baseColorFactor': [1, .98, .84, 1], 'metallicFactor': 0, 'roughnessFactor': .28}, 'emissiveFactor': [.3, .28, .16]},
    ]


def low_torus(major, minor):
    return trimesh.creation.torus(major_radius=major, minor_radius=minor, major_sections=22, minor_sections=8)


def brute_parts():
    parts = [
        make_part('Body', capsule(.48, .5, (20, 12)), 'Spine', 1, matrix((0, 1.2, 0), rotation=(math.pi / 2, 0, 0), scale=(1.18, 1.05, .96))),
        make_part('Pelvis', capsule(.38, .25, (16, 10)), 'Hips', 2, matrix((0, .78, 0), rotation=(math.pi / 2, 0, 0), scale=(1.22, 1, .94))),
        make_part('Head', uv_sphere(.65, (24, 16)), 'Head', 0, matrix((0, 2.05, .02), scale=(1.06, .94, .9))),
        make_part('BrowPlate', box((.86, .17, .16)), 'Head', 2, matrix((0, 2.22, .52), rotation=(-.08, 0, 0))),
        make_part('Cheek_L', uv_sphere(.17, (10, 7)), 'Head', 0, matrix((-.37, 1.96, .48), scale=(1, .82, .46))),
        make_part('Cheek_R', uv_sphere(.17, (10, 7)), 'Head', 0, matrix((.37, 1.96, .48), scale=(1, .82, .46))),
        make_part('Eye_L', uv_sphere(.13, (12, 8)), 'Head', 6, matrix((-.23, 2.1, .59), scale=(1, 1.05, .4))),
        make_part('Eye_R', uv_sphere(.13, (12, 8)), 'Head', 6, matrix((.23, 2.1, .59), scale=(1, 1.05, .4))),
        make_part('EyeGlow_L', uv_sphere(.043, (10, 7)), 'Head', 7, matrix((-.2, 2.13, .68))),
        make_part('EyeGlow_R', uv_sphere(.043, (10, 7)), 'Head', 7, matrix((.26, 2.13, .68))),
        make_part('Horn_L', cone(.17, .48, 16), 'Head', 3, matrix((-.35, 2.59, -.02), rotation=(0, 0, -.3))),
        make_part('Horn_R', cone(.17, .48, 16), 'Head', 3, matrix((.35, 2.59, -.02), rotation=(0, 0, .3))),
        make_part('Shoulder_L', uv_sphere(.31, (14, 9)), 'Arm_L', 2, matrix((-.57, 1.46, -.01), scale=(1.2, .75, 1.0))),
        make_part('Shoulder_R', uv_sphere(.31, (14, 9)), 'Arm_R', 2, matrix((.57, 1.46, -.01), scale=(1.2, .75, 1.0))),
        make_part('ChestPlate', box((.92, .5, .2)), 'Spine', 2, matrix((0, 1.27, .42), rotation=(-.05, 0, 0))),
        make_part('Belt', low_torus(.46, .065), 'Hips', 3, matrix((0, .89, 0), rotation=(math.pi / 2, 0, 0))),
        make_part('Arm_L', capsule(.17, .48, (13, 8)), 'Arm_L', 0, matrix((-.62, 1.13, .01), rotation=(math.pi / 2, 0, .18))),
        make_part('Arm_R', capsule(.17, .48, (13, 8)), 'Arm_R', 0, matrix((.62, 1.13, .01), rotation=(math.pi / 2, 0, -.18))),
        make_part('Hand_L', uv_sphere(.23, (12, 8)), 'Hand_L', 0, matrix((-.72, .77, .1))),
        make_part('Hand_R', uv_sphere(.23, (12, 8)), 'Hand_R', 0, matrix((.72, .77, .1))),
        make_part('Leg_L', capsule(.18, .36, (14, 9)), 'Leg_L', 2, matrix((-.27, .42, 0), rotation=(math.pi / 2, 0, .04))),
        make_part('Leg_R', capsule(.18, .36, (14, 9)), 'Leg_R', 2, matrix((.27, .42, 0), rotation=(math.pi / 2, 0, -.04))),
        make_part('Foot_L', uv_sphere(.29, (12, 8)), 'Foot_L', 2, matrix((-.29, .14, .2), scale=(1.08, .66, 1.45))),
        make_part('Foot_R', uv_sphere(.29, (12, 8)), 'Foot_R', 2, matrix((.29, .14, .2), scale=(1.08, .66, 1.45))),
        make_part('HammerHandle', cylinder(.12, 1.24, 16), 'WeaponSocket', 4, matrix((.82, 1.18, .04), rotation=(0, 0, -.36))),
        make_part('HammerHead', box((.7, .4, .42)), 'WeaponSocket', 2, matrix((1.06, 1.73, .04), rotation=(0, 0, -.12))),
        make_part('BackRune', low_torus(.65, .07), 'AccessorySocket', 5, matrix((0, 1.45, -.48), rotation=(math.pi / 2, 0, 0))),
        make_part('BackStone_L', uv_sphere(.25, (11, 8)), 'AccessorySocket', 2, matrix((-.43, 1.25, -.43), scale=(.8, 1.25, .75))),
        make_part('BackStone_R', uv_sphere(.25, (11, 8)), 'AccessorySocket', 2, matrix((.43, 1.25, -.43), scale=(.8, 1.25, .75))),
    ]
    return parts


def shaman_parts():
    parts = [
        make_part('Body', capsule(.39, .57, (20, 12)), 'Spine', 1, matrix((0, 1.2, 0), rotation=(math.pi / 2, 0, 0), scale=(1.0, 1.05, .84))),
        make_part('Pelvis', capsule(.32, .24, (16, 10)), 'Hips', 1, matrix((0, .78, 0), rotation=(math.pi / 2, 0, 0), scale=(1.08, 1, .82))),
        make_part('Head', uv_sphere(.62, (24, 16)), 'Head', 0, matrix((0, 2.07, .03), scale=(.98, .98, .9))),
        make_part('Cheek_L', uv_sphere(.145, (10, 7)), 'Head', 0, matrix((-.33, 1.99, .47), scale=(1, .78, .44))),
        make_part('Cheek_R', uv_sphere(.145, (10, 7)), 'Head', 0, matrix((.33, 1.99, .47), scale=(1, .78, .44))),
        make_part('Eye_L', uv_sphere(.13, (12, 8)), 'Head', 6, matrix((-.22, 2.11, .57), scale=(1, 1.16, .42))),
        make_part('Eye_R', uv_sphere(.13, (12, 8)), 'Head', 6, matrix((.22, 2.11, .57), scale=(1, 1.16, .42))),
        make_part('EyeGlow_L', uv_sphere(.045, (10, 7)), 'Head', 7, matrix((-.19, 2.15, .67))),
        make_part('EyeGlow_R', uv_sphere(.045, (10, 7)), 'Head', 7, matrix((.25, 2.15, .67))),
        make_part('GatBrim', cylinder(.78, .065, 24), 'Head', 2, matrix((0, 2.43, -.02), rotation=(math.pi / 2, 0, 0))),
        make_part('GatCrown', cone(.48, .43, 20), 'Head', 2, matrix((0, 2.67, -.02))),
        make_part('HatCharm', box((.2, .47, .025)), 'Head', 3, matrix((0, 2.59, .43), rotation=(-.08, 0, 0))),
        make_part('Sleeve_L', capsule(.24, .66, (14, 8)), 'Arm_L', 1, matrix((-.61, 1.1, .01), rotation=(math.pi / 2, 0, .12), scale=(1, 1.08, 1))),
        make_part('Sleeve_R', capsule(.24, .66, (14, 8)), 'Arm_R', 1, matrix((.61, 1.1, .01), rotation=(math.pi / 2, 0, -.12), scale=(1, 1.08, 1))),
        make_part('Hand_L', uv_sphere(.18, (12, 8)), 'Hand_L', 0, matrix((-.71, .72, .1))),
        make_part('Hand_R', uv_sphere(.18, (12, 8)), 'Hand_R', 0, matrix((.71, .72, .1))),
        make_part('ChestKnot', low_torus(.19, .045), 'Spine', 3, matrix((0, 1.32, .47), rotation=(math.pi / 2, 0, 0))),
        make_part('RobePanel', box((.42, .74, .06)), 'Hips', 1, matrix((0, .71, .31), rotation=(-.05, 0, 0))),
        make_part('Leg_L', capsule(.14, .34, (14, 9)), 'Leg_L', 1, matrix((-.23, .43, 0), rotation=(math.pi / 2, 0, .03))),
        make_part('Leg_R', capsule(.14, .34, (14, 9)), 'Leg_R', 1, matrix((.23, .43, 0), rotation=(math.pi / 2, 0, -.03))),
        make_part('Foot_L', uv_sphere(.24, (12, 8)), 'Foot_L', 2, matrix((-.25, .16, .2), scale=(1, .62, 1.4))),
        make_part('Foot_R', uv_sphere(.24, (12, 8)), 'Foot_R', 2, matrix((.25, .16, .2), scale=(1, .62, 1.4))),
        make_part('Staff', cylinder(.075, 1.55, 16), 'WeaponSocket', 4, matrix((.78, 1.2, .02), rotation=(0, 0, -.14))),
        make_part('StaffRing', low_torus(.3, .055), 'WeaponSocket', 3, matrix((.95, 1.92, .02), rotation=(math.pi / 2, 0, 0))),
        make_part('SpiritOrb', uv_sphere(.2, (14, 9)), 'WeaponSocket', 5, matrix((.95, 1.92, .03))),
        make_part('BackHalo', low_torus(.72, .05), 'AccessorySocket', 5, matrix((0, 1.48, -.48), rotation=(math.pi / 2, 0, 0))),
        make_part('Talisman_L', box((.24, .62, .025)), 'AccessorySocket', 3, matrix((-.42, 1.17, -.34), rotation=(0, -.14, .12))),
        make_part('Talisman_R', box((.24, .62, .025)), 'AccessorySocket', 3, matrix((.42, 1.17, -.34), rotation=(0, .14, -.12))),
    ]
    return parts


def add_animations(builder, animations, node_index, profile_key):
    def add_clip(name, duration, frames, channels):
        times = np.linspace(0, duration, frames, dtype=np.float32)
        input_accessor = builder.add_accessor(times, bounds=True)
        samplers = []
        output_channels = []
        for track in channels:
            output = builder.add_accessor(np.asarray(track['values'], dtype=np.float32))
            sampler_index = len(samplers)
            samplers.append({'input': input_accessor, 'output': output, 'interpolation': 'LINEAR'})
            output_channels.append({'sampler': sampler_index, 'target': {'node': node_index[track['joint']], 'path': track['path']}})
        animations.append({'name': name, 'samplers': samplers, 'channels': output_channels, 'extras': {'rigCandidate': True, 'archetype': profile_key}})

    def rot(axis, values):
        return [quaternion(axis, angle) for angle in values]

    heavy = 1.15 if profile_key == 'brute' else .86
    add_clip('Idle', 2.2, 5, [
        {'joint': 'Armature', 'path': 'translation', 'values': [[0,0,0],[0,.022,0],[0,0,0],[0,.016,0],[0,0,0]]},
        {'joint': 'Head', 'path': 'rotation', 'values': rot((0,1,0), [0,.07,0,-.07,0])},
        {'joint': 'AccessorySocket', 'path': 'rotation', 'values': rot((0,0,1), [0,.11,0,-.11,0])},
    ])
    add_clip('Walk', .84 * heavy, 5, [
        {'joint': 'Arm_L', 'path': 'rotation', 'values': rot((1,0,0), [.42,0,-.42,0,.42])},
        {'joint': 'Arm_R', 'path': 'rotation', 'values': rot((1,0,0), [-.42,0,.42,0,-.42])},
        {'joint': 'Leg_L', 'path': 'rotation', 'values': rot((1,0,0), [-.48,0,.48,0,-.48])},
        {'joint': 'Leg_R', 'path': 'rotation', 'values': rot((1,0,0), [.48,0,-.48,0,.48])},
        {'joint': 'Armature', 'path': 'translation', 'values': [[0,0,0],[0,.05,0],[0,0,0],[0,.05,0],[0,0,0]]},
    ])
    add_clip('Run', .58 * heavy, 5, [
        {'joint': 'Spine', 'path': 'rotation', 'values': rot((1,0,0), [-.12,-.16,-.12,-.16,-.12])},
        {'joint': 'Arm_L', 'path': 'rotation', 'values': rot((1,0,0), [.75,0,-.75,0,.75])},
        {'joint': 'Arm_R', 'path': 'rotation', 'values': rot((1,0,0), [-.75,0,.75,0,-.75])},
        {'joint': 'Leg_L', 'path': 'rotation', 'values': rot((1,0,0), [-.78,0,.78,0,-.78])},
        {'joint': 'Leg_R', 'path': 'rotation', 'values': rot((1,0,0), [.78,0,-.78,0,.78])},
    ])
    if profile_key == 'brute':
        attack_spine = [(0,0),(-.35,-.08),(.42,-.2),(.15,-.05),(0,0)]
        attack_arm = [(-.1,-.1),(-1.0,-.55),(.9,.46),(.22,.12),(-.1,-.1)]
    else:
        attack_spine = [(0,0),(-.2,-.04),(.28,-.08),(.1,-.03),(0,0)]
        attack_arm = [(-.1,-.08),(-.72,-.32),(.45,.28),(.12,.08),(-.1,-.08)]
    add_clip('Attack', .72 if profile_key == 'brute' else .62, 5, [
        {'joint': 'Spine', 'path': 'rotation', 'values': [combine_quaternions(quaternion((0,1,0), a), quaternion((1,0,0), b)) for a,b in attack_spine]},
        {'joint': 'Arm_R', 'path': 'rotation', 'values': [combine_quaternions(quaternion((1,0,0), a), quaternion((0,0,1), b)) for a,b in attack_arm]},
        {'joint': 'WeaponSocket', 'path': 'rotation', 'values': rot((0,1,0), [0,-.5,.8,.24,0])},
    ])
    add_clip('Skill', 1.25, 6, [
        {'joint': 'Arm_L', 'path': 'rotation', 'values': rot((1,0,0), [0,-.35,-.95,-1.2,-.3,0])},
        {'joint': 'Arm_R', 'path': 'rotation', 'values': rot((1,0,0), [0,-.35,-.95,-1.2,-.3,0])},
        {'joint': 'AccessorySocket', 'path': 'scale', 'values': [[1,1,1],[1.08,1.08,1.08],[1.22,1.22,1.22],[1.4,1.4,1.4],[1.1,1.1,1.1],[1,1,1]]},
        {'joint': 'Armature', 'path': 'translation', 'values': [[0,0,0],[0,.03,0],[0,.08,0],[0,.14,0],[0,.03,0],[0,0,0]]},
    ])
    add_clip('Hit', .36, 4, [
        {'joint': 'Spine', 'path': 'rotation', 'values': rot((0,0,1), [0,.18,-.1,0])},
        {'joint': 'Head', 'path': 'rotation', 'values': rot((0,0,1), [0,-.2,.1,0])},
        {'joint': 'Armature', 'path': 'translation', 'values': [[0,0,0],[-.07,0,0],[.025,0,0],[0,0,0]]},
    ])
    add_clip('Death', 1.0, 5, [
        {'joint': 'Armature', 'path': 'rotation', 'values': rot((1,0,0), [0,-.18,-.68,-1.15,-1.46])},
        {'joint': 'Armature', 'path': 'translation', 'values': [[0,0,0],[0,0,0],[0,-.07,.05],[0,-.2,.17],[0,-.3,.24]]},
        {'joint': 'Arm_L', 'path': 'rotation', 'values': rot((0,0,1), [0,-.2,-.48,-.7,-.88])},
        {'joint': 'Arm_R', 'path': 'rotation', 'values': rot((0,0,1), [0,.2,.48,.7,.88])},
    ])


def build(profile_key):
    profile = PROFILES[profile_key]
    builder = Builder()
    joint_names, _, _, world, nodes, node_index = skeleton()
    mats = materials(profile)

    images = []
    textures = []
    for label, payload in zip(('BaseColor', 'Normal', 'ORM', 'Emissive'), texture_set(profile)):
        view = builder.add_view(payload)
        images.append({'name': label, 'bufferView': view, 'mimeType': 'image/png'})
        textures.append({'source': len(images) - 1, 'sampler': 0})
    for index, material in enumerate(mats):
        pbr = material['pbrMetallicRoughness']
        pbr['baseColorTexture'] = {'index': 0}
        pbr['metallicRoughnessTexture'] = {'index': 2}
        material['normalTexture'] = {'index': 1, 'scale': .35}
        material['occlusionTexture'] = {'index': 2, 'strength': .6}
        if index in (5, 7):
            material['emissiveTexture'] = {'index': 3}

    parts = brute_parts() if profile_key == 'brute' else shaman_parts()
    joint_to_skin = {name: index for index, name in enumerate(joint_names)}
    primitives = []
    triangle_count = 0
    for part in parts:
        positions = builder.add_accessor(part['vertices'], target=34962, bounds=True)
        normals = builder.add_accessor(part['normals'], target=34962)
        uvs = builder.add_accessor(part['uv'], target=34962)
        joints = np.zeros((len(part['vertices']), 4), dtype=np.uint8)
        joints[:, 0] = joint_to_skin[part['joint']]
        weights = np.zeros((len(part['vertices']), 4), dtype=np.float32)
        weights[:, 0] = 1.0
        joint_accessor = builder.add_accessor(joints, target=34962)
        weight_accessor = builder.add_accessor(weights, target=34962)
        indices = builder.add_accessor(part['indices'], target=34963)
        triangle_count += len(part['indices']) // 3
        primitives.append({
            'attributes': {'POSITION': positions, 'NORMAL': normals, 'TEXCOORD_0': uvs, 'JOINTS_0': joint_accessor, 'WEIGHTS_0': weight_accessor},
            'indices': indices,
            'material': part['material'],
            'mode': 4,
            'extras': {'partName': part['name'], 'boundJoint': part['joint']},
        })

    inverse_bind = [np.linalg.inv(world[name]).astype(np.float32).T.reshape(-1) for name in joint_names]
    inverse_bind_accessor = builder.add_accessor(np.asarray(inverse_bind, dtype=np.float32))
    nodes.append({'name': f'{profile_key.title()}CandidateMesh', 'mesh': 0, 'skin': 0})
    animations = []
    add_animations(builder, animations, node_index, profile_key)

    gltf = {
        'asset': {
            'version': '2.0',
            'generator': profile['generator'],
            'extras': {
                'styleLockId': STYLE_LOCK_ID,
                'approvalStage': 'art-review',
                'rigCandidate': True,
                'rigVersion': RIG_ID,
                'technicalReady': True,
                'artDirectorApproved': False,
                'archetype': profile_key,
                'displayName': profile['display'],
                'notes': 'Shared-rig technical candidate. Final art-direction approval is still required.'
            },
        },
        'scene': 0,
        'scenes': [{'name': f'{profile_key.title()}CandidateScene', 'nodes': [0]}],
        'nodes': nodes,
        'meshes': [{'name': f'{profile_key.title()}CandidateMesh', 'primitives': primitives, 'extras': {'triangles': triangle_count}}],
        'skins': [{'name': 'DokkaebiHumanoidRig', 'inverseBindMatrices': inverse_bind_accessor, 'skeleton': node_index['Armature'], 'joints': [node_index[name] for name in joint_names]}],
        'animations': animations,
        'materials': mats,
        'images': images,
        'textures': textures,
        'samplers': [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}],
        'accessors': builder.accessors,
        'bufferViews': builder.buffer_views,
        'buffers': [{'byteLength': len(builder.binary)}],
        'extras': {
            'styleLockId': STYLE_LOCK_ID,
            'category': 'monster',
            'rigCandidate': True,
            'triangles': triangle_count,
            'requiredClips': CLIPS,
            'sockets': ['WeaponSocket', 'AccessorySocket'],
        },
    }

    json_bytes = json.dumps(gltf, separators=(',', ':'), ensure_ascii=False).encode('utf8')
    while len(json_bytes) % 4:
        json_bytes += b' '
    binary = bytes(builder.binary)
    while len(binary) % 4:
        binary += b'\0'
    total = 12 + 8 + len(json_bytes) + 8 + len(binary)
    payload = bytearray(struct.pack('<4sII', b'glTF', 2, total))
    payload.extend(struct.pack('<II', len(json_bytes), 0x4E4F534A))
    payload.extend(json_bytes)
    payload.extend(struct.pack('<II', len(binary), 0x004E4942))
    payload.extend(binary)

    output = MODEL_DIR / profile['file']
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(payload)
    print(f'WROTE {output} · {triangle_count} triangles · {len(animations)} clips · {len(payload)} bytes')


if __name__ == '__main__':
    for key in ('brute', 'shaman'):
        build(key)
