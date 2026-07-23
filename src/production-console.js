// legacy lineage: BATTLEFRONT v6 · MYTHIC CONVERGENCE v7 diagnostics preserved
import { CHARACTER_DNA_SUMMARY } from './character-dna.js';
import { IP_ASSET_LIBRARY_V13, IP_ASSET_LIBRARY_URL } from './ip-asset-library-v13.js';
import { HERO_ARCHETYPE_SUMMARY } from './hero-archetype-system.js';
import { GUARDIAN_COUNCIL_SUMMARY } from './guardian-council-system.js';

export class ProductionConsole {
  constructor({ getDiagnostics, artSummary, milestones = [] } = {}) {
    this.getDiagnostics = getDiagnostics || (() => ({}));
    this.artSummary = artSummary || {};
    this.milestones = milestones;
    this.elapsed = 0;
    this.enabled = new URLSearchParams(window.location.search).get('director') === '1';
    this.element = document.createElement('aside');
    this.element.className = 'production-console';
    this.element.hidden = !this.enabled;
    this.element.setAttribute('aria-live', 'polite');
    document.body.append(this.element);
    this.render();
  }

  toggle(force) {
    this.enabled = typeof force === 'boolean' ? force : !this.enabled;
    this.element.hidden = !this.enabled;
    if (this.enabled) this.render();
    return this.enabled;
  }

  update(dt) {
    if (!this.enabled) return;
    this.elapsed += dt;
    if (this.elapsed < 0.5) return;
    this.elapsed = 0;
    this.render();
  }

  render() {
    const data = this.getDiagnostics() || {};
    const perf = data.performance || {};
    const assets = data.assets || {};
    const quality = data.quality || {};
    const encounter = data.encounter || {};
    const combat = data.combat || {};
    const statusEffects = data.statusEffects || {};
    const runtimeBudget = data.runtimeBudget || {};
    const reactions = data.reactions || {};
    const momentum = data.momentum || {};
    const bossEscalation = data.bossEscalation || {};
    const bossBreak = data.bossBreak || {};
    const campaign = data.campaign || {};
    const council = data.council || {};
    const equipmentForge = data.equipmentForge || {};
    const goldenSlice = data.goldenSlice || {};
    const camera = data.camera || {};
    const approved = Number(this.artSummary.approved || 0);
    const total = Number(this.artSummary.total || 0);
    const progress = total ? Math.round((approved / total) * 100) : 0;
    const milestoneHtml = this.milestones.slice(0, 4).map((item) => `<li><span>${item.status === 'done' ? 'DONE' : item.status === 'active' ? 'NOW' : 'NEXT'}</span>${item.label}</li>`).join('');
    this.element.innerHTML = `
      <header><div><small>DD PRODUCTION OS</small><b>TRANSPARENT ARSENAL v13 · 415 SLICED SPRITES</b></div><button type="button" data-close-console aria-label="제작 콘솔 닫기">×</button></header>
      <section class="production-console-grid">
        <article><small>ART LOCK</small><b>${this.artSummary.styleLockId || 'UNKNOWN'}</b><span>Production art ${approved}/${total} · ${progress}%</span></article>
        <article><small>RUNTIME SLICE</small><b>${goldenSlice.runtimeCertified || 0}/${goldenSlice.total || 6} PASS</b><span>${goldenSlice.runtimePassed ? 'Hero · Enemy · Boss · Map · HUD · VFX' : 'Evidence incomplete'}</span></article>
        <article><small>CAMERA</small><b>${String(camera.label || camera.profile || 'SCENIC').toUpperCase()}</b><span>Distance ${camera.distance || 0} · FOV ${camera.fov || 0} · F5 cycle</span></article>
        <article><small>DNA</small><b>v${CHARACTER_DNA_SUMMARY.version}</b><span>${CHARACTER_DNA_SUMMARY.classCount}직업 · ${CHARACTER_DNA_SUMMARY.rarityCount}희귀도 · ${CHARACTER_DNA_SUMMARY.animationClipCount}모션</span></article>
        <article><small>QUALITY</small><b>${String(quality.profile || 'n/a').toUpperCase()}</b><span>Scale ${Math.round((data.qualityScale || 1) * 100)}% · FX ${Math.round((data.effectBudgetScale || 1) * 100)}%</span></article>
        <article><small>FRAME</small><b>${Math.round(perf.fps || 0)} FPS</b><span>P95 ${perf.p95FrameMs || 0}ms · Severe ${perf.severeFramePercent || 0}%</span></article>
        <article><small>RENDER</small><b>${Number(data.drawCalls || 0)} CALLS</b><span>${Number(data.triangles || 0).toLocaleString()} tri</span></article>
        <article><small>ASSETS</small><b>${assets.cachedAssets || 0} READY</b><span>${assets.textureMemoryMB || 0}/${assets.textureBudgetMB || 0}MB</span></article>
        <article><small>ASSET REVIEW</small><b>${IP_ASSET_LIBRARY_V13.totalCrops} CUTS</b><span>Ready ${IP_ASSET_LIBRARY_V13.runtimeReady2D} · Review ${IP_ASSET_LIBRARY_V13.needsReview} · 3D approved ${IP_ASSET_LIBRARY_V13.production3DApproved}</span></article>
        <article><small>HERO ROSTER</small><b>${HERO_ARCHETYPE_SUMMARY.playableClasses} CLASSES</b><span>Passive ${HERO_ARCHETYPE_SUMMARY.passiveIds.length} · Runtime models 3 · Review art 5</span></article>
        <article><small>GUARDIAN COUNCIL</small><b>${council.bond?.name || 'STANDBY'}</b><span>${council.support?.name || 'No support'} · ${GUARDIAN_COUNCIL_SUMMARY.bondCount} bonds</span></article>
        <article><small>CAMPAIGN ACT</small><b>${campaign.current?.name || '달문 전초'}</b><span>ACT ${campaign.current?.index || 1}/4 · 전환 ${campaign.transitions || 0}</span></article>
        <article><small>BOSS BREAK</small><b>${bossBreak.breaks || 0} BREAK</b><span>활성 ${bossBreak.active?.length || 0} · 누적 ${Number(bossBreak.totalBreakDamage || 0).toLocaleString()} dmg</span></article>
        <article><small>EQUIPMENT FORGE</small><b>${equipmentForge.forged || 0} FORGED</b><span>정수 ${Number(equipmentForge.essence || 0).toLocaleString()} · Max +5</span></article>
        <article><small>ASSET FORGE</small><b>${IP_ASSET_LIBRARY_V13.curatedRuntimeAssets} CURATED</b><span>10 sheets · reconstructed alpha · crop QA</span></article>
        <article><small>DOCTRINE</small><b>${String(encounter.active?.name || 'STANDBY').toUpperCase()}</b><span>${encounter.active?.mutatorId || 'none'} · 압력 ${encounter.active?.adaptivePressure ?? 0}</span></article>
        <article><small>COMBAT</small><b>${Number(combat.damageDealt || 0).toLocaleString()} DMG</b><span>처치 ${combat.kills || 0} · 상태 ${statusEffects.applied || 0}</span></article>
        <article><small>BUDGET</small><b>${runtimeBudget.caps?.enemies || 0} ENEMY</b><span>압력 ${Math.round((runtimeBudget.pressure || 0) * 100)}% · 차단 ${runtimeBudget.blocked?.enemies || 0}</span></article>
        <article><small>REACTIONS</small><b>${reactions.triggered || 0} CHAIN</b><span>${Number(reactions.damage || 0).toLocaleString()} bonus · ${reactions.lastReaction?.label || 'standby'}</span></article>
        <article><small>MOMENTUM</small><b>${momentum.active ? 'OVERDRIVE' : `${momentum.gauge || 0}%`}</b><span>발동 ${momentum.overdriveCount || 0} · 피해 ×${Number(momentum.damageMultiplier || 1).toFixed(2)}</span></article>
        <article><small>BOSS RAGE</small><b>${bossEscalation.enrages || 0} ENRAGE</b><span>페이즈 ${bossEscalation.phaseTransitions || 0} · 활성 ${bossEscalation.active?.length || 0}</span></article>
      </section>
      <ol>${milestoneHtml}</ol>
      <footer><button type="button" data-open-ip-library>OPEN ASSET REVIEW OS</button> · F4 toggle · save schema ${data.saveSchemaVersion || 0}</footer>`;
    this.element.querySelector('[data-close-console]')?.addEventListener('click', () => this.toggle(false), { once: true });
    this.element.querySelector('[data-open-ip-library]')?.addEventListener('click', () => window.open(IP_ASSET_LIBRARY_URL, '_blank', 'noopener'), { once: true });
  }

  dispose() {
    this.element.remove();
  }
}
