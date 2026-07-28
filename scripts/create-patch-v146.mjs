import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'); const out=path.join(root,'logs/patch/1.0.46'); const overlay=path.join(out,'overlay');
const files=[
  '.github/workflows/deploy.yml',
  'PROJECT_HANDOFF.md',
  'README.md',
  'docs/NEXT_UPDATE_v1.0.47.md',
  'docs/PATCH_APPLY_v1.0.46.md',
  'docs/PATCH_NOTES_v1.0.46.md',
  'docs/PERFORMANCE_BASELINE_v1.0.45_DIST.json',
  'docs/RELEASE_ASSURANCE_v1.0.46.md',
  'docs/generated/asset-residency-v145.json',
  'docs/generated/asset-review-v144.json',
  'docs/generated/asset-review-v144.md',
  'docs/generated/runtime-asset-reachability-v143.json',
  'docs/generated/runtime-asset-reachability-v143.md',
  'docs/qa/device-viewport-traces-v146.json',
  'index.html',
  'package-lock.json',
  'package.json',
  'public/assets/system-v135/runtime-module-shell-v135.json',
  'public/static-bootstrap.js',
  'public/sw.js',
  'public/version.json',
  'scripts/create-patch-v146.mjs',
  'scripts/generate-asset-residency-v145.mjs',
  'scripts/run-release-assurance-v146.mjs',
  'scripts/stage-clean-package-v146.mjs',
  'scripts/verify-clean-package-v146.mjs',
  'scripts/verify-device-traces-v146.mjs',
  'scripts/verify-dist-chain-v140.mjs',
  'scripts/verify-dist-trend-v146.mjs',
  'scripts/verify-dist-v145.mjs',
  'scripts/verify-dist-v146.mjs',
  'scripts/verify-failure-digest-v146.mjs',
  'scripts/verify-patch-v146.mjs',
  'scripts/verify-performance-trend-v145.mjs',
  'scripts/verify-release-v145.mjs',
  'scripts/verify-release-v146.mjs',
  'scripts/verify-service-worker-upgrade-v146.mjs',
  'src/main.js',
  'src/runtime/device-trace-assurance-v146.js',
  'src/runtime/failure-digest-v146.js',
  'src/runtime/service-worker-upgrade-assurance-v146.js',
  'src/version-policy.js',
];
fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(overlay,{recursive:true}); const hash=(data)=>createHash('sha256').update(data).digest('hex'); const rows=[];
for(const file of files){const source=path.join(root,file); if(!fs.existsSync(source)) throw new Error(`missing ${file}`); const target=path.join(overlay,file); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.copyFileSync(source,target); const data=fs.readFileSync(source); rows.push({path:file,bytes:data.length,sha256:hash(data)});}
const manifest={baseVersion:'1.0.45',targetVersion:'1.0.46',buildId:'b24.46',applyMode:'direct-overlay',counts:{changed:rows.length,deleted:0},deletedPaths:[],files:rows};
fs.writeFileSync(path.join(out,'PATCH_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(out,'APPLY_KO.txt'),'Dokkaebi Luck Defense 3D v1.0.46 패치 적용 안내\n\n기준 버전: v1.0.45 / b24.45\n목표 버전: v1.0.46 / b24.46\n\n중요: 오직 overlay/ 폴더 안의 내용만 프로젝트 루트에 덮어씁니다.\nAPPLY_KO.txt와 PATCH_MANIFEST.json은 저장소에 복사하지 않습니다.\n\n적용 후:\n  rm -rf dist\n  npm ci\n  npm run verify:release:v146\n  VITE_BASE_PATH=/Defense/ npm run build\n  REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 REQUIRE_BROWSER_V146=1 npm run verify:dist:all\n');
console.log(JSON.stringify({patchRoot:out,overlay,changed:rows.length},null,2));
