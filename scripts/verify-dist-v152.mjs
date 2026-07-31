import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertReachableBundleMarkers } from './lib/dist-bundle-markers.mjs';
const root = path.resolve(import.meta.dirname, '..');
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const versionPath = path.join(dist, 'version.json');
if (!fs.existsSync(versionPath)) throw new Error('v152 dist/version.json missing');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
if (version.releaseVersion !== '1.0.52' || version.buildId !== 'b24.52' || version.cacheRevision !== '1.0.52-b24.52') throw new Error('v1.0.52 dist identity mismatch');
for (const required of ['index.html', 'assets/game.js', 'assets/game.css', 'sw.js', 'release-identity.generated.js']) if (!fs.existsSync(path.join(dist, required))) throw new Error(`v152 complete Vite dist missing: ${required}`);
if (fs.existsSync(path.join(dist, 'src')) || fs.existsSync(path.join(dist, 'STATIC_BUILD_NOTICE.txt'))) throw new Error('v152 requires bundled Vite output, not static fallback');
const bundle = assertReachableBundleMarkers(dist, ['DD-CHARACTER-ACTION-TIMING-V152', 'DD-CHARACTER-PRESENTATION-BUDGET-V152', 'DD-GPU-FRAME-TIMER-V152', 'authoredDurationV152', 'clearMotionHistoryV152'], { label: 'v152 bundled runtime' });
for (const script of ['scripts/verify-character-action-timing-v152.mjs', 'scripts/verify-presentation-budget-v152.mjs', 'scripts/verify-runtime-hardening-v152.mjs', 'scripts/verify-release-v152.mjs']) {
  const run = spawnSync(process.execPath, [path.join(root, script)], { cwd: root, env: process.env, encoding: 'utf8', timeout: 120000, maxBuffer: 32 * 1024 * 1024 });
  process.stdout.write(run.stdout || '');
  process.stderr.write(run.stderr || '');
  if (run.error || run.status !== 0) throw new Error(`v152 dist sub-verifier failed: ${script}`);
}
console.log(`PASS v1.0.52 complete Vite dist and event timing/runtime guard markers (${bundle.files.length} reachable JS files)`);
