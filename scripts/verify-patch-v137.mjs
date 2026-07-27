import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outputRoot = path.join(root, 'logs/patch/1.0.37');
const applyRoot = path.join(outputRoot, 'APPLY_TO_PROJECT_ROOT');
const manifestPath = path.join(outputRoot, 'PATCH_MANIFEST.json');
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
check(fs.existsSync(manifestPath), 'patch manifest exists');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  check(manifest.baseVersion === '1.0.36' && manifest.targetVersion === '1.0.37' && manifest.buildId === 'b24.37', 'patch identity');
  check(manifest.marker === 'DD-CI-DIST-CONTRACT-V137', 'patch marker');
  check(manifest.counts?.changed === manifest.files?.length && manifest.counts?.deleted === 1, 'patch counts');
  check(manifest.deletedPaths?.includes('dist/'), 'stale dist deletion');
  check(manifest.assurance?.viteAssetEmissionSupported && manifest.assurance?.staticFallbackSupported && manifest.assurance?.sourceToDistSha256Verified, 'patch assurance');
  for (const entry of manifest.files || []) {
    const staged = path.join(applyRoot, entry.path);
    check(fs.existsSync(staged), `staged file ${entry.path}`);
    if (fs.existsSync(staged)) {
      const data = fs.readFileSync(staged);
      check(data.length === entry.bytes && sha256(data) === entry.sha256, `staged hash ${entry.path}`);
    }
  }
  check(manifest.files?.some((entry) => entry.path === 'scripts/lib/verify-dist-asset-reference.mjs'), 'shared dist asset verifier included');
  check(manifest.files?.some((entry) => entry.path === '.github/workflows/deploy.yml'), 'workflow included');
  check(manifest.files?.some((entry) => entry.path === 'PROJECT_HANDOFF.md'), 'handoff included');
}
for (const helper of ['README_PATCH.txt', 'DELETE_LIST.txt', 'PATCH_CONTENT_SHA256.txt', 'APPLY_PATCH_WINDOWS.bat', 'APPLY_PATCH_MAC_LINUX.sh']) check(fs.existsSync(path.join(outputRoot, helper)), `patch helper ${helper}`);
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.37 patch manifest, file hashes, delete contract, and handoff verified');
