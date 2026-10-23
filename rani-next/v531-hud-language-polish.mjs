// v5.31 maintenance: translate the last native, frequently regenerated HUD fragments.
// Patch only visible text. Game state, resource IDs, save schema and raster art stay untouched.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const target=path.join(root,'src/ui/hud.ts');
let src=fs.readFileSync(target,'utf8');
function replace(from,to,count=1){
  const found=src.split(from).length-1;
  assert.equal(found,count,'Native HUD localization drift: '+from+'; got '+found);
  src=src.split(from).join(to);
}
// Native HUD rerenders its resource bar every tick: delayed DOM translation flickers.
replace(' — click for history" data-res=', ' · 기록 보기" data-res=');
replace("this.state.speedLocked ? 'Speed — fixed in a match' : 'Speed'",
        "this.state.speedLocked ? '게임 속도 · 대전 중 고정' : '게임 속도'");
// The food/supply sheet is also rebuilt continuously; translate both branches.
replace('>no inn</b>', '>여관 없음</b>');
replace('>Stores</span><b class="g">holding</b>', '>저장 상태</span><b class="g">안정</b>');
replace(' / min</b>', ' / 분</b>',3);
replace('} min</b>', '}분</b>');
fs.writeFileSync(target,src);
console.log('PASS native live resource tooltips, food supply, time units and speed lock are Korean');
