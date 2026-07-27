import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const removeLogs = process.argv.includes('--logs');
const removed = [];
const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
  removed.push('dist/');
}
const nodeModules = path.join(root, 'node_modules');
if (fs.existsSync(nodeModules)) {
  const hasFiles = (() => {
    const pending = [nodeModules];
    while (pending.length) {
      const current = pending.pop();
      for (const item of fs.readdirSync(current, { withFileTypes: true })) {
        if (item.isFile()) return true;
        if (item.isDirectory()) pending.push(path.join(current, item.name));
      }
    }
    return false;
  })();
  if (!hasFiles) {
    fs.rmSync(nodeModules, { recursive: true, force: true });
    removed.push('node_modules/ (empty)');
  }
}
if (removeLogs) {
  const logs = path.join(root, 'logs');
  if (fs.existsSync(logs)) {
    for (const item of fs.readdirSync(logs)) {
      if (item === 'README.md') continue;
      fs.rmSync(path.join(logs, item), { recursive: true, force: true });
      removed.push(`logs/${item}`);
    }
  }
}
console.log(JSON.stringify({ releaseVersion: '1.0.36', removed }, null, 2));
