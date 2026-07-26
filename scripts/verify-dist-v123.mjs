import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const distIndexPath = path.join(dist, 'index.html');
const authoredIndexPath = path.join(root, 'index.html');

if (!existsSync(distIndexPath)) throw new Error('dist/index.html missing');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

async function exactBytesReachDist(sourceFile, distFiles) {
  const sourceInfo = await stat(sourceFile);
  const sourceHash = await sha256(sourceFile);
  for (const file of distFiles) {
    const info = await stat(file);
    if (info.size !== sourceInfo.size) continue;
    if (await sha256(file) === sourceHash) return true;
  }
  return false;
}

const authoredIndex = await readFile(authoredIndexPath, 'utf8');
if (authoredIndex.includes('도깨비 운빨 수호대')) throw new Error('legacy title remains in authored index');
if (!authoredIndex.includes('도깨비 럭 디펜스 3D')) throw new Error('current title missing from authored index');
if (!authoredIndex.includes('src/assets/title-v112/title-mascot-v112.webp')) {
  throw new Error('approved original full mascot is not active in authored index');
}
if (!authoredIndex.includes('src/assets/title-v112/title-mascot-lite-v112.webp')) {
  throw new Error('approved original lite mascot is not active in authored index');
}
if (/src\/assets\/title-v120\/title-mascot(?:-lite)?-v120\.webp/.test(authoredIndex)) {
  throw new Error('replacement mascot remains active in authored index');
}

const distFiles = await walk(dist);
const distIndex = await readFile(distIndexPath, 'utf8');
if (distIndex.includes('도깨비 운빨 수호대')) throw new Error('legacy title remains in dist/index.html');
if (!distIndex.includes('도깨비 럭 디펜스 3D')) throw new Error('current title missing from dist/index.html');
if (/title-v120\/title-mascot(?:-lite)?-v120\.webp/.test(distIndex)) {
  throw new Error('replacement mascot remains active in dist/index.html');
}

const approvedMascots = [
  'src/assets/title-v112/title-mascot-v112.webp',
  'src/assets/title-v112/title-mascot-lite-v112.webp'
];
for (const relative of approvedMascots) {
  const sourceFile = path.join(root, relative);
  if (!existsSync(sourceFile)) throw new Error(`approved mascot source missing: ${relative}`);
  if (!await exactBytesReachDist(sourceFile, distFiles)) {
    throw new Error(`approved original mascot bytes missing from dist: ${relative}`);
  }
}

console.log(`PASS v1.0.23 title and approved original mascot deployment (${distFiles.length} files, Vite-safe byte verification)`);
