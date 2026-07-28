import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'logs/patch/1.0.44');
const overlay = path.join(out, 'overlay');
const files = [
  '.github/workflows/deploy.yml', 'README.md', 'PROJECT_HANDOFF.md', 'package.json', 'package-lock.json', 'index.html',
  'src/main.js', 'src/version-policy.js',
  'public/version.json', 'public/sw.js', 'public/static-bootstrap.js', 'public/assets/system-v135/runtime-module-shell-v135.json',
  'scripts/verify-release-v143.mjs', 'scripts/verify-dist-v143.mjs', 'scripts/verify-dist-chain-v140.mjs',
  'scripts/generate-asset-review-v144.mjs', 'scripts/verify-dist-budget-v144.mjs', 'scripts/run-built-game-mobile-matrix-v144.mjs',
  'scripts/verify-release-v144.mjs', 'scripts/verify-dist-v144.mjs', 'scripts/stage-clean-package-v144.mjs', 'scripts/verify-clean-package-v144.mjs',
  'scripts/create-patch-v144.mjs', 'scripts/verify-patch-v144.mjs',
  'docs/DIST_BUDGETS_v1.0.44.json', 'docs/RELEASE_ASSURANCE_v1.0.44.md', 'docs/PATCH_NOTES_v1.0.44.md',
  'docs/PATCH_APPLY_v1.0.44.md', 'docs/NEXT_UPDATE_v1.0.45.md',
  'docs/generated/runtime-asset-reachability-v143.json', 'docs/generated/runtime-asset-reachability-v143.md',
  'docs/generated/presentation-surface-snapshots-v143.json', 'docs/generated/asset-review-v144.json', 'docs/generated/asset-review-v144.md'
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(overlay, { recursive: true });
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
const rows = [];
for (const file of files) {
  const source = path.join(root, file);
  const target = path.join(overlay, file);
  if (!fs.existsSync(source)) throw new Error(`missing ${file}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  const data = fs.readFileSync(source);
  rows.push({ path: file, bytes: data.length, sha256: hash(data) });
}
const manifest = {
  baseVersion: '1.0.43',
  targetVersion: '1.0.44',
  buildId: 'b24.44',
  applyMode: 'direct-overlay',
  counts: { changed: rows.length, deleted: 0 },
  deletedPaths: [],
  files: rows
};
fs.writeFileSync(path.join(out, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ overlay, changed: rows.length }, null, 2));
