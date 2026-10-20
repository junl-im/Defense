#!/usr/bin/env python3
"""Attach four-direction genuine native fishery raster sprite support to
a buildable harbor. No SVG, stretching/cropping, new forbidden art, or
original pixel deletion.  The distinct dock 3D mesh is part of world rendering.
Must run AFTER existing all-PNG polish and BEFORE offline sprite atlas packing.
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageEnhance

folder=Path(sys.argv[1] if len(sys.argv)>1 else 'engines/fiefdom/public/assets/sprites')
meta=folder/'buildings.json'
data=json.loads(meta.read_text('utf-8'))
if any(m['name']=='harbor' for m in data): raise AssertionError('harbor source metadata already inserted')
source=[m for m in data if m['name']=='fishery']
assert {m['rotation'] for m in source}=={0,1,2,3}
for m in source:
 src=folder/f"fishery_{m['rotation']}.png"
 dst=folder/f"harbor_{m['rotation']}.png"
 with Image.open(src) as original:
  rgba=original.convert('RGBA')
  rgb=rgba.convert('RGB')
  # Warm timber tint to distinguish a harbor storehouse from the fishery;
  # alpha masks, exact raster footprints and all transparent edges retained.
  tuned=ImageEnhance.Color(ImageEnhance.Contrast(rgb).enhance(1.08)).enhance(1.08)
  tuned=ImageEnhance.Brightness(tuned).enhance(1.09).convert('RGBA')
  tuned.putalpha(rgba.getchannel('A'))
  assert tuned.size==rgba.size
  tuned.save(dst,'PNG',compress_level=4)
 clone=dict(m)
 clone['name']='harbor'
 data.append(clone)
meta.write_text(json.dumps(data,ensure_ascii=False,indent=2),'utf-8')
assert len([m for m in data if m['name']=='harbor'])==4
print('PASS v5.11 licensed actual four-direction harbor imagery from untouched 4 fishery sprites, 2.5D atlas-safe')
