import { readFileSync, writeFileSync } from 'node:fs';

export const PNG_MANIFEST_ICONS = Object.freeze([
  Object.freeze({
    src: './icon-192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'any'
  }),
  Object.freeze({
    src: './icon-512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any'
  }),
  Object.freeze({
    src: './icon-maskable-512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable'
  })
]);

const SVG_PATH_PATTERN = /\.svg(?:[?#]|$)/i;
const SVG_MIME_PATTERN = /^image\/svg\+xml(?:;|$)/i;

const containsSvgValue = (value) => (
  typeof value === 'string'
  && (SVG_PATH_PATTERN.test(value.trim()) || SVG_MIME_PATTERN.test(value.trim()))
);

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value
      .map(sanitizeValue)
      .filter((entry) => entry !== undefined);
  }

  if (!value || typeof value !== 'object') {
    return containsSvgValue(value) ? undefined : value;
  }

  if (containsSvgValue(value.src) || containsSvgValue(value.type)) {
    return undefined;
  }

  const cleaned = {};
  for (const [key, entry] of Object.entries(value)) {
    const sanitized = sanitizeValue(entry);
    if (sanitized !== undefined) cleaned[key] = sanitized;
  }
  return cleaned;
};

export const normalizeWebManifest = (manifest) => {
  const cleaned = sanitizeValue(manifest);
  if (!cleaned || typeof cleaned !== 'object' || Array.isArray(cleaned)) {
    throw new TypeError('Web manifest root must be an object.');
  }

  cleaned.icons = PNG_MANIFEST_ICONS.map((icon) => ({ ...icon }));
  return cleaned;
};

export const normalizeWebManifestFile = (filePath) => {
  const source = readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(source);
  const normalized = normalizeWebManifest(parsed);
  const output = `${JSON.stringify(normalized, null, 2)}\n`;

  if (source === output) return false;
  writeFileSync(filePath, output, 'utf8');
  return true;
};
