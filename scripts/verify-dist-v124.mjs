import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const required = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'release-assurance-v124.html',
  'version.json'
];
for (const file of required) {
  if (!fs.existsSync(path.join(dist, file))) throw new Error(`v1.0.24 static deployment missing dist/${file}`);
}

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

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const currentVersion = JSON.parse(fs.readFileSync(path.join(dist, 'version.json'), 'utf8'));
const patchVersion = Number(String(currentVersion.releaseVersion || '').split('.')[2] || 0);
if (patchVersion < 24) throw new Error('v1.0.24 deployment foundation is not preserved');
if (currentVersion.releaseVersion !== pkg.version || currentVersion.buildId !== pkg.dokkaebi?.buildId) {
  throw new Error('v1.0.24 dist identity does not match current package identity');
}

const authoredIndex = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const currentRevision = `release-v1${String(patchVersion).padStart(2, '0')}-b24-${patchVersion}`;
if (!authoredIndex.includes(currentRevision)) throw new Error('current title cache revision missing from authored index');
if (!authoredIndex.includes('src/assets/title-v112/title-mascot-v112.webp')) {
  throw new Error('approved original mascot is not active in authored index');
}
if (/src\/assets\/title-v120\/title-mascot(?:-lite)?-v120\.webp/.test(authoredIndex)) {
  throw new Error('replacement mascot remains active in authored index');
}

const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'), 'utf8'));
const sw = fs.readFileSync(path.join(dist, 'sw.js'), 'utf8');
if (manifest.name !== '도깨비 럭 디펜스 3D') throw new Error('v1.0.24 canonical PWA name missing from dist');
if (JSON.stringify(manifest).includes('도깨비 운빨 수호대')) throw new Error('legacy PWA branding remains in dist');
if (!sw.includes('dokkaebi-luck-defense-shell-') || !sw.includes("'dokkaebi-shell-'")) {
  throw new Error('v1.0.24 cache migration missing from dist');
}

const distFiles = await walk(dist);
const distIndex = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (/title-v120\/title-mascot(?:-lite)?-v120\.webp/.test(distIndex)) {
  throw new Error('replacement mascot remains active in v1.0.24 dist/index.html');
}
const approvedMascot = path.join(root, 'src/assets/title-v112/title-mascot-v112.webp');
if (!await exactBytesReachDist(approvedMascot, distFiles)) {
  throw new Error('approved original mascot bytes missing from v1.0.24 dist');
}

const staticRuntime = path.join(dist, 'src/runtime/release-assurance-director-v124.js');
let runtimeFound = fs.existsSync(staticRuntime);
if (!runtimeFound) {
  for (const file of distFiles) {
    if (!file.endsWith('.js')) continue;
    if ((await readFile(file, 'utf8').catch(() => '')).includes('DD-RELEASE-ASSURANCE-V124')) {
      runtimeFound = true;
      break;
    }
  }
}
if (!runtimeFound) throw new Error('v1.0.24 release assurance runtime missing from static source or Vite bundle');
console.log(`PASS v1.0.24 canonical identity, cache migration, approved mascot bytes and runtime assurance deployment (${distFiles.length} files)`);
