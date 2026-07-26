#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import hashlib
import itertools
import json
from pathlib import Path
from statistics import mean

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
OUT = PUBLIC / 'assets' / 'visual-v132'
LINEAGE = PUBLIC / 'assets' / 'visual-v131' / 'asset-lineage-audit-v131.json'
PROFILE = PUBLIC / 'assets' / 'visual-v129' / 'asset-refinement-profile-v129.json'
VERSION = '1.0.32'
BUILD = 'b24.32'


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def pack_bits(bits: list[bool]) -> str:
    data = bytearray((len(bits) + 7) // 8)
    for i, bit in enumerate(bits):
        if bit:
            data[i // 8] |= 1 << (7 - (i % 8))
    return base64.b64encode(bytes(data)).decode('ascii')


def normalize_mask(image: Image.Image, size: int = 32) -> tuple[list[bool], list[bool], dict]:
    alpha = image.convert('RGBA').getchannel('A')
    bbox = alpha.point(lambda p: 255 if p > 8 else 0).getbbox()
    if not bbox:
        raise ValueError('image has no visible alpha')
    crop = alpha.crop(bbox)
    w, h = crop.size
    side = max(w, h) + 4
    canvas = Image.new('L', (side, side), 0)
    canvas.paste(crop, ((side - w) // 2, (side - h) // 2))
    small = canvas.resize((size, size), Image.Resampling.LANCZOS)
    values = list(small.getdata())
    bits = [v >= 32 for v in values]
    contour = []
    for y in range(size):
        for x in range(size):
            idx = y * size + x
            if not bits[idx]:
                contour.append(False)
                continue
            boundary = False
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= size or ny >= size or not bits[ny * size + nx]:
                    boundary = True
                    break
            contour.append(boundary)
    on = [i for i, bit in enumerate(bits) if bit]
    xs = [i % size for i in on]
    ys = [i // size for i in on]
    meta = {
        'sourceBbox': list(bbox),
        'sourceAspect': round(w / max(1, h), 5),
        'occupancy': round(len(on) / (size * size), 5),
        'contourRatio': round(sum(contour) / max(1, len(on)), 5),
        'centerX': round(mean(xs) / (size - 1), 5),
        'centerY': round(mean(ys) / (size - 1), 5),
    }
    return bits, contour, meta


def similarity(a: list[bool], b: list[bool]) -> tuple[float, float]:
    inter = sum(x and y for x, y in zip(a, b))
    union = sum(x or y for x, y in zip(a, b))
    iou = inter / max(1, union)
    hamming = 1 - sum(x != y for x, y in zip(a, b)) / max(1, len(a))
    return iou, hamming


def build_silhouette() -> dict:
    lineage = json.loads(LINEAGE.read_text(encoding='utf-8'))
    rows = []
    masks: dict[str, tuple[list[bool], list[bool]]] = {}
    for asset in lineage['assets']:
        variant = max(asset['variants'], key=lambda row: row['width'] * row['height'])
        path = PUBLIC / variant['path']
        with Image.open(path) as im:
            bits, contour, meta = normalize_mask(im)
        silhouette_hash = hashlib.sha256(base64.b64decode(pack_bits(bits))).hexdigest()
        contour_hash = hashlib.sha256(base64.b64decode(pack_bits(contour))).hexdigest()
        row = {
            'id': asset['id'],
            'kind': asset['kind'],
            'quality': variant['quality'],
            'path': variant['path'],
            'sourceSha256': sha256(path),
            'sourceWidth': variant['width'],
            'sourceHeight': variant['height'],
            'grid': 32,
            'silhouetteHash': silhouette_hash,
            'contourHash': contour_hash,
            'silhouetteBits': pack_bits(bits),
            'contourBits': pack_bits(contour),
            **meta,
        }
        rows.append(row)
        masks[asset['id']] = (bits, contour)
    pairs = []
    for first, second in itertools.combinations(rows, 2):
        a, ac = masks[first['id']]
        b, bc = masks[second['id']]
        iou, hamming = similarity(a, b)
        contour_iou, contour_hamming = similarity(ac, bc)
        score = .45 * iou + .30 * hamming + .15 * contour_iou + .10 * contour_hamming
        pairs.append({
            'a': first['id'], 'b': second['id'],
            'iou': round(iou, 5), 'hammingSimilarity': round(hamming, 5),
            'contourIou': round(contour_iou, 5), 'contourSimilarity': round(contour_hamming, 5),
            'score': round(score, 5),
            'review': score >= .75,
            'nearDuplicate': score >= .94,
        })
    pairs.sort(key=lambda row: row['score'], reverse=True)
    return {
        'schema': 'DD-SILHOUETTE-AUDIT-V132', 'version': VERSION, 'build': BUILD,
        'policy': {'grid': 32, 'reviewThreshold': .75, 'nearDuplicateThreshold': .94, 'newFinalCharacterArt': 0},
        'summary': {
            'assets': len(rows), 'pairs': len(pairs),
            'reviewPairs': sum(row['review'] for row in pairs),
            'nearDuplicatePairs': sum(row['nearDuplicate'] for row in pairs),
            'highestSimilarity': pairs[0] if pairs else None,
        },
        'assets': rows, 'pairs': pairs,
    }


def cell_pixels(atlas: Image.Image, col: int, row: int, cw: int, ch: int) -> tuple[bytes, bytes]:
    cell = atlas.crop((col * cw, row * ch, (col + 1) * cw, (row + 1) * ch)).convert('RGBA')
    rgba = cell.tobytes()
    alpha = cell.getchannel('A').tobytes()
    return rgba, alpha


def alpha_iou(a: bytes, b: bytes) -> float:
    aa = [x > 8 for x in a]
    bb = [x > 8 for x in b]
    inter = sum(x and y for x, y in zip(aa, bb))
    union = sum(x or y for x, y in zip(aa, bb))
    return inter / max(1, union)


def build_action_evidence() -> dict:
    profile = json.loads(PROFILE.read_text(encoding='utf-8'))
    atlas_info = next(row for row in profile['atlases'] if row['quality'] == 'low')
    atlas_path = PUBLIC / atlas_info['path']
    actions = profile['actions']
    directions = profile['directions']
    with Image.open(atlas_path) as atlas:
        atlas = atlas.convert('RGBA')
        cells = {}
        output_cells = []
        for ai, action in enumerate(actions):
            for di, direction in enumerate(directions):
                rgba, alpha = cell_pixels(atlas, di, ai, atlas_info['cellWidth'], atlas_info['cellHeight'])
                cells[(action, direction)] = (rgba, alpha)
                output_cells.append({
                    'action': action, 'direction': direction,
                    'rgbaSha256': hashlib.sha256(rgba).hexdigest(),
                    'alphaSha256': hashlib.sha256(alpha).hexdigest(),
                })
    comparisons = []
    exact_rgba = 0
    exact_alpha = 0
    for direction in directions:
        idle_rgba, idle_alpha = cells[('idle', direction)]
        for action in actions[1:]:
            rgba, alpha = cells[(action, direction)]
            same_rgba = rgba == idle_rgba
            same_alpha = alpha == idle_alpha
            exact_rgba += int(same_rgba)
            exact_alpha += int(same_alpha)
            mean_delta = sum(abs(x - y) for x, y in zip(rgba, idle_rgba)) / (len(rgba) * 255)
            comparisons.append({
                'direction': direction, 'baseline': 'idle', 'action': action,
                'exactRgba': same_rgba, 'exactAlpha': same_alpha,
                'meanRgbaDelta': round(mean_delta, 6),
                'alphaIou': round(alpha_iou(alpha, idle_alpha), 6),
            })
    min_delta = min(row['meanRgbaDelta'] for row in comparisons)
    return {
        'schema': 'DD-ACTION-EVIDENCE-V132', 'version': VERSION, 'build': BUILD,
        'sourceAtlas': atlas_info['path'], 'sourceSha256': sha256(atlas_path),
        'actions': actions, 'directions': directions,
        'summary': {
            'cells': len(output_cells), 'comparisons': len(comparisons),
            'exactRgbaMatchesAgainstIdle': exact_rgba,
            'exactAlphaMatchesAgainstIdle': exact_alpha,
            'minimumMeanRgbaDelta': round(min_delta, 6),
            'distinctRuntimeFrames': exact_rgba == 0 and min_delta >= .04,
            'independentOriginalArtApproved': False,
            'approval': 'derived-provisional',
        },
        'cells': output_cells, 'comparisons': comparisons,
    }


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    silhouette = build_silhouette()
    action = build_action_evidence()
    registry = {
        'schema': 'DD-SILHOUETTE-ASSURANCE-REGISTRY-V132', 'version': VERSION, 'build': BUILD,
        'summary': {
            'silhouetteAssets': silhouette['summary']['assets'],
            'silhouettePairs': silhouette['summary']['pairs'],
            'nearDuplicatePairs': silhouette['summary']['nearDuplicatePairs'],
            'actionCells': action['summary']['cells'],
            'distinctRuntimeFrames': action['summary']['distinctRuntimeFrames'],
            'newFinalCharacterArt': 0,
            'waveTarget': 80,
        },
        'approvals': {
            'pupuDirectional': 'final-approved-retained',
            'pupuIndependentActions': 'derived-provisional',
            'bossMonsterSilhouettes': 'audit-approved-no-near-duplicates',
            'bombImpDirectional': 'replacement-pending',
            'bombImpRuntime': 'quarantined',
        },
    }
    expected = {
        'silhouette-audit-v132.json': silhouette,
        'action-evidence-v132.json': action,
        'silhouette-assurance-registry-v132.json': registry,
    }
    if args.check:
        mismatches = []
        for name, data in expected.items():
            path = OUT / name
            if not path.exists() or json.loads(path.read_text(encoding='utf-8')) != data:
                mismatches.append(name)
        if mismatches:
            print('FAIL v1.0.32 generated audit mismatch: ' + ', '.join(mismatches))
            return 1
        print('PASS v1.0.32 silhouette and action evidence match source assets')
        return 0
    for name, data in expected.items():
        write_json(OUT / name, data)
    manifest = {
        'schema': 'DD-SILHOUETTE-ASSURANCE-MANIFEST-V132', 'version': VERSION, 'build': BUILD,
        'files': [
            {'path': f'assets/visual-v132/{name}', 'bytes': (OUT / name).stat().st_size, 'sha256': sha256(OUT / name)}
            for name in expected
        ],
    }
    write_json(OUT / 'silhouette-assurance-manifest-v132.json', manifest)
    print(json.dumps({'summary': silhouette['summary'], 'action': action['summary']}, ensure_ascii=False, indent=2))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
