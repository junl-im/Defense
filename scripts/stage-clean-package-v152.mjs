import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const name = 'DokkaebiLuckDefense3D_FULL_v1.0.52_EVENT_TIMING_RUNTIME_GUARD_CI_HOTFIX_R11';
const out = path.join(root, 'logs/package/1.0.52');
const target = path.join(out, name);
const skip = (rel) => {
  const parts = rel.split('/');
  return ['dist', 'node_modules', '.git'].includes(parts[0])
    || parts.includes('__pycache__')
    || /\.(?:py[co]|zip|z\d\d)$/i.test(rel)
    || (rel.startsWith('logs/') && rel !== 'logs/README.md');
};
function copy(src, dst, rel) {
  if (skip(rel)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src)) copy(path.join(src, name), path.join(dst, name), rel ? `${rel}/${name}` : name);
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const name of fs.readdirSync(root)) copy(path.join(root, name), path.join(target, name), name);
console.log(target);
