import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { ART_STYLE_LOCK_ID, ABSOLUTE_STYLE_PROMPT, ABSOLUTE_NEGATIVE_PROMPT, ASSET_APPROVAL_STATES } from '../src/art-style-tokens.js';
import { CURRENT_ASSET_APPROVAL, ASSET_APPROVAL_POLICY } from '../src/engine/asset-quality.js';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };
const catalog = JSON.parse(readFileSync(resolve(root, 'docs/AAA_ASSET_PROMPT_CATALOG.json'), 'utf8'));
const audit = JSON.parse(readFileSync(resolve(root, 'docs/CURRENT_ASSET_AUDIT.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(resolve(root, 'docs/ASSET_MANIFEST.json'), 'utf8'));
const main = readFileSync(resolve(root, 'src/main.js'), 'utf8');
const pipeline = readFileSync(resolve(root, 'src/engine/asset-pipeline.js'), 'utf8');
const premium = readFileSync(resolve(root, 'src/premium-assets.js'), 'utf8');
const diagnostics = readFileSync(resolve(root, 'src/asset-diagnostics.js'), 'utf8');

if (ART_STYLE_LOCK_ID === 'DD-AAA-CASUAL-SD-PBR-3.0') pass('절대 스타일 잠금 ID'); else fail('스타일 잠금 ID');
const promptHash = createHash('sha256').update(ABSOLUTE_STYLE_PROMPT).digest('hex');
if (promptHash.length === 64 && ABSOLUTE_STYLE_PROMPT.split('\n').length >= 30) pass(`절대 프롬프트 SHA-256 ${promptHash.slice(0, 12)}`); else fail('절대 프롬프트 무결성');
if (ABSOLUTE_NEGATIVE_PROMPT.includes('No') === false && ABSOLUTE_NEGATIVE_PROMPT.includes('photorealistic')) pass('네거티브 프롬프트 분리'); else fail('네거티브 프롬프트');
for (const [key, expected] of Object.entries({ character: 50, monster: 50, boss: 20, weapon: 100, ui: 300, vfx: 150, environment: 80 })) {
  if (catalog.counts[key] === expected) pass(`프롬프트 ${key} ${expected}종`); else fail(`프롬프트 ${key} 수량`);
}
if (catalog.total === 750 && catalog.assets.every((asset) => asset.styleLockId === ART_STYLE_LOCK_ID && asset.prompt.startsWith(ABSOLUTE_STYLE_PROMPT))) pass('750종 절대 프롬프트 상속'); else fail('프롬프트 카탈로그 잠금');
const approvals = Object.values(CURRENT_ASSET_APPROVAL);
if (approvals.length === 14 && approvals.filter((entry) => entry.status === ASSET_APPROVAL_STATES.prototype).length === 13 && approvals.filter((entry) => entry.status === ASSET_APPROVAL_STATES.review && entry.technicalReady).length === 1) pass('프로토타입 13종·골든 샘플 리뷰 1종 격리'); else fail('에셋 승인 상태');
if (audit.summary.productionApproved === 0 && audit.summary.prototypes === 13 && audit.summary.artReview === 1 && audit.summary.technicalCandidates === 1) pass('실제 GLB 감사와 리뷰 레지스트리 일치'); else fail('GLB 감사 상태');
if (manifest.artBible?.styleLockId === ART_STYLE_LOCK_ID && manifest.promptCatalog?.total === 750) pass('매니페스트 스타일 잠금 동기화'); else fail('매니페스트 동기화');
if (diagnostics.includes('골든 샘플 기술 검수') && diagnostics.includes('approval?.productionReady') && diagnostics.includes("approval?.status === 'art-review'")) pass('게임 진단에서 로드·기술 리뷰·최종 승인 분리'); else fail('런타임 승인 진단');
if (pipeline.includes('approval: entry.approval') && pipeline.includes('assetApproval')) pass('에셋 승인 메타데이터 런타임 전달'); else fail('승인 메타데이터 전달');
if (premium.includes('preserveAuthoredStylizedPbrMaterial') && premium.includes("approvalStatus === 'production-approved' || approvalStatus === 'art-review'") && premium.includes('authoredPbr ? preserveAuthoredStylizedPbrMaterial')) pass('승인·아트리뷰 PBR 재질 보존'); else fail('승인 PBR 재질 처리');
if (ASSET_APPROVAL_POLICY.currentPrototypeCount === 13 && ASSET_APPROVAL_POLICY.currentReviewCount === 1) pass('승인 정책 프로토타입·리뷰 수량'); else fail('승인 정책');

if (failures.length) process.exit(1);
console.log('AAA 아트 스타일 잠금·프로토타입 격리 검증 완료');
