import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ART_BIBLE_VERSION, ART_STYLE_LOCK_ID, ABSOLUTE_STYLE_PROMPT, ABSOLUTE_NEGATIVE_PROMPT,
  SD_CHARACTER_STANDARD, STYLIZED_PBR_RENDER_STANDARD, AUTHORED_VIEW_STANDARD, ASSET_PRODUCTION_GATES
} from '../src/art-style-tokens.js';
import { IMPOSTOR_SPEC, CHARACTER_ASSET_TARGETS } from '../src/asset-specs.js';
import { resolveMirroredAuthoredView } from '../src/engine/directional-impostor.js';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };

if (ART_BIBLE_VERSION === '3.0.0' && ART_STYLE_LOCK_ID === 'DD-AAA-CASUAL-SD-PBR-3.0') pass('AAA 아트 바이블 잠금 ID'); else fail('아트 바이블 버전 또는 잠금 ID');
if (SD_CHARACTER_STANDARD.targetHeadsTall === 2.3 && SD_CHARACTER_STANDARD.allowedHeadsTall[0] === 2.2 && SD_CHARACTER_STANDARD.allowedHeadsTall[1] === 2.4) pass('2.3등신 공용 규격'); else fail('SD 등신 규격');
if (SD_CHARACTER_STANDARD.sharedParts.length >= 10 && SD_CHARACTER_STANDARD.topology.simpleFingers) pass('분리 파츠와 단순 손가락 규격'); else fail('공용 파츠 규격');
if (STYLIZED_PBR_RENDER_STANDARD.materialModel === 'stylized-pbr-hand-painted' && STYLIZED_PBR_RENDER_STANDARD.softAmbientOcclusion && STYLIZED_PBR_RENDER_STANDARD.rimLight.type === 'subtle') pass('손그림 Stylized PBR·Soft AO·Subtle Rim'); else fail('렌더 규격');
if (!STYLIZED_PBR_RENDER_STANDARD.photorealism && !STYLIZED_PBR_RENDER_STANDARD.realisticSkin) pass('실사·현실 피부 금지'); else fail('실사 금지 규격');
if (AUTHORED_VIEW_STANDARD.authoredDirections === 5 && AUTHORED_VIEW_STANDARD.runtimeDirections === 11 && AUTHORED_VIEW_STANDARD.mirroring) pass('5방향+미러링→11방향 정책'); else fail('방향 제작 정책');
if (IMPOSTOR_SPEC.authoredDirections === 5 && IMPOSTOR_SPEC.directions === 11) pass('방향 사양 동기화'); else fail('IMPOSTOR_SPEC 동기화');
if (ASSET_PRODUCTION_GATES.map((gate) => gate.id).join(',') === 'style-lock,hero,enemy-trio,environment,ui,vfx,scale-out') pass('스타일 잠금 우선 승인 게이트'); else fail('제작 승인 게이트 순서');
if (CHARACTER_ASSET_TARGETS.guardian.productionTriangles[0] === 6000 && CHARACTER_ASSET_TARGETS.guardian.productionTriangles[1] === 10000) pass('일반 캐릭터 6k~10k 제작 예산'); else fail('제작 폴리곤 예산');

for (const token of ['AAA Mobile Game Asset', 'Chibi 2.3 Heads Proportion', 'High Quality Hand Painted Texture', 'Soft Ambient Occlusion', 'PBR Stylized', 'No Photorealism', 'Character Turnaround', 'White Background']) {
  if (ABSOLUTE_STYLE_PROMPT.includes(token)) pass(`절대 프롬프트: ${token}`); else fail(`절대 프롬프트 누락: ${token}`);
}
for (const token of ['photorealistic', 'anime illustration', 'inconsistent proportions']) {
  if (ABSOLUTE_NEGATIVE_PROMPT.includes(token)) pass(`네거티브 잠금: ${token}`); else fail(`네거티브 누락: ${token}`);
}

const front = resolveMirroredAuthoredView(0, 0);
const right = resolveMirroredAuthoredView(0, Math.PI / 2);
const left = resolveMirroredAuthoredView(0, Math.PI * 1.5);
if (front.authoredAngle === 0 && right.authoredAngle === 90 && left.authoredAngle === 90 && left.mirrored) pass('방향 접기와 좌우 미러링 계산'); else fail('5방향 미러링 계산');

for (const path of ['docs/ASSET_BIBLE.md', 'docs/AI_ASSET_PROMPTS.md', 'docs/AAA_ASSET_PROMPT_CATALOG.json', 'docs/CURRENT_ASSET_AUDIT.json', 'docs/BLENDER_EXPORT_GUIDE.md', 'docs/PRODUCTION_ROADMAP.md', 'docs/ASSET_MANIFEST.json']) {
  if (existsSync(resolve(root, path))) pass(`${path} 존재`); else fail(`${path} 누락`);
}
const bible = readFileSync(resolve(root, 'docs/ASSET_BIBLE.md'), 'utf8');
for (const token of ['절대 스타일 프롬프트', '2.3등신', '스타일라이즈드 PBR', '5방향 원본 + 미러링', '승인 체크리스트', '현재 에셋 격리']) {
  if (bible.includes(token)) pass(`바이블 섹션 ${token}`); else fail(`바이블 섹션 누락: ${token}`);
}

if (failures.length) process.exit(1);
console.log('AAA 캐주얼 SD 3D 아트 바이블 검증 완료');
