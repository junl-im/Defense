const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function detectPresentationProfile() {
  const memory = Number(navigator.deviceMemory || 4);
  const cores = Number(navigator.hardwareConcurrency || 4);
  const saveData = Boolean(navigator.connection?.saveData);
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  const lowEnd = saveData || memory <= 4 || cores <= 4;
  return Object.freeze({ memory, cores, saveData, mobile, lowEnd });
}

export default class FirstPresentationDirectorV107 {
  constructor({
    root = document.documentElement,
    titleRoot,
    canvas,
    schedule,
    cancel,
    waitForFrames,
    applyFallback,
    updateLoading
  } = {}) {
    this.root = root;
    this.titleRoot = titleRoot;
    this.canvas = canvas;
    this.schedule = schedule || ((callback, delay) => window.setTimeout(callback, delay));
    this.cancel = cancel || ((token) => window.clearTimeout(token));
    this.waitForFrames = waitForFrames || (async () => true);
    this.applyFallback = applyFallback || (async () => false);
    this.updateLoading = updateLoading || (() => undefined);
    this.profile = detectPresentationProfile();
    this.pendingTimers = new Set();
    this.contextLost = false;
    this.disposed = false;
    this.report = Object.freeze({
      status: 'idle',
      profile: this.profile,
      imagesReady: false,
      fontsReady: false,
      stableFrames: false,
      fallbackApplied: false,
      durationMs: 0
    });
    this.onContextLost = (event) => {
      event.preventDefault?.();
      this.contextLost = true;
      this.updateGate('그래픽 장치를 다시 연결하는 중...', '화면을 숨긴 상태로 안전하게 복구합니다.', 'recovering');
    };
    this.onContextRestored = () => {
      this.contextLost = false;
      this.updateGate('그래픽 장치 복구 완료', '첫 장면을 다시 확인하고 있습니다.', 'recovering');
    };
    this.canvas?.addEventListener('webglcontextlost', this.onContextLost, { passive: false });
    this.canvas?.addEventListener('webglcontextrestored', this.onContextRestored);
  }

  updateGate(status, detail = '', mode = 'preparing') {
    if (this.disposed) return;
    this.root.dataset.presentationMode = mode;
    window.__DOKKAEBI_UPDATE_BOOT_GATE__?.({ status, detail, mode });
    this.updateLoading(status, detail);
  }

  withTimeout(task, timeoutMs, fallback = false) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        if (timer) {
          this.cancel(timer);
          this.pendingTimers.delete(timer);
        }
        resolve(value);
      };
      const timer = this.schedule(() => finish(fallback), timeoutMs);
      this.pendingTimers.add(timer);
      Promise.resolve(task).then(() => finish(true), () => finish(false));
    });
  }

  decodeImage(image) {
    if (!image) return Promise.resolve();
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    if (typeof image.decode === 'function') return image.decode();
    return new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', reject, { once: true });
    });
  }

  collectImageTasks() {
    const tasks = [...(this.titleRoot?.querySelectorAll?.('img') || [])].map((image) => this.decodeImage(image));
    const backgroundLink = [...document.querySelectorAll('link[rel="preload"][as="image"][media]')]
      .find((link) => !link.media || window.matchMedia(link.media).matches);
    if (backgroundLink?.href) {
      const image = new Image();
      image.decoding = 'async';
      image.src = backgroundLink.href;
      tasks.push(this.decodeImage(image));
    }
    return tasks;
  }

  async prepare() {
    if (this.disposed) throw new Error('첫 화면 준비기가 이미 해제되었습니다.');
    const startedAt = performance.now();
    const imageBudget = this.profile.lowEnd ? 5600 : 4200;
    const fontBudget = this.profile.lowEnd ? 2800 : 2100;
    const frameBudget = this.profile.lowEnd ? 4600 : 3400;

    this.updateGate('타이틀 아트를 준비하는 중...', '배경과 수호자 아트를 먼저 완성합니다.', 'assets');
    const imageTasks = this.collectImageTasks();
    const [imagesReady, fontsReady] = await Promise.all([
      this.withTimeout(Promise.allSettled(imageTasks), imageBudget, false),
      this.withTimeout(document.fonts?.ready || Promise.resolve(), fontBudget, false)
    ]);

    this.updateGate('첫 장면을 렌더링하는 중...', 'GPU가 완성된 프레임을 만들 때까지 화면을 보호합니다.', 'rendering');
    let stableFrames = await this.withTimeout(
      this.waitForFrames(this.profile.lowEnd ? 3 : 2, frameBudget),
      frameBudget + 250,
      false
    );
    let fallbackApplied = false;

    if (!stableFrames || this.contextLost) {
      this.updateGate('안전 그래픽으로 전환하는 중...', '그림자와 해상도를 안정 단계로 조정합니다.', 'recovering');
      fallbackApplied = Boolean(await this.applyFallback({
        reason: this.contextLost ? 'context-lost' : 'frame-timeout',
        profile: this.profile
      }));
      stableFrames = await this.withTimeout(this.waitForFrames(2, 3800), 4100, false);
    }

    const durationMs = Math.round(performance.now() - startedAt);
    const frameFallback = !stableFrames || this.contextLost;
    const degraded = fallbackApplied || frameFallback || !imagesReady || !fontsReady;
    this.root.dataset.presentationGate = stableFrames ? 'ready' : 'released-safe';
    this.root.dataset.presentationQuality = degraded ? 'safe' : 'full';

    this.report = Object.freeze({
      status: 'ready',
      profile: this.profile,
      imagesReady,
      fontsReady,
      stableFrames,
      fallbackApplied,
      failOpen: frameFallback,
      degraded,
      durationMs: clamp(durationMs, 0, 60000)
    });

    this.updateGate(
      frameFallback ? '안전 모드로 시작합니다' : fallbackApplied ? '안전 그래픽 준비 완료' : '달빛 장터 준비 완료',
      frameFallback
        ? 'GPU 확인이 늦어도 접속을 막지 않고 타이틀 화면을 먼저 엽니다.'
        : fallbackApplied ? '안정화된 품질로 수호를 시작합니다.' : '완성된 첫 장면을 열고 있습니다.',
      degraded ? 'safe' : 'ready'
    );
    return this.report;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const timer of this.pendingTimers) this.cancel(timer);
    this.pendingTimers.clear();
    this.canvas?.removeEventListener('webglcontextlost', this.onContextLost);
    this.canvas?.removeEventListener('webglcontextrestored', this.onContextRestored);
  }
}
