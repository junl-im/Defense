export const GPU_FRAME_TIMER_V152 = Object.freeze({
  id: 'DD-GPU-FRAME-TIMER-V152',
  version: '1.0.52',
  buildId: 'b24.52',
  extension: 'EXT_disjoint_timer_query_webgl2',
  defaultScope: 'whole-frame-gpu'
});

const boundedText = (value, maximum = 160) => String(value || '').slice(0, maximum);

export class GpuFrameTimerV152 {
  constructor(renderer, { maxPending = 4, scope = GPU_FRAME_TIMER_V152.defaultScope, bindContextEvents = true } = {}) {
    this.renderer = renderer || null;
    this.canvas = renderer?.domElement || null;
    this.scope = String(scope || GPU_FRAME_TIMER_V152.defaultScope);
    this.maxPending = Math.max(1, Math.min(8, Number(maxPending) || 4));
    this.gl = null;
    this.extension = null;
    this.supported = false;
    this.suspended = false;
    this.disposed = false;
    this.activeQuery = null;
    this.pending = [];
    this.samples = 0;
    this.disjointDrops = 0;
    this.overflowDrops = 0;
    this.queryErrors = 0;
    this.contextLosses = 0;
    this.contextRestores = 0;
    this.rebinds = 0;
    this.lastGpuMs = null;
    this.lastError = '';
    this.status = 'initializing';
    this.onContextLost = () => this.handleContextLost();
    this.onContextRestored = () => this.handleContextRestored();
    if (bindContextEvents && this.canvas?.addEventListener) {
      this.canvas.addEventListener('webglcontextlost', this.onContextLost);
      this.canvas.addEventListener('webglcontextrestored', this.onContextRestored);
    }
    this.rebindContext('initial');
  }

  clearQueries({ deleteQueries = true } = {}) {
    const gl = this.gl;
    if (deleteQueries && gl) {
      if (this.activeQuery) {
        try { gl.deleteQuery?.(this.activeQuery); } catch { /* context may already be invalid */ }
      }
      for (const query of this.pending) {
        try { gl.deleteQuery?.(query); } catch { /* context may already be invalid */ }
      }
    }
    this.activeQuery = null;
    this.pending.length = 0;
  }

  rebindContext(reason = 'manual') {
    if (this.disposed) return false;
    this.clearQueries({ deleteQueries: Boolean(this.gl) && !this.suspended });
    try {
      this.gl = this.renderer?.getContext?.() || null;
      this.extension = this.gl?.getExtension?.(GPU_FRAME_TIMER_V152.extension) || null;
      this.supported = Boolean(this.gl && this.extension && typeof this.gl.createQuery === 'function');
      this.suspended = false;
      this.rebinds += 1;
      this.status = this.supported ? `ready:${reason}` : `unsupported:${reason}`;
      this.lastError = '';
      return this.supported;
    } catch (error) {
      this.gl = null;
      this.extension = null;
      this.supported = false;
      this.queryErrors += 1;
      this.lastError = boundedText(error?.message || error);
      this.status = `rebind-error:${reason}`;
      return false;
    }
  }

  handleContextLost() {
    if (this.disposed) return;
    this.contextLosses += 1;
    this.suspended = true;
    this.supported = false;
    this.clearQueries({ deleteQueries: false });
    this.gl = null;
    this.extension = null;
    this.status = 'context-lost';
  }

  handleContextRestored() {
    if (this.disposed) return false;
    this.contextRestores += 1;
    return this.rebindContext('context-restored');
  }

  failQuery(error, phase) {
    this.queryErrors += 1;
    this.lastError = boundedText(error?.message || error || phase);
    this.status = `query-error:${phase}`;
    this.supported = false;
    this.clearQueries({ deleteQueries: false });
  }

  beginFrame() {
    if (this.disposed || this.suspended || !this.supported || this.activeQuery) return false;
    let query = null;
    try {
      query = this.gl.createQuery();
      if (!query) return false;
      this.gl.beginQuery(this.extension.TIME_ELAPSED_EXT, query);
      this.activeQuery = query;
      return true;
    } catch (error) {
      try { if (query) this.gl?.deleteQuery?.(query); } catch { /* ignore */ }
      this.activeQuery = null;
      this.failQuery(error, 'begin');
      return false;
    }
  }

  endFrame() {
    if (this.disposed || this.suspended || !this.supported || !this.activeQuery) return false;
    const query = this.activeQuery;
    try {
      this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
      this.pending.push(query);
      this.activeQuery = null;
      while (this.pending.length > this.maxPending) {
        const dropped = this.pending.shift();
        try { this.gl.deleteQuery?.(dropped); } catch { /* ignore */ }
        this.overflowDrops += 1;
      }
      return true;
    } catch (error) {
      try { this.gl?.deleteQuery?.(query); } catch { /* ignore */ }
      this.activeQuery = null;
      this.failQuery(error, 'end');
      return false;
    }
  }

  poll() {
    if (this.disposed || this.suspended || !this.supported || !this.pending.length) return null;
    const query = this.pending[0];
    try {
      const available = Boolean(this.gl.getQueryParameter(query, this.gl.QUERY_RESULT_AVAILABLE));
      if (!available) return null;
      this.pending.shift();
      const disjoint = Boolean(this.gl.getParameter(this.extension.GPU_DISJOINT_EXT));
      if (disjoint) {
        try { this.gl.deleteQuery?.(query); } catch { /* ignore */ }
        this.disjointDrops += 1;
        while (this.pending.length) {
          const stale = this.pending.shift();
          try { this.gl.deleteQuery?.(stale); } catch { /* ignore */ }
          this.disjointDrops += 1;
        }
        this.status = 'disjoint-drop';
        return null;
      }
      const nanoseconds = Number(this.gl.getQueryParameter(query, this.gl.QUERY_RESULT));
      this.gl.deleteQuery?.(query);
      if (!Number.isFinite(nanoseconds) || nanoseconds < 0) {
        this.disjointDrops += 1;
        this.status = 'invalid-result-drop';
        return null;
      }
      this.lastGpuMs = nanoseconds / 1e6;
      this.samples += 1;
      this.status = 'ready:sampled';
      return Object.freeze({ gpuMs: this.lastGpuMs, source: this.scope, scope: this.scope });
    } catch (error) {
      try { this.gl?.deleteQuery?.(query); } catch { /* ignore */ }
      if (this.pending[0] === query) this.pending.shift();
      this.failQuery(error, 'poll');
      return null;
    }
  }

  dispose() {
    if (this.disposed) return;
    this.canvas?.removeEventListener?.('webglcontextlost', this.onContextLost);
    this.canvas?.removeEventListener?.('webglcontextrestored', this.onContextRestored);
    this.clearQueries({ deleteQueries: Boolean(this.gl) && !this.suspended });
    this.disposed = true;
    this.supported = false;
    this.status = 'disposed';
  }

  get diagnostics() {
    return Object.freeze({
      id: GPU_FRAME_TIMER_V152.id,
      scope: this.scope,
      supported: this.supported,
      suspended: this.suspended,
      disposed: this.disposed,
      status: this.status,
      samples: this.samples,
      pending: this.pending.length,
      disjointDrops: this.disjointDrops,
      overflowDrops: this.overflowDrops,
      queryErrors: this.queryErrors,
      contextLosses: this.contextLosses,
      contextRestores: this.contextRestores,
      rebinds: this.rebinds,
      lastGpuMs: this.lastGpuMs,
      lastError: this.lastError
    });
  }
}
