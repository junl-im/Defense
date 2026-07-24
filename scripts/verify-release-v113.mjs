import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const passes = [];
const text = (file) => readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(text(file));
const check = (condition, message) => { if (!condition) failures.push(message); };
const pass = (message) => passes.push(message);

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const main = text('src/main.js');
const policy = text('src/runtime/combat-art-runtime-policy-v113.js');
const visual = text('src/runtime/combat-visual-director-v112.js');
const sw = text('public/sw.js');
const index = text('index.html');

const currentVersion = pkg.version;
const currentBuildId = pkg.dokkaebi?.buildId;
const currentPatch = Number(String(currentVersion).split('.')[2] || 0);
check(currentPatch >= 13, 'current package predates the v1.0.13 foundation');
check(pkg.dokkaebi?.releaseVersion === currentVersion && /^b\d+\.\d+$/.test(currentBuildId || ''), 'package release metadata mismatch');
check(lock.version === currentVersion && lock.packages?.['']?.version === currentVersion, 'package-lock identity mismatch');
check(lock.packages?.['']?.dokkaebi?.releaseVersion === currentVersion && lock.packages?.['']?.dokkaebi?.buildId === currentBuildId, 'package-lock release metadata mismatch');
check(version.releaseVersion === currentVersion && version.buildId === currentBuildId, 'public version identity mismatch');
check(main.includes(`const GAME_VERSION = '${currentVersion}'`), 'main release identity mismatch');
check(index.includes(`RELEASE_VERSION = '${currentVersion}'`) && index.includes(`BUILD_ID = '${currentBuildId}'`), 'index boot identity mismatch');
if (!failures.length) pass(`v1.0.13 foundation preserved under current release ${currentVersion} / ${currentBuildId}`);

check(policy.includes("p0PrototypeRuntimeEnabled: false"), 'P0 prototype runtime quarantine is disabled');
check(policy.includes('productionArtRequiredForDirectionalAtlas: true'), 'production-art approval gate missing');
check(visual.includes('resolveCuratedAsset(fallbackAssetId, p0AssetId)'), 'curated combat asset resolver missing');
check(visual.includes('assetId: fallbackAssetId, authoredAtlas: false'), 'curated resolver does not force approved static combat art');
check(!/const assetId = authoredAtlas\s*\?\s*p0AssetId/.test(visual), 'P0 prototype is still selected by runtime');
check(visual.includes("mode: 'curated-combat-art-v113'"), 'v113 curated diagnostics missing');
if (!failures.length) pass('unapproved P0 11-direction prototype atlases are quarantined from runtime');

for (const token of ['clearLegacyRuntimeLayers', 'hideLegacyCoreGeometry', "sprite.name = 'guardianCitadelV113'", "bar.name = 'worldHealthBarV113'", "combatVisualMode = 'single-guardian-citadel-v113'"]) {
  check(visual.includes(token), `citadel hardening token missing: ${token}`);
}
check(visual.includes('core.userData.guardianCitadelV110 = sprite') && visual.includes('core.userData.guardianCitadelV112 = sprite') && visual.includes('core.userData.guardianCitadelV113 = sprite'), 'citadel compatibility aliases do not resolve to one sprite');
check(visual.includes("this.clearLegacyRuntimeLayers(core, { citadelOnly: true })"), 'legacy citadel/HP cleanup is not called before attachment');
check(visual.includes('object.visible = false') && visual.includes('guardianCitadelHiddenV113'), 'old sacred-tree geometry is not hidden');
if (!failures.length) pass('guardian citadel is constrained to one art layer and one world HP bar');

check(sw.includes(`RELEASE_VERSION = '${currentVersion}'`) && sw.includes(`BUILD_ID = '${currentBuildId}'`), 'service worker identity mismatch');
check(sw.includes("'./src/runtime/combat-art-runtime-policy-v113.js'"), 'v113 runtime policy is not precached');
check(existsSync(path.join(root, 'docs/PATCH_NOTES_v1.0.13.md')), 'v1.0.13 patch notes missing');
check(pkg.scripts?.verify?.includes('verify:release:v113'), 'full verify chain does not include v113');
if (!failures.length) pass('service worker, documentation and verification chain include v1.0.13');

check(!/<svg\b|createElementNS\([^)]*svg/i.test([policy, visual].join('\n')), 'SVG markup/construction introduced');
if (!failures.length) pass('v1.0.13 visual hardening introduces no SVG');

for (const message of passes) console.log(`PASS ${message}`);
if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nv1.0.13 release verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log('\nv1.0.13 Guardian Citadel and Curated Character Asset hardening verified.');
