"""PC and mobile end-to-end backup, import, undo and high-DPI WebGL QA."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from time import sleep

out = Path("qa/backup")
out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(args=[
        "--use-gl=swiftshader", "--enable-webgl",
        "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
    for device, width, height in (("desktop", 1440,900), ("mobile",390,844)):
        context=browser.new_context(viewport={"width":width,"height":height},
            device_scale_factor=3,accept_downloads=True)
        page=context.new_page()
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        page.goto("http://127.0.0.1:8123/",wait_until="load",timeout=60000)
        page.wait_for_function("window.__game?.tilesPlaced===1",timeout=60000)
        page.locator('#loading-screen').wait_for(state='detached',timeout=15000)
        ratio=page.evaluate("window.__game.renderer.getPixelRatio()")
        assert ratio<= (1.25 if device=="mobile" else 2.0)
        shadow=page.evaluate("window.__game.sun.shadow.mapSize.x")
        assert shadow==(1024 if device=="mobile" else 2048)
        preflight=page.evaluate("""async () => {
            const m=await import('/src/systems/SaveBackups.js');
            const raw=localStorage.getItem('kingdom-tiles-save-v2');
            try { return {ok:true,tiles:m.validateBackup(raw).cells.length}; }
            catch(e) { const d=JSON.parse(raw); return {ok:false,error:e.message,
                tiles:d.tilesPlaced,cells:d.cells.length,
                initial:d.cells.slice(0,3),keys:Object.keys(d)}; }
        }""")
        assert preflight["ok"], f"Real save does not pass validator: {preflight}"
        page.locator("#rani-go-world").click()
        page.locator("#save-manager-btn").click()
        dialog=page.locator("#save-manager-overlay [role='dialog']")
        assert dialog.is_visible()
        assert "왕국 저장 관리" in dialog.inner_text()
        assert page.locator("#save-undo").is_disabled()
        with page.expect_download() as info:
            page.locator("#save-export").click()
        download=info.value
        assert download.suggested_filename.startswith("라니킹덤-저장-")
        path=out/(device+"-initial-save.json")
        download.save_as(str(path))
        text=path.read_text(encoding="utf8")
        assert json.loads(text)["tilesPlaced"]==1
        # Failed import must not overwrite the save or offer an undo.
        page.locator("#save-import-file").set_input_files({
            "name":"broken.json","mimeType":"application/json","buffer":b"not json"})
        page.wait_for_function("document.getElementById('toast').textContent.includes('복원 실패')")
        assert page.evaluate("JSON.parse(localStorage.getItem('kingdom-tiles-save-v2')).tilesPlaced")==1
        page.locator(".save-manager-close").click()
        page.evaluate("() => window.__game.placeTile(1,0)")
        page.wait_for_function("window.__game.tilesPlaced===2")
        assert page.evaluate("JSON.parse(localStorage.getItem('kingdom-tiles-save-v2')).tilesPlaced")==2
        page.locator("#save-manager-btn").click()
        page.on("dialog",lambda d:d.accept())
        page.locator("#save-import-file").set_input_files({
            "name":"valid.json","mimeType":"application/json","buffer":text.encode("utf8")})
        page.wait_for_function("window.__game?.tilesPlaced===1",timeout=60000)
        page.locator("#rani-go-world").click()
        page.locator("#save-manager-btn").click()
        assert page.locator("#save-undo").is_enabled()
        page.locator("#save-undo").click()
        page.wait_for_function("window.__game?.tilesPlaced===2",timeout=60000)
        page.locator("#rani-go-world").click()
        page.locator("#save-manager-btn").click()
        assert page.locator("#save-undo").is_disabled()
        page.screenshot(path=str(out/(device+"-save-manager.png")),full_page=True)
        assert not errors, f"{device} browser errors: {errors}"
        print("PASS",device,"backup, invalid guard, import, undo, rendering DPR",ratio,flush=True)
        context.close()
    browser.close()
