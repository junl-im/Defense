export const BROWSER_RELIABILITY_VERSION = '19.0.0';
export const BROWSER_RELIABILITY_STORAGE_KEY = 'dokkaebi-browser-reliability-v19';

const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
};

const text = (value, fallback = '') => value == null ? fallback : String(value);

function safeNow() {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

function memorySnapshot() {
  const memory = typeof performance !== 'undefined' ? performance.memory : null;
  return Object.freeze({
    supported: Boolean(memory),
    usedJSHeapMB: memory ? round(memory.usedJSHeapSize / 1048576) : 0,
    totalJSHeapMB: memory ? round(memory.totalJSHeapSize / 1048576) : 0,
    heapLimitMB: memory ? round(memory.jsHeapSizeLimit / 1048576) : 0
  });
}

export default class BrowserReliabilityLab {
  constructor({
    version = BROWSER_RELIABILITY_VERSION,
    storage = globalThis.localStorage,
    maxEvents = 240,
    sampleSeconds = 8
  } = {}) {
    this.version = version;
    this.storage = storage;
    this.maxEvents = maxEvents;
    this.sampleSeconds = sampleSeconds;
    this.startedAt = safeNow();
    this.elapsed = 0;
    this.sampleElapsed = 0;
    this.events = [];
    this.listeners = [];
    this.longTasks = 0;
    this.longTaskMs = 0;
    this.resourceFailures = 0;
    this.unhandledErrors = 0;
    this.contextLosses = 0;
    this.contextRestores = 0;
    this.visibilityChanges = 0;
    this.pageRestores = 0;
    this.offlineTransitions = 0;
    this.cachePurges = 0;
    this.samples = [];
    this.lastRuntimeSnapshot = null;
    this.serviceWorker = Object.freeze({ supported: false, controlled: false, version: '', cacheNames: [], stale: false });
    this.mounted = false;
    this.record('lab-created', { version: this.version });
  }

  listen(target, type, handler, options) {
    if (!target?.addEventListener) return;
    target.addEventListener(type, handler, options);
    this.listeners.push(() => target.removeEventListener(type, handler, options));
  }

  mount({ canvas = null, getRuntimeSnapshot = null } = {}) {
    if (this.mounted || typeof window === 'undefined') return this;
    this.mounted = true;
    this.getRuntimeSnapshot = typeof getRuntimeSnapshot === 'function' ? getRuntimeSnapshot : null;

    this.listen(window, 'error', (event) => {
      const source = event?.target && event.target !== window ? 'resource' : 'script';
      if (source === 'resource') this.resourceFailures += 1;
      else this.unhandledErrors += 1;
      this.record(`${source}-error`, {
        message: text(event?.message || event?.target?.src || event?.target?.href, 'unknown'),
        filename: text(event?.filename),
        line: Number(event?.lineno || 0)
      });
    }, true);

    this.listen(window, 'unhandledrejection', (event) => {
      this.unhandledErrors += 1;
      this.record('unhandled-rejection', { reason: text(event?.reason?.message || event?.reason, 'unknown') });
    });

    this.listen(document, 'visibilitychange', () => {
      this.visibilityChanges += 1;
      this.record('visibility-change', { hidden: Boolean(document.hidden), state: document.visibilityState });
    });
    this.listen(window, 'pageshow', (event) => {
      if (event.persisted) this.pageRestores += 1;
      this.record('page-show', { persisted: Boolean(event.persisted) });
    });
    this.listen(window, 'pagehide', (event) => this.record('page-hide', { persisted: Boolean(event.persisted) }));
    this.listen(window, 'online', () => this.record('network-online'));
    this.listen(window, 'offline', () => {
      this.offlineTransitions += 1;
      this.record('network-offline');
    });
    this.listen(window, 'dokkaebi:boot-ready', () => this.markBootReady());

    if (canvas) {
      this.listen(canvas, 'webglcontextlost', (event) => {
        this.contextLosses += 1;
        event.preventDefault?.();
        this.record('webgl-context-lost');
        window.dispatchEvent(new CustomEvent('dokkaebi:webgl-recovery', { detail: { lost: true } }));
      });
      this.listen(canvas, 'webglcontextrestored', () => {
        this.contextRestores += 1;
        this.record('webgl-context-restored');
        window.dispatchEvent(new CustomEvent('dokkaebi:webgl-recovery', { detail: { lost: false } }));
      });
    }

    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this.longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.longTasks += 1;
            this.longTaskMs += Number(entry.duration || 0);
            if (entry.duration >= 120) this.record('long-task', { durationMs: round(entry.duration), name: entry.name || 'task' });
          }
        });
        this.longTaskObserver.observe({ type: 'longtask', buffered: true });
      } catch {
        this.longTaskObserver = null;
      }
    }

    this.auditServiceWorker();
    this.sample('mount');
    this.record('lab-mounted');
    return this;
  }

  markBootReady() {
    const durationMs = Math.max(0, safeNow() - this.startedAt);
    this.bootReadyMs = round(durationMs);
    this.record('boot-ready', { durationMs: this.bootReadyMs });
    this.persist();
  }

  noteMilestone(name, detail = {}) {
    this.record(`milestone:${text(name, 'unknown')}`, detail);
  }

  noteCachePurge(detail = {}) {
    this.cachePurges += 1;
    this.record('cache-purge', detail);
  }

  update(dt, runtimeSnapshot = null) {
    const safeDt = Math.max(0, Number(dt) || 0);
    this.elapsed += safeDt;
    this.sampleElapsed += safeDt;
    if (runtimeSnapshot) this.lastRuntimeSnapshot = runtimeSnapshot;
    if (this.sampleElapsed >= this.sampleSeconds) {
      this.sampleElapsed = 0;
      this.sample('interval', runtimeSnapshot || this.getRuntimeSnapshot?.());
    }
  }

  sample(reason = 'manual', runtimeSnapshot = null) {
    const snapshot = runtimeSnapshot || this.getRuntimeSnapshot?.() || this.lastRuntimeSnapshot || {};
    const renderer = snapshot.renderer || {};
    const counts = snapshot.counts || {};
    const sample = Object.freeze({
      elapsed: round(this.elapsed),
      reason,
      memory: memorySnapshot(),
      domNodes: typeof document !== 'undefined' ? document.getElementsByTagName('*').length : 0,
      fps: round(snapshot.fps || 0),
      drawCalls: Number(renderer.drawCalls || 0),
      triangles: Number(renderer.triangles || 0),
      textures: Number(renderer.textures || 0),
      enemies: Number(counts.enemies || 0),
      units: Number(counts.units || 0),
      projectiles: Number(counts.projectiles || 0),
      particles: Number(counts.particles || 0)
    });
    this.samples.push(sample);
    if (this.samples.length > 36) this.samples.shift();
    this.lastRuntimeSnapshot = snapshot;
    return sample;
  }

  async auditServiceWorker() {
    if (typeof navigator === 'undefined') return this.serviceWorker;
    const supported = 'serviceWorker' in navigator;
    let cacheNames = [];
    try {
      if (typeof caches !== 'undefined') cacheNames = await caches.keys();
    } catch {
      cacheNames = [];
    }
    let registrationCount = 0;
    try {
      registrationCount = supported ? (await navigator.serviceWorker.getRegistrations()).length : 0;
    } catch {
      registrationCount = 0;
    }
    const boot = globalThis.__DOKKAEBI_BOOT_DIAGNOSTICS__ || {};
    const swVersion = text(boot.serviceWorkerVersion || '');
    this.serviceWorker = Object.freeze({
      supported,
      controlled: Boolean(navigator.serviceWorker?.controller),
      registrationCount,
      version: swVersion,
      cacheNames: Object.freeze(cacheNames),
      stale: Boolean(swVersion && swVersion !== this.version),
      updateFound: Boolean(boot.updateFound),
      purgeCount: Number(boot.purgeCount || 0)
    });
    this.record('service-worker-audit', this.serviceWorker);
    return this.serviceWorker;
  }

  record(type, detail = {}) {
    const event = Object.freeze({
      elapsed: round((safeNow() - this.startedAt) / 1000),
      type: text(type, 'event'),
      detail: Object.freeze({ ...detail })
    });
    this.events.push(event);
    if (this.events.length > this.maxEvents) this.events.shift();
    return event;
  }

  persist() {
    try {
      this.storage?.setItem(BROWSER_RELIABILITY_STORAGE_KEY, JSON.stringify(this.report));
    } catch {
      // Diagnostics must never block gameplay.
    }
  }

  get diagnostics() {
    const memory = this.samples.at(-1)?.memory || memorySnapshot();
    const firstMemory = this.samples.find((sample) => sample.memory.supported)?.memory;
    const heapGrowthMB = memory.supported && firstMemory?.supported
      ? round(memory.usedJSHeapMB - firstMemory.usedJSHeapMB)
      : 0;
    return Object.freeze({
      version: this.version,
      bootReadyMs: Number(this.bootReadyMs || 0),
      events: this.events.length,
      longTasks: this.longTasks,
      longTaskMs: round(this.longTaskMs),
      resourceFailures: this.resourceFailures,
      unhandledErrors: this.unhandledErrors,
      contextLosses: this.contextLosses,
      contextRestores: this.contextRestores,
      visibilityChanges: this.visibilityChanges,
      pageRestores: this.pageRestores,
      offlineTransitions: this.offlineTransitions,
      cachePurges: this.cachePurges,
      memory,
      heapGrowthMB,
      samples: this.samples.length,
      serviceWorker: this.serviceWorker,
      healthy: this.unhandledErrors === 0 && this.contextLosses === 0 && !this.serviceWorker.stale
    });
  }

  get report() {
    return Object.freeze({
      version: this.version,
      generatedAt: new Date().toISOString(),
      diagnostics: this.diagnostics,
      samples: Object.freeze([...this.samples]),
      events: Object.freeze([...this.events])
    });
  }

  dispose() {
    for (const remove of this.listeners.splice(0)) remove();
    this.longTaskObserver?.disconnect?.();
    this.persist();
    this.mounted = false;
  }
}
