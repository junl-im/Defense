import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { hasApprovalRuntimeMarkerV117, readJavaScriptBundleRecursive } from './bundle-scan-v119.mjs';
const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const releaseVersion = packageJson.version;
const buildId = packageJson.dokkaebi?.buildId || '';
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
if (/cdn\.jsdelivr\.net\/npm\/three|unpkg\.com\/three|esm\.sh\/three/.test(html)) throw new Error('production bundle still depends on an external Three.js CDN');
const bundle = await readJavaScriptBundleRecursive(path.join(dist, 'assets'));
if (!bundle.files.length) throw new Error('Vite JavaScript bundle is missing');
if (!html.includes('type="module"') || !html.includes('/assets/')) throw new Error('Vite module entry is missing from production HTML');
if (!hasApprovalRuntimeMarkerV117(bundle.source)) throw new Error('v1.0.17 minifier-safe approval runtime marker is missing from recursive Vite bundle');
if (!bundle.source.includes('DD-STATIC-DEPLOYMENT-GATE-V118')) throw new Error('v1.0.18 deployment gate is missing from Vite bundle');
if (!bundle.source.includes('DD-BUNDLE-MARKER-GATE-V119')) throw new Error('v1.0.19 bundle marker gate is missing from Vite bundle');
if (!bundle.source.includes('DD-HERO-HUD-POLISH-V120')) throw new Error('v1.0.20 hero/HUD polish marker is missing from Vite bundle');
for (const relative of [
  'asset-approval-v117.html',
  'assets/visual-v117/asset-approval-manifest-v117.json',
  'assets/visual-v117/asset-approval-registry-v117.json',
  'assets/visual-v117/directional/guardian-ember-pupu-atlas-low-v117.webp',
  'assets/visual-v117/citadel/guardian-citadel-critical-low-v117.webp'
]) await access(path.join(dist, relative));
await access(path.join(dist, 'sw.js'));
await access(path.join(dist, 'version.json'));
const sw = await readFile(path.join(dist, 'sw.js'), 'utf8');
if (!sw.includes(`RELEASE_VERSION = '${releaseVersion}'`) || !sw.includes(`BUILD_ID = '${buildId}'`)) throw new Error('service worker release/build identity is missing');
console.log(`PASS v${releaseVersion} production bundle is self-contained (${bundle.files.length} recursive JavaScript assets)`);
