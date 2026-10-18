import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TILE_TYPES } from '../src/tiles/TileDefs.js';
import { BUILDINGS, VILLAGE_UPGRADE, fmtCost } from '../src/config/BuildingConfig.js';
import { RESEARCH } from '../src/config/ResearchConfig.js';
import { TIERS, FACTION_ARCHETYPES, WORLD_EVENTS, UNIT_TYPES } from '../src/config/EconomyConfig.js';
const hangul = /[가-힣]/;
const checkText = (group, key, field, value) => {
  assert.equal(typeof value, 'string', group + '.' + key + '.' + field + ': not a string');
  assert(hangul.test(value), group + '.' + key + '.' + field + ': not Korean: ' + value);
};
for (const [key, item] of Object.entries(TILE_TYPES)) checkText('TILE_TYPES', key, 'name', item.name);
for (const [key, item] of Object.entries(BUILDINGS)) {
  checkText('BUILDINGS', key, 'name', item.name);
  checkText('BUILDINGS', key, 'desc', item.desc);
}
checkText('VILLAGE_UPGRADE', 'village', 'name', VILLAGE_UPGRADE.name);
for (const [key, item] of Object.entries(RESEARCH)) {
  checkText('RESEARCH', key, 'name', item.name);
  checkText('RESEARCH', key, 'unlocks', item.unlocks);
}
for (const [index, item] of TIERS.entries()) checkText('TIERS', index, 'name', item.name);
for (const [key, item] of Object.entries(FACTION_ARCHETYPES)) checkText('FACTIONS', key, 'label', item.label);
for (const [key, item] of Object.entries(WORLD_EVENTS)) checkText('WORLD_EVENTS', key, 'label', item.label);
for (const [key, item] of Object.entries(UNIT_TYPES)) {
  checkText('UNIT_TYPES', key, 'name', item.name);
  checkText('UNIT_TYPES', key, 'desc', item.desc);
}
assert(fmtCost({wood:5,stone:2,food:3,gold:4,influence:1}).includes('목재'), 'Korean resource costs missing');
const page=readFileSync('index.html','utf8');
assert(page.includes('<html lang="ko">'), 'document language is not Korean');
assert(page.includes('왕국전략'), 'Korean title missing');
assert(page.includes('KoreanGuide.js'), 'Korean help missing');
const englishText = ['Buy Tile', 'Researching ', 'Maximum tier reached', 'Not enough resources',
  'Tile cap — upgrade kingdom', 'Victory! The tile is yours', 'No neighbours yet',
  'New kingdom begins', 'Food stores depleted', 'Start a new kingdom?'];
for (const path of ['src/core/Game.js','src/systems/ArmySystem.js','src/systems/BuildingSystem.js',
  'src/systems/WorldEventsSystem.js','src/ui/UI.js','src/ui/ResearchPanel.js',
  'src/ui/ResourcePanel.js','src/ui/FactionPanel.js']) {
  const source=readFileSync(path,'utf8');
  for (const phrase of englishText) assert(!source.includes(phrase),
    path+' still contains user-facing English: '+phrase);
}
console.log('PASS Korean translation: '+Object.keys(BUILDINGS).length+' buildings, '+
  Object.keys(RESEARCH).length+' studies, '+Object.keys(TILE_TYPES).length+
  ' terrains, '+TIERS.length+' tiers and all battle/event text.');
