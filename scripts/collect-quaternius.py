#!/usr/bin/env python3
"""Convert official CC0 Quaternius single-buffer glTF to real animation-preserving GLB.
Pinned byte hashes. Assets for prototype review, NOT claimed as art-direction-final.
Original: https://quaternius.com/packs/ultimatemodularwomen.html
"""
import base64,hashlib,json,pathlib,struct,tempfile
import gdown
SOURCES={
 "medieval":("17xT8FvSs2oGKVg28vRFf_8nwsM5nF2bG","32c3cd6d4e59bd1f433bc5eeca788b1430399ef15dfd2e0fb4a038a967c0c293"),
 "witch":("1fGbeo6SdjB9EWVSNKKOxoNKdmnK8hy3d","d886c8c134a92b2013529edf7352e286ef386ca7c0f5fa3a568039d7c11b05fe"),
 "scifi":("1xFu_hDnGu-U7HE3mfT0HbmPb-s2OuJGQ","86bcb11a1bc18c744a23abe5e7bd4cc95e636ba1f405cecdbd5a0e2f7214b802"),
 "soldier":("13dP4UB24dlrzrOkCL2xQ2mlNO1T31bWP","37112e60af92ff84d882a34e21f0f78a2afc14282e950fb0e3652e51d06e0b2d"),
}
OUT=pathlib.Path('public/assets/characters');OUT.mkdir(parents=True,exist_ok=True)
report=[]
def glb_from_gltf(file_data):
 obj=json.loads(file_data)
 if obj['asset'].get('version')!='2.0' or len(obj.get('buffers',[]))!=1:raise RuntimeError('Unsupported glTF layout')
 entry=obj['buffers'][0];uri=entry.get('uri','')
 if not uri.startswith('data:application/octet-stream;base64,'):raise RuntimeError('External texture or buffer dependency')
 binary=base64.b64decode(uri.split(',',1)[1],validate=True)
 if len(binary)!=entry['byteLength']:raise RuntimeError('Embedded buffer length mismatch')
 del entry['uri']
 if len(obj.get('animations',[]))!=24:raise RuntimeError('Missing 24 native animation clips')
 if not obj.get('skins') or not obj.get('meshes'):raise RuntimeError('Missing skinned model')
 encoded=json.dumps(obj,ensure_ascii=False,separators=(',',':')).encode('utf-8')
 encoded+=b' '*((-len(encoded))%4);binary+=bytes((-len(binary))%4)
 total=12+8+len(encoded)+8+len(binary)
 return struct.pack('<4sII',b'glTF',2,total)+struct.pack('<I4s',len(encoded),b'JSON')+encoded+struct.pack('<I4s',len(binary),b'BIN\x00')+binary,len(obj['animations']),len(obj['meshes'])
with tempfile.TemporaryDirectory() as folder:
 for name,(source_id,expected) in SOURCES.items():
  target=pathlib.Path(folder)/(name+'.gltf')
  result=gdown.download(id=source_id,output=str(target),quiet=False)
  if not result or not target.is_file():raise RuntimeError('Download failed: '+name)
  original=target.read_bytes()
  sha=hashlib.sha256(original).hexdigest()
  if sha!=expected:raise RuntimeError(name+' SHA256 mismatch '+sha)
  glb,clips,meshes=glb_from_gltf(original)
  result=OUT/(name+'.glb');result.write_bytes(glb)
  report.append(dict(character=name,source_id=source_id,origin_sha256=sha,glb_sha256=hashlib.sha256(glb).hexdigest(),bytes=len(glb),animations=clips,meshes=meshes,license='CC0 as displayed on publisher page; publisher folder license text says Males (needs release check)',status='converted_prototype'))
pathlib.Path('docs/QUATERNIUS_IMPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Imported',len(report),'skinned female characters, each with 24 clips')
