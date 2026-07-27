import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const collect = (dir, exts, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) collect(file, exts, out);
    else if (exts.some((ext) => name.endsWith(ext))) out.push(file);
  }
  return out;
};

const version = JSON.parse(fs.readFileSync(path.join(dist, 'version.json'), 'utf8'));
if (version.releaseVersion !== '1.0.41' || version.buildId !== 'b24.41') throw new Error('v1.0.41 dist identity mismatch');
const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const js = collect(dist, ['.js']).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const css = collect(dist, ['.css']).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const loading = (index.match(/<section id="loading"[\s\S]*?<\/section>/) || [''])[0];
if (!loading.includes('legacy-loading-retired-v141') || !loading.includes('hidden')) throw new Error('legacy loading surface remains active in dist');
if (loading.includes('loading-mascot') || loading.includes('loading-wrap') || loading.includes('<h1>')) throw new Error('old loading artwork remains in dist');
if (!js.includes('DD-APP-STATE-SURFACE-V141') || !js.includes('mapTouchReadyV141')) throw new Error('v141 app-state touch synchronizer missing from dist');
if (!css.includes('data-map-touch-ready-v141') || !css.includes('legacy-loading-retired-v141')) throw new Error('v141 touch/loading CSS missing from dist');
if (js.includes('수호대를 전장으로 부르는 중...')) throw new Error('retired run-entry loading copy remains in dist');
console.log('PASS v1.0.41 dist enables state-backed map touch and excludes legacy loading presentation');
