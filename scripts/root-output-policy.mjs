import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync
} from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';

const CORE_ROOT_FILES = new Set([
  '.env.example', '.env.production', '.firebaserc', '.firebaserc.example', '.gitignore',
  'LICENSE', 'PROJECT_HANDOFF.md', 'README.md', 'RUN_LOCAL_MAC_LINUX.sh',
  'RUN_LOCAL_WINDOWS.bat', 'firebase.json', 'firestore.rules', 'index.html',
  'package-lock.json', 'package.json', 'requirements-atlas.txt', 'vite.config.js'
]);

const GENERATED_EXTENSIONS = new Set([
  '.log', '.tmp', '.bak', '.zip', '.png', '.jpg', '.jpeg', '.webp'
]);

const GENERATED_JSON = /(?:AUDIT|SIMULATION|REPORT|PACKAGE|MANIFEST|RESULT|DIAGNOSTIC).*\.json$/i;
const LEGACY_PATCH_FILE = /^(?:APPLY_PATCH(?:_v[0-9.]+)?\.md|APPLY_[A-Z]{2}(?:-[A-Z]{2})?\.txt|README_PATCH(?:_v[0-9.]+)?\.(?:md|txt)|PATCH_(?:APPLY|APPLIED|DELETE|FILES|MANIFEST|README|NOTES)(?:_v[0-9.]+)?\.(?:md|txt|json)|DELETE_FILES(?:_v[0-9.]+)?\.txt)$/i;
const LEGACY_PATCH_DIRECTORY = /^_patch_info$/i;

function nextAvailablePath(path) {
  if (!existsSync(path)) return path;
  const parent = dirname(path);
  const extension = extname(path);
  const stem = basename(path, extension);
  let index = 2;
  while (existsSync(resolve(parent, `${stem}.duplicate-${index}${extension}`))) index += 1;
  return resolve(parent, `${stem}.duplicate-${index}${extension}`);
}

function isGeneratedRootFile(name) {
  if (CORE_ROOT_FILES.has(name)) return false;
  return GENERATED_EXTENSIONS.has(extname(name).toLowerCase())
    || GENERATED_JSON.test(name)
    || LEGACY_PATCH_FILE.test(name);
}

export function organizeLegacyRootOutput({ root, log = console.log } = {}) {
  if (!root) throw new Error('organizeLegacyRootOutput requires root');
  const destination = resolve(root, 'logs', 'legacy-root-output');
  const moved = [];
  const removedDuplicates = [];

  for (const name of readdirSync(root)) {
    const source = resolve(root, name);
    const entry = statSync(source);
    const shouldMove = entry.isDirectory()
      ? LEGACY_PATCH_DIRECTORY.test(name)
      : isGeneratedRootFile(name);
    if (!shouldMove) continue;

    mkdirSync(destination, { recursive: true });
    let target = resolve(destination, name);

    // Repeated CI runs should remain idempotent. When the same legacy entry was
    // already migrated, remove the stale root duplicate instead of multiplying it.
    if (existsSync(target)) {
      if (!entry.isDirectory() && statSync(target).isFile()) {
        const sourceSize = statSync(source).size;
        const targetSize = statSync(target).size;
        if (sourceSize === targetSize) {
          rmSync(source, { force: true, recursive: true });
          removedDuplicates.push(name);
          continue;
        }
      }
      target = nextAvailablePath(target);
    }

    renameSync(source, target);
    moved.push(name);
  }

  if (moved.length) log(`MIGRATE ${moved.length} legacy root entries -> logs/legacy-root-output/`);
  if (removedDuplicates.length) log(`REMOVE ${removedDuplicates.length} duplicate legacy root entries`);
  if (!moved.length && !removedDuplicates.length) log('PASS no legacy root output to organize');

  return { moved, removedDuplicates, destination };
}

export const ROOT_OUTPUT_POLICY = Object.freeze({
  legacyPatchFile: LEGACY_PATCH_FILE.source,
  legacyPatchDirectory: LEGACY_PATCH_DIRECTORY.source
});
