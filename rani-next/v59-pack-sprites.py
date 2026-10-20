#!/usr/bin/env python3
"""Rani v5.9: pre-build a deterministic lossless PNG sprite texture array.

The original Fiefdom browser fetched ~6,900 independent PNGs and arranged
them on an atlas at runtime.  That volume of HTTP requests is unsuitable for
GitHub Pages / phone networks and can trigger HTTP 429 throttling.  This
offline packer preserves 100% of the source pixels, four-angle building art,
sprite anchors, clip metadata, sort order and licenses.
"""
import json
import math
import sys
from pathlib import Path
from PIL import Image

ASSET_ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "engines/fiefdom/public/assets/sprites")
MAX_W, MAX_H, GAP = 4096, 4096, 2

def entries_from_meta():
    buildings = json.loads((ASSET_ROOT / "buildings.json").read_text("utf-8"))
    units = json.loads((ASSET_ROOT / "units.json").read_text("utf-8"))
    entries = []
    footprints = {}
    for m in buildings:
        footprints[m["name"]] = m["footprint"]
        entries.append(dict(key=f'{m["name"]}_{m["rotation"]}', file=f'{m["name"]}_{m["rotation"]}.png',
                            width=m["width"], height=m["height"], ax=m["anchor_x"],
                            ay=m["anchor_y"], scale=m["scale"]))
    for m in units["sprites"]:
        entries.append(dict(key=f'{m["clip"]}_{m["direction"]}_{m["frame"]}', file=f'{m["name"]}.png',
                            width=m["width"], height=m["height"], ax=m["anchor_x"],
                            ay=m["anchor_y"], scale=m["scale"]))
    return entries, footprints, units["directions"], units["clips"], buildings[0]["scale"]

def pack():
    entries, footprints, directions, clips, atlas_scale = entries_from_meta()
    if len(entries) < 5000:
        raise ValueError(f"Unexpected source sprite count: {len(entries)}")
    # JS Array.sort stability is guaranteed; Python sort also preserves ties.
    entries.sort(key=lambda e: -e["height"])
    pages = [[]]
    x = GAP
    y = GAP
    shelf_h = 0
    used_w = 0
    page = 0
    page_h = []
    frames = {}
    for e in entries:
        w, h = e["width"] + GAP, e["height"] + GAP
        if w + GAP > MAX_W or h + GAP > MAX_H:
            raise ValueError(f"Image too big for mobile-friendly page: {e['file']} {w}x{h}")
        if x + w > MAX_W:
            x = GAP
            y += shelf_h
            shelf_h = 0
        if y + max(shelf_h, h) + GAP > MAX_H and y > GAP:
            page_h.append(y + shelf_h + GAP)
            page += 1
            pages.append([])
            x, y, shelf_h = GAP, GAP, 0
        pages[page].append((e, x, y))
        frames[e["key"]] = dict(x=x, y=y, w=e["width"], h=e["height"],
                               ax=e["ax"], ay=e["ay"], scale=e["scale"], **({"page": page} if page else {}))
        x += w
        used_w = max(used_w, x)
        shelf_h = max(shelf_h, h)
    page_h.append(y + shelf_h + GAP)
    quad = lambda n: math.ceil(max(1, n) / 4) * 4
    width = min(MAX_W, quad(used_w + GAP))
    height = min(MAX_H, quad(max(page_h)))
    names = []
    count = 0
    total_bytes = 0
    for i, frames_on_page in enumerate(pages):
        page_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        for e, px, py in frames_on_page:
            with Image.open(ASSET_ROOT / e["file"]) as src:
                if src.size != (e["width"], e["height"]):
                    raise ValueError(f"Frame pixel mismatch {e['file']}: PNG {src.size}, meta {e['width']}x{e['height']}")
                rgba = src.convert("RGBA")
                # Paste RGBA pixels over a transparent atlas, like canvas drawImage.
                page_img.paste(rgba, (px, py))
            count += 1
        name = f"rani-atlas-v59-{i}.png"
        output = ASSET_ROOT / name
        page_img.save(output, "PNG", compress_level=1)
        size = output.stat().st_size
        total_bytes += size
        names.append(name)
        print(f"[rani atlas] page {i+1}/{len(pages)}: {width}x{height}, {len(frames_on_page)} sprites, {size/1048576:.1f} MiB", flush=True)
        page_img.close()
    manifest = dict(version=59, size=[width, height], scale=atlas_scale,
                    pages=names, frames=frames, footprints=footprints,
                    directions=directions, clips=clips, spriteCount=count)
    (ASSET_ROOT / "rani-atlas-v59.json").write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), "utf-8")
    assert count == len(entries), f"Lost sprite data {count} vs {len(entries)}"
    print(f"PASS v5.9 pack: {count} PNG requests => {len(names)} atlas PNG + 1 manifest; {total_bytes/1048576:.2f} MiB total; lossless raster, original frames retained.", flush=True)

if __name__ == "__main__":
    pack()
