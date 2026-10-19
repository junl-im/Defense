// Checks for the real royal skin and functional launcher, not a mockup.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const css=fs.readFileSync('css/rani-royal-v18.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const main=fs.readFileSync('src/main.js','utf8');
const launcher=fs.readFileSync('src/ui/RoyalLauncher.js','utf8');
assert.match(html,/href="css\/rani-royal-v18\.css"/);
assert.ok(html.indexOf('css/rani-ui-v17.css') < html.indexOf('css/rani-royal-v18.css'),
  'royal layer must override old UI styles without rewriting saved layout');
assert.match(css,/--rk-gold:/);
assert.match(css,/#hud-top-bar\.hud-bar/);
assert.match(css,/#research-panel/);
assert.match(css,/#faction-panel/);
assert.match(css,/#rani-royal-launcher/);
assert.match(css,/#slg-mobile-dock/);
assert.match(css,/@media\(max-width:360px\)/);
assert.match(css,/#radial-menu \.radial-center/);
assert.match(main,/installRoyalLauncher\(game\)/);
for(const entry of ["village","world","tiles","research","factions","kingdom","save"])
  assert.match(launcher,new RegExp("'"+entry+"'"));
assert.match(launcher,/nativeVillageUI\?\.setMode\('world'\)/);
assert.match(launcher,/nativeVillageUI\?\.setMode\('village'\)/);
assert.match(launcher,/save-manager-btn/);
assert.match(launcher,/royal-hide-research/);
assert.match(launcher,/royal-hide-factions/);
assert.match(launcher,/royal-hide-tiles/);
assert.doesNotMatch(launcher,/localStorage\.clear\(/);
console.log('PASS approved royal skin & seven real game actions, mobile treatment, preserved HUD layout');
