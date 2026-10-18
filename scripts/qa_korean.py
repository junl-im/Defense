"""Korean UI browser QA on desktop/mobile: real scene, panels, help and Korean labels."""
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path("qa/korean")
out.mkdir(parents=True, exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(args=[
        "--use-gl=swiftshader", "--enable-webgl",
        "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader",
    ])
    for name, width, height in (("desktop",1440,900),("mobile",390,844)):
        page = browser.new_page(viewport={"width":width,"height":height})
        errors=[]
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto("http://127.0.0.1:8123/", wait_until="load", timeout=60000)
        page.wait_for_function("window.__game !== undefined", timeout=60000)
        page.wait_for_timeout(1500)
        assert page.locator("html").get_attribute("lang") == "ko"
        assert "왕국전략" in page.title()
        assert page.locator(".research-btn-name").first.inner_text() == "농업"
        assert "정착지" in page.locator("#hud-tier-name").inner_text()
        assert page.locator("#help-btn").is_visible()
        goal=page.locator("#slg-tutorial")
        assert goal.is_visible(), f"{name}: Korean tutorial missing"
        assert goal.get_attribute("data-step") == "first_land"
        assert "처음 영토 확장" in goal.inner_text()
        page.locator(".slg-tutorial-fold").click()
        assert "slg-tutorial-collapsed" in goal.get_attribute("class")
        page.locator(".slg-tutorial-fold").click()
        assert "slg-tutorial-collapsed" not in goal.get_attribute("class")
        if name == "mobile":
            page.locator("#slg-tutorial-go").click()
            assert page.locator("#hud-right").is_visible(), "Tutorial should open construction menu"
            page.locator("#slg-mobile-dock button[data-panel='map']").click()
            assert not page.locator("#research-panel").is_visible()
            assert not page.locator("#faction-panel").is_visible()
            assert not page.locator("#hud-right").is_visible()
            page.screenshot(path=str(out/"mobile-map.png"), full_page=True)
            for item, target in (("tiles","#hud-right"),("research","#research-panel"),
                                 ("factions","#faction-panel"),("info","#hud-kingdom-panel")):
                page.locator("#slg-mobile-dock button[data-panel='"+item+"']").click()
                assert page.locator(target).is_visible(), f"missing mobile {item}"
                page.screenshot(path=str(out/("mobile-"+item+".png")), full_page=True)
            page.locator("#slg-mobile-dock button[data-panel='map']").click()
        else:
            assert page.locator("#research-panel").is_visible()
            assert page.locator("#faction-panel").is_visible()
            page.screenshot(path=str(out/"desktop.png"), full_page=True)
        page.locator("#help-btn").click()
        dialog=page.locator("#ko-game-guide [role='dialog']")
        assert dialog.is_visible()
        assert "게임 방법" in dialog.inner_text()
        assert "영토 확장" in dialog.inner_text()
        page.screenshot(path=str(out/(name+"-guide.png")), full_page=True)
        page.locator(".ko-guide-start").click()
        assert not dialog.is_visible()
        # A normal forest placement advances the tutorial without granting
        # free resources or counting hostile AI territory.
        page.evaluate("() => window.__game.placeTile(1, 0)")
        page.wait_for_function("document.querySelector('#slg-tutorial').dataset.step === 'field'")
        assert "식량 생산 기반" in goal.inner_text()
        visible=page.locator("body").inner_text()
        leftover=sorted(set(re.findall(r"(?<![가-힣A-Za-z])[A-Za-z]{3,}(?![A-Za-z])",visible)))
        assert not leftover, f"{name} visible English: {leftover}"
        assert not errors, f"{name} browser error: {errors}"
        print("PASS",name,"Korean first-play, panels, help dialog, map and no English UI",flush=True)
        page.close()
    browser.close()
