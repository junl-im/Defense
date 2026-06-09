import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { WorldMapScene } from './scenes/WorldMapScene';
import { LabScene } from './scenes/LabScene';
import { GameScene } from './scenes/GameScene';
import { CodexScene } from './scenes/CodexScene';
import { installGlobalAudioUnlock } from './game/AudioManager';
import { installWebShell } from './platform/WebShell';
import './style.css';

installWebShell();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#101820',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540,
    fullscreenTarget: 'game'
  },
  input: {
    activePointers: 3
  },
  audio: {
    disableWebAudio: false
  },
  render: {
    pixelArt: true,
    antialias: false
  },
  scene: [BootScene, MenuScene, WorldMapScene, LabScene, CodexScene, GameScene]
};

const game = new Phaser.Game(config);
installGlobalAudioUnlock(game);
