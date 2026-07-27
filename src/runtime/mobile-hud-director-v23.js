export const MOBILE_HUD_V23_VERSION = '23.2.0';
export const MOBILE_HUD_RESILIENCE_V134_ID = 'DD-MOBILE-HUD-RESILIENCE-V134';

const CONTEXT_TARGETS = Object.freeze([
  Object.freeze({ id: 'wave-recovery', key: 'recovery', priority: 4 }),
  Object.freeze({ id: 'auto-wave-panel', key: 'wave', priority: 3 }),
  Object.freeze({ id: 'interact-btn', key: 'interact', priority: 2 }),
  Object.freeze({ id: 'danger-hint', key: 'danger', priority: 1 })
]);

const LAYOUT_TARGETS = Object.freeze([
  Object.freeze({ name: 'hud', id: 'hud' }),
  Object.freeze({ name: 'wave', id: 'wave-hud' }),
  Object.freeze({ name: 'boss', id: 'boss-health' }),
  Object.freeze({ name: 'joystick', id: 'joystick-zone' }),
  Object.freeze({ name: 'actions', id: 'action-dock' }),
  Object.freeze({ name: 'context-recovery', id: 'wave-recovery' }),
  Object.freeze({ name: 'context-wave', id: 'auto-wave-panel' }),
  Object.freeze({ name: 'context-interact', id: 'interact-btn' }),
  Object.freeze({ name: 'context-danger', id: 'danger-hint' })
]);

const OBSERVED_TARGET_IDS = Object.freeze([...new Set(LAYOUT_TARGETS.map((entry) => entry.id))]);
const ALLOWED_OVERLAPS = new Set(['hud:wave', 'wave:boss']);
const EMERGENCY_CLEAR_FRAMES = 3;
const KEYBOARD_THRESHOLD_PX = 80;

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

const visible = (element) => {
  if (!element?.isConnected) return false;
  const style = getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) <= 0.01) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 2 && rect.height > 2;
};

const overlaps = (a, b, gap = 4) => !(
  a.right + gap <= b.left ||
  b.right + gap <= a.left ||
  a.bottom + gap <= b.top ||
  b.bottom + gap <= a.top
);

const pairAllowed = (a, b) => ALLOWED_OVERLAPS.has(`${a}:${b}`) || ALLOWED_OVERLAPS.has(`${b}:${a}`);

export function resolveMobileViewportV23(metrics = {}) {
  const layoutWidth = Math.max(1, finite(metrics.layoutWidth, metrics.visualWidth || 1));
  const layoutHeight = Math.max(1, finite(metrics.layoutHeight, metrics.visualHeight || 1));
  const width = Math.max(1, finite(metrics.visualWidth, layoutWidth));
  const height = Math.max(1, finite(metrics.visualHeight, layoutHeight));
  const offsetLeft = Math.max(0, finite(metrics.offsetLeft, 0));
  const offsetTop = Math.max(0, finite(metrics.offsetTop, 0));
  const offsetRight = Math.max(0, layoutWidth - width - offsetLeft);
  const offsetBottom = Math.max(0, layoutHeight - height - offsetTop);
  const phone = layoutWidth <= 820;
  const compact = layoutWidth <= 430;
  const micro = layoutWidth <= 360;
  const short = height <= 620;
  const landscape = phone && layoutWidth > layoutHeight;
  const keyboard = phone && offsetBottom >= KEYBOARD_THRESHOLD_PX;
  const scale = landscape ? 0.96 : compact ? 0.98 : 1;
  const controlReserve = landscape ? 98 : micro ? 120 : compact ? 128 : 138;
  return Object.freeze({
    width,
    height,
    layoutWidth,
    layoutHeight,
    offsetLeft,
    offsetTop,
    offsetRight,
    offsetBottom,
    phone,
    compact,
    micro,
    short,
    landscape,
    keyboard,
    scale,
    controlReserve
  });
}

export function transitionEmergencyV23(previous = {}, overlapCount = 0) {
  const active = Boolean(previous.active);
  const collisionFrames = Math.max(0, Math.floor(finite(previous.collisionFrames, 0)));
  const clearFrames = Math.max(0, Math.floor(finite(previous.clearFrames, 0)));
  if (overlapCount > 0) {
    return Object.freeze({ active: true, collisionFrames: collisionFrames + 1, clearFrames: 0 });
  }
  if (!active) return Object.freeze({ active: false, collisionFrames: 0, clearFrames: clearFrames + 1 });
  const nextClearFrames = clearFrames + 1;
  return Object.freeze({
    active: nextClearFrames < EMERGENCY_CLEAR_FRAMES,
    collisionFrames: 0,
    clearFrames: nextClearFrames
  });
}

export default class MobileHudDirectorV23 {
  constructor() {
    this.version = MOBILE_HUD_V23_VERSION;
    this.id = MOBILE_HUD_RESILIENCE_V134_ID;
    this.elapsed = 0;
    this.refreshQueued = false;
    this.refreshFrame = 0;
    this.queueHandler = null;
    this.domHandler = null;
    this.installed = false;
    this.mitigations = 0;
    this.stableFrames = 0;
    this.lateMountRecoveries = 0;
    this.contextElements = [];
    this.layoutElements = new Map();
    this.observedElements = [];
    this.suppressedAria = new WeakMap();
    this.emergencyState = Object.freeze({ active: false, collisionFrames: 0, clearFrames: 0 });
    this.report = Object.freeze({ id: this.id, version: this.version, healthy: true, overlapCount: 0 });
  }

  install() {
    if (this.installed) return this;
    this.installed = true;
    const body = document.body;
    body.dataset.mobileHudVersion = this.version;
    body.dataset.mobileHudAssurance = this.id;
    this.queueHandler = () => this.queueRefresh();
    this.domHandler = () => {
      if (this.syncTargets()) this.lateMountRecoveries += 1;
      this.queueRefresh();
    };
    window.addEventListener('resize', this.queueHandler, { passive: true });
    window.addEventListener('orientationchange', this.queueHandler, { passive: true });
    window.visualViewport?.addEventListener('resize', this.queueHandler, { passive: true });
    window.visualViewport?.addEventListener('scroll', this.queueHandler, { passive: true });

    this.targetObserver = new MutationObserver(this.queueHandler);
    this.domObserver = new MutationObserver(this.domHandler);
    this.domObserver.observe(body, { childList: true, subtree: true });
    this.resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(this.queueHandler) : null;

    this.syncTargets();
    this.refresh();
    window.__DOKKAEBI_MOBILE_HUD_V23__ = this;
    return this;
  }

  syncTargets() {
    const nextContext = CONTEXT_TARGETS.map((entry) => ({ ...entry, element: document.getElementById(entry.id) }));
    const nextObserved = OBSERVED_TARGET_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    const changed = nextObserved.length !== this.observedElements.length
      || nextObserved.some((element, index) => element !== this.observedElements[index]);
    if (!changed && this.contextElements.length) return false;

    this.contextElements = nextContext;
    this.layoutElements = new Map(LAYOUT_TARGETS.map((entry) => [entry.name, document.getElementById(entry.id)]));
    this.observedElements = nextObserved;
    this.observeTargets();
    return changed;
  }

  observeTargets() {
    this.targetObserver?.disconnect();
    this.resizeObserver?.disconnect();
    for (const element of this.observedElements) {
      this.targetObserver?.observe(element, { attributes: true, attributeFilter: ['class', 'style', 'hidden', 'aria-hidden'] });
      this.resizeObserver?.observe(element);
    }
  }

  queueRefresh() {
    if (!this.installed || this.refreshQueued) return;
    this.refreshQueued = true;
    this.refreshFrame = requestAnimationFrame(() => {
      this.refreshFrame = 0;
      this.refreshQueued = false;
      if (this.installed) this.refresh();
    });
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed < 0.45) return this.report;
    this.elapsed = 0;
    return this.refresh();
  }

  restoreSuppressedAria(element) {
    if (!this.suppressedAria.has(element)) return;
    const original = this.suppressedAria.get(element);
    if (original === null) element.removeAttribute('aria-hidden');
    else element.setAttribute('aria-hidden', original);
    this.suppressedAria.delete(element);
  }

  setContextSuppressed(element, suppressed) {
    if (!element) return;
    if (suppressed) {
      if (!this.suppressedAria.has(element)) this.suppressedAria.set(element, element.getAttribute('aria-hidden'));
      element.classList.add('mobile-context-suppressed-v23');
      element.setAttribute('aria-hidden', 'true');
      return;
    }
    element.classList.remove('mobile-context-suppressed-v23');
    this.restoreSuppressedAria(element);
  }

  resolveContext(phone) {
    this.targetObserver?.disconnect();
    for (const { element } of this.contextElements) this.setContextSuppressed(element, false);
    if (!phone) {
      this.observeTargets();
      return 'none';
    }

    const active = this.contextElements
      .filter(({ element }) => visible(element))
      .sort((a, b) => b.priority - a.priority);
    const winner = active[0] || null;
    for (const entry of active) this.setContextSuppressed(entry.element, entry !== winner);
    this.observeTargets();
    return winner?.key || 'none';
  }

  getViewportProfile() {
    const viewport = window.visualViewport;
    return resolveMobileViewportV23({
      visualWidth: viewport?.width || window.innerWidth || 1,
      visualHeight: viewport?.height || window.innerHeight || 1,
      layoutWidth: window.innerWidth || viewport?.width || 1,
      layoutHeight: window.innerHeight || viewport?.height || 1,
      offsetLeft: viewport?.offsetLeft || 0,
      offsetTop: viewport?.offsetTop || 0
    });
  }

  refresh() {
    this.syncTargets();
    const profile = this.getViewportProfile();
    const body = document.body;
    body.classList.toggle('mobile-hud-v23', profile.phone);
    body.classList.toggle('mobile-hud-v23-compact', profile.phone && profile.compact);
    body.classList.toggle('mobile-hud-v23-micro', profile.phone && profile.micro);
    body.classList.toggle('mobile-hud-v23-short', profile.phone && profile.short);
    body.classList.toggle('mobile-hud-v23-landscape', profile.landscape);
    body.classList.toggle('mobile-hud-v23-keyboard', profile.keyboard);
    body.classList.remove('mobile-hud-v22', 'mobile-hud-v22-narrow', 'mobile-hud-v22-landscape', 'mobile-hud-v22-emergency');

    body.style.setProperty('--mobile-hud-scale-v23', String(profile.scale));
    body.style.setProperty('--mobile-control-reserve-v23', `${profile.controlReserve}px`);
    body.style.setProperty('--mobile-visual-left-v23', `${profile.offsetLeft}px`);
    body.style.setProperty('--mobile-visual-right-v23', `${profile.offsetRight}px`);
    body.style.setProperty('--mobile-visual-top-v23', `${profile.offsetTop}px`);
    body.style.setProperty('--mobile-visual-bottom-v23', `${profile.offsetBottom}px`);
    body.style.setProperty('--mobile-visual-center-shift-v23', `${(profile.offsetLeft - profile.offsetRight) / 2}px`);

    const context = this.resolveContext(profile.phone);
    body.dataset.mobileContextV23 = context;

    const targets = [...this.layoutElements.entries()]
      .filter(([, element]) => visible(element) && !element.classList.contains('mobile-context-suppressed-v23'));

    const pairs = [];
    for (let i = 0; i < targets.length; i += 1) {
      for (let j = i + 1; j < targets.length; j += 1) {
        const [aName, a] = targets[i];
        const [bName, b] = targets[j];
        if (pairAllowed(aName, bName)) continue;
        if (overlaps(a.getBoundingClientRect(), b.getBoundingClientRect())) pairs.push(`${aName}:${bName}`);
      }
    }

    if (profile.phone && pairs.length > 0) this.stableFrames = 0;
    else this.stableFrames += 1;
    this.emergencyState = transitionEmergencyV23(this.emergencyState, profile.phone ? pairs.length : 0);
    body.classList.toggle('mobile-hud-v23-emergency', this.emergencyState.active);
    if (profile.phone && pairs.length > 0) this.mitigations += 1;

    this.report = Object.freeze({
      id: this.id,
      version: this.version,
      ...profile,
      context,
      overlapCount: pairs.length,
      overlapPairs: Object.freeze(pairs),
      emergency: this.emergencyState.active,
      emergencyClearFrames: this.emergencyState.clearFrames,
      mitigations: this.mitigations,
      stableFrames: this.stableFrames,
      lateMountRecoveries: this.lateMountRecoveries,
      observedTargetCount: this.observedElements.length,
      expectedTargetCount: OBSERVED_TARGET_IDS.length,
      zoomButtonsPresent: Boolean(document.getElementById('camera-zoom-controls')),
      healthy: pairs.length === 0
        && !this.emergencyState.active
        && !document.getElementById('camera-zoom-controls')
    });
    window.__DOKKAEBI_MOBILE_HUD_V23_REPORT__ = this.report;
    return this.report;
  }

  dispose() {
    if (!this.installed) return;
    this.installed = false;
    if (this.refreshFrame) cancelAnimationFrame(this.refreshFrame);
    this.refreshFrame = 0;
    this.refreshQueued = false;
    if (this.queueHandler) {
      window.removeEventListener('resize', this.queueHandler);
      window.removeEventListener('orientationchange', this.queueHandler);
      window.visualViewport?.removeEventListener('resize', this.queueHandler);
      window.visualViewport?.removeEventListener('scroll', this.queueHandler);
    }
    this.queueHandler = null;
    this.domHandler = null;
    this.targetObserver?.disconnect();
    this.targetObserver = null;
    this.domObserver?.disconnect();
    this.domObserver = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    for (const { element } of this.contextElements) this.setContextSuppressed(element, false);
    this.contextElements = [];
    this.layoutElements.clear();
    this.observedElements = [];
    const body = document.body;
    body.classList.remove(
      'mobile-hud-v23',
      'mobile-hud-v23-compact',
      'mobile-hud-v23-micro',
      'mobile-hud-v23-short',
      'mobile-hud-v23-landscape',
      'mobile-hud-v23-keyboard',
      'mobile-hud-v23-emergency'
    );
    for (const property of [
      '--mobile-hud-scale-v23',
      '--mobile-control-reserve-v23',
      '--mobile-visual-left-v23',
      '--mobile-visual-right-v23',
      '--mobile-visual-top-v23',
      '--mobile-visual-bottom-v23',
      '--mobile-visual-center-shift-v23'
    ]) body.style.removeProperty(property);
    delete body.dataset.mobileHudVersion;
    delete body.dataset.mobileHudAssurance;
    delete body.dataset.mobileContextV23;
    if (window.__DOKKAEBI_MOBILE_HUD_V23__ === this) delete window.__DOKKAEBI_MOBILE_HUD_V23__;
    delete window.__DOKKAEBI_MOBILE_HUD_V23_REPORT__;
  }
}
