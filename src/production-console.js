// legacy lineage: BATTLEFRONT v6 · MYTHIC CONVERGENCE v7 diagnostics preserved
// GOLDEN DOMINION v12 · TRANSPARENT ARSENAL v13 · ATLAS DOMINION v14 · LIVING BATTLEFIELD v15 · CLEAR HORIZON v16 · MOON GATE REBORN v17 · TEN-WAVE RELIABILITY v18 lineage retained
import { CHARACTER_DNA_SUMMARY } from './character-dna.js';
import { IP_ASSET_LIBRARY_V15, IP_ASSET_ATLAS_URL } from './ip-asset-library-v15.js';
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
    const versionPolicy = data.versionPolicy || {};
    const coreFoundation = data.coreFoundation || {};
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
    const cameraDirector = data.cameraDirector || {};
    const spriteAtlas = data.spriteAtlas || {};
    const battlefieldProps = data.battlefieldProps || {};
    const battlefieldEvent = data.battlefieldEvent || {};
    const runtimeVisualAudit = data.runtimeVisualAudit || {};
    const waveFlow = data.waveFlow || {};
    const reliability = data.reliability || {};
    const browserReliability = data.browserReliability || {};
    const assetPresence = data.assetPresence || {};
    const mobileHud = data.mobileHudV23 || {};
    const combatReadability = data.combatReadability || {};
    const runtimeErrors = data.runtimeErrors || {};
    const approved = Number(this.artSummary.approved || 0);
    const total = Number(this.artSummary.total || 0);
    const progress = total ? Math.round((approved / total) * 100) : 0;
    const milestoneHtml = this.milestones.slice(0, 4).map((item) => `<li><span>${item.status === 'done' ? 'DONE' : item.status === 'active' ? 'NOW' : 'NEXT'}</span>${item.label}</li>`).join('');
    this.element.innerHTML = `
      <header><div><small>DD PRODUCTION OS</small><b>RELEASE FOUNDATION 1.0.2 · CORE HEALTH · CLEAN SHELL</b></div><button type="button" data-close-console aria-label="제작 콘솔 닫기">×</button></header>
      <section class="production-console-grid">
        <article><small>RELEASE</small><b>v${versionPolicy.releaseVersion || '1.0.2'} · ${versionPolicy.buildId || 'b24.2'}</b><span>Legacy ${versionPolicy.lineageVersion || '23.1.0'} · ${versionPolicy.id || 'version policy'}</span></article>
        <article><small>CORE HEALTH</small><b>${String(coreFoundation.health || 'healthy').toUpperCase()}</b><span>P95 ${coreFoundation.p95FrameMs || 0}ms · Pressure ${Math.round((coreFoundation.pressure || 0) * 100)}% · State ${coreFoundation.state || 'boot'}</span></article>
        <article><small>ART LOCK</small><b>${this.artSummary.styleLockId || 'UNKNOWN'}</b><span>Production art ${approved}/${total} · ${progress}%</span></article>
        <article><small>RUNTIME SLICE</small><b>${goldenSlice.runtimeCertified || 0}/${goldenSlice.total || 6} PASS</b><span>${goldenSlice.runtimePassed ? 'Hero · Enemy · Boss · Map · HUD · VFX' : 'Evidence incomplete'}</span></article>
        <article><small>CAMERA</small><b>${String(camera.label || camera.profile || 'SCENIC').toUpperCase()}</b><span>Distance ${camera.distance || 0} · Spread +${cameraDirector.spreadBonus || 0} · Pressure ${Math.round((cameraDirector.pressure || 0) * 100)}%</span></article>
        <article><small>DNA</small><b>v${CHARACTER_DNA_SUMMARY.version}</b><span>${CHARACTER_DNA_SUMMARY.classCount}직업 · ${CHARACTER_DNA_SUMMARY.rarityCount}희귀도 · ${CHARACTER_DNA_SUMMARY.animationClipCount}모션</span></article>
        <article><small>QUALITY</small><b>${String(quality.profile || 'n/a').toUpperCase()}</b><span>Scale ${Math.round((data.qualityScale || 1) * 100)}% · FX ${Math.round((data.effectBudgetScale || 1) * 100)}%</span></article>
        <article><small>FRAME</small><b>${Math.round(perf.fps || 0)} FPS</b><span>P95 ${perf.p95FrameMs || 0}ms · Severe ${perf.severeFramePercent || 0}%</span></article>
        <article><small>RENDER</small><b>${Number(data.drawCalls || 0)} CALLS</b><span>${Number(data.triangles || 0).toLocaleString()} tri</span></article>
        <article><small>ASSETS</small><b>${assets.cachedAssets || 0} READY</b><span>${assets.textureMemoryMB || 0}/${assets.textureBudgetMB || 0}MB</span></article>
        <article><small>ASSET REVIEW</small><b>${IP_ASSET_LIBRARY_V15.totalFrames} ATLAS</b><span>Pages ${IP_ASSET_LIBRARY_V15.atlasPages} · 1x/2x · Mastered ${IP_ASSET_LIBRARY_V15.edgeMasterPass} · 3D approved ${IP_ASSET_LIBRARY_V15.production3DApproved}</span></article>
        <article><small>HERO ROSTER</small><b>${HERO_ARCHETYPE_SUMMARY.playableClasses} CLASSES</b><span>Passive ${HERO_ARCHETYPE_SUMMARY.passiveIds.length} · Runtime models 3 · Review art 5</span></article>
        <article><small>GUARDIAN COUNCIL</small><b>${council.bond?.name || 'STANDBY'}</b><span>${council.support?.name || 'No support'} · ${GUARDIAN_COUNCIL_SUMMARY.bondCount} bonds</span></article>
        <article><small>CAMPAIGN ACT</small><b>${campaign.current?.name || '달문 전초'}</b><span>ACT ${campaign.current?.index || 1}/4 · 전환 ${campaign.transitions || 0}</span></article>
        <article><small>BOSS BREAK</small><b>${bossBreak.breaks || 0} BREAK</b><span>활성 ${bossBreak.active?.length || 0} · 누적 ${Number(bossBreak.totalBreakDamage || 0).toLocaleString()} dmg</span></article>
        <article><small>EQUIPMENT FORGE</small><b>${equipmentForge.forged || 0} FORGED</b><span>정수 ${Number(equipmentForge.essence || 0).toLocaleString()} · Max +5</span></article>
        <article><small>ASSET FORGE</small><b>${IP_ASSET_LIBRARY_V15.curatedFrames} CURATED</b><span>${IP_ASSET_LIBRARY_V15.atlasPages} pages · 1x/2x WebP/PNG · UV registry</span></article>
        <article><small>BATTLEFIELD SPRITES</small><b>${spriteAtlas.activeSprites || 0} ACTIVE</b><span>${spriteAtlas.atlasPages || 0} pages · ${spriteAtlas.loaded ? 'ready' : 'fallback'} · billboard budget</span></article>
        <article><small>VISUAL AUDIT</small><b>${runtimeVisualAudit.passCount || 0}/${runtimeVisualAudit.total || 7} PASS</b><span>${runtimeVisualAudit.passed ? 'Atlas · title · camera guard ready' : `${runtimeVisualAudit.warnings?.length || 0} warning`}</span></article>
        <article><small>WAVE FLOW</small><b>${waveFlow.recoveries || 0} RECOVERY</b><span>Spawn ${waveFlow.forcedSpawns || 0} · Modal ${waveFlow.modalRestores || 0} · Error ${runtimeErrors.count || 0}</span></article>
        <article><small>RUN RELIABILITY</small><b>${reliability.completedWaves || 0}/10 WAVES</b><span>Sweep ${reliability.enemySweeps || 0} · Queue ${reliability.rewardQueueResumes || 0} · BG ${reliability.backgroundResumes || 0}</span></article>
        <article><small>BROWSER LAB</small><b>${browserReliability.healthy ? 'HEALTHY' : 'WATCH'}</b><span>Boot ${browserReliability.bootReadyMs || 0}ms · Long ${browserReliability.longTasks || 0} · Heap +${browserReliability.heapGrowthMB || 0}MB · SW ${browserReliability.serviceWorker?.version || 'n/a'}</span></article>
        <article><small>ASSET PRESENCE</small><b>${assetPresence.healthy ? 'VISIBLE' : 'REVIEW'}</b><span>DOM ${assetPresence.visibleAtlasCount || 0}/${assetPresence.domAtlasCount || 0} · Action ${assetPresence.actionAssetCount || 0}/6 · Missing ${assetPresence.missing?.length || 0}</span></article>
        <article><small>MOBILE HUD v23</small><b>${String(mobileHud.context || (mobileHud.phone ? 'mobile' : 'desktop')).toUpperCase()}</b><span>Overlap ${mobileHud.overlapCount || 0} · Mitigation ${mobileHud.mitigations || 0} · ${mobileHud.healthy === false ? 'emergency layout' : 'stable'}</span></article>
        <article><small>COMBAT READABILITY</small><b>${combatReadability.markers || 0} MARKERS</b><span>Threat tracer ${combatReadability.tracers || 0} · Total ${combatReadability.totalTracers || 0} · Budget ${combatReadability.maxMarkers || 0}</span></article>
        <article><small>LIVING PROPS</small><b>${battlefieldProps.active || 0} ACTIVE</b><span>상호작용 ${battlefieldProps.interactable || 0} · 자동 방어 ${battlefieldProps.automated || 0} · 발동 ${battlefieldProps.activations || 0}</span></article>
        <article><small>BATTLEFIELD EVENT</small><b>${battlefieldEvent.active?.name || 'STANDBY'}</b><span>완료 ${battlefieldEvent.completed || 0} · 회복 ${battlefieldEvent.totalHealing || 0}</span></article>
        <article><small>DOCTRINE</small><b>${String(encounter.active?.name || 'STANDBY').toUpperCase()}</b><span>${encounter.active?.mutatorId || 'none'} · 압력 ${encounter.active?.adaptivePressure ?? 0}</span></article>
        <article><small>COMBAT</small><b>${Number(combat.damageDealt || 0).toLocaleString()} DMG</b><span>처치 ${combat.kills || 0} · 상태 ${statusEffects.applied || 0}</span></article>
        <article><small>BUDGET</small><b>${runtimeBudget.caps?.enemies || 0} ENEMY</b><span>압력 ${Math.round((runtimeBudget.pressure || 0) * 100)}% · 차단 ${runtimeBudget.blocked?.enemies || 0}</span></article>
        <article><small>REACTIONS</small><b>${reactions.triggered || 0} CHAIN</b><span>${Number(reactions.damage || 0).toLocaleString()} bonus · ${reactions.lastReaction?.label || 'standby'}</span></article>
        <article><small>MOMENTUM</small><b>${momentum.active ? 'OVERDRIVE' : `${momentum.gauge || 0}%`}</b><span>발동 ${momentum.overdriveCount || 0} · 피해 ×${Number(momentum.damageMultiplier || 1).toFixed(2)}</span></article>
        <article><small>BOSS RAGE</small><b>${bossEscalation.enrages || 0} ENRAGE</b><span>페이즈 ${bossEscalation.phaseTransitions || 0} · 활성 ${bossEscalation.active?.length || 0}</span></article>
      </section>
      <ol>${milestoneHtml}</ol>
      <footer><button type="button" data-open-ip-library>OPEN ASSET REVIEW OS</button> · 화면 버튼 전용 · save schema ${data.saveSchemaVersion || 0}</footer>`;
    this.element.querySelector('[data-close-console]')?.addEventListener('click', () => this.toggle(false), { once: true });
    this.element.querySelector('[data-open-ip-library]')?.addEventListener('click', () => window.open(IP_ASSET_ATLAS_URL, '_blank', 'noopener'), { once: true });
  }

  dispose() {
    this.element.remove();
  }
}
