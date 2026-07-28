import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const versionPath = path.join(dist, 'version.json');
if (!fs.existsSync(versionPath)) throw new Error('v144 dist/version.json missing');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const parts = String(version.releaseVersion || '').split('.').map(Number);
if (parts.length !== 3 || parts.some((value) => !Number.isInteger(value)) || parts[0] !== 1 || parts[1] !== 0 || parts[2] < 44) throw new Error('v144 dist requires release >= 1.0.44');
if (!/^b24\.\d+$/.test(String(version.buildId || ''))) throw new Error('v144 dist build identity mismatch');
for (const required of ['index.html', 'assets/game.js', 'assets/game.css']) {
  if (!fs.existsSync(path.join(dist, required))) throw new Error(`v144 complete Vite dist missing: ${required}`);
}
if (fs.existsSync(path.join(dist, 'src')) || fs.existsSync(path.join(dist, 'STATIC_BUILD_NOTICE.txt'))) throw new Error('v144 dist must be the bundled Vite output, not static fallback');

for (const script of ['scripts/verify-dist-budget-v144.mjs', 'scripts/run-built-game-mobile-matrix-v144.mjs']) {
  const run = spawnSync(process.execPath, [path.join(root, script)], {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    timeout: script.includes('mobile-matrix') ? 180000 : 30000,
    maxBuffer: 16 * 1024 * 1024
  });
  process.stdout.write(run.stdout || '');
  process.stderr.write(run.stderr || '');
  if (run.error || run.status !== 0) throw new Error(`v144 dist sub-verifier failed: ${script} (${run.error?.code || run.status})`);
}
console.log(`PASS v1.0.44 complete-build foundation preserved under ${version.releaseVersion} / ${version.buildId}`);
