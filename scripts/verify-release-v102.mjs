import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const main = read('src/main.js');
const css = read('src/style.css');
const policy = read('src/version-policy.js');
const sw = read('public/sw.js');
const clean = read('scripts/clean-obsolete-assets.mjs');
const lineageParts = String(pkg.dokkaebi?.lineageVersion || '').split('.').map(Number);
const lineageAtLeast231 = lineageParts.length === 3 && (lineageParts[0] > 23 || (lineageParts[0] === 23 && lineageParts[1] >= 1));

const checks = [
  ['public release preserves 1.0.2+ foundation', /^1\.0\.(?:[2-9]|[1-9]\d)$/.test(pkg.version) && pkg.dokkaebi?.releaseVersion === pkg.version],
  ['package lock release is synchronized', lock.version === pkg.version && lock.packages?.['']?.version === pkg.version],
  ['legacy lineage remains 23.1.0 or later', lineageAtLeast231],
  ['monotonic build id preserves b24.2+ foundation', pkg.dokkaebi?.buildEpoch === 24 && Number(pkg.dokkaebi?.buildRevision) >= 2 && pkg.dokkaebi?.buildId === `b24.${pkg.dokkaebi?.buildRevision}`],
  ['runtime game version matches package', main.includes(`const GAME_VERSION = '${pkg.version}'`)],
  ['service worker release/build match', sw.includes(`RELEASE_VERSION = '${pkg.version}'`) && sw.includes(`BUILD_ID = '${pkg.dokkaebi?.buildId}'`)],
  ['unused main imports removed', !main.includes('RELIC_SET_BONUSES') && !main.includes('formatRunSeed') && !main.includes('getBossWave') && !main.includes('IP_ASSET_LIBRARY_V13')],
  ['obsolete mobile HUD runtime removed', !main.includes('MobileHudDirectorV22') && main.includes('MobileHudDirectorV23')],
  ['obsolete mobile HUD CSS removed', !css.includes('body.mobile-hud-v21 ') && !css.includes('body.mobile-hud-v22 ') && css.includes('body.mobile-hud-v23')],
  ['duplicate art bible removed', !fs.existsSync('docs/ASSET_BIBLE.md') && fs.existsSync('docs/ABSOLUTE_ART_BIBLE_v2.0.md') && clean.includes("'docs/ASSET_BIBLE.md'")],
  ['code health scripts exist', fs.existsSync('scripts/audit-code-health-v102.mjs') && Boolean(pkg.scripts?.['audit:code:v102'])],
  ['release documents exist', ['docs/CODE_HEALTH_FOUNDATION_v1.0.2.md', 'docs/PATCH_NOTES_v1.0.2.md', 'docs/PATCH_APPLY_v1.0.2.md', 'docs/VERSION_POLICY_v1.0.md'].every((path) => fs.existsSync(path))]
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed += 1;
}
if (failed) process.exit(1);
console.log('\nv1.0.2 Code Health Foundation contract verified');
