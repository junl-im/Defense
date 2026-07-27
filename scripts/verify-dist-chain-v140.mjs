import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const versions = ['117','118','119','120','121','122','123','124','125','126','127','128','129','131','132','133','134','135','136','137','138','139','140'];
for (const version of versions) {
  const script = path.join(root, `scripts/verify-dist-v${version}.mjs`);
  const run = spawnSync(process.execPath, [script], { cwd: root, env: process.env, encoding: 'utf8' });
  process.stdout.write(run.stdout || '');
  process.stderr.write(run.stderr || '');
  if (run.status !== 0) {
    console.error(`FAIL dist verification chain stopped at v${version}`);
    process.exit(run.status || 1);
  }
}
console.log(`PASS v1.0.40 complete dist verification chain (${versions.length} gates)`);
