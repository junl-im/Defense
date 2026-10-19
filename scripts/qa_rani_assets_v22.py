"""v2.2: real five standalone generated raster icons load in original HUD.
Supports 1440 desktop and 390px/320px mobile; tests fail-soft fallback and
still keeps prior Three.js kingdom artifacts/starting village working.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/rani-asset-v22');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(args=[
        '--use-gl=swiftshader','--enable-webgl',
        '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'
    ])
    for label,w,h in [('desktop',1440,900),('mobile',390,844),('small',320,700)]:
        ctx=browser.new_context(viewport={'width':w,'height':h},
            is_mobile=w<=700,has_touch=w<=700)
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
        page.wait_for_function("""() => window.__game?.mode==='village' &&
           document.querySelectorAll('#hud-top-bar .rani-raster-image').length===5 &&
           Array.from(document.querySelectorAll('#hud-top-bar .rani-raster-image'))
              .every(img => img.complete && img.naturalWidth===192)
        """,timeout=60000)
        images=page.evaluate("""() => Array.from(
          document.querySelectorAll('#hud-top-bar .rani-raster-image')).map(img=>({
            path:new URL(img.currentSrc).pathname,
            w:img.naturalWidth,h:img.naturalHeight,hidden:img.hidden
          }))""")
        assert len(images)==5,images
        assert all(a['path'].endswith('.webp') and '/assets/rani/ui/icons/' in a['path']
                   and a['w']==192 and a['h']==192 and not a['hidden']
                   for a in images),(label,images)
        assert len(set(a['path'] for a in images))==5,(label,'resource art duplicated')
        assert page.evaluate("!!window.__game.grid.get(0,0).group"),label
        assert page.locator('#game-canvas').is_visible()
        assert not page.locator('svg').count(),(label,'unexpected SVG element')
        assert not errors,(label,errors)
        page.screenshot(path=str(OUT/(label+'-raster-icons.png')),full_page=True)
        if label=='desktop':
            # Simulate a missing image. An asset CDN glitch must NOT break
            # kingdom HUD: reveal the old pictogram as non-SVG fallback.
            page.route('**/assets/rani/ui/icons/rk_icon_resource_gold_v001.webp',
                       lambda route:route.abort())
            page.reload(wait_until='load')
            page.wait_for_function("""() => {
               const el=document.querySelector('#hud-top-bar .ico-gold');
               return el?.querySelector('.rani-raster-image[hidden]') &&
                 el.querySelector('.rani-raster-fallback:not([hidden])');
            }""",timeout=60000)
            assert page.evaluate("window.__game?.mode==='village'"),'fallback blocked game'
            page.unroute_all()
        print('PASS',label,'five distinct image icons, mobile, retained 3D scene and graceful fallback',flush=True)
        ctx.close()
    browser.close()
