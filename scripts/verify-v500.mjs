import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  CHARACTER_DNA_VERSION,
  CHARACTER_DNA_SUMMARY,
  ANIMATION_DNA,
  EQUIPMENT_DNA,
  validateCharacterDNA
} from '../src/character-dna.js';
import {
  ART_PRODUCTION_GATE_VERSION,
  ART_PRODUCTION_SUMMARY,
  ART_APPROVAL_EVIDENCE,
  GOLDEN_VERTICAL_SLICE,
  MASSIVE_UPDATE_MILESTONES,
  RUNTIME_ART_POLICY
} from '../src/art-production-gate.js';
import { ENGINE_VERSION } from '../src/engine/engine-config.js';
import { AdaptiveQualityGovernor, QUALITY_PROFILES } from '../src/engine/quality-governor.js';
import { FrameBudgetScheduler } from '../src/engine/frame-budget-scheduler.js';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const registry = JSON.parse(read('docs/ART_ASSET_APPROVAL_REGISTRY_v5.0.0.json'));
const pkg = JSON.parse(read('package.json'));
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => condition ? pass(message) : failures.push(message);

check(Number(pkg.version.split('.')[0]) >= 5, 'package version remains v5 or later');
check(Number(ENGINE_VERSION.split('.')[0]) >= 4, 'engine version remains 4.0.0 or later');
check(Number(ART_PRODUCTION_GATE_VERSION.split('.')[0]) >= 5, 'art production gate remains v5 or later');
check(CHARACTER_DNA_VERSION === '3.0.0', 'character DNA version 3.0.0');
check(CHARACTER_DNA_SUMMARY.classCount === 5 && CHARACTER_DNA_SUMMARY.rarityCount === 7, 'five class and seven rarity DNA families');
check(ANIMATION_DNA.clips.length === 11, 'eleven locked animation clips');
check(EQUIPMENT_DNA.detachableSlots.length === 5 && EQUIPMENT_DNA.requiredSockets.length === 6, 'five equipment parts and six required sockets');

const validCandidate = validateCharacterDNA({
  headRatio: .42,
  eyeWidthRatio: .28,
  weaponScale: .24,
  triangles: 8200,
  mainColors: 4,
  textureSize: 2048,
  clips: [...ANIMATION_DNA.clips],
  sockets: [...EQUIPMENT_DNA.requiredSockets],
  realisticSkin: false,
  darkLighting: false,
  sharpEdges: false,
  gore: false,
  horror: false
});
check(validCandidate.valid, 'valid character DNA candidate passes');
const invalidCandidate = validateCharacterDNA({ headRatio: .31, eyeWidthRatio: .14, weaponScale: .1, triangles: 16000, mainColors: 7, textureSize: 4096, clips: [], sockets: [], realisticSkin: true, darkLighting: true, sharpEdges: true });
check(!invalidCandidate.valid && invalidCandidate.failures.length >= 9, 'invalid character DNA candidate is blocked');

check(GOLDEN_VERTICAL_SLICE.length === 6, 'six-category golden vertical slice');
check(ART_APPROVAL_EVIDENCE.length === 11, 'eleven production approval evidence gates');
check(ART_PRODUCTION_SUMMARY.approved === 0 && !ART_PRODUCTION_SUMMARY.massProductionUnlocked, 'mass production remains locked before final art approval');
check(ART_PRODUCTION_SUMMARY.completion >= 33, 'golden slice planning completion remains at least 33 percent');
check(MASSIVE_UPDATE_MILESTONES.filter((entry) => entry.status === 'done').length >= 3, 'at least three massive update infrastructure milestones completed');
check(RUNTIME_ART_POLICY.runtimeHarmonizationRequired, 'runtime art harmonization mandatory');

const mobileGovernor = new AdaptiveQualityGovernor({}, { mobile: true, lowEnd: false, saveData: false });
check(mobileGovernor.profile.id === 'high', 'mobile starts at high quality profile');
const degraded = mobileGovernor.evaluate({ fps: 30, p95FrameMs: 48, severeFramePercent: 8 });
check(degraded?.id === 'balanced' || mobileGovernor.profile.id === 'balanced', 'quality governor degrades under sustained frame pressure');
for (let i = 0; i < 3; i += 1) mobileGovernor.evaluate({ fps: 60, p95FrameMs: 17, severeFramePercent: 0 });
check(['high', 'balanced'].includes(mobileGovernor.profile.id), 'quality governor recovers with sustained headroom');
check(Object.keys(QUALITY_PROFILES).length === 4, 'four adaptive quality profiles');

const scheduler = new FrameBudgetScheduler();
let hudRuns = 0;
for (let i = 0; i < 60; i += 1) {
  scheduler.tick(1 / 60);
  if (scheduler.shouldRun('hud', 30)) hudRuns += 1;
}
check(hudRuns >= 29 && hudRuns <= 31, 'frame budget scheduler throttles HUD to 30Hz');

const main = read('src/main.js');
const style = read('src/style.css');
const html = read('index.html');
const pipeline = read('src/engine/asset-pipeline.js');
const monitor = read('src/engine/performance-monitor.js');
const mobileEngine = read('src/engine/mobile-engine.js');
check(main.includes('FrameBudgetScheduler') && main.includes("shouldRun('hud'") && main.includes("shouldRun('shadows'"), 'runtime frame budget scheduling integrated');
check(main.includes('ProductionConsole') && main.includes("on(ui.productionConsole, 'click'"), 'production console remains available through its UI button');
check(main.includes('CHARACTER_DNA_SUMMARY') && main.includes('qualityGovernor'), 'performance export includes DNA and quality governor');
check(pipeline.includes('applyRuntimeArtHarmonization') && pipeline.includes("role: entry.role || entry.category || 'default'"), 'asset pipeline runtime art harmonizer integrated');
check(mobileEngine.includes('AdaptiveQualityGovernor') && mobileEngine.includes('qualityProfile'), 'mobile engine adaptive quality governor integrated');
check(monitor.includes('p99FrameMs') && monitor.includes('frameJitterMs') && monitor.includes('smoothnessScore'), 'P99 jitter and smoothness telemetry integrated');
check(html.includes('production-console-btn') && html.includes('id="title-vault-modal"') && main.includes('CHARACTER_DNA_SUMMARY'), 'v5 production console and DNA foundation retained behind simplified player title');
check(style.includes('MOONSTONE GENESIS') && style.includes('transform: scale(1.05)') && style.includes('transform: scale(.95)'), 'absolute UI hover and pressed scale contract');
check(style.includes('.production-console') && style.includes('--moonstone-gold'), 'Moonstone runtime design system');

check(registry.gameVersion === '5.0.0' && registry.engineVersion === '4.0.0', 'v5 approval registry versions');
const master = JSON.parse(read('production/DokkaebiDefense/ASSET_MASTERLIST_v3.8.0.json'));
check(master.assets.length === 1130, '1,130-asset production masterlist retained');
check(master.assets.every((entry) => entry.artBibleVersion === '2.0.0' && entry.productionGate === 'golden-vertical-slice-locked' && entry.productionApproved === false), 'all 1,130 assets inherit art lock and production gate');
const characterAssets = master.assets.filter((entry) => ['characters', 'monsters', 'bosses'].includes(entry.category));
check(characterAssets.every((entry) => entry.characterDnaVersion === '3.0.0' && entry.technical.animations?.length === 11), 'all character-family plans inherit DNA v3.0 and 11 clips');
check(master.assets.filter((entry) => entry.category === 'characters').every((entry) => entry.technical.sockets?.length === 6), 'all planned characters require six equipment sockets');

check(registry.runtimeAssets.length === 19, 'v5 registry covers 19 runtime GLBs');
check(registry.runtimeAssets.every((entry) => entry.runtimeHarmonized && !entry.productionApproved && !entry.characterDnaValidated), 'legacy GLBs harmonized but not falsely approved');
check(registry.goldenVerticalSlice.length === 6 && registry.summary.goldenSliceAverageCompletion === 33, 'registry golden slice planning baseline');

if (failures.length) {
  console.error(`\nFAIL v5.0.0 Moonstone Genesis contract ${failures.length}건`);
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log('v5.0.0 Moonstone Genesis massive update contract verified');
