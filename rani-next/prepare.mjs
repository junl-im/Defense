// Rani Next: reproducible modification of an isolated Fiefdom working tree.
// Keep AGPL-3.0 code and original art attribution. Original git submodule is pinned.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const project=path.resolve(import.meta.dirname,'..');
const file=p=>path.join(root,p);
function change(p,oldText,newText) {
 const s=fs.readFileSync(file(p),'utf8');
 assert.equal(s.split(oldText).length,2,p+': changed upstream source');
 fs.writeFileSync(file(p),s.replace(oldText,newText));
}
change('src/ui/menu.ts',"h1.textContent = 'FIEFDOM';","h1.textContent = '라니킹덤';");
change('src/ui/menu.ts',"sub.textContent = 'HOLD THE LAND · WORK IT · KEEP IT';","sub.textContent = '푸른 왕국을 건설하고, 지키고, 발전시키세요';");
change('src/main.ts','renderer.setClearColor(0x0d0c0a, 1);','renderer.setClearColor(0x10283b, 1);');
// One level closer from first boot: a real game camera change (not CSS scale).
// The sprite atlas is baked at scale 3, and zoom 1.5 stays within that detail.
change('src/engine/camera.ts','zoom: number = ZOOM_LEVELS[0];','zoom: number = ZOOM_LEVELS[1];');
change('src/engine/camera.ts','private targetZoom: number = ZOOM_LEVELS[0];','private targetZoom: number = ZOOM_LEVELS[1];');
change('src/main.ts',"const use3d = flags.get('r3d') !== '0';",
 `// Rani Next defaults to the genuine 2.5D four-angle game world.
  // The upstream optional 3D renderer remains available with ?r3d=1.
  const use3d = flags.get('r3d') === '1';`);
change('src/ui/hud.ts','--panel: rgba(24, 19, 12, .93);','--panel: rgba(12, 30, 46, .91);');
change('src/ui/hud.ts','--edge: rgba(196, 162, 96, .34);','--edge: rgba(219, 180, 108, .56);');
change('src/ui/hud.ts','--ink: #ecdfc2;','--ink: #fff1d4;');
change('src/ui/hud.ts','--gold: #f0c869;','--gold: #f1c87c;');
// Move the EXISTING true sea/coast map to the first selection. Preserve
// id/seed/map settings so existing game saves and world generation stay stable.
const mapFile=file('src/game/maps.ts'),source=fs.readFileSync(mapFile,'utf8');
const match=source.match(/  \{\n    id: 'coast',[\s\S]*?\n    lords: 1, difficulty: 'Fair',\n  \},\n/);
assert.ok(match && source.split("id: 'coast'").length===2,'coast map altered upstream');
const anchor='export const MAPS: MapDef[] = [\n';
assert.equal(source.split(anchor).length,2);
fs.writeFileSync(mapFile,source.replace(match[0],'').replace(anchor,anchor+match[0]));
// Already-approved independent transparent WebP assets, copied unchanged.
const assets={
 'rk_gold.webp':'assets/rani/ui/icons/rk_icon_resource_gold_v001.webp',
 'rk_wood.webp':'assets/rani/ui/icons/rk_icon_resource_wood_v001.webp',
 'rk_stone.webp':'assets/rani/ui/icons/rk_icon_resource_stone_v001.webp',
 'rk_food.webp':'assets/rani/ui/icons/rk_icon_resource_food_v001.webp',
 'rk_people.webp':'assets/rani/ui/icons/rk_icon_resource_population_v001.webp',
 'rk_house.webp':'assets/rani/buildings/housing/rk_building_house_a_v001.webp',
 'rk_market.webp':'assets/rani/buildings/economy/rk_building_market_v001.webp',
 'rk_ship.webp':'assets/rani/harbor/ships/rk_ship_trade_v001.webp',
 'rk_royal_button.webp':'assets/rani/ui/buttons/rk_btn_royal_primary_v001.webp',
 'rk_royal_panel.webp':'assets/rani/ui/panels/rk_panel_royal_hud_v001.webp',
 'rk_logo.webp':'assets/branding/rani-kingdom-logo.webp'
};
const dest=file('public/rani');fs.mkdirSync(dest,{recursive:true});
for(const [name,rel] of Object.entries(assets)){
 const from=path.join(project,rel);
 assert.ok(fs.statSync(from).size>1000,'Missing approved image '+rel);
 fs.copyFileSync(from,path.join(dest,name));
}
fs.copyFileSync(path.join(import.meta.dirname,'skin.css'),path.join(dest,'skin.css'));
fs.copyFileSync(path.join(import.meta.dirname,'menu-compact.js'),path.join(dest,'menu-compact.js'));
const index=file('index.html');let html=fs.readFileSync(index,'utf8');
assert.ok(!html.includes('/rani/skin.css'));
html=html.replace('</head>','  <link rel="stylesheet" href="/rani/skin.css">\n  </head>');
html=html.replace('<title>Fiefdom</title>','<title>라니킹덤 — 2.5D 개발판</title>');
html=html.replace('</body>','  <script type="module" src="/rani/menu-compact.js"></script>\n  </body>');
fs.writeFileSync(index,html);
console.log('PASS Rani Next: existing coastal map, real 2.5D sprites, approved original assets, source UI');
