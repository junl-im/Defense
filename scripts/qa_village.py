"""Native original Three.js village 3×3 upgrade, world overview, mobile and save QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/village')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
  browser=p.chromium.launch(args=[
    '--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for kind,w,h in [('desktop',1440,900),('mobile',390,844)]:
    context=browser.new_context(viewport={'width':w,'height':h},accept_downloads=True)
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function('window.__game && window.__game.nativeVillage',timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=15000)
    assert page.locator('#game-canvas').is_visible(), 'Original Three.js building scene missing'
    assert page.locator('#rani-nav').is_visible(), 'Village controls missing'
    assert page.locator('#rani-village-screen').count()==0, 'Rejected DOM grid still mounted'
    assert page.evaluate('window.__game.mode')=='village'
    assert page.evaluate('window.__game.nativeVillage.size')==3
    assert not page.locator('#rani-world-overview').is_visible()
    # 3×3 bounds apply to the actual native 3D tile placement system.
    assert page.evaluate('window.__game.nativeVillage.allows(1,0)') is True
    assert page.evaluate('window.__game.nativeVillage.allows(2,0)') is False
    before=page.evaluate('window.__game.tilesPlaced')
    wood=page.evaluate('window.__game.resourceSystem.resources.wood')
    page.evaluate('window.__game.placeTile(2,0)')
    assert page.evaluate('window.__game.tilesPlaced')==before
    assert page.evaluate('window.__game.resourceSystem.resources.wood')==wood
    page.screenshot(path=str(OUT/(kind+'-native-village-3x3.png')),full_page=True)
    if w<=700: page.locator('#rani-nav-toggle').click()
    page.locator('#rani-native-upgrade').click()
    status=page.locator('#rani-native-status').inner_text()
    details=page.evaluate("""() => ({
      level:window.__game.nativeVillage.level,
      upgrade:window.__game.nativeVillage.upgrade,
      canUpgrade:window.__game.nativeVillage.canUpgrade(),
      resources:window.__game.resourceSystem.resources
    })""")
    assert '승격 중' in status, f'Native upgrade not started: {status} {details}'
    page.evaluate('window.__game.nativeVillage.update(13)')
    assert page.evaluate('window.__game.nativeVillage.size')==4
    assert page.evaluate('window.__game.nativeVillage.allows(2,0)') is True
    # Verify the SELECTIVELY IMPORTED real CC0 glTF became a visible 3D scene
    # object, not just a recorded link in documentation.
    page.wait_for_function("window.__game.townHallArt?.model?.visible === true",timeout=25000)
    assert page.evaluate("window.__game.townHallArt.model.parent===window.__game.scene")
    page.evaluate('window.__game.saveSystem.save(window.__game)')
    page.screenshot(path=str(OUT/(kind+'-native-village-4x4.png')),full_page=True)
    page.reload(wait_until='load')
    page.wait_for_function('window.__game && window.__game.nativeVillage',timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=15000)
    assert page.evaluate('window.__game.nativeVillage.size')==4
    if w<=700:
      shortcut=page.locator('#rani-field-shortcut')
      assert shortcut.is_visible(), 'Mobile field should be one tap away'
      shortcut.click()
    else:
      page.locator('#rani-native-world').click()
    assert page.evaluate('window.__game.mode')=='world'
    assert page.locator('#rani-world-overview').is_visible()
    assert page.locator('#game-canvas').is_visible(), '3D field render should replace flat map'
    assert page.evaluate("window.__game.fieldScene.entries.length")>1
    assert page.locator('#rani-field-labels button[data-field-faction]').count()>1
    first_id=page.evaluate('window.__game.factionSystem.factions[0].id')
    picker=page.locator('#rani-field-faction-select')
    assert picker.is_visible(), 'Field must offer an accessible settlement selector'
    picker.select_option(first_id)
    assert page.evaluate('window.__game.nativeVillageUI.selectedId')==first_id
    assert '거리:' in page.locator('#rani-world-detail').inner_text()
    # The picker must bring the real selected 3D settlement into camera focus.
    assert page.evaluate("""() => {
      const field=window.__game.fieldScene;
      const city=field.entries.find(x=>x.id===window.__game.nativeVillageUI.selectedId);
      return city && Math.abs(field.focus.x-city.x)<0.01 && Math.abs(field.focus.z-city.z)<0.01;
    }"""), 'Picker changed info but did not move the 3D camera'
    # Field zoom must not mutate the original village camera.
    zoom_before=page.evaluate('window.__game.fieldScene.zoomDistance')
    village_zoom=page.evaluate('window.__game.controls.zoomGoal')
    page.evaluate("""() => document.getElementById('game-canvas').dispatchEvent(
      new WheelEvent('wheel',{deltaY:140,bubbles:true,cancelable:true}))""")
    assert page.evaluate('window.__game.fieldScene.zoomDistance')>zoom_before
    assert page.evaluate('window.__game.controls.zoomGoal')==village_zoom
    # Pointer pinch expands/zooms the field without changing village controls.
    page.evaluate("""() => {
      const c=document.getElementById('game-canvas'),ev=(type,id,x,y)=>
        c.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',button:0,
          clientX:x,clientY:y,bubbles:true}));
      ev('pointerdown',44,80,320);ev('pointerdown',45,140,320);
      ev('pointermove',45,230,320);
      ev('pointerup',44,80,320);ev('pointerup',45,230,320);
    }""")
    assert page.evaluate('window.__game.fieldScene.zoomDistance')<zoom_before*1.12
    assert page.evaluate('window.__game.controls.zoomGoal')==village_zoom
    # A one-finger drag pans the FIELD focus but not the original village camera.
    old_focus=page.evaluate('window.__game.fieldScene.focus.x')
    page.evaluate("""() => {
      const c=document.getElementById('game-canvas'),ev=(type,x,y)=>
        c.dispatchEvent(new PointerEvent(type,{pointerId:63,pointerType:'touch',button:0,
          clientX:x,clientY:y,bubbles:true}));
      ev('pointerdown',180,410);ev('pointermove',240,410);ev('pointerup',240,410);
    }""")
    assert abs(page.evaluate('window.__game.fieldScene.focus.x')-old_focus)>0.05
    assert page.evaluate('window.__game.controls.zoomGoal')==village_zoom
    page.locator('#rani-field-focus-home').click()
    assert page.evaluate("window.__game.nativeVillageUI.selectedId")=='player'
    assert page.evaluate('Math.abs(window.__game.fieldScene.focus.x)+Math.abs(window.__game.fieldScene.focus.z)')<0.01
    # Restore faction focus for the existing screenshot & 3D selection checks.
    picker.select_option(first_id)
    # A displayed 3D city label remains touch selectable as well.
    visible_labels=page.locator('#rani-field-labels button[data-field-faction]:visible')
    assert visible_labels.count()>=1, 'The 3D field must show at least one town label'
    assert page.evaluate("window.__game.fieldScene.towns.children.length === window.__game.fieldScene.entries.length")
    page.screenshot(path=str(OUT/(kind+'-faction-world.png')),full_page=True)
    page.locator('#rani-native-home').click()
    assert page.evaluate('window.__game.mode')=='village'
    assert page.locator('#game-canvas').is_visible()
    assert not errors,f'{kind}: {errors}'
    print('PASS',kind,'original Three.js 3×3 village, 4×4 upgrade, saved, real world faction map',flush=True)
    context.close()
  browser.close()
