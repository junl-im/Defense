import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const stage = path.join(root, 'logs/package/1.0.52/DokkaebiLuckDefense3D_FULL_v1.0.52_EVENT_TIMING_RUNTIME_GUARD_CI_HOTFIX_R10');
if (!fs.existsSync(stage)) throw new Error('v152 staged package missing');
for (const banned of ['dist', 'node_modules', '.git', 'overlay']) if (fs.existsSync(path.join(stage, banned))) throw new Error(`v152 staged package contains ${banned}`);

const forbiddenGenerated = [];
const scanGenerated = (directory, relative = '') => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const rel = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.name === '__pycache__' || /\.py[co]$/i.test(entry.name)) forbiddenGenerated.push(rel);
    if (entry.isDirectory()) scanGenerated(path.join(directory, entry.name), rel);
  }
};
scanGenerated(stage);
if (forbiddenGenerated.length) throw new Error(`v152 staged package contains generated Python bytecode: ${forbiddenGenerated.slice(0, 5).join(', ')}`);
const pkg = JSON.parse(fs.readFileSync(path.join(stage, 'package.json'), 'utf8'));
if (pkg.version !== '1.0.52' || pkg.dokkaebi?.buildId !== 'b24.52') throw new Error('v152 staged identity mismatch');
for (const file of [
  'src/runtime/character-action-timing-v152.js',
  'src/firebase.js',
  'firestore.rules',
  'scripts/verify-leaderboard-integrity-v152.mjs',
  'scripts/verify-gpu-frame-timer-v152.mjs',
  'docs/CI_V152_GPU_CONTEXT_SCOPE_HOTFIX_R9.md',
  'docs/CI_V152_TREND_ISOLATION_HOTFIX_R10.md',
  'src/runtime/character-presentation-budget-v152.js',
  'src/engine/gpu-frame-timer-v152.js',
  'scripts/verify-release-v152.mjs',
  'scripts/verify-runtime-hardening-v152.mjs',
  'scripts/verify-service-worker-install-v152.mjs',
  'scripts/lib/dist-bundle-markers.mjs',
  'scripts/verify-dist-bundle-markers-v152.mjs',
  'scripts/verify-dist-v148.mjs',
  'scripts/verify-dist-v149.mjs',
  'scripts/run-feature-exposure-v149.mjs',
  'scripts/verify-feature-exposure-v149.mjs',
  'src/runtime/feature-exposure-policy-v149.js',
  'scripts/verify-dist-v150.mjs',
  'scripts/verify-dist-v151.mjs',
  'scripts/verify-dist-v152.mjs',
  'scripts/verify-responsibility-extraction-v149.mjs',
  'scripts/verify-performance-reproducibility-v149.mjs',
  'scripts/save-continuity-v147.mjs',
  'scripts/offline-reconnect-model-v147.mjs',
  'scripts/verify-offline-reconnect-v147.mjs',
  'scripts/run-offline-reconnect-v147.mjs',
  'scripts/verify-repository-root-v152.mjs',
  'scripts/verify-project.mjs',
  'scripts/verify-performance-trend-v145.mjs',
  'scripts/verify-performance-guard-v148.mjs',
  'docs/PATCH_NOTES_v1.0.52.md',
  'docs/RELEASE_ASSURANCE_v1.0.52.md',
  'docs/NEXT_UPDATE_v1.0.53.md',
  'PROJECT_HANDOFF.md'
]) if (!fs.existsSync(path.join(stage, file))) throw new Error(`v152 staged contract missing ${file}`);
console.log('PASS v1.0.52 CI hotfix R10 clean source package staging');
