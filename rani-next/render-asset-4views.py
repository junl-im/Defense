"""라니킹덤 2.5D — GLB -> 동일 카메라 4방향 PNG (Blender 4.2+).
blender -b --python rani-next/render-asset-4views.py -- --input incoming-3d/keep.glb --output staging-3d/keep
메시/텍스처/아틀라스의 라이선스와 렌더링 결과를 따로 검수해야 함.
"""
from __future__ import annotations
import argparse,hashlib,json,math,sys
from pathlib import Path

DIRECTIONS={'ne':45,'se':135,'sw':225,'nw':315}

def options():
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    p=argparse.ArgumentParser()
    p.add_argument('--input',required=True)
    p.add_argument('--output',required=True)
    p.add_argument('--size',type=int,default=384)
    p.add_argument('--samples',type=int,default=32)
    return p.parse_args(args)

def asset_scene(bpy,src):
    from mathutils import Vector
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=str(src))
    visible=[o for o in bpy.context.scene.objects if o.type=='MESH' and not o.hide_render]
    if not visible:raise ValueError('렌더링할 3D 메시가 없습니다')
    pts=[o.matrix_world @ Vector(v) for o in visible for v in o.bound_box]
    low=Vector([min(p[i] for p in pts) for i in range(3)])
    high=Vector([max(p[i] for p in pts) for i in range(3)])
    dims=high-low
    if max(dims)<=1e-6:raise ValueError('3D 모델의 실제 크기가 0입니다')
    origin=(high+low)/2
    bpy.ops.object.empty_add(type='PLAIN_AXES')
    root=bpy.context.object
    root.name='Rani_Root'
    for obj in [o for o in bpy.context.scene.objects if o!=root and o.parent is None]:
        w=obj.matrix_world.copy()
        obj.parent=root
        obj.matrix_world=w
    factor=2.6/max(dims)
    root.location=(-origin.x*factor,-origin.y*factor,-low.z*factor)
    root.scale=(factor,)*3
    bpy.context.view_layer.update()
    return len(visible),[round(float(d),5) for d in dims]

def lamp(bpy,name,location,power,size):
    from mathutils import Vector
    data=bpy.data.lights.new(name,type='AREA')
    data.energy=power
    data.shape='DISK'
    data.size=size
    obj=bpy.data.objects.new(name,data)
    bpy.context.collection.objects.link(obj)
    obj.location=location
    obj.rotation_euler=(Vector((0,0,1))-obj.location).to_track_quat('-Z','Y').to_euler()

def studio(bpy,size,samples):
    scene=bpy.context.scene
    scene.render.engine='BLENDER_EEVEE_NEXT'
    scene.render.resolution_x=size
    scene.render.resolution_y=size
    scene.render.resolution_percentage=100
    scene.render.film_transparent=True
    scene.render.image_settings.file_format='PNG'
    scene.render.image_settings.color_mode='RGBA'
    scene.render.image_settings.color_depth='8'
    scene.view_settings.view_transform='AgX'
    if hasattr(scene,'eevee') and hasattr(scene.eevee,'taa_render_samples'):
        scene.eevee.taa_render_samples=samples
    camdata=bpy.data.cameras.new('Rani_OrthoCamera')
    cam=bpy.data.objects.new('Rani_OrthoCamera',camdata)
    bpy.context.collection.objects.link(cam)
    camdata.type='ORTHO'
    camdata.ortho_scale=4.8
    scene.camera=cam
    lamp(bpy,'Rani_Key',(4,-5,8),950,5)
    lamp(bpy,'Rani_Fill',(-4,3,6),450,6)
    return cam

def main():
    a=options()
    if not 128<=a.size<=1024:raise ValueError('size: 128~1024')
    if not 8<=a.samples<=128:raise ValueError('samples: 8~128')
    src=Path(a.input).resolve()
    if not src.is_file() or src.suffix.lower()!='.glb':raise FileNotFoundError('GLB 파일을 지정하세요')
    out=Path(a.output).resolve()
    out.mkdir(parents=True,exist_ok=True)
    import bpy
    from mathutils import Vector
    count,dimensions=asset_scene(bpy,src)
    camera=studio(bpy,a.size,a.samples)
    images=[]
    for name,angle in DIRECTIONS.items():
        rad=math.radians(angle)
        camera.location=(7*math.cos(rad),7*math.sin(rad),6.5)
        camera.rotation_euler=(Vector((0,0,1.15))-camera.location).to_track_quat('-Z','Y').to_euler()
        dest=out/f'{src.stem}_{name}.png'
        bpy.context.scene.render.filepath=str(dest)
        bpy.ops.render.render(write_still=True)
        if not dest.is_file() or dest.stat().st_size==0:raise RuntimeError('PNG 미생성: '+str(dest))
        images.append(dest.name)
    info={'asset_id':src.stem,'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),
       'renderer':'Blender EEVEE','camera':'orthographic isometric',
       'directions':DIRECTIONS,'size':a.size,'meshes':count,'dimensions':dimensions,
       'images':images,'review_status':'unapproved',
       'note':'아트 검수/라이선스 확인/앵커 보정 전에는 인게임 배포 금지'}
    (out/'render-manifest.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps(info,ensure_ascii=False))

if __name__=='__main__':main()
