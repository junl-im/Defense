// v5.39 — simplify the real building catalog and reduce mobile GPU fill-rate.
// Economy, saves, placements, assets and the engine are unchanged.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function patch(file,from,to){const p=path.join(root,file),s=fs.readFileSync(p,'utf8');
 assert.equal(s.split(from).length,2,'v5.39 drift '+file+' '+from.slice(0,70));fs.writeFileSync(p,s.replace(from,to));}
const mod=path.join(root,'src/ui/raniEasyUi.ts');
assert.ok(!fs.existsSync(mod),'duplicate v5.39');
fs.copyFileSync(path.join(import.meta.dirname,'v539-easy-ui.ts'),mod);
const main=path.join(root,'src/main.ts'),src=fs.readFileSync(main,'utf8');
const imp="import { raniPixelRatio, installRaniEasyUi, raniMountPhoneQuality } from './ui/raniEasyUi';\n";
assert.ok(!src.includes(imp),'duplicate v5.39 import');fs.writeFileSync(main,imp+src);
patch('src/main.ts',
`  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));`,
`  renderer.setPixelRatio(raniPixelRatio());`);
patch('src/main.ts',
`  const hud = new Hud(state, placement);`,
`  const hud = new Hud(state, placement);
  installRaniEasyUi(renderer);`);
patch('src/main.ts',
`    if (phone) hud.enablePhoneLayout();`,
`    if (phone) {
      hud.enablePhoneLayout();
      raniMountPhoneQuality(); // independent of collapsible #controls
    }`);
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v539-easy-ui.css'),'utf8'));
console.log('PASS v5.39 easy catalog, selectable render pixel ratio and local prefs');