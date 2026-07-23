import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ART_BIBLE_VERSION,
  ART_STYLE_LOCK_ID,
  ART_BIBLE_STATUS,
  ABSOLUTE_STYLE_PROMPT,
  ABSOLUTE_NEGATIVE_PROMPT,
  ABSOLUTE_GENRE_LOCK,
  SD_CHARACTER_STANDARD,
  COLOR_STANDARD,
  MATERIAL_STANDARD,
  LIGHTING_STANDARD,
  STYLIZED_PBR_RENDER_STANDARD,
  AUTHORED_VIEW_STANDARD,
  CORE_CHARACTER_ANIMATIONS,
  CATEGORY_STYLE_RULES,
  PRODUCTION_ASSET_REQUIREMENTS,
  ASSET_PRODUCTION_GATES
} from '../src/art-style-tokens.js';
import { CHARACTER_ASSET_TARGETS } from '../src/asset-specs.js';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };
const check = (condition, message) => condition ? pass(message) : fail(message);

check(ART_BIBLE_VERSION === '2.0.0', 'Absolute Art Bible version 2.0.0');
check(ART_STYLE_LOCK_ID === 'DD-ABSOLUTE-ART-BIBLE-2.0', 'absolute style lock ID');
check(ART_BIBLE_STATUS === 'absolute-locked', 'absolute lock status');
check(ABSOLUTE_GENRE_LOCK.join('|') === 'Cute Stylized Fantasy|3D Mobile Game|AAA Casual|Korean Fantasy|Stylized PBR|Hand Painted', 'genre lock 6/6');

check(SD_CHARACTER_STANDARD.targetHeadsTall === 2.3, '2.3 heads target');
check(SD_CHARACTER_STANDARD.headHeightRatio === 0.42
  && SD_CHARACTER_STANDARD.chestHeightRatio === 0.18
  && SD_CHARACTER_STANDARD.waistHeightRatio === 0.15
  && SD_CHARACTER_STANDARD.legHeightRatio === 0.25
  && SD_CHARACTER_STANDARD.headHeightRatio + SD_CHARACTER_STANDARD.chestHeightRatio + SD_CHARACTER_STANDARD.waistHeightRatio + SD_CHARACTER_STANDARD.legHeightRatio === 1,
'42/18/15/25 proportion lock');
check(SD_CHARACTER_STANDARD.allowedHeadHeightRatio[0] === 0.4 && SD_CHARACTER_STANDARD.allowedHeadHeightRatio[1] === 0.44, 'head 40-44% hard range');
check(SD_CHARACTER_STANDARD.eyeWidthToFaceRatio === 0.28
  && SD_CHARACTER_STANDARD.eyePosition === 'slightly-below-face-center'
  && SD_CHARACTER_STANDARD.eyeSizeLockedAcrossExpressions,
'face lock eye 28% and fixed expression size');
check(SD_CHARACTER_STANDARD.silhouetteRecognitionSecondsMax === 0.3
  && SD_CHARACTER_STANDARD.silhouetteSignatureElements === 3,
'0.3-second silhouette rule');
check(SD_CHARACTER_STANDARD.weaponMinCharacterHeightRatio === 0.18
  && SD_CHARACTER_STANDARD.weaponMustReadLargerThanBody,
'oversized weapon rule');
check(SD_CHARACTER_STANDARD.interchangeableEquipment.join(',') === 'Helmet,Shoulder,Weapon,Accessory,BackItem', 'five interchangeable equipment parts');

check(COLOR_STANDARD.maxMainColors === 4
  && COLOR_STANDARD.distribution.primary === 0.6
  && COLOR_STANDARD.distribution.secondary === 0.25
  && COLOR_STANDARD.distribution.accent === 0.1
  && COLOR_STANDARD.distribution.fx === 0.05
  && COLOR_STANDARD.rainbowForbidden,
'four-color 60/25/10/5 lock and rainbow ban');
check(MATERIAL_STANDARD.skin.smooth && !MATERIAL_STANDARD.skin.pores && !MATERIAL_STANDARD.skin.wrinkles && !MATERIAL_STANDARD.skin.realism, 'smooth non-realistic skin');
check(MATERIAL_STANDARD.metal.type === 'painted-metal' && MATERIAL_STANDARD.metal.goldEdge && MATERIAL_STANDARD.metal.reflection === 'soft', 'painted metal gold edge');
check(MATERIAL_STANDARD.cloth.fabricPattern === 'almost-none' && MATERIAL_STANDARD.cloth.gradient === 'simple', 'simple cloth material');
check(STYLIZED_PBR_RENDER_STANDARD.edge.rounded && STYLIZED_PBR_RENDER_STANDARD.edge.bevel && STYLIZED_PBR_RENDER_STANDARD.edge.sharp90DegreeForbidden, 'rounded beveled edge lock');
check(LIGHTING_STANDARD.order.join(',') === 'warm-key,cool-blue-rim,soft-ao,small-highlight'
  && LIGHTING_STANDARD.shadow.opacity === 0.4
  && LIGHTING_STANDARD.shadow.pureBlackForbidden,
'warm key, blue rim, soft AO, 40% non-black shadow');
check(LIGHTING_STANDARD.outline.policy === 'almost-none', 'outline almost-none rule');

check(CORE_CHARACTER_ANIMATIONS.length === 11
  && CORE_CHARACTER_ANIMATIONS.join(',') === 'idle,walk,run,attack1,attack2,skill1,skill2,hit,death,victory,spawn',
'11 required animations');
check(AUTHORED_VIEW_STANDARD.authoredAnglesDegrees.join(',') === '0,45,90,135,180' && AUTHORED_VIEW_STANDARD.mirroring, 'five authored directions plus mirroring');
check(PRODUCTION_ASSET_REQUIREMENTS.triangleRange[0] === 6000
  && PRODUCTION_ASSET_REQUIREMENTS.triangleRange[1] === 10000
  && PRODUCTION_ASSET_REQUIREMENTS.textureSizes.join(',') === '1024,2048'
  && PRODUCTION_ASSET_REQUIREMENTS.rig === 'Humanoid',
'6k-10k, 1024/2048, Humanoid production rule');
check(CHARACTER_ASSET_TARGETS.guardian.requiredAnimations.length === 11, 'runtime production target inherits 11 clips');

check(CATEGORY_STYLE_RULES.monster.cutePercent === 70 && CATEGORY_STYLE_RULES.monster.coolPercent === 30 && CATEGORY_STYLE_RULES.monster.grossPercent === 0, 'monster 70/30/0');
check(CATEGORY_STYLE_RULES.boss.playerScale === 2 && CATEGORY_STYLE_RULES.boss.weaponScale === 3 && CATEGORY_STYLE_RULES.boss.fxScale === 4, 'boss x2/x3/x4');
check(CATEGORY_STYLE_RULES.ui.hoverScale === 1.05 && CATEGORY_STYLE_RULES.ui.pressedScale === 0.95, 'UI hover 105 and pressed 95');
check(CATEGORY_STYLE_RULES.icon.perspectiveDegrees === 45 && CATEGORY_STYLE_RULES.icon.oneObject && !CATEGORY_STYLE_RULES.icon.background, 'icon 45-degree one-object no-background');
check(CATEGORY_STYLE_RULES.vfx.blurPercent === 10 && CATEGORY_STYLE_RULES.vfx.noise === 'minimal' && CATEGORY_STYLE_RULES.vfx.particles === 'round-cute', 'VFX 10% blur minimal noise round particles');
check(ASSET_PRODUCTION_GATES.map((gate) => gate.id).join(',') === 'absolute-lock,character-dna,golden-vertical-slice,technical-production,scale-out', 'absolute production gate order');

for (const token of [
  'MASTER STYLE LOCK — Dokkaebi Defense',
  'Cute Chibi Character (2.3 heads proportion)',
  'Hand-Painted Stylized PBR',
  'Warm Key Light',
  'Cool Blue Rim Light',
  'Rounded Beveled Shapes',
  'Low Poly (6000–10000 triangles)',
  'Cute 70% + Cool 30%',
  'No Dark Mood',
  'No Gore',
  'No Horror'
]) check(ABSOLUTE_STYLE_PROMPT.includes(token), `master prompt token: ${token}`);
for (const token of ['realistic skin texture', 'long legs', 'small eyes', 'pure black shadow', 'gore', 'horror mood']) check(ABSOLUTE_NEGATIVE_PROMPT.includes(token), `negative rule: ${token}`);

const requiredFiles = [
  'docs/ABSOLUTE_ART_BIBLE_v2.0.md',
  'docs/ABSOLUTE_ART_BIBLE_v2.0.sha256',
  'docs/ART_BIBLE_MACHINE_SPEC_v2.0.json',
  'docs/ART_REVIEW_CHECKLIST_v2.0.md',
  'docs/ASSET_BIBLE.md',
  'production/DokkaebiDefense/01_ArtBible/ABSOLUTE_ART_BIBLE_v2.0.md',
  'production/DokkaebiDefense/01_ArtBible/ART_BIBLE_MACHINE_SPEC_v2.0.json',
  'production/DokkaebiDefense/01_ArtBible/CHARACTER_DNA_v3.0_DRAFT.md'
];
for (const path of requiredFiles) check(existsSync(resolve(root, path)), `${path} exists`);

const biblePath = resolve(root, 'docs/ABSOLUTE_ART_BIBLE_v2.0.md');
const bible = readFileSync(biblePath, 'utf8');
for (const token of ['ABSOLUTE LOCKED', '42%', 'Chest | 18%', 'Waist | 15%', 'Leg | 25%', '얼굴 폭의 **28%**', 'Opacity: **40%**', 'Attack1', 'Spawn', '무지개 조합 금지']) check(bible.includes(token), `bible section token: ${token}`);
const expectedHash = readFileSync(resolve(root, 'docs/ABSOLUTE_ART_BIBLE_v2.0.sha256'), 'utf8').trim().split(/\s+/)[0];
const actualHash = createHash('sha256').update(bible).digest('hex');
check(expectedHash === actualHash, `art bible SHA-256 ${actualHash.slice(0, 12)}`);

const machine = JSON.parse(readFileSync(resolve(root, 'docs/ART_BIBLE_MACHINE_SPEC_v2.0.json'), 'utf8'));
check(machine.styleLockId === ART_STYLE_LOCK_ID && machine.immutable === true, 'machine spec identity and immutable flag');
check(machine.proportion.headPercent === 42 && machine.proportion.chestPercent === 18 && machine.proportion.waistPercent === 15 && machine.proportion.legPercent === 25, 'machine spec proportions');
check(machine.animations.length === 11 && machine.equipmentParts.length === 5, 'machine spec clips and equipment');

if (failures.length) process.exit(1);
console.log('Dokkaebi Defense Absolute Art Bible v2.0 verification complete');
