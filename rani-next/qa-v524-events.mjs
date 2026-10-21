// v5.24 targeted, real-game Korean coverage for warnings and UI loading.
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
 const x=await c.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},s);
 if(x.exceptionDetails)throw Error(x.exceptionDetails.exception?.description);
 return x.result.value;
};
const until=async expr=>{
 for(let i=0;i<350;i++){if(await ev(expr))return;await sleep(240);}
 throw Error('Timed out '+expr);
};
try{
 await c.send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,mobile:false,deviceScaleFactor:1},s);
 await c.send('Page.navigate',{url},s);
 await until("!!document.querySelector('#rk-start-now')");
 assert.equal(await ev("document.querySelector('.rk-public-version').textContent"),'v5.24');
 await ev("document.querySelector('#rk-start-now').click()");
 await until("document.querySelector('#menu').classList.contains('rk-choose-region')");
 await ev("document.querySelector('#menu .rk-manual-start').click()");
 await until("!!document.querySelector('#lords .go')");
 await ev("document.querySelector('#lords .go').click()");
 await until("!!window.__game&&!!document.querySelector('#rk-actions')");
 const tests=[
  ['Sound on','소리를 켰습니다.'],
  ['Your people have no water to fight the fire — build a well','화재를 진압할 물이 없습니다. 우물을 건설하세요.'],
  ['벌목장 needs an ox tether nearby','벌목장 근처에 황소 운반 시설이 필요합니다.'],
  ['채석장 yard is full — the ox tether cannot keep up','채석장의 야적장이 가득 찼습니다. 운반 시설을 보강하세요.'],
  ['제분소 is waiting for materials','제분소이(가) 재료를 기다리고 있습니다.'],
  ['The enemy lord marches on you — 13 strong!','적 영주가 공격해 옵니다! 적군 13명'],
  ['The enemy lord lays siege to your walls — 9 strong!','적 영주가 성벽을 포위했습니다! 적군 9명'],
  ['3 holding ground — they will not give chase','병사 3명이 위치를 사수합니다. 적을 추격하지 않습니다.'],
  ['2 on the attack','병사 2명이 공격 태세로 전환했습니다.'],
  ['No wood to sell','목재 재고가 없어 판매할 수 없습니다.'],
  ['Must be built on sand','모래 지형에 건설해야 합니다.'],
  ['Your rival: Aldric to the north-east.','적 영주 위치: Aldric · 북동쪽'],
  ['Not enough stone and wood','석재·목재 부족'],
  ['Your people are starving!','주민들이 굶주리고 있습니다!'],
 ];
 const results=await ev(`(()=>{
  const g=window.__game;return ${JSON.stringify(tests)}.map(([input])=>{
    g.state.notify(input,'warn');return {input,actual:g.state.notices.at(-1).text};
  });
 })()`);
 for(let i=0;i<tests.length;i++)assert.equal(results[i].actual,tests[i][1],JSON.stringify(results[i]));
 const actions=await ev(`(()=>{
   const toggle=document.querySelector('#rk-build-toggle');
   const dock=document.querySelector('#rk-actions');
   toggle.click();const open=dock.dataset.open;
   toggle.click();const shut=dock.dataset.open;
   return {open,shut,version:document.querySelector('.rk-public-version')?.textContent};
 })()`);
 assert.deepEqual(actions,{open:'true',shut:'false',version:'v5.24'});
 console.log('PASS v5.24 14 native Korean alerts (workers, war, trade, placement, UI) and unified menu',{results,actions});
}finally{await c.send('Target.closeTarget',{targetId});}
process.exit(0);
