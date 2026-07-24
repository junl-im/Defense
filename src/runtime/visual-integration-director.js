export const VISUAL_INTEGRATION_VERSION = '1.0.2';

export default class VisualIntegrationDirector {
  constructor() {
    this.diagnostics = { mascotReady: false, titleBackgroundReady: false, atlasNodes: 0, languageGuard: false };
  }
  install() {
    const mascot = document.querySelector('.title-mascot-v17');
    if (mascot) {
      const mark = () => { this.diagnostics.mascotReady = mascot.complete && mascot.naturalWidth > 0; document.body.classList.toggle('title-mascot-ready', this.diagnostics.mascotReady); };
      mascot.addEventListener('load', mark, { once: true });
      mascot.addEventListener('error', () => document.body.classList.add('title-mascot-fallback'), { once: true });
      mark();
    }
    const probe = new Image();
    probe.onload = () => { this.diagnostics.titleBackgroundReady = true; document.body.classList.add('title-background-ready'); };
    probe.onerror = () => document.body.classList.add('title-background-fallback');
    probe.src = matchMedia('(max-width:720px),(orientation:portrait)').matches
      ? './src/assets/title-v17/title-bg-mobile-v17.webp?v=22.0.0'
      : './src/assets/title-v17/title-bg-desktop-v17.webp?v=22.0.0';
    this.diagnostics.atlasNodes = document.querySelectorAll('.atlas-sprite,[style*="runtime-atlas"]').length;
    this.diagnostics.languageGuard = Boolean(window.__DOKKAEBI_LANGUAGE_GUARD__);
    window.__DOKKAEBI_VISUAL_INTEGRATION__ = this.diagnostics;
    return this;
  }
}
