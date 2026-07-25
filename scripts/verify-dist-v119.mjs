import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { hasApprovalRuntimeMarkerV117, readJavaScriptBundleRecursive } from './bundle-scan-v119.mjs';
const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const distVersion = JSON.parse(await readFile(path.join(root, 'dist/version.json'), 'utf8'));
if (distVersion.releaseVersion !== pkg.version || distVersion.buildId !== pkg.dokkaebi?.buildId) throw new Error('v1.0.19 dist identity mismatch');
let source = '';
try { source = await readFile(path.join(root, 'dist/src/runtime/bundle-marker-gate-v119.js'), 'utf8'); }
catch { source = (await readJavaScriptBundleRecursive(path.join(root, 'dist/assets'))).source; }
if (!source.includes('DD-BUNDLE-MARKER-GATE-V119')) throw new Error('v1.0.19 bundle marker gate is missing from dist');
if (!hasApprovalRuntimeMarkerV117(source)) {
  const all = (await readJavaScriptBundleRecursive(path.join(root, 'dist/assets'))).source;
  if (!hasApprovalRuntimeMarkerV117(all)) throw new Error('v1.0.17 stable approval marker is missing from dist bundle');
}
console.log('PASS v1.0.19 recursive bundle marker deployment gate');
