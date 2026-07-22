import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { CURRENT_ASSET_APPROVAL } from '../src/engine/asset-quality.js';
import { ART_STYLE_LOCK_ID } from '../src/art-style-tokens.js';

const root = resolve(import.meta.dirname, '..');
const checkOnly = process.argv.includes('--check');
const jsonOutput = resolve(root, 'docs/CURRENT_ASSET_AUDIT.json');
const mdOutput = resolve(root, 'docs/CURRENT_ASSET_AUDIT.md');

const modelPaths = Object.keys(CURRENT_ASSET_APPROVAL).map((id) => {
  const file = id.startsWith('player-') ? `${id}.glb` : `${id}.glb`;
  return { id, path: resolve(root, 'public/assets/models', file) };
});

function parseGlb(path) {
  const buffer = readFileSync(path);
  if (buffer.toString('ascii', 0, 4) !== 'glTF') throw new Error(`Invalid GLB: ${path}`);
  let offset = 12;
  let json = null;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const chunk = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4E4F534A) json = JSON.parse(chunk.toString('utf8').replace(/\0+$/g, '').trim());
    offset += 8 + length;
  }
  if (!json) throw new Error(`GLB JSON chunk missing: ${path}`);
  let triangles = 0;
  for (const mesh of json.meshes || []) {
    for (const primitive of mesh.primitives || []) {
      if (primitive.mode != null && primitive.mode !== 4) continue;
      const accessorIndex = primitive.indices ?? primitive.attributes?.POSITION;
      const count = json.accessors?.[accessorIndex]?.count || 0;
      triangles += Math.floor(count / 3);
    }
  }
  return {
    file: basename(path),
    bytes: buffer.length,
    triangles,
    meshes: json.meshes?.length || 0,
    nodes: json.nodes?.length || 0,
    nodeNames: (json.nodes || []).map((node) => node.name || '').filter(Boolean),
    materials: json.materials?.length || 0,
    textures: json.textures?.length || 0,
    images: json.images?.length || 0,
    skins: json.skins?.length || 0,
    animations: (json.animations || []).map((animation) => animation.name || 'unnamed'),
    extras: json.asset?.extras || {}
  };
}

const entries = modelPaths.map(({ id, path }) => {
  const metrics = parseGlb(path);
  const category = id.startsWith('boss-') ? 'boss' : id.startsWith('monster-') ? 'monster' : 'character';
  const requiredAnimations = category === 'boss' ? 8 : category === 'monster' ? 6 : 7;
  const triangleRange = category === 'boss' ? [10000, 18000] : category === 'monster' ? [5000, 9000] : [6000, 10000];
  const checks = {
    styleLockMetadata: metrics.extras?.styleLockId === ART_STYLE_LOCK_ID,
    triangleRange: metrics.triangles >= triangleRange[0] && metrics.triangles <= triangleRange[1],
    handPaintedTextures: metrics.textures >= 3 && metrics.images >= 3,
    skin: metrics.skins >= 1,
    animationClips: metrics.animations.length >= requiredAnimations,
    productionRegistry: CURRENT_ASSET_APPROVAL[id]?.productionReady === true
  };
  const passed = Object.values(checks).every(Boolean);
  return { id, category, declaredStatus: CURRENT_ASSET_APPROVAL[id]?.status || 'missing', productionPassed: passed, requirements: { triangleRange, requiredAnimations }, metrics, checks };
});
const summary = {
  total: entries.length,
  productionApproved: entries.filter((entry) => entry.productionPassed).length,
  prototypes: entries.filter((entry) => entry.declaredStatus === 'prototype-placeholder').length,
  missingSkin: entries.filter((entry) => !entry.checks.skin).length,
  missingAnimations: entries.filter((entry) => !entry.checks.animationClips).length,
  missingTextureSets: entries.filter((entry) => !entry.checks.handPaintedTextures).length
};
const document = { schemaVersion: 1, gameVersion: '3.4.0', styleLockId: ART_STYLE_LOCK_ID, summary, entries };
const jsonText = `${JSON.stringify(document, null, 2)}\n`;
const rows = entries.map((entry) => `| ${entry.id} | ${entry.metrics.triangles} | ${entry.metrics.skins} | ${entry.metrics.animations.length} | ${entry.metrics.textures} | ${entry.declaredStatus} | ${entry.productionPassed ? 'PASS' : 'FAIL'} |`).join('\n');
const mdText = `# 현재 전투 에셋 AAA 품질 감사 — v3.4.0\n\n- 스타일 잠금: \`${ART_STYLE_LOCK_ID}\`\n- 검사 모델: ${summary.total}\n- 제작 승인 통과: **${summary.productionApproved}**\n- 개발용 프로토타입: **${summary.prototypes}**\n\n현재 모델은 런타임 연결 기술을 검증하는 프로토타입이다. GLB 로딩 성공과 AAA 아트 제작 승인을 혼동하지 않는다.\n\n| Asset | Triangles | Skins | Clips | Textures | Declared | AAA |\n|---|---:|---:|---:|---:|---|---|\n${rows}\n\n## 자동 승인 필수 조건\n\n- GLB extras의 \`styleLockId\` 일치\n- 일반 캐릭터 6k~10k, 일반 몬스터 5k~9k, 보스 10k~18k triangles\n- BaseColor·Normal·ORM에 해당하는 텍스처/이미지 3개 이상\n- Skin 1개 이상\n- 카테고리별 필수 AnimationClip\n- 승인 레지스트리의 \`productionReady: true\`\n`;

if (checkOnly) {
  if (!existsSync(jsonOutput) || !existsSync(mdOutput)) throw new Error('Current asset audit outputs missing');
  if (readFileSync(jsonOutput, 'utf8') !== jsonText || readFileSync(mdOutput, 'utf8') !== mdText) throw new Error('Current asset audit is stale. Run npm run audit:art');
  if (summary.productionApproved !== 0 || summary.prototypes !== 14) throw new Error('Prototype quarantine mismatch');
  console.log(`PASS current asset audit: approved ${summary.productionApproved}, prototypes ${summary.prototypes}`);
} else {
  writeFileSync(jsonOutput, jsonText);
  writeFileSync(mdOutput, mdText);
  console.log(`WROTE asset audit: approved ${summary.productionApproved}, prototypes ${summary.prototypes}`);
}
