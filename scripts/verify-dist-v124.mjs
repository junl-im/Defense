import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const required = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'release-assurance-v124.html'
];
for (const file of required) {
  if (!fs.existsSync(path.join(dist, file))) throw new Error(`v1.0.24 static deployment missing dist/${file}`);
}
const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'), 'utf8'));
const sw = fs.readFileSync(path.join(dist, 'sw.js'), 'utf8');
if (manifest.name !== '도깨비 럭 디펜스 3D') throw new Error('v1.0.24 canonical PWA name missing from dist');
if (JSON.stringify(manifest).includes('도깨비 운빨 수호대')) throw new Error('legacy PWA branding remains in dist');
if (!index.includes('release-v124-b24-24')) throw new Error('v1.0.24 title cache revision missing from dist');
if (!index.includes('title-v112/title-mascot-v112.webp')) throw new Error('original mascot missing from v1.0.24 dist');
if (index.includes('title-v120/title-mascot')) throw new Error('replacement mascot active in v1.0.24 dist');
if (!sw.includes('dokkaebi-luck-defense-shell-') || !sw.includes("'dokkaebi-shell-'")) throw new Error('v1.0.24 cache migration missing from dist');

const staticRuntime = path.join(dist, 'src/runtime/release-assurance-director-v124.js');
let runtimeFound = fs.existsSync(staticRuntime);
if (!runtimeFound) {
  const stack = [path.join(dist, 'assets')];
  while (stack.length && !runtimeFound) {
    const current = stack.pop();
    if (!fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else if (entry.name.endsWith('.js') && fs.readFileSync(target, 'utf8').includes('DD-RELEASE-ASSURANCE-V124')) { runtimeFound = true; break; }
    }
  }
}
if (!runtimeFound) throw new Error('v1.0.24 release assurance runtime missing from static source or Vite bundle');
console.log('PASS v1.0.24 canonical identity, cache migration and runtime assurance deployment');
