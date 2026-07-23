#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE_REGISTRY = ROOT / 'public/assets/ip-v8/quality-registry-v9.json'
OUT_ROOT = ROOT / 'public/assets/ip-v10'
MANIFEST_PATH = OUT_ROOT / 'asset-forge-v10.json'
BOARD_PATH = ROOT / 'docs/ASSET_FORGE_BOARD_v10.0.0.jpg'
STYLE_LOCK = 'DD-ABSOLUTE-ART-BIBLE-2.0'
CANVAS = 512
CONTENT = 438


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def border_pixels(rgb: np.ndarray, width: int = 12) -> np.ndarray:
    top = rgb[:width, :, :].reshape(-1, 3)
    bottom = rgb[-width:, :, :].reshape(-1, 3)
    left = rgb[:, :width, :].reshape(-1, 3)
    right = rgb[:, -width:, :].reshape(-1, 3)
    return np.concatenate([top, bottom, left, right], axis=0)


def connected_background(candidate: np.ndarray) -> np.ndarray:
    binary = candidate.astype(np.uint8)
    count, labels = cv2.connectedComponents(binary, connectivity=8)
    if count <= 1:
        return np.zeros_like(candidate, dtype=bool)
    border_labels = np.unique(np.concatenate([
        labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]
    ]))
    border_labels = border_labels[border_labels != 0]
    if not len(border_labels):
        return np.zeros_like(candidate, dtype=bool)
    return np.isin(labels, border_labels)


def alpha_isolate(image: Image.Image) -> tuple[Image.Image, dict]:
    rgb = np.asarray(image.convert('RGB'), dtype=np.float32)
    border = border_pixels(rgb)
    bg = np.median(border, axis=0)
    border_deviation = float(np.mean(np.linalg.norm(border - bg, axis=1)))
    dist = np.linalg.norm(rgb - bg, axis=2)
    luminance = rgb.mean(axis=2)

    # Only a border-connected, background-colored region can be removed. This
    # protects bright details inside a character or icon from being erased.
    candidate = (dist <= 82.0) & (luminance >= max(155.0, float(bg.mean()) - 62.0))
    background = connected_background(candidate)

    alpha = np.full(dist.shape, 255.0, dtype=np.float32)
    ramp = np.clip((dist - 16.0) / 62.0, 0.0, 1.0) * 255.0
    alpha[background] = ramp[background]
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.65)
    alpha[alpha < 4] = 0
    alpha[alpha > 251] = 255

    a = alpha[..., None] / 255.0
    safe_a = np.maximum(a, 0.08)
    decontaminated = (rgb - bg.reshape(1, 1, 3) * (1.0 - a)) / safe_a
    decontaminated = np.where(a > 0.03, decontaminated, 0)
    rgba = np.dstack([np.clip(decontaminated, 0, 255), alpha]).astype(np.uint8)

    mask = alpha > 12
    ys, xs = np.where(mask)
    if len(xs):
        x0, x1 = int(xs.min()), int(xs.max()) + 1
        y0, y1 = int(ys.min()), int(ys.max()) + 1
    else:
        x0, y0, x1, y1 = 0, 0, image.width, image.height

    crop = Image.fromarray(rgba, 'RGBA').crop((x0, y0, x1, y1))
    scale = min(CONTENT / max(1, crop.width), CONTENT / max(1, crop.height))
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    x = (CANVAS - crop.width) // 2
    y = (CANVAS - crop.height) // 2
    canvas.alpha_composite(crop, (x, y))

    out_alpha = np.asarray(canvas.getchannel('A'))
    coverage = float(np.mean(out_alpha > 12))
    soft_coverage = float(np.mean(out_alpha > 0))
    border_touch = bool(
        np.any(out_alpha[:4, :] > 12) or np.any(out_alpha[-4:, :] > 12)
        or np.any(out_alpha[:, :4] > 12) or np.any(out_alpha[:, -4:] > 12)
    )
    bg_consistency = max(0.0, min(1.0, 1.0 - border_deviation / 45.0))
    coverage_score = 1.0 - min(1.0, abs(coverage - 0.42) / 0.42)
    confidence = max(0.0, min(1.0, 0.58 * bg_consistency + 0.42 * coverage_score - (0.16 if border_touch else 0.0)))

    metrics = {
        'backgroundRgb': [round(float(v), 1) for v in bg],
        'borderDeviation': round(border_deviation, 3),
        'alphaCoverage': round(coverage, 4),
        'softAlphaCoverage': round(soft_coverage, 4),
        'sourceBounds': [x0, y0, x1, y1],
        'normalizedBounds': [x, y, x + crop.width, y + crop.height],
        'borderTouch': border_touch,
        'matteConfidence': round(confidence, 4),
        'presentationReady': confidence >= 0.58 and 0.07 <= coverage <= 0.82 and not border_touch
    }
    return canvas, metrics


def silhouette_from(presentation: Image.Image) -> Image.Image:
    alpha = presentation.getchannel('A').resize((256, 256), Image.Resampling.LANCZOS)
    solid = Image.new('RGBA', (256, 256), (238, 248, 255, 0))
    solid.putalpha(alpha)
    return solid


def checker_tile(size: tuple[int, int], cell: int = 18) -> Image.Image:
    w, h = size
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for yy in range(0, h, cell):
        for xx in range(0, w, cell):
            value = 219 if ((xx // cell + yy // cell) % 2 == 0) else 184
            arr[yy:yy + cell, xx:xx + cell] = (value, value, value)
    return Image.fromarray(arr, 'RGB')


def build_board(entries: list[dict]) -> None:
    cols = 5
    cell_w, cell_h = 300, 350
    rows = math.ceil(len(entries) / cols)
    board = Image.new('RGB', (cols * cell_w, rows * cell_h), (9, 17, 29))
    draw = ImageDraw.Draw(board)
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
        small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
    except OSError:
        font = ImageFont.load_default()
        small = font

    for index, entry in enumerate(entries):
        col, row = index % cols, index // cols
        ox, oy = col * cell_w, row * cell_h
        tile = checker_tile((276, 276))
        art = Image.open(ROOT / 'public' / entry['presentationPath']).convert('RGBA').resize((276, 276), Image.Resampling.LANCZOS)
        tile = tile.convert('RGBA')
        tile.alpha_composite(art)
        board.paste(tile.convert('RGB'), (ox + 12, oy + 12))
        ready = 'READY' if entry['metrics']['presentationReady'] else 'REVIEW'
        draw.text((ox + 13, oy + 296), entry['id'][:34], fill=(246, 224, 147), font=font)
        draw.text((ox + 13, oy + 318), f"{entry['category']} · matte {entry['metrics']['matteConfidence']:.2f} · {ready}", fill=(137, 220, 240), font=small)
        draw.text((ox + 13, oy + 335), 'TRANSPARENT DERIVATIVE · NOT PRODUCTION APPROVED', fill=(161, 171, 188), font=small)
    board.save(BOARD_PATH, quality=91, optimize=True)


def main() -> None:
    source = json.loads(SOURCE_REGISTRY.read_text(encoding='utf-8'))
    candidates = [item for item in source['assets'] if item['reviewTier'] == 'high-resolution-candidate']
    entries: list[dict] = []

    for item in candidates:
        source_path = ROOT / 'public' / item['path']
        category = item['category']
        presentation_rel = Path('assets/ip-v10/presentation') / category / f"{item['id']}.png"
        silhouette_rel = Path('assets/ip-v10/silhouettes') / category / f"{item['id']}.png"
        presentation_path = ROOT / 'public' / presentation_rel
        silhouette_path = ROOT / 'public' / silhouette_rel
        presentation_path.parent.mkdir(parents=True, exist_ok=True)
        silhouette_path.parent.mkdir(parents=True, exist_ok=True)

        presentation, metrics = alpha_isolate(Image.open(source_path))
        presentation.save(presentation_path, optimize=True)
        silhouette = silhouette_from(presentation)
        silhouette.save(silhouette_path, optimize=True)

        entries.append({
            'id': item['id'],
            'category': category,
            'family': item['family'],
            'sourcePath': item['path'],
            'presentationPath': presentation_rel.as_posix(),
            'silhouettePath': silhouette_rel.as_posix(),
            'sourceSha256': item['sha256'],
            'presentationSha256': sha256(presentation_path),
            'silhouetteSha256': sha256(silhouette_path),
            'styleLock': STYLE_LOCK,
            'derivativeStatus': 'transparent-presentation-candidate',
            'productionApproved': False,
            'metrics': metrics,
            'warnings': [
                'automatic-background-isolation',
                'single-view-source',
                'human-edge-review-required',
                'not-a-runtime-3d-deliverable'
            ]
        })

    summary = {
        'version': '10.0.0',
        'sourceRegistryVersion': source['summary']['version'],
        'styleLock': STYLE_LOCK,
        'sourceCandidates': len(candidates),
        'transparentPresentationDerivatives': len(entries),
        'silhouetteDerivatives': len(entries),
        'presentationReadyByAutomation': sum(1 for item in entries if item['metrics']['presentationReady']),
        'manualReviewRequired': len(entries),
        'productionApproved': 0,
        'uiAndVfxDerivatives': sum(1 for item in entries if item['category'] in {'ui', 'vfx', 'vfx-objects'}),
        'characterFamilyDerivatives': sum(1 for item in entries if item['category'] == 'characters'),
        'monsterFamilyDerivatives': sum(1 for item in entries if item['category'] == 'monsters'),
        'bossDerivatives': sum(1 for item in entries if item['category'] == 'bosses'),
        'gate': 'transparent presentation derivatives are review aids, never automatic production approval'
    }
    payload = {
        'schemaVersion': 1,
        'generatedFor': 'Dokkaebi Defense v10.0.0',
        'generatedAt': '2026-07-23',
        'summary': summary,
        'assets': entries
    }
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    build_board(entries)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
