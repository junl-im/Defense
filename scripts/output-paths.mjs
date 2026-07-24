import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export const PROJECT_ROOT = resolve(import.meta.dirname, '..');
export const LOG_ROOT = resolve(PROJECT_ROOT, 'logs');

const SAFE_CATEGORY = /^[a-z0-9][a-z0-9-]*$/;
const SAFE_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function ensureLogCategory(category) {
  if (!SAFE_CATEGORY.test(category)) throw new Error(`Unsafe log category: ${category}`);
  const directory = resolve(LOG_ROOT, category);
  mkdirSync(directory, { recursive: true });
  return directory;
}

export function getLogPath(category, filename) {
  if (!SAFE_FILENAME.test(filename)) throw new Error(`Unsafe log filename: ${filename}`);
  return resolve(ensureLogCategory(category), filename);
}

export function hasFlag(flag) {
  return process.argv.includes(flag);
}

export function generatedOutput({ category, filename, baseline }) {
  if (hasFlag('--refresh-baseline')) {
    if (!baseline) throw new Error('A baseline path is required for --refresh-baseline');
    return resolve(PROJECT_ROOT, baseline);
  }
  return getLogPath(category, filename);
}
