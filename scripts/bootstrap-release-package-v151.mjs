import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const checkOnly = process.argv.includes('--check');
const TARGET = Object.freeze({
  releaseVersion: '1.0.51',
  lineageVersion: '23.12.0',
  buildEpoch: 24,
  buildRevision: 51,
  buildId: 'b24.51',
  versionPolicy: 'DD-VERSION-POLICY-1.0',
  cacheRevision: '1.0.51-b24.51'
});
const ALLOWED = new Set(['1.0.50', '1.0.51']);
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

function atomicWrite(file, text) {
  const absolute = path.join(root, file);
  const temporary = `${absolute}.v151-${process.pid}.tmp`;
  fs.writeFileSync(temporary, text);
  fs.renameSync(temporary, absolute);
}

function ensureVerifyTail(command = '') {
  let next = String(command || '').trim();
  next = next.replace(/\s*&&\s*npm run verify:release:v151/g, '');
  next = next.replace(/\s*&&\s*npm run hygiene:check\s*$/, '');
  if (!next.includes('npm run verify:release:v151')) next += ' && npm run verify:release:v151';
  next += ' && npm run hygiene:check';
  return next.replace(/^\s*&&\s*/, '');
}

function buildOutputs(pkg, lock) {
  if (pkg?.name !== 'dokkaebi-luck-defense-3d') throw new Error(`v151 bootstrap refused: unexpected package name ${pkg?.name || '<missing>'}`);
  const sourceVersion = String(pkg.version || '');
  if (!ALLOWED.has(sourceVersion)) throw new Error(`v151 bootstrap refused: supported source versions are 1.0.50-1.0.51, actual ${sourceVersion || '<missing>'}`);
  const nextPkg = structuredClone(pkg);
  nextPkg.version = TARGET.releaseVersion;
  nextPkg.dokkaebi = { ...(nextPkg.dokkaebi || {}), ...TARGET };
  nextPkg.scripts ||= {};
  Object.assign(nextPkg.scripts, {
    'bootstrap:identity:v151': 'node scripts/bootstrap-release-package-v151.mjs',
    'generate:identity:v151': 'node scripts/generate-release-identity-v151.mjs',
    'verify:identity:v151': 'node scripts/verify-release-identity-v151.mjs',
    'generate:build-input:v151': 'node scripts/generate-build-input-manifest-v151.mjs',
    'verify:build-input:v151': 'node scripts/generate-build-input-manifest-v151.mjs --check',
    'verify:character:v151': 'node scripts/verify-character-presentation-v151.mjs',
    'verify:foundation:v150:v151': 'npm run verify:atomic:v150 && npm run verify:rewards:v150 && npm run verify:error-boundary:v150 && npm run verify:performance-baseline:v150 && node scripts/verify-v150-foundation-v151.mjs',
    'verify:release:v150': 'npm run verify:foundation:v150:v151',
    'verify:release:v151': 'npm run verify:identity:v151 && npm run verify:build-input:v151 && npm run verify:foundation:v150:v151 && npm run verify:character:v151 && node scripts/verify-release-v151.mjs',
    'verify:dist:v151': 'node scripts/verify-dist-v151.mjs',
    'stage:package:v151': 'node scripts/stage-clean-package-v151.mjs',
    'verify:package:v151': 'node scripts/verify-clean-package-v151.mjs',
    'create:patch:v151': 'node scripts/create-patch-v151.mjs',
    'verify:patch:v151': 'node scripts/verify-patch-v151.mjs',
    'sync:generated:ci': 'npm run bootstrap:identity:v151 && npm run generate:identity:v151 && npm run generate:runtime-shell:v135 && npm run generate:reachability:v143 && npm run generate:asset-review:v144 && npm run generate:residency:v145 && npm run generate:audit:v148 && npm run generate:build-input:v151',
    'verify:ci': 'npm run bootstrap:identity:v151 && npm run sync:generated:ci && npm run verify',
    preverify: 'npm run bootstrap:identity:v151 && npm run clean:obsolete && npm run hygiene:check && npm run verify:identity:v151',
    prebuild: 'npm run bootstrap:identity:v151 && npm run clean:obsolete && npm run hygiene:check && npm run verify:identity:v151'
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
  if (stale.length) throw new Error(`v151 bootstrap outputs are stale: ${stale.join(', ')}`);
  console.log(`PASS v1.0.51 package bootstrap (${TARGET.releaseVersion} / ${TARGET.buildId})`);
  process.exit(0);
}
for (const [file, text] of files) atomicWrite(file, text);
console.log(JSON.stringify({ id: 'DD-CI-PREVERIFY-PACKAGE-BOOTSTRAP-V151', action: sourceVersion === TARGET.releaseVersion && !stale.length ? 'confirmed' : `repaired-${sourceVersion}-to-${TARGET.releaseVersion}`, repaired: stale, ...TARGET }, null, 2));
