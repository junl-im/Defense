"""v5.2 enhance native four-angle isometric building raster art.
No screenshot crop, outlines, SVG, fake meshes, or game hitbox changes.

Polish high-opacity architectural pixels only: baked ground shadows and
cutout foliage alpha remain byte-identical. Keep all 4 facing directions.
"""
import sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageChops

BUILDINGS = {
    "keep": (1.085, 1.055, 1.065),
    "gatehouse": (1.072, 1.043, 1.05),
    "gatehouse_shut": (1.072, 1.043, 1.05),
    "lookout_tower": (1.082, 1.045, 1.05),
    "round_tower": (1.082, 1.045, 1.05),
    "tower": (1.074, 1.04, 1.045),
    "wall": (1.065, 1.035, 1.035),
    "perimeter_turret": (1.07, 1.045, 1.045),
    "chapel": (1.075, 1.045, 1.055),
    "church": (1.072, 1.045, 1.05),
    "cathedral": (1.08, 1.04, 1.055),
    "shrine": (1.07, 1.045, 1.045),
    "market": (1.085, 1.075, 1.06),
    "barracks": (1.075, 1.055, 1.06),
    "armoury": (1.07, 1.055, 1.055),
    "well": (1.065, 1.045, 1.04),
    "inn": (1.08, 1.055, 1.055),
    "stables": (1.07, 1.055, 1.055),
    "hovel": (1.065, 1.06, 1.05),
}

def polish(image: Path, settings):
    with Image.open(image) as source:
        original = source.convert("RGBA")
    r, g, b, a = original.split()
    rgb = Image.merge("RGB", (r, g, b))
    contrast, saturation, brightness = settings
    upgraded = ImageEnhance.Contrast(rgb).enhance(contrast)
    upgraded = ImageEnhance.Color(upgraded).enhance(saturation)
    upgraded = ImageEnhance.Brightness(upgraded).enhance(brightness)

    # Most premultiplied-looking soft contact shadows have low opacity. We
    # blend from 0 enhancement at alpha<=125 to full at alpha>=235.
    mask = a.point(lambda value: min(255, max(0, round((value - 125) * (255 / 110)))))
    revised = Image.composite(upgraded, rgb, mask)
    updated = Image.merge("RGBA", (*revised.split(), a))
    assert updated.size == original.size
    assert updated.getchannel("A").tobytes() == a.tobytes()
    assert ImageChops.difference(revised, rgb).getbbox() is not None, image
    updated.save(image, format="PNG", optimize=True)
    with Image.open(image) as check:
        assert check.convert("RGBA").getchannel("A").tobytes() == a.tobytes()
        assert check.size == original.size
    return image.stat().st_size

def main(folder: Path):
    assert folder.is_dir()
    count = 0
    total = 0
    for name, settings in BUILDINGS.items():
        for facing in range(4):
            image = folder / f"{name}_{facing}.png"
            assert image.is_file(), image
            total += polish(image, settings)
            count += 1
    assert count == 76
    print(f"PASS royal 2.5D real buildings: {count} direction-specific PNG sprites, original masks/anchors retained, {total} bytes")
if __name__ == "__main__":
    main(Path(sys.argv[1] if len(sys.argv)>1 else "engines/fiefdom/public/assets/sprites"))
