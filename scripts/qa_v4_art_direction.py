"""Real Chromium v4.0 UI and actual projected WebP village building art."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/visual-v40')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
  browser=pw.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
   '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for label,w,h in [('desktop',1440,900),('laptop',1024,768),
                    ('mobile',390,844),('small',320,700)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},
      is_mobile=w<=700,has_touch=w<=700)
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function("""()=>window.__game?.mode==='village'
      && !!window.__game.grid.get(0,0)?.group
      && !!window.__game.raniV4Hud && !!window.__game.raniV4WorldArt""",timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=40000)
    initial=page.evaluate("""()=>{
      const game=window.__game;
      return {
       resourceCount:document.querySelectorAll('#hud-top-bar [data-res]').length,
       profile:document.querySelector('#rani-v4-profile')?.textContent,
       left:[...document.querySelectorAll('#rani-v4-left button')].map(b=>b.dataset.v4Action),
       right:[...document.querySelectorAll('#rani-v4-right button')].map(b=>b.dataset.v4Action),
       bottom:[...document.querySelectorAll('#rani-v4-bottom button')].map(b=>b.dataset.v4Action),
       disabled:[...document.querySelectorAll('#rani-v4-shell button:disabled')].map(b=>b.dataset.v4Action),
       queue:[...document.querySelectorAll('#rani-v4-queues .rani-v4-queue-item')].map(x=>x.dataset.queue),
       canvas:!!game.grid.get(0,0).group,
       svg:document.querySelectorAll('svg').length,
       worldLayer:!!document.querySelector('#rani-v4-world-art'),
       realHudImages:[...document.querySelectorAll('#hud-top-bar .rani-raster-image')].map(x=>x.naturalWidth)
      };
    }""")
    assert initial['resourceCount']==5,(label,initial)
    assert initial['left']==['build','research','train','army','alliance'],(label,initial)
    assert initial['right']==['events','rewards','quests','ranking'],(label,initial)
    assert initial['bottom']==['map','field','village','army','bag',
                               'achievements','shop','harbor','explore'],(label,initial)
    assert set(initial['disabled'])=={'rewards','ranking','bag','achievements'},(label,initial)
    assert initial['queue']==['construction','research','army'],(label,initial)
    assert initial['worldLayer'] and initial['canvas'] and initial['svg']==0,(label,initial)
    assert len(initial['realHudImages'])==5 and all(x>0 for x in initial['realHudImages']),(label,initial)
    # A visible action MUST invoke the real existing launcher and panels.
    if w>=701:
      prev=page.evaluate("document.body.classList.contains('royal-hide-research')")
      page.locator('#rani-v4-left [data-v4-action="research"]').click()
      assert page.evaluate("document.body.classList.contains('royal-hide-research')") !=prev,label
      page.locator('#rani-v4-left [data-v4-action="research"]').click()
      assert page.evaluate("document.body.classList.contains('royal-hide-research')")==prev,label
    page.locator('#rani-v4-bottom [data-v4-action="field"]').click(force=True)
    assert page.evaluate("window.__game.mode==='world'"),label
    page.locator('#rani-v4-bottom [data-v4-action="village"]').click(force=True)
    assert page.evaluate("window.__game.mode==='village'"),label
    page.locator('#rani-v4-top-actions [data-v4-action="menu"]').click(force=True)
    assert page.locator('#rani-shell-menu').is_visible(),label
    page.locator('#rani-shell-menu [data-shell-action="back"]').click()
    assert page.locator('#rani-shell-menu').is_hidden(),label
    # TEST-ONLY visual record: synthetic in-memory market at a real 3D
    # coordinate. Do not spend, save or persist, and restore before leaving.
    stage=page.evaluate("""async()=>{
      const THREE=await import('three');
      const game=window.__game;
      const cell=game.grid.get(0,0);
      const key='0,0';
      const original=game.buildingSystem.byCell.get(key);
      const group=new THREE.Group();
      group.position.set(.2,.12,.1);cell.group.add(group);
      const rec={id:'market',slot:888,done:true,
        visual:{done:true,group}};
      const current=original?[...original,rec]:[rec];
      game.buildingSystem.byCell.set(key,current);
      game.raniV4WorldArt.refresh();
      return {
        group:!!group.parent,oldLength:original?.length||0,
        newLength:current.length,
        keys:[...game.raniV4WorldArt.slots.keys()],
        rawCanvas:document.getElementById('game-canvas').getBoundingClientRect().width
      };
    }""")
    assert any('market' in k for k in stage['keys']),(label,stage)
    page.wait_for_function("""()=>[...document.querySelectorAll(
      '#rani-v4-world-art .rani-v4-world-sprite img')]
      .some(x=>x.complete&&x.naturalWidth>0)""",timeout=15000)
    page.wait_for_timeout(700)
    status=page.evaluate("""()=>{
      const g=window.__game;
      const sprite=[...document.querySelectorAll('.rani-v4-world-sprite')]
        .find(x=>x.dataset.building==='market');
      return {
       loaded:!!sprite?.querySelector('img')?.naturalWidth,
       shown:!!sprite&&!sprite.hidden,
       width:sprite?.getBoundingClientRect().width,
       realModelHidden:[...g.raniV4WorldArt.slots.values()]
         .some(x=>x.visual?.group&&!x.visual.group.visible)
      };
    }""")
    assert status['loaded'] and status['shown'] and status['width']>30,(label,status)
    assert status['realModelHidden'],(label,status)
    # Verify UI responds to original game data, not example fake resources.
    before=page.locator('#rani-v4-power').inner_text()
    assert '전투력' in before,label
    page.screenshot(path=str(OUT/(label+'-royal-main-ui-with-existing-market-art.png')),full_page=True)
    page.evaluate("""()=>{
      const g=window.__game,cell=g.grid.get(0,0), key='0,0';
      const list=g.buildingSystem.byCell.get(key)||[];
      const idx=list.findIndex(x=>x.slot===888);
      const visual=idx>=0?list[idx].visual:null;
      if(idx>=0)list.splice(idx,1);
      if(!list.length)g.buildingSystem.byCell.delete(key);
      if(visual?.group?.parent)visual.group.parent.remove(visual.group);
      g.raniV4WorldArt.refresh();
    }""")
    assert not errors,(label,errors)
    print('PASS',label,'interactive royal HUD and true 3D-space original 320px WebP world art',flush=True)
    ctx.close()
  browser.close()
