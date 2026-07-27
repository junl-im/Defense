import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const TEXT_EXTENSIONS = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.txt']);

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function normalize(relative) {
  return relative.split(path.sep).join('/');
}

export function readDistText(dist) {
  const explicit = [
    'index.html',
    'manifest.webmanifest',
    'sw.js',
    'static-bootstrap.js',
    'src/main.js',
    'src/style.css',
    'src/runtime/visual-integration-director.js'
  ].map((relative) => path.join(dist, relative));
  const bundleRoot = path.join(dist, 'assets');
  const bundles = walk(bundleRoot).filter((file) => {
    const extension = path.extname(file).toLowerCase();
    return extension === '.js' || extension === '.css';
  });
  return [...new Set([...explicit, ...bundles])]
    .filter((file) => fs.existsSync(file))
    .map((file) => {
      try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
    })
    .join('\n');
}

export function verifyDeployedAssetReference({ root, dist, sourceRelative, label = sourceRelative }) {
  const source = path.join(root, sourceRelative);
  if (!fs.existsSync(source)) throw new Error(`${label} source asset missing: ${sourceRelative}`);
  if (!fs.existsSync(dist)) throw new Error('dist directory is missing');

  const sourceData = fs.readFileSync(source);
  const sourceHash = sha256(sourceData);
  const sourceExtension = path.extname(sourceRelative).toLowerCase();
  const candidates = walk(dist).filter((file) => {
    if (path.extname(file).toLowerCase() !== sourceExtension) return false;
    const stat = fs.statSync(file);
    if (stat.size !== sourceData.length) return false;
    return sha256(fs.readFileSync(file)) === sourceHash;
  });
  if (!candidates.length) {
    throw new Error(`${label} bytes are missing from dist (source SHA-256 ${sourceHash})`);
  }

  const distText = readDistText(dist);
  const referenced = candidates.find((candidate) => {
    const relative = normalize(path.relative(dist, candidate));
    return distText.includes(relative) || distText.includes(`/${relative}`) || distText.includes(`./${relative}`);
  });
  if (!referenced) {
    const emitted = candidates.map((file) => normalize(path.relative(dist, file))).join(', ');
    throw new Error(`${label} exists in dist but no emitted path is referenced (${emitted})`);
  }

  return Object.freeze({
    sourceRelative,
    emittedRelative: normalize(path.relative(dist, referenced)),
    bytes: sourceData.length,
    sha256: sourceHash
  });
}
