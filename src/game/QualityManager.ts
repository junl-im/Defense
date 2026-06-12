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

function queryTierOverride(): QualityTier | undefined {
  if (typeof window === 'undefined') return undefined;
  const query = new URLSearchParams(window.location.search);
  return normalizeTier(query.get('quality') ?? query.get('tier'));
}

function runtimeLockdownActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('ksRuntimeLockdown') === '1' || document.documentElement.classList.contains('ks-runtime-lockdown');
  } catch {
    return document.documentElement.classList.contains('ks-runtime-lockdown');
  }
}

function richArtOverride(): boolean {
  if (typeof window === 'undefined') return false;
  const query = new URLSearchParams(window.location.search);
  return query.has('fullart') || query.has('galleryart') || query.has('richart');
}

export function getQualityTier(): QualityTier {
  if (cachedProfile) return cachedProfile.tier;
  if (runtimeLockdownActive()) return 'low';
  const forced = queryTierOverride();
  if (forced) return forced;
  let saved: QualityTier | undefined;
  try {
    saved = normalizeTier(localStorage.getItem(STORAGE_KEY));
  } catch {
    saved = undefined;
  }

  // v2.28: phones reported severe freezes after the heavy art passes.
  // Default mobile/coarse-pointer runtime is now battery-safe unless explicitly overridden.
  if (isMobileLike() && !richArtOverride()) return 'low';
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
      resolution: runtimeLockdownActive() ? 0.75 : 0.85,
      targetFps: runtimeLockdownActive() ? 26 : 30,
      ambientMotes: 1,
      maxFxCostPerSecond: runtimeLockdownActive() ? 2 : 4,
      particleMultiplier: runtimeLockdownActive() ? 0.12 : 0.24,
      cameraShakeMultiplier: runtimeLockdownActive() ? 0.12 : 0.25,
      tweenMultiplier: runtimeLockdownActive() ? 0.28 : 0.42,
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
    min: profile.tier === 'low' ? 18 : 24,
    panicMax: profile.tier === 'low' ? 60 : 120,
    smoothStep: true,
  };
}
