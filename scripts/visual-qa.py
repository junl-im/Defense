#!/usr/bin/env python3
"""Actual browser screenshot QA for PC and mobile dimensions, WebGL, asset fetches."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys
output=Path("logs/qa/visual");output.mkdir(parents=True,exist_ok=True)
report=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=[
  "--no-sandbox","--disable-dev-shm-usage","--enable-webgl",
  "--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"
 ])
 for width,height,label in [(1365,768,"desktop"),(390,844,"mobile")]:
  page=browser.new_page(viewport={"width":width,"height":height},device_scale_factor=1)
  errors=[];console=[];assets=[]
  page.on("pageerror",lambda e:errors.append(str(e)))
  page.on("console",lambda e:console.append(e.type+": "+e.text))
  page.on("response",lambda response:assets.append({"url":response.url,"status":response.status}) if ".glb" in response.url else None)
  try:
   page.goto("http://127.0.0.1:4173/Defense/",wait_until="domcontentloaded",timeout=40000)
   page.wait_for_timeout(3000)
   page.screenshot(path=str(output/(label+"-menu.png")))
   page.locator("#startBtn").click()
   page.wait_for_timeout(7500)
   page.screenshot(path=str(output/(label+"-running.png")))
   units=page.locator("#units").inner_text()
   gameplay=page.evaluate("window.__defenseQa && window.__defenseQa()")
   # Pause must genuinely freeze the simulation, including under low software WebGL FPS.
   page.locator("#pauseBtn").click()
   page.wait_for_timeout(300)
   paused_before=page.evaluate("window.__defenseQa()")
   page.screenshot(path=str(output/(label+"-paused.png")))
   page.wait_for_timeout(900)
   paused_after=page.evaluate("window.__defenseQa()")
   pause_ok=(paused_before["paused"] and paused_after["paused"] and abs(paused_after["z"]-paused_before["z"])<.01 and abs(paused_after["elapsed"]-paused_before["elapsed"])<.01)
   page.locator("#resumeBtn").click()
   page.wait_for_timeout(300)
   resume_ok=(page.evaluate("window.__defenseQa().paused") is False)
   # After basic play, keep the real WebGL engine running into the boss zone.
   page.wait_for_function("window.__defenseQa && (window.__defenseQa().z>=67 || window.__defenseQa().finished)",timeout=40000)
   page.wait_for_timeout(750)
   page.screenshot(path=str(output/(label+"-boss.png")))
   boss_gameplay=page.evaluate("window.__defenseQa && window.__defenseQa()")
   webgl_failure=any("WebGL not supported" in e or "WebGL not supported" in c for e in errors for c in console)
   status="passed" if not errors and any(x["url"].endswith("medieval.glb") and x["status"]==200 for x in assets) and any(x["url"].endswith("witch.glb") and x["status"]==200 for x in assets) and gameplay and gameplay["elapsed"]>1 and gameplay["z"]>4 and gameplay.get("billboards") and gameplay.get("enemySprites",0)>=130 and gameplay.get("allySprites",0)>=10 and boss_gameplay and boss_gameplay["z"]>=67 and boss_gameplay["bossHp"]<1600 and boss_gameplay.get("attacksLaunched",0)>=1 and pause_ok and resume_ok else "failed"
   report.append({"device":label,"status":status,"units":units,"gameplay":gameplay,"boss_gameplay":boss_gameplay,"pause_ok":pause_ok,"resume_ok":resume_ok,"js_errors":errors[:10],"console_tail":console[-12:],"glb_requests":assets})
  except Exception as e:
   report.append({"device":label,"status":"failed","error":str(e)[:1000],"js_errors":errors})
  page.close()
 browser.close()
(output/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(report,ensure_ascii=False,indent=2)[:12000])
if any(i["status"]!="passed" for i in report):sys.exit(1)
