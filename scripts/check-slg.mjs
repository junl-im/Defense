import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd();
const files = [];
function walk(rel) {
  for (const entry of readdirSync(join(root, rel), { withFileTypes: true })) {
    const f = join(rel, entry.name);
    if (entry.isDirectory()) walk(f);
    else files.push(f);
  }
}
for (const dir of ['src', 'css']) walk(dir);
for (const f of ['index.html', 'LICENSE', 'README.md']) {
  assert(existsSync(join(root, f)), 'Missing required file: ' + f);
}
const html = readFileSync(join(root, 'index.html'), 'utf8');
assert(html.includes('src/main.js'), 'Main game bootstrap missing');
assert(html.includes('three@0.160.0'), 'Pinned Three.js import missing');
assert(!html.includes('image/svg+xml'), 'SVG favicon must not be used');
for (const f of files) {
  const source = readFileSync(join(root, f), 'utf8');
  assert(!source.includes('<svg'), 'SVG markup must not be used: ' + f);
  if (extname(f) !== '.js') continue;
  const pattern = /from\s*['"]([^'"]+)['"]/g;
  for (const match of source.matchAll(pattern)) {
    const dependency = match[1];
    if (!dependency.startsWith('.')) continue;
    const filePath = resolve(root, dirname(f), dependency);
    assert(existsSync(filePath) || existsSync(filePath + '.js'),
      'Broken relative import in ' + f + ': ' + dependency);
  }
}
console.log('PASS: KINGDOM SLG static QA; checked', files.length, 'files');
