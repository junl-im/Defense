#!/usr/bin/env python3
"""Reproducible CC0 original -> reviewed-format prototype art conversion.
Only official source packages with pinned hashes. No proprietary art.
Targets are functional previews, not final illustration approvals.
"""
import hashlib, io, json, os, pathlib, urllib.request, zipfile
import trimesh
from PIL import Image

SOURCES={
 "anime":("https://opengameart.org/sites/default/files/gal.zip","4c9fd45357c2eb168204f1ac1c2178b3de216ada6f2477005fcf89513549c52c"),
 "town":("https://opengameart.org/sites/default/files/kenney_fantasy-town-kit_2.0.zip","1a7530c09f4d2fa2cdee259876f089334f8b1f27fa86a0c4f54ef86cdd8676ef"),
}
ART=pathlib.Path("public/assets/approved")
ENV=pathlib.Path("public/assets/environment")
ART.mkdir(parents=True,exist_ok=True)
ENV.mkdir(parents=True,exist_ok=True)
REPORT=[]
def fetch_archive(key):
 url,expected=SOURCES[key]
 req=urllib.request.Request(url,headers={"User-Agent":"Defense-WebGame-Asset-Collector/0.2"})
 with urllib.request.urlopen(req,timeout=80) as response:
  data=response.read(30_000_000)
 checksum=hashlib.sha256(data).hexdigest()
 if checksum!=expected: raise RuntimeError(f"Original {key} SHA256 mismatch {checksum} vs {expected}")
 z=zipfile.ZipFile(io.BytesIO(data))
 if z.testzip(): raise RuntimeError(f"Original {key} corrupt ZIP member")
 REPORT.append({"id":key,"source":url,"sha256":checksum,"zip_entries":len(z.namelist()),"status":"checked"})
 return z

with fetch_archive("anime") as a:
 # OBJ + MTL + texture is a 256-triangle CC0 distant-follower model.
 # Temporarily extract to isolated /tmp, convert with embedded texture to Y-up GLB.
 import tempfile
 with tempfile.TemporaryDirectory() as work:
  for n in ["lowpolyGirl/low_poly_girl.obj","lowpolyGirl/low_poly_girl.mtl","lowpolyGirl/texAtlas.png"]:
   out=pathlib.Path(work)/n
   out.parent.mkdir(parents=True,exist_ok=True)
   out.write_bytes(a.read(n))
  scene=trimesh.load(str(pathlib.Path(work)/"lowpolyGirl/low_poly_girl.obj"),force="scene",process=False)
  lo,hi=scene.bounds
  height=hi[1]-lo[1]
  if height<=0: raise RuntimeError("Bad female model height")
  scale=2.35/height
  import numpy as np
  transform=np.eye(4)
  transform[0,0]=transform[1,1]=transform[2,2]=scale
  transform[:3,3]=[-(lo[0]+hi[0])*scale/2,-lo[1]*scale,-(lo[2]+hi[2])*scale/2]
  scene.apply_transform(transform)
  out=ART/"hero.glb"
  out.write_bytes(scene.export(file_type="glb"))
  check=trimesh.load(str(out),force="scene")
  if len(check.geometry)<1 or out.stat().st_size<2000: raise RuntimeError("Invalid converted hero GLB")
  REPORT.append({"id":"hero.glb","origin":"CC0 OpenGameArt low poly anime girl","bytes":out.stat().st_size,"sha256":hashlib.sha256(out.read_bytes()).hexdigest(),"triangles":sum(len(x.faces) for x in check.geometry.values()),"status":"prototype-model-not-final-visual"})
with fetch_archive("town") as a:
 models=[
 "wall-block","wall","wall-broken","wall-arch","wall-half","pillar-stone",
 "tree","tree-high","rock-large","rock-wide","road","banner-red",
 "banner-green","stairs-stone","lantern","wall-doorway-square"
 ]
 for name in models:
  raw=a.read(f"Models/GLB format/{name}.glb")
  # glTF 2.0 binary magic: glTF. No SVG included.
  if raw[:4]!=b"glTF":raise RuntimeError(f"{name} GLB header missing")
  out=ENV/(name+".glb")
  out.write_bytes(raw)
  check=trimesh.load(str(out),force="scene")
  if len(check.geometry)<1:raise RuntimeError(f"No geometry for {name}")
  REPORT.append({"id":name+".glb","origin":"Kenney Fantasy Town Kit v2.0 CC0","bytes":len(raw),"sha256":hashlib.sha256(raw).hexdigest(),"status":"original-glb-verified"})
pathlib.Path("docs").mkdir(exist_ok=True)
pathlib.Path("docs/INTEGRATED_ASSETS.json").write_text(json.dumps(REPORT,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("ART CONVERSION",len(REPORT),"items; licensed source checksums pinned.")
