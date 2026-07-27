import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const packageName = 'DokkaebiLuckDefense3D_FULL_v1.0.38_CI_PRESENTATION_SCOPE_VERIFIED';
const outputRoot = path.join(root, 'logs/package/1.0.38');
const stage = path.join(outputRoot, packageName);
const excluded = [];

function sizeOf(target) {
  if (!fs.existsSync(target)) return 0;
  const stat = fs.statSync(target);
  if (stat.isFile()) return stat.size;
  return fs.readdirSync(target).reduce((sum, item) => sum + sizeOf(path.join(target, item)), 0);
}

function copyTree(source, target, relative = '') {
  const normalized = relative.replaceAll('\\', '/');
  const top = normalized.split('/')[0];
  if (['dist', 'node_modules', '.git'].includes(top)) {
    if (fs.existsSync(source)) excluded.push({ path: normalized || top, bytes: sizeOf(source) });
    return;
  }
  if (top === 'logs' && normalized !== 'logs' && normalized !== 'logs/README.md') {
    if (fs.existsSync(source)) excluded.push({ path: normalized, bytes: sizeOf(source) });
    return;
  }
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const item of fs.readdirSync(source)) copyTree(path.join(source, item), path.join(target, item), normalized ? `${normalized}/${item}` : item);
  } else if (stat.isFile()) {
    if (/\.(zip|z\d\d)$/i.test(path.basename(source)) || ['.DS_Store', 'Thumbs.db'].includes(path.basename(source))) {
      excluded.push({ path: normalized, bytes: stat.size });
      return;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
for (const item of fs.readdirSync(root)) copyTree(path.join(root, item), path.join(stage, item), item);
const report = {
  schema: 'DD-CLEAN-PACKAGE-1.0',
  id: 'DD-CI-PRESENTATION-SCOPE-V138',
  releaseVersion: '1.0.38',
  packageName,
  stage,
  sourceBytes: sizeOf(root) - sizeOf(outputRoot),
  stagedBytes: sizeOf(stage),
  excludedBytes: excluded.reduce((sum, row) => sum + row.bytes, 0),
  exclusions: excluded
};
fs.writeFileSync(path.join(outputRoot, 'PACKAGE_STAGE_REPORT.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
