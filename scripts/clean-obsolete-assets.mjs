import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const obsolete = [
  'public/icon.svg',
  'public/cover.svg',
  'dist/icon.svg',
  'dist/cover.svg',
  'dist-pages/icon.svg',
  'dist-pages/cover.svg'
];

for (const path of obsolete) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) continue;
  rmSync(absolute, { force: true });
  console.log(`REMOVE ${path}`);
}
