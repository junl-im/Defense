import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const checkOnly = process.argv.includes('--check');
const outputJson = path.join(root, 'docs/generated/build-input-manifest-v150.json');
const outputMd = path.join(root, 'docs/generated/build-input-manifest-v150.md');
const includeRoots = ['index.html', 'package.json', 'package-lock.json', 'vite.config.js', '.env.production', 'src', 'public'];
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const files = [];
function walk(relative) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) throw new Error(`build input missing: ${relative}`);
  const stat = fs.statSync(absolute);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(absolute).sort()) walk(`${relative}/${name}`);
    return;
  }
  if (!stat.isFile()) return;
  const data = fs.readFileSync(absolute);
  files.push({ path: relative.replaceAll('\\', '/'), bytes: data.length, sha256: sha256(data) });
}
for (const item of includeRoots) walk(item);
files.sort((a, b) => a.path.localeCompare(b.path));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const manifest = {
  id: 'DD-BUILD-INPUT-MANIFEST-V150',
  releaseVersion: pkg.version,
  buildId: pkg.dokkaebi?.buildId,
  cacheRevision: pkg.dokkaebi?.cacheRevision,
  algorithm: 'sha256-sorted-paths-v1',
  fileCount: files.length,
  totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  aggregateSha256: sha256(Buffer.from(files.map((file) => `${file.path}\0${file.bytes}\0${file.sha256}`).join('\n'))),
  files
};
const jsonText = `${JSON.stringify(manifest, null, 2)}\n`;
const mdText = [
  '# Build Input Manifest v1.0.50', '',
  `- Identity: ${manifest.releaseVersion} / ${manifest.buildId}`,
  `- Files: ${manifest.fileCount.toLocaleString()}`,
  `- Bytes: ${manifest.totalBytes.toLocaleString()}`,
  `- Aggregate SHA-256: \`${manifest.aggregateSha256}\``, '',
  'This manifest is generated from sorted build inputs and excludes timestamps and absolute paths.', ''
].join('\n');
if (checkOnly) {
  const currentJson = fs.existsSync(outputJson) ? fs.readFileSync(outputJson, 'utf8') : '';
  const currentMd = fs.existsSync(outputMd) ? fs.readFileSync(outputMd, 'utf8') : '';
  if (currentJson !== jsonText || currentMd !== mdText) throw new Error('v150 build input manifest is stale; run npm run generate:build-input:v150');
  console.log(`PASS v1.0.50 reproducible build input manifest (${manifest.fileCount} files, ${manifest.aggregateSha256.slice(0, 12)})`);
} else {
  fs.mkdirSync(path.dirname(outputJson), { recursive: true });
  fs.writeFileSync(outputJson, jsonText);
  fs.writeFileSync(outputMd, mdText);
  console.log(JSON.stringify({ id: manifest.id, fileCount: manifest.fileCount, totalBytes: manifest.totalBytes, aggregateSha256: manifest.aggregateSha256 }, null, 2));
}
