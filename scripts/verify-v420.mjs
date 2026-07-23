import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => condition ? pass(message) : failures.push(message);
const registryPath = resolve(root, 'docs/ART_ASSET_APPROVAL_REGISTRY_v4.2.0.json');
check(existsSync(registryPath), 'historical v4.2.0 approval registry retained');
if (existsSync(registryPath)) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  check(registry.gameVersion === '4.2.0', 'historical registry version preserved');
  check(registry.runtimeAssets?.length === 19, 'historical registry retains 19 runtime assets');
  check(registry.summary?.runtimeProductionApproved === 0, 'historical approval baseline remains zero');
}
check(existsSync(resolve(root, 'docs/PATCH_NOTES_v4.2.0.md')), 'historical v4.2.0 patch notes retained');
check(existsSync(resolve(root, 'docs/PRODUCTION_GATE_AND_PERFORMANCE_v4.2.0.md')), 'historical v4.2.0 performance contract retained');
if (failures.length) {
  console.error(`\nFAIL v4.2.0 historical compatibility contract ${failures.length}건`);
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log('v4.2.0 historical compatibility contract verified');
