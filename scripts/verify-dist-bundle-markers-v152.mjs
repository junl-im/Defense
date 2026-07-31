import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assertReachableBundleMarkers, collectReachableJavaScriptBundle } from './lib/dist-bundle-markers.mjs';

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'dokkaebi-v152-bundle-'));
try {
  fs.mkdirSync(path.join(fixture, 'assets/chunks'), { recursive: true });
  fs.writeFileSync(path.join(fixture, 'assets/game.js'), [
    'const boot="bootstrap-only";',
    'import("./chunks/main-fixture.js");',
    'const deps=["/Defense/assets/chunks/runtime-fixture.js"];'
  ].join('\n'));
  fs.writeFileSync(path.join(fixture, 'assets/chunks/main-fixture.js'), 'const marker="DD-RUNTIME-HEALTH-ASSURANCE-V148";\n');
  fs.writeFileSync(path.join(fixture, 'assets/chunks/runtime-fixture.js'), 'const marker="DD-TRANSACTIONAL-PERSISTENCE-V149";\n');
  fs.writeFileSync(path.join(fixture, 'assets/chunks/orphan-fixture.js'), 'const marker="ORPHAN-MUST-NOT-PASS";\n');

  const reachable = collectReachableJavaScriptBundle(fixture).map((file) => file.path);
  for (const required of ['assets/game.js', 'assets/chunks/main-fixture.js', 'assets/chunks/runtime-fixture.js']) {
    if (!reachable.includes(required)) throw new Error(`reachable bundle fixture missing: ${required}`);
  }
  if (reachable.includes('assets/chunks/orphan-fixture.js')) throw new Error('unreachable bundle chunk was incorrectly traversed');

  const result = assertReachableBundleMarkers(fixture, [
    'DD-RUNTIME-HEALTH-ASSURANCE-V148',
    'DD-TRANSACTIONAL-PERSISTENCE-V149'
  ], { label: 'v152 fixture' });
  if (!result.locations['DD-RUNTIME-HEALTH-ASSURANCE-V148']?.includes('assets/chunks/main-fixture.js')) throw new Error('dynamic chunk marker location missing');

  let rejectedOrphan = false;
  try {
    assertReachableBundleMarkers(fixture, ['ORPHAN-MUST-NOT-PASS'], { label: 'v152 fixture' });
  } catch (error) {
    rejectedOrphan = /marker missing/.test(String(error?.message || error));
  }
  if (!rejectedOrphan) throw new Error('unreachable marker must not satisfy bundle verification');

  console.log(`PASS v1.0.52 reachable Vite bundle marker traversal (${reachable.length} JS files)`);
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
