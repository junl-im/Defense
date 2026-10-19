"""v2.7: original independent 512x254 royal banner correctly presented in
real responsive *kingdom panel*, without distorting asset or removing gameplay.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path('qa/royal-header-v27')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
  browser=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
                                   '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for label,w,h in [('desktop',1440,900),('laptop',1024,768),
                    ('mobile',390,844),('small',320,700)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},
        is_mobile=w<=700,has_touch=w<=700)
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda ex:errors.append(str(ex)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function("""() => window.__game?.mode==='village'
       && window.__game.grid.get(0,0)?.group
       && document.querySelector('#hud-kingdom-panel .rani-royal-header-art')""",
       timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
    if w>700:
      page.locator('#rani-royal-launcher [data-royal-action="kingdom"]').click()
      assert page.evaluate("document.body.classList.contains('royal-kingdom-open')")
    else:
      page.locator('#slg-mobile-dock [data-panel="info"]').click()
      assert page.evaluate("document.body.dataset.activeSlgPanel==='info'")
    panel=page.locator('#hud-kingdom-panel')
    assert panel.is_visible(),label
    result=page.evaluate("""async()=>{
      const img=document.querySelector('#hud-kingdom-panel .rani-royal-header-art');
      await img.decode();
      const box=img.getBoundingClientRect();
      const panel=document.getElementById('hud-kingdom-panel').getBoundingClientRect();
      const bar=document.getElementById('hud-top-bar').getBoundingClientRect();
      const heading=document.querySelector('#hud-kingdom-panel .rani-royal-heading');
      const css=getComputedStyle(img);
      const manifest=await (await fetch('assets/rani/manifest-v27.json')).json();
      const g=window.__game;
      return {
        src:new URL(img.currentSrc).pathname,
        original:[img.naturalWidth,img.naturalHeight],
        shown:[box.width,box.height],
        style:{objectFit:css.objectFit,aspectRatio:css.aspectRatio},
        artFrame:getComputedStyle(img.parentElement).aspectRatio,
        imageOutside:box.right>panel.right+2 || box.left<panel.left-2,
        parentOutside:heading.getBoundingClientRect().right>panel.right+2,
        tierText:!!document.getElementById('hud-tier-name').textContent.trim(),
        resources:[...document.querySelectorAll('#hud-top-bar .rani-raster-image')].map(x=>x.naturalWidth),
        upgradeExists:!!document.querySelector('#hud-upgrade-btn'),
        artCount:manifest.assets.filter(a=>a.status.startsWith('applied-')).length,
        svgCount:document.querySelectorAll('svg').length,
        game:!!g.grid.get(0,0)?.group && g.mode==='village' && !!g.resourceSystem
      };
    }""")
    assert result['original']==[512,254],(label,result)
    assert result['src'].endswith('/rk_panel_royal_hud_v001.webp'),(label,result)
    ratio=result['shown'][0]/result['shown'][1]
    assert abs(ratio-512/254)<0.025,(label,'royal frame aspect distorted',result)
    assert result['shown'][0]>=65 and result['shown'][0]<=110,(label,result)
    assert result['style']['objectFit']=='contain',(label,result)
    assert result['artCount']==10 and result['upgradeExists'] and result['tierText'],(label,result)
    assert result['game'] and result['svgCount']==0,(label,result)
    assert not result['imageOutside'] and not result['parentOutside'],(label,result)
    assert len(result['resources'])==5 and all(x==192 for x in result['resources']),result
    assert not errors,(label,errors)
    page.screenshot(path=str(OUT/(label+'-original-royal-header.png')),full_page=True)
    # Existing toggle UX remains correct; the header must not steal taps.
    if w>700:
      page.locator('#rani-royal-launcher [data-royal-action="kingdom"]').click()
      assert not panel.is_visible()
      page.locator('#rani-royal-launcher [data-royal-action="kingdom"]').click()
      assert panel.is_visible()
    else:
      page.locator('#slg-mobile-dock [data-panel="info"]').click()
      assert page.evaluate("document.body.dataset.activeSlgPanel==='map'")
      page.locator('#slg-mobile-dock [data-panel="info"]').click()
      assert panel.is_visible()
    print('PASS',label,'original 512:254 graphic, game UI toggles, no stretched/cropped banner',flush=True)
    ctx.close()
  browser.close()
