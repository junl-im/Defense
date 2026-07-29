import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const walk = (directory, output = []) => {
  for (const name of readdirSync(directory)) {
    if (['node_modules', 'dist', '.git'].includes(name)) continue;
    const absolute = resolve(directory, name);
    if (statSync(absolute).isDirectory()) walk(absolute, output);
    else output.push(absolute);
  }
  return output;
};

const sourceFiles = walk(resolve(root, 'src')).filter((path) => extname(path) === '.js');
const importGraph = new Map();
const importPattern = /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"](\.[^'"]+)['"]/g;
for (const file of sourceFiles) {
  const code = readFileSync(file, 'utf8');
  const dependencies = [];
  for (const match of code.matchAll(importPattern)) {
    let target = resolve(dirname(file), match[1]);
    if (!extname(target)) target += '.js';
    if (!existsSync(target)) fail(`해결되지 않는 상대 import: ${relative(root, file)} -> ${match[1]}`);
    else dependencies.push(target);
  }
  importGraph.set(file, dependencies);
}
if (!failures.some((item) => item.includes('상대 import'))) pass(`상대 import ${sourceFiles.length}개 모듈 해석`);

const visiting = new Set();
const visited = new Set();
const cycles = [];
const visit = (file, path = []) => {
  if (visiting.has(file)) {
    const start = path.indexOf(file);
    cycles.push([...path.slice(start), file].map((item) => relative(root, item)).join(' -> '));
    return;
  }
  if (visited.has(file)) return;
  visiting.add(file);
  for (const dependency of importGraph.get(file) || []) visit(dependency, [...path, file]);
  visiting.delete(file);
  visited.add(file);
};
for (const file of sourceFiles) visit(file);
if (cycles.length) cycles.forEach((cycle) => fail(`순환 import: ${cycle}`));
else pass('ES module 순환 의존성 없음');

const html = read('index.html');
const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
if (duplicateIds.length) fail(`중복 DOM id: ${duplicateIds.join(', ')}`);
else pass(`DOM id ${ids.length}개 중복 없음`);

const main = read('src/main.js');
const methodNames = [...main.matchAll(/^  (?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^\n]*\)\s*\{/gm)].map((match) => match[1]);
const duplicateMethods = [...new Set(methodNames.filter((name, index) => methodNames.indexOf(name) !== index))];
if (duplicateMethods.length) fail(`DokkaebiLuckDefense 중복 메서드: ${duplicateMethods.join(', ')}`);
else pass(`메인 클래스 메서드 ${methodNames.length}개 중복 없음`);

if (/\b(?:window\.)?setInterval\s*\(/.test(main)) fail('main.js에 setInterval 직접 사용');
else pass('setInterval 직접 사용 없음');
if (/\b(?:window\.)?setTimeout\s*\(/.test(main) || /\b(?:window\.)?clearTimeout\s*\(/.test(main)) fail('main.js 지연 작업이 RuntimeLifecycle을 우회');
else pass('main.js 지연 작업 RuntimeLifecycle 단일화');
if (main.includes('.addEventListener(')) fail('main.js 이벤트가 EventRegistry를 우회');
else pass('main.js 이벤트 EventRegistry 단일화');

const unreachablePatterns = [
  /return\s+premium;\s*const\s+group\s*=\s*new THREE\.Group\(\)/,
  /return\s+createPremiumGuardian\([^;]+;\s*const\s+group\s*=\s*new THREE\.Group\(\)/,
  /return\s+model;\s*const\s+group\s*=\s*new THREE\.Group\(\)/
];
if (unreachablePatterns.some((pattern) => pattern.test(main))) fail('모델 생성 함수에 return 이후 구형 죽은 코드 잔존');
else pass('모델 생성 함수 return 이후 죽은 코드 없음');
if (main.includes('.fallbackCounts.set(') || main.includes('.fallbackCounts.get(')) fail('main.js가 AssetPipeline 내부 상태에 직접 접근');
else pass('에셋 폴백 집계 AssetPipeline API 단일화');
if (main.includes('sharedAssetGeometry') && read('src/codex-viewer.js').includes('sharedAssetGeometry')) pass('GLB 공유 geometry 이중 dispose 방지');
else fail('GLB 공유 geometry 수명 보호 누락');

const codex = read('src/codex-viewer.js');
if (codex.includes('.addEventListener(')) fail('codex-viewer 이벤트가 EventRegistry를 우회');
else pass('도감 이벤트 EventRegistry 단일화');
if (!codex.includes('dispose()') || !codex.includes('cancelAnimationFrame')) fail('도감 뷰어 dispose 수명 정리 누락');
else pass('도감 뷰어 이벤트·RAF·렌더러 dispose 경로');

const staleBundles = [];
const publicAssets = resolve(root, 'public/assets');
if (existsSync(publicAssets)) {
  for (const name of readdirSync(publicAssets)) {
    if (/^index-[A-Za-z0-9_-]+\.(?:js|css)$/.test(name)) staleBundles.push(name);
  }
}
if (staleBundles.length) fail(`구버전 해시 번들 잔존: ${staleBundles.join(', ')}`);
else pass('public 구버전 Vite 해시 번들 없음');

const packageJson = JSON.parse(read('package.json'));
const cleanCommand = packageJson.scripts?.['clean:obsolete'];
const preverifyCommand = packageJson.scripts?.preverify;
const prebuildCommand = packageJson.scripts?.prebuild;
const hasOrderedLifecycle = (command) => {
  const required = ['npm run bootstrap:identity:v149', 'npm run clean:obsolete', 'npm run hygiene:check', 'npm run verify:identity:v149'];
  let cursor = -1;
  return required.every((token) => {
    const index = String(command || '').indexOf(token, cursor + 1);
    if (index < 0) return false;
    cursor = index;
    return true;
  });
};
const preverifyHasCleanup = hasOrderedLifecycle(preverifyCommand);
const prebuildHasCleanup = hasOrderedLifecycle(prebuildCommand);
if (cleanCommand === 'node scripts/clean-obsolete-assets.mjs'
  && preverifyHasCleanup
  && prebuildHasCleanup) {
  pass('검증·빌드 전 구버전 번들 정리와 루트 위생 검사');
} else {
  fail('preverify/prebuild 정리·위생 검사 연결 누락');
}
if (main.includes("from './runtime-lifecycle.js'") && main.includes('this.lifecycle.beginRun()') && main.includes('this.lifecycle.endRun()')) pass('런 수명 토큰과 작업 취소 연결');
else fail('런 수명 관리 연결 누락');

if (failures.length) {
  console.error(`\n코드 무결성 검증 실패 ${failures.length}건`);
  process.exit(1);
}
console.log('\n코드 무결성 검증 완료');
