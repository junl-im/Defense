import { existsSync, readdirSync, rmSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const fixedObsolete = [
  'public/icon.svg',
  'public/cover.svg',
  'dist/icon.svg',
  'dist/cover.svg',
  'dist-pages/icon.svg',
  'dist-pages/cover.svg'
];

const remove = (path) => {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) return false;
  rmSync(absolute, { force: true, recursive: true });
  console.log(`REMOVE ${path}`);
  return true;
};

fixedObsolete.forEach(remove);

for (const directory of ['public/assets', 'dist/assets']) {
  const absolute = resolve(root, directory);
  if (!existsSync(absolute)) continue;
  for (const name of readdirSync(absolute)) {
    if (!/^index-[A-Za-z0-9_-]+\.(?:js|css)$/.test(basename(name))) continue;
    remove(`${directory}/${name}`);
  }
}
