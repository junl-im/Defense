export const CROSS_PLATFORM_SHELL_V112_VERSION = '1.0.12';

const SHELL_CLASSES = Object.freeze([
  'dd-shell-pc-v112',
  'dd-shell-tablet-v112',
  'dd-shell-mobile-v112',
  'dd-shell-portrait-v112',
  'dd-shell-landscape-v112',
  'dd-shell-compact-height-v112',
  'dd-shell-overlap-safe-v112'
]);

const TARGETS = Object.freeze([
  ['hud', 'hud'],
  ['boss', 'boss-health'],
  ['context', 'top-context-rail'],
  ['status', 'top-status-rail'],
  ['meters', 'center-meter-rail'],
  ['left', 'left-insight-rail'],
  ['right', 'right-roster-rail'],
  ['joystick', 'joystick-zone'],
  ['actions', 'action-dock'],
  ['interact', 'interact-btn']
]);

const ALLOWED_OVERLAPS = new Set([
  'hud:context', 'context:hud',
  'hud:status', 'status:hud',
  'hud:meters', 'meters:hud',
  'left:context', 'context:left',
  'right:status', 'status:right'
]);

const isVisible = (element) => {
  if (!element?.isConnected || element.classList.contains('hidden')) return false;
  const style = getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) <= .01) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 2 && rect.height > 2;
};

const intersects = (a, b, gap = 5) => !(
  a.right + gap <= b.left ||
  b.right + gap <= a.left ||
  a.bottom + gap <= b.top ||
  b.bottom + gap <= a.top
);

function classify(width, height, coarse) {
  const portrait = height > width;
  const mobile = width <= 820 || (coarse && width <= 980);
  const tablet = !mobile && width < 1180;
  const shell = mobile ? 'mobile' : tablet ? 'tablet' : 'pc';
  return Object.freeze({
    shell,
    mobile,
    tablet,
    pc: shell === 'pc',
    portrait,
    landscape: !portrait,
    compactHeight: height <= 680,
    compactWidth: width <= 430
  });
}

export default class CrossPlatformShellV112 {
  constructor({ body = document.body } = {}) {
    this.body = body;
    this.installed = false;
    this.elapsed = 0;
    this.refreshFrame = 0;
    this.refreshQueued = false;
    this.stableFrames = 0;
    this.mitigations = 0;
    this.lastSignature = '';
    this.report = Object.freeze({
      version: CROSS_PLATFORM_SHELL_V112_VERSION,
      shell: 'unknown',
      healthy: true,
      overlapCount: 0
    });
  }

  install() {
    if (this.installed) return this;
    this.installed = true;
    this.queueHandler = () => this.queueRefresh();
    this.externalBodyClassSignature = this.getExternalBodyClassSignature();
    this.mutationHandler = (mutations = []) => {
      let shouldRefresh = false;
      for (const mutation of mutations) {
        if (mutation.target !== this.body) {
          shouldRefresh = true;
          break;
        }
        const signature = this.getExternalBodyClassSignature();
        if (signature !== this.externalBodyClassSignature) {
          this.externalBodyClassSignature = signature;
          shouldRefresh = true;
        }
      }
      if (shouldRefresh) this.queueRefresh();
    };
    window.addEventListener('resize', this.queueHandler, { passive: true });
    window.addEventListener('orientationchange', this.queueHandler, { passive: true });
    window.visualViewport?.addEventListener('resize', this.queueHandler, { passive: true });

    this.observer = new MutationObserver(this.mutationHandler);
    this.observer.observe(this.body, { attributes: true, attributeFilter: ['class'] });
    this.elements = new Map(TARGETS.map(([name, id]) => [name, document.getElementById(id)]));
    for (const element of this.elements.values()) {
      if (element) this.observer.observe(element, { attributes: true, attributeFilter: ['class', 'style', 'aria-hidden'] });
    }
    this.resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(this.queueHandler) : null;
    for (const element of this.elements.values()) if (element) this.resizeObserver?.observe(element);

    this.refresh();
    window.__DOKKAEBI_CROSS_PLATFORM_SHELL_V112__ = this;
    return this;
  }

  getExternalBodyClassSignature() {
    if (!this.body?.classList) return '';
    return [...this.body.classList]
      .filter((className) => !SHELL_CLASSES.includes(className))
      .sort()
      .join(' ');
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

  update(dt = 0) {
    this.elapsed += Math.max(0, Number(dt) || 0);
    if (this.elapsed < .5) return this.report;
    this.elapsed = 0;
    return this.refresh();
  }

  audit(shell) {
    const active = [...this.elements.entries()].filter(([, element]) => isVisible(element));
    const pairs = [];
    for (let i = 0; i < active.length; i += 1) {
      for (let j = i + 1; j < active.length; j += 1) {
        const [aName, a] = active[i];
        const [bName, b] = active[j];
        const key = `${aName}:${bName}`;
        if (ALLOWED_OVERLAPS.has(key)) continue;
        if (shell === 'pc' && ((aName === 'joystick') || (bName === 'joystick'))) continue;
        if (intersects(a.getBoundingClientRect(), b.getBoundingClientRect())) pairs.push(key);
      }
    }
    return pairs;
  }

  refresh() {
    const width = Math.max(1, Math.round(window.visualViewport?.width || window.innerWidth || 1));
    const height = Math.max(1, Math.round(window.visualViewport?.height || window.innerHeight || 1));
    const coarse = Boolean(window.matchMedia?.('(pointer: coarse)')?.matches);
    const profile = classify(width, height, coarse);

    for (const className of SHELL_CLASSES) this.body.classList.remove(className);
    this.body.classList.add(`dd-shell-${profile.shell}-v112`);
    this.body.classList.add(profile.portrait ? 'dd-shell-portrait-v112' : 'dd-shell-landscape-v112');
    this.body.classList.toggle('dd-shell-compact-height-v112', profile.compactHeight);
    this.body.dataset.crossPlatformShellV112 = profile.shell;
    this.body.dataset.crossPlatformOrientationV112 = profile.portrait ? 'portrait' : 'landscape';
    this.body.style.setProperty('--dd-v112-vw', `${width}px`);
    this.body.style.setProperty('--dd-v112-vh', `${height}px`);
    this.body.style.setProperty('--dd-v112-hud-scale', profile.mobile ? (profile.compactWidth ? '.86' : '.94') : profile.tablet ? '.92' : '1');
    this.body.style.setProperty('--dd-v112-control-reserve', profile.mobile ? (profile.portrait ? '122px' : '92px') : '76px');

    const overlaps = this.audit(profile.shell);
    const emergency = overlaps.length > 0;
    this.body.classList.toggle('dd-shell-overlap-safe-v112', emergency);
    this.stableFrames = emergency ? 0 : this.stableFrames + 1;
    if (emergency) this.mitigations += 1;

    const signature = `${profile.shell}:${profile.portrait ? 'p' : 'l'}:${width}x${height}:${overlaps.join('|')}`;
    const changed = signature !== this.lastSignature;
    this.lastSignature = signature;
    this.report = Object.freeze({
      version: CROSS_PLATFORM_SHELL_V112_VERSION,
      width,
      height,
      devicePixelRatio: Number((window.devicePixelRatio || 1).toFixed(2)),
      coarsePointer: coarse,
      ...profile,
      shellSeparated: true,
      sharedScaleOnly: false,
      overlapCount: overlaps.length,
      overlapPairs: Object.freeze(overlaps),
      mitigations: this.mitigations,
      stableFrames: this.stableFrames,
      changed,
      healthy: overlaps.length === 0
    });
    window.__DOKKAEBI_CROSS_PLATFORM_SHELL_V112_REPORT__ = this.report;
    return this.report;
  }

  dispose() {
    if (!this.installed) return;
    this.installed = false;
    if (this.refreshFrame) cancelAnimationFrame(this.refreshFrame);
    this.refreshFrame = 0;
    this.refreshQueued = false;
    window.removeEventListener('resize', this.queueHandler);
    window.removeEventListener('orientationchange', this.queueHandler);
    window.visualViewport?.removeEventListener('resize', this.queueHandler);
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
    this.observer = null;
    this.resizeObserver = null;
    this.mutationHandler = null;
    this.externalBodyClassSignature = '';
    for (const className of SHELL_CLASSES) this.body.classList.remove(className);
    delete this.body.dataset.crossPlatformShellV112;
    delete this.body.dataset.crossPlatformOrientationV112;
    for (const property of ['--dd-v112-vw', '--dd-v112-vh', '--dd-v112-hud-scale', '--dd-v112-control-reserve']) this.body.style.removeProperty(property);
    if (window.__DOKKAEBI_CROSS_PLATFORM_SHELL_V112__ === this) delete window.__DOKKAEBI_CROSS_PLATFORM_SHELL_V112__;
    delete window.__DOKKAEBI_CROSS_PLATFORM_SHELL_V112_REPORT__;
  }
}
