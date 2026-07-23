import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';

const root = resolve(import.meta.dirname, '..');
const catalogPath = resolve(root, 'public/assets/ip-v8/catalog.json');
const registryPath = resolve(root, 'public/assets/ip-v8/quality-registry-v9.json');
const approvalPath = resolve(root, 'docs/ART_ASSET_APPROVAL_REGISTRY_v9.0.0.json');
const libraryModulePath = resolve(root, 'src/ip-asset-library-v9.js');
const checkOnly = process.argv.includes('--check');
const STYLE_LOCK = 'DD-ABSOLUTE-ART-BIBLE-2.0';

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

const pngHasAlpha = (buffer) => {
  if (buffer.length < 33 || buffer.toString('ascii', 1, 4) !== 'PNG') return false;
  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  let transparency = null;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'tRNS') transparency = data;
    else if (type === 'IEND') break;
    offset += 12 + length;
  }
  if (!width || !height || bitDepth !== 8 || interlace !== 0 || !idat.length) return false;
  const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 })[colorType];
  if (!channels) return false;
  const bpp = channels;
  const rowBytes = width * channels;
  const raw = inflateSync(Buffer.concat(idat));
  let cursor = 0;
  let previous = Buffer.alloc(rowBytes);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[cursor++];
    const scan = raw.subarray(cursor, cursor + rowBytes);
    cursor += rowBytes;
    const row = Buffer.allocUnsafe(rowBytes);
    for (let x = 0; x < rowBytes; x += 1) {
      const left = x >= bpp ? row[x - bpp] : 0;
      const up = previous[x] || 0;
      const upLeft = x >= bpp ? previous[x - bpp] || 0 : 0;
      const value = scan[x];
      row[x] = filter === 0 ? value
        : filter === 1 ? (value + left) & 255
          : filter === 2 ? (value + up) & 255
            : filter === 3 ? (value + Math.floor((left + up) / 2)) & 255
              : (value + paeth(left, up, upLeft)) & 255;
    }
    if (colorType === 6) {
      for (let x = 3; x < row.length; x += 4) if (row[x] < 255) return true;
    } else if (colorType === 4) {
      for (let x = 1; x < row.length; x += 2) if (row[x] < 255) return true;
    } else if (colorType === 3 && transparency) {
      for (let x = 0; x < row.length; x += 1) if ((transparency[row[x]] ?? 255) < 255) return true;
    } else if (colorType === 2 && transparency?.length >= 6) {
      const tr = transparency.readUInt16BE(0) & 255, tg = transparency.readUInt16BE(2) & 255, tb = transparency.readUInt16BE(4) & 255;
      for (let x = 0; x < row.length; x += 3) if (row[x] === tr && row[x + 1] === tg && row[x + 2] === tb) return true;
    } else if (colorType === 0 && transparency?.length >= 2) {
      const gray = transparency.readUInt16BE(0) & 255;
      for (let x = 0; x < row.length; x += 1) if (row[x] === gray) return true;
    }
    previous = row;
  }
  return false;
};

const webpHasAlpha = (buffer) => {
  if (buffer.length < 24 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return false;
  if (buffer.includes(Buffer.from('ALPH'))) return true;
  const vp8x = buffer.indexOf(Buffer.from('VP8X'));
  return vp8x >= 0 && buffer.length > vp8x + 8 && (buffer[vp8x + 8] & 0x10) !== 0;
};

const classify = (asset) => {
  if (asset.tier === 'source-atlas') return 'source-atlas';
  if (asset.tier === 'auto-sliced-concept') return 'quarantined-fragment';
  if (asset.tier === 'curated-candidate' && asset.id.startsWith('curated_')) return 'reference-crop';
  return 'high-resolution-candidate';
};

const familyFor = (asset) => {
  const id = asset.id;
  if (/^hero_dokkaebi_/.test(id)) return 'core-dokkaebi-hero';
  if (/^hero_/.test(id)) return 'korean-fantasy-hero';
  if (/^boss_/.test(id)) return 'boss-family';
  if (/^(monster_|pet_)/.test(id)) return 'monster-family';
  if (/^(button_|frame_|icon_)/.test(id)) return 'ui-family';
  if (/^object_/.test(id)) return 'environment-prop-family';
  if (/^vfx_/.test(id)) return 'vfx-family';
  if (asset.category === 'atlas') return 'source-atlas';
  return `${asset.category}-reference`;
};

const scoreAsset = (asset, reviewTier, hasAlpha) => {
  const minDimension = Math.min(Number(asset.width || 0), Number(asset.height || 0));
  let score = reviewTier === 'high-resolution-candidate' ? 62
    : reviewTier === 'reference-crop' ? 32
      : reviewTier === 'source-atlas' ? 44 : 10;
  if (minDimension >= 512) score += 15;
  else if (minDimension >= 256) score += 10;
  else if (minDimension >= 128) score += 6;
  else if (minDimension >= 96) score += 2;
  if (asset.width === asset.height) score += 4;
  if (hasAlpha) score += 6;
  else if (['ui', 'vfx', 'vfx-objects'].includes(asset.category)) score -= 8;
  else score -= 3;
  if (/^(hero_|monster_|pet_|boss_|button_|frame_|icon_|object_|vfx_)/.test(asset.id)) score += 5;
  return Math.max(0, Math.min(100, score));
};

const issuesFor = (asset, reviewTier, hasAlpha) => {
  const issues = [];
  const minDimension = Math.min(Number(asset.width || 0), Number(asset.height || 0));
  if (!hasAlpha) issues.push('opaque-background');
  if (!hasAlpha && ['ui', 'vfx', 'vfx-objects'].includes(asset.category)) issues.push('transparency-required');
  if (minDimension < 256) issues.push('low-resolution');
  if (reviewTier === 'reference-crop') issues.push('sheet-crop-reference-only');
  if (reviewTier === 'quarantined-fragment') issues.push('auto-sliced-fragment');
  if (reviewTier === 'source-atlas') issues.push('source-sheet-not-standalone');
  if (reviewTier === 'high-resolution-candidate') issues.push('single-view-only', 'no-turnaround', 'no-runtime-technical-deliverable');
  return issues;
};

const recommendedUse = (reviewTier) => ({
  'high-resolution-candidate': 'art-direction-review-and-ui-concept-preview',
  'reference-crop': 'silhouette-color-and-detail-reference-only',
  'quarantined-fragment': 'source-reconstruction-reference-only',
  'source-atlas': 'source-board-and-lineage-reference-only'
}[reviewTier]);

if (!existsSync(catalogPath)) throw new Error(`Missing ${catalogPath}`);
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const assets = catalog.assets.map((asset) => {
  const absolute = resolve(root, 'public', asset.path);
  const bytes = readFileSync(absolute);
  const format = String(asset.format || '').toLowerCase();
  const hasAlpha = format === 'png' ? pngHasAlpha(bytes) : format === 'webp' ? webpHasAlpha(bytes) : false;
  const reviewTier = classify(asset);
  const score = scoreAsset(asset, reviewTier, hasAlpha);
  const issues = issuesFor(asset, reviewTier, hasAlpha);
  return {
    id: asset.id,
    category: asset.category,
    family: familyFor(asset),
    sourceTier: asset.tier,
    reviewTier,
    qualityBand: score >= 78 ? 'A-review' : score >= 55 ? 'B-review' : score >= 30 ? 'C-reference' : 'D-quarantine',
    reviewScore: score,
    format,
    path: asset.path,
    width: asset.width,
    height: asset.height,
    minDimension: Math.min(asset.width, asset.height),
    hasAlpha,
    background: hasAlpha ? 'alpha-capable' : 'opaque',
    fileBytes: bytes.length,
    sha256: asset.sha256 || createHash('sha256').update(bytes).digest('hex'),
    source: asset.source || basename(asset.path),
    artLock: asset.artLock || STYLE_LOCK,
    presentationEligible: reviewTier === 'high-resolution-candidate',
    runtime3DEligible: false,
    productionApproved: false,
    recommendedUse: recommendedUse(reviewTier),
    issues
  };
});

const count = (predicate) => assets.filter(predicate).length;
const countsByCategory = Object.fromEntries([...new Set(assets.map((asset) => asset.category))].sort().map((category) => [category, count((asset) => asset.category === category)]));
const summary = {
  version: '9.0.0',
  sourceLibraryVersion: catalog.summary.version,
  styleLock: STYLE_LOCK,
  totalFiles: assets.length,
  highResolutionCandidates: count((asset) => asset.reviewTier === 'high-resolution-candidate'),
  referenceCrops: count((asset) => asset.reviewTier === 'reference-crop'),
  quarantinedFragments: count((asset) => asset.reviewTier === 'quarantined-fragment'),
  sourceAtlases: count((asset) => asset.reviewTier === 'source-atlas'),
  transparentAssets: count((asset) => asset.hasAlpha),
  opaqueAssets: count((asset) => !asset.hasAlpha),
  under128EitherDimension: count((asset) => asset.width < 128 || asset.height < 128),
  presentationEligible: count((asset) => asset.presentationEligible),
  runtime3DEligible: count((asset) => asset.runtime3DEligible),
  productionApproved: count((asset) => asset.productionApproved),
  countsByCategory,
  productionGate: 'locked-until-golden-vertical-slice-6-of-6',
  interpretation: '970 source files are not 970 finished assets. Only named high-resolution files enter art review; crops and fragments remain reference-only.'
};

const registry = { schemaVersion: 1, generatedFor: 'Dokkaebi Defense v9.0.0', generatedAt: '2026-07-23', summary, assets };
const approvalRegistry = {
  schemaVersion: 9,
  gameVersion: '9.0.0',
  styleLock: STYLE_LOCK,
  sourceLibrary: 'public/assets/ip-v8',
  summary,
  goldenVerticalSliceApproved: 0,
  goldenVerticalSliceRequired: 6,
  massProductionUnlocked: false,
  productionApprovedAssetIds: [],
  reviewCandidateAssetIds: assets.filter((asset) => asset.reviewTier === 'high-resolution-candidate').map((asset) => asset.id),
  mandatoryReviewNotes: [
    'All 40 named candidates are single-view concept images, not final runtime models.',
    'All 970 files are opaque; UI, icon and VFX candidates require transparent production derivatives.',
    '823 auto-sliced fragments are quarantined and may never be counted as finished assets.',
    'Production approval still requires the full Absolute Art Bible evidence set.'
  ]
};

const libraryModule = `export const IP_ASSET_LIBRARY_V9 = Object.freeze(${JSON.stringify({
  version: '9.0.0',
  sourceLibraryVersion: catalog.summary.version,
  styleLock: STYLE_LOCK,
  totalFiles: summary.totalFiles,
  highResolutionCandidates: summary.highResolutionCandidates,
  referenceCrops: summary.referenceCrops,
  quarantinedFragments: summary.quarantinedFragments,
  sourceAtlases: summary.sourceAtlases,
  transparentAssets: summary.transparentAssets,
  productionApproved: summary.productionApproved,
  productionApprovalUnlocked: false,
  massProductionUnlocked: false,
  allowedPresentationUse: 'concept-review-only'
}, null, 2)});\nexport const IP_ASSET_LIBRARY_URL = './asset-library-v9.html';\n`;

const stable = (value) => `${JSON.stringify(value, null, 2)}\n`;
const outputs = [
  [registryPath, stable(registry)],
  [approvalPath, stable(approvalRegistry)],
  [libraryModulePath, libraryModule]
];

if (checkOnly) {
  const mismatches = outputs.filter(([path, expected]) => !existsSync(path) || readFileSync(path, 'utf8') !== expected).map(([path]) => path);
  if (mismatches.length) {
    console.error('Asset quality registry drift:', mismatches);
    process.exit(1);
  }
  console.log(`PASS v9 asset quality registry stable · ${summary.highResolutionCandidates} high-res · ${summary.quarantinedFragments} quarantined`);
} else {
  for (const [path, content] of outputs) writeFileSync(path, content);
  console.log(`Generated v9 asset registry: ${summary.totalFiles} files · ${summary.highResolutionCandidates} high-res candidates · ${summary.quarantinedFragments} quarantined fragments`);
}
