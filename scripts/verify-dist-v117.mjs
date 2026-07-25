import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { hasApprovalRuntimeMarkerV117, readJavaScriptBundleRecursive } from './bundle-scan-v119.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const requiredPublic = [
  'asset-approval-v117.html',
  'assets/visual-v117/asset-approval-manifest-v117.json',
  'assets/visual-v117/asset-approval-registry-v117.json',
  'assets/visual-v117/directional/guardian-ember-pupu-atlas-low-v117.webp',
  'assets/visual-v117/directional/guardian-ember-pupu-atlas-medium-v117.webp',
  'assets/visual-v117/directional/guardian-ember-pupu-atlas-high-v117.webp',
  'assets/visual-v117/citadel/guardian-citadel-critical-low-v117.webp'
];
for (const relative of requiredPublic) await access(path.join(dist, relative));
const manifest = JSON.parse(await readFile(path.join(dist, 'assets/visual-v117/asset-approval-manifest-v117.json'), 'utf8'));
if (manifest.version !== '1.0.17' || manifest.build !== 'b24.17') throw new Error('v1.0.17 approval manifest identity changed in dist');
if (manifest.summary?.directionalEntitiesApproved !== 1 || manifest.summary?.directionViewsApproved !== 11 || manifest.summary?.citadelStatesApproved !== 4) {
  throw new Error('v1.0.17 approved asset totals mismatch in dist');
}

let runtimeFound = false;
try {
  const source = await readFile(path.join(dist, 'src/runtime/asset-approval-pipeline-v117.js'), 'utf8');
  runtimeFound = hasApprovalRuntimeMarkerV117(source) || source.includes('createAssetApprovalReportV117');
} catch {
  const bundle = await readJavaScriptBundleRecursive(path.join(dist, 'assets'));
  if (!bundle.files.length) throw new Error('Vite JavaScript bundle is missing');
  runtimeFound = hasApprovalRuntimeMarkerV117(bundle.source);
}
if (!runtimeFound) throw new Error('v1.0.17 approval runtime marker is missing from static source or recursive Vite bundle');
console.log(`PASS v1.0.17 approved asset static deployment (${requiredPublic.length} public files + minifier-safe runtime marker)`);
