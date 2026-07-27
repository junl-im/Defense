import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };

const v119 = read('scripts/verify-dist-v119.mjs');
const v125 = read('scripts/verify-dist-v125.mjs');
const v126 = read('scripts/verify-dist-v126.mjs');
const v127 = read('scripts/verify-dist-v127.mjs');
const v128 = read('scripts/verify-dist-v128.mjs');
const v129 = read('scripts/verify-dist-v129.mjs');
const v134 = read('scripts/verify-dist-v134.mjs');
const foundation = read('scripts/lib/verify-dist-v134-foundation.mjs');
const v135 = read('scripts/verify-dist-v135.mjs');
const v136 = read('scripts/verify-dist-v136.mjs');

check(v119.includes('readJavaScriptBundleRecursive') && v119.includes('catch'), 'v119 Vite bundle fallback');
for (const [name, source] of [['v125', v125], ['v126', v126], ['v127', v127], ['v128', v128], ['v129', v129]]) {
  check(source.includes("path.join(dist, 'assets')") || source.includes('walk(dist)'), `${name} asset bundle fallback`);
}
check(v134.includes('verifyDistV134Foundation') && v134.includes('DIST_DIR'), 'v134 wrapper delegates and supports fixture dist');
check(foundation.includes("staticMode") && foundation.includes("path.join(dist, 'assets')") && foundation.includes("Vite JavaScript bundle"), 'v134 static and Vite dual-mode foundation');
check(!foundation.includes("const required = [\n  'index.html',\n  'version.json',\n  'sw.js',\n  'static-bootstrap.js',\n  'src/main.js'"), 'v134 no unconditional source-tree requirement');
check(v135.includes('staticMode') && v135.includes("walk(path.join(dist, 'assets'))") && v135.includes('revisionCandidates'), 'v135 static, Vite, and cache identity portability');
check(v136.includes('staticMode') && v136.includes("walk(path.join(dist, 'assets'))") && v136.includes('revisionCandidates'), 'v136 static, Vite, and cache identity portability');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.39 dist verifier portability audit: legacy source paths have Vite bundle fallbacks');
