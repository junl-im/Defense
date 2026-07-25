#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / 'production' / 'reference-v117'
OUT = ROOT / 'public' / 'assets' / 'visual-v117'
MANIFEST = OUT / 'asset-approval-manifest-v117.json'
PROD_MANIFEST = ROOT / 'production' / 'approval-v117' / 'asset-approval-manifest-v117.json'

DIRECTION_BOXES = [
    (315, 212, 500, 405), (500, 212, 690, 405), (690, 212, 875, 405),
    (875, 212, 1060, 405), (1060, 212, 1245, 405), (1245, 212, 1435, 405),
    (315, 488, 515, 690), (500, 488, 720, 690), (710, 488, 930, 690),
    (920, 488, 1140, 690), (1140, 488, 1435, 690),
]
CITADEL_BOXES = [
    (35, 190, 360, 615), (365, 190, 720, 615), (720, 190, 1080, 615), (1080, 175, 1450, 620)
]
STATES = ('idle','move','attack','skill','hit','death')
DIRECTIONS = ('front','front-30','side','back-45','back','back-opposite-45','opposite-side','opposite-30','low-45','high-45','special-front')
TIERS = {'low': 64, 'medium': 144, 'high': 184}
CITADEL_TIERS = {'low': 192, 'medium': 384, 'high': 512}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def webp_size(path: Path):
    data = path.read_bytes()
    if len(data) < 30 or data[:4] != b'RIFF' or data[8:12] != b'WEBP':
        raise ValueError(f'not a WebP: {path}')
    kind = data[12:16]
    if kind == b'VP8X':
        return 1 + int.from_bytes(data[24:27], 'little'), 1 + int.from_bytes(data[27:30], 'little')
    if kind == b'VP8 ':
        idx = data.find(b'\x9d\x01\x2a')
        if idx < 0: raise ValueError(f'VP8 size not found: {path}')
        return struct.unpack_from('<H', data, idx + 3)[0] & 0x3fff, struct.unpack_from('<H', data, idx + 5)[0] & 0x3fff
    if kind == b'VP8L':
        b0,b1,b2,b3,b4 = data[20:25]
        if b0 != 0x2f: raise ValueError(f'VP8L signature missing: {path}')
        width = 1 + (((b2 & 0x3f) << 8) | b1)
        height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6))
        return width, height
    raise ValueError(f'unsupported WebP type {kind!r}: {path}')


def check_only():
    if not MANIFEST.exists(): raise SystemExit(f'missing {MANIFEST}')
    manifest = json.loads(MANIFEST.read_text('utf-8'))
    if manifest.get('version') != '1.0.17' or manifest.get('build') != 'b24.17':
        raise SystemExit('manifest identity mismatch')
    for entry in manifest['files']:
        path = ROOT / entry['path']
        if not path.exists(): raise SystemExit(f'missing {entry["path"]}')
        if path.stat().st_size != entry['bytes']: raise SystemExit(f'size mismatch {entry["path"]}')
        if sha256(path) != entry['sha256']: raise SystemExit(f'hash mismatch {entry["path"]}')
        if path.suffix.lower() == '.webp':
            if list(webp_size(path)) != entry['dimensions']: raise SystemExit(f'dimensions mismatch {entry["path"]}')
    if json.loads(PROD_MANIFEST.read_text('utf-8')) != manifest:
        raise SystemExit('production/public manifest mismatch')
    print(f"PASS v1.0.17 approved assets ({len(manifest['files'])} files, 11 directional views, 4 citadel states)")


def require_pillow():
    try:
        from PIL import Image, ImageChops, ImageEnhance, ImageFilter
        return Image, ImageChops, ImageEnhance, ImageFilter
    except Exception as exc:
        raise SystemExit('Pillow is required only for generation. Run: python -m pip install Pillow') from exc


def white_to_alpha(im, Image):
    # Remove only near-white paper connected to the crop border. This keeps
    # internal highlights and eye whites while discarding the concept-board background.
    from collections import deque
    import numpy as np
    rgb = np.asarray(im.convert('RGB')).copy()
    lo = rgb.min(axis=2)
    hi = rgb.max(axis=2)
    candidate = (lo >= 215) & ((hi - lo) <= 38)
    h, w = candidate.shape
    bg = np.zeros((h, w), dtype=np.uint8)
    q = deque()
    for x in range(w):
        if candidate[0, x]: q.append((0, x))
        if candidate[h-1, x]: q.append((h-1, x))
    for y in range(h):
        if candidate[y, 0]: q.append((y, 0))
        if candidate[y, w-1]: q.append((y, w-1))
    while q:
        y, x = q.popleft()
        if bg[y, x] or not candidate[y, x]: continue
        bg[y, x] = 1
        if y: q.append((y-1, x))
        if y+1 < h: q.append((y+1, x))
        if x: q.append((y, x-1))
        if x+1 < w: q.append((y, x+1))
    alpha = np.where(bg == 1, 0, 255).astype('uint8')
    # Remove separator lines and tiny neighboring-cell fragments.
    seen = np.zeros((h, w), dtype=np.uint8)
    keep = np.zeros((h, w), dtype=np.uint8)
    foreground = alpha > 0
    for sy in range(h):
        for sx in range(w):
            if seen[sy, sx] or not foreground[sy, sx]: continue
            q = deque([(sy, sx)]); seen[sy, sx] = 1; pts=[]
            minx=maxx=sx; miny=maxy=sy
            while q:
                y,x=q.popleft(); pts.append((y,x)); minx=min(minx,x); maxx=max(maxx,x); miny=min(miny,y); maxy=max(maxy,y)
                for ny,nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
                    if 0 <= ny < h and 0 <= nx < w and not seen[ny,nx] and foreground[ny,nx]:
                        seen[ny,nx]=1; q.append((ny,nx))
            count=len(pts); cw=maxx-minx+1; ch=maxy-miny+1
            edge_touch = minx <= 1 or maxx >= w-2
            line_like = cw <= 4 and ch >= 36
            tiny_edge = edge_touch and count < 3000
            top_caption = maxy < int(h * .14) and count < 3000
            if count >= 70 and not line_like and not tiny_edge and not top_caption:
                for y,x in pts: keep[y,x]=255
    alpha = keep
    rgba = Image.fromarray(np.dstack([rgb, alpha]), 'RGBA')
    # A tiny blur softens crop edges without reintroducing the paper background.
    from PIL import ImageFilter
    soft = Image.fromarray(alpha, 'L').filter(ImageFilter.GaussianBlur(.45))
    rgba.putalpha(soft)
    bbox = soft.getbbox()
    return rgba.crop(bbox) if bbox else rgba


def fit_cell(im, size, Image):
    margin = max(4, size // 28)
    scale = min((size-2*margin)/max(1,im.width), (size-2*margin)/max(1,im.height))
    resized = im.resize((max(1,int(im.width*scale)), max(1,int(im.height*scale))), Image.Resampling.LANCZOS)
    cell = Image.new('RGBA',(size,size),(0,0,0,0))
    x=(size-resized.width)//2
    y=size-margin-resized.height
    cell.alpha_composite(resized,(x,y))
    return cell


def apply_state(cell, state, Image, ImageEnhance, ImageFilter):
    size=cell.width
    if state=='idle': return cell.copy()
    if state=='move':
        out=Image.new('RGBA',cell.size,(0,0,0,0)); squashed=cell.resize((int(size*1.03),int(size*.96)),Image.Resampling.LANCZOS)
        out.alpha_composite(squashed,((size-squashed.width)//2,size-squashed.height-2)); return out
    if state=='attack':
        rot=cell.rotate(-5,resample=Image.Resampling.BICUBIC,expand=False,center=(size*.5,size*.78))
        out=Image.new('RGBA',cell.size,(0,0,0,0)); out.alpha_composite(rot,(int(size*.035),-int(size*.01))); return out
    if state=='skill':
        alpha=cell.getchannel('A'); glow=Image.new('RGBA',cell.size,(255,105,20,0)); glow.putalpha(alpha.filter(ImageFilter.GaussianBlur(max(2,size//30))))
        out=Image.alpha_composite(glow,cell); return ImageEnhance.Contrast(out).enhance(1.06)
    if state=='hit':
        tint=Image.new('RGBA',cell.size,(255,65,72,0)); tint.putalpha(cell.getchannel('A').point(lambda a:int(a*.34)))
        out=Image.alpha_composite(cell,tint); shifted=Image.new('RGBA',cell.size,(0,0,0,0)); shifted.alpha_composite(out,(-int(size*.025),0)); return shifted
    if state=='death':
        rot=cell.rotate(68,resample=Image.Resampling.BICUBIC,expand=False,center=(size*.50,size*.82))
        rot.putalpha(rot.getchannel('A').point(lambda a:int(a*.78)))
        out=Image.new('RGBA',cell.size,(0,0,0,0)); out.alpha_composite(rot,(0,int(size*.08))); return out
    return cell.copy()


def save_webp(im,path,quality=92):
    path.parent.mkdir(parents=True,exist_ok=True)
    im.save(path,'WEBP',quality=quality,method=3,lossless=False,exact=True)


def generate():
    Image, ImageChops, ImageEnhance, ImageFilter = require_pillow()
    pupu = Image.open(REF/'pupu-guardian-concept-v117.png').convert('RGB')
    citadel = Image.open(REF/'guardian-citadel-concept-v117.png').convert('RGB')
    source_views=[]
    for box in DIRECTION_BOXES:
        source_views.append(white_to_alpha(pupu.crop(box),Image))
    files=[]
    for tier,size in TIERS.items():
        atlas=Image.new('RGBA',(size*11,size*6),(0,0,0,0))
        for col,view in enumerate(source_views):
            base=fit_cell(view,size,Image)
            for row,state in enumerate(STATES):
                frame=apply_state(base,state,Image,ImageEnhance,ImageFilter)
                atlas.alpha_composite(frame,(col*size,row*size))
        name=f'guardian-ember-pupu-atlas-{tier}-v117.webp'
        path=OUT/'directional'/name
        save_webp(atlas,path,94 if tier=='high' else 90)
        files.append(path)
    citadel_names=('stable','shielded','cracked','critical')
    for state,box in zip(citadel_names,CITADEL_BOXES):
        crop=white_to_alpha(citadel.crop(box),Image)
        for tier,size in CITADEL_TIERS.items():
            cell=fit_cell(crop,size,Image)
            path=OUT/'citadel'/f'guardian-citadel-{state}-{tier}-v117.webp'
            save_webp(cell,path,94 if tier=='high' else 90)
            files.append(path)
    # compact direction preview used by the approval viewer
    preview_size=128
    preview=Image.new('RGBA',(preview_size*11,preview_size),(19,23,37,255))
    for col,view in enumerate(source_views): preview.alpha_composite(fit_cell(view,preview_size,Image),(col*preview_size,0))
    preview_path=OUT/'directional'/'guardian-ember-pupu-turntable-v117.webp'
    save_webp(preview,preview_path,92); files.append(preview_path)
    entries=[]
    for path in files:
        rel=path.relative_to(ROOT).as_posix(); w,h=webp_size(path)
        entries.append({'path':rel,'bytes':path.stat().st_size,'sha256':sha256(path),'dimensions':[w,h]})
    manifest={
      'version':'1.0.17','build':'b24.17','policyId':'DD-ASSET-APPROVAL-V117',
      'summary':{'directionalEntitiesApproved':1,'directionViewsApproved':11,'actionRowsProvisional':5,'citadelStatesApproved':4,'oldPrototypeAtlasesQuarantined':4},
      'directional':{'assetId':'approved-directional-guardian-ember-pupu-v117','columns':11,'rows':6,'directions':list(DIRECTIONS),'states':list(STATES),'directionArt':'approved','actionArt':'derived-provisional','mirroringAllowed':False},
      'citadel':{'assetIds':{s:f'guardian-citadel-{s}-v117' for s in citadel_names},'states':list(citadel_names),'productionApproved':True},
      'files':entries
    }
    MANIFEST.parent.mkdir(parents=True,exist_ok=True); MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n','utf-8')
    PROD_MANIFEST.parent.mkdir(parents=True,exist_ok=True); PROD_MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n','utf-8')
    print(f"Generated v1.0.17 approved asset pack: {len(files)} files")

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('--check',action='store_true'); args=p.parse_args()
    check_only() if args.check else generate()
