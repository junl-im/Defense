import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const versionPath = path.join(dist, 'version.json');
if (!fs.existsSync(versionPath)) throw new Error('v145 dist/version.json missing');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const parts = String(version.releaseVersion || '').split('.').map(Number);
if (parts[0] !== 1 || parts[1] !== 0 || parts[2] < 45 || version.buildId !== `b24.${parts[2]}` || version.cacheRevision !== `${version.releaseVersion}-${version.buildId}`) throw new Error('v1.0.45+ dist identity mismatch');
for (const required of ['index.html', 'assets/game.js', 'assets/game.css']) {
  if (!fs.existsSync(path.join(dist, required))) throw new Error(`v145 complete Vite dist missing: ${required}`);
}
if (fs.existsSync(path.join(dist, 'src')) || fs.existsSync(path.join(dist, 'STATIC_BUILD_NOTICE.txt'))) throw new Error('v145 requires bundled Vite output, not static fallback');

const tasks = [
  { script: 'scripts/generate-asset-residency-v145.mjs', args: ['--check'], timeout: 30000 },
  { script: 'scripts/verify-dist-budget-v144.mjs', args: [], timeout: 30000 },
  { script: 'scripts/run-long-session-v145.mjs', args: [], timeout: 260000 }
];
for (const task of tasks) {
  const run = spawnSync(process.execPath, [path.join(root, task.script), ...task.args], {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    timeout: task.timeout,
    maxBuffer: 32 * 1024 * 1024
  });
  process.stdout.write(run.stdout || '');
  process.stderr.write(run.stderr || '');
  if (run.error || run.status !== 0) throw new Error(`v145 dist sub-verifier failed: ${task.script} (${run.error?.code || run.status})`);
}
console.log('PASS v1.0.45 dist completed 100 deterministic waves with bounded frame, heap, renderer, and context recovery trends');
