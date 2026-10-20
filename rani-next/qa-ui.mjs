// Prove this is a playable kingdom world, not a static illustrated mock.
// Uses Fiefdom's original Chrome DevTools harness, with real DOM game actions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CDP,getJSON} from '../engines/fiefdom/tools/e2e/cdp.mjs';
const host=process.argv[2]||'http://127.0.0.1:8931/';
const port=process.argv[3]||'9341';
const shot=process.argv[4];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const v=await getJSON('http://127.0.0.1:'+port+'/json/version');
const c=new CDP();await c.connect(v.webSocketDebuggerUrl);
const {targetId}=await c.send('Target.createTarget',{url:'about:blank'});
const {sessionId:s}=await c.send('Target.attachToTarget',{targetId,flatten:true});
await c.send('Page.enable',{},s);
await c.send('Runtime.enable',{},s);
await c.send('Emulation.setDeviceMetricsOverride',
 {width:1440,height:900,deviceScaleFactor:1,mobile:false},s);
const issues=[];
c.onEvent=message=>{
 if(message.method==='Runtime.exceptionThrown') issues.push('exception');
 if(message.method==='Runtime.consoleAPICalled'&&message.params.type==='error')
   issues.push('console.error '+message.params.args.map(a=>a.value??a.description).join(' '));
};
const evaluate=async expression=>{
 const r=await c.send('Runtime.evaluate',
  {expression,awaitPromise:true,returnByValue:true},s);
 if(r.exceptionDetails) throw new Error('Page JS: '+r.exceptionDetails.exception?.description);
 return r.result.value;
};
const wait=async(expression,seconds=90)=>{
 for(let i=0;i<seconds*2;i++){if(await evaluate(expression))return;await sleep(500);}
 throw new Error('Timed out waiting for: '+expression);
};
await c.send('Page.navigate',{url:host},s);
await wait("!!document.getElementById('rani-map-picker')");
const initial=await evaluate(`(()=>{
 const menu=document.querySelector('#menu');
 const details=document.querySelector('#rani-map-picker');
 const hero=document.querySelector('#rani-start-hero');
 return {title:menu?.querySelector('h1')?.textContent,
         chosen:hero?.querySelector('strong')?.textContent,
         visible:!!hero && getComputedStyle(hero).display!=='none',
         originalCards:details?.querySelectorAll('.maps .map').length,
         closed:details?.open===false,
         mapDisplay:getComputedStyle(details?.querySelector('.maps')).display,
         actualStart:!!menu?.querySelector('button.go')};
})()`);
assert.equal(initial.title,'라니킹덤');
assert.ok(await evaluate("!document.getElementById('menu').textContent.includes('오류 제보')"),'Developer link visible on title');
assert.ok(await evaluate("!document.getElementById('menu').textContent.includes('최초 실행 시')"),'Technical loading note still visible');
assert.ok(await evaluate("document.querySelector('#menu .rk-public-version')?.textContent==='v5.6'"),'v5.5 marker missing');
assert.equal(initial.chosen,'푸른 해안');
assert.ok(!initial.visible&&initial.closed&&initial.originalCards>=10&&initial.actualStart,initial);
assert.equal(initial.mapDisplay,'none');
if(shot){
 const page=await c.send('Page.captureScreenshot',{format:'png'},s);
 fs.writeFileSync(shot.replace(/\.png$/,'-menu.png'),Buffer.from(page.data,'base64'));
}
assert.equal(await evaluate("getComputedStyle(document.querySelector('#menu .rk-start-now')).backgroundImage.includes('rk_royal_button.webp')"),true);

await evaluate("document.querySelector('#rk-start-now').click()");
await wait("document.querySelector('#menu').classList.contains('rk-choose-region')");
assert.equal(await evaluate("document.querySelector('#rani-map-picker').open"),true);
// Select another existing Fiefdom map, then choose coast again. The original
// real map selection controls and their saved seeds are still authoritative.
await evaluate("document.querySelectorAll('#rani-map-picker .maps .map')[1].click()");
assert.equal(await evaluate("document.querySelector('#rani-map-picker').open"),true);
assert.notEqual(await evaluate("document.querySelector('#rani-start-hero strong').textContent"),'푸른 해안');
await evaluate("document.querySelector('#rani-map-picker .map').click()");
assert.equal(await evaluate("document.querySelector('#rani-start-hero strong').textContent"),'푸른 해안');
await evaluate("[...document.querySelectorAll('#menu button')].find(b=>b.textContent.includes('영주 선택')).click()");
await wait("[...document.querySelectorAll('button')].some(b=>b.textContent.includes('게임 시작'))");

const lordStyle=await evaluate(`(()=>{
 const root=document.getElementById('lords');
 const canvas=root?.querySelector('canvas');
 return {realMapCanvas:!!canvas&&canvas.width>350,
   hero:getComputedStyle(root,'::before').backgroundImage.includes('rk_logo.webp'),
   royalBegin:getComputedStyle(root.querySelector('.go')).backgroundImage.includes('rk_royal_button.webp'),
   rows:root.querySelectorAll('.seat').length,
   mapClick:typeof canvas?.onclick==='function'};
})()`);
assert.ok(lordStyle.realMapCanvas&&lordStyle.hero&&lordStyle.royalBegin
  &&lordStyle.rows>0&&lordStyle.mapClick,lordStyle);
console.log('PASS actual map-position screen: WebP branded layout and interactive roster',lordStyle);

const stageFit=await evaluate(`(()=>{
 const root=document.getElementById('lords');
 const map=root.querySelector('canvas').getBoundingClientRect();
 const roster=root.querySelector('.side').getBoundingClientRect();
 const begin=root.querySelector('button.go').getBoundingClientRect();
 const names=[...root.querySelectorAll('.seat .nm')].map(x=>x.textContent);
 return {mapRight:map.right,rosterLeft:roster.left,
    beginVisible:begin.top>0&&begin.bottom<=innerHeight,
    verticalTogether:Math.abs(map.top-roster.top)<30,
    names,viewport:innerWidth};
})()`);
assert.ok(stageFit.rosterLeft>stageFit.mapRight&&stageFit.verticalTogether
 &&stageFit.beginVisible&&stageFit.names[0]==='나'
 &&stageFit.names[1]==='붉은 영주',stageFit);
console.log('PASS post-map desktop roster + map + BEGIN fit without scrolling',stageFit);

if(shot){
 const screenshot=await c.send('Page.captureScreenshot',{format:'png'},s);
 fs.writeFileSync(shot.replace(/\.png$/,'-choose-start.png'),Buffer.from(screenshot.data,'base64'));
}

await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.includes('게임 시작')).click()");
await wait("!!window.__game&&!!document.getElementById('rani-controls-toggle')",120);
await wait("document.getElementById('ui')?.dataset.raniAssets==='1'",20);
const placements=await evaluate(`(()=>{
 const ui=document.getElementById('ui');
 return {count:ui.dataset.raniAssetCount,
   house:!!ui.querySelector('#buildmenu button[data-name="hovel"] img.rani-approved-building'),
   market:!!ui.querySelector('#buildmenu button[data-name="market"] img.rani-approved-building'),
   panel:!!ui.querySelector('#rani-approved-royal-panel'),
   ship:!!ui.querySelector('#market #rani-market-art img')};
})()`);
console.log('Rani user asset placement',JSON.stringify(placements));
assert.equal(placements.count,'4',placements);
await sleep(800);
const owned=await evaluate(`(()=>{
 const ui=document.getElementById('ui');
 const house=ui.querySelector('#buildmenu button[data-name="hovel"]');
 const market=ui.querySelector('#buildmenu button[data-name="market"]');
 const trade=ui.querySelector('#market #rani-market-art img');
 const panel=ui.querySelector('#rani-approved-royal-panel');
 const images=[
  house?.querySelector('img.rani-approved-building'),
  market?.querySelector('img.rani-approved-building'),trade,panel
 ];
 return {count:images.length,loaded:images.map(x=>!!x&&x.complete&&x.naturalWidth>0),
   originalButtons:[house,market].map(x=>typeof x?.onclick==='function'),
   nativeCanvas:[house,market].map(x=>!!x?.querySelector('canvas')),
   fallbackReady:[house,market].map(x=>!!x?.querySelector('canvas.rani-hide-canvas')),
   tradingControls:!!ui.querySelector('#market')};
})()`);
assert.deepEqual(owned.loaded,[true,true,true,true],owned);
assert.deepEqual(owned.originalButtons,[true,true],owned);
assert.deepEqual(owned.nativeCanvas,[true,true],owned);
assert.deepEqual(owned.fallbackReady,[true,true],owned);
assert.ok(owned.tradingControls,owned);
const state=await evaluate(`(()=>{
 const g=window.__game,ui=document.querySelector('#ui');
 const controls=document.querySelector('#controls');
 const info=document.querySelector('#rightpanel');
 return {game:!!g.state,buildings:g.state.buildings.length,
         zoom:g.iso.zoom,controlsHidden:getComputedStyle(controls).display==='none',
         infoHidden:getComputedStyle(info).display==='none',
         realRes:document.querySelectorAll('#topbar [data-res]').length,
         nativeBuild:!!document.getElementById('buildbar'),
         mini:!!document.querySelector('#minimap canvas')};
})()`);
assert.ok(state.game&&state.buildings>0&&Math.abs(state.zoom-1.5)<.05,state);

const hexEvidence=await evaluate(`(()=>{
 const g=window.__game,w=g.raniWheel;
 const keep=g.state.buildings.find(b=>b.name==='keep');
 if(!keep||!w)return {available:false};
 const mk=b=>({key:'building:'+b.id,name:b.name,label:b.def.label,
   x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});
 const target=mk(keep);
 w.toggle(target);
 const menu=document.querySelector('#rk-hex-menu');
 const visible=!menu.hidden;
 const actions=[...menu.querySelectorAll('button[data-action]')].map(b=>b.dataset.action);
 const protectedKeep=menu.querySelector('[data-action="remove"]').disabled;
 menu.querySelector('[data-action="info"]').click();
 const hasInfo=!document.querySelector('#rk-hex-info').hidden;
 w.toggle(target);
 const toggledClosed=menu.hidden;
 w.toggle(target);
 const stoneBefore=g.state.stock.stone,woodBefore=g.state.stock.wood,hpBefore=keep.hp;
 g.state.stock.stone+=400;g.state.stock.wood+=400;
 menu.querySelector('[data-action="upgrade"]').click();
 const increasedHp=keep.hp>hpBefore,upgraded=keep.lvl===2;
 const persisted=g.snapshot().buildings.find(b=>b.n==='keep')?.lvl===2;
 const stoneSpent=g.state.stock.stone<stoneBefore+400,
       woodSpent=g.state.stock.wood<woodBefore+400;
 const other=g.state.buildings.find(b=>b.name!=='keep'&&b.name!=='stockpile'&&b.name!=='granary');
 let confirm=false,cancelWorks=false;
 if(other){
   w.toggle(mk(other));
   menu.querySelector('[data-action="remove"]').click();
   const modal=document.getElementById('rk-hex-confirm');
   confirm=!!modal&&!!modal.querySelector('.rk-hex-danger');
   modal.querySelector('.rk-hex-cancel').click();
   cancelWorks=!document.getElementById('rk-hex-confirm')&&g.state.buildings.includes(other);
 }
 w.close();
 return {available:true,visible,actions,protectedKeep,hasInfo,toggledClosed,
    upgraded,increasedHp,persisted,stoneSpent,woodSpent,confirm,cancelWorks};
})()`);
assert.ok(hexEvidence.available&&hexEvidence.visible&&hexEvidence.protectedKeep
 &&hexEvidence.hasInfo&&hexEvidence.toggledClosed&&hexEvidence.upgraded
 &&hexEvidence.increasedHp&&hexEvidence.persisted&&hexEvidence.stoneSpent
 &&hexEvidence.woodSpent&&hexEvidence.confirm&&hexEvidence.cancelWorks,hexEvidence);
assert.deepEqual(hexEvidence.actions,['info','upgrade','repair','manage','build','remove']);
console.log('PASS real Rani hex UI, protected keep, click-toggle, saved upgrades, payment, demolition cancel',hexEvidence);

const hexBuild=await evaluate(`(()=>{
 const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');
 const w=g.raniWheel;
 w.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,
   x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});
 document.querySelector('#rk-hex-menu [data-action="build"]').click();
 const visible=getComputedStyle(document.getElementById('buildwrap')).display!=='none';
 const category=getComputedStyle(document.getElementById('buildmenu')).display!=='none';
 const closed=document.getElementById('rk-hex-menu').hidden;
 if(visible)document.getElementById('rani-build-toggle').click();
 return {visible,category,closed};
})()`);
assert.ok(hexBuild.visible&&hexBuild.category&&hexBuild.closed,
 'Six-hex build must open native catalog once without double-toggle: '+JSON.stringify(hexBuild));
console.log('PASS six-hex action opens original real build categories',hexBuild);


await evaluate(`(()=>{
 const g=window.__game,b=g.state.buildings.find(x=>x.name==='keep');
 g.raniWheel.toggle({key:'building:'+b.id,name:b.name,label:b.def.label,
   x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b});
})()`);
if(shot){
 const pic=await c.send('Page.captureScreenshot',{format:'png'},s);
 fs.writeFileSync(shot.replace(/\.png$/,'-hex-actions.png'),Buffer.from(pic.data,'base64'));
}
await evaluate("window.__game.raniWheel.close()");

assert.equal(await evaluate("document.querySelectorAll('svg').length"),0);
const sceneryEvidence=await evaluate(`(()=>{
 const g=window.__game,w=g.raniWheel;
 const i=g.decorations.findIndex(d=>d.alive);
 if(i<0)return {available:false};
 const d=g.decorations[i],old=g.state.buildings.length;
 w.toggle({key:'nature:'+i,name:d.name,label:'자연물',
   x:d.x+0.5,z:d.z+0.5,decorationIndex:i});
 const menu=document.querySelector('#rk-hex-menu');
 const hasControl=!menu.querySelector('[data-action="remove"]').disabled;
 menu.querySelector('[data-action="remove"]').click();
 const modal=document.querySelector('#rk-hex-confirm');
 const asks=!!modal&&!!modal.querySelector('.rk-hex-danger');
 modal.querySelector('.rk-hex-danger').click();
 const gone=!d.alive,serial=g.snapshot().felled.some(([n,time])=>n===i&&time>=1e11);
 const buildingsIntact=g.state.buildings.length===old;
 const obstacleCleared=!g.paths.isBlocked(d.x,d.z);
 return {available:true,hasControl,asks,gone,serial,buildingsIntact,obstacleCleared};
})()`);
assert.ok(sceneryEvidence.available&&sceneryEvidence.hasControl&&sceneryEvidence.asks
  &&sceneryEvidence.gone&&sceneryEvidence.serial&&sceneryEvidence.buildingsIntact
  &&sceneryEvidence.obstacleCleared,sceneryEvidence);
console.log('PASS actual scenery removal: confirmation, persistent felled index, collision released',sceneryEvidence);

const shoreProof=await evaluate(`(()=>{
 const t=window.__game.terrain, attr=t.mesh.geometry.getAttribute('aShore');
 if(!attr || attr.itemSize!==4) return {present:false};
 const arr=attr.array;let waterEdges=0,dryEdges=0,waterTiles=0;
 for(let i=0;i<t.layer.length;i++){
   let e=0;const j=i*16;
   for(let d=0;d<4;d++)e+=arr[j+d];
   const water=Math.floor(t.layer[i]/4)===6;
   if(water){waterTiles++;if(e>0)waterEdges++;}
   else if(e>0)dryEdges++;
 }
 return {present:true,waterTiles,waterEdges,dryEdges,itemSize:attr.itemSize};
})()`);
assert.ok(shoreProof.present&&shoreProof.waterTiles>0&&shoreProof.waterEdges>0
  &&shoreProof.dryEdges===0,shoreProof);
console.log('PASS shoreline real GPU tile adjacency',JSON.stringify(shoreProof));
const koHud=await evaluate("document.getElementById('stats').innerText");
assert.ok(koHud.includes('인구')&&koHud.includes('미취업 주민')&&koHud.includes('식량 창고'),koHud);
assert.ok(!/Population|Unemployed|Food stores|Stockpile|Enemies/.test(koHud),'HUD must be Korean');
assert.equal(await evaluate("document.querySelectorAll('svg').length"),0,'SVG is forbidden in the game DOM');
assert.ok(state.controlsHidden&&state.infoHidden&&state.realRes>4&&state.nativeBuild&&state.mini,state);
const res=await evaluate(`(()=>{
 const ui=document.getElementById('ui');
 return {toggle:!!document.getElementById('rani-resource-toggle'),
   displayed:[...document.querySelectorAll('#topbar .res')].filter(e=>getComputedStyle(e).display!=='none').length,
   total:document.querySelectorAll('#topbar .res').length};
})()`);
assert.ok(res.toggle&&res.displayed===5&&res.total>res.displayed,res);
await evaluate("document.getElementById('rani-resource-toggle').click()");
const expanded=await evaluate("[...document.querySelectorAll('#topbar .res')].filter(e=>getComputedStyle(e).display!=='none').length");
assert.ok(expanded>res.displayed,{expanded,res});
await evaluate("document.getElementById('rani-resource-toggle').click()");
const beforeBuild=await evaluate(`(()=>{
 const ui=document.getElementById('ui');
 return {button:!!document.getElementById('rani-build-toggle'),
   hidden:getComputedStyle(document.getElementById('buildwrap')).display==='none',
   catalog:!!document.querySelector('#buildbar button[data-group="2"]')};
})()`);
assert.ok(beforeBuild.button&&beforeBuild.hidden&&beforeBuild.catalog,beforeBuild);
await evaluate("document.getElementById('rani-build-toggle').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('buildwrap')).display==='none'"),false);
await evaluate("[...document.querySelectorAll('#buildbar button')].find(e=>e.dataset.group==='2').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('buildmenu')).display==='none'"),false);
await evaluate("document.getElementById('rani-build-toggle').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('buildwrap')).display==='none'"),true);

await evaluate("document.getElementById('rani-controls-toggle').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('controls')).display==='none'"),false);
await evaluate("document.getElementById('rani-info-toggle').click()");
assert.equal(await evaluate("getComputedStyle(document.getElementById('rightpanel')).display==='none'"),false);

const royalLayout=await evaluate(`(()=>{
 const panel=document.getElementById('rightpanel');
 const mini=document.querySelector('#minimap canvas');
 const root=document.querySelector('#ui');
 return {viewport:innerWidth, panelWidth:panel.getBoundingClientRect().width,
   miniWidth:mini.getBoundingClientRect().width,
   originalStats:document.querySelector('#stats').innerText.length>3,
   actualWorldCanvas:document.querySelectorAll('canvas').length>2,
   panelVisible:panel.getBoundingClientRect().width>0,
   svgNodes:document.querySelectorAll('svg').length};
})()`);
assert.ok(royalLayout.panelVisible&&royalLayout.panelWidth<=350&&royalLayout.miniWidth<=160,royalLayout);
assert.ok(royalLayout.actualWorldCanvas&&royalLayout.originalStats&&royalLayout.svgNodes===0,royalLayout);
console.log('PASS royal space-saving actual world HUD',JSON.stringify(royalLayout));

if(shot){
 await evaluate(`(()=>{
 const sel=document.querySelector('#rightpanel select');
 sel.value='market';sel.dispatchEvent(new Event('change',{bubbles:true}));
 })()`);
 await sleep(250);
 const proof=await c.send('Page.captureScreenshot',{format:'png'},s);
 fs.writeFileSync(shot.replace(/\.png$/,'-market.png'),Buffer.from(proof.data,'base64'));
}
await evaluate("document.getElementById('rani-controls-toggle').click();document.getElementById('rani-info-toggle').click()");
if(shot){
 const r=await c.send('Page.captureScreenshot',{format:'png'},s);
 fs.writeFileSync(shot,Buffer.from(r.data,'base64'));
}
assert.deepEqual(issues,[]);
console.log('PASS actual Rani Next 2.5D: Korean start, hidden editable map list, real coast map, playable game, zoom 1.5, data-driven HUD and toggles');
process.exit(0);
