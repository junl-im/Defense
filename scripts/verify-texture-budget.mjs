import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, resolve, relative } from 'node:path';
import { HERO_CLASSES } from '../src/hero-classes.js';

const root = resolve(import.meta.dirname, '..');
const roots = ['public', 'src/assets'].map((path) => resolve(root, path));
const files = [];
const MIP_FACTOR = 4 / 3;
const BUDGET_MB = 64;
const MAX_EDGE = 2048;

function walk(directory) {
  const rel = relative(root, directory).replaceAll('\\', '/');
  if (rel === 'public/assets/ip-v8' || rel.startsWith('public/assets/ip-v8/')) return;
  if (rel === 'public/assets/ip-v10' || rel.startsWith('public/assets/ip-v10/')) return;
  if (rel === 'public/assets/ip-v13' || rel.startsWith('public/assets/ip-v13/')) return;
  if (rel === 'public/assets/ip-v14' || rel.startsWith('public/assets/ip-v14/')) return;
  if (rel === 'public/assets/ip-v15' || rel.startsWith('public/assets/ip-v15/')) return;
  // IP Megabase reference boards are review-library documentation, not gameplay GPU textures.
  if (rel === 'public/assets/ip-mega-v4/reference' || rel.startsWith('public/assets/ip-mega-v4/reference/')) return;
  // v112 ships three quality tiers. The 64 MB gate represents the low-power profile,
  // so medium/high P0 atlases are verified separately by the release manifest.
  if (rel === 'public/assets/visual-v112/directional' || rel.startsWith('public/assets/visual-v112/directional/')) return;
  // v114 also ships three quality tiers. Only the 192px low-power combat set
  // is resident on the 64 MB mobile profile; medium/high are release-gated separately.
  if (rel === 'public/assets/visual-v114' || rel.startsWith('public/assets/visual-v114/')) return;
  // v117 adds three quality tiers for one approved directional golden sample
  // and four citadel states. Only low-tier files are resident on the mobile profile.
  if (rel === 'public/assets/visual-v117' || rel.startsWith('public/assets/visual-v117/')) return;
  // Responsive title art and its v17 production sources belong to the boot/title lifecycle,
  // not the resident combat set. Per-screen decoded memory is independently gated.
  if (rel === 'src/assets/title-v112' || rel.startsWith('src/assets/title-v112/')) return;
  if (rel === 'src/assets/title-v17' || rel.startsWith('src/assets/title-v17/')) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (['.png', '.webp', '.jpg', '.jpeg', '.ktx2'].includes(extname(entry.name).toLowerCase())) files.push(path);
  }
}

function pngSize(buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), bpp: 4 };
}

function webpSize(buffer) {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height, bpp: 4 };
  }
  if (chunk === 'VP8 ') {
    const marker = buffer.indexOf(Buffer.from([0x9d, 0x01, 0x2a]), 20);
    if (marker >= 0 && marker + 7 <= buffer.length) {
      return { width: buffer.readUInt16LE(marker + 3) & 0x3fff, height: buffer.readUInt16LE(marker + 5) & 0x3fff, bpp: 4 };
    }
  }
  if (chunk === 'VP8L' && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, bpp: 4 };
  }
  return null;
}

function jpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5), bpp: 4 };
    }
    if (length < 2) break;
    offset += 2 + length;
  }
  return null;
}

function ktx2Size(buffer) {
  const signature = Buffer.from([0xab,0x4b,0x54,0x58,0x20,0x32,0x30,0xbb,0x0d,0x0a,0x1a,0x0a]);
  if (buffer.length < 32 || !buffer.subarray(0, 12).equals(signature)) return null;
  return { width: buffer.readUInt32LE(20), height: buffer.readUInt32LE(24), bpp: 1 };
}

for (const directory of roots) walk(directory);
// Source libraries and mastered individual files are isolated from gameplay.
// The low-power runtime loads only the compact v15 1x WebP pages.
for (const atlas of [
  'public/assets/ip-v15/atlas/runtime-atlas-v15-p01-1x.webp',
  'public/assets/ip-v15/atlas/runtime-atlas-v15-p02-1x.webp',
  // v1.0.14 disables the old P0 prototype directional sheets at runtime.
  // The 192px polished set is the resident low-power combat profile.
  ...[
    'hero-archer','hero-mage','hero-shaman','hero-taoist',
    'guardian-frost','guardian-wind','guardian-stone','guardian-bell','guardian-thunder',
    'monster-imp','monster-runner','monster-brute','monster-shaman','monster-ghost','monster-skeleton','monster-crow',
    'boss-tiger','boss-serpent','boss-king'
  ].map((id) => `public/assets/visual-v114/characters/${id}-low-v114.webp`),
  // guardian-ember and all four citadel states are superseded by v117 and are
  // no longer resident in the runtime catalog.
  // v1.0.20 low-power protagonist/ember share one compact approved atlas.
  'public/assets/visual-v120/directional/hero-pupu-atlas-low-v120.webp',
  ...['stable','shielded','cracked','critical'].map((state) => `public/assets/visual-v117/citadel/guardian-citadel-${state}-low-v117.webp`)
]) {
  const path = resolve(root, atlas);
  if (!files.includes(path)) files.push(path);
}
let totalBytes = 0;
let failed = false;
for (const path of files) {
  const buffer = readFileSync(path);
  const extension = extname(path).toLowerCase();
  const dimensions = extension === '.png' ? pngSize(buffer)
    : extension === '.webp' ? webpSize(buffer)
      : extension === '.ktx2' ? ktx2Size(buffer)
        : jpegSize(buffer);
  const name = relative(root, path);
  if (!dimensions) {
    console.error(`FAIL texture header ${name}`);
    failed = true;
    continue;
  }
  const bytes = Math.round(dimensions.width * dimensions.height * dimensions.bpp * MIP_FACTOR);
  totalBytes += bytes;
  if (Math.max(dimensions.width, dimensions.height) > MAX_EDGE) {
    console.error(`FAIL texture edge ${name}: ${dimensions.width}x${dimensions.height} > ${MAX_EDGE}`);
    failed = true;
  } else {
    console.log(`PASS texture ${name}: ${dimensions.width}x${dimensions.height} · ${(bytes / 1048576).toFixed(2)}MB`);
  }
}
const totalMB = totalBytes / 1048576;
if (totalMB > BUDGET_MB) {
  console.error(`FAIL texture memory budget: ${totalMB.toFixed(2)}MB / ${BUDGET_MB}MB`);
  failed = true;
} else {
  console.log(`PASS texture memory budget: ${totalMB.toFixed(2)}MB / ${BUDGET_MB}MB`);
}
if (failed) process.exit(1);
