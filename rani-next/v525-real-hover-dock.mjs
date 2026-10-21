// v5.25 Native building info, invalid store payload and mobile action grouping.
// IMPORTANT: patches change displayed strings only. No save, costs or engine state.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const filename=p=>path.join(root,p);
function patch(file,from,to) {
 const f=filename(file);const s=fs.readFileSync(f,'utf8');
 assert.equal(s.split(from).length,2,'v5.25 source drift '+file+' '+from.slice(0,115));
 fs.writeFileSync(f,s.replace(from,to));
}
// Build the actual native hover string in Korean; no after-paint translation.
patch('src/main.ts',
 "      if (def.housing) bits.push(\`houses \${def.housing}\`);",
 "      if (def.housing) bits.push(\`주거 수용 \${def.housing}명\`);");
patch('src/main.ts',
 "        bits.push(pile ? \`\${pile.count} \${pile.res}\` : 'empty');",
 [
 "        // Unassigned store tiles legitimately have res:null and count:0.",
 "        // Never stringify nullable stock keys ('0null', '0 null').",
 "        if (pile?.res && Number.isFinite(pile.count) && pile.count > 0) {",
 "          const name=RESOURCE_LABELS[pile.res as keyof typeof RESOURCE_LABELS];",
 "          bits.push(\`\${name || '자원'} \${Math.floor(pile.count)}개\`);",
 "        } else bits.push('비어 있음');"
 ].join('\n'));
patch('src/main.ts',
 "    snapshot, applySave, openPause,",
 "    snapshot, applySave, openPause, describeAt,"); // for actual-world regression QA
// Provide Korean text at native main tooltip even if runtime transcriber is not mounted.
patch('src/main.ts',
 "      if (def.workers) bits.push(\`\${mine.staff}/\${def.workers} worker\${def.workers > 1 ? 's' : ''}\`);",
 "      if (def.workers) bits.push(\`일꾼 \${mine.staff}/\${def.workers}명\`);");
patch('src/main.ts',
 "        bits.push(\`\${making.amount} \${goodName(making.output, making.amount)}\`\n                  + \` / \${making.seconds}s\`);",
 "        bits.push(\`\${RESOURCE_LABELS[making.output]} \${making.amount}개 / \${making.seconds}초\`);");
patch('src/main.ts',
 "        if (luck !== 1) bits.push(luck > 1 ? \`good season ×\${luck}\` : \`bad season ×\${luck}\`);",
 "        if (luck !== 1) bits.push(luck > 1 ? \`풍작 ×\${luck}\` : \`흉작 ×\${luck}\`);");
patch('src/main.ts',
 "        bits.push(\`click to make \${RESOURCE_LABELS[other.output].toLowerCase()}\`);",
 "        bits.push(\`클릭하면 \${RESOURCE_LABELS[other.output]} 생산\`);");
patch('src/main.ts',
 "        bits.push(mine.raised ? 'shut — click to open' : 'open — click to shut');",
 "        bits.push(mine.raised ? '닫힘 · 클릭하여 열기' : '열림 · 클릭하여 닫기');");
patch('src/main.ts',
 "      if (mine.undug) bits.push('marked out — waiting to be dug');",
 "      if (mine.undug) bits.push('굴착 대기');");
patch('src/main.ts',
 "      if (mine.ablaze) bits.push('BURNING');",
 "      if (mine.ablaze) bits.push('화재 발생');");
patch('src/main.ts',
 "        bits.push(\`\${state.armouryUsed} / \${state.armouryCapacity} weapons\`);",
 "        bits.push(\`무기 보관 \${state.armouryUsed}/\${state.armouryCapacity}개\`);");
patch('src/main.ts',
 "        rows.map(([r, n]) => \`\${n} \${r}\`).join(', ');",
 "        rows.filter(([r,n])=>r && Number.isFinite(n) && (n??0)>0)\n          .map(([r, n]) => \`\${RESOURCE_LABELS[r as keyof typeof RESOURCE_LABELS]||'자원'} \${n}개\`).join(' · ');");
patch('src/main.ts',
 "        bits.push(\`shelf \${state.shelfUsed} / \${state.shelfCapacity} — takes and gives out any good\`);",
 "        bits.push(\`공용 선반 \${state.shelfUsed}/\${state.shelfCapacity} · 모든 자원 보관\`);");
patch('src/main.ts',
 "        bits.push(def.needsHauler ? \`\${what(held)} waiting to be hauled\` : what(held));",
 "        bits.push(def.needsHauler ? \`\${what(held)} · 운반 대기\` : what(held));");
patch('src/main.ts',
 "      if (mine.hp < full) bits.push(\`\${Math.max(0, Math.round(mine.hp))}/\${full} hp\`);",
 "      if (mine.hp < full) bits.push(\`내구도 \${Math.max(0, Math.round(mine.hp))}/\${full}\`);");
patch('src/main.ts',
 "        if (b.undug) bits.push('marked out');",
 "        if (b.undug) bits.push('굴착 대기');");
patch('src/main.ts',
 "        if (b.ablaze) bits.push('burning');",
 "        if (b.ablaze) bits.push('화재 발생');");
patch('src/main.ts',
 "        if (b.hp < full) bits.push(\`\${Math.max(0, Math.round(b.hp))}/\${full} hp\`);",
 "        if (b.hp < full) bits.push(\`내구도 \${Math.max(0, Math.round(b.hp))}/\${full}\`);");
patch('src/main.ts',"productionOf, goodName, HAUL_RANGE,", "productionOf, HAUL_RANGE,"); // Native production hover now uses localized RESOURCE_LABELS
// A persistent English stock-full alert is emitted by the trade/deposit core.
// Localize it at source, avoiding generic client-side text rewriting.
patch('src/game/state.ts',
 "      const where = STORE_LABELS[needed];",
 "      const where = needed === 'granary' ? '식량 창고' : needed === 'armoury' ? '무기고' : '자재 창고';");
patch('src/game/state.ts',
 "        `${where} is full — nowhere to put ${RESOURCE_LABELS[resource].toLowerCase()}`,",
 "        `${where} 가득 참 · ${RESOURCE_LABELS[resource]} 보관 공간이 없습니다.`,");
patch('src/game/state.ts',
 "GRANARY_TILE_CAPACITY, ARMOURY_CAPACITY, WEAPON_RESOURCES, storeOf, STORE_LABELS,",
 "GRANARY_TILE_CAPACITY, ARMOURY_CAPACITY, WEAPON_RESOURCES, storeOf,");
// Native per-frame English controls escaped earlier periodic translation.
patch('src/main.ts',
 "    stanceBtn.textContent = holding ? '\\u{1F6E1} Holding — tap to attack'\n                                    : '⚔ Attacking — tap to hold';",
 "    stanceBtn.textContent = holding ? '\\u{1F6E1} 위치 사수 · 누르면 공격'\n                                    : '⚔ 공격 중 · 누르면 위치 사수';");
patch('src/ui/hud.ts',
 "        fsBtn.textContent = on ? 'Leave fullscreen' : 'Fullscreen';",
 "        fsBtn.textContent = on ? '전체 화면 해제' : '전체 화면';");
patch('src/ui/hud.ts',
 "      hd.querySelector('.tw')!.textContent = off ? 'show' : 'hide';",
 "      hd.querySelector('.tw')!.textContent = off ? '펼치기' : '접기';");
patch('src/ui/hud.ts',
 "        w2.textContent = \`Build \${/^[aeiou]/.test(l) ? 'an' : 'a'} \${l} first.\`;",
 "        w2.textContent = \`\${label} 건설이 먼저 필요합니다.\`;");
patch('src/ui/hud.ts',
 "      buy.title = \`Buy one now for \${price[0]} gold\`;",
 "      buy.title = \`즉시 구매 · 금 \${price[0]}\`;");
patch('src/ui/hud.ts',
 "      sell.title = \`Sell one now for \${price[1]} gold\`;",
 "      sell.title = \`즉시 판매 · 금 \${price[1]}\`;");
const hud=filename('src/ui/hud.ts');
let source=fs.readFileSync(hud,'utf8');
// The keyboard hints previously referred to right-click despite the global
// v5.20 right-click ban. Ctrl+left is the actual troop-order alternative.
for(const [from,to] of [
 ['우클릭으로 이동','Ctrl+클릭으로 이동'],
 ['성벽 우클릭으로 병력 배치','성벽 Ctrl+클릭으로 병력 배치'],
 ['우클릭으로 순찰 지정','Ctrl+클릭으로 순찰 지정']
]) {
 if(source.includes(from))source=source.split(from).join(to);
}
fs.writeFileSync(hud,source);

// Existing seven mobile buttons are regrouped without duplicates.
const touch=filename('src/ui/touch.ts');
let s=fs.readFileSync(touch,'utf8');
const sub=(a,b)=>{assert.ok(s.includes(a),'v5.25 touch anchor '+a);s=s.split(a).join(b)};
// v5.12 already localized 지도/정보/선택/건설; never revert the original wording.
sub("  let buildBtn: HTMLButtonElement;","  let buildBtn: HTMLButtonElement;\n  let menuBtn: HTMLButtonElement;");




sub("btn('☰', () => hooks.pause());","menuBtn = btn('메뉴', () => hooks.pause());");

const start="  function setMode(m: PadMode) {";
assert.ok(s.includes(start),'touch grouping point missing');
s=s.replace(start,[
 "  const actions=document.createElement('div');",
 "  actions.className='rk-touch-actions';",
 "  actions.setAttribute('aria-label','건설·게임 메뉴');",
 "  buildBtn.id='rk-touch-build';menuBtn.id='rk-touch-menu';",
 "  actions.append(buildBtn,menuBtn);", // moves existing interactive buttons
 "  pad.appendChild(actions);",
 "",
 start
].join('\n'));
fs.writeFileSync(touch,s);
patch('src/ui/menu.ts',"version.textContent='v5.24';","version.textContent='v5.25';");
patch('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.24';",
 "rkBuildName.textContent='라니킹덤 · v5.25';");
fs.appendFileSync(filename('public/rani/skin.css'),
 '\n'+fs.readFileSync(path.join(import.meta.dirname,'v525-dock.css'),'utf8'));
console.log('PASS v5.25 real housing and nullable store tooltip, native Korean details, real mobile grouped buttons');
