import { createHash } from 'node:crypto';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const baseline = JSON.parse(read('scripts/patch-baselines/v1.0.6.json'));
const html = read('index.html');
const css = read('src/style.css');
const main = read('src/main.js');
const director = read('src/runtime/first-presentation-director-v107.js');
const engine = read('src/engine/mobile-engine.js');
const policy = read('src/version-policy.js');
const sw = read('public/sw.js');
const staticBootstrap = read('public/static-bootstrap.js');
const buildStatic = read('scripts/build-static-fallback.mjs');
const hasDist = fs.existsSync('dist/index.html') && fs.existsSync('dist/src/main.js');
const distHtml = hasDist ? read('dist/index.html') : '';
const distMain = hasDist ? read('dist/src/main.js') : '';
const currentDist = hasDist && /1\.0\.(?:7|8)-b24\.(?:7|8)/.test(distHtml);
const distDirector = currentDist && fs.existsSync('dist/src/runtime/first-presentation-director-v107.js')
  ? read('dist/src/runtime/first-presentation-director-v107.js')
  : '';

const version = pkg.dokkaebi?.releaseVersion;
const release = String(pkg.version || '0.0.0').split('.').map(Number);
const is107OrLater = release[0] === 1 && release[1] === 0 && release[2] >= 7;
const buildId = pkg.dokkaebi?.buildId;
const buildRevision = pkg.dokkaebi?.buildRevision;
const protectedFiles = ['src/art-style-tokens.js', 'docs/ABSOLUTE_ART_BIBLE_v2.0.md'];
const artBibleUnchanged = protectedFiles.every((file) => baseline.files?.[file]?.sha256 === hash(file));
const assetsUnchanged = Object.entries(baseline.files || {})
  .filter(([file]) => file.startsWith('src/assets/') || file.startsWith('public/assets/'))
  .every(([file, meta]) => fs.existsSync(file) && meta.sha256 === hash(file));

const checks = [
  ['release preserves the v1.0.7 line or later', is107OrLater && version === pkg.version && Number(buildRevision) >= 7],
  ['package lock release is synchronized', lock.version === pkg.version && lock.packages?.['']?.version === pkg.version],
  ['runtime and cache identities match', policy.includes(`PUBLIC_GAME_VERSION = '${version}'`) && policy.includes(`BUILD_REVISION = ${buildRevision}`) && main.includes(`const GAME_VERSION = '${version}'`) && sw.includes(`RELEASE_VERSION = '${version}'`) && sw.includes(`BUILD_ID = '${buildId}'`) && staticBootstrap.includes(`RELEASE_VERSION = '${version}'`)],
  ['art bible boot gate uses approved raster art', html.includes('class="boot-gate-art"') && (/title-mascot-v17\.webp\?rev=release-v10[78]-b24-[78]/.test(html) || /title-mascot-v112\.webp\?rev=release-v112-b24-12/.test(html)) && html.includes('id="boot-gate-status"') && html.includes('id="boot-gate-detail"') && !html.includes('<svg')],
  ['boot gate status channel is available before application startup', html.indexOf('__DOKKAEBI_UPDATE_BOOT_GATE__') < html.indexOf('id="app"') && html.includes('__DOKKAEBI_BOOT_PROGRESS_AT__') && html.includes('BOOT_STALL_LIMIT_MS')],
  ['title uses art-bible wordmark and touch-start instead of start image button', html.includes('title-wordmark-v107') && html.includes('title-word-dokkaebi-v107') && html.includes('title-touch-start-v107') && html.includes('TOUCH TO START') && !html.includes('button_start.png') && css.includes('title-wordmark-v107') && css.includes('title-touch-pulse-v107')],
  ['title supports direct scene touch and keyboard entry', main.includes("'title-touch-anywhere'") && main.includes("'title-key-start'") && main.includes("event.target.closest('button, a, input, select, textarea, [role=\"button\"]')")],
  ['first presentation director owns image, font and stable-frame readiness', main.includes('FirstPresentationDirectorV107') && main.includes('this.firstPresentation.prepare()') && director.includes('collectImageTasks()') && director.includes('document.fonts?.ready') && director.includes('this.waitForFrames')],
  ['slow GPU recovery applies one safe renderer retry', director.includes("reason: this.contextLost ? 'context-lost' : 'frame-timeout'") && director.includes('this.applyFallback') && director.includes('this.waitForFrames(2, 3800)') && main.includes('applyFirstPresentationFallback')],
  ['slow frame confirmation fails open instead of blocking access', director.includes("this.root.dataset.presentationGate = stableFrames ? 'ready' : 'released-safe'") && director.includes("status: 'ready'") && director.includes('failOpen: frameFallback') && !director.includes("throw new Error('첫 화면 WebGL 프레임을 안정적으로 확인하지 못했습니다.')") && main.includes("reason: 'presentation-director-error'")],
  ['safe renderer profile reduces pressure without replacing the renderer', engine.includes('applyPresentationSafeMode') && engine.includes('this.renderer.shadowMap.enabled = false') && engine.includes("this.rendererFallback = `${this.rendererFallback || 'preferred'}+presentation-safe`") && engine.includes('this.renderer.setPixelRatio')],
  ['WebGL context loss remains hidden behind the presentation shell', director.includes("addEventListener('webglcontextlost'") && director.includes("addEventListener('webglcontextrestored'") && director.includes("'recovering'")],
  ['boot watchdog is progress-based rather than an absolute startup cutoff', main.includes('__DOKKAEBI_UPDATE_BOOT_GATE__') && html.includes('lastProgressAt') && html.includes('stalledFor >= BOOT_STALL_LIMIT_MS') && !html.includes('}, 32000);')],
  ['static bootstrap probes local engine before recovery endpoints', staticBootstrap.indexOf("id: 'local-vendor'") < staticBootstrap.indexOf("id: 'fastly-jsdelivr'") && staticBootstrap.includes('로컬 3D 엔진을 확인하는 중') && staticBootstrap.includes("selected.id === 'local-vendor'")],
  ['static builder can vendor checked-in or installed Three runtime', buildStatic.includes("id: 'checked-in-public-vendor'") && buildStatic.includes("id: 'installed-node-module'") && buildStatic.includes('loaders/GLTFLoader.js') && buildStatic.includes(`const version = '${version}'`)],
  ['service worker precaches the presentation director without obsolete start art', sw.includes('./src/runtime/first-presentation-director-v107.js') && !sw.includes('button_start.png')],
  ['dist preserves the presentation contract when present', !currentDist || (distHtml.includes('title-touch-start-v107') && distHtml.includes('BOOT_STALL_LIMIT_MS') && distMain.includes('FirstPresentationDirectorV107') && distDirector.includes("status: 'ready'"))],
  ['absolute art bible files are unchanged', artBibleUnchanged],
  ['runtime raster and 3D art bytes are unchanged', assetsUnchanged],
  ['no SVG file or runtime SVG construction was introduced', ![html, css, main, director, engine, staticBootstrap, buildStatic].some((source) => /<svg\b|createElementNS\([^)]*svg/i.test(source))]
];

let failed = 0;
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  if (!passed) failed += 1;
}
if (failed) process.exit(1);
console.log('\nv1.0.7 Touch Start and Non-Blocking Presentation contract verified');
