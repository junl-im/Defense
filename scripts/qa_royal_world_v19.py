"""v1.9 tests real Three.js geometry in original village and ghosts.
No gameplay save or world mutation in production; browser test creates one
visual-only field tile and verifies both original 4-phase castle makers.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/royal-world-v19'); OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
    b=pw.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
                                '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    for name,w,h in [('desktop',1440,900),('mobile',390,844),('small',320,700)]:
        ctx=b.new_context(viewport={'width':w,'height':h},
                          has_touch=w<=700,is_mobile=w<=700)
        p=ctx.new_page()
        errors=[]
        p.on('pageerror',lambda e:errors.append(str(e)))
        p.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
        p.wait_for_function("window.__game?.mode==='village' && window.__game?.tileFactory",
                            timeout=60000)
        p.locator('#loading-screen').wait_for(state='detached',timeout=30000)
        result=p.evaluate("""async () => {
          const g=window.__game,THREE=await import('three');
          const makers=await import('./src/buildings/BuildingFactory.js');
          const tile=g.grid.get(0,0);
          const dressing=tile.group.getObjectByName('rani-royal-tile-dressing');
          const pavements=dressing?.geometry?.getAttribute('position')?.count||0;
          const field=g.tileFactory.makeCell(1,0,'field',0,0,123456);
          g.tileFactory.placeCell(field,{animate:false});
          const wheat=field.group.getObjectByName('rani-royal-tile-dressing');
          const crops=wheat?.geometry?.getAttribute('position')?.count||0;
          const round=makers.makeCastle(null);
          const square=makers.makeCastleB(null);
          const ornamentCount=(v)=>v.phases[3].children.filter(
            n=>n.name==='rani-royal-castle-ornaments').length;
          const ornateMeshes=[round,square].map(v=>{
            const obj=v.phases[3].children.find(n=>n.name==='rani-royal-castle-ornaments');
            return {count:obj?.geometry?.attributes?.position?.count||0,
              shadow:obj?.castShadow,visualOnly:obj?.userData?.raniVisualOnly,
              bbox:obj?new THREE.Box3().setFromObject(obj).getSize(
                new THREE.Vector3()).toArray():[]};
          });
          g.tileFactory.setGhostTile('field',0,0);
          const ghost=!!g.tileFactory.ghost?.getObjectByName('rani-royal-tile-dressing');
          g.tileFactory.hideGhost();
          return {initialType:tile.tileType,pavements,crops,roundPhases:round.phases.length,
            squarePhases:square.phases.length,
            bothCastleOrnaments:[ornamentCount(round),ornamentCount(square)],
            ornateMeshes,ghost,dressings:tile.group.children.filter(
              n=>n.name==='rani-royal-tile-dressing').length,
            meshCount:field.group.children.filter(
              n=>n.name==='rani-royal-tile-dressing').length,
            gameMode:g.mode};
        }""")
        assert result['initialType']=='village',(name,result)
        assert result['pavements']>1000,(name,'no actual stone paving geometry',result)
        assert result['crops']>1000,(name,'no golden wheat geometry',result)
        assert result['dressings']==1 and result['meshCount']==1,(
          name,'decorations must be merged to 1 mesh per tile',result)
        assert result['roundPhases']==4 and result['squarePhases']==4
        assert result['bothCastleOrnaments']==[1,1],result
        assert all(m['count']>100 and m['visualOnly'] and not m['shadow']
                   for m in result['ornateMeshes']),result
        assert result['ghost'] and result['gameMode']=='village',result
        p.screenshot(path=str(OUT/(name+'-3d-castle-paving-farm.png')),full_page=True)
        # Loading existing saved villages must recreate their new art:
        p.evaluate("window.__game.saveSystem.save(window.__game)")
        p.reload(wait_until='load')
        p.wait_for_function("window.__game?.grid.get(0,0)?.group",timeout=60000)
        assert p.evaluate("""() => window.__game.grid.get(0,0)
             .group.getObjectByName('rani-royal-tile-dressing')!==undefined""")
        assert not errors,(name,errors)
        print('PASS',name,'real 3D castle/field/paving, ghost and restore',flush=True)
        ctx.close()
    b.close()
