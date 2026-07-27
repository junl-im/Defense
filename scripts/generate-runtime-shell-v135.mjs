import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const swPath = path.join(root, 'public/sw.js');
const manifestPath = path.join(root, 'public/assets/system-v135/runtime-module-shell-v135.json');
const checkOnly = process.argv.includes('--check');
const startMarker = '// BEGIN GENERATED RUNTIME MODULE SHELL V135';
const endMarker = '// END GENERATED RUNTIME MODULE SHELL V135';
const importPattern = /(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]+?\s+from\s+|import\s*\()\s*['"](\.[^'"]+)['"]/g;
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');

function collect(entry = 'src/bootstrap.js') {
  const seen = new Set();
  const pending = [entry];
  while (pending.length) {
    const relative = pending.pop();
    if (seen.has(relative)) continue;
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) throw new Error(`Runtime import target missing: ${relative}`);
    seen.add(relative);
    const source = fs.readFileSync(absolute, 'utf8');
    importPattern.lastIndex = 0;
    let match;
    while ((match = importPattern.exec(source))) {
      const raw = match[1].split(/[?#]/, 1)[0];
      let target = path.normalize(path.join(path.dirname(relative), raw)).replaceAll('\\', '/');
      if (!path.extname(target)) target += '.js';
      if (!fs.existsSync(path.join(root, target))) throw new Error(`Broken relative import: ${relative} -> ${raw}`);
      pending.push(target);
    }
  }
  return [...seen].sort();
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const files = collect();
const shellLines = files.map((file) => `  './${file}',`);
const generatedBlock = [
  startMarker,
  'const GENERATED_MODULE_SHELL_V135 = Object.freeze([',
  ...shellLines,
  ']);',
  endMarker
].join('\n');

let sw = fs.readFileSync(swPath, 'utf8');
const markerPattern = new RegExp(`${startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
if (markerPattern.test(sw)) sw = sw.replace(markerPattern, generatedBlock);
else sw = sw.replace(/(const CACHE_NAME = `\$\{CACHE_PREFIX\}\$\{BUILD_ID\}`;)/, `$1\n${generatedBlock}`);
if (!sw.includes('...GENERATED_MODULE_SHELL_V135,')) {
  sw = sw.replace('const SHELL_ASSETS = [\n', 'const SHELL_ASSETS = [\n  ...GENERATED_MODULE_SHELL_V135,\n');
}

const records = files.map((file) => {
  const data = fs.readFileSync(path.join(root, file));
  return { path: file, bytes: data.length, sha256: hash(data) };
});
const manifest = {
  schema: 'DD-RUNTIME-MODULE-SHELL-1.0',
  id: 'DD-RELEASE-INTEGRITY-V135',
  releaseVersion: pkg.version,
  buildId: pkg.dokkaebi?.buildId || '',
  cacheRevision: pkg.dokkaebi?.cacheRevision || '',
  entry: 'src/bootstrap.js',
  moduleCount: records.length,
  totalBytes: records.reduce((sum, row) => sum + row.bytes, 0),
  files: records
};
const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;

if (checkOnly) {
  const currentSw = fs.readFileSync(swPath, 'utf8');
  if (currentSw !== sw) throw new Error('Generated runtime module shell is stale; run npm run generate:runtime-shell:v135');
  if (!fs.existsSync(manifestPath) || fs.readFileSync(manifestPath, 'utf8') !== manifestText) throw new Error('Runtime module shell manifest is stale');
  console.log(`PASS runtime module shell v1.0.35 (${records.length} files, ${manifest.totalBytes} bytes)`);
} else {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(swPath, sw);
  fs.writeFileSync(manifestPath, manifestText);
  console.log(`Generated runtime module shell v1.0.35 (${records.length} files, ${manifest.totalBytes} bytes)`);
}
