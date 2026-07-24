import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ART_DIRECTION, ASSET_LOD_POLICY, IMPOSTOR_SPEC, CHARACTER_ASSET_TARGETS, ENVIRONMENT_ASSET_TARGETS, EFFECT_ASSET_TARGETS } from '../src/asset-specs.js';
import { MODEL_ASSET_SLOTS, ASSET_PRODUCTION_SUMMARY, PLAYER_ASSET_ID, HERO_CLASS_ASSET_IDS, GUARDIAN_ASSET_IDS, MONSTER_ASSET_IDS, BOSS_ASSET_IDS } from '../src/engine/asset-catalog.js';
import { resolveDirectionalFrame, DirectionalImpostorSelector } from '../src/engine/directional-impostor.js';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const assert = (condition, message) => condition ? console.log(`PASS ${message}`) : failures.push(message);

assert(ART_DIRECTION.pillars.length >= 4, '아트 방향 핵심 원칙 4개 이상');
assert(IMPOSTOR_SPEC.directions === 11 && IMPOSTOR_SPEC.frameOrder.length === 11, '11방향 임포스터 규격');
assert(ASSET_LOD_POLICY.near && ASSET_LOD_POLICY.mid && ASSET_LOD_POLICY.far, '3단 LOD 정책');
assert(CHARACTER_ASSET_TARGETS.guardian.requiredAnimations.length === 11 && CHARACTER_ASSET_TARGETS.guardian.requiredAnimations.includes('attack2') && CHARACTER_ASSET_TARGETS.guardian.requiredAnimations.includes('spawn'), '모든 캐릭터 11개 필수 애니메이션 규격');
assert(CHARACTER_ASSET_TARGETS.boss.requiredAnimations.length === 11, '보스 11개 공통 필수 애니메이션 규격');
assert(ENVIRONMENT_ASSET_TARGETS.tileMeters === 8 && ENVIRONMENT_ASSET_TARGETS.primarySetCount === 8, '8m 전장 타일과 8개 환경 세트');
assert(EFFECT_ASSET_TARGETS.projectileAtlasSize === 1024 && EFFECT_ASSET_TARGETS.distortion === false, '모바일 발사체 아틀라스 정책');
assert(Object.keys(MODEL_ASSET_SLOTS.guardians).length === 6, '수호대 모델 슬롯 6종');
assert(Object.keys(MODEL_ASSET_SLOTS.heroClasses).length === 5, '대장 깨비 논리 직업 슬롯 5종');
assert(Object.keys(MODEL_ASSET_SLOTS.monsters).length === 7, '일반 요괴 모델 슬롯 7종');
assert(Object.keys(MODEL_ASSET_SLOTS.bosses).length === 3, '보스 모델 슬롯 3종');
assert(Object.keys(MODEL_ASSET_SLOTS.environment).length === 8, '환경 모델 슬롯 8종');
assert(Object.keys(MODEL_ASSET_SLOTS.effects).length === 8, '효과 슬롯 8종');
assert(ASSET_PRODUCTION_SUMMARY.characterModels === 19 && ASSET_PRODUCTION_SUMMARY.farLodDirections === 11 && ASSET_PRODUCTION_SUMMARY.integratedPrototypeAssets === 37 && ASSET_PRODUCTION_SUMMARY.productionApprovedCharacterAssets === 0, '에셋 생산 요약과 프로토타입 격리');

const frames = Array.from({ length: 11 }, (_, index) => resolveDirectionalFrame(0, index * Math.PI * 2 / 11, 11));
assert(new Set(frames).size === 11, '카메라 360도에서 11개 프레임 선택');
const selector = new DirectionalImpostorSelector({ directions: 11 });
assert(selector.update(0, 0) === 0, '임포스터 선택기 초기 프레임');

const bible = readFileSync(resolve(root, 'docs/ABSOLUTE_ART_BIBLE_v2.0.md'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(root, 'docs/ASSET_MANIFEST.json'), 'utf8'));
assert(bible.includes('ABSOLUTE LOCKED') && bible.includes('42/18/15/25') && bible.includes('MASTER STYLE LOCK PROMPT') && bible.includes('좌우 반전'), 'Absolute Art Bible v2.0 핵심 규격');
assert(manifest.impostorDirections === 11 && manifest.characters.guardians.length === 6, '에셋 납품 매니페스트');


const combatModelPaths = [
  ...[...new Set(Object.values(HERO_CLASS_ASSET_IDS))].map((id) => `public/assets/models/${id}.glb`),
  ...Object.values(GUARDIAN_ASSET_IDS).map((id) => `public/assets/models/${id}.glb`),
  ...Object.values(MONSTER_ASSET_IDS).map((id) => `public/assets/models/${id}.glb`),
  ...Object.values(BOSS_ASSET_IDS).map((id) => `public/assets/models/${id}.glb`)
];
for (const path of [
  'public/assets/textures/moon-market-ground-v1.webp',
  'public/assets/effects/moon-fx-atlas-v1.webp',
  'src/assets/moon-mascot-v1.webp',
  'src/assets/moon-mascot-expressions-v1.webp',
  'public/assets/impostors/guardian/ember-idle-11.webp',
  'public/assets/impostors/guardian/ember-move-11.webp',
  'public/assets/impostors/guardian/ember-attack-11.webp',
  'public/assets/impostors/monster/imp-idle-11.webp',
  'public/assets/impostors/monster/imp-move-11.webp',
  'public/assets/impostors/monster/imp-attack-11.webp',
  ...combatModelPaths
]) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) {
    assert(false, `런타임 프로토타입 에셋 누락 ${path}`);
    continue;
  }
  assert(readFileSync(absolute).length > 1000, `런타임 프로토타입 에셋 ${path}`);
}
assert(combatModelPaths.length === 19, '직업 런타임 GLB 3종·수호대·요괴·보스 총 19종');

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log('에셋 제작 준비 검증 완료');
