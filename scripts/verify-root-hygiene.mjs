import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const allowedFiles = new Set([
  '.env.example', '.env.production', '.firebaserc', '.firebaserc.example', '.gitignore',
  'LICENSE', 'PROJECT_HANDOFF.md', 'README.md', 'RUN_LOCAL_MAC_LINUX.sh',
  'RUN_LOCAL_WINDOWS.bat', 'firebase.json', 'firestore.rules', 'index.html',
  'package-lock.json', 'package.json', 'requirements-atlas.txt', 'vite.config.js'
]);
const allowedDirectories = new Set([
  '.firebase', '.git', '.github', '.vscode', 'dist', 'docs', 'logs', 'node_modules',
  'production', 'public', 'scripts', 'src'
]);
const optionalEnv = /^\.env(?:\.[a-z0-9_-]+)?\.local$/i;
const violations = [];

for (const name of readdirSync(root)) {
  const path = resolve(root, name);
  const isDirectory = statSync(path).isDirectory();
  if (isDirectory) {
    if (!allowedDirectories.has(name)) violations.push(`${name}/ (허용되지 않은 루트 디렉터리)`);
    continue;
  }
  if (!allowedFiles.has(name) && !optionalEnv.test(name)) violations.push(`${name} (허용되지 않은 루트 파일)`);
}

if (violations.length) {
  console.error('FAIL project root hygiene');
  for (const violation of violations) console.error(` - ${violation}`);
  console.error('Generated logs/reports must go under logs/. Authored documents belong in docs/.');
  process.exit(1);
}

console.log(`PASS project root hygiene (${allowedFiles.size} core files, generated output confined to logs/)`);
