export class RenderStatsHUD {
  constructor(renderer, { storageKey = 'dokkaebi-render-stats' } = {}) {
    this.renderer = renderer;
    this.storageKey = storageKey;
    this.elapsed = 0;
    const queryEnabled = new URLSearchParams(window.location.search).get('stats') === '1';
    this.enabled = queryEnabled || localStorage.getItem(this.storageKey) === '1';
    this.element = document.createElement('aside');
    this.element.className = 'render-stats-hud';
    this.element.setAttribute('aria-live', 'polite');
    this.element.hidden = !this.enabled;
    document.body.append(this.element);
  }

  toggle(force) {
    this.enabled = typeof force === 'boolean' ? force : !this.enabled;
    this.element.hidden = !this.enabled;
    localStorage.setItem(this.storageKey, this.enabled ? '1' : '0');
    return this.enabled;
  }

  update(dt, diagnostics = {}) {
    if (!this.enabled) return;
    this.elapsed += dt;
    if (this.elapsed < 0.35) return;
    this.elapsed = 0;
    const info = this.renderer.info;
    const memory = info.memory || {};
    const render = info.render || {};
    const fps = diagnostics.fps || 0;
    const chunks = diagnostics.chunks || {};
    const pools = diagnostics.pools || {};
    const assets = diagnostics.assets || {};
    const performance = diagnostics.performance || {};
    const frameState = performance.p95FrameMs >= 40 ? 'critical' : performance.p95FrameMs >= 25 ? 'warning' : 'good';
    this.element.dataset.frameState = frameState;
    this.element.innerHTML = `
      <b>ENGINE ${diagnostics.engineVersion || ''}</b>
      <span>FPS <strong>${Math.round(fps)}</strong> · SCALE ${Math.round((diagnostics.qualityScale || 1) * 100)}%</span>
      <span>FRAME <strong>${performance.averageFrameMs || 0}ms</strong> · P95 <strong>${performance.p95FrameMs || 0}ms</strong> · P99 ${performance.p99FrameMs || 0}ms</span>
      <span>SMOOTH <strong>${performance.smoothnessScore ?? 100}</strong> · JITTER ${performance.frameJitterMs || 0}ms</span>
      <span>LONG <strong>${performance.longFramePercent || 0}%</strong> · SEVERE ${performance.severeFramePercent || 0}%</span>
      <span>CALLS <strong>${render.calls || 0}</strong> · TRI <strong>${Number(render.triangles || 0).toLocaleString()}</strong></span>
      <span>GEO ${memory.geometries || 0} · TEX ${memory.textures || 0}</span>
      <span>CHUNK ${chunks.active || 0}/${chunks.total || 0} · OBJ ${chunks.visibleObjects || 0}/${chunks.totalObjects || 0}</span>
      <span>SHOT ${pools.projectiles || 0}/${pools.projectileCapacity || 0} · COIN ${pools.coins || 0}/${pools.coinCapacity || 0}</span>
      <span>ASSET ${(assets.qualityTier || 'n/a').toUpperCase()} · TEX ${assets.textureMemoryMB || 0}/${assets.textureBudgetMB || 0}MB</span>`;
  }

  dispose() {
    this.element.remove();
  }
}
