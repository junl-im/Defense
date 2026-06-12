import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { installGlobalAudioUnlock } from '../game/AudioManager';
import { installGlobalPremiumDomFeedback } from '../game/PremiumMicroInteractions';
import { getRenderProfile, makeGameFpsConfig } from '../game/QualityManager';
import { installDeferredPwaRuntime } from '../platform/PwaRuntime';
import { installMobileRuntimeEngine } from '../game/MobileRuntimeEngine';
import { installRuntimeFrameGovernor } from '../game/RuntimeFrameGovernor';
import { installRuntimeLoadGovernor, markUserCriticalInput } from '../game/RuntimeLoadGovernor';

let gameInstance: Phaser.Game | undefined;
let installedWindowHooks = false;

function dispatchEngineStatus(stage: string, detail: Record<string, unknown> = {}): void {
  window.dispatchEvent(
    new CustomEvent('kingdom-seed:engine-status', {
      detail: { stage, at: Date.now(), ...detail },
    }),
  );
}

function installWindowScaleHooks(game: Phaser.Game): void {
  if (installedWindowHooks) return;
  installedWindowHooks = true;

  let pendingScaleRefresh = 0;
  const refreshScale = (): void => {
    // 모바일 브라우저 주소창/회전 이벤트는 짧은 시간에 여러 번 몰려온다.
    // 한 프레임 안에서 ScaleManager가 반복 계산하지 않도록 합친다.
    if (pendingScaleRefresh) return;
    pendingScaleRefresh = window.setTimeout(() => {
      pendingScaleRefresh = 0;
      try {
        game.scale.refresh();
      } catch (error) {
        console.warn('Scale refresh skipped:', error);
      }
    }, 80);
  };

  window.addEventListener('kingdom-seed:viewport-changed', refreshScale);
  window.addEventListener('orientationchange', () =>
    [0, 180, 420].forEach((delay) => window.setTimeout(refreshScale, delay)),
  );
  window.addEventListener('resize', refreshScale);

  window.addEventListener('kingdom-seed:quality-changed', () => {
    // Phaser 해상도는 부팅 시점에 고정된다. 렌더 티어 변경은 깨끗한 재시작이 가장 안전하다.
    const url = new URL(window.location.href);
    url.searchParams.set('q', String(Date.now()));
    window.location.replace(url.toString());
  });
}

export function bootstrapKingdomSeedGame(reason = 'deferred-entry'): Phaser.Game {
  if (gameInstance) return gameInstance;

  dispatchEngineStatus('phaser-configuring', { reason });

  installRuntimeLoadGovernor();
  installDeferredPwaRuntime();
  installGlobalPremiumDomFeedback();

  // v2.35.5: 유저 탭으로 엔진 로드가 시작된 경우 RuntimeLoadGovernor가
  // 이미 지나간 user-activated 이벤트를 놓칠 수 있으므로, 초기 몇 초는 선택 작업을 멈춰 둔다.
  if (document.documentElement.classList.contains('ks-user-activated')) {
    markUserCriticalInput('deferred-engine-after-activation', 3600);
  }

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
      activePointers: profile.tier === 'low' ? 2 : 3,
    },
    audio: {
      disableWebAudio: false,
    },
    render: {
      pixelArt: false,
      antialias: profile.tier !== 'low',
      roundPixels: profile.tier === 'low',
      powerPreference: profile.tier === 'low' ? 'low-power' : 'high-performance',
      antialiasGL: profile.tier !== 'low',
      desynchronized: profile.tier === 'low',
      batchSize: profile.tier === 'low' ? 1024 : 4096,
      maxTextures: profile.tier === 'low' ? 8 : 16,
      mipmapRegeneration: false,
    },
    scene: [BootScene],
  };

  dispatchEngineStatus('phaser-creating', { tier: profile.tier });
  gameInstance = new Phaser.Game(config);
  installMobileRuntimeEngine(gameInstance);
  installRuntimeFrameGovernor(gameInstance);
  installGlobalAudioUnlock(gameInstance);
  installWindowScaleHooks(gameInstance);
  dispatchEngineStatus('phaser-created', { tier: profile.tier });
  return gameInstance;
}
