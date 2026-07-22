import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const inventoryPath = resolve(root, 'docs/RUNTIME_ASSET_INVENTORY_v3.8.0.json');
const failures = [];

const fail = (path, reason) => {
  const message = `${path}: ${reason}`;
  failures.push(message);
  console.error(`FAIL ${message}`);
  console.error(`::error title=Runtime asset contract::${message}`);
};

if (!existsSync(inventoryPath)) {
  fail('docs/RUNTIME_ASSET_INVENTORY_v3.8.0.json', 'runtime asset inventory is missing');
} else {
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
  if (inventory.requiredCount !== 14 || inventory.files?.length !== 14) {
    fail('runtime asset inventory', `expected 14 combat GLBs, found ${inventory.files?.length ?? 0}`);
  }

  for (const entry of inventory.files ?? []) {
    const absolute = resolve(root, entry.path);
    if (!existsSync(absolute)) {
      fail(entry.path, 'required GLB file is missing; apply the full v3.8.0 full or patch package');
      continue;
    }

    const size = statSync(absolute).size;
    if (size !== entry.bytes) {
      fail(entry.path, `size mismatch: expected ${entry.bytes}, found ${size}`);
      continue;
    }

    const data = readFileSync(absolute);
    const prefix = data.subarray(0, Math.min(data.length, 128)).toString('utf8');
    if (prefix.startsWith('version https://git-lfs.github.com/spec/v1')) {
      fail(entry.path, 'Git LFS pointer found instead of binary GLB content');
      continue;
    }

    if (data.length < 12 || data.toString('ascii', 0, 4) !== 'glTF') {
      fail(entry.path, 'invalid GLB header');
      continue;
    }

    const glbVersion = data.readUInt32LE(4);
    const declaredLength = data.readUInt32LE(8);
    if (glbVersion !== 2) fail(entry.path, `unsupported GLB version ${glbVersion}`);
    if (declaredLength !== data.length) fail(entry.path, `GLB length mismatch: header ${declaredLength}, file ${data.length}`);

    const digest = createHash('sha256').update(data).digest('hex');
    if (digest !== entry.sha256) {
      fail(entry.path, `SHA-256 mismatch: expected ${entry.sha256}, found ${digest}`);
      continue;
    }

    console.log(`PASS runtime GLB ${entry.path} · ${size} bytes`);
  }
}

if (failures.length) {
  console.error(`\n========== RUNTIME ASSET FAILURE DIGEST (${failures.length}) ==========`);
  failures.forEach((message, index) => console.error(`${index + 1}. ${message}`));
  console.error('================================================================');
  process.exit(1);
}

console.log('PASS required combat GLB contract · 14/14 files, headers, sizes and hashes');
