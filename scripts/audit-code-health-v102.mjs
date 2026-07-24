import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { getLogPath } from './output-paths.mjs';

const root = resolve(import.meta.dirname, '..');
const rel = (path) => relative(root, path).replaceAll('\\', '/');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const walk = (directory, predicate = () => true) => {
  const output = [];
  const visit = (path) => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      if (['node_modules', '.git', 'dist', 'logs'].includes(entry.name)) continue;
      const absolute = resolve(path, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (predicate(absolute)) output.push(absolute);
    }
  };
  visit(resolve(root, directory));
  return output;
};

const sourceFiles = walk('src', (path) => path.endsWith('.js'));
const sourceByPath = new Map(sourceFiles.map((path) => [path, rel(path)]));
const importPattern = /(?:import\s+(?:[^'\"]+?\s+from\s+)?|export\s+[^'\"]+?\s+from\s+|import\s*\()\s*['\"]([^'\"]+)['\"]/g;
const graph = new Map(sourceFiles.map((path) => [path, new Set()]));

for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(importPattern)) {
    const specifier = match[1];
    if (!specifier.startsWith('.')) continue;
    const base = resolve(file, '..', specifier);
    const candidates = [base, `${base}.js`, resolve(base, 'index.js')];
    const target = candidates.find((candidate) => sourceByPath.has(candidate));
    if (target) graph.get(file).add(target);
  }
}

const entries = ['src/bootstrap.js', 'src/main.js'].map((path) => resolve(root, path)).filter((path) => sourceByPath.has(path));
const reachable = new Set();
const stack = [...entries];
while (stack.length) {
  const file = stack.pop();
  if (reachable.has(file)) continue;
  reachable.add(file);
  for (const target of graph.get(file) || []) stack.push(target);
}

const verificationOnlyAllowlist = new Set([
  'src/engine/camera-director-v14.js',
  'src/engine/camera-director-v15.js',
  'src/ip-asset-library-v8.js',
  'src/ip-asset-library-v9.js',
  'src/ip-asset-library-v10.js',
  'src/ip-asset-library-v13.js',
  'src/ip-asset-library-v14.js',
  'src/ip-production-spec.js',
  'src/rigged-enemy-candidate-spec.js',
  'src/runtime/battlefield-sprite-director.js',
  'src/runtime/battlefield-sprite-director-v15.js',
  'src/runtime/mobile-hud-director-v21.js',
  'src/runtime/mobile-hud-director-v22.js',
  'src/runtime/ten-wave-reliability-simulation.js'
]);
const inactive = sourceFiles.map(rel).filter((path) => !reachable.has(resolve(root, path))).sort();
const unexpectedInactive = inactive.filter((path) => !verificationOnlyAllowlist.has(path));

const unusedImports = [];
const importLinePattern = /^\s*import\s+(.+?)\s+from\s+['\"]([^'\"]+)['\"];?\s*$/gm;
for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(importLinePattern)) {
    const clause = match[1].trim();
    const names = [];
    if (clause.startsWith('{')) {
      for (const item of clause.slice(1, -1).split(',')) {
        const token = item.trim();
        if (token) names.push(token.split(/\s+as\s+/).at(-1));
      }
    } else if (clause.startsWith('* as ')) {
      names.push(clause.slice(5).trim());
    } else {
      names.push(clause.split(',')[0].trim());
      if (clause.includes('{')) {
        const inner = clause.split('{', 2)[1].split('}', 1)[0];
        for (const item of inner.split(',')) {
          const token = item.trim();
          if (token) names.push(token.split(/\s+as\s+/).at(-1));
        }
      }
    }
    for (const name of names) {
      const count = (text.match(new RegExp(`\\b${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'g')) || []).length;
      if (count <= 1) unusedImports.push({ file: rel(file), binding: name, module: match[2] });
    }
  }
}

const duplicateDocs = [];
const hashes = new Map();
for (const file of walk('docs', (path) => path.endsWith('.md'))) {
  const digest = createHash('sha256').update(readFileSync(file)).digest('hex');
  const key = `${digest}:${statSync(file).size}`;
  const list = hashes.get(key) || [];
  list.push(rel(file));
  hashes.set(key, list);
}
for (const files of hashes.values()) if (files.length > 1) duplicateDocs.push(files.sort());

const pkg = JSON.parse(read('package.json'));
const missingCommandFiles = [];
for (const [name, command] of Object.entries(pkg.scripts || {})) {
  for (const match of command.matchAll(/(?:node(?:\s+--check)?|python(?:\s+-S)?)\s+((?:src|scripts)\/[A-Za-z0-9._/-]+)/g)) {
    if (!existsSync(resolve(root, match[1]))) missingCommandFiles.push({ script: name, path: match[1] });
  }
}

const main = read('src/main.js');
const css = read('src/style.css');
const runtimeDuplication = [];
if (main.includes('new MobileHudDirectorV22') || main.includes("import MobileHudDirectorV22")) runtimeDuplication.push('obsolete MobileHudDirectorV22 runtime wiring');
if (css.includes('body.mobile-hud-v21 ') || css.includes('body.mobile-hud-v22 ')) runtimeDuplication.push('obsolete mobile-hud-v21/v22 CSS selectors');
if (existsSync(resolve(root, 'docs/ASSET_BIBLE.md'))) runtimeDuplication.push('duplicate docs/ASSET_BIBLE.md');

const report = {
  releaseVersion: pkg.version,
  lineageVersion: pkg.dokkaebi?.lineageVersion,
  generatedAt: new Date().toISOString(),
  summary: {
    sourceModules: sourceFiles.length,
    runtimeReachableModules: reachable.size,
    verificationOnlyModules: inactive.length,
    unexpectedInactiveModules: unexpectedInactive.length,
    unusedImports: unusedImports.length,
    duplicateAuthoredDocuments: duplicateDocs.length,
    missingCommandFiles: missingCommandFiles.length,
    runtimeDuplication: runtimeDuplication.length
  },
  verificationOnlyModules: inactive,
  unexpectedInactiveModules: unexpectedInactive,
  unusedImports,
  duplicateAuthoredDocuments: duplicateDocs,
  missingCommandFiles,
  runtimeDuplication,
  policy: {
    verificationOnlyAllowlist: [...verificationOnlyAllowlist].sort(),
    note: '과거 회귀 증거 모듈은 실행 그래프 밖에 있어도 명시적 허용 목록으로만 보존한다.'
  }
};

const output = getLogPath('audits', 'CODE_HEALTH_AUDIT_v1.0.2.json');
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);

const failures = [
  ...unexpectedInactive.map((path) => `unexpected inactive runtime module: ${path}`),
  ...unusedImports.map((item) => `unused import: ${item.file} -> ${item.binding}`),
  ...duplicateDocs.map((files) => `duplicate authored documents: ${files.join(', ')}`),
  ...missingCommandFiles.map((item) => `missing command file: ${item.script} -> ${item.path}`),
  ...runtimeDuplication
];
for (const [label, value] of Object.entries(report.summary)) console.log(`PASS ${label}: ${value}`);
console.log(`AUDIT ${output}`);
if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('\nv1.0.2 code health audit passed');
