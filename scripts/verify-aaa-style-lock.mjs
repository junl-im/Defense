import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { ART_STYLE_LOCK_ID, ABSOLUTE_STYLE_PROMPT, ABSOLUTE_NEGATIVE_PROMPT, ASSET_APPROVAL_STATES } from '../src/art-style-tokens.js';
import { CURRENT_ASSET_APPROVAL, ASSET_APPROVAL_POLICY } from '../src/engine/asset-quality.js';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };
const catalog = JSON.parse(readFileSync(resolve(root, 'docs/AAA_ASSET_PROMPT_CATALOG.json'), 'utf8'));
const audit = JSON.parse(readFileSync(resolve(root, 'docs/CURRENT_ASSET_AUDIT.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(resolve(root, 'docs/ASSET_MANIFEST.json'), 'utf8'));
const machine = JSON.parse(readFileSync(resolve(root, 'docs/ART_BIBLE_MACHINE_SPEC_v2.0.json'), 'utf8'));
const main = readFileSync(resolve(root, 'src/main.js'), 'utf8');
const pipeline = readFileSync(resolve(root, 'src/engine/asset-pipeline.js'), 'utf8');
const premium = readFileSync(resolve(root, 'src/premium-assets.js'), 'utf8');
const diagnostics = readFileSync(resolve(root, 'src/asset-diagnostics.js'), 'utf8');

if (ART_STYLE_LOCK_ID === 'DD-ABSOLUTE-ART-BIBLE-2.0') pass('absolute style lock ID'); else fail('style lock ID');
const promptHash = createHash('sha256').update(ABSOLUTE_STYLE_PROMPT).digest('hex');
if (promptHash.length === 64 && ABSOLUTE_STYLE_PROMPT.includes('42') === false && ABSOLUTE_STYLE_PROMPT.includes('2.3 heads proportion')) pass(`master prompt SHA-256 ${promptHash.slice(0, 12)}`); else fail('master prompt integrity');
if (ABSOLUTE_NEGATIVE_PROMPT.includes('photorealism') && ABSOLUTE_NEGATIVE_PROMPT.includes('pure black shadow') && ABSOLUTE_NEGATIVE_PROMPT.includes('gore')) pass('absolute negative prompt'); else fail('absolute negative prompt');
if (machine.immutable === true && machine.color.rainbowForbidden === true && machine.animations.length === 11) pass('machine-readable absolute lock'); else fail('machine-readable absolute lock');

for (const [key, expected] of Object.entries({ character: 50, monster: 50, boss: 20, weapon: 100, ui: 300, vfx: 150, environment: 80 })) {
  if (catalog.counts[key] === expected) pass(`prompt ${key} ${expected}`); else fail(`prompt ${key} count`);
}
if (catalog.total === 750 && catalog.styleLockId === ART_STYLE_LOCK_ID && catalog.assets.every((asset) => asset.styleLockId === ART_STYLE_LOCK_ID && asset.prompt.startsWith(ABSOLUTE_STYLE_PROMPT))) pass('750 prompts inherit absolute lock'); else fail('prompt catalog lock');
if (catalog.assets.every((asset) => asset.negativePrompt === ABSOLUTE_NEGATIVE_PROMPT)) pass('750 prompts inherit negative lock'); else fail('negative prompt catalog lock');

const approvals = Object.values(CURRENT_ASSET_APPROVAL);
if (approvals.length === 19 && approvals.filter((entry) => entry.status === ASSET_APPROVAL_STATES.prototype).length === 11 && approvals.filter((entry) => entry.status === ASSET_APPROVAL_STATES.review && entry.technicalReady).length === 8) pass('runtime assets quarantined: prototype 11, legacy technical review 8'); else fail('runtime asset approval states');
if (audit.styleLockId === ART_STYLE_LOCK_ID && audit.summary.productionApproved === 0 && audit.summary.prototypes === 11 && audit.summary.artReview === 8 && audit.summary.technicalCandidates === 8 && audit.summary.absoluteArtBibleCandidates === 0) pass('current GLB migration audit: absolute compliant 0'); else fail('current GLB migration audit');
if (manifest.artBible?.styleLockId === ART_STYLE_LOCK_ID && manifest.artBible?.version === '2.0.0' && manifest.promptCatalog?.total === 750) pass('manifest absolute lock sync'); else fail('manifest lock sync');
if (diagnostics.includes('골든 샘플 기술 검수') && diagnostics.includes('approval?.productionReady') && diagnostics.includes("approval?.status === 'art-review'")) pass('runtime diagnostics separate load, review and approval'); else fail('runtime approval diagnostics');
if (pipeline.includes('approval: entry.approval') && pipeline.includes('assetApproval')) pass('approval metadata propagated'); else fail('approval metadata propagation');
if (premium.includes('preserveAuthoredStylizedPbrMaterial') && premium.includes("approvalStatus === 'production-approved' || approvalStatus === 'art-review'") && premium.includes('authoredPbr ? preserveAuthoredStylizedPbrMaterial')) pass('authored PBR material preservation'); else fail('PBR material handling');
if (ASSET_APPROVAL_POLICY.currentPrototypeCount === 11 && ASSET_APPROVAL_POLICY.currentReviewCount === 8) pass('approval policy counts'); else fail('approval policy counts');
if (main.includes('GAME_VERSION')) pass('runtime source available'); else fail('runtime source missing');

if (failures.length) process.exit(1);
console.log('Absolute Art Bible v2.0 style lock and runtime quarantine verification complete');
