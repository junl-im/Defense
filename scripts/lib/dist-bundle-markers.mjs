import fs from 'node:fs';
import path from 'node:path';

const JS_LITERAL_PATTERN = /["'`]([^"'`]+\.js(?:[?#][^"'`]*)?)["'`]/g;

function normalizeReference(reference) {
  return String(reference || '')
    .replace(/\\/g, '/')
    .split('#', 1)[0]
    .split('?', 1)[0]
    .trim();
}

function resolveBundleReference(dist, fromRelativePath, reference) {
  const normalized = normalizeReference(reference);
  if (!normalized || /^(?:data|blob|https?|file):/i.test(normalized)) return '';

  const candidates = [];
  if (normalized.startsWith('/')) {
    const withoutLeadingSlash = normalized.replace(/^\/+/, '');
    candidates.push(withoutLeadingSlash);
    const assetsIndex = withoutLeadingSlash.indexOf('assets/');
    if (assetsIndex >= 0) candidates.push(withoutLeadingSlash.slice(assetsIndex));
  } else {
    candidates.push(path.posix.normalize(path.posix.join(path.posix.dirname(fromRelativePath), normalized)));
  }

  for (const candidate of candidates) {
    if (!candidate || candidate === '..' || candidate.startsWith('../') || path.posix.isAbsolute(candidate)) continue;
    const absolute = path.join(dist, ...candidate.split('/'));
    if (fs.existsSync(absolute) && fs.statSync(absolute).isFile() && candidate.endsWith('.js')) return candidate;
  }
  return '';
}

export function collectReachableJavaScriptBundle(dist, { entry = 'assets/game.js' } = {}) {
  const normalizedDist = path.resolve(dist);
  const entryAbsolute = path.join(normalizedDist, ...entry.split('/'));
  if (!fs.existsSync(entryAbsolute)) throw new Error(`Vite bundle entry missing: ${entry}`);

  const queue = [entry];
  const visited = new Set();
  const files = [];

  while (queue.length > 0) {
    const relativePath = queue.shift();
    if (visited.has(relativePath)) continue;
    visited.add(relativePath);

    const absolutePath = path.join(normalizedDist, ...relativePath.split('/'));
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      throw new Error(`reachable Vite JavaScript file missing: ${relativePath}`);
    }
    const text = fs.readFileSync(absolutePath, 'utf8');
    files.push(Object.freeze({ path: relativePath, absolutePath, text, bytes: Buffer.byteLength(text) }));

    JS_LITERAL_PATTERN.lastIndex = 0;
    let match = null;
    while ((match = JS_LITERAL_PATTERN.exec(text)) !== null) {
      const resolved = resolveBundleReference(normalizedDist, relativePath, match[1]);
      if (resolved && !visited.has(resolved) && !queue.includes(resolved)) queue.push(resolved);
    }
  }

  return Object.freeze(files);
}

export function assertReachableBundleMarkers(dist, markers, { label = 'bundled runtime' } = {}) {
  const files = collectReachableJavaScriptBundle(dist);
  const locations = {};
  for (const marker of markers) {
    const matches = files.filter((file) => file.text.includes(marker)).map((file) => file.path);
    if (matches.length === 0) {
      const inspected = files.map((file) => file.path).join(', ');
      throw new Error(`${label} marker missing: ${marker} (inspected reachable JS: ${inspected})`);
    }
    locations[marker] = matches;
  }
  return Object.freeze({ files, locations: Object.freeze(locations) });
}

export function readReachableBundleText(dist) {
  const files = collectReachableJavaScriptBundle(dist);
  return Object.freeze({
    files,
    text: files.map((file) => `\n/* ${file.path} */\n${file.text}`).join('')
  });
}
