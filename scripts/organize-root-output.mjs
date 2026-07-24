import { existsSync, mkdirSync, readdirSync, renameSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'logs', 'legacy-root-output');
const protectedNames = new Set([
  '.env.example', '.env.production', '.firebaserc', '.firebaserc.example', '.gitignore',
  'LICENSE', 'PROJECT_HANDOFF.md', 'README.md', 'RUN_LOCAL_MAC_LINUX.sh',
  'RUN_LOCAL_WINDOWS.bat', 'firebase.json', 'firestore.rules', 'index.html',
  'package-lock.json', 'package.json', 'requirements-atlas.txt', 'vite.config.js'
]);
const movableExtensions = new Set(['.log', '.tmp', '.bak', '.zip', '.png', '.jpg', '.jpeg', '.webp']);
const generatedJson = /(?:AUDIT|SIMULATION|REPORT|PACKAGE|MANIFEST|RESULT|DIAGNOSTIC).*\.json$/i;
const moved = [];

for (const name of readdirSync(root)) {
  const path = resolve(root, name);
  if (protectedNames.has(name) || statSync(path).isDirectory()) continue;
  if (!movableExtensions.has(extname(name).toLowerCase()) && !generatedJson.test(name)) continue;
  mkdirSync(destination, { recursive: true });
  let target = resolve(destination, name);
  if (existsSync(target)) target = resolve(destination, `${Date.now()}-${name}`);
  renameSync(path, target);
  moved.push(name);
}

if (moved.length) console.log(`MOVED ${moved.length} generated root files -> logs/legacy-root-output/`);
else console.log('PASS no generated root output to organize');
