import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const menu=read('src/ui/menu.ts'),main=read('src/main.ts'),maps=read('src/game/maps.ts');
const html=read('index.html');
assert.match(menu,/h1\.textContent = '라니킹덤'/);
assert.match(menu,/영주 선택 →/); // true gameplay button preserved
assert.match(main,/const use3d = flags\.get\('r3d'\) === '1'/);
assert.match(main,/renderer\.setClearColor\(0x10283b, 1\)/);
assert.match(read('src/engine/camera.ts'),/zoom: number = ZOOM_LEVELS\[1\]/);
assert.match(read('src/engine/camera.ts'),/targetZoom: number = ZOOM_LEVELS\[1\]/);
assert.ok(maps.indexOf("id: 'coast'") < maps.indexOf("id: 'wadi'"));
assert.match(html,/<title>라니킹덤 — 2\.5D 개발판<\/title>/);
assert.ok(!html.includes('.svg'));
assert.match(html,/rani\/menu-compact\.js/);
const compact=read('public/rani/menu-compact.js');
assert.match(compact,/rani-map-picker/);
assert.match(compact,/grid\.addEventListener\('click'/);
assert.match(compact,/enhanceGameHud/);
assert.match(compact,/rani-controls-toggle/);
assert.match(compact,/rani-info-toggle/);
assert.match(compact,/attachApprovedArt/);
assert.match(compact,/rani-approved-royal-panel/);
assert.match(compact,/rani-market-art/);
assert.match(compact,/rani-approved-building/);

for(const name of ['rk_gold.webp','rk_wood.webp','rk_stone.webp',
'rk_food.webp','rk_people.webp','rk_house.webp','rk_market.webp',
'rk_ship.webp','rk_logo.webp','rk_royal_button.webp','rk_royal_panel.webp','skin.css','menu-compact.js']){
  assert.ok(fs.statSync(path.join(root,'public/rani',name)).size>100,name);
}
const metadata=JSON.parse(read('public/assets/sprites/buildings.json'));
for(const name of ['keep','gatehouse','wall','tower']){
 assert.equal(metadata.filter(m=>m.name===name).length,4,name);
}
console.log('PASS Rani Next source: true coastal map, 2.5D atlas, preserved original controls and originals');
