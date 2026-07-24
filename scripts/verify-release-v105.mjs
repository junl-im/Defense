import { createHash } from 'node:crypto';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const baseline = JSON.parse(read('scripts/patch-baselines/v1.0.4.json'));
const html = read('index.html');
const css = read('src/style.css');
const main = read('src/main.js');
const distHtml = read('dist/index.html');
const distCss = read('dist/src/style.css');
const policy = read('src/version-policy.js');
const sw = read('public/sw.js');

const artBibleFiles = ['src/art-style-tokens.js', 'docs/ABSOLUTE_ART_BIBLE_v2.0.md'];
const artBibleUnchanged = artBibleFiles.every((file) => baseline.files?.[file]?.sha256 === hash(file));
const assetsUnchanged = Object.entries(baseline.files || {})
  .filter(([file]) => file.startsWith('src/assets/') || file.startsWith('public/assets/'))
  .every(([file, meta]) => fs.existsSync(file) && meta.sha256 === hash(file));
const titleButtonAsset = 'public/assets/ip-v10/presentation/ui/button_start.png';
const startIdCount = (html.match(/id="start-btn"/g) || []).length;

const checks = [
  ['release identity is v1.0.5 / b24.5', pkg.version === '1.0.5' && pkg.dokkaebi?.releaseVersion === '1.0.5' && pkg.dokkaebi?.buildId === 'b24.5' && pkg.dokkaebi?.buildRevision === 5],
  ['package lock is synchronized', lock.version === pkg.version && lock.packages?.['']?.version === pkg.version],
  ['runtime and cache identities match', policy.includes("PUBLIC_GAME_VERSION = '1.0.5'") && policy.includes('BUILD_REVISION = 5') && main.includes("const GAME_VERSION = '1.0.5'") && sw.includes("RELEASE_VERSION = '1.0.5'") && sw.includes("BUILD_ID = 'b24.5'")],
  ['title has one guarded start control', startIdCount === 1 && html.includes('title-start-button-v105') && html.includes('id="title-start-label"')],
  ['title uses approved raster art only', html.includes('./assets/ip-v10/presentation/ui/button_start.png') && fs.existsSync(titleButtonAsset) && html.includes('title-mascot-v17.webp') && sw.includes('./assets/ip-v10/presentation/ui/button_start.png') && !html.includes('<svg')],
  ['desktop and mobile art compositions are independently declared', css.includes('title-bg-desktop-v17.webp?rev=release-v105-b24-5') && css.includes('title-bg-mobile-v17.webp?rev=release-v105-b24-5') && css.includes('@media (max-width: 900px), (orientation: portrait)')],
  ['full-poster title shell removes the old glass information card', css.includes('#title-screen.title-screen-v105') && css.includes('.title-panel-v105') && css.includes('background: none;') && css.includes('.title-brand-v105')],
  ['start label remains state-aware without replacing button art', main.includes("startLabel.textContent = '수호대 출전 준비 중...'") && main.includes("startLabel.textContent = '달빛 장터 수호 준비 완료'") && !main.includes("ui.start.textContent = '수호 시작'")],
  ['source and static title CSS match', hash('src/style.css') === hash('dist/src/style.css') && distHtml.includes('title-screen-v105')],
  ['art bible tokens remain byte-identical', artBibleUnchanged],
  ['existing raster and 3D art assets remain byte-identical', assetsUnchanged],
  ['title style changed intentionally from v1.0.4 baseline', baseline.files?.['src/style.css']?.sha256 !== hash('src/style.css')],
  ['no SVG file or runtime SVG construction was added', ![html, css, main].some((source) => /<svg\b|createElementNS\([^)]*svg/i.test(source))]
];

let failed = 0;
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  if (!passed) failed += 1;
}
if (failed) process.exit(1);
console.log('\nv1.0.5 Art Bible Title Shell contract verified');
