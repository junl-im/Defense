import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'logs/patch/1.0.45');
const overlay = path.join(out, 'overlay');
const files = [
  '.github/workflows/deploy.yml',
  'README.md',
  'PROJECT_HANDOFF.md',
  'package.json',
  'package-lock.json',
  'index.html',
  'src/main.js',
  'src/version-policy.js',
  'src/runtime/long-session-assurance-v145.js',
  'public/version.json',
  'public/sw.js',
  'public/static-bootstrap.js',
  'public/assets/system-v135/runtime-module-shell-v135.json',
  'scripts/root-output-policy.mjs',
  'scripts/verify-root-migration-v101.mjs',
  'scripts/verify-release-v144.mjs',
  'scripts/verify-dist-v144.mjs',
  'scripts/verify-dist-chain-v140.mjs',
  'scripts/generate-asset-residency-v145.mjs',
  'scripts/verify-performance-trend-v145.mjs',
  'scripts/verify-long-session-model-v145.mjs',
  'scripts/run-long-session-v145.mjs',
  'scripts/verify-release-v145.mjs',
  'scripts/verify-dist-v145.mjs',
  'scripts/stage-clean-package-v145.mjs',
  'scripts/verify-clean-package-v145.mjs',
  'scripts/create-patch-v145.mjs',
  'scripts/verify-patch-v145.mjs',
  'docs/PERFORMANCE_BASELINE_v1.0.44.json',
  'docs/RELEASE_ASSURANCE_v1.0.45.md',
  'docs/PATCH_NOTES_v1.0.45.md',
  'docs/PATCH_APPLY_v1.0.45.md',
  'docs/NEXT_UPDATE_v1.0.46.md',
  'docs/generated/runtime-asset-reachability-v143.json',
  'docs/generated/runtime-asset-reachability-v143.md',
  'docs/generated/presentation-surface-snapshots-v143.json',
  'docs/generated/asset-review-v144.json',
  'docs/generated/asset-review-v144.md',
  'docs/generated/asset-residency-v145.json',
  'docs/generated/asset-residency-v145.md'
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(overlay, { recursive: true });
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
const rows = [];
for (const file of files) {
  const source = path.join(root, file);
  const target = path.join(overlay, file);
  if (!fs.existsSync(source)) throw new Error(`missing ${file}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  const data = fs.readFileSync(source);
  rows.push({ path: file, bytes: data.length, sha256: hash(data) });
}
const manifest = {
  baseVersion: '1.0.44',
  targetVersion: '1.0.45',
  buildId: 'b24.45',
  applyMode: 'direct-overlay',
  counts: { changed: rows.length, deleted: 0 },
  deletedPaths: [],
  files: rows
};
fs.writeFileSync(path.join(out, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(out, 'APPLY_KO.txt'), `Dokkaebi Luck Defense 3D v1.0.45 패치 적용 안내\n\n기준 버전: v1.0.44 / b24.44\n목표 버전: v1.0.45 / b24.45\n\n중요: 이 폴더 전체를 프로젝트 루트에 복사하지 마십시오.\n오직 overlay/ 폴더 안의 내용만 프로젝트 루트에 덮어씁니다.\nAPPLY_KO.txt와 PATCH_MANIFEST.json은 패치 메타데이터이며 저장소 파일이 아닙니다.\n\n적용 후:\n  rm -rf dist\n  npm ci\n  npm run verify:release:v145\n  VITE_BASE_PATH=/Defense/ npm run build\n  REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 npm run verify:dist:all\n`);
console.log(JSON.stringify({ patchRoot: out, overlay, changed: rows.length }, null, 2));
