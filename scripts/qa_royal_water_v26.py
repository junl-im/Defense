"""v2.6 real Three.js river/lake geometry QA and saved game safety."""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path('qa/royal-waterfront-v26')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
  browser=pw.chromium.launch(args=[
    '--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist',
    '--enable-unsafe-swiftshader'])
  for label,w,h in [('desktop',1440,900),('mobile',390,844),('small',320,700)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},
      is_mobile=w<=700,has_touch=w<=700)
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function("""() => window.__game?.mode==='village' &&
      !!window.__game.tileFactory && !!window.__game.grid.get(0,0)?.group""",
      timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
    result=page.evaluate("""async()=>{
      const g=window.__game;
      const tf=g.tileFactory;
      const water=await import('./src/rendering/RoyalWaterfrontArt.js');
      const THREE=await import('three');
      const make=(kind,variant,rotation,seed)=>
        tf.makeCell(3,3,kind,variant,rotation,seed);
      const river0=make('river',0,0,83771);
      const river1=make('river',0,1,83771);
      const lake0=make('lake',0,0,83771);
      const lake1=make('lake',1,0,83771);
      const river=water.makeRoyalWaterfrontDressing(river0);
      const rotated=water.makeRoyalWaterfrontDressing(river1);
      const repeat=water.makeRoyalWaterfrontDressing(river0);
      const lake=water.makeRoyalWaterfrontDressing(lake0);
      const lakeWithoutRiver=water.makeRoyalWaterfrontDressing(lake1);
      const positions=m=>Array.from(m.geometry.attributes.position.array.slice(0,120));
      const same=JSON.stringify(positions(river))===JSON.stringify(positions(repeat));
      const changed=JSON.stringify(positions(river))!==JSON.stringify(positions(rotated));
      const statusBefore={cells:g.grid.cells.size,placed:g.tilesPlaced,
        mode:g.mode,level:g.nativeVillage.level};
      const temp=make('lake',0,0,129443);
      tf.placeCell(temp,{animate:false});
      const placed=temp.group.getObjectByName('rani-royal-waterfront-dressing');
      tf.setGhostTile('river',0,1);
      const ghost=tf.ghost?.getObjectByName('rani-royal-waterfront-dressing');
      const ghostOpacity=ghost?.material.opacity;
      tf.setGhostTile('lake',0,0);
      const lakeGhost=!!tf.ghost?.getObjectByName('rani-royal-waterfront-dressing');
      tf.hideGhost();
      const realBounding=placed?new THREE.Box3().setFromObject(placed).getSize(new THREE.Vector3()).toArray():[];
      const result={
        riverEdges:river0.riverEdges,rotatedEdges:river1.riverEdges,
        lakeEdges:lake1.riverEdges,
        vertices:[river,rotated,lake,lakeWithoutRiver,placed].map(
          x=>x?.geometry?.attributes?.position?.count||0),
        oneMesh:[river,rotated,lake,lakeWithoutRiver,placed].every(
          x=>x?.isMesh&&x.material&&x.userData.raniVisualOnly&&x.userData.raniWaterVisualOnly),
        nonPickable:[river,rotated,lake,placed].every(x=>x.raycast.toString().includes('=>')),
        same,changed,ghostOpacity,lakeGhost,realBounding,
        villageDressing:!!g.grid.get(0,0).group.getObjectByName('rani-royal-tile-dressing'),
        svgCount:document.querySelectorAll('svg').length
      };
      tf.removeCell(temp);
      for(const m of [river,rotated,repeat,lake,lakeWithoutRiver])m.geometry.dispose();
      result.unchanged=JSON.stringify(statusBefore)===JSON.stringify({
        cells:g.grid.cells.size,placed:g.tilesPlaced,
        mode:g.mode,level:g.nativeVillage.level});
      return result;
    }""")
    assert result['riverEdges']==[0,3],(label,result)
    assert result['rotatedEdges']==[1,4],(label,result)
    assert all(v>120 for v in result['vertices']),(label,result)
    assert result['oneMesh'] and result['nonPickable'],(label,result)
    assert result['same'] and result['changed'],(label,'seed/rotation',result)
    assert result['ghostOpacity']==0.55 and result['lakeGhost'],(label,result)
    assert all(v>0 for v in result['realBounding']),(label,result)
    assert result['unchanged'] and result['villageDressing'],(label,result)
    assert result['svgCount']==0 and not errors,(label,errors,result)
    page.screenshot(path=str(OUT/(label+'-waterfront-3d.png')),full_page=True)
    print('PASS',label,'real merged river+lake, seed rotation, translucent ghost, saves untouched',flush=True)
    ctx.close()
  browser.close()
