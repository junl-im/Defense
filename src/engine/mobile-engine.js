import * as THREE from 'three';
import { MOBILE_ENGINE_CONFIG } from './engine-config.js';
import { PerformanceMonitor } from './performance-monitor.js';
import { GeometryBudget } from './geometry-budget.js';
import { WorldChunkManager } from './world-chunk-manager.js';

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
    this.qualityScale = this.device.lowEnd ? 0.9 : 1;
    this.monitor = new PerformanceMonitor(config.adaptiveQuality);
    this.geometryBudget = new GeometryBudget(config.budgets, { strict: false });
    this.worldChunks = new WorldChunkManager(config.world);
    this.renderer = null;
    this.assetQualityTier = this.device.assetTier;
    this.textureBudgetMB = this.device.lowEnd
      ? config.assets.textureBudgetLowMB
      : this.device.mobile
        ? config.assets.textureBudgetMobileMB
        : config.assets.textureBudgetDesktopMB;
  }

  createRenderer(canvas) {
    const useAntialias = this.device.mobile ? this.config.renderer.antialiasMobile : this.config.renderer.antialiasDesktop;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: useAntialias && !this.device.lowEnd,
      powerPreference: this.config.renderer.powerPreference,
      alpha: false,
      stencil: false,
      depth: true
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.14;
    const shadows = this.device.mobile ? this.config.renderer.shadowsMobile : this.config.renderer.shadowsDesktop;
    this.renderer.shadowMap.enabled = Boolean(shadows);
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

  updateAdaptiveQuality(dt) {
    const result = this.monitor.sample(dt, this.qualityScale);
    if (!result || Math.abs(result.scale - this.qualityScale) < 0.001) return null;
    this.qualityScale = result.scale;
    this.renderer?.setPixelRatio(this.pixelRatio());
    return result;
  }

  get diagnostics() {
    return {
      engine: 'Three.js Mobile Runtime',
      device: this.device,
      qualityScale: this.qualityScale,
      pixelRatio: this.pixelRatio(),
      shadows: Boolean(this.renderer?.shadowMap.enabled),
      assetQualityTier: this.assetQualityTier,
      textureBudgetMB: this.textureBudgetMB,
      rendererInfo: this.renderer?.info || null
    };
  }
}
