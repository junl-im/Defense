export const MOBILE_INPUT_RECOVERY_V143_ID = 'DD-MOBILE-INPUT-RECOVERY-V143';

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function normalizeViewportSnapshotV143(source = {}) {
  return Object.freeze({
    width: Math.max(0, finite(source.width, source.innerWidth)),
    height: Math.max(0, finite(source.height, source.innerHeight)),
    offsetLeft: finite(source.offsetLeft),
    offsetTop: finite(source.offsetTop),
    scale: Math.max(.1, finite(source.scale, 1))
  });
}

export function compareViewportSnapshotsV143(previous, next, thresholds = {}) {
  if (!previous || !next) return Object.freeze({ reset: true, reason: 'viewport-initialized', deltas: Object.freeze({}) });
  const limits = {
    width: Math.max(8, finite(thresholds.width, 32)),
    height: Math.max(16, finite(thresholds.height, 72)),
    offset: Math.max(4, finite(thresholds.offset, 16)),
    scale: Math.max(.01, finite(thresholds.scale, .045))
  };
  const deltas = Object.freeze({
    width: Math.abs(next.width - previous.width),
    height: Math.abs(next.height - previous.height),
    offsetLeft: Math.abs(next.offsetLeft - previous.offsetLeft),
    offsetTop: Math.abs(next.offsetTop - previous.offsetTop),
    scale: Math.abs(next.scale - previous.scale)
  });
  const reason = deltas.scale >= limits.scale ? 'viewport-scale'
    : deltas.offsetLeft >= limits.offset || deltas.offsetTop >= limits.offset ? 'viewport-offset'
      : deltas.width >= limits.width ? 'viewport-width'
        : deltas.height >= limits.height ? 'viewport-height'
          : '';
  return Object.freeze({ reset: Boolean(reason), reason, deltas, limits: Object.freeze(limits) });
}

function viewportFromWindow(windowObject, visualViewport) {
  return normalizeViewportSnapshotV143(visualViewport || {
    width: windowObject?.innerWidth,
    height: windowObject?.innerHeight,
    offsetLeft: 0,
    offsetTop: 0,
    scale: 1
  });
}

export default class MobileInputRecoveryV143 {
  constructor({ onReset = null, thresholds = null, now = () => Date.now() } = {}) {
    this.onReset = typeof onReset === 'function' ? onReset : () => {};
    this.thresholds = thresholds || {};
    this.now = now;
    this.listeners = [];
    this.windowObject = null;
    this.documentObject = null;
    this.visualViewport = null;
    this.viewport = null;
    this.lastResetAt = -Infinity;
    this.disposed = false;
    this.diagnostics = {
      id: MOBILE_INPUT_RECOVERY_V143_ID,
      resets: 0,
      viewportResets: 0,
      visibilityResets: 0,
      orientationResets: 0,
      pageResets: 0,
      lastReason: '',
      lastDetail: null
    };
  }

  listen(target, type, handler, options) {
    if (!target?.addEventListener) return;
    target.addEventListener(type, handler, options);
    this.listeners.push(() => target.removeEventListener(type, handler, options));
  }

  mount({ windowObject = globalThis.window, documentObject = globalThis.document, visualViewport = windowObject?.visualViewport } = {}) {
    if (this.disposed) return this;
    this.windowObject = windowObject;
    this.documentObject = documentObject;
    this.visualViewport = visualViewport;
    this.viewport = viewportFromWindow(windowObject, visualViewport);

    this.listen(documentObject, 'visibilitychange', () => {
      this.forceReset(documentObject?.hidden ? 'visibility-hidden' : 'visibility-resume', { hidden: Boolean(documentObject?.hidden) });
    }, { passive: true });
    this.listen(windowObject, 'pagehide', (event) => this.forceReset('page-hide', { persisted: Boolean(event?.persisted) }), { passive: true });
    this.listen(windowObject, 'pageshow', (event) => this.forceReset('page-show', { persisted: Boolean(event?.persisted) }), { passive: true });
    this.listen(windowObject, 'orientationchange', () => {
      this.forceReset('orientation-change', {});
      this.viewport = viewportFromWindow(this.windowObject, this.visualViewport);
    }, { passive: true });
    const viewportHandler = () => this.handleViewportSnapshot(viewportFromWindow(this.windowObject, this.visualViewport));
    this.listen(visualViewport, 'resize', viewportHandler, { passive: true });
    this.listen(visualViewport, 'scroll', viewportHandler, { passive: true });
    this.listen(windowObject, 'resize', viewportHandler, { passive: true });
    return this;
  }

  handleViewportSnapshot(snapshot) {
    const next = normalizeViewportSnapshotV143(snapshot);
    const comparison = compareViewportSnapshotsV143(this.viewport, next, this.thresholds);
    this.viewport = next;
    if (comparison.reset) this.forceReset(comparison.reason, { viewport: next, deltas: comparison.deltas });
    return comparison;
  }

  forceReset(reason = 'manual', detail = {}) {
    if (this.disposed) return false;
    const timestamp = this.now();
    const dedupe = reason === this.diagnostics.lastReason && timestamp - this.lastResetAt < 24;
    if (dedupe) return false;
    this.lastResetAt = timestamp;
    this.diagnostics.resets += 1;
    this.diagnostics.lastReason = String(reason || 'manual');
    this.diagnostics.lastDetail = detail || {};
    if (String(reason).startsWith('viewport-')) this.diagnostics.viewportResets += 1;
    else if (String(reason).startsWith('visibility-')) this.diagnostics.visibilityResets += 1;
    else if (String(reason).startsWith('orientation-')) this.diagnostics.orientationResets += 1;
    else if (String(reason).startsWith('page-')) this.diagnostics.pageResets += 1;
    this.onReset(this.diagnostics.lastReason, detail || {});
    return true;
  }

  get report() {
    return Object.freeze({
      ...this.diagnostics,
      viewport: this.viewport,
      mounted: this.listeners.length > 0,
      disposed: this.disposed
    });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const remove of this.listeners.splice(0)) remove();
  }
}
