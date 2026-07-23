import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ENGINE_VERSION } from '../src/engine/engine-config.js';
import { SAVE_SCHEMA_VERSION } from '../src/runtime/save-schema.js';
import BrowserReliabilityLab, { BROWSER_RELIABILITY_VERSION, BROWSER_RELIABILITY_STORAGE_KEY } from '../src/runtime/browser-reliability-lab.js';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const pkg = JSON.parse(read('package.json'));
const main = read('src/main.js');
const html = read('index.html');
const sw = read('public/sw.js');
const consoleSource = read('src/production-console.js');
const saveSchema = read('src/runtime/save-schema.js');
const atlasV14Generator = read('scripts/generate-runtime-atlases-v14.py');
const atlasV15Generator = read('scripts/generate-runtime-atlases-v15.py');
const deployWorkflow = read('.github/workflows/deploy.yml');
let failures = 0;
const check = (condition, message) => condition ? console.log(`PASS ${message}`) : (failures += 1, console.error(`FAIL ${message}`));

check(Number(pkg.version.split('.')[0]) >= 19, 'package version 19.0.0 or later');
check(/const GAME_VERSION = '(?:19|20|21|22|23)\.0\.0'/.test(main), 'runtime game version 19.0.0 or later');
check(Number(ENGINE_VERSION.split('.')[0]) >= 16, 'engine version 16.0.0 or later');
check(SAVE_SCHEMA_VERSION >= 17, 'save schema version 17 or later');
check(BROWSER_RELIABILITY_VERSION === '19.0.0', 'browser reliability version 19.0.0');
check(saveSchema.includes(BROWSER_RELIABILITY_STORAGE_KEY), 'browser reliability report is backed up by save migration');

const storage = new Map();
const adapter = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)) };
const lab = new BrowserReliabilityLab({ storage: adapter, sampleSeconds: .1 });
lab.update(.2, { fps: 60, renderer: { drawCalls: 24, triangles: 12000, textures: 8 }, counts: { enemies: 6, units: 4, projectiles: 2, particles: 12 } });
lab.noteMilestone('verification', { passed: true });
lab.persist();
check(lab.diagnostics.samples >= 1 && lab.diagnostics.unhandledErrors === 0, 'browser lab samples runtime health without browser globals');
check(storage.has(BROWSER_RELIABILITY_STORAGE_KEY), 'browser lab persists a diagnostic report');

check(/const VERSION = '(?:19|20|21|22|23)\.0\.0'/.test(sw), 'service worker version 19.0.0 or later');
check(sw.includes("const CACHE_NAME = `${CACHE_PREFIX}v${VERSION}`"), 'service worker uses a versioned shell cache');
check(sw.includes('DOKKAEBI_GET_VERSION') && sw.includes('DOKKAEBI_PURGE'), 'service worker exposes version and repair messages');
check(sw.includes("request.mode === 'navigate'") && sw.includes('ignoreSearch: true'), 'service worker has navigation and immutable asset recovery paths');
check(!sw.includes('client.navigate(') && !sw.includes('registration.unregister()'), 'service worker no longer forces reload or unregister loops');

check(/const VERSION = '(?:19|20|21|22|23)\.0\.0'/.test(html), 'boot coordinator version 19.0.0 or later');
check(html.includes('navigator.serviceWorker.register') && html.includes('updateViaCache'), 'boot coordinator registers and actively updates the service worker');
check(html.includes('__DOKKAEBI_BOOT_DIAGNOSTICS__'), 'boot coordinator publishes cache diagnostics');
check(!html.includes("if ('serviceWorker' in navigator || 'caches' in window) clearLegacyCaches()"), 'normal boot does not wipe all caches');
check(main.includes('this.browserReliability = new BrowserReliabilityLab'), 'runtime instantiates browser reliability lab');
check(main.includes("this.runSafe('browser-reliability'"), 'runtime samples browser reliability in the frame loop');
check(main.includes('__DOKKAEBI_TEST_API__') && main.includes('getBrowserAutomationSnapshot'), 'browser automation API is exposed after boot');
check(main.includes('handleWebGLRecovery') && main.includes('dokkaebi:webgl-recovery'), 'WebGL context loss and restore are isolated');
check(main.includes('browserReliability: this.browserReliability?.report'), 'combined diagnostic export contains browser reliability report');
check(consoleSource.includes('BROWSER LAB') && consoleSource.includes('browserReliability'), 'production console exposes browser reliability diagnostics');

const docs = [
  'public/browser-lab-v19.html',
  'scripts/run-browser-reliability-lab-v19.mjs',
  'docs/BROWSER_RELIABILITY_LAB_v19.0.0.md',
  'docs/PATCH_NOTES_v19.0.0.md',
  'docs/PATCH_APPLY_v19.0.0.md',
  'docs/NEXT_PATCH_LINEUP_v19.x.md',
  'docs/CI_ATLAS_CHECK_HOTFIX_v19.0.0.md'
];
check(docs.every((path) => existsSync(resolve(root, path))), 'v19 browser lab, operating and patch documents exist');
check(pkg.scripts['browserlab:v1900']?.includes('run-browser-reliability-lab-v19.mjs'), 'browser lab execution command exists');
check(!/^(from PIL|import cv2|import numpy)/m.test(atlasV14Generator), 'v14 atlas check has no eager third-party image imports');
check(!/^(from PIL|import cv2|import numpy)/m.test(atlasV15Generator), 'v15 atlas check has no eager third-party image imports');
check(atlasV14Generator.includes('if not check:\n        require_image_dependencies()'), 'v14 loads image tooling only for regeneration');
check(atlasV15Generator.includes('if not check:\n        require_image_dependencies()'), 'v15 loads image tooling only for regeneration');
check(existsSync(resolve(root, 'requirements-atlas.txt')), 'optional atlas regeneration requirements are documented');
check(deployWorkflow.includes('actions/setup-python@v5') && deployWorkflow.includes('python -S scripts/generate-runtime-atlases-v14.py --check'), 'CI pins Python and proves dependency-free atlas checks');
check(pkg.scripts['setup:atlas-python']?.includes('requirements-atlas.txt'), 'optional atlas dependency setup command exists');

if (failures) {
  console.error(`\nFAIL v19.0.0 Browser Reliability Lab contract ${failures}`);
  process.exit(1);
}
console.log('\nv19.0.0 Browser Reliability Lab contract verified');
