#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path

Image = None
ImageDraw = None
ImageFilter = None
cv2 = None
np = None


def require_image_dependencies():
    """Load heavy image tooling only for atlas regeneration, never for --check."""
    global Image, ImageDraw, ImageFilter, cv2, np
    if Image is not None and cv2 is not None and np is not None:
        return
    try:
        from PIL import Image as PILImage, ImageDraw as PILImageDraw
        try:
            from PIL import ImageFilter as PILImageFilter
        except ImportError:
            PILImageFilter = None
        import cv2 as cv2_module
        import numpy as numpy_module
    except ModuleNotFoundError as exc:
        missing = exc.name or 'image dependency'
        raise SystemExit(
            f"Atlas regeneration requires {missing}. "
            "Install the optional tooling with: "
            "python -m pip install -r requirements-atlas.txt"
        ) from exc
    Image = PILImage
    ImageDraw = PILImageDraw
    ImageFilter = PILImageFilter
    cv2 = cv2_module
    np = numpy_module

ROOT = Path(__file__).resolve().parents[1]
SOURCE_MANIFEST = ROOT / 'public/assets/ip-v13/asset-manifest-v13.json'
V14_MANIFEST = ROOT / 'public/assets/ip-v14/atlas-manifest-v14.json'
OUTPUT_ROOT = ROOT / 'public/assets/ip-v15'
MASTERED_ROOT = OUTPUT_ROOT / 'mastered'
ATLAS_ROOT = OUTPUT_ROOT / 'atlas'
MANIFEST_PATH = OUTPUT_ROOT / 'atlas-manifest-v15.json'
LIBRARY_PATH = ROOT / 'src/ip-asset-library-v15.js'
REVIEW_PATH = ROOT / 'public/asset-library-v15.html'
PREVIEW_PATH = ROOT / 'docs/ATLAS_LIVING_BATTLEFIELD_PREVIEW_v15.0.0.jpg'
MASTER_CANVAS = 256
MASTER_INSET = 18
GRID_COLUMNS = 16
GRID_ROWS = 8
PAGE_CAPACITY = GRID_COLUMNS * GRID_ROWS
TILES = {'1x': 64, '2x': 128}

EXTRA_ALIASES = {
    'assets/ip-v13/crops/items/items-r04-c01.png': 'prop-chest-bronze',
    'assets/ip-v13/crops/items/items-r04-c02.png': 'prop-chest-blue',
    'assets/ip-v13/crops/items/items-r04-c05.png': 'prop-reward-bag-red',
    'assets/ip-v13/crops/environment/environment-r04-c04.png': 'prop-supply-crate',
    'assets/ip-v13/crops/environment/environment-r04-c05.png': 'prop-barrel',
    'assets/ip-v13/crops/environment/environment-r04-c06.png': 'prop-field-cannon',
    'assets/ip-v13/crops/environment/environment-r04-c07.png': 'prop-stone-wall',
    'assets/ip-v13/crops/combat-props/combat-props-r04-c01.png': 'prop-bear-trap',
    'assets/ip-v13/crops/combat-props/combat-props-r04-c02.png': 'prop-vine-trap',
    'assets/ip-v13/crops/combat-props/combat-props-r05-c01.png': 'prop-war-drum',
    'assets/ip-v13/crops/combat-props/combat-props-r05-c02.png': 'prop-spike-barricade',
    'assets/ip-v13/crops/combat-props/combat-props-r05-c03.png': 'prop-shield-turret',
    'assets/ip-v13/crops/combat-props/combat-props-r06-c01.png': 'prop-cauldron-green',
    'assets/ip-v13/crops/combat-props/combat-props-r06-c02.png': 'prop-cauldron-purple',
    'assets/ip-v13/crops/combat-props/combat-props-r06-c04.png': 'prop-moon-cannon',
    'assets/ip-v13/crops/combat-props/combat-props-r06-c05.png': 'prop-crystal-reactor',
    'assets/ip-v13/crops/combat-props/combat-props-r06-c06.png': 'prop-spider-turret',
    'assets/ip-v13/crops/combat-props/combat-props-r07-c04.png': 'prop-arcane-engine',
    'assets/ip-v13/crops/combat-props/combat-props-r07-c05.png': 'prop-roller-trap',
    'assets/ip-v13/crops/combat-props/combat-props-r07-c06.png': 'prop-siege-cannon',
    'assets/ip-v13/crops/vfx/vfx-r02-c01.png': 'vfx-moon-slash',
    'assets/ip-v13/crops/vfx/vfx-r03-c03.png': 'vfx-heal-rune',
    'assets/ip-v13/crops/vfx/vfx-r04-c04.png': 'vfx-tornado',
    'assets/ip-v13/crops/vfx/vfx-r05-c04.png': 'vfx-fire-burst',
    'assets/ip-v13/crops/ui/ui-r04-c01.png': 'ui-spirit',
    'assets/ip-v13/crops/ui/ui-r04-c07.png': 'ui-ice-status',
    'assets/ip-v13/crops/ui/ui-r05-c01.png': 'ui-ghost-status',
    'assets/ip-v13/crops/ui/ui-r06-c01.png': 'ui-refresh',
    'assets/ip-v13/crops/ui/ui-r06-c05.png': 'ui-dice',
    'assets/ip-v13/crops/ui/ui-r07-c03.png': 'ui-play',
    'assets/ip-v13/crops/ui/ui-r07-c05.png': 'ui-confirm',
    'assets/ip-v13/crops/ui/ui-r08-c10.png': 'ui-shield-rank',
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
    soft = cv2.GaussianBlur((clean * 255).astype(np.uint8), (0, 0), 0.52)
    soft[soft < 5] = 0
    soft[soft > 248] = 255
    ys, xs = np.where(soft > 4)
    if not len(xs):
        return Image.new('RGBA', (MASTER_CANVAS, MASTER_CANVAS), (0, 0, 0, 0)), {'edgeTouch': False, 'fringeRatio': 0, 'componentCount': 0, 'coverage': 0, 'quality': 0}
    bbox = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    pad = 6
    box = (max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(source.width, bbox[2]+pad), min(source.height, bbox[3]+pad))
    rgba[:, :, 3] = soft
    rgba[soft == 0, :3] = 0
    cut = Image.fromarray(rgba, 'RGBA').crop(box)
    scale = (MASTER_CANVAS - MASTER_INSET*2) / max(1, max(cut.size))
    size = (max(1, round(cut.width*scale)), max(1, round(cut.height*scale)))
    cut = cut.resize(size, Image.Resampling.LANCZOS)
    mastered = Image.new('RGBA', (MASTER_CANVAS, MASTER_CANVAS), (0, 0, 0, 0))
    mastered.alpha_composite(cut, ((MASTER_CANVAS-size[0])//2, (MASTER_CANVAS-size[1])//2))
    a = np.array(mastered.getchannel('A'))
    active = a > 4
    edge = bool(active[0].any() or active[-1].any() or active[:,0].any() or active[:,-1].any())
    fringe = ((a > 4) & (a < 235)).sum()
    solid = (a >= 235).sum()
    fringe_ratio = float(fringe) / max(1.0, float(fringe + solid))
    coverage = float(active.sum()) / float(MASTER_CANVAS*MASTER_CANVAS)
    quality = 100 - min(24, round(fringe_ratio*85)) - (24 if edge else 0) - min(15, max(0, len(components)-10)) - (18 if coverage < .025 else 0)
    return mastered, {'edgeTouch': edge, 'fringeRatio': round(fringe_ratio,5), 'componentCount': len(components), 'coverage': round(coverage,5), 'quality': max(0,min(100,quality))}


def js_literal(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def write_library(manifest):
    summary = manifest['summary']
    pages = manifest['pages']
    frames_map = {}
    for frame in manifest['frames']:
        record = {k: frame[k] for k in ('id','alias','category','page','index','column','row','columns','rows','masteredPath','qualityBand')}
        frames_map[frame['sourcePath']] = record
        frames_map[frame['id']] = record
        if frame.get('alias'):
            frames_map[frame['alias']] = record
    header = (
        f"export const IP_ASSET_LIBRARY_V15 = Object.freeze({js_literal(summary)});\n\n"
        "export const IP_ASSET_ATLAS_URL = './asset-library-v15.html';\n"
        "export const IP_ASSET_ATLAS_MANIFEST_URL = './assets/ip-v15/atlas-manifest-v15.json';\n"
        f"export const IP_V15_ATLAS_PAGES = Object.freeze({js_literal(pages)});\n"
        f"export const IP_V15_ATLAS_FRAMES = Object.freeze({js_literal(frames_map)});\n\n"
        "export function getV15AtlasFrame(key) { return IP_V15_ATLAS_FRAMES[key] || null; }\n\n"
    )
    function = r'''export function atlasSpriteMarkup(key, alt = '', className = '') {
  const frame = getV15AtlasFrame(key);
  if (!frame) return '';
  const page = IP_V15_ATLAS_PAGES[frame.page];
  const pageUrl = page.webp2x || page.webp1x;
  const sizeX = `${page.columns * 100}%`;
  const sizeY = `${page.rows * 100}%`;
  const posX = frame.columns > 1 ? `${(frame.column / (frame.columns - 1)) * 100}%` : '0%';
  const posY = frame.rows > 1 ? `${(frame.row / (frame.rows - 1)) * 100}%` : '0%';
  const safeAlt = String(alt).replaceAll('\"', '&quot;');
  return `<span class="atlas-sprite ${className}" role="img" aria-label="${safeAlt}" style="--atlas-image:url('${pageUrl}');--atlas-size-x:${sizeX};--atlas-size-y:${sizeY};--atlas-pos-x:${posX};--atlas-pos-y:${posY}"></span>`;
}
'''
    LIBRARY_PATH.write_text(header + function, 'utf-8')


def write_review(manifest):
    cards=[]
    for f in manifest['frames']:
        label=f.get('alias') or f['id']
        p=manifest['pages'][f['page']]
        cards.append(f"<article data-category=\"{f['category']}\"><div class=\"sprite\" style=\"--img:url('{p['webp2x']}');--sx:{p['columns']*100}%;--sy:{p['rows']*100}%;--px:{(f['column']/(p['columns']-1)*100) if p['columns']>1 else 0}%;--py:{(f['row']/(p['rows']-1)*100) if p['rows']>1 else 0}%\"></div><b>{label}</b><small>{f['category']} · Q{f['audit']['quality']} · {f['qualityBand']}</small></article>")
    html=f"""<!doctype html><html lang=\"ko\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Atlas Forge v15</title><style>body{{margin:0;background:#111827;color:#eef4ff;font-family:system-ui;padding:24px}}header{{max-width:1200px;margin:auto 0 20px}}.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:12px;max-width:1400px}}article{{background:#1c2638;border:1px solid #42526d;border-radius:16px;padding:10px}}.sprite{{aspect-ratio:1;background-image:var(--img);background-size:var(--sx) var(--sy);background-position:var(--px) var(--py);background-repeat:no-repeat;border-radius:12px;background-color:#263044}}b,small{{display:block;overflow-wrap:anywhere}}small{{color:#9fb2d0;margin-top:5px}}</style><header><h1>ATLAS FORGE v15 · LIVING BATTLEFIELD</h1><p>{manifest['summary']['totalFrames']} frames · {manifest['summary']['atlasPages']} pages · 1x/2x PNG+WebP · production 3D approval remains 0.</p></header><main class=\"grid\">{''.join(cards)}</main></html>"""
    REVIEW_PATH.write_text(html, 'utf-8')


def write_preview(manifest):
    gap=24; page_w=1024; thumb_h=512
    count=len(manifest['pages']); canvas=Image.new('RGB',(page_w+gap*2,count*thumb_h+140),(18,23,35)); d=ImageDraw.Draw(canvas)
    d.text((gap,18),f"DOKKAEBI ATLAS v15 · {manifest['summary']['totalFrames']} frames · 1x/2x",fill=(238,244,255))
    y=58
    for i,p in enumerate(manifest['pages']):
        img=Image.open(ROOT/'public'/p['png1x']).convert('RGBA').resize((page_w,512),Image.Resampling.NEAREST)
        bg=Image.new('RGBA',img.size,(232,236,241,255)); bg.alpha_composite(img); canvas.paste(bg.convert('RGB'),(gap,y));
        d.text((gap,y+486),f"PAGE {i+1:02d} · {p['columns']}x{p['rows']} · 1x {p['width1x']}x{p['height1x']} · 2x {p['width2x']}x{p['height2x']}",fill=(164,200,229)); y+=thumb_h
    PREVIEW_PATH.parent.mkdir(parents=True,exist_ok=True); canvas.save(PREVIEW_PATH,quality=92,optimize=True)


def generate(check=False):
    if not check:
        require_image_dependencies()
    source=json.loads(SOURCE_MANIFEST.read_text('utf-8'))
    by_path={a['path']:a for a in source['assets']}
    v14=json.loads(V14_MANIFEST.read_text('utf-8'))
    selected_paths=[f['sourcePath'] for f in v14['frames']]
    for path in EXTRA_ALIASES:
        if path not in selected_paths: selected_paths.append(path)
    assets=[]
    for path in selected_paths:
        asset=dict(by_path[path]); asset['alias']=asset.get('alias') or EXTRA_ALIASES.get(path); assets.append(asset)
    if check:
        m=json.loads(MANIFEST_PATH.read_text('utf-8'))
        if m['summary']['totalFrames']!=len(assets): raise SystemExit('v15 frame count mismatch')
        for p in m['pages']:
            for key in ('png1x','webp1x','png2x','webp2x'):
                path=ROOT/'public'/p[key]
                if not path.exists() or sha256(path)!=p[key+'Sha256']: raise SystemExit(f'v15 atlas hash mismatch: {path}')
        for f in m['frames']:
            path=ROOT/'public'/f['masteredPath']
            if not path.exists() or sha256(path)!=f['sha256']: raise SystemExit(f'v15 mastered hash mismatch: {path}')
        print(f"[v15 atlas] PASS {m['summary']['totalFrames']} frames / {m['summary']['atlasPages']} pages / 1x+2x")
        return
    page_count = (len(assets) + PAGE_CAPACITY - 1) // PAGE_CAPACITY
    rows_by_page = [GRID_ROWS if i < page_count - 1 else max(1, (len(assets) - i * PAGE_CAPACITY + GRID_COLUMNS - 1) // GRID_COLUMNS) for i in range(page_count)]
    pages_by_scale={s:[] for s in TILES}; frames=[]
    for index,asset in enumerate(assets):
        src=ROOT/'public'/asset['path']; mastered,audit=cleanup_alpha(Image.open(src))
        mastered_rel=f"assets/ip-v15/mastered/{asset['category']}/{asset['id']}.png"; out=ROOT/'public'/mastered_rel; out.parent.mkdir(parents=True,exist_ok=True); mastered.save(out,optimize=True)
        page_index=index//PAGE_CAPACITY; tile_index=index%PAGE_CAPACITY; col=tile_index%GRID_COLUMNS; row=tile_index//GRID_COLUMNS
        for scale,tile in TILES.items():
            while len(pages_by_scale[scale])<=page_index:
                next_page = len(pages_by_scale[scale])
                pages_by_scale[scale].append(Image.new('RGBA',(tile*GRID_COLUMNS,tile*rows_by_page[next_page]),(0,0,0,0)))
            pages_by_scale[scale][page_index].alpha_composite(mastered.resize((tile,tile),Image.Resampling.LANCZOS),(col*tile,row*tile))
        band='pass' if audit['quality']>=78 and not audit['edgeTouch'] else 'review'
        frames.append({'id':asset['id'],'alias':asset.get('alias'),'category':asset['category'],'sourcePath':asset['path'],'masteredPath':mastered_rel,'page':page_index,'index':tile_index,'column':col,'row':row,'columns':GRID_COLUMNS,'rows':rows_by_page[page_index],'qualityBand':band,'audit':audit,'sha256':sha256(out)})
    ATLAS_ROOT.mkdir(parents=True,exist_ok=True); page_records=[]
    for page_index in range(max(len(v) for v in pages_by_scale.values())):
        rec={'id':f'page-{page_index+1:02d}','columns':GRID_COLUMNS,'rows':rows_by_page[page_index]}
        for scale,tile in TILES.items():
            page=pages_by_scale[scale][page_index]
            for fmt in ('png','webp'):
                rel=f"assets/ip-v15/atlas/runtime-atlas-v15-p{page_index+1:02d}-{scale}.{fmt}"; path=ROOT/'public'/rel
                if fmt=='png': page.save(path,optimize=True)
                else: page.save(path,'WEBP',lossless=True,quality=100,method=2)
                key=f'{fmt}{scale}'; rec[key]=rel; rec[key+'Sha256']=sha256(path)
            rec[f'width{scale}']=tile*GRID_COLUMNS; rec[f'height{scale}']=tile*rows_by_page[page_index]
        page_records.append(rec)
    summary={'version':'15.0.0','sourceVersion':'14.0.0','totalFrames':len(frames),'curatedFrames':sum(bool(f.get('alias')) for f in frames),'interactivePropFrames':len(EXTRA_ALIASES),'atlasPages':len(page_records),'tileSize1x':64,'tileSize2x':128,'edgeMasterPass':sum(f['qualityBand']=='pass' for f in frames),'edgeMasterReview':sum(f['qualityBand']=='review' for f in frames),'production3DApproved':0,'productionArtApproved':0,'massProductionUnlocked':False,'styleLock':'DD-ABSOLUTE-ART-BIBLE-2.0','usePolicy':'2d-ui-codex-vfx-billboard-interactive-props-only'}
    manifest={'summary':summary,'pages':page_records,'frames':frames}
    MANIFEST_PATH.parent.mkdir(parents=True,exist_ok=True); MANIFEST_PATH.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n','utf-8')
    write_library(manifest); write_review(manifest); write_preview(manifest)
    print(json.dumps(summary,ensure_ascii=False))

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('--check',action='store_true'); args=p.parse_args(); generate(args.check)
