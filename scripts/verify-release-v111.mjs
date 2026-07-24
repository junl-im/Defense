import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const expectedVersion = '1.0.11';
const expectedBuildId = 'b24.11';
const expectedRevision = 11;
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => {
  if (!condition) failures.push(message);
  return condition;
};
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const hash = (file) => createHash('sha256').update(readFileSync(path.join(root, file))).digest('hex');

function filesRecursive(directory) {
  if (!existsSync(directory)) return [];
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...filesRecursive(full));
    else if (entry.isFile()) result.push(full);
  }
  return result;
}

const required = [
  'README.md',
  'PROJECT_HANDOFF.md',
  'package.json',
  'package-lock.json',
  'index.html',
  'src/main.js',
  'src/version-policy.js',
  'src/ip-knowledge-megabase-v4.js',
  'src/production-console.js',
  'src/style.css',
  'public/version.json',
  'public/sw.js',
  'public/static-bootstrap.js',
  'public/ip-mega-library-v4.html',
  'public/assets/ip-mega-v4/data/ip-mega-index-v4.json',
  'public/assets/ip-mega-v4/data/ip-mega-sample-v4.json',
  'public/assets/ip-mega-v4/reference/gameplay-key-visual-v4.webp',
  'public/assets/ip-mega-v4/reference/art-production-board-v4.webp',
  'production/DokkaebiDefense/14_IP_Knowledge_Megabase/IP_MEGA_INDEX_v4.0.0.json',
  'docs/IP_KNOWLEDGE_MEGAFORGE_v4.0.0.md',
  'docs/PATCH_NOTES_v1.0.11.md',
  'docs/PATCH_APPLY_v1.0.11.md',
  'docs/reference/IP_MEGA_GAMEPLAY_KEY_VISUAL_v4.0.0.jpg',
  'docs/reference/IP_MEGA_ART_PRODUCTION_BOARD_v4.0.0.jpg',
  'scripts/generate-ip-megabase-v4.mjs',
  'scripts/verify-ip-megabase-v4.mjs',
  'scripts/verify-release-v110.mjs',
  'scripts/verify-release-v111.mjs',
  'scripts/create-patch-v111.mjs',
  'scripts/verify-patch-v111.mjs',
  'scripts/patch-baselines/v1.0.10.json',
  'logs/README.md'
];
for (const file of required) check(existsSync(path.join(root, file)), `required v1.0.11 file missing: ${file}`);
if (!failures.length) pass('v1.0.11 source, documentation, viewer, reference and patch files exist');

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const policy = read('src/version-policy.js');
const main = read('src/main.js');
const html = read('index.html');
const sw = read('public/sw.js');
const staticBootstrap = read('public/static-bootstrap.js');
const staticBuilder = read('scripts/build-static-fallback.mjs');

check(pkg.version === expectedVersion, 'package version must be 1.0.11');
check(pkg.dokkaebi?.releaseVersion === expectedVersion && pkg.dokkaebi?.buildId === expectedBuildId && Number(pkg.dokkaebi?.buildRevision) === expectedRevision, 'package Dokkaebi release metadata mismatch');
check(lock.version === expectedVersion && lock.packages?.['']?.version === expectedVersion, 'package lock version mismatch');
check(lock.packages?.['']?.dokkaebi?.releaseVersion === expectedVersion && lock.packages?.['']?.dokkaebi?.buildId === expectedBuildId && Number(lock.packages?.['']?.dokkaebi?.buildRevision) === expectedRevision, 'package lock Dokkaebi metadata mismatch');
check(version.releaseVersion === expectedVersion && version.buildId === expectedBuildId && Number(version.buildRevision) === expectedRevision && version.cacheRevision === `${expectedVersion}-${expectedBuildId}`, 'public version metadata mismatch');
check(policy.includes(`PUBLIC_GAME_VERSION = '${expectedVersion}'`) && policy.includes(`BUILD_REVISION = ${expectedRevision}`), 'version policy mismatch');
check(main.includes(`const GAME_VERSION = '${expectedVersion}'`), 'runtime GAME_VERSION mismatch');
check(html.includes(`const RELEASE_VERSION = '${expectedVersion}'`) && html.includes(`const BUILD_ID = '${expectedBuildId}'`) && html.includes(`src="./src/bootstrap.js?v=${expectedVersion}-${expectedBuildId}"`), 'entry HTML release/cache identity mismatch');
check(sw.includes(`const RELEASE_VERSION = '${expectedVersion}'`) && sw.includes(`const BUILD_ID = '${expectedBuildId}'`), 'service worker identity mismatch');
check(staticBootstrap.includes(`const RELEASE_VERSION = '${expectedVersion}'`) && staticBootstrap.includes(`const BUILD_ID = '${expectedBuildId}'`), 'static bootstrap identity mismatch');
check(staticBuilder.includes(`const version = '${expectedVersion}'`) && staticBuilder.includes(`const buildId = '${expectedBuildId}'`) && staticBuilder.includes(`src/bootstrap.js?v=${expectedVersion}-${expectedBuildId}`), 'static builder identity mismatch');
if (!failures.length) pass('1.0.11 / b24.11 identity is synchronized across package, runtime, cache and static build');

const megaSource = read('src/ip-knowledge-megabase-v4.js');
const productionIndex = json('production/DokkaebiDefense/14_IP_Knowledge_Megabase/IP_MEGA_INDEX_v4.0.0.json');
const publicIndex = json('public/assets/ip-mega-v4/data/ip-mega-index-v4.json');
check(megaSource.includes("IP_KNOWLEDGE_MEGABASE_VERSION = '4.0.0'"), 'megabase source version mismatch');
for (const [token, count] of [
  ['heroes: 176', 176], ['guardians: 88', 88], ['monsters: 352', 352], ['bosses: 64', 64], ['towers: 176', 176],
  ['weapons: 512', 512], ['skills: 1024', 1024], ['vfx: 2048', 2048], ['ui: 1024', 1024], ['environment: 2048', 2048], ['audio: 680', 680]
]) check(megaSource.includes(token), `megabase base-count token missing: ${token} (${count})`);
check(megaSource.includes('baseAssets: 8192') && megaSource.includes('directionalMotion: 89232') && megaSource.includes('towerStateActions: 10560') && megaSource.includes('hudContracts: 480') && megaSource.includes('visualQaScenarios: 5040') && megaSource.includes('performanceProfiles: 960') && megaSource.includes('knowledgeRelations: 32768') && megaSource.includes('total: 147232'), 'megabase record-count constants are incomplete');
check(megaSource.includes('length: 11') && megaSource.includes('authored: true') && megaSource.includes('mirroringAllowed: false'), '11-direction authored/non-mirror policy missing');
check(megaSource.includes('finalArtApproved: 0') && megaSource.includes("knowledgeStatus: 'generated'") && megaSource.includes("finalArtStatus: 'planned'"), 'knowledge/final-art status separation missing');
for (const [label, index] of [['production', productionIndex], ['public', publicIndex]]) {
  check(index.megabaseVersion === '4.0.0', `${label} megabase version mismatch`);
  check(index.counts?.records?.baseAssets === 8192 && index.counts?.records?.total === 147232, `${label} megabase totals mismatch`);
  check(index.authoredDirectionPolicy?.directions === 11 && index.authoredDirectionPolicy?.mirrored === false && index.authoredDirectionPolicy?.authored === true, `${label} direction policy mismatch`);
  check(index.finalArtStatus?.approved === 0, `${label} final-art approval must remain 0`);
}
check(productionIndex.files?.length === 53, `production megabase inventory expected 53 tracked data files, got ${productionIndex.files?.length}`);
if (!failures.length) pass('IP Knowledge Megabase v4 counts, 11-direction policy and final-art separation are integrated');

const generator = read('scripts/generate-ip-megabase-v4.mjs');
check(generator.includes("const generatedAt = '2026-07-24T08:40:00.000Z'"), 'megabase generator timestamp must be deterministic');
check(generator.includes("process.argv.includes('--check')") && generator.includes('Stale generated file') && generator.includes('Missing generated file'), 'megabase generator check-mode stale detection missing');
check(generator.includes('calculatedTotal !== IP_KNOWLEDGE_RECORD_COUNTS.total'), 'megabase generator grand-total guard missing');
check(generator.includes('productionApproved: false') && generator.includes("artStatus: 'planned'") && generator.includes("knowledgeStatus: 'generated'"), 'megabase generator production status guards missing');
check(generator.includes("mirrored: false") && generator.includes("authored: true"), 'megabase motion generator authored/non-mirror guard missing');
if (!failures.length) pass('deterministic generation and stale-file verification contracts are present');

const consoleSource = read('src/production-console.js');
const css = read('src/style.css');
const viewer = read('public/ip-mega-library-v4.html');
check(html.includes('도깨비 IP 지식 자산 메가베이스 v4') && html.includes('147,232 레코드') && html.includes('./ip-mega-library-v4.html'), 'settings-screen megabase entry missing');
check(consoleSource.includes("from './ip-knowledge-megabase-v4.js'") && consoleSource.includes('IP MEGABASE') && consoleSource.includes('data-open-ip-mega-library') && consoleSource.includes('IP_KNOWLEDGE_LIBRARY_URL'), 'production console megabase card/link missing');
check(css.includes('.production-os-card button, .production-os-card a') && css.includes('text-decoration:none'), 'production console link styling missing');
check(viewer.includes('IP KNOWLEDGE MEGAFORGE v4.0.0') && viewer.includes('147,232') && viewer.includes('AUTHORED 11 / MIRROR 0'), 'megabase viewer identity/count/direction labels missing');
check(viewer.includes('ip-mega-index-v4.json') && viewer.includes('ip-mega-sample-v4.json'), 'megabase viewer data endpoints missing');
check(/Knowledge generation and final art approval are tracked separately|final art approval|final-art/i.test(viewer), 'megabase viewer must distinguish knowledge from final art');
check(statSync(path.join(root, 'public/assets/ip-mega-v4/reference/gameplay-key-visual-v4.webp')).size > 100000 && statSync(path.join(root, 'public/assets/ip-mega-v4/reference/art-production-board-v4.webp')).size > 100000, 'megabase reference WebP files are missing or unexpectedly small');
if (!failures.length) pass('game settings, production console, browser library and reference art are connected');

const expectedPrecache = [
  './src/ip-knowledge-megabase-v4.js',
  './ip-mega-library-v4.html',
  './assets/ip-mega-v4/data/ip-mega-index-v4.json',
  './assets/ip-mega-v4/data/ip-mega-sample-v4.json',
  './assets/ip-mega-v4/reference/gameplay-key-visual-v4.webp',
  './assets/ip-mega-v4/reference/art-production-board-v4.webp'
];
for (const asset of expectedPrecache) check(sw.includes(`'${asset}'`), `service worker megabase precache missing: ${asset}`);
if (!failures.length) pass('service worker precaches the megabase source, viewer, data and reference images');

const baseline = json('scripts/patch-baselines/v1.0.10.json');
check(baseline.version === '1.0.10', 'v1.0.10 patch baseline version mismatch');
const protectedFiles = ['src/art-style-tokens.js', 'docs/ABSOLUTE_ART_BIBLE_v2.0.md'];
for (const file of protectedFiles) {
  check(baseline.files?.[file]?.sha256 === hash(file), `protected art bible file changed: ${file}`);
}
const baselineArt = Object.entries(baseline.files || {}).filter(([file]) => {
  if (file.startsWith('public/assets/ip-mega-v4/') || file.startsWith('dist/assets/ip-mega-v4/')) return false;
  return file.startsWith('src/assets/') || file.startsWith('public/assets/') || file.startsWith('dist/src/assets/') || file.startsWith('dist/assets/');
});
for (const [file, meta] of baselineArt) {
  check(existsSync(path.join(root, file)), `pre-v1.0.11 art file missing: ${file}`);
  if (existsSync(path.join(root, file))) check(hash(file) === meta.sha256, `pre-v1.0.11 art bytes changed: ${file}`);
}
if (!failures.length) pass(`absolute art bible and ${baselineArt.length.toLocaleString()} pre-v1.0.11 art files remain byte-identical`);

const sourcePolicy = [html, css, main, consoleSource, sw, staticBootstrap, viewer].join('\n');
check(!/<svg\b|createElementNS\([^)]*svg/i.test(sourcePolicy), 'runtime SVG markup/construction introduced in v1.0.11 integration');
const megabaseSvg = [
  ...filesRecursive(path.join(root, 'public/assets/ip-mega-v4')),
  ...filesRecursive(path.join(root, 'production/DokkaebiDefense/14_IP_Knowledge_Megabase'))
].filter((file) => file.toLowerCase().endsWith('.svg'));
check(megabaseSvg.length === 0, `SVG files found in megabase output: ${megabaseSvg.map((file) => path.relative(root, file)).join(', ')}`);
if (!failures.length) pass('v1.0.11 integration preserves the no-SVG production policy');

const distVersionPath = path.join(root, 'dist/version.json');
let currentDist = false;
if (existsSync(distVersionPath)) {
  try {
    const distVersion = JSON.parse(readFileSync(distVersionPath, 'utf8'));
    currentDist = distVersion.releaseVersion === expectedVersion && distVersion.buildId === expectedBuildId;
  } catch {
    failures.push('dist/version.json is invalid JSON');
  }
}
if (currentDist) {
  const distRequired = [
    'dist/index.html',
    'dist/src/main.js',
    'dist/src/ip-knowledge-megabase-v4.js',
    'dist/ip-mega-library-v4.html',
    'dist/assets/ip-mega-v4/data/ip-mega-index-v4.json',
    'dist/assets/ip-mega-v4/data/ip-mega-sample-v4.json',
    'dist/assets/ip-mega-v4/reference/gameplay-key-visual-v4.webp',
    'dist/assets/ip-mega-v4/reference/art-production-board-v4.webp'
  ];
  for (const file of distRequired) check(existsSync(path.join(root, file)), `current dist missing v1.0.11 file: ${file}`);
  if (existsSync(path.join(root, 'dist/index.html'))) {
    const distHtml = read('dist/index.html');
    check(distHtml.includes(`static-bootstrap.js?v=${expectedVersion}-${expectedBuildId}`), 'current dist cache revision mismatch');
    check(distHtml.includes('ip-mega-library-v4.html'), 'current dist settings link missing');
  }
  if (existsSync(path.join(root, 'dist/src/ip-knowledge-megabase-v4.js'))) {
    const distMega = read('dist/src/ip-knowledge-megabase-v4.js');
    check(distMega.includes('total: 147232') && distMega.includes('finalArtApproved: 0'), 'current dist megabase source mismatch');
  }
  if (!failures.length) pass('current static dist contains the v1.0.11 megabase runtime and reference data');
} else {
  pass('stale or absent dist ignored until npm run build:static creates v1.0.11 output');
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\nv1.0.11 release verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log('\nv1.0.11 IP Knowledge Megaforge release contract verified (8,192 base assets / 147,232 knowledge records / final-art approvals 0).');
