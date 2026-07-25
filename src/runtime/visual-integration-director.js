export const VISUAL_INTEGRATION_VERSION = '1.1.5';

const TITLE_ASSETS_V112 = Object.freeze({
  desktop: './src/assets/title-v112/title-bg-desktop-v112.webp?rev=release-v123-b24-23',
  desktopLite: './src/assets/title-v112/title-bg-desktop-lite-v112.webp?rev=release-v123-b24-23',
  mobile: './src/assets/title-v112/title-bg-mobile-v112.webp?rev=release-v123-b24-23',
  mobileLite: './src/assets/title-v112/title-bg-mobile-lite-v112.webp?rev=release-v123-b24-23',
  mascot: './src/assets/title-v112/title-mascot-v112.webp?rev=release-v123-b24-23',
  mascotLite: './src/assets/title-v112/title-mascot-lite-v112.webp?rev=release-v123-b24-23'
});

function titleProfile() {
  const mobile = Boolean(window.matchMedia?.('(max-width:720px), (orientation:portrait)')?.matches);
  const cores = Number(navigator.hardwareConcurrency || 4);
  const memory = Number(navigator.deviceMemory || 4);
  const saveData = Boolean(navigator.connection?.saveData);
  const lite = saveData || memory <= 4 || cores <= 4;
  return Object.freeze({ mobile, lite, cores, memory, saveData });
}

export default class VisualIntegrationDirector {
  constructor() {
    this.diagnostics = {
      version: VISUAL_INTEGRATION_VERSION,
      mascotReady: false,
      titleBackgroundReady: false,
      titleTier: 'pending',
      atlasNodes: 0,
      languageGuard: false
    };
  }

  install() {
    const profile = titleProfile();
    // Every device starts with the compact pair. High-end devices upgrade after
    // the game-ready event, keeping the first paint fast and preventing broken
    // image alternative text from appearing on the title screen.
    document.body.classList.add('title-art-lite-v112');
    document.body.dataset.titleArtTierV112 = 'lite-boot';

    for (const source of document.querySelectorAll('source[srcset*="title-mascot"]')) source.srcset = TITLE_ASSETS_V112.mascotLite;
    for (const image of document.querySelectorAll('.title-mascot-v112')) {
      image.alt = '';
      image.src = TITLE_ASSETS_V112.mascotLite;
    }

    const mascot = document.querySelector('.title-mascot-v112');
    const markMascot = () => {
      this.diagnostics.mascotReady = Boolean(mascot?.complete && mascot?.naturalWidth > 0);
      document.body.classList.toggle('title-mascot-ready', this.diagnostics.mascotReady);
    };
    if (mascot) {
      mascot.addEventListener('load', markMascot);
      mascot.addEventListener('error', () => {
        mascot.hidden = true;
        document.body.classList.add('title-mascot-fallback');
      }, { once: true });
      markMascot();
    }

    const initialBackground = profile.mobile ? TITLE_ASSETS_V112.mobileLite : TITLE_ASSETS_V112.desktopLite;
    const initialProbe = new Image();
    initialProbe.onload = () => {
      this.diagnostics.titleBackgroundReady = true;
      document.body.classList.add('title-background-ready');
    };
    initialProbe.onerror = () => document.body.classList.add('title-background-fallback');
    initialProbe.src = initialBackground;

    const upgrade = () => {
      if (profile.lite) return;
      const hqBackground = profile.mobile ? TITLE_ASSETS_V112.mobile : TITLE_ASSETS_V112.desktop;
      const mascotProbe = new Image();
      const backgroundProbe = new Image();
      mascotProbe.decoding = 'async';
      backgroundProbe.decoding = 'async';
      Promise.all([
        new Promise((resolve) => { mascotProbe.onload = () => resolve(true); mascotProbe.onerror = () => resolve(false); mascotProbe.src = TITLE_ASSETS_V112.mascot; }),
        new Promise((resolve) => { backgroundProbe.onload = () => resolve(true); backgroundProbe.onerror = () => resolve(false); backgroundProbe.src = hqBackground; })
      ]).then(([mascotReady, backgroundReady]) => {
        if (mascotReady && mascot) {
          mascot.hidden = false;
          mascot.src = TITLE_ASSETS_V112.mascot;
          for (const source of document.querySelectorAll('source[srcset*="title-mascot"]')) source.srcset = TITLE_ASSETS_V112.mascot;
        }
        if (backgroundReady) document.body.classList.remove('title-art-lite-v112');
        this.diagnostics.titleTier = `${profile.mobile ? 'mobile' : 'desktop'}-${backgroundReady ? 'hq' : 'lite'}`;
        this.diagnostics.hqUpgradeReady = Boolean(mascotReady && backgroundReady);
        document.body.dataset.titleArtTierV112 = this.diagnostics.titleTier;
      });
    };
    window.addEventListener('dokkaebi:boot-ready', () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(upgrade, { timeout: 1600 });
      else window.setTimeout(upgrade, 450);
    }, { once: true });

    this.diagnostics.titleTier = `${profile.mobile ? 'mobile' : 'desktop'}-lite-boot`;
    this.diagnostics.lowPowerTitleArt = profile.lite;
    this.diagnostics.device = profile;
    this.diagnostics.atlasNodes = document.querySelectorAll('.atlas-sprite,[style*="runtime-atlas"]').length;
    this.diagnostics.languageGuard = Boolean(window.__DOKKAEBI_LANGUAGE_GUARD__);
    window.__DOKKAEBI_VISUAL_INTEGRATION__ = this.diagnostics;
    return this;
  }
}
