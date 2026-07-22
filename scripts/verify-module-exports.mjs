import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(root, 'src');

function listJavaScriptFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listJavaScriptFiles(full);
    return entry.isFile() && entry.name.endsWith('.js') ? [full] : [];
  });
}

function resolveRelativeModule(importer, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(importer), specifier);
  const candidates = [base, `${base}.js`, path.join(base, 'index.js')];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null;
}

function splitSpecifiers(source) {
  return source.split(',').map((item) => item.trim()).filter(Boolean);
}

function parseExportList(source) {
  return splitSpecifiers(source).map((item) => {
    const clean = item.replace(/^type\s+/, '').trim();
    const match = clean.match(/^([\w$]+)(?:\s+as\s+([\w$]+))?$/);
    return match ? { imported: match[1], exported: match[2] ?? match[1] } : null;
  }).filter(Boolean);
}

const exportMemo = new Map();
const exportStack = new Set();

function collectExports(file) {
  if (exportMemo.has(file)) return exportMemo.get(file);
  if (exportStack.has(file)) return new Set();
  exportStack.add(file);

  const source = fs.readFileSync(file, 'utf8');
  const names = new Set();

  for (const match of source.matchAll(/\bexport\s+(?:async\s+)?(?:const|let|var|function|class)\s+([\w$]+)/g)) {
    names.add(match[1]);
  }

  if (/\bexport\s+default\b/.test(source)) names.add('default');

  for (const match of source.matchAll(/\bexport\s*\{([\s\S]*?)\}\s*(?:from\s*['"]([^'"]+)['"])?\s*;?/g)) {
    const entries = parseExportList(match[1]);
    const from = match[2];
    if (!from) {
      entries.forEach(({ exported }) => names.add(exported));
      continue;
    }
    const target = resolveRelativeModule(file, from);
    const targetExports = target ? collectExports(target) : null;
    for (const { imported, exported } of entries) {
      if (!targetExports || targetExports.has(imported)) names.add(exported);
    }
  }

  for (const match of source.matchAll(/\bexport\s*\*\s*from\s*['"]([^'"]+)['"]\s*;?/g)) {
    const target = resolveRelativeModule(file, match[1]);
    if (!target) continue;
    for (const name of collectExports(target)) {
      if (name !== 'default') names.add(name);
    }
  }

  exportStack.delete(file);
  exportMemo.set(file, names);
  return names;
}

const errors = [];
for (const file of listJavaScriptFiles(srcRoot)) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/\bimport\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]\s*;?/g)) {
    const target = resolveRelativeModule(file, match[2]);
    if (!target) continue;
    const available = collectExports(target);
    for (const entry of splitSpecifiers(match[1])) {
      const clean = entry.replace(/^type\s+/, '').trim();
      const imported = clean.split(/\s+as\s+/)[0]?.trim();
      if (imported && !available.has(imported)) {
        errors.push(`${path.relative(root, file)} imports missing export ${imported} from ${path.relative(root, target)}`);
      }
    }
  }
}

if (errors.length) {
  console.error('[module-export-contract] failed');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`[module-export-contract] passed (${listJavaScriptFiles(srcRoot).length} modules)`);
