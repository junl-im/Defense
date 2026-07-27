import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const baseVersion = '1.0.38';
const targetVersion = '1.0.39';
const buildId = 'b24.39';
const outputRoot = path.join(root, 'logs/patch', targetVersion);
const overlayRoot = path.join(outputRoot, 'overlay');
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const changedPaths = [
  '.github/workflows/deploy.yml',
  'README.md',
  'PROJECT_HANDOFF.md',
  'package.json',
  'package-lock.json',
  'index.html',
  'src/main.js',
  'src/version-policy.js',
  'public/version.json',
  'public/sw.js',
  'public/static-bootstrap.js',
  'public/assets/system-v135/runtime-module-shell-v135.json',
  'scripts/lib/verify-dist-v134-foundation.mjs',
  'scripts/verify-dist-v134.mjs',
  'scripts/verify-dist-v135.mjs',
  'scripts/verify-dist-v136.mjs',
  'scripts/audit-dist-verifier-portability-v139.mjs',
  'scripts/verify-release-v138.mjs',
  'scripts/verify-dist-v138.mjs',
  'scripts/verify-release-v139.mjs',
  'scripts/verify-dist-v139.mjs',
  'scripts/stage-clean-package-v139.mjs',
  'scripts/verify-clean-package-v139.mjs',
  'scripts/create-patch-v139.mjs',
  'scripts/verify-patch-v139.mjs',
  'docs/CI_DIST_PORTABILITY_CONTRACT_v1.0.39.md',
  'docs/PATCH_NOTES_v1.0.39.md',
  'docs/PATCH_APPLY_v1.0.39.md',
  'docs/NEXT_UPDATE_v1.0.40.md'
].sort();
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== targetVersion || pkg.dokkaebi?.buildId !== buildId) throw new Error('v1.0.39 identity is not synchronized');
for (const file of changedPaths) {
  const absolute = path.join(root, file);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) throw new Error(`Required patch file missing: ${file}`);
}
rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(overlayRoot, { recursive: true });
const files = [];
for (const file of changedPaths) {
  const source = path.join(root, file);
  const target = path.join(overlayRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(source, target);
  const data = readFileSync(source);
  files.push({ path: file, bytes: data.length, sha256: sha256(data) });
}
const manifest = {
  schema: 'DD-DIRECT-OVERLAY-PATCH-1.0',
  baseVersion,
  targetVersion,
  buildId,
  marker: 'DD-CI-DIST-PORTABILITY-V139',
  generatedAt: new Date().toISOString(),
  counts: { changed: files.length, deleted: 0 },
  apply: 'Extract the distributed ZIP and paste its contents directly into the project root with overwrite enabled.',
  postApply: 'Delete stale dist/ before npm run build.',
  files
};
writeFileSync(path.join(outputRoot, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(path.join(outputRoot, 'PATCH_CONTENT_SHA256.txt'), `${files.map((file) => `${file.sha256}  ${file.path}`).join('\n')}\n`);
console.log(JSON.stringify({ outputRoot, overlayRoot, changed: files.length }, null, 2));
