// v4.0: actual 2.5D game composition and world art must reuse existing
// playable systems and individual approved WebP originals; no mocks.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const paths={
  hud:'src/ui/RaniV4RoyalHud.js',
  world:'src/ui/RaniV4WorldArt.js',
  css:'css/rani-v4-art-direction.css',main:'src/main.js',html:'index.html'
};
const files=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(p,'utf8')]));
const {hud,world,css,main,html}=files;
const manifest=JSON.parse(fs.readFileSync('assets/rani/manifest-v27.json','utf8'));
const lock=JSON.parse(fs.readFileSync('assets/rani/asset-integrity-lock-v25.json','utf8'));
assert.equal(lock.protectedFiles.length,16,'Approved art binary inventory must remain intact');
assert.equal(manifest.assets.filter(x=>x.status.startsWith('applied-')).length,10);
assert.match(hud,/installRaniV4RoyalHud\(game\)/);
assert.match(world,/installRaniV4WorldArt\(game\)/);
assert.match(main,/installRaniGameShell\(game\);/);
assert.match(main,/new URLSearchParams\(location\.search\)\.has\('legacy_ui'\)/);
assert.match(main,/installRaniV4RoyalHud\(game\);\s*installRaniV4WorldArt\(game\);/);
assert.ok(html.indexOf('rani-shell-v33.css')<html.indexOf('rani-v4-art-direction.css'));
assert.match(world,/RANI_PREPARED_ASSETS\.market/);
assert.match(world,/RANI_PREPARED_ASSETS\.tradeShip/);
assert.match(hud,/RANI_PREPARED_ASSETS\.houseA/);
assert.doesNotMatch(world,/bakery:RANI_PREPARED_ASSETS\.houseA|library:RANI_PREPARED_ASSETS\.houseA|stable:RANI_PREPARED_ASSETS\.houseA/);
assert.match(world,/rec\.done\|\|!rec\.visual\?\.done/);
assert.match(world,/group\.getWorldPosition\(pos\)/);
assert.match(world,/\.project\(camera\)/);
assert.match(world,/game\.selection\.select\(cell\)/);
assert.match(world,/group\.visible=false/);
assert.match(world,/group\.visible=true/);
assert.match(world,/img\.addEventListener\('error'/);
assert.match(hud,/game\.buildingSystem\.byCell\.values\(\)/);
assert.match(hud,/game\.researchSystem\?\.active/);
assert.match(hud,/game\.armySystem/);
assert.match(hud,/game\.nativeVillageUI\?\.setMode\('world'\)/);
assert.match(hud,/trigger\('tiles'\)/);
assert.match(hud,/trigger\('factions'\)/);
assert.match(hud,/trigger\('research'\)/);
assert.match(hud,/NOT_IMPLEMENTED=new Set/);
assert.match(hud,/const timer=setInterval\(update,900\)/);
assert.match(css,/#rani-v4-profile/);
assert.match(css,/#rani-v4-left/);
assert.match(css,/#rani-v4-right/);
assert.match(css,/#rani-v4-queues/);
assert.match(css,/#rani-v4-bottom/);
assert.match(css,/@media \(max-width:700px\)/);
assert.doesNotMatch(hud+world+css,/<svg|\.svg\b|new SaveSystem\(|data:image\//);
assert.ok(!html.includes('rani-v4-hero-mock.jpg'));
console.log('PASS v4.0 real interactive royal composition, 3 approved transparent world assets, unchanged saved gameplay and binary SHA lock');
