import {
  copyFileSync,
  existsSync,
  lstatSync,
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

const PATCH_OVERLAY_ALLOWED_DIRECTORIES = new Set([
  '.github', '.vscode', 'docs', 'production', 'public', 'scripts', 'src'
]);
const PATCH_OVERLAY_MARKERS = new Set([
  '.github', 'docs', 'index.html', 'package.json', 'public', 'scripts', 'src'
]);

function assertNoSymlinks(path, displayPath) {
  const entry = lstatSync(path);
  if (entry.isSymbolicLink()) {
    throw new Error(`unsafe accidental overlay symlink: ${displayPath}`);
  }
  if (!entry.isDirectory()) return;
  for (const name of readdirSync(path)) {
    assertNoSymlinks(resolve(path, name), `${displayPath}/${name}`);
  }
}

function mergeDirectory(source, target) {
  mkdirSync(target, { recursive: true });
  let files = 0;
  for (const name of readdirSync(source)) {
    const sourcePath = resolve(source, name);
    const targetPath = resolve(target, name);
    const entry = lstatSync(sourcePath);
    if (entry.isSymbolicLink()) throw new Error(`unsafe accidental overlay symlink: ${sourcePath}`);
    if (entry.isDirectory()) files += mergeDirectory(sourcePath, targetPath);
    else {
      mkdirSync(dirname(targetPath), { recursive: true });
      copyFileSync(sourcePath, targetPath);
      files += 1;
    }
  }
  return files;
}

export function recoverAccidentalRootOverlay({ root, log = console.log } = {}) {
  if (!root) throw new Error('recoverAccidentalRootOverlay requires root');
  const overlay = resolve(root, 'overlay');
  if (!existsSync(overlay)) return { recovered: false, files: 0 };
  if (!statSync(overlay).isDirectory()) {
    throw new Error('root overlay entry must be a directory');
  }

  const names = readdirSync(overlay);
  if (!names.length) {
    rmSync(overlay, { recursive: true, force: true });
    log('REMOVE empty accidental root overlay/');
    return { recovered: true, files: 0 };
  }

  const invalid = names.filter((name) => {
    const path = resolve(overlay, name);
    const entry = lstatSync(path);
    if (entry.isSymbolicLink()) return true;
    return entry.isDirectory()
      ? !PATCH_OVERLAY_ALLOWED_DIRECTORIES.has(name)
      : !CORE_ROOT_FILES.has(name);
  });
  if (invalid.length) {
    throw new Error(`unsafe accidental root overlay entries: ${invalid.join(', ')}`);
  }
  if (!names.some((name) => PATCH_OVERLAY_MARKERS.has(name))) {
    throw new Error('root overlay/ does not look like a project patch overlay');
  }

  assertNoSymlinks(overlay, 'overlay');
  let files = 0;
  for (const name of names) {
    const source = resolve(overlay, name);
    const target = resolve(root, name);
    const entry = lstatSync(source);
    if (entry.isDirectory()) files += mergeDirectory(source, target);
    else {
      copyFileSync(source, target);
      files += 1;
    }
  }
  rmSync(overlay, { recursive: true, force: true });
  log(`RECOVER accidental root overlay/ -> project root (${files} files)`);
  return { recovered: true, files };
}

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
  recoverAccidentalRootOverlay({ root, log });
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
  legacyPatchDirectory: LEGACY_PATCH_DIRECTORY.source,
  accidentalOverlayDirectory: 'overlay',
  accidentalOverlayRecovery: true
});
