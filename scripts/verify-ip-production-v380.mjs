import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  IP_PRODUCTION_VERSION,
  IP_PROJECT_NAME,
  IP_STYLE_LOCK_ID,
  PRODUCTION_DIRECTORIES,
  CHARACTER_PROPORTIONS,
  STARTER_CLASSES,
  RARITIES,
  STAGES,
  MAIN_UI_SCREENS,
  PLAYER_ANIMATIONS,
  ASSET_COUNTS,
  TOTAL_ASSET_COUNT,
  CORE_DOCUMENTS,
  ALLOWED_DELIVERY_FORMATS
} from '../src/ip-production-spec.js';

const root = resolve(import.meta.dirname, '..');
const productionRoot = resolve(root, 'production/DokkaebiDefense');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };

for (const directory of PRODUCTION_DIRECTORIES) {
  if (existsSync(resolve(productionRoot, directory))) pass(`IP production directory ${directory}`);
  else fail(`IP production directory missing: ${directory}`);
}
for (const document of CORE_DOCUMENTS) {
  if (existsSync(resolve(productionRoot, document))) pass(`core IP document ${document}`);
  else fail(`core IP document missing: ${document}`);
}

if (CHARACTER_PROPORTIONS.headsTall === 2.3
  && CHARACTER_PROPORTIONS.headPercent === 42
  && CHARACTER_PROPORTIONS.chestPercent === 18
  && CHARACTER_PROPORTIONS.waistPercent === 15
  && CHARACTER_PROPORTIONS.bodyPercent === 33
  && CHARACTER_PROPORTIONS.legPercent === 25
  && CHARACTER_PROPORTIONS.headPercent + CHARACTER_PROPORTIONS.chestPercent + CHARACTER_PROPORTIONS.waistPercent + CHARACTER_PROPORTIONS.legPercent === 100) {
  pass('2.3-head character proportion contract 42/18/15/25');
} else fail('character proportion contract mismatch');

const expectedClasses = ['도깨비 전사', '도깨비 궁수', '도깨비 법사', '도사', '무당', '호랑이', '해태', '구미호', '산신령', '저승사자', '용'];
if (STARTER_CLASSES.map((entry) => entry.ko).join('|') === expectedClasses.join('|')) pass('starter class roster 11/11');
else fail('starter class roster mismatch');

const expectedRarities = ['common', 'rare', 'epic', 'legend', 'mythic', 'immortal', 'god'];
if (RARITIES.map((entry) => entry.id).join('|') === expectedRarities.join('|')) pass('rarity ladder 7/7');
else fail('rarity ladder mismatch');
if (STAGES.length === 7) pass('stage roster 7/7'); else fail(`stage roster expected 7, found ${STAGES.length}`);
if (MAIN_UI_SCREENS.length === 10) pass('main UI screens 10/10'); else fail(`main UI screens expected 10, found ${MAIN_UI_SCREENS.length}`);
if (PLAYER_ANIMATIONS.length === 11 && PLAYER_ANIMATIONS.includes('Attack1') && PLAYER_ANIMATIONS.includes('Attack2') && PLAYER_ANIMATIONS.includes('Spawn')) pass('player animation set 11/11'); else fail(`player animations expected 11, found ${PLAYER_ANIMATIONS.length}`);

const promptPath = resolve(productionRoot, '01_ArtBible/PROMPT_TEMPLATES_v3.8.0.json');
const promptIds = new Set();
if (!existsSync(promptPath)) fail('prompt template catalog missing');
else {
  const promptCatalog = JSON.parse(readFileSync(promptPath, 'utf8'));
  for (const template of promptCatalog.templates ?? []) promptIds.add(template.id);
  if (promptCatalog.templateCount === 10 && promptIds.size === 10 && promptCatalog.styleLockId === IP_STYLE_LOCK_ID) pass('category prompt templates 10/10');
  else fail('category prompt template contract mismatch');
}

const masterPath = resolve(productionRoot, 'ASSET_MASTERLIST_v3.8.0.json');
let master = null;
if (!existsSync(masterPath)) fail('asset master list missing');
else {
  master = JSON.parse(readFileSync(masterPath, 'utf8'));
  if (master.project === IP_PROJECT_NAME && master.productionVersion === IP_PRODUCTION_VERSION && master.styleLockId === IP_STYLE_LOCK_ID) pass('asset master list identity and style lock');
  else fail('asset master list identity or style lock mismatch');
  if (master.totalAssets === TOTAL_ASSET_COUNT && master.assets?.length === TOTAL_ASSET_COUNT) pass(`asset master list exact total ${TOTAL_ASSET_COUNT}`);
  else fail(`asset master list total expected ${TOTAL_ASSET_COUNT}, found ${master.assets?.length ?? 0}`);

  for (const [category, expected] of Object.entries(ASSET_COUNTS)) {
    const actual = master.assets.filter((asset) => asset.category === category).length;
    if (actual === expected && master.counts?.[category] === expected) pass(`${category} asset count ${expected}`);
    else fail(`${category} asset count expected ${expected}, found ${actual}`);
  }

  const ids = new Set();
  const files = new Set();
  for (const asset of master.assets) {
    if (ids.has(asset.id)) fail(`duplicate asset id ${asset.id}`); else ids.add(asset.id);
    const fileKey = `${asset.productionFolder}/${asset.deliveryFile}`;
    if (files.has(fileKey)) fail(`duplicate delivery file ${fileKey}`); else files.add(fileKey);
    if (asset.styleLockId !== IP_STYLE_LOCK_ID) fail(`${asset.id} style lock mismatch`);
    if (!promptIds.has(asset.promptTemplateId)) fail(`${asset.id} prompt template missing: ${asset.promptTemplateId}`);
    if (!ALLOWED_DELIVERY_FORMATS.includes(asset.format)) fail(`${asset.id} forbidden format ${asset.format}`);
    if (/\.svg(?:[?#]|$)/i.test(asset.deliveryFile) || /image\/svg/i.test(JSON.stringify(asset))) fail(`${asset.id} vector asset reference forbidden`);
    if (asset.status === 'approved' || asset.artReview === 'approved' || asset.technicalReview === 'approved') fail(`${asset.id} cannot be pre-approved`);
    if (!/^P[0-3]$/.test(asset.priority)) fail(`${asset.id} invalid priority ${asset.priority}`);
  }
  if (ids.size === TOTAL_ASSET_COUNT && files.size === TOTAL_ASSET_COUNT) pass('asset IDs and delivery file paths unique');
}

const animationPath = resolve(productionRoot, '10_Animation/STARTER_ANIMATION_MATRIX_v3.8.0.json');
if (existsSync(animationPath)) {
  const animation = JSON.parse(readFileSync(animationPath, 'utf8'));
  if (animation.characters === 11 && animation.clipsPerCharacter === 11 && animation.totalClipRows === 121 && animation.rows?.length === 121) pass('starter animation matrix 11x11=121');
  else fail('starter animation matrix mismatch');
} else fail('starter animation matrix missing');

const soundPath = resolve(productionRoot, '09_Sound/SOUND_CUE_CATALOG_v3.8.0.json');
if (existsSync(soundPath)) {
  const sound = JSON.parse(readFileSync(soundPath, 'utf8'));
  if (sound.count === 96 && sound.rows?.length === 96 && sound.countedInVisualAssetTotal === false) pass('sound cue catalog 96 outside visual total');
  else fail('sound cue catalog mismatch');
} else fail('sound cue catalog missing');

for (const path of [
  '11_Unity/Assets/Art', '11_Unity/Assets/Art/Characters', '11_Unity/Assets/Art/Monsters',
  '11_Unity/Assets/Art/Boss', '11_Unity/Assets/Art/NPC', '11_Unity/Assets/Art/Pets',
  '11_Unity/Assets/UI', '11_Unity/Assets/Icons',
  '11_Unity/Assets/VFX', '11_Unity/Assets/Materials', '11_Unity/Assets/Animations',
  '11_Unity/Assets/Prefabs', '11_Unity/Assets/Maps', '11_Unity/Assets/Sounds'
]) {
  if (!existsSync(resolve(productionRoot, path))) fail(`Unity handoff path missing: ${path}`);
}
if (!failures.some((message) => message.includes('Unity handoff'))) pass('Unity Assets handoff structure');

if (failures.length) {
  console.error(`\n========== IP PRODUCTION FAILURE DIGEST (${failures.length}) ==========`);
  failures.forEach((message, index) => {
    console.error(`${index + 1}. ${message}`);
    console.error(`::error title=IP production contract::${message}`);
  });
  console.error('===============================================================');
  process.exit(1);
}
console.log(`IP production contract verified · ${TOTAL_ASSET_COUNT} planned visual assets`);
