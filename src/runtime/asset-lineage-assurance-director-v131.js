export const ASSET_LINEAGE_ASSURANCE_V131_ID = 'DD-ASSET-LINEAGE-ASSURANCE-V131';

export const ASSET_LINEAGE_POLICY_V131 = Object.freeze({
  version: '1.0.31', build: 'b24.31', waveTarget: 70, auditedAssets: 10, auditedFiles: 30, mobileDangerLimit: 3,
  approval: Object.freeze({ pupuDirectional: 'final-approved-retained', pupuIndependentActions: 'derived-provisional', bombImpDirectional: 'replacement-pending', bombImpRuntime: 'quarantined', newFinalCharacterArt: 0 })
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const avg = (rows, key) => rows.reduce((sum, row) => sum + finite(row?.[key], 0), 0) / Math.max(1, rows.length);

export function validateAssetLineageAuditV131(audit = {}) {
  const assets = Array.isArray(audit.assets) ? audit.assets : [];
  const variants = assets.flatMap((asset) => Array.isArray(asset.variants) ? asset.variants : []);
  const hashes = variants.map((row) => row.sha256).filter(Boolean);
  return Object.freeze({
    assets: assets.length, files: variants.length, bosses: assets.filter((row) => row.kind === 'boss').length, monsters: assets.filter((row) => row.kind === 'monster').length,
    uniqueHashes: new Set(hashes).size, exactDuplicateGroups: Array.isArray(audit.exactDuplicateGroups) ? audit.exactDuplicateGroups.length : 0,
    approved: assets.length === 10 && variants.length === 30 && new Set(hashes).size === 30 && variants.every((row) => row.width > 0 && row.height > 0 && /^[a-f0-9]{64}$/.test(row.sha256 || ''))
  });
}

export function compactDangerGroupsV131(rows = [], limit = ASSET_LINEAGE_POLICY_V131.mobileDangerLimit) {
  const grouped = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const direction = String(row?.direction || 'unknown');
    const current = grouped.get(direction) || { direction, count: 0, remaining: Infinity, urgent: false };
    current.count += 1; current.remaining = Math.min(current.remaining, Math.max(0, finite(row?.remaining, Infinity))); current.urgent ||= current.remaining <= .8; grouped.set(direction, current);
  }
  return Object.freeze([...grouped.values()].sort((a,b) => a.remaining - b.remaining || b.count - a.count).slice(0, Math.max(1, Math.floor(finite(limit, 3)))).map(Object.freeze));
}

export default class AssetLineageAssuranceDirectorV131 {
  constructor({ combatVisual = null } = {}) { this.combatVisual = combatVisual; this.audit = null; this.auditResult = null; this.samples = []; this.lastWave = 0; this.report = Object.freeze({ id: ASSET_LINEAGE_ASSURANCE_V131_ID, version: '1.0.31', build: 'b24.31', ready: false, approval: ASSET_LINEAGE_POLICY_V131.approval }); }
  async install() {
    if (typeof document !== 'undefined') { document.documentElement.dataset.ddAssetLineageV131 = 'ready'; document.body.classList.add('asset-lineage-assurance-v131'); }
    try { const response = await fetch('./assets/visual-v131/asset-lineage-audit-v131.json', { cache: 'no-store' }); if (response.ok) { this.audit = await response.json(); this.auditResult = validateAssetLineageAuditV131(this.audit); } } catch { this.auditResult = Object.freeze({ approved: false, reason: 'audit-load-failed' }); }
    this.publish(); return this.report;
  }
  sample(snapshot = {}) {
    const wave = Math.max(0, Math.floor(finite(snapshot.wave, 0))); if (!wave || wave === this.lastWave) return; this.lastWave = wave;
    const memoryBytes = typeof performance !== 'undefined' ? finite(performance.memory?.usedJSHeapSize, 0) : 0;
    this.samples.push(Object.freeze({ wave, fps: Math.max(0, finite(snapshot.fps, 0)), particles: Math.max(0, Math.floor(finite(snapshot.particles, 0))), projectiles: Math.max(0, Math.floor(finite(snapshot.projectiles, 0))), activeRecords: Math.max(0, Math.floor(finite(this.combatVisual?.diagnostics?.activeRecords, 0))), memoryMb: memoryBytes > 0 ? Math.round(memoryBytes / 1048576 * 10) / 10 : null }));
    if (this.samples.length > 80) this.samples.shift();
  }
  lifecycleHealthy() {
    if (this.samples.length < 14) return true; const n = Math.min(10, Math.floor(this.samples.length / 2)); const early=this.samples.slice(0,n), late=this.samples.slice(-n);
    const fpsDrop=avg(early.filter(r=>r.fps>0),'fps')-avg(late.filter(r=>r.fps>0),'fps'); const particleGrowth=avg(late,'particles')-avg(early,'particles'); const projectileGrowth=avg(late,'projectiles')-avg(early,'projectiles'); const recordGrowth=avg(late,'activeRecords')-avg(early,'activeRecords');
    const em=early.filter(r=>r.memoryMb!==null), lm=late.filter(r=>r.memoryMb!==null); const memoryGrowth=em.length&&lm.length?avg(lm,'memoryMb')-avg(em,'memoryMb'):0; return fpsDrop<=22 && particleGrowth<=220 && projectileGrowth<=55 && recordGrowth<=38 && memoryGrowth<=144;
  }
  publish(extra = {}) { this.report=Object.freeze({ id: ASSET_LINEAGE_ASSURANCE_V131_ID, version:'1.0.31', build:'b24.31', audit:this.auditResult, latestWave:this.lastWave, seventyWaveTargetReached:this.lastWave>=70, lifecycleHealthy:this.lifecycleHealthy(), samples:this.samples.slice(), approval:ASSET_LINEAGE_POLICY_V131.approval, ...extra }); if (typeof window!=='undefined') window.__DOKKAEBI_ASSET_LINEAGE_V131__=this.report; }
  update(snapshot = {}) { this.sample(snapshot); this.publish({ dangerGroups: compactDangerGroupsV131(snapshot.dangerGroups || []) }); return this.report; }
  dispose() { if (typeof document !== 'undefined') document.body.classList.remove('asset-lineage-assurance-v131'); }
}
