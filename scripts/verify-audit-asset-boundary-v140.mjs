import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const publicSheets = path.join(root, 'public/assets/ip-v13/sheets');
const archiveRoot = path.join(root, 'production/DokkaebiDefense/15_Source_Archives/ip-v13/sheets');
const manifestPath = path.join(root, 'public/assets/ip-v13/asset-manifest-v13.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };

check(!fs.existsSync(publicSheets), 'audit-only source sheets are absent from public');
check(fs.existsSync(archiveRoot), 'production source-sheet archive exists');
check(Array.isArray(manifest.sheets) && manifest.sheets.length === 10, 'manifest registers ten source sheets');
let archiveBytes = 0;
for (const sheet of manifest.sheets || []) {
  const file = path.join(archiveRoot, sheet.file);
  check(fs.existsSync(file), `archived sheet ${sheet.file}`);
  if (fs.existsSync(file)) {
    archiveBytes += fs.statSync(file).size;
    check(sha256(file) === sheet.sha256, `archived sheet hash ${sheet.file}`);
  }
}
check(archiveBytes > 25_000_000, 'source archive retains full-resolution audit material');
const runtimeFiles = ['src', 'index.html', 'public/asset-library-v13.html'];
for (const relative of runtimeFiles) {
  const absolute = path.join(root, relative);
  const files = fs.statSync(absolute).isDirectory()
    ? fs.readdirSync(absolute, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => path.join(entry.parentPath || entry.path, entry.name))
    : [absolute];
  for (const file of files) {
    if (!/\.(?:js|mjs|html|css|json)$/i.test(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    check(!text.includes('assets/ip-v13/sheets/'), `runtime does not reference source sheet: ${path.relative(root, file)}`);
  }
}
const clean = fs.readFileSync(path.join(root, 'scripts/clean-obsolete-assets.mjs'), 'utf8');
const generator = fs.readFileSync(path.join(root, 'scripts/generate-asset-sheets-v13.py'), 'utf8');
check(clean.includes("'public/assets/ip-v13/sheets'"), 'prebuild removes legacy public source sheets after overlay patches');
check(generator.includes("production/DokkaebiDefense/15_Source_Archives/ip-v13/sheets"), 'sheet generator reads the production archive');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log(`PASS v1.0.40 audit asset boundary: 10 source sheets / ${archiveBytes} bytes archived outside public`);
