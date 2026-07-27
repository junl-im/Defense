import fs from 'node:fs';
import { isReleaseSequenceValid, readReleasePolicy, lineageMajor } from './release-version-policy.mjs';
const read = (path) => fs.readFileSync(path, 'utf8');
const pkg = JSON.parse(read('package.json'));
const policy = readReleasePolicy(pkg);
const main = read('src/main.js');
const versionSource = read('src/version-policy.js');
const foundation = read('src/runtime/core-foundation-director-v101.js');
const sw = read('public/sw.js');
const lineageParts = String(policy.lineageVersion || '').split('.').map(Number);
const lineageAtLeast231 = lineageParts.length === 3 && (lineageParts[0] > 23 || (lineageParts[0] === 23 && lineageParts[1] >= 1));
const checks = [
  ['public package remains 1.0 patch line', /^1\.0\.(?:[1-9]|[1-9]\d)$/.test(pkg.version) && policy.releaseVersion === pkg.version],
  ['legacy lineage is preserved', lineageAtLeast231 && lineageMajor(pkg) >= 23],
  ['patch range policy supports 0 through 99', isReleaseSequenceValid(policy.releaseVersion) && versionSource.includes("max: 99")],
  ['monotonic build generation exists', policy.buildEpoch === 24 && policy.buildRevision >= 1 && policy.buildId === `b24.${policy.buildRevision}`],
  ['runtime imports central version policy', main.includes("from './version-policy.js'") && main.includes('PUBLIC_GAME_VERSION') && main.includes('VERSION_POLICY')],
  ['service worker uses build id rather than public semver ordering', sw.includes(`RELEASE_VERSION = '${policy.releaseVersion}'`) && sw.includes(`BUILD_ID = '${policy.buildId}'`) && sw.includes('CACHE_NAME = `${CACHE_PREFIX}${BUILD_ID}`')],
  ['core foundation director exists', /CORE_FOUNDATION_VERSION = '1\.0\.(?:[1-9]|[1-9]\d)'/.test(foundation) && foundation.includes('sampleFrame') && foundation.includes('cadence')],
  ['noncritical diagnostics are cadence throttled', main.includes("shouldRun('browser-reliability'") && main.includes("shouldRun('asset-presence-v21'") && main.includes("shouldRun('production-console'")],
  ['root hygiene and native key contracts remain', read('PROJECT_HANDOFF.md').includes('PERMANENT ROOT HYGIENE CONTRACT') && read('PROJECT_HANDOFF.md').includes('PERMANENT NATIVE KEY CONTRACT')],
  ['public version manifest exists', fs.existsSync('public/version.json') && read('public/version.json').includes(policy.buildId)],
  ['version policy documentation exists', (() => {
    const release = policy.releaseVersion;
    const currentDocs = fs.existsSync(`docs/PATCH_NOTES_v${release}.md`) && fs.existsSync(`docs/PATCH_APPLY_v${release}.md`);
    const foundationDocs = ['1.0.1', '1.0.2'].some((version) => fs.existsSync(`docs/PATCH_NOTES_v${version}.md`) && fs.existsSync(`docs/PATCH_APPLY_v${version}.md`));
    return fs.existsSync('docs/VERSION_POLICY_v1.0.md') && (currentDocs || foundationDocs);
  })()]
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed += 1; }
if (failed) process.exit(1);
console.log('\nv1.0.x Release Foundation contract verified');
