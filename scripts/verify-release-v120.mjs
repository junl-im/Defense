import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => { if (!condition) failures.push(message); };
const text = (file) => readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(text(file));

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const main = text('src/main.js');
const html = text('index.html');
const css = text('src/style.css');
const director = text('src/runtime/combat-visual-director-v112.js');
const catalog = text('src/engine/asset-catalog.js');
const contract = text('src/runtime/hero-hud-polish-v120.js');
const visual = text('src/runtime/visual-integration-director.js');
const workflow = text('.github/workflows/deploy.yml');

const releasePatch = Number(String(pkg.version).split('.').at(-1) || 0);
check(releasePatch >= 20 && Number(pkg.dokkaebi?.buildRevision || 0) >= 20, 'package identity is older than v1.0.20 / b24.20');
check(lock.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'package lock identity mismatch');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi?.buildId, 'public version identity mismatch');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`), 'runtime version identity mismatch');
if (!failures.length) pass('v1.0.20 identity is synchronized');

check(existsSync(path.join(root, 'src/assets/title-v120/title-mascot-v120.webp')), 'HQ Pupu title mascot missing');
check(existsSync(path.join(root, 'src/assets/title-v120/title-mascot-lite-v120.webp')), 'lite Pupu title mascot missing');
check(html.includes('title-mascot-lite-v120.webp') && visual.includes('title-mascot-lite-v120.webp'), 'approved title mascot is not active');
check(html.includes('title-mascot-lite-v112.webp?rev=release-v115-b24-15'), 'v1.0.15 compatibility cache lineage marker missing');
if (!failures.length) pass('legacy title screen is replaced by the approved Pupu artwork with a new cache revision');

check(director.includes("approvedAssetId = classId === 'warrior' ? APPROVED_DIRECTIONAL_ATLAS_IDS_V117.guardians.ember"), 'warrior does not select the approved Pupu directional atlas');
check(director.includes('approvedDirectionalV117,') && director.includes("category: 'hero'"), 'hero attachment does not preserve approved directional state');
check(existsSync(path.join(root, 'public/assets/visual-v120/directional/hero-pupu-atlas-low-v120.webp')), 'v1.0.20 low-memory protagonist atlas missing');
check(catalog.includes("visual-v120/directional/hero-pupu-atlas-low-v120.webp"), 'low-memory protagonist atlas is not wired');
check(catalog.includes('APPROVED_DIRECTIONAL_ATLAS_IDS_V117.guardians.ember') && catalog.includes('one approved atlas replaces both duplicate warrior and ember boot textures'), 'approved protagonist atlas is not in the first-battle preload set');
check(contract.includes("directions: 11") && contract.includes('mirrored: false') && contract.includes('runtimeApplied: true'), '11-direction protagonist contract missing');
if (!failures.length) pass('the main warrior now uses the approved 11-direction Pupu atlas at runtime');

check(director.includes("root.name = 'worldHealthBarV120'"), 'premium world health bar root missing');
check(director.includes('const rim = makeBarSprite') && director.includes('const shell = makeBarSprite'), 'metallic rim health bar layers missing');
check(html.includes('core-hp-progress-v120') && main.includes('coreHpProgressV120'), 'top core HP track is not wired');
check(css.includes('core-hp-track-v120') && css.includes('data-hp-state="critical"'), 'top core HP visual states missing');
if (!failures.length) pass('world and top HUD health bars use the v1.0.20 premium visual treatment');

check(css.includes('grid-template-areas: "hud-left hud-wave hud-right"'), 'desktop three-lane HUD layout missing');
check(css.includes('"hud-left hud-right"') && css.includes('"hud-wave hud-wave"'), 'mobile two-row HUD layout missing');
check(css.includes('position: static !important') && css.includes('boss-health { top: calc(112px'), 'mobile overlap offsets missing');
check(contract.includes('overlapGuard: true'), 'top HUD overlap guard contract missing');
if (!failures.length) pass('PC and mobile top HUD lanes are separated to prevent overlap');

check(pkg.scripts?.verify?.includes('verify:release:v120'), 'full verify chain omits v1.0.20');
check(pkg.scripts?.['verify:dist:v120'], 'v1.0.20 dist verifier script missing');
check(workflow.includes('npm run verify:dist:v120'), 'GitHub Pages workflow omits v1.0.20 dist verification');
check(existsSync(path.join(root, 'docs/PATCH_NOTES_v1.0.20.md')), 'v1.0.20 patch notes missing');
check(existsSync(path.join(root, 'docs/PATCH_APPLY_v1.0.20.md')), 'v1.0.20 apply guide missing');
check(!html.includes('<svg') && !css.includes('data:image/svg+xml'), 'v1.0.20 introduced SVG content');
if (!failures.length) pass('v1.0.20 release, CI and no-SVG contracts are installed');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nv1.0.20 verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log('\nv1.0.20 Protagonist Directional, HP and HUD Polish verified.');
