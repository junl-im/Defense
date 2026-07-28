import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const checkMode = process.argv.includes('--check');
const sourcePath = path.join(root, 'docs/generated/runtime-asset-reachability-v143.json');
const jsonPath = path.join(root, 'docs/generated/asset-review-v144.json');
const mdPath = path.join(root, 'docs/generated/asset-review-v144.md');

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const candidates = source.largestReviewCandidates || [];

function classify(item) {
  const { path: assetPath } = item;
  if (/^public\/assets\/models\/.+\.glb$/.test(assetPath)) {
    return {
      disposition: 'retain-runtime-catalog',
      owner: 'runtime-assets',
      evidence: ['docs/RUNTIME_ASSET_INVENTORY_v4.0.0.json', 'docs/CURRENT_ASSET_AUDIT.json'],
      rationale: 'Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.'
    };
  }
  if (/^public\/assets\/ui\/v390\/.+\.png$/.test(assetPath)) {
    return {
      disposition: 'retain-production-candidate',
      owner: 'art-pipeline',
      evidence: ['scripts/generate_v390_raster_icons.py', 'docs/PATCH_FILE_REPORT_v3.9.0.json'],
      rationale: 'Approved raster candidate remains reproducible input and compatibility material for the v3.9 visual pipeline.'
    };
  }
  if (/^src\/assets\/title-v120\/title-mascot(?:-lite)?-v120\.webp$/.test(assetPath)) {
    return {
      disposition: 'retain-approval-lineage',
      owner: 'presentation',
      evidence: ['scripts/verify-release-v120.mjs', 'docs/PATCH_NOTES_v1.0.20.md'],
      rationale: 'The source asset is an explicit presentation approval boundary even when a later approved mascot is active.'
    };
  }
  if (assetPath === 'src/assets/moon-mascot-v1.webp') {
    return {
      disposition: 'retain-asset-readiness',
      owner: 'asset-assurance',
      evidence: ['scripts/verify-asset-readiness.mjs', 'docs/ASSET_MANIFEST.json'],
      rationale: 'The mascot is a mandatory readiness and source-manifest asset retained for fallback and audit coverage.'
    };
  }
  if (assetPath === 'public/assets/system-v135/runtime-module-shell-v135.json') {
    return {
      disposition: 'retain-runtime-contract',
      owner: 'release-engineering',
      evidence: ['scripts/verify-dist-v135.mjs', 'scripts/generate-runtime-shell-v135.mjs'],
      rationale: 'The generated module shell is a deployed service-worker and release-integrity contract.'
    };
  }
  throw new Error(`Unclassified v1.0.44 review candidate: ${assetPath}`);
}

if (source.reviewCandidates !== 24 || candidates.length !== 24) {
  throw new Error(`Expected 24 v1.0.43 review candidates, received ${source.reviewCandidates}/${candidates.length}`);
}

const reviews = candidates.map((item) => ({ ...item, ...classify(item), deleteApproved: false }));
const dispositions = Object.fromEntries([...new Set(reviews.map((item) => item.disposition))].sort().map((name) => [
  name,
  {
    count: reviews.filter((item) => item.disposition === name).length,
    bytes: reviews.filter((item) => item.disposition === name).reduce((sum, item) => sum + item.bytes, 0)
  }
]));

const report = {
  id: 'DD-ASSET-REVIEW-V144',
  releaseVersion: '1.0.44',
  sourceContract: source.id,
  sourceCandidateCount: source.reviewCandidates,
  reviewedCount: reviews.length,
  reviewedBytes: reviews.reduce((sum, item) => sum + item.bytes, 0),
  deleteApprovedCount: reviews.filter((item) => item.deleteApproved).length,
  policy: 'No candidate may be quarantined or deleted until an explicit follow-up patch changes deleteApproved and provides replacement evidence.',
  dispositions,
  reviews
};

const jsonText = `${JSON.stringify(report, null, 2)}\n`;
const mdText = `# Asset Review v1.0.44\n\n- Contract: ${report.id}\n- Source: ${report.sourceContract}\n- Candidates reviewed: ${report.reviewedCount}/${report.sourceCandidateCount}\n- Reviewed bytes: ${report.reviewedBytes.toLocaleString()}\n- Deletion approvals: ${report.deleteApprovedCount}\n\n> ${report.policy}\n\n## Dispositions\n\n${Object.entries(dispositions).map(([name, value]) => `- \`${name}\`: ${value.count} files, ${value.bytes.toLocaleString()} bytes`).join('\n')}\n\n## Reviewed candidates\n\n${reviews.map((item) => `- \`${item.path}\` — **${item.disposition}** — ${item.rationale}`).join('\n')}\n`;

if (checkMode) {
  const failures = [];
  if (!fs.existsSync(jsonPath) || fs.readFileSync(jsonPath, 'utf8') !== jsonText) failures.push(path.relative(root, jsonPath));
  if (!fs.existsSync(mdPath) || fs.readFileSync(mdPath, 'utf8') !== mdText) failures.push(path.relative(root, mdPath));
  if (failures.length) {
    failures.forEach((file) => console.error(`FAIL stale asset review ${file}`));
    process.exit(1);
  }
  console.log(`PASS v1.0.44 asset review (${reviews.length} retained, 0 deletion approvals)`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, jsonText);
fs.writeFileSync(mdPath, mdText);
console.log(`WROTE ${path.relative(root, jsonPath)} and ${path.relative(root, mdPath)}`);
