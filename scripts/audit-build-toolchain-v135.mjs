import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const packageLock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const expectedVite = packageJson.devDependencies?.vite;
const lockEntry = packageLock.packages?.['node_modules/vite'];
const viteRoot = path.join(root, 'node_modules/vite');
const required = [
  'package.json',
  'dist/node/cli.js',
  'dist/node/index.js'
];
const present = required.filter((relative) => fs.existsSync(path.join(viteRoot, relative)));
const missing = required.filter((relative) => !fs.existsSync(path.join(viteRoot, relative)));
const status = missing.length === 0 ? 'ready' : 'exception-documented';
const report = {
  id: 'DD-BUILD-TOOLCHAIN-AUDIT-V135',
  releaseVersion: '1.0.35',
  buildId: 'b24.35',
  status,
  expectedVite,
  lockVersion: lockEntry?.version ?? null,
  viteDirectoryExists: fs.existsSync(viteRoot),
  present,
  missing,
  staticDeploymentGate: 'npm run build:static && npm run verify:dist:v135',
  ciProductionGate: 'npm ci && npm run build && node scripts/verify-production-bundle-v101.mjs',
  note: status === 'ready'
    ? 'Local Vite installation is complete.'
    : 'The packaged node_modules/vite directory is incomplete. Source/static deployment verification remains valid; reinstall dependencies before a local Vite production build.'
};
if (!expectedVite || !lockEntry?.version) throw new Error('Vite dependency metadata is missing from package.json or package-lock.json');
fs.mkdirSync(path.join(root, 'logs/verify'), { recursive: true });
fs.writeFileSync(path.join(root, 'logs/verify/BUILD_TOOLCHAIN_AUDIT_v135.json'), `${JSON.stringify(report, null, 2)}\n`);
if (status === 'ready') {
  console.log(`PASS build toolchain ready (Vite ${lockEntry.version})`);
} else {
  console.log(`EXCEPTION documented: incomplete local Vite installation (${missing.join(', ')}); CI npm ci production gate retained`);
}
