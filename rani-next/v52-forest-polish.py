"""Polish real 2.5D trees, bushes and rocks, all four orientations.

No new pseudo-3D primitives, no SVGs. Colour/detail enhancement is applied
only where pixels are sufficiently opaque: baked floor/contact shadows and
soft foliage fade remain untouched. Exact atlas anchors and alpha retained.
"""
import sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageChops

SPECIES={
 "oak": (1.08, 1.12, 1.025),
 "olive_tree": (1.085, 1.09, 1.02),
 "palm": (1.07, 1.095, 1.025),
 "bush": (1.09, 1.12, 1.025),
 "dead_tree": (1.07, 1.065, 1.025),
 "rock": (1.09, 1.035, 1.015),
}
def run(folder):
    assert folder.is_dir(),folder
    count=0
    for name,(contrast,saturation,brightness) in SPECIES.items():
        for facing in range(4):
            filename=folder / f"{name}_{facing}.png"
            assert filename.exists(),filename
            with Image.open(filename) as source:
                old=source.convert("RGBA")
            alpha=old.getchannel("A")
            rgb=old.convert("RGB")
            improved=ImageEnhance.Contrast(rgb).enhance(contrast)
            improved=ImageEnhance.Color(improved).enhance(saturation)
            improved=ImageEnhance.Brightness(improved).enhance(brightness)
            # Tree edges, shadow fades and transparent pixels keep their
            # original colours; opaque leaf/stone microtexture is enhanced.
            blend=alpha.point(lambda a:max(0,min(255,round((a-110)*255/125))))
            combined=Image.composite(improved,rgb,blend)
            assert ImageChops.difference(rgb,combined).getbbox() is not None,filename
            result=Image.merge("RGBA",(*combined.split(),alpha))
            assert result.size==old.size
            assert result.getchannel("A").tobytes()==alpha.tobytes()
            result.save(filename,format="PNG",optimize=True)
            with Image.open(filename) as restored:
                assert restored.convert("RGBA").getchannel("A").tobytes()==alpha.tobytes()
            count+=1
    assert count==24
    print(f"PASS forest detail: {count} authored native 2.5D PNGs, four directions, identical shadow masks and sprite anchors")

if __name__=="__main__":
    run(Path(sys.argv[1] if len(sys.argv)>1 else "engines/fiefdom/public/assets/sprites"))
