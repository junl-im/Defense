import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const packageName = 'DokkaebiLuckDefense3D_FULL_v1.0.36_STORAGE_HYGIENE_VERIFIED';
const stage = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'logs/package/1.0.36', packageName);
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };
function sizeOf(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return stat.size;
  return fs.readdirSync(target).reduce((sum, item) => sum + sizeOf(path.join(target, item)), 0);
}
check(fs.existsSync(stage), 'staged package exists');
if (fs.existsSync(stage)) {
  for (const forbidden of ['dist', 'node_modules', '.git']) check(!fs.existsSync(path.join(stage, forbidden)), `${forbidden} excluded`);
  for (const required of ['public', 'production', 'src', 'scripts', 'docs', 'package.json', 'PROJECT_HANDOFF.md']) check(fs.existsSync(path.join(stage, required)), `${required} preserved`);
  const logs = path.join(stage, 'logs');
  check(fs.existsSync(path.join(logs, 'README.md')), 'logs contract preserved');
  check(fs.readdirSync(logs).every((item) => item === 'README.md'), 'generated logs excluded');
  const pkg = JSON.parse(fs.readFileSync(path.join(stage, 'package.json'), 'utf8'));
  check(pkg.version === '1.0.36' && pkg.dokkaebi?.buildId === 'b24.36', 'package identity');
  check(sizeOf(stage) < 310_000_000, 'staged source package footprint');
}
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log(`PASS clean package v1.0.36 verified at ${stage}`);
