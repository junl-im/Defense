import fs from 'node:fs';
const read = (path) => fs.readFileSync(path, 'utf8');
const pkg = JSON.parse(read('package.json'));
const workflow = read('.github/workflows/deploy.yml');
const handoff = read('PROJECT_HANDOFF.md');
const gitignore = read('.gitignore');
const simulations = [
  read('scripts/simulate-ten-wave-run-v18.mjs'),
  read('scripts/simulate-autonomous-moonfront-v22.mjs'),
  read('scripts/simulate-mobile-hud-v23.mjs')
];
const checks = [
  ['package retains v23.0.2 or later lineage', /^23\.(?:0\.[2-9]|[1-9]\.\d+)$/.test(pkg.version)],
  ['runtime retains v23.0.2 or later lineage', /GAME_VERSION = '23\.(?:0\.[2-9]|[1-9]\.\d+)'/.test(read('src/main.js'))],
  ['service worker retains v23.0.2 or later lineage', /VERSION = '23\.(?:0\.[2-9]|[1-9]\.\d+)'/.test(read('public/sw.js'))],
  ['root hygiene verifier exists', fs.existsSync('scripts/verify-root-hygiene.mjs')],
  ['root organizer exists', fs.existsSync('scripts/organize-root-output.mjs')],
  ['central output path utility exists', fs.existsSync('scripts/output-paths.mjs')],
  ['logs directory contract exists', fs.existsSync('logs/README.md')],
  ['logs are ignored except contract', gitignore.includes('logs/*') && gitignore.includes('!logs/README.md')],
  ['verification starts and ends with hygiene checks', pkg.scripts.preverify.includes('hygiene:check') && pkg.scripts.verify.endsWith('npm run hygiene:check')],
  ['logged commands write under logs', pkg.scripts['verify:logged'].includes('run-with-log.mjs verify') && pkg.scripts['build:logged'].includes('run-with-log.mjs build')],
  ['simulations default to logs', simulations.every((source) => source.includes('generatedOutput') && source.includes("category: 'simulations'"))],
  ['browser and asset audits default to logs', read('scripts/run-browser-reliability-lab-v19.mjs').includes("category: 'audits'") && read('scripts/audit-asset-presence-v21.mjs').includes("category: 'audits'")],
  ['canonical baseline refresh is explicit', read('scripts/output-paths.mjs').includes('--refresh-baseline')],
  ['CI writes logs below logs directory', workflow.includes('logs/verify/ci-verify.log') && workflow.includes('logs/build/ci-build.log')],
  ['patch handoff locks root hygiene', handoff.includes('PERMANENT ROOT HYGIENE CONTRACT') && handoff.includes('logs/patch/<version>/')],
  ['structure rules documentation exists', fs.existsSync('docs/PROJECT_STRUCTURE_RULES_v1.0.md') && fs.existsSync('docs/CLEAN_FOUNDATION_v23.0.2.md')]
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed += 1; }
if (failed) process.exit(1);
console.log('\nv23.0.2 Clean Foundation contract verified');
