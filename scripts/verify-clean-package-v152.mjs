import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const stage = path.join(root, 'logs/package/1.0.52/DokkaebiLuckDefense3D_FULL_v1.0.52_EVENT_TIMING_RUNTIME_GUARD');
if (!fs.existsSync(stage)) throw new Error('v152 staged package missing');
for (const banned of ['dist', 'node_modules', '.git', 'overlay']) if (fs.existsSync(path.join(stage, banned))) throw new Error(`v152 staged package contains ${banned}`);
const pkg = JSON.parse(fs.readFileSync(path.join(stage, 'package.json'), 'utf8'));
if (pkg.version !== '1.0.52' || pkg.dokkaebi?.buildId !== 'b24.52') throw new Error('v152 staged identity mismatch');
for (const file of [
  'src/runtime/character-action-timing-v152.js',
  'src/runtime/character-presentation-budget-v152.js',
  'src/engine/gpu-frame-timer-v152.js',
  'scripts/verify-release-v152.mjs',
  'scripts/verify-runtime-hardening-v152.mjs',
  'docs/PATCH_NOTES_v1.0.52.md',
  'docs/RELEASE_ASSURANCE_v1.0.52.md',
  'docs/NEXT_UPDATE_v1.0.53.md',
  'PROJECT_HANDOFF.md'
]) if (!fs.existsSync(path.join(stage, file))) throw new Error(`v152 staged contract missing ${file}`);
console.log('PASS v1.0.52 clean source package staging');
