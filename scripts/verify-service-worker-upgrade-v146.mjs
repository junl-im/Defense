import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { simulateServiceWorkerUpgradeV146 } from '../src/runtime/service-worker-upgrade-assurance-v146.js';
const root = path.resolve(import.meta.dirname, '..');
const sw = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
for (const marker of ['DD-SW-UPGRADE-ASSURANCE-V146', 'DOKKAEBI_SW_ACTIVATED', 'preserve-client-storage', 'removedCaches']) assert.ok(sw.includes(marker), `service worker marker missing: ${marker}`);
const save = { 'dokkaebi-meta-v1': '{"shards":120}', 'dokkaebi-control-settings-v1': '{"handedness":"right"}' };
const report = simulateServiceWorkerUpgradeV146({
  cacheKeys: ['dokkaebi-luck-defense-shell-b24.45', 'dokkaebi-luck-defense-shell-b24.46', 'firebase-hosting-cache'],
  previousCache: 'dokkaebi-luck-defense-shell-b24.45',
  currentCache: 'dokkaebi-luck-defense-shell-b24.46',
  shellByCache: {
    'dokkaebi-luck-defense-shell-b24.45': ['./index.html', './version.json'],
    'dokkaebi-luck-defense-shell-b24.46': ['./index.html', './version.json']
  },
  saveBefore: save,
  saveAfter: structuredClone(save),
  controllerChanges: 1
});
assert.equal(report.passed, true);
const broken = simulateServiceWorkerUpgradeV146({ cacheKeys: ['dokkaebi-luck-defense-shell-b24.45'], saveBefore: save, saveAfter: {}, controllerChanges: 2 });
assert.equal(broken.passed, false);
console.log('PASS v1.0.46 service-worker two-cache upgrade and save continuity model');
