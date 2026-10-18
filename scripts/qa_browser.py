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
        page.locator('#loading-screen').wait_for(state='detached',timeout=15000)
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
        assert page.locator("#rani-village-screen").is_visible(), "Village should be the first screen"
        assert page.locator("#rani-village-grid .rani-village-tile").count() == 9
        page.screenshot(path=str(OUT / f"rani-village-{name}.png"), full_page=True)
        page.locator("#rani-go-world").click()
        assert page.evaluate("window.__game.mode") == "world"
        if name == "mobile":
            dock = page.locator("#slg-mobile-dock")
            assert dock.is_visible(), "Mobile navigation is missing"
            assert not page.locator("#research-panel").is_visible(), "Research obscures map by default"
            assert not page.locator("#faction-panel").is_visible(), "Factions obscure map by default"
            assert not page.locator("#hud-right").is_visible(), "Tile shop obscures map by default"
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
            print("PASS mobile dock tabs: tiles/research/factions/map", flush=True)
        else:
            assert not page.locator("#slg-mobile-dock").is_visible(), "Mobile dock visible on desktop"
        page.screenshot(path=str(OUT / f"kingdom-{name}.png"), full_page=True)
        print(f"PASS {name} boot; {state}", flush=True)
        page.close()
    browser.close()
