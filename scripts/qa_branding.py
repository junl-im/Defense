"""First-launch raster logo QA with a paused boot and normal boot.

The first pass intercepts ONLY the bootstrap module, so the real native
image/styles load while the splash stays on-screen for pixel-size checks.
The second pass lets the whole original Three.js game start normally.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path("qa/branding")
OUT.mkdir(parents=True,exist_ok=True)

with sync_playwright() as pw:
    browser=pw.chromium.launch(args=[
        "--use-gl=swiftshader","--enable-webgl",
        "--ignore-gpu-blocklist","--enable-unsafe-swiftshader",
    ])
    for name,width,height in (("desktop",1440,900),("mobile",390,844),
                              ("small-mobile",320,700),("landscape",844,390)):
        ctx=browser.new_context(viewport={"width":width,"height":height},
                                is_mobile=(width<=700),has_touch=(width<=700))
        page=ctx.new_page()
        errors=[]
        page.on("pageerror",lambda e: errors.append(str(e)))
        # Keep original splash on screen, without mocking any image or CSS.
        page.route("**/src/main.js",lambda route:route.fulfill(
            status=200,content_type="text/javascript",
            body="// QA: leave actual first-launch branding on screen."))
        page.goto("http://127.0.0.1:8123/",wait_until="load",timeout=60000)
        page.locator("#loading-screen").wait_for(state="visible",timeout=15000)
        page.wait_for_function("""() => {
          const img=document.querySelector('#loading-logo');
          return img && img.complete && img.naturalWidth>0;
        }""",timeout=15000)
        logo=page.locator("#loading-logo")
        assert logo.is_visible(),f"{name}: branded image not displayed"
        dims=page.evaluate("""() => {
          const im=document.querySelector('#loading-logo'),
            r=im.getBoundingClientRect(), status=document.querySelector('#loading-status'),
            bar=document.querySelector('#loading-bar');
          return {source:new URL(im.currentSrc).pathname,
            naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight,
            x:r.x,y:r.y,width:r.width,height:r.height,
            viewportW:innerWidth,viewportH:innerHeight,
            fallbackHidden:document.querySelector('#loading-logo-fallback').hidden,
            status:status?.textContent,barLabel:bar?.getAttribute('aria-label'),
            bodyText:document.querySelector('#loading-title')?.textContent?.trim()};
        }""")
        assert dims["source"].endswith("/assets/branding/rani-kingdom-logo.webp"),dims
        assert dims["naturalWidth"]==720 and dims["naturalHeight"]==240,dims
        assert dims["width"]>width*.4 and dims["width"]<=width,dims
        assert dims["x"]>=0 and dims["x"]+dims["width"]<=width+1,dims
        assert dims["y"]>=0 and dims["y"]+dims["height"]<=height+1,dims
        assert dims["fallbackHidden"] and not dims["bodyText"],dims
        assert "왕국" in dims["status"] and "%" in dims["status"],dims
        assert dims["barLabel"]=="왕국 불러오기",dims
        page.screenshot(path=str(OUT/(name+"-splash.png")),full_page=True)
        assert not errors,(name,errors)
        ctx.close()
        print("PASS",name,"image title renders at native aspect and fits splash",flush=True)
    # The new logo must never prevent the existing game loop or Korean HUD.
    page=browser.new_page(viewport={"width":390,"height":844})
    page.goto("http://127.0.0.1:8123/",wait_until="load",timeout=60000)
    page.wait_for_function("window.__game?.mode==='village'",timeout=60000)
    page.locator("#loading-screen").wait_for(state="detached",timeout=15000)
    assert page.locator("#game-canvas").is_visible()
    assert page.locator("#hud-top-bar").is_visible()
    assert page.evaluate("window.__game.mode==='village'")
    print("PASS live startup Three.js village, Korean HUD and branding image",flush=True)
    browser.close()
