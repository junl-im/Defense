export const GPU_FRAME_TIMER_V152 = Object.freeze({
  id: 'DD-GPU-FRAME-TIMER-V152',
  version: '1.0.52',
  buildId: 'b24.52',
  extension: 'EXT_disjoint_timer_query_webgl2'
});

export class GpuFrameTimerV152 {
  constructor(renderer, { maxPending = 4 } = {}) {
    this.renderer = renderer || null;
    this.gl = renderer?.getContext?.() || null;
    this.extension = this.gl?.getExtension?.(GPU_FRAME_TIMER_V152.extension) || null;
    this.supported = Boolean(this.gl && this.extension && typeof this.gl.createQuery === 'function');
    this.maxPending = Math.max(1, Math.min(8, Number(maxPending) || 4));
    this.activeQuery = null;
    this.pending = [];
    this.samples = 0;
    this.disjointDrops = 0;
    this.overflowDrops = 0;
    this.lastGpuMs = null;
  }

  beginFrame() {
    if (!this.supported || this.activeQuery) return false;
    const query = this.gl.createQuery();
    if (!query) return false;
    try {
      this.gl.beginQuery(this.extension.TIME_ELAPSED_EXT, query);
      this.activeQuery = query;
      return true;
    } catch {
      this.gl.deleteQuery?.(query);
      this.activeQuery = null;
      this.supported = false;
      return false;
    }
  }

  endFrame() {
    if (!this.supported || !this.activeQuery) return false;
    try {
      this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
      this.pending.push(this.activeQuery);
      this.activeQuery = null;
      while (this.pending.length > this.maxPending) {
        const dropped = this.pending.shift();
        this.gl.deleteQuery?.(dropped);
        this.overflowDrops += 1;
      }
      return true;
    } catch {
      this.gl.deleteQuery?.(this.activeQuery);
      this.activeQuery = null;
      return false;
    }
  }

  poll() {
    if (!this.supported || !this.pending.length) return null;
    const query = this.pending[0];
    const available = Boolean(this.gl.getQueryParameter(query, this.gl.QUERY_RESULT_AVAILABLE));
    if (!available) return null;
    this.pending.shift();
    const disjoint = Boolean(this.gl.getParameter(this.extension.GPU_DISJOINT_EXT));
    const nanoseconds = disjoint ? 0 : Number(this.gl.getQueryParameter(query, this.gl.QUERY_RESULT));
    this.gl.deleteQuery?.(query);
    if (disjoint || !Number.isFinite(nanoseconds) || nanoseconds < 0) {
      this.disjointDrops += 1;
      return null;
    }
    this.lastGpuMs = nanoseconds / 1e6;
    this.samples += 1;
    return Object.freeze({ gpuMs: this.lastGpuMs, source: 'webgl2-disjoint-timer-query' });
  }

  dispose() {
    if (this.activeQuery) this.gl?.deleteQuery?.(this.activeQuery);
    for (const query of this.pending.splice(0)) this.gl?.deleteQuery?.(query);
    this.activeQuery = null;
  }

  get diagnostics() {
    return Object.freeze({
      id: GPU_FRAME_TIMER_V152.id,
      supported: this.supported,
      samples: this.samples,
      pending: this.pending.length,
      disjointDrops: this.disjointDrops,
      overflowDrops: this.overflowDrops,
      lastGpuMs: this.lastGpuMs
    });
  }
}
