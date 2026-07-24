import { createHash } from 'node:crypto';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const baseline = JSON.parse(read('scripts/patch-baselines/v1.0.7.json'));
const html = read('index.html');
const css = read('src/style.css');
const main = read('src/main.js');
const policy = read('src/version-policy.js');
const sw = read('public/sw.js');
const staticBootstrap = read('public/static-bootstrap.js');
const buildStatic = read('scripts/build-static-fallback.mjs');
const hasDist = fs.existsSync('dist/index.html') && fs.existsSync('dist/src/main.js') && fs.existsSync('dist/src/style.css');
const distHtml = hasDist ? read('dist/index.html') : '';
const distMain = hasDist ? read('dist/src/main.js') : '';
const distCss = hasDist ? read('dist/src/style.css') : '';
const version = pkg.dokkaebi?.releaseVersion;
const buildId = pkg.dokkaebi?.buildId;
const buildRevision = pkg.dokkaebi?.buildRevision;
const release = String(pkg.version || '0.0.0').split('.').map(Number);
const is108OrLater = release[0] === 1 && release[1] === 0 && release[2] >= 8;
const currentDist = hasDist && distHtml.includes(`${version}-${buildId}`);

const protectedFiles = ['src/art-style-tokens.js', 'docs/ABSOLUTE_ART_BIBLE_v2.0.md'];
const artBibleUnchanged = protectedFiles.every((file) => baseline.files?.[file]?.sha256 === hash(file));
const assetsUnchanged = Object.entries(baseline.files || {})
  .filter(([file]) => file.startsWith('src/assets/') || file.startsWith('public/assets/'))
  .every(([file, meta]) => fs.existsSync(file) && meta.sha256 === hash(file));

const hiddenSelector = '#title-screen.title-screen-v17:not(.visible)';
const hiddenContractIndex = css.lastIndexOf(hiddenSelector);
const unconditionalTitleDisplayIndex = Math.max(
  css.lastIndexOf('#title-screen.title-screen-v17 { display:grid'),
  css.lastIndexOf('#title-screen.title-screen-v105 {')
);

const checks = [
  ['release preserves the v1.0.8 line or later', is108OrLater && version === pkg.version && Number(buildRevision) >= 8],
  ['package lock identity and metadata are synchronized', lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.releaseVersion === pkg.version && Number(lock.packages?.['']?.dokkaebi?.buildRevision) >= 8],
  ['runtime and cache identities match', policy.includes(`PUBLIC_GAME_VERSION = '${version}'`) && policy.includes(`BUILD_REVISION = ${buildRevision}`) && main.includes(`const GAME_VERSION = '${version}'`) && html.includes(`RELEASE_VERSION = '${version}'`) && sw.includes(`RELEASE_VERSION = '${version}'`) && sw.includes(`BUILD_ID = '${buildId}'`) && staticBootstrap.includes(`RELEASE_VERSION = '${version}'`)],
  ['title screen is forcibly removed when visible state is absent', hiddenContractIndex >= 0 && css.includes('display: none !important;') && css.includes('#title-screen.title-screen-v105:not(.visible)') && css.includes('#title-screen.title-screen-v17.visible') && hiddenContractIndex > unconditionalTitleDisplayIndex],
  ['title start transition yields a painted loading shell before world rebuild', main.includes('async startRunFromTitle') && main.includes("ui.loading?.classList.add('visible', 'run-entry-loading-v108')") && main.includes('await this.waitForUiPaint(2, 900)') && main.indexOf('await this.waitForUiPaint(2, 900)') < main.indexOf('this.startRun({ reuseSeed });')],
  ['stuck title copy is removed and transition copy is user-facing', !main.includes('수호대 출전 준비 중...') && main.includes('월문을 여는 중...') && main.includes('수호대를 전장으로 부르는 중...')],
  ['successful entry keeps the title hidden and failed entry restores it', main.includes("if (this.state === 'playing')") && main.includes("ui.title?.setAttribute('aria-hidden', 'true')") && main.includes("ui.title?.setAttribute('aria-hidden', 'false')")],
  ['browser automation awaits asynchronous title entry', main.includes('startRun: async () =>') && main.includes('await game.startRunFromTitle()')],
  ['desktop combat UI is lowered without changing mobile HUD coordinates', css.includes('--desktop-combat-ui-drop-v108: 12px') && css.includes('@media (min-width: 821px)') && css.includes('body:not(.mobile-hud-v23) #hud') && css.includes('body:not(.mobile-hud-v23) .top-status-rail') && css.includes('body:not(.mobile-hud-v23) .left-insight-rail')],
  ['static builder emits current entry identity', buildStatic.includes(`const version = '${version}'`) && buildStatic.includes(`const buildId = '${buildId}'`) && buildStatic.includes(`src="./src/bootstrap.js?v=${version}-${buildId}"`)],
  ['dist preserves entry recovery and desktop placement when present', !currentDist || (distHtml.includes(`${version}-${buildId}`) && distMain.includes('run-entry-loading-v108') && distCss.includes(hiddenSelector) && distCss.includes('--desktop-combat-ui-drop-v108'))],
  ['absolute art bible files are unchanged', artBibleUnchanged],
  ['runtime raster and 3D art bytes are unchanged', assetsUnchanged],
  ['no SVG file or runtime SVG construction was introduced', ![html, css, main, staticBootstrap, buildStatic].some((source) => /<svg\b|createElementNS\([^)]*svg/i.test(source))]
];

let failed = 0;
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  if (!passed) failed += 1;
}
if (failed) process.exit(1);
console.log('\nv1.0.8 Title Exit and Desktop UI Balance contract verified');
