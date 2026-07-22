#!/usr/bin/env python3
from __future__ import annotations

import json
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / 'public' / 'assets' / 'models'
STYLE_LOCK_ID = 'DD-AAA-CASUAL-SD-PBR-3.0'
RIG_ID = 'DOKKAEBI-HUMANOID-RIG-1'

CANDIDATES = {
    'player-dokkaebi-archer-candidate-v1.glb': {
        'source': 'player-dokkaebi-warrior-golden-v1.glb',
        'category': 'player', 'archetype': 'archer', 'displayName': '도깨비 궁수',
        'sceneName': 'DokkaebiArcherCandidateScene', 'meshName': 'DokkaebiArcherCandidateMesh'
    },
    'player-dokkaebi-mage-candidate-v1.glb': {
        'source': 'player-dokkaebi-warrior-golden-v1.glb',
        'category': 'player', 'archetype': 'mage', 'displayName': '도깨비 법사',
        'sceneName': 'DokkaebiMageCandidateScene', 'meshName': 'DokkaebiMageCandidateMesh'
    },
    'monster-ghost-candidate-v1.glb': {
        'source': 'monster-shaman-sd-toon.glb',
        'category': 'monster', 'archetype': 'ghost', 'displayName': '달그림자 귀신',
        'sceneName': 'MoonGhostCandidateScene', 'meshName': 'MoonGhostCandidateMesh'
    },
    'monster-skeleton-candidate-v1.glb': {
        'source': 'monster-brute-sd-toon.glb',
        'category': 'monster', 'archetype': 'skeleton', 'displayName': '백골 무사',
        'sceneName': 'SkeletonWarriorCandidateScene', 'meshName': 'SkeletonWarriorCandidateMesh'
    },
    'monster-crow-candidate-v1.glb': {
        'source': 'monster-shaman-sd-toon.glb',
        'category': 'monster', 'archetype': 'crow', 'displayName': '먹구름 까마귀',
        'sceneName': 'StormCrowCandidateScene', 'meshName': 'StormCrowCandidateMesh'
    },
}


def parse_glb(path: Path):
    data = path.read_bytes()
    if data[:4] != b'glTF' or len(data) < 20:
        raise ValueError(f'Invalid GLB: {path}')
    version, declared = struct.unpack_from('<II', data, 4)
    if version != 2 or declared != len(data):
        raise ValueError(f'Unsupported GLB: {path}')
    offset = 12
    chunks = []
    while offset + 8 <= len(data):
        length, kind = struct.unpack_from('<II', data, offset)
        payload = data[offset + 8:offset + 8 + length]
        chunks.append((kind, payload))
        offset += 8 + length
    return chunks


def write_glb(path: Path, chunks):
    encoded = []
    total = 12
    for kind, payload in chunks:
        pad = b' ' if kind == 0x4E4F534A else b'\0'
        while len(payload) % 4:
            payload += pad
        encoded.append((kind, payload))
        total += 8 + len(payload)
    output = bytearray(struct.pack('<4sII', b'glTF', 2, total))
    for kind, payload in encoded:
        output.extend(struct.pack('<II', len(payload), kind))
        output.extend(payload)
    path.write_bytes(output)


def build(output_name: str, profile: dict):
    source = MODEL_DIR / profile['source']
    chunks = parse_glb(source)
    rewritten = []
    for kind, payload in chunks:
        if kind != 0x4E4F534A:
            rewritten.append((kind, payload))
            continue
        gltf = json.loads(payload.decode('utf8').rstrip(' \0'))
        asset = gltf.setdefault('asset', {})
        extras = asset.setdefault('extras', {})
        extras.update({
            'styleLockId': STYLE_LOCK_ID,
            'approvalStage': 'art-review',
            'rigCandidate': True,
            'technicalReady': True,
            'artDirectorApproved': False,
            'rigVersion': RIG_ID,
            'archetype': profile['archetype'],
            'displayName': profile['displayName'],
            'derivedRigBase': profile['source'],
            'notes': 'Shared-rig technical candidate. Runtime silhouette kit is temporary; final authored sculpt and textures require art review.'
        })
        gltf.setdefault('extras', {}).update({
            'styleLockId': STYLE_LOCK_ID,
            'category': profile['category'],
            'rigCandidate': True,
            'archetype': profile['archetype'],
            'requiredClips': ['Idle', 'Walk', 'Run', 'Attack', 'Skill', 'Hit', 'Death'],
            'sockets': ['WeaponSocket', 'AccessorySocket']
        })
        if gltf.get('scenes'):
            gltf['scenes'][0]['name'] = profile['sceneName']
        if gltf.get('meshes'):
            gltf['meshes'][0]['name'] = profile['meshName']
        for animation in gltf.get('animations', []):
            animation.setdefault('extras', {}).update({'rigCandidate': True, 'archetype': profile['archetype']})
        rewritten.append((kind, json.dumps(gltf, separators=(',', ':'), ensure_ascii=False).encode('utf8')))
    output = MODEL_DIR / output_name
    write_glb(output, rewritten)
    print(f'WROTE {output.relative_to(ROOT)} · {output.stat().st_size} bytes')


if __name__ == '__main__':
    for name, profile in CANDIDATES.items():
        build(name, profile)
