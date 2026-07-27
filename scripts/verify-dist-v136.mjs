import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
if (!fs.existsSync(dist)) throw new Error('dist missing; run npm run build:static');
for (const relative of ['index.html', 'version.json', 'sw.js', 'static-bootstrap.js', 'src/main.js', 'src/version-policy.js', 'assets/system-v135/runtime-module-shell-v135.json']) {
  if (!fs.existsSync(path.join(dist, relative))) throw new Error(`dist missing ${relative}`);
}
const version = JSON.parse(read('version.json'));
if (version.releaseVersion !== '1.0.36' || version.lineageVersion !== '23.4.0' || version.buildId !== 'b24.36') throw new Error('v1.0.36 dist identity mismatch');
if (!read('index.html').includes('release-v136-b24-36') || !read('index.html').includes('1.0.36-b24.36')) throw new Error('v1.0.36 dist cache identity mismatch');
if (!read('sw.js').includes("const RELEASE_VERSION = '1.0.36';") || !read('sw.js').includes("const BUILD_ID = 'b24.36';")) throw new Error('v1.0.36 dist service worker mismatch');
if (fs.existsSync(path.join(dist, 'assets/ip-v13/sheets'))) throw new Error('audit-only IP sheets leaked into dist');
const shell = JSON.parse(read('assets/system-v135/runtime-module-shell-v135.json'));
if (shell.releaseVersion !== '1.0.36' || shell.buildId !== 'b24.36' || shell.moduleCount < 100) throw new Error('runtime module shell mismatch');
for (const entry of shell.files) {
  const absolute = path.join(dist, entry.path);
  if (!fs.existsSync(absolute)) throw new Error(`dist runtime module missing ${entry.path}`);
  const data = fs.readFileSync(absolute);
  if (entry.path === 'src/main.js') {
    const expected = Buffer.from(fs.readFileSync(path.join(root, entry.path), 'utf8').replace("import './style.css';\n", ''));
    if (data.length !== expected.length || hash(data) !== hash(expected)) throw new Error('dist runtime module transform mismatch src/main.js');
  } else if (data.length !== entry.bytes || hash(data) !== entry.sha256) throw new Error(`dist runtime module hash mismatch ${entry.path}`);
}
console.log(`PASS v1.0.36 static dist verified (${shell.moduleCount} runtime modules)`);
