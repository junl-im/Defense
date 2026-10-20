// v5.8: projected exact building-footprint outline, state-driven affordability
// and a faster guided entry into original Fiefdom build selection.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const file=p=>path.join(root,p);
function change(rel,from,to){
 const p=file(rel),s=fs.readFileSync(p,'utf8');
 assert.equal(s.split(from).length,2,'v5.8 source drift '+rel+': '+from.slice(0,75));
 fs.writeFileSync(p,s.replace(from,to));
}
change('src/ui/menu.ts',"version.textContent='v5.7';","version.textContent='v5.8';");
const p=file('src/main.ts');let main=fs.readFileSync(p,'utf8');
const replace=(a,b)=>{assert.equal(main.split(a).length,2,'v5.8 main source drift '+a.slice(0,75));main=main.replace(a,b);};
replace('  const placement = new Placement(placementWorld, state);\n  const hud = new Hud(state, placement);',[
 '  const placement = new Placement(placementWorld, state);',
 '  const hud = new Hud(state, placement);',
 '  // Only presentation: projected directly with the real game camera and',
 '  // validated with the exact Placement.check() used on final click.',
 "  const rkFootprint=document.createElement('canvas');",
 "  rkFootprint.id='rk-footprint-preview';",
 "  rkFootprint.setAttribute('aria-hidden','true');",
 '  document.body.appendChild(rkFootprint);',
 "  const rkCtx=rkFootprint.getContext('2d');",
 '  const drawRkFootprint=()=>{',
 '    if(!rkCtx)return;',
 '    const width=window.innerWidth,height=window.innerHeight;',
 '    const ratio=Math.min(2,window.devicePixelRatio||1);',
 '    const bw=Math.round(width*ratio),bh=Math.round(height*ratio);',
 '    if(rkFootprint.width!==bw||rkFootprint.height!==bh){',
 '      rkFootprint.width=bw;rkFootprint.height=bh;',
 '      rkFootprint.style.width=width+"px";rkFootprint.style.height=height+"px";',
 '    }',
 '    rkCtx.setTransform(ratio,0,0,ratio,0,0);',
 '    rkCtx.clearRect(0,0,width,height);',
 '    const selected=placement.selected,hover=placement.hover;',
 "    if(!selected||!hover){rkFootprint.dataset.rkOrigin='';rkFootprint.dataset.rkLegal='';return;}",
 '    const def=BUILDINGS[selected];if(!def)return;',
 '    const x=Math.floor(hover.x),z=Math.floor(hover.z);',
 '    const [w,d]=def.footprint;',
 '    const legal=placement.check(selected,x,z).ok;',
 '    const corners:[[number,number],[number,number],[number,number],[number,number]]=[',
 '      [x,z],[x+w,z],[x+w,z+d],[x,z+d],',
 '    ];',
 '    rkCtx.beginPath();',
 '    for(let i=0;i<corners.length;i++){',
 '      const [tx,tz]=corners[i];',
 '      const [sx,sy]=iso.worldToScreen(tx,terrain.heightAt(tx,tz)+.07,tz);',
 '      if(i===0)rkCtx.moveTo(sx,sy);else rkCtx.lineTo(sx,sy);',
 '    }',
 '    rkCtx.closePath();',
 "    rkCtx.fillStyle=legal?'rgba(50,216,123,.23)':'rgba(240,83,70,.29)';",
 '    rkCtx.fill();',
 '    rkCtx.lineWidth=2.5;',
 "    rkCtx.strokeStyle=legal?'#a2ffc4':'#ffaaa3';",
 '    rkCtx.shadowBlur=9;',
 "    rkCtx.shadowColor=legal?'#47ff89':'#ff4444';",
 '    rkCtx.stroke();rkCtx.shadowBlur=0;',
 "    rkFootprint.dataset.rkOrigin=x+','+z;",
 "    rkFootprint.dataset.rkSize=w+'x'+d;",
 "    rkFootprint.dataset.rkLegal=String(legal);",
 '  };',
].join('\n'));
replace('  function drawScene(): void {\n    const rot = iso.rotation;',
'  function drawScene(): void {\n    drawRkFootprint();\n    const rot = iso.rotation;');
const wheelFile=file('src/ui/raniWheel.ts');let wheel=fs.readFileSync(wheelFile,'utf8');
const wrep=(a,b)=>{assert.equal(wheel.split(a).length,2,'v5.8 wheel source drift '+a.slice(0,70));wheel=wheel.replace(a,b);};
wrep('  manageLabel: string; removable: boolean; reason: string;',
'  manageLabel: string; removable: boolean; reason: string;\n  upgradeReason?: string; repairReason?: string;');
wrep("      if(!status.canUpgrade)why.push(status.level>=3?'강화: 이미 최고 단계':'강화: 이 건물에서 불가능');",
"      if(!status.canUpgrade)why.push('강화: '+(status.upgradeReason || (status.level>=3?'이미 최고 단계':'이 건물에서 불가능')));");
wrep("      if(!status.canRepair)why.push(status.hp>=status.maxHp?'수리: 내구도 정상':'수리: 현재 불가능');",
"      if(!status.canRepair)why.push('수리: '+(status.repairReason || (status.hp>=status.maxHp?'내구도 정상':'현재 불가능')));");
fs.writeFileSync(wheelFile,wheel);
// Guard *true affordability* in canUpgrade/canRepair, not just level/damage.
// UI disabled state and action status now agree with actual source expenses.
replace("        canUpgrade:!mp&&level<3,canRepair:!mp&&b.hp<maxHp,",
"        canUpgrade:!mp&&level<3&&rkCanSpend(rkCost(b)),canRepair:!mp&&b.hp<maxHp&&rkCanSpend(rkCost(b,true)),\n        upgradeReason:mp?'대전에서는 이용할 수 없습니다.':level>=3?'이미 최고 단계입니다.':!rkCanSpend(rkCost(b))?'자원 부족 · '+rkCostText(rkCost(b)):'',\n        repairReason:mp?'대전에서는 이용할 수 없습니다.':b.hp>=maxHp?'건물이 손상되지 않았습니다.':!rkCanSpend(rkCost(b,true))?'자원 부족 · '+rkCostText(rkCost(b,true)):'',");
fs.writeFileSync(p,main);
fs.copyFileSync(path.join(import.meta.dirname,'v58-guide.js'),file('public/rani/v57-guide.js'));
fs.appendFileSync(file('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v58-precision.css'),'utf8'));
console.log('PASS v5.8 projected actual footprint, accurate upgrade/repair costs and contextual starter selection');
