import fs from 'node:fs';
const read = (path) => fs.readFileSync(path, 'utf8');
const main = read('src/main.js');
const css = read('src/style.css');
const html = read('index.html');
const pkg = JSON.parse(read('package.json'));
const checks = [
  ['package version remains v21 or later', Number((pkg.dokkaebi?.lineageVersion || pkg.version).split('.')[0]) >= 21],
  ['game lineage remains v21 or later', Number((pkg.dokkaebi?.lineageVersion || pkg.version).split('.')[0]) >= 21 && main.includes('LEGACY_LINEAGE_VERSION')],
  ['engine version remains 18 or later', /ENGINE_VERSION = '(?:18|19|2[0-9]|[3-9][0-9])\.\d+\.\d+'/.test(read('src/engine/engine-config.js'))],
  ['save schema remains 19 or later', /SAVE_SCHEMA_VERSION = (?:19|20|21)/.test(read('src/runtime/save-schema.js'))],
  ['service worker remains v21 or later', /VERSION = '(?:21|22|23)\.\d+\.\d+'/.test(read('public/sw.js'))],
  ['asset presence module wired', main.includes('new AssetPresenceEnforcer') && fs.existsSync('src/runtime/asset-presence-enforcer.js')],
  ['mobile HUD v21 lineage retained', (main.includes('MobileHudDirectorV21') || main.includes('MobileHudDirectorV22') || main.includes('MobileHudDirectorV23')) && (css.includes('mobile-hud-v21-emergency') || css.includes('mobile-hud-v22-emergency') || css.includes('mobile-hud-v23-emergency'))],
  ['combat readability wired', main.includes('new CombatReadabilityDirectorV21') && main.includes('spawnThreatTracer(enemy.group.position, target')],
  ['atlas markup carries presence metadata', read('src/ip-asset-library-v15.js').includes('data-asset-key') && read('src/ip-asset-library-v15.js').includes('data-asset-category')],
  ['six action assets contract', read('src/runtime/asset-presence-enforcer.js').includes("'interact-btn'") && read('src/runtime/asset-presence-enforcer.js').includes("'burst-btn'")],
  ['title cache revision remains versioned', html.includes('title-mascot-v17.webp?rev=') && html.includes('title-bg-desktop-v17.webp?rev=')],
  ['title presentation polish', html.includes('title-feature-ribbon-v21') && css.includes('.title-ready-v21')],
  ['static HTML isolated Han removed', !/>[\u3400-\u9fff]</u.test(html)],
  ['stronger enemy telegraphs', main.includes('opacity:.62') && main.includes('new THREE.BoxGeometry(1.08,.04,distance)')],
  ['stronger hazard rings', main.includes('opacity:.86') && main.includes('radius*.78')],
  ['production console v21 diagnostics', read('src/production-console.js').includes('ASSET PRESENCE') && /MOBILE HUD v(?:21|23)/.test(read('src/production-console.js'))],
  ['asset presence audit exists', fs.existsSync('docs/ASSET_PRESENCE_AUDIT_v21.0.0.json')],
  ['v21 operating docs exist', ['docs/ASSET_PRESENCE_ENFORCEMENT_v21.0.0.md','docs/PATCH_NOTES_v21.0.0.md','docs/PATCH_APPLY_v21.0.0.md','docs/NEXT_PATCH_LINEUP_v21.x.md'].every(fs.existsSync)]
];
let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed += 1;
}
if (failed) process.exit(1);
console.log('\nv21.0.0 Asset Presence Enforcement contract verified');
