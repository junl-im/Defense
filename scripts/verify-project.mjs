import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatSvgViolations, scanSvgPolicy } from './svg-policy.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };

const html = read('index.html');
const main = read('src/main.js');
const data = read('src/game-data.js');
const runDirector = read('src/run-director.js');
const expeditionDirector = read('src/expedition-director.js');
const dailyExpedition = read('src/daily-expedition.js');
const bossDirector = read('src/boss-director.js');
const battlefieldThemes = read('src/battlefield-themes.js');
const codexData = read('src/codex-data.js');
const assetSpecs = read('src/asset-specs.js');
const artTokens = read('src/art-style-tokens.js');
const style = read('src/style.css');
const engineConfig = read('src/engine/engine-config.js');
const sw = read('public/sw.js');
const vite = read('vite.config.js');
const pkg = JSON.parse(read('package.json'));
const manifest = JSON.parse(read('public/manifest.webmanifest'));

const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const queriedIds = [...main.matchAll(/\$\('#([^']+)'\)/g)].map((match) => match[1]);
const missingIds = [...new Set(queriedIds.filter((id) => !htmlIds.has(id)))];
if (missingIds.length) fail(`index.html에 없는 DOM ID: ${missingIds.join(', ')}`);
else pass(`${queriedIds.length}개 DOM ID 연결`);

const expectedGameVersion = pkg.version;
const expectedEngineVersion = '18.0.0';
pass(`package version ${expectedGameVersion}`);

for (const path of ['.env.production', '.firebaserc', '.github/workflows/deploy.yml', 'README.md', 'PROJECT_HANDOFF.md']) {
  if (existsSync(resolve(root, path))) pass(`${path} 존재`);
  else fail(`${path} 누락`);
}

const rootMarkdown = readdirSync(root).filter((name) => name.toLowerCase().endsWith('.md')).sort();
const requiredMarkdown = ['PROJECT_HANDOFF.md', 'README.md'];
const missingRootDocs = requiredMarkdown.filter((name) => !rootMarkdown.includes(name));
if (missingRootDocs.length === 0) pass('필수 루트 문서 존재');
else fail(`필수 루트 Markdown 누락: ${missingRootDocs.join(', ')}`);
const extraRootMarkdown = rootMarkdown.filter((name) => !requiredMarkdown.includes(name));
if (extraRootMarkdown.length) console.log(`INFO 추가 루트 Markdown은 빌드를 차단하지 않음: ${extraRootMarkdown.join(', ')}`);

if (manifest.start_url === './') pass('PWA 상대 경로 start_url');
else fail(`PWA start_url 확인 필요: ${manifest.start_url}`);

if (main.includes(`const GAME_VERSION = '${expectedGameVersion}'`)) pass(`런타임 version ${expectedGameVersion}`);
else fail(`런타임 version 불일치: package=${expectedGameVersion}`);

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

if (main.includes('unit.commandTimer = 7') && main.includes('commandCooldown = 18 * this.mods.commandCooldown') && main.includes('commandDamage = unit.commandTimer > 0 ? 1.55 : 1')) pass('집중 명령 7초/18초 밸런스');
else fail('집중 명령 밸런스 코드 누락');


if (main.includes("if (this.player?.group && this.player.group.visible !== false)") && main.includes('if (!this.blobShadows || !this.worldReady) return;')) pass('첫 프레임 player.group 부팅 오류 수정');
else fail('첫 프레임 player.group 부팅 오류 방어 누락');
if (main.includes("this.animations.trigger(this.player.animation, 'attack', .24)")) pass('플레이어 공격 애니메이션 참조 수정');
else fail('플레이어 공격 애니메이션 오참조가 남아 있음');
if (main.includes('const deathPosition = enemy.group.position.clone()') && main.includes('this.dropCoins(deathPosition')) pass('적 풀 반환 전 사망 좌표 보존');
else fail('적 사망 좌표 풀링 수명 오류 수정 누락');
if (runDirector.includes('MOON_OMENS') && runDirector.includes('ELITE_AFFIXES') && main.includes('selectMoonOmen') && main.includes('rollEliteAffix')) pass('달의 징조와 정예 요괴 런 디렉터');
else fail('런 디렉터 시스템 누락');
if (main.includes('this.moonWard = Math.min(3') && main.includes('this.runStats.wardBlocks') && htmlIds.has('moon-ward')) pass('무결점 달빛 방패 시스템');
else fail('달빛 방패 시스템 누락');
if (main.includes('triggerJackpotRush') && main.includes('this.jackpotTimer > 0 ? 1.22 : 1') && htmlIds.has('jackpot-rush')) pass('왕대박 폭주 시스템');
else fail('왕대박 폭주 시스템 누락');
if (htmlIds.has('moon-omen') && style.includes('.moon-omen') && style.includes('.jackpot-rush')) pass('v1.8 전투 상태 HUD');
else fail('v1.8 전투 상태 HUD 누락');
if (read('src/engine/mobile-engine.js').includes("label: 'compatibility'") && read('src/engine/mobile-engine.js').includes("label: 'low-power'")) pass('WebGL 렌더러 3단 폴백');
else fail('WebGL 렌더러 폴백 누락');
if (read('src/engine/mobile-engine.js').includes('__DOKKAEBI_RENDERER_FACTORY__') && read('src/engine/mobile-engine.js').includes("rendererFallback = 'injected-test'")) pass('브라우저 로직 스모크용 렌더러 주입점');
else fail('테스트 렌더러 주입점 누락');


if (expeditionDirector.includes('RUN_MODES') && expeditionDirector.includes('RELICS') && main.includes('selectRunMode') && main.includes('offerRelic')) pass('원정 난이도와 런 유물 시스템');
else fail('원정 난이도 또는 런 유물 시스템 누락');
if (main.includes('assignWaveTrial') && main.includes('resolveWaveTrial') && htmlIds.has('wave-trial')) pass('웨이브 도전과제 시스템');
else fail('웨이브 도전과제 시스템 누락');
if (main.includes('activateGuardianBurst') && main.includes('gainSoul') && htmlIds.has('burst-btn') && htmlIds.has('burst-meter')) pass('혼불 수호신 폭주 시스템');
else fail('혼불 수호신 폭주 시스템 누락');
for (const id of ['run-mode-options', 'run-mode-summary', 'relic-panel', 'relic-strip', 'relic-modal', 'relic-options', 'burst-btn', 'burst-meter']) {
  if (htmlIds.has(id)) pass(`v1.9 UI ${id}`); else fail(`v1.9 UI 누락: ${id}`);
}
if (runDirector.includes("id: 'hunt'") && runDirector.includes("id: 'ghost'") && runDirector.includes("id: 'dawn'") && runDirector.includes("id: 'warded'") && runDirector.includes("id: 'explosive'") && runDirector.includes("id: 'ancient'")) pass('신규 징조 3종과 정예 속성 3종');
else fail('신규 징조 또는 정예 속성 누락');
if (main.includes('stride: {') && main.includes('fortune: {') && main.includes('spirit: {')) pass('영구 성장 특성 3종 확장');
else fail('영구 성장 특성 확장 누락');
if (read('src/engine/mobile-engine.js').includes('effectBudgetScale') && engineConfig.includes('lowEffectScale') && main.includes('this.engine.effectBudgetScale')) pass('FPS 연동 이펙트 예산 조절');
else fail('적응형 이펙트 예산 누락');

if (dailyExpedition.includes('RUN_SEED_MODES') && dailyExpedition.includes('DAILY_EDICTS') && main.includes('prepareRunSeed') && main.includes('createSeededRandom')) pass('오늘의 원정과 동일 시드 재도전');
else fail('오늘의 원정 시드 시스템 누락');
if (bossDirector.includes("4:") && bossDirector.includes("7:") && bossDirector.includes("10:") && data.includes("serpent:") && main.includes('serpentPoisonRings')) pass('3대 월식 보스와 청월 이무기 패턴');
else fail('3대 보스 시스템 누락');
if (battlefieldThemes.includes('BATTLEFIELD_THEMES') && main.includes('setBattlefieldTheme') && main.includes('updateBattlefieldTheme')) pass('징조별 전장 테마 전환');
else fail('전장 테마 시스템 누락');
if (expeditionDirector.includes('RELIC_SET_BONUSES') && expeditionDirector.includes("cursed: true") && main.includes('activateRelicSetBonuses')) pass('저주 전설 유물과 세트 각성');
else fail('저주 유물 세트 시스템 누락');
if (main.includes('createEliteDeathBurst') && main.includes('eliteBurstDodges') && main.includes('eliteBurstHits')) pass('정예 파열 실제 회피·피격 판정');
else fail('정예 파열 판정 누락');
if (htmlIds.has('seed-mode-options') && htmlIds.has('run-seed-chip') && htmlIds.has('performance-export-btn') && htmlIds.has('result-new-run-btn')) pass('v2.0 시드·성능 로그 UI');
else fail('v2.0 시드·성능 로그 UI 누락');
if (htmlIds.has('shake-intensity') && htmlIds.has('flash-intensity') && main.includes('reducedMotion') && style.includes('body.reduced-motion')) pass('접근성 설정과 모션 감소');
else fail('접근성 설정 누락');

if (htmlIds.has('collection-tabs') && htmlIds.has('collection-summary') && codexData.includes('CODEX_SECTION_META') && main.includes('renderCodex(')) pass('수호대·요괴·보스·전장·효과 통합 도감');
else fail('v2.1 통합 도감 누락');
const codexProgression = read('src/codex-progression.js');
if (codexProgression.includes('ENEMY_RESEARCH') && codexProgression.includes('LOOT_CATALOG') && codexProgression.includes('recordCodexDefeat') && main.includes('handleCodexEnemyDefeat')) pass('v2.4 도감 발견·약점·전리품 저장 루프');
else fail('v2.4 도감 연구 루프 누락');
if (main.includes('getWeaknessDamageBonus') && main.includes('weaknessHits') && main.includes('recordGuardianCodexUse')) pass('약점 보너스와 수호대 숙련 실제 전투 연결');
else fail('약점 또는 수호대 숙련 연결 누락');
if (htmlIds.has('codex-progress-readout') && htmlIds.has('codex-weakness-readout') && htmlIds.has('codex-loot-readout') && style.includes('.codex-research-row')) pass('도감 연구 상세 UI');
else fail('도감 연구 상세 UI 누락');
if (main.includes('createMoonMarketModuleSet()') && main.includes("root.name = 'MoonMarketModuleSetV1'") && main.includes('applyPremiumBossPhase')) pass('야시장 환경 모듈과 보스 페이즈 비주얼');
else fail('환경 모듈 또는 보스 페이즈 비주얼 누락');
if (existsSync(resolve(root, 'src/assets/moon-mascot-expressions-v1.webp')) && html.includes('class="loading-mascot"') && style.includes('@keyframes mascot-load-frame')) pass('마스코트 4상태 로딩 에셋');
else fail('마스코트 로딩 상태 에셋 누락');
const titleBlock = html.slice(html.indexOf('<section id="title-screen"'), html.indexOf('<header id="hud"'));
if (titleBlock.includes('id="start-btn"') && titleBlock.includes('id="title-setup-btn"') && !titleBlock.includes(expectedGameVersion) && !titleBlock.includes('ENGINE') && !titleBlock.includes('ATLAS FRAMES')) pass('타이틀 패치·버전 설명 제거');
else fail('타이틀 패치 설명 제거 필요');
if (main.includes('this.modalStack = []') && main.includes('modalParents') && main.includes('modal-obscured') && style.includes('--modal-layer') && style.includes('#controls-modal { z-index: var(--modal-layer, 154); }')) pass('일시정지 위 카메라 설정 모달 스택');
else fail('중첩 모달 레이어 수정 누락');
if (assetSpecs.includes('directions: AUTHORED_VIEW_STANDARD.runtimeDirections') && assetSpecs.includes('authoredDirections: AUTHORED_VIEW_STANDARD.authoredDirections') && artTokens.includes('targetHeadsTall: 2.3') && existsSync(resolve(root, 'docs/ASSET_BIBLE.md')) && existsSync(resolve(root, 'docs/AI_ASSET_PROMPTS.md')) && existsSync(resolve(root, 'docs/BLENDER_EXPORT_GUIDE.md'))) pass('AAA SD PBR 아트 바이블과 5방향+미러링 제작 규격');
else fail('SD 아트 바이블 또는 방향 제작 규격 누락');


const premiumAssets = read('src/premium-assets.js');
const codexViewer = read('src/codex-viewer.js');
if (premiumAssets.includes('createPremiumGuardian') && premiumAssets.includes('createPremiumEnemy') && premiumAssets.includes('createPremiumSacredTree') && main.includes('createPremiumGuardian(type, rank')) pass('Moon Forge 수호대·요괴·보스·신목 모델 실제 연결');
else fail('Moon Forge 프리미엄 모델 연결 누락');
if (htmlIds.has('codex-preview-modal') && htmlIds.has('codex-preview-canvas') && htmlIds.has('codex-direction-readout') && main.includes('openCodexPreview') && codexViewer.includes('resolveDirectionalFrame')) pass('실시간 3D 도감과 11방향 감상 UI');
else fail('3D 도감 감상 기능 누락');
for (const path of ['public/assets/textures/moon-market-ground-v1.webp', 'public/assets/effects/moon-fx-atlas-v1.webp', 'public/assets/impostors/guardian/ember-idle-11.webp']) {
  if (existsSync(resolve(root, path))) pass(`v2.2 실제 래스터 에셋 ${path}`); else fail(`v2.2 래스터 에셋 누락: ${path}`);
}
if (main.includes('moon-market-ground-v1') && main.includes('moon-fx-atlas-v1') && main.includes('applyPrototypeTextures')) pass('월문 타일과 전투 FX 아틀라스 런타임 연결');
else fail('v2.2 텍스처 런타임 연결 누락');
if (main.includes('attachUnitImpostor(unit)') && main.includes('updateUnitImpostor(unit)') && main.includes('new DirectionalImpostorSelector') && main.includes("attachUnitImpostor(unit)") && main.includes("attachEnemyImpostor(group, type)") && main.includes("setDirectionalImpostorState")) pass('불씨 깨비·장난 요괴 상태별 11방향 원거리 LOD 연결');
else fail('v2.3 상태별 실전 임포스터 LOD 연결 누락');

if (main.includes('PLAYER_ASSET_ID') && main.includes('GUARDIAN_ASSET_IDS[type]') && main.includes('MONSTER_ASSET_IDS[type]') && main.includes('BOSS_ASSET_IDS[type]') && main.includes('renderAssetDiagnostics()') && htmlIds.has('asset-diagnostics-list') && read('src/premium-assets.js').includes('prepareImportedGuardian')) pass('전투 GLB 19종과 품질·적용 진단 연결');
else fail('전투 GLB 19종 또는 품질 진단 누락');
if (main.includes('createNextGenEnvironmentPass') && main.includes('fxRing') && main.includes('fxTrail')) pass('NextGen 야시장 환경과 다층 발사체 VFX');
else fail('NextGen 환경 또는 VFX 누락');
if (read('src/premium-assets.js').includes('MeshToonMaterial') && read('src/premium-assets.js').includes('TOON_GRADIENT') && read('src/engine/mobile-engine.js').includes('NeutralToneMapping') && read('src/engine/mobile-engine.js').includes('PCFSoftShadowMap')) pass('4단 SD 카툰 명암·월광 림·소프트 섀도');
else fail('SD 카툰 렌더링 패스 누락');

if (html.includes('__DOKKAEBI_SHOW_BOOT_ERROR__') && html.includes('boot-error')) pass('로딩 실패 복구 UI');
else fail('로딩 실패 복구 UI 누락');

if (!main.includes('serviceWorker.register')) pass('게임 번들에서 구형 서비스워커 등록 제거');
else fail('구형 서비스워커 등록 코드가 남아 있음');

if ((sw.includes('registration.unregister') && sw.includes('caches.delete')) || (sw.includes('DOKKAEBI_PURGE') && sw.includes('CACHE_NAME') && sw.includes('removeOldCaches'))) pass('서비스워커 캐시 복구 계약');
else fail('서비스워커 캐시 복구 계약 누락');

if (vite.includes("entryFileNames: 'assets/game.js'") && vite.includes("assets/game.css")) pass('안정적인 게임 번들 파일명');
else fail('안정적인 번들 파일명 설정 누락');

const publicAssetsDir = resolve(root, 'public/assets');
const legacyBundles = existsSync(publicAssetsDir)
  ? readdirSync(publicAssetsDir).filter((name) => /^index-[A-Za-z0-9_-]+\.(?:js|css)(?:\.map)?$/.test(name))
  : [];
if (legacyBundles.length === 0) pass('public 구버전 Vite 해시 번들 없음');
else fail(`구버전 중복 번들 잔존: ${legacyBundles.join(', ')}`);

for (const path of ['src/game-data.js', 'src/run-director.js', 'src/expedition-director.js', 'src/daily-expedition.js', 'src/boss-director.js', 'src/battlefield-themes.js', 'src/codex-data.js', 'src/codex-viewer.js', 'src/premium-assets.js', 'src/asset-specs.js', 'src/art-style-tokens.js', 'src/runtime-lifecycle.js', 'src/sound-engine.js']) {
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
  'src/engine/texture-atlas.js', 'src/engine/world-chunk-manager.js', 'src/engine/render-stats-hud.js', 'src/engine/asset-pipeline.js', 'src/engine/directional-impostor.js'
]) {
  if (existsSync(resolve(root, path))) pass(`엔진 모듈 ${path}`);
  else fail(`엔진 모듈 누락: ${path}`);
}
if (engineConfig.includes(`ENGINE_VERSION = '${expectedEngineVersion}'`) && engineConfig.includes('unitTriangles: 10000') && engineConfig.includes('enemyTriangles: 9000') && engineConfig.includes('bossTriangles: 9000')) pass('엔진 버전과 런타임 폴리곤 예산');
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
if (main.includes('keyFromPosition(item.position)') && main.includes('StaticRocks:') && (engineConfig.includes('visibleChunkRadius: 1') || engineConfig.includes('visibleChunkRadius: 2'))) pass('거리 기반 외곽 정적 청크');
else fail('월드 청크 실제 적용 누락');
if (main.includes('this.runStats.coinsCollected+=coin.value')) pass('실제 엽전 수집 통계');
else fail('엽전 수집 통계 누락');
if (main.includes('getEnemyPool(type)') && main.includes('releaseEnemyModel(enemy)') && main.includes('updateEnemyLOD(enemy') && main.includes('cachedGeometry(key, factory)')) pass('적 모델 풀링·geometry 캐시·거리 LOD');
else fail('적 모델 풀링 또는 LOD 누락');
if (main.includes("EnemyPoolRoot") && main.includes('this.releaseAllEnemyModels();')) pass('적 풀 수명과 월드 정리 분리');
else fail('적 풀 수명 관리 누락');


const svgViolations = scanSvgPolicy(root);
if (svgViolations.length === 0) pass('절대 SVG 금지: 파일·참조·인라인·data URI 0건');
else fail(`절대 SVG 금지 정책 위반: ${formatSvgViolations(svgViolations).join(' | ')}`);
if (existsSync(resolve(root, 'public/icon-192.png')) && existsSync(resolve(root, 'public/icon-512.png')) && existsSync(resolve(root, 'public/cover.webp'))) pass('고품질 래스터 앱 에셋');
else fail('PNG/WebP 앱 에셋 누락');
const assetPipeline = read('src/engine/asset-pipeline.js');
if (assetPipeline.includes("extension === 'svg'") && assetPipeline.includes("['glb', 'gltf']") && assetPipeline.includes("['png', 'webp', 'ktx2'")) pass('GLB/PNG/WebP/KTX2 에셋 정책');
else fail('고품질 에셋 파이프라인 정책 누락');
if (!main.includes('showMoveReadout') && !main.includes('moveReadout')) pass('터치 이동 목적지 메시지 제거');
else fail('터치 이동 목적지 메시지 코드가 남아 있음');

console.log('\n프로젝트 기본 정적 검증 구간 완료');

if (main.includes('CONTROL_STORAGE_KEY') && main.includes('loadControlSettings()') && main.includes('getCameraZoomBounds()')) pass('카메라·조작 설정 저장과 사용자 줌 범위');
else fail('카메라·조작 설정 저장 기능 누락');
if (main.includes('this.controlSettings.pinchSensitivity') && main.includes('this.controlSettings.rotateSensitivity') && main.includes('this.controlSettings.wheelSensitivity')) pass('핀치·회전·휠 감도 실제 연결');
else fail('입력 감도 연결 누락');
if (main.includes('resolveCameraCollisionDistance') && main.includes('this.cameraObstacles.push') && main.includes('cameraCollisionDistance')) pass('구조물 카메라 충돌 보정');
else fail('카메라 충돌 보정 누락');
if (style.includes('body.controls-left-handed .joystick-zone') && style.includes('body.controls-left-handed .action-dock')) pass('왼손·오른손 모바일 UI 배치');
else fail('모바일 좌우 조작 배치 CSS 누락');
for (const id of ['controls-modal','rotate-sensitivity','pinch-sensitivity','minimum-zoom','maximum-zoom','pause-controls-btn']) {
  if (htmlIds.has(id)) pass(`조작 설정 UI ${id}`); else fail(`조작 설정 UI 누락: ${id}`);
}

console.log('v2.1.0 카메라·도감 추가 검증 구간 완료');


const assetCatalog = read('src/engine/asset-catalog.js');
if (assetPipeline.includes("import('three/addons/loaders/GLTFLoader.js')") && assetPipeline.includes("import('three/addons/loaders/DRACOLoader.js')") && assetPipeline.includes("import('three/addons/loaders/KTX2Loader.js')")) pass('GLB·Draco·KTX2 지연 로더 연결');
else fail('고품질 압축 에셋 로더 누락');
if (assetPipeline.includes('preload(entries') && assetPipeline.includes('instantiateModel') && assetPipeline.includes('textureBudgetMB')) pass('에셋 프리로드·대체 모델·텍스처 예산');
else fail('에셋 프리로드 또는 메모리 예산 누락');
if (assetCatalog.includes('CORE_ASSET_CATALOG') && assetCatalog.includes('selectAssetVariant') && assetCatalog.includes('MODEL_ASSET_SLOTS')) pass('기기별 에셋 품질 카탈로그');
else fail('에셋 카탈로그 누락');
if (assetPipeline.includes("three/addons/loaders/DRACOLoader.js") && assetPipeline.includes("three/addons/loaders/KTX2Loader.js") && assetPipeline.includes('deferred:')) pass('필요 시 로드되는 번들형 오프라인 디코더');
else fail('번들형 Draco/KTX2 디코더 누락');
if (htmlIds.has('loading-status') && htmlIds.has('loading-progress') && htmlIds.has('loading-detail') && main.includes('setLoadingProgress') && main.includes('initializeGame')) pass('실제 에셋 로딩 진행률 UI');
else fail('에셋 로딩 진행률 UI 누락');
if (main.includes('game.ready.then') && main.includes('async boot failed')) pass('비동기 에셋 부팅 오류 복구');
else fail('비동기 부팅 오류 복구 누락');
if (engineConfig.includes('textureBudgetLowMB: 64') && engineConfig.includes('textureBudgetMobileMB: 96') && engineConfig.includes('textureBudgetDesktopMB: 192')) pass('기기별 텍스처 메모리 예산');
else fail('텍스처 메모리 예산 누락');
if (failures.length) {
  console.error(`\n========== VERIFY FAILURE DIGEST (${failures.length}) ==========`);
  failures.forEach((message, index) => {
    console.error(`${index + 1}. ${message}`);
    console.error(`::error title=Project verification failed::${message}`);
  });
  console.error('====================================================');
  process.exit(1);
}
console.log('v2.1.0 에셋 파이프라인 검증 완료');
console.log('\n프로젝트 전체 정적 검증 완료');
