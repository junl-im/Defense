import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { HERO_CLASSES, HERO_CLASS_ASSET_IDS, HERO_CLASS_ORDER } from '../src/hero-classes.js';
import { HERO_ARCHETYPE_PASSIVES, HERO_ARCHETYPE_SUMMARY } from '../src/hero-archetype-system.js';
import { RUN_MODES } from '../src/expedition-director.js';
import { ART_PRODUCTION_SUMMARY, GOLDEN_VERTICAL_SLICE } from '../src/art-production-gate.js';
import { SAVE_SCHEMA_VERSION } from '../src/runtime/save-schema.js';
import { ENGINE_VERSION } from '../src/engine/engine-config.js';
import { IP_ASSET_LIBRARY_V10 } from '../src/ip-asset-library-v10.js';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));
const failures = [];
const check = (condition, message) => condition ? console.log(`PASS ${message}`) : failures.push(message);
const sha256 = (path) => createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');

const pkg = json('package.json');
const forge = json('public/assets/ip-v10/asset-forge-v10.json');
const approval = json('docs/ART_ASSET_APPROVAL_REGISTRY_v10.0.0.json');
const main = read('src/main.js');
const style = read('src/style.css');
const html = read('index.html');
const review = read('public/asset-library-v10.html');
const status = read('src/combat/status-effect-system.js');
const consoleSource = read('src/production-console.js');
const assetCatalog = read('src/engine/asset-catalog.js');

check(Number(pkg.version.split('.')[0]) >= 10, 'package version remains v10 or later');
check(/const GAME_VERSION = '(?:10|11|12|13|14|15|16|17|18|19|20|21|22)\.0\.0'/.test(main), 'runtime retains v10 lineage or later');
check(Number(ENGINE_VERSION.split('.')[0]) >= 8, 'engine version remains 8.0.0 or later');
check(/ASSET_REVISION = '(?:10|11|12|13|14|15|16|17|18|19|20|21|22)\.0\.0'/.test(assetCatalog), 'asset revision remains v10 or later');
check(SAVE_SCHEMA_VERSION >= 8, 'save schema remains v8 or later');

check(forge.summary.sourceCandidates === 40, '40 high-resolution source candidates retained');
check(forge.summary.transparentPresentationDerivatives === 40, '40 transparent presentation derivatives');
check(forge.summary.silhouetteDerivatives === 40, '40 silhouette derivatives');
check(forge.summary.uiAndVfxDerivatives === 11, '11 UI and VFX transparent derivatives');
check(forge.summary.productionApproved === 0, 'automatic forge never grants production approval');
check(forge.assets.length === 40, 'asset forge manifest contains 40 assets');
check(forge.assets.every((entry) => entry.derivativeStatus === 'transparent-presentation-candidate' && !entry.productionApproved), 'all derivatives remain review-only');
check(forge.assets.every((entry) => entry.metrics.presentationReady && !entry.metrics.borderTouch), 'all presentation derivatives pass automated matte bounds');

for (const entry of forge.assets) {
  for (const [key, field] of [['presentationPath', 'presentationSha256'], ['silhouettePath', 'silhouetteSha256']]) {
    const path = `public/${entry[key]}`;
    check(existsSync(resolve(root, path)), `${entry.id} ${key} exists`);
    if (existsSync(resolve(root, path))) check(sha256(path) === entry[field], `${entry.id} ${key} hash`);
  }
}
check(existsSync(resolve(root, 'docs/ASSET_FORGE_BOARD_v10.0.0.jpg')), 'asset forge review board exists');

check(HERO_CLASS_ORDER.length === 5 && Object.keys(HERO_CLASSES).length === 5, 'five playable hero classes');
check(Object.keys(HERO_CLASS_ASSET_IDS).length === 5 && new Set(Object.values(HERO_CLASS_ASSET_IDS)).size === 3, 'five classes reuse three verified runtime models');
check(HERO_CLASS_ORDER.every((id) => HERO_CLASSES[id].conceptArt.includes('assets/ip-v10/presentation/characters/') || HERO_CLASSES[id].conceptArt.includes('assets/ip-v13/crops/heroes/')), 'five classes use v10 transparent review art');
check(HERO_ARCHETYPE_SUMMARY.playableClasses === 5 && Object.keys(HERO_ARCHETYPE_PASSIVES).length === 5, 'five class passive archetypes');
check(['warrior','archer','mage','taoist','shaman'].every((id) => HERO_ARCHETYPE_PASSIVES[id]), 'absolute DNA class families mapped to passives');

check(Object.keys(RUN_MODES).length === 4 && RUN_MODES.convergence?.reactionDamage > 1, 'four run modes including Mythic Convergence');
check(main.includes("classConfig.id === 'taoist'") && main.includes("classConfig.id === 'shaman'"), 'taoist seal and shaman ritual skill branches integrated');
check(main.includes('applyHeroArchetypeModifiers') && main.includes('reactionDamage') && main.includes('statusDuration'), 'class passive modifiers integrated into runtime combat');
check(status.includes("'hero-taoist': 'resonance'") && status.includes("'skill-shaman': 'resonance'"), 'new class status sources integrated');

check(ART_PRODUCTION_SUMMARY.approved === 0 && !ART_PRODUCTION_SUMMARY.massProductionUnlocked, 'golden slice remains honestly unapproved');
check(ART_PRODUCTION_SUMMARY.transparentPresentationDerivatives === 40 && ART_PRODUCTION_SUMMARY.playableHeroClasses === 5, 'production gate tracks forge and roster');
check(GOLDEN_VERTICAL_SLICE.length === 6 && GOLDEN_VERTICAL_SLICE.every((entry) => entry.status !== 'production-approved'), 'six golden slice categories remain review-stage');
check(approval.gameVersion === '10.0.0' && approval.productionApprovedAssetIds.length === 0, 'v10 approval registry remains locked');

check(html.includes('id="title-setup-modal"') && html.includes('id="title-vault-modal"') && consoleSource.includes('ASSET FORGE') && HERO_CLASS_ORDER.length === 5, 'simplified title preserves setup access, forge diagnostics and five-class roster');
check(review.includes('dokkaebi-asset-review-v10') && review.includes('리뷰 JSON 저장') && review.includes('productionApproved:0'), 'review OS stores local decisions and exports JSON without auto approval');
check(style.includes('GOLDEN CONVERGENCE v10.0.0') && style.includes('repeat(5'), 'five-class responsive UI styles');
check((consoleSource.includes('IP_ASSET_LIBRARY_V10') || consoleSource.includes('IP_ASSET_LIBRARY_V13') || consoleSource.includes('IP_ASSET_LIBRARY_V14') || consoleSource.includes('IP_ASSET_LIBRARY_V15')) && consoleSource.includes('HERO ROSTER') && consoleSource.includes('ASSET FORGE'), 'production console v10 diagnostics');

if (failures.length) {
  console.error(`\nFAIL v10.0.0 Golden Convergence contract ${failures.length}`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('v10.0.0 Golden Convergence contract verified');
