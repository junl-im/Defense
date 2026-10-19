"""v2.5 asset wiring smoke: original art and existing game load across screens.
This is read-only runtime QA: no edits to saves or source graphics.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/asset-integrity-v25')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
  browser=pw.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
                                    '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for label,w,h in [('desktop',1440,900),('laptop',1024,768),
                    ('mobile',390,844),('small',320,700)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},
        has_touch=w<=700,is_mobile=w<=700)
    page=ctx.new_page()
    errors=[]
    failed=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.on('response',lambda response:failed.append({
        'url':response.url,'status':response.status
      }) if response.status>=400 and '/assets/' in response.url else None)
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function("""() => window.__game?.mode==='village'
      && !!window.__game.grid.get(0,0)?.group
      && document.querySelectorAll('#hud-top-bar .rani-raster-image').length===5
      && !!document.getElementById('rani-royal-launcher')""",timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
    result=page.evaluate("""async () => {
      const registry=await import('./src/ui/RaniAssetRegistry.js');
      const icons=await import('./src/ui/GameIcons.js');
      const g=window.__game;
      const oldState={
        tiles:g.tilesPlaced,
        villageLevel:g.nativeVillage.level,
        cells:g.grid.cells.size
      };
      const images=[...document.querySelectorAll('#hud-top-bar .rani-raster-image')];
      await Promise.all(images.map(i=>i.decode()));
      const scenes=g.fieldScene;
      const hasTownModel=!!g.grid.get(0,0)?.group;
      const glyphPaths={};
      for(const kind of ['village','market','port']){
        const wrapper=document.createElement('div');
        wrapper.innerHTML=icons.iconHtml(kind);
        document.body.appendChild(wrapper);
        const img=wrapper.querySelector('img');
        await img.decode();
        glyphPaths[kind]={url:new URL(img.currentSrc).pathname,width:img.naturalWidth};
        wrapper.remove();
      }
      const displayedPaths=images.map(i=>new URL(i.currentSrc).pathname);
      const preservedPaths=registry.RANI_ALL_ASSET_PATHS;
      const loadCheck=[];
      // Compare every preserved original's served byte length to v2.5 lock.
      // One full check is enough; all sizes separately check live HUD and UI.
      if(innerWidth>=1400){
        const lock=await (await fetch('assets/rani/asset-integrity-lock-v25.json')).json();
        for(const f of lock.protectedFiles){
          const response=await fetch(f.path);
          const bytes=await response.arrayBuffer();
          loadCheck.push({path:f.path,ok:response.ok,size:bytes.byteLength,
            expected:f.bytes});
        }
      }
      const initial=JSON.stringify(oldState);
      g.nativeVillageUI.setMode('world');
      const fieldOpen=g.mode==='world' &&
        scenes.royalScenery?.children.length===4 &&
        scenes.towns.children.length>0;
      g.nativeVillageUI.setMode('village');
      const returned=g.mode==='village' &&
        JSON.stringify({tiles:g.tilesPlaced,villageLevel:g.nativeVillage.level,
          cells:g.grid.cells.size})===initial;
      return {
        label:document.title,
        headerNames:[...document.querySelectorAll('#hud-top-bar .rani-raster-image')]
          .map(i=>i.naturalWidth),
        displayedPaths,glyphPaths,loadCheck,fieldOpen,returned,hasTownModel,
        oldGraphics:!!g.grid.get(0,0).group.getObjectByName('rani-royal-tile-dressing'),
        svgCount:document.querySelectorAll('svg').length,
        unusedFrame:registry.RANI_PREPARED_ASSETS.hudPanel.includes('rk_panel_royal_hud')
      };
    }""")
    assert result['hasTownModel'] and result['oldGraphics'],(label,result)
    assert result['unusedFrame'] and result['fieldOpen'] and result['returned'],(label,result)
    assert result['svgCount']==0,(label,'SVG regression',result)
    assert len(set(result['displayedPaths']))==5,(label,'resource duplicates',result)
    assert all(n==192 for n in result['headerNames']),(label,'old icons missing',result)
    assert len({v['url'] for v in result['glyphPaths'].values()})==3
    assert all(v['width']==320 for v in result['glyphPaths'].values())
    if label=='desktop':
      assert len(result['loadCheck'])==16,result
      assert all(v['ok'] and v['size']==v['expected'] for v in result['loadCheck']),result
    assert not failed,(label,'missing asset urls',failed)
    assert not errors,(label,errors)
    page.screenshot(path=str(OUT/(label+'-preserved-village.png')),full_page=True)
    print('PASS',label,'original raster/3D, preserved path+bytes, field/village, no SVG',flush=True)
    ctx.close()
  browser.close()
