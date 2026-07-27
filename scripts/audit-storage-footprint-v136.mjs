import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'logs/audits/STORAGE_FOOTPRINT_v136.json');
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function filesUnder(base) {
  if (!fs.existsSync(base)) return [];
  const rows = [];
  const pending = [base];
  while (pending.length) {
    const current = pending.pop();
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, item.name);
      if (item.isDirectory()) pending.push(absolute);
      else if (item.isFile()) rows.push(absolute);
    }
  }
  return rows;
}

function summary(relative) {
  const base = path.join(root, relative);
  const files = filesUnder(base);
  return {
    path: relative,
    exists: fs.existsSync(base),
    files: files.length,
    bytes: files.reduce((sum, file) => sum + fs.statSync(file).size, 0)
  };
}

const topLevel = fs.readdirSync(root, { withFileTypes: true }).map((entry) => {
  if (entry.isDirectory()) return summary(entry.name);
  const file = path.join(root, entry.name);
  return { path: entry.name, exists: true, files: 1, bytes: fs.statSync(file).size };
}).sort((a, b) => b.bytes - a.bytes);

let duplicateFiles = 0;
let duplicateBytes = 0;
const publicRoot = path.join(root, 'public');
const distRoot = path.join(root, 'dist');
if (fs.existsSync(distRoot)) {
  for (const source of filesUnder(publicRoot)) {
    const relative = path.relative(publicRoot, source);
    const generated = path.join(distRoot, relative);
    if (!fs.existsSync(generated) || !fs.statSync(generated).isFile()) continue;
    if (fs.statSync(source).size !== fs.statSync(generated).size) continue;
    if (hash(source) !== hash(generated)) continue;
    duplicateFiles += 1;
    duplicateBytes += fs.statSync(source).size;
  }
}

const generatedLogs = filesUnder(path.join(root, 'logs')).filter((file) => path.relative(path.join(root, 'logs'), file) !== 'README.md');
const generatedLogBytes = generatedLogs.reduce((sum, file) => sum + fs.statSync(file).size, 0);
const dist = summary('dist');
const nodeModules = summary('node_modules');
const removableBytes = dist.bytes + generatedLogBytes + nodeModules.bytes;
const report = {
  schema: 'DD-STORAGE-FOOTPRINT-1.0',
  id: 'DD-STORAGE-HYGIENE-V136',
  releaseVersion: '1.0.36',
  buildId: 'b24.36',
  status: dist.exists ? 'generated-output-present' : 'clean-source-tree',
  rootBytes: topLevel.reduce((sum, row) => sum + row.bytes, 0),
  topLevel,
  duplicateAnalysis: {
    publicToDistExactFiles: duplicateFiles,
    publicToDistExactBytes: duplicateBytes,
    rootCause: duplicateBytes > 100_000_000 ? 'dist contains a generated copy of public runtime assets' : 'no large public-to-dist duplicate set present'
  },
  cleanupPolicy: {
    excludeFromFullZip: ['dist', 'node_modules', 'logs/* except logs/README.md'],
    preserve: ['public', 'production', 'src', 'scripts', 'docs'],
    removableBytes,
    generatedLogFiles: generatedLogs.length,
    generatedLogBytes
  }
};
if (!fs.existsSync(publicRoot) || !fs.existsSync(path.join(root, 'production')) || !fs.existsSync(path.join(root, 'src'))) {
  throw new Error('Required source roots are missing');
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`PASS storage audit v1.0.36: root=${report.rootBytes} removable=${removableBytes} duplicate=${duplicateBytes}`);
