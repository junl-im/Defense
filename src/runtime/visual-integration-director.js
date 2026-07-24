export const VISUAL_INTEGRATION_VERSION = '1.1.2';

const TITLE_ASSETS_V112 = Object.freeze({
  desktop: './src/assets/title-v112/title-bg-desktop-v112.webp?rev=release-v112-b24-12',
  desktopLite: './src/assets/title-v112/title-bg-desktop-lite-v112.webp?rev=release-v112-b24-12',
  mobile: './src/assets/title-v112/title-bg-mobile-v112.webp?rev=release-v112-b24-12',
  mobileLite: './src/assets/title-v112/title-bg-mobile-lite-v112.webp?rev=release-v112-b24-12',
  mascot: './src/assets/title-v112/title-mascot-v112.webp?rev=release-v112-b24-12',
  mascotLite: './src/assets/title-v112/title-mascot-lite-v112.webp?rev=release-v112-b24-12'
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
    document.body.classList.toggle('title-art-lite-v112', profile.lite);
    document.body.dataset.titleArtTierV112 = profile.lite ? 'lite' : 'hq';

    const mascotUrl = profile.lite ? TITLE_ASSETS_V112.mascotLite : TITLE_ASSETS_V112.mascot;
    for (const source of document.querySelectorAll('source[srcset*="title-mascot-v112"]')) source.srcset = mascotUrl;
    for (const image of document.querySelectorAll('img[src*="title-mascot-v112"], .title-mascot-v112')) {
      if (profile.lite) image.src = mascotUrl;
    }

    const mascot = document.querySelector('.title-mascot-v112');
    if (mascot) {
      const mark = () => {
        this.diagnostics.mascotReady = mascot.complete && mascot.naturalWidth > 0;
        document.body.classList.toggle('title-mascot-ready', this.diagnostics.mascotReady);
      };
      mascot.addEventListener('load', mark, { once: true });
      mascot.addEventListener('error', () => document.body.classList.add('title-mascot-fallback'), { once: true });
      mark();
    }

    const backgroundUrl = profile.mobile
      ? (profile.lite ? TITLE_ASSETS_V112.mobileLite : TITLE_ASSETS_V112.mobile)
      : (profile.lite ? TITLE_ASSETS_V112.desktopLite : TITLE_ASSETS_V112.desktop);
    const probe = new Image();
    probe.onload = () => {
      this.diagnostics.titleBackgroundReady = true;
      document.body.classList.add('title-background-ready');
    };
    probe.onerror = () => document.body.classList.add('title-background-fallback');
    probe.src = backgroundUrl;

    this.diagnostics.titleTier = `${profile.mobile ? 'mobile' : 'desktop'}-${profile.lite ? 'lite' : 'hq'}`;
    this.diagnostics.lowPowerTitleArt = profile.lite;
    this.diagnostics.device = profile;
    this.diagnostics.atlasNodes = document.querySelectorAll('.atlas-sprite,[style*="runtime-atlas"]').length;
    this.diagnostics.languageGuard = Boolean(window.__DOKKAEBI_LANGUAGE_GUARD__);
    window.__DOKKAEBI_VISUAL_INTEGRATION__ = this.diagnostics;
    return this;
  }
}
