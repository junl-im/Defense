#!/usr/bin/env python3
"""Rani v5.15 low-memory mobile sprite atlas from the SAME licensed source art.

Do not alter the full-resolution desktop pack, frame IDs, or world-size:
sprite atlas positions, anchors AND pixels-per-world-unit scale together.
"""
import json
import sys
from pathlib import Path
from PIL import Image

source = Path(sys.argv[1] if len(sys.argv)>1 else 'engines/fiefdom/public/assets/sprites')
full_path=source/'rani-atlas-v59.json'
original=json.loads(full_path.read_text(encoding='utf-8'))
assert original['version']==59 and original['spriteCount']>=5000
assert len(original['pages'])>0
factor=2
w,h=original['size']
assert w%2==0 and h%2==0, 'Atlas dimensions must support exact half-size mip'
names=[]
total=0
for page,filename in enumerate(original['pages']):
    destination=f'rani-atlas-mobile-v515-{page}.png'
    with Image.open(source/filename) as image:
        assert image.size==(w,h),(filename,image.size)
        # Downscale entire original atlas, NOT independent frames. The UV/anchor
        # coordinates are rescaled identically so rotations/world-size stay intact.
        with image.convert('RGBA').resize((w//2,h//2),Image.Resampling.LANCZOS) as small:
            small.save(source/destination,'PNG',compress_level=6,optimize=False)
    byte_count=(source/destination).stat().st_size
    total+=byte_count
    names.append(destination)
    print(f'[mobile atlas] {page+1}/{len(original["pages"])} {w//2}x{h//2} {byte_count/1048576:.2f}MiB',flush=True)
mobile=dict(original)
mobile['version']=515
mobile['size']=[w//2,h//2]
mobile['scale']=original['scale']/factor
mobile['pages']=names
mobile['frames']={
    key:{**frame,**{field:frame[field]/factor for field in ('x','y','w','h','ax','ay','scale')}}
    for key,frame in original['frames'].items()
}
assert len(mobile['frames'])==len(original['frames'])
assert all(v['page']<len(names) for v in mobile['frames'].values() if 'page' in v)
output=source/'rani-atlas-mobile-v515.json'
output.write_text(json.dumps(mobile,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
assert total<30*1024*1024, f'Unexpected mobile payload {total}'
print(f'PASS v5.15 mobile atlas: {len(mobile["frames"])} identical frame keys, 4x less GPU bytes, {total/1048576:.1f} MiB image download',flush=True)
