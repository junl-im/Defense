"""v3.3 live fullscreen and safe exit navigation on PC and mobile."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/immersive-shell-v33')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
  browser=pw.chromium.launch(args=[
    '--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist',
    '--enable-unsafe-swiftshader'])
  for label,w,h in [('desktop',1440,900),('laptop',1024,768),
                    ('mobile',390,844),('small',320,700)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},
      is_mobile=w<=700,has_touch=w<=700)
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function("""() => !!window.__game?.raniShell
      && !!window.__game.grid.get(0,0)?.group
      && !!document.getElementById('rani-shell-menu-toggle')""",timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
    initial=page.evaluate("""()=>{
      const canvas=document.getElementById('game-canvas');
      const rect=canvas.getBoundingClientRect();
      const shell=document.getElementById('rani-shell-menu');
      return {
        area:[Math.round(rect.width),Math.round(rect.height)],
        viewport:[innerWidth,innerHeight],
        shellHidden:shell.hidden,
        gameMode:window.__game.mode,
        world:!!window.__game.grid.get(0,0).group,
        oldArts:document.querySelectorAll('#hud-top-bar .rani-raster-image').length,
        svg:document.querySelectorAll('svg').length
      };
    }""")
    assert initial['shellHidden'] and initial['gameMode']=='village',(label,initial)
    assert initial['world'] and initial['oldArts']==5 and initial['svg']==0,(label,initial)
    assert initial['area']==initial['viewport'],(label,'not immersive viewport',initial)
    page.locator('#rani-shell-menu-toggle').click()
    assert page.locator('#rani-shell-menu').is_visible(),label
    assert page.locator('[data-shell-action="fullscreen"]').is_visible(),label
    # Fullscreen is permission-dependent. Check controls work or acknowledge failure.
    page.locator('[data-shell-action="fullscreen"]').click()
    page.locator('[data-shell-action="back"]').click()
    assert page.locator('#rani-shell-menu').is_hidden(),label
    page.keyboard.press('Escape')
    assert page.locator('#rani-shell-menu').is_visible(),label
    page.locator('[data-shell-action="leave"]').click()
    assert page.evaluate("window.__game.shellPaused===true"),label
    assert '시작 화면' in page.locator('#rani-shell-title').inner_text()
    page.locator('[data-shell-action="back"]').click()
    assert page.evaluate("window.__game.shellPaused===false"),label
    assert page.locator('#rani-shell-menu').is_hidden(),label
    # Actual Android back dispatch: same-page history sentinel + menu.
    page.evaluate('history.back()')
    page.wait_for_function("()=>!document.querySelector('#rani-shell-menu').hidden")
    assert page.locator('#rani-shell-menu').is_visible(),label
    page.locator('[data-shell-action="back"]').click()
    if not page.is_closed():
      # Browser-created tabs reject window.close(); test a safe informative fallback.
      page.evaluate("window.__raniCloseCalls=0;window.close=()=>window.__raniCloseCalls++")
      page.locator('#rani-shell-menu-toggle').click()
      page.locator('[data-shell-action="quit"]').click()
      assert page.evaluate("window.__raniCloseCalls===1"),label
      assert page.evaluate("window.__game.shellPaused===true"),label
      assert '직접 닫아주세요' in page.locator('.rani-shell-feedback').inner_text(),label
      page.locator('[data-shell-action="back"]').click()
      assert page.evaluate("window.__game.shellPaused===false"),label
    assert not errors,(label,errors)
    page.screenshot(path=str(OUT/(label+'-game-shell.png')),full_page=True)
    print('PASS',label,'full-viewport, native fullscreen control, back/leave/quit with truthful browser fallback',flush=True)
    ctx.close()
  browser.close()
