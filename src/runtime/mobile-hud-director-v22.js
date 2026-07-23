export const MOBILE_HUD_V22_VERSION = '22.0.0';
const visible = (element) => {
  if (!element?.isConnected) return false;
  const style = getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) <= .01) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 2 && rect.height > 2;
};
const overlaps = (a, b, gap = 6) => !(a.right + gap <= b.left || b.right + gap <= a.left || a.bottom + gap <= b.top || b.bottom + gap <= a.top);

export default class MobileHudDirectorV22 {
  constructor() { this.version = MOBILE_HUD_V22_VERSION; this.elapsed = 0; this.mitigations = 0; this.report = {}; }
  install() {
    document.body.dataset.mobileHudVersion = this.version;
    window.addEventListener('resize', () => this.refresh(), { passive: true });
    window.visualViewport?.addEventListener('resize', () => this.refresh(), { passive: true });
    this.refresh();
    window.__DOKKAEBI_MOBILE_HUD_V22__ = this;
    return this;
  }
  update(dt) { this.elapsed += dt; if (this.elapsed < .6) return this.report; this.elapsed = 0; return this.refresh(); }
  refresh() {
    const width = Math.max(1, window.visualViewport?.width || innerWidth || 1);
    const height = Math.max(1, window.visualViewport?.height || innerHeight || 1);
    const phone = width <= 760;
    const narrow = width <= 430;
    const landscape = phone && width > height;
    document.body.classList.toggle('mobile-hud-v22', phone);
    document.body.classList.toggle('mobile-hud-v22-narrow', narrow);
    document.body.classList.toggle('mobile-hud-v22-landscape', landscape);
    document.body.classList.remove('mobile-hud-v21', 'mobile-hud-v21-narrow', 'mobile-hud-v21-short', 'mobile-hud-v21-landscape', 'mobile-hud-v21-emergency');
    const targets = [['hud','hud'],['boss','boss-health'],['danger','danger-hint'],['joystick','joystick-zone'],['actions','action-dock'],['interact','interact-btn'],['zoom','camera-zoom-controls']]
      .map(([name,id]) => [name, document.getElementById(id)]).filter(([,el]) => visible(el));
    const pairs = [];
    for (let i=0;i<targets.length;i+=1) for (let j=i+1;j<targets.length;j+=1) {
      const [an,a]=targets[i], [bn,b]=targets[j];
      if ((an==='hud'&&bn==='boss') || (an==='actions'&&bn==='zoom')) continue;
      if (overlaps(a.getBoundingClientRect(), b.getBoundingClientRect())) pairs.push(`${an}:${bn}`);
    }
    const emergency = phone && pairs.length > 0;
    document.body.classList.toggle('mobile-hud-v22-emergency', emergency);
    if (emergency) this.mitigations += 1;
    this.report = Object.freeze({ version:this.version, width, height, phone, narrow, landscape, overlapCount:pairs.length, overlapPairs:Object.freeze(pairs), mitigations:this.mitigations, healthy:pairs.length===0 });
    window.__DOKKAEBI_MOBILE_HUD_V22_REPORT__ = this.report;
    return this.report;
  }
}
