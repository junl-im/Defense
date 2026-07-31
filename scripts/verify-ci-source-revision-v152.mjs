import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/generated/ci-source-revision-v152.json'), 'utf8'));
if (manifest.id !== 'DD-CI-SOURCE-REVISION-V152' || manifest.releaseVersion !== '1.0.52' || manifest.buildId !== 'b24.52' || manifest.marker !== 'DD-V152-EVENT-TIMING-RUNTIME-GUARD') throw new Error('v152 CI source revision identity mismatch');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== manifest.releaseVersion || pkg.dokkaebi?.buildId !== manifest.buildId) throw new Error('v152 package identity mismatch before CI build');
const sha = (data) => createHash('sha256').update(data).digest('hex');
for (const entry of manifest.files || []) {
  const file = path.join(root, entry.path);
  if (!fs.existsSync(file)) throw new Error(`v152 signed source missing: ${entry.path}`);
  const data = fs.readFileSync(file);
  if (data.length !== entry.bytes || sha(data) !== entry.sha256) throw new Error(`v152 signed source mismatch: ${entry.path}`);
}
console.log(`PASS v1.0.52 CI source revision (${manifest.files.length} signed files)`);
