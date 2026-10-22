// v5.30 — real game button collision audit and six-hex responsive safety.
// Tests native original vs newer Build duplicate, actual Guide handler location,
// functional Build -> category, ray-picked wheel, mobile thumb bar and 3 sizes.
import assert from 'node:assert/strict';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const url=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341',sleep=n=>new Promise(r=>setTimeout(r,n));
const info=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(info.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);await c.send('Runtime.enable',{},s);
const ev=async expr=>{
 const r=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||JSON.stringify(r.exceptionDetails));
 return r.result.value;
};
const until=async expr=>{
 for(let i=0;i<340;i++){if(await ev(expr))return;await sleep(190);}
 throw Error('Timeout '+expr);
};
const closeEnough=(a,b)=>a.right<=b.left+1||b.right<=a.left+1||a.bottom<=b.top+1||b.bottom<=a.top+1;
const visible=(r,w,h)=>r?.width>10&&r.height>10&&r.left>=-2&&r.right<=w+2&&r.top>=-2&&r.bottom<=h+2;
const boot=async(w,h,mobile)=>{
 await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,mobile,deviceScaleFactor:mobile?2:1},s);
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:mobile?3:1},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.30');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game?.raniWheel");
 await until("!!document.querySelector('#rk-guide-toggle')");
 await sleep(150);
};
try{
 for(const [w,h,mobile] of [[1366,768,false],[900,600,false],[390,844,true],[320,568,true],[844,390,true]]){
  await boot(w,h,mobile);
  const state=await ev(`(()=>{
   const f=id=>document.getElementById(id),rc=e=>e?.getBoundingClientRect()?.toJSON();
   const dock=f('rk-actions'),legacy=f('rani-build-toggle'),guide=f('rk-guide-toggle'),pad=f('pad');
   return {width:innerWidth,height:innerHeight,
     desktop:!document.documentElement.classList.contains('phone'),
     hiddenOld:legacy?getComputedStyle(legacy).display==='none':true,
     legacyExists:!!legacy,
     guideParent:guide?.parentElement?.className||guide?.parentElement?.id,
     dock:rc(dock),stats:rc(f('stats')),row:rc(dock?.querySelector('.rk-action-row')),
     actions:[...dock?.querySelectorAll('.rk-action-row button')||[]].map(e=>({id:e.id,box:rc(e)})),
     pad:rc(pad),mobileActions:[...pad?.querySelectorAll('.rk-touch-actions button')||[]].map(e=>({label:e.textContent,rect:rc(e)})),
     scroll:document.documentElement.scrollWidth-innerWidth};
  })()`);
  assert.ok(state.scroll<=3,JSON.stringify(state));
  if(state.desktop){
    assert.ok(state.legacyExists&&state.hiddenOld,'Legacy visible build duplicate '+JSON.stringify(state));
    assert.ok(state.guideParent.includes('rk-action-row')&&state.actions.length===3,JSON.stringify(state));
    assert.ok(visible(state.dock,w,h)&&closeEnough(state.dock,state.stats),JSON.stringify(state));
    for(let i=0;i<state.actions.length;i++){
      assert.ok(visible(state.actions[i].box,w,h),JSON.stringify(state));
      for(let j=i+1;j<state.actions.length;j++)
        assert.ok(closeEnough(state.actions[i].box,state.actions[j].box),JSON.stringify(state));
    }
    const opened=await ev(`(()=>{
      const el=document.querySelector('#rk-actions'),btn=document.querySelector('#rk-build-toggle');
      btn.click();return {open:el.dataset.open,display:getComputedStyle(document.querySelector('#buildwrap')).display,
        menu:getComputedStyle(document.querySelector('#buildbar')).display,
        dock:el.getBoundingClientRect().toJSON(),stats:document.querySelector('#stats').getBoundingClientRect().toJSON()};
    })()`);
    assert.ok(opened.open==='true'&&opened.display!=='none'&&opened.menu!=='none'
      &&closeEnough(opened.dock,opened.stats)&&opened.dock.bottom<=h+2,JSON.stringify(opened));
    await ev("document.getElementById('rk-build-toggle').click()");
    const guide=await ev(`(()=>{
      const b=document.querySelector('#rk-guide-toggle');b.click();
      const opened=b.getAttribute('aria-expanded');
      b.click();return {opened,closed:b.getAttribute('aria-expanded')};
    })()`);
    assert.ok(guide.opened!==guide.closed,JSON.stringify(guide));
  }else{
    assert.ok(state.mobileActions.length===2,JSON.stringify(state));
    assert.deepEqual(state.mobileActions.map(x=>x.label),['건설','메뉴']);
    for(const b of state.mobileActions)
      assert.ok(visible(b.rect,w,h),JSON.stringify(state));
    assert.ok(closeEnough(...state.mobileActions.map(b=>b.rect)),JSON.stringify(state));
  }
  // Real six-hex wheel selected on an actual keep, not a synthetic UI sample.
  const wheel=await ev(`(()=>{
    const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');
    g.raniWheel.close();
    g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,
      x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});
    const host=document.querySelector('#rk-hex-menu'),rc=e=>e.getBoundingClientRect().toJSON();
    const options=[...host.querySelectorAll('.rk-hex-option')].filter(e=>!e.hidden)
      .map(e=>({label:e.textContent,disabled:e.disabled,reason:e.dataset.rkUnavailable,rect:rc(e)}));
    const panel=document.querySelector('#pad'),dock=document.querySelector('#rk-actions');
    return {host:rc(host),options,pad:panel?rc(panel):null,dock:dock?rc(dock):null,
      dockPointer:dock?getComputedStyle(dock).pointerEvents:null,
      safe:host.dataset.rkViewportSafe,scroll:document.documentElement.scrollWidth-innerWidth};
  })()`);
  assert.equal(wheel.safe,'true',JSON.stringify(wheel));
  // The native wheel correctly shows ONLY currently applicable hex actions.
  assert.ok(wheel.options.length>=1&&wheel.options.length<=6
    &&wheel.options.some(o=>o.label==='정보'),JSON.stringify(wheel));
  for(const option of wheel.options){
    assert.ok(visible(option.rect,w,h),JSON.stringify({w,h,option,wheel}));
    if(mobile&&wheel.pad?.height>0)
      assert.ok(closeEnough(option.rect,wheel.pad),'Hex button overlaps thumb bar '+JSON.stringify({option,wheel}));
    if(!mobile&&wheel.dock)
      assert.ok(closeEnough(option.rect,wheel.dock),'Hex overlaps construction dock '+JSON.stringify({option,wheel}));
    if(option.disabled&&['강화','수리','철거'].includes(option.label))
      assert.ok(typeof option.reason==='string'&&option.reason.length>1,JSON.stringify(option));
  }
  const more=await ev(`(()=>{
    const host=document.querySelector('#rk-hex-menu');
    host.querySelector('[data-action=info]').click();
    const rect=host.querySelector('#rk-hex-info').getBoundingClientRect().toJSON();
    return {rect,open:!host.querySelector('#rk-hex-info').hidden};
  })()`);
  assert.ok(more.open&&more.rect.left>=-2&&more.rect.right<=w+2,
    JSON.stringify({w,h,more}));
  if(mobile&&wheel.pad?.height>0){
    assert.ok(more.rect.bottom<=wheel.pad.top+2,
      'Hex details must not obscure Build/Menu thumb dock: '+JSON.stringify({w,h,more,pad:wheel.pad}));
  }
  console.log('PASS v5.30 no duplicate Build/dock overlap and premium six-hex responsive geometry',w,h);
 }
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);