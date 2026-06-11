import Phaser from 'phaser';

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

function ensureAudio(scene: Phaser.Scene, key: string, onReady?: () => void): boolean {
  if (keyExists(scene, key)) return true;
  const file = AUDIO_FILE_BY_KEY[key];
  if (!file || pendingAudioLoads.has(key)) return false;
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
  if (!keyExists(scene, key) && !ensureAudio(scene, key, () => playSfx(scene, key, volume))) return;
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

export function stopMusic(scene: Phaser.Scene, key: string): void {
  const existing = scene.sound.get(key);
  if (existing?.isPlaying) existing.stop();
  if (currentMusicKey === key) currentMusicKey = undefined;
}
