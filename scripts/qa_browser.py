"""Smoke check of the actual deployed entry point, at desktop and mobile sizes."""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8123/"
OUT = Path("qa/screenshots")
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(args=[
        "--use-gl=swiftshader",
        "--enable-webgl",
        "--ignore-gpu-blocklist",
        "--enable-unsafe-swiftshader",
    ])
    for name, width, height in (("desktop", 1440, 900), ("mobile", 390, 844)):
        page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
        issues = []
        page.on("pageerror", lambda error: issues.append(str(error)))
        page.goto(BASE, wait_until="load", timeout=60000)
        page.wait_for_function("window.__game !== undefined", timeout=60000)
        page.wait_for_timeout(2000)
        state = page.evaluate("""() => ({
          title: document.title,
          canvas: !!document.getElementById('game-canvas'),
          game: !!window.__game,
          width: window.innerWidth,
          height: window.innerHeight
        })""")
        assert state["canvas"] and state["game"], f"{name}: missing game {state}"
        assert not issues, f"{name}: page errors: {issues}"
        assert page.locator("#game-canvas").is_visible()
        assert page.locator("#rani-nav").is_visible()
        assert not page.locator("#rani-village-screen").count()
        assert page.evaluate("window.__game.mode") == "village"
        v4 = page.locator("#rani-v4-shell").count() > 0
        if v4:
            assert page.locator("#rani-v4-bottom").is_visible(), "New live navigation is missing"
            assert len(page.locator("#rani-v4-bottom button").all()) == 9, "Royal dock is incomplete"
            assert page.locator("#rani-v4-profile").is_visible(), "Royal ruler HUD is missing"
        if name == "mobile":
            if v4:
                # The replaced legacy mobile dock is intentionally hidden.
                assert not page.locator("#slg-mobile-dock").is_visible()
                assert not page.locator("#research-panel").is_visible()
                assert not page.locator("#faction-panel").is_visible()
                assert not page.locator("#hud-right").is_visible()
                page.screenshot(path=str(OUT / "kingdom-mobile-map.png"), full_page=True)
                for action, target in (("build", "#hud-right"),
                                       ("research", "#research-panel"),
                                       ("army", "#faction-panel")):
                    trigger = page.locator("#rani-v4-left [data-v4-action='" + action + "']")
                    trigger.click()
                    assert page.locator(target).is_visible(), f"New royal {action} cannot open original gameplay panel"
                    if action == "research":
                        page.screenshot(path=str(OUT / "kingdom-mobile-research.png"), full_page=True)
                    trigger.click()
                    assert not page.locator(target).is_visible(), f"New royal {action} cannot close its original panel"
                page.locator("#rani-v4-bottom [data-v4-action='field']").click()
                assert page.evaluate("window.__game.mode") == "world"
                page.locator("#rani-v4-bottom [data-v4-action='village']").click()
                assert page.evaluate("window.__game.mode") == "village"
                print("PASS v4.0 mobile: original build/research/faction panels and world/village",flush=True)
            else:
                dock = page.locator("#slg-mobile-dock")
                assert dock.is_visible(), "Legacy mobile navigation is missing"
                assert not page.locator("#research-panel").is_visible()
                assert not page.locator("#faction-panel").is_visible()
                assert not page.locator("#hud-right").is_visible()
                page.screenshot(path=str(OUT / "kingdom-mobile-map.png"), full_page=True)
                for item, target in (("tiles", "#hud-right"), ("research", "#research-panel"), ("factions", "#faction-panel")):
                    page.locator("#slg-mobile-dock button[data-panel='" + item + "']").click()
                    assert page.locator(target).is_visible(), f"Mobile {item} tab failed to open"
                    if item == "research":
                        page.screenshot(path=str(OUT / "kingdom-mobile-research.png"), full_page=True)
                page.locator("#slg-mobile-dock button[data-panel='map']").click()
                assert not page.locator("#research-panel").is_visible()
                assert not page.locator("#faction-panel").is_visible()
                assert not page.locator("#hud-right").is_visible()
                print("PASS legacy mobile dock tabs", flush=True)
        else:
            assert not page.locator("#slg-mobile-dock").is_visible(), "Mobile dock visible on desktop"
        page.screenshot(path=str(OUT / f"kingdom-{name}.png"), full_page=True)
        print(f"PASS {name} boot; {state}", flush=True)
        page.close()
    browser.close()
