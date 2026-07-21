import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { countObjectTriangles } from '../src/engine/geometry-budget.js';

const root = resolve(import.meta.dirname, '..');
const loader = new GLTFLoader();
const failures = [];
const specs = [
  {
    path: 'public/assets/models/guardian-ember-sd-toon.glb',
    maxTriangles: 5600,
    nodes: ['body', 'head', 'armL', 'armR', 'legL', 'legR', 'weapon', 'signature', 'halo'],
    headRatio: [.34, .58]
  },
  {
    path: 'public/assets/models/monster-imp-sd-toon.glb',
    maxTriangles: 3200,
    nodes: ['body', 'head', 'armL', 'armR', 'legL', 'legR', 'weapon', 'signature'],
    headRatio: [.34, .62]
  },
  {
    path: 'public/assets/models/boss-tiger-sd-toon.glb',
    maxTriangles: 9000,
    nodes: ['body', 'head', 'frontLeg0', 'frontLeg1', 'weapon', 'signature', 'halo'],
    headRatio: [.28, .58]
  }
];

function pass(message) { console.log(`PASS ${message}`); }
function fail(message) { failures.push(message); console.error(`FAIL ${message}`); }

for (const spec of specs) {
  const file = resolve(root, spec.path);
  if (statSync(file).size < 10_000) { fail(`${spec.path} 파일 크기 부족`); continue; }
  const buffer = readFileSync(file);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const gltf = await new Promise((resolveLoad, rejectLoad) => loader.parse(arrayBuffer, '', resolveLoad, rejectLoad));
  gltf.scene.updateMatrixWorld(true);
  const names = new Set();
  gltf.scene.traverse((node) => { if (node.name) names.add(node.name); });
  const missing = spec.nodes.filter((name) => !names.has(name));
  if (missing.length) fail(`${spec.path} 노드 누락: ${missing.join(', ')}`);
  else pass(`${spec.path} 공용 파츠 노드 ${spec.nodes.length}개`);

  const triangles = countObjectTriangles(gltf.scene);
  if (triangles > spec.maxTriangles) fail(`${spec.path} ${triangles}/${spec.maxTriangles} triangles`);
  else pass(`${spec.path} ${triangles}/${spec.maxTriangles} triangles`);

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = box.getSize(new THREE.Vector3());
  if (size.y <= 1 || size.y > 6 || size.x <= .5) fail(`${spec.path} 비정상 bounds ${size.toArray().map((v) => v.toFixed(2)).join('x')}`);
  else pass(`${spec.path} bounds ${size.toArray().map((v) => v.toFixed(2)).join('x')}`);

  const head = gltf.scene.getObjectByName('head');
  if (!head) continue;
  const headSize = new THREE.Box3().setFromObject(head).getSize(new THREE.Vector3());
  const ratio = headSize.y / Math.max(.001, size.y);
  if (ratio < spec.headRatio[0] || ratio > spec.headRatio[1]) fail(`${spec.path} SD 머리 비율 ${(ratio * 100).toFixed(1)}%`);
  else pass(`${spec.path} SD 머리 비율 ${(ratio * 100).toFixed(1)}%`);
}

const main = readFileSync(resolve(root, 'src/main.js'), 'utf8');
const premium = readFileSync(resolve(root, 'src/premium-assets.js'), 'utf8');
const catalog = readFileSync(resolve(root, 'src/engine/asset-catalog.js'), 'utf8');
const mobileEngine = readFileSync(resolve(root, 'src/engine/mobile-engine.js'), 'utf8');
for (const token of ['guardian-ember-sd-toon', 'monster-imp-sd-toon', 'boss-tiger-sd-toon']) {
  if (main.includes(token) && catalog.includes(token)) pass(`${token} 로딩·런타임 연결`);
  else fail(`${token} 연결 누락`);
}
if (premium.includes('prepareImportedGuardian') && premium.includes('prepareImportedEnemy') && premium.includes('MeshToonMaterial') && premium.includes('TOON_GRADIENT')) pass('GLB 파츠 애니메이션·4단 Toon 재질');
else fail('SD Toon GLB 스타일 처리 누락');
if (premium.includes('uMoonRimColor') && mobileEngine.includes('NeutralToneMapping') && mobileEngine.includes('PCFSoftShadowMap')) pass('월광 Rim·중립 톤매핑·소프트 섀도');
else fail('SD Toon 렌더링 설정 누락');
if (main.includes('createNextGenEnvironmentPass') && main.includes('fxRing') && main.includes('fxTrail')) pass('기존 환경·발사체 계층 유지');
else fail('환경 또는 발사체 계층 누락');

if (failures.length) process.exit(1);
console.log('SD Toon 대표 에셋 검증 완료');
