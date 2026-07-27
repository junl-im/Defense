import fs from 'node:fs';
import path from 'node:path';

export const CANONICAL_TITLE = '도깨비 럭 디펜스 3D';
export const LEGACY_TITLES = Object.freeze([
  '도깨비 운빨 수호대 3D',
  '도깨비 운빨 수호대',
  '깨비수호대'
]);

function readUtf8(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

export function readPresentationSurfaces(dist) {
  const indexPath = path.join(dist, 'index.html');
  if (!fs.existsSync(indexPath)) throw new Error('dist/index.html missing');
  const index = readUtf8(indexPath);
  const manifestPath = path.join(dist, 'manifest.webmanifest');
  const manifestText = readUtf8(manifestPath);
  let manifest = null;
  if (manifestText) {
    try {
      manifest = JSON.parse(manifestText);
    } catch (error) {
      throw new Error(`dist/manifest.webmanifest is invalid JSON: ${error.message}`);
    }
  }
  return Object.freeze({ index, manifestText, manifest });
}

export function verifyCanonicalPresentationSurface({
  dist,
  canonicalTitle = CANONICAL_TITLE,
  legacyTitles = LEGACY_TITLES,
  requireManifest = false
}) {
  const surfaces = readPresentationSurfaces(dist);
  if (!surfaces.index.includes(canonicalTitle)) {
    throw new Error(`canonical title missing from dist/index.html: ${canonicalTitle}`);
  }
  if (requireManifest && !surfaces.manifest) {
    throw new Error('dist/manifest.webmanifest missing');
  }
  if (surfaces.manifest && surfaces.manifest.name !== canonicalTitle) {
    throw new Error(`canonical PWA name mismatch: ${surfaces.manifest.name || '(empty)'}`);
  }
  const activePresentationText = `${surfaces.index}\n${surfaces.manifestText}`;
  const legacy = legacyTitles.find((title) => activePresentationText.includes(title));
  if (legacy) {
    throw new Error(`legacy title remains on an active presentation surface: ${legacy}`);
  }
  return surfaces;
}
