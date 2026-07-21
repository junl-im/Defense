import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ART_BIBLE_VERSION, SD_CHARACTER_STANDARD, MOBILE_TOON_RENDER_STANDARD, AUTHORED_VIEW_STANDARD, ASSET_PRODUCTION_GATES } from '../src/art-style-tokens.js';
import { IMPOSTOR_SPEC, CHARACTER_ASSET_TARGETS } from '../src/asset-specs.js';
import { resolveMirroredAuthoredView } from '../src/engine/directional-impostor.js';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };

if (ART_BIBLE_VERSION === '2.0.0') pass('아트 바이블 버전 2.0.0'); else fail('아트 바이블 버전');
if (SD_CHARACTER_STANDARD.targetHeadsTall === 2.25 && SD_CHARACTER_STANDARD.allowedHeadsTall[0] === 2 && SD_CHARACTER_STANDARD.allowedHeadsTall[1] === 2.5) pass('2~2.5등신 공용 규격'); else fail('SD 등신 규격');
if (SD_CHARACTER_STANDARD.sharedParts.length >= 10) pass('Head/Body/Weapon/Accessory 공용 파츠 분리'); else fail('공용 파츠 분리 규격');
if (MOBILE_TOON_RENDER_STANDARD.shadingBands === 4 && MOBILE_TOON_RENDER_STANDARD.rimLight.enabled && MOBILE_TOON_RENDER_STANDARD.shadow.mobileRealtime === false) pass('4단 카툰·Rim·모바일 소프트 그림자 정책'); else fail('모바일 카툰 렌더 규격');
if (AUTHORED_VIEW_STANDARD.authoredDirections === 5 && AUTHORED_VIEW_STANDARD.runtimeDirections === 11 && AUTHORED_VIEW_STANDARD.mirroring) pass('5방향 원본+미러링→11방향 정책'); else fail('방향 제작 정책');
if (IMPOSTOR_SPEC.authoredDirections === 5 && IMPOSTOR_SPEC.directions === 11) pass('에셋 사양과 방향 정책 동기화'); else fail('IMPOSTOR_SPEC 동기화');
if (ASSET_PRODUCTION_GATES.map((gate) => gate.id).join(',') === 'hero,enemy-trio,environment,ui,vfx,scale-out') pass('골든 샘플 제작 승인 게이트'); else fail('제작 승인 게이트 순서');
if (CHARACTER_ASSET_TARGETS.guardian.requiredAnimations.includes('run') && CHARACTER_ASSET_TARGETS.guardian.requiredAnimations.includes('death')) pass('주인공 7개 필수 모션'); else fail('주인공 모션 규격');

const front = resolveMirroredAuthoredView(0, 0);
const right = resolveMirroredAuthoredView(0, Math.PI / 2);
const left = resolveMirroredAuthoredView(0, Math.PI * 1.5);
if (front.authoredAngle === 0 && right.authoredAngle === 90 && left.authoredAngle === 90 && left.mirrored) pass('방향 접기와 좌우 미러링 계산'); else fail('5방향 미러링 계산');

for (const path of ['docs/ASSET_BIBLE.md', 'docs/AI_ASSET_PROMPTS.md', 'docs/BLENDER_EXPORT_GUIDE.md', 'docs/PRODUCTION_ROADMAP.md', 'docs/ASSET_MANIFEST.json']) {
  if (existsSync(resolve(root, path))) pass(`${path} 존재`); else fail(`${path} 누락`);
}
const bible = readFileSync(resolve(root, 'docs/ASSET_BIBLE.md'), 'utf8');
for (const token of ['2.25등신', '5방향 제작과 11방향 런타임', 'Blender 제작·내보내기', 'UI 디자인 가이드', 'VFX 스타일']) {
  if (bible.includes(token)) pass(`바이블 섹션 ${token}`); else fail(`바이블 섹션 누락: ${token}`);
}

if (failures.length) process.exit(1);
console.log('SD 모바일 카툰 아트 바이블 검증 완료');
