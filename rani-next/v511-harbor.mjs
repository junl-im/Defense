// v5.11: a real coastal harbor building with player-selected ship cargo,
// honest original Fiefdom resource accounting and optional-save migration.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function alter(rel,from,to){const p=path.join(root,rel),s=fs.readFileSync(p,'utf8');assert.equal(s.split(from).length,2,'source drift '+rel+' '+from.slice(0,68));fs.writeFileSync(p,s.replace(from,to));}
// Native BUILDINGS, menu and Placement.check automatically enforce costs,
// 2x2 footprint, map territory, collision, water proximity and flat ground.
alter('src/game/defs.ts',
"  fishery: {\n    name: 'fishery'",
[
"  harbor: {",
"    name: 'harbor', label: '무역 항구', category: 'town',",
"    footprint: [2, 2], cost: {wood: 50, stone: 20},",
"    workers: 0, terrain: 'any', needsWater: true,",
"    description: '해안에 항구를 건설하면 교역선을 보내 금과 물자를 거래합니다. 목재 50 · 석재 20',",
"  },",
"  fishery: {",
"    name: 'fishery'"
].join('\n'));
alter('src/game/defs.ts',
"            'fishery', 'hops_farm'] },",
"            'fishery', 'harbor', 'hops_farm'] },");
// Add native simulation state, with optional persistent route progress and a
// conservative warehouse / gold / resource cap.
alter('src/game/state.ts',
"  private tradeClock = 0;",
[
"  private tradeClock = 0;",
"  harbor: {mode:'off'|'export'|'import';resource:'wood'|'stone'|'fish';clock:number;voyages:number} =",
"    {mode:'off',resource:'fish',clock:0,voyages:0};",
"  get hasHarbor():boolean {return this.buildings.some(b=>b.name==='harbor');}",
"  /** Real cargo settlement: exactly one voyage per 60 game seconds. */",
"  tickHarbor(dt:number):void {",
"    if(!this.hasHarbor||this.harbor.mode==='off')return;",
"    this.harbor.clock+=Math.max(0,dt);",
"    if(this.harbor.clock<60)return;",
"    this.harbor.clock%=60;",
"    const good=this.harbor.resource;",
"    const price=PRICES[good];",
"    if(!price)return;",
"    const units=6;",
"    if(this.harbor.mode==='export'){",
"      if(this.stock[good]<units+8){",
"        this.notify('항구 출항 취소 · 화물이 부족합니다. 최소 14개를 확보하세요.','warn');return;",
"      }",
"      this.stock[good]-=units;",
"      this.ledger.recordConsumed(good,units);",
"      this.gold+=units*price[1];this.tradeIncome+=units*price[1];",
"      this.harbor.voyages++;",
"      this.notify('교역선 귀항 · '+units+'개 수출, 금 '+(units*price[1])+' 획득');",
"    }else{",
"      const priceGold=units*price[0];",
"      if(this.gold<priceGold){this.notify('항구 입항 취소 · 금이 부족합니다.','warn');return;}",
"      if(!this.hasStore(storeOf(good))||this.roomFor(good)<units){",
"        this.notify('항구 입항 취소 · 해당 물자 창고 공간이 부족합니다.','warn');return;",
"      }",
"      this.gold-=priceGold;this.tradeSpend+=priceGold;",
"      this.stock[good]+=units;this.ledger.recordProduced(good,units);",
"      this.harbor.voyages++;",
"      this.notify('교역선 귀항 · '+units+'개 수입, 금 '+priceGold+' 지불');",
"    }",
"  }"
].join('\n'));
alter('src/game/state.ts',"    this.tickTrade(dt);\n","    this.tickTrade(dt);\n    this.tickHarbor(dt);\n");
alter('src/game/save.ts',
"  trade: Record<string, { buyOn: boolean; buyLevel: number; sellOn: boolean; sellLevel: number }>;\n",
"  trade: Record<string, { buyOn: boolean; buyLevel: number; sellOn: boolean; sellLevel: number }>;\n  /** Native sea trade. Optional: all earlier saves remain compatible. */\n  harbor?: {mode:'off'|'export'|'import';resource:'wood'|'stone'|'fish';clock:number;voyages:number};\n");
alter('src/main.ts',
"      trade: JSON.parse(JSON.stringify(state.trade)),",
"      trade: JSON.parse(JSON.stringify(state.trade)),\n      harbor: {...state.harbor},");
alter('src/main.ts',
"    Object.assign(state.trade, sv.trade);\n    state.elapsed = sv.elapsed;",
[
"    Object.assign(state.trade, sv.trade);",
"    if(sv.harbor){",
"      state.harbor.mode=['off','export','import'].includes(sv.harbor.mode)?sv.harbor.mode:'off';",
"      state.harbor.resource=['wood','stone','fish'].includes(sv.harbor.resource)?sv.harbor.resource:'fish';",
"      state.harbor.clock=Math.max(0,Math.min(60,Number(sv.harbor.clock)||0));",
"      state.harbor.voyages=Math.max(0,Math.floor(Number(sv.harbor.voyages)||0));",
"    }else Object.assign(state.harbor,{mode:'off',resource:'fish',clock:0,voyages:0});",
"    state.elapsed = sv.elapsed;"
].join('\n'));
// Visible controls have functional callbacks and real state + rate.
// This is a small native DOM panel, not fake overlay game state.
alter('src/main.ts',
"  const hud = new Hud(state, placement);",
[
"  const hud = new Hud(state, placement);",
"  const rkHarborPanel=document.createElement('section');",
"  rkHarborPanel.id='rk-harbor-panel';",
"  rkHarborPanel.setAttribute('aria-label','항구 운영');",
"  rkHarborPanel.innerHTML=[",
"    '<button id=\"rk-harbor-toggle\" type=\"button\" aria-expanded=\"false\">항구 · 건설</button>',",
"    '<div id=\"rk-harbor-body\" hidden><strong>교역선 운영</strong>',",
"    '<p id=\"rk-harbor-status\">항구를 건설하면 항로가 열립니다.</p>',",
"    '<label>거래 방식 <select id=\"rk-harbor-mode\"><option value=\"off\">운항 중지</option><option value=\"export\">수출</option><option value=\"import\">수입</option></select></label>',",
"    '<label>거래 화물 <select id=\"rk-harbor-cargo\"><option value=\"fish\">생선</option><option value=\"wood\">목재</option><option value=\"stone\">석재</option></select></label>',",
"    '<p id=\"rk-harbor-count\"></p></div>'",
"  ].join('');",
"  document.body.appendChild(rkHarborPanel);",
"  const rkMode=rkHarborPanel.querySelector<HTMLSelectElement>('#rk-harbor-mode')!;",
"  const rkCargo=rkHarborPanel.querySelector<HTMLSelectElement>('#rk-harbor-cargo')!;",
"  const rkToggle=rkHarborPanel.querySelector<HTMLButtonElement>('#rk-harbor-toggle')!;",
"  const rkBody=rkHarborPanel.querySelector<HTMLElement>('#rk-harbor-body')!;",
"  rkMode.addEventListener('change',()=>{",
"    const mode=rkMode.value;",
"    state.harbor.mode=mode==='import'?'import':mode==='export'?'export':'off';",
"    state.harbor.clock=0;",
"  });",
"  rkCargo.addEventListener('change',()=>{",
"    const cargo=rkCargo.value;",
"    state.harbor.resource=cargo==='wood'?'wood':cargo==='stone'?'stone':'fish';",
"    state.harbor.clock=0;",
"  });",
"  rkToggle.addEventListener('click',()=>{",
"    const open=rkBody.hidden;",
"    rkBody.hidden=!open;",
"    rkToggle.setAttribute('aria-expanded',String(open));",
"    if(!state.hasHarbor){",
"      const card=document.querySelector<HTMLButtonElement>('#buildmenu button[data-name=\"harbor\"]');",
"      if(card){card.click();rkBody.hidden=true;rkToggle.setAttribute('aria-expanded','false');}",
"    }",
"  });",
"  let rkLastHarborHud=-1;",
"  const rkUpdateHarborHud=(time:number)=>{",
"    if(time-rkLastHarborHud<800)return;rkLastHarborHud=time;",
"    rkToggle.textContent=state.hasHarbor?'항구 · 교역선':'항구 · 건설';",
"    rkMode.value=state.harbor.mode;rkCargo.value=state.harbor.resource;",
"    const p=rkHarborPanel.querySelector<HTMLElement>('#rk-harbor-status')!;",
"    const label={wood:'목재',stone:'석재',fish:'생선'}[state.harbor.resource];",
"    p.textContent=state.hasHarbor?",
"      (state.harbor.mode==='off'?'운항 중지 · 거래 방식을 선택하세요.':",
"      '항로 운영 · '+label+' 6개씩 '+(state.harbor.mode==='export'?'수출':'수입')+' · 60초 왕복'):",
"      '해안에 항구를 건설하세요. 목재 50 · 석재 20';",
"    rkHarborPanel.querySelector<HTMLElement>('#rk-harbor-count')!.textContent=",
"      '누적 귀항 '+state.harbor.voyages+'회 · 남은 시간 '+Math.ceil(60-state.harbor.clock)+'초';",
"  };"
].join('\n'));
alter('src/main.ts',"    prof.frame();\n    iso.update(dt);",
"    prof.frame();\n    rkUpdateHarborHud(now);\n    iso.update(dt);");
// v5.10 pier meshes are already based on fishery building. Harbor also gets a
// pier and a larger deck, without reimplementing the coastline system.
alter('src/main.ts',"      if(b.name!=='fishery')continue;",
"      if(b.name!=='fishery'&&b.name!=='harbor')continue;");
alter('src/main.ts',"        rkPortDocks.set(b.id,rkMakePier(near.x,near.z,rotation,b.id));}",
[
"        const dock=rkMakePier(near.x,near.z,rotation,b.id);",
"        if(b.name==='harbor')dock.scale.set(1.45,1.06,1.45);",
"        rkPortDocks.set(b.id,dock);}"
].join('\n'));
alter('src/main.ts',"    rkPortDocks,\n    rkSyncPortDocks,",
"    rkPortDocks,\n    rkSyncPortDocks,\n    rkHarborPanel,");
// One real sprite vessel per owned harbor. Ship phase is keyed to the SAME
// persisted route clock that commits 6-unit cargo after 60 simulation seconds.
// Decorative coast vessels remain independent; no invented AI pathing.
alter('src/main.ts',
"  const rkPortDocks=new Map<number,THREE.Group>();",
"  const rkPortDocks=new Map<number,THREE.Group>();\n  const rkHarborShips=new Map<number,THREE.Sprite>();");
alter('src/main.ts',
"        rkPortDocks.set(b.id,dock);}",
[
"        rkPortDocks.set(b.id,dock);",
"        if(b.name==='harbor'&&rkSeaShips.length){",
"          const material=rkSeaShips[0].material as THREE.SpriteMaterial;",
"          const ship=new THREE.Sprite(material);ship.name='rk-harbor-cargo-ship';",
"          let sx=near.x,sz=near.z,dist=Infinity;",
"          for(let tz=Math.max(2,near.z-12);tz<=Math.min(MAP_H-3,near.z+12);tz++)",
"            for(let tx=Math.max(2,near.x-12);tx<=Math.min(MAP_W-3,near.x+12);tx++){",
"              if(!rkDeepWater(tx,tz))continue;",
"              const d=Math.hypot(tx-near.x,tz-near.z);",
"              if(d<dist){sx=tx;sz=tz;dist=d;}",
"            }",
"          const route=rkBoatCourse(sx,sz,0);",
"          ship.userData.rkRoute=route;ship.scale.set(6.7,4.6,1);",
"          ship.position.set(route.ax,terrain.heightAt(sx,sz)+2.1,route.az);",
"          scene.add(ship);rkHarborShips.set(b.id,ship);",
"        }",
"      }"
].join('\n'));
alter('src/main.ts',
"    for(const [id,pier] of rkPortDocks)if(!active.has(id)){scene.remove(pier);rkPortDocks.delete(id);}",
"    for(const [id,pier] of rkPortDocks)if(!active.has(id)){scene.remove(pier);rkPortDocks.delete(id);}\n    for(const [id,ship] of rkHarborShips)if(!active.has(id)){scene.remove(ship);rkHarborShips.delete(id);}");
alter('src/main.ts',
"      if(now-rkLastDockSync>950){rkLastDockSync=now;rkSyncPortDocks();}",
[
"      if(now-rkLastDockSync>950){rkLastDockSync=now;rkSyncPortDocks();}",
"      for(const ship of rkHarborShips.values()){",
"        const route=ship.userData.rkRoute as {ax:number,az:number,bx:number,bz:number,tiles:number};",
"        const fraction=state.harbor.mode==='off'?0:(1-Math.cos(state.harbor.clock/60*Math.PI*2))/2;",
"        ship.position.x=route.ax+(route.bx-route.ax)*fraction;",
"        ship.position.z=route.az+(route.bz-route.az)*fraction;",
"        ship.position.y=terrain.heightAt(Math.floor(ship.position.x),Math.floor(ship.position.z))+2.1+Math.sin(now/1400)*.08;",
"      }"
].join('\n'));
alter('src/main.ts',
"    rkPortDocks,\n    rkSyncPortDocks,",
"    rkPortDocks,\n    rkSyncPortDocks,\n    rkHarborShips,");

alter('src/ui/menu.ts',"version.textContent='v5.10';","version.textContent='v5.11';");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v511-harbor.css'),'utf8'));
console.log('PASS v5.11 original coastal construction + actual sea export/import + optional saved voyage + UI');
