import { createHash } from 'node:crypto';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const baseline = JSON.parse(read('scripts/patch-baselines/v1.0.9.json'));
const version = pkg.version;
const buildId = pkg.dokkaebi?.buildId;
const buildRevision = Number(pkg.dokkaebi?.buildRevision);
const versionParts = String(version).split('.').map(Number);
const atLeastV110 = versionParts.length === 3 && (versionParts[0] > 1 || (versionParts[0] === 1 && (versionParts[1] > 0 || (versionParts[1] === 0 && versionParts[2] >= 10))));

const main = read('src/main.js');
const catalog = read('src/engine/asset-catalog.js');
const visualPath = fs.existsSync('src/runtime/combat-visual-director-v112.js') ? 'src/runtime/combat-visual-director-v112.js' : 'src/runtime/combat-visual-director-v110.js';
const visual = read(visualPath);
const visualIsV112 = visualPath.endsWith('-v112.js');
const layout = read('src/ui-layout-manager.js');
const css = read('src/style.css');
const policy = read('src/version-policy.js');
const html = read('index.html');
const sw = read('public/sw.js');
const staticBootstrap = read('public/static-bootstrap.js');
const buildStatic = read('scripts/build-static-fallback.mjs');

let currentDist = false;
try {
  const distVersion = JSON.parse(read('dist/version.json'));
  currentDist = distVersion.releaseVersion === version && distVersion.buildId === buildId;
} catch {
  currentDist = false;
}
const distMain = currentDist ? read('dist/src/main.js') : '';
const distVisualPath = visualIsV112 ? 'dist/src/runtime/combat-visual-director-v112.js' : 'dist/src/runtime/combat-visual-director-v110.js';
const distVisual = currentDist && fs.existsSync(distVisualPath) ? read(distVisualPath) : '';
const distCss = currentDist ? read('dist/src/style.css') : '';

const protectedFiles = ['src/art-style-tokens.js', 'docs/ABSOLUTE_ART_BIBLE_v2.0.md'];
const artBibleUnchanged = protectedFiles.every((file) => baseline.files?.[file]?.sha256 === hash(file));
const existingAssetsUnchanged = Object.entries(baseline.files || {})
  .filter(([file]) => file.startsWith('src/assets/') || file.startsWith('public/assets/'))
  .every(([file, meta]) => fs.existsSync(file) && meta.sha256 === hash(file));
const combatIds = new Set(catalog.match(/combat-art-(?:hero|guardian|monster|boss)-[a-z]+-v109/g) || []);
const sources = [html, css, main, catalog, visual, layout, sw, staticBootstrap, buildStatic].join('\n');

const checks = [
  ['release identity is v1.0.10 or later and metadata is synchronized', atLeastV110 && pkg.dokkaebi?.releaseVersion === version && /^b\d+\.\d+$/.test(buildId || '') && Number.isInteger(buildRevision)],
  ['package lock identity and metadata are synchronized', lock.version === version && lock.packages?.['']?.version === version && lock.packages?.['']?.dokkaebi?.releaseVersion === version && lock.packages?.['']?.dokkaebi?.buildId === buildId && Number(lock.packages?.['']?.dokkaebi?.buildRevision) === buildRevision],
  ['runtime and cache identities match current package metadata', policy.includes(`PUBLIC_GAME_VERSION = '${version}'`) && policy.includes(`BUILD_REVISION = ${buildRevision}`) && main.includes(`const GAME_VERSION = '${version}'`) && html.includes(`RELEASE_VERSION = '${version}'`) && html.includes(`BUILD_ID = '${buildId}'`) && sw.includes(`RELEASE_VERSION = '${version}'`) && sw.includes(`BUILD_ID = '${buildId}'`) && staticBootstrap.includes(`RELEASE_VERSION = '${version}'`) && staticBootstrap.includes(`BUILD_ID = '${buildId}'`)],
  ['21 approved high-resolution raster combat sources remain catalogued', combatIds.size === 21 && catalog.includes('COMBAT_ART_TEXTURE_IDS') && (catalog.includes("role: 'combat-art'") || catalog.includes("role: 'combat-art-polished-v114'"))],
  ['visual director resolves 11 directions and 6 combat action states', ((visual.includes('const DIRECTIONS = 11') && visual.includes("['idle', 'move', 'attack', 'skill', 'hit', 'death']")) || (visual.includes('P0_DIRECTIONAL_ATLAS_SPEC_V112.directions') && visual.includes('P0_DIRECTIONAL_ATLAS_SPEC_V112.states'))) && visual.includes('DirectionalImpostorSelector') && visual.includes('setDirectionalState(') && visual.includes('directionTurn')],
  ['world-space HP bars follow core heroes guardians and enemies', (visual.includes('worldHealthBarV110') || visual.includes('worldHealthBarV112')) && visual.includes('updateHealth(record, camera, showHealth') && visual.includes('getWorldQuaternion') && main.includes('getHp: () => this.coreHp') && main.includes('getHp: () => player.hp') && main.includes('getHp: () => unit.hp') && main.includes('getHp: () => enemy.hp')],
  ['skills and enemy specials drive visible skill action state', main.includes("trigger(unit.animation, 'skill'") && main.includes("trigger(enemy.animation, 'skill'") && visual.includes("state === 'skill'") && (visual.includes('combatActionAuraV110') || visual.includes('combatActionAuraV112'))],
  ['guardian citadel approved raster is attached above sacred core', catalog.includes('GUARDIAN_CITADEL_TEXTURE_ID') && (visual.includes('guardianCitadelV110') || visual.includes('guardianCitadelV112')) && main.includes('attachCitadel(premium')],
  ['desktop HUD uses separate context meter status and boss lanes', layout.includes("makeRail('top-context-rail'") && layout.includes("makeRail('center-meter-rail'") && layout.includes("makeRail('top-status-rail'") && css.includes('--desktop-hud-top-v110') && css.includes('--desktop-side-top-v110')],
  ['static builder emits the current package identity', (buildStatic.includes(`const version = '${version}'`) && buildStatic.includes(`const buildId = '${buildId}'`) && buildStatic.includes(`src/bootstrap.js?v=${version}-${buildId}`)) || (buildStatic.includes("const packageJson = JSON.parse") && buildStatic.includes("const version = packageJson.version") && buildStatic.includes("const buildId = packageJson.dokkaebi?.buildId || ''") && buildStatic.includes('static-bootstrap.js?v=${revision}'))],
  ['current dist preserves directional combat visual and desktop HUD shell when present', !currentDist || ((visualIsV112 ? (distMain.includes('CombatVisualDirectorV112') || distMain.includes('CombatArtPolishDirectorV114')) && distVisual.includes('authored-directional-atlas-v112') : distMain.includes('CombatVisualDirectorV110') && distVisual.includes('directional-action-projection-v110')) && distCss.includes('--desktop-hud-top-v110'))],
  ['absolute art bible files are unchanged from the v1.0.9 foundation', artBibleUnchanged],
  ['all pre-v1.0.10 runtime raster and 3D art bytes are unchanged', existingAssetsUnchanged],
  ['no SVG file reference or runtime SVG construction was introduced', !/<svg\b|createElementNS\([^)]*svg/i.test(sources)]
];

let failed = 0;
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  if (!passed) failed += 1;
}
if (failed) process.exit(1);
console.log(`\nv1.0.10 Directional Combat, World HP, Citadel and Desktop HUD foundation verified under current release v${version} / ${buildId}`);
