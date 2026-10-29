"""© 2026 곰같은여우. Convert verified Kenney CC0 FBX+PNG into GLB, no vector assets."""
import bpy,sys,json,hashlib,os,pathlib
args=sys.argv[sys.argv.index('--')+1:]
source=pathlib.Path(args[0]);dest=pathlib.Path(args[1]);dest.mkdir(parents=True,exist_ok=True)
def describe(objects):
 return [{"name":o.name,"type":o.type,"polys":len(o.data.polygons) if o.type=='MESH' else 0,
 "bones":len(o.data.bones) if o.type=='ARMATURE' else 0} for o in objects]
def prepare():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for a in list(bpy.data.actions):bpy.data.actions.remove(a)
def importfbx(path):
 old=set(bpy.data.objects)
 bpy.ops.import_scene.fbx(filepath=str(path),use_anim=True,automatic_bone_orientation=False)
 return set(bpy.data.objects)-old
def setskin(meshes,skin):
 img=bpy.data.images.load(str(source/"Skins"/(skin+".png")),check_existing=True)
 for mesh in meshes:
  mat=bpy.data.materials.new(skin+"-CC0")
  mat.use_nodes=True
  bs=mat.node_tree.nodes.get("Principled BSDF")
  tex=mat.node_tree.nodes.new("ShaderNodeTexImage");tex.image=img
  mat.node_tree.links.new(tex.outputs["Color"],bs.inputs["Base Color"])
  bs.inputs["Roughness"].default_value=0.98
  mesh.data.materials.clear();mesh.data.materials.append(mat)
def build(skin,outname):
 prepare()
 base=importfbx(source/"Model/characterMedium.fbx")
 arms=[o for o in base if o.type=='ARMATURE']
 meshes=[o for o in base if o.type=='MESH']
 if len(arms)!=1 or not meshes:raise RuntimeError("Base model lacks one rig and mesh "+repr(describe(base)))
 arm=arms[0];setskin(meshes,skin)
 animations={}
 for label,filename in [("Idle","idle.fbx"),("Run","run.fbx"),("Jump","jump.fbx")]:
  imported=importfbx(source/"Animations"/filename)
  rigs=[o for o in imported if o.type=="ARMATURE"]
  actions=[]
  for a in bpy.data.actions:
   if a not in animations.values() and any(fc.data_path.startswith('pose.bones') for fc in a.fcurves):
    actions.append(a)
  candidate=next((o.animation_data.action for o in rigs if o.animation_data and o.animation_data.action),None)
  if candidate is None:
   candidate=max(actions,key=lambda a:len(a.fcurves)) if actions else None
  if candidate is None:raise RuntimeError("No bone animation in "+filename+"; imported "+repr(describe(imported)))
  candidate.name=label
  candidate.use_fake_user=True;animations[label]=candidate
  bpy.ops.object.select_all(action='DESELECT')
  for o in imported:o.select_set(True)
  bpy.ops.object.delete(use_global=False)
 arm.animation_data_create()
 for name,action in animations.items():
  track=arm.animation_data.nla_tracks.new()
  track.name=name
  strip=track.strips.new(name,max(1,int(action.frame_range[0])),action)
  strip.action_frame_start=action.frame_range[0]
  strip.action_frame_end=action.frame_range[1]
 # Export selection only: one armature and mesh, excludes any imported helper geometry.
 bpy.ops.object.select_all(action='DESELECT')
 for o in base:o.select_set(True)
 bpy.context.view_layer.objects.active=arm
 output=dest/(outname+'.glb')
 bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',
    use_selection=True,export_animations=True,export_nla_strips=True,
    export_skins=True,export_materials='EXPORT')
 print("MODEL",skin,output.stat().st_size,"bytes",describe(base),"clips",list(animations),flush=True)
 return output
out=[]
for skin,name in [("survivorMaleB","modernHero"),("zombieA","modernZombie"),("zombieC","modernRunner")]:
 out.append(build(skin,name))
# Validate exported GLB JSON chunks strictly to prevent accidental unrigged uploads.
for path in out:
 raw=path.read_bytes()
 if raw[:4]!=b'glTF':raise RuntimeError("Not GLB "+path.name)
 jsonlength=int.from_bytes(raw[12:16],"little")
 d=json.loads(raw[20:20+jsonlength])
 clips=[a.get('name') for a in d.get('animations',[])]
 if not d.get('skins') or not d.get('meshes') or len(clips)<2:raise RuntimeError("Missing rig/animations "+path.name+" "+str(clips))
 if path.stat().st_size>2_500_000:raise RuntimeError("GLB too large for phone "+path.name)
 print(json.dumps({"file":path.name,"bytes":len(raw),"sha256":hashlib.sha256(raw).hexdigest(),"skinCount":len(d['skins']),"meshes":len(d['meshes']),"animations":clips}),flush=True)
