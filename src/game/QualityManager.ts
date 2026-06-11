import Phaser from 'phaser';

export type QualityTier = 'low' | 'medium' | 'high';

export type RenderProfile = {
  tier: QualityTier;
  resolution: number;
  targetFps: number;
  ambientMotes: number;
  maxFxCostPerSecond: number;
  particleMultiplier: number;
  cameraShakeMultiplier: number;
  tweenMultiplier: number;
  label: string;
};

type BudgetState = {
  windowStartedAt: number;
  cost: number;
};

const STORAGE_KEY = 'kingdom-seed:quality-tier';
const sceneBudget = new WeakMap<Phaser.Scene, BudgetState>();
let cachedProfile: RenderProfile | undefined;

function isMobileLike(): boolean {
  const ua = navigator.userAgent || '';
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  const smallScreen = typeof window !== 'undefined' && Math.min(window.screen.width, window.screen.height) <= 820;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || Boolean(coarse && smallScreen);
}

function hardwareTier(): QualityTier {
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  const memory = nav.deviceMemory ?? 4;
  const cores = nav.hardwareConcurrency ?? 4;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const longest = Math.max(window.screen.width, window.screen.height);
  const mobile = isMobileLike();

  if (memory <= 2 || cores <= 2 || (mobile && dpr >= 2.75 && longest < 1000)) return 'low';
  if (memory <= 4 || cores <= 4 || mobile) return 'medium';
  return 'high';
}

function normalizeTier(value: string | null | undefined): QualityTier | undefined {
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  return undefined;
}

export function getQualityTier(): QualityTier {
  if (cachedProfile) return cachedProfile.tier;
  let saved: QualityTier | undefined;
  try {
    saved = normalizeTier(localStorage.getItem(STORAGE_KEY));
  } catch {
    saved = undefined;
  }
  return saved ?? hardwareTier();
}

function applyQualityTier(tier: QualityTier, options: { persist: boolean; notify: boolean }): RenderProfile {
  if (options.persist) {
    try {
      localStorage.setItem(STORAGE_KEY, tier);
    } catch {
      // Ignore storage failures in restrictive webviews.
    }
  }
  cachedProfile = makeProfile(tier);
  applyQualityClasses(cachedProfile);
  if (options.notify) {
    window.dispatchEvent(new CustomEvent('kingdom-seed:quality-changed', { detail: cachedProfile }));
  }
  return cachedProfile;
}

export function setQualityTier(tier: QualityTier): RenderProfile {
  return applyQualityTier(tier, { persist: true, notify: true });
}

export function setRuntimeQualityTier(tier: QualityTier): RenderProfile {
  // v2.7: auto performance fallback must not reload the game mid-battle.
  // It applies DOM classes and runtime budgets immediately, while manual quality changes still reload cleanly.
  return applyQualityTier(tier, { persist: false, notify: false });
}

function makeProfile(tier: QualityTier): RenderProfile {
  if (tier === 'low') {
    return {
      tier,
      resolution: 1,
      targetFps: 45,
      ambientMotes: 4,
      maxFxCostPerSecond: 9,
      particleMultiplier: 0.42,
      cameraShakeMultiplier: 0.55,
      tweenMultiplier: 0.72,
      label: '절전',
    };
  }
  if (tier === 'medium') {
    return {
      tier,
      resolution: Math.min(window.devicePixelRatio || 1, 1.35),
      targetFps: 60,
      ambientMotes: 8,
      maxFxCostPerSecond: 17,
      particleMultiplier: 0.72,
      cameraShakeMultiplier: 0.82,
      tweenMultiplier: 0.9,
      label: '균형',
    };
  }
  return {
    tier,
    resolution: Math.min(window.devicePixelRatio || 1, 1.6),
    targetFps: 60,
    ambientMotes: 14,
    maxFxCostPerSecond: 28,
    particleMultiplier: 1,
    cameraShakeMultiplier: 1,
    tweenMultiplier: 1,
    label: '고품질',
  };
}

export function getRenderProfile(): RenderProfile {
  if (!cachedProfile) {
    cachedProfile = makeProfile(getQualityTier());
    applyQualityClasses(cachedProfile);
  }
  return cachedProfile;
}

export function applyQualityClasses(profile = getRenderProfile()): void {
  const root = document.documentElement;
  root.classList.toggle('ks-quality-low', profile.tier === 'low');
  root.classList.toggle('ks-quality-medium', profile.tier === 'medium');
  root.classList.toggle('ks-quality-high', profile.tier === 'high');
}

export function nextQualityTier(): RenderProfile {
  const tier = getRenderProfile().tier;
  return setQualityTier(tier === 'low' ? 'medium' : tier === 'medium' ? 'high' : 'low');
}

export function shouldSpawnFx(scene: Phaser.Scene, cost = 1): boolean {
  const profile = getRenderProfile();
  const now = scene.time.now;
  const state = sceneBudget.get(scene) ?? { windowStartedAt: now, cost: 0 };
  if (now - state.windowStartedAt > 1000) {
    state.windowStartedAt = now;
    state.cost = 0;
  }
  if (state.cost + cost > profile.maxFxCostPerSecond) {
    sceneBudget.set(scene, state);
    return false;
  }
  state.cost += cost;
  sceneBudget.set(scene, state);
  return true;
}

export function scaledFxCount(base: number, min = 1): number {
  return Math.max(min, Math.round(base * getRenderProfile().particleMultiplier));
}

export function scaledDuration(baseMs: number): number {
  return Math.max(40, Math.round(baseMs * getRenderProfile().tweenMultiplier));
}

export function scaledShake(intensity: number): number {
  return intensity * getRenderProfile().cameraShakeMultiplier;
}

export function lowPowerMode(): boolean {
  return getRenderProfile().tier === 'low';
}

export function makeGameFpsConfig(): Phaser.Types.Core.FPSConfig {
  const profile = getRenderProfile();
  return {
    target: profile.targetFps,
    min: 24,
    panicMax: 120,
    smoothStep: true,
  };
}
