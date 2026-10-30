"""Browser QA for the independent TPS. Requires playwright==1.55.0 and Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
import os

BASE=os.environ.get("TPS_QA_URL","http://127.0.0.1:8139/")
OUT=Path("BlockSurvivalTPS/qa/screenshots")
OUT.mkdir(parents=True,exist_ok=True)
errors=[]

def check(condition,msg):
    if not condition:
        raise AssertionError(msg)

def start(page,label):
    local_errors=[]
    page.on("pageerror",lambda e:local_errors.append(str(e)))
    page.add_init_script("""
        HTMLCanvasElement.prototype.requestPointerLock=function(){return Promise.resolve()};
        Element.prototype.requestFullscreen=function(){return Promise.reject(new Error('QA fullscreen disabled'))};
    """)
    page.goto(BASE,wait_until="domcontentloaded",timeout=40000)
    page.wait_for_timeout(1300)
    fatal=page.locator("#fatal")
    check(fatal.is_hidden(),f"{label}: WebGL init failure; cannot render TPS: {fatal.inner_text() if not fatal.is_hidden() else ''}")
    check(page.locator("#stage").evaluate("(c)=>c.width>0&&c.height>0"),f"{label}: canvas has no render surface")
    check(page.locator("#menuTitle").is_visible(),f"{label}: no start menu")
    page.locator("#primary").click()
    page.wait_for_timeout(900)
    check(page.locator("#overlay").is_hidden(),f"{label}: did not enter game")
    check(page.locator("#hud").is_visible(),f"{label}: HUD not visible")
    check(page.locator("#reticle").is_visible(),f"{label}: no center crosshair")
    page.wait_for_function("() => Number(document.querySelector('#shell').dataset.urbanDetails)>80",timeout=12000)
    check(page.evaluate("() => document.querySelector('#stage').getBoundingClientRect().width===innerWidth"),
          f"{label}: canvas viewport no longer fills browser")
    # Explicitly require two real animated GLBs; fallback-only UI must not pass v0.4.
    page.wait_for_function("() => document.querySelector('#shell').dataset.heroRig==='loaded'",timeout=25000)
    check(page.evaluate("() => document.querySelector('#shell').dataset.dynamicResolution==='enabled'"),
          f"{label}: adaptive resolution was not initialized")
    page.wait_for_function("() => document.querySelector('#shell').dataset.undeadAsset==='loaded'",timeout=25000)
    # v0.7 may never silently fall back to the old fantasy Knight or skeleton.
    for key in ("modernHero","modernZombie","modernRunner","modernHeroRig","modernGun"):
        page.wait_for_function("(key) => document.querySelector('#shell').dataset[key]==='loaded' || (key==='modernGun' && document.querySelector('#shell').dataset[key]==='attached')",
                               arg=key,timeout=25000)
    check(page.locator("#combatPopup").count()==1 and page.locator("#attackCue").count()==1,
          f"{label}: combat feedback indicators were removed")
    check(page.evaluate("() => document.querySelector('#shell').dataset.combatFx==='ready'"),
          f"{label}: pooled 3D impact effects failed to initialize")
    check(page.evaluate("() => document.querySelector('#shell').dataset.destructibles==='3'"),
          f"{label}: 3 visible destructible city barrels were not constructed")
    check(page.locator("#reloadTrack").count()==1, f"{label}: reload HUD progress meter missing")
    check(page.evaluate("() => document.querySelector('#shell').dataset.casingFx==='ready'"),
          f"{label}: pooled cartridge casing geometry was not initialized")
    check(page.evaluate("() => document.querySelector('#shell').dataset.dustFx==='ready'"),
          f"{label}: bounded blast dust geometry was not initialized")
    check(page.locator("#mode").count()==1, f"{label}: firing mode switch is missing")
    check(page.evaluate("() => document.querySelector('#shell').dataset.shockwaveFx==='ready'"),
          f"{label}: pooled blast ground shockwave failed to initialize")
    # Interactive mode change: not just a decorative text label.
    check(page.locator("#mode").inner_text()=="정밀",f"{label}: default firing mode is wrong")
    page.locator("#mode").click()
    page.wait_for_function("() => document.querySelector('#mode').textContent==='속사'",timeout=12000)
    check(page.locator("#mode").inner_text()=="속사",f"{label}: firing mode click had no effect")
    page.locator("#mode").click()
    page.wait_for_function("() => document.querySelector('#mode').textContent==='정밀'",timeout=12000)
    check(page.evaluate("() => document.querySelector('#shell').dataset.explosionFx==='ready'"),
          f"{label}: lightweight explosion renderer did not initialize")
    check(page.evaluate("() => document.querySelector('#shell').dataset.combatVersion==='v012'"),
          f"{label}: modern combat pose pipeline not activated")
    check(page.evaluate("() => ['Run','Idle'].includes(document.querySelector('#shell').dataset.heroAnimation)"),
          f"{label}: modern skin animation clip never activated")
    page.wait_for_timeout(1500)
    check(not local_errors,f"{label}: JavaScript exceptions: {local_errors[:5]}")
    return local_errors

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=[
        "--use-gl=angle","--use-angle=swiftshader","--enable-webgl",
        "--enable-unsafe-swiftshader","--disable-features=Vulkan"
    ])
    desktop=browser.new_context(viewport={"width":1280,"height":720},device_scale_factor=1)
    page=desktop.new_page()
    err=start(page,"desktop")
    # Verify keyboard movement and actual fire consumption (not just a static canvas screenshot).
    before=page.locator("#ammo").inner_text().split()[0]
    page.evaluate("""() => {
      window.__qaCanvasDown=0;
      document.querySelector('#stage').addEventListener('pointerdown',() => {window.__qaCanvasDown++});
    }""")
    element=page.evaluate("() => ({tag:document.elementFromPoint(640,360)?.tagName,id:document.elementFromPoint(640,360)?.id})")
    page.mouse.click(640,360)
    page.wait_for_timeout(1300)
    after=page.locator("#ammo").inner_text().split()[0]
    diag=page.evaluate("""() => ({
      canvasPointerDown:window.__qaCanvasDown,
      canvasTarget:document.elementFromPoint(640,360)?.id,
      overlayHidden:document.querySelector('#overlay').hidden,
      visibleHud:!document.querySelector('#hud').hidden,
      fps:document.querySelector('#fps')?.innerText
    })""")
    print("desktop pointer diagnostic",json.dumps({"element":element,"before":before,"after":after,**diag}),flush=True)
    page.screenshot(path=str(OUT/"tps-desktop-diagnostic.png"))
    check(diag["canvasPointerDown"]>=1,f"desktop: pointer event never hit canvas {diag}")
    check(int(after)<int(before),f"desktop: mouse click failed to fire {diag}, errors {err}")
    page.keyboard.down("w")
    page.wait_for_timeout(400)
    page.keyboard.up("w")
    page.screenshot(path=str(OUT/"tps-desktop-1280x720.png"))
    check(not err,f"desktop errors: {err}")
    print("desktop PASS",json.dumps({"before":before,"after":after,"canvas":page.locator("#stage").evaluate("(e)=>[e.width,e.height]")}))
    desktop.close()

    mobile=browser.new_context(viewport={"width":390,"height":844},device_scale_factor=1,is_mobile=True,has_touch=True)
    page=mobile.new_page()
    err=start(page,"mobile")
    check(page.locator("#mobileControls").is_visible(),"mobile: no touch controls")
    before=page.locator("#ammo").inner_text().split()[0]
    box=page.locator("#fire").bounding_box()
    check(box is not None and box["width"]>=64,"mobile: fire target too small")
    page.touchscreen.tap(box["x"]+box["width"]/2,box["y"]+box["height"]/2)
    # Software SwiftShader on hosted CI can render fewer than 5 frames/sec.
    # Wait for an actual gameplay state change instead of guessing a 320 ms frame budget.
    page.wait_for_function(
        "(ammo) => parseInt(document.querySelector('#ammo').textContent,10)<ammo",
        arg=int(before),timeout=12000)
    after=page.locator("#ammo").inner_text().split()[0]
    check(int(after)<int(before),"mobile: fire button did not consume ammo")
    fit=page.evaluate("""() => {
      const l=document.querySelector('.healthWrap').getBoundingClientRect();
      const r=document.querySelector('#ammo').getBoundingClientRect();
      return {viewport:innerWidth,scrollW:document.documentElement.scrollWidth,
        scrollH:document.documentElement.scrollHeight,viewH:innerHeight,
        hudFit:l.right<r.left+2,fireVisible:document.querySelector('#fire').getBoundingClientRect().right<=innerWidth};
    }""")
    check(fit["scrollW"]<=fit["viewport"]+1 and fit["scrollH"]<=fit["viewH"]+1,f"mobile: unwanted scrolling {fit}")
    check(fit["hudFit"] and fit["fireVisible"],f"mobile: HUD overlap or clipped fire button {fit}")
    page.screenshot(path=str(OUT/"tps-mobile-390x844.png"))
    check(not err,f"mobile errors: {err}")
    print("mobile PASS",json.dumps({"before":before,"after":after,**fit},ensure_ascii=False))
    mobile.close()

    # Test landscape separately: one-screen HUD and thumb reach on a short mobile viewport.
    landscape=browser.new_context(viewport={"width":844,"height":390},device_scale_factor=1,is_mobile=True,has_touch=True)
    page=landscape.new_page()
    err=start(page,"landscape")
    check(page.locator("#mobileControls").is_visible(),"landscape touch controls missing")
    fit=page.evaluate("""() => {
       const left=document.querySelector('.healthWrap').getBoundingClientRect();
       const right=document.querySelector('#ammo').getBoundingClientRect();
       const fire=document.querySelector('#fire').getBoundingClientRect();
       const stick=document.querySelector('#stickBase').getBoundingClientRect();
       return {scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,
         width:innerWidth,height:innerHeight,noOverlap:left.right<right.left,
         fireFits:fire.right<=innerWidth&&fire.bottom<=innerHeight,stickFits:stick.left>=0&&stick.bottom<=innerHeight};
    }""")
    check(fit["scrollW"]<=fit["width"]+1 and fit["scrollH"]<=fit["height"]+1,
          f"landscape has unwanted scrolling: {fit}")
    check(fit["noOverlap"] and fit["fireFits"] and fit["stickFits"],
          f"landscape controls or HUD clipped: {fit}")
    check(not err,f"landscape JavaScript errors {err}")
    page.screenshot(path=str(OUT/"tps-landscape-844x390.png"))
    print("landscape PASS",json.dumps(fit),flush=True)
    landscape.close()
    browser.close()
print("TPS browser QA passed both desktop and mobile.")
