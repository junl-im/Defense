#!/usr/bin/env python3
"""Generate transparent PNG billboards from licensed glTF models in the actual WebGL renderer."""
from playwright.sync_api import sync_playwright
from PIL import Image
from pathlib import Path
import json
out=Path('public/assets/sprites')
out.mkdir(parents=True,exist_ok=True)
reports=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for model,name in [('soldier','ally-female.png'),('witch','enemy-female.png')]:
  page=browser.new_page(viewport={'width':384,'height':512},device_scale_factor=1)
  url=f'http://127.0.0.1:4173/Defense/sprite-preview.html?model={model}'
  page_errors=[]
  page.on('pageerror',lambda e:page_errors.append(str(e)))
  response=page.goto(url,wait_until='domcontentloaded',timeout=60000)
  print('sprite page',model,'HTTP',response.status if response else 'none',flush=True)
  try:
   try:
    page.wait_for_function('window.__spriteStatus && (window.__spriteStatus.ready || window.__spriteStatus.error)',timeout=45000)
   except Exception:
    print('sprite timeout',model,'page_errors',page_errors,'status',page.evaluate('window.__spriteStatus'),'html',page.content()[:500],flush=True)
    page.screenshot(path=str(out/(model+'-failed.png')))
    raise
   status=page.evaluate('window.__spriteStatus')
   if status['error']:raise RuntimeError(status['error'])
   path=out/name
   page.locator('canvas#render').screenshot(path=str(path),animations='disabled')
   img=Image.open(path).convert('RGBA')
   alphas=img.getchannel('A').getextrema()
   visible=sum(1 for val in img.getchannel('A').getdata() if val>64)
   if visible<1800 or alphas[0]!=0:raise RuntimeError(f'Unexpected PNG transparency/empty render: {name} alpha={alphas} pixels={visible}')
   reports.append({'model':model,'file':str(path),'resolution':img.size,'alpha_min_max':alphas,'opaque_pixels':visible,'bytes':path.stat().st_size,'status':'generated_from_original_GL_B'})
  finally:page.close()
 browser.close()
Path('docs/SPRITE_GENERATION.json').write_text(json.dumps(reports,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(reports,indent=2,ensure_ascii=False))
