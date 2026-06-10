import { readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const removed = [];

const rootPatterns = [
  /^README-v\d+(?:\.\d+)?(?:[\w.-]*)?\.md$/i,
  /^README-v\d+(?:\.\d+)?-.+\.md$/i,
];

const docsPatterns = [
  /[_-]V\d+(?:\.\d+)?/i,
  /^asset-manifest-v\d+(?:\.\d+)?\.json$/i,
  /^patch-notes-v\d+(?:\.\d+)?\.md$/i,
];

async function removeMatching(dir, patterns) {
  let entries = [];
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }

  for (const name of entries) {
    const full = path.join(dir, name);
    const s = await stat(full);
    if (!s.isFile()) continue;
    if (!patterns.some((p) => p.test(name))) continue;
    await rm(full, { force: true });
    removed.push(path.relative(root, full));
  }
}

await removeMatching(root, rootPatterns);
await removeMatching(path.join(root, 'docs'), docsPatterns);

if (removed.length === 0) {
  console.log('No versioned patch README/docs files found.');
} else {
  console.log('Removed versioned patch files:');
  for (const file of removed) console.log(`- ${file}`);
}

console.log('\nStable documentation policy: use README.md, docs/PATCH_NOTES.md, docs/VISUAL_GUIDE.md, docs/ASSET_MANIFEST.json.');
