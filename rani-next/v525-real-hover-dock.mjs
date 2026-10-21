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
// Existing seven mobile buttons are regrouped without duplicates.
const touch=filename('src/ui/touch.ts');
let s=fs.readFileSync(touch,'utf8');
const sub=(a,b)=>{assert.ok(s.includes(a),'v5.25 touch anchor '+a);s=s.split(a).join(b)};
sub("  let buildBtn: HTMLButtonElement;","  let buildBtn: HTMLButtonElement;\n  let menuBtn: HTMLButtonElement;");
sub("btn('Map', () => hooks.openMap?.());","btn('지도', () => hooks.openMap?.());");
sub("btn('Info', () => hooks.openInfo?.());","btn('정보', () => hooks.openInfo?.());");
sub("btn('Move', () => setMode(mode === 'command' ? 'select' : 'command'), 'grow');",
    "btn('이동', () => setMode(mode === 'command' ? 'select' : 'command'), 'grow');");
sub("buildBtn = btn('Build', () => hooks.toggleBuild());","buildBtn = btn('건설', () => hooks.toggleBuild());");
sub("btn('☰', () => hooks.pause());","menuBtn = btn('메뉴', () => hooks.pause());");
sub("    cmd.textContent = m === 'command' ? 'Ordering' : 'Move';",
    "    cmd.textContent = m === 'command' ? '명령 중' : '이동';");
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
