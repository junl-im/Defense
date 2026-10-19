"""v1.8: live PC/mobile royal game HUD and real click navigation QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/royal-v18');OUT.mkdir(parents=True,exist_ok=True)
for_label=[('desktop',1440,900),('laptop',1024,768),('mobile',390,844),('small',320,700)]
with sync_playwright() as pw:
  browser=pw.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
                                    '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for label,w,h in for_label:
    ctx=browser.new_context(viewport={'width':w,'height':h},
                            is_mobile=w<=700,has_touch=w<=700)
    p=ctx.new_page()
    errors=[]
    p.on('pageerror',lambda e:errors.append(str(e)))
    p.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    p.wait_for_function("window.__game?.mode==='village' && !!document.getElementById('rani-royal-launcher')",
                        timeout=60000)
    p.locator('#loading-screen').wait_for(state='detached',timeout=30000)
    style=p.evaluate("""() => {
      const get=s=>getComputedStyle(document.querySelector(s));
      const rs=get('#hud-top-bar'), research=get('#research-panel');
      const fac=get('#faction-panel'),dock=get('#slg-mobile-dock');
      return {resourceBg:rs.backgroundImage,resourceColor:rs.color,
        researchBg:research.backgroundImage,facBg:fac.backgroundImage,
        researchColor:research.color,
        gold:get('#rani-royal-launcher').getPropertyValue('--rk-gold'),
        dockBg:dock.backgroundImage,
        royalStyles:[...document.styleSheets].some(s=>s.href?.includes('rani-royal-v18.css'))};
    }""")
    assert style['royalStyles'],(label,style)
    assert 'gradient' in style['resourceBg'] and 'gradient' in style['researchBg'],(label,style)
    if w>700:
      nav=p.locator('#rani-royal-launcher')
      assert nav.is_visible(),(label,'royal launcher not visible')
      assert nav.locator('button[data-royal-action]').count()==7
      assert nav.locator('[data-royal-action="village"]').get_attribute('aria-pressed')=='true'
      # Research, factions, and territory are actual pre-existing panels.
      research=p.locator('#research-panel')
      assert research.is_visible()
      nav.locator('[data-royal-action="research"]').click()
      assert not research.is_visible(),'research toggle ignored'
      nav.locator('[data-royal-action="research"]').click()
      assert research.is_visible(),'research not restored'
      nav.locator('[data-royal-action="factions"]').click()
      assert not p.locator('#faction-panel').is_visible()
      nav.locator('[data-royal-action="factions"]').click()
      assert p.locator('#faction-panel').is_visible()
      nav.locator('[data-royal-action="tiles"]').click()
      assert not p.locator('#hud-right').is_visible()
      nav.locator('[data-royal-action="tiles"]').click()
      assert p.locator('#hud-right').is_visible()
      nav.locator('[data-royal-action="kingdom"]').click()
      assert p.locator('#hud-kingdom-panel').is_visible()
      nav.locator('[data-royal-action="kingdom"]').click()
      assert not p.locator('#hud-kingdom-panel').is_visible()
      nav.locator('[data-royal-action="world"]').click()
      assert p.evaluate("window.__game.mode==='world'")
      assert p.locator('#rani-world-overview').is_visible()
      nav.locator('[data-royal-action="village"]').click()
      assert p.evaluate("window.__game.mode==='village'")
      assert not p.locator('#rani-world-overview').is_visible()
      bar=p.locator('#rani-royal-launcher').bounding_box()
      assert bar['x']>=0 and bar['x']+bar['width']<=w+1,(label,'launcher clipped',bar)
    else:
      assert p.locator('#slg-mobile-dock').is_visible()
      assert not p.locator('#rani-royal-launcher').is_visible()
      labels=p.locator('#slg-mobile-dock button[data-panel]').count()
      assert labels==5
      p.locator('#slg-mobile-dock button[data-panel="research"]').click()
      assert p.locator('#research-panel').is_visible()
      p.locator('#slg-mobile-dock button[data-panel="map"]').click()
      assert not p.locator('#research-panel').is_visible()
    assert p.locator('#game-canvas').is_visible()
    assert not errors,(label,errors)
    p.screenshot(path=str(OUT/(label+'-royal.png')),full_page=True)
    print('PASS',label,'gold/wood theme, real navigation, responsive gameplay',flush=True)
    ctx.close()
  browser.close()
