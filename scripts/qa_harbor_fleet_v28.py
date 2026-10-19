"""Real v2.8 ship+harbor GPU meshes from ACTUAL building makers, 3 viewports."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/harbor-fleet-v28')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
  browser=pw.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
    '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for label,w,h in [('desktop',1440,900),('mobile',390,844),('small',320,700)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=w<=700,has_touch=w<=700)
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function("""() => window.__game?.mode==='village'
       && !!window.__game.grid.get(0,0)?.group""",timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
    result=page.evaluate("""async () => {
      const game=window.__game;
      const {Rng}=await import('./src/core/Rng.js');
      const makers=await import('./src/buildings/CivicFactory.js');
      const THREE=await import('three');
      const originalState={
        cells:game.grid.cells.size,level:game.nativeVillage.level,mode:game.mode,
        placed:game.tilesPlaced
      };
      const observed=[];
      for(const kind of ['port','pier']){
        const b=(kind==='port'?makers.makePort:makers.makeFishingPier)(new Rng(1762));
        const expected=kind==='port'?'rani-royal-harbor-fleet-v28':'rani-royal-fishing-fleet-v28';
        const oldName=kind==='port'?'rani-royal-harbor-ornaments':'rani-royal-pier-ornaments';
        const group=b.phases[3];
        const updated=group.getObjectByName(expected);
        const previous=group.getObjectByName(oldName);
        const bounds=updated?new THREE.Box3().setFromObject(updated)
          .getSize(new THREE.Vector3()).toArray():[];
        const oldItems=group.children.filter(x=>x.name===oldName);
        const newItems=group.children.filter(x=>x.name===expected);
        observed.push({
          kind,phases:b.phases.length,
          phaseIsHidden:b.phases.every(x=>x.visible===false),
          previous:oldItems.length,newlyAdded:newItems.length,
          verts:updated?.geometry?.attributes.position.count||0,
          originalVerts:previous?.geometry?.attributes.position.count||0,
          flags:!!updated?.userData.raniVisualOnly&&!!updated?.userData.raniHarborVisualOnly,
          sharedMat:updated?.material===previous?.material,
          nonInteractive:updated?.raycast.toString().includes('=>'),
          bounds
        });
        // New geometric objects belong to the transient builder, not game state.
        for(const phase of b.phases)phase.traverse(o=>{
          if(o.isMesh && o.geometry && !o.geometry.userData.shared)o.geometry.dispose();
        });
      }
      const current={
        cells:game.grid.cells.size,level:game.nativeVillage.level,mode:game.mode,
        placed:game.tilesPlaced
      };
      return {
        observed,unchanged:JSON.stringify(originalState)===JSON.stringify(current),
        originalVillage:!!game.grid.get(0,0).group.getObjectByName('rani-royal-tile-dressing'),
        hudImages:document.querySelectorAll('#hud-top-bar .rani-raster-image').length,
        svgCount:document.querySelectorAll('svg').length
      };
    }""")
    assert len(result['observed'])==2,(label,result)
    for t in result['observed']:
      assert t['phases']==4 and t['phaseIsHidden'],(label,t)
      assert t['previous']==1 and t['newlyAdded']==1,(label,t)
      assert t['verts']>450 and t['originalVerts']>100,(label,t)
      assert t['flags'] and t['sharedMat'] and t['nonInteractive'],(label,t)
      assert len(t['bounds'])==3 and all(x>0 for x in t['bounds']),(label,t)
      assert t['bounds'][0]<1.2 and t['bounds'][2]<1.2,(label,t)
    assert result['originalVillage'] and result['unchanged'],(label,result)
    assert result['hudImages']==5 and result['svgCount']==0,(label,result)
    assert not errors,(label,errors)
    page.screenshot(path=str(OUT/(label+'-harbor-3d.png')),full_page=True)
    print('PASS',label,'ported & fishing 3D original meshes, cosmetics only, all old art',flush=True)
    ctx.close()
  browser.close()
