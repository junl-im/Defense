import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ElementalReactionSystem, { ELEMENTAL_REACTION_SYSTEM_VERSION, ELEMENTAL_REACTIONS } from '../src/combat/elemental-reaction-system.js';
import BattleMomentumSystem, { BATTLE_MOMENTUM_VERSION } from '../src/combat/battle-momentum-system.js';
import BossEscalationDirector, { BOSS_ESCALATION_VERSION } from '../src/combat/boss-escalation-director.js';
import StatusEffectSystem, { STATUS_EFFECT_SYSTEM_VERSION } from '../src/combat/status-effect-system.js';
import CombatTelemetry, { COMBAT_TELEMETRY_VERSION } from '../src/combat/combat-telemetry.js';
import { ENGINE_VERSION } from '../src/engine/engine-config.js';
import { ART_PRODUCTION_GATE_VERSION, ART_PRODUCTION_SUMMARY } from '../src/art-production-gate.js';
import { migrateSaveSchema, SAVE_SCHEMA_VERSION } from '../src/runtime/save-schema.js';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const pkg = JSON.parse(read('package.json'));
const registry = JSON.parse(read('docs/ART_ASSET_APPROVAL_REGISTRY_v7.0.0.json'));
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => condition ? pass(message) : failures.push(message);

check(Number(pkg.version.split('.')[0]) >= 7, 'package version remains v7 or later');
check(Number(ENGINE_VERSION.split('.')[0]) >= 6, 'engine version remains 6.0.0 or later');
check(Number(ART_PRODUCTION_GATE_VERSION.split('.')[0]) >= 7, 'art gate version remains v7 or later');
check(SAVE_SCHEMA_VERSION >= 7, 'save schema remains v7 or later');
check(ELEMENTAL_REACTION_SYSTEM_VERSION === '1.0.0', 'elemental reaction version 1.0.0');
check(BATTLE_MOMENTUM_VERSION === '1.0.0', 'battle momentum version 1.0.0');
check(BOSS_ESCALATION_VERSION === '1.0.0', 'boss escalation version 1.0.0');
check(STATUS_EFFECT_SYSTEM_VERSION === '2.0.0', 'status effect system upgraded to 2.0.0');
check(COMBAT_TELEMETRY_VERSION === '2.0.0', 'combat telemetry upgraded to 2.0.0');
check(Object.keys(ELEMENTAL_REACTIONS).length === 10, 'ten elemental reactions defined');

const target = { dead: false, boss: false, maxHp: 100, statusEffects: new Map() };
const statuses = new StatusEffectSystem({ random: () => 0 });
statuses.apply(target, 'burn', { chance: 1 });
const reactions = new ElementalReactionSystem();
const reaction = reactions.resolve(target, 'frost', 100);
check(reaction?.id === 'steamBurst' && reaction.bonusDamage > 40, 'burn plus frost creates steam burst');
check(!target.statusEffects.has('burn'), 'reaction consumes configured status');
check(reactions.diagnostics.triggered === 1 && reactions.diagnostics.damage > 0, 'reaction diagnostics record trigger and damage');
check(statuses.getTypeForSource('thunder') === 'shock' && statuses.getActiveTypes(target).length === 0, 'status source and active status helpers work');

const momentum = new BattleMomentumSystem();
let activated = false;
for (let index = 0; index < 10; index += 1) activated = momentum.recordReaction(10) || activated;
check(activated && momentum.active, 'momentum reaches overdrive at 100');
check(momentum.damageMultiplier > 1 && momentum.rewardMultiplier > 1, 'overdrive grants combat and reward multipliers');
momentum.update(8);
check(!momentum.active, 'overdrive expires after duration');

const bossDirector = new BossEscalationDirector();
const boss = { id: 7, boss: true, dead: false, hp: 10, maxHp: 100, bossPhase: 3 };
bossDirector.register(boss);
const rageState = bossDirector.update(boss, 90);
check(rageState.enraged && rageState.enteredEnrage, 'low-health long fight boss enters enrage');
check(bossDirector.specialDelayMultiplier(boss) < 1 && bossDirector.damageMultiplier(boss) > 1, 'boss enrage accelerates patterns and damage');
check(bossDirector.rewardMultiplier(boss) === 1.2, 'enraged boss grants bonus reward');

const telemetry = new CombatTelemetry();
telemetry.recordReaction('steamBurst', 44);
telemetry.recordOverdrive();
telemetry.recordBossEnrage();
check(telemetry.snapshot.reactions.steamBurst === 1 && telemetry.snapshot.overdrives === 1 && telemetry.snapshot.bossEnrages === 1, 'telemetry records v7 combat events');

const fakeData = new Map([['dokkaebi-guardian-growth-v1', '{"shards":10}']]);
const fakeStorage = { getItem: (key) => fakeData.has(key) ? fakeData.get(key) : null, setItem: (key, value) => fakeData.set(key, String(value)) };
const migration = migrateSaveSchema(fakeStorage);
check(migration.migrated && fakeStorage.getItem('dokkaebi-save-schema-version') === String(SAVE_SCHEMA_VERSION), 'save migration writes current schema');
check(Boolean(fakeStorage.getItem(`dokkaebi-save-backup-v${SAVE_SCHEMA_VERSION}`)), 'save migration writes current-version backup');

const main = read('src/main.js');
const html = read('index.html');
const style = read('src/style.css');
const productionConsole = read('src/production-console.js');
check(main.includes('ElementalReactionSystem') && main.includes('elementalReactions.resolve'), 'elemental reactions integrated into damage flow');
check(main.includes('BattleMomentumSystem') && main.includes('updateBattleMomentum') && main.includes('momentum-overdrive'), 'battle momentum integrated into runtime and UI');
check(main.includes('BossEscalationDirector') && main.includes('MYTHIC BOSS ENRAGE'), 'boss escalation integrated into runtime');
check(html.includes('id="title-setup-modal"') && main.includes('ElementalReactionSystem') && productionConsole.includes('REACTIONS') && productionConsole.includes('MOMENTUM'), 'v7 reaction and momentum lineage retained outside simplified title');
check(html.includes('momentum-meter') && html.includes('momentum-progress'), 'player-facing momentum meter exists');
check(style.includes('MYTHIC CONVERGENCE v7.0.0') && style.includes('momentum-overdrive'), 'v7 visual tokens and overdrive feedback exist');
check((productionConsole.includes('MYTHIC CONVERGENCE v7') || productionConsole.includes('GOLDEN CONVERGENCE v10') || productionConsole.includes('SOVEREIGN ASSEMBLY v11') || productionConsole.includes('GOLDEN DOMINION v12')) && productionConsole.includes('REACTIONS') && productionConsole.includes('BOSS RAGE'), 'production console includes v7 diagnostics');
check(registry.gameVersion === '7.0.0' && registry.engineVersion === '6.0.0' && registry.gateVersion === '7.0.0', 'v7 art registry versions');
check(registry.runtimeAssets.length === 19 && registry.runtimeAssets.every((entry) => !entry.productionApproved), 'legacy assets remain honestly unapproved');
check(ART_PRODUCTION_SUMMARY.approved === 0 && !ART_PRODUCTION_SUMMARY.massProductionUnlocked, 'golden slice production lock remains enforced');

if (failures.length) {
  console.error(`\nFAIL v7.0.0 Mythic Convergence contract ${failures.length}건`);
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log('v7.0.0 Mythic Convergence massive update contract verified');
