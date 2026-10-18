#!/usr/bin/env python3
"""Run on every committed model change. GitHub runner doesn't need public Google Drive access."""
import hashlib,json,pathlib,struct
root=pathlib.Path('public/assets/characters')
expected=['medieval','witch','scifi','soldier']
manifest=json.loads(pathlib.Path('docs/QUATERNIUS_IMPORT.json').read_text())
assert sorted(x['name'] for x in manifest)==sorted(expected)
for name in expected:
 path=root/(name+'.glb')
 raw=path.read_bytes()
 if raw[:4]!=b'glTF' or struct.unpack_from('<I',raw,4)[0]!=2 or struct.unpack_from('<I',raw,8)[0]!=len(raw):
  raise ValueError(name+' malformed GLB header')
 length,kind=struct.unpack_from('<I4s',raw,12)
 if kind!=b'JSON' or 20+length>len(raw):raise ValueError(name+' no JSON')
 obj=json.loads(raw[20:20+length])
 if len(obj.get('animations',[]))!=24:raise ValueError(name+' must have 24 clips')
 if not obj.get('skins') or not obj.get('meshes'):raise ValueError(name+' not skinned')
 clips={x.get('name') for x in obj['animations']}
 for clip in ['Run','Run_Shoot','Idle','Gun_Shoot','Sword_Slash','Punch_Left','Death']:
  if clip not in clips:raise ValueError(name+' missing clip '+clip)
 print('OK',name,len(raw),'bytes /',len(obj['animations']),'clips /',len(obj['meshes']),'meshes / SHA256',hashlib.sha256(raw).hexdigest())
print('All four female animated GLBs verified. Art-direction and browser QA remain separate.')
