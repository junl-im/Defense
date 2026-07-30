import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const sourcePreflight = spawnSync(process.execPath, [path.join(root, 'scripts/verify-ci-source-revision-v151.mjs')], { cwd: root, env: process.env, encoding: 'utf8' });
process.stdout.write(sourcePreflight.stdout || ''); process.stderr.write(sourcePreflight.stderr || '');
if (sourcePreflight.status !== 0) throw new Error(`DD-V151-ENEMY-MATERIAL-R6 preflight failed (${sourcePreflight.status})`);
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const versionPath = path.join(dist, 'version.json');
if (!fs.existsSync(versionPath)) throw new Error('v146 dist/version.json missing');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const patchRevision = Number(String(version.releaseVersion || '').split('.')[2]);
const buildRevision = Number(String(version.buildId || '').split('.')[1]);
if (!Number.isInteger(patchRevision) || patchRevision < 46 || !Number.isInteger(buildRevision) || buildRevision < 46 || version.cacheRevision !== `${version.releaseVersion}-${version.buildId}`) throw new Error('v1.0.46+ dist identity mismatch');
for (const required of ['index.html', 'assets/game.js', 'assets/game.css', 'sw.js']) if (!fs.existsSync(path.join(dist, required))) throw new Error(`v146 complete Vite dist missing: ${required}`);
if (fs.existsSync(path.join(dist, 'src')) || fs.existsSync(path.join(dist, 'STATIC_BUILD_NOTICE.txt'))) throw new Error('v146 requires bundled Vite output, not static fallback');
const tasks = [
  ['scripts/verify-device-traces-v146.mjs', [], 30000],
  ['scripts/verify-service-worker-upgrade-v146.mjs', [], 30000],
  ['scripts/verify-dist-trend-v146.mjs', [], 60000],
  ['scripts/run-release-assurance-v146.mjs', [], 300000]
];
for (const [script, args, timeout] of tasks) {
  const run = spawnSync(process.execPath, [path.join(root, script), ...args], { cwd: root, env: process.env, encoding: 'utf8', timeout, maxBuffer: 32 * 1024 * 1024 });
  process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
  if (run.error || run.status !== 0) throw new Error(`v146 dist sub-verifier failed: ${script} (${run.error?.code || run.status})`);
}
console.log(`PASS v1.0.46+ complete dist survived device traces, cache upgrade, measured trend, deterministic load phases, and localized failure digest under ${version.releaseVersion}`);
