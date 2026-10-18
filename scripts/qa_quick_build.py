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
    page.evaluate("""([x,y]) => {const canvas=document.getElementById('game-canvas');canvas.dispatchEvent(new PointerEvent('pointerdown',{button:0,buttons:1,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));canvas.dispatchEvent(new PointerEvent('pointerup',{button:0,buttons:0,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));}""",[int(w/2),int(h/2)])
    assert page.locator('#rani-quick-build').is_visible(), 'tap should open context menu'
    assert page.locator('button[data-plan="combo:lumber_mill"]').is_visible()
    assert page.locator('button[data-plan="tile:forest"]').is_visible()
    # Same tile is a real open/close toggle.
    page.evaluate("""([x,y]) => {const canvas=document.getElementById('game-canvas');canvas.dispatchEvent(new PointerEvent('pointerdown',{button:0,buttons:1,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));canvas.dispatchEvent(new PointerEvent('pointerup',{button:0,buttons:0,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));}""",[int(w/2),int(h/2)])
    assert not page.locator('#rani-quick-build').is_visible()
    page.evaluate("""([x,y]) => {const canvas=document.getElementById('game-canvas');canvas.dispatchEvent(new PointerEvent('pointerdown',{button:0,buttons:1,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));canvas.dispatchEvent(new PointerEvent('pointerup',{button:0,buttons:0,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));}""",[int(w/2),int(h/2)])
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
      tutorial=page.locator('#slg-tutorial').bounding_box()
      nav_box=page.locator('#rani-nav').bounding_box()
      assert tutorial and nav_box
      assert tutorial['x']+tutorial['width']<=nav_box['x']+2, (
        'Top tutorial and village menus overlap',tutorial,nav_box)
      nav.click()
      assert nav.get_attribute('aria-expanded')=='true'
      assert page.locator('#rani-native-world').is_visible()
      nav.click()
      assert nav.get_attribute('aria-expanded')=='false'
      assert page.locator('#slg-mobile-dock button[data-panel="map"]').inner_text().find('마을')>=0
      assert not page.locator('#game-title').is_visible()
    # One short tap on the completed 3D tile should open the EXISTING info/radial action sheet.
    page.evaluate("window.__game._pointerToCell=()=>({q:1,r:0})")
    page.evaluate("""([x,y]) => {let c=document.getElementById('game-canvas');
      c.dispatchEvent(new PointerEvent('pointerdown',{button:0,pointerId:2,pointerType:'touch',clientX:x,clientY:y,bubbles:true}));
      c.dispatchEvent(new PointerEvent('pointerup',{button:0,pointerId:2,pointerType:'touch',clientX:x,clientY:y,bubbles:true}));}""",[int(w/2),int(h/2)])
    assert page.evaluate("window.__game.selection.cell?.q === 1"),'Building single tap should select immediately'
    assert page.locator('#radial-menu:not(.hidden)').count()==1, 'Tile actions were not rebuilt on tap'
    # The original PC radial ring is positioned with absolute children; its
    # wrapper has zero size, so checking wrapper.is_visible() is misleading.
    assert page.locator('#radial-menu .radial-center').is_visible(), 'Tile detail must be visible'
    # v1.1: original 3D-hex anchored radial, never a 3-column bottom list.
    assert page.evaluate("""() => {
      const root=document.querySelector('#radial-menu');
      const button=root.querySelector('.radial-btn');
      return getComputedStyle(root).display !== 'grid' &&
        !!button && getComputedStyle(button).position === 'absolute' &&
        getComputedStyle(root).bottom === 'auto';
    }"""), 'Original circular action ring was replaced by a bottom menu'
    # Display Korean building name and construction % rather than raw icon IDs.
    page.evaluate("""() => {
      const game=window.__game;
      game.radialMenu?._refreshProgress();
    }""")
    progress=page.locator('#radial-progress').text_content() or ''
    assert '건설' in progress and 'lumber_mill' not in progress, (
      'Construction percentage should use a Korean building name',progress)
    page.screenshot(path=str(OUT/(label+'-placed.png')),full_page=True)
    assert not errors,f'{label}: {errors}'
    print('PASS',label,'empty tap/menu toggle/combo 3D construction/mobile dock/compact layout',flush=True)
    ctx.close()
  browser.close()
