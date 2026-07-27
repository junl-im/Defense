import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
const walk = (directory) => fs.existsSync(directory)
  ? fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)])
  : [];
if (!fs.existsSync(dist)) throw new Error('dist missing; run npm run build or npm run build:static');
for (const relative of ['index.html', 'version.json', 'sw.js', 'static-bootstrap.js', 'assets/system-v135/runtime-module-shell-v135.json']) {
  if (!fs.existsSync(path.join(dist, relative))) throw new Error(`dist missing ${relative}`);
}
const version = JSON.parse(read('version.json'));
const patch = Number(String(version.releaseVersion || '').split('.')[2]);
if (!version.releaseVersion?.startsWith('1.0.') || patch < 36 || version.buildId !== `b24.${patch}`) throw new Error('v1.0.36+ dist identity mismatch');
const revisionCandidates = [
  `release-v1${String(patch).padStart(2, '0')}-b24-${patch}`,
  version.cacheRevision,
  `${version.releaseVersion}-${version.buildId}`
].filter(Boolean);
if (!revisionCandidates.some((candidate) => read('index.html').includes(candidate))) throw new Error('current dist cache identity mismatch');
if (!read('sw.js').includes(`const RELEASE_VERSION = '${version.releaseVersion}';`) || !read('sw.js').includes(`const BUILD_ID = '${version.buildId}';`)) throw new Error('current dist service worker mismatch');
if (fs.existsSync(path.join(dist, 'assets/ip-v13/sheets'))) throw new Error('audit-only IP sheets leaked into dist');
const shell = JSON.parse(read('assets/system-v135/runtime-module-shell-v135.json'));
if (shell.releaseVersion !== version.releaseVersion || shell.buildId !== version.buildId || shell.moduleCount < 100) throw new Error('runtime module shell mismatch');
for (const entry of shell.files) {
  const source = path.join(root, entry.path);
  if (!fs.existsSync(source)) throw new Error(`source runtime module missing ${entry.path}`);
  const data = fs.readFileSync(source);
  if (data.length !== entry.bytes || hash(data) !== entry.sha256) throw new Error(`source runtime module hash mismatch ${entry.path}`);
}
const staticMode = fs.existsSync(path.join(dist, 'src/bootstrap.js'));
if (staticMode) {
  for (const entry of shell.files) {
    const absolute = path.join(dist, entry.path);
    if (!fs.existsSync(absolute)) throw new Error(`dist runtime module missing ${entry.path}`);
    const data = fs.readFileSync(absolute);
    if (entry.path === 'src/main.js') {
      const expected = Buffer.from(fs.readFileSync(path.join(root, entry.path), 'utf8').replace("import './style.css';\n", ''));
      if (data.length !== expected.length || hash(data) !== hash(expected)) throw new Error('dist runtime module transform mismatch src/main.js');
    } else if (data.length !== entry.bytes || hash(data) !== entry.sha256) throw new Error(`dist runtime module hash mismatch ${entry.path}`);
  }
} else {
  const bundles = walk(path.join(dist, 'assets')).filter((file) => /\.(?:js|css)$/.test(file));
  if (!bundles.length) throw new Error('Vite runtime bundles are missing');
  const source = bundles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  for (const marker of ['DD-MOBILE-HUD-STABILITY-V135', 'DD-BOSS-IDENTITY-ASSURANCE-V133', 'DD-RELEASE-ASSURANCE-V124']) {
    if (!source.includes(marker)) throw new Error(`Vite deployment marker missing ${marker}`);
  }
}
console.log(`PASS v1.0.36+ ${staticMode ? 'static' : 'Vite'} dist verified (${shell.moduleCount} source runtime modules)`);
