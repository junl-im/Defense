import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const failures = []; const check = (value, label) => { if (!value) failures.push(label); };
const pkg = json('package.json'), lock = json('package-lock.json'), version = json('public/version.json');
check(pkg.version === '1.0.51' && pkg.dokkaebi?.buildId === 'b24.51' && pkg.dokkaebi?.cacheRevision === '1.0.51-b24.51', 'package identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'lock identity');
check(version.releaseVersion === pkg.version && version.buildId === 'b24.51', 'public identity');
check(read('src/release-identity.generated.js').includes('"releaseVersion": "1.0.51"'), 'source generated identity');
check(read('public/release-identity.generated.js').includes('"cacheRevision": "1.0.51-b24.51"'), 'public generated identity');
check(read('src/version-policy.js').includes("from './release-identity.generated.js'"), 'version policy generated source');
check(read('src/main.js').includes('const GAME_VERSION = PUBLIC_GAME_VERSION;'), 'main generated identity consumption');
check(read('index.html').includes('releaseIdentity.cacheRevision'), 'HTML identity consumption');
check(read('public/sw.js').includes("importScripts('./release-identity.generated.js')"), 'service worker identity consumption');
for (const [script, args] of [['scripts/bootstrap-release-package-v151.mjs',['--check']],['scripts/generate-release-identity-v151.mjs',['--check']],['scripts/generate-release-identity-v151.mjs',['--self-test']]]) {
  const run = spawnSync(process.execPath, [path.join(root, script), ...args], { cwd: root, encoding: 'utf8' });
  process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
  check(!run.error && run.status === 0, `${script} ${args.join(' ')}`);
}
if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log('PASS v1.0.51 canonical release identity and pre-verification bootstrap');
