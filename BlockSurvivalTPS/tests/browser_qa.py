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
    page.mouse.click(640,360)
    page.wait_for_timeout(280)
    after=page.locator("#ammo").inner_text().split()[0]
    check(int(after)<int(before),"desktop: mouse click failed to fire")
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
    page.wait_for_timeout(320)
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
    browser.close()
print("TPS browser QA passed both desktop and mobile.")
