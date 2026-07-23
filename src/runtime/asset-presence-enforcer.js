import { atlasSpriteMarkup, getV15AtlasFrame, IP_ASSET_LIBRARY_V15 } from '../ip-asset-library-v15.js';

export const ASSET_PRESENCE_ENFORCER_VERSION = '21.0.0';

const ACTION_ASSETS = Object.freeze({
  'dash-btn': Object.freeze({ key: 'vfx-tornado', label: '질주 바람 효과' }),
  'skill-btn': Object.freeze({ key: 'vfx-moon-slash', label: '대장 기술 효과' }),
  'burst-btn': Object.freeze({ key: 'vfx-spirit-flame', label: '수호신 혼불 효과' }),
  'summon-btn': Object.freeze({ key: 'ui-spirit', label: '도깨비 소환 아이콘' }),
  'wave-btn': Object.freeze({ key: 'ui-play', label: '다음 습격 아이콘' }),
  'interact-btn': Object.freeze({ key: 'ui-confirm', label: '전장 상호작용 아이콘' })
});

const ESSENTIAL_SELECTORS = Object.freeze({
  titleMascot: '#title-screen .title-mascot',
  titleBackground: '#title-screen',
  heroPortrait: '#hero-hud-portrait .atlas-sprite',
  heroCards: '#hero-class-options .atlas-sprite',
  actionAssets: '#action-dock .action-asset-v21, #interact-btn .action-asset-v21'
});

const isVisible = (element) => {
  if (!element || !element.isConnected) return false;
  const style = getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) <= 0.01) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 2 && rect.height > 2;
};

const safeCategory = (element) => element?.dataset?.assetCategory || 'unclassified';

export default class AssetPresenceEnforcer {
  constructor({ version = ASSET_PRESENCE_ENFORCER_VERSION } = {}) {
    this.version = version;
    this.elapsed = 0;
    this.scans = 0;
    this.renderEvents = 0;
    this.runtime = { heroes: 0, monsters: 0, bosses: 0, projectiles: 0, hazards: 0, battlefieldSprites: 0 };
    this.report = Object.freeze({ version, healthy: false, warnings: ['not-installed'] });
    this.observer = null;
  }

  install() {
    document.documentElement.lang = 'ko-KR';
    document.body.dataset.assetPresenceV21 = '1';
    this.ensureActionAssets();
    this.observer = new MutationObserver((mutations) => {
      if (mutations.some((entry) => entry.addedNodes.length || entry.type === 'attributes')) this.ensureActionAssets();
    });
    this.observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
    this.scan();
    window.__DOKKAEBI_ASSET_PRESENCE__ = this;
    return this;
  }

  ensureActionAssets() {
    for (const [id, asset] of Object.entries(ACTION_ASSETS)) {
      const button = document.getElementById(id);
      if (!button || button.querySelector('.action-asset-v21')) continue;
      const markup = atlasSpriteMarkup(asset.key, asset.label, 'action-asset-v21');
      if (!markup) continue;
      button.insertAdjacentHTML('afterbegin', markup);
      button.dataset.assetKey = asset.key;
      button.dataset.assetPresence = 'connected';
    }
  }

  update(dt, runtime = {}) {
    this.elapsed += dt;
    if (runtime && typeof runtime === 'object') {
      for (const key of Object.keys(this.runtime)) {
        const value = Number(runtime[key]);
        if (Number.isFinite(value)) this.runtime[key] = Math.max(0, Math.round(value));
      }
    }
    if (this.elapsed < 0.65) return this.report;
    this.elapsed = 0;
    return this.scan();
  }

  noteRender(count = 1) {
    this.renderEvents += Math.max(0, Number(count) || 0);
  }

  scan() {
    this.ensureActionAssets();
    const atlasNodes = [...document.querySelectorAll('.atlas-sprite')];
    const visibleNodes = atlasNodes.filter(isVisible);
    const categories = {};
    for (const element of visibleNodes) {
      const category = safeCategory(element);
      categories[category] = (categories[category] || 0) + 1;
    }

    const titleMascot = document.querySelector(ESSENTIAL_SELECTORS.titleMascot);
    const titleScreen = document.querySelector(ESSENTIAL_SELECTORS.titleBackground);
    const titleBackground = titleScreen ? getComputedStyle(titleScreen).backgroundImage : '';
    const titlePreload = document.querySelector('link[rel="preload"][href*="title-bg"]');
    const titleBackgroundReady = Boolean((titleBackground && titleBackground !== 'none' && titleBackground.includes('title-bg')) || titlePreload);
    const titleMascotReady = Boolean(titleMascot && (titleMascot.complete === undefined || titleMascot.complete || titleMascot.currentSrc || titleMascot.getAttribute('src')));
    const heroPortraitReady = Boolean(document.querySelector(ESSENTIAL_SELECTORS.heroPortrait));
    const heroCardCount = document.querySelectorAll(ESSENTIAL_SELECTORS.heroCards).length;
    const actionAssetCount = document.querySelectorAll(ESSENTIAL_SELECTORS.actionAssets).length;
    const missing = [];
    if (!titleMascotReady) missing.push('title-mascot');
    if (!titleBackgroundReady) missing.push('title-background');
    if (this.runtime.heroes > 0 && !heroPortraitReady) missing.push('hero-hud-portrait');
    if (heroCardCount < 5) missing.push('hero-class-assets');
    if (actionAssetCount < Object.keys(ACTION_ASSETS).length) missing.push('action-assets');
    if ((this.runtime.monsters + this.runtime.bosses) > 0 && this.runtime.projectiles === 0 && this.runtime.hazards === 0) missing.push('combat-effects-idle');

    const warnings = [...missing];
    if (visibleNodes.length < 6) warnings.push('low-visible-atlas-count');
    const healthy = missing.length === 0;
    this.scans += 1;
    document.body.dataset.assetPresenceHealthy = healthy ? '1' : '0';
    document.body.dataset.assetPresenceWarnings = warnings.join(',');
    document.body.dataset.visibleAtlasCount = String(visibleNodes.length);

    this.report = Object.freeze({
      version: this.version,
      healthy,
      scans: this.scans,
      atlasFrames: IP_ASSET_LIBRARY_V15.totalFrames,
      domAtlasCount: atlasNodes.length,
      visibleAtlasCount: visibleNodes.length,
      heroCardCount,
      actionAssetCount,
      titleMascotVisible: Boolean(titleMascot && isVisible(titleMascot)),
      titleMascotReady,
      titleBackgroundReady,
      categories: Object.freeze({ ...categories }),
      runtime: Object.freeze({ ...this.runtime }),
      renderEvents: this.renderEvents,
      missing: Object.freeze([...missing]),
      warnings: Object.freeze([...warnings])
    });
    window.__DOKKAEBI_ASSET_PRESENCE_REPORT__ = this.report;
    return this.report;
  }

  getFrame(key) {
    return getV15AtlasFrame(key);
  }

  dispose() {
    this.observer?.disconnect();
    this.observer = null;
  }
}
