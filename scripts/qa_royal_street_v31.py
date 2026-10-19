"""v3.1 verified live real road overlay / village entrances, dynamic changes."""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path('qa/royal-street-v31')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
  browser=pw.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
    '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for label,w,h in [('desktop',1440,900),('laptop',1024,768),
                    ('mobile',390,844),('small',320,700)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},
        is_mobile=w<=700,has_touch=w<=700)
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function("""() => window.__game?.mode==='village'
      && !!window.__game.grid.get(0,0)?.group""",timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
    result=page.evaluate("""async()=>{
      const THREE=await import('three');
      const art=await import('./src/rendering/RoyalStreetConnectionArt.js');
      const variants=await import('./src/automesh/MeshVariants.js');
      const {AutoMeshSystem}=await import('./src/automesh/AutoMeshSystem.js');
      const {registerStandardTypes}=await import('./src/automesh/AutoMeshAdapters.js');
      const g=window.__game;
      // Four actual test cells on an isolated in-memory grid (never the
      // player's live grid). All road masks come from the real AutoMesh API.
      const cells=new Map();
      const add=(q,r,t,edges=[])=>{
        const c={q,r,tileType:t,roadEdges:[...edges],
          riverEdges:[],group:new THREE.Group(),seed:12345};
        cells.set(q+','+r,c);return c;
      };
      const west=add(-1,0,'field',[0]);
      const road=add(0,0,'field',[0,3]);
      const village=add(1,0,'village',[]);
      const river=add(0,1,'river',[0]);
      const grid={cells,get:(q,r)=>cells.get(q+','+r)||null};
      const auto=new AutoMeshSystem(grid);
      registerStandardTypes(auto,{buildOverlay:variants.buildOverlay,
        disposeOverlay:variants.disposeOverlay});
      const v=auto.resolveVariant('road',road);
      const villageData=auto.resolveVariant('village',village);
      const westData=auto.resolveVariant('road',west);
      const base={
        roadMask:v.mask,
        settlementConnections:villageData.connections,
        roadShape:v.label,
        westMask:westData.mask
      };
      const rg=variants.buildOverlay(road,v);
      const vg=variants.buildOverlay(village,villageData);
      const marker=rg.getObjectByName('rani-connected-royal-roadside-v31');
      const gate=vg.getObjectByName('rani-connected-royal-village-gate-v31');
      const oldPave=rg.getObjectByName('rani-royal-road-paving');
      const standalone=art.makeRoyalConnectedRoadside(road,v.mask);
      const cap=art.makeRoyalConnectedRoadside(road,0);
      const bounds=mesh=>new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3()).toArray();
      const saved={
        roadMask:v.mask,base,
        roadLength:bounds(marker),
        capLength:bounds(cap),
        meshCount:rg.children.filter(m=>m.name==='rani-connected-royal-roadside-v31').length,
        roadMesh:marker.isMesh,
        gateMesh:gate.isMesh,
        paving:!!oldPave,
        roadVerts:marker.geometry.attributes.position.count,
        gateVerts:gate.geometry.attributes.position.count,
        materials:marker.material===gate.material,
        nonPickable:marker.raycast.toString().includes('=>')&&gate.raycast.toString().includes('=>'),
        visualFlags:marker.userData.raniVisualOnly===true&&gate.userData.raniStreetDetail===true,
        unsupportedRiver:art.makeRoyalConnectedRoadside({...river,roadEdges:[0,3]},3)===null,
        noRoad:art.makeRoyalConnectedRoadside({...road,roadEdges:[]},63)===null,
        noGate:art.makeRoyalConnectedVillageGate(village,[])===null
      };
      // Break the real road-to-village connection in test-only grid.
      road.roadEdges=[3];
      const after=auto.resolveVariant('road',road);
      const villageAfter=auto.resolveVariant('village',village);
      const replaced=variants.buildOverlay(road,after);
      const reduced=replaced.getObjectByName('rani-connected-royal-roadside-v31');
      saved.dynamicChanged=after.mask!==v.mask&&
        villageAfter.connections.length===0&&
        reduced.geometry.attributes.position.count<marker.geometry.attributes.position.count;
      saved.realSceneOriginal=!!g.grid.get(0,0).group.getObjectByName('rani-production-village-square-v29');
      saved.realMode=g.mode;
      saved.headerCount=document.querySelectorAll('#hud-top-bar .rani-raster-image').length;
      saved.svgCount=document.querySelectorAll('svg').length;
      for(const group of [rg,vg,replaced])variants.disposeOverlay(group);
      for(const mesh of [standalone,cap])mesh.geometry.dispose();
      saved.removed=rg.parent===null && vg.parent===null && replaced.parent===null;
      return saved;
    }""")
    assert result['roadMask']==9,(label,result)
    assert result['base']['settlementConnections']==[3],(label,result)
    assert result['roadMesh'] and result['gateMesh'] and result['paving'],(label,result)
    assert result['roadVerts']>100 and result['gateVerts']>140,(label,result)
    assert result['meshCount']==1 and result['materials'],(label,result)
    assert result['nonPickable'] and result['visualFlags'],(label,result)
    assert result['unsupportedRiver'] and result['noRoad'] and result['noGate'],(label,result)
    assert result['dynamicChanged'] and result['removed'],(label,result)
    assert result['realSceneOriginal'] and result['realMode']=='village',(label,result)
    assert result['headerCount']==5 and result['svgCount']==0,(label,result)
    assert not errors,(label,errors)
    page.screenshot(path=str(OUT/(label+'-royal-connected-road.png')),full_page=True)
    print('PASS',label,'real AutoMesh road mask, connected town gates, dynamic change, original gameplay',flush=True)
    ctx.close()
  browser.close()
