#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / 'src/assets/title-v17'
OUTPUT_ROOT = ROOT / 'src/assets/title-v112'
PUBLIC_ROOT = ROOT / 'public'
MANIFEST_PATH = OUTPUT_ROOT / 'visual-polish-manifest-v112.json'
VERSION = '1.0.12'
BUILD_ID = 'b24.12'

ASSETS = {
    'desktop_hq': OUTPUT_ROOT / 'title-bg-desktop-v112.webp',
    'desktop_lite': OUTPUT_ROOT / 'title-bg-desktop-lite-v112.webp',
    'mobile_hq': OUTPUT_ROOT / 'title-bg-mobile-v112.webp',
    'mobile_lite': OUTPUT_ROOT / 'title-bg-mobile-lite-v112.webp',
    'mascot_hq': OUTPUT_ROOT / 'title-mascot-v112.webp',
    'mascot_lite': OUTPUT_ROOT / 'title-mascot-lite-v112.webp',
    'cover': PUBLIC_ROOT / 'cover.webp',
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def cover_resize(image: Image.Image, size: tuple[int, int], anchor: tuple[float, float] = (.5, .5)) -> Image.Image:
    target_w, target_h = size
    scale = max(target_w / image.width, target_h / image.height)
    new_size = (max(target_w, round(image.width * scale)), max(target_h, round(image.height * scale)))
    resized = image.resize(new_size, Image.Resampling.LANCZOS)
    overflow_x = max(0, resized.width - target_w)
    overflow_y = max(0, resized.height - target_h)
    left = round(overflow_x * min(1, max(0, anchor[0])))
    top = round(overflow_y * min(1, max(0, anchor[1])))
    return resized.crop((left, top, left + target_w, top + target_h))


def radial_mask(size: tuple[int, int], center: tuple[float, float], radius: float, invert: bool = False) -> Image.Image:
    w, h = size
    px = Image.new('L', size)
    data = []
    cx, cy = center[0] * w, center[1] * h
    max_dist = max(1.0, radius * math.hypot(w, h))
    for y in range(h):
        for x in range(w):
            d = math.hypot(x - cx, y - cy) / max_dist
            value = int(255 * min(1, max(0, d)))
            if invert:
                value = 255 - value
            data.append(value)
    px.putdata(data)
    return px.filter(ImageFilter.GaussianBlur(max(2, round(min(w, h) * .015))))


def screen_blend(base: Image.Image, glow: Image.Image, opacity: float) -> Image.Image:
    blended = ImageChops.screen(base, glow)
    return Image.blend(base, blended, max(0, min(1, opacity)))


def grade_background(source: Path, size: tuple[int, int], *, anchor=(.5, .5), mobile=False) -> Image.Image:
    image = cover_resize(Image.open(source).convert('RGB'), size, anchor)
    image = ImageEnhance.Color(image).enhance(1.10 if not mobile else 1.08)
    image = ImageEnhance.Contrast(image).enhance(1.075)
    image = ImageEnhance.Brightness(image).enhance(.985)

    # Controlled moon/fire bloom: brighten only the strongest highlights.
    highlights = image.convert('L').point(lambda value: max(0, (value - 148) * 2))
    highlights = highlights.filter(ImageFilter.GaussianBlur(max(5, round(min(size) * .012))))
    glow = Image.merge('RGB', (highlights, highlights, highlights))
    glow = ImageEnhance.Color(glow).enhance(.55)
    image = screen_blend(image, glow, .18)

    # Keep the title/button safe zone calm while strengthening edge depth.
    vignette = radial_mask(size, (.50, .52 if not mobile else .47), .62 if not mobile else .68)
    shade = Image.new('RGB', size, (4, 5, 18))
    image = Image.composite(shade, image, vignette.point(lambda v: int(v * .38)))

    safe = radial_mask(size, (.51, .53 if not mobile else .45), .34 if not mobile else .32, invert=True)
    safe_tint = Image.new('RGB', size, (20, 31, 62))
    image = Image.composite(Image.blend(image, safe_tint, .075), image, safe)

    image = image.filter(ImageFilter.UnsharpMask(radius=1.35, percent=118, threshold=3))
    return image


def premultiplied_resize(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    rgba = image.convert('RGBA')
    r, g, b, a = rgba.split()
    alpha = a.resize(size, Image.Resampling.LANCZOS)
    channels = []
    for channel in (r, g, b):
        premul = ImageChops.multiply(channel, a)
        premul = premul.resize(size, Image.Resampling.LANCZOS)
        # Unpremultiply with a bounded lookup to avoid bright transparent halos.
        out = Image.new('L', size)
        p = premul.load()
        ap = alpha.load()
        op = out.load()
        for y in range(size[1]):
            for x in range(size[0]):
                av = ap[x, y]
                op[x, y] = 0 if av <= 2 else min(255, round(p[x, y] * 255 / av))
        channels.append(out)
    return Image.merge('RGBA', (*channels, alpha))


def grade_mascot(source: Path, size: tuple[int, int]) -> Image.Image:
    image = premultiplied_resize(Image.open(source), size)
    rgb = image.convert('RGB')
    rgb = ImageEnhance.Color(rgb).enhance(1.075)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.035)
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.0, percent=110, threshold=2))
    rgb.putalpha(image.getchannel('A').filter(ImageFilter.GaussianBlur(.18)))
    return rgb


def fit_font(font_path: Path, text: str, max_width: int, starting_size: int) -> ImageFont.FreeTypeFont:
    size = starting_size
    while size > 16:
        font = ImageFont.truetype(str(font_path), size)
        box = font.getbbox(text)
        if box[2] - box[0] <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(str(font_path), size)


def make_cover(background: Image.Image, mascot: Image.Image) -> Image.Image:
    cover = cover_resize(background, (1200, 630), (.46, .52)).convert('RGBA')
    overlay = Image.new('RGBA', cover.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for x in range(720):
        t = x / 720
        alpha = round(206 * (1 - t) ** 1.65)
        draw.line((x, 0, x, 630), fill=(3, 6, 18, alpha))
    cover = Image.alpha_composite(cover, overlay)

    character = premultiplied_resize(mascot, (430, 542))
    shadow = Image.new('RGBA', character.size, (0, 0, 0, 0))
    shadow.putalpha(character.getchannel('A').filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * .48)))
    cover.alpha_composite(shadow, (756, 74))
    cover.alpha_composite(character, (748, 52))

    draw = ImageDraw.Draw(cover)
    serif = Path('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc')
    sans = Path('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc')
    title_font = fit_font(serif, '도깨비 디펜스', 640, 82)
    sub_font = ImageFont.truetype(str(sans), 31)
    label_font = ImageFont.truetype(str(sans), 18)
    gold = (255, 224, 151, 255)
    glow = Image.new('RGBA', cover.size, (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    for offset, alpha in [(5, 45), (3, 70)]:
        gdraw.text((71, 198), '도깨비 디펜스', font=title_font, fill=(255, 190, 75, alpha), stroke_width=offset, stroke_fill=(255, 151, 33, alpha // 2))
    glow = glow.filter(ImageFilter.GaussianBlur(5))
    cover = Image.alpha_composite(cover, glow)
    draw = ImageDraw.Draw(cover)
    draw.text((70, 194), '도깨비 디펜스', font=title_font, fill=gold, stroke_width=2, stroke_fill=(44, 21, 22, 255))
    draw.text((74, 305), '운빨 수호대 · PC & MOBILE', font=sub_font, fill=(143, 225, 255, 255))
    draw.rounded_rectangle((72, 371, 545, 416), radius=22, fill=(13, 24, 54, 220), outline=(255, 217, 129, 120), width=2)
    draw.text((96, 381), 'CROSS-PLATFORM VISUAL POLISH', font=label_font, fill=(255, 240, 202, 255))
    draw.text((74, 456), '11방향 전투 · 독립 HUD · 자동 그래픽 품질', font=label_font, fill=(224, 232, 247, 230))
    draw.text((74, 489), f'v{VERSION}  /  {BUILD_ID}', font=label_font, fill=(158, 177, 211, 230))
    return cover.convert('RGB')


def save_webp(image: Image.Image, path: Path, quality: int, *, lossless=False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, 'WEBP', quality=quality, method=6, lossless=lossless, exact=True)


def generate() -> dict:
    desktop = grade_background(SOURCE_ROOT / 'title-bg-desktop-v17.webp', (1920, 1080), anchor=(.5, .54))
    mobile = grade_background(SOURCE_ROOT / 'title-bg-mobile-v17.webp', (900, 1600), anchor=(.5, .47), mobile=True)
    mascot = grade_mascot(SOURCE_ROOT / 'title-mascot-v17.webp', (720, 907))

    save_webp(desktop, ASSETS['desktop_hq'], 88)
    save_webp(desktop.resize((1280, 720), Image.Resampling.LANCZOS), ASSETS['desktop_lite'], 84)
    save_webp(mobile, ASSETS['mobile_hq'], 88)
    save_webp(mobile.resize((600, 1067), Image.Resampling.LANCZOS), ASSETS['mobile_lite'], 84)
    save_webp(mascot, ASSETS['mascot_hq'], 92)
    save_webp(premultiplied_resize(mascot, (520, 655)), ASSETS['mascot_lite'], 88)
    save_webp(make_cover(desktop, mascot), ASSETS['cover'], 90)

    payload = {
        'schema': 'DD-VISUAL-POLISH-ASSET-MANIFEST-1.0',
        'releaseVersion': VERSION,
        'buildId': BUILD_ID,
        'source': 'title-v17 curated runtime art',
        'policy': {
            'runtimeReady': True,
            'generatedWith': 'Pillow deterministic color/edge refinement',
            'desktopSafeZone': {'x': [.24, .76], 'y': [.18, .82]},
            'mobileSafeZone': {'x': [.10, .90], 'y': [.16, .84]},
            'noSvg': True,
        },
        'files': [],
    }
    for key, path in ASSETS.items():
        with Image.open(path) as image:
            payload['files'].append({
                'id': key,
                'path': path.relative_to(ROOT).as_posix(),
                'width': image.width,
                'height': image.height,
                'mode': image.mode,
                'bytes': path.stat().st_size,
                'sha256': sha256(path),
            })
    MANIFEST_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return payload


def check() -> int:
    if not MANIFEST_PATH.exists():
        print(f'MISSING {MANIFEST_PATH.relative_to(ROOT)}')
        return 1
    manifest = json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
    failures = []
    for item in manifest.get('files', []):
        path = ROOT / item['path']
        if not path.exists():
            failures.append(f"missing {item['path']}")
            continue
        if path.stat().st_size != item['bytes']:
            failures.append(f"size mismatch {item['path']}")
        if sha256(path) != item['sha256']:
            failures.append(f"hash mismatch {item['path']}")
        with Image.open(path) as image:
            if image.size != (item['width'], item['height']):
                failures.append(f"dimension mismatch {item['path']}")
    if failures:
        for failure in failures:
            print(f'FAIL {failure}')
        return 1
    print(f"PASS visual polish assets v{manifest['releaseVersion']} ({len(manifest.get('files', []))} files)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if args.check:
        return check()
    payload = generate()
    print(json.dumps({'releaseVersion': payload['releaseVersion'], 'files': len(payload['files']), 'bytes': sum(item['bytes'] for item in payload['files'])}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
