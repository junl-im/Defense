#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
import cv2

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'production/DokkaebiDefense/15_Source_Archives/ip-v13/sheets'
OUTPUT = ROOT / 'public/assets/ip-v13/crops'
MANIFEST = ROOT / 'public/assets/ip-v13/asset-manifest-v13.json'

SHEETS = [
    ('mixed', 'sheet-01-mixed.png', [6,2,6,6,7]),
    ('heroes', 'sheet-02-heroes.png', [6,6,6,6,6,6]),
    ('monsters', 'sheet-03-monsters.png', [8,8,8,8,8]),
    ('bosses', 'sheet-04-bosses.png', [5,5,5,5,5]),
    ('weapons', 'sheet-05-weapons.png', [6,6,6,6,6,6]),
    ('items', 'sheet-06-items.png', [8,8,8,8,8,8]),
    ('vfx', 'sheet-07-vfx.png', [8,8,8,8,8,8]),
    ('combat-props', 'sheet-08-combat-props.png', [6,6,6,6,6,6,6]),
    ('environment', 'sheet-09-environment.png', [8,7,8,8,7]),
    ('ui', 'sheet-10-ui.png', [9,8,10,10,10,8,10,10]),
]

CURATED = {
    'hero-warrior': ('heroes', 1, 1),
    'hero-archer': ('heroes', 1, 2),
    'hero-mage': ('heroes', 1, 3),
    'hero-shaman': ('heroes', 1, 4),
    'hero-taoist': ('heroes', 1, 5),
    'hero-fox-spirit': ('heroes', 1, 6),
    'monster-goblin-bomber': ('monsters', 1, 1),
    'monster-goblin-rogue': ('monsters', 1, 2),
    'monster-fire-imp': ('monsters', 1, 4),
    'monster-blue-slime': ('monsters', 1, 5),
    'monster-green-slime': ('monsters', 1, 6),
    'monster-ghost': ('monsters', 1, 7),
    'monster-skeleton': ('monsters', 1, 8),
    'boss-blue-ogre': ('bosses', 1, 1),
    'boss-plague-taoist': ('bosses', 1, 2),
    'boss-twin-dragon': ('bosses', 1, 3),
    'boss-stone-golem': ('bosses', 1, 4),
    'boss-spirit-queen': ('bosses', 1, 5),
    'env-blue-lantern': ('environment', 1, 1),
    'env-hanging-lantern': ('environment', 1, 2),
    'env-mana-crystal': ('environment', 1, 3),
    'env-fire-brazier': ('environment', 1, 4),
    'env-market-house': ('environment', 2, 1),
    'env-red-gate': ('environment', 2, 2),
    'env-sacred-tree-green': ('environment', 3, 1),
    'env-sacred-tree-autumn': ('environment', 3, 2),
    'vfx-spirit-flame': ('vfx', 1, 1),
    'vfx-ice-burst': ('vfx', 1, 4),
    'vfx-heal-circle': ('vfx', 6, 1),
    'vfx-fire-impact': ('vfx', 5, 3),
    'weapon-moon-club': ('weapons', 1, 1),
    'weapon-seal-club': ('weapons', 1, 2),
    'weapon-fire-blade': ('weapons', 1, 6),
    'item-jade-charm': ('items', 1, 2),
    'item-blue-orb-charm': ('items', 1, 4),
    'item-fox-mask': ('items', 1, 8),
    'ui-coin': ('ui', 1, 1),
    'ui-gem-blue': ('ui', 1, 5),
    'ui-health': ('ui', 3, 1),
    'ui-fire': ('ui', 3, 7),
    'ui-ice': ('ui', 3, 8),
    'ui-lightning': ('ui', 3, 10),
}

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def background_removed(cell: Image.Image):
    rgb = np.array(cell.convert('RGB'))
    mx = rgb.max(axis=2).astype(np.int16)
    mn = rgb.min(axis=2).astype(np.int16)
    neutral = (mx - mn) <= 16
    bright = mn >= 218
    candidates = (neutral & bright).astype(np.uint8)
    count, labels = cv2.connectedComponents(candidates, connectivity=8)
    borders = np.concatenate((labels[0], labels[-1], labels[:,0], labels[:,-1]))
    bg_labels = np.unique(borders)
    bg_labels = bg_labels[bg_labels != 0]
    background = np.isin(labels, bg_labels)
    foreground = (~background).astype(np.uint8)
    # Remove isolated noise while preserving disconnected particles.
    n, cc, stats, centers = cv2.connectedComponentsWithStats(foreground, connectivity=8)
    clean = np.zeros_like(foreground)
    valid=[i for i in range(1,n) if stats[i, cv2.CC_STAT_AREA] >= 10]
    if valid:
        main=max(valid, key=lambda i: stats[i, cv2.CC_STAT_AREA])
        main_area=float(stats[main, cv2.CC_STAT_AREA])
        mx,my,mw,mh=stats[main, cv2.CC_STAT_LEFT],stats[main, cv2.CC_STAT_TOP],stats[main, cv2.CC_STAT_WIDTH],stats[main, cv2.CC_STAT_HEIGHT]
        main_box=(mx,my,mx+mw,my+mh)
        for i in valid:
            x,y,w,h=stats[i, cv2.CC_STAT_LEFT],stats[i, cv2.CC_STAT_TOP],stats[i, cv2.CC_STAT_WIDTH],stats[i, cv2.CC_STAT_HEIGHT]
            box=(x,y,x+w,y+h)
            gap_x=max(0, main_box[0]-box[2], box[0]-main_box[2])
            gap_y=max(0, main_box[1]-box[3], box[1]-main_box[3])
            gap=(gap_x*gap_x+gap_y*gap_y)**.5
            area=float(stats[i, cv2.CC_STAT_AREA])
            if i==main or gap <= 22 or area >= main_area*.06:
                clean[cc == i] = 1
    if clean.sum() == 0:
        clean = foreground
    ys, xs = np.where(clean > 0)
    if not len(xs):
        return Image.new('RGBA', (32,32), (0,0,0,0)), (0,0,0,0), True, 0.0
    bbox = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    edge_touch = bbox[0] <= 2 or bbox[1] <= 2 or bbox[2] >= cell.width - 2 or bbox[3] >= cell.height - 2
    alpha = Image.fromarray((clean * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(.55))
    rgba = cell.convert('RGBA')
    rgba.putalpha(alpha)
    pad = 7
    box = (max(0,bbox[0]-pad), max(0,bbox[1]-pad), min(cell.width,bbox[2]+pad), min(cell.height,bbox[3]+pad))
    trimmed = rgba.crop(box)
    coverage = float(clean.sum()) / float(clean.size)
    return trimmed, bbox, edge_touch, coverage

def normalize(image: Image.Image, canvas=256, inset=18):
    max_side = max(image.size)
    scale = min(1.7, (canvas - inset*2) / max_side) if max_side else 1
    size = (max(1, round(image.width*scale)), max(1, round(image.height*scale)))
    resized = image.resize(size, Image.Resampling.LANCZOS)
    out = Image.new('RGBA', (canvas, canvas), (0,0,0,0))
    out.alpha_composite(resized, ((canvas-size[0])//2, (canvas-size[1])//2))
    return out

def sheet_foreground_mask(image: Image.Image):
    rgb = np.array(image.convert('RGB'))
    mx = rgb.max(axis=2).astype(np.int16)
    mn = rgb.min(axis=2).astype(np.int16)
    candidates = (((mx - mn) <= 16) & (mn >= 218)).astype(np.uint8)
    _, labels = cv2.connectedComponents(candidates, connectivity=8)
    borders = np.concatenate((labels[0], labels[-1], labels[:,0], labels[:,-1]))
    bg_labels = np.unique(borders)
    bg_labels = bg_labels[bg_labels != 0]
    return (~np.isin(labels, bg_labels)).astype(np.uint8)

def adaptive_bounds(projection, segments, length, window_ratio=.24):
    bounds=[0]
    nominal=length/segments
    for i in range(1,segments):
        expected=i*nominal
        radius=max(8,int(nominal*window_ratio))
        lo=max(bounds[-1]+8,int(expected-radius))
        hi=min(length-8,int(expected+radius))
        if hi<=lo:
            point=int(expected)
        else:
            values=projection[lo:hi+1]
            smooth=np.convolve(values, np.ones(5)/5, mode='same') if len(values)>=5 else values
            point=lo+int(np.argmin(smooth))
        bounds.append(point)
    bounds.append(length)
    return bounds

def main(check=False):
    assets=[]
    alias_by_key = {v:k for k,v in CURATED.items()}
    for category, filename, row_counts in SHEETS:
        source = SOURCE / filename
        image = Image.open(source).convert('RGBA')
        sheet_dir = OUTPUT / category
        sheet_dir.mkdir(parents=True, exist_ok=True)
        rows = len(row_counts)
        full_fg = sheet_foreground_mask(image)
        y_projection = full_fg.sum(axis=1)
        y_bounds = adaptive_bounds(y_projection, rows, image.height, .22)
        for r, cols in enumerate(row_counts, start=1):
            y0, y1 = y_bounds[r-1], y_bounds[r]
            row_fg = full_fg[y0:y1]
            x_projection = row_fg.sum(axis=0)
            x_bounds = adaptive_bounds(x_projection, cols, image.width, .22)
            for c in range(1, cols+1):
                x0, x1 = x_bounds[c-1], x_bounds[c]
                cell = image.crop((x0,y0,x1,y1))
                cut,bbox,edge_touch,coverage = background_removed(cell)
                normalized=normalize(cut)
                asset_id=f'{category}-r{r:02d}-c{c:02d}'
                alias=alias_by_key.get((category,r,c))
                output=sheet_dir/f'{asset_id}.png'
                if not check:
                    normalized.save(output, optimize=True)
                status='curated-runtime-2d' if alias else ('review' if edge_touch or coverage < .015 else 'runtime-ready-2d')
                assets.append({
                    'id':asset_id,'alias':alias,'category':category,'sheet':filename,
                    'row':r,'column':c,'sourceRect':[x0,y0,x1-x0,y1-y0],
                    'detectedBounds':list(bbox),'edgeTouch':edge_touch,
                    'foregroundCoverage':round(coverage,5),'status':status,
                    'path':f'assets/ip-v13/crops/{category}/{asset_id}.png',
                    'sha256': sha256(output) if check and output.exists() else None
                })
    if check:
        existing=json.loads(MANIFEST.read_text('utf-8'))
        expected={(a['id'],a['path']) for a in assets}
        actual={(a['id'],a['path']) for a in existing['assets']}
        if expected != actual:
            raise SystemExit('v13 manifest structure mismatch')
        missing=[a['path'] for a in existing['assets'] if not (ROOT/'public'/a['path']).exists()]
        if missing: raise SystemExit(f'missing v13 crops: {missing[:5]}')
        print(f'[v13 sheets] PASS {len(existing["assets"])} crops')
        return
    for asset in assets:
        asset['sha256']=sha256(ROOT/'public'/asset['path'])
    summary={
        'version':'13.0.0','sourceSheets':len(SHEETS),'totalCrops':len(assets),
        'runtimeReady2D':sum(a['status'] in {'runtime-ready-2d','curated-runtime-2d'} for a in assets),
        'curatedRuntime2D':sum(a['status']=='curated-runtime-2d' for a in assets),
        'needsReview':sum(a['status']=='review' for a in assets),
        'curatedAliases':sum(bool(a['alias']) for a in assets),
        'production3DApproved':0,
        'checkerboardWasBaked':True,
        'backgroundRemoval':'border-connected bright-neutral matte removal',
        'styleLock':'DD-ABSOLUTE-ART-BIBLE-2.0'
    }
    manifest={'summary':summary,'sheets':[{'category':c,'file':f,'rowCounts':rc,'sha256':sha256(SOURCE/f)} for c,f,rc in SHEETS],'assets':assets,'curated':CURATED}
    MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n','utf-8')
    print(json.dumps(summary,ensure_ascii=False))

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('--check',action='store_true'); args=p.parse_args(); main(args.check)
