import { createHash } from 'node:crypto';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const baseline = JSON.parse(read('scripts/patch-baselines/v1.0.5.json'));
const html = read('index.html');
const main = read('src/main.js');
const presentationDirector = fs.existsSync('src/runtime/first-presentation-director-v107.js') ? read('src/runtime/first-presentation-director-v107.js') : '';
const workflow = read('.github/workflows/deploy.yml');
const verify104 = read('scripts/verify-release-v104.mjs');
const verify105 = read('scripts/verify-release-v105.mjs');
const policy = read('src/version-policy.js');
const sw = read('public/sw.js');
const staticBootstrap = read('public/static-bootstrap.js');
const buildStatic = read('scripts/build-static-fallback.mjs');
const hasDist = fs.existsSync('dist/index.html') && fs.existsSync('dist/src/main.js');
const distHtml = hasDist ? read('dist/index.html') : '';
const distMain = hasDist ? read('dist/src/main.js') : '';
const release = String(pkg.version || '0.0.0').split('.').map(Number);
const is106OrLater = release[0] === 1 && release[1] === 0 && release[2] >= 6;
const version = pkg.dokkaebi?.releaseVersion;
const buildId = pkg.dokkaebi?.buildId;
const buildRevision = pkg.dokkaebi?.buildRevision;

const protectedFiles = ['src/art-style-tokens.js', 'docs/ABSOLUTE_ART_BIBLE_v2.0.md'];
const artBibleUnchanged = protectedFiles.every((file) => baseline.files?.[file]?.sha256 === hash(file));
const assetsUnchanged = Object.entries(baseline.files || {})
  .filter(([file]) => file.startsWith('src/assets/') || file.startsWith('public/assets/'))
  .every(([file, meta]) => fs.existsSync(file) && meta.sha256 === hash(file));

const checks = [
  ['release preserves the v1.0.6 line or later', is106OrLater && version === pkg.version && Number(buildRevision) >= 6],
  ['package lock is synchronized', lock.version === pkg.version && lock.packages?.['']?.version === pkg.version],
  ['runtime, service worker and static bootstrap identities match', policy.includes(`PUBLIC_GAME_VERSION = '${version}'`) && policy.includes(`BUILD_REVISION = ${buildRevision}`) && main.includes(`const GAME_VERSION = '${version}'`) && sw.includes(`RELEASE_VERSION = '${version}'`) && sw.includes(`BUILD_ID = '${buildId}'`) && staticBootstrap.includes(`RELEASE_VERSION = '${version}'`) && staticBootstrap.includes(`BUILD_ID = '${buildId}'`)],
  ['critical boot gate is parsed before the application shell', html.includes('<html lang="ko-KR" class="boot-gate-active">') && html.indexOf('id="boot-gate"') < html.indexOf('id="app"') && html.includes('id="dokkaebi-critical-boot"')],
  ['critical boot gate hides unstyled app content', html.includes('html.boot-gate-active #app { opacity: 0; visibility: hidden; }') && html.includes('html.boot-gate-ready #app { opacity: 1; visibility: visible;')],
  ['boot gate releases after ready and immediately on errors', html.includes("requestAnimationFrame(() => window.__DOKKAEBI_RELEASE_BOOT_GATE__?.())") && html.includes("window.__DOKKAEBI_RELEASE_BOOT_GATE__?.({ immediate: true })")],
  ['title art and fonts are decoded before presentation', main.includes('async prepareFirstPresentation()') && ((main.includes('link[rel="preload"][as="image"][media]') && main.includes('document.fonts?.ready')) || (presentationDirector.includes('collectImageTasks()') && presentationDirector.includes('document.fonts?.ready')))],
  ['presentation waits for completed WebGL render frames', (main.includes('waitForRenderedFrames(2, 2800)') || presentationDirector.includes('this.waitForFrames')) && main.includes('this.renderer.render(this.scene, this.camera);') && main.includes('this.renderedFrameSerial += 1') && main.includes('this.flushRenderedFrameWaiters()')],
  ['loading screen is removed only after presentation preparation', main.indexOf('await this.prepareFirstPresentation();') < main.indexOf("ui.loading.classList.remove('visible');")],
  ['release verifiers are source-safe before dist exists', verify104.includes("const hasDist = fs.existsSync('dist/index.html')") && verify104.includes('!hasDist ||') && verify105.includes("const hasDist = fs.existsSync('dist/index.html')") && verify105.includes('!hasDist ||')],
  ['GitHub Python action uses a Node 24 compatible major', workflow.includes('uses: actions/setup-python@v7') && !workflow.includes('actions/setup-python@v5')],
  ['static fallback builder emits the current boot entry', buildStatic.includes(`const version = '${version}'`) && buildStatic.includes(`const buildId = '${buildId}'`) && buildStatic.includes(`src="./src/bootstrap.js?v=${version}-${buildId}"`)],
  ['dist preserves the boot gate and first-frame contract when present', !hasDist || (distHtml.includes('id="boot-gate"') && distMain.includes('prepareFirstPresentation()'))],
  ['absolute art bible files are unchanged', artBibleUnchanged],
  ['runtime art asset bytes are unchanged', assetsUnchanged],
  ['no SVG file or runtime SVG construction was added', ![html, main, workflow].some((source) => /<svg\b|createElementNS\([^)]*svg/i.test(source))]
];

let failed = 0;
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  if (!passed) failed += 1;
}
if (failed) process.exit(1);
console.log('\nv1.0.6 First Presentation and CI Recovery contract verified');
