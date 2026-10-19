"""Production main play screen QA — real 3D + functional panels, no dummy buttons."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/production-play-v29')
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
    page.wait_for_function("""() => window.__game?.mode==='village' &&
      !!window.__game.grid.get(0,0)?.group &&
      !!document.getElementById('rani-production-command-rail')""",timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
    result=page.evaluate("""async()=>{
      const g=window.__game;
      const original=g.grid.get(0,0).group;
      const square=original.getObjectByName('rani-production-village-square-v29');
      const historic=original.getObjectByName('rani-royal-tile-dressing');
      const art=await import('./src/rendering/RoyalVillageSquareArt.js');
      const copyA=art.makeRoyalVillageSquareArt(g.grid.get(0,0));
      const copyB=art.makeRoyalVillageSquareArt(g.grid.get(0,0));
      const compare=mesh=>JSON.stringify(Array.from(mesh.geometry.attributes.position.array));
      const same=compare(copyA)===compare(copyB);
      const before={cells:g.grid.cells.size,placed:g.tilesPlaced,lv:g.nativeVillage.level};
      g.tileFactory.setGhostTile('village',1,0);
      const ghost=g.tileFactory.ghost?.getObjectByName('rani-production-village-square-v29');
      const alpha=ghost?.material.opacity;
      g.tileFactory.hideGhost();
      copyA.geometry.dispose();copyB.geometry.dispose();
      const after={cells:g.grid.cells.size,placed:g.tilesPlaced,lv:g.nativeVillage.level};
      const rail=document.getElementById('rani-production-command-rail');
      const rootbar=document.getElementById('hud-top-bar');
      return {
        original:!!original,
        baseDressing:!!historic,
        productionSquare:!!square&&square.isMesh&&square.material===historic?.material,
        vertexCount:square?.geometry.attributes.position.count||0,
        noninteractive:square?.userData.raniVisualOnly&&
          square?.userData.raniVillageDecorOnly&&square?.raycast.toString().includes('=>'),
        oneDraw:original.children.filter(n=>n.name==='rani-production-village-square-v29').length,
        deterministic:same,ghost:!!ghost,alpha,
        unchanged:JSON.stringify(before)===JSON.stringify(after),
        railVisible:getComputedStyle(rail).display!=='none',
        railBounds:rail.getBoundingClientRect().toJSON(),
        tutorialBounds:document.getElementById('slg-tutorial').getBoundingClientRect().toJSON(),
        commands:[...rail.querySelectorAll('button')].map(b=>b.dataset.productionAction),
        resources:rootbar.querySelectorAll('.rani-raster-image').length,
        originalFrame:!!document.querySelector('#hud-kingdom-panel .rani-royal-header-art'),
        svgCount:document.querySelectorAll('svg').length
      };
    }""")
    assert result['original'] and result['baseDressing'] and result['productionSquare'],(label,result)
    assert result['vertexCount']>700 and result['oneDraw']==1,(label,result)
    assert result['noninteractive'] and result['deterministic'],(label,result)
    assert result['ghost'] and result['alpha']==0.55,(label,result)
    assert result['unchanged'] and result['resources']==5 and result['originalFrame'],(label,result)
    assert result['svgCount']==0 and not errors,(label,result,errors)
    if w>=1180:
      assert result['railVisible'],(label,result)
      assert result['railBounds']['right']<result['tutorialBounds']['left'],(label,result)
      assert result['commands']==['tiles','research','factions','missions','kingdom'],(label,result)
      rail=page.locator('#rani-production-command-rail')
      # Pressing a rail button must actually delegate to original content.
      original=page.evaluate("document.body.classList.contains('royal-hide-research')")
      rail.locator('[data-production-action="research"]').click()
      assert page.evaluate("document.body.classList.contains('royal-hide-research')") != original
      rail.locator('[data-production-action="research"]').click()
      assert page.evaluate("document.body.classList.contains('royal-hide-research')") == original
      pre=page.evaluate("document.body.classList.contains('royal-hide-missions')")
      rail.locator('[data-production-action="missions"]').click()
      assert page.evaluate("document.body.classList.contains('royal-hide-missions')")!=pre
      rail.locator('[data-production-action="missions"]').click()
      assert page.evaluate("document.body.classList.contains('royal-hide-missions')")==pre
      rail.locator('[data-production-action="kingdom"]').click()
      assert page.evaluate("document.body.classList.contains('royal-kingdom-open')")
      assert page.locator('#hud-kingdom-panel').is_visible()
      rail.locator('[data-production-action="kingdom"]').click()
      assert not page.evaluate("document.body.classList.contains('royal-kingdom-open')")
      # The normal bottom navigation still travels between original scenes.
      page.locator('#rani-royal-launcher [data-royal-action="world"]').click()
      assert page.evaluate("window.__game.mode==='world'")
      page.locator('#rani-royal-launcher [data-royal-action="village"]').click()
      assert page.evaluate("window.__game.mode==='village'")
    elif w<=700:
      assert not result['railVisible'],(label,result)
      page.locator('#slg-mobile-dock [data-panel="research"]').click()
      assert page.locator('#research-panel').is_visible(),label
      page.locator('#slg-mobile-dock [data-panel="research"]').click()
      assert page.evaluate("document.body.dataset.activeSlgPanel==='map'")
    else:
      assert not result['railVisible'],(label,result)
      assert page.locator('#rani-royal-launcher').is_visible()
    page.screenshot(path=str(OUT/(label+'-live-game-production.png')),full_page=True)
    assert not errors,(label,errors)
    print('PASS',label,'real Three.js square, live command actions, old assets/save+mobile controls',flush=True)
    ctx.close()
  browser.close()
