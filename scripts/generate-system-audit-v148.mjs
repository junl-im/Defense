import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const checkOnly = process.argv.includes('--check');
const outputJson = path.join(root, 'docs/generated/system-audit-v148.json');
const outputMd = path.join(root, 'docs/generated/system-audit-v148.md');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const walk = (dir, predicate = () => true) => {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const name of fs.readdirSync(dir)) {
    const absolute = path.join(dir, name);
    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) result.push(...walk(absolute, predicate));
    else if (predicate(absolute)) result.push(absolute);
  }
  return result;
};
const relative = (file) => path.relative(root, file).replaceAll('\\', '/');
const sourceFiles = walk(path.join(root, 'src'), (file) => file.endsWith('.js')).sort();
const scriptFiles = walk(path.join(root, 'scripts'), (file) => /\.(?:mjs|js|py)$/.test(file)).sort();
const engineFiles = sourceFiles.filter((file) => relative(file).startsWith('src/engine/'));
const runtimeFiles = sourceFiles.filter((file) => relative(file).startsWith('src/runtime/'));
const combatFiles = sourceFiles.filter((file) => relative(file).startsWith('src/combat/'));
const bytes = (files) => files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
const lines = (file) => fs.readFileSync(file, 'utf8').split(/\r?\n/).length;
const mainPath = path.join(root, 'src/main.js');
const main = fs.readFileSync(mainPath, 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');

const importPattern = /(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]+?\s+from\s+|import\s*\()\s*['"](\.[^'"]+)['"]/g;
const brokenImports = [];
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  importPattern.lastIndex = 0;
  let match;
  while ((match = importPattern.exec(source))) {
    const raw = match[1].split(/[?#]/, 1)[0];
    let target = path.resolve(path.dirname(file), raw);
    if (!path.extname(target)) target += '.js';
    if (!fs.existsSync(target)) brokenImports.push(`${relative(file)} -> ${raw}`);
  }
}

const missingScriptTargets = [];
const commandPattern = /(?:^|&&|\|\|)\s*(?:node|python(?:\s+-S)?)\s+([^\s&|]+)/g;
for (const [name, command] of Object.entries(pkg.scripts || {})) {
  commandPattern.lastIndex = 0;
  let match;
  while ((match = commandPattern.exec(command))) {
    const target = match[1].replace(/^['"]|['"]$/g, '');
    if ((target.startsWith('scripts/') || target.startsWith('src/') || target.startsWith('public/')) && !fs.existsSync(path.join(root, target))) {
      missingScriptTargets.push(`${name} -> ${target}`);
    }
  }
}

const allSource = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const directMainStorage = (main.match(/localStorage\.(?:getItem|setItem|removeItem)/g) || []).length;
const setIntervalCalls = (allSource.match(/\bsetInterval\s*\(/g) || []).length;
const emptyCatchBlocks = (allSource.match(/catch\s*(?:\([^)]*\))?\s*\{\s*\}/g) || []).length;
const runSafeCalls = (main.match(/this\.runSafe\(/g) || []).length;
const hiddenGuardOrder = main.indexOf('this.runtimeHealthV148.noteFrame({ hidden, dt: rawDt })') >= 0 && main.indexOf('this.runtimeHealthV148.noteFrame({ hidden, dt: rawDt })') < main.indexOf("this.runSafe('world-effects'");
const versionIdentity = pkg.version === '1.0.48' && pkg.dokkaebi?.buildId === 'b24.48' && pkg.dokkaebi?.cacheRevision === '1.0.48-b24.48';
const serviceWorkerIdentity = sw.includes("const RELEASE_VERSION = '1.0.48'") && sw.includes("const BUILD_ID = 'b24.48'") && sw.includes('DD-SW-UPGRADE-ASSURANCE-V148');
const deliveryRule = fs.existsSync(path.join(root, 'docs/DELIVERY_RESULT_RULE.md'));
const workflowContract = workflow.includes('logs/qa/v148') && workflow.includes('v1.0.48-system-integrity');
const historicalReleaseGatesRestored = pkg.scripts?.verify?.includes('verify:release:v134 && npm run verify:release:v135 && npm run verify:release:v136 && npm run verify:release:v137');

const checks = {
  identitySynchronized: versionIdentity,
  serviceWorkerSynchronized: serviceWorkerIdentity,
  importGraphComplete: brokenImports.length === 0,
  packageScriptTargetsComplete: missingScriptTargets.length === 0,
  safeStorageIntegrated: directMainStorage === 0 && main.includes('createSafeStorageV148'),
  runtimeHealthIntegrated: main.includes('RuntimeHealthAssuranceV148') && !main.includes('runtimeErrorKeys'),
  hiddenFrameSuspensionBeforeHeavyWork: hiddenGuardOrder,
  unboundedIntervalsAbsent: setIntervalCalls === 0,
  deliveryResultRulePersisted: deliveryRule,
  ciEvidenceContractInstalled: workflowContract,
  historicalReleaseGatesRestored
};

const findings = [
  { id: 'V148-BUG-001', category: 'error', severity: 'high', status: 'fixed', title: '점수 저장이 localStorage SecurityError/QuotaExceededError로 중단될 수 있음', resolution: 'SafeStorageV148 영속 저장 실패 시 제한된 메모리 fallback으로 전환' },
  { id: 'V148-BUG-002', category: 'feature', severity: 'medium', status: 'fixed', title: '렌더 통계 HUD와 HUD 밀도 설정이 저장소 차단 환경에서 초기화 실패 가능', resolution: '공통 안전 저장 계층 주입 및 읽기/쓰기 예외 격리' },
  { id: 'V148-BUG-003', category: 'system', severity: 'medium', status: 'fixed', title: '런타임 오류 지문 Set이 장시간 실행에서 무제한 증가', resolution: 'LRU 방식 최대 96개 지문과 최대 40개 오류 기록으로 제한' },
  { id: 'V148-BUG-004', category: 'privacy', severity: 'medium', status: 'fixed', title: '오류 메시지에 URL, 로컬 경로, 이메일, 장기 토큰이 포함될 수 있음', resolution: 'RuntimeHealthAssuranceV148에서 진단 기록 전 비식별화' },
  { id: 'V148-PERF-001', category: 'performance', severity: 'medium', status: 'fixed', title: '백그라운드 탭에서도 전체 전투/렌더 업데이트 경로가 순회됨', resolution: '가시성 숨김 프레임은 핵심 계측 후 무거운 업데이트 전에 조기 종료' },
  { id: 'V148-ENGINE-001', category: 'engine', severity: 'high', status: 'fixed', title: '10Hz 프레임 스케줄러가 부동소수점 경계에서 약 2배 실행됨', resolution: '모듈로 연산 대신 interval 차감 방식으로 잔여 시간을 안정화' },
  { id: 'V148-PROC-001', category: 'process', severity: 'high', status: 'fixed', title: '결과 전달 형식이 패치마다 달라질 수 있음', resolution: '작업 내역 → 전체 ZIP/패치 ZIP → 다음 예정 내역 순서를 프로젝트 규칙으로 고정' },
  { id: 'V148-CI-001', category: 'ci', severity: 'high', status: 'fixed', title: '누적 verify 체인에서 v1.0.35와 v1.0.36 릴리스 게이트가 누락됨', resolution: 'v134와 v137 사이에 v135·v136을 복원해 매 릴리스에서 실행' },
  { id: 'V148-CI-002', category: 'ci', severity: 'high', status: 'fixed', title: 'v1.0.35 검증기가 1.0.35 고정 식별자만 허용해 최신 릴리스에서 실패', resolution: '최소 버전과 현재 동기화 식별자를 함께 검사하는 전진 호환 계약으로 교체' },
  { id: 'V148-CI-003', category: 'ci', severity: 'high', status: 'fixed', title: 'v1.0.36 검증기가 1.0.36 고정 식별자만 허용해 최신 릴리스에서 실패', resolution: '현재 package·lock·public·SW·runtime shell 식별자 동기화를 검사하도록 교체' },
  { id: 'V148-CI-004', category: 'ci', severity: 'high', status: 'fixed', title: '부분 패치 적용 시 package와 런타임 식별자가 서로 다른 버전으로 남을 수 있음', resolution: 'verify/build 사전 단계에서 package·lock·main·policy·HTML·SW·public 식별자를 표 형태로 전수 비교' }
];

const openRisks = [
  { id: 'V148-RISK-001', category: 'architecture', severity: 'medium', title: 'src/main.js가 여전히 대형 단일 모듈', next: 'v1.0.49에서 상태·저장·진단 경계를 별도 모듈로 단계적 추출' },
  { id: 'V148-RISK-002', category: 'build', severity: 'medium', title: '현재 작업 환경에서 Vite 패키지 복원이 불안정할 수 있음', next: 'GitHub Actions의 npm ci + 실제 Vite dist 게이트를 최종 승인 근거로 사용' },
  { id: 'V148-RISK-003', category: 'performance', severity: 'low', title: '정확한 v1.0.45 승인 Vite 기준선이 아직 후보 대기 상태일 수 있음', next: '승인 아티팩트 확보 후 5% 추세 기준선으로 승격' }
];

const metrics = {
  sourceModules: sourceFiles.length,
  sourceBytes: bytes(sourceFiles),
  runtimeModules: runtimeFiles.length,
  runtimeBytes: bytes(runtimeFiles),
  engineModules: engineFiles.length,
  engineBytes: bytes(engineFiles),
  combatModules: combatFiles.length,
  combatBytes: bytes(combatFiles),
  scriptFiles: scriptFiles.length,
  scriptBytes: bytes(scriptFiles),
  mainLines: lines(mainPath),
  mainBytes: fs.statSync(mainPath).size,
  runSafeCalls,
  directMainStorage,
  setIntervalCalls,
  emptyCatchBlocks,
  brokenImports: brokenImports.length,
  missingScriptTargets: missingScriptTargets.length
};
const blockers = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const report = {
  id: 'DD-COMPREHENSIVE-SYSTEM-AUDIT-V148',
  releaseVersion: pkg.version,
  buildId: pkg.dokkaebi?.buildId || '',
  scope: ['system','performance','technology','feature','engine','problems','improvements','errors','bugs','exceptions','delivery-rule'],
  checks,
  metrics,
  findings,
  openRisks,
  diagnostics: { brokenImports, missingScriptTargets },
  summary: {
    passed: blockers.length === 0,
    blockers,
    fixed: findings.filter((item) => item.status === 'fixed').length,
    openRisks: openRisks.length
  }
};
const jsonText = `${JSON.stringify(report, null, 2)}\n`;
const mdText = [
  '# Comprehensive System Audit v1.0.48',
  '',
  `- 결과: **${report.summary.passed ? 'PASS' : 'FAIL'}**`,
  `- 수정 완료: ${report.summary.fixed}건`,
  `- 추적 위험: ${report.summary.openRisks}건`,
  `- 소스 모듈: ${metrics.sourceModules}개 / ${metrics.sourceBytes} bytes`,
  `- 엔진 모듈: ${metrics.engineModules}개 / ${metrics.engineBytes} bytes`,
  `- 런타임 모듈: ${metrics.runtimeModules}개 / ${metrics.runtimeBytes} bytes`,
  '',
  '## 점검 결과',
  ...Object.entries(checks).map(([name, passed]) => `- ${passed ? 'PASS' : 'FAIL'} ${name}`),
  '',
  '## 수정 내역',
  ...findings.map((item) => `- **${item.id} · ${item.category} · ${item.severity}** — ${item.title} → ${item.resolution}`),
  '',
  '## 남은 위험과 다음 조치',
  ...openRisks.map((item) => `- **${item.id} · ${item.category} · ${item.severity}** — ${item.title} → ${item.next}`),
  '',
  '## 주요 계측',
  ...Object.entries(metrics).map(([name, value]) => `- ${name}: ${value}`),
  ''
].join('\n');

if (checkOnly) {
  if (!fs.existsSync(outputJson) || fs.readFileSync(outputJson, 'utf8') !== jsonText) throw new Error('v148 system audit JSON is stale; run npm run generate:audit:v148');
  if (!fs.existsSync(outputMd) || fs.readFileSync(outputMd, 'utf8') !== mdText) throw new Error('v148 system audit Markdown is stale; run npm run generate:audit:v148');
  if (!report.summary.passed) throw new Error(`v148 system audit blockers: ${blockers.join(', ')}`);
  console.log(`PASS v1.0.48 comprehensive system audit (${report.summary.fixed} fixed, ${report.summary.openRisks} tracked risks)`);
} else {
  fs.mkdirSync(path.dirname(outputJson), { recursive: true });
  fs.writeFileSync(outputJson, jsonText);
  fs.writeFileSync(outputMd, mdText);
  console.log(`GENERATED v1.0.48 comprehensive system audit (${report.summary.fixed} fixed, ${report.summary.openRisks} tracked risks)`);
}
