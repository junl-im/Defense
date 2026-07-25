import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { readJavaScriptBundleRecursive } from './bundle-scan-v119.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = JSON.parse(await readFile(path.join(dist, 'version.json'), 'utf8'));
if (version.releaseVersion !== pkg.version || version.buildId !== pkg.dokkaebi?.buildId) throw new Error('dist identity does not match current package metadata');
const sw = await readFile(path.join(dist, 'sw.js'), 'utf8');
if (!sw.includes(`RELEASE_VERSION = '${pkg.version}'`) || !sw.includes(`BUILD_ID = '${pkg.dokkaebi?.buildId}'`)) throw new Error('dist service worker identity mismatch');
let gateFound = false;
try {
  const source = await readFile(path.join(dist, 'src/runtime/static-deployment-gate-v118.js'), 'utf8');
  gateFound = source.includes('DD-STATIC-DEPLOYMENT-GATE-V118');
} catch {
  const bundle = await readJavaScriptBundleRecursive(path.join(dist, 'assets'));
  gateFound = bundle.source.includes('DD-STATIC-DEPLOYMENT-GATE-V118');
}
if (!gateFound) throw new Error('v1.0.18 deployment gate is missing from static source or recursive Vite bundle');
await access(path.join(dist, 'asset-approval-v117.html'));
console.log(`PASS v1.0.18 inherited post-build deployment gate under current release ${pkg.version}`);
