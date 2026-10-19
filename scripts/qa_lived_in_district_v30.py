"""v3.0 built districts: real 3D, full 4 stage makers and safe restore QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path('qa/lived-in-district-v30')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
  browser=pw.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
    '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for label,w,h in [('desktop',1440,900),('mobile',390,844),('small',320,700)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},
      is_mobile=w<=700,has_touch=w<=700)
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda ex:errors.append(str(ex)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function("""() => window.__game?.mode==='village'
       && !!window.__game.grid.get(0,0)?.group""",timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
    result=page.evaluate("""async()=>{
      const game=window.__game;
      const before={
        level:game.nativeVillage.level,
        count:game.grid.cells.size,
        placed:game.tilesPlaced,
        mode:game.mode,
        buildSlots:game.buildingSystem.byCell.size,
        resources:JSON.stringify(game.resourceSystem.resources)
      };
      const original=game.grid.get(0,0).group;
      const three=await import('three');
      const {Rng}=await import('./src/core/Rng.js');
      const makers=await import('./src/buildings/CivicFactory.js');
      const art=await import('./src/rendering/RoyalLivedInDistrictArt.js');
      const kinds=['apiary','bakery','stable','temple','university','observatory','library'];
      const models=kinds.map(kind=>{
        const cap=kind[0].toUpperCase()+kind.slice(1);
        const model=makers['make'+cap](new Rng(123));
        const mesh=model.phases[3].getObjectByName('rani-lived-in-'+kind+'-v30');
        const box=mesh?new three.Box3().setFromObject(mesh).getSize(new three.Vector3()).toArray():[];
        const target={
          kind,phases:model.phases.length,
          allInitiallyHidden:model.phases.every(g=>g.visible===false),
          originalPhasesHaveContent:model.phases.every(g=>g.children.length>0),
          count:model.phases[3].children.filter(m=>m.name==='rani-lived-in-'+kind+'-v30').length,
          merged:!!mesh?.isMesh,verts:mesh?.geometry?.attributes?.position?.count||0,
          visualOnly:mesh?.userData.raniVisualOnly===true&&mesh?.userData.raniLivedInDistrict===true,
          raycastSuppressed:mesh?.raycast.toString().includes('=>'),
          bounds:box
        };
        model.group.traverse(o=>{
          if(o.isMesh&&o.geometry&&!o.geometry.userData.shared)o.geometry.dispose();
        });
        return target;
      });
      // Genuine built structure through ORIGINAL ConstructionSystem API.
      const temp=game.construction.build('library',original,
        new three.Vector3(.36,.22,.1),new Rng(2718),{instant:true,scale:.5});
      const built={
        done:temp?.done,phase:temp?.phase,
        phasesVisible:temp?.phases.every(p=>p.visible),
        visual:!!temp?.group.getObjectByName('rani-lived-in-library-v30')
      };
      temp?.group?.parent?.remove(temp.group);
      temp?.group?.traverse(o=>{
        if(o.isMesh&&o.geometry&&!o.geometry.userData.shared)o.geometry.dispose();
      });
      const after={
        level:game.nativeVillage.level,
        count:game.grid.cells.size,
        placed:game.tilesPlaced,
        mode:game.mode,
        buildSlots:game.buildingSystem.byCell.size,
        resources:JSON.stringify(game.resourceSystem.resources)
      };
      return {
        models,built,
        originalWorld:!!original.getObjectByName('rani-production-village-square-v29'),
        originalHud:document.querySelectorAll('#hud-top-bar .rani-raster-image').length,
        contentUnchanged:JSON.stringify(before)===JSON.stringify(after),
        svgCount:document.querySelectorAll('svg').length,
        invalidArt:art.makeRoyalLivedInDistrict('unknown')===null
      };
    }""")
    assert len(result['models'])==7,(label,result)
    for x in result['models']:
      assert x['phases']==4 and x['allInitiallyHidden'] and x['originalPhasesHaveContent'],(label,x)
      assert x['count']==1 and x['merged'] and x['verts']>130,(label,x)
      assert x['visualOnly'] and x['raycastSuppressed'],(label,x)
      assert all(0<v<1.25 for v in x['bounds']),(label,x)
    assert result['built']==dict(done=True,phase=3,phasesVisible=True,visual=True),(label,result)
    assert result['originalWorld'] and result['originalHud']==5,(label,result)
    assert result['contentUnchanged'] and result['invalidArt'] and result['svgCount']==0,(label,result)
    assert not errors,(label,errors)
    page.screenshot(path=str(OUT/(label+'-live-districts.png')),full_page=True)
    page.reload(wait_until='load')
    page.wait_for_function("""() => window.__game?.grid?.get(0,0)?.group""",timeout=60000)
    assert page.evaluate("""() => !!window.__game.grid.get(0,0).group
        .getObjectByName('rani-production-village-square-v29')"""),label
    assert not errors,(label,errors)
    print('PASS',label,'7 real civic models, 4 stages, original saving untouched, reload',flush=True)
    ctx.close()
  browser.close()
