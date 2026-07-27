import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
if (!fs.existsSync(dist)) throw new Error('dist directory is missing');
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
const walk = (directory) => fs.existsSync(directory)
  ? fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)])
  : [];
const requiredPublic = ['index.html', 'version.json', 'sw.js', 'static-bootstrap.js', 'assets/system-v135/runtime-module-shell-v135.json'];
for (const relative of requiredPublic) if (!fs.existsSync(path.join(dist, relative))) throw new Error(`v1.0.35+ missing dist/${relative}`);
const version = JSON.parse(read('version.json'));
const patch = Number(String(version.releaseVersion || '').split('.')[2]);
if (!version.releaseVersion?.startsWith('1.0.') || patch < 35 || version.buildId !== `b24.${patch}`) throw new Error('v1.0.35+ dist identity mismatch');
const revisionCandidates = [
  `release-v1${String(patch).padStart(2, '0')}-b24-${patch}`,
  version.cacheRevision,
  `${version.releaseVersion}-${version.buildId}`
].filter(Boolean);
if (!revisionCandidates.some((candidate) => read('index.html').includes(candidate))) throw new Error('current dist cache revision missing');
if (!read('sw.js').includes(`const RELEASE_VERSION = '${version.releaseVersion}';`) || !read('sw.js').includes(`const BUILD_ID = '${version.buildId}';`)) throw new Error('current dist service worker mismatch');
const moduleShell = JSON.parse(read('assets/system-v135/runtime-module-shell-v135.json'));
if (moduleShell.releaseVersion !== version.releaseVersion || moduleShell.buildId !== version.buildId || moduleShell.moduleCount < 100) throw new Error('current module shell manifest mismatch');
for (const entry of moduleShell.files) {
  const source = path.join(root, entry.path);
  if (!fs.existsSync(source)) throw new Error(`source runtime module missing: ${entry.path}`);
  const sourceData = fs.readFileSync(source);
  if (sourceData.length !== entry.bytes || hash(sourceData) !== entry.sha256) throw new Error(`source runtime module hash mismatch: ${entry.path}`);
}
const staticMode = fs.existsSync(path.join(dist, 'src/bootstrap.js'));
if (staticMode) {
  for (const entry of moduleShell.files) {
    const absolute = path.join(dist, entry.path);
    if (!fs.existsSync(absolute)) throw new Error(`static dist runtime module missing: ${entry.path}`);
    const data = fs.readFileSync(absolute);
    if (entry.path === 'src/main.js') {
      const expected = Buffer.from(fs.readFileSync(path.join(root, entry.path), 'utf8').replace("import './style.css';\n", ''));
      if (data.length !== expected.length || hash(data) !== hash(expected)) throw new Error('static dist runtime transform mismatch: src/main.js');
    } else if (data.length !== entry.bytes || hash(data) !== entry.sha256) throw new Error(`static dist runtime module hash mismatch: ${entry.path}`);
  }
} else {
  const bundleFiles = walk(path.join(dist, 'assets')).filter((file) => /\.(?:js|css)$/.test(file));
  if (!bundleFiles.length) throw new Error('Vite runtime bundles are missing');
  const bundle = bundleFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  for (const marker of ['DD-MOBILE-HUD-STABILITY-V135', 'DD-BOSS-IDENTITY-ASSURANCE-V133', 'animateTransientVisual']) {
    if (!bundle.includes(marker)) throw new Error(`Vite runtime marker missing: ${marker}`);
  }
}
if (fs.existsSync(path.join(dist, 'assets/ip-v13/sheets'))) throw new Error('audit-only IP sheets leaked into dist');
if (fs.existsSync(path.join(dist, 'COMPACT_PACKAGE_NOTE.txt')) || fs.existsSync(path.join(dist, 'REBUILD_DIST_WINDOWS.bat'))) throw new Error('obsolete compact root file leaked into dist');
console.log(`PASS v1.0.35+ ${staticMode ? 'static' : 'Vite'} deployment preserves runtime lifecycle, UI safety, and ${moduleShell.moduleCount} source module hashes`);
