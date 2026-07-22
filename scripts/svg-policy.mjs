import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';

const SKIP_DIRS = new Set(['node_modules', '.git', '.firebase']);
const RUNTIME_ROOTS = ['index.html', 'src', 'public', 'dist', 'dist-pages'];
const TEXT_EXTENSIONS = new Set(['.html', '.css', '.js', '.mjs', '.cjs', '.json', '.webmanifest', '.ts']);

function walkFiles(path, output = []) {
  if (!existsSync(path)) return output;
  const stats = statSync(path);
  if (stats.isFile()) {
    output.push(path);
    return output;
  }
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    walkFiles(resolve(path, entry.name), output);
  }
  return output;
}

function lineNumberAt(text, index) {
  return text.slice(0, Math.max(0, index)).split('\n').length;
}

function addContentViolation(violations, root, file, kind, match, index) {
  violations.push({
    kind,
    path: relative(root, file).replaceAll('\\', '/'),
    line: lineNumberAt(readFileSync(file, 'utf8'), index),
    detail: String(match).slice(0, 180),
  });
}

export function scanSvgPolicy(root) {
  const absoluteRoot = resolve(root);
  const violations = [];

  // Actual SVG files are forbidden anywhere in the deliverable tree.
  for (const file of walkFiles(absoluteRoot)) {
    if (file.toLowerCase().endsWith('.svg')) {
      violations.push({
        kind: 'svg-file',
        path: relative(absoluteRoot, file).replaceAll('\\', '/'),
        line: 0,
        detail: 'SVG file is not allowed',
      });
    }
  }

  // Runtime references are scanned separately so policy docs/scripts can mention
  // the format without being mistaken for an asset reference.
  const runtimeFiles = [];
  for (const entry of RUNTIME_ROOTS) walkFiles(resolve(absoluteRoot, entry), runtimeFiles);

  const patterns = [
    { kind: 'inline-svg', regex: /<svg\b/gi },
    { kind: 'svg-data-uri', regex: /data:image\/svg\+xml/gi },
    { kind: 'svg-mime', regex: /image\/svg\+xml/gi },
    { kind: 'svg-path', regex: /(?:^|[\s"'`(=:,])([^\s"'`<>)]*\.svg(?:[?#][^\s"'`<>)]*)?)/gim },
  ];

  for (const file of runtimeFiles) {
    if (!TEXT_EXTENSIONS.has(extname(file).toLowerCase()) && !file.endsWith('manifest.webmanifest')) continue;
    const text = readFileSync(file, 'utf8');
    for (const { kind, regex } of patterns) {
      regex.lastIndex = 0;
      for (const match of text.matchAll(regex)) {
        const captured = match[1] || match[0];
        addContentViolation(violations, absoluteRoot, file, kind, captured, match.index ?? 0);
      }
    }
  }

  const seen = new Set();
  return violations.filter((item) => {
    const key = `${item.kind}|${item.path}|${item.line}|${item.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatSvgViolations(violations) {
  return violations.map((item) => {
    const location = item.line ? `${item.path}:${item.line}` : item.path;
    return `${location} [${item.kind}] ${item.detail}`;
  });
}
