"""v2.1: actual five house variants and five professions keep 4 stages and 3D art.
Runs against the original Three.js game on desktop and two phone viewports.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/royal-district-v21');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(args=[
        '--use-gl=swiftshader','--enable-webgl',
        '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    for label,w,h in [('desktop',1440,900),('mobile',390,844),('small',320,700)]:
        ctx=browser.new_context(viewport={'width':w,'height':h},
            is_mobile=w<=700,has_touch=w<=700)
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
        page.wait_for_function("window.__game?.grid?.get(0,0)?.group",timeout=60000)
        page.locator('#loading-screen').wait_for(state='detached',timeout=30000)
        result=page.evaluate("""async () => {
          const game=window.__game;
          const {Rng}=await import('./src/core/Rng.js');
          const THREE=await import('three');
          const residential=await import('./src/buildings/BuildingFactory.js');
          const civic=await import('./src/buildings/CivicFactory.js');
          const specs=[
            ['houseA',residential.makeHouse,'rani-royal-house-a'],
            ['houseB',residential.makeHouseB,'rani-royal-house-b'],
            ['houseC',residential.makeHouseC,'rani-royal-house-c'],
            ['houseD',residential.makeHouseD,'rani-royal-house-d'],
            ['houseE',residential.makeHouseE,'rani-royal-house-e'],
            ['market',residential.makeMarket,'rani-royal-district-market'],
            ['lumberMill',residential.makeLumberMill,'rani-royal-district-lumber'],
            ['sawmill',civic.makeSawmill,'rani-royal-district-sawmill'],
            ['forge',civic.makeForge,'rani-royal-district-forge'],
            ['barracks',civic.makeBarracks,'rani-royal-district-barracks'],
          ];
          const models=specs.map(([name,maker,ornament])=>{
            const b=maker(new Rng(123));
            const o=b.phases[3].children.filter(x=>x.name===ornament);
            const mesh=o[0];
            const box=mesh?new THREE.Box3().setFromObject(mesh):null;
            return {name,phases:b.phases.length,initiallyHidden:b.phases.every(x=>!x.visible),
              ornaments:o.length,vertices:mesh?.geometry.attributes.position.count||0,
              visualOnly:mesh?.userData.raniVisualOnly===true,
              merged:mesh?.isMesh===true,
              bounds:box?box.getSize(new THREE.Vector3()).toArray():[],
              originalPhaseParts:b.phases.map(x=>x.children.length)};
          });
          // Exercise the ORIGINAL construction system's actual instant build
          // path in a temporary QA scene. Does not touch saved game progress.
          const parent=game.grid.get(0,0).group;
          const temp=game.construction.build('houseA',parent,
            new THREE.Vector3(.36,.22,.1),new Rng(2718),{instant:true,scale:.6});
          const built={done:temp?.done,phase:temp?.phase,visible:
            temp?.phases.every(x=>x.visible),details:
            !!temp?.group.getObjectByName('rani-royal-house-a')};
          if(temp?.group?.parent)temp.group.parent.remove(temp.group);
          return {models,built,mode:game.mode,paving:
            !!parent.getObjectByName('rani-royal-tile-dressing')};
        }""")
        assert result['paving'] and result['mode']=='village',(label,result)
        assert len(result['models'])==10,(label,result)
        for m in result['models']:
            assert m['phases']==4 and m['initiallyHidden'],(label,m)
            assert m['ornaments']==1 and m['merged'] and m['visualOnly'],(label,m)
            assert m['vertices']>45 and all(x>0 for x in m['bounds']),(label,m)
            assert all(x>=1 for x in m['originalPhaseParts']),(label,m)
        assert result['built']=={'done':True,'phase':3,'visible':True,'details':True},(label,result)
        assert not errors,(label,errors)
        page.screenshot(path=str(OUT/(label+'-royal-district.png')),full_page=True)
        page.reload(wait_until='load')
        page.wait_for_function("window.__game?.grid?.get(0,0)?.group",timeout=60000)
        assert page.evaluate("""() => !!window.__game.grid.get(0,0)
          .group.getObjectByName('rani-royal-tile-dressing')"""),label
        print('PASS',label,'5 house silhouettes, market/barracks/mills/forge, final phase + reload',flush=True)
        ctx.close()
    browser.close()
