import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = JSON.parse(await readFile(path.join(dist, 'version.json'), 'utf8'));
if (pkg.version !== '1.0.18' || pkg.dokkaebi?.buildId !== 'b24.18') throw new Error('source identity is not v1.0.18 / b24.18');
if (version.releaseVersion !== pkg.version || version.buildId !== pkg.dokkaebi.buildId) throw new Error('dist identity does not match package metadata');
const sw = await readFile(path.join(dist, 'sw.js'), 'utf8');
if (!sw.includes("RELEASE_VERSION = '1.0.18'") || !sw.includes("BUILD_ID = 'b24.18'")) throw new Error('dist service worker identity mismatch');
if (!sw.includes("'./src/runtime/static-deployment-gate-v118.js'")) throw new Error('v1.0.18 deployment gate missing from service worker');

let gateFound = false;
try {
  const source = await readFile(path.join(dist, 'src/runtime/static-deployment-gate-v118.js'), 'utf8');
  gateFound = source.includes('DD-STATIC-DEPLOYMENT-GATE-V118');
} catch {
  const assetDir = path.join(dist, 'assets');
  const files = await readdir(assetDir);
  const jsFiles = files.filter((name) => name.endsWith('.js'));
  const bundle = (await Promise.all(jsFiles.map((name) => readFile(path.join(assetDir, name), 'utf8')))).join('\n');
  gateFound = bundle.includes('DD-STATIC-DEPLOYMENT-GATE-V118') || bundle.includes('createStaticDeploymentGateReportV118');
}
if (!gateFound) throw new Error('v1.0.18 deployment gate is missing from static source or Vite bundle');
await access(path.join(dist, 'asset-approval-v117.html'));
console.log('PASS v1.0.18 post-build deployment gate, identity and approval viewer');
