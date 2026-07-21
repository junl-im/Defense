import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };

const html = read('index.html');
const main = read('src/main.js');
const data = read('src/game-data.js');
const style = read('src/style.css');
const sw = read('public/sw.js');
const vite = read('vite.config.js');
const pkg = JSON.parse(read('package.json'));
const manifest = JSON.parse(read('public/manifest.webmanifest'));

const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const queriedIds = [...main.matchAll(/\$\('#([^']+)'\)/g)].map((match) => match[1]);
const missingIds = [...new Set(queriedIds.filter((id) => !htmlIds.has(id)))];
if (missingIds.length) fail(`index.html에 없는 DOM ID: ${missingIds.join(', ')}`);
else pass(`${queriedIds.length}개 DOM ID 연결`);

if (pkg.version === '1.7.6') pass('package version 1.7.6');
else fail(`package version 불일치: ${pkg.version}`);

for (const path of ['.env.production', '.firebaserc', '.github/workflows/deploy.yml', 'README.md', 'PROJECT_HANDOFF.md']) {
  if (existsSync(resolve(root, path))) pass(`${path} 존재`);
  else fail(`${path} 누락`);
}

const rootMarkdown = readdirSync(root).filter((name) => name.toLowerCase().endsWith('.md')).sort();
const allowedMarkdown = ['PROJECT_HANDOFF.md', 'README.md'];
if (JSON.stringify(rootMarkdown) === JSON.stringify(allowedMarkdown)) pass('루트 문서 2개로 정리');
else fail(`루트 Markdown 정리 필요: ${rootMarkdown.join(', ')}`);

if (manifest.start_url === './') pass('PWA 상대 경로 start_url');
else fail(`PWA start_url 확인 필요: ${manifest.start_url}`);

if (main.includes("const GAME_VERSION = '1.7.6'")) pass('런타임 version 1.7.6');
else fail('런타임 version 불일치');

for (const feature of ['offerContract', 'resolveActiveContract', 'checkBossPhase', 'kingNightMarch', 'bossPounce']) {
  if (main.includes(feature)) pass(`기존 전투 기능 ${feature}`);
  else fail(`기존 전투 기능 누락: ${feature}`);
}

const modsInit = main.indexOf('this.mods = this.createDefaultMods();');
const titleWorldInit = main.indexOf('this.createWorld(true);');
if (modsInit >= 0 && titleWorldInit >= 0 && modsInit < titleWorldInit) pass('제목 화면 전투 보정값 선행 초기화');
else fail('제목 화면 생성 전에 this.mods 초기화 필요');

if (main.includes('createDefaultMods(metaTraits = {})') && main.includes('(this.mods?.unitCooldown ?? 1)')) pass('unitCooldown 부팅 오류 방어');
else fail('unitCooldown 부팅 오류 방어 코드 누락');

for (const feature of ['loadMetaProgress', 'upgradeMetaTrait', 'awardRunShards', 'getDangerCandidate', 'updateDangerHint', 'useUnitCommand', 'updateCommandChipStates', 'renderRunPreview']) {
  if (main.includes(feature)) pass(`v1.6 기능 ${feature}`);
  else fail(`v1.6 기능 누락: ${feature}`);
}

if (data.includes('const CONTRACTS =')) pass('위험 계약 데이터');
else fail('위험 계약 데이터 누락');

if (style.includes('.boss-intent') && style.includes('.contract-options') && style.includes('.boot-error')) pass('기존 HUD 스타일');
else fail('기존 HUD 스타일 누락');

if (style.includes('.danger-hint') && style.includes('.meta-trait-list') && style.includes('.result-shards') && style.includes('.command-active') && style.includes('.run-preview')) pass('v1.6 가독성·명령·성장 스타일');
else fail('v1.6 가독성·명령·성장 스타일 누락');

for (const id of ['danger-hint', 'meta-modal', 'meta-trait-list', 'result-shards', 'result-growth-btn', 'run-preview', 'unit-strip']) {
  if (htmlIds.has(id)) pass(`v1.6 UI ${id}`);
  else fail(`v1.6 UI 누락: ${id}`);
}


if (main.includes('id: ++this.enemySerial') && main.includes('id:++this.hazardSerial') && main.includes('pendingDangerTimer = .14')) pass('안정적인 위험 대상 ID와 전환 지연');
else fail('위험 안내 안정화 코드 누락');

if (main.includes('unit.commandTimer = 7') && main.includes('commandCooldown = 18') && main.includes('commandDamage = unit.commandTimer > 0 ? 1.55 : 1')) pass('집중 명령 7초/18초 밸런스');
else fail('집중 명령 밸런스 코드 누락');

if (html.includes('__DOKKAEBI_SHOW_BOOT_ERROR__') && html.includes('boot-error')) pass('로딩 실패 복구 UI');
else fail('로딩 실패 복구 UI 누락');

if (!main.includes('serviceWorker.register')) pass('게임 번들에서 구형 서비스워커 등록 제거');
else fail('구형 서비스워커 등록 코드가 남아 있음');

if (sw.includes('registration.unregister') && sw.includes('caches.delete')) pass('서비스워커 캐시 해제 스크립트');
else fail('서비스워커 캐시 해제 스크립트 누락');

if (vite.includes("entryFileNames: 'assets/game.js'") && vite.includes("assets/game.css")) pass('안정적인 게임 번들 파일명');
else fail('안정적인 번들 파일명 설정 누락');

for (const legacy of [
  'public/assets/index-B0uLkGTa.js', 'public/assets/index-C2b85yCi.css',
  'public/assets/index-C4HEqwCr.js', 'public/assets/index-yN890ryg.css',
  'public/assets/index-DCYMisxj.js', 'public/assets/index-BpfmRvmR.css'
]) {
  if (existsSync(resolve(root, legacy))) pass(`구버전 캐시 구조 호환 ${legacy}`);
  else fail(`구버전 호환 파일 누락: ${legacy}`);
}

for (const path of ['src/game-data.js', 'src/sound-engine.js']) {
  if (existsSync(resolve(root, path))) pass(`모듈 분리 ${path}`);
  else fail(`모듈 누락: ${path}`);
}

if (existsSync(resolve(root, 'node_modules'))) console.log('INFO node_modules는 로컬 검증용이며 ZIP 생성 시 제외해야 합니다.');


for (const feature of ['setMoveTargetFromScreen', 'resolveNavigationPoint', 'getNavigationDirection', 'showMoveTargetMarker', 'resetMovementInput', 'normalizeInputCode', 'createRunStats', 'getUnitCommandDescription']) {
  if (main.includes(feature)) pass(`v1.7 입력·분석 기능 ${feature}`);
  else fail(`v1.7 기능 누락: ${feature}`);
}
if (main.includes("this.camera.getWorldDirection(tempV2).setY(0)") && main.includes("this.cancelMoveTarget(false)")) pass('카메라 기준 WASD와 수동 입력 우선 처리');
else fail('WASD 방향 또는 터치 목적지 취소 처리 누락');
if (main.includes('intersectPlane(groundPlane, rawPoint)') && main.includes('this.runStats.moveOrders += 1')) pass('화면 좌표의 지형 좌표 변환과 이동 명령 기록');
else fail('정밀 지형 터치 이동 누락');
if (!htmlIds.has('move-readout') && htmlIds.has('result-analysis')) pass('터치 이동 문구 제거 및 결과 분석 UI 유지');
else fail('터치 이동 문구 제거 또는 결과 분석 UI 확인 필요');
if (!style.includes('.move-readout') && style.includes('.look-zone { left: 0;')) pass('조용한 지형 입력 영역 스타일');
else fail('v1.7 입력 스타일 또는 이동 문구 CSS 확인 필요');



for (const path of [
  'src/engine/index.js', 'src/engine/engine-config.js', 'src/engine/mobile-engine.js',
  'src/engine/performance-monitor.js', 'src/engine/object-pool.js', 'src/engine/geometry-budget.js',
  'src/engine/instance-batch.js', 'src/engine/blob-shadow-system.js',
  'src/engine/texture-atlas.js', 'src/engine/world-chunk-manager.js', 'src/engine/render-stats-hud.js', 'src/engine/asset-pipeline.js'
]) {
  if (existsSync(resolve(root, path))) pass(`엔진 모듈 ${path}`);
  else fail(`엔진 모듈 누락: ${path}`);
}
const engineConfig = read('src/engine/engine-config.js');
if (engineConfig.includes("ENGINE_VERSION = '1.0.5'") && engineConfig.includes('unitTriangles: 300') && engineConfig.includes('enemyTriangles: 500')) pass('엔진 버전과 폴리곤 예산');
else fail('엔진 버전 또는 폴리곤 예산 누락');
if (main.includes('new MobileGameEngine()') && main.includes('new BlobShadowSystem') && main.includes('createRockField(28)') && main.includes('createLanternField(16)')) pass('모바일 엔진 실제 연결');
else fail('모바일 엔진 연결 누락');
if (main.includes('new InstanceBatch') && main.includes('StaticRocks:') && main.includes("name: 'LanternPosts'")) pass('InstancedMesh 정적 배치');
else fail('InstancedMesh 정적 배치 누락');
if (main.includes("this.moonLight.castShadow = this.renderer.shadowMap.enabled") && engineConfig.includes('shadowsMobile: false')) pass('모바일 실시간 그림자 비활성화');
else fail('모바일 그림자 설정 누락');

if (main.includes('initReusablePools()') && main.includes('this.projectilePools') && main.includes('this.coinPool') && main.includes('releaseCoin(')) pass('투사체·엽전 ObjectPool 실제 연결');
else fail('투사체·엽전 풀링 누락');
if (main.includes("name: 'UnitPadBases'") && main.includes("name: 'UnitPadRunes'") && main.includes('setUnitPadVisual(')) pass('UnitPad InstancedMesh 배치');
else fail('UnitPad 인스턴싱 누락');
if (main.includes('new RenderStatsHUD') && main.includes("code === 'F3'") && style.includes('.render-stats-hud')) pass('렌더 통계 개발 HUD');
else fail('렌더 통계 HUD 누락');
if (main.includes('keyFromPosition(item.position)') && main.includes('StaticRocks:') && engineConfig.includes('visibleChunkRadius: 1')) pass('거리 기반 외곽 정적 청크');
else fail('월드 청크 실제 적용 누락');
if (main.includes('this.runStats.coinsCollected+=coin.value')) pass('실제 엽전 수집 통계');
else fail('엽전 수집 통계 누락');
if (main.includes('getEnemyPool(type)') && main.includes('releaseEnemyModel(enemy)') && main.includes('updateEnemyLOD(enemy') && main.includes('cachedGeometry(key, factory)')) pass('적 모델 풀링·geometry 캐시·거리 LOD');
else fail('적 모델 풀링 또는 LOD 누락');
if (main.includes("EnemyPoolRoot") && main.includes('this.releaseAllEnemyModels();')) pass('적 풀 수명과 월드 정리 분리');
else fail('적 풀 수명 관리 누락');


const forbiddenSvg = [];
const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name.toLowerCase().endsWith('.svg')) forbiddenSvg.push(absolute.replace(root, '.'));
  }
};
walk(root);
if (forbiddenSvg.length === 0 && !html.includes('.svg') && !JSON.stringify(manifest).includes('.svg')) pass('SVG 에셋 전면 금지');
else fail(`SVG 에셋 또는 참조 발견: ${forbiddenSvg.join(', ')}`);
if (existsSync(resolve(root, 'public/icon-192.png')) && existsSync(resolve(root, 'public/icon-512.png')) && existsSync(resolve(root, 'public/cover.webp'))) pass('고품질 래스터 앱 에셋');
else fail('PNG/WebP 앱 에셋 누락');
const assetPipeline = read('src/engine/asset-pipeline.js');
if (assetPipeline.includes("extension === 'svg'") && assetPipeline.includes("['glb', 'gltf']") && assetPipeline.includes("['png', 'webp', 'ktx2'")) pass('GLB/PNG/WebP/KTX2 에셋 정책');
else fail('고품질 에셋 파이프라인 정책 누락');
if (!main.includes('showMoveReadout') && !main.includes('moveReadout')) pass('터치 이동 목적지 메시지 제거');
else fail('터치 이동 목적지 메시지 코드가 남아 있음');

if (failures.length) {
  console.error(`\n검증 실패 ${failures.length}건`);
  process.exit(1);
}
console.log('\n프로젝트 정적 검증 완료');
