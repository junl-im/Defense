import Phaser from 'phaser';
import { getMobileRuntimeCaps } from './MobileRuntimeEngine';
import { noteOptionalWorkBlocked, optionalRuntimeWorkAllowed } from './RuntimeLoadGovernor';

const SFX_VOLUME: Record<string, number> = {
  sfx_click: 0.35,
  sfx_build: 0.5,
  sfx_upgrade: 0.55,
  sfx_shoot: 0.3,
  sfx_hit: 0.28,
  sfx_magic: 0.34,
  sfx_explosion: 0.46,
  sfx_wave: 0.5,
  sfx_win: 0.55,
  sfx_lose: 0.5,
};

const MUSIC_VOLUME: Record<string, number> = {
  bgm_world: 0.22,
  bgm_battle: 0.18,
  bgm_boss: 0.24,
  bgm_battle_old: 0.18,
};

const MUSIC_KEYS = ['bgm_world', 'bgm_battle', 'bgm_boss', 'bgm_battle_old'];

let unlocked = false;
let muted = false;
let currentMusicKey: string | undefined;
const lastSfxAt: Record<string, number> = {};

const AUDIO_FILE_BY_KEY: Record<string, string> = {
  sfx_click: 'click.wav',
  sfx_build: 'build.wav',
  sfx_upgrade: 'upgrade.wav',
  sfx_shoot: 'shoot.wav',
  sfx_hit: 'hit.wav',
  sfx_magic: 'magic.wav',
  sfx_explosion: 'explosion.wav',
  sfx_wave: 'wave.wav',
  sfx_win: 'win.wav',
  sfx_lose: 'lose.wav',
  bgm_world: 'bgm_world.wav',
  bgm_battle: 'bgm_battle.wav',
  bgm_boss: 'bgm_boss.wav',
  bgm_battle_old: 'music_loop.wav',
};

const pendingAudioLoads = new Set<string>();
const AUDIO_QUERY = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

function fullAudioEnabled(): boolean {
  return AUDIO_QUERY.has('audiofull') || AUDIO_QUERY.has('fullaudio');
}

function shouldSkipLazyAudio(key: string): boolean {
  const caps = getMobileRuntimeCaps();
  if (fullAudioEnabled()) return false;
  if (key === 'sfx_click') return false;
  const constrained = caps.label === 'SAFE_MOBILE_ENGINE' || caps.label === 'LOCKDOWN_MOBILE_ENGINE' || caps.networkClass === 'slow' || caps.networkClass === 'metered' || caps.saveData;
  if (!constrained) return false;
  if (key.startsWith('bgm_')) return true;
  return key === 'sfx_shoot' || key === 'sfx_hit' || key === 'sfx_magic' || key === 'sfx_explosion' || key === 'sfx_wave';
}

function ensureAudio(scene: Phaser.Scene, key: string, onReady?: () => void): boolean {
  if (keyExists(scene, key)) return true;
  if (shouldSkipLazyAudio(key)) return false;
  const file = AUDIO_FILE_BY_KEY[key];
  if (!file || pendingAudioLoads.has(key)) return false;
  if (!optionalRuntimeWorkAllowed('audio', { scene, allowDuringBoot: key === 'sfx_click' })) {
    noteOptionalWorkBlocked('audio', key);
    return false;
  }
  pendingAudioLoads.add(key);
  scene.load.audio(key, [`assets/audio/${file}`]);
  scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
    pendingAudioLoads.delete(key);
    if (keyExists(scene, key)) onReady?.();
  });
  if (!scene.load.isLoading()) scene.load.start();
  return false;
}

function keyExists(scene: Phaser.Scene, key: string): boolean {
  try {
    return scene.cache.audio.exists(key);
  } catch {
    return false;
  }
}

export function unlockAudio(scene?: Phaser.Scene): void {
  unlocked = true;
  if (!scene) return;
  try {
    const manager = scene.sound as Phaser.Sound.BaseSoundManager & { unlock?: () => void };
    manager.unlock?.();
  } catch {
    // Some Phaser sound managers do not expose unlock.
  }
}

export function installGlobalAudioUnlock(game: Phaser.Game): void {
  const unlock = () => {
    unlocked = true;
    const scene = game.scene.getScenes(true)[0];
    if (scene) unlockAudio(scene);
  };
  window.addEventListener('kingdom-seed:user-activated', unlock, { once: true });
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('touchend', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

export function playSfx(scene: Phaser.Scene, key: string, volume?: number): void {
  if (muted || !unlocked) return;
  const caps = getMobileRuntimeCaps();
  if (caps.label === 'SAFE_MOBILE_ENGINE' || caps.label === 'LOCKDOWN_MOBILE_ENGINE') {
    const now = Date.now();
    const minGap = caps.label === 'LOCKDOWN_MOBILE_ENGINE' ? (key === 'sfx_shoot' || key === 'sfx_hit' ? 180 : 80) : key === 'sfx_shoot' || key === 'sfx_hit' ? 95 : 34;
    if (now - (lastSfxAt[key] ?? 0) < minGap) return;
    lastSfxAt[key] = now;
  }
  const highRate = key === 'sfx_shoot' || key === 'sfx_hit';
  if (!keyExists(scene, key)) {
    if (highRate && (caps.label === 'SAFE_MOBILE_ENGINE' || caps.label === 'LOCKDOWN_MOBILE_ENGINE')) return;
    if (!ensureAudio(scene, key, () => playSfx(scene, key, volume))) return;
  }
  try {
    scene.sound.play(key, { volume: volume ?? SFX_VOLUME[key] ?? 0.35 });
  } catch (error) {
    console.warn(`SFX play failed: ${key}`, error);
  }
}

export function stopAllMusic(scene: Phaser.Scene): void {
  MUSIC_KEYS.forEach((key) => {
    const existing = scene.sound.get(key);
    if (existing?.isPlaying) existing.stop();
  });
  currentMusicKey = undefined;
}

export function playMusic(scene: Phaser.Scene, key: string, volume = MUSIC_VOLUME[key] ?? 0.18): void {
  if (muted || !unlocked) return;
  const caps = getMobileRuntimeCaps();
  if (caps.label === 'LOCKDOWN_MOBILE_ENGINE') volume = Math.min(volume, 0.10);
  else if (caps.networkClass === 'slow' || caps.networkClass === 'metered') volume = Math.min(volume, 0.14);
  if (!keyExists(scene, key) && !ensureAudio(scene, key, () => playMusic(scene, key, volume))) return;

  const existing = scene.sound.get(key);
  if (currentMusicKey === key && existing?.isPlaying) return;

  MUSIC_KEYS.forEach((musicKey) => {
    if (musicKey === key) return;
    const other = scene.sound.get(musicKey);
    if (other?.isPlaying) other.stop();
  });

  try {
    if (existing?.isPlaying) existing.stop();
    scene.sound.play(key, { volume, loop: true });
    currentMusicKey = key;
  } catch (error) {
    console.warn(`Music play failed: ${key}`, error);
  }
}


export function playMusicWhenReady(scene: Phaser.Scene, key: string, volume = MUSIC_VOLUME[key] ?? 0.18): void {
  playMusic(scene, key, volume);
  const handler = (): void => playMusic(scene, key, volume);
  window.addEventListener('kingdom-seed:user-activated', handler, { once: true });

  const cleanup = (): void => window.removeEventListener('kingdom-seed:user-activated', handler);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
}

export function stopMusic(scene: Phaser.Scene, key: string): void {
  const existing = scene.sound.get(key);
  if (existing?.isPlaying) existing.stop();
  if (currentMusicKey === key) currentMusicKey = undefined;
}
