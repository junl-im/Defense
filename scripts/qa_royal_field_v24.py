"""Real Chromium QA: decorative Three.js field scenery, towns and GPU lifetime."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/royal-field-v24'); OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
      '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    for label,w,h in [('desktop',1440,900),('mobile',390,844),('small',320,700)]:
        ctx=browser.new_context(viewport={'width':w,'height':h},
          has_touch=w<=700,is_mobile=w<=700)
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
        page.wait_for_function("window.__game?.mode==='village' && !!window.__game.fieldScene",
          timeout=60000)
        page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
        result=page.evaluate("""() => {
          const g=window.__game,s=g.fieldScene;
          const root=s.scene.getObjectByName('rani-royal-field-scenery');
          const counts=root.children.map(m=>m.count);
          const nonPickable=root.children.every(m=>m.userData.raniFieldVisualOnly &&
            m.isInstancedMesh && m.raycast.toString().includes('=>'));
          const oldSave=g.saveSystem.constructor.name;
          g.nativeVillageUI.setMode('world');
          const scenery=s.entries.map(e=>e.group?.getObjectByName(
            'rani-royal-field-town-dressing'));
          let disposed=0;
          scenery[0].geometry.addEventListener('dispose',()=>disposed++);
          const firstCount=s.towns.children.length;
          s.refresh();
          return {startCounts:counts,nonPickable,opened:g.mode==='world',
            originalHexes:s.territoryMeshes.reduce((n,m)=>n+m.count,0),
            towns:firstCount,decorated:scenery.every(Boolean),
            stillDecorated:s.entries.every(e=>!!e.group?.getObjectByName(
              'rani-royal-field-town-dressing')),
            merged:scenery.every(m=>m.isMesh && m.geometry.attributes.position.count>100),
            disposed,afterTowns:s.towns.children.length,
            originalSave:oldSave,svgCount:document.querySelectorAll('svg').length};
        }""")
        assert len(result['startCounts'])==4 and result['startCounts'][0]>8,(
          label,'shared trees missing',result)
        assert result['nonPickable'],(label,result)
        assert result['opened'] and result['towns']>0 and result['decorated'],(
          label,result)
        assert result['merged'] and result['stillDecorated'],(label,result)
        assert result['disposed']==1 and result['towns']==result['afterTowns'],(
          label,'town geometry leaked on refresh',result)
        assert result['svgCount']==0,(label,'SVG forbidden',result)
        assert result['originalSave']=='SaveSystem',(label,result)
        assert not errors,(label,errors)
        page.screenshot(path=str(OUT/(label+'-real-royal-field.png')),full_page=True)
        page.evaluate("window.__game.nativeVillageUI.setMode('village')")
        assert page.evaluate("window.__game.mode==='village'"),(label,'cannot return home')
        print('PASS',label,'real field trees, actual town heraldry, GPU cleanup, return home',flush=True)
        ctx.close()
    browser.close()
