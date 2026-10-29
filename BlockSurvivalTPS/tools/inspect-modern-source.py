#!/usr/bin/env python3
"""© 2026 곰같은여우. Inspect pinned Kenney CC0 archive; never ship SVG."""
import hashlib, io, json, os, pathlib, urllib.request, zipfile
SOURCES=[
 ("kenney-official","https://kenney.nl/media/pages/assets/animated-characters-survivors/27b16052a7-1774772958/kenney_animated-characters-survivors.zip"),
 ("opengameart-kenney-author","https://opengameart.org/sites/default/files/kenney_animated-characters-1.zip"),
]
out=pathlib.Path(os.environ.get("TPS_ASSET_STAGE","/tmp/tps-modern-source"))
out.mkdir(parents=True,exist_ok=True)
errors=[]
for source,URL in SOURCES:
 try:
  req=urllib.request.Request(URL,headers={"User-Agent":"Mozilla/5.0","Accept":"application/zip,application/octet-stream,*/*"})
  with urllib.request.urlopen(req,timeout=30) as resp:
   raw=resp.read(5_000_000)
   mime=resp.headers.get("Content-Type","")
  if not zipfile.is_zipfile(io.BytesIO(raw)):
   raise ValueError("not ZIP; header="+repr(raw[:100])+" MIME="+mime)
  break
 except Exception as exc:
  errors.append(source+": "+str(exc))
else:
 raise RuntimeError("No trustworthy Kenney ZIP obtainable: "+repr(errors))
sha=hashlib.sha256(raw).hexdigest()
records=[]
with zipfile.ZipFile(io.BytesIO(raw)) as z:
 for item in z.infolist():
  if item.is_dir():continue
  suffix=pathlib.PurePosixPath(item.filename).suffix.lower()
  if item.file_size>3_000_000:raise ValueError("Unexpected file size "+item.filename)
  records.append({"path":item.filename,"size":item.file_size,"extension":suffix})
  if suffix not in (".fbx",".png",".txt"):continue
  p=out/pathlib.PurePosixPath(item.filename)
  if ".." in p.parts:raise ValueError("Unsafe archive path")
  p.parent.mkdir(parents=True,exist_ok=True)
  p.write_bytes(z.read(item))
print(json.dumps({"source":URL,"sourceLabel":source,"attemptErrors":errors,"bytes":len(raw),"sha256":sha,"files":records},ensure_ascii=False,indent=2))
(out/"SOURCE_MANIFEST.json").write_text(json.dumps({"source":URL,"sourceLabel":source,"attemptErrors":errors,"bytes":len(raw),"sha256":sha,"files":records},indent=2)+"\n")
