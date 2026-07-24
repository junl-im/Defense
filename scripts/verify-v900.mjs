import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));
const failures = [];
const check = (value, message) => value ? console.log(`PASS ${message}`) : failures.push(message);

const pkg = json('package.json');
const registry = json('public/assets/ip-v8/quality-registry-v9.json');
const approval = json('docs/ART_ASSET_APPROVAL_REGISTRY_v9.0.0.json');
const main = read('src/main.js');
const engine = read('src/engine/engine-config.js');
const catalog = read('src/engine/asset-catalog.js');
const heroClasses = read('src/hero-classes.js');
const consoleSource = read('src/production-console.js');
const gate = read('src/art-production-gate.js');
const html = read('index.html');
const libraryHtml = read('public/asset-library-v9.html');

check(Number((pkg.dokkaebi?.lineageVersion || pkg.version).split('.')[0]) >= 9, 'package retains v9+ asset foundation');
check(Number((pkg.dokkaebi?.lineageVersion || pkg.version).split('.')[0]) >= 9 && main.includes('LEGACY_LINEAGE_VERSION'), 'runtime retains v9+ game lineage');
check(/ENGINE_VERSION = '(?:7|[89]|[1-9][0-9]+)\./.test(engine), 'engine retains v7+ lineage');
check(/ASSET_REVISION = '(?:9|[1-9][0-9]+)\./.test(catalog), 'asset cache retains v9+ lineage');
check(registry.summary.totalFiles === 970, '970 source files audited');
check(registry.summary.highResolutionCandidates === 40, '40 named high-resolution candidates');
check(registry.summary.referenceCrops === 101, '101 reference crops separated');
check(registry.summary.quarantinedFragments === 823, '823 raw fragments quarantined');
check(registry.summary.sourceAtlases === 6, '6 source atlases retained');
check(registry.summary.transparentAssets === 0 && registry.summary.opaqueAssets === 970, 'opaque background debt explicitly measured');
check(registry.summary.productionApproved === 0 && approval.productionApprovedAssetIds.length === 0, 'production approval remains zero');
check(approval.goldenVerticalSliceApproved === 0 && approval.massProductionUnlocked === false, 'golden slice and mass production remain locked');

const highRes = registry.assets.filter((asset) => asset.reviewTier === 'high-resolution-candidate');
const fragments = registry.assets.filter((asset) => asset.reviewTier === 'quarantined-fragment');
const crops = registry.assets.filter((asset) => asset.reviewTier === 'reference-crop');
check(highRes.length === 40 && highRes.every((asset) => asset.minDimension >= 512 && asset.presentationEligible && !asset.productionApproved), 'high-res candidates are review-only and at least 512px');
check(fragments.length === 823 && fragments.every((asset) => asset.issues.includes('auto-sliced-fragment') && !asset.presentationEligible && !asset.runtime3DEligible), 'fragments cannot enter presentation or runtime');
check(crops.length === 101 && crops.every((asset) => asset.issues.includes('sheet-crop-reference-only')), 'sheet crops are reference-only');
check(['hero_dokkaebi_warrior','hero_dokkaebi_archer','hero_dokkaebi_mage','boss_dokkaebi_king','button_start','vfx_fire_explosion'].every((id) => highRes.some((asset) => asset.id === id)), 'core named candidates registered');

check(heroClasses.includes('hero_dokkaebi_warrior') && heroClasses.includes('hero_dokkaebi_archer') && heroClasses.includes('hero_dokkaebi_mage'), 'core hero concept candidates remain routed into class selector');
check(main.includes('entry.conceptArt || entry.icon') && main.includes('최종 승인 아님'), 'selector labels concept art as unapproved review material');
check((consoleSource.includes('IP_ASSET_LIBRARY_V9') || consoleSource.includes('IP_ASSET_LIBRARY_V10') || consoleSource.includes('IP_ASSET_LIBRARY_V13') || consoleSource.includes('IP_ASSET_LIBRARY_V14') || consoleSource.includes('IP_ASSET_LIBRARY_V15')) && (consoleSource.includes('quarantinedFragments') || consoleSource.includes('ASSET FORGE')), 'production console retains honest source and forge counts');
check(gate.includes('rawFragmentsForbiddenAtRuntime: true') && gate.includes('referenceCropsForbiddenAsFinalAssets: true') && gate.includes('highResolutionReviewCandidates: 40'), 'art production gate blocks fragments and crops');
check((consoleSource.includes('IP_ASSET_LIBRARY_V15') || consoleSource.includes('IP_ASSET_LIBRARY_V14')) && consoleSource.includes('OPEN ASSET REVIEW OS') && html.includes('id="title-vault-modal"'), 'review OS and honest production diagnostics remain available outside simplified title');
check(libraryHtml.includes('970개는 완성 에셋 수가 아닙니다') && libraryHtml.includes('quality-registry-v9.json'), 'review browser communicates source-file semantics');
check(existsSync(resolve(root, 'docs/ASSET_REVIEW_BOARD_v9.0.0.jpg')), '40-candidate review board exists');

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() && !['node_modules','.git','.firebase'].includes(entry.name) ? walk(resolve(dir, entry.name)) : entry.isFile() ? [resolve(dir, entry.name)] : []);
check(walk(root).filter((path) => extname(path).toLowerCase() === '.svg').length === 0, 'no SVG files shipped');

if (failures.length) {
  console.error(`\nFAIL v9.0.0 Asset Renaissance contract ${failures.length}`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('v9.0.0 Asset Renaissance foundation contract verified');
