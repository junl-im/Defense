import { existsSync, readdirSync, rmSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const fixedObsolete = [
  'public/icon.svg',
  'public/cover.svg',
  'dist/icon.svg',
  'dist/cover.svg',
  'dist-pages/icon.svg',
  'dist-pages/cover.svg',
  'public/assets/models/player-moon-captain-sd-toon.glb',
  'dist/assets/models/player-moon-captain-sd-toon.glb'
];

const removed = [];
const remove = (path) => {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) return false;
  rmSync(absolute, { force: true, recursive: true });
  removed.push(path);
  console.log(`REMOVE ${path}`);
  return true;
};

fixedObsolete.forEach(remove);

// Patch notes belong under docs/. Older patch archives placed this file at the
// project root, which made source verification fail before prebuild could run.
for (const name of readdirSync(root)) {
  if (!/^PATCH_(?:README|NOTES)(?:_v[0-9.]+)?\.md$/i.test(name)) continue;
  remove(name);
}

// Vite's generated hash files must never be committed under public/assets.
// They are copied back into every future dist and can shadow the stable bundle.
for (const directory of ['public/assets', 'dist/assets', 'dist-pages/assets']) {
  const absolute = resolve(root, directory);
  if (!existsSync(absolute)) continue;
  for (const name of readdirSync(absolute)) {
    if (!/^index-[A-Za-z0-9_-]+\.(?:js|css)(?:\.map)?$/.test(basename(name))) continue;
    remove(`${directory}/${name}`);
  }
}

console.log(`CLEAN obsolete artifacts: ${removed.length} removed`);
