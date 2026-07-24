import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const main=read('src/main.js'); const css=read('src/style.css'); const html=read('index.html');
const checks=[
 ['package version remains v20 or later',Number((JSON.parse(read('package.json')).dokkaebi?.lineageVersion || JSON.parse(read('package.json')).version).split('.')[0]) >= 20],
 ['runtime retains v20 lineage',main.includes('installKoreanLanguageGuard')&&main.includes('VisualIntegrationDirector')],
 ['Korean language guard',main.includes('installKoreanLanguageGuard')&&fs.existsSync('src/runtime/korean-language-guard.js')],
 ['visual integration director',main.includes('VisualIntegrationDirector')&&fs.existsSync('src/runtime/visual-integration-director.js')],
 ['mascot cache revision',/title-mascot-(?:v17|v112)\.webp\?rev=(?:visible-v20|presence-v21|automation-v22|quiet-screen-v23|boot-recovery-v2301|clean-foundation-v2302|native-input-v2310|release-v102-b24-2|release-v105-b24-5|release-v107-b24-7|release-v108-b24-8|release-v112-b24-12)/.test(html)],
 ['desktop title cache revision',/title-bg-desktop-(?:v17|v112)\.webp\?rev=(?:visible-v20|presence-v21|automation-v22|quiet-screen-v23|boot-recovery-v2301|clean-foundation-v2302|native-input-v2310|release-v102-b24-2|release-v105-b24-5|release-v107-b24-7|release-v108-b24-8|release-v112-b24-12)/.test(html)],
 ['mobile compact HUD',css.includes('Visible Combat Rebuild')&&css.includes('#mission-panel,#run-seed-chip,#stage-chip,#council-chip')],
 ['smaller sacred tree',main.includes('premium.scale.setScalar(.62)')],
 ['higher scenic camera',read('src/engine/camera-profile.js').includes('pitch: 0.86')],
 ['strong projectile visibility',main.includes('data.radius * 1.32')&&main.includes("fxTrail.material.opacity = poolKey === 'wind' ? .7 : .5")]
];
let failed=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
if(failed)process.exit(1); console.log('\nv20.0.0 Visible Combat Rebuild contract verified');
