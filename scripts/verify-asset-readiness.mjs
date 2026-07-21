import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ART_DIRECTION, ASSET_LOD_POLICY, IMPOSTOR_SPEC, CHARACTER_ASSET_TARGETS, ENVIRONMENT_ASSET_TARGETS, EFFECT_ASSET_TARGETS } from '../src/asset-specs.js';
import { MODEL_ASSET_SLOTS, ASSET_PRODUCTION_SUMMARY } from '../src/engine/asset-catalog.js';
import { resolveDirectionalFrame, DirectionalImpostorSelector } from '../src/engine/directional-impostor.js';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const assert = (condition, message) => condition ? console.log(`PASS ${message}`) : failures.push(message);

assert(ART_DIRECTION.pillars.length >= 4, '아트 방향 핵심 원칙 4개 이상');
assert(IMPOSTOR_SPEC.directions === 11 && IMPOSTOR_SPEC.frameOrder.length === 11, '11방향 임포스터 규격');
assert(ASSET_LOD_POLICY.near && ASSET_LOD_POLICY.mid && ASSET_LOD_POLICY.far, '3단 LOD 정책');
assert(CHARACTER_ASSET_TARGETS.guardian.requiredAnimations.includes('summon'), '수호대 소환 애니메이션 규격');
assert(CHARACTER_ASSET_TARGETS.boss.requiredAnimations.includes('phase'), '보스 페이즈 애니메이션 규격');
assert(ENVIRONMENT_ASSET_TARGETS.tileMeters === 8 && ENVIRONMENT_ASSET_TARGETS.primarySetCount === 8, '8m 전장 타일과 8개 환경 세트');
assert(EFFECT_ASSET_TARGETS.projectileAtlasSize === 1024 && EFFECT_ASSET_TARGETS.distortion === false, '모바일 발사체 아틀라스 정책');
assert(Object.keys(MODEL_ASSET_SLOTS.guardians).length === 6, '수호대 모델 슬롯 6종');
assert(Object.keys(MODEL_ASSET_SLOTS.monsters).length === 4, '일반 요괴 모델 슬롯 4종');
assert(Object.keys(MODEL_ASSET_SLOTS.bosses).length === 3, '보스 모델 슬롯 3종');
assert(Object.keys(MODEL_ASSET_SLOTS.environment).length === 8, '환경 모델 슬롯 8종');
assert(Object.keys(MODEL_ASSET_SLOTS.effects).length === 8, '효과 슬롯 8종');
assert(ASSET_PRODUCTION_SUMMARY.characterModels === 14 && ASSET_PRODUCTION_SUMMARY.farLodDirections === 11 && ASSET_PRODUCTION_SUMMARY.integratedPrototypeAssets === 12, '에셋 생산 요약과 통합 에셋 12종');

const frames = Array.from({ length: 11 }, (_, index) => resolveDirectionalFrame(0, index * Math.PI * 2 / 11, 11));
assert(new Set(frames).size === 11, '카메라 360도에서 11개 프레임 선택');
const selector = new DirectionalImpostorSelector({ directions: 11 });
assert(selector.update(0, 0) === 0, '임포스터 선택기 초기 프레임');

const bible = readFileSync(resolve(root, 'docs/ASSET_BIBLE.md'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(root, 'docs/ASSET_MANIFEST.json'), 'utf8'));
assert(bible.includes('11방향') && bible.includes('조선풍 야시장') && bible.includes('KTX2'), '에셋 아트 바이블 핵심 규격');
assert(manifest.impostorDirections === 11 && manifest.characters.guardians.length === 6, '에셋 납품 매니페스트');


for (const path of ['public/assets/textures/moon-market-ground-v1.webp', 'public/assets/effects/moon-fx-atlas-v1.webp', 'src/assets/moon-mascot-v1.webp', 'src/assets/moon-mascot-expressions-v1.webp', 'public/assets/impostors/guardian/ember-idle-11.webp', 'public/assets/impostors/guardian/ember-move-11.webp', 'public/assets/impostors/guardian/ember-attack-11.webp', 'public/assets/impostors/monster/imp-idle-11.webp', 'public/assets/impostors/monster/imp-move-11.webp', 'public/assets/impostors/monster/imp-attack-11.webp', 'public/assets/models/guardian-ember-nextgen.glb', 'public/assets/models/monster-imp-nextgen.glb', 'public/assets/models/boss-tiger-nextgen.glb']) {
  assert(readFileSync(resolve(root, path)).length > 1000, `Moon Forge 실제 에셋 ${path}`);
}

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log('에셋 제작 준비 검증 완료');
