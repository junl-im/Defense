import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { CORE_ASSET_CATALOG, HERO_CLASS_ASSET_IDS, GUARDIAN_ASSET_IDS, MONSTER_ASSET_IDS, BOSS_ASSET_IDS } from '../src/engine/asset-catalog.js';
import { CURRENT_ASSET_APPROVAL } from '../src/engine/asset-quality.js';

const root = resolve(import.meta.dirname, '..');
const audit = JSON.parse(readFileSync(resolve(root, 'docs/CURRENT_ASSET_AUDIT.json'), 'utf8'));
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };
const commonBipedNodes = ['body','head','armL','armR','legL','legR','weapon','signature'];
const rigNodes = ['Armature','Hips','Spine','Head','Arm_L','Arm_R','Leg_L','Leg_R','WeaponSocket','AccessorySocket'];
const specs = [
  ...[...new Set(Object.values(HERO_CLASS_ASSET_IDS))].map((id)=>({id,path:`public/assets/models/${id}.glb`,maxTriangles:10000,nodes:rigNodes})),
  ...Object.values(GUARDIAN_ASSET_IDS).map((id)=>({id,path:`public/assets/models/${id}.glb`,maxTriangles:5600,nodes:commonBipedNodes})),
  ...Object.entries(MONSTER_ASSET_IDS).map(([type,id])=>({
    id,
    path:`public/assets/models/${id}.glb`,
    maxTriangles: ['brute','shaman','ghost','skeleton','crow'].includes(type) ? 9000 : 3200,
    nodes: ['brute','shaman','ghost','skeleton','crow'].includes(type) ? rigNodes : commonBipedNodes
  })),
  { id:BOSS_ASSET_IDS.tiger,path:'public/assets/models/boss-tiger-sd-toon.glb',maxTriangles:9000,nodes:['body','head','frontLeg0','frontLeg1','weapon','signature','halo'] },
  { id:BOSS_ASSET_IDS.serpent,path:'public/assets/models/boss-serpent-sd-toon.glb',maxTriangles:9000,nodes:['body','head','armL','armR','weapon','signature','halo'] },
  { id:BOSS_ASSET_IDS.king,path:'public/assets/models/boss-king-sd-toon.glb',maxTriangles:9000,nodes:[...commonBipedNodes,'halo'] }
];
for (const spec of specs) {
  const file = resolve(root,spec.path);
  if (statSync(file).size < 10000) { fail(`${spec.path} 파일 크기 부족`); continue; }
  const entry = audit.entries.find((item)=>item.id===spec.id);
  if (!entry) { fail(`${spec.id} 감사 항목 누락`); continue; }
  const missing = spec.nodes.filter((name)=>!entry.metrics.nodeNames.includes(name));
  if (missing.length) fail(`${spec.id} 노드 누락: ${missing.join(', ')}`); else pass(`${spec.id} 공용 파츠 ${spec.nodes.length}개`);
  if (entry.metrics.triangles > spec.maxTriangles) fail(`${spec.id} ${entry.metrics.triangles}/${spec.maxTriangles} triangles`); else pass(`${spec.id} ${entry.metrics.triangles}/${spec.maxTriangles} triangles`);
}
const main=readFileSync(resolve(root,'src/main.js'),'utf8');
const premium=readFileSync(resolve(root,'src/premium-assets.js'),'utf8');
const pipeline=readFileSync(resolve(root,'src/engine/asset-pipeline.js'),'utf8');
const html=readFileSync(resolve(root,'index.html'),'utf8');
const diagnostics=readFileSync(resolve(root,'src/asset-diagnostics.js'),'utf8');
const mobileEngine=readFileSync(resolve(root,'src/engine/mobile-engine.js'),'utf8');
const catalogModelIds = new Set(CORE_ASSET_CATALOG.filter((entry) => entry.kind === 'model').map((entry) => entry.id));
if (specs.length===19 && catalogModelIds.size===19 && specs.every(({id})=>catalogModelIds.has(id))) pass('전투 캐릭터 GLB 19종 카탈로그 등록'); else fail('전투 캐릭터 GLB 19종 카탈로그 누락');
if (main.includes('GUARDIAN_ASSET_IDS[type]')&&main.includes('MONSTER_ASSET_IDS[type]')&&main.includes('BOSS_ASSET_IDS[type]')&&main.includes('PLAYER_ASSET_ID')) pass('전체 전투 모델 연결'); else fail('전체 전투 모델 연결 누락');
if (main.includes('renderAssetDiagnostics()')&&diagnostics.includes('approval?.productionReady')&&diagnostics.includes("approval?.status === 'art-review'")&&html.includes('asset-diagnostics-list')) pass('로드/기술 리뷰/AAA 승인 분리 진단 UI'); else fail('에셋 품질 진단 UI 누락');
if (pipeline.includes('sharedAssetGeometry')&&pipeline.includes('assetApproval')&&pipeline.includes('getModelStatuses')) pass('GLB 공유 geometry 수명과 승인 상태 추적'); else fail('GLB 수명 또는 승인 상태 추적 누락');
if (premium.includes('preserveAuthoredStylizedPbrMaterial')&&premium.includes('prototype-toon-fallback')) pass('승인 PBR 보존·프로토타입 Toon 폴백 분리'); else fail('PBR/프로토타입 렌더 분리 누락');
if (premium.includes('uMoonRimColor')&&mobileEngine.includes('NeutralToneMapping')&&mobileEngine.includes('PCFSoftShadowMap')) pass('Subtle Rim·중립 톤매핑·소프트 섀도'); else fail('공통 Rim·톤매핑·섀도 설정 누락');
const reviewIds = new Set([...Object.values(HERO_CLASS_ASSET_IDS), MONSTER_ASSET_IDS.brute, MONSTER_ASSET_IDS.shaman, MONSTER_ASSET_IDS.ghost, MONSTER_ASSET_IDS.skeleton, MONSTER_ASSET_IDS.crow]);
if (specs.every(({id})=>CURRENT_ASSET_APPROVAL[id]?.status === (reviewIds.has(id) ? 'art-review' : 'prototype-placeholder'))) pass('기술 리뷰 8종·프로토타입 11종 격리'); else fail('현재 전투 GLB 승인 상태 오표기');
if (failures.length) process.exit(1);
console.log(`전투 GLB ${specs.length}종 구조·승인 상태 검증 완료`);
