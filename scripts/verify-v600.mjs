import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import EncounterDirector, { ENCOUNTER_DIRECTOR_VERSION, ENCOUNTER_MUTATORS } from '../src/combat/encounter-director.js';
import StatusEffectSystem, { STATUS_EFFECT_SYSTEM_VERSION, STATUS_EFFECTS } from '../src/combat/status-effect-system.js';
import CombatTelemetry, { COMBAT_TELEMETRY_VERSION } from '../src/combat/combat-telemetry.js';
import RuntimeBudgetManager, { RUNTIME_BUDGET_MANAGER_VERSION } from '../src/engine/runtime-budget-manager.js';
import { ENGINE_VERSION, MOBILE_ENGINE_CONFIG } from '../src/engine/engine-config.js';
import { ART_PRODUCTION_GATE_VERSION, ART_PRODUCTION_SUMMARY, GOLDEN_VERTICAL_SLICE, MASSIVE_UPDATE_MILESTONES } from '../src/art-production-gate.js';
import { migrateSaveSchema, SAVE_SCHEMA_VERSION } from '../src/runtime/save-schema.js';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const pkg = JSON.parse(read('package.json'));
const registry = JSON.parse(read('docs/ART_ASSET_APPROVAL_REGISTRY_v6.0.0.json'));
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => condition ? pass(message) : failures.push(message);

check(Number(pkg.version.split('.')[0]) >= 6, 'package version remains v6 or later');
check(Number(ENGINE_VERSION.split('.')[0]) >= 5, 'engine version remains 5.0.0 or later');
check(Number(ART_PRODUCTION_GATE_VERSION.split('.')[0]) >= 6, 'art production gate remains v6 or later');
check(ENCOUNTER_DIRECTOR_VERSION === '1.0.0', 'encounter director version 1.0.0');
check(Number(STATUS_EFFECT_SYSTEM_VERSION.split('.')[0]) >= 1, 'status effect system remains compatible');
check(Number(COMBAT_TELEMETRY_VERSION.split('.')[0]) >= 1, 'combat telemetry remains compatible');
check(RUNTIME_BUDGET_MANAGER_VERSION === '1.0.0', 'runtime budget manager version 1.0.0');
check(SAVE_SCHEMA_VERSION >= 6, 'save schema remains v6 or later');
check(Object.keys(ENCOUNTER_MUTATORS).length === 7, 'six field doctrines plus boss doctrine');
check(Object.keys(STATUS_EFFECTS).length === 6, 'six elemental status effects');

let randomIndex = 0;
const randomValues = [.91, .22, .77, .36, .64];
const director = new EncounterDirector({ random: () => randomValues[(randomIndex++) % randomValues.length] });
const plan = director.beginWave({ wave: 8, boss: false, coreHpRatio: .92, modeId: 'guardian' });
check(plan.wave === 8 && plan.spawnCountMultiplier > 0 && plan.rewardMultiplier >= 1, 'encounter plan contains valid pacing and reward multipliers');
check(plan.hpMultiplier >= .8 && plan.damageMultiplier >= .8, 'encounter adaptive multipliers remain bounded');
const selected = director.selectEnemyType({ wave: 8, available: [{ id: 'imp', minWave: 1, weight: 1 }, { id: 'crow', minWave: 8, weight: 1 }] });
check(['imp', 'crow'].includes(selected), 'encounter composition selector returns eligible enemy');
director.recordSpawn();
director.recordKill();
const result = director.completeWave({ perfect: true, coreHpRatio: 1 });
check(result.spawned === 1 && result.killed === 1 && result.perfect, 'encounter completion telemetry recorded');

const statuses = new StatusEffectSystem({ random: () => 0 });
const target = { dead: false, maxHp: 100, statusEffects: new Map() };
const applied = statuses.applyFromSource(target, 'ember', 25);
check(applied?.type === 'burn' && target.statusEffects.size === 1, 'element source applies matching status');
let tickDamage = 0;
for (let i = 0; i < 8; i += 1) statuses.update(target, .5, { onDamage: (damage) => { tickDamage += damage; } });
check(tickDamage > 0 && statuses.diagnostics.damageTicks > 0, 'damage-over-time status ticks');
statuses.apply(target, 'frost', { chance: 1 });
const statusState = statuses.update(target, .1);
check(statusState.speedMultiplier < 1 && statusState.damageTakenMultiplier >= 1, 'status stack affects speed and incoming damage');

const telemetry = new CombatTelemetry();
telemetry.startWave(1, plan);
telemetry.recordDamage('ember', 42);
telemetry.recordStatus('burn');
telemetry.recordKill({ boss: false });
const telemetryWave = telemetry.endWave({ wave: 1, perfect: true, coreHpRatio: 1, planResult: result });
check(telemetry.snapshot.damageDealt === 42 && telemetry.snapshot.kills === 1 && telemetryWave.perfect, 'combat telemetry records wave events');

const runtimeBudget = new RuntimeBudgetManager({ config: MOBILE_ENGINE_CONFIG, lowPower: true });
runtimeBudget.update({ profile: 'performance', performance: { fps: 28, p95FrameMs: 52, severeFramePercent: 8 } });
const cap = runtimeBudget.cap('enemies');
check(cap >= 8 && cap < MOBILE_ENGINE_CONFIG.budgets.activeEnemiesMobile, 'runtime budget lowers enemy cap under pressure');
check(runtimeBudget.canSpawn('enemies', cap - 1) && !runtimeBudget.canSpawn('enemies', cap), 'runtime budget blocks over-cap spawn');

const fakeData = new Map();
const fakeStorage = {
  getItem: (key) => fakeData.has(key) ? fakeData.get(key) : null,
  setItem: (key, value) => fakeData.set(key, String(value))
};
fakeStorage.setItem('dokkaebi-run-mode-v1', 'guardian');
const migration = migrateSaveSchema(fakeStorage);
check(migration.migrated && Number(fakeStorage.getItem('dokkaebi-save-schema-version')) >= 6, 'save migration creates current backup and marker');

const main = read('src/main.js');
const html = read('index.html');
const style = read('src/style.css');
const consoleSource = read('src/production-console.js');
check(main.includes('EncounterDirector') && main.includes('activeEncounterPlan') && main.includes('BATTLE DOCTRINE'), 'encounter director integrated into runtime wave flow');
check(main.includes('StatusEffectSystem') && main.includes('statusSpeedMultiplier') && main.includes('applyFromSource'), 'status effect system integrated into combat flow');
check(main.includes('RuntimeBudgetManager') && main.includes("canSpawn('enemies'"), 'runtime spawn budget integrated');
check(main.includes('CombatTelemetry') && main.includes('combatTelemetry.recordDamage'), 'combat telemetry integrated');
check(main.includes('SAVE_SCHEMA_VERSION') && main.includes('saveMigration'), 'save schema diagnostics integrated');
check(html.includes('id="title-setup-modal"') && main.includes('EncounterDirector') && consoleSource.includes('DOCTRINE'), 'battlefront lineage remains in runtime and production console behind simplified title');
check(style.includes('--battlefront-cyan'), 'battlefront design tokens remain available');
check((consoleSource.includes('BATTLEFRONT v6') || consoleSource.includes('MYTHIC CONVERGENCE v7') || consoleSource.includes('GOLDEN CONVERGENCE v10') || consoleSource.includes('SOVEREIGN ASSEMBLY v11') || consoleSource.includes('GOLDEN DOMINION v12') || consoleSource.includes('TRANSPARENT ARSENAL v13') || consoleSource.includes('ATLAS DOMINION v14')) && consoleSource.includes('DOCTRINE') && consoleSource.includes('BUDGET'), 'production console preserves v6 combat diagnostics');

check(GOLDEN_VERTICAL_SLICE.length === 6 && ART_PRODUCTION_SUMMARY.approved === 0, 'golden slice remains honest with zero final approvals');
check(!ART_PRODUCTION_SUMMARY.massProductionUnlocked, 'mass production remains locked');
check(MASSIVE_UPDATE_MILESTONES.filter((entry) => entry.status === 'done').length >= 4, 'four v6 infrastructure milestones completed');
check(registry.gameVersion === '6.0.0' && registry.engineVersion === '5.0.0' && registry.gateVersion === '6.0.0', 'v6 art approval registry versions');
check(registry.runtimeAssets.length === 19 && registry.runtimeAssets.every((entry) => !entry.productionApproved), '19 legacy runtime assets remain unapproved');

if (failures.length) {
  console.error(`\nFAIL v6.0.0 Battlefront Ascension contract ${failures.length}건`);
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log('v6.0.0 Battlefront Ascension massive update contract verified');
