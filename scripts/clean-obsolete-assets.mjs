import { existsSync, readdirSync, rmSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import { normalizeWebManifestFile } from './manifest-policy.mjs';
import { organizeLegacyRootOutput } from './root-output-policy.mjs';

const root = resolve(import.meta.dirname, '..');
organizeLegacyRootOutput({ root });
const fixedObsolete = [
  'public/icon.svg',
  'public/cover.svg',
  'dist/icon.svg',
  'dist/cover.svg',
  'dist-pages/icon.svg',
  'dist-pages/cover.svg',
  'public/assets/models/player-moon-captain-sd-toon.glb',
  'dist/assets/models/player-moon-captain-sd-toon.glb',
  'public/assets/models/boss-tiger-nextgen.glb',
  'public/assets/models/guardian-ember-nextgen.glb',
  'public/assets/models/monster-imp-nextgen.glb',
  'dist/assets/models/boss-tiger-nextgen.glb',
  'dist/assets/models/guardian-ember-nextgen.glb',
  'dist/assets/models/monster-imp-nextgen.glb',
  'docs/ASSET_BIBLE.md',
  'COMPACT_PACKAGE_NOTE.txt',
  'REBUILD_DIST_WINDOWS.bat'
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

for (const path of [
  'public/manifest.webmanifest',
  'dist/manifest.webmanifest',
  'dist-pages/manifest.webmanifest'
]) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) continue;
  if (normalizeWebManifestFile(absolute)) {
    console.log(`MIGRATE ${path} -> PNG-only icon manifest`);
  }
}

const removeSvgFiles = (directory) => {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ['node_modules', '.git', '.firebase'].includes(entry.name)) continue;
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) removeSvgFiles(absolute);
    else if (entry.name.toLowerCase().endsWith('.svg')) remove(relative(root, absolute).replaceAll('\\', '/'));
  }
};

// SVG is forbidden for all shipped assets. Remove stale files before both
// verification and build so patch overlays cannot leave old vector assets behind.
removeSvgFiles(root);

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
