import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { V152_DELETED_PATHS, V152_PATCH_FILES } from './v152-patch-files.mjs';
const root = path.resolve(import.meta.dirname, '..');
const patchRoot = path.join(root, 'logs/patch/1.0.52-r7');
const directRoot = path.join(patchRoot, 'project-root');
const manifest = JSON.parse(fs.readFileSync(path.join(patchRoot, 'PATCH_MANIFEST_R7.json'), 'utf8'));
if (manifest.id !== 'DD-PROJECT-ROOT-PATCH-V152-R7' || manifest.repairRevision !== 7 || manifest.baseVersion !== '1.0.52' || !manifest.compatibleBaseVersions?.includes('1.0.51') || !manifest.compatibleBaseVersions?.includes('1.0.52') || manifest.targetVersion !== '1.0.52' || manifest.buildId !== 'b24.52' || manifest.applyMode !== 'project-root-direct-overlay') throw new Error('v152 R7 patch identity mismatch');
if (!/^[a-f0-9]{64}$/.test(manifest.baseZipSha256 || '') || !/^[a-f0-9]{64}$/.test(manifest.aggregateSha256 || '')) throw new Error('v152 R7 patch provenance hash missing');
if (manifest.targetFullZipSha256 !== 'PENDING_EXTERNAL_PACKAGE' && !/^[a-f0-9]{64}$/.test(manifest.targetFullZipSha256 || '')) throw new Error('v152 R7 full ZIP hash invalid');
const sha = (data) => createHash('sha256').update(data).digest('hex');
const paths = new Set();
for (const entry of manifest.files || []) {
  if (paths.has(entry.path)) throw new Error(`duplicate patch path ${entry.path}`);
  paths.add(entry.path);
  const file = path.join(directRoot, entry.path);
  if (!fs.existsSync(file)) throw new Error(`patch file missing ${entry.path}`);
  const data = fs.readFileSync(file);
  if (data.length !== entry.bytes || sha(data) !== entry.sha256) throw new Error(`patch hash mismatch ${entry.path}`);
}
const walk = (directory, prefix = '') => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
  return entry.isDirectory() ? walk(path.join(directory, entry.name), rel) : [rel];
});
const actualFiles = walk(directRoot).sort();
if (actualFiles.length !== paths.size || actualFiles.some((file) => !paths.has(file))) throw new Error('v152 R7 direct-root contains unmanifested files');
if (actualFiles.some((file) => file === 'overlay' || file.startsWith('overlay/') || ['PATCH_MANIFEST.json','README_PATCH.txt','DELETE_PATHS.txt','APPLY_KO.txt'].includes(file))) throw new Error('v152 R7 ZIP layout contains wrapper or metadata entry');
const aggregate = sha(Buffer.from(manifest.files.map((entry) => `${entry.path}\0${entry.bytes}\0${entry.sha256}`).join('\n')));
if (aggregate !== manifest.aggregateSha256) throw new Error('v152 R7 patch aggregate hash mismatch');
if (paths.size !== V152_PATCH_FILES.length || V152_PATCH_FILES.some((file) => !paths.has(file))) throw new Error('v152 R7 patch list mismatch');
if (manifest.counts.changed !== V152_PATCH_FILES.length || manifest.counts.deleted !== V152_DELETED_PATHS.length) throw new Error('v152 R7 patch counts mismatch');
for (const required of ['package.json', '.github/workflows/deploy.yml', 'scripts/verify-dist-v146.mjs', 'scripts/save-continuity-v147.mjs', 'scripts/offline-reconnect-model-v147.mjs', 'scripts/verify-offline-reconnect-v147.mjs', 'scripts/run-offline-reconnect-v147.mjs', 'scripts/verify-release-v147.mjs', 'scripts/verify-service-worker-install-v152.mjs', 'scripts/lib/dist-bundle-markers.mjs', 'scripts/verify-dist-bundle-markers-v152.mjs', 'scripts/verify-dist-v148.mjs', 'scripts/verify-dist-v149.mjs', 'scripts/run-feature-exposure-v149.mjs', 'scripts/verify-feature-exposure-v149.mjs', 'src/runtime/feature-exposure-policy-v149.js', 'scripts/verify-dist-v150.mjs', 'scripts/verify-dist-v151.mjs', 'scripts/verify-dist-v152.mjs', 'scripts/verify-responsibility-extraction-v149.mjs', 'scripts/verify-performance-reproducibility-v149.mjs', 'scripts/verify-release-v152.mjs', 'scripts/verify-repository-root-v152.mjs', 'src/main.js', 'PROJECT_HANDOFF.md']) if (!paths.has(required)) throw new Error(`v152 R7 patch contract file missing ${required}`);
console.log(`PASS v1.0.52 CI hotfix R7 project-root patch with SHA-256 verification (${paths.size} files; no wrapper/metadata entries)`);
