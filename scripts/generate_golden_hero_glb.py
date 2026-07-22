#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import math
import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import trimesh
from trimesh.transformations import rotation_matrix, translation_matrix, concatenate_matrices

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'assets' / 'models' / 'player-dokkaebi-warrior-golden-v1.glb'
STYLE_LOCK_ID = 'DD-AAA-CASUAL-SD-PBR-3.0'

COMPONENT = {
    np.dtype(np.float32): 5126,
    np.dtype(np.uint32): 5125,
    np.dtype(np.uint16): 5123,
    np.dtype(np.uint8): 5121,
}
TYPE_SIZE = {1: 'SCALAR', 2: 'VEC2', 3: 'VEC3', 4: 'VEC4', 16: 'MAT4'}


def align4(data: bytearray):
    while len(data) % 4:
        data.append(0)


def matrix(position=(0, 0, 0), rotation=(0, 0, 0), scale=(1, 1, 1)):
    sm = np.diag([scale[0], scale[1], scale[2], 1.0])
    rx = rotation_matrix(rotation[0], [1, 0, 0])
    ry = rotation_matrix(rotation[1], [0, 1, 0])
    rz = rotation_matrix(rotation[2], [0, 0, 1])
    return concatenate_matrices(translation_matrix(position), rz, ry, rx, sm)


def quaternion(axis, angle):
    axis = np.asarray(axis, dtype=np.float32)
    axis /= np.linalg.norm(axis)
    s = math.sin(angle / 2)
    return np.array([axis[0] * s, axis[1] * s, axis[2] * s, math.cos(angle / 2)], dtype=np.float32)


def combine_quaternions(*values):
    result = np.array([0, 0, 0, 1], dtype=np.float32)
    for value in values:
        ax, ay, az, aw = result
        bx, by, bz, bw = value
        result = np.array([
            aw * bx + ax * bw + ay * bz - az * by,
            aw * by - ax * bz + ay * bw + az * bx,
            aw * bz + ax * by - ay * bx + az * bw,
            aw * bw - ax * bx - ay * by - az * bz,
        ], dtype=np.float32)
    return result / np.linalg.norm(result)


class Builder:
    def __init__(self):
        self.binary = bytearray()
        self.buffer_views = []
        self.accessors = []

    def add_view(self, payload: bytes, target=None):
        align4(self.binary)
        offset = len(self.binary)
        self.binary.extend(payload)
        view = {'buffer': 0, 'byteOffset': offset, 'byteLength': len(payload)}
        if target is not None:
            view['target'] = target
        self.buffer_views.append(view)
        return len(self.buffer_views) - 1

    def add_accessor(self, values, *, target=None, normalized=False, bounds=False):
        array = np.ascontiguousarray(values)
        if array.ndim == 1:
            components = 1
            count = array.shape[0]
        else:
            count = array.shape[0]
            components = int(np.prod(array.shape[1:]))
            array = array.reshape(count, components)
        dtype = array.dtype
        if dtype not in COMPONENT:
            raise TypeError(f'Unsupported dtype: {dtype}')
        view = self.add_view(array.tobytes(), target=target)
        accessor = {
            'bufferView': view,
            'componentType': COMPONENT[dtype],
            'count': count,
            'type': TYPE_SIZE[components],
        }
        if normalized:
            accessor['normalized'] = True
        if bounds and components in (1, 2, 3, 4):
            accessor['min'] = array.min(axis=0).astype(float).tolist() if components > 1 else [float(array.min())]
            accessor['max'] = array.max(axis=0).astype(float).tolist() if components > 1 else [float(array.max())]
        self.accessors.append(accessor)
        return len(self.accessors) - 1


def make_texture_set():
    size = 256
    base = Image.new('RGB', (size, size), (69, 116, 185))
    pixels = base.load()
    for y in range(size):
        for x in range(size):
            radial = max(0.0, 1.0 - math.hypot(x - 94, y - 74) / 240)
            stripe = math.sin((x + y * .45) * .055) * 4
            pixels[x, y] = (
                int(56 + radial * 48 + stripe),
                int(96 + radial * 54 + stripe),
                int(164 + radial * 58 + stripe),
            )
    draw = ImageDraw.Draw(base, 'RGBA')
    draw.ellipse((22, 18, 170, 166), fill=(100, 176, 235, 42))
    draw.arc((20, 24, 232, 236), 205, 330, fill=(255, 216, 109, 120), width=8)
    base = base.filter(ImageFilter.GaussianBlur(.45))

    normal = Image.new('RGB', (size, size), (128, 128, 255))
    nd = ImageDraw.Draw(normal)
    for y in range(0, size, 32):
        nd.line((0, y, size, y), fill=(128, 126 + (y // 32) % 3, 255), width=1)

    orm = Image.new('RGB', (size, size), (235, 184, 18))
    op = orm.load()
    for y in range(size):
        for x in range(size):
            rough = int(164 + 32 * (y / (size - 1)))
            metal = 12 if x < 190 else 75
            op[x, y] = (236, rough, metal)

    emissive = Image.new('RGB', (size, size), (0, 0, 0))
    ed = ImageDraw.Draw(emissive)
    ed.ellipse((74, 60, 182, 168), fill=(22, 138, 184))
    ed.ellipse((96, 82, 160, 146), fill=(72, 225, 255))
    emissive = emissive.filter(ImageFilter.GaussianBlur(8))

    outputs = []
    for image in (base, normal, orm, emissive):
        stream = io.BytesIO()
        image.save(stream, format='PNG', optimize=True)
        outputs.append(stream.getvalue())
    return outputs


def uv_sphere(radius, count=(28, 20)):
    return trimesh.creation.uv_sphere(radius=radius, count=count)


def capsule(radius, height, count=(22, 14)):
    return trimesh.creation.capsule(radius=radius, height=height, count=count)


def cylinder(radius, height, sections=20):
    return trimesh.creation.cylinder(radius=radius, height=height, sections=sections)


def cone(radius, height, sections=18):
    return trimesh.creation.cone(radius=radius, height=height, sections=sections)


def box(extents):
    return trimesh.creation.box(extents=extents)


def torus(major, minor):
    return trimesh.creation.torus(major_radius=major, minor_radius=minor, major_sections=30, minor_sections=10)


def make_part(name, geometry, joint, material, transform):
    mesh = geometry.copy()
    mesh.apply_transform(transform)
    mesh.remove_unreferenced_vertices()
    vertices = np.asarray(mesh.vertices, dtype=np.float32)
    normals = np.asarray(mesh.vertex_normals, dtype=np.float32)
    faces = np.asarray(mesh.faces, dtype=np.uint16).reshape(-1)
    lo = vertices.min(axis=0)
    hi = vertices.max(axis=0)
    span = np.maximum(hi - lo, 1e-5)
    uv = np.stack(((vertices[:, 0] - lo[0]) / span[0], (vertices[:, 1] - lo[1]) / span[1]), axis=1).astype(np.float32)
    return {'name': name, 'vertices': vertices, 'normals': normals, 'indices': faces, 'uv': uv, 'joint': joint, 'material': material}


def build_model():
    builder = Builder()
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
        'Leg_L': 'Hips', 'Foot_L': 'Leg_L', 'Leg_R': 'Hips', 'Foot_R': 'Leg_R', 'AccessorySocket': 'Spine'
    }
    world = {}
    for name in joint_names:
        local = translation_matrix(local_positions[name])
        world[name] = local if parent[name] is None else world[parent[name]] @ local

    nodes = [{'name': 'SceneRoot', 'children': [1, len(joint_names) + 1]}]
    node_index = {name: index + 1 for index, name in enumerate(joint_names)}
    for name in joint_names:
        node = {'name': name, 'translation': list(local_positions[name])}
        children = [node_index[child] for child in joint_names if parent[child] == name]
        if children:
            node['children'] = children
        nodes.append(node)

    materials = [
        {'name': 'Skin_Blue_HandPainted', 'pbrMetallicRoughness': {'baseColorFactor': [.38, .68, .95, 1], 'metallicFactor': 0, 'roughnessFactor': .72}},
        {'name': 'Robe_Plumbloom', 'pbrMetallicRoughness': {'baseColorFactor': [.47, .23, .61, 1], 'metallicFactor': 0, 'roughnessFactor': .82}},
        {'name': 'Leather_Warm', 'pbrMetallicRoughness': {'baseColorFactor': [.37, .17, .12, 1], 'metallicFactor': .02, 'roughnessFactor': .76}},
        {'name': 'Gold_Lacquer', 'pbrMetallicRoughness': {'baseColorFactor': [1.0, .65, .16, 1], 'metallicFactor': .32, 'roughnessFactor': .48}},
        {'name': 'Wood_Club', 'pbrMetallicRoughness': {'baseColorFactor': [.43, .19, .08, 1], 'metallicFactor': 0, 'roughnessFactor': .88}},
        {'name': 'Spirit_Emissive', 'pbrMetallicRoughness': {'baseColorFactor': [.12, .9, 1, 1], 'metallicFactor': 0, 'roughnessFactor': .35}, 'emissiveFactor': [.1, .7, 1.0]},
        {'name': 'Eye_Ink', 'pbrMetallicRoughness': {'baseColorFactor': [.05, .03, .08, 1], 'metallicFactor': 0, 'roughnessFactor': .48}},
        {'name': 'Eye_Highlight', 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, .92, 1], 'metallicFactor': 0, 'roughnessFactor': .32}, 'emissiveFactor': [.35, .35, .25]},
    ]

    images = []
    textures = []
    for label, payload in zip(('BaseColor', 'Normal', 'ORM', 'Emissive'), make_texture_set()):
        view = builder.add_view(payload)
        images.append({'name': label, 'bufferView': view, 'mimeType': 'image/png'})
        textures.append({'source': len(images) - 1})
    for index, material in enumerate(materials):
        pbr = material['pbrMetallicRoughness']
        pbr['baseColorTexture'] = {'index': 0}
        pbr['metallicRoughnessTexture'] = {'index': 2}
        material['normalTexture'] = {'index': 1, 'scale': .35}
        material['occlusionTexture'] = {'index': 2, 'strength': .6}
        if index in (5, 7):
            material['emissiveTexture'] = {'index': 3}

    parts = []
    parts.append(make_part('Body', capsule(.43, .52, (20, 12)), 'Spine', 1, matrix((0, 1.23, 0), rotation=(math.pi / 2, 0, 0), scale=(1.05, 1.0, .9))))
    parts.append(make_part('Pelvis', capsule(.34, .25, (16, 10)), 'Hips', 2, matrix((0, .78, 0), rotation=(math.pi / 2, 0, 0), scale=(1.1, 1, .85))))
    parts.append(make_part('Head', uv_sphere(.63, (26, 18)), 'Head', 0, matrix((0, 2.07, .03), scale=(1.0, .96, .91))))
    parts.append(make_part('Cheek_L', uv_sphere(.15, (12, 8)), 'Head', 0, matrix((-.34, 1.99, .47), scale=(1, .78, .45))))
    parts.append(make_part('Cheek_R', uv_sphere(.15, (12, 8)), 'Head', 0, matrix((.34, 1.99, .47), scale=(1, .78, .45))))
    parts.append(make_part('Eye_L', uv_sphere(.13, (14, 10)), 'Head', 6, matrix((-.22, 2.11, .57), scale=(1.0, 1.15, .42))))
    parts.append(make_part('Eye_R', uv_sphere(.13, (14, 10)), 'Head', 6, matrix((.22, 2.11, .57), scale=(1.0, 1.15, .42))))
    parts.append(make_part('EyeGlow_L', uv_sphere(.045, (10, 7)), 'Head', 7, matrix((-.19, 2.15, .67))))
    parts.append(make_part('EyeGlow_R', uv_sphere(.045, (10, 7)), 'Head', 7, matrix((.25, 2.15, .67))))
    parts.append(make_part('Horn_L', cone(.15, .48, 14), 'Head', 3, matrix((-.34, 2.62, -.02), rotation=(0, 0, -.24))))
    parts.append(make_part('Horn_R', cone(.15, .48, 14), 'Head', 3, matrix((.34, 2.62, -.02), rotation=(0, 0, .24))))
    parts.append(make_part('GatBrim', cylinder(.76, .07, 22), 'Head', 2, matrix((0, 2.43, -.02), rotation=(math.pi / 2, 0, 0))))
    parts.append(make_part('GatCrown', cone(.5, .4, 18), 'Head', 2, matrix((0, 2.66, -.02))))
    parts.append(make_part('ArmorChest', box((.78, .45, .17)), 'Spine', 2, matrix((0, 1.27, .41), rotation=(-.06, 0, 0))))
    parts.append(make_part('Belt', torus(.43, .055), 'Hips', 3, matrix((0, .9, 0), rotation=(math.pi / 2, 0, 0))))
    parts.append(make_part('Arm_L', capsule(.14, .46, (14, 9)), 'Arm_L', 1, matrix((-.58, 1.21, .02), rotation=(math.pi / 2, 0, .18))))
    parts.append(make_part('Arm_R', capsule(.14, .46, (14, 9)), 'Arm_R', 1, matrix((.58, 1.21, .02), rotation=(math.pi / 2, 0, -.18))))
    parts.append(make_part('Hand_L', uv_sphere(.19, (14, 10)), 'Hand_L', 0, matrix((-.67, .84, .09))))
    parts.append(make_part('Hand_R', uv_sphere(.19, (14, 10)), 'Hand_R', 0, matrix((.67, .84, .09))))
    parts.append(make_part('Leg_L', capsule(.16, .34, (14, 9)), 'Leg_L', 2, matrix((-.25, .44, 0), rotation=(math.pi / 2, 0, .04))))
    parts.append(make_part('Leg_R', capsule(.16, .34, (14, 9)), 'Leg_R', 2, matrix((.25, .44, 0), rotation=(math.pi / 2, 0, -.04))))
    parts.append(make_part('Foot_L', uv_sphere(.25, (14, 10)), 'Foot_L', 2, matrix((-.27, .16, .2), scale=(1.0, .64, 1.42))))
    parts.append(make_part('Foot_R', uv_sphere(.25, (14, 10)), 'Foot_R', 2, matrix((.27, .16, .2), scale=(1.0, .64, 1.42))))
    parts.append(make_part('Club', cylinder(.13, 1.32, 16), 'WeaponSocket', 4, matrix((.82, 1.22, .06), rotation=(0, 0, -.38))))
    parts.append(make_part('ClubHead', uv_sphere(.28, (16, 11)), 'WeaponSocket', 4, matrix((1.06, 1.82, .06), scale=(1, 1.25, 1))))
    parts.append(make_part('MoonHalo', torus(.76, .055), 'AccessorySocket', 5, matrix((0, 1.54, -.5), rotation=(math.pi / 2, 0, 0))))
    parts.append(make_part('Talisman', box((.3, .58, .03)), 'AccessorySocket', 3, matrix((-.48, 1.14, .49), rotation=(0, -.14, .08))))

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

    inverse_bind = []
    for name in joint_names:
        inverse_bind.append(np.linalg.inv(world[name]).astype(np.float32).T.reshape(-1))
    inverse_bind_accessor = builder.add_accessor(np.asarray(inverse_bind, dtype=np.float32))

    mesh_node_index = len(nodes)
    nodes.append({'name': 'GoldenHeroMesh', 'mesh': 0, 'skin': 0})

    animations = []

    def add_clip(name, duration, tracks):
        times = np.linspace(0, duration, tracks['frames'], dtype=np.float32)
        input_accessor = builder.add_accessor(times, bounds=True)
        samplers = []
        channels = []
        for track in tracks['channels']:
            output = builder.add_accessor(np.asarray(track['values'], dtype=np.float32))
            sampler_index = len(samplers)
            samplers.append({'input': input_accessor, 'output': output, 'interpolation': 'LINEAR'})
            channels.append({'sampler': sampler_index, 'target': {'node': node_index[track['joint']], 'path': track['path']}})
        animations.append({'name': name, 'samplers': samplers, 'channels': channels, 'extras': {'goldenSample': True}})

    def rot_values(axis, angles):
        return [quaternion(axis, angle) for angle in angles]

    add_clip('Idle', 2.2, {'frames': 5, 'channels': [
        {'joint': 'Armature', 'path': 'translation', 'values': [[0,0,0],[0,.025,0],[0,0,0],[0,.018,0],[0,0,0]]},
        {'joint': 'Head', 'path': 'rotation', 'values': rot_values((0,1,0), [0,.08,0,-.08,0])},
        {'joint': 'AccessorySocket', 'path': 'rotation', 'values': rot_values((0,0,1), [0,.12,0,-.12,0])},
    ]})
    add_clip('Walk', .8, {'frames': 5, 'channels': [
        {'joint': 'Arm_L', 'path': 'rotation', 'values': rot_values((1,0,0), [.45,0,-.45,0,.45])},
        {'joint': 'Arm_R', 'path': 'rotation', 'values': rot_values((1,0,0), [-.45,0,.45,0,-.45])},
        {'joint': 'Leg_L', 'path': 'rotation', 'values': rot_values((1,0,0), [-.5,0,.5,0,-.5])},
        {'joint': 'Leg_R', 'path': 'rotation', 'values': rot_values((1,0,0), [.5,0,-.5,0,.5])},
        {'joint': 'Armature', 'path': 'translation', 'values': [[0,0,0],[0,.055,0],[0,0,0],[0,.055,0],[0,0,0]]},
    ]})
    add_clip('Run', .55, {'frames': 5, 'channels': [
        {'joint': 'Spine', 'path': 'rotation', 'values': rot_values((1,0,0), [-.13,-.17,-.13,-.17,-.13])},
        {'joint': 'Arm_L', 'path': 'rotation', 'values': rot_values((1,0,0), [.82,0,-.82,0,.82])},
        {'joint': 'Arm_R', 'path': 'rotation', 'values': rot_values((1,0,0), [-.82,0,.82,0,-.82])},
        {'joint': 'Leg_L', 'path': 'rotation', 'values': rot_values((1,0,0), [-.85,0,.85,0,-.85])},
        {'joint': 'Leg_R', 'path': 'rotation', 'values': rot_values((1,0,0), [.85,0,-.85,0,.85])},
        {'joint': 'Armature', 'path': 'translation', 'values': [[0,0,0],[0,.08,0],[0,0,0],[0,.08,0],[0,0,0]]},
    ]})
    add_clip('Attack', .66, {'frames': 5, 'channels': [
        {'joint': 'Spine', 'path': 'rotation', 'values': [combine_quaternions(quaternion((0,1,0), a), quaternion((1,0,0), b)) for a,b in [(0,0),(-.45,-.08),(.55,-.18),(.18,-.06),(0,0)]]},
        {'joint': 'Arm_R', 'path': 'rotation', 'values': [combine_quaternions(quaternion((1,0,0), a), quaternion((0,0,1), b)) for a,b in [(-.2,-.1),(-1.2,-.5),(.65,.4),(.2,.1),(-.2,-.1)]]},
        {'joint': 'WeaponSocket', 'path': 'rotation', 'values': rot_values((0,1,0), [0,-.6,.9,.3,0])},
        {'joint': 'Head', 'path': 'rotation', 'values': rot_values((0,1,0), [0,-.18,.24,.08,0])},
    ]})
    add_clip('Skill', 1.2, {'frames': 6, 'channels': [
        {'joint': 'Arm_L', 'path': 'rotation', 'values': rot_values((1,0,0), [0,-.45,-1.05,-1.25,-.35,0])},
        {'joint': 'Arm_R', 'path': 'rotation', 'values': rot_values((1,0,0), [0,-.45,-1.05,-1.25,-.35,0])},
        {'joint': 'Spine', 'path': 'rotation', 'values': rot_values((1,0,0), [0,-.08,-.16,-.22,-.08,0])},
        {'joint': 'AccessorySocket', 'path': 'scale', 'values': [[1,1,1],[1.08,1.08,1.08],[1.24,1.24,1.24],[1.42,1.42,1.42],[1.12,1.12,1.12],[1,1,1]]},
        {'joint': 'Armature', 'path': 'translation', 'values': [[0,0,0],[0,.04,0],[0,.1,0],[0,.16,0],[0,.04,0],[0,0,0]]},
    ]})
    add_clip('Hit', .34, {'frames': 4, 'channels': [
        {'joint': 'Spine', 'path': 'rotation', 'values': rot_values((0,0,1), [0,.18,-.12,0])},
        {'joint': 'Head', 'path': 'rotation', 'values': rot_values((0,0,1), [0,-.22,.12,0])},
        {'joint': 'Armature', 'path': 'translation', 'values': [[0,0,0],[-.08,0,0],[.03,0,0],[0,0,0]]},
    ]})
    add_clip('Death', 1.0, {'frames': 5, 'channels': [
        {'joint': 'Armature', 'path': 'rotation', 'values': rot_values((1,0,0), [0,-.18,-.72,-1.22,-1.48])},
        {'joint': 'Armature', 'path': 'translation', 'values': [[0,0,0],[0,0,0],[0,-.08,.05],[0,-.22,.18],[0,-.32,.25]]},
        {'joint': 'Arm_L', 'path': 'rotation', 'values': rot_values((0,0,1), [0,-.2,-.5,-.75,-.9])},
        {'joint': 'Arm_R', 'path': 'rotation', 'values': rot_values((0,0,1), [0,.2,.5,.75,.9])},
    ]})

    gltf = {
        'asset': {
            'version': '2.0',
            'generator': 'Dokkaebi Golden Hero Rig Pipeline v1',
            'extras': {
                'styleLockId': STYLE_LOCK_ID,
                'approvalStage': 'art-review',
                'goldenSample': True,
                'rigVersion': 'DOKKAEBI-HUMANOID-RIG-1',
                'technicalReady': True,
                'artDirectorApproved': False,
                'notes': 'Technical production candidate. Final hand-authored sculpture and texture review still required.'
            }
        },
        'scene': 0,
        'scenes': [{'name': 'GoldenHeroScene', 'nodes': [0]}],
        'nodes': nodes,
        'meshes': [{'name': 'DokkaebiWarriorGoldenMesh', 'primitives': primitives, 'extras': {'triangles': triangle_count}}],
        'skins': [{'name': 'DokkaebiHumanoidRig', 'inverseBindMatrices': inverse_bind_accessor, 'skeleton': node_index['Armature'], 'joints': [node_index[name] for name in joint_names]}],
        'animations': animations,
        'materials': materials,
        'images': images,
        'textures': textures,
        'samplers': [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}],
        'accessors': builder.accessors,
        'bufferViews': builder.buffer_views,
        'buffers': [{'byteLength': len(builder.binary)}],
        'extras': {
            'styleLockId': STYLE_LOCK_ID,
            'category': 'player',
            'goldenSample': True,
            'triangles': triangle_count,
            'requiredClips': ['Idle','Walk','Run','Attack','Skill','Hit','Death'],
            'sockets': ['WeaponSocket','AccessorySocket']
        }
    }
    for texture in gltf['textures']:
        texture['sampler'] = 0

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
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(payload)
    print(f'WROTE {OUT} · {triangle_count} triangles · {len(animations)} clips · {len(payload)} bytes')


if __name__ == '__main__':
    build_model()
