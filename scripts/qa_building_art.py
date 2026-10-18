"""Real completed-building graphics, lazy CC0 3D models and durable cancel QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/building-art')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
                                     '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    for device,w,h in [('desktop',1440,900),('mobile',390,844)]:
        ctx=browser.new_context(viewport={'width':w,'height':h})
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
        page.wait_for_function("window.__game?.villageBuildingArt",timeout=60000)
        page.locator('#loading-screen').wait_for(state='detached',timeout=15000)
        assert page.evaluate('window.__game.villageBuildingArt.templates.size')==0, 'Models must load on demand'
        result=page.evaluate("""() => {
          const g=window.__game;
          g.selectTileType('forest');
          g.placeTile(1,0);
          const cell=g.grid.get(1,0);
          if(!cell)return {error:'forest could not be placed'};
          const old={...g.resourceSystem.resources};
          const built=g.buildingSystem.build(cell,'lumber_mill');
          const cancelled=g.buildingSystem.cancelJob('1,0','lumber_mill');
          const saved=JSON.parse(localStorage.getItem('kingdom-tiles-save-v2'));
          return {built,cancelled,old,current:{...g.resourceSystem.resources},
            savedList:saved.buildings.cells.filter(c=>c.key==='1,0'),
            inMemory:g.buildingSystem.byCell.has('1,0')};
        }""")
        assert result.get('built') and result.get('cancelled'),f'Build/cancel broken: {result}'
        assert result['inMemory'] is False
        assert not result['savedList'], 'Canceled job must not resurrect on reload'
        assert abs((result['old']['wood']-result['current']['wood'])-3)<0.001
        assert abs((result['old']['stone']-result['current']['stone'])-1)<0.001
        result=page.evaluate("""() => {
          const g=window.__game,c=g.grid.get(0,0);
          const rec={id:'farm',slot:0,remaining:0,total:1,done:false};
          g.buildingSystem.byCell.set('0,0',[rec]);
          g.buildingSystem._completeBuilding(c,rec,{instant:true,silent:false});
          return {done:rec.done,hasOriginal:!!rec.visual?.group,parent:!!rec.visual?.group?.parent};
        }""")
        assert result['done'] and result['hasOriginal'] and result['parent'],result
        page.wait_for_function("window.__game.villageBuildingArt.mounted.size === 1",timeout=25000)
        visual=page.evaluate("""() => {
          const g=window.__game,art=g.villageBuildingArt;
          const entry=[...art.mounted.values()][0];
          art.refresh();art.refresh();
          let meshCount=0;
          entry.instance.traverse(o=>{if(o.isMesh)meshCount++});
          return {loaded:art.templates.has('farm'),count:art.mounted.size,
            originalHidden:entry.original.visible===false,
            upgradedVisible:entry.instance.visible&&entry.instance.parent===entry.cell.group,
            meshCount};
        }""")
        assert visual['loaded'] and visual['count']==1 and visual['originalHidden'] and visual['upgradedVisible'] and visual['meshCount']>0,visual
        page.screenshot(path=str(OUT/(device+'-farm-3d.png')),full_page=True)
        page.evaluate('window.__game.saveSystem.save(window.__game)')
        page.reload(wait_until='load')
        page.wait_for_function('window.__game?.villageBuildingArt',timeout=60000)
        page.wait_for_function('window.__game.villageBuildingArt.mounted.size === 1',timeout=25000)
        assert page.evaluate("window.__game.villageBuildingArt.mounted.has('0,0/0/farm')")
        page.evaluate('window.__game.restart()')
        assert page.evaluate('window.__game.villageBuildingArt.mounted.size')==0
        assert page.evaluate('window.__game.tilesPlaced')==1
        assert not errors,f'{device} browser errors: {errors}'
        print('PASS',device,'lazy 3D farm, shared templates, save restore, restart and durable cancellation',flush=True)
        ctx.close()
    browser.close()
