import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(root, 'docs/generated/ci-source-revision-v151.json');
if (!fs.existsSync(manifestPath)) throw new Error('v1.0.51 R5 source revision manifest missing');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.id !== 'DD-CI-SOURCE-REVISION-V151' || manifest.releaseVersion !== '1.0.51' || manifest.buildId !== 'b24.51' || manifest.repairRevision !== 5 || manifest.marker !== 'DD-V151-LONG-SESSION-R5') {
  throw new Error('v1.0.51 R5 source revision manifest identity mismatch');
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== manifest.releaseVersion || pkg.dokkaebi?.buildId !== manifest.buildId) throw new Error(`v1.0.51 R5 package identity mismatch: ${pkg.version}/${pkg.dokkaebi?.buildId}`);
const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');
const actual = [];
for (const entry of manifest.files || []) {
  const file = path.join(root, entry.path);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`v1.0.51 R5 source file missing: ${entry.path}`);
  const digest = sha(fs.readFileSync(file));
  actual.push({ path: entry.path, sha256: digest });
  if (digest !== entry.sha256) throw new Error(`v1.0.51 R5 source revision mismatch: ${entry.path} expected ${entry.sha256} got ${digest}`);
}
const runner = fs.readFileSync(path.join(root, 'scripts/run-release-assurance-v146.mjs'), 'utf8');
for (const marker of ['DD-V151-LONG-SESSION-R5', 'runtimeErrorEntries', 'runtimeHealth', 'exceptions:diagnostics.exceptions.slice(-12)']) {
  if (!runner.includes(marker)) throw new Error(`v1.0.51 R5 runner marker missing: ${marker}`);
}
console.log(JSON.stringify({
  id: manifest.marker,
  repairRevision: manifest.repairRevision,
  releaseVersion: manifest.releaseVersion,
  buildId: manifest.buildId,
  githubSha: process.env.GITHUB_SHA || '',
  verifiedFiles: actual.length,
  runnerSha256: actual.find((entry) => entry.path === 'scripts/run-release-assurance-v146.mjs')?.sha256 || ''
}, null, 2));
console.log('PASS v1.0.51 R5 CI source revision; long-session runner is current before browser assurance');
