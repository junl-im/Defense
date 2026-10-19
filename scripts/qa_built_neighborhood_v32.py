"""Rani Kingdom v3.2 real completed-building street props, phase and restore regression."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/built-neighborhood-v32')
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
      && !!window.__game.grid.get(0,0)?.group
      && !!window.__game.royalBuiltNeighborhood""",timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
    result=page.evaluate("""async()=>{
      const THREE=await import('three');
      const {RoyalBuiltNeighborhoodSystem}=await import('./src/rendering/RoyalBuiltNeighborhoodSystem.js');
      const {makeRoyalBuiltNeighborhood}=await import('./src/rendering/RoyalBuiltNeighborhoodArt.js');
      const {events}=await import('./src/core/Events.js');
      const {MATS}=await import('./src/rendering/Materials.js');
      const g=window.__game;
      const base={
        count:g.grid.cells.size,placed:g.tilesPlaced,
        level:g.nativeVillage.level,
        saved:JSON.stringify(g.buildingSystem.serialize())
      };
      // Separate test group uses the real renderer/system/events but never
      // mutates the player's grid, saves or resources.
      const tile={q:81,r:83,tileType:'field',owner:'player',
        group:new THREE.Group(),seed:741};
      const cells=new Map([['81,83',tile]]);
      const jobs=[];
      const testGame={grid:{cells},buildingSystem:{buildingsOn:()=>jobs}};
      const liveCount=g.royalBuiltNeighborhood.entries.size;
      const mock=new RoyalBuiltNeighborhoodSystem(testGame);
      const noFinished=mock.entries.size===0;
      const rec={id:'bakery',slot:0,done:false,pos:{x:.31,z:.22},
        visual:{done:false}};
      jobs.push(rec);
      events.emit('buildings:changed',{});
      const constructionHidden=mock.entries.size===0;
      rec.done=true;
      events.emit('buildings:changed',{});
      const animationHidden=mock.entries.size===0;
      rec.visual.done=true;
      events.emit('building:complete',{building:rec.visual});
      const single=mock.entries.get('81,83')?.mesh;
      const sameVertex=single?.geometry.attributes.position.count||0;
      let freed=0;
      single?.geometry.addEventListener('dispose',()=>freed++);
      events.emit('buildings:changed',{});
      const dedup=mock.entries.get('81,83')?.mesh===single &&
        tile.group.children.length===1;
      const sample=makeRoyalBuiltNeighborhood(tile,jobs);
      const deterministic=JSON.stringify(Array.from(sample.geometry.attributes.position.array))===
        JSON.stringify(Array.from(single.geometry.attributes.position.array));
      sample.geometry.dispose();
      const second={id:'market',slot:1,done:true,pos:{x:-.30,z:.19},
        visual:{done:true}};
      jobs.push(second);
      events.emit('buildings:changed',{});
      const doubleMesh=mock.entries.get('81,83')?.mesh;
      const combined=mock.entries.size===1&&tile.group.children.length===1 &&
        doubleMesh?.geometry.attributes.position.count>sameVertex && freed===1;
      let freedSecond=0;
      doubleMesh?.geometry.addEventListener('dispose',()=>freedSecond++);
      tile.owner='enemy';
      events.emit('territory:changed',{});
      const foreignCleared=mock.entries.size===0 && tile.group.children.length===0 &&
        freedSecond===1;
      tile.owner='player';
      events.emit('territory:changed',{});
      const restored=mock.entries.size===1 && tile.group.children.length===1;
      jobs.length=0;
      events.emit('buildings:changed',{});
      const canceled=mock.entries.size===0 && tile.group.children.length===0;
      mock.dispose();
      const after={
        count:g.grid.cells.size,placed:g.tilesPlaced,
        level:g.nativeVillage.level,
        saved:JSON.stringify(g.buildingSystem.serialize())
      };
      return {
        noFinished,constructionHidden,animationHidden,dedup,deterministic,
        combined,foreignCleared,restored,canceled,
        originalScene:!!g.grid.get(0,0).group.getObjectByName('rani-production-village-square-v29'),
        originalImageCount:document.querySelectorAll('#hud-top-bar .rani-raster-image').length,
        nativeAvailable:!!g.royalBuiltNeighborhood,
        realEntriesBefore:liveCount,realEntriesAfter:g.royalBuiltNeighborhood.entries.size,
        unchanged:JSON.stringify(base)===JSON.stringify(after),
        merged:single?.material===MATS.vcStatic &&
          single?.userData.raniVisualOnly===true &&
          single?.raycast.toString().includes('=>'),
        vertices:sameVertex,svgCount:document.querySelectorAll('svg').length
      };
    }""")
    for check in ['noFinished','constructionHidden','animationHidden','dedup','deterministic',
                  'combined','foreignCleared','restored','canceled','originalScene',
                  'nativeAvailable','unchanged','merged']:
      assert result[check],(label,check,result)
    assert result['vertices']>120,(label,result)
    assert result['realEntriesBefore']==result['realEntriesAfter'],(label,result)
    assert result['originalImageCount']==5 and result['svgCount']==0,(label,result)
    assert not errors,(label,errors)
    page.screenshot(path=str(OUT/(label+'-completed-building-street.png')),full_page=True)
    page.reload(wait_until='load')
    page.wait_for_function("""()=>!!window.__game?.royalBuiltNeighborhood""",timeout=60000)
    assert page.evaluate("""()=>!!window.__game.grid.get(0,0).group
      .getObjectByName('rani-production-village-square-v29')"""),label
    assert not errors,(label,errors)
    print('PASS',label,'actual player build state, one mesh/cell, cancellation/territory/reload, zero SVG',flush=True)
    ctx.close()
  browser.close()
