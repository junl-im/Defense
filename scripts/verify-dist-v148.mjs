import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const versionPath = path.join(dist, 'version.json');
if (!fs.existsSync(versionPath)) throw new Error('v148 dist/version.json missing');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const patchRevision = Number(String(version.releaseVersion || '').split('.')[2]);
const buildRevision = Number(String(version.buildId || '').split('.')[1]);
if (!Number.isInteger(patchRevision) || patchRevision < 48 || !Number.isInteger(buildRevision) || buildRevision < 48 || version.cacheRevision !== `${version.releaseVersion}-${version.buildId}`) throw new Error('v1.0.48+ dist identity mismatch');
for (const required of ['index.html','assets/game.js','assets/game.css','sw.js']) if (!fs.existsSync(path.join(dist, required))) throw new Error(`v148 complete Vite dist missing: ${required}`);
if (fs.existsSync(path.join(dist, 'src')) || fs.existsSync(path.join(dist, 'STATIC_BUILD_NOTICE.txt'))) throw new Error('v148 requires bundled Vite output, not static fallback');
const gameJs = fs.readFileSync(path.join(dist, 'assets/game.js'), 'utf8');
for (const marker of ['DD-RUNTIME-HEALTH-ASSURANCE-V148','unknown runtime error','fallbackEntries']) if (!gameJs.includes(marker)) throw new Error(`v148 bundled runtime marker missing: ${marker}`);
const tasks = [
  ['scripts/verify-runtime-resilience-v148.mjs', 30000],
  ['scripts/generate-system-audit-v148.mjs', 30000, ['--check']],
  ['scripts/verify-performance-guard-v148.mjs', 30000],
  ['scripts/verify-release-v148.mjs', 30000]
];
for (const [script, timeout, args = []] of tasks) {
  const run = spawnSync(process.execPath, [path.join(root, script), ...args], { cwd: root, env: process.env, encoding: 'utf8', timeout, maxBuffer: 16 * 1024 * 1024 });
  process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
  if (run.error || run.status !== 0) throw new Error(`v148 dist sub-verifier failed: ${script} (${run.error?.code || run.status})`);
}
console.log(`PASS v1.0.48+ complete dist contains safe persistence, bounded diagnostics, hidden-frame suspension, and comprehensive audit markers under ${version.releaseVersion}`);
