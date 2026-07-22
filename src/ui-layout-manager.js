const DEFAULT_MODE = 'auto';
const MODES = Object.freeze(['auto', 'full', 'minimal']);

const isVisible = (element) => {
  if (!element || element.classList.contains('hidden')) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0;
};

const overlaps = (a, b, gap = 3) => (
  a.left < b.right - gap && a.right > b.left + gap &&
  a.top < b.bottom - gap && a.bottom > b.top + gap
);

export class AdaptiveHudLayout {
  constructor({ body = document.body, elements = {}, storageKey = 'dokkaebi-hud-density-v1' } = {}) {
    this.body = body;
    this.elements = elements;
    this.storageKey = storageKey;
    this.mode = this.loadMode();
    this.profile = 'standard';
    this.overlapPairs = [];
    this.rails = {};
    this.refreshQueued = false;
    this.observer = null;
  }

  loadMode() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return MODES.includes(stored) ? stored : DEFAULT_MODE;
    } catch {
      return DEFAULT_MODE;
    }
  }

  saveMode() {
    try { localStorage.setItem(this.storageKey, this.mode); } catch {}
  }

  mount() {
    if (this.body.dataset.hudLayoutMounted === '1') return;
    const { hud, joystick } = this.elements;
    if (!hud || !joystick?.parentElement) return;

    const makeRail = (id, className, children) => {
      const rail = document.createElement('section');
      rail.id = id;
      rail.className = className;
      rail.setAttribute('aria-label', className.includes('top') ? '전투 상황 정보' : '전투 보조 정보');
      joystick.parentElement.insertBefore(rail, joystick);
      children.filter(Boolean).forEach((child) => rail.appendChild(child));
      this.rails[id] = rail;
      return rail;
    };

    makeRail('top-status-rail', 'top-status-rail combat-ui-rail', [
      this.elements.runSeed,
      this.elements.moonOmen,
      this.elements.moonWard
    ]);
    makeRail('center-meter-rail', 'center-meter-rail combat-ui-rail', [
      this.elements.luckMeter,
      this.elements.burstMeter
    ]);
    makeRail('left-insight-rail', 'left-insight-rail combat-ui-rail', [
      this.elements.waveTrial,
      this.elements.synergyPanel,
      this.elements.firstMission
    ]);
    makeRail('right-roster-rail', 'right-roster-rail combat-ui-rail', [
      this.elements.killChain,
      this.elements.relicPanel,
      this.elements.unitStrip
    ]);

    this.body.dataset.hudLayoutMounted = '1';
    this.body.dataset.hudDensityMode = this.mode;

    this.observer = new MutationObserver(() => this.scheduleRefresh());
    this.observer.observe(this.body, { attributes: true, attributeFilter: ['class'] });
    const watched = [
      this.elements.runSeed, this.elements.moonOmen, this.elements.moonWard,
      this.elements.luckMeter, this.elements.burstMeter, this.elements.waveTrial,
      this.elements.synergyPanel, this.elements.firstMission, this.elements.killChain,
      this.elements.relicPanel, this.elements.unitStrip, this.elements.bossHealth,
      this.elements.joystick, this.elements.actionDock
    ].filter(Boolean);
    watched.forEach((element) => this.observer.observe(element, {
      attributes: true,
      attributeFilter: ['class', 'aria-hidden']
    }));
    this.refresh();
  }

  dispose() {
    this.observer?.disconnect();
    this.observer = null;
  }

  setMode(mode) {
    this.mode = MODES.includes(mode) ? mode : DEFAULT_MODE;
    this.saveMode();
    this.refresh();
    return this.mode;
  }

  cycleMode() {
    const index = MODES.indexOf(this.mode);
    return this.setMode(MODES[(index + 1) % MODES.length]);
  }

  getModeLabel() {
    return ({ auto: '자동', full: '전체', minimal: '간소' })[this.mode] || '자동';
  }

  scheduleRefresh() {
    if (this.refreshQueued) return;
    this.refreshQueued = true;
    requestAnimationFrame(() => {
      this.refreshQueued = false;
      this.refresh();
    });
  }

  refresh({ width, height } = {}) {
    const viewportWidth = Math.max(1, width || window.visualViewport?.width || window.innerWidth || 1);
    const viewportHeight = Math.max(1, height || window.visualViewport?.height || window.innerHeight || 1);
    const portrait = viewportHeight >= viewportWidth;
    const phone = viewportWidth <= 540;
    const narrow = viewportWidth <= 390;
    const short = viewportHeight <= 640;
    const landscapePhone = !portrait && viewportHeight <= 560;

    this.profile = landscapePhone ? 'landscape-phone' : narrow && short ? 'micro' : phone ? 'phone' : viewportWidth <= 920 ? 'tablet' : 'standard';
    this.body.dataset.hudProfile = this.profile;
    this.body.dataset.hudDensityMode = this.mode;
    this.body.classList.toggle('ui-phone', phone);
    this.body.classList.toggle('ui-phone-narrow', narrow);
    this.body.classList.toggle('ui-phone-short', short);
    this.body.classList.toggle('ui-landscape-phone', landscapePhone);

    const automaticMinimal = this.mode === 'auto' && (narrow || short || landscapePhone || this.body.classList.contains('boss-active'));
    this.body.classList.toggle('hud-density-full', this.mode === 'full');
    this.body.classList.toggle('hud-density-minimal', this.mode === 'minimal' || automaticMinimal);
    this.body.style.setProperty('--ui-viewport-width', `${viewportWidth}px`);
    this.body.style.setProperty('--ui-viewport-height', `${viewportHeight}px`);

    this.auditCollisions();
    return this.getReport();
  }

  auditCollisions() {
    const candidates = [
      ['hud', this.elements.hud],
      ['top', this.rails['top-status-rail']],
      ['meters', this.rails['center-meter-rail']],
      ['boss', this.elements.bossHealth],
      ['left', this.rails['left-insight-rail']],
      ['right', this.rails['right-roster-rail']],
      ['joystick', this.elements.joystick],
      ['actions', this.elements.actionDock]
    ].filter(([, element]) => isVisible(element));

    const ignored = new Set(['hud:top', 'top:meters']);
    const pairs = [];
    for (let i = 0; i < candidates.length; i += 1) {
      for (let j = i + 1; j < candidates.length; j += 1) {
        const [nameA, elementA] = candidates[i];
        const [nameB, elementB] = candidates[j];
        const key = `${nameA}:${nameB}`;
        const reverse = `${nameB}:${nameA}`;
        if (ignored.has(key) || ignored.has(reverse)) continue;
        const rectA = elementA.getBoundingClientRect();
        const rectB = elementB.getBoundingClientRect();
        if (rectA.width && rectA.height && rectB.width && rectB.height && overlaps(rectA, rectB)) pairs.push(`${nameA}:${nameB}`);
      }
    }

    this.overlapPairs = pairs;
    this.body.dataset.uiOverlapCount = String(pairs.length);
    this.body.dataset.uiOverlapPairs = pairs.join(',');
    this.body.classList.toggle('ui-overflow-safe', pairs.length > 0 && this.mode !== 'full');
    return pairs;
  }

  getReport() {
    return Object.freeze({
      profile: this.profile,
      mode: this.mode,
      modeLabel: this.getModeLabel(),
      overlapCount: this.overlapPairs.length,
      overlapPairs: [...this.overlapPairs]
    });
  }
}

export default AdaptiveHudLayout;
