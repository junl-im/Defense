#!/usr/bin/env python3
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE_MANIFEST = ROOT / 'public/assets/ip-v13/asset-manifest-v13.json'
OUTPUT_ROOT = ROOT / 'public/assets/ip-v14'
MASTERED_ROOT = OUTPUT_ROOT / 'mastered'
ATLAS_ROOT = OUTPUT_ROOT / 'atlas'
MANIFEST_PATH = OUTPUT_ROOT / 'atlas-manifest-v14.json'
PREVIEW_PATH = ROOT / 'docs/ATLAS_FORGE_PREVIEW_v14.0.0.jpg'

TILE = 64
GRID_COLUMNS = 16
GRID_ROWS = 8
PAGE_WIDTH = TILE * GRID_COLUMNS
PAGE_HEIGHT = TILE * GRID_ROWS
PAGE_CAPACITY = GRID_COLUMNS * GRID_ROWS
MASTER_CANVAS = 256
MASTER_INSET = 18
INCLUDED_STATUSES = {'curated-runtime-2d', 'runtime-ready-2d'}
FORCED_PATHS = {
    'assets/ip-v13/crops/weapons/weapons-r02-c05.png',
    'assets/ip-v13/crops/items/items-r05-c03.png',
    'assets/ip-v13/crops/items/items-r05-c01.png',
    'assets/ip-v13/crops/ui/ui-r07-c07.png',
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def cleanup_alpha(source: Image.Image):
    rgba = np.array(source.convert('RGBA'))
    alpha = rgba[:, :, 3]
    binary = (alpha >= 18).astype(np.uint8)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    clean = np.zeros_like(binary)
    components = []
    for index in range(1, count):
        area = int(stats[index, cv2.CC_STAT_AREA])
        if area >= 5:
            clean[labels == index] = 1
            components.append(area)
    if clean.sum() == 0:
        clean = binary
    kernel = np.ones((3, 3), np.uint8)
    clean = cv2.morphologyEx(clean, cv2.MORPH_CLOSE, kernel, iterations=1)
    soft = cv2.GaussianBlur((clean * 255).astype(np.uint8), (0, 0), 0.58)
    soft[soft < 5] = 0
    soft[soft > 248] = 255

    ys, xs = np.where(soft > 4)
    if not len(xs):
        empty = Image.new('RGBA', (MASTER_CANVAS, MASTER_CANVAS), (0, 0, 0, 0))
        return empty, {'edgeTouch': False, 'fringeRatio': 0.0, 'componentCount': 0, 'coverage': 0.0, 'quality': 0}

    bbox = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    pad = 5
    box = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(source.width, bbox[2] + pad), min(source.height, bbox[3] + pad))
    rgba[:, :, 3] = soft
    rgba[soft == 0, :3] = 0
    cut = Image.fromarray(rgba, 'RGBA').crop(box)

    max_side = max(cut.size)
    scale = (MASTER_CANVAS - MASTER_INSET * 2) / max_side if max_side else 1
    size = (max(1, round(cut.width * scale)), max(1, round(cut.height * scale)))
    cut = cut.resize(size, Image.Resampling.LANCZOS)
    mastered = Image.new('RGBA', (MASTER_CANVAS, MASTER_CANVAS), (0, 0, 0, 0))
    mastered.alpha_composite(cut, ((MASTER_CANVAS - size[0]) // 2, (MASTER_CANVAS - size[1]) // 2))

    mastered_alpha = np.array(mastered.getchannel('A'))
    active = mastered_alpha > 4
    edge_touch = bool(active[0].any() or active[-1].any() or active[:, 0].any() or active[:, -1].any())
    fringe = ((mastered_alpha > 4) & (mastered_alpha < 235)).sum()
    solid = (mastered_alpha >= 235).sum()
    fringe_ratio = float(fringe) / max(1, float(fringe + solid))
    coverage = float(active.sum()) / float(MASTER_CANVAS * MASTER_CANVAS)
    component_count = len(components)
    quality = 100
    quality -= min(24, round(fringe_ratio * 85))
    quality -= 24 if edge_touch else 0
    quality -= min(15, max(0, component_count - 10))
    quality -= 18 if coverage < .025 else 0
    quality = max(0, min(100, quality))
    return mastered, {
        'edgeTouch': edge_touch,
        'fringeRatio': round(fringe_ratio, 5),
        'componentCount': component_count,
        'coverage': round(coverage, 5),
        'quality': quality,
    }


def write_preview(pages, assets):
    gap = 28
    display_width = 1024
    display_height = round(display_width * PAGE_HEIGHT / PAGE_WIDTH)
    width = display_width + gap * 2
    height = display_height + 150
    canvas = Image.new('RGB', (width, height), (18, 23, 35))
    draw = ImageDraw.Draw(canvas)
    draw.text((gap, 20), f'DOKKAEBI RUNTIME ATLAS v14 · {len(assets)} sprites · {len(pages)} page', fill=(238, 244, 255))
    page = pages[0].convert('RGBA').resize((display_width, display_height), Image.Resampling.LANCZOS)
    bg = Image.new('RGBA', (display_width, display_height), (232, 236, 241, 255))
    bg.alpha_composite(page)
    canvas.paste(bg.convert('RGB'), (gap, 58))
    draw.text((gap, 58 + display_height + 12), f'PAGE 01 · {GRID_COLUMNS}x{GRID_ROWS} · {PAGE_WIDTH}x{PAGE_HEIGHT}px · WebP/PNG', fill=(164, 200, 229))
    PREVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(PREVIEW_PATH, quality=93, optimize=True)


def generate(check=False):
    source = json.loads(SOURCE_MANIFEST.read_text('utf-8'))
    selected = [asset for asset in source['assets'] if asset['status'] in INCLUDED_STATUSES or asset['path'] in FORCED_PATHS]
    selected.sort(key=lambda a: (0 if a.get('alias') else 1, a['category'], a['id']))
    pages = []
    frames = []
    for index, asset in enumerate(selected):
        src_path = ROOT / 'public' / asset['path']
        mastered, audit = cleanup_alpha(Image.open(src_path))
        mastered_rel = f"assets/ip-v14/mastered/{asset['category']}/{asset['id']}.png"
        mastered_path = ROOT / 'public' / mastered_rel
        if not check:
            mastered_path.parent.mkdir(parents=True, exist_ok=True)
            mastered.save(mastered_path, optimize=True)
        page_index = index // PAGE_CAPACITY
        tile_index = index % PAGE_CAPACITY
        while len(pages) <= page_index:
            pages.append(Image.new('RGBA', (PAGE_WIDTH, PAGE_HEIGHT), (0, 0, 0, 0)))
        x = (tile_index % GRID_COLUMNS) * TILE
        y = (tile_index // GRID_COLUMNS) * TILE
        tile = mastered.resize((TILE, TILE), Image.Resampling.LANCZOS)
        pages[page_index].alpha_composite(tile, (x, y))
        frames.append({
            'id': asset['id'],
            'alias': asset.get('alias'),
            'category': asset['category'],
            'sourcePath': asset['path'],
            'masteredPath': mastered_rel,
            'page': page_index,
            'index': tile_index,
            'x': x,
            'y': y,
            'width': TILE,
            'height': TILE,
            'u': round(x / PAGE_WIDTH, 6),
            'v': round(y / PAGE_HEIGHT, 6),
            'repeatX': round(TILE / PAGE_WIDTH, 6),
            'repeatY': round(TILE / PAGE_HEIGHT, 6),
            'status': 'atlas-curated' if asset.get('alias') else 'atlas-runtime-ready',
            'audit': audit,
            'sha256': sha256(mastered_path) if check and mastered_path.exists() else None,
        })

    if check:
        manifest = json.loads(MANIFEST_PATH.read_text('utf-8'))
        if manifest['summary']['totalFrames'] != len(selected):
            raise SystemExit('v14 atlas frame count mismatch')
        missing = [f['masteredPath'] for f in manifest['frames'] if not (ROOT / 'public' / f['masteredPath']).exists()]
        if missing:
            raise SystemExit(f'missing v14 mastered sprites: {missing[:5]}')
        for page in manifest['pages']:
            for key in ('png', 'webp'):
                p = ROOT / 'public' / page[key]
                if not p.exists() or sha256(p) != page[f'{key}Sha256']:
                    raise SystemExit(f'v14 atlas hash mismatch: {p}')
        for frame in manifest['frames']:
            p = ROOT / 'public' / frame['masteredPath']
            if sha256(p) != frame['sha256']:
                raise SystemExit(f'v14 mastered hash mismatch: {p}')
        print(f'[v14 atlas] PASS {len(manifest["frames"])} frames / {len(manifest["pages"])} pages')
        return

    ATLAS_ROOT.mkdir(parents=True, exist_ok=True)
    page_records = []
    for index, page in enumerate(pages, start=1):
        png_rel = f'assets/ip-v14/atlas/runtime-atlas-v14-p{index:02d}.png'
        webp_rel = f'assets/ip-v14/atlas/runtime-atlas-v14-p{index:02d}.webp'
        png_path = ROOT / 'public' / png_rel
        webp_path = ROOT / 'public' / webp_rel
        page.save(png_path, optimize=True)
        page.save(webp_path, 'WEBP', lossless=True, quality=100, method=6)
        page_records.append({
            'id': f'page-{index:02d}',
            'png': png_rel,
            'webp': webp_rel,
            'pngSha256': sha256(png_path),
            'webpSha256': sha256(webp_path),
            'width': PAGE_WIDTH,
            'height': PAGE_HEIGHT,
            'columns': GRID_COLUMNS,
            'rows': GRID_ROWS,
        })

    for frame in frames:
        frame['sha256'] = sha256(ROOT / 'public' / frame['masteredPath'])
    quality_pass = sum(f['audit']['quality'] >= 72 and not f['audit']['edgeTouch'] for f in frames)
    quality_review = len(frames) - quality_pass
    summary = {
        'version': '14.0.0',
        'sourceVersion': source['summary']['version'],
        'totalFrames': len(frames),
        'curatedFrames': sum(bool(f['alias']) for f in frames),
        'atlasPages': len(page_records),
        'tileSize': TILE,
        'pageWidth': PAGE_WIDTH,
        'pageHeight': PAGE_HEIGHT,
        'edgeMasterPass': quality_pass,
        'edgeMasterReview': quality_review,
        'production3DApproved': 0,
        'productionArtApproved': 0,
        'massProductionUnlocked': False,
        'styleLock': 'DD-ABSOLUTE-ART-BIBLE-2.0',
        'usePolicy': '2d-ui-codex-vfx-billboard-atlas-only',
    }
    manifest = {'summary': summary, 'pages': page_records, 'frames': frames}
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', 'utf-8')
    write_preview(pages, frames)
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    generate(args.check)
