import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const baseVersion = '1.0.35';
const targetVersion = '1.0.36';
const buildId = 'b24.36';
const outputRoot = path.join(root, 'logs/patch', targetVersion);
const applyRoot = path.join(outputRoot, 'APPLY_TO_PROJECT_ROOT');
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
  'scripts/audit-storage-footprint-v136.mjs',
  'scripts/cleanup-generated-output-v136.mjs',
  'scripts/stage-clean-package-v136.mjs',
  'scripts/verify-clean-package-v136.mjs',
  'scripts/verify-release-v136.mjs',
  'scripts/verify-dist-v136.mjs',
  'scripts/create-patch-v136.mjs',
  'scripts/verify-patch-v136.mjs',
  'docs/PACKAGE_POLICY_v1.0.36.json',
  'docs/STORAGE_HYGIENE_AUDIT_v1.0.36.md',
  'docs/PATCH_NOTES_v1.0.36.md',
  'docs/PATCH_APPLY_v1.0.36.md',
  'docs/NEXT_UPDATE_v1.0.37.md'
].sort();
const deletedPaths = ['dist/'];
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== targetVersion || pkg.dokkaebi?.buildId !== buildId) throw new Error('v1.0.36 identity is not synchronized');
for (const file of changedPaths) {
  const absolute = path.join(root, file);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) throw new Error(`Required patch file missing: ${file}`);
}
rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(applyRoot, { recursive: true });
const files = [];
for (const file of changedPaths) {
  const source = path.join(root, file);
  const target = path.join(applyRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(source, target);
  const data = readFileSync(source);
  files.push({ path: file, bytes: data.length, sha256: sha256(data) });
}
const manifest = {
  schema: 'DD-PATCH-MANIFEST-1.0',
  baseVersion,
  targetVersion,
  buildId,
  marker: 'DD-STORAGE-HYGIENE-V136',
  generatedAt: new Date().toISOString(),
  counts: { changed: files.length, deleted: deletedPaths.length },
  assurance: {
    exactDuplicateRootCauseMeasured: true,
    generatedDistRemoved: true,
    emptyNodeModulesExcluded: true,
    generatedLogsExcludedFromFullZip: true,
    runtimeAssetsPreserved: true,
    productionCorpusPreserved: true,
    mandatoryHandoffHistory: true
  },
  deletedPaths,
  files
};
writeFileSync(path.join(outputRoot, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(path.join(outputRoot, 'DELETE_LIST.txt'), `${deletedPaths.join('\n')}\n`);
writeFileSync(path.join(outputRoot, 'PATCH_CONTENT_SHA256.txt'), `${files.map((file) => `${file.sha256}  ${file.path}`).join('\n')}\n`);
writeFileSync(path.join(outputRoot, 'README_PATCH.txt'), [
  'Dokkaebi Luck Defense 3D patch v1.0.35 -> v1.0.36',
  '',
  '1. Copy everything inside APPLY_TO_PROJECT_ROOT into the existing project root and overwrite matching files.',
  '2. Run: npm run cleanup:generated:v136',
  '3. Run: npm run verify:release:v136',
  '',
  'The cleanup removes generated dist output and an empty node_modules directory. Runtime assets in public and authored production data are preserved.',
  ''
].join('\n'));
writeFileSync(path.join(outputRoot, 'APPLY_PATCH_WINDOWS.bat'), [
  '@echo off',
  'setlocal',
  'if "%~1"=="" (',
  '  echo Drag the project folder onto this file or pass the project path as the first argument.',
  '  exit /b 1',
  ')',
  'set "TARGET=%~1"',
  'xcopy "%~dp0APPLY_TO_PROJECT_ROOT\*" "%TARGET%\" /E /I /Y >nul',
  'if exist "%TARGET%\dist" rmdir /S /Q "%TARGET%\dist"',
  'pushd "%TARGET%"',
  'node scripts\cleanup-generated-output-v136.mjs',
  'popd',
  'echo Patch v1.0.36 applied.',
  ''
].join('\r\n'));
writeFileSync(path.join(outputRoot, 'APPLY_PATCH_MAC_LINUX.sh'), [
  '#!/bin/sh',
  'set -eu',
  'TARGET=${1:-}',
  'if [ -z "$TARGET" ]; then echo "Usage: sh APPLY_PATCH_MAC_LINUX.sh /path/to/project"; exit 1; fi',
  'cp -R "$(dirname "$0")/APPLY_TO_PROJECT_ROOT/." "$TARGET/"',
  'rm -rf "$TARGET/dist"',
  '(cd "$TARGET" && node scripts/cleanup-generated-output-v136.mjs)',
  'echo "Patch v1.0.36 applied."',
  ''
].join('\n'), { mode: 0o755 });
console.log(JSON.stringify({ outputRoot, applyRoot, changed: files.length, deleted: deletedPaths.length }, null, 2));
