"""Palette-grade actual isometric ground texture sheets, never fake overlays.
Source sheets are Fiefdom raster WebP. Normal maps and terrain indexes stay
untouched to preserve movement, saved map semantics and lighting normals.
"""
from pathlib import Path
from PIL import Image, ImageStat

# (red gain, green gain, blue gain, brightness lift) -- restrained 5-18% grading
GRADES={
    "grass":      ((0.99,1.13,1.02),(2,5,2)),
    "grass_dark": ((1.05,1.19,1.09),(3,9,4)),
    "scrub":      ((0.92,1.15,0.96),(1,3,2)),
    "sand":       ((1.01,1.03,1.11),(0,1,2)),
    "marsh":      ((0.95,1.11,1.13),(0,2,2)),
    "water":      ((0.80,1.06,1.20),(2,4,8)),
}
def upgrade(sheet:Path, gains, lifts):
    with Image.open(sheet) as source:
        mode=source.mode
        img=source.convert("RGBA")
    old_a=img.getchannel("A")
    before=ImageStat.Stat(img.convert("RGB")).mean
    layers=img.split()
    out=[]
    for k in range(3):
        gain=gains[k]
        lift=lifts[k]
        # Gamma-like shadow lift preserves terrain blade/shimmer microtexture.
        table=[min(255,max(0,round((value/255)**0.96*255*gain+lift))) for value in range(256)]
        out.append(layers[k].point(table))
    recoloured=Image.merge("RGBA",(*out,old_a))
    after=ImageStat.Stat(recoloured.convert("RGB")).mean
    assert abs(after[1]-before[1])>1.0,(sheet,before,after)
    assert recoloured.getchannel("A").tobytes()==old_a.tobytes()
    assert recoloured.size==img.size
    # Lossless output so no new muddy/blocky artefacts from generation loss.
    recoloured.save(sheet,format="WEBP",lossless=True,method=5,exact=True)
    with Image.open(sheet) as check:
        assert check.size==img.size and check.getchannel("A").tobytes()==old_a.tobytes()
    print(f"PASS terrain {sheet.stem}: rgb {tuple(round(n,1) for n in before)} -> {tuple(round(n,1) for n in after)}")
def run(folder:Path):
    assert folder.is_dir()
    for name,(gains,lifts) in GRADES.items():
        sheet=folder/f"{name}_col.webp"
        assert sheet.is_file(),sheet
        upgrade(sheet,gains,lifts)
    for name in GRADES:
        assert (folder/f"{name}_nrm.webp").is_file()
    print(f"PASS: {len(GRADES)} real ground colour atlases graded; normals and game terrain IDs untouched")
if __name__=="__main__":
    import sys
    run(Path(sys.argv[1] if len(sys.argv)>1 else "engines/fiefdom/public/assets/ground"))
