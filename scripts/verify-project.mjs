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

if (pkg.version === '1.6.0') pass('package version 1.6.0');
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

if (main.includes("const GAME_VERSION = '1.6.0'")) pass('런타임 version 1.6.0');
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

if (failures.length) {
  console.error(`\n검증 실패 ${failures.length}건`);
  process.exit(1);
}
console.log('\n프로젝트 정적 검증 완료');
