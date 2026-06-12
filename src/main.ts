import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { WorldMapScene } from './scenes/WorldMapScene';
import { LabScene } from './scenes/LabScene';
import { GameScene } from './scenes/GameScene';
import { CodexScene } from './scenes/CodexScene';
import { MetaScene } from './scenes/MetaScene';
import { HeroHallScene } from './scenes/HeroHallScene';
import { MissionBoardScene } from './scenes/MissionBoardScene';
import { ArtifactForgeScene } from './scenes/ArtifactForgeScene';
import { installGlobalAudioUnlock } from './game/AudioManager';
import { installGlobalPremiumDomFeedback } from './game/PremiumMicroInteractions';
import { getRenderProfile, makeGameFpsConfig } from './game/QualityManager';
import { installWebShell } from './platform/WebShell';
import { installDeferredPwaRuntime } from './platform/PwaRuntime';
import { installMobileRuntimeEngine } from './game/MobileRuntimeEngine';
import { installRuntimeFrameGovernor } from './game/RuntimeFrameGovernor';
import './style.css';

installWebShell();
installDeferredPwaRuntime();
installGlobalPremiumDomFeedback();

const profile = getRenderProfile();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#101820',
  fps: makeGameFpsConfig(),
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540,
    fullscreenTarget: 'game',
  },
  input: {
    activePointers: 3,
  },
  audio: {
    disableWebAudio: false,
  },
  render: {
    pixelArt: false,
    antialias: profile.tier !== 'low',
    roundPixels: profile.tier === 'low',
    powerPreference: profile.tier === 'low' ? 'low-power' : 'high-performance',
  },
  scene: [BootScene, MenuScene, MainMenuScene, WorldMapScene, LabScene, CodexScene, MetaScene, HeroHallScene, MissionBoardScene, ArtifactForgeScene, GameScene],
};

const game = new Phaser.Game(config);
installMobileRuntimeEngine(game);
installRuntimeFrameGovernor(game);
installGlobalAudioUnlock(game);

const refreshScale = (): void => {
  // Mobile browsers often change the visual viewport after fullscreen/orientation requests.
  // Refreshing the ScaleManager keeps the 960x540 game coordinate system aligned with the
  // CSS-filled canvas and prevents tiny portrait letterboxing after returning from background.
  try {
    game.scale.refresh();
  } catch (error) {
    console.warn('Scale refresh skipped:', error);
  }
};

window.addEventListener('kingdom-seed:viewport-changed', refreshScale);
window.addEventListener('orientationchange', () => [0, 120, 320].forEach((delay) => window.setTimeout(refreshScale, delay)));
window.addEventListener('resize', () => window.setTimeout(refreshScale, 40));

window.addEventListener('kingdom-seed:quality-changed', () => {
  // Phaser resolution is fixed at boot. Reloading is the cleanest way to apply
  // the selected render tier without leaving stale WebGL state in mobile webviews.
  const url = new URL(window.location.href);
  url.searchParams.set('q', String(Date.now()));
  window.location.replace(url.toString());
});
