import * as THREE from 'three';
import { MOBILE_ENGINE_CONFIG } from './engine-config.js';
import { PerformanceMonitor } from './performance-monitor.js';
import { GeometryBudget } from './geometry-budget.js';
import { WorldChunkManager } from './world-chunk-manager.js';
import { AdaptiveQualityGovernor } from './quality-governor.js';

function detectDevice() {
  const ua = navigator.userAgent || '';
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const saveData = Boolean(navigator.connection?.saveData);
  const lowEnd = cores <= 4 || memory <= 4 || saveData;
  const assetTier = lowEnd ? 'low' : mobile ? 'medium' : 'high';
  return { mobile, lowEnd, cores, memory, saveData, assetTier };
}

export class MobileGameEngine {
  constructor(config = MOBILE_ENGINE_CONFIG) {
    this.config = config;
    this.device = detectDevice();
    this.qualityGovernor = new AdaptiveQualityGovernor(config.adaptiveQuality, this.device);
    this.qualityProfile = this.qualityGovernor.profile;
    this.qualityScale = this.qualityProfile.scale;
    this.effectBudgetScale = this.qualityProfile.effectScale;
    this.monitor = new PerformanceMonitor(config.adaptiveQuality);
    this.geometryBudget = new GeometryBudget(config.budgets, { strict: false });
    this.worldChunks = new WorldChunkManager({ ...config.world, visibleChunkRadius: this.device.mobile ? 1 : config.world.visibleChunkRadius });
    this.renderer = null;
    this.assetQualityTier = this.device.assetTier;
    this.textureBudgetMB = this.device.lowEnd
      ? config.assets.textureBudgetLowMB
      : this.device.mobile
        ? config.assets.textureBudgetMobileMB
        : config.assets.textureBudgetDesktopMB;
  }

  createRenderer(canvas) {
    const injectedFactory = globalThis.__DOKKAEBI_RENDERER_FACTORY__;
    if (typeof injectedFactory === 'function') {
      this.renderer = injectedFactory({ canvas, engine: this });
      if (!this.renderer) throw new Error('주입된 테스트 렌더러가 유효하지 않습니다.');
      this.rendererFallback = 'injected-test';
      this.renderer.shadowMap ||= { enabled: false };
      this.renderer.capabilities ||= { getMaxAnisotropy: () => 1 };
      this.renderer.info ||= { memory: {}, render: {} };
      this.renderer.setPixelRatio?.(this.pixelRatio());
      return this.renderer;
    }
    const useAntialias = this.device.mobile ? this.config.renderer.antialiasMobile : this.config.renderer.antialiasDesktop;
    const attempts = [
      { antialias: useAntialias && !this.device.lowEnd, powerPreference: this.config.renderer.powerPreference, label: 'preferred' },
      { antialias: false, powerPreference: 'default', label: 'compatibility' },
      { antialias: false, powerPreference: 'low-power', label: 'low-power' }
    ];
    let lastError = null;
    this.rendererFallback = 'preferred';
    for (const attempt of attempts) {
      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: attempt.antialias,
          powerPreference: attempt.powerPreference,
          alpha: false,
          stencil: false,
          depth: true,
          failIfMajorPerformanceCaveat: false
        });
        this.rendererFallback = attempt.label;
        break;
      } catch (error) {
        lastError = error;
        console.warn(`[MobileGameEngine] renderer attempt failed: ${attempt.label}`, error);
      }
    }
    if (!this.renderer) {
      const reason = lastError instanceof Error ? lastError.message : String(lastError || 'unknown WebGL error');
      throw new Error(`WebGL 렌더러 초기화 실패: ${reason}`);
    }
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    const shadows = this.device.mobile ? this.config.renderer.shadowsMobile : this.config.renderer.shadowsDesktop;
    this.renderer.shadowMap.enabled = Boolean(shadows && this.qualityProfile.shadowScale > 0);
    if (this.renderer.shadowMap.enabled) this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(this.pixelRatio());
    return this.renderer;
  }

  pixelRatio() {
    const cap = this.device.lowEnd
      ? this.config.renderer.lowEndPixelRatio
      : this.device.mobile
        ? this.config.renderer.mobilePixelRatio
        : this.config.renderer.desktopPixelRatio;
    return Math.min(window.devicePixelRatio || 1, cap) * this.qualityScale;
  }

  resize(width, height) {
    if (!this.renderer) return;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.pixelRatio());
  }

  applyPresentationSafeMode({ reason = 'first-presentation-timeout' } = {}) {
    if (!this.renderer) return { applied: false, reason: 'renderer-missing' };
    const previousScale = this.qualityScale;
    const safeScale = Math.min(previousScale, this.device.mobile ? 0.68 : 0.78);
    this.qualityScale = safeScale;
    this.effectBudgetScale = Math.min(this.effectBudgetScale, 0.62);
    if (this.renderer.shadowMap) this.renderer.shadowMap.enabled = false;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1) * safeScale);
    this.rendererFallback = `${this.rendererFallback || 'preferred'}+presentation-safe`;
    this.presentationSafeMode = {
      active: true,
      reason,
      previousScale,
      scale: safeScale,
      appliedAt: Date.now()
    };
    return { applied: true, reason, previousScale, scale: safeScale, shadows: false };
  }

  updateAdaptiveQuality(dt) {
    const sample = this.monitor.sample(dt, this.qualityScale);
    if (!sample) return null;
    const snapshot = { ...this.monitor.snapshot, fps: sample.fps };
    const result = this.qualityGovernor.evaluate(snapshot);
    if (!result) return null;
    this.qualityProfile = result;
    this.qualityScale = result.scale;
    this.effectBudgetScale = result.effectScale;
    const shadowCapable = this.device.mobile ? this.config.renderer.shadowsMobile : this.config.renderer.shadowsDesktop;
    if (this.renderer?.shadowMap) this.renderer.shadowMap.enabled = Boolean(shadowCapable && result.shadowScale > 0);
    this.renderer?.setPixelRatio(this.pixelRatio());
    return { ...result, fps: sample.fps, performance: snapshot, effectBudgetScale: this.effectBudgetScale };
  }

  get diagnostics() {
    return {
      engine: 'Three.js Mobile Runtime',
      device: this.device,
      qualityScale: this.qualityScale,
      effectBudgetScale: this.effectBudgetScale,
      qualityProfile: this.qualityProfile,
      qualityGovernor: this.qualityGovernor.diagnostics,
      pixelRatio: this.pixelRatio(),
      shadows: Boolean(this.renderer?.shadowMap.enabled),
      assetQualityTier: this.assetQualityTier,
      textureBudgetMB: this.textureBudgetMB,
      rendererFallback: this.rendererFallback || 'none',
      presentationSafeMode: this.presentationSafeMode || null,
      performance: this.monitor.snapshot,
      rendererInfo: this.renderer?.info || null
    };
  }
}
