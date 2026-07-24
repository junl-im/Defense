import { createHash } from 'node:crypto';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const baseline = JSON.parse(read('scripts/patch-baselines/v1.0.2.json'));
const html = read('index.html');
const hasDist = fs.existsSync('dist/index.html') && fs.existsSync('dist/static-bootstrap.js');
const distHtml = hasDist ? read('dist/index.html') : '';
const main = read('src/main.js');
const bootstrap = read('src/bootstrap.js');
const staticBootstrap = read('public/static-bootstrap.js');
const distStaticBootstrap = hasDist ? read('dist/static-bootstrap.js') : '';
const buildStatic = read('scripts/build-static-fallback.mjs');
const policy = read('src/version-policy.js');
const sw = read('public/sw.js');
const release = String(pkg.version || '0.0.0').split('.').map(Number);
const is104OrLater = release[0] === 1 && release[1] === 0 && release[2] >= 4;
const version = pkg.dokkaebi?.releaseVersion;
const buildId = pkg.dokkaebi?.buildId;
const buildRevision = pkg.dokkaebi?.buildRevision;

const protectedFiles = ['src/art-style-tokens.js', 'docs/ABSOLUTE_ART_BIBLE_v2.0.md'];
const artBibleUnchanged = protectedFiles.every((file) => baseline.files?.[file]?.sha256 === hash(file));
const assetsUnchanged = Object.entries(baseline.files || {})
  .filter(([file]) => file.startsWith('src/assets/') || file.startsWith('public/assets/'))
  .every(([file, meta]) => fs.existsSync(file) && meta.sha256 === hash(file));

const checks = [
  ['release remains on v1.0.4-or-later recovery line', is104OrLater && version === pkg.version && Number(buildRevision) >= 4],
  ['package lock is synchronized', lock.version === pkg.version && lock.packages?.['']?.version === pkg.version],
  ['runtime policy and service worker identities match current release', policy.includes(`PUBLIC_GAME_VERSION = '${version}'`) && policy.includes(`BUILD_REVISION = ${buildRevision}`) && main.includes(`const GAME_VERSION = '${version}'`) && sw.includes(`RELEASE_VERSION = '${version}'`) && sw.includes(`BUILD_ID = '${buildId}'`)],
  ['loading label remains user-facing', html.includes('id="title-start-label"') && html.includes('게임 준비 중...') && !html.includes('엔진 연결 중')],
  ['root entry is relative and cache-versioned', html.includes(`src="./src/bootstrap.js?v=${version}-${buildId}"`) && !html.includes('src="/src/bootstrap.js')],
  ['resilient bootstrap entry diagnostics are installed', bootstrap.includes("mode: 'resilient-entry'") && bootstrap.includes("import('./main.js').catch")],
  ['static bootstrap probes real core and GLTF loader files', staticBootstrap.includes('probeFile(candidate.three') && staticBootstrap.includes('loaders/GLTFLoader.js') && staticBootstrap.includes("contentType.includes('text/html')")],
  ['static bootstrap has pinned redundant engine endpoints', ['local-vendor', 'fastly-jsdelivr', 'jsdelivr-npm', 'jsdelivr-github', 'unpkg', 'esm-sh'].every((id) => staticBootstrap.includes(`id: '${id}'`)) && !staticBootstrap.includes("id: 'threejs-org'")],
  ['static loader reports failures instead of leaving a dead button', staticBootstrap.includes('window.__DOKKAEBI_SHOW_BOOT_ERROR__') && staticBootstrap.includes('3D 엔진 파일을 불러오지 못했습니다')],
  ['start button uses guarded title entry path', main.includes("on(ui.start, 'click', () => this.startRunFromTitle") && main.includes('startRunFromTitle({ reuseSeed = false } = {})')],
  ['start entry catches runtime failures and restores title controls', main.includes("this.recordRuntimeError(error, 'title-start-run')") && main.includes('전투 진입 중 오류가 발생했습니다') && main.includes("startLabel.textContent = '달빛 장터 수호 준비 완료'")],
  ['static build emits the resilient bootstrap contract', buildStatic.includes('data-entry="./src/bootstrap.js"') && buildStatic.includes('data-vendor-base="./vendor/three/"') && (!hasDist || (distHtml.includes('data-entry="./src/bootstrap.js"') && distHtml.includes('data-vendor-base="./vendor/three/"')))],
  ['dist bootstrap matches public bootstrap', !hasDist || hash('public/static-bootstrap.js') === hash('dist/static-bootstrap.js')],
  ['absolute art bible tokens are unchanged', artBibleUnchanged],
  ['runtime art asset bytes are unchanged', assetsUnchanged],
  ['no SVG policy surface was added to recovery code', ![html, main, bootstrap, staticBootstrap, buildStatic].some((source) => /<svg\b|createElementNS\([^)]*svg/i.test(source))]
];

let failed = 0;
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  if (!passed) failed += 1;
}
if (failed) process.exit(1);
console.log('\nv1.0.4 Start Entry Recovery contract retained');
