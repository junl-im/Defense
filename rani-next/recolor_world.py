"""Recolour real four-angle Fiefdom fortress, town, and marketplace sprites.

No visual overlays: original game atlas PNGs and alpha/anchors are preserved.
Fiefdom original code/art AGPL-3.0-only; third-party art is not touched.
"""
import argparse
import json
from pathlib import Path
from PIL import Image

TARGETS = frozenset(('keep', 'gatehouse', 'gatehouse_shut', 'lookout_tower',
                     'round_tower', 'tower', 'wall', 'perimeter_turret',
                     'chapel', 'church', 'cathedral', 'shrine', 'market',
                     'barracks', 'armoury', 'well', 'inn', 'stables', 'hovel'))

def recolor(r,g,b,a):
    if not a:
        return r,g,b,a
    # Warm limestone turns into cool blue-white castle stone.
    # Keep dark iron, foliage, and strongly red heraldry untouched.
    if r > 65 and r >= g*1.07 and g >= b*1.10 and b>20 and r-b>23:
        return (min(255,int(r*.74+4)),
                min(255,int(g*.90+6)),
                min(255,int(b*1.32+15)),a)
    return r,g,b,a

def run(folder):
    items=json.loads((folder/'buildings.json').read_text())
    chosen=[x for x in items if x['name'] in TARGETS]
    assert {x['name'] for x in chosen} == TARGETS
    assert all({x['rotation'] for x in chosen if x['name']==name} == set(range(4))
               for name in TARGETS),'four camera directions required'
    transformed=0
    for meta in chosen:
        filename=folder/f"{meta['name']}_{meta['rotation']}.png"
        with Image.open(filename) as source:
            im=source.convert('RGBA')
        assert im.size == (meta['width'],meta['height']),filename
        old=list(im.getdata())
        new=[recolor(*pixel) for pixel in old]
        assert all(x[3]==y[3] for x,y in zip(old,new)), 'alpha mask changed'
        transformed+=sum(x!=y for x,y in zip(old,new))
        im.putdata(new)
        im.save(filename,format='PNG',optimize=True)
    assert len(chosen)==len(TARGETS)*4 and transformed>1000,(len(chosen),transformed)
    print(f'PASS: {len(chosen)} four-angle original world images recoloured; {transformed} pixels modified, placement anchors intact')

if __name__=='__main__':
    args=argparse.ArgumentParser()
    args.add_argument('folder',type=Path)
    ns=args.parse_args()
    run(ns.folder)
