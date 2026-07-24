import { createHash } from 'node:crypto';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const baseline = JSON.parse(read('scripts/patch-baselines/v1.0.8.json'));
const html = read('index.html');
const css = read('src/style.css');
const main = read('src/main.js');
const catalog = read('src/engine/asset-catalog.js');
const combatArt = read('src/runtime/combat-art-skin-v109.js');
const layout = read('src/ui-layout-manager.js');
const policy = read('src/version-policy.js');
const sw = read('public/sw.js');
const staticBootstrap = read('public/static-bootstrap.js');
const buildStatic = read('scripts/build-static-fallback.mjs');
const hasDist = fs.existsSync('dist/index.html') && fs.existsSync('dist/src/main.js') && fs.existsSync('dist/src/style.css') && fs.existsSync('dist/src/runtime/combat-art-skin-v109.js');
const distHtml = hasDist ? read('dist/index.html') : '';
const distMain = hasDist ? read('dist/src/main.js') : '';
const distCss = hasDist ? read('dist/src/style.css') : '';
const distCombatArt = hasDist ? read('dist/src/runtime/combat-art-skin-v109.js') : '';

const protectedFiles = ['src/art-style-tokens.js', 'docs/ABSOLUTE_ART_BIBLE_v2.0.md'];
const artBibleUnchanged = protectedFiles.every((file) => baseline.files?.[file]?.sha256 === hash(file));
const assetsUnchanged = Object.entries(baseline.files || {})
  .filter(([file]) => file.startsWith('src/assets/') || file.startsWith('public/assets/'))
  .every(([file, meta]) => fs.existsSync(file) && meta.sha256 === hash(file));
const textureIdCount = (catalog.match(/combat-art-(?:hero|guardian|monster|boss)-[a-z]+-v109/g) || []).filter((value, index, all) => all.indexOf(value) === index).length;
const pngMappingCount = (catalog.match(/ip-v13\/crops\/(?:heroes|monsters|bosses)\/[a-z]+-r\d{2}-c\d{2}\.png/g) || []).length;

const checks = [
  ['release identity is v1.0.9 / b24.9', pkg.version === '1.0.9' && pkg.dokkaebi?.releaseVersion === '1.0.9' && pkg.dokkaebi?.buildId === 'b24.9' && Number(pkg.dokkaebi?.buildRevision) === 9],
  ['package lock identity and metadata are synchronized', lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.releaseVersion === pkg.version && Number(lock.packages?.['']?.dokkaebi?.buildRevision) === 9],
  ['runtime and cache identities match', policy.includes("PUBLIC_GAME_VERSION = '1.0.9'") && policy.includes('BUILD_REVISION = 9') && main.includes("const GAME_VERSION = '1.0.9'") && html.includes("RELEASE_VERSION = '1.0.9'") && sw.includes("RELEASE_VERSION = '1.0.9'") && sw.includes("BUILD_ID = 'b24.9'") && staticBootstrap.includes("RELEASE_VERSION = '1.0.9'")],
  ['21 approved raster combat-art slots are catalogued', textureIdCount === 21 && pngMappingCount === 21 && catalog.includes("role: 'combat-art'") && catalog.includes('COMBAT_ART_TEXTURE_IDS')],
  ['combat art is attached to heroes guardians monsters and bosses', main.includes('new CombatArtSkinV109') && main.includes('attachHero(group, heroClass.id)') && main.includes('attachGuardian(model, type, rank)') && main.includes('attachEnemy(model, type, config)') && main.includes('combatArt: this.combatArtV109?.diagnostics')],
  ['prototype visuals yield to art-bible billboards only after texture load', combatArt.includes("mode: 'art-bible-billboard-v109'") && combatArt.includes('if (!texture) return false') && combatArt.includes('hidePrototypeVisuals(group)') && combatArt.includes('THREE.SpriteMaterial') && combatArt.includes('disposeMap = false') && combatArt.includes('restoreVisibility(group)') && main.includes('this.combatArtV109?.restoreVisibility(group)')],
  ['legacy directional impostors do not replace v109 combat art', main.includes('if (unit.group?.userData?.combatArtSpriteV109) return;') && main.includes('if (group?.userData?.combatArtSpriteV109) return;')],
  ['desktop HUD uses separated top center side and boss lanes', layout.includes("this.elements.councilChip") && layout.includes("makeRail('left-insight-rail'") && css.includes('--desktop-upper-lane-v109') && css.includes('--desktop-side-lane-v109') && css.includes('grid-template-columns: repeat(3, minmax(0, 1fr))') && css.includes('top: calc(138px + var(--safe-top))')],
  ['desktop context chips are moved out of the top meter lane', layout.indexOf("makeRail('top-status-rail'") < layout.indexOf("makeRail('center-meter-rail'") && !/makeRail\('top-status-rail'[\s\S]{0,240}this\.elements\.runSeed/.test(layout) && /makeRail\('left-insight-rail'[\s\S]{0,280}this\.elements\.runSeed/.test(layout)],
  ['static builder emits current identity', buildStatic.includes("const version = '1.0.9'") && buildStatic.includes("const buildId = 'b24.9'") && buildStatic.includes('src="./src/bootstrap.js?v=1.0.9-b24.9"')],
  ['dist preserves combat art and desktop shell when present', !hasDist || (distHtml.includes('1.0.9-b24.9') && distMain.includes('CombatArtSkinV109') && distCombatArt.includes('art-bible-billboard-v109') && distCss.includes('--desktop-upper-lane-v109'))],
  ['absolute art bible files are unchanged', artBibleUnchanged],
  ['existing runtime raster and 3D art bytes are unchanged', assetsUnchanged],
  ['no SVG file or runtime SVG construction was introduced', ![html, css, main, catalog, combatArt, layout, staticBootstrap, buildStatic].some((source) => /<svg\b|createElementNS\([^)]*svg/i.test(source))]
];

let failed = 0;
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  if (!passed) failed += 1;
}
if (failed) process.exit(1);
console.log('\nv1.0.9 Runtime Combat Art Bridge and Desktop HUD Shell contract verified');
