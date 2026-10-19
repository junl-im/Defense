"""Regression: PC/mobile draggable HUD, stored layout, no native right-click,
and real 11-type raster territory shop, without altering game save data."""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path('qa/ui-v17')
OUT.mkdir(parents=True,exist_ok=True)

with sync_playwright() as pw:
    browser=pw.chromium.launch(args=[
        '--use-gl=swiftshader','--enable-webgl',
        '--ignore-gpu-blocklist','--enable-unsafe-swiftshader',
    ])
    for label,w,h in [('desktop',1440,900),('mobile',390,844),('small-mobile',320,700)]:
        ctx=browser.new_context(viewport={'width':w,'height':h},
            is_mobile=w<=700,has_touch=w<=700)
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda e: errors.append(str(e)))
        page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
        page.wait_for_function("""() =>
          window.__game && document.body.dataset.raniLayoutReady==='true'
          && window.__game.ui.terrainAtlas?.naturalWidth===640
        """,timeout=60000)
        assert page.locator('.tile-chip .rani-terrain-art').count()==11
        positions=page.locator('.tile-chip .rani-terrain-art').evaluate_all(
          """nodes=>nodes.map(n=>[getComputedStyle(n).backgroundImage,
           getComputedStyle(n).backgroundPosition])""")
        assert all('rani-terrain-atlas.webp' in item[0] for item in positions),positions
        assert len(set(p[1] for p in positions))==11,('biome cards reused the same image region',positions)
        forest=page.evaluate("""() => {
          const ui=window.__game.ui;ui.drawPreview('forest',0,0);
          return ui.el.preview.toDataURL();
        }""")
        mountain=page.evaluate("""() => {
          const ui=window.__game.ui;ui.drawPreview('mountain',0,0);
          return ui.el.preview.toDataURL();
        }""")
        assert forest!=mountain,('Terrain preview must show distinct real sprites',label)
        assert page.evaluate("""() => {
          const e=document.getElementById('game-canvas');
          return e.dispatchEvent(new MouseEvent('contextmenu',{
            bubbles:true,cancelable:true,button:2}))===false;
        }"""),label
        assert page.evaluate("""() =>
          getComputedStyle(document.querySelector('.tile-chip-name')).userSelect
        """)=='none'
        assert page.locator('#rani-reset-ui').count()==1
        if w>700:
            research=page.locator('#research-panel').bounding_box()
            faction=page.locator('#faction-panel').bounding_box()
            assert 72 <= research['y'] <= 135 and 72 <= faction['y'] <= 135,(
                'Research and factions should both start near the top',research,faction)
            assert research['x']<w*.25 and faction['x']>w*.65,(
                'PC panes should start on opposite sides',research,faction)
            target='#research-panel'
        else:
            page.locator("#slg-mobile-dock button[data-panel='research']").click()
            assert page.locator('#research-panel').is_visible()
            target='#research-panel'
        box=page.locator(target).bounding_box()
        grip=page.locator(target+' > .rani-move-handle').bounding_box()
        assert grip and box,(label,'missing drag grip',grip,box)
        startx=grip['x']+grip['width']/2;starty=grip['y']+grip['height']/2
        page.mouse.move(startx,starty)
        page.mouse.down()
        page.mouse.move(startx+51,starty+49,steps=8)
        page.mouse.up()
        moved=page.locator(target).bounding_box()
        # At 320px, the research panel is 292px wide and can legally
        # move horizontally by only 28px in total. Verify it moved and was
        # clamped inside the screen, not that it traveled an impossible 22px.
        assert abs(moved['y']-box['y'])>22 and abs(moved['x']-box['x'])>8,(
          label,'panel did not move when dragging its grip',box,moved)
        assert moved['x']>=0 and moved['x']+moved['width']<=w+1,(
          'Panel must remain on-screen after dragging',label,moved)
        saved=page.evaluate("""() => {
          const x=JSON.parse(localStorage.getItem('rani-hud-layout-v2'));
          return x[innerWidth<=700?'mobile':'desktop']['research-panel'];
        }""")
        assert 0<=saved['x']<=1 and 0<=saved['y']<=1,(label,saved)
        page.screenshot(path=str(OUT/(label+'-moved.png')),full_page=True)
        page.reload(wait_until='load')
        page.wait_for_function("document.body.dataset.raniLayoutReady==='true' && !!window.__game",
                               timeout=60000)
        if w<=700:page.locator("#slg-mobile-dock button[data-panel='research']").click()
        after=page.locator(target).bounding_box()
        assert abs(after['x']-moved['x'])<6 and abs(after['y']-moved['y'])<6,(
          label,'saved panel position was lost after re-entering',moved,after)
        page.locator('#rani-reset-ui').click()
        assert page.evaluate("""() =>
          Object.keys(JSON.parse(localStorage.getItem('rani-hud-layout-v2'))
            [innerWidth<=700?'mobile':'desktop']).length===0
        """),'Reset layout did not clear this screen-size profile'
        assert not page.locator(target).evaluate('(el)=>el.classList.contains("rani-positioned")')
        assert not errors,(label,errors)
        print('PASS',label,'raster atlas, drag, reload persistence, reset, right-click lock',flush=True)
        ctx.close()
    browser.close()
