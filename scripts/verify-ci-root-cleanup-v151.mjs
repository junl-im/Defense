import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const staleFiles = [
  'PATCH_SUMMARY.md',
  'PATCH_MANIFEST.json',
  'PATCH_MANIFEST_v1.0.23.json',
  'README_PATCH.txt',
  'APPLY_KO.txt',
  'DELETE_PATHS.txt'
];
const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
const cleanCommand = 'node scripts/clean-obsolete-assets.mjs';
const verifyCommand = 'node scripts/verify-repository-root-v151.mjs';
const cleanIndex = workflow.indexOf(cleanCommand);
const verifyIndex = workflow.indexOf(verifyCommand);
if (cleanIndex < 0 || verifyIndex < 0 || cleanIndex > verifyIndex) {
  throw new Error('v151 CI root cleanup must run before repository-root verification');
}

const bootstrap = fs.readFileSync(path.join(root, 'scripts/bootstrap-release-package-v151.mjs'), 'utf8');
for (const file of staleFiles) {
  if (!bootstrap.includes(`'${file}'`)) throw new Error(`v151 bootstrap cleanup contract missing ${file}`);
}
const verifier = fs.readFileSync(path.join(root, 'scripts/verify-repository-root-v151.mjs'), 'utf8');
if (!verifier.includes('console.warn(`WARN stale patch metadata')) {
  throw new Error('v151 repository-root verifier must not fail before cleanup for known stale metadata');
}

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'dd-v151-root-cleanup-'));
try {
  fs.mkdirSync(path.join(sandbox, 'scripts'), { recursive: true });
  for (const file of ['clean-obsolete-assets.mjs', 'manifest-policy.mjs', 'root-output-policy.mjs']) {
    fs.copyFileSync(path.join(root, 'scripts', file), path.join(sandbox, 'scripts', file));
  }
  for (const file of staleFiles) fs.writeFileSync(path.join(sandbox, file), 'stale patch metadata\n');
  const result = spawnSync(process.execPath, ['scripts/clean-obsolete-assets.mjs'], {
    cwd: sandbox,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    throw new Error(`v151 cleanup regression sandbox failed: ${result.stderr || result.stdout}`);
  }
  const remaining = staleFiles.filter((file) => fs.existsSync(path.join(sandbox, file)));
  if (remaining.length) throw new Error(`v151 cleanup regression left stale files: ${remaining.join(', ')}`);
} finally {
  fs.rmSync(sandbox, { recursive: true, force: true });
}

console.log('PASS v1.0.51 CI preflight removes stale root patch metadata before repository verification');
