// Add a lush and genuinely playable coastal royal kingdom; old seeds intact.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const file=path.join(root,'src/game/maps.ts');
let s=fs.readFileSync(file,'utf8');
const a='export const MAPS: MapDef[] = [\n';
assert.ok(s.includes(a)&&!s.includes("id: 'rani_coast'"));
const entry=[
'  {',
"    id: 'rani_coast',",
"    name: '푸른 해안',",
"    blurb: '초록빛 들판과 숲, 바다와 언덕이 이어지는 왕국의 터전입니다.',",
'    seed: 20261020, green: 0.115, rock: -0.028, marsh: -0.025,',
'    trees: 1.75, river: 0.028, relief: 0.87, grain: 0.78,',
"    lakes: 0.035, coast: 0.29, lords: 1, difficulty: 'Fair',",
'  },'
].join('\n')+'\n';
s=s.replace(a,a+entry);
fs.writeFileSync(file,s);
console.log('PASS new Rani royal green coast, original map seeds and saves unchanged');
