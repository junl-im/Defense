import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const checkOnly = process.argv.includes('--check');
const TARGET = Object.freeze({
  releaseVersion: '1.0.50',
  lineageVersion: '23.12.0',
  buildEpoch: 24,
  buildRevision: 50,
  buildId: 'b24.50',
  versionPolicy: 'DD-VERSION-POLICY-1.0',
  cacheRevision: '1.0.50-b24.50'
});
const ALLOWED = new Set(['1.0.49', '1.0.50']);
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

function atomicWrite(file, text) {
  const absolute = path.join(root, file);
  const temporary = `${absolute}.v150-${process.pid}.tmp`;
  fs.writeFileSync(temporary, text);
  fs.renameSync(temporary, absolute);
}

function ensureVerifyTail(command = '') {
  let next = String(command || '').trim();
  next = next.replaceAll('npm run verify:release:v149', 'npm run verify:foundation:v149:v150');
  next = next.replace(/\s*&&\s*npm run verify:release:v150/g, '');
  next = next.replace(/\s*&&\s*npm run hygiene:check\s*$/, '');
  if (!next.includes('npm run verify:foundation:v149:v150')) next = next ? `${next} && npm run verify:foundation:v149:v150` : 'npm run verify:foundation:v149:v150';
  next += ' && npm run verify:release:v150 && npm run hygiene:check';
  return next;
}

function buildOutputs(pkg, lock) {
  if (pkg?.name !== 'dokkaebi-luck-defense-3d') throw new Error(`v150 bootstrap refused: unexpected package name ${pkg?.name || '<missing>'}`);
  const sourceVersion = String(pkg.version || '');
  if (!ALLOWED.has(sourceVersion)) throw new Error(`v150 bootstrap refused: supported source versions are 1.0.49-1.0.50, actual ${sourceVersion || '<missing>'}`);
  const nextPkg = structuredClone(pkg);
  nextPkg.version = TARGET.releaseVersion;
  nextPkg.dokkaebi = { ...(nextPkg.dokkaebi || {}), ...TARGET };
  nextPkg.scripts ||= {};
  Object.assign(nextPkg.scripts, {
    'bootstrap:identity:v150': 'node scripts/bootstrap-release-package-v150.mjs',
    'generate:identity:v150': 'node scripts/generate-release-identity-v150.mjs',
    'verify:identity:v150': 'node scripts/verify-release-identity-v150.mjs',
    'generate:build-input:v150': 'node scripts/generate-build-input-manifest-v150.mjs',
    'verify:build-input:v150': 'node scripts/generate-build-input-manifest-v150.mjs --check',
    'verify:atomic:v150': 'node scripts/verify-atomic-save-snapshot-v150.mjs',
    'verify:rewards:v150': 'node scripts/verify-persistent-rewards-v150.mjs',
    'verify:error-boundary:v150': 'node scripts/verify-production-error-boundary-v150.mjs',
    'verify:performance-baseline:v150': 'node scripts/verify-performance-baseline-v150.mjs',
    'capture:baseline:v150': 'node scripts/capture-runtime-baseline-v150.mjs',
    'promote:baseline:v150': 'node scripts/promote-runtime-baseline-v150.mjs',
    'verify:structure:v150': 'node scripts/verify-responsibility-extraction-v150.mjs',
    'verify:foundation:v149:v150': 'node scripts/verify-v149-foundation-v150.mjs',
    'verify:release:v149': 'npm run verify:foundation:v149:v150',
    'verify:release:v150': 'npm run verify:identity:v150 && npm run verify:build-input:v150 && npm run verify:atomic:v150 && npm run verify:rewards:v150 && npm run verify:error-boundary:v150 && npm run verify:performance-baseline:v150 && npm run verify:structure:v150 && node scripts/verify-release-v150.mjs',
    'verify:dist:v150': 'node scripts/verify-dist-v150.mjs',
    'stage:package:v150': 'node scripts/stage-clean-package-v150.mjs',
    'verify:package:v150': 'node scripts/verify-clean-package-v150.mjs',
    'create:patch:v150': 'node scripts/create-patch-v150.mjs',
    'verify:patch:v150': 'node scripts/verify-patch-v150.mjs',
    'sync:generated:ci': 'npm run bootstrap:identity:v150 && npm run generate:identity:v150 && npm run generate:residency:v145 && npm run generate:audit:v148 && npm run generate:build-input:v150',
    'verify:ci': 'npm run bootstrap:identity:v150 && npm run sync:generated:ci && npm run verify',
    preverify: 'npm run bootstrap:identity:v150 && npm run clean:obsolete && npm run hygiene:check && npm run verify:identity:v150',
    prebuild: 'npm run bootstrap:identity:v150 && npm run clean:obsolete && npm run hygiene:check && npm run verify:identity:v150'
  });
  nextPkg.scripts.verify = ensureVerifyTail(nextPkg.scripts.verify);
  nextPkg.scripts = Object.fromEntries(Object.entries(nextPkg.scripts).sort(([a], [b]) => a.localeCompare(b)));

  const nextLock = structuredClone(lock);
  nextLock.name ||= nextPkg.name;
  nextLock.version = TARGET.releaseVersion;
  nextLock.packages ||= {};
  nextLock.packages[''] ||= {};
  nextLock.packages[''].name ||= nextPkg.name;
  nextLock.packages[''].version = TARGET.releaseVersion;
  nextLock.packages[''].dokkaebi = { ...(nextLock.packages[''].dokkaebi || {}), ...TARGET };
  nextLock.dokkaebi = { ...(nextLock.dokkaebi || {}), ...TARGET };
  return { sourceVersion, files: new Map([['package.json', stableJson(nextPkg)], ['package-lock.json', stableJson(nextLock)]]) };
}

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
const { sourceVersion, files } = buildOutputs(pkg, lock);
const stale = [];
for (const [file, expected] of files) {
  const actual = fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : '';
  if (actual !== expected) stale.push(file);
}
if (checkOnly) {
  if (stale.length) throw new Error(`v150 bootstrap outputs are stale: ${stale.join(', ')}`);
  console.log(`PASS v1.0.50 package bootstrap (${TARGET.releaseVersion} / ${TARGET.buildId})`);
  process.exit(0);
}
for (const [file, text] of files) atomicWrite(file, text);
console.log(JSON.stringify({ id: 'DD-CI-PREVERIFY-PACKAGE-BOOTSTRAP-V150', action: sourceVersion === TARGET.releaseVersion && !stale.length ? 'confirmed' : `repaired-${sourceVersion}-to-${TARGET.releaseVersion}`, repaired: stale, ...TARGET }, null, 2));
