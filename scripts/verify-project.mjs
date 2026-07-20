import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };

const html = read('index.html');
const main = read('src/main.js');
const pkg = JSON.parse(read('package.json'));
const manifest = JSON.parse(read('public/manifest.webmanifest'));

const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const queriedIds = [...main.matchAll(/\$\('#([^']+)'\)/g)].map((match) => match[1]);
const missingIds = [...new Set(queriedIds.filter((id) => !htmlIds.has(id)))];
if (missingIds.length) fail(`index.html에 없는 DOM ID: ${missingIds.join(', ')}`);
else pass(`${queriedIds.length}개 DOM ID 연결`);

if (pkg.version === '1.3.0') pass('package version 1.3.0');
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

if (main.includes("const GAME_VERSION = '1.3.0'")) pass('런타임 version 1.3.0');
else fail('런타임 version 불일치');

for (const feature of ['triggerUnitUltimate', 'playMythicEvolution', 'recordFirstMission', 'merge-status']) {
  const source = feature === 'merge-status' ? read('src/style.css') : main;
  if (source.includes(feature)) pass(`v1.3 기능 ${feature}`);
  else fail(`v1.3 기능 누락: ${feature}`);
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
