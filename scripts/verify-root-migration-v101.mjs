import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { organizeLegacyRootOutput } from './root-output-policy.mjs';

const fixture = mkdtempSync(resolve(tmpdir(), 'dokkaebi-root-migration-'));
const staleFiles = [
  'APPLY_PATCH_v22.0.0.md',
  'DELETE_FILES.txt',
  'DELETE_FILES_v22.0.0.txt',
  'PATCH_APPLY_v20.0.0.md',
  'PATCH_APPLY_v21.0.0.md',
  'PATCH_DELETE.txt',
  'PATCH_FILES.json',
  'PATCH_MANIFEST.json',
  'PATCH_MANIFEST_v20.0.0.json',
  'PATCH_MANIFEST_v21.0.0.json',
  'PATCH_MANIFEST_v22.0.0.json',
  'PATCH_README.txt'
];

try {
  mkdirSync(resolve(fixture, 'logs'), { recursive: true });
  for (const name of staleFiles) writeFileSync(resolve(fixture, name), `legacy:${name}\n`);
  mkdirSync(resolve(fixture, '_patch_info'), { recursive: true });
  writeFileSync(resolve(fixture, '_patch_info', 'README.txt'), 'legacy patch directory\n');
  writeFileSync(resolve(fixture, 'README.md'), '# protected\n');

  const first = organizeLegacyRootOutput({ root: fixture, log: () => {} });
  const destination = resolve(fixture, 'logs', 'legacy-root-output');
  const firstPass = first.moved.length === staleFiles.length + 1
    && staleFiles.every((name) => existsSync(resolve(destination, name)))
    && existsSync(resolve(destination, '_patch_info', 'README.txt'))
    && existsSync(resolve(fixture, 'README.md'));

  // Recreate one identical legacy file. The second pass must remove the root
  // duplicate without creating another arbitrary artifact.
  writeFileSync(resolve(fixture, 'PATCH_MANIFEST.json'), 'legacy:PATCH_MANIFEST.json\n');
  const second = organizeLegacyRootOutput({ root: fixture, log: () => {} });
  const secondPass = !existsSync(resolve(fixture, 'PATCH_MANIFEST.json'))
    && second.removedDuplicates.includes('PATCH_MANIFEST.json')
    && readdirSync(destination).filter((name) => name.startsWith('PATCH_MANIFEST.json')).length === 1;

  const checks = [
    ['legacy patch files migrate below logs', firstPass],
    ['legacy _patch_info directory migrates below logs', existsSync(resolve(destination, '_patch_info'))],
    ['protected root files remain in place', existsSync(resolve(fixture, 'README.md'))],
    ['migration is idempotent for duplicate legacy files', secondPass]
  ];

  let failed = 0;
  for (const [name, ok] of checks) {
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
    if (!ok) failed += 1;
  }
  if (failed) process.exitCode = 1;
  else console.log('\nv1.0.1 legacy root migration contract verified');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
