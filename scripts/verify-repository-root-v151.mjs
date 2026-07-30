import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pkgPath = path.join(root, 'package.json');
if (!fs.existsSync(pkgPath)) throw new Error('repository root package.json missing');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
if (pkg.version !== '1.0.51' || pkg.dokkaebi?.buildId !== 'b24.51') {
  throw new Error(`wrong repository root identity: expected 1.0.51 / b24.51, got ${pkg.version || 'missing'} / ${pkg.dokkaebi?.buildId || 'missing'}`);
}
for (const required of ['src', 'scripts', 'public', '.github/workflows/deploy.yml']) {
  if (!fs.existsSync(path.join(root, required))) throw new Error(`repository root contract missing: ${required}`);
}
const nested = fs.readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^DokkaebiLuckDefense3D_FULL_/i.test(entry.name))
  .map((entry) => entry.name)
  .filter((name) => fs.existsSync(path.join(root, name, 'package.json')));
if (nested.length) {
  throw new Error(`nested full-package directory detected at repository root: ${nested.join(', ')}. Move its contents to the actual repository root.`);
}
const staleRootFiles = [
  'PATCH_SUMMARY.md', 'PATCH_MANIFEST.json', 'PATCH_MANIFEST_v1.0.23.json',
  'README_PATCH.txt', 'APPLY_KO.txt', 'DELETE_PATHS.txt'
].filter((name) => fs.existsSync(path.join(root, name)));
if (staleRootFiles.length) {
  throw new Error(`stale patch metadata remains at repository root: ${staleRootFiles.join(', ')}; run npm run clean:obsolete`);
}
console.log('PASS v1.0.51 repository-root identity and layout');
