import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const capture = (source, pattern) => source.match(pattern)?.[1] ?? '<missing>';

const pkg = json('package.json');
const lock = json('package-lock.json');
const publicVersion = json('public/version.json');
const main = read('src/main.js');
const policy = read('src/version-policy.js');
const html = read('index.html');
const sw = read('public/sw.js');

const expectedVersion = pkg.version;
const expectedBuild = pkg.dokkaebi?.buildId ?? '<missing>';
const expectedCache = pkg.dokkaebi?.cacheRevision ?? '<missing>';

const rows = [
  ['canonical release identity', `${expectedVersion} / ${expectedBuild} / ${expectedCache}`, '1.0.48 / b24.48 / 1.0.48-b24.48'],
  ['package.json version', pkg.version, expectedVersion],
  ['package.json buildId', pkg.dokkaebi?.buildId ?? '<missing>', expectedBuild],
  ['package.json cacheRevision', pkg.dokkaebi?.cacheRevision ?? '<missing>', expectedCache],
  ['package-lock.json version', lock.version ?? '<missing>', expectedVersion],
  ['package-lock root version', lock.packages?.['']?.version ?? '<missing>', expectedVersion],
  ['package-lock root buildId', lock.packages?.['']?.dokkaebi?.buildId ?? '<missing>', expectedBuild],
  ['src/main.js GAME_VERSION', capture(main, /const GAME_VERSION = '([^']+)'/), expectedVersion],
  ['src/version-policy.js PUBLIC_GAME_VERSION', capture(policy, /PUBLIC_GAME_VERSION = '([^']+)'/), expectedVersion],
  ['src/version-policy.js BUILD_ID', `b${capture(policy, /BUILD_EPOCH = (\d+)/)}.${capture(policy, /BUILD_REVISION = (\d+)/)}`, expectedBuild],
  ['index.html RELEASE_VERSION', capture(html, /const RELEASE_VERSION = '([^']+)'/), expectedVersion],
  ['index.html BUILD_ID', capture(html, /const BUILD_ID = '([^']+)'/), expectedBuild],
  ['index.html bootstrap cache', capture(html, /src="\.\/src\/bootstrap\.js\?v=([^"]+)"/), expectedCache],
  ['public/version.json releaseVersion', publicVersion.releaseVersion ?? '<missing>', expectedVersion],
  ['public/version.json buildId', publicVersion.buildId ?? '<missing>', expectedBuild],
  ['public/version.json cacheRevision', publicVersion.cacheRevision ?? '<missing>', expectedCache],
  ['public/sw.js RELEASE_VERSION', capture(sw, /const RELEASE_VERSION = '([^']+)'/), expectedVersion],
  ['public/sw.js BUILD_ID', capture(sw, /const BUILD_ID = '([^']+)'/), expectedBuild],
];

const failures = rows.filter(([, actual, expected]) => actual !== expected);
const width = Math.max(...rows.map(([name]) => name.length));
for (const [name, actual, expected] of rows) {
  const status = actual === expected ? 'PASS' : 'FAIL';
  console.log(`${status} ${name.padEnd(width)} actual=${actual} expected=${expected}`);
}

if (failures.length) {
  console.error('\nFAIL v1.0.48 release identity is partially applied.');
  console.error('Apply the direct-root identity hotfix, commit every changed identity file, then rerun npm run verify:identity:v148.');
  process.exit(1);
}

console.log(`PASS v1.0.48 synchronized release identity (${expectedVersion} / ${expectedBuild} / ${expectedCache})`);
