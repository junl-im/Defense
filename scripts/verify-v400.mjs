import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  EQUIPMENT_ITEMS, EQUIPMENT_SLOTS, createDefaultEquipmentState, equipItem,
  getEquippedItems, getEquipmentBonuses, awardEquipmentDrop
} from '../src/equipment-system.js';
import {
  createDefaultHeroMastery, getHeroMasteryBonus, awardHeroMastery, xpForNextLevel
} from '../src/hero-mastery.js';
import { STAGE_ROADMAP, getStageProgress } from '../src/stage-progression.js';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => {
  failures.push(message);
  console.error(`FAIL ${message}`);
  console.error(`::error title=v4.0 progression contract::${message}`);
};
const read = (path) => readFileSync(resolve(root, path), 'utf8');

for (const path of ['src/equipment-system.js', 'src/hero-mastery.js', 'src/stage-progression.js']) {
  if (existsSync(resolve(root, path))) pass(`v4 module ${path}`);
  else fail(`v4 module missing: ${path}`);
}

if (EQUIPMENT_SLOTS.length === 3 && ['weapon', 'charm', 'boots'].every((id) => EQUIPMENT_SLOTS.some((slot) => slot.id === id))) pass('equipment slots 3/3');
else fail(`equipment slot contract mismatch: ${EQUIPMENT_SLOTS.map((slot) => slot.id).join(', ')}`);

if (EQUIPMENT_ITEMS.length === 9 && new Set(EQUIPMENT_ITEMS.map((item) => item.id)).size === 9) pass('equipment catalog 9 unique items');
else fail(`equipment catalog expected 9 unique items, found ${EQUIPMENT_ITEMS.length}`);

const defaultEquipment = createDefaultEquipmentState();
if (defaultEquipment.owned.length === 3 && getEquippedItems(defaultEquipment).length === 3) pass('starter equipment loadout complete');
else fail('starter equipment loadout incomplete');

const equippedRare = equipItem({ ...defaultEquipment, owned: [...defaultEquipment.owned, 'jade-edge'] }, 'jade-edge');
const bonuses = getEquipmentBonuses(equippedRare);
if (equippedRare.equipped.weapon === 'jade-edge' && bonuses.heroDamage > 1.09 && bonuses.skillDamage > 1.04) pass('equipment selection changes combat bonuses');
else fail('equipment bonuses not applied');

const newDrop = awardEquipmentDrop(defaultEquipment, { wave: 10, won: true, random: () => .99 });
if (newDrop.item && newDrop.state.drops === 1 && (newDrop.duplicate || newDrop.state.owned.length === 4)) pass('equipment reward handles new and duplicate drops');
else fail('equipment reward state invalid');

const mastery = createDefaultHeroMastery();
const masteryReward = awardHeroMastery(mastery, 'warrior', { wave: 10, won: true });
if (masteryReward.gained === 113 && masteryReward.entry.runs === 1 && masteryReward.entry.wins === 1 && masteryReward.entry.level >= 2) pass('hero mastery reward and level-up');
else fail(`hero mastery reward mismatch: ${JSON.stringify(masteryReward)}`);
if (xpForNextLevel(2) > xpForNextLevel(1) && getHeroMasteryBonus(masteryReward.state, 'warrior').heroDamage > 1) pass('hero mastery scaling bonus');
else fail('hero mastery scaling invalid');

if (STAGE_ROADMAP.length === 7 && STAGE_ROADMAP[0].id === 'goblin-village') pass('seven-stage roadmap with Dokkaebi Village active');
else fail('stage roadmap contract mismatch');
const zoneNames = [0, 3, 6, 9].map((wave) => getStageProgress(wave, 10).zone.name);
if (new Set(zoneNames).size === 4) pass('Dokkaebi Village four-zone wave progression');
else fail(`stage zones not distinct: ${zoneNames.join(', ')}`);

const html = read('index.html');
const main = read('src/main.js');
const style = read('src/style.css');
for (const id of [
  'equipment-btn', 'hud-equipment-btn', 'pause-equipment-btn', 'equipment-modal',
  'equipment-slots', 'equipment-list', 'equipment-essence', 'equipment-bonus',
  'equipment-mastery', 'stage-chip', 'stage-progress', 'boss-danger-frame',
  'result-equipment-reward', 'result-mastery-reward'
]) {
  if (html.includes(`id="${id}"`)) pass(`v4 UI ${id}`);
  else fail(`v4 UI missing: ${id}`);
}

for (const token of [
  'loadEquipmentState()', 'loadHeroMastery()', 'applyEquipmentBonuses(this.mods',
  'awardEquipmentDrop(this.equipmentState', 'awardHeroMastery(this.heroMastery',
  'renderEquipmentModal()', 'updateStageHUD()', 'bossDangerFrame.dataset.urgency'
]) {
  if (main.includes(token)) pass(`v4 runtime ${token}`);
  else fail(`v4 runtime missing: ${token}`);
}

for (const selector of ['.equipment-card', '.equipment-item', '.stage-chip', '.boss-danger-frame', '.result-progression']) {
  if (style.includes(selector)) pass(`v4 style ${selector}`);
  else fail(`v4 style missing: ${selector}`);
}

if (html.includes('.svg') || html.includes('image/svg+xml') || html.includes('<svg')) fail('v4 HTML SVG violation');
else pass('v4 UI remains raster/CSS only');

if (failures.length) {
  console.error(`\n========== V4.0 FAILURE DIGEST (${failures.length}) ==========`);
  failures.forEach((message, index) => console.error(`${index + 1}. ${message}`));
  console.error('=====================================================');
  process.exit(1);
}
console.log('v4.0 persistent equipment, mastery, stage and boss HUD contract verified');
