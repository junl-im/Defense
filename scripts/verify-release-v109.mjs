import { createHash } from 'node:crypto';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const baseline = JSON.parse(read('scripts/patch-baselines/v1.0.8.json'));
const main = read('src/main.js');
const catalog = read('src/engine/asset-catalog.js');
const css = read('src/style.css');
const layout = read('src/ui-layout-manager.js');
const legacyBridge = fs.existsSync('src/runtime/combat-art-skin-v109.js') ? read('src/runtime/combat-art-skin-v109.js') : '';
const currentVersion = String(pkg.version || '0.0.0').split('.').map(Number);
const isV109OrLater = currentVersion[0] > 1 || (currentVersion[0] === 1 && (currentVersion[1] > 0 || currentVersion[2] >= 9));
const hasV110 = fs.existsSync('src/runtime/combat-visual-director-v110.js');
const hasV112 = fs.existsSync('src/runtime/combat-visual-director-v112.js');
const currentVisual = hasV112 ? read('src/runtime/combat-visual-director-v112.js') : hasV110 ? read('src/runtime/combat-visual-director-v110.js') : legacyBridge;
const hasDist = fs.existsSync('dist/index.html') && fs.existsSync('dist/src/main.js');
const distMain = hasDist ? read('dist/src/main.js') : '';
const hasCurrentDist = hasDist && distMain.includes(`const GAME_VERSION = '${pkg.version}'`);
const protectedFiles = ['src/art-style-tokens.js', 'docs/ABSOLUTE_ART_BIBLE_v2.0.md'];
const artBibleUnchanged = protectedFiles.every((file) => baseline.files?.[file]?.sha256 === hash(file));
const existingAssetsUnchanged = Object.entries(baseline.files || {})
  .filter(([file]) => file.startsWith('src/assets/') || file.startsWith('public/assets/'))
  .every(([file, meta]) => fs.existsSync(file) && meta.sha256 === hash(file));
const combined = [main, catalog, css, layout, legacyBridge, currentVisual].join('\n');
const checks = [
  ['public release preserves v1.0.9 combat-art foundation or later', isV109OrLater],
  ['package lock release is synchronized', lock.version === pkg.version && lock.packages?.['']?.version === pkg.version],
  ['21 approved v1.0.9 raster slots remain catalogued', new Set(catalog.match(/combat-art-(?:hero|guardian|monster|boss)-[a-z]+-v109/g) || []).size === 21],
  ['v1.0.9 bridge remains available or is superseded by a later visual director', (legacyBridge.includes("art-bible-billboard-v109") && main.includes('CombatArtSkinV109')) || (hasV112 && main.includes('CombatVisualDirectorV112')) || (hasV110 && main.includes('CombatVisualDirectorV110'))],
  ['heroes guardians monsters and bosses retain approved combat-art attachment path', (hasV112 || hasV110) ? ['attachHero','attachGuardian','attachEnemy'].every((name) => currentVisual.includes(`${name}(`)) : ['attachHero','attachGuardian','attachEnemy'].every((name) => legacyBridge.includes(`${name}(`))],
  ['desktop HUD separated-lane contract remains present', css.includes('--desktop-upper-lane-v109') && layout.includes("left-insight-rail") && layout.includes("right-roster-rail")],
  ['dist preserves current combat visual implementation when present', !hasCurrentDist || (hasV112 ? distMain.includes('CombatVisualDirectorV112') : hasV110 ? distMain.includes('CombatVisualDirectorV110') : distMain.includes('CombatArtSkinV109'))],
  ['absolute art bible files are unchanged', artBibleUnchanged],
  ['pre-v1.0.9 runtime raster and 3D art bytes are unchanged', existingAssetsUnchanged],
  ['no SVG file or runtime SVG construction was introduced', !/<svg\b|createElementNS\([^)]*svg/i.test(combined)]
];
let failed = 0;
for (const [name, passed] of checks) { console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`); if (!passed) failed += 1; }
if (failed) process.exit(1);
console.log('\nv1.0.9 Runtime Combat Art Bridge and Desktop HUD Shell foundation preserved');
