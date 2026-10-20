// v5.7 construction usability: ground truth stays Fiefdom Placement.check.
// Native HUD, source-based Korean feedback, and target-sensitive hex controls.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function modify(rel,from,to){
 const file=path.join(root,rel),text=fs.readFileSync(file,'utf8');
 assert.equal(text.split(from).length,2,'Source changed: '+rel+' '+from.slice(0,90));
 fs.writeFileSync(file,text.replace(from,to));
}
const placementFile=path.join(root,'src/game/placement.ts');
let p=fs.readFileSync(placementFile,'utf8');
const replacements=[
 ["any: '', green: 'green land', rock: 'rock', iron: 'an iron seam',","any: '단단하고 물이 없는 땅', green: '풀밭', rock: '암반 지대', iron: '철광맥',"],
 ["sand: 'open ground', marsh: 'a pitch marsh',","sand: '모래·맨땅', marsh: '습지',"],
 ["reason: 'Unknown building'","reason: '알 수 없는 건물입니다.'"],
 ["reason: 'Outside the map'","reason: '지도 경계 밖입니다. 건물 크기만큼 안쪽으로 이동하세요.'"],
 ["? 'You cannot build on water'","? '물 위에는 건물을 설치할 수 없습니다. 육지로 옮기세요.'"],
 [": 'Something is in the way'",": '이미 건물·나무·바위가 차지한 자리입니다.'"],
 ["reason: "+String.fromCharCode(96)+"Must touch the \${def.storeFor}"+String.fromCharCode(96),
 "reason: def.storeFor === 'stockpile' ? '자재 창고에 바로 맞닿게 설치하세요.' : '같은 종류의 창고에 바로 맞닿게 설치하세요.'"],
 ["? 'The ground is too boggy to build on'","? '늪지여서 설치할 수 없습니다. 건조한 땅을 찾으세요.'"],
 [": "+String.fromCharCode(96)+"Must be built on \${TERRAIN_LABEL[def.terrain]}"+String.fromCharCode(96),
 ": "+String.fromCharCode(96)+"설치 가능한 지형: \${TERRAIN_LABEL[def.terrain]}"+String.fromCharCode(96)],
 ["reason: 'The ground is not level'","reason: '땅 높이가 고르지 않습니다. 평평한 자리로 옮기세요.'"],
 ["reason: 'Must be built on a shore'","reason: '물가에서만 건설 가능합니다. 바다나 강 옆의 육지를 고르세요.'"],
 ["reason: 'Outside your lands — extend them with walls, towers or a gatehouse'",
 "reason: '영지 밖입니다. 성벽·방어탑·성문을 지어 영토를 넓히세요.'"],
 ["reason: "+String.fromCharCode(96)+"Not enough \${missing.join(' and ')}"+String.fromCharCode(96),
 "reason: '부족한 자원: '+missing.map(r=>RK_RESOURCE_KO[r]??r).join(' · ')"],
];
for(const [from,to] of replacements){
 assert.equal(p.split(from).length,2,'Placement Korean anchor '+from.slice(0,60));
 p=p.replace(from,to);
}
const labelAnchor='function terrainAllows(need: TerrainNeed, ground: string): boolean {';
assert.equal(p.split(labelAnchor).length,2);
p=p.replace(labelAnchor,
"const RK_RESOURCE_KO:Record<string,string>={wood:'목재',stone:'석재',iron:'철',pitch:'역청',gold:'금',wheat:'밀',planks:'판자',oil:'기름'};\n\n"+labelAnchor);
fs.writeFileSync(placementFile,p);
// The already precise native 2.5D overlay calls Placement.check on EVERY
// legal origin. Improve the exact-footprint hover with source check and size.
modify('src/main.ts',
 "ok ? (placement.turnable ? "+String.fromCharCode(96)+"\${def.label} \\u00b7 , . to turn"+String.fromCharCode(96)+" : def.label)\n             : placement.lastCheck.reason, ok);",
 "ok ? (placement.turnable ? "+String.fromCharCode(96)+"설치 가능 · \${def.label} (\${def.footprint[0]}×\${def.footprint[1]}칸) · , . 회전"+String.fromCharCode(96)+" : "+String.fromCharCode(96)+"설치 가능 · \${def.label} (\${def.footprint[0]}×\${def.footprint[1]}칸)"+String.fromCharCode(96)+")\n             : "+String.fromCharCode(96)+"설치 불가 · \${placement.lastCheck.reason}"+String.fromCharCode(96)+", ok);");
// Visible worker shortage flags are also gameplay-facing Korean.
modify('src/main.ts',
 "text: want - b.staff === want ? 'no worker' : `short ${want - b.staff}`,
 "text: want - b.staff === want ? '작업자 없음' : `작업자 ${want - b.staff}명 부족`,
);
// Contextual action menu: show only functional choices, keep disabled reasons
// in visible source-backed status messages rather than unexplained grey tiles.
const wheelFile=path.join(root,'src/ui/raniWheel.ts');
let w=fs.readFileSync(wheelFile,'utf8');
const spec="    const signature=JSON.stringify(status);";
assert.equal(w.split(spec).length,2,'raniWheel live state changed');
w=w.replace(spec,[
 "    // A global construction shortcut does not belong to the selected",
 "    // building's wheel; the permanent original '건설' toolbar does that.",
 "    // Keep original callbacks in DOM for backwards-compatible automated QA.",
 "    for(const [id,button] of actionButtons){",
 "      button.hidden = id==='build'",
 "        || (id==='upgrade'&&!status.canUpgrade)",
 "        || (id==='repair'&&!status.canRepair)",
 "        || (id==='manage'&&!status.canManage)",
 "        || (id==='remove'&&!status.removable);",
 "      button.setAttribute('aria-hidden',String(button.hidden));",
 "    }",
 "    // Reasons are always visible, not locked in disabled-button tooltips.",
 "    const why:string[]=[];",
 "    if(target.building){",
 "      if(!status.canUpgrade)why.push(status.level>=3?'강화: 이미 최고 단계':'강화: 이 건물에서 불가능');",
 "      if(!status.canRepair)why.push(status.hp>=status.maxHp?'수리: 내구도 정상':'수리: 현재 불가능');",
 "      if(!status.canManage)why.push('관리: 별도 전환 기능 없음');",
 "      if(!status.removable)why.push('철거: '+status.reason);",
 "    }else why.push('자연물에는 강화·수리·생산 관리가 없습니다.');",
 "    if(!message.dataset.rkManual){",
 "      message.textContent=why.length?why.join('  ·  '):'이 건물의 가능한 행동을 선택하세요.';",
 "    }",
 "    const signature=JSON.stringify(status);"
].join('\n'));
w=w.replace("    message.textContent=result.message;\n    update();",
"    message.textContent=result.message;\n    message.dataset.rkManual='1';\n    update();");
w=w.replace("    host.hidden=false;message.textContent='';",
"    host.hidden=false;message.textContent='';delete message.dataset.rkManual;");
fs.writeFileSync(wheelFile,w);
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v57-construction.css'),'utf8'));
const guidePath=path.join(root,'public/rani/v57-guide.js');
fs.copyFileSync(path.join(import.meta.dirname,'v57-guide.js'),guidePath);
modify('index.html', '  <script type="module" src="/rani/menu-compact.js"></script>',
 '  <script type="module" src="/rani/menu-compact.js"></script>\n  <script type="module" src="/rani/v57-guide.js"></script>');
console.log('PASS v5.7 exact-footprint Korean placement, contextual hex actions, original-engine new-player guide');
