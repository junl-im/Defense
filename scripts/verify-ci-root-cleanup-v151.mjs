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
const identityCommand = 'node scripts/generate-release-identity-v151.mjs';
const verifyCommand = 'node scripts/verify-repository-root-v151.mjs';
const cleanIndex = workflow.indexOf(cleanCommand);
const identityIndex = workflow.indexOf(identityCommand);
const verifyIndex = workflow.indexOf(verifyCommand);
if (cleanIndex < 0 || identityIndex < 0 || verifyIndex < 0 || cleanIndex > identityIndex || cleanIndex > verifyIndex) {
  throw new Error('v151 CI root cleanup must run before identity generation and repository-root verification');
}

const bootstrap = fs.readFileSync(path.join(root, 'scripts/bootstrap-release-package-v151.mjs'), 'utf8');
for (const file of staleFiles) {
  if (!bootstrap.includes(`'${file}'`)) throw new Error(`v151 bootstrap cleanup contract missing ${file}`);
}
if (!bootstrap.includes("const STALE_ROOT_OVERLAY = 'overlay'") || !bootstrap.includes('removeStaleRootOverlay')) {
  throw new Error('v151 bootstrap cleanup contract missing stale root overlay removal');
}
const verifier = fs.readFileSync(path.join(root, 'scripts/verify-repository-root-v151.mjs'), 'utf8');
if (!verifier.includes('console.warn(`WARN stale patch metadata')) {
  throw new Error('v151 repository-root verifier must not fail before cleanup for known stale metadata');
}
const rootOutputPolicy = fs.readFileSync(path.join(root, 'scripts/root-output-policy.mjs'), 'utf8');
if (!rootOutputPolicy.includes("accidentalOverlayRecovery: false") || !rootOutputPolicy.includes("accidentalOverlayStrategy: 'remove-without-merge'")) {
  throw new Error('v151 root output policy must remove stale overlay/ without merging it');
}
if (rootOutputPolicy.includes('RECOVER accidental root overlay/ -> project root')) {
  throw new Error('v151 root output policy still contains unsafe overlay merge behavior');
}

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'dd-v151-root-cleanup-'));
try {
  fs.mkdirSync(path.join(sandbox, 'scripts'), { recursive: true });
  for (const file of ['bootstrap-release-package-v151.mjs', 'clean-obsolete-assets.mjs', 'manifest-policy.mjs', 'root-output-policy.mjs']) {
    fs.copyFileSync(path.join(root, 'scripts', file), path.join(sandbox, 'scripts', file));
  }
  const writeStaleFixture = () => {
    for (const file of staleFiles) fs.writeFileSync(path.join(sandbox, file), 'stale patch metadata\n');
    fs.mkdirSync(path.join(sandbox, 'overlay', 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(sandbox, 'overlay', 'package.json'), '{"name":"dokkaebi-luck-defense-3d","version":"1.0.46"}\n');
    fs.writeFileSync(path.join(sandbox, 'overlay', 'scripts', 'stale.mjs'), 'throw new Error("must never be copied");\n');
  };

  // Reproduce the CI failure reported after R2: the repository root is already
  // v1.0.51, but a stale extracted overlay/ still contains package metadata from
  // v1.0.46. Both bootstrap and the standalone cleaner must delete overlay/
  // without ever copying that metadata back into the project root.
  fs.writeFileSync(path.join(sandbox, 'package.json'), '{"name":"dokkaebi-luck-defense-3d","version":"1.0.51","scripts":{}}\n');
  fs.writeFileSync(path.join(sandbox, 'package-lock.json'), '{"name":"dokkaebi-luck-defense-3d","version":"1.0.51","lockfileVersion":3,"packages":{"":{"name":"dokkaebi-luck-defense-3d","version":"1.0.51"}}}\n');
  writeStaleFixture();

  const bootstrapResult = spawnSync(process.execPath, ['scripts/bootstrap-release-package-v151.mjs'], {
    cwd: sandbox,
    encoding: 'utf8'
  });
  if (bootstrapResult.status !== 0) {
    throw new Error(`v151 bootstrap cleanup regression failed: ${bootstrapResult.stderr || bootstrapResult.stdout}`);
  }
  if (fs.existsSync(path.join(sandbox, 'overlay'))) throw new Error('v151 bootstrap left root overlay/ behind');
  if (staleFiles.some((file) => fs.existsSync(path.join(sandbox, file)))) throw new Error('v151 bootstrap left stale root metadata behind');
  const packageAfterBootstrap = JSON.parse(fs.readFileSync(path.join(sandbox, 'package.json'), 'utf8'));
  if (packageAfterBootstrap.version !== '1.0.51') throw new Error(`v151 bootstrap downgraded package identity to ${packageAfterBootstrap.version}`);
  if (!bootstrapResult.stdout.includes('"removedStaleRootOverlay": true')) throw new Error('v151 bootstrap did not report stale overlay removal');

  writeStaleFixture();
  const result = spawnSync(process.execPath, ['scripts/clean-obsolete-assets.mjs'], {
    cwd: sandbox,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    throw new Error(`v151 cleanup regression sandbox failed: ${result.stderr || result.stdout}`);
  }
  const remaining = staleFiles.filter((file) => fs.existsSync(path.join(sandbox, file)));
  if (remaining.length) throw new Error(`v151 cleanup regression left stale files: ${remaining.join(', ')}`);
  if (fs.existsSync(path.join(sandbox, 'overlay'))) throw new Error('v151 cleanup regression left root overlay/ behind');
  const packageAfter = JSON.parse(fs.readFileSync(path.join(sandbox, 'package.json'), 'utf8'));
  if (packageAfter.version !== '1.0.51') throw new Error(`v151 cleanup downgraded package identity to ${packageAfter.version}`);
  if (fs.existsSync(path.join(sandbox, 'scripts', 'stale.mjs'))) throw new Error('v151 cleanup copied stale overlay source into project root');
  if (!result.stdout.includes('automatic merge disabled')) throw new Error('v151 cleanup did not report safe overlay removal');
} finally {
  fs.rmSync(sandbox, { recursive: true, force: true });
}

console.log('PASS v1.0.51 CI preflight removes stale patch metadata and overlay/ without downgrading package identity');
