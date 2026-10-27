// 라니킹덤 v5.36 — Meshy/TRELLIS.2 GLB 자산 반입 검사 (Node 22+)
// 사용: node rani-next/asset-intake.mjs ./incoming-3d
// 원본은 읽기 전용. 합격해도 실제 게임을 자동 교체하지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

export const assetCatalog = Object.freeze({
  keep: '성채', gatehouse: '성문', wall: '성벽', tower: '감시탑',
  house: '주택', warehouse: '창고', barracks: '병영', farm: '농장',
  market: '시장', harbor: '항구', shipyard: '조선소', trade_ship: '무역선',
});
const dir = path.resolve(process.argv[2] || 'incoming-3d');
const budgetMB = Number(process.env.RANI_ASSET_MAX_MB || 15);
assert.ok(Number.isFinite(budgetMB) && budgetMB > 0 && budgetMB <= 200, '올바르지 않은 RANI_ASSET_MAX_MB');
const report = {
  version: 'v5.36', directory: dir, budgetMB, checkedAt: new Date().toISOString(),
  policy: '외부 GLB 검증만 수행. 게임 아틀라스/저장/충돌/렌더러 자동 변경 금지',
  items: [],
};
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.glb$/i.test(f)) : [];
for (const file of files) {
  const id = path.basename(file, path.extname(file));
  const abs = path.join(dir, file);
  const stat = fs.statSync(abs);
  const issues = [];
  if (!(id in assetCatalog)) issues.push('등록되지 않은 자산 ID');
  if (!stat.isFile()) issues.push('일반 파일 아님');
  if (stat.size > budgetMB * 1048576) issues.push('파일 용량 초과');
  if (stat.size < 20) issues.push('GLB 헤더 길이 부족');
  if (!issues.includes('GLB 헤더 길이 부족') && stat.isFile()) {
    const header = Buffer.alloc(12);
    const fd = fs.openSync(abs, 'r');
    try { fs.readSync(fd, header, 0, 12, 0); } finally { fs.closeSync(fd); }
    if (header.toString('ascii', 0, 4) !== 'glTF') issues.push('GLB 매직 헤더 불일치');
    if (header.readUInt32LE(4) !== 2) issues.push('GLB 2.0 형식 아님');
    if (header.readUInt32LE(8) !== stat.size) issues.push('GLB 기록 길이 불일치');
  }
  report.items.push({ id, label: assetCatalog[id] || '', file, bytes: stat.size, status: issues.length ? 'reject' : 'header_pass', issues });
}
report.summary = {
  total: report.items.length,
  headerPassed: report.items.filter(x => x.status === 'header_pass').length,
  rejected: report.items.filter(x => x.status === 'reject').length,
  missing: Object.keys(assetCatalog).filter(id => !report.items.some(x => x.id === id && x.status === 'header_pass')),
};
console.log(JSON.stringify(report, null, 2));
if (report.summary.rejected) process.exitCode = 1;
// 주의: header_pass는 지오메트리/라이선스/시점/텍스처/성능 검사를 통과했다는 뜻이 아니다.
