import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'logs/patch/1.0.47');
const overlay = path.join(out, 'overlay');
const files = [
  '.github/workflows/deploy.yml',
  'PROJECT_HANDOFF.md',
  'README.md',
  'docs/NEXT_UPDATE_v1.0.48.md',
  'docs/PATCH_APPLY_v1.0.47.md',
  'docs/PATCH_NOTES_v1.0.47.md',
  'docs/PERFORMANCE_BASELINE_v1.0.45_DIST.json',
  'docs/RELEASE_ASSURANCE_v1.0.47.md',
  'docs/qa/device-viewport-traces-v147.json',
  'docs/qa/v145-dist-baseline-approval-v147.json',
  'index.html',
  'package-lock.json',
  'package.json',
  'public/assets/system-v135/runtime-module-shell-v135.json',
  'public/static-bootstrap.js',
  'public/sw.js',
  'public/version.json',
  'scripts/browser-evidence-bundle-v147.mjs',
  'scripts/compact-browser-evidence-v147.mjs',
  'scripts/create-patch-v147.mjs',
  'scripts/device-trace-ingestion-v147.mjs',
  'scripts/dist-baseline-promotion-v147.mjs',
  'scripts/ingest-device-trace-v147.mjs',
  'scripts/offline-reconnect-model-v147.mjs',
  'scripts/promote-v145-dist-baseline-v147.mjs',
  'scripts/run-offline-reconnect-v147.mjs',
  'scripts/save-schema-fuzz-v147.mjs',
  'scripts/stage-clean-package-v147.mjs',
  'scripts/verify-baseline-promotion-v147.mjs',
  'scripts/verify-browser-evidence-v147.mjs',
  'scripts/verify-clean-package-v147.mjs',
  'scripts/verify-device-traces-v147.mjs',
  'scripts/verify-dist-chain-v140.mjs',
  'scripts/verify-dist-trend-v147.mjs',
  'scripts/verify-dist-v147.mjs',
  'scripts/verify-offline-reconnect-v147.mjs',
  'scripts/verify-patch-v147.mjs',
  'scripts/verify-release-v146.mjs',
  'scripts/verify-release-v147.mjs',
  'scripts/verify-save-schema-fuzz-v147.mjs',
  'scripts/verify-trace-ingestion-v147.mjs',
  'src/main.js',
  'src/version-policy.js',
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(overlay, { recursive: true });
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const rows = [];
for (const file of files) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) throw new Error(`v147 patch source missing: ${file}`);
  const target = path.join(overlay, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  const data = fs.readFileSync(source);
  rows.push({ path: file, bytes: data.length, sha256: sha256(data) });
}
const manifest = {
  baseVersion: '1.0.46',
  targetVersion: '1.0.47',
  buildId: 'b24.47',
  applyMode: 'direct-overlay',
  counts: { changed: rows.length, deleted: 0 },
  deletedPaths: [],
  files: rows,
};
fs.writeFileSync(path.join(out, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(out, 'APPLY_KO.txt'), [
  'Dokkaebi Luck Defense 3D v1.0.47 패치 적용 안내',
  '',
  '기준 버전: v1.0.46 / b24.46 FINAL CI HARDENED',
  '목표 버전: v1.0.47 / b24.47',
  '',
  '중요: 오직 overlay/ 폴더 안의 내용만 프로젝트 루트에 덮어씁니다.',
  'APPLY_KO.txt와 PATCH_MANIFEST.json은 저장소에 복사하지 않습니다.',
  '',
  '적용 후:',
  '  rm -rf dist',
  '  npm ci',
  '  npm run verify:ci',
  '  VITE_BASE_PATH=/Defense/ npm run build',
  '  REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 REQUIRE_BROWSER_V146=1 REQUIRE_BROWSER_V147=1 npm run verify:dist:all',
  '',
].join('\n'));
console.log(JSON.stringify({ patchRoot: out, overlay, changed: rows.length }, null, 2));
