import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const versionPath = path.join(dist, 'version.json');
if (!fs.existsSync(versionPath)) throw new Error('dist/version.json missing');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
if (version.releaseVersion !== '1.0.40' || version.lineageVersion !== '23.8.0' || version.buildId !== 'b24.40') {
  throw new Error('v1.0.40 dist identity mismatch');
}
if (fs.existsSync(path.join(dist, 'assets/ip-v13/sheets'))) throw new Error('audit-only IP source sheets leaked into dist');
for (const relative of [
  'assets/ip-v13/asset-manifest-v13.json',
  'assets/ip-v13/crops/heroes/heroes-r01-c01.png',
  'assets/ip-v13/crops/ui/ui-r01-c01.png'
]) {
  if (!fs.existsSync(path.join(dist, relative))) throw new Error(`runtime crop foundation missing: dist/${relative}`);
}
console.log('PASS v1.0.40 dist excludes audit source sheets while preserving runtime crops');
