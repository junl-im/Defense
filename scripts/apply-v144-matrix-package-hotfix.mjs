import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const packagePath = path.join(root, 'package.json');
if (!fs.existsSync(packagePath)) throw new Error(`package.json not found: ${packagePath}`);

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
if (!pkg.scripts || typeof pkg.scripts !== 'object') throw new Error('package.json scripts object missing');

const matrixCommand = 'node scripts/test-v144-mobile-matrix-contract.mjs';
const releaseCommand = 'npm run verify:asset-review:v144 && npm run verify:matrix-contract:v144 && node scripts/verify-release-v144.mjs';

const beforeMatrix = pkg.scripts['verify:matrix-contract:v144'];
const beforeRelease = pkg.scripts['verify:release:v144'];
pkg.scripts['verify:matrix-contract:v144'] = matrixCommand;
pkg.scripts['verify:release:v144'] = releaseCommand;

fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`PASS package script verify:matrix-contract:v144 ${beforeMatrix === matrixCommand ? 'already current' : 'installed'}`);
console.log(`PASS package script verify:release:v144 ${beforeRelease === releaseCommand ? 'already current' : 'updated'}`);
