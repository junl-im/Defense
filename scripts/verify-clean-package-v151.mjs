import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const stage = path.join(root, 'logs/package/1.0.51/DokkaebiLuckDefense3D_FULL_v1.0.51_CI_SOURCE_R5');
if (!fs.existsSync(stage)) throw new Error('v151 staged package missing');
for (const banned of ['dist', 'node_modules', '.git', 'overlay']) if (fs.existsSync(path.join(stage, banned))) throw new Error(`v151 staged package contains ${banned}`);
const pkg = JSON.parse(fs.readFileSync(path.join(stage, 'package.json'), 'utf8'));
if (pkg.version !== '1.0.51' || pkg.dokkaebi?.buildId !== 'b24.51') throw new Error('v151 staged identity mismatch');
for (const file of [
  'src/runtime/character-presentation-policy-v151.js',
  'src/runtime/character-presentation-director-v151.js',
  'src/engine/character-material-enhancer-v151.js',
  'scripts/generate-release-identity-v151.mjs',
  'scripts/generate-build-input-manifest-v151.mjs',
  'scripts/verify-release-v151.mjs',
  'scripts/verify-repository-root-v151.mjs',
  'scripts/verify-ci-root-cleanup-v151.mjs',
  'scripts/verify-ci-source-revision-v151.mjs',
  'docs/generated/ci-source-revision-v151.json',
  'scripts/root-output-policy.mjs',
  'docs/generated/build-input-manifest-v151.json',
  'docs/PATCH_NOTES_v1.0.51.md',
  'docs/RELEASE_ASSURANCE_v1.0.51.md',
  'docs/CI_REPOSITORY_ROOT_REPAIR_v1.0.51.md',
  'docs/PATCH_PROVENANCE_v1.0.51.json',
  'docs/DELIVERY_RESULT_RULE.md'
]) if (!fs.existsSync(path.join(stage, file))) throw new Error(`v151 staged contract missing ${file}`);
console.log('PASS v1.0.51 clean source package staging');
