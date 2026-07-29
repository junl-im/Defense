import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const checkOnly = process.argv.includes('--check');
const TARGET = Object.freeze({
  releaseVersion: '1.0.49',
  lineageVersion: '23.12.0',
  buildEpoch: 24,
  buildRevision: 49,
  buildId: 'b24.49',
  versionPolicy: 'DD-VERSION-POLICY-1.0',
  cacheRevision: '1.0.49-b24.49'
});
const ALLOWED = new Set(['1.0.46', '1.0.47', '1.0.48', '1.0.49']);
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

function atomicWrite(file, text) {
  const absolute = path.join(root, file);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  const temporary = `${absolute}.v149-${process.pid}.tmp`;
  fs.writeFileSync(temporary, text);
  fs.renameSync(temporary, absolute);
}

function ensureVerifyTail(command = '') {
  let next = String(command || '').trim();
  next = next.replace(/\s*&&\s*npm run hygiene:check\s*$/, '');
  for (const required of [
    'npm run verify:release:v147',
    'npm run verify:release:v148',
    'npm run verify:release:v149'
  ]) {
    if (!next.includes(required)) next = next ? `${next} && ${required}` : required;
  }
  if (!next.includes('npm run hygiene:check')) next = `${next} && npm run hygiene:check`;
  return next;
}

function buildOutputs(pkg, lock) {
  if (pkg?.name !== 'dokkaebi-luck-defense-3d') {
    throw new Error(`v149 bootstrap refused: unexpected package name ${pkg?.name || '<missing>'}`);
  }
  const sourceVersion = String(pkg.version || '');
  if (!ALLOWED.has(sourceVersion)) {
    throw new Error(`v149 bootstrap refused: supported source versions are 1.0.46-1.0.49, actual ${sourceVersion || '<missing>'}`);
  }

  const nextPkg = structuredClone(pkg);
  nextPkg.version = TARGET.releaseVersion;
  nextPkg.dokkaebi = { ...(nextPkg.dokkaebi || {}), ...TARGET };
  nextPkg.scripts ||= {};
  Object.assign(nextPkg.scripts, {
    'bootstrap:identity:v149': 'node scripts/bootstrap-release-package-v149.mjs',
    'generate:identity:v149': 'node scripts/generate-release-identity-v149.mjs',
    'verify:identity:v149': 'node scripts/verify-release-identity-v149.mjs',
    'generate:build-input:v149': 'node scripts/generate-build-input-manifest-v149.mjs',
    'verify:build-input:v149': 'node scripts/generate-build-input-manifest-v149.mjs --check',
    'generate:audit:v148': 'node scripts/generate-system-audit-v148.mjs',
    'verify:audit:v148': 'node scripts/generate-system-audit-v148.mjs --check',
    'verify:resilience:v148': 'node scripts/verify-runtime-resilience-v148.mjs',
    'verify:performance:v148': 'node scripts/verify-performance-guard-v148.mjs',
    'verify:release:v148': 'npm run verify:audit:v148 && npm run verify:resilience:v148 && npm run verify:performance:v148 && node scripts/verify-release-v148.mjs',
    'verify:persistence:v149': 'node scripts/verify-transactional-persistence-v149.mjs',
    'verify:recovery:v149': 'node scripts/verify-recovery-state-v149.mjs',
    'verify:exposure:v149': 'node scripts/verify-feature-exposure-v149.mjs',
    'verify:result:v149': 'node scripts/verify-result-presenter-v149.mjs',
    'verify:structure:v149': 'node scripts/verify-responsibility-extraction-v149.mjs',
    'verify:browser:v149': 'node scripts/run-feature-exposure-v149.mjs',
    'verify:performance:v149': 'node scripts/verify-performance-reproducibility-v149.mjs',
    'verify:release:v149': 'npm run verify:identity:v149 && npm run verify:build-input:v149 && npm run verify:persistence:v149 && npm run verify:recovery:v149 && npm run verify:exposure:v149 && npm run verify:result:v149 && npm run verify:structure:v149 && npm run verify:performance:v149 && node scripts/verify-release-v149.mjs',
    'verify:dist:v149': 'node scripts/verify-dist-v149.mjs',
    'stage:package:v149': 'node scripts/stage-clean-package-v149.mjs',
    'verify:package:v149': 'node scripts/verify-clean-package-v149.mjs',
    'create:patch:v149': 'node scripts/create-patch-v149.mjs',
    'verify:patch:v149': 'node scripts/verify-patch-v149.mjs',
    'sync:generated:ci': 'npm run bootstrap:identity:v149 && npm run generate:identity:v149 && npm run generate:residency:v145 && npm run generate:audit:v148 && npm run generate:build-input:v149',
    'verify:ci': 'npm run bootstrap:identity:v149 && npm run sync:generated:ci && npm run verify',
    preverify: 'npm run bootstrap:identity:v149 && npm run clean:obsolete && npm run hygiene:check && npm run verify:identity:v149',
    prebuild: 'npm run bootstrap:identity:v149 && npm run clean:obsolete && npm run hygiene:check && npm run verify:identity:v149'
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

  const sourceGenerated = `// Generated by scripts/generate-release-identity-v149.mjs. Do not edit manually.\nexport const RELEASE_IDENTITY = Object.freeze(${JSON.stringify(TARGET, null, 2)});\nexport const RELEASE_VERSION = RELEASE_IDENTITY.releaseVersion;\nexport const LINEAGE_VERSION = RELEASE_IDENTITY.lineageVersion;\nexport const BUILD_EPOCH = RELEASE_IDENTITY.buildEpoch;\nexport const BUILD_REVISION = RELEASE_IDENTITY.buildRevision;\nexport const BUILD_ID = RELEASE_IDENTITY.buildId;\nexport const CACHE_REVISION = RELEASE_IDENTITY.cacheRevision;\n`;
  const publicGenerated = `// Generated by scripts/generate-release-identity-v149.mjs. Do not edit manually.\n(() => {\n  const identity = Object.freeze(${JSON.stringify(TARGET, null, 2)});\n  globalThis.__DOKKAEBI_RELEASE_IDENTITY__ = identity;\n})();\n`;

  return {
    sourceVersion,
    files: new Map([
      ['package.json', stableJson(nextPkg)],
      ['package-lock.json', stableJson(nextLock)],
      ['src/release-identity.generated.js', sourceGenerated],
      ['public/release-identity.generated.js', publicGenerated],
      ['public/version.json', stableJson(TARGET)]
    ])
  };
}

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
const { sourceVersion, files } = buildOutputs(pkg, lock);
const stale = [];
for (const [file, expected] of files) {
  const absolute = path.join(root, file);
  const actual = fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : '';
  if (actual !== expected) stale.push(file);
}

if (checkOnly) {
  if (stale.length) throw new Error(`v149 bootstrap outputs are stale: ${stale.join(', ')}`);
  console.log(`PASS v1.0.49 pre-verification package bootstrap (${TARGET.releaseVersion} / ${TARGET.buildId})`);
  process.exit(0);
}

for (const [file, text] of files) atomicWrite(file, text);
const action = sourceVersion === TARGET.releaseVersion && stale.length === 0
  ? 'confirmed'
  : `repaired-${sourceVersion || 'missing'}-to-${TARGET.releaseVersion}`;
console.log(JSON.stringify({
  id: 'DD-CI-PREVERIFY-PACKAGE-BOOTSTRAP-V149',
  action,
  repaired: stale,
  ...TARGET
}, null, 2));
