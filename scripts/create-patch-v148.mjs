import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { V148_PATCH_FILES } from './v148-patch-files.mjs';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'logs/patch/1.0.48');
const overlay = path.join(out, 'overlay');
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
if (!V148_PATCH_FILES.length) throw new Error('v148 patch file list is empty');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(overlay, { recursive: true });
const rows = [];
for (const file of V148_PATCH_FILES) {
  const source = path.join(root, file);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error(`v148 patch source missing: ${file}`);
  const target = path.join(overlay, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  const data = fs.readFileSync(source);
  rows.push({ path: file, bytes: data.length, sha256: sha256(data) });
}
const manifest = { baseVersion: '1.0.47', targetVersion: '1.0.48', buildId: 'b24.48', applyMode: 'direct-overlay', counts: { changed: rows.length, deleted: 0 }, deletedPaths: [], files: rows };
fs.writeFileSync(path.join(out, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(out, 'APPLY_KO.txt'), [
  'Dokkaebi Luck Defense 3D v1.0.48 패치 적용 안내', '',
  '기준 버전: v1.0.47 / b24.47', '목표 버전: v1.0.48 / b24.48', '',
  '오직 overlay/ 폴더 안의 내용만 프로젝트 루트에 덮어씁니다.',
  'APPLY_KO.txt와 PATCH_MANIFEST.json은 저장소 루트에 복사하지 않습니다.', '',
  '적용 후:', '  rm -rf dist', '  npm ci', '  npm run verify:ci',
  '  VITE_BASE_PATH=/Defense/ npm run build', '  npm run verify:dist:all', ''
].join('\n'));
console.log(JSON.stringify({ patchRoot: out, overlay, changed: rows.length }, null, 2));
