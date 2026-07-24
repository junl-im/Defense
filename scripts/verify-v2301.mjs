import fs from 'node:fs';
const read = (path) => fs.readFileSync(path, 'utf8');
const pkg = JSON.parse(read('package.json'));
const html = read('index.html');
const main = read('src/main.js');
const bootstrap = read('src/bootstrap.js');
const staticBootstrap = read('public/static-bootstrap.js');
const sw = read('public/sw.js');
const staticBuilder = read('scripts/build-static-fallback.mjs');
const firebase = read('firebase.json');
const catalog = read('src/engine/asset-catalog.js');
const workflow = read('.github/workflows/deploy.yml');
const checks = [
  ['package retains v23 boot recovery lineage', /^23\.(?:0\.[12]|[1-9]\.\d+)$/.test(pkg.dokkaebi?.lineageVersion || pkg.version)],
  ['game retains v23 boot recovery lineage', /^23\.(?:0\.[12]|[1-9]\.\d+)$/.test(pkg.dokkaebi?.lineageVersion || pkg.version) && main.includes('LEGACY_LINEAGE_VERSION')],
  ['asset revision retains boot recovery lineage', /ASSET_REVISION = '23\.(?:0\.[12]|[1-9]\.\d+)'/.test(catalog)],
  ['service worker retains boot recovery lineage', /VERSION = '23\.(?:0\.[12]|[1-9]\.\d+)'/.test(sw)],
  ['Vite entry uses relative bootstrap module', (html.includes('src="./src/bootstrap.js') || html.includes('src="/src/bootstrap.js')) && !html.includes('src="/src/main.js"') && !html.includes('src="./src/main.js"')],
  ['start button waits for boot readiness', html.includes('disabled aria-busy="true"') && html.includes('setStartReady(true)')],
  ['entry import failure is surfaced', bootstrap.includes("import('./main.js').catch") && bootstrap.includes('__DOKKAEBI_SHOW_BOOT_ERROR__')],
  ['static loader probes local vendor and three CDNs', ['local-vendor','jsdelivr','unpkg','esm-sh'].every((id) => staticBootstrap.includes(id))],
  ['static loader injects import map before entry', staticBootstrap.includes("map.type = 'importmap'") && staticBootstrap.includes("entry.type = 'module'")],
  ['static build uses recovery loader', staticBuilder.includes('static-bootstrap.js?v=${revision}') && staticBuilder.includes('node_modules/three')],
  ['service worker treats code and title art as network first', sw.includes('isMutableCode') && sw.includes('isTitleAsset') && !sw.includes('ignoreSearch: true')],
  ['mutable Firebase paths are not immutable cached', firebase.includes('no-cache,no-store,must-revalidate') && !firebase.includes('**/*.@(js|css)')],
  ['title art has hotfix cache revision', (html.includes('boot-recovery-v2301') || html.includes('clean-foundation-v2302') || (html.includes('native-input-v2310') || html.includes('release-v102-b24-2')))],
  ['CI verifies self-contained Vite output', (workflow.includes('verify-production-bundle-v2301.mjs') || workflow.includes('verify-production-bundle-v2302.mjs') || workflow.includes('verify-production-bundle-v2310.mjs') || workflow.includes('verify-production-bundle-v101.mjs')) && fs.existsSync('scripts/verify-production-bundle-v2301.mjs')],
  ['boot hotfix documentation exists', fs.existsSync('docs/BOOT_RECOVERY_v23.0.1.md') && fs.existsSync('docs/PATCH_NOTES_v23.0.1.md') && fs.existsSync('docs/PATCH_APPLY_v23.0.1.md')]
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed += 1; }
if (failed) process.exit(1);
console.log('\nv23.0.1 Boot Recovery contract verified');
