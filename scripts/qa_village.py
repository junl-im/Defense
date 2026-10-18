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
    page.evaluate('window.__game.saveSystem.save(window.__game)')
    page.screenshot(path=str(OUT/(kind+'-native-village-4x4.png')),full_page=True)
    page.reload(wait_until='load')
    page.wait_for_function('window.__game && window.__game.nativeVillage',timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=15000)
    assert page.evaluate('window.__game.nativeVillage.size')==4
    page.locator('#rani-native-world').click()
    assert page.evaluate('window.__game.mode')=='world'
    assert page.locator('#rani-world-overview').is_visible()
    assert not page.locator('#game-canvas').is_visible()
    assert page.locator('#rani-world-map button[data-faction-id]').count()>1
    f=page.locator('#rani-world-map button[data-faction-id]').filter(has_not=page.locator('[data-faction-id="player"]')).first
    page.locator('#rani-world-map button[data-faction-id]:not([data-faction-id="player"])').first.click()
    assert page.locator('#rani-world-detail').inner_text().find('거리:')>=0
    page.screenshot(path=str(OUT/(kind+'-faction-world.png')),full_page=True)
    page.locator('#rani-native-home').click()
    assert page.evaluate('window.__game.mode')=='village'
    assert page.locator('#game-canvas').is_visible()
    assert not errors,f'{kind}: {errors}'
    print('PASS',kind,'original Three.js 3×3 village, 4×4 upgrade, saved, real world faction map',flush=True)
    context.close()
  browser.close()
