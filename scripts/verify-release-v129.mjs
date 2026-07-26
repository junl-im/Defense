import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import AssetRefinementAssuranceDirectorV129, {
  ASSET_REFINEMENT_ASSURANCE_V129_ID,
  ASSET_REFINEMENT_POLICY_V129,
  groupHazardsByDirectionV129,
  validateRefinementProfileV129
} from '../src/runtime/asset-refinement-assurance-director-v129.js';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const text = (relative) => readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(text(relative));

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const profile = json('public/assets/visual-v129/asset-refinement-profile-v129.json');
const registry = json('public/assets/visual-v129/asset-refinement-registry-v129.json');
const manifest = json('public/assets/visual-v129/asset-refinement-manifest-v129.json');
const runtime = text('src/runtime/asset-refinement-assurance-director-v129.js');
const main = text('src/main.js');
const catalog = text('src/engine/asset-catalog.js');
const sw = text('public/sw.js');
const workflow = text('.github/workflows/deploy.yml');
const index = text('index.html');

const releasePatch = Number(String(pkg.version || '').split('.')[2]);
check(pkg.version?.startsWith('1.0.') && releasePatch >= 29 && pkg.dokkaebi?.buildRevision >= 29, 'v1.0.29+ package identity mismatch');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'package-lock identity mismatch');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi.buildId, 'public version mismatch');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`) && index.includes(`release-v1${releasePatch}-b24-${pkg.dokkaebi.buildRevision}`), 'runtime or title identity mismatch');
check(ASSET_REFINEMENT_ASSURANCE_V129_ID === 'DD-ASSET-REFINEMENT-ASSURANCE-V129', 'runtime marker mismatch');
check(ASSET_REFINEMENT_POLICY_V129.waveTarget === 50 && ASSET_REFINEMENT_POLICY_V129.directionCount === 11 && ASSET_REFINEMENT_POLICY_V129.actionCount === 6, 'v1.0.29 policy mismatch');
check(runtime.includes('groupHazardsByDirectionV129') && runtime.includes('validateRefinementProfileV129') && runtime.includes('lifecycleHealthy'), 'runtime features missing');
check(main.includes('AssetRefinementAssuranceDirectorV129') && main.includes("'asset-refinement-v129'") && main.includes('assetRefinementV129: game.assetRefinementV129?.report'), 'main integration missing');
check(catalog.includes('visual-v129/directional/guardian-ember-pupu-atlas-medium-v129.webp') && catalog.includes('visual-v129/directional/guardian-ember-pupu-atlas-high-v129.webp') && catalog.includes("runtimeDerivative: 'v129-refined'"), 'derived atlas catalog integration missing');
check(sw.includes('asset-refinement-assurance-director-v129.js') && sw.includes('asset-refinement-lab-v129.html') && sw.includes('asset-refinement-profile-v129.json'), 'service worker entries missing');
check(pkg.scripts.verify.includes('verify:release:v129') && pkg.scripts['verify:dist:v129'] && workflow.includes('npm run verify:dist:v129'), 'CI chain missing');
check(existsSync(path.join(root, 'public/asset-refinement-lab-v129.html')) && existsSync(path.join(root, 'docs/NEXT_UPDATE_v1.0.30.md')), 'QA or next update document missing');

const audit = validateRefinementProfileV129(profile);
check(audit.approved && audit.atlasCount === 3 && audit.profileCells === 198 && audit.directions === 11 && audit.actions === 6, 'refinement profile audit failed');
check(profile.policy?.transparentRgbBleedPixels === 3 && profile.policy?.uvGuardPixels === 0.75, 'refinement pixel policy mismatch');
check(registry.summary?.newFinalCharacterArt === 0 && registry.summary?.waveTarget === 50, 'approval registry boundary mismatch');
check(registry.entries?.some((entry) => entry.id === 'monster-bomb-imp-directional-candidate-v129' && entry.runtime === 'quarantined'), 'bomb imp quarantine missing');
check(manifest.files?.length >= 5 && manifest.files.every((entry) => /^[a-f0-9]{64}$/.test(entry.sha256)), 'asset manifest integrity missing');
for (const quality of ['low', 'medium', 'high']) {
  check(existsSync(path.join(root, `public/assets/visual-v129/directional/guardian-ember-pupu-atlas-${quality}-v129.webp`)), `${quality} derived atlas missing`);
}

const grouped = groupHazardsByDirectionV129([
  { projection: { x: -0.8, y: 0 }, remaining: 1.4 },
  { projection: { x: -0.7, y: 0.1 }, remaining: 0.8, assessment: { occluded: true } },
  { projection: { x: 0.8, y: 0 }, remaining: 2.1 }
]);
check(grouped.length === 2 && grouped[0].direction === 'left' && grouped[0].count === 2 && grouped[0].occluded === 1, 'direction grouping simulation failed');
const fake = { diagnostics: { activeRecords: 5 } };
const director = new AssetRefinementAssuranceDirectorV129({ combatVisual: fake });
for (let wave = 1; wave <= 50; wave += 1) {
  fake.diagnostics.activeRecords = 5 + Math.floor(wave / 18);
  director.update({ wave, hazards: [], particles: 18 + wave, projectiles: 4 + Math.floor(wave / 8), fps: 60 - Math.floor(wave / 14) });
}
check(director.report.fiftyWaveTargetReached && director.report.lifecycleHealthy, '50-wave lifecycle simulation failed');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.29 asset refinement, approval boundary and 50-wave assurance verified');
