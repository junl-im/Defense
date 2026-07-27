import { compactDangerSectorsV132 } from './silhouette-assurance-director-v132.js';

export const BOSS_IDENTITY_ASSURANCE_V133_ID = 'DD-BOSS-IDENTITY-ASSURANCE-V133';

export const BOSS_IDENTITY_PROFILES_V133 = Object.freeze({
  tiger: Object.freeze({
    type: 'tiger', name: '저승 호랑이', sigil: '虎', accent: '#ff5b47', secondary: '#ffd06a',
    family: '혈월', weapon: '발톱·도약', telegraph: '주황 원형 충격파', effectClass: 'tiger'
  }),
  serpent: Object.freeze({
    type: 'serpent', name: '청월 이무기', sigil: '龍', accent: '#39f4d4', secondary: '#0a728c',
    family: '청월', weapon: '독월 고리·혼령 덫', telegraph: '청록 동심원 장판', effectClass: 'serpent'
  }),
  king: Object.freeze({
    type: 'king', name: '백귀 야행왕', sigil: '王', accent: '#ff4fd8', secondary: '#ffd36a',
    family: '야행', weapon: '왕가면·처형 도약', telegraph: '자주·금색 행진 장판', effectClass: 'king'
  })
});

export const BOSS_IDENTITY_ASSURANCE_POLICY_V133 = Object.freeze({
  version: '1.0.33',
  build: 'b24.33',
  waveTarget: 90,
  bossProfiles: 3,
  silhouetteReviewPair: Object.freeze(['serpent', 'king']),
  minimumReviewPairColorDistance: 220,
  mobileSectorLimit: 3,
  approval: Object.freeze({
    bossIdentityProfiles: 'runtime-approved',
    serpentKingSilhouetteReview: 'human-review-retained-runtime-distinction-approved',
    pupuDirectional: 'final-approved-retained',
    pupuIndependentActions: 'derived-provisional',
    bombImpDirectional: 'replacement-pending',
    bombImpRuntime: 'quarantined',
    newFinalCharacterArt: 0
  })
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const average = (rows, key) => rows.reduce((sum, row) => sum + finite(row?.[key], 0), 0) / Math.max(1, rows.length);

function rgb(hex) {
  const value = Number.parseInt(String(hex || '').replace('#', ''), 16);
  return [value >> 16 & 255, value >> 8 & 255, value & 255];
}

export function colorDistanceV133(a, b) {
  const left = rgb(a);
  const right = rgb(b);
  return Math.round(Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]));
}

export function validateBossIdentityProfilesV133(profiles = BOSS_IDENTITY_PROFILES_V133) {
  const rows = Object.values(profiles || {});
  const serpent = profiles?.serpent;
  const king = profiles?.king;
  const reviewDistance = serpent && king
    ? colorDistanceV133(serpent.accent, king.accent) + colorDistanceV133(serpent.secondary, king.secondary)
    : 0;
  return Object.freeze({
    profiles: rows.length,
    uniqueSigils: new Set(rows.map((row) => row.sigil)).size,
    uniqueAccents: new Set(rows.map((row) => row.accent)).size,
    reviewDistance,
    approved: rows.length === BOSS_IDENTITY_ASSURANCE_POLICY_V133.bossProfiles
      && rows.every((row) => row.type && row.name && row.sigil && /^#[a-f0-9]{6}$/i.test(row.accent) && /^#[a-f0-9]{6}$/i.test(row.secondary))
      && new Set(rows.map((row) => row.sigil)).size === rows.length
      && new Set(rows.map((row) => row.accent)).size === rows.length
      && reviewDistance >= BOSS_IDENTITY_ASSURANCE_POLICY_V133.minimumReviewPairColorDistance
  });
}

export function resolveBossIdentityV133(type = '', phase = 1, intent = '') {
  const base = BOSS_IDENTITY_PROFILES_V133[type] || null;
  if (!base) return null;
  const normalizedPhase = Math.max(1, Math.floor(finite(phase, 1)));
  return Object.freeze({
    ...base,
    phase: normalizedPhase,
    intent: String(intent || base.telegraph),
    label: `${base.family} · ${base.weapon}`,
    aria: `${base.name}, ${normalizedPhase}단계, ${String(intent || base.telegraph)}`
  });
}

export function compactDangerSectorsV133(rows = [], limit = BOSS_IDENTITY_ASSURANCE_POLICY_V133.mobileSectorLimit) {
  return compactDangerSectorsV132(rows, limit).map((row) => Object.freeze({
    ...row,
    severity: row.urgent ? 'critical' : row.remaining <= 1.6 ? 'warning' : 'stable'
  }));
}

function viewportProfileV133() {
  if (typeof window === 'undefined') return 'server';
  const width = Math.max(1, window.visualViewport?.width || window.innerWidth || 1);
  const height = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
  if (width <= 390 && height >= width) return 'mobile-narrow';
  if (height >= width && width <= 720) return 'mobile-portrait';
  if (height < width && height <= 560) return 'mobile-landscape-short';
  if (width <= 960) return 'tablet';
  return width <= 1440 ? 'desktop-compact' : 'desktop-wide';
}

export default class BossIdentityAssuranceDirectorV133 {
  constructor({ bossHealth = null, combatVisual = null } = {}) {
    this.bossHealth = bossHealth;
    this.combatVisual = combatVisual;
    this.badge = null;
    this.samples = [];
    this.lastWave = 0;
    this.activeIdentity = null;
    this.profileValidation = validateBossIdentityProfilesV133();
    this.report = Object.freeze({
      id: BOSS_IDENTITY_ASSURANCE_V133_ID,
      version: BOSS_IDENTITY_ASSURANCE_POLICY_V133.version,
      build: BOSS_IDENTITY_ASSURANCE_POLICY_V133.build,
      ready: false,
      approval: BOSS_IDENTITY_ASSURANCE_POLICY_V133.approval
    });
  }

  install() {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.ddBossIdentityV133 = 'ready';
      document.body.classList.add('boss-identity-assurance-v133');
      const parent = this.bossHealth || document.getElementById('boss-health') || document.body;
      this.badge = document.getElementById('boss-identity-badge-v133') || document.createElement('div');
      this.badge.id = 'boss-identity-badge-v133';
      this.badge.className = 'boss-identity-badge-v133';
      this.badge.setAttribute('role', 'status');
      this.badge.setAttribute('aria-live', 'polite');
      this.badge.setAttribute('aria-atomic', 'true');
      this.badge.setAttribute('aria-hidden', 'true');
      this.badge.hidden = true;
      const heading = parent.querySelector?.('.boss-health-head');
      const anchor = heading?.nextSibling || parent.firstChild;
      if (this.badge.parentNode !== parent || this.badge !== anchor) parent.insertBefore(this.badge, anchor);
    }
    this.publish();
    return this.report;
  }

  applyIdentity(identity) {
    this.activeIdentity = identity;
    if (typeof document === 'undefined') return;
    const body = document.body;
    const health = this.bossHealth || document.getElementById('boss-health');
    for (const type of Object.keys(BOSS_IDENTITY_PROFILES_V133)) body.classList.toggle(`boss-identity-${type}-v133`, identity?.type === type);
    body.classList.toggle('boss-identity-active-v133', Boolean(identity));
    if (health) {
      health.dataset.bossIdentityV133 = identity?.type || '';
      if (identity) {
        health.style.setProperty('--boss-identity-accent-v133', identity.accent);
        health.style.setProperty('--boss-identity-secondary-v133', identity.secondary);
      } else {
        health.style.removeProperty('--boss-identity-accent-v133');
        health.style.removeProperty('--boss-identity-secondary-v133');
      }
    }
    if (!this.badge) return;
    this.badge.classList.toggle('visible', Boolean(identity));
    this.badge.replaceChildren();
    this.badge.hidden = !identity;
    this.badge.setAttribute('aria-hidden', identity ? 'false' : 'true');
    if (!identity) {
      this.badge.removeAttribute('aria-label');
      return;
    }
    const sigil = document.createElement('strong');
    sigil.textContent = identity.sigil;
    const copy = document.createElement('span');
    const title = document.createElement('b');
    title.textContent = identity.label;
    const detail = document.createElement('small');
    detail.textContent = `PHASE ${identity.phase} · ${identity.intent}`;
    copy.append(title, detail);
    this.badge.append(sigil, copy);
    this.badge.setAttribute('aria-label', identity.aria);
  }

  sample(snapshot = {}) {
    const wave = Math.max(0, Math.floor(finite(snapshot.wave, 0)));
    if (!wave || wave === this.lastWave) return;
    this.lastWave = wave;
    const memoryBytes = typeof performance !== 'undefined' ? finite(performance.memory?.usedJSHeapSize, 0) : 0;
    const visual = this.combatVisual?.diagnostics || {};
    this.samples.push(Object.freeze({
      wave,
      fps: Math.max(0, finite(snapshot.fps, 0)),
      particles: Math.max(0, Math.floor(finite(snapshot.particles, 0))),
      projectiles: Math.max(0, Math.floor(finite(snapshot.projectiles, 0))),
      hazards: Math.max(0, Math.floor(finite(snapshot.hazards, 0))),
      activeRecords: Math.max(0, Math.floor(finite(visual.activeRecords, 0))),
      memoryMb: memoryBytes > 0 ? Math.round(memoryBytes / 1048576 * 10) / 10 : null
    }));
    if (this.samples.length > 108) this.samples.shift();
  }

  lifecycleHealthy() {
    if (this.samples.length < 18) return true;
    const count = Math.min(14, Math.floor(this.samples.length / 2));
    const early = this.samples.slice(0, count);
    const late = this.samples.slice(-count);
    const earlyFps = early.filter((row) => row.fps > 0);
    const lateFps = late.filter((row) => row.fps > 0);
    const fpsDrop = earlyFps.length && lateFps.length ? average(earlyFps, 'fps') - average(lateFps, 'fps') : 0;
    const earlyMemory = early.filter((row) => row.memoryMb !== null);
    const lateMemory = late.filter((row) => row.memoryMb !== null);
    const memoryGrowth = earlyMemory.length && lateMemory.length ? average(lateMemory, 'memoryMb') - average(earlyMemory, 'memoryMb') : 0;
    return fpsDrop <= 25
      && average(late, 'particles') - average(early, 'particles') <= 280
      && average(late, 'projectiles') - average(early, 'projectiles') <= 68
      && average(late, 'hazards') - average(early, 'hazards') <= 20
      && average(late, 'activeRecords') - average(early, 'activeRecords') <= 48
      && memoryGrowth <= 184;
  }

  update(snapshot = {}) {
    const boss = snapshot.boss || null;
    const identity = boss ? resolveBossIdentityV133(boss.type, boss.phase, boss.intent) : null;
    if (identity?.type !== this.activeIdentity?.type || identity?.phase !== this.activeIdentity?.phase || identity?.intent !== this.activeIdentity?.intent) this.applyIdentity(identity);
    const sectors = compactDangerSectorsV133(snapshot.directionGroups || []);
    const profile = viewportProfileV133();
    if (typeof document !== 'undefined') {
      document.body.dataset.bossIdentityViewportV133 = profile;
      document.body.classList.toggle('boss-identity-mobile-narrow-v133', profile === 'mobile-narrow');
    }
    this.sample(snapshot);
    this.publish({ sectors, viewport: profile });
    return this.report;
  }

  publish(extra = {}) {
    this.report = Object.freeze({
      id: BOSS_IDENTITY_ASSURANCE_V133_ID,
      version: BOSS_IDENTITY_ASSURANCE_POLICY_V133.version,
      build: BOSS_IDENTITY_ASSURANCE_POLICY_V133.build,
      ready: this.profileValidation.approved,
      profileValidation: this.profileValidation,
      activeBoss: this.activeIdentity,
      samples: this.samples.length,
      highestWave: this.samples.reduce((max, row) => Math.max(max, row.wave), 0),
      ninetyWaveTargetReached: this.samples.some((row) => row.wave >= BOSS_IDENTITY_ASSURANCE_POLICY_V133.waveTarget),
      lifecycleHealthy: this.lifecycleHealthy(),
      approval: BOSS_IDENTITY_ASSURANCE_POLICY_V133.approval,
      ...extra
    });
    if (typeof window !== 'undefined') window.__DOKKAEBI_BOSS_IDENTITY_V133__ = this.report;
    return this.report;
  }
}
