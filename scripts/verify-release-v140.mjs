import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };
const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const manifest = json('public/assets/ip-v13/asset-manifest-v13.json');
const archive = path.join(root, 'production/DokkaebiDefense/15_Source_Archives/ip-v13/sheets');
const workflow = read('.github/workflows/deploy.yml');
const handoff = read('PROJECT_HANDOFF.md');

check(pkg.version === '1.0.40' && pkg.dokkaebi?.releaseVersion === '1.0.40', 'package release identity');
check(pkg.dokkaebi?.lineageVersion === '23.8.0' && pkg.dokkaebi?.buildId === 'b24.40', 'package build identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === 'b24.40', 'lock identity');
check(version.releaseVersion === '1.0.40' && version.lineageVersion === '23.8.0' && version.buildId === 'b24.40', 'public version identity');
check(read('src/main.js').includes("const GAME_VERSION = '1.0.40';"), 'main version identity');
check(read('src/version-policy.js').includes("PUBLIC_GAME_VERSION = '1.0.40'") && read('src/version-policy.js').includes("LEGACY_LINEAGE_VERSION = '23.8.0'"), 'version policy identity');
check(read('index.html').includes("const RELEASE_VERSION = '1.0.40';") && read('index.html').includes("const BUILD_ID = 'b24.40';") && read('index.html').includes('release-v140-b24-40'), 'index identity');
check(read('public/sw.js').includes("const RELEASE_VERSION = '1.0.40';") && read('public/static-bootstrap.js').includes("const RELEASE_VERSION = '1.0.40';"), 'offline identity');
check(!fs.existsSync(path.join(root, 'public/assets/ip-v13/sheets')), 'public source sheets removed');
check(manifest.sheets?.length === 10, 'source sheet manifest coverage');
check(manifest.sheets.every((sheet) => fs.existsSync(path.join(archive, sheet.file)) && hash(path.join(archive, sheet.file)) === sheet.sha256), 'production archive hashes');
check(read('scripts/clean-obsolete-assets.mjs').includes("'public/assets/ip-v13/sheets'"), 'overlay cleanup contract');
check(read('scripts/generate-asset-sheets-v13.py').includes('15_Source_Archives/ip-v13/sheets'), 'generator archive contract');
check(pkg.scripts?.['verify:audit-boundary:v140'] && pkg.scripts?.['verify:dist:all'] && pkg.scripts?.['verify:release:v140'] && pkg.scripts?.['verify:dist:v140'], 'v140 scripts');
check(workflow.includes('npm run verify:dist:all'), 'CI complete dist chain');
check(handoff.includes('인수인계 내역 작성 필수') && handoff.includes('2026-07-27 — v1.0.40 / b24.40'), 'mandatory v140 handoff');
for (const doc of ['docs/AUDIT_ASSET_BOUNDARY_v1.0.40.md','docs/PATCH_NOTES_v1.0.40.md','docs/PATCH_APPLY_v1.0.40.md','docs/NEXT_UPDATE_v1.0.41.md']) {
  check(fs.existsSync(path.join(root, doc)), `document ${doc}`);
}
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.40 audit source-sheet boundary, CI dist chain, identity, and handoff verified');
