"""One-tap construction on genuine 3D frontier + compact mobile toggle regression."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/quick-build')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
  browser=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl',
                                  '--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for label,w,h in [('desktop',1440,900),('mobile',390,844),('small-mobile',320,700)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},has_touch=(w<=700),is_mobile=(w<=700))
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8123/',wait_until='load',timeout=60000)
    page.wait_for_function('window.__game?.quickBuildMenu',timeout=60000)
    page.locator('#loading-screen').wait_for(state='detached',timeout=20000)
    assert page.locator('#game-canvas').is_visible()
    page.evaluate("""() => {
      const g=window.__game;
      g.resourceSystem.grant({wood:100,stone:70,gold:60,food:60},'품질 테스트');
      g._originalPick=g._pointerToCell.bind(g);
      g._pointerToCell=()=>({q:1,r:0});
      g.controls.moved=false;
    }""")
    # Synthesize a real PointerEvent with button=0, not a generic DOM Event.
    page.evaluate("""([x,y]) => {const canvas=document.getElementById('game-canvas');canvas.dispatchEvent(new PointerEvent('pointerdown',{button:0,buttons:1,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));canvas.dispatchEvent(new PointerEvent('pointerup',{button:0,buttons:0,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));}""",[int(w/2),int(h/2)])
    assert page.locator('#radial-menu .radial-center').is_visible(), 'Short tap did not show hex radial'
    assert page.evaluate('window.__game.radialMenu.empty?.q===1')
    assert page.locator('button[data-action-id="combo:lumber_mill"]').is_visible()
    assert page.locator('button[data-action-id="tile:forest"]').is_visible()
    assert page.locator('#rani-quick-build').count()==0
    # Same tile is a real open/close toggle.
    page.evaluate("""([x,y]) => {const canvas=document.getElementById('game-canvas');canvas.dispatchEvent(new PointerEvent('pointerdown',{button:0,buttons:1,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));canvas.dispatchEvent(new PointerEvent('pointerup',{button:0,buttons:0,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));}""",[int(w/2),int(h/2)])
    assert page.locator('#radial-menu.hidden').count()==1
    page.evaluate("""([x,y]) => {const canvas=document.getElementById('game-canvas');canvas.dispatchEvent(new PointerEvent('pointerdown',{button:0,buttons:1,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));canvas.dispatchEvent(new PointerEvent('pointerup',{button:0,buttons:0,clientX:x,clientY:y,bubbles:true,pointerId:1,pointerType:'touch'}));}""",[int(w/2),int(h/2)])
    assert page.locator('#radial-menu .radial-center').is_visible()
    # First village tier may unlock only <=5 plans. In that case, a
    # redundant page arrow would be a UX defect; higher tiers can have pages.
    if page.locator('button[data-action-id="next-page"]').count():
      first=page.locator('#radial-menu .radial-center').inner_text()
      page.locator('button[data-action-id="next-page"]').click()
      assert page.locator('#radial-menu .radial-center').inner_text()!=first
      for _ in range(8):
        if page.locator('button[data-action-id="combo:lumber_mill"]').count(): break
        page.locator('button[data-action-id="next-page"]').click()
    assert page.locator('button[data-action-id="combo:lumber_mill"]').is_visible()
    page.screenshot(path=str(OUT/(label+'-context.png')),full_page=True)
    before=page.evaluate('window.__game.tilesPlaced')
    # A rapid deliberate follow-up click is not the old synthetic ghost click.
    # Prime the guard as though the ring was opened milliseconds ago: an
    # actual pointerdown on a build action must clear it before click.
    page.evaluate("() => window.__game.radialMenu.blockSyntheticActivation(1)")
    page.locator('button[data-action-id="combo:lumber_mill"]').click()
    assert page.evaluate('window.__game.radialMenu._blockedActivation===null'),(
      'Deliberate second tap must cancel the stale ghost-click guard')
    assert page.evaluate('window.__game.tilesPlaced')==before+1
    assert page.evaluate("window.__game.grid.get(1,0)?.tileType")=='forest'
    assert page.evaluate("window.__game.buildingSystem.buildingsOn(window.__game.grid.get(1,0)).some(b=>b.id==='lumber_mill'&&!b.done)")
    assert page.locator('#radial-menu.hidden').count()==1
    # After choosing a building, construction persists, but ALL context menus
    # close instead of reopening the radial popup on the newly placed hex.
    assert page.evaluate("window.__game.selection.cell===null")
    assert page.locator('#radial-menu.hidden').count()==1, (
      'Construction incorrectly reopened the selected-hex information popup')
    t0=page.evaluate("""() => {
      const g=window.__game;
      return g.buildingSystem.buildingsOn(g.grid.get(1,0)).find(b=>b.id==='lumber_mill').remaining;
    }""")
    page.wait_for_timeout(300)
    t1=page.evaluate("""() => {
      const g=window.__game;
      return g.buildingSystem.buildingsOn(g.grid.get(1,0)).find(b=>b.id==='lumber_mill').remaining;
    }""")
    assert t1 < t0, 'Closing the build UI must not pause building construction'
    assert page.evaluate("JSON.parse(localStorage.getItem('kingdom-tiles-save-v2')).buildings.cells.some(c=>c.key==='1,0')")
    if w<=700:
      dock=page.locator('#slg-mobile-dock')
      assert dock.is_visible()
      for key in ['tiles','research','factions','info']:
        button=dock.locator('button[data-panel="'+key+'"]')
        button.click()
        assert page.evaluate('document.body.dataset.activeSlgPanel')==key
        button.click()
        assert page.evaluate('document.body.dataset.activeSlgPanel')=='map'
      assert page.locator('#radial-menu.hidden').count()==1
      nav=page.locator('#rani-nav-toggle')
      assert nav.is_visible()
      tutorial=page.locator('#slg-tutorial').bounding_box()
      nav_box=page.locator('#rani-nav').bounding_box()
      assert tutorial and nav_box
      apart=(tutorial['x']+tutorial['width']<=nav_box['x'] or
        nav_box['x']+nav_box['width']<=tutorial['x'] or
        tutorial['y']+tutorial['height']<=nav_box['y'] or
        nav_box['y']+nav_box['height']<=tutorial['y'])
      assert apart,('Tutorial overlaps bottom management',tutorial,nav_box)
      nav.click()
      assert nav.get_attribute('aria-expanded')=='true'
      assert page.locator('#rani-native-world').is_visible()
      nav.click()
      assert nav.get_attribute('aria-expanded')=='false'
      assert page.locator('#slg-mobile-dock button[data-panel="map"]').inner_text().find('마을')>=0
      assert not page.locator('#game-title').is_visible()
    # One short tap on the completed 3D tile should open the EXISTING info/radial action sheet.
    page.evaluate("window.__game._pointerToCell=()=>({q:1,r:0})")
    page.evaluate("""([x,y]) => {let c=document.getElementById('game-canvas');
      c.dispatchEvent(new PointerEvent('pointerdown',{button:0,pointerId:2,pointerType:'touch',clientX:x,clientY:y,bubbles:true}));
      c.dispatchEvent(new PointerEvent('pointerup',{button:0,pointerId:2,pointerType:'touch',clientX:x,clientY:y,bubbles:true}));}""",[int(w/2),int(h/2)])
    assert page.evaluate("window.__game.selection.cell?.q === 1"),'Building single tap should select immediately'
    assert page.locator('#radial-menu:not(.hidden)').count()==1, 'Tile actions were not rebuilt on tap'
    # The original PC radial ring is positioned with absolute children; its
    # wrapper has zero size, so checking wrapper.is_visible() is misleading.
    assert page.locator('#radial-menu .radial-center').is_visible(), 'Tile detail must be visible'
    # v1.1: original 3D-hex anchored radial, never a 3-column bottom list.
    radial_style=page.evaluate("""() => {
      const root=document.querySelector('#radial-menu');
      const button=root.querySelector('.radial-btn');
      return {display:getComputedStyle(root).display,
        buttonCount:root.querySelectorAll('.radial-btn').length,
        buttonPosition:button?getComputedStyle(button).position:'missing',
        bottom:getComputedStyle(root).bottom};
    }""")
    assert radial_style['display']!='grid' and radial_style['buttonPosition']=='absolute', (
      'Original hex radial style not restored',radial_style)
    # Display Korean building name and construction % rather than raw icon IDs.
    page.evaluate("""() => {
      const game=window.__game;
      game.radialMenu?._refreshProgress();
    }""")
    progress=page.locator('#radial-progress').text_content() or ''
    assert '건설' in progress and 'lumber_mill' not in progress, (
      'Construction percentage should use a Korean building name',progress)
    # v1.2: the selected model anchor and the ring's computed CSS position MUST
    # agree pixel-for-pixel, including on 320px mobile screens and while panning.
    position=page.evaluate("""() => {
      const g=window.__game, cell=g.grid.get(1,0);
      const Vector3=g.camera.position.constructor;
      const p=cell.group.position.clone().add(new Vector3(.18,.62,-.13));
      g.selection.select(cell,p,'lumber_mill');
      g.radialMenu.update();
      const projected=p.clone().project(g.camera);
      const root=document.querySelector('#radial-menu'), css=getComputedStyle(root);
      return {expectedX:(projected.x*.5+.5)*innerWidth,
        expectedY:(-projected.y*.5+.5)*innerHeight,
        actualX:parseFloat(css.left), actualY:parseFloat(css.top),
        title:root.querySelector('.radial-title')?.textContent};
    }""")
    assert abs(position['actualX']-position['expectedX'])<2, ('X anchor drift',position)
    assert abs(position['actualY']-position['expectedY'])<2, ('Y anchor drift',position)
    assert position['title']=='벌목장',('Building title is not from selected building',position)
    page.evaluate("""() => {
      const g=window.__game;
      g.controls.target.set(1,0,1);
      g.controls.targetGoal.set(1,0,1);
      g.controls._apply(1);
      g.radialMenu.update();
    }""")
    moved=page.evaluate("""() => {
      const g=window.__game, p=g.selection.anchor.clone().project(g.camera),
        css=getComputedStyle(document.getElementById('radial-menu'));
      return {x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight,
        left:parseFloat(css.left),top:parseFloat(css.top)};
    }""")
    assert abs(moved['left']-moved['x'])<2 and abs(moved['top']-moved['y'])<2, (
      'Ring does not follow the chosen building while the camera pans',moved)
    # Real native mouse click or touch tap, with no held press and no picking stub.
    page.evaluate("""() => {
      const g=window.__game;
      g.selection.clear();
      g._pointerToCell=g._originalPick;
      g.controls.target.set(0,0,0);
      g.controls.targetGoal.set(0,0,0);
      g.controls._apply(1);
    }""")
    xy=page.evaluate("""() => {
      const g=window.__game,p=g.grid.get(0,0).group.position.clone();
      p.y=.22;g.camera.updateMatrixWorld();p.project(g.camera);
      return [(p.x*.5+.5)*innerWidth,(-p.y*.5+.5)*innerHeight];
    }""")
    page.evaluate("""() => {
      window.__tapTrace=[];
      const c=document.getElementById('game-canvas');
      for(const name of ['pointerdown','pointermove','pointerup','touchstart','touchend','click'])
        document.addEventListener(name,e=>{
          if(window.__tapTrace.length<30)window.__tapTrace.push({
            type:name,button:e.button,pointerId:e.pointerId,target:e.target?.id||e.target?.tagName,
            x:e.clientX,y:e.clientY,touches:e.touches?.length});
        },{capture:true});
    }""")
    if w<=700: page.touchscreen.tap(*xy)
    else: page.mouse.click(*xy)
    debug=page.evaluate("""([x,y]) => {
      const g=window.__game;
      return {trace:window.__tapTrace,selected:g.selection.cell?.q+','+g.selection.cell?.r,
        quick:g.quickBuildMenu.current, mode:g.mode,
        point:document.elementFromPoint(x,y)?.id,
        radial:{display:document.querySelector('#radial-menu')?.className,
          title:document.querySelector('#radial-menu .radial-title')?.textContent},
        lastTap:g._lastTapHandled,clickBlock:g._blockSyntheticClickUntil,
        pointers:[...g._touchPointers],cameraMoved:g.controls.moved};
    }""",xy)
    assert page.locator('#radial-menu .radial-center').is_visible(),('Real short tap failed',xy,debug)
    assert page.evaluate("window.__game.selection.cell?.q===0&&window.__game.selection.cell?.r===0")
    hud=page.locator('#hud-top-bar').bounding_box()
    score=page.locator('#score-panel').bounding_box()
    assert hud and score and score['y']>=hud['y']+hud['height']-2,(
      'Score overlaps the top HUD',hud,score)
    assert score['y']-(hud['y']+hud['height'])<=16,(
      'Excessive vertical gap between top HUD and score',hud,score)
    if w<=700:
      nav=page.locator('#rani-nav').bounding_box()
      dock=page.locator('#slg-mobile-dock').bounding_box()
      assert 0<=dock['y']-(nav['y']+nav['height'])<=17,(
        'Field management must sit above the bottom dock',nav,dock)
    # A real one-tap on blank 3D ground must ALSO open the same radial and
    # survive the browser's synthetic follow-up click.
    candidate=page.evaluate("""() => {
      const g=window.__game;
      g.selection.clear();
      g.quickBuildMenu.close();
      g.camera.updateMatrixWorld();
      for(let q=-1;q<=1;q++)for(let r=-1;r<=1;r++){
        if(g.grid.has(q,r)||!g.grid.canPlace(q,r)||!g.nativeVillage.allows(q,r))continue;
        const V=g.camera.position.constructor;
        const p=new V(Math.sqrt(3)*q+Math.sqrt(3)/2*r,0,1.5*r).project(g.camera);
        const x=(p.x*.5+.5)*innerWidth,y=(-p.y*.5+.5)*innerHeight;
        if(x>40&&x<innerWidth-40&&y>175&&y<innerHeight-120 &&
           document.elementFromPoint(x,y)?.id==='game-canvas')return {q,r,x,y};
      }
      return null;
    }""")
    assert candidate, 'No actual unoccupied visible and tappable hex could be found'
    if w<=700: page.touchscreen.tap(candidate['x'],candidate['y'])
    else: page.mouse.click(candidate['x'],candidate['y'])
    assert page.locator('#radial-menu .radial-center').is_visible(),(
      'Native click on blank hex did not open/stay on radial',candidate)
    assert page.evaluate('window.__game.radialMenu.empty?.q')==candidate['q']
    assert page.evaluate('window.__game.radialMenu.empty?.r')==candidate['r']
    # v1.4: a held pointer and ordinary interactions postpone closing.
    # Fast-forward only the UI idle clock; no 15s browser sleeps and no
    # changes to the real BuildingSystem update loop.
    state=page.evaluate("""() => {
      const g=window.__game, menu=g.radialMenu;
      const t=performance.now();
      menu.lastInteractionAt=t-menu.idleTimeoutMs-1;
      document.dispatchEvent(new PointerEvent('pointerdown',{
        pointerId:910,button:0,buttons:1,bubbles:true}));
      const held=menu._heldPointers.has(910);
      menu.lastInteractionAt=performance.now()-menu.idleTimeoutMs-1;
      const paused=!menu._expireIfIdle()&&Boolean(menu.empty);
      document.dispatchEvent(new PointerEvent('pointerup',{
        pointerId:910,button:0,buttons:0,bubbles:true}));
      const renewed=performance.now()-menu.lastInteractionAt<500;
      const stillOpen=Boolean(menu.empty);
      return {held,paused,renewed,stillOpen};
    }""")
    assert all(state.values()),('A held pointer must keep the menu open',state)
    gone=page.evaluate("""() => {
      const g=window.__game, m=g.radialMenu;
      m.lastInteractionAt=performance.now()-m.idleTimeoutMs-1;
      const expired=m._expireIfIdle();
      return {expired,empty:m.empty,picker:g.quickBuildMenu.current,
        hidden:m.root.classList.contains('hidden')};
    }""")
    assert gone['expired'] and gone['empty'] is None and gone['picker'] is None and gone['hidden'],(
      'Idle blank-hex menu was not dismissed cleanly',gone)
    # An already built hex uses the SAME inactivity policy and deselects
    # both its selection outline and its original building-centered radial.
    page.evaluate("""() => {
      const g=window.__game;
      g.selection.select(g.grid.get(1,0));
    }""")
    assert page.locator('#radial-menu .radial-center').is_visible()
    before=page.evaluate("""() => {
      const g=window.__game;
      return g.buildingSystem.buildingsOn(g.grid.get(1,0))[0].remaining;
    }""")
    state=page.evaluate("""() => {
      const g=window.__game,m=g.radialMenu;
      document.dispatchEvent(new WheelEvent('wheel',{deltaY:120,bubbles:true}));
      const reset=performance.now()-m.lastInteractionAt<500;
      m.lastInteractionAt=performance.now()-m.idleTimeoutMs-1;
      const expired=m._expireIfIdle();
      return {reset,expired,selected:g.selection.cell,outline:g.selection.outline.visible,
        popupHidden:m.root.classList.contains('hidden')};
    }""")
    assert state['reset'] and state['expired'] and state['selected'] is None and (
      not state['outline']) and state['popupHidden'],(
      'Building info/outline not removed on inactivity',state)
    page.wait_for_timeout(270)
    after=page.evaluate("""() => {
      const g=window.__game;
      return g.buildingSystem.buildingsOn(g.grid.get(1,0))[0].remaining;
    }""")
    assert after<before, 'Auto-dismissed building selection must not pause ongoing construction'
    # Opening a different mobile HUD panel also removes stale floating info,
    # leaving the actual kingdom progress and persisted building untouched.
    if w<=700:
      page.evaluate("""() => {
        const g=window.__game;
        g.selection.select(g.grid.get(1,0));
      }""")
      page.locator('#slg-mobile-dock button[data-panel="research"]').click()
      assert page.evaluate('window.__game.selection.cell===null')
      assert page.locator('#radial-menu.hidden').count()==1
      page.locator('#slg-mobile-dock button[data-panel="research"]').click()
    # v1.5: an evolved tile can expose >6 construction/recruit/upgrade
    # actions. Inject the action data only into this presentation regression:
    # original game and economy stay untouched.
    pagination=page.evaluate("""() => {
      const g=window.__game, m=g.radialMenu;
      const original=m._actionsFor.bind(m);
      const actions=Array.from({length:13},(_,i)=>({
        id:'qa-action-'+i, icon:'build',label:'시설 '+i,
        tip:'테스트 건물 '+i,disabled:i===7,run:()=>true
      }));
      m._actionsFor=()=>actions;
      g.selection.select(g.grid.get(0,0));
      window.__radialTestOriginal=original;
      return {
        pages:m.cellPages,
        ids:[...m.root.querySelectorAll('.radial-btn')].map(b=>b.dataset.actionId),
        count:m.root.querySelectorAll('.radial-btn').length
      };
    }""")
    assert pagination['pages']==3 and pagination['count']==6,(
      'Evolved tile radial displays too many overlapping actions',pagination)
    assert pagination['ids'][0]=='qa-action-0'
    assert pagination['ids'][-1]=='next-cell-page'
    assert page.locator('button[data-action-id="next-cell-page"]').is_visible()
    page.locator('button[data-action-id="next-cell-page"]').click()
    page_ids=page.locator('#radial-menu .radial-btn').evaluate_all(
      '(buttons)=>buttons.map(b=>b.dataset.actionId)')
    assert page_ids[:5]==['qa-action-5','qa-action-6','qa-action-8','qa-action-9','qa-action-10'] and len(page_ids)==6,(
      'Available actions should precede unavailable construction choices',page_ids)
    page.locator('button[data-action-id="next-cell-page"]').click()
    last_ids=page.locator('#radial-menu .radial-btn').evaluate_all(
      '(buttons)=>buttons.map(b=>b.dataset.actionId)')
    assert last_ids[:3]==['qa-action-11','qa-action-12','qa-action-7']
    assert len(last_ids)==4,('Last page must contain remaining actions and page navigation',last_ids)
    assert page.locator('button[data-action-id="qa-action-7"]').get_attribute('aria-disabled')=='true'
    page.locator('button[data-action-id="next-cell-page"]').click()
    assert page.locator('button[data-action-id="qa-action-0"]').is_visible()

    # Return to the actual game actions, without changing live resources,
    # placing new buildings or altering the original source data.
    page.evaluate("""() => {
      const g=window.__game,m=g.radialMenu;
      m._actionsFor=window.__radialTestOriginal;
      g.selection.select(g.grid.get(1,0),null,'lumber_mill');
      m.update();
    }""")
    assert page.locator('.radial-title').inner_text()=='벌목장'
    status=page.locator('#radial-progress').inner_text()
    assert ('건설' in status or '목재' in status or '완공' in status),(
      'Selected building should show its actual work/production status',status)
    # Clicking terrain outside the 3D map projection must dismiss old info
    # immediately, without modifying production or the selected hex data.
    clear=page.evaluate("""() => {
      const g=window.__game,old=g._pointerToCell;
      g._pointerToCell=()=>null;
      g._tryPlaceAtPointer(3,3);
      g._pointerToCell=old;
      return {selected:g.selection.cell,hidden:g.radialMenu.root.classList.contains('hidden')};
    }""")
    assert clear['selected'] is None and clear['hidden'],(
      'Click on background must dismiss a previously selected tile',clear)

    page.screenshot(path=str(OUT/(label+'-placed.png')),full_page=True)
    assert not errors,f'{label}: {errors}'
    print('PASS',label,'empty tap/menu toggle/combo 3D construction/mobile dock/compact layout',flush=True)
    ctx.close()
  browser.close()
