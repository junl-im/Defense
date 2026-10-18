"""Rani Kingdom dual-view and construction cancellation UI smoke."""
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path('qa/village')
out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
  browser=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for name,w,h in (('desktop',1440,900),('mobile',390,844)):
    page=browser.new_page(viewport={'width':w,'height':h})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function("window.__game !== undefined",timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=15000)
    assert page.evaluate('window.__game.mode')=='village'
    assert page.locator('#rani-village-grid .rani-village-tile').count()==9
    assert not page.locator('#game-canvas').is_visible()
    page.screenshot(path=str(out/(name+'-3x3.png')),full_page=True)
    page.locator('button[data-village-x="0"][data-village-y="0"]').click()
    page.locator('button[data-village-build="lumber_mill"]').click()
    assert page.locator('#rani-village-grid').inner_text().count('건설 중')>=1
    resources_after_build=page.evaluate("window.__game.resourceSystem.resources.wood")
    page.on('dialog',lambda d:d.accept())
    page.locator('button[data-village-build="cancel"]').click()
    assert page.evaluate("window.__game.resourceSystem.resources.wood") > resources_after_build
    assert page.locator('button[data-village-x="0"][data-village-y="0"]').inner_text().find('건설 가능')>=0
    page.locator('button[data-hall-action="upgrade"]').click()
    assert '승격 중' in page.locator('#rani-hall-panel').inner_text()
    page.evaluate("() => window.__game.villageState.update(25)")
    assert page.locator('#rani-village-grid .rani-village-tile').count()==16
    page.screenshot(path=str(out/(name+'-4x4.png')),full_page=True)
    page.evaluate('window.__game.saveSystem.save(window.__game)')
    page.reload(wait_until='load')
    page.wait_for_function("window.__game !== undefined",timeout=60000)
    assert page.locator('#rani-village-grid .rani-village-tile').count()==16
    page.locator('#rani-go-world').click()
    assert page.evaluate('window.__game.mode')=='world'
    assert page.locator('#game-canvas').is_visible()
    assert page.locator('#rani-return-village').is_visible()
    page.screenshot(path=str(out/(name+'-world.png')),full_page=True)
    page.locator('#rani-return-village').click()
    assert page.evaluate('window.__game.mode')=='village'
    assert page.locator('#rani-village-grid .rani-village-tile').count()==16
    assert not errors,f'{name}: {errors}'
    print('PASS',name,'3x3→4x4, save reload, build cancel, world switch',flush=True)
    page.close()
  browser.close()
