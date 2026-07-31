import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const checkOnly = process.argv.includes('--check');
const files = [
  '.github/workflows/deploy.yml',
  'package.json',
  'package-lock.json',
  'index.html',
  'src/main.js',
  'src/version-policy.js',
  'public/sw.js',
  'public/static-bootstrap.js',
  'src/engine/animation-state-system.js',
  'src/engine/character-material-enhancer-v151.js',
  'src/engine/gpu-frame-timer-v152.js',
  'src/runtime/character-action-timing-v152.js',
  'src/runtime/character-presentation-budget-v152.js',
  'src/runtime/character-presentation-director-v151.js',
  'src/runtime/result-presenter-v149.js',
  'scripts/verify-release-v152.mjs',
  'scripts/verify-runtime-hardening-v152.mjs',
  'scripts/verify-repository-root-v152.mjs',
  'scripts/verify-code-integrity.mjs',
  'scripts/verify-project.mjs',
  'scripts/verify-golden-motion.mjs',
  'scripts/generate-release-identity-v152.mjs',
  'scripts/verify-v1600.mjs',
  'scripts/verify-v2302.mjs',
  'scripts/clean-obsolete-assets.mjs',
  'scripts/verify-performance-trend-v145.mjs',
  'scripts/verify-performance-guard-v148.mjs',
  'scripts/verify-release-v148.mjs',
  'scripts/verify-dist-chain-v140.mjs',
  'scripts/verify-dist-v146.mjs'
];
const sha = (data) => createHash('sha256').update(data).digest('hex');
const rows = files.map((file) => {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) throw new Error(`v152 signed source missing: ${file}`);
  const data = fs.readFileSync(absolute);
  return { path: file, bytes: data.length, sha256: sha(data) };
});
const manifest = {
  id: 'DD-CI-SOURCE-REVISION-V152',
  releaseVersion: '1.0.52',
  buildId: 'b24.52',
  marker: 'DD-V152-EVENT-TIMING-RUNTIME-GUARD',
  files: rows
};
const target = path.join(root, 'docs/generated/ci-source-revision-v152.json');
const text = `${JSON.stringify(manifest, null, 2)}\n`;
if (checkOnly) {
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== text) throw new Error('v152 CI source revision manifest is stale');
  console.log(`PASS v1.0.52 CI source revision manifest (${rows.length} files)`);
} else {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text);
  console.log(`Generated v1.0.52 CI source revision manifest (${rows.length} files)`);
}
