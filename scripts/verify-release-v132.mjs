import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import SilhouetteAssuranceDirectorV132, {
  SILHOUETTE_ASSURANCE_V132_ID,
  SILHOUETTE_ASSURANCE_POLICY_V132,
  validateSilhouetteAuditV132,
  validateActionEvidenceV132,
  compactDangerSectorsV132
} from '../src/runtime/silhouette-assurance-director-v132.js';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const text = (relative) => readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(text(relative));
const sha256 = (relative) => createHash('sha256').update(readFileSync(path.join(root, relative))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const silhouette = json('public/assets/visual-v132/silhouette-audit-v132.json');
const action = json('public/assets/visual-v132/action-evidence-v132.json');
const registry = json('public/assets/visual-v132/silhouette-assurance-registry-v132.json');
const manifest = json('public/assets/visual-v132/silhouette-assurance-manifest-v132.json');
const main = text('src/main.js');
const sw = text('public/sw.js');
const workflow = text('.github/workflows/deploy.yml');
const index = text('index.html');

const currentPatch = Number(String(pkg.version).split('.')[2]);
const currentBuild = Number(pkg.dokkaebi?.buildRevision);
check(pkg.version.startsWith('1.0.') && currentPatch >= 32 && pkg.dokkaebi?.buildId === `b24.${currentBuild}` && currentBuild >= 32, 'package identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'lock identity');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi?.buildId, 'public version identity');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`) && index.includes(`release-v1${String(currentPatch).padStart(2, '0')}-b24-${currentBuild}`), 'runtime identity');
check(SILHOUETTE_ASSURANCE_V132_ID === 'DD-SILHOUETTE-ASSURANCE-V132' && SILHOUETTE_ASSURANCE_POLICY_V132.waveTarget === 80, 'policy identity');

const silhouetteResult = validateSilhouetteAuditV132(silhouette);
check(silhouetteResult.approved, 'silhouette validation');
check(silhouetteResult.assets === 10 && silhouetteResult.pairs === 45 && silhouetteResult.nearDuplicatePairs === 0, 'silhouette counts');
check(silhouetteResult.reviewPairs === 1, 'human review pair count');
check(silhouetteResult.highestSimilarity?.a === 'boss-serpent' && silhouetteResult.highestSimilarity?.b === 'boss-king', 'highest similarity evidence');
for (const row of silhouette.assets || []) {
  check(existsSync(path.join(root, 'public', row.path)), `missing silhouette source ${row.path}`);
  check(sha256(path.join('public', row.path)) === row.sourceSha256, `silhouette source hash ${row.id}`);
}

const actionResult = validateActionEvidenceV132(action);
check(actionResult.approvedRuntimeEvidence, 'action evidence validation');
check(actionResult.cells === 66 && actionResult.comparisons === 55, 'action evidence counts');
check(actionResult.exactRgbaMatchesAgainstIdle === 0 && actionResult.minimumMeanRgbaDelta >= .04, 'action distinction evidence');
check(sha256(path.join('public', action.sourceAtlas)) === action.sourceSha256, 'action source hash');
check(registry.summary?.nearDuplicatePairs === 0 && registry.summary?.newFinalCharacterArt === 0, 'approval summary');
check(registry.approvals?.bombImpRuntime === 'quarantined' && registry.approvals?.pupuIndependentActions === 'derived-provisional', 'approval boundary');

for (const entry of manifest.files || []) {
  const relative = path.join('public', entry.path);
  check(existsSync(path.join(root, relative)), `manifest missing ${entry.path}`);
  check(sha256(relative) === entry.sha256, `manifest hash ${entry.path}`);
}

check(main.includes('SilhouetteAssuranceDirectorV132') && main.includes("'silhouette-assurance-v132'") && main.includes('silhouetteAssuranceV132: game.silhouetteAssuranceV132?.report'), 'main integration');
check(sw.includes('silhouette-assurance-director-v132.js') && sw.includes('silhouette-assurance-lab-v132.html'), 'service worker integration');
check(pkg.scripts.verify.includes('verify:release:v132') && workflow.includes('npm run verify:dist:v132'), 'CI chain');
check(existsSync(path.join(root, 'public/silhouette-assurance-lab-v132.html')) && existsSync(path.join(root, 'docs/NEXT_UPDATE_v1.0.33.md')), 'docs and lab');

const sectors = compactDangerSectorsV132([
  { direction: 'front-left', count: 2, remaining: 1.2, occluded: 1 },
  { direction: 'left', count: 1, remaining: .6, occluded: 0 },
  { direction: 'right', count: 1, remaining: 2.2, occluded: 0 }
]);
check(sectors.length === 2 && sectors[0].sector === 'left' && sectors[0].count === 3 && sectors[0].urgent, 'danger sector compaction');

const fake = { diagnostics: { activeRecords: 7 } };
const director = new SilhouetteAssuranceDirectorV132({ combatVisual: fake });
for (let wave = 1; wave <= 80; wave += 1) {
  fake.diagnostics.activeRecords = 7 + Math.floor(wave / 28);
  director.update({
    wave,
    particles: 22 + wave,
    projectiles: 5 + Math.floor(wave / 10),
    hazards: 2 + Math.floor(wave / 30),
    fps: 60 - Math.floor(wave / 20),
    directionGroups: []
  });
}
check(director.report.eightyWaveTargetReached && director.report.lifecycleHealthy, '80 wave lifecycle');

if (failures.length) {
  failures.forEach((item) => console.error(`FAIL ${item}`));
  process.exit(1);
}
console.log('PASS v1.0.32 silhouette fingerprints, action evidence, mobile sectors, and 80-wave assurance verified');
