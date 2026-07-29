import fs from 'node:fs';
import path from 'node:path';
import { buildBrowserEvidenceBundleV147, collectBrowserEvidenceV147 } from './browser-evidence-bundle-v147.mjs';
const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'logs/qa/v147');
const bundlePath = path.join(outDir, 'browser-evidence-bundle.json');
const entries = collectBrowserEvidenceV147(root);
const bundle = buildBrowserEvidenceBundleV147(entries);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`);
const failedDir = path.join(outDir, 'failed-full-reports');
fs.rmSync(failedDir, { recursive: true, force: true });
for (const entry of entries) {
  if (entry.report.passed === true) continue;
  fs.mkdirSync(failedDir, { recursive: true });
  fs.copyFileSync(path.join(root, entry.source), path.join(failedDir, path.basename(entry.source)));
}
console.log(`PASS v1.0.47 compact browser evidence (${bundle.passedCount} passed, ${bundle.failedCount} failed)`);
