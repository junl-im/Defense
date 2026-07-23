export const MOBILE_HUD_V23_VERSION = '23.0.0';

const CONTEXT_TARGETS = [
  { id: 'wave-recovery', key: 'recovery', priority: 4 },
  { id: 'auto-wave-panel', key: 'wave', priority: 3 },
  { id: 'interact-btn', key: 'interact', priority: 2 },
  { id: 'danger-hint', key: 'danger', priority: 1 }
];

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

export default class MobileHudDirectorV23 {
  constructor() {
    this.version = MOBILE_HUD_V23_VERSION;
    this.elapsed = 0;
    this.refreshQueued = false;
    this.mitigations = 0;
    this.stableFrames = 0;
    this.report = Object.freeze({ version: this.version, healthy: true, overlapCount: 0 });
  }

  install() {
    document.body.dataset.mobileHudVersion = this.version;
    const queue = () => this.queueRefresh();
    window.addEventListener('resize', queue, { passive: true });
    window.addEventListener('orientationchange', queue, { passive: true });
    window.visualViewport?.addEventListener('resize', queue, { passive: true });

    this.contextElements = CONTEXT_TARGETS.map((entry) => ({ ...entry, element: document.getElementById(entry.id) }));
    this.observer = new MutationObserver(queue);
    for (const { element } of this.contextElements) {
      if (element) this.observer.observe(element, { attributes: true, attributeFilter: ['class', 'style', 'aria-hidden'] });
    }

    this.resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(queue) : null;
    ['hud', 'boss-health', 'joystick-zone', 'action-dock', 'auto-wave-panel', 'interact-btn', 'danger-hint', 'wave-recovery']
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .forEach((element) => this.resizeObserver?.observe(element));

    this.refresh();
    window.__DOKKAEBI_MOBILE_HUD_V23__ = this;
    return this;
  }

  queueRefresh() {
    if (this.refreshQueued) return;
    this.refreshQueued = true;
    requestAnimationFrame(() => {
      this.refreshQueued = false;
      this.refresh();
    });
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed < 0.45) return this.report;
    this.elapsed = 0;
    return this.refresh();
  }

  resolveContext(phone) {
    for (const { element } of this.contextElements) element?.classList.remove('mobile-context-suppressed-v23');
    if (!phone) return 'none';

    const active = this.contextElements
      .filter(({ element }) => visible(element))
      .sort((a, b) => b.priority - a.priority);
    const winner = active[0] || null;
    for (const entry of active.slice(1)) entry.element?.classList.add('mobile-context-suppressed-v23');
    return winner?.key || 'none';
  }

  refresh() {
    const width = Math.max(1, window.visualViewport?.width || window.innerWidth || 1);
    const height = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
    const phone = width <= 820;
    const compact = width <= 430;
    const micro = width <= 360;
    const short = height <= 620;
    const landscape = phone && width > height;

    const body = document.body;
    body.classList.toggle('mobile-hud-v23', phone);
    body.classList.toggle('mobile-hud-v23-compact', phone && compact);
    body.classList.toggle('mobile-hud-v23-micro', phone && micro);
    body.classList.toggle('mobile-hud-v23-short', phone && short);
    body.classList.toggle('mobile-hud-v23-landscape', landscape);
    body.classList.remove('mobile-hud-v22', 'mobile-hud-v22-narrow', 'mobile-hud-v22-landscape', 'mobile-hud-v22-emergency');

    const scale = micro ? 0.82 : compact ? 0.9 : landscape ? 0.88 : 1;
    body.style.setProperty('--mobile-hud-scale-v23', String(scale));
    body.style.setProperty('--mobile-control-reserve-v23', landscape ? '82px' : micro ? '94px' : compact ? '102px' : '112px');

    const context = this.resolveContext(phone);
    body.dataset.mobileContextV23 = context;

    const targetDefs = [
      ['hud', 'hud'],
      ['wave', 'wave-hud'],
      ['boss', 'boss-health'],
      ['joystick', 'joystick-zone'],
      ['actions', 'action-dock'],
      ['context-recovery', 'wave-recovery'],
      ['context-wave', 'auto-wave-panel'],
      ['context-interact', 'interact-btn'],
      ['context-danger', 'danger-hint']
    ];
    const targets = targetDefs
      .map(([name, id]) => [name, document.getElementById(id)])
      .filter(([, element]) => visible(element) && !element.classList.contains('mobile-context-suppressed-v23'));

    const pairs = [];
    for (let i = 0; i < targets.length; i += 1) {
      for (let j = i + 1; j < targets.length; j += 1) {
        const [aName, a] = targets[i];
        const [bName, b] = targets[j];
        const allowed = new Set(['hud:wave', 'wave:boss']);
        const pairKey = `${aName}:${bName}`;
        if (allowed.has(pairKey)) continue;
        if (overlaps(a.getBoundingClientRect(), b.getBoundingClientRect())) pairs.push(pairKey);
      }
    }

    if (phone && pairs.length > 0) this.stableFrames = 0;
    else this.stableFrames += 1;
    const emergency = phone && pairs.length > 0;
    body.classList.toggle('mobile-hud-v23-emergency', emergency);
    if (emergency) this.mitigations += 1;

    this.report = Object.freeze({
      version: this.version,
      width,
      height,
      phone,
      compact,
      micro,
      short,
      landscape,
      context,
      overlapCount: pairs.length,
      overlapPairs: Object.freeze(pairs),
      mitigations: this.mitigations,
      stableFrames: this.stableFrames,
      zoomButtonsPresent: Boolean(document.getElementById('camera-zoom-controls')),
      healthy: pairs.length === 0 && !document.getElementById('camera-zoom-controls')
    });
    window.__DOKKAEBI_MOBILE_HUD_V23_REPORT__ = this.report;
    return this.report;
  }
}
