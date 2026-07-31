import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };

const pkg = json('package.json');
const lock = json('package-lock.json');
const publicVersion = json('public/version.json');
const identity = read('src/release-identity.generated.js');
const main = read('src/main.js');
const handoff = read('PROJECT_HANDOFF.md');

check(pkg.version === '1.0.52', 'package version 1.0.52');
check(lock.version === '1.0.52' && lock.packages?.['']?.version === '1.0.52', 'lockfile root version 1.0.52');
check(publicVersion.releaseVersion === '1.0.52' && publicVersion.buildId === 'b24.52', 'public version identity');
check(identity.includes('\"releaseVersion\": \"1.0.52\"') && identity.includes('\"buildId\": \"b24.52\"'), 'generated source identity');
check(fs.existsSync(path.join(root, 'src/runtime/character-action-timing-v152.js')), 'action timing module exists');
check(fs.existsSync(path.join(root, 'src/runtime/character-presentation-budget-v152.js')), 'presentation budget module exists');
check(fs.existsSync(path.join(root, 'src/engine/gpu-frame-timer-v152.js')), 'GPU timer module exists');
check(main.includes("from './engine/gpu-frame-timer-v152.js'"), 'main imports GPU timer');
check(handoff.includes('v1.0.52') && handoff.includes('b24.52'), 'handoff records v1.0.52 identity');
check(fs.existsSync(path.join(root, 'docs/PATCH_NOTES_v1.0.52.md')), 'v1.0.52 patch notes');
check(fs.existsSync(path.join(root, 'docs/RELEASE_ASSURANCE_v1.0.52.md')), 'v1.0.52 assurance notes');
check(fs.existsSync(path.join(root, 'docs/NEXT_UPDATE_v1.0.53.md')), 'next update v1.0.53 plan');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.52 release identity, integration, handoff, and documentation contracts');
