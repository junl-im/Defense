"""Real Chromium validation of old, standalone 2.5D illustration UI use."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/rani-visual-v23');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
  browser=pw.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
                                    '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for label,w,h in [('desktop',1440,900),('laptop',1024,768),
                    ('mobile',390,844),('small',320,700)]:
    context=browser.new_context(viewport={'width':w,'height':h},
                                is_mobile=w<=700,has_touch=w<=700)
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function("""() => window.__game?.mode==='village' &&
      !!document.querySelector('#slg-tutorial-go') &&
      !!document.querySelector('#rani-royal-launcher')""",timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
    result=page.evaluate("""async () => {
      const ui=await import('./src/ui/GameIcons.js');
      const paths={};
      for(const key of ['village','market','port']) {
        const div=document.createElement('div');
        div.innerHTML=ui.iconHtml(key,'md');
        document.body.append(div);
        const im=div.querySelector('img.rani-raster-image');
        await im.decode();
        paths[key]={src:new URL(im.currentSrc).pathname,w:im.naturalWidth,
          h:im.naturalHeight,alt:im.getAttribute('alt'),drag:im.draggable};
        div.remove();
      }
      const button=document.querySelector('#slg-tutorial-go');
      const style=getComputedStyle(button);
      const dock=document.querySelector('#slg-mobile-dock');
      const desktop=document.querySelector('#rani-royal-launcher');
      const icon=w=>w?.querySelector('.ico-village .rani-raster-image');
      const mobile=icon(dock);
      const pc=icon(desktop);
      return {paths,
         button:{bg:style.backgroundImage,size:style.backgroundSize,
           w:button.getBoundingClientRect().width,
           h:button.getBoundingClientRect().height},
         mobile:{has:!!mobile,complete:!!mobile?.complete,width:mobile?.naturalWidth,
             path:mobile?.getAttribute('src')},
         pc:{has:!!pc,complete:!!pc?.complete,width:pc?.naturalWidth,
             path:pc?.getAttribute('src')},
         originalGame:window.__game.mode==='village' &&
           !!window.__game.grid.get(0,0).group,
         svgCount:document.querySelectorAll('svg').length};
    }""")
    assert result['originalGame'],(label,result)
    assert result['svgCount']==0,(label,'SVG forbidden')
    assert len(set(a['src'] for a in result['paths'].values()))==3,(label,result)
    assert all(a['w']==320 and a['h']==320 and not a['drag'] and
               '/assets/rani/' in a['src'] and a['alt']==''
               for a in result['paths'].values()),(label,result)
    assert 'rk_btn_royal_primary_v001.webp' in result['button']['bg'],(label,result)
    assert result['button']['size']=='contain',(label,result)
    assert result['mobile']['has'] and result['pc']['has'],(label,result)
    assert abs(result['button']['w']/result['button']['h']-2)<0.03,(label,result)
    assert not errors,(label,errors)
    page.screenshot(path=str(OUT/(label+'-kingdom-real-assets.png')),full_page=True)
    if w>700:
      # Desktop and 1024px laptop both show the actual PC kingdom dock.
      nav=page.locator('#rani-royal-launcher')
      nav.locator('[data-royal-action="research"]').click()
      assert page.locator('#research-panel').is_hidden()
      nav.locator('[data-royal-action="research"]').click()
      assert page.locator('#research-panel').is_visible()
      nav.locator('[data-royal-action="world"]').click()
      assert page.evaluate("window.__game.mode==='world'")
      nav.locator('[data-royal-action="village"]').click()
      assert page.evaluate("window.__game.mode==='village'")
    else:
      page.locator('#slg-mobile-dock [data-panel="research"]').click()
      assert page.locator('#research-panel').is_visible()
      page.locator('#slg-mobile-dock [data-panel="map"]').click()
      assert page.locator('#research-panel').is_hidden()
    print('PASS',label,'three independent building icons, 2:1 gold button, original live game navigation',flush=True)
    context.close()
  browser.close()
