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

let unlocked = false;
let muted = false;

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
  if (!keyExists(scene, key)) return;
  try {
    scene.sound.play(key, { volume: volume ?? SFX_VOLUME[key] ?? 0.35 });
  } catch (error) {
    console.warn(`SFX play failed: ${key}`, error);
  }
}

export function playMusic(scene: Phaser.Scene, key: string, volume = 0.18): void {
  if (muted || !unlocked) return;
  if (!keyExists(scene, key)) return;
  const existing = scene.sound.get(key);
  if (existing?.isPlaying) return;
  try {
    scene.sound.play(key, { volume, loop: true });
  } catch (error) {
    console.warn(`Music play failed: ${key}`, error);
  }
}

export function stopMusic(scene: Phaser.Scene, key: string): void {
  const existing = scene.sound.get(key);
  if (existing?.isPlaying) existing.stop();
}
