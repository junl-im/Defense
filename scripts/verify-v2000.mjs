import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const main=read('src/main.js'); const css=read('src/style.css'); const html=read('index.html');
const checks=[
 ['v20 game version',main.includes("GAME_VERSION = '20.0.0'")],
 ['Korean language guard',main.includes('installKoreanLanguageGuard')&&fs.existsSync('src/runtime/korean-language-guard.js')],
 ['visual integration director',main.includes('VisualIntegrationDirector')&&fs.existsSync('src/runtime/visual-integration-director.js')],
 ['mascot cache revision',html.includes('title-mascot-v17.webp?rev=visible-v20')],
 ['desktop title cache revision',html.includes('title-bg-desktop-v17.webp?rev=visible-v20')],
 ['mobile compact HUD',css.includes('Visible Combat Rebuild')&&css.includes('#mission-panel,#run-seed-chip,#stage-chip,#council-chip')],
 ['smaller sacred tree',main.includes('premium.scale.setScalar(.62)')],
 ['higher scenic camera',read('src/engine/camera-profile.js').includes('pitch: 0.86')],
 ['strong projectile visibility',main.includes('data.radius * 1.32')&&main.includes("fxTrail.material.opacity = poolKey === 'wind' ? .7 : .5")]
];
let failed=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
if(failed)process.exit(1); console.log('\nv20.0.0 Visible Combat Rebuild contract verified');
