"""Rani Kingdom v5.27 real raster app/shortcut images (SVG strictly forbidden).
Source: independently generated crown-and-castle WebP, NOT cropped UI at runtime.
Run after Pillow install and before Vite dist build.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw
import sys
root=Path(__file__).resolve().parent.parent
source=root/'assets/branding/rani-kingdom-app-icon.webp'
dest=Path(sys.argv[1] if len(sys.argv)>1 else 'engines/fiefdom/public/rani')/'icons'
assert source.is_file() and source.stat().st_size>2000, 'Missing new original Rani icon'
with Image.open(source) as check:
    assert check.format=='WEBP' and check.size[0]>=128 and check.size[0]==check.size[1], 'Invalid original icon'
    artwork=check.convert('RGB')
dest.mkdir(parents=True,exist_ok=True)
def art(size):
    return artwork.resize((size,size),Image.Resampling.LANCZOS).filter(ImageFilter.UnsharpMask(radius=.65,percent=78,threshold=2))
for size in (32,64,192,512):
    art(size).save(dest/f'icon-{size}.png',format='PNG',optimize=True)
art(180).save(dest/'apple-touch-icon.png',format='PNG',optimize=True)
# Android adaptive safe area: center the fully intact icon within 76.6%
# of a square blue shield, preventing Android launchers from cropping the crown/title.
mask=Image.new('RGB',(512,512),(13,33,52))
tile=art(392)
mask.paste(tile,((512-392)//2,(512-392)//2))
mask.save(dest/'icon-maskable-512.png',format='PNG',optimize=True)
art(256).save(dest/'favicon.ico',format='ICO',sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
for name in ('icon-32.png','icon-64.png','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','favicon.ico'):
    assert (dest/name).stat().st_size>1000, 'Bad app icon '+name
print('PASS v5.27 real PWA and desktop shortcut raster icons: '+str(dest))
