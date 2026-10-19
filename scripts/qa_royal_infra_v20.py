"""v2.0 real Three.js masonry/road/port QA with unchanged game/save engine."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/royal-infra-v20');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(args=[
      '--use-gl=swiftshader','--enable-webgl',
      '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    for label,w,h in [('desktop',1440,900),('mobile',390,844),('small-mobile',320,700)]:
        ctx=browser.new_context(viewport={'width':w,'height':h},
            is_mobile=w<=700,has_touch=w<=700)
        p=ctx.new_page()
        errors=[]
        p.on('pageerror',lambda e:errors.append(str(e)))
        p.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
        p.wait_for_function("window.__game?.grid?.get(0,0)?.group",timeout=60000)
        p.locator('#loading-screen').wait_for(state='detached',timeout=30000)
        result=p.evaluate("""async () => {
          const g=window.__game;
          const {Rng}=await import('./src/core/Rng.js');
          const {makeWallGate,makeWallTowerCorner}=await import('./src/buildings/MilitaryFactory.js');
          const {makePort,makeFishingPier}=await import('./src/buildings/CivicFactory.js');
          function look(builder,id,expected) {
            const v=builder(new Rng(1234));
            const m=v.phases[3].getObjectByName(expected);
            return {id,phases:v.phases.length,hidden:v.phases[3].visible===false,
              meshCount:v.phases[3].children.filter(x=>x.name===expected).length,
              verts:m?.geometry?.attributes.position.count||0,
              visualOnly:m?.userData.raniVisualOnly||false};
          }
          const makers=[
            look(makeWallGate,'gate','rani-royal-gate-ornaments'),
            look(makeWallTowerCorner,'bastion','rani-royal-bastion-ornaments'),
            look(makePort,'port','rani-royal-harbor-ornaments'),
            look(makeFishingPier,'pier','rani-royal-pier-ornaments')
          ];
          // Recreate an actual road tile in this isolated test tab; do not
          // save the synthetic cell to the user's kingdom.
          const road=g.tileFactory.makeCell(0,1,'meadow',0,0,54321);
          road.roadEdges=[2,5];
          g.grid.set(road);
          g.tileFactory.placeCell(road,{animate:false});
          g.autoMesh.onTileChanged(0,1);
          const group=road.group.getObjectByName('automesh:road');
          const paved=group?.getObjectByName('rani-royal-road-paving');
          const roadResult={overlay:!!group,art:!!paved,
            verts:paved?.geometry?.attributes.position.count||0,
            batch:group?.children.filter(x=>x.name==='rani-royal-road-paving').length||0};
          // Put a hostile neighbor on edge 0 of the origin for a genuine
          // WallSystem generated border (no player building is spawned).
          const enemy=g.tileFactory.makeCell(1,0,'meadow',0,0,123);
          enemy.owner='qa-hostile';
          g.grid.set(enemy);
          g.tileFactory.placeCell(enemy,{animate:false});
          g.wallSystem.rebuild();
          const before=[...g.wallSystem.segments.values()].map(x=>x.name);
          g.nativeVillage.level=2;
          g.wallSystem.rebuild();
          const after=[...g.wallSystem.segments.values()];
          const upgraded={
            names:after.map(x=>x.name),
            count:after.filter(x=>x.name==='rani-royal-border-wall').length,
            allMerged:after.every(x=>x.isMesh&&x.geometry?.attributes.position.count>100),
            shadow:after.every(x=>x.userData.raniVisualOnly===true)
          };
          g.wallSystem.clear();
          const cleared=g.wallSystem.segments.size===0 && after.every(x=>!x.parent);
          g.nativeVillage.level=1;
          return {makers,roadResult,before,upgraded,cleared,
            villagePaving:!!g.grid.get(0,0).group.getObjectByName('rani-royal-tile-dressing')};
        }""")
        assert result['villagePaving'],(label,result)
        assert all(m['phases']==4 and m['hidden'] and m['meshCount']==1
                   and m['verts']>100 and m['visualOnly']
                   for m in result['makers']),(label,'4-stage ports/gates changed',result)
        assert result['roadResult']['overlay'] and result['roadResult']['art'],(label,result)
        assert result['roadResult']['batch']==1 and result['roadResult']['verts']>300,(label,result)
        assert result['before'] and 'rani-royal-border-wall' not in result['before'],(label,result)
        assert result['upgraded']['count']>=1 and result['upgraded']['allMerged']                and result['upgraded']['shadow'],(label,result)
        assert result['cleared'],(label,result)
        assert not errors,(label,errors)
        p.screenshot(path=str(OUT/(label+'-infrastructure.png')),full_page=True)
        # Reload unchanged kingdom (only an isolated QA tab had fake hostile
        # tile state). Initial player village + new 3D paving survives.
        p.reload(wait_until='load')
        p.wait_for_function("window.__game?.grid?.get(0,0)?.group",timeout=60000)
        assert p.evaluate("""() => !!window.__game.grid.get(0,0)
          .group.getObjectByName('rani-royal-tile-dressing')""")
        print('PASS',label,'cobbled road, stage-4 gate/bastion/port/pier, level-up wall, reload',flush=True)
        ctx.close()
    browser.close()
