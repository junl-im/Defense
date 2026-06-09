import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { WorldMapScene } from './scenes/WorldMapScene';
import { LabScene } from './scenes/LabScene';
import { GameScene } from './scenes/GameScene';
import { CodexScene } from './scenes/CodexScene';
import { MetaScene } from './scenes/MetaScene';
import { installGlobalAudioUnlock } from './game/AudioManager';
import { getRenderProfile, makeGameFpsConfig } from './game/QualityManager';
import { installWebShell } from './platform/WebShell';
import './style.css';

installWebShell();

const profile = getRenderProfile();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#101820',
  resolution: profile.resolution,
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
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    powerPreference: profile.tier === 'low' ? 'low-power' : 'high-performance',
  },
  scene: [BootScene, MenuScene, WorldMapScene, LabScene, CodexScene, MetaScene, GameScene],
};

const game = new Phaser.Game(config);
installGlobalAudioUnlock(game);

window.addEventListener('kingdom-seed:quality-changed', () => {
  // Phaser resolution is fixed at boot. Reloading is the cleanest way to apply
  // the selected render tier without leaving stale WebGL state in mobile webviews.
  const url = new URL(window.location.href);
  url.searchParams.set('q', String(Date.now()));
  window.location.replace(url.toString());
});
