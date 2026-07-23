export const MOBILE_HUD_V21_VERSION = '21.0.0';

const visible = (element) => {
  if (!element || !element.isConnected) return false;
  const style = getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) <= 0.01) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 2 && rect.height > 2;
};

const overlaps = (a, b, gap = 4) => !(a.right + gap <= b.left || b.right + gap <= a.left || a.bottom + gap <= b.top || b.bottom + gap <= a.top);

export default class MobileHudDirectorV21 {
  constructor() {
    this.version = MOBILE_HUD_V21_VERSION;
    this.elapsed = 0;
    this.profile = 'desktop';
    this.overlaps = [];
    this.mitigations = 0;
    this.observer = null;
    this.report = Object.freeze({ version: this.version, profile: this.profile, overlapCount: 0, healthy: true });
  }

  install() {
    document.body.dataset.mobileHudVersion = this.version;
    this.observer = new MutationObserver(() => this.refresh());
    this.observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', () => this.refresh(), { passive: true });
    window.visualViewport?.addEventListener('resize', () => this.refresh(), { passive: true });
    this.refresh();
    window.__DOKKAEBI_MOBILE_HUD_V21__ = this;
    return this;
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed < 0.75) return this.report;
    this.elapsed = 0;
    return this.refresh();
  }

  refresh() {
    const width = Math.max(1, window.visualViewport?.width || window.innerWidth || 1);
    const height = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
    const phone = width <= 720;
    const narrow = width <= 420;
    const short = height <= 680;
    const landscape = width > height && height <= 560;
    this.profile = !phone ? 'desktop' : landscape ? 'phone-landscape' : narrow && short ? 'phone-ultra' : narrow ? 'phone-narrow' : 'phone';
    document.body.classList.toggle('mobile-hud-v21', phone);
    document.body.classList.toggle('mobile-hud-v21-narrow', narrow);
    document.body.classList.toggle('mobile-hud-v21-short', short);
    document.body.classList.toggle('mobile-hud-v21-landscape', landscape);
    document.body.dataset.mobileHudProfile = this.profile;

    const targets = [
      ['hud', document.getElementById('hud')],
      ['boss', document.getElementById('boss-health')],
      ['danger', document.getElementById('danger-hint')],
      ['joystick', document.getElementById('joystick-zone')],
      ['actions', document.getElementById('action-dock')],
      ['interact', document.getElementById('interact-btn')]
    ].filter(([, element]) => visible(element));
    const pairs = [];
    for (let i = 0; i < targets.length; i += 1) {
      for (let j = i + 1; j < targets.length; j += 1) {
        const [aName, a] = targets[i];
        const [bName, b] = targets[j];
        if (aName === 'hud' && bName === 'boss') continue;
        if (overlaps(a.getBoundingClientRect(), b.getBoundingClientRect())) pairs.push(`${aName}:${bName}`);
      }
    }
    this.overlaps = pairs;
    const emergency = phone && pairs.length > 0;
    document.body.classList.toggle('mobile-hud-v21-emergency', emergency);
    if (emergency) this.mitigations += 1;
    document.body.dataset.mobileHudOverlapCount = String(pairs.length);
    document.body.dataset.mobileHudOverlapPairs = pairs.join(',');
    this.report = Object.freeze({
      version: this.version,
      profile: this.profile,
      width,
      height,
      phone,
      narrow,
      short,
      landscape,
      overlapCount: pairs.length,
      overlapPairs: Object.freeze([...pairs]),
      mitigations: this.mitigations,
      healthy: pairs.length === 0
    });
    window.__DOKKAEBI_MOBILE_HUD_V21_REPORT__ = this.report;
    return this.report;
  }

  dispose() {
    this.observer?.disconnect();
    this.observer = null;
  }
}
