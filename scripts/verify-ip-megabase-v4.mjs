import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import {
  ACTION_TIMING_PRESETS_V4,
  AUTHORED_DIRECTIONS_V4,
  GUARDIAN_CITADEL_STATES_V4,
  HERO_ACTIONS_V4,
  HUD_SHELLS_V4,
  IP_KNOWLEDGE_BASE_COUNTS,
  IP_KNOWLEDGE_MEGABASE_SUMMARY,
  IP_KNOWLEDGE_MEGABASE_VERSION,
  IP_KNOWLEDGE_RECORD_COUNTS,
  IP_KNOWLEDGE_STYLE_LOCK,
  MONSTER_ACTIONS_V4,
  WORLD_HP_STATUS_V4
} from '../src/ip-knowledge-megabase-v4.js';

const root = path.resolve(import.meta.dirname, '..');
const productionRoot = path.join(root, 'production/DokkaebiDefense/14_IP_Knowledge_Megabase');
const publicRoot = path.join(root, 'public/assets/ip-mega-v4');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => {
  if (!condition) failures.push(message);
  return condition;
};
const json = (file) => JSON.parse(readFileSync(file, 'utf8'));
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const sameObject = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function filesRecursive(directory) {
  if (!existsSync(directory)) return [];
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...filesRecursive(full));
    else if (entry.isFile()) result.push(full);
  }
  return result;
}

function readRows(relativePath) {
  const file = path.join(productionRoot, relativePath);
  const payload = json(file);
  check(payload.megabaseVersion === IP_KNOWLEDGE_MEGABASE_VERSION, `${relativePath}: megabase version mismatch`);
  check(payload.count === payload.rows?.length, `${relativePath}: row count mismatch`);
  return payload.rows || [];
}

const requiredFiles = [
  path.join(productionRoot, 'IP_MEGA_INDEX_v4.0.0.json'),
  path.join(productionRoot, 'README.md'),
  path.join(productionRoot, 'spec/DIRECTION_LIBRARY_v4.0.0.json'),
  path.join(productionRoot, 'spec/ACTION_TIMING_LIBRARY_v4.0.0.json'),
  path.join(productionRoot, 'spec/WORLD_HP_STATUS_LIBRARY_v4.0.0.json'),
  path.join(publicRoot, 'data/ip-mega-index-v4.json'),
  path.join(publicRoot, 'data/ip-mega-sample-v4.json'),
  path.join(publicRoot, 'reference/gameplay-key-visual-v4.webp'),
  path.join(publicRoot, 'reference/art-production-board-v4.webp'),
  path.join(root, 'public/ip-mega-library-v4.html')
];
for (const file of requiredFiles) check(existsSync(file), `required megabase file missing: ${path.relative(root, file)}`);
if (!failures.length) pass('required production, public data, reference art and viewer files exist');

const baseSum = Object.values(IP_KNOWLEDGE_BASE_COUNTS).reduce((sum, count) => sum + count, 0);
check(baseSum === 8192, `base asset sum expected 8192, got ${baseSum}`);
check(IP_KNOWLEDGE_RECORD_COUNTS.baseAssets === baseSum, 'baseAssets summary does not match category sum');
const grandSum = IP_KNOWLEDGE_RECORD_COUNTS.baseAssets
  + IP_KNOWLEDGE_RECORD_COUNTS.directionalMotion
  + IP_KNOWLEDGE_RECORD_COUNTS.towerStateActions
  + IP_KNOWLEDGE_RECORD_COUNTS.hudContracts
  + IP_KNOWLEDGE_RECORD_COUNTS.visualQaScenarios
  + IP_KNOWLEDGE_RECORD_COUNTS.performanceProfiles
  + IP_KNOWLEDGE_RECORD_COUNTS.knowledgeRelations;
check(grandSum === 147232, `record sum expected 147232, got ${grandSum}`);
check(IP_KNOWLEDGE_RECORD_COUNTS.total === grandSum, 'total record summary mismatch');
check(IP_KNOWLEDGE_MEGABASE_SUMMARY.baseAssets === 8192, 'runtime summary base asset count mismatch');
check(IP_KNOWLEDGE_MEGABASE_SUMMARY.totalRecords === 147232, 'runtime summary total record count mismatch');
check(IP_KNOWLEDGE_MEGABASE_SUMMARY.finalArtApproved === 0, 'runtime summary must not grant final-art approval');
if (!failures.length) pass('8,192 base assets and 147,232 total records reconcile exactly');

const directionIds = new Set(AUTHORED_DIRECTIONS_V4.map((direction) => direction.id));
const directionIndexes = new Set(AUTHORED_DIRECTIONS_V4.map((direction) => direction.index));
const directionDegrees = new Set(AUTHORED_DIRECTIONS_V4.map((direction) => direction.degrees));
check(AUTHORED_DIRECTIONS_V4.length === 11, 'authored direction count must be 11');
check(directionIds.size === 11 && directionIndexes.size === 11 && directionDegrees.size === 11, 'directions must be unique');
check(AUTHORED_DIRECTIONS_V4.every((direction) => direction.authored === true && direction.mirroringAllowed === false), 'all directions must be authored and non-mirrored');
check(HERO_ACTIONS_V4.length === 14 && new Set(HERO_ACTIONS_V4).size === 14, 'hero action count must be 14 unique actions');
check(MONSTER_ACTIONS_V4.length === 10 && new Set(MONSTER_ACTIONS_V4).size === 10, 'monster action count must be 10 unique actions');
check(Object.keys(ACTION_TIMING_PRESETS_V4).every((kind) => ACTION_TIMING_PRESETS_V4[kind].windup > 0 && ACTION_TIMING_PRESETS_V4[kind].active > 0 && ACTION_TIMING_PRESETS_V4[kind].recovery > 0), 'action timing presets must have positive phases');
check(GUARDIAN_CITADEL_STATES_V4.growthTiers.length === 5 && GUARDIAN_CITADEL_STATES_V4.damageStates.length === 4 && GUARDIAN_CITADEL_STATES_V4.actionModes.length === 3, 'guardian/tower state matrix must be 5 x 4 x 3');
check(WORLD_HP_STATUS_V4.length === 8 && ['shield', 'break', 'stun', 'poison'].every((id) => WORLD_HP_STATUS_V4.some((item) => item.id === id)), 'world HP status library is incomplete');
check(HUD_SHELLS_V4.pc.shell !== HUD_SHELLS_V4.mobile.shell && HUD_SHELLS_V4.mobile.touchTargetPx > HUD_SHELLS_V4.pc.touchTargetPx, 'PC/mobile HUD shells must be separated');
if (!failures.length) pass('11 authored directions, differentiated actions, state matrix, world HP and HUD contracts are locked');

const productionIndexPath = path.join(productionRoot, 'IP_MEGA_INDEX_v4.0.0.json');
const publicIndexPath = path.join(publicRoot, 'data/ip-mega-index-v4.json');
const productionIndex = existsSync(productionIndexPath) ? json(productionIndexPath) : {};
const publicIndex = existsSync(publicIndexPath) ? json(publicIndexPath) : {};
for (const [label, index] of [['production', productionIndex], ['public', publicIndex]]) {
  check(index.megabaseVersion === '4.0.0', `${label} index version mismatch`);
  check(index.styleLockId === IP_KNOWLEDGE_STYLE_LOCK, `${label} index style lock mismatch`);
  check(sameObject(index.counts?.base, IP_KNOWLEDGE_BASE_COUNTS), `${label} base counts mismatch`);
  check(sameObject(index.counts?.records, IP_KNOWLEDGE_RECORD_COUNTS), `${label} record counts mismatch`);
  check(index.authoredDirectionPolicy?.directions === 11 && index.authoredDirectionPolicy?.authored === true && index.authoredDirectionPolicy?.mirrored === false, `${label} direction policy mismatch`);
  check(index.finalArtStatus?.approved === 0, `${label} index must keep final-art approval at 0`);
}
check(Array.isArray(productionIndex.files) && productionIndex.files.length === 53, `production index expected 53 tracked files, got ${productionIndex.files?.length}`);
for (const meta of productionIndex.files || []) {
  const file = path.join(productionRoot, meta.path);
  if (!check(existsSync(file), `indexed file missing: ${meta.path}`)) continue;
  const data = readFileSync(file);
  check(data.length === meta.bytes, `indexed byte size mismatch: ${meta.path}`);
  check(sha256(data) === meta.sha256, `indexed SHA-256 mismatch: ${meta.path}`);
}
if (!failures.length) pass('production/public indexes, file sizes and SHA-256 inventory are valid');

const categoryIds = new Map();
const allBaseIds = new Set();
for (const [category, expectedCount] of Object.entries(IP_KNOWLEDGE_BASE_COUNTS)) {
  const relativePath = `catalogs/${category.toUpperCase()}_CATALOG_v4.0.0.json`;
  const catalogPath = path.join(productionRoot, relativePath);
  if (!check(existsSync(catalogPath), `catalog missing: ${relativePath}`)) continue;
  const payload = json(catalogPath);
  const rows = payload.rows || [];
  check(payload.category === category, `${category}: catalog category mismatch`);
  check(payload.count === expectedCount && rows.length === expectedCount, `${category}: expected ${expectedCount} rows, got ${rows.length}`);
  const ids = new Set();
  for (const row of rows) {
    check(!ids.has(row.id), `${category}: duplicate id ${row.id}`);
    check(!allBaseIds.has(row.id), `global duplicate base id ${row.id}`);
    ids.add(row.id);
    allBaseIds.add(row.id);
    check(row.category === category, `${row.id}: category mismatch`);
    check(row.knowledgeStatus === 'generated', `${row.id}: knowledgeStatus must be generated`);
    check(row.artStatus === 'planned', `${row.id}: artStatus must be planned`);
    check(row.productionApproved === false, `${row.id}: productionApproved must be false`);
    check(row.styleLockId === IP_KNOWLEDGE_STYLE_LOCK, `${row.id}: style lock mismatch`);
    check(row.mirroringAllowed === false, `${row.id}: mirroring must be forbidden`);
    check(typeof row.delivery?.path === 'string' && row.delivery.path.length > 8, `${row.id}: delivery path missing`);
    check(typeof row.promptPack?.positive === 'string' && row.promptPack.positive.includes('Dokkaebi Defense'), `${row.id}: positive prompt contract missing`);
    check(typeof row.promptPack?.negative === 'string' && row.promptPack.negative.includes('mirrored duplicate direction'), `${row.id}: negative prompt mirror guard missing`);
    const directional = ['heroes', 'guardians', 'monsters', 'bosses'].includes(category);
    check(row.authoredDirections === (directional ? 11 : 0), `${row.id}: authored direction count mismatch`);
    if (directional) check(row.technical?.sheet?.directions === 11 && row.technical?.anchor === 'feet-center', `${row.id}: directional technical contract missing`);
  }
  categoryIds.set(category, ids);
}
check(allBaseIds.size === 8192, `expected 8192 unique base IDs, got ${allBaseIds.size}`);
if (!failures.length) pass('all 11 category catalogs contain unique, production-safe knowledge contracts');

const motionExpected = { hero: 27104, guardian: 13552, monster: 38720, boss: 9856 };
const motionCategory = { hero: 'heroes', guardian: 'guardians', monster: 'monsters', boss: 'bosses' };
const entityMotionCounts = new Map();
let motionTotal = 0;
for (const groupMeta of productionIndex.motionInventory || []) {
  check(groupMeta.count === motionExpected[groupMeta.group], `${groupMeta.group}: motion inventory count mismatch`);
  let groupCount = 0;
  const allowedActions = groupMeta.group === 'monster' ? new Set(MONSTER_ACTIONS_V4) : new Set(HERO_ACTIONS_V4);
  const allowedEntities = categoryIds.get(motionCategory[groupMeta.group]) || new Set();
  for (const shard of groupMeta.shards || []) {
    const rows = readRows(shard.path);
    check(rows.length === shard.count, `${shard.path}: shard count mismatch`);
    check(rows[0]?.id === shard.firstId && rows.at(-1)?.id === shard.lastId, `${shard.path}: first/last id mismatch`);
    for (const row of rows) {
      check(allowedEntities.has(row.entityId), `${row.id}: unknown directional entity ${row.entityId}`);
      check(allowedActions.has(row.action), `${row.id}: invalid action ${row.action}`);
      check(directionIndexes.has(row.directionIndex), `${row.id}: invalid direction index`);
      const direction = AUTHORED_DIRECTIONS_V4[row.directionIndex];
      check(direction?.degrees === row.directionDegrees && direction?.label === row.directionLabel, `${row.id}: direction metadata mismatch`);
      check(row.authored === true && row.mirrored === false, `${row.id}: authored/non-mirror policy broken`);
      check(row.productionApproved === false, `${row.id}: motion record must not be production approved`);
      check(row.anchor === 'feet-center-92-percent', `${row.id}: feet anchor missing`);
      check(row.timing?.windup > 0 && row.timing?.active > 0 && row.timing?.recovery > 0 && row.timing?.duration > 0, `${row.id}: action timing phases invalid`);
      check(Array.isArray(row.sockets) && ['head', 'chest', 'weapon', 'feet', 'vfx-origin'].every((socket) => row.sockets.includes(socket)), `${row.id}: hit/VFX sockets incomplete`);
      entityMotionCounts.set(row.entityId, (entityMotionCounts.get(row.entityId) || 0) + 1);
    }
    groupCount += rows.length;
  }
  check(groupCount === groupMeta.count, `${groupMeta.group}: shard sum mismatch`);
  motionTotal += groupCount;
}
check(motionTotal === 89232, `directional motion total expected 89232, got ${motionTotal}`);
const movingEntityCount = 176 + 88 + 352 + 64;
check(entityMotionCounts.size === movingEntityCount, `expected ${movingEntityCount} moving entities, got ${entityMotionCounts.size}`);
for (const [category, ids] of categoryIds) {
  if (!['heroes', 'guardians', 'monsters', 'bosses'].includes(category)) continue;
  const expected = category === 'monsters' ? 11 * 10 : 11 * 14;
  for (const id of ids) check(entityMotionCounts.get(id) === expected, `${id}: expected ${expected} directional action records, got ${entityMotionCounts.get(id) || 0}`);
}
if (!failures.length) pass('89,232 independently authored 11-direction action records cover all 680 moving entities');

let towerTotal = 0;
const towerCombinationCounts = new Map();
for (const shard of productionIndex.towerInventory || []) {
  const rows = readRows(shard.path);
  check(rows.length === shard.count, `${shard.path}: tower shard count mismatch`);
  for (const row of rows) {
    check(categoryIds.get('towers')?.has(row.towerId), `${row.id}: unknown tower ${row.towerId}`);
    check(GUARDIAN_CITADEL_STATES_V4.growthTiers.includes(row.growthTier), `${row.id}: invalid growth tier`);
    check(GUARDIAN_CITADEL_STATES_V4.damageStates.includes(row.damageState), `${row.id}: invalid damage state`);
    check(GUARDIAN_CITADEL_STATES_V4.actionModes.includes(row.actionMode), `${row.id}: invalid action mode`);
    check(row.productionApproved === false, `${row.id}: tower state must not be approved`);
    towerCombinationCounts.set(row.towerId, (towerCombinationCounts.get(row.towerId) || 0) + 1);
  }
  towerTotal += rows.length;
}
check(towerTotal === 10560, `tower state total expected 10560, got ${towerTotal}`);
check(towerCombinationCounts.size === 176, `tower state coverage expected 176 towers, got ${towerCombinationCounts.size}`);
for (const [towerId, count] of towerCombinationCounts) check(count === 60, `${towerId}: expected 60 state/action combinations, got ${count}`);
if (!failures.length) pass('10,560 tower growth, crack, critical and action-state combinations are complete');

const hudRows = readRows(productionIndex.hudInventory?.path || 'hud/HUD_CONTRACTS_v4.0.0.json');
check(hudRows.length === 480, `HUD contract total expected 480, got ${hudRows.length}`);
const hudPlatforms = new Set(hudRows.map((row) => row.platform));
check(hudPlatforms.has('pc') && hudPlatforms.has('mobile'), 'HUD contracts must include PC and mobile');
for (const row of hudRows) {
  check(row.shell === HUD_SHELLS_V4[row.platform]?.shell, `${row.id}: HUD shell mismatch`);
  check(row.productionApproved === false, `${row.id}: HUD contract must not be production approved`);
  check(row.overlapRules?.includes('world-hp-never-under-skill-shell'), `${row.id}: world HP overlap guard missing`);
}
if (!failures.length) pass('480 separate PC/mobile combat HUD contracts pass shell and overlap rules');

let qaTotal = 0;
const qaWaves = new Set();
for (const shard of productionIndex.qaInventory || []) {
  const rows = readRows(shard.path);
  for (const row of rows) {
    qaWaves.add(row.wave);
    check(row.wave >= 1 && row.wave <= 10, `${row.id}: wave out of range`);
    check(row.checks?.includes('hero-monster-overlap') && row.checks?.includes('boss-ground-contact') && row.checks?.includes('hit-point-alignment') && row.checks?.includes('action-timing-visible'), `${row.id}: visual QA checks incomplete`);
    check(row.productionApproved === false, `${row.id}: QA scenario must not be approved`);
  }
  qaTotal += rows.length;
}
check(qaTotal === 5040, `visual QA total expected 5040, got ${qaTotal}`);
check(qaWaves.size === 10 && [...qaWaves].every((wave) => wave >= 1 && wave <= 10), 'visual QA must cover all 10 waves');
if (!failures.length) pass('5,040 browser visual, overlap, scale and action-timing QA scenarios cover waves 1–10');

const performanceRows = readRows(productionIndex.performanceInventory?.path || 'performance/PERFORMANCE_REGRESSION_PROFILES_v4.0.0.json');
check(performanceRows.length === 960, `performance profile total expected 960, got ${performanceRows.length}`);
for (const row of performanceRows) {
  check(['memory', 'texture-streaming', 'gpu-frame-time', 'draw-call'].every((probe) => row.probes?.includes(probe)), `${row.id}: performance probes incomplete`);
  check(row.durationMinutes >= 5 && row.durationMinutes <= 240, `${row.id}: invalid duration`);
  check(row.productionApproved === false, `${row.id}: performance profile must not be approved`);
}
if (!failures.length) pass('960 long-run memory, texture, GPU and draw-call regression profiles are present');

let relationTotal = 0;
const relationIds = new Set();
for (const shard of productionIndex.relationInventory || []) {
  const rows = readRows(shard.path);
  for (const row of rows) {
    check(!relationIds.has(row.id), `duplicate relation id ${row.id}`);
    relationIds.add(row.id);
    check(allBaseIds.has(row.sourceId), `${row.id}: unresolved source ${row.sourceId}`);
    check(allBaseIds.has(row.targetId), `${row.id}: unresolved target ${row.targetId}`);
    check(['uses-vfx', 'uses-ui', 'uses-environment', 'uses-audio'].includes(row.kind), `${row.id}: invalid relation kind`);
    check(row.weight >= 0.72 && row.weight <= 0.99, `${row.id}: relation weight out of range`);
  }
  relationTotal += rows.length;
}
check(relationTotal === 32768 && relationIds.size === 32768, `knowledge relation total expected 32768, got ${relationTotal}`);
if (!failures.length) pass('32,768 knowledge relations resolve to valid base asset IDs');

const samplePath = path.join(publicRoot, 'data/ip-mega-sample-v4.json');
if (existsSync(samplePath)) {
  const sample = json(samplePath);
  check(sample.count === 128 && sample.rows?.length === 128, `public sample expected 128 rows, got ${sample.rows?.length}`);
  check(new Set((sample.rows || []).map((row) => row.id)).size === sample.rows?.length, 'public sample IDs must be unique');
  check((sample.rows || []).every((row) => allBaseIds.has(row.id) && row.artStatus === 'planned' && row.mirroringAllowed === false), 'public sample contains invalid or over-approved rows');
  check(new Set((sample.rows || []).map((row) => row.category)).size === 11, 'public sample must cover all 11 categories');
}
const viewerPath = path.join(root, 'public/ip-mega-library-v4.html');
if (existsSync(viewerPath)) {
  const viewer = readFileSync(viewerPath, 'utf8');
  check(viewer.includes('ip-mega-index-v4.json') && viewer.includes('ip-mega-sample-v4.json'), 'viewer data endpoints missing');
  check(viewer.includes('147,232') && viewer.includes('AUTHORED 11 / MIRROR 0'), 'viewer scale/direction messaging missing');
  check(/final art approval|final-art|최종/i.test(viewer), 'viewer must separate knowledge generation from final-art approval');
}
for (const name of ['gameplay-key-visual-v4.webp', 'art-production-board-v4.webp']) {
  const file = path.join(publicRoot, 'reference', name);
  if (existsSync(file)) check(statSync(file).size > 100000, `${name}: reference art is unexpectedly small`);
}
const svgFiles = [...filesRecursive(productionRoot), ...filesRecursive(publicRoot)].filter((file) => file.toLowerCase().endsWith('.svg'));
check(svgFiles.length === 0, `SVG files are forbidden in megabase outputs: ${svgFiles.map((file) => path.relative(root, file)).join(', ')}`);
if (!failures.length) pass('public viewer/sample/reference art are usable and megabase outputs contain no SVG');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nIP Knowledge Megabase verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log(`\nIP Knowledge Megabase v${IP_KNOWLEDGE_MEGABASE_VERSION} verified: 8,192 base assets, 147,232 records, 11 authored directions, final-art approvals 0.`);
