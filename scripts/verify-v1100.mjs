import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENGINE_VERSION } from '../src/engine/engine-config.js';
import { SAVE_SCHEMA_VERSION, migrateSaveSchema } from '../src/runtime/save-schema.js';
import { GUARDIAN_COUNCIL_SUMMARY, GUARDIAN_COUNCIL_SUPPORTS, applyGuardianCouncilModifiers, resolveGuardianCouncil } from '../src/guardian-council-system.js';
import BossBreakSystem from '../src/combat/boss-break-system.js';
import { MOONFRONT_ACTS, getMoonfrontAct, MoonfrontCampaignDirector } from '../src/combat/moonfront-campaign-director.js';
import { createDefaultEquipmentState, forgeEquipmentItem, getEquipmentBonuses, getEquipmentForgeCost, getEquipmentForgeLevel, EQUIPMENT_FORGE_MAX_LEVEL } from '../src/equipment-system.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(resolve(root, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
let failures = 0;
const check = (condition, message) => {
  if (condition) console.log(`PASS ${message}`);
  else { failures += 1; console.error(`FAIL ${message}`); }
};

const pkg = json('package.json');
const main = read('src/main.js');
const html = read('index.html');
const style = read('src/style.css');
const consoleSource = read('src/production-console.js');
const catalog = read('src/engine/asset-catalog.js');
const approval = json('docs/ART_ASSET_APPROVAL_REGISTRY_v11.0.0.json');

check(Number((pkg.dokkaebi?.lineageVersion || pkg.version).split('.')[0]) >= 11, 'package version remains v11 or later');
check(Number((pkg.dokkaebi?.lineageVersion || pkg.version).split('.')[0]) >= 11 && main.includes('LEGACY_LINEAGE_VERSION'), 'runtime game lineage remains v11 or later');
check(Number(ENGINE_VERSION.split('.')[0]) >= 9, 'engine version remains 9.0.0 or later');
const assetRevision = Number(catalog.match(/ASSET_REVISION = '(\d+)\.\d+\.\d+'/)?.[1] || 0);
check(assetRevision >= 11, 'asset revision remains v11 or later');
check(SAVE_SCHEMA_VERSION >= 9, 'save schema remains v9 or later');

check(Object.keys(GUARDIAN_COUNCIL_SUPPORTS).length === 5, 'five guardian council supports');
check(GUARDIAN_COUNCIL_SUMMARY.bondCount === 15, 'fifteen guardian council bonds');
const councilMods = { heroDamage: 1, skillDamage: 1, bossDamage: 1, coreDamage: 1, coreHealing: 1, reactionDamage: 1, statusDuration: 1, statusPotency: 1, soulGain: 1, critChanceBonus: 0 };
const council = applyGuardianCouncilModifiers(councilMods, 'warrior', 'shaman');
check(council.bond.id === 'ancestral-guard' && councilMods.coreDamage < 1 && councilMods.coreHealing > 1, 'warrior and shaman council bond modifiers');
check(resolveGuardianCouncil('mage', 'taoist').bond.id === 'five-element-seal', 'mage and taoist unique bond');

check(MOONFRONT_ACTS.length === 4, 'four moonfront campaign acts');
check(getMoonfrontAct(1).id === 'moon-gate' && getMoonfrontAct(4).id === 'moon-market' && getMoonfrontAct(7).id === 'spirit-road' && getMoonfrontAct(10).id === 'eclipse-throne', 'campaign wave mapping');
const campaign = new MoonfrontCampaignDirector();
check(campaign.enterWave(4).changed && campaign.current.index === 2, 'campaign act transition');
check(campaign.completeWave(6).completed && campaign.diagnostics.clearedActs.includes('moon-market'), 'campaign act clear tracking');

const boss = { id: 77, boss: true, dead: false, hp: 1000, maxHp: 1000 };
const breaker = new BossBreakSystem();
breaker.register(boss);
let triggered = false;
for (let index = 0; index < 8; index += 1) {
  const result = breaker.recordDamage(boss, 60, { reaction: true, critical: index % 2 === 0, source: 'test' });
  if (result?.triggered) { triggered = true; break; }
}
check(triggered, 'boss break reaches stagger state');
check(breaker.damageTakenMultiplier(boss) === 1.22, 'boss break vulnerability multiplier');
check(breaker.update(boss, 4).staggered === false && breaker.damageTakenMultiplier(boss) === 1, 'boss break stagger expires');

let forgeState = createDefaultEquipmentState();
forgeState.essence = 10000;
const firstCost = getEquipmentForgeCost('moon-club', 0);
let lastResult = null;
for (let level = 0; level < EQUIPMENT_FORGE_MAX_LEVEL; level += 1) {
  lastResult = forgeEquipmentItem(forgeState, 'moon-club');
  forgeState = lastResult.state;
}
check(firstCost === 8, 'equipment forge base cost');
check(lastResult?.upgraded && getEquipmentForgeLevel(forgeState, 'moon-club') === 5, 'equipment forged to max level');
check(getEquipmentBonuses(forgeState).heroDamage > 1.1, 'forge levels amplify equipment bonuses');
check(forgeEquipmentItem(forgeState, 'moon-club').reason === 'max-level', 'equipment forge max level lock');

const fakeData = new Map([
  ['dokkaebi-save-schema-version', '8'],
  ['dokkaebi-guardian-council-v1', 'mage'],
  ['dokkaebi-equipment-v1', JSON.stringify(forgeState)]
]);
const storage = { getItem: (key) => fakeData.has(key) ? fakeData.get(key) : null, setItem: (key, value) => fakeData.set(key, String(value)) };
const migration = migrateSaveSchema(storage);
check(migration.migrated && fakeData.get('dokkaebi-save-schema-version') === String(SAVE_SCHEMA_VERSION), 'save schema migration writes current version');
check(Boolean(fakeData.get(`dokkaebi-save-backup-v${SAVE_SCHEMA_VERSION}`)), 'save migration writes current backup');
check(fakeData.get(`dokkaebi-save-backup-v${SAVE_SCHEMA_VERSION}`).includes('dokkaebi-guardian-council-v1'), 'save backup includes guardian council');

check(html.includes('id="council-options"') && html.includes('id="boss-break-progress"') && html.includes('id="title-setup-modal"'), 'v11 council and boss break systems retained in setup and combat UI');
check(style.includes('SOVEREIGN ASSEMBLY v11.0.0') && style.includes('.council-selector') && style.includes('.equipment-forge'), 'v11 responsive styles retained');
check(main.includes('applyCouncilWaveIntervention') && main.includes('bossBreak.recordDamage') && main.includes('campaign.enterWave'), 'v11 runtime systems integrated');
check(consoleSource.includes('GUARDIAN COUNCIL') && consoleSource.includes('CAMPAIGN ACT') && consoleSource.includes('BOSS BREAK') && consoleSource.includes('EQUIPMENT FORGE'), 'production console v11 diagnostics');
check(approval.gameVersion === '11.0.0' && approval.engineVersion === '9.0.0' && approval.productionApprovedAssetIds.length === 0, 'v11 approval registry remains honestly locked');
check(existsSync(resolve(root, 'docs/SOVEREIGN_ASSEMBLY_v11.0.0.md')) && existsSync(resolve(root, 'docs/PATCH_NOTES_v11.0.0.md')) && existsSync(resolve(root, 'docs/PATCH_APPLY_v11.0.0.md')), 'v11 operating documents exist');

if (failures) {
  console.error(`\nFAIL v11.0.0 Sovereign Assembly contract ${failures}`);
  process.exit(1);
}
console.log('\nv11.0.0 Sovereign Assembly contract verified');
