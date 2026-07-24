#!/usr/bin/env python3
"""Generate deterministic v1.0.14 runtime art polish assets.

`--check` intentionally uses only the Python standard library so CI does not
need Pillow. Asset generation requires Pillow and is performed only by the art
pipeline, not during release verification.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = ROOT / "public" / "assets" / "visual-v114"
MANIFEST_PATH = PUBLIC_ROOT / "asset-polish-manifest-v114.json"
BOARD_PATH = ROOT / "docs" / "v1.0.14-asset-polish-board.png"
VERSION = "1.0.14"
BUILD = "b24.14"
SIZES = {"low": 192, "medium": 320, "high": 512}

CHARACTERS = [
    ("hero-warrior", "hero", "melee", "public/assets/ip-v13/crops/heroes/heroes-r01-c01.png", "warm"),
    ("hero-archer", "hero", "ranged", "public/assets/ip-v13/crops/heroes/heroes-r01-c02.png", "warm"),
    ("hero-mage", "hero", "caster", "public/assets/ip-v13/crops/heroes/heroes-r01-c03.png", "cool"),
    ("hero-shaman", "hero", "support", "public/assets/ip-v13/crops/heroes/heroes-r01-c04.png", "gold"),
    ("hero-taoist", "hero", "controller", "public/assets/ip-v13/crops/heroes/heroes-r01-c05.png", "spirit"),
    ("guardian-ember", "guardian", "caster", "public/assets/ip-v13/crops/heroes/heroes-r04-c06.png", "fire"),
    ("guardian-frost", "guardian", "caster", "public/assets/ip-v13/crops/heroes/heroes-r05-c04.png", "ice"),
    ("guardian-wind", "guardian", "ranged", "public/assets/ip-v13/crops/heroes/heroes-r05-c01.png", "wind"),
    ("guardian-stone", "guardian", "tank", "public/assets/ip-v13/crops/heroes/heroes-r06-c05.png", "earth"),
    ("guardian-bell", "guardian", "support", "public/assets/ip-v13/crops/heroes/heroes-r06-c03.png", "gold"),
    ("guardian-thunder", "guardian", "melee", "public/assets/ip-v13/crops/heroes/heroes-r03-c04.png", "lightning"),
    ("monster-imp", "monster", "ranged", "public/assets/ip-v13/crops/monsters/monsters-r01-c01.png", "poison"),
    ("monster-runner", "monster", "melee", "public/assets/ip-v13/crops/monsters/monsters-r03-c06.png", "shadow"),
    ("monster-brute", "monster", "tank", "public/assets/ip-v13/crops/monsters/monsters-r04-c03.png", "earth"),
    ("monster-shaman", "monster", "caster", "public/assets/ip-v13/crops/monsters/monsters-r02-c03.png", "spirit"),
    ("monster-ghost", "monster", "caster", "public/assets/ip-v13/crops/monsters/monsters-r01-c07.png", "ice"),
    ("monster-skeleton", "monster", "melee", "public/assets/ip-v13/crops/monsters/monsters-r02-c02.png", "bone"),
    ("monster-crow", "monster", "ranged", "public/assets/ip-v13/crops/monsters/monsters-r04-c06.png", "shadow"),
    ("boss-tiger", "boss", "roar", "public/assets/ip-v13/crops/bosses/bosses-r05-c01.png", "lightning"),
    ("boss-serpent", "boss", "caster", "public/assets/ip-v13/crops/bosses/bosses-r05-c03.png", "spirit"),
    ("boss-king", "boss", "controller", "public/assets/ip-v13/crops/bosses/bosses-r05-c04.png", "shadow"),
]
CITADEL_SOURCE = "public/assets/ip-v10/presentation/objects/object_dokkaebi_shrine.png"
CITADEL_STATES = ["stable", "shielded", "cracked", "critical"]

PALETTES = {
    "warm": (255, 176, 74), "cool": (89, 191, 255), "gold": (255, 208, 96),
    "spirit": (180, 104, 255), "fire": (255, 92, 42), "ice": (104, 220, 255),
    "wind": (114, 245, 171), "earth": (193, 155, 93), "lightning": (255, 231, 95),
    "poison": (128, 234, 93), "shadow": (151, 91, 226), "bone": (230, 217, 184),
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def check_manifest() -> int:
    if not MANIFEST_PATH.is_file():
        print(f"FAIL missing manifest: {relative(MANIFEST_PATH)}")
        return 1
    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"FAIL invalid manifest: {exc}")
        return 1
    if manifest.get("version") != VERSION or manifest.get("build") != BUILD:
        print("FAIL manifest identity mismatch")
        return 1
    entries = manifest.get("entries", [])
    expected = len(CHARACTERS) + len(CITADEL_STATES)
    if len(entries) != expected:
        print(f"FAIL expected {expected} entries, found {len(entries)}")
        return 1
    failures = []
    output_count = 0
    for entry in entries:
        for tier, meta in entry.get("outputs", {}).items():
            output_count += 1
            path = ROOT / meta.get("path", "")
            if not path.is_file():
                failures.append(f"missing {meta.get('path')}")
                continue
            if path.stat().st_size != meta.get("bytes"):
                failures.append(f"size {meta.get('path')}")
            elif sha256(path) != meta.get("sha256"):
                failures.append(f"sha256 {meta.get('path')}")
            if meta.get("size") != SIZES.get(tier):
                failures.append(f"tier size {entry.get('id')}:{tier}")
    if not BOARD_PATH.is_file():
        failures.append(f"missing {relative(BOARD_PATH)}")
    if failures:
        print("FAIL v1.0.14 visual polish verification")
        for failure in failures[:20]:
            print(" -", failure)
        return 1
    print(f"PASS v1.0.14 mega art polish assets ({len(entries)} entries / {output_count} tier files)")
    return 0


def generate() -> int:
    try:
        from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter
    except Exception as exc:
        print("Pillow is required only for asset generation. Run `python -m pip install Pillow`.", file=sys.stderr)
        print(exc, file=sys.stderr)
        return 2

    PUBLIC_ROOT.mkdir(parents=True, exist_ok=True)
    (PUBLIC_ROOT / "characters").mkdir(parents=True, exist_ok=True)
    (PUBLIC_ROOT / "citadel").mkdir(parents=True, exist_ok=True)
    BOARD_PATH.parent.mkdir(parents=True, exist_ok=True)

    def alpha_bbox(image):
        alpha = image.getchannel("A")
        # Ignore nearly transparent compression residue.
        mask = alpha.point(lambda value: 255 if value >= 6 else 0)
        return mask.getbbox()

    def bleed_rgb(image):
        # Fill one-pixel transparent edge with neighbouring colour to avoid dark halos.
        alpha = image.getchannel("A")
        dilated = alpha.filter(ImageFilter.MaxFilter(3))
        edge = ImageChops.subtract(dilated, alpha)
        rgb = image.convert("RGB").filter(ImageFilter.MaxFilter(3))
        halo = Image.new("RGBA", image.size, (0, 0, 0, 0))
        halo.paste(rgb, mask=edge)
        return Image.alpha_composite(halo, image)

    def fit_character(source, size, category, accent):
        image = Image.open(source).convert("RGBA")
        bbox = alpha_bbox(image)
        if bbox:
            image = image.crop(bbox)
        image = ImageEnhance.Color(image).enhance(1.055)
        image = ImageEnhance.Contrast(image).enhance(1.035)
        image = ImageEnhance.Sharpness(image).enhance(1.18)
        image = bleed_rgb(image)

        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        if category == "boss":
            max_w, max_h, foot_y = .88, .84, .925
            glow_strength = 34
        elif category == "hero":
            max_w, max_h, foot_y = .79, .81, .92
            glow_strength = 25
        elif category == "guardian":
            max_w, max_h, foot_y = .78, .80, .92
            glow_strength = 23
        else:
            max_w, max_h, foot_y = .76, .77, .91
            glow_strength = 18
        ratio = min(size * max_w / image.width, size * max_h / image.height)
        new_size = (max(1, round(image.width * ratio)), max(1, round(image.height * ratio)))
        image = image.resize(new_size, Image.Resampling.LANCZOS)
        x = (size - image.width) // 2
        y = round(size * foot_y - image.height)

        # Soft contact shadow and controlled category rim improve grounding and silhouette.
        shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        shadow_w = int(image.width * (.50 if category == "boss" else .44))
        shadow_h = max(5, int(size * (.038 if category == "boss" else .030)))
        shadow_y = min(size - shadow_h - 2, round(size * foot_y - shadow_h * .45))
        sd.ellipse((size // 2 - shadow_w // 2, shadow_y, size // 2 + shadow_w // 2, shadow_y + shadow_h), fill=(5, 7, 16, 118))
        shadow = shadow.filter(ImageFilter.GaussianBlur(max(2, size // 80)))
        canvas = Image.alpha_composite(canvas, shadow)

        alpha = Image.new("L", canvas.size, 0)
        alpha.paste(image.getchannel("A"), (x, y))
        glow_alpha = alpha.filter(ImageFilter.GaussianBlur(max(2, size // 110)))
        glow_alpha = glow_alpha.point(lambda value: min(glow_strength, round(value * glow_strength / 255)))
        glow = Image.new("RGBA", canvas.size, (*accent, 0))
        glow.putalpha(glow_alpha)
        canvas = Image.alpha_composite(canvas, glow)
        canvas.alpha_composite(image, (x, y))
        return canvas

    def citadel_base(size):
        source = ROOT / CITADEL_SOURCE
        image = Image.open(source).convert("RGBA")
        bbox = alpha_bbox(image)
        if bbox:
            image = image.crop(bbox)
        image = ImageEnhance.Color(image).enhance(1.08)
        image = ImageEnhance.Contrast(image).enhance(1.05)
        image = ImageEnhance.Sharpness(image).enhance(1.22)
        ratio = min(size * .82 / image.width, size * .84 / image.height)
        image = image.resize((round(image.width * ratio), round(image.height * ratio)), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        x = (size - image.width) // 2
        y = round(size * .92 - image.height)
        shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.ellipse((int(size*.27), int(size*.875), int(size*.73), int(size*.94)), fill=(3,5,13,135))
        shadow = shadow.filter(ImageFilter.GaussianBlur(max(3, size//70)))
        canvas = Image.alpha_composite(canvas, shadow)
        alpha = Image.new("L", canvas.size, 0)
        alpha.paste(image.getchannel("A"), (x, y))
        glow_alpha = alpha.filter(ImageFilter.GaussianBlur(max(3, size//90))).point(lambda v: min(44, v//5))
        glow = Image.new("RGBA", canvas.size, (58, 180, 255, 0)); glow.putalpha(glow_alpha)
        canvas = Image.alpha_composite(canvas, glow)
        canvas.alpha_composite(image, (x, y))
        return canvas, alpha

    def apply_citadel_state(base, mask, state, size):
        image = base.copy()
        if state == "stable":
            return image
        if state == "shielded":
            aura = Image.new("RGBA", image.size, (0,0,0,0))
            draw = ImageDraw.Draw(aura)
            box = (int(size*.19), int(size*.15), int(size*.81), int(size*.92))
            draw.ellipse(box, outline=(100,225,255,115), width=max(2,size//80))
            draw.ellipse((box[0]+size//45, box[1]+size//45, box[2]-size//45, box[3]-size//45), outline=(190,248,255,55), width=max(1,size//120))
            aura = aura.filter(ImageFilter.GaussianBlur(max(1,size//180)))
            image = Image.alpha_composite(image, aura)
            return image
        overlay = Image.new("RGBA", image.size, (0,0,0,0))
        draw = ImageDraw.Draw(overlay)
        cracks = [
            [(0.49,.31),(.46,.39),(.50,.45),(.45,.53),(.47,.61)],
            [(0.61,.43),(.57,.49),(.61,.55),(.57,.63),(.59,.71)],
            [(0.38,.49),(.42,.54),(.39,.60),(.43,.67)],
        ]
        if state == "critical":
            cracks.append([(.54,.58),(.50,.65),(.53,.72),(.47,.79)])
        width = max(2, size//128)
        for points in cracks:
            pts=[(int(x*size),int(y*size)) for x,y in points]
            draw.line(pts, fill=(42,12,60,225), width=width*2, joint="curve")
            draw.line(pts, fill=((220,116,255,245) if state=="critical" else (255,181,98,235)), width=width, joint="curve")
        overlay.putalpha(ImageChops.multiply(overlay.getchannel("A"), mask))
        image = Image.alpha_composite(image, overlay)
        if state == "critical":
            haze = Image.new("RGBA", image.size, (0,0,0,0))
            hd = ImageDraw.Draw(haze)
            for cx,cy,r in [(0.34,.76,.11),(.66,.75,.12),(.50,.63,.15)]:
                hd.ellipse((int((cx-r)*size),int((cy-r)*size),int((cx+r)*size),int((cy+r)*size)), fill=(180,42,255,62))
            haze = haze.filter(ImageFilter.GaussianBlur(max(6,size//30)))
            image = Image.alpha_composite(image, haze)
            image = ImageEnhance.Brightness(image).enhance(.92)
        else:
            image = ImageEnhance.Color(image).enhance(.88)
        return image

    entries = []
    board_tiles = []
    for asset_id, category, profile, source_rel, palette_key in CHARACTERS:
        source = ROOT / source_rel
        outputs = {}
        accent = PALETTES[palette_key]
        high_preview = None
        for tier, size in SIZES.items():
            result = fit_character(source, size, category, accent)
            output = PUBLIC_ROOT / "characters" / f"{asset_id}-{tier}-v114.webp"
            result.save(output, "WEBP", lossless=False, quality=92 if tier == "high" else 88, method=4, exact=True)
            outputs[tier] = {"path": relative(output), "size": size, "bytes": output.stat().st_size, "sha256": sha256(output)}
            if tier == "high": high_preview = result
        entries.append({
            "id": asset_id, "kind": "character", "category": category, "actionProfile": profile,
            "source": source_rel, "palette": palette_key, "anchor": [0.5, 0.08], "outputs": outputs,
            "productionApproved": True, "runtimeApproved": True,
        })
        board_tiles.append((asset_id, high_preview))

    for state in CITADEL_STATES:
        outputs = {}
        high_preview = None
        for tier, size in SIZES.items():
            base, mask = citadel_base(size)
            result = apply_citadel_state(base, mask, state, size)
            output = PUBLIC_ROOT / "citadel" / f"guardian-citadel-{state}-{tier}-v114.webp"
            result.save(output, "WEBP", lossless=False, quality=93 if tier == "high" else 89, method=4, exact=True)
            outputs[tier] = {"path": relative(output), "size": size, "bytes": output.stat().st_size, "sha256": sha256(output)}
            if tier == "high": high_preview = result
        entries.append({
            "id": f"guardian-citadel-{state}", "kind": "citadel", "state": state,
            "source": CITADEL_SOURCE, "anchor": [0.5, 0.06], "outputs": outputs,
            "productionApproved": True, "runtimeApproved": True,
        })
        board_tiles.append((f"citadel {state}", high_preview))

    manifest = {
        "version": VERSION, "build": BUILD, "id": "DD-MEGA-ART-POLISH-V114",
        "description": "Approved static combat art normalization, grounding, silhouette and guardian citadel state set.",
        "directionsPolicy": "Approved static art remains unmirrored until independently authored directional production sheets pass review.",
        "entries": entries,
        "summary": {
            "characters": len(CHARACTERS), "citadelStates": len(CITADEL_STATES),
            "tierFiles": len(entries) * len(SIZES), "tiers": list(SIZES),
        }
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Production review board (not used at runtime).
    tile_w, tile_h = 240, 274
    cols = 5
    rows = (len(board_tiles) + cols - 1) // cols
    board = Image.new("RGB", (tile_w*cols, tile_h*rows + 72), (15,18,29))
    bd = ImageDraw.Draw(board)
    bd.text((18,18), "Dokkaebi Luck Defense 3D - v1.0.14 Mega Art Polish", fill=(248,221,151))
    bd.text((18,43), "21 combat characters + 4 guardian citadel states / runtime review board", fill=(163,190,222))
    for index,(label,preview) in enumerate(board_tiles):
        x=(index%cols)*tile_w; y=72+(index//cols)*tile_h
        bd.rectangle((x,y,x+tile_w-1,y+tile_h-1), outline=(62,71,94), width=1)
        pv=preview.resize((220,220),Image.Resampling.LANCZOS)
        board.paste(pv.convert("RGB"), (x+10,y+8), pv.getchannel("A"))
        bd.text((x+10,y+238), label, fill=(235,238,247))
    board.save(BOARD_PATH, "PNG", optimize=True)
    print(f"Generated {len(entries)} v1.0.14 art entries and review board")
    return check_manifest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    return check_manifest() if args.check else generate()


if __name__ == "__main__":
    raise SystemExit(main())
