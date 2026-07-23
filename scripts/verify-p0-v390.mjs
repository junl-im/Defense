import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { HERO_CLASS_ASSET_IDS, HERO_CLASS_ORDER } from '../src/hero-classes.js';
import { MONSTER_ASSET_IDS } from '../src/engine/asset-catalog.js';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => {
  failures.push(message);
  console.error(`FAIL ${message}`);
  console.error(`::error title=v3.9 P0 contract::${message}`);
};
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const readGlbJson = (relativePath) => {
  const absolute = resolve(root, relativePath);
  if (!existsSync(absolute)) {
    fail(`${relativePath} 누락`);
    return null;
  }
  const data = readFileSync(absolute);
  if (data.length < 20 || data.toString('ascii', 0, 4) !== 'glTF' || data.readUInt32LE(4) !== 2) {
    fail(`${relativePath} GLB2 헤더 오류`);
    return null;
  }
  if (data.readUInt32LE(8) !== data.length) {
    fail(`${relativePath} GLB 선언 길이 불일치`);
    return null;
  }
  const jsonLength = data.readUInt32LE(12);
  const jsonType = data.readUInt32LE(16);
  if (jsonType !== 0x4E4F534A || 20 + jsonLength > data.length) {
    fail(`${relativePath} JSON 청크 오류`);
    return null;
  }
  return JSON.parse(data.subarray(20, 20 + jsonLength).toString('utf8').replace(/\u0000+$/g, '').trim());
};

const candidateModels = [
  ['player-dokkaebi-archer-candidate-v1', 'archer'],
  ['player-dokkaebi-mage-candidate-v1', 'mage'],
  ['monster-ghost-candidate-v1', 'ghost'],
  ['monster-skeleton-candidate-v1', 'skeleton'],
  ['monster-crow-candidate-v1', 'crow']
];
const requiredClips = ['Idle', 'Walk', 'Run', 'Attack1', 'Attack2', 'Skill1', 'Skill2', 'Hit', 'Death', 'Victory', 'Spawn'];
for (const [id, archetype] of candidateModels) {
  const path = `public/assets/models/${id}.glb`;
  if (existsSync(resolve(root, path)) && statSync(resolve(root, path)).size < 100000) {
    fail(`${path} 후보 GLB 크기 부족`);
    continue;
  }
  const gltf = readGlbJson(path);
  if (!gltf) continue;
  const clips = new Set((gltf.animations || []).map((item) => item.name));
  const missingClips = requiredClips.filter((clip) => !clips.has(clip));
  const nodeNames = new Set((gltf.nodes || []).map((node) => node.name));
  const missingSockets = ['HelmetSocket', 'ShoulderSocket', 'WeaponSocket', 'AccessorySocket', 'BackSocket', 'FXSocket'].filter((name) => !nodeNames.has(name));
  const extras = gltf.asset?.extras || {};
  if (!(gltf.skins?.length >= 1)) fail(`${id} Skin 누락`);
  if (missingClips.length) fail(`${id} 필수 클립 누락: ${missingClips.join(', ')}`);
  if (missingSockets.length) fail(`${id} 소켓 누락: ${missingSockets.join(', ')}`);
  if (extras.approvalStage !== 'art-review' || extras.technicalReady !== true) fail(`${id} art-review 기술 후보 메타데이터 누락`);
  if (extras.archetype !== archetype) fail(`${id} archetype 불일치: ${extras.archetype ?? '없음'}`);
  if (extras.rigVersion !== 'DOKKAEBI-HUMANOID-RIG-1') fail(`${id} 공용 리그 버전 불일치`);
  if (!missingClips.length && !missingSockets.length && gltf.skins?.length >= 1) pass(`${id} 공용 Skin·11클립·6소켓 후보`);
}

const rasterIcons = [
  'class-warrior.png', 'class-archer.png', 'class-mage.png',
  'enemy-ghost.png', 'enemy-skeleton.png', 'enemy-crow.png',
  'boss-strike.png', 'boss-summon.png', 'boss-control.png'
];
for (const name of rasterIcons) {
  const path = `public/assets/ui/v390/${name}`;
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) {
    fail(`${path} 누락`);
    continue;
  }
  const data = readFileSync(absolute);
  const isPng = data.length >= 24 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (!isPng) {
    fail(`${path} PNG 헤더 오류`);
    continue;
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width !== 256 || height !== 256) fail(`${path} 해상도 ${width}x${height}, 기대 256x256`);
  else pass(`${path} 래스터 PNG 256x256`);
}

const uniqueHeroAssets = new Set(Object.values(HERO_CLASS_ASSET_IDS));
if (HERO_CLASS_ORDER.length === 5 && Object.keys(HERO_CLASS_ASSET_IDS).length === 5 && uniqueHeroAssets.size === 3) pass('플레이어 논리 직업 5종·검증 런타임 GLB 3종 계약');
else fail(`플레이어 직업 계약 오류: order ${HERO_CLASS_ORDER.length}, logical assets ${Object.keys(HERO_CLASS_ASSET_IDS).length}, unique runtime ${uniqueHeroAssets.size}`);

const monsterTypes = Object.keys(MONSTER_ASSET_IDS);
if (monsterTypes.length === 7 && ['ghost', 'skeleton', 'crow'].every((type) => monsterTypes.includes(type))) pass('일반 요괴 모델 슬롯 7종');
else fail(`일반 요괴 슬롯 오류: ${monsterTypes.join(', ')}`);

const html = read('index.html');
const main = read('src/main.js');
const css = read('src/style.css');
const heroVisual = read('src/hero-visual-loadout.js');
const bossContract = read('src/boss-hud-contract.js');
const enemyVisual = read('src/enemy-candidate-visuals.js');

for (const id of ['hero-class-options', 'hero-class-summary', 'relic-loadout', 'boss-intent-icon', 'boss-intent-type', 'boss-intent-progress', 'skill-label']) {
  if (!html.includes(`id="${id}"`)) fail(`v3.9 UI ID 누락: ${id}`);
}
if (html.includes('.svg') || html.includes('image/svg+xml') || html.includes('<svg')) fail('v3.9 HTML에 SVG 참조 존재');
else pass('v3.9 UI는 PNG 전용');

if (main.includes('renderHeroClassSelector()') && main.includes('applyHeroClassRunModifiers()') && main.includes('refreshHeroVisualLoadout()')) pass('직업 선택과 전투 능력 연결');
else fail('직업 선택 런타임 연결 누락');
if (main.includes("classConfig.id === 'archer'") && main.includes("classConfig.id === 'mage'") && main.includes("classConfig.id === 'taoist'") && main.includes("classConfig.id === 'shaman'") && main.includes('damageSource')) pass('궁수·법사·도사·무당 직업별 전투 분기');
else fail('직업별 공격 분기 누락');
if (heroVisual.includes('applyRelicVisuals') && heroVisual.includes('WeaponSocket') && heroVisual.includes('AccessorySocket')) pass('유물 무기·관·후광 소켓 장착');
else fail('유물 외형 소켓 연결 누락');
if (enemyVisual.includes('ghost') && enemyVisual.includes('skeleton') && enemyVisual.includes('crow')) pass('신규 적 3종 런타임 실루엣 키트');
else fail('신규 적 실루엣 키트 누락');
if (main.includes('getBossHudState') && bossContract.includes('boss-strike.png') && bossContract.includes('boss-summon.png') && bossContract.includes('boss-control.png')) pass('보스 의도 PNG HUD 계약');
else fail('보스 HUD 계약 누락');
if (css.includes('.hero-class-options') && css.includes('.boss-intent-track') && css.includes('.relic-loadout')) pass('v3.9 반응형 UI 스타일');
else fail('v3.9 UI 스타일 누락');

if (failures.length) {
  console.error(`\n========== v3.9 P0 FAILURE DIGEST (${failures.length}) ==========`);
  failures.forEach((message, index) => console.error(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log('v3.9.0 P0 직업·적·유물 외형·보스 HUD 계약 검증 완료');
