"""One-tap construction on genuine 3D frontier + compact mobile toggle regression."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/quick-build')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
  browser=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
                                  '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for label,w,h in [('desktop',1440,900),('mobile',390,844),('small-mobile',320,700)]:
    ctx=browser.new_context(viewport={'width':w,'height':h})
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function('window.__game?.quickBuildMenu',timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=20000)
    assert page.locator('#game-canvas').is_visible()
    page.evaluate("""() => {
      const g=window.__game;
      g.resourceSystem.grant({wood:100,stone:70,gold:60,food:60},'품질 테스트');
      g._pointerToCell=()=>({q:1,r:0});
      g.controls.moved=false;
    }""")
    # Synthesize a real PointerEvent with button=0, not a generic DOM Event.
    page.evaluate("([x,y]) => document.getElementById('game-canvas').dispatchEvent(new PointerEvent('pointerup',{button:0,clientX:x,clientY:y,bubbles:true}))",[int(w/2),int(h/2)])
    assert page.locator('#rani-quick-build').is_visible(), 'tap should open context menu'
    assert page.locator('button[data-plan="combo:lumber_mill"]').is_visible()
    assert page.locator('button[data-plan="tile:forest"]').is_visible()
    # Same tile is a real open/close toggle.
    page.evaluate("([x,y]) => document.getElementById('game-canvas').dispatchEvent(new PointerEvent('pointerup',{button:0,clientX:x,clientY:y,bubbles:true}))",[int(w/2),int(h/2)])
    assert not page.locator('#rani-quick-build').is_visible()
    page.evaluate("([x,y]) => document.getElementById('game-canvas').dispatchEvent(new PointerEvent('pointerup',{button:0,clientX:x,clientY:y,bubbles:true}))",[int(w/2),int(h/2)])
    assert page.locator('#rani-quick-build').is_visible()
    page.screenshot(path=str(OUT/(label+'-context.png')),full_page=True)
    menu=page.locator('#rani-quick-build').bounding_box()
    assert menu and menu['x']>=0 and menu['x']+menu['width']<=w+1
    assert menu['y']>=0 and menu['y']+menu['height']<=h+1
    before=page.evaluate('window.__game.tilesPlaced')
    page.locator('button[data-plan="combo:lumber_mill"]').click()
    assert page.evaluate('window.__game.tilesPlaced')==before+1
    assert page.evaluate("window.__game.grid.get(1,0)?.tileType")=='forest'
    assert page.evaluate("window.__game.buildingSystem.buildingsOn(window.__game.grid.get(1,0)).some(b=>b.id==='lumber_mill'&&!b.done)")
    assert not page.locator('#rani-quick-build').is_visible()
    assert page.evaluate("JSON.parse(localStorage.getItem('kingdom-tiles-save-v2')).buildings.cells.some(c=>c.key==='1,0')")
    if w<=700:
      dock=page.locator('#slg-mobile-dock')
      assert dock.is_visible()
      for key in ['tiles','research','factions','info']:
        button=dock.locator('button[data-panel="'+key+'"]')
        button.click()
        assert page.evaluate('document.body.dataset.activeSlgPanel')==key
        button.click()
        assert page.evaluate('document.body.dataset.activeSlgPanel')=='map'
      if page.locator('#radial-menu:not(.hidden)').is_visible():
        box=page.locator('#radial-menu').bounding_box()
        assert box['x']>=0 and box['x']+box['width']<=w+1
      nav=page.locator('#rani-nav-toggle')
      assert nav.is_visible()
      nav.click()
      assert nav.get_attribute('aria-expanded')=='true'
      assert page.locator('#rani-native-world').is_visible()
      nav.click()
      assert nav.get_attribute('aria-expanded')=='false'
    page.screenshot(path=str(OUT/(label+'-placed.png')),full_page=True)
    assert not errors,f'{label}: {errors}'
    print('PASS',label,'empty tap/menu toggle/combo 3D construction/mobile dock/compact layout',flush=True)
    ctx.close()
  browser.close()
